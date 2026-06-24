"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Star, RotateCcw, Loader2 } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea, MinigameSection,
  MinigameHint, MinigameButton, MinigameWinBanner, SILA_LABELS,
} from './MinigameShell';

// Helper wrapper component for rendering custom images with fallback when not loaded
function WorshipImage({ type, imgUrl, className = '' }) {
  const [hasError, setHasError] = useState(false);

  if (hasError || !imgUrl) {
    const emojis = {
      masjid: '🕌',
      gereja: '⛪',
      pura: '🛕',
      vihara: '🛕',
      klenteng: '⛩️',
    };
    return (
      <div className="w-full h-full bg-neutral-800 flex flex-col items-center justify-center text-neutral-400 p-4 border border-white/10 select-none">
        <span className="text-3xl sm:text-5xl mb-2 animate-pulse">{emojis[type] || '📍'}</span>
        <p className="text-[9px] sm:text-xs font-mono font-black uppercase tracking-wider text-yellow-500">
          Gambar Gagal Dimuat
        </p>
      </div>
    );
  }

  return (
    <img
      src={imgUrl}
      alt={type}
      /* PERBAIKAN 1: object-contain memastikan gambar tidak melar/pecah di layar besar desktop */
      className={`${className} w-full h-full object-contain bg-black`}
      onError={() => setHasError(true)}
    />
  );
}

const TEMPAT_IBADAH_POOL = [
  {
    id: 'soal_masjid_1',
    name: 'Masjid',
    correctAnswerId: 'masjid',
    img: '/images/places/masjid.png',
    hint: 'Sila ke-1: Ketuhanan Yang Maha Esa. Rumah ibadah ini bercirikan kubah besar, menara tinggi.',
  },
  {
    id: 'soal_gereja_1',
    name: 'Gereja',
    correctAnswerId: 'gereja',
    img: '/images/places/gereja.png',
    hint: 'Sila ke-1: Ketuhanan Yang Maha Esa. Rumah ibadah ini bercirikan gedung dengan lambang salib.',
  },
  {
    id: 'soal_pura_1',
    name: 'Pura',
    correctAnswerId: 'pura',
    img: '/images/places/pura.png',
    hint: 'Sila ke-1: Ketuhanan Yang Maha Esa. Rumah ibadah ini bercirikan gapura split (Candi Bentar).',
  },
  {
    id: 'soal_vihara_1',
    name: 'Vihara',
    correctAnswerId: 'vihara',
    img: '/images/places/vihara.png',
    hint: 'Sila ke-1: Ketuhanan Yang Maha Esa. Rumah ibadah ini bercirikan pagoda dengan atap merah.',
  },
  {
    id: 'soal_klenteng_1',
    name: 'Klenteng',
    correctAnswerId: 'klenteng',
    img: '/images/places/klenteng.png',
    hint: 'Sila ke-1: Ketuhanan Yang Maha Esa. Didominasi warna merah, pilar naga, dan dupa.',
  },
];

