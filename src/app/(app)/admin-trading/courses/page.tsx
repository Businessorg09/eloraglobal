'use client';

import React, { useState, useEffect } from 'react';

type Episode = {
  id: string;
  title: string;
  video_url: string;
  thumbnail_url: string;
  duration_seconds: number;
  order_index: number;
};

type Module = {
  id: string;
  title: string;
  description: string;
  instructor: string;
  package_tier_required: number;
  order_index: number;
  episodes: Episode[];
};

export default function AcademyAdminCMS() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  
  const [showEpisodeModal, setShowEpisodeModal] = useState(false);
  const [editingEpisode, setEditingEpisode] = useState<Episode | null>(null);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);

  // Form States
  const [modForm, setModForm] = useState({ title: '', description: '', instructor: '', package_tier_required: 1, order_index: 0 });
  const [epForm, setEpForm] = useState({ title: '', video_url: '', thumbnail_url: '', duration_seconds: 0, order_index: 0 });

  useEffect(() => {
    fetchModules();
  }, []);

  const fetchModules = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/academy/modules');
      const data = await res.json();
      if (data.modules) setModules(data.modules);
    } catch (err) {
      console.error(err);
    }
    setIsLoading(false);
  };

  // --- Module Handlers ---
  const handleOpenModuleModal = (mod?: Module) => {
    if (mod) {
      setEditingModule(mod);
      setModForm({ title: mod.title, description: mod.description, instructor: mod.instructor, package_tier_required: mod.package_tier_required, order_index: mod.order_index });
    } else {
      setEditingModule(null);
      setModForm({ title: '', description: '', instructor: '', package_tier_required: 1, order_index: modules.length });
    }
    setShowModuleModal(true);
  };

  const handleSaveModule = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingModule;
    const method = isEditing ? 'PUT' : 'POST';
    const body = isEditing ? { id: editingModule.id, ...modForm } : modForm;

    const res = await fetch('/api/admin/academy/modules', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setShowModuleModal(false);
      fetchModules();
    } else {
      const errData = await res.json();
      alert(`Error saving module: ${errData.error || 'Unknown server error'}`);
    }
  };

  const handleDeleteModule = async (id: string) => {
    if (!confirm("Are you sure? This deletes all episodes inside it too!")) return;
    const res = await fetch(`/api/admin/academy/modules?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchModules();
  };

  // --- Episode Handlers ---
  const handleOpenEpisodeModal = (moduleId: string, ep?: Episode) => {
    setSelectedModuleId(moduleId);
    if (ep) {
      setEditingEpisode(ep);
      setEpForm({ title: ep.title, video_url: ep.video_url, thumbnail_url: ep.thumbnail_url || '', duration_seconds: ep.duration_seconds, order_index: ep.order_index });
    } else {
      setEditingEpisode(null);
      const mod = modules.find(m => m.id === moduleId);
      setEpForm({ title: '', video_url: '', thumbnail_url: '', duration_seconds: 0, order_index: mod?.episodes.length || 0 });
    }
    setShowEpisodeModal(true);
  };

  const handleSaveEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    const isEditing = !!editingEpisode;
    const method = isEditing ? 'PUT' : 'POST';
    const body = isEditing 
      ? { id: editingEpisode.id, ...epForm } 
      : { module_id: selectedModuleId, ...epForm };

    const res = await fetch('/api/admin/academy/episodes', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setShowEpisodeModal(false);
      fetchModules();
    } else {
      alert("Error saving episode");
    }
  };

  const handleDeleteEpisode = async (id: string) => {
    if (!confirm("Are you sure you want to delete this episode?")) return;
    const res = await fetch(`/api/admin/academy/episodes?id=${id}`, { method: 'DELETE' });
    if (res.ok) fetchModules();
  };

  return (
    <div className="flex flex-col w-full gap-6 pb-10 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-[28px] font-extrabold text-slate-900 tracking-tight">Academy CMS</h1>
          <p className="text-[13px] text-slate-500">Manage modules, curriculum order, and embed video episodes.</p>
        </div>
        <button 
          onClick={() => handleOpenModuleModal()}
          className="px-5 py-2.5 bg-[#1D4ED8] hover:bg-[#1E40AF] text-white text-[13px] font-bold rounded-lg shadow-md flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">add_circle</span>
          Create New Module
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500">Loading Academy Data...</div>
      ) : modules.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-slate-300 mb-2">video_library</span>
          <h3 className="text-lg font-bold text-slate-900">No Modules Yet</h3>
          <p className="text-slate-500 text-sm mt-1 mb-4">Start building your academy curriculum by creating your first module.</p>
          <button onClick={() => handleOpenModuleModal()} className="px-4 py-2 bg-[#EFF6FF] text-[#1D4ED8] font-bold text-sm rounded-lg">Create Module</button>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {modules.map(mod => (
            <div key={mod.id} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
              <div className="bg-[#F8FAFC] border-b border-slate-200 p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[10px] font-bold rounded uppercase">Tier {mod.package_tier_required} Required</span>
                    <span className="text-slate-400 text-xs font-medium">Order: {mod.order_index}</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-slate-900">{mod.title}</h2>
                  <p className="text-xs text-slate-500 mt-1">{mod.description || 'No description'}</p>
                  <p className="text-xs text-slate-600 mt-1 font-medium">Instructor: {mod.instructor || 'Unassigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => handleOpenEpisodeModal(mod.id)} className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">add</span> Add Episode
                  </button>
                  <button onClick={() => handleOpenModuleModal(mod)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => handleDeleteModule(mod.id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
              
              <div className="p-0">
                {mod.episodes?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">No episodes in this module yet.</div>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 text-[11px] uppercase border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Order</th>
                        <th className="px-4 py-3 font-semibold">Episode Title</th>
                        <th className="px-4 py-3 font-semibold">Duration (s)</th>
                        <th className="px-4 py-3 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {mod.episodes?.map(ep => (
                        <tr key={ep.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 text-slate-500 font-medium">{ep.order_index}</td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-slate-900">{ep.title}</div>
                            <div className="text-[10px] text-slate-400 truncate max-w-xs">{ep.video_url}</div>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{ep.duration_seconds}s</td>
                          <td className="px-4 py-3 text-right">
                            <button onClick={() => handleOpenEpisodeModal(mod.id, ep)} className="text-blue-600 hover:underline text-xs font-bold mr-3">Edit</button>
                            <button onClick={() => handleDeleteEpisode(ep.id)} className="text-red-500 hover:underline text-xs font-bold">Delete</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Module Modal */}
      {showModuleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingModule ? 'Edit Module' : 'Create Module'}</h3>
              <button onClick={() => setShowModuleModal(false)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSaveModule} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Module Title</label>
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={modForm.title} onChange={e => setModForm({...modForm, title: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Description</label>
                <textarea className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={modForm.description} onChange={e => setModForm({...modForm, description: e.target.value})} />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Instructor Name</label>
                <input type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={modForm.instructor} onChange={e => setModForm({...modForm, instructor: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Package Required</label>
                  <select className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={modForm.package_tier_required} onChange={e => setModForm({...modForm, package_tier_required: parseInt(e.target.value)})}>
                    <option value={1}>Tier 1 (Starter)</option>
                    <option value={2}>Tier 2 (Pro)</option>
                    <option value={3}>Tier 3 (Elite)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Order Index</label>
                  <input type="number" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={modForm.order_index} onChange={e => setModForm({...modForm, order_index: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="mt-2 w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg">Save Module</button>
            </form>
          </div>
        </div>
      )}

      {/* Episode Modal */}
      {showEpisodeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-lg">{editingEpisode ? 'Edit Episode' : 'Create Episode'}</h3>
              <button onClick={() => setShowEpisodeModal(false)} className="text-slate-400"><span className="material-symbols-outlined">close</span></button>
            </div>
            <form onSubmit={handleSaveEpisode} className="p-6 flex flex-col gap-4">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Episode Title</label>
                <input required type="text" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={epForm.title} onChange={e => setEpForm({...epForm, title: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Video URL (YouTube embed or watch link)</label>
                <input required type="text" placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={epForm.video_url} onChange={e => setEpForm({...epForm, video_url: e.target.value})} />
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-slate-700 mb-1">Thumbnail URL (Optional)</label>
                <input type="text" placeholder="https://example.com/thumbnail.png" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={epForm.thumbnail_url} onChange={e => setEpForm({...epForm, thumbnail_url: e.target.value})} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Make sure to use the EMBED link, not the normal watch link.</p>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Duration (Seconds)</label>
                  <input type="number" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={epForm.duration_seconds} onChange={e => setEpForm({...epForm, duration_seconds: parseInt(e.target.value)})} />
                </div>
                <div className="flex-1">
                  <label className="text-xs font-bold text-slate-700 block mb-1">Order Index</label>
                  <input type="number" className="w-full p-2 border border-slate-200 rounded-lg text-sm" value={epForm.order_index} onChange={e => setEpForm({...epForm, order_index: parseInt(e.target.value)})} />
                </div>
              </div>
              <button type="submit" className="mt-2 w-full py-2.5 bg-blue-600 text-white font-bold rounded-lg">Save Episode</button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
