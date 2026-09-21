'use client'

import { ActiveExamWidget } from './components/ActiveExamWidget'
import { ExamHistoryWidget } from './components/ExamHistoryWidget'

export default function ExamCenterPage() {
  return (
    <div className="flex flex-col max-w-[1400px] mx-auto w-full pb-10 pt-4">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-8">
        <div className="flex flex-col">
          <h1 className="text-[20px] md:text-[24px] font-bold text-[#111827] flex items-center gap-2">
            <span className="material-symbols-outlined text-[24px] md:text-[28px] text-[#1D4ED8]">assignment</span>
            Certification & Exam Center
          </h1>
          <p className="text-[13px] text-[#6B7280] mt-1">Accredited institutional evaluations to unlock advanced capital tiers</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Overall Standing</span>
            <span className="text-[14px] font-bold text-[#059669]">Top 8% Distinction</span>
          </div>
          <div className="w-10 h-10 rounded-full bg-[#ECFDF5] flex items-center justify-center text-[#059669] border border-[#D1FAE5]">
            <span className="material-symbols-outlined">workspace_premium</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-4 md:p-8 items-start">
        
        {/* Left Column (8) */}
        <div className="xl:col-span-8 flex flex-col">
          <ActiveExamWidget />
        </div>

        {/* Right Column (4) */}
        <div className="xl:col-span-4 sticky top-4 md:p-6">
          <ExamHistoryWidget />
        </div>

      </div>
    </div>
  )
}
