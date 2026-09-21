'use client'

import { ProfilePathwayWidget } from './components/v2/ProfilePathwayWidget'
import { CommandCenterWidget } from './components/v2/CommandCenterWidget'
import { NetworkSchedulingWidget } from './components/v2/NetworkSchedulingWidget'
import { ReferenceLibraryWidget } from './components/v2/ReferenceLibraryWidget'

export default function NewTradingDashboardPage() {
  return (
    <div className="max-w-[1600px] mx-auto w-full pb-10 pt-4">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 items-start">
        
        {/* Top Banner / Breadcrumbs */}
        <div className="order-2 xl:order-1 xl:col-span-12 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-4 md:p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#EFF6FF] rounded-lg flex items-center justify-center text-[#1D4ED8]">
              <span className="material-symbols-outlined text-[24px]">school</span>
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg md:text-[22px] font-extrabold tracking-tight text-[#111827] leading-tight flex flex-wrap items-center gap-2 md:gap-3">
                Executive Modular Learning Command Center
                <span className="bg-[#E5E7EB] text-[#4B5563] px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase">Cockpit V2.4</span>
              </h1>
              <p className="text-[13px] text-[#6B7280]">Proprietary institutional syllabus, algorithmic execution telemetry, and verified certification pathway</p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 mt-2 lg:mt-0">
            <button className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#4B5563] hover:text-[#111827] px-4 py-2.5 rounded-[24px] text-[13px] font-bold transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <span className="material-symbols-outlined text-[18px]">tune</span> Curriculum Filter
            </button>
            <a href="#command-center" className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-5 py-2.5 rounded-[24px] text-[13px] font-bold transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <span className="material-symbols-outlined text-[18px]">play_arrow</span> Jump to Active Class
            </a>
          </div>
        </div>

        {/* Profile (Left Column) */}
        <div className="order-1 xl:order-2 xl:col-span-3">
          <ProfilePathwayWidget />
        </div>

        {/* Command Center (Middle Column) */}
        <div className="order-3 xl:col-span-6">
          <CommandCenterWidget />
        </div>

        {/* Network & Scheduling (Right Column) */}
        <div className="order-4 xl:col-span-3">
          <NetworkSchedulingWidget />
        </div>

        {/* Reference Library (Bottom Row) */}
        <div className="order-5 xl:col-span-12 mt-2">
          <ReferenceLibraryWidget />
        </div>

      </div>
    </div>
  )
}
