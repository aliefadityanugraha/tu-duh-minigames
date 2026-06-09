import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, AlertTriangle, Swords, MessageSquare,
  CheckCircle2, XCircle, Target, Award, Activity, ChevronDown, ChevronUp
} from 'lucide-react';

function useAnimatedValue(target, duration = 600) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) return;
    const startTime = performance.now();
    const step = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(start + diff * ease));
      if (progress < 1) requestAnimationFrame(step);
      else prev.current = target;
    };
    requestAnimationFrame(step);
  }, [target, duration]);
  return value;
}

function ProgressRing({ percent, size = 48, stroke = 4, color = '#16a34a' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} stroke="#E2E8F0" strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={radius}
        stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

const EVENT_META = {
  game_start:         { icon: '🎮', color: '#3B82F6' },
  sabotage:           { icon: '🚨', color: '#EF4444' },
  sabotage_resolved:  { icon: '✅', color: '#16A34A' },
  sabotage_failed:    { icon: '💥', color: '#DC2626' },
  duel:               { icon: '⚔️', color: '#D97706' },
  duel_resolved:      { icon: '🏁', color: '#7C3AED' },
  debate:             { icon: '📢', color: '#0891B2' },
  eliminated:         { icon: '💀', color: '#EF4444' },
  task_correct:       { icon: '✅', color: '#16A34A' },
  task_wrong:         { icon: '❌', color: '#DC2626' },
};

export default function LiveStatsPanel({ room, isCollapsed, onToggle }) {
  const stats = room?.gameStats;
  const isPlaying = room?.state === 'playing' || room?.state === 'ended';
  if (!stats || !isPlaying) return null;

  const taskPercent = room.tasksRequired > 0
    ? Math.round((room.tasksCompleted / room.tasksRequired) * 100) : 0;
  const totalAnswers = stats.totalAnswersCorrect + stats.totalAnswersWrong;
  const accuracyPercent = totalAnswers > 0
    ? Math.round((stats.totalAnswersCorrect / totalAnswers) * 100) : 0;

  const elapsedMs = stats.startedAt ? Date.now() - stats.startedAt : 0;
  const elapsedMin = Math.floor(elapsedMs / 60000);
  const elapsedSec = Math.floor((elapsedMs % 60000) / 1000);

  const alivePlayers = room.players.filter(p => !p.isGuru && !p.isDead).length;
  const totalStudents = room.players.filter(p => !p.isGuru).length;

  const animTasks   = useAnimatedValue(room.tasksCompleted);
  const animCorrect = useAnimatedValue(stats.totalAnswersCorrect);
  const animWrong   = useAnimatedValue(stats.totalAnswersWrong);

  const kpiCards = [
    {
      label: 'Misi Kelompok',
      value: `${animTasks}/${room.tasksRequired}`,
      sub: `${taskPercent}% selesai`,
      icon: <Target size={15} />,
      color: '#16A34A',
      bg: '#F0FFF4',
      border: '#BBF7D0',
    },
    {
      label: 'Sabotase',
      value: stats.sabotagesTriggered,
      sub: `${stats.sabotagesResolved} diatasi · ${stats.sabotagesFailed} gagal`,
      icon: <AlertTriangle size={15} />,
      color: '#DC2626',
      bg: '#FFF5F5',
      border: '#FED7D7',
    },
    {
      label: 'Duel 1v1',
      value: stats.duelsTriggered,
      sub: `Warga ${stats.duelsWonByWarga} · Prov ${stats.duelsWonByProvokator}`,
      icon: <Swords size={15} />,
      color: '#D97706',
      bg: '#FFFBEB',
      border: '#FDE68A',
    },
    {
      label: 'Sesi Debat',
      value: stats.debatesHeld,
      sub: `${stats.playersEliminated} tereliminasi`,
      icon: <MessageSquare size={15} />,
      color: '#0891B2',
      bg: '#ECFEFF',
      border: '#A5F3FC',
    },
  ];

  const eventLog = stats.eventLog ? [...stats.eventLog].reverse().slice(0, 25) : [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-flat overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BarChart3 size={15} className="text-white" />
          </div>
          <div className="text-left">
            <div className="text-sm font-bold text-slate-800">📊 Statistik Live Game</div>
            <div className="text-[10px] text-slate-400 font-medium">
              Real-time · {elapsedMin}m {elapsedSec.toString().padStart(2, '0')}s berlangsung
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {room?.showStatsToAll && (
            <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-[9px] font-bold text-indigo-600 uppercase tracking-wider">
              📡 Disiarkan
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[9px] font-bold text-emerald-600 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
            Live
          </span>
          {!room?.showStatsToAll && (
            isCollapsed
              ? <ChevronDown size={15} className="text-slate-400" />
              : <ChevronUp size={15} className="text-slate-400" />
          )}
        </div>
      </button>

      {/* Collapsible body */}
      <div style={{
        maxHeight: isCollapsed ? '0px' : '1200px',
        opacity: isCollapsed ? 0 : 1,
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
      }}>
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100">

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4">
            {kpiCards.map((card, i) => (
              <div
                key={i}
                style={{ background: card.bg, border: `1px solid ${card.border}` }}
                className="rounded-xl p-3.5"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span style={{ color: card.color }}>{card.icon}</span>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                </div>
                <div style={{ color: card.color }} className="text-2xl font-black font-mono leading-none">
                  {card.value}
                </div>
                <div className="text-[9px] text-slate-400 font-medium mt-1">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Ratio row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Accuracy */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <ProgressRing percent={accuracyPercent} color="#16A34A" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-emerald-700 font-mono">
                  {accuracyPercent}%
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">Akurasi Jawaban</div>
                <div className="text-[9px] text-slate-400 mt-0.5">
                  <span className="text-emerald-600 font-semibold">{animCorrect} benar</span>
                  {' · '}
                  <span className="text-red-500 font-semibold">{animWrong} salah</span>
                </div>
              </div>
            </div>

            {/* Task progress */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <ProgressRing percent={taskPercent} color="#4F46E5" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-indigo-700 font-mono">
                  {taskPercent}%
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">Progres Tugas</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{room.tasksCompleted} dari {room.tasksRequired} tugas</div>
              </div>
            </div>

            {/* Survival */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center gap-3">
              <div className="relative flex-shrink-0">
                <ProgressRing
                  percent={totalStudents > 0 ? (alivePlayers / totalStudents) * 100 : 100}
                  color="#D97706"
                />
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-amber-700 font-mono">
                  {alivePlayers}
                </div>
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-700">Pemain Hidup</div>
                <div className="text-[9px] text-slate-400 mt-0.5">{alivePlayers}/{totalStudents} siswa selamat</div>
              </div>
            </div>
          </div>

          {/* Distribution bar */}
          {totalAnswers > 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Distribusi Jawaban
              </div>
              <div className="flex gap-1 h-5 rounded-lg overflow-hidden bg-slate-200">
                <div
                  style={{ width: `${(stats.totalAnswersCorrect / totalAnswers) * 100}%` }}
                  className="bg-emerald-500 flex items-center justify-center text-[9px] font-bold text-white transition-all duration-700 min-w-[24px]"
                >
                  {Math.round((stats.totalAnswersCorrect / totalAnswers) * 100)}%
                </div>
                <div
                  style={{ width: `${(stats.totalAnswersWrong / totalAnswers) * 100}%` }}
                  className="bg-red-500 flex items-center justify-center text-[9px] font-bold text-white transition-all duration-700 min-w-[24px]"
                >
                  {Math.round((stats.totalAnswersWrong / totalAnswers) * 100)}%
                </div>
              </div>
              <div className="flex justify-between mt-2 text-[9px] font-semibold">
                <span className="text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={9} /> Benar ({stats.totalAnswersCorrect})
                </span>
                <span className="text-red-500 flex items-center gap-1">
                  <XCircle size={9} /> Salah ({stats.totalAnswersWrong})
                </span>
              </div>
            </div>
          )}

          {/* Top 5 scoreboard */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Award size={11} className="text-amber-500" /> Top 5 Peringkat
            </div>
            <div className="space-y-2">
              {[...room.players]
                .filter(p => !p.isGuru)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((p, idx) => {
                  const maxScore = Math.max(...room.players.filter(pp => !pp.isGuru).map(pp => pp.score), 1);
                  const barW = (p.score / maxScore) * 100;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-sm w-5 text-center flex-shrink-0">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className={`text-xs font-medium ${p.isDead ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                            {p.name} {p.isDead && '💀'}
                          </span>
                          <span className="text-[10px] font-bold text-indigo-600 font-mono">{p.score} pts</span>
                        </div>
                        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                          <div
                            style={{ width: `${barW}%` }}
                            className={`h-full rounded-full transition-all duration-500 ${
                              idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-indigo-400'
                            }`}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Event timeline */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Activity size={11} className="text-purple-500" /> Timeline Event
            </div>
            <div className="max-h-[180px] overflow-y-auto space-y-1.5 pr-1">
              {eventLog.length === 0 ? (
                <div className="text-center py-5 text-slate-400 text-xs italic">Belum ada event...</div>
              ) : (
                eventLog.map((evt, i) => {
                  const meta = EVENT_META[evt.type] || { icon: '📌', color: '#94A3B8' };
                  const time = new Date(evt.time);
                  const timeStr = `${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}:${time.getSeconds().toString().padStart(2,'0')}`;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-2.5 px-3 py-2 bg-white rounded-lg border border-slate-200"
                      style={{ borderLeft: `3px solid ${meta.color}` }}
                    >
                      <span className="text-sm flex-shrink-0">{meta.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-slate-700 truncate">{evt.message}</div>
                      </div>
                      <span className="text-[9px] font-mono text-slate-400 flex-shrink-0">{timeStr}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
