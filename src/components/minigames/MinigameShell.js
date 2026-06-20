import React from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import { getMinigameShellClasses } from './shellClasses';

/** Bungkus luar + board mini-game */
export function MinigameRoot({ compact, children }) {
  const shell = getMinigameShellClasses(compact);
  return (
    <div className={shell.outer}>
      <div className={shell.board}>{children}</div>
    </div>
  );
}

/** Header seragam — fullscreen / overlay (compact pakai header TaskContainer) */
export function MinigameHeader({ compact, icon: Icon, iconBg = 'bg-white', title, sila, statusVariant = 'playing', statusLabel }) {
  if (compact) return null;
  const shell = getMinigameShellClasses(false);

  const badgeClass = {
    playing: 'bg-red-500 text-white',
    syncing: 'bg-yellow-400 text-black animate-pulse',
    win: 'bg-green-500 text-black',
    hint: 'bg-[#270067] text-[#41e5b3]',
  }[statusVariant] || 'bg-red-500 text-white';

  return (
    <div className={shell.header}>
      <div className="flex items-center gap-3 min-w-0">
        <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border-4 border-black flex justify-center items-center shrink-0 ${iconBg}`}>
          {Icon && <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-black" />}
        </div>
        <div className="min-w-0">
          <h1 className={shell.title}>{title}</h1>
          <span className={shell.subtitle}>{sila}</span>
        </div>
      </div>
      {statusLabel && (
        <div className={`neo-badge border-black text-[10px] sm:text-xs py-1 px-2 sm:px-3 shrink-0 ${badgeClass}`}>
          {statusLabel}
        </div>
      )}
    </div>
  );
}

/** Area konten utama */
export function MinigameWorkArea({ compact, children, className = '' }) {
  const shell = getMinigameShellClasses(compact);
  return (
    <div className={`${shell.workArea} ${className}`}>
      {children}
    </div>
  );
}

/** Panel dengan label hitam di atas */
export function MinigameSection({ label, children, className = '' }) {
  return (
    <div className={`w-full flex flex-col gap-0 ${className}`}>
      {label && (
        <div className="px-2 py-1.5 bg-black border-2 border-black">
          <span className="text-white text-[10px] sm:text-xs font-bold font-mono-tech uppercase tracking-widest">
            {label}
          </span>
        </div>
      )}
      <div className="p-3 sm:p-4 bg-white border-4 border-t-0 border-black">
        {children}
      </div>
    </div>
  );
}

/** Kotak petunjuk */
export function MinigameHint({ title = 'PETUNJUK', children }) {
  return (
    <div className="w-full p-3 bg-white border-4 border-black flex gap-2 items-start">
      <div className="flex-1 min-w-0">
        <span className="text-black text-[10px] sm:text-xs font-extrabold uppercase tracking-wide">{title}</span>
        <p className="text-black/80 text-[10px] sm:text-xs font-medium mt-1 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}

/** Status inline (dot + teks) di dalam area game */
export function MinigameInlineStatus({ label, variant = 'playing' }) {
  const dotClass = {
    playing: 'bg-yellow-400',
    syncing: 'bg-yellow-400 animate-pulse',
    win: 'bg-green-500 animate-pulse',
    error: 'bg-red-500',
  }[variant] || 'bg-yellow-400';

  return (
    <div className="flex items-center gap-2">
      <span className={`w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-black shrink-0 ${dotClass}`} />
      <span className="bg-black px-2 py-0.5 text-orange-200 text-[9px] sm:text-[10px] font-bold font-mono-tech uppercase">
        {label}
      </span>
    </div>
  );
}

/** Progress bar seragam */
export function MinigameProgress({ label, value, win = false, hint }) {
  const pct = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] sm:text-xs font-bold font-mono-tech text-black mb-1">
        <span>{label}</span>
        <span className={win ? 'text-green-600' : ''}>{pct}%</span>
      </div>
      <div className="w-full h-5 sm:h-6 bg-white border-4 border-black overflow-hidden">
        <div
          className={`h-full border-r-4 border-black transition-all duration-300 ${win ? 'bg-green-500' : 'bg-teal-400'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="text-[9px] text-black/60 font-mono mt-1 text-center">{hint}</p>}
    </div>
  );
}

const BTN = {
  primary: 'bg-black text-white hover:bg-neutral-800 border-4 border-black',
  secondary: 'bg-yellow-400 text-black hover:bg-yellow-300 border-4 border-black',
  danger: 'bg-red-400 text-black hover:bg-red-300 border-4 border-black',
  ghost: 'bg-white text-black hover:bg-yellow-50 border-4 border-black',
};

export function MinigameButton({ variant = 'primary', className = '', children, ...props }) {
  return (
    <button
      type="button"
      className={`font-extrabold uppercase text-[10px] sm:text-xs tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-colors ${BTN[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

/** Banner kemenangan / sinkronisasi */
export function MinigameWinBanner({ syncing, win, winMessage = 'Misi selesai! Menunggu konfirmasi...', syncingMessage = 'Memproses...' }) {
  if (!syncing && !win) return null;
  return (
    <div className={`w-full p-2.5 sm:p-3 border-4 border-black flex items-center justify-center gap-2 ${
      win ? 'bg-green-500 text-black animate-fadeIn' : 'bg-yellow-400 text-black animate-pulse'
    }`}>
      {win ? (
        <>
          <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
          <span className="font-black uppercase text-[10px] sm:text-xs tracking-wide text-center">{winMessage}</span>
        </>
      ) : (
        <span className="font-black uppercase text-[10px] sm:text-xs tracking-wide text-center">{syncingMessage}</span>
      )}
    </div>
  );
}

/** Footer amber dengan tombol reset opsional */
export function MinigameFooter({ compact, onReset, resetLabel = 'RESET', showReset = true, disabled = false, children }) {
  const shell = getMinigameShellClasses(compact);

  if (compact) {
    if (!showReset || disabled) return null;
    return (
      <div className={shell.footer}>
        <div className="flex justify-end w-full">
          <MinigameButton variant="secondary" onClick={onReset} className="px-4 py-2 text-[10px]">
            {resetLabel}
          </MinigameButton>
        </div>
      </div>
    );
  }

  return (
    <div className={shell.footer}>
      <div className="flex-1 min-w-0">{children}</div>
      {showReset && onReset && (
        <MinigameButton
          variant="secondary"
          onClick={onReset}
          disabled={disabled}
          className="px-5 py-2.5 text-xs flex items-center gap-1.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          {resetLabel}
        </MinigameButton>
      )}
    </div>
  );
}

/** Konstanta label Sila */
export const SILA_LABELS = {
  2: 'SILA 2: KEMANUSIAAN YANG ADIL DAN BERADAB',
  3: 'SILA 3: PERSATUAN INDONESIA',
  4: 'SILA 4: KERAKYATAN YANG DIPIMPIN OLEH HIKMAT KEBIJAKSANAAN',
  5: 'SILA 5: KEADILAN SOSIAL BAGI SELURUH RAKYAT INDONESIA',
};
