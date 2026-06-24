import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Swords, Timer, Zap } from 'lucide-react';

const snappy = { type: 'spring', stiffness: 500, damping: 30 };
const punchy = { type: 'spring', stiffness: 600, damping: 20 };

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

  const DUEL_MAX = duel?.maxTimer ?? duel?.timer ?? 20;
  const timerPct = DUEL_MAX > 0 ? Math.max(0, ((duel?.timer ?? 0) / DUEL_MAX) * 100) : 0;
  const isUrgent = (duel?.timer ?? 0) <= 5;

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
              className={`h-full ${isUrgent ? 'bg-[#93000a]' : (duel?.timer ?? 0) > 10 ? 'bg-[#ffc312]' : 'bg-[#ff897d]'}`}
            />
          </div>

          {/* Header */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...snappy, delay: 0.1 }}
            className="flex items-center justify-between px-5 py-3 bg-[#ffc312] border-b-4 border-black"
          >
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, -15, 15, -8, 0] }}
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeInOut' }}
                className="text-2xl"
              >⚔️</motion.span>
              <div>
                <span className="font-rubik italic text-[#3f2e00] text-xl font-bold leading-none">DUEL 1v1!</span>
                <p className="font-mono text-[#6e5200] text-[10px] mt-0.5">
                  <span className="text-[#93000a] font-bold">{duel.provocateur}</span>
                  <span className="mx-2 text-[#3f2e00]">VS</span>
                  <span className="text-[#190047] font-bold">{duel.citizen}</span>
                </p>
              </div>
            </div>
            <motion.div
              animate={isUrgent ? { scale: [1, 1.15, 1] } : {}}
              transition={isUrgent ? { duration: 0.6, repeat: Infinity } : {}}
              className={`flex items-center gap-2 px-3 py-2 border-4 border-black ${
                isUrgent ? 'bg-[#93000a]' : 'bg-[#270067]'
              }`}
            >
              <Timer size={15} className={isUrgent ? 'text-[#ffdad6]' : 'text-[#ffc312]'} />
              <span className={`font-mono text-lg font-bold ${isUrgent ? 'text-[#ffdad6]' : 'text-[#ffc312]'}`}>
                {duel.timer}s
              </span>
            </motion.div>
          </motion.div>

          {/* Content */}
          <div className="p-5 space-y-4">
            {isCombatant ? (
              <>
                {/* Question card */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...snappy, delay: 0.15 }}
                  className="p-4 bg-[#270067] border-4 border-black"
                >
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-[#ffc312] text-[#3f2e00] border-2 border-black text-[10px] font-bold tracking-wider uppercase mb-2">
                    <Zap size={10} /> SOAL REBUTAN KILAT
                  </span>
                  <h3 className="text-base font-semibold leading-relaxed text-[#e9ddff] mt-1">{duel.question.question}</h3>
                </motion.div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                  {duel.question.options.map((opt, idx) => (
                    <motion.button
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      disabled={submitted}
                      whileHover={!submitted ? { scale: 1.03 } : {}}
                      whileTap={!submitted ? { scale: 0.96 } : {}}
                      transition={punchy}
                      className={`p-3.5 border-4 text-left text-sm flex items-start gap-3 ${
                        selected === idx
                          ? 'bg-[#ffc312] border-[#3f2e00] text-[#3f2e00] font-semibold shadow-[4px_4px_0px_#000]'
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

                {/* Submit button */}
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
                    <><div className="w-4 h-4 border-2 border-[#ffc312] border-t-transparent rounded-full animate-spin" /> Menunggu lawan...</>
                  ) : (
                    <><Swords size={14} /> KUNCI JAWABAN!</>
                  )}
                </motion.button>

                {submitted && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-xs text-[#ffc312] font-bold font-mono"
                  >
                    ⚡ Jawaban terkirim! Menentukan pemenang...
                  </motion.p>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={snappy}
                className="py-6 bg-[#270067] border-4 border-black text-center space-y-3 p-4"
              >
                <motion.span
                  animate={{ rotate: [0, -10, 10, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl block"
                >🥊</motion.span>
                <div>
                  <span className="font-rubik italic text-[#e9ddff] text-lg font-bold">DUEL SEDANG BERLANGSUNG!</span>
                  <p className="font-mono text-[#d3c5ab] text-sm mt-1 max-w-xs mx-auto leading-relaxed">
                    Duel antara <strong className="text-[#93000a]">{duel.provocateur}</strong> dan <strong className="text-[#41e5b3]">{duel.citizen}</strong> sedang memanas...
                  </p>
                </div>
                <span className="inline-block px-3 py-1.5 bg-[#190047] border-2 border-black text-[10px] font-bold text-[#9c8f78] font-mono uppercase tracking-wider">
                  Menonton sebagai penonton
                </span>
                <div className="p-3 bg-[#190047] border-2 border-[#4f4632] text-[11px] text-[#d3c5ab] text-left font-mono">
                  <span className="font-bold text-[#ffc312]">Soal:</span> {duel.question.question}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
