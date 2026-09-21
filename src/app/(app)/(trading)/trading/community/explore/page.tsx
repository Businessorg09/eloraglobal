'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ExplorePage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [explorePosts, setExplorePosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePost, setActivePost] = useState<any>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/community/posts');
      const data = await res.json();
      if (data.posts) setExplorePosts(data.posts);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (searchTimeout) clearTimeout(searchTimeout);

    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const res = await fetch(`/api/community/friends?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.users) setSearchResults(data.users);
      } catch (err) {
        console.error(err);
      }
    }, 500);
    
    setSearchTimeout(timeout);
  };

  const handleMessage = async (userId: string) => {
    try {
      const res = await fetch('/api/community/chat/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: userId })
      });
      const data = await res.json();
      if (data.roomId) router.push(`/trading/community/messages?roomId=${data.roomId}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col max-w-[900px] mx-auto w-full pb-20 pt-8 animate-in fade-in duration-300">
      
      {/* Search Header */}
      <div className="relative mb-8 max-w-[600px] w-full mx-auto px-4 md:px-0 z-20">
        <span className="material-symbols-outlined absolute left-8 md:left-4 top-1/2 transform -translate-y-1/2 text-outline text-[24px]">search</span>
        <input 
          type="text" 
          placeholder="Search for users..." 
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="w-full bg-surface-container-lowest border border-surface-container-high rounded-full pl-12 pr-6 py-4 font-body-lg text-[16px] text-on-surface focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)]"
        />
        
        {/* Search Results Dropdown */}
        {searchQuery && (
          <div className="absolute top-full mt-2 left-4 md:left-0 right-4 md:right-0 bg-surface-container-lowest rounded-[24px] shadow-lg border border-surface-container-high overflow-hidden z-30">
            {searchResults.length === 0 ? (
              <div className="p-4 text-center text-on-surface-variant font-body-sm">No users found</div>
            ) : (
              searchResults.map(user => (
                <div key={user.id} className="flex items-center justify-between p-3 hover:bg-surface-container-low transition-colors border-b border-surface-container-low last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[14px]">
                      {(user.username || user.full_name || 'U').substring(0,2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="font-headline-md text-[14px] font-bold">{user.username || user.full_name}</span>
                      <span className="font-body-sm text-[12px] text-outline">{user.custom_title || 'Trader'}</span>
                    </div>
                  </div>
                  <button onClick={() => handleMessage(user.id)} className="bg-surface-container hover:bg-surface-container-high text-on-surface p-2 rounded-lg transition-colors flex items-center gap-2 font-label-md">
                    <span className="material-symbols-outlined text-[18px]">chat</span> Message
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Explore Grid */}
      <div className="px-4 md:px-0">
        <h2 className="font-headline-lg font-bold mb-4 flex items-center gap-2 text-on-surface">
          <span className="material-symbols-outlined text-primary">explore</span> Explore Feed
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2">
          {isLoading ? (
            <div className="col-span-3 py-20 text-center text-outline">Loading feed...</div>
          ) : explorePosts.length === 0 ? (
            <div className="col-span-3 py-20 text-center text-outline">No posts found</div>
          ) : (
            explorePosts.map(post => (
              <div key={post.id} onClick={() => setActivePost(post)} className="aspect-square bg-surface-container-high relative group cursor-pointer overflow-hidden flex items-center justify-center">
                {post.image_url ? (
                  <img src={post.image_url} alt="Grid post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <div className="flex flex-col items-center justify-center text-on-surface p-4 text-center w-full h-full bg-surface-container group-hover:bg-surface-container-high transition-colors">
                     <span className="font-body-sm text-[11px] md:text-[13px] line-clamp-4 w-full break-words opacity-80">{post.content}</span>
                  </div>
                )}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-6">
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <span className="material-symbols-outlined filled text-[20px]">favorite</span>
                    {post.likes_count || post.likes?.length || 0}
                  </div>
                  <div className="flex items-center gap-1.5 text-white font-bold">
                    <span className="material-symbols-outlined filled text-[20px]">chat_bubble</span>
                    {post.comments_count || post.comments?.length || 0}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Post Viewer Modal */}
      {activePost && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 animate-in fade-in duration-200">
          <div className="absolute top-4 md:p-6 right-6">
            <button onClick={() => setActivePost(null)} className="text-white hover:text-white/70 transition-colors">
              <span className="material-symbols-outlined text-[32px]">close</span>
            </button>
          </div>
          <div className="w-full max-w-[800px] bg-surface-container-lowest rounded-2xl overflow-hidden flex flex-col md:flex-row max-h-[85vh]">
            <div className="flex-1 bg-surface-container-high flex items-center justify-center min-h-[300px]">
              {activePost.image_url ? (
                <img src={activePost.image_url} alt="Post" className="w-full h-full object-contain" />
              ) : (
                <div className="p-4 md:p-8 text-center flex flex-col items-center">
                  <span className="material-symbols-outlined text-[48px] text-on-surface-variant/50 mb-4">article</span>
                  <p className="font-body-lg text-on-surface">{activePost.content}</p>
                </div>
              )}
            </div>
            <div className="w-full md:w-[350px] flex flex-col border-l border-surface-container-low bg-surface-container-lowest">
              <div className="p-4 border-b border-surface-container-low flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[12px]">
                  {(activePost.author?.username || activePost.author?.full_name || 'U').substring(0,2).toUpperCase()}
                </div>
                <span className="font-headline-md text-[14px] font-bold text-on-surface">{activePost.author?.username || activePost.author?.full_name}</span>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-primary shrink-0 flex items-center justify-center text-white font-bold text-[12px]">
                     {(activePost.author?.username || activePost.author?.full_name || 'U').substring(0,2).toUpperCase()}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-headline-md text-[14px] font-bold text-on-surface inline-block mr-2">{activePost.author?.username || activePost.author?.full_name}</span>
                    <span className="font-body-sm text-[14px] text-on-surface whitespace-pre-wrap mt-1">{activePost.content}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 border-t border-surface-container-low flex gap-4">
                <button className="text-on-surface hover:text-primary transition-colors"><span className="material-symbols-outlined text-[24px]">favorite</span></button>
                <button className="text-on-surface hover:text-primary transition-colors"><span className="material-symbols-outlined text-[24px]">chat_bubble</span></button>
                <button className="text-on-surface hover:text-primary transition-colors ml-auto"><span className="material-symbols-outlined text-[24px]">bookmark</span></button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
