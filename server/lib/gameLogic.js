// Logika inti permainan: win conditions, voting tally, room ticker
const { rooms, getSanitizedRoom, getVoteSummary } = require('./roomHelpers');

/** Memeriksa kondisi kemenangan setelah setiap perubahan state */
function checkWinConditions(roomCode, io) {
  const room = rooms[roomCode];
  if (!room || room.state !== 'playing') return;

  const living       = room.players.filter(p => !p.isDead && !p.isGuru);
  const citizens     = living.filter(p => p.role === 'warga');
  const provocateurs = living.filter(p => p.role === 'provokator');

  // Provokator menang: semua warga tereliminasi
  if (citizens.length === 0) {
    _endGame(roomCode, io, 'provokator', 'Semua Warga telah tereliminasi!');
    return;
  }

  // Provokator menang: jumlah Warga <= jumlah Provokator (parity)
  if (citizens.length > 0 && citizens.length <= provocateurs.length) {
    _endGame(roomCode, io, 'provokator', `Jumlah Warga (${citizens.length}) tidak lagi melebihi Provokator (${provocateurs.length})!`);
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
  if (room.tickerInterval) clearInterval(room.tickerInterval);
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

  // Hanya pemain online yang bisa memilih (offline tidak dihitung agar voting tidak mandek)
  const livingCount = room.players.filter(p => !p.isDead && !p.isGuru && p.isOnline !== false).length;
  const majorityThreshold = Math.ceil(livingCount / 2);

  if (skipVotes >= highestVotes && skipVotes > 0) {
    reason = 'Mayoritas memilih Skip. Tidak ada yang dieliminasi.';
  } else if (isTie) {
    reason = 'Hasil voting seri! Tidak ada yang dieliminasi.';
  } else if (highestVotedId && highestVotes >= majorityThreshold) {
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
  } else if (highestVotedId) {
    reason = `Suara tidak mencapai mayoritas (${highestVotes}/${majorityThreshold}). Tidak ada yang dieliminasi.`;
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

    // ── 1. Game timer keseluruhan (pause saat musyawarah / debat topik) ──
    const timerPaused = r.debate?.active || r.topicDebate?.active;
    if (r.state === 'playing' && !timerPaused && r.gameTimer != null && r.gameTimer > 0) {
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
          r.sabotage = null;
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
        const provId = r.duel.provocateur;
        const citId = r.duel.citizen;
        r.duel = null;
        // Notifikasi hanya ke peserta duel (privat)
        const timeoutPayload = { winner: null, loser: null, reason: 'Waktu duel habis! Kedua pihak selamat.' };
        io.to(provId).emit('duel-resolved', timeoutPayload);
        io.to(citId).emit('duel-resolved', timeoutPayload);
      }
    }

    // ── 4. Timer debat voting ──
    if (r.debate?.active && r.debate.timer > 0) {
      r.debate.timer--;
      changed = true;
      if (r.debate.timer <= 0) tallyVotes(roomCode, io);
    }

    // ── 5. Timer debat topik bebas (Terstruktur Exact) ──
    if (r.topicDebate?.active && r.topicDebate.totalTimer > 0) {
      r.topicDebate.totalTimer--;
      r.topicDebate.phaseTimer--;
      changed = true;

      if (r.topicDebate.totalTimer <= 0) {
        // Keseluruhan waktu debat habis
        r.topicDebate.active = false;
        r.topicDebate = null;
        io.to(roomCode).emit('topic-debate-ended', { message: 'Sesi debat topik selesai!' });
      } else if (r.topicDebate.phaseTimer <= 0) {
        // Daftar urutan fase yang pasti
        const DEBATE_SEQ = [
          { phase: 'thinking', timer: 30 },
          { phase: 'pro_turn', timer: 30 },
          { phase: 'transition', timer: 5, nextPhase: 'kontra_turn' },
          { phase: 'kontra_turn', timer: 30 },
          { phase: 'transition', timer: 5, nextPhase: 'pro_turn' },
          { phase: 'pro_turn', timer: 30 },
          { phase: 'transition', timer: 5, nextPhase: 'kontra_turn' },
          { phase: 'kontra_turn', timer: 30 }
        ];
        
        r.topicDebate.phaseIndex = (r.topicDebate.phaseIndex ?? 0) + 1;
        
        if (r.topicDebate.phaseIndex >= DEBATE_SEQ.length) {
          r.topicDebate.active = false;
          r.topicDebate = null;
          io.to(roomCode).emit('topic-debate-ended', { message: 'Sesi debat topik selesai!' });
        } else {
          const nextSeq = DEBATE_SEQ[r.topicDebate.phaseIndex];
          r.topicDebate.phase = nextSeq.phase;
          r.topicDebate.phaseTimer = nextSeq.timer;
          if (nextSeq.nextPhase) r.topicDebate.nextPhase = nextSeq.nextPhase;
        }
      }
    }

    // ── 6. Timer presentasi (auto-end jika Guru lupa menekan tombol selesai) ──
    if (r.presentation?.active && r.presentation?.timer != null && r.presentation.timer > 0) {
      r.presentation.timer--;
      changed = true;
      if (r.presentation.timer <= 0) {
        r.presentation.active = false;
        r.presentation = null;
        io.to(roomCode).emit('presentation-ended', { message: 'Waktu presentasi habis! Sesi selesai otomatis.' });
      }
    }

    // ── 7. Timer per-misi (15 detik per task) ──
    if (r.activeTaskSessions && r.state === 'playing') {
      const timerPausedTask = r.sabotage?.active || r.duel?.active || r.debate?.active || r.topicDebate?.active;
      if (!timerPausedTask) {
        for (const [socketId, session] of Object.entries(r.activeTaskSessions)) {
          if (session.timer != null && session.timer > 0) {
            session.timer--;
            // Kirim timer update ke pemain yang punya session ini
            io.to(socketId).emit('task-timer-update', { sessionId: session.sessionId, timer: session.timer });
            if (session.timer <= 0) {
              // Timeout — misi otomatis berganti, tanpa score
              const player = r.players.find(p => p.id === socketId);
              if (player) {
                r.gameStats.totalAnswersWrong++;
                player.answerHistory.push({
                  questionId: session.questionId ?? null,
                  minigameType: session.type !== 'quiz' ? session.type : null,
                  correct: false,
                  timestamp: Date.now(),
                });
              }
              delete r.activeTaskSessions[socketId];
              // Beritahu pemain bahwa misi timeout
              io.to(socketId).emit('task-timeout', { sessionId: session.sessionId, message: 'Waktu misi habis! Misi berganti otomatis.' });
              changed = true;
            }
          }
        }
      }
    }

    if (changed) io.to(roomCode).emit('room-updated', getSanitizedRoom(roomCode));
  }, 1000);
}

module.exports = { checkWinConditions, tallyVotes, startRoomTicker };
