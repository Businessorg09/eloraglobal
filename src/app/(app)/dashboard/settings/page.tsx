'use client'

import { useState, useEffect, Suspense } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { signOutAction } from '@/app/auth/actions'

function SettingsContent() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [activeTab, setActiveTab] = useState('profile')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalType, setModalType] = useState('bank')
  const router = useRouter()
  const searchParams = useSearchParams()

  // Bank form state
  const [bankForm, setBankForm] = useState({
    beneficiaryName: profile?.full_name || '',
    accountNumber: '',
    confirmAccountNumber: '',
    ifscCode: '',
    accountType: 'savings',
    bankName: '',
    branchName: '',
    bankCity: '',
    isCustomBank: false,
  })
  const [ifscLoading, setIfscLoading] = useState(false)
  const [ifscError, setIfscError] = useState('')
  const [ifscFound, setIfscFound] = useState(false)

  const lookupIFSC = async (code: string) => {
    if (code.length < 11) return
    setIfscLoading(true)
    setIfscError('')
    setIfscFound(false)
    try {
      const res = await fetch(`https://ifsc.razorpay.com/${code.toUpperCase()}`)
      if (!res.ok) throw new Error('Not found')
      const data = await res.json()
      setBankForm(p => ({
        ...p,
        bankName: data.BANK || '',
        branchName: data.BRANCH || '',
        bankCity: data.CITY || '',
        isCustomBank: false,
      }))
      setIfscFound(true)
    } catch {
      setIfscError('IFSC not found. Please enter bank name manually.')
      setBankForm(p => ({ ...p, bankName: '', branchName: '', bankCity: '', isCustomBank: true }))
    } finally {
      setIfscLoading(false)
    }
  }

  useEffect(() => {
    const tab = searchParams.get('tab')
    const action = searchParams.get('action')
    if (tab) setActiveTab(tab)
    if (action === 'add_bank') {
      setIsModalOpen(true)
      setModalType('bank')
    } else {
      // Scroll to banking section if hash is present
      const hash = window.location.hash
      if (hash === '#banking-section') {
        setTimeout(() => {
          document.getElementById('banking-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        }, 400)
      }
    }
  }, [searchParams])

  const handleLogout = async () => {
    await signOutAction()
    router.push('/login')
  }

  const openModal = (type: string) => {
    setModalType(type)
    setBankForm(p => ({ ...p, beneficiaryName: profile?.full_name || '' }))
    setIfscFound(false)
    setIfscError('')
    setIsModalOpen(true)
  }

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">

            {/* EXECUTIVE HEADER & ACTION TOOLBAR */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-gutter-md">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-outline font-label-sm text-label-sm">
                  <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span>Member Governance</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                  <span className="text-primary font-bold">Settings &amp; Security</span>
                </div>
                <div className="flex items-center gap-3">
                  <h1 className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">Settings &amp; Account Governance</h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-[10px] font-bold flex items-center gap-1 uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span> Enterprise Node: {profile?.referral_code || 'GUEST'}
                  </span>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Configure placement automation, direct-selling KYC compliance, multi-factor security, and payout disbursement protocols.</p>
              </div>

              <div className="flex items-center flex-wrap gap-2.5">
                <button className="px-3.5 py-2 rounded-lg bg-surface-container-lowest shadow-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md transition-all flex items-center gap-1.5" type="button">
                  <span className="material-symbols-outlined text-[18px]">history</span> Activity Ledger
                </button>
                <button className="px-3.5 py-2 rounded-lg bg-surface-container-lowest shadow-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low font-label-md transition-all flex items-center gap-1.5" type="button">
                  <span className="material-symbols-outlined text-[18px]">download</span> Export Audit Log
                </button>
                <button className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md shadow-sm transition-all flex items-center gap-2 active:scale-95 font-bold" type="button">
                  <span className="material-symbols-outlined text-[18px]">check_circle</span> Save Preferences
                </button>
                <div className="h-6 w-px bg-surface-container mx-1"></div>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-error-container text-[#93000a] hover:bg-[#ffdad6] font-label-md shadow-sm transition-all flex items-center gap-1.5 active:scale-95 font-bold" type="button">
                  <span className="material-symbols-outlined text-[18px]">logout</span> Sign Out
                </button>
              </div>
            </motion.div>

            {/* TOP KPI EXECUTIVE SECURITY & ACCOUNT COMMAND BAR */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter-md">
              <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[22px]">verified_user</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[12px]">check</span> Level 3
                  </span>
                </div>
                <div>
                  <p className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">KYC Compliance</p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">Fully Verified</p>
                  <p className="font-body-sm text-[11px] text-outline mt-0.5">PAN • Aadhaar • Penny Drop OK</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[22px]">lock</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-primary font-label-sm text-[10px] font-bold">TOTP Active</span>
                </div>
                <div>
                  <p className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">2-Factor Auth</p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">Google Auth</p>
                  <p className="font-body-sm text-[11px] text-outline mt-0.5">6 of 8 Backup Codes Left</p>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[22px]">shield_with_heart</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-[10px] font-bold">98 / 100</span>
                </div>
                <div>
                  <p className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">Integrity Score</p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">Exceptional</p>
                  <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden mt-1.5">
                    <div className="bg-tertiary h-full rounded-full" style={{ width: '98%' }}></div>
                  </div>
                </div>
              </div>

              <div className="bg-surface-container-lowest p-gutter-md rounded-xl shadow-sm flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 rounded-lg bg-surface-container-low flex items-center justify-center text-[#316bf3]">
                    <span className="material-symbols-outlined text-[22px]">sync_alt</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface font-label-sm text-[10px] font-bold">Auto-Sweep</span>
                </div>
                <div>
                  <p className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">Weekly Settlement</p>
                  <p className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">NEFT / USDT</p>
                  <p className="font-body-sm text-[11px] text-outline mt-0.5">Cycle: Every Friday 23:59 IST</p>
                </div>
              </div>

              <div className="bg-primary text-white p-gutter-md rounded-xl shadow-sm flex flex-col justify-between space-y-3 relative overflow-hidden group">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none group-hover:scale-125 transition-transform duration-500"></div>
                <div className="flex items-start justify-between relative z-10">
                  <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center text-white">
                    <span className="material-symbols-outlined text-[22px]">gavel</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-white/20 text-white font-label-sm text-[10px] font-bold uppercase tracking-wider">Anti-Theft</span>
                </div>
                <div className="relative z-10">
                  <p className="font-label-sm text-[10px] text-white/80 uppercase tracking-wider font-bold">Emergency Protocol</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="font-headline-md text-headline-md font-bold text-white">VIP Node Lock</span>
                    <button className="px-2.5 py-1 rounded bg-white text-primary font-label-sm text-[10px] font-bold shadow-sm hover:bg-surface-container-high transition-colors" type="button">Arm Lock</button>
                  </div>
                  <p className="font-body-sm text-[11px] text-white/80 mt-1">Instant withdrawal freeze &amp; audit snap</p>
                </div>
              </div>
            </motion.div>

            {/* NAVIGATION TAB BAR */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="bg-surface-container-lowest rounded-xl shadow-sm p-1.5 overflow-x-auto">
              <div className="flex items-center gap-1 min-w-[720px]">
                {[
                  { id: 'profile', icon: 'badge', label: 'Profile & KYC Verification' },
                  { id: 'security', icon: 'encrypted', label: 'Security & 2FA Auth' },
                  { id: 'banking', icon: 'account_balance', label: 'Banking & Payout Wallets' },
                  { id: 'network', icon: 'schema', label: 'Network & Placement Rules' },
                  { id: 'notifications', icon: 'notifications_active', label: 'Notifications & Webhooks' },
                  { id: 'api', icon: 'code', label: 'API & Developer Keys' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 rounded-lg font-label-md font-bold flex items-center gap-2 transition-all ${activeTab === tab.id ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}
                    type="button"
                  >
                    <span className="material-symbols-outlined text-[18px]">{tab.icon}</span> {tab.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* MAIN CONTENT WORKSPACE */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg items-start">
              
              {/* LEFT 8 COLUMNS */}
              <div className="lg:col-span-8 space-y-gutter-lg">
                
                {/* Profile & Distributor Identity */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-gutter-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">manage_accounts</span>
                      </div>
                      <div>
                        <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Distributor Identity &amp; Profile</h2>
                        <p className="font-body-sm text-body-sm text-outline">Manage enterprise node ownership and verified contact coordinates</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container text-on-surface font-label-sm text-[11px] font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span> Node Active
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-gutter-md rounded-xl bg-surface-container-low">
                    <div>
                      <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block font-bold">Affiliate Node ID</span>
                      <span className="font-headline-md text-headline-md font-bold text-primary flex items-center gap-1 mt-0.5">
                        {profile?.referral_code || 'GUEST'} <span className="material-symbols-outlined text-[16px] text-tertiary" title="Verified Node Key">verified</span>
                      </span>
                    </div>
                    <div>
                      <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block font-bold">Direct Sponsor ID</span>
                      <span className="font-headline-md text-headline-md font-bold text-on-surface flex items-center gap-1 mt-0.5">
                        BINARYADDONECOM <span className="material-symbols-outlined text-[16px] text-primary" title="Diamond Direct Uplink">diamond</span>
                      </span>
                    </div>
                    <div>
                      <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider block font-bold">Enrollment Timestamp</span>
                      <span className="font-body-md font-bold text-on-surface block mt-0.5">14 Jan 2024 (Batch 04)</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-gutter-md pt-2">
                    <div className="relative group cursor-pointer flex-shrink-0">
                      <img className="w-24 h-24 rounded-2xl object-cover shadow-sm ring-2 ring-primary/20 group-hover:opacity-90 transition-opacity" alt="Avatar" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC8ZKrHhA4oPKvDTR_lQWHry3qHHAyJuiEepYU1p6uINZYAD15HBLhJF73aTKSkCoZN00svEvcJz18eDUHKh2Q9334oyTI9sl7GN6HrNMbC3F37wxJF2EzkNmNpxH-8KVuc1tTgg9trK79Tepd7KifwKypnU3pOvlDBqXckYp25xAaghA1BxzdPNkDRM84veN-i4meQ8FG8Vqwo2YHxRaI1TIBD_HqIlsl1gexb0n6IUtlRaw4yb3XjfQ" />
                      <div className="absolute inset-0 rounded-2xl bg-[#0b1c30]/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white">
                        <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                      </div>
                      <span className="absolute -bottom-2 -right-1 px-2 py-0.5 rounded-full bg-primary text-white font-label-sm text-[10px] uppercase font-bold shadow-sm">Silver</span>
                    </div>
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <h3 className="font-headline-lg font-bold text-on-surface">{profile?.full_name || 'Ibrahim Khalilolla'}</h3>
                          <p className="font-body-sm text-[13px] text-outline">Executive {rank?.displayName || 'Bronze'} Distributor • Western Region Cluster</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-sm font-bold transition-colors">Upload Photo</button>
                          <button className="px-3 py-1.5 rounded-lg bg-surface-container-low text-error hover:bg-error-container font-label-sm font-bold transition-colors">Remove</button>
                        </div>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-container space-y-1.5">
                        <div className="flex items-center justify-between font-label-sm text-[11px]">
                          <span className="text-on-surface-variant font-bold">Rank Qualification Track: {rank?.displayName || 'Bronze'} → {rank?.nextRank?.displayName || 'None'}</span>
                          <span className="text-primary font-bold">{rank?.nextRank?.progress?.bvPercent || 0}%</span>
                        </div>
                        <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full rounded-full transition-all duration-500" style={{ width: `${rank?.nextRank?.progress?.bvPercent || 0}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-gutter-md pt-2">
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Legal Full Name (as per PAN)</label>
                      <div className="relative">
                        <input defaultValue={profile?.full_name || "Ibrahim Khalilolla"} className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md font-bold focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" type="text" />
                        <span className="material-symbols-outlined text-[18px] text-tertiary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">verified</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Registered Email Address</label>
                      <div className="relative">
                        <input defaultValue={profile?.email || "ibrahim@eloraglobal.com"} className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md font-bold focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" type="email" />
                        <span className="px-2 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-[10px] font-bold absolute right-2.5 top-1/2 -translate-y-1/2 uppercase tracking-wide">Verified</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Primary Contact Phone</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 font-label-md text-outline pointer-events-none font-mono font-bold">+91</span>
                        <input defaultValue={profile?.phone?.replace('+91', '') || "9821044820"} className="w-full pl-12 pr-28 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md font-bold focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" type="tel" />
                        <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> WhatsApp
                        </span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Nationality &amp; Legal Region</label>
                      <select className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md font-bold focus:bg-surface-container-lowest focus:outline-none transition-all cursor-pointer">
                        <option>India (IN - Direct Selling Act 2021)</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2 space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Registered Operational Address</label>
                      <input defaultValue="Penthouse 1402, Signature Skyline Tower, Bandra Kurla Complex (BKC)" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md font-bold focus:bg-surface-container-lowest focus:outline-none transition-all" type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">State / Province</label>
                      <input defaultValue="Maharashtra" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md font-bold focus:bg-surface-container-lowest focus:outline-none transition-all" type="text" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">PIN / Postal Code</label>
                      <input defaultValue="400051" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-mono font-bold focus:bg-surface-container-lowest focus:outline-none transition-all" type="text" />
                    </div>
                  </div>
                </div>

                {/* Statutory KYC & Tax */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-gutter-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-tertiary">
                        <span className="material-symbols-outlined text-[20px]">assignment_turned_in</span>
                      </div>
                      <div>
                        <h2 className="font-headline-lg font-bold text-on-surface">Statutory KYC &amp; Tax Compliance</h2>
                        <p className="font-body-sm text-[13px] text-outline">Mandatory government filings for Direct Selling Guidelines 2021 &amp; TDS credit</p>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-surface-container-low text-tertiary font-label-sm text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">verified</span> Section 194H Compliant
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">Income Tax PAN</span>
                        <span className="material-symbols-outlined text-tertiary text-[18px]">verified</span>
                      </div>
                      <p className="font-headline-md font-mono font-bold text-on-surface tracking-wider">ABCDE1234F</p>
                      <div className="flex items-center justify-between font-label-sm text-[11px]">
                        <span className="text-on-surface-variant">Name on PAN:</span>
                        <span className="font-bold text-on-surface">{profile?.full_name || 'Ibrahim Khalilolla'}</span>
                      </div>
                      <p className="font-body-sm text-[11px] text-tertiary font-bold flex items-center gap-1 pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> 5% Statutory TDS (Form 26AS)
                      </p>
                    </div>

                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">Aadhaar (DigiLocker)</span>
                        <span className="material-symbols-outlined text-tertiary text-[18px]">fingerprint</span>
                      </div>
                      <p className="font-headline-md font-mono font-bold text-on-surface tracking-wider">XXXX-XXXX-9021</p>
                      <div className="flex items-center justify-between font-label-sm text-[11px]">
                        <span className="text-on-surface-variant">OTP E-KYC:</span>
                        <span className="font-bold text-tertiary">Authenticated</span>
                      </div>
                      <p className="font-body-sm text-[11px] text-outline pt-1 font-medium">UIDAI e-Sign Completed 14 Jan 2024</p>
                    </div>

                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-2 relative overflow-hidden">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider font-bold">GSTIN (Affiliate Firm)</span>
                        <span className="material-symbols-outlined text-primary text-[18px]">apartment</span>
                      </div>
                      <p className="font-headline-md font-mono font-bold text-on-surface tracking-wider">27AAAAA0000A1Z5</p>
                      <div className="flex items-center justify-between font-label-sm text-[11px]">
                        <span className="text-on-surface-variant">Entity Type:</span>
                        <span className="font-bold text-on-surface">Proprietorship</span>
                      </div>
                      <p className="font-body-sm text-[11px] text-tertiary font-bold flex items-center gap-1 pt-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Active Enterprise Affiliate
                      </p>
                    </div>
                  </div>

                  <div className="p-gutter-md rounded-xl bg-surface-container flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined text-primary text-[24px]">workspace_premium</span>
                      <div>
                        <p className="font-label-md text-[13px] font-bold text-on-surface">Elora Corporate Distributorship Deed #ELR-2024-9192</p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant mt-0.5">Signed under Direct Selling Consumer Protection Rules 2021. Valid through Dec 2026.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-primary font-label-sm font-bold shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">visibility</span> View Deed
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface font-label-sm font-bold shadow-sm flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">download</span> PDF
                      </button>
                      <button className="px-3 py-1.5 rounded-lg bg-surface-container-low text-outline hover:text-on-surface font-label-sm font-bold transition-all">Request Modification</button>
                    </div>
                  </div>
                </div>

                {/* Binary Leg Placement Rules */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-gutter-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">account_tree</span>
                      </div>
                      <div>
                        <h2 className="font-headline-lg font-bold text-on-surface">Binary Leg Placement Rules</h2>
                        <p className="font-body-sm text-body-sm text-outline">Automate the landing vector for new direct sponsor referrals and enrollment links</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-low text-primary font-label-sm text-[11px] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">bolt</span> Real-Time Auto Route
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
                    <label className="cursor-pointer p-gutter-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between space-y-3 group">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline font-bold">Leg Alpha</span>
                        <input name="leg" type="radio" value="left" className="w-4 h-4 text-primary accent-primary" />
                      </div>
                      <div>
                        <p className="font-headline-md font-bold text-on-surface">Force Left Leg</p>
                        <p className="font-body-sm text-[12px] text-outline mt-1 leading-relaxed">Route 100% of new affiliate registrations directly to extreme Left Leg depth.</p>
                      </div>
                      <div className="pt-2">
                        <span className="font-label-sm text-[11px] text-outline">Current LV: <strong className="text-on-surface">142,400 BV</strong></span>
                      </div>
                    </label>

                    <label className="cursor-pointer p-gutter-md rounded-xl bg-surface-container-low hover:bg-surface-container transition-all flex flex-col justify-between space-y-3 group">
                      <div className="flex items-center justify-between">
                        <span className="font-label-sm text-[10px] uppercase tracking-wider text-outline font-bold">Leg Beta</span>
                        <input name="leg" type="radio" value="right" className="w-4 h-4 text-primary accent-primary" />
                      </div>
                      <div>
                        <p className="font-headline-md font-bold text-on-surface">Force Right Leg</p>
                        <p className="font-body-sm text-[12px] text-outline mt-1 leading-relaxed">Direct all incoming traffic onto the extreme Right Leg power branch.</p>
                      </div>
                      <div className="pt-2">
                        <span className="font-label-sm text-[11px] text-outline">Current RV: <strong className="text-on-surface">88,200 BV</strong></span>
                      </div>
                    </label>

                    <label className="cursor-pointer p-gutter-md rounded-xl bg-surface-container-high shadow-sm flex flex-col justify-between space-y-3 relative border-2 border-primary/20">
                      <div className="flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-primary text-white font-label-sm text-[10px] font-bold uppercase tracking-wider">Recommended</span>
                        <input name="leg" type="radio" value="auto" defaultChecked className="w-4 h-4 text-primary accent-primary" />
                      </div>
                      <div>
                        <p className="font-headline-md font-bold text-primary">Smart Auto-Balance</p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant mt-1 leading-relaxed">Dynamically routes new nodes to the weaker volume leg (Right Leg) to maximize pairing cycle checks.</p>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="font-label-sm text-[11px] text-primary font-bold">Optimized Payout</span>
                        <span className="material-symbols-outlined text-[16px] text-primary">auto_fix_high</span>
                      </div>
                    </label>
                  </div>

                  <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <p className="font-label-md text-[13px] font-bold text-on-surface">Tree Downline Visibility Mode</p>
                        <p className="font-body-sm text-[12px] text-outline mt-0.5">Control how your upline and downlines view your node credentials in Genealogy</p>
                      </div>
                      <select className="px-3 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm font-bold shadow-sm">
                        <option>Full Executive Badge (Public Leader)</option>
                      </select>
                    </div>
                    <div className="h-px bg-surface-container"></div>
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <p className="font-label-md text-[13px] font-bold text-on-surface">Direct Generation WhatsApp Connection</p>
                        <p className="font-body-sm text-[12px] text-outline">Permit 1st-generation enrolled partners to tap your quick WhatsApp link on their dashboard</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-11 h-6 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:border-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Payout Settlement & Bank */}
                <div id="banking-section" className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-gutter-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">payments</span>
                      </div>
                      <div>
                        <h2 className="font-headline-lg font-bold text-on-surface">Payout Settlement &amp; Bank Architecture</h2>
                        <p className="font-body-sm text-[13px] text-outline">Primary disbursement channels, crypto backup escrow, and automatic cycle rules</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openModal('bank')} className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-white font-label-sm font-bold flex items-center gap-1.5 shadow-sm">
                        <span className="material-symbols-outlined text-[16px]">add</span> Add Bank Account
                      </button>
                      <button onClick={() => openModal('upi')} className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-sm font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">smartphone</span> Add UPI
                      </button>
                      <button onClick={() => openModal('crypto')} className="px-3 py-1.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-primary font-label-sm font-bold flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px]">currency_bitcoin</span> Add Crypto
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-3 relative border-2 border-primary/20 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold"><span className="material-symbols-outlined text-[20px]">account_balance</span></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-headline-md font-bold text-on-surface">HDFC Bank Ltd</h4>
                              <span className="px-2 py-0.5 rounded bg-primary text-white font-label-sm text-[10px] font-bold uppercase">Default Primary</span>
                            </div>
                            <p className="font-body-sm text-[12px] text-outline font-mono mt-0.5">IFSC: HDFC0000123 • BKC Branch</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Penny Drop OK</span>
                      </div>
                      <div className="space-y-1 pt-1 font-mono text-[12px]">
                        <div className="flex justify-between text-on-surface-variant"><span className="">Account Number:</span><span className="font-bold text-on-surface">*******4920</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Account Holder:</span><span className="font-bold text-on-surface font-sans">{profile?.full_name || 'Ibrahim Khalilolla'}</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Disbursement Mode:</span><span className="font-bold text-on-surface font-sans">NEFT / RTGS Instant</span></div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-outline font-medium">Auto-Sweep Active</span>
                        <button className="text-outline hover:text-on-surface font-label-sm font-bold">Edit Details</button>
                      </div>
                    </div>

                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-3 relative shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-[#316bf3] font-bold"><span className="material-symbols-outlined text-[20px]">account_balance</span></div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-headline-md font-bold text-on-surface">ICICI Bank</h4>
                              <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface font-label-sm text-[10px] font-bold uppercase">Secondary Payout</span>
                            </div>
                            <p className="font-body-sm text-[12px] text-outline font-mono mt-0.5">IFSC: ICIC0001042 • Nariman Point</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Verified Instant</span>
                      </div>
                      <div className="space-y-1 pt-1 font-mono text-[12px]">
                        <div className="flex justify-between text-on-surface-variant"><span className="">Account Number:</span><span className="font-bold text-on-surface">*******8821</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Account Holder:</span><span className="font-bold text-on-surface font-sans">{profile?.full_name || 'Ibrahim Khalilolla'}</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Account Type:</span><span className="font-bold text-on-surface font-sans">Enterprise Current</span></div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <button className="text-primary hover:text-primary-container font-label-sm font-bold">Set as Default</button>
                        <button className="text-outline hover:text-on-surface font-label-sm font-bold">Manage</button>
                      </div>
                    </div>

                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-3 relative shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-tertiary font-bold"><span className="material-symbols-outlined text-[20px]">currency_exchange</span></div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-headline-md font-bold text-on-surface">USDT (TRC-20)</h4>
                              <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-[10px] font-bold">International</span>
                            </div>
                            <p className="font-body-sm text-[12px] text-outline font-mono mt-0.5">Tether TRON Protocol</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Escrow Verified</span>
                      </div>
                      <div className="space-y-1 pt-1 font-mono text-[12px]">
                        <div className="flex justify-between text-on-surface-variant"><span className="">Wallet Address:</span><span className="font-bold text-on-surface truncate max-w-[140px]" title="TX9u7ZrkYQ...qW7pL3mN">TX9u...qW7p</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Purpose:</span><span className="font-bold text-on-surface font-sans">Cross-border Downline</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Settlement Speed:</span><span className="font-bold text-on-surface font-sans">&lt; 15 Minutes</span></div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-sm text-[11px] font-bold">Secondary Escrow</span>
                        <button className="text-outline hover:text-on-surface font-label-sm font-bold">Verify Address</button>
                      </div>
                    </div>

                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-3 relative shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold"><span className="material-symbols-outlined text-[20px]">token</span></div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-headline-md font-bold text-on-surface">Web3 Multi-Chain</h4>
                              <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-[10px] font-bold">MetaMask</span>
                            </div>
                            <p className="font-body-sm text-[12px] text-outline font-mono mt-0.5">BNB Chain &amp; Ethereum</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Linked Web3</span>
                      </div>
                      <div className="space-y-1 pt-1 font-mono text-[12px]">
                        <div className="flex justify-between text-on-surface-variant"><span className="">Wallet Address:</span><span className="font-bold text-on-surface truncate max-w-[140px]">0x71C...392F</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Asset Support:</span><span className="font-bold text-on-surface font-sans">USDT / USDC Multi-Chain</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span className="">Security Lock:</span><span className="font-bold text-tertiary font-sans">Hardware Ledger Signed</span></div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-outline font-label-sm text-[11px] font-bold">Escrow Backup</span>
                        <button className="text-outline hover:text-on-surface font-label-sm font-bold">Configure</button>
                      </div>
                    </div>

                    {/* UPI Linked Card */}
                    <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-3 relative shadow-sm">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2.5">
                          <div className="w-10 h-10 rounded-lg bg-[#5A21B3]/10 flex items-center justify-center font-bold text-[#5A21B3] text-sm">UPI</div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-headline-md font-bold text-on-surface">UPI Instant</h4>
                              <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-label-sm text-[10px] font-bold">Linked</span>
                            </div>
                            <p className="font-body-sm text-[12px] text-outline font-mono mt-0.5">GPay • PhonePe • Paytm • BHIM</p>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span> Verified</span>
                      </div>
                      <div className="space-y-1 pt-1 font-mono text-[12px]">
                        <div className="flex justify-between text-on-surface-variant"><span>UPI ID:</span><span className="font-bold text-on-surface font-sans">user@okicici</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span>Account Holder:</span><span className="font-bold text-on-surface font-sans">{profile?.full_name || 'Ibrahim Khalilolla'}</span></div>
                        <div className="flex justify-between text-on-surface-variant"><span>Mode:</span><span className="font-bold text-on-surface font-sans">IMPS Instant (24x7)</span></div>
                      </div>
                      <div className="pt-2 flex items-center justify-between">
                        <span className="text-[11px] text-outline font-medium">Instant Settlement</span>
                        <button onClick={() => openModal('upi')} className="text-outline hover:text-on-surface font-label-sm font-bold" type="button">Edit UPI</button>
                      </div>
                    </div>

                    <div onClick={() => openModal('bank')} className="p-gutter-md rounded-xl bg-surface-container-low/60 hover:bg-surface-container-low border-2 border-dashed border-outline-variant hover:border-primary transition-all cursor-pointer flex flex-col items-center justify-center text-center p-6 space-y-2 group min-h-[140px] sm:col-span-2">
                      <div className="w-12 h-12 rounded-full bg-surface-container-lowest group-hover:bg-primary group-hover:text-white text-primary transition-colors flex items-center justify-center shadow-sm">
                        <span className="material-symbols-outlined text-[24px]">add</span>
                      </div>
                      <div>
                        <p className="font-headline-md font-bold text-on-surface group-hover:text-primary transition-colors">+ Add New Payout Account</p>
                        <p className="font-body-sm text-[13px] text-outline mt-0.5">Link a verified Indian Bank, UPI ID, or Web3/USDT wallet</p>
                      </div>
                      <div className="flex items-center gap-3 pt-1">
                        <span className="font-label-sm text-[11px] text-primary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">account_balance</span> Bank Account</span>
                        <span className="text-outline">•</span>
                        <span className="font-label-sm text-[11px] text-[#5A21B3] font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">smartphone</span> UPI</span>
                        <span className="text-outline">•</span>
                        <span className="font-label-sm text-[11px] text-tertiary font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">currency_exchange</span> Crypto</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-gutter-md rounded-xl bg-surface-container-low grid grid-cols-1 sm:grid-cols-2 gap-gutter-md">
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Auto-Disbursement Minimum Trigger</label>
                      <select className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm font-bold shadow-sm">
                        <option>₹2,000 (Recommended Weekly Standard)</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Statutory TDS Certificate Mode</label>
                      <select className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm font-bold shadow-sm">
                        <option>5% TDS Credited to Form 26AS (PAN Linked)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* RIGHT 4 COLUMNS */}
              <div className="lg:col-span-4 space-y-gutter-lg">
                
                {/* Security Guard */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center gap-2.5 pb-gutter-xs">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">security</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md font-bold text-on-surface">Security &amp; Login Guard</h3>
                      <p className="font-body-sm text-[12px] text-outline">Credentials and tamper detection</p>
                    </div>
                  </div>

                  <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-label-md font-bold text-on-surface">Master Password</span>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold">Very Strong</span>
                    </div>
                    <p className="font-body-sm text-[11px] text-outline">Last changed 28 days ago. SHA-256 encrypted salted hash.</p>
                    <div className="pt-1">
                      <button className="w-full py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm font-bold shadow-sm transition-all">Update Master Password</button>
                    </div>
                  </div>

                  <div className="p-gutter-md rounded-xl bg-surface-container space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">phonelink_lock</span>
                        <span className="font-label-md font-bold text-on-surface">Two-Factor Authenticator</span>
                      </div>
                      <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">Google Authenticator or Yubikey TOTP is mandatory for all E-Wallet transfers exceeding ₹5,000.</p>
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button className="py-2 px-2 rounded-lg bg-surface-container-lowest text-primary font-label-sm font-bold hover:bg-surface-container-low shadow-sm flex items-center justify-center gap-1"><span className="material-symbols-outlined text-[14px]">qr_code</span> Show QR</button>
                      <button className="py-2 px-2 rounded-lg bg-surface-container-lowest text-error font-label-sm font-bold hover:bg-error-container shadow-sm">Reset TOTP</button>
                    </div>
                  </div>

                  {/* Transaction Security PIN */}
                  <div className="p-gutter-md rounded-xl bg-surface-container-low space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary text-[20px]">dialpad</span>
                        <span className="font-label-md font-bold text-on-surface">Transaction Security PIN</span>
                      </div>
                    </div>
                    <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">A 6-digit secure PIN is required to authorize withdrawals, fund transfers, and downline activations.</p>
                    <div className="pt-1">
                      <button className="w-full py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-sm font-bold shadow-sm transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                        Manage Security PIN
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-md text-[13px] text-on-surface-variant font-bold flex items-center justify-between">
                      <span>Anti-Phishing Email Key</span>
                      <span className="material-symbols-outlined text-[14px] text-outline">info</span>
                    </label>
                    <div className="relative">
                      <input defaultValue="ELORA-VIP-99" className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-mono font-bold focus:bg-surface-container-lowest focus:outline-none transition-all" type="text" />
                      <span className="material-symbols-outlined text-primary text-[18px] absolute right-3 top-1/2 -translate-y-1/2">key</span>
                    </div>
                    <p className="font-body-sm text-[11px] text-outline">Verified emails from Elora will always display this exact key header.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Auto-Logout on Inactivity</label>
                    <select className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md font-bold focus:bg-surface-container-lowest focus:outline-none transition-all">
                      <option>30 Minutes (Standard Enterprise)</option>
                    </select>
                  </div>
                </div>

                {/* Active Sessions */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center justify-between pb-gutter-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">devices</span>
                      </div>
                      <div>
                        <h3 className="font-headline-md font-bold text-on-surface">Active Sessions</h3>
                        <p className="font-body-sm text-[12px] text-outline">2 authorized hardware devices</p>
                      </div>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-ping"></span>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-primary">laptop_mac</span>
                        <span className="font-label-md font-bold text-on-surface">Chrome on macOS</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-surface-container text-tertiary font-label-sm text-[10px] font-bold uppercase">Current</span>
                    </div>
                    <p className="font-body-sm text-[12px] text-outline">Mumbai, India • IP: 103.21.244.12</p>
                    <p className="font-body-sm text-[11px] text-primary font-bold">Active Right Now</p>
                  </div>

                  <div className="p-3 rounded-lg bg-surface-container-low space-y-1 relative">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-outline">smartphone</span>
                        <span className="font-label-md font-bold text-on-surface">Elora iOS App</span>
                      </div>
                      <button className="text-error hover:text-on-error-container font-label-sm font-bold">Revoke</button>
                    </div>
                    <p className="font-body-sm text-[12px] text-outline">iPhone 15 Pro • Apple Push Service</p>
                    <p className="font-body-sm text-[11px] text-outline">Last active: 2 hours ago</p>
                  </div>

                  <button className="w-full py-2.5 rounded-lg bg-surface-container-low hover:bg-error hover:text-white text-error font-label-md font-bold transition-all flex items-center justify-center gap-2 group">
                    <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform">logout</span> Revoke All Other Sessions
                  </button>
                </div>

                {/* Dispatch Channels */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-gutter-md">
                  <div className="flex items-center gap-2.5 pb-gutter-xs">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-low flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">mark_email_read</span>
                    </div>
                    <div>
                      <h3 className="font-headline-md font-bold text-on-surface">Dispatch Channels</h3>
                      <p className="font-body-sm text-[12px] text-outline">Instant pairing &amp; downline alerts</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-label-md font-bold text-on-surface">Commission &amp; BV Pairing</p>
                        <p className="font-body-sm text-[11px] text-outline">Push • WhatsApp • SMS</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-label-md font-bold text-on-surface">Downline Activations</p>
                        <p className="font-body-sm text-[11px] text-outline">Instant alert when recruit joins</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-label-md font-bold text-on-surface">Payout PDF Slips</p>
                        <p className="font-body-sm text-[11px] text-outline">Automated tax voucher emailed</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" defaultChecked className="sr-only peer" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-container-low transition-colors">
                      <div className="space-y-0.5">
                        <p className="font-label-md font-bold text-on-surface">Corporate Broadcasts</p>
                        <p className="font-body-sm text-[11px] text-outline">Leadership convention bulletins</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-outline-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Statutory Rights */}
                <div className="bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-outline text-[18px]">policy</span>
                    <h4 className="font-label-md font-bold text-on-surface uppercase tracking-wider">Statutory Rights</h4>
                  </div>
                  <p className="font-body-sm text-[12px] text-outline leading-relaxed">
                    In compliance with the Direct Selling Guidelines (Consumer Protection Act 2021), participants possess cooling-off cancellation rights and buy-back policies.
                  </p>
                  <div className="pt-1 flex flex-col gap-2">
                    <a className="text-primary hover:text-primary-container font-label-sm font-bold flex items-center gap-1" href="#">
                      <span className="material-symbols-outlined text-[14px]">mail</span> Contact Grievance Redressal Officer
                    </a>
                    <button className="text-left text-outline hover:text-error font-label-sm font-bold transition-colors pt-2">
                      Voluntary Resignation &amp; Account Deletion Protocol →
                    </button>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </main>
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0b1c30]/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-surface-container-lowest w-full max-w-xl rounded-2xl shadow-xl border border-surface-container overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="px-gutter-lg py-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white shadow-sm">
                    <span className="material-symbols-outlined text-[22px]">account_balance_wallet</span>
                  </div>
                  <div>
                    <h3 className="font-headline-lg font-bold text-on-surface">Add Settlement Method</h3>
                    <p className="font-body-sm text-[12px] text-outline">Direct-selling verified disbursement &amp; crypto gateway</p>
                  </div>
                </div>
                <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container transition-colors">
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>

              <div className="p-gutter-lg overflow-y-auto space-y-gutter-md flex-1">
                <div className="grid grid-cols-3 p-1 rounded-xl bg-surface-container-low">
                  <button onClick={() => setModalType('bank')} className={`py-2 rounded-lg font-label-md font-bold transition-all flex items-center justify-center gap-1.5 text-[12px] ${modalType === 'bank' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    <span className="material-symbols-outlined text-[16px]">account_balance</span> Bank
                  </button>
                  <button onClick={() => setModalType('upi')} className={`py-2 rounded-lg font-label-md font-bold transition-all flex items-center justify-center gap-1.5 text-[12px] ${modalType === 'upi' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    <span className="material-symbols-outlined text-[16px]">smartphone</span> UPI
                  </button>
                  <button onClick={() => setModalType('crypto')} className={`py-2 rounded-lg font-label-md font-bold transition-all flex items-center justify-center gap-1.5 text-[12px] ${modalType === 'crypto' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}>
                    <span className="material-symbols-outlined text-[16px]">currency_bitcoin</span> Crypto
                  </button>
                </div>

                {modalType === 'bank' ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-surface-container flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-primary text-[20px] mt-0.5">shield</span>
                      <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">A ₹1 penny-drop verification will be run on this account. Make sure name matches your registered PAN.</p>
                    </div>

                    {/* Beneficiary Name */}
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Beneficiary Name</label>
                      <input
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        type="text"
                        placeholder="Full name as on bank account"
                        value={bankForm.beneficiaryName}
                        onChange={e => setBankForm(p => ({ ...p, beneficiaryName: e.target.value }))}
                      />
                    </div>

                    {/* Account Type */}
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Account Type</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { value: 'savings', label: 'Savings' },
                          { value: 'current', label: 'Current' },
                          { value: 'salary', label: 'Salary' },
                          { value: 'nre', label: 'NRE' },
                          { value: 'nro', label: 'NRO' },
                          { value: 'od', label: 'OD / CC' },
                        ].map(type => (
                          <button
                            key={type.value}
                            type="button"
                            onClick={() => setBankForm(p => ({ ...p, accountType: type.value }))}
                            className={`py-2 rounded-lg text-center font-label-sm text-[12px] font-bold border-2 transition-all ${
                              bankForm.accountType === type.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-surface-container-high bg-surface-container-low text-on-surface-variant hover:border-primary/40'
                            }`}
                          >{type.label}</button>
                        ))}
                      </div>
                    </div>

                    {/* Account Number */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Account Number</label>
                        <input
                          className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-mono font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                          type="password" placeholder="Enter account number"
                          value={bankForm.accountNumber}
                          onChange={e => setBankForm(p => ({ ...p, accountNumber: e.target.value.replace(/\D/g, '') }))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Confirm Account Number</label>
                        <div className="relative">
                          <input
                            className={`w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-mono font-bold focus:outline-none focus:ring-2 transition-colors ${
                              bankForm.confirmAccountNumber && bankForm.accountNumber !== bankForm.confirmAccountNumber
                                ? 'ring-2 ring-error focus:ring-error'
                                : bankForm.confirmAccountNumber && bankForm.accountNumber === bankForm.confirmAccountNumber
                                ? 'ring-2 ring-tertiary focus:ring-tertiary'
                                : 'focus:ring-primary/20'
                            }`}
                            type="text" placeholder="Re-enter account number"
                            value={bankForm.confirmAccountNumber}
                            onChange={e => setBankForm(p => ({ ...p, confirmAccountNumber: e.target.value.replace(/\D/g, '') }))}
                          />
                          {bankForm.confirmAccountNumber && bankForm.accountNumber === bankForm.confirmAccountNumber && (
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-tertiary text-[18px]">check_circle</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* IFSC Lookup */}
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Bank IFSC Code</label>
                      <div className="relative flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-mono font-bold uppercase focus:outline-none focus:ring-2 focus:ring-primary/20 pr-8"
                            type="text"
                            placeholder="e.g. HDFC0001234"
                            maxLength={11}
                            value={bankForm.ifscCode}
                            onChange={e => {
                              const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '')
                              setBankForm(p => ({ ...p, ifscCode: val }))
                              if (val.length === 11) lookupIFSC(val)
                            }}
                          />
                          {ifscLoading && (
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-primary text-[18px] animate-spin">progress_activity</span>
                          )}
                          {ifscFound && !ifscLoading && (
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-tertiary text-[18px]">check_circle</span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => lookupIFSC(bankForm.ifscCode)}
                          disabled={ifscLoading || bankForm.ifscCode.length < 11}
                          className="px-3 py-2.5 rounded-lg bg-primary text-white font-label-sm font-bold shadow-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-secondary transition-colors whitespace-nowrap"
                        >
                          {ifscLoading ? 'Fetching...' : 'Lookup'}
                        </button>
                      </div>
                      {ifscError && <p className="text-error font-body-sm text-[11px] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">warning</span>{ifscError}</p>}
                    </div>

                    {/* Bank Details - auto-filled or custom */}
                    {(ifscFound || bankForm.isCustomBank) && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-surface-container-low rounded-xl border border-surface-container-high animate-in fade-in duration-200">
                        <div className="space-y-1.5">
                          <label className="font-label-md text-[13px] text-on-surface-variant font-bold">
                            Bank Name {bankForm.isCustomBank && <span className="text-primary">(Enter manually)</span>}
                          </label>
                          <input
                            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container text-on-surface font-body-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            type="text"
                            placeholder="e.g. State Bank of India"
                            value={bankForm.bankName}
                            onChange={e => setBankForm(p => ({ ...p, bankName: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Branch Name</label>
                          <input
                            className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container text-on-surface font-body-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                            type="text"
                            placeholder="Branch name"
                            value={bankForm.branchName}
                            onChange={e => setBankForm(p => ({ ...p, branchName: e.target.value }))}
                          />
                        </div>
                        {bankForm.bankCity && (
                          <div className="sm:col-span-2 flex items-center gap-2 text-tertiary font-label-sm text-[12px] font-semibold">
                            <span className="material-symbols-outlined text-[14px]">location_on</span>
                            {bankForm.bankCity}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Custom bank entry if IFSC not found */}
                    {!ifscFound && !bankForm.isCustomBank && bankForm.ifscCode.length > 0 && bankForm.ifscCode.length < 11 && (
                      <p className="font-body-sm text-[11px] text-outline">Enter all 11 characters of the IFSC code to auto-fetch bank details.</p>
                    )}
                  </div>
                ) : modalType === 'upi' ? (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-3 rounded-lg bg-surface-container flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-[#5A21B3] text-[20px] mt-0.5">smartphone</span>
                      <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">Link your UPI ID for instant IMPS settlements (24x7). Supports GPay, PhonePe, Paytm, BHIM, and all UPI-enabled apps.</p>
                    </div>

                    {/* Name */}
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Account Holder Name</label>
                      <input
                        className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20"
                        type="text"
                        placeholder="Full name as linked to UPI"
                        defaultValue={profile?.full_name || ''}
                      />
                    </div>

                    {/* UPI ID */}
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Your UPI ID</label>
                      <div className="relative">
                        <input
                          id="upi-id-input"
                          className="w-full px-3.5 py-2.5 pr-10 rounded-lg bg-surface-container-low text-on-surface font-body-sm font-bold focus:outline-none focus:ring-2 focus:ring-[#5A21B3]/30 transition-colors"
                          type="text"
                          placeholder="yourname@upi"
                        />
                        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">alternate_email</span>
                      </div>
                      <p className="font-body-sm text-[11px] text-outline">Examples: name@okicici &nbsp;•&nbsp; name@ybl &nbsp;•&nbsp; name@paytm &nbsp;•&nbsp; number@upi</p>
                    </div>

                    {/* UPI App Badges */}
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Linked UPI App</label>
                      <div className="grid grid-cols-4 gap-2">
                        {[
                          { name: 'GPay', icon: 'payments', color: '#4285F4' },
                          { name: 'PhonePe', icon: 'smartphone', color: '#5A21B3' },
                          { name: 'Paytm', icon: 'account_balance_wallet', color: '#00BAF2' },
                          { name: 'BHIM', icon: 'qr_code_2', color: '#E53935' },
                        ].map(app => (
                          <button
                            key={app.name}
                            type="button"
                            className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-surface-container-low hover:bg-surface-container border-2 border-surface-container-high hover:border-primary/30 transition-all"
                          >
                            <span className="material-symbols-outlined text-[22px]" style={{ color: app.color }}>{app.icon}</span>
                            <span className="font-label-sm text-[10px] font-bold text-on-surface-variant">{app.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2">
                      <span className="material-symbols-outlined text-amber-600 text-[18px] mt-0.5">info</span>
                      <p className="font-body-sm text-[12px] text-amber-800">A ₹1 test credit will be sent to verify your UPI ID. Settlements will appear in your UPI-linked bank account within seconds.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-surface-container flex items-start gap-2.5">
                      <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">currency_exchange</span>
                      <p className="font-body-sm text-[12px] text-on-surface-variant leading-relaxed">Cross-border international downlines and weekly crypto sweeping settle in pegged stablecoins. Ensure the exact matching network.</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Settlement Network / Coin</label>
                        <select className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm font-bold focus:outline-none">
                          <option>USDT - TRON (TRC-20)</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Wallet Label / Alias</label>
                        <input className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-sm font-bold focus:outline-none" type="text" defaultValue="Executive Cold Storage" />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold">Public Wallet Address</label>
                      <div className="relative">
                        <input className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-mono font-bold focus:outline-none" type="text" defaultValue="TX9u7ZrkYQ392FVm6K2oW7pL3mNw8810" />
                        <span className="material-symbols-outlined text-primary absolute right-3 top-1/2 -translate-y-1/2 text-[18px]">content_paste</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="font-label-md text-[13px] text-on-surface-variant font-bold flex items-center justify-between">
                        <span>2FA Authenticator Code</span>
                        <span className="font-label-sm text-[10px] text-primary font-bold uppercase">Google Auth</span>
                      </label>
                      <input placeholder="6-digit code" maxLength={6} className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-mono font-bold tracking-widest text-center text-headline-md focus:outline-none" type="text" defaultValue="849 201" />
                    </div>
                  </div>
                )}
              </div>

              <div className="px-gutter-lg py-3.5 border-t border-surface-container bg-surface-container-low flex items-center justify-end gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface font-label-md font-bold transition-all">Cancel</button>
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white font-label-md font-bold shadow-sm transition-all flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">verified</span> Verify &amp; Link
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface">Loading settings...</div>}>
      <SettingsContent />
    </Suspense>
  )
}
