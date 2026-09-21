'use client'

import React from 'react'

export function IndicatorLibraryWidget() {
  const indicators = [
    {
      id: 1,
      name: "Institutional Order Block Finder",
      version: "v5.2",
      author: "Elora Quant Team",
      description: "Automatically detects and plots high-probability unmitigated order blocks across multi-timeframes with volume confirmation.",
      tags: ["PineScript v5", "Smart Money Concepts"],
      downloads: "12.4k",
      status: "Premium"
    },
    {
      id: 2,
      name: "Fair Value Gap (FVG) Auto-Plotter",
      version: "v3.1",
      author: "Elora Quant Team",
      description: "Highlights bullish and bearish BSI/SIB imbalances. Automatically clears the zone once price fully mitigates the gap.",
      tags: ["PineScript v5", "Liquidity", "Imbalance"],
      downloads: "8.9k",
      status: "Free"
    },
    {
      id: 3,
      name: "Asian Range & Killzone Overlay",
      version: "v2.0",
      author: "Marcus Vance",
      description: "Visualizes the Asian consolidation range and dynamically highlights London/NY killzones for sweep and continuation setups.",
      tags: ["PineScript v4", "Time & Price"],
      downloads: "15.1k",
      status: "Premium"
    },
    {
      id: 4,
      name: "Advanced Liquidity Sweep Detector",
      version: "v1.4",
      author: "Dr. Elena Rostova",
      description: "Alerts when price sweeps previous daily/weekly highs or lows and immediately prints a reversal signature on the 15m timeframe.",
      tags: ["PineScript v5", "Swing Failure"],
      downloads: "6.2k",
      status: "Premium"
    }
  ];

  return (
    <div className="flex flex-col mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-6">
        <div className="flex flex-col">
          <h2 className="text-[20px] font-bold text-[#111827] flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] md:text-[24px] text-[#1D4ED8]">code_blocks</span>
            Proprietary PineScript Indicators
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-1">Plug-and-play TradingView algorithms engineered by our desk.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#F8FAFC] border border-[#E5E7EB] px-4 py-2 rounded-lg text-[#111827] text-[13px] font-bold hover:bg-[#F3F4F6] transition-colors">
          <span className="material-symbols-outlined text-[18px]">upload</span>
          Submit Custom Script
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 md:gap-6">
        {indicators.map((indicator) => (
          <div key={indicator.id} className="bg-white border border-[#E5E7EB] rounded-[24px] p-4 md:p-5 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow flex flex-col group">
            
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 border border-[#BFDBFE]">
                <span className="material-symbols-outlined text-[20px]">data_object</span>
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                indicator.status === 'Premium' 
                  ? 'bg-[#FEFCE8] text-[#CA8A04] border border-[#FEF08A]' 
                  : 'bg-[#F3F4F6] text-[#4B5563] border border-[#E5E7EB]'
              }`}>
                {indicator.status}
              </span>
            </div>

            <h3 className="font-bold text-[15px] text-[#111827] leading-tight mb-1 group-hover:text-[#1D4ED8] transition-colors">
              {indicator.name}
            </h3>
            <span className="text-[11px] font-medium text-[#6B7280] mb-3">By {indicator.author} • {indicator.version}</span>
            
            <p className="text-[12px] text-[#4B5563] leading-relaxed mb-4 flex-1">
              {indicator.description}
            </p>

            <div className="flex flex-wrap gap-1.5 mb-5">
              {indicator.tags.map(tag => (
                <span key={tag} className="bg-[#F8FAFC] text-[#4B5563] border border-[#E5E7EB] text-[10px] font-bold px-2 py-0.5 rounded">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center gap-2 mt-auto">
              <button className="flex-1 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-3 py-2 rounded-lg font-bold text-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">content_copy</span>
                Copy Code
              </button>
              <button className="w-10 h-10 flex items-center justify-center bg-[#F8FAFC] border border-[#E5E7EB] hover:bg-[#F3F4F6] rounded-lg transition-colors text-[#4B5563]">
                <span className="material-symbols-outlined text-[18px]">favorite</span>
              </button>
            </div>
            
          </div>
        ))}
      </div>
    </div>
  )
}
