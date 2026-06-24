import React, { useState, useRef, useEffect } from 'react';
import { ShieldAlert, Swords, Clock, Lock } from 'lucide-react';
import TaskContainer from './TaskContainer';

/**
 * Panel Provokator — aksi Sabotase & Duel 1v1, plus bisa menjawab soal untuk mengurangi progress Warga.
 */
export default function ProvokateurPanel({
  room, selfId, isPlayerDead,
  onTriggerSabotage, onTriggerDuel,
  duelCooldownRemaining,
  sabotageQuiz, onSubmitSabotageQuiz,
  taskTimer,
  // Task props (provokator bisa menjawab soal seperti warga)
  currentTask, isAnswered, selectedOption, feedback,
  taskError, minigameRetryKey,
  onSelectOption, onSubmitQuiz, onMinigameComplete, onNextTask, onClearTaskError, onRetryMinigameSubmit, onRetryQuizSubmit,
}) {
  const livingCitizens = room.players.filter(p => !p.isGuru && !p.isDead && p.id !== selfId);
  const [duelTargetId, setDuelTargetId] = useState(null);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const quizResetTimer = useRef(null);

  useEffect(() => {
    return () => {
      if (quizResetTimer.current) clearTimeout(quizResetTimer.current);
    };
  }, []);

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

  React.useEffect(() => {
    setQuizSelected(null);
    setQuizSubmitted(false);
  }, [sabotageQuiz?.question?.id]);

  if (isPlayerDead) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
          <span className="font-rubik italic text-[#ffb4ab] text-xl font-bold">PROVOKATOR</span>
          <span className="neo-badge bg-[#93000a] text-[#ffdad6] border-black text-[10px] py-0.5 px-2">ELIMINATED</span>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-8 text-center bg-[#190047]">
          <div className="text-5xl">👻</div>
          <div>
            <p className="font-rubik italic text-[#d3c5ab] text-lg font-bold mb-1">ARWAH PROVOKATOR</p>
            <p className="font-mono text-[#9c8f78] text-xs leading-relaxed">
              Anda telah dieliminasi melalui voting musyawarah kelas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-[#190047]">

      {/* Panel header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
        <div>
          <div className="font-rubik italic text-[#ffb4ab] text-xl font-bold leading-none">PROVOKATOR</div>
          <div className="font-mono text-[#d3c5ab] text-[10px] tracking-[1px] uppercase mt-0.5">SECRET ACTIONS</div>
        </div>
        <span className="neo-badge bg-[#93000a] text-[#ffdad6] border-black text-[10px] py-0.5 px-2">😈 AKTIF</span>
      </div>

      <div className="flex-1 flex flex-col gap-4 p-4 overflow-y-auto">

        {/* ── SABOTASE QUIZ KILAT (fase 1) ── */}
        {sabotageQuiz && (
          <div className="neo-card-high border-[#ffc312] shadow-[6px_6px_0px_#000000] p-4 flex flex-col gap-3 animate-fadeIn">
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
                <button
                  key={idx}
                  onClick={() => !quizSubmitted && setQuizSelected(idx)}
                  disabled={quizSubmitted}
                  className={`p-2.5 border-2 border-solid text-left text-xs font-mono transition-all ${
                    quizSelected === idx
                      ? 'bg-[#ffc312] border-[#ffc312] text-[#3f2e00] font-bold'
                      : 'bg-[#22005c] border-[#4f4632] text-[#e9ddff] hover:border-[#ffc312] cursor-pointer'
                  }`}
                >
                  <span className="font-black mr-1.5">{String.fromCharCode(65 + idx)}.</span>{opt}
                </button>
              ))}
            </div>

            <button
              onClick={handleQuizSubmit}
              disabled={quizSelected === null || quizSubmitted}
              className={`w-full py-3 font-rubik italic text-base font-bold border-4 border-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
                quizSelected !== null && !quizSubmitted
                  ? 'bg-[#ffc312] text-[#3f2e00] cursor-pointer'
                  : 'bg-[#270067] text-[#4f4632] cursor-not-allowed'
              }`}
            >
              {quizSubmitted ? '⏳ MEMPROSES...' : '⚡ KIRIM JAWABAN KILAT!'}
            </button>
          </div>
        )}

        {/* ── TOMBOL AKSI UTAMA ── */}
        {!sabotageQuiz && (
          <>
          <div className="flex flex-col gap-4">
            {/* Sabotase button */}
            <button
              onClick={onTriggerSabotage}
              disabled={sabotageBlocked}
              className={`relative flex flex-col items-center justify-center gap-2 py-6 border-4 border-black rounded-xl transition-all ${
                sabotageBlocked
                  ? 'bg-[#22005c] opacity-40 cursor-not-allowed shadow-none'
                  : 'bg-[#ffb4ab] hover:bg-[#ffdad6] cursor-pointer shadow-[6px_6px_0px_#000000] active:translate-x-[3px] active:translate-y-[3px] active:shadow-none'
              }`}
            >
              <ShieldAlert size={28} className={sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#690005]'} />
              <span className={`font-rubik italic text-xl font-bold ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#690005]'}`}>
                SABOTASE
              </span>
              <span className={`font-mono text-[10px] ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#93000a]'}`}>
                {sabotageBlocked ? '— TIDAK TERSEDIA —' : 'Kunci 1 Warga acak'}
              </span>
              {sabotageBlocked && (
                <div className="absolute top-2 right-2">
                  <Lock size={14} className="text-[#9c8f78]" />
                </div>
              )}
            </button>

            {/* Duel 1v1 */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <p className="font-mono text-[#d3c5ab] text-[11px] uppercase tracking-wider">⚔️ Duel 1v1</p>
                {hasCooldown && (
                  <span className="flex items-center gap-1 neo-badge bg-[#ffc312] text-[#3f2e00] border-black text-[10px] py-0.5 px-2">
                    <Clock size={10} /> CD: {duelCooldownRemaining}s
                  </span>
                )}
              </div>

              {hasCooldown ? (
                <div className="flex flex-col items-center gap-2 p-4 bg-[#22005c] border-4 border-[#ffc312] rounded-xl">
                  <Clock size={22} className="text-[#ffc312]" />
                  <p className="font-rubik italic text-[#ffc312] text-2xl font-bold">{duelCooldownRemaining}s</p>
                  <p className="font-mono text-[#d3c5ab] text-[10px]">Tunggu sebelum duel lagi</p>
                  <div className="w-full bg-[#13003a] rounded border-2 border-black h-3 overflow-hidden">
                    <div
                      className="bg-[#ffc312] h-full transition-all duration-1000"
                      style={{ width: `${(duelCooldownRemaining / 30) * 100}%` }}
                    />
                  </div>
                </div>
              ) : livingCitizens.length === 0 ? (
                <div className="p-4 bg-[#22005c] border-2 border-[#4f4632] rounded-xl text-center font-mono text-[#9c8f78] text-xs italic">
                  Tidak ada Warga yang bisa ditantang.
                </div>
              ) : (
                <div className="flex flex-col gap-1.5 max-h-[200px] overflow-y-auto">
                  {livingCitizens.map(target => (
                    <div
                      key={target.id}
                      className={`flex items-center justify-between p-2.5 border-2 border-solid transition-all ${
                        duelTargetId === target.id
                          ? 'bg-[#ffc312]/10 border-[#ffc312]'
                          : 'bg-[#22005c] border-[#4f4632] hover:border-[#ffc312]'
                      }`}
                      onMouseEnter={() => setDuelTargetId(target.id)}
                      onMouseLeave={() => setDuelTargetId(null)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base flex-shrink-0">🧑‍🚀</span>
                        <div className="min-w-0">
                          <p className="font-mono text-[#e9ddff] text-xs font-bold truncate">{target.name}</p>
                          <p className="font-mono text-[#9c8f78] text-[9px]">{target.score} pt</p>
                        </div>
                      </div>
                      <button
                        onClick={() => onTriggerDuel(target.id)}
                        disabled={duelBlocked}
                        className={`flex items-center gap-1 px-3 py-1.5 border-2 border-black text-xs font-bold font-mono transition-all ${
                          duelBlocked
                            ? 'bg-[#270067] text-[#4f4632] cursor-not-allowed'
                            : 'bg-[#93000a] text-[#ffdad6] hover:bg-[#ffb4ab] hover:text-[#690005] shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer'
                        }`}
                      >
                        <Swords size={11} /> DUEL
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ── SEKSI SOAL: Provokator bisa menjawab soal untuk mengurangi progress Warga ── */}
          <div className="flex flex-col border-t-2 border-[#4f4632] pt-3 mt-1">
            <div className="flex items-center justify-between px-1 mb-2">
              <div>
                <p className="font-mono text-[#d3c5ab] text-[11px] uppercase tracking-wider">📝 Misi Pengacau</p>
                <p className="font-mono text-[#9c8f78] text-[9px]">Jawab benar = kurangi progress Warga</p>
              </div>
            </div>
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
          </div>
          </>
        )}

      </div>
    </div>
  );
}
