'use client';

import React, { useState, useEffect } from 'react';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'general' | 'api' | 'security'>('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Settings State
  const [exchangeRate, setExchangeRate] = useState<number>(85.0);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowSignups, setAllowSignups] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings');
      const data = await res.json();
      if (data.settings) {
        if (data.settings.EXCHANGE_RATE_USD_INR !== undefined) setExchangeRate(data.settings.EXCHANGE_RATE_USD_INR);
        if (data.settings.MAINTENANCE_MODE !== undefined) setMaintenanceMode(data.settings.MAINTENANCE_MODE);
        if (data.settings.ALLOW_SIGNUPS !== undefined) setAllowSignups(data.settings.ALLOW_SIGNUPS);
      }
    } catch (err) {
      console.error('Failed to fetch settings', err);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        EXCHANGE_RATE_USD_INR: exchangeRate,
        MAINTENANCE_MODE: maintenanceMode,
        ALLOW_SIGNUPS: allowSignups
      };
      
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        alert('Settings saved successfully.');
      } else {
        alert('Failed to save settings.');
      }
    } catch (err) {
      alert('Network error while saving settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] min-h-screen overflow-y-auto">
      <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6">

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
          <div>
            <div className="flex items-center gap-1.5 text-slate-500 text-xs font-medium mb-1">
              <span className="material-symbols-outlined text-[14px]">settings</span>
              System Configuration
              <span className="text-slate-300">/</span>
              <span className="text-[#1D4ED8] font-bold">Settings</span>
            </div>
            <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">Platform Settings</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 rounded-xl bg-[#1D4ED8] hover:bg-blue-700 text-white text-[13px] font-bold shadow-md transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <span className="material-symbols-outlined text-[18px] animate-spin">sync</span>
                  Saving...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[18px]">save</span>
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-3 flex flex-col gap-2">
            <button
              onClick={() => setActiveTab('general')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-all ${
                activeTab === 'general'
                  ? 'bg-white text-[#1D4ED8] shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">tune</span>
              General Platform
            </button>
            
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-all ${
                activeTab === 'api'
                  ? 'bg-white text-[#1D4ED8] shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">api</span>
              API Integrations
            </button>
            
            <button
              onClick={() => setActiveTab('security')}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[14px] font-bold transition-all ${
                activeTab === 'security'
                  ? 'bg-white text-[#1D4ED8] shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">shield_lock</span>
              Security & Auth
            </button>
          </div>

          {/* Settings Content Area */}
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {activeTab === 'general' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-8">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 mb-1">Global Preferences</h3>
                  <p className="text-[13px] text-slate-500">Manage top-level settings that affect the entire trading platform.</p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between py-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-900">Maintenance Mode</h4>
                      <p className="text-[12px] text-slate-500 mt-1">Disables access to the trading dashboard for all non-admin users.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={maintenanceMode} onChange={(e) => setMaintenanceMode(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1D4ED8]"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-center justify-between py-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-900">Allow New Registrations</h4>
                      <p className="text-[12px] text-slate-500 mt-1">Enable or disable new user signups across the platform.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" checked={allowSignups} onChange={(e) => setAllowSignups(e.target.checked)} />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1D4ED8]"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between py-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-900">USD to INR Exchange Rate</h4>
                      <p className="text-[12px] text-slate-500 mt-1">Global fixed exchange rate used for all trading payouts and business engine conversions.</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[14px] font-bold text-slate-500">₹</span>
                      <input 
                        type="number" 
                        step="0.01" 
                        value={exchangeRate} 
                        onChange={(e) => setExchangeRate(parseFloat(e.target.value))} 
                        className="w-24 px-3 py-2 rounded-xl border border-slate-200 text-slate-900 font-mono text-[14px] outline-none focus:ring-2 focus:ring-blue-500" 
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 pt-2">
                    <label className="font-bold text-[13px] text-slate-900">Default Currency Display</label>
                    <select className="w-full max-w-sm px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-[14px] text-slate-900 outline-none focus:ring-2 focus:ring-blue-500">
                      <option value="USD">USD ($)</option>
                      <option value="INR">INR (₹)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'api' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-8">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 mb-1">API Integrations</h3>
                  <p className="text-[13px] text-slate-500">Manage third-party API keys and webhooks securely.</p>
                </div>

                <div className="flex flex-col gap-6">
                  {/* Zoom API */}
                  <div className="flex flex-col gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="material-symbols-outlined text-blue-500">videocam</span>
                      <h4 className="font-bold text-[15px] text-slate-900">Zoom Live Room Integration</h4>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-slate-500 uppercase">API Key</label>
                        <input type="password" defaultValue="************************" className="w-full px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-mono outline-none focus:border-blue-500" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[12px] font-bold text-slate-500 uppercase">API Secret</label>
                        <input type="password" defaultValue="************************" className="w-full px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-mono outline-none focus:border-blue-500" />
                      </div>
                    </div>
                  </div>

                  {/* MT5 Gateway */}
                  <div className="flex flex-col gap-3 p-5 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-emerald-500">swap_calls</span>
                        <h4 className="font-bold text-[15px] text-slate-900">MT5 Trading Gateway</h4>
                      </div>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold">Connected</span>
                    </div>
                    
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[12px] font-bold text-slate-500 uppercase">Gateway URL</label>
                      <input type="text" defaultValue="https://api.mt5-gateway.internal/v1/" className="w-full max-w-md px-4 py-2 rounded-lg border border-slate-200 text-[13px] font-mono outline-none focus:border-blue-500" />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col gap-8">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 mb-1">Security & Authentication</h3>
                  <p className="text-[13px] text-slate-500">Configure administrative security protocols.</p>
                </div>

                <div className="flex flex-col gap-6">
                  <div className="flex items-start justify-between py-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-900">Require 2FA for Admin Portal</h4>
                      <p className="text-[12px] text-slate-500 mt-1 max-w-md">Force all administrative accounts to use Two-Factor Authentication (Authenticator App) when logging into this panel.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>
                  
                  <div className="flex items-start justify-between py-4 border-b border-slate-100">
                    <div>
                      <h4 className="font-bold text-[14px] text-slate-900">Auto-Logout Idle Sessions</h4>
                      <p className="text-[12px] text-slate-500 mt-1 max-w-md">Automatically terminate administrative sessions after a period of inactivity.</p>
                    </div>
                    <select className="px-4 py-2 rounded-lg border border-slate-200 bg-white text-[13px] font-bold outline-none">
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="none">Never</option>
                    </select>
                  </div>

                  <div className="pt-4">
                    <button className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[13px] font-bold border border-red-200 transition-colors">
                      Terminate All Active Sessions
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
