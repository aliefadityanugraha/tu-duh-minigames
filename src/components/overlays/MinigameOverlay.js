import React from 'react';
import { Maximize2, X, CheckCircle2, ArrowRight, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';

/**
 * Overlay fullscreen untuk mini-game kompleks.
 */
export default function MinigameOverlay({
  minigameMeta,
  sessionId,
  minigameRetryKey,
  silaLabel,
  taskError,
  minigameWon,
  isAnswered,
  feedback,
  onComplete,
  onClose,
  onClearTaskError,
  onNextTask,
}) {
  if (!minigameMeta) return null;

  const MinigameComponent = minigameMeta.component;
  const showPending = minigameWon && !isAnswered && !taskError;
  const showSuccess = isAnswered && feedback && !taskError;

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-indigo-950/95 backdrop-blur-sm">
      <div className="shrink-0 flex items-center justify-between px-4 py-3 bg-yellow-400 border-b-4 border-black">
        <div className="flex items-center gap-3 min-w-0">
          <Maximize2 size={18} className="text-black shrink-0" />
          <div className="min-w-0">
            <h2 className="font-rubik italic font-black text-black text-lg leading-none truncate uppercase">
              {minigameMeta.label}
            </h2>
            {silaLabel && (
              <span className="font-mono text-[10px] text-black/70 font-bold tracking-wider">{silaLabel}</span>
            )}
          </div>
        </div>
        {!showSuccess && (
          <button
            type="button"
            onClick={onClose}
            className="shrink-0 w-10 h-10 bg-black text-white border-2 border-black flex items-center justify-center hover:bg-neutral-800"
            title="Kembali ke Mission Book"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {taskError && (
        <div className="shrink-0 mx-4 mt-3 p-3 bg-[#93000a] border-4 border-black">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[#ffb4ab] shrink-0 mt-0.5" />
            <p className="font-mono text-[#ffdad6] text-xs">{taskError}</p>
          </div>
          <button
            type="button"
            onClick={onClearTaskError}
            className="mt-2 w-full py-2 bg-[#ffc312] text-[#3f2e00] border-2 border-black font-mono font-bold text-xs flex items-center justify-center gap-2"
          >
            <RotateCcw size={12} /> KIRIM ULANG
          </button>
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2 sm:p-4 min-h-0">
        <MinigameComponent
          key={`overlay-${sessionId}-${minigameRetryKey}`}
          compact={false}
          onComplete={onComplete}
        />
      </div>

      {showPending && (
        <div className="shrink-0 p-4 bg-[#190047] border-t-4 border-black">
          <div className="flex items-center gap-3 p-3 border-4 border-black bg-[#270067] text-[#ffc312]">
            <Loader2 size={16} className="animate-spin shrink-0" />
            <span className="font-mono font-bold text-sm">Mini-game selesai — menunggu konfirmasi server...</span>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="shrink-0 p-4 bg-[#190047] border-t-4 border-black">
          <div className="flex items-start gap-3 p-3 border-4 border-black bg-[#003829] text-[#41e5b3] mb-3">
            <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-sm block">✅ MINI-GAME SELESAI! +1 SKOR</span>
              {feedback.explanation && (
                <p className="text-xs opacity-80 mt-1">{feedback.explanation}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onNextTask}
            className="w-full py-3 bg-[#ffc312] text-[#3f2e00] border-4 border-black font-rubik italic font-bold text-base flex items-center justify-center gap-2 hover:bg-[#ffe5b3]"
          >
            MISI BERIKUTNYA <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}
