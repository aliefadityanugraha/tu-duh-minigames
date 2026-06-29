import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusCircle,
  LogIn,
  Users,
  Trophy,
  Gamepad2,
  ClipboardList,
  MessageSquare,
  BarChart3,
  X,
  Key,
  GraduationCap
} from 'lucide-react';
import Navbar from '../Navbar';
import { snappy, punchy } from '@shared/constants';

export default function LoginForm({ onSubmit, error, loading }) {
  const [name, setName]         = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeModal, setActiveModal] = useState(null);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (activeModal === 'buat') {
      onSubmit({ name: name.trim(), roomCode: '', isGuru: true });
    } else if (activeModal === 'gabung') {
      onSubmit({ name: name.trim(), roomCode: roomCode.trim().toUpperCase(), isGuru: false });
    }
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const navRightContent = (
    <div className="flex items-center gap-2">
      <span className="neo-badge bg-[#270067] text-[#5ffcc9] border-[#000000] text-xs py-1 px-3">VERSI 1.0.0</span>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...snappy, delay: 0.05 }}
      className="flex-1 flex flex-col justify-between w-full min-h-screen relative z-10"
    >
      {/* ── TOP BAR (Global Navbar) ── */}
      <Navbar rightContent={navRightContent} />

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-12 md:py-20 max-w-4xl mx-auto w-full z-0">

        {/* Title / Logo */}
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...punchy, delay: 0.15 }}
          className="flex flex-col items-center relative mb-4"
        >
          <div className="flex w-full max-w-[726.2px] items-center flex-col relative">
            {/* Logo TU-DUH! */}
            <motion.div
              animate={{ y: [0, -6, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              className="font-rubik font-bold italic text-[#ffc312] text-7xl sm:text-8xl md:text-[180px] tracking-[-4px] sm:tracking-[-6px] md:tracking-[-9px] leading-none flex items-center select-none drop-shadow-[8px_8px_0px_#000000] md:drop-shadow-[12px_12px_0px_#000000] mb-2 sm:mb-4"
            >
              TU-DUH!
            </motion.div>

            {/* Subtitle */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...snappy, delay: 0.35 }}
              className="flex items-center justify-center px-6 py-2 bg-[#00000066] rounded-lg border-2 border-solid border-black rotate-[-2.00deg] shadow-[6px_6px_0px_#000000] backdrop-blur-[2px] backdrop-brightness-[100%] max-w-sm sm:max-w-md md:max-w-none"
            >
              <span className="font-rubik text-[#5ffcc9] text-base sm:text-xl md:text-[32px] text-center tracking-[0] leading-none whitespace-nowrap select-none">
                SIAP MAIN? GASKEUN!
              </span>
            </motion.div>
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...snappy, delay: 0.4 }}
          className="flex flex-col sm:flex-row w-full max-w-2xl gap-4 md:gap-6 px-4"
        >
          {/* BUAT ROOM */}
          <motion.button
            onClick={() => { setActiveModal('buat'); setName(''); }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={punchy}
            className="flex items-center justify-center gap-3 px-8 py-5 bg-[#ffc312] text-[#6e5200] rounded-full border-4 border-solid border-black shadow-[6px_6px_0px_#000000] md:shadow-[10px_10px_0px_#000000] font-rubik text-lg md:text-xl font-black tracking-wider flex-1 cursor-pointer"
          >
            <PlusCircle size={24} strokeWidth={3} />
            <span>BUAT ROOM</span>
          </motion.button>

          {/* GABUNG PLAY */}
          <motion.button
            onClick={() => { setActiveModal('gabung'); setName(''); setRoomCode(''); }}
            whileHover={{ scale: 1.05, y: -3 }}
            whileTap={{ scale: 0.95 }}
            transition={punchy}
            className="flex items-center justify-center gap-3 px-8 py-5 bg-[#41e5b3] text-[#004d39] rounded-full border-4 border-solid border-black shadow-[6px_6px_0px_#000000] md:shadow-[10px_10px_0px_#000000] font-rubik text-lg md:text-xl font-black tracking-wider flex-1 cursor-pointer"
          >
            <LogIn size={24} strokeWidth={3} />
            <span>GABUNG PLAY</span>
          </motion.button>
        </motion.div>
      </div>

      {/* ── FORM POPUP MODAL ── */}
      <AnimatePresence>
        {activeModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
              onClick={handleCloseModal}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.85, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.85, opacity: 0, y: 30 }}
                transition={snappy}
                onClick={e => e.stopPropagation()}
                className="relative w-full max-w-md bg-[#190047] border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000000] overflow-hidden"
              >
                {/* Top color bar */}
                <div className={`h-3 ${activeModal === 'buat' ? 'bg-[#ffc312]' : 'bg-[#41e5b3]'}`} />

                {/* Close button */}
                <motion.button
                  onClick={handleCloseModal}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-lg border-2 border-black bg-[#93000a] text-white hover:bg-[#ffb4ab] hover:text-[#690005] transition-colors shadow-[2px_2px_0px_#000]"
                >
                  <X size={18} />
                </motion.button>

                {/* Modal Body */}
                <div className="p-6 md:p-8">

                  {/* Header */}
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ ...snappy, delay: 0.1 }}
                    className="mb-6"
                  >
                    <h3 className="font-rubik italic text-2xl md:text-3xl text-[#ffc312] font-extrabold tracking-tight">
                      {activeModal === 'buat' ? 'Buka Room Baru' : 'Masuk Ke Room'}
                    </h3>
                  </motion.div>

                  {/* Error Alert inside Modal */}
                  <AnimatePresence>
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        className="mb-4 p-3 bg-[#93000a] border-4 border-black text-[#ffdad6] font-mono text-xs font-bold flex items-center gap-2"
                      >
                        <span>⚠️</span>
                        <span>{error}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Form */}
                  <form onSubmit={handleFormSubmit} className="space-y-4">

                    {/* Name Input */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...snappy, delay: 0.15 }}
                      className="space-y-1.5"
                    >
                      <label className="block text-xs font-mono font-bold text-[#d3c5ab] uppercase tracking-wider">
                        Nama Panggilan
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="Masukkan nama kerenmu..."
                          maxLength={12}
                          required
                          disabled={loading}
                          className="w-full bg-[#13003a] border-4 border-black px-4 py-3.5 pr-16 text-white placeholder-[#9c8f78] font-mono text-sm focus:outline-none focus:border-[#ffc312] transition-colors"
                        />
                        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9c8f78] text-xs font-mono bg-[#270067] px-1.5 py-0.5 border-2 border-black">
                          {name.length}/12
                        </span>
                      </div>
                    </motion.div>

                    {/* Room Code Input (Siswa only) */}
                    {activeModal === 'gabung' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...snappy, delay: 0.2 }}
                        className="space-y-1.5"
                      >
                        <label className="block text-xs font-mono font-bold text-[#d3c5ab] uppercase tracking-wider">
                          Kode Room
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={roomCode}
                            onChange={e => setRoomCode(e.target.value)}
                            placeholder="Contoh: INDONE"
                            maxLength={6}
                            required
                            disabled={loading}
                            className="w-full bg-[#13003a] border-4 border-black px-4 py-3.5 pr-12 text-[#ffc312] placeholder-[#9c8f78] font-mono font-bold tracking-widest text-base uppercase focus:outline-none focus:border-[#41e5b3] transition-colors"
                          />
                          <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#9c8f78]" />
                        </div>
                      </motion.div>
                    )}

                    {/* Action Buttons */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="pt-2 flex flex-col gap-2"
                    >
                      <motion.button
                        type="submit"
                        disabled={loading}
                        whileHover={!loading ? { scale: 1.02 } : {}}
                        whileTap={!loading ? { scale: 0.96 } : {}}
                        transition={punchy}
                        className={`w-full py-4 font-rubik text-base font-black tracking-wide flex items-center justify-center gap-2 border-4 border-black shadow-[4px_4px_0px_#000000] ${
                          activeModal === 'buat'
                            ? 'bg-[#ffc312] text-[#3f2e00]'
                            : 'bg-[#41e5b3] text-[#003829]'
                        } ${loading ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {loading ? (
                          <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <span>{activeModal === 'buat' ? 'BUAT ROOM SEKARANG 🏫' : 'MASUK RUANG TUNGGU 🚀'}</span>
                        )}
                      </motion.button>
                    </motion.div>

                  </form>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
}