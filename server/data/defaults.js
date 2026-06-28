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
  minTaskDuration:   1,         // Detik minimum sebelum submit mini-game dianggap valid
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

module.exports = { DEFAULT_SETTINGS, EMPTY_GAME_STATS };
