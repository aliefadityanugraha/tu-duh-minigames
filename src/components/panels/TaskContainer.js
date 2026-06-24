import React, { useState, useEffect } from 'react';
import { CheckCircle2, ArrowRight, AlertTriangle, RotateCcw, Maximize2, Loader2 } from 'lucide-react';
import QuizTask from './QuizTask';
import { MINIGAME_REGISTRY } from '../minigames';
import MinigameOverlay from '../overlays/MinigameOverlay';

/**
 * Router dinamis: merender kuis atau mini-game berdasarkan currentTask dari server.
 */
export default function TaskContainer({
  currentTask,
  isAnswered,
  selectedOption,
  feedback,
  taskError,
  minigameRetryKey,
  isPlayerDead,
  taskTimer,
  onSelectOption,
  onSubmitQuiz,
  onMinigameComplete,
  onNextTask,
  onClearTaskError,
  onRetryMinigameSubmit,
  onRetryQuizSubmit,
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [minigameWon, setMinigameWon] = useState(false);

  useEffect(() => {
    setMinigameWon(false);
  }, [currentTask?.sessionId]);

  if (!currentTask) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <p className="font-mono italic text-[#d3c5ab] text-sm animate-pulse">Mengambil misi dari server...</p>
      </div>
    );
  }

  const { type, data, sessionId } = currentTask;
  const isQuiz = type === 'quiz';
  const minigameMeta = MINIGAME_REGISTRY[type];

  const silaLabel = data?.sila
    ? (data.sila === 'umum' || data.sila === 'sejarah' ? String(data.sila).toUpperCase() : `SILA #${data.sila}`)
    : null;

  const handleMinigameComplete = () => {
    if (isAnswered || isPlayerDead || minigameWon) return;
    setMinigameWon(true);
    onMinigameComplete?.({ sessionId, type });
  };

  const handleRetryError = () => {
    onClearTaskError?.();
    if (!isAnswered && minigameWon) onRetryMinigameSubmit?.();
  };

  const showMinigameSuccess = isAnswered && feedback && !taskError;
  const showMinigamePending = minigameWon && !isAnswered && !taskError;

  if (isQuiz) {
    return (
      <>
        {taskTimer != null && !isAnswered && (
          <div className={`mx-5 mt-2 flex items-center justify-between px-4 py-2 border-4 border-black ${
            taskTimer <= 5 ? 'bg-[#93000a] text-[#ffdad6] animate-pulse' : 'bg-[#270067] text-[#ffc312]'
          }`}>
            <span className="font-mono text-[10px] font-bold uppercase tracking-wider">⏱️ WAKTU MISI</span>
            <span className="font-mono text-lg font-black">{taskTimer}s</span>
          </div>
        )}
        {taskError && (
          <div className="mx-5 mt-3 p-3 bg-[#93000a] border-4 border-black flex flex-col gap-2 animate-fadeIn">
            <p className="font-mono text-[#ffdad6] text-xs leading-relaxed">{taskError}</p>
            <div className="flex gap-2">
              {!isAnswered && selectedOption !== null && (
                <button
                  type="button"
                  onClick={onRetryQuizSubmit}
                  className="flex-1 py-2 bg-[#ffc312] text-[#3f2e00] border-2 border-black font-mono font-bold text-xs"
                >
                  KIRIM ULANG
                </button>
              )}
              <button
                type="button"
                onClick={onClearTaskError}
                className="flex-1 py-2 bg-[#270067] text-[#d3c5ab] border-2 border-black font-mono font-bold text-xs"
              >
                TUTUP
              </button>
            </div>
          </div>
        )}
        <QuizTask
          taskData={data}
          isAnswered={isAnswered}
          selectedOption={selectedOption}
          feedback={feedback}
          isPlayerDead={isPlayerDead}
          onSelectOption={onSelectOption}
          onSubmitAnswer={onSubmitQuiz}
          onNextTask={onNextTask}
        />
      </>
    );
  }

  if (!minigameMeta) {
    return (
      <div className="p-6 text-center text-[#ffb4ab] font-mono text-sm">
        Task tidak dikenal: {type}
      </div>
    );
  }

  const MinigameComponent = minigameMeta.component;

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-[#270067] border-b-2 border-black shrink-0">
          <div className="neo-badge bg-[#41e5b3] text-[#003829] border-black text-[10px] py-0.5 px-2">
            🎮 MINI-GAME
          </div>
          <div className="flex items-center gap-2">
            {taskTimer != null && !isAnswered && !minigameWon && (
              <span className={`neo-badge text-[10px] py-0.5 px-2 border-black ${
                taskTimer <= 5 ? 'bg-[#93000a] text-[#ffdad6] animate-pulse' : 'bg-[#ffc312] text-[#3f2e00]'
              }`}>
                ⏱️ {taskTimer}s
              </span>
            )}
            {silaLabel && (
              <span className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">{silaLabel}</span>
            )}
            {!isAnswered && !isPlayerDead && !minigameWon && (
              <button
                type="button"
                onClick={() => setIsFullscreen(true)}
                className="flex items-center gap-1 px-2 py-1 bg-[#ffc312] text-[#3f2e00] border-2 border-black font-mono text-[9px] font-bold hover:bg-[#ffe5b3]"
                title="Layar penuh"
              >
                <Maximize2 size={11} /> FULL
              </button>
            )}
          </div>
        </div>

        {taskError && (
          <div className="shrink-0 mx-3 mt-3 p-3 bg-[#93000a] border-4 border-black flex flex-col gap-2 animate-fadeIn">
            <div className="flex items-start gap-2">
              <AlertTriangle size={14} className="text-[#ffb4ab] shrink-0 mt-0.5" />
              <p className="font-mono text-[#ffdad6] text-xs leading-relaxed">{taskError}</p>
            </div>
            <button
              type="button"
              onClick={handleRetryError}
              className="w-full py-2 bg-[#ffc312] text-[#3f2e00] border-2 border-black font-mono font-bold text-xs flex items-center justify-center gap-2 hover:bg-[#ffe5b3]"
            >
              <RotateCcw size={12} /> KIRIM ULANG
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <MinigameComponent
            key={`${sessionId}-${minigameRetryKey}`}
            compact
            onComplete={handleMinigameComplete}
          />
        </div>

        {showMinigamePending && (
          <div className="shrink-0 p-4 bg-[#190047] border-t-4 border-black animate-fadeIn">
            <div className="flex items-center gap-3 p-3 border-4 border-black bg-[#270067] text-[#ffc312]">
              <Loader2 size={16} className="animate-spin shrink-0" />
              <span className="font-mono font-bold text-xs">Mini-game selesai — menunggu konfirmasi...</span>
            </div>
          </div>
        )}

        {showMinigameSuccess && (
          <div className="shrink-0 p-4 bg-[#190047] border-t-4 border-black animate-fadeIn">
            <div className="flex items-start gap-3 p-3 border-4 border-black bg-[#003829] text-[#41e5b3]">
              <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-mono font-bold text-xs block">✅ MINI-GAME SELESAI! +1 SKOR</span>
                {feedback.explanation && (
                  <p className="text-[10px] leading-relaxed opacity-80 mt-0.5">{feedback.explanation}</p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onNextTask}
              className="w-full mt-2 py-3 neo-btn neo-btn-secondary text-sm flex items-center justify-center gap-2"
            >
              MISI BERIKUTNYA <ArrowRight size={14} />
            </button>
          </div>
        )}
      </div>

      {isFullscreen && (
        <MinigameOverlay
          minigameMeta={minigameMeta}
          sessionId={sessionId}
          minigameRetryKey={minigameRetryKey}
          silaLabel={silaLabel}
          taskError={taskError}
          minigameWon={minigameWon}
          isAnswered={isAnswered}
          feedback={feedback}
          onComplete={handleMinigameComplete}
          onClose={() => setIsFullscreen(false)}
          onClearTaskError={handleRetryError}
          onNextTask={() => {
            setIsFullscreen(false);
            onNextTask?.();
          }}
        />
      )}
    </>
  );
}
