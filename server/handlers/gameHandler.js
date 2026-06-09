/**
 * Handler permainan utama.
 * Mekanik yang diimplementasikan:
 *  - start-game / restart-game
 *  - get-next-question (task Warga)
 *  - submit-answer (task | sabotage_provokator | sabotage_rescue | duel)
 *  - trigger-sabotage  → Provokator jawab soal math 15 detik dulu
 *  - trigger-duel      → 1v1, siapa cepat menang; kalah = eliminasi; cooldown 30 detik
 *  - teacher-pause     → debat voting
 *  - trigger-topic-debate → debat topik bebas (terpisah)
 *  - trigger-presentation → Guru pilih 1 pemain acak untuk presentasi
 *  - vote-player
 *  - toggle-broadcast-stats
 */
const { rooms, getSanitizedRoom } = require('../lib/roomHelpers');
const { DEFAULT_SETTINGS, EMPTY_GAME_STATS } = require('../data/defaults');
const { checkWinConditions, tallyVotes } = require('../lib/gameLogic');
const { generateMathQuiz } = require('../lib/mathQuiz');

const DUEL_COOLDOWN_MS = 30_000; // 30 detik cooldown setelah duel

function registerGameHandlers(socket, io) {

  // ────────────────────────────────────────────
  // MULAI GAME
  // ────────────────────────────────────────────
  socket.on('start-game', () => {
    const room = _getGuruRoom(socket, rooms);
    if (!room) return;

    const nonGurus = room.players.filter(p => !p.isGuru);
    if (nonGurus.length < 2) { socket.emit('game-error', 'Minimal 2 siswa untuk memulai!'); return; }

    const s = room.settings || DEFAULT_SETTINGS;
    Object.assign(room, {
      state:          'playing',
      winner:         null,
      tasksCompleted: 0,
      tasksRequired:  nonGurus.length * s.tasksPerPlayer,
      gameTimer:      s.gameTimer ?? DEFAULT_SETTINGS.gameTimer,
      sabotage:       null,
      duel:           null,
      debate:         null,
      topicDebate:    null,
      presentation:   null,
      gameStats:      { ...EMPTY_GAME_STATS(), startedAt: Date.now() },
    });
    room.gameStats.eventLog.push({ time: Date.now(), type: 'game_start', message: 'Permainan dimulai!' });

    // Tentukan jumlah provokator
    let provCount = s.provokatorCount === 'auto'
      ? (nonGurus.length >= 6 ? 2 : 1)
      : Math.min(Number(s.provokatorCount), Math.floor(nonGurus.length / 2));

    // Acak peran
    const shuffled = [...Array(nonGurus.length).keys()].sort(() => Math.random() - 0.5);
    nonGurus.forEach((p, idx) => {
      p.isDead              = false;
      p.score               = 0;
      p.answerHistory       = [];
      p.duelCooldownEndsAt  = null;
      p.taskLocked          = false;
      p.role = shuffled.indexOf(idx) < provCount ? 'provokator' : 'warga';
    });

    // Kirim peran secara privat
    room.players.forEach(p => {
      io.to(p.id).emit('role-assigned', { role: p.role, isGuru: p.isGuru, tasksRequired: room.tasksRequired });
    });

    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
    io.to(room.code).emit('game-started-alert');
  });

  // ────────────────────────────────────────────
  // RESTART KE LOBBY
  // ────────────────────────────────────────────
  socket.on('restart-game', () => {
    const room = _getGuruRoom(socket, rooms);
    if (!room) return;

    Object.assign(room, {
      state: 'lobby', winner: null, winReason: null, tasksCompleted: 0, gameTimer: null,
      sabotage: null, duel: null, debate: null, topicDebate: null,
      presentation: null, showStatsToAll: false,
      gameStats: EMPTY_GAME_STATS(),
    });
    room.players.forEach(p => {
      p.isDead = false; p.score = 0;
      p.role = p.isGuru ? 'guru' : null;
      p.answerHistory = [];
      p.duelCooldownEndsAt = null;
      p.taskLocked = false;
    });

    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
    io.to(room.code).emit('game-restarted');
  });

  // ────────────────────────────────────────────
  // AMBIL SOAL BERIKUTNYA (task Warga)
  // ────────────────────────────────────────────
  socket.on('get-next-question', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    // Jangan kirim soal jika task sedang terkunci (sabotase aktif fase rescue)
    if (player?.taskLocked) {
      socket.emit('task-locked', { message: 'Tugas Anda sedang terkunci karena sabotase aktif!' });
      return;
    }

    const q = room.questions[Math.floor(Math.random() * room.questions.length)];
    socket.emit('next-question-delivery', { id: q.id, sila: q.sila, type: q.type, question: q.question, options: q.options });
  });

  // ────────────────────────────────────────────
  // SUBMIT JAWABAN (multi-konteks)
  // ────────────────────────────────────────────
  socket.on('submit-answer', ({ questionId, answerIndex, context }) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.isDead) return;

    const isCorrect = _checkAnswer(room, questionId, answerIndex, context);

    switch (context) {
      case 'task':
        if (player.role === 'warga' && room.state === 'playing' && !player.taskLocked)
          _handleTaskAnswer(socket, io, room, player, questionId, isCorrect, code);
        break;

      case 'sabotage_provokator':
        // Provokator menjawab soal math kilat untuk mengaktifkan sabotase
        if (player.role === 'provokator' && room.sabotage?.phase === 'provokator_quiz' &&
            room.sabotage.provocateurId === socket.id)
          _handleSabotageProvokatorAnswer(socket, io, room, player, isCorrect, code);
        break;

      case 'sabotage_rescue':
        // Warga terpilih menjawab soal Pancasila untuk membatalkan sabotase
        if (player.role === 'warga' && room.sabotage?.phase === 'warga_rescue' &&
            room.sabotage.targetWargaId === socket.id)
          _handleSabotageRescue(socket, io, room, player, questionId, isCorrect, code);
        break;

      case 'duel':
        if (room.duel?.active)
          _handleDuelAnswer(socket, io, room, player, questionId, isCorrect, code);
        break;
    }
  });

  // ────────────────────────────────────────────
  // PICU SABOTASE — Fase 1: Provokator jawab soal math
  // ────────────────────────────────────────────
  socket.on('trigger-sabotage', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing' || room.sabotage || room.duel || room.debate?.active || room.topicDebate?.active) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== 'provokator' || player.isDead) return;

    const mathQ = generateMathQuiz();
    const s     = room.settings || DEFAULT_SETTINGS;

    // Fase 1: hanya Provokator yang melihat soal math ini
    room.sabotage = {
      active:         true,
      phase:          'provokator_quiz',
      provocateurId:  socket.id,
      timer:          s.sabotageQuizTimer ?? 15,
      question:       mathQ,
      targetWargaId:  null,
      targetWargaName: null,
    };

    // Kirim soal math hanya ke Provokator
    socket.emit('sabotage-quiz-start', {
      question: mathQ,
      timer:    room.sabotage.timer,
      message:  'Selesaikan soal kilat ini dalam 15 detik untuk mengaktifkan sabotase!',
    });

    // Beritahu semua bahwa sabotase sedang "dipersiapkan" (tanpa detail)
    io.to(code).emit('room-updated', getSanitizedRoom(code));
  });

  // ────────────────────────────────────────────
  // PICU DUEL 1v1
  // ────────────────────────────────────────────
  socket.on('trigger-duel', ({ targetPlayerId }) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing' || room.sabotage || room.duel || room.debate?.active || room.topicDebate?.active) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.role !== 'provokator' || player.isDead) return;

    // Cek cooldown
    if (player.duelCooldownEndsAt && Date.now() < player.duelCooldownEndsAt) {
      const remaining = Math.ceil((player.duelCooldownEndsAt - Date.now()) / 1000);
      socket.emit('duel-cooldown', { remaining, message: `Cooldown duel: ${remaining} detik lagi.` });
      return;
    }

    const target = room.players.find(p => p.id === targetPlayerId);
    if (!target || target.isGuru || target.isDead || target.role !== 'warga') return;

    const q = room.questions[Math.floor(Math.random() * room.questions.length)];
    const s = room.settings || DEFAULT_SETTINGS;

    room.duel = {
      active:      true,
      provocateur: player.id,
      citizen:     target.id,
      question:    q,
      timer:       s.duelTimer ?? 20,
      answered:    {}, // { playerId: answerIndex }
    };

    room.gameStats.duelsTriggered++;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'duel', message: `Duel: ${player.name} vs ${target.name}` });

    io.to(code).emit('duel-triggered', { provocateur: player.name, citizen: target.name });
    io.to(code).emit('room-updated', getSanitizedRoom(code));
  });

  // ────────────────────────────────────────────
  // GURU: PICU DEBAT VOTING
  // ────────────────────────────────────────────
  socket.on('teacher-pause', () => {
    const room = _getGuruRoom(socket, rooms);
    if (!room || room.state !== 'playing') return;

    const s = room.settings || DEFAULT_SETTINGS;
    room.debate = { active: true, timer: s.debateTimer ?? 90, reason: 'teacher_pause', votes: {}, votedOut: null };
    room.gameStats.debatesHeld++;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'debate', message: 'Guru memulai sesi debat voting!' });

    io.to(room.code).emit('debate-triggered', { reason: 'Sesi Diskusi & Debat Pancasila dipandu oleh Guru!' });
    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
  });

  // ────────────────────────────────────────────
  // GURU: PICU DEBAT TOPIK BEBAS
  // ────────────────────────────────────────────
  socket.on('trigger-topic-debate', ({ topic }) => {
    const room = _getGuruRoom(socket, rooms);
    if (!room || room.state !== 'playing' || room.topicDebate?.active || room.debate?.active) return;

    const s = room.settings || DEFAULT_SETTINGS;
    const topicText = (topic || '').trim() || 'Topik bebas — diskusikan nilai Pancasila dalam kehidupan sehari-hari!';

    room.topicDebate = {
      active: true,
      timer:  s.topicDebateTimer ?? 120,
      topic:  topicText,
    };
    room.gameStats.topicDebatesHeld = (room.gameStats.topicDebatesHeld || 0) + 1;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'topic_debate', message: `Debat topik dimulai: "${topicText}"` });

    io.to(room.code).emit('topic-debate-triggered', { topic: topicText, timer: room.topicDebate.timer });
    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
  });

  // ────────────────────────────────────────────
  // GURU: PICU PRESENTASI RANDOM
  // ────────────────────────────────────────────
  socket.on('trigger-presentation', () => {
    const room = _getGuruRoom(socket, rooms);
    if (!room || room.state !== 'playing') return;

    // Pilih pemain hidup secara acak (termasuk Provokator, kecuali Guru)
    const eligible = room.players.filter(p => !p.isGuru && !p.isDead);
    if (eligible.length === 0) { socket.emit('game-error', 'Tidak ada pemain yang bisa dipilih.'); return; }

    const chosen = eligible[Math.floor(Math.random() * eligible.length)];

    room.presentation = { active: true, playerId: chosen.id, playerName: chosen.name };
    room.gameStats.presentationsHeld = (room.gameStats.presentationsHeld || 0) + 1;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'presentation', message: `${chosen.name} dipilih untuk presentasi!` });

    // Notifikasi khusus ke pemain terpilih
    io.to(chosen.id).emit('presentation-assigned', {
      message: `🎤 Kamu terpilih untuk PRESENTASI! Guru akan memandumu. Bersiaplah!`,
    });

    // Beritahu semua pemain siapa yang terpilih
    io.to(room.code).emit('presentation-triggered', { playerName: chosen.name });
    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
  });

  // ────────────────────────────────────────────
  // GURU: SELESAIKAN PRESENTASI
  // ────────────────────────────────────────────
  socket.on('end-presentation', () => {
    const room = _getGuruRoom(socket, rooms);
    if (!room || !room.presentation?.active) return;

    room.presentation.active = false;
    room.presentation = null;

    io.to(room.code).emit('presentation-ended', { message: 'Sesi presentasi selesai!' });
    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
  });

  // ────────────────────────────────────────────
  // VOTE PEMAIN (debat voting)
  // ────────────────────────────────────────────
  socket.on('vote-player', ({ targetPlayerId }) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room?.debate?.active) return;

    const voter = room.players.find(p => p.id === socket.id);
    if (!voter || voter.isDead || voter.isGuru) return;

    room.debate.votes[voter.id] = targetPlayerId;

    const living = room.players.filter(p => !p.isDead && !p.isGuru);
    if (Object.keys(room.debate.votes).length >= living.length) {
      tallyVotes(code, io);
    } else {
      io.to(code).emit('room-updated', getSanitizedRoom(code));
    }
  });

  // ────────────────────────────────────────────
  // TOGGLE SIARAN STATS
  // ────────────────────────────────────────────
  socket.on('toggle-broadcast-stats', ({ show }) => {
    const room = _getGuruRoom(socket, rooms);
    if (!room) return;
    room.showStatsToAll = !!show;
    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
  });
}

