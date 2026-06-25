// Pengaturan default permainan yang dapat disesuaikan oleh Guru
const DEFAULT_SETTINGS = {
  tasksPerPlayer:    5,       // Jumlah tugas kuis per Siswa Warga (1-15)
  sabotageTimer:     40,      // Durasi Warga terpilih mengatasi sabotase (15-90 detik)
  sabotageQuizTimer: 15,      // Durasi Provokator menjawab soal kilat sebelum sabotase aktif (15 detik, fixed)
  duelTimer:         20,      // Durasi duel 1v1 per soal (10-60 detik)
  duelCooldown:      30,      // Cooldown Provokator setelah duel (detik, fixed 30)
  debateTimer:       90,      // Durasi musyawarah/voting (30-180 detik)
  topicDebateTimer:  120,     // Durasi debat topik bebas (60-300 detik)
  gameTimer:         300,     // Batas waktu keseluruhan permainan dalam detik (default 5 menit)
  provokatorCount:   'auto',  // Penentuan otomatis atau manual jumlah provokator

  caseStudy:         'anti-hoaks', // Paket studi kasus yang digunakan ('anti-hoaks' | 'saring-informasi')
  quizRatio:         0.4,       // Porsi kuis vs mini-game (0 = semua minigame, 1 = semua kuis)
  minigameEnabled:   true,      // Aktifkan mini-game dalam rotasi task
  minTaskDuration:   3,         // Detik minimum sebelum submit mini-game dianggap valid
};

// Template gameStats kosong — dipakai saat game dimulai atau di-restart
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

module.exports = { DEFAULT_SETTINGS, DEFAULT_SKINS, EMPTY_GAME_STATS };
