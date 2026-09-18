'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'
import Sidebar from '@/components/dashboard/Sidebar'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function TeamPage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [team, setTeam] = useState<any[]>([])
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [filterPos, setFilterPos] = useState('ALL')
  const [search, setSearch] = useState('')
    const [toast, setToast] = useState('')

  useEffect(() => {
    fetchTeamData()
  }, [])

  const fetchTeamData = async () => {
    try {
      const profRes = await fetch('/api/user/profile')
      if(profRes.ok) {
        const profData = await profRes.json()
        
      }

      const res = await fetch('/api/user/team')
      if (res.ok) {
        const data = await res.json()
        setTeam(data.members || [])
      }

      const statsRes = await fetch('/api/tree/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData.stats || statsData || { total: 0, left: 0, right: 0 })
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const copyLink = (pos: string) => {
    if(!profile) return
    const link = `${window.location.origin}/register?ref=${profile.username || profile.referral_code}&pl=${pos === 'L' ? '1' : '2'}`
    navigator.clipboard.writeText(link)
    setToast(`${pos === 'L' ? 'Left' : 'Right'} link copied!`)
    setTimeout(() => setToast(''), 3000)
  }

  const filteredTeam = team.filter((m: any) => {
    if (filterPos !== 'ALL' && m.referred_position !== filterPos) return false
    if (search && !m.username.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const getRankClass = (rank: string) => {
    if(!rank) return 'rank-bronze'
    const r = rank.toLowerCase()
    return `badge rank-${r}`
  }

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md">
              <div>
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline tracking-wider uppercase mb-1">
                  <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-semibold">My Team</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">My Network Team</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl mt-0.5">
                  Manage and view your direct referrals, track their activation status, and monitor leg distribution.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => copyLink('L')} className="px-3.5 py-2 rounded-lg bg-surface-container-lowest text-primary hover:bg-surface-container font-label-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all border border-surface-container" type="button">
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  <span>Copy Left Link</span>
                </button>
                <button onClick={() => copyLink('R')} className="px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-sm font-semibold flex items-center gap-1.5 shadow-sm transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]">link</span>
                  <span>Copy Right Link</span>
                </button>
              </div>
            </div>

            {toast && (
              <div className="px-4 py-2 rounded-lg bg-[#e8f9ef] text-[#25d366] font-label-md font-bold inline-flex items-center gap-2 self-start animate-fade-in shadow-sm border border-[#25d366]/20">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                {toast}
              </div>
            )}

            {/* Top KPI Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter-md">
              <div className="p-gutter-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Total Members</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-[10px] font-bold">Network</span>
                </div>
                <div className="my-2">
                  <span className="font-metric-display text-metric-display text-on-surface tracking-tight font-bold">{stats?.total || 0}</span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Active &amp; Inactive</span>
                  <span className="material-symbols-outlined text-[18px] text-primary">groups</span>
                </div>
              </div>
              <div className="p-gutter-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-l-[4px] border-primary">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Left Leg Members</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-[10px] font-bold">L-Team</span>
                </div>
                <div className="my-2">
                  <span className="font-metric-display text-metric-display text-on-surface tracking-tight font-bold">{stats?.left || 0}</span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Direct &amp; Spillover</span>
                  <span className="material-symbols-outlined text-[18px] text-primary">west</span>
                </div>
              </div>
              <div className="p-gutter-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow border-l-[4px] border-secondary">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Right Leg Members</span>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-secondary font-label-sm text-[10px] font-bold">R-Team</span>
                </div>
                <div className="my-2">
                  <span className="font-metric-display text-metric-display text-on-surface tracking-tight font-bold">{stats?.right || 0}</span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Direct &amp; Spillover</span>
                  <span className="material-symbols-outlined text-[18px] text-secondary">east</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col sm:flex-row gap-gutter-md items-center justify-between border border-surface-container-low">
              <div className="relative w-full sm:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
                <input 
                  type="text" 
                  placeholder="Search by username..." 
                  className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-surface-container rounded-lg font-body-sm text-body-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all text-on-surface"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <span className="material-symbols-outlined text-outline">filter_list</span>
                <select 
                  className="w-full sm:w-48 px-3 py-2 bg-surface-container-low border border-surface-container rounded-lg font-body-sm text-body-sm focus:outline-none focus:border-primary transition-all text-on-surface font-semibold"
                  value={filterPos} 
                  onChange={(e) => setFilterPos(e.target.value)}
                >
                  <option value="ALL">All Positions</option>
                  <option value="L">Left Leg Only</option>
                  <option value="R">Right Leg Only</option>
                </select>
              </div>
            </div>

            {/* Member Grid */}
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <span className="material-symbols-outlined text-primary text-[40px] animate-spin">refresh</span>
              </div>
            ) : filteredTeam.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-gutter-md">
                {filteredTeam.map((m: any, i) => (
                  <div key={i} className="bg-surface-container-lowest rounded-xl p-4 shadow-sm hover:shadow-md transition-all border border-surface-container flex flex-col gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-3xl -z-10 group-hover:scale-110 transition-transform duration-500"></div>
                    <div className="flex items-start justify-between z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white flex items-center justify-center font-headline-md font-bold shadow-sm">
                          {m.username.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-headline-sm text-headline-sm font-bold text-on-surface">@{m.username}</div>
                          <div className="font-label-sm text-[11px] text-outline mt-0.5">Joined {new Date(m.joined_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 mt-auto z-10 pt-2 border-t border-surface-container-low">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[11px] text-outline font-semibold uppercase">Status</span>
                        <span className={`px-2 py-0.5 rounded-full font-label-sm text-[10px] font-bold ${m.has_active_node ? 'bg-[#e8f9ef] text-[#25d366]' : 'bg-surface-container-high text-outline'}`}>
                          {m.has_active_node ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[11px] text-outline font-semibold uppercase">Rank</span>
                        <span className="px-2 py-0.5 rounded-md bg-surface-container text-on-surface font-label-sm text-[10px] font-bold tracking-wider">
                          {m.current_rank || 'BRONZE'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[11px] text-outline font-semibold uppercase">Placement</span>
                        <span className={`px-2 py-0.5 rounded-md font-label-sm text-[10px] font-bold tracking-wider ${m.referred_position === 'L' ? 'bg-primary/10 text-primary' : 'bg-secondary-container/30 text-secondary-container'}`}>
                          {m.referred_position === 'L' ? 'LEFT LEG' : 'RIGHT LEG'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-lowest rounded-xl p-12 flex flex-col items-center justify-center text-center shadow-sm border border-surface-container border-dashed">
                <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-4">
                  <span className="material-symbols-outlined text-[32px]">group_add</span>
                </div>
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface mb-2">No team members found</h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant mb-6 max-w-sm">You haven't added anyone to your network matching this criteria. Share your referral links to start building your team.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => copyLink('L')} className="px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md font-semibold flex items-center gap-1.5 transition-colors border border-surface-container-high">
                    <span className="material-symbols-outlined text-[18px]">west</span> Copy Left Link
                  </button>
                  <button onClick={() => copyLink('R')} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md font-semibold flex items-center gap-1.5 shadow-sm transition-colors">
                    <span className="material-symbols-outlined text-[18px]">east</span> Copy Right Link
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
