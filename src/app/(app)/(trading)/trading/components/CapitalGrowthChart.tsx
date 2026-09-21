'use client'

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'

const data = [
  { day: '1', equity: 100000 },
  { day: '2', equity: 100500 },
  { day: '3', equity: 100200 },
  { day: '4', equity: 101800 },
  { day: '5', equity: 101100 },
  { day: '6', equity: 102500 },
  { day: '7', equity: 103900 },
  { day: '8', equity: 103100 },
  { day: '9', equity: 104500 },
  { day: '10', equity: 105200 },
  { day: '11', equity: 106800 },
  { day: '12', equity: 106000 },
  { day: '13', equity: 107500 },
  { day: '14', equity: 108240.50 },
]

export function CapitalGrowthChart() {
  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 w-full flex flex-col relative overflow-hidden">
      
      <div className="flex items-start justify-between mb-8 relative z-10">
        <div>
          <h2 className="font-bold text-[18px] text-[#111827] flex items-center gap-2">
            Capital Growth & Water Mark
            <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Live Feed</span>
          </h2>
          <p className="text-[13px] text-[#6B7280] mt-1">Continuous high-water metric tracking vs. $110,000 funding milestone</p>
        </div>
        <div className="flex bg-[#F3F4F6] p-1 rounded-lg">
          <button className="px-3 py-1.5 text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]">1D</button>
          <button className="px-3 py-1.5 text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]">1W</button>
          <button className="bg-white text-[#1D4ED8] px-3 py-1.5 text-[12px] font-bold rounded-md shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">1M</button>
          <button className="px-3 py-1.5 text-[12px] font-semibold text-[#6B7280] hover:text-[#111827]">All</button>
        </div>
      </div>

      <div className="h-[280px] w-full relative z-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#1D4ED8" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#1D4ED8" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="day" hide />
            <YAxis domain={[98000, 112000]} hide />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ color: '#1D4ED8', fontWeight: 'bold' }}
              formatter={(value: any) => [`$${value.toLocaleString()}`, 'Equity']}
            />
            <ReferenceLine y={110000} stroke="#059669" strokeDasharray="3 3" />
            <ReferenceLine y={100000} stroke="#9CA3AF" strokeDasharray="3 3" />
            <Area 
              type="monotone" 
              dataKey="equity" 
              stroke="#1D4ED8" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorEquity)" 
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* Floating Labels on Chart */}
        <div className="absolute top-2 right-4 bg-[#059669] text-white px-2 py-1 rounded text-[10px] font-bold z-20">
          $110,000 Target Milestone
        </div>
        <div className="absolute bottom-12 right-4 text-[#6B7280] px-2 py-1 text-[10px] font-bold z-20">
          $100,000 Initial Anchor
        </div>

        {/* Current Value Tooltip style widget positioned absolutely over the chart line */}
        <div className="absolute top-[40%] right-[15%] bg-white/90 backdrop-blur-sm border border-[#E5E7EB] shadow-lg rounded-lg p-3 z-20 flex flex-col items-center">
          <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider">Current Active Equity</span>
          <span className="text-[18px] font-bold text-[#1D4ED8]">$108,240.50 <span className="text-[#059669] text-[14px]">(+$8,240.50)</span></span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-8 pt-4 border-t border-[#F3F4F6] relative z-10">
        <div className="bg-[#F8F9FA] p-3 rounded-lg flex flex-col">
          <span className="text-[11px] text-[#6B7280] font-medium">Avg Win</span>
          <span className="text-[16px] font-bold text-[#111827]">+$480.20</span>
        </div>
        <div className="bg-[#F8F9FA] p-3 rounded-lg flex flex-col">
          <span className="text-[11px] text-[#6B7280] font-medium">Avg Loss</span>
          <span className="text-[16px] font-bold text-[#111827]">-$210.00</span>
        </div>
        <div className="bg-[#ECFDF5] p-3 rounded-lg flex flex-col border border-[#DCFCE7]">
          <span className="text-[11px] text-[#059669] font-bold">Expectancy</span>
          <span className="text-[16px] font-bold text-[#059669]">1.82 R</span>
        </div>
        <div className="bg-[#DBEAFE] p-3 rounded-lg flex flex-col border border-[#D0DFFF]">
          <span className="text-[11px] text-[#1D4ED8] font-bold">Sharpe Ratio</span>
          <span className="text-[16px] font-bold text-[#1D4ED8]">2.41</span>
        </div>
      </div>

    </div>
  )
}
