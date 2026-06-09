import React from 'react';

export default function TaskProgressBar({ tasksCompleted = 0, tasksRequired = 1 }) {
  const pct = Math.min(100, Math.round((tasksCompleted / tasksRequired) * 100));

  const barColor =
    pct < 40 ? 'bg-emerald-500'
    : pct < 70 ? 'bg-amber-500'
    : 'bg-emerald-600';

  return (
    <div className="w-full space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-500 uppercase tracking-wider">🇮🇩 Misi Kelompok</span>
        <span className="font-mono-tech text-slate-700">
          {tasksCompleted}
          <span className="text-slate-400">/{tasksRequired}</span>
          <span className="ml-1.5 text-amber-600 font-bold">({pct}%)</span>
        </span>
      </div>

      <div className="relative w-full h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
        <div
          className={`absolute inset-y-0 left-0 ${barColor} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${pct}%` }}
        />
        {pct > 0 && pct < 100 && (
          <div className="absolute inset-y-0 left-0 rounded-full overflow-hidden" style={{ width: `${pct}%` }}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]" />
          </div>
        )}
        {pct >= 15 && (
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white">
            {pct}%
          </span>
        )}
      </div>

      <div className="flex justify-between text-[9px] text-slate-400 font-mono px-0.5">
        <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
      </div>
    </div>
  );
}
