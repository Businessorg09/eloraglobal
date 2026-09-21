export function LessonContentPanels() {
  return (
    <div className="flex flex-col mt-8 w-full">
      {/* Tabs */}
      <div className="flex items-center gap-4 md:gap-6 border-b border-[#E5E7EB] pb-0">
        <button className="flex items-center gap-2 pb-3 border-b-2 border-[#1D4ED8] text-[#1D4ED8] font-bold text-[13px]">
          <span className="material-symbols-outlined text-[18px]">tv</span> Overview & Concepts
        </button>
        <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-[#6B7280] hover:text-[#111827] font-medium text-[13px] transition-colors">
          <span className="material-symbols-outlined text-[18px]">calculate</span> Interactive Calculator
        </button>
        <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-[#6B7280] hover:text-[#111827] font-medium text-[13px] transition-colors">
          <span className="material-symbols-outlined text-[18px]">folder_zip</span> Resources & Downloads (3)
        </button>
        <button className="flex items-center gap-2 pb-3 border-b-2 border-transparent text-[#6B7280] hover:text-[#111827] font-medium text-[13px] transition-colors">
          <span className="material-symbols-outlined text-[18px]">edit_note</span> Personal Notes
        </button>
      </div>

      <div className="py-6">
        {/* Rules Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-[#F8F9FA] rounded-[24px] p-4 md:p-5 border border-[#E5E7EB]">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Rule 1: Hard Capital Exposure</span>
            <div className="text-[20px] font-bold text-[#1D4ED8] my-1">1.0% — 2.0%</div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Never risk exceeding 2% of total qualified account equity on any singular market setup.
            </p>
          </div>
          <div className="bg-[#F8F9FA] rounded-[24px] p-4 md:p-5 border border-[#E5E7EB]">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Rule 2: Market Volatility Buffer</span>
            <div className="text-[20px] font-bold text-[#059669] my-1">1.5 × ATR</div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Average True Range (14 period) spacing prevents micro stop-outs from broker spreads.
            </p>
          </div>
          <div className="bg-[#F8F9FA] rounded-[24px] p-4 md:p-5 border border-[#E5E7EB]">
            <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider">Rule 3: Pip Value Uniformity</span>
            <div className="text-[20px] font-bold text-[#111827] my-1">$10.00 / lot</div>
            <p className="text-[11px] text-[#4B5563] leading-relaxed">
              Base pip valuation benchmark on 1 standard lot for USD quote currencies (EUR/USD, GBP/USD).
            </p>
          </div>
        </div>

        {/* Formula Block */}
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <span className="flex items-center gap-2 text-[14px] font-bold text-[#111827]">
              <span className="material-symbols-outlined text-[#1D4ED8]">functions</span> The Core Lot Sizing Formulation
            </span>
            <span className="bg-[#1D4ED8] text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Formula #RISK-01</span>
          </div>

          <div className="bg-[#F8F9FA] rounded-lg border border-[#E5E7EB] p-4 md:p-8 flex items-center justify-center font-serif text-[#1D4ED8]">
            {/* Styled Equation */}
            <div className="flex items-center gap-4 text-[24px] font-bold">
              <span>Position Size (Lots)</span>
              <span>=</span>
              <div className="flex flex-col items-center">
                <span className="border-b-2 border-[#1D4ED8] pb-2 px-4 mb-2">Account Balance × Risk %</span>
                <span>Stop Loss (Pips) × Pip Value</span>
              </div>
            </div>
          </div>
          
          <div className="text-[12px] text-[#6B7280] mt-4 leading-relaxed bg-[#F3F4F6] p-3 rounded-lg border border-[#E5E7EB]">
            Where <strong>Account Balance</strong> represents liquid portfolio equity ($100,000 for Elite Tier), <strong>Risk %</strong> is entered as a decimal (0.01 for 1%), <strong>Stop Loss</strong> is measured accurately in pips, and <strong>Pip Value</strong> is standardized per asset class.
          </div>
        </div>

        {/* SOP List */}
        <h3 className="font-bold text-[16px] text-[#111827] mb-4">Standard Operating Procedure For Every Execution</h3>
        <div className="flex flex-col gap-3 mb-8">
          
          <div className="flex items-start gap-4 p-4 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white font-bold flex items-center justify-center shrink-0">1</div>
            <div>
              <h4 className="font-bold text-[14px] text-[#111827]">Chart-Determined Stop Loss First</h4>
              <p className="text-[12px] text-[#4B5563] mt-1 leading-relaxed">Never select lot size before stop-loss distance. Determine invalidation based on structural swing highs/lows or liquidity sweeps.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white font-bold flex items-center justify-center shrink-0">2</div>
            <div>
              <h4 className="font-bold text-[14px] text-[#111827]">Determine Cash Risk Tolerance</h4>
              <p className="text-[12px] text-[#4B5563] mt-1 leading-relaxed">On a $100,000 account, 1% risk equals exactly $1,000 max tolerable drawdown if hit.</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">
            <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white font-bold flex items-center justify-center shrink-0">3</div>
            <div>
              <h4 className="font-bold text-[14px] text-[#111827]">Apply Leverage-Independent Fractional Sizing</h4>
              <p className="text-[12px] text-[#4B5563] mt-1 leading-relaxed">Compute exact contracts/lots. Margin requirements must stay below 15% aggregate utilization to prevent margin call exposure during high slippage events.</p>
            </div>
          </div>
        </div>

        {/* Action Bottom */}
        <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6">
          <button className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] font-bold text-[13px] transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Previous: Stop Loss Placement
          </button>
          <button className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-6 py-3 rounded-lg font-bold text-[13px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors">
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            Mark as Complete & Next: Risk/Reward Ratios <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
          </button>
        </div>

      </div>
    </div>
  )
}
