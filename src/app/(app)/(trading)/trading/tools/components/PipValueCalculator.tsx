'use client'

import React, { useState } from 'react'

export function PipValueCalculator() {
  const [lotSize, setLotSize] = useState<number>(1.0)
  const [pair, setPair] = useState<string>('EURUSD')
  const [accountCurrency, setAccountCurrency] = useState<string>('USD')

  // Simple mock logic for pip value calculation
  // Standard lot = 100,000 units. A pip is 0.0001 for most pairs (0.01 for JPY pairs)
  const isJpy = pair.includes('JPY')
  const pipDecimal = isJpy ? 0.01 : 0.0001
  const units = lotSize * 100000
  
  // Value in quote currency
  let pipValueQuote = units * pipDecimal

  // Mock conversion to account currency (assuming EURUSD = 1.10, GBPUSD = 1.25, USDJPY = 150)
  let pipValueAcct = pipValueQuote
  if (accountCurrency === 'USD') {
    if (pair.endsWith('USD')) {
      pipValueAcct = pipValueQuote
    } else if (pair.endsWith('JPY')) {
      pipValueAcct = pipValueQuote / 150 // mock exchange rate
    } else if (pair.endsWith('CHF')) {
      pipValueAcct = pipValueQuote / 0.90
    }
  }

  return (
    <div className="bg-[#ffffff] border border-[#E5E7EB] rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
      <div className="bg-[#F8FAFC] border-b border-[#E5E7EB] px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">calculate</span>
          <h2 className="text-[14px] font-bold text-[#111827]">Universal Pip Value Calculator</h2>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-5 flex-1">
        <p className="text-[12px] text-[#6B7280]">Determine the exact monetary value of a single pip for precise lot sizing and risk allocation.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Asset Pair</label>
            <select 
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            >
              <option value="EURUSD">EUR/USD</option>
              <option value="GBPUSD">GBP/USD</option>
              <option value="USDJPY">USD/JPY</option>
              <option value="AUDUSD">AUD/USD</option>
              <option value="USDCAD">USD/CAD</option>
              <option value="GBPJPY">GBP/JPY</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Lot Size (Vol)</label>
            <input 
              type="number" 
              value={lotSize}
              step="0.01"
              onChange={(e) => setLotSize(Number(e.target.value))}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-bold text-[#4B5563] uppercase tracking-wider">Acct Currency</label>
            <select 
              value={accountCurrency}
              onChange={(e) => setAccountCurrency(e.target.value)}
              className="w-full bg-[#F3F4F6] border-none rounded-lg px-3 py-2 text-[13px] font-bold text-[#111827] focus:ring-2 focus:ring-[#1D4ED8] focus:bg-white transition-all"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
        </div>

        <div className="mt-auto bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-4 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wider mb-1">Value Per Pip (1 Tick)</span>
            <span className="text-[12px] text-[#4B5563]">For {lotSize} Standard Lots</span>
          </div>
          <span className="text-[32px] font-black text-[#1D4ED8] tracking-tight leading-none">
            ${pipValueAcct.toFixed(2)}
          </span>
        </div>

      </div>
    </div>
  )
}
