import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export default function BinaryBreakdownReport() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const url = selectedPayoutId && selectedPayoutId !== 'default' 
      ? `/api/reports/binary-breakdown?payout_id=${selectedPayoutId}`
      : `/api/reports/binary-breakdown`;

    fetch(url)
      .then(res => res.json())
      .then(d => {
        setData(d);
        setLoading(false);
      })
      .catch(e => {
        console.error(e);
        setLoading(false);
      });
  }, [selectedPayoutId]);

  if (loading) {
    return <div className="p-10 text-center animate-pulse text-outline">Loading Volume Breakdown...</div>;
  }

  if (!data || !data.success) {
    return <div className="p-10 text-center text-error">Failed to load volume breakdown. {data?.error}</div>;
  }

  const { leftContributors, rightContributors, stats, periodStart, periodEnd } = data;

  const renderTable = (title: string, contributors: any[], totalBv: number, legColor: string) => (
    <div className="bg-surface-container-lowest rounded-xl shadow-sm p-5 border border-surface-container-low flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${legColor}`}></span>
          <h3 className="font-headline-md text-on-surface font-bold">{title}</h3>
        </div>
        <span className="font-label-sm px-2 py-1 bg-surface-container-low rounded-lg text-on-surface-variant">
          Total Generated: <strong className="text-on-surface">{totalBv} BV</strong>
        </span>
      </div>
      
      <div className="flex-1 overflow-auto rounded-lg border border-surface-container">
        <table className="w-full text-left border-collapse">
          <thead className="bg-surface-container-low text-on-surface-variant font-label-sm uppercase tracking-wider sticky top-0">
            <tr>
              <th className="px-4 py-3 border-b border-surface-container">User</th>
              <th className="px-4 py-3 border-b border-surface-container">Package/Type</th>
              <th className="px-4 py-3 border-b border-surface-container text-right">BV Generated</th>
            </tr>
          </thead>
          <tbody className="font-body-sm text-on-surface">
            {contributors.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-outline">No volume generated in this leg for the selected period.</td>
              </tr>
            ) : (
              contributors.map((c: any) => (
                <tr key={c.id} className="hover:bg-surface-container-lowest transition-colors border-b border-surface-container last:border-0">
                  <td className="px-4 py-3">
                    <div className="font-semibold">{c.username}</div>
                    <div className="text-[11px] text-outline truncate w-32">{c.email}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-on-surface-variant">{c.type.replace('_', ' ')}</div>
                    <div className="text-[11px] text-outline truncate w-40">{c.description}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-primary">
                    +{c.estimated_bv}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      
      {/* Header Info */}
      <div className="bg-surface-container-lowest p-5 rounded-xl shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-headline-lg font-bold text-on-surface">Volume Breakdown Report</h2>
          <div className="flex items-center gap-3 mt-2">
            <span className="font-label-sm uppercase text-outline font-semibold">Select Payout Cycle:</span>
            <select 
              className="bg-surface-container-low text-on-surface py-1.5 px-3 rounded-lg font-body-sm focus:outline-none border border-surface-container"
              value={selectedPayoutId || data.history?.id || 'default'}
              onChange={(e) => setSelectedPayoutId(e.target.value)}
            >
              {(data.availablePeriods || []).map((p: any) => (
                <option key={p.id} value={p.id}>{p.label}</option>
              ))}
            </select>
          </div>
          <p className="font-body-sm text-outline mt-2">
            Showing volume generated between <strong>{periodStart}</strong> and <strong>{periodEnd}</strong>.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">
            <div className="text-[11px] font-label-sm uppercase text-primary font-bold">Total Left BV</div>
            <div className="text-headline-sm font-bold text-on-surface">{stats.leftTotalBv}</div>
          </div>
          <div className="bg-secondary/10 px-4 py-2 rounded-lg border border-secondary/20">
            <div className="text-[11px] font-label-sm uppercase text-secondary font-bold">Total Right BV</div>
            <div className="text-headline-sm font-bold text-on-surface">{stats.rightTotalBv}</div>
          </div>
          <div className="bg-tertiary/10 px-4 py-2 rounded-lg border border-tertiary/20">
            <div className="text-[11px] font-label-sm uppercase text-tertiary font-bold">Matched Pairs (BV)</div>
            <div className="text-headline-sm font-bold text-on-surface">{Math.min(stats.leftTotalBv, stats.rightTotalBv)}</div>
          </div>
        </div>
      </div>

      {/* Split Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        {renderTable('Left Leg Contributors', leftContributors, stats.leftTotalBv, 'bg-primary')}
        {renderTable('Right Leg Contributors', rightContributors, stats.rightTotalBv, 'bg-secondary-container')}
      </div>

    </motion.div>
  );
}
