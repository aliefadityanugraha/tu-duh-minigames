// Handler: get-questions, add-question, update-question, delete-question, reset-questions, update-settings
const { rooms, getSanitizedRoom } = require('../lib/roomHelpers');
const { PANCASILA_QUESTIONS } = require('../data/questions');
const { DEFAULT_SETTINGS } = require('../data/defaults');

function registerQuestionHandlers(socket, io) {

  // ── Ambil daftar soal (hanya Guru) ──
  socket.on('get-questions', () => {
    const room = _getGuruLobbyRoom(socket, rooms);
    if (!room) return;
    socket.emit('questions-list', room.questions);
  });

  // ── Tambah soal baru ──
  socket.on('add-question', (newQ) => {
    const room = _getGuruLobbyRoom(socket, rooms);
    if (!room) return;

    const maxId = room.questions.reduce((max, q) => Math.max(max, q.id), 0);
    room.questions.push({
      id:          maxId + 1,
      sila:        newQ.sila,
      type:        newQ.type,
      question:    newQ.question,
      options:     newQ.options,
      answer:      parseInt(newQ.answer) || 0,
      explanation: newQ.explanation || '',
    });

    io.to(socket.roomCode).emit('questions-updated-alert', 'Soal berhasil ditambahkan!');
    socket.emit('questions-list', room.questions);
  });

  // ── Update soal ──
  socket.on('update-question', (updatedQ) => {
    const room = _getGuruLobbyRoom(socket, rooms);
    if (!room) return;

    const idx = room.questions.findIndex(q => q.id === updatedQ.id);
    if (idx !== -1) {
      room.questions[idx] = {
        id:          updatedQ.id,
        sila:        updatedQ.sila,
        type:        updatedQ.type,
        question:    updatedQ.question,
        options:     updatedQ.options,
        answer:      parseInt(updatedQ.answer) || 0,
        explanation: updatedQ.explanation || '',
      };
      io.to(socket.roomCode).emit('questions-updated-alert', 'Soal berhasil diperbarui!');
      socket.emit('questions-list', room.questions);
    }
  });

  // ── Hapus soal ──
  socket.on('delete-question', ({ questionId }) => {
    const room = _getGuruLobbyRoom(socket, rooms);
    if (!room) return;

    room.questions = room.questions.filter(q => q.id !== questionId);
    io.to(socket.roomCode).emit('questions-updated-alert', 'Soal berhasil dihapus!');
    socket.emit('questions-list', room.questions);
  });

  // ── Reset ke default ──
  socket.on('reset-questions', () => {
    const room = _getGuruLobbyRoom(socket, rooms);
    if (!room) return;

    room.questions = JSON.parse(JSON.stringify(PANCASILA_QUESTIONS));
    io.to(socket.roomCode).emit('questions-updated-alert', `Bank soal direset ke ${room.questions.length} soal default!`);
    socket.emit('questions-list', room.questions);
  });

  // ── Update pengaturan game ──
  socket.on('update-settings', (newSettings) => {
    const code = socket.roomCode;
    const room = rooms[code];
    if (!room || room.state !== 'lobby') return;

    const player = room.players.find(p => p.id === socket.id);
    if (!player?.isGuru) { socket.emit('game-error', 'Hanya Guru yang berhak!'); return; }

    const s = room.settings;
    if (newSettings.tasksPerPlayer    !== undefined) s.tasksPerPlayer    = Math.min(15,  Math.max(1,   parseInt(newSettings.tasksPerPlayer)    || 5));
    if (newSettings.sabotageTimer     !== undefined) s.sabotageTimer     = Math.min(90,  Math.max(15,  parseInt(newSettings.sabotageTimer)     || 40));
    if (newSettings.duelTimer         !== undefined) s.duelTimer         = Math.min(60,  Math.max(10,  parseInt(newSettings.duelTimer)         || 20));
    if (newSettings.debateTimer       !== undefined) s.debateTimer       = Math.min(180, Math.max(30,  parseInt(newSettings.debateTimer)       || 90));
    if (newSettings.topicDebateTimer  !== undefined) s.topicDebateTimer  = Math.min(300, Math.max(60,  parseInt(newSettings.topicDebateTimer)  || 120));
    if (newSettings.gameTimer         !== undefined) s.gameTimer         = Math.min(1800,Math.max(60,  parseInt(newSettings.gameTimer)         || 300));
    if (newSettings.maxPlayers        !== undefined) s.maxPlayers        = Math.min(10,  Math.max(3,   parseInt(newSettings.maxPlayers)        || 10));
    if (newSettings.caseStudy         !== undefined) {
      s.caseStudy = ['anti-hoaks', 'saring-informasi'].includes(newSettings.caseStudy) ? newSettings.caseStudy : 'anti-hoaks';
    }
    if (newSettings.provokatorCount   !== undefined) {
      s.provokatorCount = ['auto','1','2','3'].includes(String(newSettings.provokatorCount))
        ? newSettings.provokatorCount : 'auto';
    }

    io.to(code).emit('settings-updated', { settings: s });
    io.to(code).emit('room-updated', getSanitizedRoom(code));
  });
}

// Helper: pastikan pengirim adalah Guru di room yang masih lobby
function _getGuruLobbyRoom(socket, rooms) {
  const code = socket.roomCode;
  const room = rooms[code];
  if (!room || room.state !== 'lobby') return null;
  const player = room.players.find(p => p.id === socket.id);
  if (!player?.isGuru) return null;
  return room;
}

module.exports = { registerQuestionHandlers };
