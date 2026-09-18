'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

interface DashboardContextType {
  profile: any
  rank: any
  wallet: any
  treeStats: any
  team: any
  loading: boolean
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<any>(null)
  const [rank, setRank] = useState<any>(null)
  const [wallet, setWallet] = useState<any>(null)
  const [treeStats, setTreeStats] = useState<any>(null)
  const [team, setTeam] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only fetch if on a dashboard or tree route
    if (!pathname.startsWith('/dashboard') && !pathname.startsWith('/tree')) return;

    let isMounted = true;
    
    const fetchData = async () => {
      try {
        const [profileRes, walletRes, rankRes, statsRes, teamRes] = await Promise.all([
          fetch('/api/user/profile'),
          fetch('/api/wallet/balance'),
          fetch('/api/rank/status'),
          fetch('/api/tree/stats'),
          fetch('/api/user/team')
        ])

        if (walletRes.status === 401 || profileRes.status === 401) {
          router.push('/login')
          return
        }

        if (isMounted) {
          const profileData = await profileRes.json()
          setProfile(profileData.profile)
          setWallet(await walletRes.json())
          setRank(await rankRes.json())
          setTreeStats(await statsRes.json())
          setTeam(await teamRes.json())
        }
      } catch (err) {
        console.error('Failed to fetch global dashboard data', err)
      } finally {
        if (isMounted) setLoading(false)
      }
    }

    fetchData()
    
    return () => { isMounted = false }
  }, [router])

  return (
    <DashboardContext.Provider value={{ profile, rank, wallet, treeStats, team, loading }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboardContext() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboardContext must be used within a DashboardProvider')
  }
  return context
}
