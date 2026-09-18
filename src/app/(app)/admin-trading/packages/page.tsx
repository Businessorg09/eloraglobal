'use client';

import React, { useState, useMemo, useEffect } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderType = 'BUY' | 'SELL';

interface TradeRecord {
  ticket: number;
  symbol: string;
  type: OrderType;
  lots: number;
  openPrice: number;
  closePrice: number;
  openTime: string;
  closeTime: string;
  profit: number;
  pips: number;
  injectedAt: string;
}

interface TradingAccount {
  id: string;
  accountId: string;
  name: string;
  initials: string;
  color: string;
  mt5: string;
  tier: string;
  tierColor: string;
  balance: number;
  equity: number;
  drawdown: number;
  status: 'Active' | 'Suspended' | 'Demo';
  trades: TradeRecord[];
}

// ─── Pip Value Calculator ────────────────────────────────────────────────────

const PIP_VALUES: Record<string, number> = {
  'EURUSD': 10, 'GBPUSD': 10, 'AUDUSD': 10, 'NZDUSD': 10,
  'USDJPY': 9.09, 'USDCHF': 11.0, 'USDCAD': 7.6,
  'GBPJPY': 9.09, 'EURJPY': 9.09, 'XAUUSD': 10,
  'XAGUSD': 50, 'US30': 1, 'NAS100': 1, 'SPX500': 1,
  'BTCUSD': 1, 'ETHUSD': 1,
};

const PIP_SIZES: Record<string, number> = {
  'EURUSD': 0.0001, 'GBPUSD': 0.0001, 'AUDUSD': 0.0001, 'NZDUSD': 0.0001,
  'USDJPY': 0.01, 'USDCHF': 0.0001, 'USDCAD': 0.0001,
  'GBPJPY': 0.01, 'EURJPY': 0.01, 'XAUUSD': 0.01,
  'XAGUSD': 0.001, 'US30': 1, 'NAS100': 1, 'SPX500': 0.1,
  'BTCUSD': 1, 'ETHUSD': 0.1,
};

function calcProfitAndPips(
  symbol: string,
  type: OrderType,
  lots: number,
  openPrice: number,
  closePrice: number
): { profit: number; pips: number } {
  const pipSize = PIP_SIZES[symbol] ?? 0.0001;
  const pipValue = PIP_VALUES[symbol] ?? 10;
  const rawDiff = type === 'BUY' ? closePrice - openPrice : openPrice - closePrice;
  const pips = parseFloat((rawDiff / pipSize).toFixed(1));
  const profit = parseFloat((pips * pipValue * lots).toFixed(2));
  return { profit, pips };
}

// ─── Sample Data ──────────────────────────────────────────────────────────────

const INITIAL_ACCOUNTS: TradingAccount[] = [];

