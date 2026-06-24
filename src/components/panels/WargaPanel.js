import React from 'react';
import { Lock } from 'lucide-react';
import TaskContainer from './MiniGamesContainer';
import { getLockedTaskPreviews } from '../../lib/taskPreview';

/**
 * MISSION BOOK — Panel kiri halaman in-game untuk Warga.
 * Menampilkan kuis atau mini-game via TaskContainer.
 */
export default function WargaPanel({
  currentTask, isAnswered, selectedOption, feedback,
  taskError, minigameRetryKey,
  isPlayerDead, taskLocked, taskTimer,
  onSelectOption, onSubmitQuiz, onMinigameComplete, onNextTask, onClearTaskError, onRetryMinigameSubmit, onRetryQuizSubmit,
}) {

  // ── Task locked (sabotase aktif) ──
  if (taskLocked) {
    return (
      <div className="flex flex-col gap-0 h-full">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#270067] border-b-4 border-black">
          <span className="font-rubik italic text-[#41e5b3] text-xl font-bold">MISSION BOOK</span>
          <span className="text-[10px] font-mono text-[#d3c5ab] uppercase tracking-wider">ACTIVE OBJECTIVES</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center animate-pulse-glow-red bg-[#190047]">
          <div className="w-16 h-16 rounded-full bg-[#93000a] border-4 border-black flex items-center justify-center text-3xl shadow-[4px_4px_0px_#000000]">🔒</div>
          <div>
            <p className="font-rubik italic text-[#ffb4ab] text-xl font-bold mb-1">MISI TERKUNCI!</p>
            <p className="font-mono text-[#d3c5ab] text-xs leading-relaxed">
              Provokator memicu sabotase!<br />Warga sedang berjuang menyelamatkan situasi.
            </p>
          </div>
          <div className="neo-badge bg-[#93000a] text-[#ffdad6] border-black text-xs py-1 px-3 animate-pulse">
            <Lock size={11} className="mr-1.5" /> SISTEM DIBEKUKAN
          </div>
        </div>
      </div>
    );
  }

  const showLockedPreviews = currentTask && !isAnswered && !isPlayerDead;
  const lockedPreviews = showLockedPreviews ? getLockedTaskPreviews(currentTask, 2) : [];

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
        <div>
          <div className="font-rubik italic text-[#41e5b3] text-xl font-bold leading-none">MISSION BOOK</div>
          <div className="font-mono text-[#d3c5ab] text-[10px] tracking-[1px] uppercase mt-0.5">ACTIVE OBJECTIVES</div>
        </div>
        <span className={`neo-badge text-[10px] py-0.5 px-2 ${
          isPlayerDead
            ? 'bg-[#270067] text-[#9c8f78] border-[#4f4632]'
            : 'bg-[#41e5b3] text-[#003829] border-black'
        }`}>
          {isPlayerDead ? '👻 ARWAH' : '🟢 AKTIF'}
        </span>
      </div>

      <div className="flex-1 flex flex-col gap-0 overflow-y-auto bg-[#190047]">
        <TaskContainer
          currentTask={currentTask}
          isAnswered={isAnswered}
          selectedOption={selectedOption}
          feedback={feedback}
          taskError={taskError}
          minigameRetryKey={minigameRetryKey}
          isPlayerDead={isPlayerDead}
          taskTimer={taskTimer}
          onSelectOption={onSelectOption}
          onSubmitQuiz={onSubmitQuiz}
          onMinigameComplete={onMinigameComplete}
          onNextTask={onNextTask}
          onClearTaskError={onClearTaskError}
          onRetryMinigameSubmit={onRetryMinigameSubmit}
          onRetryQuizSubmit={onRetryQuizSubmit}
        />

        {lockedPreviews.map((task) => (
          <div
            key={task.label}
            className="p-5 bg-[#22005c] border-b-2 border-[#4f4632] flex flex-col gap-2 opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="neo-badge bg-[#9c8f78] text-[#190047] border-black text-xs py-1 px-2">
                {task.label}
              </div>
              <Lock size={14} className="text-[#9c8f78]" />
            </div>
            <p className="font-rubik font-extrabold text-[#d3c5ab] text-base leading-snug">{task.title}</p>
            <p className="font-mono text-[#9c8f78] text-[10px]">{task.subtitle}</p>
            <p className="font-mono text-[#9c8f78] text-xs italic">Selesaikan misi aktif untuk membuka.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
