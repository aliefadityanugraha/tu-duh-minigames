"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, CheckCircle2, Shield, AlertCircle, RefreshCw } from 'lucide-react';

/**
 * UrutanMufakat - Chronological Block Ordering Minigame Component
 * Implements Sila ke-4 (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan...)
 * 
 * Props:
 * - onGameComplete: function called when the game is won
 */
export default function UrutanMufakat({ onGameComplete }) {
  const CORRECT_ORDER = ["Masalah", "Diskusi", "Pendapat", "Keputusan", "Pelaksanaan"];

  const SLOT_DETAILS = [
    { label: "SLOT 1: IDENTIFIKASI", target: "Masalah" },
    { label: "SLOT 2: PERTUKARAN IDE", target: "Diskusi" },
    { label: "SLOT 3: PENYELARASAN", target: "Pendapat" },
    { label: "SLOT 4: KESEPAKATAN", target: "Keputusan" },
    { label: "SLOT 5: KOMITMEN", target: "Pelaksanaan" },
  ];

  // Block properties including styling
  const BLOCK_THEMES = {
    "Masalah": { bg: "bg-red-200", text: "text-red-800", label: "[ Masalah ]" },
    "Diskusi": { bg: "bg-teal-400", text: "text-teal-950", label: "[ Diskusi ]" },
    "Pendapat": { bg: "bg-red-300", text: "text-rose-950", label: "[ Pendapat ]" },
    "Keputusan": { bg: "bg-teal-500", text: "text-emerald-900", label: "[ Keputusan ]" },
    "Pelaksanaan": { bg: "bg-yellow-400", text: "text-yellow-900", label: "[ Pelaksanaan ]" }
  };

  const [blocks, setBlocks] = useState([]);
  const [isWin, setIsWin] = useState(false);

  // Shuffle function (Fisher-Yates)
  const shuffleArray = (array) => {
    const arr = [...array];
    // Keep shuffling until it does NOT match the correct order
    let isSame = true;
    while (isSame) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      isSame = arr.every((val, idx) => val === CORRECT_ORDER[idx]);
    }
    return arr;
  };

  // Initialize and shuffle blocks on mount
  useEffect(() => {
    setBlocks(shuffleArray(CORRECT_ORDER));
  }, []);

  // Swapping handler
  const handleSwap = (index, direction) => {
    if (isWin) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    // Swap elements
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);

    // Check Win condition
    const isCorrect = newBlocks.every((val, idx) => val === CORRECT_ORDER[idx]);
    if (isCorrect) {
      setIsWin(true);
      if (onGameComplete) {
        onGameComplete();
      }
    }
  };

  const handleManualCheck = () => {
    const isCorrect = blocks.every((val, idx) => val === CORRECT_ORDER[idx]);
    if (isCorrect) {
      setIsWin(true);
      if (onGameComplete) {
        onGameComplete();
      }
    } else {
      alert("Urutan musyawarah belum mufakat! Periksa kembali alur pengambilan keputusan.");
    }
  };

  const handleReset = () => {
    if (isWin) return;
    setBlocks(shuffleArray(CORRECT_ORDER));
  };

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-indigo-950 p-2 sm:p-4 md:p-6 lg:p-8 font-sans min-h-screen flex items-center justify-center">
      {/* Outer Console Board */}
      <div className="w-full bg-yellow-100 shadow-[12px_12px_0px_0px_rgba(0,0,0,1.00)] outline outline-[5px] outline-offset-[-5px] outline-black border-4 border-black relative overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header Bar */}
        <div className="w-full h-auto sm:h-24 bg-yellow-400 border-b-[5px] border-black flex flex-col sm:flex-row items-center sm:justify-between px-4 py-3 sm:py-0 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Scales badge */}
            <div className="w-12 h-12 bg-orange-200 rounded-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-center items-center shrink-0">
              <Shield className="w-7 h-7 text-black" />
            </div>
            {/* Title & Subtitle */}
            <div className="flex flex-col text-left">
              <h1 className="text-black text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight leading-none font-sans">
                KRONOLOGI MUSYAWARAH MUFAKAT
              </h1>
              <span className="text-black/70 text-[10px] sm:text-xs font-bold tracking-wider font-mono-tech mt-1">
                SILA 4: KERAKYATAN YANG DIPIMPIN OLEH HIKMAT KEBIJAKSANAAN...
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 sm:self-center shrink-0">
            {isWin ? (
              <div className="neo-badge bg-green-500 text-black border-black text-xs py-1 px-3 animate-bounce">
                🎉 MUFAKAT TERCAPAI
              </div>
            ) : (
              <div className="neo-badge bg-red-500 text-white border-black text-xs py-1 px-3">
                ⚖️ BERKONSENSUS
              </div>
            )}
          </div>
        </div>

        {/* Main Work Area */}
        <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center gap-6 w-full min-h-[500px]">
          
          {/* Instructions sticky card / Note */}
          <div className="w-full max-w-2xl bg-white p-4 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] relative origin-top rotate-[0.5deg] flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-black uppercase">PETUNJUK SILA KE-4</h3>
              <p className="text-xs sm:text-sm text-neutral-700 font-mono-tech mt-1 leading-relaxed">
                Urutkan tahapan musyawarah dari atas ke bawah agar mencapai mufakat. Gunakan tombol panah [▲] dan [▼] pada masing-masing balok.
              </p>
            </div>
            {!isWin && (
              <button 
                onClick={handleReset}
                className="ml-auto p-1 bg-black text-white hover:bg-neutral-800 flex items-center justify-center shrink-0 cursor-pointer"
                title="Acak Ulang Balok"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Slots & Blocks container */}
          <div className="w-full max-w-3xl p-4 sm:p-6 bg-slate-200/50 rounded-xl shadow-[inset_0px_2px_8px_rgba(0,0,0,0.1)] outline outline-4 outline-offset-[-4px] outline-black/30 flex flex-col gap-4">
            {blocks.map((blockName, index) => {
              const theme = BLOCK_THEMES[blockName];
              const slot = SLOT_DETAILS[index];
              const isCorrectPosition = blockName === slot.target;

              return (
                <div 
                  key={blockName}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 bg-white border-2 border-black rounded shadow-neo-sm transition-all duration-300"
                >
                  {/* Slot Target Label */}
                  <div className="flex flex-col text-left shrink-0">
                    <span className="text-[10px] text-gray-500 font-bold font-mono-tech tracking-wider uppercase">
                      TEMPAT TAHAPAN {index + 1}
                    </span>
                    <span className="text-sm font-extrabold text-black/60 font-mono-tech">
                      {slot.label}
                    </span>
                  </div>

                  {/* Connecting Arrow indicator for larger screens */}
                  <div className="hidden sm:block text-slate-400 font-mono-tech">──➔</div>

                  {/* Interactive Block */}
                  <div className={`flex-1 flex items-center justify-between px-4 py-3 rounded-lg outline outline-4 outline-offset-[-4px] outline-black/90 shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] transition-all duration-300 ${theme.bg}`}>
                    <span className={`text-base sm:text-lg font-black font-mono-tech tracking-wide ${theme.text}`}>
                      {theme.label}
                    </span>

                    {/* Swap Action controls */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleSwap(index, 'up')}
                        disabled={isWin || index === 0}
                        className="p-1.5 bg-black/85 text-white hover:bg-black rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:translate-y-[1px]"
                        title="Pindah Ke Atas"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSwap(index, 'down')}
                        disabled={isWin || index === blocks.length - 1}
                        className="p-1.5 bg-black/85 text-white hover:bg-black rounded disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:translate-y-[1px]"
                        title="Pindah Ke Bawah"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Position accuracy visual dot */}
                  <div className="shrink-0 flex items-center justify-center">
                    <span className={`w-4 h-4 rounded-full border-2 border-black ${
                      isCorrectPosition ? 'bg-green-500 shadow-sm' : 'bg-red-400 animate-pulse'
                    }`} title={isCorrectPosition ? "Posisi Benar" : "Posisi Salah"}></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Check button */}
          <div className="w-full max-w-xs pt-4 flex justify-center items-center">
            {isWin ? (
              <div className="w-full py-4 bg-green-500 text-black border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] flex justify-center items-center gap-2 font-black uppercase text-sm tracking-widest animate-bounce">
                <span>CONSENSUAL BERHASIL ✓</span>
                <CheckCircle2 className="w-5 h-5" />
              </div>
            ) : (
              <button
                type="button"
                onClick={handleManualCheck}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-300 active:translate-y-[2px] border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] flex justify-center items-center gap-2 font-black uppercase text-sm tracking-widest cursor-pointer transition-all"
              >
                <span>CEK MUFAKAT</span>
                <div className="w-5 h-2 bg-yellow-900 border border-black rounded-sm"></div>
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
