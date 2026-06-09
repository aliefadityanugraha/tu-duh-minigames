import React, { useState, useEffect } from 'react';
import { Swords, Timer, Zap } from 'lucide-react';

export default function DuelOverlay({ duel, selfName, onSubmitAnswer }) {
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (duel?.question?.id) {
      setSelected(null);
      setSubmitted(false);
    }
  }, [duel?.question?.id]);

  const isCombatant = selfName === duel?.provocateur || selfName === duel?.citizen;

  const handleSelect = (idx) => { if (submitted) return; setSelected(idx); };
  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    onSubmitAnswer(selected);
  };

  const DUEL_MAX = 20;
  const timerPct = Math.max(0, ((duel?.timer ?? 0) / DUEL_MAX) * 100);
  const isUrgent = (duel?.timer ?? 0) <= 5;
  const timerColor = (duel?.timer ?? 0) > 10 ? 'bg-amber-500' : (duel?.timer ?? 0) > 5 ? 'bg-orange-500' : 'bg-red-500';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-flat-lg border border-amber-300 overflow-hidden">
        {/* Timer bar */}
        <div className="w-full h-1.5 bg-slate-100">
          <div className={`h-full ${timerColor} transition-all duration-1000 ease-linear`} style={{ width: `${timerPct}%` }} />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-100 border border-amber-300 flex items-center justify-center text-2xl">⚔️</div>
              <div>
                <h2 className="text-xl font-extrabold text-amber-700 tracking-wide uppercase font-mono-tech">Duel 1v1!</h2>
                <p className="text-slate-500 text-xs mt-0.5">
                  <span className="text-red-600 font-bold">{duel.provocateur}</span>
                  <span className="mx-2 text-slate-400">VS</span>
                  <span className="text-slate-800 font-bold">{duel.citizen}</span>
                </p>
              </div>
            </div>

            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              isUrgent ? 'border-red-300 bg-red-50 animate-pulse' : 'border-amber-200 bg-amber-50'
            }`}>
              <Timer size={15} className={isUrgent ? 'text-red-500' : 'text-amber-600'} />
              <span className={`text-2xl font-bold font-mono-tech ${isUrgent ? 'text-red-600' : 'text-amber-700'}`}>
                {duel.timer}s
              </span>
            </div>
          </div>

          {isCombatant ? (
            <div className="space-y-4">
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-amber-100 text-amber-700 rounded-md text-[10px] font-bold tracking-wider uppercase mb-2 border border-amber-300">
                  <Zap size={10} />
                  Soal Rebutan Kilat
                </span>
                <h3 className="text-base font-semibold leading-relaxed text-slate-800">{duel.question.question}</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                {duel.question.options.map((opt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={submitted}
                    className={`p-3.5 rounded-xl border text-left text-sm transition-all active:scale-[0.98] ${
                      selected === idx
                        ? 'bg-amber-50 border-amber-400 text-amber-800 font-semibold'
                        : submitted
                        ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'bg-white border-slate-200 text-slate-700 hover:border-amber-300 hover:bg-amber-50'
                    }`}
                  >
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-xs mr-3 font-semibold font-mono border border-slate-200">
                      {String.fromCharCode(65 + idx)}
                    </span>
                    {opt}
                  </button>
                ))}
              </div>

              <button
                onClick={handleSubmit}
                disabled={selected === null || submitted}
                className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  selected !== null && !submitted
                    ? 'bg-amber-500 text-white hover:bg-amber-600 active:scale-[0.99]'
                    : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                {submitted ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Menunggu lawan...</>
                ) : (
                  <><Swords size={14} /> Kunci Jawaban!</>
                )}
              </button>

              {submitted && (
                <p className="text-center text-xs text-amber-600 font-semibold">
                  ⚡ Jawaban terkirim! Menentukan pemenang...
                </p>
              )}
            </div>
          ) : (
            <div className="py-8 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-4">
              <div className="text-4xl">🥊</div>
              <div>
                <h3 className="text-lg font-bold text-slate-700">Duel Sedang Berlangsung!</h3>
                <p className="text-sm text-slate-500 max-w-xs mx-auto mt-1 leading-relaxed">
                  Duel antara <strong className="text-red-600">{duel.provocateur}</strong> dan <strong className="text-slate-800">{duel.citizen}</strong> sedang memanas...
                </p>
              </div>
              <span className="inline-block px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-semibold text-slate-500">
                Menonton sebagai penonton
              </span>
              <div className="mx-6 p-3 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 text-left">
                <span className="font-semibold text-slate-700">Soal:</span> {duel.question.question}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
