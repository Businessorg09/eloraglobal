'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import { useRouter } from 'next/navigation'
import DesktopDashboard from '@/components/dashboard/DesktopDashboard'
import MobileDashboard from '@/components/dashboard/MobileDashboard'

export default function DashboardPage() {
  const { profile, rank, wallet, treeStats, team, loading: contextLoading } = useDashboardContext();
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  // Package Purchase Modal State
  const [purchaseModal, setPurchaseModal] = useState<{pkgId: string, name: string, price: number, type: 'PURCHASE' | 'UPGRADE' | 'REACTIVATE'} | null>(null)
  const [utrNumber, setUtrNumber] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('UPI')
  const [actionLoading, setActionLoading] = useState(false)
  
  const router = useRouter()

  const submitPurchaseRequest = async () => {
    if (!purchaseModal || !utrNumber.trim()) {
      setError('Please enter a valid UTR number')
      return
    }

    setActionLoading(true)
    setError('')
    setSuccess('')
    try {
      const endpoint = purchaseModal.type === 'PURCHASE' ? '/api/packages/purchase' 
                     : purchaseModal.type === 'UPGRADE' ? '/api/packages/upgrade'
                     : '/api/packages/reactivate';

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          packageId: purchaseModal.type === 'PURCHASE' ? purchaseModal.pkgId : undefined,
          newPackageId: purchaseModal.type === 'UPGRADE' ? purchaseModal.pkgId : undefined,
          transactionReference: utrNumber,
          paymentMethod: paymentMethod
        }),
      })
      
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed.')

      setSuccess('Purchase request submitted successfully! Waiting for admin approval.')
      setPurchaseModal(null)
      setUtrNumber('')
      setPaymentMethod('UPI')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Logout failed')
    }
  }

  const dataProps = { profile, wallet, rank, treeStats, team, loading: contextLoading, handleLogout }

  return (
    <>
      {purchaseModal && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99999,
          backdropFilter: 'blur(4px)',
        }}>
          <div style={{
            background: '#0d1426', border: '1px solid #1e293b',
            borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '440px',
            color: 'white'
          }}>
            <h3 style={{ marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: 'bold' }}>Manual Payment Approval</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
              You are requesting to {purchaseModal.type.toLowerCase()} <strong>{purchaseModal.name}</strong> for ₹{purchaseModal.price.toLocaleString('en-IN')}. Please transfer the amount and enter the UTR / Transaction ID below.
            </p>
            
            <div style={{ padding: '1rem', background: 'rgba(16,185,129,0.1)', borderRadius: '10px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.25rem' }}>Bank Transfer Details</div>
              <div style={{ fontWeight: 600 }}>TDPF Official Account</div>
              <div style={{ fontSize: '0.9rem' }}>A/C: 123456789012</div>
              <div style={{ fontSize: '0.9rem' }}>IFSC: HDFC0001234</div>
            </div>

            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              Payment Method *
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)',
                border: '1px solid #1e293b', borderRadius: '10px',
                color: 'white', fontSize: '0.9rem', marginBottom: '1rem',
              }}
            >
              <option value="UPI" style={{color:'black'}}>UPI</option>
              <option value="NEFT" style={{color:'black'}}>NEFT / IMPS</option>
              <option value="Bank Deposit" style={{color:'black'}}>Cash Bank Deposit</option>
              <option value="Crypto" style={{color:'black'}}>Crypto (USDT)</option>
            </select>

            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              UTR / Transaction Reference Number *
            </label>
            <input
              type="text"
              placeholder="e.g. UPI Ref, NEFT UTR..."
              value={utrNumber}
              onChange={e => setUtrNumber(e.target.value)}
              style={{
                width: '100%', padding: '0.75rem', background: 'rgba(255,255,255,0.05)',
                border: '1px solid #1e293b', borderRadius: '10px',
                color: 'white', fontSize: '0.9rem', marginBottom: '1.5rem',
              }}
            />
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button
                onClick={() => { setPurchaseModal(null); setUtrNumber('') }}
                style={{
                  flex: 1, padding: '0.75rem', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid #1e293b', borderRadius: '10px',
                  color: '#94a3b8', cursor: 'pointer', fontSize: '0.9rem',
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitPurchaseRequest}
                disabled={!utrNumber.trim() || actionLoading}
                style={{
                  flex: 1, padding: '0.75rem',
                  background: '#2563eb', border: '1px solid #2563eb',
                  borderRadius: '10px', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '0.9rem',
                }}
              >
                {actionLoading ? '⏳ Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {(error || success) && (
        <div style={{
          position: 'fixed', top: '1rem', right: '1rem', zIndex: 9999,
          background: error ? '#ef4444' : '#10b981', color: 'white',
          padding: '1rem 1.5rem', borderRadius: '8px', fontWeight: 'bold',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
        }}>
          {error || success}
        </div>
      )}

      {/* RESPONSIVE LAYOUT SWITCHING */}
      <div className="w-full h-full min-h-screen relative overflow-hidden">
        {/* Desktop View */}
        <div className="hidden md:block w-full h-full">
          <DesktopDashboard {...dataProps} setPurchaseModal={setPurchaseModal} />
        </div>
        
        {/* Mobile View */}
        <div className="block md:hidden w-full h-full">
          <MobileDashboard {...dataProps} setPurchaseModal={setPurchaseModal} />
        </div>
      </div>
    </>
  )
}
