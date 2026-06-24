import React from 'react';
import { Timer } from 'lucide-react';

/**
 * Overlay sabotase untuk:
 * - Provokator: menunggu hasil (fase 2 sudah aktif)
 * - Guru: monitoring
 * - Warga non-target: layar terkunci (info saja)
 *
 * Warga TARGET rescue menggunakan SabotageRescueOverlay terpisah.
 */
export default function SabotageOverlay({ sabotage, role }) {
  if (!sabotage?.active || sabotage.phase !== 'warga_rescue') return null;

  const RESCUE_MAX = sabotage.maxTimer ?? 40;
  const timerPct   = Math.min(100, Math.max(0, (sabotage.timer / RESCUE_MAX) * 100));
  const isUrgent   = sabotage.timer <= 10;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-red-900/20 backdrop-blur-sm">
      <div className="absolute inset-0 border-4 border-red-400/30 animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-flat-lg border-2 border-red-300 overflow-hidden">
        {/* Timer bar */}
        <div className="w-full h-2 bg-red-100">
          <div
            className="h-full bg-red-500 transition-all duration-1000 ease-linear"
            style={{ width: `${timerPct}%` }}
          />
        </div>

        <div className="p-6 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-red-100 border border-red-300 flex items-center justify-center text-2xl">🚨</div>
              <div>
                <h2 className="text-xl font-extrabold text-red-700 uppercase font-mono-tech">Sabotase Aktif!</h2>
                <p className="text-red-500 text-xs mt-0.5 font-medium">
                  {sabotage.targetWargaName
                    ? `${sabotage.targetWargaName} sedang menyelamatkan situasi...`
                    : 'Warga terpilih sedang menjawab soal penyelamatan'}
                </p>
              </div>
            </div>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border ${
              isUrgent ? 'border-red-400 bg-red-50 animate-pulse' : 'border-red-200 bg-red-50'
            }`}>
              <Timer size={15} className="text-red-500" />
              <span className="text-2xl font-bold font-mono-tech text-red-700">{sabotage.timer}s</span>
            </div>
          </div>

          {/* Konten per role */}
          {role === 'provokator' && (
            <div className="py-5 bg-red-50 border border-red-200 rounded-xl text-center space-y-3">
              <div className="text-4xl">😈</div>
              <h3 className="text-lg font-bold text-red-700">Sabotase Berjalan!</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {sabotage.targetWargaName
                  ? `${sabotage.targetWargaName} sedang berjuang menjawab soal penyelamatan.`
                  : 'Warga terpilih sedang berjuang menyelamatkan situasi.'}
                {' '}Jika gagal sebelum waktu habis, Provokator menang!
              </p>
              <div className="inline-block px-3 py-1.5 bg-red-100 border border-red-300 rounded-lg text-xs text-red-700 font-semibold">
                Sisa Waktu: {sabotage.timer} detik
              </div>
            </div>
          )}

          {role === 'warga' && (
            <div className="py-5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <div className="text-4xl">🔒</div>
              <h3 className="text-lg font-bold text-slate-700">Tugas Anda Terkunci</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
                {sabotage.targetWargaName
                  ? <><strong className="text-slate-700">{sabotage.targetWargaName}</strong> sedang menyelamatkan kelas. Tunggu hingga sabotase diatasi!</>
                  : 'Seorang Warga sedang menyelamatkan kelas. Tunggu hingga sabotase diatasi!'
                }
              </p>
            </div>
          )}

          {role === 'guru' && (
            <div className="py-5 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-3">
              <h3 className="text-lg font-bold text-slate-700">🛡️ Guru Memantau Sabotase</h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
                {sabotage.targetWargaName
                  ? <><strong>{sabotage.targetWargaName}</strong> sedang menjawab soal penyelamatan.</>
                  : 'Warga terpilih sedang menjawab soal penyelamatan.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
