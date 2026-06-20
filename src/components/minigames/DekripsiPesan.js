"use client";

import React, { useState, useMemo, useRef } from 'react';
import { Shield } from 'lucide-react';

import { fireTaskComplete } from './shellClasses';
import {
  MinigameRoot, MinigameHeader, MinigameWorkArea, MinigameSection,
  MinigameHint, MinigameProgress, MinigameButton, MinigameWinBanner, SILA_LABELS,
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

export default function DekripsiPesan({ onGameComplete, onComplete, compact = false }) {
  const completedRef = useRef(false);
  const puzzle = useMemo(() => {
    const pick = WORD_POOL[Math.floor(Math.random() * WORD_POOL.length)];
    return { ...pick, scrambled: shuffleWord(pick.word) };
  }, []);

  const { word: targetWord, scrambled, hint } = puzzle;
  const [userInput, setUserInput] = useState('');
  const [isWin, setIsWin] = useState(false);
  const [isWrong, setIsWrong] = useState(false);

  const letterKeys = useMemo(() => {
    const unique = [...new Set(targetWord.split(''))];
    return unique.sort(() => Math.random() - 0.5);
  }, [targetWord]);

  const handleInputChange = (e) => {
    if (isWin) return;
    setIsWrong(false);
    setUserInput(e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, targetWord.length));
  };

  const handleKeyPress = (letter) => {
    if (isWin || userInput.length >= targetWord.length) return;
    setIsWrong(false);
    setUserInput((prev) => prev + letter);
  };

  const handleBackspace = () => {
    if (isWin) return;
    setIsWrong(false);
    setUserInput((prev) => prev.slice(0, -1));
  };

  const handleReset = () => {
    if (isWin) return;
    setIsWrong(false);
    setUserInput('');
  };

  const handleSubmit = () => {
    if (isWin || completedRef.current) return;
    if (userInput.toUpperCase() === targetWord) {
      completedRef.current = true;
      setIsWin(true);
      setIsWrong(false);
      fireTaskComplete(onComplete, onGameComplete);
    } else {
      setIsWrong(true);
    }
  };

  const progress = Math.round(
    ([...userInput.toUpperCase()].filter((ch, i) => ch === targetWord[i]).length / targetWord.length) * 100
  );

  const statusVariant = isWin ? 'win' : 'playing';
  const statusLabel = isWin ? '✅ SELESAI' : '🔤 TEBAK KATA';

  return (
    <MinigameRoot compact={compact}>
      <MinigameHeader
        compact={compact}
        icon={Shield}
        iconBg="bg-yellow-500"
        title="Susun Kata Kebangsaan"
        sila={SILA_LABELS[3]}
        statusVariant={statusVariant}
        statusLabel={statusLabel}
      />

      <MinigameWorkArea compact={compact}>
        <MinigameSection label="Kata Acak">
          <div className="p-3 sm:p-4 bg-black flex justify-center items-center min-h-[64px] sm:min-h-[80px] -mx-3 sm:-mx-4 -mt-3 sm:-mt-4 mb-3 border-b-4 border-black">
            <span className="text-yellow-400 text-xl sm:text-2xl font-extrabold font-mono-tech tracking-[0.15em] sm:tracking-[0.3em]">
              {scrambled.split('').join(' ')}
            </span>
          </div>
          <MinigameHint>{hint}</MinigameHint>
        </MinigameSection>

        <MinigameSection label="Jawaban Kamu">
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2 mb-3">
            {Array.from({ length: targetWord.length }).map((_, idx) => {
              const letter = userInput[idx];
              const isWrongPos = isWrong && letter && letter !== targetWord[idx];
              return (
                <div key={idx} className="flex flex-col items-center gap-0.5">
                  <div className={`w-8 h-11 sm:w-10 sm:h-14 border-4 border-black flex items-center justify-center font-extrabold text-base sm:text-lg uppercase ${
                    isWin && letter === targetWord[idx] ? 'bg-green-400'
                      : isWrongPos ? 'bg-red-300'
                      : letter ? 'bg-yellow-200'
                      : 'bg-white text-gray-400'
                  }`}>
                    {letter || '?'}
                  </div>
                </div>
              );
            })}
          </div>

          <input
            type="text"
            value={userInput}
            onChange={handleInputChange}
            maxLength={targetWord.length}
            placeholder="Ketik jawaban..."
            disabled={isWin}
            className="w-full text-center text-sm sm:text-base font-mono-tech uppercase neo-input tracking-widest mb-3"
          />

          {isWrong && (
            <p className="text-red-700 font-mono text-[10px] sm:text-xs font-bold text-center mb-2">
              ❌ Belum tepat — coba lagi!
            </p>
          )}

          <MinigameProgress label="PROGRESS HURUF" value={progress} win={isWin} />
        </MinigameSection>

        <div className="flex flex-col gap-2 w-full max-w-md mx-auto">
          {isWin ? (
            <MinigameWinBanner win winMessage="Kata benar! Menunggu konfirmasi misi..." />
          ) : (
            <MinigameButton
              variant="primary"
              onClick={handleSubmit}
              disabled={userInput.length !== targetWord.length}
              className="w-full py-2.5 sm:py-3 text-xs sm:text-sm"
            >
              CEK JAWABAN
            </MinigameButton>
          )}
        </div>

        {!isWin && (
          <div className="flex flex-wrap justify-center gap-1.5 sm:gap-2">
            {letterKeys.map((letter) => (
              <MinigameButton
                key={letter}
                variant="ghost"
                onClick={() => handleKeyPress(letter)}
                disabled={userInput.length >= targetWord.length}
                className="w-9 h-10 sm:w-10 sm:h-12 text-sm sm:text-base p-0"
              >
                {letter}
              </MinigameButton>
            ))}
            <MinigameButton variant="danger" onClick={handleBackspace} disabled={!userInput.length} className="px-2 h-10 sm:h-12 text-[10px]">
              ⌫
            </MinigameButton>
            <MinigameButton variant="ghost" onClick={handleReset} disabled={!userInput.length} className="px-2 h-10 sm:h-12 text-[10px]">
              RESET
            </MinigameButton>
          </div>
        )}
      </MinigameWorkArea>
    </MinigameRoot>
  );
}
