import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { ArrowLeft, Eye, Layers, Palette, LayoutDashboard, ChevronRight, ChevronDown, CheckCircle, Terminal } from 'lucide-react';

import GameHeader from '../components/game/GameHeader';
import PlayerView from '../components/game/PlayerView';
import AdminView from '../components/game/AdminView';
import GameEndedCard from '../components/game/GameEndedCard';
import LiveStatsPanel from '../components/LiveStatsPanel';
import DebateOverlay from '../components/overlays/DebateOverlay';
import DuelOverlay from '../components/overlays/DuelOverlay';
import SabotageOverlay from '../components/overlays/SabotageOverlay';
import SabotageRescueOverlay from '../components/overlays/SabotageRescueOverlay';
import PresentationOverlay from '../components/overlays/PresentationOverlay';
import TopicDebateOverlay from '../components/overlays/TopicDebateOverlay';
import LoginForm from '../components/lobby/LoginForm';
import WaitingRoom from '../components/lobby/WaitingRoom';
import TaskContainer from '../components/panels/TaskContainer';
import { MINIGAME_REGISTRY } from '../components/minigames';
import TebakRumahIbadah from '../components/minigames/TebakRumahIbadah';
import HubungkanKebaikan from '../components/minigames/HubungkanKebaikan';
import DekripsiPesan from '../components/minigames/DekripsiPesan';
import UrutanMufakat from '../components/minigames/UrutanMufakat';
import TimbanganKeadilan from '../components/minigames/TimbanganKeadilan';

// ─── MOCK DATA ──────────────────────────────────────────────────────

const MOCK_PLAYERS = [
  { id: 'p1', name: 'Andi',   isGuru: false, isDead: false, role: 'warga',       score: 5, skinId: 0, duelCooldownEndsAt: null },
  { id: 'p2', name: 'Budi',   isGuru: false, isDead: false, role: 'warga',       score: 3, skinId: 1, duelCooldownEndsAt: null },
  { id: 'p3', name: 'Citra',  isGuru: false, isDead: true,  role: 'warga',       score: 2, skinId: 2, duelCooldownEndsAt: null },
  { id: 'p4', name: 'Dewi',   isGuru: false, isDead: false, role: 'provokator',  score: 4, skinId: 3, duelCooldownEndsAt: null },
  { id: 'p5', name: 'Eka',    isGuru: false, isDead: false, role: 'warga',       score: 1, skinId: 4, duelCooldownEndsAt: null },
  { id: 'guru', name: 'Guru Pak Agus', isGuru: true, isDead: false, role: null, score: 0, skinId: 0, duelCooldownEndsAt: null },
];

const MOCK_SETTINGS = {
  caseStudy: 'anti-hoaks',
  gameTimer: 300,
  provokatorCount: 'auto',
  tasksPerPlayer: 5,
  sabotageTimer: 40,
  duelTimer: 20,
  debateTimer: 90,

  quizRatio: 0.6,
  minigameEnabled: true,
  minTaskDuration: 15,
};

const MOCK_GAME_STATS = {
  startedAt: Date.now() - 180000,
  totalAnswersCorrect: 12,
  totalAnswersWrong: 5,
  sabotagesTriggered: 2,
  sabotagesResolved: 1,
  sabotagesFailed: 1,
  duelsTriggered: 3,
  duelsWonByWarga: 2,
  duelsWonByProvokator: 1,
  debatesHeld: 2,
  playersEliminated: 1,
  minigamesCompleted: 4,
  eventLog: [
    { type: 'task_correct',   message: 'Andi menjawab benar Sila #1', time: Date.now() - 60000 },
    { type: 'sabotage',       message: 'Dewi memicu sabotase!',      time: Date.now() - 120000 },
    { type: 'duel',           message: 'Duel: Dewi vs Budi',         time: Date.now() - 90000 },
    { type: 'eliminated',     message: 'Citra dieliminasi oleh voting', time: Date.now() - 30000 },
  ],
};

