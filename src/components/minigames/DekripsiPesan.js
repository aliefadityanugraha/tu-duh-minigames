"use client";

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Shield } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea, MinigameSection,
  MinigameProgress, MinigameButton, MinigameWinBanner, SILA_LABELS,
} from './MinigameShell';

const WORD_POOL = [
  { word: 'BHINNEKA', hint: 'Bagian dari semboyan Bhinneka Tunggal Ika — persatuan dalam keberagaman.' },
  { word: 'PERSATU', hint: 'Sila ke-3: Persatuan Indonesia.' },
  { word: 'NUSANTARA', hint: 'Tanah air kita yang satu, dari Sabang sampai Merauke.' },
  { word: 'INDONESIA', hint: 'Negara kesatuan yang kita jaga bersama.' },
];

function shuffleWord(word) {
  const arr = word.split('');
  let result = [...arr];
  let attempts = 0;
  while (result.join('') === word && attempts < 20) {
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    attempts++;
  }
  return result.join('');
}

export default function DekripsiPesan({ onGameComplete, onComplete }) {
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const inputRef = useRef(null);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);



  const puzzle = useMemo(() => {
    const pick = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    return { ...pick, scrambled: shuffleWord(pick.word) };
  }, []);

  const { word: targetWord, scrambled, hint } = puzzle;
  const [userInput, setUserInput] = useState('');
  const [isWin, setIsWin] = useState(false);
  const [isWrong, setIsWrong] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Fire complete reliably
  useEffect(() => {
    if (isWin && !completedRef.current) {
      completedRef.current = true;
      fireTaskComplete(onCompleteRef.current, onGameComplete);
    }
  }, [isWin, onGameComplete]);

  const letterKeys = useMemo(() => {
    const unique = [...new Set(targetWord.split(''))];
    return unique.sort(() => Math.random() - 0.5);
  }, [targetWord]);

  useEffect(() => {
    // Auto-focus the invisible input on mount
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleInputChange = (e) => {
    if (isWin) return;
    setIsWrong(false);
    setUserInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, targetWord.length));
  };

  const handleKeyPress = (letter) => {
    if (isWin || userInput.length >= targetWord.length) return;
    setIsWrong(false);
    setUserInput((prev) => prev + letter);
    if (inputRef.current) inputRef.current.focus();
  };

  const handleBackspace = () => {
    if (isWin) return;
    setIsWrong(false);
    setUserInput((prev) => prev.slice(0, -1));
    if (inputRef.current) inputRef.current.focus();
  };

  const handleReset = () => {
    if (isWin) return;
    setIsWrong(false);
    setUserInput('');
    if (inputRef.current) inputRef.current.focus();
  };

  const handleSubmit = () => {
    if (isWin || completedRef.current) return;
    if (userInput.toUpperCase() === targetWord) {
      setIsWin(true);
      setIsWrong(false);
    } else {
      setIsWrong(true);
      if (inputRef.current) inputRef.current.focus();
    }
  };

  const progress = Math.round(
    ([...userInput.toUpperCase()].filter((ch, i) => ch === targetWord[i]).length / targetWord.length) * 100
  );

  const statusVariant = isWin ? 'win' : 'playing';
  const statusLabel = isWin ? '✅ SELESAI' : '🔤 TEBAK KATA';

  return (
    <MinigameRoot>
      <MinigameHeader
        icon={Shield}
        iconBg="bg-blue-500"
        title="Susun Kata Kebangsaan"
        sila={SILA_LABELS[3]}
        statusVariant={statusVariant}
        statusLabel={statusLabel}
      />

      <MinigameWorkArea className="flex flex-col !p-2 sm:!p-4 overflow-hidden h-full bg-blue-50 relative justify-start sm:justify-between">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4 w-full max-w-5xl mx-auto flex-1 min-h-0">

          {/* KATA ACAK SECTION */}
          <div className="flex flex-col gap-2 md:w-5/12 shrink-0 min-h-0">
            <MinigameSection label="Kata Acak" className="h-full">
              {/* Premium Scrambled Tiles */}
              <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6">
                <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                  {scrambled.split('').map((char, i) => (
                    <div
                      key={i}
                      className={`w-9 h-11 sm:w-11 sm:h-12 bg-yellow-300 text-black border-[3px] border-black flex items-center justify-center font-black text-xl sm:text-2xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform ${i % 2 === 0 ? '-rotate-2' : 'rotate-3'}`}
                    >
                      {char}
                    </div>
                  ))}
                </div>
              </div>

              {/* Premium Hint Box */}
              <div className="bg-[#f4f4f4] border-t-[3px] border-black p-3 sm:p-4 mt-auto -mx-3 sm:-mx-4 -mb-3 sm:-mb-4 px-3 sm:px-4 flex gap-3 items-start relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400"></div>
                <div className="shrink-0 w-7 h-7 bg-black text-white flex items-center justify-center font-black text-sm rotate-[-5deg] border-2 border-transparent shadow-[2px_2px_0px_0px_rgba(250,204,21,1)]">
                  💡
                </div>
                <div>
                  <div className="text-[10px] font-black tracking-widest uppercase mb-0.5 text-black">Petunjuk</div>
                  <div className="text-[11px] sm:text-xs font-bold text-gray-800 leading-tight">{hint}</div>
                </div>
              </div>
            </MinigameSection>
          </div>

          {/* JAWABAN SECTION */}
          <div className="flex flex-col gap-2 md:w-7/12 flex-1 min-h-0">
            <MinigameSection label="Jawaban Kamu" className="flex-1">

              {/* Dynamic Status Badge */}
              <div className="flex justify-center items-center h-6 sm:h-8 mb-3 sm:mb-5 mt-1 sm:mt-2">
                {isWin ? (
                  <span className="inline-flex items-center gap-1.5 bg-green-200 border-[2px] border-black px-3 py-1 text-black font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-1">
                    <span className="text-sm">🎉</span> Tepat Sekali!
                  </span>
                ) : isFocused ? (
                  <span className="inline-flex items-center gap-1.5 bg-yellow-200 border-[2px] border-black px-3 py-1 text-black font-black text-[10px] sm:text-xs uppercase tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse -rotate-1">
                    <span className="text-sm">⌨️</span> Ketik Sekarang
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-gray-50 border-[2px] border-gray-400 border-dashed px-3 py-1 text-gray-500 font-bold text-[10px] sm:text-xs uppercase tracking-wider">
                    👆 Klik kotak di bawah
                  </span>
                )}
              </div>

              {/* Answer Boxes with Silhouette and Focus states */}
              <div
                className="relative flex flex-wrap justify-center gap-2 sm:gap-3 mb-6 sm:mb-8"
                onClick={() => inputRef.current?.focus()}
              >
                {Array.from({ length: targetWord.length }).map((_, idx) => {
                  const letter = userInput[idx];
                  const isWrongPos = isWrong && letter && letter !== targetWord[idx];
                  const isCurrent = isFocused && userInput.length === idx;

                  return (
                    <div key={idx} className="flex flex-col items-center gap-0.5 z-0 pointer-events-none">
                      <div className={`w-9 h-11 sm:w-12 sm:h-14 flex items-center justify-center font-black text-xl sm:text-2xl uppercase transition-all duration-200 relative ${isWin && letter === targetWord[idx] ? 'bg-green-400 text-black border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                          : isWrongPos ? 'bg-red-400 text-black border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                            : letter ? 'bg-white text-black border-[3px] sm:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] -translate-y-1'
                              : isCurrent ? 'bg-yellow-50 text-black border-[3px] sm:border-4 border-black shadow-[0_0_0_4px_rgba(250,204,21,0.6)] scale-110 z-10'
                                : 'bg-gray-50 border-[3px] sm:border-4 border-gray-300 border-dashed text-transparent'
                        }`}>
                        {letter || ''}

                        {/* Blinking Cursor */}
                        {isCurrent && !letter && (
                          <span className="w-[3px] sm:w-1 h-6 sm:h-7 bg-black animate-pulse absolute" />
                        )}
                      </div>
                    </div>
                  );
                })}

                <input
                  ref={inputRef}
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  maxLength={targetWord.length}
                  disabled={isWin}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-text z-10"
                  autoComplete="off"
                  spellCheck="false"
                />

                {isWrong && (
                  <div className="absolute -bottom-10 sm:-bottom-12 left-0 right-0 mx-auto w-max max-w-[90%] bg-red-100 border-[3px] border-red-500 text-red-700 text-[10px] sm:text-xs font-black font-mono-tech uppercase text-center py-1 sm:py-1.5 px-4 animate-shake shadow-[2px_2px_0px_0px_rgba(239,68,68,1)] z-20">
                    ❌ Belum tepat — coba lagi!
                  </div>
                )}
              </div>
              <div className="mt-auto">
                <MinigameProgress label="PROGRESS HURUF" value={progress} win={isWin} />
              </div>
            </MinigameSection>
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="flex flex-col gap-2 w-full max-w-5xl mx-auto mt-2 sm:mt-3 shrink-0 pb-1">
          {isWin ? (
            <MinigameWinBanner win winMessage="Kata benar! Menunggu konfirmasi misi..." />
          ) : (
            <div className="flex gap-2 sm:gap-3">
              <MinigameButton
                variant="primary"
                onClick={handleSubmit}
                disabled={userInput.length !== targetWord.length}
                className="flex-1 py-3 sm:py-4 text-xs sm:text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none disabled:translate-y-0 transition-all"
              >
                CEK JAWABAN
              </MinigameButton>
              <MinigameButton
                variant="ghost"
                onClick={handleReset}
                disabled={!userInput.length}
                className="px-4 sm:px-6 py-3 sm:py-4 text-[10px] sm:text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:shadow-none disabled:translate-y-0 transition-all bg-gray-100"
              >
                RESET
              </MinigameButton>
            </div>
          )}

          {!isWin && (
            <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
              {letterKeys.map((letter) => (
                <MinigameButton
                  key={letter}
                  variant="ghost"
                  onClick={() => handleKeyPress(letter)}
                  disabled={userInput.length >= targetWord.length}
                  className="w-9 h-10 sm:w-11 sm:h-12 text-sm sm:text-base p-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none transition-all"
                >
                  {letter}
                </MinigameButton>
              ))}
              <MinigameButton variant="danger" onClick={handleBackspace} disabled={!userInput.length} className="px-3 h-10 sm:h-12 text-xs sm:text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-y-[2px] hover:shadow-none transition-all">
                ⌫
              </MinigameButton>
            </div>
          )}
        </div>
      </MinigameWorkArea>
    </MinigameRoot>
  );
}
