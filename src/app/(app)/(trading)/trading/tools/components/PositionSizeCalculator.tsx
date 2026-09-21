'use client'

import { useState } from 'react'

export function PositionSizeCalculator() {
  const [accountBalance, setAccountBalance] = useState('100000')
  const [riskPercent, setRiskPercent] = useState('1')
  const [stopLoss, setStopLoss] = useState('15')
  const [assetClass, setAssetClass] = useState('EUR/USD')

  // Simple math for the mockup
  const riskAmount = (parseFloat(accountBalance || '0') * (parseFloat(riskPercent || '0') / 100)).toFixed(2)
  const pipValue = 10 // Mock fixed pip value for standard lot
  const standardLots = (parseFloat(riskAmount) / (parseFloat(stopLoss || '1') * pipValue)).toFixed(2)

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col h-full">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center text-[#1D4ED8]">
          <span className="material-symbols-outlined text-[20px]">calculate</span>
        </div>
        <div className="flex flex-col">
          <h2 className="text-[16px] font-bold text-[#111827] leading-tight">Position Size Calculator</h2>
          <span className="text-[11px] text-[#6B7280]">Algorithmic lot derivation based on risk parameters</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Account Balance (USD)</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-bold">$</span>
            <input 
              type="number" 
              value={accountBalance}
              onChange={(e) => setAccountBalance(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg py-2.5 pl-7 pr-3 text-[14px] font-bold text-[#111827] focus:outline-none focus:border-[#1D4ED8] transition-colors"
            />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Risk %</label>
            <div className="relative">
              <input 
                type="number" 
                value={riskPercent}
                onChange={(e) => setRiskPercent(e.target.value)}
                className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg py-2.5 pl-3 pr-7 text-[14px] font-bold text-[#111827] focus:outline-none focus:border-[#1D4ED8] transition-colors"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-bold">%</span>
            </div>
          </div>
          <div className="flex-1 flex flex-col gap-1.5">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Stop Loss (Pips)</label>
            <input 
              type="number" 
              value={stopLoss}
              onChange={(e) => setStopLoss(e.target.value)}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg py-2.5 px-3 text-[14px] font-bold text-[#111827] focus:outline-none focus:border-[#1D4ED8] transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Asset Class</label>
          <select 
            value={assetClass}
            onChange={(e) => setAssetClass(e.target.value)}
            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg py-2.5 px-3 text-[14px] font-bold text-[#111827] focus:outline-none focus:border-[#1D4ED8] transition-colors appearance-none cursor-pointer"
          >
            <option value="EUR/USD">EUR/USD (Major FX)</option>
            <option value="XAU/USD">XAU/USD (Gold Spot)</option>
            <option value="US30">US30 (Index Future)</option>
          </select>
        </div>
      </div>

      <div className="mt-auto bg-[#F8FAFC] rounded-[24px] border border-[#E5E7EB] p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-bold text-[#6B7280]">Maximum Risk (USD)</span>
          <span className="text-[16px] font-bold text-[#EF4444]">${riskAmount}</span>
        </div>
        <div className="flex items-center justify-between pb-3 border-b border-[#E5E7EB]">
          <span className="text-[12px] font-bold text-[#6B7280]">Pip Value (Standard Lot)</span>
          <span className="text-[14px] font-bold text-[#111827]">${pipValue}.00</span>
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="text-[13px] font-bold text-[#1D4ED8]">Suggested Position Size</span>
          <span className="text-[24px] font-black text-[#1D4ED8]">{standardLots} Lots</span>
        </div>
      </div>
    </div>
  )
}
