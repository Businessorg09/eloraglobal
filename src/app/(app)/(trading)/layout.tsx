'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navCategories = [
  {
    title: 'EXECUTION & OPS',
    items: [
      { name: 'Dashboard', path: '/trading', icon: 'space_dashboard' },
      { name: 'Trading Dashboard', path: '/trading/terminal', icon: 'monitoring' },
      { name: 'Trading Tools', path: '/trading/tools', icon: 'construction' },
      { name: 'Market', path: '/trading/market', icon: 'language' },
      { name: 'Live Room', path: '/trading/live', icon: 'sensors', badge: 'LIVE' },
    ]
  },
  {
    title: 'INTELLIGENCE & PREP',
    items: [
      { name: 'Strategy Lab', path: '/trading/strategy', icon: 'science' },
      { name: 'Trading Journal', path: '/trading/journal', icon: 'menu_book' },
      { name: 'Analytics', path: '/trading/analytics', icon: 'bar_chart' },
    ]
  },
  {
    title: 'QUALIFICATION & NETWORK',
    items: [
      { name: 'Academy', path: '/trading/academy', icon: 'school' },
      { name: 'Exam Center', path: '/trading/exam', icon: 'assignment' },
      { name: 'Trader Passport', path: '/trading/passport', icon: 'badge' },
      { name: 'Achievements', path: '/trading/achievements', icon: 'emoji_events' },
      { name: 'Community', path: '/trading/community', icon: 'groups' },
    ]
  },
  {
    title: 'SYSTEM',
    items: [
      { name: 'Settings', path: '/trading/settings', icon: 'settings' },
    ]
  }
]

import { PackageProvider, usePackage, PackageTier } from './trading/context/PackageContext'
import { useRouter } from 'next/navigation'
import { signOutAction } from '@/app/auth/actions'

export default function TradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <PackageProvider>
      <InnerTradingLayout>{children}</InnerTradingLayout>
    </PackageProvider>
  )
}

function InnerTradingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { currentPackage, setCurrentPackage, hasPassedExam } = usePackage()

  const handleLogout = async () => {
    await signOutAction()
    router.push('/login')
  }

  // Function to determine if a route is locked
  const isRouteLocked = (path: string) => {
    const p = currentPackage;
    
    // Elite package bypasses all UI locks
    if (p === 3) return false;
    
    // Users with no trading package have everything locked
    if (p === 0) return true;

    if (['/trading/terminal'].includes(path)) {
      return !hasPassedExam;
    }
    if (['/trading/journal', '/trading/achievements', '/trading/passport'].includes(path)) {
      return p < 2;
    }
    if (['/trading/community', '/trading/live', '/trading/analytics', '/trading/strategy', '/trading/tools', '/trading/market'].includes(path)) {
      return p < 3;
    }
    return false;
  };

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-body-md text-on-surface">
      
      {/* Sidebar */}
      <aside className="hidden md:flex w-[280px] bg-white border-r border-[#E5E7EB] flex-col justify-between h-full flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            
          {/* Mobile Logo (Visible only when sidebar is hidden) */}
          <div className="md:hidden flex items-center gap-2">
            <div className="w-8 h-8 bg-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-sm">E</div>
            <div className="flex flex-col">
              <span className="text-[12px] font-black text-[#111827] leading-none">ELORA</span>
              <span className="text-[8px] font-bold text-[#1D4ED8] uppercase tracking-wider">Trading</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
              <div className="w-8 h-8 bg-[#1D4ED8] rounded-lg flex items-center justify-center text-white font-bold text-lg">E</div>
              <div>
                <h2 className="font-bold text-[18px] leading-tight tracking-tight text-[#111827]">ELORA</h2>
                <p className="text-[10px] uppercase font-bold tracking-widest text-[#6B7280]">Trading Engine Pro</p>
              </div>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#059669]"></div>
          </div>

          <div className="px-4 mb-4">
            <div className="relative group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#9CA3AF]">search</span>
              <input 
                type="text" 
                placeholder="Filter tools..." 
                className="w-full bg-[#F3F4F6] border border-transparent text-[#111827] text-[12px] font-medium rounded-lg py-2 pl-9 pr-3 focus:outline-none focus:border-[#1D4ED8] focus:bg-white focus:ring-4 focus:ring-[#1D4ED8]/10 transition-all"
              />
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-4 pb-6 custom-scrollbar">
            {navCategories.map((cat, i) => (
              <div key={i} className="mb-6">
                <h3 className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-2 px-3">{cat.title}</h3>
                <div className="space-y-0.5">
                  {cat.items.map((item) => {
                    const isActive = pathname === item.path || (pathname.startsWith(`${item.path}/`) && item.path !== '/trading');
                    const locked = isRouteLocked(item.path);
                    return (
                      <Link
                        key={item.name}
                        href={item.path}
                        onClick={(e) => {
                          if (locked) e.preventDefault(); // Optional: prevent navigation if clicking sidebar directly, or let them click to see the blur
                        }}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-medium transition-all group relative ${
                          isActive 
                            ? 'bg-[#1D4ED8] text-white shadow-[0_4px_12px_rgba(29,78,216,0.2)]' 
                            : locked 
                              ? 'text-[#9CA3AF] opacity-60 hover:bg-[#F3F4F6]' 
                              : 'text-[#4B5563] hover:bg-[#F3F4F6] hover:text-[#111827]'
                        }`}
                      >
                        <span className={`material-symbols-outlined text-[18px] ${isActive ? 'text-white' : 'text-[#9CA3AF] group-hover:text-[#4B5563]'}`}>
                          {locked ? 'lock' : item.icon}
                        </span>
                        <span>{item.name}</span>
                        {locked && (
                          <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280]">
                            LOCKED
                          </span>
                        )}
                        {!locked && item.badge && (
                          <span className={`ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded ${isActive ? 'bg-white text-[#1D4ED8]' : 'bg-[#EF4444] text-white'}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ))}
            
            <div className="mt-2 space-y-0.5">
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-bold transition-all group w-full text-left text-[#EF4444] hover:bg-[#FEF2F2] hover:text-[#DC2626]"
              >
                <span className="material-symbols-outlined text-[18px] text-[#EF4444] group-hover:text-[#DC2626]">
                  logout
                </span>
                <span>Logout</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Bottom Switch Button */}
        <div className="p-4 border-t border-[#E5E7EB] bg-white flex flex-col gap-2">
          <div className="flex items-center justify-between mb-1 px-2">
            <div className="flex flex-col">
              <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Capital Tier</span>
              <span className="text-[14px] font-bold text-[#1D4ED8]">
                {currentPackage === 3 ? '$100k Allocated' : currentPackage === 2 ? '$25k Allocated' : currentPackage === 1 ? '$10k Allocated' : '$0 Allocated'}
              </span>
            </div>
            <span className="bg-[#DBEAFE] text-[#1D4ED8] text-[10px] font-bold px-2 py-1 rounded">
              {currentPackage === 3 ? 'ELITE' : currentPackage === 2 ? 'PRO' : currentPackage === 1 ? 'STARTER' : 'NONE'}
            </span>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 justify-center w-full px-4 py-2 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] hover:text-[#111827] border border-[#E5E7EB] rounded-lg text-[12px] font-bold transition-colors group">
            <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
            Business Engine
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        
        {/* Top Header */}
        <header className="h-[72px] bg-white border-b border-[#E5E7EB] flex items-center justify-between px-6 flex-shrink-0 z-10">
          
          {/* Left: Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-[#F3F4F6] text-[#9CA3AF] px-3 py-1.5 rounded-full border border-[#E5E7EB]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#9CA3AF]"></div>
              <span className="text-[11px] font-bold tracking-wide uppercase">Feed Disconnected</span>
            </div>
            <div className="flex items-center gap-2 bg-[#F3F4F6] text-[#9CA3AF] px-3 py-1.5 rounded-full border border-[#E5E7EB]">
              <span className="text-[11px] font-bold tracking-wide uppercase">No Cohort</span>
            </div>
          </div>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-4 ml-auto">
            <button className="hidden sm:flex items-center gap-2 bg-[#E5E7EB] text-[#9CA3AF] px-4 py-2 rounded-lg font-bold text-[13px] shadow-sm cursor-not-allowed">
              <span className="material-symbols-outlined text-[18px]">play_circle</span>
              Awaiting Module
            </button>
            
            <div className="w-px h-6 bg-[#E5E7EB] mx-1"></div>
            
            <button className="relative text-[#6B7280] hover:text-[#111827] transition-colors">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
            </button>

            <button className="flex items-center gap-2 ml-2 hover:bg-[#F3F4F6] p-1 pr-3 rounded-full transition-colors border border-transparent hover:border-[#E5E7EB]">
              <div className="w-8 h-8 rounded-full bg-[#E5E7EB] border-2 border-white shadow-sm overflow-hidden flex items-center justify-center">
                <span className="material-symbols-outlined text-[20px] text-[#9CA3AF]">person</span>
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[13px] font-bold text-[#111827] leading-tight">Trader Profile</span>
                <span className="text-[10px] font-semibold text-[#9CA3AF] leading-tight">Unranked</span>
              </div>
            </button>
          </div>

        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-[#F8F9FA] px-5 py-6 pb-[120px] md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto w-full">
            {children}
          </div>
        </div>

      
            </main>
      
      {/* Global styles for custom scrollbar within this layout if needed */}
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
          border-radius: 20px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.5);
        }
      `}} />
    </div>
  )
}
