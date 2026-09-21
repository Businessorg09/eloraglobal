'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-6 w-full max-w-[1200px] mx-auto pb-10">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-2">
          <div className="flex flex-col">
            <h1 className="font-extrabold text-[20px] md:text-[24px] text-[#111827] flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] md:text-[28px] text-[#1D4ED8]">settings</span>
              Platform Settings
            </h1>
            <p className="font-medium text-[14px] text-[#6B7280] mt-1">Manage your institutional account, billing, and engine preferences</p>
          </div>
          <button className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-[#1D4ED8]/90 text-white px-5 py-2.5 rounded-lg font-bold text-[13px] transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Changes
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-6 items-start">
          
          {/* Left: Navigation */}
          <div className="w-full md:w-[260px] bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] flex flex-col overflow-hidden shrink-0">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-5 py-4 font-bold text-[13px] transition-colors text-left border-l-4 ${activeTab === 'profile' ? 'bg-[#F8FAFC] border-[#1D4ED8] text-[#1D4ED8]' : 'bg-transparent border-transparent text-[#6B7280] hover:bg-[#F9FAFB]'}`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span> Institutional Profile
            </button>
            <button 
              onClick={() => setActiveTab('platform')}
              className={`flex items-center gap-3 px-5 py-4 font-bold text-[13px] transition-colors text-left border-l-4 border-t border-[#F3F4F6] ${activeTab === 'platform' ? 'bg-[#F8FAFC] border-[#1D4ED8] text-[#1D4ED8]' : 'bg-transparent border-transparent text-[#6B7280] hover:bg-[#F9FAFB]'}`}
            >
              <span className="material-symbols-outlined text-[20px]">display_settings</span> Engine Preferences
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-3 px-5 py-4 font-bold text-[13px] transition-colors text-left border-l-4 border-t border-[#F3F4F6] ${activeTab === 'billing' ? 'bg-[#F8FAFC] border-[#1D4ED8] text-[#1D4ED8]' : 'bg-transparent border-transparent text-[#6B7280] hover:bg-[#F9FAFB]'}`}
            >
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span> Allocation & Billing
            </button>
          </div>

          {/* Right: Content Area */}
          <div className="flex-1 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] flex flex-col p-4 md:p-6 sm:p-4 md:p-8 min-h-[500px]">
            
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-4 md:gap-8  max-w-[650px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-[#111827]">Trader Identity</h2>
                  <p className="font-medium text-[13px] text-[#6B7280] mt-1">Manage your public persona and verified details.</p>
                </div>
                
                <div className="flex items-center gap-4 md:gap-6 p-4 rounded-[24px] bg-[#F8FAFC] border border-[#E5E7EB]">
                  <div className="w-20 h-20 rounded-[24px] bg-[#1D4ED8] text-white font-headline-xl text-[20px] md:text-[24px] flex items-center justify-center shadow-inner">
                    AV
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-bold text-[13px] text-[#111827]">Avatar Upload</span>
                    <button className="flex items-center gap-1.5 bg-[#E5E7EB] hover:bg-white-variant text-[#111827] px-4 py-2 rounded-lg font-bold text-[11px] transition-colors">
                      <span className="material-symbols-outlined text-[16px]">upload</span> Choose Image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-[11px] text-[#9CA3AF] uppercase tracking-wider">First Name</label>
                    <input type="text" defaultValue="Alex" className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3 font-medium text-[14px] text-[#111827] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none transition-shadow" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-bold text-[11px] text-[#9CA3AF] uppercase tracking-wider">Last Name</label>
                    <input type="text" defaultValue="Vance" className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3 font-medium text-[14px] text-[#111827] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none transition-shadow" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[11px] text-[#9CA3AF] uppercase tracking-wider">Public Username (Trader Tag)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] font-body-md">@</span>
                    <input type="text" defaultValue="Alex_Trader" className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3 pl-8 font-medium text-[14px] text-[#111827] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none transition-shadow" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-bold text-[11px] text-[#9CA3AF] uppercase tracking-wider">Primary Email</label>
                  <input type="email" defaultValue="alex.vance@eloratrading.com" className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3 font-medium text-[14px] text-[#111827] focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] focus:outline-none transition-shadow" />
                  <span className="font-body-sm text-[11px] text-[#6B7280] flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Verified Address
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="flex flex-col gap-4 md:gap-8  max-w-[650px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-[#111827]">Engine Preferences</h2>
                  <p className="font-medium text-[13px] text-[#6B7280] mt-1">Customize your trading environment and telemetry alerts.</p>
                </div>
                
                <div className="flex flex-col bg-[#F8FAFC] rounded-[24px] border border-[#E5E7EB] overflow-hidden">
                  
                  <div className="flex items-center justify-between p-4 border-b border-[#F3F4F6]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[13px] text-[#111827] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">dark_mode</span>
                        High-Contrast Dark Theme
                      </span>
                      <span className="font-medium text-[13px] text-[#6B7280] ml-6.5">Reduces eye strain during extended sessions.</span>
                    </div>
                    <div className="w-11 h-6 bg-[#1D4ED8] rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border-b border-[#F3F4F6]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[13px] text-[#111827] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">notifications_active</span>
                        Execution Alerts (Desktop)
                      </span>
                      <span className="font-medium text-[13px] text-[#6B7280] ml-6.5">Push notifications when orders are filled.</span>
                    </div>
                    <div className="w-11 h-6 bg-[#1D4ED8] rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border-b border-[#F3F4F6]">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[13px] text-[#111827] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">volume_up</span>
                        Audio Telemetry
                      </span>
                      <span className="font-medium text-[13px] text-[#6B7280] ml-6.5">Sound cues for risk limits and price alerts.</span>
                    </div>
                    <div className="w-11 h-6 bg-[#E5E7EB] rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white-variant rounded-full absolute left-1 top-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[13px] text-[#111827] flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">visibility_off</span>
                        Privacy Mode (Streamer)
                      </span>
                      <span className="font-medium text-[13px] text-[#6B7280] ml-6.5">Obfuscate absolute balance figures, show percentages only.</span>
                    </div>
                    <div className="w-11 h-6 bg-[#E5E7EB] rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white-variant rounded-full absolute left-1 top-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)]"></div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="flex flex-col gap-4 md:gap-8  max-w-[650px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-[#111827]">Allocation & Subscription</h2>
                  <p className="font-medium text-[13px] text-[#6B7280] mt-1">Manage your current trading tier and associated capital.</p>
                </div>
                
                <div className="bg-[#1D4ED8]/5 border border-[#1D4ED8]/20 rounded-[24px] p-4 md:p-6 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute -right-10 -top-5 md:p-10 w-32 h-32 bg-[#1D4ED8]/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span className="bg-[#1D4ED8] text-white px-2.5 py-1 rounded font-bold text-[11px] uppercase tracking-wider font-bold">Package 3 Active</span>
                    <span className="font-headline-lg text-headline-lg text-[#111827]">$200,000 Allocation</span>
                  </div>
                  
                  <div className="flex flex-col relative z-10">
                    <h3 className="font-display-lg text-[22px] font-bold text-[#1D4ED8] leading-tight">Elite Institutional Tier</h3>
                    <span className="font-medium text-[13px] text-[#6B7280] mt-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">autorenew</span> Renews on Oct 24, 2025
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2 mb-2 relative z-10">
                    <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-[#9CA3AF] uppercase tracking-wider">Split</span>
                      <span className="font-headline-md text-label-md text-[#111827]">90% / 10%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-[11px] text-[#9CA3AF] uppercase tracking-wider">Scaling</span>
                      <span className="font-headline-md text-label-md text-[#111827]">Eligible for $500k</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2 relative z-10">
                    <button className="bg-white text-[#111827] border border-[#E5E7EB] px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors hover:bg-[#F8FAFC] shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                      Update Payment Method
                    </button>
                    <button className="text-red-500 bg-red-500-container/30 px-4 py-2.5 rounded-lg font-bold text-[13px] transition-colors hover:bg-red-500-container">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  )
}
