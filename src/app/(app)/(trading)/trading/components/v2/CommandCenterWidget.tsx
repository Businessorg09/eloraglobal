'use client'

import React, { useState, useEffect, useRef } from 'react';

type Episode = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  duration_seconds: number;
  pdf_url: string;
  order_index: number;
  module?: {
    id: string;
    title: string;
  };
};

type Progress = {
  progress_seconds: number;
  is_completed: boolean;
  episode: Episode;
};

// Converts standard YouTube links INTO embed links, handles iframe tags, and injects start time
const getEmbedUrl = (url: string, startAt: number) => {
  if (!url) return '';
  let cleanUrl = url;
  
  // If iframe, extract src
  const iframeMatch = url.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) {
    cleanUrl = iframeMatch[1];
  }
  
  // If standard watch url, convert to embed
  const watchRegex = /youtube\.com\/watch\?v=([^"&?]+)/i;
  const watchMatch = cleanUrl.match(watchRegex);
  if (watchMatch && watchMatch[1]) {
    cleanUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;
  }

  // If youtu.be, convert to embed
  const shortRegex = /youtu\.be\/([^"&?]+)/i;
  const shortMatch = cleanUrl.match(shortRegex);
  if (shortMatch && shortMatch[1]) {
    cleanUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
  }
  
  // Append start time if needed
  if (startAt > 0) {
    const separator = cleanUrl.includes('?') ? '&' : '?';
    cleanUrl += `${separator}start=${Math.floor(startAt)}&autoplay=0`; // Autoplay off for dashboard
  }
  
  return cleanUrl;
};

export function CommandCenterWidget() {
  const [lastProgress, setLastProgress] = useState<Progress | null>(null);
  const [playlist, setPlaylist] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const saveTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [progRes, overRes] = await Promise.all([
          fetch('/api/academy/progress'),
          fetch('/api/dashboard/overview')
        ]);
        
        const progData = await progRes.json();
        const overData = await overRes.json();

        let initialProgress = null;

        if (progData.progress) {
          initialProgress = progData.progress;
        } else if (overData.playlist && overData.playlist.length > 0) {
          // If no history, find the very first unlocked module that has episodes
          const firstUnlockedMod = overData.playlist.find((m: any) => !m.isLocked && m.episodes && m.episodes.length > 0);
          if (firstUnlockedMod) {
            const firstEp = firstUnlockedMod.episodes[0];
            initialProgress = {
              progress_seconds: 0,
              is_completed: false,
              episode: {
                ...firstEp,
                module: { id: firstUnlockedMod.id, title: firstUnlockedMod.title }
              }
            };
          }
        }

        if (initialProgress) {
          setLastProgress(initialProgress);
          setCurrentProgress(initialProgress.progress_seconds);
        }

        if (overData.playlist) {
          setPlaylist(overData.playlist);
        }
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  // When playing in dashboard, track progress locally and auto-save every 10 seconds
  useEffect(() => {
    if (isPlaying && lastProgress?.episode) {
      // Local timer
      timerRef.current = setInterval(() => {
        setCurrentProgress(prev => prev + 1);
      }, 1000);

      // Auto-save timer
      saveTimerRef.current = setInterval(() => {
        fetch('/api/academy/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episode_id: lastProgress.episode.id,
            progress_seconds: Math.floor(currentProgress),
            is_completed: false
          })
        }).catch(err => console.error("Auto-save failed", err));
      }, 10000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (saveTimerRef.current) clearInterval(saveTimerRef.current);
    };
  }, [isPlaying, lastProgress, currentProgress]);

  // If there's no last watched video, show a nice default state
  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-5 md:p-10 flex flex-col items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-[24px] md:text-[32px] text-blue-500 animate-spin mb-4">refresh</span>
        <span className="text-sm font-bold text-slate-500">Syncing learning progress...</span>
      </div>
    );
  }

  const episode = lastProgress?.episode;

  return (
    <div id="command-center" className="flex flex-col gap-4 md:gap-6">
      
      {/* Video Module */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">
          <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded">Continue Watching</span>
          <span>{episode?.module?.title || "Active Module"}</span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#059669]">
            <span className="material-symbols-outlined text-[14px]">play_circle</span> Active Session
          </div>
          {episode && (
             <div className="text-[10px] font-bold text-slate-400">
               Paused at {Math.floor(lastProgress.progress_seconds / 60)}:{(lastProgress.progress_seconds % 60).toString().padStart(2, '0')}
             </div>
          )}
        </div>
        
        <h2 className="text-lg md:text-[22px] font-bold text-[#111827] leading-tight mb-2">
          {episode ? episode.title : "Welcome to the Academy"}
        </h2>
        <p className="text-xs md:text-[13px] text-[#4B5563] mb-5 leading-relaxed max-w-[650px] line-clamp-2">
          {episode ? episode.description : "You haven't started any masterclasses yet. Visit the Academy to begin your curriculum."}
        </p>

        {/* Video Player */}
        <div className="relative w-full aspect-video bg-[#111827] rounded-[24px] overflow-hidden shadow-[0_8px_30px_rgba(0,0,0,0.04)] group mb-5">
          {episode && episode.video_url ? (
            isPlaying ? (
              (episode.video_url.includes('supabase.co/storage') || episode.video_url.match(/\.(mp4|webm|ogg)$/i)) ? (
                <video 
                  src={episode.video_url + (lastProgress.progress_seconds > 0 ? `#t=${lastProgress.progress_seconds}` : '')}
                  controls
                  autoPlay
                  controlsList="nodownload"
                  className="w-full h-full absolute inset-0 outline-none"
                  onTimeUpdate={(e) => {
                    setCurrentProgress(Math.floor(e.currentTarget.currentTime));
                  }}
                ></video>
              ) : (
                <iframe 
                  src={getEmbedUrl(episode.video_url, lastProgress.progress_seconds) + '&autoplay=1'} 
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              )
            ) : (
              <div 
                className="absolute inset-0 cursor-pointer flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900"
                onClick={() => setIsPlaying(true)}
              >
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform mb-4">
                  <span className="material-symbols-outlined text-white text-[24px] md:text-[32px] ml-1">play_arrow</span>
                </div>
                <span className="text-white font-bold text-sm tracking-wide bg-black/40 px-4 py-1.5 rounded-full border border-white/10">Resume Video in Dashboard</span>
                
                {/* Progress Bar preview */}
                <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800/80">
                  <div 
                    className="h-full bg-blue-500" 
                    style={{ width: `${Math.min(100, (lastProgress.progress_seconds / (episode.duration_seconds || 1)) * 100)}%` }}
                  ></div>
                </div>
              </div>
            )
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1F2937] to-[#111827] flex items-center justify-center opacity-80">
              <div className="text-center">
                <span className="material-symbols-outlined text-slate-500 text-[40px] mb-2">library_add_check</span>
                <p className="text-slate-400 font-bold text-sm">No Active Video</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons & Playlist */}
        <div className="flex flex-col gap-3">
          
          <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] overflow-hidden mt-2">
            <div className="px-4 py-3 border-b border-[#E5E7EB] bg-white flex justify-between items-center">
              <span className="font-bold text-[13px] text-[#111827]">Curriculum Playlist</span>
              <a href="/trading/academy" className="text-[11px] text-blue-600 font-bold hover:underline">View Full Academy</a>
            </div>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar flex flex-col">
              {playlist.map(mod => (
                <div key={mod.id} className="flex flex-col border-b border-[#E5E7EB] last:border-0">
                  <div className="px-4 py-2.5 bg-slate-50 flex items-center gap-2">
                    {mod.isLocked ? <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span> : <span className="material-symbols-outlined text-[14px] text-slate-400">folder_open</span>}
                    <span className={`font-bold text-[12px] ${mod.isLocked ? 'text-slate-400' : 'text-[#111827]'}`}>{mod.title}</span>
                  </div>
                  {!mod.isLocked && mod.episodes.map((ep: any, index: number) => {
                    const isActive = episode?.id === ep.id;
                    return (
                      <div 
                        key={ep.id} 
                        onClick={() => {
                          setLastProgress({ progress_seconds: ep.progress_seconds, is_completed: ep.is_completed, episode: { ...ep, module: { id: mod.id, title: mod.title } } });
                          setCurrentProgress(ep.progress_seconds);
                          setIsPlaying(true); // Auto play when selected
                        }}
                        className={`px-4 py-3 flex flex-col gap-1 cursor-pointer transition-colors border-l-2 ${isActive ? 'bg-blue-50 border-blue-600' : 'hover:bg-slate-100 border-transparent'}`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-2">
                            {isActive ? (
                              <span className="material-symbols-outlined text-[14px] text-blue-600 animate-pulse">volume_up</span>
                            ) : ep.is_completed ? (
                              <span className="material-symbols-outlined text-[14px] text-green-500">check_circle</span>
                            ) : (
                              <span className="material-symbols-outlined text-[14px] text-slate-400">play_circle</span>
                            )}
                            <span className={`text-[12px] font-bold ${isActive ? 'text-blue-700' : ep.is_completed ? 'text-slate-500' : 'text-[#111827]'}`}>
                              {index + 1}. {ep.title}
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500 font-mono">{Math.floor(ep.duration_seconds/60)}:{(ep.duration_seconds%60).toString().padStart(2, '0')}</span>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="ml-6 w-full max-w-[200px] h-1 bg-slate-200 rounded-full overflow-hidden mt-1">
                          <div className={`h-full ${ep.is_completed ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${Math.min(100, (ep.progress_seconds / (ep.duration_seconds || 1)) * 100)}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {episode?.pdf_url && (
            <a href={episode.pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-3 bg-[#F8FAFC] border border-[#E5E7EB] hover:border-[#059669] hover:bg-green-50 px-4 py-3 rounded-lg text-left transition-colors mt-2">
              <span className="material-symbols-outlined text-[20px] text-[#059669]">picture_as_pdf</span>
              <div className="flex flex-col">
                <span className="text-[13px] font-bold text-[#111827]">Download Resources</span>
                <span className="text-[11px] text-slate-500">Get the PDF notes for this specific episode</span>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* Homework Drill Module */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 flex flex-col">
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center flex-shrink-0 text-[#9CA3AF]">
            <span className="material-symbols-outlined text-[20px]">assignment</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-extrabold tracking-tight text-[18px] text-[#111827] leading-tight">Module Assignment</h3>
            <span className="text-[11px] text-[#6B7280] mt-0.5">Practical Simulation</span>
          </div>
        </div>
        
        <div className="bg-[#F3F4F6] text-[#6B7280] px-2.5 py-1 rounded w-max text-[10px] font-bold uppercase tracking-wider mb-5 border border-[#E5E7EB]">
          No active assignment
        </div>

        <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] p-4 md:p-6 flex flex-col items-center justify-center min-h-[200px] text-center">
          <span className="material-symbols-outlined text-[#9CA3AF] text-[24px] md:text-[32px] mb-2">assignment_late</span>
          <span className="text-[13px] font-bold text-[#4B5563]">No Assignment Available</span>
          <p className="text-[11px] text-[#9CA3AF] mt-1 max-w-[250px]">Assignments will appear here when you unlock a new module.</p>
        </div>
      </div>

    </div>
  )
}
