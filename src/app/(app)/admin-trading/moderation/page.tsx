'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
type Channel = 'all-desks' | 'gold-macro-desk' | 'trade-setups' | 'prop-payout-verification' | 'algo-code';

interface BlacklistKeyword {
  id: string;
  label: string;
}

// ─── Static Data ──────────────────────────────────────────────────────────────
const INITIAL_KEYWORDS: BlacklistKeyword[] = [
  { id: '1', label: 't.me/' },
  { id: '2', label: 'whatsapp.com' },
  { id: '3', label: 'guaranteed profit' },
  { id: '4', label: 'signal group' },
  { id: '5', label: 'pass challenge for money' },
  { id: '6', label: 'tip account' },
];

const CHANNELS: { id: Channel; label: string }[] = [
  { id: 'all-desks', label: '#all-desks' },
  { id: 'gold-macro-desk', label: '#gold-macro-desk' },
  { id: 'trade-setups', label: '#trade-setups' },
  { id: 'prop-payout-verification', label: '#prop-payout-verification' },
  { id: 'algo-code', label: '#algo-code' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function CommunityModerationPage() {
  const [activeChannel, setActiveChannel] = useState<Channel>('all-desks');
  const [keywords, setKeywords] = useState<BlacklistKeyword[]>(INITIAL_KEYWORDS);
  const [newKeyword, setNewKeyword] = useState('');
  const [post1Deleted, setPost1Deleted] = useState(false);
  const [post4Resolved, setPost4Resolved] = useState(false);
  const [post1Editing, setPost1Editing] = useState(false);
  const [post1Text, setPost1Text] = useState(
    'Guys join my VIP telegram t.me/pumpsignals for 100% daily guaranteed profit on XAU/USD! Passing prop challenges in 24 hours guaranteed hit my DM!'
  );
  const [muted99, setMuted99] = useState<string | null>(null);
  const [notifSent, setNotifSent] = useState(false);
  const [unpinned2, setUnpinned2] = useState(false);

  const removeKeyword = (id: string) => {
    setKeywords((prev) => prev.filter((k) => k.id !== id));
  };

  const addKeyword = () => {
    if (!newKeyword.trim()) return;
    setKeywords((prev) => [...prev, { id: Date.now().toString(), label: newKeyword.trim() }]);
    setNewKeyword('');
  };

  const handleMute = (user: string, duration: string) => {
    setMuted99(`${user} muted for ${duration}`);
    setTimeout(() => setMuted99(null), 3000);
  };

  const handlePushNotify = () => {
    setNotifSent(true);
    setTimeout(() => setNotifSent(false), 3000);
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen overflow-y-auto">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* Toast notification */}
        {muted99 && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-semibold shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
            {muted99}
          </div>
        )}
        {notifSent && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-semibold shadow-xl flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-emerald-400">send</span>
            Push notification dispatched to 3,420 Active Guild Mobile Terminals.
          </div>
        )}

        {/* ── Page Header ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
              <Link href="/admin-trading" className="hover:text-blue-700 transition-colors">Control Workspace</Link>
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              <span>Community Governance</span>
              <span className="material-symbols-outlined text-[13px]">chevron_right</span>
              <span className="text-[#1D4ED8]">Trader Guild Moderation Hub</span>
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-0.5">
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Trader Guild Moderation Command Center</h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-50 border border-red-100">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span className="text-red-700 text-[11px] font-bold">Automated Auto-Mod: 3 Flags Requiring Review</span>
              </div>
            </div>
          </div>

          {/* Admin Meta + Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-200">
              <div className="w-7 h-7 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-[11px]">CA</div>
              <div className="flex flex-col">
                <span className="text-[11px] font-bold text-slate-800 leading-tight">Chief Architect</span>
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider">Super Admin</span>
              </div>
            </div>
            <button className="px-4 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[12px] font-bold flex items-center gap-1.5 shadow-md transition-all">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Review Flags (3)
            </button>
            <button className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[12px] font-bold flex items-center gap-1.5 border border-slate-200 transition-all">
              <span className="material-symbols-outlined text-[16px]">campaign</span>
              Broadcast Desk Alert
            </button>
          </div>
        </div>

        {/* ── KPI Metrics ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {/* Metric 1 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Guild Activity Volume</p>
                <p className="text-[32px] font-bold text-slate-900 mt-0.5 leading-none">1,842</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">forum</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Daily Active Discussions</span>
              <span className="flex items-center gap-0.5 text-emerald-600 font-bold">
                <span className="material-symbols-outlined text-[15px]">trending_up</span>+18.4%
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate">#gold-macro • #algo-sharing • #prop-payouts</p>
          </div>

          {/* Metric 2 */}
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Flags Requiring Review</p>
                <p className="text-[32px] font-bold text-red-600 mt-0.5 leading-none">3</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Off-Platform Link Probes</span>
              <span className="text-red-600 font-bold">Critical SLA</span>
            </div>
            <p className="text-[11px] text-slate-400">Avg response threshold: 4.2 mins</p>
          </div>

          {/* Metric 3 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sanctions & Enforcement</p>
                <p className="text-[32px] font-bold text-slate-900 mt-0.5 leading-none">7</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">gavel</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Active Account Mutes</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold text-[10px]">24h / 7d</span>
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px]">check_circle</span>
              0 Suspended MT5 Bridges
            </p>
          </div>

          {/* Metric 4 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Auto-Mod Sentry Health</p>
                <p className="text-[32px] font-bold text-emerald-600 mt-0.5 leading-none">99.4%</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[22px]">radar</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[12px]">
              <span className="text-slate-500">Regex & OCR Filter</span>
              <span className="text-emerald-600 font-bold">Active & Learning</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full" style={{ width: '99.4%' }}></div>
            </div>
          </div>
        </div>

        {/* ── Channel Filter Toolbar ───────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider px-1">Filter By Channel:</span>
            {CHANNELS.map((ch) => (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                  activeChannel === ch.id
                    ? 'bg-[#1D4ED8] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
              <span className="material-symbols-outlined text-[15px]">tune</span>
              Sentry AI Rules
            </button>
            <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
              <span className="material-symbols-outlined text-[15px]">file_download</span>
              Export Disciplinary CSV
            </button>
          </div>
        </div>

        {/* ── Main Grid: Feed + Sidebar ────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">

          {/* ── LEFT: Moderation Feed (8 cols) ─────────────────────────────── */}
          <div className="xl:col-span-8 flex flex-col gap-4">

            {/* Feed control strip */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white rounded-2xl border border-slate-100 shadow-sm px-4 py-3">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold text-slate-900">Guild Moderation Stream</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#1D4ED8] text-white text-[10px] font-bold">4 Live Cards</span>
              </div>
              <div className="flex items-center gap-2">
                <select className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[12px] font-semibold outline-none cursor-pointer">
                  <option>Status: Flagged by AI Sentry</option>
                  <option>Status: All Live Posts</option>
                  <option>Status: User Reported (2)</option>
                  <option>Status: Audited & Pinned</option>
                </select>
                <select className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-[12px] font-semibold outline-none cursor-pointer">
                  <option>Tier: All Tiers</option>
                  <option>Tier 1 Starter</option>
                  <option>Tier 2 Pro Builder</option>
                  <option>Tier 3 Executive VIP</option>
                </select>
              </div>
            </div>

            {/* ── POST 1: Critical Flagged Spam ── */}
            {!post1Deleted && (
              <div className="bg-white rounded-2xl border border-red-200 shadow-sm p-5 flex flex-col gap-4">
                {/* Alert Banner */}
                <div className="flex items-center justify-between bg-red-50 border border-red-100 px-4 py-2.5 rounded-xl">
                  <div className="flex items-center gap-2 text-red-700 text-[12px] font-bold">
                    <span className="material-symbols-outlined text-[18px]">emergency</span>
                    Sentry AI Flag: External Telegram URL detected + Guaranteed Return claim
                  </div>
                  <span className="px-2.5 py-0.5 rounded-lg bg-red-600 text-white text-[10px] font-bold uppercase tracking-wide">
                    Confidence: 99.8%
                  </span>
                </div>

                {/* Author */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[13px]">CT</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-[14px]">cryptotrader99</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">Tier 1 Starter</span>
                        <span className="text-slate-400 text-[11px] font-mono">MT5 #48291</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                        <span>#gold-macro-desk</span>
                        <span>•</span>
                        <span>14 mins ago</span>
                        <span>•</span>
                        <span className="text-red-600 font-semibold">Joined 3 days ago</span>
                      </div>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 text-[11px] font-semibold shrink-0">
                    Flagged in Auto-Queue
                  </span>
                </div>

                {/* Content */}
                {!post1Editing ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-[13px] text-slate-800 leading-relaxed">
                    Guys join my VIP telegram{' '}
                    <mark className="bg-red-200 text-red-800 px-1 rounded font-semibold">t.me/pumpsignals</mark>{' '}
                    for{' '}
                    <mark className="bg-red-200 text-red-800 px-1 rounded font-semibold">100% daily guaranteed profit</mark>{' '}
                    on XAU/USD! Passing prop challenges in 24 hours guaranteed hit my DM!
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 p-3 rounded-xl bg-slate-50 border border-blue-200">
                    <span className="text-[11px] font-bold text-[#1D4ED8] uppercase tracking-wide">Inline Redact / Censor Mode</span>
                    <textarea
                      rows={2}
                      defaultValue="Guys join my VIP telegram [REDACTED BY MODERATOR] for [REDACTED POLICY VIOLATION] on XAU/USD! Prop discussion sanitized."
                      className="w-full p-2.5 rounded-lg bg-white border border-slate-200 text-slate-800 text-[13px] outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={() => setPost1Editing(false)} className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[12px] font-semibold">Cancel</button>
                      <button onClick={() => { setPost1Text('[REDACTED BY MODERATOR]'); setPost1Editing(false); }} className="px-3 py-1.5 rounded-lg bg-[#1D4ED8] text-white text-[12px] font-semibold">Save Redacted Content</button>
                    </div>
                  </div>
                )}

                {/* Action Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setPost1Editing(true)} className="px-3 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all">
                      <span className="material-symbols-outlined text-[15px]">edit_document</span>
                      Inline Redact / Edit
                    </button>
                    <button onClick={() => handleMute('cryptotrader99', '48 Hours')} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                      <span className="material-symbols-outlined text-[15px]">volume_off</span>
                      Mute 48h
                    </button>
                    <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                      <span className="material-symbols-outlined text-[15px]">check_circle</span>
                      Dismiss (False Alarm)
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-red-200">
                      <span className="material-symbols-outlined text-[15px]">person_off</span>
                      Guild Ban
                    </button>
                    <button onClick={() => setPost1Deleted(true)} className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all">
                      <span className="material-symbols-outlined text-[15px]">delete_forever</span>
                      Delete Post
                    </button>
                  </div>
                </div>
              </div>
            )}
            {post1Deleted && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-5 flex items-center justify-center gap-2 text-slate-400 text-[13px] font-semibold">
                <span className="material-symbols-outlined text-[18px]">delete_forever</span>
                Post deleted by moderator
              </div>
            )}

            {/* ── POST 2: Verified Elite Trader Analysis ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              {/* Mod Status Ribbon */}
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2 text-emerald-700 text-[12px] font-semibold">
                  <span className="material-symbols-outlined text-[17px]">verified</span>
                  Desk Verified: Verified execution on institutional bridge • #44891 Fix Engine
                </div>
                <span className="flex items-center gap-1 text-[#1D4ED8] text-[11px] font-bold">
                  <span className="material-symbols-outlined text-[15px]">push_pin</span>
                  {unpinned2 ? 'Unpinned' : 'Pinned to Top'}
                </span>
              </div>

              {/* Author */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqgyK6pnUhonG6cxhrDOq3z7Ed3FHd_lyeAhJULtk9ZOGTD6yxmW0bvpAaVM9ud7ByIApGf_9Ecv2iFljSc7yr8T5ginQOFL7c7ah0t5FlDdj_-0ZOcDD_qK5Lca7j138m8ngaSrO45vfGqhalQ-37XiOu2rTTR9cKl-9KDAXmY0egS9P_iis8ip5o0wpgeu8OdYp4-C4_FBUpdcuZKrHV7YaJxRimOg7ZueNybf0GHMYaviK-ZuEjRw"
                    alt="Elena_FX"
                    className="w-11 h-11 rounded-full object-cover border-2 border-emerald-200"
                  />
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-900 text-[14px]">Elena_FX</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold border border-blue-200">Tier 3 Executive VIP</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">$200k Funded</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                      <span>#trade-setups</span>
                      <span>•</span>
                      <span>1 hour ago</span>
                      <span>•</span>
                      <span className="text-emerald-600 font-semibold">Guild Rep: 940 (Top 1%)</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-100 shrink-0">
                  <span className="material-symbols-outlined text-[15px]">workspace_premium</span>
                  Audited Prop Trader
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2">
                <h3 className="text-[17px] font-bold text-slate-900 leading-snug">
                  EUR/USD 15m Liquidity Grab into London Open FVG. Target 1.0890 with strict 1:3.4 RR.
                </h3>
                <p className="text-[13px] text-slate-600 leading-relaxed">
                  Execution trigger reached after swept 08:00 GMT Asian highs. Premium mitigation into unfilled fair value gap with institutional order-flow confluence. Risk calibrated at 0.45% of allocated $200k book.
                </p>
              </div>

              {/* Chart Image */}
              <div className="relative w-full h-64 rounded-xl overflow-hidden bg-slate-100">
                <img
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuCIUG4KCWeKmdxd2EC-7-107MFsNoc0Ch4sJorf4UauYdEpPaTyAAL0QV-Fm16uzx5F18CueFnzDj9qKrjgaQH-DqpqM5jcpI8iKRzZvVOvIVZLt1YCkZZJd41ONwQK5mLbN3VMZKKE_EY0uPmDRyR_RswWUN_AUB6XDxNerkIMe-XVXY1RhZj08rB3-k-mpiVYDI5y4KuEYbMk1bHdKbYStbR_csQg08Kqy-3feecZxeJ-M6V7X5mj-g"
                  alt="EUR/USD 15m chart"
                  className="w-full h-full object-cover"
                />
                <div className="absolute bottom-3 right-3 px-3 py-1.5 bg-white/90 backdrop-blur rounded-lg text-[11px] font-semibold text-slate-700 shadow-sm flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  15m Institutional Chart • Clean OCR Scan Passed
                </div>
              </div>

              {/* Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <div className="flex flex-wrap items-center gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                    <span className="material-symbols-outlined text-[15px]">edit_note</span>
                    Edit Post Content
                  </button>
                  <button onClick={() => setUnpinned2(!unpinned2)} className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                    <span className="material-symbols-outlined text-[15px]">{unpinned2 ? 'push_pin' : 'keep_off'}</span>
                    {unpinned2 ? 'Repin Post' : 'Unpin Post'}
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                    <span className="material-symbols-outlined text-[15px]">lock</span>
                    Lock Thread
                  </button>
                  <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 transition-colors border border-slate-200">
                    <span className="material-symbols-outlined text-[15px]">edit_note</span>
                    Add Desk Memo
                  </button>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500">
                  <span className="material-symbols-outlined text-[15px]">visibility</span>
                  <span>1,248 Views</span>
                  <span className="mx-0.5">•</span>
                  <span className="material-symbols-outlined text-[15px]">thumb_up</span>
                  <span>84 Endorsements</span>
                </div>
              </div>
            </div>

            {/* ── POST 3: Faculty Broadcast / Institutional Directive ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCzrTfIYwjUOnij5fUTjXarZakfYbi4KRXJGkUJpS4jt_K7YfIQU-vt60jWk5_OZeyhod62KOPt6VHHkGnu0jRKGqdDTJ9hgxnAJDW5VxCYq0q8Vbpinaj9VcLztoJPOYlqeCEHFiGI795vRxt1TdkDtrdE338EjqkeHSq3FPXxM8O2Z0b2k4lXTPxVqtgfv-87E01zBW8h7o7z9vaQ4If4vmO15jKaLcScrNmpbr5Mys1gyJBl1czogg"
                    alt="Marcus Vance"
                    className="w-11 h-11 rounded-full object-cover border-2 border-blue-200"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-[14px]">Marcus Vance</span>
                      <span className="px-2 py-0.5 rounded-full bg-[#1D4ED8] text-white text-[10px] font-bold">Desk Lead / Faculty</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] mt-0.5">
                      <span>#fomc-prep</span>
                      <span>•</span>
                      <span>3 hours ago</span>
                      <span>•</span>
                      <span className="text-[#1D4ED8] font-semibold">Official Broadcast</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-[#1D4ED8] text-[11px] font-bold border border-blue-100 shrink-0">
                  <span className="material-symbols-outlined text-[15px]">security</span>
                  Institutional Directive
                </div>
              </div>

              <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
                <h4 className="font-bold text-slate-900 text-[14px] mb-1.5">Official FOMC Liquidity Playbook Matrix & Spreads Protocol</h4>
                <p className="text-[13px] text-slate-700 leading-relaxed">
                  All Guild accounts funded under the $100k+ enterprise liquidity program must adhere to the 15-minute freeze window before and after the rate announcement. Spreads are simulated to widen up to 32 pips. Review the attached covenant matrix before placing limit orders.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 border border-slate-200">
                    <span className="material-symbols-outlined text-[15px]">edit</span>
                    Edit Directive
                  </button>
                  <button
                    onClick={handlePushNotify}
                    className="px-4 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span className="material-symbols-outlined text-[15px]">send</span>
                    {notifSent ? 'Sent!' : 'Push Notify 3,420 Traders'}
                  </button>
                </div>
                <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">done_all</span>
                  98.2% Guild Read Rate
                </span>
              </div>
            </div>

            {/* ── POST 4: Reported Dispute Comment ── */}
            {!post4Resolved && (
              <div className="bg-white rounded-2xl border border-amber-200 shadow-sm p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between bg-amber-50 border border-amber-100 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2 text-amber-800 text-[12px] font-semibold">
                    <span className="material-symbols-outlined text-[17px] text-red-500">flag</span>
                    Reported by 2 Members: &quot;Unprofessional Harassment in Prop Discussion&quot;
                  </div>
                  <span className="text-slate-500 text-[11px] font-semibold">Sub-Thread #prop-payout-verification</span>
                </div>

                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-[12px]">TD</div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 text-[14px]">trader_dan_82</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">Tier 2 Pro</span>
                        <span className="text-slate-400 text-[11px]">Trust Score: 78/100</span>
                      </div>
                      <span className="text-slate-500 text-[11px]">Replying to @marcus_vance • 42 mins ago</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100 text-[13px] text-slate-800 italic">
                  &quot;Your lot sizing rule is completely stupid and anyone who follows this advice will blow their evaluation challenge in 3 trades.&quot;
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1.5 border border-slate-200">
                      <span className="material-symbols-outlined text-[15px]">spellcheck</span>
                      Inline Redact &quot;Stupid&quot;
                    </button>
                    <button className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 text-[11px] font-bold flex items-center gap-1.5 border border-amber-200">
                      <span className="material-symbols-outlined text-[15px]">warning_amber</span>
                      Issue Warning (1/3)
                    </button>
                  </div>
                  <button onClick={() => setPost4Resolved(true)} className="px-4 py-1.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-all">
                    Mark Resolved
                  </button>
                </div>
              </div>
            )}
            {post4Resolved && (
              <div className="bg-slate-50 rounded-2xl border border-slate-200 border-dashed p-4 flex items-center justify-center gap-2 text-slate-400 text-[13px] font-semibold">
                <span className="material-symbols-outlined text-[18px] text-emerald-500">check_circle</span>
                Report marked as resolved
              </div>
            )}
          </div>

          {/* ── RIGHT: Discipline Console + Sentry Shield (4 cols) ──────────── */}
          <div className="xl:col-span-4 flex flex-col gap-5">

            {/* ── Trader Privileges & Discipline ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1D4ED8] text-[22px]">manage_accounts</span>
                  <h3 className="text-[15px] font-bold text-slate-900">Trader Privileges & Discipline</h3>
                </div>
                <span className="text-[11px] text-slate-500 font-semibold">Live Roster</span>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">search</span>
                <input
                  type="text"
                  placeholder="Search Trader Name, MT5 #, Discord Handle..."
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-[12px] outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>

              {/* Trader List */}
              <div className="flex flex-col gap-3">
                {/* CT */}
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-[#1D4ED8] text-white flex items-center justify-center font-bold text-[11px]">CT</div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-tight">cryptotrader99</p>
                        <p className="text-[10px] text-slate-400 font-mono">MT5 #48291 • Tier 1</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] font-bold border border-red-200">Trust 32/100</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Warnings: <strong className="text-red-600">2/3</strong></span>
                    <span className="text-red-600 font-semibold">Flagged: Unsolicited PMs</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button onClick={() => handleMute('cryptotrader99', '24h')} className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors border border-slate-200">
                      Mute 24h
                    </button>
                    <button className="py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold transition-colors shadow-sm">
                      Revoke Rights
                    </button>
                  </div>
                </div>

                {/* TD */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-700 flex items-center justify-center font-bold text-[11px]">TD</div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-tight">trader_dan_82</p>
                        <p className="text-[10px] text-slate-400 font-mono">MT5 #90112 • Tier 2 Pro</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold">Trust 78/100</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Warnings: <strong>1/3</strong></span>
                    <span className="text-emerald-600 font-semibold">Verified PnL Trader</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-0.5">
                    <button className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors border border-slate-200">Reset Warning</button>
                    <button className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors border border-slate-200">Audit Logs</button>
                  </div>
                </div>

                {/* Elena */}
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-[11px]">EF</div>
                      <div>
                        <p className="text-[13px] font-bold text-slate-900 leading-tight">Elena_FX</p>
                        <p className="text-[10px] text-slate-400 font-mono">MT5 #33819 • Tier 3 VIP</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold border border-emerald-200">Trust 98/100</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">Status: <strong className="text-emerald-600">Active Privileges</strong></span>
                    <span className="text-slate-500">Warnings: 0/3</span>
                  </div>
                  <button className="w-full py-1.5 rounded-lg bg-white hover:bg-blue-50 text-[#1D4ED8] text-[11px] font-bold transition-colors border border-blue-100">
                    Elevate to Guild Moderator
                  </button>
                </div>
              </div>
            </div>

            {/* ── Sentry AI Blacklist Shield ── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-indigo-600 text-[22px]">shield</span>
                  <h3 className="text-[15px] font-bold text-slate-900">Sentry AI Blacklist Shield</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">Regex + OCR</span>
              </div>
              <p className="text-[12px] text-slate-500 leading-relaxed">
                Messages matching these patterns are instantly routed to quarantine before reaching the active trader feed.
              </p>

              {/* Keyword Chips */}
              <div className="flex flex-wrap gap-2">
                {keywords.map((kw) => (
                  <span key={kw.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200">
                    {kw.label}
                    <button onClick={() => removeKeyword(kw.id)} className="hover:text-red-500 transition-colors">
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </span>
                ))}
              </div>

              {/* Add Keyword */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                  placeholder="Add Regex term..."
                  className="flex-1 px-3 py-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-slate-700 text-[12px] outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
                <button
                  onClick={addKeyword}
                  className="px-3 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[11px] font-bold flex items-center gap-1 transition-all"
                >
                  <span className="material-symbols-outlined text-[15px]">add</span>
                  Add Rule
                </button>
              </div>

              {/* Audit Trail */}
              <div className="border-t border-slate-100 pt-3 flex flex-col gap-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Audit Trail Execution</p>
                {[
                  { msg: 'Auto-Mod OCR scanned Post #2', time: '2m ago' },
                  { msg: 'User @dan_82 muted in #macro-gold', time: '18m ago' },
                  { msg: 'Rule "flip account" deployed to Sentry', time: '1h ago' },
                ].map((log, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{log.msg}</span>
                    <span className="text-slate-400 shrink-0 ml-2">{log.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
