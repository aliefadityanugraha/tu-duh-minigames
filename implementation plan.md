# Rencana Implementasi: Integrasi Mini-Games ke Permainan Utama

> Dokumen ini mencatat arsitektur, status, dan langkah implementasi integrasi mini-games Pancasila ke dalam Among Us Pancasila.

---

## 1. Ringkasan Kondisi

### Mini-games yang sudah dibuat (4/5 Sila)

| ID | Komponen | Sila | Mekanik |
|---|---|---|---|
| `hubungkan-kebaikan` | `HubungkanKebaikan.js` | 2 | Sambung simbol kebaikan ↔ nilai |
| `dekripsi-pesan` | `DekripsiPesan.js` | 3 | Caesar cipher → "BHINNEKA" |
| `urutan-mufakat` | `UrutanMufakat.js` | 4 | Urutkan tahapan musyawarah |
| `timbangan-keadilan` | `TimbanganKeadilan.js` | 5 | Balance logistik Jawa–Sumatera |

**Belum ada:** mini-game Sila 1 (Ketuhanan Yang Maha Esa).

### Alur permainan sebelum integrasi

```
Warga buka game
  → emit get-next-question
  → Server kirim soal acak dari bank soal
  → WargaPanel tampilkan MCQ
  → emit submit-answer (context: task)
  → Benar: +1 skor, tasksCompleted++
  → Tombol "Misi Berikutnya"
```

### Masalah teknis yang ditangani

1. **Layout** — Mini-games awalnya `min-h-screen`; perlu mode `compact` untuk Mission Book (~34% lebar).
2. **Props tidak seragam** — Distandarkan ke `onComplete({ success })`.
3. **Validasi client-side** — Server menerima sinyal selesai dengan session token + minimum duration anti-cheat.
4. **Tidak ada mode gagal** — Mini-game: coba lagi sampai menang; kuis: feedback salah lalu lanjut.

---

## 2. Arsitektur Target

```
Server                          Client
────────                        ──────
get-next-task          →        useSocket: currentTask
submit-task            ←        TaskContainer
taskSessions{}                  ├── QuizTask (kuis)
MINIGAME_REGISTRY               └── Minigame components (compact)
```

### Kontrak props mini-game

```javascript
// Standar untuk semua task (quiz & minigame)
onComplete({ success: true, durationMs? })
onFail?(reason)           // opsional
compact?: boolean          // true = Mission Book panel
```

### Registry mini-game

```javascript
// src/components/minigames/index.js
MINIGAME_REGISTRY = {
  'hubungkan-kebaikan': { component, sila: 2, label: 'Hubungkan Kebaikan' },
  'dekripsi-pesan':     { component, sila: 3, label: 'Dekripsi Pesan' },
  'urutan-mufakat':     { component, sila: 4, label: 'Urutan Mufakat' },
  'timbangan-keadilan': { component, sila: 5, label: 'Timbangan Keadilan' },
}
```

---

## 3. Perubahan Struktur Folder

```
src/
 └── components/
      ├── minigames/
      │    ├── index.js          // Registry + exports
      │    ├── HubungkanKebaikan.js
      │    ├── DekripsiPesan.js
      │    ├── UrutanMufakat.js
      │    └── TimbanganKeadilan.js
      └── panels/
           ├── TaskContainer.js  // Router dinamis quiz/minigame
           ├── QuizTask.js       // UI kuis (extract dari WargaPanel)
           └── WargaPanel.js     // Wrapper Mission Book

server/
 └── data/
      └── minigames.js           // Daftar tipe mini-game server-side
```

---

## 4. Perubahan Server

### 4.1 `server/data/minigames.js`

Daftar tipe mini-game yang valid untuk random pick.

### 4.2 Handler `get-next-task`

Menggantikan/perluas `get-next-question`:

- Cek `taskLocked`, state `playing`, role `warga`
- Baca `settings.quizRatio` (default 0.4 = 40% kuis)
- Baca `settings.minigameEnabled` (default true)
- Buat `sessionId` unik, simpan di `room.activeTaskSessions[playerId]`
- Emit `next-task-delivery`: `{ type, sessionId, data }`

### 4.3 Handler `submit-task`

- Validasi `sessionId` cocok dengan session aktif pemain
- Cek minimum duration (`settings.minTaskDuration`, default 8 detik)
- **Quiz:** validasi jawaban seperti `_handleTaskAnswer` sekarang
- **Minigame:** terima success (validasi di client)
- Hapus session, emit `task-feedback`, update `tasksCompleted`

### 4.4 Pengaturan baru (`defaults.js`)

