import React, { useState, useEffect, useRef } from 'react';
import {
  BarChart3, AlertTriangle, Swords, MessageSquare,
  CheckCircle2, XCircle, Target, Award, Activity, ChevronDown, ChevronUp, Gamepad2
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

function ProgressRing({ percent, size = 48, stroke = 4, color = '#41e5b3', trackColor = '#13003a' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} stroke={trackColor} strokeWidth={stroke} fill="none" />
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
  game_start:         { icon: '🎮', color: '#ffc312', bg: '#4d2100' },
  sabotage:           { icon: '🚨', color: '#ffb4ab', bg: '#93000a' },
  sabotage_resolved:  { icon: '✅', color: '#41e5b3', bg: '#003829' },
  sabotage_failed:    { icon: '💥', color: '#ffb4ab', bg: '#93000a' },
  duel:               { icon: '⚔️', color: '#ffc312', bg: '#4d2100' },
  duel_resolved:      { icon: '🏁', color: '#cda4ff', bg: '#3a0099' },
  debate:             { icon: '📢', color: '#8ffff3', bg: '#004f4a' },
  eliminated:         { icon: '💀', color: '#ffb4ab', bg: '#93000a' },
  task_correct:       { icon: '✅', color: '#41e5b3', bg: '#003829' },
  task_wrong:         { icon: '❌', color: '#ffb4ab', bg: '#93000a' },
  topic_debate:       { icon: '💬', color: '#8fb2ff', bg: '#003e87' },
  presentation:       { icon: '🎤', color: '#ffb7d7', bg: '#71003d' },
  minigame_completed: { icon: '🎮', color: '#8fb2ff', bg: '#003e87' },
};

export default function LiveStatsPanel({ room, isCollapsed, onToggle }) {
  const stats = room?.gameStats;
  const isPlaying = room?.state === 'playing' || room?.state === 'ended';
  if (!stats || !isPlaying) return null;

  const taskPercent = room.tasksRequired > 0
    ? Math.round((room.tasksCompleted / room.tasksRequired) * 100) : 0;
  const totalAnswers = stats.totalAnswersCorrect + stats.totalAnswersWrong;
  const minigamesDone = stats.minigamesCompleted ?? 0;
  const quizCorrect = Math.max(0, stats.totalAnswersCorrect - minigamesDone);
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
  const animMinigames = useAnimatedValue(minigamesDone);

  const kpiCards = [
    {
      label: 'Misi Kelompok',
      value: `${animTasks}/${room.tasksRequired}`,
      sub: `${taskPercent}% selesai`,
      icon: <Target size={15} />,
      color: '#41e5b3',
      bg: '#003829',
    },
    {
      label: 'Mini-Games',
      value: animMinigames,
      sub: `${quizCorrect} kuis benar · ${minigamesDone} game selesai`,
      icon: <Gamepad2 size={15} />,
      color: '#8fb2ff',
      bg: '#003e87',
    },
    {
      label: 'Sabotase',
      value: stats.sabotagesTriggered,
      sub: `${stats.sabotagesResolved} diatasi · ${stats.sabotagesFailed} gagal`,
      icon: <AlertTriangle size={15} />,
      color: '#ffb4ab',
      bg: '#93000a',
    },
    {
      label: 'Duel 1v1',
      value: stats.duelsTriggered,
      sub: `Warga ${stats.duelsWonByWarga} · Prov ${stats.duelsWonByProvokator}`,
      icon: <Swords size={15} />,
      color: '#ffc312',
      bg: '#4d2100',
    },
    {
      label: 'Sesi Debat',
      value: stats.debatesHeld,
      sub: `${stats.playersEliminated} tereliminasi`,
      icon: <MessageSquare size={15} />,
      color: '#5ffcc9',
      bg: '#003829',
    },
  ];

  const eventLog = stats.eventLog ? [...stats.eventLog].reverse().slice(0, 25) : [];

  return (
    <div className="bg-[#190047] border-4 border-black shadow-[6px_6px_0px_#000000] overflow-hidden mb-4 relative z-10">
      {/* Toggle header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#270067] transition-colors border-b-4 border-black shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-[#ffc312] border-2 border-black flex items-center justify-center">
            <BarChart3 size={20} className="text-[#3f2e00]" />
          </div>
          <div className="text-left">
            <div className="font-rubik italic text-[#41e5b3] text-lg font-bold leading-none">STATISTIK LIVE GAME</div>
            <div className="font-mono text-[#d3c5ab] text-[10px] tracking-wider mt-1">
              REAL-TIME · {elapsedMin}m {elapsedSec.toString().padStart(2, '0')}s BERLANGSUNG
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {room?.showStatsToAll && (
            <span className="px-2.5 py-1 bg-[#270067] border-2 border-[#ffc312] text-[10px] font-bold text-[#ffc312] uppercase tracking-wider shadow-[2px_2px_0px_#ffc312]">
              📡 DISIARKAN
            </span>
          )}
          <span className="flex items-center gap-1.5 px-2.5 py-1 bg-[#003829] border-2 border-[#41e5b3] text-[10px] font-bold text-[#41e5b3] uppercase tracking-wider shadow-[2px_2px_0px_#41e5b3]">
            <span className="w-2 h-2 bg-[#41e5b3] border border-black animate-pulse" />
            LIVE
          </span>
          {!room?.showStatsToAll && (
            <div className="p-1 border-2 border-[#4f4632] bg-[#13003a]">
              {isCollapsed
                ? <ChevronDown size={18} className="text-[#ffc312]" />
                : <ChevronUp size={18} className="text-[#ffc312]" />}
            </div>
          )}
        </div>
      </button>

      {/* Collapsible body */}
      <div style={{
        maxHeight: isCollapsed ? '0px' : '2000px',
        opacity: isCollapsed ? 0 : 1,
        overflow: 'hidden',
        transition: 'max-height 0.5s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease',
      }}>
        <div className="p-5 space-y-4 bg-[#13003a]">

          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {kpiCards.map((card, i) => (
              <div
                key={i}
                style={{ backgroundColor: card.bg }}
                className="border-2 border-black shadow-[3px_3px_0px_#000000] p-4 flex flex-col justify-center"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span style={{ color: card.color }}>{card.icon}</span>
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider" style={{ color: card.color }}>{card.label}</span>
                </div>
                <div style={{ color: card.color }} className="font-rubik text-3xl font-black italic leading-none">
                  {card.value}
                </div>
                <div className="font-mono text-[9px] text-[#d3c5ab] mt-2 tracking-wider">{card.sub}</div>
              </div>
            ))}
          </div>

          {/* Ratio row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Accuracy */}
            <div className="bg-[#22005c] border-2 border-black shadow-[3px_3px_0px_#000000] p-4 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <ProgressRing percent={accuracyPercent} color="#41e5b3" trackColor="#13003a" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#41e5b3] font-mono">
                  {accuracyPercent}%
                </div>
              </div>
              <div>
                <div className="font-rubik italic font-bold text-[#e9ddff] text-sm">Akurasi Jawaban</div>
                <div className="font-mono text-[10px] text-[#d3c5ab] mt-1 tracking-wider">
                  <span className="text-[#41e5b3] font-bold">{animCorrect} BENAR</span>
                  <span className="mx-1 text-[#4f4632]">/</span>
                  <span className="text-[#ffb4ab] font-bold">{animWrong} SALAH</span>
                </div>
              </div>
            </div>

            {/* Task progress */}
            <div className="bg-[#22005c] border-2 border-black shadow-[3px_3px_0px_#000000] p-4 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <ProgressRing percent={taskPercent} color="#8fb2ff" trackColor="#13003a" />
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#8fb2ff] font-mono">
                  {taskPercent}%
                </div>
              </div>
              <div>
                <div className="font-rubik italic font-bold text-[#e9ddff] text-sm">Progres Tugas</div>
                <div className="font-mono text-[10px] text-[#d3c5ab] mt-1 tracking-wider">{room.tasksCompleted} DARI {room.tasksRequired} MISI</div>
              </div>
            </div>

            {/* Survival */}
            <div className="bg-[#22005c] border-2 border-black shadow-[3px_3px_0px_#000000] p-4 flex items-center gap-4">
              <div className="relative flex-shrink-0">
                <ProgressRing
                  percent={totalStudents > 0 ? (alivePlayers / totalStudents) * 100 : 100}
                  color="#ffc312" trackColor="#13003a"
                />
                <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[#ffc312] font-mono">
                  {alivePlayers}
                </div>
              </div>
              <div>
                <div className="font-rubik italic font-bold text-[#e9ddff] text-sm">Pemain Hidup</div>
                <div className="font-mono text-[10px] text-[#d3c5ab] mt-1 tracking-wider">{alivePlayers} DARI {totalStudents} SELAMAT</div>
              </div>
            </div>
          </div>

          {/* Task type breakdown */}
          {(stats.totalAnswersCorrect > 0 || minigamesDone > 0) && (
            <div className="bg-[#190047] border-2 border-black shadow-[3px_3px_0px_#000000] p-4">
              <div className="font-mono text-[10px] font-bold text-[#8fb2ff] uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Gamepad2 size={14} /> DISTRIBUSI TASK SELESAI
              </div>
              <div className="flex gap-1 h-6 bg-[#13003a] border-2 border-black p-0.5">
                {quizCorrect > 0 && (
                  <div
                    style={{ width: `${(quizCorrect / stats.totalAnswersCorrect) * 100}%` }}
                    className="bg-[#41e5b3] flex items-center justify-center text-[10px] font-bold text-[#003829] transition-all duration-700 min-w-[24px]"
                  >
                    📝 {quizCorrect}
                  </div>
                )}
                {minigamesDone > 0 && (
                  <div
                    style={{ width: `${(minigamesDone / stats.totalAnswersCorrect) * 100}%` }}
                    className="bg-[#8fb2ff] flex items-center justify-center text-[10px] font-bold text-[#003e87] transition-all duration-700 min-w-[24px]"
                  >
                    🎮 {minigamesDone}
                  </div>
                )}
              </div>
              <div className="flex justify-between mt-2 font-mono text-[10px] font-bold tracking-wider">
                <span className="text-[#41e5b3]">📝 Kuis Benar ({quizCorrect})</span>
                <span className="text-[#8fb2ff]">🎮 Mini-Game ({minigamesDone})</span>
              </div>
            </div>
          )}

          {/* Distribution bar */}
          {totalAnswers > 0 && (
            <div className="bg-[#190047] border-2 border-black shadow-[3px_3px_0px_#000000] p-4">
              <div className="font-mono text-[10px] font-bold text-[#ffc312] uppercase tracking-wider mb-3">
                DISTRIBUSI JAWABAN
              </div>
              <div className="flex gap-1 h-6 bg-[#13003a] border-2 border-black p-0.5">
                <div
                  style={{ width: `${(stats.totalAnswersCorrect / totalAnswers) * 100}%` }}
                  className="bg-[#41e5b3] flex items-center justify-center text-[10px] font-bold text-[#003829] transition-all duration-700 min-w-[24px]"
                >
                  {Math.round((stats.totalAnswersCorrect / totalAnswers) * 100)}%
                </div>
                <div
                  style={{ width: `${(stats.totalAnswersWrong / totalAnswers) * 100}%` }}
                  className="bg-[#ffb4ab] flex items-center justify-center text-[10px] font-bold text-[#690005] transition-all duration-700 min-w-[24px]"
                >
                  {Math.round((stats.totalAnswersWrong / totalAnswers) * 100)}%
                </div>
              </div>
              <div className="flex justify-between mt-2 font-mono text-[10px] font-bold tracking-wider">
                <span className="text-[#41e5b3] flex items-center gap-1">
                  <CheckCircle2 size={12} /> BENAR ({stats.totalAnswersCorrect})
                </span>
                <span className="text-[#ffb4ab] flex items-center gap-1">
                  <XCircle size={12} /> SALAH ({stats.totalAnswersWrong})
                </span>
              </div>
            </div>
          )}

          {/* Top 5 scoreboard */}
          <div className="bg-[#190047] border-2 border-black shadow-[3px_3px_0px_#000000] p-4">
            <div className="font-mono text-[10px] font-bold text-[#ffc312] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Award size={14} className="text-[#ffc312]" /> TOP 5 PERINGKAT
            </div>
            <div className="space-y-3">
              {[...room.players]
                .filter(p => !p.isGuru)
                .sort((a, b) => b.score - a.score)
                .slice(0, 5)
                .map((p, idx) => {
                  const maxScore = Math.max(...room.players.filter(pp => !pp.isGuru).map(pp => pp.score), 1);
                  const barW = (p.score / maxScore) * 100;
                  const medals = ['🥇', '🥈', '🥉'];
                  return (
                    <div key={p.id} className="flex items-center gap-3">
                      <span className="text-sm w-6 text-center flex-shrink-0 font-mono font-bold text-[#e9ddff]">
                        {idx < 3 ? medals[idx] : `#${idx + 1}`}
                      </span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1.5">
                          <span className={`font-mono text-xs font-bold uppercase ${p.isDead ? 'line-through text-[#9c8f78]' : 'text-[#e9ddff]'}`}>
                            {p.name} {p.isDead && '💀'}
                          </span>
                          <span className="text-[10px] font-bold text-[#41e5b3] font-mono tracking-wider">{p.score} PTS</span>
                        </div>
                        <div className="h-2 bg-[#13003a] border border-black overflow-hidden relative">
                          <div
                            style={{ width: `${barW}%` }}
                            className={`h-full transition-all duration-500 relative ${
                              idx === 0 ? 'bg-[#ffc312]' : idx === 1 ? 'bg-[#d3c5ab]' : 'bg-[#cda4ff]'
                            }`}
                          >
                            <div className="absolute inset-y-0 right-0 w-1 bg-black/40" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Event timeline */}
          <div className="bg-[#190047] border-2 border-black shadow-[3px_3px_0px_#000000] p-4">
            <div className="font-mono text-[10px] font-bold text-[#cda4ff] uppercase tracking-wider mb-4 flex items-center gap-1.5">
              <Activity size={14} className="text-[#cda4ff]" /> TIMELINE EVENT
            </div>
            <div className="max-h-[220px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {eventLog.length === 0 ? (
                <div className="text-center py-6 text-[#9c8f78] font-mono text-[10px] tracking-wider">BELUM ADA EVENT...</div>
              ) : (
                eventLog.map((evt, i) => {
                  const meta = EVENT_META[evt.type] || { icon: '📌', color: '#d3c5ab', bg: '#22005c' };
                  const time = new Date(evt.time);
                  const timeStr = `${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}:${time.getSeconds().toString().padStart(2,'0')}`;
                  return (
                    <div
                      key={i}
                      className="flex items-center gap-3 px-3 py-2 bg-[#22005c] border-2 border-black transition-all hover:bg-[#270067]"
                      style={{ borderLeft: `6px solid ${meta.color}` }}
                    >
                      <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center border-2 border-black text-sm" style={{ backgroundColor: meta.bg }}>
                        {meta.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-mono text-[10px] font-bold text-[#e9ddff] truncate">{evt.message}</div>
                      </div>
                      <span className="text-[9px] font-mono text-[#ffc312] flex-shrink-0 font-bold">{timeStr}</span>
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
