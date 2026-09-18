'use client'

import React, { useState, useEffect } from 'react';

export default function AdminTerminalPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State for Account Assignment
  const [accNumber, setAccNumber] = useState('');
  const [accPassword, setAccPassword] = useState('');
  const [brokerServer, setBrokerServer] = useState('Elora-Live-01');
  const [accBalance, setAccBalance] = useState('');

  // Form State for Trade Injection
  const [tradeSymbol, setTradeSymbol] = useState('XAUUSD');
  const [tradeDirection, setTradeDirection] = useState('BUY');
  const [tradeLots, setTradeLots] = useState('');
  const [tradeOpen, setTradeOpen] = useState('');
  const [tradeClose, setTradeClose] = useState('');
  const [tradePnl, setTradePnl] = useState('');
  const [tradeStatus, setTradeStatus] = useState('CLOSED');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/trading/accounts');
      const data = await res.json();
      if (data.users) {
        // Sort accounts for each user so account[0] is always the latest
        const processedUsers = data.users.map((u: any) => {
          if (u.account && u.account.length > 0) {
            u.account.sort((a: any, b: any) => new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime());
          }
          return u;
        });
        setUsers(processedUsers);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    if (user.account && user.account.length > 0) {
      const acc = user.account[0];
      setAccNumber(acc.account_number);
      setAccPassword(acc.password);
      setBrokerServer(acc.broker_server);
      setAccBalance(acc.balance.toString());
    } else {
      setAccNumber(`ELR-${Math.floor(Math.random() * 90000) + 10000}`);
      setAccPassword(Math.random().toString(36).slice(-8));
      setBrokerServer('Elora-Live-01');
      setAccBalance('10000');
    }
  };

  const handleAssignAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/trading/accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: selectedUser.id,
          account_number: accNumber,
          password: accPassword,
          broker_server: brokerServer,
          balance: accBalance
        })
      });
      if (res.ok) {
        alert('Account assigned successfully!');
        fetchUsers();
      } else {
        alert('Failed to assign account');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInjectTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !selectedUser.account || selectedUser.account.length === 0) {
      alert("Please assign a trading account first.");
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/admin/trading/inject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: selectedUser.account[0].id,
          user_id: selectedUser.id,
          symbol: tradeSymbol,
          direction: tradeDirection,
          lot_size: tradeLots,
          open_price: tradeOpen,
          close_price: tradeClose || null,
          open_time: new Date().toISOString(),
          close_time: tradeStatus === 'CLOSED' ? new Date().toISOString() : null,
          pnl: tradePnl,
          status: tradeStatus
        })
      });
      if (res.ok) {
        alert('Trade injected successfully!');
        setTradeLots('');
        setTradeOpen('');
        setTradeClose('');
        setTradePnl('');
      } else {
        alert('Failed to inject trade');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col gap-8">
      <div className="flex flex-col">
        <h1 className="text-3xl font-bold text-gray-900">Broker Terminal Console</h1>
        <p className="text-gray-500">Assign prop accounts and inject simulated trades directly into user dashboards.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* User Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full max-h-[800px] overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 mb-4">1. Select User</h2>
          {isLoading ? (
            <p className="text-gray-500">Loading users...</p>
          ) : (
            <div className="flex flex-col gap-2">
              {users.map(u => {
                const hasAccount = u.account && u.account.length > 0;
                return (
                  <button 
                    key={u.id} 
                    onClick={() => handleSelectUser(u)}
                    className={`flex flex-col p-3 rounded-lg border text-left transition-colors ${selectedUser?.id === u.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <span className="font-bold text-gray-900 text-sm">{u.full_name}</span>
                    <span className="text-xs text-gray-500 mb-1">{u.email}</span>
                    {hasAccount ? (
                      <span className="text-[10px] font-bold uppercase text-green-600 bg-green-100 px-2 py-0.5 rounded w-max">Acc: {u.account[0].account_number}</span>
                    ) : (
                      <span className="text-[10px] font-bold uppercase text-red-600 bg-red-100 px-2 py-0.5 rounded w-max">No Account</span>
                    )}
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* Account & Trade Management */}
        {selectedUser ? (
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Account Assignment Form */}
            <form onSubmit={handleAssignAccount} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4">2. Manage Prop Account</h2>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Account Number</label>
                  <input type="text" value={accNumber} onChange={e => setAccNumber(e.target.value)} required className="p-2 border rounded bg-gray-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Password</label>
                  <input type="text" value={accPassword} onChange={e => setAccPassword(e.target.value)} required className="p-2 border rounded bg-gray-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Broker Server</label>
                  <input type="text" value={brokerServer} onChange={e => setBrokerServer(e.target.value)} required className="p-2 border rounded bg-gray-50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Starting Balance ($)</label>
                  <input type="number" step="0.01" value={accBalance} onChange={e => setAccBalance(e.target.value)} required className="p-2 border rounded bg-gray-50" />
                </div>
              </div>
              <button disabled={isSubmitting} type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg transition-colors">
                {isSubmitting ? 'Saving...' : 'Save Account Credentials'}
              </button>
            </form>

            {/* Trade Injector Form */}
            <form onSubmit={handleInjectTrade} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-green-100 to-transparent rounded-bl-full pointer-events-none opacity-50"></div>
              
              <h2 className="text-lg font-bold text-gray-900 mb-1">3. Inject Simulated Trade</h2>
              <p className="text-xs text-gray-500 mb-4">Push a fake trade directly into {selectedUser.full_name}&apos;s dashboard ledger.</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Symbol</label>
                  <input type="text" value={tradeSymbol} onChange={e => setTradeSymbol(e.target.value.toUpperCase())} required className="p-2 border rounded font-mono" placeholder="XAUUSD" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Direction</label>
                  <select value={tradeDirection} onChange={e => setTradeDirection(e.target.value)} className="p-2 border rounded font-bold">
                    <option value="BUY">BUY (Long)</option>
                    <option value="SELL">SELL (Short)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Lot Size</label>
                  <input type="number" step="0.01" value={tradeLots} onChange={e => setTradeLots(e.target.value)} required className="p-2 border rounded" placeholder="1.00" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Open Price</label>
                  <input type="number" step="0.00001" value={tradeOpen} onChange={e => setTradeOpen(e.target.value)} required className="p-2 border rounded font-mono" placeholder="1920.50" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Close Price</label>
                  <input type="number" step="0.00001" value={tradeClose} onChange={e => setTradeClose(e.target.value)} className="p-2 border rounded font-mono" placeholder="Optional if open" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Trade Status</label>
                  <select value={tradeStatus} onChange={e => setTradeStatus(e.target.value)} className="p-2 border rounded font-bold">
                    <option value="CLOSED">CLOSED (Realized)</option>
                    <option value="OPEN">OPEN (Floating)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-bold text-gray-700 uppercase">Total PnL ($)</label>
                  <input type="number" step="0.01" value={tradePnl} onChange={e => setTradePnl(e.target.value)} required className={`p-2 border rounded font-bold ${parseFloat(tradePnl) >= 0 ? 'text-green-600' : 'text-red-600'}`} placeholder="e.g. 150.00 or -50.00" />
                </div>
              </div>

              <button disabled={isSubmitting || !selectedUser.account || selectedUser.account.length === 0} type="submit" className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                <span className="material-symbols-outlined">rocket_launch</span> Inject Trade to Dashboard
              </button>
              {(!selectedUser.account || selectedUser.account.length === 0) && (
                <p className="text-red-500 text-xs text-center mt-2 font-bold">You must assign an account before injecting trades.</p>
              )}
            </form>

          </div>
        ) : (
          <div className="lg:col-span-2 bg-gray-50 rounded-xl border border-dashed border-gray-300 flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl text-gray-400 mb-2">mouse</span>
              <p className="text-gray-500 font-medium">Select a user to manage their terminal.</p>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
