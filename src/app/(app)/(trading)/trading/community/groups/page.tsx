'use client'

import React, { useState, useEffect } from 'react'

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const res = await fetch('/api/community/groups');
        const data = await res.json();
        setGroups(data.groups || []);
      } catch (err) {
        console.error("Failed to fetch groups", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchGroups();
  }, []);

  return (
    <div className="flex flex-col max-w-[1000px] mx-auto w-full pb-20 pt-8 px-4 md:px-0 animate-in fade-in duration-300">
      
      <div className="flex flex-col mb-10">
        <h1 className="font-headline-xl text-[24px] md:text-[28px] text-on-surface font-bold">Trading Groups</h1>
        <p className="font-body-md text-on-surface-variant max-w-xl mt-2">Join specialized sub-communities to focus your feed on specific assets or trading styles.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-on-surface-variant font-body-lg">Loading groups...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {groups.map((group, i) => (
            <div key={i} className="bg-surface-container-lowest border border-surface-container-low rounded-2xl p-4 md:p-6 flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-[24px] bg-primary/10 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <span className="material-symbols-outlined text-[20px] md:text-[24px]">{group.icon}</span>
                </div>
                <span className="font-label-sm text-[11px] text-primary bg-primary/10 px-3 py-1 rounded-full uppercase tracking-wider">{group.category}</span>
              </div>
              
              <div className="flex flex-col mt-2">
                <h3 className="font-headline-lg text-[18px] font-bold text-on-surface">{group.name}</h3>
                <span className="font-body-sm text-[13px] text-on-surface-variant mt-1">{group.members} active traders</span>
              </div>
              
              <button className="mt-4 w-full bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-[13px] font-bold py-2.5 rounded-[24px] transition-colors">
                Join Group
              </button>
            </div>
          ))}
        </div>
      )}

    </div>
  )
}