const MOCK_QUIZ_DATA = {
  id: 'q-sila3',
  question: 'Sila ke-3 Pancasila berbunyi...',
  options: ['Persatuan Indonesia', 'Ketuhanan Yang Maha Esa', 'Kerakyatan yang Dipimpin oleh Hikmat Kebijaksanaan', 'Kemanusiaan yang Adil dan Beradab'],
  sila: 3,
  answer: 0,
  explanation: 'Sila ke-3 Pancasila adalah Persatuan Indonesia, melambangkan semangat nasionalisme.',
};

const MOCK_MINIGAME_TASK_DATA_HUBUNGKAN = {
  sila: 2,
  label: 'Hubungkan Kebaikan',
};

const MOCK_QUESTION_DUEL = {
  id: 'dq1',
  question: 'Berapa hasil 7 × 8?',
  options: ['56', '48', '64', '72'],
};

const MOCK_SABOTAGE_QUESTION = {
  id: 'sq1',
  question: '5 × 3 = ?',
  options: ['15', '12', '10', '8'],
};

const MOCK_RESUCE_QUESTION = {
  id: 'sr1',
  question: 'Sila ke-2 Pancasila menekankan...',
  options: ['Kemanusiaan yang Adil dan Beradab', 'Ketuhanan Yang Maha Esa', 'Persatuan Indonesia', 'Kerakyatan'],
};

// ─── SCREEN REGISTRY ─────────────────────────────────────────────────

const SCREENS = [
  { id: 'login',          group: 'Lobby',   label: 'Login Form' },
  { id: 'waiting',        group: 'Lobby',   label: 'Waiting Room' },
  { id: 'guru-playing',   group: 'Guru / Admin',    label: 'Admin View' },
  { id: 'warga-playing',  group: 'Warga',    label: 'Playing' },
  { id: 'warga-locked',   group: 'Warga',    label: 'Sabotage Locked' },
  { id: 'warga-dead',     group: 'Warga',    label: 'Dead' },
  { id: 'prov-playing',   group: 'Provokator',    label: 'Playing' },
  { id: 'prov-dead',      group: 'Provokator',    label: 'Dead' },
  { id: 'prov-sab-quiz',  group: 'Provokator',    label: 'Sabotage Quiz' },
  { id: 'quiz-task',      group: 'Task',    label: 'Quiz Task' },
  { id: 'quiz-answered',  group: 'Task',    label: 'Quiz — Correct Feedback' },
  { id: 'quiz-wrong',     group: 'Task',    label: 'Quiz — Wrong Feedback' },
  { id: 'quiz-timer-3s',  group: 'Task',    label: 'Quiz — Timer 3s' },
  { id: 'minigame-ibadah',   group: 'Task',     label: 'Minigame — Tebak Rumah Ibadah' },
  { id: 'minigame-kebaikan', group: 'Task',     label: 'Minigame — Hubungkan Kebaikan' },
  { id: 'minigame-dekripsi', group: 'Task', label: 'Minigame — Dekripsi Pesan' },
  { id: 'minigame-urutan',   group: 'Task', label: 'Minigame — Urutan Mufakat' },
  { id: 'minigame-timbangan', group: 'Task', label: 'Minigame — Timbangan Keadilan' },
  { id: 'mg-tester', group: 'Minigame', label: '🎮 Minigame Tester' },
  { id: 'sabotage-overlay',  group: 'Overlay', label: 'Sabotage Overlay (Warga view)' },
  { id: 'sabotage-overlay-prov', group: 'Overlay', label: 'Sabotage Overlay (Prov view)' },
  { id: 'sabotage-rescue', group: 'Overlay', label: 'Sabotage Rescue Overlay' },
  { id: 'duel-overlay',   group: 'Overlay', label: 'Duel Overlay' },
  { id: 'debate-overlay', group: 'Overlay', label: 'Debate Overlay' },
  { id: 'presentation-overlay', group: 'Overlay', label: 'Presentation Overlay' },
  { id: 'topic-debate',   group: 'Overlay', label: 'Topic Debate Banner' },
  { id: 'game-ended-warga', group: 'End',  label: 'Game Ended — Warga Wins' },
  { id: 'game-ended-prov',  group: 'End',  label: 'Game Ended — Provokator Wins' },
];

