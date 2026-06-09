# 🚀 Among Us: Edisi Pancasila

Game edukasi multiplayer interaktif yang menggabungkan keseruan mekanik *social deduction* ala "Among Us" dengan pembelajaran nilai-nilai luhur Pancasila. Dibangun dengan gaya visual **Neo-Pop / Brutalism** yang mencolok, game ini dirancang khusus untuk membuat sesi belajar di kelas menjadi mendebarkan, kompetitif, dan penuh musyawarah.

---

## 🎮 Konsep Permainan

Pemain akan bergabung ke dalam sebuah *Room* (Lobi) yang dikontrol oleh seorang **Guru (Admin)**. Pemain akan dibagi menjadi dua peran rahasia: **Warga** dan **Provokator**.

- **Warga (Citizen):** Bertugas menyelesaikan misi-misi (*Mission Book*) yang berisi studi kasus pengamalan Pancasila untuk mencapai persentase kemenangan 100%. Warga juga harus mencari tahu siapa Provokator di antara mereka.
- **Provokator (Impostor):** Bertugas menghentikan Warga menyelesaikan misi dengan cara memberikan jawaban salah pada saat *Duel* atau memicu *Sabotase*. Provokator menang jika jumlah Warga tersisa sama dengan atau kurang dari jumlah Provokator, atau jika waktu permainan habis sebelum misi selesai.
- **Guru (Moderator):** Bertindak sebagai *Game Master*. Guru memiliki akses ke "Guru Control Panel" untuk mengawasi status seluruh pemain, memicu debat, menghentikan game, mengatur timer, hingga menunjuk siswa untuk melakukan presentasi secara acak.

---

## ⚡ Fitur & Mekanik Utama

### 1. 📖 Mission Book (Tugas Warga)
Setiap Warga memiliki *Mission Book* interaktif di layar mereka. Mereka harus menjawab soal-soal dan studi kasus seputar Pancasila. Menjawab benar akan menambah progres misi keseluruhan (*Team Mission*).

### 2. 🚨 Sabotase (Aksi Provokator)
Provokator dapat menyabotase sistem! Saat sabotase aktif, layar seluruh Warga akan terkunci. Satu Warga akan dipilih secara acak untuk menjadi pahlawan (*Rescue*). Warga terpilih ini harus bisa menjawab soal Pancasila dalam batas waktu tertentu untuk mengembalikan sistem seperti semula. Jika gagal, Provokator menang!

### 3. ⚔️ Duel 1v1 (Sudden Death)
Provokator dapat menantang satu Warga hidup secara langsung. Keduanya akan diberikan satu pertanyaan berebut (*Rebutan Kilat*). 
- Jika Warga menjawab salah, ia tidak langsung mati, namun waktu Duel akan terpotong secara instan dan soal akan diganti. 
- Siapa yang pertama kali berhasil menjawab dengan *Benar*, akan memenangkan duel dan lawannya akan langsung **tereliminasi**.

### 4. 📢 Musyawarah Kelas (Voting)
Guru dapat memberhentikan sementara waktu (Pause) permainan untuk mengadakan Sesi Musyawarah. Semua pemain akan berkumpul, berdebat (berbicara di dunia nyata/kelas), dan melakukan *Voting* (Pencoblosan) di layar gawai masing-masing untuk menebak dan mengeliminasi Provokator.

### 5. 🎤 Presentasi Acak
Sistem bisa memilih satu anak secara acak melalui fitur *Random Presentation*. Seluruh layar pemain lain akan memunculkan notifikasi bahwa anak tersebut sedang diminta berbicara oleh Guru.

### 6. 💬 Debat Topik Bebas
Guru dapat melempar sebuah *custom topic* (misal: "Apakah gotong royong luntur di era digital?") ke seluruh layar pemain. Game akan masuk mode *Topic Debate* lengkap dengan timer hitung mundur untuk sesi diskusi lisan.

---

## 🎨 Gaya Visual (Neo-Pop / Brutalism)

UI/UX pada game ini mengadopsi estetika *Neo-Pop Brutalism* dengan karakteristik:
- **Warna Kontras Tinggi:** Penggunaan warna mencolok (Kuning Terang, Ungu Gelap, Hijau Neon, Merah Darah).
- **Garis Tegas:** *Border* hitam tebal (4px) di hampir seluruh elemen.
- **Shadow Flat:** Bayangan kotak yang keras (`shadow-[6px_6px_0px_#000000]`) tanpa efek *blur*, menciptakan efek 3D *chunky*.
- **Tipografi:** Kombinasi *font* miring tebal (Italic Rubik) dan gaya *monospace* terminal (*tech/hacker vibes*).

---

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14](https://nextjs.org/) & React 18
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) dengan modifikasi custom utility (`globals.css`)
- **Backend & Realtime:** Node.js, [Socket.io](https://socket.io/) (Komunikasi WebSockets dua arah yang super cepat)
- **Icons:** [Lucide React](https://lucide.dev/)

---

## 🚀 Cara Menjalankan Secara Lokal (Development)

1. Pastikan Anda sudah menginstal [Node.js](https://nodejs.org/) (versi 18+ direkomendasikan).
2. Lakukan *clone* repository ini:
   ```bash
   git clone https://github.com/aliefadityanugraha/tu-duh-.git
   cd among-us-pancasila
   ```
3. Instal semua dependensi:
   ```bash
   npm install
   ```
4. Jalankan *development server*:
   ```bash
   npm run dev
   ```
5. Buka `http://localhost:3000` di *browser* (disarankan menggunakan lebih dari satu *tab* atau *device* untuk melakukan pengetesan *multiplayer*).

---

## 📁 Struktur Direktori Penting

- `/src/pages` - Berisi *routing* halaman utama (`/`, `/game`, `/stats`).
- `/src/components` - Seluruh komponen UI modular (WargaPanel, ProvokateurPanel, AdminView, dll).
- `/src/hooks/useSocket.js` - *Custom hook* krusial yang mengatur *state* dan *listener* Socket.io di sisi *Client*.
- `/server/server.js` - *Entry point* server khusus Express & Socket.io.
- `/server/handlers/` - Modul backend yang mengatur logika game, sinkronisasi ruang (*room*), dan pertanyaan (*questions*).
- `/server/lib/gameLogic.js` - Otak pemrosesan kondisi menang/kalah dan *timer* interval.

---

> *"Membangun karakter bangsa tidak pernah semenyenangkan ini."* 🇮🇩
