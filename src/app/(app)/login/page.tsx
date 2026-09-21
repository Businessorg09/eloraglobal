'use client';
import { signInAction } from '@/app/auth/actions';
import Link from 'next/link';

import { useFormState, useFormStatus } from 'react-dom';
import React, { useState } from 'react';

function SubmitButton({ text }: { text: string }) {
  const { pending } = useFormStatus()
  return (
    <button type="submit" disabled={pending} className="w-full h-13 py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-headline-md text-headline-md font-bold tracking-tight shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group">
      {pending ? 'Processing...' : text}
      {!pending && <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>}
    </button>
  )
}

const initialState = {
  error: '',
}

export default function LoginPage() {
  const [activeTab, setActiveTab] = useState('business');
  const [showPassword, setShowPassword] = useState(false);
  const [state, formAction] = useFormState(signInAction, initialState);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-surface-container-lowest/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
<div className="h-header-height w-full px-4 md:px-gutter-lg flex items-center justify-between">
  <div className="flex items-center gap-4 md:gap-gutter-lg">
    <Link href="/" className="flex items-center gap-2 md:gap-gutter-sm">
      <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shrink-0">
        <span className="material-symbols-outlined text-on-primary text-[20px]">account_balance</span>
      </div>
      <div className="flex flex-col">
        <span className="font-headline-md text-[1rem] md:text-headline-md text-on-surface leading-tight tracking-tight font-bold">ELORA GLOBAL</span>
        <span className="hidden sm:block font-label-sm text-[0.6rem] md:text-label-sm text-on-surface-variant tracking-wider uppercase">Elora Academy Executive ID</span>
      </div>
    </Link>
    <div className="hidden lg:flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full bg-surface-container-low">
      <div className="w-2 h-2 rounded-full bg-tertiary animate-pulse"></div>
      <span className="font-label-sm text-label-sm text-tertiary font-semibold tracking-wide">All Systems Operational • ISO 27001 Certified</span>
    </div>
  </div>
  <div className="flex items-center gap-2 md:gap-gutter-md">
    <nav className="hidden md:flex items-center gap-gutter-xs">
      <Link href="/login" className="px-3 py-1.5 rounded-md hover:bg-surface-container-low transition">Sign In</Link>
      <Link href="/register" className="px-3 py-1.5 rounded-md hover:bg-surface-container-low transition">Executive Registration</Link>
    </nav>
    <div className="h-5 w-[1px] bg-surface-container-high hidden md:block"></div>
    <button className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors">
      <span className="material-symbols-outlined text-[18px]">language</span>
      <span className="font-label-md text-label-md uppercase tracking-wider">EN</span>
    </button>
    <Link href="#" className="hidden sm:flex items-center text-on-surface-variant hover:text-on-surface transition">
      <span className="material-symbols-outlined text-[18px]">contact_support</span>
    </Link>
    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
      <span className="material-symbols-outlined text-on-primary text-[18px]">person</span>
    </div>
  </div>
</div>
</header><main className="w-full pt-header-height bg-surface min-h-[calc(100vh-4rem)] flex flex-col"><div className="flex flex-col w-full">
<section className="relative w-full overflow-hidden bg-surface py-gutter-xl px-gutter-md lg:px-gutter-xl flex items-center justify-center min-h-[calc(100vh-4rem-3.5rem)]">
<div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
<div className="absolute bottom-0 right-0 w-[30rem] h-[30rem] rounded-full bg-secondary-container/5 blur-3xl pointer-events-none"></div>
<div className="w-full max-w-6xl mx-auto flex flex-col items-center">
<div className="flex flex-wrap items-center justify-center gap-gutter-sm mb-gutter-lg">
<div className="inline-flex items-center gap-gutter-xs px-gutter-sm py-gutter-xs rounded-full bg-surface-container shadow-sm">
<span className="material-symbols-outlined text-primary text-[18px]" style={{}}>shield_person</span>
<span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider font-semibold">Elora Global Enterprise Access</span>
<span className="w-1.5 h-1.5 rounded-full bg-outline-variant mx-gutter-xs"></span>
<span className="font-label-sm text-label-sm text-tertiary flex items-center gap-0.5">
<span className="material-symbols-outlined text-[14px]">lock</span>
            256-bit AES Validated
          </span>
</div>
</div>
<div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg w-full items-stretch">
<div className="lg:col-span-7 flex flex-col justify-between bg-surface-container-lowest p-gutter-lg md:p-gutter-xl rounded-xl shadow-sm relative overflow-hidden">
<div className="relative z-10">
<div className="flex flex-col mb-gutter-lg">
<span className="font-label-sm text-label-sm uppercase tracking-widest text-primary font-semibold">Central Workstation Entry</span>
<h1 className="font-headline-xl text-headline-xl text-on-surface mt-gutter-xs">Authorize Identity Credentials</h1>
<p className="font-body-md text-[16px] text-on-surface-variant mt-gutter-xs">Select your gateway to sync real-time binary trees or proceed to certified trader course modules.</p>
</div>
<div className="p-gutter-xs rounded-xl bg-surface-container-low flex flex-col sm:flex-row gap-gutter-xs mb-gutter-lg">
<button onClick={() => setActiveTab('business')} className={`flex-1 flex items-start gap-gutter-sm p-gutter-sm rounded-lg shadow-sm transition-all duration-200 text-left relative ${activeTab === 'business' ? 'bg-surface-container-lowest text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`} id="tab-affiliate" type="button">
<div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'business' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`} id="badge-affiliate">
<span className="material-symbols-outlined text-[20px]">account_tree</span>
</div>
<div className="flex flex-col min-w-0 pr-gutter-xs">
<span className="font-headline-md text-headline-md leading-tight text-on-surface flex items-center gap-1.5">
                    Affiliate &amp; Network
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'business' ? 'bg-primary' : 'bg-transparent'}`} id="dot-affiliate"></span>
</span>
<span className="font-label-sm text-label-sm text-on-surface-variant truncate mt-0.5">Binary Tree, Leg Vol &amp; E-Wallet</span>
</div>
</button>
<button onClick={() => setActiveTab('trading')} className={`flex-1 flex items-start gap-gutter-sm p-gutter-sm rounded-lg shadow-sm transition-all duration-200 text-left relative ${activeTab === 'trading' ? 'bg-surface-container-lowest text-on-surface' : 'text-on-surface-variant hover:text-on-surface'}`} id="tab-academy" type="button">
<div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${activeTab === 'trading' ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant'}`} id="badge-academy">
<span className="material-symbols-outlined text-[20px]">school</span>
</div>
<div className="flex flex-col min-w-0 pr-gutter-xs">
<span className="font-headline-md text-headline-md leading-tight text-on-surface flex items-center gap-1.5">
                    Elora Trading Academy
                    <span className={`w-1.5 h-1.5 rounded-full ${activeTab === 'trading' ? 'bg-primary' : 'bg-transparent'}`} id="dot-academy"></span>
</span>
<span className="font-label-sm text-label-sm text-on-surface-variant truncate mt-0.5">60-Day Workstation, Zooms &amp; Labs</span>
</div>
</button>
</div>

{state?.error && (
  <div className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-error/10 border border-error/20 text-error">
    <span className="material-symbols-outlined text-[18px]">error</span>
    <p className="font-label-md text-[13px] font-semibold">{state.error}</p>
  </div>
)}

<form action={formAction} className="flex flex-col gap-5">
<input type="hidden" name="destination" value={activeTab === 'business' ? '/dashboard' : '/trading'} />
<div className="flex flex-col gap-1.5">
<label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between" htmlFor="identifier-input" id="label-identifier">
<span className="">Distributor Node ID / Registered Email</span>
<span className="font-label-sm text-label-sm text-on-surface-variant font-normal" id="hint-identifier">Format: INFG0123 or Corporate Email</span>
</label>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-gutter-sm text-outline-variant text-[20px] pointer-events-none">badge</span>
<input className="w-full pl-10 pr-gutter-md py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-[16px] placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm" id="identifier-input" placeholder="e.g. INFG-90218 or name@domain.com" required type="text" name="identifier" />
</div>
</div>
<div className="flex flex-col gap-1.5">
<div className="flex items-center justify-between">
<label className="font-label-md text-label-md text-on-surface font-semibold" htmlFor="password-input">Master Security Passcode</label>
<Link href="#" className="text-blue-600 hover:text-blue-800 hover:underline font-label-md">Forgot passcode?</Link>
</div>
<div className="relative flex items-center">
<span className="material-symbols-outlined absolute left-gutter-sm text-outline-variant text-[20px] pointer-events-none">lock</span>
<input className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-surface-container-low text-on-surface font-body-md text-[16px] placeholder:text-outline focus:outline-none focus:bg-surface-container-lowest shadow-sm" id="password-input" placeholder="••••••••••••" required type={showPassword ? "text" : "password"} name="password" />
<button className="absolute right-gutter-sm text-outline-variant hover:text-on-surface flex items-center" type="button" onClick={() => setShowPassword(!showPassword)}>
<span className="material-symbols-outlined text-[18px]" id="pass-visibility-icon">{showPassword ? "visibility_off" : "visibility"}</span>
</button>
</div>
</div>
<div className="p-gutter-sm rounded-lg bg-surface-container flex items-center justify-between" id="sponsor-verify-wrapper">
<div className="flex items-center gap-gutter-xs">
<span className="material-symbols-outlined text-primary text-[18px]">verified_user</span>
<span className="font-body-sm text-body-sm text-on-surface">Auto-Sponsor Node Validation Active</span>
</div>
<span className="font-label-sm text-label-sm font-semibold text-tertiary uppercase">Leg L-01 Linked</span>
</div>
<div className="hidden p-gutter-sm rounded-lg bg-surface-container flex items-center justify-between" id="cohort-status-wrapper">
<div className="flex items-center gap-gutter-xs">
<span className="material-symbols-outlined text-tertiary-container text-[18px]">timer</span>
<span className="font-body-sm text-body-sm text-on-surface">60-Day Executive Accelerator: <strong className="font-semibold">Cohort 14B</strong></span>
</div>
<span className="px-gutter-xs py-0.5 rounded-full bg-surface-container-highest text-on-surface-variant font-label-sm text-label-sm">Day 23 / 60</span>
</div>
<div className="flex items-center justify-between pt-1">
<label className="flex items-center gap-gutter-xs cursor-pointer select-none">
<input defaultChecked className="w-4 h-4 rounded accent-primary text-on-primary" type="checkbox" />
<span className="font-body-sm text-body-sm text-on-surface-variant" id="remember-label">Remember Node ID on this terminal</span>
</label>
<div className="flex items-center gap-1 font-label-sm text-label-sm text-tertiary font-semibold">
<span className="material-symbols-outlined text-[16px]">verified</span>
<span className="">FIDO2 Ready</span>
</div>
</div>
<SubmitButton text="Sign In Securely" />
</form>
</div>
<div className="mt-gutter-lg pt-gutter-md flex flex-col sm:flex-row items-center justify-between gap-gutter-xs bg-surface-container-low -mx-gutter-lg md:-mx-gutter-xl -mb-gutter-lg md:-mb-gutter-xl px-gutter-lg md:px-gutter-xl py-gutter-sm">
<span className="font-body-sm text-body-sm text-on-surface-variant">New partner or enrolling scholar?</span>
<div className="flex items-center gap-gutter-sm">
<Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1">
                Register as Executive Partner
                <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
</Link>
<span className="text-outline-variant font-body-sm text-body-sm">•</span>
<Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold">Enroll in Academy</Link>
</div>
</div>
</div>
<div className="lg:col-span-5 flex flex-col gap-gutter-md justify-between"><div className="bg-surface-container-lowest p-gutter-lg md:p-gutter-xl rounded-xl shadow-sm flex flex-col justify-between h-full relative overflow-hidden border border-outline-variant/30"><div className="flex flex-col"><div className="flex items-center justify-between gap-gutter-sm mb-gutter-md"><div className="flex items-center gap-gutter-sm"><div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-sm shrink-0"><span className="material-symbols-outlined text-on-primary text-[22px]">account_balance</span></div><div className="flex flex-col"><span className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight">ELORA GLOBAL</span><span className="font-label-sm text-label-sm text-primary uppercase tracking-wider font-semibold">Institutional Ecosystem</span></div></div><div className="inline-flex items-center gap-1 px-gutter-xs py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-label-sm font-semibold"><span className="material-symbols-outlined text-[14px]">verified</span><span className="">Verified Entity</span></div></div><div className="mb-gutter-lg"><h2 className="font-headline-lg text-headline-lg text-on-surface leading-tight tracking-tight mb-gutter-xs">Empowering Global Entrepreneurs, Mastering Quantitative Markets</h2><p className="font-body-md text-[16px] text-on-surface-variant leading-relaxed">Elora Global is an elite multi-tier institutional enterprise integrating high-velocity decentralized affiliate network infrastructure with accredited quantitative financial trading education.</p></div><div className="flex flex-col gap-gutter-sm mb-gutter-md"><div className="p-gutter-sm rounded-lg bg-surface-container-low flex items-start gap-gutter-sm transition-all"><div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 mt-0.5"><span className="material-symbols-outlined text-[18px]">hub</span></div><div className="flex flex-col min-w-0 flex-1"><span className="font-headline-md text-[16px] font-semibold text-on-surface">Next-Gen Binary Commerce</span><p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-normal">Real-time downline volume calculation, automated multi-currency e-wallet settlements, and transparent matrix governance.</p></div></div><div className="p-gutter-sm rounded-lg bg-surface-container-low flex items-start gap-gutter-sm transition-all"><div className="w-8 h-8 rounded-lg bg-secondary-container/10 text-secondary flex items-center justify-center shrink-0 mt-0.5"><span className="material-symbols-outlined text-[18px]">school</span></div><div className="flex flex-col min-w-0 flex-1"><span className="font-headline-md text-[16px] font-semibold text-on-surface">Institutional Trading Academy</span><p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-normal">60-day intensive algorithmic curricula, ISO-standard accredited certifications, and proctored live market trading desks.</p></div></div><div className="p-gutter-sm rounded-lg bg-surface-container-low flex items-start gap-gutter-sm transition-all"><div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 mt-0.5"><span className="material-symbols-outlined text-[18px]">security</span></div><div className="flex flex-col min-w-0 flex-1"><span className="font-headline-md text-[16px] font-semibold text-on-surface">Global Compliance &amp; Escrow</span><p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-normal">Operating strictly under statutory fintech standards, global direct selling regulatory frameworks, and 256-bit cryptographic security.</p></div></div></div></div><div className="pt-gutter-sm border-t border-surface-container-high flex items-center justify-between font-label-sm text-label-sm text-on-surface-variant"><div className="flex items-center gap-1 text-primary font-semibold"><span className="material-symbols-outlined text-[16px]">corporate_fare</span><span className="">Executive Division</span></div><div className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px] text-tertiary">shield</span><span className="">Tier-1 Governance Active</span></div></div></div></div>
</div>
<div className="mt-gutter-xl w-full flex flex-col md:flex-row items-center justify-between gap-gutter-md pt-gutter-md text-on-surface-variant font-label-sm text-label-sm">
<div className="flex items-center gap-gutter-sm">
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-tertiary text-[16px]">verified</span>
<span className="">ISO/IEC 17024 Accredited</span>
</div>
<span className="">•</span>
<div className="flex items-center gap-1">
<span className="material-symbols-outlined text-primary text-[16px]">lock_clock</span>
<span className="">256-bit TLS v1.3 Cipher Suite</span>
</div>
<span className="">•</span>
<span className="">Zero-Knowledge Downline Telemetry</span>
</div>
<div className="flex items-center gap-gutter-md">
<Link href="#">Incident Disclosure</Link>
<Link href="#">Server Infrastructure Nodes</Link>
<Link href="#">IT Service Status</Link>
</div>
</div>
</div>
</section>

</div></main><footer className="w-full bg-surface-container-low py-gutter-md"><div className="w-full px-gutter-lg flex flex-col sm:flex-row items-center justify-between gap-gutter-sm"><div className="flex items-center gap-gutter-sm text-on-surface-variant font-body-sm text-body-sm">© 2024 Elora Global Enterprise Services &amp; Academy. All Rights Reserved.</div><div className="flex items-center gap-gutter-md"><Link href="#">Security Governance</Link><Link href="#">Terms of Service</Link><Link href="#">Privacy &amp; Compliance</Link></div></div></footer>
    </>
  );
}
