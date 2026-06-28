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
        flex flex-row items-center justify-between
        px-2 py-2 sm:px-6 md:px-8 sm:py-3 w-full
        bg-[#190047] border-b-4 border-black shadow-[4px_4px_0px_#000000] sm:shadow-[6px_6px_0px_#000000]
        z-50 sticky top-0 gap-1.5 sm:gap-3
        ${className}
      `}
    >
      {/* ── Sisi Kiri: Logo + Nav Items ── */}
      <div className="flex items-center w-auto gap-2 sm:gap-6 shrink-0">
        <a href="/" className="shrink-0 select-none">
          <span className="font-rubik italic font-bold text-[#ffc312] text-[20px] sm:text-3xl md:text-4xl tracking-[-1px] sm:tracking-[-1.5px] leading-none whitespace-nowrap hover:text-[#ffe5b3] transition-colors">
            TU-DUH!
          </span>
        </a>

        {navItems.length > 0 && (
          <div className="flex items-center gap-4">
            {navItems.map((item, idx) => {
              if (item.custom) {
                return <React.Fragment key={idx}>{item.custom}</React.Fragment>;
              }
              
              return item.href ? (
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
              );
            })}
          </div>
        )}
      </div>

      {/* ── Sisi Kanan: Room Code Badge + Custom Content ── */}
      <div className="flex items-center gap-1.5 sm:gap-3 w-auto justify-end shrink-0">
        {/* Room Code Badge */}
        {roomCode && (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 sm:gap-2.5 px-2 py-1.5 sm:px-5 sm:py-2.5 bg-[#ffc312] border-[3px] sm:border-4 border-solid border-black shadow-[3px_3px_0px_#000000] sm:shadow-[4px_4px_0px_#000000] hover:shadow-neo-md active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer shrink-0"
            title="Klik untuk menyalin kode room"
          >
            <span className="font-rubik italic text-[#6e5200] text-[11px] sm:text-base md:text-xl tracking-[0.5px] sm:tracking-[1.5px] leading-none whitespace-nowrap font-bold select-none">
              <span className="hidden sm:inline">KODE </span>ROOM: {roomCode}
            </span>
            {copied ? (
              <Check size={14} className="text-[#004d39] shrink-0 sm:w-4 sm:h-4 w-3.5 h-3.5" />
            ) : (
              <Copy size={14} className="text-[#6e5200] shrink-0 sm:w-4 sm:h-4 w-3.5 h-3.5" />
            )}
          </button>
        )}

        {/* Custom right content (e.g. badges, timer, buttons) */}
        {rightContent}
      </div>
    </nav>
  );
}
