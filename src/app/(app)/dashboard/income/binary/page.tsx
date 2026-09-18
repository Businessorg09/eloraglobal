'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

export default function BinaryIncomePage() {
  const { profile, rank, wallet, loading: contextLoading } = useDashboardContext();

  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/user/binary-history')
      .then(res => res.json())
      .then(data => {
        setHistory(data.history || [])
        setLoading(false)
      })
      .catch(err => {
        console.error('Failed to fetch binary history', err)
        setLoading(false)
      })
  }, [])

  const totalEarned = wallet?.balances?.binaryIncome || 0

  return (
    <div>
      {/* Summary Stats */}
      <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
        <div className="glass-card glow-primary">
          <div className="balance-title">Total Binary Earned</div>
          <div className="balance-value" style={{ color: 'var(--text-success)' }}>₹{totalEarned.toLocaleString('en-IN')}</div>
        </div>
        <div className="glass-card">
          <div className="balance-title">Current Rank Limit</div>
          <div className="balance-value">₹{((rank?.weekly_binary_cap_paise || 2500000) / 100).toLocaleString('en-IN')} / wk</div>
        </div>
        <div className="glass-card">
          <div className="balance-title">Cycle Progress</div>
          <div className="balance-value" style={{ fontSize: '1.25rem', marginTop: '0.5rem' }}>Active ⚡</div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Working towards 5x limit</div>
        </div>
      </div>

      {/* History Table */}
      <div className="glass-card" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ padding: '1.5rem 1.5rem 0.5rem 1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.25rem' }}>Binary Payout Audit Ledger</h3>
          <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Detailed breakdown of your pair matches, BV consumption, and carry-forward balances.</p>
        </div>
        
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading ledger...</div>
        ) : (
          <div className="custom-table-container">
            <table className="custom-table" style={{ minWidth: '1000px' }}>
              <thead style={{ background: 'var(--bg-glass)' }}>
                <tr>
                  <th>Settlement Date</th>
                  <th>BV Before Match<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Left / Right)</span></th>
                  <th>Matched Pairs</th>
                  <th>Gross Income<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(₹800 / pair)</span></th>
                  <th>Capping / Limits</th>
                  <th>Net Earned</th>
                  <th>BV Carried Forward<br/><span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>(Left / Right)</span></th>
                </tr>
              </thead>
              <tbody>
                {history.length > 0 ? (
                  history.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(tx.created_at).toLocaleDateString()}</td>
                      <td style={{ fontFamily: 'monospace' }}>
                        <span style={{ color: 'var(--primary)' }}>{tx.left_bv_before}</span> / <span style={{ color: 'var(--secondary)' }}>{tx.right_bv_before}</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 'bold' }}>{Math.floor(tx.matched_bv / 100)} pairs</span>
                          <span style={{ fontSize: '0.75rem', background: 'var(--bg-glass)', padding: '2px 6px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                            {tx.matched_bv} BV matched
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>₹{tx.raw_income_inr.toLocaleString('en-IN')}</td>
                      <td>
                        {tx.raw_income_inr > tx.final_income_inr ? (
                          <span style={{ color: '#cd7f32', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            {tx.raw_income_inr > tx.capped_income_inr ? `Weekly Cap Hit (₹${tx.weekly_cap_at_time_inr?.toLocaleString('en-IN')})` : '5x Cycle Limit Hit'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-success)', fontSize: '0.8rem' }}>None</span>
                        )}
                      </td>
                      <td style={{ color: 'var(--text-success)', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{tx.final_income_inr.toLocaleString('en-IN')}</td>
                      <td style={{ fontFamily: 'monospace' }}>
                        <span style={{ color: 'var(--primary)' }}>{tx.left_bv_carryover}</span> / <span style={{ color: 'var(--secondary)' }}>{tx.right_bv_carryover}</span>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          -{tx.left_bv_consumed} BV Consumed
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>📊</span>
                      No binary matching records found.<br/>
                      Build your left and right teams to start earning pair matching bonuses!
                    </td>
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
