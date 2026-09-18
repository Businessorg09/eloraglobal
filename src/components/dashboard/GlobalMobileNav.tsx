'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function GlobalMobileNav() {
  const pathname = usePathname()
  const [showQuickActions, setShowQuickActions] = useState(false)

  const router = useRouter()
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Logout failed')
    }
  }


  // Don't show on auth pages or landing page
  if (pathname === '/' || pathname.includes('/login') || pathname.includes('/register')) {
    return null
  }

  return (
    <>
      {/* QUICK ACTIONS MODAL */}
      <AnimatePresence>
        {showQuickActions && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowQuickActions(false)}
              className="fixed inset-0 z-[80] bg-slate-900/40 backdrop-blur-sm md:hidden"
            />
            <motion.div 
              initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed bottom-0 left-0 right-0 z-[90] bg-white rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)] p-6 pb-10 safe-bottom md:hidden"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-900">App Navigation</h3>
                <button onClick={() => setShowQuickActions(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
              
              <div className="grid grid-cols-4 gap-y-6 gap-x-2">
                <Link href="/dashboard" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-lg shadow-sm border border-slate-200">
                    <i className="ph-bold ph-squares-four"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Dashboard</span>
                </Link>
                
                <Link href="/tree" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-sm border border-emerald-100">
                    <i className="ph-bold ph-tree-structure"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Genealogy</span>
                </Link>

                <Link href="/dashboard/network" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-sm border border-blue-100">
                    <i className="ph-bold ph-users-three"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Network</span>
                </Link>
                
                <Link href="/dashboard/business" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg shadow-sm border border-purple-100">
                    <i className="ph-bold ph-briefcase"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Business</span>
                </Link>
                
                <Link href="/dashboard/ewallet" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-sm border border-amber-100">
                    <i className="ph-bold ph-wallet"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">E-Wallet</span>
                </Link>
                
                <Link href="/dashboard/payout" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-lg shadow-sm border border-rose-100">
                    <i className="ph-bold ph-bank"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Payout</span>
                </Link>

                <Link href="/dashboard/reports" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg shadow-sm border border-cyan-100">
                    <i className="ph-bold ph-chart-bar"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Reports</span>
                </Link>
                
                <Link href="/dashboard/marketing" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-lg shadow-sm border border-pink-100">
                    <i className="ph-bold ph-megaphone"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Marketing</span>
                </Link>

                <Link href="/dashboard/support" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-sm border border-indigo-100">
                    <i className="ph-bold ph-headset"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Support</span>
                </Link>
                
                <Link href="/dashboard/settings" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-lg shadow-sm border border-slate-200">
                    <i className="ph-bold ph-gear"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Settings</span>
                </Link>
              
                <button onClick={handleLogout} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg shadow-sm border border-red-100">
                    <i className="ph-bold ph-sign-out"></i>
                  </div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-xl border-t border-slate-100 pb-safe pt-2 px-6 z-[70] rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:hidden block">
        <div className="flex items-center justify-between pb-2">
          
          <Link href="/dashboard" className={`flex flex-col items-center justify-center gap-1 ${pathname === '/dashboard' ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className={`ph-fill ph-house text-2xl ${pathname === '/dashboard' ? 'drop-shadow-sm' : ''}`}></i>
            <span className="text-[9px] font-semibold">Home</span>
          </Link>
          
          <Link href="/dashboard/ewallet" className={`flex flex-col items-center justify-center gap-1 ${pathname.includes('ewallet') ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className="ph-fill ph-wallet text-2xl"></i>
            <span className="text-[9px] font-semibold">E-Wallet</span>
          </Link>

          <div className="relative -mt-6">
            <button onClick={() => setShowQuickActions(!showQuickActions)} aria-label="Quick Action" className="w-12 h-12 rounded-full bg-gradient-to-tr from-blue-700 to-blue-500 text-white shadow-float flex items-center justify-center active:scale-95 transition-transform">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" x2="12" y1="5" y2="19"/>
                <line x1="5" x2="19" y1="12" y2="12"/>
              </svg>
            </button>
            <span className="text-[9px] font-semibold text-slate-500 mt-1 absolute left-1/2 -translate-x-1/2">Menu</span>
          </div>

          <Link href="/tree" className={`flex flex-col items-center justify-center gap-1 ${pathname === '/tree' ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className="ph-fill ph-tree-structure text-2xl"></i>
            <span className="text-[9px] font-semibold">Network</span>
          </Link>
          
          <Link href="/dashboard/settings" className={`flex flex-col items-center justify-center gap-1 ${pathname.includes('settings') ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className="ph-fill ph-gear text-2xl"></i>
            <span className="text-[9px] font-semibold">Settings</span>
          </Link>

        </div>
      </nav>
    </>
  )
}
