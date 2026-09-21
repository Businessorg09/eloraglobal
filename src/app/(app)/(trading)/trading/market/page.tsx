'use client'

import React from 'react';
import {
  TickerTapeWidget,
  EconomicCalendarWidget,
  MarketNewsWidget,
  ForexHeatmapWidget
} from './components/TradingViewWidgets';
import { GatedContent } from '../components/GatedContent';

export default function MarketIntelligencePage() {
  return (
    <GatedContent minPackageRequired={3} blurLevel="md" customMessage="Live Market Intelligence and Institutional Heatmaps are reserved for Package 3 Elite members. Upgrade for full global access.">
      <div className="flex flex-col mx-auto w-full pb-10 gap-4 md:gap-6 font-sans">
        
        {/* Ticker Tape Banner */}
        <div className="w-full bg-white border-b border-slate-200">
          <TickerTapeWidget />
        </div>

        <div className="max-w-[1600px] mx-auto w-full px-4 xl:px-4 md:px-8 space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex flex-col">
              <h1 className="text-lg md:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2 tracking-tight">
                <span className="material-symbols-outlined text-[24px] md:text-[32px] text-blue-600">public</span>
                Global Market Intelligence
              </h1>
              <p className="text-sm text-slate-500 mt-1 font-medium">Macroeconomic telemetry, live sentiment analysis, and breaking news.</p>
            </div>
          </div>

          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 md:gap-6 h-auto xl:h-[800px]">
            
            {/* Left Column: Economic Calendar */}
            <div className="xl:col-span-8 flex flex-col h-[600px] xl:h-full">
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 md:p-6 flex flex-col h-full overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 shrink-0">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-500">calendar_month</span>
                    Live Economic Calendar
                  </h2>
                  <span className="bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider">REAL-TIME</span>
                </div>
                <div className="flex-1 w-full rounded-[24px] overflow-hidden bg-slate-50 border border-slate-100">
                  <EconomicCalendarWidget />
                </div>
              </div>
            </div>

            {/* Right Column: Heatmap & News */}
            <div className="xl:col-span-4 flex flex-col gap-4 md:gap-6 h-full">
              
              {/* Top Right: Heatmap */}
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 md:p-6 flex flex-col h-[380px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 shrink-0">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-indigo-500">grid_on</span>
                    Currency Strength Matrix
                  </h2>
                </div>
                <div className="flex-1 w-full rounded-[24px] overflow-hidden bg-slate-50 border border-slate-100">
                  <ForexHeatmapWidget />
                </div>
              </div>

              {/* Bottom Right: News Timeline */}
              <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 p-4 md:p-6 flex flex-col flex-1 min-h-[380px] transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 shrink-0">
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <span className="material-symbols-outlined text-red-500">campaign</span>
                    Breaking News Feed
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                    <span className="text-xs font-bold text-red-500">LIVE</span>
                  </div>
                </div>
                <div className="flex-1 w-full rounded-[24px] overflow-hidden bg-slate-50 border border-slate-100">
                  <MarketNewsWidget />
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </GatedContent>
  )
}
