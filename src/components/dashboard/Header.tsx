'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDashboardContext } from './DashboardContext'

export default function Header() {
  const { profile, loading } = useDashboardContext()
  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [loadingNotifications, setLoadingNotifications] = useState(true)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/user/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      } catch (err) {
        console.error('Failed to fetch notifications', err)
      } finally {
        setLoadingNotifications(false)
      }
    }
    
    // Poll every 30 seconds
    fetchNotifications()
    const interval = setInterval(fetchNotifications, 30000)
    return () => clearInterval(interval)
  }, [])

  const unreadCount = notifications.filter(n => !n.is_read).length

  const markAsRead = async (id?: string) => {
    try {
      const payload = id ? { notificationIds: [id] } : {}
      const res = await fetch('/api/user/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      
      if (res.ok) {
        if (id) {
          setNotifications(notifications.map(n => n.id === id ? { ...n, is_read: true } : n))
        } else {
          setNotifications(notifications.map(n => ({ ...n, is_read: true })))
        }
      }
    } catch (err) {
      console.error('Failed to mark read', err)
    }
  }

  // Define notification icons/colors
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PAYOUT': return { icon: 'payments', color: 'text-tertiary', bg: 'bg-tertiary-container/30' }
      case 'NETWORK': return { icon: 'group_add', color: 'text-primary', bg: 'bg-primary/10' }
      case 'SECURITY': return { icon: 'security', color: 'text-error', bg: 'bg-error-container' }
      case 'SYSTEM':
      default: return { icon: 'info', color: 'text-secondary', bg: 'bg-secondary-fixed/30' }
    }
  }

  return (
    <motion.header 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="h-header-height bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-4 md:px-gutter-lg sticky top-0"
    >
      <div className="md:hidden flex items-center font-bold text-lg text-primary">ELORA GLOBAL</div>
      <div className="hidden md:flex items-center gap-gutter-md flex-1 max-w-lg">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-outline pointer-events-none">search</span>
          <input className="w-full pl-9 pr-14 py-2 bg-surface-container-low rounded-lg font-body-sm text-body-sm text-on-surface placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest transition-all" placeholder="Search members, node ID, wallet..." type="text" />
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 px-1.5 py-0.5 rounded bg-surface-container font-label-sm text-label-sm text-outline pointer-events-none">⌘K</div>
        </div>
      </div>
      <div className="flex items-center gap-gutter-lg">
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container-low">
          <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></span>
          <span className="font-label-sm text-label-sm font-semibold text-on-surface">Live Data</span>
        </div>
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface transition-colors" 
            type="button"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-error text-on-error font-label-sm text-[10px] flex items-center justify-center font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 max-h-[28rem] bg-surface-container-lowest border border-surface-container shadow-lg rounded-xl overflow-hidden flex flex-col z-50">
              <div className="p-4 border-b border-surface-container flex items-center justify-between bg-surface-container-low/50">
                <h3 className="font-headline-sm font-bold text-on-surface">Notifications</h3>
                {unreadCount > 0 && (
                  <button 
                    onClick={() => markAsRead()}
                    className="text-primary font-label-sm hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="overflow-y-auto flex-1 p-2 space-y-1">
                {loadingNotifications ? (
                  <div className="p-4 text-center text-outline font-body-sm flex justify-center items-center gap-2">
                    <span className="material-symbols-outlined animate-spin">refresh</span>
                    Loading...
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-outline font-body-sm">
                    <span className="material-symbols-outlined text-[32px] block mb-2 opacity-50">notifications_paused</span>
                    You have no new notifications.
                  </div>
                ) : (
                  notifications.map(n => {
                    const style = getNotificationIcon(n.type)
                    return (
                      <div 
                        key={n.id} 
                        onClick={() => !n.is_read && markAsRead(n.id)}
                        className={`p-3 rounded-lg flex gap-3 cursor-pointer transition-colors ${n.is_read ? 'hover:bg-surface-container-low/50' : 'bg-surface-container hover:bg-surface-container-high'}`}
                      >
                        <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${style.bg} ${style.color}`}>
                          <span className="material-symbols-outlined text-[20px]">{style.icon}</span>
                        </div>
                        <div className="flex-1">
                          <div className={`font-label-md mb-0.5 ${n.is_read ? 'text-on-surface-variant' : 'text-on-surface font-bold'}`}>
                            {n.title}
                          </div>
                          <div className="font-body-sm text-[12px] leading-snug text-outline mb-1 line-clamp-2">
                            {n.message}
                          </div>
                          <div className="font-label-sm text-[10px] text-outline/80">
                            {new Date(n.created_at).toLocaleString()}
                          </div>
                        </div>
                        {!n.is_read && (
                          <div className="w-2 h-2 rounded-full bg-primary shrink-0 self-center"></div>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </div>
        <div className="h-6 w-px bg-surface-container"></div>
        <div className="flex items-center gap-gutter-sm cursor-pointer group">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-[18px]">person</span>
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary border-2 border-surface-container-lowest"></span>
          </div>
          <div className="hidden sm:flex flex-col text-left">
            <span className="font-label-md text-label-md text-on-surface font-semibold leading-none group-hover:text-primary transition-colors">
              {loading ? 'Loading...' : (profile?.full_name || 'Guest User')}
            </span>
            <span className="font-label-sm text-label-sm text-outline mt-0.5">
              ID: {loading ? '...' : (profile?.referral_code || '---')}
            </span>
          </div>
          <span className="hidden sm:block material-symbols-outlined text-[18px] text-outline group-hover:text-on-surface transition-colors">expand_more</span>
        </div>
      </div>
    </motion.header>
  )
}
