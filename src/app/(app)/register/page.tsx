
'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref') || ''
  const plParam = searchParams.get('pl')
  const srcParam = searchParams.get('src') || 'OTHER'
  const refLeg = plParam === '1' ? 'L' : plParam === '2' ? 'R' : 'AUTO'

  const [formState, setFormState] = useState({
    fullName: '',
    email: '',
    phone: '',
    country: 'IN',
    username: '',
    password: '',
    sponsorCode: refCode.toUpperCase(),
    legChoice: refLeg as 'L' | 'R' | 'AUTO',
    agreeTerms: false,
    agreeAcademy: false,
  })

  const [sponsorStatus, setSponsorStatus] = useState<'idle' | 'verifying' | 'verified' | 'invalid'>('idle')
  const [sponsorInfo, setSponsorInfo] = useState<{ name: string; code: string; rank: string } | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Password strength
  const getStrength = (pwd: string) => {
    let score = 0
    if (pwd.length >= 8) score++
    if (/[A-Z]/.test(pwd)) score++
    if (/[0-9]/.test(pwd)) score++
    if (/[^A-Za-z0-9]/.test(pwd)) score++
    return score
  }
  const strength = getStrength(formState.password)
  const strengthLabel = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'][strength]
  const strengthColor = ['', 'bg-error', 'bg-yellow-500', 'bg-tertiary', 'bg-tertiary'][strength]

  const handleChange = (field: string, value: any) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const verifySponsor = useCallback(async () => {
    if (!formState.sponsorCode.trim()) return
    setSponsorStatus('verifying')
    setSponsorInfo(null)
    try {
      const res = await fetch(`/api/user/verify-sponsor?code=${encodeURIComponent(formState.sponsorCode.trim().toUpperCase())}`)
      if (res.ok) {
        const data = await res.json()
        setSponsorInfo({
          name: data.full_name || data.username || 'Verified Member',
          code: data.referral_code,
          rank: data.rank || 'Member',
        })
        setSponsorStatus('verified')
      } else {
        setSponsorStatus('invalid')
      }
    } catch {
      setSponsorStatus('invalid')
    }
  }, [formState.sponsorCode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formState.agreeTerms || !formState.agreeAcademy) {
      setError('Please accept all agreements to continue.')
      return
    }
    if (sponsorStatus !== 'verified' && formState.sponsorCode.trim()) {
      setError('Please verify your sponsor code before submitting.')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formState.email,
          password: formState.password,
          fullName: formState.fullName,
          username: formState.username.toLowerCase().trim(),
          phone: formState.phone,
          referredBy: sponsorInfo?.code || formState.sponsorCode.trim().toUpperCase() || null,
          referredPosition: formState.legChoice,
          country: formState.country,
          source: srcParam,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Registration failed. Please try again.')
      } else {
        setSuccess(true)
        // Auto login after registration
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formState.email, password: formState.password }),
        })
        if (loginRes.ok) {
          router.push('/dashboard')
        } else {
          router.push('/login?registered=1')
        }
      }
    } catch (err: any) {
      setError('Network error. Please check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

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
</header>

      <main className="w-full pt-header-height bg-surface min-h-screen flex flex-col">
        <div className="relative w-full overflow-hidden">
          <div className="absolute -top-32 -left-20 w-96 h-96 bg-primary-fixed/40 rounded-full blur-3xl pointer-events-none -z-10"></div>
          <div className="absolute top-80 -right-24 w-96 h-96 bg-surface-container-high/60 rounded-full blur-3xl pointer-events-none -z-10"></div>

          <div className="w-full px-gutter-lg pt-gutter-xl pb-gutter-md max-w-7xl mx-auto flex flex-col items-center text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high text-primary mb-4 shadow-sm">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              <span className="font-label-sm text-label-sm uppercase tracking-wider">Official Institutional Onboarding Portal</span>
              <span className="text-outline-variant">•</span>
              <span className="font-label-sm text-label-sm font-bold text-tertiary">ISO/IEC 27001</span>
            </div>
            <h1 className="font-display-lg text-display-lg text-on-surface tracking-tight max-w-3xl">
              Executive Affiliate Partner — <span className="text-primary">Institutional Registration</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mt-2">
              Register your global enterprise distributor node. All institutional Elora Academy trading curricula and workstation access are unlocked upon partner package activation.
            </p>
            <div className="mt-4 flex items-center gap-6 text-on-surface-variant font-label-sm text-label-sm flex-wrap justify-center">
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>Instant Node Allocation</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary"></span>SEBI / Global Compliance Ready</span>
              <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>256-Bit Escrow Vault</span>
            </div>
          </div>

          {/* Main Form Shell */}
          <div className="w-full max-w-5xl mx-auto px-gutter-lg pb-gutter-xl">
            <div className="bg-surface-container-lowest rounded-xl shadow-lg p-6 sm:p-10">
              <div className="flex items-center justify-between pb-4 border-b border-surface-container-low mb-6">
                <div>
                  <span className="font-label-sm text-label-sm text-primary tracking-wider uppercase font-bold">Partner Registration Dossier</span>
                  <h2 className="font-headline-xl text-headline-xl text-on-surface mt-0.5">Create Your Executive Account</h2>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-container-low rounded-full">
                  <span className="material-symbols-outlined text-[16px] text-tertiary">lock</span>
                  <span className="font-label-sm text-label-sm font-semibold text-on-surface">256-Bit Encrypted</span>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-error/10 border border-error/20 flex items-start gap-2 text-error">
                  <span className="material-symbols-outlined text-[18px] mt-0.5 flex-shrink-0">error</span>
                  <p className="font-body-sm text-body-sm">{error}</p>
                </div>
              )}

              {success && (
                <div className="mb-4 p-4 rounded-xl bg-tertiary/10 border border-tertiary/20 flex items-center gap-3 text-tertiary">
                  <span className="material-symbols-outlined text-[24px]">check_circle</span>
                  <div>
                    <p className="font-label-md font-bold">Registration Successful!</p>
                    <p className="font-body-sm">Redirecting you to your dashboard...</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                {/* --- SPONSOR CODE SECTION --- */}
                <div className="p-5 rounded-xl bg-surface-container-low border border-surface-container-high/40">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                      <span className="material-symbols-outlined text-[20px]">link</span>
                    </div>
                    <div>
                      <span className="font-headline-md text-[14px] text-on-surface font-bold">Sponsor / Referral Code</span>
                      <p className="font-label-sm text-label-sm text-on-surface-variant">Enter the referral code of the person who invited you</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                    <div className="sm:col-span-8 flex flex-col gap-1">
                      <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                        <span>Affiliation / Sponsor Code</span>
                        <span className={`font-label-sm text-label-sm font-semibold flex items-center gap-1 ${
                          sponsorStatus === 'verified' ? 'text-tertiary' :
                          sponsorStatus === 'invalid' ? 'text-error' :
                          sponsorStatus === 'verifying' ? 'text-primary' : 'text-outline'
                        }`}>
                          <span className="material-symbols-outlined text-[13px]">
                            {sponsorStatus === 'verified' ? 'check_circle' :
                             sponsorStatus === 'invalid' ? 'cancel' :
                             sponsorStatus === 'verifying' ? 'hourglass_empty' : 'hourglass_empty'}
                          </span>
                          {sponsorStatus === 'verified' ? 'Verified ✓' :
                           sponsorStatus === 'invalid' ? 'Code Not Found' :
                           sponsorStatus === 'verifying' ? 'Verifying...' : 'Pending Verification'}
                        </span>
                      </label>
                      <div className="relative">
                        <input
                          name="sponsorCode"
                          className={`w-full h-11 px-3.5 pl-10 pr-4 rounded-lg bg-surface-container-lowest text-on-surface font-mono font-bold text-[16px] focus:outline-none focus:ring-2 shadow-sm uppercase tracking-wider transition-all ${
                            sponsorStatus === 'verified' ? 'focus:ring-tertiary/30 ring-1 ring-tertiary/30' :
                            sponsorStatus === 'invalid' ? 'focus:ring-error/30 ring-1 ring-error/30' : 'focus:ring-primary/30'
                          }`}
                          type="text"
                          value={formState.sponsorCode}
                          onChange={e => { handleChange('sponsorCode', e.target.value.toUpperCase()); setSponsorStatus('idle'); setSponsorInfo(null); }}
                          placeholder="e.g. ELR-90218"
                        />
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">badge</span>
                      </div>
                    </div>
                    <div className="sm:col-span-4">
                      <button
                        id="btn-verify-sponsor"
                        type="button"
                        disabled={sponsorStatus === 'verifying' || !formState.sponsorCode.trim()}
                        onClick={verifySponsor}
                        className="w-full h-11 px-3 rounded-lg bg-primary hover:bg-primary-container disabled:opacity-50 disabled:cursor-not-allowed text-on-primary font-label-md text-label-md font-bold transition-all shadow-sm flex items-center justify-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {sponsorStatus === 'verifying' ? 'hourglass_empty' : 'published_with_changes'}
                        </span>
                        {sponsorStatus === 'verifying' ? 'Verifying...' : 'Verify Code'}
                      </button>
                    </div>
                  </div>

                  {/* Verified Sponsor Card */}
                  {sponsorStatus === 'verified' && sponsorInfo && (
                    <div className="mt-3 p-3 rounded-lg bg-tertiary/5 border border-tertiary/20 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full bg-tertiary/20 flex items-center justify-center text-tertiary font-bold text-sm">
                          {sponsorInfo.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-headline-md text-[13px] text-on-surface font-bold">{sponsorInfo.name}</span>
                            <span className="material-symbols-outlined text-tertiary text-[15px]">verified</span>
                            <span className="px-1.5 py-0.5 rounded bg-tertiary/10 text-tertiary font-label-sm text-[10px] font-bold uppercase">{sponsorInfo.rank}</span>
                          </div>
                          <span className="font-label-sm text-label-sm text-on-surface-variant">Code: <span className="font-mono font-semibold text-on-surface">{sponsorInfo.code}</span></span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                        Active
                      </div>
                    </div>
                  )}

                  {/* Leg Placement (Hidden from User) */}
                  <input type="hidden" name="referral_leg" value={formState.legChoice} />
                </div>

                {/* --- PERSONAL DETAILS --- */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                      Full Legal Name <span className="text-error font-normal text-body-sm">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        name="fullName"
                        type="text"
                        placeholder="e.g. Vikramaditya Singhania"
                        value={formState.fullName}
                        onChange={e => handleChange('fullName', e.target.value)}
                        className="w-full h-11 px-3.5 pl-10 rounded-lg bg-surface text-on-surface font-body-md text-[16px] focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm placeholder:text-outline"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">badge</span>
                    </div>
                  </div>

                  {/* Username */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                      Username <span className="text-error font-normal text-body-sm">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        name="username"
                        type="text"
                        placeholder="e.g. vikram_s"
                        value={formState.username}
                        onChange={e => handleChange('username', e.target.value.toLowerCase().replace(/\s/g, ''))}
                        className="w-full h-11 px-3.5 pl-10 rounded-lg bg-surface text-on-surface font-body-md text-[16px] focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm placeholder:text-outline"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">alternate_email</span>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                      Official Email Address <span className="text-error font-normal text-body-sm">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        name="email"
                        type="email"
                        placeholder="v.singhania@enterprise.com"
                        value={formState.email}
                        onChange={e => handleChange('email', e.target.value)}
                        className="w-full h-11 px-3.5 pl-10 rounded-lg bg-surface text-on-surface font-body-md text-[16px] focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm placeholder:text-outline"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">mail</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="flex flex-col gap-1.5">
                    <label className="font-label-md text-label-md text-on-surface font-semibold flex items-center justify-between">
                      Mobile / WhatsApp Number <span className="text-error font-normal text-body-sm">*</span>
                    </label>
                    <div className="relative">
                      <input
                        required
                        name="phone"
                        type="tel"
                        placeholder="98765 43210"
                        value={formState.phone}
                        onChange={e => handleChange('phone', e.target.value)}
                        className="w-full h-11 px-3.5 pl-10 rounded-lg bg-surface text-on-surface font-body-md text-[16px] focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm placeholder:text-outline"
                      />
                      <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">smartphone</span>
                    </div>
                  </div>
                </div>

                {/* Country */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">Jurisdiction / Country</label>
                  <div className="relative">
                    <select
                      name="country"
                      value={formState.country}
                      onChange={e => handleChange('country', e.target.value)}
                      className="w-full h-11 px-3.5 pl-10 pr-8 rounded-lg bg-surface text-on-surface font-body-md text-[16px] focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="IN">India (IN +91)</option>
                      <option value="AE">United Arab Emirates (AE +971)</option>
                      <option value="SG">Singapore (SG +65)</option>
                      <option value="MY">Malaysia (MY +60)</option>
                      <option value="GB">United Kingdom (GB +44)</option>
                      <option value="US">United States (US +1)</option>
                    </select>
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">public</span>
                    <span className="material-symbols-outlined absolute right-2.5 top-3 text-on-surface-variant text-[18px] pointer-events-none">expand_more</span>
                  </div>
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="font-label-md text-label-md text-on-surface font-semibold">
                    Master Encryption Password <span className="text-error font-normal text-body-sm">*</span>
                  </label>
                  <div className="relative">
                    <input
                      required
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••••••"
                      value={formState.password}
                      onChange={e => handleChange('password', e.target.value)}
                      className="w-full h-11 px-3.5 pl-10 pr-10 rounded-lg bg-surface text-on-surface font-body-md text-[16px] focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-sm"
                    />
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-on-surface-variant text-[20px]">key</span>
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-2.5 text-on-surface-variant hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                    </button>
                  </div>
                  {/* Strength Meter */}
                  {formState.password && (
                    <div className="mt-1 flex flex-col gap-1">
                      <div className="grid grid-cols-4 gap-1.5 h-1.5">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`rounded-full transition-colors duration-300 ${i <= strength ? strengthColor : 'bg-surface-container-high'}`}></div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm">
                        <span>Minimum 8 characters with 1 special symbol</span>
                        <span className="font-semibold text-primary">{strengthLabel}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Agreements */}
                <div className="flex flex-col gap-3 pt-1">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      className="mt-0.5 h-4 w-4 rounded accent-primary"
                      required
                      type="checkbox"
                      checked={formState.agreeTerms}
                      onChange={e => handleChange('agreeTerms', e.target.checked)}
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                      I expressly agree to the <span className="text-primary font-semibold">Direct Selling Consumer Protection Guidelines 2021</span> and commit to the <span className="text-primary font-semibold">Elora Enterprise Code of Conduct</span>.
                    </span>
                  </label>
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input
                      className="mt-0.5 h-4 w-4 rounded accent-primary"
                      required
                      type="checkbox"
                      checked={formState.agreeAcademy}
                      onChange={e => handleChange('agreeAcademy', e.target.checked)}
                    />
                    <span className="font-body-sm text-body-sm text-on-surface-variant group-hover:text-on-surface transition-colors">
                      I understand that mandatory <span className="text-on-surface font-semibold">60-Day Elora Academy access</span>, competitive exams, and simulated margin sandboxes are activated upon selecting an affiliate package in the portal.
                    </span>
                  </label>
                </div>

                {/* Submit */}
                <div className="pt-2 flex flex-col gap-3">
                  <button
                    type="submit"
                    disabled={submitting || success}
                    className="w-full h-13 py-3.5 px-6 rounded-lg bg-primary hover:bg-primary-container disabled:opacity-60 disabled:cursor-not-allowed text-on-primary font-headline-md text-headline-md font-bold tracking-tight shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group"
                  >
                    {submitting ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                        Processing...
                      </>
                    ) : success ? (
                      <>
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        Registration Complete!
                      </>
                    ) : (
                      <>
                        Complete Registration &amp; Proceed to Dashboard
                        <span className="material-symbols-outlined text-[20px] transition-transform group-hover:translate-x-1">arrow_forward</span>
                      </>
                    )}
                  </button>
                  <div className="flex items-center justify-center gap-6 text-on-surface-variant font-label-sm text-label-sm flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-tertiary">lock</span> SSL 256-bit Encrypted
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-primary">verified</span> ISO 9001:2015 Standard
                    </span>
                  </div>
                </div>
              </form>

              {/* Sign In Footer */}
              <div className="pt-5 border-t border-surface-container-high/40 flex flex-col sm:flex-row items-center justify-between gap-3 mt-2">
                <span className="font-body-sm text-body-sm text-on-surface-variant">Already a Partner or Student?</span>
                <Link href="/login" className="flex items-center gap-1.5 text-primary font-label-md text-label-md font-semibold hover:underline">
                  <span className="material-symbols-outlined text-[16px]">login</span>
                  Sign In to Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <footer className="w-full bg-surface-container-low py-gutter-md">
        <div className="w-full px-gutter-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-on-surface-variant font-body-sm text-body-sm">© 2024 Elora Global Enterprise Services &amp; Academy. All Rights Reserved.</span>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors">Terms of Service</Link>
            <Link href="#" className="text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm transition-colors">Privacy &amp; Compliance</Link>
          </div>
        </div>
      </footer>
    </>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-surface"><span className="material-symbols-outlined animate-spin text-primary text-[40px]">progress_activity</span></div>}>
      <RegisterForm />
    </Suspense>
  )
}
