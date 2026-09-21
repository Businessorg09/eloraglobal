import React from 'react';
import { Trade } from './TradeLogTable';

interface JournalCalendarProps {
  trades: Trade[];
}

export function JournalCalendar({ trades }: JournalCalendarProps) {
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
  
  // Calculate dynamic metrics
  const totalPnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = trades.filter(t => t.pnl > 0).length;
  const losses = trades.filter(t => t.pnl < 0).length;
  const winRate = trades.length > 0 ? Math.round((wins / trades.length) * 100) : 0;

  // We'll create a simple fixed 3-week calendar layout (15 days) for visual purposes
  // and inject real trade data into the last few days to show the dynamic update
  const calendarData = [
    { day: '12', status: 'win', pnl: 420, notes: 2 },
    { day: '13', status: 'loss', pnl: -150, notes: 1 },
    { day: '14', status: 'neutral', pnl: 0, notes: 0 },
    { day: '15', status: 'win', pnl: 890, notes: 3 },
    { day: '16', status: 'win', pnl: 210, notes: 1 },
    { day: '19', status: 'loss', pnl: -300, notes: 2 },
    { day: '20', status: 'win', pnl: 550, notes: 1 },
    { day: '21', status: 'win', pnl: 1200, notes: 4 },
    { day: '22', status: 'loss', pnl: -180, notes: 1 },
    { day: '23', status: 'neutral', pnl: 0, notes: 0 },
    { day: '26', status: 'win', pnl: 450, notes: 2 },
    { day: '27', status: 'neutral', pnl: 0, notes: 0 },
    { day: '28', status: 'neutral', pnl: 0, notes: 0 },
    { day: '29', status: 'neutral', pnl: 0, notes: 0 },
    { day: '30', status: 'neutral', pnl: 0, notes: 0 },
  ];

  // Map real trades into the end of the calendar (days 27, 28, 29, 30...)
  trades.forEach((trade, idx) => {
    const calIdx = 11 + (idx % 4); // Start placing from day 27 (index 11)
    if (calIdx < calendarData.length) {
      calendarData[calIdx].pnl += trade.pnl;
      calendarData[calIdx].status = calendarData[calIdx].pnl > 0 ? 'win' : calendarData[calIdx].pnl < 0 ? 'loss' : 'neutral';
      calendarData[calIdx].notes += 1;
    }
  });

  const getColor = (status: string) => {
    if (status === 'win') return 'bg-[#ECFDF5] border-[#059669] text-[#059669]'
    if (status === 'loss') return 'bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]'
    return 'bg-[#F3F4F6] border-[#E5E7EB] text-[#6B7280]'
  }

  const formatPnl = (val: number) => {
    if (val === 0) return '$0';
    return `${val > 0 ? '+' : ''}$${Math.abs(val).toLocaleString()}`;
  }

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8]">
            <span className="material-symbols-outlined text-[20px]">calendar_month</span>
          </div>
          <div className="flex flex-col">
            <h2 className="text-[16px] font-bold text-[#111827] leading-tight">August Ledger</h2>
            <span className="text-[11px] text-[#6B7280]">Daily P&L Heatmap</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 rounded hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><span className="material-symbols-outlined text-[16px]">chevron_left</span></button>
          <span className="text-[12px] font-bold text-[#111827]">August</span>
          <button className="p-1 rounded hover:bg-[#F3F4F6] text-[#6B7280] transition-colors"><span className="material-symbols-outlined text-[16px]">chevron_right</span></button>
        </div>
      </div>

      <div className="flex flex-col gap-2 flex-1">
        <div className="grid grid-cols-5 gap-2 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="text-center text-[10px] font-bold text-[#9CA3AF] uppercase tracking-wider">{day}</div>
          ))}
        </div>
        
        <div className="grid grid-cols-5 gap-2 flex-1">
          {calendarData.map((data, idx) => (
            <div key={idx} className={`relative rounded-lg border flex flex-col p-2 cursor-pointer transition-transform hover:scale-[1.02] ${getColor(data.status)}`}>
              <span className="text-[10px] font-bold opacity-70 mb-1">{data.day}</span>
              <span className="text-[12px] font-black mt-auto">{formatPnl(data.pnl)}</span>
              {data.notes > 0 && (
                <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                  {[...Array(Math.min(data.notes, 3))].map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 rounded-full bg-current opacity-50"></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-[#E5E7EB] flex flex-col gap-2">
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#6B7280] font-medium">Monthly Net P&L</span>
          <span className={`font-bold ${totalPnl >= 0 ? 'text-[#059669]' : 'text-[#EF4444]'}`}>
            {formatPnl(totalPnl)}
          </span>
        </div>
        <div className="flex items-center justify-between text-[12px]">
          <span className="text-[#6B7280] font-medium">Win Rate</span>
          <span className="font-bold text-[#111827]">{winRate}% ({wins}W / {losses}L)</span>
        </div>
      </div>
    </div>
  )
}
