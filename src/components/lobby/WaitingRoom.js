import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, LogOut, Settings, Timer, X, Users, Info, ShieldAlert } from 'lucide-react';
import Navbar from '../Navbar';
import { useSocket } from '../../hooks/useSocket';

const snappy = { type: 'spring', stiffness: 500, damping: 30 };
const punchy = { type: 'spring', stiffness: 400, damping: 25 };

export const SKINS = [
  { id: 0, name: 'Astronot', img: '/images/characters/astronot.png' },
  { id: 1, name: 'Pelajar', img: '/images/characters/pelajar.png' },
  { id: 2, name: 'Seniman', img: '/images/characters/seniman.png' },
  { id: 3, name: 'Petani', img: '/images/characters/petani.png' },
  { id: 4, name: 'Dokter', img: '/images/characters/dokter.png' },
  { id: 5, name: 'Polisi', img: '/images/characters/polisi.png' },
  { id: 6, name: 'Musisi', img: '/images/characters/musisi.png' },
];

export const PLAYER_COLORS = [
  '#ffb4ab', '#8fb2ff', '#5ffcc9', '#ffdf9c', '#ffb7d7', '#cda4ff', '#8ffff3',
  '#ffc8a1', '#d6ffb4', '#ffb4e5', '#a3c2ff', '#c4ffcb', '#ffd3b4', '#e2b4ff'
];

export const OPERATOR_SKIN = { id: 'operator', name: 'Operator', img: '/images/characters/operator.png', bg: '#e5e7eb', text: '#111827', border: '#9ca3af' };

