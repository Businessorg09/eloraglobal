export function ExamHistoryWidget() {
  const history = [
    { name: 'Phase 1: Foundation Core', date: 'Aug 14, 2025', score: '92%', status: 'Passed', icon: 'workspace_premium', color: '#059669', bg: '#ECFDF5', border: '#D1FAE5' },
    { name: 'SMC Setup Recognition Mock', date: 'Aug 21, 2025', score: '78%', status: 'Retake Needed', icon: 'replay', color: '#EF4444', bg: '#FEF2F2', border: '#FEE2E2' },
    { name: 'SMC Setup Recognition Retake', date: 'Aug 24, 2025', score: '96%', status: 'Passed', icon: 'verified', color: '#1D4ED8', bg: '#DBEAFE', border: '#BFDBFE' },
  ]

  return (
    <div className="bg-white rounded-[24px] shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-[#E5E7EB] p-6 flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-[16px] text-[#111827] flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1D4ED8]">history</span> Evaluation History
        </h3>
        <button className="text-[#1D4ED8] font-bold text-[11px] hover:text-[#1E40AF] transition-colors">View Transcripts</button>
      </div>

      <div className="flex flex-col gap-3">
        {history.map((exam, idx) => (
          <div key={idx} className="flex items-center justify-between p-4 rounded-[24px] border border-[#E5E7EB] hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-shadow cursor-pointer bg-[#F8FAFC]">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: exam.bg, color: exam.color, border: `1px solid ${exam.border}` }}>
                <span className="material-symbols-outlined text-[20px]">{exam.icon}</span>
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-[13px] text-[#111827] leading-tight">{exam.name}</span>
                <span className="text-[11px] text-[#6B7280] mt-0.5">{exam.date}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-end">
              <span className="font-bold text-[16px]" style={{ color: exam.color }}>{exam.score}</span>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: exam.color }}>{exam.status}</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-[#EFF6FF] border border-[#DBEAFE] rounded-[24px] flex items-start gap-3">
        <span className="material-symbols-outlined text-[#1D4ED8]">info</span>
        <p className="text-[11px] text-[#1D4ED8] font-medium leading-relaxed">
          Elora Prop Firm strictly requires an 85% passing grade on all Phase Final Exams to maintain Tier Scholar status and unlock funding pathways.
        </p>
      </div>
    </div>
  )
}
