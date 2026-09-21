export function AcademyWidget() {
  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-5 w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0 mb-4">
        <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider leading-tight">Academic Pathway</span>
        <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">In Progress</span>
      </div>

      <div className="flex items-start gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 text-[#1D4ED8]">
          <span className="material-symbols-outlined text-[20px]">menu_book</span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-[14px] text-[#111827] leading-tight">Module 08: Dynamic Risk & Position Sizing</h3>
          <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">Mastering volatility adjustment, ATR-based risk matrices, and portfolio heat.</p>
        </div>
      </div>

      <div className="mt-2 mb-4">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-[11px] font-bold text-[#4B5563]">Curriculum Completion</span>
          <span className="text-[11px] font-bold text-[#1D4ED8]">75% (3/4 Lessons)</span>
        </div>
        <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden">
          <div className="bg-[#1D4ED8] h-full rounded-full" style={{ width: '75%' }}></div>
        </div>
      </div>

      <button className="w-full bg-[#1D4ED8] hover:bg-[#1E40AF] text-white py-3 rounded-lg font-bold text-[13px] flex items-center justify-center gap-2 transition-colors shadow-[0_4px_12px_rgba(11,77,255,0.2)]">
        <span className="material-symbols-outlined text-[18px]">play_circle</span>
        Resume Lesson 4: Portfolio Heat
      </button>
    </div>
  )
}
