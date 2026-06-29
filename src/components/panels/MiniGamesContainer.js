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
  isProvokator,
  playerProfile,
  children
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

  const handleMinigameComplete = (result = { success: true }) => {
    if (isAnswered || isPlayerDead || minigameWon) return;
    setMinigameWon(true);
    onMinigameComplete?.({ sessionId, type, ...result });
  };

  const handleRetryError = () => {
    onClearTaskError?.();
    // Only retry if the server hasn't confirmed the answer yet
    if (!isAnswered && minigameWon) onRetryMinigameSubmit?.();
  };

  // Untuk minigame, kita tidak menunggu feedback, cukup isAnswered dan tanpa error
  // Kita abaikan minigameWon lokal karena bisa hilang saat re-render (misal karena Sabotase aktif)
  const showMinigameSuccess = isAnswered && !taskError;
  const showMinigamePending = minigameWon && !isAnswered && !taskError;

  if (isQuiz) {
    const quizTimerVisible = taskTimer != null && !isAnswered;
    return (
      <div className="flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden">
        <div className="w-full min-h-full flex flex-col">
          {taskTimer != null ? (
            <div
              className="shrink-0 overflow-hidden"
              style={{
                maxHeight: quizTimerVisible ? '4rem' : '0px',
                opacity: quizTimerVisible ? 1 : 0,
                transition: 'max-height 0.35s ease-in-out, opacity 0.25s ease-in-out',
              }}
            >
              <div className={`shrink-0 w-full flex items-center justify-between px-2 sm:px-5 py-2 sm:py-2.5 ${
                taskTimer <= 5 ? 'bg-[#93000a] text-[#ffdad6] animate-pulse' : 'bg-[#270067] text-[#ffc312]'
              }`}>
                <div className="flex flex-1 items-center gap-2">
                  <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                    <span>⏱</span> <span>WAKTU MISI</span>
                  </span>
                </div>
                <span className="font-mono text-base font-black">{taskTimer}s</span>
              </div>
            </div>
          ) : (
            playerProfile && (
              <div className="shrink-0 w-full flex items-center px-2 sm:px-5 py-2 sm:py-2.5 bg-[#270067]">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center overflow-hidden shrink-0"
                    style={{ backgroundColor: playerProfile.color }}
                  >
                    {playerProfile.skin?.img ? <img src={playerProfile.skin.img} alt={playerProfile.name} className="w-full h-full object-cover" /> : <span className="text-xs">🧑‍🚀</span>}
                  </div>
                  <span className="font-mono font-bold text-white text-[10px] sm:text-xs truncate max-w-[100px]">
                    {playerProfile.name}
                  </span>
                  <span className={`font-mono text-[8px] sm:text-[10px] font-bold tracking-wider ${playerProfile.role === 'Provokator' ? 'text-[#ffb3b3]' : 'text-[#a7f3d0]'}`}>
                    {playerProfile.role?.toUpperCase() || ''}
                  </span>
                </div>
              </div>
            )
          )}
          {taskError && (
            <div className="mx-5 mt-3 p-3 bg-[#93000a] border-4 border-black flex flex-col gap-2 animate-fadeIn shrink-0">
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
          <div className="flex-1 shrink-0">
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
          </div>
          {children && (
            <div className="shrink-0 w-full mt-auto">
              {children}
            </div>
          )}
        </div>
      </div>
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

  const minigameTimerVisible = taskTimer != null && !isAnswered && !minigameWon;
  return (
    <div className="flex flex-col w-full h-full overflow-hidden">
      {taskTimer != null ? (
        <div
          className="shrink-0 overflow-hidden"
          style={{
            maxHeight: minigameTimerVisible ? '4rem' : '0px',
            opacity: minigameTimerVisible ? 1 : 0,
            transition: 'max-height 0.35s ease-in-out, opacity 0.25s ease-in-out',
          }}
        >
          <div className={`shrink-0 w-full flex items-center justify-between px-2 sm:px-5 py-2 sm:py-2.5 ${
            taskTimer <= 5 ? 'bg-[#93000a] text-[#ffdad6] animate-pulse' : 'bg-[#270067] text-[#ffc312]'
          }`}>
            <div className="flex flex-1 items-center gap-2">
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                <span>⏱</span> <span>WAKTU MISI</span>
              </span>
            </div>
            <span className="font-mono text-base font-black">{taskTimer}s</span>
          </div>
        </div>
      ) : (
        playerProfile && (
          <div className="shrink-0 w-full flex items-center px-2 sm:px-5 py-2 sm:py-2.5 bg-[#270067]">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full border-2 border-black flex items-center justify-center overflow-hidden shrink-0"
                style={{ backgroundColor: playerProfile.color }}
              >
                {playerProfile.skin?.img ? <img src={playerProfile.skin.img} alt={playerProfile.name} className="w-full h-full object-cover" /> : <span className="text-xs">🧑‍🚀</span>}
              </div>
              <span className="font-mono font-bold text-white text-[10px] sm:text-xs truncate max-w-[100px]">
                {playerProfile.name}
              </span>
              <span className={`font-mono text-[8px] sm:text-[10px] font-bold tracking-wider ${playerProfile.role === 'Provokator' ? 'text-[#ffb3b3]' : 'text-[#a7f3d0]'}`}>
                {playerProfile.role?.toUpperCase() || ''}
              </span>
            </div>
          </div>
        )
      )}

      <div className={`flex-1 min-h-0 w-full overflow-y-auto overflow-x-hidden ${showMinigamePending || showMinigameSuccess || (taskError && !isQuiz) ? 'pb-[160px]' : ''}`}>
        <div className="w-full min-h-full flex flex-col">
          <div className="flex-1 w-full flex flex-col shrink-0">
            <MinigameComponent
              key={`${sessionId}-${minigameRetryKey}`}
              onComplete={handleMinigameComplete}
              isProvokator={isProvokator}
            />
          </div>
          {children && (
            <div className="shrink-0 w-full">
              {children}
            </div>
          )}
        </div>
      </div>

      {showMinigamePending && (
        <div className="fixed bottom-0 left-0 w-full z-50 p-4 bg-[#190047] border-t-4 border-black animate-fadeIn shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
          <div className="flex items-center gap-3 p-3 border-4 border-black bg-[#270067] text-[#ffc312]">
            <Loader2 size={16} className="animate-spin shrink-0" />
            <span className="font-mono font-bold text-xs">Mini-game selesai — menunggu konfirmasi...</span>
          </div>
        </div>
      )}

      {showMinigameSuccess && (
        <div className="fixed bottom-0 left-0 w-full z-[100] p-4 bg-[#190047] border-t-4 border-black animate-fadeIn shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
          <div className="flex items-start gap-3 p-3 border-4 border-black bg-[#003829] text-[#41e5b3]">
            <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-xs block">
                {isProvokator ? '✅ SABOTASE BERHASIL! PROGRES WARGA -1' : '✅ MINI-GAME SELESAI! +1 SKOR'}
              </span>
              {feedback?.explanation && (
                <p className="text-[10px] leading-relaxed opacity-80 mt-0.5">{feedback.explanation}</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onNextTask}
            disabled={isAnswered && !feedback} // Atau kondisi loading di parent
            className="w-full mt-2 py-3 neo-btn neo-btn-secondary text-sm flex items-center justify-center gap-2"
          >
            MISI BERIKUTNYA <ArrowRight size={14} />
          </button>
        </div>
      )}

      {taskError && !isQuiz && (
        <div className="fixed bottom-0 left-0 w-full z-[100] p-4 bg-[#190047] border-t-4 border-black animate-fadeIn shadow-[0_-4px_10px_rgba(0,0,0,0.3)]">
          <div className="flex items-start gap-3 p-3 border-4 border-black bg-[#93000a] text-[#ffdad6]">
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-mono font-bold text-xs block">⚠️ PENGIRIMAN GAGAL</span>
              <p className="text-[10px] leading-relaxed opacity-80 mt-0.5">{taskError}</p>
            </div>
          </div>
          {!isAnswered && minigameWon && (
            <button
              type="button"
              onClick={handleRetryError}
              className="w-full mt-2 py-3 neo-btn bg-[#ffc312] text-[#3f2e00] border-2 border-black text-sm flex items-center justify-center gap-2"
            >
              <RotateCcw size={14} /> COBA KIRIM ULANG
            </button>
          )}
        </div>
      )}

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
    </div>
  );
}
