'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { signOutAction } from '@/app/auth/actions'
import { useDashboardContext } from './DashboardContext'

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { rank } = useDashboardContext()

  const handleLogout = async () => {
    await signOutAction()
    router.push('/login')
  }

  return (
    <motion.aside initial={{ x: -100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between shrink-0 min-h-screen sticky top-0 h-screen z-30 select-none hidden md:flex">
      <div className="p-5 flex flex-col h-full overflow-y-auto">
        {/* Logo Branding */}
        <div className="flex items-center gap-3 px-2 mb-7">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-blue-400 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
              <polygon points="12 2 2 8.5 12 15 22 8.5 12 2"/>
              <polygon points="2 15.5 12 22 22 15.5"/>
            </svg>
          </div>
          <div>
            <h1 className="font-black tracking-wider text-slate-900 text-lg leading-none">ELORA</h1>
            <span className="text-[10px] tracking-[0.25em] font-semibold text-slate-400 uppercase">Global</span>
          </div>
        </div>
        
        {/* Navigation Menu */}
        <nav className="space-y-1.5 text-[13.5px] font-medium text-slate-600">
          <Link href="/dashboard" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all ${pathname === '/dashboard' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-squares-four text-lg ${pathname === '/dashboard' ? 'ph-bold' : 'ph'}`}></i>
            <span className={pathname === '/dashboard' ? 'font-semibold tracking-wide' : ''}>Dashboard</span>
          </Link>
          
          <Link href="/tree" className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/tree' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <span className="flex items-center gap-3">
              <i className={`ph-tree-structure text-lg ${pathname === '/tree' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
              <span className={pathname === '/tree' ? 'font-semibold tracking-wide' : ''}>Genealogy Tree</span>
            </span>
            <i className={`ph-caret-right text-xs ${pathname === '/tree' ? 'text-white' : 'ph text-slate-400'}`}></i>
          </Link>

          <Link href="/dashboard/network" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/network' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-users-three text-lg ${pathname === '/dashboard/network' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
            <span className={pathname === '/dashboard/network' ? 'font-semibold tracking-wide' : ''}>Network List</span>
          </Link>
          
          <Link href="/dashboard/business" className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/business' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <span className="flex items-center gap-3">
              <i className={`ph-briefcase text-lg ${pathname === '/dashboard/business' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
              <span className={pathname === '/dashboard/business' ? 'font-semibold tracking-wide' : ''}>Business</span>
            </span>
            <i className={`ph-caret-down text-xs ${pathname === '/dashboard/business' ? 'text-white' : 'ph text-slate-400'}`}></i>
          </Link>
          
          <Link href="/dashboard/ewallet" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/ewallet' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-wallet text-lg ${pathname === '/dashboard/ewallet' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
            <span className={pathname === '/dashboard/ewallet' ? 'font-semibold tracking-wide' : ''}>E-Wallet</span>
          </Link>
          
          <Link href="/dashboard/payout" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/payout' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-credit-card text-lg ${pathname === '/dashboard/payout' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
            <span className={pathname === '/dashboard/payout' ? 'font-semibold tracking-wide' : ''}>Payout</span>
          </Link>

          
          <Link href="/dashboard/reports" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/reports' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-chart-bar text-lg ${pathname === '/dashboard/reports' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
            <span className={pathname === '/dashboard/reports' ? 'font-semibold tracking-wide' : ''}>Reports</span>
          </Link>
          
          <Link href="/dashboard/marketing" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/marketing' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-megaphone text-lg ${pathname === '/dashboard/marketing' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
            <span className={pathname === '/dashboard/marketing' ? 'font-semibold tracking-wide' : ''}>Marketing</span>
          </Link>
          
          <Link href="/dashboard/support" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/support' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-headset text-lg ${pathname === '/dashboard/support' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
            <span className={pathname === '/dashboard/support' ? 'font-semibold tracking-wide' : ''}>Support</span>
          </Link>
          
          <Link href="/dashboard/settings" className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors ${pathname === '/dashboard/settings' ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30' : 'hover:bg-slate-100 hover:text-slate-900'}`}>
            <i className={`ph-gear text-lg ${pathname === '/dashboard/settings' ? 'ph-bold text-white' : 'ph text-slate-400'}`}></i>
            <span className={pathname === '/dashboard/settings' ? 'font-semibold tracking-wide' : ''}>Settings</span>
          </Link>

          <button onClick={handleLogout} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-colors hover:bg-red-50 text-red-600 hover:text-red-700 w-full mt-2">
            <i className="ph-sign-out text-lg"></i>
            <span className="font-semibold tracking-wide">Logout</span>
          </button>

          {/* Switch to Trading Platform */}
          <div className="mt-4 pt-4 border-t border-slate-200">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold px-1 mb-2">Switch Platform</p>
            <Link
              href="/trading"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[#1D4ED8] to-[#7C3AED] text-white font-bold text-[13px] shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 hover:brightness-110 transition-all"
            >
              <i className="ph-graduation-cap text-lg"></i>
              <div className="flex flex-col leading-tight">
                <span>Elora Academy</span>
                <span className="text-[10px] font-normal text-blue-100 tracking-wide">Trading Platform →</span>
              </div>
            </Link>
          </div>
        </nav>
        
        {/* Bottom Card: Current Rank Promo */}
        <div className="mt-auto pt-4">
          <div className="bg-[#0b172a] rounded-2xl p-4 text-white relative overflow-hidden shadow-xl border border-slate-700/40">
            <div className="relative z-10">
              <span className="text-[11px] text-slate-400 block font-medium">Current Rank</span>
              <div className="flex items-center justify-between mt-0.5 mb-3">
                <span className="text-lg font-bold tracking-tight text-white">{rank?.displayName || "Bronze"}</span>
                {/* 3D Badge Mockup Icon */}
                <div className="w-9 h-9 rounded-lg bg-gradient-to-b from-slate-200 to-slate-400 p-[1px] shadow-lg flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-b from-slate-300 via-slate-100 to-slate-400 rounded-[7px] flex items-center justify-center">
                    <i className="ph-fill ph-shield text-slate-700 text-lg drop-shadow"></i>
                  </div>
                </div>
              </div>
              {/* Progress Bar */}
              <div className="text-[10.5px] text-slate-300 flex justify-between font-medium mb-1.5">
                <span>Next Rank: {rank?.nextRank?.displayName || "None"}</span>
                <span className="text-brand-400 font-bold">{rank?.nextRank?.progress?.bvPercent || 0}%</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                <div className="bg-brand-500 h-1.5 rounded-full transition-all duration-1000" style={{width: `${rank?.nextRank?.progress?.bvPercent || 0}%`}}></div>
              </div>
            </div>
            {/* Background Glow Effect */}
            <div className="absolute -bottom-8 -right-8 w-24 h-24 bg-brand-600/30 rounded-full blur-xl pointer-events-none"></div>
          </div>
          {/* Copyright */}
          <p className="text-[11px] text-slate-400 mt-4 px-1 leading-relaxed">
            © 2026 Elora Global<br/>
            <span className="text-slate-400/80">All rights reserved</span>
          </p>
        </div>
      </div>
    </motion.aside>
  )
}
