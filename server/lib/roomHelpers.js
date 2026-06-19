// Helper murni (pure) untuk operasi room — tidak bergantung pada io/socket
const { DEFAULT_SETTINGS } = require('../data/defaults');

// Penyimpanan in-memory semua room aktif
const rooms = {};

/** Menghasilkan kode room unik 6 karakter huruf kapital */
function generateRoomCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Menghasilkan salinan data room yang aman dikirim ke client.
 * Peran rahasia pemain TIDAK disertakan agar tidak bisa di-cheat.
 */
function getSanitizedRoom(roomCode) {
  const room = rooms[roomCode];
  if (!room) return null;

  // Cari provokator yang sedang cooldown untuk dikirim ke client-nya sendiri
  // (dikirim per-socket di handler, bukan di sini — tapi kita expose duelCooldownEndsAt per player)
  return {
    code:           room.code,
    state:          room.state,
    winner:         room.winner,
    winReason:      room.winReason ?? null,   // alasan kemenangan
    tasksCompleted: room.tasksCompleted,
    tasksRequired:  room.tasksRequired,
    gameTimer:      room.gameTimer ?? null,   // sisa waktu game (detik)
    settings:       room.settings || { ...DEFAULT_SETTINGS },
    showStatsToAll: !!room.showStatsToAll,

    // Sabotase: fase 1 = Provokator menjawab soal math, fase 2 = Warga terpilih menjawab
    sabotage: room.sabotage ? {
      active:          room.sabotage.active,
      phase:           room.sabotage.phase,       // 'provokator_quiz' | 'warga_rescue'
      timer:           room.sabotage.timer,
      targetWargaName: room.sabotage.targetWargaName ?? null,
      question:        _stripQuestion(room.sabotage.question),
    } : null,

    duel: room.duel ? {
      active:      room.duel.active,
      timer:       room.duel.timer,
      provocateur: room.players.find(p => p.id === room.duel.provocateur)?.name,
      citizen:     room.players.find(p => p.id === room.duel.citizen)?.name,
      question:    _stripQuestion(room.duel.question),
    } : null,

    debate: room.debate ? {
      active:             room.debate.active,
      timer:              room.debate.timer,
      reason:             room.debate.reason,
      votedOut:           room.debate.votedOut,
      votesReceivedCount: Object.keys(room.debate.votes || {}).length,
      chat:               room.debate.chat || [],
      // Hanya kirim daftar ID pemain yang sudah voting (merahasiakan pilihan mereka)
      votes:              Object.keys(room.debate.votes || {}).reduce((acc, voterId) => { acc[voterId] = true; return acc; }, {}),
    } : null,

    // Debat topik bebas (terpisah dari voting debate)
    topicDebate: room.topicDebate ? {
      active: room.topicDebate.active,
      timer:  room.topicDebate.timer,
      topic:  room.topicDebate.topic,
    } : null,

    // Presentasi random
    presentation: room.presentation ? {
      active:     room.presentation.active,
      playerName: room.presentation.playerName,
      playerId:   room.presentation.playerId,
    } : null,

    gameStats: room.gameStats || null,

    players: room.players.map(p => ({
      id:                 p.id,
      name:               p.name,
      isGuru:             p.isGuru,
      isDead:             p.isDead,
      score:              p.score,
      isOnline:           p.isOnline,
      skinId:             p.skinId ?? 0,
      duelCooldownEndsAt: p.duelCooldownEndsAt ?? null, // timestamp ms
    })),
  };
}

/** Strip soal — hanya kirim field yang dibutuhkan client (tanpa kunci jawaban) */
function _stripQuestion(q) {
  if (!q) return null;
  return { id: q.id, sila: q.sila, type: q.type, question: q.question, options: q.options };
}

/** Menghasilkan ringkasan suara voting untuk ditampilkan setelah debat */
function getVoteSummary(room) {
  if (!room?.debate) return {};
  const summary = {};
  room.players.forEach(p => {
    if (p.isGuru) return;
    const targetId = room.debate.votes[p.id];
    if (targetId === 'skip') {
      summary[p.name] = 'Skip';
    } else if (targetId) {
      const target = room.players.find(tp => tp.id === targetId);
      summary[p.name] = target ? target.name : 'Unknown';
    } else {
      summary[p.name] = 'Tidak Memilih';
    }
  });
  return summary;
}

module.exports = { rooms, generateRoomCode, getSanitizedRoom, getVoteSummary };
