'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { GenealogyNode } from '@/components/tree/GenealogyNode'
import { GenealogyInspector } from '@/components/tree/GenealogyInspector'
import Sidebar from '@/components/dashboard/Sidebar'
import { motion } from 'framer-motion'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import CountUp from 'react-countup'

export default function TreePage() {
  const [treeData, setTreeData] = useState<any>(null)
  const [treeStats, setTreeStats] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [binaryMembers, setBinaryMembers] = useState<any[]>([])
  const [focusUserId, setFocusUserId] = useState<string>('')
  const [searchUsername, setSearchUsername] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [selectedNode, setSelectedNode] = useState<any>(null)
  const [treeDepth, setTreeDepth] = useState<number>(4)
  const [maxTreeDepth, setMaxTreeDepth] = useState<number>(4)
  const router = useRouter()

  useEffect(() => {
    fetchProfile()
    fetchWallet()
    fetchStats()
    fetchTeam()
    fetchBinaryMembers()
  }, [])

  useEffect(() => {
    if (profile) {
      fetchTree(focusUserId || profile.id)
    }
  }, [profile, focusUserId])

  const fetchStats = async () => {
    try {
      const statsRes = await fetch('/api/tree/stats')
      if (statsRes.ok) {
        const sData = await statsRes.json()
        setTreeStats(sData)
      }
    } catch (err) {
      console.error('Failed to fetch stats', err)
    }
  }

  const fetchTeam = async () => {
    try {
      const teamRes = await fetch('/api/user/team')
      if (teamRes.ok) {
        const tmData = await teamRes.json()
        setTeam(tmData)
      }
    } catch (err) {
      console.error('Failed to fetch team', err)
    }
  }

  const fetchBinaryMembers = async () => {
    try {
      const res = await fetch('/api/tree/binary-list')
      if (res.ok) {
        const data = await res.json()
        setBinaryMembers(data.members || [])
      }
    } catch (err) {
      console.error('Failed to fetch binary members', err)
    }
  }

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.status === 401) {
        // removed aggressive logout
        return
      }
      const data = await res.json()
      setProfile(data.profile)
    } catch {
      setError('Failed to load profile details.')
    }
  }

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet/balance')
      if (res.ok) {
        const data = await res.json()
        setWallet(data)
      }
    } catch {
      // Ignore
    }
  }

  const fetchTree = async (userId: string) => {
    setLoading(true)
    setError('')
    try {
      // Only pass userId param when viewing someone else's tree (not your own)
      const url = profile && userId === profile.id
        ? `/api/tree/my-tree?t=${Date.now()}`
        : `/api/tree/my-tree?userId=${userId}&t=${Date.now()}`

      const res = await fetch(url)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to fetch tree structure.')
      setTreeData(data)

      // --- Auto-calculate actual max depth from node data ---
      if (data.nodes && data.nodes.length > 0 && data.rootId) {
        const parentMap = new Map<string, string>()
        data.nodes.forEach((n: any) => {
          if (n.parentId) parentMap.set(n.id, n.parentId)
        })
        let maxDepth = 1
        data.nodes.forEach((n: any) => {
          let depth = 1
          let current = n.id
          while (parentMap.has(current)) {
            depth++
            current = parentMap.get(current)!
            if (depth > 200) break
          }
          if (depth > maxDepth) maxDepth = depth
        })
        setMaxTreeDepth(maxDepth)
        // Show max 6 levels by default so the canvas isn't impossibly wide
        setTreeDepth(Math.min(maxDepth, 6))
      }
      // ---------------------------------------------------
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }


  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      // removed aggressive logout
    } catch {
      console.error('Logout failed')
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchUsername) return;
    if (treeData && treeData.nodes) {
      const found = treeData.nodes.find((n: any) => n.username.toLowerCase() === searchUsername.toLowerCase());
      if (found) {
        setFocusUserId(found.userId);
        setSearchUsername('');
      } else {
        alert("User not found in currently loaded tree view.");
      }
    }
  };

  const buildTreeHierarchy = () => {
    if (!treeData || !treeData.nodes || treeData.nodes.length === 0) return null

    const nodesMap = new Map<string, any>()
    treeData.nodes.forEach((n: any) => {
      nodesMap.set(n.id, { ...n, left: null, right: null })
    })

    const rootId = treeData.rootId
    const root = nodesMap.get(rootId)

    if (!root) return null

    treeData.nodes.forEach((n: any) => {
      if (n.parentId && nodesMap.has(n.parentId)) {
        const parent = nodesMap.get(n.parentId)
        if (n.position === 'L') {
          parent.left = nodesMap.get(n.id)
        } else if (n.position === 'R') {
          parent.right = nodesMap.get(n.id)
        }
      }
    })

    return root
  }

  const treeRoot = buildTreeHierarchy()

  // Safely default left/right root volumes
  const rootLeftBv = treeRoot?.volumes?.leftTotal || 0
  const rootRightBv = treeRoot?.volumes?.rightTotal || 0

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      {/* Universal Dashboard Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <motion.header 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="h-header-height bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-gutter-lg sticky top-0"
        >
          <div className="flex items-center gap-gutter-md flex-1 max-w-lg">
            <div className="relative w-full">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">search</span>
              <input 
                className="w-full pl-9 pr-14 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all" 
                placeholder="Search members, node ID, wallet..." 
                type="text" 
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-outline pointer-events-none">⌘K</div>
            </div>
          </div>
          <div className="flex items-center gap-gutter-lg">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
              <span className="font-label-sm text-label-sm font-semibold text-on-surface">Live Data</span>
            </div>
            <button className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors" type="button">
              <span className="material-symbols-outlined text-[22px]">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[10px] flex items-center justify-center font-bold">3</span>
            </button>
            <div className="h-6 w-px bg-surface-container hidden md:block"></div>
            <div className="flex items-center gap-gutter-sm cursor-pointer group">
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary border-2 border-surface-container-lowest"></span>
              </div>
              <div className="flex flex-col text-left hidden md:flex">
                <span className="font-label-md text-label-md text-on-surface font-semibold leading-none group-hover:text-primary transition-colors">{profile?.full_name || 'Ibrahim Khalilolla'}</span>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">ID: {profile?.username || 'INFG0123'}</span>
              </div>
              <span className="material-symbols-outlined text-[18px] text-outline group-hover:text-on-surface transition-colors hidden md:block">expand_more</span>
            </div>
          </div>
        </motion.header>

        {/* Content */}
        <main className="w-full pt-header-height px-4 md:px-gutter-lg py-gutter-md bg-surface min-h-screen flex flex-col gap-3.5 overflow-x-hidden">
          <div className="flex flex-col w-full space-y-3.5">
            {/* Breadcrumbs & Header Cockpit Toolbar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-gutter-sm p-3 rounded-2xl relative" style={{background: 'rgba(255, 255, 255, 0.65)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.8)', boxShadow: 'rgba(31, 38, 135, 0.04) 0px 6px 24px, rgba(255, 255, 255, 0.9) 0px 1px 1px inset'}}
            >
              <div>
                <div className="flex items-center gap-2 text-outline font-label-sm text-label-sm mb-0.5">
                  <Link className="hover:text-primary transition-colors" href="/dashboard">Dashboard</Link>
                  <span className="">/</span>
                  <Link className="hover:text-primary transition-colors" href="/tree">Genealogy</Link>
                  <span className="">/</span>
                  <span className="text-on-surface font-semibold">Binary Tree</span>
                </div>
                <div className="flex items-center gap-gutter-sm">
                  <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">Genealogy Network Tree</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-primary font-label-sm text-label-sm font-semibold" style={{background: 'rgba(0, 63, 177, 0.08)', border: '1px solid rgba(0, 63, 177, 0.16)', backdropFilter: 'blur(8px)'}}>Binary Matrix 2×N</span>
                </div>
              </div>
              {/* Quick Actions / Export */}
              <div className="flex flex-wrap items-center gap-2.5">
                {focusUserId && profile && focusUserId !== profile.id && (
                  <button onClick={() => setFocusUserId(profile.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface font-label-md text-label-md transition-all duration-200 hover:text-primary" style={{background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 2px 8px rgba(31, 38, 135, 0.05)'}}>
                    <span className="material-symbols-outlined text-[18px] text-outline">vertical_align_top</span>
                    <span className="font-semibold">Reset to Root</span>
                  </button>
                )}
                <div className="flex items-center rounded-lg p-1 hidden sm:flex" style={{background: 'rgba(239, 244, 255, 0.85)', border: '1px solid rgba(195, 197, 215, 0.4)', backdropFilter: 'blur(12px)'}}>
                  <span className="font-label-sm text-label-sm text-outline px-2 font-medium">Placement Lock:</span>
                  <button className="px-2.5 py-1 text-xs font-semibold rounded text-primary transition-all duration-200" style={{background: 'rgba(255, 255, 255, 0.95)', boxShadow: '0 1px 4px rgba(0, 0, 0, 0.06)', border: '1px solid rgba(255, 255, 255, 0.9)'}} type="button">Balanced</button>
                  <button className="px-2.5 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors" type="button">Ext. Left</button>
                  <button className="px-2.5 py-1 text-xs font-medium text-on-surface-variant hover:text-on-surface transition-colors" type="button">Ext. Right</button>
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-on-surface font-label-md text-label-md transition-all duration-200 hover:text-primary" style={{background: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255, 255, 255, 0.9)', boxShadow: '0 2px 8px rgba(31, 38, 135, 0.05)'}} type="button">
                  <span className="material-symbols-outlined text-[18px] text-outline">file_download</span>
                  <span className="font-semibold">Export Tree</span>
                </button>
                <button onClick={() => router.push('/dashboard/marketing')} className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary text-on-primary font-label-md text-label-md transition-all duration-200 hover:bg-primary-container" style={{boxShadow: '0 4px 14px rgba(0, 63, 177, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.35)', border: '1px solid rgba(255, 255, 255, 0.2)'}} type="button">
                  <span className="material-symbols-outlined text-[18px]">person_add</span>
                  <span className="font-semibold">New Enrollee</span>
                </button>
              </div>
            </motion.div>

            {/* Compact Horizontal Metrics Ribbon (Full-Width Header Cockpit) */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-stretch"
            >
              {/* Left Leg Card (Frosted Glass) */}
              <motion.div whileHover={{ scale: 1.02 }} className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-primary to-primary-container"></div>
                <div>
                  <div className="flex items-center justify-between pl-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-primary ring-2 ring-primary/20"></span>
                      <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">Left Leg Volume</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-[10px] font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">inventory_2</span>Carryover: {treeStats?.volumes?.leftBvCarryover || 0} BV
                    </span>
                  </div>
                  <div className="pl-1.5 mb-2">
                    <div className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight flex items-baseline gap-1">
                      <CountUp end={rootLeftBv} separator="," duration={2} /> <span className="text-xs font-normal text-outline">BV</span>
                    </div>
                    <div className="text-on-surface-variant font-body-sm text-[11px] mt-0.5">{treeStats?.memberCount?.left || 0} Members Enrolled</div>
                  </div>
                </div>
                <div className="w-full bg-surface-container/60 rounded-full h-1.5 overflow-hidden pl-1.5 mt-auto">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${rootLeftBv > rootRightBv ? '100%' : ((rootLeftBv / ((rootRightBv||1) + 1)) * 100)}%` }} 
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-primary to-secondary h-full rounded-full" 
                  />
                </div>
              </motion.div>

              {/* Right Leg Card (Power Leg - Frosted Glass) */}
              <motion.div whileHover={{ scale: 1.02 }} className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-secondary-container to-secondary"></div>
                <div>
                  <div className="flex items-center justify-between pl-1.5 mb-1.5">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-secondary-container ring-2 ring-secondary-container/20"></span>
                      <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">Right Leg (Power)</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-[10px] font-semibold flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[12px]">inventory_2</span>Carryover: {treeStats?.volumes?.rightBvCarryover || 0} BV
                    </span>
                  </div>
                  <div className="pl-1.5 mb-2">
                    <div className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight flex items-baseline gap-1">
                      <CountUp end={rootRightBv} separator="," duration={2} /> <span className="text-xs font-normal text-outline">BV</span>
                    </div>
                    <div className="text-on-surface-variant font-body-sm text-[11px] mt-0.5">{treeStats?.memberCount?.right || 0} Members Enrolled</div>
                  </div>
                </div>
                <div className="w-full bg-surface-container/60 rounded-full h-1.5 overflow-hidden pl-1.5 mt-auto">
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${rootRightBv > rootLeftBv ? '100%' : ((rootRightBv / ((rootLeftBv||1) + 1)) * 100)}%` }} 
                    transition={{ duration: 1, delay: 0.5 }}
                    className="bg-gradient-to-r from-secondary-container to-primary h-full rounded-full" 
                  />
                </div>
              </motion.div>

              {/* Total Organization Card (Frosted Glass) */}
              <motion.div whileHover={{ scale: 1.02 }} className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">Total Downline</span>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-primary bg-primary/10">
                      <span className="material-symbols-outlined text-[15px]">hub</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="font-headline-xl text-headline-xl font-bold text-on-surface tracking-tight">
                      <CountUp end={treeStats?.memberCount?.total || 0} separator="," duration={2} />
                    </div>
                    <div className="text-on-surface-variant font-body-sm text-[11px] mt-0.5">
                      <CountUp end={rootLeftBv + rootRightBv} separator="," duration={2} /> Cumulative BV
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-outline pt-1.5 border-t border-surface-container mt-auto">
                  <span className="">Matched: <strong className="text-tertiary font-semibold">{treeStats?.volumes?.totalMatchedBv || 0} BV</strong></span>
                  <span className="">Depth: <strong className="text-primary font-semibold">{maxTreeDepth}</strong> Level{maxTreeDepth === 1 ? '' : 's'}</span>
                </div>
              </motion.div>

              {/* Carry Forward Card (Frosted Glass) */}
              <motion.div whileHover={{ scale: 1.02 }} className="bg-surface-container-lowest rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden border border-outline-variant/30 shadow-sm hover:shadow-md transition-all duration-300 h-full">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-sm text-[11px] uppercase tracking-wider text-outline font-semibold">Carry Forward</span>
                    <span className="px-2 py-0.5 rounded-full text-on-surface-variant bg-surface-container font-label-sm text-[10px] font-semibold">
                      {(treeStats?.volumes?.leftBvCarryover || 0) > (treeStats?.volumes?.rightBvCarryover || 0) ? 'Left Side' : 'Right Side'}
                    </span>
                  </div>
                  <div className="mb-2">
                    <div className="font-headline-xl text-headline-xl font-bold text-primary tracking-tight flex items-baseline gap-1">
                      <CountUp end={Math.max((treeStats?.volumes?.leftBvCarryover || 0), (treeStats?.volumes?.rightBvCarryover || 0))} separator="," duration={2} /> <span className="text-xs font-normal text-outline">BV</span>
                    </div>
                    <div className="text-on-surface-variant font-body-sm text-[11px] mt-0.5">Surplus next cycle</div>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-outline pt-1.5 border-t border-surface-container mt-auto">
                  <span className="material-symbols-outlined text-[13px] text-tertiary">check_circle</span>
                  <span className="">Flushing protection active</span>
                </div>
              </motion.div>

              {/* Binary Match Commission Card (Ultra-Premium Deep Royal Sapphire Glass) */}
              <motion.div whileHover={{ scale: 1.02 }} className="rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300 h-full bg-gradient-to-r from-primary to-primary-container text-on-primary shadow-sm">
                <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-white/10 blur-xl pointer-events-none"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-label-sm text-[11px] uppercase tracking-wider text-white/80 font-semibold">Est. Binary Match</span>
                    <div className="w-6 h-6 rounded-md flex items-center justify-center bg-white/15 border border-white/20">
                      <span className="material-symbols-outlined text-[15px] text-tertiary-fixed">payments</span>
                    </div>
                  </div>
                  <div className="mb-2">
                    <div className="font-headline-xl text-headline-xl font-bold tracking-tight text-white drop-shadow-sm">
                      ₹ <CountUp end={wallet?.balances?.binaryIncome || 0} separator="," duration={2} />
                    </div>
                    <div className="text-white/80 font-body-sm text-[11px] mt-0.5">{treeStats?.volumes?.totalMatchedBv || 0} Total BV Matched</div>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[11px] text-white/90 pt-1.5 border-t border-white/15 relative z-10 mt-auto">
                  <span className="text-white/85">Ratio 1:1 Base</span>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-white bg-white/20">Payout: Fri</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Interactive Global Search & Viewport Toolbar */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="rounded-xl p-2.5 flex flex-col md:flex-row items-center justify-between gap-3 relative" style={{background: 'rgba(255, 255, 255, 0.72)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.85)', boxShadow: 'rgba(31, 38, 135, 0.06) 0px 8px 32px 0px, rgba(255, 255, 255, 0.95) 0px 1px 1px 0px inset'}}
            >
              <div className="flex items-center gap-2 w-full md:w-auto flex-1 max-w-md">
                <form onSubmit={handleSearch} className="relative w-full">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline">search</span>
                  <input 
                    value={searchUsername}
                    onChange={(e) => setSearchUsername(e.target.value)}
                    className="w-full pl-9 pr-20 py-1.5 rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none transition-all" 
                    placeholder="Search member by Name or ID e.g. INFG0123" 
                    style={{background: 'rgba(239, 244, 255, 0.7)', border: '1px solid rgba(195, 197, 215, 0.5)', backdropFilter: 'blur(8px)'}} 
                    type="text" 
                  />
                  <button className="absolute right-1.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded bg-primary text-on-primary font-label-sm text-label-sm font-semibold hover:bg-primary-container transition-colors shadow-sm" type="submit">Jump</button>
                </form>
              </div>
              <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg" style={{background: 'rgba(239, 244, 255, 0.7)', border: '1px solid rgba(195, 197, 215, 0.5)', backdropFilter: 'blur(8px)'}}>
                  <span className="material-symbols-outlined text-[16px] text-outline">layers</span>
                  <span className="font-label-sm text-label-sm text-outline">Depth:</span>
                  <select value={treeDepth} onChange={(e) => setTreeDepth(Number(e.target.value))} className="bg-transparent font-label-sm text-label-sm font-semibold text-on-surface focus:outline-none cursor-pointer">
                    {Array.from({ length: maxTreeDepth }, (_, i) => i + 1).map(d => (
                      <option key={d} value={d}>{d} {d === 1 ? 'Level' : 'Levels'}{d === maxTreeDepth ? ' (Max)' : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center rounded-lg p-0.5" style={{background: 'rgba(239, 244, 255, 0.7)', border: '1px solid rgba(195, 197, 215, 0.5)', backdropFilter: 'blur(8px)'}}>
                  <button className="p-1.5 rounded hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors" title="Zoom Out" type="button">
                    <span className="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                  <span className="px-2 font-label-sm text-label-sm font-semibold text-on-surface">100%</span>
                  <button className="p-1.5 rounded hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors" title="Zoom In" type="button">
                    <span className="material-symbols-outlined text-[18px]">add</span>
                  </button>
                  <div className="w-px h-4 bg-surface-container mx-1"></div>
                  <button className="p-1.5 rounded hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors" title="Reset View" type="button">
                    <span className="material-symbols-outlined text-[18px]">center_focus_strong</span>
                  </button>
                  <button className="p-1.5 rounded hover:bg-surface-container-lowest text-on-surface-variant hover:text-on-surface transition-colors" title="Fullscreen" type="button">
                    <span className="material-symbols-outlined text-[18px]">fullscreen</span>
                  </button>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-tertiary font-label-sm text-label-sm font-medium" style={{background: 'rgba(0, 84, 56, 0.08)', border: '1px solid rgba(0, 84, 56, 0.15)', backdropFilter: 'blur(8px)'}}>
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
                  <span className="">Auto-Spillover: Enabled</span>
                </div>
              </div>
            </motion.div>

            {/* FULL-BLEED DUAL WORKSPACE: Left Collapsible Sub-Rail Inspector + Center-Right Extended Tree Canvas */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.4 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 items-start"
            >
              {/* Permanent Collapsible Left Sub-Rail / Inspector Side Dock (3.5 cols on lg) */}
              <div className="lg:col-span-4 xl:col-span-3 space-y-3">
                
                {/* Inspector Card */}
                {selectedNode ? (
                  <GenealogyInspector 
                    node={selectedNode} 
                    onClose={() => setSelectedNode(null)} 
                    onFocusNode={(userId) => {
                      setFocusUserId(userId);
                      setSelectedNode(null);
                    }}
                  />
                ) : (
                  <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30 relative h-[300px] flex items-center justify-center text-outline text-sm">
                    Click a node on the canvas to inspect its details
                  </div>
                )}
                
                {/* Spillover & Balancing Radar Card */}
                <div className="bg-surface-container-lowest rounded-xl p-4 shadow-sm border border-outline-variant/30">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-headline-md text-xs font-bold text-on-surface uppercase tracking-wider">Spillover Optimization</h3>
                    <span className="material-symbols-outlined text-outline text-[16px]">tune</span>
                  </div>
                  <p className="text-[11px] text-outline mb-2.5 leading-snug">System placement engine will prioritize weaker leg volume to maximize your matching cycle bonus.</p>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-on-surface text-[11px]">Left Leg Volume</span>
                      <span className="font-bold text-primary text-[11px]">{treeStats?.volumes?.leftBv || 0} BV</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-on-surface text-[11px]">Right Leg Volume</span>
                      <span className="font-bold text-primary text-[11px]">{treeStats?.volumes?.rightBv || 0} BV</span>
                    </div>
                    <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden mt-2">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${Math.min(((treeStats?.volumes?.leftBv || 0) / (Math.max(treeStats?.volumes?.leftBv, treeStats?.volumes?.rightBv) || 1)) * 100, 100)}%` }} 
                        transition={{ duration: 1, delay: 0.6 }}
                        className="bg-primary h-full rounded-full" 
                      />
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-outline pt-1">
                      <span className="">Left vs Right balance</span>
                      <span className="">Based on actual BV</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Full-Height Binary Network Tree Canvas (8.5 cols on lg, 9 cols on xl) */}
              <div className="lg:col-span-8 xl:col-span-9 bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 flex flex-col relative min-h-[640px]">
                {/* Canvas Header Ribbon */}
                <div className="flex items-center justify-between pb-3 border-b border-surface-container/60">
                  <div className="flex items-center gap-2">
                    <span className="font-label-md text-label-md font-bold text-on-surface uppercase tracking-wider">Binary Network Canvas</span>
                    <span className="text-outline text-xs">· Interactive Node Graph</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="px-2.5 py-1 text-xs font-medium rounded bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors flex items-center gap-1" type="button">
                      <span className="material-symbols-outlined text-[14px]">refresh</span> Collapse All
                    </button>
                    <button className="px-2.5 py-1 text-xs font-medium rounded bg-surface-container-low hover:bg-surface-container text-on-surface transition-colors flex items-center gap-1" type="button">
                      <span className="material-symbols-outlined text-[14px]">unfold_more</span> Expand 4
                    </button>
                  </div>
                </div>

                {/* Tree Diagram Graphic Container with Pan & Center Viewport */}
                <div className="w-full flex-1 overflow-auto py-5">
                  {loading ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-3 text-outline">
                      <div className="w-12 h-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
                      <span className="font-label-md text-label-md font-semibold text-on-surface-variant">Loading your network structure...</span>
                    </div>
                  ) : (error || !treeRoot) ? (
                    <div className="h-96 flex flex-col items-center justify-center gap-4 text-center px-6">
                      <div className="w-16 h-16 rounded-2xl bg-surface-container-low flex items-center justify-center">
                        <span className="material-symbols-outlined text-[36px] text-outline">account_tree</span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className="font-headline-md text-headline-md text-on-surface font-bold">Your Network is Ready to Grow</span>
                        <span className="font-body-sm text-body-sm text-outline max-w-sm">
                          No downline members yet. Share your referral link to start building your binary network tree.
                        </span>
                        <div className="flex items-center gap-3">
                          <button onClick={() => router.push('/dashboard/marketing')} className="px-4 py-2 rounded-lg bg-surface-container-high text-on-surface font-label-md text-label-md font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors" type="button">
                            <span className="material-symbols-outlined text-[18px]">share</span>
                            <span>Share Referral Link</span>
                          </button>
                          <button onClick={() => router.push('/dashboard/marketing')} className="px-4 py-2 rounded-lg bg-primary text-white font-label-md text-label-md font-semibold flex items-center gap-2 shadow-sm shadow-primary/20 hover:bg-primary-container transition-colors" type="button">
                            <span className="material-symbols-outlined text-[18px]">person_add</span>
                            <span>Add Members</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="min-w-max flex justify-center pb-8">
                      <GenealogyNode 
                        node={treeRoot} 
                        depth={1} 
                        maxDepth={treeDepth} 
                        onSelectNode={(node) => setSelectedNode(node)}
                        onPlaceNode={(position, parentId) => {
                          router.push(`/dashboard/marketing?placement=${parentId}&position=${position}`);
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Direct Downline Generation Table */}
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.5 }}
              className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30 mb-8"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-3 border-b border-surface-container/60">
                <div>
                  <h2 className="font-headline-lg text-base font-bold text-on-surface">Direct Team Distribution & Leg Placements</h2>
                  <p className="text-[11px] text-outline mt-0.5">Showing 1st & 2nd generation frontline partners and real-time leg point accumulation</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative hidden sm:block">
                    <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[14px] text-outline">filter_list</span>
                    <select className="pl-7 pr-5 py-1 bg-surface-container-low rounded font-body-sm text-[11px] font-medium text-on-surface focus:outline-none cursor-pointer">
                      <option>All Placements</option>
                      <option>Left Leg Only</option>
                      <option>Right Leg Only</option>
                    </select>
                  </div>
                  <button className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-outline-variant/50 text-on-surface-variant text-[11px] font-semibold hover:bg-surface-container-low transition-colors" type="button">
                    <span className="material-symbols-outlined text-[14px]">download</span> Download CSV
                  </button>
                </div>
              </div>
              <div className="w-full overflow-x-auto mt-3">
                <table className="w-full text-left border-collapse min-w-[700px]">
                  <thead>
                    <tr className="border-b border-surface-container font-label-sm text-[10px] text-outline uppercase tracking-wider">
                      <th className="py-2.5 px-3 font-semibold">Distributor</th>
                      <th className="py-2.5 px-3 font-semibold">User ID</th>
                      <th className="py-2.5 px-3 font-semibold">Placement Leg</th>
                      <th className="py-2.5 px-3 font-semibold">Rank / Level</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Personal BV</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Group BV</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Status</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-body-sm text-on-surface divide-y divide-surface-container/50">
                    {!binaryMembers || binaryMembers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="py-8 text-center text-outline">No binary team members found.</td>
                      </tr>
                    ) : (
                      binaryMembers.map((m: any, i: number) => (
                        <tr key={i} className="hover:bg-surface-container-lowest/50 transition-colors group">
                          <td className="py-2 px-3">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center font-bold text-[10px] text-primary">
                                {m.full_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="font-bold text-on-surface text-xs">{m.full_name} {m.is_direct && <span className="text-[10px] ml-1 text-tertiary bg-tertiary/10 px-1 rounded">Direct</span>}</div>
                                <div className="text-[9px] text-outline mt-0.5">Depth Level {m.level}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-2 px-3 text-[11px] font-medium">{m.username}</td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary">
                              {m.placement_leg === 'L' ? 'Left Leg' : m.placement_leg === 'R' ? 'Right Leg' : 'Auto'}
                            </span>
                          </td>
                          <td className="py-2 px-3">
                            <span className="px-1.5 py-0.5 rounded bg-surface-container-low text-[9px] font-semibold text-on-surface-variant">
                              {m.current_rank || 'Bronze'}
                            </span>
                          </td>
                          <td className="py-2 px-3 text-right font-semibold text-[11px]">N/A</td>
                          <td className="py-2 px-3 text-right font-bold text-primary text-[11px]">N/A</td>
                          <td className="py-2 px-3 text-center">
                            {m.has_active_node ? (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-tertiary/10 text-tertiary text-[9px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>Active
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-error/10 text-error text-[9px] font-bold">
                                <span className="w-1.5 h-1.5 rounded-full bg-error"></span>Inactive
                              </span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-center">
                            <button onClick={() => setFocusUserId(m.id)} className="text-outline hover:text-primary transition-colors"><span className="material-symbols-outlined text-[16px]">visibility</span></button>
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
