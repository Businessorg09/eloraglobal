'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'


export default function SponsorIncomePage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wallet/transactions?type=SPONSOR_INCOME')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch sponsor income', err)
        setLoading(false)
      })
  }, [])

  const totalEarned = wallet?.balances?.sponsorIncome || 0
  
  // Dummy breakdown table by sponsor level (L1-L10)
  const levels = [
    { level: 1, share: '30%', earned: 0 },
    { level: 2, share: '20%', earned: 0 },
    { level: 3, share: '10%', earned: 0 },
    { level: 4, share: '10%', earned: 0 },
    { level: 5, share: '10%', earned: 0 },
    { level: 6, share: '5%', earned: 0 },
    { level: 7, share: '5%', earned: 0 },
    { level: 8, share: '4%', earned: 0 },
    { level: 9, share: '3%', earned: 0 },
    { level: 10, share: '3%', earned: 0 },
  ]
  


  return (
    <div>
      {/* Summary Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card glow-primary">
          <div className="balance-title">Total Sponsor Income</div>
          <div className="balance-value" style={{ color: 'var(--text-success)' }}>₹{totalEarned.toLocaleString()}</div>
        </div>
        <div className="glass-card">
          <div className="balance-title">Top Earning Level</div>
          <div className="balance-value">Level 1</div>
        </div>
        
        {/* Info Card */}
        <div className="glass-card" style={{ gridColumn: 'span 2' }}>
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>📉</span> Dynamic Split Percentages</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            When a trader in your unilevel network makes a withdrawal, 15% of the profit goes into the Sponsor Pool. 
            This pool is then divided across 10 upline sponsor levels. Closer generations yield higher percentages (e.g., L1=30%, L2=20%, down to L10=3%).
          </p>
        </div>
      </div>

      <div className="dashboard-grid" style={{ gridTemplateColumns: '1fr 2fr', gap: '2rem', marginBottom: '2rem' }}>
        {/* Breakdown Table */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Level Breakdown</h3>
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Level</th>
                  <th>Share %</th>
                  <th>Total Earned</th>
                </tr>
              </thead>
              <tbody>
                {levels.map((l) => (
                  <tr key={l.level}>
                    <td>L{l.level}</td>
                    <td>{l.share}</td>
                    <td style={{ color: l.earned > 0 ? 'var(--text-success)' : 'inherit' }}>₹{l.earned.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* History Table */}
        <div className="glass-card">
          <h3 style={{ marginBottom: '1rem' }}>Recent Sponsor Income</h3>
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
          ) : (
            <div className="custom-table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Trader Info</th>
                    <th>Level</th>
                    <th>Amount Credited</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.length > 0 ? (
                    transactions.map(tx => (
                      <tr key={tx.id}>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                        <td>{tx.description}</td>
                        <td>-</td>
                        <td style={{ color: 'var(--text-success)', fontWeight: 'bold' }}>+₹{tx.amount_inr.toLocaleString()}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No sponsor income records found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
