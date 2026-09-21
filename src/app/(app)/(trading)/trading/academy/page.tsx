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
  
  // Video Player Modal State
  const [activeEpisode, setActiveEpisode] = useState<Episode | null>(null);
  const [startSeconds, setStartSeconds] = useState<number>(0);
  const [currentProgress, setCurrentProgress] = useState<number>(0);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTime = useRef<number>(0);

  // When modal opens, start a timer to track progress
  useEffect(() => {
    if (activeEpisode) {
      timerRef.current = setInterval(() => {
        setCurrentProgress(prev => prev + 1);
      }, 1000);
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
    
    // Only save if progress changed by more than 5 seconds to avoid spamming API
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
    handleSaveProgress(currentProgress);
    setActiveEpisode(null);
    setStartSeconds(0);
    setCurrentProgress(0);
    // Refetch progress to update Hero section
    fetch('/api/academy/progress').then(r => r.json()).then(data => setLastProgress(data.progress || null));
  };

  const handleResumeHero = () => {
    if (lastProgress && lastProgress.episode) {
      setActiveEpisode(lastProgress.episode);
      setStartSeconds(lastProgress.progress_seconds);
    }
  };

  const totalEpisodesUnlocked = modules.filter(m => !m.isLocked).reduce((acc, m) => acc + (m.episodes?.length || 0), 0);
  const completedModules = 0; // Will be driven by tracking DB in future

  // We must use Native iframes for guaranteed playback
  // This converts standard YouTube links INTO embed links, and handles iframe tags
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
      cleanUrl += `${separator}start=${Math.floor(startAt)}&autoplay=1`;
    }
    
    return cleanUrl;
  };

  // We must ensure the modal only renders on client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => setIsMounted(true), []);

  if (!isMounted) return null;

  if (!isLoading && userTier === 0) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">school</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Academy Access Locked</h2>
          <p className="text-slate-500 mb-6 text-sm">
            You do not have a trading account assigned to you yet. Please request one from the terminal or purchase an affiliate package to unlock Academy curricula.
          </p>
          <a href="/dashboard/business" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
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
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Video Library & Playlists</h1>
          <p className="text-slate-500 text-sm mt-1">Explore curated masterclass video series, on-demand playback vaults, strategy breakdowns, and track completed modules.</p>
        </div>
      </div>

      {/* --- PROGRESS TRACKER --- */}
      <section className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between pb-5 border-slate-100 gap-4">
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
            <div className="bg-slate-50 px-3 py-2 rounded-xl border border-slate-200/70">
              <span className="text-slate-400 font-medium block text-[10px] uppercase">Unlocked Vods</span>
              <span className="font-bold text-slate-800 text-sm">{totalEpisodesUnlocked} Videos</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- HERO PLAYLIST (CONTINUE WATCHING) --- */}
      {lastProgress && lastProgress.episode && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#132c66] via-[#1a3d8c] to-[#1e4cb8] p-5 md:p-9 text-white shadow-xl">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
          <div className="absolute -left-10 -bottom-10 w-60 h-60 rounded-full bg-indigo-500/15 blur-2xl pointer-events-none"></div>
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-semibold text-blue-200 tracking-wide backdrop-blur-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                Continue Watching
              </div>
              <h2 className="text-xl md:text-4xl font-extrabold tracking-tight text-white leading-tight">
                {lastProgress.episode.module?.title || 'Academy Module'}
              </h2>
              <p className="text-xs md:text-base text-blue-100/80 leading-relaxed font-normal">
                {lastProgress.episode.title}
              </p>
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs text-blue-200 mb-2">
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
                <button onClick={handleResumeHero} className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white text-blue-900 font-bold text-sm hover:bg-blue-50 transition-colors shadow-lg shadow-black/10">
                  <span className="material-symbols-outlined text-[18px]">play_arrow</span>
                  <span>Resume Video</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* --- CURATED PLAYLISTS GRID --- */}
      {isLoading ? (
        <div className="py-20 text-center text-slate-500 font-bold">Loading Live Masterclasses...</div>
      ) : modules.length === 0 ? (
        <div className="py-20 text-center text-slate-500">The Academy is currently empty.</div>
      ) : (
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curated Academy Playlists</h2>
              <p className="text-xs sm:text-sm text-slate-500">Comprehensive structured series arranged into sequential track playlists.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {modules.map((mod) => {
              const isLocked = mod.isLocked;
              
              return (
                <div key={mod.id} className={`group relative flex flex-col bg-white rounded-2xl border transition-all duration-200 overflow-hidden ${isLocked ? 'border-slate-200 shadow-sm' : 'border-slate-200/80 shadow-md hover:border-blue-400'}`}>
                  
                  {/* Thumbnail Area */}
                  <div className="p-3 relative">
                    <div className={`aspect-video rounded-xl overflow-hidden flex items-center justify-center relative ${isLocked ? 'bg-slate-100' : 'bg-gradient-to-br from-slate-900 to-[#0e2a36]'}`}>
                      
                      {!isLocked ? (
                        <>
                          <div className="absolute top-2.5 right-2.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-slate-200 backdrop-blur-sm flex items-center gap-1">
                              <span className="material-symbols-outlined text-[12px]">video_library</span>
                              {mod.episodes?.length || 0} Videos
                            </span>
                          </div>
                          <div className="w-10 h-10 rounded-full bg-white/90 group-hover:bg-white text-slate-900 flex items-center justify-center shadow-md transition transform group-hover:scale-110">
                            <span className="material-symbols-outlined text-[20px]">play_arrow</span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-slate-900/10 backdrop-blur-sm flex flex-col items-center justify-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-white shadow-md flex items-center justify-center text-slate-400">
                            <span className="material-symbols-outlined text-[20px]">lock</span>
                          </div>
                          <span className="px-3 py-1 bg-white rounded-full text-[10px] font-bold text-slate-600 uppercase tracking-wide shadow-sm">Tier {mod.package_tier_required} Required</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="px-4 pb-4 flex-1 flex flex-col justify-between relative">
                    <div className={`transition-opacity ${isLocked ? 'opacity-40' : 'opacity-100'}`}>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-2 leading-snug">
                        {isLocked ? `Module: [ Restricted Content ]` : mod.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{!isLocked && mod.description}</p>
                    </div>

                    {isLocked ? (
                      <div className="mt-4 pt-3 border-t border-slate-100">
                        <button className="w-full py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg text-xs font-bold shadow-md shadow-blue-500/20 transition-all flex items-center justify-center gap-1.5">
                          <span className="material-symbols-outlined text-[16px]">workspace_premium</span>
                          Upgrade to Tier {mod.package_tier_required}
                        </button>
                      </div>
                    ) : (
                      <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700 flex items-center justify-center">{mod.instructor ? mod.instructor.substring(0,2).toUpperCase() : 'AI'}</span>
                          <span className="text-slate-600 font-medium">{mod.instructor || 'Unknown'}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* --- ALL EPISODES LIST --- */}
      {!isLoading && modules.length > 0 && (
        <section className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Granular Episode Breakdown</span>
              <h3 className="text-base font-bold text-slate-900 mt-0.5">All Academy Content</h3>
            </div>
          </div>
          
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Episode</th>
                  <th className="px-4 py-3">Topic & Description</th>
                  <th className="px-4 py-3">Module</th>
                  <th className="px-4 py-3 text-right rounded-r-lg">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {modules.map((mod) => {
                  const isLocked = mod.isLocked;
                  
                  return mod.episodes?.map((ep) => {
                    return (
                      <tr key={ep.id} className={`${isLocked ? 'bg-slate-50/50' : 'hover:bg-slate-50/70'} transition-colors`}>
                        <td className={`px-4 py-3.5 font-bold ${isLocked ? 'text-slate-400' : 'text-slate-900'}`}>
                          {mod.order_index}.{ep.order_index}
                        </td>
                        <td className="px-4 py-3.5">
                          <div className={`font-medium ${isLocked ? 'text-slate-400 blur-[2px] select-none' : 'text-slate-800'}`}>
                            {isLocked ? 'Hidden Restricted Content ' : ep.title}
                          </div>
                          <span className="text-[10px] text-slate-400">Duration: {ep.duration_seconds}s</span>
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={`text-[11px] ${isLocked ? 'text-slate-400' : 'font-semibold text-blue-600'}`}>
                            {isLocked ? 'Locked' : mod.title}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          {isLocked ? (
                            <button className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded hover:bg-blue-100 transition-colors">
                              Upgrade Tier {mod.package_tier_required}
                            </button>
                          ) : (
                            <button 
                              onClick={() => { 
                                setActiveEpisode(ep); 
                                setStartSeconds(0); 
                                setCurrentProgress(0);
                              }}
                              className="text-[11px] font-bold text-white bg-blue-600 px-3 py-1 rounded shadow-sm hover:bg-blue-700 transition-colors flex items-center justify-center gap-1 ml-auto"
                            >
                              <span className="material-symbols-outlined text-[14px]">play_circle</span> Watch Now
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })}
              </tbody>
            </table>
          </div>

          {/* MOBILE EPISODES LIST (Stack of Cards) */}
          <div className="flex flex-col gap-3 md:hidden">
            {modules.map((mod) => {
              const isLocked = mod.isLocked;
              return mod.episodes?.map((ep) => (
                <div key={ep.id} className={`p-4 rounded-xl border ${isLocked ? 'bg-slate-50 border-slate-100' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${isLocked ? 'bg-slate-200 text-slate-500' : 'bg-blue-50 text-blue-600'}`}>
                      {isLocked ? 'Locked' : mod.title}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Ep {mod.order_index}.{ep.order_index}</span>
                  </div>
                  <h4 className={`text-sm font-bold mb-1 ${isLocked ? 'text-slate-400 blur-[2px] select-none' : 'text-slate-800'}`}>
                    {isLocked ? 'Hidden Restricted Content ' : ep.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 mb-3">Duration: {ep.duration_seconds}s</p>
                  
                  {isLocked ? (
                    <button className="w-full py-2 text-[11px] font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors flex items-center justify-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock</span>
                      Upgrade Tier {mod.package_tier_required}
                    </button>
                  ) : (
                    <button 
                      onClick={() => { 
                        setActiveEpisode(ep); 
                        setStartSeconds(0); 
                        setCurrentProgress(0);
                      }}
                      className="w-full py-2 text-[11px] font-bold text-white bg-blue-600 rounded-lg shadow-sm shadow-blue-500/20 hover:bg-blue-700 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-[16px]">play_circle</span> Watch Now
                    </button>
                  )}
                </div>
              ));
            })}
          </div>
  
        </section>
      )}

      {/* --- VIDEO PLAYER MODAL --- */}
      {activeEpisode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 bg-slate-900/90 backdrop-blur-md">
          <div className="bg-black w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
            <div className="p-4 bg-slate-900 flex justify-between items-center border-b border-slate-800">
              <h2 className="text-white font-bold text-lg">{activeEpisode.title}</h2>
              <button onClick={handleClosePlayer} className="text-slate-400 hover:text-white">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="aspect-video w-full bg-black relative flex items-center justify-center">
              {activeEpisode.video_url ? (
                <iframe 
                  src={getEmbedUrl(activeEpisode.video_url, startSeconds)} 
                  className="w-full h-full border-0 absolute inset-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <div className="text-slate-500">
                  Video URL not provided for this episode.
                </div>
              )}
            </div>
            
            {(activeEpisode.description || activeEpisode.pdf_url) && (
              <div className="p-6 bg-slate-900 border-t border-slate-800 text-slate-300">
                {activeEpisode.description && <p className="text-sm mb-4">{activeEpisode.description}</p>}
                {activeEpisode.pdf_url && (
                  <a href={activeEpisode.pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-white font-bold text-xs transition-colors">
                    <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> Download Resource
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
