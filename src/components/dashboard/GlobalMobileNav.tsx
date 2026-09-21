'use client'

import { signOutAction } from "@/app/auth/actions";


import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

export default function GlobalMobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [userPackage, setUserPackage] = useState<number | null>(null);
  const isAuthPage = pathname === '/login' || pathname === '/register' || pathname?.startsWith('/auth');


  useEffect(() => {
    if (isAuthPage) return;
    
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.profile) {
          const pkg = data.profile.package_name?.toLowerCase() || '';
          if (pkg.includes('elite') || pkg.includes('executive')) setUserPackage(3);
          else if (pkg.includes('pro') || pkg.includes('growth')) setUserPackage(2);
          else if (pkg.includes('starter')) setUserPackage(1);
          else setUserPackage(0);
        } else {
          setUserPackage(0);
        }
      })
      .catch(() => setUserPackage(0));
  }, [pathname, isAuthPage]);


  const handleLogout = async () => {
    setShowQuickActions(false);
    await signOutAction();
    router.push('/login');
  };

  
  const isTrading = pathname?.startsWith('/trading');

  if (isAuthPage) return null;


  return (
    <>
      {/* QUICK ACTIONS OVERLAY (The "Menu") */}
      <AnimatePresence>
        {showQuickActions && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowQuickActions(false)}
              className="fixed inset-0 bg-slate-900/80 backdrop-blur-[24px] z-[80] md:hidden"
            />
            
            <motion.div
              initial={{ opacity: 0, y: 100, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 100, scale: 0.95 }}
              transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              className="fixed bottom-[100px] left-5 right-5 bg-white p-6 rounded-[28px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-[90] md:hidden border border-white/60 backdrop-blur-xl"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-slate-800">
                  {isTrading ? 'Trading Engine' : 'Business Engine'} Menu
                </h3>
                <button onClick={() => setShowQuickActions(false)} className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200">
                  <i className="ph-bold ph-x text-sm"></i>
                </button>
              </div>

              
              {userPackage === 0 ? (
                 <div className="flex flex-col items-center justify-center py-6 text-center">
                   <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 text-amber-600 flex items-center justify-center mb-4 shadow-inner">
                     <span className="material-symbols-outlined text-[32px]">workspace_premium</span>
                   </div>
                   <h4 className="font-bold text-slate-800 text-[18px] mb-2">Package Required</h4>
                   <p className="text-[13px] text-slate-500 mb-6 px-4">Upgrade your package to unlock the full ecosystem of tools, insights, and trading capabilities.</p>
                   <Link href="/dashboard/business" onClick={() => setShowQuickActions(false)} className="bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-sm px-8 py-3 rounded-full shadow-lg shadow-amber-500/30 active:scale-95 transition-all">
                     View Packages
                   </Link>
                 </div>
              ) : userPackage === null ? (
                 <div className="py-12 flex justify-center">
                   <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                 </div>
              ) : (
                <div className="grid grid-cols-4 gap-y-6 gap-x-2">

                {!isTrading ? (
                  // --- BUSINESS MENU ---
                  <>
                    <Link href="/dashboard" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-sm border border-blue-100"><i className="ph-bold ph-squares-four"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Dashboard</span>
                    </Link>
                    <Link href="/tree" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-sm border border-emerald-100"><i className="ph-bold ph-tree-structure"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Genealogy</span>
                    </Link>
                    <Link href="/dashboard/network" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-sm border border-blue-100"><i className="ph-bold ph-users-three"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Network</span>
                    </Link>
                    <Link href="/dashboard/business" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg shadow-sm border border-purple-100"><i className="ph-bold ph-briefcase"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Business</span>
                    </Link>
                    <Link href="/dashboard/ewallet" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-sm border border-amber-100"><i className="ph-bold ph-wallet"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">E-Wallet</span>
                    </Link>
                    <Link href="/dashboard/payout" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center text-lg shadow-sm border border-rose-100"><i className="ph-bold ph-bank"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Payout</span>
                    </Link>
                    <Link href="/dashboard/reports" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg shadow-sm border border-cyan-100"><i className="ph-bold ph-chart-bar"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Reports</span>
                    </Link>
                    <Link href="/dashboard/marketing" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-lg shadow-sm border border-pink-100"><i className="ph-bold ph-megaphone"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Marketing</span>
                    </Link>
                    <Link href="/dashboard/support" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-sm border border-indigo-100"><i className="ph-bold ph-headset"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Support</span>
                    </Link>
                    <Link href="/trading" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg shadow-sm border border-slate-700"><i className="ph-bold ph-swap"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Trading</span>
                    </Link>
                  </>
                ) : (
                  // --- TRADING MENU ---
                  <>
                    <Link href="/trading" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-lg shadow-sm border border-blue-100"><i className="ph-bold ph-squares-four"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Dashboard</span>
                    </Link>
                    <Link href="/trading/terminal" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg shadow-sm border border-indigo-100"><i className="ph-bold ph-chart-line-up"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Terminal</span>
                    </Link>
                    <Link href="/trading/tools" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-lg shadow-sm border border-slate-200"><i className="ph-bold ph-wrench"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Tools</span>
                    </Link>
                    <Link href="/trading/live" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg shadow-sm border border-red-100"><i className="ph-bold ph-broadcast"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Live Room</span>
                    </Link>
                    <Link href="/trading/strategy" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-lg shadow-sm border border-amber-100"><i className="ph-bold ph-lightbulb"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Strategy</span>
                    </Link>
                    <Link href="/trading/journal" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-lg shadow-sm border border-emerald-100"><i className="ph-bold ph-book-open"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Journal</span>
                    </Link>
                    <Link href="/trading/analytics" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg shadow-sm border border-cyan-100"><i className="ph-bold ph-chart-pie"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Analytics</span>
                    </Link>
                    <Link href="/trading/exam" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-lg shadow-sm border border-purple-100"><i className="ph-bold ph-certificate"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Exam</span>
                    </Link>
                    <Link href="/trading/passport" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-pink-50 text-pink-600 flex items-center justify-center text-lg shadow-sm border border-pink-100"><i className="ph-bold ph-identification-badge"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Passport</span>
                    </Link>
                    <Link href="/trading/achievements" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-yellow-50 text-yellow-600 flex items-center justify-center text-lg shadow-sm border border-yellow-100"><i className="ph-bold ph-trophy"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Awards</span>
                    </Link>
                    <Link href="/trading/community" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 flex items-center justify-center text-lg shadow-sm border border-teal-100"><i className="ph-bold ph-users"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Community</span>
                    </Link>
                    <Link href="/dashboard" onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                      <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center text-lg shadow-sm border border-slate-700"><i className="ph-bold ph-swap"></i></div>
                      <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Business</span>
                    </Link>
                  </>
                )}
                
                <Link href={isTrading ? "/trading/settings" : "/dashboard/settings"} onClick={() => setShowQuickActions(false)} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-slate-50 text-slate-600 flex items-center justify-center text-lg shadow-sm border border-slate-200"><i className="ph-bold ph-gear"></i></div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Settings</span>
                </Link>
              
                <button onClick={handleLogout} className="flex flex-col items-center gap-1.5">
                  <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center text-lg shadow-sm border border-red-100"><i className="ph-bold ph-sign-out"></i></div>
                  <span className="text-[9px] font-bold text-slate-600 text-center leading-tight">Logout</span>
                </button>
              </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <nav className="fixed bottom-0 w-full bg-white/85 backdrop-blur-2xl border-t border-white/50 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 px-6 z-[70] rounded-t-[32px] shadow-[0_-8px_30px_rgba(0,0,0,0.08)] md:hidden block">
        <div className="flex items-center justify-between pb-2">
          
          <Link href={isTrading ? "/trading" : "/dashboard"} className={`flex flex-col items-center justify-center gap-1 ${(pathname === '/dashboard' || pathname === '/trading') ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className={`ph-fill ph-house text-2xl ${(pathname === '/dashboard' || pathname === '/trading') ? 'drop-shadow-sm' : ''}`}></i>
            <span className="text-[9px] font-semibold">Home</span>
          </Link>
          
          <Link href={isTrading ? "/trading/market" : "/dashboard/ewallet"} className={`flex flex-col items-center justify-center gap-1 ${(pathname.includes('ewallet') || pathname.includes('market')) ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className={`ph-fill ${isTrading ? 'ph-globe' : 'ph-wallet'} text-2xl`}></i>
            <span className="text-[9px] font-semibold">{isTrading ? 'Market' : 'E-Wallet'}</span>
          </Link>

          <div className="relative -mt-7">
            <button onClick={() => setShowQuickActions(!showQuickActions)} aria-label="Quick Action" className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 to-blue-500 text-white shadow-[0_8px_20px_rgba(37,99,235,0.25)] flex items-center justify-center active:scale-95 transition-transform border-[3px] border-white/80">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                <line x1="12" x2="12" y1="5" y2="19"/>
                <line x1="5" x2="19" y1="12" y2="12"/>
              </svg>
            </button>
            <span className="text-[9px] font-semibold text-slate-500 mt-1 absolute left-1/2 -translate-x-1/2">Menu</span>
          </div>

          <Link href={isTrading ? "/trading/academy" : "/tree"} className={`flex flex-col items-center justify-center gap-1 ${(pathname === '/tree' || pathname.includes('academy')) ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className={`ph-fill ${isTrading ? 'ph-graduation-cap' : 'ph-tree-structure'} text-2xl`}></i>
            <span className="text-[9px] font-semibold">{isTrading ? 'Academy' : 'Network'}</span>
          </Link>
          
          <Link href={isTrading ? "/trading/terminal" : "/dashboard/settings"} className={`flex flex-col items-center justify-center gap-1 ${(pathname.includes('settings') || pathname.includes('terminal')) ? 'text-blue-600' : 'text-slate-400'}`}>
            <i className={`ph-fill ${isTrading ? 'ph-chart-line-up' : 'ph-gear'} text-2xl`}></i>
            <span className="text-[9px] font-semibold">{isTrading ? 'Terminal' : 'Settings'}</span>
          </Link>

        </div>
      </nav>
    </>
  )
}