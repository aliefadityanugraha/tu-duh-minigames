import React from 'react';
import { ShieldAlert, Swords, Clock, Lock } from 'lucide-react';

export default function SabotaseDuelPanel({
  room, selfId, duelCooldownRemaining,
  onTriggerSabotage, onTriggerDuel,
  sabotageBlocked, duelBlocked, hasCooldown, livingCitizens,
  duelTargetId, setDuelTargetId
}) {
  return (
    <div className="px-4 pb-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 bg-[#22005c] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_#000000]">
          <ShieldAlert size={12} className="text-[#ffb4ab]" />
          <span className="font-rubik italic text-[#ffb4ab] text-xs font-bold">SABOTASE</span>
        </div>
        <div className="flex-1 border-t border-[#4f4632]" />
        <div className="flex items-center gap-1.5 bg-[#22005c] border-2 border-black px-2.5 py-1 shadow-[2px_2px_0px_#000000]">
          <Swords size={12} className="text-[#ffc312]" />
          <span className="font-rubik italic text-[#ffc312] text-xs font-bold">DUEL 1v1</span>
        </div>
      </div>

      <button
        onClick={onTriggerSabotage}
        disabled={sabotageBlocked}
        className={`flex items-center gap-3 px-4 py-3 border-4 border-black transition-all ${
          sabotageBlocked
            ? 'bg-[#22005c] opacity-50 cursor-not-allowed'
            : 'bg-gradient-to-r from-[#ffb4ab] to-[#ff8c82] cursor-pointer shadow-[4px_4px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none hover:from-[#ffdad6] hover:to-[#ffb4ab]'
        }`}
      >
        <div className="p-1.5 border-2 border-black bg-[#190047] shrink-0">
          <ShieldAlert size={16} className={sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#ffb4ab] animate-pulse'} />
        </div>
        <div className="flex-1 text-left min-w-0">
          <p className={`font-rubik italic text-sm font-black leading-none mb-0.5 ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#690005]'}`}>SABOTASE WARGA</p>
          <p className={`font-mono text-[9px] font-bold ${sabotageBlocked ? 'text-[#9c8f78]' : 'text-[#93000a]'}`}>
            {sabotageBlocked ? 'Diblokir / tidak tersedia' : 'Kunci 1 layar Warga seketika!'}
          </p>
        </div>
        {sabotageBlocked
          ? <Lock size={13} className="text-[#9c8f78] shrink-0" />
          : <span className="font-mono text-[9px] font-black text-[#690005] shrink-0 border-2 border-[#690005] px-1.5 py-0.5">AKTIF</span>
        }
      </button>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-widest font-bold">Target Duel:</span>
          {hasCooldown && (
            <span className="flex items-center gap-1 bg-[#270067] border-2 border-[#ffc312] text-[#ffc312] font-mono font-black text-[9px] py-0.5 px-2">
              <Clock size={9} /> {duelCooldownRemaining}s
            </span>
          )}
        </div>

        {hasCooldown ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-[#22005c] border-4 border-[#ffc312]">
            <Clock size={18} className="text-[#ffc312] animate-bounce shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <span className="font-rubik italic text-[#ffc312] text-xl font-black">{duelCooldownRemaining}s</span>
                <span className="font-mono text-[#d3c5ab] text-[10px]">cooldown...</span>
              </div>
            </div>
          </div>
        ) : livingCitizens.length === 0 ? (
          <div className="px-4 py-3 bg-[#22005c] border-4 border-[#4f4632] text-center font-mono text-[#9c8f78] text-xs italic">
            Semua Warga telah tumbang.
          </div>
        ) : (
          <div className="flex flex-col gap-1 bg-[#13003a] border-4 border-black p-1 shadow-[4px_4px_0px_#000000]">
            {livingCitizens.map(target => (
              <div
                key={target.id}
                className={`flex items-center justify-between px-3 py-2 border-2 transition-all ${
                  duelTargetId === target.id ? 'bg-[#ffc312] border-[#ffc312]' : 'bg-[#190047] border-[#270067]'
                }`}
                onMouseEnter={() => setDuelTargetId(target.id)}
                onMouseLeave={() => setDuelTargetId(null)}
              >
                <span className="font-mono text-xs truncate text-[#e9ddff]">{target.name}</span>
                <button
                  onClick={() => onTriggerDuel(target.id)}
                  disabled={duelBlocked}
                  className="px-2 py-1 bg-[#270067] text-[#ffc312] border border-[#ffc312] text-[9px] font-bold"
                >
                  DUEL
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
