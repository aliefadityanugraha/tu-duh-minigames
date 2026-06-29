import React, { useState } from 'react';
import { PanelRightClose, PanelRightOpen, ChevronDown, ChevronUp, X } from 'lucide-react';
import WargaPanel from '../panels/WargaPanel';
import ProvokateurPanel from '../panels/ProvokateurPanel';
import GameEndedCard from './GameEndedCard';
import LiveStatsPanel from '../LiveStatsPanel';
import TopicDebateBanner from '../overlays/TopicDebateOverlay';

import { PLAYER_COLORS, OPERATOR_SKIN } from '@shared/constants';

/**
 * Layout in-game: Mission Book (+ optional Radar Monitor).
 */
export default function PlayerView({
  room, player, roleInfo, skinList,
  currentTask, isAnswered, selectedOption, feedback,
  taskError, minigameRetryKey,
  taskLocked,
  sabotageQuiz, onSubmitSabotageQuiz,
  duelCooldownRemaining,
  taskTimer,
  onSelectOption, onSubmitQuiz, onMinigameComplete, onNextTask, onClearTaskError, onRetryMinigameSubmit, onRetryQuizSubmit,
  onTriggerSabotage, onTriggerDuel,
}) {
  const [showRadar, setShowRadar] = useState(false);

  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  React.useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;

      const landscape = w > h && h < 540;
      const portrait = w <= h && w < 768;

      setIsMobileLandscape(landscape);
      setIsMobilePortrait(portrait);
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial call

    return () => window.removeEventListener('resize', handleResize);
  }, []);
  const isPlayerDead = !!player?.isDead;

  const alivePlayers = room.players.filter(p => !p.isGuru && !p.isDead);
  const studentPlayers = room.players.filter(p => !p.isGuru);



  const taskPercent = room.tasksRequired > 0
    ? Math.min(100, Math.round((room.tasksCompleted / room.tasksRequired) * 100))
    : 0;

  // Mendefinisikan isNextTaskLoading yang hilang
  const isNextTaskLoading = false; 

  const playerSkin = player?.isGuru ? OPERATOR_SKIN : (skinList?.find(s => s.id === player?.skinId) || skinList?.[0] || {});
  const playerColor = player?.isGuru ? '#e5e7eb' : PLAYER_COLORS[player?.colorId ?? 0];
  const roleName = roleInfo?.role === 'provokator' ? 'Provokator' : roleInfo?.isGuru ? 'Guru' : 'Warga';

  const playerProfile = player ? {
    name: player.name,
    color: playerColor,
    skin: playerSkin,
    role: roleName,
    isDead: isPlayerDead
  } : null;

  return (
    <main className={`relative z-10 w-full h-full flex-1 flex flex-col ${isMobileLandscape ? 'landscape-mode' : ''} ${isMobilePortrait ? 'portrait-mode' : ''} ${showRadar ? 'radar-expanded' : 'radar-collapsed'}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
        /* LANDSCAPE SPECIFIC MINIGAME COMPONENT OVERRIDES */
        .landscape-mode .mobile-main-workspace {
          overflow: hidden !important;
        }
        
        /* Make the TebakRumahIbadah outer container fit nicely */
        .landscape-mode .mobile-main-workspace > div {
          height: 100% !important;
          width: 100% !important;
          padding: 0 !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
        }

        /* Board container - expanded */
        .landscape-mode.radar-expanded [class*="bg-yellow-100"][class*="border-4"] {
          border-width: 2px !important;
          outline-width: 2px !important;
          outline-offset: -2px !important;
          box-shadow: 4px 4px 0px rgba(0,0,0,1) !important;
          height: 330px !important; /* Force a comfortable size, not squished/ceper! */
          width: 100% !important;
          max-width: 480px !important;
          margin: 0 auto !important; /* Force center horizontally */
        }

        /* Board container - collapsed */
        .landscape-mode.radar-collapsed [class*="bg-yellow-100"][class*="border-4"] {
          border-width: 2px !important;
          outline-width: 2px !important;
          outline-offset: -2px !important;
          box-shadow: 4px 4px 0px rgba(0,0,0,1) !important;
          height: 330px !important; /* Force a comfortable size, not squished/ceper! */
          width: 100% !important;
          max-width: 640px !important; /* Wider when closed */
          margin: 0 auto !important; /* Force center horizontally */
        }

        /* Minigame Header */
        .landscape-mode [class*="bg-yellow-100"] > div:first-child {
          height: 2.25rem !important; /* 36px height */
          padding: 0 0.5rem !important;
          border-bottom-width: 2.5px !important;
          flex-direction: row !important;
          justify-content: space-between !important;
          align-items: center !important;
          gap: 0.25rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] > div:first-child div[class*="rounded-"] {
          width: 1.5rem !important;
          height: 1.5rem !important;
          border-width: 1.5px !important;
          border-radius: 0.25rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] > div:first-child div[class*="rounded-"] svg {
          width: 0.85rem !important;
          height: 0.85rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] > div:first-child h1 {
          font-size: 10px !important;
          line-height: 1.1 !important;
          font-weight: 800 !important;
          text-transform: uppercase !important;
          color: black !important;
          display: block !important;
        }
        .landscape-mode [class*="bg-yellow-100"] > div:first-child span {
          font-size: 7.5px !important;
          line-height: 1.1 !important;
          font-weight: 700 !important;
          color: #4a4a4a !important;
          display: block !important;
          margin-top: 1px !important;
        }
        .landscape-mode [class*="bg-yellow-100"] > div:first-child .neo-badge {
          font-size: 7.5px !important;
          padding: 0.05rem 0.2rem !important;
          border-width: 1px !important;
        }

        /* Work Area */
        .landscape-mode [class*="bg-yellow-100"] > div:nth-child(2) {
          padding: 0.35rem !important;
          gap: 0.35rem !important;
          flex-grow: 1 !important;
          min-height: 0 !important;
          overflow: hidden !important;
        }
        .landscape-mode [class*="bg-yellow-100"] > div:nth-child(2) > div {
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
          gap: 0.5rem !important;
          height: 100% !important;
        }

        /* Columns */
        .landscape-mode [class*="bg-yellow-100"] .flex-col {
          gap: 0.3rem !important;
        }

        /* Section Label */
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-black"] {
          padding: 0.1rem 0.3rem !important;
          border-width: 1.5px !important;
        }
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-black"] span {
          font-size: 8.5px !important;
        }

        /* Section Content Wrapper */
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-white"][class*="border-4"] {
          padding: 0.3rem !important;
          border-width: 2px !important;
        }

        /* Image box wrapper */
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-white"] div[class*="bg-black"][class*="border-4"] {
          border-width: 2px !important;
          padding: 0.1rem !important;
          box-shadow: 2px 2px 0px rgba(0,0,0,1) !important;
        }
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-white"] div[class*="bg-black"] div[class*="aspect-"] {
          max-height: 120px !important;
          max-width: 180px !important;
          margin: 0 auto !important;
        }

        /* Hint container */
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-white"] div[class*="bg-white"][class*="border-4"] {
          padding: 0.15rem 0.25rem !important;
          border-width: 1px !important;
        }
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-white"] div[class*="bg-white"][class*="border-4"] span {
          font-size: 7.5px !important;
        }
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-white"] div[class*="bg-white"][class*="border-4"] p {
          font-size: 6.5px !important;
          line-height: 1.1 !important;
          margin-top: 0.02rem !important;
        }

        /* Answer verification text override */
        .landscape-mode [class*="bg-yellow-100"] p[class*="text-red-700"] {
          font-size: 8px !important;
          margin-bottom: 0.1rem !important;
        }

        /* Answer grid & options */
        .landscape-mode [class*="bg-yellow-100"] .py-2 {
          padding-top: 0 !important;
          padding-bottom: 0 !important;
          gap: 0.15rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] .py-2 .flex-col {
          gap: 0.15rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] .py-2 span {
          font-size: 7.5px !important;
        }

        /* Buttons list */
        .landscape-mode [class*="bg-yellow-100"] div[class*="grid-cols-2"] {
          grid-template-columns: repeat(3, minmax(0, 1fr)) !important;
          gap: 0.15rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] div[class*="grid-cols-2"] button {
          padding-top: 0.2rem !important;
          padding-bottom: 0.2rem !important;
          font-size: 7.5px !important;
          border-width: 1px !important;
          box-shadow: 1px 1px 0px rgba(0,0,0,1) !important;
        }

        /* Submit button container */
        .landscape-mode [class*="bg-yellow-100"] .mt-2 {
          margin-top: 0.2rem !important;
          gap: 0.2rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] .mt-2 button {
          padding-top: 0.3rem !important;
          padding-bottom: 0.3rem !important;
          font-size: 8px !important;
          border-width: 1.5px !important;
          box-shadow: 1.5px 1.5px 0px rgba(0,0,0,1) !important;
        }

        /* Win Banner */
        .landscape-mode [class*="bg-yellow-100"] .py-6 {
          padding-top: 0.2rem !important;
          padding-bottom: 0.2rem !important;
        }
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-green-500"] {
          padding: 0.2rem !important;
          border-width: 1.5px !important;
        }
        .landscape-mode [class*="bg-yellow-100"] div[class*="bg-green-500"] span {
          font-size: 7.5px !important;
        }

        /* Sidebar scrollbar styling */
        .landscape-mode aside {
          overflow-y: auto !important;
        }
        .landscape-mode aside::-webkit-scrollbar {
          width: 5px !important;
        }
        .landscape-mode aside::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2) !important;
        }
        .landscape-mode aside::-webkit-scrollbar-thumb {
          background: #ffc312 !important;
          border-radius: 2px !important;
        }
        .landscape-mode aside::-webkit-scrollbar-thumb:hover {
          background: #e0ab0d !important;
        }

        /* PORTRAIT SPECIFIC MINIGAME COMPONENT OVERRIDES */
        .portrait-mode .mobile-main-workspace {
          width: 100% !important;
          padding: 0.25rem !important;
        }
        .portrait-mode .mobile-main-workspace > div {
          width: 100% !important;
          max-width: 420px !important;
        }
        @media (max-width: 640px) {
          .portrait-mode [class*="bg-yellow-100"] > div:first-child h1 {
            font-size: 13px !important;
          }
          .portrait-mode [class*="bg-yellow-100"] > div:first-child span {
            font-size: 8px !important;
          }
        }
      `}} />

      {(room.state === 'playing' || room.state === 'ended') && room.showStatsToAll && (
        <div className="px-4 pt-3">
          <LiveStatsPanel room={room} isCollapsed={false} onToggle={() => { }} />
        </div>
      )}

      {room.state === 'ended' && (
        <div className="p-4">
          <GameEndedCard room={room} roleInfo={roleInfo} selfId={player?.id} onRestart={() => { }} />
        </div>
      )}

      {room.state === 'playing' && (
        <div className="flex-1 flex flex-col overflow-y-auto h-auto relative">

          {/* Team mission progress */}
          <div className="shrink-0 px-3 sm:px-4 py-2 sm:py-3 bg-[#190047] border-b-4 border-black flex items-center gap-3 sm:gap-4">
            
            {/* Monitor Warga Button - Far Left */}
            <button
              type="button"
              onClick={() => setShowRadar(true)}
              className="shrink-0 flex items-center justify-center w-9 h-9 sm:w-11 sm:h-11 bg-[#2c007a] border-[3px] sm:border-4 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:bg-[#3b00a3] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all relative mr-1 sm:mr-3"
              title="Buka Monitor Warga"
            >
              <span className="text-base sm:text-lg leading-none drop-shadow-md mt-0.5 text-white">📡</span>
              <div className="absolute -top-1.5 -right-1.5 sm:-top-2 sm:-right-2 w-4 h-4 sm:w-5 sm:h-5 bg-[#41e5b3] text-[#13003a] text-[9px] sm:text-[11px] font-black rounded-full border sm:border-[2px] border-black flex items-center justify-center z-10 shadow-[1px_1px_0px_rgba(0,0,0,1)] leading-none">
                {alivePlayers.length}
              </div>
            </button>

            {/* Identity Badge */}
            {playerProfile && (
              <div className={`flex items-center gap-2 sm:gap-3 shrink-0 ${playerProfile.isDead ? 'opacity-50 grayscale' : ''}`}>
                <div
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-[3px] border-black shadow-[2px_2px_0px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden shrink-0"
                  style={{ backgroundColor: playerProfile.color }}
                >
                  {playerProfile.skin?.img ? <img src={playerProfile.skin.img} alt="Avatar" className="w-[120%] h-[120%] object-cover mt-1" /> : <span className="text-sm">🧑‍🚀</span>}
                </div>
                <div className="flex flex-col">
                  <span className="font-mono font-black text-white text-[10px] sm:text-[13px] leading-tight truncate max-w-[70px] sm:max-w-[150px] drop-shadow-md">
                    {playerProfile.name}
                  </span>
                  <span className={`font-mono text-[8px] sm:text-[10px] font-black tracking-widest leading-tight ${playerProfile.role === 'Provokator' ? 'text-[#ffb3b3]' : 'text-[#a7f3d0]'}`}>
                    {playerProfile.role?.toUpperCase() || ''}
                  </span>
                </div>
              </div>
            )}
            <div className="flex-1 flex flex-col justify-center">
              <div className="flex justify-between items-center mb-1 px-0.5">
                <span className="font-mono text-[#ffc312] text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
                  PROGRESS MISI
                </span>
                <span className="font-mono font-black text-[#ffc312] text-[9px] sm:text-[11px]">
                  {room.tasksCompleted}/{room.tasksRequired} ({taskPercent}%)
                </span>
              </div>
              <div className="w-full bg-black border-2 border-black h-3 sm:h-4 overflow-hidden relative shadow-[2px_2px_0px_#000000]">
                <div
                  className="bg-[#00c899] h-full transition-all duration-500"
                  style={{ width: `${taskPercent}%` }}
                />
              </div>
            </div>
          </div>

          <div className={`flex-grow min-h-0 flex flex-col bg-[#13003a] p-2 sm:p-4 gap-3 sm:gap-4 ${
            roleInfo?.role === 'provokator' 
              ? 'overflow-y-visible h-auto min-h-[380px] sm:min-h-[600px]' 
              : 'overflow-hidden h-full'
          }`}>

            {/* Overlay for Drawer */}
            <div
              className={`absolute inset-0 bg-black/60 z-[55] transition-opacity duration-300 ${showRadar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
              onClick={() => setShowRadar(false)}
            />

            {/* SIDEBAR (Radar) as a Universal Drawer */}
            <aside className={`absolute top-0 bottom-0 left-0 z-[60] w-[190px] sm:w-[280px] flex flex-col pointer-events-auto transform transition-transform duration-300 ease-in-out ${showRadar ? 'translate-x-0' : '-translate-x-full'}`}>
              <div className="w-full h-full flex flex-col bg-[#22005c] border-r-4 border-black shadow-[4px_0px_0px_rgba(0,0,0,1)]">
                <div className="shrink-0 px-3 py-4 bg-[#270067] flex items-center justify-between border-b-4 border-black select-none">
                  <span className="font-mono text-[#ffc312] text-[11px] sm:text-[13px] font-black tracking-wider flex items-center gap-1.5">
                    📡 MONITOR ({alivePlayers.length}/{studentPlayers.length})
                  </span>
                  <button onClick={() => setShowRadar(false)} className="text-[#ffdad6] hover:text-white bg-[#93000a] border-2 border-black rounded p-0.5 shadow-[2px_2px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none">
                    <X size={16} />
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 sm:p-3 flex flex-col gap-2 scrollbar-thin">
                  {studentPlayers.map((p, idx) => {
                    const skin = p.isGuru ? OPERATOR_SKIN : (skinList?.find(s => s.id === p.skinId) || skinList?.[0] || {});
                    const color = p.isGuru ? '#e5e7eb' : PLAYER_COLORS[p.colorId ?? 0];
                    const isMe = p.id === player?.id;
                    return (
                      <div
                        key={p.name}
                        className={`px-2.5 sm:px-3 py-2 sm:py-2.5 flex items-center justify-between text-[10px] sm:text-[12px] font-mono transition-all duration-100 ${isMe
                          ? 'bg-[#2c007a] border-2 border-[#ffc312] text-yellow-300'
                          : p.isDead
                            ? 'bg-[#1e004e] border-2 border-dashed border-[#5b4a79] text-neutral-500 opacity-50'
                            : 'bg-[#2c007a] border-2 border-black text-[#d3c5ab]'
                          }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div
                            className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full border border-black flex-shrink-0 flex items-center justify-center text-[10px] overflow-hidden bg-white ${p.isDead ? 'opacity-40 grayscale' : ''}`}
                            style={{ backgroundColor: color }}
                          >
                            {skin.img && <img src={skin.img} alt={skin.name} className="w-full h-full object-cover" />}
                          </div>
                          <span className="font-bold truncate max-w-[70px] sm:max-w-[120px]">
                            {p.name} {isMe && '(Anda)'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] sm:text-[11px] text-[#ffc312] font-extrabold">{p.score} TASK</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* MAIN GAME WORK AREA */}
            <main className="flex-1 min-h-0 bg-transparent flex flex-col items-stretch transition-all duration-300 ease-in-out w-full shrink-0">
              <div className="w-full flex-1 min-h-0 flex flex-col items-stretch">

                {room.topicDebate?.active && (
                  <TopicDebateBanner topicDebate={room.topicDebate} players={room.players} />
                )}

                {room.presentation?.active && room.presentation.playerId !== player?.id && (
                  <div className="flex items-center gap-3 px-4 py-2.5 bg-[#270067] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-fadeIn shrink-0 mb-4">
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
                  <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-transparent">
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
                        taskTimer={taskTimer}
                        isNextTaskLoading={isNextTaskLoading}
                        onSelectOption={onSelectOption}
                        onSubmitQuiz={onSubmitQuiz}
                        onMinigameComplete={onMinigameComplete}
                        onNextTask={onNextTask}
                        onClearTaskError={onClearTaskError}
                        onRetryMinigameSubmit={onRetryMinigameSubmit}
                        onRetryQuizSubmit={onRetryQuizSubmit}
                        playerProfile={playerProfile}
                      />
                    )}
                    {roleInfo.role === 'provokator' && (
                      <ProvokateurPanel
                        room={room}
                        selfId={player?.id}
                        isPlayerDead={isPlayerDead}
                        duelCooldownRemaining={duelCooldownRemaining}
                        sabotageQuiz={sabotageQuiz}
                        taskTimer={taskTimer}
                        onTriggerSabotage={onTriggerSabotage}
                        onTriggerDuel={onTriggerDuel}
                        onSubmitSabotageQuiz={onSubmitSabotageQuiz}
                        currentTask={currentTask}
                        isAnswered={isAnswered}
                        selectedOption={selectedOption}
                        feedback={feedback}
                        taskError={taskError}
                        minigameRetryKey={minigameRetryKey}
                        onSelectOption={onSelectOption}
                        onSubmitQuiz={onSubmitQuiz}
                        onMinigameComplete={onMinigameComplete}
                        onNextTask={onNextTask}
                        onClearTaskError={onClearTaskError}
                        onRetryMinigameSubmit={onRetryMinigameSubmit}
                        onRetryQuizSubmit={onRetryQuizSubmit}
                        playerProfile={playerProfile}
                      />
                    )}
                  </div>
                )}

                {room.debate?.active && (
                  <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 text-center bg-[#190047] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div className="text-4xl">📢</div>
                    <div>
                      <p className="font-rubik italic text-[#5ffcc9] text-xl font-bold">MUSYAWARAH KELAS</p>
                      <p className="font-mono text-[#d3c5ab] text-sm mt-1">Voting berlangsung di layar overlay.</p>
                    </div>
                  </div>
                )}
              </div>
            </main>
          </div>
        </div>
      )}
    </main>
  );
}
