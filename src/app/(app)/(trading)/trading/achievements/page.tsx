'use client'

import React, { useState, useEffect } from 'react'
import { getBadges, unlockBadge } from './actions'

export default function AchievementsPage() {
  const [unlockedBadgeIds, setUnlockedBadgeIds] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBadges = async () => {
      const res = await getBadges()
      if (res.success && res.badges) {
        setUnlockedBadgeIds(res.badges)
      }
      setIsLoading(false)
    }
    fetchBadges()
  }, [])

  const handleManualUnlockTest = async (badgeId: string) => {
    // Only for demonstration/testing purposes
    if (unlockedBadgeIds.includes(badgeId)) return;
    const res = await unlockBadge(badgeId);
    if (res.success) {
      setUnlockedBadgeIds([...unlockedBadgeIds, badgeId])
    }
  }

  const allBadges = [
    { id: 'FIRST_WATCH', name: 'First Watch', desc: 'Watched your first educational video', icon: 'play_circle', color: '#1D4ED8', premium: false },
    { id: 'MODULE_ONE', name: 'Module One', desc: 'Completed the first learning module', icon: 'check_circle', color: '#8B5CF6', premium: false },
    { id: 'FIRST_BLOOD', name: 'First Blood', desc: 'Executed your first simulated trade', icon: 'water_drop', color: '#EF4444', premium: false },
    { id: 'FIRST_PROFIT', name: 'First Profit', desc: 'Closed your first profitable trade', icon: 'trending_up', color: '#059669', premium: false },
    { id: 'FUNDAMENTAL', name: 'Fundamental Analyst', desc: 'Executed a trade during a macro news event', icon: 'newspaper', color: '#F59E0B', premium: false },
    { id: 'SWING_TRADER', name: 'Swing Trader', desc: 'Held a position open for more than 24 hours', icon: 'timeline', color: '#3B82F6', premium: false },
    { id: 'SCALPER', name: 'Scalper', desc: 'Opened and closed a trade within 15 minutes', icon: 'bolt', color: '#EC4899', premium: false },
    { id: 'NETWORK_BUILDER', name: 'Network Builder', desc: 'Referred your first member to the business', icon: 'group_add', color: '#10B981', premium: false },
    { id: 'FIRST_PAYOUT', name: 'First Payout', desc: 'Successfully processed your first withdrawal', icon: 'account_balance_wallet', color: '#F59E0B', premium: true },
  ]

  // Map to include lock status based on DB
  const badges = allBadges.map(b => ({
    ...b,
    locked: !unlockedBadgeIds.includes(b.id)
  }))

  const unlockedCount = badges.filter(b => !b.locked).length;

  const leaderboard = [
    { rank: 1, name: 'Michael_T', points: 14250, badge: 'First Payout', change: 'up' },
    { rank: 2, name: 'Sarah_J', points: 13800, badge: 'Network Builder', change: 'up' },
    { rank: 3, name: 'Alex_V', points: 12100, badge: 'Fundamental Analyst', change: 'same' },
    { rank: 4, name: 'David_L', points: 11950, badge: 'Swing Trader', change: 'down' },
    { rank: 5, name: 'Emma_W', points: 10400, badge: 'First Profit', change: 'up' },
  ]

  return (
    <div className="flex flex-col max-w-[1400px] mx-auto w-full pb-10 pt-4 gap-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex flex-col">
          <h1 className="text-[24px] font-bold text-[#111827] flex items-center gap-2">
            <span className="material-symbols-outlined text-[28px] text-[#1D4ED8]">military_tech</span>
            Achievements & Leaderboard
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-1">Unlock gamified milestones across learning, execution, and networking</p>
        </div>
        <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
          <button className="bg-white text-[#111827] px-4 py-1.5 text-[12px] font-bold rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">Global</button>
          <button className="px-4 py-1.5 text-[12px] font-medium text-[#6B7280] hover:text-[#111827]">Cohort Alpha</button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left: Badges Grid */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6">
            <h2 className="text-[16px] font-bold text-[#111827] mb-6 flex items-center justify-between">
              <span>Your Milestones ({isLoading ? '-' : unlockedCount}/{badges.length} Unlocked)</span>
              <span className="text-[11px] font-normal text-[#6B7280] bg-[#F3F4F6] px-2 py-1 rounded">Click locked badges to simulate unlock</span>
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {badges.map((badge, idx) => (
                <div 
                  key={idx} 
                  onClick={() => badge.locked && handleManualUnlockTest(badge.id)}
                  className={`relative flex flex-col items-center text-center p-5 rounded-[24px] border ${badge.locked ? 'bg-[#F8FAFC] border-[#E5E7EB] opacity-60 grayscale cursor-pointer hover:opacity-100 hover:grayscale-0' : badge.premium ? 'bg-gradient-to-b from-[#FEF3C7] to-white border-[#F59E0B] shadow-[0_8px_30px_rgba(0,0,0,0.04)] transform hover:-translate-y-1 transition-transform cursor-default' : 'bg-white border-[#E5E7EB] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-[#1D4ED8] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all cursor-default'}`}
                >
                  
                  {/* Premium Badge Glow Effect */}
                  {!badge.locked && badge.premium && (
                    <div className="absolute inset-0 rounded-[24px] shadow-[0_0_15px_rgba(245,158,11,0.3)] pointer-events-none"></div>
                  )}

                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white mb-3 shadow-inner relative`} style={{ backgroundColor: badge.color }}>
                    {badge.locked ? <span className="material-symbols-outlined text-[28px]">lock</span> : <span className="material-symbols-outlined text-[32px]">{badge.icon}</span>}
                    
                    {!badge.locked && badge.premium && (
                      <span className="absolute -top-1 -right-1 text-[16px]">✨</span>
                    )}
                  </div>
                  
                  <h3 className={`font-bold text-[13px] mb-1 leading-tight ${badge.premium && !badge.locked ? 'text-[#D97706]' : 'text-[#111827]'}`}>{badge.name}</h3>
                  <p className="text-[11px] text-[#6B7280] leading-tight px-2">{badge.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Leaderboard */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[16px] font-bold text-[#111827] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#F59E0B]">emoji_events</span>
                Cohort Top 100
              </h2>
              <span className="text-[11px] font-bold text-[#6B7280]">Your Rank: <span className="text-[#1D4ED8]">#3</span></span>
            </div>
            
            <div className="flex flex-col">
              <div className="grid grid-cols-12 text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider pb-2 border-b border-[#F3F4F6] mb-2 px-2">
                <div className="col-span-2">Rank</div>
                <div className="col-span-5">Trader</div>
                <div className="col-span-3 text-right">Points</div>
                <div className="col-span-2 text-center">Trend</div>
              </div>

              {leaderboard.map((user, idx) => (
                <div key={idx} className={`grid grid-cols-12 text-[13px] py-3 items-center rounded-lg px-2 ${user.name === 'Alex_V' ? 'bg-[#EFF6FF] border border-[#DBEAFE]' : 'hover:bg-[#F8FAFC] border border-transparent border-b-[#F3F4F6]'}`}>
                  <div className="col-span-2 font-bold text-[#111827] flex items-center gap-1">
                    {idx === 0 && <span className="text-[16px]">🥇</span>}
                    {idx === 1 && <span className="text-[16px]">🥈</span>}
                    {idx === 2 && <span className="text-[16px]">🥉</span>}
                    {idx > 2 && `#${user.rank}`}
                  </div>
                  <div className="col-span-5 flex flex-col">
                    <span className={`font-bold ${user.name === 'Alex_V' ? 'text-[#1D4ED8]' : 'text-[#111827]'}`}>{user.name}</span>
                    <span className="text-[10px] text-[#6B7280] truncate">{user.badge}</span>
                  </div>
                  <div className="col-span-3 text-right font-mono font-bold text-[#111827]">
                    {user.points.toLocaleString()}
                  </div>
                  <div className="col-span-2 flex items-center justify-center">
                    {user.change === 'up' && <span className="material-symbols-outlined text-[16px] text-[#059669]">arrow_upward</span>}
                    {user.change === 'down' && <span className="material-symbols-outlined text-[16px] text-[#EF4444]">arrow_downward</span>}
                    {user.change === 'same' && <span className="material-symbols-outlined text-[16px] text-[#9CA3AF]">horizontal_rule</span>}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 p-4 bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] flex items-start gap-3">
              <span className="material-symbols-outlined text-[#1D4ED8]">info</span>
              <p className="text-[11px] text-[#4B5563] font-medium leading-relaxed">
                Points are awarded for completing modules, passing exams, and logging trades in your journal. Earn badges to display on your Trader Passport.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  )
}
