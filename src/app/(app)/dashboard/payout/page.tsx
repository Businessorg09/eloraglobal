'use client'

import { useState, useEffect, useMemo } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useRouter } from 'next/navigation'

export default function PayoutPage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [activeFilter, setActiveFilter] = useState('all')
  const [amount, setAmount] = useState<number | string>(1000)
  const [pin, setPin] = useState(['', '', '', '', '', ''])
  const [method, setMethod] = useState<'BANK' | 'UPI' | 'CRYPTO'>('BANK')
  const [autoPayout, setAutoPayout] = useState(false)
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  
  // Real Data states
    const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const router = useRouter()

  const submitWithdrawal = async () => {
    if (!amount || Number(amount) < 500) {
      setError('Minimum withdrawal is ₹500')
      return
    }
    setSubmitLoading(true)
    setError('')
    setMessage('')
    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(amount), pin: pin.join('') })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to request withdrawal')
      
      setMessage('Withdrawal request submitted successfully! (10% fee applied)')
      setTimeout(() => {
        setMessage('')
        window.location.reload()
      }, 2000)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const [binaryHistory, setBinaryHistory] = useState<any[]>([])

  useEffect(() => {
    fetchWallet()
  }, [router])

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet/balance')
      if (res.status === 401) {
        router.push('/login')
        return
      }
      const data = await res.json()
      
      const histRes = await fetch('/api/withdrawals/history')
      if (histRes.ok) {
        const histData = await histRes.json()
        setWithdrawals(histData.withdrawals || [])
      }

      const binRes = await fetch('/api/user/binary-history')
      if (binRes.ok) {
        const binData = await binRes.json()
        setBinaryHistory(binData.history || [])
      }
    } catch (err: any) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setError('')
    setMessage('')
    const pinStr = pin.join('')
    if (pinStr.length !== 6) {
      setError('Please enter your 6-digit PIN')
      return
    }

    setSubmitLoading(true)
    try {
      // Mock details for the demo - in real app this would come from user's saved payout methods
      const details = method === 'BANK' 
        ? { accountNumber: '1234567890', ifsc: 'HDFC0001234', accountName: 'Test User', bankName: 'HDFC' }
        : method === 'UPI' ? { upiId: 'test@upi' }
        : { address: '0x123...', network: 'TRC20' }

      const res = await fetch('/api/withdrawals/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amountInr: amount,
          methodType: method,
          details,
          pin: pinStr
        })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to submit request')
      
      setMessage('Withdrawal request submitted successfully!')
      setPin(['', '', '', '', '', ''])
      fetchWallet()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setSubmitLoading(false)
    }
  }

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`pin-${index + 1}`)
      nextInput?.focus()
    }
  }

  const handlePinKeyDown = (index: number, e: any) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      const prevInput = document.getElementById(`pin-${index - 1}`)
      prevInput?.focus()
    }
  }

  const numAmount = typeof amount === 'number' ? amount : (parseFloat(amount) || 0)
  const tds = Math.round(numAmount * 0.05)
  const admin = Math.round(numAmount * 0.02)
  const net = Math.max(0, numAmount - tds - admin)
  
  const totalBalance = wallet?.balances?.totalBalance || 0
  const totalWithdrawn = wallet?.balances?.totalWithdrawn || 0
  const maxCapping = profile?.binary_income_limit ? profile.binary_income_limit / 100 : 25000

  // Combine withdrawals and binary matches into a unified master ledger
  const combinedLedger = useMemo(() => {
    const list: any[] = [];
    
    withdrawals.forEach(w => {
      list.push({
        ...w,
        type: 'WITHDRAWAL',
        sortDate: new Date(w.createdAt || w.created_at).getTime()
      });
    });

    binaryHistory.forEach(b => {
      list.push({
        ...b,
        type: 'BINARY_INCOME',
        sortDate: new Date(b.created_at).getTime()
      });
    });

    return list.sort((a, b) => b.sortDate - a.sortDate);
  }, [withdrawals, binaryHistory]);

  // Compute chart data dynamically
  const chartData = useMemo(() => {
    const data = []
    const months = []
    const maxVal = 150000
    const now = new Date()
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthStr = d.toLocaleString('default', { month: 'short' })
      const yearStr = d.getFullYear()
      months.push(`${monthStr} ${yearStr}`)
      
      const sum = withdrawals.filter(w => {
        const wd = new Date(w.createdAt)
        return wd.getMonth() === d.getMonth() && wd.getFullYear() === d.getFullYear()
      }).reduce((acc, curr) => acc + curr.amount, 0)
      data.push(sum)
    }
    
    const peak = Math.max(...data, 0)
    const peakIndex = data.indexOf(peak)
    const peakLabel = months[peakIndex]
    
    const dynamicMax = peak > 150000 ? Math.ceil(peak / 50000) * 50000 : maxVal
    const yRatio = 150 / (dynamicMax || 1)
    
    const coords = data.map((val, i) => ({
      x: 40 + (i * 128),
      y: 170 - (val * yRatio)
    }))
    
    const pathD = coords.map((c, i) => i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`).join(' ')
    const fillD = `${pathD} L 680 170 L 40 170 Z`

    return { data, months, peak, peakLabel, dynamicMax, pathD, fillD }
  }, [withdrawals])

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">

            {/* Breadcrumb, Title, Header Actions */}
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-gutter-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                  <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span>Finance &amp; Settlements</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-semibold">Payout Management</span>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight font-bold">Payout &amp; Settlement Center</h1>
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    <span>Next Auto-Disbursement: Friday 00:00 UTC</span>
                  </div>
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    <span>Settlement Mode: Auto-Batch Enabled</span>
                  </div>
                </div>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">Manage bank settlements, automated payout schedules, statutory TDS compliance, and real-time withdrawal disbursements.</p>
              </div>
              <div className="flex items-center gap-gutter-sm shrink-0">
                <button className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low transition-all font-body-sm text-body-sm font-semibold" type="button">
                  <span className="material-symbols-outlined text-[18px] text-outline">picture_as_pdf</span>
                  <span>Withdrawal History (PDF)</span>
                </button>
                <button className="flex items-center gap-2 px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low transition-all font-body-sm text-body-sm font-semibold" type="button">
                  <span className="material-symbols-outlined text-[18px] text-outline">tune</span>
                  <span>Payout Settings</span>
                </button>
                <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white shadow-sm hover:bg-secondary transition-all font-body-sm text-body-sm font-semibold" type="button">
                  <span className="material-symbols-outlined text-[18px]">bolt</span>
                  <span>Request Payout</span>
                </button>
              </div>
            </div>

            {/* Top KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
              {/* KPI 1: Available for Payout */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Available for Payout</span>
                  {wallet?.balances?.totalBalance > 0 && (
                    <span className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary bg-tertiary-container/15 px-2 py-0.5 rounded-full font-semibold">
                      <span className="material-symbols-outlined text-[14px]">trending_up</span>Active
                    </span>
                  )}
                </div>
                <div className="my-3">
                  <div className="font-metric-display text-metric-display text-on-surface font-bold">₹<CountUp start={0} end={wallet?.balances?.totalBalance || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">Eligible commission balance</p>
                </div>
                <div className="flex items-center gap-1.5 pt-2 text-tertiary font-label-sm text-label-sm font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
                  <span>Ready for instant release</span>
                </div>
              </motion.div>

              {/* KPI 1.5: Deposit / Activation Wallet */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Activation Wallet</span>
                  <span className="p-1 rounded-lg bg-surface-container text-outline">
                    <span className="material-symbols-outlined text-[18px]">account_balance_wallet</span>
                  </span>
                </div>
                <div className="my-3">
                  <div className="font-metric-display text-metric-display text-on-surface font-bold">₹<CountUp start={0} end={wallet?.balances?.depositBalance || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">Deposits for package activations</p>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>Non-withdrawable</span>
                  <span className="font-semibold text-primary">Expense</span>
                </div>
              </motion.div>

              {/* KPI 2: Total Disbursed */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Total Disbursed (Lifetime)</span>
                  <span className="p-1 rounded-lg bg-surface-container-low text-primary">
                    <span className="material-symbols-outlined text-[18px]">account_balance</span>
                  </span>
                </div>
                <div className="my-3">
                  <div className="font-metric-display text-metric-display text-on-surface font-bold">₹<CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">Net transferred to bank</p>
                </div>
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                  <span>18 successful transfers</span>
                  <span className="font-semibold text-primary">100% Cleared</span>
                </div>
              </motion.div>

              {/* KPI 3: Pending Approval */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">Pending Approval</span>
                  {wallet?.balances?.holdingBalance > 0 && (
                    <span className="px-2 py-1 rounded-lg bg-secondary-fixed text-primary font-label-sm text-label-sm font-semibold">Review</span>
                  )}
                </div>
                <div className="my-3">
                  <div className="font-metric-display text-metric-display text-on-surface font-bold">₹<CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">
                    {wallet?.balances?.holdingBalance > 0 ? "Pending compliance check" : "No pending requests"}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm">
                  {wallet?.balances?.holdingBalance > 0 ? (
                    <>
                      <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
                      <span>Audit SLA: &lt;4 hours remaining</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px] text-outline">check_circle</span>
                      <span>All caught up</span>
                    </>
                  )}
                </div>
              </motion.div>

              {/* KPI 4: TDS & Deductions */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                <div className="flex items-start justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant font-semibold">TDS &amp; Deductions</span>
                  <span className="p-1 rounded-lg bg-surface-container text-outline">
                    <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                  </span>
                </div>
                <div className="my-3">
                  <div className="font-metric-display text-metric-display text-on-surface font-bold">₹<CountUp start={0} end={Math.round((wallet?.balances?.totalWithdrawn || 0) / 100 * (7/93)) || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-0.5">5% statutory TDS + 2% Admin</p>
                </div>
                <div className="flex items-center gap-1.5 text-tertiary font-label-sm text-label-sm font-semibold">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Sec 194H Compliant (PAN Linked)</span>
                </div>
              </motion.div>

              {/* KPI 5: Weekly Cycle Payout — Sapphire Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-primary-container text-white rounded-xl p-5 shadow-sm flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-secondary-container/40 blur-2xl pointer-events-none"></div>
                <div className="flex items-start justify-between relative z-10">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-on-primary-container font-semibold">Weekly Cycle Payout</span>
                  <span className="material-symbols-outlined text-[18px] text-tertiary-fixed">event_repeat</span>
                </div>
                <div className="my-2 relative z-10">
                  <div className="font-metric-display text-metric-display font-bold text-white">₹<CountUp start={0} end={wallet?.balances?.binaryIncome || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-on-primary-container mt-0.5">Fri 28 Mar • Match + Directs</p>
                </div>
                <button className="relative z-10 w-full py-1.5 px-3 rounded-lg bg-surface-container-lowest/15 hover:bg-surface-container-lowest/25 transition-colors text-white font-label-sm text-label-sm font-semibold flex items-center justify-center gap-1" type="button">
                  <span>Configure Auto-Release</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-7 xl:col-span-8 space-y-gutter-lg">

                {/* Withdrawal Console */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-2">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Withdrawal Console</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">Request an instant payout or queue for next automated settlement cycle</p>
                    </div>
                    <div className="inline-flex p-1 bg-surface-container-low rounded-lg">
                      <button onClick={() => setMethod('BANK')} className={`px-3 py-1.5 text-body-sm font-semibold rounded ${method === 'BANK' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">Bank IMPS</button>
                      <button onClick={() => setMethod('UPI')} className={`px-3 py-1.5 text-body-sm font-semibold rounded ${method === 'UPI' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">UPI</button>
                      <button onClick={() => setMethod('CRYPTO')} className={`px-3 py-1.5 text-body-sm font-semibold rounded ${method === 'CRYPTO' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`} type="button">USDT TRC-20</button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-lg pt-2">
                    {/* Form Column */}
                    <div className="md:col-span-7 space-y-4">
                      {/* Wallet Selector */}
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant font-semibold mb-1.5">Origin Commission Wallet</label>
                        <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-primary-container text-white flex items-center justify-center">
                              <span className="material-symbols-outlined text-[18px]">wallet</span>
                            </div>
                            <div>
                              <div className="font-headline-md text-headline-md font-semibold text-on-surface">Main Commission Balance</div>
                              <div className="font-label-sm text-label-sm text-outline">Withdrawable After Cap Threshold</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-headline-md text-headline-md font-bold text-on-surface">₹{(wallet?.balances?.totalBalance || 0).toLocaleString('en-IN')}</div>
                            <span className="font-label-sm text-label-sm text-tertiary font-semibold">Available</span>
                          </div>
                        </div>
                      </div>

                      {/* Amount Input */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-label-md text-label-md text-on-surface-variant font-semibold">Withdrawal Amount (INR)</label>
                          <span className="font-label-sm text-label-sm text-outline">Min ₹500 | Max ₹{maxCapping.toLocaleString('en-IN')} / Day</span>
                        </div>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-headline-md text-headline-md font-bold text-on-surface">₹</span>
                          <input
                            className="w-full pl-9 pr-4 py-3 rounded-lg bg-surface-container-low text-on-surface font-headline-md text-headline-md font-bold focus:bg-surface-container-lowest focus:outline-none transition-all"
                            onChange={(e) => setAmount(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                            placeholder="Enter amount"
                            type="number"
                            value={amount === '' ? '' : amount}
                          />
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2.5">
                          <button className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors ${amount === 500 ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-variant'}`} onClick={() => setAmount(500)} type="button">₹500</button>
                          <button className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors ${amount === maxCapping ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-variant'}`} onClick={() => setAmount(maxCapping)} type="button">MAX CAP (₹{maxCapping.toLocaleString('en-IN')})</button>
                          <button className={`px-3 py-1 rounded-md font-label-md text-label-md transition-colors ${amount === wallet?.balances?.totalBalance ? 'bg-primary text-white shadow-sm' : 'bg-surface-container text-on-surface hover:bg-surface-variant'}`} onClick={() => setAmount(wallet?.balances?.totalBalance || 0)} type="button">ALL BALANCE</button>
                        </div>
                      </div>

                      {/* Destination Account */}
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant font-semibold mb-1.5">
                          {method === 'BANK' ? 'Destination Bank Account' : method === 'UPI' ? 'Destination UPI ID' : 'Destination USDT Wallet (TRC-20)'}
                        </label>
                        
                        {method === 'BANK' && (
                          <div className="space-y-3">
                            <select className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-surface-container focus:outline-none focus:border-primary transition-colors text-body-sm font-semibold text-on-surface appearance-none">
                              <option value="HDFC">HDFC Bank Ltd. (A/C: •••••••• 4921)</option>
                            </select>
                          </div>
                        )}

                        {method === 'UPI' && (
                          <div className="space-y-3">
                            <select className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-surface-container focus:outline-none focus:border-primary transition-colors text-body-sm font-semibold text-on-surface appearance-none">
                              <option value="UPI1">{profile?.full_name?.toLowerCase().replace(' ', '')}@okhdfcbank (Instant UPI VPA)</option>
                            </select>
                          </div>
                        )}

                        {method === 'CRYPTO' && (
                          <div className="space-y-3">
                            <select className="w-full px-4 py-3 rounded-lg bg-surface-container-lowest border border-surface-container focus:outline-none focus:border-primary transition-colors text-body-sm font-semibold text-on-surface appearance-none">
                              <option value="USDT1">USDT TRC-20 (TXYZ901v••••••••••••8fa2)</option>
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Security PIN */}
                      <div className="pt-2">
                        {error && <div className="text-error font-semibold text-sm mb-2">{error}</div>}
                        {message && <div className="text-emerald-500 font-semibold text-sm mb-2">{message}</div>}
                        <label className="block font-label-md text-label-md text-on-surface-variant font-semibold mb-1.5">Transaction Security PIN (6-Digit)</label>
                        <div className="flex gap-2 mb-4">
                          {pin.map((v, i) => (
                            <input 
                              key={i} 
                              id={`pin-${i}`}
                              className="w-11 h-11 text-center font-bold text-headline-md bg-surface-container-low rounded-lg focus:bg-surface-container-lowest focus:outline-none focus:border focus:border-primary" 
                              maxLength={1} 
                              value={v}
                              onChange={(e) => handlePinChange(i, e.target.value)}
                              onKeyDown={(e) => handlePinKeyDown(i, e)}
                              type="password" 
                            />
                          ))}
                        </div>
                        <button 
                          onClick={submitWithdrawal} 
                          disabled={submitLoading}
                          className={`w-full py-3 px-4 rounded-lg bg-primary hover:bg-secondary text-white font-headline-md text-headline-md font-semibold shadow-sm transition-all flex items-center justify-center gap-2 ${submitLoading ? 'opacity-70 cursor-not-allowed' : ''}`} 
                          type="button">
                          <span className="material-symbols-outlined text-[20px]">{submitLoading ? 'hourglass_empty' : 'payments'}</span>
                          <span>{submitLoading ? 'Processing...' : 'Submit Withdrawal Request'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Settlement Audit Column */}
                    <div className="md:col-span-5 flex flex-col justify-between bg-surface-container-low rounded-xl p-5">
                      <div>
                        <div className="flex items-center justify-between pb-3">
                          <span className="font-headline-md text-headline-md font-bold text-on-surface">Settlement Audit</span>
                          <span className="font-label-sm text-label-sm text-outline">Real-Time Quote</span>
                        </div>
                        <p className="font-label-sm text-label-sm text-on-surface-variant mb-4">Statutory withholding as per Govt. of India direct selling guidelines.</p>
                        <div className="space-y-3 font-body-sm text-body-sm">
                          <div className="flex justify-between items-center text-on-surface">
                            <span>Gross Requested</span>
                            <span className="font-headline-md text-headline-md font-bold text-on-surface">₹{numAmount.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-on-surface-variant">
                            <div className="flex items-center gap-1">
                              <span>TDS (Sec 194H - 5.0%)</span>
                              <span className="material-symbols-outlined text-[14px] text-outline">info</span>
                            </div>
                            <span className="text-error font-semibold">-₹{tds.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-on-surface-variant">
                            <div className="flex items-center gap-1">
                              <span>Admin &amp; Gateway SLA (2.0%)</span>
                              <span className="material-symbols-outlined text-[14px] text-outline">info</span>
                            </div>
                            <span className="text-error font-semibold">-₹{admin.toLocaleString('en-IN')}</span>
                          </div>
                          <div className="flex justify-between items-center text-on-surface-variant">
                            <span>Payout Processing Speed</span>
                            <span className="text-tertiary font-semibold flex items-center gap-1">
                              <span className="material-symbols-outlined text-[14px]">bolt</span> Instant IMPS
                            </span>
                          </div>
                        </div>
                        <div className="mt-4 bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/40">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold block">Net Bank Credit</span>
                              <span className="font-label-sm text-label-sm text-tertiary font-semibold">Disbursed into HDFC 4921</span>
                            </div>
                            <div className="font-headline-xl text-headline-xl text-tertiary font-bold tracking-tight">
                              ₹{net.toLocaleString('en-IN')}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-3 rounded-lg bg-surface-variant/40 text-on-surface font-label-sm text-label-sm flex items-start gap-2">
                        <span className="material-symbols-outlined text-[16px] text-primary shrink-0 mt-0.5">verified_user</span>
                        <span>Payout requests are credited within 24 hours of approval after processing from this console.</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Disbursement Performance Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 gap-3">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Disbursement Performance</h2>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">6-Month payout settlement history and peak liquidation cycles</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex p-1 bg-surface-container-low rounded-lg font-label-sm text-label-sm">
                        <button className="px-2.5 py-1 rounded font-semibold text-on-surface-variant hover:text-on-surface" type="button">Weekly</button>
                        <button className="px-2.5 py-1 rounded bg-surface-container-lowest font-semibold text-primary shadow-sm" type="button">Monthly</button>
                        <button className="px-2.5 py-1 rounded font-semibold text-on-surface-variant hover:text-on-surface" type="button">Quarterly</button>
                      </div>
                    </div>
                  </div>

                  <div className="relative w-full pt-4 pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 font-label-sm text-label-sm">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="text-on-surface font-semibold">Net Payout Transferred</span>
                        <span className="text-outline">|</span>
                        <span className="w-3 h-3 rounded-full bg-surface-container-high"></span>
                        <span className="text-outline">Statutory Deductions</span>
                      </div>
                      <div className="px-2.5 py-1 rounded bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">star</span>
                        <span>Peak Month: {chartData.peakLabel} (₹{chartData.peak.toLocaleString('en-IN')})</span>
                      </div>
                    </div>
                    <div className="w-full h-56">
                      <svg className="w-full h-full" preserveAspectRatio="none" viewBox="0 0 700 200">
                        <defs>
                          <linearGradient id="payoutGrad" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#1a56db" stopOpacity={0.3} />
                            <stop offset="100%" stopColor="#1a56db" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth={1} x1="40" x2="680" y1="20" y2="20" />
                        <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth={1} x1="40" x2="680" y1="70" y2="70" />
                        <line stroke="#e2e8f0" strokeDasharray="4 4" strokeWidth={1} x1="40" x2="680" y1="120" y2="120" />
                        <line stroke="#e2e8f0" strokeWidth={1} x1="40" x2="680" y1="170" y2="170" />
                        <text fill="#737686" fontFamily="Inter" fontSize={10} textAnchor="end" x="35" y="24">₹{(chartData.dynamicMax / 1000).toFixed(0)}K</text>
                        <text fill="#737686" fontFamily="Inter" fontSize={10} textAnchor="end" x="35" y="74">₹{((chartData.dynamicMax * 0.66) / 1000).toFixed(0)}K</text>
                        <text fill="#737686" fontFamily="Inter" fontSize={10} textAnchor="end" x="35" y="124">₹{((chartData.dynamicMax * 0.33) / 1000).toFixed(0)}K</text>
                        <text fill="#737686" fontFamily="Inter" fontSize={10} textAnchor="end" x="35" y="174">₹0</text>
                        
                        <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} d={chartData.fillD} fill="url(#payoutGrad)" />
                        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.6 }} d={chartData.pathD} fill="none" stroke="#1a56db" strokeLinecap="round" strokeWidth={3} />
                        
                        {chartData.months.map((m, i) => (
                          <text key={i} fill="#737686" fontFamily="Inter" fontSize={10} textAnchor="middle" x={40 + (i * 128)} y="188">{m}</text>
                        ))}
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-3">
                    <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[22px]">calendar_view_week</span>
                      <div>
                        <div className="font-label-sm text-label-sm text-outline">Avg Weekly Settlement</div>
                        <div className="font-headline-md text-headline-md font-bold text-on-surface">₹{Math.round((wallet?.balances?.totalWithdrawn || 0) / 100 / 4).toLocaleString('en-IN') || 0}</div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary text-[22px]">timer</span>
                      <div>
                        <div className="font-label-sm text-label-sm text-outline">Direct Bank SLA</div>
                        <div className="font-headline-md text-headline-md font-bold text-on-surface">
                          {wallet?.balances?.totalWithdrawn > 0 ? "99.8% < 2h" : "No data"}
                        </div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-3">
                      <span className="material-symbols-outlined text-tertiary text-[22px]">check_circle</span>
                      <div>
                        <div className="font-label-sm text-label-sm text-outline">Rejection / Bounce Rate</div>
                        <div className="font-headline-md text-headline-md font-bold text-tertiary">
                          {wallet?.balances?.totalWithdrawn > 0 ? "0.0% Clean" : "No data"}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-5 xl:col-span-4 space-y-gutter-lg">

                {/* Linked Settlement Channels */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Linked Settlement Channels</h3>
                      <p className="font-label-sm text-label-sm text-outline">Designated accounts for payout clearance</p>
                    </div>
                    <button className="p-1 text-primary hover:bg-surface-container-low rounded-lg transition-colors" type="button">
                      <span className="material-symbols-outlined text-[20px]">add_circle</span>
                    </button>
                  </div>
                  <div className="space-y-3">
                    {/* HDFC */}
                    <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">account_balance</span>
                          <span className="font-headline-md text-headline-md font-bold text-on-surface">HDFC Bank Ltd.</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm font-semibold">Primary • Active</span>
                      </div>
                      <div className="text-body-sm font-mono text-on-surface-variant">A/C: •••••••• 4921</div>
                      <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                        <span>IFSC: HDFC0001234</span>
                        <span>Ibrahim Khalilolla</span>
                      </div>
                    </div>
                    {/* USDT */}
                    <div className="p-3 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary text-[20px]">currency_bitcoin</span>
                          <span className="font-headline-md text-headline-md font-bold text-on-surface">USDT (TRC-20)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-label-sm font-semibold">Global Gateway</span>
                      </div>
                      <div className="text-body-sm font-mono text-on-surface-variant truncate">TXYZ901v••••••••••••8fa2</div>
                      <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                        <span>Auto-conversion enabled</span>
                        <span className="text-tertiary font-semibold">Verified</span>
                      </div>
                    </div>
                    {/* UPI */}
                    <div className="p-3 rounded-lg bg-surface-container-lowest shadow-sm flex flex-col gap-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-primary text-[20px]">qr_code_2</span>
                          <span className="font-headline-md text-headline-md font-bold text-on-surface">Instant UPI VPA</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-full bg-tertiary-container/20 text-tertiary font-label-sm text-label-sm font-semibold">IMPS 2025</span>
                      </div>
                      <div className="text-body-sm text-on-surface-variant">ibrahim@okhdfcbank</div>
                      <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                        <span>Instant clearance (auto)</span>
                        <span className="text-primary font-semibold">ACTIVE</span>
                      </div>
                    </div>
                  </div>
                  <button onClick={() => {
                    router.push('/dashboard/settings?tab=banking&action=add_bank')
                  }} className="w-full py-2 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Add Bank Account / UPI / Crypto</span>
                  </button>
                </motion.div>

                {/* TDS Compliance Shield */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-md text-headline-md font-bold text-on-surface">TDS Compliance Shield</h3>
                    <span className="px-2.5 py-1 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-label-sm font-semibold">100% Tax Compliant</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between py-1.5 border-b border-surface-container-low text-body-sm">
                      <span className="text-outline">PAN Number</span>
                      <span className="font-mono font-semibold text-on-surface">AGIB12345•</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 border-b border-surface-container-low text-body-sm">
                      <span className="text-outline">Applicable TDS Rate (5% Flat Sec 194H)</span>
                      <span className="text-tertiary font-semibold">Confirmed</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5 text-body-sm">
                      <span className="text-outline">Quarterly Certificate</span>
                      <span className="font-semibold text-on-surface">FY 2025-26 (Q4)</span>
                    </div>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Download TDS Certificate Form 16A</span>
                  </button>
                </motion.div>

                {/* Auto-Payout Engine Toggle */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary text-[20px]">autorenew</span>
                      <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Auto-Payout Engine</h3>
                    </div>
                    {/* Toggle */}
                    <div onClick={() => setAutoPayout(!autoPayout)} className={`w-12 h-6 rounded-full flex items-center px-1 cursor-pointer transition-colors ${autoPayout ? 'bg-primary' : 'bg-surface-container'}`}>
                      <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform ${autoPayout ? 'ml-auto' : ''}`}></div>
                    </div>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mb-3">Fully automated payout requests to your primary account every scheduled cycle.</p>
                  <div className="space-y-2 font-label-sm text-label-sm">
                    <div className="flex items-center justify-between py-1.5 border-b border-surface-container-low">
                      <span className="text-outline">Minimum Threshold</span>
                      <span className="font-semibold text-on-surface">₹1,000</span>
                    </div>
                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-outline">Cycle Cadence</span>
                      <span className="font-semibold text-primary">Every Friday Midnight UTC</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Full-Width Disbursement Audit Ledger */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.1 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Disbursement &amp; Settlement Audit Ledger</h2>
                  <p className="font-body-sm text-body-sm text-outline">Comprehensive history of all direct bank transfers, deductions, and UTR issue records</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[220px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">search</span>
                    <input className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all" placeholder="Search by ID, UTR, Bank Ref..." type="text" />
                  </div>
                  <button className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">sim_card_download</span>
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1 p-1 bg-surface-container-low rounded-lg w-fit">
                {[
                  { id: 'all', label: `All Transactions (${combinedLedger.length})` },
                  { id: 'earnings', label: `Earnings (${binaryHistory.length})` },
                  { id: 'withdrawals', label: `Withdrawals (${withdrawals.length})` },
                ].map(f => (
                  <button
                    key={f.id}
                    onClick={() => setActiveFilter(f.id)}
                    className={`px-3 py-1.5 rounded font-label-sm text-label-sm font-semibold transition-colors ${activeFilter === f.id ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                    type="button"
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-surface-container-low/70 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-3 rounded-l-lg">Date &amp; Time</th>
                      <th className="py-3 px-3">Transaction Type</th>
                      <th className="py-3 px-3">Details / Matched Pairs</th>
                      <th className="py-3 px-3 text-right">Gross Amount</th>
                      <th className="py-3 px-3 text-right">Deductions</th>
                      <th className="py-3 px-3 text-right">Net Credited</th>
                      <th className="py-3 px-3">Status / Limits</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
                    {combinedLedger
                      .filter(item => {
                        if (activeFilter === 'earnings') return item.type === 'BINARY_INCOME';
                        if (activeFilter === 'withdrawals') return item.type === 'WITHDRAWAL';
                        return true;
                      })
                      .map((tx, idx) => {
                      if (tx.type === 'WITHDRAWAL') {
                        const amount = tx.amount || 0;
                        const tds = amount * 0.05;
                        const admin = amount * 0.02;
                        const net = amount - tds - admin;
                        return (
                          <tr key={`wd-${tx.id || idx}`} className="hover:bg-surface-container-lowest transition-colors">
                            <td className="py-3 px-3 text-outline font-mono text-xs">{new Date(tx.sortDate).toLocaleString()}</td>
                            <td className="py-3 px-3">
                              <span className="flex items-center gap-1.5 font-bold text-on-surface">
                                <span className="material-symbols-outlined text-[16px] text-error">arrow_upward</span> Bank Withdrawal
                              </span>
                            </td>
                            <td className="py-3 px-3 text-outline text-xs">To {tx.method_type || 'BANK'}</td>
                            <td className="py-3 px-3 text-right font-mono font-semibold">₹{amount.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right font-mono text-error text-xs">-₹{(tds + admin).toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-on-surface">₹{net.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${tx.status === 'COMPLETED' ? 'bg-tertiary-container/20 text-tertiary' : tx.status === 'REJECTED' ? 'bg-error/10 text-error' : 'bg-surface-container text-outline'}`}>
                                {tx.status || 'PENDING'}
                              </span>
                            </td>
                          </tr>
                        );
                      } else {
                        // Binary Income
                        const pairs = Math.floor(tx.matched_bv / 100);
                        const gross = tx.raw_income_inr || 0;
                        const net = tx.final_income_inr || 0;
                        const hasCap = gross > net;
                        
                        return (
                          <tr key={`bin-${tx.id || idx}`} className="hover:bg-surface-container-lowest transition-colors bg-primary/5">
                            <td className="py-3 px-3 text-outline font-mono text-xs">{new Date(tx.sortDate).toLocaleString()}</td>
                            <td className="py-3 px-3">
                              <span className="flex items-center gap-1.5 font-bold text-primary">
                                <span className="material-symbols-outlined text-[16px]">account_tree</span> Pair Match
                              </span>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1">
                                <span className="font-bold">{pairs} Pairs</span>
                                <span className="text-outline text-xs">(₹800/pair)</span>
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-semibold">₹{gross.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3 text-right font-mono text-outline text-xs">
                              {hasCap ? `Cap Hit` : 'None'}
                            </td>
                            <td className="py-3 px-3 text-right font-mono font-bold text-primary text-sm">+₹{net.toLocaleString('en-IN')}</td>
                            <td className="py-3 px-3">
                              <span className="px-2 py-0.5 rounded bg-primary-container/20 text-primary text-[10px] font-bold uppercase tracking-wider">
                                Credited to Wallet
                              </span>
                            </td>
                          </tr>
                        );
                      }
                    })}
                    
                    {combinedLedger.length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-outline">No transactions found in your ledger.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-gutter-sm pt-2 font-label-sm text-label-sm text-outline">
                <span>Showing ledger entries</span>
                <div className="flex items-center gap-1">
                  <button className="px-2 py-1 rounded bg-surface-container text-outline" disabled>Previous</button>
                  <button className="px-2.5 py-1 rounded bg-primary text-white font-semibold">1</button>
                  <button className="px-2 py-1 rounded bg-surface-container text-outline" disabled>Next</button>
                </div>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  )
}
