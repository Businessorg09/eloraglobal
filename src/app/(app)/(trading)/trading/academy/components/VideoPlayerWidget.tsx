export function VideoPlayerWidget() {
  return (
    <div className="w-full flex flex-col mt-6">
      
      {/* Mock Video Container */}
      <div className="relative w-full aspect-video bg-[#111827] rounded-[24px] overflow-hidden shadow-lg border border-[#374151] group cursor-pointer">
        {/* Mock Video Background Image (using a dark gradient placeholder) */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#1F2937] to-[#111827] flex items-center justify-center">
          {/* Faint Grid/Chart graphic overlay could go here */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#4B5563 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
          
          <div className="text-center z-10 flex flex-col items-center">
             <h2 className="text-white/40 font-bold text-[24px] uppercase tracking-widest mb-4">Lot Sizing Formulation</h2>
             <span className="text-white/20 text-[60px] material-symbols-outlined">monitoring</span>
          </div>
        </div>

        {/* Top Video Overlay Items */}
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <div className="bg-black/50 backdrop-blur-md text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]"></span> REC • 4K 60FPS
          </div>
          <div className="bg-black/50 backdrop-blur-md text-[#059669] px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-white/10">
            FIX 4.4 LATENCY: 2.1ms
          </div>
        </div>

        <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md text-white px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 border border-white/10">
          <span className="material-symbols-outlined text-[14px]">shield</span> Elora Proprietary Engine
        </div>

        {/* Big Play Button Center */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none group-hover:scale-110 transition-transform duration-300">
          <div className="w-16 h-16 bg-[#1D4ED8] rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(29,78,216,0.5)]">
            <span className="material-symbols-outlined text-white text-[32px] ml-1">play_arrow</span>
          </div>
        </div>

        {/* Bottom Video Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-12 pb-4 px-4 flex flex-col">
          <div className="mb-2">
            <span className="text-white/80 text-[10px] font-bold tracking-wider uppercase">Standard Lot Sizing Equation</span>
            <h3 className="text-white text-[18px] font-bold">Lot Size = (Bal × Risk%) / (SL × PipVal)</h3>
          </div>

          <div className="flex items-center gap-4 text-white">
            <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-[#1D4ED8] transition-colors">pause</span>
            <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-[#1D4ED8] transition-colors">replay_10</span>
            <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-[#1D4ED8] transition-colors">forward_10</span>
            <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-[#1D4ED8] transition-colors">volume_up</span>
            
            <div className="flex-1 flex items-center gap-3">
              <span className="text-[11px] font-mono">10:12 / 24:15</span>
              {/* Scrubber Line */}
              <div className="flex-1 h-1.5 bg-white/20 rounded-full cursor-pointer relative">
                <div className="absolute left-0 top-0 bottom-0 bg-[#1D4ED8] rounded-full" style={{ width: '42%' }}></div>
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.03)]" style={{ left: '42%' }}></div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold hover:text-[#1D4ED8] cursor-pointer">1x</span>
              <span className="text-[11px] font-bold bg-white/20 px-1.5 rounded cursor-pointer text-white">1.25x</span>
              <span className="text-[11px] font-bold hover:text-[#1D4ED8] cursor-pointer">1.5x</span>
              <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-[#1D4ED8] transition-colors">closed_caption</span>
              <span className="material-symbols-outlined text-[18px] cursor-pointer hover:text-[#1D4ED8] transition-colors">settings</span>
              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-[#1D4ED8] transition-colors">fullscreen</span>
            </div>
          </div>
        </div>
      </div>

      {/* Lesson Details Below Video */}
      <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#DBEAFE] text-[#1D4ED8] px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">Lesson 03 of 05</span>
            <span className="flex items-center gap-1 text-[#6B7280] text-[11px] font-bold">
              <span className="material-symbols-outlined text-[14px]">schedule</span> Duration: 24 mins 15 secs
            </span>
          </div>
          <h2 className="text-[20px] font-bold text-[#111827]">Lesson 03: Institutional Position Sizing & Dynamic Risk Calculation</h2>
          <p className="text-[13px] text-[#4B5563] mt-1 max-w-[700px]">
            Learn how multi-million dollar prop desks configure fixed-fractional exposure, prevent margin erosion during volatility spikes, and automate position metrics on Forex pairs and XAUUSD.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] bg-white border border-[#E5E7EB] px-3 py-2 rounded-lg text-[12px] font-bold transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <span className="material-symbols-outlined text-[16px]">bookmark_add</span> Bookmark Stamp (10:12)
          </button>
          <button className="flex items-center gap-2 text-[#4B5563] hover:text-[#111827] bg-white border border-[#E5E7EB] px-3 py-2 rounded-lg text-[12px] font-bold transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
            <span className="material-symbols-outlined text-[16px]">share</span> Share Segment
          </button>
        </div>
      </div>

    </div>
  )
}
