import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // Verify admin
    const { data: adminProfile } = await adminDb
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (adminProfile?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admins only.' }, { status: 403 })
    }

    const { withdrawalId, reason } = await request.json()
    if (!withdrawalId || !reason) {
      return NextResponse.json({ error: 'Withdrawal ID and rejection reason are required.' }, { status: 400 })
    }

    // Fetch the withdrawal
    const { data: withdrawal, error: fetchError } = await adminDb
      .from('withdrawals')
      .select('*')
      .eq('id', withdrawalId)
      .single()

    if (fetchError || !withdrawal) {
      return NextResponse.json({ error: 'Withdrawal not found.' }, { status: 404 })
    }

    if (withdrawal.status !== 'PENDING') {
      return NextResponse.json({ error: `Cannot reject a ${withdrawal.status} withdrawal.` }, { status: 400 })
    }

    // Mark as FAILED
    const { error: updateError } = await adminDb
      .from('withdrawals')
      .update({
        status: 'FAILED',
        rejection_reason: reason,
        processed_by: user.id,
        processed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', withdrawalId)

    if (updateError) {
      return NextResponse.json({ error: 'Failed to reject withdrawal.' }, { status: 500 })
    }

    // Reverse the wallet deduction — refund the amount back
    const { data: wallet } = await adminDb
      .from('wallets')
      .select('total_withdrawn_paise')
      .eq('user_id', withdrawal.user_id)
      .single()

    if (wallet) {
      await adminDb
        .from('wallets')
        .update({
          total_withdrawn_paise: Math.max(0, (wallet.total_withdrawn_paise || 0) - withdrawal.amount_paise),
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', withdrawal.user_id)
    }

    // Log refund transaction
    await adminDb.from('transactions').insert({
      user_id: withdrawal.user_id,
      transaction_type: 'WITHDRAWAL',
      amount_paise: withdrawal.amount_paise,
      description: `Withdrawal rejected & refunded: ${reason}`,
      reference_id: withdrawalId,
    })

    return NextResponse.json({
      message: `Withdrawal rejected. ₹${(withdrawal.amount_paise / 100).toFixed(2)} has been refunded to user wallet.`,
      withdrawalId,
    })
  } catch (error: any) {
    console.error('Reject Withdrawal Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
