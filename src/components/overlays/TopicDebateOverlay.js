import React from 'react';
import { MessageSquare, Timer, ArrowRightLeft, Brain, Zap } from 'lucide-react';
import { useSocket } from '../../hooks/useSocket';
import { PLAYER_COLORS } from '@shared/constants';

export default function TopicDebateBanner({ topicDebate, players }) {
  const { skinList } = useSocket();
  if (!topicDebate?.active) return null;

  const { phase, phaseTimer, totalTimer, topic, proPlayerId, kontraPlayerId } = topicDebate;

  const proPlayer = players?.find(p => p.id === proPlayerId);
  const kontraPlayer = players?.find(p => p.id === kontraPlayerId);

  // Helper to get skin img
  const getSkin = (skinId) => skinList.find(s => s.id === skinId)?.img || skinList[0]?.img;

  let accentColor = 'border-[#41e5b3] text-[#41e5b3] bg-[#003829]'; 
  let bgColor = 'bg-[#004d40]'; // Dark teal for thinking
  let phaseTitle = 'SESI DEBAT TOPIK';
  let Icon = MessageSquare;
  let highlightPro = false;
  let highlightKontra = false;
  let phaseDescription = '';

  if (phase === 'thinking') {
    accentColor = 'border-[#41e5b3] text-[#41e5b3] bg-[#001c36]'; 
    bgColor = 'bg-[#190047]'; // Tu-Duh deep purple for thinking
    phaseTitle = 'WAKTU BERPIKIR';
    Icon = Brain;
    phaseDescription = 'Siapkan argumen Anda bersama tim!';
  } else if (phase === 'pro_turn') {
    accentColor = 'border-[#32ff7e] text-[#32ff7e] bg-[#02421f]'; 
    bgColor = 'bg-[#013214]'; // Very deep green
    phaseTitle = 'GILIRAN PRO BERBICARA';
    Icon = Zap;
    highlightPro = true;
    phaseDescription = `${(proPlayer?.name || 'Pemain').toUpperCase()} menyampaikan argumen PRO.`;
  } else if (phase === 'kontra_turn') {
    accentColor = 'border-[#ff4d4d] text-[#ffb4ab] bg-[#5c0006]'; 
    bgColor = 'bg-[#4a0005]'; // Very deep red
    phaseTitle = 'GILIRAN KONTRA BERBICARA';
    Icon = Zap;
    highlightKontra = true;
    phaseDescription = `${(kontraPlayer?.name || 'Pemain').toUpperCase()} membalas dengan argumen KONTRA.`;
  } else if (phase === 'transition') {
    accentColor = 'border-[#ffc312] text-[#ffc312] bg-[#3f2e00]'; 
    bgColor = 'bg-[#2a1e00]'; // Very deep brown/yellow
    phaseTitle = 'JEDA PERGANTIAN';
    Icon = ArrowRightLeft;
    phaseDescription = 'Bersiap untuk giliran selanjutnya...';
  }

  return (
    <div className={`relative flex-1 h-full w-full flex flex-col overflow-hidden ${bgColor} animate-fadeIn transition-colors duration-1000`}>
      
      {/* Pattern Overlay */}
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[length:16px_16px] pointer-events-none"></div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-between w-full max-w-5xl mx-auto py-4 sm:py-6 px-4 sm:px-6">
        
        {/* TOP SECTION: Header & Timer */}
        <div className="w-full flex flex-col items-center gap-3 sm:gap-4 shrink-0 mt-2">
          <div className={`flex flex-col items-center justify-center w-full max-w-lg p-3 rounded-xl border-2 ${accentColor} shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-colors duration-500`}>
            <div className="flex items-center gap-2 mb-1.5">
              <Icon size={20} className={phase === 'thinking' ? 'animate-pulse' : ''} />
              <h4 className="text-sm sm:text-lg font-black font-mono tracking-wider uppercase drop-shadow-md">
                {phaseTitle}
              </h4>
            </div>
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1 bg-black/40 rounded border border-black/30 text-xs font-mono font-bold text-[#e9ddff]">
                <span>TOTAL SISA WAKTU:</span>
                <span className="text-white text-sm">{totalTimer}s</span>
              </div>
            </div>
          </div>

          {/* Phase Timer Countdown */}
          <div className={`flex items-center justify-center gap-2 px-6 py-2 rounded-xl border-4 border-black ${phaseTimer <= 5 ? 'bg-[#ff4d4d] text-white animate-pulse' : 'bg-black text-[#ffc312]'} shadow-[4px_4px_0px_rgba(0,0,0,1)] min-w-[100px] sm:min-w-[140px] transform hover:scale-105 transition-transform`}>
            <Timer size={24} />
            <span className={`text-4xl sm:text-5xl font-black font-mono leading-none tracking-widest`}>
              {phaseTimer}
            </span>
          </div>
        </div>

        {/* MIDDLE SECTION: Topic Box */}
        <div className="flex-1 flex flex-col justify-center items-center w-full max-w-3xl py-4 sm:py-6 min-h-[140px]">
          <div className="bg-[#22005c] text-white p-5 sm:p-6 rounded-2xl border-4 border-[#4f4632] shadow-[6px_6px_0px_rgba(0,0,0,1)] w-full flex flex-col items-center text-center gap-3">
            <span className="font-mono text-[#5ffcc9] text-[10px] sm:text-xs uppercase tracking-[0.2em] font-black drop-shadow-md">TOPIK DEBAT</span>
            <p className="font-rubik font-semibold text-base sm:text-xl italic leading-relaxed text-[#e9ddff] px-2 sm:px-4">
              "{topic}"
            </p>
            <div className="mt-1 px-4 py-1.5 bg-black/30 rounded-full border border-white/10">
              <p className="text-xs sm:text-sm text-[#ffc312] font-mono font-bold animate-pulse">
                {phaseDescription}
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: Players Versus */}
        <div className="w-full flex flex-row items-end justify-center gap-6 sm:gap-16 pb-2 sm:pb-4 shrink-0">
          {/* Pro */}
          {proPlayer && (
            <div className={`flex flex-col items-center transition-all duration-500 ${highlightPro || phase === 'thinking' ? 'scale-110 sm:scale-110 drop-shadow-[0_0_20px_rgba(50,255,126,0.6)] z-20' : 'opacity-40 scale-90 grayscale z-10'}`}>
              
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-[#32ff7e] border-2 border-black text-black font-black font-mono text-[10px] sm:text-xs z-20 whitespace-nowrap shadow-[2px_2px_0px_#000]">
                  TIM PRO
                </div>
                <div 
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-black overflow-hidden flex items-center justify-center shadow-[6px_6px_0px_rgba(0,0,0,1)] relative z-10`}
                  style={{ backgroundColor: PLAYER_COLORS[proPlayer.colorId ?? 0] }}
                >
                  <img src={getSkin(proPlayer.skinId)} alt="Pro" className="w-[85%] h-[85%] object-cover object-top transform hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div className="text-xs sm:text-sm font-black font-mono truncate max-w-[100px] sm:max-w-[140px] text-white mt-3 px-4 py-1 bg-black/60 rounded-full border border-white/20 shadow-md">
                {proPlayer.name}
              </div>
            </div>
          )}

          <div className="text-3xl sm:text-5xl font-black italic text-white/40 px-2 sm:px-6 mb-10 sm:mb-12 transform -skew-x-12 shrink-0">VS</div>

          {/* Kontra */}
          {kontraPlayer && (
            <div className={`flex flex-col items-center transition-all duration-500 ${highlightKontra || phase === 'thinking' ? 'scale-110 sm:scale-110 drop-shadow-[0_0_20px_rgba(255,77,77,0.6)] z-20' : 'opacity-40 scale-90 grayscale z-10'}`}>
              
              <div className="relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded bg-[#ff4d4d] border-2 border-black text-white font-black font-mono text-[10px] sm:text-xs z-20 whitespace-nowrap shadow-[2px_2px_0px_#000]">
                  TIM KONTRA
                </div>
                <div 
                  className={`w-20 h-20 sm:w-28 sm:h-28 rounded-full border-4 border-black overflow-hidden flex items-center justify-center shadow-[6px_6px_0px_rgba(0,0,0,1)] relative z-10`}
                  style={{ backgroundColor: PLAYER_COLORS[kontraPlayer.colorId ?? 0] }}
                >
                  <img src={getSkin(kontraPlayer.skinId)} alt="Kontra" className="w-[85%] h-[85%] object-cover object-top transform hover:scale-110 transition-transform duration-300" />
                </div>
              </div>

              <div className="text-xs sm:text-sm font-black font-mono truncate max-w-[100px] sm:max-w-[140px] text-white mt-3 px-4 py-1 bg-black/60 rounded-full border border-white/20 shadow-md">
                {kontraPlayer.name}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
