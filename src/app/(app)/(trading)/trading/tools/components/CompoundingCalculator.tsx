'use client'

import React, { useState } from 'react'

export function CompoundingCalculator() {
  const [balance, setBalance] = useState<number>(10000)
  const [winRate, setWinRate] = useState<number>(55)
  const [rewardRatio, setRewardRatio] = useState<number>(2)
  const [riskPercent, setRiskPercent] = useState<number>(1)
  const [trades, setTrades] = useState<number>(100)

  // Quick monte-carlo style average expectancy compounding
  // Expectancy = (Win% * Reward) - (Loss% * Risk)
  const winProb = winRate / 100;
  const lossProb = 1 - winProb;
  const riskAmountPct = riskPercent / 100;
  
  // Average Growth per trade multiplier
  const expectedGrowthPerTrade = 1 + (winProb * (riskAmountPct * rewardRatio)) - (lossProb * riskAmountPct);
  
  const projectedBalance = balance * Math.pow(expectedGrowthPerTrade, trades);
  const totalProfit = projectedBalance - balance;
  const roi = (totalProfit / balance) * 100;

  return (
    <div className="bg-[#ffffff] border border-[#E5E7EB] rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] overflow-hidden flex flex-col h-full">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">trending_up</span>
          <h2 className="text-[14px] font-bold text-[#111827]">Compounding Growth Forecaster</h2>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-4 md:p-5 flex-1">
        <p className="text-[12px] text-[#6B7280]">Forecast account growth based on your mechanical edge (Win Rate & Risk:Reward) over a set series of trades.</p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Initial Balance ($)</label>
            <input 
              type="number" 
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Trades to Forecast</label>
            <input 
              type="number" 
              value={trades}
              onChange={(e) => setTrades(Number(e.target.value))}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Win Rate (%)</label>
            <input 
              type="number" 
              value={winRate}
              onChange={(e) => setWinRate(Number(e.target.value))}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Avg R:R</label>
            <input 
              type="number" 
              value={rewardRatio}
              step="0.1"
              onChange={(e) => setRewardRatio(Number(e.target.value))}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Risk / Trade (%)</label>
            <input 
              type="number" 
              value={riskPercent}
              step="0.1"
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="mt-auto bg-[#ECFDF5] border border-[#A7F3D0] rounded-[24px] p-4 flex flex-col items-center text-center">
          <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider mb-1">Projected Balance (Avg Expected)</span>
          <span className="text-[32px] font-black text-[#111827] tracking-tight leading-none mb-2">
            ${projectedBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </span>
          <div className="flex items-center gap-4 text-[12px] font-bold text-[#059669]">
            <span>Net Profit: +${totalProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
            <span className="text-[#A7F3D0]">•</span>
            <span>ROI: +{roi.toFixed(1)}%</span>
          </div>
        </div>

      </div>
    </div>
  )
}
