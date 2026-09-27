'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function WebinarRoom() {
  const params = useParams()
  const router = useRouter()
  const sponsorUsername = params.sponsorUsername as string

  const [webinar, setWebinar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [guestName, setGuestName] = useState('')

  // State for simulated live timing
  const [status, setStatus] = useState<'WAITING' | 'LIVE' | 'ENDED'>('WAITING')
  const [countdown, setCountdown] = useState('')
  const [offsetSeconds, setOffsetSeconds] = useState(0)

  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    // 1. Security Check: Are they logged in OR did they register?
    const name = sessionStorage.getItem('webinar_guest_name')
    if (!name) {
      // Check if they have a cookie/token for supabase
      const hasSupabaseCookie = document.cookie.includes('sb-') || document.cookie.includes('supabase')
      if (!hasSupabaseCookie) {
        router.replace(`/live/${sponsorUsername}`)
        return
      }
      setGuestName('Member')
    } else {
      setGuestName(name)
    }

    // 2. Fetch Webinar Details
    fetch('/api/webinar/room')
      .then(res => res.json())
      .then(data => {
        if (data.webinar) {
          setWebinar(data.webinar)
        } else {
          setError('No active masterclass found.')
        }
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setError('Network error loading the broadcast.')
        setLoading(false)
      })
  }, [sponsorUsername, router])

  // Helper to convert standard YouTube links to stealth embeds
  const getStealthYouTubeUrl = (url: string) => {
    if (!url) return '';
    let videoId = '';
    
    // Parse watch?v= or youtu.be/ or embed/
    if (url.includes('youtube.com/watch?v=')) {
      videoId = url.split('v=')[1].split('&')[0];
    } else if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/embed/')) {
      videoId = url.split('embed/')[1].split('?')[0];
    } else {
      return url; // fallback
    }

    // Return the ultimate stealth URL
    return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&modestbranding=1&rel=0&disablekb=1&iv_load_policy=3&fs=0&playsinline=1`;
  }

  // 3. Time Sync Logic (Only for SIMULATED mode)
  useEffect(() => {
    if (!webinar || webinar.broadcast_mode !== 'SIMULATED' || !webinar.scheduled_start_time) return

    const checkTime = () => {
      const now = new Date()
      
      // Parse scheduled time (e.g., "20:00:00")
      const [hours, minutes, seconds] = webinar.scheduled_start_time.split(':').map(Number)
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, seconds || 0, 0)

      const diffSeconds = Math.floor((now.getTime() - scheduledTime.getTime()) / 1000)

      if (diffSeconds < 0) {
        // Early
        setStatus('WAITING')
        const absDiff = Math.abs(diffSeconds)
        const h = Math.floor(absDiff / 3600)
        const m = Math.floor((absDiff % 3600) / 60)
        const s = absDiff % 60
        setCountdown(`${h > 0 ? `${h}h ` : ''}${m}m ${s}s`)
      } else if (diffSeconds >= 0 && diffSeconds < 7200) {
        // LIVE (Assuming max video length is 2 hours / 7200 sec)
        // In a real prod environment, you'd check video length exactly, but this is a safe default.
        if (status !== 'LIVE') {
          setStatus('LIVE')
          setOffsetSeconds(diffSeconds)
        }
      } else {
        // Ended
        setStatus('ENDED')
      }
    }

    checkTime() // Initial check
    const interval = setInterval(checkTime, 1000)
    return () => clearInterval(interval)
  }, [webinar, status])

  // Auto-play and sync video once LIVE
  useEffect(() => {
    if (status === 'LIVE' && videoRef.current) {
      const video = videoRef.current
      // Jump to the exact elapsed time
      video.currentTime = offsetSeconds
      
      // Force play
      const playPromise = video.play()
      if (playPromise !== undefined) {
        playPromise.catch(err => {
          console.warn("Auto-play blocked by browser. User needs to interact.", err)
          // To handle auto-play blocks, you typically mute the video, play it, and show an 'Unmute' button.
          // For simplicity in this MVP, we just log it.
        })
      }
    }
  }, [status]) // Trigger only when status flips to LIVE

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Connecting to broadcast server...</div>
  }

  if (error) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500">{error}</div>
  }

  return (
    <div className="min-h-screen bg-black flex flex-col font-sans">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex justify-between items-center z-10">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-xl">EG</div>
          <div>
            <h1 className="text-white font-bold text-lg leading-tight">{webinar.title}</h1>
            <p className="text-gray-400 text-xs">Hosted by Elora Global Network</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {(webinar.broadcast_mode === 'TRUE_LIVE' || status === 'LIVE') && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Live</span>
            </div>
          )}
          <div className="text-gray-400 text-sm hidden sm:block">
            Welcome, <strong className="text-white">{guestName}</strong>
          </div>
        </div>
      </header>

      {/* Main Broadcast Area */}
      <main className="flex-1 relative flex items-center justify-center bg-[#0a0a0a]">
        
        {webinar.broadcast_mode === 'TRUE_LIVE' ? (
          // TRUE LIVE MODE (YouTube Embed)
          <div className="w-full max-w-6xl aspect-video bg-gray-900 shadow-2xl relative overflow-hidden">
            {/* The Invisible Shield: Blocks all clicks on the YouTube iframe */}
            <div className="absolute inset-0 z-20 cursor-default" onContextMenu={e => e.preventDefault()}></div>
            
            <iframe 
              src={getStealthYouTubeUrl(webinar.youtube_live_url)} 
              className="absolute inset-0 w-full h-full border-0 z-10 pointer-events-none transform scale-[1.02]"
              allow="autoplay; encrypted-media; picture-in-picture" 
              allowFullScreen={false}
            ></iframe>
            
            {/* Fake Overlay Controls */}
            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/90 to-transparent flex items-end px-6 py-4 z-30 pointer-events-none">
              <div className="w-full flex justify-between items-center">
                <div className="flex gap-4 items-center">
                  <span className="material-symbols-outlined text-white text-2xl">volume_up</span>
                  <span className="text-white font-mono text-sm">LIVE BROADCAST</span>
                </div>
                <div className="flex gap-2 items-center bg-red-600 px-3 py-1 rounded text-white text-xs font-bold shadow-lg">
                  <span className="material-symbols-outlined text-[14px]">visibility</span>
                  Live
                </div>
              </div>
            </div>
          </div>
        ) : (
          // SIMULATED LIVE MODE
          <div className="w-full max-w-6xl aspect-video bg-gray-900 shadow-2xl relative overflow-hidden flex items-center justify-center">
            
            {status === 'WAITING' && (
              <div className="text-center space-y-6">
                <span className="material-symbols-outlined text-6xl text-blue-500 mb-4 animate-bounce">schedule</span>
                <h2 className="text-3xl font-bold text-white">The Masterclass will begin shortly.</h2>
                <p className="text-gray-400">Please do not refresh this page. You will automatically be joined.</p>
                <div className="text-5xl font-mono font-extrabold text-blue-400 mt-8 tracking-wider">
                  {countdown}
                </div>
              </div>
            )}

            {status === 'ENDED' && (
              <div className="text-center space-y-4">
                <span className="material-symbols-outlined text-6xl text-gray-500 mb-4">videocam_off</span>
                <h2 className="text-2xl font-bold text-white">This broadcast has ended.</h2>
                <p className="text-gray-400">Please contact your sponsor (@{sponsorUsername}) for the replay or next scheduled session.</p>
              </div>
            )}

            {status === 'LIVE' && (
              <>
                <video 
                  ref={videoRef}
                  src={webinar.video_url}
                  className="w-full h-full object-cover pointer-events-none"
                  controls={false}
                  disablePictureInPicture
                  controlsList="nodownload nofullscreen noremoteplayback"
                  onContextMenu={(e) => e.preventDefault()}
                  playsInline
                ></video>
                
                {/* Fake Overlay Controls just for realism (but unclickable) */}
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/80 to-transparent flex items-end px-6 py-4 pointer-events-none">
                  <div className="w-full flex justify-between items-center">
                    <div className="flex gap-4 items-center">
                      <span className="material-symbols-outlined text-white text-2xl">volume_up</span>
                      <span className="text-white font-mono text-sm">LIVE BROADCAST</span>
                    </div>
                    <div className="flex gap-2 items-center bg-black/50 px-3 py-1 rounded text-white text-xs">
                      <span className="material-symbols-outlined text-[14px]">visibility</span>
                      2,481 Watching
                    </div>
                  </div>
                </div>
              </>
            )}

          </div>
        )}

      </main>
    </div>
  )
}
