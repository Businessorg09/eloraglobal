'use client'

import { useState } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'

export default function BinaryCalculatorPage() {
  const { profile, rank: globalRank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [selectedRank, setSelectedRank] = useState<string>(globalRank?.displayName || "SILVER")

  const [leftVolume, setLeftVolume] = useState<number>((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.leftBvCarryover || 0))
  const [rightVolume, setRightVolume] = useState<number>((treeStats?.volumes?.rightBv || 0) + (treeStats?.volumes?.rightBvCarryover || 0))
    
  const ranks = [
    { id: 'BRONZE', label: 'Bronze', cap: 150000, color: 'text-[#cd7f32] bg-[#cd7f32]/10' },
    { id: 'SILVER', label: 'Silver', cap: 250000, color: 'text-[#c0c0c0] bg-[#c0c0c0]/10' },
    { id: 'GOLD', label: 'Gold', cap: 500000, color: 'text-[#ffd700] bg-[#ffd700]/10' },
    { id: 'DIAMOND', label: 'Diamond', cap: 1000000, color: 'text-primary bg-primary/10' },
  ]

  const activeRank = ranks.find(r => r.id === selectedRank) || ranks[1]

  const matchedVolume = Math.min(leftVolume, rightVolume)
  
  const matchedPairs = Math.floor(matchedVolume / 100)
  
  // ₹800 per 100 BV pair
  const calculatedIncome = matchedPairs * 800
  const actualIncome = Math.min(calculatedIncome, activeRank.cap)
  const flushedIncome = calculatedIncome > activeRank.cap ? calculatedIncome - activeRank.cap : 0

  // The actual BV consumed is proportional to the actual Income paid out
  const bvConsumed = Math.floor((actualIncome / 800) * 100)
  const carryForwardLeft = Math.max(0, leftVolume - bvConsumed)
  const carryForwardRight = Math.max(0, rightVolume - bvConsumed)
  
  // Milestone Bonus mapping based on business rules
  let milestoneBonus = 0
  let nextMilestone = "1st Match (₹200)"
  if (matchedPairs >= 100) { milestoneBonus = 100000; nextMilestone = "Max Reached"; }
  else if (matchedPairs >= 50) { milestoneBonus = 60000; nextMilestone = "100th Match (₹100k)"; }
  else if (matchedPairs >= 20) { milestoneBonus = 25000; nextMilestone = "50th Match (₹60k)"; }
  else if (matchedPairs >= 10) { milestoneBonus = 12000; nextMilestone = "20th Match (₹25k)"; }
  else if (matchedPairs >= 5) { milestoneBonus = 1000; nextMilestone = "10th Match (₹12k)"; }
  else if (matchedPairs >= 1) { milestoneBonus = 200; nextMilestone = "5th Match (₹1k)"; }

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg max-w-5xl mx-auto">
            
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }}>
              <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline tracking-wider uppercase mb-1">
                <Link href="/dashboard/business" className="hover:text-primary transition-colors">Business</Link>
                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                <span className="text-primary font-semibold">Binary Calculator</span>
              </div>
              <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Projected Binary Calculator</h1>
              <p className="font-body-sm text-body-sm text-on-surface-variant max-w-2xl mt-0.5">
                Simulate your binary matching income based on leg volumes and your current rank cap.
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
              
              {/* Controls Column */}
              <div className="lg:col-span-5 space-y-6">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30 space-y-6">
                  
                  {/* Rank Selector */}
                  <div>
                    <label className="block font-label-md text-label-md text-on-surface font-semibold mb-3">Select Active Rank</label>
                    <div className="grid grid-cols-2 gap-2">
                      {ranks.map((r) => (
                        <button
                          key={r.id}
                          onClick={() => setSelectedRank(r.id)}
                          className={`p-2.5 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${selectedRank === r.id ? 'border-primary bg-primary/5' : 'border-surface-container hover:border-outline-variant/50'}`}
                          type="button"
                        >
                          <span className={`font-label-md font-bold ${r.color} px-2 py-0.5 rounded-full`}>{r.label}</span>
                          <span className="font-label-sm text-[10px] text-outline">Cap: ₹{(r.cap / 1000).toFixed(0)}k</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Volume Inputs */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-semibold">Left Leg Volume (BV)</label>
                        <span className="font-label-sm text-primary font-bold">{leftVolume.toLocaleString()} BV</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100000" 
                        step="100" 
                        value={leftVolume} 
                        onChange={(e) => setLeftVolume(Number(e.target.value))}
                        className="w-full accent-primary"
                      />
                      <input 
                        type="number"
                        value={leftVolume}
                        onChange={(e) => setLeftVolume(Number(e.target.value))}
                        className="w-full mt-2 p-2 bg-surface-container-low rounded-lg font-mono text-sm border-none focus:ring-1 focus:ring-primary outline-none"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-semibold">Right Leg Volume (BV)</label>
                        <span className="font-label-sm text-secondary font-bold">{rightVolume.toLocaleString()} BV</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100000" 
                        step="100" 
                        value={rightVolume} 
                        onChange={(e) => setRightVolume(Number(e.target.value))}
                        className="w-full accent-secondary"
                      />
                      <input 
                        type="number"
                        value={rightVolume}
                        onChange={(e) => setRightVolume(Number(e.target.value))}
                        className="w-full mt-2 p-2 bg-surface-container-low rounded-lg font-mono text-sm border-none focus:ring-1 focus:ring-secondary outline-none"
                      />
                    </div>
                  </div>

                </motion.div>
              </div>

              {/* Output Column */}
              <div className="lg:col-span-7 space-y-6">
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-primary text-white rounded-2xl p-8 shadow-lg relative overflow-hidden">
                  <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
                  
                  <div className="relative z-10 text-center mb-6">
                    <h2 className="font-label-lg text-label-lg text-primary-container uppercase tracking-wider mb-2 font-bold">Total Projected Income</h2>
                    <div className="font-metric-display text-[64px] font-bold leading-none tracking-tight">
                      ₹<CountUp end={actualIncome + milestoneBonus} duration={1} separator="," />
                    </div>
                    {flushedIncome > 0 && (
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-error/20 text-error-container px-3 py-1 rounded-full font-label-sm text-sm font-semibold">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        ₹{flushedIncome.toLocaleString()} Capping Flush Out
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 relative z-10">
                    <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm relative">
                      <div className="absolute top-2 right-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Base</div>
                      <div className="font-label-sm text-primary-container mb-1">Binary Match (₹800/pair)</div>
                      <div className="font-headline-md text-headline-md font-bold">₹{actualIncome.toLocaleString()}</div>
                      <div className="text-[11px] text-white/60 mt-0.5">{matchedPairs} pairs matched</div>
                    </div>
                    <div className="bg-black/20 p-4 rounded-xl backdrop-blur-sm relative">
                      <div className="absolute top-2 right-2 text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-bold">Bonus</div>
                      <div className="font-label-sm text-primary-container mb-1">Matching Milestone Bonus</div>
                      <div className="font-headline-md text-headline-md font-bold text-tertiary-container">₹{milestoneBonus.toLocaleString()}</div>
                      <div className="text-[11px] text-white/60 mt-0.5">Next up: {nextMilestone}</div>
                    </div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface-container-lowest rounded-2xl p-6 shadow-sm border border-outline-variant/30">
                  <h3 className="font-headline-md text-headline-md text-on-surface font-bold mb-4">Carry Forward Summary</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-primary">
                      <div className="font-label-sm text-outline mb-1">Left Leg Carry Forward</div>
                      <div className="font-headline-sm font-bold text-on-surface">{carryForwardLeft.toLocaleString()} BV</div>
                    </div>
                    <div className="p-4 rounded-xl bg-surface-container-low border-l-4 border-secondary">
                      <div className="font-label-sm text-outline mb-1">Right Leg Carry Forward</div>
                      <div className="font-headline-sm font-bold text-on-surface">{carryForwardRight.toLocaleString()} BV</div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-start gap-2 p-3 bg-tertiary-container/20 rounded-lg text-tertiary">
                    <span className="material-symbols-outlined text-[20px]">info</span>
                    <p className="font-body-sm text-[12px] leading-tight font-semibold">
                      Note: BV equivalent to flushed income is preserved in your carry forward balance.
                    </p>
                  </div>
                </motion.div>
              </div>

            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
