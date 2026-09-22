'use client'

import React, { useState, useEffect, useRef } from 'react'

export default function NotificationBell({ isMobile = false }) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [loading, setLoading] = useState(true)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch('/api/user/notifications')
        if (res.ok) {
          const data = await res.json()
          setNotifications(data.notifications || [])
        }
      } catch (err) {}
      setLoading(false)
    }
    fetchNotifications()
    const int = setInterval(fetchNotifications, 30000)
    return () => clearInterval(int)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
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
    } catch (err) {}
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PAYOUT': return { icon: '💰', color: 'text-green-600', bg: 'bg-green-100' }
      case 'NETWORK': return { icon: '👥', color: 'text-blue-600', bg: 'bg-blue-100' }
      case 'SECURITY': return { icon: '🛡️', color: 'text-red-600', bg: 'bg-red-100' }
      default: return { icon: 'ℹ️', color: 'text-slate-600', bg: 'bg-slate-100' }
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {isMobile ? (
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="Notifications" 
          className="relative text-slate-500 hover:text-blue-600 transition"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405C18.21 14.79 18 13.42 18 12V8a6 6 0 10-12 0v4c0 1.42-.21 2.79-.595 3.595L4 17h5m6 0a3 3 0 11-6 0h6z"></path></svg>
          {unreadCount > 0 && <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-rose-500 border border-white"></span>}
        </button>
      ) : (
        <button 
          onClick={() => setShowDropdown(!showDropdown)}
          aria-label="Notifications" 
          className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition"
        >
          <i className="ph ph-bell text-xl"></i>
          {unreadCount > 0 && <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">{unreadCount > 9 ? '9+' : unreadCount}</span>}
        </button>
      )}

      {showDropdown && (
        <div className={`absolute ${isMobile ? '-right-10' : 'right-0'} top-full mt-2 w-80 max-h-96 bg-white border border-slate-200 shadow-xl rounded-xl flex flex-col z-[9999] overflow-hidden`}>
          <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-bold text-slate-800">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={() => markAsRead()} className="text-[11px] font-semibold text-blue-600 hover:underline">Mark all read</button>
            )}
          </div>
          <div className="overflow-y-auto flex-1 p-2 space-y-1">
            {loading ? (
              <div className="p-4 text-center text-slate-500 text-xs">Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-xs">You have no new notifications.</div>
            ) : (
              notifications.map(n => {
                const style = getNotificationIcon(n.type)
                return (
                  <div 
                    key={n.id} 
                    onClick={() => !n.is_read && markAsRead(n.id)}
                    className={`p-3 rounded-lg flex gap-3 cursor-pointer transition-colors ${n.is_read ? 'hover:bg-slate-50 opacity-60' : 'bg-slate-50/80 hover:bg-slate-100'}`}
                  >
                    <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${style.bg} ${style.color} text-sm`}>
                      {style.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-xs mb-0.5 truncate ${n.is_read ? 'text-slate-600' : 'text-slate-900 font-bold'}`}>
                        {n.title}
                      </div>
                      <div className="text-[11px] leading-snug text-slate-500 mb-1 line-clamp-2">
                        {n.message}
                      </div>
                      <div className="text-[9px] text-slate-400">
                        {new Date(n.created_at).toLocaleString()}
                      </div>
                    </div>
                    {!n.is_read && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 self-center"></div>}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
