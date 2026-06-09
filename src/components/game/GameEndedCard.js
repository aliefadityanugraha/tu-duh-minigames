import React from 'react';
import { RotateCcw, Trophy, Info } from 'lucide-react';

/**
 * Layar akhir permainan dengan penjelasan alasan kemenangan.
 */
export default function GameEndedCard({ room, roleInfo, onRestart, selfId, isGuru: isGuruProp }) {
  const medals      = ['🥇', '🥈', '🥉'];
  const showRestart = isGuruProp ?? roleInfo?.isGuru ?? false;
  const isWarga     = room.winner === 'warga';

  // Peta alasan teknis → kalimat penjelasan yang ramah & edukatif
  const winReasonDisplay = _buildWinReason(room.winner, room.winReason, room);

  return (
    <div className={`bg-white rounded-2xl border-2 shadow-flat-md overflow-hidden ${
      isWarga ? 'border-emerald-300' : 'border-red-300'
    }`}>
      {/* Accent bar */}
      <div className={`h-1.5 ${
        isWarga
          ? 'bg-gradient-to-r from-emerald-400 to-teal-500'
          : 'bg-gradient-to-r from-red-500 to-orange-400'
      }`} />

      <div className="p-8 flex flex-col items-center gap-6">

        {/* ── Hasil & Alasan ── */}
        <div className="text-center space-y-4 max-w-lg w-full">
          <span className="inline-block px-3 py-1 bg-slate-100 rounded-full text-slate-500 text-xs font-semibold uppercase tracking-wider">
            Permainan Berakhir
          </span>

          {/* Ikon pemenang */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto text-5xl border-4 ${
            isWarga
              ? 'bg-emerald-100 border-emerald-300'
              : 'bg-red-100 border-red-300'
          }`}>
            {isWarga ? '🏆' : '😈'}
          </div>

          {/* Judul pemenang */}
          <h2 className={`text-3xl font-extrabold ${isWarga ? 'text-emerald-600' : 'text-red-600'}`}>
            {isWarga ? 'Warga Menang!' : 'Provokator Menang!'}
          </h2>

          {/* Kotak alasan kemenangan */}
          <div className={`rounded-2xl border p-4 text-left space-y-2 ${
            isWarga
              ? 'bg-emerald-50 border-emerald-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className={`flex items-center gap-2 text-xs font-bold uppercase tracking-wider ${
              isWarga ? 'text-emerald-700' : 'text-red-700'
            }`}>
              <Info size={13} />
              Kenapa {isWarga ? 'Warga' : 'Provokator'} menang?
            </div>
            <p className={`text-sm leading-relaxed font-medium ${
              isWarga ? 'text-emerald-800' : 'text-red-800'
            }`}>
              {winReasonDisplay.headline}
            </p>
            <p className="text-xs leading-relaxed text-slate-500">
              {winReasonDisplay.detail}
            </p>
          </div>
        </div>

        {/* ── Papan Skor ── */}
        <div className="w-full max-w-md bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-2">
          <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
            <Trophy size={12} className="text-amber-500" />
            Papan Skor Akhir
          </h4>
          {[...room.players]
            .sort((a, b) => b.score - a.score)
            .map((p, idx) => {
              const isSelf = p.id === selfId;
              return (
                <div
                  key={p.id}
                  className={`flex justify-between items-center py-2 px-3 rounded-xl text-sm border transition-all ${
                    isSelf
                      ? 'bg-indigo-50 border-indigo-200'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`flex items-center gap-2 ${isSelf ? 'text-indigo-700 font-bold' : 'text-slate-600'}`}>
                    <span className="w-6 text-center text-base">
                      {idx < 3 ? medals[idx] : `#${idx + 1}`}
                    </span>
                    <span>
                      {p.name}
                      {p.isGuru && ' 🏫'}
                      {isSelf && <span className="text-indigo-400 font-normal text-xs ml-1">(Anda)</span>}
                    </span>
                  </div>
                  <span className={`font-bold font-mono text-sm ${isSelf ? 'text-indigo-600' : 'text-slate-700'}`}>
                    {p.score} Poin
                  </span>
                </div>
              );
            })}
        </div>

        {/* ── Tombol Restart (Guru) ── */}
        {showRestart && (
          <button
            onClick={onRestart}
            className="flex items-center gap-2.5 px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl shadow-flat-md transition-all active:scale-[0.98] text-sm tracking-wide"
          >
            <RotateCcw size={16} />
            Mulai Permainan Baru
          </button>
        )}
      </div>
    </div>
  );
}

// ── Helper: bangun teks alasan kemenangan yang jelas & edukatif ──
function _buildWinReason(winner, rawReason, room) {
  // Deteksi jenis kemenangan dari rawReason
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
    const elapsed = room.settings?.gameTimer ?? 300;
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
  if (rawReason?.includes('Jumlah') || rawReason?.includes('melebihi')) {
    const provCount = room.players.filter(p => p.role === 'provokator' && !p.isDead).length;
    const wargaCount = room.players.filter(p => p.role === 'warga' && !p.isDead).length;
    return {
      headline: `Provokator menang karena jumlah Warga (${wargaCount}) tidak lagi melebihi Provokator (${provCount})!`,
      detail:   'Terlalu banyak Warga yang tereliminasi melalui duel atau voting yang salah sasaran. Ketika jumlah Provokator seimbang atau melebihi Warga, Provokator otomatis menguasai forum.',
    };
  }
  return {
    headline: 'Provokator berhasil memecah belah persatuan Warga!',
    detail:   rawReason || 'Strategi Provokator berhasil menggagalkan misi kelompok Warga.',
  };
}
