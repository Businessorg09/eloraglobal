export function PipelineTracker() {
  const stages = [
    { num: '01', title: 'Learn', subtitle: 'Foundation Core', status: 'Passed', percent: '100%', type: 'cleared' },
    { num: '02', title: 'Watch', subtitle: 'Modules 01-07', status: 'Cleared', percent: '100%', type: 'cleared' },
    { num: '03', title: 'Test', subtitle: 'Phase 1 Exam', status: 'Score', percent: '88%', type: 'cleared' },
    { num: '04', title: 'Qualify', subtitle: 'Phase 2 Matrix', status: 'Ready to Sit', type: 'active' },
    { num: '05', title: 'Practice', subtitle: 'Sim Paper Engine', status: 'Provisioned', type: 'locked' },
    { num: '06', title: 'Analyze', subtitle: 'Execution Journal', status: 'Connected', type: 'locked' },
    { num: '07', title: 'Trade', subtitle: '$100k Live Alloc', status: 'Reserved', type: 'locked' },
    { num: '08', title: 'Review', subtitle: 'AI Copilot Audit', status: 'Stage Ready', type: 'locked' },
    { num: '09', title: 'Progress', subtitle: '100k Profit Split', status: '80/20 Payout', type: 'locked' },
  ]

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-4 md:p-6 w-full">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-[#1D4ED8]">account_tree</span>
          <h2 className="font-bold text-[16px] text-[#111827]">Institutional Trader Pipeline</h2>
          <span className="text-[13px] text-[#6B7280] ml-2">Stage 04 of 09: Dynamic Risk Engine</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-bold text-[#6B7280] uppercase tracking-wider">
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#059669]"></span> Cleared</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#1D4ED8]"></span> Active Focus</div>
          <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full border-2 border-[#D1D5DB]"></span> Locked</div>
        </div>
      </div>

      <div className="flex justify-between items-stretch">
        {stages.map((stage, idx) => (
          <div key={idx} className="flex-1 flex flex-col relative group">
            {/* Connecting line */}
            {idx < stages.length - 1 && (
              <div className={`absolute top-4 left-[50%] right-[-50%] h-[2px] z-0 ${
                stage.type === 'cleared' ? 'bg-[#059669]' : 'bg-[#E5E7EB]'
              }`}></div>
            )}
            
            {/* Node Content */}
            <div className={`
              z-10 flex flex-col h-[130px] p-3 rounded-lg border-2 transition-all mx-1
              ${stage.type === 'active' ? 'bg-[#1D4ED8] border-[#1D4ED8] shadow-[0_4px_12px_rgba(11,77,255,0.3)] transform -translate-y-1' : 
                stage.type === 'cleared' ? 'bg-white border-[#E5E7EB] hover:border-[#059669]' : 
                'bg-white border-transparent'}
            `}>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[12px] font-mono font-bold ${stage.type === 'active' ? 'text-white/80' : 'text-[#9CA3AF]'}`}>{stage.num}</span>
                <span className={`material-symbols-outlined text-[14px] ${
                  stage.type === 'cleared' ? 'text-[#059669]' : 
                  stage.type === 'active' ? 'text-white' : 'text-[#D1D5DB]'
                }`}>
                  {stage.type === 'cleared' ? 'check_circle' : stage.type === 'active' ? 'lock_open' : 'lock'}
                </span>
              </div>
              
              <div className={`text-[14px] font-bold leading-tight ${stage.type === 'active' ? 'text-white' : 'text-[#111827]'}`}>
                {idx + 1}. {stage.title}
              </div>
              <div className={`text-[10px] mt-0.5 font-medium leading-tight ${stage.type === 'active' ? 'text-white/80' : 'text-[#6B7280]'}`}>
                {stage.subtitle}
              </div>
              
              <div className="mt-auto flex flex-col">
                {stage.percent && (
                  <span className={`text-[14px] font-bold ${stage.type === 'cleared' ? 'text-[#059669]' : ''}`}>{stage.percent}</span>
                )}
                <span className={`text-[11px] font-bold ${
                  stage.type === 'active' ? 'text-white' : 
                  stage.type === 'cleared' ? 'text-[#059669]' : 'text-[#9CA3AF]'
                }`}>{stage.status}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
