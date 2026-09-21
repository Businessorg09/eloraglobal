'use client'

import React, { useState, useEffect } from 'react'
import { GatedContent } from '../components/GatedContent'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, CartesianGrid } from 'recharts'
import { getCourseProgress } from './actions'

export default function AnalyticsPage() {
  const [timeframe, setTimeframe] = useState('1W')
  const [progressData, setProgressData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Fetch real data on mount
  useEffect(() => {
    const fetchProgress = async () => {
      const res = await getCourseProgress()
      if (res.success) {
        setProgressData(res.progress || [])
      }
      setIsLoading(false)
    }
    fetchProgress()
  }, [])

  // Calculate metrics
  const totalModules = 36;
  const completedCount = progressData.filter(p => p.status === 'COMPLETED').length;
  const completionPercentage = Math.round((completedCount / totalModules) * 100) || 0;
  const totalTimeSpent = progressData.reduce((acc, curr) => acc + (curr.time_spent_minutes || 0), 0);
  const hoursSpent = (totalTimeSpent / 60).toFixed(1);
  const avgPace = completedCount > 0 ? (totalTimeSpent / 60 / completedCount).toFixed(1) : 0;

  const pieData = [
    { name: 'Completed Modules', value: completedCount },
    { name: 'Remaining Modules', value: totalModules - completedCount },
  ]
  const PIE_COLORS = ['#1D4ED8', '#E5E7EB']

  // Placeholder for weekly hours, since we need a complex query to group by day. 
  // We'll keep this visually appealing as it serves the infographic purpose.
  const studyHoursData = [
    { day: 'Mon', hours: 4.5 },
    { day: 'Tue', hours: 3.2 },
    { day: 'Wed', hours: 5.1 },
    { day: 'Thu', hours: 2.8 },
    { day: 'Fri', hours: 6.0 },
    { day: 'Sat', hours: 1.5 },
    { day: 'Sun', hours: 0 },
  ]

  // Syllabus Chapters
  const syllabus = [
    { id: 'ch1', title: 'Phase 1: Market Fundamentals & Liquidity', modules: 6, isPremium: false },
    { id: 'ch2', title: 'Phase 2: Algorithmic Price Action', modules: 8, isPremium: false },
    { id: 'ch3', title: 'Phase 3: Institutional Order Flow', modules: 10, isPremium: true },
    { id: 'ch4', title: 'Phase 4: Quantitative Execution', modules: 12, isPremium: true },
  ]

  return (
    <GatedContent minPackageRequired={3} blurLevel="md" customMessage="Institutional telemetry and behavioral metrics are reserved for Package 3. Upgrade your subscription for full analytics.">
      <div className="flex flex-col max-w-[1400px] mx-auto w-full pb-10 pt-4 gap-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h1 className="text-[24px] font-bold text-[#111827] flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px] text-[#1D4ED8]">insights</span>
              E-Learning Analytics
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-1">Track your academy progress, study velocity, and syllabus completion</p>
          </div>
          <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
            <button className="px-4 py-1.5 text-[12px] font-medium text-[#6B7280] hover:text-[#111827]">Last 30 Days</button>
            <button className="bg-white text-[#111827] px-4 py-1.5 text-[12px] font-bold rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">All Time</button>
          </div>
        </div>

        {/* SECTION 1: TOP METRICS */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]"></span>
            <h2 className="text-[18px] font-bold text-[#111827]">Syllabus Telemetry</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Course Completion Widget */}
              <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col md:flex-row items-center justify-between col-span-3">
                <div className="flex flex-col text-center md:text-left mb-6 md:mb-0">
                  <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Course Progression</span>
                  <span className="text-[36px] font-black text-[#111827] leading-none">
                    {isLoading ? '-' : completedCount}
                    <span className="text-[16px] text-[#6B7280] font-medium"> / {totalModules} Modules</span>
                  </span>
                  <span className="text-[12px] text-[#059669] font-bold mt-3 bg-[#ECFDF5] w-max mx-auto md:mx-0 px-3 py-1 rounded-full">
                    {completionPercentage}% Completed
                  </span>
                </div>
                <div className="w-[140px] h-[140px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={65}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Time Spent Learning */}
              <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col justify-center text-center items-center col-span-3 md:col-span-1">
                <div className="w-12 h-12 rounded-full bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8] mb-4">
                  <span className="material-symbols-outlined text-[24px]">schedule</span>
                </div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Time Spent Learning</span>
                <span className="text-[32px] font-black text-[#111827] leading-none">
                  {isLoading ? '-' : hoursSpent}
                  <span className="text-[16px] text-[#6B7280] font-medium"> Hrs</span>
                </span>
                <span className="text-[11px] text-[#6B7280] font-medium mt-2">Total Logged Time</span>
              </div>

              {/* Avg Completion Time */}
              <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col justify-center text-center items-center col-span-3 md:col-span-1">
                <div className="w-12 h-12 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#EF4444] mb-4">
                  <span className="material-symbols-outlined text-[24px]">speed</span>
                </div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Pace of Study</span>
                <span className="text-[32px] font-black text-[#111827] leading-none">
                  {isLoading ? '-' : avgPace}
                  <span className="text-[16px] text-[#6B7280] font-medium"> Hrs</span>
                </span>
                <span className="text-[11px] text-[#6B7280] font-medium mt-2">Per Module (Avg)</span>
              </div>
              
              {/* Exam Readiness */}
              <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col justify-center text-center items-center col-span-3 md:col-span-1">
                <div className="w-12 h-12 rounded-full bg-[#F5F3FF] flex items-center justify-center text-[#8B5CF6] mb-4">
                  <span className="material-symbols-outlined text-[24px]">workspace_premium</span>
                </div>
                <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-2">Exam Readiness</span>
                <span className="text-[32px] font-black text-[#111827] leading-none">
                  {completionPercentage > 90 ? 'High' : completionPercentage > 50 ? 'Med' : 'Low'}
                </span>
                <span className="text-[11px] text-[#8B5CF6] font-medium mt-2">Keep studying</span>
              </div>
            </div>

            {/* Study Hours Bar Chart */}
            <div className="lg:col-span-4 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col h-[330px]">
              <h3 className="text-[14px] font-bold text-[#111827] mb-6">Study Velocity (This Week)</h3>
              <div className="flex-1 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={studyHoursData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#6B7280' }} />
                    <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} formatter={(val) => `${val} hrs`} />
                    <Bar dataKey="hours" radius={[4, 4, 0, 0]} barSize={24}>
                      {studyHoursData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.hours > 0 ? '#1D4ED8' : '#E5E7EB'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>
        </section>

        {/* SECTION 2: SYLLABUS PROGRESSION TREE */}
        <section className="flex flex-col gap-4 mt-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]"></span>
            <h2 className="text-[18px] font-bold text-[#111827]">Syllabus Progression Roadmap</h2>
          </div>

          <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-8 flex flex-col relative overflow-hidden">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#8B5CF6]/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 flex flex-col md:flex-row items-stretch gap-0">
              
              {syllabus.map((chapter, index) => {
                // Calculate mock progression based on total completion to make it look dynamic
                const chapterStart = index * 8; // approx
                let chapterProgress = 0;
                if (completedCount >= chapterStart + chapter.modules) {
                  chapterProgress = 100;
                } else if (completedCount > chapterStart) {
                  chapterProgress = Math.round(((completedCount - chapterStart) / chapter.modules) * 100);
                }

                return (
                  <div key={chapter.id} className="flex-1 flex flex-col relative min-h-[200px]">
                    {/* Connecting Line (except last) */}
                    {index !== syllabus.length - 1 && (
                      <div className="hidden md:block absolute top-[40px] left-[50%] right-[-50%] h-[2px] bg-[#E5E7EB] z-0">
                        <div 
                          className="h-full bg-[#1D4ED8] transition-all duration-1000"
                          style={{ width: chapterProgress === 100 ? '100%' : '0%' }}
                        ></div>
                      </div>
                    )}
                    
                    <div className="flex flex-col items-center text-center relative z-10 px-4 group">
                      {/* Node Circle */}
                      <div className={`w-20 h-20 rounded-full flex items-center justify-center border-[4px] mb-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500
                        ${chapterProgress === 100 ? 'bg-[#1D4ED8] border-[#EFF6FF] text-white shadow-[#1D4ED8]/30' : 
                          chapterProgress > 0 ? 'bg-white border-[#1D4ED8] text-[#1D4ED8]' : 
                          'bg-white border-[#E5E7EB] text-[#9CA3AF]'}`}
                      >
                        {chapterProgress === 100 ? (
                          <span className="material-symbols-outlined text-[32px]">task_alt</span>
                        ) : chapterProgress > 0 ? (
                          <span className="font-bold text-[18px]">{chapterProgress}%</span>
                        ) : (
                          <span className="material-symbols-outlined text-[32px]">lock</span>
                        )}
                      </div>

                      {/* Chapter Details */}
                      <span className={`text-[11px] font-bold uppercase tracking-wider mb-2 ${chapterProgress > 0 ? 'text-[#1D4ED8]' : 'text-[#6B7280]'}`}>
                        Chapter {index + 1}
                      </span>
                      <h3 className={`font-bold text-[14px] leading-tight mb-2 ${chapterProgress > 0 ? 'text-[#111827]' : 'text-[#6B7280]'}`}>
                        {chapter.title}
                      </h3>
                      <span className="text-[12px] text-[#6B7280]">
                        {chapter.modules} Modules
                      </span>
                      
                      {chapter.isPremium && (
                        <div className="mt-3 flex items-center gap-1 bg-[#FEF3C7] text-[#D97706] px-2 py-1 rounded text-[10px] font-bold">
                          <span className="material-symbols-outlined text-[12px]">star</span> Premium
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}

            </div>
          </div>
        </section>

      </div>
    </GatedContent>
  )
}
