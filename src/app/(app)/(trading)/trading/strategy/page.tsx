'use client';

import React from 'react';
import { GatedContent } from '../components/GatedContent';

export default function StrategyPage() {
  return (
    <GatedContent minPackageRequired={3} blurLevel="md" customMessage="The Strategy Lab and Case Studies are reserved for Package 3. Upgrade your subscription for full access.">
      <div className="w-full h-full font-sans">
        <div className="flex flex-col w-full max-w-[1600px] mx-auto gap-8 pb-10">
          
  {/* Header Banner & Showcase Title */}
  <section>
  <nav className="flex text-xs font-semibold text-slate-400 gap-2 mb-2">
  <a className="hover:text-brand-600 transition-colors" href="#">Elora Academy</a>
  <span>&gt;</span>
  <span className="text-brand-700 font-semibold">Trader Case Studies &amp; Document Showcase</span>
  </nav>
  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
  <div>
  <div className="flex items-center gap-2.5">
  <h1 className="text-2xl lg:text-2xl md:text-3xl font-display font-extrabold text-slate-900 tracking-tight">Trader Case Studies Showcase</h1>
  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200">84 Audited Dossiers</span>
  </div>
  <p className="text-sm text-slate-500 mt-1 max-w-3xl">
                Inspect real verified journeys from blown evaluations to high-five-figure payouts. Open any case study to read the full formatted trader dossier, risk covenants, and mechanical playbook notes.
              </p>
  </div>
  <div className="flex items-center gap-2.5 flex-shrink-0">
  <button className="inline-flex items-center gap-2 px-4 py-2 bg-brand-700 hover:bg-brand-800 text-white text-xs font-semibold rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] shadow-brand-700/20 transition" onClick={() => {}} /* openModal('modal-david') */>
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
  </svg>
  <span>Featured Reader Doc</span>
  </button>
  <button className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition">
  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8"></path>
  </svg>
  <span>Download All Notes (PDF)</span>
  </button>
  </div>
  </div>
  </section>
  {/* Multi-Criteria Filters Bar */}
  <section className="bg-white border border-slate-200 p-4 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] space-y-3">
  <div className="flex items-center justify-between flex-wrap gap-2 text-xs font-medium text-slate-500 border-b border-slate-100 pb-3">
  <div className="flex items-center gap-2">
  <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
  <svg className="w-3.5 h-3.5 text-brand-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
                Filter Showcase Dossiers:
              </span>
  </div>
  <div className="flex items-center gap-3">
  <span className="text-slate-400 text-[11px]">Showing 6 Featured Case Studies</span>
  <button className="text-brand-700 hover:underline text-[11px] font-semibold">Reset Filters</button>
  </div>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
  {/* Account Size Filter */}
  <div>
  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Funded Account Size</label>
  <div className="flex items-center gap-1.5 flex-wrap">
  <button className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-700 text-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">All Sizes</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">$50k Account</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">$100k Account</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">$200k+ Account</button>
  </div>
  </div>
  {/* Profit Range Filter */}
  <div>
  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Verified Payout Range</label>
  <div className="flex items-center gap-1.5 flex-wrap">
  <button className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-700 text-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">Any Payout</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">$10k – $30k</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">$30k – $60k</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">$60k+ Club</button>
  </div>
  </div>
  {/* Strategy Type Filter */}
  <div>
  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Execution Strategy</label>
  <div className="flex items-center gap-1.5 flex-wrap">
  <button className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-brand-700 text-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">All Strategies</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">SMC &amp; Liquidity</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">Gold Scalping</button>
  <button className="px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition">Macro Breakouts</button>
  </div>
  </div>
  </div>
  </section>
  {/* BEGIN: Showcase Cards Grid */}
  <section className="space-y-4">
  <div className="flex items-center justify-between">
  <div className="flex items-center gap-2">
  <h2 className="text-lg font-display font-bold text-slate-900">Featured Trader Stories &amp; Dossiers</h2>
  <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">100% Audited Prop Receipts</span>
  </div>
  <span className="text-xs text-slate-400 font-medium">Click any card to launch clean Notion-style reader</span>
  </div>
  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
  {/* CARD 1: David K. */}
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-brand-300 transition-all flex flex-col justify-between group">
  <div>
  {/* Header with Trader & Account Badge */}
  <div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex items-center gap-3">
  <div className="relative">
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 text-white font-bold text-base flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        DK
                      </div>
  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black">✓</span>
  </div>
  <div>
  <div className="flex items-center gap-1.5">
  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">David K.</h3>
  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-200">VERIFIED</span>
  </div>
  <p className="text-xs text-slate-400">Cohort 2023 · UK Desk</p>
  </div>
  </div>
  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold tracking-tight">
                    $200,000 Account
                  </span>
  </div>
  {/* Payout Hero Callout */}
  <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent border border-emerald-200/80 rounded-[24px] p-3.5 mb-4 flex items-center justify-between">
  <div>
  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Profit Payout</span>
  <p className="text-2xl font-display font-extrabold text-emerald-700 tracking-tight">+$46,250 <span className="text-xs font-bold text-emerald-600/80">USD</span></p>
  </div>
  <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">3 Bank Transfers</span>
  </div>
  {/* Headline / Story Title */}
  <h4 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors">
                  From 3 Blown Accounts to Consistent $46k Payouts: Mastering the 15m Asian Session Liquidity Sweep
                </h4>
  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  After burning $600k in challenge fees, David stripped away every indicator, restricted his execution to GBP/JPY London open, and imposed algorithmic 2-loss lockout covenants.
                </p>
  {/* Strategy Tags */}
  <div className="flex flex-wrap gap-1.5 mb-4">
  <span className="text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">SMC &amp; Liquidity</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">GBP/JPY</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">London Open</span>
  </div>
  {/* Metrics Pills */}
  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-[24px] border border-slate-100 text-center mb-5">
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Win Rate</span>
  <span className="text-xs font-bold text-slate-900">54.6%</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Risk:Reward</span>
  <span className="text-xs font-bold text-brand-700">1:3.4</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Days to Pass</span>
  <span className="text-xs font-bold text-slate-900">23 Days</span>
  </div>
  </div>
  </div>
  {/* Card Action Button */}
  <button className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white rounded-[24px] text-xs font-bold border border-brand-200/80 hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn shadow-xs" onClick={() => {}} /* openModal('modal-david') */>
  <span>Read Trader Story (Simple Note / Doc)</span>
  <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
  </button>
  </div>
  {/* CARD 2: Sofia Mendez */}
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-brand-300 transition-all flex flex-col justify-between group">
  <div>
  <div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex items-center gap-3">
  <div className="relative">
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-700 text-white font-bold text-base flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        SM
                      </div>
  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black">✓</span>
  </div>
  <div>
  <div className="flex items-center gap-1.5">
  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Sofia Mendez</h3>
  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-200">VERIFIED</span>
  </div>
  <p className="text-xs text-slate-400">Cohort 2023 · Madrid</p>
  </div>
  </div>
  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold tracking-tight">
                    $400,000 Account
                  </span>
  </div>
  {/* Payout Callout */}
  <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent border border-emerald-200/80 rounded-[24px] p-3.5 mb-4 flex items-center justify-between">
  <div>
  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Profit Payout</span>
  <p className="text-2xl font-display font-extrabold text-emerald-700 tracking-tight">+$92,400 <span className="text-xs font-bold text-emerald-600/80">USD</span></p>
  </div>
  <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">Scaled Combine</span>
  </div>
  {/* Headline */}
  <h4 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors">
                  Breaking the Revenge Trading Cycle: How Sofia Sized Down to 0.5% and Cleared $92k
                </h4>
  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  Suffering from sizing escalations after red days, Sofia rebuilt her mindset by treating drawdowns as planned operational overhead on EUR/USD order blocks.
                </p>
  {/* Tags */}
  <div className="flex flex-wrap gap-1.5 mb-4">
  <span className="text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">Risk Management</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">EUR/USD</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Psychology Overhaul</span>
  </div>
  {/* Metrics */}
  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-[24px] border border-slate-100 text-center mb-5">
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Win Rate</span>
  <span className="text-xs font-bold text-slate-900">59.2%</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Risk:Reward</span>
  <span className="text-xs font-bold text-brand-700">1:2.9</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Days to Pass</span>
  <span className="text-xs font-bold text-slate-900">18 Days</span>
  </div>
  </div>
  </div>
  <button className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white rounded-[24px] text-xs font-bold border border-brand-200/80 hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn shadow-xs" onClick={() => {}} /* openModal('modal-sofia') */>
  <span>Read Trader Story (Simple Note / Doc)</span>
  <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
  </button>
  </div>
  {/* CARD 3: Elena Rostova */}
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-brand-300 transition-all flex flex-col justify-between group">
  <div>
  <div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex items-center gap-3">
  <div className="relative">
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-rose-600 text-white font-bold text-base flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        ER
                      </div>
  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black">✓</span>
  </div>
  <div>
  <div className="flex items-center gap-1.5">
  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Elena Rostova</h3>
  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-200">VERIFIED</span>
  </div>
  <p className="text-xs text-slate-400">Cohort 2024 · Vienna</p>
  </div>
  </div>
  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold tracking-tight">
                    $100,000 Account
                  </span>
  </div>
  {/* Payout Callout */}
  <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent border border-emerald-200/80 rounded-[24px] p-3.5 mb-4 flex items-center justify-between">
  <div>
  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Profit Payout</span>
  <p className="text-2xl font-display font-extrabold text-emerald-700 tracking-tight">+$34,800 <span className="text-xs font-bold text-emerald-600/80">USD</span></p>
  </div>
  <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">Bi-Weekly Payout</span>
  </div>
  {/* Headline */}
  <h4 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors">
                  Scalping Gold with Zero Indicator Noise: 4-Month Transition to Full-Time Funded Desk
                </h4>
  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  Eliminating 6 lagging indicators to focus purely on 5-minute breaker blocks and high-volume session overlap sweeps on XAU/USD.
                </p>
  {/* Tags */}
  <div className="flex flex-wrap gap-1.5 mb-4">
  <span className="text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded">Gold Scalping</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">XAU/USD</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">5m Breakers</span>
  </div>
  {/* Metrics */}
  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-[24px] border border-slate-100 text-center mb-5">
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Win Rate</span>
  <span className="text-xs font-bold text-slate-900">54.0%</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Risk:Reward</span>
  <span className="text-xs font-bold text-brand-700">1:3.2</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Days to Pass</span>
  <span className="text-xs font-bold text-slate-900">14 Days</span>
  </div>
  </div>
  </div>
  <button className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white rounded-[24px] text-xs font-bold border border-brand-200/80 hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn shadow-xs" onClick={() => {}} /* openModal('modal-david') */>
  <span>Read Trader Story (Simple Note / Doc)</span>
  <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
  </button>
  </div>
  {/* CARD 4: Marcus Sterling */}
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-brand-300 transition-all flex flex-col justify-between group">
  <div>
  <div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex items-center gap-3">
  <div className="relative">
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-700 text-white font-bold text-base flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        MS
                      </div>
  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black">✓</span>
  </div>
  <div>
  <div className="flex items-center gap-1.5">
  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Marcus Sterling</h3>
  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-200">VERIFIED</span>
  </div>
  <p className="text-xs text-slate-400">Cohort 2023 · Toronto</p>
  </div>
  </div>
  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold tracking-tight">
                    $400,000 Account
                  </span>
  </div>
  {/* Payout Callout */}
  <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent border border-emerald-200/80 rounded-[24px] p-3.5 mb-4 flex items-center justify-between">
  <div>
  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Profit Payout</span>
  <p className="text-2xl font-display font-extrabold text-emerald-700 tracking-tight">+$124,000 <span className="text-xs font-bold text-emerald-600/80">USD</span></p>
  </div>
  <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">Master Trader</span>
  </div>
  {/* Headline */}
  <h4 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors">
                  High-Volatility Macro Breakouts: Capitalizing on CPI &amp; NFP Post-Release Fair Value Gaps
                </h4>
  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  Rather than gambling before news, Marcus systematically trades the 15m structural retests 30 minutes after major economic prints.
                </p>
  {/* Tags */}
  <div className="flex flex-wrap gap-1.5 mb-4">
  <span className="text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">Macro Breakouts</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">US30 / NAS100</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Post-News Retest</span>
  </div>
  {/* Metrics */}
  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-[24px] border border-slate-100 text-center mb-5">
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Win Rate</span>
  <span className="text-xs font-bold text-slate-900">48.5%</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Risk:Reward</span>
  <span className="text-xs font-bold text-brand-700">1:4.6</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Days to Pass</span>
  <span className="text-xs font-bold text-slate-900">26 Days</span>
  </div>
  </div>
  </div>
  <button className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white rounded-[24px] text-xs font-bold border border-brand-200/80 hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn shadow-xs" onClick={() => {}} /* openModal('modal-david') */>
  <span>Read Trader Story (Simple Note / Doc)</span>
  <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
  </button>
  </div>
  {/* CARD 5: Tariq S. */}
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-brand-300 transition-all flex flex-col justify-between group">
  <div>
  <div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex items-center gap-3">
  <div className="relative">
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white font-bold text-base flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        TS
                      </div>
  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black">✓</span>
  </div>
  <div>
  <div className="flex items-center gap-1.5">
  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Tariq S.</h3>
  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-200">VERIFIED</span>
  </div>
  <p className="text-xs text-slate-400">Cohort 2024 · Dubai</p>
  </div>
  </div>
  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold tracking-tight">
                    $50,000 Account
                  </span>
  </div>
  {/* Payout Callout */}
  <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent border border-emerald-200/80 rounded-[24px] p-3.5 mb-4 flex items-center justify-between">
  <div>
  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Profit Payout</span>
  <p className="text-2xl font-display font-extrabold text-emerald-700 tracking-tight">+$18,500 <span className="text-xs font-bold text-emerald-600/80">USD</span></p>
  </div>
  <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">First Time Pass</span>
  </div>
  {/* Headline */}
  <h4 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors">
                  Transitioning from Unregulated Crypto Swing to Institutional Forex Order Flow
                </h4>
  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  Leaving behind 20x leverage addiction for strict 1:2.8 risk-reward parameters and algorithmic Asian session sweeps on EUR/USD.
                </p>
  {/* Tags */}
  <div className="flex flex-wrap gap-1.5 mb-4">
  <span className="text-[10px] font-bold bg-brand-50 text-brand-700 border border-brand-200 px-2 py-0.5 rounded">SMC Order Flow</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">EUR/USD</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">12-Week Run</span>
  </div>
  {/* Metrics */}
  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-[24px] border border-slate-100 text-center mb-5">
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Win Rate</span>
  <span className="text-xs font-bold text-slate-900">62.0%</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Risk:Reward</span>
  <span className="text-xs font-bold text-brand-700">1:2.8</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Days to Pass</span>
  <span className="text-xs font-bold text-slate-900">16 Days</span>
  </div>
  </div>
  </div>
  <button className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white rounded-[24px] text-xs font-bold border border-brand-200/80 hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn shadow-xs" onClick={() => {}} /* openModal('modal-david') */>
  <span>Read Trader Story (Simple Note / Doc)</span>
  <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
  </button>
  </div>
  {/* CARD 6: Liam Parker */}
  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] hover:border-brand-300 transition-all flex flex-col justify-between group">
  <div>
  <div className="flex items-start justify-between gap-3 mb-4">
  <div className="flex items-center gap-3">
  <div className="relative">
  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-800 text-white font-bold text-base flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
                        LP
                      </div>
  <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center text-white text-[8px] font-black">✓</span>
  </div>
  <div>
  <div className="flex items-center gap-1.5">
  <h3 className="font-bold text-slate-900 text-base group-hover:text-brand-700 transition-colors">Liam Parker</h3>
  <span className="px-1.5 py-0.2 bg-emerald-50 text-emerald-700 text-[10px] font-extrabold rounded border border-emerald-200">VERIFIED</span>
  </div>
  <p className="text-xs text-slate-400">Cohort 2023 · Melbourne</p>
  </div>
  </div>
  <span className="px-2.5 py-1 bg-slate-100 text-slate-800 border border-slate-200 rounded-lg text-xs font-bold tracking-tight">
                    $100,000 Account
                  </span>
  </div>
  {/* Payout Callout */}
  <div className="bg-gradient-to-r from-emerald-50 via-emerald-50/50 to-transparent border border-emerald-200/80 rounded-[24px] p-3.5 mb-4 flex items-center justify-between">
  <div>
  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">Total Profit Payout</span>
  <p className="text-2xl font-display font-extrabold text-emerald-700 tracking-tight">+$26,900 <span className="text-xs font-bold text-emerald-600/80">USD</span></p>
  </div>
  <span className="text-[11px] font-semibold text-emerald-700 bg-white px-2 py-1 rounded-md border border-emerald-200 shadow-2xs">2 Payout Runs</span>
  </div>
  {/* Headline */}
  <h4 className="font-bold text-slate-900 text-base leading-snug mb-2 group-hover:text-brand-700 transition-colors">
                  Overcoming Trade Entry Paralysis: Building an Asymmetric Execution Checklist
                </h4>
  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                  How an engineer conquered chronic hesitation by automating pre-flight market structure rules on US30 indices.
                </p>
  {/* Tags */}
  <div className="flex flex-wrap gap-1.5 mb-4">
  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded">Indices / US30</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Checklists</span>
  <span className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">Asymmetric R:R</span>
  </div>
  {/* Metrics */}
  <div className="grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-[24px] border border-slate-100 text-center mb-5">
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Win Rate</span>
  <span className="text-xs font-bold text-slate-900">49.0%</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Risk:Reward</span>
  <span className="text-xs font-bold text-brand-700">1:4.1</span>
  </div>
  <div>
  <span className="text-[10px] text-slate-400 font-medium block">Days to Pass</span>
  <span className="text-xs font-bold text-slate-900">19 Days</span>
  </div>
  </div>
  </div>
  <button className="w-full py-2.5 px-4 bg-brand-50 hover:bg-brand-700 text-brand-700 hover:text-white rounded-[24px] text-xs font-bold border border-brand-200/80 hover:border-transparent transition-all flex items-center justify-center gap-2 group/btn shadow-xs" onClick={() => {}} /* openModal('modal-david') */>
  <span>Read Trader Story (Simple Note / Doc)</span>
  <svg className="w-3.5 h-3.5 transform group-hover/btn:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
  <path d="M14 5l7 7m0 0l-7 7m7-7H3" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"></path>
  </svg>
  </button>
  </div>
  </div>
  </section>
  {/* END: Showcase Cards Grid */}
  {/* Footer Callout / Submission */}
  <section className="bg-gradient-to-r from-brand-900 via-brand-800 to-indigo-900 rounded-2xl p-7 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
  <div className="space-y-1.5">
  <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-200 text-xs font-bold rounded-full border border-blue-400/30">
              Open Submissions Cohort 2024
            </span>
  <h3 className="text-xl font-display font-bold">Have you cleared a funded prop firm evaluation?</h3>
  <p className="text-xs text-blue-200/90 max-w-xl">
              Submit your audited trade history to be featured in the Elora Trader Case Studies Vault. Certified authors receive lifetime desk access and $1,200 mentor contribution stipends.
            </p>
  </div>
  <button className="px-5 py-2.5 bg-white hover:bg-blue-50 text-brand-900 text-xs font-bold rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition whitespace-nowrap">
            Submit Your Case Dossier →
          </button>
  </section>
  
        </div>
      </div>
    </GatedContent>
  )
}
