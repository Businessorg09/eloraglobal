'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState } from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navLinks = [
    { href: '/admin', label: 'Overview Dashboard', icon: 'monitoring' },
    { href: '/admin/users', label: 'Member Governance', icon: 'manage_accounts' },
    { href: '/admin/cron', label: 'Cron & Settlement', icon: 'schedule_send' },
    { href: '/admin/rules', label: 'Compensation Rules', icon: 'account_tree' },
    { href: '/admin/financials', label: 'Financial & Approvals', icon: 'payments' },
    { href: '/admin/audit', label: 'System Audit & Log', icon: 'security' },
  ];

  return (
    <div className="bg-background font-body-md text-on-surface antialiased min-h-screen flex flex-col lg:flex-row w-full">
      
      {/* Mobile Header Overlay Trigger */}
      <div className="lg:hidden h-header-height bg-surface-container-lowest border-b border-surface-container-low flex items-center justify-between px-4 sticky top-0 z-50">
         <div className="flex items-center gap-2">
           <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-md text-headline-md font-bold tracking-tight shadow-sm">EG</div>
           <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight">ELORA GLOBAL</span>
         </div>
         <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-on-surface">
           <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
         </button>
      </div>

      {/* Admin Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-sidebar-width bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col">
          <div className="h-header-height px-gutter-lg hidden lg:flex items-center gap-gutter-sm bg-surface-container-low">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center text-on-primary font-headline-md text-headline-md font-bold tracking-tight shadow-sm">EG</div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-md text-headline-md font-bold text-on-surface tracking-tight truncate">ELORA GLOBAL</span>
              <span className="font-label-sm text-label-sm text-primary uppercase font-bold tracking-wider">Master Admin OS</span>
            </div>
          </div>
          
          <div className="px-gutter-md py-gutter-sm mt-4 lg:mt-0">
            <div className="px-gutter-sm py-gutter-xs text-outline font-label-sm text-label-sm uppercase tracking-wider font-semibold">Governance Nodes</div>
          </div>

          <nav className="px-gutter-sm space-y-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link key={link.href} href={link.href} onClick={() => setIsSidebarOpen(false)}>
                  <div className={`
                    group flex items-center gap-gutter-sm px-gutter-md py-2.5 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-surface-container-high text-primary font-semibold' 
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'}
                  `}>
                    <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'}`}>
                      {link.icon}
                    </span>
                    <span className="font-body-md text-body-md truncate">{link.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-gutter-md m-gutter-sm bg-surface-container-low rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <span className="font-label-sm text-label-sm text-outline uppercase font-semibold">Engine Health</span>
            <span className="flex h-2 w-2 relative">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-tertiary"></span>
            </span>
          </div>
          <div className="flex items-center justify-between font-label-md text-label-md text-on-surface">
            <span className="text-on-surface-variant font-body-sm text-body-sm">Queue Latency</span>
            <span className="font-semibold">14ms</span>
          </div>
          <div className="flex items-center justify-between font-label-md text-label-md text-on-surface mt-1">
            <span className="text-on-surface-variant font-body-sm text-body-sm">Binary Sync</span>
            <span className="font-semibold text-tertiary">Synchronized</span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen w-full lg:max-w-[calc(100%-16rem)]">
        {/* Top Header */}
        <header className="hidden lg:flex sticky top-0 h-header-height bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 items-center justify-between px-gutter-xl gap-gutter-lg">
          <div className="flex items-center gap-gutter-lg flex-1">
            <div className="flex items-center gap-gutter-xs px-2.5 py-1 rounded-full bg-surface-container text-primary">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span className="font-label-sm text-label-sm uppercase font-bold tracking-wider">Root Tier 0</span>
            </div>
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </div>
              <input 
                type="text" 
                className="w-full pl-9 pr-12 py-1.5 bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm font-body-sm rounded-lg focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary-container transition-all" 
                placeholder="Search node UID, distributor name, hash..."
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none">
                <span className="font-label-sm text-label-sm text-outline bg-surface-container px-1.5 py-0.5 rounded">⌘K</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-gutter-md">
            <div className="flex items-center gap-gutter-xs px-3 py-1.5 bg-surface-container-low rounded-lg text-on-surface-variant">
              <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
              <span className="font-label-sm text-label-sm text-outline font-semibold uppercase">IST Server:</span>
              <span suppressHydrationWarning className="font-label-md text-label-md font-semibold text-on-surface">
                {new Date().toLocaleTimeString('en-US', { timeZone: 'Asia/Kolkata', hour12: false })}
              </span>
            </div>
            <div className="flex items-center gap-gutter-xs px-2.5 py-1 bg-surface-container-low rounded-lg">
              <span className="material-symbols-outlined text-[16px] text-tertiary">shield_lock</span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">Failsafe: Arm</span>
            </div>
            
            <div className="h-6 w-px bg-surface-container"></div>
            
            <div className="flex items-center gap-gutter-sm pl-gutter-xs">
              <div className="flex flex-col text-right">
                <span className="font-label-md text-label-md font-bold text-on-surface leading-tight">Global Custodian</span>
                <span className="font-label-sm text-label-sm text-outline">Super Admin</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline cursor-pointer hover:text-on-surface transition-colors">expand_more</span>
            </div>
          </div>
        </header>

        <main className="w-full px-4 lg:px-gutter-xl py-6 lg:py-gutter-lg flex-1 bg-background">
          <div className="flex flex-col w-full gap-gutter-lg pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
