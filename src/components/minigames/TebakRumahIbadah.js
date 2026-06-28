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

export default function TebakRumahIbadah({ onGameComplete, onComplete, isProvokator }) {
  const [mounted, setMounted] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const [randomTrigger, setRandomTrigger] = useState(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

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

  useEffect(() => {
    if (isWin && !completedRef.current) {
      completedRef.current = true;
      fireTaskComplete(onCompleteRef.current, onGameComplete);
    }
  }, [isWin, onGameComplete]);

  const answerOptions = useMemo(() => {
    const uniqueIds = [...new Set(TEMPAT_IBADAH_POOL.map(p => p.correctAnswerId))];
    return uniqueIds.sort(() => Math.random() - 0.5);
  }, [question]);

  const handleGuess = () => {
    if (isWin || completedRef.current || !selectedGuess) return;

    if (selectedGuess === question.correctAnswerId) {
      setIsWin(true);
      setIsWrongGuess(false);
    } else {
      setIsWrongGuess(true);
      setTimeout(() => {
        setIsWrongGuess(false);
      }, 2000);
    }
  };

  const statusVariant = isWin ? 'win' : 'playing';
  const statusLabel = isWin ? '✅ SELESAI' : '🔍 TEBAK GAMBAR';

  if (!mounted) {
    return (
      <MinigameRoot>
        <MinigameHeader
          icon={Star}
          iconBg="bg-green-500"
          title="Tebak Rumah Ibadah"
          sila={SILA_LABELS[1]}
          statusVariant="playing"
          statusLabel="🔍 TEBAK GAMBAR"
        />
        <MinigameWorkArea className="flex-1 flex flex-col h-full bg-slate-50">
          <div className="flex flex-col items-center justify-center p-12 bg-white border-[3px] sm:border-4 border-black min-h-[300px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-5xl mx-auto w-full flex-1">
            <Loader2 className="w-8 h-8 text-black animate-spin mb-3" />
            <span className="font-mono text-xs text-black font-bold uppercase tracking-wider animate-pulse">Mempersiapkan Game...</span>
          </div>
        </MinigameWorkArea>
      </MinigameRoot>
    );
  }

  return (
    <MinigameRoot>
      <MinigameHeader
        icon={Star}
        iconBg="bg-green-500"
        title="Tebak Rumah Ibadah"
        sila={SILA_LABELS[1]}
        statusVariant={statusVariant}
        statusLabel={statusLabel}
      />

      <MinigameWorkArea className="flex flex-col !p-2 sm:!p-4 overflow-y-auto overflow-x-hidden md:overflow-hidden bg-slate-50 relative justify-start md:justify-between">

        {/* Kontainer utama grid kiri kanan dengan batas h-full */}
        <div className="flex-1 w-full max-w-5xl mx-auto flex flex-col md:flex-row items-stretch justify-start md:justify-between gap-2 md:gap-4 lg:gap-6 z-10 relative md:min-h-0">

          {/* KOLOM KIRI (GAMBAR & PETUNJUK) */}
          <div className="w-full md:w-1/2 flex flex-col min-h-0 shrink-0 md:shrink">
            <MinigameSection label="GAMBAR RUMAH IBADAH" className="h-full flex flex-col min-h-0">
              <div className="flex flex-col h-full gap-2 min-h-0">
                <div className="w-full h-[140px] sm:h-[200px] md:h-auto md:flex-1 md:min-h-[250px] shrink-0 border-[3px] border-black p-1 bg-black flex items-center justify-center shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] relative">
                  <WorshipImage
                    type={question.correctAnswerId}
                    imgUrl={question.img}
                    className={`absolute inset-0 w-full h-full transition-all duration-1000 ease-in-out ${isWin ? 'blur-none scale-100' : 'blur-[2px] scale-105'}`}
                  />
                </div>
                {/* Teks petunjuk */}
                <div className="shrink-0 bg-yellow-100 border-[3px] border-black p-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <span className="font-mono font-black text-[9px] sm:text-xs uppercase text-black leading-tight text-center">
                    💡 PETUNJUK: {question.hint}
                  </span>
                </div>
              </div>
            </MinigameSection>
          </div>

          {/* KOLOM KANAN (VALIDASI JAWABAN) */}
          <div className="w-full md:w-1/2 flex flex-col min-h-0 shrink-0 md:shrink mt-2 md:mt-0 pb-1 md:pb-0">
            <MinigameSection label="VALIDASI JAWABAN" className="h-full flex flex-col min-h-0">
              <div className="flex flex-col w-full h-full justify-between gap-2 min-h-0 relative">
                {isWrongGuess && (
                  <div className="absolute -top-3 left-0 right-0 mx-auto w-max max-w-[90%] bg-red-100 border-[3px] border-red-500 text-red-700 text-[10px] sm:text-xs font-black font-mono-tech uppercase text-center py-1 sm:py-1.5 px-4 animate-shake shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] z-20 shrink-0">
                    ❌ Belum tepat — coba lagi!
                  </div>
                )}

                {isWin ? (
                  <div className="flex-1 flex items-center justify-center min-h-0">
                    <MinigameWinBanner win winMessage={isProvokator ? "Sabotase berhasil! Menunggu konfirmasi..." : `Benar! Gambar di atas adalah ${question.name}.`} />
                  </div>
                ) : (
                  <div className="flex flex-col gap-2 flex-1 justify-between min-h-0">
                    <div className="flex flex-col gap-2 flex-1 min-h-0 justify-center">
                      <span className="text-black text-[9px] sm:text-xs font-black uppercase tracking-wider block text-center shrink-0">
                        PILIH JAWABAN YANG TEPAT:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5 sm:gap-2 overflow-visible py-1 px-1">
                        {answerOptions.map((optionId) => (
                          <button
                            key={optionId}
                            onClick={() => setSelectedGuess(optionId)}
                            disabled={isWin}
                            className={`w-full py-2 sm:py-2.5 font-mono font-black text-[8px] sm:text-xs lg:text-sm uppercase border-[3px] border-black transition-all flex items-center justify-center gap-1 sm:gap-2 text-black ${selectedGuess === optionId
                                ? 'bg-yellow-400 shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] translate-y-[2px]'
                                : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'
                              }`}
                          >
                            {optionId.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Tombol submit dipaksa ke paling bawah */}
                    <div className="flex gap-2 w-full mt-2 shrink-0 pb-1 px-1">
                      <button
                        onClick={handleGuess}
                        disabled={!selectedGuess}
                        className={`w-full py-2.5 sm:py-3 font-mono font-black text-[10px] sm:text-xs lg:text-sm uppercase border-[3px] border-black transition-all flex items-center justify-center gap-1 sm:gap-2 text-black ${!selectedGuess
                            ? 'opacity-50 cursor-not-allowed shadow-none bg-gray-300'
                            : 'bg-green-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'
                          }`}
                      >
                        SUBMIT JAWABAN
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </MinigameSection>
          </div>

        </div>
      </MinigameWorkArea>
    </MinigameRoot>
  );
}