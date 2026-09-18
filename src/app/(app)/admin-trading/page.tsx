'use client';

import React from 'react';

export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col w-full gap-6 pb-10">
      
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-3 mb-1">
            <span className="px-2 py-0.5 rounded bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold uppercase tracking-wider">Enterprise Desk</span>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Cluster 04 • EMEA & APAC Gateway</span>
          </div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight leading-tight mb-2">Platform Administration Overview</h1>
          <p className="text-[13px] text-slate-500 max-w-2xl">
            Real-time institutional oversight across active traders, tiered capital allocations, execution latency, and ecosystem telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-[13px] font-bold rounded-lg shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[18px]">download</span>
            Export Summary CSV
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
            <span className="text-[12px] font-bold text-slate-700">System Maintenance: <span className="text-[#10B981]">Active</span></span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[13px] font-bold rounded-lg shadow-sm transition-colors">
            <span className="material-symbols-outlined text-[18px]">sync</span>
            Auto-sync (30s)
          </button>
        </div>
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
        {/* Card 1 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Platform Users</span>
            <div className="w-8 h-8 rounded bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">group</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black text-slate-900 tracking-tight">5,440</span>
              <span className="text-[12px] font-bold text-[#10B981] bg-[#ECFDF5] px-1.5 py-0.5 rounded">+12.4%</span>
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] font-medium text-slate-500">
              <span className="flex-1"><strong className="text-slate-700">4,980</strong> Active<br/>Traders</span>
              <span className="w-px h-6 bg-slate-200 mx-2"></span>
              <span className="flex-1"><strong className="text-slate-700">460</strong><br/>Affiliates</span>
            </div>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Package Subscribers</span>
            <div className="w-8 h-8 rounded bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black text-slate-900 tracking-tight">3,420</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#1D4ED8] leading-none">62.8%</span>
                <span className="text-[10px] text-[#1D4ED8] font-medium leading-tight">Total Base</span>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              <div className="w-full h-1.5 rounded-full overflow-hidden flex">
                <div className="bg-[#1D4ED8]" style={{width: '54%'}}></div>
                <div className="bg-[#3B82F6]" style={{width: '33%'}}></div>
                <div className="bg-[#F59E0B]" style={{width: '13%'}}></div>
              </div>
              <span className="text-[10px] font-medium text-slate-500">Across 3 verified institutional tiers</span>
            </div>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Funded Prop Accounts</span>
            <div className="w-8 h-8 rounded bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">account_balance</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-[32px] font-black text-slate-900 tracking-tight">1,482</span>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-[#10B981] leading-none">43.3%</span>
                <span className="text-[10px] text-[#10B981] font-medium leading-tight">Enrolled</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] font-medium text-slate-700 bg-slate-50 p-1.5 rounded-lg border border-slate-100">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px] text-slate-400">sync_alt</span> MT5 Bridge Sync</span>
              <span className="font-bold">68% Ratio</span>
            </div>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex items-start justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active In Live Market</span>
            <div className="w-8 h-8 rounded bg-[#ECFDF5] text-[#10B981] flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">sensors</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[32px] font-black text-slate-900 tracking-tight">842</span>
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse"></span>
            </div>
            <div className="flex items-center justify-between mt-3 text-[11px] font-medium text-slate-500">
              <span className="flex items-center gap-1"><span className="text-[12px] p-0.5 bg-slate-100 rounded text-slate-400 font-mono">£</span> London Fix Session</span>
              <span className="font-bold text-[#10B981]">Ultra-Low Jitter</span>
            </div>
          </div>
        </div>
      </div>

      {/* Package & Tier Breakdown Section */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col gap-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h2 className="text-[20px] font-extrabold text-slate-900">Package & Tier Breakdown</h2>
            <span className="px-2 py-0.5 rounded-full bg-[#1D4ED8] text-white text-[11px] font-bold">3,420 Paid Enrolments</span>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-bold text-slate-700">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#1D4ED8]"></span> Starter (54.1%)</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#3B82F6]"></span> Pro Trader (32.7%)</div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-[#F59E0B]"></span> Executive VIP (13.2%)</div>
          </div>
        </div>
        
        {/* Horizontal Progress Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-100">
          <div className="bg-[#1D4ED8] border-r-2 border-white" style={{width: '54.1%'}}></div>
          <div className="bg-[#3B82F6] border-r-2 border-white" style={{width: '32.7%'}}></div>
          <div className="bg-[#F59E0B]" style={{width: '13.2%'}}></div>
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Tier 1 */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#1D4ED8]"></div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold uppercase">
                <span className="material-symbols-outlined text-[14px]">school</span> Tier 1 Foundation
              </div>
              <span className="font-bold text-slate-900 text-[14px]">₹18,500<span className="text-slate-500 font-medium text-[11px]">/mo</span></span>
            </div>
            <h3 className="font-extrabold text-[16px] text-slate-900 mt-2">Starter / Foundation</h3>
            <p className="text-[12px] text-slate-500 mt-1 mb-5">60-Day Foundation Access & Core Risk Engine</p>
            
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Enrolled Members</span>
                  <span><strong className="text-slate-900">1,850</strong> (54.1%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="bg-[#1D4ED8] h-full" style={{width: '54.1%'}}></div></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold items-center py-2 border-t border-slate-200 mt-2">
                <span className="text-slate-500 font-medium">Active Retention</span>
                <span className="text-[#10B981]">94.2%</span>
              </div>
              <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-900 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm mt-1">
                Manage Members <span className="material-symbols-outlined text-[14px] text-slate-400">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Tier 2 */}
          <div className="bg-[#F8FAFC] border border-slate-200 rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#3B82F6]"></div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#EFF6FF] text-[#3B82F6] text-[10px] font-bold uppercase">
                <span className="material-symbols-outlined text-[14px]">bolt</span> Tier 2 Pro Master
              </div>
              <span className="font-bold text-slate-900 text-[14px]">₹35,000<span className="text-slate-500 font-medium text-[11px]">/mo</span></span>
            </div>
            <h3 className="font-extrabold text-[16px] text-slate-900 mt-2">Pro Trader Master</h3>
            <p className="text-[12px] text-slate-500 mt-1 mb-5">Zoom Live Execution & Dedicated Group Mentorship</p>
            
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Enrolled Members</span>
                  <span><strong className="text-slate-900">1,120</strong> (32.7%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="bg-[#3B82F6] h-full" style={{width: '32.7%'}}></div></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold items-center py-2 border-t border-slate-200 mt-2">
                <span className="text-slate-500 font-medium">Active Retention</span>
                <span className="text-[#10B981]">88.5%</span>
              </div>
              <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-900 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm mt-1">
                Manage Members <span className="material-symbols-outlined text-[14px] text-slate-400">open_in_new</span>
              </button>
            </div>
          </div>

          {/* Tier 3 */}
          <div className="bg-[#F8FAFC] border border-[#F59E0B]/30 rounded-xl p-5 flex flex-col relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#F59E0B]"></div>
            <div className="absolute -right-10 -top-10 w-32 h-32 bg-[#F59E0B]/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-[#FEF3C7] text-[#D97706] text-[10px] font-bold uppercase border border-[#FDE68A]">
                <span className="material-symbols-outlined text-[14px]">military_tech</span> Tier 3 Executive VIP
              </div>
              <span className="font-bold text-slate-900 text-[14px]">₹53,200<span className="text-slate-500 font-medium text-[11px]">/mo</span></span>
            </div>
            <h3 className="font-extrabold text-[16px] text-slate-900 mt-2">Executive VIP Desk</h3>
            <p className="text-[12px] text-slate-500 mt-1 mb-5">1-on-1 Mentorship Desk & Instant Funded Allocation</p>
            
            <div className="flex flex-col gap-3 mt-auto">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[11px] font-medium text-slate-500">
                  <span>Enrolled Members</span>
                  <span><strong className="text-slate-900">450</strong> (13.2%)</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden"><div className="bg-[#F59E0B] h-full" style={{width: '13.2%'}}></div></div>
              </div>
              <div className="flex justify-between text-[11px] font-bold items-center py-2 border-t border-slate-200 mt-2">
                <span className="text-slate-500 font-medium">Active Retention</span>
                <span className="text-[#10B981]">96.0%</span>
              </div>
              <button className="w-full py-2 bg-white border border-slate-200 rounded-lg text-[12px] font-bold text-slate-900 flex items-center justify-center gap-2 hover:bg-slate-50 transition-colors shadow-sm mt-1">
                Manage Members <span className="material-symbols-outlined text-[14px] text-slate-400">open_in_new</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Grid: Activity & Telemetry */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Updates */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col">
              <h2 className="text-[16px] font-extrabold text-slate-900">Recent Platform Updates & Member Activities</h2>
              <p className="text-[12px] text-slate-500">Continuous audit trail of membership state transitions</p>
            </div>
            <button className="text-[12px] font-bold text-[#1D4ED8] hover:underline">View Full Audit Logs</button>
          </div>
          
          <div className="flex flex-col gap-1 flex-1">
            {/* List Item 1 */}
            <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#FEF3C7] text-[#D97706] flex items-center justify-center shrink-0 border border-[#FDE68A]">
                  <span className="material-symbols-outlined text-[18px]">upgrade</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors">Marcus Vance CMT</span>
                  <span className="text-[12px] text-slate-500">Upgraded to Executive VIP Desk • Seat #042</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-slate-400">5 mins ago</span>
                <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold rounded-full w-[80px] text-center border border-[#DBEAFE]">Completed</span>
              </div>
            </div>

            {/* List Item 2 */}
            <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#ECFDF5] text-[#10B981] flex items-center justify-center shrink-0 border border-[#D1FAE5]">
                  <span className="material-symbols-outlined text-[18px]">verified</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors">Elena_FX</span>
                  <span className="text-[12px] text-slate-500">Completed Level 1 Exam • Score 98.4%</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-slate-400">22 mins ago</span>
                <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold rounded-full w-[80px] text-center border border-[#D1FAE5]">Verified</span>
              </div>
            </div>

            {/* List Item 3 */}
            <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
                  <span className="material-symbols-outlined text-[18px]">link</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors">Trader_dan82</span>
                  <span className="text-[12px] text-slate-500">MT5 Account Linked ($100k Challenge Allocation)</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-slate-400">1 hour ago</span>
                <span className="px-2.5 py-1 bg-[#ECFDF5] text-[#10B981] text-[10px] font-bold rounded-full w-[80px] text-center border border-[#D1FAE5]">Active</span>
              </div>
            </div>

            {/* List Item 4 */}
            <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#EFF6FF] text-[#1D4ED8] flex items-center justify-center shrink-0 border border-[#DBEAFE]">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors">Alex Vance</span>
                  <span className="text-[12px] text-slate-500">Joined Pro Trader Cohort • Batch Q3</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-slate-400">2 hours ago</span>
                <span className="px-2.5 py-1 bg-[#EFF6FF] text-[#1D4ED8] text-[10px] font-bold rounded-full w-[80px] text-center border border-[#DBEAFE]">Completed</span>
              </div>
            </div>
            
            {/* List Item 5 */}
            <div className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors group cursor-pointer border border-transparent hover:border-slate-100">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-[#F3F4F6] text-slate-500 flex items-center justify-center shrink-0 border border-slate-200">
                  <span className="material-symbols-outlined text-[18px]">security</span>
                </div>
                <div className="flex flex-col">
                  <span className="text-[13px] font-bold text-slate-900 group-hover:text-[#1D4ED8] transition-colors">Sentry AI Engine</span>
                  <span className="text-[12px] text-slate-500">Routine security & anti-latency scan completed</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-[11px] text-slate-400">3 hours ago</span>
                <span className="px-2.5 py-1 bg-[#F3F4F6] text-slate-600 text-[10px] font-bold rounded-full w-[80px] text-center border border-slate-200">Verified</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between border-t border-slate-100 mt-2 pt-4 text-[11px] font-medium text-slate-400">
            <span>Synced with Master Ledger</span>
            <span>Showing 5 of 184 today</span>
          </div>
        </div>

        {/* Right Column: Telemetry & Pending */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* Health & Telemetry */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[15px] font-extrabold text-slate-900">Platform Health & Telemetry</h2>
              <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#10B981]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span> Nominal
              </span>
            </div>
            
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                    <span className="material-symbols-outlined text-[16px] text-[#3B82F6]">cloud</span> Server Uptime
                  </div>
                  <span className="text-[12px] font-black text-slate-900">99.98%</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Cloudflare LD4 London Edge</span>
                  <span className="font-bold text-[#10B981]">Optimal SLA</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 pb-3 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                    <span className="material-symbols-outlined text-[16px] text-[#8B5CF6]">sync_alt</span> MT5 / FIX Bridge
                  </div>
                  <span className="text-[12px] font-black text-slate-900">Connected</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Direct Equinix NY4 Cross-Connect</span>
                  <span className="font-bold text-slate-900 font-mono">12ms ping</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-[12px] font-bold text-slate-700">
                    <span className="material-symbols-outlined text-[16px] text-[#10B981]">dns</span> Bunny Stream CDN
                  </div>
                  <span className="text-[12px] font-black text-slate-900">Healthy</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Low Latency HLS Mesh</span>
                  <span className="font-bold text-[#1D4ED8]">42 edge nodes active</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Upgrades Action Panel */}
          <div className="bg-[#1D4ED8] rounded-2xl p-6 shadow-md flex flex-col relative overflow-hidden flex-1 justify-between">
            {/* Background design */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#3B82F6]/50 rounded-full blur-2xl pointer-events-none -ml-10 -mb-10"></div>
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <span className="px-2 py-0.5 rounded bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm border border-white/10">Action Required</span>
                <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shadow-[0_0_8px_rgba(245,158,11,0.6)] animate-pulse"></span>
              </div>
              <h2 className="text-[20px] font-extrabold text-white leading-tight mb-2">Pending Package Upgrades</h2>
              <p className="text-[12px] text-white/80 leading-relaxed">
                <strong className="text-white">8 requests</strong> waiting for executive compliance validation and broker allocation keys.
              </p>
            </div>
            
            <div className="relative z-10 flex items-center gap-2 mt-6">
              <button className="flex-1 py-2.5 bg-white text-[#1D4ED8] text-[13px] font-bold rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
                Review Approvals (8)
              </button>
              <button className="w-10 h-10 bg-white/10 border border-white/20 rounded-lg flex items-center justify-center text-white hover:bg-white/20 transition-colors shrink-0">
                <span className="material-symbols-outlined text-[18px]">schedule</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </div>
  )
}
