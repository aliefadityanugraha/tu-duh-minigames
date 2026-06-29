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
const { DEFAULT_SETTINGS, DEFAULT_SKINS, EMPTY_GAME_STATS, DUEL_COOLDOWN_MS, SABOTAGE_COOLDOWN_MS, DUEL_WRONG_ANSWER_COOLDOWN_MS } = require('../data/defaults');
const { checkWinConditions, tallyVotes } = require('../lib/gameLogic');
const { generateMathQuiz } = require('../lib/mathQuiz');
const { shuffleArray } = require('../lib/roomHelpers');
const { pickVariedMinigame, pickVariedQuestion, shouldDeliverQuiz, isMinigameType } = require('../data/minigames');

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
    // Tentukan jumlah provokator
    let provCount = s.provokatorCount === 'auto'
      ? (nonGurus.length >= 6 ? 2 : 1)
      : Math.min(Number(s.provokatorCount), Math.floor(nonGurus.length / 2));

    const wargaCount = nonGurus.length - provCount;

    Object.assign(room, {
      state:          'playing',
      winner:         null,
      tasksCompleted: 0,
      tasksRequired:  wargaCount * s.tasksPerPlayer,
      gameTimer:      s.gameTimer ?? DEFAULT_SETTINGS.gameTimer,
      sabotage:       null,
      duel:           null,
      debate:         null,
      topicDebate:    null,
      presentation:   null,
      gameStats:      { ...EMPTY_GAME_STATS(), startedAt: Date.now() },
      activeTaskSessions: {},
    });
    room.gameStats.eventLog.push({ time: Date.now(), type: 'game_start', message: 'Permainan dimulai!' });

    // Acak peran (Fisher-Yates)
    const shuffled = shuffleArray([...Array(nonGurus.length).keys()]);
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
      let teammates = [];
      if (p.role === 'provokator') {
        teammates = room.players
          .filter(tp => tp.role === 'provokator')
          .map(tp => tp.id); // Send IDs, client can look up skin/name
      }
      io.to(p.id).emit('role-assigned', { role: p.role, isGuru: p.isGuru, tasksRequired: room.tasksRequired, teammates });
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
      activeTaskSessions: {},
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
  // AMBIL SOAL BERIKUTNYA (task Warga) — legacy
  // ────────────────────────────────────────────
  socket.on('get-next-question', () => {
    _deliverNextTask(socket);
  });

  // ────────────────────────────────────────────
  // AMBIL TASK BERIKUTNYA (kuis atau mini-game)
  // ────────────────────────────────────────────
  socket.on('get-next-task', () => {
    _deliverNextTask(socket);
  });

  // ────────────────────────────────────────────
  // SUBMIT TASK (kuis atau mini-game selesai)
  // ────────────────────────────────────────────
  socket.on('submit-task', ({ sessionId, type, questionId, answerIndex, context }) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'playing') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player || player.isDead || (player.role !== 'warga' && player.role !== 'provokator') || player.taskLocked) return;
    if (context !== 'task') return;

    const session = room.activeTaskSessions?.[socket.id];
    if (!session || session.sessionId !== sessionId || session.type !== type) {
      socket.emit('task-error', { message: 'Sesi task tidak valid atau sudah kedaluwarsa.' });
      return;
    }

    if (isMinigameType(type)) {
      const s = room.settings || DEFAULT_SETTINGS;
      const minMs = (s.minTaskDuration ?? DEFAULT_SETTINGS.minTaskDuration) * 1000;
      if (Date.now() - session.issuedAt < minMs) {
        socket.emit('task-error', { message: 'Task diselesaikan terlalu cepat. Selesaikan mini-game dengan benar!' });
        return;
      }
      _handleMinigameComplete(socket, io, room, player, type, code);
    } else if (type === 'quiz') {
      const isCorrect = _checkAnswer(room, questionId, answerIndex, 'task');
      _handleTaskAnswer(socket, io, room, player, questionId, isCorrect, code);
    }

    delete room.activeTaskSessions[socket.id];
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
        if ((player.role === 'warga' || player.role === 'provokator') && room.state === 'playing' && !player.taskLocked)
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

    // Cek ada Warga hidup & online yang bisa disabotase
    const availableWarga = room.players.filter(p => !p.isGuru && !p.isDead && p.role === 'warga' && p.isOnline !== false);
    if (availableWarga.length === 0) {
      socket.emit('game-error', 'Tidak ada Warga hidup untuk disabotase!');
      return;
    }

    // Cek cooldown sabotase
    if (player.sabotageCooldownEndsAt && Date.now() < player.sabotageCooldownEndsAt) {
      const remaining = Math.ceil((player.sabotageCooldownEndsAt - Date.now()) / 1000);
      socket.emit('sabotage-cooldown', { remaining, message: `Cooldown sabotase: ${remaining} detik lagi.` });
      return;
    }

    const mathQ = generateMathQuiz();
    const s     = room.settings || DEFAULT_SETTINGS;

    // Fase 1: hanya Provokator yang melihat soal math ini
    room.sabotage = {
      active:         true,
      phase:          'provokator_quiz',
      provocateurId:  socket.id,
      timer:          s.sabotageQuizTimer ?? DEFAULT_SETTINGS.sabotageQuizTimer,
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
    const duelDuration = s.duelTimer ?? DEFAULT_SETTINGS.duelTimer;

    room.duel = {
      active:      true,
      provocateur: player.id,
      citizen:     target.id,
      question:    q,
      timer:       duelDuration,
      maxTimer:    duelDuration,
      round:       0,
      _processed:  {},
    };

    room.gameStats.duelsTriggered++;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'duel', message: `Duel: ${player.name} vs ${target.name}` });

    // Notifikasi duel HANYA ke kedua peserta (privat)
    io.to(player.id).emit('duel-triggered', { provocateur: player.name, citizen: target.name });
    io.to(target.id).emit('duel-triggered', { provocateur: player.name, citizen: target.name });
    // Room-updated ke semua pemain (duel info di-filter di getSanitizedRoom untuk non-peserta)
    io.to(code).emit('room-updated', getSanitizedRoom(code));
  });

  // ────────────────────────────────────────────
  // GURU: PICU DEBAT VOTING
  // ────────────────────────────────────────────
  socket.on('teacher-pause', () => {
    const room = _getGuruRoom(socket, rooms);
    if (!room || room.state !== 'playing') return;

    const s = room.settings || DEFAULT_SETTINGS;
    room.debate = { active: true, timer: s.debateTimer ?? DEFAULT_SETTINGS.debateTimer, reason: 'teacher_pause', votes: {}, votedOut: null, chat: [] };
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

    // Ambil semua murid yang masih hidup
    const livingStudents = room.players.filter(p => !p.isGuru && !p.isDead);
    if (livingStudents.length < 2) {
      socket.emit('game-error', 'Tidak cukup pemain (minimal 2 murid) untuk sesi debat!');
      return;
    }

    // Pilih secara acak 1 Pro dan 1 Kontra
    const shuffled = [...livingStudents].sort(() => 0.5 - Math.random());
    const proPlayer = shuffled[0];
    const kontraPlayer = shuffled[1];

    const s = room.settings || DEFAULT_SETTINGS;
    const rawTopic = (topic || '').trim();
    const topicText = rawTopic.slice(0, 150) || 'Topik bebas — diskusikan nilai Pancasila dalam kehidupan sehari-hari!';

    room.topicDebate = {
      active: true,
      topic:  topicText,
      totalTimer: 165, // 30+30+5+30+5+30+5+30 = 165s
      phaseIndex: 0,
      phase: 'thinking',
      phaseTimer: 30, // 30s untuk berpikir
      proPlayerId: proPlayer.id,
      kontraPlayerId: kontraPlayer.id,
    };
    room.gameStats.topicDebatesHeld = (room.gameStats.topicDebatesHeld || 0) + 1;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'topic_debate', message: `Debat topik dimulai: "${topicText}". Pro: ${proPlayer.name}, Kontra: ${kontraPlayer.name}` });

    io.to(room.code).emit('topic-debate-triggered', { topic: topicText, totalTimer: room.topicDebate.totalTimer });
    io.to(room.code).emit('room-updated', getSanitizedRoom(room.code));
  });

  socket.on('end-topic-debate', () => {
    const room = _getGuruRoom(socket, rooms);
    if (!room || room.state !== 'playing' || !room.topicDebate?.active) return;

    room.topicDebate.active = false;
    room.topicDebate = null;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'topic_debate_ended', message: 'Sesi debat topik diakhiri lebih awal oleh Guru' });
    io.to(room.code).emit('topic-debate-ended', { message: 'Sesi debat topik diakhiri!' });
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

    const s = room.settings || DEFAULT_SETTINGS;
    const presentationDuration = s.presentationTimer ?? 120;
    room.presentation = {
      active:    true,
      playerId:  chosen.id,
      playerName: chosen.name,
      timer:     presentationDuration,
      maxTimer:  presentationDuration,
    };
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

    // Lock: voter sudah vote → reject overwrite
    if (room.debate.votes[voter.id] != null) return;

    // Skip vote
    if (targetPlayerId === 'skip') {
      room.debate.votes[voter.id] = 'skip';
    } else {
      // Validasi target: harus player hidup di room ini, bukan diri sendiri
      if (targetPlayerId === voter.id) return;
      const target = room.players.find(p => p.id === targetPlayerId);
      if (!target || target.isDead || target.isGuru) return;
      room.debate.votes[voter.id] = targetPlayerId;
    }

    const living = room.players.filter(p => !p.isDead && !p.isGuru && p.isOnline !== false);
    if (Object.keys(room.debate.votes).length >= living.length) {
      tallyVotes(code, io);
    } else {
      io.to(code).emit('room-updated', getSanitizedRoom(code));
    }
  });

  // ────────────────────────────────────────────
  // KIRIM PESAN CHAT DEBAT
  // ────────────────────────────────────────────
  socket.on('send-debate-chat', ({ message }) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room?.debate?.active) return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    // Rate limit: max 1 pesan per detik
    const now = Date.now();
    if (player.lastChatAt && (now - player.lastChatAt) < 1000) {
      socket.emit('game-error', 'Terlalu cepat! Tunggu sebentar sebelum kirim pesan lagi.');
      return;
    }
    player.lastChatAt = now;

    // Sanitize & limit message length
    const sanitized = (String(message || '')).trim().slice(0, 200);
    if (!sanitized) return;

    room.debate.chat.push({
      senderId: player.id,
      senderName: player.name,
      role: player.role,
      message: sanitized,
      timestamp: Date.now()
    });

    io.to(code).emit('room-updated', getSanitizedRoom(code));
  });

  // GET SKIN LIST
  socket.on('get-skin-list', () => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;
    socket.emit('skin-list-updated', room.skins || DEFAULT_SKINS);
  });

  // ADD CUSTOM SKIN
  socket.on('add-custom-skin', ({ skinUrl }) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room) return;

    // Validasi URL — izinkan http/https atau path relatif lokal
    const url = (String(skinUrl || '')).trim();
    if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('/')) {
      socket.emit('game-error', 'URL skin tidak valid. Gunakan URL http/https atau path relatif.');
      return;
    }
    // Cegah URL yang terlalu panjang (abuse)
    if (url.length > 2048) {
      socket.emit('game-error', 'URL skin terlalu panjang (maks 2048 karakter).');
      return;
    }

    if (!room.skins) room.skins = [...DEFAULT_SKINS];
    const newSkinId = room.skins.length;
    const newSkin = {
      id: newSkinId,
      name: 'Kustom',
      img: url,
      bg: '#ffffff',
      text: '#000000',
      border: '#000000'
    };
    room.skins.push(newSkin);
    io.to(code).emit('skin-list-updated', room.skins);

    // Otomatis ganti skin pemain ke skin yang baru diunggah
    const player = room.players.find(p => p.id === socket.id);
    if (player && room.state === 'lobby') {
      player.skinId = newSkinId;
      io.to(code).emit('room-updated', getSanitizedRoom(code));
    }
  });

  // ────────────────────────────────────────────
  // GANTI SKIN (hanya di lobby)
  // ────────────────────────────────────────────
  socket.on('change-skin', ({ skinId }) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'lobby') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player) return;

    const id = Number(skinId);
    const maxSkinId = (room.skins || DEFAULT_SKINS).length - 1;
    if (isNaN(id) || id < 0 || id > maxSkinId) return; // validasi range

    player.skinId = id;
    io.to(code).emit('room-updated', getSanitizedRoom(code));
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

