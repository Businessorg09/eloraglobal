import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { withdrawalId, transactionReference } = await request.json()

    if (!withdrawalId || !transactionReference) {
      return NextResponse.json({ error: 'Withdrawal ID and Transaction Reference are required.' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const adminDb = createAdminClient()
    const { data: adminUser } = await adminDb.from('users').select('role').eq('id', user.id).single()
    if (adminUser?.role !== 'ADMIN') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 1. Fetch withdrawal
    const { data: withdrawal, error: wError } = await adminDb
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .eq('status', 'PENDING')
      .single()

    if (wError || !withdrawal) {
      return NextResponse.json({ error: 'Pending withdrawal not found.' }, { status: 404 })
    }

    // 2. Mark as completed
    const { error: updateError } = await adminDb
      .from('withdrawals')
      .update({
        status: 'COMPLETED',
        transaction_reference: transactionReference,
        processed_at: new Date().toISOString()
      })
      .eq('id', withdrawalId)

    if (updateError) throw new Error('Failed to update withdrawal status.')

    // 3. Update the pending ledger account
    // Reduce WITHDRAWAL-PENDING by net payable, indicating it has been paid out of the bank.
    // Note: The actual cash leaves the corporate bank account, but in our ledger, we just reduce the pending liability.
    const { data: journal } = await adminDb.from('ledger_journals').insert({
      idempotency_key: `withdrawal_payout_${withdrawal.id}`,
      reference_type: 'WITHDRAWAL',
      reference_id: withdrawal.id,
      description: `Withdrawal Paid Out (UTR: ${transactionReference})`
    }).select().single()

    if (journal) {
      const { data: accs } = await adminDb.from('ledger_accounts').select('id, code').eq('code', '2011-WITHDRAWAL-PENDING')
      if (accs && accs.length > 0) {
        const pendingAccId = accs[0].id
        await adminDb.from('ledger_journal_postings').insert([
          { journal_id: journal.id, account_id: pendingAccId, debit_paise: withdrawal.net_payable_paise, credit_paise: 0 }
        ])
        await adminDb.rpc('increment_ledger_balance', { acc_id: pendingAccId, amount: -withdrawal.net_payable_paise })
      }
    }

    return NextResponse.json({ message: 'Withdrawal approved and marked as completed.' })
  } catch (error: any) {
    console.error('Approve Withdrawal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
