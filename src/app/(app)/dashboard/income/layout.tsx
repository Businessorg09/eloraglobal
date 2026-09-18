'use client'
import Sidebar from '@/components/dashboard/Sidebar'
import Header from '@/components/dashboard/Header'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

export default function IncomeLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      router.push('/login')
    } catch (err) {
      console.error('Logout failed')
    }
  }

  return (
    <div className="bg-[#f4f7fc] text-slate-800 font-sans antialiased min-h-screen flex overflow-x-hidden w-full relative z-0">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="w-full px-4 md:px-margin-page py-gutter-lg bg-surface min-h-screen pb-28 md:pb-6">
          <div className="flex flex-col w-full space-y-gutter-lg">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-gutter-md">
              <div className="space-y-1">
                <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">Income Reports</h1>
                <p className="font-body-sm text-body-sm text-on-surface-variant max-w-3xl">Track your earnings across all income streams</p>
              </div>
            </div>

            {/* Sub-Nav Tabs */}
            <div className="bg-surface-container-lowest rounded-xl shadow-sm p-1.5 overflow-x-auto">
              <div className="flex items-center gap-1 min-w-max">
                <Link href="/dashboard/income/binary" className={`px-4 py-2 rounded-lg font-label-md font-bold flex items-center gap-2 transition-all ${pathname === '/dashboard/income/binary' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}>
                  Binary Income
                </Link>
                <Link href="/dashboard/income/trading" className={`px-4 py-2 rounded-lg font-label-md font-bold flex items-center gap-2 transition-all ${pathname === '/dashboard/income/trading' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}>
                  Trading Income
                </Link>
                <Link href="/dashboard/income/sponsor" className={`px-4 py-2 rounded-lg font-label-md font-bold flex items-center gap-2 transition-all ${pathname === '/dashboard/income/sponsor' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}>
                  Sponsor Income
                </Link>
                <Link href="/dashboard/income/leadership" className={`px-4 py-2 rounded-lg font-label-md font-bold flex items-center gap-2 transition-all ${pathname === '/dashboard/income/leadership' ? 'bg-surface-container-low text-primary' : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low'}`}>
                  Leadership Pool
                </Link>
              </div>
            </div>

            {/* Page Content */}
            <div className="mt-4">
              {children}
            </div>
            
          </div>
        </main>
      </div>
    </div>
  )
}
