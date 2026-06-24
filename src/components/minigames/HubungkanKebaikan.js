"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Heart, Users, MessageCircle, Link } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea,
  MinigameProgress, MinigameButton, MinigameWinBanner, SILA_LABELS,
} from './MinigameShell';

/**
 * HubungkanKebaikan - Sila 2 Wiring Task Minigame Component
 */
export default function HubungkanKebaikan({ onGameComplete, onComplete }) {
  const CORRECT_PAIRS = {
    "A1": "N1", // Bencana -> Solidaritas
    "A2": "N2", // Suku/Agama -> Kesetaraan
    "A3": "N3", // Bullying -> Keadilan & Keberanian
    "A4": "N4", // Pendapat -> Penghargaan Hak
    "A5": "N5"  // Sakit -> Kasih Sayang & Peduli
  };

  const LEFT_CARDS = [
    { id: "A1", label: "AKSI 1", title: "Membantu korban bencana alam tanpa pamrih", icon: Heart, bg: "bg-red-400", color: "#f87171" },
    { id: "A2", label: "AKSI 2", title: "Berteman tanpa membeda-bedakan suku & agama", icon: Users, bg: "bg-yellow-400", color: "#facc15" },
    { id: "A3", label: "AKSI 3", title: "Berani mencegah dan melaporkan tindakan perundungan", icon: Shield, bg: "bg-teal-400", color: "#2dd4bf" },
    { id: "A4", label: "AKSI 4", title: "Mendengarkan dan menghargai pendapat orang lain", icon: MessageCircle, bg: "bg-blue-400", color: "#60a5fa" },
    { id: "A5", label: "AKSI 5", title: "Menjenguk dan menghibur teman yang sedang sakit", icon: null, bg: "bg-pink-400", color: "#f472b6" }
  ];

  const RIGHT_CARDS = [
    { id: "N1", label: "[ SOLIDARITAS & EMPATI ]", outline: "outline-red-400 border-red-400", color: "#f87171" },
    { id: "N2", label: "[ TOLERANSI & KESETARAAN ]", outline: "outline-yellow-400 border-yellow-400", color: "#facc15" },
    { id: "N3", label: "[ KEADILAN & KEBERANIAN ]", outline: "outline-teal-400 border-teal-400", color: "#2dd4bf" },
    { id: "N4", label: "[ MENGHARGAI HAK ]", outline: "outline-blue-400 border-blue-400", color: "#60a5fa" },
    { id: "N5", label: "[ KASIH SAYANG & PEDULI ]", outline: "outline-pink-400 border-pink-400", color: "#f472b6" }
  ];

  // State
  const [isMounted, setIsMounted] = useState(false);
  const [shuffledLeft, setShuffledLeft] = useState([]);
  const [shuffledRight, setShuffledRight] = useState([]);

  const [activeLeft, setActiveLeft] = useState(null);
  const [connections, setConnections] = useState([]); // Array of { from: 'A1', to: 'N1' }
  const [isWin, setIsWin] = useState(false);
  const [errorFlash, setErrorFlash] = useState(null); // id of wrong right card clicked
  
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Fire complete reliably
  useEffect(() => {
    if (isWin && !completedRef.current) {
      completedRef.current = true;
      fireTaskComplete(onCompleteRef.current, onGameComplete);
    }
  }, [isWin, onGameComplete]);

  // Refs for tracking coordinates
  const containerRef = useRef(null);
  const pinRefs = useRef({});
  const [coords, setCoords] = useState({});

  useEffect(() => {
    // Pick 3 random pairs from the pool of 5
    const poolSize = LEFT_CARDS.length;
    const pickedIndices = [];
    while (pickedIndices.length < 3) {
      const r = Math.floor(Math.random() * poolSize);
      if (pickedIndices.indexOf(r) === -1) pickedIndices.push(r);
    }

    const selectedLeft = pickedIndices.map(i => LEFT_CARDS[i]);
    const selectedRight = pickedIndices.map(i => RIGHT_CARDS[i]);

    // Randomize their order separately to ensure lines cross
    setShuffledLeft(selectedLeft.sort(() => Math.random() - 0.5));
    setShuffledRight(selectedRight.sort(() => Math.random() - 0.5));
    setIsMounted(true);
  }, []);

  // Calculate coordinates of pin centers relative to the main container
  const updateCoordinates = () => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const newCoords = {};

    Object.keys(pinRefs.current).forEach((id) => {
      const el = pinRefs.current[id];
      if (el) {
        const rect = el.getBoundingClientRect();
        newCoords[id] = {
          x: rect.left - containerRect.left + rect.width / 2,
          y: rect.top - containerRect.top + rect.height / 2
        };
      }
    });
    setCoords(newCoords);
  };

  useEffect(() => {
    if (!isMounted) return;
    updateCoordinates();
    window.addEventListener('resize', updateCoordinates);
    // Delay to make sure layout rendering has settled
    const timer = setTimeout(updateCoordinates, 150);
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      clearTimeout(timer);
    };
  }, [connections, isMounted]);

  // Handle pin clicks
  const handleLeftClick = (id) => {
    if (isWin) return;
    // If already connected, do nothing
    if (connections.some(c => c.from === id)) return;
    setActiveLeft(id);
  };

  const handleRightClick = (id) => {
    if (isWin || !activeLeft) return;

    // Check if the connection is correct
    const expectedRight = CORRECT_PAIRS[activeLeft];
    if (expectedRight === id) {
      // Correct connection
      const newConnections = [...connections, { from: activeLeft, to: id }];
      setConnections(newConnections);
      setActiveLeft(null);

      // Check win condition (since we only show 3)
      if (newConnections.length === 3) {
        setIsWin(true);
      }
    } else {
      // Incorrect connection - flash error and reset selection
      setErrorFlash(id);
      setTimeout(() => setErrorFlash(null), 800);
      setActiveLeft(null);
    }
  };

  const handleReset = () => {
    if (isWin) return;
    setConnections([]);
    setActiveLeft(null);
    setErrorFlash(null);
  };

  // Get wire color from connection source
  const getWireColor = (fromId) => {
    const card = LEFT_CARDS.find(c => c.id === fromId);
    return card ? card.color : "#94a3b8";
  };

  // Integrity progress & power calculation (max is 3 now)
  const powerLevel = Math.round((connections.length / 3) * 100);

  if (!isMounted) return null; // Avoid hydration mismatch

  return (
    <MinigameRoot>
      <MinigameHeader
        icon={Link}
        iconBg="bg-orange-400"
        title="Hubungkan Kebaikan"
        sila={SILA_LABELS[2]}
        statusVariant={isWin ? 'win' : 'playing'}
        statusLabel={isWin ? '🎉 SIRKUIT AKTIF' : '⚙️ HUBUNGKAN'}
      />

      <MinigameWorkArea className="justify-start overflow-hidden !p-0 sm:!p-0 flex flex-col relative bg-violet-50">

        {/* Compact Hint Box to save vertical space */}
        <div className="w-full bg-yellow-100 border-b-[3px] border-black p-2 sm:p-2.5 px-3 flex items-center justify-center shrink-0 z-20 shadow-[0_2px_0_0_rgba(0,0,0,1)] relative">
          <span className="text-[10px] sm:text-[11px] font-black uppercase text-black text-center tracking-wide">
            💡 Klik aksi (kiri) lalu klik nilai (kanan) yang paling sesuai.
          </span>
        </div>

        <div
          ref={containerRef}
          className="relative w-full flex-1 min-h-0 px-4 py-4 sm:px-8 sm:py-6 flex flex-col landscape:flex-row md:flex-row justify-between items-stretch gap-6 sm:gap-10 z-10 max-w-5xl mx-auto"
        >
          {/* SVG Connector Layer */}
          {Object.keys(coords).length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
              {/* Render success connections */}
              {connections.map((c, idx) => {
                const start = coords[c.from];
                const end = coords[c.to];
                if (!start || !end) return null;
                const wireColor = getWireColor(c.from);
                return (
                  <g key={`wire-${idx}`}>
                    {/* Shadow/Glow line */}
                    <line
                      x1={start.x} y1={start.y}
                      x2={end.x} y2={end.y}
                      stroke="black" strokeWidth="6"
                      strokeLinecap="round"
                    />
                    <line
                      x1={start.x} y1={start.y}
                      x2={end.x} y2={end.y}
                      stroke={wireColor} strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-pulse"
                    />
                  </g>
                );
              })}
            </svg>
          )}

          {/* Left Column: Actions (A1, A2, A3) */}
          <div className="w-full landscape:w-[42%] md:w-[42%] lg:w-[38%] flex flex-col justify-around gap-3 sm:gap-4 z-20 shrink-0">
            {shuffledLeft.map((card) => {
              const isSelected = activeLeft === card.id;
              const isConnected = connections.some(c => c.from === card.id);
              const Icon = card.icon;

              return (
                <div
                  key={card.id}
                  onClick={() => handleLeftClick(card.id)}
                  className={`p-2.5 sm:p-4 bg-violet-900 border-[3px] border-black flex justify-between items-center gap-2.5 sm:gap-4 cursor-pointer select-none transition-all duration-200 ${isConnected ? 'opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[2px]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,1)]'
                    } ${isSelected ? 'ring-4 ring-yellow-400 bg-violet-800 scale-[1.02] shadow-[6px_6px_0px_0px_rgba(250,204,21,0.5)]' : ''}`}
                >
                  {/* Left indicator box / icon */}
                  <div className={`p-1.5 sm:p-2.5 border-[2px] border-black shrink-0 ${card.bg} shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
                    {Icon ? (
                      <Icon className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
                    ) : (
                      <div className="w-4 h-4 sm:w-6 sm:h-6 flex items-center justify-center font-extrabold text-black font-mono-tech text-xs sm:text-base">
                        🤝
                      </div>
                    )}
                  </div>

                  {/* Title & Progress Bar */}
                  <div className="flex-1 flex flex-col justify-start items-start gap-1">
                    <span className="text-purple-200 text-[9px] sm:text-[10px] font-black font-mono-tech uppercase">
                      {card.label}
                    </span>
                    <span className="text-white text-[10px] sm:text-xs font-bold leading-tight">
                      {card.title}
                    </span>
                  </div>

                  {/* Pin Dot connection target */}
                  <div className="pl-1 sm:pl-3 shrink-0">
                    <div
                      ref={el => pinRefs.current[card.id] = el}
                      className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border-[3px] flex justify-center items-center transition-all ${isConnected
                        ? 'bg-green-500 scale-110 shadow-sm border-black'
                        : isSelected
                          ? 'bg-yellow-400 animate-ping border-black shadow-[0_0_8px_rgba(250,204,21,1)]'
                          : 'bg-black hover:bg-neutral-800 border-neutral-600'
                        }`}
                    >
                      <div className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${isConnected ? 'bg-white' : 'bg-neutral-800'}`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Values (N1, N2, N3) */}
          <div className="w-full landscape:w-[42%] md:w-[42%] lg:w-[38%] flex flex-col justify-around gap-3 sm:gap-4 z-20 shrink-0">
            {shuffledRight.map((card) => {
              const isConnected = connections.some(c => c.to === card.id);
              const isWrongFlash = errorFlash === card.id;

              return (
                <div
                  key={card.id}
                  onClick={() => handleRightClick(card.id)}
                  className={`p-2.5 sm:p-4 bg-violet-950 border-[3px] border-black flex justify-between items-center gap-2.5 sm:gap-4 cursor-pointer select-none transition-all duration-200 ${isConnected ? 'opacity-80 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] translate-y-[2px]' : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,1)]'
                    } ${isWrongFlash ? 'ring-4 ring-red-500 bg-red-900/60 animate-shake' : ''}`}
                >
                  {/* Pin Dot connection target */}
                  <div className="pr-1 sm:pr-3 shrink-0">
                    <div
                      ref={el => pinRefs.current[card.id] = el}
                      className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border-[3px] flex justify-center items-center transition-all ${isConnected
                        ? 'bg-green-500 scale-110 shadow-sm border-black'
                        : 'bg-black hover:bg-neutral-800 border-neutral-600'
                        }`}
                    >
                      <div className={`w-1.5 h-1.5 sm:w-2.5 sm:h-2.5 rounded-full ${isConnected ? 'bg-white' : 'bg-neutral-800'}`}></div>
                    </div>
                  </div>

                  {/* Value Text Box */}
                  <div className={`flex-1 px-1.5 py-2 sm:px-4 sm:py-3.5 bg-black border-[2px] inline-flex flex-col justify-center items-center ${card.outline} shadow-[2px_2px_0px_0px_rgba(0,0,0,0.5)]`}>
                    <span className="text-center text-purple-100 text-[9px] sm:text-xs font-black font-mono-tech uppercase tracking-wide">
                      {card.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* BOTTOM CONTROLS (Replaces MinigameFooter to match DekripsiPesan) */}
        <div className="flex flex-col gap-1.5 sm:gap-2 w-full mx-auto mt-auto p-2.5 sm:p-3 shrink-0 bg-white border-t-[3px] border-black z-20">
          <MinigameProgress label="POWER SIRKUIT" value={powerLevel} win={isWin} />

          <div className="flex gap-2 mt-1">
            {isWin ? (
              <MinigameWinBanner win winMessage="Sirkuit aktif! Menunggu konfirmasi misi..." />
            ) : (
              <MinigameButton
                variant="ghost"
                onClick={handleReset}
                disabled={connections.length === 0}
                className="w-full py-2.5 sm:py-3 text-xs sm:text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none disabled:translate-y-0 transition-all bg-gray-100"
              >
                RESET KABEL
              </MinigameButton>
            )}
          </div>
        </div>

      </MinigameWorkArea>
    </MinigameRoot>
  );
}
