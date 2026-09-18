import AdminTradingSidebar from './AdminTradingSidebar';

export default function AdminTradingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#F8FAFC] font-sans text-slate-900 antialiased min-h-screen flex w-full">
      
      {/* Client Sidebar — handles usePathname, useState, logout */}
      <AdminTradingSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="hidden lg:flex sticky top-0 h-[72px] bg-white border-b border-slate-200 z-40 items-center justify-between px-8">
          
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <span className="material-symbols-outlined text-[18px]">search</span>
              </div>
              <input
                type="text"
                className="w-full pl-9 pr-12 py-2 bg-[#F8FAFC] border border-slate-200 text-slate-900 placeholder:text-slate-400 text-[13px] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:border-transparent transition-all"
                placeholder="Search users, courses, transactions..."
              />
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none">
                <span className="text-[10px] font-bold text-slate-400 bg-white border border-slate-200 px-1.5 py-0.5 rounded shadow-sm">⌘K</span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-3 py-1.5">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="text-[12px] font-bold text-[#10B981]">All Systems Operational</span>
            </div>
            
            <div className="flex items-center gap-4 text-slate-400">
              <button className="hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">notifications</span>
              </button>
              <button className="hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined text-[20px]">tune</span>
              </button>
            </div>
          </div>
        </header>

        <main className="w-full p-4 lg:p-8 flex-1 bg-[#F8FAFC]">
          {children}
        </main>
      </div>
    </div>
  );
}
