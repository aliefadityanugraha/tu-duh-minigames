/**
 * Kelas utilitas layout mini-game: mode fullscreen (debug) vs compact (Mission Book).
 */
export function getMinigameShellClasses(compact) {
  if (compact) {
    return {
      outer: 'w-full flex flex-col',
      board: 'w-full bg-yellow-100 border-2 border-black flex flex-col overflow-hidden',
      header: 'w-full bg-yellow-400 border-b-2 border-black flex items-center gap-2 px-3 py-2 shrink-0',
      title: 'text-black text-sm font-extrabold uppercase tracking-tight leading-none',
      subtitle: 'text-black/70 text-[9px] font-bold tracking-wider font-mono-tech',
      workArea: 'p-3 flex flex-col gap-3 w-full',
      footer: 'w-full px-3 py-2 bg-amber-200 border-t-2 border-black',
    };
  }
  return {
    outer: 'w-full max-w-[1280px] mx-auto bg-indigo-950 p-2 sm:p-3 md:p-4 font-sans min-h-screen flex items-center justify-center',
    board: 'w-full bg-yellow-100 shadow-[12px_12px_0px_0px_rgba(0,0,0,1.00)] outline outline-[5px] outline-offset-[-5px] outline-black border-4 border-black relative overflow-hidden flex flex-col transition-all duration-300',
    header: 'w-full h-10 sm:h-16 bg-yellow-400 border-b-2 sm:border-b-[4px] border-black flex flex-row items-center sm:justify-between px-2 sm:px-4 gap-2 shrink-0',
    title: 'text-black text-[10px] sm:text-lg md:text-xl font-extrabold uppercase tracking-tight leading-none font-sans',
    subtitle: 'text-black/70 text-[7px] sm:text-[9px] font-bold tracking-wider font-mono-tech mt-0.5',
    workArea: 'p-3 sm:p-4 flex flex-col gap-3 w-full min-h-0',
    footer: 'w-full h-auto px-6 py-3 bg-amber-200 border-t-[4px] border-black flex flex-col sm:flex-row justify-between items-center gap-4',
  };
}

/** Panggil callback standar + legacy onGameComplete */
export function fireTaskComplete(onComplete, onGameComplete) {
  onComplete?.({ success: true });
  onGameComplete?.();
}
