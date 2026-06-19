import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSocket } from '../hooks/useSocket';
import { AlertTriangle } from 'lucide-react';

import GameHeader from '../components/game/GameHeader';
import PlayerView from '../components/game/PlayerView';
import AdminView from '../components/game/AdminView';

// Overlays
import DuelOverlay from '../components/overlays/DuelOverlay';
import SabotageOverlay from '../components/overlays/SabotageOverlay';
import SabotageRescueOverlay from '../components/overlays/SabotageRescueOverlay';
import DebateOverlay from '../components/overlays/DebateOverlay';
import PresentationOverlay from '../components/overlays/PresentationOverlay';

export default function Game() {
  const router = useRouter();
  const {
    socket, room, player, roleInfo, logs,
    currentQuestion, feedback, isAnswered,
    selectedOption, setSelectedOption,
    sabotageFeedback, setSabotageFeedback,
    sabotageQuiz,
    sabotageRescue,
    taskLocked,
    duelCooldownRemaining,
    presentationNotif, setPresentationNotif,
  } = useSocket();

  const [muted, setMuted]         = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);

  // Minta soal pertama saat game mulai (Warga)
  useEffect(() => {
    if (socket && room && room.state === 'playing' && !roleInfo.isGuru && !currentQuestion && !taskLocked) {
      socket.emit('get-next-question');
    }
  }, [socket, room?.state, roleInfo.isGuru, currentQuestion, taskLocked]);

  // ── Koneksi terputus ──
  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center stars-bg p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-flat-lg border border-slate-200 p-8 text-center space-y-5">
          <AlertTriangle size={40} className="text-red-500 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Koneksi Lobi Terputus</h3>
          <p className="text-sm text-slate-500">Anda belum bergabung atau terputus dari room.</p>
          <button
            onClick={() => router.push('/')}
            className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition"
          >
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  const isPlayerDead = !!player?.isDead;

  // ── Action handlers ──

  // Task
  const handleOptionSelect = (idx) => { if (isAnswered) return; setSelectedOption(idx); };
  const handleSubmitAnswer = () => {
    if (selectedOption === null || isAnswered || !currentQuestion) return;
    socket.emit('submit-answer', { questionId: currentQuestion.id, answerIndex: selectedOption, context: 'task' });
  };
  const handleNextQuestion = () => socket.emit('get-next-question');

  // Sabotase — Provokator submit soal math (fase 1)
  const handleSubmitSabotageQuiz = (idx) => {
    if (!sabotageQuiz) return;
    socket.emit('submit-answer', {
      questionId: sabotageQuiz.question.id,
      answerIndex: idx,
      context: 'sabotage_provokator',
    });
  };

  // Sabotase — Warga terpilih submit soal rescue (fase 2)
  const handleSubmitSabotageRescue = (idx) => {
    if (!sabotageRescue) return;
    socket.emit('submit-answer', {
      questionId: sabotageRescue.question.id,
      answerIndex: idx,
      context: 'sabotage_rescue',
    });
  };

  // Duel
  const handleTriggerDuel     = (targetId) => socket.emit('trigger-duel', { targetPlayerId: targetId });
  const handleSubmitDuel      = (idx) => {
    if (!room.duel?.active) return;
    socket.emit('submit-answer', { questionId: room.duel.question.id, answerIndex: idx, context: 'duel' });
  };

  // Sabotase trigger
  const handleTriggerSabotage = () => socket.emit('trigger-sabotage');

  // Guru actions
  const handleTeacherPause        = () => socket.emit('teacher-pause');
  const handleRestartGame         = () => socket.emit('restart-game');
  const handleVotePlayer          = (targetId) => socket.emit('vote-player', { targetPlayerId: targetId });
  const handleTriggerTopicDebate  = (topic) => socket.emit('trigger-topic-debate', { topic });
  const handleTriggerPresentation = () => socket.emit('trigger-presentation');
  const handleEndPresentation     = () => socket.emit('end-presentation');

  return (
    <div className="relative min-h-screen stars-bg flex flex-col">
      <Head><title>Among Us Pancasila - Permainan</title></Head>

      {/* Tint merah saat sabotase fase rescue aktif */}
      {room.sabotage?.active && room.sabotage?.phase === 'warga_rescue' && (
        <div className="absolute inset-0 bg-red-500/5 z-0 pointer-events-none border-4 border-red-400/20 animate-pulse" />
      )}

      {/* ── Header ── */}
      <GameHeader
        room={room}
        player={player}
        roleInfo={roleInfo}
        socket={socket}
        muted={muted}
        setMuted={setMuted}
        statsOpen={statsOpen}
        setStatsOpen={setStatsOpen}
      />

      {/* ── Layout Guru ── */}
      {roleInfo.isGuru && (
        <AdminView
          room={room}
          player={player}
          roleInfo={roleInfo}
          logs={logs}
          socket={socket}
          statsOpen={statsOpen}
          onToggleStats={() => setStatsOpen(p => !p)}
          onPauseDebat={handleTeacherPause}
          onResetGame={handleRestartGame}
          onRestart={handleRestartGame}
          onTriggerTopicDebate={handleTriggerTopicDebate}
          onTriggerPresentation={handleTriggerPresentation}
          onEndPresentation={handleEndPresentation}
        />
      )}

      {/* ── Layout Pemain ── */}
      {!roleInfo.isGuru && (
        <PlayerView
          room={room}
          player={player}
          roleInfo={roleInfo}
          currentQuestion={currentQuestion}
          isAnswered={isAnswered}
          selectedOption={selectedOption}
          feedback={feedback}
          taskLocked={taskLocked}
          sabotageQuiz={sabotageQuiz}
          duelCooldownRemaining={duelCooldownRemaining}
          onSelectOption={handleOptionSelect}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNextQuestion}
          onTriggerSabotage={handleTriggerSabotage}
          onTriggerDuel={handleTriggerDuel}
          onSubmitSabotageQuiz={handleSubmitSabotageQuiz}
        />
      )}

      {/* ════════════════════════════════════════
          OVERLAYS — urutan z-index dari bawah ke atas
          ════════════════════════════════════════ */}

      {/* 1. Sabotase fase rescue — untuk semua KECUALI Warga target rescue (mereka pakai overlay sendiri) */}
      {room.state === 'playing' && room.sabotage?.active && room.sabotage?.phase === 'warga_rescue' &&
        !(roleInfo.role === 'warga' && sabotageRescue) && (
        <SabotageOverlay
          sabotage={room.sabotage}
          role={roleInfo.isGuru ? 'guru' : roleInfo.role || 'warga'}
        />
      )}

      {/* 2. Sabotase rescue overlay — HANYA untuk Warga yang terpilih (cek via sabotageRescue state) */}
      {room.state === 'playing' && room.sabotage?.active &&
        room.sabotage?.phase === 'warga_rescue' &&
        roleInfo.role === 'warga' &&
        sabotageRescue && (
        <SabotageRescueOverlay
          sabotageRescue={sabotageRescue}
          onSubmitAnswer={handleSubmitSabotageRescue}
        />
      )}

      {/* 3. Duel overlay */}
      {room.state === 'playing' && room.duel?.active && (
        <DuelOverlay
          duel={room.duel}
          selfName={player?.name || ''}
          onSubmitAnswer={handleSubmitDuel}
        />
      )}

      {/* 4. Debat voting overlay */}
      {room.state === 'playing' && room.debate?.active && (
        <DebateOverlay
          debate={room.debate}
          players={room.players}
          selfId={player?.id}
          isGuru={roleInfo.isGuru}
          isPlayerDead={isPlayerDead}
          onVote={handleVotePlayer}
          onSendChat={sendDebateChat}
        />
      )}

      {/* 5. Presentasi overlay — hanya untuk pemain yang terpilih */}
      {room.state === 'playing' &&
        room.presentation?.active &&
        room.presentation?.playerId === player?.id &&
        presentationNotif && (
        <PresentationOverlay message={presentationNotif} />
      )}
    </div>
  );
}