function _deliverNextTask(socket) {
  const code = socket.roomCode;
  const room = rooms[code];
  console.log(`[DEBUG] get-next-task received for: ${socket.id} in room: ${code}`);

  if (!room || room.state !== 'playing') {
    console.log(`[DEBUG] Task delivery aborted: room state is ${room?.state}`);
    return;
  }

  const player = room.players.find(p => p.id === socket.id);
  if (!player || player.isDead || (player.role !== 'warga' && player.role !== 'provokator')) {
    console.log(`[DEBUG] Task delivery aborted: player invalid or dead`);
    return;
  }
  if (player?.taskLocked) {
    console.log(`[DEBUG] Task delivery aborted: player is taskLocked`);
    socket.emit('task-locked', { message: 'Tugas Anda sedang terkunci karena sabotase aktif!' });
    return;
  }

  if (!room.questions?.length) {
    socket.emit('task-error', { message: 'Bank soal kosong! Minta Guru menambahkan soal.' });
    return;
  }

  if (!room.activeTaskSessions) room.activeTaskSessions = {};

  const pending = room.activeTaskSessions[socket.id];
  if (pending) {
    socket.emit('task-error', { message: 'Selesaikan misi aktif terlebih dahulu sebelum mengambil misi baru.' });
    return;
  }

  const s = room.settings || DEFAULT_SETTINGS;
  const minigameOn = s.minigameEnabled !== false;
  // Provokator sekarang menggunakan quizRatio yang sama dengan Warga
  const quizRatio = minigameOn ? (s.quizRatio ?? DEFAULT_SETTINGS.quizRatio) : 1;
  const isQuiz = shouldDeliverQuiz(player, quizRatio, minigameOn);

  const sessionId = `${socket.id}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const issuedAt = Date.now();
  const TASK_TIMEOUT = 15; // 15 detik per misi

  let payload;
  if (isQuiz) {
    const q = pickVariedQuestion(room.questions, player);
    if (!q) {
      socket.emit('task-error', { message: 'Bank soal kosong! Minta Guru menambahkan soal.' });
      return;
    }
    room.activeTaskSessions[socket.id] = { sessionId, type: 'quiz', issuedAt, questionId: q.id, timer: TASK_TIMEOUT };
    payload = {
      type: 'quiz',
      sessionId,
      timer: TASK_TIMEOUT,
      data: { id: q.id, sila: q.sila, type: q.type, question: q.question, options: q.options },
    };
  } else {
    const game = pickVariedMinigame(player);
    room.activeTaskSessions[socket.id] = { sessionId, type: game.id, issuedAt, timer: TASK_TIMEOUT };
    payload = {
      type: game.id,
      sessionId,
      timer: TASK_TIMEOUT,
      data: { sila: game.sila, label: game.label },
    };
  }

  socket.emit('next-task-delivery', payload);
}

function _handleMinigameComplete(socket, io, room, player, minigameType, code) {
  player.score++;
  if (player.role === 'provokator') {
    room.tasksCompleted = Math.max(0, room.tasksCompleted - 1);
  } else {
    room.tasksCompleted++;
  }
  room.gameStats.totalAnswersCorrect++;
  if (!room.gameStats.minigamesCompleted) room.gameStats.minigamesCompleted = 0;
  room.gameStats.minigamesCompleted++;
  player.answerHistory.push({ minigameType, correct: true, timestamp: Date.now() });
  room.gameStats.eventLog.push({
    time: Date.now(),
    type: 'minigame_completed',
    message: `${player.name} menyelesaikan mini-game "${minigameType.replace(/-/g, ' ')}".`,
  });
  socket.emit('task-feedback', {
    correct: true,
    explanation: 'Mini-game berhasil diselesaikan! Nilai Pancasila diamalkan.',
    score: player.score,
    taskType: minigameType,
  });
  socket.emit('answer-feedback', {
    correct: true,
    explanation: 'Mini-game berhasil diselesaikan!',
    score: player.score,
  });
  checkWinConditions(code, io);
  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

/**
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
  if (room.activeTaskSessions?.[socket.id]) {
    delete room.activeTaskSessions[socket.id];
  }

  const question = room.questions.find(q => q.id === questionId);
  if (!question) return;

  const isProvokator = player.role === 'provokator';

  if (isCorrect) {
    player.score++;
    // Provokator: mengurangi progress warga; Warga: menambah progress
    if (isProvokator) {
      room.tasksCompleted = Math.max(0, room.tasksCompleted - 1);
    } else {
      room.tasksCompleted++;
    }
    room.gameStats.totalAnswersCorrect++;
    player.answerHistory.push({ questionId, correct: true, timestamp: Date.now() });
    const feedback = {
      correct: true,
      explanation: question.explanation,
      score: player.score,
      taskType: 'quiz',
      correctIndex: question.answer,
    };
    socket.emit('task-feedback', feedback);
    socket.emit('answer-feedback', { correct: true, explanation: question.explanation, score: player.score });
    checkWinConditions(code, io);
  } else {
    room.gameStats.totalAnswersWrong++;
    player.answerHistory.push({ questionId, correct: false, timestamp: Date.now() });
    const feedback = {
      correct: false,
      explanation: question.explanation,
      score: player.score,
      taskType: 'quiz',
      correctIndex: question.answer,
    };
    socket.emit('task-feedback', feedback);
    socket.emit('answer-feedback', { correct: false, explanation: question.explanation, score: player.score });
  }
  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

function _handleSabotageProvokatorAnswer(socket, io, room, player, isCorrect, code) {
  if (!isCorrect) {
    // Jawaban salah → sabotase batal, kirim soal baru
    const newMath = generateMathQuiz();
    room.sabotage.question = newMath;
    room.sabotage.timer = 15; // Reset timer ke 15 detik
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
  const rescueTimer = s.sabotageTimer ?? DEFAULT_SETTINGS.sabotageTimer;
  room.sabotage.phase          = 'warga_rescue';
  room.sabotage.timer          = rescueTimer;
  room.sabotage.maxTimer       = rescueTimer;
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
  if (!room.duel) return;
  const isProv    = player.id === room.duel.provocateur;
  const isCitizen = player.id === room.duel.citizen;
  if (!isProv && !isCitizen) return;

  // Cegah double-process dalam round yang sama (race condition)
  const round = room.duel.round ?? 0;
  const answerKey = `${player.id}_${round}`;
  if (room.duel._processed?.[answerKey]) return;
  if (!room.duel._processed) room.duel._processed = {};
  room.duel._processed[answerKey] = true;

  // Jika salah satu menjawab benar → langsung selesaikan duel
  if (isCorrect) {
    _resolveDuel(io, room, code, player.id, isProv ? room.duel.citizen : room.duel.provocateur, 'Menjawab benar lebih cepat!');
    return;
  }

  // Jika menjawab salah → ganti soal baru & potong waktu duel
  const newQ = room.questions[Math.floor(Math.random() * room.questions.length)];
  room.duel.question = newQ;
  room.duel.timer = Math.max(0, (room.duel.timer ?? 0) - 5);
  room.duel.round = round + 1; // naikkan round agar jawaban pemain lain di round lama tidak diproses ulang

  // Provokator salah jawab → cooldown 10 detik untuk duel berikutnya
  if (isProv) {
    player.duelCooldownEndsAt = Date.now() + DUEL_WRONG_ANSWER_COOLDOWN_MS;
    player.sabotageCooldownEndsAt = Date.now() + SABOTAGE_COOLDOWN_MS;
  }

  socket.emit('duel-answer-wrong', { message: 'Jawaban salah! Waktu duel berkurang 5 detik. Soal diganti...' });
  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

function _resolveDuel(io, room, code, winnerId, loserId, reason) {
  if (!room.duel) return; // sudah diselesaikan

  const provId = room.duel.provocateur;
  const citId = room.duel.citizen;

  const winner = room.players.find(p => p.id === winnerId);
  const loser  = room.players.find(p => p.id === loserId);

  if (loser)  loser.isDead = true;
  // Score hanya dari quiz/minigame — duel tidak menambah XP
  // Warga yang menang duel tetap tidak tambah score, eliminasi saja

  const winnerIsProv = winner?.id === provId;
  if (winnerIsProv) room.gameStats.duelsWonByProvokator++;
  else              room.gameStats.duelsWonByWarga++;

  room.gameStats.playersEliminated++;
  room.gameStats.eventLog.push({
    time: Date.now(), type: 'duel_resolved',
    message: `${winner?.name} menang duel! ${loser?.name} tereliminasi. (${reason})`,
  });

  // Set cooldown pada Provokator (siapapun yang menang/kalah)
  const provPlayer = room.players.find(p => p.id === provId);
  if (provPlayer) {
    provPlayer.duelCooldownEndsAt = Date.now() + DUEL_COOLDOWN_MS;
    provPlayer.sabotageCooldownEndsAt = Date.now() + SABOTAGE_COOLDOWN_MS;
  }

  room.duel = null;

  // Notifikasi duel-resolved HANYA ke peserta duel (privat)
  const resolvedPayload = {
    winner: winner?.name ?? null,
    loser:  loser?.name ?? null,
    reason: `${winner?.name} menang! ${reason} ${loser?.name} tereliminasi.`,
  };
  io.to(provId).emit('duel-resolved', resolvedPayload);
  io.to(citId).emit('duel-resolved', resolvedPayload);

  // Jika game masih lanjut dan yang kalah adalah Warga, picu Emergency Meeting DULU
  // sebelum checkWinConditions agar state tidak menjadi 'ended' + 'debate' aktif secara bersamaan
  if (room.state === 'playing' && loser && loser.role === 'warga') {
    const s = room.settings || DEFAULT_SETTINGS;
    room.debate = {
      active: true,
      timer: s.debateTimer ?? DEFAULT_SETTINGS.debateTimer,
      reason: 'emergency_meeting',
      votes: {}, votedOut: null, chat: []
    };
    room.gameStats.debatesHeld++;
    room.gameStats.eventLog.push({ time: Date.now(), type: 'debate', message: `Emergency Meeting dipicu karena ${loser.name} tereliminasi!` });
    io.to(code).emit('debate-triggered', { reason: `EMERGENCY MEETING! Warga ${loser.name} telah tereliminasi. Segera diskusikan pelakunya!` });
  }

  // Cek kondisi menang SETELAH emergency meeting dibuat agar state room konsisten
  checkWinConditions(code, io);

  io.to(code).emit('room-updated', getSanitizedRoom(code));
}

module.exports = { registerGameHandlers };
