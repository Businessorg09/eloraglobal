import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const adminDb = createAdminClient()

    // 1. Authenticate user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
    }

    // 2. Fetch wallet balances
    const { data: wallet, error: walletError } = await adminDb
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return NextResponse.json({ error: 'Wallet not found.' }, { status: 404 })
    }

    // 3. Fetch recent transaction history
    const { data: transactions, error: txError } = await adminDb
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (txError) {
      console.error('Error fetching transactions:', txError)
    }

    // 4. Fetch Approved Topups
    const { data: topups } = await adminDb
      .from('wallet_topups')
      .select('amount_paise')
      .eq('user_id', user.id)
      .eq('status', 'APPROVED')

    const manualTopups = (topups || []).reduce((sum, t) => sum + t.amount_paise, 0)

    // 5. Calculate total spent from topups (e.g. package purchases)
    const { data: purchases } = await adminDb
      .from('transactions')
      .select('amount_paise')
      .eq('user_id', user.id)
      .eq('transaction_type', 'PACKAGE_PURCHASE')

    const topupUsed = Math.abs((purchases || []).reduce((sum, t) => sum + t.amount_paise, 0))

    return NextResponse.json({
      balances: {
        binaryIncome: Number(wallet.binary_income_paise || 0) / 100,
        tradingIncome: Number(wallet.trading_income_paise || 0) / 100,
        sponsorIncome: Number(wallet.sponsor_income_paise || 0) / 100,
        leadershipIncome: Number(wallet.leadership_income_paise || 0) / 100,
        rankBonus: Number(wallet.rank_bonus_paise || 0) / 100,
        milestoneBonus: Number(wallet.milestone_bonus_paise || 0) / 100,
        totalWithdrawn: Number(wallet.total_withdrawn_paise || 0) / 100,
        totalBalance: Number(wallet.total_balance_paise || 0) / 100,
        depositBalance: (manualTopups - topupUsed) / 100,
        totalEarned: (Number(wallet.binary_income_paise || 0) + Number(wallet.trading_income_paise || 0) + Number(wallet.sponsor_income_paise || 0) + Number(wallet.leadership_income_paise || 0) + Number(wallet.rank_bonus_paise || 0) + Number(wallet.milestone_bonus_paise || 0)) / 100,
      },
      transactions: (transactions || []).map((tx: any) => ({
        id: tx.id,
        type: tx.transaction_type,
        amount: Number(tx.amount_paise) / 100,
        description: tx.description,
        createdAt: tx.created_at,
      })),
    })
  } catch (error: any) {
    console.error('Wallet API Error:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
