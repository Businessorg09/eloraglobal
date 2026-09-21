import React, { useState, useTransition } from 'react';
import { Trade } from './TradeLogTable';
import { addTrade } from '../actions';

interface TradeEntryFormProps {
  onSave: (trade: Trade) => void;
}

export function TradeEntryForm({ onSave }: TradeEntryFormProps) {
  const [asset, setAsset] = useState('');
  const [direction, setDirection] = useState<'LONG' | 'SHORT'>('LONG');
  const [lots, setLots] = useState('');
  const [pnl, setPnl] = useState('');
  const [psychology, setPsychology] = useState('Calm / Objective');
  const [notes, setNotes] = useState('');
  
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState('');

  const handleAction = (formData: FormData) => {
    setErrorMsg('');
    startTransition(async () => {
      const result = await addTrade(formData);
      if (result.error) {
        setErrorMsg(result.error);
      } else if (result.success && result.trade) {
        const newTrade: Trade = {
          id: result.trade.id,
          date: new Date(result.trade.execution_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          asset: result.trade.asset,
          direction: result.trade.direction as 'LONG' | 'SHORT',
          lots: result.trade.lot_size,
          pnl: result.trade.pnl,
          psychology: result.trade.psychology_state || '',
          notes: result.trade.notes || ''
        };
        onSave(newTrade);
        setAsset('');
        setLots('');
        setPnl('');
        setNotes('');
      }
    });
  };

  return (
    <form action={handleAction} className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col h-full relative">
      <div className="flex items-center justify-between mb-6 border-b border-[#F3F4F6] pb-4">
        <h2 className="text-[16px] font-bold text-[#111827] leading-tight flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1D4ED8]">edit_document</span>
          Log New Execution
        </h2>
        <span className="text-[10px] font-bold text-[#1D4ED8] bg-[#EFF6FF] px-2 py-1 rounded uppercase tracking-wider">Live Sync</span>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 text-xs font-bold rounded-lg border border-red-100">
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-5">
        
        {/* Top Row */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Asset</label>
            <input 
              type="text" 
              name="asset"
              value={asset}
              onChange={(e) => setAsset(e.target.value)}
              placeholder="e.g. XAU/USD" 
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-2 text-[13px] font-bold focus:border-[#1D4ED8] focus:outline-none" 
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Direction</label>
            <select 
              name="direction"
              value={direction}
              onChange={(e) => setDirection(e.target.value as 'LONG' | 'SHORT')}
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-2 text-[13px] font-bold focus:border-[#1D4ED8] focus:outline-none"
            >
              <option value="LONG">Long (Buy)</option>
              <option value="SHORT">Short (Sell)</option>
            </select>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Lots</label>
            <input 
              type="number" 
              name="lots"
              step="0.01"
              value={lots}
              onChange={(e) => setLots(e.target.value)}
              placeholder="0.00" 
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-2 text-[13px] font-bold focus:border-[#1D4ED8] focus:outline-none" 
              required
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Net P&L ($)</label>
            <input 
              type="number" 
              name="pnl"
              step="0.01"
              value={pnl}
              onChange={(e) => setPnl(e.target.value)}
              placeholder="-500 or 1200" 
              className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-2 text-[13px] font-bold focus:border-[#1D4ED8] focus:outline-none" 
              required
            />
          </div>
        </div>

        {/* Psychological State */}
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Psychological State at Entry</label>
          <input type="hidden" name="psychology" value={psychology} />
          <div className="flex gap-2">
            {['Calm / Objective', 'Anxious / Rushed', 'FOMO / Greedy'].map(state => (
              <button 
                key={state}
                type="button"
                onClick={() => setPsychology(state)}
                className={`flex-1 py-2 rounded-lg text-[11px] font-bold transition-colors ${
                  psychology === state 
                    ? state.includes('Calm') ? 'bg-[#ECFDF5] border border-[#059669] text-[#059669]' : 'bg-[#FEF2F2] border border-[#EF4444] text-[#EF4444]'
                    : 'bg-[#F8FAFC] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6]'
                }`}
              >
                {state}
              </button>
            ))}
          </div>
        </div>

        {/* Trade Notes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#4B5563] uppercase tracking-wider">Execution Thesis & Review</label>
          <textarea 
            name="notes"
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Why did you take this trade? What did you see? Was it part of the plan?" 
            className="w-full bg-[#F8FAFC] border border-[#E5E7EB] rounded-lg p-3 text-[13px] focus:border-[#1D4ED8] focus:outline-none resize-none"
          ></textarea>
        </div>

      </div>

      <div className="mt-auto pt-6 flex gap-3">
        <button type="button" onClick={() => { setAsset(''); setLots(''); setPnl(''); setNotes(''); }} className="flex-1 bg-[#F3F4F6] hover:bg-[#E5E7EB] text-[#4B5563] py-2.5 rounded-lg font-bold text-[13px] transition-colors">
          Clear
        </button>
        <button 
          type="submit"
          disabled={!asset || !lots || !pnl || isPending}
          className="flex-[2] bg-[#1D4ED8] hover:bg-[#1E40AF] disabled:bg-[#9CA3AF] disabled:cursor-not-allowed text-white py-2.5 rounded-lg font-bold text-[13px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-colors flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">
            {isPending ? 'sync' : 'save'}
          </span> 
          {isPending ? 'Saving...' : 'Save to Ledger'}
        </button>
      </div>
    </form>
  )
}
