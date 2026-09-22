'use client'

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
export type PackageTier = 0 | 1 | 2 | 3;

interface PackageContextProps {
  currentPackage: PackageTier;
  setCurrentPackage: (tier: PackageTier) => void;
  hasPassedExam: boolean;
  setHasPassedExam: (passed: boolean) => void;
  isLoadingPackage: boolean;
}

const PackageContext = createContext<PackageContextProps | undefined>(undefined);

export function PackageProvider({ children }: { children: ReactNode }) {
  const [currentPackage, setCurrentPackage] = useState<PackageTier>(0 as any);
  const [hasPassedExam, setHasPassedExam] = useState<boolean>(false);
  const [isLoadingPackage, setIsLoadingPackage] = useState<boolean>(true);

  useEffect(() => {
    setIsLoadingPackage(true);
    fetch('/api/user/profile')
      .then(res => res.json())
      .then(data => {
        if (data && data.profile) {
          const pkg = data.profile.package_name?.toLowerCase() || '';
          if (pkg.includes('elite') || pkg.includes('executive')) setCurrentPackage(3);
          else if (pkg.includes('pro') || pkg.includes('growth')) setCurrentPackage(2);
          else if (pkg.includes('starter')) setCurrentPackage(1);
          else setCurrentPackage(0 as any);
        }
      })
      .catch(err => console.error("Failed to fetch package tier:", err))
      .finally(() => {
        setIsLoadingPackage(false);
      });
  }, []);

  return (
    <PackageContext.Provider value={{ currentPackage, setCurrentPackage, hasPassedExam, setHasPassedExam, isLoadingPackage }}>
      {children}
    </PackageContext.Provider>
  );
}

export function usePackage() {
  const context = useContext(PackageContext);
  if (!context) {
    throw new Error('usePackage must be used within a PackageProvider');
  }
  return context;
}
