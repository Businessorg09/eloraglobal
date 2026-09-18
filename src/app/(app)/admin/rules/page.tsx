'use client';

import { useState } from 'react';

export default function CompensationRulesPage() {
  const [lv, setLv] = useState(12500);
  const [rv, setRv] = useState(8400);

  const weakerLeg = Math.min(lv, rv);
  const pairs = Math.floor(weakerLeg / 100);
  const actualGrossPayout = pairs * 800;
  const netPayout = actualGrossPayout * 0.90; // 10% TDS+Admin

  return (
    <div className="flex flex-col w-full gap-gutter-xl pb-16">
      
      {/* Top Operational Control Strip */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-gutter-md">
        <div className="flex flex-col">
          <div className="flex items-center gap-gutter-xs">
            <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary font-bold">Rule Engine Core v4.8.2</span>
            <span className="font-label-sm text-label-sm text-outline">Runtime Slot: Production Cluster</span>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-headline-xl text-headline-xl text-on-surface">Compensation Plan Matrix & Mathematical Formulas</span>
            <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">Strict Deterministic Mode</span>
          </div>
        </div>
        
        {/* Global CTA */}
        <div className="flex items-center gap-gutter-sm flex-wrap">
          <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary transition-all shadow-md active:scale-95">
            <span className="material-symbols-outlined text-[18px]">rule_folder</span>
            <span className="font-label-md text-label-md font-bold">Save Master Plan & Apply to Next Cron</span>
          </button>
        </div>
      </div>

      {/* Realtime Formula Simulation Visual Banner */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-md">
        <div className="flex flex-col bg-surface-container-lowest p-gutter-md rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-label-sm uppercase font-semibold">1 BV Conversion</span>
            <span className="material-symbols-outlined text-[16px] text-primary">currency_rupee</span>
          </div>
          <span className="font-metric-display text-metric-display text-on-surface mt-1">₹1.00</span>
          <span className="font-body-sm text-body-sm text-tertiary mt-0.5 flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">check_circle</span> 1:1 Static Pegging Active
          </span>
        </div>
        
        <div className="flex flex-col bg-surface-container-lowest p-gutter-md rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Binary Matching Unit</span>
            <span className="material-symbols-outlined text-[16px] text-secondary">hub</span>
          </div>
          <span className="font-metric-display text-metric-display text-on-surface mt-1">₹800</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">per 100 BV matched</span>
        </div>
        
        <div className="flex flex-col bg-surface-container-lowest p-gutter-md rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Total Statutory Burden</span>
            <span className="material-symbols-outlined text-[16px] text-error">account_balance</span>
          </div>
          <span className="font-metric-display text-metric-display text-error mt-1">10.00%</span>
          <span className="font-body-sm text-body-sm text-outline mt-0.5">5% TDS + 5% Admin Charge</span>
        </div>
        
        <div className="flex flex-col bg-surface-container-lowest p-gutter-md rounded-lg shadow-sm">
          <div className="flex items-center justify-between text-outline">
            <span className="font-label-sm text-label-sm uppercase font-semibold">Next Settlement Sync</span>
            <span className="material-symbols-outlined text-[16px] text-tertiary">alarm</span>
          </div>
          <span className="font-metric-display text-metric-display text-tertiary mt-1">23:59:59</span>
          <span className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">Scheduled Daily Midnight</span>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-lg">
        {/* Left Column: Binary Engine Core */}
        <div className="xl:col-span-8 flex flex-col gap-gutter-lg">
          <div className="bg-surface-container-lowest p-gutter-lg rounded-xl shadow-sm flex flex-col gap-gutter-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-gutter-sm">
                <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-[20px]">call_split</span>
                </div>
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface">1. Binary Compensation Engine Rules</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">Dual-leg volume processing, pairing threshold triggers</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md mt-2">
              <div className="p-gutter-md bg-surface-container-low rounded-lg flex flex-col justify-between gap-3">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Binary Matching Ratio Strategy</label>
                <select className="w-full bg-surface-container-lowest px-3 py-2 rounded-lg text-body-md font-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container shadow-sm">
                  <option defaultValue="1:1">1:1 Balanced Match (Enterprise Default)</option>
                </select>
              </div>
              <div className="p-gutter-md bg-surface-container-low rounded-lg flex flex-col justify-between gap-3">
                <label className="font-label-md text-label-md text-on-surface font-semibold">Weaker Leg & Unmatched BV Logic</label>
                <div className="grid grid-cols-3 gap-1 bg-surface-container-lowest p-1 rounded-lg shadow-sm">
                  <button className="py-1.5 text-center rounded text-on-primary bg-primary font-label-sm text-label-sm font-semibold">100% Carry</button>
                  <button className="py-1.5 text-center rounded text-on-surface-variant">90-Day Exp</button>
                  <button className="py-1.5 text-center rounded text-on-surface-variant">Flush</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Engine */}
        <div className="xl:col-span-4 flex flex-col gap-gutter-lg">
          <div className="bg-surface-container-lowest p-gutter-lg rounded-xl shadow-sm flex flex-col gap-gutter-md">
            <div className="flex items-center gap-gutter-sm">
              <div className="w-8 h-8 rounded-lg bg-error/10 flex items-center justify-center text-error">
                <span className="material-symbols-outlined text-[20px]">receipt_long</span>
              </div>
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface">Statutory Tax Engine</h2>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="p-gutter-md rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Statutory TDS</span>
                  <div className="flex items-center gap-1">
                    <input className="w-14 text-right px-1.5 py-0.5 bg-surface-container-lowest rounded text-label-md font-bold text-on-surface" defaultValue="5.00" />
                    <span className="font-label-md text-outline">%</span>
                  </div>
                </div>
              </div>
              <div className="p-gutter-md rounded-lg bg-surface-container-low flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-label-md text-label-md font-semibold text-on-surface">Admin Charge</span>
                  <div className="flex items-center gap-1">
                    <input className="w-14 text-right px-1.5 py-0.5 bg-surface-container-lowest rounded text-label-md font-bold text-on-surface" defaultValue="5.00" />
                    <span className="font-label-md text-outline">%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Drawer */}
      <div className="bg-surface-container-lowest p-gutter-lg rounded-xl shadow-sm flex flex-col gap-gutter-md">
        <div className="flex items-center gap-gutter-sm">
          <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-[20px]">calculate</span>
          </div>
          <div>
            <h2 className="font-headline-md text-headline-md text-on-surface">Plan Stress-Test Calculator & Safety Payout</h2>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
          <div className="p-gutter-md bg-surface-container-low rounded-lg flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-outline font-semibold">Left Leg Volume (LV)</label>
            <div className="flex items-center gap-2">
              <input type="number" value={lv} onChange={e => setLv(Number(e.target.value))} className="w-full px-3 py-1.5 bg-surface-container-lowest rounded-lg font-mono font-bold text-on-surface text-headline-md" />
              <span className="font-label-sm text-outline">BV</span>
            </div>
          </div>
          <div className="p-gutter-md bg-surface-container-low rounded-lg flex flex-col gap-1">
            <label className="font-label-sm text-label-sm uppercase text-outline font-semibold">Right Leg Volume (RV)</label>
            <div className="flex items-center gap-2">
              <input type="number" value={rv} onChange={e => setRv(Number(e.target.value))} className="w-full px-3 py-1.5 bg-surface-container-lowest rounded-lg font-mono font-bold text-on-surface text-headline-md" />
              <span className="font-label-sm text-outline">BV</span>
            </div>
          </div>
          <div className="p-gutter-md bg-surface-container rounded-lg flex flex-col justify-center">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline font-semibold">Simulated Payout (Gross):</span>
              <span className="font-metric-display text-headline-xl text-primary font-bold">₹{actualGrossPayout.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
            </div>
            <div className="flex items-center justify-between text-body-sm text-on-surface-variant mt-1">
              <span>Net after TDS + Admin:</span>
              <span className="font-mono font-semibold text-on-surface">₹{netPayout.toLocaleString('en-IN', {minimumFractionDigits: 2})} INR</span>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
