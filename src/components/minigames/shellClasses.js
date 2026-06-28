/**
 * Kelas utilitas layout mini-game: selalu full-page (compact dihapus).
 */
export function getMinigameShellClasses() {
  return {
    outer: 'w-full flex-1 flex flex-col',
    board: 'w-full flex-1 bg-yellow-100 border-4 border-black relative overflow-hidden flex flex-col min-h-[460px]',
    header: 'w-full h-auto min-h-[40px] sm:min-h-0 sm:h-16 bg-yellow-400 border-b-2 sm:border-b-[4px] border-black flex flex-row items-center justify-between px-2 py-1.5 sm:py-0 sm:px-4 gap-1 sm:gap-2 shrink-0',
    title: 'text-black text-[8.5px] sm:text-lg md:text-xl font-extrabold uppercase tracking-tight leading-[1.1] sm:leading-none font-sans',
    subtitle: 'text-black/80 text-[6px] sm:text-[9px] font-bold tracking-wider font-mono-tech mt-[2px] sm:mt-0.5 block leading-[1.1]',
    workArea: 'p-3 sm:p-4 flex flex-col gap-3 w-full flex-1 min-h-0',
    footer: 'w-full h-auto px-6 py-3 bg-amber-200 border-t-[4px] border-black flex flex-col sm:flex-row justify-between items-center gap-4',
  };
}

/** Panggil callback standar + legacy onGameComplete */
export function fireTaskComplete(onComplete, onGameComplete) {
  onComplete?.({ success: true });
  onGameComplete?.();
}
