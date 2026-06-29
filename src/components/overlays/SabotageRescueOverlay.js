import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Timer } from 'lucide-react';
import { snappy, punchy, DEFAULT_SETTINGS } from '@shared/constants';

/**
 * Overlay khusus untuk Warga yang terpilih sebagai target rescue sabotase.
 * Muncul di atas semua konten, hanya untuk 1 Warga terpilih.
 */
export default function SabotageRescueOverlay({ sabotageRescue, maxTimer = DEFAULT_SETTINGS.sabotageTimer, onSubmitAnswer }) {
  const [selected, setSelected]     = useState(null);
  const [submitted, setSubmitted]   = useState(false);

  useEffect(() => {
    setSelected(null);
    setSubmitted(false);
  }, [sabotageRescue?.question?.id]);

  if (!sabotageRescue) return null;

  const { question } = sabotageRescue;
  const timer = currentTimer !== undefined ? currentTimer : sabotageRescue.timer;
  const RESCUE_MAX  = maxTimer;
  const timerPct    = Math.min(100, Math.max(0, (timer / RESCUE_MAX) * 100));
  const isUrgent    = timer <= 10;

  const handleSubmit = () => {
    if (selected === null || submitted) return;
    setSubmitted(true);
    onSubmitAnswer(selected);
  };

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      />

      {/* Pulsing danger border */}
      <motion.div
        animate={{ borderColor: ['rgba(147,0,10,0.4)', 'rgba(147,0,10,0.8)', 'rgba(147,0,10,0.4)'] }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed inset-0 z-41 border-4 pointer-events-none"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={snappy}
          className="relative w-full max-w-xl bg-[#190047] border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000000] overflow-hidden"
        >
          {/* Timer bar */}
          <div className="w-full h-2 bg-[#270067]">
            <motion.div
              animate={{ width: `${timerPct}%` }}
              transition={{ duration: 1, ease: 'linear' }}
              className={`h-full ${isUrgent ? 'bg-[#93000a]' : 'bg-[#ff897d]'}`}
            />
          </div>

          {/* Header */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...snappy, delay: 0.1 }}
            className="flex items-center justify-between px-5 py-3 bg-[#93000a] border-b-4 border-black"
          >
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, -12, 12, -6, 0] }}
                transition={{ delay: 0.2, duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="text-2xl"
              >🚨</motion.span>
              <div>
                <span className="font-rubik italic text-[#ffdad6] text-xl font-bold leading-none">KAMU DIPILIH!</span>
                <p className="font-mono text-[#ffb4ab] text-[10px] mt-0.5">
                  Selamatkan kelas dari sabotase Provokator!
                </p>
              </div>
            </div>
            <motion.div
              animate={isUrgent ? { scale: [1, 1.15, 1] } : {}}
              transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
              className={`flex items-center gap-2 px-3 py-2 border-4 border-black ${
                isUrgent ? 'bg-[#ffdad6]' : 'bg-[#270067]'
              }`}
            >
              <Timer size={15} className={isUrgent ? 'text-[#93000a]' : 'text-[#ff897d]'} />
              <span className={`font-mono text-lg font-bold ${isUrgent ? 'text-[#93000a]' : 'text-[#ff897d]'}`}>
                {timer}s
              </span>
            </motion.div>
          </motion.div>

          {/* Body */}
          <div className="p-5 space-y-4">
            {/* Question */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...snappy, delay: 0.15 }}
              className="p-4 bg-[#270067] border-4 border-black"
            >
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#93000a] text-[#ffdad6] border-2 border-black text-[10px] font-bold tracking-wider uppercase mb-2">
                <AlertTriangle size={10} /> SOAL PENYELAMATAN
              </span>
              <h3 className="text-base font-semibold leading-relaxed text-[#e9ddff] mt-1">{question.question}</h3>
            </motion.div>

            {/* Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {question.options.map((opt, idx) => (
                <motion.button
                  key={idx}
                  onClick={() => !submitted && setSelected(idx)}
                  disabled={submitted}
                  whileHover={!submitted ? { scale: 1.03 } : {}}
                  whileTap={!submitted ? { scale: 0.96 } : {}}
                  transition={punchy}
                  className={`p-3.5 border-4 text-left text-sm flex items-start gap-3 ${
                    selected === idx
                      ? 'bg-[#93000a] border-[#ffdad6] text-[#ffdad6] font-semibold shadow-[4px_4px_0px_#000]'
                      : submitted
                      ? 'bg-[#13003a] border-[#4f4632] text-[#9c8f78] cursor-not-allowed'
                      : 'bg-[#270067] border-black text-[#e9ddff] hover:bg-[#330081] shadow-[3px_3px_0px_#000] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]'
                  }`}
                >
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-[#190047] border-2 border-black text-xs font-semibold font-mono flex-shrink-0"
                    style={{ color: selected === idx ? '#ffc312' : '#d3c5ab' }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="flex-1">{opt}</span>
                </motion.button>
              ))}
            </div>

            {/* Submit */}
            <motion.button
              onClick={handleSubmit}
              disabled={selected === null || submitted}
              whileHover={selected !== null && !submitted ? { scale: 1.02 } : {}}
              whileTap={selected !== null && !submitted ? { scale: 0.96 } : {}}
              transition={punchy}
              className={`w-full py-3.5 border-4 font-bold text-sm flex items-center justify-center gap-2 ${
                selected !== null && !submitted
                  ? 'bg-[#ffc312] text-[#3f2e00] border-black shadow-[4px_4px_0px_#000] cursor-pointer'
                  : 'bg-[#13003a] text-[#9c8f78] border-[#4f4632] cursor-not-allowed'
              }`}
            >
              {submitted ? (
                <><div className="w-4 h-4 border-2 border-[#ffc312] border-t-transparent rounded-full animate-spin" /> Mengirim...</>
              ) : (
                '🚨 KIRIM JAWABAN PENYELAMATAN!'
              )}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
}
