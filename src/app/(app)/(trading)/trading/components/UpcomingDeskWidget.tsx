export function UpcomingDeskWidget() {
  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-5 w-full flex flex-col">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-0 mb-4">
        <span className="flex items-center gap-2 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider leading-tight">
          <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span> Upcoming Desk Session
        </span>
        <span className="text-[11px] font-medium text-[#6B7280]">Today 19:00 EST</span>
      </div>

      <div className="flex items-start gap-3 mb-4 bg-[#F8F9FA] p-3 rounded-lg border border-[#F3F4F6]">
        <div className="w-10 h-10 rounded-lg bg-[#DBEAFE] flex items-center justify-center flex-shrink-0 text-[#1D4ED8]">
          <span className="material-symbols-outlined text-[20px]">sensors</span>
        </div>
        <div className="flex flex-col">
          <h3 className="font-bold text-[14px] text-[#111827] leading-tight">Tuesday Live Market Prep</h3>
          <p className="text-[11px] text-[#6B7280] mt-1 leading-relaxed">Hosted by Lead Macro Strategist Marcus Vance. Focus on FOMC minutes and FX liquidity.</p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto">
        <div className="flex flex-col">
          <span className="text-[9px] font-bold text-[#9CA3AF] uppercase tracking-wider mb-0.5">STARTS IN</span>
          <span className="font-mono text-[14px] font-bold text-[#111827]">01h : 42m : 18s</span>
        </div>
        <button className="bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-4 py-2 rounded-lg font-bold text-[12px] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
          Join Desk
        </button>
      </div>
    </div>
  )
}
