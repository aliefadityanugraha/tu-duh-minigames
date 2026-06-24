import React from 'react';
import { Users, MessageSquare } from 'lucide-react';
import LiveStatsPanel from '../LiveStatsPanel';
import GuruPanel from '../panels/GuruPanel';
import GameEndedCard from './GameEndedCard';
import { SKINS } from '../lobby/WaitingRoom';

export default function AdminView({
  room, player, roleInfo, logs,
  socket, statsOpen, onToggleStats,
  onPauseDebat, onResetGame, onRestart,
  onTriggerTopicDebate, onTriggerPresentation, onEndPresentation,
}) {
  const avatarColors = [
    '#41e5b3', '#8fb2ff', '#ffdf9c', '#ffb7d7',
    '#cda4ff', '#ffc58f', '#8ffff3', '#ffb4ab',
  ];

  return (
    <main className="relative z-10 w-full flex-1 flex flex-col">
      {/* Live stats */}
      {(room.state === 'playing' || room.state === 'ended') && (
        <div className="px-4 pt-3">
          <LiveStatsPanel
            room={room}
            isCollapsed={room.showStatsToAll ? false : !statsOpen}
            onToggle={() => { if (room.showStatsToAll) return; onToggleStats(); }}
          />
        </div>
      )}

      {/* Game ended */}
      {room.state === 'ended' && (
        <div className="p-4">
          <GameEndedCard
            room={room}
            roleInfo={roleInfo}
            selfId={player?.id}
            onRestart={onRestart}
            isGuru={true}
          />
        </div>
      )}

      {room.state === 'playing' && (
        <div className="flex-1 flex gap-0 overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          
          {/* ── KIRI: Player Roster & Logs ── */}
          <section className="w-[30%] flex flex-col border-r-4 border-black bg-[#13003a]">
            
            {/* Roster Header */}
            <div className="px-4 py-3 bg-[#270067] border-b-4 border-black shrink-0">
              <h3 className="font-rubik italic text-[#ffe5b3] text-lg font-bold flex items-center gap-2">
                <Users size={18} />
                PLAYERS ONLINE ({room.players.length})
              </h3>
            </div>

            {/* Roster List */}
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2 border-b-4 border-black">
              {room.players.map((p, idx) => {
                const isMe = p.id === player?.id;
                const skin = SKINS.find(s => s.id === p.skinId) || SKINS[0];
                const color = p.isGuru ? '#ffc312' : skin.bg;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-3 p-2 border-2 ${
                      p.isDead ? 'bg-[#190047] border-[#4f4632] opacity-60' : 'bg-[#22005c] border-[#4f4632]'
                    }`}
                  >
                    <div className="relative flex-shrink-0">
                      <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center text-lg overflow-hidden" style={{ backgroundColor: color }}>
                        {p.isGuru ? '🏫' : p.isDead ? '👻' : (SKINS.find(s => s.id === p.skinId)?.emoji || '🧑‍🚀')}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className={`font-mono text-sm leading-tight truncate ${
                        p.isDead ? 'text-[#d3c5ab] line-through' : 'text-[#e9ddff] font-bold'
                      }`}>
                        {p.name} {isMe && '(U)'}
                      </span>
                      <span className={`font-mono text-[10px] ${
                        p.isGuru ? 'text-[#ffc312]' : p.isDead ? 'text-[#ffb4ab]' : 'text-[#41e5b3]'
                      }`}>
                        {p.isGuru ? 'GURU / ADMIN' : p.isDead ? 'ELIMINATED' : `ALIVE • ${p.score} PT`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Logs Area */}
            <div className="h-[250px] flex flex-col shrink-0 bg-[#0000004c]">
              <div className="px-4 py-2 bg-[#40009d] border-b-4 border-black shrink-0">
                <h3 className="font-mono text-[#41e5b3] text-[10px] font-bold tracking-[1.5px] uppercase flex items-center gap-2">
                  <MessageSquare size={12} /> SYSTEM LOGS
                </h3>
              </div>
              <div className="flex-1 overflow-y-auto p-3 font-mono text-[10px] space-y-1.5 text-[#d3c5ab]">
                {logs.length === 0 ? (
                  <div className="text-center py-6 text-[#9c8f78] italic">Awaiting events...</div>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className="pb-1.5 border-b border-[#4f4632] last:border-0 leading-relaxed">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>

          {/* ── KANAN: Guru Control Panel ── */}
          <section className="w-[70%] p-6 bg-[#190047] overflow-y-auto">
            <div className="max-w-4xl mx-auto h-full">
              <GuruPanel
                room={room}
                onPauseDebat={onPauseDebat}
                onResetGame={onResetGame}
                onTriggerTopicDebate={onTriggerTopicDebate}
                onTriggerPresentation={onTriggerPresentation}
                onEndPresentation={onEndPresentation}
              />
            </div>
          </section>

        </div>
      )}
    </main>
  );
}
