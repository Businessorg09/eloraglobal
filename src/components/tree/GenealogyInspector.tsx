import React from 'react';

interface InspectorProps {
  node: any;
  onClose: () => void;
  onFocusNode?: (userId: string) => void;
}

export function GenealogyInspector({ node, onClose, onFocusNode }: InspectorProps) {
  if (!node) return null;

  const initials = node.username ? node.username.substring(0, 2).toUpperCase() : 'US';
  const leftBv = node.volumes?.leftTotal || 0;
  const rightBv = node.volumes?.rightTotal || 0;
  const personalBv = node.personalBv || 0;
  const rank = (node.rank || 'BRONZE').toUpperCase();

  let rankColorClass = "text-on-surface-variant";
  if (rank === 'DIAMOND' || rank === 'CROWN' || rank === 'AMBASSADOR') {
    rankColorClass = "text-primary";
  } else if (rank === 'PLATINUM' || rank === 'GOLD') {
    rankColorClass = "text-secondary-container";
  } else if (rank === 'STARTER') {
    rankColorClass = "text-outline";
  }

  return (
    <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm h-full" id="nodeInspector">
      <div className="flex items-center justify-between pb-3 border-b border-surface-container">
        <div className="flex items-center gap-1.5">
          <span className="material-symbols-outlined text-primary text-[20px]">manage_search</span>
          <h2 className="font-headline-md text-headline-md font-bold text-on-surface">Node Inspector</h2>
        </div>
        <span className="px-2 py-0.5 rounded-full bg-tertiary/10 text-tertiary font-label-sm text-label-sm font-semibold">
          {node.isActive ? 'Active Leg' : 'Inactive'}
        </span>
      </div>
      <div className="py-4">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-headline-lg text-headline-lg font-bold text-on-surface truncate tracking-tight">{node.fullName || node.username}</h3>
            <div className="flex items-center gap-2 mt-1 font-body-sm text-body-sm text-outline">
              <span className="font-mono">ID: {node.username}</span>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="bg-surface-container-low rounded-lg p-3 border border-surface-container/50">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wide">Left BV</span>
            <div className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">{leftBv}</div>
          </div>
          <div className="bg-surface-container-low rounded-lg p-3 border border-surface-container/50">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wide">Right BV</span>
            <div className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">{rightBv}</div>
          </div>
        </div>
        <div className="mt-3 bg-surface-container-low rounded-lg p-3 border border-surface-container/50 flex items-center justify-between">
          <div>
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wide">Personal BV</span>
            <div className="font-headline-md text-headline-md font-bold text-on-surface mt-0.5">{personalBv}</div>
          </div>
          <div className="text-right">
            <span className="font-label-sm text-label-sm text-outline uppercase tracking-wide">Current Rank</span>
            <div className={`font-headline-md text-headline-md font-bold ${rankColorClass} mt-0.5`}>{rank}</div>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t border-surface-container">
          <h4 className="font-label-md text-label-md font-bold text-on-surface mb-3">Downline Access</h4>
          <button 
            type="button" 
            onClick={() => onFocusNode && onFocusNode(node.userId || node.id)}
            className="w-full py-2.5 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-[18px]">account_tree</span>
            View as Root Node
          </button>
        </div>
      </div>
    </div>
  );
}
