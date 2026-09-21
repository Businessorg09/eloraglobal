'use client'

import React, { useState, useEffect } from 'react';

type Episode = {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  progress_seconds: number;
  is_completed: boolean;
};

type Module = {
  id: string;
  title: string;
  isLocked: boolean;
  package_tier_required: number;
  episodes: Episode[];
};

type ProfileData = {
  fullName: string;
  packageName: string;
  tier: number;
  propAllocation: string;
  completionPercentage: number;
  modulesCleared: number;
  totalUnlockedModules: number;
  streak: number;
};

export function ProfilePathwayWidget() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [playlist, setPlaylist] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const res = await fetch('/api/dashboard/overview');
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.playlist) setPlaylist(data.playlist);
      } catch (err) {
        console.error("Failed to load overview", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOverview();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex items-center justify-center min-h-[400px]">
        <span className="material-symbols-outlined text-[24px] text-blue-500 animate-spin">refresh</span>
      </div>
    );
  }

  const p = profile!;

  return (
    <div className="flex flex-col gap-4">
      {/* Profile Card */}
      <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 relative overflow-hidden">
        {/* Decorative background element for higher tiers */}
        {p.tier > 1 && (
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-full blur-2xl pointer-events-none"></div>
        )}
        
        <div className="flex items-center gap-3 mb-4 relative z-10">
          <div className="w-12 h-12 rounded-full bg-[#E5E7EB] flex items-center justify-center text-[#9CA3AF] font-extrabold tracking-tight text-[18px] relative overflow-hidden border-2 border-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <span className="material-symbols-outlined text-[24px]">person</span>
          </div>
          <div className="flex flex-col">
            <h3 className="font-bold text-sm md:text-[16px] text-[#111827] leading-tight truncate max-w-[140px] md:max-w-[180px]">{p.fullName}</h3>
            <span className="text-[11px] text-[#6B7280]">Tier {p.tier} • {p.packageName}</span>
          </div>
          <div className="ml-auto bg-[#F3F4F6] text-[#6B7280] text-[9px] font-bold px-2 py-1 rounded flex flex-col items-center shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <span>TIER</span>
            <span className={p.tier === 3 ? "text-amber-500" : p.tier === 2 ? "text-blue-600" : ""}>{p.tier}</span>
          </div>
        </div>

        <div className="mb-4 relative z-10">
          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
            <span className="text-[#4B5563]">Curriculum Completion</span>
            <span className="text-[#9CA3AF]">{p.completionPercentage}%</span>
          </div>
          <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden mb-1">
            <div className="bg-[#1D4ED8] h-full transition-all duration-1000 ease-out" style={{ width: `${p.completionPercentage}%` }}></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[#6B7280] font-medium">
            <span>{p.modulesCleared} Modules Cleared</span>
            <span className="text-[#9CA3AF] font-bold">{Math.max(0, p.totalUnlockedModules - p.modulesCleared)} Remaining</span>
          </div>
        </div>

        <div className="flex items-center gap-4 py-4 border-t border-b border-[#F3F4F6] mb-4 relative z-10">
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">
              Streak <span className="material-symbols-outlined text-[#F59E0B] text-[12px]">local_fire_department</span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-lg md:text-[20px] font-black text-[#111827] leading-none">{p.streak}</span>
              <span className="text-[11px] font-bold text-[#9CA3AF]">Days</span>
            </div>
          </div>
          <div className="w-px h-10 bg-[#E5E7EB]"></div>
          <div className="flex-1 flex flex-col">
            <div className="flex items-center gap-1 text-[10px] font-bold text-[#6B7280] uppercase tracking-wider mb-0.5">
              Package <span className="material-symbols-outlined text-[#1D4ED8] text-[12px]">workspace_premium</span>
            </div>
            <span className="text-sm md:text-[14px] font-black text-[#111827] leading-tight truncate">{p.packageName}</span>
            <span className="text-[10px] text-[#059669] font-bold mt-0.5">Active</span>
          </div>
        </div>

        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">PROP ALLOCATION TRACK</span>
            <span className="text-sm md:text-[14px] font-black text-[#10B981]">{p.propAllocation} <span className="text-[10px] text-[#9CA3AF] font-bold">Liquid</span></span>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-[10px] font-bold text-[#9CA3AF] flex items-center justify-end gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span> {p.tier >= 3 ? 'Elite' : p.tier >= 2 ? 'Pro' : 'Fellow'}
            </span>
            <span className="text-[9px] text-[#9CA3AF] uppercase">Risk Preservation<br/>Index</span>
          </div>
        </div>
      </div>

      {/* Academy Modules Mini-Playlist */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3 px-1">
          <div className="flex flex-col">
            <h3 className="font-bold text-[14px] text-[#111827] leading-tight">Academy Modules</h3>
            <span className="text-[11px] text-[#6B7280]">Structured learning modules</span>
          </div>
          <a href="/trading/academy" className="text-[11px] font-bold text-blue-600 hover:underline">View All</a>
        </div>

        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1 custom-scrollbar">
          
          {playlist.length === 0 ? (
            <div className="bg-[#F8FAFC] border border-[#E5E7EB] rounded-[24px] p-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col text-center items-center justify-center min-h-[150px]">
              <span className="material-symbols-outlined text-[#9CA3AF] text-[32px] mb-2">school</span>
              <span className="text-[13px] font-bold text-[#4B5563]">No Modules Available</span>
            </div>
          ) : (
            playlist.map((mod) => (
              <div key={mod.id} className={`bg-white border rounded-[24px] p-3 flex flex-col gap-2 transition-all ${mod.isLocked ? 'border-[#E5E7EB] opacity-60 grayscale' : 'border-[#E5E7EB] hover:border-blue-300 shadow-[0_4px_20px_rgba(0,0,0,0.03)]'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-2">
                    {mod.isLocked ? (
                      <span className="material-symbols-outlined text-[14px] text-slate-400">lock</span>
                    ) : (
                      <span className="material-symbols-outlined text-[14px] text-blue-500">play_circle</span>
                    )}
                    <span className="text-[12px] font-bold text-[#111827] line-clamp-1">{mod.title}</span>
                  </div>
                  {mod.isLocked && <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase">Tier {mod.package_tier_required}</span>}
                </div>
                
                {/* Mini Episode List */}
                {!mod.isLocked && mod.episodes.length > 0 && (
                  <div className="flex flex-col gap-1 mt-1 pl-5 border-l-2 border-slate-100">
                    {mod.episodes.slice(0, 3).map((ep, i) => (
                      <div key={ep.id} className="flex items-center justify-between text-[10px]">
                        <span className={`truncate max-w-[140px] ${ep.is_completed ? 'text-slate-400 line-through' : 'text-slate-700 font-medium'}`}>
                          {i+1}. {ep.title}
                        </span>
                        {ep.is_completed ? (
                          <span className="material-symbols-outlined text-[12px] text-green-500">check_circle</span>
                        ) : (
                          <span className="text-slate-400">{Math.floor((ep.progress_seconds / (ep.duration_seconds || 1)) * 100)}%</span>
                        )}
                      </div>
                    ))}
                    {mod.episodes.length > 3 && (
                      <span className="text-[10px] text-blue-500 font-bold mt-1">+ {mod.episodes.length - 3} more videos</span>
                    )}
                  </div>
                )}
              </div>
            ))
          )}

        </div>
      </div>

    </div>
  )
}
