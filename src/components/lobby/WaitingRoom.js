import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, LogOut, Settings, Timer, X } from 'lucide-react';
import Navbar from '../Navbar';
import { useSocket } from '../../hooks/useSocket';

// ── Spring configs for neo-brutalist style ───────────────────────────────────
const snappy = { type: 'spring', stiffness: 500, damping: 30 };
const punchy = { type: 'spring', stiffness: 600, damping: 20 };
const gentle  = { type: 'spring', stiffness: 120, damping: 14 };

// ── Definisi 8 Skin Karakter ──────────────────────────────────────────────────
export const SKINS = [
  { id: 0, name: 'Astronot',  emoji: '🧑‍🚀', bg: '#ffb4ab', text: '#690005', border: '#ff897d' },
  { id: 1, name: 'Pelajar',   emoji: '📚',   bg: '#8fb2ff', text: '#002d70', border: '#5988f8' },
  { id: 2, name: 'Seniman',   emoji: '🎨',   bg: '#cda4ff', text: '#2c005b', border: '#a87aff' },
  { id: 3, name: 'Petani',    emoji: '🌾',   bg: '#5ffcc9', text: '#003829', border: '#00d9a2' },
  { id: 4, name: 'Dokter',    emoji: '🩺',   bg: '#8ffff3', text: '#003833', border: '#3ae9d8' },
  { id: 5, name: 'Polisi',    emoji: '👮',   bg: '#ffdf9c', text: '#251a00', border: '#ffc312' },
  { id: 6, name: 'Musisi',    emoji: '🎵',   bg: '#ffb7d7', text: '#5b002c', border: '#ff6eb4' },
  { id: 7, name: 'Guru',      emoji: '🏫',   bg: '#ffc312', text: '#3f2e00', border: '#e6aa00' },
];

