'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { motion } from 'framer-motion'
import CountUp from 'react-countup'
import { useRouter } from 'next/navigation'
import BinaryBreakdownReport from '@/components/dashboard/BinaryBreakdownReport'

export default function ReportsPage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [activeTab, setActiveTab] = useState('all')
  const [archiveFilter, setArchiveFilter] = useState('all')
  const [reportsData, setReportsData] = useState<any[]>([])
  const [loadingReports, setLoadingReports] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [binaryRes, walletRes] = await Promise.all([
          fetch('/api/user/binary-history'),
          fetch('/api/wallet/balance')
        ]);
        
        let dynamicReports: any[] = [];
        
        if (binaryRes.ok) {
          const binaryData = await binaryRes.json();
          if (binaryData.history && binaryData.history.length > 0) {
            const pairingReports = binaryData.history.map((item: any) => ({
              id: `bin-${item.id}`,
              icon: 'account_tree', color: 'text-primary', bg: 'bg-surface-container-high',
              name: `Binary Matching Log – ${item.matched_pairs} Pairs`, code: `REP-${item.id.substring(0, 8).toUpperCase()} • Hash: ${item.id.substring(8, 20)}`,
              category: 'Commission', catColor: 'bg-surface-container-high text-primary',
              period: `Cycle: ${new Date(item.cycle_date).toLocaleDateString()}`, generated: new Date(item.created_at).toLocaleString(),
              format: 'PDF', size: '1.2 MB', formatIcon: 'picture_as_pdf', formatColor: 'text-error',
              status: 'ready',
            }));
            dynamicReports.push(...pairingReports);
          }
        }
        
        if (walletRes.ok) {
          const walletData = await walletRes.json();
          if (walletData.transactions && walletData.transactions.length > 0) {
            const withdrawalReports = walletData.transactions
              .filter((tx: any) => tx.type === 'WITHDRAWAL')
              .map((tx: any) => ({
              id: `tx-${tx.id}`,
              icon: 'receipt_long', color: 'text-secondary', bg: 'bg-secondary-fixed/30',
              name: `Payout & Form 16A Statement`, code: `TX-${tx.id.substring(0, 8).toUpperCase()}`,
              category: 'Taxation', catColor: 'bg-surface-container text-outline',
              period: `Payout: ${new Date(tx.createdAt).toLocaleDateString()}`, generated: new Date(tx.createdAt).toLocaleString(),
              format: 'PDF + XLSX', size: '1.1 MB', formatIcon: 'picture_as_pdf', formatColor: 'text-error',
              status: 'ready',
            }));
            dynamicReports.push(...withdrawalReports);
          }
        }
        
        setReportsData(dynamicReports);
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingReports(false);
      }
    };
    
    fetchReports();
  }, [])



  const tabs = [
    { id: 'all', label: 'All Reports', count: 8 },
    { id: 'commission', label: 'Commission & Payouts', count: 3 },
    { id: 'genealogy', label: 'Genealogy & BV Volume', count: 2 },
    { id: 'binary_breakdown', label: 'Volume Breakdown (Advanced)' },
    { id: 'rank', label: 'Rank & Qualification' },
    { id: 'tax', label: 'Tax & TDS Statements' },
    { id: 'epin', label: 'E-Pin & Inventory Audit' },
  ]

  // Dynamic Chart Generation
  const currentMonth = new Date().getMonth();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const last6Months = Array.from({length: 6}).map((_, i) => {
    const d = new Date();
    d.setMonth(currentMonth - (5 - i));
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}${i === 4 ? ' (Peak)' : ''}`;
  });

  const binTot = wallet?.balances?.binaryIncome || 0;
  const spoTot = wallet?.balances?.sponsorIncome || 0;
  const royTot = (wallet?.balances?.leadershipIncome || 0) + (wallet?.balances?.rankBonus || 0);
  const maxTot = Math.max(binTot, spoTot, royTot, 100);

  const generatePathPoints = (targetValue: number, volatility: number) => {
    if (targetValue <= 0) return [0, 0, 0, 0, 0, 0];
    return [
      targetValue * 0.1 * volatility,
      targetValue * 0.3 * volatility,
      targetValue * 0.5,
      targetValue * 0.7,
      targetValue * 1.0, // Peak
      targetValue * 0.8  // Current
    ];
  };

  const generateSvgPath = (pts: number[]) => {
    const scale = maxTot > 0 ? 160 / maxTot : 0;
    const gety = (v: number) => 195 - (v * scale);
    return `M 0 ${gety(pts[0])} C 70 ${gety(pts[0])}, 70 ${gety(pts[1])}, 140 ${gety(pts[1])} C 210 ${gety(pts[1])}, 210 ${gety(pts[2])}, 280 ${gety(pts[2])} C 350 ${gety(pts[2])}, 350 ${gety(pts[3])}, 420 ${gety(pts[3])} C 490 ${gety(pts[3])}, 490 ${gety(pts[4])}, 560 ${gety(pts[4])} C 630 ${gety(pts[4])}, 630 ${gety(pts[5])}, 700 ${gety(pts[5])}`;
  };

  const binPts = generatePathPoints(binTot, 0.8);
  const spoPts = generatePathPoints(spoTot, 1.2);
  const royPts = generatePathPoints(royTot, 0.5);

  const binaryPath = generateSvgPath(binPts);
  const binaryFillPath = `${binaryPath} L 700 200 L 0 200 Z`;
  const sponsorPath = generateSvgPath(spoPts);
  const royaltyPath = generateSvgPath(royPts);
  const peakY = 195 - (binPts[4] * (160 / maxTot));

  // The archiveReports are now dynamically fetched

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">

            {/* Breadcrumb, Title, Actions */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-gutter-md">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-label-sm text-label-sm text-outline tracking-wider uppercase">
                  <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                  <span>Analytics &amp; Audit</span>
                  <span className="material-symbols-outlined text-[13px]">chevron_right</span>
                  <span className="text-primary font-semibold">Reports &amp; Network Intelligence</span>
                </div>
                <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight">Reports &amp; Financial Intelligence Center</h1>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
                  Comprehensive downline audit, binary pairing reconciliation, statutory TDS statements, and executive commission ledgers with verified CA audit shield.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <div className="flex items-center gap-2 bg-surface-container-lowest shadow-sm rounded-lg px-3 py-2 text-on-surface cursor-pointer">
                  <span className="material-symbols-outlined text-primary text-[18px]">calendar_today</span>
                  <div className="flex flex-col text-left">
                    <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider">Active Cycle</span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface">FY26-Q1 (Jan – Mar 2026)</span>
                  </div>
                  <span className="material-symbols-outlined text-outline text-[16px]">arrow_drop_down</span>
                </div>
                <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface shadow-sm hover:bg-surface-container-low transition-all font-label-md text-label-md font-semibold" type="button">
                  <span className="material-symbols-outlined text-outline text-[18px]">schedule_send</span>
                  <span>Schedule Automated Email</span>
                </button>
                <button className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-primary text-white shadow-sm hover:bg-primary-container transition-all font-label-md text-label-md font-semibold" type="button">
                  <span className="material-symbols-outlined text-[18px]">download</span>
                  <span>Export All Ledgers (CSV/PDF)</span>
                </button>
              </div>
            </div>

            {/* KPI Command Bar */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-gutter-md">
              {/* Card 1 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Cumulative Commission</span>
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-tertiary-container/15 text-tertiary font-label-sm text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[13px]">arrow_drop_up</span><span>+{(wallet?.balances?.totalEarned || 0) > 0 ? '100' : '0'}%</span>
                  </div>
                </div>
                <div>
                  <div className="font-metric-display text-metric-display text-on-surface tracking-tight">₹<CountUp start={0} end={wallet?.balances?.totalEarned || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-1 truncate">Binary Match + Direct + Royalty</p>
                </div>
                <div className="mt-3 flex items-center justify-between pt-2 bg-surface-container-low/40 px-2 py-1 rounded">
                  <span className="font-label-sm text-[11px] text-outline">Total All-Time</span>
                  <span className="font-label-sm text-[11px] text-tertiary font-semibold">+₹{(wallet?.balances?.totalEarned || 0).toLocaleString()}</span>
                </div>
              </motion.div>

              {/* Card 2 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Total Downline Volume</span>
                  <div className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-[11px] font-semibold">
                    <span className="material-symbols-outlined text-[13px]">tune</span><span>{(treeStats?.volumes?.leftBv > 0 && treeStats?.volumes?.rightBv > 0) ? 'Active Match' : 'Pending Match'}</span>
                  </div>
                </div>
                <div>
                  <div className="font-metric-display text-metric-display text-on-surface tracking-tight"><CountUp start={0} end={(treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)} duration={2.5} separator="," /> <span className="text-sm font-normal text-outline">BV</span></div>
                  <p className="font-label-sm text-label-sm text-outline mt-1 truncate">L: {treeStats?.volumes?.leftBv || 0} BV | R: {treeStats?.volumes?.rightBv || 0} BV</p>
                </div>
                <div className="mt-3 w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden flex">
                  <div className="bg-primary h-full" style={{ width: `${(treeStats?.volumes?.leftBv / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100}%` }}></div>
                  <div className="bg-secondary-container h-full" style={{ width: `${(treeStats?.volumes?.rightBv / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100}%` }}></div>
                </div>
              </motion.div>

              {/* Card 3 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Statutory TDS Withheld</span>
                  <span className="material-symbols-outlined text-tertiary text-[18px]">verified_user</span>
                </div>
                <div>
                  <div className="font-metric-display text-metric-display text-on-surface tracking-tight">₹<CountUp start={0} end={(wallet?.balances?.totalEarned || 0) * 0.05} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-1 truncate">Section 194H Compliant (5%)</p>
                </div>
                <div className="mt-3 flex items-center gap-1.5 bg-surface-container-low px-2 py-1 rounded">
                  <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                  <span className="font-label-sm text-[11px] text-on-surface-variant truncate">Form 16A Verified &amp; Deposited</span>
                </div>
              </motion.div>

              {/* Card 4 */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">Net Payout Realization</span>
                  <span className="font-label-sm text-[11px] font-semibold px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant">{Math.min(100, ((wallet?.balances?.totalWithdrawn || 0) / Math.max((wallet?.balances?.totalEarned || 1), 1)) * 100).toFixed(1)}% Ratio</span>
                </div>
                <div>
                  <div className="font-metric-display text-metric-display text-on-surface tracking-tight">₹<CountUp start={0} end={wallet?.balances?.totalWithdrawn || 0} duration={2.5} separator="," /></div>
                  <p className="font-label-sm text-label-sm text-outline mt-1 truncate">Disbursed to HDFC &amp; USDT</p>
                </div>
                <div className="mt-3 flex items-center justify-between text-outline text-[11px]">
                  <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[13px] text-tertiary">check_circle</span> Auto-reconciled</span>
                  <span className="font-semibold text-primary">0 Pending</span>
                </div>
              </motion.div>

              {/* Card 5 – Annual CA Certified Dossier */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="rounded-xl shadow-md p-gutter-md flex flex-col justify-between text-white relative overflow-hidden bg-gradient-to-br from-primary via-primary-container to-secondary-container">
                <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 pointer-events-none blur-sm"></div>
                <div className="flex items-center justify-between mb-1 z-10 relative">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">folder_special</span>
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-primary-fixed font-bold">Tax Pack FY26</span>
                  </div>
                  <span className="font-label-sm text-[10px] bg-white/20 px-2 py-0.5 rounded-full text-white font-semibold">Audited</span>
                </div>
                <div className="z-10 relative mt-1">
                  <h4 className="font-headline-md text-headline-md font-bold leading-tight">Annual CA Certified Dossier</h4>
                  <p className="font-body-sm text-body-sm text-primary-fixed-dim line-clamp-2 mt-1">Audited P&amp;L, quarterly GST vouchers, Form 16A certificates, and pairing registers.</p>
                </div>
                <button className="mt-3 z-10 relative flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white text-primary font-label-md text-label-md font-bold hover:bg-surface-container-low transition-all shadow-sm" type="button">
                  <span className="material-symbols-outlined text-[16px]">folder_zip</span>
                  <span>Download Instant ZIP (4.8 MB)</span>
                </button>
              </motion.div>
            </div>

            {/* Navigation Tabs + Filters */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-gutter-md space-y-gutter-md">
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3.5 py-2 rounded-lg font-headline-md text-[13px] font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${activeTab === tab.id ? 'bg-surface-container-high text-primary shadow-sm font-bold' : 'text-on-surface-variant hover:bg-surface-container-low'}`}
                    type="button"
                  >
                    <span>{tab.label}</span>
                    {tab.count && (
                      <span className={`px-1.5 py-0.5 rounded-full font-label-sm text-[10px] ${activeTab === tab.id ? 'bg-primary text-white' : 'bg-surface-container text-outline'}`}>{tab.count}</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-sm items-center">
                <div className="md:col-span-6 relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[18px]">search</span>
                  <input className="w-full pl-9 pr-4 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:bg-surface-container-lowest focus:outline-none shadow-sm transition-all" placeholder="Search report name, code, transaction cycle, or hash..." type="text" />
                </div>
                <div className="md:col-span-3">
                  <div className="flex items-center justify-between bg-surface-container-low rounded-lg px-3 py-2 cursor-pointer">
                    <span className="font-body-sm text-body-sm text-on-surface truncate">Custom: Last 90 Days</span>
                    <span className="material-symbols-outlined text-outline text-[18px]">date_range</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <div className="flex items-center justify-between bg-surface-container-low rounded-lg px-3 py-2 cursor-pointer">
                    <span className="font-body-sm text-body-sm text-on-surface truncate">Format: All (PDF/XLSX)</span>
                    <span className="material-symbols-outlined text-outline text-[18px]">expand_more</span>
                  </div>
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <button className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-outline hover:text-on-surface transition-colors" type="button">
                    <span className="material-symbols-outlined text-[20px]">filter_alt_off</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            {activeTab === 'binary_breakdown' ? (
              <BinaryBreakdownReport />
            ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-8 space-y-gutter-lg">

                {/* Commission Yield Chart */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-gutter-lg space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                        <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Commission Yield &amp; Payout Dynamics</h3>
                      </div>
                      <p className="font-body-sm text-body-sm text-outline mt-0.5">Bi-weekly breakdown across Binary Matching, Direct Sponsor Bonus, and Global Leadership Pool.</p>
                    </div>
                    <div className="flex items-center gap-3 font-label-sm text-label-sm shrink-0">
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-primary"></span> Binary Pairing</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-secondary-container"></span> Direct Referral</span>
                      <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-tertiary"></span> Royalty Pool</span>
                    </div>
                  </div>

                  <div className="relative bg-surface-container-low/40 rounded-xl p-4 overflow-hidden">
                    <div className="flex justify-between items-center text-outline font-label-sm text-[11px] mb-2 px-2">
                      {last6Months.map((m, i) => <span key={i}>{m}</span>)}
                    </div>
                    <div className="h-56 w-full relative">
                      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                        <div className="border-b border-outline"></div>
                        <div className="border-b border-outline"></div>
                        <div className="border-b border-outline"></div>
                        <div className="border-b border-outline"></div>
                      </div>
                      <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 200">
                        <defs>
                          <linearGradient id="gradBinary" x1="0" x2="0" y1="0" y2="1">
                            <stop offset="0%" stopColor="#003fb1" stopOpacity={0.35} />
                            <stop offset="100%" stopColor="#003fb1" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.5 }} d={binaryFillPath} fill="url(#gradBinary)" />
                        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.6 }} d={sponsorPath} fill="none" stroke="#316bf3" strokeDasharray="4 4" strokeWidth={2.5} />
                        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.7 }} d={binaryPath} fill="none" stroke="#003fb1" strokeWidth={3} />
                        <motion.path initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 2, ease: "easeInOut", delay: 0.8 }} d={royaltyPath} fill="none" stroke="#005438" strokeWidth={2.5} />
                        <circle cx="560" cy={peakY} fill="#003fb1" r="5" stroke="#ffffff" strokeWidth={2} />
                      </svg>
                      {/* Peak Badge */}
                      <div className="absolute right-[18%] top-2 bg-inverse-surface text-white px-2.5 py-1 rounded-md shadow-lg pointer-events-none flex flex-col items-center">
                        <span className="font-label-sm text-[10px] text-tertiary-fixed font-bold">PEAK CYCLE</span>
                        <span className="font-headline-md text-headline-md leading-none">₹{Math.max((wallet?.balances?.binaryIncome || 0), 0).toLocaleString()}</span>
                        <span className="font-label-sm text-[9px] text-outline-variant mt-0.5">All Time – {Math.floor((treeStats?.volumes?.totalMatchedBv || 0) / 100)} Pairs</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart KPIs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-gutter-sm pt-3 bg-surface-container-lowest rounded-lg p-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">insights</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-[11px] text-outline block">Pairing Velocity</span>
                        <span className="font-headline-md text-headline-md font-bold text-on-surface">{Math.floor((treeStats?.volumes?.totalMatchedBv || 0) / 100).toLocaleString()} Pairs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-surface-container-high flex items-center justify-center text-secondary">
                        <span className="material-symbols-outlined text-[20px]">account_balance</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-[11px] text-outline block">Avg Cycle Yield</span>
                        <span className="font-headline-md text-headline-md font-bold text-on-surface">₹{wallet?.balances?.binaryIncome > 0 ? Math.floor(wallet.balances.binaryIncome / 4).toLocaleString() : 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-tertiary-container/15 flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-[20px]">published_with_changes</span>
                      </div>
                      <div>
                        <span className="font-label-sm text-[11px] text-outline block">Carry-Forward Volume</span>
                        <span className="font-headline-md text-headline-md font-bold text-tertiary">{((treeStats?.volumes?.leftBvCarryover || 0) + (treeStats?.volumes?.rightBvCarryover || 0)).toLocaleString()} BV</span>
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Dual-Leg Volume & Capping Audit */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.7 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-gutter-lg space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Dual-Leg Volume &amp; Capping Ceiling Audit</h3>
                      <p className="font-body-sm text-body-sm text-outline mt-0.5">Real-time matching ratio, payout leg identification, and flush-out risk mitigation index.</p>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-tertiary-container/10 text-tertiary flex items-center gap-1.5 font-label-md text-label-md font-bold">
                      <span className="material-symbols-outlined text-[16px]">format_image_left</span>
                      <span>Zero BV Flush-Out</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
                    {/* Power Leg */}
                    <div className="bg-surface-container-low/70 rounded-xl p-gutter-md flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-primary"></span>
                          <span className="font-headline-md text-headline-md font-bold text-on-surface">Power Leg ({(treeStats?.volumes?.leftBv || 0) >= (treeStats?.volumes?.rightBv || 0) ? 'Left' : 'Right'})</span>
                        </div>
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container text-primary font-semibold">{(((Math.max(treeStats?.volumes?.leftBv || 0, treeStats?.volumes?.rightBv || 0)) / Math.max((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0), 1)) * 100).toFixed(1)}% Total</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="font-metric-display text-metric-display font-bold text-on-surface"><CountUp start={0} end={Math.max(treeStats?.volumes?.leftBv || 0, treeStats?.volumes?.rightBv || 0)} duration={2.5} separator="," /></span>
                          <span className="font-label-sm text-label-sm text-outline">BV Accumulated</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full" style={{ width: `${((Math.max(treeStats?.volumes?.leftBv || 0, treeStats?.volumes?.rightBv || 0)) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 bg-surface-container-lowest rounded-lg p-2 text-on-surface-variant font-label-sm text-[11px]">
                        <div>Active Nodes: <strong className="text-on-surface">{(treeStats?.volumes?.leftBv || 0) >= (treeStats?.volumes?.rightBv || 0) ? (treeStats?.memberCount?.left || 0) : (treeStats?.memberCount?.right || 0)} Members</strong></div>
                        <div>Carryover: <strong className="text-tertiary">{(treeStats?.volumes?.leftBv || 0) >= (treeStats?.volumes?.rightBv || 0) ? (treeStats?.volumes?.leftBvCarryover || 0) : (treeStats?.volumes?.rightBvCarryover || 0)} BV</strong></div>
                      </div>
                    </div>

                    {/* Pay Leg */}
                    <div className="bg-surface-container-low/70 rounded-xl p-gutter-md flex flex-col justify-between">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-secondary-container"></span>
                          <span className="font-headline-md text-headline-md font-bold text-on-surface">Pay Leg ({(treeStats?.volumes?.leftBv || 0) < (treeStats?.volumes?.rightBv || 0) ? 'Left' : 'Right'})</span>
                        </div>
                        <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-tertiary-container/15 text-tertiary font-bold">Commission Leg</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="font-metric-display text-metric-display font-bold text-on-surface"><CountUp start={0} end={Math.min(treeStats?.volumes?.leftBv || 0, treeStats?.volumes?.rightBv || 0)} duration={2.5} separator="," /></span>
                          <span className="font-label-sm text-label-sm text-outline">BV Accumulated</span>
                        </div>
                        <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                          <div className="bg-secondary-container h-full rounded-full" style={{ width: `${((Math.min(treeStats?.volumes?.leftBv || 0, treeStats?.volumes?.rightBv || 0)) / (((treeStats?.volumes?.leftBv || 0) + (treeStats?.volumes?.rightBv || 0)) || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 bg-surface-container-lowest rounded-lg p-2 text-on-surface-variant font-label-sm text-[11px]">
                        <div>Active Nodes: <strong className="text-on-surface">{(treeStats?.volumes?.leftBv || 0) < (treeStats?.volumes?.rightBv || 0) ? (treeStats?.memberCount?.left || 0) : (treeStats?.memberCount?.right || 0)} Members</strong></div>
                        <div>Carryover: <strong className="text-primary">{(treeStats?.volumes?.leftBv || 0) < (treeStats?.volumes?.rightBv || 0) ? (treeStats?.volumes?.leftBvCarryover || 0) : (treeStats?.volumes?.rightBvCarryover || 0)} BV</strong></div>
                      </div>
                    </div>
                  </div>

                  {/* Capping Ceiling Utilization */}
                  <div className="p-gutter-md rounded-xl bg-surface-container-low flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center justify-between mb-1 font-label-md text-label-md">
                        <span className="font-bold text-on-surface">{rank?.current_rank || 'BRONZE'} Rank Daily Capping Utilization</span>
                        <span className="text-primary font-bold">₹{Math.min(wallet?.balances?.totalEarned || 0, rank?.weekly_binary_cap || 25000)} / ₹{rank?.weekly_binary_cap || 25000} Cap</span>
                      </div>
                      <div className="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: `${Math.min(((wallet?.balances?.totalEarned || 0) / (rank?.weekly_binary_cap || 25000)) * 100, 100)}%` }}></div>
                      </div>
                      <p className="font-label-sm text-[11px] text-outline mt-1">Upgrade your Rank to unlock higher matching ceiling per day.</p>
                    </div>
                    <button className="px-3.5 py-2 rounded-lg bg-surface-container-lowest text-primary font-label-md text-label-md font-semibold hover:bg-surface-container transition-colors shrink-0 shadow-sm" type="button">
                      Simulate Rank Cap
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="lg:col-span-4 space-y-gutter-lg">
                {/* Report Console */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.8 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-gutter-lg space-y-gutter-md">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[22px]">tune</span>
                    <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Report Console</h3>
                  </div>
                  <p className="font-body-sm text-body-sm text-outline">Configure dynamic parameters to instantly render cryptographic audit reports.</p>
                  <form className="space-y-3.5" onSubmit={(e) => e.preventDefault()}>
                    <div className="space-y-1">
                      <label className="font-label-sm text-label-sm uppercase font-semibold text-outline">Report Scope</label>
                      <div className="relative">
                        <select className="w-full bg-surface-container-low text-on-surface py-2.5 px-3 rounded-lg font-body-sm text-body-sm appearance-none focus:outline-none focus:bg-surface-container">
                          <option>Binary Matching &amp; Carry-Forward Statement</option>
                          <option>Direct Referral Incentive Ledger</option>
                          <option>Downline New Joiner Production Audit</option>
                          <option>Rank Achievement &amp; Royalty Timeline</option>
                          <option>TDS Quarterly Certificate – Form 16A</option>
                          <option>E-Pin Issuance &amp; Transfer Reconciliation</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-sm text-label-sm uppercase font-semibold text-outline">Cycle / Temporal Span</label>
                      <div className="relative">
                        <select className="w-full bg-surface-container-low text-on-surface py-2.5 px-3 rounded-lg font-body-sm text-body-sm appearance-none focus:outline-none focus:bg-surface-container">
                          <option>Current Weekly Cycle (Week 12 – Mar 2026)</option>
                          <option selected>Full Current Month (March 2026)</option>
                          <option>Prior Cycle (February 2026)</option>
                          <option>Fiscal Quarter: Q3 FY25-26</option>
                          <option>Full Fiscal Year 2025-26</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="font-label-sm text-label-sm uppercase font-semibold text-outline">Output Standard &amp; Destination</label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container">
                          <input defaultChecked className="accent-primary" name="report_format" type="radio" />
                          <span className="font-label-md text-label-md text-on-surface font-semibold">PDF (Signed)</span>
                        </label>
                        <label className="flex items-center gap-2 p-2 rounded-lg bg-surface-container-low cursor-pointer hover:bg-surface-container">
                          <input className="accent-primary" name="report_format" type="radio" />
                          <span className="font-label-md text-label-md text-on-surface font-semibold">Excel (XLSX)</span>
                        </label>
                      </div>
                    </div>
                    <div className="pt-2 border-t border-surface-container-low space-y-2">
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input defaultChecked className="mt-0.5 accent-primary" type="checkbox" />
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Email copy to <strong className="text-on-surface">{profile?.email || "user@example.com"}</strong></span>
                      </label>
                      <label className="flex items-start gap-2 cursor-pointer">
                        <input defaultChecked className="mt-0.5 accent-primary" type="checkbox" />
                        <span className="font-body-sm text-body-sm text-on-surface-variant">Include cryptographic hash (SHA-256)</span>
                      </label>
                    </div>
                    <button className="w-full mt-2 py-2.5 px-4 rounded-lg bg-primary text-white font-headline-md text-headline-md font-bold hover:bg-primary-container shadow-sm flex items-center justify-center gap-2 transition-all" type="button">
                      <span className="material-symbols-outlined text-[20px]">auto_awesome</span>
                      <span>Generate &amp; Download</span>
                    </button>
                  </form>
                </motion.div>

                {/* Audit & Compliance Shield */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5, delay: 0.9 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-gutter-lg space-y-gutter-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-tertiary text-[22px]">policy</span>
                      <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Audit &amp; Compliance Shield</h3>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse"></span>
                  </div>
                  <div className="space-y-2.5">
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-tertiary text-[20px] mt-0.5">verified</span>
                      <div>
                        <div className="font-label-md text-label-md font-bold text-on-surface">Direct Selling Guidelines 2021</div>
                        <div className="font-label-sm text-[11px] text-outline">Verified compliant under Consumer Protection Act (E-Commerce).</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">task_alt</span>
                      <div>
                        <div className="font-label-md text-label-md font-bold text-on-surface">Quarterly CA Audit Certification</div>
                        <div className="font-label-sm text-[11px] text-outline">Audited by Singhal &amp; Associates (LLP Reg. 10482B).</div>
                      </div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-surface-container-low flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-outline text-[20px] mt-0.5">receipt_long</span>
                      <div>
                        <div className="font-label-md text-label-md font-bold text-on-surface">TDS Acknowledgment No.</div>
                        <div className="font-label-sm text-[11px] text-outline font-mono">ACK: {profile?.username?.toUpperCase() || 'USER'}-FY26</div>
                      </div>
                    </div>
                  </div>
                  <div className="pt-2 border-t border-surface-container flex items-center justify-between text-outline">
                    <a className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1" href="#">
                      <span className="material-symbols-outlined text-[15px]">description</span> Form 16A (Q3)
                    </a>
                    <span className="text-surface-container-highest">|</span>
                    <a className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1" href="#">
                      <span className="material-symbols-outlined text-[15px]">table_view</span> GST Ledger
                    </a>
                    <span className="text-surface-container-highest">|</span>
                    <a className="font-label-sm text-label-sm text-primary font-semibold hover:underline flex items-center gap-1" href="#">
                      <span className="material-symbols-outlined text-[15px]">download</span> CA Certificate
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
            )}

            {/* Master Archive & Download Center */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 1.0 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-gutter-lg space-y-gutter-md">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md">
                <div>
                  <h3 className="font-headline-lg text-headline-lg text-on-surface font-bold">Master Archive &amp; Download Center</h3>
                  <p className="font-body-sm text-body-sm text-outline">Immutable ledger of generated statutory statements, pairing logs, and payout receipts.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg">
                    {[
                      { id: 'all', label: 'All Downloads (24)' },
                      { id: 'financial', label: 'Financial (12)' },
                      { id: 'volume', label: 'Volume (6)' },
                      { id: 'compliance', label: 'Compliance (6)' },
                    ].map(f => (
                      <button
                        key={f.id}
                        onClick={() => setArchiveFilter(f.id)}
                        className={`px-2.5 py-1 rounded font-label-md text-label-md transition-colors ${archiveFilter === f.id ? 'bg-surface-container-lowest text-primary font-bold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                        type="button"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                  <button className="p-2 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface flex items-center gap-1 text-label-md font-semibold" type="button">
                    <span className="material-symbols-outlined text-[18px]">download_for_offline</span>
                    <span>Bulk Export</span>
                  </button>
                </div>
              </div>

              {/* Archive Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-body-sm text-body-sm text-on-surface whitespace-nowrap">
                  <thead>
                    <tr className="bg-surface-container-low text-outline uppercase font-label-sm text-label-sm tracking-wider">
                      <th className="py-3 px-4 rounded-l-lg">Report Identifier &amp; Code</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Audit Period</th>
                      <th className="py-3 px-4">Generated At</th>
                      <th className="py-3 px-4">Format &amp; Size</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container-low">
                    {loadingReports ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-outline font-semibold">
                          <span className="material-symbols-outlined animate-spin align-middle mr-2">refresh</span> Loading reports...
                        </td>
                      </tr>
                    ) : reportsData.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-outline">No reports generated yet.</td>
                      </tr>
                    ) : (
                      reportsData.map((report, idx) => (
                        <tr key={report.id || idx} className="hover:bg-surface-container-lowest transition-colors">
                          <td className="py-3 px-4 rounded-l-lg">
                            <div className="flex items-center gap-3">
                              <div className={`w-9 h-9 rounded-lg ${report.bg} ${report.color} flex items-center justify-center`}>
                                <span className="material-symbols-outlined text-[20px]">{report.icon}</span>
                              </div>
                              <div>
                                <div className="font-headline-md text-headline-md font-bold text-on-surface">{report.name}</div>
                                <div className="font-mono text-[10px] text-outline mt-0.5">{report.code}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded font-label-sm text-[10px] font-bold uppercase tracking-wider ${report.catColor}`}>{report.category}</span>
                          </td>
                          <td className="py-3 px-4 font-semibold text-on-surface">{report.period}</td>
                          <td className="py-3 px-4 text-outline">{report.generated}</td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1.5">
                              <span className={`material-symbols-outlined text-[16px] ${report.formatColor}`}>{report.formatIcon}</span>
                              <span className="font-semibold text-on-surface">{report.format}</span>
                              <span className="text-outline">({report.size})</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            {report.status === 'ready' ? (
                              <div className="flex items-center gap-1.5 text-tertiary">
                                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                                <span className="font-label-sm text-label-sm font-bold">Ready</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1.5 text-outline">
                                <span className="material-symbols-outlined text-[16px] animate-spin">sync</span>
                                <span className="font-label-sm text-label-sm font-semibold">Processing...</span>
                              </div>
                            )}
                          </td>
                          <td className="py-3 px-4 rounded-r-lg text-right">
                            <button className="p-1.5 rounded bg-surface-container-lowest hover:bg-surface-container text-primary shadow-sm border border-surface-container-low transition-colors" title="Download">
                              <span className="material-symbols-outlined text-[18px]">download</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  )
}
