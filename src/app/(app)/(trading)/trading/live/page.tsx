'use client'

import React, { useState, useEffect } from 'react';
import { GatedContent } from '../components/GatedContent'

export default function LiveClassesPage() {
  const [activeTutor, setActiveTutor] = useState('vance');
  const [selectedDate, setSelectedDate] = useState('Mon 21');
  const [selectedTime, setSelectedTime] = useState('11:30 AM GMT');
  const [isBooking, setIsBooking] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [config, setConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [bookedSession, setBookedSession] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/live-room')
      .then(res => res.json())
      .then(data => {
        if (data.config) {
          setConfig(data.config);
          if (data.config.tutors?.length > 0) {
            setActiveTutor(data.config.tutors[0].id);
          }
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    const savedBooking = localStorage.getItem('user_1on1_booking');
    if (savedBooking) {
      try {
        setBookedSession(JSON.parse(savedBooking));
      } catch (e) {}
    }
  }, []);

  const handleBookMeeting = () => {
    setIsBooking(true);
    setTimeout(() => {
      setIsBooking(false);
      const bookingData = { tutorId: activeTutor, date: selectedDate, time: selectedTime };
      setBookedSession(bookingData);
      localStorage.setItem('user_1on1_booking', JSON.stringify(bookingData));
      setToastMessage(`Success! 1-on-1 booked for ${selectedDate} at ${selectedTime}. Zoom link sent to email.`);
      setTimeout(() => setToastMessage(''), 4000);
    }, 1000);
  };

  const handleReserveClass = () => {
    setToastMessage('Seat Reserved! Added to your calendar schedule.');
    setTimeout(() => setToastMessage(''), 4000);
  };

  // Fallback values so page always renders even if config is missing
  const lz = config?.liveZoom || {};
  const oo = config?.oneOnOne || {};
  const masterclasses = config?.masterclasses || [];
  const tutors = config?.tutors || [];
  const activeTutorData = tutors.find((t: any) => t.id === activeTutor) || tutors[0] || {};

  return (
    <div className="w-full h-full font-sans relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 left-1/2 transform -translate-x-1/2 z-50 bg-[#1D4ED8] text-white px-6 py-3 rounded-full shadow-lg font-bold text-[14px] flex items-center gap-2 animate-bounce">
          <span className="material-symbols-outlined text-[20px]">check_circle</span>
          {toastMessage}
        </div>
      )}

      <div className="flex flex-col w-full max-w-[1600px] mx-auto px-4 md:px-8 gap-4 md:gap-8  pb-10">
        <GatedContent minPackageRequired={3} blurLevel="md" customMessage="The Live Institutional Trading Floor is reserved for Package 3 members. Upgrade to get real-time market access.">
        <div className="flex flex-col w-full gap-8 pb-10">
{/* Executive Breadcrumb & Header Title */}
<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div className="flex flex-col gap-1">
<nav className="flex items-center gap-1 text-[#9CA3AF] font-bold text-[13px]">
<span className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Elora Academy</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="hover:text-[#1D4ED8] transition-colors cursor-pointer">Live Learning</span>
<span className="material-symbols-outlined text-[14px]">chevron_right</span>
<span className="text-[#111827] font-semibold">Executive Calendar &amp; Mentorship</span>
</nav>
<div className="flex items-center gap-3">
<h1 className="font-display-lg text-display-lg text-[#111827] tracking-tight">
        {loading ? 'Loading...' : (config?.pageTitle || 'Live Classes & 1-on-1 Mentorship')}
      </h1>
<span className="px-2.5 py-0.5 rounded-full bg-primary-fixed text-white-fixed font-bold text-[11px] font-semibold tracking-wide uppercase">
        {loading ? '...' : (config?.pageVariant || 'Variant B • Executive Calendar')}
      </span>
</div>
<p className="font-medium text-[14px] text-[#6B7280] max-w-3xl">
        {loading ? 'Loading description...' : (config?.pageSubtitle || 'High-frequency institutional masterclasses, interactive weekly timetable, and direct reservation of senior desk strategy clinics.')}
      </p>
</div>
<div className="flex items-center gap-2 shrink-0">
<div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-[#111827] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB]">
<span className="material-symbols-outlined text-[18px] text-[#6B7280]">public</span>
<select className="bg-transparent border-none focus:outline-none cursor-pointer text-[#111827] font-semibold text-label-md font-label-md">
<option>(GMT+00:00) London / UTC</option>
<option>(GMT-05:00) New York / EST</option>
<option>(GMT+04:00) Dubai / GST</option>
<option>(GMT+08:00) Singapore / SGT</option>
</select>
</div>
<button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-[#1D4ED8] text-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-[#1e40af] transition-all text-headline-md font-headline-md" onClick={() => {}}>
<span className="material-symbols-outlined text-[18px]">calendar_add_on</span>
<span className="">Book 1-1 Zoom&nbsp;</span>
</button>
</div>
</div>
{/* SECTION 1: TOP SPLIT EXECUTIVE HERO BANNER */}
<section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
{/* Urgent Live Alert (7 Cols) */}
<div className="lg:col-span-7 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 relative overflow-hidden flex flex-col justify-between gap-4">
<div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#1D4ED8]"></div>
<div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-secondary-fixed/25 blur-3xl pointer-events-none"></div>
<div className="flex flex-col gap-2 relative">
<div className="flex flex-wrap items-center gap-2">
<span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ECFDF5] text-[#059669] font-bold text-[11px] uppercase tracking-wider font-semibold">
<span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
            Live • Zoom Webinar
          </span>
<span className="font-bold text-[11px] text-[#6B7280] bg-[#F8FAFC] px-2 py-0.5 rounded border border-[#E5E7EB] font-mono">
            Room ID: {loading ? '—' : (lz.roomId || '—')}
          </span>
<span className="font-bold text-[11px] text-[#6B7280] font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">lock_open</span>
            Passcode Embedded
          </span>
</div>
<h2 className="font-extrabold text-[20px] md:text-[24px] text-[#111827] font-semibold tracking-tight">
          {loading ? 'Loading…' : (lz.heading || 'Weekly Masterclass')}
        </h2>
{/* Speaker Badges & Details */}
<div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-body-sm font-body-sm text-[#6B7280] pt-1">
<div className="flex items-center gap-2">
<img className="w-8 h-8 rounded-full object-cover ring-2 ring-surface" data-alt="Host" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCI4W3ChzS0WhedFj1xzcHi7mzt2hFGX4nTvjt2PCDDGBdGleE-6_zMmY_cbsz9ppGp5cCQZbTBfzkxX8gkuTb7fKp4g-Y5CGoQFswJYgiNNIgIQIi2Qn0VygH1Pb4cuj2CGzxcEO0AQuUtrtUfhnLAMQxLbVfM_b408jzDNIwokRRCny9vLJ-vgBSoNUIe6OM8aPNJAd3GvUKkxl-tKnbwT3cf5OwmGDbsmBoCVXEaRgLTRYPLC1Kpdg" />
<div className="flex flex-col leading-tight">
<span className="font-semibold text-[#111827] text-label-md">{loading ? '—' : (lz.hostName || '—')}</span>
<span className="text-[11px] text-[#6B7280]">{loading ? '—' : (lz.hostTitle || '—')}</span>
</div>
</div>
{!loading && lz.coHostName && (
  <>
    <span className="text-[#9CA3AF]">•</span>
    <div className="flex items-center gap-2">
      <img className="w-8 h-8 rounded-full object-cover ring-2 ring-surface" data-alt="Co-host" src="https://lh3.googleusercontent.com/aida-public/AB6AXuD9MFEs2IXrLO5f3SijGIHqD6PeOl1NWaAUKswEElJ2XPYI6RZvqt52RHhanO3P01iUzSvVYXigX8TUaHOa5ptONObkzcnCiWxvrWSS99Q46rfSuy6LscJLMwZGmaKl-4q3IMYUjNNkrt3LKNiPJDfqiHmRdZ8N3IpDNrz9KDORafKcCZXrcwDyC-cK8ekmNQkxEqRdJMBoyMauQBISqvDtX8HACCPO8JH7Pl2gcoTCQ8elskKw6Tu7Tw" />
      <div className="flex flex-col leading-tight">
        <span className="font-semibold text-[#111827] text-label-md">{lz.coHostName}</span>
        <span className="text-[11px] text-[#9CA3AF]">{lz.coHostTitle}</span>
      </div>
    </div>
  </>
)}
<span className="text-[#9CA3AF]">•</span>
<div className="flex items-center gap-1 text-[#111827] font-semibold">
<span className="material-symbols-outlined text-[16px] text-[#6B7280]">schedule</span>
<span className="">{loading ? '—' : (lz.time || '—')}</span>
</div>
</div>
</div>
<div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-[#E5E7EB]">
<div className="flex items-center gap-2 text-body-sm font-body-sm text-[#6B7280]">
<span className="material-symbols-outlined text-[18px] text-[#6B7280]">group</span>
<span className=""><strong>{loading ? '—' : (lz.registeredUsers ?? '—')}</strong> Registered</span>
<span className="text-[#9CA3AF]">/</span>
<span className="text-red-500 font-semibold flex items-center gap-1">
<span className="material-symbols-outlined text-[14px]">priority_high</span>
            Only {loading ? '—' : (lz.seatsLeft ?? '—')} Seats Left
          </span>
</div>
<div className="flex items-center gap-2">
<a className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-[#F8FAFC] text-[#111827] font-bold text-[13px] hover:bg-[#F3F4F6] transition-colors" href={loading ? '#' : (lz.chartPackUrl || '#')} target="_blank">
<span className="material-symbols-outlined text-[16px] text-[#6B7280]">description</span>
<span className="">Chart Pack (.PDF)</span>
</a>
<a className="flex items-center justify-center gap-2 px-6 py-2 rounded-lg bg-[#1D4ED8] text-white font-bold text-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-[#1e40af] transition-all" href={loading ? '#' : (lz.joinLink || '#')} rel="noopener noreferrer" target="_blank">
<span className="material-symbols-outlined text-[18px]">videocam</span>
<span className="">Join Zoom Masterclass</span>
</a>
</div>
</div>
</div>
{/* Right Side: My Upcoming 1-on-1 Session & Credits (5 Cols) */}
<div className="lg:col-span-5 bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 flex flex-col justify-between gap-4">
<div className="flex items-center justify-between">
<div className="flex items-center gap-2">
{bookedSession ? (
  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
) : (
  <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
)}
<h3 className="font-bold text-[16px] text-[#111827] font-semibold">My Upcoming 1-on-1 Session</h3>
</div>
<span className="px-2.5 py-0.5 rounded-full bg-[#F3F4F6] text-[#6B7280] font-bold text-[11px] font-bold">
          {loading ? '— / —' : `${bookedSession ? (oo.creditsAvailable ?? 2) - 1 : (oo.creditsAvailable ?? 2)} / ${oo.creditsTotal ?? 3} Credits Available`}
        </span>
</div>

{bookedSession ? (
  <div className="flex flex-col gap-4">
    <div className="flex items-center gap-4 p-2 rounded-lg bg-emerald-50 border border-emerald-100">
      <div className="w-12 h-12 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xl">
        {tutors.find((t: any) => t.id === bookedSession.tutorId)?.name?.charAt(0) || 'M'}
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <span className="font-bold text-[16px] text-emerald-900 font-semibold truncate">
          {tutors.find((t: any) => t.id === bookedSession.tutorId)?.name || 'Mentor'}
        </span>
        <span className="text-label-sm text-emerald-700 font-medium">
          {tutors.find((t: any) => t.id === bookedSession.tutorId)?.title || '1-on-1 Clinic'}
        </span>
        <div className="flex items-center gap-1.5 text-label-sm font-label-sm text-emerald-800 font-semibold pt-1">
          <span className="material-symbols-outlined text-[15px]">calendar_today</span>
          <span className="">{bookedSession.date} at {bookedSession.time}</span>
        </div>
      </div>
    </div>
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white border border-[#E5E7EB] text-body-sm font-body-sm font-mono">
        <div className="flex items-center gap-2 truncate text-[#111827]">
          <span className="material-symbols-outlined text-[16px] text-[#6B7280] shrink-0">link</span>
          <span className="truncate">https://zoom.us/j/private-clinic</span>
        </div>
        <button className="shrink-0 flex items-center gap-1 text-[#6B7280] hover:text-[#1D4ED8] font-bold text-[11px] font-semibold transition-colors ml-2" onClick={() => navigator.clipboard.writeText('https://zoom.us/j/private-clinic')}>
          <span className="material-symbols-outlined text-[14px]">content_copy</span>
          <span className="">Copy URL</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <a className="py-2 rounded-lg bg-[#1D4ED8] text-white font-bold text-[16px] text-center hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5" href="https://zoom.us/j/private-clinic" target="_blank">
          <span className="material-symbols-outlined text-[18px]">videocam</span>
          <span className="">Join Desk</span>
        </a>
        <button onClick={() => setBookedSession(null)} className="py-2 rounded-lg bg-red-50 text-red-600 font-bold text-[13px] text-center hover:bg-red-100 transition-colors border border-red-100">
          Cancel Booking
        </button>
      </div>
    </div>
  </div>
) : (
  <div className="flex flex-col items-center justify-center gap-3 py-6 h-full border-2 border-dashed border-slate-200 rounded-[24px] bg-slate-50">
    <span className="material-symbols-outlined text-[24px] md:text-[32px] text-slate-300">event_busy</span>
    <p className="text-[13px] text-slate-500 font-medium text-center max-w-[200px]">No upcoming 1-on-1 sessions booked. Select a mentor below to schedule.</p>
    <button onClick={() => document.getElementById('tutorSection')?.scrollIntoView({ behavior: 'smooth' })} className="mt-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-slate-700 font-bold text-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-slate-50">
      Browse Mentors
    </button>
  </div>
)}
</div>
</section>
{/* SECTION 2: COMPREHENSIVE WEEKLY INTERACTIVE CALENDAR & CLASS GRID */}
<section className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 flex flex-col gap-4">
{/* Calendar Header Controls */}
<div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#E5E7EB]">
<div className="flex items-center gap-3">
<div className="w-10 h-10 rounded-lg bg-[#F3F4F6] flex items-center justify-center text-[#6B7280]">
<span className="material-symbols-outlined text-[20px] md:text-[24px]">calendar_month</span>
</div>
<div className="flex flex-col">
<h3 className="font-headline-lg text-headline-lg text-[#111827] font-semibold">
  {loading ? 'Loading...' : (config?.scheduleHeading || 'Weekly Institutional Masterclass Schedule')}
</h3>
<span className="font-medium text-[13px] text-[#6B7280]">
  {loading ? 'Loading...' : (config?.scheduleSubheading || 'Live Zoom Cohort Sessions')}
</span>
</div>
</div>
{/* Filter Chips & Quick Sync Button */}
<div className="flex flex-wrap items-center gap-2">
<div className="flex items-center bg-[#F8FAFC] p-1 rounded-lg border border-[#E5E7EB]">
<button className="px-3 py-1 rounded text-label-sm font-label-sm font-semibold bg-[#1D4ED8] text-white shadow-[0_4px_20px_rgba(0,0,0,0.03)]">All Masterclasses</button>
</div>
<button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#F8FAFC] text-[#111827] hover:bg-[#F3F4F6] transition-colors text-label-md font-label-md border border-[#E5E7EB]" onClick={() => {}}>
<span className="material-symbols-outlined text-[16px] text-[#6B7280]">sync</span>
<span className="">1-Click Sync Calendar</span>
</button>
</div>
</div>
{/* Calendar Timeline Columns (Mon - Fri) */}
<div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => {
  const dayClasses = masterclasses.filter((c: any) => c.day === day);
  return (
    <div key={day} className="flex flex-col gap-2 rounded-[24px] p-3 bg-[#F9FAFB] border border-[#E5E7EB]">
      <div className="flex items-center justify-between pb-2 border-b border-[#E5E7EB]">
        <div className="flex flex-col">
          <span className="font-bold text-[16px] text-[#111827] font-bold">{day}</span>
        </div>
        {dayClasses.length > 0 ? (
          <span className="text-[11px] font-label-sm text-[#9CA3AF] font-semibold">{dayClasses.length} Class{dayClasses.length > 1 ? 'es' : ''}</span>
        ) : (
          <span className="text-[11px] font-label-sm text-[#9CA3AF] font-semibold">No Classes</span>
        )}
      </div>

      {dayClasses.map((cls: any, idx: number) => {
        const pct = cls.seatsTotal > 0 ? Math.round((cls.seatsFilled / cls.seatsTotal) * 100) : 0;
        const isFirst = idx === 0 && day === 'Monday';
        return (
          <div key={cls.id} className={`bg-white p-3 rounded-lg ${isFirst ? 'border-2 border-[#1D4ED8]' : 'border border-[#E5E7EB]'} shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col gap-2`}>
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase flex items-center gap-1 ${isFirst ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#F3F4F6] text-[#6B7280]'}`}>
                {isFirst && <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>}
                {cls.time}
              </span>
              <span className="text-[10px] font-semibold text-[#6B7280] uppercase bg-[#F3F4F6] px-1.5 py-0.5 rounded">{cls.duration}</span>
            </div>
            <h4 className="font-bold text-[16px] text-[#111827] font-semibold leading-snug">
              {cls.title}
            </h4>
            <div className="flex items-center gap-1.5 text-[11px] text-[#6B7280]">
              <span className="material-symbols-outlined text-[14px] text-[#9CA3AF]">person</span>
              <span className="">{cls.host}</span>
            </div>
            <div className="flex flex-col gap-1 pt-1">
              <div className="flex justify-between text-[11px] text-[#6B7280] font-medium">
                <span className="">Seats: {cls.seatsFilled} / {cls.seatsTotal}</span>
                <span className={pct >= 80 ? 'text-red-500 font-semibold' : 'text-[#6B7280]'}>{pct >= 80 ? `${pct}% Full` : 'Open'}</span>
              </div>
              <div className="w-full bg-[#F3F4F6] h-1.5 rounded-full overflow-hidden">
                <div className="bg-secondary h-full rounded-full" style={{ width: `${pct}%` }}></div>
              </div>
            </div>
            {isFirst ? (
              <button className="w-full mt-1 py-1.5 rounded bg-[#1D4ED8] text-white font-bold text-[13px] hover:bg-[#1e40af] transition-all flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">videocam</span>
                <span className="">Join Masterclass</span>
              </button>
            ) : (
              <button onClick={handleReserveClass} className="w-full mt-1 py-1.5 rounded bg-[#F3F4F6] text-[#1D4ED8] font-bold text-[13px] hover:bg-[#F3F4F6]-high transition-colors flex items-center justify-center gap-1">
                <span className="material-symbols-outlined text-[14px]">calendar_add_on</span>
                <span className="">Reserve Seat</span>
              </button>
            )}
          </div>
        );
      })}

      {dayClasses.length === 0 && !loading && (
        <div className="py-6 text-center text-[#9CA3AF] text-[11px] font-medium">No classes scheduled</div>
      )}
    </div>
  );
})}
</div>
</section>
{/* SECTION 3: VERIFIED SENIOR DESK TUTOR SHOWCASE & BOOKING CLINIC */}
<section className="flex flex-col gap-4 pt-gutter-xs" id="tutorSection">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
<div>
<div className="flex items-center gap-2">
<span className="w-2.5 h-2.5 rounded-full bg-[#1D4ED8]"></span>
<h3 className="font-headline-lg text-headline-lg text-[#111827] font-semibold">
          Verified Senior Desk Tutor Showcase
        </h3>
</div>
<p className="font-medium text-[13px] text-[#6B7280]">
        Select an accredited institutional leader to book your direct 45-minute bespoke strategy clinic.
      </p>
</div>
<span className="px-3 py-1 rounded-full bg-primary-fixed text-white-fixed font-bold text-[11px] font-semibold self-start sm:self-auto">
      Tier-1 PRO: 1 Credit per Clinic
    </span>
</div>
{/* 3 Rich Side-by-Side Tutor Profile Cards */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{tutors.map((tutor: any) => (
  <div
    key={tutor.id}
    className={`tutor-card ${activeTutor === tutor.id ? 'active-card border-[#1D4ED8] shadow-[0_8px_30px_rgba(0,0,0,0.04)]' : 'border-[#E5E7EB]'} bg-white p-4 md:p-6 rounded-[24px] border-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between gap-4 cursor-pointer transition-all hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)]`}
    onClick={() => setActiveTutor(tutor.id)}
  >
    <div className="flex flex-col gap-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <img className="w-14 h-14 rounded-[24px] object-cover shadow-[0_4px_20px_rgba(0,0,0,0.03)] ring-2 ring-primary-container/20" data-alt={tutor.name} src="https://lh3.googleusercontent.com/aida-public/AB6AXuArMvPkJ1mf9VIcTm_Du5zbD1YUMOs8CDd8x0QRDjtPVmWGekuPixbtLqjfAOlZeV63H7uE7AadbJx-HTi5AXm-UtTl7Tp8piRqqU2TrBwxyngXkCwOviI1EPZn-b0KNVZor3Ct6e5UsGEZwbv0A7avVVK8V8BbLRuv7zN5zouqd1YlACf3-qTNAJAZU1Tmohdli-K5TMwt0CZnJKVScEZpP2H5ZseJAYcZQsHEeABP-ahOkeOEmaFUhA" />
          <div className="flex flex-col">
            <span className="font-bold text-[16px] text-[#111827] font-bold leading-tight">{tutor.name}</span>
            <span className="text-label-sm font-label-sm text-[#6B7280] font-semibold">{tutor.title}</span>
            <span className="text-[11px] text-[#9CA3AF]">{tutor.subtitle}</span>
          </div>
        </div>
        <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${tutor.isOnline ? 'bg-[#ECFDF5] text-[#059669]' : 'bg-[#F3F4F6] text-[#9CA3AF]'}`}>
          {tutor.isOnline ? 'Online' : 'Offline'}
        </span>
      </div>
      <div className="flex items-center gap-1.5 text-label-md font-label-md">
        <span className="material-symbols-outlined text-[18px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
        <span className="font-bold text-[#111827]">{tutor.rating}</span>
        <span className="text-[#9CA3AF] font-normal">({tutor.reviews} completed 1-on-1 reviews)</span>
      </div>
      {/* Specialties Badges */}
      <div className="flex flex-wrap gap-1.5">
        {(tutor.tags || []).map((tag: string) => (
          <span key={tag} className="px-2 py-0.5 rounded bg-[#F3F4F6] text-[#111827] font-label-sm text-[11px]">{tag}</span>
        ))}
      </div>
      <div className="p-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB] text-label-sm font-label-sm flex flex-col gap-1">
        <span className="text-[#9CA3AF] uppercase font-semibold text-[10px] tracking-wider">Next Available Window</span>
        <div className="flex items-center gap-2 text-[#111827] font-semibold">
          <span className="material-symbols-outlined text-[15px] text-[#6B7280]">event_available</span>
          <span className="">{tutor.availability}</span>
        </div>
      </div>
    </div>
    <button className={`w-full py-2.5 rounded-lg font-bold text-[16px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all flex items-center justify-center gap-2 ${activeTutor === tutor.id ? 'bg-[#1D4ED8] text-white hover:bg-[#1e40af]' : 'bg-[#F3F4F6] text-[#1D4ED8] hover:bg-[#F3F4F6]-high'}`}>
      <span className="material-symbols-outlined text-[18px]">{activeTutor === tutor.id ? 'check_circle' : 'person_add'}</span>
      <span className="">{activeTutor === tutor.id ? 'Selected for 1-on-1' : 'Select for 1-on-1'}</span>
    </button>
  </div>
))}
</div>
{/* EXPANDING INSTANT BOOKING TRAY (Directly Below Selected Tutor) */}
<div className="bg-white p-4 md:p-6 rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] flex flex-col gap-4 transition-all duration-300" id="bookingTray">
<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 bg-[#F9FAFB] -mx-6 -mt-6 p-4 rounded-t-xl border-b border-[#E5E7EB]">
<div className="flex items-center gap-2">
<div className="w-10 h-10 rounded-lg bg-[#1D4ED8] text-white flex items-center justify-center">
<span className="material-symbols-outlined text-[22px]">calendar_today</span>
</div>
<div className="flex flex-col">
<span className="font-bold text-[16px] text-[#111827] font-bold">{activeTutorData?.name || '—'}</span>
<span className="font-bold text-[11px] text-[#6B7280] font-medium">{activeTutorData?.title || '—'}</span>
</div>
</div>
<div className="flex items-center gap-3">
<div className="flex items-center gap-1.5 text-body-sm font-body-sm text-[#111827]">
<span className="material-symbols-outlined text-[16px] text-[#6B7280]">verified</span>
<span className="">45-Min Private Zoom Clinic</span>
</div>
<span className="px-2.5 py-0.5 rounded bg-[#ECFDF5] text-[#059669] font-bold text-[11px] font-bold">
          1 Credit Required
        </span>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
{/* Date Picker (4 Cols) */}
<div className="lg:col-span-4 flex flex-col gap-2">
<label className="font-bold text-[13px] text-[#111827] font-semibold">1. Select Target Date</label>
<div className="grid grid-cols-5 gap-1.5">
  {[
    { day: 'Mon', date: '21' },
    { day: 'Tue', date: '22' },
    { day: 'Wed', date: '23' },
    { day: 'Thu', date: '24' },
    { day: 'Fri', date: '25' },
  ].map((d) => (
    <button 
      key={d.date}
      onClick={() => setSelectedDate(`${d.day} ${d.date}`)}
      className={`date-pick-btn flex flex-col items-center justify-center p-2 rounded-lg font-bold text-[13px] transition-colors border ${
        selectedDate === `${d.day} ${d.date}`
          ? 'bg-[#1D4ED8] text-white shadow-xs border-[#1D4ED8]'
          : 'bg-[#F8FAFC] text-[#111827] hover:bg-[#F3F4F6] border-[#E5E7EB]'
      }`}
    >
      <span className={`text-[10px] uppercase ${selectedDate === `${d.day} ${d.date}` ? 'font-bold text-white' : 'text-[#9CA3AF]'}`}>{d.day}</span>
      <span className="text-headline-md font-bold">{d.date}</span>
    </button>
  ))}
</div>
<span className="text-[11px] text-[#9CA3AF] pt-1">All slots adjusted to London / UTC time.</span>
</div>
{/* Time Slot Selector (4 Cols) */}
<div className="lg:col-span-4 flex flex-col gap-2">
<label className="font-bold text-[13px] text-[#111827] font-semibold">2. Select Available Slot (45m)</label>
<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
  {['10:00 AM GMT', '11:30 AM GMT', '02:00 PM GMT', '04:30 PM GMT'].map((time) => (
    <button 
      key={time}
      onClick={() => setSelectedTime(time)}
      className={`slot-pick-btn px-3 py-2 rounded-lg font-bold text-[13px] font-medium text-center transition-colors border ${
        selectedTime === time
          ? 'bg-[#1D4ED8] text-white border-[#1D4ED8] shadow-xs font-semibold'
          : 'bg-[#F8FAFC] text-[#111827] hover:bg-[#F3F4F6] border-[#E5E7EB]'
      }`}
    >
      {time}
    </button>
  ))}
</div>
<span className="text-[11px] text-[#6B7280] flex items-center gap-1 pt-1">
<span className="material-symbols-outlined text-[14px]">bolt</span>
        Instant calendar hold confirmed upon booking
      </span>
</div>
{/* Session Goal Note & CTA Button (4 Cols) */}
<div className="lg:col-span-4 flex flex-col gap-2 justify-between">
<div className="flex flex-col gap-1">
<label className="font-bold text-[13px] text-[#111827] font-semibold" htmlFor="bookingGoalInput">
          3. Session Goal / Trade Journal Notes
        </label>
<textarea className="w-full p-2.5 rounded-lg bg-white text-[#111827] font-medium text-[13px] border border-[#E5E7EB] focus:outline-none focus:ring-2 focus:ring-primary-container" id="bookingGoalInput" placeholder="Outline specific setup, pair (e.g. EUR/USD), or psychology block to dissect..." rows={2}></textarea>
</div>
<button disabled={isBooking} className="w-full py-2.5 rounded-lg bg-[#1D4ED8] text-white font-bold text-[16px] hover:bg-[#1e40af] transition-all shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-center gap-2 disabled:opacity-70" onClick={handleBookMeeting}>
{isBooking ? (
  <span className="material-symbols-outlined text-[18px] animate-spin">refresh</span>
) : (
  <span className="material-symbols-outlined text-[18px]">verified</span>
)}
<span className="">{isBooking ? 'Processing...' : 'Book 45-Min meeting'}</span>
</button>
</div>
</div>
</div>
</section>
</div>
        </GatedContent>
      </div>
    </div>
  )
}
