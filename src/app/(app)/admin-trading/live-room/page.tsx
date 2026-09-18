'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// ─── Types ───────────────────────────────────────────────────────────────────

type MentorshipTab = 'all' | 'pending' | 'approved' | 'completed';

interface ScheduledClass {
  id: string;
  date: string;
  time: string;
  title: string;
  module: string;
  faculty: string;
  facultyStatus: string;
  zoomLink: string;
  tier: string;
  enrolled: string;
}

interface MentorshipApp {
  id: string;
  initials: string;
  color: string;
  name: string;
  traderId: string;
  tier: string;
  tierColor: string;
  eligibility: string;
  date: string;
  duration: string;
  problem: string;
  mentor: string;
  mentorRole: string;
  zoomStatus: 'assigned' | 'pending' | 'waiting';
  zoomLink?: string;
  action: 'approve' | 'assign' | 'decline';
}

// ─── Static Data ─────────────────────────────────────────────────────────────

const scheduledClasses: ScheduledClass[] = [
  {
    id: '1',
    date: 'Mar 20, 2025',
    time: '14:00 GMT',
    title: 'NY Open Scalping & Execution Floor',
    module: 'Module 02 • Order Flow Imbalance',
    faculty: 'Marcus Vance, CMT',
    facultyStatus: 'Confirmed',
    zoomLink: 'zoom.us/j/8943302...',
    tier: 'PRO & VIP',
    enrolled: '420 Registered',
  },
  {
    id: '2',
    date: 'Mar 21, 2025',
    time: '15:00 GMT',
    title: 'Weekly Global Macro & FOMC Rate Playbook',
    module: 'Module 04 • Quantitative Desk Analysis',
    faculty: 'Quantitative Desk',
    facultyStatus: 'Confirmed',
    zoomLink: 'zoom.us/j/9024819...',
    tier: 'ALL TIERS',
    enrolled: '1,000 Capacity',
  },
  {
    id: '3',
    date: 'Mar 23, 2025',
    time: '21:00 GMT',
    title: 'Sunday Market Open Gap & Bias Preparation',
    module: 'Module 01 • Institutional Repricing',
    faculty: 'Dr. Aris Thorne',
    facultyStatus: 'Roster Open',
    zoomLink: 'zoom.us/j/7718903...',
    tier: 'TIERS 1, 2, 3',
    enrolled: '285 Enrolled',
  },
];

