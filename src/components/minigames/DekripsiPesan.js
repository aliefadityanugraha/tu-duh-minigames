"use client";

import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Lock, RotateCcw, CheckCircle2, Shield } from 'lucide-react';

/**
 * DekripsiPesan - Caesar Cipher / Roda Sandi Minigame Component
 * Implements Sila ke-3 (Persatuan Indonesia)
 * 
 * Props:
 * - onGameComplete: function called when the game is won
 */
export default function DekripsiPesan({ onGameComplete }) {
  const TARGET_TEXT = "BHINNEKA";
  const CIPHER_TEXT = "FLMRRIOE"; // "BHINNEKA" shifted by +4

  // State
  const [shift, setShift] = useState(0); // 0 to 25
  const [userInput, setUserInput] = useState("");
  const [isWin, setIsWin] = useState(false);

  // Alphabet for the wheel
  const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  // Letter shifting function for Caesar Cipher decryption
  const decryptChar = (char, offset) => {
    if (!/[A-Z]/.test(char)) return char;
    const code = char.charCodeAt(0);
    // (code - 65 - offset + 26) % 26 + 65
    let decryptedCode = (code - 65 - offset) % 26;
    if (decryptedCode < 0) decryptedCode += 26;
    return String.fromCharCode(decryptedCode + 65);
  };

  const getDecryptedHint = (text, offset) => {
    return text
      .split("")
      .map((char) => decryptChar(char, offset))
      .join("");
  };

  // Get current decrypted representation of the ciphertext
  const currentDecryptedHint = getDecryptedHint(CIPHER_TEXT, shift);

  // Handle shift changes
  const handlePrevShift = () => {
    if (isWin) return;
    setShift((prev) => (prev === 0 ? 25 : prev - 1));
  };

  const handleNextShift = () => {
    if (isWin) return;
    setShift((prev) => (prev === 25 ? 0 : prev + 1));
  };

  // Handle typing from keyboard
  const handleInputChange = (e) => {
    if (isWin) return;
    const val = e.target.value.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8);
    setUserInput(val);
  };

  // Append letter from virtual keyboard
  const handleKeyPress = (letter) => {
    if (isWin) return;
    if (userInput.length < 8) {
      setUserInput((prev) => prev + letter);
    }
  };

  // Delete last character
  const handleBackspace = () => {
    if (isWin) return;
    setUserInput((prev) => prev.slice(0, -1));
  };

  // Reset input field
  const handleReset = () => {
    if (isWin) return;
    setUserInput("");
  };

  // Real-time validation
  useEffect(() => {
    if (userInput.toUpperCase() === TARGET_TEXT) {
      setIsWin(true);
      if (onGameComplete) {
        onGameComplete();
      }
    }
  }, [userInput, onGameComplete]);

  // Calculate sync progress (percentage of letters matching "BHINNEKA")
  const calculateSyncProgress = () => {
    let matchCount = 0;
    const inputUpper = userInput.toUpperCase();
    for (let i = 0; i < inputUpper.length; i++) {
      if (inputUpper[i] === TARGET_TEXT[i]) {
        matchCount++;
      }
    }
    return Math.round((matchCount / TARGET_TEXT.length) * 100);
  };

  const syncProgress = calculateSyncProgress();

  // Custom visual keyboard keys from mockup
  const keyboardKeys = ["I", "G", "E", "T", "K", "A", "H", "P", "N", "B"];

  return (
    <div className="w-full max-w-[1280px] mx-auto bg-indigo-950 p-2 sm:p-4 md:p-6 lg:p-8 font-sans min-h-screen flex items-center justify-center">
      {/* Outer Console Board */}
      <div className="w-full bg-yellow-100 shadow-[12px_12px_0px_0px_rgba(0,0,0,1.00)] outline outline-[5px] outline-offset-[-5px] outline-black border-4 border-black relative overflow-hidden flex flex-col transition-all duration-300">
        
        {/* Header Bar */}
        <div className="w-full h-auto sm:h-24 bg-yellow-400 border-b-[5px] border-black flex flex-col sm:flex-row items-center sm:justify-between px-4 py-3 sm:py-0 gap-3">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Star badge */}
            <div className="w-12 h-12 bg-yellow-500 rounded-xl shadow-[3px_3px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-center items-center shrink-0">
              <Shield className="w-7 h-7 text-yellow-950" />
            </div>
            {/* Title & Subtitle */}
            <div className="flex flex-col text-left">
              <h1 className="text-black text-xl sm:text-2xl md:text-3xl font-extrabold uppercase tracking-tight leading-none font-sans">
                DEKRIPSI PESAN KEBANGSAAN
              </h1>
              <span className="text-black/70 text-[10px] sm:text-xs font-bold tracking-wider font-mono-tech mt-1">
                SILA 3: PERSATUAN INDONESIA
              </span>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="flex items-center gap-2 sm:self-center shrink-0">
            {isWin ? (
              <div className="neo-badge bg-green-500 text-black border-black text-xs py-1 px-3 animate-bounce">
                🎉 DEKRIPSI SELESAI
              </div>
            ) : (
              <div className="neo-badge bg-red-500 text-white border-black text-xs py-1 px-3">
                🔒 TERKUNCI
              </div>
            )}
          </div>
        </div>

        {/* Main Work Area */}
        <div className="p-4 sm:p-6 md:p-8 flex flex-col lg:flex-row gap-6 items-stretch w-full min-h-[500px]">
          
          {/* Left Column: Ciphertext box & User Input slots */}
          <div className="flex-1 flex flex-col justify-between gap-6">
            
            {/* Ciphertext Panel */}
            <div className="w-full flex flex-col gap-2">
              <div className="self-stretch p-2 bg-black flex justify-start items-center">
                <span className="text-white text-sm font-bold font-mono-tech uppercase tracking-widest pl-2">
                  SANDI TERENKRIPSI
                </span>
              </div>
              <div className="self-stretch p-4 sm:p-6 bg-white shadow-[inset_4px_4px_0px_4px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col gap-4">
                {/* Main letter display */}
                <div className="w-full min-h-32 sm:h-40 p-4 bg-black flex flex-col justify-center items-center rounded border border-black shadow-inner">
                  <div className="text-center text-yellow-400 text-2xl sm:text-3xl md:text-5xl font-extrabold tracking-wide font-mono-tech select-all">
                    [ {currentDecryptedHint.split("").join(" - ")} ]
                  </div>
                  <div className="text-white/40 text-[10px] mt-2 font-mono-tech">
                    {isWin ? "Sandi terurai sempurna!" : "Gunakan Roda Sandi untuk menyelaraskan offset pergeseran"}
                  </div>
                </div>

                {/* Hint detail */}
                <div className="w-full flex flex-col gap-2">
                  <div className="w-full pb-1 border-b-2 border-black flex justify-start items-center">
                    <span className="text-black text-xs font-extrabold tracking-wider">PETUNJUK:</span>
                  </div>
                  <p className="text-black text-sm sm:text-base font-bold italic leading-relaxed text-left">
                    "Persatuan Indonesia. Jaga persaudaraan di bawah lambang Bhinneka Tunggal Ika."
                  </p>
                </div>
              </div>
            </div>

            {/* Input Slots Area */}
            <div className="w-full flex flex-col items-center gap-4 py-2">
              <h2 className="text-black text-xl sm:text-2xl font-extrabold uppercase tracking-tight">
                MASUKKAN PESAN TERURAI
              </h2>
              
              {/* Slots representing userInput */}
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3 w-full">
                {Array.from({ length: 8 }).map((_, idx) => {
                  const letter = userInput[idx];
                  const hasLetter = !!letter;
                  return (
                    <div key={idx} className="flex flex-col items-center gap-2">
                      <div className={`w-10 h-14 sm:w-14 sm:h-20 bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-center items-center overflow-hidden transition-all duration-100 ${
                        hasLetter ? 'bg-yellow-200' : 'bg-white'
                      }`}>
                        <span className={`text-center text-xl sm:text-2xl md:text-3xl font-extrabold uppercase ${
                          hasLetter ? 'text-black' : 'text-gray-400'
                        }`}>
                          {letter || "?"}
                        </span>
                      </div>
                      <span className="text-black text-xs sm:text-sm font-bold font-mono-tech">
                        {idx + 1}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Native styled text input */}
              <div className="w-full max-w-md mt-2">
                <input
                  type="text"
                  value={userInput}
                  onChange={handleInputChange}
                  maxLength={8}
                  placeholder="Ketik hasil dekripsi di sini..."
                  disabled={isWin}
                  className="w-full text-center text-lg sm:text-xl font-mono-tech uppercase neo-input tracking-wide"
                />
              </div>
            </div>

          </div>

          {/* Right Column: Roda Sandi & Stats */}
          <div className="w-full lg:w-72 shrink-0 flex flex-col sm:flex-row lg:flex-col justify-between gap-6">
            
            {/* RODA SANDI Panel */}
            <div className="flex-1 p-4 sm:p-5 bg-orange-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col items-center gap-4">
              <div className="w-full flex items-center gap-2 border-b-2 border-black pb-2 justify-center">
                <span className="text-black text-base font-extrabold tracking-wide uppercase font-sans">
                  RODA SANDI
                </span>
              </div>
              
              {/* Visual Caesar Cipher Wheel */}
              <div className="relative w-44 h-44 rounded-full border-4 border-black bg-indigo-950 flex items-center justify-center shadow-lg select-none">
                {/* Outer alphabet - fixed */}
                <div className="absolute inset-0 w-full h-full text-indigo-200">
                  {ALPHABET.map((letter, idx) => {
                    const angle = idx * (360 / 26);
                    return (
                      <span
                        key={`outer-${letter}`}
                        className="absolute text-[8px] font-bold"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-74px) rotate(${-angle}deg)`,
                          left: "calc(50% - 4px)",
                          top: "calc(50% - 6px)",
                        }}
                      >
                        {letter}
                      </span>
                    );
                  })}
                </div>

                {/* Inner alphabet - rotating */}
                <div 
                  className="relative w-28 h-28 rounded-full border-4 border-black bg-yellow-400 text-black flex items-center justify-center transition-transform duration-300 shadow-inner"
                  style={{ transform: `rotate(${-shift * (360 / 26)}deg)` }}
                >
                  {ALPHABET.map((letter, idx) => {
                    const angle = idx * (360 / 26);
                    return (
                      <span
                        key={`inner-${letter}`}
                        className="absolute text-[9px] font-black"
                        style={{
                          transform: `rotate(${angle}deg) translateY(-42px) rotate(${-angle}deg)`,
                          left: "calc(50% - 4.5px)",
                          top: "calc(50% - 6px)",
                        }}
                      >
                        {letter}
                      </span>
                    );
                  })}
                  {/* Pin center */}
                  <div className="w-6 h-6 rounded-full border-2 border-black bg-amber-800 shadow-md flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-yellow-300"></div>
                  </div>
                </div>

                {/* Key indicator arrow at top */}
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px] border-t-red-500 border-l-transparent border-r-transparent"></div>
                  <span className="text-[7px] text-white font-bold bg-red-500 px-1 rounded -mt-0.5 border border-black leading-none">
                    KEY
                  </span>
                </div>
              </div>

              {/* Offset shifting controls */}
              <div className="flex items-center gap-3 w-full justify-between">
                <button
                  type="button"
                  onClick={handlePrevShift}
                  disabled={isWin}
                  className="w-12 h-10 bg-black text-white hover:bg-neutral-800 active:translate-y-[2px] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                
                <div className="flex-1 bg-black/10 py-1 px-2 border-2 border-black text-center">
                  <span className="text-black text-xs font-bold font-mono-tech leading-none">
                    OFFSET:<br/>+{shift}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleNextShift}
                  disabled={isWin}
                  className="w-12 h-10 bg-black text-white hover:bg-neutral-800 active:translate-y-[2px] border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(255,255,255,0.4)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </div>
            </div>

            {/* GAME STATS Panel */}
            <div className="flex-1 p-4 sm:p-5 bg-teal-500 shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-between gap-4">
              <div className="w-full flex items-center gap-2 border-b-2 border-black pb-1">
                <div className="w-4 h-4 bg-black rounded-sm shrink-0"></div>
                <span className="text-black text-sm font-extrabold tracking-wide uppercase font-mono-tech">
                  GAME STATS
                </span>
              </div>
              
              <div className="flex flex-col gap-4">
                {/* Sync Progress Bar */}
                <div className="w-full flex flex-col gap-1">
                  <div className="flex justify-between items-center text-black text-xs font-bold font-mono-tech">
                    <span>SYNC PROGRESS</span>
                    <span>{syncProgress}%</span>
                  </div>
                  <div className="w-full h-6 p-0.5 bg-white outline outline-2 outline-offset-[-2px] outline-black flex justify-start items-stretch overflow-hidden">
                    <div 
                      className="bg-green-500 border-r-2 border-black transition-all duration-300"
                      style={{ width: `${syncProgress}%` }}
                    ></div>
                  </div>
                </div>

                {/* State details */}
                <div className="w-full p-2 bg-black/10 outline outline-2 outline-offset-[-2px] outline-black text-left flex flex-col gap-1">
                  <span className="text-black text-xs font-bold font-mono-tech leading-tight">
                    CURRENT OFFSET: +{shift}
                  </span>
                  <span className="text-black text-[10px] font-semibold font-mono-tech leading-tight">
                    KUNCI ALFABET: A ➔ {decryptChar('A', shift)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action / Submit sandi feedback */}
            <div className="w-full p-4 sm:p-5 bg-yellow-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-center items-stretch shrink-0">
              {isWin ? (
                <div className="w-full py-4 bg-green-600 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.30)] flex flex-col justify-center items-center border border-black">
                  <CheckCircle2 className="w-7 h-7 text-white animate-bounce" />
                  <span className="text-center text-white text-base font-extrabold font-sans uppercase leading-none mt-1">
                    DEKRIPI BERHASIL
                  </span>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    if (userInput.toUpperCase() === TARGET_TEXT) {
                      setIsWin(true);
                      if (onGameComplete) onGameComplete();
                    } else {
                      alert("Sandi salah! Silakan coba lagi.");
                    }
                  }}
                  className="w-full py-4 bg-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.30)] border border-black flex justify-center items-center hover:bg-neutral-800 cursor-pointer active:translate-y-[2px] transition-all"
                >
                  <span className="text-center text-white text-xl font-extrabold font-sans uppercase leading-none">
                    SUBMIT<br/>SANDI
                  </span>
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Bottom Keyboard Selector: PILIH PESAN */}
        <div className="w-full p-4 sm:p-6 md:p-8 bg-black/5 border-t-[5px] border-black flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <h2 className="text-black text-xl sm:text-2xl font-extrabold uppercase tracking-tight">
              PILIH PESAN
            </h2>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-3 w-full">
            {/* Letter keys */}
            {keyboardKeys.map((letter) => (
              <button
                key={letter}
                type="button"
                onClick={() => handleKeyPress(letter)}
                disabled={isWin || userInput.length >= 8}
                className="w-12 h-14 sm:w-16 sm:h-20 bg-white hover:bg-yellow-100 active:translate-y-[4px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex justify-center items-center overflow-hidden transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer shrink-0"
              >
                <span className="text-center text-black text-xl sm:text-2xl font-extrabold uppercase">
                  {letter}
                </span>
              </button>
            ))}

            {/* Backspace utility key */}
            <button
              type="button"
              onClick={handleBackspace}
              disabled={isWin || userInput.length === 0}
              className="w-16 h-14 sm:w-20 sm:h-20 bg-red-400 hover:bg-red-300 active:translate-y-[4px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-center items-center transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-extrabold text-black uppercase text-xs"
            >
              <span>HAPUS</span>
              <span className="text-[10px] font-mono-tech mt-1">⌫</span>
            </button>

            {/* Reset utility key */}
            <button
              type="button"
              onClick={handleReset}
              disabled={isWin || userInput.length === 0}
              className="w-16 h-14 sm:w-20 sm:h-20 bg-neutral-300 hover:bg-neutral-200 active:translate-y-[4px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1.00)] shadow-[6px_6px_0px_0px_rgba(0,0,0,1.00)] outline outline-4 outline-offset-[-4px] outline-black flex flex-col justify-center items-center transition-all duration-75 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer font-extrabold text-black uppercase text-xs"
            >
              <span>RESET</span>
              <RotateCcw className="w-4 h-4 mt-1" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
