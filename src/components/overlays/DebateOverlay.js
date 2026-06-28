import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../../hooks/useSocket';
import { PLAYER_COLORS } from '../lobby/WaitingRoom';

const snappy = { type: 'spring', stiffness: 500, damping: 30 };
const punchy = { type: 'spring', stiffness: 600, damping: 20 };

export default function DebateOverlay({ debate, players, selfId, selfRole, isGuru, isPlayerDead, onVote, onSendChat }) {
  const { skinList } = useSocket();
  const [chatInput, setChatInput] = useState('');
  const [myVote, setMyVote] = useState(null);

  const chatEndRef = useRef(null);

  // Reset vote lokal setiap kali sesi debat baru dimulai
  useEffect(() => {
    setMyVote(null);
  }, [debate?.reason]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debate?.chat]);

  if (!debate) return null;

  const eligibleVoters = players.filter(p => !p.isDead && !p.isGuru);
  const votablePlayers = players.filter(p => !p.isGuru);

  // Format baru dari server: { voterIds: [...], voteCounts: { targetId: count } }
  const voterIds  = debate.votes?.voterIds  || [];
  const voteCounts = debate.votes?.voteCounts || {};
  const hasVoted  = myVote !== null || (selfId && voterIds.includes(selfId));

  const timer = debate.timer ?? 0;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = timer <= 20;

  const titleLabel = debate.reason === 'emergency_meeting'
    ? '🚨 EMERGENCY MEETING ROOM'
    : '📢 MUSYAWARAH MUFAKAT (GURU PAUSE)';

  const handleVote = (targetId) => {
    if (hasVoted || isPlayerDead || isGuru) return;
    setMyVote(targetId);
    onVote(targetId);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isGuru || isPlayerDead) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  };

  const getDotsForPlayer = (playerId) => {
    if (debate.active) return false;
    return voterIds.includes(playerId);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#190047] overflow-hidden"
    >
      {/* ── HEADER BAR ── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...snappy, delay: 0.05 }}
        className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#330081] border-b-4 border-black shrink-0"
      >
        <div className="flex items-center gap-3">
          <motion.span
            animate={{ rotate: [0, -8, 8, -4, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="text-xl md:text-2xl"
          >🚨</motion.span>
          <span className="font-rubik italic font-extrabold text-[#e9ddff] text-lg md:text-2xl tracking-[0] uppercase">
            {titleLabel}
          </span>
        </div>
        <motion.div
          animate={isUrgent ? { scale: [1, 1.1, 1] } : {}}
          transition={isUrgent ? { duration: 0.8, repeat: Infinity } : {}}
          className={`flex items-center gap-2 px-3 py-1.5 border-4 border-black ${
            isUrgent ? 'bg-[#93000a]' : 'bg-[#270067]'
          }`}
        >
          <span className="font-mono font-bold text-sm md:text-base leading-6 text-[#ffc312]">TIME LEFT:</span>
          <span className={`font-mono font-black text-lg md:text-xl leading-6 ${isUrgent ? 'text-[#ffdad6]' : 'text-[#ffc312]'}`}>
            {timeFormatted}
          </span>
        </motion.div>
      </motion.div>

      {/* ── MAIN GRID (fills remaining space) ── */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-12 min-h-0">
        {/* ══ LEFT: CHAT LOG ══ */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: 0.1 }}
          className="relative md:col-span-4 flex flex-col bg-[#22005c] md:border-r-4 border-black min-h-0"
        >
          {/* Chat Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center gap-2 px-4 py-3 bg-[#ffb4ab] border-b-4 border-black shrink-0"
          >
            <motion.span
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-xl"
            >💬</motion.span>
            <span className="font-rubik font-extrabold text-[#690005] text-base leading-6 uppercase tracking-wider">
              CHAT LOG
            </span>
            {debate.chat?.length > 0 && (
              <span className="ml-auto font-mono text-[10px] text-[#690005] font-bold opacity-60">
                {debate.chat.length} pesan
              </span>
            )}
          </motion.div>

          {/* Messages — scrollable */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {(!debate.chat || debate.chat.length === 0) && (
              <div className="text-sm font-mono text-[#e9ddff]/40 w-full text-center mt-8 italic">
                Belum ada pesan... Mulai diskusi!
              </div>
            )}
            <AnimatePresence initial={false}>
              {debate.chat && debate.chat.map((c, idx) => {
                const isMe = c.senderId === selfId;
                const isProvokatorMe = isMe && selfRole === 'provokator';
                const bgClass = isMe ? 'bg-[#00c899]' : 'bg-[#190047]';
                const nameColor = isMe ? 'text-[#004d39]' : 'text-[#ffb4ab]';
                const textColor = isMe ? 'text-[#004d39]' : 'text-[#e9ddff]';
                const nameDisplay = isMe ? 'YOU (ME)' : c.senderName;

                return (
                  <motion.div
                    key={`${c.senderId}-${idx}`}
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ ...snappy }}
                    className={`flex w-full ${isMe ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`${bgClass} inline-flex flex-col max-w-[88%] items-start gap-1 p-2.5 border-2 border-solid border-black`}>
                      <div className={`font-mono font-bold text-xs ${nameColor}`}>
                        {nameDisplay}
                        {isProvokatorMe && <span className="text-red-900 text-[10px] ml-1">(Provokator)</span>}
                      </div>
                      <p className={`text-sm leading-5 ${textColor} break-words whitespace-pre-wrap`}>
                        {c.message}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="shrink-0 p-2 bg-black border-t-4 border-black">
            {isGuru || isPlayerDead ? (
              <div className="px-3 py-2.5 bg-[#270067] border-2 border-[#ffc312] text-center font-mono text-sm text-gray-400 opacity-60">
                {isGuru ? "Guru memantau diskusi..." : "Arwah tidak bisa chat..."}
              </div>
            ) : (
              <form onSubmit={handleChatSubmit} className="flex items-center gap-2 p-2 bg-[#270067] border-2 border-[#ffc312] focus-within:bg-[#3d00a3] transition-colors">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  placeholder="TYPE DEFENSE..."
                  maxLength={100}
                  className="flex-1 bg-transparent border-none outline-none font-mono text-gray-200 text-sm placeholder-gray-500"
                />
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-3 py-1 bg-[#ffc312] text-[#3f2e00] border-2 border-black font-mono font-bold text-[10px] uppercase tracking-wider"
                >
                  Kirim
                </motion.button>
              </form>
            )}
          </div>
        </motion.div>

        {/* ══ RIGHT: VOTING AREA ══ */}
        <div className="relative md:col-span-8 flex flex-col bg-[#190047] min-h-0">
          {/* Voting Header */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="flex items-center justify-between px-4 md:px-6 py-3 bg-[#190047] border-b-4 border-black shrink-0"
          >
            <div className="font-rubik font-extrabold text-[#e9ddff] text-sm md:text-lg uppercase tracking-wider">
              WHO IS THE PROVOKATOR?
            </div>
            <div className="flex items-center gap-2 font-mono text-[10px] text-[#9c8f78] uppercase tracking-wider">
              <span>{eligibleVoters.length} pemilih</span>
              {Object.keys(debate.votes || {}).length > 0 && (
                <span className="text-[#5ffcc9]">· {Object.keys(debate.votes).length} suara masuk</span>
              )}
            </div>
          </motion.div>

          {/* Voting Grid — fills remaining space */}
          <div className="flex-1 overflow-y-auto p-3 md:p-5 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4">
              {votablePlayers.map((p, i) => {
                const isSelf = p.id === selfId;
                const isDead = p.isDead;
                const iVotedForThis = myVote === p.id;
                const disabled = hasVoted || isPlayerDead || isGuru || isDead || isSelf;
                const hasVotedStatus = getDotsForPlayer(p.id);
                const skin = skinList.find(s => s.id === p.skinId) ?? skinList[0];

                // Gunakan voteCounts dari server (format baru yang anonim)
                const voteCount = voteCounts[p.id] || 0;
                const color = PLAYER_COLORS[p.colorId ?? 0];

                return (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, scale: 0.7, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ ...snappy, delay: 0.2 + i * 0.04 }}
                    whileHover={!isDead ? { scale: 1.04 } : {}}
                    className={`pb-4 flex flex-col items-center border-4 border-black overflow-hidden ${
                      isDead ? 'bg-[#190047] opacity-50 grayscale' :
                      isSelf ? 'bg-gradient-to-b from-[#00c899] to-[#190047]' :
                      'bg-[#40009d]'
                    }`}
                  >
                    {/* Avatar — full-width, square, fills top of card */}
                    <motion.div
                      animate={isDead ? {} : { scale: [1, 1.03, 1] }}
                      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative w-full aspect-square border-b-4 border-black overflow-hidden flex items-center justify-center"
                      style={{ backgroundColor: skin.bg }}
                    >
                      {isDead ? (
                        <span className="text-4xl md:text-5xl">💀</span>
                      ) : (
                        <img
                          src={skin.img}
                          alt={skin.name}
                          className="w-full h-full object-contain scale-110"
                        />
                      )}

                      {/* Vote count badge — top right corner */}
                      {voteCount > 0 && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={snappy}
                          className="absolute top-1 right-1 min-w-[22px] h-[22px] flex items-center justify-center bg-[#93000a] border-2 border-black font-mono font-black text-white text-[11px] px-1 shadow-[2px_2px_0px_#000]"
                        >
                          {voteCount}🗳
                        </motion.div>
                      )}
                    </motion.div>

                    {/* Name */}
                    <div className="font-mono text-[#e9ddff] text-[11px] md:text-sm text-center mt-2 mb-1 truncate w-full px-2 font-bold">
                      {p.name}
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-col items-center gap-1 mb-3 min-h-[20px]">
                      {isSelf && (
                        <div className="text-[9px] text-black bg-white border border-black px-1.5 py-0.5 font-bold">
                          YOU (ME)
                        </div>
                      )}
                      {isDead && (
                        <div className="text-[9px] text-red-300 font-bold font-mono">☠ ELIMINATED</div>
                      )}
                      {hasVotedStatus && !isDead && !isSelf && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-1 text-[9px] text-[#5ffcc9] font-bold font-mono"
                        >
                          <div className="w-2 h-2 bg-[#5ffcc9] rounded-full" />
                          SUDAH VOTE
                        </motion.div>
                      )}
                    </div>

                    {/* Vote Button */}
                    {!isDead && !isSelf && (
                      <motion.button
                        onClick={() => handleVote(p.id)}
                        disabled={disabled}
                        whileHover={!disabled ? { scale: 1.05 } : {}}
                        whileTap={!disabled ? { scale: 0.93 } : {}}
                        transition={punchy}
                        className={`w-full mx-0 flex items-center justify-center gap-1 py-2.5 border-4 border-black shadow-[4px_4px_0px_#000000] ${
                          iVotedForThis
                            ? 'bg-[#ffc312] text-[#3f2e00] font-black'
                            : disabled
                            ? 'bg-[#4f4632] text-gray-400 cursor-not-allowed'
                            : 'bg-[#ffb4ab] text-[#690005] hover:bg-[#ff8f82] cursor-pointer'
                        }`}
                      >
                        <span className="font-mono text-sm font-bold leading-6">
                          {iVotedForThis ? '🗳 VOTED' : 'VOTE ⚡'}
                        </span>
                      </motion.button>
                    )}
                    {!isDead && isSelf && (
                      <div className="w-full flex items-center justify-center gap-1 py-2.5 border-4 border-black bg-[#4f4632] text-gray-400 font-mono text-[10px] font-bold text-center">
                        🚫 CANNOT VOTE SELF
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Footer / Skip Vote */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="shrink-0 px-4 md:px-6 py-3 bg-[#330081] border-t-4 border-black"
          >
            {isPlayerDead ? (
              <div className="w-full bg-[#190047] border-4 border-black py-3 text-center text-[#ffb4ab] font-mono text-sm font-bold">
                💀 GHOSTS CANNOT VOTE
              </div>
            ) : isGuru ? (
              <div className="w-full bg-[#190047] border-4 border-black py-3 text-center text-[#5ffcc9] font-mono text-sm font-bold">
                🛡️ GURU MEMANTAU PROSES MUSYAWARAH
              </div>
            ) : (
              <motion.button
                onClick={() => handleVote('skip')}
                disabled={hasVoted}
                whileHover={!hasVoted ? { scale: 1.02 } : {}}
                whileTap={!hasVoted ? { scale: 0.96 } : {}}
                transition={punchy}
                className={`w-full flex items-center justify-center gap-2 py-3 border-4 border-black shadow-[6px_6px_0px_#000000] ${
                  myVote === 'skip'
                    ? 'bg-[#ffc312] text-[#3f2e00]'
                    : hasVoted
                    ? 'bg-[#3d2a00] text-gray-400 cursor-not-allowed'
                    : 'bg-[#4f4632] text-[#e9ddff] hover:bg-[#685c42] cursor-pointer'
                }`}
              >
                <span className="font-rubik font-extrabold text-sm md:text-base uppercase tracking-wider">
                  {myVote === 'skip' ? '✅ SKIPPED VOTE' : '⏭️ SKIP VOTE'}
                </span>
              </motion.button>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}