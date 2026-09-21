'use client'

import React, { useState, useEffect } from 'react'
import { JournalCalendar } from './components/JournalCalendar'
import { TradeEntryForm } from './components/TradeEntryForm'
import { TradeLogTable, Trade } from './components/TradeLogTable'
import { GatedContent } from '../components/GatedContent'
import { getTrades } from './actions'

export default function TradingJournalPage() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrades = async () => {
      const result = await getTrades();
      if (result.success && result.trades) {
        const mappedTrades = result.trades.map((t: any) => ({
          id: t.id,
          date: new Date(t.execution_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          asset: t.asset,
          direction: t.direction as 'LONG' | 'SHORT',
          lots: t.lot_size,
          pnl: t.pnl,
          psychology: t.psychology_state || '',
          notes: t.notes || ''
        }));
        setTrades(mappedTrades);
      }
      setIsLoading(false);
    };
    fetchTrades();
  }, []);

  const handleSaveTrade = (newTrade: Trade) => {
    setTrades([newTrade, ...trades]);
  };

  return (
    <GatedContent minPackageRequired={2} blurLevel="md" customMessage="The Trading Journal is available for Package 2 and above. Upgrade to track your performance and psychological metrics.">
      <div className="flex flex-col max-w-[1400px] mx-auto w-full pb-10 pt-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex flex-col">
            <h1 className="text-[24px] font-bold text-[#111827] flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px] text-[#1D4ED8]">menu_book</span>
              Institutional Trading Journal
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-1">Log psychological telemetry and execution details to build consistency</p>
          </div>
          <button className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F3F4F6] text-[#111827] px-4 py-2 rounded-lg text-[13px] font-bold transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <span className="material-symbols-outlined text-[18px]">download</span> Export Ledger
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-8">
          
          {/* Left Column - Calendar */}
          <div className="lg:col-span-7 h-full">
            <JournalCalendar trades={trades} />
          </div>

          {/* Right Column - Entry Form */}
          <div className="lg:col-span-5 h-full">
            <TradeEntryForm onSave={handleSaveTrade} />
          </div>

        </div>

        {/* Full Width Trade Log Table */}
        <TradeLogTable trades={trades} />
        
      </div>
    </GatedContent>
  )
}
