'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CommunityModerationPage() {
  
  const seedGhosts = async () => {
    if (!confirm('This will create 35 ghost users in the database. Proceed?')) return;
    setIsGhostLoading(true);
    try {
      const res = await fetch('/api/admin/ghost-engine', { method: 'POST', body: JSON.stringify({ action: 'SEED_GHOSTS' }) });
      const data = await res.json();
      if (res.ok) setGhostStatus(data.message);
      else alert(data.error);
    } catch (e) { alert('Error'); }
    setIsGhostLoading(false);
  };

  const [commentPostId, setCommentPostId] = useState('');
  const [commentContent, setCommentContent] = useState('');

  const injectThread = async (type: 'RANDOM' | 'NORMAL' | 'IMAGE') => {
    setIsGhostLoading(true);
    setGhostStatus(null);
    try {
      const res = await fetch('/api/admin/ghost-engine', { method: 'POST', body: JSON.stringify({ action: 'INJECT_THREAD', type }) });
      const data = await res.json();
      if (res.ok) {
        setGhostStatus(`Success! Injected scenario: ${data.scenario}`);
        fetchModerationData();
      }
      else alert(data.error || 'Failed to inject thread');
    } catch (e) { alert('Error injecting thread'); }
    setIsGhostLoading(false);
  };

  const injectComment = async () => {
    if (!commentPostId) return alert('Enter a Post ID');
    setIsGhostLoading(true);
    try {
      const res = await fetch('/api/admin/ghost-engine', { method: 'POST', body: JSON.stringify({ action: 'INJECT_COMMENT', postId: commentPostId, content: commentContent }) });
      const data = await res.json();
      if (res.ok) {
        setGhostStatus('Comment injected successfully!');
        setCommentPostId('');
        setCommentContent('');
        fetchModerationData();
      } else alert(data.error);
    } catch(e) { alert('Error injecting comment'); }
    setIsGhostLoading(false);
  };

  const [activeTab, setActiveTab] = useState<'FEED' | 'CHATS' | 'USERS' | 'SHIELD' | 'GHOST'>('FEED');
  const [isGhostLoading, setIsGhostLoading] = useState(false);
  const [ghostStatus, setGhostStatus] = useState<string | null>(null);
  const [data, setData] = useState<{
    posts: any[];
    chats: any[];
    users: any[];
    settings: any;
    blacklist: any[];
  }>({ posts: [], chats: [], users: [], settings: {}, blacklist: [] });
  
  const [loading, setLoading] = useState(true);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  const fetchModerationData = async () => {
    try {
      const res = await fetch('/api/admin/community');
      if (res.ok) {
        const json = await res.json();
        setData({
          posts: json.posts || [],
          chats: json.chats || [],
          users: json.users || [],
          settings: json.settings || {},
          blacklist: json.blacklist || [],
        });
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

  const handleAction = async (action: string, targetId: string, value?: any, metadata?: any) => {
    try {
      const res = await fetch('/api/admin/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, targetId, value, metadata })
      });
      if (res.ok) {
        showToast(`Action completed successfully.`);
        fetchModerationData();
      } else {
        showToast('Failed to perform action.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen p-4 md:p-8">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-slate-900 text-white text-[13px] font-semibold shadow-xl flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-emerald-400">check_circle</span>
          {toast}
        </div>
      )}

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Community God-Mode</h1>
            <p className="text-slate-500 text-sm">Surveillance, auto-mod shields, and platform-wide lockdown controls.</p>
          </div>
          <div className="flex gap-2">
            <button onClick={fetchModerationData} className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
              <span className="material-symbols-outlined text-[18px]">refresh</span> Refresh
            </button>
            {data.settings?.global_chat_locked ? (
              <button onClick={() => handleAction('UPDATE_SETTINGS', '1', { global_chat_locked: false })} className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors">
                <span className="material-symbols-outlined text-[18px]">lock_open</span> Unlock Platform
              </button>
            ) : (
              <button onClick={() => { if(confirm('FREEZE ENTIRE PLATFORM CHAT?')) handleAction('UPDATE_SETTINGS', '1', { global_chat_locked: true }) }} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors shadow-sm">
                <span className="material-symbols-outlined text-[18px]">lock</span> Master Lockdown
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex overflow-x-auto gap-2 border-b border-slate-200 pb-2">
          {[
            { id: 'FEED', label: 'Global Feed', icon: 'public' },
            { id: 'CHATS', label: 'Chat Surveillance', icon: 'chat' },
            { id: 'USERS', label: 'User Database', icon: 'shield_person' },
            { id: 'SHIELD', label: 'Auto-Mod Shield', icon: 'security' },
            { id: 'GHOST', label: 'Ghost Engine', icon: 'smart_toy' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-t-lg font-bold text-sm flex items-center gap-2 transition-colors border-b-2 ${
                activeTab === tab.id ? 'border-blue-600 text-blue-700 bg-blue-50/50' : 'border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-100'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span> {tab.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 md:p-6 min-h-[500px]">
            
            {/* TAB: FEED */}
            {activeTab === 'FEED' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Global Feed Moderation</h2>
                <div className="grid gap-4">
                  {data.posts.map((post) => (
                    <div key={post.id} className={`border rounded-xl p-4 shadow-sm flex flex-col gap-3 ${post.is_pinned ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                            {post.author?.full_name?.[0] || 'U'}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-[14px]">
                              {post.author?.full_name} {post.is_mock && <span className="ml-1 text-[10px] bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">[🤖 MOCK]</span>}
                              {post.is_pinned && <span className="ml-2 px-2 py-0.5 bg-amber-200 text-amber-800 text-[10px] font-bold rounded-full uppercase">Pinned</span>}
                            </p>
                            <p className="text-[12px] text-slate-500">@{post.author?.username} • {new Date(post.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAction('PIN_POST', post.id, !post.is_pinned)} className="p-1.5 bg-amber-100 text-amber-700 rounded hover:bg-amber-200 transition" title="Toggle Pin">
                            <span className="material-symbols-outlined text-[16px]">keep</span>
                          </button>
                          {editingPostId === post.id ? (
                            <button onClick={() => { handleAction('EDIT_POST', post.id, editContent); setEditingPostId(null); }} className="p-1.5 bg-emerald-100 text-emerald-700 rounded hover:bg-emerald-200 transition" title="Save Edit">
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          ) : (
                            <button onClick={() => { setEditingPostId(post.id); setEditContent(post.content); }} className="p-1.5 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition" title="Edit Post">
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          )}
                          <button onClick={() => { if(confirm('Delete post?')) handleAction('DELETE_POST', post.id) }} className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition" title="Delete Post">
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
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
                  ))}
                </div>
              </div>
            )}

            {/* TAB: CHATS */}
            {activeTab === 'CHATS' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">Private Chat Surveillance</h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Sender</th>
                        <th className="px-4 py-3">Room ID</th>
                        <th className="px-4 py-3">Message Content</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {data.chats.map((chat) => (
                        <tr key={chat.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 whitespace-nowrap">{new Date(chat.created_at).toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-slate-800">{chat.sender?.full_name}</td>
                          <td className="px-4 py-3 font-mono text-xs">{chat.room_id?.substring(0,8)}...</td>
                          <td className="px-4 py-3 text-slate-700">{chat.content}</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => { if(confirm('Delete message?')) handleAction('DELETE_CHAT', chat.id) }} className="text-red-500 hover:text-red-700 font-bold text-xs uppercase">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* TAB: USERS */}
            {activeTab === 'USERS' && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-800">User Database & Control</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {data.users.map(u => (
                    <div key={u.id} className={`flex flex-col gap-3 p-4 border rounded-xl shadow-sm ${u.account_status === 'FROZEN' ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-bold text-slate-900">{u.full_name}</p>
                          <p className="text-xs text-slate-500">@{u.username}</p>
                        </div>
                        <div className="flex flex-col gap-1 items-end">
                          {u.is_shadowbanned && <span className="px-2 py-0.5 bg-slate-800 text-white text-[9px] font-bold uppercase rounded">Shadowbanned</span>}
                          {u.account_status === 'FROZEN' && <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold uppercase rounded">Frozen</span>}
                          {u.muted_until && new Date(u.muted_until) > new Date() && <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[9px] font-bold uppercase rounded border border-orange-200">Muted</span>}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 mt-2 border-t border-slate-100 pt-3">
                        <button onClick={() => handleAction('SHADOWBAN_USER', u.id, !u.is_shadowbanned)} className="py-1.5 text-[11px] font-bold rounded bg-slate-100 text-slate-700 hover:bg-slate-200">
                          {u.is_shadowbanned ? 'Un-Shadowban' : 'Shadowban'}
                        </button>
                        <button onClick={() => handleAction('FREEZE_USER', u.id, u.account_status !== 'FROZEN')} className={`py-1.5 text-[11px] font-bold rounded ${u.account_status === 'FROZEN' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}>
                          {u.account_status === 'FROZEN' ? 'Unfreeze Acct' : 'Freeze Acct'}
                        </button>
                        <button onClick={() => handleAction('MUTE_USER', u.id, u.muted_until && new Date(u.muted_until) > new Date() ? 0 : 24)} className="py-1.5 text-[11px] font-bold rounded bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100">
                          {u.muted_until && new Date(u.muted_until) > new Date() ? 'Unmute' : 'Mute 24h'}
                        </button>
                        <button onClick={() => handleAction('SET_VERIFIED', u.id, !u.is_verified)} className="py-1.5 text-[11px] font-bold rounded bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100">
                          {u.is_verified ? 'Revoke Badge' : 'Give Badge'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SHIELD */}
            
            {activeTab === 'GHOST' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">Ghost Engine Dashboard</h2>
                    <p className="text-sm text-slate-500">Inject automated mock conversations to simulate community activity.</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <button onClick={seedGhosts} disabled={isGhostLoading} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium disabled:opacity-50 border border-slate-300">
                      Seed 35 Ghost Users
                    </button>
                  </div>
                </div>
                
                {ghostStatus && (
                  <div className="p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 text-sm">
                    {ghostStatus}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ph-users text-purple-600"></i>
                      <h3 className="font-semibold text-slate-800">Demographics</h3>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• 27 Global Traders (US, UK, Dubai)</li>
                      <li>• 8 Indian Traders (Nifty, IST Focus)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ph-brain text-indigo-600"></i>
                      <h3 className="font-semibold text-slate-800">Psychology Matrix</h3>
                    </div>
                    <ul className="text-sm text-slate-600 space-y-1">
                      <li>• 30% Raw Emotions (Losses, Frustration)</li>
                      <li>• 25% High-value setups (XAUUSD, EURUSD)</li>
                      <li>• 25% Lifestyle (Travel, Setups)</li>
                      <li>• 20% Indian Nuance (BankNifty, Payouts)</li>
                    </ul>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center gap-2 mb-2">
                      <i className="ph-chat-circle-text text-pink-600"></i>
                      <h3 className="font-semibold text-slate-800">Thread System</h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Instead of single posts, the engine selects a main author and 2-3 commenters, spacing them out to simulate real-time conversations.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  {/* Thread Injection Controls */}
                  <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold text-slate-800">Inject New Threads</h3>
                    <p className="text-sm text-slate-500">Inject a full conversation thread (post + comments) directly into the feed. It will be scheduled with a 2-4 min delay queue.</p>
                    <div className="flex flex-col gap-2">
                      <button onClick={() => injectThread('RANDOM')} disabled={isGhostLoading} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:opacity-90 transition-opacity text-sm font-medium disabled:opacity-50 shadow-sm text-left">
                        ✨ Inject Random Thread (Mixed)
                      </button>
                      <button onClick={() => injectThread('NORMAL')} disabled={isGhostLoading} className="px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-opacity text-sm font-medium disabled:opacity-50 shadow-sm text-left">
                        📝 Inject Text-Only Thread
                      </button>
                      <button onClick={() => injectThread('IMAGE')} disabled={isGhostLoading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-opacity text-sm font-medium disabled:opacity-50 shadow-sm text-left">
                        🖼️ Inject Thread w/ Chart & Photo
                      </button>
                    </div>
                  </div>

                  {/* Comment Injection Controls */}
                  <div className="p-5 border border-slate-200 rounded-xl bg-white shadow-sm flex flex-col gap-4">
                    <h3 className="font-bold text-slate-800">Inject Target Comment</h3>
                    <p className="text-sm text-slate-500">Force a random Ghost User to comment on a specific post ID (great for boosting real users' posts).</p>
                    <div className="flex flex-col gap-3">
                      <input 
                        type="text" 
                        placeholder="Paste Post ID (UUID) here..." 
                        value={commentPostId}
                        onChange={e => setCommentPostId(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
                      />
                      <input 
                        type="text" 
                        placeholder="Custom Comment Content (Optional)" 
                        value={commentContent}
                        onChange={e => setCommentContent(e.target.value)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-slate-900"
                      />
                      <button onClick={injectComment} disabled={isGhostLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-opacity text-sm font-medium disabled:opacity-50 shadow-sm text-left">
                        💬 Inject Comment Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'SHIELD' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Auto-Mod Keyword Shield</h2>
                  <p className="text-sm text-slate-500 mb-4">Any message containing these keywords will be instantly deleted across the entire platform.</p>
                  
                  <div className="flex gap-2 max-w-md mb-6">
                    <input type="text" value={newKeyword} onChange={e => setNewKeyword(e.target.value)} placeholder="Enter word or link (e.g. t.me)" className="flex-1 px-3 py-2 border border-slate-300 rounded-lg text-sm outline-none focus:border-blue-500" />
                    <button onClick={() => { handleAction('ADD_BLACKLIST', '', newKeyword); setNewKeyword(''); }} className="px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800">Add Rule</button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {data.blacklist.map(rule => (
                      <div key={rule.id} className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700">
                        {rule.word}
                        <button onClick={() => handleAction('REMOVE_BLACKLIST', rule.id)} className="text-slate-400 hover:text-red-500"><span className="material-symbols-outlined text-[16px]">close</span></button>
                      </div>
                    ))}
                    {data.blacklist.length === 0 && <p className="text-sm text-slate-400 italic">No blacklist rules active.</p>}
                  </div>
                </div>

                <hr className="border-slate-200" />

                <div>
                  <h2 className="text-lg font-bold text-slate-800 mb-4">Platform Configuration</h2>
                  <div className="grid gap-4 max-w-lg">
                    <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                      <div>
                        <p className="font-bold text-slate-800">Media Uploads</p>
                        <p className="text-xs text-slate-500">Allow users to attach images.</p>
                      </div>
                      <button onClick={() => handleAction('UPDATE_SETTINGS', '1', { media_uploads_allowed: !data.settings?.media_uploads_allowed })} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.settings?.media_uploads_allowed ? 'bg-emerald-500' : 'bg-slate-300'}`}>
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${data.settings?.media_uploads_allowed ? 'translate-x-6' : 'translate-x-1'}`} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </div>
    </div>
  );
}
