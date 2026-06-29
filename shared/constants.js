const DEFAULT_SETTINGS = {
  tasksPerPlayer:    5,
  sabotageTimer:     40,
  sabotageQuizTimer: 15,
  duelTimer:         20,
  duelCooldown:      30,
  debateTimer:       90,
  topicDebateTimer:  120,
  gameTimer:         300,
  provokatorCount:   'auto',
  caseStudy:         'anti-hoaks',
  quizRatio:         0.4,
  minigameEnabled:   true,
  minTaskDuration:   1,
};

const EMPTY_GAME_STATS = () => ({
  startedAt:            null,
  sabotagesTriggered:   0,
  sabotagesResolved:    0,
  sabotagesFailed:      0,
  duelsTriggered:       0,
  duelsWonByWarga:      0,
  duelsWonByProvokator: 0,
  debatesHeld:          0,
  topicDebatesHeld:     0,
  presentationsHeld:    0,
  playersEliminated:    0,
  totalAnswersCorrect:  0,
  totalAnswersWrong:    0,
  minigamesCompleted:   0,
  eventLog:             [],
});

const DEFAULT_SKINS = [
  { id: 0, name: 'Astronot',  img: '/images/characters/astronot.png', bg: '#ffb4ab', text: '#690005', border: '#ff897d' },
  { id: 1, name: 'Pelajar',   img: '/images/characters/pelajar.png',   bg: '#8fb2ff', text: '#002d70', border: '#5988f8' },
  { id: 2, name: 'Seniman',   img: '/images/characters/seniman.png',   bg: '#cda4ff', text: '#2c005b', border: '#a87aff' },
  { id: 3, name: 'Petani',    img: '/images/characters/petani.png',    bg: '#5ffcc9', text: '#003829', border: '#00d9a2' },
  { id: 4, name: 'Dokter',    img: '/images/characters/dokter.png',    bg: '#8ffff3', text: '#003833', border: '#3ae9d8' },
  { id: 5, name: 'Polisi',    img: '/images/characters/polisi.png',    bg: '#ffdf9c', text: '#251a00', border: '#ffc312' },
  { id: 6, name: 'Musisi',    img: '/images/characters/musisi.png',    bg: '#ffb7d7', text: '#5b002c', border: '#ff6eb4' },
  { id: 7, name: 'Guru',      img: '/images/characters/guru.png',      bg: '#ffc312', text: '#3f2e00', border: '#e6aa00' },
];

const PLAYER_COLORS = [
  '#ffb4ab', '#8fb2ff', '#5ffcc9', '#ffdf9c', '#ffb7d7', '#cda4ff', '#8ffff3',
  '#ffc8a1', '#d6ffb4', '#ffb4e5', '#a3c2ff', '#c4ffcb', '#ffd3b4', '#e2b4ff'
];

const OPERATOR_SKIN = { id: 'operator', name: 'Operator', img: '/images/characters/operator.png', bg: '#e5e7eb', text: '#111827', border: '#9ca3af' };

const snappy = { type: 'spring', stiffness: 500, damping: 30 };
const punchy = { type: 'spring', stiffness: 600, damping: 20 };

// Server-side constants
const DUEL_COOLDOWN_MS = 30_000;
const SABOTAGE_COOLDOWN_MS = 30_000;
const DUEL_WRONG_ANSWER_COOLDOWN_MS = 10_000;

module.exports = {
  DEFAULT_SETTINGS, DEFAULT_SKINS, EMPTY_GAME_STATS,
  PLAYER_COLORS, OPERATOR_SKIN,
  snappy, punchy,
  DUEL_COOLDOWN_MS, SABOTAGE_COOLDOWN_MS, DUEL_WRONG_ANSWER_COOLDOWN_MS,
};
