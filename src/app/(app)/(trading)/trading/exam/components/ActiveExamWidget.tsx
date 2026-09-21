'use client'

import { useState, useEffect } from 'react'

export function ActiveExamWidget() {
  const [isStarted, setIsStarted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(3542) // Approx 59 minutes

  useEffect(() => {
    if (!isStarted) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)
    return () => clearInterval(timer)
  }, [isStarted])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 flex flex-col mb-6">
      
      {!isStarted ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="w-20 h-20 bg-[#EFF6FF] rounded-full flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[40px] text-[#1D4ED8]">assignment</span>
          </div>
          <h2 className="text-[24px] font-bold text-[#111827] mb-2">Phase 2: Quantitative Risk Engine Final Exam</h2>
          <p className="text-[14px] text-[#6B7280] max-w-lg mb-8">
            You will have exactly 60 minutes to complete 45 questions. A passing score of 85% is required to advance. The timer will begin immediately once you start the exam.
          </p>
          <button 
            onClick={() => setIsStarted(true)}
            className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-8 py-3 rounded-[24px] font-bold text-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors"
          >
            Start Exam Now <span className="material-symbols-outlined text-[20px]">timer</span>
          </button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 pb-6 border-b border-[#F3F4F6]">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#1D4ED8] uppercase tracking-wider mb-1 bg-[#DBEAFE] w-max px-2 py-0.5 rounded">Active Evaluation</span>
              <h2 className="text-[20px] font-bold text-[#111827]">Phase 2: Quantitative Risk Engine Final Exam</h2>
              <p className="text-[13px] text-[#6B7280] mt-1">Question 14 of 45 • Passing Score: 85%</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Time Remaining</span>
              <span className="text-[28px] font-black font-mono text-[#EF4444] leading-none">{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="flex flex-col gap-4 md:gap-6">
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-4 md:p-5">
              <div className="flex gap-4">
                <span className="text-[24px] font-bold text-[#1D4ED8]">14.</span>
                <div className="flex flex-col">
                  <p className="text-[15px] font-medium text-[#111827] leading-relaxed mb-4">
                    You are managing a $100,000 Elite Tier account with a hard 2% maximum risk exposure per trade. The current ATR (14) on EUR/USD is 12 pips. Your strategy dictates a stop-loss distance of 1.5x ATR below the structural swing low.
                    <br /><br />
                    If the swing low is at 1.0540, and your entry is at 1.0565, what is the maximum standard lot size you can execute without violating the 2% risk parameter? (Assume $10/pip per standard lot).
                  </p>
                  
                  <div className="flex flex-col gap-3">
                    <label className="flex items-center gap-3 p-4 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-lg cursor-pointer transition-colors group">
                      <input type="radio" name="q14" className="w-4 h-4 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-[14px] font-bold text-[#4B5563] group-hover:text-[#111827]">A. 4.65 Lots</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white border-2 border-[#1D4ED8] rounded-lg cursor-pointer transition-colors bg-[#EFF6FF]">
                      <input type="radio" name="q14" defaultChecked className="w-4 h-4 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-[14px] font-bold text-[#1D4ED8]">B. 4.60 Lots (Rounded down to nearest micro)</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-lg cursor-pointer transition-colors group">
                      <input type="radio" name="q14" className="w-4 h-4 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-[14px] font-bold text-[#4B5563] group-hover:text-[#111827]">C. 5.12 Lots</span>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-white border border-[#E5E7EB] hover:border-[#1D4ED8] rounded-lg cursor-pointer transition-colors group">
                      <input type="radio" name="q14" className="w-4 h-4 text-[#1D4ED8] focus:ring-[#1D4ED8]" />
                      <span className="text-[14px] font-bold text-[#4B5563] group-hover:text-[#111827]">D. 8.33 Lots</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4">
              <button className="flex items-center gap-2 text-[#6B7280] hover:text-[#111827] font-bold text-[13px] transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Previous Question
              </button>
              
              <div className="flex gap-1.5">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full ${i < 13 ? 'bg-[#059669]' : i === 13 ? 'bg-[#1D4ED8] scale-150' : 'bg-[#E5E7EB]'}`}></div>
                ))}
                <span className="text-[10px] text-[#9CA3AF] ml-2">...</span>
              </div>

              <button className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white px-6 py-3 rounded-lg font-bold text-[13px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors">
                Confirm & Next <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

