import React from 'react';
import { motion } from 'framer-motion';
import { Timer } from 'lucide-react';

const snappy = { type: 'spring', stiffness: 500, damping: 30 };

/**
 * Overlay sabotase untuk:
 * - Provokator: menunggu hasil (fase 2 sudah aktif)
 * - Guru: monitoring
 * - Warga non-target: layar terkunci (info saja)
 *
 * Warga TARGET rescue menggunakan SabotageRescueOverlay terpisah.
 */
export default function SabotageOverlay({ sabotage, role }) {
  if (!sabotage?.active || sabotage.phase !== 'warga_rescue') return null;

  const RESCUE_MAX = sabotage.maxTimer ?? 40;
  const timerPct   = Math.min(100, Math.max(0, (sabotage.timer / RESCUE_MAX) * 100));
  const isUrgent   = sabotage.timer <= 10;

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

      {/* Pulsing border frame */}
      <motion.div
        animate={{ borderColor: ['rgba(147,0,10,0.4)', 'rgba(147,0,10,0.8)', 'rgba(147,0,10,0.4)'] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed inset-0 z-40 border-4 pointer-events-none"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={snappy}
          className="relative w-full max-w-lg bg-[#190047] border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000000] overflow-hidden"
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
                transition={{ delay: 0.2, duration: 0.5, ease: 'easeInOut' }}
                className="text-2xl"
              >🚨</motion.span>
              <div>
                <span className="font-rubik italic text-[#ffdad6] text-xl font-bold leading-none">SABOTASE AKTIF!</span>
                <p className="font-mono text-[#ffb4ab] text-[10px] mt-0.5">
                  {sabotage.targetWargaName
                    ? `${sabotage.targetWargaName} sedang menyelamatkan situasi...`
                    : 'Warga terpilih sedang menjawab soal penyelamatan'}
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
              <Timer size={15} className={isUrgent ? 'text-[#93000a]' : 'text-[#ffc312]'} />
              <span className={`font-mono text-lg font-bold ${isUrgent ? 'text-[#93000a]' : 'text-[#ffc312]'}`}>
                {sabotage.timer}s
              </span>
            </motion.div>
          </motion.div>

          {/* Content per role */}
          <div className="p-5">
            {role === 'provokator' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={snappy}
                className="py-5 bg-[#270067] border-4 border-black text-center space-y-3 p-4"
              >
                <motion.span
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl block"
                >😈</motion.span>
                <span className="font-rubik italic text-[#ffb4ab] text-lg font-bold">SABOTASE BERJALAN!</span>
                <p className="font-mono text-[#d3c5ab] text-sm max-w-sm mx-auto leading-relaxed">
                  {sabotage.targetWargaName
                    ? `${sabotage.targetWargaName} sedang berjuang menjawab soal penyelamatan.`
                    : 'Warga terpilih sedang berjuang menyelamatkan situasi.'}
                  {' '}Jika gagal sebelum waktu habis, Provokator menang!
                </p>
                <span className="inline-block px-3 py-1.5 bg-[#93000a] border-2 border-black text-xs text-[#ffdad6] font-bold font-mono">
                  SISA WAKTU: {sabotage.timer} DETIK
                </span>
              </motion.div>
            )}

            {role === 'warga' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={snappy}
                className="py-5 bg-[#270067] border-4 border-[#4f4632] text-center space-y-3 p-4"
              >
                <motion.span
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl block"
                >🔒</motion.span>
                <span className="font-rubik italic text-[#e9ddff] text-lg font-bold">TUGAS ANDA TERKUNCI</span>
                <p className="font-mono text-[#d3c5ab] text-sm max-w-sm mx-auto leading-relaxed">
                  {sabotage.targetWargaName
                    ? <><strong className="text-[#41e5b3]">{sabotage.targetWargaName}</strong> sedang menyelamatkan kelas. Tunggu hingga sabotase diatasi!</>
                    : 'Seorang Warga sedang menyelamatkan kelas. Tunggu hingga sabotase diatasi!'
                  }
                </p>
              </motion.div>
            )}

            {role === 'guru' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={snappy}
                className="py-5 bg-[#270067] border-4 border-[#4f4632] text-center space-y-3 p-4"
              >
                <span className="font-rubik italic text-[#41e5b3] text-lg font-bold">🛡️ GURU MEMANTAU SABOTASE</span>
                <p className="font-mono text-[#d3c5ab] text-sm max-w-md mx-auto leading-relaxed">
                  {sabotage.targetWargaName
                    ? <><strong className="text-[#ffc312]">{sabotage.targetWargaName}</strong> sedang menjawab soal penyelamatan.</>
                    : 'Warga terpilih sedang menjawab soal penyelamatan.'
                  }
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
