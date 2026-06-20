"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Shield, Heart } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea, MinigameHint,
  MinigameProgress, MinigameFooter, SILA_LABELS,
} from './MinigameShell';

/**
 * HubungkanKebaikan - Sila 2 Wiring Task Minigame Component
 */
export default function HubungkanKebaikan({ onGameComplete, onComplete, compact = false }) {
  const CORRECT_PAIRS = {
    "A1": "N1", // Hati -> Empati
    "A2": "N2", // Jabat Tangan -> Solidaritas
    "A3": "N3"  // Pertolongan -> Tolong Menolong
  };

  const LEFT_CARDS = [
    { id: "A1", label: "SOURCE A", title: "Empati Hati", icon: Heart, bg: "bg-red-300", color: "#fda4af" },
    { id: "A2", label: "SOURCE B", title: "Jabat Tangan", bg: "bg-yellow-400", color: "#facc15" },
    { id: "A3", label: "SOURCE C", title: "Pertolongan", bg: "bg-teal-400", color: "#2dd4bf" }
  ];

  const RIGHT_CARDS = [
    { id: "N1", label: "[ EMPATI ]", outline: "outline-teal-500", color: "#2dd4bf" },
    { id: "N2", label: "[ SOLIDARITAS ]", outline: "outline-yellow-400", color: "#facc15" },
    { id: "N3", label: "[ TOLONG MENOLONG ]", outline: "outline-red-300", color: "#fda4af" }
  ];

  // State
  const [activeLeft, setActiveLeft] = useState(null);
  const [connections, setConnections] = useState([]); // Array of { from: 'A1', to: 'N1' }
  const [isWin, setIsWin] = useState(false);
  const [errorFlash, setErrorFlash] = useState(null); // id of wrong right card clicked

  // Refs for tracking coordinates
  const containerRef = useRef(null);
  const pinRefs = useRef({});
  const [coords, setCoords] = useState({});

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
    updateCoordinates();
    window.addEventListener('resize', updateCoordinates);
    // Delay to make sure layout rendering has settled
    const timer = setTimeout(updateCoordinates, 150);
    return () => {
      window.removeEventListener('resize', updateCoordinates);
      clearTimeout(timer);
    };
  }, [connections]);

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

      // Check win condition
      if (newConnections.length === 3) {
        setIsWin(true);
        fireTaskComplete(onComplete, onGameComplete);
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

  // Integrity progress & power calculation
  const powerLevel = Math.round((connections.length / 3) * 100);

  return (
    <MinigameRoot compact={compact}>
      <MinigameHeader
        compact={compact}
        icon={Shield}
        iconBg="bg-white"
        title="Hubungkan Kebaikan"
        sila={SILA_LABELS[2]}
        statusVariant={isWin ? 'win' : 'playing'}
        statusLabel={isWin ? '🎉 SIRKUIT AKTIF' : '⚙️ HUBUNGKAN'}
      />

      <MinigameWorkArea compact={compact} className="!p-0 sm:!p-0">
        {!compact && (
          <div className="px-3 pt-3">
            <MinigameHint>
              Hubungkan simbol kebaikan (kiri) dengan nilai yang sesuai (kanan) untuk menyalakan sirkuit kemanusiaan.
            </MinigameHint>
          </div>
        )}

        <div
          ref={containerRef}
          className={`relative w-full h-auto ${compact ? 'min-h-[280px] px-2 py-3' : 'min-h-[400px] px-4 py-6'} flex flex-col lg:flex-row justify-between items-stretch gap-3 sm:gap-6`}
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
                      stroke="black" strokeWidth="8" 
                      strokeLinecap="round" 
                    />
                    <line 
                      x1={start.x} y1={start.y} 
                      x2={end.x} y2={end.y} 
                      stroke={wireColor} strokeWidth="5" 
                      strokeLinecap="round" 
                      className="animate-pulse"
                    />
                  </g>
                );
              })}

              {/* Render currently active drawing line from activeLeft to mouse or just indicating connection */}
              {/* (We use selected highlighting which is fully accessible and robust on all screens) */}
            </svg>
          )}

          {/* Left Column: Actions (A1, A2, A3) */}
          <div className="w-full lg:w-[40%] flex flex-col justify-center gap-6 sm:gap-9 z-20">
            {LEFT_CARDS.map((card) => {
              const isSelected = activeLeft === card.id;
              const isConnected = connections.some(c => c.from === card.id);
              const Icon = card.icon;

              return (
                <div 
                  key={card.id}
                  onClick={() => handleLeftClick(card.id)}
                  className={`p-4 sm:p-6 bg-violet-900 shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-between items-center gap-4 cursor-pointer select-none transition-all duration-100 ${
                    isConnected ? 'opacity-80' : 'hover:scale-[1.02] active:translate-y-[2px]'
                  } ${isSelected ? 'ring-4 ring-yellow-400 scale-[1.01]' : ''}`}
                >
                  {/* Left indicator box / icon */}
                  <div className={`p-2 outline outline-2 outline-offset-[-2px] outline-black shrink-0 ${card.bg}`}>
                    {Icon ? (
                      <Icon className="w-6 h-6 text-black" />
                    ) : (
                      <div className="w-6 h-6 flex items-center justify-center font-extrabold text-black font-mono-tech text-base">
                        🤝
                      </div>
                    )}
                  </div>

                  {/* Title & Progress Bar */}
                  <div className="flex-1 flex flex-col justify-start items-start gap-1">
                    <span className="text-purple-200 text-xs font-bold font-mono-tech uppercase">
                      {card.label}: {card.title}
                    </span>
                    {/* Simulated cable details */}
                    <div className="self-stretch h-2 bg-black rounded-full overflow-hidden">
                      <div 
                        className={`h-2 transition-all duration-300 ${isConnected ? 'w-full' : 'w-1/3'}`}
                        style={{ backgroundColor: card.color }}
                      ></div>
                    </div>
                  </div>

                  {/* Pin Dot connection target */}
                  <div className="pl-2 shrink-0">
                    <div 
                      ref={el => pinRefs.current[card.id] = el}
                      className={`w-6 h-6 rounded-full border-2 border-neutral-600 flex justify-center items-center transition-all ${
                        isConnected 
                          ? 'bg-green-500 scale-110 shadow-sm border-black' 
                          : isSelected 
                          ? 'bg-yellow-400 animate-ping border-black' 
                          : 'bg-black hover:bg-neutral-800'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-sm ${isConnected ? 'bg-white' : 'bg-neutral-800'}`}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Center: progress ringkas di compact */}
          <div className="w-full lg:w-[15%] flex flex-col justify-center items-center gap-2 z-20">
            {compact && (
              <div className="w-full px-2">
                <MinigameProgress label="SIRKUIT" value={powerLevel} win={isWin} />
              </div>
            )}
            {!compact && (
              <>
                <div className="p-3 bg-black border-4 border-black text-orange-200 text-center max-w-xs">
                  <span className="text-[10px] font-bold font-mono-tech uppercase">INSTRUKSI</span>
                  <p className="text-[10px] sm:text-xs mt-1 leading-relaxed">Klik kiri lalu kanan untuk menghubungkan pasangan.</p>
                </div>
                <div className="w-14 h-14 bg-white border-4 border-black flex justify-center items-center rounded-xl text-xl">❤️</div>
              </>
            )}
          </div>

          {/* Right Column: Values (N1, N2, N3) */}
          <div className="w-full lg:w-[45%] flex flex-col justify-center gap-6 sm:gap-9 z-20">
            {RIGHT_CARDS.map((card) => {
              const isConnected = connections.some(c => c.to === card.id);
              const isWrongFlash = errorFlash === card.id;

              return (
                <div 
                  key={card.id}
                  onClick={() => handleRightClick(card.id)}
                  className={`p-4 sm:p-6 bg-violet-950 shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-between items-center gap-4 cursor-pointer select-none transition-all duration-100 ${
                    isConnected ? 'opacity-80' : 'hover:scale-[1.02] active:translate-y-[2px]'
                  } ${isWrongFlash ? 'ring-4 ring-red-500 bg-red-950/40 animate-shake' : ''}`}
                >
                  {/* Pin Dot connection target */}
                  <div className="pr-2 shrink-0">
                    <div 
                      ref={el => pinRefs.current[card.id] = el}
                      className={`w-6 h-6 rounded-full border-2 border-neutral-600 flex justify-center items-center transition-all ${
                        isConnected 
                          ? 'bg-green-500 scale-110 shadow-sm border-black' 
                          : 'bg-black hover:bg-neutral-800'
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-sm ${isConnected ? 'bg-white' : 'bg-neutral-800'}`}></div>
                    </div>
                  </div>

                  {/* Value Text Box */}
                  <div className={`flex-1 px-4 py-2 bg-black outline outline-2 outline-offset-[-2px] inline-flex flex-col justify-center items-center ${card.outline}`}>
                    <span className="text-center text-purple-200 text-sm sm:text-base font-bold font-mono-tech uppercase tracking-wide">
                      {card.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </MinigameWorkArea>

      <MinigameFooter
        compact={compact}
        onReset={handleReset}
        resetLabel="RESET WIRES"
        showReset={!isWin}
        disabled={isWin}
      >
        {!compact && (
          <MinigameProgress label="POWER SIRKUIT" value={powerLevel} win={isWin} />
        )}
      </MinigameFooter>
    </MinigameRoot>
  );
}
