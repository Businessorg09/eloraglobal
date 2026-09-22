'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import CountUp from 'react-countup'
import Link from 'next/link'

interface Member {
  id: string
  user_id: string
  position: 'Left' | 'Right'
  level: number
  isActive: boolean
  fullName: string
  username: string
  email: string
  referralCode: string
  joinDate: string
  rank: string
  directsCount: number
  leftBv: number
  rightBv: number
}

interface RootNode {
  id: string
  user_id: string
  depth: number
  isActive: boolean
  fullName: string
  username: string
  email: string
  referralCode: string
  rank: string
  leftBv: number
  rightBv: number
}

interface Generation {
  level: number
  members: Member[]
}

export default function NetworkGenerationsPage() {
  const [generations, setGenerations] = useState<Generation[]>([])
  const [rootNode, setRootNode] = useState<RootNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expandedLevels, setExpandedLevels] = useState<number[]>([1])
  
  // Stats
  const [totalActive, setTotalActive] = useState(0)
  const [totalInactive, setTotalInactive] = useState(0)

  useEffect(() => {
    fetchGenerations()
  }, [])

  const fetchGenerations = async () => {
    try {
      const res = await fetch('/api/network/generations')
      const data = await res.json()
      
      if (!res.ok) throw new Error(data.error || 'Failed to fetch network data')
      
      setGenerations(data.generations || [])
      if (data.root) {
        setRootNode(data.root)
      }
      
      let activeCount = 0
      let inactiveCount = 0
      ;(data.generations || []).forEach((gen: Generation) => {
        gen.members.forEach(m => {
          if (m.isActive) activeCount++
          else inactiveCount++
        })
      })
      
      setTotalActive(activeCount)
      setTotalInactive(inactiveCount)
      
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const toggleLevel = (level: number) => {
    setExpandedLevels(prev => 
      prev.includes(level) 
        ? prev.filter(l => l !== level)
        : [...prev, level]
    )
  }

  const formatBv = (bv: number) => {
    return new Intl.NumberFormat('en-IN').format(bv)
  }

  const getRankColor = (rank: string) => {
    switch (rank?.toUpperCase()) {
      case 'BRONZE': return 'bg-[#CD7F32]/10 text-[#CD7F32] border-[#CD7F32]/20'
      case 'SILVER': return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'GOLD': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'PLATINUM': return 'bg-teal-100 text-teal-700 border-teal-200'
      case 'DIAMOND': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'CROWN': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'AMBASSADOR': return 'bg-indigo-100 text-indigo-700 border-indigo-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const totalMembers = generations.reduce((acc, gen) => acc + gen.members.length, 0)

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md pb-gutter-xs">
              <div className="flex flex-col">
                <div className="flex items-center gap-2 text-on-surface-variant font-label-md text-label-md">
                  <Link className="hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-semibold">Network Explorer</span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface mt-1 tracking-tight">Downline Directory</h1>
              </div>
              
              <div className="flex items-center gap-gutter-sm self-start md:self-auto">
                <button onClick={() => fetchGenerations()} className="flex items-center gap-2 px-gutter-md py-2.5 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container-low shadow-sm font-label-md text-label-md transition-all">
                  <span className={`material-symbols-outlined text-[18px] text-primary ${loading ? 'animate-spin' : ''}`}>sync</span>
                  <span>Refresh List</span>
                </button>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl flex items-center gap-3">
                <span className="material-symbols-outlined">error</span>
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* 1. TOP KPI COMMAND BAR (Personal Root Summary) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-gutter-md">
              {/* Card 1: My Total Downline */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-surface-container-lowest/90 backdrop-blur-md p-gutter-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">Total Downline Members</span>
                  <div className="w-8 h-8 rounded-lg bg-primary-container/30 flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">group</span>
                  </div>
                </div>
                <div className="my-3">
                  <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    {loading ? '...' : <CountUp start={0} end={totalMembers} duration={2} />}
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 pt-3 border-t border-surface-container text-outline font-label-sm text-label-sm">
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-primary"></span> {totalActive} Active</div>
                  <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-outline"></span> {totalInactive} Inactive</div>
                </div>
              </motion.div>

              {/* Card 2: My Volumes */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface-container-lowest/90 backdrop-blur-md p-gutter-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">My Total Volume</span>
                  <div className="w-8 h-8 rounded-lg bg-secondary-container/30 flex items-center justify-center text-secondary">
                    <span className="material-symbols-outlined text-[18px]">bar_chart</span>
                  </div>
                </div>
                <div className="my-3">
                  <div className="font-headline-xl text-headline-xl text-on-surface tracking-tight">
                    {loading ? '...' : <CountUp start={0} end={(rootNode?.leftBv || 0) + (rootNode?.rightBv || 0)} duration={2} separator="," />} BV
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-1 pt-3 border-t border-surface-container text-outline font-label-sm text-label-sm">
                  <div className="flex items-center gap-1">L: {formatBv(rootNode?.leftBv || 0)} BV</div>
                  <div className="flex items-center gap-1">R: {formatBv(rootNode?.rightBv || 0)} BV</div>
                </div>
              </motion.div>

              {/* Card 3: Root Identity */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-surface-container-lowest/90 backdrop-blur-md p-gutter-md rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">My Account Identity</span>
                  <div className="w-8 h-8 rounded-lg bg-tertiary-container/30 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">badge</span>
                  </div>
                </div>
                <div className="my-3">
                  <div className="font-headline-md text-headline-md text-on-surface font-bold truncate">
                    {rootNode?.fullName || 'Loading...'}
                  </div>
                  <div className="font-body-sm text-body-sm text-outline">@{rootNode?.username}</div>
                </div>
                <div className="flex items-center justify-between mt-1 pt-3 border-t border-surface-container text-outline font-label-sm text-label-sm">
                  <span>Current Rank:</span>
                  <span className={`px-2 py-0.5 rounded font-bold uppercase ${getRankColor(rootNode?.rank || 'BRONZE')}`}>{rootNode?.rank || 'Bronze'}</span>
                </div>
              </motion.div>
              
              {/* Card 4: Action / Referral Code */}
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-gradient-to-br from-primary via-primary-container to-secondary text-white p-gutter-md rounded-2xl shadow-lg relative overflow-hidden flex flex-col justify-between group">
                <div className="absolute -right-4 -bottom-4 w-28 h-28 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-white/80">Referral Code</span>
                  <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">share</span>
                </div>
                <div className="my-3">
                  <div className="font-headline-xl text-headline-xl font-bold tracking-tight text-white mb-1">
                    {rootNode?.referralCode || 'N/A'}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-primary-container flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${rootNode?.isActive ? 'bg-emerald-400' : 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]'}`}></span> 
                    {rootNode?.isActive ? 'Account Active' : 'Account Inactive'}
                  </div>
                </div>
                <div className="pt-1">
                  <button onClick={() => {navigator.clipboard.writeText(`${window.location.origin}/register?ref=${rootNode?.referralCode}`); alert('Copied referral link!')}} className="w-full py-1.5 px-3 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur-md text-white font-label-sm text-label-sm flex items-center justify-center gap-1.5 transition-all">
                    <span>Copy Link</span>
                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                  </button>
                </div>
              </motion.div>
            </div>

            {/* Generations List */}
            <div className="space-y-4 pt-2">
              {loading ? (
                <div className="py-20 flex justify-center items-center">
                   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
              ) : generations.length === 0 ? (
                <div className="text-center py-16 bg-surface-container-lowest rounded-3xl border border-surface-container shadow-sm">
                  <div className="w-20 h-20 mx-auto bg-surface-container-low rounded-full flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-4xl text-outline">group_off</span>
                  </div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface">No Members Found</h3>
                  <p className="text-on-surface-variant font-body-md text-body-md mt-1">Your downline network is currently empty.</p>
                </div>
              ) : (
                generations.map((gen) => {
                  const isExpanded = expandedLevels.includes(gen.level)
                  return (
                    <div key={gen.level} className="bg-surface-container-lowest rounded-2xl border border-surface-container shadow-sm overflow-hidden transition-all duration-200">
                      {/* Accordion Header */}
                      <button
                        onClick={() => toggleLevel(gen.level)}
                        className="w-full px-gutter-lg py-4 flex items-center justify-between hover:bg-surface-container-low transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors ${
                            isExpanded ? 'bg-primary text-white' : 'bg-surface-container text-outline'
                          }`}>
                            {gen.level}
                          </div>
                          <div className="text-left">
                            <h3 className="font-headline-md text-headline-md text-on-surface">Generation {gen.level}</h3>
                            <p className="font-body-sm text-body-sm text-outline mt-0.5">{gen.members.length} {gen.members.length === 1 ? 'Member' : 'Members'} in this level</p>
                          </div>
                        </div>
                        <div className={`w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>
                          <span className="material-symbols-outlined">expand_more</span>
                        </div>
                      </button>

                      {/* Accordion Body */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                          >
                            <div className="px-gutter-lg pb-6 pt-2 border-t border-surface-container overflow-x-auto">
                              
                              <table className="w-full text-left border-collapse min-w-[900px]">
                                <thead>
                                  <tr className="border-b border-surface-container">
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">Member</th>
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-center">Status</th>
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-center">Position</th>
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-center">Rank</th>
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-right">Left BV</th>
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-right">Right BV</th>
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-center">Referral Code</th>
                                    <th className="py-3 font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold text-right">Join Date</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {gen.members.map((member) => (
                                    <tr key={member.id} className="border-b border-surface-container-low hover:bg-surface-container-lowest transition-colors group">
                                      <td className="py-3">
                                        <div className="flex items-center gap-3">
                                          <div className="w-9 h-9 rounded-full bg-primary-container text-primary flex items-center justify-center font-bold text-sm">
                                            {member.fullName.charAt(0)}
                                          </div>
                                          <div>
                                            <div className="font-label-md text-label-md text-on-surface font-bold group-hover:text-primary transition-colors">{member.fullName}</div>
                                            <div className="font-body-sm text-body-sm text-outline">@{member.username}</div>
                                          </div>
                                        </div>
                                      </td>
                                      
                                      <td className="py-3 text-center">
                                        {member.isActive ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 border border-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 border border-slate-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span> Inactive
                                          </span>
                                        )}
                                      </td>

                                      <td className="py-3 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                          member.position === 'Left' ? 'bg-primary-fixed/20 text-primary border-primary/30' : 'bg-secondary-fixed/20 text-secondary border-secondary/30'
                                        }`}>
                                          {member.position} Leg
                                        </span>
                                      </td>

                                      <td className="py-3 text-center">
                                        <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getRankColor(member.rank)}`}>
                                          {member.rank}
                                        </span>
                                      </td>

                                      <td className="py-3 text-right">
                                        <div className="font-label-md text-label-md text-on-surface">{formatBv(member.leftBv)}</div>
                                      </td>

                                      <td className="py-3 text-right">
                                        <div className="font-label-md text-label-md text-on-surface">{formatBv(member.rightBv)}</div>
                                      </td>

                                      <td className="py-3 text-center">
                                        <span className="font-mono text-xs font-semibold text-outline bg-surface-container px-2 py-1 rounded">
                                          {member.referralCode}
                                        </span>
                                      </td>

                                      <td className="py-3 text-right">
                                        <div className="font-body-sm text-body-sm text-outline">
                                          {member.joinDate ? new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(member.joinDate)) : 'N/A'}
                                        </div>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )
                })
              )}
            </div>

          </div>
        </main>
      </div>
    </div>
  )
}
