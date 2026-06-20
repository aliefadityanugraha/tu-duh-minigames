import React, { useState, useEffect, useRef } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import {
  Users, ArrowRight, Award, Radio, LogOut, Target, Swords,
  AlertTriangle, MessageSquare, CheckCircle2, XCircle, Activity, Gamepad2
} from 'lucide-react';
import Navbar from '../components/Navbar';

function useAnimatedValue(target, duration = 600) {
  const [value, setValue] = useState(0);
  const prev = useRef(0);
  useEffect(() => {
    const start = prev.current;
    const diff = target - start;
    if (diff === 0) { setValue(target); return; }
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

function ProgressRing({ percent, size = 64, stroke = 6, color = '#16a34a' }) {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(percent, 100) / 100) * circumference;
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size/2} cy={size/2} r={radius} stroke="#E2E8F0" strokeWidth={stroke} fill="none" />
      <circle
        cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={stroke} fill="none"
        strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
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
  minigame_completed: { icon: '🎮', color: '#6366F1' },
};

export default function PublicStats() {
  const router = useRouter();
  const [socket, setSocket] = useState(null);
  const [roomCode, setRoomCode] = useState('');
  const [activeCode, setActiveCode] = useState('');
  const [room, setRoom] = useState(null);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [elapsedTime, setElapsedTime] = useState('00:00');

  useEffect(() => {
    if (router.isReady && router.query.room) {
      const code = router.query.room.toUpperCase();
      setRoomCode(code);
      handleConnectRoom(code);
    }
  }, [router.isReady, router.query.room]);

  useEffect(() => {
    let timer;
    if (room?.gameStats?.startedAt && room.state === 'playing') {
      const updateTimer = () => {
        const ms = Date.now() - room.gameStats.startedAt;
        const min = Math.floor(ms / 60000);
        const sec = Math.floor((ms % 60000) / 1000);
        setElapsedTime(`${min.toString().padStart(2,'0')}:${sec.toString().padStart(2,'0')}`);
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else if (room?.state === 'lobby') setElapsedTime('Lobby');
    else if (room?.state === 'ended') setElapsedTime('Selesai');
    return () => clearInterval(timer);
  }, [room?.gameStats?.startedAt, room?.state]);

  useEffect(() => { return () => { if (socket) socket.disconnect(); }; }, [socket]);

  const handleConnectRoom = (codeToJoin) => {
    if (!codeToJoin.trim()) return;
    setError(''); setConnecting(true);
    if (socket) socket.disconnect();
    const s = io();
    setSocket(s);
    s.on('connect', () => s.emit('join-as-spectator', { roomCode: codeToJoin.trim().toUpperCase() }));
    s.on('room-updated', (updatedRoom) => {
      setRoom(updatedRoom); setActiveCode(codeToJoin.trim().toUpperCase());
      setConnected(true); setConnecting(false); setError('');
    });
    s.on('spectator-error', (errMsg) => {
      setError(errMsg); setConnecting(false); setConnected(false); setRoom(null); s.disconnect();
    });
    s.on('connect_error', () => { setError('Gagal terhubung ke server.'); setConnecting(false); });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (roomCode.trim()) {
      router.push(`/stats?room=${roomCode.toUpperCase()}`, undefined, { shallow: true });
      handleConnectRoom(roomCode.toUpperCase());
    }
  };

  const handleExit = () => {
    if (socket) socket.disconnect();
    setSocket(null); setRoom(null); setConnected(false); setActiveCode(''); setRoomCode('');
    router.push('/stats', undefined, { shallow: true });
  };

  const stats = room?.gameStats;
  const tasksCompleted = room?.tasksCompleted || 0;
  const tasksRequired = room?.tasksRequired || 0;
  const taskPercent = tasksRequired > 0 ? Math.round((tasksCompleted / tasksRequired) * 100) : 0;
  const totalAnswers = stats ? stats.totalAnswersCorrect + stats.totalAnswersWrong : 0;
  const accuracyPercent = totalAnswers > 0 ? Math.round((stats.totalAnswersCorrect / totalAnswers) * 100) : 0;
  const alivePlayers = room?.players ? room.players.filter(p => !p.isGuru && !p.isDead).length : 0;
  const totalPlayers = room?.players ? room.players.filter(p => !p.isGuru).length : 0;
  const survivalPercent = totalPlayers > 0 ? Math.round((alivePlayers / totalPlayers) * 100) : 0;

  const animTasks    = useAnimatedValue(tasksCompleted);
  const animCorrect  = useAnimatedValue(stats?.totalAnswersCorrect || 0);
  const animWrong    = useAnimatedValue(stats?.totalAnswersWrong || 0);
  const animSabotages = useAnimatedValue(stats?.sabotagesTriggered || 0);
  const animDuels    = useAnimatedValue(stats?.duelsTriggered || 0);
  const minigamesDone = stats?.minigamesCompleted ?? 0;
  const quizCorrect = stats ? Math.max(0, stats.totalAnswersCorrect - minigamesDone) : 0;
  const animMinigames = useAnimatedValue(minigamesDone);
  const animDebates  = useAnimatedValue(stats?.debatesHeld || 0);

  const eventLog = stats?.eventLog ? [...stats.eventLog].reverse() : [];

  return (
    <div className="relative min-h-screen stars-bg flex flex-col font-sans">
      <Head><title>Command Center — TU-DUH! Pancasila</title></Head>

      {/* ── Always-visible Navbar ── */}
      <Navbar
        navItems={[
          { label: 'Command Center', icon: '📡', active: true },
        ]}
        roomCode={activeCode || null}
      />

      {/* ── CONNECT FORM ── */}
      {!connected && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md neo-card-high overflow-hidden">
            {/* Top accent stripe */}
            <div className="h-2 bg-[#ffc312] border-b-4 border-black" />
            <div className="p-8">
              <div className="text-center mb-8">
                <span className="inline-flex items-center gap-1.5 neo-badge bg-[#270067] text-[#5ffcc9] border-black text-xs py-1.5 px-3 mb-4">
                  <Radio size={12} className="animate-pulse" />
                  Spectator / Projector Mode
                </span>
                <h1 className="font-rubik italic text-[#ffc312] text-4xl tracking-[-1.5px] mt-3 mb-1">COMMAND CENTER</h1>
                <p className="text-[#d3c5ab] text-sm font-mono">Tampilkan statistik real-time ke layar besar kelas.</p>
              </div>

              {error && (
                <div className="mb-5 p-3 neo-card border-[#93000a] bg-[#93000a]/30 text-[#ffdad6] text-sm font-mono text-center">
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="block text-xs font-mono font-bold text-[#d3c5ab] uppercase tracking-wider">Kode Room</label>
                  <input
                    type="text" value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value)}
                    placeholder="Ketik kode room (misal: ABCDEF)"
                    maxLength={6} required
                    className="neo-input w-full text-center text-2xl font-black tracking-[6px] uppercase"
                  />
                </div>
                <button
                  type="submit" disabled={connecting}
                  className="neo-btn neo-btn-primary w-full py-3.5 text-sm"
                >
                  {connecting
                    ? <div className="w-5 h-5 border-2 border-[#3f2e00] border-t-transparent rounded-full animate-spin" />
                    : <> Hubungkan Monitor <ArrowRight size={14} /> </>
                  }
                </button>
              </form>

              <p className="mt-6 text-center text-[10px] text-[#5ffcc9] font-mono font-bold uppercase tracking-wider">
                #TuDuhPancasila · CommandRoom
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── DASHBOARD ── */}
      {connected && room && (
        <div className="flex-1 flex flex-col">

          {/* Sabotage banner */}
          {room.sabotage?.active && (
            <div className="bg-red-600 py-2.5 px-6 text-center flex items-center justify-center gap-3 text-white z-20">
              <AlertTriangle size={16} className="animate-bounce" />
              <span className="text-xs font-bold tracking-wide uppercase">
                🚨 Sabotase Aktif! Warga harus menjawab kuis darurat sebelum waktu habis!
              </span>
              <span className="bg-white/20 border border-white/30 px-2.5 py-0.5 rounded font-mono font-bold text-sm">
                {room.sabotage.timer}s
              </span>
            </div>
          )}

          {/* Duel banner */}
          {room.duel?.active && (
            <div className="bg-amber-500 py-2.5 px-6 text-center flex items-center justify-center gap-3 text-white z-20">
              <Swords size={16} />
              <span className="text-xs font-bold tracking-wide uppercase">
                ⚔️ Duel 1v1: <span className="underline">{room.duel.citizen}</span> vs <span className="underline">{room.duel.provocateur}</span>
              </span>
              <span className="bg-white/20 border border-white/30 px-2.5 py-0.5 rounded font-mono font-bold text-sm">
                {room.duel.timer}s
              </span>
            </div>
          )}

          {/* ── GLOBAL NAVBAR ── */}
          <Navbar
            navItems={[
              { label: 'Command Center', icon: '📡', active: true },
              { label: connected ? '🟢 Live' : '⚪ Standby' },
            ]}
            roomCode={activeCode || null}
            rightContent={
              <div className="flex items-center gap-2">
                {room?.state && (
                  <span className={`neo-badge text-xs py-1 px-2.5 ${
                    room.state === 'lobby'   ? 'bg-[#ffc312] text-[#3f2e00] border-black'
                    : room.state === 'playing' ? 'bg-[#00c899] text-[#002116] border-black'
                    : 'bg-[#93000a] text-[#ffdad6] border-black'
                  }`}>
                    {room.state === 'lobby' ? '🕒 LOBI' : room.state === 'playing' ? '🎮 BERMAIN' : '🏆 SELESAI'}
                  </span>
                )}
                {room?.state === 'playing' && (
                  <span className="neo-badge bg-[#270067] text-[#5ffcc9] border-black text-xs py-1 px-2.5">
                    ⏱️ {elapsedTime}
                  </span>
                )}
                <button
                  onClick={handleExit}
                  className="flex items-center gap-1.5 px-3 py-2 bg-[#93000a] hover:bg-[#ffb4ab] hover:text-[#690005] text-[#ffdad6] border-2 border-black rounded-lg font-mono text-xs font-bold transition-all shadow-neo-sm active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                >
                  <LogOut size={13} /> Putus
                </button>
              </div>
            }
          />

          {/* Main grid */}
          <main className="flex-1 p-6 grid grid-cols-1 xl:grid-cols-4 gap-6">

            {/* Left 3/4 */}
            <section className="xl:col-span-3 space-y-5">

              {/* KPI cards */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: 'Misi Kelompok', value: animTasks, sub: `${taskPercent}% selesai`, icon: <Target size={16}/>, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: taskPercent, barColor: 'bg-emerald-500' },
                  { label: 'Mini-Games', value: animMinigames, sub: `${quizCorrect} kuis · ${minigamesDone} game`, icon: <Gamepad2 size={16}/>, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', bar: null },
                  { label: 'Total Sabotase', value: animSabotages, sub: `${stats?.sabotagesResolved||0} diatasi · ${stats?.sabotagesFailed||0} gagal`, icon: <AlertTriangle size={16}/>, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', bar: null },
                  { label: 'Duel 1v1', value: animDuels, sub: `Warga ${stats?.duelsWonByWarga||0} · Prov ${stats?.duelsWonByProvokator||0}`, icon: <Swords size={16}/>, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', bar: null },
                  { label: 'Rapat & Debat', value: animDebates, sub: `${stats?.playersEliminated||0} dieliminasi`, icon: <MessageSquare size={16}/>, color: 'text-sky-700', bg: 'bg-sky-50', border: 'border-sky-200', bar: null },
                ].map((card, i) => (
                  <div key={i} className={`${card.bg} border ${card.border} rounded-2xl p-4 flex flex-col justify-between`}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                      <span className={`${card.color}`}>{card.icon}</span>
                    </div>
                    <div>
                      <h3 className={`text-3xl font-black font-mono tracking-tight ${card.color} mb-0.5`}>{card.value}</h3>
                      <p className={`text-[10px] font-semibold ${card.color} opacity-70`}>{card.sub}</p>
                    </div>
                    {card.bar !== null && (
                      <div className="mt-3 w-full bg-white/60 h-1.5 rounded-full overflow-hidden border border-white/80">
                        <div className={`${card.barColor} h-full rounded-full transition-all duration-1000`} style={{ width: `${card.bar}%` }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Accuracy / Survival / Distribution */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Accuracy ring */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-between min-h-[200px]">
                  <div className="w-full text-left">
                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Akurasi Jawaban</h4>
                  </div>
                  <div className="relative my-3">
                    <ProgressRing percent={accuracyPercent} size={88} stroke={7} color="#16A34A" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black font-mono text-emerald-700">{accuracyPercent}%</span>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Akurasi</span>
                    </div>
                  </div>
                  <div className="w-full flex justify-between text-[11px] font-semibold">
                    <span className="text-emerald-600 flex items-center gap-1"><CheckCircle2 size={11}/> {animCorrect} Benar</span>
                    <span className="text-red-500 flex items-center gap-1"><XCircle size={11}/> {animWrong} Salah</span>
                  </div>
                </div>

                {/* Survival ring */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col items-center justify-between min-h-[200px]">
                  <div className="w-full text-left">
                    <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Kelangsungan Siswa</h4>
                  </div>
                  <div className="relative my-3">
                    <ProgressRing percent={survivalPercent} size={88} stroke={7} color="#D97706" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-xl font-black font-mono text-amber-700">{alivePlayers}</span>
                      <span className="text-[8px] text-slate-400 uppercase tracking-wider font-semibold">Hidup</span>
                    </div>
                  </div>
                  <div className="w-full flex justify-between text-[11px] font-semibold text-slate-500">
                    <span>Elim: {totalPlayers - alivePlayers}</span>
                    <span>Total: {totalPlayers}</span>
                  </div>
                </div>

                {/* Distribution bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col justify-between min-h-[200px]">
                  <h4 className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-3">Distribusi Jawaban</h4>
                  {totalAnswers > 0 ? (
                    <div className="space-y-3 flex-1 flex flex-col justify-center">
                      <div className="flex gap-1 h-7 bg-slate-100 rounded-xl overflow-hidden">
                        <div
                          className="bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white rounded-l-xl transition-all duration-700 min-w-[30px]"
                          style={{ width: `${(stats.totalAnswersCorrect/totalAnswers)*100}%` }}
                        >
                          {Math.round((stats.totalAnswersCorrect/totalAnswers)*100)}%
                        </div>
                        <div
                          className="bg-red-500 flex items-center justify-center text-[10px] font-black text-white rounded-r-xl transition-all duration-700 min-w-[30px]"
                          style={{ width: `${(stats.totalAnswersWrong/totalAnswers)*100}%` }}
                        >
                          {Math.round((stats.totalAnswersWrong/totalAnswers)*100)}%
                        </div>
                      </div>
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Perbandingan jawaban benar vs salah. Task selesai: {quizCorrect} kuis, {minigamesDone} mini-game.
                      </p>
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400 text-xs italic">
                      Menunggu soal pertama...
                    </div>
                  )}
                </div>
              </div>

              {/* Scoreboard */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  <Award size={14} className="text-amber-500" />
                  Papan Peringkat Real-Time
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[320px] overflow-y-auto pr-1">
                  {[...room.players]
                    .filter(p => !p.isGuru)
                    .sort((a, b) => b.score - a.score)
                    .map((p, idx) => {
                      const maxScore = Math.max(...room.players.filter(pp => !pp.isGuru).map(pp => pp.score), 1);
                      const barW = (p.score / maxScore) * 100;
                      const medals = ['🥇','🥈','🥉'];
                      return (
                        <div
                          key={p.id}
                          className={`flex items-center gap-3 p-3.5 bg-slate-50 border border-slate-200 rounded-xl hover:border-slate-300 transition ${p.isDead ? 'opacity-50' : ''}`}
                        >
                          <span className="text-lg font-bold w-6 text-center flex-shrink-0">
                            {idx < 3 ? medals[idx] : `#${idx+1}`}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <h5 className={`font-bold text-sm truncate ${p.isDead ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {p.name} {p.isDead && '💀'}
                              </h5>
                              <span className="text-xs font-bold text-indigo-600 font-mono">{p.score} Poin</span>
                            </div>
                            <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-700 ${
                                  idx === 0 ? 'bg-amber-400' : idx === 1 ? 'bg-slate-400' : 'bg-indigo-400'
                                }`}
                                style={{ width: `${barW}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  {room.players.filter(p => !p.isGuru).length === 0 && (
                    <div className="col-span-2 text-center py-10 text-slate-400 text-sm italic">
                      Belum ada siswa terhubung.
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Right 1/4 — Event log */}
            <section className="xl:col-span-1">
              <div className="bg-white border border-slate-200 rounded-2xl p-5 h-full flex flex-col min-h-[500px]">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2 mb-4">
                  <Activity size={14} className="text-purple-500" />
                  Timeline Event
                </h3>
                <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[750px]">
                  {eventLog.length === 0 ? (
                    <div className="text-center py-16 italic text-slate-400 text-xs">
                      Menunggu permainan dimulai...
                    </div>
                  ) : (
                    eventLog.map((evt, i) => {
                      const meta = EVENT_META[evt.type] || { icon: '📌', color: '#94A3B8' };
                      const time = new Date(evt.time);
                      const timeStr = `${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}:${time.getSeconds().toString().padStart(2,'0')}`;
                      return (
                        <div
                          key={i}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition flex gap-2.5"
                          style={{ borderLeft: `3px solid ${meta.color}` }}
                        >
                          <span className="text-base flex-shrink-0">{meta.icon}</span>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-medium text-slate-700 leading-relaxed break-words">{evt.message}</p>
                            <span className="text-[9px] font-mono text-slate-400 mt-0.5 block">{timeStr}</span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </section>

          </main>

          {/* Footer */}
          <footer className="bg-white border-t border-slate-200 py-3 px-6 text-center text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex justify-between items-center">
            <span className="text-amber-600 font-mono-tech">#PANCASILAMENYATUKANKITA</span>
            <span>Among Us Pancasila — Command Monitor 🏫</span>
          </footer>

        </div>
      )}

      <style jsx global>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
      `}</style>
    </div>
  );
}
