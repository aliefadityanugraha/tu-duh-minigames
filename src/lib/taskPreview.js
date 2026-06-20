import { MINIGAME_REGISTRY } from '../components/minigames';

const QUIZ_PREVIEW = {
  id: 'quiz',
  title: '📝 Kuis Pancasila',
  subtitle: 'Soal pilihan ganda · SILA acak',
};

/** Pool semua tipe misi yang mungkin muncul */
export function getTaskTypePool() {
  return [
    QUIZ_PREVIEW,
    ...Object.entries(MINIGAME_REGISTRY).map(([id, meta]) => ({
      id,
      title: `🎮 ${meta.label}`,
      subtitle: `Mini-game · SILA #${meta.sila}`,
    })),
  ];
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h) + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

function stableShuffle(arr, seed) {
  const a = [...arr];
  let s = hashString(seed);
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    const j = s % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Preview 2 misi terkunci di bawah task aktif (teaser, bukan urutan pasti).
 */
export function getLockedTaskPreviews(currentTask, count = 2) {
  const excludeId = currentTask?.type ?? null;
  const seed = currentTask?.sessionId ?? 'mission-book-default';
  const available = getTaskTypePool().filter(p => p.id !== excludeId);
  const picked = stableShuffle(available, seed).slice(0, Math.min(count, available.length));

  return picked.map((item, i) => ({
    ...item,
    label: `MISI ${String(i + 2).padStart(2, '0')}`,
  }));
}
