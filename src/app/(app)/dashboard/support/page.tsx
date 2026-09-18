'use client'

import { useState, useEffect } from 'react'
import { useDashboardContext } from '@/components/dashboard/DashboardContext'
import Header from '@/components/dashboard/Header'

import Sidebar from '@/components/dashboard/Sidebar'
import Link from 'next/link'
import { motion } from 'framer-motion'

export default function SupportPage() {
  const { profile, rank, wallet, treeStats, loading: contextLoading } = useDashboardContext();

  const [activeFilter, setActiveFilter] = useState('all')

  const [tickets, setTickets] = useState<any[]>([])
  const [isFetching, setIsFetching] = useState(true)
  
  // Form State
  const [subject, setSubject] = useState('')
  const [category, setCategory] = useState('financial')
  const [priority, setPriority] = useState('Normal')
  const [nodeContext, setNodeContext] = useState('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchTickets = async () => {
    try {
      setIsFetching(true)
      const res = await fetch('/api/support/tickets')
      const data = await res.json()
      if (data.tickets) {
        setTickets(data.tickets)
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsFetching(false)
    }
  }

  useEffect(() => {
    fetchTickets()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/support/tickets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: subject + (nodeContext ? ` [Node: ${nodeContext}]` : ''),
          category,
          priority: priority === 'Normal' ? 'MEDIUM' : priority === 'High' ? 'HIGH' : 'URGENT',
          description,
        })
      })
      const data = await res.json()
      if (res.ok) {
        alert('Ticket submitted successfully!')
        setSubject('')
        setDescription('')
        setNodeContext('')
        fetchTickets()
      } else {
        alert(data.error || 'Failed to submit ticket')
      }
    } catch (err) {
      alert('An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  const filteredTickets = activeFilter === 'all' ? tickets : activeFilter === 'active' ? tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS') : activeFilter === 'resolved' ? tickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED') : tickets;
  
  const openCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;
  const closedCount = tickets.filter(t => t.status === 'CLOSED' || t.status === 'RESOLVED').length;

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <Header />

        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">

            {/* Breadcrumbs & Title */}
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.1 }} className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-outline font-label-sm text-label-sm">
                  <Link href="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link>
                  <span>/</span>
                  <span className="text-outline">Member Care &amp; Services</span>
                  <span>/</span>
                  <span className="text-on-surface font-semibold">Support &amp; Help Desk</span>
                </div>
                <div className="flex flex-wrap items-center gap-gutter-sm pt-0.5">
                  <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Executive Help Desk &amp; VIP Care</h1>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-lowest shadow-sm">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                    <span className="font-label-sm text-label-sm text-tertiary font-semibold">All Systems Operational</span>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container shadow-sm">
                    <span className="material-symbols-outlined text-[14px] text-primary">schedule</span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-semibold">Avg. Response: 14 mins</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-gutter-sm shrink-0 w-full md:w-auto">
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md hover:bg-surface-container-low transition-all shadow-sm" type="button">
                  <span className="material-symbols-outlined text-[18px] text-outline">menu_book</span>
                  <span>Knowledge Base</span>
                </button>
                <button className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-lowest text-on-surface font-label-md hover:bg-surface-container-low transition-all shadow-sm" type="button">
                  <span className="material-symbols-outlined text-[18px] text-outline">dns</span>
                  <span>System Status</span>
                </button>
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white font-label-md shadow-sm hover:bg-primary-container transition-all" type="button">
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  <span>Raise New Ticket</span>
                </button>
              </div>
            </motion.div>

            {/* Top Cards Grid */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.2 }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-gutter-md">
              <div className="p-gutter-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-outline mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Active Tickets</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-metric-display text-metric-display text-on-surface font-bold">{openCount}</span>
                    <span className="font-headline-md text-headline-md text-primary font-bold">Open</span>
                  </div>
                  <p className="font-label-sm text-[11px] text-outline mt-1">{openCount > 0 ? `${openCount} in review` : 'All clear'}</p>
                </div>
              </div>

              <div className="p-gutter-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-outline mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Resolved Tickets</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined text-[18px]">task_alt</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="font-metric-display text-metric-display text-on-surface font-bold">{closedCount}</span>
                    <span className="font-label-md text-label-md px-1.5 py-0.5 rounded-full bg-surface-container text-tertiary font-bold">100% CSAT</span>
                  </div>
                  <p className="font-label-sm text-[11px] text-outline mt-1">Lifetime inquiries handled smoothly</p>
                </div>
              </div>

              <div className="p-gutter-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-outline mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Support Tier</span>
                  <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center text-primary">
                    <span className="material-symbols-outlined text-[18px]">workspace_premium</span>
                  </div>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-lg text-headline-lg text-primary font-bold">{rank?.current_rank || 'Bronze'} VIP</span>
                  </div>
                  <p className="font-label-sm text-[11px] text-outline mt-1">Priority queue • Dedicated KAM Desk</p>
                </div>
              </div>

              <div className="p-gutter-md rounded-xl bg-surface-container-lowest shadow-sm flex flex-col justify-between group hover:shadow-md transition-all">
                <div className="flex items-center justify-between text-outline mb-2">
                  <span className="font-label-sm text-label-sm uppercase tracking-wider font-semibold">Key Acct Mgr</span>
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary ring-2 ring-surface-container-lowest" title="Available Online"></span>
                </div>
                <div>
                  <span className="font-headline-md text-headline-md text-on-surface truncate block font-bold">Rajesh Khurana</span>
                  <p className="font-label-sm text-[11px] text-outline mt-1">9 AM – 8 PM IST • Ext #402</p>
                </div>
              </div>

              <div className="p-gutter-md rounded-xl bg-primary text-white shadow-sm flex flex-col justify-between relative overflow-hidden group">
                <div className="absolute -right-4 -bottom-4 w-20 h-20 rounded-full bg-white/20 pointer-events-none blur-xl"></div>
                <div className="flex items-center justify-between mb-2 z-10">
                  <span className="font-label-sm text-[10px] uppercase tracking-widest text-primary-fixed-dim font-bold">24/7 Escrow Desk</span>
                  <span className="material-symbols-outlined text-[20px] text-tertiary-fixed">headset_mic</span>
                </div>
                <div className="z-10">
                  <span className="font-headline-md text-[20px] tracking-tight font-bold block">1800-419-ELORA</span>
                  <div className="flex items-center gap-2 mt-2">
                    <a className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-white text-primary font-label-sm text-[10px] font-bold hover:bg-surface-container-low transition-all" href="#">
                      <span className="material-symbols-outlined text-[14px]">chat</span>
                      <span>Concierge</span>
                    </a>
                    <span className="font-label-sm text-[10px] text-primary-fixed-dim">Instant VIP Line</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Main Content Area */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 }} className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
              {/* LEFT 8 COLUMNS */}
              <div className="lg:col-span-8 space-y-gutter-lg">

                {/* Fast Triage Categories */}
                <div className="p-gutter-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-gutter-md">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Fast Triage Categories</h2>
                      <p className="font-body-sm text-body-sm text-outline">Select your inquiry domain for prioritized smart-routing directly to specialist executives.</p>
                    </div>
                    <span className="font-label-sm text-[11px] px-2.5 py-1 rounded-full bg-surface-container text-primary font-bold">Auto-Routed</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-gutter-sm">
                    {[
                      { icon: 'account_balance_wallet', title: 'Financial & Payout', sla: '~15 mins' },
                      { icon: 'account_tree', title: 'Genealogy & Tree', sla: 'Leg Audits' },
                      { icon: 'verified_user', title: 'KYC & Compliance', sla: 'Aadhaar/PAN' },
                      { icon: 'pin', title: 'E-Pin & Packages', sla: 'Transfer/Batch' },
                      { icon: 'equalizer', title: 'BV Discrepancy', sla: 'Cycle Reconcile' }
                    ].map((cat, i) => (
                      <button key={i} className="p-3 rounded-lg bg-surface-container-low text-left hover:bg-surface-container-high transition-all flex flex-col justify-between group" type="button">
                        <div className="w-8 h-8 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary mb-2 shadow-sm">
                          <span className="material-symbols-outlined text-[20px]">{cat.icon}</span>
                        </div>
                        <span className="font-label-md text-on-surface font-bold text-xs leading-tight">{cat.title}</span>
                        <span className="font-label-sm text-[10px] text-outline mt-1">{cat.sla}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Raise Support Ticket Box */}
                <div className="p-gutter-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-gutter-md">
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center text-primary">
                        <span className="material-symbols-outlined text-[20px]">edit_note</span>
                      </div>
                      <div>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Raise Support Ticket</h2>
                        <p className="font-body-sm text-body-sm text-outline">Submit detailed context for high-velocity dispatch &amp; tracking</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-1 font-label-sm text-label-sm text-outline">
                      <span>Ticket Preview:</span>
                      <span className="font-mono text-primary font-bold">#TK-98215</span>
                    </div>
                  </div>

                  <form className="space-y-gutter-md" onSubmit={e => e.preventDefault()}>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
                      <div className="md:col-span-2 space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-bold flex items-center justify-between">
                          <span>Inquiry Subject</span>
                          <span className="font-label-sm text-[10px] text-outline font-normal">e.g., Weekly Binary Carry Forward missing</span>
                        </label>
                        <input className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all" placeholder="Describe the core issue succinctly..." required type="text" value={subject} onChange={(e) => setSubject(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-bold">Category Domain</label>
                        <div className="relative">
                          <select className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all appearance-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="financial">Financial &amp; Payout Issues</option>
                            <option value="genealogy">Genealogy &amp; Tree Placement</option>
                            <option value="kyc">KYC &amp; Compliance Verification</option>
                            <option value="epin">E-Pin &amp; Package Activation</option>
                            <option value="bv">Commission &amp; BV Discrepancy</option>
                            <option value="portal">Backoffice Portal / Technical</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter-md">
                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-bold">Priority SLA Level</label>
                        <div className="grid grid-cols-3 gap-1">
                          <label className="cursor-pointer">
                            <input defaultChecked className="peer sr-only" name="priority" type="radio" value="Normal" onChange={() => setPriority('Normal')} />
                            <div className="py-2.5 px-2 text-center rounded-lg bg-surface-container-low peer-checked:bg-surface-container-highest peer-checked:text-primary font-label-sm text-[11px] text-on-surface-variant font-bold transition-all">Normal</div>
                          </label>
                          <label className="cursor-pointer">
                            <input className="peer sr-only" name="priority" type="radio" value="High" onChange={() => setPriority('High')} />
                            <div className="py-2.5 px-2 text-center rounded-lg bg-surface-container-low peer-checked:bg-surface-container-highest peer-checked:text-primary font-label-sm text-[11px] text-on-surface-variant font-bold transition-all">High</div>
                          </label>
                          <label className="cursor-pointer">
                            <input className="peer sr-only" name="priority" type="radio" value="Urgent" onChange={() => setPriority('Urgent')} />
                            <div className="py-2.5 px-2 text-center rounded-lg bg-surface-container-low peer-checked:bg-error-container peer-checked:text-error font-label-sm text-[11px] text-on-surface-variant font-bold transition-all">VIP Urgent</div>
                          </label>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-bold">Affected Node ID / Txn (Optional)</label>
                        <input className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all" placeholder="e.g. INFG0844 or TXN-99823" type="text" value={nodeContext} onChange={(e) => setNodeContext(e.target.value)} />
                      </div>
                      <div className="space-y-1.5">
                        <label className="font-label-md text-label-md text-on-surface font-bold">Position Context</label>
                        <div className="relative">
                          <select className="w-full px-3.5 py-2.5 rounded-lg bg-surface-container-low font-body-sm text-on-surface focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all appearance-none">
                            <option>Not Applicable / Account Level</option>
                            <option>Left Binary Leg</option>
                            <option>Right Binary Leg</option>
                            <option>Direct Sponsor Tree (Unilevel)</option>
                          </select>
                          <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-[18px]">expand_more</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="font-label-md text-label-md text-on-surface font-bold">Issue Description &amp; Ledger Reference</label>
                        <div className="flex flex-wrap items-center gap-2 text-outline font-label-sm text-label-sm">
                          <span className="hover:text-primary cursor-pointer font-bold" title="Add Bold format">B</span>
                          <span className="hover:text-primary cursor-pointer font-mono" title="Add Code/ID">Code</span>
                          <span className="hover:text-primary cursor-pointer" title="Add Date">Date</span>
                        </div>
                      </div>
                      <textarea className="w-full p-3 rounded-lg bg-surface-container-low font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all" placeholder="Detail the timeline, transaction hash, or member placement specifics. Provide the expected outcome so executive staff can execute immediate reconciliation." required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}></textarea>
                    </div>

                    <div className="space-y-1.5">
                      <label className="font-label-md text-label-md text-on-surface font-bold">Verification Proofs / Screenshots / Bank Slips</label>
                      <div className="relative p-6 rounded-xl bg-surface-container-low text-center hover:bg-surface-container transition-all flex flex-col items-center justify-center cursor-pointer border-2 border-dashed border-surface-container-highest">
                        <input className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" multiple type="file" />
                        <div className="w-10 h-10 rounded-full bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm mb-2">
                          <span className="material-symbols-outlined text-[22px]">cloud_upload</span>
                        </div>
                        <p className="font-label-md text-on-surface font-bold"><span className="text-primary">Click to browse</span> or drag and drop transaction slips</p>
                        <p className="font-label-sm text-[11px] text-outline mt-0.5">PNG, JPG, PDF up to 10MB each (Encrypted Enterprise Vault Storage)</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-md pt-2">
                      <label className="flex items-center gap-2.5 cursor-pointer">
                        <input defaultChecked className="w-4 h-4 rounded text-primary accent-primary" type="checkbox" />
                        <span className="font-label-md text-on-surface font-bold">Send real-time updates via SMS &amp; WhatsApp</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <button className="px-4 py-2 rounded-lg bg-surface-container-low text-on-surface-variant font-label-md hover:bg-surface-container transition-all font-bold" type="reset" onClick={() => {setSubject(''); setDescription(''); setNodeContext('');}}>Clear Form</button>
                        <button className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white font-label-md shadow-sm hover:bg-primary-container transition-all font-bold disabled:opacity-50" type="button" disabled={isSubmitting} onClick={handleSubmit}>
                          <span className="material-symbols-outlined text-[18px]">send</span>
                          <span>{isSubmitting ? 'Submitting...' : 'Submit Support Ticket'}</span>
                        </button>
                      </div>
                    </div>
                  </form>
                </div>

                {/* Knowledge Base */}
                <div className="p-gutter-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Knowledge Base &amp; Instant Solutions</h2>
                      <p className="font-body-sm text-body-sm text-outline">Verified answers for immediate self-resolution without raising a ticket</p>
                    </div>
                    <span className="font-label-sm text-[11px] text-outline">Updated daily for FY26 policy</span>
                  </div>

                  <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[20px] text-outline">search</span>
                    <input className="w-full pl-11 pr-4 py-3 rounded-xl bg-surface-container-low font-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all" placeholder="Search 200+ help articles, video guides, and compensation rules..." type="text" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
                    {[
                      { tag: 'Binary Rules', icon: 'thumb_up', tag2: '98% Helpful', tag2Color: 'text-tertiary', title: 'How to resolve binary leg mismatch or missing BV?', desc: 'A definitive walkthrough on midnight cycle audits, pending gateway approvals, and carry-forward calculation formulas.', time: '2 mins read' },
                      { tag: 'Taxation', icon: '', tag2: 'Q4 Fiscal', tag2Color: 'text-outline', title: 'TDS Deduction & Form 16A issuance schedule for FY26', desc: 'Learn Section 194H compliance schedules, quarterly certificate releases, and linking updated PAN for lower 5% threshold.', time: '4 mins read' },
                      { tag: 'Payouts', icon: '', tag2: 'Escrow FAQ', tag2Color: 'text-outline', title: 'Bank settlement delayed past 24 hours - Step-by-step checklist', desc: 'NEFT/IMPS processing clearing windows, RBI RTGS settlement holidays, and how to verify bank account IFSC lock status.', time: '3 mins read' },
                      { tag: 'E-Pins', icon: 'shield', tag2: 'Security Verified', tag2Color: 'text-tertiary', title: 'How to transfer unused E-Pins to downline members securely', desc: 'Two-factor OTP authorization protocols, recipient node ID confirmation, and irreversible batch ledger locks.', time: '2 mins read' },
                    ].map((kb, i) => (
                      <div key={i} className="p-4 rounded-xl bg-surface-container-low hover:bg-surface-container transition-all group flex flex-col justify-between cursor-pointer">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between">
                            <span className="font-label-sm text-[10px] px-2 py-0.5 rounded bg-surface-container text-primary font-bold">{kb.tag}</span>
                            <span className={`font-label-sm text-[10px] ${kb.tag2Color} font-bold flex items-center gap-1`}>
                              {kb.icon && <span className="material-symbols-outlined text-[14px]">{kb.icon}</span>} {kb.tag2}
                            </span>
                          </div>
                          <h3 className="font-label-md text-on-surface group-hover:text-primary transition-colors font-bold text-sm leading-tight">{kb.title}</h3>
                          <p className="font-body-sm text-[11.5px] text-on-surface-variant line-clamp-2 leading-relaxed">{kb.desc}</p>
                        </div>
                        <div className="flex items-center justify-between pt-3 text-outline font-label-sm text-[11px]">
                          <span className="flex items-center gap-1 font-semibold"><span className="material-symbols-outlined text-[14px]">schedule</span> {kb.time}</span>
                          <span className="text-primary font-bold group-hover:translate-x-1 transition-transform">Read Article →</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ticket History Table */}
                <div className="p-gutter-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-gutter-md">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-gutter-sm">
                    <div>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">Ticket History &amp; Audit Ledger</h2>
                      <p className="font-body-sm text-body-sm text-outline">Real-time status tracking, historical transcripts, and resolution metrics</p>
                    </div>
                    <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface font-label-sm font-bold hover:bg-surface-container transition-all self-start sm:self-auto" type="button">
                      <span className="material-symbols-outlined text-[16px] text-outline">download</span>
                      <span>Export CSV</span>
                    </button>
                  </div>

                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-gutter-sm">
                    <div className="flex flex-wrap items-center gap-1 bg-surface-container-low p-1 rounded-xl">
                      {[
                        { id: 'all', label: `All Tickets (${tickets.length})` },
                        { id: 'active', label: `Active / In-Progress (${openCount})` },
                        { id: 'resolved', label: `Resolved (${closedCount})` },
                      ].map(tab => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFilter(tab.id)}
                          className={`px-3 py-1.5 rounded-lg font-label-sm text-[11px] font-bold transition-all ${activeFilter === tab.id ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'}`}
                          type="button"
                        >
                          {tab.label}
                        </button>
                      ))}
                    </div>
                    <div className="relative w-full md:w-56">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[16px] text-outline">search</span>
                      <input className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-surface-container-low font-body-sm text-[12px] text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm transition-all" placeholder="Filter ID or keyword..." type="text" />
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left font-body-sm text-body-sm">
                      <thead className="text-outline font-label-sm text-[10px] font-bold uppercase tracking-wider bg-surface-container-low">
                        <tr>
                          <th className="py-3 px-4 rounded-l-lg">Ticket ID</th>
                          <th className="py-3 px-4">Subject &amp; Domain</th>
                          <th className="py-3 px-4">Created / Updated</th>
                          <th className="py-3 px-4">Executive Desk</th>
                          <th className="py-3 px-4">Priority</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4 rounded-r-lg text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y-0 space-y-1">
                        {isFetching ? (
                          <tr><td colSpan={7} className="py-8 text-center text-outline">Loading tickets...</td></tr>
                        ) : filteredTickets.length === 0 ? (
                          <tr><td colSpan={7} className="py-8 text-center text-outline">No tickets found.</td></tr>
                        ) : filteredTickets.map((t, i) => (
                          <tr key={t.id || i} className="group hover:bg-surface-container-low transition-colors border-b border-surface-container-lowest last:border-0">
                            <td className="py-3 px-4 font-mono font-bold text-primary">#{t.id ? t.id.substring(0, 8).toUpperCase() : 'NEW'}</td>
                            <td className="py-3 px-4">
                              <div className="font-label-md text-on-surface font-bold line-clamp-1">{t.subject}</div>
                              <span className="font-label-sm text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-surface-container text-outline mt-1 inline-block">{t.category}</span>
                            </td>
                            <td className="py-3 px-4 text-on-surface-variant font-medium">
                              <div>{new Date(t.created_at).toLocaleDateString()}</div>
                              <span className="font-label-sm text-[10px] text-outline">{new Date(t.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            </td>
                            <td className="py-3 px-4">
                              <div className="font-label-md font-bold text-on-surface">Auto-Routing</div>
                              <span className="font-label-sm text-[10px] text-outline">Tier 1</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-bold ${t.priority === 'URGENT' ? 'bg-error-container text-error' : t.priority === 'HIGH' ? 'bg-tertiary-container text-tertiary' : 'bg-surface-container-high text-on-surface-variant'}`}>{t.priority}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1 font-label-sm text-[10px] px-2.5 py-0.5 rounded-full font-bold ${t.status === 'OPEN' ? 'bg-secondary-container text-secondary' : t.status === 'CLOSED' ? 'bg-surface-container-high text-outline' : 'bg-primary-container text-primary'}`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <div className="inline-flex items-center gap-1">
                                <button className="p-1.5 rounded text-outline hover:text-primary hover:bg-surface-container transition-all" title="View Thread" type="button">
                                  <span className="material-symbols-outlined text-[18px]">forum</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>

              {/* RIGHT 4 COLUMNS */}
              <div className="lg:col-span-4 space-y-gutter-lg">

                {/* VIP Manager Card */}
                <div className="p-gutter-lg rounded-xl bg-surface-container-lowest shadow-sm flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-16 bg-surface-container-low"></div>
                  <div className="absolute top-3 right-3 font-label-sm text-[10px] font-bold px-2 py-0.5 rounded-full bg-primary-container text-primary">VIP Desk</div>
                  <div className="w-20 h-20 rounded-full border-4 border-surface-container-lowest shadow-sm overflow-hidden z-10 bg-surface mt-2 mb-3">
                    <img alt="Rajesh Khurana" className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1556157382-97eda2d62296?w=150&q=80" />
                  </div>
                  <div className="font-headline-lg text-on-surface font-bold">Rajesh Khurana</div>
                  <div className="font-label-sm text-[11px] text-primary font-bold uppercase tracking-wider mb-2">VP of Network Relations</div>
                  <div className="flex items-center gap-1 text-tertiary font-label-sm text-[11px] font-bold bg-tertiary-container/10 px-2 py-0.5 rounded-full mb-5">
                    <span className="material-symbols-outlined text-[14px]">star</span> 4.9/5 <span className="text-outline font-normal mx-1">•</span> <span className="text-on-surface">3.2K+ tickets resolved</span>
                  </div>

                  <div className="w-full text-left space-y-2 font-body-sm text-[12px] pb-5 border-b border-surface-container-low">
                    <div className="flex justify-between">
                      <span className="text-outline">Direct Extension:</span>
                      <span className="font-bold text-on-surface">#402</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">Office Availability:</span>
                      <span className="font-bold text-on-surface text-right">Mon-Sat, 9 AM - 8 PM IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-outline">Direct Phone:</span>
                      <span className="font-bold text-on-surface">Available upon verified request</span>
                    </div>
                  </div>

                  <div className="w-full flex gap-2 pt-5">
                    <button className="flex-1 py-2 rounded-lg bg-[#e8f9ef] text-[#25d366] font-label-md font-bold hover:bg-[#d1f4df] transition-colors flex items-center justify-center gap-1.5" type="button">
                      <span className="material-symbols-outlined text-[18px]">forum</span> WhatsApp
                    </button>
                    <button className="flex-1 py-2 rounded-lg bg-primary text-white font-label-md font-bold shadow-sm hover:bg-primary-container transition-colors flex items-center justify-center gap-1.5" type="button">
                      <span className="material-symbols-outlined text-[18px]">call</span> Request Call
                    </button>
                  </div>
                </div>

                {/* Statutory Escalation Matrix */}
                <div className="p-gutter-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-gutter-md">
                  <div className="flex items-start gap-2.5 border-b border-surface-container-low pb-3">
                    <div className="w-8 h-8 rounded bg-surface-container-low text-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">gavel</span>
                    </div>
                    <div>
                      <h3 className="font-label-md text-on-surface font-bold text-sm">Statutory Escalation Matrix</h3>
                      <p className="font-body-sm text-[11px] text-outline mt-0.5">Direct Selling Guidelines 2021 Compliance</p>
                    </div>
                  </div>

                  <div className="space-y-1 pt-1">
                    <div className="font-label-sm text-[9px] uppercase tracking-wider text-outline font-bold">Nodal Grievance Officer</div>
                    <div className="font-label-md text-on-surface font-bold">Adv. Sunita Deshmukh</div>
                    <div className="font-label-sm text-[11px] text-outline">High Court Advocate &amp; Chief Compliance Counsel</div>
                  </div>

                  <div className="space-y-2 font-body-sm text-[11px]">
                    <div className="flex items-start gap-1">
                      <span className="text-outline shrink-0 mt-0.5">Official Redressal Email:</span>
                      <a href="mailto:grievance@eloraglobal.com" className="text-primary font-bold hover:underline break-all">grievance@eloraglobal.com</a>
                    </div>
                    <div className="flex items-start justify-between">
                      <span className="text-outline">Direct Line:</span>
                      <span className="font-bold text-on-surface">Available upon verified request</span>
                    </div>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg flex items-start gap-2 text-primary">
                    <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">verified_user</span>
                    <div className="font-label-sm text-[11px] font-bold leading-relaxed">
                      <span className="text-on-surface">Statutory Turnaround SLA</span><br/>
                      <span className="font-normal text-outline">Mandatory acknowledgment within <strong className="text-on-surface">48 hours</strong>; complete legal redressal within <strong className="text-on-surface">30 days</strong> as per Consumer Protection Direct Selling Rules.</span>
                    </div>
                  </div>

                  <button className="w-full py-2 rounded-lg bg-surface-container text-on-surface font-label-md font-bold flex items-center justify-center gap-1.5 hover:bg-surface-container-high transition-colors text-xs" type="button">
                    <span className="material-symbols-outlined text-[16px]">description</span>
                    Download Grievance Policy (PDF)
                    <span className="material-symbols-outlined text-[14px] ml-1">open_in_new</span>
                  </button>
                </div>

                {/* Leadership Channels */}
                <div className="p-gutter-lg rounded-xl bg-surface-container-lowest shadow-sm space-y-gutter-md">
                  <div className="flex items-center justify-between">
                    <h3 className="font-headline-md text-on-surface font-bold">Leadership Channels</h3>
                    <span className="flex items-center gap-1 font-label-sm text-[10px] font-bold text-tertiary">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span> Live Broadcasts
                    </span>
                  </div>

                  <div className="space-y-2.5">
                    <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-[#e8f4fc] text-[#2ca5e0] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">send</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-label-md text-on-surface font-bold">Elora Elite Telegram</div>
                        <div className="font-label-sm text-[10px] text-outline mt-0.5">16.4K Verified Diamond Leaders</div>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors">arrow_forward</span>
                    </a>

                    <a href="#" className="flex items-center gap-3 p-3 rounded-lg bg-surface-container-low hover:bg-surface-container transition-colors group">
                      <div className="w-10 h-10 rounded-lg bg-[#e8f9ef] text-[#25d366] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[24px]">forum</span>
                      </div>
                      <div className="flex-1">
                        <div className="font-label-md text-on-surface font-bold">WhatsApp Announce</div>
                        <div className="font-label-sm text-[10px] text-outline mt-0.5">Admin Broadcast • Invite Only</div>
                      </div>
                      <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-primary transition-colors">arrow_forward</span>
                    </a>
                  </div>

                  <div className="p-3 rounded-lg bg-primary-fixed-dim/20 border border-primary/10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 bg-primary text-white rounded font-label-sm text-[9px] font-bold uppercase tracking-wider flex items-center gap-1">
                        <span className="material-symbols-outlined text-[10px]">videocam</span> Zoom Tech Clinics
                      </span>
                      <span className="font-label-sm text-[9px] text-primary font-bold uppercase">Weekly Session</span>
                    </div>
                    <div>
                      <div className="font-label-md text-on-surface font-bold leading-tight">Live BOP &amp; Tech Troubleshooting</div>
                      <div className="font-body-sm text-[11px] text-outline mt-0.5">Every Tuesday &amp; Friday at 7:00 PM IST</div>
                    </div>
                    <div className="flex items-center justify-between pt-2">
                      <span className="font-mono text-[11px] text-primary font-bold bg-white px-2 py-0.5 rounded shadow-sm">ID: 849 2011 9920</span>
                      <button className="font-label-sm text-[10px] text-primary font-bold hover:underline" type="button">Add to Calendar</button>
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>

          </div>
        </main>
      </div>
    </div>
  )
}
