import React from "react";
import Image from "next/image";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { GatedContent } from "../components/GatedContent";
import { getBadges } from "../achievements/actions";

export default async function TraderPassportPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) } catch {}
        }
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  let profile = { full_name: "Trader", id: "00000" };
  let highestTier = 0; // Default to 0 (No package)
  let packageName = "None";
  let propAllocation = "$0 USD";
  let totalStudyTimeHrs = 0;
  let modulesCleared = 0;
  let totalModules = 0;
  let coursesCompleted = 0;
  let totalCourses = 1;

  if (user) {
    const { data: p } = await supabase.from('users').select('full_name, id').eq('id', user.id).single();
    if (p) profile = p;

    const { data: purchases } = await supabase
      .from('package_purchases')
      .select('package:packages!package_id(id, name, funded_account_size, display_order)')
      .eq('user_id', user.id);
      
    if (purchases && purchases.length > 0) {
      let maxOrder = 0;
      let activePackage = null;
      for (const p of purchases) {
        const pkg: any = Array.isArray(p.package) ? p.package[0] : p.package;
        if (pkg && pkg.display_order > maxOrder) {
          maxOrder = pkg.display_order;
          activePackage = pkg;
        }
      }
      if (activePackage) {
        highestTier = activePackage.display_order;
        packageName = activePackage.name;
        if (activePackage.funded_account_size === 'SIZE_10K') propAllocation = '$10,000 USD';
        else if (activePackage.funded_account_size === 'SIZE_25K') propAllocation = '$25,000 USD';
        else if (activePackage.funded_account_size === 'SIZE_100K') propAllocation = '$100,000 USD';
      }
    }

    const { data: allModules } = await supabase
      .from('academy_modules')
      .select(`
        id, title, package_tier_required,
        episodes:academy_episodes(id, duration_seconds)
      `);
      
    const { data: userProgress } = await supabase
      .from('academy_progress')
      .select('*')
      .eq('user_id', user.id);

    if (allModules) {
      totalModules = allModules.filter(m => highestTier >= m.package_tier_required).length;
      totalCourses = 1; // Assuming 1 main course for now

      let completedModulesCount = 0;
      let totalSeconds = 0;

      for (const mod of allModules) {
        if (highestTier < mod.package_tier_required) continue;
        
        let modCompleted = true;
        if (mod.episodes.length === 0) modCompleted = false;

        for (const ep of mod.episodes) {
          const p = userProgress?.find(up => up.episode_id === ep.id);
          if (p) {
            totalSeconds += p.progress_seconds || 0;
            if (!p.is_completed) modCompleted = false;
          } else {
            modCompleted = false;
          }
        }
        if (modCompleted) completedModulesCount++;
      }
      
      modulesCleared = completedModulesCount;
      totalStudyTimeHrs = parseFloat((totalSeconds / 3600).toFixed(1));
      if (modulesCleared === totalModules && totalModules > 0) coursesCompleted = 1;
    }
  }
  const badgeRes = await getBadges();
  const unlockedIds = badgeRes.success ? badgeRes.badges : [];

  if (highestTier === 0) {
    return (
      <div className="flex-1 w-full h-full flex flex-col items-center justify-center py-20 px-4">
        <div className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200 text-center max-w-lg w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">account_balance_wallet</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">No Trading Account Found</h2>
          <p className="text-slate-500 mb-6 text-sm">
            You currently do not have an active trading account or purchased package. Please request an account from the terminal or wait for an admin to assign one to you.
          </p>
          <a href="/dashboard/business" className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-[24px] font-bold hover:bg-blue-700 transition-colors">
            <span className="material-symbols-outlined text-[20px]">shopping_cart</span>
            View Packages
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 w-full h-full">
      <div className="flex flex-col w-full h-full">
        <div className="flex flex-col gap-gutter-lg w-full max-w-7xl mx-auto">
          <div className="relative overflow-hidden rounded-[24px] bg-surface-container-lowest p-gutter-lg shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
            <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-tertiary/5 blur-3xl pointer-events-none"></div>
            <div className="relative z-10 flex flex-col xl:flex-row gap-gutter-xl items-start justify-between">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-gutter-md flex-1">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative flex items-center justify-center text-white text-2xl md:text-4xl font-bold tracking-tight">
                    {profile.full_name.substring(0, 1).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-2 -right-2 bg-primary-container text-on-primary rounded-full p-1 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">
                      verified
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display-lg text-headline-xl sm:text-display-lg text-on-surface tracking-tight">
                      @{profile.full_name.replace(/\s+/g, '_')}
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm uppercase font-semibold">
                      Tier {highestTier} · {highestTier >= 3 ? 'Elite Trader' : highestTier >= 2 ? 'Pro Trader' : 'Starter Trader'}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm uppercase">
                      UID #{profile.id.substring(0, 8)}
                    </span>
                  </div>
                  <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-[18px] text-primary">
                      account_balance_wallet
                    </span>
                    <span className="">
                      Allocated Portfolio:{" "}
                      <strong className="font-headline-md text-on-surface">
                        {propAllocation}
                      </strong>{" "}
                      (Active Risk Desk)
                    </span>
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 py-1 px-2.5 rounded-lg bg-surface-container-low max-w-fit">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">
                      fingerprint
                    </span>
                    <span className="font-label-sm text-label-sm text-on-surface-variant font-mono truncate max-w-xs sm:max-w-md">
                      SHA256: {profile.id.replace(/-/g, '')}
                    </span>
                    <span className="px-1.5 py-0.5 rounded bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                      Audited by Sentry 4.4
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap sm:flex-nowrap xl:flex-col gap-2 w-full xl:w-auto shrink-0 justify-end">
                <button className="flex-1 xl:flex-initial flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary-container text-on-primary font-headline-md text-body-sm shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:bg-primary transition-all">
                  <span className="material-symbols-outlined text-[18px]">
                    workspace_premium
                  </span>
                  <span className="">Request Capital Scale-Up ($200K)</span>
                </button>
                <div className="flex gap-2 flex-1 xl:flex-initial">
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-headline-md text-label-md hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[16px]">
                      picture_as_pdf
                    </span>
                    <span className="">Audited PDF</span>
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container-high text-on-surface font-headline-md text-label-md hover:bg-surface-variant transition-colors">
                    <span className="material-symbols-outlined text-[16px]">
                      share
                    </span>
                    <span className="">Public Verification</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-6 pt-6 bg-surface-container-low/60 p-4 rounded-[24px]">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Passport Score
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-metric-display text-metric-display text-primary">
                    842
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    / 1000
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-0.5 font-semibold">
                  Top 4.2% Firm-wide
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Rule Adherence
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-metric-display text-metric-display text-on-surface">
                    98.4%
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-0.5">
                  Strict Risk Adherence
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Risk Containment
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-metric-display text-metric-display text-secondary">
                    A+
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">
                  Institutional Grade
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Historical Max DD
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-metric-display text-metric-display text-on-surface">
                    3.82%
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-outline mt-0.5">
                  Limit Cap: 8.00%
                </span>
              </div>
              <div className="flex flex-col col-span-2 md:col-span-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Profit Factor
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-metric-display text-metric-display text-tertiary">
                    2.68
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-0.5 font-semibold">
                  +0.42 vs 30D avg
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-lg">
            <div className="lg:col-span-7 flex flex-col h-full relative">
              <GatedContent
                isComponent
                minPackageRequired={2}
                blurLevel="md"
                customMessage="Quantitative profiling is unlocked in Package 2."
              >
                <div className="flex flex-col rounded-[24px] bg-surface-container-lowest p-gutter-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex flex-col">
                      <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                        Quantitative Profile
                      </span>
                      <h2 className="font-headline-lg text-headline-lg text-on-surface">
                        6-Axis Execution Radar
                      </h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                      Benchmark: L4 Master
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                    <div className="flex justify-center p-2">
                      <svg
                        className="w-64 h-64 overflow-visible"
                        viewBox="0 0 240 240"
                      >
                        <polygon
                          className="text-surface-container-high"
                          fill="none"
                          points="120,20 206,70 206,170 120,220 34,170 34,70"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        ></polygon>
                        <polygon
                          className="text-surface-container-high"
                          fill="none"
                          points="120,45 185,82 185,158 120,195 55,158 55,82"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        ></polygon>
                        <polygon
                          className="text-surface-container-high"
                          fill="none"
                          points="120,70 163,95 163,145 120,170 77,145 77,95"
                          stroke="currentColor"
                          strokeDasharray="3 3"
                          strokeWidth="1.5"
                        ></polygon>
                        <line
                          className="text-surface-container-high"
                          stroke="currentColor"
                          strokeWidth="1"
                          x1="120"
                          x2="120"
                          y1="120"
                          y2="20"
                        ></line>
                        <line
                          className="text-surface-container-high"
                          stroke="currentColor"
                          strokeWidth="1"
                          x1="120"
                          x2="206"
                          y1="120"
                          y2="70"
                        ></line>
                        <line
                          className="text-surface-container-high"
                          stroke="currentColor"
                          strokeWidth="1"
                          x1="120"
                          x2="206"
                          y1="120"
                          y2="170"
                        ></line>
                        <line
                          className="text-surface-container-high"
                          stroke="currentColor"
                          strokeWidth="1"
                          x1="120"
                          x2="120"
                          y1="120"
                          y2="220"
                        ></line>
                        <line
                          className="text-surface-container-high"
                          stroke="currentColor"
                          strokeWidth="1"
                          x1="120"
                          x2="34"
                          y1="120"
                          y2="170"
                        ></line>
                        <line
                          className="text-surface-container-high"
                          stroke="currentColor"
                          strokeWidth="1"
                          x1="120"
                          x2="34"
                          y1="120"
                          y2="70"
                        ></line>
                        <polygon
                          fill="rgba(26, 86, 219, 0.18)"
                          points="120,26 201,76 198,165 120,211 46,157 41,75"
                          stroke="#1a56db"
                          strokeWidth="2.5"
                        ></polygon>
                        <circle
                          className="fill-primary"
                          cx="120"
                          cy="26"
                          r="4"
                        ></circle>
                        <circle
                          className="fill-primary"
                          cx="201"
                          cy="76"
                          r="4"
                        ></circle>
                        <circle
                          className="fill-primary"
                          cx="198"
                          cy="165"
                          r="4"
                        ></circle>
                        <circle
                          className="fill-primary"
                          cx="120"
                          cy="211"
                          r="4"
                        ></circle>
                        <circle
                          className="fill-primary"
                          cx="46"
                          cy="157"
                          r="4"
                        ></circle>
                        <circle
                          className="fill-primary"
                          cx="41"
                          cy="75"
                          r="4"
                        ></circle>
                        <text
                          className="fill-on-surface text-[10px] font-medium tracking-wide"
                          textAnchor="middle"
                          x="120"
                          y="12"
                        >
                          RISK (94)
                        </text>
                        <text
                          className="fill-on-surface text-[10px] font-medium tracking-wide"
                          textAnchor="start"
                          x="214"
                          y="68"
                        >
                          CONSIST. (88)
                        </text>
                        <text
                          className="fill-on-surface text-[10px] font-medium tracking-wide"
                          textAnchor="start"
                          x="214"
                          y="174"
                        >
                          RECOVERY (91)
                        </text>
                        <text
                          className="fill-on-surface text-[10px] font-medium tracking-wide"
                          textAnchor="middle"
                          x="120"
                          y="234"
                        >
                          EXPECT. (92)
                        </text>
                        <text
                          className="fill-on-surface text-[10px] font-medium tracking-wide"
                          textAnchor="end"
                          x="26"
                          y="174"
                        >
                          JOURNAL (86)
                        </text>
                        <text
                          className="fill-on-surface text-[10px] font-medium tracking-wide"
                          textAnchor="end"
                          x="26"
                          y="68"
                        >
                          NEWS RESTRAINT (95)
                        </text>
                      </svg>
                    </div>
                    <div className="flex flex-col gap-2.5 pl-0 sm:pl-2">
                      <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-tertiary"></span>
                          <span className="font-body-sm text-body-sm text-on-surface font-medium">
                            News Event Restraint
                          </span>
                        </div>
                        <span className="font-headline-md text-label-md text-tertiary">
                          95 / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary"></span>
                          <span className="font-body-sm text-body-sm text-on-surface font-medium">
                            Disciplined Risk Factor
                          </span>
                        </div>
                        <span className="font-headline-md text-label-md text-primary">
                          94 / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary-container"></span>
                          <span className="font-body-sm text-body-sm text-on-surface font-medium">
                            Trade Expectancy
                          </span>
                        </div>
                        <span className="font-headline-md text-label-md text-primary-container">
                          92 / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-secondary"></span>
                          <span className="font-body-sm text-body-sm text-on-surface font-medium">
                            Drawdown Recovery Index
                          </span>
                        </div>
                        <span className="font-headline-md text-label-md text-secondary">
                          91 / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-surface-tint"></span>
                          <span className="font-body-sm text-body-sm text-on-surface font-medium">
                            Execution Consistency
                          </span>
                        </div>
                        <span className="font-headline-md text-label-md text-on-surface">
                          88 / 100
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-surface-container-low">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-outline"></span>
                          <span className="font-body-sm text-body-sm text-on-surface font-medium">
                            Journal Diligence
                          </span>
                        </div>
                        <span className="font-headline-md text-label-md text-outline">
                          86 / 100
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </GatedContent>
            </div>
            <div className="lg:col-span-5 flex flex-col h-full relative">
              <GatedContent
                isComponent
                minPackageRequired={2}
                blurLevel="md"
                customMessage="Behavioral auditing is unlocked in Package 2."
              >
                <div className="flex flex-col rounded-[24px] bg-surface-container-lowest p-gutter-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)] justify-between h-full">
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col">
                        <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                          AI Copilot Diagnostic
                        </span>
                        <h2 className="font-headline-lg text-headline-lg text-on-surface">
                          Behavioral Audit
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-tertiary-fixed text-on-tertiary-fixed font-label-sm text-label-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse"></span>
                        <span className="">Online Engine</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface-variant">
                            Overtrading Bias
                          </span>
                          <span className="font-label-sm text-label-sm font-semibold text-tertiary">
                            Nominal · 0 Violations
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          Maintains an average of 2.1 trades/day with zero
                          impulse spikes observed over 90 consecutive trading
                          days.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface-variant">
                            Revenge Trading Propensity
                          </span>
                          <span className="font-label-sm text-label-sm font-semibold text-tertiary">
                            0.0% · Immaculate
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          Mandatory cool-off window respected post-loss. Lot
                          sizing remains invariant following negative sessions.
                        </p>
                      </div>
                      <div className="p-3 rounded-lg bg-surface-container-low flex flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <span className="font-label-md text-label-md text-on-surface-variant">
                            Optimal Performance Window
                          </span>
                          <span className="font-label-sm text-label-sm font-semibold text-primary">
                            London Open (08:00 - 11:30 GMT)
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface">
                          Win rate elevates to 76.8% with 3.10 Sharpe during
                          London session execution vs 51% in Asian crossover.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 pt-3 flex items-center justify-between bg-surface-container-high/40 p-3 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[20px] text-tertiary">
                        psychology
                      </span>
                      <span className="font-label-md text-label-md text-on-surface">
                        Psychological Fatigue Risk:
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm uppercase font-bold text-tertiary bg-surface-container-lowest px-2 py-0.5 rounded">
                      Minimal (0.04 Index)
                    </span>
                  </div>
                </div>
              </GatedContent>
            </div>
          </div>
          <div className="flex flex-col rounded-[24px] bg-surface-container-lowest p-gutter-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Institutional Growth Track
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  Capital Allocation Pathway
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Next Stage Target:
                </span>
                <span className="px-2.5 py-1 rounded-md bg-primary-fixed text-on-primary-fixed font-headline-md text-body-sm font-bold">
                  {highestTier >= 6 ? 'Max Allocation Reached' : `$${[10, 25, 100, 200, 500, 1000][highestTier]}K Allocation`}
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
              {[
                { t: 1, val: '$10,000', label: 'Starter' },
                { t: 2, val: '$25,000', label: 'Growth' },
                { t: 3, val: '$100,000', label: 'Pro' },
                { t: 4, val: '$200,000', label: 'Elite' },
                { t: 5, val: '$500,000', label: 'Master' },
                { t: 6, val: '$1,000,000', label: 'Sovereign' }
              ].map(tier => {
                const isCleared = highestTier > tier.t;
                const isActive = highestTier === tier.t;
                const isNext = highestTier + 1 === tier.t;
                const isLocked = tier.t > highestTier + 1;

                if (isCleared || isActive) {
                  return (
                    <div key={tier.t} className={`flex flex-col p-3 rounded-lg ${isActive ? 'bg-primary text-on-primary shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative overflow-hidden' : 'bg-surface-container-low'}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className={`font-label-sm text-label-sm ${isActive ? 'text-primary-fixed uppercase tracking-wider' : 'text-outline'}`}>
                          Tier {tier.t}
                        </span>
                        {isActive ? (
                          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-ping"></span>
                        ) : (
                          <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                        )}
                      </div>
                      <span className={`font-headline-md text-headline-md ${isActive ? 'text-on-primary font-bold' : 'text-on-surface'}`}>
                        {tier.val}
                      </span>
                      <span className={`font-label-sm text-label-sm mt-1 ${isActive ? 'text-primary-fixed font-semibold' : 'text-tertiary'}`}>
                        {isActive ? 'Active Desk' : `${tier.label} · Cleared`}
                      </span>
                    </div>
                  );
                }

                if (isNext) {
                  return (
                    <div key={tier.t} className="flex flex-col p-3 rounded-lg bg-surface-container-high relative">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-label-sm text-label-sm text-outline">Tier {tier.t}</span>
                        <span className="font-label-sm text-label-sm font-bold text-primary">0%</span>
                      </div>
                      <span className="font-headline-md text-headline-md text-on-surface">{tier.val}</span>
                      <span className="font-label-sm text-label-sm text-primary mt-1 font-medium">In Qualification</span>
                      <div className="w-full bg-surface-container-lowest h-1.5 rounded-full mt-2 overflow-hidden">
                        <div className="bg-primary h-full rounded-full" style={{ width: "0%" }}></div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={tier.t} className="flex flex-col p-3 rounded-lg bg-surface-container-low opacity-60">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-label-sm text-label-sm text-outline">Tier {tier.t}</span>
                      <span className="material-symbols-outlined text-[16px] text-outline">lock</span>
                    </div>
                    <span className="font-headline-md text-headline-md text-outline">{tier.val}</span>
                    <span className="font-label-sm text-label-sm text-outline mt-1">{tier.label} Desk</span>
                  </div>
                );
              })}
            </div>
            <div className="bg-surface-container-low p-4 rounded-[24px]">
              <div className="flex items-center justify-between mb-3">
                <span className="font-headline-md text-headline-md text-on-surface">
                  Criteria Checklist to $200k Allocation
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Evaluation Cycle #3 (38 / 60 Days)
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      10% Profit Target
                    </span>
                    <span className="font-label-sm text-label-sm text-primary font-bold">
                      82.4% Complete
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-1.5">
                    <span className="font-headline-md text-headline-md text-on-surface">
                      $8,240
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      / $10,000
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full rounded-full"
                      style={{ width: "82.4%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Min Trading Days
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold">
                      Satisfied
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-1.5">
                    <span className="font-headline-md text-headline-md text-on-surface">
                      38 Days
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      / 30 Days min
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary h-full rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
                <div className="flex flex-col p-3 rounded-lg bg-surface-container-lowest">
                  <div className="flex items-center justify-between">
                    <span className="font-label-sm text-label-sm text-outline uppercase">
                      Zero Daily DD Breaches
                    </span>
                    <span className="font-label-sm text-label-sm text-tertiary font-bold">
                      Flawless
                    </span>
                  </div>
                  <div className="flex items-baseline gap-1 my-1.5">
                    <span className="font-headline-md text-headline-md text-on-surface">
                      0 Breaches
                    </span>
                    <span className="font-body-sm text-body-sm text-outline">
                      (Max Day 1.4%)
                    </span>
                  </div>
                  <div className="w-full bg-surface-container-low h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-tertiary h-full rounded-full"
                      style={{ width: "100%" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col rounded-[24px] bg-surface-container-lowest p-gutter-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                    Academic Telemetry &amp; Education Tracker
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-primary/5 text-primary font-label-sm text-label-sm font-semibold uppercase">
                    LMS Integration
                  </span>
                </div>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  Elora Academy • Curriculum Telemetry
                </h2>
              </div>
              <a
                className="flex items-center gap-1 text-primary font-headline-md text-label-md hover:underline"
                href="#"
                data-path="academy"
              >
                <span className="">View Academy LMS</span>
                <span className="material-symbols-outlined text-[16px]">
                  arrow_forward
                </span>
              </a>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6 bg-surface-container-low/60 p-4 rounded-[24px]">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Total Study Time
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-metric-display text-metric-display text-primary">
                    {totalStudyTimeHrs}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    hrs
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-0.5 font-semibold">
                  Tracked via Player
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Courses Completed
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-metric-display text-metric-display text-on-surface">
                    {coursesCompleted}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    / {totalCourses} Courses
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-primary mt-0.5 font-medium">
                  {totalCourses > 0 ? Math.floor((coursesCompleted/totalCourses)*100) : 0}% Completion Rate
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Modules Cleared
                </span>
                <div className="flex items-baseline gap-1.5 mt-1">
                  <span className="font-metric-display text-metric-display text-on-surface">
                    {modulesCleared}
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    / {totalModules}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-0.5 font-semibold">
                  {totalModules > 0 ? Math.floor((modulesCleared/totalModules)*100) : 0}% Syllabus Done
                </span>
              </div>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Quiz Average
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-metric-display text-metric-display text-secondary">
                    94.6%
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-0.5 font-semibold">
                  Top 4% Distinction
                </span>
              </div>
              <div className="flex flex-col col-span-2 md:col-span-1">
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Active Streak
                </span>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="font-metric-display text-metric-display text-tertiary">
                    19
                  </span>
                  <span className="font-label-sm text-label-sm text-outline">
                    Days
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-tertiary mt-0.5 font-semibold">
                  Peak Consistency
                </span>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col p-4 rounded-[24px] bg-surface-container-low hover:bg-surface-container-high/60 transition-all border-none">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        verified
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-label-md text-on-surface font-semibold">
                        1. Price Action &amp; Market Structure
                      </h3>
                      <span className="font-body-sm text-body-sm text-outline">
                        18 of 18 Lessons Cleared
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm uppercase font-semibold">
                    Completed
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-tertiary h-full rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 text-label-sm text-outline font-label-sm">
                  <span className="">Institutional Diploma Issued</span>
                  <span className="font-mono text-tertiary font-semibold">
                    ACAD-PA-100
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-4 rounded-[24px] bg-surface-container-low hover:bg-surface-container-high/60 transition-all border-none">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        verified
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-label-md text-on-surface font-semibold">
                        2. Order Flow &amp; Liquidity Pools
                      </h3>
                      <span className="font-body-sm text-body-sm text-outline">
                        12 of 12 Lessons Cleared
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-tertiary-container text-on-tertiary font-label-sm text-label-sm uppercase font-semibold">
                    Completed
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-tertiary h-full rounded-full"
                    style={{ width: "100%" }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 text-label-sm text-outline font-label-sm">
                  <span className="">Institutional Diploma Issued</span>
                  <span className="font-mono text-tertiary font-semibold">
                    ACAD-OF-204
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-4 rounded-[24px] bg-surface-container-low hover:bg-surface-container-high/60 transition-all border-none">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        play_circle
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-label-md text-on-surface font-semibold">
                        3. Technical Analysis &amp; Risk Mgmt
                      </h3>
                      <span className="font-body-sm text-body-sm text-primary font-medium">
                        Lesson 3.4 Support &amp; Resistance (16/25)
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm uppercase font-semibold">
                    64% Active
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "64%" }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 text-label-sm text-outline font-label-sm">
                  <span className="">Est. Completion: 4 Days</span>
                  <span className="text-primary font-semibold hover:underline cursor-pointer">
                    Continue Lesson →
                  </span>
                </div>
              </div>
              <div className="flex flex-col p-4 rounded-[24px] bg-surface-container-low hover:bg-surface-container-high/60 transition-all border-none">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[20px]">
                        psychology
                      </span>
                    </div>
                    <div>
                      <h3 className="font-headline-md text-label-md text-on-surface font-semibold">
                        4. Trader Psychology &amp; Behavioral Mindset
                      </h3>
                      <span className="font-body-sm text-body-sm text-on-surface-variant">
                        10 of 14 Lessons Cleared
                      </span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-label-sm uppercase font-semibold">
                    71% In-Progress
                  </span>
                </div>
                <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-secondary h-full rounded-full"
                    style={{ width: "71%" }}
                  ></div>
                </div>
                <div className="flex items-center justify-between mt-3 pt-2 text-label-sm text-outline font-label-sm">
                  <span className="">Next: Overcoming Recency Bias</span>
                  <span className="text-secondary font-semibold hover:underline cursor-pointer">
                    Review Notes
                  </span>
                </div>
              </div>
            </div>
            <div className="p-4 rounded-[24px] bg-surface-container-low flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px]">
                    workspace_premium
                  </span>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-headline-md text-label-md text-on-surface font-bold">
                      Institutional Master Trader Accreditation
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold">
                      75% Reached
                    </span>
                  </div>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">
                    Requires completion of Technical Analysis &amp; Trader
                    Psychology modules to unlock final institutional clearance.
                  </span>
                </div>
              </div>
              <div className="w-full sm:w-48 shrink-0 flex flex-col gap-1">
                <div className="flex justify-between text-label-sm text-outline font-label-sm">
                  <span className="">Progress</span>
                  <span className="text-primary font-bold">75%</span>
                </div>
                <div className="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-col rounded-[24px] bg-surface-container-lowest p-gutter-lg shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">
                  Verifiable Credentials
                </span>
                <h2 className="font-headline-lg text-headline-lg text-on-surface">
                  Unlocked Milestones & Badges
                </h2>
              </div>
              <button className="flex items-center gap-1 text-primary font-headline-md text-label-md hover:underline">
                <span className="">View Public Blockchain Registry</span>
                <span className="material-symbols-outlined text-[16px]">
                  open_in_new
                </span>
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {(() => {
                const allBadges = [
                  {
                    id: "FIRST_WATCH",
                    name: "First Watch",
                    desc: "Watched your first educational video.",
                    icon: "play_circle",
                    color: "#1D4ED8",
                    premium: false,
                  },
                  {
                    id: "MODULE_ONE",
                    name: "Module One",
                    desc: "Completed the first learning module in Academy.",
                    icon: "check_circle",
                    color: "#8B5CF6",
                    premium: false,
                  },
                  {
                    id: "FIRST_BLOOD",
                    name: "First Blood",
                    desc: "Executed your first simulated trade on the desk.",
                    icon: "water_drop",
                    color: "#EF4444",
                    premium: false,
                  },
                  {
                    id: "FIRST_PROFIT",
                    name: "First Profit",
                    desc: "Closed your first profitable trade execution.",
                    icon: "trending_up",
                    color: "#059669",
                    premium: false,
                  },
                  {
                    id: "FUNDAMENTAL",
                    name: "Fundamental Analyst",
                    desc: "Executed a trade during a macro news event release.",
                    icon: "newspaper",
                    color: "#F59E0B",
                    premium: false,
                  },
                  {
                    id: "SWING_TRADER",
                    name: "Swing Trader",
                    desc: "Held a position open for more than 24 hours.",
                    icon: "timeline",
                    color: "#3B82F6",
                    premium: false,
                  },
                  {
                    id: "SCALPER",
                    name: "Scalper",
                    desc: "Opened and closed a trade within 15 minutes.",
                    icon: "bolt",
                    color: "#EC4899",
                    premium: false,
                  },
                  {
                    id: "NETWORK_BUILDER",
                    name: "Network Builder",
                    desc: "Referred your first member to the business.",
                    icon: "group_add",
                    color: "#10B981",
                    premium: false,
                  },
                  {
                    id: "FIRST_PAYOUT",
                    name: "First Payout",
                    desc: "Successfully processed your first withdrawal.",
                    icon: "account_balance_wallet",
                    color: "#F59E0B",
                    premium: true,
                  },
                ];
                const unlockedBadges = allBadges.filter((b) =>
                  unlockedIds.includes(b.id),
                );

                if (unlockedBadges.length === 0) {
                  return (
                    <div className="col-span-full p-6 text-center bg-surface-container-low rounded-[24px] border border-dashed border-outline-variant">
                      <span className="material-symbols-outlined text-outline text-[32px] mb-2">
                        lock
                      </span>
                      <p className="font-body-sm text-body-sm text-on-surface-variant">
                        You have not unlocked any badges yet.
                      </p>
                      <p className="font-body-sm text-body-sm text-primary mt-1 hover:underline cursor-pointer">
                        Visit the Academy to get started.
                      </p>
                    </div>
                  );
                }

                return unlockedBadges.map((badge, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col p-4 rounded-[24px] ${badge.premium ? "bg-gradient-to-b from-[#FEF3C7] to-white border border-[#F59E0B] shadow-[0_8px_30px_rgba(0,0,0,0.04)]" : "bg-surface-container-low hover:bg-surface-container-high transition-all border border-transparent"} cursor-default group relative`}
                  >
                    {badge.premium && (
                      <div className="absolute inset-0 rounded-[24px] shadow-[0_0_15px_rgba(245,158,11,0.3)] pointer-events-none"></div>
                    )}
                    <div
                      className={`w-12 h-12 rounded-lg text-white flex items-center justify-center mb-3 group-hover:scale-105 transition-transform relative`}
                      style={{ backgroundColor: badge.color }}
                    >
                      <span className="material-symbols-outlined text-[26px]">
                        {badge.icon}
                      </span>
                      {badge.premium && (
                        <span className="absolute -top-1 -right-1 text-[16px]">
                          ✨
                        </span>
                      )}
                    </div>
                    <span
                      className={`font-headline-md text-headline-md ${badge.premium ? "text-[#D97706]" : "text-on-surface"}`}
                    >
                      {badge.name}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                      {badge.desc}
                    </span>
                    <div className="mt-4 pt-3 flex items-center justify-between">
                      <span className="font-label-sm text-label-sm text-outline font-mono">
                        {badge.id}
                      </span>
                      <span className="font-label-sm text-label-sm text-tertiary font-semibold">
                        UNLOCKED
                      </span>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
