'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CommunityModerationPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  
  const [toast, setToast] = useState<string | null>(null);

  const fetchModerationData = async () => {
    try {
      const res = await fetch('/api/admin/community');
      if (res.ok) {
        const data = await res.json();
        setPosts(data.posts || []);
        setUsers(data.users || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModerationData();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleAction = async (action: string, targetId: string, value?: any) => {
    try {
      const res = await fetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetId, value })
      });
      if (res.ok) {
        showToast(`Action ${action} completed successfully.`);
        fetchModerationData(); // Refresh UI
      } else {
        showToast('Failed to perform action.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const saveEdit = async (postId: string) => {
    await handleAction('EDIT_POST', postId, editContent);
    setEditingPostId(null);
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen p-4 md:p-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-semibold shadow-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          {toast}
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community Moderation Hub</h1>
            <p className="text-slate-500 text-sm">Manage live community feeds, edit/delete posts, and ban users.</p>
          </div>
          <button onClick={fetchModerationData} className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
            <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Posts Feed */}
            <div className="lg:col-span-2 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-blue-600">forum</span> Live Global Feed
              </h2>
              {posts.length === 0 ? (
                <div className="p-8 text-center text-slate-500 bg-white rounded-xl border border-slate-200">No posts available.</div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col gap-3">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                          {post.users?.full_name?.[0] || 'U'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-[14px]">
                            {post.users?.full_name} 
                            {post.users?.is_shadowbanned && <span className="ml-2 px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded-full">BANNED</span>}
                          </p>
                          <p className="text-[12px] text-slate-500">@{post.users?.username} • {new Date(post.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {editingPostId === post.id ? (
                          <div className="flex gap-1">
                            <button onClick={() => saveEdit(post.id)} className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition" title="Save Edit">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                            <button onClick={() => setEditingPostId(null)} className="p-1.5 bg-slate-100 text-slate-700 rounded hover:bg-slate-200 transition" title="Cancel">
                              <span className="material-symbols-outlined text-[16px]">close</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="Edit Post">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                            <button onClick={() => { if(confirm('Are you sure you want to delete this post?')) handleAction('DELETE_POST', post.id) }} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition" title="Delete Post">
                              <span className="material-symbols-outlined text-[16px]">delete</span>
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {editingPostId === post.id ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        rows={3}
                      />
                    ) : (
                      <p className="text-sm text-slate-700 whitespace-pre-wrap">{post.content}</p>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Users Sidebar */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <span className="material-symbols-outlined text-purple-600">group</span> User Controls
              </h2>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-4 max-h-[800px] overflow-y-auto">
                {users.map(u => (
                  <div key={u.id} className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-bold text-slate-900">{u.full_name}</p>
                        <p className="text-xs text-slate-500">@{u.username}</p>
                      </div>
                      {u.is_shadowbanned && <span className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] rounded border border-red-200">Shadowbanned</span>}
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button 
                        onClick={() => handleAction('SHADOWBAN_USER', u.id, !u.is_shadowbanned)}
                        className={`py-1.5 text-xs font-bold rounded transition ${u.is_shadowbanned ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                      >
                        {u.is_shadowbanned ? 'Unban User' : 'Shadowban'}
                      </button>
                      <button 
                        onClick={() => handleAction('SET_VERIFIED', u.id, !u.is_verified)}
                        className={`py-1.5 text-xs font-bold rounded transition ${u.is_verified ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                      >
                        {u.is_verified ? 'Remove Badge' : 'Give Badge'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
