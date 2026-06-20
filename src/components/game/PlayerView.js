import React, { useState } from 'react';
import { PanelRightClose, PanelRightOpen } from 'lucide-react';
import WargaPanel from '../panels/WargaPanel';
import ProvokateurPanel from '../panels/ProvokateurPanel';
import GameEndedCard from './GameEndedCard';
import LiveStatsPanel from '../LiveStatsPanel';
import TopicDebateBanner from '../overlays/TopicDebateOverlay';

/**
 * Layout in-game: Mission Book (+ optional Radar Monitor).
 */
export default function PlayerView({
  room, player, roleInfo,
  currentTask, isAnswered, selectedOption, feedback,
  taskError, minigameRetryKey,
  taskLocked,
  sabotageQuiz, onSubmitSabotageQuiz,
  duelCooldownRemaining,
  onSelectOption, onSubmitQuiz, onMinigameComplete, onNextTask, onClearTaskError, onRetryMinigameSubmit, onRetryQuizSubmit,
  onTriggerSabotage, onTriggerDuel,
}) {
  const [showRadar, setShowRadar] = useState(false);
  const isPlayerDead = !!player?.isDead;

  const alivePlayers  = room.players.filter(p => !p.isGuru && !p.isDead);
  const studentPlayers = room.players.filter(p => !p.isGuru);

  const avatarColors = [
    '#41e5b3', '#8fb2ff', '#ffdf9c', '#ffb7d7',
    '#cda4ff', '#ffc58f', '#8ffff3', '#ffb4ab',
  ];

  const taskPercent = room.tasksRequired > 0
    ? Math.min(100, Math.round((room.tasksCompleted / room.tasksRequired) * 100))
    : 0;

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">

      {(room.state === 'playing' || room.state === 'ended') && room.showStatsToAll && (
        <div className="px-4 pt-3">
          <LiveStatsPanel room={room} isCollapsed={false} onToggle={() => {}} />
        </div>
      )}

      {room.state === 'ended' && (
        <div className="p-4">
          <GameEndedCard room={room} roleInfo={roleInfo} selfId={player?.id} onRestart={() => {}} />
        </div>
      )}

      {room.state === 'playing' && (
        <div className="flex-1 flex flex-col overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>

          {/* Team mission progress — compact bar */}
          <div className="shrink-0 px-4 py-2 bg-[#190047] border-b-4 border-black">
            <div className="flex justify-between items-center mb-1">
              <span className="font-mono text-[#41e5b3] text-[10px] uppercase tracking-wider">🇮🇩 Team Mission</span>
              <span className="font-mono font-bold text-[#ffc312] text-xs">
                {room.tasksCompleted}/{room.tasksRequired} ({taskPercent}%)
              </span>
            </div>
            <div className="w-full bg-black border-2 border-black h-4 overflow-hidden relative">
              <div
                className="bg-[#00c899] h-full transition-all duration-500"
                style={{ width: `${taskPercent}%` }}
              />
            </div>
          </div>

          <div className="flex-1 flex gap-0 overflow-hidden min-h-0">

            {/* Mission Book / Aksi */}
            <div className={`flex flex-col border-r-4 border-black overflow-hidden transition-all duration-300 ${
              showRadar ? 'w-[65%]' : 'w-full'
            }`}>
              <div className="flex-1 neo-card border-0 rounded-none overflow-hidden flex flex-col bg-[#190047] min-h-0">

                {/* Toolbar: toggle radar */}
                <div className="shrink-0 flex items-center justify-between px-3 py-1.5 bg-[#13003a] border-b-2 border-[#4f4632]">
                  <span className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">
                    {showRadar ? 'Mode: Mission + Radar' : 'Mode: Mission Full'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRadar(v => !v)}
                    className="flex items-center gap-1.5 px-2 py-1 bg-[#270067] hover:bg-[#330081] border-2 border-black text-[#d3c5ab] font-mono text-[10px] font-bold transition-all"
                  >
                    {showRadar ? <PanelRightClose size={12} /> : <PanelRightOpen size={12} />}
                    {showRadar ? 'Sembunyikan Radar' : 'Tampilkan Radar'}
                  </button>
                </div>

                {room.topicDebate?.active && (
                  <TopicDebateBanner topicDebate={room.topicDebate} />
                )}

                {room.presentation?.active && room.presentation.playerId !== player?.id && (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-[#270067] border-b-4 border-[#ffc312] animate-fadeIn shrink-0">
                    <span className="text-xl">🎤</span>
                    <div>
                      <p className="font-mono font-bold text-[#ffc312] text-xs">SESI PRESENTASI</p>
                      <p className="font-mono text-[#d3c5ab] text-[10px]">
                        <strong className="text-white">{room.presentation.playerName}</strong> sedang presentasi.
                      </p>
                    </div>
                  </div>
                )}

                {!room.debate?.active && !room.topicDebate?.active && (
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                    {roleInfo.role === 'warga' && (
                      <WargaPanel
                        currentTask={currentTask}
                        isAnswered={isAnswered}
                        selectedOption={selectedOption}
                        feedback={feedback}
                        taskError={taskError}
                        minigameRetryKey={minigameRetryKey}
                        isPlayerDead={isPlayerDead}
                        taskLocked={taskLocked}
                        onSelectOption={onSelectOption}
                        onSubmitQuiz={onSubmitQuiz}
                        onMinigameComplete={onMinigameComplete}
                        onNextTask={onNextTask}
                        onClearTaskError={onClearTaskError}
                        onRetryMinigameSubmit={onRetryMinigameSubmit}
                        onRetryQuizSubmit={onRetryQuizSubmit}
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

                {room.debate?.active && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center">
                    <div className="text-4xl">📢</div>
                    <div>
                      <p className="font-rubik italic text-[#5ffcc9] text-xl font-bold">MUSYAWARAH KELAS</p>
                      <p className="font-mono text-[#d3c5ab] text-sm mt-1">Voting berlangsung di layar overlay.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Radar Monitor — optional */}
            {showRadar && (
              <div className="w-[35%] flex flex-col overflow-hidden bg-[#13003a] min-h-0">
                <div className="px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
                  <div className="font-rubik italic text-[#ffe5b3] text-lg font-bold leading-none">RADAR MONITOR</div>
                  <div className="font-mono text-[#d3c5ab] text-[10px] tracking-wider mt-0.5">
                    {alivePlayers.length} PLAYERS ONLINE
                  </div>
                </div>

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
                            : 'bg-[#190047] border-[#4f4632]'
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-lg shrink-0"
                          style={{ backgroundColor: color }}
                        >
                          {p.isDead ? '👻' : '🧑‍🚀'}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className={`font-mono text-sm truncate ${
                            p.isDead ? 'text-[#d3c5ab] line-through' : isMe ? 'text-[#ffc312] font-bold' : 'text-[#e9ddff]'
                          }`}>
                            {p.name} {isMe && '(U)'}
                          </span>
                          <span className={`font-mono text-[10px] ${p.isDead ? 'text-[#ffb4ab]' : 'text-[#41e5b3]'}`}>
                            {p.isDead ? 'ELIMINATED' : `ALIVE • ${p.score} PT`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
