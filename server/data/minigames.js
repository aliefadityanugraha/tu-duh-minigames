// Daftar mini-game yang valid — sinkron dengan src/components/minigames/index.js
const MINIGAME_TYPES = [
  { id: 'hubungkan-kebaikan', sila: 2, label: 'Hubungkan Kebaikan' },
  { id: 'dekripsi-pesan',     sila: 3, label: 'Susun Kata' },
  { id: 'urutan-mufakat',     sila: 4, label: 'Urutan Mufakat' },
  { id: 'timbangan-keadilan', sila: 5, label: 'Timbangan Keadilan' },
];

const MINIGAME_IDS = new Set(MINIGAME_TYPES.map(g => g.id));

/** Riwayat tipe task terbaru dari answerHistory (terbaru di indeks 0) */
function getRecentTaskTypes(player, limit = 5) {
  const types = [];
  const history = player?.answerHistory || [];
  for (let i = history.length - 1; i >= 0 && types.length < limit; i--) {
    const entry = history[i];
    if (entry.minigameType) types.push(entry.minigameType);
    else if (entry.questionId != null) types.push('quiz');
  }
  return types;
}

function pickRandomMinigame(excludeIds = []) {
  const exclude = new Set(
    (Array.isArray(excludeIds) ? excludeIds : [excludeIds]).filter(Boolean)
  );
  let pool = MINIGAME_TYPES.filter(g => !exclude.has(g.id));
  if (pool.length === 0) pool = MINIGAME_TYPES;
  return pool[Math.floor(Math.random() * pool.length)];
}

/**
 * Pilih mini-game yang tidak sama dengan misi mini-game terakhir (dan hindari 2 terakhir jika bisa).
 */
function pickVariedMinigame(player) {
  const recent = getRecentTaskTypes(player, 4);
  const recentMinigames = recent.filter(t => MINIGAME_IDS.has(t));
  const exclude = [...new Set(recentMinigames.slice(0, 2))];
  return pickRandomMinigame(exclude);
}

/**
 * Pilih kuis vs mini-game — cegah streak mini-game beruntun.
 */
function shouldDeliverQuiz(player, quizRatio, minigameOn) {
  if (!minigameOn) return true;

  const recent = getRecentTaskTypes(player, 3);
  const last = recent[0];

  // Dua mini-game berturut-turut → paksa kuis
  if (recent.length >= 2 && recent[0] !== 'quiz' && recent[1] !== 'quiz') {
    return true;
  }

  // Baru selesai mini-game → bias ke kuis
  if (last && MINIGAME_IDS.has(last)) {
    return Math.random() < Math.min(1, quizRatio + 0.35);
  }

  return Math.random() < quizRatio;
}

/**
 * Pilih soal kuis yang tidak sama dengan beberapa soal terakhir pemain.
 */
function pickVariedQuestion(questions, player) {
  if (!questions?.length) return null;

  const recentIds = (player?.answerHistory || [])
    .filter(e => e.questionId != null)
    .slice(-4)
    .map(e => e.questionId);

  const excludeSet = new Set(recentIds.slice(-2));
  let pool = questions.filter(q => !excludeSet.has(q.id));
  if (pool.length === 0) {
    const lastId = recentIds[recentIds.length - 1];
    pool = lastId != null ? questions.filter(q => q.id !== lastId) : questions;
  }
  if (pool.length === 0) pool = questions;

  return pool[Math.floor(Math.random() * pool.length)];
}

function isMinigameType(type) {
  return MINIGAME_IDS.has(type);
}

module.exports = {
  MINIGAME_TYPES,
  MINIGAME_IDS,
  pickRandomMinigame,
  pickVariedMinigame,
  pickVariedQuestion,
  shouldDeliverQuiz,
  getRecentTaskTypes,
  isMinigameType,
};
