"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Scale } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea, MinigameProgress,
  MinigameButton, MinigameWinBanner, MinigameInlineStatus, SILA_LABELS,
} from './MinigameShell';

const TARGET_EACH = 6;

/**
 * TimbanganKeadilan - Scale Balancing Minigame (Sila 5)
 */
export default function TimbanganKeadilan({ onGameComplete, onComplete, compact = false }) {
  const [jawaStock, setJawaStock] = useState(10);
  const [sumateraStock, setSumateraStock] = useState(2);
  const [isWin, setIsWin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const totalStock = jawaStock + sumateraStock;
  const difference = Math.abs(jawaStock - sumateraStock);
  const isBalanced = jawaStock === TARGET_EACH && sumateraStock === TARGET_EACH;

  // Progress menuju target 6-6 (bukan sekadar sama banyak)
  const jawaProgress = Math.max(0, 1 - Math.abs(jawaStock - TARGET_EACH) / 4);
  const sumateraProgress = Math.max(0, 1 - Math.abs(sumateraStock - TARGET_EACH) / 4);
  const indexKeadilan = Math.round(((jawaProgress + sumateraProgress) / 2) * 100);

  const jawaBebanPercent = totalStock > 0 ? Math.round((jawaStock / totalStock) * 100) : 50;
  const sumateraBebanPercent = totalStock > 0 ? Math.round((sumateraStock / totalStock) * 100) : 50;
  const tiltAngle = (jawaStock - sumateraStock) * 5;

  // Win: tunggu 1 detik saat 6-6 — jangan pakai state isDelaying di deps (bunuh timer)
  useEffect(() => {
    if (!isBalanced || isWin || completedRef.current) {
      if (!isBalanced) setIsSyncing(false);
      return;
    }

    setIsSyncing(true);
    const timer = setTimeout(() => {
      if (completedRef.current) return;
      completedRef.current = true;
      setIsWin(true);
      setIsSyncing(false);
      fireTaskComplete(onCompleteRef.current, onGameComplete);
    }, 1000);

    return () => clearTimeout(timer);
  }, [jawaStock, sumateraStock, isBalanced, isWin, onGameComplete]);

  const moveToSumatera = () => {
    if (isWin || isSyncing) return;
    if (jawaStock > 0) {
      setJawaStock((prev) => prev - 1);
      setSumateraStock((prev) => prev + 1);
    }
  };

  const moveToJawa = () => {
    if (isWin || isSyncing) return;
    if (sumateraStock > 0) {
      setSumateraStock((prev) => prev - 1);
      setJawaStock((prev) => prev + 1);
    }
  };

  const handleReset = () => {
    if (isWin) return;
    setJawaStock(10);
    setSumateraStock(2);
    setIsSyncing(false);
    completedRef.current = false;
  };

  const statusLabel = isWin
    ? 'MERATA & SEIMBANG'
    : isSyncing
    ? 'MENYINKRONKAN...'
    : difference === 0
    ? `TARGET: ${TARGET_EACH}-${TARGET_EACH} UNIT`
    : 'BELUM MERATA';

  const RegionPanel = ({ region, stock, color, hint, boxes }) => (
    <div className="flex flex-col gap-2 min-w-0 h-full">
      <div className="p-2 sm:p-3 bg-purple-950 border-4 border-black text-center text-white">
        <span className={`text-xs sm:text-sm font-black font-mono-tech uppercase ${color}`}>{region}</span>
        <p className="text-purple-200 text-[9px] sm:text-[10px] font-semibold leading-relaxed mt-1">{hint(stock)}</p>
      </div>
      <div className="flex-1 min-h-[88px] sm:min-h-[100px] p-2 sm:p-3 bg-black/10 border-4 border-black/20 flex flex-wrap gap-1.5 items-start justify-center content-start">
        {stock === 0 ? (
          <span className="text-slate-500 font-mono-tech text-xs italic p-4">Kosong</span>
        ) : (
          boxes(stock)
        )}
      </div>
    </div>
  );

  const headerStatus = isWin ? 'win' : isSyncing ? 'syncing' : isBalanced ? 'syncing' : 'playing';
  const headerLabel = isWin ? '🎉 SELESAI' : isSyncing ? '⏳ SYNC' : isBalanced ? '⚖️ SYNC' : '⚖️ MAIN';

  return (
    <MinigameRoot compact={compact}>
      <MinigameHeader
        compact={compact}
        icon={Scale}
        iconBg="bg-orange-200"
        title="Timbangan Keadilan Sosial"
        sila={SILA_LABELS[5]}
        statusVariant={headerStatus}
        statusLabel={headerLabel}
      />

      <MinigameWorkArea compact={compact}>
          {/* Satu baris: Jawa | Timbangan | Sumatera */}
          <div className="flex flex-row items-stretch gap-1.5 sm:gap-3 w-full">
            <div className="w-[28%] sm:w-[30%] shrink-0 min-w-0">
              <RegionPanel
                region="Wilayah Jawa"
                stock={jawaStock}
                color="text-orange-200"
                hint={(n) => `${n} unit logistik. Target: ${TARGET_EACH} unit.`}
                boxes={(n) => Array.from({ length: n }).map((_, idx) => (
                  <div key={`j-${idx}`} className="w-8 h-8 sm:w-9 sm:h-9 bg-yellow-400 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center">
                    <div className="w-3 h-3 border border-black bg-yellow-500" />
                  </div>
                ))}
              />
            </div>

            <div className="flex-1 flex flex-col items-center justify-center gap-2 min-w-0">
              <MinigameInlineStatus
                label={`STATUS: ${statusLabel}`}
                variant={isWin ? 'win' : isSyncing ? 'syncing' : 'playing'}
              />

              <div className="relative w-full h-36 sm:h-44 md:h-48 border-4 border-dashed border-black/20 rounded-xl flex items-center justify-center bg-white/5">
                <svg className="w-full h-full" viewBox="0 0 500 280" aria-hidden>
                  <line x1="250" y1="90" x2="250" y2="240" stroke="black" strokeWidth="10" strokeLinecap="round" />
                  <path d="M 180 240 L 320 240 L 300 255 L 200 255 Z" fill="#1e293b" stroke="black" strokeWidth="3" />
                  <g style={{ transform: `rotate(${tiltAngle}deg)`, transformOrigin: '250px 90px', transition: 'transform 0.4s ease' }}>
                    <rect x="70" y="84" width="360" height="12" rx="6" fill="#0f172a" stroke="black" strokeWidth="3" />
                    <circle cx="250" cy="90" r="12" fill="#6d28d9" stroke="black" strokeWidth="3" />
                    <circle cx="90" cy="90" r="4" fill="#f59e0b" stroke="black" strokeWidth="2" />
                    <circle cx="410" cy="90" r="4" fill="#f59e0b" stroke="black" strokeWidth="2" />
                  </g>
                  <g style={{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '90px 90px', transition: 'transform 0.4s ease' }}>
                    <line x1="90" y1="90" x2="55" y2="170" stroke="black" strokeWidth="2" />
                    <line x1="90" y1="90" x2="125" y2="170" stroke="black" strokeWidth="2" />
                    <rect x="45" y="170" width="90" height="8" fill="#1e293b" stroke="black" strokeWidth="2" />
                    <text x="90" y="200" fill="#fef08a" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      JAWA {jawaBebanPercent}%
                    </text>
                  </g>
                  <g style={{ transform: `rotate(${-tiltAngle}deg)`, transformOrigin: '410px 90px', transition: 'transform 0.4s ease' }}>
                    <line x1="410" y1="90" x2="375" y2="170" stroke="black" strokeWidth="2" />
                    <line x1="410" y1="90" x2="445" y2="170" stroke="black" strokeWidth="2" />
                    <rect x="365" y="170" width="90" height="8" fill="#1e293b" stroke="black" strokeWidth="2" />
                    <text x="410" y="200" fill="#2dd4bf" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                      SUM {sumateraBebanPercent}%
                    </text>
                  </g>
                </svg>
                {!isWin && (
                  <button
                    type="button"
                    onClick={handleReset}
                    className="absolute bottom-1 right-1 px-2 py-1 bg-black text-white text-[9px] font-mono border border-black"
                  >
                    RESET
                  </button>
                )}
              </div>
            </div>

            <div className="w-[28%] sm:w-[30%] shrink-0 min-w-0">
              <RegionPanel
                region="Wilayah Sumatera"
                stock={sumateraStock}
                color="text-teal-400"
                hint={(n) => `${n} unit logistik. Target: ${TARGET_EACH} unit.`}
                boxes={(n) => Array.from({ length: n }).map((_, idx) => (
                  <div key={`s-${idx}`} className="w-8 h-8 sm:w-9 sm:h-9 bg-teal-400 border-2 border-black shadow-[2px_2px_0_#000] flex items-center justify-center">
                    <div className="w-3 h-3 border border-black bg-teal-500" />
                  </div>
                ))}
              />
            </div>
          </div>

          {/* Kontrol & progress — di bawah baris utama */}
          <div className="flex flex-col items-center gap-2 w-full max-w-lg mx-auto">
            <div className="grid grid-cols-2 gap-2 w-full">
              <MinigameButton variant="secondary" onClick={moveToJawa} disabled={isWin || isSyncing || sumateraStock === 0} className="py-2 bg-orange-400 hover:bg-orange-300">
                ← Ke Jawa
              </MinigameButton>
              <MinigameButton variant="secondary" onClick={moveToSumatera} disabled={isWin || isSyncing || jawaStock === 0} className="py-2 bg-teal-400 hover:bg-teal-300">
                Ke Sumatera →
              </MinigameButton>
            </div>

            <MinigameProgress
              label={`INDEX KEADILAN (${TARGET_EACH}-${TARGET_EACH})`}
              value={indexKeadilan}
              win={isWin}
              hint={`Alokasikan tepat ${TARGET_EACH} unit ke Jawa dan ${TARGET_EACH} unit ke Sumatera`}
            />

            <MinigameWinBanner
              syncing={isSyncing}
              win={isWin}
              winMessage="Keadilan tercapai! Menunggu konfirmasi misi..."
              syncingMessage="⚖️ Menyinkronkan timbangan..."
            />
          </div>
      </MinigameWorkArea>
    </MinigameRoot>
  );
}
