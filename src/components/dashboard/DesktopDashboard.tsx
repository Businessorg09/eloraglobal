'use client'
import { motion, AnimatePresence, useAnimation } from 'framer-motion'
import CountUp from 'react-countup'
import NotificationBell from './NotificationBell'
import Link from 'next/link'
import Sidebar from '@/components/dashboard/Sidebar'
import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function DesktopDashboard({ profile, wallet, rank, treeStats, team, loading, handleLogout }: any) {
  const router = useRouter();
  const leftVol = treeStats?.volumes?.leftBv || 0
  const rightVol = treeStats?.volumes?.rightBv || 0
  const totalVol = leftVol + rightVol
  const totalJoinings = treeStats?.memberCount?.total || 0
  
  const totalCredit = (wallet?.balances?.binaryIncome || 0) + (wallet?.balances?.sponsorIncome || 0) + (wallet?.balances?.leadershipIncome || 0) + (wallet?.balances?.rankBonus || 0) + (wallet?.balances?.tradingIncome || 0)
  const totalBalance = wallet?.balances?.totalBalance || 0

  const graphPath = totalJoinings > 0 
    ? "M 0 160 C 25 155, 45 130, 75 145 C 105 160, 130 115, 175 40 C 215 -15, 235 155, 270 140 C 300 120, 325 155, 360 155 C 395 155, 415 125, 440 135 C 470 145, 495 165, 540 145"
    : "M 0 170 L 540 170"
  const graphAreaPath = `${graphPath} L 540 170 L 0 170 Z`

  // Chart animation & States
  const [chartReady, setChartReady] = useState(false)
  const [joiningFilter, setJoiningFilter] = useState('month')
  const [transactions, setTransactions] = useState<any[]>([])

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setChartReady(true), 400)
      
      // Fetch recent transactions
      const fetchTransactions = async () => {
        try {
          const res = await fetch('/api/wallet/transactions')
          if (res.ok) {
            const data = await res.json()
            setTransactions(data.transactions || [])
          }
        } catch (err) {}
      }
      fetchTransactions()
      
      return () => clearTimeout(timer)
    }
  }, [loading])

  // Bar chart heights
  const hasEarnings = totalCredit > 0
  const barHeights = hasEarnings ? [75, 40, 48, 85, 55, 45, 48, 60, 40, 32, 15, 58, 30, 65, 52, 44, 36] : Array(17).fill(0)
  const barDelays = barHeights.map((_, i) => i * 0.04)

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
          <DashboardSkeleton />
        </motion.div>
      ) : (
        <div key="data" className="w-full relative z-0">
          <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
            <Sidebar />
            <div className="flex-1 flex flex-col min-w-0">
              <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut", delay: 0.1 }} className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-20">
{/* Left side: Hamburger & Title */}
<div className="flex items-center gap-4">
<button aria-label="Toggle navigation" className="text-slate-500 hover:text-slate-800 p-1.5 hover:bg-slate-100 rounded-lg transition">
<i className="ph ph-list text-xl"></i>
</button>
<h2 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard</h2>
</div>
{/* Center Search Input */}
<div className="w-full max-w-md mx-6">
<div className="relative flex items-center">
<i className="ph ph-magnifying-glass absolute left-3.5 text-slate-400 text-base pointer-events-none"></i>
<input className="w-full pl-10 pr-12 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all" placeholder="Search anything..." type="text"/>
<span className="absolute right-3 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400 bg-white border border-slate-200 rounded shadow-2xs">⌘ K</span>
</div>
</div>
{/* Right Profile & Utilities */}
<div className="flex items-center gap-4">
{/* Notification Bell with Count */}
<NotificationBell />
{/* User profile summary */}
<div className="flex items-center gap-3 pl-2 border-l border-slate-200 cursor-pointer group">
<img alt={profile?.full_name || "User"} className="w-9 h-9 rounded-full object-cover border border-slate-200 shadow-2xs" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDReeYWLlD5TaldYdDHsGfN8OGQROgXVXL2UKpARpJKYtqWNug4DzzCGWdg35s9PvOABIf8Oo0TWWfLkDsuEodtiFb031UuNg4Ez3YcWqHpT18-Fqvtis5R0hnFLLhaMnNZIj7aiAuTjQVosEnw7GJ1eZMURLjS-5gIgcQKWu6Uuhjx82wmZ9lDFJo30qhmaKidHFwVZt4ln-IlF6vsQ_uT6XDRcMr6lpuFTgF4tD4oILdo204n_Bd6jQ"/>
<div className="text-left hidden md:block">
<h4 className="text-xs font-bold text-slate-800 group-hover:text-brand-600 transition leading-tight">{profile?.full_name || "User"}</h4>
<span className="text-[11px] text-slate-400 font-medium">{profile?.username}</span>
</div>
<i className="ph ph-caret-down text-slate-400 text-xs group-hover:text-slate-700 transition"></i>
</div>
{/* Floating Settings Button (Right Edge) */}
<button aria-label="Logout" onClick={handleLogout} className="w-8 h-8 rounded-lg bg-white border border-slate-200 shadow-2xs text-slate-600 hover:text-brand-600 flex items-center justify-center transition hover:shadow-md">
<i className="ph ph-gear text-lg animate-spin-slow"></i>
</button>
</div>
</motion.header>
              <motion.main key="data" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }} className="p-6 space-y-6 overflow-y-auto">
{/* TOP METRIC KPI CARDS (5 Cards in row) */}
<section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
{/* KPI 1: E-Wallet Balance */}
<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between hover:shadow-md transition-shadow">
<div>
<span className="text-xs font-semibold text-slate-500">E-Wallet Balance</span>
<div className="text-xl font-black text-slate-900 mt-1"><CountUp start={0} end={totalBalance || 0} duration={2.5} delay={0.2} separator="," prefix="₹" decimals={2} /></div>
<div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
<i className="ph-bold ph-trend-up"></i>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-0.5">vs last month</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-blue-50 text-brand-600 flex items-center justify-center shrink-0">
<i className="ph-bold ph-wallet text-xl"></i>
</div>
</motion.div>
{/* KPI 2: Total Commission */}
<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between hover:shadow-md transition-shadow">
<div>
<span className="text-xs font-semibold text-slate-500">Total Commission</span>
<div className="text-xl font-black text-slate-900 mt-1"><CountUp start={0} end={wallet?.balances?.binaryIncome || 0} duration={2.5} delay={0.2} separator="," prefix="₹" decimals={2} /></div>
<div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
<i className="ph-bold ph-trend-up"></i>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-0.5">vs last month</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
<i className="ph-bold ph-users text-xl"></i>
</div>
</motion.div>
{/* KPI 3: Total Credit */}
<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between hover:shadow-md transition-shadow">
<div>
<span className="text-xs font-semibold text-slate-500">Total Credit</span>
<div className="text-xl font-black text-slate-900 mt-1"><CountUp start={0} end={totalCredit} duration={2.5} delay={0.2} separator="," prefix="₹" decimals={2} /></div>
<div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
<i className="ph-bold ph-trend-up"></i>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-0.5">vs last month</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
<i className="ph-bold ph-credit-card text-xl"></i>
</div>
</motion.div>
{/* KPI 4: Total Debit */}
<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between hover:shadow-md transition-shadow">
<div>
<span className="text-xs font-semibold text-slate-500">Total Debit</span>
<div className="text-xl font-black text-slate-900 mt-1"><CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} duration={2.5} delay={0.2} separator="," prefix="₹" decimals={2} /></div>
<div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-rose-500">
<i className="ph-bold ph-trend-down"></i>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-0.5">vs last month</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0">
<i className="ph-bold ph-arrow-down-right text-xl"></i>
</div>
</motion.div>
{/* KPI 5: Total Payout */}
<motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-start justify-between hover:shadow-md transition-shadow">
<div>
<span className="text-xs font-semibold text-slate-500">Total Payout</span>
<div className="text-xl font-black text-slate-900 mt-1"><CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} duration={2.5} delay={0.2} separator="," prefix="₹" decimals={2} /></div>
<div className="flex items-center gap-1 mt-2 text-[11px] font-semibold text-emerald-600">
<i className="ph-bold ph-trend-up"></i>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-0.5">vs last month</span>
</div>
</div>
<div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
<i className="ph-bold ph-money text-xl"></i>
</div>
</motion.div>
</section>
{/* TWO COLUMN WORKSPACE (Main 9-Cols + Right 3-Cols) */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-4">
{/* MIDDLE LEFT COLUMN (Main charts, tables, cards) */}
<div className="lg:col-span-8 xl:col-span-9 space-y-6">
{/* ROW 1: Joinings Overview Line Chart + New Members Card */}
<div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
{/* Joinings Overview Chart (7 Cols) */}
<motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, delay: 0.6 }} className="xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
<div className="flex items-center justify-between mb-4">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">Joinings Overview</h3>
<div className="flex bg-slate-100 rounded-lg p-0.5 mt-2 sm:mt-0 shadow-inner">
<button onClick={() => setJoiningFilter('month')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${joiningFilter === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Month</button>
<button onClick={() => setJoiningFilter('year')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${joiningFilter === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Year</button>
<button onClick={() => setJoiningFilter('all')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${joiningFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Time</button>
</div>
</div>
{/* SVG Interactive Line/Area Chart — Premium Clip-Mask + Draw-On Animation */}
<div className="relative w-full h-56 pt-2">
  {/* Tooltip Overlay for February */}
  {((treeStats?.memberCount?.total || 0) > 0) && (
    <motion.div
      initial={{ opacity: 0, y: -6, scale: 0.92 }}
      animate={chartReady ? { opacity: 1, y: 0, scale: 1 } : {}}
      transition={{ duration: 0.4, delay: 2.4, ease: 'backOut' }}
      className="absolute top-8 left-[34%] transform -translate-x-1/2 bg-white px-3 py-1.5 rounded-lg shadow-xl border border-slate-100 text-center z-10 pointer-events-none"
    >
      <span className="text-[10px] text-slate-400 block">Total Joinings</span>
      <span className="text-xs font-black text-slate-900">{treeStats?.memberCount?.total || 0} Joinings</span>
      <div className="w-2 h-2 bg-white border-r border-b border-slate-100 transform rotate-45 mx-auto -mb-2.5 mt-0.5"></div>
    </motion.div>
  )}

  <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 540 180">
    <defs>
      {/* Gradient fill for area */}
      <linearGradient id="areaGradient" x1="0" x2="0" y1="0" y2="1">
        <stop offset="0%" stopColor="#2563eb" stopOpacity="0.22" />
        <stop offset="100%" stopColor="#2563eb" stopOpacity="0.0" />
      </linearGradient>
      {/* Clip path that slides from left → right */}
      <clipPath id="lineReveal">
        <motion.rect
          x="0" y="-10" height="200"
          initial={{ width: 0 }}
          animate={chartReady ? { width: 540 } : { width: 0 }}
          transition={{ duration: 2.0, ease: [0.4, 0, 0.2, 1], delay: 0.5 }}
        />
      </clipPath>
    </defs>

    {/* Horizontal Grid Lines — fade in first */}
    {[20, 60, 100, 140, 170].map((y, i) => (
      <motion.line
        key={y}
        x1="0" x2="540" y1={y} y2={y}
        stroke={y === 170 ? '#e2e8f0' : '#f1f5f9'}
        strokeWidth="1"
        initial={{ opacity: 0 }}
        animate={chartReady ? { opacity: 1 } : {}}
        transition={{ duration: 0.3, delay: i * 0.06 }}
      />
    ))}

    {/* Area fill — fades in as clip reveals */}
    <motion.path
      d={graphAreaPath}
      fill="url(#areaGradient)"
      clipPath="url(#lineReveal)"
      initial={{ opacity: 0 }}
      animate={chartReady ? { opacity: 1 } : {}}
      transition={{ duration: 0.6, delay: 0.8 }}
    />

    {/* Main stroke line — revealed by clip mask sliding left→right */}
    <path
      d={graphPath}
      fill="none"
      stroke="#1d7bfd"
      strokeLinecap="round"
      strokeWidth="2.5"
      clipPath="url(#lineReveal)"
    />

    {treeStats?.memberCount?.total > 0 && (
      <>
        {/* Active Point Indicator Dot — bounces in at the end */}
        <motion.circle
          cx="184" cy="40" r="5"
          fill="#1d7bfd" stroke="#ffffff" strokeWidth="3"
          initial={{ scale: 0, opacity: 0 }}
          animate={chartReady ? { scale: 1, opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 2.3, ease: 'backOut' }}
        />
        {/* Pulse ring around dot */}
        <motion.circle
          cx="184" cy="40" r="5"
          fill="none" stroke="#1d7bfd" strokeWidth="1.5"
          initial={{ scale: 1, opacity: 0 }}
          animate={chartReady ? { scale: 2.5, opacity: 0 } : {}}
          transition={{ duration: 2, repeat: Infinity, delay: 2.8 }}
        />
      </>
    )}
  </svg>

  {/* Y-Axis labels */}
  <div className="absolute -left-1 top-0 bottom-6 flex flex-col justify-between text-[10px] font-medium text-slate-400 pointer-events-none">
    <span>100</span><span>75</span><span>50</span><span>25</span><span>0</span>
  </div>
</div>

{/* X-Axis Months */}
<div className="flex justify-between text-[10.5px] font-medium text-slate-400 mt-2 px-1">
<span>Oct</span>
<span>Nov</span>
<span>Dec</span>
<span>Jan</span>
<span className="text-brand-600 font-bold">Feb</span>
<span>Mar</span>
<span>Apr</span>
<span>May</span>
<span>Jun</span>
<span>Jul</span>
<span>Aug</span>
<span>Sep</span>
</div>
</motion.div>
{/* New Members Card (5 Cols) */}
<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="xl:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
<div className="flex items-center justify-between mb-3">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">New Members</h3>
<a className="text-xs font-semibold text-brand-600 hover:text-brand-700" href="/dashboard/team">View All</a>
</div>
{/* List of New Members */}
<div className="space-y-3">
  {!team?.members || team.members.length === 0 ? (
    <div className="text-center text-xs text-slate-400 py-4">No new members yet.</div>
  ) : (
    team.members.slice(0, 5).map((m: any, i: number) => (
      <div key={i} className="flex items-center justify-between text-xs py-0.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold uppercase">
            {m.full_name?.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-slate-800 leading-tight">{m.full_name}</h4>
            <p className="text-[11px] text-slate-400">{m.username}</p>
          </div>
        </div>
        <span className="text-[11px] text-slate-400 font-medium">{new Date(m.joined_at).toLocaleDateString()}</span>
      </div>
    ))
  )}
</div>
</motion.div>
</div>
{/* ROW 2: Team Performance (4 Cols) + Rank Progress (4 Cols) + Earnings & Expenses (4 Cols) */}
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
{/* 1. Team Performance Card */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-3">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">Team Performance</h3>
<a className="text-xs font-semibold text-brand-600 hover:text-brand-700" href="/dashboard/team">View All</a>
</div>
<div className="flex items-center gap-4 text-xs font-semibold border-b border-slate-100 pb-2 mb-3">
<button className="text-brand-600 border-b-2 border-brand-600 -mb-2.5 pb-2">Top Earners</button>
<button className="text-slate-400 hover:text-slate-700">Top Recruiters</button>
</div>

{/* List of Performers */}
<div className="space-y-2.5">
  {(!team?.members || team.members.length === 0) ? (
    <div className="text-center py-6 text-slate-400 text-xs">No team members found</div>
  ) : (
    team.members.slice(0, 5).map((m: any, i: number) => (
      <div key={m.id || i} className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold">
            {m.full_name ? m.full_name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="max-w-[110px] truncate">
            <p className="font-bold text-slate-800 truncate leading-tight">{m.full_name || 'User'}</p>
            <p className="text-[10px] text-slate-400 truncate">ID: {m.username}</p>
          </div>
        </div>
        <span className="font-bold text-emerald-600 text-[11px]">{m.current_rank || 'Bronze'}</span>
      </div>
    ))
  )}
</div>
</div>
</motion.div>

{/* 2. Rank Progress Card */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between text-center">
<div className="flex items-center justify-between">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">Rank Progress</h3>
<a className="text-xs font-semibold text-brand-600 hover:text-brand-700" href="/dashboard/team">View All</a>
</div>
{/* Carousel shield center representation */}
<div className="flex items-center justify-between my-2 px-2">
<button aria-label="Previous rank" className="p-1 text-slate-400 hover:text-slate-700 transition">
<i className="ph ph-caret-left text-lg"></i>
</button>
{/* 3D {rank?.displayName || "Bronze"} Metallic Shield Graphic */}
<div className="relative group">
<div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-slate-200 via-white to-slate-300 shadow-xl flex items-center justify-center border-2 border-slate-100 p-2">
<div className="w-full h-full bg-gradient-to-b from-slate-200 via-slate-100 to-slate-400 rounded-xl flex items-center justify-center shadow-inner">
<i className="ph-fill ph-shield-star text-4xl text-slate-600 drop-shadow-md"></i>
</div>
</div>
</div>
<button aria-label="Next rank" className="p-1 text-slate-400 hover:text-slate-700 transition">
<i className="ph ph-caret-right text-lg"></i>
</button>
</div>
<div>
<span className="text-[11px] text-slate-400 font-medium block">Current Rank</span>
<h4 className="text-base font-black text-slate-800 mt-0.5">{rank?.displayName || "Bronze"}</h4>
{/* Next rank & bar */}
<div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mt-3 mb-1.5 px-1">
<span>Next Rank</span>
<span className="text-amber-600 font-bold">{rank?.nextRank?.displayName || "None"}</span>
</div>
<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
<div className="bg-brand-600 h-2 rounded-full" style={{width: `${rank?.nextRank?.progress?.bvPercent || 0}%`}}></div>
</div>
<div className="text-[11px] text-brand-600 font-bold mt-1.5">{rank?.nextRank?.progress?.bvPercent || 0}%</div>
<p className="text-[11px] text-slate-400 mt-2">You're doing great! Keep growing your network.</p>
</div>
</motion.div>
{/* 3. Earnings & Expenses Card (Bar Chart) */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
<div>
<div className="flex items-center justify-between mb-2">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">Earnings &amp; Expenses</h3>
<button className="flex items-center gap-1 text-[11px] text-brand-600 font-semibold">
                    This Month <i className="ph ph-caret-down text-[10px]"></i>
</button>
</div>
<div className="flex items-center gap-4 text-xs font-semibold mb-2">
<span className="text-brand-600">Earnings</span>
<span className="text-slate-400">Expenses</span>
</div>
{/* Big figure */}
<div className="flex items-baseline gap-2 mt-1">
<span className="text-xl font-black text-slate-900">₹ <CountUp start={0} end={wallet?.balances?.totalBalance || 0} duration={2.5} separator="," /></span>
<span className="text-[11px] font-bold text-emerald-600 flex items-center gap-0.5">
<i className="ph-bold ph-trend-up"></i> 0.0% <span className="text-slate-400 font-normal">vs last month</span>
</span>
</div>
{/* Bar Chart Representation */}
<div className="relative mt-4 pt-4">
{/* Y-Axis labels */}
<div className="absolute left-0 top-0 bottom-6 flex flex-col justify-between text-[9.5px] text-slate-400">
<span>75k</span>
<span>50k</span>
<span>25k</span>
<span>0</span>
</div>
{/* Bar Chart — Bars grow from zero with staggered spring animation */}
<div className="ml-7 h-28 flex items-end justify-between gap-1 border-b border-slate-200 pb-1">
  {barHeights.map((h, i) => (
    <motion.div
      key={i}
      className={`w-2.5 rounded-t-xs ${i % 3 === 1 ? 'bg-brand-500' : 'bg-brand-600'}`}
      style={{ originY: 1 }}
      initial={{ scaleY: 0, height: `${h}%` }}
      animate={chartReady ? { scaleY: 1 } : { scaleY: 0 }}
      transition={{ duration: 0.5, delay: 0.6 + barDelays[i], ease: [0.34, 1.56, 0.64, 1] }}
    />
  ))}
</div>
{/* X-Axis Days */}
<div className="ml-7 flex justify-between text-[9.5px] text-slate-400 mt-1.5 px-0.5">
<span>1</span>
<span>5</span>
<span>10</span>
<span>15</span>
<span>20</span>
<span>25</span>
<span>30</span>
</div>
</div>
</div>
</motion.div>
</div>
{/* ROW 3: Genealogy Tree Overview (Bottom Full Width Card) */}
<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
{/* Header with Title & Action Button */}
<div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">Genealogy Tree Overview</h3>
<Link href="/tree" className="px-4 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-brand-600/20 transition">
                View Full Tree
              </Link>
</div>
{/* Stats & Visual Binary Tree Container */}
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
{/* Left Team Metrics */}
<div className="lg:col-span-4 flex items-center justify-between xl:justify-start xl:gap-8 px-2">
<div>
<span className="text-xs text-slate-400 font-medium">Left Team</span>
<div className="text-lg font-black text-slate-900 mt-0.5"><CountUp start={0} end={treeStats?.volumes?.leftBv || 0} duration={2} delay={0.2} separator="," /> BV</div>
<span className="text-[11px] text-slate-500 font-semibold">{treeStats?.memberCount?.left || 0} Members</span>
</div>
<div>
<span className="text-xs text-slate-400 font-medium">Right Team</span>
<div className="text-lg font-black text-slate-900 mt-0.5"><CountUp start={0} end={treeStats?.volumes?.rightBv || 0} duration={2} delay={0.2} separator="," /> BV</div>
<span className="text-[11px] text-slate-500 font-semibold">{treeStats?.memberCount?.right || 0} Members</span>
</div>
<div>
<span className="text-xs text-slate-400 font-medium">Total Team</span>
<div className="text-lg font-black text-slate-900 mt-0.5"><CountUp start={0} end={(treeStats?.volumes?.leftBv + treeStats?.volumes?.rightBv) || 0} duration={2} delay={0.2} separator="," /> BV</div>
<span className="text-[11px] text-slate-500 font-semibold">{treeStats?.memberCount?.total || 0} Members</span>
</div>
</div>
{/* Right: Tree Diagram Representation */}
<div className="lg:col-span-8 flex flex-col items-center justify-center pt-2">
{/* Root User Node */}
<div className="flex flex-col items-center relative">
<div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full py-1 px-3 shadow-2xs">
<img alt="Root user" className="w-6 h-6 rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC7ursIEIibSZ4hF2dpafOCj_HRKZ8MWYLuLmsORAa019Hd6U-aTdvvp2cHe_UlXr96vtmuiyS9UevIWujVY9iKrJwlgWcSAikHumemKSo_4DQixPPGkDRTag_5utgUTOQPJ9eGdXIXQfJ-BGRdaCe6Da172OEMVJU-gNWqRJZC9YV4g8nyWkS54I0hjDvC-b3UesgbDT0EgQyqWp5akx3GnW_B_5__r9YwiTK86S7QYGTdegaP-R5c3g"/>
<div className="text-left leading-none">
<span className="text-[11px] font-bold text-slate-800">You</span>
<span className="text-[9px] text-slate-400 ml-1">{profile?.username}</span>
</div>
</div>
{/* Branching stem down */}
<div className="w-px h-5 bg-slate-300"></div>
</div>
{/* Tree Split Branch (Left & Right) */}
<div className="w-full max-w-lg relative flex flex-col items-center">
{/* Cross horizontal connector line */}
<div className="w-3/4 h-px bg-slate-300 relative">
{/* Left branch line */}
<div className="absolute left-0 top-0 w-px h-4 bg-slate-300"></div>
{/* Right branch line */}
<div className="absolute right-0 top-0 w-px h-4 bg-slate-300"></div>
</div>
{/* Intermediate Node Counters */}
<div className="w-3/4 flex justify-between pt-4 text-[10px] font-bold text-slate-500">
<div className="flex flex-col items-center -ml-6">
<span className="text-[10px] text-slate-400 font-normal">Left</span>
<span className="text-xs text-slate-800 font-black"><CountUp start={0} end={treeStats?.memberCount?.left || 0} duration={2} delay={0.2} separator="," /> Members</span>
<div className="w-px h-3 bg-slate-300 my-1"></div>
</div>
<div className="flex flex-col items-center -mr-6">
<span className="text-[10px] text-slate-400 font-normal">Right</span>
<span className="text-xs text-slate-800 font-black"><CountUp start={0} end={treeStats?.memberCount?.right || 0} duration={2} delay={0.2} separator="," /> Members</span>
<div className="w-px h-3 bg-slate-300 my-1"></div>
</div>
</div>
{/* Bottom Level Sub-nodes (Row of Avatars) */}
<div className="w-full flex justify-between items-center pt-1 px-4">
{/* Left group avatar row */}
<div className="flex items-center gap-1.5">
  {Array.from({ length: Math.min(treeStats?.memberCount?.left || 0, 4) }).map((_, i) => (
    <div key={`l-${i}`} className="w-6 h-6 rounded-full border border-slate-200 bg-brand-50 flex items-center justify-center">
      <span className="material-symbols-outlined text-[12px] text-brand-600">person</span>
    </div>
  ))}
  {(treeStats?.memberCount?.left || 0) > 4 && (
    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5 border border-slate-200">
      +{(treeStats?.memberCount?.left || 0) - 4}
    </span>
  )}
  {(treeStats?.memberCount?.left || 0) === 0 && (
    <span className="text-[10px] font-medium text-slate-400">No members</span>
  )}
</div>
{/* Right group avatar row */}
<div className="flex items-center gap-1.5">
  {Array.from({ length: Math.min(treeStats?.memberCount?.right || 0, 4) }).map((_, i) => (
    <div key={`r-${i}`} className="w-6 h-6 rounded-full border border-slate-200 bg-brand-50 flex items-center justify-center">
      <span className="material-symbols-outlined text-[12px] text-brand-600">person</span>
    </div>
  ))}
  {(treeStats?.memberCount?.right || 0) > 4 && (
    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 rounded-full px-1.5 py-0.5 border border-slate-200">
      +{(treeStats?.memberCount?.right || 0) - 4}
    </span>
  )}
  {(treeStats?.memberCount?.right || 0) === 0 && (
    <span className="text-[10px] font-medium text-slate-400">No members</span>
  )}
</div>
</div>
</div>
</div>
</div>
</motion.div>
</div>
{/* RIGHT SIDE COLUMN (3 Cols) */}
<div className="lg:col-span-4 xl:col-span-3 space-y-6">
{/* 1. Profile / Sponsor Card (Deep Royal Blue) */}
<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-gradient-to-b from-brand-600 to-brand-700 rounded-2xl p-5 text-white shadow-xl shadow-brand-700/20 relative overflow-hidden">
{/* User avatar + Verified badge */}
<div className="flex flex-col items-center text-center">
<div className="relative mb-2">
<img alt={profile?.full_name || "User"} className="w-16 h-16 rounded-full object-cover border-2 border-white/80 shadow-md" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXPfYUaHTJ63yIovg4wSeSnfbStuu9MHoz4pWC50Elq3FrEaRU1QY2FZVGcgl4mkUJrGaf2ERpQ7kSRVTN--5d5FWLksfeG6FqFb_i5ZSmIrN4kyv1hWe7diyTQPmO8HSQM2dCytyNA5YRkAlln7PI7Zv9Ip8h1KqPBDpoUQ2lR-cHRBgFeUe9ZhTSjmWjlErLQxZYj4hyqSCClKBN_CkFPw5yDiR6ziQyLJBMcnDo1CIgoBmS6Owo3g"/>
<span className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
<i className="ph-bold ph-check text-[9px] text-white"></i>
</span>
</div>
{/* Name and ID */}
<h3 className="font-black text-sm tracking-wide flex items-center gap-1.5 justify-center">
                {profile?.full_name || "User"}
              </h3>
<div className="flex items-center gap-1 text-[11px] text-blue-100 font-medium">
<span>{profile?.username}</span>
<i className="ph-fill ph-check-circle text-xs text-white"></i>
</div>
{/* Personal BV & Group BV */}
<div className="grid grid-cols-2 w-full gap-4 mt-4 py-2 border-t border-b border-white/15 text-left">
<div>
<span className="text-[10.5px] text-blue-100 block">Personal BV</span>
<span className="text-base font-black text-white"><CountUp start={0} end={treeStats?.volumes?.personalBv || 0} duration={2} delay={0.6} /></span>
</div>
<div className="text-right">
<span className="text-[10.5px] text-blue-100 block">Group BV</span>
<span className="text-base font-black text-white"><CountUp start={0} end={(treeStats?.volumes?.leftBv + treeStats?.volumes?.rightBv) || 0} duration={2} delay={0.6} /></span>
</div>
</div>
{/* Sponsor ID */}
<div className="mt-3 text-center">
<span className="text-[10.5px] text-blue-200 block uppercase tracking-wider font-semibold">Sponsor</span>
<span className="text-xs font-bold tracking-wide text-white">{profile?.sponsor_username || "None"}</span>
</div>
{/* Action CTA Buttons */}
<div className="grid grid-cols-2 gap-2 w-full mt-4">
<button onClick={() => router.push('/dashboard/business')} className="py-2 px-3 bg-[#0a2046] hover:bg-slate-900 text-white text-xs font-semibold rounded-xl shadow transition">
                  Upgrade
                </button>
<button onClick={() => router.push('/dashboard/business')} className="py-2 px-3 bg-white text-brand-700 hover:bg-blue-50 text-xs font-bold rounded-xl shadow transition">
                  Renew
                </button>
</div>
</div>
{/* Background decorative shimmer */}
<div className="absolute -top-10 -right-10 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
</motion.div>
{/* 2. Payout Overview Donut Card */}
<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
<div className="flex items-center justify-between mb-4">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">Payout Overview</h3>
<button className="flex items-center gap-1 text-[11px] text-brand-600 font-semibold">
                This Month <i className="ph ph-caret-down text-[10px]"></i>
</button>
</div>
<div className="flex items-center gap-4">
{/* SVG Donut Chart */}
<div className="relative w-28 h-28 shrink-0 flex items-center justify-center">
<svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
{/* Background Track */}
<circle cx="50" cy="50" fill="none" r="38" stroke="#f1f5f9" strokeWidth="9"/>
{/* Segment 1: Rejected (Red) */}
<motion.circle initial={{ strokeDashoffset: 238.7 }} animate={{ strokeDashoffset: 238.7 }} transition={{ duration: 1.5, ease: "easeOut", delay: 1 }} cx="50" cy="50" fill="none" r="38" stroke="#ef4444" strokeDasharray="238.7" strokeWidth="9"/>
{/* Segment 2: Requested (Blue) */}
<motion.circle initial={{ strokeDashoffset: 238.7 }} animate={{ strokeDashoffset: 238.7 }} transition={{ duration: 1.5, ease: "easeOut", delay: 1 }} cx="50" cy="50" fill="none" r="38" stroke="#3b82f6" strokeDasharray="238.7" strokeWidth="9"/>
{/* Segment 3: Approved (Cyan) */}
<motion.circle initial={{ strokeDashoffset: 238.7 }} animate={{ strokeDashoffset: 238.7 }} transition={{ duration: 1.5, ease: "easeOut", delay: 1 }} cx="50" cy="50" fill="none" r="38" stroke="#06b6d4" strokeDasharray="238.7" strokeWidth="9"/>
{/* Segment 4: Paid (Green) */}
<motion.circle initial={{ strokeDashoffset: 238.7 }} animate={{ strokeDashoffset: (wallet?.balances?.totalWithdrawn || 0) > 0 ? 0 : 238.7 }} transition={{ duration: 1.5, ease: "easeOut", delay: 1 }} cx="50" cy="50" fill="none" r="38" stroke="#10b981" strokeDasharray="238.7" strokeWidth="9"/>
</svg>
{/* Center Text */}
<div className="absolute inset-0 flex flex-col items-center justify-center text-center">
<span className="text-[9.5px] text-slate-400 font-medium">Paid</span>
<span className="text-xs font-black text-slate-800 leading-tight"><CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} duration={2.5} delay={0.2} separator="," prefix="₹" decimals={2} /></span>
</div>
</div>
{/* Donut Legend */}
<div className="space-y-1.5 flex-1 text-xs">
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
<span className="w-2 h-2 rounded-full bg-blue-500"></span> Requested
                  </span>
<span className="font-bold text-slate-800 text-[11px]">₹ 0.00</span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
<span className="w-2 h-2 rounded-full bg-cyan-500"></span> Approved
                  </span>
<span className="font-bold text-slate-800 text-[11px]">₹ 0.00</span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
<span className="w-2 h-2 rounded-full bg-emerald-500"></span> Paid
                  </span>
<span className="font-bold text-slate-800 text-[11px]"><CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} duration={2.5} delay={0.2} separator="," prefix="₹" decimals={2} /></span>
</div>
<div className="flex items-center justify-between">
<span className="flex items-center gap-1.5 text-slate-500 text-[11px]">
<span className="w-2 h-2 rounded-full bg-red-500"></span> Rejected
                  </span>
<span className="font-bold text-slate-800 text-[11px]">₹ 0.00</span>
</div>
</div>
</div>
</motion.div>
{/* 3. Recent Activities Card */}
<motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
<div className="flex items-center justify-between mb-3">
<h3 className="font-bold text-slate-800 text-sm tracking-tight">Recent Activities</h3>
</div>
{/* List of activities */}
<div className="space-y-3">
  {(!transactions || !Array.isArray(transactions) || transactions.length === 0) ? (
    <div className="text-center py-6 text-slate-400 text-xs">No recent activities</div>
  ) : (
    transactions.slice(0, 5).map((txn, index) => (
      <div key={index} className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
            txn.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600' : 
            txn.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-500'
          }`}>
            <i className={`ph-bold ${
              txn.transaction_type === 'WITHDRAWAL' ? 'ph-arrow-up-right' : 
              txn.transaction_type === 'PACKAGE_PURCHASE' ? 'ph-arrow-down-right' : 'ph-coins'
            } text-xs`}></i>
          </div>
          <div>
            <h4 className="font-bold text-slate-800 leading-tight">
              {txn.transaction_type === 'WITHDRAWAL' ? 'Payout Requested' :
               txn.transaction_type === 'PACKAGE_PURCHASE' ? 'Package Purchase' :
               'Commission Received'}
            </h4>
            <span className={`text-[11px] font-semibold ${
              txn.transaction_type === 'WITHDRAWAL' ? 'text-rose-600' : 'text-emerald-600'
            }`}>
              {txn.transaction_type === 'WITHDRAWAL' ? '-' : '+'}₹ {(txn.amount_paise / 100).toLocaleString()}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">
          {new Date(txn.created_at).toLocaleDateString()}
        </span>
      </div>
    ))
  )}
</div>
{/* Footer Link */}
<div className="pt-3 mt-3 border-t border-slate-100">
<a className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1" href="/dashboard/team">
                View All Activities <i className="ph-bold ph-arrow-right text-[11px]"></i>
</a>
</div>
</motion.div>
</div>
</div>
</motion.main>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  )
}

function DashboardSkeleton() {
  return (
    <div className="p-6 space-y-6 overflow-y-auto w-full animate-pulse">
      {/* Top Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-white p-4 rounded-2xl border border-slate-200 h-28 flex flex-col justify-between">
            <div className="w-24 h-4 bg-slate-200 rounded-md"></div>
            <div className="w-32 h-6 bg-slate-200 rounded-md mt-2"></div>
            <div className="w-20 h-3 bg-slate-200 rounded-md mt-2"></div>
          </div>
        ))}
      </div>
      
      {/* 2 Cols Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Side */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-6">
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            <div className="xl:col-span-7 bg-white p-5 rounded-2xl border border-slate-200 h-64">
              <div className="w-40 h-5 bg-slate-200 rounded-md mb-4"></div>
              <div className="w-full h-40 bg-slate-100 rounded-lg"></div>
            </div>
            <div className="xl:col-span-5 bg-white p-5 rounded-2xl border border-slate-200 h-64">
               <div className="w-32 h-5 bg-slate-200 rounded-md mb-4"></div>
               <div className="space-y-3">
                 {[...Array(4)].map((_, i) => (
                   <div key={i} className="w-full h-8 bg-slate-100 rounded-md"></div>
                 ))}
               </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
             {[...Array(3)].map((_, i) => (
               <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 h-72">
                  <div className="w-32 h-5 bg-slate-200 rounded-md mb-4"></div>
                  <div className="w-full h-40 bg-slate-100 rounded-lg"></div>
               </div>
             ))}
          </div>
        </div>
        
        {/* Right Side */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
          <div className="bg-slate-200 rounded-2xl p-5 h-72"></div>
          <div className="bg-slate-100 rounded-2xl p-5 h-64"></div>
        </div>
      </div>
    </div>
  )
}
