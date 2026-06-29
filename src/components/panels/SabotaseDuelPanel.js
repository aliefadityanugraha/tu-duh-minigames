import React from 'react';
import { ShieldAlert, Swords, Clock, Lock } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { PLAYER_COLORS } from '@shared/constants';

export default function SabotaseDuelPanel({
  room, selfId, duelCooldownRemaining,
  onTriggerSabotage, onTriggerDuel,
  sabotageBlocked, duelBlocked, hasCooldown, livingCitizens,
  duelTargetId, setDuelTargetId
}) {
  const { skinList } = useSocket();
  return (
    <div className="px-4 pb-6 flex flex-col gap-5">
      {/* --- BAGIAN SABOTASE --- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#22005c] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000]">
            <ShieldAlert size={14} className="text-[#ffb4ab]" />
            <span className="font-rubik italic text-[#ffb4ab] text-[11px] sm:text-xs font-black tracking-widest uppercase">Aksi Khusus</span>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-[#4f4632]" />
        </div>

        <button
          onClick={onTriggerSabotage}
          disabled={sabotageBlocked}
          className={`relative flex items-center gap-3 sm:gap-4 px-4 py-3 sm:py-4 border-[3px] sm:border-4 border-black transition-all overflow-hidden ${sabotageBlocked
              ? 'bg-[#1e004e] opacity-60 cursor-not-allowed'
              : 'bg-gradient-to-br from-[#ffb4ab] via-[#ff8c82] to-[#ff5e5e] cursor-pointer shadow-[4px_4px_0px_#000000] hover:shadow-[6px_6px_0px_#000000] hover:-translate-y-0.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
            }`}
        >
          {/* Efek Garis Miring Background (jika aktif) */}
          {!sabotageBlocked && (
            <div className="absolute inset-0 opacity-10 bg-[repeating-linear-gradient(45deg,transparent,transparent_10px,#000_10px,#000_20px)] pointer-events-none" />
          )}

          <div className={`p-2 border-[3px] border-black shrink-0 relative z-10 ${sabotageBlocked ? 'bg-[#270067]' : 'bg-[#690005]'}`}>
            <ShieldAlert size={20} className={sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#ffb4ab] animate-pulse'} />
          </div>
          <div className="flex-1 text-left min-w-0 relative z-10">
            <p className={`font-rubik italic text-sm sm:text-base font-black leading-tight mb-1 ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#3b0002] drop-shadow-sm'}`}>SABOTASE WARGA</p>
            <p className={`font-mono text-[9px] sm:text-[10px] font-bold leading-tight ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#690005]'}`}>
              {sabotageBlocked ? 'Sedang Diblokir / Tidak Tersedia' : 'Kunci 1 layar Warga seketika untuk mengganggu misi mereka!'}
            </p>
          </div>
          {sabotageBlocked
            ? <Lock size={16} className="text-[#9c8f78] shrink-0" />
            : <div className="shrink-0 bg-[#690005] border-2 border-black text-[#ffb4ab] font-mono text-[10px] font-black px-2 py-1 rotate-3 shadow-[2px_2px_0px_rgba(0,0,0,1)]">SIAP</div>
          }
        </button>
      </div>

      {/* --- BAGIAN DUEL --- */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#22005c] border-2 border-black px-3 py-1.5 shadow-[2px_2px_0px_#000000]">
            <Swords size={14} className="text-[#ffc312]" />
            <span className="font-rubik italic text-[#ffc312] text-[11px] sm:text-xs font-black tracking-widest uppercase">Duel 1v1</span>
          </div>
          <div className="flex-1 border-t-2 border-dashed border-[#4f4632]" />
          {hasCooldown && (
            <span className="flex items-center gap-1 bg-[#690005] border-2 border-black text-[#ffb4ab] font-mono font-black text-[10px] py-1 px-2 shadow-[2px_2px_0px_#000000]">
              <Clock size={10} className="animate-pulse" /> {duelCooldownRemaining}s
            </span>
          )}
        </div>

        {hasCooldown ? (
          <div className="flex flex-col items-center justify-center gap-2 px-4 py-5 bg-[#22005c] border-4 border-black border-dashed opacity-80 text-center">
            <Clock size={24} className="text-[#ffc312] animate-bounce" />
            <div>
              <span className="font-rubik italic text-[#ffc312] text-xl sm:text-2xl font-black block">{duelCooldownRemaining} DETIK</span>
              <span className="font-mono text-[#9c8f78] text-[10px] sm:text-xs">Waktu jeda Duel sedang berlangsung...</span>
            </div>
          </div>
        ) : livingCitizens.length === 0 ? (
          <div className="px-4 py-5 bg-[#190047] border-4 border-black border-dashed text-center">
            <p className="font-mono text-[#9c8f78] text-xs italic font-bold">Tidak ada target.</p>
            <p className="font-mono text-[#9c8f78] text-[10px] mt-1">Semua Warga telah tumbang.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2 bg-[#13003a] border-4 border-black p-2 sm:p-3 shadow-[4px_4px_0px_#000000]">
            <p className="font-mono text-[#41e5b3] text-[9px] sm:text-[10px] uppercase tracking-widest font-bold mb-1 px-1">Pilih Target Warga:</p>
            {livingCitizens.map(target => {
              const skin = skinList.find(s => s.id === target.skinId) || skinList[0];
              const color = PLAYER_COLORS[target.colorId ?? 0];

              return (
              <div
                key={target.id}
                className={`flex items-center justify-between p-2 sm:p-3 border-[3px] border-black transition-colors cursor-pointer ${duelTargetId === target.id
                    ? 'bg-gradient-to-r from-[#ffc312] to-[#ffda6a] shadow-[2px_2px_0px_#000000]'
                    : 'bg-[#270067] hover:bg-[#330081] hover:border-[#ffc312]'
                  }`}
                onClick={() => setDuelTargetId(duelTargetId === target.id ? null : target.id)}
              >
                <div className="flex items-center gap-2 sm:gap-3 min-w-0 pr-2">
                  <div 
                    className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-black flex items-center justify-center shrink-0 overflow-hidden" 
                    style={{ backgroundColor: color }}
                  >
                    {skin.img ? <img src={skin.img} alt={skin.name} className="w-full h-full object-cover" /> : <span className="text-sm sm:text-base">👤</span>}
                  </div>
                  <span className={`font-mono text-sm sm:text-base font-black truncate ${duelTargetId === target.id ? 'text-[#190047]' : 'text-[#e9ddff]'}`}>
                    {target.name}
                  </span>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTriggerDuel(target.id);
                  }}
                  disabled={duelBlocked}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 sm:px-6 sm:py-2.5 border-[3px] border-black font-black tracking-wider transition-all shrink-0 ${duelBlocked
                      ? 'bg-[#190047] text-[#9c8f78] opacity-50 cursor-not-allowed'
                      : 'bg-[#ff5e5e] text-[#190047] shadow-[2px_2px_0px_#000000] hover:bg-[#ff8c82] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none'
                    }`}
                >
                  <Swords size={14} className="hidden sm:block" />
                  <span className="text-xs sm:text-sm">DUEL!</span>
                </button>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
