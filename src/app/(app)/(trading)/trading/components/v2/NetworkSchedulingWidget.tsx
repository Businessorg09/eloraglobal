'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function NetworkSchedulingWidget() {
  const [profile, setProfile] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [overviewRes, postsRes] = await Promise.all([
          fetch('/api/dashboard/overview'),
          fetch('/api/community/posts')
        ]);
        
        const overviewData = await overviewRes.json();
        if (overviewData.profile) setProfile(overviewData.profile);

        const postsData = await postsRes.json();
        if (postsData.posts) setPosts(postsData.posts.slice(0, 3)); // Only take top 3 for the peek
      } catch (err) {
        console.error("Failed to fetch dashboard widgets", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      
      {/* Live Class Timetable */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold tracking-tight text-[16px] text-[#111827] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#E5E7EB]"></span> Live Class Timetable
          </h3>
          <button className="text-[#9CA3AF] font-bold text-[11px] flex items-center gap-1 cursor-not-allowed">
            <span className="material-symbols-outlined text-[14px]">calendar_month</span> Sync
          </button>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 flex flex-col items-center justify-center min-h-[150px] text-center gap-2">
          <span className="material-symbols-outlined text-[#9CA3AF] text-[24px] md:text-[32px]">event_busy</span>
          <span className="text-[13px] font-bold text-[#4B5563]">No Upcoming Sessions</span>
          <span className="text-[11px] text-[#9CA3AF]">Your schedule is clear. Check back later for new live classes.</span>
        </div>
      </div>

      {/* Trader Passport Compact */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold tracking-tight text-[16px] text-[#111827]">Trader Passport</h3>
          <span className="bg-[#F3F4F6] text-[#9CA3AF] px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider">
            {profile ? `Tier ${profile.tier}` : 'No Tier'}
          </span>
        </div>
        
        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 flex flex-col">
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#F3F4F6]">
            <div className={`w-10 h-10 ${profile && profile.tier >= 3 ? 'bg-amber-100 text-amber-600' : 'bg-[#E5E7EB] text-[#9CA3AF]'} rounded flex items-center justify-center`}>
              <span className="material-symbols-outlined text-[20px]">badge</span>
            </div>
            <div className="flex flex-col">
              <h4 className="font-bold text-[12px] text-[#111827] leading-tight">
                {profile?.fullName || 'Trader Profile'}
              </h4>
              <span className="text-[10px] text-[#6B7280] leading-tight mt-0.5">
                {profile?.propAllocation || '$0'} Allocation Clearance
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 mb-4">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#4B5563] font-bold">Academic Theory</span>
              <div className="flex flex-col items-end">
                <span className="font-bold text-[#9CA3AF]">{profile?.completionPercentage || 0}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#4B5563] font-bold">Sandbox Execution</span>
              <div className="flex flex-col items-end">
                <span className="font-bold text-[#9CA3AF]">0%</span>
                <span className="text-[9px] font-bold text-[#9CA3AF] uppercase">Pending</span>
              </div>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-[#4B5563] font-bold">Risk Compliance</span>
              <span className="font-bold text-[#9CA3AF]">{profile?.streak || 0}/30 Days</span>
            </div>
          </div>

          <Link href="/trading/passport" className="flex items-center justify-between w-full p-3 bg-[#F8FAFC] border border-[#E5E7EB] hover:border-blue-300 hover:bg-blue-50 cursor-pointer rounded-lg text-[11px] font-bold text-blue-600 transition-colors">
            <span className="flex items-center gap-2"><span className="material-symbols-outlined text-[16px]">verified</span> View Verified Credential</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </Link>
        </div>
      </div>

      {/* Trader Guild Feed */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="font-bold text-[14px] text-[#111827] flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#9CA3AF]">forum</span> Trader Guild Feed
          </h3>
          <Link href="/trading/community" className="text-[10px] font-bold text-blue-600 hover:underline">
             View All
          </Link>
        </div>

        <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 flex flex-col min-h-[150px]">
          {isLoading ? (
            <div className="flex-1 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-500 animate-spin">refresh</span>
            </div>
          ) : posts.length > 0 ? (
            <div className="flex flex-col gap-4">
              {posts.map(post => (
                <div key={post.id} className="flex flex-col border-b border-[#F3F4F6] pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-[10px] font-bold">
                      {post.author?.full_name?.charAt(0) || 'U'}
                    </div>
                    <span className="text-[11px] font-bold text-[#111827]">{post.author?.full_name || 'Trader'}</span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] line-clamp-2">{post.content}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center gap-2 h-full">
              <span className="material-symbols-outlined text-[#9CA3AF] text-[24px] md:text-[32px]">chat_bubble_outline</span>
              <span className="text-[13px] font-bold text-[#4B5563]">Guild Offline</span>
              <span className="text-[11px] text-[#9CA3AF]">No recent posts. Be the first to start a discussion!</span>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}
