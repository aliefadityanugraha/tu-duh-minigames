import React from 'react';
import { Volume2, VolumeX, LogOut, BarChart3, Radio, Monitor, Clock } from 'lucide-react';
import { useRouter } from 'next/router';
import Navbar from '../Navbar';

// Header sticky in-game
export default function GameHeader({ room, player, roleInfo, socket, muted, setMuted, statsOpen, setStatsOpen, onLeaveRoom }) {
  const router = useRouter();
  const isPlayerDead = !!player?.isDead;

  // Badge Status & Threat Level
  // const statusBadge = (
  //   <div className="hidden md:flex items-center gap-2">
  //     <div className="bg-[#41e5b3] border-2 border-black shadow-[2px_2px_0px_#000000] px-2 py-1">
  //       <span className="font-mono text-[#003829] text-xs font-bold tracking-wider">
  //         STATUS: {room?.state === 'playing' ? 'ACTIVE' : 'STANDBY'}
  //       </span>
  //     </div>
  //     <div className={`border-2 border-black shadow-[2px_2px_0px_#000000] px-2 py-1 ${room?.sabotage?.active || room?.duel?.active
  //         ? 'bg-[#ffb4ab] text-[#690005]'
  //         : 'bg-[#ffc312] text-[#3f2e00]'
  //       }`}>
  //       <span className="font-mono text-xs font-bold tracking-wider">
  //         THREAT: {room?.sabotage?.active ? 'CRITICAL' : room?.duel?.active ? 'HIGH' : 'NORMAL'}
  //       </span>
  //     </div>
  //   </div>
  // );

  // Timer Circle (Absolute centered if possible, but we'll put it in rightContent for Navbar flex)
  const timerBadge = room?.state === 'playing' && room.gameTimer != null ? (
    <div className={`flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 shrink-0 rounded-full border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] z-50 ${room.gameTimer <= 60 ? 'bg-[#ffb4ab] text-[#690005] animate-pulse' : 'bg-[#ffc312] text-[#6e5200]'
      }`}>
      <span className="font-rubik text-sm sm:text-base font-black">
        {Math.floor(room.gameTimer / 60)}:{String(room.gameTimer % 60).padStart(2, '0')}
      </span>
    </div>
  ) : null;

  const rightContent = (
    <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
      {/* Guru Controls */}
      {roleInfo.isGuru && (room?.state === 'playing' || room?.state === 'ended') && (
        <div className="flex gap-2 border-l-4 border-black pl-3 ml-1">
          <button
            onClick={() => socket.emit('toggle-broadcast-stats', { show: !room.showStatsToAll })}
            className={`p-2 border-2 border-black rounded transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${room.showStatsToAll
                ? 'bg-[#41e5b3] text-[#003829]'
                : 'bg-[#270067] text-[#d3c5ab] hover:bg-[#330081]'
              }`}
            title="Siarkan stats ke semua pemain"
          >
            <Radio size={16} />
          </button>
          <a
            href={`/stats?room=${room.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 bg-[#270067] border-2 border-black rounded hover:bg-[#330081] text-[#d3c5ab] hover:text-white transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
            title="Layar Monitor / Proyektor"
          >
            <Monitor size={16} />
          </a>
          <button
            onClick={() => setStatsOpen(p => !p)}
            className={`p-2 border-2 border-black rounded transition-all shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none ${statsOpen ? 'bg-[#ffc312] text-[#3f2e00]' : 'bg-[#270067] text-[#d3c5ab] hover:bg-[#330081]'
              }`}
            title="Statistik game"
          >
            <BarChart3 size={16} />
          </button>
        </div>
      )}

      {timerBadge}

      {/* Mute */}
      <button
        onClick={() => setMuted(!muted)}
        className="p-1.5 sm:p-2 shrink-0 bg-[#270067] border-[3px] sm:border-2 border-black rounded hover:bg-[#330081] text-[#d3c5ab] transition-all shadow-[3px_3px_0px_#000000] sm:shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        title={muted ? 'Aktifkan suara' : 'Matikan suara'}
      >
        {muted ? <VolumeX size={16} className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 size={16} className="w-4 h-4 sm:w-5 sm:h-5" />}
      </button>

      {/* Logout */}
      <button
        onClick={() => {
          if (onLeaveRoom) onLeaveRoom();
          router.push('/');
        }}
        className="p-1.5 sm:p-2 shrink-0 bg-[#93000a] hover:bg-[#ffb4ab] hover:text-[#690005] text-[#ffdad6] border-[3px] sm:border-2 border-black rounded transition-all shadow-[3px_3px_0px_#000000] sm:shadow-[2px_2px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none"
        title="Keluar"
      >
        <LogOut size={16} className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </div>
  );

  const gameNavItems = [
    ...(player?.name ? [{ label: player.name, icon: roleInfo.isGuru ? '🏫' : isPlayerDead ? '👻' : '🧑‍🚀' }] : []),
    ...(roleInfo.role === 'provokator' && !isPlayerDead ? [{
      custom: (
        <div className="flex items-center gap-1.5 bg-[#93000a] border-[3px] border-black px-2.5 py-1 ml-2 shadow-[3px_3px_0px_#000000] rounded-sm transform hover:-translate-y-0.5 transition-transform">
          <span className="font-rubik italic text-[#ffb4ab] text-xs sm:text-sm font-black tracking-wide">PROVOKATOR</span>
        </div>
      )
    }] : [])
  ];

  return (
    <Navbar
      // navItems={gameNavItems}
      roomCode={room?.code}
      rightContent={rightContent}
    />
  );
}
