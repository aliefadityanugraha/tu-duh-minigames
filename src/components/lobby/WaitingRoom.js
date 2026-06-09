import React from 'react';
import { Play, LogOut, Settings, Timer } from 'lucide-react';
import Navbar from '../Navbar';

export default function WaitingRoom({ socket, room, player, roleInfo }) {
  const isGuru = player?.isGuru ?? roleInfo?.isGuru ?? false;
  const isSelf = (p) => p.id === player?.id;

  const currentSettings = room?.settings || {};
  const caseStudy      = currentSettings.caseStudy      || 'anti-hoaks';
  const gameTimer      = currentSettings.gameTimer       || 300;
  const provokatorCount= String(currentSettings.provokatorCount || 'auto');
  const tasksPerPlayer = currentSettings.tasksPerPlayer  || 5;
  const sabotageTimer  = currentSettings.sabotageTimer   || 40;
  const duelTimer      = currentSettings.duelTimer       || 20;
  const debateTimer    = currentSettings.debateTimer     || 90;
  const maxPlayers     = currentSettings.maxPlayers      || 10;

  const avatarColors = [
    'bg-[#ffb4ab] text-[#690005]',
    'bg-[#8fb2ff] text-[#002d70]',
    'bg-[#5ffcc9] text-[#003829]',
    'bg-[#ffdf9c] text-[#251a00]',
    'bg-[#ffb7d7] text-[#5b002c]',
    'bg-[#cda4ff] text-[#2c005b]',
    'bg-[#ffc58f] text-[#4d2100]',
    'bg-[#8ffff3] text-[#003833]',
  ];

  const updateSetting = (key, value) => {
    if (!isGuru) return;
    const nextSettings = { ...currentSettings, [key]: value };
    socket?.emit('update-settings', nextSettings);
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
        type="range"
        min={min} max={max} step={step}
        value={value}
        disabled={!isGuru}
        onChange={e => updateSetting(settingKey, Number(e.target.value))}
        className={`w-full accent-[#ffc312] h-2 rounded-full cursor-pointer ${!isGuru ? 'opacity-40 cursor-not-allowed' : ''}`}
      />
    </div>
  );

  return (
    <div className="w-full flex flex-col min-h-screen bg-[#190047] animate-fadeIn">

      {/* ── GLOBAL NAVBAR ── */}
      <Navbar navItems={waitingNavItems} roomCode={room.code} />

      {/* ── MAIN GRID ── */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 p-4 lg:p-5 w-full bg-[#190047]">

        {/* ══ LEFT: PENGATURAN GAME (Guru) / STATUS (Siswa) ══ */}
        <div className="lg:col-span-4 flex flex-col gap-4">

          {isGuru ? (
            /* ── GURU: Pengaturan Game ── */
            <div className="flex flex-col gap-0 w-full bg-[#40009d] rounded-xl border-4 border-solid border-black shadow-[8px_8px_0px_#000000] overflow-hidden">

              {/* Panel Header */}
              <div className="flex items-center gap-3 px-5 py-3 bg-[#4500a8] border-b-4 border-black">
                <Settings size={18} className="text-[#ffe5b3]" />
                <span className="font-rubik italic text-[#ffe5b3] text-xl font-bold leading-none whitespace-nowrap">
                  PENGATURAN GAME
                </span>
              </div>

              <div className="flex flex-col gap-5 p-5">

                {/* CASE STUDY PACKAGE */}
                <div className="flex flex-col gap-2 w-full">
                  <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Case Study Package</span>
                  <div className="flex items-center p-1 w-full bg-black rounded-lg border-2 border-[#4f4632] gap-1">
                    {[
                      { label: 'Anti-Hoaks', val: 'anti-hoaks' },
                      { label: 'Saring Info', val: 'saring-informasi' },
                    ].map(item => (
                      <button
                        key={item.val}
                        onClick={() => updateSetting('caseStudy', item.val)}
                        className={`flex-1 py-2.5 font-mono text-sm font-bold text-center rounded border-2 transition-all ${
                          caseStudy === item.val
                            ? 'bg-[#ffc312] text-[#6e5200] border-black'
                            : 'bg-transparent text-[#d3c5ab] border-transparent hover:text-white'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* GAME TIMER */}
                <div className="flex flex-col gap-2 w-full">
                  <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Game Timer</span>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { label: '5 MIN', val: 300 },
                      { label: '7 MIN', val: 420 },
                      { label: '10 MIN', val: 600 },
                    ].map(item => (
                      <button
                        key={item.val}
                        onClick={() => updateSetting('gameTimer', item.val)}
                        className={`py-2.5 font-mono text-xs font-bold text-center border-4 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
                          gameTimer === item.val
                            ? 'bg-[#ffc312] text-[#6e5200]'
                            : 'bg-[#270067] text-[#e9ddff] hover:bg-[#330081]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* PROVOKATOR COUNT */}
                <div className="flex flex-col gap-2 w-full">
                  <span className="font-mono text-[#41e5b3] text-[11px] font-bold tracking-[1.5px] uppercase">Jumlah Provokator</span>
                  <div className="grid grid-cols-3 gap-2 w-full">
                    {[
                      { label: 'Auto', val: 'auto' },
                      { label: '1', val: '1' },
                      { label: '2', val: '2' },
                    ].map(item => (
                      <button
                        key={item.val}
                        onClick={() => updateSetting('provokatorCount', item.val)}
                        className={`py-2.5 font-mono text-xs font-bold text-center border-4 border-black shadow-[3px_3px_0px_#000000] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all ${
                          provokatorCount === item.val
                            ? 'bg-[#ffc312] text-[#6e5200]'
                            : 'bg-[#270067] text-[#e9ddff] hover:bg-[#330081]'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DIVIDER */}
                <div className="w-full border-t-2 border-[#4f4632]" />

                {/* ADVANCED SLIDERS */}
                <div className="flex flex-col gap-4">
                  <span className="font-mono text-[#9c8f78] text-[10px] font-bold tracking-[1.5px] uppercase">Pengaturan Lanjutan</span>

                  <SliderRow
                    label="Tugas per Warga"
                    settingKey="tasksPerPlayer"
                    value={tasksPerPlayer}
                    min={1} max={15}
                    format={v => `${v} soal`}
                  />

                  <SliderRow
                    label="Timer Sabotase"
                    settingKey="sabotageTimer"
                    value={sabotageTimer}
                    min={15} max={90} step={5}
                    format={v => `${v}s`}
                  />

                  <SliderRow
                    label="Timer Duel"
                    settingKey="duelTimer"
                    value={duelTimer}
                    min={10} max={60} step={5}
                    format={v => `${v}s`}
                  />

                  <SliderRow
                    label="Timer Musyawarah"
                    settingKey="debateTimer"
                    value={debateTimer}
                    min={30} max={180} step={10}
                    format={v => `${v}s`}
                  />

                  <SliderRow
                    label="Maks. Pemain"
                    settingKey="maxPlayers"
                    value={maxPlayers}
                    min={3} max={10}
                    format={v => `${v} orang`}
                  />
                </div>

              </div>
            </div>
          ) : (
            /* ── SISWA: Panel status menunggu ── */
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
              {/* Info pengaturan (read-only untuk siswa) */}
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
          )}
        </div>

        {/* ══ RIGHT: ROSTER PEMAIN ══ */}
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
            {room.players.map((p, idx) => {
              const colorClass = p.isGuru
                ? 'bg-[#ffc312] text-[#3f2e00] border-black'
                : avatarColors[idx % avatarColors.length];
              return (
                <div key={p.id} className="flex flex-col items-center gap-1 animate-fadeIn">
                  <div className={`aspect-square w-full rounded-xl border-4 border-black shadow-neo-sm flex items-center justify-center p-2 ${colorClass}`}>
                    <span className="text-3xl select-none">
                      {p.isGuru ? '🏫' : '🧑‍🚀'}
                    </span>
                  </div>
                  <div className="bg-black text-[#e9ddff] text-[9px] sm:text-[10px] font-mono rounded border border-[#4f4632] px-1.5 py-0.5 text-center truncate w-full">
                    {p.name}
                    {isSelf(p) && <span className="text-[#ffc312] font-bold"> (U)</span>}
                  </div>
                </div>
              );
            })}

            {/* Empty Slot Placeholders */}
            {Array.from({ length: Math.max(0, maxPlayers - room.players.length) }).map((_, idx) => (
              <div
                key={idx}
                className="aspect-square w-full rounded-xl border-4 border-dashed border-[#4f4632] flex items-center justify-center opacity-25 select-none"
              >
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
