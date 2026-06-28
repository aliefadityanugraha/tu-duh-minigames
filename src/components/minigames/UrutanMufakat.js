"use client";

import React, { useState, useEffect } from 'react';
import { ArrowUp, ArrowDown, Users } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea,
  MinigameButton, MinigameWinBanner, SILA_LABELS,
} from './MinigameShell';

const SCENARIOS = [
  {
    id: "ketua_kelas",
    order: ["Pencalonan", "Kampanye", "Pemungutan", "Penghitungan", "Pelantikan"],
    slots: [
      { label: "1. KANDIDAT", target: "Pencalonan" },
      { label: "2. VISI MISI", target: "Kampanye" },
      { label: "3. VOTING", target: "Pemungutan" },
      { label: "4. REKAP SUARA", target: "Penghitungan" },
      { label: "5. PENGESAHAN", target: "Pelantikan" }
    ],
    themes: {
      "Pencalonan": { bg: "bg-blue-400", text: "text-black", label: "[ PENCALONAN ]" },
      "Kampanye": { bg: "bg-red-400", text: "text-black", label: "[ KAMPANYE ]" },
      "Pemungutan": { bg: "bg-teal-400", text: "text-black", label: "[ PEMUNGUTAN ]" },
      "Penghitungan": { bg: "bg-purple-400", text: "text-black", label: "[ PENGHITUNGAN ]" },
      "Pelantikan": { bg: "bg-yellow-400", text: "text-black", label: "[ PELANTIKAN ]" }
    }
  },
  {
    id: "kerja_bakti",
    order: ["Kumpul", "Diskusi", "BagiTugas", "Kerja", "Evaluasi"],
    slots: [
      { label: "1. UNDANGAN", target: "Kumpul" },
      { label: "2. BAHAS MASALAH", target: "Diskusi" },
      { label: "3. ALOKASI", target: "BagiTugas" },
      { label: "4. GOTONG ROYONG", target: "Kerja" },
      { label: "5. CEK HASIL", target: "Evaluasi" }
    ],
    themes: {
      "Kumpul": { bg: "bg-pink-400", text: "text-black", label: "[ KUMPUL WARGA ]" },
      "Diskusi": { bg: "bg-orange-400", text: "text-black", label: "[ DISKUSI ]" },
      "BagiTugas": { bg: "bg-indigo-400", text: "text-black", label: "[ BAGI TUGAS ]" },
      "Kerja": { bg: "bg-emerald-400", text: "text-black", label: "[ KERJA BAKTI ]" },
      "Evaluasi": { bg: "bg-yellow-400", text: "text-black", label: "[ EVALUASI ]" }
    }
  },
  {
    id: "musyawarah_umum",
    order: ["Masalah", "Diskusi", "Pendapat", "Keputusan", "Pelaksanaan"],
    slots: [
      { label: "1. IDENTIFIKASI", target: "Masalah" },
      { label: "2. DISKUSI BERSAMA", target: "Diskusi" },
      { label: "3. TAMPUNG PENDAPAT", target: "Pendapat" },
      { label: "4. KESEPAKATAN", target: "Keputusan" },
      { label: "5. LAKSANAKAN", target: "Pelaksanaan" },
    ],
    themes: {
      "Masalah": { bg: "bg-red-400", text: "text-black", label: "[ MASALAH ]" },
      "Diskusi": { bg: "bg-teal-400", text: "text-black", label: "[ DISKUSI ]" },
      "Pendapat": { bg: "bg-pink-400", text: "text-black", label: "[ PENDAPAT ]" },
      "Keputusan": { bg: "bg-emerald-400", text: "text-black", label: "[ KEPUTUSAN ]" },
      "Pelaksanaan": { bg: "bg-yellow-400", text: "text-black", label: "[ PELAKSANAAN ]" }
    }
  }
];

/**
 * UrutanMufakat - Chronological Block Ordering Minigame Component
 * Implements Sila ke-4 (Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan...)
 */
