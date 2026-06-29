import { motion } from 'framer-motion';
import { DEFAULT_SETTINGS, snappy, punchy } from '@shared/constants';

/**
 * Layar akhir permainan dengan Neo-Pop Brutalism Podium UI.
 */
export default function GameEndedCard({ room, roleInfo, onRestart, selfId, isGuru: isGuruProp }) {
  const showRestart = isGuruProp ?? roleInfo?.isGuru ?? false;
  const isWarga     = room.winner === 'warga';

  const sortedPlayers = [...room.players]
    .filter(p => !p.isGuru)
    .sort((a, b) => b.score - a.score);

  const top3 = sortedPlayers.slice(0, 3);
  const others = sortedPlayers.slice(3);

  const p1 = top3[0];
  const p2 = top3[1];
  const p3 = top3[2];

  const winTitle = isWarga ? "WARGA MENANG: KEADILAN TEGAK!" : "PROVOKATOR MENANG: KEKACAUAN TERJADI!";
  const winSubtitle = isWarga ? "MISI BERHASIL • KOTA AMAN DARI DISINFORMASI" : "MISI GAGAL • KOTA DIKUASAI DISINFORMASI";
  const titleColor = isWarga ? "text-[#ffc312]" : "text-[#ffb4ab]";
  const subBorder = isWarga ? "border-[#41e5b3]" : "border-[#ffb4ab]";
  const subText = isWarga ? "text-[#5ffcc9]" : "text-[#ffdad6]";

  const winReasonDisplay = _buildWinReason(room.winner, room.winReason, room);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center relative bg-[#190047] w-full min-h-[calc(100vh-120px)] overflow-y-auto px-4 py-8 custom-scrollbar"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 stars-bg opacity-40 pointer-events-none" />

      {/* Header Info */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ ...snappy, delay: 0.2 }}
        className="absolute top-4 left-4 p-2 bg-black border-2 border-black z-10 hidden md:block"
      >
        <span className="font-mono text-[#5ffcc9] text-xs font-bold tracking-wider">GAME ID: #{room.code}</span>
      </motion.div>

      {/* Win Title */}
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...punchy, delay: 0.1 }}
        className="flex flex-col items-center gap-2 relative z-10 mt-6 mb-16"
      >
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          className="relative shadow-[6px_6px_0px_#000000] bg-[#190047] border-4 border-black px-6 py-2"
        >
          <h1 className={`font-rubik italic font-black text-2xl md:text-5xl text-center ${titleColor} tracking-tighter`}>
            {winTitle}
          </h1>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...snappy, delay: 0.3 }}
          className={`px-6 py-2 bg-black border-2 border-solid ${subBorder}`}
        >
          <p className={`font-mono ${subText} text-[10px] md:text-sm text-center tracking-[0.2em] uppercase font-bold`}>
            {winSubtitle}
          </p>
        </motion.div>

        {/* Win Reason */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ ...snappy, delay: 0.4 }}
          className="mt-6 px-6 py-3 bg-[#13003a] border-2 border-black max-w-xl text-center shadow-[4px_4px_0px_#000000]"
        >
           <p className="font-mono text-[#e9ddff] text-xs font-bold uppercase tracking-wider mb-1">
             {winReasonDisplay.headline}
           </p>
           <p className="font-mono text-[#9c8f78] text-[10px] leading-relaxed">
             {winReasonDisplay.detail}
           </p>
        </motion.div>
      </motion.div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-2 md:gap-6 relative z-10 h-64 mb-20 mt-8 w-full max-w-4xl">
        {/* Player 2 (Left) */}
        {p2 ? (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...snappy, delay: 0.6 }}
            className="flex flex-col w-[100px] md:w-[160px] items-center gap-2 relative"
          >
            <div className="flex flex-col items-center mb-2">
              <span className={`font-mono text-[10px] md:text-xs text-[#5ffcc9] truncate w-full text-center ${p2.id === selfId ? 'font-bold' : ''}`}>
                @{p2.name}
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...punchy, delay: 0.8 }}
                className="font-rubik font-black text-[#e9ddff] text-lg md:text-2xl mt-0.5"
              >{p2.score} XP</motion.span>
            </div>
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...snappy, delay: 0.7 }}
              style={{ originY: 1 }}
              className="flex h-32 md:h-40 items-center justify-center w-full bg-[#41e5b3] border-4 border-black shadow-[6px_6px_0px_#000000]"
            >
              <span className="font-rubik font-black text-[#003829] text-5xl opacity-50">2</span>
            </motion.div>
          </motion.div>
        ) : <div className="w-[100px] md:w-[160px]" />}

        {/* Player 1 (Center) */}
        {p1 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...punchy, delay: 0.5 }}
            className="flex flex-col w-[120px] md:w-[200px] items-center gap-2 relative z-20"
          >
            <div className="flex flex-col items-center mb-2">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ ...punchy, delay: 0.7 }}
                className="w-8 h-8 md:w-12 md:h-12 bg-black border-2 border-[#ffc312] rounded-full flex items-center justify-center mb-1 shadow-[2px_2px_0px_#ffc312]"
              >
                <span className="text-xl md:text-2xl">👑</span>
              </motion.div>
              <span className={`font-mono text-xs md:text-sm text-[#ffc312] truncate w-full text-center ${p1.id === selfId ? 'font-bold' : ''}`}>
                @{p1.name}
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...punchy, delay: 0.8 }}
                className="font-rubik font-black text-[#ffc312] text-2xl md:text-4xl mt-0.5"
              >{p1.score} XP</motion.span>
            </div>
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...punchy, delay: 0.6 }}
              style={{ originY: 1 }}
              className="flex h-48 md:h-56 items-center justify-center w-full bg-[#ffc312] border-4 border-black shadow-[8px_8px_0px_#000000]"
            >
              <span className="font-rubik font-black text-[#6e5200] text-6xl opacity-50">1</span>
            </motion.div>
          </motion.div>
        )}

        {/* Player 3 (Right) */}
        {p3 ? (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...snappy, delay: 0.7 }}
            className="flex flex-col w-[100px] md:w-[160px] items-center gap-2 relative"
          >
            <div className="flex flex-col items-center mb-2">
              <span className={`font-mono text-[10px] md:text-xs text-[#ffdad6] truncate w-full text-center ${p3.id === selfId ? 'font-bold' : ''}`}>
                @{p3.name}
              </span>
              <motion.span
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ ...punchy, delay: 0.9 }}
                className="font-rubik font-black text-[#e9ddff] text-lg md:text-2xl mt-0.5"
              >{p3.score} XP</motion.span>
            </div>
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...snappy, delay: 0.8 }}
              style={{ originY: 1 }}
              className="flex h-24 md:h-32 items-center justify-center w-full bg-[#ffb4ab] border-4 border-black shadow-[6px_6px_0px_#000000]"
            >
              <span className="font-rubik font-black text-[#690005] text-5xl opacity-50">3</span>
            </motion.div>
          </motion.div>
        ) : <div className="w-[100px] md:w-[160px]" />}
      </div>

      {/* Others List */}
      {others.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...snappy, delay: 1 }}
          className="w-full max-w-xl bg-[#13003a] border-4 border-black shadow-[6px_6px_0px_#000000] p-4 mb-12 relative z-10"
        >
          <h3 className="font-mono text-[#d3c5ab] text-xs font-bold tracking-wider mb-4 uppercase border-b-4 border-black pb-2">
            PERINGKAT LAINNYA
          </h3>
          <div className="flex flex-col gap-2">
            {others.map((p, idx) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ ...snappy, delay: 1.1 + idx * 0.05 }}
                className={`flex items-center justify-between p-2.5 border-2 ${p.id === selfId ? 'bg-[#270067] border-[#ffc312]' : 'bg-[#190047] border-black'}`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono font-bold text-[#9c8f78] text-xs w-6 flex-shrink-0">#{idx + 4}</span>
                  <span className={`font-mono text-sm truncate ${p.id === selfId ? 'text-[#ffc312] font-bold' : 'text-[#e9ddff]'}`}>
                    @{p.name} {p.id === selfId ? '(You)' : ''}
                  </span>
                </div>
                <span className="font-rubik font-bold text-[#41e5b3] text-sm flex-shrink-0">{p.score} XP</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...snappy, delay: 1.3 }}
        className="relative z-10 flex flex-col items-center"
      >
        {showRestart ? (
          <motion.button
            onClick={onRestart}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.94 }}
            transition={punchy}
            className="px-10 py-5 bg-[#ffc312] border-4 border-black shadow-[6px_6px_0px_#000000] hover:bg-[#ffe5b3] flex items-center justify-center gap-3"
          >
            <motion.span
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
              className="text-2xl"
            >🔄</motion.span>
            <span className="font-rubik italic font-black text-[#3f2e00] text-xl tracking-wider">
              KEMBALI KE MENU UTAMA
            </span>
          </motion.button>
        ) : (
          <motion.div
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="px-8 py-4 bg-[#22005c] border-2 border-black text-center"
          >
            <span className="font-mono text-[#d3c5ab] text-xs italic">
              Menunggu Guru memulai permainan baru...
            </span>
          </motion.div>
        )}
      </motion.div>

    </motion.div>
  );
}