const SYMBOLS = ['EURUSD','GBPUSD','AUDUSD','NZDUSD','USDJPY','USDCHF','USDCAD','GBPJPY','EURJPY','XAUUSD','XAGUSD','US30','NAS100','SPX500','BTCUSD','ETHUSD'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatMoney(n: number, decimals = 2) {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

function nowLocal() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function generateTicket() {
  return Math.floor(1000000 + Math.random() * 9000000);
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TradingAccountsPage() {
  const [accounts, setAccounts] = useState<TradingAccount[]>([]);
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PENDING'>('ACTIVE');
  const [assignForm, setAssignForm] = useState({ accountNumber: '', password: '', brokerServer: 'TDPF-Live', balance: '10000' });
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignError, setAssignError] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInjecting, setIsInjecting] = useState(false);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await fetch('/api/admin/trading/accounts');
      const data = await res.json();
      if (data.users) {
        const mappedAccounts: TradingAccount[] = [];
        const mappedPending: any[] = [];
        data.users.forEach((u: any) => {
          if (u.account && u.account.length > 0) {
            u.account.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
            const acc = u.account[0];
            
            const mappedTrades = (acc.broker_trades || []).map((t: any) => ({
              ticket: t.ticket_id || t.id.substring(0, 8),
              symbol: t.symbol,
              type: t.direction,
              lots: parseFloat(t.lot_size),
              openPrice: parseFloat(t.open_price),
              closePrice: parseFloat(t.close_price) || parseFloat(t.open_price),
              openTime: new Date(t.open_time).toLocaleString(),
              closeTime: t.close_time ? new Date(t.close_time).toLocaleString() : '-',
              profit: parseFloat(t.pnl),
              pips: 0,
              injectedAt: new Date(t.created_at || t.open_time).toLocaleString(),
              id: t.id
            })).sort((a: any, b: any) => new Date(b.openTime).getTime() - new Date(a.openTime).getTime());

            mappedAccounts.push({
              id: u.id,
              accountId: acc.id,
              name: u.full_name,
              initials: u.full_name.substring(0, 2).toUpperCase(),
              color: 'bg-[#1D4ED8] text-white',
              mt5: acc.account_number,
              tier: 'Funded',
              tierColor: 'bg-indigo-100 text-indigo-700',
              balance: parseFloat(acc.balance) || 0,
              equity: parseFloat(acc.equity) || 0,
              drawdown: 0,
              status: 'Active',
              trades: mappedTrades
            });
          } else {
            const approvedPurchase = (u.purchases || []).find((p: any) => {
              try {
                const meta = p.payment_gateway_id ? JSON.parse(p.payment_gateway_id) : {};
                return meta.status === 'APPROVED';
              } catch(e) { return false; }
            });
            if (approvedPurchase) {
              const pkg: any = Array.isArray(approvedPurchase.packages) ? approvedPurchase.packages[0] : approvedPurchase.packages;
              mappedPending.push({
                id: u.id,
                name: u.full_name,
                email: u.email,
                initials: u.full_name.substring(0, 2).toUpperCase(),
                packageName: pkg?.name || 'Unknown Package',
                color: 'bg-amber-500 text-white'
              });
            }
          }
        });
        setAccounts(mappedAccounts);
        setPendingUsers(mappedPending);
        if (mappedAccounts.length > 0 && activeTab === 'ACTIVE') {
          setSelectedId(mappedAccounts[0].id);
        }
        if (mappedPending.length > 0 && activeTab === 'PENDING') {
          setSelectedId(mappedPending[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Form state
  const [form, setForm] = useState({
    symbol: 'EURUSD',
    type: 'BUY' as OrderType,
    lots: '0.10',
    openPrice: '',
    closePrice: '',
    openTime: '',
    closeTime: '',
  });
  const [formError, setFormError] = useState('');

  const selectedAccount = accounts.find((a) => a.id === selectedId)!;
  const filteredAccounts = accounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.mt5.toLowerCase().includes(search.toLowerCase())
  );

  // Live P&L preview
  const preview = useMemo(() => {
    const op = parseFloat(form.openPrice);
    const cp = parseFloat(form.closePrice);
    const lots = parseFloat(form.lots);
    if (!form.openPrice || !form.closePrice || !form.lots || isNaN(op) || isNaN(cp) || isNaN(lots) || lots <= 0) return null;
    return calcProfitAndPips(form.symbol, form.type, lots, op, cp);
  }, [form.symbol, form.type, form.lots, form.openPrice, form.closePrice]);

  const handleAssign = async () => {
    if (!selectedId) return;
    setIsAssigning(true);
    setAssignError('');
    try {
      const res = await fetch('/api/admin/trading/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedId,
          account_number: assignForm.accountNumber,
          password: assignForm.password,
          broker_server: assignForm.brokerServer,
          balance: assignForm.balance
        })
      });
      if (res.ok) {
        setToast('✅ Trading account assigned successfully');
        setTimeout(() => setToast(null), 4000);
        setAssignForm({ accountNumber: '', password: '', brokerServer: 'TDPF-Live', balance: '10000' });
        setActiveTab('ACTIVE');
        fetchAccounts();
      } else {
        const err = await res.json();
        setAssignError(err.error || 'Failed to assign account');
      }
    } catch (e) {
      setAssignError('Network error');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleInject = async () => {
    if (!selectedAccount) return;
    const op = parseFloat(form.openPrice);
    const cp = parseFloat(form.closePrice);
    const lots = parseFloat(form.lots);

    if (!form.openPrice || !form.closePrice || !form.lots) { setFormError('Please fill all required fields.'); return; }
    if (isNaN(op) || isNaN(cp) || isNaN(lots) || lots <= 0) { setFormError('Enter valid numeric values for prices and lot size.'); return; }
    if (!form.openTime || !form.closeTime) { setFormError('Open and Close time are required.'); return; }
    setFormError('');

    const { profit, pips } = calcProfitAndPips(form.symbol, form.type, lots, op, cp);
    
    setIsInjecting(true);
    try {
      const res = await fetch('/api/admin/trading/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: selectedAccount.accountId,
          user_id: selectedAccount.id,
          symbol: form.symbol,
          direction: form.type,
          lot_size: lots,
          open_price: op,
          close_price: cp,
          open_time: new Date(form.openTime).toISOString(),
          close_time: new Date(form.closeTime).toISOString(),
          pnl: profit,
          status: 'CLOSED'
        })
      });
      
      if (res.ok) {
        setToast(`✅ Trade injected into ${selectedAccount.name}'s account`);
        setTimeout(() => setToast(null), 4000);
        setForm({ symbol: 'EURUSD', type: 'BUY', lots: '0.10', openPrice: '', closePrice: '', openTime: '', closeTime: '' });
        fetchAccounts(); // Refresh data to get actual DB trade ID
      } else {
        const errData = await res.json();
        setFormError(errData.error || 'Failed to inject trade.');
      }
    } catch (err) {
      setFormError('Network error while injecting trade.');
    } finally {
      setIsInjecting(false);
    }
  };

  const deleteTrade = (accountId: string, ticket: number) => {
    setAccounts((prev) => prev.map((acc) =>
      acc.id === accountId
        ? { ...acc, trades: acc.trades.filter((t) => t.ticket !== ticket) }
        : acc
    ));
    setToast(`Trade #${ticket} removed from account`);
    setTimeout(() => setToast(null), 3000);
  };

  const totalProfit = selectedAccount ? selectedAccount.trades.reduce((s, t) => s + t.profit, 0) : 0;
  const winTrades = selectedAccount ? selectedAccount.trades.filter((t) => t.profit > 0).length : 0;
  const winRate = selectedAccount && selectedAccount.trades.length > 0 ? Math.round((winTrades / selectedAccount.trades.length) * 100) : 0;

  if (isLoading) {
    return <div className="flex-1 bg-[#F8FAFC] min-h-screen flex items-center justify-center">Loading accounts...</div>;
  }

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen overflow-y-auto">
      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-semibold shadow-xl flex items-center gap-2 max-w-sm">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          {toast}
        </div>
      )}

      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
              <span className="material-symbols-outlined text-[14px]">home</span>
              Admin Trading
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">Trading Accounts</span>
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Trading Account Manager</h1>
            <p className="text-slate-500 text-[13px] mt-0.5">
              Monitor live accounts, inject demo trades, and manage account performance data.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-emerald-700 text-[11px] font-bold">{accounts.filter(a => a.status === 'Active').length} Live Accounts</span>
            </div>
            <div className="px-3 py-2 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-bold">
              {accounts.filter(a => a.status === 'Demo').length} Demo Accounts
            </div>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex gap-4 border-b border-slate-200 pb-2">
          <button 
            onClick={() => { setActiveTab('ACTIVE'); setSelectedId(accounts.length > 0 ? accounts[0].id : ''); }}
            className={`px-4 py-2 font-bold text-[14px] rounded-t-lg transition ${activeTab === 'ACTIVE' ? 'text-[#1D4ED8] border-b-2 border-[#1D4ED8]' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Active Accounts ({accounts.length})
          </button>
          <button 
            onClick={() => { setActiveTab('PENDING'); setSelectedId(pendingUsers.length > 0 ? pendingUsers[0].id : ''); }}
            className={`px-4 py-2 font-bold text-[14px] rounded-t-lg transition ${activeTab === 'PENDING' ? 'text-amber-600 border-b-2 border-amber-600' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Pending Assignment ({pendingUsers.length})
          </button>
        </div>

        {/* ── Main Layout: Account List | Detail Panel ──────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 items-start">

          {/* ── LEFT: Account List (4 cols) ─────────────────────────────── */}
          <div className="xl:col-span-4 flex flex-col gap-3">
            {/* Search */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or MT5 ID..."
                className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-[13px] outline-none focus:ring-2 focus:ring-blue-500 shadow-sm transition"
              />
            </div>

            {/* Account Cards */}
            <div className="flex flex-col gap-2">
              {activeTab === 'PENDING' ? (
                pendingUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).length === 0 ? (
                  <div className="text-center text-slate-500 py-8">No pending assignments found.</div>
                ) : pendingUsers.filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).map((u) => (
                  <button
                    key={u.id}
                    onClick={() => setSelectedId(u.id)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${
                      selectedId === u.id
                        ? 'border-amber-500 bg-amber-50 shadow-md'
                        : 'border-slate-200 bg-white hover:border-amber-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${u.color} flex items-center justify-center font-bold text-[13px] shrink-0`}>
                        {u.initials}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-[14px] text-slate-900 leading-tight truncate">{u.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{u.email}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Package:</span>
                      <span className="ml-2 font-bold text-[12px] text-amber-700">{u.packageName}</span>
                    </div>
                  </button>
                ))
              ) : (
              filteredAccounts.length === 0 ? (
                <div className="text-center text-slate-500 py-8">No trading accounts found.</div>
              ) : filteredAccounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedId(acc.id)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all ${
                    selectedId === acc.id
                      ? 'border-[#1D4ED8] bg-blue-50 shadow-md'
                      : 'border-slate-200 bg-white hover:border-blue-200 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${acc.color} flex items-center justify-center font-bold text-[13px] shrink-0`}>
                        {acc.initials}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-[14px] text-slate-900 leading-tight truncate">{acc.name}</p>
                        <p className="text-[11px] text-slate-500 font-mono">{acc.mt5}</p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0 ml-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        acc.status === 'Active' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                        acc.status === 'Demo' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                        'bg-red-100 text-red-700 border border-red-200'
                      }`}>
                        {acc.status.toUpperCase()}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${acc.tierColor}`}>
                        {acc.tier}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Balance</span>
                      <span className="text-[12px] font-bold text-slate-800">${formatMoney(acc.balance, 0)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">Equity</span>
                      <span className="text-[12px] font-bold text-slate-800">${formatMoney(acc.equity, 0)}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wide">DD</span>
                      <span className={`text-[12px] font-bold ${acc.drawdown > 5 ? 'text-red-600' : acc.drawdown > 2 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {acc.drawdown}%
                      </span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                    <span>{acc.trades.length} Injected Trade{acc.trades.length !== 1 ? 's' : ''}</span>
                    {selectedId === acc.id && (
                      <span className="text-[#1D4ED8] font-bold flex items-center gap-0.5">
                        Selected <span className="material-symbols-outlined text-[12px]">arrow_forward</span>
                      </span>
                    )}
                  </div>
                </button>
              ))
             )}
            </div>
          </div>

          {/* ── RIGHT: Account Detail + Trade Injector (8 cols) ──────────── */}
          <div className="xl:col-span-8 flex flex-col gap-5">
            {activeTab === 'PENDING' ? (
              !pendingUsers.find(u => u.id === selectedId) ? (
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">
                  Select a pending user to assign an account
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-6">
                  <h2 className="text-[18px] font-bold text-slate-900 mb-2">Assign Funded Account</h2>
                  <p className="text-[13px] text-slate-500 mb-6">Assign MT5 credentials to <strong className="text-amber-700">{pendingUsers.find(u => u.id === selectedId)?.name}</strong> for their <strong>{pendingUsers.find(u => u.id === selectedId)?.packageName}</strong> package.</p>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">MT5 Account Number *</label>
                      <input type="text" value={assignForm.accountNumber} onChange={e => setAssignForm(f => ({...f, accountNumber: e.target.value}))} className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-mono outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. 5500123" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">Master Password *</label>
                      <input type="text" value={assignForm.password} onChange={e => setAssignForm(f => ({...f, password: e.target.value}))} className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-mono outline-none focus:ring-2 focus:ring-amber-500" placeholder="e.g. K9#mP2xL" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">Broker Server</label>
                      <input type="text" value={assignForm.brokerServer} onChange={e => setAssignForm(f => ({...f, brokerServer: e.target.value}))} className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-mono outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-slate-600 uppercase">Initial Balance (USD) *</label>
                      <input type="number" value={assignForm.balance} onChange={e => setAssignForm(f => ({...f, balance: e.target.value}))} className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-mono outline-none focus:ring-2 focus:ring-amber-500" />
                    </div>
                  </div>
                  
                  {assignError && <div className="mt-4 px-3 py-2.5 rounded-xl bg-red-50 text-red-700 text-[12px] font-semibold">{assignError}</div>}
                  
                  <button onClick={handleAssign} disabled={isAssigning} className="mt-6 w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[14px] font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                    {isAssigning ? <span className="material-symbols-outlined animate-spin">refresh</span> : <span className="material-symbols-outlined">how_to_reg</span>}
                    {isAssigning ? 'Assigning...' : 'Assign Account & Generate Email'}
                  </button>
                </div>
              )
            ) : (
            !selectedAccount ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center text-slate-500">
                Select an account to view details
              </div>
            ) : (
              <>
            {/* ── Account Summary Header ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full ${selectedAccount.color} flex items-center justify-center font-bold text-[15px]`}>
                    {selectedAccount.initials}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-[18px] font-bold text-slate-900">{selectedAccount.name}</h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${selectedAccount.tierColor}`}>{selectedAccount.tier}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        selectedAccount.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        selectedAccount.status === 'Demo' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-red-50 text-red-700 border-red-200'
                      }`}>{selectedAccount.status}</span>
                    </div>
                    <p className="text-[12px] text-slate-500 font-mono mt-0.5">{selectedAccount.mt5}</p>
                  </div>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Account Balance', value: `$${formatMoney(selectedAccount.balance)}`, sub: 'USD', color: 'text-slate-900' },
                  { label: 'Account Equity', value: `$${formatMoney(selectedAccount.equity)}`, sub: 'USD', color: 'text-slate-900' },
                  { label: 'Total P&L (Injected)', value: `${totalProfit >= 0 ? '+' : ''}$${formatMoney(totalProfit)}`, sub: `${selectedAccount.trades.length} trades`, color: totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600' },
                  { label: 'Win Rate', value: `${winRate}%`, sub: `${winTrades}/${selectedAccount.trades.length} wins`, color: winRate >= 50 ? 'text-emerald-600' : 'text-red-600' },
                ].map((stat) => (
                  <div key={stat.label} className="bg-[#F8FAFC] rounded-xl p-3 flex flex-col gap-0.5 border border-slate-100">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <span className={`text-[18px] font-bold ${stat.color} tabular-nums leading-tight`}>{stat.value}</span>
                    <span className="text-[10px] text-slate-400">{stat.sub}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Trade Injector Form ── */}
            <div className="bg-white rounded-2xl border border-[#1D4ED8]/20 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">add_chart</span>
                </div>
                <div>
                  <h3 className="text-[15px] font-bold text-slate-900">Inject Trade</h3>
                  <p className="text-[11px] text-slate-500">Manually inject a closed trade into <span className="font-bold text-[#1D4ED8]">{selectedAccount.name}&apos;s</span> account history</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100">
                  <span className="material-symbols-outlined text-[14px] text-amber-600">admin_panel_settings</span>
                  <span className="text-[10px] font-bold text-amber-700">ADMIN ONLY</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Symbol */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Symbol *</label>
                  <select
                    value={form.symbol}
                    onChange={(e) => setForm((f) => ({ ...f, symbol: e.target.value }))}
                    className="px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none cursor-pointer"
                  >
                    {SYMBOLS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </div>

                {/* Order Type */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Order Type *</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: 'BUY' }))}
                      className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                        form.type === 'BUY'
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50 hover:border-emerald-200'
                      }`}
                    >
                      ▲ BUY
                    </button>
                    <button
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, type: 'SELL' }))}
                      className={`py-2.5 rounded-xl text-[13px] font-bold border transition-all ${
                        form.type === 'SELL'
                          ? 'bg-red-500 text-white border-red-500 shadow-sm'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50 hover:border-red-200'
                      }`}
                    >
                      ▼ SELL
                    </button>
                  </div>
                </div>

                {/* Lot Size */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Lot Size *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={form.lots}
                      onChange={(e) => setForm((f) => ({ ...f, lots: e.target.value }))}
                      step="0.01" min="0.01"
                      placeholder="e.g. 0.10"
                      className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-mono outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                    <span className="absolute right-3 top-2.5 text-[10px] font-bold text-slate-400">LOT</span>
                  </div>
                </div>

                {/* Open Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Open Price *</label>
                  <input
                    type="number"
                    value={form.openPrice}
                    onChange={(e) => setForm((f) => ({ ...f, openPrice: e.target.value }))}
                    step="0.00001"
                    placeholder={form.symbol === 'XAUUSD' ? '2318.45' : '1.09210'}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-mono outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Close Price */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Close Price *</label>
                  <input
                    type="number"
                    value={form.closePrice}
                    onChange={(e) => setForm((f) => ({ ...f, closePrice: e.target.value }))}
                    step="0.00001"
                    placeholder={form.symbol === 'XAUUSD' ? '2331.90' : '1.09450'}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-800 text-[13px] font-mono outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Live P&L Preview */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Live P&L Preview</label>
                  <div className={`px-3 py-2.5 rounded-xl border text-[13px] font-bold font-mono flex items-center gap-2 ${
                    preview === null ? 'bg-slate-50 border-slate-200 text-slate-400' :
                    preview.profit >= 0 ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                    'bg-red-50 border-red-200 text-red-700'
                  }`}>
                    {preview === null ? (
                      <span className="text-slate-400 font-normal">Enter prices to preview</span>
                    ) : (
                      <>
                        <span className="material-symbols-outlined text-[16px]">
                          {preview.profit >= 0 ? 'trending_up' : 'trending_down'}
                        </span>
                        <span>{preview.profit >= 0 ? '+' : ''}${formatMoney(preview.profit)}</span>
                        <span className="text-[11px] font-normal opacity-70">({preview.pips >= 0 ? '+' : ''}{preview.pips} pips)</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Open Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Open Time *</label>
                  <input
                    type="datetime-local"
                    value={form.openTime}
                    onChange={(e) => setForm((f) => ({ ...f, openTime: e.target.value.replace('T', ' ') + ':00' }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-[12px] outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Close Time */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Close Time *</label>
                  <input
                    type="datetime-local"
                    value={form.closeTime}
                    onChange={(e) => setForm((f) => ({ ...f, closeTime: e.target.value.replace('T', ' ') + ':00' }))}
                    className="w-full px-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-[12px] outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                {/* Inject Button */}
                <div className="flex flex-col gap-1.5 justify-end">
                  <button
                    type="button"
                    onClick={handleInject}
                    disabled={isInjecting}
                    className="w-full py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {isInjecting ? (
                      <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
                    ) : (
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    )}
                    {isInjecting ? 'Injecting...' : 'Inject Trade'}
                  </button>
                </div>
              </div>

              {formError && (
                <div className="mt-3 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-[12px] font-semibold flex items-center gap-2">
                  <span className="material-symbols-outlined text-[16px]">error</span>
                  {formError}
                </div>
              )}
            </div>

            {/* ── Injected Trade History ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">history</span>
                  <h3 className="text-[15px] font-bold text-slate-900">Injected Trade History</h3>
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
                    {selectedAccount.trades.length} Records
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 font-mono">Account: {selectedAccount.mt5}</span>
              </div>

              {selectedAccount.trades.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <span className="material-symbols-outlined text-[48px]">receipt_long</span>
                  <p className="text-[14px] font-semibold">No trades injected yet</p>
                  <p className="text-[12px]">Use the form above to inject the first trade into this account.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[12px]">
                    <thead>
                      <tr className="border-b border-slate-100 text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                        <th className="pb-2.5 pr-4">Ticket</th>
                        <th className="pb-2.5 pr-4">Symbol</th>
                        <th className="pb-2.5 pr-4">Type</th>
                        <th className="pb-2.5 pr-4">Lots</th>
                        <th className="pb-2.5 pr-4">Open Price</th>
                        <th className="pb-2.5 pr-4">Close Price</th>
                        <th className="pb-2.5 pr-4">Open Time</th>
                        <th className="pb-2.5 pr-4">Close Time</th>
                        <th className="pb-2.5 pr-4">Pips</th>
                        <th className="pb-2.5 pr-4">Profit</th>
                        <th className="pb-2.5 pr-2">Injected</th>
                        <th className="pb-2.5 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {selectedAccount.trades.map((trade) => (
                        <tr key={trade.ticket} className="hover:bg-slate-50 transition-colors group">
                          <td className="py-3 pr-4">
                            <span className="font-mono text-slate-500 text-[11px]">#{trade.ticket}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-bold text-slate-900 text-[12px]">{trade.symbol}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold ${
                              trade.type === 'BUY'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                : 'bg-red-100 text-red-700 border border-red-200'
                            }`}>
                              {trade.type === 'BUY' ? '▲' : '▼'} {trade.type}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-mono font-semibold text-slate-700">{trade.lots.toFixed(2)}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-mono text-slate-600 text-[11px]">{trade.openPrice}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className="font-mono text-slate-600 text-[11px]">{trade.closePrice}</span>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col">
                              <span className="text-slate-700 text-[11px] font-medium">{trade.openTime.split(' ')[0]}</span>
                              <span className="text-slate-400 text-[10px] font-mono">{trade.openTime.split(' ')[1]}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <div className="flex flex-col">
                              <span className="text-slate-700 text-[11px] font-medium">{trade.closeTime.split(' ')[0]}</span>
                              <span className="text-slate-400 text-[10px] font-mono">{trade.closeTime.split(' ')[1]}</span>
                            </div>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`font-mono font-bold text-[12px] ${trade.pips >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {trade.pips >= 0 ? '+' : ''}{trade.pips}
                            </span>
                          </td>
                          <td className="py-3 pr-4">
                            <span className={`font-bold text-[13px] font-mono tabular-nums ${trade.profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {trade.profit >= 0 ? '+' : ''}${formatMoney(trade.profit)}
                            </span>
                          </td>
                          <td className="py-3 pr-2">
                            <div className="flex flex-col">
                              <span className="text-slate-400 text-[9px] font-mono">{trade.injectedAt.split(' ')[0]}</span>
                              <span className="text-slate-400 text-[9px] font-mono">{trade.injectedAt.split(' ')[1]}</span>
                            </div>
                          </td>
                          <td className="py-3 text-right">
                            <button
                              onClick={() => deleteTrade(selectedAccount.id, trade.ticket)}
                              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-all"
                              title="Remove trade"
                            >
                              <span className="material-symbols-outlined text-[15px]">delete</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    {/* Totals Row */}
                    <tfoot>
                      <tr className="border-t-2 border-slate-200">
                        <td colSpan={9} className="pt-3 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                          Total ({selectedAccount.trades.length} trades)
                        </td>
                        <td className="pt-3">
                          <span className={`font-bold text-[14px] font-mono tabular-nums ${totalProfit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                            {totalProfit >= 0 ? '+' : ''}${formatMoney(totalProfit)}
                          </span>
                        </td>
                        <td colSpan={2}></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
            </>
            )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
