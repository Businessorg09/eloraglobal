'use client';

import React, { useState, useEffect, useMemo } from 'react';

// ─── Utilities ───────────────────────────────────────────────────────────────
const formatInr = (val: number | undefined | null) => (val || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 });
const formatUsd = (val: number | undefined | null) => (val || 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

// ─── Interfaces ──────────────────────────────────────────────────────────────
interface KPI {
  totalTradingProfitUsd?: number;
  totalTradingProfitInr?: number; // fallback for older cached version
  totalDistributedInr?: number;
  companyRetainedUsd?: number;
  companyRetainedInr?: number; // fallback
}

interface FinancialsClientProps {
  pendingRequests: any[];
  tradingLedger: any[];
  sponsorLedger: any[];
  leadershipLedger: any[];
  exchangeLedger: any[];
  kpis: KPI;
}

// ─── Component ───────────────────────────────────────────────────────────────
export default function FinancialsClient({
  pendingRequests,
  tradingLedger,
  sponsorLedger,
  leadershipLedger,
  exchangeLedger,
  kpis
}: FinancialsClientProps) {
  // State
  const [activeTab, setActiveTab] = useState<'queue' | 'trading' | 'exchange' | 'sponsor' | 'leadership' | 'company'>('queue');
  const [usdRate, setUsdRate] = useState<number>(95.00);
  const [isRateLoading, setIsRateLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  
  // User Lookup Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Calculator State
  const [calcUsd, setCalcUsd] = useState<string>('1000');

  // Fetch Live Rate
  const fetchLiveRate = async () => {
    setIsRateLoading(true);
    try {
      const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
      if (res.ok) {
        const data = await res.json();
        if (data.rates && data.rates.INR) {
          setUsdRate(data.rates.INR);
        }
      }
    } catch (e) {
      console.error('Failed to fetch live rate', e);
    }
    setIsRateLoading(false);
  };

  useEffect(() => {
    fetchLiveRate();
  }, []);

  // Handlers
  const handleApprove = async (id: string, traderUsername: string, usdAmount: number) => {
    if (!confirm(`Approve payout of $${usdAmount} for ${traderUsername}? This will distribute funds across the network.`)) return;
    setLoadingAction(id);
    try {
      const res = await fetch('/api/admin/trading-payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          traderUsername,
          payoutAmountUsdCents: Math.floor(usdAmount * 100),
          exchangeRateUsdToInr: usdRate
        })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to approve payout');
      
      alert(`Success! Trader credited: ₹${formatInr(data.traderCredited)}\nSponsor Distributions: ${data.sponsorDistributions}\nLeadership Distributions: ${data.leadershipDistributions}`);
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    }
    setLoadingAction(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm('Reject this payout request?')) return;
    // In a real implementation, you'd call a reject API endpoint
    alert('Request rejected (Simulation)');
  };

  const downloadCsv = (data: any[], filename: string) => {
    if (!data.length) return;
    // Flatten nested objects for CSV
    const flatData = data.map(row => {
      const newRow: any = { ...row };
      if (row.user) newRow.username = row.user.username;
      if (row.receiver) newRow.receiver_username = row.receiver.username;
      if (row.trader) newRow.trader_username = row.trader.username;
      delete newRow.user;
      delete newRow.receiver;
      delete newRow.trader;
      return newRow;
    });

    const headers = Object.keys(flatData[0]).join(',');
    const rows = flatData.map(row => 
      Object.values(row).map(val => `"${val}"`).join(',')
    ).join('\n');
    
    const blob = new Blob([`${headers}\n${rows}`], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Calculator logic
  const calcData = useMemo(() => {
    const usd = parseFloat(calcUsd) || 0;
    const inrTotal = usd * usdRate;
    return {
      inrTotal,
      trader: inrTotal * 0.70,
      sponsorPool: inrTotal * 0.15,
      leadershipPool: inrTotal * 0.05,
      company: inrTotal * 0.10
    };
  }, [calcUsd, usdRate]);

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen overflow-y-auto">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
              <span className="material-symbols-outlined text-[14px]">account_balance</span>
              Financial Governance
              <span className="text-slate-300">/</span>
              <span className="text-[#1D4ED8] font-bold">P&L & Distributions</span>
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Trading Financial Command Center</h1>
          </div>
          
          <div className="flex items-center gap-3">
            {/* USD Rate Manager */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-bold text-slate-500 uppercase">1 USD =</span>
              <div className="flex items-center gap-1">
                <span className="text-slate-400">₹</span>
                <input 
                  type="number" 
                  value={usdRate} 
                  onChange={(e) => setUsdRate(parseFloat(e.target.value) || 0)}
                  className="w-16 bg-transparent text-[13px] font-bold text-slate-900 outline-none font-mono"
                  step="0.01"
                />
              </div>
              <button 
                onClick={fetchLiveRate} 
                disabled={isRateLoading}
                className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                title="Fetch Live Rate"
              >
                <span className={`material-symbols-outlined text-[16px] ${isRateLoading ? 'animate-spin' : ''}`}>sync</span>
              </button>
            </div>
            
            <button 
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[12px] font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">person_search</span>
              User Ledger Lookup
            </button>
          </div>
        </div>

        {/* ── KPI Metrics ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Trading Profit Processed</span>
            <div className="my-2">
              <div className="text-[24px] font-bold text-slate-900">
                {formatUsd(kpis.totalTradingProfitUsd ?? kpis.totalTradingProfitInr)}
              </div>
              <div className="text-[12px] text-slate-500 font-mono mt-1">
                ~₹{formatInr((kpis.totalTradingProfitUsd || kpis.totalTradingProfitInr || 0) * usdRate)}
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-[#1D4ED8] h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Distributed to Network (20%)</span>
            <div className="my-2">
              <div className="text-[24px] font-bold text-emerald-600">₹{formatInr(kpis.totalDistributedInr)}</div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-1">Sponsor + Leadership Pools</div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col justify-between">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Company Retained (10%)</span>
            <div className="my-2">
              <div className="text-[24px] font-bold text-indigo-600">
                {formatUsd(kpis.companyRetainedUsd ?? kpis.companyRetainedInr)}
              </div>
              <div className="text-[11px] text-indigo-600 font-semibold mt-1">Gross Margin in USD</div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full" style={{ width: '100%' }}></div>
            </div>
          </div>
          
          <div className="bg-red-50 rounded-2xl border border-red-100 shadow-sm p-5 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-wider">Pending Payout Requests</span>
              <span className="material-symbols-outlined text-[18px] text-red-500">pending_actions</span>
            </div>
            <div className="my-2">
              <div className="text-[28px] font-bold text-red-700">{pendingRequests.length}</div>
              <div className="text-[11px] text-red-600 font-semibold mt-1">Requires Admin Approval</div>
            </div>
          </div>
        </div>

        {/* ── Layout: Main Area (Tabs) + Calculator ─────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          
          {/* Left: Tabbed Ledger System (8 cols) */}
          <div className="xl:col-span-8 flex flex-col gap-0 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            
            {/* Tabs */}
            <div className="flex items-center overflow-x-auto bg-slate-50 border-b border-slate-200 px-4 pt-3 gap-2">
              {[
                { id: 'queue', icon: 'pending_actions', label: `Payout Queue (${pendingRequests.length})` },
                { id: 'trading', icon: 'account_balance', label: 'Trading Ledger' },
                { id: 'exchange', icon: 'currency_exchange', label: 'Exchange Ledger (USD -> INR)' },
                { id: 'sponsor', icon: 'hub', label: 'Sponsor Ledger' },
                { id: 'leadership', icon: 'diversity_3', label: 'Leadership Ledger' },
              ].map(t => (
                <button 
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-[12px] font-bold transition-colors border-x border-t ${
                    activeTab === t.id 
                      ? 'bg-white text-[#1D4ED8] border-slate-200 shadow-[0_-2px_4px_rgba(0,0,0,0.02)] translate-y-[1px]' 
                      : 'bg-transparent text-slate-500 border-transparent hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">{t.icon}</span>
                  {t.label}
                </button>
              ))}
              
              <div className="ml-auto pb-1">
                <button 
                  onClick={() => {
                    if (activeTab === 'trading') downloadCsv(tradingLedger, 'trading_ledger');
                    else if (activeTab === 'exchange') downloadCsv(exchangeLedger, 'exchange_ledger');
                    else if (activeTab === 'sponsor') downloadCsv(sponsorLedger, 'sponsor_ledger');
                    else if (activeTab === 'leadership') downloadCsv(leadershipLedger, 'leadership_ledger');
                    else if (activeTab === 'queue') downloadCsv(pendingRequests, 'pending_queue');
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold transition-colors"
                >
                  <span className="material-symbols-outlined text-[14px]">download</span>
                  Export CSV
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="p-0 overflow-x-auto min-h-[400px]">
              
              {/* QUEUE TAB */}
              {activeTab === 'queue' && (
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Trader</th>
                      <th className="py-3 px-4 text-right">Requested USD</th>
                      <th className="py-3 px-4 text-right">Total INR</th>
                      <th className="py-3 px-4 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {pendingRequests.map(req => {
                      let payload: any = { usdCents: req.amount_paise };
                      try { payload = JSON.parse(req.description); } catch(e){}
                      const usdAmt = (payload.usdCents || req.amount_paise) / 100;
                      const inrTotal = usdAmt * usdRate;
                      
                      return (
                        <tr key={req.id} className="hover:bg-slate-50">
                          <td className="py-3 px-4 font-mono text-slate-500">{new Date(req.created_at).toLocaleDateString()}</td>
                          <td className="py-3 px-4">
                            <div className="font-bold text-slate-900">{req.user?.full_name}</div>
                            <div className="text-[10px] text-slate-400 font-mono">@{req.user?.username}</div>
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{formatUsd(usdAmt)}</td>
                          <td className="py-3 px-4 text-right font-mono">₹{formatInr(inrTotal)}</td>
                          <td className="py-3 px-4 flex justify-center gap-2">
                            <button 
                              disabled={loadingAction === req.id}
                              onClick={() => handleApprove(req.id, req.user?.username, usdAmt)}
                              className="px-3 py-1.5 bg-[#1D4ED8] hover:bg-blue-700 text-white rounded-lg font-bold text-[11px]"
                            >
                              Approve Split
                            </button>
                            <button 
                              disabled={loadingAction === req.id}
                              onClick={() => handleReject(req.id)}
                              className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg font-bold text-[11px] border border-red-200"
                            >
                              Reject
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {pendingRequests.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-slate-400">No pending payout requests</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* TRADING TAB */}
              {activeTab === 'trading' && (
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Trader</th>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4 text-right">Trader Share (70%)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {tradingLedger.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-[#1D4ED8]">{tx.user?.username}</td>
                        <td className="py-3 px-4 text-slate-500">{tx.description}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">{formatUsd(tx.amount_cents ? tx.amount_cents / 100 : tx.amount_paise / 100)}</td>
                      </tr>
                    ))}
                    {tradingLedger.length === 0 && (
                      <tr><td colSpan={4} className="py-12 text-center text-slate-400">No trading payouts found</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* EXCHANGE LEDGER TAB */}
              {activeTab === 'exchange' && (
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Trader</th>
                      <th className="py-3 px-4 text-right">Gross (USD)</th>
                      <th className="py-3 px-4 text-right">Network Alloc. (USD)</th>
                      <th className="py-3 px-4 text-center">Exchange Rate</th>
                      <th className="py-3 px-4 text-right">Converted Network (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {exchangeLedger.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-indigo-700">{tx.trader?.username}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">{formatUsd(tx.gross_usd)}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-red-500">{formatUsd(tx.network_allocation_usd)}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-100 font-mono text-[10px]">1 USD = ₹{tx.exchange_rate}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">₹{formatInr(tx.network_allocation_inr)}</td>
                      </tr>
                    ))}
                    {exchangeLedger.length === 0 && (
                      <tr><td colSpan={6} className="py-12 text-center text-slate-400">No exchange conversions found</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* SPONSOR TAB */}
              {activeTab === 'sponsor' && (
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Receiver</th>
                      <th className="py-3 px-4">From Trader</th>
                      <th className="py-3 px-4 text-center">Level</th>
                      <th className="py-3 px-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {sponsorLedger.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-emerald-700">{tx.receiver?.username}</td>
                        <td className="py-3 px-4 font-bold text-slate-500">{tx.trader?.username}</td>
                        <td className="py-3 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-[10px]">L{tx.level}</span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold">₹{formatInr(tx.amount_paise / 100)}</td>
                      </tr>
                    ))}
                    {sponsorLedger.length === 0 && (
                      <tr><td colSpan={5} className="py-12 text-center text-slate-400">No sponsor income found</td></tr>
                    )}
                  </tbody>
                </table>
              )}

              {/* LEADERSHIP TAB */}
              {activeTab === 'leadership' && (
                <table className="w-full text-left text-[12px]">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Receiver</th>
                      <th className="py-3 px-4">From Trader</th>
                      <th className="py-3 px-4 text-right">Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {leadershipLedger.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-50">
                        <td className="py-3 px-4 font-mono text-slate-500">{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td className="py-3 px-4 font-bold text-indigo-700">{tx.receiver?.username}</td>
                        <td className="py-3 px-4 font-bold text-slate-500">{tx.trader?.username}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold">₹{formatInr(tx.amount_paise / 100)}</td>
                      </tr>
                    ))}
                    {leadershipLedger.length === 0 && (
                      <tr><td colSpan={4} className="py-12 text-center text-slate-400">No leadership income found</td></tr>
                    )}
                  </tbody>
                </table>
              )}

            </div>
          </div>

          {/* Right: Interactive Distribution Calculator (4 cols) */}
          <div className="xl:col-span-4 flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">calculate</span>
                <h3 className="text-[15px] font-bold text-slate-900">Distribution Calculator</h3>
              </div>
              
              <div className="flex flex-col gap-1.5 mb-5">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Simulate Trading Profit (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-400 font-bold">$</span>
                  <input 
                    type="number"
                    value={calcUsd}
                    onChange={(e) => setCalcUsd(e.target.value)}
                    className="w-full pl-7 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[14px] font-bold text-slate-900 outline-none focus:ring-2 focus:ring-[#1D4ED8]"
                  />
                </div>
                <div className="text-right text-[11px] text-slate-500 mt-0.5">
                  Total Pool: <span className="font-bold text-slate-900 font-mono">₹{formatInr(calcData.inrTotal)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {/* 70% */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-emerald-800">Trader Share</span>
                    <span className="text-[10px] font-semibold text-emerald-600">70% of total</span>
                  </div>
                  <span className="text-[14px] font-bold font-mono text-emerald-700">₹{formatInr(calcData.trader)}</span>
                </div>

                {/* 15% */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50 border border-blue-100">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-blue-800">Sponsor Pool</span>
                    <span className="text-[10px] font-semibold text-blue-600">15% • Split 10 Levels</span>
                  </div>
                  <span className="text-[14px] font-bold font-mono text-blue-700">₹{formatInr(calcData.sponsorPool)}</span>
                </div>

                {/* 5% */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50 border border-indigo-100">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-indigo-800">Leadership Pool</span>
                    <span className="text-[10px] font-semibold text-indigo-600">5% • Equal split 20 Levels</span>
                  </div>
                  <span className="text-[14px] font-bold font-mono text-indigo-700">₹{formatInr(calcData.leadershipPool)}</span>
                </div>

                {/* 10% */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex flex-col">
                    <span className="text-[12px] font-bold text-slate-700">Company Retained</span>
                    <span className="text-[10px] font-semibold text-slate-500">10% Margin</span>
                  </div>
                  <span className="text-[14px] font-bold font-mono text-slate-700">₹{formatInr(calcData.company)}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-amber-50 rounded-2xl border border-amber-200 p-4 flex gap-3 text-amber-800">
              <span className="material-symbols-outlined text-[18px] shrink-0">info</span>
              <p className="text-[11px] leading-relaxed font-medium">
                The 70/15/5/10 model ensures mathematical safety. If any sponsor or leadership levels are missing in the binary tree, their allocated share rolls back into the Company Retained pool.
              </p>
            </div>
          </div>

        </div>
      </div>

      {/* ── User Lookup Modal ──────────────────────────────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#1D4ED8]">person_search</span>
                <h3 className="font-bold text-[16px] text-slate-900">User Ledger Lookup</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4 bg-[#F8FAFC]">
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter Username or MT5 ID..."
                  className="w-full pl-10 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-[13px] outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex flex-col items-center justify-center py-8 text-slate-400 gap-2">
                <span className="material-symbols-outlined text-[32px]">travel_explore</span>
                <span className="text-[12px] font-semibold">Enter a username to view their complete financial profile.</span>
              </div>
              
              {/* Note: In a real implementation, you'd fetch the user's data on demand here */}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
