'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function TradingHubPage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const router = useRouter()
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Payout Modal State
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState<number | string>('')
  const [payoutLoading, setPayoutLoading] = useState(false)
  const [payoutError, setPayoutError] = useState('')
  const [payoutSuccess, setPayoutSuccess] = useState('')

  // We need an account_id to payout. Simulating one for now.
  const account = profile?.trading_account;
  const activeAccountId = account?.id || null;
  // Profit limit is whatever is in the balance. In a real firm, it's balance minus initial balance.
  // Since we don't have initial_balance tracked, we allow them to withdraw up to their current balance.
  const mockAvailableProfit = account ? parseFloat(account.balance) : 0;

  useEffect(() => {
    Promise.all([
      fetch('/api/user/profile').then(res => res.json()),
      fetch('/api/wallet/transactions?type=TRADING_INCOME').then(res => res.json())
    ])
      .then(([profileData, txData]) => {
        
        setTransactions(txData.transactions || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch trading data', err)
        setLoading(false)
      })
  }, [])

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Logout failed')
    }
  }

  const handleClaimProfit = async () => {
    const numAmount = Number(payoutAmount)
    if (!numAmount || numAmount <= 0) {
      setPayoutError('Please enter a valid amount')
      return
    }
    if (numAmount > mockAvailableProfit) {
      setPayoutError('Cannot exceed available profit')
      return
    }

    setPayoutLoading(true)
    setPayoutError('')
    setPayoutSuccess('')

    try {
      if (!activeAccountId) {
        setPayoutError('No active funded account assigned.');
        setPayoutLoading(false);
        return;
      }
      const res = await fetch('/api/terminal/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account_id: activeAccountId, gross_profit_usd: numAmount })
      })
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to process payout')
      
      setPayoutSuccess('Profit successfully claimed! Distribution applied.')
      setTimeout(() => {
        setShowPayoutModal(false)
        setPayoutSuccess('')
        setPayoutAmount('')
      }, 2000)
    } catch (err: any) {
      setPayoutError(err.message)
    } finally {
      setPayoutLoading(false)
    }
  }

  // Calculate funded account size based on active package (fallback to none)
  let fundedSizeStr = 'No Active Account'
  let phaseStatus = 'Not Started'
  let winRate = '0%';
  let maxDrawdown = '$0.00';
  
  if (profile?.trading_account) {
    fundedSizeStr = '$' + Number(profile.trading_account.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })
    phaseStatus = 'FUNDED'
    if (profile.trading_account.drawdown) maxDrawdown = profile.trading_account.drawdown + '%';
  } else if (profile?.package_id) {
    fundedSizeStr = 'Pending Assignment'
    phaseStatus = 'EVAL 1'
  }

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md">
              <div className="space-y-1">
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Trading Hub</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl">Manage your funded accounts and track performance</p>
              </div>
            </div>

        {/* Funded Account Card (Premium Design) */}
        <div className="glass-card glow-primary" style={{ marginBottom: '2rem', background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)', border: '1px solid rgba(168, 85, 247, 0.3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📈</span> Simulated Trading Terminal
              </h3>
              <p style={{ color: 'var(--text-muted)' }}>Your trading journey phase and account status</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Account Size</div>
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-light)' }}>{fundedSizeStr}</div>
            </div>
          </div>

          {/* Phase Progress Bar */}
          <div style={{ marginTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem', fontWeight: 'bold' }}>
              <span style={{ color: phaseStatus === 'EVAL 1' ? 'var(--primary)' : 'var(--text-muted)' }}>EVAL 1</span>
              <span style={{ color: phaseStatus === 'EVAL 2' ? 'var(--primary)' : 'var(--text-muted)' }}>EVAL 2</span>
              <span style={{ color: phaseStatus === 'FUNDED' ? 'var(--text-success)' : 'var(--text-muted)' }}>FUNDED</span>
            </div>
            <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden', display: 'flex' }}>
              <div style={{ width: '33%', background: phaseStatus === 'EVAL 1' ? 'var(--primary)' : phaseStatus === 'EVAL 2' || phaseStatus === 'FUNDED' ? 'var(--primary)' : 'transparent' }}></div>
              <div style={{ width: '33%', background: phaseStatus === 'EVAL 2' ? 'var(--primary)' : phaseStatus === 'FUNDED' ? 'var(--primary)' : 'transparent' }}></div>
              <div style={{ width: '34%', background: phaseStatus === 'FUNDED' ? 'var(--text-success)' : 'transparent' }}></div>
            </div>
          </div>
        </div>

        {/* Trading Stats Cards */}
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div className="balance-title">Available Profit</div>
              <div className="balance-value" style={{ color: 'var(--text-success)', fontSize: '1.5rem', fontWeight: 'bold' }}>
                ${mockAvailableProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <button 
              onClick={() => setShowPayoutModal(true)}
              className="mt-4 py-2 px-4 rounded-lg bg-primary hover:bg-secondary text-white font-bold transition-colors w-full flex items-center justify-center gap-2"
            >
              <span>Claim Profit</span>
            </button>
          </div>
          <div className="glass-card">
            <div className="balance-title">Account Balance</div>
            <div className="balance-value" style={{ color: 'var(--text-light)', fontSize: '1.5rem', fontWeight: 'bold' }}>{fundedSizeStr === 'No Active Account' ? '$0.00' : fundedSizeStr}</div>
          </div>
          <div className="glass-card">
            <div className="balance-title">Profit Factor</div>
            <div className="balance-value" style={{ color: 'var(--text-light)', fontSize: '1.5rem', fontWeight: 'bold' }}>0.0</div>
          </div>
          <div className="glass-card">
            <div className="balance-title">Win Rate</div>
            <div className="balance-value" style={{ color: 'var(--text-light)', fontSize: '1.5rem', fontWeight: 'bold' }}>{winRate}</div>
          </div>
          <div className="glass-card">
            <div className="balance-title">Max Drawdown</div>
            <div className="balance-value" style={{ color: 'var(--text-light)', fontSize: '1.5rem', fontWeight: 'bold' }}>{maxDrawdown}</div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
          {/* Payout Distribution Visual */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1.5rem' }}>Payout Distribution</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Trader (You)</span>
                  <strong>70%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ width: '70%', height: '100%', background: 'var(--primary)', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Sponsor Pool</span>
                  <strong>15%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ width: '15%', height: '100%', background: '#a855f7', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Leadership Pool</span>
                  <strong>5%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ width: '5%', height: '100%', background: '#f59e0b', borderRadius: '4px' }}></div>
                </div>
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                  <span>Company</span>
                  <strong>10%</strong>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                  <div style={{ width: '10%', height: '100%', background: '#3b82f6', borderRadius: '4px' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Payouts Table */}
          <div className="glass-card">
            <h3 style={{ marginBottom: '1rem' }}>Recent Trading Payouts</h3>
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
            ) : (
              <div className="custom-table-container">
                <table className="custom-table">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Description</th>
                      <th>Amount (INR)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.length > 0 ? (
                      transactions.map(tx => (
                        <tr key={tx.id}>
                          <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td>{tx.description}</td>
                          <td style={{ color: 'var(--text-success)', fontWeight: 'bold' }}>+₹{(tx.amount_paise / 100).toLocaleString()}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No trading payouts yet.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Education Resources */}
        <h3 style={{ marginBottom: '1rem', marginTop: '2rem' }}>Education Resources</h3>
        <div className="dashboard-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="glass-card cursor-pointer hover:bg-white/5 transition-colors" style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>📚</div>
            <h4>Trading Fundamentals</h4>
          </div>
          <div className="glass-card cursor-pointer hover:bg-white/5 transition-colors" style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🛡️</div>
            <h4>Risk Management</h4>
          </div>
          <div className="glass-card cursor-pointer hover:bg-white/5 transition-colors" style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>📊</div>
            <h4>Technical Analysis</h4>
          </div>
          <div className="glass-card cursor-pointer hover:bg-white/5 transition-colors" style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2.5rem' }}>🧠</div>
            <h4>Trading Psychology</h4>
          </div>
        </div>
          </div>
        </main>
      </div>

      {/* Claim Profit Modal */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-surface border border-outline-variant/30 rounded-2xl p-6 w-full max-w-md shadow-2xl relative">
            <button 
              onClick={() => setShowPayoutModal(false)}
              className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            
            <h2 className="font-headline-md text-headline-md font-bold mb-2">Claim Trading Profit</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">
              Enter the amount of profit you want to withdraw. Many traders choose to keep some profit in their account to act as a buffer against drawdown limits.
            </p>

            <div className="bg-surface-container-low rounded-xl p-4 mb-6 flex items-center justify-between">
              <span className="font-label-md text-label-md font-semibold text-on-surface-variant">Available Buffer</span>
              <span className="font-headline-md text-headline-md font-bold text-success">${mockAvailableProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>

            <div className="mb-6">
              <label className="block font-label-md text-label-md font-semibold text-on-surface mb-2">Amount to Claim (USD)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-headline-md text-headline-md font-bold text-on-surface">$</span>
                <input 
                  type="number"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="e.g. 50"
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface-container-lowest border border-outline/30 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary font-headline-md text-headline-md font-bold text-on-surface"
                />
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={() => setPayoutAmount(50)} className="px-3 py-1 text-sm bg-surface-container rounded-lg hover:bg-surface-variant font-semibold">+ $50</button>
                <button onClick={() => setPayoutAmount(100)} className="px-3 py-1 text-sm bg-surface-container rounded-lg hover:bg-surface-variant font-semibold">+ $100</button>
                <button onClick={() => setPayoutAmount(mockAvailableProfit)} className="px-3 py-1 text-sm bg-surface-container rounded-lg hover:bg-surface-variant font-semibold">Max</button>
              </div>
            </div>

            {payoutError && <div className="text-error font-semibold text-sm mb-4">{payoutError}</div>}
            {payoutSuccess && <div className="text-emerald-500 font-semibold text-sm mb-4">{payoutSuccess}</div>}

            <button
              onClick={handleClaimProfit}
              disabled={payoutLoading}
              className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 ${payoutLoading ? 'bg-surface-variant text-on-surface-variant cursor-not-allowed' : 'bg-primary text-white hover:bg-secondary'}`}
            >
              {payoutLoading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">refresh</span>
                  Processing...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">payments</span>
                  Submit Claim Request
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
