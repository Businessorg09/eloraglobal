export function CurriculumHeader() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 w-full flex items-center justify-between">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-[11px] font-bold uppercase tracking-wider text-[#6B7280]">
          <span className="material-symbols-outlined text-[16px]">school</span>
          <span>Curriculum Engine</span>
          <span className="text-[#D1D5DB]">•</span>
          <span>Certified Quant & Risk Protocol</span>
        </div>
        <h1 className="text-[24px] font-bold text-[#111827] leading-tight mb-1">
          Phase 2: Quantitative Risk Engine & Capital Preservation
        </h1>
        <p className="text-[13px] text-[#4B5563] max-w-[800px]">
          Master mathematical exposure controls, cross-asset fractional kelly sizing, and downside liquidation buffers calibrated for 6-figure institutional accounts.
        </p>
      </div>

      <div className="flex items-center gap-6 shrink-0">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-14 flex items-center justify-center">
            {/* Circular Progress SVG */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="4"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#1D4ED8"
                strokeWidth="4"
                strokeDasharray="68, 100"
              />
            </svg>
            <span className="absolute text-[12px] font-bold text-[#1D4ED8]">68%</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[14px] font-bold text-[#111827]">8 of 12 Modules</span>
            <span className="text-[11px] text-[#6B7280] font-medium">Phase 2: 68% Finished</span>
          </div>
        </div>

        <button className="bg-[#1D4ED8] hover:bg-[#1E40AF] transition-colors text-white px-5 py-3 rounded-lg font-bold text-[13px] shadow-sm flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px]">play_arrow</span>
          <div className="flex flex-col text-left leading-none">
            <span className="text-[9px] uppercase tracking-wider text-white/80">Resume</span>
            <span>Lesson 03</span>
          </div>
        </button>
      </div>
    </div>
  )
}
