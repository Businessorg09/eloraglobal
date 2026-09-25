'use client';

import { useState, useRef, useEffect } from 'react';

type SimSummary = {
  totalActiveNodes: number;
  totalQualifiedNodes: number;
  totalBinaryPayoutPaise: number;
  totalBvConsumed: number;
  totalMilestoneBonusPaise: number;
  totalRankBonusPaise: number;
  grandTotalPayoutPaise: number;
};

type BinaryLedgerRow = {
  userId: string; userName: string; userEmail: string; rank: string;
  leftBv: number; rightBv: number; leftCarryover: number; rightCarryover: number;
  totalLeftBv: number; totalRightBv: number; weakerSide: number; strongerSide: number;
  weakerSidePct: number; matchableBv: number; matchedPairs: number;
  rawIncomePaise: number; afterWeeklyCapPaise: number; afterCycleLimitPaise: number;
  finalIncomePaise: number; bvConsumed: number; newLeftCarryover: number;
  newRightCarryover: number; isCycleComplete: boolean; qualified: boolean;
  disqualifyReason: string | null;
};

type MilestoneLedgerRow = {
  userId: string; userName: string; userEmail: string;
  currentLifetimePairs: number; newLifetimePairs: number;
  daysElapsed: number; milestoneHit: number; bonusPaise: number;
};

type RankLedgerRow = {
  userId: string; userName: string; userEmail: string;
  previousRank: string; newRank: string; qualificationBv: number;
  activeDirectCount: number; isPromotion: boolean; rankBonusPaise: number;
  rankBonusDetails: { rank: string; amountPaise: number }[];
};

type SimData = {
  generatedAt: string;
  summary: SimSummary;
  binaryMatchingLedger: BinaryLedgerRow[];
  milestoneLedger: MilestoneLedgerRow[];
  rankLedger: RankLedgerRow[];
};

const DAYS = ['MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY'];
const RANK_COLORS: Record<string, string> = {
  STARTER: 'text-outline', BRONZE: 'text-amber-600', SILVER: 'text-slate-400',
  GOLD: 'text-yellow-400', PLATINUM: 'text-cyan-400', DIAMOND: 'text-blue-400',
  CROWN: 'text-purple-400', AMBASSADOR: 'text-rose-400'
};

function fmt(p: number) { return `₹${(p / 100).toLocaleString('en-IN', { maximumFractionDigits: 2 })}` }
function fmtBv(v: number) { return v.toLocaleString('en-IN') }

