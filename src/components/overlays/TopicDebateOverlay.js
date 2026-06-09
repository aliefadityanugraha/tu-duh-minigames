import React from 'react';
import { MessageSquare, Timer } from 'lucide-react';

/**
 * Banner/overlay debat topik bebas — muncul untuk semua pemain saat aktif.
 * Tidak memblokir layar penuh, hanya banner di atas konten.
 */
export default function TopicDebateBanner({ topicDebate }) {
  if (!topicDebate?.active) return null;

  const isUrgent = topicDebate.timer <= 20;

  return (
    <div className={`rounded-2xl border-2 p-4 flex items-start gap-4 animate-fadeIn ${
      isUrgent ? 'bg-amber-50 border-amber-400' : 'bg-cyan-50 border-cyan-300'
    }`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-xl ${
        isUrgent ? 'bg-amber-100 border border-amber-300' : 'bg-cyan-100 border border-cyan-300'
      }`}>
        💬
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-3 mb-1">
          <h4 className={`text-sm font-bold ${isUrgent ? 'text-amber-800' : 'text-cyan-800'}`}>
            Sesi Debat Topik Aktif
          </h4>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-bold font-mono-tech ${
            isUrgent ? 'bg-amber-100 border-amber-400 text-amber-700 animate-pulse' : 'bg-cyan-100 border-cyan-300 text-cyan-700'
          }`}>
            <Timer size={11} />
            {topicDebate.timer}s
          </div>
        </div>
        <p className={`text-sm font-semibold ${isUrgent ? 'text-amber-700' : 'text-cyan-700'}`}>
          "{topicDebate.topic}"
        </p>
        <p className={`text-xs mt-1 ${isUrgent ? 'text-amber-600' : 'text-cyan-600'}`}>
          Diskusikan topik ini bersama kelompok Anda!
        </p>
      </div>
    </div>
  );
}
