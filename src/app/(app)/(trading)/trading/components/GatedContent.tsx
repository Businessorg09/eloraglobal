'use client'

import React, { ReactNode } from 'react';
import { usePackage, PackageTier } from '../context/PackageContext';

interface GatedContentProps {
  children: ReactNode;
  minPackageRequired?: PackageTier;
  examRequired?: boolean;
  blurLevel?: 'sm' | 'md' | 'lg';
  customMessage?: string;
  isComponent?: boolean;
}

export function GatedContent({ 
  children, 
  minPackageRequired = 1, 
  examRequired = false,
  blurLevel = 'md',
  customMessage,
  isComponent = false
}: GatedContentProps) {
  const { currentPackage, hasPassedExam } = usePackage();

  // Elite Package (3) gets unrestricted access to everything
  const packageLocked = currentPackage < minPackageRequired;
  const examLocked = examRequired && !hasPassedExam && currentPackage !== 3;
  
  const isLocked = packageLocked || examLocked;

  if (!isLocked || currentPackage === 3) {
    return <>{children}</>;
  }

  // Determine the lock reason and message
  let lockTitle = 'Content Locked';
  let lockDesc = customMessage || 'You do not have access to this feature.';
  let lockIcon = 'lock';

  if (examLocked) {
    lockTitle = 'Pass Exam Required';
    lockDesc = customMessage || 'You must pass the evaluation exam to unlock execution modules.';
    lockIcon = 'assignment_late';
  } else if (packageLocked) {
    lockTitle = 'Premium Feature';
    lockDesc = customMessage || `Upgrade to Package ${minPackageRequired} to access this module.`;
    lockIcon = 'workspace_premium';
  }

  return (
    <div className={`relative ${!isComponent ? 'w-full h-full min-h-[600px]' : 'w-full h-full'}`}>
      <div className={`pointer-events-none select-none filter blur-${blurLevel} opacity-40 transition-all duration-500`}>
        {children}
      </div>
      
      <div className="absolute inset-0 z-50 flex items-center justify-center p-6">
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl rounded-2xl p-8 max-w-md w-full flex flex-col items-center text-center transform transition-all">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-inner ${
            examLocked ? 'bg-[#FEF2F2] text-[#EF4444]' : 'bg-gradient-to-br from-[#FEF3C7] to-[#F59E0B] text-white shadow-[0_0_20px_rgba(245,158,11,0.4)]'
          }`}>
            <span className="material-symbols-outlined text-[32px]">{lockIcon}</span>
          </div>
          
          <h2 className="text-[22px] font-black text-[#111827] mb-2">{lockTitle}</h2>
          <p className="text-[14px] text-[#4B5563] mb-6 leading-relaxed">
            {lockDesc}
          </p>
          
          {packageLocked && (
            <div className="w-full mb-8 text-left bg-[#F9FAFB] border border-[#E5E7EB] rounded-[24px] p-4 flex flex-col gap-3 shadow-inner">
              <div className="flex justify-between items-center pb-2 border-b border-[#E5E7EB]">
                 <span className="font-bold text-[11px] text-[#6B7280] uppercase tracking-wider">Package 2 (Mid)</span>
                 <span className="font-bold text-[11px] text-[#D97706] uppercase tracking-wider flex items-center gap-1">
                   <span className="material-symbols-outlined text-[14px]">stars</span> Package 3 (Elite)
                 </span>
              </div>
              
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 text-[#374151] w-1/2">
                   <span className="material-symbols-outlined text-[16px] text-[#059669]">check_circle</span>
                   Trading Journal
                </span>
                <span className="flex items-center gap-1.5 text-[#374151] w-1/2 font-semibold">
                   <span className="material-symbols-outlined text-[16px] text-[#D97706]">check_circle</span>
                   Everything in Mid
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 text-[#374151] w-1/2">
                   <span className="material-symbols-outlined text-[16px] text-[#059669]">check_circle</span>
                   Trader Passport
                </span>
                <span className="flex items-center gap-1.5 text-[#374151] w-1/2 font-semibold">
                   <span className="material-symbols-outlined text-[16px] text-[#D97706]">check_circle</span>
                   Live Masterclasses
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 text-[#9CA3AF] w-1/2">
                   <span className="material-symbols-outlined text-[16px] text-[#D1D5DB]">cancel</span>
                   <span className="line-through decoration-[#D1D5DB]">Market Intelligence</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#374151] w-1/2 font-semibold">
                   <span className="material-symbols-outlined text-[16px] text-[#D97706]">check_circle</span>
                   Guild Community
                </span>
              </div>
              
              <div className="flex justify-between items-center text-[13px]">
                <span className="flex items-center gap-1.5 text-[#9CA3AF] w-1/2">
                   <span className="material-symbols-outlined text-[16px] text-[#D1D5DB]">cancel</span>
                   <span className="line-through decoration-[#D1D5DB]">Quant Tools</span>
                </span>
                <span className="flex items-center gap-1.5 text-[#374151] w-1/2 font-semibold">
                   <span className="material-symbols-outlined text-[16px] text-[#D97706]">check_circle</span>
                   Strategy Lab & Case Studies
                </span>
              </div>
            </div>
          )}
          
          {examLocked ? (
            <button className="w-full bg-[#111827] hover:bg-[#374151] text-white py-3.5 rounded-[24px] font-bold text-[14px] shadow-lg transition-all flex items-center justify-center gap-2">
              Go to Exam Center <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </button>
          ) : (
            <button className="w-full bg-gradient-to-r from-[#F59E0B] to-[#D97706] hover:from-[#D97706] hover:to-[#B45309] text-white py-3.5 rounded-[24px] font-bold text-[14px] shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2">
              Upgrade Subscription <span className="material-symbols-outlined text-[18px]">upgrade</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