| Setting | Default | Keterangan |
|---|---|---|
| `quizRatio` | `0.4` | Porsi kuis (0–1), sisanya mini-game |
| `minigameEnabled` | `true` | Aktifkan mini-game |
| `minTaskDuration` | `8` | Detik minimum sebelum submit valid |

### 4.5 Backward compatibility

Event `get-next-question` dan `next-question-delivery` tetap didukung untuk transisi.

---

## 5. Perubahan Frontend

### 5.1 `TaskContainer.js`

Merender komponen berdasarkan `currentTask.type`:

- `quiz` → `QuizTask`
- `hubungkan-kebaikan`, dll. → komponen dari registry dengan `compact={true}`

### 5.2 `useSocket.js`

| Lama | Baru |
|---|---|
| `currentQuestion` | `currentTask` `{ type, sessionId, data }` |
| `next-question-delivery` | `next-task-delivery` (+ alias lama) |
| `answer-feedback` | `task-feedback` (+ alias lama) |

### 5.3 `game.js`

```javascript
socket.emit('get-next-task');
socket.emit('submit-task', { sessionId, type, questionId?, answerIndex?, context: 'task' });
```

### 5.4 UX Mission Book

- Badge tipe: `📝 KUIS` vs `🎮 MINI-GAME`
- Badge sila: `SILA #N`
- Setelah selesai: feedback + tombol "MISI BERIKUTNYA"

---

## 6. Mapping Win Condition

| Hasil | `tasksCompleted` | `player.score` |
|---|---|---|
| Kuis benar | +1 | +1 |
| Mini-game selesai | +1 | +1 |
| Kuis salah | 0 | 0 |
| Mini-game belum selesai | 0 | 0 |

Progress tim (`tasksCompleted / tasksRequired`) tetap acuan kemenangan Warga.

---

## 7. Yang Tidak Diubah

| Sistem | Alasan |
|---|---|
| Sabotase (math + rescue quiz) | Mekanik terpisah |
| Duel | Tetap kuis cepat |
| Debat, presentasi, Provokator panel | Tidak terkait task Warga |

---

## 8. Roadmap

### Sprint 1 — Frontend dasar ✅
- [x] `TaskContainer` + `QuizTask`
- [x] Registry mini-game
- [x] Mode `compact` pada 4 mini-game
- [x] Refactor `WargaPanel`

### Sprint 2 — Server & wiring ✅
- [x] `get-next-task` / `submit-task`
- [x] Session token + min duration
- [x] `useSocket` + `game.js`
- [x] Setting `quizRatio` di panel Guru

### Sprint 3 — Polish ✅
- [x] Statistik `minigamesCompleted` di `gameStats` + LiveStatsPanel + `/stats`
- [x] Preview task terkunci dinamis di Mission Book
- [x] Overlay fullscreen opsional untuk mini-game (tombol FULL + `MinigameOverlay`)

### Sprint 4 — Sila 1 (belum)
- [ ] Mini-game Sila 1 (mis. "Rangkai Keyakinan" atau "Filter Ucapan")
- [ ] Tambah ke registry server & client

---

## 9. Rekomendasi Porsi

| Fase | Kuis | Mini-game |
|---|---|---|
| Awal (4 sila) | 40% | 60% |
| Setelah Sila 1 selesai | 30% | 70% |

---

## 10. File yang Disentuh

| File | Aksi |
|---|---|
| `implementation plan.md` | Dokumen ini |
| `src/components/minigames/*.js` | `compact`, `onComplete` |
| `src/components/minigames/index.js` | Registry |
| `src/components/panels/TaskContainer.js` | Baru |
| `src/components/panels/QuizTask.js` | Baru |
| `src/components/panels/WargaPanel.js` | Pakai TaskContainer |
| `src/hooks/useSocket.js` | State `currentTask` |
| `src/pages/game.js` | Handler task baru |
| `server/handlers/gameHandler.js` | `get-next-task`, `submit-task` |
| `server/data/minigames.js` | Baru |
| `server/data/defaults.js` | `quizRatio`, dll. |
| `src/components/SettingsPanel.js` | Slider porsi kuis |

---

## 11. Catatan Keamanan

1. **Client-side validation** — Logika menang/gagal mini-game 100% di React; server hanya menerima sinyal selesai.
2. **Session token** — Setiap task punya `sessionId` sekali pakai; mencegah replay.
3. **Minimum duration** — Submit sebelum `minTaskDuration` detik ditolak (anti-instant cheat).
4. **Rate limit** — Satu session aktif per pemain pada satu waktu.

---

*Terakhir diperbarui: Juni 2026*
