'use client'

import { PositionSizeCalculator } from './components/PositionSizeCalculator'
import { RiskRewardMatrix } from './components/RiskRewardMatrix'
import { CompoundingCalculator } from './components/CompoundingCalculator'
import { PipValueCalculator } from './components/PipValueCalculator'
import { TimezoneOverlapMatrix } from './components/TimezoneOverlapMatrix'
import { IndicatorLibraryWidget } from './components/IndicatorLibraryWidget'
import { GatedContent } from '../components/GatedContent'

export default function TradingToolsPage() {
  return (
    <GatedContent minPackageRequired={3} blurLevel="md" customMessage="Trading tools and calculators are exclusively available for Package 3 members. Upgrade your subscription to unlock these features.">
      <div className="flex flex-col max-w-[1400px] mx-auto w-full px-4 md:px-8 pb-10 pt-4">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-0 mb-8">
          <div className="flex flex-col">
            <h1 className="text-[20px] md:text-[24px] font-bold text-[#111827] flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] md:text-[28px] text-[#1D4ED8]">construction</span>
              Trading Tools & Calculators
            </h1>
            <p className="text-[13px] text-[#6B7280] mt-1">Institutional-grade quantitative tools for exact risk containment</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8  items-start mb-8">
          <TimezoneOverlapMatrix />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8  items-start mb-12">
          
          {/* Left Column */}
          <div className="flex flex-col gap-4 md:gap-8  h-full">
            <PositionSizeCalculator />
            <CompoundingCalculator />
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-4 md:gap-8  h-full">
            <RiskRewardMatrix />
            <PipValueCalculator />
          </div>

        </div>

        <IndicatorLibraryWidget />
      </div>
    </GatedContent>
  )
}
