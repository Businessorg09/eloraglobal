'use client'

import { ProfilePathwayWidget } from './components/v2/ProfilePathwayWidget'
import { CommandCenterWidget } from './components/v2/CommandCenterWidget'
import { NetworkSchedulingWidget } from './components/v2/NetworkSchedulingWidget'
import { ReferenceLibraryWidget } from './components/v2/ReferenceLibraryWidget'

export default function NewTradingDashboardPage() {
  return (
    <div className="flex flex-col max-w-[1600px] mx-auto w-full pb-10 pt-4">
      
      {/* Top Banner / Breadcrumbs */}
      <div className="flex items-center justify-between mb-8 bg-white p-4 rounded-xl shadow-sm border border-[#E5E7EB]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center text-[#1D4ED8]">
            <span className="material-symbols-outlined text-[24px]">school</span>
          </div>
          <div className="flex flex-col">
            <h1 className="text-[20px] font-bold text-[#111827] flex items-center gap-3">
              Executive Modular Learning Command Center
              <span className="bg-[#E5E7EB] text-[#4B5563] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Cockpit V2.4</span>
            </h1>
            <p className="text-[13px] text-[#6B7280]">Proprietary institutional syllabus, algorithmic execution telemetry, and verified certification pathway</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] px-4 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">tune</span> Curriculum Filter
          </button>
          <a href="#command-center" className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-5 py-2.5 rounded-lg text-[13px] font-bold transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">play_arrow</span> Jump to Active Class
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* Left Column (3) */}
        <div className="xl:col-span-3">
          <ProfilePathwayWidget />
        </div>

        {/* Middle Column (6) */}
        <div className="xl:col-span-6">
          <CommandCenterWidget />
        </div>

        {/* Right Column (3) */}
        <div className="xl:col-span-3">
          <NetworkSchedulingWidget />
        </div>

      </div>

      {/* Bottom Row */}
      <ReferenceLibraryWidget />

    </div>
  )
}
