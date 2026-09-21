export function RiskRewardMatrix() {
  const outcomes = [
    { rr: '1:1', winRateNeeded: '50%', label: 'Breakeven Point' },
    { rr: '1:1.5', winRateNeeded: '40%', label: 'Low Edge' },
    { rr: '1:2', winRateNeeded: '33%', label: 'Standard R:R' },
    { rr: '1:3', winRateNeeded: '25%', label: 'High Edge' },
    { rr: '1:5', winRateNeeded: '16.6%', label: 'Trend Capture' },
  ]

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] flex items-center justify-center text-[#059669]">
          <span className="material-symbols-outlined text-[20px]">table_chart</span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-[16px] font-bold text-[#111827] leading-tight">Risk / Reward Expectancy Matrix</h2>
          <span className="text-[11px] text-[#6B7280]">Mathematical win rate requirements to remain profitable</span>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2 px-3 pb-2 border-b border-[#F3F4F6] text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">
          <div>R:R Ratio</div>
          <div className="text-center">Win Rate Req.</div>
          <div className="text-right">Profile</div>
        </div>
        
        {outcomes.map((row, idx) => (
          <div key={idx} className={`grid grid-cols-3 gap-2 px-3 py-3 rounded-lg items-center ${idx === 2 ? 'bg-[#EFF6FF] border border-[#DBEAFE]' : 'hover:bg-[#F8FAFC]'}`}>
            <div className={`font-bold text-[14px] ${idx === 2 ? 'text-[#1D4ED8]' : 'text-[#111827]'}`}>
              {row.rr}
            </div>
            <div className="text-center">
              <span className={`text-[13px] font-bold ${idx === 2 ? 'text-[#1D4ED8]' : 'text-[#059669]'}`}>{row.winRateNeeded}</span>
            </div>
            <div className="text-right">
              <span className={`text-[10px] font-bold uppercase tracking-wider ${idx === 2 ? 'text-[#1D4ED8]' : 'text-[#6B7280]'}`}>{row.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6 border-t border-[#E5E7EB]">
        <div className="bg-[#111827] rounded-[24px] p-5 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <span className="material-symbols-outlined text-[60px]">casino</span>
          </div>
          <h4 className="font-bold text-[13px] text-white/90 mb-1">Expectancy Formula (E)</h4>
          <p className="text-[16px] font-bold font-serif italic text-white mb-2">
            E = (Win% × Avg Win) - (Loss% × Avg Loss)
          </p>
          <p className="text-[10px] text-white/60 leading-relaxed">
            A trading system is mathematically sound only if E {'>'} 0. Never take setups below a 1:1 ratio.
          </p>
        </div>
      </div>
    </div>
  )
}