function SkinModal({ mySkinId, mySlotColor, onSelect, onClose }) {
  const activeSkin = SKINS[mySkinId] ?? SKINS[0];
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" onClick={onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} transition={{ duration: 0.2, ease: "easeOut" }}
          className="relative w-full max-w-md bg-[#190047] border-[3px] border-black rounded-xl overflow-hidden shadow-[6px_6px_0px_#000000] flex flex-col max-h-[90vh]"
          style={{ willChange: "transform, opacity" }}
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between px-4 py-3 bg-[#4500a8] border-b-[3px] border-black shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🎭</span>
              <span className="font-rubik italic text-[#ffe5b3] text-lg sm:text-xl font-bold leading-none">PILIH KARAKTER</span>
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded border-2 border-black bg-[#93000a] text-white hover:bg-[#ffb4ab] hover:text-[#690005]">
              <X size={18} />
            </motion.button>
          </div>
          <div className="flex items-center gap-4 px-4 py-3 bg-[#270067] border-b-2 border-[#4f4632] shrink-0">
            <motion.div initial={{ rotate: -5 }} animate={{ rotate: 0 }} className="relative w-16 h-16 rounded-lg border-[3px] border-black flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_#000]" style={{ backgroundColor: mySlotColor }}>
              <img src={activeSkin.img} alt={activeSkin.name} className="w-[125%] h-[125%] object-contain mt-2" />
            </motion.div>
            <div>
              <p className="font-mono text-[#9c8f78] text-xs uppercase">Saat Ini</p>
              <p className="font-rubik italic text-[#ffc312] text-xl font-bold leading-tight">{activeSkin.name}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-3 p-4 overflow-y-auto custom-scrollbar">
            {SKINS.map((skin, i) => {
              const isActive = mySkinId === skin.id;
              return (
                <motion.button
                  key={skin.id} onClick={() => { onSelect(skin.id); onClose(); }} title={skin.name}
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                  whileHover={!isActive ? { scale: 1.05 } : {}} whileTap={{ scale: 0.95 }}
                  className={`relative flex flex-col items-center justify-center aspect-square rounded-lg border-[3px] cursor-pointer overflow-hidden group ${isActive ? 'border-[#ffc312] shadow-[4px_4px_0px_#ffc312] z-10' : 'border-black shadow-[2px_2px_0px_#000] hover:border-[#ffc312]'}`}
                  style={{ backgroundColor: mySlotColor }}
                >
                  <img src={skin.img} alt={skin.name} className="w-[125%] h-[125%] object-contain mt-2" />
                  {isActive && <div className="absolute bottom-1 bg-black text-[#ffc312] px-2 py-0.5 rounded text-[9px] font-bold border border-[#ffc312]">DIPAKAI</div>}
                </motion.button>
              );
            })}
          </div>
          <div className="px-4 py-3 bg-[#190047] border-t-2 border-[#4f4632] shrink-0">
            <p className="text-[#9c8f78] text-xs font-mono text-center">Pilihan terlihat oleh semua pemain</p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

function SliderRow({ label, settingKey, value, min, max, step = 1, format = v => v, isGuru, onUpdate }) {
  return (
    <div className="flex flex-col gap-1 w-full bg-[#270067] p-2.5 rounded border border-[#4f4632]">
      <div className="flex justify-between items-center gap-1">
        <span className="font-mono text-[#d3c5ab] text-[10px] sm:text-xs font-bold uppercase truncate">{label}</span>
        <span className="font-mono bg-[#190047] px-1.5 py-0.5 rounded text-[#ffc312] text-[10px] sm:text-xs font-bold border border-[#4f4632] shrink-0">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value} disabled={!isGuru} onChange={e => onUpdate(settingKey, Number(e.target.value))}
        className="w-full accent-[#ffc312] h-3 cursor-pointer mt-1"
      />
    </div>
  );
}

function MySkinButton({ mySkin, onClick, playerName, isGuru, bgColor }) {
  return (
    <motion.button whileHover={!isGuru ? { scale: 1.01 } : {}} whileTap={!isGuru ? { scale: 0.98 } : {}} onClick={!isGuru ? onClick : undefined} className={`w-full flex items-center gap-3 p-3 bg-[#40009d] rounded-xl border-[3px] border-black shadow-[4px_4px_0px_#000000] flex-shrink-0 ${!isGuru ? 'cursor-pointer hover:bg-[#4a00b5]' : 'cursor-default'}`}>
      <div className="relative w-16 h-16 rounded-lg border-[3px] border-black flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_#000]" style={{ backgroundColor: bgColor }}>
        <img src={mySkin.img} alt={mySkin.name} className="w-[125%] h-[125%] object-contain mt-2" />
      </div>
      <div className="flex-1 text-left flex flex-col justify-center">
        <div className="flex items-center gap-2 mb-1">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${isGuru ? 'bg-[#e5e7eb] text-[#111827] border-[#9ca3af]' : 'bg-[#ffc312] text-[#3f2e00] border-black'}`}>{isGuru ? 'GURU' : 'SAYA'}</span>
          {!isGuru && <span className="px-1.5 py-0.5 bg-[#190047] text-[#5ffcc9] rounded text-[10px] font-bold border border-[#4f4632]">{mySkin.name}</span>}
        </div>
        <p className="font-rubik italic text-[#ffc312] text-xl sm:text-2xl font-bold truncate max-w-[200px] leading-tight">{playerName}</p>
      </div>
      {!isGuru && (
        <div className="w-10 h-10 rounded border-2 border-black bg-[#ffc312] flex items-center justify-center shadow-[2px_2px_0px_#000]">
          <span className="text-[#3f2e00] font-bold text-base">✎</span>
        </div>
      )}
    </motion.button>
  );
}

export default function WaitingRoom({ socket, room: roomProp, player: playerProp, roleInfo }) {
  const { changeSkin, player: ctxPlayer, room: ctxRoom, leaveRoom } = useSocket();
  const [showSkinModal, setShowSkinModal] = useState(false);

  const player = ctxPlayer ?? playerProp;
  const room = ctxRoom ?? roomProp;
  const isGuru = player?.isGuru ?? roleInfo?.isGuru ?? false;
  const isSelf = (p) => p.id === player?.id;

  // Update default skin for Guru to Operator, and others to Astronot
  const mySkinId = player?.skinId ?? 0;
  const mySkin = isGuru ? OPERATOR_SKIN : (SKINS[mySkinId] ?? SKINS[0]);

  const currentSettings = room?.settings || {};
  const caseStudy = currentSettings.caseStudy || 'anti-hoaks';
  const gameTimer = currentSettings.gameTimer || 300;
  const provokatorCount = String(currentSettings.provokatorCount || 'auto');
  const tasksPerPlayer = currentSettings.tasksPerPlayer || 5;
  const sabotageTimer = currentSettings.sabotageTimer || 40;
  const duelTimer = currentSettings.duelTimer || 20;
  const debateTimer = currentSettings.debateTimer || 90;

  const updateSetting = (key, value) => { if (isGuru) socket?.emit('update-settings', { ...currentSettings, [key]: value }); };
  const startGame = () => socket?.emit('start-game');

  const sortedPlayers = [...((ctxRoom ?? roomProp)?.players || [])].sort((a, b) => a.isGuru === b.isGuru ? 0 : a.isGuru ? -1 : 1);
  const mySlotColor = isGuru ? '#e5e7eb' : PLAYER_COLORS[player?.colorId ?? 0];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full h-[100dvh] flex flex-col bg-[#190047] overflow-hidden">
      <AnimatePresence>
        {showSkinModal && <SkinModal mySkinId={mySkinId} mySlotColor={mySlotColor} onSelect={changeSkin} onClose={() => setShowSkinModal(false)} />}
      </AnimatePresence>
      <Navbar navItems={[]} roomCode={room?.code || ''} />

      <div className="flex-1 w-full max-w-[1200px] mx-auto flex flex-col lg:grid lg:grid-cols-12 gap-3 lg:gap-4 p-3 lg:p-4 overflow-hidden min-h-0">

        {/* LEFT PANEL */}
        <div className="lg:col-span-5 flex flex-col gap-3 shrink-0 lg:h-full lg:overflow-y-auto custom-scrollbar lg:pr-1">
          <MySkinButton mySkin={mySkin} onClick={() => setShowSkinModal(true)} playerName={player?.name || 'Player'} isGuru={isGuru} bgColor={mySlotColor} />

          {isGuru ? (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="flex flex-col bg-[#40009d] rounded-xl border-[3px] border-solid border-black shadow-[4px_4px_0px_#000000]">
              <div className="flex items-center gap-2 px-3 py-3 bg-[#4500a8] border-b-[3px] border-black rounded-t-lg">
                <Settings size={18} className="text-[#ffe5b3]" />
                <span className="font-rubik italic text-[#ffe5b3] text-sm sm:text-base font-bold">PENGATURAN</span>
              </div>
              <div className="flex flex-col gap-2 p-2 sm:p-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex flex-col gap-1.5 bg-[#270067] p-2.5 rounded border border-[#4f4632]">
                    <span className="font-mono text-[#41e5b3] text-[10px] sm:text-xs font-bold uppercase truncate">Waktu Main</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[{ label: '5m', val: 300 }, { label: '7m', val: 420 }, { label: '10m', val: 600 }].map(item => (
                        <motion.button key={item.val} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={() => updateSetting('gameTimer', item.val)}
                          className={`py-1.5 px-1 font-mono text-[10px] sm:text-xs font-bold border border-black rounded shadow-sm truncate ${gameTimer === item.val ? 'bg-[#ffc312] text-[#6e5200]' : 'bg-[#190047] text-[#e9ddff]'}`}
                        >{item.label}</motion.button>
                      ))}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5 bg-[#270067] p-2.5 rounded border border-[#4f4632]">
                    <span className="font-mono text-[#ffb4ab] text-[10px] sm:text-xs font-bold uppercase truncate">Provokator</span>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[{ label: 'Auto', val: 'auto' }, { label: '1', val: '1' }, { label: '2', val: '2' }].map(item => (
                        <motion.button key={item.val} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.95 }} onClick={() => updateSetting('provokatorCount', item.val)}
                          className={`py-1.5 px-1 font-mono text-[10px] sm:text-xs font-bold border border-black rounded shadow-sm truncate ${provokatorCount === item.val ? 'bg-[#ffc312] text-[#6e5200]' : 'bg-[#190047] text-[#e9ddff]'}`}
                        >{item.label}</motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 border-t border-[#4f4632] pt-2">
                  <SliderRow label="Tugas/Org" settingKey="tasksPerPlayer" value={tasksPerPlayer} min={1} max={15} format={v => `${v} soal`} isGuru={isGuru} onUpdate={updateSetting} />
                  <SliderRow label="Sabotase" settingKey="sabotageTimer" value={sabotageTimer} min={15} max={90} step={5} format={v => `${v}s`} isGuru={isGuru} onUpdate={updateSetting} />
                  <SliderRow label="Diskusi" settingKey="debateTimer" value={debateTimer} min={30} max={180} step={10} format={v => `${v}s`} isGuru={isGuru} onUpdate={updateSetting} />
                  <SliderRow label="Duel" settingKey="duelTimer" value={duelTimer} min={10} max={60} step={5} format={v => `${v}s`} isGuru={isGuru} onUpdate={updateSetting} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center justify-center gap-2 p-5 bg-[#40009d] rounded-xl border-[3px] border-dashed border-[#ffc312] shadow-[4px_4px_0px_#000000] text-center">
              <motion.div animate={{ rotate: [0, -10, 10, -10, 10, 0] }} transition={{ repeat: Infinity, duration: 2, repeatDelay: 1 }}>
                <Timer size={28} className="text-[#ffc312]" />
              </motion.div>
              <p className="font-rubik italic text-[#ffe5b3] text-xl font-bold">SIAP BERMAIN!</p>
              <p className="font-mono text-[#d3c5ab] text-xs">Menunggu Guru memulai.</p>
              <div className="w-full mt-2 grid grid-cols-2 gap-2">
                <div className="bg-[#270067] border border-[#4f4632] rounded p-2"><div className="text-[10px] text-[#9c8f78]">Durasi</div><div className="text-sm text-[#ffc312] font-bold">{Math.floor(gameTimer / 60)} Mnt</div></div>
                <div className="bg-[#270067] border border-[#4f4632] rounded p-2"><div className="text-[10px] text-[#9c8f78]">Misi</div><div className="text-[11px] text-[#41e5b3] font-bold truncate">{caseStudy === 'anti-hoaks' ? 'Anti Hoaks' : 'Saring Info'}</div></div>
              </div>
            </motion.div>
          )}
        </div>

        {/* RIGHT PANEL: ROSTER */}
        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="lg:col-span-7 flex flex-col bg-[#0000004c] rounded-xl border-[3px] border-solid border-black shadow-[4px_4px_0px_#000000] flex-1 min-h-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#330081] border-b-[3px] border-black shrink-0">
            <span className="font-rubik italic text-[#5ffcc9] text-sm sm:text-base font-bold">PEMAIN ({(room?.players || []).length}/15)</span>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-5 gap-2.5 p-3 overflow-y-auto flex-1 custom-scrollbar content-start">
            <AnimatePresence>
              {sortedPlayers.map((p, i) => {
                const skin = p.isGuru ? OPERATOR_SKIN : (SKINS[p.skinId ?? 0] ?? SKINS[0]);
                const self = isSelf(p);
                const slotColor = p.isGuru ? '#e5e7eb' : PLAYER_COLORS[p.colorId ?? 0];
                return (
                  <motion.div key={p.id} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ delay: i * 0.03, duration: 0.2 }} className="flex flex-col items-center gap-1.5 group relative">
                    <div className="relative aspect-square w-full rounded-lg border-[3px] border-black flex items-center justify-center overflow-hidden shadow-[2px_2px_0px_#000]" style={{ backgroundColor: slotColor }}>
                      {self && <div className="absolute top-0 left-0 bg-[#ffc312] text-[#3f2e00] text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-br border-b border-r border-black z-10">SAYA</div>}
                      {p.isGuru && <div className="absolute top-0 right-0 bg-[#111827] text-white text-[7px] sm:text-[8px] font-bold px-1.5 py-0.5 rounded-bl border-b border-l border-black z-10">GURU</div>}
                      <motion.img whileHover={{ scale: 1.15 }} src={skin.img} alt={skin.name} className="w-[125%] h-[125%] object-contain mt-2" />

                      {isGuru && !self && (
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-20 backdrop-blur-sm">
                          <button onClick={() => socket?.emit('kick-player', p.id)} title="Keluarkan Pemain" className="flex flex-col items-center justify-center gap-0.5 p-1.5 bg-[#93000a] text-white rounded border border-black shadow-[2px_2px_0px_#000] hover:bg-[#ffb4ab] hover:text-[#690005]">
                            <X size={16} />
                            <span className="text-[7px] font-bold">KELUARKAN</span>
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-[11px] font-mono rounded border-[2px] border-black px-1.5 py-1 text-center truncate w-full shadow-sm" style={{ backgroundColor: self ? '#ffc312' : '#190047', color: self ? '#3f2e00' : '#e9ddff' }}>{p.name}</div>
                  </motion.div>
                );
              })}
              {Array.from({ length: Math.max(0, 15 - ((room?.players || []).length)) }).map((_, idx) => (
                <motion.div key={`empty-${idx}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="aspect-square w-full rounded-lg border-2 border-dashed border-[#4f4632] flex items-center justify-center bg-[#190047]/50">
                  <span className="font-mono text-[#4f4632] text-xl font-bold">?</span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="px-3 py-3 border-t-[3px] border-black bg-[#270067] flex flex-row items-center justify-between gap-3 shrink-0">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => { if (leaveRoom) leaveRoom(); window.location.reload(); }} className="flex items-center gap-2 px-5 py-2 bg-[#93000a] text-white border-2 border-black rounded-lg text-[11px] sm:text-sm font-bold shadow-[2px_2px_0px_#000]">
              <LogOut size={14} /><span>KELUAR</span>
            </motion.button>
            {isGuru ? (
              <motion.button whileHover={(room?.players || []).length >= 2 ? { scale: 1.05 } : {}} whileTap={(room?.players || []).length >= 2 ? { scale: 0.95 } : {}} onClick={startGame} disabled={(room?.players || []).length < 2} className="flex items-center gap-2 px-5 py-2 bg-[#41e5b3] text-[#003829] border-2 border-black rounded-lg text-[11px] sm:text-sm font-bold shadow-[2px_2px_0px_#000] disabled:opacity-50">
                <span>MULAI PERMAINAN</span><Play size={14} fill="currentColor" />
              </motion.button>
            ) : (
              <div className="px-4 py-2 bg-[#190047] border border-[#4f4632] rounded-lg text-[#ffc312] text-[10px] sm:text-xs font-bold">MENUNGGU GURU...</div>
            )}
          </div>
        </motion.div>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #4f4632; border-radius: 4px; }
      `}} />
    </motion.div>
  );
}
