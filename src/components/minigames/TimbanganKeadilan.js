"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Scale } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea, MinigameProgress,
  MinigameButton, MinigameWinBanner, MinigameInlineStatus, SILA_LABELS,
} from './MinigameShell';

/** Possible target values per side */
const TARGET_OPTIONS = [4, 5, 6, 7, 8];

/** Province pairs across Indonesia */
const PROVINCE_PAIRS = [
  {
    left: { name: 'JAWA BARAT', color: '#fbbf24', textColor: '#fef08a' },
    right: { name: 'PAPUA', color: '#2dd4bf', textColor: '#99f6e4' }
  },
  {
    left: { name: 'JAWA TENGAH', color: '#fbbf24', textColor: '#fef08a' },
    right: { name: 'MALUKU', color: '#f472b6', textColor: '#fce7f3' }
  },
  {
    left: { name: 'JAWA TIMUR', color: '#fbbf24', textColor: '#fef08a' },
    right: { name: 'KALIMANTAN', color: '#4ade80', textColor: '#bbf7d0' }
  },
  {
    left: { name: 'BANTEN', color: '#fb923c', textColor: '#ffedd5' },
    right: { name: 'NTT', color: '#818cf8', textColor: '#e0e7ff' }
  },
  {
    left: { name: 'SUMATERA UTR', color: '#fbbf24', textColor: '#fef08a' },
    right: { name: 'SULAWESI', color: '#34d399', textColor: '#d1fae5' }
  },
  {
    left: { name: 'SUMATERA SEL', color: '#fbbf24', textColor: '#fef08a' },
    right: { name: 'NTB', color: '#a78bfa', textColor: '#ede9fe' }
  },
  {
    left: { name: 'RIAU', color: '#f97316', textColor: '#ffedd5' },
    right: { name: 'MALUKU UTR', color: '#22d3ee', textColor: '#cffafe' }
  },
  {
    left: { name: 'D.K.I JAKARTA', color: '#facc15', textColor: '#fefce8' },
    right: { name: 'PAPUA BARAT', color: '#4ade80', textColor: '#bbf7d0' }
  },
  {
    left: { name: 'D.I YOGYAKARTA', color: '#fb923c', textColor: '#ffedd5' },
    right: { name: 'GORONTALO', color: '#f472b6', textColor: '#fce7f3' }
  },
  {
    left: { name: 'BALI', color: '#fbbf24', textColor: '#fef08a' },
    right: { name: 'KALTARA', color: '#2dd4bf', textColor: '#99f6e4' }
  },
];

/** Generate a fresh random puzzle */
function generatePuzzle() {
  const target = TARGET_OPTIONS[Math.floor(Math.random() * TARGET_OPTIONS.length)];
  const total = target * 2;
  const maxOffset = Math.min(target - 1, total - 1);
  const offset = Math.floor(Math.random() * maxOffset) + 1;
  const leftGetsMore = Math.random() < 0.5;
  const leftInit = leftGetsMore ? target + offset : target - offset;
  const rightInit = total - leftInit;
  const pair = PROVINCE_PAIRS[Math.floor(Math.random() * PROVINCE_PAIRS.length)];
  return { target, leftInit, rightInit, pair };
}

/**
 * TimbanganKeadilan - Scale Balancing Minigame (Sila 5)
 */
