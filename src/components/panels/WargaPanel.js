import React from 'react';
import { ArrowRight, Lock, Loader2, CheckCircle2, XCircle } from 'lucide-react';

/**
 * MISSION BOOK — Panel kiri halaman in-game untuk Warga.
 * Menampilkan soal aktif sebagai "TASK 01" dan soal terkunci.
 */
export default function WargaPanel({
  currentQuestion, isAnswered, selectedOption, feedback,
  isPlayerDead, taskLocked,
  onSelectOption, onSubmitAnswer, onNextQuestion,
}) {
  const silaLabel =
    currentQuestion?.sila === 'umum' || currentQuestion?.sila === 'sejarah'
      ? String(currentQuestion.sila).toUpperCase()
      : `SILA #${currentQuestion?.sila}`;

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

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
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

      {/* Task cards scroll area */}
      <div className="flex-1 flex flex-col gap-0 overflow-y-auto bg-[#190047]">

        {/* ── TASK AKTIF ── */}
        {currentQuestion ? (
          <div className="p-5 bg-[#190047] border-b-4 border-black shadow-[6px_6px_0px_#000000] flex flex-col gap-3">
            {/* Task badge + type */}
            <div className="flex items-center justify-between">
              <div className="neo-badge bg-[#ffc312] text-[#6e5200] border-black text-xs py-1 px-2">
                TASK AKTIF
              </div>
              <span className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">
                {silaLabel}
              </span>
            </div>

            {/* Question text */}
            <h3 className="font-rubik font-extrabold text-[#e9ddff] text-lg leading-snug">
              {currentQuestion.question}
            </h3>

            {/* Solo quest badge */}
            <div className="flex items-center gap-2">
              <span className="text-[#ffc312]">⚡</span>
              <span className="font-mono text-[#d3c5ab] text-[10px] uppercase tracking-wider">SOLO QUEST</span>
            </div>

            {/* Answer options */}
            <div className="flex flex-col gap-2 mt-1">
              {currentQuestion.options.map((opt, idx) => {
                const isSelected = selectedOption === idx;
                const isCorrectAnswer = feedback && feedback.correctIndex === idx;
                const isWrongSelected = isAnswered && isSelected && !feedback?.correct;
                return (
                  <button
                    key={idx}
                    onClick={() => onSelectOption(idx)}
                    disabled={isAnswered || isPlayerDead}
                    className={`flex items-center gap-3 p-3 text-left text-sm font-mono border-2 border-solid transition-all ${
                      isAnswered && isCorrectAnswer
                        ? 'bg-[#003829] border-[#41e5b3] text-[#41e5b3]'
                        : isWrongSelected
                        ? 'bg-[#93000a] border-[#ffb4ab] text-[#ffdad6]'
                        : isSelected
                        ? 'bg-[#270067] border-[#ffc312] text-[#ffe5b3]'
                        : isAnswered
                        ? 'bg-[#13003a] border-[#4f4632] text-[#9c8f78] cursor-not-allowed opacity-50'
                        : 'bg-[#22005c] border-[#4f4632] text-[#e9ddff] hover:border-[#ffc312] hover:text-white cursor-pointer'
                    }`}
                  >
                    <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-black border-2 border-current rounded text-xs font-black">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="leading-tight flex-1">{opt}</span>
                  </button>
                );
              })}
            </div>

            {/* Submit / Feedback */}
            {!isAnswered ? (
              <button
                onClick={onSubmitAnswer}
                disabled={selectedOption === null || isPlayerDead}
                className={`w-full py-3 font-rubik italic text-base font-bold border-4 border-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
                  selectedOption !== null && !isPlayerDead
                    ? 'bg-[#ffc312] text-[#3f2e00] hover:bg-[#ffe5b3] cursor-pointer'
                    : 'bg-[#270067] text-[#4f4632] cursor-not-allowed'
                }`}
              >
                {isPlayerDead ? '👻 Arwah tidak bisa menjawab' : 'KIRIM JAWABAN →'}
              </button>
            ) : (
              <div className="flex flex-col gap-2 animate-fadeIn">
                <div className={`flex items-start gap-3 p-3 border-4 border-black ${
                  feedback?.correct
                    ? 'bg-[#003829] text-[#41e5b3]'
                    : 'bg-[#93000a] text-[#ffdad6]'
                }`}>
                  {feedback?.correct
                    ? <CheckCircle2 size={16} className="flex-shrink-0 mt-0.5" />
                    : <XCircle size={16} className="flex-shrink-0 mt-0.5" />}
                  <div>
                    <span className="font-mono font-bold text-xs block">
                      {feedback?.correct ? '✅ BENAR! +1 SKOR' : '❌ SALAH! PELAJARI LAGI.'}
                    </span>
                    {feedback?.explanation && (
                      <p className="text-[10px] leading-relaxed opacity-80 mt-0.5">{feedback.explanation}</p>
                    )}
                  </div>
                </div>
                <button
                  onClick={onNextQuestion}
                  className="w-full py-3 neo-btn neo-btn-secondary text-sm flex items-center justify-center gap-2"
                >
                  MISI BERIKUTNYA <ArrowRight size={14} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
            <Loader2 size={28} className="text-[#41e5b3] animate-spin" />
            <p className="font-mono italic text-[#d3c5ab] text-sm">Mengambil misi dari server...</p>
          </div>
        )}

        {/* ── TASK TERKUNCI (placeholder) ── */}
        {[
          { label: 'TASK 02', title: '🕵️ Identifikasi Ancaman', locked: true },
          { label: 'TASK 03', title: '📡 Perbaiki Komunikasi', locked: true },
        ].map((task, i) => (
          <div
            key={i}
            className="p-5 bg-[#22005c] border-b-2 border-[#4f4632] flex flex-col gap-2 opacity-50"
          >
            <div className="flex items-center justify-between">
              <div className="neo-badge bg-[#9c8f78] text-[#190047] border-black text-xs py-1 px-2">{task.label}</div>
              <Lock size={14} className="text-[#9c8f78]" />
            </div>
            <p className="font-rubik font-extrabold text-[#d3c5ab] text-lg leading-snug">{task.title}</p>
            <p className="font-mono text-[#9c8f78] text-xs">Complete previous task to unlock.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
