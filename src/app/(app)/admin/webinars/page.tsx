'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminWebinarPage() {
  const [webinar, setWebinar] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setUploadProgress(10)
    
    try {
      const supabase = createClient()
      const fileExt = file.name.split('.').pop()
      const fileName = `masterclass-${Date.now()}.${fileExt}`

      setUploadProgress(30)
      const { data, error } = await supabase.storage
        .from('webinars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })

      setUploadProgress(80)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('webinars')
        .getPublicUrl(fileName)

      handleChange('video_url', publicUrl)
      setToast('Video uploaded successfully!')
      setTimeout(() => setToast(''), 3000)
    } catch (err: any) {
      console.error(err)
      alert(`Upload failed: ${err.message}. Did you run the SQL to create the bucket?`)
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  useEffect(() => {
    fetch('/api/admin/webinars')
      .then(res => res.json())
      .then(data => {
        if (data.webinar) setWebinar(data.webinar)
        setLoading(false)
      })
      .catch(err => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  const handleChange = (field: string, value: any) => {
    setWebinar((prev: any) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/webinars', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webinar)
      })
      if (res.ok) {
        setToast('Webinar settings saved successfully!')
        setTimeout(() => setToast(''), 3000)
      } else {
        alert('Failed to save settings')
      }
    } catch (err) {
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="p-8 text-gray-500">Loading settings...</div>

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {toast && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Marketing Webinar Settings</h1>
          <p className="text-gray-500 mt-1">Configure the global Evergreen Webinar funnel</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={async () => {
              if (confirm('Are you sure you want to terminate the live broadcast? All current viewers will be kicked out immediately.')) {
                handleChange('is_active', false);
                // Immediately save
                const updated = { ...webinar, is_active: false };
                await fetch('/api/admin/webinars', { method: 'POST', body: JSON.stringify(updated) });
                setToast('Broadcast Terminated!');
                setTimeout(() => setToast(''), 3000);
              }
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm transition flex items-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">cancel</span>
            End Broadcast Now
          </button>
          
          <button 
            onClick={handleSave} 
            disabled={saving}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-8">
        
        {/* Toggle Switch */}
        <div className="flex items-center justify-between border-b pb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Broadcast Mode</h2>
            <p className="text-sm text-gray-500">Switch between Autopilot (Simulated) and True Live modes</p>
          </div>
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button 
              onClick={() => handleChange('broadcast_mode', 'SIMULATED')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${webinar?.broadcast_mode === 'SIMULATED' ? 'bg-white shadow text-blue-600' : 'text-gray-600'}`}
            >
              Simulated (Autopilot)
            </button>
            <button 
              onClick={() => handleChange('broadcast_mode', 'TRUE_LIVE')}
              className={`px-4 py-2 rounded-md text-sm font-bold transition ${webinar?.broadcast_mode === 'TRUE_LIVE' ? 'bg-red-500 shadow text-white' : 'text-gray-600'}`}
            >
              True Live
            </button>
          </div>
        </div>

        {/* Global Settings */}
        <div className="space-y-4 border-b pb-6">
          <h2 className="text-lg font-bold text-gray-900">General Settings</h2>
          
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Webinar Title</label>
            <input 
              type="text" 
              value={webinar?.title || ''} 
              onChange={e => handleChange('title', e.target.value)} 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer mt-4">
            <input 
              type="checkbox" 
              checked={webinar?.is_active || false} 
              onChange={e => handleChange('is_active', e.target.checked)} 
              className="w-5 h-5 text-blue-600" 
            />
            <span className="font-semibold text-gray-700">Webinar Funnel Active (Allows users to register)</span>
          </label>
        </div>

        {/* Conditional Forms based on Mode */}
        {webinar?.broadcast_mode === 'SIMULATED' ? (
          <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-100">
            <div className="flex items-center gap-2 text-blue-800 mb-2">
              <span className="material-symbols-outlined">smart_display</span>
              <h2 className="text-lg font-bold">Simulated Autopilot Settings</h2>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Daily Scheduled Time (Local Time)</label>
              <input 
                type="time" 
                value={webinar?.scheduled_start_time || ''} 
                onChange={e => handleChange('scheduled_start_time', e.target.value)} 
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              />
              <p className="text-xs text-gray-500 mt-1">Example: Setting 20:00 means the video will simulate a live broadcast every day at 8:00 PM.</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Pre-recorded Video URL (MP4)</label>
              <div className="flex gap-2">
                <input 
                  type="url" 
                  value={webinar?.video_url || ''} 
                  onChange={e => handleChange('video_url', e.target.value)} 
                  placeholder="https://your-server.com/video.mp4"
                  className="flex-1 p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
                />
                <label className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded font-semibold cursor-pointer flex items-center gap-2 transition-colors whitespace-nowrap">
                  {uploading ? (
                    <><span className="material-symbols-outlined animate-spin text-[18px]">sync</span> Uploading {uploadProgress}%</>
                  ) : (
                    <><span className="material-symbols-outlined text-[18px]">upload</span> Upload MP4</>
                  )}
                  <input type="file" accept="video/mp4" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Upload an MP4 directly from your computer, or paste an external link.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 bg-red-50 p-6 rounded-lg border border-red-100">
            <div className="flex items-center gap-2 text-red-800 mb-2">
              <span className="material-symbols-outlined">sensors</span>
              <h2 className="text-lg font-bold">True Live Settings</h2>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">YouTube Live / External Embed URL</label>
              <input 
                type="url" 
                value={webinar?.youtube_live_url || ''} 
                onChange={e => handleChange('youtube_live_url', e.target.value)} 
                placeholder="https://www.youtube.com/embed/..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-red-500 outline-none" 
              />
              <p className="text-xs text-red-400 mt-1">When in True Live mode, this embedded stream will replace the daily video for all users.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
