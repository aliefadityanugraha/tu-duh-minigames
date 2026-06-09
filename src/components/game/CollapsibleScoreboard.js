import React, { useState } from 'react';
import { Trophy, ChevronDown, ChevronUp } from 'lucide-react';

// Peringkat skor yang bisa disembunyikan — untuk tampilan pemain
export default function CollapsibleScoreboard({ players, selfId }) {
  const [open, setOpen] = useState(false);

  const sorted     = [...players].sort((a, b) => b.score - a.score);
  const selfRank   = sorted.findIndex(p => p.id === selfId) + 1;
  const selfPlayer = players.find(p => p.id === selfId);
  const medals     = ['🥇', '🥈', '🥉'];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-flat overflow-hidden">
      <button
        onClick={() => setOpen(p => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Trophy size={13} className="text-amber-500" />
          <span className="text-xs font-semibold text-slate-600">Peringkat</span>
          {/* Tampilkan posisi diri saat collapsed */}
          {!open && selfPlayer && (
            <span className="ml-1 px-2 py-0.5 bg-amber-50 border border-amber-200 rounded-full text-[10px] font-bold text-amber-700 font-mono-tech">
              #{selfRank} · {selfPlayer.score} pts
            </span>
          )}
        </div>
        {open
          ? <ChevronUp size={13} className="text-slate-400" />
          : <ChevronDown size={13} className="text-slate-400" />
        }
      </button>

      {open && (
        <div className="px-4 pb-3 border-t border-slate-100 pt-3 max-h-[200px] overflow-y-auto space-y-1">
          {sorted.map((p, idx) => {
            const isSelf = p.id === selfId;
            return (
              <div
                key={p.id}
                className={`flex justify-between items-center text-xs py-1.5 px-2 rounded-lg ${
                  isSelf ? 'bg-indigo-50 border border-indigo-200' : 'border border-transparent'
                }`}
              >
                <span className={`flex items-center gap-1.5 ${isSelf ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                  <span className="w-5 text-center">{idx < 3 ? medals[idx] : `#${idx + 1}`}</span>
                  <span className={p.isDead ? 'line-through text-slate-400' : ''}>
                    {p.name}
                    {isSelf && <span className="text-indigo-400 font-normal ml-1">(Anda)</span>}
                  </span>
                </span>
                <span className={`font-mono font-bold ${isSelf ? 'text-indigo-600' : 'text-slate-500'}`}>
                  {p.score} pts
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
