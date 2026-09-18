'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'


export default function TradingIncomePage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [transactions, setTransactions] = useState<any[]>([])
  const [payoutCount, setPayoutCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wallet/transactions?type=TRADING_INCOME')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || [])
        setPayoutCount(data.total || 0)
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch trading income', err)
        setLoading(false)
      })
  }, [])

  const totalEarned = wallet?.balances?.tradingIncome || 0

  return (
    <div>
      {/* Summary Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card glow-primary">
          <div className="balance-title">Total Trading Income</div>
          <div className="balance-value" style={{ color: 'var(--text-success)' }}>₹{totalEarned.toLocaleString()}</div>
        </div>
        <div className="glass-card">
          <div className="balance-title">Payouts Received</div>
          <div className="balance-value">{payoutCount}</div>
        </div>
        
        {/* Info Card: Trading Payout Distribution */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h4 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>🥧</span> Profit Distribution Breakdown</h4>
          <div style={{ height: '30px', display: 'flex', borderRadius: '15px', overflow: 'hidden', marginBottom: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ width: '70%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }} title="Trader (70%)">70% Trader</div>
            <div style={{ width: '15%', background: '#a855f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }} title="Sponsor Pool (15%)">15% Sponsor</div>
            <div style={{ width: '5%', background: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 'bold' }} title="Leadership Pool (5%)">5% Lead</div>
            <div style={{ width: '10%', background: '#3b82f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 'bold' }} title="Company (10%)">10% TDPF</div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: 'var(--primary)', borderRadius: '50%' }}></div> You (Trader)</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: '#a855f7', borderRadius: '50%' }}></div> Sponsor</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: '#f59e0b', borderRadius: '50%' }}></div> Leadership</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}><div style={{ width: '10px', height: '10px', background: '#3b82f6', borderRadius: '50%' }}></div> Company</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Trading Payout History</h3>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Description</th>
                  <th>Amount Credited (INR)</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length > 0 ? (
                  transactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td>{tx.description}</td>
                      <td style={{ color: 'var(--text-success)', fontWeight: 'bold' }}>+₹{tx.amount_inr.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No trading income records found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
