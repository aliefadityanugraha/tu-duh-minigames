import React, { useState } from 'react';
import { Vote, Timer } from 'lucide-react';

export default function DebateOverlay({ debate, players, selfId, isGuru, isPlayerDead, onVote }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);

  const DEBATE_MAX = 90;
  const timerPct = Math.max(0, ((debate?.timer ?? 0) / DEBATE_MAX) * 100);
  const isUrgent = (debate?.timer ?? 0) <= 20;

  const eligibleVoters = players.filter(p => !p.isDead && !p.isGuru);
  const votablePlayers = players.filter(p => !p.isGuru);

  const handleVote = (targetId) => {
    if (hasVoted || isPlayerDead || isGuru) return;
    setHasVoted(true);
    setVotedFor(targetId);
    onVote(targetId);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="absolute inset-0 border-4 border-cyan-400/20 pointer-events-none" />

      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-flat-lg border border-cyan-300 overflow-hidden">
        {/* Timer bar */}
        <div className="w-full h-1.5 bg-slate-100">
          <div
            className={`h-full transition-all duration-1000 ease-linear ${isUrgent ? 'bg-red-500 animate-pulse' : 'bg-cyan-500'}`}
            style={{ width: `${timerPct}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-cyan-100 border border-cyan-300 flex items-center justify-center text-2xl">📢</div>
              <div>
                <h2 className="text-xl font-extrabold text-cyan-700 tracking-wide uppercase font-mono-tech">Musyawarah Mufakat</h2>
                <p className="text-slate-500 text-xs mt-0.5 font-medium">
                  {debate.reason === 'teacher_pause'
                    ? 'Sesi dipimpin Guru — Diskusikan kecurigaan Provokator!'
                    : 'Sidang Darurat! Nilai Pancasila terancam.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-center bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                <div className="text-[9px] text-slate-400 uppercase tracking-wider font-semibold">Suara</div>
                <div className="font-bold font-mono-tech text-slate-700">
                  {debate.votesReceivedCount}<span className="text-slate-400">/{eligibleVoters.length}</span>
                </div>
              </div>

              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
                isUrgent ? 'border-red-300 bg-red-50 animate-pulse' : 'border-cyan-200 bg-cyan-50'
              }`}>
                <Timer size={15} className={isUrgent ? 'text-red-500' : 'text-cyan-600'} />
                <span className={`text-2xl font-bold font-mono-tech ${isUrgent ? 'text-red-600' : 'text-cyan-700'}`}>
                  {debate.timer}s
                </span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-cyan-50 rounded-xl border border-cyan-200 space-y-1">
            <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Vote size={14} className="text-cyan-600" />
              Pilih Pemain yang Anda Curigai sebagai Provokator
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Berdasarkan Sila ke-4 — Musyawarahkan secara lisan di kelas, kemudian daftarkan suara rahasia Anda. Pemain dengan suara terbanyak akan dieliminasi.
            </p>
          </div>

          {/* Voted confirmation */}
          {hasVoted && !isGuru && (
            <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-xl text-center text-xs text-cyan-700 font-semibold">
              ✅ Suara tercatat untuk: <strong className="text-slate-800">
                {votedFor === 'skip' ? 'Skip' : players.find(p => p.id === votedFor)?.name ?? '—'}
              </strong>. Menunggu pemain lain...
            </div>
          )}

          {/* Vote grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[240px] overflow-y-auto pr-1">
            {votablePlayers.map(p => {
              const isSelf   = p.id === selfId;
              const isDead   = p.isDead;
              const disabled = hasVoted || isPlayerDead || isGuru || isDead;

              return (
                <button
                  key={p.id}
                  onClick={() => handleVote(p.id)}
                  disabled={disabled}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                    isDead
                      ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed opacity-50'
                      : votedFor === p.id
                      ? 'bg-cyan-50 border-cyan-400 text-slate-800 font-semibold'
                      : disabled
                      ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                      : 'bg-white border-slate-200 text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-lg flex-shrink-0">{isDead ? '💀' : '🧑‍🚀'}</span>
                    <div className="min-w-0">
                      <span className={`block text-sm font-medium truncate ${isSelf ? 'text-cyan-600 font-semibold' : ''}`}>
                        {p.name} {isSelf && '(Anda)'}
                      </span>
                      {isDead && <span className="text-[9px] text-slate-400 font-mono uppercase">Sudah Tereliminasi</span>}
                    </div>
                  </div>

                  {!isDead && !disabled && (
                    <span className="text-[9px] bg-cyan-100 text-cyan-700 border border-cyan-300 px-2 py-0.5 rounded uppercase font-bold tracking-wider flex-shrink-0 ml-2">
                      Vote
                    </span>
                  )}
                  {votedFor === p.id && <span className="text-cyan-600 text-lg flex-shrink-0 ml-2">✓</span>}
                </button>
              );
            })}

            {/* Skip */}
            <button
              onClick={() => handleVote('skip')}
              disabled={hasVoted || isPlayerDead || isGuru}
              className={`md:col-span-2 flex items-center justify-between p-3.5 rounded-xl border transition-all active:scale-[0.98] ${
                votedFor === 'skip'
                  ? 'bg-amber-50 border-amber-400 text-slate-800 font-semibold'
                  : hasVoted || isPlayerDead || isGuru
                  ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                  : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">⏭️</span>
                <div>
                  <span className="text-sm font-medium block">Lewati Voting (Skip)</span>
                  <span className="text-[9px] text-slate-400">Tidak ada yang dieliminasi putaran ini</span>
                </div>
              </div>
              {!hasVoted && !isPlayerDead && !isGuru && (
                <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-300 px-2 py-0.5 rounded uppercase font-bold tracking-wider">
                  Skip
                </span>
              )}
              {votedFor === 'skip' && <span className="text-amber-600 text-lg">✓</span>}
            </button>
          </div>

          {isPlayerDead && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-center text-xs text-red-600 font-semibold">
              👻 Anda berstatus Arwah — tidak memiliki hak suara.
            </div>
          )}
          {isGuru && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center text-xs text-slate-500 font-medium">
              🏫 Guru memimpin sesi debat ini. Pandu diskusi lisan dan tunggu hasil voting siswa.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