// ── Helper: bangun teks alasan kemenangan yang jelas & edukatif ──
function _buildWinReason(winner, rawReason, room) {
  if (winner === 'warga') {
    if (rawReason?.includes('tugas')) {
      const done = room.tasksCompleted ?? 0;
      return {
        headline: `Warga berhasil menyelesaikan semua ${done} tugas Pancasila tepat waktu!`,
        detail:   'Seluruh anggota kelompok bekerja sama menjawab soal-soal Pancasila dengan benar sebelum Provokator berhasil menggagalkan misi. Nilai gotong royong dan persatuan terbukti lebih kuat!',
      };
    }
    if (rawReason?.includes('Provokator') || rawReason?.includes('dieliminasi')) {
      const provNames = room.players
        .filter(p => p.role === 'provokator')
        .map(p => p.name)
        .join(', ');
      return {
        headline: `Semua Provokator (${provNames || 'Provokator'}) berhasil diidentifikasi dan dieliminasi!`,
        detail:   'Melalui musyawarah mufakat dan kecermatan dalam berdebat, Warga berhasil mengungkap identitas Provokator dan mengeliminasinya lewat voting. Sila ke-4 Pancasila terbukti ampuh!',
      };
    }
    return {
      headline: 'Warga berhasil mempertahankan persatuan Pancasila!',
      detail:   rawReason || 'Kerja sama tim yang solid membawa kemenangan bagi Warga.',
    };
  }

  // Provokator menang
  if (rawReason?.includes('Waktu') || rawReason?.includes('waktu')) {
    const elapsed = room.settings?.gameTimer ?? DEFAULT_SETTINGS.gameTimer;
    const menit   = Math.floor(elapsed / 60);
    return {
      headline: `Provokator berhasil mengulur waktu hingga ${menit} menit permainan habis!`,
      detail:   'Warga tidak berhasil menyelesaikan semua tugas Pancasila sebelum batas waktu. Provokator sukses mengacaukan konsentrasi kelompok melalui sabotase dan duel sehingga misi terhambat.',
    };
  }
  if (rawReason?.includes('Sabotase') || rawReason?.includes('sabotase')) {
    return {
      headline: 'Provokator menang karena sabotase tidak berhasil diatasi tepat waktu!',
      detail:   'Warga yang terpilih gagal menjawab soal penyelamatan sebelum hitungan mundur habis. Provokator berhasil membekukan seluruh aktivitas kelompok dan memenangkan permainan.',
    };
  }
  if (rawReason?.includes('Warga telah tereliminasi') || rawReason?.includes('habis')) {
    return {
      headline: `Provokator memenangkan permainan karena semua Warga telah tereliminasi!`,
      detail:   'Strategi licik Provokator berhasil. Tidak ada lagi Warga yang tersisa untuk mempertahankan nilai-nilai Pancasila di sektor ini.',
    };
  }
  return {
    headline: 'Provokator berhasil memecah belah persatuan Warga!',
    detail:   rawReason || 'Strategi Provokator berhasil menggagalkan misi kelompok Warga.',
  };
}
