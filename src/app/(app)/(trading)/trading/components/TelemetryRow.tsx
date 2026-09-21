export function TelemetryRow() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
      
      {/* 1. Pathway Allocation */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider leading-tight w-20">Pathway Allocation</span>
          <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Elite Tier</span>
        </div>
        <div>
          <div className="text-[28px] font-bold text-[#111827] leading-none">$100,000</div>
          <div className="flex justify-between mt-3 text-[13px]">
            <span className="text-[#4B5563]">Profit Target:</span>
            <span className="font-bold text-[#059669]">$8,240</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9CA3AF]">$10,000</span>
            <span className="font-bold text-[#059669]">(82.4%)</span>
          </div>
        </div>
        <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full mt-3 overflow-hidden">
          <div className="bg-[#059669] h-full rounded-full" style={{ width: '82.4%' }}></div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F3F4F6]">
          <span className="flex items-center gap-1 text-[11px] font-bold text-[#059669]">
            <span className="material-symbols-outlined text-[14px]">verified_user</span> Safe Orbit
          </span>
          <span className="text-[11px] text-[#6B7280]">Target: +10.0%</span>
        </div>
      </div>

      {/* 2. Account Net Equity */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider leading-tight w-20">Account Net Equity</span>
          <span className="bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded text-[11px] font-bold tracking-wider flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">trending_up</span> +1.12%
          </span>
        </div>
        <div>
          <div className="text-[28px] font-bold text-[#111827] leading-none">$108,240.50</div>
          <div className="flex justify-between mt-3 text-[13px]">
            <span className="text-[#4B5563]">Base Capital:</span>
            <span className="font-bold text-[#059669]">+$1,210.00</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9CA3AF]">$100,000</span>
            <span className="font-bold text-[#059669]">Today</span>
          </div>
        </div>
        <div className="flex flex-col mt-3 pt-3 border-t border-[#F3F4F6] gap-1">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[#6B7280]">Unrealized P&L:</span>
            <span className="text-[11px] font-bold text-[#059669]">+$430.00 <span className="font-normal text-[#9CA3AF]">(EURUSD Long)</span></span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-[#6B7280]">Margin Available:</span>
            <span className="text-[11px] font-bold text-[#111827]">$94,220.00</span>
          </div>
        </div>
      </div>

      {/* 3. Risk & Drawdown Sentry */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider leading-tight w-20">Risk & Drawdown Sentry</span>
          <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">100% Intact</span>
        </div>
        <div>
          <div className="text-[28px] font-bold text-[#111827] leading-none">-$1,420.00</div>
          <div className="flex justify-between mt-3 text-[13px]">
            <span className="text-[#4B5563]">Max Allowed:</span>
            <span className="font-bold text-[#059669]">85.8%</span>
          </div>
          <div className="flex justify-between text-[13px]">
            <span className="text-[#9CA3AF]">-$10,000</span>
            <span className="font-bold text-[#059669]">Buffer</span>
          </div>
        </div>
        <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full mt-3 overflow-hidden flex">
          <div className="bg-[#1D4ED8] h-full" style={{ width: '14.2%' }}></div>
          <div className="bg-[#E5E7EB] h-full flex-1"></div>
        </div>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-[#F3F4F6]">
          <span className="text-[11px] text-[#6B7280]">Daily Loss:<br/>$0.00 / -$5k</span>
          <span className="text-[11px] font-bold text-[#1D4ED8] text-right">Risk Limit:<br/>Safe</span>
        </div>
      </div>

      {/* 4. Execution Quality */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-5 flex flex-col justify-between">
        <div className="flex justify-between items-start mb-4">
          <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider leading-tight w-20">Execution Quality</span>
          <span className="bg-[#ECFDF5] text-[#059669] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">Exceptional</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-[28px] font-bold text-[#111827] leading-none">64.2%</span>
            <span className="text-[12px] text-[#6B7280] mt-1">Win Rate (45 Trades)</span>
          </div>
          <div className="w-px h-10 bg-[#E5E7EB]"></div>
          <div className="flex flex-col text-right">
            <span className="text-[28px] font-bold text-[#1D4ED8] leading-none">2.14</span>
            <span className="text-[12px] text-[#6B7280] mt-1">Profit Factor</span>
          </div>
        </div>
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-[#F3F4F6]">
          <span className="flex items-center gap-1 text-[13px] font-medium text-[#4B5563]">
            <span className="material-symbols-outlined text-[16px] text-[#059669]">verified</span> Rule Adherence:
          </span>
          <span className="text-[14px] font-bold text-[#059669]">92 <span className="text-[#9CA3AF] font-normal">/ 100</span></span>
        </div>
      </div>

    </div>
  )
}
