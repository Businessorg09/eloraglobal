'use client'
// Cache buster to force turbopack rebuild 2

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function PropDashboardPage() {
  const [account, setAccount] = useState<any>(null);
  const [trades, setTrades] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'OPEN' | 'HISTORY' | 'PAYOUTS'>('HISTORY');
  const [showCredentials, setShowCredentials] = useState(false);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [isProcessingPayout, setIsProcessingPayout] = useState(false);
  const [payoutSuccess, setPayoutSuccess] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState<number>(0);
  const [payoutHistory, setPayoutHistory] = useState<any[]>([]);
  const [expandedPayoutId, setExpandedPayoutId] = useState<string | null>(null);

  useEffect(() => {
    fetchTerminalData();
  }, []);

  const fetchTerminalData = async () => {
    try {
      const res = await fetch('/api/terminal/account');
      const data = await res.json();
      if (data.account) setAccount(data.account);
      if (data.trades) setTrades(data.trades);
      
      const historyRes = await fetch('/api/terminal/payout/history');
      const historyData = await historyRes.json();
      if (historyData.payouts) setPayoutHistory(historyData.payouts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePayoutRequest = async () => {
    if (totalNetProfit <= 0 || payoutAmount <= 0 || payoutAmount > totalNetProfit) {
      alert("Invalid payout amount");
      return;
    }
    setIsProcessingPayout(true);
    try {
      const res = await fetch('/api/terminal/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: account.id, gross_profit_usd: payoutAmount })
      });
      if (res.ok) {
        setPayoutSuccess(true);
        setTimeout(() => {
          setShowPayoutModal(false);
          setPayoutSuccess(false);
          fetchTerminalData();
        }, 2000);
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to process payout');
      }
    } catch (err) {
      alert('Network error occurred.');
    } finally {
      setIsProcessingPayout(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 w-full flex items-center justify-center ">
        <div className="animate-spin text-indigo-600 material-symbols-outlined text-2xl md:text-4xl">refresh</div>
      </div>
    )
  }

  if (!account) {
    return (
      <div className="flex-1 w-full flex flex-col items-center justify-center text-gray-900">
        <div className="bg-white p-12 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col items-center max-w-lg text-center">
          <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-2xl md:text-4xl text-indigo-600">account_balance_wallet</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-3 tracking-tight">No Account Assigned</h1>
          <p className="text-gray-500 mb-8 leading-relaxed">Your institutional trading account has not been activated yet. Please wait for the risk desk to allocate your MT4/MT5 credentials.</p>
          <Link href="/trading" className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white px-8 py-4 rounded-[24px] font-bold transition-all shadow-[0_4px_14px_0_rgb(79,70,229,0.39)] hover:shadow-[0_6px_20px_rgba(79,70,229,0.23)] hover:-translate-y-0.5">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  // Derived Metrics
  const balance = parseFloat(account.balance) || 0;
  const equity = parseFloat(account.equity) || 0;
  const floatingPnl = equity - balance;

  const openTrades = trades.filter(t => t.status === 'OPEN');
  const closedTrades = trades.filter(t => t.status === 'CLOSED').sort((a, b) => new Date(a.close_time).getTime() - new Date(b.close_time).getTime());
  
  const totalNetProfit = closedTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
  const winningTrades = closedTrades.filter(t => parseFloat(t.pnl) > 0).length;
  const winRate = closedTrades.length > 0 ? ((winningTrades / closedTrades.length) * 100).toFixed(1) : '0.0';

  // Chart Data Generation
  const initialBalance = balance - totalNetProfit;
  let runningBalance = initialBalance;
  
  const chartData = [
    { date: 'Initial', balance: runningBalance },
    ...closedTrades.map(t => {
      runningBalance += parseFloat(t.pnl);
      return {
        date: new Date(t.close_time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        balance: parseFloat(runningBalance.toFixed(2))
      };
    })
  ];

  if (chartData.length === 1) {
    chartData.push({ date: 'Today', balance: runningBalance });
  }

  const isProfitableTotal = totalNetProfit >= 0;

  return (
    <div className="flex-1 flex flex-col text-gray-900 font-sans relative overflow-x-hidden">
      
      {/* Decorative Background Blur */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-indigo-50/50 to-transparent pointer-events-none -z-10"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[500px] bg-indigo-400/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>
      <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[400px] bg-blue-400/10 blur-[120px] rounded-full pointer-events-none -z-10"></div>

      {/* Top Banner */}
      <div className="pt-10 px-8 pb-6 max-w-[1400px] mx-auto w-full flex items-end justify-between">
        <div className="flex items-center gap-6">
          <Link href="/trading" className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-center text-gray-600 hover:bg-gray-50 hover:text-indigo-600 transition-all hover:-translate-y-0.5">
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </Link>
          <div className="flex flex-col">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 tracking-tight">Prop Analytics</h1>
              <span className="bg-indigo-50 border border-indigo-100 text-indigo-700 text-[11px] uppercase font-black px-3 py-1 rounded-full tracking-wider flex items-center gap-1.5 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
                Funded Status
              </span>
            </div>
            <p className="text-gray-500 font-medium">Live performance metrics synced directly from your broker server.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-white border border-gray-100 rounded-2xl px-6 py-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">MT4/MT5 Account ID</span>
            <span className="text-base font-black font-mono text-gray-900 tracking-tight">{account.account_number}</span>
          </div>
          <div className="w-px h-10 bg-gray-100"></div>
          <div className="flex flex-col">
            <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mb-0.5">Broker Server</span>
            <span className="text-base font-bold text-indigo-600 tracking-tight">{account.broker_server}</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto w-full px-8 flex flex-col gap-8">
        
        {/* Quick Actions Toolbar (Premium Cards) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          
          <button 
            onClick={() => setShowCredentials(true)}
            className="group relative overflow-hidden bg-white border border-gray-200 rounded-2xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-indigo-200 transition-all text-left flex flex-col hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 bg-indigo-50 rounded-[24px] flex items-center justify-center mb-3 group-hover:bg-indigo-600 transition-colors">
              <span className="material-symbols-outlined text-indigo-600 group-hover:text-white transition-colors">key</span>
            </div>
            <h3 className="text-gray-900 font-bold mb-1">Credentials</h3>
            <p className="text-xs text-gray-500 font-medium">View MT4/MT5 login details</p>
          </button>

          <button 
            onClick={() => alert('Deposit / Top Up functionality coming soon!')}
            className="group relative overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-600 border border-transparent rounded-2xl p-5 shadow-[0_4px_20px_rgb(79,70,229,0.2)] hover:shadow-[0_8px_30px_rgb(79,70,229,0.3)] transition-all text-left flex flex-col hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 bg-white/20 rounded-[24px] flex items-center justify-center mb-3 backdrop-blur-sm">
              <span className="material-symbols-outlined text-white">add_circle</span>
            </div>
            <h3 className="text-white font-bold mb-1">Top Up Account</h3>
            <p className="text-indigo-100 text-xs font-medium">Add funds to margin</p>
          </button>

          <button 
            onClick={() => {
              setPayoutAmount(totalNetProfit > 0 ? totalNetProfit : 0);
              setShowPayoutModal(true);
            }}
            className="group relative overflow-hidden bg-gradient-to-br from-emerald-500 to-teal-600 border border-transparent rounded-2xl p-5 shadow-[0_4px_20px_rgb(16,185,129,0.2)] hover:shadow-[0_8px_30px_rgb(16,185,129,0.3)] transition-all text-left flex flex-col hover:-translate-y-0.5"
          >
            <div className="w-10 h-10 bg-white/20 rounded-[24px] flex items-center justify-center mb-3 backdrop-blur-sm">
              <span className="material-symbols-outlined text-white">payments</span>
            </div>
            <h3 className="text-white font-bold mb-1">Request Payout</h3>
            <p className="text-emerald-100 text-xs font-medium">Withdraw your profits</p>
          </button>

          <div className="grid grid-rows-2 gap-4">
             <button className="bg-white border border-gray-200 rounded-[24px] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-gray-300 transition-all flex items-center justify-between group hover:-translate-y-0.5">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-amber-600 text-sm">workspace_premium</span>
                 </div>
                 <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Certificate</span>
               </div>
               <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-500 text-sm">arrow_forward</span>
             </button>
             
             <button className="bg-white border border-gray-200 rounded-[24px] px-4 py-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-gray-300 transition-all flex items-center justify-between group hover:-translate-y-0.5">
               <div className="flex items-center gap-3">
                 <div className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-gray-600 text-sm">support_agent</span>
                 </div>
                 <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Risk Support</span>
               </div>
               <span className="material-symbols-outlined text-gray-300 group-hover:text-gray-500 text-sm">arrow_forward</span>
             </button>
          </div>
        </div>
        
        {/* Metrics Row (Sleek Glassmorphic) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group hover:border-indigo-100 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-500">
              <span className="material-symbols-outlined text-6xl">account_balance</span>
            </div>
            <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-2 z-10">Balance</span>
            <span className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 font-mono tracking-tight z-10">${balance.toLocaleString('en-US', {minimumFractionDigits: 2})}</span>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group hover:border-indigo-100 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-500">
              <span className="material-symbols-outlined text-6xl">timeline</span>
            </div>
            <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-2 z-10">Live Equity</span>
            <span className={`text-3xl font-black tracking-tight font-mono tracking-tight z-10 ${equity > balance ? 'text-emerald-600' : equity < balance ? 'text-rose-600' : 'text-gray-900'}`}>
              ${equity.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group hover:border-indigo-100 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-500">
              <span className="material-symbols-outlined text-6xl">payments</span>
            </div>
            <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-2 z-10">Net Profit</span>
            <span className={`text-3xl font-black tracking-tight font-mono tracking-tight z-10 ${totalNetProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              {totalNetProfit >= 0 ? '+' : ''}${totalNetProfit.toLocaleString('en-US', {minimumFractionDigits: 2})}
            </span>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group hover:border-indigo-100 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-500">
              <span className="material-symbols-outlined text-6xl">pie_chart</span>
            </div>
            <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-2 z-10">Win Rate</span>
            <span className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 font-mono tracking-tight z-10">{winRate}%</span>
          </div>

          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col relative overflow-hidden group hover:border-indigo-100 transition-colors">
            <div className="absolute top-0 right-0 p-5 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity group-hover:scale-110 duration-500">
              <span className="material-symbols-outlined text-6xl">tag</span>
            </div>
            <span className="text-[11px] text-gray-500 font-black uppercase tracking-widest mb-2 z-10">Trades Taken</span>
            <span className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 font-mono tracking-tight z-10">{closedTrades.length}</span>
          </div>
        </div>

        {/* Equity Curve Graph */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col p-8 overflow-hidden relative">
          <div className="flex items-center justify-between mb-8 z-10">
            <div className="flex flex-col">
              <h2 className="text-xl font-black text-gray-900 tracking-tight">Equity Curve</h2>
              <p className="text-sm text-gray-500 font-medium">Historical performance trajectory based on closed positions.</p>
            </div>
            <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-1.5 flex items-center text-xs font-bold text-gray-500">
               <button className="px-4 py-1.5 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] rounded-lg text-gray-900">All Time</button>
               <button className="px-4 py-1.5 hover:text-gray-900 transition-colors">This Month</button>
            </div>
          </div>
          
          <div className="w-full h-[400px] z-10">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isProfitableTotal ? '#10B981' : '#F43F5E'} stopOpacity={0.25}/>
                    <stop offset="95%" stopColor={isProfitableTotal ? '#10B981' : '#F43F5E'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }}
                  dy={15}
                />
                <YAxis 
                  domain={['dataMin - 100', 'dataMax + 100']} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fill: '#94A3B8', fontWeight: 600 }}
                  tickFormatter={(val) => `$${val.toLocaleString()}`}
                  dx={-15}
                  orientation="right"
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: '1px solid #F1F5F9', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 'bold' }}
                  itemStyle={{ color: '#111827', fontWeight: 900, fontFamily: 'monospace' }}
                  formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Balance']}
                />
                <Area 
                  type="monotone" 
                  dataKey="balance" 
                  stroke={isProfitableTotal ? '#10B981' : '#F43F5E'} 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorBalance)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Trade Ledger */}
        <div className="bg-white border border-gray-100 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col overflow-hidden">
          <div className="flex items-center border-b border-gray-100 px-6 bg-gray-50/50">
            <button 
              onClick={() => setActiveTab('HISTORY')}
              className={`px-8 py-5 text-sm font-black border-b-2 transition-colors tracking-wide ${activeTab === 'HISTORY' ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-900 border-transparent'}`}
            >
              Trade History <span className="ml-1 opacity-50">({closedTrades.length})</span>
            </button>
            <button 
              onClick={() => setActiveTab('OPEN')}
              className={`px-8 py-5 text-sm font-black border-b-2 transition-colors flex items-center gap-2 tracking-wide ${activeTab === 'OPEN' ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-900 border-transparent'}`}
            >
              Open Positions 
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'OPEN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-200 text-gray-700'}`}>
                {openTrades.length}
              </span>
            </button>
            <button 
              onClick={() => setActiveTab('PAYOUTS')}
              className={`px-8 py-5 text-sm font-black border-b-2 transition-colors tracking-wide ${activeTab === 'PAYOUTS' ? 'text-indigo-600 border-indigo-600 bg-white' : 'text-gray-500 hover:text-gray-900 border-transparent'}`}
            >
              Payout History <span className="ml-1 opacity-50">({payoutHistory.length})</span>
            </button>
          </div>
          
          <div className="overflow-x-auto">
            {activeTab === 'PAYOUTS' ? (
              <div className="w-full">
                {payoutHistory.length === 0 ? (
                  <div className="text-center py-24 text-gray-400 font-medium text-base">
                    No payout history available.
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {payoutHistory.map(payout => {
                      const isExpanded = expandedPayoutId === payout.id;
                      return (
                        <div key={payout.id} className="flex flex-col border-b border-gray-50 last:border-0">
                          {/* Payout Summary Row */}
                          <div 
                            className="flex items-center justify-between px-8 py-5 hover:bg-gray-50/50 cursor-pointer transition-colors"
                            onClick={() => setExpandedPayoutId(isExpanded ? null : payout.id)}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                <span className="material-symbols-outlined text-[20px]">payments</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-gray-900 text-sm">Payout Request</span>
                                <span className="text-xs text-gray-500">{new Date(payout.created_at).toLocaleString()}</span>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-12">
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black tracking-widest text-gray-400">Gross Profit</span>
                                <span className="font-mono font-bold text-gray-900">${payout.gross_usd.toFixed(2)}</span>
                              </div>
                              <div className="flex flex-col items-end">
                                <span className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Your Share (70%)</span>
                                <span className="font-mono font-black text-emerald-600">${payout.trader_share_usd.toFixed(2)}</span>
                              </div>
                              <span className={`material-symbols-outlined transition-transform duration-300 ${isExpanded ? 'rotate-180 text-indigo-600' : 'text-gray-400'}`}>
                                expand_more
                              </span>
                            </div>
                          </div>

                          {/* Expanded Distribution Breakdown */}
                          {isExpanded && (
                            <div className="px-8 pb-6 pt-2 bg-gray-50/30">
                              <div className="bg-white border border-gray-100 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col">
                                <div className="bg-indigo-50/50 px-6 py-4 border-b border-indigo-100/50 flex items-center justify-between">
                                  <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
                                    <span className="material-symbols-outlined text-[18px]">account_tree</span>
                                    Network Distribution Ledger
                                  </div>
                                  <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
                                    Total Distributed: ${(payout.gross_usd - payout.trader_share_usd).toFixed(2)}
                                  </span>
                                </div>
                                
                                {(() => {
                                  const traderTxs = payout.distributions.filter((d: any) => d.type === 'TRADER_SHARE');
                                  const companyTxs = payout.distributions.filter((d: any) => d.type === 'COMPANY_RETAINED');
                                  const sponsorTxs = payout.distributions.filter((d: any) => d.type === 'SPONSOR_INCOME');
                                  const leadershipTxs = payout.distributions.filter((d: any) => d.type === 'LEADERSHIP_INCOME');
                                  
                                  const sumUsd = (txs: any[]) => txs.reduce((sum, t) => sum + t.amount_usd, 0);

                                  return (
                                    <div className="flex flex-col p-6 gap-6 bg-white">
                                      {/* Top Row: Trader & Company */}
                                      <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-emerald-50/50 border border-emerald-100 rounded-[24px] p-4 flex flex-col">
                                          <div className="flex items-center gap-2 mb-2 text-emerald-700">
                                            <span className="material-symbols-outlined text-sm">account_balance_wallet</span>
                                            <span className="text-xs font-black uppercase tracking-widest">Trader Payout (70%)</span>
                                          </div>
                                          <span className="text-2xl font-black tracking-tight font-mono text-emerald-600">${sumUsd(traderTxs).toFixed(2)}</span>
                                        </div>
                                        <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-4 flex flex-col">
                                          <div className="flex items-center gap-2 mb-2 text-gray-600">
                                            <span className="material-symbols-outlined text-sm">corporate_fare</span>
                                            <span className="text-xs font-black uppercase tracking-widest">Company Retained (10%)</span>
                                          </div>
                                          <span className="text-2xl font-black tracking-tight font-mono text-gray-800">${sumUsd(companyTxs).toFixed(2)}</span>
                                        </div>
                                      </div>

                                      {/* Sponsor Income */}
                                      {sponsorTxs.length > 0 && (
                                        <div className="flex flex-col border border-blue-100 rounded-[24px] overflow-hidden">
                                          <div className="bg-blue-50/50 px-5 py-3 border-b border-blue-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-blue-800 font-bold text-sm">
                                              <span className="material-symbols-outlined text-[18px]">group</span>
                                              Sponsor Income (15%)
                                            </div>
                                            <span className="font-mono font-black text-blue-700">Total: ${sumUsd(sponsorTxs).toFixed(2)}</span>
                                          </div>
                                          <table className="w-full text-left text-sm">
                                            <thead className="bg-white text-gray-400 uppercase tracking-widest font-black text-[9px] border-b border-gray-50">
                                              <tr>
                                                <th className="px-5 py-2.5">Level</th>
                                                <th className="px-5 py-2.5">Recipient</th>
                                                <th className="px-5 py-2.5 text-right">Amount (USD)</th>
                                                <th className="px-5 py-2.5 text-right">Amount (INR)</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 bg-white">
                                              {sponsorTxs.map((dist: any) => (
                                                <tr key={dist.id} className="hover:bg-gray-50/50">
                                                  <td className="px-5 py-2.5 text-xs font-bold text-gray-700">Level {dist.level}</td>
                                                  <td className="px-5 py-2.5">
                                                    <div className="flex flex-col">
                                                      <span className="font-bold text-gray-900 text-xs">{dist.recipient_name}</span>
                                                      <span className="text-[10px] text-gray-500">@{dist.recipient_username}</span>
                                                    </div>
                                                  </td>
                                                  <td className="px-5 py-2.5 text-right font-mono font-bold text-gray-900">${dist.amount_usd.toFixed(2)}</td>
                                                  <td className="px-5 py-2.5 text-right font-mono text-gray-500 text-xs">₹{dist.amount_inr.toLocaleString('en-IN')}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}

                                      {/* Leadership Income */}
                                      {leadershipTxs.length > 0 && (
                                        <div className="flex flex-col border border-amber-100 rounded-[24px] overflow-hidden">
                                          <div className="bg-amber-50/50 px-5 py-3 border-b border-amber-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                                              <span className="material-symbols-outlined text-[18px]">account_tree</span>
                                              Leadership Bonus (5%)
                                            </div>
                                            <span className="font-mono font-black text-amber-700">Total: ${sumUsd(leadershipTxs).toFixed(2)}</span>
                                          </div>
                                          <table className="w-full text-left text-sm">
                                            <thead className="bg-white text-gray-400 uppercase tracking-widest font-black text-[9px] border-b border-gray-50">
                                              <tr>
                                                <th className="px-5 py-2.5">Level</th>
                                                <th className="px-5 py-2.5">Recipient</th>
                                                <th className="px-5 py-2.5 text-right">Amount (USD)</th>
                                                <th className="px-5 py-2.5 text-right">Amount (INR)</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50 bg-white">
                                              {leadershipTxs.map((dist: any) => (
                                                <tr key={dist.id} className="hover:bg-gray-50/50">
                                                  <td className="px-5 py-2.5 text-xs font-bold text-gray-700">Level {dist.level}</td>
                                                  <td className="px-5 py-2.5">
                                                    <div className="flex flex-col">
                                                      <span className="font-bold text-gray-900 text-xs">{dist.recipient_name}</span>
                                                      <span className="text-[10px] text-gray-500">@{dist.recipient_username}</span>
                                                    </div>
                                                  </td>
                                                  <td className="px-5 py-2.5 text-right font-mono font-bold text-gray-900">${dist.amount_usd.toFixed(2)}</td>
                                                  <td className="px-5 py-2.5 text-right font-mono text-gray-500 text-xs">₹{dist.amount_inr.toLocaleString('en-IN')}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      )}
                                      
                                      {payout.distributions.length === 0 && (
                                        <div className="text-center py-6 text-gray-400 font-medium text-xs">
                                          No distribution records found for this payout.
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
            <table className="w-full text-left border-collapse text-sm">
              <thead className="bg-white text-gray-400 uppercase tracking-widest font-black text-[10px] border-b border-gray-100">
                <tr>
                  <th className="px-8 py-5 whitespace-nowrap">Order ID</th>
                  <th className="px-8 py-5 whitespace-nowrap">Open Time</th>
                  <th className="px-8 py-5 whitespace-nowrap">Type</th>
                  <th className="px-8 py-5 whitespace-nowrap">Volume</th>
                  <th className="px-8 py-5 whitespace-nowrap">Symbol</th>
                  <th className="px-8 py-5 whitespace-nowrap">Open Price</th>
                  <th className="px-8 py-5 whitespace-nowrap">{activeTab === 'HISTORY' ? 'Close Time' : 'Current Price'}</th>
                  <th className="px-8 py-5 whitespace-nowrap text-right">Profit / Loss</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-50">
                {(activeTab === 'HISTORY' ? closedTrades : openTrades).length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-24 text-gray-400 font-medium text-base">
                      {activeTab === 'HISTORY' ? 'No closed trade history available.' : 'No active positions running.'}
                    </td>
                  </tr>
                ) : (
                  (activeTab === 'HISTORY' ? closedTrades.slice().reverse() : openTrades).map(trade => (
                    <tr key={trade.id} className="hover:bg-gray-50/50 transition-colors group">
                      <td className="px-8 py-5 text-gray-400 font-mono text-xs font-medium">{trade.ticket_id}</td>
                      <td className="px-8 py-5 text-gray-700 font-medium">{new Date(trade.open_time).toLocaleString()}</td>
                      <td className="px-8 py-5">
                        <span className={`px-2.5 py-1 rounded-md text-xs font-black tracking-wide ${trade.direction === 'BUY' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                          {trade.direction}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-gray-900 font-bold">{trade.lot_size.toFixed(2)}</td>
                      <td className="px-8 py-5 font-black text-gray-900">{trade.symbol}</td>
                      <td className="px-8 py-5 text-gray-500 font-mono text-xs">{parseFloat(trade.open_price).toFixed(5)}</td>
                      <td className="px-8 py-5 text-gray-500 font-mono text-xs">
                        {activeTab === 'HISTORY' 
                          ? (trade.close_time ? new Date(trade.close_time).toLocaleString() : '-') 
                          : (parseFloat(trade.close_price) || parseFloat(trade.open_price)).toFixed(5)
                        }
                      </td>
                      <td className={`px-8 py-5 text-right font-black font-mono tracking-tight text-base ${parseFloat(trade.pnl) >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {parseFloat(trade.pnl) >= 0 ? '+' : ''}${parseFloat(trade.pnl).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            )}
          </div>
        </div>

      </div>

      {/* Credentials Modal */}
      {showCredentials && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-indigo-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl md:text-3xl">shield_person</span>
                <h2 className="text-xl font-black tracking-tight">MT4/MT5 Credentials</h2>
              </div>
              <button onClick={() => setShowCredentials(false)} className="text-indigo-200 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="p-8 flex flex-col gap-6">
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-black uppercase tracking-widest">Login ID</label>
                <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-4 font-mono font-black text-xl text-gray-900 flex justify-between items-center group cursor-pointer" onClick={() => navigator.clipboard.writeText(account.account_number)}>
                  {account.account_number}
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-indigo-600 text-sm">content_copy</span>
                </div>
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-black uppercase tracking-widest">Master Password</label>
                <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-4 font-mono font-black text-xl text-gray-900 flex justify-between items-center group cursor-pointer" onClick={() => navigator.clipboard.writeText(account.password)}>
                  {account.password}
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-indigo-600 text-sm">content_copy</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 font-black uppercase tracking-widest">Broker Server</label>
                <div className="bg-gray-50 border border-gray-100 rounded-[24px] p-4 font-bold text-base text-gray-900 flex justify-between items-center group cursor-pointer" onClick={() => navigator.clipboard.writeText(account.broker_server)}>
                  {account.broker_server}
                  <span className="material-symbols-outlined text-gray-400 group-hover:text-indigo-600 text-sm">content_copy</span>
                </div>
              </div>

              <div className="mt-2 bg-blue-50 border border-blue-100 p-4 rounded-[24px] flex gap-3 text-blue-800">
                <span className="material-symbols-outlined text-blue-600 text-xl">info</span>
                <p className="text-sm font-medium leading-relaxed">Download MetaTrader and select "Login to an existing account". Search for your broker server and enter these exact credentials.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* Payout Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all">
            <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl md:text-3xl">payments</span>
                <h2 className="text-xl font-black tracking-tight">Request Payout</h2>
              </div>
              <button onClick={() => setShowPayoutModal(false)} className="text-emerald-200 hover:text-white transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-8 flex flex-col gap-6">
              {payoutSuccess ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-emerald-600 text-5xl">check_circle</span>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-gray-900 mb-2">Payout Processed!</h3>
                  <p className="text-gray-500 font-medium">Your 70% share has been deposited into your internal wallet. Commissions have been distributed to the network.</p>
                </div>
              ) : (
                <>
                  <div className="flex flex-col items-center mb-6">
                    <span className="text-xs text-gray-400 font-black uppercase tracking-widest mb-1">Max Eligible Profit</span>
                    <span className={`text-2xl font-black tracking-tight font-mono tracking-tight ${totalNetProfit > 0 ? 'text-emerald-600' : 'text-gray-400'}`}>
                      ${totalNetProfit > 0 ? totalNetProfit.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  {totalNetProfit > 0 ? (
                    <div className="flex flex-col gap-5">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-gray-700 uppercase tracking-wide">Amount to Withdraw ($)</label>
                        <input 
                          type="number" 
                          value={payoutAmount || ''} 
                          onChange={(e) => {
                            const val = parseFloat(e.target.value);
                            if (!isNaN(val)) setPayoutAmount(val);
                            else setPayoutAmount(0);
                          }}
                          max={totalNetProfit}
                          min={0}
                          step={1}
                          className="w-full px-4 py-3 rounded-[24px] bg-gray-50 border border-gray-200 text-gray-900 text-lg font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                        {payoutAmount > totalNetProfit && (
                          <span className="text-xs font-bold text-red-500">Amount exceeds eligible profit.</span>
                        )}
                      </div>

                      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-5 flex flex-col gap-3">
                        <div className="flex justify-between items-center text-sm font-bold text-gray-900">
                          <span>Trader Share (70%)</span>
                          <span className="text-emerald-600 font-mono">+${(payoutAmount * 0.70).toFixed(2)}</span>
                        </div>
                        <div className="w-full h-px bg-gray-200"></div>
                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                          <span>Sponsor Pool (15%)</span>
                          <span className="font-mono">${(payoutAmount * 0.15).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                          <span>Leadership Pool (5%)</span>
                          <span className="font-mono">${(payoutAmount * 0.05).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm font-medium text-gray-600">
                          <span>Company Retained (10%)</span>
                          <span className="font-mono">${(payoutAmount * 0.10).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-rose-50 border border-rose-100 p-4 rounded-[24px] flex gap-3 text-rose-800">
                      <span className="material-symbols-outlined text-rose-600 text-xl">error</span>
                      <p className="text-sm font-medium leading-relaxed">Your account must be in net profit to request a payout.</p>
                    </div>
                  )}

                  <div className="mt-2">
                    <button 
                      onClick={handlePayoutRequest}
                      disabled={totalNetProfit <= 0 || payoutAmount <= 0 || payoutAmount > totalNetProfit || isProcessingPayout}
                      className={`w-full py-4 rounded-[24px] font-black text-white transition-all shadow-[0_8px_30px_rgba(0,0,0,0.04)] flex items-center justify-center gap-2 ${totalNetProfit > 0 && payoutAmount > 0 && payoutAmount <= totalNetProfit && !isProcessingPayout ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:shadow-lg hover:-translate-y-0.5' : 'bg-gray-300 cursor-not-allowed'}`}
                    >
                      {isProcessingPayout ? (
                        <span className="material-symbols-outlined animate-spin">refresh</span>
                      ) : (
                        <span className="material-symbols-outlined">account_balance_wallet</span>
                      )}
                      {isProcessingPayout ? 'Processing...' : 'Transfer to Wallet'}
                    </button>
                    <p className="text-[10px] text-gray-400 text-center mt-3 font-medium">Funds will be instantly transferred to your internal Platform Wallet and network commissions will be executed via smart routing.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