// ── Modal Pilih Skin ──────────────────────────────────────────────────────────
function SkinModal({ mySkinId, onSelect, onClose }) {
  const [hoveredId, setHoveredId] = useState(null);
  const activeSkin = SKINS[mySkinId] ?? SKINS[0];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.85, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 30 }}
          transition={snappy}
          className="relative w-full max-w-md bg-[#190047] border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000000] overflow-hidden"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <motion.div
            initial={{ x: -40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ ...snappy, delay: 0.1 }}
            className="flex items-center justify-between px-6 py-4 bg-[#4500a8] border-b-4 border-black"
          >
            <div className="flex items-center gap-3">
              <motion.span
                animate={{ rotate: [0, -12, 12, -6, 0] }}
                transition={{ delay: 0.3, duration: 0.5, ease: 'easeInOut' }}
                className="text-2xl"
              >🎭</motion.span>
              <span className="font-rubik italic text-[#ffe5b3] text-2xl font-bold leading-none">
                PILIH KARAKTER
              </span>
            </div>
            <motion.button
              onClick={onClose}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-black bg-[#93000a] text-white hover:bg-[#ffb4ab] hover:text-[#690005] transition-colors shadow-[2px_2px_0px_#000]"
            >
              <X size={18} />
            </motion.button>
          </motion.div>

          {/* Preview karakter aktif */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ ...snappy, delay: 0.15 }}
            className="flex items-center gap-4 px-6 py-4 bg-[#270067] border-b-2 border-[#4f4632]"
          >
            <motion.div
              layout
              transition={snappy}
              className="w-16 h-16 rounded-xl border-4 border-[#ffc312] flex flex-col items-center justify-center shadow-[4px_4px_0px_#000] flex-shrink-0"
              style={{ backgroundColor: activeSkin.bg }}
            >
              <span className="text-3xl leading-none">{activeSkin.emoji}</span>
            </motion.div>
            <div>
              <p className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">Karakter Saat Ini</p>
              <motion.p
                key={activeSkin.name}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={snappy}
                className="font-rubik italic text-[#ffc312] text-xl font-bold"
              >{activeSkin.name}</motion.p>
              <p className="font-mono text-[#d3c5ab] text-xs mt-0.5">Klik karakter lain untuk menggantinya</p>
            </div>
          </motion.div>

          {/* Grid 4×2 */}
          <div className="grid grid-cols-4 gap-3 p-5">
            {SKINS.map((skin, i) => {
              const isActive  = mySkinId === skin.id;
              const isHovered = hoveredId === skin.id;
              return (
                <motion.button
                  key={skin.id}
                  onClick={() => { onSelect(skin.id); onClose(); }}
                  onMouseEnter={() => setHoveredId(skin.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  title={skin.name}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{
                    opacity: 1,
                    scale: isActive ? 1.05 : isHovered ? 1.08 : 1,
                    y: isActive ? -4 : isHovered ? -2 : 0,
                  }}
                  whileTap={{ scale: 0.92 }}
                  transition={{ ...punchy, delay: 0.2 + i * 0.04 }}
                  style={{
                    backgroundColor: skin.bg,
                    color: skin.text,
                    borderColor: isActive ? '#ffc312' : (isHovered ? skin.border : '#000000'),
                    boxShadow: isActive
                      ? '0 0 0 3px #ffc312, 4px 4px 0px #000'
                      : isHovered
                        ? '0 0 0 2px ' + skin.border + ', 4px 4px 0px #000'
                        : '3px 3px 0px #000',
                  }}
                  className="flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-4 cursor-pointer select-none"
                >
                  <span className="text-3xl leading-none">{skin.emoji}</span>
                  <span
                    className="text-[9px] font-mono font-bold leading-none truncate w-full text-center px-0.5"
                    style={{ color: skin.text }}
                  >
                    {skin.name}
                  </span>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={snappy}
                      className="text-[8px] font-mono font-bold leading-none"
                      style={{ color: skin.text }}
                    >
                      ✓ AKTIF
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="px-6 pb-5"
          >
            <p className="text-[#9c8f78] text-[10px] font-mono text-center">
              ✨ Pilihan terlihat oleh semua pemain secara <span className="text-[#5ffcc9]">real-time</span>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}

// ── Slider helper (outside WaitingRoom to prevent re-creation on every render) ──
function SliderRow({ label, settingKey, value, min, max, step = 1, format = v => v, isGuru, onUpdate }) {
  return (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[#d3c5ab] text-[11px] font-bold uppercase tracking-[1px]">{label}</span>
        <span className="font-mono text-[#ffc312] text-xs font-bold">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        disabled={!isGuru}
        onChange={e => onUpdate(settingKey, Number(e.target.value))}
        className={`w-full accent-[#ffc312] h-2 rounded-full cursor-pointer ${!isGuru ? 'opacity-40 cursor-not-allowed' : ''}`}
      />
    </div>
  );
}

// ── Tombol / Preview skin pemain sendiri (outside WaitingRoom to prevent re-creation) ──
function MySkinButton({ mySkin, onClick }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      transition={snappy}
      className="w-full flex items-center gap-4 p-4 bg-[#40009d] rounded-xl border-4 border-black shadow-[6px_6px_0px_#000000] cursor-pointer group"
    >
      <motion.div
        whileHover={{ scale: 1.12 }}
        transition={snappy}
        className="w-14 h-14 rounded-xl border-4 border-[#ffc312] flex flex-col items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#000]"
        style={{ backgroundColor: mySkin.bg }}
      >
        <span className="text-3xl leading-none">{mySkin.emoji}</span>
      </motion.div>
      <div className="flex-1 text-left">
        <p className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">Karakter Saya</p>
        <p className="font-rubik italic text-[#ffc312] text-lg font-bold leading-tight">{mySkin.name}</p>
        <p className="font-mono text-[#5ffcc9] text-[10px] mt-0.5 group-hover:text-white transition-colors">
          🎭 Klik untuk ganti karakter →
        </p>
      </div>
      <div className="w-8 h-8 rounded-lg border-2 border-black bg-[#ffc312] flex items-center justify-center shadow-[2px_2px_0px_#000] flex-shrink-0">
        <span className="text-[#3f2e00] font-bold text-sm">✎</span>
      </div>
    </motion.button>
  );
}

// ── Komponen Utama ─────────────────────────────────────────────────────────────
export default function WaitingRoom({ socket, room: roomProp, player: playerProp, roleInfo }) {
  const { changeSkin, player: ctxPlayer, room: ctxRoom } = useSocket();
  const [showSkinModal, setShowSkinModal] = useState(false);

  const player = ctxPlayer ?? playerProp;
  const room   = ctxRoom   ?? roomProp;

  const isGuru   = player?.isGuru ?? roleInfo?.isGuru ?? false;
  const isSelf   = (p) => p.id === player?.id;
  const mySkinId = player?.skinId ?? 0;
  const mySkin   = SKINS[mySkinId] ?? SKINS[0];

  const currentSettings = room?.settings || {};
  const caseStudy       = currentSettings.caseStudy       || 'anti-hoaks';
  const gameTimer       = currentSettings.gameTimer        || 300;
  const provokatorCount = String(currentSettings.provokatorCount || 'auto');
  const tasksPerPlayer  = currentSettings.tasksPerPlayer   || 5;
  const sabotageTimer   = currentSettings.sabotageTimer    || 40;
  const duelTimer       = currentSettings.duelTimer        || 20;
  const debateTimer     = currentSettings.debateTimer      || 90;

  const updateSetting = (key, value) => {
    if (!isGuru) return;
    socket?.emit('update-settings', { ...currentSettings, [key]: value });
  };

  const startGame = () => socket?.emit('start-game');

  const waitingNavItems = [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...snappy, delay: 0.05 }}
      className="w-full flex flex-col min-h-screen bg-[#190047]"
    >

      {/* ── SKIN MODAL ── */}
      <AnimatePresence>
        {showSkinModal && (
          <SkinModal
            mySkinId={mySkinId}
            onSelect={(id) => changeSkin(id)}
            onClose={() => setShowSkinModal(false)}
          />
        )}
      </AnimatePresence>

      {/* ── GLOBAL NAVBAR ── */}
      <Navbar navItems={waitingNavItems} roomCode={room.code} />

      {/* ── MAIN GRID ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-5 w-full bg-[#190047]">

        {/* ══ LEFT ══ */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: 0.15 }}
          className="lg:col-span-4 flex flex-col gap-4"
        >

          {isGuru ? (
            <>
              {/* Pengaturan Game */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ ...snappy, delay: 0.2 }}
                className="flex flex-col gap-0 w-full bg-[#40009d] rounded-xl border-4 border-solid border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
              >
                <div className="flex items-center gap-3 px-5 py-3 bg-[#4500a8] border-b-4 border-black">
                  <motion.div
                    animate={{ rotate: [0, 90, 180, 270, 360] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                  >
                    <Settings size={18} className="text-[#ffe5b3]" />
                  </motion.div>
                  <span className="font-rubik italic text-[#ffe5b3] text-xl font-bold leading-none whitespace-nowrap">
                    PENGATURAN GAME
                  </span>
                </div>
                <div className="flex flex-col gap-5 p-5">

                  {/* GAME TIMER */}
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Game Timer</span>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {[{ label: '5 MIN', val: 300 }, { label: '7 MIN', val: 420 }, { label: '10 MIN', val: 600 }].map(item => (
                        <motion.button
                          key={item.val}
                          onClick={() => updateSetting('gameTimer', item.val)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          transition={punchy}
                          className={`py-2.5 font-mono text-xs font-bold text-center border-4 border-black shadow-[3px_3px_0px_#000000] ${
                            gameTimer === item.val ? 'bg-[#ffc312] text-[#6e5200]' : 'bg-[#270067] text-[#e9ddff] hover:bg-[#330081]'
                          }`}
                        >{item.label}</motion.button>
                      ))}
                    </div>
                  </div>

                  {/* PROVOKATOR */}
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Jumlah Provokator</span>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {[{ label: 'Auto', val: 'auto' }, { label: '1', val: '1' }, { label: '2', val: '2' }].map(item => (
                        <motion.button
                          key={item.val}
                          onClick={() => updateSetting('provokatorCount', item.val)}
                          whileHover={{ scale: 1.04 }}
                          whileTap={{ scale: 0.94 }}
                          transition={punchy}
                          className={`py-2.5 font-mono text-xs font-bold text-center border-4 border-black shadow-[3px_3px_0px_#000000] ${
                            provokatorCount === item.val ? 'bg-[#ffc312] text-[#6e5200]' : 'bg-[#270067] text-[#e9ddff] hover:bg-[#330081]'
                          }`}
                        >{item.label}</motion.button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full border-t-2 border-[#4f4632]" />

                  {/* ADVANCED */}
                  <div className="flex flex-col gap-4">
                    <span className="font-mono text-[#9c8f78] text-[10px] font-bold tracking-[1.5px] uppercase">Pengaturan Lanjutan</span>
                    <SliderRow label="Tugas per Warga"   settingKey="tasksPerPlayer" value={tasksPerPlayer} min={1}  max={15}          format={v => `${v} soal`} isGuru={isGuru} onUpdate={updateSetting} />
                    <SliderRow label="Timer Sabotase"    settingKey="sabotageTimer"  value={sabotageTimer}  min={15} max={90}  step={5} format={v => `${v}s`} isGuru={isGuru} onUpdate={updateSetting} />
                    <SliderRow label="Timer Duel"        settingKey="duelTimer"      value={duelTimer}      min={10} max={60}  step={5} format={v => `${v}s`} isGuru={isGuru} onUpdate={updateSetting} />
                    <SliderRow label="Timer Musyawarah"  settingKey="debateTimer"    value={debateTimer}    min={30} max={180} step={10} format={v => `${v}s`} isGuru={isGuru} onUpdate={updateSetting} />
                  </div>
                </div>
              </motion.div>

              {/* Guru: tombol ganti skin */}
              <MySkinButton mySkin={mySkin} onClick={() => setShowSkinModal(true)} />
            </>
          ) : (
            <>
              {/* Siswa: panel status */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...snappy, delay: 0.2 }}
                className="flex flex-col items-center justify-center gap-4 p-6 w-full bg-[#40009d] rounded-xl border-4 border-dashed border-[#4500a8] shadow-[8px_8px_0px_#000000] text-center min-h-[220px]"
              >
                <motion.div
                  animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                  }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="w-14 h-14 rounded-full bg-[#190047] border-4 border-[#ffc312] flex items-center justify-center shadow-[4px_4px_0px_#000000]"
                >
                  <Timer size={28} className="text-[#ffc312]" />
                </motion.div>
                <div className="space-y-2">
                  <p className="font-rubik italic text-[#ffe5b3] text-lg font-bold">SIAP BERMAIN!</p>
                  <p className="font-mono text-[#d3c5ab] text-sm leading-relaxed">
                    Menunggu Guru memulai misi. Bersiaplah untuk berdiskusi!
                  </p>
                  <motion.div
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                    className="flex items-center justify-center gap-2 pt-1"
                  >
                    <span className="text-[#5ffcc9] text-xs font-mono font-bold">
                      🛸 TERHUBUNG KE LOBBY
                    </span>
                  </motion.div>
                </div>
                <div className="w-full mt-2 grid grid-cols-2 gap-2">
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={snappy}
                    className="bg-[#270067] border-2 border-[#4f4632] rounded-lg p-2 text-center"
                  >
                    <div className="font-mono text-[#9c8f78] text-[9px] uppercase tracking-wider">Timer</div>
                    <div className="font-mono text-[#ffc312] text-sm font-bold">{Math.floor(gameTimer / 60)} min</div>
                  </motion.div>
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={snappy}
                    className="bg-[#270067] border-2 border-[#4f4632] rounded-lg p-2 text-center"
                  >
                    <div className="font-mono text-[#9c8f78] text-[9px] uppercase tracking-wider">Paket</div>
                    <div className="font-mono text-[#ffc312] text-[11px] font-bold truncate">
                      {caseStudy === 'anti-hoaks' ? 'Anti-Hoaks' : 'Saring Info'}
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Siswa: tombol ganti skin */}
              <MySkinButton mySkin={mySkin} onClick={() => setShowSkinModal(true)} />
            </>
          )}
        </motion.div>

        {/* ══ RIGHT: ROSTER ══ */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ ...snappy, delay: 0.25 }}
          className="lg:col-span-8 flex flex-col bg-[#0000004c] rounded-xl border-4 border-solid border-black shadow-[8px_8px_0px_#000000] overflow-hidden"
        >

          {/* Roster Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...snappy, delay: 0.3 }}
            className="flex items-center justify-between px-4 py-3 bg-[#330081] border-b-4 border-black shrink-0"
          >
            <span className="font-rubik italic text-[#5ffcc9] text-lg font-bold leading-none select-none">
              KRU BERGABUNG ({room.players.length}/15)
            </span>
            <div className="flex gap-2">
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, repeatDelay: 3 }}
                className="w-3 h-3 bg-[#ffb4ab] rounded-full border border-black"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, delay: 0.6, repeat: Infinity, repeatDelay: 3 }}
                className="w-3 h-3 bg-[#41e5b3] rounded-full border border-black"
              />
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1.5, delay: 0.8, repeat: Infinity, repeatDelay: 3 }}
                className="w-3 h-3 bg-[#ffc312] rounded-full border border-black"
              />
            </div>
          </motion.div>

          {/* Roster Grid — 5 columns for 15 max (5×3 rows) */}
          <div className="grid grid-cols-5 gap-2 p-3 overflow-y-auto flex-1">
            {(ctxRoom ?? roomProp).players.map((p, i) => {
              const defaultSkinId = p.isGuru ? 7 : 0;
              const skin = SKINS[p.skinId ?? defaultSkinId] ?? SKINS[defaultSkinId];
              const self = isSelf(p);
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, scale: 0.5, y: 20 }}
                  animate={{ opacity: 1, scale: self ? 1.05 : 1, y: 0 }}
                  whileHover={{ scale: self ? 1.12 : 1.06 }}
                  transition={{ ...snappy, delay: 0.35 + i * 0.05 }}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="aspect-square w-full rounded-xl border-4 flex flex-col items-center justify-center gap-0.5 p-1"
                    style={{
                      backgroundColor: skin.bg,
                      color: skin.text,
                      borderColor: self ? '#ffc312' : '#000000',
                      boxShadow: self ? '0 0 0 3px #ffc312, 4px 4px 0px #000' : '4px 4px 0px #000',
                    }}
                  >
                    <span className="text-2xl leading-none select-none">{skin.emoji}</span>
                    <span className="text-[7px] font-mono font-bold leading-none mt-0.5 truncate w-full text-center" style={{ color: skin.text, opacity: 0.8 }}>
                      {skin.name}
                    </span>
                  </div>
                  <div
                    className="text-[9px] font-mono rounded border px-1 py-0.5 text-center truncate w-full"
                    style={{
                      backgroundColor: self ? '#ffc312' : '#000000',
                      color: self ? '#3f2e00' : '#e9ddff',
                      borderColor: self ? '#000' : '#4f4632',
                      fontWeight: self ? 700 : 400,
                    }}
                  >
                    {p.name}{self && <span className="font-bold"> (U)</span>}
                  </div>
                </motion.div>
              );
            })}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, 15 - room.players.length) }).map((_, idx) => (
              <motion.div
                key={`empty-${idx}`}
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 0.25, scale: 1 }}
                transition={{ ...gentle, delay: 0.5 + idx * 0.04 }}
                className="aspect-square w-full rounded-xl border-4 border-dashed border-[#4f4632] flex items-center justify-center select-none"
              >
                <motion.span
                  animate={{ y: [0, -3, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
                  className="font-mono text-[#d3c5ab] text-sm"
                >?</motion.span>
              </motion.div>
            ))}
          </div>

          {/* Action Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="px-4 py-3 border-t-4 border-black bg-[#270067] flex items-center justify-between gap-3 shrink-0"
          >
            <motion.button
              onClick={() => window.location.reload()}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              transition={snappy}
              className="flex items-center gap-1.5 text-xs text-[#d3c5ab] hover:text-white transition-colors underline cursor-pointer whitespace-nowrap"
            >
              <LogOut size={13} />
              <span>Ganti Nama / Keluar</span>
            </motion.button>

            {isGuru ? (
              <motion.button
                onClick={startGame}
                disabled={room.players.length < 2}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.94 }}
                transition={punchy}
                className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-[#93000a] text-[#ffdad6] border-4 border-solid border-black rounded-xl shadow-[4px_4px_0px_#000000] hover:bg-[#ffb4ab] hover:text-[#690005] font-rubik text-lg font-bold italic cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span>MULAI GAME</span>
                <Play size={16} fill="currentColor" />
              </motion.button>
            ) : (
              <motion.div
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="px-5 py-2 bg-[#22005c] border-2 border-[#4f4632] rounded-lg"
              >
                <span className="font-mono text-[#d3c5ab] text-xs font-bold">MENUNGGU GURU...</span>
              </motion.div>
            )}
          </motion.div>

        </motion.div>
      </div>
    </motion.div>
  );
}
