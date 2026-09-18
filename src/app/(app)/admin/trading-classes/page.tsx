import React from 'react';
import Link from 'next/link';

export default function TradingAdminPanel() {
  return (
    <div className="flex flex-col w-full gap-8 pb-10">
      
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <Link href="/admin" className="text-outline hover:text-on-surface font-body-sm text-body-sm font-medium flex items-center gap-1 transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span>
            Back to Admin Dashboard
          </Link>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface">Trading & Masterclass Admin</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1">Manage live masterclasses, badge integrations, and trading configurations.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Live Masterclass Zoom Manager */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">videocam</span>
                Masterclass Schedules
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Manage global Zoom links for live trading sessions.</span>
            </div>
            <button className="bg-primary hover:bg-primary/90 text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 transition-colors shrink-0">
              <span className="material-symbols-outlined text-[18px]">add</span>
              Add Class
            </button>
          </div>

          <div className="overflow-x-auto rounded-lg border border-surface-container-low">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-low text-label-sm font-label-sm text-outline uppercase tracking-wider bg-surface-container-low/50">
                  <th className="py-3 px-4">Date & Time (GMT)</th>
                  <th className="py-3 px-4">Topic / Instructor</th>
                  <th className="py-3 px-4">Global Zoom URL</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-body-sm text-on-surface">
                
                <tr className="border-b border-surface-container-low hover:bg-surface-container-low/30 transition-colors">
                  <td className="py-4 px-4 font-medium">Mon 21, 14:00 GMT</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">Order Flow & Sweeps</span>
                      <span className="text-on-surface-variant text-[11px]">Marcus Vance</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <input type="text" defaultValue="https://zoom.us/j/8942201920" className="w-full bg-surface-container-lowest border border-surface-container-high rounded p-2 text-[12px] focus:outline-none focus:border-primary transition-colors" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-primary font-bold hover:underline">Update</button>
                  </td>
                </tr>

                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="py-4 px-4 font-medium">Mon 21, 18:00 GMT</td>
                  <td className="py-4 px-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-on-surface">Daily Debrief & Volume</span>
                      <span className="text-on-surface-variant text-[11px]">Kieran Price</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    <input type="text" placeholder="Paste Zoom URL..." className="w-full bg-surface-container-lowest border border-surface-container-high rounded p-2 text-[12px] focus:outline-none focus:border-primary transition-colors" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-primary font-bold hover:underline">Update</button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>

        {/* Badges Zoom Link Manager */}
        <div className="bg-surface-container-lowest rounded-xl shadow-sm p-6 flex flex-col gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col">
              <h2 className="font-headline-lg text-headline-lg text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-tertiary">workspace_premium</span>
                Badge & Module Links
              </h2>
              <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">Assign dedicated Zoom Masterclass links to specific achievements.</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-surface-container-low">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-surface-container-low text-label-sm font-label-sm text-outline uppercase tracking-wider bg-surface-container-low/50">
                  <th className="py-3 px-4">Badge ID</th>
                  <th className="py-3 px-4">Badge Title</th>
                  <th className="py-3 px-4">Dedicated Zoom Link</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="text-body-sm font-body-sm text-on-surface">
                
                <tr className="border-b border-surface-container-low hover:bg-surface-container-low/30 transition-colors">
                  <td className="py-4 px-4 font-mono text-[11px] text-outline">BADGE-002</td>
                  <td className="py-4 px-4 font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#8B5CF6] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                    </span>
                    Module One
                  </td>
                  <td className="py-4 px-4">
                    <input type="text" placeholder="https://zoom.us/j/..." className="w-full bg-surface-container-lowest border border-surface-container-high rounded p-2 text-[12px] focus:outline-none focus:border-primary transition-colors" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-primary font-bold hover:underline">Link</button>
                  </td>
                </tr>

                <tr className="border-b border-surface-container-low hover:bg-surface-container-low/30 transition-colors">
                  <td className="py-4 px-4 font-mono text-[11px] text-outline">BADGE-005</td>
                  <td className="py-4 px-4 font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#F59E0B] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">newspaper</span>
                    </span>
                    Fundamental Analyst
                  </td>
                  <td className="py-4 px-4">
                    <input type="text" placeholder="https://zoom.us/j/..." className="w-full bg-surface-container-lowest border border-surface-container-high rounded p-2 text-[12px] focus:outline-none focus:border-primary transition-colors" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-primary font-bold hover:underline">Link</button>
                  </td>
                </tr>
                
                <tr className="hover:bg-surface-container-low/30 transition-colors">
                  <td className="py-4 px-4 font-mono text-[11px] text-outline">BADGE-006</td>
                  <td className="py-4 px-4 font-bold flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-[#3B82F6] text-white flex items-center justify-center">
                      <span className="material-symbols-outlined text-[14px]">timeline</span>
                    </span>
                    Swing Trader
                  </td>
                  <td className="py-4 px-4">
                    <input type="text" placeholder="https://zoom.us/j/..." className="w-full bg-surface-container-lowest border border-surface-container-high rounded p-2 text-[12px] focus:outline-none focus:border-primary transition-colors" />
                  </td>
                  <td className="py-4 px-4 text-right">
                    <button className="text-primary font-bold hover:underline">Link</button>
                  </td>
                </tr>

              </tbody>
            </table>
          </div>

        </div>

      </div>
    </div>
  )
}
