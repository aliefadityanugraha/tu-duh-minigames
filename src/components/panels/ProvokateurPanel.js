import React, { useState, useRef, useEffect, useMemo } from 'react';
import { ShieldAlert, Swords, Clock, Lock, CheckCircle2, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { MINIGAME_REGISTRY, MINIGAME_IDS } from '../minigames';

export default function ProvokateurPanel({
  room, selfId, isPlayerDead,
  onTriggerSabotage, onTriggerDuel,
  duelCooldownRemaining,
  sabotageQuiz, onSubmitSabotageQuiz,
  taskTimer,
  currentTask, isAnswered, selectedOption, feedback,
  taskError, minigameRetryKey,
  onSelectOption, onSubmitQuiz, onMinigameComplete, onNextTask, onClearTaskError, onRetryMinigameSubmit, onRetryQuizSubmit,
}) {
  const livingCitizens = room.players.filter(p => !p.isGuru && !p.isDead && p.id !== selfId);
  const [duelTargetId, setDuelTargetId] = useState(null);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [minigameWon, setMinigameWon] = useState(false);
  const quizResetTimer = useRef(null);

  // Pilih minigame stabil berdasarkan sessionId
  const forcedMinigameType = useMemo(() => {
    if (currentTask?.type && currentTask.type !== 'quiz' && MINIGAME_REGISTRY[currentTask.type]) {
      return currentTask.type;
    }
    const pool = MINIGAME_IDS;
    const seed = currentTask?.sessionId || 'default';
    const idx = Math.abs(seed.split('').reduce((a, c) => a + c.charCodeAt(0), 0)) % pool.length;
    return pool[idx];
  }, [currentTask?.sessionId, currentTask?.type]);

  const minigameMeta = MINIGAME_REGISTRY[forcedMinigameType];
  const MinigameComponent = minigameMeta?.component;

  useEffect(() => {
    return () => { if (quizResetTimer.current) clearTimeout(quizResetTimer.current); };
  }, []);

  useEffect(() => { setMinigameWon(false); }, [currentTask?.sessionId]);

  const hasCooldown = duelCooldownRemaining > 0;
  const sabotageBlocked = !!room.sabotage || !!room.duel || room.debate?.active || room.topicDebate?.active;
  const duelBlocked = !!room.duel || !!room.sabotage || room.debate?.active || room.topicDebate?.active || hasCooldown;

  const handleQuizSubmit = () => {
    if (quizSelected === null || quizSubmitted) return;
    setQuizSubmitted(true);
    onSubmitSabotageQuiz(quizSelected);
    if (quizResetTimer.current) clearTimeout(quizResetTimer.current);
    quizResetTimer.current = setTimeout(() => { setQuizSelected(null); setQuizSubmitted(false); }, 1500);
  };

  const handleMinigameComplete = () => {
    if (isPlayerDead || minigameWon) return;
    setMinigameWon(true);
    // Tidak submit ke server karena sessionId milik quiz (akan error).
    // Langsung minta task baru setelah 1.5 detik.
    setTimeout(() => { onNextTask?.(); setMinigameWon(false); }, 1500);
  };

  React.useEffect(() => {
    setQuizSelected(null);
    setQuizSubmitted(false);
  }, [sabotageQuiz?.question?.id]);

  const timerVisible = taskTimer != null && !minigameWon;

  // ── Dead state ──
  if (isPlayerDead) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
          <span className="font-rubik italic text-[#ffb4ab] text-xl font-bold">PROVOKATOR</span>
          <span className="neo-badge bg-[#93000a] text-[#ffdad6] border-black text-[10px] py-0.5 px-2">ELIMINATED</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#190047]">
          <div className="text-5xl">👻</div>
          <p className="font-rubik italic text-[#d3c5ab] text-lg font-bold mb-1">ARWAH PROVOKATOR</p>
          <p className="font-mono text-[#9c8f78] text-xs leading-relaxed">
            Anda telah dieliminasi melalui voting musyawarah kelas.
          </p>
        </div>
      </div>
    );
  }

  // ── SABOTASE QUIZ KILAT ──
  if (sabotageQuiz) {
    return (
      <div className="flex flex-col h-full bg-[#190047] overflow-y-auto">
        <div className="p-4 flex flex-col gap-3 animate-fadeIn border-4 border-[#ffc312] shadow-[6px_6px_0px_#000000] m-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-rubik italic text-[#ffc312] text-base font-bold">⚡ SOAL KILAT SABOTASE!</p>
              <p className="font-mono text-[#d3c5ab] text-[10px]">Jawab benar untuk mengaktifkan sabotase</p>
            </div>
            <span className="font-mono font-black text-[#ffc312] text-2xl">{sabotageQuiz.timer}s</span>
          </div>
          <div className="p-3 bg-[#13003a] border-2 border-[#ffc312]">
            <p className="font-mono text-[#e9ddff] text-sm">{sabotageQuiz.question.question}</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {sabotageQuiz.question.options.map((opt, idx) => (
              <button key={idx} onClick={() => !quizSubmitted && setQuizSelected(idx)} disabled={quizSubmitted}
                className={`p-2.5 border-2 text-left text-xs font-mono transition-all ${quizSelected === idx
                  ? 'bg-[#ffc312] border-[#ffc312] text-[#3f2e00] font-bold'
                  : 'bg-[#22005c] border-[#4f4632] text-[#e9ddff] hover:border-[#ffc312] cursor-pointer'}`}>
                <span className="font-black mr-1.5">{String.fromCharCode(65 + idx)}.</span>{opt}
              </button>
            ))}
          </div>
          <button onClick={handleQuizSubmit} disabled={quizSelected === null || quizSubmitted}
            className={`w-full py-3 font-rubik italic text-base font-bold border-4 border-black shadow-[4px_4px_0px_#000000] transition-all ${quizSelected !== null && !quizSubmitted
              ? 'bg-[#ffc312] text-[#3f2e00] cursor-pointer' : 'bg-[#270067] text-[#4f4632] cursor-not-allowed'}`}>
            {quizSubmitted ? '⏳ MEMPROSES...' : '⚡ KIRIM JAWABAN KILAT!'}
          </button>
        </div>
      </div>
    );
  }

  // ── LAYOUT UTAMA ──
  return (
    <div className="w-full h-full overflow-y-auto bg-[#190047]">

      {/* Header sticky */}
      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-2 border-b-4 border-black bg-[#22005c]">
        <div className="bg-[#4f4632] p-1 border-2 border-black shadow-[2px_2px_0px_#000000]">
          <span className="text-sm">🎮</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-rubik italic text-[#ffc312] text-xs font-bold uppercase tracking-wide">
            MISI PENGACAU — {minigameMeta?.label || 'Minigame'}
          </p>
        </div>
        {timerVisible && (
          <span className={`font-mono font-black text-sm px-2 py-0.5 border-2 border-black ${taskTimer <= 5 ? 'bg-[#93000a] text-[#ffdad6] animate-pulse' : 'bg-[#270067] text-[#ffc312]'}`}>
            ⏱ {taskTimer}s
          </span>
        )}
      </div>

      {/* Error banner */}
      {taskError && (
        <div className="mx-4 mt-2 p-3 bg-[#93000a] border-4 border-black flex flex-col gap-2 animate-fadeIn">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-[#ffb4ab] shrink-0 mt-0.5" />
            <p className="font-mono text-[#ffdad6] text-xs">{taskError}</p>
          </div>
        </div>
      )}

      {/* Minigame selesai banner */}
      {minigameWon && (
        <div className="mx-4 mt-2 p-3 border-4 border-black bg-[#003829] text-[#41e5b3] animate-fadeIn flex items-center gap-3">
          <CheckCircle2 size={18} className="shrink-0" />
          <p className="font-mono font-bold text-xs flex-1">✅ MINIGAME SELESAI! Memuat misi berikutnya...</p>
          <Loader2 size={14} className="animate-spin shrink-0" />
        </div>
      )}

      {/* ── MINIGAME AREA — tinggi pixel agar tidak bergantung flex chain ── */}
      <div style={{ height: '480px', minHeight: '480px' }} className="w-full flex flex-col">
        {MinigameComponent ? (
          <MinigameComponent
            key={`${currentTask?.sessionId ?? 'no-task'}-${minigameRetryKey}-${forcedMinigameType}`}
            onComplete={handleMinigameComplete}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="font-mono text-[#9c8f78] text-sm animate-pulse">Memuat minigame...</p>
          </div>
        )}
      </div>

      {/* ── PEMISAH ── */}
      <div className="mx-4 my-3 border-t-2 border-dashed border-[#4f4632]" />

      {/* ── AKSI PANEL ── */}
      <div className="px-4 pb-6 flex flex-col gap-3">

        {/* Section labels */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#22005c] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_#000000]">
            <ShieldAlert size={12} className="text-[#ffb4ab]" />
            <span className="font-rubik italic text-[#ffb4ab] text-xs font-bold">SABOTASE</span>
          </div>
          <div className="flex-1 border-t border-[#4f4632]" />
          <div className="flex items-center gap-1.5 bg-[#22005c] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_#000000]">
            <Swords size={12} className="text-[#ffc312]" />
            <span className="font-rubik italic text-[#ffc312] text-xs font-bold">DUEL 1v1</span>
          </div>
        </div>

        {/* Sabotase Button */}
        <button
          onClick={onTriggerSabotage}
          disabled={sabotageBlocked}
          className={`flex items-center gap-3 px-4 py-3 border-4 border-black transition-all ${
            sabotageBlocked
              ? 'bg-[#22005c] opacity-50 cursor-not-allowed'
              : 'bg-gradient-to-r from-[#ffb4ab] to-[#ff8c82] cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:from-[#ffdad6] hover:to-[#ffb4ab]'
          }`}
        >
          <div className="p-1.5 border-2 border-black bg-[#190047] shrink-0">
            <ShieldAlert size={16} className={sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#ffb4ab] animate-pulse'} />
          </div>
          <div className="flex-1 text-left min-w-0">
            <p className={`font-rubik italic text-sm font-black leading-none mb-0.5 ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#690005]'}`}>SABOTASE WARGA</p>
            <p className={`font-mono text-[9px] font-bold ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#93000a]'}`}>
              {sabotageBlocked ? 'Diblokir / tidak tersedia' : 'Kunci 1 layar Warga seketika!'}
            </p>
          </div>
          {sabotageBlocked
            ? <Lock size={13} className="text-[#9c8f78] shrink-0" />
            : <span className="font-mono text-[9px] font-black text-[#690005] shrink-0 border-2 border-[#690005] px-1.5 py-0.5">AKTIF</span>
          }
        </button>

        {/* Duel section */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-widest font-bold">Target Duel:</span>
            {hasCooldown && (
              <span className="flex items-center gap-1 bg-[#270067] border-2 border-[#ffc312] text-[#ffc312] font-mono font-black text-[9px] py-0.5 px-2">
                <Clock size={9} /> {duelCooldownRemaining}s
              </span>
            )}
          </div>

          {hasCooldown ? (
            <div className="flex items-center gap-3 px-4 py-3 bg-[#22005c] border-4 border-[#ffc312]">
              <Clock size={18} className="text-[#ffc312] animate-bounce shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <span className="font-rubik italic text-[#ffc312] text-xl font-black">{duelCooldownRemaining}s</span>
                  <span className="font-mono text-[#d3c5ab] text-[10px]">cooldown...</span>
                </div>
                <div className="w-full bg-[#13003a] border border-[#ffc312] h-1.5 overflow-hidden mt-1.5">
                  <div className="bg-[#ffc312] h-full transition-all duration-1000" style={{ width: `${(duelCooldownRemaining / 30) * 100}%` }} />
                </div>
              </div>
            </div>
          ) : livingCitizens.length === 0 ? (
            <div className="px-4 py-3 bg-[#22005c] border-4 border-[#4f4632] text-center font-mono text-[#9c8f78] text-xs italic flex items-center justify-center gap-2">
              <span>👻</span> Semua Warga telah tumbang.
            </div>
          ) : (
            <div className="flex flex-col gap-1 bg-[#13003a] border-4 border-black p-1 shadow-[4px_4px_0px_#000000]">
              {livingCitizens.map(target => (
                <div
                  key={target.id}
                  className={`flex items-center justify-between px-3 py-2 border-2 transition-all ${
                    duelTargetId === target.id
                      ? 'bg-[#ffc312] border-[#ffc312]'
                      : 'bg-[#190047] border-[#270067] hover:border-[#ffc312] hover:bg-[#22005c]'
                  }`}
                  onMouseEnter={() => setDuelTargetId(target.id)}
                  onMouseLeave={() => setDuelTargetId(null)}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base shrink-0">🧑‍🚀</span>
                    <div className="min-w-0">
                      <p className={`font-mono text-xs font-black truncate leading-none ${duelTargetId === target.id ? 'text-[#3f2e00]' : 'text-[#e9ddff]'}`}>
                        {target.name}
                      </p>
                      <p className={`font-mono text-[9px] font-bold ${duelTargetId === target.id ? 'text-[#6e5200]' : 'text-[#9c8f78]'}`}>
                        {target.score} Poin
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => onTriggerDuel(target.id)}
                    disabled={duelBlocked}
                    className={`flex items-center gap-1 px-3 py-1.5 border-2 border-black text-[10px] font-black font-mono transition-all ${
                      duelBlocked
                        ? 'bg-[#13003a] text-[#4f4632] cursor-not-allowed'
                        : duelTargetId === target.id
                          ? 'bg-[#93000a] text-[#ffdad6] cursor-pointer shadow-[2px_2px_0px_#000000]'
                          : 'bg-[#270067] text-[#ffc312] border-[#ffc312] cursor-pointer hover:bg-[#93000a] hover:text-[#ffdad6]'
                    }`}
                  >
                    <Swords size={10} className={duelBlocked ? '' : 'animate-pulse'} /> DUEL
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
