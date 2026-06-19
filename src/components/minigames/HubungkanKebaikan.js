"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Shield, CheckCircle2, RotateCcw, AlertTriangle, Heart, HelpCircle } from 'lucide-react';

/**
 * HubungkanKebaikan - Sila 2 Wiring Task Minigame Component
 * Implements Sila ke-2 (Kemanusiaan yang Adil dan Beradab)
 * 
 * Props:
 * - onGameComplete: function called when the game is won
 */
export default function HubungkanKebaikan({ onGameComplete }) {
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
        if (onGameComplete) {
          onGameComplete();
        }
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
  const integrityBars = [
    connections.length >= 1,
    connections.length >= 2,
    connections.length >= 3,
    false
  ];

  const powerLevel = Math.round((connections.length / 3) * 100);

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-indigo-950 p-2 sm:p-4 md:p-6 lg:p-8 font-sans min-h-screen flex items-center justify-center">
      {/* Outer Console Board */}
      <div className="w-full bg-yellow-100 shadow-[12px_12px_0px_0px_rgba(0,0,0,1.00)] outline outline-[5px] outline-offset-[-5px] outline-black border-4 border-black relative overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header Bar */}
        <div className="w-full h-auto sm:h-24 bg-yellow-400 border-b-[5px] border-black flex flex-col sm:flex-row items-center sm:justify-between px-4 py-3 sm:py-0 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Scales/Shield badge */}
            <div className="w-12 h-12 bg-white rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-center items-center shrink-0">
              <Shield className="w-7 h-7 text-yellow-950" />
            </div>
            {/* Title & Subtitle */}
            <div className="flex flex-col text-left">
              <h1 className="text-black text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight leading-none font-sans">
                Hubungkan Kebaikan
              </h1>
              <span className="text-yellow-900 text-[10px] sm:text-xs font-bold tracking-wider font-mono-tech mt-1">
                SILA 2: KEMANUSIAAN YANG ADIL DAN BERADAB
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 sm:self-center shrink-0">
            {isWin ? (
              <div className="neo-badge bg-green-500 text-black border-black text-xs py-1 px-3 animate-bounce">
                🎉 SIRKUIT AKTIF
              </div>
            ) : (
              <div className="neo-badge bg-red-500 text-white border-black text-xs py-1 px-3 animate-pulse">
                ⚙️ SIRKUIT TERPUTUS
              </div>
            )}
          </div>
        </div>

        {/* Main Interactive Board Area */}
        <div 
          ref={containerRef}
          className="relative w-full h-auto min-h-[500px] px-4 py-8 sm:px-6 sm:py-12 md:px-8 flex flex-col lg:flex-row justify-between items-stretch gap-8 sm:gap-12"
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

          {/* Center Column: Instruction details */}
          <div className="w-full lg:w-[15%] flex flex-col justify-center items-center gap-4 z-20">
            <div className="p-4 sm:p-5 bg-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-2 outline-offset-[-2px] outline-orange-200 flex flex-col justify-center items-center gap-2 text-center text-orange-200 max-w-sm lg:max-w-none">
              <span className="text-xs font-bold font-mono-tech uppercase tracking-wider">
                INSTRUCTIONS
              </span>
              <p className="text-xs sm:text-sm leading-relaxed font-sans">
                Hubungkan simbol kebaikan dengan nilai yang sesuai untuk menyalakan sirkuit kemanusiaan.
              </p>
            </div>
            
            {/* Center icon decoration */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-center items-center select-none shrink-0 rounded-xl">
              <div className="w-10 h-10 bg-indigo-900 rounded-full flex items-center justify-center text-white text-lg">
                ❤️
              </div>
            </div>
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

        {/* Footer Bar: Integrity Status, Power Level, and Reset */}
        <div className="w-full h-auto px-6 py-4 bg-amber-200 border-t-[5px] border-black flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap justify-center items-center gap-6 sm:gap-8 w-full sm:w-auto">
            {/* Integrity status bars */}
            <div className="flex flex-col items-center sm:items-start shrink-0">
              <span className="text-black text-[10px] font-bold font-mono-tech uppercase leading-none mb-1.5">
                INTEGRITY STATUS
              </span>
              <div className="flex gap-1.5">
                {integrityBars.map((active, i) => (
                  <div 
                    key={i} 
                    className={`w-4 h-4 border-2 border-black transition-all ${
                      active ? 'bg-teal-400' : 'bg-black'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
            
            {/* Power level percentage */}
            <div className="flex flex-col items-center sm:items-start shrink-0">
              <span className="text-black text-[10px] font-bold font-mono-tech uppercase leading-none mb-1">
                POWER LEVEL
              </span>
              <span className="text-violet-950 text-xl font-extrabold font-sans leading-none">
                {powerLevel}%
              </span>
            </div>
          </div>
          
          {/* Action reset button */}
          <button
            type="button"
            onClick={handleReset}
            disabled={isWin}
            className="px-6 py-3 bg-yellow-400 hover:bg-yellow-300 active:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black font-extrabold uppercase text-sm font-mono-tech text-black tracking-wider cursor-pointer shrink-0 select-none text-center"
          >
            RESET WIRES
          </button>
        </div>

      </div>
    </div>
  );
}
