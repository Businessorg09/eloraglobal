'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { GatedContent } from '../components/GatedContent'

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const tabs = [
    { name: 'Feed', path: '/trading/community', icon: 'home' },
    { name: 'Explore', path: '/trading/community/explore', icon: 'explore' },
    { name: 'Groups', path: '/trading/community/groups', icon: 'group' },
    { name: 'Messages', path: '/trading/community/messages', icon: 'chat' },
    { name: 'Profile', path: '/trading/community/profile', icon: 'person' },
  ];

  return (
    <div className="flex flex-col h-full w-full">
      {/* Top Tab Bar Navigation */}
      <div className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-surface-container-low px-4 md:px-8">
        <div className="flex items-center gap-1 md:gap-4 overflow-x-auto hide-scrollbar max-w-7xl mx-auto">
          {tabs.map((tab) => {
            const isActive = pathname === tab.path;
            return (
              <Link 
                key={tab.path} 
                href={tab.path}
                className={`flex items-center gap-2 py-4 px-3 md:px-5 border-b-2 font-headline-md text-[14px] md:text-[15px] font-bold transition-colors shrink-0 ${
                  isActive 
                    ? 'border-primary text-primary' 
                    : 'border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-lowest'
                }`}
              >
                <span className={`material-symbols-outlined text-[20px] ${isActive ? 'filled' : ''}`}>
                  {tab.icon}
                </span>
                {tab.name}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <GatedContent minPackageRequired={3} blurLevel="md" customMessage="The Institutional Trading Guild is an exclusive community reserved for Package 3 members. Upgrade your tier to collaborate with elite traders.">
          {children}
        </GatedContent>
      </div>
    </div>
  )
}
