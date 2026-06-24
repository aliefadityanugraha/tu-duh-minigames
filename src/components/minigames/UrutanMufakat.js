"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Shield } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea, MinigameHint,
  MinigameButton, MinigameWinBanner, MinigameFooter, SILA_LABELS,
} from './MinigameShell';

/**
 * UrutanMufakat - Chronological Block Ordering Minigame Component
 * Implements Sila ke-4 (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan...)
 * 
 * Props:
 * - onComplete: ({ success }) => void — standar TaskContainer
 * - onGameComplete: legacy debug callback
 * - compact: true = mode Mission Book panel
 */
export default function UrutanMufakat({ onGameComplete, onComplete, compact = false }) {
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
  const [errorMsg, setErrorMsg] = useState('');

  // Shuffle function (Fisher-Yates)
  const shuffleArray = (array) => {
    const arr = [...array];
    // Keep shuffling until it does NOT match the correct order (safety limit: 100 attempts)
    let isSame = true;
    let attempts = 0;
    while (isSame && attempts < 100) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      isSame = arr.every((val, idx) => val === CORRECT_ORDER[idx]);
      attempts++;
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
    setErrorMsg('');
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
      fireTaskComplete(onComplete, onGameComplete);
    }
  };

  const handleManualCheck = () => {
    const isCorrect = blocks.every((val, idx) => val === CORRECT_ORDER[idx]);
    if (isCorrect) {
      setIsWin(true);
      setErrorMsg('');
      fireTaskComplete(onComplete, onGameComplete);
    } else {
      setErrorMsg("Urutan musyawarah belum mufakat! Periksa kembali alur pengambilan keputusan.");
    }
  };

  const handleReset = () => {
    if (isWin) return;
    setBlocks(shuffleArray(CORRECT_ORDER));
  };

  return (
    <MinigameRoot compact={compact}>
      <MinigameHeader
        compact={compact}
        icon={Shield}
        iconBg="bg-orange-200"
        title="Urutan Musyawarah Mufakat"
        sila={SILA_LABELS[4]}
        statusVariant={isWin ? 'win' : 'playing'}
        statusLabel={isWin ? '🎉 MUFAKAT' : '⚖️ URUTKAN'}
      />

      <MinigameWorkArea compact={compact}>
        <MinigameHint title="Petunjuk Sila ke-4">
          Urutkan tahapan musyawarah dari atas ke bawah. Gunakan tombol ▲ dan ▼ pada setiap balok.
        </MinigameHint>
          <div className="w-full p-3 sm:p-4 bg-slate-100 border-4 border-black flex flex-col gap-2 sm:gap-3">
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

          <div className="w-full max-w-md mx-auto pt-1">
            {errorMsg && !isWin && (
              <div className="mb-2 p-2.5 bg-red-100 border-2 border-red-400 rounded text-red-700 text-xs font-mono font-bold text-center animate-fadeIn">
                {errorMsg}
              </div>
            )}
            {isWin ? (
              <MinigameWinBanner win winMessage="Mufakat tercapai! Menunggu konfirmasi misi..." />
            ) : (
              <MinigameButton variant="secondary" onClick={handleManualCheck} className="w-full py-2.5 sm:py-3 text-xs sm:text-sm">
                CEK MUFAKAT
              </MinigameButton>
            )}
          </div>
      </MinigameWorkArea>

      <MinigameFooter compact={compact} onReset={handleReset} resetLabel="ACAK ULANG" showReset={!isWin} disabled={isWin} />
    </MinigameRoot>
  );
}
