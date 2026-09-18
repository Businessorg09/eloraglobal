'use client'

import React, { useState, useEffect } from 'react';

export default function AdminLiveRoomPage() {
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('liveZoom');
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetch('/api/admin/live-room')
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          setConfig(data.config);
        } else {
          // Fallback empty config if nothing exists
          setConfig({ liveZoom: {}, oneOnOne: {}, masterclasses: [], tutors: [] });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/admin/live-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config })
      });
      const result = await res.json();
      if (!res.ok) {
        // Show the real error from the server
        setToastMessage(`❌ Error: ${result.error || 'Unknown error'}`);
        setTimeout(() => setToastMessage(''), 6000);
        setSaving(false);
        return;
      }
      setToastMessage('✅ Live Room settings saved successfully!');
      setTimeout(() => setToastMessage(''), 4000);
    } catch (err: any) {
      console.error(err);
      setToastMessage(`❌ Network error: ${err.message}`);
      setTimeout(() => setToastMessage(''), 6000);
    }
    setSaving(false);
  };

  const handleChange = (section: string, field: string, value: any) => {
    setConfig({
      ...config,
      [section]: {
        ...config[section],
        [field]: value
      }
    });
  };

  const handleArrayChange = (section: string, index: number, field: string, value: any) => {
    const newArr = [...config[section]];
    newArr[index][field] = value;
    setConfig({ ...config, [section]: newArr });
  };

  const addMasterclass = () => {
    setConfig({
      ...config,
      masterclasses: [...config.masterclasses, {
        id: Date.now().toString(),
        day: 'Monday', date: '', time: '', duration: '', title: '', host: '', seatsTotal: 100, seatsFilled: 0, joinLink: ''
      }]
    });
  };

  const addTutor = () => {
    setConfig({
      ...config,
      tutors: [...config.tutors, {
        id: Date.now().toString(),
        name: '', title: '', subtitle: '', rating: '5.0', reviews: 0, tags: [], availability: '', isOnline: true
      }]
    });
  };

  const deleteArrayItem = (section: string, index: number) => {
    const newArr = [...config[section]];
    newArr.splice(index, 1);
    setConfig({ ...config, [section]: newArr });
  };

  if (loading) return <div className="p-10">Loading Live Room Configuration...</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto font-sans">
      
      {toastMessage && (
        <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg z-50">
          {toastMessage}
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Live Room Configuration</h1>
          <p className="text-gray-500 mt-1">Manage all dynamic content on the /trading/live page.</p>
        </div>
        <button 
          onClick={handleSave} 
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold shadow-sm transition flex items-center gap-2 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Configuration'}
        </button>
      </div>

      <div className="flex gap-6">
        {/* Sidebar Nav */}
        <div className="w-64 flex-shrink-0 flex flex-col gap-2">
          {['liveZoom', 'oneOnOne', 'masterclasses', 'tutors'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`p-3 text-left rounded-lg font-medium transition ${
                activeTab === tab ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab === 'liveZoom' && 'Live Zoom Banner'}
              {tab === 'oneOnOne' && '1-on-1 Sessions'}
              {tab === 'masterclasses' && 'Weekly Masterclasses'}
              {tab === 'tutors' && 'Senior Desk Tutors'}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm min-h-[500px]">
          
          {/* Live Zoom Banner Tab */}
          {activeTab === 'liveZoom' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">Live Zoom Banner Settings</h2>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={config.liveZoom?.isActive || false} onChange={e => handleChange('liveZoom', 'isActive', e.target.checked)} className="w-5 h-5 text-blue-600" />
                <span className="font-semibold text-gray-700">Show Urgent Live Banner</span>
              </label>

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Heading</label>
                  <input type="text" value={config.liveZoom?.heading || ''} onChange={e => handleChange('liveZoom', 'heading', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Host Name</label>
                  <input type="text" value={config.liveZoom?.hostName || ''} onChange={e => handleChange('liveZoom', 'hostName', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Host Title</label>
                  <input type="text" value={config.liveZoom?.hostTitle || ''} onChange={e => handleChange('liveZoom', 'hostTitle', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time Range</label>
                  <input type="text" value={config.liveZoom?.time || ''} onChange={e => handleChange('liveZoom', 'time', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Room ID</label>
                  <input type="text" value={config.liveZoom?.roomId || ''} onChange={e => handleChange('liveZoom', 'roomId', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Join Zoom Link</label>
                  <input type="text" value={config.liveZoom?.joinLink || ''} onChange={e => handleChange('liveZoom', 'joinLink', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Registered Users (Fake Metric)</label>
                  <input type="number" value={config.liveZoom?.registeredUsers || 0} onChange={e => handleChange('liveZoom', 'registeredUsers', parseInt(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Seats Left (Fake Metric)</label>
                  <input type="number" value={config.liveZoom?.seatsLeft || 0} onChange={e => handleChange('liveZoom', 'seatsLeft', parseInt(e.target.value))} className="w-full p-2 border rounded" />
                </div>
              </div>
            </div>
          )}

          {/* 1-on-1 Sessions Tab */}
          {activeTab === 'oneOnOne' && (
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-bold text-gray-800 border-b pb-2">1-on-1 Session (User View Fake State)</h2>
              <p className="text-sm text-gray-500">Since we are using Option 1, this represents the mock upcoming session shown on the right side.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tutor Name</label>
                  <input type="text" value={config.oneOnOne?.tutorName || ''} onChange={e => handleChange('oneOnOne', 'tutorName', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tutor Role</label>
                  <input type="text" value={config.oneOnOne?.tutorRole || ''} onChange={e => handleChange('oneOnOne', 'tutorRole', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Time</label>
                  <input type="text" value={config.oneOnOne?.time || ''} onChange={e => handleChange('oneOnOne', 'time', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Zoom Link</label>
                  <input type="text" value={config.oneOnOne?.zoomLink || ''} onChange={e => handleChange('oneOnOne', 'zoomLink', e.target.value)} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Credits Available</label>
                  <input type="number" value={config.oneOnOne?.creditsAvailable || 0} onChange={e => handleChange('oneOnOne', 'creditsAvailable', parseInt(e.target.value))} className="w-full p-2 border rounded" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Credits Total</label>
                  <input type="number" value={config.oneOnOne?.creditsTotal || 3} onChange={e => handleChange('oneOnOne', 'creditsTotal', parseInt(e.target.value))} className="w-full p-2 border rounded" />
                </div>
              </div>
            </div>
          )}

          {/* Masterclasses Tab */}
          {activeTab === 'masterclasses' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Weekly Masterclasses</h2>
                <button onClick={addMasterclass} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-semibold">
                  + Add Class
                </button>
              </div>
              
              {config.masterclasses?.map((cls: any, index: number) => (
                <div key={cls.id} className="bg-gray-50 border border-gray-200 rounded p-4 relative flex flex-col gap-3">
                  <button onClick={() => deleteArrayItem('masterclasses', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold">Delete</button>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                      <input type="text" value={cls.title} onChange={e => handleArrayChange('masterclasses', index, 'title', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Day</label>
                      <select value={cls.day} onChange={e => handleArrayChange('masterclasses', index, 'day', e.target.value)} className="w-full p-1.5 text-sm border rounded">
                        <option>Monday</option><option>Tuesday</option><option>Wednesday</option><option>Thursday</option><option>Friday</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Time (e.g. 14:00 GMT)</label>
                      <input type="text" value={cls.time} onChange={e => handleArrayChange('masterclasses', index, 'time', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Duration</label>
                      <input type="text" value={cls.duration} onChange={e => handleArrayChange('masterclasses', index, 'duration', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Host</label>
                      <input type="text" value={cls.host} onChange={e => handleArrayChange('masterclasses', index, 'host', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Seats Total</label>
                      <input type="number" value={cls.seatsTotal} onChange={e => handleArrayChange('masterclasses', index, 'seatsTotal', parseInt(e.target.value))} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Seats Filled</label>
                      <input type="number" value={cls.seatsFilled} onChange={e => handleArrayChange('masterclasses', index, 'seatsFilled', parseInt(e.target.value))} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tutors Tab */}
          {activeTab === 'tutors' && (
            <div className="flex flex-col gap-5">
              <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-xl font-bold text-gray-800">Senior Desk Tutors</h2>
                <button onClick={addTutor} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-3 py-1 rounded text-sm font-semibold">
                  + Add Tutor
                </button>
              </div>
              
              {config.tutors?.map((tutor: any, index: number) => (
                <div key={tutor.id} className="bg-gray-50 border border-gray-200 rounded p-4 relative flex flex-col gap-3">
                  <button onClick={() => deleteArrayItem('tutors', index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold">Delete</button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Name</label>
                      <input type="text" value={tutor.name} onChange={e => handleArrayChange('tutors', index, 'name', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">ID (used internally)</label>
                      <input type="text" value={tutor.id} onChange={e => handleArrayChange('tutors', index, 'id', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Title</label>
                      <input type="text" value={tutor.title} onChange={e => handleArrayChange('tutors', index, 'title', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Subtitle</label>
                      <input type="text" value={tutor.subtitle} onChange={e => handleArrayChange('tutors', index, 'subtitle', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Availability String</label>
                      <input type="text" value={tutor.availability} onChange={e => handleArrayChange('tutors', index, 'availability', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Rating</label>
                        <input type="text" value={tutor.rating} onChange={e => handleArrayChange('tutors', index, 'rating', e.target.value)} className="w-full p-1.5 text-sm border rounded" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Reviews Count</label>
                        <input type="number" value={tutor.reviews} onChange={e => handleArrayChange('tutors', index, 'reviews', parseInt(e.target.value))} className="w-full p-1.5 text-sm border rounded" />
                      </div>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Tags (comma separated)</label>
                      <input type="text" value={tutor.tags?.join(', ') || ''} onChange={e => handleArrayChange('tutors', index, 'tags', e.target.value.split(',').map((s: string) => s.trim()))} className="w-full p-1.5 text-sm border rounded" />
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input type="checkbox" checked={tutor.isOnline} onChange={e => handleArrayChange('tutors', index, 'isOnline', e.target.checked)} className="w-4 h-4" />
                      <label className="text-sm font-semibold text-gray-700">Is Online Now?</label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
