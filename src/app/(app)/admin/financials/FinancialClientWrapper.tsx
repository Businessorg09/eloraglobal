'use client';

import { useState, useEffect } from 'react';

export default function FinancialClientWrapper({ 
  grossSales, 
  totalCommissions, 
  tdsRemitted,
  adminFee,
  ledger,
  pendingRequests,
  pendingTopups = [],
  pendingWithdrawals = [],
  pendingPackages = []
}: { 
  grossSales: number;
  totalCommissions: number;
  tdsRemitted: number;
  adminFee: number;
  ledger: any[];
  pendingRequests: any[];
  pendingTopups?: any[];
  pendingWithdrawals?: any[];
  pendingPackages?: any[];
}) {
  const [activeTab, setActiveTab] = useState('packages');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  const [localPackages, setLocalPackages] = useState(pendingPackages);
  const [localTopups, setLocalTopups] = useState(pendingTopups);

  useEffect(() => setLocalPackages(pendingPackages), [pendingPackages]);
  useEffect(() => setLocalTopups(pendingTopups), [pendingTopups]);
  const formatInr = (val: number) => val.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  const formatUsd = (val: number) => val.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // --- TRADING PAYOUT ACTIONS ---
  const handleApproveTrading = async (id: string) => {
    if (!confirm('Approve this trading payout and distribute to MLM?')) return;
    setLoadingAction(id);
    try {
      const { approveTradingPayoutAction } = await import('./actions');
      await approveTradingPayoutAction(id);
      alert('Approved successfully.');
    } catch (e: any) { alert(e.message); }
    setLoadingAction(null);
  };
  const handleRejectTrading = async (id: string) => {
    if (!confirm('Reject this trading payout request?')) return;
    setLoadingAction(id);
    try {
      const { rejectTradingPayoutAction } = await import('./actions');
      await rejectTradingPayoutAction(id);
      alert('Rejected successfully.');
    } catch (e: any) { alert(e.message); }
    setLoadingAction(null);
  };

  // --- TOPUP ACTIONS ---
  const handleApproveTopup = async (id: string) => {
    if (!confirm('Approve this wallet top-up? User will receive the balance.')) return;
    setLocalTopups(prev => prev.filter(p => p.id !== id));
    
    try {
      const { approveTopupAction } = await import('./actions');
      await approveTopupAction(id);
    } catch (e: any) { alert(e.message); }
  };
  const handleRejectTopup = async (id: string) => {
    if (!confirm('Reject this wallet top-up?')) return;
    setLocalTopups(prev => prev.filter(p => p.id !== id));
    
    try {
      const { rejectTopupAction } = await import('./actions');
      await rejectTopupAction(id);
    } catch (e: any) { alert(e.message); }
  };

  // --- WITHDRAWAL ACTIONS ---
  const handleApproveWithdrawal = async (id: string) => {
    if (!confirm('Mark this withdrawal as completed? Ensure you have sent the funds via bank.')) return;
    setLoadingAction(id);
    try {
      const res = await fetch('/api/admin/withdrawals/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Withdrawal Approved!');
      window.location.reload();
    } catch (e: any) { alert(e.message); }
    setLoadingAction(null);
  };
  const handleRejectWithdrawal = async (id: string) => {
    if (!confirm('Reject this withdrawal and refund balance to user?')) return;
    setLoadingAction(id);
    try {
      const res = await fetch('/api/admin/withdrawals/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ withdrawalId: id })
      });
      if (!res.ok) throw new Error(await res.text());
      alert('Withdrawal Rejected & Refunded.');
      window.location.reload();
    } catch (e: any) { alert(e.message); }
    setLoadingAction(null);
  };

  // --- PACKAGE ACTIONS ---
  const handleApprovePackage = async (id: string) => {
    if (!confirm('Approve this package activation UTR?')) return;
    setLoadingAction(id);
    
    try {
      const res = await fetch('/api/admin/purchases/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ purchaseId: id })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      
      // Only remove if it actually succeeds
      setLocalPackages(prev => prev.filter(p => p.id !== id));
      alert('Package activated successfully!');
    } catch (e: any) { 
      alert(e.message); 
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="flex flex-col w-full gap-gutter-lg pb-margin-page">
      
      {/* Top Level Telemetry */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-gutter-md bg-surface-container-lowest p-gutter-lg rounded-xl shadow-sm">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-0.5 rounded">Fiscal Audit Vault</span>
            <span className="text-outline text-label-sm font-label-sm">|</span>
            <span className="font-label-sm text-label-sm text-outline font-medium">Compliance Standard: Sec 194H</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Financial Ledger & Approval Hub</h1>
        </div>
      </div>

      {/* Master Financial Telemetry Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
        
        <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Gross BV Revenue</span>
            <span className="material-symbols-outlined text-[18px] text-primary">payments</span>
          </div>
          <div className="my-3">
            <div className="font-metric-display text-metric-display text-on-surface leading-tight tracking-tight">₹{formatInr(grossSales)}</div>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '88%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Binary Commissions</span>
            <span className="material-symbols-outlined text-[18px] text-tertiary">hub</span>
          </div>
          <div className="my-3">
            <div className="font-metric-display text-metric-display text-on-surface leading-tight tracking-tight">₹{formatInr(totalCommissions)}</div>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Statutory TDS Remitted</span>
            <span className="material-symbols-outlined text-[18px] text-error">account_balance</span>
          </div>
          <div className="my-3">
            <div className="font-metric-display text-metric-display text-on-surface leading-tight tracking-tight">₹{formatInr(tdsRemitted)}</div>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
            <div className="bg-error h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Admin Maintenance Pool</span>
            <span className="material-symbols-outlined text-[18px] text-outline">admin_panel_settings</span>
          </div>
          <div className="my-3">
            <div className="font-metric-display text-metric-display text-on-surface leading-tight tracking-tight">₹{formatInr(adminFee)}</div>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
            <div className="bg-on-surface-variant h-full rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

      </div>

      {/* Multi-Tab Ledger Explorer System */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm flex flex-col overflow-hidden">
        
        {/* Tab Navigation Strip */}
        <div className="flex items-center overflow-x-auto bg-surface-container-low px-gutter-md pt-gutter-sm gap-2 whitespace-nowrap scrollbar-hide">
          <button 
            onClick={() => setActiveTab('packages')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-label-md text-label-md transition-colors ${activeTab === 'packages' ? 'bg-surface-container-lowest text-primary font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.02)]' : 'text-outline hover:text-on-surface font-semibold'}`}
          >
            <span className="material-symbols-outlined text-[18px]">assignment_turned_in</span>
            <span>Package Approvals {localPackages.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-error text-white text-[10px]">{localPackages.length}</span>}</span>
          </button>
          <button 
            onClick={() => setActiveTab('topups')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-label-md text-label-md transition-colors ${activeTab === 'topups' ? 'bg-surface-container-lowest text-primary font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.02)]' : 'text-outline hover:text-on-surface font-semibold'}`}
          >
            <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
            <span>Wallet Top-ups {localTopups.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-error text-white text-[10px]">{localTopups.length}</span>}</span>
          </button>
          <button 
            onClick={() => setActiveTab('withdrawals')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-label-md text-label-md transition-colors ${activeTab === 'withdrawals' ? 'bg-surface-container-lowest text-primary font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.02)]' : 'text-outline hover:text-on-surface font-semibold'}`}
          >
            <span className="material-symbols-outlined text-[18px]">payments</span>
            <span>Withdrawals {pendingWithdrawals.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-error text-white text-[10px]">{pendingWithdrawals.length}</span>}</span>
          </button>
          <button 
            onClick={() => setActiveTab('trading')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-label-md text-label-md transition-colors ${activeTab === 'trading' ? 'bg-surface-container-lowest text-primary font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.02)]' : 'text-outline hover:text-on-surface font-semibold'}`}
          >
            <span className="material-symbols-outlined text-[18px]">monitoring</span>
            <span>Trading Payouts {pendingRequests.length > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full bg-error text-white text-[10px]">{pendingRequests.length}</span>}</span>
          </button>
          <button 
            onClick={() => setActiveTab('binary')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-lg font-label-md text-label-md transition-colors ${activeTab === 'binary' ? 'bg-surface-container-lowest text-primary font-bold shadow-[0_-2px_4px_rgba(0,0,0,0.02)]' : 'text-outline hover:text-on-surface font-semibold'}`}
          >
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
            <span>MLM Ledger</span>
          </button>
        </div>

        {/* Active Table Content Wrapper */}
        <div className="p-gutter-md overflow-x-auto">
          
          {/* PACKAGE ACTIVATIONS TAB */}
          {activeTab === 'packages' && (
            <table className="w-full text-left text-on-surface">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">User</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Package</th>
                  <th className="py-3 px-4">Amount Paid</th>
                  <th className="py-3 px-4">Method & UTR</th>
                  <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                {localPackages.map(p => (
                  <tr key={p.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">@{p.users?.username} <br/><span className="text-on-surface-variant font-normal text-xs">{p.users?.full_name}</span></td>
                    <td className="py-3 px-4 text-outline text-xs">{new Date(p.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 font-semibold">{(p.packages as any)?.name}</td>
                    <td className="py-3 px-4 text-tertiary font-bold">₹{(p.amount_paid_paise / 100).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <span className="font-bold">{p.payment_method || 'Bank Transfer'}</span><br/>
                      {p.transaction_reference}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button disabled={loadingAction === p.id} onClick={() => handleApprovePackage(p.id)} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-semibold text-label-sm hover:opacity-90 disabled:opacity-50">Approve UTR</button>
                    </td>
                  </tr>
                ))}
                {localPackages.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-outline">No pending package activations.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* WALLET TOP-UPS TAB */}
          {activeTab === 'topups' && (
            <table className="w-full text-left text-on-surface">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">User</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Requested Top-up</th>
                  <th className="py-3 px-4">UTR Ref</th>
                  <th className="py-3 px-4 rounded-r-lg text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                {localTopups.map(t => (
                  <tr key={t.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">@{t.user?.username}</td>
                    <td className="py-3 px-4 text-outline text-xs">{new Date(t.created_at).toLocaleString()}</td>
                    <td className="py-3 px-4 text-tertiary font-bold">₹{(t.amount_paise / 100).toLocaleString()}</td>
                    <td className="py-3 px-4 font-mono text-xs">{t.transaction_reference}</td>
                    <td className="py-3 px-4 flex items-center justify-center gap-2">
                      <button disabled={loadingAction === t.id} onClick={() => handleApproveTopup(t.id)} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-semibold text-label-sm hover:opacity-90 disabled:opacity-50">Approve</button>
                      <button disabled={loadingAction === t.id} onClick={() => handleRejectTopup(t.id)} className="bg-error text-on-error px-3 py-1.5 rounded-lg font-semibold text-label-sm hover:opacity-90 disabled:opacity-50">Reject</button>
                    </td>
                  </tr>
                ))}
                {localTopups.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-outline">No pending wallet top-ups.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* WITHDRAWALS TAB */}
          {activeTab === 'withdrawals' && (
            <table className="w-full text-left text-on-surface">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">User</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Bank Details</th>
                  <th className="py-3 px-4 text-right">Requested</th>
                  <th className="py-3 px-4 text-right">Admin Fee (5%)</th>
                  <th className="py-3 px-4 text-right">TDS (5%)</th>
                  <th className="py-3 px-4 text-right">Net Payable</th>
                  <th className="py-3 px-4 rounded-r-lg text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                {pendingWithdrawals.map(w => {
                  const reqInr = w.amount_requested_paise / 100;
                  const adminFee = reqInr * 0.05;
                  const tdsFee = reqInr * 0.05;
                  const netInr = reqInr - adminFee - tdsFee;
                  
                  return (
                    <tr key={w.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-bold text-primary">@{w.user?.username}</td>
                      <td className="py-3 px-4 text-outline text-xs">{new Date(w.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 text-xs font-mono max-w-[200px] truncate">{w.bank_account_details}</td>
                      <td className="py-3 px-4 text-right font-bold text-tertiary">₹{reqInr.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-error">-₹{adminFee.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right text-error">-₹{tdsFee.toLocaleString()}</td>
                      <td className="py-3 px-4 text-right font-bold">₹{netInr.toLocaleString()}</td>
                      <td className="py-3 px-4 flex items-center justify-center gap-2">
                        <button disabled={loadingAction === w.id} onClick={() => handleApproveWithdrawal(w.id)} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-semibold text-label-sm hover:opacity-90 disabled:opacity-50">Approve</button>
                        <button disabled={loadingAction === w.id} onClick={() => handleRejectWithdrawal(w.id)} className="bg-error text-on-error px-3 py-1.5 rounded-lg font-semibold text-label-sm hover:opacity-90 disabled:opacity-50">Reject</button>
                      </td>
                    </tr>
                  )
                })}
                {pendingWithdrawals.length === 0 && (
                  <tr><td colSpan={8} className="py-8 text-center text-outline">No pending withdrawals.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* TRADING PAYOUTS TAB */}
          {activeTab === 'trading' && (
            <table className="w-full text-left text-on-surface">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Date</th>
                  <th className="py-3 px-4">Trader Name</th>
                  <th className="py-3 px-4 text-right">Requested Profit (USD)</th>
                  <th className="py-3 px-4 text-right">To Trader (70% INR)</th>
                  <th className="py-3 px-4 text-right">To Sponsor/Leadership (INR)</th>
                  <th className="py-3 px-4 rounded-r-lg text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                {pendingRequests.map((req: any) => {
                  let payload: any = { usdCents: req.amount_paise, exchangeRate: 95.00 };
                  try { payload = JSON.parse(req.description); } catch(e){}
                  const usdAmount = (payload.usdCents || req.amount_paise) / 100;
                  const inrTotal = usdAmount * (payload.exchangeRate || 95.00);
                  const traderShare = inrTotal * 0.70;
                  const mlmShare = inrTotal * 0.20;

                  return (
                    <tr key={req.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono text-outline">{new Date(req.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 font-bold">@{req.user?.username}</td>
                      <td className="py-3 px-4 text-right font-mono text-tertiary font-bold">{formatUsd(usdAmount)}</td>
                      <td className="py-3 px-4 text-right font-mono">₹{formatInr(traderShare)}</td>
                      <td className="py-3 px-4 text-right font-mono">₹{formatInr(mlmShare)}</td>
                      <td className="py-3 px-4 flex items-center justify-center gap-2">
                        <button disabled={loadingAction === req.id} onClick={() => handleApproveTrading(req.id)} className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-semibold text-label-sm hover:opacity-90 disabled:opacity-50">Approve</button>
                        <button disabled={loadingAction === req.id} onClick={() => handleRejectTrading(req.id)} className="bg-error text-on-error px-3 py-1.5 rounded-lg font-semibold text-label-sm hover:opacity-90 disabled:opacity-50">Reject</button>
                      </td>
                    </tr>
                  )
                })}
                {pendingRequests.length === 0 && (
                  <tr><td colSpan={6} className="py-8 text-center text-outline">No pending trading payout requests.</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* BINARY MLM LEDGER TAB */}
          {activeTab === 'binary' && (
            <table className="w-full text-left text-on-surface">
              <thead>
                <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="py-3 px-4 rounded-l-lg">Date</th>
                  <th className="py-3 px-4">UID</th>
                  <th className="py-3 px-4">Distributor</th>
                  <th className="py-3 px-4">Payout Type</th>
                  <th className="py-3 px-4">Details</th>
                  <th className="py-3 px-4 text-right">Gross Amount</th>
                  <th className="py-3 px-4 text-right">5% TDS</th>
                  <th className="py-3 px-4 text-right">5% Admin</th>
                  <th className="py-3 px-4 text-right font-bold">Net Disbursed</th>
                  <th className="py-3 px-4 rounded-r-lg text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-body-sm text-body-sm text-on-surface">
                {ledger.map(tx => {
                  // tx.amount_paise is the net disbursed amount. We reverse-calculate gross.
                  const netInr = (tx.amount_paise || 0) / 100;
                  const gross = netInr / 0.90;
                  const tds = gross * 0.05;
                  const admin = gross * 0.05;
                  
                  const getTypeLabel = (type: string) => {
                    switch (type) {
                      case 'BINARY_INCOME': return <span className="text-primary font-bold">Binary Match</span>;
                      case 'MATCHING_MILESTONE_BONUS': return <span className="text-tertiary font-bold">Milestone Royalty</span>;
                      case 'RANK_BONUS': return <span className="text-secondary font-bold">Rank Reward</span>;
                      default: return <span className="text-outline font-bold">{type}</span>;
                    }
                  }

                  return (
                    <tr key={tx.id} className="hover:bg-surface-container-low transition-colors">
                      <td className="py-3 px-4 font-mono text-outline text-xs">{new Date(tx.created_at).toLocaleString()}</td>
                      <td className="py-3 px-4 font-mono font-bold text-primary">@{tx.user?.username}</td>
                      <td className="py-3 px-4 font-bold text-xs">{tx.user?.full_name}</td>
                      <td className="py-3 px-4 text-xs">{getTypeLabel(tx.transaction_type)}</td>
                      <td className="py-3 px-4 text-outline text-xs max-w-[250px]">{tx.description}</td>
                      <td className="py-3 px-4 text-right font-mono text-xs">₹{formatInr(gross)}</td>
                      <td className="py-3 px-4 text-right font-mono text-error text-xs">-₹{formatInr(tds)}</td>
                      <td className="py-3 px-4 text-right font-mono text-outline text-xs">-₹{formatInr(admin)}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-tertiary text-sm">₹{formatInr(netInr)}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-tertiary-fixed text-on-tertiary-fixed-variant px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold uppercase tracking-wider">
                          <span className="material-symbols-outlined text-[12px]">check_circle</span> Settled
                        </span>
                      </td>
                    </tr>
                  )
                })}
                {ledger.length === 0 && (
                  <tr><td colSpan={10} className="py-8 text-center text-outline">No commission records found.</td></tr>
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>
    </div>
  );
}
