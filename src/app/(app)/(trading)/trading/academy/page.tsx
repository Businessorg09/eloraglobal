'use client'

import React, { useState, useEffect, useRef } from 'react';

type Episode = {
  id: string;
  title: string;
  description: string;
  video_url: string;
  video_type?: 'youtube' | 'upload';
  thumbnail_url?: string;
  duration_seconds: number;
  pdf_url: string;
  order_index: number;
  module?: {
    id: string;
    title: string;
  };
};

type Module = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  package_tier_required: number;
  order_index: number;
  isLocked: boolean;
  episodes: Episode[];
};

type Progress = {
  progress_seconds: number;
  is_completed: boolean;
  episode: Episode;
};

export default function AcademyPage() {
  const [modules, setModules] = useState<Module[]>([]);
  const [userTier, setUserTier] = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [lastProgress, setLastProgress] = useState<Progress | null>(null);
  
  // Accordion State
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(null);
  
  // Video Player Modal State
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [startSeconds, setStartSeconds] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTime = useRef<number>(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // When modal opens (for iframe videos), start a timer to track progress.
  // Native videos update `currentProgress` via onTimeUpdate.
  useEffect(() => {
    if (activeEpisode) {
      const isDirect = activeEpisode.video_type === 'upload' || activeEpisode.video_url.includes('supabase.co/storage') || activeEpisode.video_url.match(/\.(mp4|webm|ogg)$/i);
      
      if (!isDirect) {
        timerRef.current = setInterval(() => {
          setCurrentProgress(prev => prev + 1);
        }, 1000);
      }
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeEpisode]);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await fetch('/api/academy/catalog');
        const data = await res.json();
        if (data.modules) {
          setModules(data.modules);
          setUserTier(data.userTier);
          // Auto-expand first unlocked module
          const firstUnlocked = data.modules.find((m: Module) => !m.isLocked);
          if (firstUnlocked) setExpandedModuleId(firstUnlocked.id);
        }
      } catch (err) {
        console.error("Failed to load catalog", err);
      }
    };

    const fetchProgress = async () => {
      try {
        const res = await fetch('/api/academy/progress');
        const data = await res.json();
        if (data.progress) {
          setLastProgress(data.progress);
        }
      } catch (err) {
        console.error("Failed to load progress", err);
      }
    };
    
    Promise.all([fetchCatalog(), fetchProgress()]).finally(() => {
      setIsLoading(false);
    });
  }, []);

  const handleSaveProgress = async (playedSeconds: number, isCompleted: boolean = false) => {
    if (!activeEpisode) return;
    
    if (Math.abs(playedSeconds - lastSavedTime.current) > 5 || isCompleted) {
      lastSavedTime.current = playedSeconds;
      try {
        await fetch('/api/academy/progress', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            episode_id: activeEpisode.id,
            progress_seconds: Math.floor(playedSeconds),
            is_completed: isCompleted
          })
        });
      } catch (err) {
        console.error("Failed to save progress", err);
      }
    }
  };

  const handleClosePlayer = () => {
    if (videoRef.current) {
      handleSaveProgress(videoRef.current.currentTime);
    } else {
      handleSaveProgress(currentProgress);
    }
    setActiveEpisode(null);
    setStartSeconds(0);
    setCurrentProgress(0);
    fetch('/api/academy/progress').then(r => r.json()).then(data => setLastProgress(data.progress || null));
  };

  const handleResumeHero = () => {
    if (lastProgress && lastProgress.episode) {
      setActiveEpisode(lastProgress.episode);
      setStartSeconds(lastProgress.progress_seconds);
      setCurrentProgress(lastProgress.progress_seconds);
    }
  };

  const totalEpisodesUnlocked = modules.filter(m => !m.isLocked).reduce((acc, m) => acc + (m.episodes?.length || 0), 0);
  const completedModules = 0; 

  const getEmbedUrl = (url: string, startAt: number) => {
    if (!url) return '';
    let cleanUrl = url;
    
    const iframeMatch = url.match(/src=["']([^"']+)["']/i);
    if (iframeMatch && iframeMatch[1]) cleanUrl = iframeMatch[1];
    
    const watchRegex = /youtube\.com\/watch\?v=([^"&?]+)/i;
    const watchMatch = cleanUrl.match(watchRegex);
    if (watchMatch && watchMatch[1]) cleanUrl = `https://www.youtube.com/embed/${watchMatch[1]}`;

    const shortRegex = /youtu\.be\/([^"&?]+)/i;
    const shortMatch = cleanUrl.match(shortRegex);
    if (shortMatch && shortMatch[1]) cleanUrl = `https://www.youtube.com/embed/${shortMatch[1]}`;
    
    if (startAt > 0) {
      const separator = cleanUrl.includes('?') ? '&' : '?';
      cleanUrl += `${separator}start=${Math.floor(startAt)}&autoplay=1`;
    }
    return cleanUrl;
  };

  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  if (!isLoading && userTier === 0) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white p-4 md:p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200 text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[24px] md:text-[32px]">school</span>
          </div>
          <h2 className="text-lg md:text-2xl font-bold tracking-tight text-slate-900 mb-2">Academy Access Locked</h2>
          <p className="text-slate-500 mb-6 text-sm">
            You do not have a trading account assigned to you yet. Please request one from the terminal or purchase an affiliate package to unlock Academy curricula.
          </p>
          <a href="/dashboard/business" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-[24px] font-bold hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            View Packages
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-lg md:text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900">Video Library & Playlists</h1>
          <p className="text-slate-500 text-sm mt-1">Explore curated masterclass video series, on-demand playback vaults, and strategy breakdowns.</p>
        </div>
      </div>

      {/* --- PROGRESS TRACKER --- */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-4 md:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                Academy Milestone Tracker
              </span>
              <span className="text-xs font-medium text-slate-400">Your Current Package: Tier {userTier}</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">Curriculum Mastery: {completedModules} of {modules.length} Modules Cleared</h2>
          </div>
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs">
            <div className="bg-slate-50 px-3 py-2 rounded-[24px] border border-slate-200/70">
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Unlocked Vods</span>
              <span className="font-bold text-slate-800 text-sm">{totalEpisodesUnlocked} Videos</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- HERO PLAYLIST (CONTINUE WATCHING) --- */}
      {lastProgress && lastProgress.episode && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#132c66] via-[#1a3d8c] to-[#1e4cb8] p-4 md:p-5 md:p-9 text-white shadow-xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 md:gap-8 ">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 tracking-wide backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Continue Watching
              </div>
              <h2 className="text-xl md:text-3xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {lastProgress.episode.module?.title || 'Academy Module'}
              </h2>
              <p className="text-xs md:text-base text-blue-100/80 leading-relaxed font-normal">
                {lastProgress.episode.title}
              </p>
              <div className="pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 text-xs text-blue-200 mb-2">
                  <span className="font-semibold text-white">
                    Paused at {Math.floor(lastProgress.progress_seconds / 60)}:{(lastProgress.progress_seconds % 60).toString().padStart(2, '0')}
                  </span>
                  <span>{Math.floor((lastProgress.progress_seconds / (lastProgress.episode.duration_seconds || 1)) * 100)}% Complete</span>
                </div>
                <div className="w-full bg-blue-950/60 rounded-full h-2 overflow-hidden p-0.5 border border-blue-400/20">
                  <div className="bg-blue-400 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (lastProgress.progress_seconds / (lastProgress.episode.duration_seconds || 1)) * 100)}%` }}></div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <button onClick={handleResumeHero} className="flex items-center gap-2.5 px-6 py-3 rounded-[24px] bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-black/10">
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Resume Video</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- ACCORDION PLAYLISTS --- */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 font-bold">Loading Curated Playlists...</div>
      ) : modules.length === 0 ? (
        <div className="py-20 text-center text-slate-500">The Academy is currently empty.</div>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curated Academy Playlists</h2>
              <p className="text-xs sm:text-sm text-slate-500">Select a module to view its episodes.</p>
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            {modules.map((mod) => {
              const isLocked = mod.isLocked;
              const isExpanded = expandedModuleId === mod.id;
              
              return (
                <div key={mod.id} className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isLocked ? 'border-slate-200 opacity-70' : 'border-slate-200 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:border-blue-400'}`}>
                  
                  {/* Module Header (Clickable) */}
                  <div 
                    onClick={() => !isLocked && setExpandedModuleId(isExpanded ? null : mod.id)}
                    className={`p-4 md:p-6 flex items-center justify-between ${!isLocked ? 'cursor-pointer hover:bg-slate-50' : ''}`}
                  >
                    <div className="flex items-center gap-4 md:gap-6">
                       <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-gradient-to-br from-[#132c66] to-[#1e4cb8] text-white flex items-center justify-center font-bold text-xl md:text-2xl shadow-inner flex-shrink-0">
                          {mod.order_index}
                       </div>
                       <div>
                         <h3 className="font-bold text-base md:text-lg text-slate-900">
                           {isLocked ? `Restricted Module (Tier ${mod.package_tier_required})` : mod.title}
                         </h3>
                         <p className="text-xs md:text-sm text-slate-500 mt-1 line-clamp-2 md:line-clamp-1">{!isLocked && mod.description}</p>
                       </div>
                    </div>
                    
                    <div className="flex items-center gap-4 pl-4">
                       {!isLocked && (
                         <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                            <span className="material-symbols-outlined text-[14px]">video_library</span>
                            {mod.episodes?.length || 0} Episodes
                         </div>
                       )}
                       {isLocked ? (
                         <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center">
                           <span className="material-symbols-outlined text-[18px] text-slate-400">lock</span>
                         </div>
                       ) : (
                         <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${isExpanded ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-500'}`}>
                           <span className={`material-symbols-outlined text-[24px] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`}>expand_more</span>
                         </div>
                       )}
                    </div>
                  </div>
                  
                  {/* Episodes Grid (Expanded) */}
                  {isExpanded && !isLocked && (
                    <div className="border-t border-slate-100 bg-slate-50/50 p-4 md:p-6">
                       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                         {mod.episodes?.map(ep => (
                           <div key={ep.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md hover:border-blue-400 transition-all group flex flex-col">
                             <div className="aspect-video bg-slate-900 relative">
                               {ep.thumbnail_url ? (
                                 <img src={ep.thumbnail_url} alt={ep.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                               ) : (
                                 <div className="w-full h-full flex items-center justify-center text-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
                                   <span className="material-symbols-outlined text-[48px] opacity-20">movie</span>
                                 </div>
                               )}
                               <div className="absolute inset-0 flex items-center justify-center">
                                  <button 
                                    onClick={() => { setActiveEpisode(ep); setStartSeconds(0); setCurrentProgress(0); }}
                                    className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-blue-600/90 text-white flex items-center justify-center shadow-lg transform group-hover:scale-110 transition-all hover:bg-blue-600"
                                  >
                                    <span className="material-symbols-outlined text-[28px]">play_arrow</span>
                                  </button>
                               </div>
                               <div className="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-bold px-2 py-1 rounded backdrop-blur-sm">
                                 {Math.floor(ep.duration_seconds / 60)}:{(ep.duration_seconds % 60).toString().padStart(2, '0')}
                               </div>
                             </div>
                             <div className="p-4 flex-1 flex flex-col">
                               <div className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-wider">Episode {mod.order_index}.{ep.order_index}</div>
                               <h4 className="font-bold text-sm text-slate-900 line-clamp-2 leading-tight">{ep.title}</h4>
                               {ep.description && <p className="text-[11px] text-slate-500 mt-2 line-clamp-2">{ep.description}</p>}
                             </div>
                           </div>
                         ))}
                         {(!mod.episodes || mod.episodes.length === 0) && (
                           <div className="col-span-full py-8 text-center text-slate-500 text-sm font-medium">
                             No episodes available in this module yet.
                           </div>
                         )}
                       </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --- VIDEO PLAYER MODAL --- */}
      {activeEpisode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 bg-slate-900/95 backdrop-blur-md">
          <div className="bg-black w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col max-h-[100vh]">
            <div className="p-4 bg-slate-900 flex justify-between items-center border-b border-slate-800 shrink-0">
              <h2 className="text-white font-bold text-lg line-clamp-1 pr-4">{activeEpisode.title}</h2>
              <button onClick={handleClosePlayer} className="text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
            
            <div className="aspect-video w-full bg-black relative flex items-center justify-center shrink-0">
              {activeEpisode.video_url ? (
                (activeEpisode.video_type === 'upload' || activeEpisode.video_url.includes('supabase.co/storage') || activeEpisode.video_url.match(/\.(mp4|webm|ogg)$/i)) ? (
                  <video 
                    ref={videoRef}
                    src={activeEpisode.video_url + (startSeconds > 0 ? `#t=${startSeconds}` : '')}
                    controls
                    autoPlay
                    controlsList="nodownload"
                    className="w-full h-full absolute inset-0 outline-none"
                    onTimeUpdate={(e) => {
                      setCurrentProgress(Math.floor(e.currentTarget.currentTime));
                      // Save periodically every 10s directly from video
                      if (Math.floor(e.currentTarget.currentTime) % 10 === 0) {
                        handleSaveProgress(e.currentTarget.currentTime);
                      }
                    }}
                  ></video>
                ) : (
                  <iframe 
                    src={getEmbedUrl(activeEpisode.video_url, startSeconds)} 
                    className="w-full h-full border-0 absolute inset-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                )
              ) : (
                <div className="text-slate-500 font-medium">
                  Video URL not provided for this episode.
                </div>
              )}
            </div>
            
            {(activeEpisode.description || activeEpisode.pdf_url) && (
              <div className="p-4 md:p-6 bg-slate-900 border-t border-slate-800 text-slate-300 overflow-y-auto">
                {activeEpisode.description && <p className="text-sm mb-4 leading-relaxed text-slate-400">{activeEpisode.description}</p>}
                {activeEpisode.pdf_url && (
                  <a href={activeEpisode.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-bold text-sm transition-colors shadow-lg shadow-blue-500/20">
                    <span className="material-symbols-outlined text-[20px]">picture_as_pdf</span> Download Attached Resource
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
