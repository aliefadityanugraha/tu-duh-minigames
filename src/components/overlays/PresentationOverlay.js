import React from 'react';

/**
 * Notifikasi presentasi — muncul di layar pemain yang terpilih.
 * Guru yang menutup sesi ini via tombol di AdminView.
 */
export default function PresentationOverlay({ message }) {
  if (!message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-indigo-900/30 backdrop-blur-sm">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-flat-lg border-2 border-indigo-300 overflow-hidden animate-fadeIn">
        <div className="h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="p-8 text-center space-y-5">
          <div className="w-20 h-20 bg-indigo-100 border border-indigo-200 rounded-full flex items-center justify-center mx-auto text-4xl">
            🎤
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-indigo-700 mb-2">Giliran Presentasi!</h2>
            <p className="text-slate-600 text-sm leading-relaxed">{message}</p>
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs text-indigo-600 font-medium">
            Guru akan memandumu. Bersiaplah untuk berbicara di depan kelas!
          </div>
        </div>
      </div>
    </div>
  );
}
