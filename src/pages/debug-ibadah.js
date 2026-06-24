import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { Volume2, VolumeX, LogOut, Lock, Star, Gamepad2, User, ChevronUp, ChevronDown } from 'lucide-react';
import TebakRumahIbadah from '../components/minigames/TebakRumahIbadah';

export default function DebugIbadah() {
  const [completed, setCompleted] = useState(false);
  const [muted, setMuted] = useState(false);
  const [logs, setLogs] = useState([]);
  const [resetKey, setResetKey] = useState(0);
  const [isRadarExpanded, setIsRadarExpanded] = useState(true);

  // Responsive states for mobile landscape and portrait detection
  const [isMobileLandscape, setIsMobileLandscape] = useState(false);
  const [isMobilePortrait, setIsMobilePortrait] = useState(false);

  useEffect(() => {
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

  const handleGameComplete = () => {
    setCompleted(true);
    setLogs((prev) => [...prev, `Misi selesai!`]);
  };

  const handleReset = () => {
    setCompleted(false);
    setLogs([]);
    setResetKey((prev) => prev + 1);
  };

  const mockPlayers = [
    { name: 'test1', xp: 80, isDead: false, isSelf: true, color: '#ffdf9c' },
    { name: 'Lutfi', xp: 160, isDead: false, isSelf: false, color: '#41e5b3' },
    { name: 'Faris', xp: 240, isDead: false, isSelf: false, color: '#8fb2ff' },
    { name: 'Zidan', xp: 80, isDead: true, isSelf: false, color: '#ffb4ab' },
    { name: 'Budi', xp: 0, isDead: false, isSelf: false, color: '#cda4ff' },
    { name: 'Siti', xp: 320, isDead: false, isSelf: false, color: '#ffc58f' },
    { name: 'Dewi', xp: 160, isDead: true, isSelf: false, color: '#ffb7d7' },
    { name: 'Rian', xp: 80, isDead: false, isSelf: false, color: '#8ffff3' },
  ];

  return (
    <div className={`w-screen bg-[#190047] flex font-sans text-white select-none relative ${(isMobilePortrait || isMobileLandscape)
        ? 'flex-col items-stretch justify-start h-auto min-h-screen overflow-y-auto'
        : 'items-center justify-center h-screen overflow-hidden'
      }`}>
      <Head>
        <title>Debug TebakRumahIbadah - Full Page</title>
      </Head>

      <div
        className={`flex flex-col bg-[#190047] w-full h-full ${isMobileLandscape ? 'landscape-mode h-auto min-h-screen overflow-y-auto' : ''} ${isMobilePortrait ? 'portrait-mode h-auto min-h-screen' : ''} ${isRadarExpanded ? 'radar-expanded' : 'radar-collapsed'}`}
      >
        {/* INJECT MOBILE OVERRIDES */}
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
        ` }} />

        {/* MOCK GAME HEADER */}
        <header className={`shrink-0 bg-[#13003a] border-b-4 border-black flex items-center justify-between px-2 sm:px-4 z-50 transition-all duration-300 ${isMobileLandscape ? 'h-9 border-b-2' : 'h-14 sm:h-16'
          }`}>
          {/* Left Section */}
          <div className="flex items-center gap-1.5 sm:gap-4">
            <span className={`font-rubik italic font-black tracking-wider text-[#ffc312] hover:scale-105 transition-all cursor-pointer ${isMobileLandscape ? 'text-xs' : 'text-xl sm:text-2xl'
              }`}>
              TU-DUH!
            </span>
            <div className={`${isMobileLandscape ? 'flex gap-1.5' : 'hidden sm:flex gap-3'} items-center`}>
              <div className={`flex items-center gap-1 font-mono text-[#d3c5ab] bg-[#22005c] border border-white/10 rounded ${isMobileLandscape ? 'text-[8px] px-1 py-0.5' : 'text-[11px] px-2 py-1'
                }`}>
                <Gamepad2 size={isMobileLandscape ? 10 : 13} className="text-[#41e5b3]" />
                <span>Game</span>
              </div>
              <div className={`flex items-center gap-1 font-mono text-white bg-[#22005c] border border-white/10 rounded ${isMobileLandscape ? 'text-[8px] px-1 py-0.5' : 'text-[11px] px-2 py-1'
                }`}>
                <User size={isMobileLandscape ? 10 : 13} className="text-yellow-400" />
                <span>test1</span>
              </div>
            </div>
          </div>

          {/* Center Section: Kode Room */}
          <div>
            <div className={`bg-[#ffc312] text-[#3f2e00] border-2 border-black font-mono font-black shadow-[1px_1px_0px_rgba(0,0,0,1)] flex items-center gap-1 cursor-pointer active:translate-y-[1px] active:shadow-none transition-all ${isMobileLandscape ? 'text-[8px] px-1.5 py-0.5' : 'text-[10px] sm:text-xs px-2.5 py-1 sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:border-4'
              }`}>
              <span>ROOM: BDGHKK</span>
              <span className="text-[8px] bg-black/10 px-0.5 py-0.5 rounded">📋</span>
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Status Badge */}
            <div className={`${isMobileLandscape ? 'flex gap-1' : 'hidden md:flex gap-2'} items-center`}>
              <div className={`bg-[#41e5b3] border-black text-[#003829] ${isMobileLandscape ? 'px-1 py-0.5 border text-[7.5px] font-black' : 'px-2 py-1 border-2 text-[10px] font-extrabold shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                }`}>
                <span>STATUS: ACTIVE</span>
              </div>
              <div className={`bg-[#ffc312] text-[#3f2e00] border-black ${isMobileLandscape ? 'px-1 py-0.5 border text-[7.5px] font-black' : 'px-2 py-1 border-2 text-[10px] font-extrabold shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                }`}>
                <span>THREAT: NORMAL</span>
              </div>
            </div>

            {/* Timer Circle */}
            <div className={`flex items-center justify-center rounded-full bg-[#ffc312] border-2 border-black text-[#3f2e00] shadow-[1px_1px_0px_rgba(0,0,0,1)] ${isMobileLandscape ? 'w-7 h-7 text-[8px]' : 'w-9 h-9 sm:w-12 sm:h-12 sm:border-4 sm:shadow-[3px_3px_0px_rgba(0,0,0,1)] text-xs sm:text-sm'
              }`}>
              <span className="font-rubik font-black flex items-center gap-0.5">
                4:32
              </span>
            </div>

            {/* Mute Button */}
            <button
              onClick={() => setMuted(!muted)}
              className={`bg-[#22005c] border-2 border-black rounded hover:bg-[#330081] text-[#d3c5ab] transition-all shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${isMobileLandscape ? 'p-0.5' : 'p-1.5 sm:p-2'
                }`}
            >
              {muted ? <VolumeX size={isMobileLandscape ? 10 : 13} /> : <Volume2 size={isMobileLandscape ? 10 : 13} />}
            </button>

            {/* Exit Button */}
            <button className={`bg-[#93000a] hover:bg-[#ffb4ab] hover:text-[#690005] text-[#ffdad6] border-2 border-black rounded transition-all shadow-[1px_1px_0px_rgba(0,0,0,1)] active:translate-y-[1px] active:shadow-none ${isMobileLandscape ? 'p-0.5' : 'p-1.5 sm:p-2'
              }`}>
              <LogOut size={isMobileLandscape ? 10 : 13} />
            </button>
          </div>
        </header>

        {/* TEAM MISSION BAR - MEDIUM/NEAT SIZE */}
        <section className={`shrink-0 px-4 bg-[#190047] border-b-4 border-black flex flex-col justify-center transition-all duration-300 ${isMobileLandscape ? 'h-6 border-b-2 px-2 py-0.5' : 'h-11'
          }`}>
          <div className={`flex justify-between items-center font-mono text-[#d3c5ab] font-bold uppercase tracking-wider ${isMobileLandscape ? 'text-[8px] leading-none mb-0.5' : 'text-[10px] sm:text-[11px] mb-0.5'
            }`}>
            <div className="flex items-center gap-1.5">
              <span className="text-[#41e5b3]">🇮🇩 TEAM MISSION</span>
            </div>
            <span className="text-[#ffc312] font-black">4/10 (40%)</span>
          </div>
          <div className={`w-full bg-black border border-black overflow-hidden relative shadow-[1px_1px_0px_rgba(0,0,0,1)] ${isMobileLandscape ? 'h-1' : 'h-2.5'
            }`}>
            <div
              className="bg-[#00c899] h-full transition-all duration-500"
              style={{ width: '40%' }}
            />
          </div>
        </section>

        {/* MAIN WORKSPACE AREA */}
        <div className={`flex-grow min-h-0 flex bg-[#13003a] ${isMobilePortrait
            ? 'flex-col overflow-y-visible p-2 gap-3 h-auto'
            : isMobileLandscape
              ? 'flex-row overflow-y-visible p-1.5 gap-2 h-auto min-h-[380px]'
              : 'flex-row overflow-hidden p-4 gap-4'
          }`}>

          {/* SIDEBAR (Left) */}
          <aside className={`flex flex-col bg-transparent transition-all duration-300 ease-in-out ${isMobilePortrait
              ? 'w-full h-auto order-2 shrink-0'
              : isRadarExpanded
                ? isMobileLandscape
                  ? 'w-64 h-full shrink-0 overflow-hidden pb-2'
                  : 'w-80 h-full shrink-0 overflow-hidden pb-4'
                : isMobileLandscape
                  ? 'w-12 h-full shrink-0 overflow-hidden'
                  : 'w-16 h-full shrink-0 overflow-hidden'
            } ${isMobileLandscape ? 'min-h-[360px]' : ''}`}>

            {isMobilePortrait ? (
              // MOBILE PORTRAIT VIEW
              isRadarExpanded ? (
                /* CARD 2: COLLAPSIBLE MONITOR WARGA (Mobile Expanded) */
                <div className="w-full flex flex-col bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                  {/* Header */}
                  <div
                    onClick={() => setIsRadarExpanded(false)}
                    className="shrink-0 px-3 py-4 bg-[#270067] flex items-center justify-between cursor-pointer hover:bg-[#330081] transition-colors select-none"
                  >
                    <span className="font-mono text-[#ffc312] text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1.5">
                      📡 MONITOR WARGA (8/8)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#41e5b3] font-bold tracking-widest">LIVE RADAR</span>
                      <ChevronDown size={14} className="text-yellow-400" />
                    </div>
                  </div>

                  {/* Player list container */}
                  <div className="flex flex-col border-t-4 border-black bg-[#22005c] h-64">
                    <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3 scrollbar-thin">
                      {mockPlayers.map((p) => (
                        <div
                          key={p.name}
                          className={`px-2.5 py-2 flex items-center justify-between text-[10px] sm:text-[11px] font-mono transition-all duration-100 ${p.isSelf
                            ? 'bg-[#2c007a] border-4 border-[#ffc312] text-yellow-300 shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                            : p.isDead
                              ? 'bg-[#1e004e] border-2 border-dashed border-[#5b4a79] text-neutral-500 opacity-50'
                              : 'bg-[#2c007a] border-4 border-black text-[#d3c5ab] shadow-[3px_3px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_rgba(0,0,0,1)]'
                            }`}
                        >
                          {/* Avatar & Name */}
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-black flex-shrink-0 ${p.isDead ? 'opacity-40 grayscale' : ''}`}
                              style={{ backgroundColor: p.color }}
                            />
                            <span className="font-bold truncate max-w-[80px] sm:max-w-[100px]">
                              {p.name} {p.isSelf && '(Anda)'}
                            </span>
                          </div>

                          {/* XP & Status Badge */}
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-[#ffc312] font-extrabold">
                              {p.xp} XP
                            </span>
                            <span className={`text-[8px] sm:text-[9px] font-black px-1.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] ${p.isDead ? 'bg-[#93000a] text-red-200' : 'bg-[#00c899] text-black'
                              }`}>
                              {p.isDead ? 'DEAD' : 'ALIVE'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* CARD 2: COLLAPSIBLE MONITOR WARGA (Mobile Collapsed) */
                <div
                  onClick={() => setIsRadarExpanded(true)}
                  className="w-full bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] px-3 py-4 flex items-center justify-between cursor-pointer hover:bg-[#270067] transition-all select-none"
                >
                  <span className="font-mono text-[#ffc312] text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1.5">
                    📡 MONITOR WARGA (8/8)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] text-[#41e5b3] font-bold tracking-widest">LIVE RADAR</span>
                    <ChevronUp size={14} className="text-yellow-400" />
                  </div>
                </div>
              )
            ) : (
              // DESKTOP & LANDSCAPE VIEW
              isRadarExpanded ? (
                /* CARD 2: COLLAPSIBLE MONITOR WARGA (Desktop Expanded) */
                <div className="w-full flex flex-col bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] h-full min-h-0">
                  {/* Header */}
                  <div
                    onClick={() => setIsRadarExpanded(false)}
                    className={`shrink-0 px-3 bg-[#270067] flex items-center justify-between cursor-pointer hover:bg-[#330081] transition-colors select-none ${isMobileLandscape ? 'py-2.5' : 'py-5'
                      }`}
                  >
                    <span className="font-mono text-[#ffc312] text-[10px] sm:text-[11px] font-black tracking-wider flex items-center gap-1.5">
                      📡 MONITOR WARGA (8/8)
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-[#41e5b3] font-bold tracking-widest hidden sm:inline">LIVE RADAR</span>
                      <ChevronDown size={14} className="text-yellow-400" />
                    </div>
                  </div>

                  {/* Player list container */}
                  <div className="flex flex-col border-t-4 border-black flex-1 min-h-0 bg-[#22005c]">
                    <div className={`flex-1 overflow-y-auto flex flex-col scrollbar-thin ${isMobileLandscape ? 'p-1.5 gap-1.5' : 'p-3 gap-3'
                      }`}>
                      {mockPlayers.map((p) => (
                        <div
                          key={p.name}
                          className={`px-2 py-1.5 flex items-center justify-between text-[10px] sm:text-[11px] font-mono transition-all duration-100 ${isMobileLandscape ? 'border-2' : 'border-4'
                            } ${p.isSelf
                              ? 'bg-[#2c007a] border-[#ffc312] text-yellow-300 shadow-[2px_2px_0px_rgba(0,0,0,1)]'
                              : p.isDead
                                ? 'bg-[#1e004e] border-dashed border-[#5b4a79] text-neutral-500 opacity-50'
                                : 'bg-[#2c007a] border-black text-[#d3c5ab] shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_rgba(0,0,0,1)]'
                            }`}
                        >
                          {/* Avatar & Name */}
                          <div className="flex items-center gap-1.5 min-w-0">
                            <div
                              className={`rounded-full border border-black flex-shrink-0 ${isMobileLandscape ? 'w-5 h-5' : 'w-7 h-7 sm:w-8 sm:h-8'
                                } ${p.isDead ? 'opacity-40 grayscale' : ''}`}
                              style={{ backgroundColor: p.color }}
                            />
                            <span className="font-bold truncate max-w-[75px] sm:max-w-[100px]">
                              {p.name} {p.isSelf && '(Anda)'}
                            </span>
                          </div>

                          {/* XP & Status Badge */}
                          <div className="flex items-center gap-1.5 shrink-0">
                            <span className="text-[9px] text-[#ffc312] font-extrabold">
                              {p.xp} XP
                            </span>
                            <span className={`text-[8px] font-black px-1.5 py-0.5 border border-black rounded shadow-[1px_1px_0px_rgba(0,0,0,1)] ${p.isDead ? 'bg-[#93000a] text-red-200' : 'bg-[#00c899] text-black'
                              }`}>
                              {p.isDead ? 'DEAD' : 'ALIVE'}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  onClick={() => setIsRadarExpanded(true)}
                  className="flex-1 w-full h-full bg-[#22005c] border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-between py-5 cursor-pointer hover:bg-[#270067] transition-all select-none"
                >
                  <div className="relative flex flex-col items-center justify-center bg-[#270067] p-2 border-2 border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] hover:scale-105 transition-transform">
                    <span className="text-xl">📡</span>
                    <span className="absolute -top-1.5 -right-1.5 bg-[#41e5b3] text-black border border-black font-mono text-[8px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                      8
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
            {/* PERBAIKAN UTAMA DESKTOP & MOBILE: Menggunakan h-full dan items-stretch agar tinggi kontainer kiri-kanan mini game sejajar penuh */}
            <div className={`w-full flex flex-col items-stretch h-full ${isMobileLandscape ? 'h-auto p-1' : 'h-full p-2 sm:p-4 md:p-6'
              }`}>
              <TebakRumahIbadah key={resetKey} compact={false} onGameComplete={handleGameComplete} />
            </div>
          </main>
        </div>

      </div>
    </div>
  );
}
