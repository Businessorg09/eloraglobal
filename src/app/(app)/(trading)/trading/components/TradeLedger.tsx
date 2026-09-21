export function TradeLedger() {
  const trades = [
    { asset: 'XAUUSD', type: 'Gold Spot', rr: '1:2.4 RR', action: 'BUY', lot: '3.50', ticket: '#89421', pnl: '+$1,420.00', r: '+2.4R', compliance: '100%', note: 'High quality liquidity sweep entry into 15m bullish order block.' },
    { asset: 'EURUSD', type: 'FX Spot', rr: '1:3.1 RR', action: 'BUY', lot: '5.00', ticket: '#82092', pnl: '+$1,550.00', r: '+3.1R', compliance: '100%', note: 'Clean London Open fair value gap displacement continuation.' },
    { asset: 'US30', type: 'Index Future', rr: '1:1.0 RR', action: 'SELL', lot: '1.20', ticket: '#82044', pnl: '-$800.00', r: '-1.0R', compliance: 'Strict Rule Excl.', note: 'Controlled loss taken after unexpected choppiness at structure invalidation.' },
  ]

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 w-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1D4ED8]">receipt_long</span>
          <div className="flex flex-col">
            <h2 className="font-bold text-[16px] text-[#111827] leading-tight">Executive Trade Ledger</h2>
            <p className="text-[11px] text-[#6B7280] mt-0.5">Live execution audit & rule compliance tracking</p>
          </div>
        </div>
        <button className="flex items-center gap-1 text-[12px] font-bold text-[#1D4ED8] hover:text-[#1E40AF] transition-colors">
          View Complete Journal <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </button>
      </div>

      <div className="flex flex-col gap-3">
        {trades.map((trade, idx) => (
          <div key={idx} className={`flex items-stretch justify-between p-4 rounded-[24px] border ${trade.action === 'BUY' ? 'bg-[#ECFDF5]/30 border-[#DCFCE7]' : 'bg-[#FEF2F2]/30 border-[#FEE2E2]'}`}>
            
            <div className="flex items-start gap-4">
              <div className={`mt-1 font-bold text-[10px] w-10 py-1 rounded text-center ${trade.action === 'BUY' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#FEE2E2] text-[#EF4444]'}`}>
                {trade.action}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[14px] text-[#111827]">{trade.asset}</span>
                  <span className="bg-[#F3F4F6] text-[#6B7280] px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold">{trade.type}</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${trade.action === 'BUY' ? 'bg-[#D1FAE5] text-[#059669]' : 'bg-[#E5E7EB] text-[#6B7280]'}`}>{trade.rr}</span>
                </div>
                <div className="text-[11px] text-[#6B7280]">
                  Lot: {trade.lot} • Ticket: {trade.ticket}
                </div>
                <div className="flex items-start gap-2 mt-1">
                  <span className="material-symbols-outlined text-[14px] text-[#1D4ED8] mt-0.5">psychology</span>
                  <span className="text-[12px] text-[#1D4ED8] font-medium leading-tight max-w-[350px]">
                    "{trade.note}"
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end justify-between text-right">
              <span className={`font-bold text-[18px] ${trade.action === 'BUY' ? 'text-[#059669]' : 'text-[#EF4444]'}`}>{trade.pnl}</span>
              <div className="flex items-center gap-2 text-[11px] font-bold mt-1">
                <span className={trade.action === 'BUY' ? 'text-[#059669]' : 'text-[#EF4444]'}>{trade.r}</span>
                <span className="text-[#D1D5DB]">•</span>
                <span className="text-[#6B7280]">{trade.compliance}</span>
              </div>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}
