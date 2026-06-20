import React, { useState, useEffect, useRef } from 'react';

export default function DebateOverlay({ debate, players, selfId, selfRole, isGuru, isPlayerDead, onVote, onSendChat }) {
  const [hasVoted, setHasVoted] = useState(false);
  const [votedFor, setVotedFor] = useState(null);
  const [chatInput, setChatInput] = useState('');
  
  const chatEndRef = useRef(null);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [debate?.chat]);

  if (!debate) return null;

  const eligibleVoters = players.filter(p => !p.isDead && !p.isGuru);
  const votablePlayers = players.filter(p => !p.isGuru);
  
  // Format MM:SS for timer
  const timer = debate.timer ?? 0;
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  const timeFormatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  const title = debate.reason === 'emergency_meeting' 
    ? '🚨 EMERGENCY MEETING ROOM' 
    : '📢 MUSYAWARAH MUFAKAT (GURU PAUSE)';

  const handleVote = (targetId) => {
    if (hasVoted || isPlayerDead || isGuru) return;
    setHasVoted(true);
    setVotedFor(targetId);
    onVote(targetId);
  };

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isGuru || isPlayerDead) return;
    onSendChat(chatInput.trim());
    setChatInput('');
  };

  // Helper to count votes received visually (dots)
  const getDotsForPlayer = (playerId) => {
    // We only show that someone has voted, not who they voted for until the end.
    // Wait, the prompt says "titik tersebut muncul sebagai indikator 'Pemain ini sudah memberikan suara'".
    // So if THIS player has voted, we show a dot under their name.
    // But votes object in debate is { voterId: targetId }
    const hasThisPlayerVoted = Object.keys(debate.votes || {}).includes(playerId);
    return hasThisPlayerVoted;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      
      <div className="flex flex-col items-start gap-4 relative w-full max-w-6xl mt-auto mb-auto">
        
        {/* Header Title */}
        <div className="flex self-stretch w-full flex-col items-start relative flex-[0_0_auto]">
          <div className="relative flex items-center self-stretch font-rubik font-extrabold text-[#e9ddff] text-[24px] md:text-[32px] tracking-[0] uppercase">
            {title}
          </div>
        </div>

        {/* Main Grid Container */}
        <div className="flex flex-col md:grid md:grid-cols-12 w-full min-h-[500px] h-fit bg-[#270067] shadow-[8px_8px_0px_#000000] border-4 border-solid border-black">
          
          {/* LEFT: Chat Log Area */}
          <div className="relative md:col-[1_/_5] w-full h-[300px] md:h-full flex flex-col bg-[#22005c] md:border-r-4 border-b-4 md:border-b-0 border-black">
            
            {/* Chat Header */}
            <div className="flex items-center gap-2 p-4 bg-[#ffb4ab] border-b-4 border-black">
              <span className="text-xl">💬</span>
              <div className="font-rubik font-extrabold text-[#690005] text-base leading-6 whitespace-nowrap">
                CHAT LOG
              </div>
            </div>

            {/* Messages */}
            <div className="flex flex-col items-start gap-2 p-4 flex-1 overflow-y-auto">
              {(!debate.chat || debate.chat.length === 0) && (
                <div className="text-sm font-mono text-[#e9ddff]/50 w-full text-center mt-4">Belum ada pesan...</div>
              )}
              {debate.chat && debate.chat.map((c, idx) => {
                const isMe = c.senderId === selfId;
                const isProvokatorMe = isMe && selfRole === 'provokator';
                
                // Color coding for chat bubbles
                const bgClass = isMe ? 'bg-[#00c899]' : 'bg-[#190047]';
                const nameColor = isMe ? 'text-[#004d39]' : 'text-[#ffb4ab]';
                const textColor = isMe ? 'text-[#004d39]' : 'text-[#e9ddff]';
                const nameDisplay = isMe ? 'YOU (ME)' : c.senderName;

                return (
                  <div key={idx} className={`flex w-full flex-col relative flex-[0_0_auto] ${isMe ? 'items-end' : 'items-start'}`}>
                    <div className={`${bgClass} inline-flex flex-col max-w-[90%] items-start gap-1 p-2 border-2 border-solid border-black`}>
                      <div className={`font-mono font-bold text-xs ${nameColor}`}>
                        {nameDisplay} {isProvokatorMe && <span className="text-red-900 text-[10px]">(Provokator)</span>}
                      </div>
                      <p className={`font-hanken text-sm leading-5 ${textColor} break-words whitespace-pre-wrap`}>
                        {c.message}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="flex-col items-start p-2 bg-black border-t-4 border-black flex relative self-stretch w-full">
              {isGuru || isPlayerDead ? (
                <div className="flex items-start justify-center pt-[9px] pb-2.5 px-2 bg-[#270067] border-2 border-[#ffc312] w-full opacity-50 cursor-not-allowed">
                  <div className="font-mono text-gray-400 text-sm">{isGuru ? "Guru memantau diskusi..." : "Arwah tidak bisa chat..."}</div>
                </div>
              ) : (
                <form onSubmit={handleChatSubmit} className="flex items-start justify-center p-2 bg-[#270067] border-2 border-[#ffc312] w-full focus-within:bg-[#3d00a3]">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="TYPE DEFENSE..."
                    className="bg-transparent border-none outline-none w-full font-mono text-gray-200 text-sm placeholder-gray-500"
                    maxLength={100}
                  />
                  <button type="submit" className="hidden">Send</button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: Voting Area */}
          <div className="relative md:col-[5_/_13] w-full flex flex-col h-full">
            
            {/* Voting Header */}
            <div className="flex items-center justify-between p-4 bg-[#190047] border-b-4 border-black">
              <div className="font-rubik font-extrabold text-[#e9ddff] text-sm md:text-base leading-6">
                WHO IS THE PROVOKATOR?
              </div>
              <div className="px-4 py-1 bg-[#93000a] border-2 border-solid border-black">
                <div className={`font-mono font-bold text-[#ffdad6] text-sm md:text-base leading-6 ${timer <= 20 ? 'animate-pulse text-red-300' : ''}`}>
                  TIME LEFT: {timeFormatted}
                </div>
              </div>
            </div>

            {/* Voting Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6 p-4 md:p-6 overflow-y-auto max-h-[400px]">
              {votablePlayers.map(p => {
                const isSelf = p.id === selfId;
                const isDead = p.isDead;
                const iVotedForThis = votedFor === p.id;
                const disabled = hasVoted || isPlayerDead || isGuru || isDead;
                const hasVotedStatus = getDotsForPlayer(p.id);

                return (
                  <div key={p.id} className={`pt-2 pb-6 px-2 flex flex-col items-center border-4 border-black transition-all ${
                    isDead ? 'bg-[#190047] opacity-50 grayscale' : 
                    isSelf ? 'bg-gradient-to-t from-[#00c899] to-white opacity-90' : 
                    'bg-[#40009d]'
                  }`}>
                    {/* Avatar Box */}
                    <div className="flex flex-col w-12 h-12 md:w-16 md:h-16 items-start justify-center mb-2 bg-[#ffb4ab] border-4 border-black">
                       <span className="w-full text-center text-xl md:text-3xl">{isDead ? '💀' : '🧑‍🚀'}</span>
                    </div>

                    {/* Name */}
                    <div className="font-mono text-[#e9ddff] text-xs md:text-sm tracking-[0.70px] leading-[14px] text-center mb-2 truncate w-full px-1">
                      {p.name}
                      {isSelf && <div className="text-[10px] text-black bg-white/50 px-1 mt-1 rounded inline-block">YOU (ME)</div>}
                      {isDead && <div className="text-[10px] text-red-300 mt-1">ELIMINATED</div>}
                    </div>

                    {/* Voting Dot Indicator (shows if this player has submitted their vote) */}
                    <div className="flex gap-1 h-3 mb-4">
                      {hasVotedStatus && !isDead && (
                        <div className="w-2 h-2 bg-[#5ffcc9] rounded-full" title="Pemain ini sudah memberikan suara" />
                      )}
                    </div>

                    {/* Vote Button */}
                    {!isDead && (
                      <button 
                        onClick={() => handleVote(p.id)}
                        disabled={disabled}
                        className={`w-full flex items-center justify-center gap-1 p-2 border-2 border-black shadow-[4px_4px_0px_#000000] transition-transform active:translate-y-1 active:shadow-none ${
                          iVotedForThis ? 'bg-[#ffc312] text-black font-black' :
                          disabled ? 'bg-gray-600 text-gray-400 cursor-not-allowed' :
                          'bg-[#ffb4ab] text-[#690005] hover:bg-[#ff8f82]'
                        }`}
                      >
                        <span className="font-mono text-sm md:text-base font-bold leading-6">
                          {iVotedForThis ? 'VOTED' : 'VOTE'}
                        </span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Footer / Skip Vote */}
            <div className="mt-auto p-4 bg-[#330081] border-t-4 border-black">
              {isPlayerDead ? (
                <div className="w-full bg-[#190047] border-4 border-black p-3 text-center text-[#ffb4ab] font-mono text-sm font-bold shadow-[4px_4px_0px_#000000]">
                  GHOSTS CANNOT VOTE
                </div>
              ) : isGuru ? (
                <div className="w-full bg-[#190047] border-4 border-black p-3 text-center text-[#5ffcc9] font-mono text-sm font-bold shadow-[4px_4px_0px_#000000]">
                  GURU MEMANTAU PROSES MUSYAWARAH
                </div>
              ) : (
                <button 
                  onClick={() => handleVote('skip')}
                  disabled={hasVoted}
                  className={`w-full flex items-center justify-center gap-2 p-3 border-4 border-black shadow-[6px_6px_0px_#000000] transition-transform active:translate-y-1 active:shadow-none ${
                    votedFor === 'skip' ? 'bg-[#ffc312] text-black' :
                    hasVoted ? 'bg-[#4f4632] text-gray-400 cursor-not-allowed' :
                    'bg-[#4f4632] text-[#e9ddff] hover:bg-[#685c42]'
                  }`}
                >
                  <span className="font-rubik font-extrabold text-sm md:text-base uppercase tracking-wider">
                    {votedFor === 'skip' ? 'SKIPPED VOTE' : 'SKIP VOTE'}
                  </span>
                  <span className="text-xl">⏭️</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
