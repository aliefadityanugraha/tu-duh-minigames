// Handler: join-room, join-as-spectator, disconnect
const { rooms, generateRoomCode, getSanitizedRoom } = require('../lib/roomHelpers');
const { DEFAULT_SETTINGS, EMPTY_GAME_STATS } = require('../data/defaults');
const { PANCASILA_QUESTIONS } = require('../data/questions');
const { startRoomTicker, checkWinConditions, tallyVotes } = require('../lib/gameLogic');

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
        questions:      JSON.parse(JSON.stringify(PANCASILA_QUESTIONS)),
        players:        [],
        sabotage:       null,
        duel:           null,
        debate:         null,
        showStatsToAll: false,
        gameStats:      EMPTY_GAME_STATS(),
      };
      console.log(`Room baru: ${code} oleh Guru ${name}`);
    }

    const room = rooms[code];
    if (!room) { socket.emit('join-error', 'Room tidak ditemukan!'); return; }

    const existingPlayer = sessionId ? room.players.find(p => p.sessionId === sessionId) : null;
    
    if (existingPlayer) {
      // Reconnect
      existingPlayer.id = socket.id;
      existingPlayer.isOnline = true;
      if (room.state === 'lobby') {
        existingPlayer.name = name; // izinkan ganti nama jika masih di lobi
      }
      socket.join(code);
      socket.roomCode = code;
      
      io.to(code).emit('room-updated', getSanitizedRoom(code));
      socket.emit('join-success', { roomCode: code, player: existingPlayer });
      
      if (room.state === 'playing') {
        socket.emit('role-assigned', { role: existingPlayer.role, isGuru: existingPlayer.isGuru, tasksRequired: room.tasksRequired });
      }
      console.log(`${existingPlayer.name} (Reconnected) ke room ${code}`);
      return;
    }

    if (room.state !== 'lobby') { socket.emit('join-error', 'Game sudah dimulai!'); return; }

    const isDuplicate = room.players.some(p => p.name.toLowerCase() === name.toLowerCase());
    if (isDuplicate) { socket.emit('join-error', `Nama "${name}" sudah terpakai.`); return; }

    if (room.players.length >= (room.settings.maxPlayers || 10)) {
      socket.emit('join-error', 'Room sudah penuh.'); return;
    }

    const newPlayer = { id: socket.id, sessionId, name, isGuru: !!isGuru, role: isGuru ? 'guru' : null, isDead: false, score: 0, answerHistory: [], isOnline: true, skinId: 0 };
    room.players.push(newPlayer);
    socket.join(code);
    socket.roomCode = code;

    startRoomTicker(code, io);
    io.to(code).emit('room-updated', getSanitizedRoom(code));
    socket.emit('join-success', { roomCode: code, player: newPlayer });
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
      io.to(code).emit('room-updated', getSanitizedRoom(code));
      io.to(code).emit('player-left', { name: leaving.name, isOffline: true });
      return; // Berhenti di sini, jangan di-splice!
    }

    // Jika masih di lobi, hapus dari room
    room.players.splice(idx, 1);

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

module.exports = { registerJoinHandlers };
