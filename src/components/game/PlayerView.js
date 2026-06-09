import React from 'react';
import WargaPanel from '../panels/WargaPanel';
import ProvokateurPanel from '../panels/ProvokateurPanel';
import GameEndedCard from './GameEndedCard';
import LiveStatsPanel from '../LiveStatsPanel';
import TopicDebateBanner from '../overlays/TopicDebateOverlay';

/**
 * Layout 3 kolom in-game untuk Warga & Provokator:
 *   LEFT  → Mission Book (soal/aksi)
 *   CENTER → Sector Map (peta + status + info presentasi)
 *   RIGHT → Radar Monitor (daftar pemain)
 */
export default function PlayerView({
  room, player, roleInfo,
  currentQuestion, isAnswered, selectedOption, feedback,
  taskLocked,
  sabotageQuiz, onSubmitSabotageQuiz,
  duelCooldownRemaining,
  onSelectOption, onSubmitAnswer, onNextQuestion,
  onTriggerSabotage, onTriggerDuel,
}) {
  const isPlayerDead = !!player?.isDead;

  const alivePlayers  = room.players.filter(p => !p.isGuru && !p.isDead);
  const studentPlayers = room.players.filter(p => !p.isGuru);

  // Warna avatar per index
  const avatarColors = [
    '#41e5b3', '#8fb2ff', '#ffdf9c', '#ffb7d7',
    '#cda4ff', '#ffc58f', '#8ffff3', '#ffb4ab',
  ];

  // ── Status Sektor berdasarkan kondisi room ──
  const getSectorStatus = () => {
    if (room.sabotage?.active) return { label: 'THREAT: SABOTASE', color: 'text-[#ffb4ab]', bg: 'bg-[#93000a]' };
    if (room.duel?.active) return { label: 'DUEL AKTIF', color: 'text-[#ffc312]', bg: 'bg-[#4d2100]' };
    if (room.debate?.active) return { label: 'MUSYAWARAH', color: 'text-[#5ffcc9]', bg: 'bg-[#003829]' };
    if (room.topicDebate?.active) return { label: 'DEBAT TOPIK', color: 'text-[#5ffcc9]', bg: 'bg-[#003829]' };
    return { label: 'SEKTOR AMAN', color: 'text-[#41e5b3]', bg: 'bg-[#003829]' };
  };
  const sectorStatus = getSectorStatus();

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">

      {/* Live stats broadcast — jika Guru aktifkan */}
      {(room.state === 'playing' || room.state === 'ended') && room.showStatsToAll && (
        <div className="px-4 pt-3">
          <LiveStatsPanel room={room} isCollapsed={false} onToggle={() => {}} />
        </div>
      )}

      {/* Game ended */}
      {room.state === 'ended' && (
        <div className="p-4">
          <GameEndedCard room={room} roleInfo={roleInfo} selfId={player?.id} onRestart={() => {}} />
        </div>
      )}

      {/* Playing — 3-column layout */}
      {room.state === 'playing' && (
        <div className="flex-1 flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>

          {/* ══════════════════════════════
              KOLOM KIRI — Mission Book / Aksi
              ══════════════════════════════ */}
          <div className="w-[34%] flex flex-col border-r-4 border-black overflow-hidden">
            <div className="flex-1 neo-card border-0 rounded-none overflow-hidden flex flex-col bg-[#190047]">

              {/* Topic Debate Banner */}
              {room.topicDebate?.active && (
                <TopicDebateBanner topicDebate={room.topicDebate} />
              )}

              {/* Presentation notification */}
              {room.presentation?.active && room.presentation.playerId !== player?.id && (
                <div className="flex items-center gap-3 px-4 py-2.5 bg-[#270067] border-b-4 border-[#ffc312] animate-fadeIn">
                  <span className="text-xl">🎤</span>
                  <div>
                    <p className="font-mono font-bold text-[#ffc312] text-xs">SESI PRESENTASI</p>
                    <p className="font-mono text-[#d3c5ab] text-[10px]">
                      <strong className="text-white">{room.presentation.playerName}</strong> sedang presentasi. Dengarkan!
                    </p>
                  </div>
                </div>
              )}

              {/* Warga Quiz / Provokator Actions */}
              {!room.debate?.active && !room.topicDebate?.active && (
                <div className="flex-1 overflow-hidden flex flex-col">
                  {roleInfo.role === 'warga' && (
                    <WargaPanel
                      currentQuestion={currentQuestion}
                      isAnswered={isAnswered}
                      selectedOption={selectedOption}
                      feedback={feedback}
                      isPlayerDead={isPlayerDead}
                      taskLocked={taskLocked}
                      onSelectOption={onSelectOption}
                      onSubmitAnswer={onSubmitAnswer}
                      onNextQuestion={onNextQuestion}
                    />
                  )}
                  {roleInfo.role === 'provokator' && (
                    <ProvokateurPanel
                      room={room}
                      selfId={player?.id}
                      isPlayerDead={isPlayerDead}
                      duelCooldownRemaining={duelCooldownRemaining}
                      sabotageQuiz={sabotageQuiz}
                      onTriggerSabotage={onTriggerSabotage}
                      onTriggerDuel={onTriggerDuel}
                      onSubmitSabotageQuiz={onSubmitSabotageQuiz}
                    />
                  )}
                </div>
              )}

              {/* Jika debat aktif */}
              {room.debate?.active && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                  <div className="text-4xl">📢</div>
                  <div>
                    <p className="font-rubik italic text-[#5ffcc9] text-xl font-bold">MUSYAWARAH KELAS</p>
                    <p className="font-mono text-[#d3c5ab] text-sm mt-1">Voting berlangsung. Gunakan panel voting di layar!</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ══════════════════════════════
              KOLOM TENGAH — Sector Map
              ══════════════════════════════ */}
          <div className="w-[38%] flex flex-col border-r-4 border-black overflow-hidden relative bg-[#40009d]">

            {/* Star field background */}
            <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none" />

            {/* Sector overlay info */}
            <div className="absolute top-4 left-4 z-10">
              <div className="bg-[#190047cc] border-2 border-black p-3 backdrop-blur-sm">
                <p className="font-mono text-[#41e5b3] text-xs leading-relaxed">
                  SECTOR: DELTA-9<br />
                  <span className="text-[#e9ddff]">COORDS: 42.12 / -88.05</span>
                </p>
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute top-4 right-4 z-10">
              <span className={`neo-badge ${sectorStatus.bg} ${sectorStatus.color} border-black text-[10px] py-1 px-2 animate-pulse`}>
                {sectorStatus.label}
              </span>
            </div>

            {/* Center decorative element */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
              <div className="w-48 h-48 rounded-full border-2 border-[#41e5b333] opacity-40" />
              <div className="absolute w-32 h-32 rounded-full border-2 border-[#41e5b333] opacity-30" />
              <div className="absolute w-1 h-24 bg-[#41e5b3] opacity-30 shadow-[0_0_10px_#41e5b3]" />
            </div>

            {/* Player avatar in center */}
            <div className="absolute inset-0 flex items-center justify-center z-5 pointer-events-none">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-4xl shadow-[6px_6px_0px_#000000] ${
                  isPlayerDead ? 'bg-[#270067] opacity-50' : 'bg-[#ffc312]'
                }`}>
                  {isPlayerDead ? '👻' : roleInfo.role === 'provokator' ? '😈' : '🧑‍🚀'}
                </div>
                <div className="neo-badge bg-[#13003a] text-[#e9ddff] border-[#4f4632] text-[10px] py-0.5 px-2">
                  {player?.name || 'UNKNOWN'}
                </div>
              </div>
            </div>

            {/* Progress bar di bawah */}
            <div className="absolute bottom-0 left-0 right-0 z-10">
              {/* Task progress */}
              <div className="px-4 py-3 bg-[#190047cc] border-t-4 border-black backdrop-blur-sm">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-mono text-[#41e5b3] text-[10px] uppercase tracking-wider">🇮🇩 Team Mission</span>
                  <span className="font-mono font-bold text-[#ffc312] text-xs">
                    {room.tasksCompleted}/{room.tasksRequired} ({Math.min(100, Math.round((room.tasksCompleted / room.tasksRequired) * 100))}%)
                  </span>
                </div>
                <div className="w-full bg-black border-2 border-black h-5 overflow-hidden relative">
                  <div
                    className="bg-[#00c899] h-full transition-all duration-500 relative"
                    style={{ width: `${Math.min(100, (room.tasksCompleted / room.tasksRequired) * 100)}%` }}
                  >
                    <div className="absolute inset-y-0 right-0 w-1 bg-black/40" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-mono text-white text-[10px] font-bold tracking-wider shadow-[2px_2px_0px_#000000]">
                      TEAM MISSION PROGRESS
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ══════════════════════════════
              KOLOM KANAN — Radar Monitor
              ══════════════════════════════ */}
          <div className="w-[28%] flex flex-col overflow-hidden bg-[#13003a]">

            {/* Header */}
            <div className="px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
              <div className="font-rubik italic text-[#ffe5b3] text-lg font-bold leading-none">RADAR MONITOR</div>
              <div className="font-mono text-[#d3c5ab] text-[10px] tracking-wider mt-0.5">
                {alivePlayers.length} PLAYERS ONLINE
              </div>
            </div>

            {/* Player list */}
            <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1.5">
              {studentPlayers.map((p, idx) => {
                const color = avatarColors[idx % avatarColors.length];
                const isMe = p.id === player?.id;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 p-2 border-2 transition-all ${
                      p.isDead
                        ? 'bg-[#190047] border-[#4f4632] opacity-60'
                        : isMe
                        ? 'bg-[#270067] border-[#ffc312]'
                        : 'bg-[#190047] border-[#4f4632] hover:border-[#d3c5ab]'
                    }`}
                  >
                    {/* Avatar */}
                    <div className="relative flex-shrink-0">
                      <div
                        className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-lg overflow-hidden"
                        style={{ backgroundColor: color }}
                      >
                        {p.isDead ? '👻' : '🧑‍🚀'}
                      </div>
                      <div
                        className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                          p.isDead ? 'bg-[#ffb4ab]' : 'bg-[#41e5b3]'
                        }`}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`font-mono text-sm leading-tight truncate ${
                        p.isDead ? 'text-[#d3c5ab] line-through' : isMe ? 'text-[#ffc312] font-bold' : 'text-[#e9ddff]'
                      }`}>
                        {p.name} {isMe && '(U)'}
                      </span>
                      <span className={`font-mono text-[10px] ${
                        p.isDead ? 'text-[#ffb4ab]' : 'text-[#41e5b3]'
                      }`}>
                        {p.isDead ? 'ELIMINATED' : `ALIVE • ${p.score} PT`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Mini Radar */}
            <div className="p-3 border-t-4 border-black shrink-0">
              <div className="aspect-square w-full bg-[#00000033] border-4 border-black relative overflow-hidden">
                {/* Radar rings */}
                <div className="absolute inset-2 rounded-full border-2 border-[#41e5b333]" />
                <div className="absolute inset-6 rounded-full border-2 border-[#41e5b333]" />
                {/* Radar sweep line */}
                <div className="absolute top-0 left-1/2 w-0.5 h-1/2 bg-[#41e5b3] opacity-50 shadow-[0_0_6px_#41e5b3] origin-bottom animate-spin" style={{ animationDuration: '3s' }} />
                {/* Players as dots */}
                {alivePlayers.slice(0, 6).map((p, i) => {
                  const angle = (i / Math.max(alivePlayers.length, 1)) * 360;
                  const r = 30 + (i % 2) * 15;
                  const x = 50 + r * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + r * Math.sin((angle * Math.PI) / 180);
                  return (
                    <div
                      key={p.id}
                      className="absolute w-2 h-2 rounded-full bg-[#41e5b3] border border-black"
                      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%,-50%)' }}
                    />
                  );
                })}
                {/* Label */}
                <div className="absolute bottom-2 left-0 right-0 flex justify-center">
                  <span className="font-mono text-[#41e5b3] text-[9px] tracking-wider">SCANNING...</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </main>
  );
}
