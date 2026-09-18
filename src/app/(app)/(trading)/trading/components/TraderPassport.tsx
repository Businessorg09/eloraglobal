export function TraderPassport() {
  const metrics = [
    { label: 'Risk Containment', score: 94, total: 100 },
    { label: 'Strategy Consistency', score: 88, total: 100 },
    { label: 'Drawdown Recovery', score: 96, total: 100 },
  ]

  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-5 w-full flex flex-col h-full">
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1D4ED8]">badge</span>
          <h2 className="font-bold text-[14px] text-[#111827] leading-tight">Trader Passport<br/>Diagnostic</h2>
        </div>
        <div className="bg-[#DBEAFE] text-[#1D4ED8] w-8 h-8 rounded flex items-center justify-center flex-col shadow-sm">
          <span className="text-[7px] font-bold tracking-widest uppercase">Tier</span>
          <span className="text-[12px] font-black leading-none mt-0.5">A</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        {metrics.map((metric, idx) => (
          <div key={idx} className="flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[11px] font-bold text-[#111827]">
              <span>{metric.label}</span>
              <span>{metric.score} <span className="text-[#9CA3AF] font-normal">/ {metric.total}</span></span>
            </div>
            <div className="w-full bg-[#F3F4F6] h-1 rounded-full overflow-hidden">
              <div className="bg-[#1D4ED8] h-full rounded-full" style={{ width: `${(metric.score / metric.total) * 100}%` }}></div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto bg-[#EFF6FF] rounded-xl p-4 border border-[#D0DFFF]">
        <div className="flex items-center gap-2 mb-2">
          <span className="material-symbols-outlined text-[16px] text-[#1D4ED8]">smart_toy</span>
          <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider">AI Copilot Feedback</span>
        </div>
        <p className="text-[12px] text-[#1D4ED8] italic leading-relaxed font-medium">
          "Alex displays exemplary trade selection during London crossover. Recommended tweak: consider trimming 25% exposure ahead of high-impact CPI releases."
        </p>
      </div>
    </div>
  )
}
