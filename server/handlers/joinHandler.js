// Handler: join-room, join-as-spectator, disconnect
const crypto = require('crypto');
const { rooms, generateRoomCode, getSanitizedRoom } = require('../lib/roomHelpers');
const { DEFAULT_SETTINGS, DEFAULT_SKINS, EMPTY_GAME_STATS } = require('../data/defaults');
const { PANCASILA_QUESTIONS } = require('../data/questions');
const { startRoomTicker, checkWinConditions, tallyVotes } = require('../lib/gameLogic');

// Idle cleanup: hapus room yang sudah tidak ada pemain online selama 10 menit di lobby
const IDLE_LOBBY_TIMEOUT = 10 * 60 * 1000; // 10 menit

// Map untuk melacak timeout reconnect pemain yang disconnect saat game berlangsung
const reconnectTimeouts = new Map();

function registerJoinHandlers(socket, io) {

  // ── Bergabung / membuat room ──
  socket.on('join-room', ({ roomCode, name, isGuru, sessionId }) => {
    let code = roomCode ? roomCode.toUpperCase() : null;

    // Guru tanpa kode → buat room baru
    if (!code) {
      code = generateRoomCode();
      rooms[code] = {
        code,
        state:          'lobby',
        winner:         null,
        tasksCompleted: 0,
        tasksRequired:  0,
        settings:       { ...DEFAULT_SETTINGS },
        skins:          [...DEFAULT_SKINS],
        questions:      JSON.parse(JSON.stringify(PANCASILA_QUESTIONS)),
        players:        [],
        sabotage:       null,
        duel:           null,
        debate:         null,
        showStatsToAll: false,
        gameStats:      EMPTY_GAME_STATS(),
        lastActivity:   Date.now(), // Track aktivitas terakhir
      };
      console.log(`Room baru: ${code} oleh Guru ${name}`);
    }

    const room = rooms[code];
    if (!room) { socket.emit('join-error', 'Room tidak ditemukan!'); return; }

    // Update aktivitas saat ada pemain join
    room.lastActivity = Date.now();

    const existingPlayer = sessionId ? room.players.find(p => p.sessionId === sessionId) : null;
    
    if (existingPlayer) {
      // Reconnect — batalkan timeout zombie jika ada
      const oldId = existingPlayer.id;
      if (reconnectTimeouts.has(oldId)) {
        clearTimeout(reconnectTimeouts.get(oldId));
        reconnectTimeouts.delete(oldId);
      }

      // Pindahkan session task ke socket id baru
      if (oldId !== socket.id && room.activeTaskSessions?.[oldId]) {
        room.activeTaskSessions[socket.id] = room.activeTaskSessions[oldId];
        delete room.activeTaskSessions[oldId];
      }
      existingPlayer.id = socket.id;
      existingPlayer.isOnline = true;
      if (room.state === 'lobby') {
        existingPlayer.name = name; // izinkan ganti nama jika masih di lobi
      }
      socket.join(code);
      socket.roomCode = code;
      
      socket.emit('skin-list-updated', room.skins || DEFAULT_SKINS);
      io.to(code).emit('room-updated', getSanitizedRoom(code));
      socket.emit('join-success', { roomCode: code, player: existingPlayer, sessionId: existingPlayer.sessionId });
      
      if (room.state === 'playing') {
        let teammates = [];
        if (existingPlayer.role === 'provokator') {
          teammates = room.players
            .filter(tp => tp.role === 'provokator')
            .map(tp => tp.id);
        }
        socket.emit('role-assigned', { role: existingPlayer.role, isGuru: existingPlayer.isGuru, tasksRequired: room.tasksRequired, teammates });
      }
      console.log(`${existingPlayer.name} (Reconnected) ke room ${code}`);
      return;
    }

    if (room.state !== 'lobby') { socket.emit('join-error', 'Game sudah dimulai!'); return; }

    // Server-side name validation — lakukan trim DULU sebelum cek duplikat
    const sanitized = (String(name || '')).trim().slice(0, 12);
    if (sanitized.length < 2) { socket.emit('join-error', 'Nama harus antara 2–12 karakter.'); return; }

    const isDuplicate = room.players.some(p => p.name.toLowerCase() === sanitized.toLowerCase());
    if (isDuplicate) { socket.emit('join-error', `Nama "${sanitized}" sudah terpakai.`); return; }

    if (room.players.length >= 15) {
      socket.emit('join-error', 'Room sudah penuh.'); return;
    }

    const usedColors = new Set(room.players.map(p => p.colorId).filter(c => c !== undefined));
    let colorId = 0;
    for (let i = 0; i < 14; i++) {
      if (!usedColors.has(i)) {
        colorId = i;
        break;
      }
    }
    // Fallback jika 14 warna habis (max 15 pemain)
    if (usedColors.has(colorId)) {
      const colorCounts = Array(14).fill(0);
      room.players.forEach(p => { if (p.colorId !== undefined) colorCounts[p.colorId]++; });
      colorId = colorCounts.indexOf(Math.min(...colorCounts));
    }

    const newPlayer = { id: socket.id, sessionId, name: sanitized, isGuru: !!isGuru, role: isGuru ? 'guru' : null, isDead: false, score: 0, answerHistory: [], isOnline: true, skinId: 0, colorId };
    // Generate server-side session ID untuk keamanan & uniqueness
    newPlayer.sessionId = crypto.randomUUID();
    room.players.push(newPlayer);
    socket.join(code);
    socket.roomCode = code;

    startRoomTicker(code, io);
    socket.emit('skin-list-updated', room.skins || DEFAULT_SKINS);
    io.to(code).emit('room-updated', getSanitizedRoom(code));
    socket.emit('join-success', { roomCode: code, player: newPlayer, sessionId: newPlayer.sessionId });
  });

  // ── Spectator (layar proyektor) ──
  socket.on('join-as-spectator', ({ roomCode }) => {
    const code = roomCode?.trim().toUpperCase();
    const room = rooms[code];
    if (!room) { socket.emit('spectator-error', 'Room tidak ditemukan!'); return; }
    socket.join(code);
    socket.roomCode = code;
    socket.emit('room-updated', getSanitizedRoom(code));
  });

  // ── Keluar secara intentional (logout button) ──
  socket.on('leave-room', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;

    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;

    const leaving = room.players[idx];
    console.log(`${leaving.name} keluar dari room ${code}`);

    // Selalu hapus pemain dari room (baik lobby maupun playing)
    room.players.splice(idx, 1);
    room.lastActivity = Date.now();

    // Update tasksRequired jika Warga yang keluar saat game berlangsung
    if (room.state === 'playing' && leaving.role === 'warga') {
      const s = room.settings || DEFAULT_SETTINGS;
      room.tasksRequired = Math.max(room.tasksCompleted, room.tasksRequired - (s.tasksPerPlayer ?? DEFAULT_SETTINGS.tasksPerPlayer));
    }

    if (room.activeTaskSessions?.[socket.id]) {
      delete room.activeTaskSessions[socket.id];
    }

    // Bersihkan suara voting jika sedang debat
    if (room.debate?.active) delete room.debate.votes[socket.id];

    // Selesaikan duel jika salah satu petarung keluar
    if (room.duel?.active && (room.duel.provocateur === socket.id || room.duel.citizen === socket.id)) {
      const survivorId = room.duel.provocateur === socket.id ? room.duel.citizen : room.duel.provocateur;
      const survivor   = room.players.find(p => p.id === survivorId);
      room.duel = null;
      io.to(code).emit('duel-resolved', {
        winner: survivor?.name ?? 'Unknown',
        loser:  leaving.name,
        reason: `${leaving.name} keluar di tengah duel!`,
      });
    }

    // Paksa tally jika semua pemain hidup sudah memilih
    if (room.debate?.active) {
      const living = room.players.filter(p => !p.isDead && !p.isGuru);
      if (Object.keys(room.debate.votes).length >= living.length && living.length > 0) {
        tallyVotes(code, io);
      }
    }

    // Cek win conditions — pemain keluar bisa mengubah keseimbangan
    checkWinConditions(code, io);

    io.to(code).emit('room-updated', getSanitizedRoom(code));
    io.to(code).emit('player-left', { name: leaving.name, isOffline: false });
  });

  // ── Guru mengeluarkan pemain (Kick) ──
  socket.on('kick-player', (targetId) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;

    const kicker = room.players.find(p => p.id === socket.id);
    if (!kicker || !kicker.isGuru) return;

    const targetIdx = room.players.findIndex(p => p.id === targetId);
    if (targetIdx === -1) return;

    const kicked = room.players[targetIdx];
    io.to(targetId).emit('kicked-by-guru', 'Anda dikeluarkan dari room oleh Guru.');

    room.players.splice(targetIdx, 1);
    room.lastActivity = Date.now();

    const targetSocket = io.sockets.sockets.get(targetId);
    if (targetSocket) {
      targetSocket.leave(code);
      targetSocket.roomCode = null;
    }

    io.to(code).emit('room-updated', getSanitizedRoom(code));
  });

  // ── Disconnect ──
  socket.on('disconnect', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;

    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;

    const leaving = room.players[idx];
    console.log(`${leaving.name} terputus dari room ${code}`);

    // Jika game sedang berjalan, JANGAN hapus pemain (agar bisa reconnect)
    if (room.state === 'playing') {
      leaving.isOnline = false;
      if (room.activeTaskSessions?.[socket.id]) {
        delete room.activeTaskSessions[socket.id];
      }

      // Beri waktu 5 menit untuk reconnect; setelahnya hapus otomatis (zombie cleanup)
      const RECONNECT_TIMEOUT_MS = 5 * 60 * 1000;
      const timeoutId = setTimeout(() => {
        const r = rooms[code];
        if (!r) { reconnectTimeouts.delete(socket.id); return; }
        const pidx = r.players.findIndex(p => p.id === socket.id && !p.isOnline);
        if (pidx === -1) { reconnectTimeouts.delete(socket.id); return; }

        const zombie = r.players[pidx];
        r.players.splice(pidx, 1);

        // Kurangi tasksRequired jika zombie adalah Warga
        if (r.state === 'playing' && zombie.role === 'warga') {
          const s = r.settings || DEFAULT_SETTINGS;
          r.tasksRequired = Math.max(r.tasksCompleted, r.tasksRequired - (s.tasksPerPlayer ?? DEFAULT_SETTINGS.tasksPerPlayer));
        }

        checkWinConditions(code, io);
        io.to(code).emit('room-updated', getSanitizedRoom(code));
        io.to(code).emit('player-left', { name: zombie.name, isOffline: true, reason: 'timeout' });
        reconnectTimeouts.delete(socket.id);
        console.log(`[Reconnect] ${zombie.name} tidak reconnect dalam 5 menit, dihapus dari room ${code}.`);
      }, RECONNECT_TIMEOUT_MS);

      reconnectTimeouts.set(socket.id, timeoutId);

      io.to(code).emit('room-updated', getSanitizedRoom(code));
      io.to(code).emit('player-left', { name: leaving.name, isOffline: true });
      return; // Berhenti di sini, jangan di-splice!
    }

    // Jika masih di lobi, hapus dari room
    room.players.splice(idx, 1);
    room.lastActivity = Date.now();

    // Bersihkan suara voting jika sedang debat
    if (room.debate?.active) delete room.debate.votes[socket.id];

    // Selesaikan duel jika salah satu petarung disconnect
    if (room.duel?.active && (room.duel.provocateur === socket.id || room.duel.citizen === socket.id)) {
      const survivorId = room.duel.provocateur === socket.id ? room.duel.citizen : room.duel.provocateur;
      const survivor   = room.players.find(p => p.id === survivorId);
      room.duel = null;
      io.to(code).emit('duel-resolved', {
        winner: survivor?.name ?? 'Unknown',
        loser:  leaving.name,
        reason: `${leaving.name} keluar di tengah duel!`,
      });
    }

    // Paksa tally jika semua pemain hidup sudah memilih
    if (room.debate?.active) {
      const living = room.players.filter(p => !p.isDead && !p.isGuru);
      if (Object.keys(room.debate.votes).length >= living.length && living.length > 0) {
        tallyVotes(code, io);
      }
    }

    checkWinConditions(code, io);
    io.to(code).emit('room-updated', getSanitizedRoom(code));
    io.to(code).emit('player-left', { name: leaving.name, isOffline: false });
  });
}

