import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    const { data: withdrawals, error } = await adminDb
      .from('withdrawals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch withdrawals.' }, { status: 500 })
    }

    return NextResponse.json({
      withdrawals: (withdrawals || []).map((w: any) => ({
        id: w.id,
        amount: w.amount_paise / 100,
        bankAccountNumber: w.bank_account_number,
        bankIfsc: w.bank_ifsc,
        bankHolderName: w.bank_holder_name,
        bankName: w.bank_name,
        status: w.status,
        rejectionReason: w.rejection_reason,
        processedAt: w.processed_at,
        createdAt: w.created_at,
      }))
    })
  } catch (error: any) {
    console.error('Withdrawal History Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
