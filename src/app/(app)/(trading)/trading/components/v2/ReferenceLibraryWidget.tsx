export function ReferenceLibraryWidget() {
  return (
    <div className="flex flex-col mt-4 border-t border-[#E5E7EB] pt-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <div className="flex flex-col">
          <h2 className="text-[18px] font-bold text-[#111827]">Institutional Reference Library & Toolkit Downloads</h2>
          <p className="text-[12px] text-[#6B7280]">Certified execution playbooks, risk algorithms, and quantitative study resources</p>
        </div>
        <button className="text-[#1D4ED8] font-bold text-[12px] flex items-center gap-1 hover:text-[#1E40AF] transition-colors">
          Browse Complete Vault (120+ Docs) <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* Card 1 */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] p-4 flex items-center gap-3 cursor-not-allowed group">
          <div className="w-12 h-12 rounded-lg bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] shrink-0">
            <span className="material-symbols-outlined text-[20px] md:text-[24px]">menu_book</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-[13px] text-[#9CA3AF] leading-tight">No Resources</h4>
            <span className="text-[11px] text-[#D1D5DB] mt-0.5">Empty slot</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] p-4 flex items-center gap-3 cursor-not-allowed group">
          <div className="w-12 h-12 rounded-lg bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] shrink-0">
            <span className="material-symbols-outlined text-[20px] md:text-[24px]">code</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-[13px] text-[#9CA3AF] leading-tight">No Resources</h4>
            <span className="text-[11px] text-[#D1D5DB] mt-0.5">Empty slot</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] p-4 flex items-center gap-3 cursor-not-allowed group">
          <div className="w-12 h-12 rounded-lg bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] shrink-0">
            <span className="material-symbols-outlined text-[20px] md:text-[24px]">calculate</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-[13px] text-[#9CA3AF] leading-tight">No Resources</h4>
            <span className="text-[11px] text-[#D1D5DB] mt-0.5">Empty slot</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] p-4 flex items-center gap-3 cursor-not-allowed group">
          <div className="w-12 h-12 rounded-lg bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] shrink-0">
            <span className="material-symbols-outlined text-[20px] md:text-[24px]">psychology</span>
          </div>
          <div className="flex flex-col">
            <h4 className="font-bold text-[13px] text-[#9CA3AF] leading-tight">No Resources</h4>
            <span className="text-[11px] text-[#D1D5DB] mt-0.5">Empty slot</span>
          </div>
        </div>

      </div>
    </div>
  )
}
