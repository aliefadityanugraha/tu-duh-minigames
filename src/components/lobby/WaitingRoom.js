import React, { useState } from 'react';
import { Play, LogOut, Settings, Timer, X } from 'lucide-react';
import Navbar from '../Navbar';
import { useSocket } from '../../hooks/useSocket';

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
      <div
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-md bg-[#190047] border-4 border-black rounded-2xl shadow-[12px_12px_0px_#000000] overflow-hidden animate-fadeIn"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-[#4500a8] border-b-4 border-black">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎭</span>
              <span className="font-rubik italic text-[#ffe5b3] text-2xl font-bold leading-none">
                PILIH KARAKTER
              </span>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-lg border-2 border-black bg-[#93000a] text-white hover:bg-[#ffb4ab] hover:text-[#690005] transition-all shadow-[2px_2px_0px_#000] active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              <X size={18} />
            </button>
          </div>

          {/* Preview karakter aktif */}
          <div className="flex items-center gap-4 px-6 py-4 bg-[#270067] border-b-2 border-[#4f4632]">
            <div
              className="w-16 h-16 rounded-xl border-4 border-[#ffc312] flex flex-col items-center justify-center shadow-[4px_4px_0px_#000] flex-shrink-0"
              style={{ backgroundColor: activeSkin.bg }}
            >
              <span className="text-3xl leading-none">{activeSkin.emoji}</span>
            </div>
            <div>
              <p className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">Karakter Saat Ini</p>
              <p className="font-rubik italic text-[#ffc312] text-xl font-bold">{activeSkin.name}</p>
              <p className="font-mono text-[#d3c5ab] text-xs mt-0.5">Klik karakter lain untuk menggantinya</p>
            </div>
          </div>

          {/* Grid 4×2 */}
          <div className="grid grid-cols-4 gap-3 p-5">
            {SKINS.map((skin) => {
              const isActive  = mySkinId === skin.id;
              const isHovered = hoveredId === skin.id;
              return (
                <button
                  key={skin.id}
                  onClick={() => { onSelect(skin.id); onClose(); }}
                  onMouseEnter={() => setHoveredId(skin.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  title={skin.name}
                  style={{
                    backgroundColor: skin.bg,
                    color: skin.text,
                    borderColor: isActive ? '#ffc312' : (isHovered ? skin.border : '#000000'),
                    boxShadow: isActive
                      ? '0 0 0 3px #ffc312, 4px 4px 0px #000'
                      : isHovered
                        ? '0 0 0 2px ' + skin.border + ', 4px 4px 0px #000'
                        : '3px 3px 0px #000',
                    transform: isActive ? 'translateY(-4px) scale(1.05)' : isHovered ? 'translateY(-2px)' : 'none',
                  }}
                  className="flex flex-col items-center justify-center gap-1 aspect-square rounded-xl border-4 transition-all duration-150 cursor-pointer select-none active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <span className="text-3xl leading-none">{skin.emoji}</span>
                  <span
                    className="text-[9px] font-mono font-bold leading-none truncate w-full text-center px-0.5"
                    style={{ color: skin.text }}
                  >
                    {skin.name}
                  </span>
                  {isActive && (
                    <span className="text-[8px] font-mono font-bold leading-none" style={{ color: skin.text }}>
                      ✓ AKTIF
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 pb-5">
            <p className="text-[#9c8f78] text-[10px] font-mono text-center">
              ✨ Pilihan terlihat oleh semua pemain secara <span className="text-[#5ffcc9]">real-time</span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Komponen Utama ─────────────────────────────────────────────────────────────
export default function WaitingRoom({ socket, room: roomProp, player: playerProp, roleInfo }) {
  // Baca player & room dari context agar selalu terupdate setelah room-updated
  const { changeSkin, player: ctxPlayer, room: ctxRoom } = useSocket();
  const [showSkinModal, setShowSkinModal] = useState(false);

  // Gunakan context sebagai sumber utama, prop sebagai fallback
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
  const maxPlayers      = currentSettings.maxPlayers       || 10;

  const updateSetting = (key, value) => {
    if (!isGuru) return;
    socket?.emit('update-settings', { ...currentSettings, [key]: value });
  };

  const startGame = () => socket?.emit('start-game');

  const waitingNavItems = [
    { label: 'Home', icon: '🏠', href: '/' },
    { label: 'Lobby', icon: '🛸', active: true },
  ];

  // ── Slider helper ──
  const SliderRow = ({ label, settingKey, value, min, max, step = 1, format = v => v }) => (
    <div className="flex flex-col gap-1.5 w-full">
      <div className="flex justify-between items-center">
        <span className="font-mono text-[#d3c5ab] text-[11px] font-bold uppercase tracking-[1px]">{label}</span>
        <span className="font-mono text-[#ffc312] text-xs font-bold">{format(value)}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        disabled={!isGuru}
        onChange={e => updateSetting(settingKey, Number(e.target.value))}
        className={`w-full accent-[#ffc312] h-2 rounded-full cursor-pointer ${!isGuru ? 'opacity-40 cursor-not-allowed' : ''}`}
      />
    </div>
  );

  // ── Tombol / Preview skin pemain sendiri ──
  const MySkinButton = () => (
    <button
      onClick={() => setShowSkinModal(true)}
      className="w-full flex items-center gap-4 p-4 bg-[#40009d] rounded-xl border-4 border-black shadow-[6px_6px_0px_#000000] hover:shadow-[3px_3px_0px_#000] hover:translate-x-[3px] hover:translate-y-[3px] active:shadow-none active:translate-x-[6px] active:translate-y-[6px] transition-all cursor-pointer group"
    >
      {/* Avatar preview */}
      <div
        className="w-14 h-14 rounded-xl border-4 border-[#ffc312] flex flex-col items-center justify-center flex-shrink-0 shadow-[3px_3px_0px_#000] group-hover:scale-110 transition-transform"
        style={{ backgroundColor: mySkin.bg }}
      >
        <span className="text-3xl leading-none">{mySkin.emoji}</span>
      </div>

      {/* Info teks */}
      <div className="flex-1 text-left">
        <p className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider">Karakter Saya</p>
        <p className="font-rubik italic text-[#ffc312] text-lg font-bold leading-tight">{mySkin.name}</p>
        <p className="font-mono text-[#5ffcc9] text-[10px] mt-0.5 group-hover:text-white transition-colors">
          🎭 Klik untuk ganti karakter →
        </p>
      </div>

      {/* Indikator panah */}
      <div className="w-8 h-8 rounded-lg border-2 border-black bg-[#ffc312] flex items-center justify-center shadow-[2px_2px_0px_#000] flex-shrink-0">
        <span className="text-[#3f2e00] font-bold text-sm">✎</span>
      </div>
    </button>
  );

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#190047] animate-fadeIn">

      {/* ── SKIN MODAL ── */}
      {showSkinModal && (
        <SkinModal
          mySkinId={mySkinId}
          onSelect={(id) => changeSkin(id)}
          onClose={() => setShowSkinModal(false)}
        />
      )}

      {/* ── GLOBAL NAVBAR ── */}
      <Navbar navItems={waitingNavItems} roomCode={room.code} />

      {/* ── MAIN GRID ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-5 w-full bg-[#190047]">

        {/* ══ LEFT ══ */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {isGuru ? (
            <>
              {/* Pengaturan Game */}
              <div className="flex flex-col gap-0 w-full bg-[#40009d] rounded-xl border-4 border-solid border-black shadow-[8px_8px_0px_#000000] overflow-hidden">
                <div className="flex items-center gap-3 px-5 py-3 bg-[#4500a8] border-b-4 border-black">
                  <Settings size={18} className="text-[#ffe5b3]" />
                  <span className="font-rubik italic text-[#ffe5b3] text-xl font-bold leading-none whitespace-nowrap">
                    PENGATURAN GAME
                  </span>
                </div>
                <div className="flex flex-col gap-5 p-5">

                  {/* CASE STUDY */}
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Case Study Package</span>
                    <div className="flex items-center p-1 w-full bg-black rounded-lg border-2 border-[#4f4632] gap-1">
                      {[
                        { label: 'Anti-Hoaks', val: 'anti-hoaks' },
                        { label: 'Saring Info', val: 'saring-informasi' },
                      ].map(item => (
                        <button key={item.val} onClick={() => updateSetting('caseStudy', item.val)}
                          className={`flex-1 py-2.5 font-mono text-sm font-bold text-center rounded border-2 transition-all ${
                            caseStudy === item.val
                              ? 'bg-[#ffc312] text-[#6e5200] border-black'
                              : 'bg-transparent text-[#d3c5ab] border-transparent hover:text-white'
                          }`}
                        >{item.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* GAME TIMER */}
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Game Timer</span>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {[{ label: '5 MIN', val: 300 }, { label: '7 MIN', val: 420 }, { label: '10 MIN', val: 600 }].map(item => (
                        <button key={item.val} onClick={() => updateSetting('gameTimer', item.val)}
                          className={`py-2.5 font-mono text-xs font-bold text-center border-4 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
                            gameTimer === item.val ? 'bg-[#ffc312] text-[#6e5200]' : 'bg-[#270067] text-[#e9ddff] hover:bg-[#330081]'
                          }`}
                        >{item.label}</button>
                      ))}
                    </div>
                  </div>

                  {/* PROVOKATOR */}
                  <div className="flex flex-col gap-2 w-full">
                    <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Jumlah Provokator</span>
                    <div className="grid grid-cols-3 gap-2 w-full">
                      {[{ label: 'Auto', val: 'auto' }, { label: '1', val: '1' }, { label: '2', val: '2' }].map(item => (
                        <button key={item.val} onClick={() => updateSetting('provokatorCount', item.val)}
                          className={`py-2.5 font-mono text-xs font-bold text-center border-4 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
                            provokatorCount === item.val ? 'bg-[#ffc312] text-[#6e5200]' : 'bg-[#270067] text-[#e9ddff] hover:bg-[#330081]'
                          }`}
                        >{item.label}</button>
                      ))}
                    </div>
                  </div>

                  <div className="w-full border-t-2 border-[#4f4632]" />

                  {/* ADVANCED */}
                  <div className="flex flex-col gap-4">
                    <span className="font-mono text-[#9c8f78] text-[10px] font-bold tracking-[1.5px] uppercase">Pengaturan Lanjutan</span>
                    <SliderRow label="Tugas per Warga"   settingKey="tasksPerPlayer" value={tasksPerPlayer} min={1}  max={15}          format={v => `${v} soal`} />
                    <SliderRow label="Timer Sabotase"    settingKey="sabotageTimer"  value={sabotageTimer}  min={15} max={90}  step={5} format={v => `${v}s`} />
                    <SliderRow label="Timer Duel"        settingKey="duelTimer"      value={duelTimer}      min={10} max={60}  step={5} format={v => `${v}s`} />
                    <SliderRow label="Timer Musyawarah"  settingKey="debateTimer"    value={debateTimer}    min={30} max={180} step={10} format={v => `${v}s`} />
                    <SliderRow label="Maks. Pemain"      settingKey="maxPlayers"     value={maxPlayers}     min={3}  max={10}            format={v => `${v} orang`} />
                  </div>
                </div>
              </div>

              {/* Guru: tombol ganti skin */}
              <MySkinButton />
            </>
          ) : (
            <>
              {/* Siswa: panel status */}
              <div className="flex flex-col items-center justify-center gap-4 p-6 w-full bg-[#40009d] rounded-xl border-4 border-dashed border-[#4500a8] shadow-[8px_8px_0px_#000000] text-center min-h-[220px]">
                <div className="w-14 h-14 rounded-full bg-[#190047] border-4 border-[#ffc312] flex items-center justify-center shadow-[4px_4px_0px_#000000]">
                  <Timer size={28} className="text-[#ffc312] animate-pulse" />
                </div>
                <div className="space-y-2">
                  <p className="font-rubik italic text-[#ffe5b3] text-lg font-bold">SIAP BERMAIN!</p>
                  <p className="font-mono text-[#d3c5ab] text-sm leading-relaxed">
                    Menunggu Guru memulai misi. Bersiaplah untuk berdiskusi!
                  </p>
                  <div className="flex items-center justify-center gap-2 pt-1">
                    <span className="text-[#5ffcc9] text-xs font-mono font-bold animate-pulse">
                      🛸 TERHUBUNG KE LOBBY
                    </span>
                  </div>
                </div>
                <div className="w-full mt-2 grid grid-cols-2 gap-2">
                  <div className="bg-[#270067] border-2 border-[#4f4632] rounded-lg p-2 text-center">
                    <div className="font-mono text-[#9c8f78] text-[9px] uppercase tracking-wider">Timer</div>
                    <div className="font-mono text-[#ffc312] text-sm font-bold">{Math.floor(gameTimer / 60)} min</div>
                  </div>
                  <div className="bg-[#270067] border-2 border-[#4f4632] rounded-lg p-2 text-center">
                    <div className="font-mono text-[#9c8f78] text-[9px] uppercase tracking-wider">Paket</div>
                    <div className="font-mono text-[#ffc312] text-[11px] font-bold truncate">
                      {caseStudy === 'anti-hoaks' ? 'Anti-Hoaks' : 'Saring Info'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Siswa: tombol ganti skin */}
              <MySkinButton />
            </>
          )}
        </div>

        {/* ══ RIGHT: ROSTER ══ */}
        <div className="lg:col-span-8 flex flex-col bg-[#0000004c] rounded-xl border-4 border-solid border-black shadow-[8px_8px_0px_#000000] overflow-hidden">

          {/* Roster Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#330081] border-b-4 border-black shrink-0">
            <span className="font-rubik italic text-[#5ffcc9] text-lg font-bold leading-none select-none">
              KRU BERGABUNG ({room.players.length}/{maxPlayers})
            </span>
            <div className="flex gap-2">
              <div className="w-3 h-3 bg-[#ffb4ab] rounded-full border border-black" />
              <div className="w-3 h-3 bg-[#41e5b3] rounded-full border border-black" />
              <div className="w-3 h-3 bg-[#ffc312] rounded-full border border-black" />
            </div>
          </div>

          {/* Roster Grid */}
          <div className="grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-4 xl:grid-cols-5 gap-3 p-4 overflow-y-auto flex-1">
            {/* Gunakan room dari context agar selalu fresh setelah room-updated */}
            {(ctxRoom ?? roomProp).players.map((p) => {
              // Semua pemain ikut skinId-nya masing-masing; default Guru=7, Siswa=0
              const defaultSkinId = p.isGuru ? 7 : 0;
              const skin = SKINS[p.skinId ?? defaultSkinId] ?? SKINS[defaultSkinId];
              const self = isSelf(p);
              return (
                <div key={p.id} className="flex flex-col items-center gap-1 animate-fadeIn">
                  <div
                    className={`aspect-square w-full rounded-xl border-4 flex flex-col items-center justify-center gap-0.5 p-1.5 transition-all duration-200 ${self ? 'scale-105' : ''}`}
                    style={{
                      backgroundColor: skin.bg,
                      color: skin.text,
                      borderColor: self ? '#ffc312' : '#000000',
                      boxShadow: self ? '0 0 0 3px #ffc312, 4px 4px 0px #000' : '4px 4px 0px #000',
                    }}
                  >
                    <span className="text-3xl leading-none select-none">{skin.emoji}</span>
                    <span className="text-[8px] font-mono font-bold leading-none mt-0.5 truncate w-full text-center" style={{ color: skin.text, opacity: 0.8 }}>
                      {skin.name}
                    </span>
                  </div>
                  <div
                    className="text-[9px] sm:text-[10px] font-mono rounded border px-1.5 py-0.5 text-center truncate w-full"
                    style={{
                      backgroundColor: self ? '#ffc312' : '#000000',
                      color: self ? '#3f2e00' : '#e9ddff',
                      borderColor: self ? '#000' : '#4f4632',
                      fontWeight: self ? 700 : 400,
                    }}
                  >
                    {p.name}{self && <span className="font-bold"> (U)</span>}
                  </div>
                </div>
              );
            })}

            {/* Empty Slots */}
            {Array.from({ length: Math.max(0, maxPlayers - room.players.length) }).map((_, idx) => (
              <div key={idx} className="aspect-square w-full rounded-xl border-4 border-dashed border-[#4f4632] flex items-center justify-center opacity-25 select-none">
                <span className="font-mono text-[#d3c5ab] text-lg">?</span>
              </div>
            ))}
          </div>

          {/* Action Footer */}
          <div className="px-4 py-3 border-t-4 border-black bg-[#270067] flex items-center justify-between gap-3 shrink-0">
            <button
              onClick={() => window.location.reload()}
              className="flex items-center gap-1.5 text-xs text-[#d3c5ab] hover:text-white transition-colors underline cursor-pointer whitespace-nowrap"
            >
              <LogOut size={13} />
              <span>Ganti Nama / Keluar</span>
            </button>

            {isGuru ? (
              <button
                onClick={startGame}
                disabled={room.players.length < 2}
                className="inline-flex items-center justify-center gap-3 px-8 py-3 bg-[#93000a] text-[#ffdad6] border-4 border-solid border-black rounded-xl shadow-[4px_4px_0px_#000000] hover:bg-[#ffb4ab] hover:text-[#690005] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all font-rubik text-lg font-bold italic cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:translate-x-0"
              >
                <span>MULAI GAME</span>
                <Play size={16} fill="currentColor" />
              </button>
            ) : (
              <div className="px-5 py-2 bg-[#22005c] border-2 border-[#4f4632] rounded-lg">
                <span className="font-mono text-[#d3c5ab] text-xs font-bold">MENUNGGU GURU...</span>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
