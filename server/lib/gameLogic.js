// Logika inti permainan: win conditions, voting tally, room ticker
const { rooms, getSanitizedRoom, getVoteSummary } = require('./roomHelpers');

/** Memeriksa kondisi kemenangan setelah setiap perubahan state */
function checkWinConditions(roomCode, io) {
  const room = rooms[roomCode];
  if (!room || room.state !== 'playing') return;

  const living       = room.players.filter(p => !p.isDead && !p.isGuru);
  const citizens     = living.filter(p => p.role === 'warga');
  const provocateurs = living.filter(p => p.role === 'provokator');

  // Provokator menang: semua warga habis atau jumlah warga ≤ provokator
  if (citizens.length === 0 || citizens.length <= provocateurs.length) {
    _endGame(roomCode, io, 'provokator', 'Jumlah Provokator sama dengan atau melebihi Warga!');
    return;
  }

  // Warga menang: semua provokator tereliminasi
  if (provocateurs.length === 0) {
    _endGame(roomCode, io, 'warga', 'Semua Provokator berhasil dieliminasi!');
    return;
  }

  // Warga menang: semua tugas selesai
  if (room.tasksCompleted >= room.tasksRequired) {
    _endGame(roomCode, io, 'warga', 'Warga berhasil menyelesaikan seluruh tugas Pancasila!');
  }
}

function _endGame(roomCode, io, winner, reason) {
  const room = rooms[roomCode];
  if (!room || room.state === 'ended') return;
  room.state      = 'ended';
  room.winner     = winner;
  room.winReason  = reason;   // simpan alasan kemenangan
  io.to(roomCode).emit('game-over', { winner, reason });
  io.to(roomCode).emit('room-updated', getSanitizedRoom(roomCode));
}

/** Menghitung hasil voting musyawarah dan menentukan eliminasi */
function tallyVotes(roomCode, io) {
  const room = rooms[roomCode];
  if (!room?.debate?.active) return;

  const votes      = room.debate.votes;
  const voteCounts = {};
  let skipVotes    = 0;

  Object.values(votes).forEach(votedId => {
    if (votedId === 'skip') skipVotes++;
    else voteCounts[votedId] = (voteCounts[votedId] || 0) + 1;
  });

  let highestVotedId = null;
  let highestVotes   = 0;
  let isTie          = false;

  Object.entries(voteCounts).forEach(([id, count]) => {
    if (count > highestVotes) {
      highestVotes = count; highestVotedId = id; isTie = false;
    } else if (count === highestVotes) {
      isTie = true;
    }
  });

  let eliminatedPlayer = null;
  let reason           = '';

  if (skipVotes >= highestVotes && skipVotes > 0) {
    reason = 'Mayoritas memilih Skip. Tidak ada yang dieliminasi.';
  } else if (isTie) {
    reason = 'Hasil voting seri! Tidak ada yang dieliminasi.';
  } else if (highestVotedId) {
    const target = room.players.find(p => p.id === highestVotedId);
    if (target) {
      target.isDead = true;
      eliminatedPlayer = target;
      room.gameStats.playersEliminated++;
      room.gameStats.eventLog.push({ time: Date.now(), type: 'eliminated', message: `${target.name} dieliminasi oleh voting!` });
      reason = `Musyawarah memutuskan mengeliminasi ${target.name}!`;
    } else {
      reason = 'Tidak ada suara sah yang mencukupi.';
    }
  } else {
    reason = 'Tidak ada suara yang masuk.';
  }

  room.debate.active   = false;
  room.debate.votedOut = eliminatedPlayer?.name ?? null;
  room.state           = 'playing';

  io.to(roomCode).emit('debate-ended', {
    eliminated:  eliminatedPlayer ? { name: eliminatedPlayer.name, role: eliminatedPlayer.role } : null,
    reason,
    voteSummary: getVoteSummary(room),
  });

  checkWinConditions(roomCode, io);
  io.to(roomCode).emit('room-updated', getSanitizedRoom(roomCode));
}

/**
 * Ticker interval 1 detik.
 * Mengelola: game timer, sabotase (2 fase), duel, debat voting, debat topik.
 */
function startRoomTicker(roomCode, io) {
  const room = rooms[roomCode];
  if (!room) return;

  if (room.tickerInterval) clearInterval(room.tickerInterval);

  room.tickerInterval = setInterval(() => {
    const r = rooms[roomCode];
    if (!r) { clearInterval(room.tickerInterval); return; }

    // Hapus room kosong
    if (r.players.length === 0) {
      console.log(`Room ${roomCode} kosong, dihapus.`);
      clearInterval(r.tickerInterval);
      delete rooms[roomCode];
      return;
    }

    let changed = false;

    // ── 1. Game timer keseluruhan ──
    if (r.state === 'playing' && r.gameTimer != null && r.gameTimer > 0) {
      r.gameTimer--;
      changed = true;
      if (r.gameTimer <= 0) {
        r.gameStats.eventLog.push({ time: Date.now(), type: 'timeout', message: 'Waktu permainan habis! Provokator menang.' });
        _endGame(roomCode, io, 'provokator', 'Waktu permainan habis sebelum Warga menyelesaikan semua tugas!');
        return;
      }
    }

    // ── 2. Timer sabotase (2 fase) ──
    if (r.sabotage?.active) {
      r.sabotage.timer--;
      changed = true;
      if (r.sabotage.timer <= 0) {
        if (r.sabotage.phase === 'provokator_quiz') {
          // Provokator gagal jawab soal math → sabotase batal
          r.sabotage = null;
          io.to(roomCode).emit('sabotage-cancelled', { reason: 'Provokator gagal menyelesaikan soal kilat! Sabotase dibatalkan.' });
        } else {
          // Fase rescue: Warga gagal → Provokator menang
          r.sabotage.active = false;
          r.gameStats.sabotagesFailed++;
          r.gameStats.eventLog.push({ time: Date.now(), type: 'sabotage_failed', message: 'Sabotase gagal diatasi! Provokator menang!' });
          _endGame(roomCode, io, 'provokator', 'Sabotase Pancasila gagal diatasi tepat waktu!');
          return;
        }
      }
    }

    // ── 3. Timer duel ──
    if (r.duel?.active) {
      r.duel.timer--;
      changed = true;
      if (r.duel.timer <= 0) {
        // Waktu habis → seri, tidak ada yang tereliminasi
        r.duel = null;
        io.to(roomCode).emit('duel-resolved', { winner: null, loser: null, reason: 'Waktu duel habis! Kedua pihak selamat.' });
      }
    }

    // ── 4. Timer debat voting ──
    if (r.debate?.active && r.debate.timer > 0) {
      r.debate.timer--;
      changed = true;
      if (r.debate.timer <= 0) tallyVotes(roomCode, io);
    }

    // ── 5. Timer debat topik bebas ──
    if (r.topicDebate?.active && r.topicDebate.timer > 0) {
      r.topicDebate.timer--;
      changed = true;
      if (r.topicDebate.timer <= 0) {
        r.topicDebate.active = false;
        r.topicDebate = null;
        io.to(roomCode).emit('topic-debate-ended', { message: 'Sesi debat topik selesai!' });
      }
    }

    if (changed) io.to(roomCode).emit('room-updated', getSanitizedRoom(roomCode));
  }, 1000);
}

module.exports = { checkWinConditions, tallyVotes, startRoomTicker };
