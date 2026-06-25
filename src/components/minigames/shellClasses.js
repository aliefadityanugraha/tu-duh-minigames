/**
 * Kelas utilitas layout mini-game: selalu full-page (compact dihapus).
 */
export function getMinigameShellClasses() {
  return {
    outer: 'w-full flex-1 flex flex-col',
    board: 'w-full flex-1 bg-yellow-100 border-4 border-black relative overflow-hidden flex flex-col min-h-[460px]',
    header: 'w-full h-10 sm:h-16 bg-yellow-400 border-b-2 sm:border-b-[4px] border-black flex flex-row items-center sm:justify-between px-2 sm:px-4 gap-2 shrink-0',
    title: 'text-black text-[10px] sm:text-lg md:text-xl font-extrabold uppercase tracking-tight leading-none font-sans',
    subtitle: 'text-black/70 text-[7px] sm:text-[9px] font-bold tracking-wider font-mono-tech mt-0.5',
    workArea: 'p-3 sm:p-4 flex flex-col gap-3 w-full flex-1',
    footer: 'w-full h-auto px-6 py-3 bg-amber-200 border-t-[4px] border-black flex flex-col sm:flex-row justify-between items-center gap-4',
  };
}

/** Panggil callback standar + legacy onGameComplete */
export function fireTaskComplete(onComplete, onGameComplete) {
  onComplete?.({ success: true });
  onGameComplete?.();
}
