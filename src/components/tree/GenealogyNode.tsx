import React from 'react';
import { motion } from 'framer-motion';

interface NodeProps {
  node: any;
  depth: number;
  maxDepth: number;
  onSelectNode: (node: any) => void;
  onPlaceNode?: (position: 'L' | 'R', parentId: string) => void;
  position?: 'L' | 'R';
  parentId?: string;
}

export function GenealogyNode({ node, depth, maxDepth, onSelectNode, onPlaceNode, position, parentId }: NodeProps) {
  if (depth > maxDepth) return null;

  // Render an empty slot if node is null
  if (!node) {
    return (
      <div 
        onClick={() => onPlaceNode && onPlaceNode(position || 'L', parentId || 'root')}
        className="w-24 bg-surface-container-low/40 rounded p-1.5 text-center cursor-pointer hover:bg-surface-container-high transition-colors border border-dashed border-outline/40"
      >
        <span className="material-symbols-outlined text-[16px] text-primary block mt-0.5">add</span>
        <div className="text-[9px] font-bold text-primary truncate mt-0.5">Place Here</div>
      </div>
    );
  }

  // Calculate dimensions based on depth to match the HTML design
  // Depth 1 -> 420px wide SVG, gap-28
  // Depth 2 -> 220px wide SVG, gap-8
  // Depth 3 -> 110px wide SVG, gap-2.5
  let svgWidth = 110;
  let gapStyle = "0.625rem"; // gap-2.5 is 10px
  let svgHeight = 40;
  let viewBoxHeight = 40;
  
  if (depth === 1) {
    svgWidth = 420;
    gapStyle = "7rem"; // gap-28 is 112px
    svgHeight = 56;
    viewBoxHeight = 56;
  } else if (depth === 2) {
    svgWidth = 220;
    gapStyle = "2rem"; // gap-8 is 32px
    svgHeight = 56;
    viewBoxHeight = 56;
  }

  const cx = svgWidth / 2;
  const cy = svgHeight / 2;
  const qx = cx / 2;
  const qx3 = cx + qx;

  const isRoot = depth === 1;

  // Rank badge styling
  let badgeColorClass = "bg-surface-container-low text-on-surface-variant";
  let iconBgClass = "bg-surface-container";
  let iconTextClass = "text-on-surface-variant";
  let rankIcon = "";
  
  const rank = (node.rank || 'BRONZE').toUpperCase();
  if (rank === 'DIAMOND' || rank === 'CROWN' || rank === 'AMBASSADOR') {
    badgeColorClass = "bg-amber-100 text-amber-700";
    iconBgClass = "bg-amber-100";
    iconTextClass = "text-amber-700";
  } else if (rank === 'PLATINUM' || rank === 'GOLD') {
    badgeColorClass = "bg-secondary-container/10 text-secondary-container";
    iconBgClass = "bg-secondary-container/10";
    iconTextClass = "text-secondary-container";
  } else {
    // Default active color for Bronze/Starter (Blue)
    badgeColorClass = "bg-primary/10 text-primary";
    iconBgClass = "bg-primary/10";
    iconTextClass = "text-primary";
  }

  const initials = node.username ? node.username.substring(0, 2).toUpperCase() : 'US';
  const leftBv = node.volumes?.leftTotal || 0;
  const rightBv = node.volumes?.rightTotal || 0;
  const personalBv = node.personalBv || 0;

  return (
    <motion.div 
      initial={{ scale: 0.9, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: depth * 0.1 }}
      className="flex flex-col items-center relative z-10"
    >
      
      {/* Node Card */}
      {isRoot ? (
        <div 
          onClick={() => onSelectNode(node)}
          className={`w-64 bg-surface-container-lowest rounded-xl p-3 shadow-md hover:shadow-lg transition-all cursor-pointer ring-2 ring-primary/40 group relative ${!node.isActive ? 'grayscale opacity-80' : ''}`}
        >
          <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-primary text-on-primary font-label-sm text-[10px] font-bold uppercase tracking-wider shadow-sm">
            Root Sponsor (You)
          </div>
          <div className="flex items-center gap-2.5 mt-1">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                <span className="material-symbols-outlined text-[22px]">shield_person</span>
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-tertiary border-2 border-surface-container-lowest"></span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-headline-md text-headline-md font-bold text-on-surface truncate">{node.fullName || node.username}</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-outline">
                <span className="">ID: {node.username}</span>
                <span className="">·</span>
                <span className="px-1.5 py-0.5 bg-surface-container text-on-surface-variant rounded text-[10px] font-semibold">{rank}</span>
              </div>
            </div>
          </div>
          {/* Leg Metrics Bar */}
          <div className="mt-3 pt-2 bg-surface-container-low/60 rounded-lg p-2 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="border-r border-surface-container pr-1">
              <div className="text-[10px] font-semibold text-outline uppercase">Left Leg</div>
              <div className="font-bold text-primary text-xs mt-0.5">{leftBv} BV</div>
            </div>
            <div className="pl-1">
              <div className="text-[10px] font-semibold text-outline uppercase">Right Leg</div>
              <div className="font-bold text-secondary-container text-xs mt-0.5">{rightBv} BV</div>
            </div>
          </div>
        </div>
      ) : depth <= 3 ? (
        <div 
          onClick={() => onSelectNode(node)}
          className={`${depth === 2 ? 'w-56' : 'w-44'} bg-surface-container-lowest rounded-xl p-3 shadow-sm hover:shadow-md transition-all cursor-pointer ring-1 ring-outline-variant hover:ring-primary group ${!node.isActive ? 'grayscale opacity-80' : ''}`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${iconBgClass} ${iconTextClass}`}>
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-headline-md text-body-md font-bold text-on-surface truncate group-hover:text-primary transition-colors">{node.fullName || node.username}</h4>
              <div className="flex items-center gap-1 text-[11px] text-outline">
                <span className="truncate">{node.username}</span>
                <span className="">·</span>
                <span className={`${iconTextClass} font-semibold truncate`}>{rank}</span>
              </div>
            </div>
            {node.isActive && <span className="w-2 h-2 rounded-full bg-tertiary"></span>}
          </div>
          <div className="mt-2.5 bg-surface-container-low rounded p-1.5 grid grid-cols-2 gap-1 text-center text-[11px]">
            <div>
              <span className="text-[10px] text-outline block">L: {leftBv}</span>
            </div>
            <div>
              <span className="text-[10px] text-outline block">R: {rightBv}</span>
            </div>
          </div>
        </div>
      ) : (
        <div 
          onClick={() => onSelectNode(node)}
          className={`w-24 bg-surface-container-lowest rounded p-1.5 shadow-sm ring-1 ring-outline-variant text-center cursor-pointer hover:ring-primary ${!node.isActive ? 'grayscale opacity-80' : ''}`}
        >
          <div className={`w-5 h-5 rounded-full mx-auto flex items-center justify-center text-[9px] font-bold ${iconBgClass} ${iconTextClass}`}>
            {initials}
          </div>
          <div className="text-[10px] font-bold text-on-surface truncate mt-0.5">{node.username}</div>
          <div className="text-[9px] text-tertiary font-semibold">{node.isActive ? 'Active' : 'Inactive'}</div>
        </div>
      )}

      {/* Render SVG Connector and Children if we haven't reached max depth */}
      {depth < maxDepth && (node.left || node.right || depth < maxDepth) && (
        <>
          <svg style={{ width: `${svgWidth}px`, height: `${svgHeight}px` }} className="overflow-visible" fill="none" viewBox={`0 0 ${svgWidth} ${viewBoxHeight}`}>
            <path 
              d={`M ${cx} 0 L ${cx} ${cy} M ${cx} ${cy} L ${qx} ${cy} M ${cx} ${cy} L ${qx3} ${cy} M ${qx} ${cy} L ${qx} ${viewBoxHeight} M ${qx3} ${cy} L ${qx3} ${viewBoxHeight}`} 
              stroke="#c3c5d7" 
              strokeLinecap="round" 
              strokeWidth={depth <= 2 ? "2" : "1.5"}
            />
          </svg>
          <div style={{ gap: gapStyle }} className="flex items-start justify-center relative z-10 -mt-0.5">
            {node.left || depth < maxDepth ? (
              <GenealogyNode 
                node={node.left} 
                depth={depth + 1} 
                maxDepth={maxDepth} 
                onSelectNode={onSelectNode}
                onPlaceNode={onPlaceNode}
                position="L"
                parentId={node.id}
              />
            ) : <div style={{width: '96px'}}></div>}
            
            {node.right || depth < maxDepth ? (
              <GenealogyNode 
                node={node.right} 
                depth={depth + 1} 
                maxDepth={maxDepth} 
                onSelectNode={onSelectNode}
                onPlaceNode={onPlaceNode}
                position="R"
                parentId={node.id}
              />
            ) : <div style={{width: '96px'}}></div>}
          </div>
        </>
      )}
    </motion.div>
  );
}
