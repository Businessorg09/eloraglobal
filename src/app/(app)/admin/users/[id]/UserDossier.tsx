'use client';

import { useState } from 'react';
import { 
  updateKycStatusAction, 
  updateUserProfileAction, 
  updateUserSecurityAction, 
  updateUserBankingAction, 
  updateSponsorAction, 
  updatePackageAction, 
  adjustUserBalanceAction,
  lookupSponsorAction
} from './actions';

export default function UserDossier({ user, parentNode, treeNode, authMeta, wallet, rank, directReferralsCount, transactions, currentSponsor }: any) {
  const [activeTab, setActiveTab] = useState('profile');
  const [isUpdatingKyc, setIsUpdatingKyc] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [profile, setProfile] = useState({ fullName: user.full_name, email: user.email });
  const [sponsorId, setSponsorId] = useState('');
  const [lookedUpSponsor, setLookedUpSponsor] = useState<any>(null);
  const [bank, setBank] = useState({
    bankName: authMeta?.bank_details?.bankName || '',
    accNumber: authMeta?.bank_details?.accNumber || '',
    ifsc: authMeta?.bank_details?.ifsc || '',
    accHolder: authMeta?.bank_details?.accHolder || '',
    cryptoAddress: authMeta?.crypto_details?.cryptoAddress || '',
    upiId: authMeta?.upi_details?.upiId || ''
  });
  const [security, setSecurity] = useState({ password: '', pin: authMeta?.transaction_pin || '' });
  const [balanceAdj, setBalanceAdj] = useState({ amount: 0, isAddition: true });
  const [selectedPackage, setSelectedPackage] = useState('');

  const tabs = [
    { id: 'profile', icon: 'badge', label: 'A. Personal & Profile' },
    { id: 'tree', icon: 'account_tree', label: 'B. Tree & Sponsorship' },
    { id: 'kyc', icon: 'fact_check', label: 'C. KYC & Statutory' },
    { id: 'bank', icon: 'account_balance', label: 'D. Payout Methods' },
    { id: 'ledger', icon: 'price_change', label: 'E. Financial Balances' },
    { id: 'capping', icon: 'tune', label: 'F. Rank & Package' },
    { id: 'security', icon: 'security', label: 'G. Security & Access' },
  ];

  const handleKycUpdate = async (status: 'verified' | 'rejected') => {
    setIsUpdatingKyc(true);
    await updateKycStatusAction(user.id, status === 'verified');
    setIsUpdatingKyc(false);
    window.location.reload(); 
  };

  const handleProfileUpdate = async () => {
    setLoading(true);
    try {
      await updateUserProfileAction(user.id, profile.fullName, profile.email);
      alert('Profile updated');
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleSponsorLookup = async () => {
    if (!sponsorId) return;
    setLoading(true);
    try {
      const data = await lookupSponsorAction(sponsorId);
      if (data) {
        setLookedUpSponsor(data);
      } else {
        setLookedUpSponsor(null);
        alert('Sponsor not found.');
      }
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleSponsorUpdate = async () => {
    if (!lookedUpSponsor) return alert('Please lookup a valid sponsor first.');
    setLoading(true);
    try {
      await updateSponsorAction(user.id, lookedUpSponsor.id);
      alert('Sponsor updated successfully');
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleBankUpdate = async () => {
    setLoading(true);
    try {
      await updateUserBankingAction(user.id, bank.bankName, bank.accNumber, bank.ifsc, bank.accHolder, bank.cryptoAddress, bank.upiId);
      alert('Payout Methods updated');
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleSecurityUpdate = async () => {
    setLoading(true);
    try {
      await updateUserSecurityAction(user.id, security.password || undefined, security.pin || undefined);
      alert('Security credentials updated');
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleBalanceAdj = async () => {
    if (balanceAdj.amount <= 0) return alert('Enter valid amount');
    setLoading(true);
    try {
      await adjustUserBalanceAction(user.id, balanceAdj.amount * 100, balanceAdj.isAddition);
      alert('Balance adjusted');
      window.location.reload();
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handlePackageUpdate = async () => {
    if (!selectedPackage) return;
    setLoading(true);
    try {
      await updatePackageAction(user.id, selectedPackage);
      alert('Package activated');
      window.location.reload();
    } catch(e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <>
      {/* Top Node Telemetry */}
      <div className="w-full bg-surface-container-lowest rounded-xl p-gutter-lg shadow-sm flex flex-col xl:flex-row xl:items-center justify-between gap-gutter-lg">
        <div className="flex flex-wrap items-center gap-gutter-md">
          <div className="relative w-16 h-16 rounded-xl overflow-hidden shadow-sm flex-shrink-0 bg-primary/20 flex items-center justify-center">
            <span className="font-headline-xl text-primary font-bold">{user.full_name?.charAt(0)}</span>
            <span className={`absolute bottom-1 right-1 w-3.5 h-3.5 rounded-full ${user.is_active ? 'bg-tertiary' : 'bg-outline'} shadow-sm`}></span>
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-headline-xl text-headline-xl text-on-surface font-bold tracking-tight">{user.full_name}</h1>
              <span className="px-2 py-0.5 rounded bg-surface-container-high text-primary font-label-sm text-label-sm font-semibold tracking-wider uppercase">
                {user.username}
              </span>
              <span className={`px-2 py-0.5 rounded-full font-label-sm text-label-sm font-bold tracking-wide ${user.is_active ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-surface-container text-on-surface-variant'}`}>
                {user.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-outline mt-1 font-body-sm text-body-sm">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">mail</span>{user.email}</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[15px]">calendar_today</span>Joined: {new Date(user.created_at).toLocaleDateString()}</span>
              {treeNode && (
                 <span className="flex items-center gap-1 text-on-surface font-label-md text-label-md">
                   <span className="material-symbols-outlined text-primary text-[16px]">account_tree</span>
                   L: {treeNode.left_bv} BV | R: {treeNode.right_bv} BV
                 </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Deep Granular Master Workspace Layout */}
      <div className="w-full flex flex-col lg:flex-row gap-gutter-lg items-start mt-6">
        
        {/* Vertical Tab Governance Controller */}
        <div className="w-full lg:w-72 bg-surface-container-lowest rounded-xl p-2.5 shadow-sm flex-shrink-0 flex lg:flex-col gap-1 overflow-x-auto">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-lg font-label-md text-label-md font-semibold transition-all text-left whitespace-nowrap
                ${activeTab === tab.id 
                  ? 'bg-surface-container-high text-primary' 
                  : 'text-on-surface-variant hover:bg-surface-container'}`}
            >
              <span className="material-symbols-outlined text-[20px]">{tab.icon}</span>
              <span className="flex-1 truncate">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Active Tab Presentation Viewport */}
        <div className="flex-1 w-full min-w-0 bg-surface-container-lowest rounded-xl p-gutter-xl shadow-sm">
          
          {/* TAB A: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-gutter-lg animate-in fade-in">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Personal & Contact Dossier</h2>
                <p className="font-body-sm text-body-sm text-outline">Update basic user information.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm uppercase text-outline font-semibold">Full Name</label>
                  <input type="text" value={profile.fullName} onChange={e => setProfile({...profile, fullName: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm uppercase text-outline font-semibold">Primary Email UID</label>
                  <input type="email" value={profile.email} onChange={e => setProfile({...profile, email: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low text-on-surface font-body-md text-body-md rounded-lg" />
                </div>
              </div>
              <button disabled={loading} onClick={handleProfileUpdate} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Save Profile</button>
            </div>
          )}

          {/* TAB B: TREE */}
          {activeTab === 'tree' && (
            <div className="space-y-gutter-lg animate-in fade-in">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Binary Tree Placement & Sponsorship Topology</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-6">
                  <div className="bg-surface-container-low p-4 rounded-xl">
                    <p className="font-label-sm text-outline uppercase font-semibold">Direct Referrals</p>
                    <p className="font-display-sm text-on-surface font-bold mt-1">{directReferralsCount}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-tertiary">
                    <p className="font-label-sm text-outline uppercase font-semibold">Total Left BV</p>
                    <p className="font-display-sm text-on-surface font-bold mt-1">{treeNode?.left_bv || 0}</p>
                  </div>
                  <div className="bg-surface-container-low p-4 rounded-xl border-l-4 border-tertiary">
                    <p className="font-label-sm text-outline uppercase font-semibold">Total Right BV</p>
                    <p className="font-display-sm text-on-surface font-bold mt-1">{treeNode?.right_bv || 0}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4 max-w-md">
                <div className="bg-surface-container-low p-4 rounded-xl border border-surface-container">
                  <p className="font-label-sm text-outline uppercase font-semibold">Current Sponsor</p>
                  {currentSponsor ? (
                    <div className="mt-2">
                      <p className="font-semibold text-on-surface">{currentSponsor.full_name}</p>
                      <p className="font-body-sm text-outline text-[13px]">{currentSponsor.email} | ID: {currentSponsor.id}</p>
                    </div>
                  ) : (
                    <p className="font-body-sm text-outline mt-1">No direct sponsor.</p>
                  )}
                </div>
                
                <div className="space-y-1.5">
                  <label className="font-label-sm text-label-sm uppercase text-outline font-semibold">Lookup New Sponsor (Username, Email, or ID)</label>
                  <div className="flex gap-2">
                    <input type="text" value={sponsorId} onChange={e => { setSponsorId(e.target.value); setLookedUpSponsor(null); }} placeholder="Enter username or email..." className="flex-1 px-3.5 py-2 bg-surface-container-lowest border border-surface-container text-on-surface font-body-md text-body-md rounded-lg focus:outline-none focus:ring-1 focus:ring-primary" />
                    <button disabled={loading} onClick={handleSponsorLookup} className="px-4 py-2 bg-surface-container-high text-on-surface font-semibold rounded-lg hover:bg-surface-container-highest transition-colors">Lookup</button>
                  </div>
                </div>

                {lookedUpSponsor && (
                  <div className="bg-primary-container/20 p-4 rounded-xl border border-primary/20">
                    <p className="font-label-sm text-primary uppercase font-bold flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">check_circle</span> New Sponsor Found</p>
                    <div className="mt-2 text-on-surface">
                      <p className="font-bold">{lookedUpSponsor.full_name}</p>
                      <p className="font-body-sm text-[13px] text-outline">{lookedUpSponsor.email}</p>
                    </div>
                  </div>
                )}
                
                <button disabled={loading || !lookedUpSponsor} onClick={handleSponsorUpdate} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed">Save New Sponsor</button>
              </div>
            </div>
          )}

          {/* TAB C: KYC */}
          {activeTab === 'kyc' && (
            <div className="space-y-gutter-lg animate-in fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Statutory Compliance & KYC Audits</h2>
                  <p className="font-body-sm text-body-sm text-outline">Government tax credentials, national ID verification.</p>
                </div>
                <span className={`px-3 py-1 rounded-full font-label-md text-label-md font-bold ${user.kyc_verified ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' : 'bg-error-container text-on-error-container'}`}>
                  {user.kyc_verified ? 'CLEARANCE PASSED' : 'PENDING'}
                </span>
              </div>
              <div className="p-gutter-md rounded-xl bg-surface-container-high space-y-3 mt-6">
                <span className="font-label-sm text-label-sm text-on-surface uppercase font-bold">Admin Manual KYC Override Decision</span>
                <div className="flex flex-wrap items-center gap-3">
                  <button 
                    disabled={isUpdatingKyc}
                    onClick={() => handleKycUpdate('verified')}
                    className="px-4 py-2 rounded-lg bg-tertiary text-on-tertiary font-label-md text-label-md font-semibold flex items-center gap-1.5 shadow-sm hover:opacity-90">
                    <span className="material-symbols-outlined text-[18px]">check_circle</span> Approve KYC
                  </button>
                  <button 
                    disabled={isUpdatingKyc}
                    onClick={() => handleKycUpdate('rejected')}
                    className="px-4 py-2 rounded-lg bg-surface-container text-error font-label-md text-label-md font-semibold hover:bg-error-container flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">cancel</span> Reject & Reset
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB D: BANK */}
          {activeTab === 'bank' && (
            <div className="space-y-gutter-lg animate-in fade-in">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Payout Methods</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">Bank Name</label>
                  <input type="text" value={bank.bankName} onChange={e => setBank({...bank, bankName: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">Account Number</label>
                  <input type="text" value={bank.accNumber} onChange={e => setBank({...bank, accNumber: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">IFSC Code</label>
                  <input type="text" value={bank.ifsc} onChange={e => setBank({...bank, ifsc: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">Account Holder Name</label>
                  <input type="text" value={bank.accHolder} onChange={e => setBank({...bank, accHolder: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">USDT (TRC20) Crypto Address</label>
                  <input type="text" value={bank.cryptoAddress} onChange={e => setBank({...bank, cryptoAddress: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">UPI ID / VPA</label>
                  <input type="text" value={bank.upiId} onChange={e => setBank({...bank, upiId: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
              </div>
              <button disabled={loading} onClick={handleBankUpdate} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Save Payout Methods</button>
            </div>
          )}

          {/* TAB E: FINANCIAL */}
          {activeTab === 'ledger' && (
            <div className="space-y-gutter-lg animate-in fade-in">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Financial Balances</h2>
                <p className="font-body-sm text-outline">Current Total Balance: ₹{((wallet?.total_balance_paise || 0) / 100).toLocaleString('en-IN')}</p>
              </div>
              <div className="p-gutter-md rounded-xl bg-surface-container-high space-y-4 max-w-md">
                <h3 className="font-bold text-on-surface">Manual Balance Adjustment (Double-Entry Ledger)</h3>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2"><input type="radio" checked={balanceAdj.isAddition} onChange={() => setBalanceAdj({...balanceAdj, isAddition: true})} /> Add Funds</label>
                  <label className="flex items-center gap-2"><input type="radio" checked={!balanceAdj.isAddition} onChange={() => setBalanceAdj({...balanceAdj, isAddition: false})} /> Deduct Funds</label>
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">Amount (INR)</label>
                  <input type="number" value={balanceAdj.amount} onChange={e => setBalanceAdj({...balanceAdj, amount: Number(e.target.value)})} className="w-full px-3.5 py-2 bg-surface-container-lowest rounded-lg" />
                </div>
                <button disabled={loading} onClick={handleBalanceAdj} className={`px-4 py-2 text-white rounded-lg font-semibold ${balanceAdj.isAddition ? 'bg-tertiary' : 'bg-error'}`}>
                  Execute {balanceAdj.isAddition ? 'Credit' : 'Debit'}
                </button>
              </div>

              <div className="mt-8">
                <h3 className="font-headline-md text-on-surface font-bold mb-4">Transaction Ledger (Recent)</h3>
                <div className="bg-surface-container-lowest rounded-xl border border-surface-container overflow-hidden">
                  <table className="w-full text-left font-body-sm text-body-sm">
                    <thead className="bg-surface-container-low text-outline font-label-sm uppercase tracking-wider">
                      <tr>
                        <th className="p-3">Date</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Description</th>
                        <th className="p-3 text-right">Amount (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container">
                      {transactions?.length > 0 ? transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-surface-container-low/50">
                          <td className="p-3 text-outline">{new Date(tx.created_at).toLocaleDateString()}</td>
                          <td className="p-3 font-semibold">{tx.transaction_type}</td>
                          <td className="p-3">{tx.description}</td>
                          <td className="p-3 text-right font-mono font-bold text-tertiary">
                            ₹{(tx.amount_paise / 100).toLocaleString('en-IN')}
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan={4} className="p-6 text-center text-outline">No transactions found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB F: CAPPING */}
          {activeTab === 'capping' && (
            <div className="space-y-gutter-lg animate-in fade-in">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Rank & Activation Package</h2>
                <p className="font-body-sm text-outline">Current Rank: {rank?.current_rank || 'NONE'} | Weekly Cap: ₹{((rank?.weekly_binary_cap_paise || 0) / 100).toLocaleString('en-IN')}</p>
              </div>
              <div className="space-y-1.5 max-w-md">
                <label className="font-label-sm uppercase text-outline font-semibold">Assign Package (Bumps Rank & Caps)</label>
                <select value={selectedPackage} onChange={e => setSelectedPackage(e.target.value)} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg">
                  <option value="">-- Select Package --</option>
                  <option value="d046dcd1-7ea5-456b-aab8-e4e7f8ca19e4">Starter (₹4,825)</option>
                  <option value="20613a7b-7bc9-46c8-ac8e-b9def4c78ba4">Pro (₹16,899)</option>
                  <option value="dcc3d1e7-a9fc-480f-a269-9e2de06b7d40">Elite (₹53,200)</option>
                </select>
              </div>
              <button disabled={loading} onClick={handlePackageUpdate} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Activate Package</button>
            </div>
          )}

          {/* TAB G: SECURITY */}
          {activeTab === 'security' && (
            <div className="space-y-gutter-lg animate-in fade-in">
              <div>
                <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Security & Access</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter-md">
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">Reset Password (Leave blank to keep current)</label>
                  <input type="password" placeholder="New password" value={security.password} onChange={e => setSecurity({...security, password: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
                <div className="space-y-1.5">
                  <label className="font-label-sm uppercase text-outline font-semibold">Transaction PIN</label>
                  <input type="text" value={security.pin} onChange={e => setSecurity({...security, pin: e.target.value})} className="w-full px-3.5 py-2 bg-surface-container-low rounded-lg" />
                </div>
              </div>
              <button disabled={loading} onClick={handleSecurityUpdate} className="px-4 py-2 bg-primary text-on-primary rounded-lg font-semibold">Update Security</button>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
