'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'

import CountUp from 'react-countup'
import QRCode from 'react-qr-code'

export default function MarketingPage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [activeLeg, setActiveLeg] = useState<'left' | 'right' | 'auto'>('left')
  const [mediaFilter, setMediaFilter] = useState('all')
  const [copied, setCopied] = useState(false)
  const [leads, setLeads] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchLeads = async () => {
      try {
        const res = await fetch('/api/marketing/leads')
        if (res.status === 401) {
          // removed aggressive logout
          return
        }
        const data = await res.json()
        setLeads(data.leads || [])
      } catch (err) {
        console.error(err)
      }
    }
    fetchLeads()
  }, [router])

  const referralLink = profile ? `${typeof window !== 'undefined' ? window.location.origin : ''}/register?ref=${profile.referral_code || profile.username}&pl=${activeLeg === 'left' ? '1' : '2'}` : 'Loading...';

  const handleCopy = () => {
    if (!profile) return;
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const downloadQR = (format: 'svg' | 'png') => {
    const svg = document.getElementById('sponsor-qr-code') as unknown as SVGSVGElement;
    if (!svg) return;
    
    const svgData = new XMLSerializer().serializeToString(svg);
    
    if (format === 'svg') {
      const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sponsor-qr-${activeLeg}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } else {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = 1024;
        canvas.height = 1024;
        ctx!.fillStyle = '#ffffff';
        ctx!.fillRect(0, 0, canvas.width, canvas.height);
        ctx!.drawImage(img, 0, 0, 1024, 1024);
        const url = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.href = url;
        link.download = `sponsor-qr-${activeLeg}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
    }
  }

  const mediaCards = [
    {
      img: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=600&q=80',
      badge: 'PDF DECK (32 Pgs)', badgeBg: 'bg-inverse-surface/90 text-white',
      corner: 'EN / HI / ES',
      title: 'Official 2026 Business Opportunity Deck',
      desc: 'Complete executive BOP with auto-inserted distributor sponsor ID footer and team contact info.',
      meta: 'HD 300 DPI', btnLabel: 'PDF', btnIcon: 'download', btnColor: 'bg-primary text-white',
    },
    {
      img: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
      badge: 'INFOGRAPHIC + VIDEO', badgeBg: 'bg-secondary-container text-on-secondary-container',
      corner: '4K Ultra',
      title: 'BV Binary Matrix & Payout Guide',
      desc: 'Visual breakdown of dual-leg payout matching bonuses, rank multipliers, and weekly cap calculations.',
      meta: '18.4 MB', btnLabel: '4K Pack', btnIcon: 'download', btnColor: 'bg-primary text-white',
    },
    {
      img: 'https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=600&q=80',
      badge: 'STORY TEMPLATES', badgeBg: 'bg-tertiary-container text-on-tertiary-container',
      corner: '9:16 Vertical',
      title: 'Rank Milestone & Car Club Stories',
      desc: '1080×1920 animated templates with custom sponsor photo slots for Instagram, WhatsApp & Snapchat.',
      meta: '12 Files', btnLabel: 'Templates', btnIcon: 'download', btnColor: 'bg-primary text-white',
    },
    {
      img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
      badge: 'EXPLAINER MP4', badgeBg: 'bg-primary-container text-white',
      corner: '1:30 Min',
      title: 'Activation & Starter Packs Reel',
      desc: '90-second animated walk-through detailing Diamond vs Ruby pack advantages and product delivery.',
      meta: '64 MB', btnLabel: 'MP4 Video', btnIcon: 'download', btnColor: 'bg-primary text-white',
    },
    {
      img: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=600&q=80',
      badge: 'PRINT CMYK', badgeBg: 'bg-inverse-surface/90 text-white',
      corner: '6×3 ft Standee',
      title: 'Hotel Seminar Standees & Backdrops',
      desc: 'Pre-flighted CMYK print-ready vector artwork with 0.5-inch bleeds for live physical network meetings.',
      meta: 'ZIP 142 MB', btnLabel: 'Print Files', btnIcon: 'download', btnColor: 'bg-primary text-white',
    },
    {
      img: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=600&q=80',
      badge: 'DAILY ENGAGEMENT', badgeBg: 'bg-tertiary-container text-on-tertiary-container',
      corner: 'Updated Today',
      title: 'Daily Motivation & Payout Sparks',
      desc: 'High-converting morning motivation quotes with encrypted referral tags ready for WhatsApp Status.',
      meta: '10 Assets', btnLabel: 'WhatsApp', btnIcon: 'send', btnColor: 'bg-tertiary text-white',
    },
  ]


  const campaignRows = treeStats?.directs?.total > 0 ? [
    { name: 'Default Referral Link', channel: 'Direct Share', placement: activeLeg === 'auto' ? 'Auto-Balance' : activeLeg === 'left' ? 'Left Leg' : 'Right Leg', clicks: (treeStats?.directs?.total || 0) * 24, signups: leads.length, bv: `₹${(treeStats?.volumes?.personalBv || 0)} BV`, conv: `${((treeStats?.directs?.active || 0) / (treeStats?.directs?.total || 1) * 100).toFixed(1)}%` },
  ] : []

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">

            {/* Breadcrumb & Title */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md">
              <div>
                <div className="flex items-center gap-1.5 font-label-sm text-label-sm text-outline tracking-wider uppercase mb-1">
                  <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span>Marketing &amp; Collateral</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-semibold">Network Campaign Hub</span>
                </div>
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Marketing &amp; Promotional Hub</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl mt-0.5">
                  Official institutional brand assets, automated multi-channel lead funnels, personalized binary placement engines, and regulatory-approved conversion kits.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-gutter-sm">
                <button className="px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container font-body-sm flex items-center gap-1.5 shadow-sm transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px] text-outline">folder_zip</span>
                  <span>Brand Kit (ZIP 85MB)</span>
                </button>
                <button className="px-3.5 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high font-body-sm flex items-center gap-1.5 shadow-sm transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px] text-primary">schedule_send</span>
                  <span>Schedule Broadcast</span>
                </button>
                <button className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-body-sm flex items-center gap-1.5 shadow-md shadow-primary/20 transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Create Custom Campaign</span>
                </button>
              </div>
            </motion.div>

            {/* Top KPI Bar */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter-md">
              {/* Metric 1 */}
              <div className="p-gutter-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Referral Clicks</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">trending_up</span> +{treeStats?.directs?.active || 0}%
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-metric-display text-metric-display text-on-surface tracking-tight font-bold"><CountUp start={0} end={(treeStats?.directs?.total || 0) * 24} duration={2.5} separator="," /></span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Unique visits</span>
                  <span className="text-primary font-semibold">{((treeStats?.directs?.active || 0) / (treeStats?.directs?.total || 1) * 100).toFixed(1)}% Conv.</span>
                </div>
              </div>
              {/* Metric 2 */}
              <div className="p-gutter-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Frontline Leads</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container text-primary font-label-sm text-[10px] font-bold">Live Flow</span>
                </div>
                <div className="my-2">
                  <span className="font-metric-display text-metric-display text-on-surface tracking-tight font-bold"><CountUp start={0} end={leads.length} duration={2} separator="," /></span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Active pipeline</span>
                  <span className="text-secondary font-semibold">{Math.max(0, leads.length - (treeStats?.directs?.active || 0))} KYC Pending</span>
                </div>
              </div>
              {/* Metric 3 */}
              <div className="p-gutter-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Conversion Rate</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-0.5">
                    <span className="material-symbols-outlined text-[12px]">verified</span> +{(treeStats?.directs?.active || 0) > 0 ? '1.2' : '0.0'}%
                  </span>
                </div>
                <div className="my-2">
                  <span className="font-metric-display text-metric-display text-on-surface tracking-tight font-bold">{((treeStats?.directs?.active || 0) / (treeStats?.directs?.total || 1) * 100).toFixed(1)}%</span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Industry bench: 12.4%</span>
                  <span className="text-tertiary font-semibold">{((treeStats?.directs?.active || 0) / (treeStats?.directs?.total || 1) * 100) > 12.4 ? 'Optimal' : 'Needs Work'}</span>
                </div>
              </div>
              {/* Metric 4 */}
              <div className="p-gutter-md bg-surface-container-lowest rounded-xl shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Assets Shared</span>
                  <span className="px-1.5 py-0.5 rounded-full bg-surface-container-low text-outline font-label-sm text-[10px] font-bold">30 Days</span>
                </div>
                <div className="my-2">
                  <span className="font-metric-display text-metric-display text-on-surface tracking-tight font-bold"><CountUp start={0} end={leads.length * 3 + (treeStats?.directs?.total || 0)} duration={2} separator="," /></span>
                </div>
                <div className="flex items-center justify-between text-outline font-label-sm text-label-sm">
                  <span>Decks, Reels &amp; PDFs</span>
                  <span className="text-on-surface font-semibold">82% Opened</span>
                </div>
              </div>
              {/* Metric 5: Sapphire Card */}
              <div className="p-gutter-md bg-gradient-to-br from-primary via-primary-container to-secondary text-white rounded-xl shadow-md flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none"></div>
                <div className="flex items-center justify-between z-10">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed font-semibold">Referral Status</span>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-label-sm text-[10px] font-bold tracking-wide">Tier 1 Elite</span>
                </div>
                <div className="my-1 z-10">
                  <div className="font-body-lg font-bold leading-tight">Top 3% Recruiter</div>
                  <p className="font-body-sm text-body-sm text-primary-fixed mt-0.5 line-clamp-1">₹{((wallet?.balances?.sponsorIncome || 0) / 100000).toFixed(2)}L earned via direct referrals</p>
                </div>
                <div className="z-10 pt-1">
                  <button className="w-full py-1.5 px-2.5 rounded bg-white text-primary hover:bg-surface-container-lowest font-body-sm font-semibold flex items-center justify-center gap-1 shadow-sm transition-all" type="button">
                    <span className="material-symbols-outlined text-[16px]">qr_code_2</span>
                    <span>1-Click Share QR</span>
                  </button>
                </div>
              </div>
            </motion.div>

            {/* Main 2-Column Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-8 space-y-gutter-lg">

                {/* Dynamic Referral Engine & QR Hub */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm mb-gutter-md">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-low text-primary flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px]">hub</span>
                      </div>
                      <div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Dynamic Referral Engine &amp; QR Hub</h2>
                        <p className="font-body-sm text-body-sm text-outline">Configure dynamic URL attribution and leg balance routing for new member placement</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                      <span className="font-label-sm text-label-sm text-on-surface font-semibold">Direct Sponsor Track Active</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-lg">
                    {/* Controls */}
                    <div className="md:col-span-8 space-y-gutter-md">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-2">Automated Binary Leg Placement Assignment</label>
                        <div className="grid grid-cols-3 gap-1 p-1 bg-surface-container-low rounded-lg">
                          {(['left', 'right', 'auto'] as const).map((leg) => (
                            <button
                              key={leg}
                              onClick={() => setActiveLeg(leg)}
                              className={`py-2 px-3 rounded-md text-center font-body-sm transition-all flex items-center justify-center gap-1.5 ${activeLeg === leg ? 'bg-primary text-white shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                              type="button"
                            >
                              <span className="material-symbols-outlined text-[16px]">{leg === 'left' ? 'west' : leg === 'right' ? 'east' : 'balance'}</span>
                              <span>{leg === 'left' ? 'Left Leg' : leg === 'right' ? 'Right Leg' : 'Auto-Balance'}</span>
                            </button>
                          ))}
                        </div>
                        <p className="font-body-sm text-[11px] text-outline mt-1.5">Current mode: Routing new recruits directly into the lesser volume binary branch for immediate commission activation.</p>
                      </div>

                      <div>
                        <label className="block font-label-md text-label-md text-on-surface font-semibold mb-1.5">Personalized Distributor Campaign URL</label>
                        <div className="flex items-center gap-2">
                          <div className="relative flex-1">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">link</span>
                            <input className="w-full pl-9 pr-3 py-2 bg-surface-container-low font-body-sm text-body-sm font-semibold text-primary rounded-lg focus:outline-none select-all" readOnly type="text" value={referralLink} />
                          </div>
                          <button onClick={handleCopy} disabled={!profile} className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-body-sm flex items-center gap-1.5 shadow-sm transition-all" type="button">
                            <span className="material-symbols-outlined text-[18px]">{copied ? 'check' : 'content_copy'}</span>
                            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                          </button>
                          <a className="p-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface transition-all" href={typeof window !== 'undefined' ? window.location.origin : '#'} target="_blank" rel="noreferrer">
                            <span className="material-symbols-outlined text-[20px]">open_in_new</span>
                          </a>
                        </div>
                      </div>

                      <div className="pt-2 space-y-2.5">
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input defaultChecked className="mt-0.5 rounded text-primary focus:ring-0 w-4 h-4 bg-surface-container accent-primary" type="checkbox" />
                          <div className="flex flex-col">
                            <span className="font-body-sm font-semibold text-on-surface">Instant WhatsApp Lead Ping</span>
                            <span className="font-body-sm text-body-sm text-outline">Receive instant phone ping with recruit name, selected starter pack, and contact when lead completes step 1.</span>
                          </div>
                        </label>
                        <label className="flex items-start gap-2.5 cursor-pointer">
                          <input defaultChecked className="mt-0.5 rounded text-primary focus:ring-0 w-4 h-4 bg-surface-container accent-primary" type="checkbox" />
                          <div className="flex flex-col">
                            <span className="font-body-sm font-semibold text-on-surface">Embed Elora Diamond Security Hologram Watermark</span>
                            <span className="font-body-sm text-body-sm text-outline">Affixes official institutional authenticity banner onto downloadable social graphics.</span>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* QR Preview */}
                    <div className="md:col-span-4 bg-surface-container-low rounded-xl p-gutter-md flex flex-col items-center justify-between text-center">
                      <div className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider mb-2">High-Res Sponsor QR</div>
                      <div className="bg-surface-container-lowest p-3 rounded-lg shadow-sm flex flex-col items-center">
                        <QRCode 
                          id="sponsor-qr-code"
                          value={referralLink} 
                          size={128} 
                          bgColor="transparent" 
                          fgColor="currentColor" 
                          className="w-32 h-32 text-on-surface" 
                        />
                        <div className="mt-2 text-primary font-label-sm text-[10px] uppercase font-bold tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-[12px]">verified</span> Sponsor: {profile?.referral_code || profile?.username || 'Loading...'}
                        </div>
                      </div>
                      <div className="w-full mt-3 flex items-center gap-1.5">
                        <button onClick={() => downloadQR('svg')} className="flex-1 py-1.5 px-2 bg-surface-container-lowest hover:bg-surface-container-high rounded text-on-surface font-label-sm flex items-center justify-center gap-1 shadow-sm transition-all" type="button">
                          <span className="material-symbols-outlined text-[14px]">download</span> SVG
                        </button>
                        <button onClick={() => downloadQR('png')} className="flex-1 py-1.5 px-2 bg-surface-container-lowest hover:bg-surface-container-high rounded text-on-surface font-label-sm flex items-center justify-center gap-1 shadow-sm transition-all" type="button">
                          <span className="material-symbols-outlined text-[14px]">image</span> PNG (4K)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Marketing Assets & Social Kits */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-sm mb-gutter-md">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Official Marketing Assets &amp; Social Kits</h2>
                      <p className="font-body-sm text-body-sm text-outline">Multi-language high-definition decks, vertical video reels, and promotional collateral</p>
                    </div>
                    <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                      <span className="material-symbols-outlined text-[16px] text-outline pl-1.5">filter_alt</span>
                      <span className="font-label-sm text-label-sm font-semibold text-on-surface-variant pr-2">Filter Catalog</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 overflow-x-auto pb-gutter-xs mb-gutter-md">
                    {[
                      { id: 'all', label: 'All Materials (48)' },
                      { id: 'social', label: 'Social Media Kits (18)' },
                      { id: 'decks', label: 'Presentation Decks (8)' },
                      { id: 'video', label: 'Video Reels & Shorts (12)' },
                      { id: 'print', label: 'Printed Flyers & Banners (10)' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setMediaFilter(f.id)}
                        className={`px-3 py-1.5 rounded-full font-body-sm font-semibold whitespace-nowrap transition-colors ${mediaFilter === f.id ? 'bg-primary text-white shadow-sm' : 'bg-surface-container-low hover:bg-surface-container text-on-surface-variant'}`}
                        type="button"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-gutter-md">
                    {mediaCards.map((card, i) => (
                      <div key={i} className="bg-surface-container-low rounded-xl overflow-hidden flex flex-col justify-between hover:shadow-md transition-all group">
                        <div className="relative h-36 bg-surface-container overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center group-hover:scale-105 transition-transform duration-300"
                            style={{ backgroundImage: `url(${card.img})` }}
                          ></div>
                          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full ${card.badgeBg} font-label-sm text-[10px] font-bold tracking-wide`}>{card.badge}</span>
                          <span className="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded bg-surface-container-lowest/90 font-label-sm text-[10px] text-on-surface font-semibold">{card.corner}</span>
                        </div>
                        <div className="p-gutter-md flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-headline-md text-headline-md text-on-surface font-bold line-clamp-1">{card.title}</h3>
                            <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 line-clamp-2">{card.desc}</p>
                          </div>
                          <div className="mt-4 pt-3 flex items-center justify-between">
                            <span className="font-label-sm text-label-sm text-outline">{card.meta}</span>
                            <div className="flex items-center gap-1.5">
                              <button className="p-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface" type="button">
                                <span className="material-symbols-outlined text-[18px]">share</span>
                              </button>
                              <button className={`px-2.5 py-1.5 rounded-lg ${card.btnColor} font-label-sm flex items-center gap-1 shadow-sm`} type="button">
                                <span className="material-symbols-outlined text-[14px]">{card.btnIcon}</span> {card.btnLabel}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Live Lead Capture & Conversion Funnel */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm mb-gutter-md">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Live Lead Capture &amp; Conversion Funnel</h2>
                      <p className="font-body-sm text-body-sm text-outline">Real-time throughput from digital link impressions down to BV-generating activations</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-label-sm text-label-sm text-outline">Leg Distribution:</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm font-bold">Left Leg: {(((treeStats?.volumes?.leftBv || 0) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100).toFixed(1)}%</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-secondary font-label-sm font-bold">Right Leg: {(((treeStats?.volumes?.rightBv || 0) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100).toFixed(1)}%</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter-sm mb-gutter-md">
                    {[
                      { stage: 'STAGE 01', pct: '100% Base', label: 'Link Visits', value: ((treeStats?.directs?.total || 0) * 24).toString(), sub: 'Direct click volume', fill: '100%', color: 'bg-primary' },
                      { stage: 'STAGE 02', pct: '74.1% Drop', label: 'Landing Page Views', value: Math.floor(((treeStats?.directs?.total || 0) * 24) * 0.74).toString(), sub: 'Unique > CTA', fill: '74%', color: 'bg-secondary-container' },
                      { stage: 'STAGE 03', pct: '13.1%', label: 'Registrations', value: leads.length.toString(), sub: `${leads.length} form completions`, fill: '20%', color: 'bg-primary' },
                      { stage: 'STAGE 04', pct: '47.5% Net', label: 'Package Active', value: (treeStats?.directs?.active || 0).toString(), sub: `${treeStats?.directs?.active || 0} Enrolled in Tier`, fill: '47%', color: 'bg-tertiary' },
                    ].map((step, i) => (
                      <div key={i} className="p-gutter-md bg-surface-container-low rounded-xl">
                        <div className="flex items-center justify-between font-label-sm text-label-sm text-outline mb-1">
                          <span>{step.stage}</span>
                          <span className="text-primary font-bold">{step.pct}</span>
                        </div>
                        <div className="font-headline-md text-headline-md text-on-surface font-bold">{step.label}</div>
                        <div className="font-headline-xl text-primary font-bold mt-1">{step.value}</div>
                        <p className="font-body-sm text-[11px] text-outline mt-1">{step.sub}</p>
                        <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-3 overflow-hidden">
                          <div className={`${step.color} h-full rounded-full`} style={{ width: step.fill }}></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low flex items-center gap-3 font-label-sm text-label-sm">
                    <span className="material-symbols-outlined text-primary text-[18px]">waterfall_chart</span>
                    <span className="text-on-surface font-semibold">Elora New Recruit Volume Attribution</span>
                    <span className="text-outline ml-auto">Sync rate: Weighted: Optional: ₹91.89 Tier</span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-gutter-sm">
                    <div className="p-3 rounded-lg bg-surface-container-low text-center">
                      <div className="font-label-sm text-label-sm text-outline mb-1">Left Leg Activations ({(((treeStats?.volumes?.leftBv || 0) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100).toFixed(1)}%)</div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${(((treeStats?.volumes?.leftBv || 0) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                    <div className="p-3 rounded-lg bg-surface-container-low text-center">
                      <div className="font-label-sm text-label-sm text-outline mb-1">Right Leg Activations ({(((treeStats?.volumes?.rightBv || 0) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100).toFixed(1)}%)</div>
                      <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                        <div className="bg-secondary-container h-full rounded-full" style={{ width: `${(((treeStats?.volumes?.rightBv || 0) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100)}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Campaign Performance & Attribution Audit */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm mb-gutter-md">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Campaign Performance &amp; Attribution Audit</h2>
                      <p className="font-body-sm text-body-sm text-outline">Live campaign metrics, UTM attribution paths, and direct BV correlations</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-on-surface font-label-md font-semibold hover:bg-surface-container-high transition-colors" type="button">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      <span>Export CSV</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm text-on-surface whitespace-nowrap">
                      <thead>
                        <tr className="bg-surface-container-low text-outline uppercase font-label-sm text-label-sm tracking-wider">
                          <th className="py-3 px-4 rounded-l-lg">Campaign Name</th>
                          <th className="py-3 px-4">Primary Channel</th>
                          <th className="py-3 px-4">Placement (Leg)</th>
                          <th className="py-3 px-4">Clicks</th>
                          <th className="py-3 px-4">Verified Signups</th>
                          <th className="py-3 px-4">Total BV Generated</th>
                          <th className="py-3 px-4 rounded-r-lg text-right">Conversion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container-low">
                        {campaignRows.length > 0 ? campaignRows.map((row, i) => (
                          <tr key={i} className="hover:bg-surface-container-low/50 transition-colors group">
                            <td className="py-3.5 px-4">
                              <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">{row.name}</div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">{row.channel}</span>
                            </td>
                            <td className="py-3.5 px-4 text-outline">{row.placement}</td>
                            <td className="py-3.5 px-4 font-semibold text-on-surface">{row.clicks}</td>
                            <td className="py-3.5 px-4 font-semibold text-on-surface">{row.signups}</td>
                            <td className="py-3.5 px-4 font-bold text-tertiary">{row.bv}</td>
                            <td className="py-3.5 px-4 text-right">
                              <span className="font-semibold text-primary">{row.conv}</span>
                              <button className="ml-2 p-1 rounded text-outline hover:text-primary transition-colors" type="button">
                                <span className="material-symbols-outlined text-[16px]">trending_up</span>
                              </button>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan={7} className="py-6 text-center text-outline font-body-sm">
                              No active campaigns. Share your referral link to start generating BV!
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-4 space-y-gutter-lg">

                {/* 1-Click Broadcast Engine */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">campaign</span>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">1-Click Broadcast Engine</h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">Distribute institutional content directly—high-fidelity digital to target recipient channel</p>

                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { icon: 'forum', label: 'WhatsApp', color: 'text-[#25d366] bg-[#e8f9ef]' },
                      { icon: 'near_me', label: 'Telegram', color: 'text-[#2ca5e0] bg-[#e8f4fc]' },
                      { icon: 'share', label: 'Facebook', color: 'text-primary bg-surface-container-high' },
                      { icon: 'work', label: 'LinkedIn', color: 'text-[#0077b5] bg-[#e8f3fb]' },
                      { icon: 'tag', label: 'Twitter', color: 'text-on-surface bg-surface-container' },
                      { icon: 'mail', label: 'Email Blast', color: 'text-error bg-error-container' },
                    ].map((ch, i) => (
                      <button key={i} className={`flex flex-col items-center gap-1 p-2.5 rounded-xl ${ch.color} hover:shadow-sm transition-all font-label-sm text-label-sm font-semibold`} type="button">
                        <span className="material-symbols-outlined text-[22px]">{ch.icon}</span>
                        <span>{ch.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-surface-container-low space-y-2">
                    <div className="font-label-md text-label-md text-on-surface font-bold uppercase tracking-wider">Active Share Script – 100% Legal Compliant</div>
                    <div className="bg-surface-container-low rounded-lg p-3 font-body-sm text-body-sm text-on-surface-variant font-mono text-[11px] leading-relaxed" id="script-text">
                      &quot;Unlock and multiply business scanning with a top-driven Telegram. Regulate the 2026 ROI &amp; binary compensation jobs here: {typeof window !== 'undefined' ? window.location.origin : ''}/register?ref={profile?.referral_code || profile?.username || 'Loading...'}&amp;pl={activeLeg === 'left' ? '1' : '2'}&amp;src=wsp&quot;
                    </div>
                    <button onClick={() => {if(profile) navigator.clipboard.writeText(document.getElementById('script-text')?.innerText || '')}} className="w-full py-2 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors" type="button">
                      <span className="material-symbols-outlined text-[18px]">content_copy</span>
                      <span>Copy Full Script to Clipboard</span>
                    </button>
                  </div>
                </div>

                {/* Incoming Pipeline Leads */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Incoming Pipeline Leads</h3>
                    <span className="px-2 py-0.5 rounded-full bg-error text-white font-label-sm text-[10px] font-bold">Live</span>
                  </div>
                  <div className="space-y-3">
                    {leads.length > 0 ? leads.map((lead, i) => (
                      <div key={i} className="p-3 rounded-xl bg-surface-container-low flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-[13px]">
                              {lead.name ? lead.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() : 'LD'}
                            </div>
                            <div>
                              <div className="font-label-md text-label-md font-bold text-on-surface">{lead.name}</div>
                              <div className="font-label-sm text-[11px] text-outline">{lead.contact_info} • Source: {lead.source}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full ${lead.status === 'HOT' ? 'bg-error text-white' : 'bg-surface-container-high text-primary'} font-label-sm text-[10px] font-bold`}>{lead.status}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-label-sm text-[11px] text-outline">{new Date(lead.created_at).toLocaleDateString()}</span>
                          <button className={`px-3 py-1 rounded-lg ${lead.status === 'HOT' ? 'bg-[#25d366] text-white' : 'bg-primary text-white'} font-label-sm text-label-sm font-semibold text-[11px]`} type="button">
                            Follow Up
                          </button>
                        </div>
                      </div>
                    )) : (
                      <div className="p-3 rounded-xl bg-surface-container-low flex flex-col items-center gap-2 text-center text-outline font-label-sm">
                        <span className="material-symbols-outlined text-[24px]">inbox</span>
                        <span>No pipeline leads yet. Share your link to get started!</span>
                      </div>
                    )}
                  </div>
                  <button className="w-full py-2 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold text-center hover:bg-surface-container transition-colors" type="button">
                    View All {leads.length} Pipeline Leads →
                  </button>
                </div>

                {/* Compliance Shield */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-tertiary text-[22px]">policy</span>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Compliance Shield</h3>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">verified</span>
                      <div>
                        <div className="font-label-md text-label-md font-bold text-on-surface">Direct Selling Consumer 2021</div>
                        <div className="font-label-sm text-[11px] text-outline">All collateral is ethically statutory advertisement under per item tier 50(j). Zero deceptive earnings or positive claims shown on public social kits.</div>
                      </div>
                    </div>
                  </div>
                  <button className="w-full py-2 rounded-lg bg-surface-container-low text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 hover:bg-surface-container transition-colors" type="button">
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Download Legal Do's &amp; Don'ts Handbook</span>
                  </button>
                </div>

              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  )
}
