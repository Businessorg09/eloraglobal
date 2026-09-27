'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function WebinarRegistrationGate() {
  const params = useParams()
  const router = useRouter()
  const sponsorUsername = params.sponsorUsername as string

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState('')

  useEffect(() => {
    // Update a clock just to make it feel "live"
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/webinar/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, sponsorUsername })
      })
      
      const data = await res.json()
      
      if (res.ok) {
        // Save minimal session info so the room knows they are authorized
        sessionStorage.setItem('webinar_guest_name', name)
        sessionStorage.setItem('webinar_guest_email', email)
        
        // Push them to the actual room (Step 4)
        router.push(`/live/${sponsorUsername}/room`)
      } else {
        setError(data.error || 'Failed to register. Please check your link.')
      }
    } catch (err) {
      setError('A network error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 font-sans text-gray-100 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800 via-gray-900 to-black">
      
      <div className="max-w-md w-full bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <div className="bg-blue-600 px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 text-white font-bold tracking-wider">
            <span className="material-symbols-outlined animate-pulse">sensors</span>
            LIVE SESSION
          </div>
          <div className="text-blue-100 font-mono text-sm">{currentTime}</div>
        </div>

        <div className="p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-white">Daily Wealth Masterclass</h1>
            <p className="text-gray-400 text-sm">You have been invited by <strong className="text-blue-400">@{sponsorUsername}</strong>.</p>
            <p className="text-gray-400 text-sm">Please enter your details to join the waiting room.</p>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm px-4 py-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
              <input 
                type="text" 
                required 
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                placeholder="John Doe"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Email Address</label>
              <input 
                type="email" 
                required 
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-600"
                placeholder="john@example.com"
              />
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px]">lock</span>
                Your information is securely encrypted.
              </p>
            </div>

            <button 
              type="submit" 
              disabled={loading || !name || !email}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-4 rounded-lg shadow-lg shadow-blue-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                  Joining Room...
                </>
              ) : (
                <>
                  Join Masterclass Now
                  <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 text-center text-xs text-gray-500 max-w-xs">
        By joining, you agree to our Terms of Service and Privacy Policy.
      </div>
    </div>
  )
}
