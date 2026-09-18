'use client'

import { useState } from 'react'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-gutter-lg w-full max-w-[1200px] mx-auto pb-10">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex flex-col">
            <h1 className="font-headline-xl text-headline-xl text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-[28px] text-primary">settings</span>
              Platform Settings
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage your institutional account, billing, and engine preferences</p>
          </div>
          <button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-5 py-2.5 rounded-lg font-label-md text-label-md transition-colors shadow-sm">
            <span className="material-symbols-outlined text-[18px]">save</span>
            Save Changes
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-gutter-lg items-start">
          
          {/* Left: Navigation */}
          <div className="w-full md:w-[260px] bg-surface-container-lowest rounded-xl shadow-sm border-none flex flex-col overflow-hidden shrink-0">
            <button 
              onClick={() => setActiveTab('profile')}
              className={`flex items-center gap-3 px-5 py-4 font-label-md text-label-md transition-colors text-left border-l-4 ${activeTab === 'profile' ? 'bg-surface-container-low border-primary text-primary' : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container-low/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">person</span> Institutional Profile
            </button>
            <button 
              onClick={() => setActiveTab('platform')}
              className={`flex items-center gap-3 px-5 py-4 font-label-md text-label-md transition-colors text-left border-l-4 border-t border-surface-container-high/30 ${activeTab === 'platform' ? 'bg-surface-container-low border-primary text-primary' : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container-low/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">display_settings</span> Engine Preferences
            </button>
            <button 
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-3 px-5 py-4 font-label-md text-label-md transition-colors text-left border-l-4 border-t border-surface-container-high/30 ${activeTab === 'billing' ? 'bg-surface-container-low border-primary text-primary' : 'bg-transparent border-transparent text-on-surface-variant hover:bg-surface-container-low/50'}`}
            >
              <span className="material-symbols-outlined text-[20px]">account_balance_wallet</span> Allocation & Billing
            </button>
          </div>

          {/* Right: Content Area */}
          <div className="flex-1 bg-surface-container-lowest rounded-xl shadow-sm border-none flex flex-col p-6 sm:p-8 min-h-[500px]">
            
            {activeTab === 'profile' && (
              <div className="flex flex-col gap-8 max-w-[650px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Trader Identity</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage your public persona and verified details.</p>
                </div>
                
                <div className="flex items-center gap-6 p-4 rounded-xl bg-surface-container-low border border-surface-container-high/50">
                  <div className="w-20 h-20 rounded-xl bg-primary-container text-on-primary-container font-headline-xl text-[24px] flex items-center justify-center shadow-inner">
                    AV
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-label-md text-label-md text-on-surface">Avatar Upload</span>
                    <button className="flex items-center gap-1.5 bg-surface-container-high hover:bg-surface-variant text-on-surface px-4 py-2 rounded-lg font-label-sm text-label-sm transition-colors">
                      <span className="material-symbols-outlined text-[16px]">upload</span> Choose Image
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">First Name</label>
                    <input type="text" defaultValue="Alex" className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Last Name</label>
                    <input type="text" defaultValue="Vance" className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" />
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Public Username (Trader Tag)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-outline font-body-md">@</span>
                    <input type="text" defaultValue="Alex_Trader" className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-3 pl-8 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" />
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Primary Email</label>
                  <input type="email" defaultValue="alex.vance@eloratrading.com" className="w-full bg-surface-container-low border border-surface-container-high rounded-lg p-3 font-body-md text-body-md text-on-surface focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-shadow" />
                  <span className="font-body-sm text-[11px] text-tertiary flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[14px]">verified</span> Verified Address
                  </span>
                </div>
              </div>
            )}

            {activeTab === 'platform' && (
              <div className="flex flex-col gap-8 max-w-[650px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Engine Preferences</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Customize your trading environment and telemetry alerts.</p>
                </div>
                
                <div className="flex flex-col bg-surface-container-low rounded-xl border border-surface-container-high/50 overflow-hidden">
                  
                  <div className="flex items-center justify-between p-4 border-b border-surface-container-high/30">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline">dark_mode</span>
                        High-Contrast Dark Theme
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant ml-6.5">Reduces eye strain during extended sessions.</span>
                    </div>
                    <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border-b border-surface-container-high/30">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline">notifications_active</span>
                        Execution Alerts (Desktop)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant ml-6.5">Push notifications when orders are filled.</span>
                    </div>
                    <div className="w-11 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-white rounded-full absolute right-1 top-1 shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 border-b border-surface-container-high/30">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline">volume_up</span>
                        Audio Telemetry
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant ml-6.5">Sound cues for risk limits and price alerts.</span>
                    </div>
                    <div className="w-11 h-6 bg-surface-container-high rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-surface-variant rounded-full absolute left-1 top-1 shadow-sm"></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-label-md text-label-md text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline">visibility_off</span>
                        Privacy Mode (Streamer)
                      </span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant ml-6.5">Obfuscate absolute balance figures, show percentages only.</span>
                    </div>
                    <div className="w-11 h-6 bg-surface-container-high rounded-full relative cursor-pointer shadow-inner">
                      <div className="w-4 h-4 bg-surface-variant rounded-full absolute left-1 top-1 shadow-sm"></div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'billing' && (
              <div className="flex flex-col gap-8 max-w-[650px] animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h2 className="font-headline-lg text-headline-lg text-on-surface">Allocation & Subscription</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage your current trading tier and associated capital.</p>
                </div>
                
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden">
                  <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl"></div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <span className="bg-primary text-on-primary px-2.5 py-1 rounded font-label-sm text-label-sm uppercase tracking-wider font-bold">Package 3 Active</span>
                    <span className="font-headline-lg text-headline-lg text-on-surface">$200,000 Allocation</span>
                  </div>
                  
                  <div className="flex flex-col relative z-10">
                    <h3 className="font-display-lg text-[22px] font-bold text-primary leading-tight">Elite Institutional Tier</h3>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-1.5 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px]">autorenew</span> Renews on Oct 24, 2025
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mt-2 mb-2 relative z-10">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Split</span>
                      <span className="font-headline-md text-label-md text-on-surface">90% / 10%</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Scaling</span>
                      <span className="font-headline-md text-label-md text-on-surface">Eligible for $500k</span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-2 relative z-10">
                    <button className="bg-surface-container-lowest text-on-surface border border-surface-container-high px-4 py-2.5 rounded-lg font-label-md text-label-md transition-colors hover:bg-surface-container-low shadow-sm">
                      Update Payment Method
                    </button>
                    <button className="text-error bg-error-container/30 px-4 py-2.5 rounded-lg font-label-md text-label-md transition-colors hover:bg-error-container">
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
