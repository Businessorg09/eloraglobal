import { motion, AnimatePresence } from 'framer-motion'
import CountUp from 'react-countup'
import NotificationBell from './NotificationBell'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function MobileDashboard({ profile, wallet, rank, treeStats, loading, handleLogout, team, setPurchaseModal }: any) {
  const router = useRouter();
  const leftVol = treeStats?.volumes?.leftBv || 0
  const rightVol = treeStats?.volumes?.rightBv || 0
  const totalVol = leftVol + rightVol
  const totalCredit = (wallet?.balances?.binaryIncome || 0) + (wallet?.balances?.sponsorIncome || 0) + (wallet?.balances?.leadershipIncome || 0) + (wallet?.balances?.rankBonus || 0) + (wallet?.balances?.tradingIncome || 0)
  const totalBalance = wallet?.balances?.totalBalance || 0
  
  const [chartReady, setChartReady] = useState(false)
  const [joiningFilter, setJoiningFilter] = useState('month')
  const [transactions, setTransactions] = useState<any[]>([])
  
  // Referral Link State
  const [activeLeg, setActiveLeg] = useState<'left' | 'right'>('left')
  const [copyToast, setCopyToast] = useState(false)
  const [showQuickActions, setShowQuickActions] = useState(false)

  
  const handleNativeShare = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eloraglobal.vercel.app'
    if (!profile) return; // Prevent copying empty profile
    const link = `${origin}/register?ref=${profile.referral_code || profile.username}&pl=${activeLeg === 'left' ? '1' : '2'}`
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Join my Elora Global Team',
          text: 'Register now and join my trading network!',
          url: link
        });
      } catch (err) {
        console.log('Share rejected', err);
      }
    } else {
      handleCopyLink();
    }
  }

  const handleCopyLink = () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://eloraglobal.vercel.app'
    if (!profile) return;
    const link = `${origin}/register?ref=${profile.referral_code || profile.username}&pl=${activeLeg === 'left' ? '1' : '2'}`
    
    try {
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(link);
      } else {
        // Fallback for non-secure contexts (like local network IP testing on mobile)
        const textArea = document.createElement("textarea");
        textArea.value = link;
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        textArea.remove();
      }
      setCopyToast(true)
      setTimeout(() => setCopyToast(false), 3000)
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  useEffect(() => {
    if (!loading) {
      const timer = setTimeout(() => setChartReady(true), 400)
      
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

  return (
    <div className="h-full font-sans text-slate-800 bg-[#F8FAFC] antialiased select-none pb-24 relative w-full overflow-x-hidden min-h-screen">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
             <motion.header className="sticky top-0 z-40 bg-white/90 border-b border-slate-100 px-4 pt-3 pb-3 h-14"></motion.header>
             <MobileSkeleton />
                       </motion.div>
        ) : (
          <motion.div key="data" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
             <motion.header initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5 }} className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 pt-3 pb-3 safe-top" data-purpose="mobile-top-header">
<div className="flex items-center justify-between">
<div className="flex items-center gap-3">
<button aria-label="Toggle Menu" className="text-slate-600 hover:text-blue-600 transition">
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
</button>
<div>
<h2 className="text-sm font-black tracking-widest text-slate-900 leading-none">ELORA</h2>
<p className="text-[9px] font-bold text-blue-600 tracking-widest mt-0.5 uppercase">GLOBAL</p>
</div>
</div>
<div className="flex items-center gap-3">
<button aria-label="Notifications" className="relative text-slate-500 hover:text-blue-600 transition">
<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405C18.21 14.79 18 13.42 18 12V8a6 6 0 10-12 0v4c0 1.42-.21 2.79-.595 3.595L4 17h5m6 0a3 3 0 11-6 0h6z"></path></svg>
<span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>
</button>
<div className="w-8 h-8 rounded-full overflow-hidden ring-2 ring-white shadow-sm">
<img alt="User Avatar" className="w-full h-full object-cover" src={profile?.avatar_url || "https://ui-avatars.com/api/?name=" + (profile?.full_name || "User")} />
</div>
</div>
</div>
</motion.header>

<motion.main className="p-4 space-y-4">
<section className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden" data-purpose="mobile-top-profile">
<div className="absolute top-0 right-0 p-4 opacity-10">
<svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z"/></svg>
</div>
<div className="relative z-10">
<div className="flex items-center gap-3">
<div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm p-0.5 border border-white/30 shrink-0">
<img alt="User Avatar" className="w-full h-full object-cover rounded-lg" src={profile?.avatar_url || "https://ui-avatars.com/api/?name=" + (profile?.full_name || "User")} />
</div>
<div className="flex-1 min-w-0">
<div className="flex items-center space-x-1.5">
<h1 className="text-base font-bold truncate tracking-tight">{profile?.full_name || "User"}</h1>
</div>
<p className="text-xs text-blue-100 font-mono tracking-wide">ID: {profile?.username || "username"}</p>
</div>
<div className="text-right">
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/20 backdrop-blur-md border border-white/20 text-white">
{rank?.displayName || "Member"}
</span>
</div>
</div>

<div className="mt-4 grid grid-cols-2 gap-2 bg-black/15 backdrop-blur-md rounded-xl p-2.5 border border-white/10 text-center">
<div className="border-r border-white/10">
<span className="block text-[11px] font-medium text-blue-100">Personal BV</span>
<span className="text-base font-black tracking-tight text-white"><CountUp start={0} end={treeStats?.volumes?.personalBv || 0} duration={2} delay={0.6} /></span>
</div>
<div>
<span className="block text-[11px] font-medium text-blue-100">Group BV</span>
<span className="text-base font-black tracking-tight text-white"><CountUp start={0} end={(treeStats?.volumes?.leftBv + treeStats?.volumes?.rightBv) || 0} duration={2} delay={0.6} /></span>
</div>
</div>

<div className="mt-3 flex items-center justify-between text-xs text-blue-100">
<span className="text-[11px]">Sponsor:</span>
<span className="font-mono font-bold tracking-wider text-white">{profile?.sponsor_username || "None"}</span>
</div>

<div className="mt-3.5 grid grid-cols-2 gap-2.5">
<button className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-white text-blue-800 shadow-sm active:scale-[0.98] transition" onClick={() => router.push('/dashboard/business')}>
Upgrade
</button>
<button className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-blue-500/40 hover:bg-blue-500/50 border border-white/25 text-white active:scale-[0.98] transition" onClick={() => router.push('/dashboard/business')}>
Renew
</button>
</div>
</div>
</section>
<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="referral-link-card">
<div className="flex items-center justify-between mb-3">
<div className="flex items-center space-x-2">
<div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
</div>
<div>
<h3 className="text-sm font-bold text-slate-900 leading-none">Binary Referral Link</h3>
<p className="text-[10px] text-slate-400 mt-0.5 font-medium">Select placement leg to recruit</p>
</div>
</div>
<span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
      Invite &amp; Earn
    </span>
</div>

<div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl mb-3">
<button onClick={() => setActiveLeg('left')} className={`py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center space-x-1.5 ${activeLeg === 'left' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
<span className={`w-1.5 h-1.5 rounded-full ${activeLeg === 'left' ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
<span>Left Leg</span>
</button>
<button onClick={() => setActiveLeg('right')} className={`py-1.5 text-xs font-bold rounded-lg transition-all shadow-sm flex items-center justify-center space-x-1.5 ${activeLeg === 'right' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-800'}`}>
<span className={`w-1.5 h-1.5 rounded-full ${activeLeg === 'right' ? 'bg-emerald-400' : 'bg-slate-300'}`}></span>
<span>Right Leg</span>
</button>
</div>

<div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center justify-between mb-3">
<div className="flex items-center space-x-2 min-w-0 flex-1 mr-2">
<svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<path d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" strokeLinecap="round" strokeLinejoin="round"/>
</svg>
<span className="text-xs font-mono text-slate-700 truncate select-all">https://.../register?ref={profile?.referral_code || "..."}&amp;pl={activeLeg === 'left' ? '1' : '2'}</span>
</div>
<span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 shrink-0">{activeLeg === 'left' ? 'Left' : 'Right'}</span>
</div>

<div className="grid grid-cols-2 gap-2.5">
<button onClick={handleCopyLink} className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-blue-600 text-white active:scale-[0.98] transition shadow-sm flex items-center justify-center space-x-1.5">
<svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<rect height="13" rx="2" ry="2" width="13" x="9" y="9"/>
<path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
</svg>
<span>Copy Link</span>
</button>
<button onClick={handleNativeShare} className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 active:scale-[0.98] transition flex items-center justify-center space-x-1.5" >
<svg className="w-3.5 h-3.5 text-slate-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
<circle cx="18" cy="5" r="3"/>
<circle cx="6" cy="12" r="3"/>
<circle cx="18" cy="19" r="3"/>
<line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/>
<line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/>
</svg>
<span>Share via App</span>
</button>
</div>

{copyToast && (
  <div className="mt-2 py-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-lg text-[10px] font-semibold text-center flex items-center justify-center space-x-1">
    <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
      <path clipRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" fillRule="evenodd"/>
    </svg>
    <span>Referral link copied to clipboard!</span>
  </div>
)}
</section>



<section data-purpose="kpi-metrics-section">
<div className="flex items-center justify-between mb-2 px-0.5">
<h2 className="text-sm font-bold tracking-tight text-slate-900">Wallet &amp; Revenue</h2>
<span className="text-[11px] font-medium text-slate-400">Live Sync</span>
</div>

<div className="flex space-x-3 overflow-x-auto no-scrollbar py-1 -mx-4 px-4">

<article className="min-w-[155px] flex-shrink-0 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card">
<div className="flex items-center justify-between">
<span className="text-[11px] font-medium text-slate-500">E-Wallet</span>
<div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="14" rx="2" width="20" x="2" y="5"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
</div>
</div>
<p className="mt-2 text-base font-extrabold text-slate-900 tracking-tight"><CountUp start={0} end={totalBalance} decimals={2} prefix="₹ " duration={2.5} /></p>
<div className="mt-1 flex items-center text-[10px] font-semibold text-emerald-600">
<svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-1">vs last mo.</span>
</div>
</article>

<article className="min-w-[155px] flex-shrink-0 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card">
<div className="flex items-center justify-between">
<span className="text-[11px] font-medium text-slate-500">Total Comm.</span>
<div className="w-7 h-7 rounded-lg bg-cyan-50 text-cyan-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/></svg>
</div>
</div>
<p className="mt-2 text-base font-extrabold text-slate-900 tracking-tight"><CountUp start={0} end={wallet?.balances?.binaryIncome || 0} decimals={2} prefix="₹ " duration={2.5} /></p>
<div className="mt-1 flex items-center text-[10px] font-semibold text-emerald-600">
<svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-1">vs last mo.</span>
</div>
</article>

<article className="min-w-[155px] flex-shrink-0 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card">
<div className="flex items-center justify-between">
<span className="text-[11px] font-medium text-slate-500">Total Credit</span>
<div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect height="16" rx="2" ry="2" width="22" x="1" y="4"/><line x1="1" x2="23" y1="10" y2="10"/></svg>
</div>
</div>
<p className="mt-2 text-base font-extrabold text-slate-900 tracking-tight"><CountUp start={0} end={totalCredit} decimals={2} prefix="₹ " duration={2.5} /></p>
<div className="mt-1 flex items-center text-[10px] font-semibold text-emerald-600">
<svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-1">vs last mo.</span>
</div>
</article>

<article className="min-w-[155px] flex-shrink-0 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card">
<div className="flex items-center justify-between">
<span className="text-[11px] font-medium text-slate-500">Total Debit</span>
<div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" x2="12" y1="5" y2="19"/><polyline points="19 12 12 19 5 12"/></svg>
</div>
</div>
<p className="mt-2 text-base font-extrabold text-slate-900 tracking-tight"><CountUp start={0} end={wallet?.balances?.binaryIncome || 0} decimals={2} prefix="₹ " duration={2.5} /></p>
<div className="mt-1 flex items-center text-[10px] font-semibold text-rose-500">
<svg className="w-3 h-3 mr-0.5 rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-1">vs last mo.</span>
</div>
</article>

<article className="min-w-[155px] flex-shrink-0 bg-white p-3.5 rounded-2xl border border-slate-100 shadow-card">
<div className="flex items-center justify-between">
<span className="text-[11px] font-medium text-slate-500">Total Payout</span>
<div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
<svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><line x1="12" x2="12" y1="6" y2="8"/><line x1="12" x2="12" y1="16" y2="18"/></svg>
</div>
</div>
<p className="mt-2 text-base font-extrabold text-slate-900 tracking-tight"><CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} decimals={2} prefix="₹ " duration={2.5} /></p>
<div className="mt-1 flex items-center text-[10px] font-semibold text-emerald-600">
<svg className="w-3 h-3 mr-0.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
<span>0.0%</span>
<span className="text-slate-400 font-normal ml-1">vs last mo.</span>
</div>
</article>
</div>
</section>


<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="rank-progress-card">
<div className="flex items-center justify-between mb-3">
<h3 className="text-sm font-bold text-slate-900">Rank Progress</h3>
<a className="text-xs font-semibold text-blue-600 hover:text-blue-700" href="/dashboard/reports">View All</a>
</div>

<div className="flex items-center justify-center space-x-6 py-2">
<button aria-label="Previous Rank" className="text-slate-300 hover:text-slate-500">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6"/></svg>
</button>
<div className="flex flex-col items-center">
<div className="relative w-20 h-20 flex items-center justify-center drop-shadow-md">

<svg className="w-18 h-18" fill="none" viewBox="0 0 100 100">
<defs>
<linearGradient id="shieldGrad" x1="0%" x2="100%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#E2E8F0"/>
<stop offset="50%" stopColor="#94A3B8"/>
<stop offset="100%" stopColor="#64748B"/>
</linearGradient>
<linearGradient id="shieldInner" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#CBD5E1"/>
<stop offset="100%" stopColor="#475569"/>
</linearGradient>
</defs>

<polygon fill="url(#shieldGrad)" points="50,5 85,25 75,70 50,95 25,70 15,25"/>
<polygon fill="url(#shieldInner)" points="50,14 76,30 68,66 50,86 32,66 24,30"/>

<polygon fill="#FFFFFF" opacity="0.9" points="50,30 55,42 68,43 58,52 61,65 50,57 39,65 42,52 32,43 45,42"/>
</svg>
</div>
<span className="text-[10px] uppercase font-semibold text-slate-400 mt-1">Current Rank</span>
<span className="text-base font-extrabold text-slate-800 tracking-tight">{rank?.displayName || "Bronze"}</span>
</div>
<button aria-label="Next Rank" className="text-slate-300 hover:text-slate-500">
<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
</button>
</div>

<div className="mt-3">
<div className="flex items-center justify-between text-xs mb-1.5 font-medium">
<span className="text-slate-500">Next Rank: <strong className="text-slate-800">{rank?.nextRank?.displayName || "None"}</strong></span>
<span className="font-bold text-blue-600">{rank?.nextRank?.progress?.bvPercent || 0}%</span>
</div>

<div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
<div className="bg-blue-600 h-2 rounded-full transition-all duration-500" style={{width: `${rank?.nextRank?.progress?.bvPercent || 0}%`}}></div>
</div>
<p className="text-[11px] text-center text-slate-400 mt-2">You're doing great! Keep growing your network.</p>
</div>
</section>


<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="genealogy-tree-summary">
<div className="flex items-center justify-between mb-3">
<div>
<h3 className="text-sm font-bold text-slate-900 leading-none">Genealogy Overview</h3>
<p className="text-[11px] text-slate-400 mt-0.5">Binary Tree Network</p>
</div>
<button className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 active:bg-blue-100 transition">
          View Full Tree
        </button>
</div>

<div className="grid grid-cols-3 gap-2 p-2.5 bg-slate-50/80 rounded-xl text-center border border-slate-100 mb-4">
<div>
<span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Left Team</span>
<p className="text-sm font-extrabold text-slate-900 mt-0.5"><CountUp start={0} end={treeStats?.memberCount?.left || 0} duration={2} separator="," delay={0.6} /></p>
<span className="text-[10px] text-emerald-600 font-semibold">Active</span>
</div>
<div className="border-x border-slate-200">
<span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Right Team</span>
<p className="text-sm font-extrabold text-slate-900 mt-0.5"><CountUp start={0} end={treeStats?.memberCount?.right || 0} duration={2} separator="," delay={0.6} /></p>
<span className="text-[10px] text-emerald-600 font-semibold">Active</span>
</div>
<div>
<span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Total Team</span>
<p className="text-sm font-extrabold text-blue-700 mt-0.5"><CountUp start={0} end={treeStats?.memberCount?.total || 0} duration={2} separator="," delay={0.6} /></p>
<span className="text-[10px] text-emerald-600 font-semibold">Active</span>
</div>
</div>

<div className="relative py-2 px-1 flex flex-col items-center">

<div className="flex flex-col items-center z-10">
<div className="w-10 h-10 rounded-full ring-2 ring-blue-600 p-0.5 bg-white shadow-sm">
<img alt="You Node" className="w-full h-full rounded-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0X0MFjnJ7JrVnimxpT_vOJcq7yeqVOi0Oet3pRcq8fxJT5hlLr2_i0Sg66Uf3aXb_ZUa_LROrqFrXZynPjvCGW25ABCZmUMYkI4mTjaDU9FnUHJY2ZTY-doAtRTEjNTaZyJs2XwwlQamEPjXPdFk_gh85VKRvy0j8wy3JljkaL9oXP_vQhBQ-Tg6tXllY_F2_xwsIFmqmfNnk_f0bZ43tnX6P2hTyX_d5DCjpeau7Df-sUSe9bAOmUw"/>
</div>
<span className="text-[11px] font-bold text-slate-800 mt-1">You</span>
<span className="text-[9px] font-mono text-slate-400">{profile?.username || "username"}</span>
</div>

<div className="w-full flex justify-center -my-1">
<svg className="w-56 h-8 stroke-slate-300" fill="none" strokeWidth="1.5">

<line x1="112" x2="112" y1="0" y2="12"/>

<line x1="40" x2="184" y1="12" y2="12"/>

<line x1="40" x2="40" y1="12" y2="30"/>

<line x1="184" x2="184" y1="12" y2="30"/>
</svg>
</div>

<div className="w-full grid grid-cols-2 gap-4 pt-1">

<div className="flex flex-col items-center bg-slate-50/90 rounded-xl p-2 border border-slate-100">
<div className="text-[10px] font-bold text-blue-600 uppercase">Left Leg</div>
<div className="text-xs font-black text-slate-800 mb-1.5"><CountUp start={0} end={treeStats?.memberCount?.left || 0} duration={2} separator="," delay={0.6} /></div>

<div className="flex items-center -space-x-1.5 overflow-hidden">
  {Array.from({ length: Math.min(treeStats?.memberCount?.left || 0, 4) }).map((_, i) => (
    <div key={`ml-${i}`} className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white">
      <span className="material-symbols-outlined text-[12px] text-slate-500">person</span>
    </div>
  ))}
  {(treeStats?.memberCount?.left || 0) > 4 && (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white text-[9px] font-bold text-slate-600">
      +{(treeStats?.memberCount?.left || 0) - 4}
    </span>
  )}
  {(treeStats?.memberCount?.left || 0) === 0 && (
    <span className="text-[10px] font-medium text-slate-400 ml-2">No members</span>
  )}
</div>
</div>

<div className="flex flex-col items-center bg-slate-50/90 rounded-xl p-2 border border-slate-100">
<div className="text-[10px] font-bold text-blue-600 uppercase">Right Leg</div>
<div className="text-xs font-black text-slate-800 mb-1.5"><CountUp start={0} end={treeStats?.memberCount?.right || 0} duration={2} separator="," delay={0.6} /></div>

<div className="flex items-center -space-x-1.5 overflow-hidden">
  {Array.from({ length: Math.min(treeStats?.memberCount?.right || 0, 4) }).map((_, i) => (
    <div key={`mr-${i}`} className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white">
      <span className="material-symbols-outlined text-[12px] text-slate-500">person</span>
    </div>
  ))}
  {(treeStats?.memberCount?.right || 0) > 4 && (
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 ring-2 ring-white text-[9px] font-bold text-slate-600">
      +{(treeStats?.memberCount?.right || 0) - 4}
    </span>
  )}
  {(treeStats?.memberCount?.right || 0) === 0 && (
    <span className="text-[10px] font-medium text-slate-400 ml-2">No members</span>
  )}
</div>
</div>
</div>
</div>
</section>


<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="joinings-overview-chart">
<div className="flex items-center justify-between mb-2">
<h3 className="text-sm font-bold text-slate-900">Joinings Overview</h3>

<div className="flex bg-slate-100 rounded-lg p-0.5">
          <button onClick={() => setJoiningFilter('month')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${joiningFilter === 'month' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Month</button>
          <button onClick={() => setJoiningFilter('year')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${joiningFilter === 'year' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Year</button>
          <button onClick={() => setJoiningFilter('all')} className={`px-2.5 py-1 text-[11px] font-bold rounded-md transition-colors ${joiningFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>All Time</button>
        </div>
</div>

<div className="relative pt-6 pb-1">

{((treeStats?.memberCount?.total || 0) > 0) && (
  <div className="absolute top-1 left-[50%] -translate-x-1/2 bg-slate-900 text-white text-[10px] font-medium py-1 px-2.5 rounded-lg shadow-lg flex flex-col items-center pointer-events-none z-10">
    <span className="text-slate-300 text-[9px]">Total Joinings</span>
    <span className="font-bold text-sky-400">{treeStats?.memberCount?.total || 0} Joinings</span>
    <div className="w-2 h-2 bg-slate-900 rotate-45 -mb-1 mt-0.5"></div>
  </div>
)}

<div className="w-full h-36">
<svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 350 140">
<defs>
<linearGradient id="joiningsGradient" x1="0%" x2="0%" y1="0%" y2="100%">
<stop offset="0%" stopColor="#3b82f6" stopOpacity="0.35"/>
<stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
</linearGradient>
</defs>

<line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="350" y1="20" y2="20"/>
<line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="350" y1="60" y2="60"/>
<line stroke="#f1f5f9" strokeDasharray="3 3" strokeWidth="1" x1="0" x2="350" y1="100" y2="100"/>

<path d="M 0 105 
                     C 30 100, 50 85, 80 88 
                     C 110 92, 130 95, 150 40 
                     C 165 15, 175 15, 190 60 
                     C 210 100, 230 85, 260 90 
                     C 290 95, 310 90, 350 92 
                     L 350 130 L 0 130 Z" fill="url(#joiningsGradient)"/>

<path d="M 0 105 
                     C 30 100, 50 85, 80 88 
                     C 110 92, 130 95, 150 40 
                     C 165 15, 175 15, 190 60 
                     C 210 100, 230 85, 260 90 
                     C 290 95, 310 90, 350 92" fill="none" stroke="#2563eb" strokeLinecap="round" strokeWidth="3"/>

<circle cx="170" cy="25" fill="#2563eb" r="5" stroke="#ffffff" strokeWidth="2.5"/>
</svg>
</div>

<div className="flex justify-between text-[9px] font-semibold text-slate-400 mt-1 px-1">
<span>Oct</span>
<span>Nov</span>
<span>Dec</span>
<span>Jan</span>
<span className="text-blue-600 font-bold">Feb</span>
<span>Mar</span>
<span>Apr</span>
<span>May</span>
<span>Jun</span>
<span>Jul</span>
</div>
</div>
</section>


<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="earnings-and-expenses-card">
<div className="flex items-center justify-between mb-2">
<div>
<h3 className="text-sm font-bold text-slate-900">Earnings &amp; Expenses</h3>
<div className="flex items-center space-x-2 mt-1">
<span className="text-lg font-black text-slate-900"><CountUp start={0} end={totalCredit} decimals={2} prefix="₹ " duration={2.5} /></span>
<span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded flex items-center">
<svg className="w-2.5 h-2.5 mr-0.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15"/></svg>
              0.0%
            </span>
</div>
</div>

<div className="flex bg-slate-100 p-0.5 rounded-lg text-[10px] font-semibold">
<button className="bg-white text-blue-700 px-2 py-1 rounded shadow-sm">Earnings</button>
<button className="text-slate-500 hover:text-slate-800 px-2 py-1">Expenses</button>
</div>
</div>

<div className="pt-4 pb-1">
<div className="h-28 flex items-end justify-between space-x-1 px-1">

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "75%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">1</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-500 rounded-t-sm" style={{ height: "25%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">3</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "45%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">5</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "90%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">8</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-400 rounded-t-sm" style={{ height: "55%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">10</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "40%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">12</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "60%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">15</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-500 rounded-t-sm" style={{ height: "35%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">18</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "70%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">20</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "50%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">25</span>
</div>

<div className="flex-1 flex flex-col items-center h-full justify-end">
<div className="w-full bg-blue-600 rounded-t-sm" style={{ height: "65%" }}></div>
<span className="text-[8px] font-medium text-slate-400 mt-1">30</span>
</div>
</div>
</div>
</section>


<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="payout-donut-breakdown">
<div className="flex items-center justify-between mb-3">
<h3 className="text-sm font-bold text-slate-900">Payout Overview</h3>
<span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">This Month</span>
</div>
<div className="flex items-center justify-between">

<div className="relative w-36 h-36 flex-shrink-0 flex items-center justify-center">
<svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">

<circle cx="50" cy="50" fill="transparent" r="38" stroke="#f1f5f9" strokeWidth="11"/>

<circle className="donut-slice" cx="50" cy="50" fill="transparent" r="38" stroke="#f43f5e" strokeDasharray="238.76" strokeDashoffset="238.76" strokeLinecap="round" strokeWidth="11"/>

<circle className="donut-slice" cx="50" cy="50" fill="transparent" r="38" stroke="#3b82f6" strokeDasharray="238.76" strokeDashoffset="238.76" strokeLinecap="round" strokeWidth="11"/>

<circle className="donut-slice" cx="50" cy="50" fill="transparent" r="38" stroke="#38bdf8" strokeDasharray="238.76" strokeDashoffset="238.76" strokeLinecap="round" strokeWidth="11"/>

<circle className="donut-slice" cx="50" cy="50" fill="transparent" r="38" stroke="#10b981" strokeDasharray="238.76" strokeDashoffset={(wallet?.balances?.totalWithdrawn || 0) > 0 ? 0 : 238.76} strokeLinecap="round" strokeWidth="11"/>
</svg>

<div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
<span className="text-[10px] font-medium text-slate-400">Paid</span>
<span className="text-sm font-black text-slate-900"><CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} decimals={2} prefix="₹ " duration={2.5} /></span>
</div>
</div>

<div className="flex-1 pl-4 space-y-2 text-xs">
<div className="flex items-center justify-between">
<div className="flex items-center space-x-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-blue-500 shrink-0"></span>
<span className="text-slate-600 font-medium">Requested</span>
</div>
<span className="font-bold text-slate-800">₹ 0.00</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center space-x-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-sky-400 shrink-0"></span>
<span className="text-slate-600 font-medium">Approved</span>
</div>
<span className="font-bold text-slate-800">₹ 0.00</span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center space-x-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0"></span>
<span className="text-slate-600 font-medium">Paid</span>
</div>
<span className="font-bold text-slate-800"><CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} decimals={2} prefix="₹ " duration={2.5} /></span>
</div>
<div className="flex items-center justify-between">
<div className="flex items-center space-x-1.5">
<span className="w-2.5 h-2.5 rounded-full bg-rose-500 shrink-0"></span>
<span className="text-slate-600 font-medium">Rejected</span>
</div>
<span className="font-bold text-slate-800">₹ 0.00</span>
</div>
</div>
</div>
</section>


<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="team-performance-card">
<div className="flex items-center justify-between mb-3">
<h3 className="text-sm font-bold text-slate-900">Team Performance</h3>
<a className="text-xs font-semibold text-blue-600 hover:text-blue-700" href="/dashboard/team">View All</a>
</div>

<div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-3 text-xs font-semibold text-center">
<button className="py-1.5 bg-white text-blue-600 rounded-lg shadow-sm">Top Earners</button>
<button className="py-1.5 text-slate-500 hover:text-slate-900">Top Recruiters</button>
</div>



<div className="space-y-3">
  {(!team?.members || team.members.length === 0) ? (
    <div className="text-center py-6 text-slate-400 text-xs">No team members found</div>
  ) : (
    team.members.slice(0, 4).map((m: any, i: number) => (
      <div key={m.id || i} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
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

</section>


<div className="space-y-4">

<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="new-members-list">
<div className="flex items-center justify-between mb-3">
<h3 className="text-sm font-bold text-slate-900">New Members</h3>
<a className="text-xs font-semibold text-blue-600 hover:text-blue-700" href="/dashboard/team">View All</a>
</div>
<div className="divide-y divide-slate-100">

{(!team?.members || team.members.length === 0) ? (
  <div className="text-center py-6 text-slate-400 text-xs">No new members yet</div>
) : (
  team.members.slice(0, 3).map((m: any, i: number) => (
    <div key={i} className="py-2.5 flex items-center justify-between first:pt-0 last:pb-0">
      <div className="flex items-center space-x-2.5">
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">{m.full_name?.charAt(0) || 'U'}</div>
        <div>
          <p className="text-xs font-bold text-slate-800">{m.full_name}</p>
          <p className="text-[10px] font-mono text-slate-400">{m.username}</p>
        </div>
      </div>
      <span className="text-[10px] font-medium text-slate-400">{new Date(m.joined_at).toLocaleDateString()}</span>
    </div>
  ))
)}</div></section>

<section className="bg-white rounded-2xl border border-slate-100 p-4 shadow-card" data-purpose="recent-activities-feed">
<div className="flex items-center justify-between mb-3">
<h3 className="text-sm font-bold text-slate-900">Recent Activities</h3>
<a className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center" href="/dashboard/ewallet">
            View All
            <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6"/></svg>
</a>
</div>
        <div className="space-y-3">
          {(!transactions || !Array.isArray(transactions) || transactions.length === 0) ? (
            <div className="text-center py-6 text-slate-400 text-xs">No recent activities</div>
          ) : (
            transactions.slice(0, 5).map((txn, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
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
</section>
</div>


<footer className="pt-4 pb-2 text-center">
<p className="text-[11px] text-slate-400">© 2026 Elora Global. All rights reserved.</p>
<p className="text-[9px] text-slate-300 mt-0.5">Executive iOS Mobile Portal</p>
</footer>


  
</motion.main>



          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


function MobileSkeleton() {
  return (
    <div className="max-w-[428px] mx-auto px-4 pt-3.5 space-y-4 animate-pulse">
      <div className="h-40 bg-slate-200 rounded-2xl"></div>
      <div className="h-32 bg-slate-200 rounded-2xl"></div>
      <div className="h-28 bg-slate-200 rounded-2xl"></div>
      <div className="h-48 bg-slate-200 rounded-2xl"></div>
    </div>
  )
}