export default function CronClientWrapper({
  totalActiveNodes, qualifiableNodes,
  totalUnsettledLeftBv, totalUnsettledRightBv,
  projectedPayout, schedule, lastRun
}: {
  totalActiveNodes: number;
  qualifiableNodes: number;
  totalUnsettledLeftBv: number;
  totalUnsettledRightBv: number;
  projectedPayout: number;
  schedule: { closingDay: string; closingTime: string };
  lastRun: { timestamp: string; processedNodes: number; disbursedAmount: number } | null;
}) {
  const [activeTab, setActiveTab] = useState<'binary' | 'milestone' | 'rank'>('binary');
  const [simData, setSimData] = useState<SimData | null>(null);
  const [simLoading, setSimLoading] = useState(false);
  const [simSearch, setSimSearch] = useState('');

  const [cronRunning, setCronRunning] = useState(false);
  const [cronLogs, setCronLogs] = useState<{ msg: string; type: 'info' | 'success' | 'error' | 'warn' }[]>([
    { msg: `System ready. IST: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}`, type: 'info' },
    { msg: 'Awaiting manual trigger or scheduled execution...', type: 'info' }
  ]);
  const logRef = useRef<HTMLDivElement>(null);

  const [selDay, setSelDay] = useState(schedule.closingDay);
  const [selTime, setSelTime] = useState(schedule.closingTime);
  const [scheduleSaving, setScheduleSaving] = useState(false);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [cronLogs]);

  function addLog(msg: string, type: 'info' | 'success' | 'error' | 'warn' = 'info') {
    const ts = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setCronLogs(prev => [...prev, { msg: `[${ts}] ${msg}`, type }]);
  }

  async function handleSimulate() {
    setSimLoading(true);
    setSimData(null);
    try {
      const res = await fetch('/api/admin/cron/simulate', { method: 'POST' });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setSimData(data);
    } catch (e: any) {
      alert('Simulation failed: ' + e.message);
    } finally {
      setSimLoading(false);
    }
  }

  async function handleRunCron() {
    if (!confirm('⚠️ This will EXECUTE the weekly binary matching and credit wallets. Are you sure?')) return;
    setCronRunning(true);
    addLog('🚀 Manual override initiated. Acquiring snapshot lock...', 'info');
    addLog('Fetching all active binary nodes...', 'info');
    try {
      const res = await fetch('/api/admin/binary-matching/run', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cron failed');
      addLog(`✅ Processing complete!`, 'success');
      addLog(`   → Nodes processed: ${data.processedNodes}`, 'success');
      addLog(`   → Total disbursed: ${fmt(data.disbursedAmount)}`, 'success');
      addLog(`   → Wallets updated. Ledger journals recorded.`, 'success');
      addLog('Daemon cluster synchronized. Run complete.', 'info');
    } catch (e: any) {
      addLog(`❌ ERROR: ${e.message}`, 'error');
    } finally {
      setCronRunning(false);
    }
  }

  async function handleSaveSchedule() {
    setScheduleSaving(true);
    try {
      const res = await fetch('/api/admin/cron/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ closingDay: selDay, closingTime: selTime })
      });
      if (!res.ok) throw new Error(await res.text());
      alert(`✅ Schedule saved! Auto-run every ${selDay} at ${selTime} IST.`);
    } catch (e: any) {
      alert('Failed to save schedule: ' + e.message);
    } finally {
      setScheduleSaving(false);
    }
  }

  // Filter helpers
  const binaryRows = simData?.binaryMatchingLedger.filter(r =>
    !simSearch || r.userName?.toLowerCase().includes(simSearch.toLowerCase()) || r.userEmail?.toLowerCase().includes(simSearch.toLowerCase())
  ) ?? [];
  const milestoneRows = simData?.milestoneLedger.filter(r =>
    !simSearch || r.userName?.toLowerCase().includes(simSearch.toLowerCase())
  ) ?? [];
  const rankRows = simData?.rankLedger.filter(r =>
    !simSearch || r.userName?.toLowerCase().includes(simSearch.toLowerCase())
  ) ?? [];

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-surface-container-lowest shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[22px]">precision_manufacturing</span>
            </div>
            <div>
              <h1 className="font-headline-xl text-xl font-bold text-on-surface">Cron Engine & Settlement Ledger</h1>
              <p className="text-xs text-on-surface-variant">Simulate, verify and execute weekly binary matching payouts</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSimulate}
            disabled={simLoading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-on-secondary font-bold text-sm shadow transition-all hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{simLoading ? 'sync' : 'calculate'}</span>
            {simLoading ? 'Simulating...' : 'Run Simulation (Dry Run)'}
          </button>
          <button
            onClick={handleRunCron}
            disabled={cronRunning}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-on-primary font-bold text-sm shadow transition-all hover:bg-secondary disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">{cronRunning ? 'sync' : 'play_circle'}</span>
            {cronRunning ? 'Executing...' : 'Execute Cron Now'}
          </button>
        </div>
      </div>

      {/* ── Live Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Nodes', value: totalActiveNodes.toLocaleString(), icon: 'hub', color: 'text-primary' },
          { label: 'Qualifiable Nodes', value: qualifiableNodes.toLocaleString(), icon: 'check_circle', color: 'text-tertiary' },
          { label: 'Total Unsettled L-BV', value: fmtBv(totalUnsettledLeftBv), icon: 'arrow_back', color: 'text-blue-400' },
          { label: 'Total Unsettled R-BV', value: fmtBv(totalUnsettledRightBv), icon: 'arrow_forward', color: 'text-purple-400' },
        ].map(c => (
          <div key={c.label} className="p-4 rounded-xl bg-surface-container-lowest shadow-sm flex flex-col gap-1">
            <span className="text-[10px] uppercase font-bold text-outline tracking-wider">{c.label}</span>
            <div className="flex items-center gap-2">
              <span className={`material-symbols-outlined text-[18px] ${c.color}`}>{c.icon}</span>
              <span className="font-bold text-lg text-on-surface">{c.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ── Projected Payout Banner ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5 rounded-2xl bg-gradient-to-r from-primary/10 to-tertiary/10 border border-primary/20">
        <div>
          <span className="text-xs font-bold uppercase text-outline tracking-wider block mb-1">Projected Binary Payout (Live Estimate)</span>
          <span className="text-3xl font-extrabold text-on-surface">{fmt(projectedPayout)}</span>
          <span className="text-xs text-on-surface-variant ml-2">based on current BV if cron runs now</span>
        </div>
        {lastRun && (
          <div className="text-right text-xs text-on-surface-variant">
            <span className="block font-semibold text-on-surface">Last Run</span>
            <span>{new Date(lastRun.timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</span>
            <span className="block text-tertiary font-bold">{fmt(lastRun.disbursedAmount)} disbursed to {lastRun.processedNodes} nodes</span>
          </div>
        )}
      </div>

      {/* ── Simulation Results ── */}
      {(simLoading || simData) && (
        <div className="flex flex-col gap-4 p-5 rounded-2xl bg-surface-container-lowest shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="font-bold text-lg text-on-surface">📊 Simulation Results — Dry Run</h2>
              {simData && (
                <p className="text-xs text-on-surface-variant">
                  Generated at {new Date(simData.generatedAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })} IST
                </p>
              )}
            </div>
            {simData && (
              <input
                type="text"
                placeholder="Search by name / email..."
                value={simSearch}
                onChange={e => setSimSearch(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-sm border border-surface-container-high outline-none focus:border-primary"
              />
            )}
          </div>

          {simLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined animate-spin text-primary">sync</span>
              <span className="text-sm">Calculating simulation across all nodes...</span>
            </div>
          )}

          {simData && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-primary/10 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-primary">Binary Payout</span>
                  <span className="font-extrabold text-on-surface text-lg">{fmt(simData.summary.totalBinaryPayoutPaise)}</span>
                  <span className="text-xs text-on-surface-variant">{simData.summary.totalQualifiedNodes}/{simData.summary.totalActiveNodes} nodes qualified</span>
                </div>
                <div className="p-3 rounded-xl bg-tertiary/10 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-tertiary">Milestone Bonuses</span>
                  <span className="font-extrabold text-on-surface text-lg">{fmt(simData.summary.totalMilestoneBonusPaise)}</span>
                  <span className="text-xs text-on-surface-variant">{simData.milestoneLedger.length} bonuses to award</span>
                </div>
                <div className="p-3 rounded-xl bg-secondary/10 flex flex-col gap-0.5">
                  <span className="text-[10px] uppercase font-bold text-secondary">Rank Bonuses</span>
                  <span className="font-extrabold text-on-surface text-lg">{fmt(simData.summary.totalRankBonusPaise)}</span>
                  <span className="text-xs text-on-surface-variant">{simData.rankLedger.filter(r => r.isPromotion).length} promotions</span>
                </div>
                <div className="p-3 rounded-xl bg-surface-container flex flex-col gap-0.5 border border-primary/30">
                  <span className="text-[10px] uppercase font-bold text-outline">Grand Total Outflow</span>
                  <span className="font-extrabold text-primary text-xl">{fmt(simData.summary.grandTotalPayoutPaise)}</span>
                  <span className="text-xs text-on-surface-variant">BV consumed: {fmtBv(simData.summary.totalBvConsumed)}</span>
                </div>
              </div>

              {/* Tab switcher */}
              <div className="flex gap-1 p-1 rounded-xl bg-surface-container w-fit">
                {([
                  { key: 'binary', label: `Binary Matching (${simData.binaryMatchingLedger.length})`, icon: 'account_tree' },
                  { key: 'milestone', label: `Milestone Bonus (${simData.milestoneLedger.length})`, icon: 'emoji_events' },
                  { key: 'rank', label: `Rank Bonus (${simData.rankLedger.length})`, icon: 'workspace_premium' },
                ] as const).map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === t.key ? 'bg-primary text-on-primary shadow' : 'text-on-surface-variant hover:text-on-surface'}`}
                  >
                    <span className="material-symbols-outlined text-[14px]">{t.icon}</span>
                    {t.label}
                  </button>
                ))}
              </div>

              {/* ── TABLE 1: Binary Matching ── */}
              {activeTab === 'binary' && (
                <div className="overflow-x-auto rounded-xl border border-surface-container">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="bg-surface-container text-outline uppercase text-[10px] tracking-wider">
                        <th className="px-3 py-2.5 text-left sticky left-0 bg-surface-container z-10">#</th>
                        <th className="px-3 py-2.5 text-left sticky left-6 bg-surface-container z-10 min-w-[140px]">Member</th>
                        <th className="px-3 py-2.5 text-left">Rank</th>
                        <th className="px-3 py-2.5 text-right">L-BV</th>
                        <th className="px-3 py-2.5 text-right">R-BV</th>
                        <th className="px-3 py-2.5 text-right">L-Carry</th>
                        <th className="px-3 py-2.5 text-right">R-Carry</th>
                        <th className="px-3 py-2.5 text-right">Total L</th>
                        <th className="px-3 py-2.5 text-right">Total R</th>
                        <th className="px-3 py-2.5 text-right">Weaker %</th>
                        <th className="px-3 py-2.5 text-right">Match BV</th>
                        <th className="px-3 py-2.5 text-right">Pairs</th>
                        <th className="px-3 py-2.5 text-right">Raw ₹</th>
                        <th className="px-3 py-2.5 text-right">Wk Cap ₹</th>
                        <th className="px-3 py-2.5 text-right">5x Cap ₹</th>
                        <th className="px-3 py-2.5 text-right font-bold text-on-surface">Final ₹</th>
                        <th className="px-3 py-2.5 text-right">BV Used</th>
                        <th className="px-3 py-2.5 text-right">L-Fwd</th>
                        <th className="px-3 py-2.5 text-right">R-Fwd</th>
                        <th className="px-3 py-2.5 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {binaryRows.length === 0 && (
                        <tr><td colSpan={20} className="text-center py-8 text-on-surface-variant text-xs">No binary nodes found</td></tr>
                      )}
                      {binaryRows.map((row, i) => (
                        <tr key={row.userId} className={`transition-colors hover:bg-surface-container/50 ${!row.qualified ? 'opacity-60' : ''}`}>
                          <td className="px-3 py-2 sticky left-0 bg-surface-container-lowest text-outline">{i + 1}</td>
                          <td className="px-3 py-2 sticky left-6 bg-surface-container-lowest min-w-[140px]">
                            <span className="font-semibold text-on-surface block truncate max-w-[130px]">{row.userName || '—'}</span>
                            <span className="text-outline text-[10px] truncate max-w-[130px] block">{row.userEmail}</span>
                          </td>
                          <td className={`px-3 py-2 font-bold text-[10px] ${RANK_COLORS[row.rank] || 'text-outline'}`}>{row.rank}</td>
                          <td className="px-3 py-2 text-right">{fmtBv(row.leftBv)}</td>
                          <td className="px-3 py-2 text-right">{fmtBv(row.rightBv)}</td>
                          <td className="px-3 py-2 text-right text-blue-400">{fmtBv(row.leftCarryover)}</td>
                          <td className="px-3 py-2 text-right text-purple-400">{fmtBv(row.rightCarryover)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{fmtBv(row.totalLeftBv)}</td>
                          <td className="px-3 py-2 text-right font-semibold">{fmtBv(row.totalRightBv)}</td>
                          <td className={`px-3 py-2 text-right font-bold ${row.weakerSidePct < 40 ? 'text-error' : row.weakerSidePct < 60 ? 'text-yellow-400' : 'text-tertiary'}`}>
                            {row.weakerSidePct.toFixed(1)}%
                          </td>
                          <td className="px-3 py-2 text-right">{fmtBv(row.matchableBv)}</td>
                          <td className="px-3 py-2 text-right font-bold text-on-surface">{row.matchedPairs}</td>
                          <td className="px-3 py-2 text-right text-on-surface-variant">{fmt(row.rawIncomePaise)}</td>
                          <td className="px-3 py-2 text-right text-on-surface-variant">{fmt(row.afterWeeklyCapPaise)}</td>
                          <td className="px-3 py-2 text-right text-on-surface-variant">{fmt(row.afterCycleLimitPaise)}</td>
                          <td className="px-3 py-2 text-right">
                            <span className={`font-extrabold ${row.finalIncomePaise > 0 ? 'text-tertiary' : 'text-outline'}`}>
                              {fmt(row.finalIncomePaise)}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-right text-on-surface-variant">{fmtBv(row.bvConsumed)}</td>
                          <td className="px-3 py-2 text-right text-blue-400">{fmtBv(row.newLeftCarryover)}</td>
                          <td className="px-3 py-2 text-right text-purple-400">{fmtBv(row.newRightCarryover)}</td>
                          <td className="px-3 py-2">
                            {row.isCycleComplete ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-outline/20 text-outline">5x Complete</span>
                            ) : row.qualified ? (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-tertiary/15 text-tertiary">Qualifies</span>
                            ) : (
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-error/15 text-error" title={row.disqualifyReason || ''}>
                                {row.disqualifyReason && row.disqualifyReason.length > 20
                                  ? row.disqualifyReason.substring(0, 20) + '…'
                                  : (row.disqualifyReason || 'Disqualified')}
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    {binaryRows.length > 0 && (
                      <tfoot>
                        <tr className="bg-surface-container font-bold text-on-surface text-xs">
                          <td colSpan={11} className="px-3 py-2.5 text-right">TOTALS →</td>
                          <td className="px-3 py-2.5 text-right">{binaryRows.reduce((s, r) => s + r.matchedPairs, 0)}</td>
                          <td className="px-3 py-2.5 text-right">{fmt(binaryRows.reduce((s, r) => s + r.rawIncomePaise, 0))}</td>
                          <td className="px-3 py-2.5 text-right">{fmt(binaryRows.reduce((s, r) => s + r.afterWeeklyCapPaise, 0))}</td>
                          <td className="px-3 py-2.5 text-right">{fmt(binaryRows.reduce((s, r) => s + r.afterCycleLimitPaise, 0))}</td>
                          <td className="px-3 py-2.5 text-right text-primary">{fmt(binaryRows.reduce((s, r) => s + r.finalIncomePaise, 0))}</td>
                          <td className="px-3 py-2.5 text-right">{fmtBv(binaryRows.reduce((s, r) => s + r.bvConsumed, 0))}</td>
                          <td className="px-3 py-2.5 text-right text-blue-400">{fmtBv(binaryRows.reduce((s, r) => s + r.newLeftCarryover, 0))}</td>
                          <td className="px-3 py-2.5 text-right text-purple-400">{fmtBv(binaryRows.reduce((s, r) => s + r.newRightCarryover, 0))}</td>
                          <td />
                        </tr>
                      </tfoot>
                    )}
                  </table>
                </div>
              )}

              {/* ── TABLE 2: Milestone Bonuses ── */}
              {activeTab === 'milestone' && (
                <div className="overflow-x-auto rounded-xl border border-surface-container">
                  {milestoneRows.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] text-outline">emoji_events</span>
                      <p className="text-sm font-semibold">No milestone bonuses to award this cycle</p>
                      <p className="text-xs">No users crossed a milestone threshold within the required time window.</p>
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-surface-container text-outline uppercase text-[10px] tracking-wider">
                          <th className="px-3 py-2.5 text-left">#</th>
                          <th className="px-3 py-2.5 text-left min-w-[160px]">Member</th>
                          <th className="px-3 py-2.5 text-right">Prev Pairs</th>
                          <th className="px-3 py-2.5 text-right">New Pairs</th>
                          <th className="px-3 py-2.5 text-right">Days Elapsed</th>
                          <th className="px-3 py-2.5 text-right">Milestone Hit</th>
                          <th className="px-3 py-2.5 text-right font-bold text-on-surface">Bonus Amount</th>
                          <th className="px-3 py-2.5 text-left">Milestone Badge</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {milestoneRows.map((row, i) => (
                          <tr key={`${row.userId}-${row.milestoneHit}`} className="hover:bg-surface-container/50 transition-colors">
                            <td className="px-3 py-2 text-outline">{i + 1}</td>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-on-surface block">{row.userName}</span>
                              <span className="text-outline text-[10px]">{row.userEmail}</span>
                            </td>
                            <td className="px-3 py-2 text-right text-on-surface-variant">{row.currentLifetimePairs}</td>
                            <td className="px-3 py-2 text-right font-bold text-tertiary">{row.newLifetimePairs}</td>
                            <td className="px-3 py-2 text-right">{row.daysElapsed}d</td>
                            <td className="px-3 py-2 text-right font-bold text-on-surface">{row.milestoneHit} pairs</td>
                            <td className="px-3 py-2 text-right font-extrabold text-tertiary text-sm">{fmt(row.bonusPaise)}</td>
                            <td className="px-3 py-2">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-tertiary/15 text-tertiary">
                                🏅 {row.milestoneHit === 1 ? '1st Match' : row.milestoneHit === 5 ? '5th Match' : row.milestoneHit === 10 ? '10th Match' : `${row.milestoneHit}th Match`}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-surface-container font-bold text-xs">
                          <td colSpan={6} className="px-3 py-2.5 text-right text-on-surface">TOTAL MILESTONE BONUS →</td>
                          <td className="px-3 py-2.5 text-right text-primary">{fmt(milestoneRows.reduce((s, r) => s + r.bonusPaise, 0))}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              )}

              {/* ── TABLE 3: Rank Bonuses ── */}
              {activeTab === 'rank' && (
                <div className="overflow-x-auto rounded-xl border border-surface-container">
                  {rankRows.filter(r => r.isPromotion).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-2 text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px] text-outline">workspace_premium</span>
                      <p className="text-sm font-semibold">No rank promotions this cycle</p>
                      <p className="text-xs">No users have qualified for a rank upgrade at this time.</p>
                    </div>
                  ) : (
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="bg-surface-container text-outline uppercase text-[10px] tracking-wider">
                          <th className="px-3 py-2.5 text-left">#</th>
                          <th className="px-3 py-2.5 text-left min-w-[160px]">Member</th>
                          <th className="px-3 py-2.5 text-left">Previous Rank</th>
                          <th className="px-3 py-2.5 text-left">New Rank</th>
                          <th className="px-3 py-2.5 text-right">Qual. BV</th>
                          <th className="px-3 py-2.5 text-right">Active Directs</th>
                          <th className="px-3 py-2.5 text-left">Bonus Breakdown</th>
                          <th className="px-3 py-2.5 text-right font-bold text-on-surface">Total Bonus</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container">
                        {rankRows.filter(r => r.isPromotion).map((row, i) => (
                          <tr key={row.userId} className="hover:bg-surface-container/50 transition-colors">
                            <td className="px-3 py-2 text-outline">{i + 1}</td>
                            <td className="px-3 py-2">
                              <span className="font-semibold text-on-surface block">{row.userName}</span>
                              <span className="text-outline text-[10px]">{row.userEmail}</span>
                            </td>
                            <td className={`px-3 py-2 font-bold ${RANK_COLORS[row.previousRank] || 'text-outline'}`}>{row.previousRank}</td>
                            <td className="px-3 py-2">
                              <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${RANK_COLORS[row.newRank] || 'text-outline'} bg-surface-container`}>
                                ↑ {row.newRank}
                              </span>
                            </td>
                            <td className="px-3 py-2 text-right font-semibold">{fmtBv(row.qualificationBv)}</td>
                            <td className="px-3 py-2 text-right">{row.activeDirectCount}</td>
                            <td className="px-3 py-2">
                              <div className="flex flex-wrap gap-1">
                                {row.rankBonusDetails.map(b => (
                                  <span key={b.rank} className="px-1.5 py-0.5 rounded bg-secondary/15 text-secondary text-[10px] font-semibold">
                                    {b.rank}: {fmt(b.amountPaise)}
                                  </span>
                                ))}
                              </div>
                            </td>
                            <td className="px-3 py-2 text-right font-extrabold text-secondary text-sm">{fmt(row.rankBonusPaise)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-surface-container font-bold text-xs">
                          <td colSpan={7} className="px-3 py-2.5 text-right text-on-surface">TOTAL RANK BONUSES →</td>
                          <td className="px-3 py-2.5 text-right text-primary">
                            {fmt(rankRows.filter(r => r.isPromotion).reduce((s, r) => s + r.rankBonusPaise, 0))}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Bottom Grid: Schedule + Terminal ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Schedule Picker */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-4">
          <div className="flex items-center gap-3 pb-3 border-b border-surface-container">
            <span className="material-symbols-outlined text-[22px] text-secondary">schedule_send</span>
            <div>
              <h3 className="font-bold text-on-surface">Auto-Schedule</h3>
              <p className="text-xs text-on-surface-variant">Set the weekly closing day and time (IST)</p>
            </div>
          </div>

          {/* Day Picker */}
          <div>
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2">Closing Day</span>
            <div className="flex flex-wrap gap-1.5">
              {DAYS.map(d => (
                <button
                  key={d}
                  onClick={() => setSelDay(d)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${selDay === d ? 'bg-primary text-on-primary shadow' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}`}
                >
                  {d.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>

          {/* Time Picker Disabled */}
          <div className="opacity-50 pointer-events-none">
            <span className="text-[10px] font-bold text-outline uppercase tracking-wider block mb-2">Closing Time (IST)</span>
            <input
              type="time"
              value="23:30"
              readOnly
              className="px-3 py-2 rounded-lg bg-surface-container text-on-surface text-sm border border-surface-container-high outline-none w-full"
            />
          </div>

          {/* Save */}
          <button
            onClick={handleSaveSchedule}
            disabled={scheduleSaving}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-secondary text-on-secondary font-bold text-sm transition-all hover:opacity-90 disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            {scheduleSaving ? 'Saving...' : `Save Schedule (${selDay.slice(0,3)} 23:30 IST)`}
          </button>

          <div className="flex items-center gap-2 p-3 rounded-xl bg-surface-container text-xs">
            <span className="material-symbols-outlined text-[16px] text-tertiary">info</span>
            <span className="text-on-surface-variant">
              Vercel Free Tier limits crons to once daily. The cron is hardcoded to fire at 11:30 PM IST (18:00 UTC). When the current day matches your Closing Day, it will execute exactly at that time.
            </span>
          </div>
        </div>

        {/* Terminal */}
        <div className="p-5 rounded-2xl bg-surface-container-lowest shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between pb-3 border-b border-surface-container">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-primary">developer_mode_tv</span>
              <div>
                <h3 className="font-bold text-on-surface">Execution Terminal</h3>
                <p className="text-xs text-on-surface-variant">Live cron run logs</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${cronRunning ? 'bg-tertiary animate-pulse' : 'bg-outline'}`}></span>
              <span className="text-[10px] font-bold text-outline uppercase">{cronRunning ? 'Running' : 'Idle'}</span>
            </div>
          </div>

          <div
            ref={logRef}
            className="bg-[#0d1117] rounded-xl p-3.5 font-mono text-[11px] h-72 overflow-y-auto flex flex-col gap-0.5 shadow-inner"
          >
            {cronLogs.map((log, i) => (
              <div
                key={i}
                className={
                  log.type === 'error' ? 'text-red-400' :
                  log.type === 'success' ? 'text-emerald-400' :
                  log.type === 'warn' ? 'text-yellow-400' :
                  'text-slate-400'
                }
              >
                {log.msg}
              </div>
            ))}
            {cronRunning && (
              <div className="text-emerald-400 animate-pulse">_ Processing binary tree nodes...</div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleRunCron}
              disabled={cronRunning}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-sm transition-all hover:bg-secondary disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">play_circle</span>
              {cronRunning ? 'Running...' : 'Execute Cron Now'}
            </button>
            <button
              onClick={() => setCronLogs([])}
              className="px-3 py-2.5 rounded-xl bg-surface-container text-on-surface-variant hover:text-on-surface text-sm transition-colors"
              title="Clear logs"
            >
              <span className="material-symbols-outlined text-[16px]">delete_sweep</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