export default function TebakRumahIbadah({ onGameComplete, onComplete, compact = false }) {
  const [mounted, setMounted] = useState(false);
  const completedRef = useRef(false);
  const [randomTrigger, setRandomTrigger] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const question = useMemo(() => {
    const pick = TEMPAT_IBADAH_POOL[Math.floor(Math.random() * TEMPAT_IBADAH_POOL.length)];
    return pick;
  }, [randomTrigger]);

  const [isWin, setIsWin] = useState(false);
  const [selectedGuess, setSelectedGuess] = useState(null);
  const [isWrongGuess, setIsWrongGuess] = useState(false);

  useEffect(() => {
    setSelectedGuess(null);
    setIsWrongGuess(false);
    setIsWin(false);
    completedRef.current = false;
  }, [question]);

  const answerOptions = useMemo(() => {
    const uniqueIds = [...new Set(TEMPAT_IBADAH_POOL.map(p => p.correctAnswerId))];
    return uniqueIds.sort(() => Math.random() - 0.5);
  }, [question]);

  const handleGuess = () => {
    if (isWin || completedRef.current || !selectedGuess) return;

    if (selectedGuess === question.correctAnswerId) {
      completedRef.current = true;
      setIsWin(true);
      setIsWrongGuess(false);
      setTimeout(() => {
        fireTaskComplete(onComplete, onGameComplete);
      }, 1500);
    } else {
      setIsWrongGuess(true);
      setTimeout(() => {
        setIsWrongGuess(false);
      }, 2000);
    }
  };

  const outerClass = compact
    ? "w-full flex flex-col h-full"
    : "w-full h-full flex flex-col bg-transparent";

  const boardClass = compact
    ? "w-full bg-yellow-100 border-2 border-black flex flex-col overflow-hidden h-full"
    : "w-full h-full max-w-5xl mx-auto bg-yellow-100 shadow-[4px_4px_0px_rgba(0,0,0,1)] border-4 border-black relative overflow-hidden flex flex-col transition-all duration-300";

  const statusVariant = isWin ? 'win' : 'playing';
  const statusLabel = isWin ? '✅ SELESAI' : '🔍 TEBAK GAMBAR';

  if (!mounted) {
    return (
      <div className={outerClass}>
        <div className={boardClass}>
          <MinigameHeader
            compact={compact}
            icon={Star}
            iconBg="bg-yellow-500"
            title="Tebak Rumah Ibadah - Sila 1"
            sila={SILA_LABELS[1]}
            statusVariant="playing"
            statusLabel="🔍 TEBAK GAMBAR"
          />
          <MinigameWorkArea compact={compact} className="flex-1 flex flex-col h-full">
            <div className="flex flex-col items-center justify-center p-12 bg-white border-4 border-black min-h-[300px] shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-5xl mx-auto w-full flex-1">
              <Loader2 className="w-8 h-8 text-black animate-spin mb-3" />
              <span className="font-mono text-xs text-black font-bold uppercase tracking-wider animate-pulse">Mempersiapkan Game...</span>
            </div>
          </MinigameWorkArea>
        </div>
      </div>
    );
  }

  return (
    <div className={outerClass}>
      <div className={boardClass}>
        <MinigameHeader
          compact={compact}
          icon={Star}
          iconBg="bg-yellow-500"
          title="Tebak Rumah Ibadah - Sila 1"
          sila={SILA_LABELS[1]}
          statusVariant={statusVariant}
          statusLabel={statusLabel}
        />

        <MinigameWorkArea compact={compact} className="flex-1 flex flex-col min-h-0">

          {/* Grid selalu 2 kolom (kiri-kanan) dan ditarik sama tinggi dengan items-stretch */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-6 items-start md:items-stretch w-full max-w-5xl mx-auto flex-1 min-h-0">

            {/* ========================================== */}
            {/* PERBAIKAN 2: KOLOM KIRI (GAMBAR & PETUNJUK) */}
            {/* CSS Ajaib [&>div...] ini memaksa kotak putih MinigameSection memanjang ke bawah! */}
            {/* ========================================== */}
            <div className="flex flex-col md:[&>div]:h-full md:[&>div]:flex md:[&>div]:flex-col md:[&>div>div:last-child]:flex-1 md:[&>div>div:last-child]:flex md:[&>div>div:last-child]:flex-col">
              <MinigameSection label="GAMBAR RUMAH IBADAH">
                <div className="flex flex-col">
                  <div className="w-full border-2 sm:border-4 border-black p-1 sm:p-2 bg-black flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                    <div className="relative w-full aspect-[16/10] bg-black border border-white/20 overflow-hidden flex items-center justify-center">
                      <WorshipImage
                        type={question.correctAnswerId}
                        imgUrl={question.img}
                        className={`transition-all duration-1000 ease-in-out ${isWin ? 'blur-none scale-100' : 'blur-[6px] scale-105'}`} />
                    </div>

                  </div>
                  {/* Teks petunjuk */}
                  <div className="mt-2 sm:mt-4">
                    <MinigameHint className="text-[9px] sm:text-xs leading-tight p-0 sm:p-1.5">{question.hint}</MinigameHint>
                  </div>
                </div>
              </MinigameSection>
            </div>

            {/* ========================================== */}
            {/* KOLOM KANAN (VALIDASI JAWABAN) */}
            {/* CSS Ajaib [&>div...] juga ditaruh di sini agar seimbang tingginya */}
            {/* ========================================== */}
            <div className="flex flex-col md:[&>div]:h-full md:[&>div]:flex md:[&>div]:flex-col md:[&>div>div:last-child]:flex-1 md:[&>div>div:last-child]:flex md:[&>div>div:last-child]:flex-col">
              <MinigameSection label="VALIDASI JAWABAN">
                <div className="flex flex-col w-full flex-1 justify-between">
                  {isWrongGuess && (
                    <p className="text-red-700 font-mono text-[10px] sm:text-sm font-bold text-center mb-2 animate-pulse shrink-0">
                      ❌ Salah, coba lagi!
                    </p>
                  )}

                  {isWin ? (
                    <div className="flex-1 flex items-center justify-center">
                      <MinigameWinBanner win winMessage={`Benar!`} />
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 flex-1 justify-between">
                      <div className="flex flex-col gap-2 sm:gap-4 mt-1 sm:mt-2">
                        <span className="text-black text-[9px] sm:text-xs font-black uppercase tracking-wider block text-center">
                          PILIH JAWABAN YANG BENAR:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 sm:gap-2.5">
                          {answerOptions.map((optionId) => (
                            <MinigameButton
                              key={optionId}
                              variant={selectedGuess === optionId ? "secondary" : "ghost"}
                              onClick={() => setSelectedGuess(optionId)}
                              disabled={isWin}
                              className="w-full py-2 sm:py-3 text-[9px] sm:text-xs font-black truncate shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                            >
                              {optionId.toUpperCase()}
                            </MinigameButton>
                          ))}
                        </div>
                      </div>

                      {/* Tombol submit dipaksa ke paling bawah dengan mt-auto */}
                      <div className="flex gap-2 w-full mt-auto pt-2 shrink-0">
                        <MinigameButton
                          variant="primary"
                          onClick={handleGuess}
                          disabled={!selectedGuess}
                          className="flex-grow py-2.5 sm:py-3.5 text-[10px] sm:text-sm font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all"
                        >
                          SUBMIT JAWABAN
                        </MinigameButton>
                      </div>
                    </div>
                  )}
                </div>
              </MinigameSection>
            </div>

          </div>
        </MinigameWorkArea>
      </div>
    </div>
  );
}