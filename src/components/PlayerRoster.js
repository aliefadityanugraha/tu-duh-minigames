import React from 'react';

export default function PlayerRoster({ players = [], selfId, isGuruView = false }) {
  return (
    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
      {players.map((p, idx) => {
        const isSelf = p.id === selfId;

        const avatarColors = [
          'bg-red-100 text-red-700 border-red-200',
          'bg-blue-100 text-blue-700 border-blue-200',
          'bg-green-100 text-green-700 border-green-200',
          'bg-yellow-100 text-yellow-700 border-yellow-200',
          'bg-pink-100 text-pink-700 border-pink-200',
          'bg-purple-100 text-purple-700 border-purple-200',
          'bg-orange-100 text-orange-700 border-orange-200',
          'bg-cyan-100 text-cyan-700 border-cyan-200',
        ];

        const colorClass = p.isGuru
          ? 'bg-amber-100 text-amber-700 border-amber-200'
          : avatarColors[idx % avatarColors.length];

        return (
          <div
            key={p.id}
            className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
              p.isGuru
                ? 'bg-amber-50 border-amber-200'
                : p.isDead
                ? 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                : isSelf
                ? 'bg-indigo-50 border-indigo-200'
                : 'bg-white border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 text-sm ${colorClass}`}>
                {p.isGuru ? '🏫' : p.isDead ? '💀' : '🧑‍🚀'}
              </div>
              <div className="min-w-0">
                <span className={`block truncate max-w-[110px] text-sm font-semibold ${
                  isSelf ? 'text-indigo-600' : 'text-slate-700'
                }`}>
                  {p.name}
                  {isSelf && <span className="ml-1 text-[10px] text-slate-400 font-normal">(Anda)</span>}
                </span>

                {isGuruView && !p.isGuru && (
                  <span className={`text-[9px] font-bold uppercase tracking-wider block mt-0.5 ${
                    p.role === 'provokator' ? 'text-red-500' : 'text-emerald-600'
                  }`}>
                    {p.role === 'provokator' ? '😈 Provokator' : '🇮🇩 Warga'}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="text-xs px-2 py-0.5 bg-slate-100 text-slate-600 rounded-lg font-mono-tech font-semibold border border-slate-200">
                {p.score} pt
              </span>
              {p.isDead && (
                <span className="text-[8px] uppercase font-bold text-white bg-red-500 px-1.5 py-0.5 rounded tracking-wider">
                  ELIM
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
