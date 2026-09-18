import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET() {
  try {
    const adminDb = createAdminClient()

    const { data: wallets } = await adminDb.from('wallets').select('*')
    const negWallets = wallets?.filter(w => w.total_balance_paise < 0) || []
    
    const results = []

    for (const w of negWallets) {
      const { data: withdrawals } = await adminDb.from('withdrawals').select('*').eq('user_id', w.user_id)
      const { data: transactions } = await adminDb.from('transactions').select('*').eq('user_id', w.user_id)
      const { data: topups } = await adminDb.from('wallet_topups').select('*').eq('user_id', w.user_id)

      results.push({
        wallet: w,
        withdrawals,
        transactions,
        topups
      })
    }

    return NextResponse.json({ success: true, count: negWallets.length, results })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
