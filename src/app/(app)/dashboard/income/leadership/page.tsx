'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'


export default function LeadershipIncomePage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/wallet/transactions?type=LEADERSHIP_INCOME')
      .then(res => res.json())
      .then(data => {
        setTransactions(data.transactions || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch leadership income', err)
        setLoading(false)
      })
  }, [])

  const totalEarned = wallet?.balances?.leadershipIncome || 0

  return (
    <div>
      {/* Summary Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem', gridTemplateColumns: '1fr 1fr 2fr' }}>
        <div className="glass-card glow-primary">
          <div className="balance-title">Total Leadership Income</div>
          <div className="balance-value" style={{ color: 'var(--text-success)' }}>₹{totalEarned.toLocaleString()}</div>
        </div>
        <div className="glass-card">
          <div className="balance-title">Deepest Level Reached</div>
          <div className="balance-value">Level 0</div>
        </div>
        
        {/* Info Card */}
        <div className="glass-card">
          <h4 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><span>👑</span> Equal 20-Level Distribution</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            The Leadership Pool receives 5% of total trading payouts. Unlike the Sponsor Pool, this amount is distributed equally across 20 upline levels.
            This equates to exactly 0.25% of the gross profit payout per level!
          </p>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card">
        <h3 style={{ marginBottom: '1rem' }}>Leadership Pool History</h3>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading...</div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Source (Upline Level / Info)</th>
                  <th>Amount Credited</th>
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
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>No leadership income records found.</td>
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
