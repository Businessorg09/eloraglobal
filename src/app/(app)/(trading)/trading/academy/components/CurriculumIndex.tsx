export function CurriculumIndex() {
  return (
    <div className="flex flex-col gap-4">
      {/* Index Header Panel */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-5 w-full flex flex-col">
        <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Institutional Blueprint</span>
        <h2 className="font-bold text-[18px] text-[#111827] leading-tight flex items-center justify-between">
          Curriculum Index
          <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded text-[10px] font-bold">12 Modules • 74 Lessons</span>
        </h2>
      </div>

      {/* Modules List */}
      <div className="flex flex-col gap-3">
        
        {/* Cleared Module */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#059669] p-4 relative overflow-hidden group cursor-pointer hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#059669]"></div>
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Module 01</span>
              <span className="font-bold text-[13px] text-[#111827] leading-tight mt-0.5">Introduction to Financial Markets</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#9CA3AF] ml-auto group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pl-9 text-[11px] text-[#6B7280] font-medium">
            <span>6/6 Lessons Completed</span>
            <span className="w-1 h-1 rounded-full bg-[#D1D5DB]"></span>
            <span>1h 45m</span>
          </div>
        </div>

        {/* Shortened Cleared Modules to save space (02-07) */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] hover:border-[#059669] p-4 relative overflow-hidden group cursor-pointer transition-colors">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-[#ECFDF5] text-[#059669] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[14px] font-bold">check</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Modules 02 - 07</span>
              <span className="font-bold text-[13px] text-[#111827] leading-tight mt-0.5">Phase 1 Foundation Core</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-[#9CA3AF] ml-auto group-hover:translate-x-1 transition-transform">chevron_right</span>
          </div>
        </div>

        {/* Milestone Banner */}
        <div className="bg-[#111827] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] p-4 text-white flex items-center justify-between border border-[#374151]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8] flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(29,78,216,0.5)]">
              <span className="material-symbols-outlined text-[16px]">emoji_events</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-white/60 uppercase tracking-wider">Milestone Cleared</span>
              <span className="font-bold text-[13px] leading-tight mt-0.5">Phase 1 Foundation Exam</span>
            </div>
          </div>
          <div className="bg-[#059669] px-2 py-1 rounded flex flex-col items-center">
             <span className="text-[8px] font-bold uppercase tracking-wider text-white/80 leading-none">Passed</span>
             <span className="text-[13px] font-bold leading-none mt-0.5">92%</span>
          </div>
        </div>

        {/* Active Module */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border-2 border-[#1D4ED8] p-4 relative overflow-hidden">
          <div className="flex items-start justify-between">
            <div className="flex flex-col">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider">
                <span className="material-symbols-outlined text-[14px]">play_circle</span> Module 08 • IN PROGRESS
              </span>
              <span className="font-bold text-[14px] text-[#111827] leading-tight mt-1 mb-2">Position Sizing & Risk Management</span>
            </div>
            <span className="material-symbols-outlined text-[18px] text-[#1D4ED8]">keyboard_arrow_up</span>
          </div>
          
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#1D4ED8] mb-3">
            <span>3 of 5 Lessons Completed</span>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center text-[12px] text-[#6B7280]">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-[#059669]">check_circle</span> 01: Principles of Capital Exposure</span>
              <span className="font-mono text-[10px]">13:20</span>
            </div>
            <div className="flex justify-between items-center text-[12px] text-[#6B7280]">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px] text-[#059669]">check_circle</span> 02: Structural Stop-Loss Placement</span>
              <span className="font-mono text-[10px]">22:45</span>
            </div>
            <div className="flex justify-between items-center text-[12px] font-bold text-[#1D4ED8] bg-[#DBEAFE] -mx-2 px-2 py-1.5 rounded">
              <span className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#1D4ED8] ml-1"></span> 03: Dynamic Lot Sizing & Pip Value</span>
              <span className="font-mono text-[10px]">24:15</span>
            </div>
            <div className="flex justify-between items-center text-[12px] text-[#9CA3AF]">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span> 04: Risk/Reward Ratios & Expectancy</span>
              <span className="font-mono text-[10px]">19:10</span>
            </div>
            <div className="flex justify-between items-center text-[12px] text-[#9CA3AF]">
              <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[14px]">radio_button_unchecked</span> 05: Drawdown Liquidation Defense</span>
              <span className="font-mono text-[10px]">25:30</span>
            </div>
            
            <div className="mt-2 flex justify-between items-center bg-[#F3F4F6] p-2 rounded text-[11px] font-bold text-[#6B7280] border border-[#E5E7EB]">
              <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">assignment</span> Module 08 Exam (15 MCQs)</span>
              <span className="flex items-center gap-1 bg-white px-1.5 py-0.5 rounded text-[9px] uppercase"><span className="material-symbols-outlined text-[12px]">lock</span> Locked</span>
            </div>
          </div>
        </div>

        {/* Locked Modules */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 relative overflow-hidden flex items-center justify-between opacity-70">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Module 09</span>
            <span className="font-bold text-[13px] text-[#6B7280] leading-tight mt-0.5">Entry, Stop Loss & Take Profit</span>
            <span className="text-[10px] text-[#9CA3AF] mt-1">Unlocks after Module 08 Exam + 6 Lessons</span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#D1D5DB]">lock</span>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 relative overflow-hidden flex items-center justify-between opacity-70">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">Module 10</span>
            <span className="font-bold text-[13px] text-[#6B7280] leading-tight mt-0.5">Trading Psychology & Cognitive Bias</span>
            <span className="text-[10px] text-[#9CA3AF] mt-1">5 Lessons • 2h 15m</span>
          </div>
          <span className="material-symbols-outlined text-[18px] text-[#D1D5DB]">lock</span>
        </div>

      </div>

      {/* Support Banner Bottom */}
      <div className="bg-[#EFF6FF] rounded-[24px] border border-[#DBEAFE] p-4 flex flex-col items-center text-center mt-2">
        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1D4ED8] shadow-[0_4px_20px_rgba(0,0,0,0.03)] mb-2">
          <span className="material-symbols-outlined text-[20px]">support_agent</span>
        </div>
        <h4 className="font-bold text-[13px] text-[#1D4ED8]">Institutional Mentor Desk</h4>
        <p className="text-[11px] text-[#1D4ED8]/80 mt-1 mb-3">
          Stuck on mathematical sizing derivations? Connect directly with an accredited quant supervisor in the Live Room.
        </p>
        <button className="bg-white text-[#1D4ED8] font-bold text-[12px] px-4 py-2 rounded-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#DBEAFE] w-full hover:bg-[#F8FAFC] transition-colors">
          Request Desk Callback
        </button>
      </div>

    </div>
  )
}
