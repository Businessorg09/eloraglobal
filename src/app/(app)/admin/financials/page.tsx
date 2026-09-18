import { createAdminClient } from '@/lib/supabase/admin'
import FinancialClientWrapper from './FinancialClientWrapper'

export const dynamic = 'force-dynamic'

export default async function FinancialsPage() {
  const adminDb = createAdminClient()
  
  // 1. Gross BV (rough estimate of sales)
  const { data: nodes } = await adminDb
    .from('binary_nodes')
    .select('left_bv, right_bv')
    
  let totalBv = 0;
  if (nodes) {
    nodes.forEach(n => totalBv += (n.left_bv + n.right_bv));
  }
  const grossSales = totalBv * 1; // Assuming 1 BV = 1 INR

  // 2. Binary Commissions Disbursed
  const { data: commissions } = await adminDb
    .from('commissions')
    .select('commission_amount')
  
  let totalCommissions = 0;
  if (commissions) {
    commissions.forEach(c => totalCommissions += c.commission_amount);
  }

  // 3. TDS Remitted (5% of Gross Commissions)
  const tdsRemitted = totalCommissions > 0 ? (totalCommissions / 0.90) * 0.05 : 0;
  const adminFee = totalCommissions > 0 ? (totalCommissions / 0.90) * 0.05 : 0;

  // 4. Ledger Data (List of recent MLM commissions & bonuses)
  const { data: ledger } = await adminDb
    .from('transactions')
    .select(`
      id, created_at, amount_paise, transaction_type, description,
      user:users ( full_name, username )
    `)
    .in('transaction_type', ['BINARY_INCOME', 'MATCHING_MILESTONE_BONUS', 'RANK_BONUS'])
    .order('created_at', { ascending: false })
    .limit(100)
  // 5. Pending Trading Payout Requests
  const { data: pendingRequests } = await adminDb
    .from('transactions')
    .select(`
      id, created_at, amount_paise, description,
      user:users ( id, full_name, username )
    `)
    .eq('transaction_type', 'TRADING_PAYOUT_PENDING')
    .order('created_at', { ascending: true })

  // 6. Pending Wallet Top-ups
  const { data: pendingTopups } = await adminDb
    .from('wallet_topups')
    .select('*, user:users(id, username, full_name)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })

  // 7. Pending Withdrawals
  const { data: pendingWithdrawals } = await adminDb
    .from('withdrawals')
    .select('*, user:users(id, username, full_name)')
    .eq('status', 'PENDING')
    .order('created_at', { ascending: true })

  // 8. Pending Package Activations
  const { data: allPackages, error: pkgErr } = await adminDb
    .from('package_purchases')
    .select('*, users!package_purchases_user_id_fkey(id, username, full_name), packages!package_purchases_package_id_fkey(name)')
    .order('created_at', { ascending: true })

  if (pkgErr) console.error('Admin Financials Packages Error:', pkgErr)

  const pendingPackages = (allPackages || []).map(p => {
    let meta = { status: 'APPROVED', transaction_reference: '', payment_method: 'Bank Transfer' };
    try { if (p.payment_gateway_id) meta = JSON.parse(p.payment_gateway_id); } catch(e){}
    return { ...p, ...meta };
  }).filter(p => p.status === 'PENDING');

  return <FinancialClientWrapper 
    grossSales={grossSales} 
    totalCommissions={totalCommissions} 
    tdsRemitted={tdsRemitted}
    adminFee={adminFee}
    ledger={ledger || []} 
    pendingRequests={pendingRequests || []}
    pendingTopups={pendingTopups || []}
    pendingWithdrawals={pendingWithdrawals || []}
    pendingPackages={pendingPackages || []}
  />
}
