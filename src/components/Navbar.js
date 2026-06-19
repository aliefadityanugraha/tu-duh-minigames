import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

/**
 * Navbar global Neo-Pop Strike yang modular.
 *
 * Props:
 * - navItems     : Array<{ label: string, icon?: ReactNode, href?: string, active?: boolean }>
 * - roomCode     : string | null  — jika ada, tampilkan badge KODE ROOM dengan tombol salin
 * - rightContent : ReactNode      — konten kustom sisi kanan (misal: badge versi, timer, tombol)
 * - className    : string         — kelas tambahan untuk kontainer
 */
export default function Navbar({ navItems = [], roomCode = null, rightContent = null, className = '' }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!roomCode) return;
    navigator.clipboard.writeText(roomCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <nav
      className={`
        flex flex-col sm:flex-row items-center justify-between
        px-6 md:px-8 py-3 w-full
        bg-[#190047] border-b-4 border-black shadow-[6px_6px_0px_#000000]
        z-50 sticky top-0 gap-3
        ${className}
      `}
    >
      {/* ── Sisi Kiri: Logo + Nav Items ── */}
      <div className="flex items-center gap-6 self-start sm:self-auto">
        <a href="/" className="shrink-0 select-none">
          <span className="font-rubik italic font-bold text-[#ffc312] text-3xl md:text-4xl tracking-[-1.5px] leading-none whitespace-nowrap hover:text-[#ffe5b3] transition-colors">
            TU-DUH!
          </span>
        </a>

        {navItems.length > 0 && (
          <div className="flex items-center gap-4">
            {navItems.map((item, idx) => (
              item.href ? (
                <a
                  key={idx}
                  href={item.href}
                  className={`flex items-center gap-1.5 font-mono text-sm font-bold transition-colors select-none ${
                    item.active
                      ? 'text-[#5ffcc9]'
                      : 'text-[#e9ddff] hover:text-white'
                  }`}
                >
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  <span>{item.label}</span>
                </a>
              ) : (
                <span
                  key={idx}
                  className={`flex items-center gap-1.5 font-mono text-sm font-bold select-none ${
                    item.active
                      ? 'text-[#5ffcc9]'
                      : 'text-[#e9ddff]'
                  }`}
                >
                  {item.icon && <span className="text-base">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )
            ))}
          </div>
        )}
      </div>

      {/* ── Sisi Kanan: Room Code Badge + Custom Content ── */}
      <div className="flex items-center gap-3 self-start sm:self-auto w-full sm:w-auto justify-start sm:justify-end">
        {/* Room Code Badge */}
        {roomCode && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-2.5 px-5 py-2.5 bg-[#ffc312] border-4 border-solid border-black shadow-[4px_4px_0px_#000000] hover:shadow-neo-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
            title="Klik untuk menyalin kode room"
          >
            <span className="font-rubik italic text-[#6e5200] text-base sm:text-xl tracking-[1.5px] leading-none whitespace-nowrap font-bold select-none">
              KODE ROOM: {roomCode}
            </span>
            {copied ? (
              <Check size={16} className="text-[#004d39] shrink-0" />
            ) : (
              <Copy size={16} className="text-[#6e5200] shrink-0" />
            )}
          </button>
        )}

        {/* Custom right content (e.g. badges, timer, buttons) */}
        {rightContent}
      </div>
    </nav>
  );
}