// ════════════════════════════════════════════════
// PRIVATE HELPERS
// ════════════════════════════════════════════════

function _getGuruRoom(socket, rooms) {
  const code = socket.roomCode;
  const room = rooms[code];
  if (!room) return null;
  const player = room.players.find(p => p.id === socket.id);
  if (!player?.isGuru) { socket.emit('game-error', 'Hanya Guru yang berhak!'); return null; }
  return room;
}

/**
 * Cek jawaban — untuk soal math (sabotase provokator) pakai id string,
 * untuk soal Pancasila pakai id number dari bank soal.
 */
function _checkAnswer(room, questionId, answerIndex, context) {
  if (context === 'sabotage_provokator') {
    // Soal math disimpan langsung di room.sabotage.question
    const q = room.sabotage?.question;
    return q && q.id === questionId && q.answer === answerIndex;
  }
  if (context === 'sabotage_rescue') {
    const q = room.sabotage?.question;
    return q && q.id === questionId && q.answer === answerIndex;
  }
  if (context === 'duel') {
    const q = room.duel?.question;
    return q && q.id === questionId && q.answer === answerIndex;
  }
  // task
  const q = room.questions.find(q => q.id === questionId);
  return q && q.answer === answerIndex;
}

function _handleTaskAnswer(socket, io, room, player, questionId, isCorrect, code) {
  const question = room.questions.find(q => q.id === questionId);
  if (!question) return;

  if (isCorrect) {
    player.score++;
    room.tasksCompleted++;
    room.gameStats.totalAnswersCorrect++;
    player.answerHistory.push({ questionId, correct: true, timestamp: Date.now() });
    socket.emit('answer-feedback', { correct: true, explanation: question.explanation, score: player.score });
    checkWinConditions(code, io);
  } else {
    room.gameStats.totalAnswersWrong++;
    player.answerHistory.push({ questionId, correct: false, timestamp: Date.now() });
    socket.emit('answer-feedback', { correct: false, explanation: question.explanation, score: player.score });
  }
  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

function _handleSabotageProvokatorAnswer(socket, io, room, player, isCorrect, code) {
  if (!isCorrect) {
    // Jawaban salah → sabotase batal, kirim soal baru
    const newMath = generateMathQuiz();
    room.sabotage.question = newMath;
    socket.emit('sabotage-quiz-wrong', {
      question: newMath,
      timer:    room.sabotage.timer,
      message:  'Jawaban salah! Coba soal berikutnya.',
    });
    io.to(code).emit('room-updated', getSanitizedRoom(code));
    return;
  }

  // Jawaban benar → aktifkan sabotase fase 2
  // Pilih 1 Warga hidup secara acak
  const livingWarga = room.players.filter(p => !p.isGuru && !p.isDead && p.role === 'warga');
  if (livingWarga.length === 0) {
    room.sabotage = null;
    return;
  }
  const targetWarga = livingWarga[Math.floor(Math.random() * livingWarga.length)];

  // Lock semua Warga kecuali yang terpilih
  room.players.forEach(p => {
    if (!p.isGuru && p.role === 'warga' && !p.isDead) {
      p.taskLocked = p.id !== targetWarga.id;
    }
  });

  const s = room.settings || DEFAULT_SETTINGS;
  room.sabotage.phase          = 'warga_rescue';
  room.sabotage.timer          = s.sabotageTimer ?? 40;
  room.sabotage.targetWargaId  = targetWarga.id;
  room.sabotage.targetWargaName = targetWarga.name;

  // Ganti soal sabotase ke soal Pancasila untuk fase rescue
  const rescueQ = room.questions[Math.floor(Math.random() * room.questions.length)];
  room.sabotage.question = rescueQ;

  room.gameStats.sabotagesTriggered++;
  room.gameStats.eventLog.push({ time: Date.now(), type: 'sabotage', message: `Provokator berhasil memicu sabotase! ${targetWarga.name} harus menyelamatkan!` });

  // Beritahu semua bahwa sabotase aktif
  io.to(code).emit('sabotage-triggered', {
    message:        `BAHAYA! Provokator menyabotase! ${targetWarga.name} harus menyelamatkan!`,
    targetWargaName: targetWarga.name,
  });

  // Kirim soal rescue khusus ke Warga terpilih
  io.to(targetWarga.id).emit('sabotage-rescue-assigned', {
    question: { id: rescueQ.id, sila: rescueQ.sila, type: rescueQ.type, question: rescueQ.question, options: rescueQ.options },
    timer:    room.sabotage.timer,
    message:  'Kamu dipilih untuk menyelamatkan! Jawab soal ini untuk membatalkan sabotase!',
  });

  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

function _handleSabotageRescue(socket, io, room, player, questionId, isCorrect, code) {
  if (isCorrect) {
    // Rescue berhasil → unlock semua Warga
    room.players.forEach(p => { p.taskLocked = false; });
    room.sabotage.active = false;
    room.sabotage = null;
    player.score += 2;
    room.gameStats.sabotagesResolved++;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'sabotage_resolved', message: `${player.name} berhasil mengatasi sabotase!` });
    io.to(code).emit('sabotage-resolved', { solvedBy: player.name, message: `Sabotase dinonaktifkan oleh ${player.name}!` });
    io.to(code).emit('room-updated', getSanitizedRoom(code));
  } else {
    // Jawaban salah → kirim soal Pancasila baru
    const newQ = room.questions[Math.floor(Math.random() * room.questions.length)];
    room.sabotage.question = newQ;
    socket.emit('sabotage-rescue-wrong', {
      question: { id: newQ.id, sila: newQ.sila, type: newQ.type, question: newQ.question, options: newQ.options },
      timer:    room.sabotage.timer,
      message:  'Jawaban salah! Coba soal berikutnya.',
    });
    io.to(code).emit('room-updated', getSanitizedRoom(code));
  }
}

