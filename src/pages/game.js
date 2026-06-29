import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useSocket } from '../hooks/useSocket';
import { AlertTriangle } from 'lucide-react';
import { DEFAULT_SETTINGS } from '@shared/constants';

import GameHeader from '../components/game/GameHeader';
import PlayerView from '../components/game/PlayerView';
import AdminView from '../components/game/AdminView';

// Overlays
import DuelOverlay from '../components/overlays/DuelOverlay';
import SabotageOverlay from '../components/overlays/SabotageOverlay';
import SabotageRescueOverlay from '../components/overlays/SabotageRescueOverlay';
import DebateOverlay from '../components/overlays/DebateOverlay';
import PresentationOverlay from '../components/overlays/PresentationOverlay';
import RoleRevealOverlay from '../components/overlays/RoleRevealOverlay';

export default function Game() {
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();

  // Hooks declared unconditionally at the top level
  const [muted, setMuted] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [isNextTaskLoading, setIsNextTaskLoading] = useState(false);
  const [showRoleReveal, setShowRoleReveal] = useState(true);
  
  const socketContext = useSocket();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Pindah ke atas sebelum return null
  useEffect(() => {
    if (
      socketContext?.socket && socketContext?.room && socketContext?.room.state === 'playing' &&
      (socketContext?.roleInfo.role === 'warga' || socketContext?.roleInfo.role === 'provokator') && 
      !socketContext?.player?.isDead &&
      !socketContext?.currentTask && !socketContext?.taskLocked
    ) {
      socketContext.socket.emit('get-next-task');
    }
  }, [
    socketContext?.socket, 
    socketContext?.room?.state, 
    socketContext?.roleInfo.role, 
    socketContext?.player?.isDead, 
    socketContext?.currentTask, 
    socketContext?.taskLocked
  ]);

  if (!isMounted || !socketContext) return null;

  const {
    socket, room, player, roleInfo, logs,
    skinList,
    currentTask, feedback, isAnswered,
    selectedOption, setSelectedOption,
    setCurrentTask, setFeedback, setIsAnswered, setTaskError,
    taskError, minigameRetryKey,
    sabotageFeedback, setSabotageFeedback,
    sabotageQuiz,
    sabotageRescue,
    taskLocked,
    duelCooldownRemaining,
    presentationNotif, setPresentationNotif,
    sendDebateChat,
    leaveRoom,
    taskTimer,
  } = socketContext;

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

  // Task — kuis
  const handleOptionSelect = (idx) => { if (isAnswered) return; setSelectedOption(idx); };
  const handleSubmitQuiz = () => {
    if (selectedOption === null || isAnswered || !currentTask || currentTask.type !== 'quiz') return;
    if (!currentTask.sessionId) {
      setTaskError('Sesi misi tidak valid. Klik MISI BERIKUTNYA untuk mengambil misi baru.');
      return;
    }
    setTaskError(null);
    socket.emit('submit-task', {
      sessionId: currentTask.sessionId,
      type: 'quiz',
      questionId: currentTask.data.id,
      answerIndex: selectedOption,
      context: 'task',
    });
  };

  // Task — mini-game selesai
  const handleMinigameComplete = ({ sessionId, type, ...rest }) => {
    if (isAnswered || !currentTask) return;
    socket.emit('submit-task', { sessionId, type, context: 'task', ...rest });
  };

  const handleNextTask = () => {
    setIsNextTaskLoading(true);
    setCurrentTask(null);
    setFeedback(null);
    setIsAnswered(false);
    setSelectedOption(null);
    setTaskError(null);
    // Timeout reset loading jika server tidak respons
    setTimeout(() => setIsNextTaskLoading(false), 2000);
  };

  const handleClearTaskError = () => setTaskError(null);

  const handleRetryQuizSubmit = () => {
    if (!currentTask || currentTask.type !== 'quiz' || isAnswered) return;
    setTaskError(null);
    if (!currentTask.sessionId) {
      handleNextTask();
      return;
    }
    if (selectedOption === null) return;
    socket.emit('submit-task', {
      sessionId: currentTask.sessionId,
      type: 'quiz',
      questionId: currentTask.data.id,
      answerIndex: selectedOption,
      context: 'task',
    });
  };

  const handleRetryMinigameSubmit = () => {
    if (!currentTask || currentTask.type === 'quiz' || isAnswered) return;
    socket.emit('submit-task', {
      sessionId: currentTask.sessionId,
      type: currentTask.type,
      context: 'task',
    });
  };

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
  const handleEndTopicDebate      = () => socket.emit('end-topic-debate');
  const handleTriggerPresentation = (playerId) => socket.emit('trigger-presentation', { playerId });
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
        onLeaveRoom={leaveRoom}
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
          onEndTopicDebate={handleEndTopicDebate}
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
          skinList={skinList}
          currentTask={currentTask}
          isAnswered={isAnswered}
          selectedOption={selectedOption}
          feedback={feedback}
          taskLocked={taskLocked}
          sabotageQuiz={sabotageQuiz}
          duelCooldownRemaining={duelCooldownRemaining}
          taskTimer={taskTimer}
          isNextTaskLoading={isNextTaskLoading}
          onSelectOption={handleOptionSelect}
          onSubmitQuiz={handleSubmitQuiz}
          onMinigameComplete={handleMinigameComplete}
          onNextTask={handleNextTask}
          onClearTaskError={handleClearTaskError}
          onRetryMinigameSubmit={handleRetryMinigameSubmit}
          onRetryQuizSubmit={handleRetryQuizSubmit}
          taskError={taskError}
          minigameRetryKey={minigameRetryKey}
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
          currentTimer={room.sabotage?.timer ?? 40}
          maxTimer={room.sabotage?.maxTimer ?? 40}
          onSubmitAnswer={handleSubmitSabotageRescue}
        />
      )}

      {/* 3. Duel overlay — hanya untuk peserta duel (privat) */}
      {room.state === 'playing' && room.duel?.active &&
        (player?.name === room.duel?.provocateur || player?.name === room.duel?.citizen) && (
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
          selfRole={roleInfo.role}
        />
      )}

      {/* 5. Presentasi overlay — hanya untuk pemain yang terpilih */}
      {room.state === 'playing' &&
        room.presentation?.active &&
        room.presentation?.playerId === player?.id &&
        presentationNotif && (
        <PresentationOverlay message={presentationNotif} />
      )}

      {/* 6. Role Reveal Overlay — dipanggil saat awal game */}
      {showRoleReveal && room.state === 'playing' && !roleInfo.isGuru && (
        <RoleRevealOverlay
          role={roleInfo.role}
          isGuru={roleInfo.isGuru}
          player={player}
          room={room}
          teammates={roleInfo.teammates}
          skinList={skinList}
          onComplete={() => setShowRoleReveal(false)}
        />
      )}
    </div>
  );
}
