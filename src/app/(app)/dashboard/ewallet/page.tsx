'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useRouter } from 'next/navigation'
import TransactionPinModal from '@/components/TransactionPinModal'

export default function EWalletPage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [activeFilter, setActiveFilter] = useState('all')
  const [transactions, setTransactions] = useState<any[]>([])
  const [packages, setPackages] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  
  // Modals state
  const [showTopUpModal, setShowTopUpModal] = useState(false)
  const [showActivateModal, setShowActivateModal] = useState(false)
  const [showAddSettlementModal, setShowAddSettlementModal] = useState(false)
  const [settlementMethod, setSettlementMethod] = useState('bank')
  const [activateUserId, setActivateUserId] = useState('')
  const [activatePackage, setActivatePackage] = useState('')
  const [topUpAmount, setTopUpAmount] = useState(5000)
  const [topUpCardAmount, setTopUpCardAmount] = useState<number | string>(25000)

  // Deposit payment modal states
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [depositAmount, setDepositAmount] = useState<number | string>(25000)
  const [depositPayMethod, setDepositPayMethod] = useState<'card'|'upi'|'crypto'>('card')
  const [depositCard, setDepositCard] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [depositUpiId, setDepositUpiId] = useState('')
  const [copiedDepositAddr, setCopiedDepositAddr] = useState<string|null>(null)

  const depositCryptoAddresses = [
    { coin: 'USDT (TRC20)', address: 'TRX_ADDRESS_PLACEHOLDER', icon: '₮', color: '#26A17B' },
    { coin: 'Bitcoin (BTC)', address: 'BTC_ADDRESS_PLACEHOLDER', icon: '₿', color: '#F7931A' },
    { coin: 'Ethereum (ETH)', address: 'ETH_ADDRESS_PLACEHOLDER', icon: 'Ξ', color: '#627EEA' },
  ]

  const handleCopyDepositAddr = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedDepositAddr(address)
    setTimeout(() => setCopiedDepositAddr(null), 2000)
  }

  const formatDepositCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatDepositExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0,2) + '/' + digits.slice(2)
    return digits
  }

  const openDepositModal = (amount?: number) => {
    if (amount) setDepositAmount(amount)
    setDepositPayMethod('card')
    setDepositCard({ number: '', name: '', expiry: '', cvv: '' })
    setDepositUpiId('')
    setShowDepositModal(true)
  }

  const router = useRouter()

  const [withdrawAmount, setWithdrawAmount] = useState<number | ''>('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionSuccess, setActionSuccess] = useState('')
  const [actionError, setActionError] = useState('')
  const [pinModal, setPinModal] = useState({ isOpen: false, actionName: '', onVerify: (pin: string) => {} })

  const handleApiAction = async (endpoint: string, payload: any, onSuccessMessage: string) => {
    setActionLoading(true)
    setActionError('')
    setActionSuccess('')
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Request failed.')
      
      setActionSuccess(onSuccessMessage)
      setTimeout(() => {
        setActionSuccess('')
        window.location.reload()
      }, 2500)
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const submitWithdrawal = () => {
    if (!withdrawAmount || Number(withdrawAmount) < 500) {
      setActionError('Minimum withdrawal is ₹500')
      return
    }
    setPinModal({
      isOpen: true,
      actionName: 'Withdraw Funds',
      onVerify: (pin) => {
        setPinModal(prev => ({ ...prev, isOpen: false }))
        handleApiAction('/api/wallet/withdraw', { amount: Number(withdrawAmount), pin }, 'Withdrawal request submitted successfully! (10% fee applied)')
      }
    })
  }

  const submitActivatePackage = () => {
    if (!activateUserId || !activatePackage) {
      setActionError('Please select a user and package')
      return
    }
    setPinModal({
      isOpen: true,
      actionName: 'Activate Package for Downline',
      onVerify: (pin) => {
        setPinModal(prev => ({ ...prev, isOpen: false }))
        handleApiAction('/api/wallet/activate-package', { targetUserId: activateUserId, packageId: activatePackage, pin }, 'Downline activated successfully!')
      }
    })
  }

  const submitTopup = () => {
    if (!topUpAmount || topUpAmount < 1000) {
      setActionError('Minimum topup is ₹1000')
      return
    }
    handleApiAction('/api/wallet/topup', { amount: topUpAmount, utr: 'DEMO-' + Date.now() }, 'Topup request submitted for admin approval.')
  }

  useEffect(() => {
    const fetchWallet = async () => {
      try {
        const res = await fetch('/api/wallet/balance')
        if (res.status === 401) {
          router.push('/login')
          return
        }
        const data = await res.json()
        

        const txRes = await fetch('/api/wallet/transactions')
        if (txRes.ok) {
          const txData = await txRes.json()
          setTransactions(txData.transactions || [])
        }

        const packRes = await fetch('/api/packages')
        if (packRes.ok) {
          const packData = await packRes.json()
          const pkgs = packData.packages || []
          setPackages(pkgs)
          if (pkgs.length > 0) setActivatePackage(pkgs[0].id)
        }

        const teamRes = await fetch('/api/user/team')
        if (teamRes.ok) {
          const teamData = await teamRes.json()
          setTeamMembers(teamData.members || [])
        }
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchWallet()
  }, [router])

  const totalBalance = wallet?.balances?.totalBalance || 0 // Available commission for payout
  const depositBalance = wallet?.balances?.depositBalance || 0 // Activation funds (Topups)
  const totalWithdrawn = wallet?.balances?.totalWithdrawn || 0
  const totalEarned = (wallet?.balances?.binaryIncome || 0) + (wallet?.balances?.sponsorIncome || 0) + (wallet?.balances?.leadershipIncome || 0) + (wallet?.balances?.rankBonus || 0) + (wallet?.balances?.repurchaseBonus || 0) + (wallet?.balances?.tradingIncome || 0)

  // Derived Dynamic Metrics
  const daysSinceJoin = profile?.created_at ? Math.max(1, (new Date().getTime() - new Date(profile.created_at).getTime()) / (1000 * 3600 * 24)) : 1
  const avgDailyCredit = totalEarned > 0 ? Math.round(totalEarned / daysSinceJoin) : 0

  const totalEarningForChart = Math.max(totalEarned, 1)
  const binaryPct = ((wallet?.balances?.binaryIncome || 0) / totalEarningForChart) * 100
  const sponsorPct = ((wallet?.balances?.sponsorIncome || 0) / totalEarningForChart) * 100
  const leadershipPct = ((wallet?.balances?.leadershipIncome || 0) / totalEarningForChart) * 100
  const rankPct = ((wallet?.balances?.rankBonus || 0) / totalEarningForChart) * 100
  const repurchasePct = ((wallet?.balances?.repurchaseBonus || 0) / totalEarningForChart) * 100

  const activeDirects = treeStats?.memberCount?.activeDirects || 0
  const totalDirects = treeStats?.memberCount?.totalDirects || 1
  const frontlineRetention = totalDirects > 0 ? ((activeDirects / totalDirects) * 100).toFixed(1) : "0.0"

  const completedTx = transactions.filter(t => t.status === 'COMPLETED').length
  const totalTx = Math.max(transactions.length, 1)
  const successRate = transactions.length > 0 ? ((completedTx / totalTx) * 100).toFixed(1) : "0.0"

  const isValidDirect = activateUserId.trim() !== '' && teamMembers.some(m => m.level === 1 && m.username.toLowerCase() === activateUserId.trim().toLowerCase())


  const downloadStatement = () => {
    if (transactions.length === 0) {
      alert("No transactions to download.");
      return;
    }
    
    // Create CSV content
    const headers = ["Date", "Type", "Reference ID", "Amount (INR)", "Status"];
    const rows = transactions.map(t => [
      new Date(t.created_at).toLocaleDateString(),
      t.transaction_type,
      t.id,
      (t.amount_paise / 100).toFixed(2),
      t.status
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `wallet_statement_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        {/* Global Action Toast Notification (for non-activation successes/errors) */}
        {(error || actionError || (actionSuccess && !actionSuccess.includes('activated'))) && (
          <div style={{
            position: 'fixed', top: '5rem', right: '1rem', zIndex: 9999,
            background: error || actionError ? '#ef4444' : '#10b981', color: 'white',
            padding: '1rem 1.5rem', borderRadius: '8px', fontWeight: 'bold',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <span className="material-symbols-outlined text-[20px]">
              {error || actionError ? 'error' : 'check_circle'}
            </span>
            {error || actionError || actionSuccess}
          </div>
        )}

        {/* Dedicated Activation Success Screen */}
        {actionSuccess && actionSuccess.includes('activated') && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0, y: 50 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              className="bg-surface-container-lowest rounded-3xl p-8 shadow-2xl max-w-md w-full border border-primary/20 text-center relative overflow-hidden"
            >
              <div className="absolute -top-10 -left-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl"></div>
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"></div>
              
              <div className="relative z-10 flex flex-col items-center">
                <motion.div 
                  initial={{ scale: 0 }} 
                  animate={{ scale: 1, rotate: [0, 10, -10, 0] }} 
                  transition={{ delay: 0.2, type: 'spring' }} 
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/30 mb-6"
                >
                  <span className="material-symbols-outlined text-[48px]">check_circle</span>
                </motion.div>
                
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface mb-2">Activation Successful! 🎉</h2>
                <p className="font-body-md text-body-md text-outline mb-6">
                  The package has been successfully activated for your downline member. They are now placed in the binary network.
                </p>
                
                <div className="bg-surface-container-low w-full rounded-2xl p-4 mb-8 flex justify-between items-center border border-surface-container-high">
                  <div className="text-left">
                    <span className="block font-label-sm text-label-sm text-outline uppercase tracking-wider">Transaction Status</span>
                    <span className="font-label-md text-label-md font-bold text-emerald-600">Approved & Deducted</span>
                  </div>
                  <span className="material-symbols-outlined text-emerald-500 text-[24px]">verified</span>
                </div>

                <button 
                  onClick={() => window.location.reload()} 
                  className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-label-md text-label-md font-bold transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">done_all</span>
                  Awesome, Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">

            {/* Breadcrumb & Header Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-gutter-md">
              <div className="flex flex-col space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-outline font-label-md text-label-md">
                  <Link className="hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
                  <span>/</span>
                  <span className="text-on-surface-variant">Finance &amp; Wallets</span>
                  <span>/</span>
                  <span className="text-primary font-semibold">E-Wallet Management</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight">E-Wallet &amp; Financial Center</h1>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                    Real-time Settlement
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-gutter-sm">
                <button onClick={downloadStatement} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors shadow-sm font-label-md text-label-md" type="button">
                  <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
                  <span>Download Statement</span>
                </button>
                <button onClick={() => openDepositModal()} className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors shadow-sm font-label-md text-label-md" type="button">
                  <span className="material-symbols-outlined text-[18px] text-secondary">add_card</span>
                  <span>Request Top-Up</span>
                </button>
                <button onClick={() => setShowActivateModal(true)} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white transition-all shadow-sm hover:shadow font-label-md text-label-md font-semibold" type="button">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                  <span>Activate Downline</span>
                </button>
              </div>
            </div>

            {/* KPI Command Bar: 5 Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-md">
              {/* Card 1: Available E-Wallet */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Available E-Wallet</span>
                    <span className="font-display-lg text-display-lg text-on-surface mt-1">₹ <CountUp start={0} end={totalBalance} duration={2.5} separator="," /></span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container-low">
                  <span className="inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[15px]">sync</span>Updated recently
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Ready for Payout</span>
                </div>
              </motion.div>

              {/* Card 2: Total Inflow */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Total Inflow</span>
                    <span className="font-display-lg text-display-lg text-on-surface mt-1">₹ <CountUp start={0} end={totalEarned} duration={2.5} separator="," /></span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[22px]">arrow_downward_alt</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container-low">
                  <span className="inline-flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-semibold">
                    <span className="material-symbols-outlined text-[15px]">sync</span>Updated recently
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Binary &amp; Direct</span>
                </div>
              </motion.div>

              {/* Card 3: Total Withdrawn */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Total Withdrawn</span>
                    <span className="font-display-lg text-display-lg text-on-surface mt-1">₹ <CountUp start={0} end={totalWithdrawn} duration={2.5} separator="," /></span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-error">
                    <span className="material-symbols-outlined text-[22px]">arrow_upward_alt</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container-low">
                  <span className="inline-flex items-center gap-1 text-outline font-label-sm text-label-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>Safe Transfer
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">Verified Transfers</span>
                </div>
              </motion.div>

              {/* Card 4: Cash Wallet (Deposits) */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
                <div className="flex items-start justify-between">
                  <div className="flex flex-col">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Available Cash Wallet</span>
                    <span className="font-display-lg text-display-lg text-on-surface mt-1">₹ <CountUp start={0} end={depositBalance} duration={2.5} separator="," /></span>
                  </div>
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[22px]">account_balance</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 flex items-center justify-between border-t border-surface-container-low">
                  <span className="font-label-sm text-label-sm text-outline-variant font-medium">Top-up Funds</span>
                  <span className="font-label-sm text-label-sm text-primary font-semibold">Ready for Activation</span>
                </div>
              </motion.div>

              {/* Card 5: Instant P2P / Sapphire Card */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="rounded-xl p-5 bg-gradient-to-br from-primary via-primary-container to-secondary text-white shadow-md flex flex-col justify-between relative overflow-hidden">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none blur-xl"></div>
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-white/80 font-bold">Instant P2P Network</span>
                    <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-label-sm text-[10px] font-bold tracking-wide uppercase">0% Fee</span>
                  </div>
                  <p className="font-headline-md text-headline-md font-bold mt-2 text-white">Internal Member Pay</p>
                  <p className="font-body-sm text-body-sm text-white/80 mt-0.5">Real-time downline balance injection</p>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed">verified_user</span>
                    <span className="font-label-sm text-label-sm text-white/90">2FA Verified</span>
                  </div>
                  <button onClick={() => setShowActivateModal(true)} className="px-3 py-1.5 rounded-lg bg-white text-primary font-label-sm text-label-sm font-bold shadow-sm hover:bg-surface transition-colors flex items-center gap-1" type="button">
                    <span>Quick Send</span>
                    <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Main Operational Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-md">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-8 space-y-gutter-md">

                {/* Cashflow & Inflow Trends Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-surface-container-low gap-3">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface">Cashflow &amp; Inflow Trends</h2>
                      <p className="font-body-sm text-body-sm text-outline">Real-time credit settlement vs withdrawal ledger</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="inline-flex p-1 bg-surface-container-low rounded-lg">
                        <button className="px-3 py-1 text-primary bg-surface-container-lowest rounded font-label-sm text-label-sm font-semibold shadow-sm" type="button">Monthly</button>
                        <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded font-label-sm text-label-sm" type="button">Weekly</button>
                        <button className="px-3 py-1 text-on-surface-variant hover:text-on-surface rounded font-label-sm text-label-sm" type="button">All Time</button>
                      </div>
                      <span className="text-outline font-label-sm text-label-sm hidden sm:inline">|</span>
                      <div className="hidden sm:flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-outline font-label-sm text-label-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                          <span>Inflow (Credits)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-outline font-label-sm text-label-sm">
                          <span className="w-2.5 h-2.5 rounded-full bg-error"></span>
                          <span>Outflow</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Dynamic Chart Container — Real SVG Bar Chart */}
                  {(() => {
                    // Build last 12 months of data from transactions
                    const monthData: { label: string; inflow: number; outflow: number }[] = [];
                    const now = new Date();
                    for (let i = 11; i >= 0; i--) {
                      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                      const label = d.toLocaleDateString('en-US', { month: 'short' });
                      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                      
                      const monthTx = transactions.filter(t => {
                        const td = new Date(t.created_at);
                        return `${td.getFullYear()}-${String(td.getMonth() + 1).padStart(2, '0')}` === monthKey;
                      });
                      
                      const inflow = monthTx.filter(t => t.amount_paise > 0).reduce((s, t) => s + t.amount_paise, 0) / 100;
                      const outflow = Math.abs(monthTx.filter(t => t.amount_paise < 0).reduce((s, t) => s + t.amount_paise, 0)) / 100;
                      monthData.push({ label, inflow, outflow });
                    }
                    
                    const maxVal = Math.max(...monthData.map(m => Math.max(m.inflow, m.outflow)), 1);
                    const chartW = 100;
                    const chartH = 55;
                    const barW = chartW / monthData.length * 0.6;
                    const gap = chartW / monthData.length;
                    
                    return transactions.length === 0 ? (
                      <div className="relative w-full h-64 mt-4 flex flex-col items-center justify-center bg-surface-container-low/50 rounded-xl gap-2">
                        <span className="material-symbols-outlined text-[36px] text-outline">bar_chart</span>
                        <p className="font-body-sm text-outline">Chart will populate when transactions are recorded.</p>
                      </div>
                    ) : (
                      <div className="relative w-full h-64 mt-4">
                        <svg viewBox={`0 0 ${chartW} ${chartH + 10}`} className="w-full h-full" preserveAspectRatio="none">
                          {/* Grid lines */}
                          {[0, 0.25, 0.5, 0.75, 1].map((pct, i) => (
                            <line key={i} x1="0" y1={chartH * (1 - pct)} x2={chartW} y2={chartH * (1 - pct)} stroke="#e0e4ef" strokeWidth="0.2" strokeDasharray="1,1" />
                          ))}
                          {/* Inflow bars */}
                          {monthData.map((m, i) => {
                            const x = i * gap + gap * 0.1;
                            const h = (m.inflow / maxVal) * chartH;
                            return (
                              <g key={`in-${i}`}>
                                <rect x={x} y={chartH - h} width={barW * 0.45} height={Math.max(h, 0.3)} rx="0.5" fill="#003fb1" opacity="0.85">
                                  <animate attributeName="height" from="0" to={Math.max(h, 0.3)} dur="0.8s" fill="freeze" />
                                  <animate attributeName="y" from={chartH} to={chartH - h} dur="0.8s" fill="freeze" />
                                </rect>
                                <rect x={x + barW * 0.5} y={chartH - (m.outflow / maxVal) * chartH} width={barW * 0.45} height={Math.max((m.outflow / maxVal) * chartH, 0.2)} rx="0.5" fill="#dc2626" opacity="0.6">
                                  <animate attributeName="height" from="0" to={Math.max((m.outflow / maxVal) * chartH, 0.2)} dur="0.8s" fill="freeze" />
                                  <animate attributeName="y" from={chartH} to={chartH - (m.outflow / maxVal) * chartH} dur="0.8s" fill="freeze" />
                                </rect>
                                <text x={x + barW * 0.45} y={chartH + 5} textAnchor="middle" fill="#7a7c8d" fontSize="2.5" fontWeight="500">{m.label}</text>
                              </g>
                            );
                          })}
                        </svg>
                      </div>
                    );
                  })()}

                  {/* Mini KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter-sm mt-5 pt-4 border-t border-surface-container-low">
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/60">
                      <span className="material-symbols-outlined text-primary text-[24px]">payments</span>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline block">Avg Daily Credit</span>
                        <span className="font-headline-md text-headline-md text-on-surface">₹ <CountUp start={0} end={avgDailyCredit} duration={2.5} separator="," /></span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/60">
                      <span className="material-symbols-outlined text-tertiary text-[24px]">account_tree</span>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline block">Net Retention</span>
                        <span className="font-headline-md text-headline-md text-on-surface">{frontlineRetention}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low/60">
                      <span className="material-symbols-outlined text-secondary text-[24px]">task_alt</span>
                      <div>
                        <span className="font-label-sm text-label-sm text-outline block">Success Rate</span>
                        <span className="font-headline-md text-headline-md text-on-surface">{successRate}%</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Activate Downline Package */}
                <motion.div id="activate-downline-section" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-container-low">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[22px]">rocket_launch</span>
                      </div>
                      <div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Activate Downline Package</h2>
                        <span className="font-body-sm text-body-sm text-outline">Top up your account &amp; activate packages for your downline — earn a <strong className="text-tertiary">3% bonus discount</strong> on every top-up</span>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-tertiary/10 border border-tertiary/20">
                      <span className="material-symbols-outlined text-tertiary text-[16px]">local_offer</span>
                      <span className="font-label-sm text-label-sm font-bold text-tertiary">3% Top-Up Discount</span>
                    </div>
                  </div>

                  {/* Two-step flow */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-surface-container-low">

                    {/* STEP 1: Add Balance (with 3% discount) */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <span className="font-label-sm text-label-sm text-on-primary font-bold text-[11px]">1</span>
                        </div>
                        <span className="font-headline-md text-headline-md text-on-surface font-bold">Add Balance to Account</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-outline">Deposit funds to your activation wallet. You receive a <span className="text-tertiary font-semibold">3% instant discount</span> — pay less, activate more.</p>

                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Top-Up Amount (₹)</label>
                        <div className="relative">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-headline-md text-headline-md text-outline">₹</span>
                          <input
                            className="w-full pl-8 pr-20 py-3 bg-surface-container-low rounded-xl font-headline-md text-headline-md font-bold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all"
                            type="number"
                            value={topUpCardAmount === '' ? '' : topUpCardAmount}
                            onChange={(e) => setTopUpCardAmount(e.target.value === '' ? '' : (parseFloat(e.target.value) || 0))}
                            placeholder="Enter amount"
                          />
                          <button onClick={() => setTopUpCardAmount(totalEarned)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-primary font-label-sm text-label-sm font-bold uppercase hover:underline" type="button">Max</button>
                        </div>
                      </div>

                      {/* Discount Breakdown Card */}
                      <div className="p-3.5 rounded-xl bg-tertiary/5 border border-tertiary/15 space-y-2">
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                          <span className="text-outline">Top-Up Value</span>
                          <span className="font-semibold text-on-surface">₹ {(Number(topUpCardAmount) || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                          <span className="text-tertiary flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">local_offer</span> 3% Bonus</span>
                          <span className="font-bold text-tertiary">+ ₹ {((Number(topUpCardAmount) || 0) * 0.03).toLocaleString()}</span>
                        </div>
                        <div className="pt-2 border-t border-tertiary/15 flex items-center justify-between">
                          <span className="font-label-md text-label-md font-bold text-on-surface">Amount to Pay</span>
                          <span className="font-headline-md text-headline-md font-black text-primary">₹ {(Number(topUpCardAmount) || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs text-outline pt-1">
                          <span>Balance Added to Wallet</span>
                          <span className="font-bold text-primary">₹ {((Number(topUpCardAmount) || 0) * 1.03).toLocaleString()}</span>
                        </div>
                      </div>

                      <button onClick={() => openDepositModal(Number(topUpCardAmount) || 25000)} className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md font-bold transition-all shadow-md shadow-primary/20 flex items-center justify-center gap-2" type="button">
                        <span className="material-symbols-outlined text-[18px]">add_card</span>
                        Add Balance with 3% Bonus
                      </button>
                    </div>

                    {/* STEP 2: Activate Downline Package */}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center">
                          <span className="font-label-sm text-label-sm text-on-secondary font-bold text-[11px]">2</span>
                        </div>
                        <span className="font-headline-md text-headline-md text-on-surface font-bold">Activate Downline Package</span>
                      </div>
                      <p className="font-body-sm text-body-sm text-outline">Select a downline member and choose their activation package. Deducted from your activation wallet balance.</p>

                      {/* Downline Member Search */}
                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Select Downline Member</label>
                        <div className="relative">
                          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
                          <input 
                            value={activateUserId}
                            onChange={(e) => setActivateUserId(e.target.value)}
                            className={`w-full pl-9 pr-28 py-2.5 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 ${activateUserId && !isValidDirect ? 'focus:ring-error ring-1 ring-error' : 'focus:ring-primary/30'} transition-all`} 
                            type="text" 
                            placeholder="Enter member ID" 
                          />
                          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1 text-tertiary font-label-sm text-label-sm font-semibold">
                            {isValidDirect ? (
                              <>
                                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                                <span>Found</span>
                              </>
                            ) : activateUserId ? (
                              <span className="text-error text-xs">Not Direct</span>
                            ) : null}
                          </div>
                        </div>
                        {activateUserId && !isValidDirect && (
                          <p className="text-error font-body-sm text-[11px]">You can only activate packages for your direct referrals.</p>
                        )}
                      </div>

                      {/* Package selector */}
                      <div className="space-y-1.5">
                        <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Select Package to Activate</label>
                        <div className="grid grid-cols-3 gap-2">
                          {packages.length > 0 ? packages.map((pkg, i) => (
                            <label key={i} className="cursor-pointer group">
                              <input type="radio" name="pkg" value={pkg.id} onChange={() => setActivatePackage(pkg.id)} defaultChecked={i === 1} className="sr-only peer" />
                              <div className="p-2.5 rounded-xl border border-surface-container-high peer-checked:border-primary peer-checked:bg-primary/5 bg-surface-container-low flex flex-col items-center justify-center gap-1 transition-all text-center h-full">
                                {i === 1 && <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary font-label-sm text-[9px] font-bold uppercase">Popular</span>}
                                <span className="font-label-md text-label-md font-bold text-on-surface text-[12px]">{pkg.name}</span>
                                <span className="font-label-sm text-label-sm text-primary font-semibold text-[11px]">₹ {(pkg.price_inr / 100).toLocaleString()}</span>
                              </div>
                            </label>
                          )) : (
                            <div className="col-span-3 text-center text-outline text-sm py-2">Loading packages...</div>
                          )}
                        </div>
                      </div>

                      {/* Wallet balance preview */}
                      <div className="flex items-center justify-between px-3.5 py-2.5 bg-surface-container-low rounded-lg">
                        <span className="font-label-sm text-label-sm text-outline">Activation Wallet Balance</span>
                        <span className="font-label-md text-label-md font-bold text-tertiary">₹ {totalBalance.toLocaleString()}</span>
                      </div>

                      <button 
                        disabled={!isValidDirect}
                        onClick={submitActivatePackage} 
                        className={`w-full py-3 rounded-xl text-white font-label-md text-label-md font-bold transition-all shadow-md flex items-center justify-center gap-2 ${isValidDirect ? 'bg-secondary hover:bg-secondary-container shadow-secondary/20' : 'bg-surface-variant text-outline cursor-not-allowed shadow-none'}`} 
                        type="button"
                      >
                        <span className="material-symbols-outlined text-[18px]">bolt</span>
                        Activate Package for Downline
                      </button>
                    </div>
                  </div>
                </motion.div>

                {/* Sub-Wallet Balances */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface">Sub-Wallet Balances</h2>
                      <span className="font-body-sm text-body-sm text-outline">Distinct segregated accounts for commissions, liquidity, and E-Pins</span>
                    </div>
                    <button onClick={() => router.push('/dashboard/payout')} className="text-primary font-label-sm text-label-sm font-bold hover:underline flex items-center gap-1" type="button">
                      <span>Withdraw Funds</span>
                      <span className="material-symbols-outlined text-[16px]">sync_alt</span>
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 xl:gap-6 mt-4 mb-8">
                    {/* Available E-Wallet (Commissions) */}
                    <div className="p-4 rounded-xl bg-gradient-to-br from-brand-600 to-brand-700 text-white shadow-brand flex flex-col justify-between space-y-3 relative overflow-hidden">
                      {/* Abstract background shapes */}
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-black/10 rounded-full blur-xl -ml-8 -mb-8"></div>
                      
                      <div className="flex items-center justify-between relative z-10">
                        <span className="font-label-sm text-label-sm font-semibold uppercase text-white/80 tracking-wider">Available E-Wallet</span>
                        <span className="material-symbols-outlined text-white/90 text-[20px]">account_balance_wallet</span>
                      </div>
                      <div className="relative z-10">
                        <span className="font-headline-xl text-headline-xl font-bold">₹ <CountUp start={0} end={totalBalance} duration={2.5} separator="," /></span>
                        <p className="font-label-sm text-label-sm text-white/70 mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">info</span>
                          Available generated commissions
                        </p>
                      </div>
                      <button onClick={() => router.push('/dashboard/payout')} className="w-full py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-center font-label-sm text-label-sm font-semibold transition-colors relative z-10 backdrop-blur-sm border border-white/10" type="button">Request Payout</button>
                    </div>
                    
                    {/* Cash Wallet (Deposits/Activation Funds) */}
                    <div className="p-4 rounded-xl bg-surface-container-low/80 flex flex-col justify-between space-y-3 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-semibold uppercase text-outline">Cash Wallet (Deposits)</span>
                        <span className="material-symbols-outlined text-secondary text-[20px]">account_balance</span>
                      </div>
                      <div>
                        <span className="font-headline-xl text-headline-xl text-on-surface font-bold">₹ <CountUp start={0} end={depositBalance} duration={2.5} separator="," /></span>
                        <p className="font-label-sm text-label-sm text-outline mt-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">shield</span>
                          Funds for package activation
                        </p>
                      </div>
                      <button onClick={() => {
                        document.getElementById('activate-downline-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }} className="w-full py-1.5 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container text-center font-label-sm text-label-sm font-semibold transition-colors border border-slate-200" type="button">Deposit Funds</button>
                    </div>

                    {/* Total Income */}
                    <div className="p-4 rounded-xl bg-surface-container-low/80 flex flex-col justify-between space-y-3 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-semibold uppercase text-outline">Total Lifetime Income</span>
                        <span className="material-symbols-outlined text-primary text-[20px]">monetization_on</span>
                      </div>
                      <div>
                        <span className="font-headline-xl text-headline-xl text-on-surface font-bold">₹ <CountUp start={0} end={totalEarned} duration={2.5} separator="," /></span>
                        <p className="font-label-sm text-label-sm text-tertiary mt-1 flex items-center gap-1 font-semibold">
                          <span className="material-symbols-outlined text-[14px]">check</span>
                          Direct + Matching bonuses
                        </p>
                      </div>
                      <button onClick={() => router.push('/dashboard/reports')} className="w-full py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container text-center font-label-sm text-label-sm font-semibold transition-colors border border-slate-200" type="button">View Earnings History</button>
                    </div>

                    {/* Gift a Package Wallet */}
                    <div className="p-4 rounded-xl bg-surface-container-low/80 flex flex-col justify-between space-y-3 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm font-semibold uppercase text-outline">Gift a Package</span>
                        <span className="material-symbols-outlined text-tertiary text-[20px]">card_giftcard</span>
                      </div>
                      <div>
                        <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight block">Gift up to ₹53,200 worth of package</span>
                        <p className="font-label-sm text-label-sm text-outline mt-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px]">redeem</span>
                          Ready for downline activation
                        </p>
                      </div>
                      <button onClick={() => {
                        document.getElementById('activate-downline-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }} className="w-full py-1.5 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container text-center font-label-sm text-label-sm font-semibold transition-colors" type="button">Activate Package</button>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-4 space-y-gutter-md">
                {/* Income Inflow Sources Donut */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Income Inflow Sources</h2>
                    <span className="material-symbols-outlined text-outline text-[20px]">pie_chart</span>
                  </div>
                  <div className="flex flex-col items-center justify-center my-4">
                    <div className="relative w-44 h-44 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" fill="none" r="15.915" stroke="#eff4ff" strokeWidth={3.6} />
                        {binaryPct > 0 && <motion.circle initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${binaryPct}, 100` }} transition={{ duration: 1.5, delay: 1 }} cx="18" cy="18" fill="none" r="15.915" stroke="#003fb1" strokeDashoffset={0} strokeWidth={3.8} />}
                        {sponsorPct > 0 && <motion.circle initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${sponsorPct}, 100` }} transition={{ duration: 1.5, delay: 1 }} cx="18" cy="18" fill="none" r="15.915" stroke="#316bf3" strokeDashoffset={-binaryPct} strokeWidth={3.8} />}
                        {leadershipPct > 0 && <motion.circle initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${leadershipPct}, 100` }} transition={{ duration: 1.5, delay: 1 }} cx="18" cy="18" fill="none" r="15.915" stroke="#005438" strokeDashoffset={-(binaryPct + sponsorPct)} strokeWidth={3.8} />}
                        {rankPct > 0 && <motion.circle initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${rankPct}, 100` }} transition={{ duration: 1.5, delay: 1 }} cx="18" cy="18" fill="none" r="15.915" stroke="#c3c5d7" strokeDashoffset={-(binaryPct + sponsorPct + leadershipPct)} strokeWidth={3.8} />}
                        {repurchasePct > 0 && <motion.circle initial={{ strokeDasharray: "0, 100" }} animate={{ strokeDasharray: `${repurchasePct}, 100` }} transition={{ duration: 1.5, delay: 1 }} cx="18" cy="18" fill="none" r="15.915" stroke="#e0e4ef" strokeDashoffset={-(binaryPct + sponsorPct + leadershipPct + rankPct)} strokeWidth={3.8} />}
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center text-center">
                        <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline">Total Credited</span>
                        <span className="font-headline-lg text-headline-lg font-bold text-on-surface">₹ <CountUp start={0} end={totalEarned} duration={2.5} separator="," /></span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary"></span>
                        <span className="text-on-surface font-medium">Binary Matching Income ({binaryPct.toFixed(1)}%)</span>
                      </div>
                      <span className="font-semibold text-on-surface">₹ {wallet?.balances?.binaryIncome?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#316bf3]"></span>
                        <span className="text-on-surface font-medium">Sponsor Income ({sponsorPct.toFixed(1)}%)</span>
                      </div>
                      <span className="font-semibold text-on-surface">₹ {wallet?.balances?.sponsorIncome?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#005438]"></span>
                        <span className="text-on-surface font-medium">Leadership Bonus ({leadershipPct.toFixed(1)}%)</span>
                      </div>
                      <span className="font-semibold text-on-surface">₹ {wallet?.balances?.leadershipIncome?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#c3c5d7]"></span>
                        <span className="text-on-surface font-medium">Rank Bonus ({rankPct.toFixed(1)}%)</span>
                      </div>
                      <span className="font-semibold text-on-surface">₹ {wallet?.balances?.rankBonus?.toLocaleString() || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#e0e4ef]"></span>
                        <span className="text-on-surface font-medium">Repurchase Bonus ({repurchasePct.toFixed(1)}%)</span>
                      </div>
                      <span className="font-semibold text-on-surface">₹ {wallet?.balances?.repurchaseBonus?.toLocaleString() || 0}</span>
                    </div>
                  </div>
                </motion.div>

                {/* Payout Channels */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="bg-surface-container-lowest rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-surface-container-low">
                    <h2 className="font-headline-lg text-headline-lg text-on-surface">Payout Channels</h2>
                    <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-label-sm font-semibold">Daily Cap: ₹2.5L</span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {/* HDFC Bank */}
                    <div className="p-3.5 rounded-lg bg-surface-container-low/70 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">account_balance</span>
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5">
                            <span className="font-label-md text-label-md font-semibold text-on-surface">HDFC Bank Corp</span>
                            <span className="material-symbols-outlined text-tertiary text-[14px]">verified</span>
                          </div>
                          <span className="font-label-sm text-label-sm text-outline">A/C •••• 4921 (Primary)</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary font-label-sm text-label-sm font-semibold">Active</span>
                    </div>
                    {/* USDT TRC-20 */}
                    <div className="p-3.5 rounded-lg bg-surface-container-low/70 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">currency_bitcoin</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-semibold text-on-surface">USDT TRC-20</span>
                          <span className="font-label-sm text-label-sm text-outline">Addr: TXYZ••••8Fa2</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-label-sm font-semibold">Ready</span>
                    </div>
                    {/* UPI */}
                    <div className="p-3.5 rounded-lg bg-surface-container-low/70 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-surface-container text-on-surface-variant flex items-center justify-center">
                          <span className="material-symbols-outlined text-[20px]">qr_code_2</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-label-md text-label-md font-semibold text-on-surface">UPI Instant</span>
                          <span className="font-label-sm text-label-sm text-outline">ibrahim@okhdfcbank</span>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-surface-container text-outline font-label-sm text-label-sm font-semibold">Linked</span>
                    </div>
                  </div>
                  <button onClick={() => {
                    router.push('/dashboard/settings?tab=banking&action=add_bank')
                  }} className="w-full mt-4 py-2 rounded-lg bg-surface-container-low text-primary hover:bg-surface-container text-center font-label-md text-label-md font-semibold transition-colors flex items-center justify-center gap-1.5" type="button">
                    <span className="material-symbols-outlined text-[18px]">add_circle</span>
                    <span>Add Bank Account / UPI / Crypto</span>
                  </button>
                </motion.div>

                {/* Security & Regulatory Shield */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.1 }} className="bg-surface-container-lowest rounded-xl p-5 shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">security</span>
                    <span className="font-headline-md text-headline-md text-on-surface">Security &amp; Regulatory Shield</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-body-sm py-1 border-b border-surface-container-low">
                      <span className="text-outline">KYC Verification</span>
                      <span className="text-tertiary font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">check_circle</span>
                        Level 3 Approved
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm py-1 border-b border-surface-container-low">
                      <span className="text-outline">Two-Factor Authentication</span>
                      <span className="text-primary font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[14px]">lock</span>
                        Google 2FA Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-body-sm py-1">
                      <span className="text-outline">TDS Compliance</span>
                      <span className="text-on-surface font-semibold">5.0% Fixed PAN Compliant</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Full-Width Transaction & Audit Log */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.2 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-6 space-y-4">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Wallet Transactions &amp; Audit Log</h2>
                  <p className="font-body-sm text-body-sm text-outline">Immutable ledger of all wallet inflows, commissions, debits, and P2P transfers</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="relative min-w-[260px]">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">search</span>
                    <input className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all" placeholder="Search by Txn ID, Narration..." type="text" />
                  </div>
                  <button onClick={downloadStatement} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">sim_card_download</span>
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Filter Pills */}
              {(() => {
                const commissions = transactions.filter(t => ['BINARY_INCOME', 'SPONSOR_INCOME', 'LEADERSHIP_INCOME', 'RANK_BONUS'].includes(t.transaction_type || t.type));
                const withdrawals = transactions.filter(t => (t.transaction_type || t.type) === 'WITHDRAWAL');
                const purchases = transactions.filter(t => ['PACKAGE_PURCHASE', 'REACTIVATION', 'UPGRADE'].includes(t.transaction_type || t.type));
                const filters = [
                  { id: 'all', label: `All Transactions (${transactions.length})` },
                  { id: 'commissions', label: `Commissions (${commissions.length})` },
                  { id: 'bank', label: `Withdrawals (${withdrawals.length})` },
                  { id: 'epin', label: `Purchases (${purchases.length})` },
                ];
                return (
                  <div className="flex flex-wrap items-center gap-2 pt-1 border-b border-surface-container-low pb-3">
                    {filters.map(f => (
                      <button
                        key={f.id}
                        onClick={() => setActiveFilter(f.id)}
                        className={`px-3 py-1 rounded-full font-label-sm text-label-sm font-semibold transition-colors ${activeFilter === f.id ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}`}
                        type="button"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                );
              })()}

              {/* High-Density Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap">
                  <thead>
                    <tr className="bg-surface-container-low/70 text-outline font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-4 rounded-l-lg">Transaction ID</th>
                      <th className="py-3 px-4">Description &amp; Narration</th>
                      <th className="py-3 px-4">Wallet Type</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">TDS / Deductions</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right rounded-r-lg">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low font-body-sm text-body-sm text-on-surface">
                    {(() => {
                      let filtered = transactions;
                      if (activeFilter === 'commissions') filtered = transactions.filter(t => ['BINARY_INCOME', 'SPONSOR_INCOME', 'LEADERSHIP_INCOME', 'RANK_BONUS'].includes(t.transaction_type || t.type));
                      else if (activeFilter === 'bank') filtered = transactions.filter(t => (t.transaction_type || t.type) === 'WITHDRAWAL');
                      else if (activeFilter === 'epin') filtered = transactions.filter(t => ['PACKAGE_PURCHASE', 'REACTIVATION', 'UPGRADE'].includes(t.transaction_type || t.type));
                      
                      return filtered.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="py-8 text-center text-outline">No transactions found for this filter.</td>
                        </tr>
                      ) : (
                        filtered.map((tx: any, idx: number) => (
                          <tr key={idx} className="hover:bg-surface-container-low/40 transition-colors">
                            <td className="py-3.5 px-4 font-label-md text-label-md font-bold text-primary">
                              {tx.transaction_id || `TXN-${tx.id.substring(0, 6).toUpperCase()}`}
                            </td>
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center">
                                  <span className="material-symbols-outlined text-[18px]">receipt</span>
                                </div>
                                <div>
                                  <span className="font-label-md text-label-md font-semibold block text-on-surface">{tx.description}</span>
                                  <span className="font-label-sm text-label-sm text-outline">{tx.transaction_type || tx.type}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-label-sm font-semibold">Wallet</span>
                            </td>
                            <td className={`py-3.5 px-4 font-bold text-base ${tx.amount_inr_paise > 0 ? 'text-tertiary' : 'text-error'}`}>
                              {tx.amount_inr_paise > 0 ? '+' : '-'} ₹ {Math.abs(tx.amount_inr_paise / 100).toLocaleString('en-IN')}
                            </td>
                            <td className="py-3.5 px-4 text-outline font-label-sm text-label-sm">₹ 0</td>
                            <td className="py-3.5 px-4 text-outline">{new Date(tx.created_at).toLocaleDateString()}</td>
                            <td className="py-3.5 px-4"><span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">✓ Completed</span></td>
                            <td className="py-3.5 px-4 text-right"><button className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors" type="button"><span className="material-symbols-outlined text-[18px]">description</span></button></td>
                          </tr>
                        ))
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-gutter-sm pt-2 font-label-sm text-label-sm text-outline">
                <span>Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}</span>
              </div>
            </motion.div>

          </div>
        </main>
      </div>

      {/* Add Settlement Modal */}
      {showAddSettlementModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-surface rounded-2xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between p-6 border-b border-surface-container-low bg-surface-container-lowest">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">account_balance</span>
                Add Settlement Option
              </h3>
              <button onClick={() => setShowAddSettlementModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <p className="font-body-sm text-body-sm text-outline mb-2">Select the method you want to add for withdrawing your funds.</p>
              
              <div className="space-y-1.5">
                <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Payment Method</label>
                <select 
                  value={settlementMethod}
                  onChange={(e) => setSettlementMethod(e.target.value)}
                  className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                >
                  <option value="bank">Bank Account (NEFT/IMPS)</option>
                  <option value="upi">UPI ID</option>
                  <option value="crypto">Crypto</option>
                </select>
              </div>

              {settlementMethod === 'bank' && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Account Holder Name</label>
                    <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" type="text" placeholder="Full name on account" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Bank Account Number</label>
                    <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" type="text" placeholder="e.g. 123456789012" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">IFSC Code</label>
                      <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all uppercase" type="text" placeholder="e.g. HDFC0001234" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Branch Name</label>
                      <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" type="text" placeholder="e.g. Mumbai Main" />
                    </div>
                  </div>
                </>
              )}

              {settlementMethod === 'upi' && (
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">UPI ID</label>
                  <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" type="text" placeholder="e.g. name@okhdfcbank" />
                </div>
              )}

              {settlementMethod === 'crypto' && (
                <>
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Select Asset</label>
                    <select className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                      <option value="usdt">USDT (Tether)</option>
                      <option value="btc">BTC (Bitcoin)</option>
                      <option value="eth">ETH (Ethereum)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Network</label>
                    <select className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all">
                      <option value="trc20">TRC-20 (Tron)</option>
                      <option value="erc20">ERC-20 (Ethereum)</option>
                      <option value="bep20">BEP-20 (Binance Smart Chain)</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="font-label-sm text-label-sm uppercase tracking-wide text-on-surface-variant font-semibold">Wallet Address</label>
                    <input className="w-full px-4 py-3 bg-surface-container-low rounded-xl font-body-md text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all" type="text" placeholder="e.g. TXYZ... or 0x..." />
                  </div>
                </>
              )}

              <div className="mt-6">
                <button onClick={() => { alert('Settlement account added successfully!'); setShowAddSettlementModal(false); }} className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-white font-label-md text-label-md font-bold transition-all flex items-center justify-center gap-2" type="button">
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Account Details
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* DEPOSIT PAYMENT MODAL */}
      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            
            {/* Header */}
            <div className="p-6 bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-white/80">Add Balance</span>
                <h3 className="font-headline-lg text-headline-lg text-white font-bold">Top-Up with 3% Bonus</h3>
              </div>
              <button className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors" onClick={() => setShowDepositModal(false)} type="button">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Amount Summary */}
              <div className="p-4 bg-surface-container-low rounded-xl">
                <div className="font-label-sm text-label-sm text-outline mb-1">You Pay</div>
                <div className="flex items-baseline gap-2">
                  <div className="font-headline-xl text-headline-xl text-primary font-bold">₹ {(Number(depositAmount) || 0).toLocaleString()}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-surface-container-high flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
                    <span className="material-symbols-outlined text-tertiary text-[14px]">local_offer</span> 3% Bonus Added
                  </span>
                  <span className="font-label-md text-label-md font-bold text-tertiary">You Receive: ₹ {((Number(depositAmount) || 0) * 1.03).toLocaleString()}</span>
                </div>
                {/* Quick amount selector */}
                <div className="flex gap-2 mt-3">
                  {[5000, 10000, 25000, 50000].map(amt => (
                    <button key={amt} type="button" onClick={() => setDepositAmount(amt)}
                      className={`flex-1 py-1.5 rounded-lg text-center font-label-sm text-label-sm font-semibold transition-all ${
                        Number(depositAmount) === amt ? 'bg-primary text-white' : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                      }`}>
                      ₹{(amt/1000)}K
                    </button>
                  ))}
                </div>
                <div className="relative mt-2">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-outline font-headline-md">₹</span>
                  <input type="number" placeholder="Or enter custom amount" value={depositAmount}
                    onChange={e => setDepositAmount(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors"
                  />
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <p className="font-label-md text-label-md text-on-surface font-semibold">Select Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Card */}
                  <button type="button" onClick={() => setDepositPayMethod('card')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      depositPayMethod === 'card' ? 'border-primary bg-primary/5' : 'border-surface-container-high bg-surface-container-low hover:border-primary/40'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      depositPayMethod === 'card' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    </div>
                    <span className={`font-label-sm text-label-sm font-semibold ${
                      depositPayMethod === 'card' ? 'text-primary' : 'text-on-surface-variant'
                    }`}>Card</span>
                  </button>
                  {/* UPI */}
                  <button type="button" onClick={() => setDepositPayMethod('upi')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      depositPayMethod === 'upi' ? 'border-primary bg-primary/5' : 'border-surface-container-high bg-surface-container-low hover:border-primary/40'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      depositPayMethod === 'upi' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">smartphone</span>
                    </div>
                    <span className={`font-label-sm text-label-sm font-semibold ${
                      depositPayMethod === 'upi' ? 'text-primary' : 'text-on-surface-variant'
                    }`}>UPI</span>
                  </button>
                  {/* Crypto */}
                  <button type="button" onClick={() => setDepositPayMethod('crypto')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      depositPayMethod === 'crypto' ? 'border-primary bg-primary/5' : 'border-surface-container-high bg-surface-container-low hover:border-primary/40'
                    }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      depositPayMethod === 'crypto' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">currency_bitcoin</span>
                    </div>
                    <span className={`font-label-sm text-label-sm font-semibold ${
                      depositPayMethod === 'crypto' ? 'text-primary' : 'text-on-surface-variant'
                    }`}>Crypto</span>
                  </button>
                </div>
              </div>

              {/* CARD FORM */}
              {depositPayMethod === 'card' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Live card preview */}
                  <div className="relative w-full h-40 rounded-2xl bg-gradient-to-br from-primary via-primary to-secondary p-5 overflow-hidden shadow-lg">
                    <div className="absolute -right-6 -top-6 w-28 h-28 rounded-full bg-white/10"></div>
                    <div className="absolute -right-2 -bottom-8 w-36 h-36 rounded-full bg-white/10"></div>
                    <div className="relative z-10 flex flex-col h-full justify-between">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-label-sm text-white/70 uppercase tracking-wider">ELORA Executive Card</span>
                        <span className="material-symbols-outlined text-white text-[28px]">contactless</span>
                      </div>
                      <div>
                        <div className="font-headline-md text-headline-md text-white tracking-[0.15em] mb-2">
                          {depositCard.number || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[9px] text-white/60 uppercase">Card Holder</div>
                            <div className="font-label-sm text-label-sm text-white">{depositCard.name || 'YOUR NAME'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-white/60 uppercase">Expires</div>
                            <div className="font-label-sm text-label-sm text-white">{depositCard.expiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Card Number</label>
                    <input type="text" placeholder="1234 5678 9012 3456" maxLength={19} value={depositCard.number}
                      onChange={e => setDepositCard(p => ({ ...p, number: formatDepositCardNumber(e.target.value) }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" />
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Name on Card</label>
                    <input type="text" placeholder="Full Name" value={depositCard.name}
                      onChange={e => setDepositCard(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Expiry Date</label>
                      <input type="text" placeholder="MM/YY" maxLength={5} value={depositCard.expiry}
                        onChange={e => setDepositCard(p => ({ ...p, expiry: formatDepositExpiry(e.target.value) }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" />
                    </div>
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">CVV</label>
                      <input type="password" placeholder="•••" maxLength={4} value={depositCard.cvv}
                        onChange={e => setDepositCard(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" />
                    </div>
                  </div>
                </div>
              )}

              {/* UPI FORM */}
              {depositPayMethod === 'upi' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#5A21B3]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#5A21B3] font-bold text-lg">UPI</span>
                    </div>
                    <div>
                      <div className="font-label-md text-label-md font-semibold text-on-surface">Instant Payment via UPI</div>
                      <div className="font-body-sm text-body-sm text-outline">Supports BHIM, GPay, PhonePe, Paytm &amp; all UPI apps</div>
                    </div>
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Your UPI ID</label>
                    <div className="relative">
                      <input type="text" placeholder="yourname@upi" value={depositUpiId}
                        onChange={e => setDepositUpiId(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors" />
                      {depositUpiId.includes('@') && (
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-tertiary text-[20px]">check_circle</span>
                      )}
                    </div>
                    <p className="font-label-sm text-label-sm text-outline mt-1">Example: name@okicici, name@ybl, name@paytm</p>
                  </div>
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                    <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">info</span>
                    <p className="font-body-sm text-body-sm text-amber-800">After clicking Confirm, a payment request will be sent to your UPI app. Please approve within 5 minutes.</p>
                  </div>
                </div>
              )}

              {/* CRYPTO FORM */}
              {depositPayMethod === 'crypto' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">info</span>
                    <p className="font-body-sm text-body-sm text-blue-800">Send the INR equivalent in crypto to one of the addresses below. Share your transaction hash with support to confirm. Balance is credited within 30 mins.</p>
                  </div>
                  {depositCryptoAddresses.map((crypto) => (
                    <div key={crypto.coin} className="flex items-center gap-3 p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: crypto.color }}>
                        {crypto.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-label-sm text-label-sm text-outline">{crypto.coin}</div>
                        <div className="font-body-sm text-body-sm text-on-surface font-medium truncate">{crypto.address}</div>
                      </div>
                      <button type="button" onClick={() => handleCopyDepositAddr(crypto.address)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors">
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                          {copiedDepositAddr === crypto.address ? 'check' : 'content_copy'}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{copiedDepositAddr === crypto.address ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                  onClick={() => setShowDepositModal(false)} type="button">Cancel</button>
                <button className="px-6 py-2 rounded-xl bg-primary text-white font-label-md text-label-md hover:bg-secondary shadow-md transition-all"
                  onClick={async () => {
                    if (depositPayMethod === 'crypto') {
                      alert('Please send the payment and contact support with your transaction hash.')
                      setShowDepositModal(false)
                      return
                    }
                    await fetch('/api/wallet/topup', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ amount: Number(depositAmount), utr: 'PENDING-' + Date.now() }) })
                    setShowDepositModal(false)
                    alert(`Top-up request submitted! You will receive ₹${((Number(depositAmount) || 0) * 1.03).toLocaleString()} (includes 3% bonus).`)
                  }}
                  type="button">
                  {depositPayMethod === 'crypto' ? 'I Have Sent Payment' : `Pay ₹${(Number(depositAmount) || 0).toLocaleString()}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activate Downline Modal */}
      {showActivateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-surface-container-lowest rounded-2xl p-6 shadow-xl max-w-md w-full border border-outline-variant/30">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline-md text-headline-md font-bold text-on-surface">Activate Downline Package</h3>
              <button onClick={() => setShowActivateModal(false)} className="text-outline hover:text-on-surface">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-6">Activate a downline member directly from your Cash Wallet balance and receive a <strong className="text-tertiary">3% instant discount</strong>.</p>
            
            <div className="space-y-4">

              {/* Error/Success Banners Moved Globally */}

              <div>
                <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">Downline Username</label>
                <input 
                  type="text"
                  placeholder="Enter their username (e.g. johndoe)"
                  value={activateUserId}
                  onChange={(e) => { setActivateUserId(e.target.value); setActionError(''); }}
                  className={`w-full p-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 font-bold ${activateUserId && !isValidDirect ? 'focus:ring-error ring-1 ring-error' : 'focus:ring-primary'}`}
                />
                {activateUserId && !isValidDirect && (
                  <p className="text-error font-body-sm text-[11px] mt-1">Username not found in your direct team. Only direct referrals can be activated.</p>
                )}
                {activateUserId && isValidDirect && (
                  <p className="text-tertiary font-body-sm text-[11px] mt-1 flex items-center gap-1"><span className="material-symbols-outlined text-[13px]">check_circle</span> Direct member found ✓</p>
                )}
              </div>
              <div>
                <label className="block font-label-md text-label-md font-semibold text-on-surface mb-1">Select Package</label>
                <select 
                  value={activatePackage}
                  onChange={(e) => setActivatePackage(e.target.value)}
                  className="w-full p-3 rounded-lg bg-surface-container-low focus:outline-none focus:ring-1 focus:ring-primary font-semibold"
                >
                  {packages.length > 0 ? (
                    packages.map((pkg) => (
                      <option key={pkg.id} value={pkg.id}>
                        {pkg.name} Package (₹{(pkg.price_inr / 100).toLocaleString()})
                      </option>
                    ))
                  ) : (
                    <option value="">Loading...</option>
                  )}
                </select>
              </div>
              
              <div className="p-4 rounded-xl bg-surface-container-low space-y-2">
                <div className="flex justify-between font-body-sm text-on-surface">
                  <span>Package MRP:</span>
                  <span className="font-semibold">
                    ₹{packages.find(p => p.id === activatePackage) ? (packages.find(p => p.id === activatePackage).price_inr / 100).toLocaleString() : 0}
                  </span>
                </div>
                <div className="flex justify-between font-body-sm text-on-surface">
                  <span>3% Sponsor Discount:</span>
                  <span className="font-semibold text-tertiary">
                    - ₹{packages.find(p => p.id === activatePackage) ? Math.floor(packages.find(p => p.id === activatePackage).price_inr * 0.03 / 100).toLocaleString() : 0}
                  </span>
                </div>
                <div className="pt-2 border-t border-outline-variant/30 flex justify-between font-label-md text-label-md font-bold text-on-surface">
                  <span>Net Deduction from Cash Wallet:</span>
                  <span className="text-primary">
                    ₹{packages.find(p => p.id === activatePackage) ? Math.floor(packages.find(p => p.id === activatePackage).price_inr * 0.97 / 100).toLocaleString() : 0}
                  </span>
                </div>
              </div>

              <button 
                disabled={!isValidDirect || actionLoading}
                onClick={submitActivatePackage}
                className={`w-full py-3 rounded-lg text-white font-headline-md text-headline-md font-semibold transition-all flex items-center justify-center gap-2 ${isValidDirect && !actionLoading ? 'bg-secondary hover:bg-secondary-container' : 'bg-surface-variant text-outline cursor-not-allowed'}`}
              >
                <span className="material-symbols-outlined text-[20px]">bolt</span>
                {actionLoading ? 'Activating...' : 'Activate Now — Enter PIN'}
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Transaction PIN Modal */}
      <TransactionPinModal 
        isOpen={pinModal.isOpen} 
        onClose={() => setPinModal(prev => ({ ...prev, isOpen: false }))} 
        onSuccess={pinModal.onVerify} 
        actionName={pinModal.actionName} 
      />
    </div>
  )
}
