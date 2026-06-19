import React, { useState } from 'react';
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

// Form login/join room — dipakai di halaman index.js
export default function LoginForm({ onSubmit, error, loading }) {
  const [name, setName]         = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [activeModal, setActiveModal] = useState(null); // 'buat' | 'gabung' | null

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

  const lobbyNavItems = [
    { label: 'Lobby', icon: '🛸', active: true },
  ];

  const navRightContent = (
    <div className="flex items-center gap-2">
      <span className="neo-badge bg-[#270067] text-[#5ffcc9] border-[#000000] text-xs py-1 px-3">VERSI 1.0.0</span>
      {/* <span className="neo-badge bg-[#ffc312] text-[#6e5200] border-[#000000] text-xs py-1 px-3 hidden sm:inline-flex">🇮🇩 PANCASILA</span> */}
    </div>
  );

  return (
    <div className="flex-1 flex flex-col justify-between w-full min-h-screen relative z-10">
      
      {/* ── TOP BAR (Global Navbar) ── */}
      {/* <Navbar navItems={lobbyNavItems} rightContent={navRightContent} /> */}
      <Navbar rightContent={navRightContent} />

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-4 py-12 md:py-20 max-w-4xl mx-auto w-full z-0">
        
        {/* Title / Logo */}
        <div className="flex flex-col items-center relative mb-4">
          <div className="flex w-full max-w-[726.2px] items-center flex-col relative">
            
            {/* Logo TU-DUH! */}
            <div className="font-rubik font-bold italic text-[#ffc312] text-7xl sm:text-8xl md:text-[180px] tracking-[-4px] sm:tracking-[-6px] md:tracking-[-9px] leading-none flex items-center select-none drop-shadow-[8px_8px_0px_#000000] md:drop-shadow-[12px_12px_0px_#000000] mb-2 sm:mb-4">
              TU-DUH!
            </div>
            
            {/* Subtitle Rotated */}
            <div className="flex items-center justify-center px-6 py-2 bg-[#00000066] rounded-lg border-2 border-solid border-black rotate-[-2.00deg] shadow-[6px_6px_0px_#000000] backdrop-blur-[2px] backdrop-brightness-[100%] max-w-sm sm:max-w-md md:max-w-none">
              <span className="font-rubik text-[#5ffcc9] text-base sm:text-xl md:text-[32px] text-center tracking-[0] leading-none whitespace-nowrap select-none">
                SIAP MAIN? GASKEUN!
              </span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row w-full max-w-2xl gap-4 md:gap-6 px-4">
          {/* BUAT ROOM Button (Guru) */}
          <button
            onClick={() => {
              setActiveModal('buat');
              setName('');
            }}
            className="flex items-center justify-center gap-3 px-8 py-5 bg-[#ffc312] text-[#6e5200] rounded-full border-4 border-solid border-black shadow-[6px_6px_0px_#000000] md:shadow-[10px_10px_0px_#000000] hover:shadow-neo active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-rubik text-lg md:text-xl font-black tracking-wider flex-1 cursor-pointer"
          >
            <PlusCircle size={24} strokeWidth={3} />
            <span>BUAT ROOM</span>
          </button>

          {/* GABUNG PLAY Button (Siswa) */}
          <button
            onClick={() => {
              setActiveModal('gabung');
              setName('');
              setRoomCode('');
            }}
            className="flex items-center justify-center gap-3 px-8 py-5 bg-[#41e5b3] text-[#004d39] rounded-full border-4 border-solid border-black shadow-[6px_6px_0px_#000000] md:shadow-[10px_10px_0px_#000000] hover:shadow-neo active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all font-rubik text-lg md:text-xl font-black tracking-wider flex-1 cursor-pointer"
          >
            <LogIn size={24} strokeWidth={3} />
            <span>GABUNG PLAY</span>
          </button>
        </div>

        {/* Bottom Badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mt-4 select-none">
          <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#270067] rounded-lg border-2 border-solid border-black shadow-[6px_6px_0px_#000000]">
            <Users size={18} className="text-[#5ffcc9]" />
            <span className="font-mono text-[#e9ddff] text-xs sm:text-sm md:text-base tracking-[0] whitespace-nowrap">
              12,403 ONLINE
            </span>
          </div>

          <button
            onClick={() => window.open('/stats', '_blank')}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#270067] rounded-lg border-2 border-solid border-black shadow-[6px_6px_0px_#000000] hover:bg-[#330081] transition-all cursor-pointer text-left"
          >
            <Trophy size={18} className="text-[#ffc312]" />
            <span className="font-mono text-[#e9ddff] text-xs sm:text-sm md:text-base tracking-[0] whitespace-nowrap">
              LEADERBOARD
            </span>
          </button>
        </div>
      </div>

      {/* ── FOOTER / BOTTOM NAV BAR ── */}
      <div className="w-full bg-[#330081] border-t-4 border-black shadow-[0px_-6px_0px_#000000] flex justify-around items-center py-3 px-2 z-10">
        
        {/* Menu */}
        <button className="flex items-center justify-center gap-2 px-4 py-2 bg-[#ffc312] text-[#6e5200] rounded-lg border-2 border-solid border-black font-mono text-sm md:text-base font-bold shadow-neo-sm">
          <Gamepad2 size={16} strokeWidth={2.5} />
          <span>Lobby</span>
        </button>

        {/* Tasks */}
        <a href="/game" className="flex items-center justify-center gap-2 px-4 py-2 text-[#d3c5ab] hover:text-[#e9ddff] font-mono text-sm md:text-base font-bold transition-all">
          <ClipboardList size={18} />
          <span>Tasks</span>
        </a>

        {/* Chat */}
        <button className="flex items-center justify-center gap-2 px-4 py-2 text-[#d3c5ab] hover:text-[#e9ddff] font-mono text-sm md:text-base font-bold transition-all">
          <MessageSquare size={18} />
          <span>Chat</span>
        </button>

        {/* Stats */}
        <a href="/stats" className="flex items-center justify-center gap-2 px-4 py-2 text-[#d3c5ab] hover:text-[#e9ddff] font-mono text-sm md:text-base font-bold transition-all">
          <BarChart3 size={18} />
          <span>Stats</span>
        </a>
      </div>

      {/* ── FORM POPUP MODAL (GURU / SISWA) ── */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
          <div className="neo-card-high w-full max-w-md overflow-hidden relative">
            
            {/* Top color bar */}
            <div className={`h-2 ${activeModal === 'buat' ? 'bg-[#ffc312]' : 'bg-[#41e5b3]'}`} />
            
            {/* Close button */}
            <button 
              onClick={handleCloseModal}
              className="absolute top-4 right-4 p-1 bg-black/10 hover:bg-black/20 text-white rounded-md border border-black/20 hover:border-black/30 transition-all cursor-pointer"
            >
              <X size={18} className="text-black" />
            </button>

            {/* Modal Body */}
            <div className="p-6 md:p-8 text-left">
              
              {/* Header */}
              <div className="mb-6">
                {/* <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-black text-xs font-bold uppercase tracking-wider mb-2 ${
                  activeModal === 'buat' ? 'bg-[#ffe5b3] text-[#3f2e00]' : 'bg-[#ffe1df] text-[#68000e]'
                }`}>
                  {activeModal === 'buat' ? <GraduationCap size={12} /> : <Users size={12} />}
                  {activeModal === 'buat' ? 'MODE GURU / BUAT ROOM' : 'SISWA / GABUNG PLAY'}
                </span> */}
                <h3 className="font-rubik text-2xl md:text-3xl text-white font-extrabold tracking-tight">
                  {activeModal === 'buat' ? 'Buka Room Baru' : 'Masuk Ke Room'}
                </h3>
              </div>

              {/* Error Alert inside Modal */}
              {error && (
                <div className="mb-4 p-3 bg-[#ffe1df] border-2 border-[#ffbbb7] text-[#68000e] rounded-lg text-sm font-mono font-bold flex items-center gap-2 shadow-neo-sm">
                  <span>⚠️</span>
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleFormSubmit} className="space-y-4">
                
                {/* Name Input */}
                <div className="space-y-1.5">
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
                      className="w-full bg-[#13003a] border-4 border-black rounded-lg py-3.5 pl-4 pr-16 text-white placeholder-gray-500 font-mono text-sm shadow-neo-inset focus:outline-none focus:border-[#ffc312] transition-colors"
                    />
                    <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-mono bg-black/40 px-1.5 py-0.5 rounded border border-black/40">
                      {name.length}/12
                    </span>
                  </div>
                </div>

                {/* Room Code Input (Siswa only) */}
                {activeModal === 'gabung' && (
                  <div className="space-y-1.5">
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
                        className="w-full bg-[#13003a] border-4 border-black rounded-lg py-3.5 pl-4 pr-12 text-[#ffc312] placeholder-gray-500 font-mono font-bold tracking-widest text-base uppercase shadow-neo-inset focus:outline-none focus:border-[#41e5b3] transition-colors"
                      />
                      <Key size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" />
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-lg font-rubik text-base font-black tracking-wide flex items-center justify-center gap-2 text-black border-4 border-black shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:shadow-neo-md transition-all cursor-pointer ${
                      activeModal === 'buat' ? 'bg-[#ffc312] hover:bg-[#ffe5b3]' : 'bg-[#41e5b3] hover:bg-[#5ffcc9]'
                    } ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>{activeModal === 'buat' ? 'BUAT ROOM SEKARANG 🏫' : 'MASUK RUANG TUNGGU 🚀'}</span>
                      </>
                    )}
                  </button>

                  {/* <button
                    type="button"
                    onClick={handleCloseModal}
                    disabled={loading}
                    className="w-full py-2 bg-transparent hover:bg-white/5 text-[#d3c5ab] hover:text-white font-mono text-xs font-bold transition-colors underline cursor-pointer"
                  >
                    Batal / Kembali
                  </button> */}
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