// Setup idle cleanup interval: jalankan setiap 5 menit
let cleanupInterval = null;

function startIdleCleanup(io) {
  if (cleanupInterval) return; // Jangan double-start

  cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [code, room] of Object.entries(rooms)) {
      // Hanya cleanup room yang masih di lobby atau playing yang mati
      if (room.state !== 'lobby') {
        // Clean up playing rooms with no online players idle > 30 menit
        if (room.state === 'playing') {
          const hasOnlinePlayer = room.players.some(p => p.isOnline);
          const idleTime = now - (room.lastActivity || 0);
          if (!hasOnlinePlayer && idleTime > 30 * 60 * 1000) {
            console.log(`[Cleanup] Menghapus room playing mati ${code} (idle: ${Math.round(idleTime / 60000)} menit)`);
            if (room.tickerInterval) clearInterval(room.tickerInterval);
            delete rooms[code];
          }
        }
        continue;
      }

      // Cek apakah ada pemain yang masih online
      const hasOnlinePlayer = room.players.some(p => p.isOnline);
      const idleTime = now - (room.lastActivity || 0);

      // Hapus room jika: tidak ada pemain online ATAU sudah idle lebih dari timeout
      if (!hasOnlinePlayer || idleTime > IDLE_LOBBY_TIMEOUT) {
        console.log(`[Cleanup] Menghapus room idle ${code} (idle: ${Math.round(idleTime / 60000)} menit, online: ${hasOnlinePlayer})`);
        if (room.tickerInterval) clearInterval(room.tickerInterval);
        delete rooms[code];
      }
    }
  }, 5 * 60 * 1000); // Setiap 5 menit

  console.log('[Cleanup] Idle room cleanup dimulai (interval 5 menit)');
}

module.exports = { registerJoinHandlers, startIdleCleanup };
