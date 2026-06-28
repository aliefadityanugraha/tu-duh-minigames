import React from 'react';
import { ArrowRight, CheckCircle2, XCircle } from 'lucide-react';

/**
 * UI kuis Pancasila — diekstrak dari WargaPanel untuk dipakai TaskContainer.
 */
export default function QuizTask({
  taskData,
  isAnswered,
  selectedOption,
  feedback,
  isPlayerDead,
  onSelectOption,
  onSubmitAnswer,
  onNextTask,
}) {
  const silaLabel =
    taskData?.sila === 'umum' || taskData?.sila === 'sejarah'
      ? String(taskData.sila).toUpperCase()
      : `SILA #${taskData?.sila}`;

  return (
    <div className="p-4 sm:p-5 bg-[#190047] border-b-4 border-black shadow-[6px_6px_0px_#000000] flex flex-col gap-2.5 sm:gap-3">
      <div className="flex items-center justify-between">
        <div className="neo-badge bg-[#ffc312] text-[#6e5200] border-black text-xs py-1 px-2">
          📝 KUIS
        </div>
        <span className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">
          {silaLabel}
        </span>
      </div>

      <h3 className="font-rubik font-extrabold text-[#e9ddff] text-base sm:text-lg leading-snug">
        {taskData?.question}
      </h3>

      <div className="flex items-center gap-2">
        <span className="text-[#ffc312]">⚡</span>
        <span className="font-mono text-[#d3c5ab] text-[10px] uppercase tracking-wider">SOLO QUEST</span>
      </div>

      <div className="flex flex-col gap-2 mt-1">
        {taskData?.options?.map((opt, idx) => {
          const isSelected = selectedOption === idx;
          const isCorrectAnswer = feedback && feedback.correctIndex === idx;
          const isWrongSelected = isAnswered && isSelected && !feedback?.correct;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectOption(idx)}
              disabled={isAnswered || isPlayerDead}
              className={`flex items-center gap-2 sm:gap-3 p-2 sm:p-3 text-left text-xs sm:text-sm font-mono border-2 border-solid transition-all ${
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
              <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center bg-black border-2 border-current rounded text-[10px] sm:text-xs font-black">
                {String.fromCharCode(65 + idx)}
              </span>
              <span className="leading-tight flex-1">{opt}</span>
            </button>
          );
        })}
      </div>

      {!isAnswered ? (
        <button
          type="button"
          onClick={onSubmitAnswer}
          disabled={selectedOption === null || isPlayerDead}
          className={`w-full py-2.5 sm:py-3 font-rubik italic text-sm sm:text-base font-bold border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
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
            type="button"
            onClick={onNextTask}
            className="w-full py-2.5 sm:py-3 neo-btn neo-btn-secondary text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            MISI BERIKUTNYA <ArrowRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
