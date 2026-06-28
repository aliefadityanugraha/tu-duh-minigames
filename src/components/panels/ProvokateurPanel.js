import React, { useState, useEffect, useMemo } from 'react';
import { ShieldAlert, Swords, Clock, Lock, CheckCircle2, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import TaskContainer from './MiniGamesContainer';
import SabotaseDuelPanel from './SabotaseDuelPanel';

/**
 * MISSION BOOK — Panel kiri untuk Provokator.
 * Menampilkan kuis/minigame dan panel aksi sabotase/duel.
 */
export default function ProvokateurPanel(props) {
  const {
    room, selfId, isPlayerDead,
    currentTask, isAnswered, selectedOption, feedback,
    taskError, minigameRetryKey,
    taskTimer, isNextTaskLoading,
    onSelectOption, onSubmitQuiz, onMinigameComplete, onNextTask, onClearTaskError, onRetryMinigameSubmit, onRetryQuizSubmit,
    // Provokator Specific Actions
    onTriggerSabotage, onTriggerDuel,
    duelCooldownRemaining,
    sabotageQuiz, onSubmitSabotageQuiz,
    playerProfile
  } = props;

  const livingCitizens = room.players.filter(p => !p.isGuru && !p.isDead && p.id !== selfId);
  const [duelTargetId, setDuelTargetId] = useState(null);

  const hasCooldown = duelCooldownRemaining > 0;
  const sabotageBlocked = !!room.sabotage || !!room.duel || room.debate?.active || room.topicDebate?.active;
  const duelBlocked = !!room.duel || !!room.sabotage || room.debate?.active || room.topicDebate?.active || hasCooldown;

  // ── Dead state ──
  if (isPlayerDead) {
    return (
      <div className="flex flex-col h-full bg-[#190047]">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
          <span className="font-rubik italic text-[#ffb4ab] text-xl font-bold">PROVOKATOR</span>
          <span className="neo-badge bg-[#93000a] text-[#ffdad6] border-black text-[10px] py-0.5 px-2">ELIMINATED</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="text-5xl">👻</div>
          <p className="font-rubik italic text-[#d3c5ab] text-lg font-bold">ARWAH PROVOKATOR</p>
        </div>
      </div>
    );
  }

  // ── Sabotase Quiz ──
  if (sabotageQuiz) {
    return (
        <div className="flex flex-col h-full bg-[#190047] overflow-y-auto">
        <div className="p-4 flex flex-col gap-3 animate-fadeIn border-4 border-[#ffc312] shadow-[6px_6px_0px_#000000] m-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-rubik italic text-[#ffc312] text-base font-bold">⚡ SOAL KILAT SABOTASE!</p>
            </div>
            <span className="font-mono font-black text-[#ffc312] text-2xl">{sabotageQuiz.timer}s</span>
          </div>
          <div className="p-3 bg-[#13003a] border-2 border-[#ffc312]">
            <p className="font-mono text-[#e9ddff] text-sm">{sabotageQuiz.question.question}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sabotageQuiz.question.options.map((opt, idx) => (
              <button key={idx} onClick={() => onSubmitSabotageQuiz(idx)}
                className="p-2.5 border-2 bg-[#22005c] border-[#4f4632] text-[#e9ddff] text-xs font-mono">
                {opt}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden bg-[#190047]">
      <TaskContainer
        currentTask={currentTask}
        isAnswered={isAnswered}
        selectedOption={selectedOption}
        feedback={feedback}
        taskError={taskError}
        minigameRetryKey={minigameRetryKey}
        isPlayerDead={isPlayerDead}
        taskTimer={taskTimer}
        isNextTaskLoading={isNextTaskLoading}
        onSelectOption={onSelectOption}
        onSubmitQuiz={onSubmitQuiz}
        onMinigameComplete={onMinigameComplete}
        onNextTask={onNextTask}
        onClearTaskError={onClearTaskError}
        onRetryMinigameSubmit={onRetryMinigameSubmit}
        onRetryQuizSubmit={onRetryQuizSubmit}
        isProvokator={true}
        playerProfile={playerProfile}
      >
        <div className="mx-4 my-3 border-t-2 border-dashed border-[#4f4632]" />
        <SabotaseDuelPanel
          room={room}
          selfId={selfId}
          duelCooldownRemaining={duelCooldownRemaining}
          onTriggerSabotage={onTriggerSabotage}
          onTriggerDuel={onTriggerDuel}
          sabotageBlocked={sabotageBlocked}
          duelBlocked={duelBlocked}
          hasCooldown={hasCooldown}
          livingCitizens={livingCitizens}
          duelTargetId={duelTargetId}
          setDuelTargetId={setDuelTargetId}
        />
      </TaskContainer>
    </div>
  );
}
