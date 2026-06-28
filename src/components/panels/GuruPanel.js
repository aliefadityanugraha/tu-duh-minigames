import React, { useState } from 'react';
import { MessageSquare, RotateCcw, Shield, Mic, BookOpen } from 'lucide-react';
import TaskProgressBar from '../TaskProgressBar';

export default function GuruPanel({ room, onPauseDebat, onResetGame, onTriggerTopicDebate, onEndTopicDebate, onTriggerPresentation, onEndPresentation }) {
  const [topicInput, setTopicInput] = useState('');
  const [showTopicInput, setShowTopicInput] = useState(false);

  const alivePlayers  = room.players.filter(p => !p.isGuru && !p.isDead);
  const deadPlayers   = room.players.filter(p => !p.isGuru && p.isDead);
  const provocateurs  = alivePlayers.filter(p => p.role === 'provokator');
  const citizens      = alivePlayers.filter(p => p.role === 'warga');

  const isAnyEventActive = room.sabotage?.active || room.duel?.active || room.debate?.active || room.topicDebate?.active;

  const handleTopicSubmit = () => {
    onTriggerTopicDebate(topicInput.trim());
    setTopicInput('');
    setShowTopicInput(false);
  };

  const gameTimerDisplay = room.gameTimer != null
    ? `${Math.floor(room.gameTimer / 60)}:${String(room.gameTimer % 60).padStart(2, '0')}`
    : null;

  return (
    <div className="flex flex-col h-full bg-[#190047] border-4 border-black shadow-[6px_6px_0px_#000000] rounded-xl overflow-hidden">
      
      {/* Header */}
      <div className="flex items-start justify-between px-5 py-4 bg-[#40009d] border-b-4 border-black">
        <div>
          <h2 className="font-rubik italic text-[#ffe5b3] text-2xl font-bold flex items-center gap-2">
            🏫 COMMAND CENTER
          </h2>
          <p className="font-mono text-[#d3c5ab] text-xs mt-1 uppercase tracking-wider">Moderator Dashboard</p>
        </div>
        {gameTimerDisplay && (
          <div className={`flex flex-col items-center justify-center px-4 py-2 border-4 border-black shadow-[4px_4px_0px_#000000] bg-[#13003a]`}>
            <span className="font-mono text-[#41e5b3] text-[9px] uppercase tracking-[2px] mb-1">Time Limit</span>
            <span className={`font-mono text-2xl font-black ${room.gameTimer <= 60 ? 'text-[#ffb4ab] animate-pulse' : 'text-[#ffc312]'}`}>
              {gameTimerDisplay}
            </span>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">

        {/* Status Singkat */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#003829] border-2 border-[#41e5b3] p-3 text-center flex flex-col items-center justify-center">
            <span className="font-rubik text-3xl font-black text-[#41e5b3]">{citizens.length}</span>
            <span className="font-mono text-[9px] text-[#5ffcc9] uppercase tracking-wider mt-1">Warga Hidup</span>
          </div>
          <div className="bg-[#93000a] border-2 border-[#ffb4ab] p-3 text-center flex flex-col items-center justify-center">
            <span className="font-rubik text-3xl font-black text-[#ffb4ab]">{provocateurs.length}</span>
            <span className="font-mono text-[9px] text-[#ffdad6] uppercase tracking-wider mt-1">Provokator</span>
          </div>
          <div className="bg-[#22005c] border-2 border-[#9c8f78] p-3 text-center flex flex-col items-center justify-center">
            <span className="font-rubik text-3xl font-black text-[#d3c5ab]">{deadPlayers.length}</span>
            <span className="font-mono text-[9px] text-[#9c8f78] uppercase tracking-wider mt-1">Eliminated</span>
          </div>
        </div>

        {/* Global Controls */}
        <div className="space-y-3">
          <h4 className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">AKSI MODERATOR</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Debat Voting */}
            <button
              onClick={onPauseDebat}
              disabled={isAnyEventActive}
              className={`p-4 border-4 border-black text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 ${
                isAnyEventActive
                  ? 'bg-[#270067] text-[#4f4632] cursor-not-allowed'
                  : 'bg-[#ffc312] text-[#3f2e00] hover:bg-[#ffe5b3] cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
              }`}
            >
              <MessageSquare size={16} /> PICU DEBAT KELAS
            </button>

            {/* Presentasi Random */}
            {room.presentation?.active ? (
              <button
                onClick={onEndPresentation}
                className="p-4 border-4 border-[#ffb4ab] bg-[#93000a] text-[#ffdad6] text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 hover:bg-[#ffb4ab] hover:text-[#690005] cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <Mic size={16} /> AKHIRI PRESENTASI
              </button>
            ) : (
              <button
                onClick={onTriggerPresentation}
                disabled={isAnyEventActive}
                className={`p-4 border-4 border-black text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 ${
                  isAnyEventActive
                    ? 'bg-[#270067] text-[#4f4632] cursor-not-allowed'
                    : 'bg-[#ffc312] text-[#3f2e00] hover:bg-[#ffe5b3] cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                }`}
              >
                <Mic size={16} /> PRESENTASI ACAK
              </button>
            )}
          </div>

          {/* Debat Topik Khusus */}
          {room.topicDebate?.active ? (
            <div className="p-4 bg-[#003829] border-2 border-[#41e5b3] flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <BookOpen size={20} className="text-[#41e5b3] flex-shrink-0" />
                <div className="flex-1">
                  <span className="block font-mono text-[#5ffcc9] text-[10px] uppercase tracking-wider mb-1">Debat Topik Aktif</span>
                  <strong className="font-rubik text-[#e9ddff] text-base leading-tight">"{room.topicDebate.topic}"</strong>
                </div>
                <span className="font-mono text-[#ffc312] text-xl font-black bg-[#13003a] p-2 border-2 border-black">
                  {room.topicDebate.totalTimer}s
                </span>
              </div>
              <button
                onClick={onEndTopicDebate}
                className="w-full py-2 bg-[#ff4d4d] border-2 border-black text-white font-mono text-xs font-bold hover:bg-[#ff7675] shadow-[2px_2px_0px_#000000] cursor-pointer"
              >
                AKHIRI DEBAT SEKARANG
              </button>
            </div>
          ) : (
            <>
              {showTopicInput ? (
                <div className="space-y-3 bg-[#22005c] p-4 border-2 border-[#4f4632]">
                  <input
                    type="text"
                    value={topicInput}
                    onChange={e => setTopicInput(e.target.value)}
                    placeholder="Ketik topik debat... (kosongkan = bebas)"
                    maxLength={150}
                    className="w-full bg-[#13003a] border-2 border-black p-3 font-mono text-[#e9ddff] text-sm focus:outline-none focus:border-[#ffc312]"
                    onKeyDown={e => e.key === 'Enter' && handleTopicSubmit()}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => setShowTopicInput(false)}
                      className="flex-1 py-3 border-2 border-[#4f4632] bg-[#190047] text-[#d3c5ab] font-mono text-xs font-bold hover:bg-[#270067] transition-all cursor-pointer"
                    >
                      BATAL
                    </button>
                    <button
                      onClick={handleTopicSubmit}
                      className="flex-[2] py-3 border-2 border-black bg-[#ffc312] text-[#3f2e00] font-mono text-xs font-bold hover:bg-[#ffe5b3] transition-all cursor-pointer shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
                    >
                      MULAI DEBAT TOPIK
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setShowTopicInput(true)}
                  disabled={isAnyEventActive}
                  className={`w-full p-4 border-4 border-black text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 ${
                    isAnyEventActive
                      ? 'bg-[#270067] text-[#4f4632] cursor-not-allowed'
                      : 'bg-[#41e5b3] text-[#003829] hover:bg-[#5ffcc9] cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                  }`}
                >
                  <BookOpen size={16} /> PICU DEBAT TOPIK KUSTOM
                </button>
              )}
            </>
          )}

          {/* Reset Game */}
          <button
            onClick={onResetGame}
            className="w-full mt-4 p-4 border-4 border-black bg-[#93000a] text-[#ffdad6] text-sm font-bold font-mono transition-all flex items-center justify-center gap-2 hover:bg-[#ffb4ab] hover:text-[#690005] cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
          >
            <RotateCcw size={16} /> KEMBALI KE LOBBY (RESET)
          </button>
        </div>

        {/* Tabel Peran */}
        <div className="space-y-3 pt-2 border-t-2 border-[#4f4632]">
          <h4 className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase flex items-center gap-2">
            <Shield size={14} /> STATUS PEMAIN (RAHASIA)
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[260px] overflow-y-auto pr-1">
            {room.players.filter(p => !p.isGuru).map(p => (
              <div
                key={p.id}
                className={`p-3 border-2 flex justify-between items-center transition-all ${
                  p.isDead
                    ? 'bg-[#13003a] border-[#4f4632] opacity-60'
                    : p.role === 'provokator'
                    ? 'bg-[#270067] border-[#ffb4ab]'
                    : 'bg-[#22005c] border-[#41e5b3]'
                }`}
              >
                <div>
                  <span className="font-mono font-bold text-[#e9ddff] text-xs block">
                    {p.name} {p.isDead && '💀'}
                  </span>
                  <span className={`font-mono text-[9px] font-bold uppercase tracking-wide ${
                    p.role === 'provokator' ? 'text-[#ffb4ab]' : 'text-[#41e5b3]'
                  }`}>
                    {p.role === 'provokator' ? '😈 PROVOKATOR' : '🇮🇩 WARGA'}
                  </span>
                  {p.duelCooldownEndsAt && (
                    <span className="block font-mono text-[9px] text-[#ffc312] mt-0.5" suppressHydrationWarning>
                      ⏳ CD DUEL {Math.max(0, Math.ceil((p.duelCooldownEndsAt - Date.now()) / 1000))}s
                    </span>
                  )}
                </div>
                <div className="text-right space-y-1 flex flex-col items-end">
                  <span className="font-mono text-[#d3c5ab] text-xs">{p.score} pt</span>
                  <span className={`neo-badge text-[8px] py-0.5 px-1.5 ${
                    p.isDead
                      ? 'bg-[#93000a] text-[#ffdad6] border-black'
                      : 'bg-[#003829] text-[#41e5b3] border-black'
                  }`}>
                    {p.isDead ? 'DEAD' : 'ALIVE'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
