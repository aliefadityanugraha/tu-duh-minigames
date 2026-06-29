import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, WifiOff, Users } from 'lucide-react';
import { PLAYER_COLORS } from '@shared/constants';

export default function RoleRevealOverlay({ role, isGuru, player, room, teammates, skinList, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(3);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    if (isGuru) {
      onCompleteRef.current();
      return;
    }

    if (timeLeft <= 0) {
      onCompleteRef.current();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isGuru]);

  if (isGuru) return null;

  const isWarga = role === 'warga';
  const isProvokator = role === 'provokator';

  const characterInfo = skinList?.find((s) => s.id === player?.skinId) || skinList?.[0];
  const charImage = characterInfo?.img || '/images/characters/default.png';
  const slotColor = PLAYER_COLORS[player?.colorId ?? 0] || '#ffc312';

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 bg-indigo-950 flex flex-col items-center justify-center overflow-hidden"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Full Screen Container */}
        <div className="w-full h-full relative flex flex-col justify-center items-center overflow-hidden">

          {isWarga && (
            <motion.div
              className="w-full h-full p-6 md:p-8 relative bg-[#00b894] flex flex-col justify-center items-center overflow-hidden z-10"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            >
              <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#006266] to-transparent to-70%"></div>

              {/* Background Icon Watermark */}
              <div className="absolute pt-6 left-[-100px] bottom-[-100px] origin-top-left -rotate-12 opacity-10 flex flex-col justify-start items-start pointer-events-none text-[#006266]">
                <Shield size={600} strokeWidth={1} />
              </div>

              <motion.div
                className="relative z-10 flex flex-col items-center gap-4 md:gap-6 max-w-[600px] w-full text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <div
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-[6px_6px_0px_#000] md:shadow-[8px_8px_0px_#000] border-[4px] border-black flex justify-center items-center overflow-hidden relative"
                  style={{ backgroundColor: slotColor }}
                >
                  <img src={charImage} alt="Karakter Warga" className="w-[125%] h-[125%] object-contain mt-3" />
                </div>

                <div className="text-center justify-center text-black text-4xl sm:text-5xl md:text-6xl font-black font-rubik uppercase leading-tight md:leading-[1.1]">
                  KAMU WARGA BIJAK
                </div>

                <div className="px-6 py-2 bg-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] border-2 border-black inline-block">
                  <div className="text-[#5ffcc9] text-sm md:text-base font-bold font-mono uppercase leading-4 tracking-wide">
                    PELINDUNG KEBENARAN
                  </div>
                </div>

                <div className="text-[#003829] text-base md:text-lg font-extrabold font-sans leading-relaxed mt-2 bg-[#5ffcc9] px-6 py-4 rounded-xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm">
                  Selesaikan Progres Kuis dan Mini-Games, Diskusikan Keanehan,<br />Singkirkan Provokator!
                </div>
              </motion.div>
            </motion.div>
          )}

          {isProvokator && (
            <motion.div
              className="w-full h-full p-6 md:p-8 relative bg-[#820000] flex flex-col justify-center items-center overflow-hidden z-10"
              initial={{ scale: 1.1, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', damping: 20, stiffness: 100 }}
            >
              <div className="absolute inset-0 opacity-40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#ff4757] to-transparent to-70%"></div>

              {/* Background Icon Watermark */}
              <div className="absolute pl-2.5 pt-6 right-[-50px] bottom-[-100px] origin-top-left rotate-12 opacity-20 flex flex-col justify-start items-start pointer-events-none text-[#ff4757]">
                <WifiOff size={600} strokeWidth={1} />
              </div>

              <motion.div
                className="relative z-10 flex flex-col items-center gap-4 md:gap-6 max-w-[600px] w-full text-center"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring' }}
              >
                <div
                  className="w-32 h-32 md:w-48 md:h-48 rounded-full shadow-[6px_6px_0px_#000] md:shadow-[8px_8px_0px_#000] border-[4px] border-black flex justify-center items-center overflow-hidden relative"
                  style={{ backgroundColor: slotColor }}
                >
                  <img src={charImage} alt="Karakter Provokator" className="w-[125%] h-[125%] object-contain mt-3" />
                </div>

                <div className="text-center justify-center text-[#ffb4ab] text-4xl sm:text-5xl md:text-6xl font-black font-rubik uppercase leading-tight md:leading-[1.1]">
                  KAMU PROVOKATOR
                </div>

                <div className="px-6 py-2 bg-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.3)] border-2 border-black inline-block">
                  <div className="text-[#ffb4ab] text-sm md:text-base font-bold font-mono uppercase leading-4 tracking-wide">
                    TIM PENGACAU
                  </div>
                </div>

                <div className="text-[#690005] text-base md:text-lg font-extrabold font-sans leading-relaxed mt-2 bg-[#ffb4ab] px-6 py-4 rounded-xl border-[3px] border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] max-w-sm">
                  Lakukan Sabotase untuk Mengacaukan Permainan, Eliminasi Warga dalam Duel!
                </div>

                {/* ─── Provokator Teammates ─── */}
                {room && teammates && teammates.length > 1 && (
                  <motion.div
                    className="mt-4 flex flex-col items-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, type: 'spring' }}
                  >
                    <div className="flex items-center gap-2 text-red-300 text-sm font-mono font-bold uppercase tracking-wider">
                      <Users size={16} /> TEAM PROVOKATOR
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                      {room.players
                        .filter(p => p.id === player?.id || (teammates || []).includes(p.id))
                        .map(p => {
                          const skin = skinList?.find(s => s.id === p.skinId) || skinList?.[0];
                          const color = PLAYER_COLORS[p.colorId ?? 0];
                          const isMe = p.id === player?.id;
                          return (
                            <div key={p.id} className="flex flex-col items-center gap-1">
                              <div
                                className="w-14 h-14 md:w-20 md:h-20 rounded-full border-2 border-black flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_rgba(0,0,0,1)] relative"
                                style={{ backgroundColor: color }}
                              >
                                {skin?.img && <img src={skin.img} alt={skin.name} className="w-[125%] h-[125%] object-contain mt-2" />}
                              </div>
                              <span className="text-red-200 text-xs md:text-sm font-mono font-bold drop-shadow-[1px_1px_0px_rgba(0,0,0,1)]">
                                {p.name} {isMe && '(Kamu)'}
                              </span>
                              {isMe && (
                                <span className="text-[#ff4d4d] text-[10px] font-mono font-bold bg-black px-1.5 py-0.5 border border-black">
                                  PROVOKATOR
                                </span>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              <div className="absolute inset-0 opacity-30 bg-gradient-to-b from-black/0 from-50% to-black/10 to-50% pointer-events-none"></div>
            </motion.div>
          )}
        </div>

        {/* ─── HEADER TOP BAR ─── */}
        <div className="absolute top-0 left-0 w-full px-4 md:px-8 py-4 flex justify-between items-center z-30 pointer-events-none">
          <div className="px-4 py-2 bg-indigo-950 shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-start items-start">
            <div className="text-orange-200 text-xl md:text-3xl font-extrabold font-rubik uppercase md:leading-10">TU-DUH!</div>
          </div>
          <div className="p-2 bg-yellow-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-start items-start">
            <div className="text-yellow-900 text-xs md:text-sm font-bold font-mono uppercase leading-4 tracking-wide">
              MATCH STARTING IN: {timeLeft}S
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
