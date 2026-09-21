'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function BusinessCommandCenter() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [upgradePackage, setUpgradePackage] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState<'card'|'upi'|'crypto'>('card')
  const [cardDetails, setCardDetails] = useState({ number: '', name: '', expiry: '', cvv: '' })
  const [upiId, setUpiId] = useState('')
  const [copiedAddress, setCopiedAddress] = useState<string|null>(null)

  const cryptoAddresses = [
    { coin: 'USDT (TRC20)', address: 'TRX_ADDRESS_PLACEHOLDER', icon: '₮', color: '#26A17B' },
    { coin: 'Bitcoin (BTC)', address: 'BTC_ADDRESS_PLACEHOLDER', icon: '₿', color: '#F7931A' },
    { coin: 'Ethereum (ETH)', address: 'ETH_ADDRESS_PLACEHOLDER', icon: 'Ξ', color: '#627EEA' },
  ]

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address)
    setCopiedAddress(address)
    setTimeout(() => setCopiedAddress(null), 2000)
  }

  const formatCardNumber = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ')
  }

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0,2) + '/' + digits.slice(2)
    return digits
  }
  
  // Real Data states
  const [loading, setLoading] = useState(true)
  const [team, setTeam] = useState<any[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5
  const router = useRouter()

  useEffect(() => {
    if (!contextLoading) {
      setLoading(false)
      const fetchTeam = async () => {
        try {
          const res = await fetch('/api/user/team')
          if (res.ok) {
            const data = await res.json()
            setTeam(data.members || [])
          }
        } catch (err) {}
      }
      fetchTeam()
    }
  }, [contextLoading])

  const leftVol = (treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.leftBvCarryover || 0)
  const rightVol = (treeStats?.volumes?.rightBv || 0) + (treeStats?.volumes?.rightBvCarryover || 0)
  const totalVol = leftVol + rightVol
  
  const totalEarned = (wallet?.balances?.binaryIncome || 0) + (wallet?.balances?.sponsorIncome || 0) + (wallet?.balances?.leadershipIncome || 0) + (wallet?.balances?.rankBonus || 0) + (wallet?.balances?.tradingIncome || 0)

  // Derived Dynamic Metrics
  const targetVol = Math.max(totalVol * 1.5, 1000)
  const targetProgress = Math.min((totalVol / targetVol) * 100, 100).toFixed(1)
  
  const maxBinary = (rank?.weeklyCap * 100) ? (profile.binary_income_limit / 100) : 1
  const binaryCycleUsed = Math.min(((wallet?.balances?.binaryIncome || 0) / maxBinary) * 100, 100).toFixed(1)
  
  const activeDirects = rank?.activeDirects || 0
  const totalDirects = team ? team.filter((m: any) => m.level === 1).length : 0
  const frontlineRetention = totalDirects > 0 ? ((activeDirects / totalDirects) * 100).toFixed(1) : "0.0"

  const totalBv = Math.max(leftVol + rightVol, 1)
  const leftBvPercent = ((leftVol / totalBv) * 100).toFixed(1)
  const rightBvPercent = ((rightVol / totalBv) * 100).toFixed(1)

  // Donut Chart Math
  const totalEarningForChart = Math.max(totalEarned, 1)
  const binaryPct = ((wallet?.balances?.binaryIncome || 0) / totalEarningForChart) * 100
  const sponsorPct = ((wallet?.balances?.sponsorIncome || 0) / totalEarningForChart) * 100
  const leadershipPct = ((wallet?.balances?.leadershipIncome || 0) / totalEarningForChart) * 100
  const rankPct = ((wallet?.balances?.rankBonus || 0) / totalEarningForChart) * 100
  const tradingPct = ((wallet?.balances?.tradingIncome || 0) / totalEarningForChart) * 100

  // Package States
  const isStarterActive = profile?.package_name === 'Starter'
  const isGrowthActive = profile?.package_name === 'Growth Partner' || profile?.package_name === 'Pro'
  const isExecutiveActive = profile?.package_name === 'Executive Pro' || profile?.package_name === 'Elite'
  
  const isStarterCompleted = isGrowthActive || isExecutiveActive
  const isGrowthCompleted = isExecutiveActive
  const hasAnyPackage = isStarterActive || isGrowthActive || isExecutiveActive

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      {/* Universal Dashboard Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">
            {/* HEADER BAR OVERRIDE & SUB-ACTION CONTEXT */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md pb-gutter-xs">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                  <Link className="hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-semibold">Business Overview & Packages</span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface mt-1 tracking-tight">Business Command Center</h1>
              </div>
              <div className="flex items-center gap-gutter-sm self-start md:self-auto">
                <button className="flex items-center gap-2 px-gutter-md py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-low shadow-sm font-label-md text-label-md transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px] text-primary">download</span>
                  <span>Download Sales Report</span>
                </button>
                <button 
                  className="relative overflow-hidden flex items-center gap-2 px-gutter-lg py-2.5 rounded-xl bg-primary text-white font-label-md text-label-md shadow-md hover:bg-secondary transition-all group" 
                  onClick={() => setUpgradePackage({ name: 'Executive Pro', price: 53200, pv: 1800, isUpgrade: hasAnyPackage })} 
                  type="button"
                >
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                  <span>Upgrade Package</span>
                  <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-[300%] transition-transform duration-1000"></div>
                </button>
              </div>
            </div>

            {/* 1. TOP KPI COMMAND BAR */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter-md">
              {/* KPI 1: Total BV */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-surface-container-lowest/90 backdrop-blur-md p-gutter-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Business Volume</span>
                </div>
                <div className="my-3">
                  <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight"><CountUp start={0} end={totalVol} duration={2.5} separator="," /> BV</div>
                  <div className="font-body-sm text-body-sm text-outline mt-0.5">
                    Left: {leftVol} BV &nbsp;·&nbsp; Right: {rightVol} BV
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-outline font-label-sm text-label-sm">
                    <span>Network Members</span>
                    <span className="text-on-surface font-semibold">{treeStats?.memberCount?.total || 0} total</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${leftVol > 0 || rightVol > 0 ? Math.min(((leftVol / Math.max(leftVol, rightVol)) * 100), 100) : 0}%` }}></div>
                  </div>
                </div>
              </motion.div>

              {/* KPI 2: Active Package Status */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface-container-lowest/90 backdrop-blur-md p-gutter-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Active Package</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">Package 2 of 3</span>
                </div>
                <div className="my-3">
                  <div className="flex items-center gap-1.5 font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    <span>{profile?.package_name || 'No Package'}</span>
                    <span className="material-symbols-outlined text-primary text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-outline mt-0.5">Max Binary: ₹{(rank?.weeklyCap * 100) ? (profile.binary_income_limit / 100).toLocaleString() : '0'}</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-outline font-label-sm text-label-sm">
                    <span>5× Binary Cycle Used</span>
                    <span className="text-primary font-semibold">{binaryCycleUsed}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-secondary rounded-full" style={{ width: `${binaryCycleUsed}%` }}></div>
                  </div>
                </div>
              </motion.div>

              {/* KPI 3: Direct Referral Volume */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-surface-container-lowest/90 backdrop-blur-md p-gutter-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Direct Referrals</span>
                  <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-secondary-container/10 text-secondary font-label-sm text-label-sm font-bold">
                    +3 new
                  </span>
                </div>
                <div className="my-3">
                  <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight"><CountUp start={0} end={totalDirects} duration={2.5} separator="," /> Members</div>
                  <div className="font-body-sm text-body-sm text-outline mt-0.5"><CountUp start={0} end={activeDirects} duration={2.5} /> Active Frontline Leaders</div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-outline font-label-sm text-label-sm">
                    <span>Frontline Retention</span>
                    <span className="text-on-surface font-semibold">{frontlineRetention}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-tertiary rounded-full" style={{ width: `${frontlineRetention}%` }}></div>
                  </div>
                </div>
              </motion.div>

              {/* KPI 4: Matching Bonus Pool */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface-container-lowest/90 backdrop-blur-md p-gutter-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Team Match Bonus</span>
                  <span className="material-symbols-outlined text-[18px] text-outline">schedule</span>
                </div>
                <div className="my-3">
                  <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight">₹ <CountUp start={0} end={wallet?.balances?.binaryIncome || 0} duration={2.5} separator="," /></div>
                  <div className="font-body-sm text-body-sm text-tertiary mt-0.5 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Ready for settlement
                  </div>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm pt-1">
                  <span>Cycle Close</span>
                  <span className="font-semibold text-on-surface">Friday 00:00 UTC</span>
                </div>
              </motion.div>

              {/* KPI 5: Royal Sapphire Highlight Card */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-gradient-to-br from-primary via-primary-container to-secondary text-white p-gutter-md rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-white/80">Total Business Earning</span>
                  <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">account_balance_wallet</span>
                </div>
                <div className="my-3">
                  <div className="font-headline-xl text-headline-xl font-bold tracking-tight text-white">₹ <CountUp start={0} end={totalEarned} duration={2.5} separator="," /></div>
                  <div className="font-body-sm text-body-sm text-on-primary-container mt-0.5">Withdrawn: ₹ {(wallet?.balances?.totalWithdrawn || 0).toLocaleString()}</div>
                </div>
                <div className="pt-1">
                  <button className="w-full py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-label-sm text-label-sm flex items-center justify-center gap-1.5 transition-all" type="button">
                    <span>Withdraw</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* 2. MAIN OPERATIONAL GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
              {/* LEFT COLUMN (Approx 65%) */}
              <div className="lg:col-span-8 space-y-gutter-lg">
                {/* SECTION 1: ACTIVE PACKAGES & UPGRADE TIERS */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-surface-container-lowest rounded-2xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm">
                    <div>
                      <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest">Multi-Tier Subscriptions</span>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Active Packages &amp; Upgrade Tiers</h2>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-label-sm text-label-sm text-outline">Network Capping Multipliers Active</span>
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter-md mt-4">
                    {/* Package 1 — Starter */}
                    <div className={`rounded-xl p-gutter-md flex flex-col justify-between transition-all ${isStarterCompleted ? 'bg-surface-container-low/70 opacity-80 hover:opacity-100' : isStarterActive ? 'bg-surface-container-lowest shadow-md ring-2 ring-primary relative' : 'bg-surface-container-lowest shadow-sm hover:shadow-md'}`}>
                      {isStarterActive && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white font-label-sm text-label-sm tracking-wide shadow-sm flex items-center gap-1 whitespace-nowrap z-10">
                          <span className="material-symbols-outlined text-[14px]">stars</span> Current Plan
                        </div>
                      )}
                      <div className={isStarterActive ? 'pt-2' : ''}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-label-sm text-label-sm font-bold ${isStarterActive ? 'text-primary' : 'text-outline'}`}>Package 01</span>
                          {isStarterCompleted && <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-outline">Completed</span>}
                          {isStarterActive && <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">Active</span>}
                        </div>
                        <h3 className={`font-headline-md text-headline-md ${isStarterActive ? 'text-on-surface font-bold' : 'text-on-surface'}`}>Starter</h3>
                        <div className={`font-headline-lg text-headline-lg mt-1 ${isStarterActive ? 'text-primary font-bold' : 'text-on-surface'}`}>₹ 4,825</div>
                        <div className="font-body-sm text-body-sm text-outline mb-1">100 BV Generated</div>
                        {/* Max Binary Limit bar */}
                        <div className={`mb-3 p-2 rounded-lg ${isStarterActive ? 'bg-primary-fixed/40' : 'bg-surface-container'}`}>
                          <div className={`flex justify-between font-label-sm text-label-sm mb-1 ${isStarterActive ? 'text-primary' : 'text-outline'}`}>
                            <span>Max Binary Income</span>
                            <span className={isStarterActive ? 'font-bold' : 'font-semibold text-on-surface'}>₹24,125</span>
                          </div>
                          <div className="text-[10px] text-outline">= 5× of package price</div>
                        </div>
                        <ul className={`space-y-1.5 font-body-sm text-body-sm ${isStarterActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">account_tree</span> Binary: 100BV+100BV = ₹800</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">currency_exchange</span> Trading Access Included</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">trending_up</span> $10K Funded Account</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">shield</span> Bronze Rank · ₹25K/wk Cap</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">group</span> 10-Level Sponsor Income</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">workspace_premium</span> 20-Level Leadership Pool</li>
                        </ul>
                      </div>
                      {isStarterCompleted ? (
                        <button className="mt-4 w-full py-1.5 rounded-lg bg-surface-container text-outline font-label-sm text-label-sm cursor-not-allowed" disabled>Completed</button>
                      ) : isStarterActive ? (
                        <div className="mt-4 py-1.5 text-center rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">Active Subscription</div>
                      ) : (
                        <button className="mt-4 w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-label-md text-label-md shadow-sm transition-all" onClick={() => setUpgradePackage({ name: 'Starter', price: 4825, pv: 100, isUpgrade: hasAnyPackage })} type="button">Activate Package</button>
                      )}
                    </div>

                    {/* Package 2 — Growth Partner */}
                    <div className={`rounded-xl p-gutter-md flex flex-col justify-between transition-all ${isGrowthCompleted ? 'bg-surface-container-low/70 opacity-80 hover:opacity-100' : isGrowthActive ? 'bg-surface-container-lowest shadow-md ring-2 ring-primary relative' : 'bg-surface-container-lowest shadow-sm hover:shadow-md'}`}>
                      {isGrowthActive && (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white font-label-sm text-label-sm tracking-wide shadow-sm flex items-center gap-1 whitespace-nowrap z-10">
                          <span className="material-symbols-outlined text-[14px]">stars</span> Current Plan
                        </div>
                      )}
                      <div className={isGrowthActive ? 'pt-2' : ''}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-label-sm text-label-sm font-bold ${isGrowthActive ? 'text-primary' : 'text-outline'}`}>Package 02</span>
                          {isGrowthCompleted && <span className="px-2 py-0.5 rounded-full bg-surface-container font-label-sm text-label-sm text-outline">Completed</span>}
                          {isGrowthActive && <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">Active</span>}
                        </div>
                        <h3 className={`font-headline-md text-headline-md ${isGrowthActive ? 'text-on-surface font-bold' : 'text-on-surface'}`}>Growth Partner</h3>
                        <div className={`font-headline-lg text-headline-lg mt-1 ${isGrowthActive ? 'text-primary font-bold' : 'text-on-surface'}`}>₹ 16,899</div>
                        <div className="font-body-sm text-body-sm text-outline mb-1">450 BV Generated</div>
                        {/* Max Binary Limit bar */}
                        <div className={`mb-3 p-2 rounded-lg ${isGrowthActive ? 'bg-primary-fixed/40' : 'bg-surface-container'}`}>
                          <div className={`flex justify-between font-label-sm text-label-sm mb-1 ${isGrowthActive ? 'text-primary' : 'text-outline'}`}>
                            <span>Max Binary Income</span>
                            <span className={isGrowthActive ? 'font-bold' : 'font-semibold text-on-surface'}>₹84,495</span>
                          </div>
                          <div className="text-[10px] text-outline">= 5× of package price · BV carries forward</div>
                        </div>
                        <ul className={`space-y-1.5 font-body-sm text-body-sm ${isGrowthActive ? 'text-on-surface' : 'text-on-surface-variant'}`}>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">account_tree</span> Binary: 100BV+100BV = ₹800</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">currency_exchange</span> Trading Access Included</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">trending_up</span> $25K Funded Account</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">shield</span> Bronze Rank · ₹25K/wk Cap</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">group</span> 10-Level Sponsor Income</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-tertiary">workspace_premium</span> 20-Level Leadership Pool</li>
                        </ul>
                      </div>
                      {isGrowthCompleted ? (
                        <button className="mt-4 w-full py-1.5 rounded-lg bg-surface-container text-outline font-label-sm text-label-sm cursor-not-allowed" disabled>Completed</button>
                      ) : isGrowthActive ? (
                        <div className="mt-4 py-1.5 text-center rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">Active Subscription</div>
                      ) : (
                        <button className="mt-4 w-full py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-label-md text-label-md shadow-sm transition-all" onClick={() => setUpgradePackage({ name: 'Growth Partner', price: 16899, pv: 450, isUpgrade: hasAnyPackage })} type="button">{hasAnyPackage ? 'Upgrade Now' : 'Activate Package'}</button>
                      )}
                    </div>

                    {/* Package 3 — Executive Pro */}
                    <div className={`rounded-xl p-gutter-md shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative ${isExecutiveActive ? 'bg-surface-container-lowest ring-2 ring-primary' : 'bg-gradient-to-b from-surface-container-low to-surface-container-lowest'}`}>
                      {isExecutiveActive ? (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-white font-label-sm text-label-sm tracking-wide shadow-sm flex items-center gap-1 whitespace-nowrap z-10">
                          <span className="material-symbols-outlined text-[14px]">stars</span> Current Plan
                        </div>
                      ) : (
                        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-secondary text-white font-label-sm text-label-sm tracking-wide shadow-sm flex items-center gap-1 whitespace-nowrap z-10">
                          <span className="material-symbols-outlined text-[14px]">bolt</span> Recommended
                        </div>
                      )}
                      <div className="pt-2">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`font-label-sm text-label-sm font-bold ${isExecutiveActive ? 'text-primary' : 'text-secondary'}`}>Package 03</span>
                          {isExecutiveActive ? (
                            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">Active</span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary font-label-sm text-label-sm font-semibold">Highest BV</span>
                          )}
                        </div>
                        <h3 className={`font-headline-md text-headline-md font-bold ${isExecutiveActive ? 'text-on-surface' : 'text-on-surface'}`}>Executive Pro</h3>
                        <div className={`font-headline-lg text-headline-lg font-bold mt-1 ${isExecutiveActive ? 'text-primary' : 'text-on-surface'}`}>₹ 53,200</div>
                        <div className="font-body-sm text-body-sm text-outline mb-1">1,800 BV Generated</div>
                        {/* Max Binary Limit bar */}
                        <div className={`mb-3 p-2 rounded-lg ${isExecutiveActive ? 'bg-primary-fixed/40' : 'bg-surface-container'}`}>
                          <div className={`flex justify-between font-label-sm text-label-sm mb-1 ${isExecutiveActive ? 'text-primary' : 'text-secondary'}`}>
                            <span>Max Binary Income</span>
                            <span className="font-bold">₹2,66,000</span>
                          </div>
                          <div className="text-[10px] text-outline">= 5× of package price · Reactivate anytime</div>
                        </div>
                        <ul className="space-y-1.5 font-body-sm text-body-sm text-on-surface">
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-secondary">account_tree</span> Binary: 100BV+100BV = ₹800</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-secondary">currency_exchange</span> Trading Access Included</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-secondary">trending_up</span> $100K Funded Account</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-secondary">shield</span> Bronze Rank · ₹25K/wk Cap</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-secondary">group</span> 10-Level Sponsor Income</li>
                          <li className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[16px] text-secondary">workspace_premium</span> 20-Level Leadership Pool</li>
                        </ul>
                      </div>
                      {isExecutiveActive ? (
                        <div className="mt-4 py-1.5 text-center rounded-lg bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">Active Subscription</div>
                      ) : (
                        <button className="mt-4 w-full py-2 rounded-lg bg-secondary hover:bg-primary text-white font-label-md text-label-md shadow-sm transition-all flex items-center justify-center gap-1" onClick={() => setUpgradePackage({ name: 'Executive Pro', price: 53200, pv: 1800, isUpgrade: hasAnyPackage })} type="button">
                          <span>{hasAnyPackage ? 'Upgrade Now' : 'Activate Package'}</span>
                          <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                        </button>
                      )}
                  </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-surface-container-lowest rounded-2xl p-gutter-lg shadow-sm space-y-gutter-md">
                  {/* SECTION 2: LEG BV BREAKDOWN */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm">
                    <div>
                      <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Dual-Leg Analytics</span>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Leg BV Breakdown</h2>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-outline">
                      <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block"></span> Left Leg
                      <span className="w-2.5 h-2.5 rounded-sm bg-secondary-container inline-block ml-2"></span> Right Leg
                    </div>
                  </div>

                  {/* Real Data Bar Chart */}
                  {totalVol === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-outline">
                      <span className="material-symbols-outlined text-[36px]">bar_chart</span>
                      <span className="font-label-md text-label-md">No BV data yet — activate a package to start</span>
                    </div>
                  ) : (
                    <div className="space-y-5 py-2">
                      {/* Left Leg Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm bg-primary inline-block"></span>
                            <span className="font-semibold text-on-surface">Left Leg</span>
                            <span className="text-outline">{treeStats?.memberCount?.left || 0} members</span>
                          </div>
                          <span className="font-bold text-primary">{leftVol} BV ({leftBvPercent}%)</span>
                        </div>
                        <div className="w-full h-8 bg-surface-container rounded-lg overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${leftBvPercent}%` }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="h-full bg-primary rounded-lg flex items-center justify-end pr-2"
                          >
                            {Number(leftBvPercent) > 10 && <span className="text-on-primary font-bold text-xs">{leftVol} BV</span>}
                          </motion.div>
                        </div>
                      </div>

                      {/* Right Leg Bar */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between font-label-sm text-label-sm">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-sm bg-secondary-container inline-block"></span>
                            <span className="font-semibold text-on-surface">Right Leg</span>
                            <span className="text-outline">{treeStats?.memberCount?.right || 0} members</span>
                          </div>
                          <span className="font-bold text-secondary-container">{rightVol} BV ({rightBvPercent}%)</span>
                        </div>
                        <div className="w-full h-8 bg-surface-container rounded-lg overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${rightBvPercent}%` }}
                            transition={{ duration: 1, delay: 0.5 }}
                            className="h-full bg-secondary-container rounded-lg flex items-center justify-end pr-2"
                          >
                            {Number(rightBvPercent) > 10 && <span className="text-on-secondary-container font-bold text-xs">{rightVol} BV</span>}
                          </motion.div>
                        </div>
                      </div>

                      {/* Balance Ratio */}
                      <div className="flex items-center justify-between pt-2 border-t border-surface-container">
                        <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline">
                          <span className="material-symbols-outlined text-[16px] text-tertiary">balance</span>
                          <span>Leg Balance Ratio</span>
                        </div>
                        <span className="font-label-sm text-label-sm font-bold text-on-surface">
                          {leftVol > 0 || rightVol > 0
                            ? `${Math.min(leftVol, rightVol)} : ${Math.max(leftVol, rightVol)}`
                            : '—'
                          }
                          {leftVol === rightVol && leftVol > 0 && <span className="ml-1.5 text-tertiary text-xs font-semibold">✓ Perfectly Balanced</span>}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Sub-stats Bar — Real Data */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter-sm pt-2">
                    <div className="p-gutter-sm bg-surface-container-low rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">group</span>
                      </div>
                      <div>
                        <div className="font-label-sm text-label-sm text-outline">Total Network</div>
                        <div className="font-headline-md text-headline-md text-on-surface font-bold"><CountUp start={0} end={treeStats?.memberCount?.total || 0} duration={2} /> Members</div>
                      </div>
                    </div>
                    <div className="p-gutter-sm bg-surface-container-low rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-[20px]">trending_up</span>
                      </div>
                      <div>
                        <div className="font-label-sm text-label-sm text-outline">Total BV Generated</div>
                        <div className="font-headline-md text-headline-md text-on-surface font-bold"><CountUp start={0} end={totalVol} duration={2} separator="," /> BV</div>
                      </div>
                    </div>
                    <div className="p-gutter-sm bg-surface-container-low rounded-xl flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[20px]">payments</span>
                      </div>
                      <div>
                        <div className="font-label-sm text-label-sm text-outline">Binary Earned</div>
                        <div className="font-headline-md text-headline-md text-on-surface font-bold">₹<CountUp start={0} end={wallet?.balances?.binaryIncome || 0} duration={2} separator="," /></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN (Approx 35%) */}
              <div className="lg:col-span-4 space-y-gutter-lg">
                {/* WIDGET 1: RANK ADVANCEMENT QUALIFICATION MATRIX */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-surface-container-lowest rounded-2xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest">Next Milestone</span>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Rank Qualification</h3>
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-bold">
                      <span className="material-symbols-outlined text-[14px]">military_tech</span> {rank?.nextRank?.displayName || "None"}
                    </div>
                  </div>

                  <div className="bg-surface-container-low p-gutter-md rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-label-md text-label-md text-on-surface font-semibold">Overall Completion</span>
                      <span className="font-headline-md text-headline-md text-primary font-bold">{rank?.nextRank?.progress?.bvPercent || 0}%</span>
                    </div>
                    <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-700" style={{ width: `${rank?.nextRank?.progress?.bvPercent || 0}%` }}></div>
                    </div>
                    <div className="flex items-center justify-between font-label-sm text-label-sm text-outline pt-1">
                      <span>Projected Date</span>
                      <span className="text-tertiary font-semibold">~12 Days at current rate</span>
                    </div>
                  </div>

                  {/* Criteria Checklists */}
                  <div className="space-y-3 pt-1">
                    {/* Item 1 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-label-sm text-label-sm">
                        <span className="text-on-surface font-medium">Direct Active Lines</span>
                        <span className="text-on-surface-variant font-semibold">{rank?.activeDirects || 0} / {rank?.nextRank?.requirements?.directs || 0} Lines ({rank?.nextRank?.progress?.directsPercent || 0}%)</span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-secondary" style={{ width: `${rank?.nextRank?.progress?.directsPercent || 0}%` }}></div>
                      </div>
                      <div className="text-[11px] text-outline">Requires {rank?.nextRank?.requirements?.directs || 0} Active Direct Sponsors</div>
                    </div>

                    {/* Item 2 */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between font-label-sm text-label-sm">
                        <span className="text-on-surface font-medium">Matching Volume (BV)</span>
                        <span className="text-on-surface-variant font-semibold">
                          {rank?.lifetimeVolumes?.balancing?.toLocaleString() || 0} / {rank?.nextRank?.requirements?.bv?.toLocaleString() || 0} BV ({rank?.nextRank?.progress?.bvPercent || 0}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                        <div className="h-full bg-tertiary" style={{ width: `${rank?.nextRank?.progress?.bvPercent || 0}%` }}></div>
                      </div>
                      <div className="text-[11px] text-outline">Continue pushing balancing leg volume</div>
                    </div>
                  </div>
                </motion.div>

                {/* WIDGET 2: DIRECT REFERRAL & BONUS BREAKDOWN */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-surface-container-lowest rounded-2xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Revenue Allocation</span>
                      <h3 className="font-headline-md text-headline-md text-on-surface">Commission Streams</h3>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">March Cycle</span>
                  </div>
                  
                  {/* Donut Ring Representation */}
                  <div className="flex items-center gap-gutter-md">
                    <div className="relative w-24 h-24 shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" fill="none" r="15.9155" stroke="#e5eeff" strokeWidth={3.8} />
                        {/* Segment 1: Binary Matching */}
                        {binaryPct > 0 && <circle cx="18" cy="18" fill="none" r="15.9155" stroke="#003fb1" strokeDasharray={`${binaryPct} ${100 - binaryPct}`} strokeDashoffset={0} strokeWidth={3.8} />}
                        {/* Segment 2: Direct Referral */}
                        {sponsorPct > 0 && <circle cx="18" cy="18" fill="none" r="15.9155" stroke="#316bf3" strokeDasharray={`${sponsorPct} ${100 - sponsorPct}`} strokeDashoffset={-binaryPct} strokeWidth={3.8} />}
                        {/* Segment 3: Royalty Pool */}
                        {leadershipPct > 0 && <circle cx="18" cy="18" fill="none" r="15.9155" stroke="#005438" strokeDasharray={`${leadershipPct} ${100 - leadershipPct}`} strokeDashoffset={-(binaryPct + sponsorPct)} strokeWidth={3.8} />}
                        {/* Segment 4: Rank Rewards */}
                        {rankPct > 0 && <circle cx="18" cy="18" fill="none" r="15.9155" stroke="#c3c5d7" strokeDasharray={`${rankPct} ${100 - rankPct}`} strokeDashoffset={-(binaryPct + sponsorPct + leadershipPct)} strokeWidth={3.8} />}
                        {/* Segment 5: Trading Income */}
                        {tradingPct > 0 && <circle cx="18" cy="18" fill="none" r="15.9155" stroke="#ffb300" strokeDasharray={`${tradingPct} ${100 - tradingPct}`} strokeDashoffset={-(binaryPct + sponsorPct + leadershipPct + rankPct)} strokeWidth={3.8} />}
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <span className="font-label-md text-label-md font-bold text-on-surface leading-none">100%</span>
                        <span className="text-[9px] text-outline uppercase">Split</span>
                      </div>
                    </div>
                    <div className="flex-1 space-y-2 font-label-sm text-label-sm">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                          <span className="text-on-surface">Binary ({binaryPct.toFixed(1)}%)</span>
                        </div>
                        <span className="font-semibold text-on-surface">₹ {wallet?.balances?.binaryIncome?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-secondary-container"></span>
                          <span className="text-on-surface">Direct ({sponsorPct.toFixed(1)}%)</span>
                        </div>
                        <span className="font-semibold text-on-surface">₹ {wallet?.balances?.sponsorIncome?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-tertiary"></span>
                          <span className="text-on-surface">Leadership ({leadershipPct.toFixed(1)}%)</span>
                        </div>
                        <span className="font-semibold text-on-surface">₹ {wallet?.balances?.leadershipIncome?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full bg-outline-variant"></span>
                          <span className="text-on-surface">Rank ({rankPct.toFixed(1)}%)</span>
                        </div>
                        <span className="font-semibold text-on-surface">₹ {wallet?.balances?.rankBonus?.toLocaleString() || 0}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ffb300' }}></span>
                          <span className="text-on-surface">Trading ({tradingPct.toFixed(1)}%)</span>
                        </div>
                        <span className="font-semibold text-on-surface">₹ {wallet?.balances?.tradingIncome?.toLocaleString() || 0}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* WIDGET 3: QUICK BUSINESS ACTIONS */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="bg-surface-container-lowest rounded-2xl p-gutter-lg shadow-sm space-y-gutter-sm">
                  <h3 className="font-headline-md text-headline-md text-on-surface">Quick Business Utilities</h3>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => router.push('/dashboard/ewallet')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-low hover:border-outline-variant/30 hover:shadow-sm transition-all group" type="button">
                      <div className="w-12 h-12 rounded-full bg-secondary-container/30 text-secondary flex items-center justify-center group-hover:scale-110 group-hover:bg-secondary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[24px]">key</span>
                      </div>
                      <div className="text-center">
                        <div className="font-label-md text-label-md text-on-surface font-semibold">Activate Downline</div>
                        <div className="font-label-sm text-[10px] text-outline mt-0.5">Use wallet to activate</div>
                      </div>
                    </button>
                    
                    <button onClick={() => router.push('/dashboard/calculator')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-low hover:border-outline-variant/30 hover:shadow-sm transition-all group" type="button">
                      <div className="w-12 h-12 rounded-full bg-tertiary-container/30 text-tertiary flex items-center justify-center group-hover:scale-110 group-hover:bg-tertiary group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[24px]">calculate</span>
                      </div>
                      <div className="text-center">
                        <div className="font-label-md text-label-md text-on-surface font-semibold">Proj. Calculator</div>
                        <div className="font-label-sm text-[10px] text-outline mt-0.5">Income simulator</div>
                      </div>
                    </button>
                    
                    <button onClick={() => router.push('/dashboard/reports')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-surface-container-lowest hover:bg-surface-container-low border border-surface-container-low hover:border-outline-variant/30 hover:shadow-sm transition-all group" type="button">
                      <div className="w-12 h-12 rounded-full bg-error-container/30 text-error flex items-center justify-center group-hover:scale-110 group-hover:bg-error group-hover:text-white transition-all">
                        <span className="material-symbols-outlined text-[24px]">receipt_long</span>
                      </div>
                      <div className="text-center">
                        <div className="font-label-md text-label-md text-on-surface font-semibold">Tax Statements</div>
                        <div className="font-label-sm text-[10px] text-outline mt-0.5">Form 16A downloads</div>
                      </div>
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>

            {/* 3. BOTTOM SECTION: RECENT FRONTLINE PACKAGE TRANSACTIONS */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.1 }} className="bg-surface-container-lowest rounded-2xl p-gutter-lg shadow-sm space-y-gutter-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm">
                <div>
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-widest">Enrollment Ledger</span>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">Recent Frontline Business &amp; Activations</h2>
                </div>
                <div className="flex items-center gap-gutter-sm flex-wrap">
                  <div className="relative">
                    <select className="pl-3 pr-8 py-1.5 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface focus:outline-none appearance-none cursor-pointer">
                      <option>All Packages</option>
                      <option>Executive Pro (₹53,200)</option>
                      <option>Growth Partner (₹16,899)</option>
                      <option>Starter (₹4,825)</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[16px] text-outline pointer-events-none">expand_more</span>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface hover:bg-surface-container font-label-sm text-label-sm transition-colors" type="button">
                    <span className="material-symbols-outlined text-[16px]">file_download</span>
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Precision Data Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-md text-body-md whitespace-nowrap">
                  <thead>
                    <tr className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
                      <th className="py-3 px-4 rounded-l-xl">Distributor Name &amp; ID</th>
                      <th className="py-3 px-4">Subscribed Tier</th>
                      <th className="py-3 px-4">PV Volume</th>
                      <th className="py-3 px-4">Payment Method</th>
                      <th className="py-3 px-4">Direct Bonus</th>
                      <th className="py-3 px-4">Timestamp</th>
                      <th className="py-3 px-4 text-right rounded-r-xl">Receipt</th>
                    </tr>
                  </thead>
                  <tbody className="text-on-surface divide-y-0">
                    {team.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-outline">No recent enrollments found.</td>
                      </tr>
                    ) : (
                      team.slice((currentPage - 1) * pageSize, currentPage * pageSize).map((member, i) => (
                        <tr key={i} className="hover:bg-surface-container-low/60 transition-colors">
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold shadow-sm">
                              {member.full_name?.charAt(0) || 'U'}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-label-md text-label-md font-semibold text-on-surface">{member.full_name}</span>
                              <span className="font-label-sm text-label-sm text-outline">ID: {member.username}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2.5 py-1 rounded-full bg-surface-container text-primary font-label-sm text-label-sm font-semibold">
                              {member.has_active_node ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-on-surface">
                            {member.current_rank || 0} PV
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="inline-flex items-center gap-1 text-on-surface-variant font-label-sm text-label-sm">
                              <span className={`w-2 h-2 rounded-full ${member.has_active_node ? 'bg-emerald-500' : 'bg-rose-500'}`}></span> {member.has_active_node ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-tertiary font-bold">
                            {member.current_rank || 'Bronze'}
                          </td>
                          <td className="py-3.5 px-4 font-body-sm text-body-sm text-outline">
                            {new Date(member.joined_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button className="p-1 rounded-lg text-outline hover:text-primary hover:bg-surface-container transition-colors" type="button">
                              <span className="material-symbols-outlined text-[18px]">description</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Table Footer & Pagination */}
              {(() => {
                const totalPages = Math.max(1, Math.ceil(team.length / pageSize))
                const startItem = team.length === 0 ? 0 : (currentPage - 1) * pageSize + 1
                const endItem = Math.min(currentPage * pageSize, team.length)
                return (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-gutter-sm pt-2 font-label-sm text-label-sm text-outline">
                    <span>Showing {startItem} to {endItem} of {team.length} frontline members</span>
                    <div className="flex items-center gap-1">
                      <button 
                        className="px-2 py-1 rounded bg-surface-container text-outline hover:text-on-surface disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={currentPage <= 1}
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      >Prev</button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map(p => (
                        <button 
                          key={p}
                          className={`px-2.5 py-1 rounded font-semibold transition-colors ${currentPage === p ? 'bg-primary text-white' : 'hover:bg-surface-container text-on-surface'}`}
                          onClick={() => setCurrentPage(p)}
                        >{p}</button>
                      ))}
                      {totalPages > 5 && <span className="px-1">...</span>}
                      <button 
                        className="px-2 py-1 rounded bg-surface-container text-on-surface hover:bg-surface-container-high disabled:opacity-50 disabled:cursor-not-allowed" 
                        disabled={currentPage >= totalPages}
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      >Next</button>
                    </div>
                  </div>
                )
              })()}
            </motion.div>
          </div>
        </main>
      </div>

      {/* PACKAGE PAYMENT MODAL */}
      {upgradePackage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-inverse-surface/40 backdrop-blur-sm" id="upgrade-modal">
          <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="p-gutter-lg bg-gradient-to-r from-primary to-secondary text-white flex items-center justify-between sticky top-0 z-10">
              <div>
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-white/80">{upgradePackage.isUpgrade ? 'Upgrade Tier' : 'Activate Package'}</span>
                <h3 className="font-headline-lg text-headline-lg text-white font-bold">{upgradePackage.isUpgrade ? 'Upgrade to' : 'Activate'} {upgradePackage.name}</h3>
              </div>
              <button className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors" onClick={() => { setUpgradePackage(null); setPaymentMethod('card'); setCardDetails({ number: '', name: '', expiry: '', cvv: '' }); setUpiId(''); }} type="button">
                <span className="material-symbols-outlined text-[24px]">close</span>
              </button>
            </div>

            <div className="p-gutter-lg space-y-5">
              {/* Amount Summary */}
              <div className="p-4 bg-surface-container-low rounded-xl flex items-center justify-between">
                <div>
                  <div className="font-label-sm text-label-sm text-outline mb-0.5">Total Amount Due</div>
                  <div className="font-headline-xl text-headline-xl text-primary font-bold">₹ {upgradePackage.price.toLocaleString()} <span className="font-body-sm text-body-sm text-outline font-normal">({upgradePackage.pv.toLocaleString()} BV)</span></div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1 text-tertiary font-label-sm text-label-sm"><span className="material-symbols-outlined text-[14px]">verified</span> 5× Binary Cap</div>
                  <div className="flex items-center gap-1 text-tertiary font-label-sm text-label-sm"><span className="material-symbols-outlined text-[14px]">verified</span> Trading Access</div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <p className="font-label-md text-label-md text-on-surface font-semibold">Select Payment Method</p>
                <div className="grid grid-cols-3 gap-2">
                  {/* Card Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-container-high bg-surface-container-low hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">credit_card</span>
                    </div>
                    <span className={`font-label-sm text-label-sm font-semibold ${
                      paymentMethod === 'card' ? 'text-primary' : 'text-on-surface-variant'
                    }`}>Card</span>
                  </button>

                  {/* UPI Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-container-high bg-surface-container-low hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'upi' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">smartphone</span>
                    </div>
                    <span className={`font-label-sm text-label-sm font-semibold ${
                      paymentMethod === 'upi' ? 'text-primary' : 'text-on-surface-variant'
                    }`}>UPI</span>
                  </button>

                  {/* Crypto Option */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('crypto')}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                      paymentMethod === 'crypto'
                        ? 'border-primary bg-primary/5'
                        : 'border-surface-container-high bg-surface-container-low hover:border-primary/40'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      paymentMethod === 'crypto' ? 'bg-primary text-white' : 'bg-surface-container text-outline'
                    }`}>
                      <span className="material-symbols-outlined text-[20px]">currency_bitcoin</span>
                    </div>
                    <span className={`font-label-sm text-label-sm font-semibold ${
                      paymentMethod === 'crypto' ? 'text-primary' : 'text-on-surface-variant'
                    }`}>Crypto</span>
                  </button>
                </div>
              </div>

              {/* ---- CARD FORM ---- */}
              {paymentMethod === 'card' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  {/* Card Preview */}
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
                          {cardDetails.number || '•••• •••• •••• ••••'}
                        </div>
                        <div className="flex items-end justify-between">
                          <div>
                            <div className="text-[9px] text-white/60 uppercase">Card Holder</div>
                            <div className="font-label-sm text-label-sm text-white">{cardDetails.name || 'YOUR NAME'}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[9px] text-white/60 uppercase">Expires</div>
                            <div className="font-label-sm text-label-sm text-white">{cardDetails.expiry || 'MM/YY'}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Number */}
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      value={cardDetails.number}
                      onChange={e => setCardDetails(p => ({ ...p, number: formatCardNumber(e.target.value) }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors"
                    />
                  </div>
                  {/* Card Name */}
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Name on Card</label>
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={cardDetails.name}
                      onChange={e => setCardDetails(p => ({ ...p, name: e.target.value.toUpperCase() }))}
                      className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors"
                    />
                  </div>
                  {/* Expiry + CVV */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Expiry Date</label>
                      <input
                        type="text"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardDetails.expiry}
                        onChange={e => setCardDetails(p => ({ ...p, expiry: formatExpiry(e.target.value) }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">CVV</label>
                      <input
                        type="password"
                        placeholder="•••"
                        maxLength={4}
                        value={cardDetails.cvv}
                        onChange={e => setCardDetails(p => ({ ...p, cvv: e.target.value.replace(/\D/g,'').slice(0,4) }))}
                        className="w-full px-3 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ---- UPI FORM ---- */}
              {paymentMethod === 'upi' && (
                <div className="space-y-4 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
                    <div className="w-12 h-12 rounded-full bg-[#5A21B3]/10 flex items-center justify-center shrink-0">
                      <span className="text-[#5A21B3] font-bold text-lg">UPI</span>
                    </div>
                    <div>
                      <div className="font-label-md text-label-md font-semibold text-on-surface">Instant Payment via UPI</div>
                      <div className="font-body-sm text-body-sm text-outline">Supports BHIM, GPay, PhonePe, Paytm & all UPI apps</div>
                    </div>
                  </div>
                  <div>
                    <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Your UPI ID</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="yourname@upi"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        className="w-full pl-3 pr-10 py-2.5 rounded-xl bg-surface-container border border-surface-container-high focus:border-primary focus:outline-none font-body-md text-body-md text-on-surface placeholder:text-outline transition-colors"
                      />
                      {upiId.includes('@') && (
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

              {/* ---- CRYPTO FORM ---- */}
              {paymentMethod === 'crypto' && (
                <div className="space-y-3 animate-in fade-in duration-200">
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2">
                    <span className="material-symbols-outlined text-blue-600 text-[18px] mt-0.5">info</span>
                    <p className="font-body-sm text-body-sm text-blue-800">Send the exact amount to one of the addresses below. After sending, share the transaction hash with support. Activation happens within 30 mins of confirmation.</p>
                  </div>
                  {cryptoAddresses.map((crypto) => (
                    <div key={crypto.coin} className="flex items-center gap-3 p-3.5 bg-surface-container-low rounded-xl border border-surface-container-high">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-white font-bold text-sm" style={{ backgroundColor: crypto.color }}>
                        {crypto.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-label-sm text-label-sm text-outline">{crypto.coin}</div>
                        <div className="font-body-sm text-body-sm text-on-surface font-medium truncate">{crypto.address}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyAddress(crypto.address)}
                        className="shrink-0 flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-on-surface-variant">
                          {copiedAddress === crypto.address ? 'check' : 'content_copy'}
                        </span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant">{copiedAddress === crypto.address ? 'Copied!' : 'Copy'}</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  className="px-4 py-2 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors"
                  onClick={() => { setUpgradePackage(null); setPaymentMethod('card'); setCardDetails({ number: '', name: '', expiry: '', cvv: '' }); setUpiId(''); }}
                  type="button"
                >Cancel</button>
                <button
                  className="px-6 py-2 rounded-xl bg-primary text-white font-label-md text-label-md hover:bg-secondary shadow-md transition-all"
                  onClick={async () => {
                    if (paymentMethod === 'crypto') {
                      alert('Please send the payment and contact support with your transaction hash.')
                      setUpgradePackage(null)
                      return
                    }
                    try {
                      const resPkgs = await fetch('/api/packages');
                      if (!resPkgs.ok) throw new Error('Failed to fetch packages');
                      const pkgData = await resPkgs.json();
                      
                      let dbName = upgradePackage.name;
                      if (dbName === 'Growth Partner') dbName = 'Pro';
                      if (dbName === 'Executive Pro') dbName = 'Elite';

                      const targetPkg = pkgData.packages.find((p: any) => p.name === dbName);
                      if (!targetPkg) throw new Error(`Package UUID not found for ${dbName}`);

                      const endpoint = upgradePackage.isUpgrade ? '/api/packages/upgrade' : '/api/packages/purchase';
                      const payload = upgradePackage.isUpgrade ? 
                        { newPackageId: targetPkg.id, paymentMethod, transactionReference: 'PENDING' } :
                        { packageId: targetPkg.id, paymentMethod, transactionReference: 'PENDING' };

                      const res = await fetch(endpoint, { 
                        method: 'POST', 
                        headers: { 'Content-Type': 'application/json' }, 
                        body: JSON.stringify(payload) 
                      });
                      
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
                      
                      alert('Package request submitted! Your account will be activated shortly.');
                      setUpgradePackage(null);
                    } catch (err: any) {
                      alert('Error: ' + err.message);
                    }
                  }}
                  type="button"
                >
                  {paymentMethod === 'crypto' ? 'I Have Sent Payment' : 'Confirm Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
