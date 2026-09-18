'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UserTable({ initialData }: { initialData: any[] }) {
  const [data, setData] = useState(initialData)
  const [search, setSearch] = useState('')

  const filteredData = data.filter(u => 
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex flex-col gap-gutter-lg">
      <div className="flex items-center justify-between bg-surface-container-lowest p-gutter-lg rounded-xl shadow-sm">
        <div>
          <h2 className="font-headline-lg text-headline-lg font-bold text-on-surface">Member Governance Registry</h2>
          <p className="font-body-sm text-body-sm text-outline">Manage and audit all platform distributors.</p>
        </div>
        <div className="relative w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-outline">
            <span className="material-symbols-outlined text-[18px]">search</span>
          </div>
          <input 
            type="text" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm font-body-sm rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-container transition-all" 
            placeholder="Search UID, name, email..."
          />
        </div>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left font-body-sm text-body-sm">
            <thead className="bg-surface-container-low text-outline font-label-sm text-label-sm uppercase tracking-wider">
              <tr>
                <th className="p-4 font-semibold">User</th>
                <th className="p-4 font-semibold">UID</th>
                <th className="p-4 font-semibold">Status</th>
                <th className="p-4 font-semibold">KYC</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container">
              {filteredData.map((user) => (
                <tr key={user.id} className="hover:bg-surface-container-low/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold">
                        {user.full_name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="font-semibold text-on-surface">{user.full_name}</div>
                        <div className="text-outline">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 font-mono text-on-surface-variant">{user.username}</td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${
                      user.is_active 
                        ? 'bg-tertiary/10 text-tertiary' 
                        : 'bg-surface-container text-outline'
                    }`}>
                      {user.is_active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={`px-2.5 py-1 rounded-full font-label-sm text-label-sm font-bold ${
                      user.kyc_verified 
                        ? 'bg-tertiary-fixed text-on-tertiary-fixed-variant' 
                        : 'bg-error-container text-on-error-container'
                    }`}>
                      {user.kyc_verified ? 'VERIFIED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <Link href={`/admin/users/${user.id}`} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors">
                      <span className="material-symbols-outlined text-[16px]">visibility</span>
                      Dossier
                    </Link>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-outline">
                    No members found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