const GROUP_ORDER = ['Lobby', 'Guru / Admin', 'Warga', 'Provokator', 'Task', 'Minigame', 'Overlay', 'End'];

// ─── MOCK ROOM FACTORY ───────────────────────────────────────────────

function buildRoom(overrides = {}) {
  return {
    code: 'DEV01',
    state: 'playing',
    players: MOCK_PLAYERS,
    tasksCompleted: 5,
    tasksRequired: 10,
    gameTimer: 180,
    gameStats: MOCK_GAME_STATS,
    settings: MOCK_SETTINGS,
    showStatsToAll: false,
    winner: null,
    winReason: '',
    sabotage: null,
    duel: null,
    debate: null,
    topicDebate: null,
    presentation: null,
    ...overrides,
  };
}

// ─── COMPONENT ───────────────────────────────────────────────────────

export default function DevMode() {
  const [mounted, setMounted] = useState(false);
  const [activeScreen, setActiveScreen] = useState('warga-playing');
  const [mockIsAnswered, setMockIsAnswered] = useState(false);
  const [mockFeedback, setMockFeedback] = useState(null);
  const [darkMode, setDarkMode] = useState(true);
  const [guruStatsOpen, setGuruStatsOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  
  useEffect(() => {
    setMockIsAnswered(false);
    setMockFeedback(null);
  }, [activeScreen]);

  const noop = () => {};
  const noopWithArg = () => {};

  if (!mounted) return null;

  const screen = SCREENS.find(s => s.id === activeScreen);

  // ── Build contextual mock data per screen ──
  let room, player, roleInfo, currentTask, feedback, isAnswered, selectedOption, taskError, taskTimer;

  switch (activeScreen) {

    // ── LOBBY ──
    case 'login':
      return (
        <DevLayout activeScreen={activeScreen} setActiveScreen={setActiveScreen} darkMode={darkMode} setDarkMode={setDarkMode}>
          <div className="flex-1 flex items-center justify-center p-4 min-h-full">
            <LoginForm onSubmit={(d) => console.log('Login submit:', d)} error={null} loading={false} />
          </div>
        </DevLayout>
      );

    case 'waiting':
      room = buildRoom({ state: 'lobby' });
      player = MOCK_PLAYERS[0];
      roleInfo = { role: null, isGuru: false };
      return (
        <DevLayout activeScreen={activeScreen} setActiveScreen={setActiveScreen} darkMode={darkMode} setDarkMode={setDarkMode}>
          <div className="p-4 min-h-full">
            <WaitingRoom socket={{ emit: noop, on: noop, off: noop, id: 'p1' }} room={room} player={player} roleInfo={roleInfo} />
          </div>
        </DevLayout>
      );

    // ── GAME — WARGA ──
    case 'warga-playing':
      room = buildRoom();
      player = MOCK_PLAYERS[0];
      roleInfo = { role: 'warga', isGuru: false };
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: 12, data: MOCK_QUIZ_DATA };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 12;
      break;

    case 'warga-locked':
      room = buildRoom({ sabotage: { active: true, phase: 'warga_rescue', timer: 25, maxTimer: 40, targetWargaName: 'Budi' } });
      player = MOCK_PLAYERS[0];
      roleInfo = { role: 'warga', isGuru: false };
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: 15, data: MOCK_QUIZ_DATA };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'warga-dead':
      room = buildRoom();
      player = { ...MOCK_PLAYERS[0], isDead: true };
      roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    // ── GAME — PROVOKATEUR ──
    case 'prov-playing':
      room = buildRoom();
      player = MOCK_PLAYERS[3]; // Dewi provokator
      roleInfo = { role: 'provokator', isGuru: false };
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: 10, data: MOCK_QUIZ_DATA };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 10;
      break;

    case 'prov-dead':
      room = buildRoom();
      player = { ...MOCK_PLAYERS[3], isDead: true };
      roleInfo = { role: 'provokator', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'prov-sab-quiz':
      room = buildRoom({ sabotage: { active: true, phase: 'provokator_quiz', timer: 10, maxTimer: 40, targetWargaName: 'Budi' } });
      player = MOCK_PLAYERS[3];
      roleInfo = { role: 'provokator', isGuru: false };
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: 15, data: MOCK_QUIZ_DATA };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      break;

    // ── GAME — GURU ──
    case 'guru-playing':
      room = buildRoom();
      player = MOCK_PLAYERS[5]; // Guru
      roleInfo = { role: null, isGuru: true };
      break;

    // ── TASK VIEWS ──
    case 'quiz-task':
      room = buildRoom();
      player = MOCK_PLAYERS[0];
      roleInfo = { role: 'warga', isGuru: false };
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: 15, data: MOCK_QUIZ_DATA };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      break;

    case 'quiz-answered':
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: null, data: MOCK_QUIZ_DATA };
      feedback = { correct: true, correctIndex: 0, explanation: MOCK_QUIZ_DATA.explanation };
      isAnswered = true; selectedOption = 0; taskError = null; taskTimer = null;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'quiz-wrong':
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: null, data: MOCK_QUIZ_DATA };
      feedback = { correct: false, correctIndex: 0, explanation: MOCK_QUIZ_DATA.explanation };
      isAnswered = true; selectedOption = 2; taskError = null; taskTimer = null;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'quiz-timer-3s':
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: 3, data: MOCK_QUIZ_DATA };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 3;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'minigame-ibadah':
      currentTask = { type: 'tebak-ibadah', sessionId: 'dev-mg0', timer: 15, data: { sila: 1, label: 'Tebak Rumah Ibadah' } };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'minigame-kebaikan':
      currentTask = { type: 'hubungkan-kebaikan', sessionId: 'dev-mg1', timer: 15, data: MOCK_MINIGAME_TASK_DATA_HUBUNGKAN };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'minigame-dekripsi':
      currentTask = { type: 'dekripsi-pesan', sessionId: 'dev-mg2', timer: 15, data: { sila: 3, label: 'Susun Kata' } };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'minigame-urutan':
      currentTask = { type: 'urutan-mufakat', sessionId: 'dev-mg3', timer: 15, data: { sila: 4, label: 'Urutan Mufakat' } };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'minigame-timbangan':
      currentTask = { type: 'timbangan-keadilan', sessionId: 'dev-mg4', timer: 15, data: { sila: 5, label: 'Timbangan Keadilan' } };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    // ── STANDALONE MINIGAMES ──
    case 'mg-tester':
      // No room/player needed — rendered standalone below
      room = null; player = null; roleInfo = null;
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    // ── OVERLAYS ──
    case 'sabotage-overlay':
      room = buildRoom({ sabotage: { active: true, phase: 'warga_rescue', timer: 25, maxTimer: 40, targetWargaName: 'Budi' } });
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'sabotage-overlay-prov':
      room = buildRoom({ sabotage: { active: true, phase: 'warga_rescue', timer: 25, maxTimer: 40, targetWargaName: 'Budi' } });
      player = MOCK_PLAYERS[3]; roleInfo = { role: 'provokator', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'sabotage-rescue':
      room = buildRoom({ sabotage: { active: true, phase: 'warga_rescue', timer: 30, maxTimer: 40, targetWargaName: 'Budi' } });
      player = MOCK_PLAYERS[1]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'duel-overlay':
      room = buildRoom({ duel: { active: true, provocateur: 'p4', citizen: 'p1', timer: 15, maxTimer: 20, question: MOCK_QUESTION_DUEL, answered: {} } });
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'debate-overlay':
      room = buildRoom({
        debate: {
          active: true, reason: 'emergency_meeting', timer: 60,
          votes: { p1: true },
          chat: [
            { senderId: 'p2', senderName: 'Budi', message: 'Dewi itu provokator!' },
            { senderId: 'p4', senderName: 'Dewi', message: 'Bukan! Saya warga biasa.' },
            { senderId: 'p5', senderName: 'Eka', message: 'Gak yakin... skip aja' },
          ],
        },
      });
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'presentation-overlay':
      room = buildRoom({ presentation: { active: true, playerId: 'p2', playerName: 'Budi' } });
      player = MOCK_PLAYERS[1]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
      break;

    case 'topic-debate':
      room = buildRoom({ topicDebate: { active: true, topic: 'Apakah hoaks bisa merusak persatuan Indonesia?', timer: 90 } });
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = { type: 'quiz', sessionId: 'dev-q1', timer: 15, data: MOCK_QUIZ_DATA };
      feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = 15;
      break;

    // ── END ──
    case 'game-ended-warga':
      room = buildRoom({ state: 'ended', winner: 'warga', winReason: 'Warga berhasil menyelesaikan seluruh tugas Pancasila!' });
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'game-ended-prov':
      room = buildRoom({ state: 'ended', winner: 'provokator', winReason: 'Provokator berhasil mengacau tugas Pancasila!' });
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    default:
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
  }

  // Override with mock state if applicable
  if (mockIsAnswered) {
    isAnswered = true;
    feedback = mockFeedback;
  }

  const isPlayerDead = !!player?.isDead;
  const selfId = player?.id;

  // ── Render main content ──
  const renderContent = () => {
    switch (activeScreen) {

      // ── Overlays (standalone) ──
      case 'sabotage-overlay':
      case 'sabotage-overlay-prov':
        return <SabotageOverlay sabotage={room.sabotage} role={roleInfo.role} />;

      case 'sabotage-rescue':
        return <SabotageRescueOverlay sabotageRescue={{ question: MOCK_RESUCE_QUESTION, timer: 30 }} maxTimer={40} onSubmitAnswer={noopWithArg} />;

      case 'duel-overlay':
        return <DuelOverlay duel={room.duel} selfName={player.name} onSubmitAnswer={noopWithArg} />;

      case 'debate-overlay':
        return <DebateOverlay debate={room.debate} players={room.players} selfId={selfId} selfRole={roleInfo.role} isGuru={false} isPlayerDead={false} onVote={noopWithArg} onSendChat={noopWithArg} />;

      case 'presentation-overlay':
        return <PresentationOverlay message="🎤 Giliran Presentasi! Budi diminta mempresentasikan pemahaman Sila #3 di depan kelas." />;

      case 'topic-debate':
        return (
          <div className="flex flex-col h-full">
            <TopicDebateOverlay topicDebate={room.topicDebate} />
            <p className="p-4 font-mono text-[#9c8f78] text-xs italic text-center">↑ Banner di atas adalah TopicDebateOverlay — ditampilkan inline dalam PlayerView</p>
          </div>
        );

      // ── End screens ──
      case 'game-ended-warga':
      case 'game-ended-prov':
        return <div className="p-4 h-full"><GameEndedCard room={room} roleInfo={roleInfo} selfId={selfId} onRestart={noop} /></div>;

      // ── Guru Admin ──
      case 'guru-playing':
        return <AdminView room={room} player={player} roleInfo={roleInfo} logs={['[DEV] Game started', '[DEV] Andi answered correctly']} socket={{ emit: noop, on: noop, off: noop, id: 'guru' }} statsOpen={guruStatsOpen} onToggleStats={() => setGuruStatsOpen(v => !v)} onPauseDebat={noop} onResetGame={noop} onRestart={noop} onTriggerTopicDebate={noopWithArg} onTriggerPresentation={noopWithArg} onEndPresentation={noop} />;

      // ── Standalone Minigames ──
      case 'mg-tester': return <MinigameTester />;

      // ── All PlayerView-based screens ──
      default:
        return (
          <PlayerView
            room={room}
            player={player}
            roleInfo={roleInfo}
            currentTask={currentTask}
            isAnswered={isAnswered}
            selectedOption={selectedOption}
            feedback={feedback}
            taskError={taskError}
            minigameRetryKey={0}
            taskLocked={activeScreen === 'warga-locked'}
            sabotageQuiz={activeScreen === 'prov-sab-quiz' ? { question: MOCK_SABOTAGE_QUESTION, timer: 10 } : null}
            onSubmitSabotageQuiz={noopWithArg}
            duelCooldownRemaining={0}
            taskTimer={taskTimer}
            onSelectOption={noopWithArg}
            onSubmitQuiz={() => {
              setMockIsAnswered(true);
              setMockFeedback({ correct: true, explanation: "Jawaban simulasi diterima." });
            }}
            onMinigameComplete={() => {
              setTimeout(() => {
                setMockIsAnswered(true);
                setMockFeedback({ correct: true, explanation: "Mini-game simulasi berhasil!" });
              }, 300);
            }}
            onNextTask={noop}
            onClearTaskError={noop}
            onRetryMinigameSubmit={noop}
            onRetryQuizSubmit={noop}
            onTriggerSabotage={noop}
            onTriggerDuel={noopWithArg}
          />
        );
    }
  };

  const showSabotageOverlay = activeScreen === 'warga-locked';

  const screensWithHeader = [
    'warga-playing', 'warga-locked', 'warga-dead',
    'prov-playing', 'prov-sab-quiz', 'prov-dead',
    'guru-playing', 'game-ended-warga', 'game-ended-prov'
  ];
  const isInGameScreen = screensWithHeader.includes(activeScreen);

  return (
    <>
      <Head>
        <title>DEV Dashboard — TU-DUH! Pancasila</title>
      </Head>
      <DevLayout activeScreen={activeScreen} setActiveScreen={setActiveScreen} darkMode={darkMode} setDarkMode={setDarkMode}>
        {isInGameScreen ? (
          <div className="flex flex-col min-h-full w-full bg-transparent">
            <GameHeader 
              room={room} 
              player={player} 
              roleInfo={roleInfo} 
              socket={{ emit: noop, on: noop, off: noop, id: selfId }} 
              muted={false} 
              setMuted={noop} 
              statsOpen={guruStatsOpen} 
              setStatsOpen={setGuruStatsOpen} 
              onLeaveRoom={noop} 
            />
            <div className="flex-1 relative flex flex-col">
              {renderContent()}
            </div>
          </div>
        ) : (
          renderContent()
        )}
        {showSabotageOverlay && (
          <SabotageOverlay sabotage={room.sabotage} role={roleInfo.role} />
        )}
      </DevLayout>
    </>
  );
}

