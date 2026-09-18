import { createAdminClient } from '@/lib/supabase/admin';
import FinancialsClient from './FinancialsClient';

export const dynamic = 'force-dynamic';

export default async function TradingFinancialsPage() {
  const adminDb = createAdminClient();
  
  // 1. Pending Trading Payout Requests
  const { data: pendingRequests } = await adminDb
    .from('transactions')
    .select(`
      id, created_at, amount_paise, description,
      user:users ( id, full_name, username, referral_code )
    `)
    .eq('transaction_type', 'TRADING_PAYOUT_PENDING')
    .order('created_at', { ascending: true });

  // 2. Approved Trading Payouts (for Trading Ledger)
  const { data: tradingLedger } = await adminDb
    .from('transactions')
    .select(`
      id, created_at, amount_paise, description,
      user:users ( id, full_name, username )
    `)
    .eq('transaction_type', 'TRADING_INCOME')
    .order('created_at', { ascending: false })
    .limit(100);

  // 3. Sponsor Income Ledger
  const { data: sponsorLedger } = await adminDb
    .from('sponsor_income_history')
    .select(`
      id, created_at, level, amount_paise,
      receiver:users!sponsor_income_history_user_id_fkey ( id, full_name, username ),
      trader:users!sponsor_income_history_from_user_id_fkey ( id, full_name, username )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // 4. Leadership Income Ledger
  const { data: leadershipLedger } = await adminDb
    .from('leadership_income_history')
    .select(`
      id, created_at, amount_paise,
      receiver:users!leadership_income_history_user_id_fkey ( id, full_name, username ),
      trader:users!leadership_income_history_from_user_id_fkey ( id, full_name, username )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // 5. Exchange Ledger (New)
  const { data: exchangeLedger } = await adminDb
    .from('payout_exchange_ledger')
    .select(`
      id, created_at, gross_usd, trader_share_usd, company_share_usd,
      network_allocation_usd, exchange_rate, network_allocation_inr,
      trader:users!payout_exchange_ledger_trader_user_id_fkey ( id, full_name, username )
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  // 6. Calculate Summary KPIs
  // This is a simplified calculation; in production, you might want to aggregate via SQL views
  let totalDistributedInr = 0;
  let totalTradingProfitUsd = 0;
  let companyRetainedUsd = 0;
  
  // Let's grab some global sums from wallets to simulate total distributed
  const { data: wallets } = await adminDb
    .from('wallets')
    .select('trading_income_cents, company_retained_cents, sponsor_income_paise, leadership_income_paise');
    
  if (wallets) {
    wallets.forEach(w => {
      totalTradingProfitUsd += (parseInt(w.trading_income_cents || '0') / 100);
      companyRetainedUsd += (parseInt(w.company_retained_cents || '0') / 100);
      totalDistributedInr += (w.sponsor_income_paise + w.leadership_income_paise) / 100;
    });
  }

  return (
    <FinancialsClient 
      pendingRequests={pendingRequests || []}
      tradingLedger={tradingLedger || []}
      sponsorLedger={sponsorLedger || []}
      leadershipLedger={leadershipLedger || []}
      exchangeLedger={exchangeLedger || []}
      kpis={{
        totalTradingProfitUsd,
        totalDistributedInr,
        companyRetainedUsd,
      }}
    />
  );
}
