"use client";

import React, { useState, useEffect } from 'react';
import { Scale, ChevronLeft, ChevronRight, CheckCircle2, Shield, ArrowLeftRight, HelpCircle } from 'lucide-react';

/**
 * TimbanganKeadilan - Scale Balancing Minigame Component
 * Implements Sila ke-5 (Keadilan Sosial Bagi Seluruh Rakyat Indonesia)
 * 
 * Props:
 * - onGameComplete: function called when the game is won
 */
export default function TimbanganKeadilan({ onGameComplete }) {
  // Initial states: jawaStock = 10, sumateraStock = 2
  const [jawaStock, setJawaStock] = useState(10);
  const [sumateraStock, setSumateraStock] = useState(2);
  const [isWin, setIsWin] = useState(false);
  const [isDelaying, setIsDelaying] = useState(false);

  // Dynamic Index Keadilan: 100 - (difference * 10)%
  const difference = Math.abs(jawaStock - sumateraStock);
  const indexKeadilan = 100 - (difference * 10);

  // Weight Load calculation
  const jawaBebanPercent = Math.round((jawaStock / 10) * 100);
  const sumateraBebanPercent = Math.round((sumateraStock / 10) * 100);

  // Tilt Angle: (Jawa - Sumatera) * 5 degrees
  const tiltAngle = (jawaStock - sumateraStock) * 5;

  // Win condition checker
  useEffect(() => {
    if (jawaStock === 6 && sumateraStock === 6 && !isWin && !isDelaying) {
      setIsDelaying(true);
      const timer = setTimeout(() => {
        setIsWin(true);
        if (onGameComplete) {
          onGameComplete();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [jawaStock, sumateraStock, isWin, isDelaying, onGameComplete]);

  // Handlers
  const moveToSumatera = () => {
    if (isWin || isDelaying) return;
    if (jawaStock > 0) {
      setJawaStock(prev => prev - 1);
      setSumateraStock(prev => prev + 1);
    }
  };

  const moveToJawa = () => {
    if (isWin || isDelaying) return;
    if (sumateraStock > 0) {
      setSumateraStock(prev => prev - 1);
      setJawaStock(prev => prev + 1);
    }
  };

  const handleReset = () => {
    if (isWin) return;
    setJawaStock(10);
    setSumateraStock(2);
    setIsDelaying(false);
  };

  const isBalanced = jawaStock === 6 && sumateraStock === 6;

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-indigo-950 p-2 sm:p-4 md:p-6 lg:p-8 font-sans min-h-screen flex items-center justify-center">
      {/* Outer Console Board */}
      <div className="w-full bg-yellow-100 shadow-[12px_12px_0px_0px_rgba(0,0,0,1.00)] outline outline-[5px] outline-offset-[-5px] outline-black border-4 border-black relative overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header Bar */}
        <div className="w-full h-auto sm:h-24 bg-yellow-400 border-b-[5px] border-black flex flex-col sm:flex-row items-center sm:justify-between px-4 py-3 sm:py-0 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Scales badge */}
            <div className="w-12 h-12 bg-orange-200 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-center items-center shrink-0">
              <Scale className="w-7 h-7 text-black" />
            </div>
            {/* Title & Subtitle */}
            <div className="flex flex-col text-left">
              <h1 className="text-black text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight leading-none font-sans">
                TIMBANGAN KEADILAN SOSIAL
              </h1>
              <span className="text-black/70 text-[10px] sm:text-xs font-bold tracking-wider font-mono-tech mt-1">
                SILA 5: KEADILAN SOSIAL BAGI SELURUH RAKYAT INDONESIA
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 sm:self-center shrink-0">
            {isWin ? (
              <div className="neo-badge bg-green-500 text-black border-black text-xs py-1 px-3 animate-bounce">
                🎉 KEADILAN TERCAPAI
              </div>
            ) : isBalanced ? (
              <div className="neo-badge bg-yellow-500 text-black border-black text-xs py-1 px-3 animate-pulse">
                ⚖️ MENYINKRONKAN...
              </div>
            ) : (
              <div className="neo-badge bg-red-500 text-white border-black text-xs py-1 px-3">
                ⚖️ BELUM MERATA
              </div>
            )}
          </div>
        </div>

        {/* Main Workspace Area */}
        <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-stretch w-full min-h-[500px]">
          
          {/* Left Column: Wilayah Berlebih (Jawa) */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col justify-start gap-2">
            <div className="self-stretch p-4 bg-purple-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-start items-center gap-2 text-center text-white">
              <span className="text-orange-200 text-base sm:text-lg font-black font-mono-tech uppercase">
                WILAYAH JAWA
              </span>
              <p className="text-purple-200 text-xs sm:text-sm font-semibold leading-relaxed">
                Logistik menumpuk di Jawa ({jawaStock} Unit). Pindahkan logistik ke luar pulau agar terjadi pemerataan sosial.
              </p>
            </div>
            
            {/* Grid of Jawa logistics boxes */}
            <div className="self-stretch flex-1 min-h-64 p-4 bg-black/10 rounded-xl outline outline-4 outline-offset-[-4px] border border-black/10 outline-black/20 flex flex-wrap gap-2.5 items-start justify-center content-start overflow-y-auto max-h-[350px] lg:max-h-none">
              {jawaStock === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono-tech text-xs italic">
                  Tidak ada pasokan tersisa.
                </div>
              )}
              {Array.from({ length: jawaStock }).map((_, idx) => (
                <div 
                  key={`jawa-${idx}`} 
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-yellow-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-3 outline-offset-[-3px] outline-black border-2 border-black flex items-center justify-center select-none animate-fadeIn hover:bg-yellow-300"
                >
                  <div className="w-5 h-5 border-2 border-black relative flex flex-col justify-between p-0.5 bg-yellow-500">
                    <div className="h-0.5 bg-black w-full"></div>
                    <div className="h-1.5 border border-black w-2.5 mx-auto bg-amber-800"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Middle Column: Visual Scale and Status */}
          <div className="flex-1 flex flex-col justify-between items-center gap-6 py-2">
            
            {/* Scale Status Light */}
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)] ${
                  isWin ? 'bg-green-500 animate-pulse' : 'bg-yellow-400'
                }`}></span>
                <span className="bg-black px-3 py-1 text-orange-200 text-xs font-bold font-mono-tech uppercase tracking-widest border border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)]">
                  STATUS: {isWin ? "MERATA & SEIMBANG" : "BELUM MERATA"}
                </span>
              </div>
            </div>

            {/* Interactive SVG Scale */}
            <div className="relative w-full max-w-[500px] h-64 sm:h-72 border-4 border-dashed border-black/15 rounded-2xl flex items-center justify-center p-4 bg-white/5 overflow-hidden">
              <svg className="w-full h-full select-none" viewBox="0 0 500 280">
                {/* Stand Background / Tiang Penyangga */}
                <line x1="250" y1="90" x2="250" y2="240" stroke="black" strokeWidth="12" strokeLinecap="round" />
                <line x1="250" y1="90" x2="250" y2="240" stroke="#334155" strokeWidth="6" strokeLinecap="round" />
                {/* Base platform */}
                <path d="M 180 240 L 320 240 L 300 255 L 200 255 Z" fill="#1e293b" stroke="black" strokeWidth="4" />

                {/* Rotating assembly group */}
                <g 
                  style={{ 
                    transform: `rotate(${tiltAngle}deg)`, 
                    transformOrigin: '250px 90px',
                    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {/* Rotating Beam / Lengan Timbangan */}
                  <rect x="70" y="84" width="360" height="12" rx="6" fill="#0f172a" stroke="black" strokeWidth="4" />
                  {/* Center pivot point circle */}
                  <circle cx="250" cy="90" r="14" fill="#6d28d9" stroke="black" strokeWidth="4" />
                  <circle cx="250" cy="90" r="6" fill="#a78bfa" />

                  {/* Left hanger pivot hook */}
                  <circle cx="90" cy="90" r="5" fill="#f59e0b" stroke="black" strokeWidth="2" />
                  {/* Right hanger pivot hook */}
                  <circle cx="410" cy="90" r="5" fill="#f59e0b" stroke="black" strokeWidth="2" />
                </g>

                {/* Left Hanging Pan (Jawa) */}
                {/* Counter-rotates by -tiltAngle to stay horizontal */}
                <g
                  style={{
                    transform: `rotate(${-tiltAngle}deg)`,
                    transformOrigin: '90px 90px',
                    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {/* Hanger Strings */}
                  <line x1="90" y1="90" x2="55" y2="170" stroke="black" strokeWidth="3" />
                  <line x1="90" y1="90" x2="125" y2="170" stroke="black" strokeWidth="3" />
                  {/* Pan Plate */}
                  <rect x="45" y="170" width="90" height="8" rx="2" fill="#1e293b" stroke="black" strokeWidth="3" />
                  {/* Weight label tag */}
                  <g transform="translate(45, 184)">
                    <rect x="0" y="0" width="90" height="20" rx="4" fill="black" opacity="0.85" stroke="black" strokeWidth="2" />
                    <text x="45" y="14" fill="#fef08a" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      BEBAN: {jawaBebanPercent}%
                    </text>
                  </g>
                </g>

                {/* Right Hanging Pan (Sumatera) */}
                {/* Counter-rotates by -tiltAngle to stay horizontal */}
                <g
                  style={{
                    transform: `rotate(${-tiltAngle}deg)`,
                    transformOrigin: '410px 90px',
                    transition: 'transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                  }}
                >
                  {/* Hanger Strings */}
                  <line x1="410" y1="90" x2="375" y2="170" stroke="black" strokeWidth="3" />
                  <line x1="410" y1="90" x2="445" y2="170" stroke="black" strokeWidth="3" />
                  {/* Pan Plate */}
                  <rect x="365" y="170" width="90" height="8" rx="2" fill="#1e293b" stroke="black" strokeWidth="3" />
                  {/* Weight label tag */}
                  <g transform="translate(365, 184)">
                    <rect x="0" y="0" width="90" height="20" rx="4" fill="black" opacity="0.85" stroke="black" strokeWidth="2" />
                    <text x="45" y="14" fill="#2dd4bf" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      BEBAN: {sumateraBebanPercent}%
                    </text>
                  </g>
                </g>
              </svg>

              {/* Reset button inside screen */}
              {!isWin && (
                <button
                  onClick={handleReset}
                  className="absolute bottom-2 right-2 p-1.5 bg-black text-white text-[10px] font-mono-tech border border-black hover:bg-neutral-800 select-none cursor-pointer"
                >
                  RESET
                </button>
              )}
            </div>

            {/* Action Buttons to balance the scale */}
            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
              <button
                type="button"
                onClick={moveToJawa}
                disabled={isWin || isDelaying || sumateraStock === 0}
                className="flex-1 py-3 px-4 bg-orange-400 hover:bg-orange-300 active:translate-y-[2px] text-black font-extrabold uppercase text-xs sm:text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer text-center"
              >
                ← Pindahkan Ke Jawa
              </button>

              <button
                type="button"
                onClick={moveToSumatera}
                disabled={isWin || isDelaying || jawaStock === 0}
                className="flex-1 py-3 px-4 bg-teal-400 hover:bg-teal-300 active:translate-y-[2px] text-black font-extrabold uppercase text-xs sm:text-sm border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] disabled:opacity-50 disabled:cursor-not-allowed select-none cursor-pointer text-center"
              >
                Pindahkan Ke Sumatera →
              </button>
            </div>

            {/* Justice Index Progress Bar */}
            <div className="w-full max-w-md flex flex-col gap-2">
              <div className="flex justify-between items-center text-black text-sm font-bold font-mono-tech">
                <span>INDEX KEADILAN SOSIAL</span>
                <span className={isWin ? 'text-green-600 font-extrabold text-base' : ''}>
                  {indexKeadilan}%
                </span>
              </div>
              <div className="w-full h-8 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-start items-stretch overflow-hidden">
                <div 
                  className={`border-r-4 border-black transition-all duration-300 ${
                    isWin ? 'bg-green-500' : 'bg-teal-400'
                  }`}
                  style={{ width: `${indexKeadilan}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Right Column: Wilayah Kekurangan (Sumatera) */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col justify-start gap-2">
            <div className="self-stretch p-4 bg-purple-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-start items-center gap-2 text-center text-white">
              <span className="text-teal-400 text-base sm:text-lg font-black font-mono-tech uppercase">
                WILAYAH SUMATERA
              </span>
              <p className="text-purple-200 text-xs sm:text-sm font-semibold leading-relaxed">
                Logistik masih sangat minim ({sumateraStock} Unit). Alokasikan bantuan ke wilayah ini agar mencapai keseimbangan (6-6).
              </p>
            </div>

            {/* Grid of Sumatera logistics boxes */}
            <div className="self-stretch flex-1 min-h-64 p-4 bg-black/10 rounded-xl outline outline-4 outline-offset-[-4px] border border-black/10 outline-black/20 flex flex-wrap gap-2.5 items-start justify-center content-start overflow-y-auto max-h-[350px] lg:max-h-none">
              {sumateraStock === 0 && (
                <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center text-slate-500 font-mono-tech text-xs italic">
                  Tidak ada pasokan tersisa.
                </div>
              )}
              {Array.from({ length: sumateraStock }).map((_, idx) => (
                <div 
                  key={`sumatera-${idx}`} 
                  className="w-12 h-12 sm:w-14 sm:h-14 bg-teal-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-3 outline-offset-[-3px] outline-black border-2 border-black flex items-center justify-center select-none animate-fadeIn hover:bg-teal-300"
                >
                  <div className="w-5 h-5 border-2 border-black relative flex flex-col justify-between p-0.5 bg-teal-500">
                    <div className="h-0.5 bg-black w-full"></div>
                    <div className="h-1.5 border border-black w-2.5 mx-auto bg-teal-600"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom Bar: Verification Status */}
        <div className="w-full p-4 sm:p-6 bg-black/5 border-t-[5px] border-black flex flex-col items-center justify-center gap-3">
          {isWin ? (
            <div className="px-8 py-4 bg-green-500 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] inline-flex items-center gap-2 select-none">
              <span className="text-center text-black text-base sm:text-lg font-black uppercase tracking-widest leading-none">
                VERIFIKASI SILA 5 BERHASIL ✓
              </span>
              <CheckCircle2 className="w-6 h-6 text-black shrink-0" />
            </div>
          ) : (
            <div className="px-8 py-4 bg-red-500 text-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] inline-flex items-center gap-2 select-none opacity-80">
              <span className="text-center text-white text-base sm:text-lg font-black uppercase tracking-widest leading-none">
                VERIFIKASI SILA 5 (BELUM SEIMBANG)
              </span>
              <div className="w-5 h-5 bg-white border border-black animate-spin shrink-0"></div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