// ── DEV LAYOUT & SIDEBAR ────────────────────────────────────────────────────────

function DevLayout({ children, activeScreen, setActiveScreen, darkMode, setDarkMode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const grouped = {};
  SCREENS.forEach(s => {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push(s);
  });

  const [expandedGroup, setExpandedGroup] = useState(() => SCREENS.find(s => s.id === activeScreen)?.group || GROUP_ORDER[0]);

  // Update expanded group if screen is changed externally
  useEffect(() => {
    const currentGroup = SCREENS.find(s => s.id === activeScreen)?.group;
    if (currentGroup && currentGroup !== expandedGroup) {
      setExpandedGroup(currentGroup);
    }
  }, [activeScreen]);

  return (
    <div className={`h-screen w-full flex overflow-hidden transition-colors duration-300 ${darkMode ? 'bg-black' : 'bg-slate-50'}`}>
      {/* ── Sidebar ── */}
      <div className={`flex flex-col h-screen shrink-0 transition-all duration-300 z-50 shadow-2xl overflow-hidden ${sidebarOpen ? 'w-64 border-r-2 border-[#4f4632] bg-[#190047]' : 'w-0'}`}>
        <div className="p-4 flex items-center justify-between border-b-2 border-[#4f4632] bg-[#93000a] text-[#ffdad6] shrink-0 w-64">
          <div className="flex items-center gap-2 overflow-hidden">
            <LayoutDashboard size={20} className="shrink-0" />
            <span className="font-rubik italic font-bold truncate">DEV MODE</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="p-1 hover:bg-[#b00010] rounded text-[#ffdad6]">
            <ArrowLeft size={16} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto custom-scrollbar w-64">
          <div className="p-3 space-y-2">
            {GROUP_ORDER.map(group => {
              if (!grouped[group]) return null;
              const isExpanded = expandedGroup === group;
              return (
                <div key={group} className="border border-[#4f4632] rounded-md overflow-hidden bg-[#22005c]">
                  <button
                    onClick={() => setExpandedGroup(isExpanded ? null : group)}
                    className="w-full flex items-center justify-between px-3 py-2 bg-[#270067] hover:bg-[#330081] transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <Layers size={14} className="text-[#9c8f78]" />
                      <span className="font-mono text-[#9c8f78] text-xs font-bold uppercase tracking-wider">{group}</span>
                    </div>
                    <ChevronDown size={14} className={`text-[#9c8f78] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isExpanded && (
                    <div className="p-2 space-y-1 bg-[#190047]">
                      {grouped[group].map(s => {
                        const isActive = activeScreen === s.id;
                        return (
                          <button
                            key={s.id}
                            onClick={() => setActiveScreen(s.id)}
                            className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-left font-mono text-xs font-medium transition-all duration-200 ${
                              isActive 
                                ? 'bg-[#ffc312] text-[#3f2e00] shadow-md transform scale-[1.02]' 
                                : 'text-[#e9ddff] hover:bg-[#330081] hover:text-white'
                            }`}
                          >
                            {isActive && <ChevronRight size={14} className="shrink-0" />}
                            <span className="truncate">{s.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-3 border-t-2 border-[#4f4632] shrink-0 space-y-2 w-64 bg-[#13003a]">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`w-full flex justify-center items-center gap-2 px-3 py-2 border border-[#4f4632] rounded-md font-mono text-xs font-bold transition-colors ${darkMode ? 'bg-[#270067] text-[#ffc312] hover:bg-[#330081]' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
          >
            <Palette size={14} /> {darkMode ? 'Light Theme' : 'Dark Theme'}
          </button>
          <a href="/" className={`w-full flex justify-center items-center gap-2 px-3 py-2 rounded-md font-mono text-xs font-bold transition-colors ${darkMode ? 'bg-[#ffc312] text-[#3f2e00] hover:bg-[#e0ab00]' : 'bg-[#93000a] text-white hover:bg-[#b00010]'}`}>
            <ArrowLeft size={14} /> Exit Dev Mode
          </a>
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className={`flex-1 h-screen relative overflow-hidden ${darkMode ? 'bg-black' : 'bg-gray-800'}`}>
        {/* Toggle Button */}
        {!sidebarOpen && (
          <button 
            onClick={() => setSidebarOpen(true)}
            className="absolute top-4 left-4 z-50 p-2 bg-[#93000a] text-[#ffc312] rounded-md shadow-lg hover:bg-[#b00010] transition-colors border-2 border-[#4f4632]"
            title="Open Sidebar"
          >
            <LayoutDashboard size={20} />
          </button>
        )}
        
        {/* Absolute full width and height container. 'transform translate-x-0' traps position: fixed overlays (like Sabotage) inside this container only. 'overflow-y-auto' allows scrolling if the game content overflows. */}
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden transform translate-x-0">
          {children}
        </div>
      </div>
      
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #4f4632;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}

// ── MINIGAME TESTER ────────────────────────────────────────────────────────

const MINIGAME_LIST = [
  { id: 'ibadah', label: '🕌 Tebak Rumah Ibadah (Sila #1)', component: TebakRumahIbadah },
  { id: 'kebaikan', label: '🧩 Hubungkan Kebaikan (Sila #2)', component: HubungkanKebaikan },
  { id: 'dekripsi', label: '📝 Dekripsi Pesan (Sila #3)', component: DekripsiPesan },
  { id: 'urutan', label: '🔢 Urutan Mufakat (Sila #4)', component: UrutanMufakat },
  { id: 'timbangan', label: '⚖️ Timbangan Keadilan (Sila #5)', component: TimbanganKeadilan },
];

function MinigameTester() {
  const [selectedMg, setSelectedMg] = useState(MINIGAME_LIST[0].id);
  const [deviceMode, setDeviceMode] = useState('desktop'); // 'desktop' | 'mobile'
  const [logs, setLogs] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [key, setKey] = useState(0);

  const currentMg = MINIGAME_LIST.find(m => m.id === selectedMg) || MINIGAME_LIST[0];
  const C = currentMg.component;

  const addLog = (msg) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  };

  const handleComplete = () => {
    addLog('onComplete() triggered!');
  };

  const handleGameComplete = () => {
    addLog('onGameComplete() triggered!');
    setIsCompleted(true);
  };

  const resetState = () => {
    setIsCompleted(false);
    setLogs([]);
    setKey(k => k + 1);
  };

  const containerClasses = deviceMode === 'mobile' 
    ? "w-full max-w-[375px] h-full max-h-[667px]" 
    : "w-full h-full max-w-4xl max-h-[800px]";

  return (
    <div className="flex flex-col h-full bg-[#13003a] relative">
      <div className="shrink-0 px-3 py-2 sm:px-4 sm:py-3 bg-[#270067] border-b-4 border-black flex flex-wrap items-center justify-between gap-3 sm:gap-4">
        <div>
          <div className="font-rubik italic text-[#41e5b3] text-lg sm:text-xl font-bold leading-none">MINIGAME TESTER</div>
          <div className="font-mono text-[#d3c5ab] text-[8px] sm:text-[10px] tracking-[1px] uppercase mt-0.5">DEV TOOLS</div>
        </div>
        
        <div className="flex flex-wrap gap-2 sm:gap-3 items-center">
          <select 
            className="bg-[#190047] text-white border border-[#4f4632] px-2 py-1 text-[10px] sm:text-xs rounded outline-none"
            value={selectedMg}
            onChange={e => {
              setSelectedMg(e.target.value);
              resetState();
            }}
          >
            {MINIGAME_LIST.map(mg => (
              <option key={mg.id} value={mg.id}>{mg.label}</option>
            ))}
          </select>

          <div className="flex bg-[#190047] rounded border border-[#4f4632] overflow-hidden">
            <button 
              className={`px-2 py-1 sm:px-3 text-[10px] sm:text-xs font-bold transition-colors ${deviceMode === 'desktop' ? 'bg-[#ff8a00] text-black' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setDeviceMode('desktop')}
            >
              DESKTOP
            </button>
            <button 
              className={`px-2 py-1 sm:px-3 text-[10px] sm:text-xs font-bold transition-colors ${deviceMode === 'mobile' ? 'bg-[#ff8a00] text-black' : 'text-gray-400 hover:text-white'}`}
              onClick={() => setDeviceMode('mobile')}
            >
              MOBILE
            </button>
          </div>

          <button onClick={resetState} className="px-2 py-1 sm:px-3 text-[10px] sm:text-xs bg-red-600 text-white font-bold rounded hover:bg-red-500 border border-black shadow">
            RESET
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto bg-[#0a0020] p-4 flex justify-center items-center">
        <div className={`relative border border-[#4f4632] bg-[#190047] shadow-2xl overflow-hidden transition-all duration-300 ${containerClasses}`}>
          {deviceMode === 'mobile' && (
            <div className="absolute top-0 left-0 w-full h-6 bg-black flex justify-between items-center px-4 z-50 text-[10px] text-gray-400 pointer-events-none">
              <span>9:41</span>
              <div className="flex gap-1">
                <span>📶</span>
                <span>🔋</span>
              </div>
            </div>
          )}
          <div className={`w-full h-full ${deviceMode === 'mobile' ? 'pt-6' : ''}`}>
            <C
              key={key}
              onComplete={handleComplete}
              onGameComplete={handleGameComplete}
            />
          </div>
        </div>
      </div>

      <div className="shrink-0 h-40 bg-black border-t-4 border-[#4f4632] flex flex-col">
        <div className="bg-[#270067] text-white text-xs font-mono font-bold px-3 py-1 flex justify-between items-center border-b border-gray-700">
          <div className="flex items-center gap-2"><Terminal size={12} /> Test Console ({currentMg.label})</div>
          <div>Status: {isCompleted ? <span className="text-green-400">✅ COMPLETED</span> : <span className="text-yellow-400">⏳ PLAYING</span>}</div>
        </div>
        <div className="flex-1 p-2 overflow-y-auto font-mono text-xs">
          {logs.length === 0 && <span className="text-gray-500">Waiting for events...</span>}
          {logs.map((msg, i) => (
            <div key={i} className="text-green-400 mb-1">{msg}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