function _handleDuelAnswer(socket, io, room, player, questionId, isCorrect, code) {
  const isProv    = player.id === room.duel.provocateur;
  const isCitizen = player.id === room.duel.citizen;
  if (!isProv && !isCitizen) return;

  // Tandai bahwa pemain ini sudah menjawab
  if (room.duel.answered[player.id] !== undefined) return; // sudah jawab
  room.duel.answered[player.id] = { isCorrect, timestamp: Date.now() };

  // Cek apakah kedua pemain sudah menjawab
  const provAnswered    = room.duel.answered[room.duel.provocateur];
  const citizenAnswered = room.duel.answered[room.duel.citizen];

  // Jika salah satu menjawab benar → langsung selesaikan duel
  if (isCorrect) {
    _resolveDuel(io, room, code, player.id, isProv ? room.duel.citizen : room.duel.provocateur, 'Menjawab benar lebih cepat!');
    return;
  }

  // Jika menjawab salah → ganti soal baru (waktu terbuang secara alami)
  const newQ = room.questions[Math.floor(Math.random() * room.questions.length)];
  room.duel.question = newQ;
  
  // Reset answered status for next question
  room.duel.answered = {};

  socket.emit('duel-answer-wrong', { message: 'Jawaban salah! Menunggu soal baru...' });
  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

function _resolveDuel(io, room, code, winnerId, loserId, reason) {
  if (!room.duel) return; // sudah diselesaikan

  const winner = room.players.find(p => p.id === winnerId);
  const loser  = room.players.find(p => p.id === loserId);

  if (loser)  loser.isDead = true;
  if (winner) winner.score += 3;

  const winnerIsProv = winner?.id === room.duel.provocateur;
  if (winnerIsProv) room.gameStats.duelsWonByProvokator++;
  else              room.gameStats.duelsWonByWarga++;

  room.gameStats.playersEliminated++;
  room.gameStats.eventLog.push({
    time: Date.now(), type: 'duel_resolved',
    message: `${winner?.name} menang duel! ${loser?.name} tereliminasi. (${reason})`,
  });

  // Set cooldown pada Provokator (siapapun yang menang/kalah)
  const provPlayer = room.players.find(p => p.id === room.duel.provocateur);
  if (provPlayer) provPlayer.duelCooldownEndsAt = Date.now() + DUEL_COOLDOWN_MS;

  room.duel = null;

  io.to(code).emit('duel-resolved', {
    winner: winner?.name ?? null,
    loser:  loser?.name ?? null,
    reason: `${winner?.name} menang! ${reason} ${loser?.name} tereliminasi.`,
  });

  checkWinConditions(code, io);
  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

module.exports = { registerGameHandlers };
