import React, { useState, useEffect } from 'react';
import { AlertTriangle, Timer } from 'lucide-react';

/**
 * Overlay khusus untuk Warga yang terpilih sebagai target rescue sabotase.
 * Muncul di atas semua konten, hanya untuk 1 Warga terpilih.
 */
export default function SabotageRescueOverlay({ sabotageRescue, maxTimer = 40, onSubmitAnswer }) {
  const [selected, setSelected]     = useState(null);
  const [submitted, setSubmitted]   = useState(false);

  // Reset saat soal berubah
  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
  }, [sabotageRescue?.question?.id]);

  if (!sabotageRescue) return null;

  const { question, timer } = sabotageRescue;
  const RESCUE_MAX  = maxTimer;
  const timerPct    = Math.min(100, Math.max(0, (timer / RESCUE_MAX) * 100));
  const isUrgent    = timer <= 10;

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    onSubmitAnswer(selected);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-red-900/30 backdrop-blur-sm">
      <div className="absolute inset-0 border-4 border-red-400/40 animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-flat-lg border-2 border-red-300 overflow-hidden animate-pulse-glow-red">
        {/* Timer bar */}
        <div className="w-full h-2 bg-red-100">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${timerPct}%` }}
          />
        </div>

        <div className="p-6 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-red-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-2xl">🆘</div>
              <div>
                <h2 className="text-xl font-extrabold text-red-700 uppercase font-mono-tech">Kamu Dipilih!</h2>
                <p className="text-red-500 text-xs mt-0.5 font-medium">
                  Selamatkan kelas dari sabotase Provokator!
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              isUrgent ? 'border-red-400 bg-red-50 animate-pulse' : 'border-red-200 bg-red-50'
            }`}>
              <Timer size={15} className="text-red-500" />
              <span className="text-2xl font-bold font-mono-tech text-red-700">{timer}s</span>
            </div>
          </div>

          {/* Soal */}
          <div className="p-4 bg-red-50 rounded-xl border border-red-200">
            <span className="inline-block px-2.5 py-0.5 bg-red-100 text-red-700 rounded-md text-[10px] font-bold tracking-wider uppercase mb-2 border border-red-300">
              🆘 Soal Penyelamatan
            </span>
            <h3 className="text-base font-semibold leading-relaxed text-slate-800">{question.question}</h3>
          </div>

          {/* Opsi */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
            {question.options.map((opt, idx) => (
              <button
                key={idx}
                onClick={() => !submitted && setSelected(idx)}
                disabled={submitted}
                className={`p-3.5 rounded-xl border text-left text-sm transition-all active:scale-[0.98] ${
                  selected === idx
                    ? 'bg-red-50 border-red-400 text-red-800 font-semibold'
                    : submitted
                    ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
                    : 'bg-white border-slate-200 text-slate-700 hover:border-red-300 hover:bg-red-50'
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
            className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all ${
              selected !== null && !submitted
                ? 'bg-red-600 text-white hover:bg-red-700 active:scale-[0.99]'
                : 'bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            {submitted ? '⏳ Mengirim...' : 'Kirim Jawaban Penyelamatan!'}
          </button>
        </div>
      </div>
    </div>
  );
}
