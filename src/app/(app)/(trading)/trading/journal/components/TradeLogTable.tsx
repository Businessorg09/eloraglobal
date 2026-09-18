import React from 'react';

export interface Trade {
  id: string;
  date: string;
  asset: string;
  direction: 'LONG' | 'SHORT';
  lots: number;
  pnl: number;
  psychology: string;
  notes: string;
}

interface TradeLogTableProps {
  trades: Trade[];
}

export function TradeLogTable({ trades }: TradeLogTableProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6 w-full flex flex-col mt-8">
      <div className="flex items-center justify-between mb-6 border-b border-[#F3F4F6] pb-4">
        <h2 className="text-[16px] font-bold text-[#111827] leading-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1D4ED8]">table_rows</span>
          Execution Ledger
        </h2>
        <span className="text-[12px] font-bold text-[#6B7280]">{trades.length} Trades Logged</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] text-[10px] text-[#6B7280] font-bold uppercase tracking-wider bg-[#F9FAFB]">
              <th className="py-3 px-4 rounded-tl-lg">Date</th>
              <th className="py-3 px-4">Asset</th>
              <th className="py-3 px-4">Direction</th>
              <th className="py-3 px-4">Lots</th>
              <th className="py-3 px-4">Psychology</th>
              <th className="py-3 px-4 text-right">Net P&L</th>
              <th className="py-3 px-4 rounded-tr-lg w-[40px]"></th>
            </tr>
          </thead>
          <tbody className="text-[13px] text-[#111827]">
            {trades.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-[#6B7280] italic text-[12px]">
                  No trades logged yet. Use the entry form above to record your first execution.
                </td>
              </tr>
            ) : (
              trades.slice().reverse().map((trade) => (
                <tr key={trade.id} className="border-b border-[#E5E7EB] hover:bg-[#F9FAFB] transition-colors group">
                  <td className="py-3 px-4 text-[#6B7280] font-medium text-[12px] whitespace-nowrap">{trade.date}</td>
                  <td className="py-3 px-4 font-bold">{trade.asset}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${trade.direction === 'LONG' ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#FEF2F2] text-[#EF4444]'}`}>
                      {trade.direction}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium">{trade.lots.toFixed(2)}</td>
                  <td className="py-3 px-4">
                    <span className="bg-[#F3F4F6] text-[#4B5563] px-2 py-0.5 rounded text-[11px] font-semibold">{trade.psychology}</span>
                  </td>
                  <td className={`py-3 px-4 text-right font-black ${trade.pnl >= 0 ? 'text-[#059669]' : 'text-[#EF4444]'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${Math.abs(trade.pnl).toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button className="text-[#9CA3AF] hover:text-[#1D4ED8] transition-colors opacity-0 group-hover:opacity-100" title="View Notes">
                      <span className="material-symbols-outlined text-[18px]">info</span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
