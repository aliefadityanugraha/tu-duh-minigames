# Rencana Arsitektur: Integrasi 8 Mini-Games

Ide: Mengurangi porsi soal teks murni dan memperbanyak mini-games ala "Among Us" untuk meningkatkan interaktivitas dan *fun-factor* permainan.

Untuk mengelola 8 mini-games dengan logika yang berbeda-beda agar kode tetap rapi, modular, dan mudah di-maintain, disarankan menggunakan **Arsitektur Task Berbasis Komponen (Component-Based Task Architecture)**.

Berikut adalah desain manajemen kodenya:

---

## 1. Perubahan Struktur Folder (Frontend)

Semua mini-game dipisahkan ke dalam foldernya sendiri. Jangan mencampur logika mini-game di dalam `WargaPanel.js` atau `PlayerView.js`.

```text
src/
 └── components/
      ├── minigames/
      │    ├── index.js               // Export semua game dari satu tempat
      │    ├── WireFixGame.js         // Game sambung kabel
      │    ├── CardSwipeGame.js       // Game gesek kartu ID
      │    ├── MemoryPatternGame.js   // Game ingat urutan warna
      │    ├── TrashSorterGame.js     // Game pilah sampah
      │    └── ... (4 game lainnya)
      └── panels/
           └── TaskContainer.js       // (Pengganti WargaPanel.js) Wrapper utama
```

## 2. Standardisasi Interface Props (Kontrak Mini-Game)

Setiap mini-game **wajib** menerima standar props yang sama. Ini membuat `TaskContainer` tidak perlu tahu logika di dalam mini-game tersebut, ia hanya peduli hasilnya.

**Standar Props:**
- `onComplete(score)`: Dipanggil oleh mini-game saat pemain berhasil menyelesaikannya.
- `onFail(reason)`: Dipanggil jika pemain gagal (opsional, jika game bisa gagal).
- `difficulty`: Level kesulitan (mudah/sedang/susah).

Contoh `WireFixGame.js`:
```javascript
export default function WireFixGame({ onComplete }) {
  // ... logika rumit drag-and-drop kabel ...
  const handleAllWiresConnected = () => {
    onComplete(1); // Tambah 1 skor
  };
  return <div>{/* UI Kabel */}</div>;
}
```

## 3. Sistem `TaskContainer` (Frontend)

`TaskContainer` bertugas merender mini-game atau soal secara dinamis berdasarkan data yang dikirim server.

```javascript
import { WireFixGame, CardSwipeGame } from '../minigames';
import QuizTask from './QuizTask'; // Soal Pancasila lama

const GAME_REGISTRY = {
  'wire-fix': WireFixGame,
  'card-swipe': CardSwipeGame,
  'quiz': QuizTask,
};

export default function TaskContainer({ currentTask, onTaskComplete }) {
  // Ambil komponen dari registry berdasarkan tipe
  const ActiveComponent = GAME_REGISTRY[currentTask.type];

  if (!ActiveComponent) return <div>Task tidak valid</div>;

  return (
    <div className="neo-card-container">
      <ActiveComponent 
         taskData={currentTask.data} 
         onComplete={onTaskComplete} 
      />
    </div>
  );
}
```

## 4. Perubahan Logika Server (Backend)

Saat ini server hanya membagikan soal (`get-next-question`). Ubah handler ini menjadi `get-next-task`. Server akan mengacak apakah pemain mendapat kuis atau mini-game dengan porsi tertentu (misal 70% mini-game, 30% soal).

**`server/handlers/taskHandler.js` (Pengganti `questionHandler.js`)**
```javascript
const TASK_TYPES = [
  'wire-fix', 'card-swipe', 'memory-pattern', 'trash-sorter', // ... dsb
];

socket.on('get-next-task', () => {
  const isQuiz = Math.random() < 0.3; // 30% peluang dapat Soal Pancasila

  if (isQuiz) {
    const q = getRandomQuestion();
    socket.emit('next-task-delivery', { type: 'quiz', data: q });
  } else {
    // 70% peluang dapat mini game acak
    const randomGame = TASK_TYPES[Math.floor(Math.random() * TASK_TYPES.length)];
    socket.emit('next-task-delivery', { type: randomGame, data: {} });
  }
});
```

---

### Catatan Penting Saat Membangun Nanti:
1. **Client-Side Rendering:** Pastikan logika validasi mini-game (misal: apakah kabel sudah tersambung semua) dieksekusi 100% di Client (React). Server hanya menerima sinyal "berhasil" (`socket.emit('submit-task')`) untuk menambahkan poin. Ini menjaga server tetap ringan.
2. **Desain Mini-Games:** Gunakan elemen Neo-Pop / Brutalism (stroke hitam, warna solid cerah, shadow tebal) untuk konsistensi dengan UI game saat ini.
