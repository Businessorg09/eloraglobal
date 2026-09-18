'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { signOutAction } from '@/app/auth/actions';

const navLinks = [
  { href: '/admin-trading', label: 'Dashboard', icon: 'grid_view' },
  { href: '/admin-trading/users', label: 'Users & Members', icon: 'group' },
  { href: '/admin-trading/packages', label: 'Trading Accounts', icon: 'workspace_premium' },
  { href: '/admin-trading/courses', label: 'Courses & CMS', icon: 'menu_book' },
  { href: '/admin-trading/live-room', label: 'Live Room Admin', icon: 'stream' },
  { href: '/admin-trading/moderation', label: 'Community Moderation', icon: 'forum' },
  { href: '/admin-trading/financials', label: 'Financials & PnL', icon: 'monitoring' },
  { href: '/admin-trading/settings', label: 'Settings', icon: 'settings' },
];

export default function AdminTradingSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOutAction();
    router.push('/login');
  };

  // Active: exact match for dashboard, prefix match for others
  const isActive = (href: string) => {
    if (href === '/admin-trading') return pathname === '/admin-trading';
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-50 w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1D4ED8] flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[18px]">diamond</span>
          </div>
          <span className="font-bold text-[16px] tracking-tight text-slate-900">Elora Academy</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="text-slate-600">
          <span className="material-symbols-outlined">{isSidebarOpen ? 'close' : 'menu'}</span>
        </button>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-[260px] bg-white z-50 flex flex-col justify-between border-r border-slate-200
        transition-transform duration-300 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="flex flex-col flex-1 overflow-y-auto">
          {/* Logo */}
          <div className="h-[72px] px-6 hidden lg:flex items-center gap-3 border-b border-slate-100 shrink-0">
            <div className="w-10 h-10 rounded-[10px] bg-[#1D4ED8] flex items-center justify-center text-white shadow-sm">
              <span className="material-symbols-outlined text-[22px]">diamond</span>
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-[15px] text-slate-900 tracking-tight leading-tight">Elora Academy</span>
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider leading-tight">Admin Console</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="px-3 py-4 space-y-0.5">
            {navLinks.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`
                    group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-[13px]
                    ${active
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] font-bold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-medium'}
                  `}
                >
                  <span className={`material-symbols-outlined text-[20px] ${active ? 'text-[#1D4ED8]' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    {link.icon}
                  </span>
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Divider + Switch */}
          <div className="mt-auto px-3 pb-2 pt-4 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold px-2 mb-2">Switch Platform</p>
            <Link
              href="/admin"
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-[13px] transition-colors"
            >
              <span className="material-symbols-outlined text-[20px] text-slate-400">account_tree</span>
              Business Admin
            </Link>
          </div>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 rounded-xl bg-[#F8FAFC] border border-slate-100 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer w-full text-left group"
          >
            <div className="w-9 h-9 rounded-full bg-[#1D4ED8] flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-bold text-[13px] text-slate-900 truncate">Admin</span>
              <span className="text-[11px] text-slate-500">Master Admin</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-slate-400 group-hover:text-red-500 transition-colors">logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
