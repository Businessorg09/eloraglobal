'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ModuleUploadPage() {
  const [activeTab, setActiveTab] = useState<'direct' | 'stream'>('direct');
  const [activeTier, setActiveTier] = useState<'1' | '2' | '3'>('2');
  const [episodeTitle, setEpisodeTitle] = useState(
    'Episode 05: Internal vs External Liquidity Pools & Time-Price Displacement'
  );
  const [activeTrack, setActiveTrack] = useState('order-flow');
  const [publishState, setPublishState] = useState<'idle' | 'loading' | 'done'>('idle');

  const handlePublish = () => {
    setPublishState('loading');
    setTimeout(() => {
      setPublishState('done');
      setTimeout(() => setPublishState('idle'), 2500);
    }, 1200);
  };

  const tiers = [
    {
      id: '1',
      label: 'Tier 01',
      name: 'Starter / Foundation',
      desc: 'Base curriculum. Automatically available to all Tier 1, Tier 2, and Tier 3 registered members.',
      reach: '5,440 Traders',
      badge: 'Inherited by All Upper Tiers',
      badgeIcon: 'check_circle',
      badgeColor: 'text-emerald-600',
    },
    {
      id: '2',
      label: 'Tier 02',
      name: 'Pro Trader Master',
      desc: 'Includes full order flow matrix. Locked for Starter members; unlocked for Tier 2 and Tier 3 Executive desks.',
      reach: '2,020 Traders',
      badge: 'Unlocks for Pro & Executive',
      badgeIcon: 'lock_open',
      badgeColor: 'text-blue-700',
    },
    {
      id: '3',
      label: 'Tier 03',
      name: 'Executive VIP Desk',
      desc: 'Proprietary algorithmic execution strategies. Strictly restricted to qualified VIP and Diamond executives.',
      reach: '450 VIP Desks',
      badge: 'VIP Desk Restricted Only',
      badgeIcon: 'workspace_premium',
      badgeColor: 'text-slate-500',
    },
  ];

  const tracks = [
    { id: 'order-flow', icon: 'candlestick_chart', label: 'Order Flow & SMC' },
    { id: 'price-action', icon: 'show_chart', label: 'Price Action Dynamics' },
    { id: 'quant', icon: 'calculate', label: 'Quant & Delta Hedging' },
    { id: 'psychology', icon: 'psychology', label: 'Institutional Psychology' },
  ];

  const checklist = [
    { label: 'DRM Token Encryption Key', value: '256-BIT', passed: true },
    { label: 'Adaptive HLS Bitrates Generated', value: '4 RENDITIONS', passed: true },
    { label: 'Dynamic Watermark Stamp', value: 'ACTIVE', passed: true },
    { label: 'Package Matrix Permissions', value: 'TIER 2 & 3', passed: true },
  ];

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen overflow-y-auto">
      {/* Page Content */}
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Breadcrumb & Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Link href="/admin-trading" className="hover:text-blue-700 flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[14px]">home</span>
                Admin Studio
              </Link>
              <span className="text-slate-300">/</span>
              <Link href="/admin-trading/courses" className="hover:text-blue-700 transition-colors">
                Courses & CMS
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">Module Uploader</span>
            </div>

            {/* Title Row */}
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight leading-tight">
                Dedicated Module & Episode Upload Studio
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-bold uppercase tracking-wide">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                Elora Stream V3.4
              </span>
            </div>
            <p className="text-slate-500 text-sm max-w-2xl mt-0.5">
              Publish institutional-grade video masterclasses, attach cryptographic PDF playbooks, and map
              role-based package entitlements via a streamlined pipeline.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden xl:flex flex-col items-end px-3 py-2 bg-white rounded-lg border border-slate-200 shadow-sm mr-1">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[12px] font-semibold text-slate-800">Bunny Stream Edge: Active</span>
              </div>
              <span className="text-[11px] text-slate-500">AES-128 DRM Enforced • Global PoP Online</span>
            </div>
            <button className="px-4 py-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-semibold shadow-sm transition-all flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
              Reset
            </button>
            <button className="px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-sm font-semibold transition-all flex items-center gap-1.5 border border-blue-100">
              <span className="material-symbols-outlined text-[18px]">save</span>
              Draft
            </button>
            <button
              onClick={handlePublish}
              className="px-5 py-2 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
            >
              <span className={`material-symbols-outlined text-[18px] ${publishState === 'loading' ? 'animate-spin' : ''}`}>
                {publishState === 'loading' ? 'sync' : publishState === 'done' ? 'check_circle' : 'rocket_launch'}
              </span>
              {publishState === 'loading' ? 'Deploying...' : publishState === 'done' ? 'Published!' : 'Publish Episode'}
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

          {/* LEFT: Steps */}
          <div className="xl:col-span-8 flex flex-col gap-5">

            {/* ── STEP 1: Module & Episode Architecture ── */}
            <section className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    01
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-slate-900">Module & Episode Architecture</p>
                    <p className="text-xs text-slate-500">Classify the pedagogical syllabus hierarchy and timing</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[11px] font-semibold">
                  Step 1 of 4
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Module Selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                    Target Module Catalog
                    <a href="#" className="text-[#1D4ED8] hover:underline text-[11px] normal-case font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[13px]">create_new_folder</span>
                      + New Module
                    </a>
                  </label>
                  <div className="relative">
                    <select className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 cursor-pointer appearance-none pr-9 transition">
                      <option>Module 02: Liquidity Sweeps &amp; Fair Value Gaps (FVG)</option>
                      <option>Module 01: Candlestick Microstructure &amp; Order Flow Delta</option>
                      <option>Module 03: Algorithmic Institutional Risk Architecture</option>
                      <option>Module 04: Intermarket Central Bank Divergence Matrix</option>
                      <option>Module 05: Behavioral Edge &amp; High-Velocity Execution</option>
                    </select>
                    <span className="material-symbols-outlined absolute right-3 top-2.5 text-slate-400 pointer-events-none text-[20px]">
                      unfold_more
                    </span>
                  </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                    Duration Benchmark
                    <span className="text-slate-400 text-[11px] normal-case font-normal">Used for analytics completion rate</span>
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">schedule</span>
                    <input
                      type="text"
                      defaultValue="45 Minutes 20 Seconds"
                      className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                {/* Episode Title — full width */}
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                    Episode Designation & Masterclass Headline
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">movie</span>
                    <input
                      type="text"
                      value={episodeTitle}
                      onChange={(e) => setEpisodeTitle(e.target.value)}
                      className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-400 transition"
                    />
                  </div>
                </div>

                {/* Track Pills — full width */}
                <div className="flex flex-col gap-2 md:col-span-2">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                    Specialized Trading Track
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {tracks.map((track) => (
                      <button
                        key={track.id}
                        type="button"
                        onClick={() => setActiveTrack(track.id)}
                        className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold flex items-center gap-1.5 transition-all ${
                          activeTrack === track.id
                            ? 'bg-[#1D4ED8] text-white shadow-sm'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[15px]">{track.icon}</span>
                        {track.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ── STEP 2: Video Asset Ingestion ── */}
            <section className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    02
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-slate-900">Video Asset Ingestion Station</p>
                    <p className="text-xs text-slate-500">Deploy direct master files or link high-throughput HLS/M3U8 edge manifests</p>
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex items-center gap-0.5 bg-slate-100 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setActiveTab('direct')}
                    className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${
                      activeTab === 'direct' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Direct Upload
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('stream')}
                    className={`px-3 py-1 rounded-md text-[12px] font-bold transition-all ${
                      activeTab === 'stream' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    Stream Link / CDN
                  </button>
                </div>
              </div>

              {activeTab === 'direct' ? (
                <div className="flex flex-col gap-4">
                  {/* Drop Zone */}
                  <div className="group flex flex-col items-center justify-center p-8 bg-slate-50 hover:bg-blue-50/40 border-2 border-dashed border-slate-200 hover:border-blue-300 rounded-xl transition-all cursor-pointer text-center">
                    <div className="w-14 h-14 rounded-2xl bg-white group-hover:scale-105 shadow-sm border border-slate-200 flex items-center justify-center text-[#1D4ED8] mb-3 transition-transform">
                      <span className="material-symbols-outlined text-[32px]">cloud_upload</span>
                    </div>
                    <p className="font-semibold text-slate-800 text-sm">
                      Drag & drop master video lecture here, or{' '}
                      <span className="text-[#1D4ED8] underline underline-offset-2">browse files</span>
                    </p>
                    <p className="text-slate-500 text-xs mt-1 max-w-md">
                      Encodes to adaptive HLS 1080p/60 with automated AV1/H.265 packaging. Supports ProRes, MP4, MOV up to 12.0 GB.
                    </p>
                    <div className="mt-3 flex items-center gap-2 flex-wrap justify-center">
                      {['MP4', 'Apple ProRes', 'MOV / QuickTime', 'HEVC H.265'].map((f) => (
                        <span key={f} className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-500 text-[11px] font-semibold">
                          {f}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Uploaded File Card */}
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[22px]">videocam</span>
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="font-semibold text-[13px] text-slate-900 truncate">
                            EURUSD_Liquidity_Displacement_Ep05_ProResHQ.mp4
                          </span>
                          <span className="text-[12px] text-slate-500">1.42 GB • 1080p 60fps • Bitrate: 18.2 Mbps</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 ml-2">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[14px]">verified</span>
                          100% Ingested & DRM Protected
                        </span>
                        <button className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition flex items-center justify-center">
                          <span className="material-symbols-outlined text-[18px]">delete</span>
                        </button>
                      </div>
                    </div>
                    {/* Progress */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#1D4ED8] h-1.5 rounded-full w-full"></div>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>Transcoding Matrix: 1080p, 720p, 480p Adaptive Profiles Ready</span>
                      <span className="text-emerald-600 font-bold">Ready to Stream</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">
                    HLS / M3U8 Stream URL or CDN Manifest
                  </label>
                  <div className="relative flex items-center">
                    <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">link</span>
                    <input
                      type="text"
                      placeholder="https://stream.bunnycdn.com/your-library-id/video-guid/playlist.m3u8"
                      className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500">Paste a Bunny Stream, Cloudflare Stream, Vimeo OTT, or custom HLS edge manifest URL.</p>
                </div>
              )}

              {/* Security Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { label: 'Dynamic Forensic DRM', desc: 'Burn subtle Trader ID, IP, & timestamp watermark' },
                  { label: 'Adaptive Speed Suite', desc: 'Permit 0.5x, 1.0x, 1.25x, 1.5x, 2.0x playback' },
                  { label: 'Whisper AI Subtitles', desc: 'Auto-generate English, Spanish & French VTT' },
                ].map((toggle) => (
                  <label key={toggle.label} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-2.5 cursor-pointer hover:bg-blue-50/30 hover:border-blue-200 transition-colors">
                    <input defaultChecked type="checkbox" className="mt-0.5 accent-blue-700 rounded w-4 h-4 shrink-0" />
                    <div className="flex flex-col">
                      <span className="text-[12px] font-bold text-slate-800">{toggle.label}</span>
                      <span className="text-[11px] text-slate-500 leading-tight">{toggle.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>

            {/* ── STEP 3: PDF Playbook ── */}
            <section className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    03
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-slate-900">PDF Strategy Playbook & Assignment Brief</p>
                    <p className="text-xs text-slate-500">Attach executive trade notes, quantitative backtests, and homework markups</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[11px] font-semibold">
                  Encrypted PDF Only
                </span>
              </div>

              {/* PDF Drop Area */}
              <div className="flex flex-col md:flex-row gap-4 items-center p-4 bg-red-50/50 hover:bg-red-50 border border-red-100 hover:border-red-200 rounded-xl transition-colors cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[26px]">picture_as_pdf</span>
                </div>
                <div className="flex flex-col flex-1 text-center md:text-left">
                  <span className="font-semibold text-slate-800 text-sm">Upload Strategy Playbook (.PDF)</span>
                  <span className="text-xs text-slate-500">Drop the annotated slide deck, institutional cheatsheet, or case study (Max 50MB)</span>
                </div>
                <button className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold border border-slate-200 shadow-sm shrink-0 transition">
                  Select Document
                </button>
              </div>

              {/* Uploaded PDF */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-[#1D4ED8] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[20px]">description</span>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-[13px] text-slate-900 truncate">
                        Elora_Ep05_Institutional_Order_Flow_Playbook_v5.2.pdf
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-slate-200 text-slate-600 text-[10px] font-bold shrink-0">24 Pages</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                      <span>8.4 MB</span>
                      <span>•</span>
                      <span className="text-emerald-600 flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        Personalized Watermark & Screen Anti-Capture Configured
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
                  <button className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-[#1D4ED8] text-[12px] font-bold border border-slate-200 flex items-center gap-1 transition">
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                    Preview
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-600 text-[12px] font-bold border border-slate-200 flex items-center gap-1 transition">
                    <span className="material-symbols-outlined text-[15px]">cached</span>
                    Replace
                  </button>
                  <button className="w-8 h-8 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>

              {/* TradingView Assignment */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide flex items-center justify-between">
                  Interactive Student TradingView Chart Assignment
                  <span className="text-slate-400 text-[11px] normal-case font-normal">Optional task submission requirement</span>
                </label>
                <div className="relative flex items-center">
                  <span className="material-symbols-outlined absolute left-3 text-slate-400 text-[18px]">add_link</span>
                  <input
                    type="text"
                    defaultValue="https://www.tradingview.com/chart/EURUSD/hw-assignment-liquidity-pool-markup-ep5"
                    className="w-full bg-[#F8FAFC] border border-slate-200 text-slate-800 pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Enrolled students will be prompted to submit their chart snapshot before marking this episode 100% complete.
                </p>
              </div>
            </section>

            {/* ── STEP 4: Package & Tier Access ── */}
            <section className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center text-sm font-bold shadow-sm">
                    04
                  </div>
                  <div>
                    <p className="font-bold text-[15px] text-slate-900">Distributor & Student Package Entitlement</p>
                    <p className="text-xs text-slate-500">Determine which tier unlocks this content with automatic upward inheritance</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
                  Multi-Tier Sync
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiers.map((tier) => {
                  const isActive = activeTier === tier.id;
                  return (
                    <div
                      key={tier.id}
                      onClick={() => setActiveTier(tier.id as '1' | '2' | '3')}
                      className={`p-4 rounded-xl cursor-pointer transition-all flex flex-col justify-between gap-3 border ${
                        isActive
                          ? 'bg-blue-50 border-blue-300 shadow-md'
                          : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isActive ? 'bg-[#1D4ED8] text-white' : 'bg-slate-200 text-slate-600'
                          }`}>
                            {isActive ? `${tier.label} SELECTED` : tier.label}
                          </span>
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition ${
                            isActive ? 'border-[#1D4ED8] bg-[#1D4ED8]' : 'border-slate-300 bg-white'
                          }`}>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white"></div>}
                          </div>
                        </div>
                        <span className="font-bold text-[14px] text-slate-900 mt-0.5">{tier.name}</span>
                        <p className="text-[12px] text-slate-500 leading-snug">{tier.desc}</p>
                      </div>
                      <div className="flex flex-col gap-1 pt-2 border-t border-slate-200">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-slate-500">Audience Reach</span>
                          <span className="font-bold text-slate-800">{tier.reach}</span>
                        </div>
                        <span className={`text-[11px] flex items-center gap-1 font-semibold ${tier.badgeColor}`}>
                          <span className="material-symbols-outlined text-[13px]">{tier.badgeIcon}</span>
                          {tier.badge}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* RIGHT: Preview Panel */}
          <div className="xl:col-span-4 flex flex-col gap-5 sticky top-6">

            {/* Student View Simulator */}
            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-900">
                  <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">smart_display</span>
                  <span className="font-bold text-[14px]">Student View Simulator</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                  Live Preview
                </span>
              </div>

              {/* Video Thumbnail */}
              <div className="relative rounded-xl overflow-hidden shadow-md group">
                <div
                  className="w-full h-44 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage:
                      "url('https://lh3.googleusercontent.com/aida-public/AB6AXuC5IfVaD9PDMSx0VYHYD7jNozTd3yS5aeMJXYIF2NkPCgwNjfK0TCvjL28X5V4X9kwmaZtaGAVv8QvIwrtBA75CnH5JFdV2JAW8gAuzJgNInMXRMlvZAG5k9eWZ7kmppVtHN8Z8Q4_eSnBwbFVcxh-4eMAnz6VvDun424QgVWex_PHOZV8kzADKE2pjeCSL-oAE7Yk_DRntTpTFialHUDe7Y0qGweKGNoup_pYXBPptXKdRmPGniX1rTg')",
                  }}
                ></div>
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/30 to-transparent flex flex-col justify-between p-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-700/90 backdrop-blur text-white text-[10px] font-bold">
                      1080p60 FHD
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur text-slate-200 text-[10px] font-bold">
                      DRM: ACTIVE
                    </span>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-blue-700/90 text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <span className="material-symbols-outlined text-[28px] ml-0.5">play_arrow</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-white text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                      <span>Audio: English (Dolby Stereo)</span>
                    </div>
                    <span className="font-bold">45:20</span>
                  </div>
                </div>
              </div>

              {/* Episode Metadata */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 text-[11px] font-bold border border-blue-100">
                    MODULE 02 • EPISODE 05
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-[11px] font-semibold">
                    Pro & VIP
                  </span>
                </div>
                <h3 className="font-bold text-[14px] text-slate-900 leading-tight mt-0.5">
                  {episodeTitle || 'Untitled Masterclass Episode'}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-6 h-6 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center text-[10px] font-bold">
                    MV
                  </div>
                  <span className="text-[12px] text-slate-500">Senior Faculty: Marcus Vance, CMT</span>
                </div>
              </div>

              {/* Attached Materials */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex flex-col gap-2">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                  Included Resources (2 Assets)
                </span>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-red-500 text-[16px]">picture_as_pdf</span>
                    <span className="truncate text-slate-700">Order Flow Playbook v5.2</span>
                  </div>
                  <span className="text-slate-500 shrink-0">8.4 MB</span>
                </div>
                <div className="flex items-center justify-between text-[12px]">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="material-symbols-outlined text-blue-500 text-[16px]">query_stats</span>
                    <span className="truncate text-slate-700">TradingView Markup Homework</span>
                  </div>
                  <span className="text-emerald-600 font-bold shrink-0">Required</span>
                </div>
              </div>
            </div>

            {/* Pre-Flight Checklist */}
            <div className="p-5 bg-white rounded-2xl border border-slate-100 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[14px] text-slate-900">Pre-Flight Validation</span>
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 border border-emerald-100 text-emerald-700 text-[11px] font-bold">
                  4 of 4 Passed
                </span>
              </div>

              <div className="flex flex-col gap-1.5">
                {checklist.map((item) => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-emerald-500 text-[18px]">check_circle</span>
                      <span className="text-[13px] text-slate-700">{item.label}</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono font-bold">{item.value}</span>
                  </div>
                ))}
              </div>

              {/* Deploy CTA */}
              <div className="flex flex-col gap-2 pt-1">
                <button
                  type="button"
                  onClick={handlePublish}
                  className="w-full py-3 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <span className={`material-symbols-outlined text-[20px] ${publishState === 'loading' ? 'animate-spin' : ''}`}>
                    {publishState === 'loading' ? 'sync' : publishState === 'done' ? 'check_circle' : 'publish'}
                  </span>
                  {publishState === 'loading' ? 'Deploying...' : publishState === 'done' ? 'Successfully Published!' : 'Execute Instant Deployment'}
                </button>
                <p className="text-center text-[11px] text-slate-500">
                  Propagates to 310+ Global Cloudflare PoPs in under 4 seconds.
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