const mentorshipApps: MentorshipApp[] = [
  {
    id: '1',
    initials: 'AV',
    color: 'bg-[#1D4ED8] text-white',
    name: 'Alex Vance',
    traderId: '#TRD-8849',
    tier: 'Executive VIP Desk',
    tierColor: 'bg-[#1D4ED8] text-white',
    eligibility: 'Eligible: 2 monthly 1-on-1s',
    date: 'Tomorrow • 16:30 GMT',
    duration: '45 Min Session',
    problem: '"Drawdown audit & risk sizing on XAU/USD 5-min order blocks. Invalidation slippage issue."',
    mentor: 'Julian Thorne',
    mentorRole: 'Chief Risk Officer',
    zoomStatus: 'assigned',
    zoomLink: 'zoom.us/j/9024819',
    action: 'approve',
  },
  {
    id: '2',
    initials: 'SC',
    color: 'bg-blue-100 text-blue-700',
    name: 'Sophia Chen',
    traderId: '#LDN-4112',
    tier: 'Pro Scalper Program',
    tierColor: 'bg-blue-100 text-blue-700 border border-blue-200',
    eligibility: 'Add-on 1-on-1 Pass',
    date: 'Friday • 11:00 GMT',
    duration: '30 Min Review',
    problem: '"Futures delta tape analysis and setting invalidation on S&P 500 mini contracts."',
    mentor: 'Marcus Vance, CMT',
    mentorRole: 'Lead Macro Broadcaster',
    zoomStatus: 'pending',
    action: 'assign',
  },
  {
    id: '3',
    initials: 'DR',
    color: 'bg-slate-200 text-slate-700',
    name: 'David Ross',
    traderId: '#DXB-1092',
    tier: 'Executive VIP Desk',
    tierColor: 'bg-[#1D4ED8] text-white',
    eligibility: 'Eligible: 2 monthly 1-on-1s',
    date: 'Monday • 09:30 GMT',
    duration: '45 Min Session',
    problem: '"Full portfolio capital sizing, proprietary account risk evaluation & drawdown limits."',
    mentor: 'Unassigned',
    mentorRole: 'Select Faculty',
    zoomStatus: 'waiting',
    action: 'decline',
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function LiveRoomPage() {
  const [mentorTab, setMentorTab] = useState<MentorshipTab>('pending');
  const [broadcastLive, setBroadcastLive] = useState(true);
  const [zoomUrl, setZoomUrl] = useState('https://zoom.us/j/89433029118?pwd=EloraOpenSession2025');
  const [sessionTitle, setSessionTitle] = useState('New York Open: Live Order Flow & Liquidity Hunt');
  const [roomId, setRoomId] = useState('894 3302 9118');
  const [passcode, setPasscode] = useState('ELORA2025');
  const [hostName, setHostName] = useState('Marcus Vance, CMT (Lead Macro)');
  const [updateState, setUpdateState] = useState<'idle' | 'loading' | 'done'>('idle');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [fullConfig, setFullConfig] = useState<any>(null);

  // Top Level Page Content
  const [pageTitle, setPageTitle] = useState('Live Classes & 1-on-1 Mentorship');
  const [pageVariant, setPageVariant] = useState('Variant B • Executive Calendar');
  const [pageSubtitle, setPageSubtitle] = useState('High-frequency institutional masterclasses, interactive weekly timetable, and direct reservation of senior desk strategy clinics.');

  // Live Zoom Enhanced State
  const [hostTitle, setHostTitle] = useState('');
  const [coHostName, setCoHostName] = useState('');
  const [coHostTitle, setCoHostTitle] = useState('');
  const [sessionTime, setSessionTime] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState('');
  const [seatsLeft, setSeatsLeft] = useState('');
  const [chartPackUrl, setChartPackUrl] = useState('');


  // Scheduled Classes State
  const [activeClasses, setActiveClasses] = useState<any[]>([]);
  const [newClassTitle, setNewClassTitle] = useState('');
  const [newClassModule, setNewClassModule] = useState('Module 01: Institutional Market Structure');
  const [newClassFaculty, setNewClassFaculty] = useState('Marcus Vance, CMT (Lead Macro)');
  const [newClassDay, setNewClassDay] = useState('Monday');
  const [newClassTime, setNewClassTime] = useState('14:00 GMT');
  const [newClassZoomLink, setNewClassZoomLink] = useState('');

  const [scheduleHeading, setScheduleHeading] = useState('Weekly Institutional Masterclass Schedule');
  const [scheduleSubheading, setScheduleSubheading] = useState('Live Zoom Cohort Sessions');

  // Tutors State
  const [tutors, setTutors] = useState<any[]>([]);
  const [newTutorName, setNewTutorName] = useState('');
  const [newTutorTitle, setNewTutorTitle] = useState('');
  const [newTutorSubtitle, setNewTutorSubtitle] = useState('');
  const [newTutorAvailability, setNewTutorAvailability] = useState('Mon - Fri, 10am - 4pm GMT');

  React.useEffect(() => {
    fetch('/api/admin/live-room')
      .then(res => res.json())
      .then(data => {
          if (data.config) {
          setFullConfig(data.config);
          setActiveClasses(data.config.masterclasses || []);
          setScheduleHeading(data.config.scheduleHeading || 'Weekly Institutional Masterclass Schedule');
          setScheduleSubheading(data.config.scheduleSubheading || 'Live Zoom Cohort Sessions');
          setPageTitle(data.config.pageTitle || 'Live Classes & 1-on-1 Mentorship');
          setPageVariant(data.config.pageVariant || 'Variant B • Executive Calendar');
          setPageSubtitle(data.config.pageSubtitle || 'High-frequency institutional masterclasses, interactive weekly timetable, and direct reservation of senior desk strategy clinics.');
          setTutors(data.config.tutors || []);
          
          const lz = data.config.liveZoom;
          if (lz) {
            setSessionTitle(lz.heading || 'Weekly Masterclass');
            setRoomId(lz.roomId || '894 3302 9118');
            setZoomUrl(lz.joinLink || 'https://zoom.us/j/89433029118?pwd=EloraOpenSession2025');
            setPasscode(lz.passcode || 'ELORA2025');
            setHostName(lz.hostName || 'Marcus Vance, CMT (Lead Macro)');
            setHostTitle(lz.hostTitle || 'Lead Macro');
            setCoHostName(lz.coHostName || '');
            setCoHostTitle(lz.coHostTitle || '');
            setSessionTime(lz.time || '11:30 AM GMT');
            setRegisteredUsers(lz.registeredUsers || '482');
            setSeatsLeft(lz.seatsLeft || '18');
            setChartPackUrl(lz.chartPackUrl || '#');
          }
        }
      })
      .catch(console.error);
  }, []);

  const handleUpdate = async () => {
    setUpdateState('loading');
    try {
      const newConfig = {
        ...fullConfig,
        pageTitle,
        pageVariant,
        pageSubtitle,
        tutors: tutors,
        liveZoom: {
          ...(fullConfig?.liveZoom || {}),
          heading: sessionTitle,
          roomId: roomId,
          joinLink: zoomUrl,
          passcode: passcode,
          hostName: hostName,
          hostTitle: hostTitle,
          coHostName: coHostName,
          coHostTitle: coHostTitle,
          time: sessionTime,
          registeredUsers: registeredUsers,
          seatsLeft: seatsLeft,
          chartPackUrl: chartPackUrl,
        }
      };
      const res = await fetch('/api/admin/live-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (res.ok) {
        setFullConfig(newConfig);
        setUpdateState('done');
        setTimeout(() => setUpdateState('idle'), 2500);
      } else {
        console.error('Failed to update config');
        setUpdateState('idle');
      }
    } catch (err) {
      console.error(err);
      setUpdateState('idle');
    }
  };

  const handleAddClass = async () => {
    if (!newClassTitle || !newClassZoomLink) return alert('Title and Zoom Link are required');
    const newClass = {
      id: Date.now().toString(),
      day: newClassDay,
      time: newClassTime,
      duration: '60 Min',
      title: newClassTitle,
      host: newClassFaculty,
      module: newClassModule,
      seatsTotal: 1000,
      seatsFilled: 0,
      zoomLink: newClassZoomLink,
      tier: 'PRO & VIP',
    };
    const updatedClasses = [...activeClasses, newClass];
    const newConfig = { ...fullConfig, masterclasses: updatedClasses };
    
    try {
      const res = await fetch('/api/admin/live-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (res.ok) {
        setActiveClasses(updatedClasses);
        setFullConfig(newConfig);
        setNewClassTitle('');
        setNewClassZoomLink('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveScheduleHeading = async () => {
    const newConfig = { ...fullConfig, scheduleHeading, scheduleSubheading };
    try {
      const res = await fetch('/api/admin/live-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (res.ok) {
        setFullConfig(newConfig);
        alert('Schedule Headings saved!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteClass = async (id: string) => {
    if (!confirm('Are you sure you want to delete this class?')) return;
    const updatedClasses = activeClasses.filter((c: any) => c.id !== id);
    const newConfig = { ...fullConfig, masterclasses: updatedClasses };
    try {
      const res = await fetch('/api/admin/live-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (res.ok) {
        setActiveClasses(updatedClasses);
        setFullConfig(newConfig);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddTutor = async () => {
    if (!newTutorName || !newTutorTitle) return alert('Name and Title are required');
    const newTutor = {
      id: Date.now().toString(),
      name: newTutorName,
      title: newTutorTitle,
      subtitle: newTutorSubtitle,
      availability: newTutorAvailability,
      isOnline: true,
      rating: 5.0,
      reviews: 0,
      tags: ['1-on-1 Mentorship', 'Live Trading']
    };
    const updatedTutors = [...tutors, newTutor];
    const newConfig = { ...fullConfig, tutors: updatedTutors };
    
    try {
      const res = await fetch('/api/admin/live-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (res.ok) {
        setTutors(updatedTutors);
        setFullConfig(newConfig);
        setNewTutorName('');
        setNewTutorTitle('');
        setNewTutorSubtitle('');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTutor = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tutor?')) return;
    const updatedTutors = tutors.filter((t: any) => t.id !== id);
    const newConfig = { ...fullConfig, tutors: updatedTutors };
    try {
      const res = await fetch('/api/admin/live-room', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: newConfig }),
      });
      if (res.ok) {
        setTutors(updatedTutors);
        setFullConfig(newConfig);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const tierBadge = (tier: string) => {
    if (tier === 'PRO & VIP') return 'bg-blue-100 text-blue-700 border border-blue-200';
    if (tier === 'ALL TIERS') return 'bg-slate-100 text-slate-700';
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen overflow-y-auto">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-8">

        {/* ── Page Header ──────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium">
              <Link href="/admin-trading" className="hover:text-blue-700 flex items-center gap-1 transition-colors">
                <span className="material-symbols-outlined text-[14px]">home</span>
                Admin Studio
              </Link>
              <span className="text-slate-300">/</span>
              <span className="text-slate-800 font-semibold">Live Room & Zoom Scheduler</span>
            </div>
            <div className="flex items-center gap-3 flex-wrap mt-0.5">
              <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
                Live Room & Zoom Scheduler
              </h1>
              <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-100">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span className="text-emerald-700 text-[11px] font-bold">Front-End Sync Engine Active</span>
              </div>
            </div>
            <p className="text-slate-500 text-xs mt-0.5">
              Manage live Zoom broadcasts, schedule upcoming classes, and process 1-on-1 mentorship bookings.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 text-[12px]">
              <span className="material-symbols-outlined text-[15px] text-[#1D4ED8]">verified_user</span>
              Signed in as <strong className="text-slate-900 ml-1">Chief Academic Director</strong>
            </div>
            <button
              onClick={() => document.getElementById('syncer-card')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-4 py-2 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white text-[12px] font-bold flex items-center gap-1.5 shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-[16px]">bolt</span>
              Instant Live Push
            </button>
          </div>
        </div>

        {/* ── KPI Summary Bar ──────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* KPI 1 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px] animate-pulse">videocam</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Active Live Stream</p>
                <p className="text-[15px] font-bold text-slate-900 leading-tight">NY Open Scalp Floor</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shrink-0">ONLINE</span>
          </div>

          {/* KPI 2 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#1D4ED8] flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">event_available</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Upcoming Classes</p>
                <p className="text-[15px] font-bold text-slate-900 leading-tight">4 This Week</p>
              </div>
            </div>
            <span className="text-[11px] text-slate-500 font-medium shrink-0">Calendar Synced</span>
          </div>

          {/* KPI 3 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">group_add</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">1-on-1 Mentorship</p>
                <p className="text-[15px] font-bold text-slate-900 leading-tight">6 Bookings</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-red-50 border border-red-100 text-red-600 text-[10px] font-bold shrink-0">3 Pending</span>
          </div>

          {/* KPI 4 */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">sync</span>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Student Front-End</p>
                <p className="text-[15px] font-bold text-emerald-600 leading-tight">Instant Mirroring</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          </div>
        </div>

        {/* ── BOX 1: Global Page Configuration ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">text_fields</span>
            </div>
            <div>
              <h2 className="text-[17px] font-bold text-slate-900">Global Page Configuration</h2>
              <p className="text-[12px] text-slate-500">Manage the main headings, subtitles, and badges displayed at the top of the student Live Room.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Main Page Title</label>
              <input type="text" value={pageTitle} onChange={(e) => setPageTitle(e.target.value)} placeholder="e.g. Live Classes & 1-on-1 Mentorship" className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-800 transition" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Variant / Badge Text</label>
              <input type="text" value={pageVariant} onChange={(e) => setPageVariant(e.target.value)} placeholder="e.g. Variant B • Executive Calendar" className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-800 transition" />
            </div>
            <div className="flex flex-col gap-1.5 sm:col-span-2">
              <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Description Subtitle</label>
              <input type="text" value={pageSubtitle} onChange={(e) => setPageSubtitle(e.target.value)} placeholder="Subtitle paragraph..." className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-slate-800 transition" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 flex flex-col gap-6">
            {/* ── BOX 2: Live Broadcast Engine ─────────────────────────────── */}
            <div id="syncer-card" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-[#1D4ED8]"></div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">live_tv</span>
                  </div>
                  <div>
                    <h2 className="text-[17px] font-bold text-slate-900">Live Broadcast Engine</h2>
                    <p className="text-[12px] text-slate-500">Configure the Zoom integration and broadcast status.</p>
                  </div>
                </div>
                <label className="flex items-center gap-2 cursor-pointer px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 transition-colors">
                  <input type="checkbox" checked={broadcastLive} onChange={(e) => setBroadcastLive(e.target.checked)} className="accent-blue-700 w-4 h-4 rounded" />
                  <span className="text-[12px] font-bold text-slate-800">Broadcast Live Now</span>
                </label>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Zoom / Google Meet URL</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">link</span>
                      <input type="text" value={zoomUrl} onChange={(e) => setZoomUrl(e.target.value)} className="w-full pl-9 pr-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Meeting ID</label>
                    <input type="text" value={roomId} onChange={(e) => setRoomId(e.target.value)} className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Passcode</label>
                    <input type="text" value={passcode} onChange={(e) => setPasscode(e.target.value)} className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Live Session Title</label>
                    <input type="text" value={sessionTitle} onChange={(e) => setSessionTitle(e.target.value)} className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Target Module</label>
                    <select className="w-full px-3 py-2.5 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none">
                      <option>Module 02: Liquidity Sweeps & FVGs</option>
                      <option>Module 01: Institutional Market Structure</option>
                      <option>Module 03: Order Flow Volume Profile & Delta</option>
                      <option>Module 04: Macro Catalyst & FOMC Strategy</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* ── BOX 3: Current Session Details ───────────────────────────── */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <span className="material-symbols-outlined text-[22px]">group</span>
                </div>
                <div>
                  <h2 className="text-[17px] font-bold text-slate-900">Current Session Details</h2>
                  <p className="text-[12px] text-slate-500">Configure host information, time, capacity limits, and resources.</p>
                </div>
              </div>
              
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Host Name & Title</label>
                    <div className="flex gap-2">
                      <input type="text" value={hostName} onChange={(e) => setHostName(e.target.value)} placeholder="Name" className="w-1/2 px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                      <input type="text" value={hostTitle} onChange={(e) => setHostTitle(e.target.value)} placeholder="Title" className="w-1/2 px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Co-Host Name & Title (Optional)</label>
                    <div className="flex gap-2">
                      <input type="text" value={coHostName} onChange={(e) => setCoHostName(e.target.value)} placeholder="Name" className="w-1/2 px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                      <input type="text" value={coHostTitle} onChange={(e) => setCoHostTitle(e.target.value)} placeholder="Title" className="w-1/2 px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Time</label>
                    <input type="text" value={sessionTime} onChange={(e) => setSessionTime(e.target.value)} className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Registered</label>
                    <input type="text" value={registeredUsers} onChange={(e) => setRegisteredUsers(e.target.value)} className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Seats Left</label>
                    <input type="text" value={seatsLeft} onChange={(e) => setSeatsLeft(e.target.value)} className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                  </div>
                  <div className="flex flex-col gap-1.5 sm:col-span-1">
                    <label className="text-[12px] font-bold text-slate-700 uppercase tracking-wide">Chart Pack</label>
                    <input type="text" value={chartPackUrl} onChange={(e) => setChartPackUrl(e.target.value)} placeholder="URL..." className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-purple-500 transition" />
                  </div>
                </div>
              </div>
            </div>

              {/* Action Row */}
              <div className="flex items-center gap-2 flex-wrap pt-1">
                <button
                  onClick={handleUpdate}
                  className="px-5 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[13px] font-bold flex items-center gap-1.5 shadow-md transition-all"
                >
                  <span className={`material-symbols-outlined text-[18px] ${updateState === 'loading' ? 'animate-spin' : ''}`}>
                    {updateState === 'loading' ? 'sync' : updateState === 'done' ? 'check_circle' : 'cloud_upload'}
                  </span>
                  {updateState === 'loading' ? 'Updating...' : updateState === 'done' ? 'Updated!' : 'Update & Reflect on Front-End Now'}
                </button>
                <button
                  onClick={() => setUpdateState('idle')}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-[12px] font-semibold transition-colors border border-slate-200"
                >
                  Reset to Default
                </button>
                <span className="text-emerald-600 text-[12px] flex items-center gap-1 ml-auto font-medium">
                  <span className="material-symbols-outlined text-[15px]">check_circle</span>
                  Last updated 4 mins ago
                </span>
              </div>
            </div>

            {/* Right: Live Preview Card (5 cols) */}
            <div className="lg:col-span-5 bg-[#F8FAFC] border border-slate-200 rounded-2xl p-4 flex flex-col justify-between gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-bold uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[15px] text-[#1D4ED8]">visibility</span>
                  Live Front-End Preview Card
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold">STUDENT VIEW</span>
              </div>
              <p className="text-[11px] text-slate-500">This is the exact notification banner currently visible on student course screens:</p>

              {/* Student Widget Mock */}
              <div className="p-3 bg-white rounded-xl border-2 border-[#1D4ED8] shadow-sm flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                    </span>
                    <span className="font-bold text-red-600 text-[13px]">🔴 LIVE NOW IN SESSION</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-[10px] font-bold">ALL TIERS</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-[13px] leading-snug">{sessionTitle}</h4>
                  <span className="text-slate-500 text-[11px]">Instructor: Marcus Vance, CMT • Module 02</span>
                </div>
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-100">
                  <span className="font-mono text-slate-500 text-[11px]">Meeting ID: {roomId}</span>
                  <a href={zoomUrl} target="_blank" className="px-2.5 py-1 rounded-lg bg-[#1D4ED8] text-white text-[11px] font-bold flex items-center gap-1 hover:bg-blue-700 transition-colors">
                    <span className="material-symbols-outlined text-[13px]">login</span>
                    Click to Join Zoom Room
                  </a>
                </div>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span>Broadcast Node: CloudFront Edge (LD4)</span>
                <span className="text-emerald-600 font-semibold">Synced in 120ms</span>
              </div>
            </div>
          </div>

        {/* ── SECTION 2: Schedule Upcoming Live Zoom Classes ───────────── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Schedule Upcoming Live Zoom Classes & Modules</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Add upcoming live classes to student calendars and manage active meeting links.</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">edit_note</span>
              <h3 className="text-[15px] font-bold text-slate-900">Edit Section Headings (Student View)</h3>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Main Heading</label>
                <input
                  type="text"
                  value={scheduleHeading}
                  onChange={(e) => setScheduleHeading(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="flex-1 flex flex-col gap-1">
                <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Subheading</label>
                <input
                  type="text"
                  value={scheduleSubheading}
                  onChange={(e) => setScheduleSubheading(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
              </div>
              <div className="flex items-end">
                <button onClick={handleSaveScheduleHeading} className="px-5 py-2 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[13px] font-bold flex items-center gap-2 shadow-md transition-all">
                  Save
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">

            {/* Add Class Form (4 cols) */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">add_circle</span>
                <h3 className="text-[15px] font-bold text-slate-900">Add New Scheduled Class</h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Class Title & Focus</label>
                  <input
                    type="text"
                    value={newClassTitle}
                    onChange={(e) => setNewClassTitle(e.target.value)}
                    placeholder="e.g. London Liquidity Sweep & Order Book"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Associated Module / Topic</label>
                  <select 
                    value={newClassModule}
                    onChange={(e) => setNewClassModule(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none">
                    <option>Module 01: Institutional Market Structure</option>
                    <option>Module 02: Liquidity Sweeps & FVGs</option>
                    <option>Module 03: Delta Volume Analysis</option>
                    <option>Module 04: Macro FOMC Strategy</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Faculty Host / Mentor</label>
                  <select 
                    value={newClassFaculty}
                    onChange={(e) => setNewClassFaculty(e.target.value)}
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none">
                    <option>Marcus Vance, CMT (Lead Macro)</option>
                    <option>Elena Rostova (Liquidity Specialist)</option>
                    <option>Julian Thorne (Chief Risk Officer)</option>
                    <option>Dr. Aris Thorne (Quant Desk)</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Day</label>
                    <select
                      value={newClassDay}
                      onChange={(e) => setNewClassDay(e.target.value)}
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition appearance-none">
                      <option>Monday</option>
                      <option>Tuesday</option>
                      <option>Wednesday</option>
                      <option>Thursday</option>
                      <option>Friday</option>
                      <option>Saturday</option>
                      <option>Sunday</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Time (GMT)</label>
                    <input
                      type="text"
                      value={newClassTime}
                      onChange={(e) => setNewClassTime(e.target.value)}
                      placeholder="14:00 GMT"
                      className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Zoom / Meeting Link</label>
                  <input
                    type="text"
                    value={newClassZoomLink}
                    onChange={(e) => setNewClassZoomLink(e.target.value)}
                    placeholder="https://zoom.us/j/90248190041"
                    className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Access Tier Gate</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'Starter', checked: false },
                      { label: 'Pro', checked: true },
                      { label: 'Exec VIP', checked: true },
                    ].map((tier) => (
                      <label
                        key={tier.label}
                        className="p-2 rounded-xl bg-[#F8FAFC] border border-slate-200 text-center text-[11px] font-bold cursor-pointer text-slate-700 hover:bg-blue-50 hover:border-blue-200 flex items-center justify-center gap-1 transition-colors"
                      >
                        <input defaultChecked={tier.checked} type="checkbox" className="accent-blue-700 w-3.5 h-3.5" />
                        {tier.label}
                      </label>
                    ))}
                  </div>
                </div>

                <button onClick={handleAddClass} className="w-full py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-md transition-all mt-1">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  + Schedule & Publish to Student Calendar
                </button>
              </div>
            </div>

            {/* Roster Table (8 cols) */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">calendar_month</span>
                  <h3 className="text-[15px] font-bold text-slate-900">Scheduled Classes Calendar & Roster</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-bold">{activeClasses.length} Active in Queue</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                      <th className="pb-2.5 pr-4 font-bold">Date & Time</th>
                      <th className="pb-2.5 pr-4 font-bold">Module & Headline</th>
                      <th className="pb-2.5 pr-4 font-bold">Faculty Host</th>
                      <th className="pb-2.5 pr-4 font-bold">Zoom Link</th>
                      <th className="pb-2.5 pr-4 font-bold">Tier / Enrolled</th>
                      <th className="pb-2.5 text-right font-bold">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {activeClasses.map((cls: any) => (
                      <tr key={cls.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span className="font-bold text-[#1D4ED8] text-[13px]">{cls.day}</span>
                          <br />
                          <span className="text-[11px] text-slate-500 font-mono">{cls.time}</span>
                        </td>
                        <td className="py-3.5 pr-4">
                          <div className="font-bold text-slate-900 text-[13px] leading-tight">{cls.title}</div>
                          <span className="text-[11px] text-slate-500">{cls.module || 'Masterclass'}</span>
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 text-[13px]">{cls.host}</span>
                          <br />
                          <span className="text-[10px] font-bold text-emerald-600">
                            Confirmed
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-[11px]">
                          <div className="flex items-center gap-1 bg-slate-50 border border-slate-200 px-2 py-1 rounded-lg w-fit">
                            <span className="text-[#1D4ED8] truncate max-w-[110px]">{cls.zoomLink || cls.joinLink || 'No link'}</span>
                            <button
                              onClick={() => handleCopy(cls.id, cls.zoomLink || cls.joinLink)}
                              className="hover:text-[#1D4ED8] text-slate-400 transition-colors"
                              title="Copy Link"
                            >
                              <span className="material-symbols-outlined text-[14px]">
                                {copiedId === cls.id ? 'check' : 'content_copy'}
                              </span>
                            </button>
                          </div>
                        </td>
                        <td className="py-3.5 pr-4 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${tierBadge(cls.tier || 'PRO & VIP')}`}>
                            {cls.tier || 'PRO & VIP'}
                          </span>
                          <br />
                          <span className="text-[11px] text-slate-500 font-semibold mt-0.5 block">{cls.seatsFilled || 0} / {cls.seatsTotal || 1000} Enrolled</span>
                        </td>
                        <td className="py-3.5 text-right whitespace-nowrap">
                          <button onClick={() => handleDeleteClass(cls.id)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Cancel & Delete">
                            <span className="material-symbols-outlined text-[16px]">close</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {activeClasses.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-slate-500 text-sm">No classes scheduled</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 3: Manage Tutors ─────────────────────────────────── */}
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-[20px] font-bold text-slate-900 tracking-tight">Verified Senior Desk Tutor Showcase</h2>
              <p className="text-[13px] text-slate-500 mt-0.5">Add and manage the mentors available for 1-on-1 clinics on the student dashboard.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Add Tutor Form */}
            <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="material-symbols-outlined text-[#1D4ED8] text-[20px]">person_add</span>
                <h3 className="text-[15px] font-bold text-slate-900">Add New Tutor</h3>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Tutor Name</label>
                  <input type="text" value={newTutorName} onChange={(e) => setNewTutorName(e.target.value)} className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Role / Title</label>
                  <input type="text" value={newTutorTitle} onChange={(e) => setNewTutorTitle(e.target.value)} placeholder="e.g. Lead Macro Analyst" className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Subtitle / Qualifications</label>
                  <input type="text" value={newTutorSubtitle} onChange={(e) => setNewTutorSubtitle(e.target.value)} placeholder="e.g. 10+ Years Trading Forex" className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wide">Availability String</label>
                  <input type="text" value={newTutorAvailability} onChange={(e) => setNewTutorAvailability(e.target.value)} className="w-full px-3 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-800 rounded-xl text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                </div>
                <button onClick={handleAddTutor} className="mt-1 w-full py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[13px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all">
                  <span className="material-symbols-outlined text-[18px]">add</span>
                  Add Tutor to Roster
                </button>
              </div>
            </div>

            {/* Active Tutors List */}
            <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                <span className="material-symbols-outlined text-slate-400 text-[20px]">groups</span>
                <h3 className="text-[15px] font-bold text-slate-900">Active Mentors on Platform</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tutors.map((tutor) => (
                  <div key={tutor.id} className="p-4 rounded-xl border border-slate-100 bg-slate-50 flex flex-col gap-3 relative">
                    <button onClick={() => handleDeleteTutor(tutor.id)} className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-[16px]">
                        {tutor.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-[14px]">{tutor.name}</div>
                        <div className="text-[11px] text-slate-500">{tutor.title}</div>
                      </div>
                    </div>
                    <div className="text-[11px] text-slate-600 bg-white p-2 rounded border border-slate-200">
                      <strong>Avail:</strong> {tutor.availability}
                    </div>
                  </div>
                ))}
                {tutors.length === 0 && (
                  <div className="col-span-2 text-center text-slate-500 text-[12px] py-4">No tutors currently configured.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── SECTION 4: 1-on-1 Mentorship Booking ────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-5">
          {/* Header + Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1D4ED8] text-white flex items-center justify-center">
                <span className="material-symbols-outlined text-[22px]">support_agent</span>
              </div>
              <div>
                <h2 className="text-[17px] font-bold text-slate-900">1-on-1 Mentorship Booking & Student Applications</h2>
                <p className="text-[12px] text-slate-500">Review student diagnostic requests, assign mentors, and schedule dedicated private Zoom sessions.</p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-0.5">
              {(
                [
                  { key: 'all', label: 'All Applications (6)' },
                  { key: 'pending', label: 'Pending Review (3)' },
                  { key: 'approved', label: 'Approved & Zoom Scheduled (2)' },
                  { key: 'completed', label: 'Completed (1)' },
                ] as { key: MentorshipTab; label: string }[]
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setMentorTab(tab.key)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all ${
                    mentorTab === tab.key
                      ? 'bg-white text-[#1D4ED8] shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="pb-2.5 pr-4 font-bold">Student / Trader ID</th>
                  <th className="pb-2.5 pr-4 font-bold">Membership Tier</th>
                  <th className="pb-2.5 pr-4 font-bold">Requested Date & Slot</th>
                  <th className="pb-2.5 pr-4 font-bold max-w-[200px]">Problem Statement / Topic</th>
                  <th className="pb-2.5 pr-4 font-bold">Assigned Mentor</th>
                  <th className="pb-2.5 pr-4 font-bold">Zoom Link Status</th>
                  <th className="pb-2.5 text-right font-bold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {mentorshipApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition-colors">
                    {/* Student */}
                    <td className="py-3.5 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-9 h-9 rounded-full ${app.color} flex items-center justify-center font-bold text-[12px] shrink-0`}>
                          {app.initials}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 text-[13px]">{app.name}</div>
                          <span className="text-[11px] text-slate-500 font-mono">{app.traderId}</span>
                        </div>
                      </div>
                    </td>
                    {/* Tier */}
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${app.tierColor}`}>
                        {app.tier}
                      </span>
                      <br />
                      <span className="text-[10px] text-slate-500 mt-0.5 block">{app.eligibility}</span>
                    </td>
                    {/* Date */}
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      <span className="font-bold text-slate-800 text-[13px]">{app.date}</span>
                      <br />
                      <span className="text-[11px] text-slate-500">{app.duration}</span>
                    </td>
                    {/* Problem */}
                    <td className="py-3.5 pr-4 max-w-[200px]">
                      <p className="text-[12px] text-slate-600 line-clamp-2 leading-snug">{app.problem}</p>
                    </td>
                    {/* Mentor */}
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      <span className={`font-semibold text-[13px] ${app.mentor === 'Unassigned' ? 'text-slate-400 italic' : 'text-[#1D4ED8]'}`}>
                        {app.mentor}
                      </span>
                      <br />
                      <span className={`text-[10px] ${app.mentorRole === 'Select Faculty' ? 'text-[#1D4ED8] cursor-pointer hover:underline' : 'text-slate-500'}`}>
                        {app.mentorRole}
                      </span>
                    </td>
                    {/* Status */}
                    <td className="py-3.5 pr-4 whitespace-nowrap">
                      {app.zoomStatus === 'assigned' && (
                        <span className="text-emerald-600 text-[11px] font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                          Assigned: {app.zoomLink}
                        </span>
                      )}
                      {app.zoomStatus === 'pending' && (
                        <span className="text-red-500 text-[11px] font-semibold flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>
                          Pending Admin Link
                        </span>
                      )}
                      {app.zoomStatus === 'waiting' && (
                        <span className="text-slate-500 text-[11px] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0"></span>
                          Waiting Review
                        </span>
                      )}
                    </td>
                    {/* Action */}
                    <td className="py-3.5 text-right whitespace-nowrap">
                      {app.action === 'approve' && (
                        <button className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold transition-colors shadow-sm">
                          Approve & Send Zoom Invite
                        </button>
                      )}
                      {app.action === 'assign' && (
                        <button className="px-3 py-1.5 rounded-lg bg-[#1D4ED8] hover:bg-blue-700 text-white text-[11px] font-bold transition-colors shadow-sm">
                          Assign Zoom Link
                        </button>
                      )}
                      {app.action === 'decline' && (
                        <button className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold transition-colors border border-slate-200">
                          Decline / Suggest New Time
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
