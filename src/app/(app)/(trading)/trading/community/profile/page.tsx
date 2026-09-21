'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

export default function CommunityProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activePost, setActivePost] = useState<any>(null);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/community/profile', { cache: 'no-store' });
      const data = await res.json();
      
      if (data.profile) {
        setProfileData(data.profile);
      }
      if (data.posts) {
        setUserPosts(data.posts);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSaveProfile = async () => {
    // Basic implementation for saving name/username
    if (!profileData) return;
    try {
      const res = await fetch('/api/community/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: profileData.full_name,
          username: profileData.username,
          bio: profileData.bio
        })
      });
      if (res.ok) {
        setIsEditing(false);
        fetchProfile();
      } else {
        alert("Failed to save profile");
      }
    } catch (err) {
      alert("Error saving profile");
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    try {
      const res = await fetch(`/api/community/posts?id=${postId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setUserPosts(prev => prev.filter(p => p.id !== postId));
        setActivePost(null);
      } else {
        alert('Failed to delete post');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const displayName = profileData?.username || profileData?.full_name || 'Loading...';
  const displayTitle = profileData?.custom_title || 'Member';
  
  return (
    <div className="flex flex-col max-w-[900px] mx-auto w-full pb-20 pt-8 animate-in fade-in duration-300">
      
      {/* Top Navigation Back */}
      <div className="flex items-center gap-4 mb-10">
        <Link href="/trading/community" className="text-on-surface hover:bg-surface-container-low p-2 rounded-full transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </Link>
        <span className="font-headline-lg text-[20px] font-bold text-on-surface">{displayName}</span>
      </div>

      {/* Profile Header (Instagram Style) */}
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-8 md:gap-16 px-4 md:px-8 mb-10">
        
        {/* Avatar */}
        <div className="relative">
          <div className="w-[120px] h-[120px] md:w-[150px] md:h-[150px] rounded-full bg-gradient-to-tr from-primary to-secondary p-1">
            <div className="w-full h-full rounded-full border-4 border-surface-container-lowest bg-surface-container-high flex items-center justify-center text-on-surface-variant font-bold text-[32px] shadow-inner overflow-hidden">
              <span className="text-on-surface-variant font-headline-xl">{displayName.substring(0,2).toUpperCase()}</span>
            </div>
          </div>
          <button className="absolute bottom-2 right-2 w-8 h-8 rounded-full bg-primary border-2 border-surface-container-lowest text-white flex items-center justify-center shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[16px]">add</span>
          </button>
        </div>

        {/* Stats & Actions */}
        <div className="flex flex-col flex-1 gap-4 md:p-5 w-full">
          
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-4 md:gap-8">
            <h1 className="font-headline-xl text-[24px] text-on-surface flex items-center gap-2">
              {displayName}
              {profileData?.is_verified && <span className="material-symbols-outlined text-primary text-[20px]">verified</span>}
            </h1>
            <div className="flex items-center gap-3">
              <button 
                onClick={isEditing ? handleSaveProfile : () => setIsEditing(true)}
                className="bg-surface-container-low hover:bg-surface-container-high text-on-surface font-label-md font-bold px-6 py-1.5 rounded-lg transition-colors border border-surface-container border-transparent"
              >
                {isEditing ? 'Save Profile' : 'Edit profile'}
              </button>
              <Link href="/trading/settings" className="bg-surface-container-low hover:bg-surface-container-high text-on-surface p-1.5 rounded-lg transition-colors inline-block">
                <span className="material-symbols-outlined text-[20px] block">settings</span>
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="flex gap-1.5 font-body-md text-[16px]">
              <span className="font-bold text-on-surface">{userPosts.length}</span>
              <span className="text-on-surface-variant">posts</span>
            </div>
            <div className="flex gap-1.5 font-body-md text-[16px]">
              <span className="font-bold text-on-surface">0</span>
              <span className="text-on-surface-variant">followers</span>
            </div>
            <div className="flex gap-1.5 font-body-md text-[16px]">
              <span className="font-bold text-on-surface">0</span>
              <span className="text-on-surface-variant">following</span>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="font-headline-md text-[14px] text-on-surface font-bold">{profileData?.full_name || 'Loading...'}</span>
            <span className="font-body-md text-[14px] text-on-surface-variant">{displayTitle}</span>
            <span className="font-body-md text-[14px] text-on-surface-variant whitespace-pre-wrap">{profileData?.bio || 'Welcome to my profile 📈'}</span>
          </div>

        </div>
      </div>

      {/* Edit Profile Mockup (Conditionally rendered) */}
      {isEditing && (
        <div className="px-4 md:px-8 mb-10 pb-8 border-b border-surface-container-low animate-in slide-in-from-top-4 duration-300">
          <h2 className="font-headline-md font-bold mb-4">Edit Profile</h2>
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-[12px] text-outline">Full Name</label>
              <input 
                type="text" 
                value={profileData?.full_name || ''} 
                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                className="bg-surface-container-lowest border border-surface-container-high rounded-lg px-3 py-2 text-[14px]" 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-[12px] text-outline">Username</label>
              <input 
                type="text" 
                value={profileData?.username || ''} 
                onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                className="bg-surface-container-lowest border border-surface-container-high rounded-lg px-3 py-2 text-[14px]" 
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="font-label-sm text-[12px] text-outline">Bio</label>
              <textarea 
                value={profileData?.bio || ''} 
                onChange={(e) => setProfileData({...profileData, bio: e.target.value})}
                className="bg-surface-container-lowest border border-surface-container-high rounded-lg px-3 py-2 text-[14px] resize-none h-20" 
              />
            </div>
          </div>
        </div>
      )}

      {/* Highlights / Story Archive */}
      <div className="flex gap-4 md:gap-6 px-4 md:px-8 mb-12 overflow-x-auto hide-scrollbar pb-2">
        {[
          { name: 'Wins', img: '💰' },
          { name: 'Setups', img: '📉' },
          { name: 'Mindset', img: '🧠' },
          { name: 'Travel', img: '✈️' },
        ].map((highlight, i) => (
          <div key={i} className="flex flex-col items-center gap-2 cursor-pointer group">
            <div className="w-[75px] h-[75px] rounded-full p-[2px] border border-surface-container-high bg-surface-container-lowest group-hover:border-outline transition-colors">
              <div className="w-full h-full rounded-full bg-surface-container-low flex items-center justify-center text-[28px]">
                {highlight.img}
              </div>
            </div>
            <span className="font-headline-md text-[12px] font-bold text-on-surface">{highlight.name}</span>
          </div>
        ))}
      </div>

      {/* Grid Tabs */}
      <div className="flex items-center justify-center border-t border-surface-container-low">
        <div className="flex items-center gap-16">
          <button className="flex items-center gap-2 py-4 border-t border-on-surface text-on-surface font-headline-md font-bold text-[12px] uppercase tracking-widest transition-colors">
            <span className="material-symbols-outlined text-[16px]">grid_on</span>
            Posts
          </button>
          <button className="flex items-center gap-2 py-4 border-t border-transparent text-outline hover:text-on-surface-variant font-headline-md font-bold text-[12px] uppercase tracking-widest transition-colors">
            <span className="material-symbols-outlined text-[16px]">bookmark</span>
            Saved
          </button>
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-2">
        {userPosts.length === 0 && !isLoading && (
          <div className="col-span-3 py-20 flex flex-col items-center justify-center text-on-surface-variant">
            <span className="material-symbols-outlined text-[48px] mb-2 opacity-50">photo_camera</span>
            <span className="font-headline-md">No Posts Yet</span>
          </div>
        )}
        {userPosts.map((post) => (
          <div key={post.id} onClick={() => setActivePost(post)} className="aspect-square bg-surface-container-high relative group cursor-pointer overflow-hidden flex items-center justify-center">
            {post.image_url ? (
              <img 
                src={post.image_url} 
                alt="Grid post" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-on-surface p-4 text-center w-full h-full bg-surface-container group-hover:bg-surface-container-high transition-colors">
                 <span className="font-body-sm text-[11px] md:text-[13px] line-clamp-4 w-full break-words opacity-80">{post.content}</span>
              </div>
            )}
            
            {/* Hover overlay with likes/comments */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 md:gap-6">
              <div className="flex items-center gap-1.5 text-white font-bold">
                <span className="material-symbols-outlined filled text-[20px]">favorite</span>
                {post.likes_count || 0}
              </div>
              <div className="flex items-center gap-1.5 text-white font-bold">
                <span className="material-symbols-outlined filled text-[20px]">chat_bubble</span>
                {post.comments_count || 0}
              </div>
            </div>
          </div>
        ))}
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
            {/* Image Side (or text if no image) */}
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
            
            {/* Content Side */}
            <div className="w-full md:w-[350px] flex flex-col border-l border-surface-container-low bg-surface-container-lowest">
              <div className="p-4 border-b border-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-[12px]">{displayName.substring(0,2).toUpperCase()}</div>
                  <span className="font-headline-md text-[14px] font-bold text-on-surface">{displayName}</span>
                </div>
                <button onClick={() => handleDeletePost(activePost.id)} className="text-error hover:text-error/80 transition-colors" title="Delete Post">
                  <span className="material-symbols-outlined text-[20px]">delete</span>
                </button>
              </div>
              <div className="p-4 flex-1 overflow-y-auto">
                <div className="flex flex-col border-b border-surface-container-low pb-4 mb-4">
                  <span className="font-body-sm text-[14px] text-on-surface whitespace-pre-wrap leading-relaxed">{activePost.content}</span>
                </div>
                
                {/* Comments List */}
                <div className="flex flex-col gap-4">
                  {activePost.comments?.map((comment: any) => (
                    <div key={comment.id} className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary shrink-0 flex items-center justify-center text-white font-bold text-[12px]">
                        {(comment.author?.username || comment.author?.full_name || 'U').substring(0,2).toUpperCase()}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-headline-md text-[13px] font-bold text-on-surface inline-block mr-2">
                          {comment.author?.username || comment.author?.full_name}
                        </span>
                        <span className="font-body-sm text-[13px] text-on-surface whitespace-pre-wrap mt-0.5">{comment.content}</span>
                      </div>
                    </div>
                  ))}
                  {(!activePost.comments || activePost.comments.length === 0) && (
                    <span className="text-outline text-[13px]">No comments yet.</span>
                  )}
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
