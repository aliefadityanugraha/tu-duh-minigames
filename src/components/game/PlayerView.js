import React, { useState } from 'react';
import { PanelRightClose, PanelRightOpen, ChevronDown, ChevronUp } from 'lucide-react';
import WargaPanel from '../panels/WargaPanel';
import ProvokateurPanel from '../panels/ProvokateurPanel';
import GameEndedCard from './GameEndedCard';
import LiveStatsPanel from '../LiveStatsPanel';
import TopicDebateBanner from '../overlays/TopicDebateOverlay';
import { SKINS } from '../lobby/WaitingRoom';

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

  const avatarColors = [
    '#41e5b3', '#8fb2ff', '#ffdf9c', '#ffb7d7',
    '#cda4ff', '#ffc58f', '#8ffff3', '#ffb4ab',
  ];

  const taskPercent = room.tasksRequired > 0
    ? Math.min(100, Math.round((room.tasksCompleted / room.tasksRequired) * 100))
    : 0;

  // Mendefinisikan isNextTaskLoading yang hilang
  const isNextTaskLoading = false; 

  return (
    <main className={`relative z-10 w-full flex-1 flex flex-col ${isMobileLandscape ? 'landscape-mode' : ''} ${isMobilePortrait ? 'portrait-mode' : ''} ${showRadar ? 'radar-expanded' : 'radar-collapsed'}`}>
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
        <div className={`flex-1 flex flex-col ${isMobilePortrait || isMobileLandscape ? 'overflow-y-auto h-auto' : 'overflow-hidden'}`}>

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

          <div className={`flex-grow min-h-0 flex bg-[#13003a] ${isMobilePortrait
            ? 'flex-col overflow-y-visible p-2 gap-3 h-auto'
            : isMobileLandscape
              ? 'flex-row overflow-y-visible p-1.5 gap-2 h-auto min-h-[380px]'
              : 'flex-row overflow-hidden p-4 gap-4'
            }`}>

            {/* SIDEBAR (Radar) */}
            <aside className={`flex flex-col bg-transparent transition-all duration-300 ease-in-out ${isMobilePortrait
              ? 'w-full h-auto order-2 shrink-0'
              : showRadar
                ? isMobileLandscape
                  ? 'w-64 h-full shrink-0 overflow-hidden pb-2'
                  : 'w-80 h-full shrink-0 overflow-hidden pb-4'
                : isMobileLandscape
                  ? 'w-12 h-full shrink-0 overflow-hidden'
                  : 'w-16 h-full shrink-0 overflow-hidden'
              } ${isMobileLandscape ? 'min-h-[360px]' : ''}`}>

              {isMobilePortrait ? (
                // MOBILE PORTRAIT VIEW
                showRadar ? (
                  /* CARD 2: COLLAPSIBLE MONITOR WARGA (Mobile Expanded) */
                  <div className="w-full flex flex-col bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    <div
                      onClick={() => setShowRadar(false)}
                      className="shrink-0 px-3 py-4 bg-[#270067] flex items-center justify-between cursor-pointer hover:bg-[#330081] transition-colors select-none"
                    >
                      <span className="font-mono text-[#ffc312] text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1.5">
                        📡 MONITOR WARGA ({alivePlayers.length}/{studentPlayers.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#41e5b3] font-bold tracking-widest">LIVE RADAR</span>
                        <ChevronDown size={14} className="text-yellow-400" />
                      </div>
                    </div>

                    <div className="flex flex-col border-t-4 border-black bg-[#22005c] h-64">
                      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin">
                        {studentPlayers.map((p, idx) => {
                          const skin = SKINS.find(s => s.id === p.skinId) || SKINS[0];
                          const color = skin.bg;
                          const isMe = p.id === player?.id;
                          return (
                            <div
                              key={p.name}
                              className={`px-2.5 py-2 flex items-center justify-between text-[10px] sm:text-[11px] font-mono transition-all duration-100 ${isMe
                                ? 'bg-[#2c007a] border-4 border-[#ffc312] text-yellow-300 shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                                : p.isDead
                                  ? 'bg-[#1e004e] border-2 border-dashed border-[#5b4a79] text-neutral-500 opacity-50'
                                  : 'bg-[#2c007a] border-4 border-black text-[#d3c5ab] shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                                }`}
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <div
                                  className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black flex-shrink-0 flex items-center justify-center text-sm ${p.isDead ? 'opacity-40 grayscale' : ''}`}
                                  style={{ backgroundColor: color }}
                                >
                                  {skin.emoji}
                                </div>
                                <span className="font-bold truncate max-w-[80px] sm:max-w-[100px]">
                                  {p.name} {isMe && '(Anda)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <span className="text-[9px] text-[#ffc312] font-extrabold">
                                  {p.score} PT
                                </span>
                                <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] ${p.isDead ? 'bg-[#93000a] text-red-200' : 'bg-[#00c899] text-black'
                                  }`}>
                                  {p.isDead ? 'DEAD' : 'ALIVE'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* CARD 2: COLLAPSIBLE MONITOR WARGA (Mobile Collapsed) */
                  <div
                    onClick={() => setShowRadar(true)}
                    className="w-full bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-3 py-4 flex items-center justify-between cursor-pointer hover:bg-[#270067] transition-all select-none"
                  >
                    <span className="font-mono text-[#ffc312] text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1.5">
                      📡 MONITOR WARGA ({alivePlayers.length}/{studentPlayers.length})
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#41e5b3] font-bold tracking-widest">LIVE RADAR</span>
                      <ChevronUp size={14} className="text-yellow-400" />
                    </div>
                  </div>
                )
              ) : (
                // DESKTOP & LANDSCAPE VIEW
                showRadar ? (
                  /* CARD 2: COLLAPSIBLE MONITOR WARGA (Desktop Expanded) */
                  <div className="w-full flex flex-col bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] h-full min-h-0">
                    <div
                      onClick={() => setShowRadar(false)}
                      className={`shrink-0 px-3 bg-[#270067] flex items-center justify-between cursor-pointer hover:bg-[#330081] transition-colors select-none ${isMobileLandscape ? 'py-2.5' : 'py-5'
                        }`}
                    >
                      <span className="font-mono text-[#ffc312] text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1.5">
                        📡 MONITOR WARGA ({alivePlayers.length}/{studentPlayers.length})
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-[#41e5b3] font-bold tracking-widest hidden sm:inline">LIVE RADAR</span>
                        <ChevronDown size={14} className="text-yellow-400" />
                      </div>
                    </div>

                    <div className="flex flex-col border-t-4 border-black flex-1 min-h-0 bg-[#22005c]">
                      <div className={`flex-1 overflow-y-auto flex flex-col scrollbar-thin ${isMobileLandscape ? 'p-1.5 gap-1.5' : 'p-3 gap-3'
                        }`}>
                        {studentPlayers.map((p, idx) => {
                          const skin = SKINS.find(s => s.id === p.skinId) || SKINS[0];
                          const color = skin.bg;
                          const isMe = p.id === player?.id;
                          return (
                            <div
                              key={p.name}
                              className={`px-2 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono transition-all duration-100 ${isMobileLandscape ? 'border-2' : 'border-4'
                                } ${isMe
                                  ? 'bg-[#2c007a] border-[#ffc312] text-yellow-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                                  : p.isDead
                                    ? 'bg-[#1e004e] border-dashed border-[#5b4a79] text-neutral-500 opacity-50'
                                    : 'bg-[#2c007a] border-black text-[#d3c5ab] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                                }`}
                            >
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div
                                  className={`rounded-full border border-black flex-shrink-0 flex items-center justify-center text-[10px] sm:text-xs ${isMobileLandscape ? 'w-5 h-5' : 'w-7 h-7 sm:w-8 sm:h-8'
                                    } ${p.isDead ? 'opacity-40 grayscale' : ''}`}
                                  style={{ backgroundColor: color }}
                                >
                                  {skin.emoji}
                                </div>
                                <span className="font-bold truncate max-w-[75px] sm:max-w-[100px]">
                                  {p.name} {isMe && '(Anda)'}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] text-[#ffc312] font-extrabold">
                                  {p.score} PT
                                </span>
                                <span className={`text-[8px] font-black px-1.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] ${p.isDead ? 'bg-[#93000a] text-red-200' : 'bg-[#00c899] text-black'
                                  }`}>
                                  {p.isDead ? 'DEAD' : 'ALIVE'}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => setShowRadar(true)}
                    className="flex-1 w-full h-full bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between py-5 cursor-pointer hover:bg-[#270067] transition-all select-none"
                  >
                    <div className="relative flex flex-col items-center justify-center bg-[#270067] p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform">
                      <span className="text-xl">📡</span>
                      <span className="absolute -top-1.5 -right-1.5 bg-[#41e5b3] text-black border border-black font-mono text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                        {alivePlayers.length}
                      </span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-4">
                      <span className="font-mono text-[#ffc312] text-[10px] font-black tracking-widest uppercase [writing-mode:vertical-lr] select-none">
                        MONITOR WARGA
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1">
                      <ChevronUp size={16} className="text-yellow-400 rotate-90 animate-pulse" />
                      <span className="font-mono text-[#41e5b3] text-[8px] font-extrabold tracking-tighter">LIVE</span>
                    </div>
                  </div>
                )
              )}
            </aside>

            {/* MAIN GAME WORK AREA (Right) */}
            <main className={`flex-1 min-h-0 bg-transparent flex items-stretch transition-all duration-300 ease-in-out ${isMobilePortrait
              ? 'w-full h-auto order-1 min-h-[380px] shrink-0'
              : isMobileLandscape
                ? 'w-full h-auto min-h-[360px] shrink-0'
                : 'h-full'
              }`}>
              <div className={`w-full flex flex-col items-stretch h-full ${isMobileLandscape ? 'h-auto' : 'h-full'
                }`}>

                {room.topicDebate?.active && (
                  <TopicDebateBanner topicDebate={room.topicDebate} />
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
