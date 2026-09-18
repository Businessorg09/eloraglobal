'use client'

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export function SkoolFeedLayout() {
  const [isPremiumMember, setIsPremiumMember] = useState(true);
  const [activeCommentPostId, setActiveCommentPostId] = useState<number | null>(null);
  const [dropdownOpenPostId, setDropdownOpenPostId] = useState<string | null>(null);
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostPhoto, setNewPostPhoto] = useState<File | null>(null);
  const [activeStory, setActiveStory] = useState<any | null>(null);
  const [storyReply, setStoryReply] = useState('');
  const [floatingEmojis, setFloatingEmojis] = useState<{id: number, emoji: string, left: string}[]>([]);
  const [toast, setToast] = useState<{ title: string, subtitle?: string, img?: string | null, icon?: string, isLoading?: boolean } | null>(null);
  const [savedPosts, setSavedPosts] = useState<Record<string, boolean>>({});
  const [following, setFollowing] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  const [stories, setStories] = useState<any[]>([]);
  const [newStoryPhoto, setNewStoryPhoto] = useState<File | null>(null);
  const [isUploadingStory, setIsUploadingStory] = useState(false);
  
  const [posts, setPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Fetch posts from backend
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/community/posts', { cache: 'no-store' });
      const data = await res.json();
      
      if (data.posts) {
        // Map backend schema to frontend expectation
        const formattedPosts = data.posts.map((p: any) => {
          const authorName = p.author?.username || p.author?.full_name || 'Unknown User';
          return {
            id: p.id,
            author_id: p.author_id,
            author: authorName,
            role: p.author?.custom_title || 'Member',
            avatar: authorName.substring(0, 2).toUpperCase(),
            time: new Date(p.created_at).toLocaleDateString(),
            category: p.category,
            title: '',
            content: p.content,
            chartUrl: p.image_url,
            likes: p.likes_count,
            comments: p.comments || [],
            pinned: p.is_pinned,
            isVerified: p.author?.is_verified
          };
        });
        setPosts(formattedPosts);
        if (data.currentUserId) setCurrentUserId(data.currentUserId);
      } else if (data.error) {
        alert("Failed to load feed: " + data.error);
        console.error("Feed API Error:", data.error);
      }
    } catch (err: any) {
      alert("Network error fetching feed: " + err.message);
      console.error("Failed to fetch posts", err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStories = async () => {
    try {
      const res = await fetch('/api/community/stories', { cache: 'no-store' });
      const data = await res.json();
      if (data.stories) {
        // Group stories by author
        const grouped = data.stories.reduce((acc: any, story: any) => {
          const authorId = story.author_id;
          if (!acc[authorId]) {
            acc[authorId] = {
              id: authorId,
              name: story.author?.username || story.author?.full_name || 'User',
              img: (story.author?.username || story.author?.full_name || 'U').substring(0, 2).toUpperCase(),
              color: story.author_id === data.stories[0]?.author_id ? 'bg-primary' : 'bg-surface-container-high',
              stories: []
            };
          }
          acc[authorId].stories.push(story);
          return acc;
        }, {});
        setStories(Object.values(grouped));
      }
    } catch (err) {
      console.error("Failed to fetch stories", err);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchStories();
    const saved = localStorage.getItem('savedPosts');
    if (saved) {
      try { setSavedPosts(JSON.parse(saved)); } catch (e) {}
    }
  }, []);

  const toggleComments = (postId: number) => {
    if (activeCommentPostId === postId) {
      setActiveCommentPostId(null);
    } else {
      setActiveCommentPostId(postId);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() && !newPostPhoto) return;

    setToast({ 
      title: 'Posting to community...',
      subtitle: newPostContent || 'Photo post',
      img: newPostPhoto ? URL.createObjectURL(newPostPhoto) : null,
      isLoading: true
    });

    try {
      let base64Image = null;
      
      if (newPostPhoto) {
        base64Image = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(newPostPhoto);
          reader.onload = () => resolve(reader.result);
          reader.onerror = error => reject(error);
        });
      }

      const res = await fetch('/api/community/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: newPostContent,
          imageUrl: base64Image,
          category: '#General'
        })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        setNewPostContent('');
        setNewPostPhoto(null);
        setToast({ title: 'Finished processing!', subtitle: newPostContent || 'Photo post', icon: 'check_circle', isLoading: false });
        fetchPosts();
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast(null);
        alert(`Failed to post: ${data.error}`);
      }
    } catch (err: any) {
      setToast(null);
      alert(`Network error: ${err.message}`);
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/community/posts?id=${postId}`, { method: 'DELETE' });
      if (res.ok) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setToast({ title: 'Post deleted', icon: 'delete', isLoading: false });
        setTimeout(() => setToast(null), 3000);
      } else {
        const data = await res.json();
        alert(`Failed to delete: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Network error: ${err.message}`);
    }
  };

  const handleSavePost = (postId: string) => {
    const isSaved = !savedPosts[postId];
    const newSaved = { ...savedPosts, [postId]: isSaved };
    setSavedPosts(newSaved);
    localStorage.setItem('savedPosts', JSON.stringify(newSaved));
    setDropdownOpenPostId(null);
    
    setToast({ title: isSaved ? 'Saved to collection' : 'Removed from collection', icon: isSaved ? 'bookmark' : 'bookmark_remove', isLoading: false });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSharePost = (postId: string) => {
    navigator.clipboard.writeText(`${window.location.origin}/trading/community?postId=${postId}`);
    setDropdownOpenPostId(null);
    
    setToast({ title: 'Link copied to clipboard', icon: 'content_copy', isLoading: false });
    setTimeout(() => setToast(null), 3000);
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
        if (data.users) {
          setSearchResults(data.users);
        }
      } catch (err) {
        console.error("Search failed", err);
      }
    }, 500); // 500ms debounce
    
    setSearchTimeout(timeout);
  };

  const handleStoryReaction = (emoji: string) => {
    const id = Date.now();
    const left = `${Math.random() * 80 + 10}%`; // random position
    setFloatingEmojis(prev => [...prev, { id, emoji, left }]);
    
    setTimeout(() => {
      setFloatingEmojis(prev => prev.filter(e => e.id !== id));
    }, 1500);
    // Real implementation would also call API here
  };

  const handleStoryReply = async () => {
    if (!storyReply.trim() || !activeStory) return;
    
    const replyText = storyReply;
    setStoryReply('');
    setToast({ title: 'Sending reply...', isLoading: true });
    
    try {
      const roomRes = await fetch('/api/community/chat/room', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: activeStory.id })
      });
      const roomData = await roomRes.json();
      
      if (!roomData.roomId) throw new Error('Failed to create room');
      
      const msgRes = await fetch('/api/community/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          roomId: roomData.roomId, 
          content: `Replying to your story: ${replyText}` 
        })
      });
      
      if (msgRes.ok) {
        setToast({ title: 'Reply sent!', icon: 'check_circle', isLoading: false });
        setTimeout(() => setToast(null), 3000);
        setTimeout(() => setActiveStory(null), 500);
      } else {
        throw new Error('Failed to send message');
      }
    } catch (err) {
      setToast(null);
      alert('Failed to send reply');
    }
  };

  const toggleFollow = async (userId: string, isFollowing: boolean) => {
    try {
      // Optimistic UI update
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, is_following: !isFollowing } : u));
      
      const res = await fetch('/api/community/friends', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          targetUserId: userId,
          action: isFollowing ? 'unfollow' : 'follow'
        })
      });
      
      if (!res.ok) {
        throw new Error('Failed to toggle follow');
      }
    } catch (err) {
      console.error("Follow error", err);
      // Revert optimistic update
      setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, is_following: isFollowing } : u));
    }
  };

  const handleCreateStory = async (file: File) => {
    try {
      setIsUploadingStory(true);
      const base64Image = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });

      const res = await fetch('/api/community/stories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: base64Image })
      });
      
      if (res.ok) {
        fetchStories(); // Refresh stories
      } else {
        alert('Failed to post story');
      }
    } catch (err) {
      alert('Network error posting story');
    } finally {
      setIsUploadingStory(false);
    }
  };

  return (
    <div className="flex justify-center gap-gutter-lg h-full relative w-full">
      
      {/* --- Gated Access Overlay --- */}
      {!isPremiumMember && (
        <div className="absolute inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-background/60 rounded-xl">
          <div className="bg-surface-container-lowest p-8 rounded-2xl shadow-xl border border-surface-container-low max-w-md text-center flex flex-col items-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-primary-container text-on-primary-container rounded-full flex items-center justify-center mb-4">
              <span className="material-symbols-outlined text-[32px]">lock</span>
            </div>
            <h2 className="font-headline-xl text-headline-xl text-on-surface mb-2">Elite Access Required</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-6">
              The Institutional Trading Guild is an exclusive space for Premium and Elite members to share high-probability setups and network with desk instructors.
            </p>
            <button className="bg-primary text-on-primary font-label-md text-label-md py-3 px-8 rounded-lg w-full shadow-sm hover:bg-primary/90 transition-all">
              Upgrade Package
            </button>
            <button onClick={() => setIsPremiumMember(true)} className="mt-4 font-label-sm text-[12px] text-outline hover:text-on-surface transition-colors">
              (Dev Override: Unlock)
            </button>
          </div>
        </div>
      )}

      {/* --- Generic Toast (Instagram Style) --- */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 md:bottom-auto md:top-32 md:right-8 md:left-auto md:translate-x-0 z-50 bg-surface-container-lowest border border-surface-container-low rounded-xl shadow-lg p-3 flex items-center gap-4 animate-in slide-in-from-bottom-5 md:slide-in-from-right-5 fade-in duration-300 min-w-[280px]">
          {toast.img ? (
            <img src={toast.img} alt="Preview" className="w-10 h-10 object-cover rounded-md" />
          ) : (
            <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-[20px]">{toast.icon || 'info'}</span>
            </div>
          )}
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="font-headline-md text-[13px] font-bold text-on-surface">
              {toast.title}
            </span>
            {toast.subtitle && (
              <span className="font-body-sm text-[12px] text-on-surface-variant truncate">
                {toast.subtitle}
              </span>
            )}
          </div>
          {toast.isLoading ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin shrink-0"></div>
          ) : (
            toast.icon === 'check_circle' && <span className="material-symbols-outlined text-green-500 text-[20px] shrink-0">check_circle</span>
          )}
        </div>
      )}

      {/* --- Fullscreen Story Viewer Overlay --- */}
      {activeStory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-200">
          <div className="absolute top-6 right-6 flex gap-4">
            <button onClick={() => setActiveStory(null)} className="text-white hover:text-white/70 transition-colors">
              <span className="material-symbols-outlined text-[32px]">close</span>
            </button>
          </div>
          
          <div className="w-full max-w-[400px] h-[80vh] bg-surface-container-high rounded-2xl relative overflow-hidden flex flex-col">
            {/* Story Progress Bars */}
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-10">
              <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white w-full animate-[progress_5s_linear]"></div>
              </div>
            </div>
            
            {/* Story Author Info */}
            <div className="absolute top-8 left-4 flex items-center gap-3 z-10">
               <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[12px] shadow-sm">{activeStory.img}</div>
               <span className="text-white font-headline-md text-[14px] font-bold drop-shadow-md">{activeStory.name}</span>
               <span className="text-white/70 font-body-sm text-[12px] drop-shadow-md">2h</span>
            </div>
            
            {/* Floating Emojis */}
            {floatingEmojis.map(emoji => (
              <div 
                key={emoji.id} 
                className="absolute bottom-20 text-[40px] pointer-events-none z-50 animate-float-up"
                style={{ left: emoji.left }}
              >
                {emoji.emoji}
              </div>
            ))}
            
            {/* Story Content */}
            <div className="flex-1 flex items-center justify-center bg-black/90 relative">
              {activeStory.stories?.[0]?.image_url ? (
                <img src={activeStory.stories[0].image_url} className="w-full h-full object-contain" alt="Story" />
              ) : (
                <span className="text-white/50 font-headline-lg">No image</span>
              )}
              
              {/* Fake Views Count for own story */}
              {activeStory.id === currentUserId && (
                <div className="absolute bottom-24 left-4 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-2">
                  <span className="material-symbols-outlined text-white text-[16px]">visibility</span>
                  <span className="text-white font-label-md text-[13px]">{Math.floor(Math.random() * 50) + 10} Views</span>
                </div>
              )}
            </div>
            
            {/* Story Reply Bar */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-3 z-10 items-end">
              {activeStory.id !== currentUserId && (
                <input 
                  type="text" 
                  value={storyReply}
                  onChange={(e) => setStoryReply(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleStoryReply()}
                  placeholder={`Reply to ${activeStory.name}...`} 
                  className="flex-1 bg-black/40 border border-white/20 text-white rounded-full px-5 py-3 focus:outline-none focus:border-white/50 backdrop-blur-md h-[48px]" 
                />
              )}
              <div className="flex gap-2 mb-1">
                {['❤️', '🔥', '😂'].map(emoji => (
                  <button 
                    key={emoji}
                    onClick={() => handleStoryReaction(emoji)}
                    className="text-[24px] hover:scale-125 transition-transform"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Main Feed Column (Narrower, Instagram style) */}
      <div className={`w-full max-w-[550px] flex flex-col gap-6 ${!isPremiumMember ? 'opacity-30 pointer-events-none filter blur-[2px]' : ''} transition-all duration-300`}>
        
        {/* Stories / Groups Bar */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-low p-4 flex gap-4 overflow-x-auto hide-scrollbar">
          {/* Add Story Button */}
          <div className="flex flex-col items-center gap-1.5 cursor-pointer group relative">
            <input 
              type="file" 
              className="absolute inset-0 opacity-0 cursor-pointer z-10" 
              accept="image/*"
              capture="environment"
              onChange={(e) => { if (e.target.files?.[0]) handleCreateStory(e.target.files[0]) }}
            />
            <div className={`w-[60px] h-[60px] rounded-full p-[2px] bg-surface-container-high border-2 border-dashed border-outline transform transition-transform group-hover:scale-105 flex items-center justify-center`}>
              <span className="material-symbols-outlined text-outline">add</span>
            </div>
            <span className="font-label-sm text-[11px] text-on-surface truncate w-16 text-center">
              {isUploadingStory ? 'Uploading...' : 'Add Story'}
            </span>
          </div>

          {stories.map((group: any, i) => (
            <div key={i} onClick={() => setActiveStory(group)} className="flex flex-col items-center gap-1.5 cursor-pointer group">
              {/* Instagram-style gradient ring for unviewed, gray for viewed. Mocking viewed status with i === 0 for demo purposes */}
              <div className={`w-[60px] h-[60px] rounded-full p-[2.5px] ${i > 1 ? 'bg-surface-container-highest' : 'bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600'} transform transition-transform group-hover:scale-105`}>
                <div className={`w-full h-full rounded-full border-2 border-surface-container-lowest flex items-center justify-center text-[18px] font-bold text-white shadow-inner bg-surface-container-high overflow-hidden`}>
                  {group.img}
                </div>
              </div>
              <span className="font-label-sm text-[11px] text-on-surface truncate w-16 text-center">{group.name}</span>
            </div>
          ))}
        </div>

        {/* Create Post Input / Composer */}
        <div className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-low p-4 flex flex-col gap-3">
          <div className="flex gap-3 items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-[14px] shrink-0">
              ME
            </div>
            <textarea 
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              className="flex-1 bg-surface-container-low/30 rounded-full px-5 py-2.5 text-on-surface font-body-md text-[14px] border border-surface-container-high focus:outline-none focus:ring-1 focus:ring-primary focus:bg-surface-container-lowest transition-all resize-none min-h-[44px] max-h-[120px] placeholder:text-outline/70"
              placeholder="Post a trade setup or thought..."
              rows={1}
            />
          </div>
          <div className="flex items-center justify-between pt-2 pl-12">
            <div className="flex items-center gap-2">
              <input 
                type="file" 
                id="photo-upload" 
                className="hidden" 
                accept="image/*" 
                onChange={(e) => setNewPostPhoto(e.target.files?.[0] || null)} 
              />
              <label htmlFor="photo-upload" className="text-on-surface-variant hover:text-primary bg-surface-container-low hover:bg-primary/10 px-3 py-1.5 rounded-full font-label-sm text-label-sm transition-colors flex items-center gap-1.5 cursor-pointer">
                <span className="material-symbols-outlined text-[16px]">image</span> {newPostPhoto ? newPostPhoto.name : 'Add Photo'}
              </label>
              {newPostPhoto && (
                <button onClick={() => setNewPostPhoto(null)} className="text-red-500 hover:text-red-700 p-1">
                  <span className="material-symbols-outlined text-[14px]">close</span>
                </button>
              )}
            </div>
            <button 
              onClick={handleCreatePost} 
              disabled={!newPostContent.trim() && !newPostPhoto}
              className={`px-5 py-1.5 rounded-full font-label-md text-[13px] transition-colors shadow-sm ${(!newPostContent.trim() && !newPostPhoto) ? 'bg-surface-container-high text-on-surface-variant cursor-not-allowed' : 'bg-primary hover:bg-primary/90 text-on-primary'}`}
            >
              Share Post
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        {posts.map((post) => (
          <div key={post.id} className="bg-surface-container-lowest rounded-2xl shadow-sm border border-surface-container-low flex flex-col overflow-hidden group/post">
            
            {/* Post Header */}
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-headline-md text-[12px] shadow-sm ${post.role.includes('Chief') ? 'bg-gradient-to-tr from-primary to-secondary' : post.role.includes('Elite') ? 'bg-gradient-to-tr from-tertiary to-emerald-400' : 'bg-surface-tint'}`}>
                  {post.avatar}
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="font-headline-md text-[14px] text-on-surface font-bold leading-none">{post.author}</span>
                    {post.isVerified && <span className="material-symbols-outlined text-[14px] text-primary">verified</span>}
                    <span className="text-outline text-[14px] leading-none ml-1">• {post.time}</span>
                  </div>
                  {post.pinned && <span className="font-label-sm text-[10px] text-primary uppercase tracking-wider mt-0.5">Pinned</span>}
                </div>
              </div>
              <div className="relative">
                <button 
                  onClick={() => setDropdownOpenPostId(dropdownOpenPostId === post.id ? null : post.id)} 
                  className="text-on-surface-variant hover:text-on-surface p-1 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-[20px]">more_horiz</span>
                </button>
                
                {dropdownOpenPostId === post.id && (
                  <>
                    {/* Invisible overlay to close dropdown when clicking outside */}
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpenPostId(null)}></div>
                    <div className="absolute right-0 mt-2 w-48 bg-surface-container-lowest border border-surface-container-low rounded-xl shadow-lg z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                      <button onClick={() => handleSavePost(post.id)} className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low font-body-sm text-[14px] text-on-surface flex items-center gap-3 transition-colors">
                        <span className={`material-symbols-outlined text-[18px] ${savedPosts[post.id] ? 'text-primary' : 'text-outline'}`}>bookmark</span> 
                        {savedPosts[post.id] ? 'Unsave Post' : 'Save Post'}
                      </button>
                      <button onClick={() => handleSharePost(post.id)} className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low font-body-sm text-[14px] text-on-surface flex items-center gap-3 transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-outline">share</span> Share Post
                      </button>
                      {post.author_id === currentUserId && (
                        <button 
                          onClick={() => { handleDeletePost(post.id); setDropdownOpenPostId(null); }} 
                          className="w-full text-left px-4 py-2.5 hover:bg-error/10 font-body-sm text-[14px] text-error flex items-center gap-3 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[18px]">delete</span> Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Text Content */}
            {post.content && (
              <div className="px-4 pb-3 pt-1">
                <span className={`font-body-md text-on-surface leading-relaxed whitespace-pre-wrap ${!post.chartUrl ? 'text-[16px] md:text-[18px] leading-snug' : 'text-[14px]'}`}>
                  {post.content}
                </span>
              </div>
            )}

            {/* Edge-to-Edge Image */}
            {post.chartUrl && (
              <div className="w-full bg-black/5 flex items-center justify-center border-y border-surface-container-low mb-1">
                <img src={post.chartUrl} alt="Attached media" className="w-full h-auto max-h-[600px] object-cover" />
              </div>
            )}

            {/* Post Actions (Like, Comment, Share) */}
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <div className="flex items-center gap-4 text-on-surface">
                <button className="hover:text-primary transition-colors hover:scale-110 transform">
                  <span className="material-symbols-outlined text-[24px]">favorite</span>
                </button>
                <button onClick={() => toggleComments(post.id)} className="hover:text-primary transition-colors hover:scale-110 transform">
                  <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
                </button>
                <button className="hover:text-primary transition-colors hover:scale-110 transform">
                  <span className="material-symbols-outlined text-[24px]">send</span>
                </button>
              </div>
              <button className="text-on-surface hover:text-primary transition-colors hover:scale-110 transform">
                <span className="material-symbols-outlined text-[24px]">bookmark</span>
              </button>
            </div>

            {/* Likes Count */}
            <div className="px-4 pb-2">
              <span className="font-headline-md text-[13px] text-on-surface font-bold">{post.likes} likes</span>
            </div>

            {/* Comments Toggle & Section */}
            <div className="px-4 pb-4">
              {post.comments.length > 0 && activeCommentPostId !== post.id && (
                <button onClick={() => toggleComments(post.id)} className="font-body-md text-[13px] text-outline hover:text-on-surface-variant transition-colors">
                  View all {post.comments.length} comments
                </button>
              )}
              
              {activeCommentPostId === post.id && (
                <div className="mt-2 flex flex-col gap-3 animate-in fade-in duration-200">
                  {post.comments.map((comment: any, i: number) => (
                    <div key={i} className="flex gap-2">
                      <span className="font-headline-md text-[13px] text-on-surface font-bold">{comment.author}</span>
                      <span className="font-body-md text-[13px] text-on-surface">{comment.content}</span>
                    </div>
                  ))}
                  
                  {/* Quick Add Comment */}
                  <div className="flex items-center gap-3 mt-3 relative">
                    <input 
                      type="text" 
                      placeholder="Add a comment..." 
                      className="flex-1 bg-transparent text-[13px] font-body-md text-on-surface focus:outline-none placeholder:text-outline border-none p-0"
                    />
                    <button className="text-primary font-label-md text-[13px] font-bold hover:text-primary/80 transition-colors">Post</button>
                  </div>
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

    </div>
  )
}