export default function TimbanganKeadilan({ onGameComplete, onComplete }) {
  const [puzzle, setPuzzle] = useState(() => generatePuzzle());
  const [leftStock, setLeftStock] = useState(puzzle.leftInit);
  const [rightStock, setRightStock] = useState(puzzle.rightInit);
  const [isWin, setIsWin] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);

  const { target, pair } = puzzle;

  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const isBalanced = leftStock === target && rightStock === target;

  // tilt: positive = left heavier → left pan goes down
  const tiltAngle = Math.max(-32, Math.min(32, (leftStock - rightStock) * 5));

  const leftProgress = Math.max(0, 1 - Math.abs(leftStock - target) / target);
  const rightProgress = Math.max(0, 1 - Math.abs(rightStock - target) / target);
  const indexKeadilan = Math.round(((leftProgress + rightProgress) / 2) * 100);

  useEffect(() => {
    if (!isBalanced || isWin || completedRef.current) {
      if (!isBalanced) setIsSyncing(false);
      return;
    }
    
    // Langsung selesai tanpa delay
    completedRef.current = true;
    setIsWin(true);
    setIsSyncing(false);
    fireTaskComplete(onCompleteRef.current, onGameComplete);
  }, [leftStock, rightStock, isBalanced, isWin, onGameComplete]);

  const moveRight = () => {
    if (isWin || isSyncing || leftStock === 0) return;
    setLeftStock(p => p - 1);
    setRightStock(p => p + 1);
  };
  const moveLeft = () => {
    if (isWin || isSyncing || rightStock === 0) return;
    setRightStock(p => p - 1);
    setLeftStock(p => p + 1);
  };
  const handleReset = () => {
    if (isWin) return;
    const fresh = generatePuzzle();
    setPuzzle(fresh);
    setLeftStock(fresh.leftInit);
    setRightStock(fresh.rightInit);
    setIsSyncing(false);
    completedRef.current = false;
    setIsWin(false);
  };

  const statusLabel = isWin
    ? '✅ MERATA & SEIMBANG'
    : isSyncing ? '⏳ MENYINKRONKAN...'
      : isBalanced ? '⚖️ SEIMBANG!'
        : leftStock > rightStock ? `⬅ ${pair.left.name} BERAT`
          : `${pair.right.name} BERAT ➡`;

  const headerStatus = isWin ? 'win' : isSyncing ? 'syncing' : 'playing';
  const headerLabel = isWin ? '🎉 SELESAI' : isSyncing ? '⏳ SYNC' : '⚖️ SEIMBANGKAN';

  /* ── SVG Scale geometry ── */
  const VW = 340, VH = 260;
  const PIVOT_X = VW / 2, PIVOT_Y = 68;
  const BEAM_HALF = 118;
  const rad = (tiltAngle * Math.PI) / 180;

  const lx = PIVOT_X - BEAM_HALF * Math.cos(rad);
  const ly = PIVOT_Y - BEAM_HALF * Math.sin(rad);
  const rx = PIVOT_X + BEAM_HALF * Math.cos(rad);
  const ry = PIVOT_Y + BEAM_HALF * Math.sin(rad);

  const CHAIN = 52, PAN_W = 72, PAN_H = 8;
  const leftPanY = ly + CHAIN;
  const rightPanY = ry + CHAIN;

  const BOX = 11, GAP = 2;
  const perRow = Math.floor(PAN_W / (BOX + GAP));

  const renderBoxes = (count, color, panX, panY) =>
    Array.from({ length: count }).map((_, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const bx = panX - PAN_W / 2 + col * (BOX + GAP) + GAP;
      const by = panY - PAN_H / 2 - BOX - row * (BOX + GAP) - GAP;
      return <rect key={i} x={bx} y={by} width={BOX} height={BOX} fill={color} stroke="#000" strokeWidth="1.2" rx="1.5" />;
    });

  /* ── Province side panel ── */
  const SidePanel = ({ name, color, textColor, stock, onMove, disabled, isLeft, hideButton }) => (
    <div className="flex flex-col gap-1.5 sm:gap-2 w-full h-full justify-between">
      <div className="flex flex-col gap-1.5 sm:gap-2 h-full min-h-0">
        {/* Name badge */}
        <div
          className="w-full text-center font-mono font-black text-[9px] sm:text-[10px] lg:text-xs uppercase tracking-widest py-1.5 border-[3px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
          style={{ background: color, color: '#000' }}
        >
          {name}
        </div>
        {/* Count + boxes */}
        <div
          className="w-full flex-1 min-h-0 border-[3px] border-black flex flex-col items-center justify-center gap-1.5 py-2 shadow-[inset_0_4px_8px_rgba(0,0,0,0.4)] overflow-hidden"
          style={{ background: '#1e293b' }}
        >
          <span className="font-mono font-black text-2xl sm:text-3xl lg:text-4xl leading-none" style={{ color: textColor }}>
            {stock}<span className="text-[9px] sm:text-[10px] lg:text-xs opacity-50">/{target}</span>
          </span>
          <div className="flex flex-wrap gap-1 justify-center px-1 content-start" style={{ minHeight: '24px' }}>
            {Array.from({ length: stock }).map((_, i) => (
              <div key={i} className="w-2.5 h-2.5 sm:w-3 sm:h-3 lg:w-4 lg:h-4 border-2 border-black shrink-0" style={{ background: color }} />
            ))}
          </div>
          {stock === target && (
            <span className="text-[8px] sm:text-[9px] font-mono font-black text-green-400 tracking-wider animate-pulse mt-0.5">✓ TARGET</span>
          )}
        </div>
      </div>
      {/* Move button */}
      {!hideButton && (
        <button
          type="button"
          onClick={onMove}
          disabled={disabled}
          className={`w-full py-1.5 sm:py-2 lg:py-2.5 font-mono font-black text-[9px] sm:text-[10px] lg:text-xs uppercase border-[3px] border-black transition-all flex items-center justify-center gap-1 sm:gap-2 shrink-0 ${
            disabled 
              ? 'opacity-50 cursor-not-allowed shadow-none' 
              : 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,1)] active:translate-y-[2px] active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)]'
          }`}
          style={{
            background: disabled ? '#64748b' : color,
            color: disabled ? '#cbd5e1' : '#000',
          }}
        >
          {isLeft ? (
            <>
              <span className="text-sm sm:text-base leading-none">←</span> <span className="hidden sm:inline">KIRIM</span>
            </>
          ) : (
            <>
              <span className="hidden sm:inline">KIRIM</span> <span className="text-sm sm:text-base leading-none">→</span>
            </>
          )}
        </button>
      )}
    </div>
  );

  return (
    <MinigameRoot>
      <MinigameHeader
        icon={Scale}
        iconBg="bg-orange-200"
        title="Timbangan Keadilan Sosial"
        sila={SILA_LABELS[4]}
        statusVariant={headerStatus}
        statusLabel={headerLabel}
      />

      <MinigameWorkArea className="flex flex-col !p-2 sm:!p-3 overflow-hidden h-full bg-slate-50 relative justify-between">

        {/* Status strip & Description */}
        <div className="flex flex-col items-center justify-center w-full mb-1.5 sm:mb-2 shrink-0 z-10 gap-1">
          <MinigameInlineStatus
            label={`STATUS: ${statusLabel}`}
            variant={isWin ? 'win' : isSyncing ? 'syncing' : isBalanced ? 'syncing' : 'playing'}
          />
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-center text-slate-700 bg-white/80 px-2 py-0.5 rounded border border-slate-300">
            Alokasikan bantuan bencana ke tempat yang terdampak, {target} unit di {pair.left.name} dan {target} unit ke {pair.right.name}
          </span>
        </div>

        {/* Main row: Left Panel | Scale | Right Panel */}
        <div className="flex-1 min-h-0 w-full max-w-5xl mx-auto flex flex-row items-stretch justify-between gap-2 sm:gap-4 lg:gap-6 z-10 relative">

          {/* LEFT province panel */}
          <div className="w-[28%] sm:w-[25%] lg:w-[22%] shrink-0 flex flex-col min-h-0">
            <SidePanel
              name={pair.left.name}
              color={pair.left.color}
              textColor={pair.left.textColor}
              stock={leftStock}
              onMove={moveLeft}
              disabled={isWin || isSyncing || rightStock === 0}
              hideButton={isWin || isSyncing}
              isLeft={true}
            />
          </div>

          {/* CENTER: SVG scale */}
          <div className="flex-1 min-w-0 min-h-0 relative flex justify-center items-center h-full">
            <svg
              viewBox={`0 0 ${VW} ${VH}`}
              className="w-full h-full max-w-md drop-shadow-xl overflow-visible transition-transform duration-300"
              style={{ maxHeight: '100%' }}
              preserveAspectRatio="xMidYMid meet"
              aria-hidden
            >
              {/* Stand */}
              <line x1={PIVOT_X} y1={PIVOT_Y + 10} x2={PIVOT_X} y2={210}
                stroke="#1e293b" strokeWidth="9" strokeLinecap="round" />
              {/* Base trapezoid */}
              <path d={`M ${PIVOT_X - 55} 210 L ${PIVOT_X + 55} 210 L ${PIVOT_X + 42} 224 L ${PIVOT_X - 42} 224 Z`}
                fill="#1e293b" stroke="#000" strokeWidth="2" />
              {/* Base shadow line */}
              <rect x={PIVOT_X - 50} y={224} width={100} height={4} rx="2" fill="#000" opacity="0.4" />

              {/* Beam — rotates around pivot */}
              <g style={{
                transform: `rotate(${tiltAngle}deg)`,
                transformOrigin: `${PIVOT_X}px ${PIVOT_Y}px`,
                transition: 'transform 0.4s cubic-bezier(.4,0,.2,1)',
              }}>
                <rect x={PIVOT_X - BEAM_HALF} y={PIVOT_Y - 5} width={BEAM_HALF * 2} height={10} rx="5"
                  fill="#0f172a" stroke="#000" strokeWidth="1.5" />
                {/* Pivot gem */}
                <circle cx={PIVOT_X} cy={PIVOT_Y} r="10" fill="#7c3aed" stroke="#000" strokeWidth="2" />
                <circle cx={PIVOT_X} cy={PIVOT_Y} r="5" fill="#a78bfa" stroke="none" />
                {/* Beam end pins */}
                <circle cx={PIVOT_X - BEAM_HALF} cy={PIVOT_Y} r="4" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
                <circle cx={PIVOT_X + BEAM_HALF} cy={PIVOT_Y} r="4" fill="#f59e0b" stroke="#000" strokeWidth="1.5" />
              </g>

              {/* LEFT pan assembly — chain + boxes + pan (position computed from beam end) */}
              <g>
                <line x1={lx - 10} y1={ly} x2={lx - PAN_W / 2 + 6} y2={leftPanY} stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1={lx + 10} y1={ly} x2={lx + PAN_W / 2 - 6} y2={leftPanY} stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
                {renderBoxes(leftStock, pair.left.color, lx, leftPanY)}
                <rect x={lx - PAN_W / 2} y={leftPanY - PAN_H / 2} width={PAN_W} height={PAN_H}
                  fill="#1e293b" stroke="#000" strokeWidth="2" rx="2" />
              </g>

              {/* RIGHT pan assembly */}
              <g>
                <line x1={rx - 10} y1={ry} x2={rx - PAN_W / 2 + 6} y2={rightPanY} stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
                <line x1={rx + 10} y1={ry} x2={rx + PAN_W / 2 - 6} y2={rightPanY} stroke="#64748b" strokeWidth="1.5" strokeDasharray="3,2" />
                {renderBoxes(rightStock, pair.right.color, rx, rightPanY)}
                <rect x={rx - PAN_W / 2} y={rightPanY - PAN_H / 2} width={PAN_W} height={PAN_H}
                  fill="#1e293b" stroke="#000" strokeWidth="2" rx="2" />
              </g>
            </svg>

            {/* Reset button */}
            {!isWin && (
              <button
                type="button"
                onClick={handleReset}
                className="absolute bottom-0 right-0 px-2 sm:px-3 py-0.5 sm:py-1 bg-white text-black text-[9px] sm:text-[10px] font-black font-mono border-[2px] border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-[2px] hover:shadow-[2px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-0 active:shadow-none transition-all"
              >
                RESET
              </button>
            )}
          </div>

          {/* RIGHT province panel */}
          <div className="w-[28%] sm:w-[25%] lg:w-[22%] shrink-0 flex flex-col">
            <SidePanel
              name={pair.right.name}
              color={pair.right.color}
              textColor={pair.right.textColor}
              stock={rightStock}
              onMove={moveRight}
              disabled={isWin || isSyncing || leftStock === 0}
              hideButton={isWin || isSyncing}
              isLeft={false}
            />
          </div>
        </div>

        {/* Bottom container */}
        <div className="mt-3 sm:mt-4 shrink-0 z-10 w-full flex flex-col gap-2">
          <MinigameProgress
            label={`INDEX KEADILAN (${target}-${target})`}
            value={indexKeadilan}
            win={isWin}
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