export default function UrutanMufakat({ onGameComplete, onComplete, isProvokator }) {
  const [scenario, setScenario] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [isWin, setIsWin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isMounted, setIsMounted] = useState(false);
  
  const completedRef = React.useRef(false);
  const onCompleteRef = React.useRef(onComplete);

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

  // Shuffle function (Fisher-Yates)
  const shuffleArray = (array, correctOrder) => {
    const arr = [...array];
    let isSame = true;
    let attempts = 0;
    while (isSame && attempts < 100) {
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      isSame = arr.every((val, idx) => val === correctOrder[idx]);
      attempts++;
    }
    return arr;
  };

  // Initialize and shuffle blocks on mount
  useEffect(() => {
    const randomScenario = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
    setScenario(randomScenario);
    setBlocks(shuffleArray(randomScenario.order, randomScenario.order));
    setIsMounted(true);
  }, []);

  // Swapping handler
  const handleSwap = (index, direction) => {
    if (isWin || !scenario) return;
    setErrorMsg('');
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= blocks.length) return;

    const newBlocks = [...blocks];
    [newBlocks[index], newBlocks[targetIndex]] = [newBlocks[targetIndex], newBlocks[index]];
    setBlocks(newBlocks);

    // Auto-check Win condition on every move
    const isCorrect = newBlocks.every((val, idx) => val === scenario.order[idx]);
    if (isCorrect) {
      setIsWin(true);
    }
  };

  const handleManualCheck = () => {
    if (!scenario) return;
    const isCorrect = blocks.every((val, idx) => val === scenario.order[idx]);
    if (isCorrect) {
      setIsWin(true);
      setErrorMsg('');
    } else {
      setErrorMsg("URUTAN BELUM TEPAT! COBA LAGI.");
      // Auto clear error after 3 seconds
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleReset = () => {
    if (isWin || !scenario) return;
    setBlocks(shuffleArray(scenario.order, scenario.order));
    setErrorMsg('');
  };

  if (!isMounted || !scenario) return null;

  return (
    <MinigameRoot>
      <MinigameHeader
        icon={Users}
        iconBg="bg-red-500"
        title="Musyawarah Mufakat"
        sila={SILA_LABELS[4]}
        statusVariant={isWin ? 'win' : 'playing'}
        statusLabel={isWin ? '🎉 MUFAKAT' : '⚖️ URUTKAN'}
      />

      <MinigameWorkArea className="justify-start overflow-hidden !p-0 sm:!p-0 flex flex-col relative bg-emerald-50">
        
        {/* Compact Hint Box */}
        <div className="w-full bg-yellow-100 border-b-[3px] border-black p-1 sm:p-2.5 px-1.5 sm:px-3 flex items-center justify-center shrink-0 z-20 shadow-[0_2px_0_0_rgba(0,0,0,1)] relative">
           <span className="text-[7.5px] sm:text-[11px] font-black uppercase text-black text-center tracking-wide leading-tight">
             💡 Urutkan tahapan musyawarah dari atas ke bawah menggunakan panah.
           </span>
        </div>

        <div className="relative w-full flex-1 min-h-0 px-2 py-2 sm:px-6 sm:py-4 flex flex-col justify-center items-center z-10 max-w-3xl md:max-w-4xl mx-auto">
          
        <div className="w-full h-full max-h-[800px] md:max-h-[550px] flex flex-col justify-evenly gap-1 sm:gap-2">
            {blocks.map((blockName, index) => {
              const theme = scenario.themes[blockName];
              const slot = scenario.slots[index];
              const isCorrectPosition = blockName === slot.target;

              return (
                <div 
                  key={blockName}
                  className="flex flex-row items-center justify-between gap-1 sm:gap-3 md:gap-2 p-1.5 sm:p-2.5 md:p-2 bg-white border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-300 w-full"
                >
                  {/* Slot Target Label */}
                  <div className="flex flex-col text-left shrink-0 w-20 sm:w-32 md:w-36 overflow-hidden">
                    <span className="text-[8px] sm:text-[10px] md:text-[10px] text-gray-600 font-bold font-mono-tech tracking-wider uppercase">
                      LANGKAH {index + 1}
                    </span>
                    <span className="text-[9px] sm:text-xs md:text-xs lg:text-sm font-black text-black font-mono-tech leading-tight truncate">
                      {slot.label}
                    </span>
                  </div>

                  {/* Connecting Arrow indicator */}
                  <div className="shrink-0 text-black font-mono-tech font-black text-[10px] sm:text-sm md:text-base hidden sm:block">
                    ➔
                  </div>

                  {/* Interactive Block */}
                  <div className={`flex-1 flex items-center justify-between px-2 py-1.5 sm:px-4 sm:py-2.5 md:py-2 md:px-3 border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${theme.bg}`}>
                    <span className={`text-[9px] sm:text-xs md:text-xs lg:text-sm font-black font-mono-tech tracking-wide truncate ${theme.text}`}>
                      {theme.label}
                    </span>

                    {/* Swap Action controls */}
                    {!isWin && (
                      <div className="flex items-center gap-1 sm:gap-2 shrink-0 ml-1">
                        <button
                          type="button"
                          onClick={() => handleSwap(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 sm:p-1.5 md:p-1.5 bg-black text-white border-2 border-black hover:bg-neutral-800 disabled:opacity-40 disabled:bg-neutral-500 disabled:cursor-not-allowed active:translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] transition-all"
                          title="Naik"
                        >
                          <ArrowUp className="w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleSwap(index, 'down')}
                          disabled={index === blocks.length - 1}
                          className="p-1.5 sm:p-1.5 md:p-1.5 bg-black text-white border-2 border-black hover:bg-neutral-800 disabled:opacity-40 disabled:bg-neutral-500 disabled:cursor-not-allowed active:translate-y-[1px] shadow-[1px_1px_0px_0px_rgba(255,255,255,0.5)] transition-all"
                          title="Turun"
                        >
                          <ArrowDown className="w-4 h-4 sm:w-4 sm:h-4 md:w-4 md:h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Position accuracy visual dot */}
                  <div className="shrink-0 flex items-center justify-center pl-1 sm:pl-2 md:pl-2">
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 md:w-5 md:h-5 rounded-full border-[3px] border-black flex items-center justify-center ${
                      isCorrectPosition ? 'bg-green-500 shadow-sm' : 'bg-red-500 animate-pulse'
                    }`} title={isCorrectPosition ? "Benar" : "Salah"}>
                      {isCorrectPosition && <div className="w-2 h-2 md:w-2 md:h-2 bg-white rounded-full"></div>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* BOTTOM CONTROLS */}
        <div className="flex flex-col w-full mx-auto mt-auto p-2 sm:p-2.5 shrink-0 bg-white border-t-[3px] border-black z-20">
          
          {/* Zero-height wrapper for error message so buttons NEVER shift and it consumes 0 space */}
          <div className="relative w-full h-0 flex justify-center">
            {errorMsg && !isWin && (
              <div className="absolute bottom-1 sm:bottom-2 w-full max-w-[200px] sm:max-w-xs bg-red-100 border-[3px] border-red-500 text-red-700 text-[9px] sm:text-[10px] font-black font-mono-tech uppercase text-center py-1 animate-shake shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] z-30">
                {errorMsg}
              </div>
            )}
          </div>

          <div className="flex gap-2 sm:gap-3">
            {isWin ? (
              <MinigameWinBanner win winMessage={isProvokator ? "Sabotase berhasil! Menunggu konfirmasi..." : "Mufakat tercapai! Menunggu konfirmasi misi..."} />
            ) : (
              <>
                <MinigameButton
                  variant="ghost"
                  onClick={handleReset}
                  className="w-1/3 py-2 sm:py-2.5 text-[10px] sm:text-[11px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all bg-gray-100"
                >
                  ACAK LAGI
                </MinigameButton>
                <MinigameButton
                  variant="primary"
                  onClick={handleManualCheck}
                  className="flex-1 py-2 sm:py-2.5 text-[10px] sm:text-[11px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] transition-all bg-yellow-400 text-black border-[3px] border-black font-black"
                >
                  CEK MUFAKAT
                </MinigameButton>
              </>
            )}
          </div>
        </div>

      </MinigameWorkArea>
    </MinigameRoot>
  );
}
