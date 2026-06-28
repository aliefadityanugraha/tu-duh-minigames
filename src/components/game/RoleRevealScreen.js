import React, { useEffect, useState } from 'react';
import { SKINS, PLAYER_COLORS } from '../lobby/WaitingRoom';

export default function RoleRevealScreen({ room, player, roleInfo, onDismiss }) {
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      onDismiss();
    }
  }, [timeLeft, onDismiss]);

  const isWarga = roleInfo?.role === 'warga';
  const isProvokator = roleInfo?.role === 'provokator';

  // Warga: dark blue/greenish bg. Provokator: dark red bg.
  const bgColor = isProvokator ? 'bg-[#4a0005]' : 'bg-[#002b36]';
  const titleColor = isProvokator ? 'text-[#ff4d4d]' : 'text-[#41e5b3]';
  const titleText = isProvokator ? 'KAMU PROVOKATOR' : 'KAMU WARGA';
  const objectiveText = isProvokator
    ? 'GAGALKAN PROGRES MISI SECARA DIAM-DIAM DAN ELIMINASI PARA WARGA!'
    : 'SELESAIKAN SEMUA PROGRES MISI BERSAMA WARGA LAINNYA DAN WASPADAI PROVOKATOR!';

  // Get profiles to show
  let displayedPlayers = [];
  
  if (isProvokator) {
    // Show all provokators (using teammates array)
    const teammateIds = roleInfo?.teammates || [];
    displayedPlayers = room.players.filter(p => p.id === player.id || teammateIds.includes(p.id));
  } else {
    // Warga only sees themselves
    displayedPlayers = [player];
  }

  return (
    <>
      <style>{`
        @keyframes roleZoomIn {
          0% { transform: scale(0.5); opacity: 0; }
          60% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes roleFloat {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .animate-role-zoom {
          animation: roleZoomIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
        .animate-role-float {
          animation: roleFloat 3s ease-in-out infinite;
        }
      `}</style>
      <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center p-4 sm:p-8 animate-fadeIn ${bgColor} border-8 border-black shadow-[inset_0px_0px_100px_rgba(0,0,0,0.8)]`}>
      
      <h1 className={`font-rubik text-4xl sm:text-6xl md:text-8xl font-black italic text-center drop-shadow-[4px_4px_0px_rgba(0,0,0,1)] tracking-tighter mb-2 sm:mb-4 mt-8 sm:mt-4 ${titleColor}`}>
        {titleText}
      </h1>
      
      <p className="font-mono text-[#d3c5ab] text-sm sm:text-xl text-center max-w-xl sm:max-w-3xl font-bold mb-6 sm:mb-8 drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] bg-black/40 p-3 sm:p-4 border-2 border-black">
        {objectiveText}
      </p>

      <div className="flex flex-wrap justify-center gap-6 sm:gap-12 mb-8 sm:mb-10">
        {displayedPlayers.map((p, idx) => {
          const skin = SKINS.find(s => s.id === p.skinId) || SKINS[0];
          const color = PLAYER_COLORS[p.colorId ?? 0];
          const isMe = p.id === player?.id;

          return (
            <div 
              key={p.id} 
              className="flex flex-col items-center animate-role-zoom opacity-0" 
              style={{ animationDelay: `${idx * 0.15}s` }}
            >
              <div className="animate-role-float" style={{ animationDelay: `${idx * 0.2}s` }}>
                <div 
                  className={`w-24 h-24 sm:w-32 sm:h-32 md:w-48 md:h-48 rounded-full border-4 sm:border-8 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] flex items-center justify-center overflow-hidden mb-4`}
                  style={{ backgroundColor: color }}
                >
                  {skin.img && <img src={skin.img} alt={skin.name} className="w-full h-full object-cover" />}
                </div>
              </div>
              <span className={`font-mono font-black text-lg sm:text-2xl md:text-3xl drop-shadow-[2px_2px_0px_rgba(0,0,0,1)] ${isMe ? 'text-[#ffc312]' : 'text-white'}`}>
                {p.name} {isMe && '(Kamu)'}
              </span>
              {isProvokator && (
                <span className="font-mono text-xs sm:text-sm text-[#ff4d4d] font-bold mt-1 bg-black px-2 py-0.5 border border-black">
                  PROVOKATOR
                </span>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onDismiss}
        className="mt-8 font-mono text-xl sm:text-2xl font-black bg-[#ffc312] text-black px-8 py-4 border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)] hover:bg-[#ffe066] active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
      >
        MULAI PERMAINAN ({timeLeft})
      </button>

    </div>
    </>
  );
}
