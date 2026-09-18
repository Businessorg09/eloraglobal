'use client'

import React from 'react'

export function TimezoneOverlapMatrix() {
  return (
    <div className="bg-[#ffffff] border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden flex flex-col h-full md:col-span-2">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">public</span>
          <h2 className="text-[14px] font-bold text-[#111827]">Global Liquidity Session Overlaps (GMT)</h2>
        </div>
        <div className="bg-[#EFF6FF] text-[#1D4ED8] px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-[#BFDBFE]">
          Live: New York Session
        </div>
      </div>

      <div className="p-6 flex flex-col gap-6">
        <p className="text-[12px] text-[#6B7280]">Visualize major institutional market hours. The highest volume and liquidity typically occur during session overlaps.</p>
        
        <div className="w-full relative h-[180px] bg-[#F8FAFC] rounded-xl border border-[#E5E7EB] p-4 flex flex-col justify-between">
          
          {/* Time axis header */}
          <div className="flex items-center justify-between text-[10px] font-bold text-[#9CA3AF] px-1 border-b border-[#E5E7EB] pb-2 mb-2 relative z-10">
            <span>00:00</span>
            <span>04:00</span>
            <span>08:00</span>
            <span>12:00</span>
            <span>16:00</span>
            <span>20:00</span>
            <span>24:00</span>
          </div>

          <div className="relative flex-1 w-full">
            {/* Grid lines */}
            <div className="absolute inset-0 flex justify-between pointer-events-none">
              {[...Array(7)].map((_, i) => (
                <div key={i} className="w-px h-full bg-[#E5E7EB]"></div>
              ))}
            </div>

            {/* Asian Session (00:00 - 09:00) */}
            <div className="absolute top-2 left-[0%] w-[37.5%] h-8 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] border border-[#FCD34D] rounded-md flex items-center px-3 shadow-sm group">
              <span className="text-[11px] font-bold text-[#D97706]">Tokyo / Sydney</span>
              <div className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded">00:00 - 09:00 GMT</div>
            </div>

            {/* London Session (08:00 - 16:00) */}
            <div className="absolute top-12 left-[33.3%] w-[33.3%] h-8 bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] border border-[#A5B4FC] rounded-md flex items-center px-3 shadow-sm group z-20">
              <span className="text-[11px] font-bold text-[#4338CA]">London (LSE)</span>
              <div className="absolute hidden group-hover:block -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded">08:00 - 16:00 GMT</div>
            </div>

            {/* NY Session (13:00 - 22:00) */}
            <div className="absolute top-22 left-[54.1%] w-[37.5%] h-8 bg-gradient-to-r from-[#ECFDF5] to-[#D1FAE5] border border-[#6EE7B7] rounded-md flex items-center px-3 shadow-sm group z-10" style={{ top: '88px' }}>
              <span className="text-[11px] font-bold text-[#047857]">New York (NYSE)</span>
              <div className="absolute hidden group-hover:block -bottom-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-[10px] px-2 py-1 rounded">13:00 - 22:00 GMT</div>
            </div>

            {/* Overlap Highlights */}
            {/* London / NY Overlap (13:00 - 16:00) */}
            <div className="absolute top-12 left-[54.1%] w-[12.5%] h-8 bg-[#818CF8] opacity-30 rounded-md border-2 border-[#4338CA] animate-pulse pointer-events-none"></div>
          </div>
          
        </div>

        <div className="flex items-center gap-4 text-[11px] font-medium text-[#4B5563]">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#FDE68A] border border-[#FCD34D] rounded-sm"></div> Asian Range Consolidation</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#C7D2FE] border border-[#A5B4FC] rounded-sm"></div> London Breakout / Manipulation</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-[#D1FAE5] border border-[#6EE7B7] rounded-sm"></div> NY Continuation / Reversal</div>
        </div>

      </div>
    </div>
  )
}
