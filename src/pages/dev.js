import React, { useState } from 'react';
import Head from 'next/head';
import { ArrowLeft, Eye, Layers, Palette } from 'lucide-react';

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
  maxPlayers: 10,
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
  { id: 'warga-playing',  group: 'Game',    label: 'Warga — Playing' },
  { id: 'warga-locked',   group: 'Game',    label: 'Warga — Sabotage Locked' },
  { id: 'warga-dead',     group: 'Game',    label: 'Warga — Dead' },
  { id: 'prov-playing',   group: 'Game',    label: 'Provokateur — Playing' },
  { id: 'prov-dead',      group: 'Game',    label: 'Provokateur — Dead' },
  { id: 'prov-sab-quiz',  group: 'Game',    label: 'Provokateur — Sabotage Quiz' },
  { id: 'guru-playing',   group: 'Game',    label: 'Guru — Admin View' },
  { id: 'quiz-task',      group: 'Task',    label: 'Quiz Task' },
  { id: 'quiz-answered',  group: 'Task',    label: 'Quiz — Correct Feedback' },
  { id: 'quiz-wrong',     group: 'Task',    label: 'Quiz — Wrong Feedback' },
  { id: 'quiz-timer-3s',  group: 'Task',    label: 'Quiz — Timer 3s' },
  { id: 'minigame-kebaikan', group: 'Task', label: 'Minigame — Hubungkan Kebaikan' },
  { id: 'minigame-dekripsi', group: 'Task', label: 'Minigame — Dekripsi Pesan' },
  { id: 'minigame-urutan',   group: 'Task', label: 'Minigame — Urutan Mufakat' },
  { id: 'minigame-timbangan', group: 'Task', label: 'Minigame — Timbangan Keadilan' },
  { id: 'sabotage-overlay',  group: 'Overlay', label: 'Sabotage Overlay (Warga view)' },
  { id: 'sabotage-overlay-prov', group: 'Overlay', label: 'Sabotage Overlay (Prov view)' },
  { id: 'sabotage-rescue', group: 'Overlay', label: 'Sabotage Rescue Overlay' },
  { id: 'duel-overlay',   group: 'Overlay', label: 'Duel Overlay' },
  { id: 'debate-overlay', group: 'Overlay', label: 'Debate Overlay' },
  { id: 'presentation-overlay', group: 'Overlay', label: 'Presentation Overlay' },
  { id: 'topic-debate',   group: 'Overlay', label: 'Topic Debate Banner' },
  { id: 'game-ended-warga', group: 'End',  label: 'Game Ended — Warga Wins' },
  { id: 'game-ended-prov',  group: 'End',  label: 'Game Ended — Provokator Wins' },
  { id: 'live-stats',      group: 'Stats',  label: 'Live Stats Panel' },
  { id: 'game-header',     group: 'UI',     label: 'Game Header' },
];

const GROUP_ORDER = ['Lobby', 'Game', 'Task', 'Overlay', 'End', 'Stats', 'UI'];

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
    showStatsToAll: true,
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
  const [activeScreen, setActiveScreen] = useState('warga-playing');
  const [darkMode, setDarkMode] = useState(true);

  const noop = () => {};
  const noopWithArg = () => {};

  const screen = SCREENS.find(s => s.id === activeScreen);

  // ── Build contextual mock data per screen ──
  let room, player, roleInfo, currentTask, feedback, isAnswered, selectedOption, taskError, taskTimer;

  switch (activeScreen) {

    // ── LOBBY ──
    case 'login':
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-[#13003a]' : 'bg-white'}`}>
          <DevNavbar activeScreen={activeScreen} setActiveScreen={setActiveScreen} darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="flex-1 flex items-center justify-center p-4">
            <LoginForm onSubmit={(d) => console.log('Login submit:', d)} error={null} loading={false} />
          </div>
        </div>
      );

    case 'waiting':
      room = buildRoom({ state: 'lobby' });
      player = MOCK_PLAYERS[0];
      roleInfo = { role: null, isGuru: false };
      return (
        <div className={`min-h-screen ${darkMode ? 'bg-[#13003a]' : 'bg-white'}`}>
          <DevNavbar activeScreen={activeScreen} setActiveScreen={setActiveScreen} darkMode={darkMode} setDarkMode={setDarkMode} />
          <div className="p-4">
            <WaitingRoom socket={{ emit: noop, on: noop, off: noop, id: 'p1' }} room={room} player={player} roleInfo={roleInfo} />
          </div>
        </div>
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

    // ── STATS / UI ──
    case 'live-stats':
      room = buildRoom();
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    case 'game-header':
      room = buildRoom();
      player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      break;

    default:
      room = buildRoom(); player = MOCK_PLAYERS[0]; roleInfo = { role: 'warga', isGuru: false };
      currentTask = null; feedback = null; isAnswered = false; selectedOption = null; taskError = null; taskTimer = null;
  }

  const isPlayerDead = !!player?.isDead;
  const selfId = player?.id;

  // ── Render main content ──
  const renderContent = () => {
    switch (activeScreen) {

      // ── Overlays (standalone) ──
      case 'sabotage-overlay':
      case 'sabotage-overlay-prov':
        return (
          <SabotageOverlay
            sabotage={room.sabotage}
            role={roleInfo.role}
          />
        );

      case 'sabotage-rescue':
        return (
          <SabotageRescueOverlay
            sabotageRescue={{ question: MOCK_RESUCE_QUESTION, timer: 30 }}
            maxTimer={40}
            onSubmitAnswer={noopWithArg}
          />
        );

      case 'duel-overlay':
        return (
          <DuelOverlay
            duel={room.duel}
            selfName={player.name}
            onSubmitAnswer={noopWithArg}
          />
        );

      case 'debate-overlay':
        return (
          <DebateOverlay
            debate={room.debate}
            players={room.players}
            selfId={selfId}
            selfRole={roleInfo.role}
            isGuru={false}
            isPlayerDead={false}
            onVote={noopWithArg}
            onSendChat={noopWithArg}
          />
        );

      case 'presentation-overlay':
        return (
          <PresentationOverlay
            message="🎤 Giliran Presentasi! Budi diminta mempresentasikan pemahaman Sila #3 di depan kelas."
          />
        );

      case 'topic-debate':
        return (
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <TopicDebateOverlay topicDebate={room.topicDebate} />
            <p className="p-4 font-mono text-[#9c8f78] text-xs italic text-center">↑ Banner di atas adalah TopicDebateOverlay — ditampilkan inline dalam PlayerView</p>
          </div>
        );

      // ── End screens ──
      case 'game-ended-warga':
      case 'game-ended-prov':
        return (
          <div className="p-4">
            <GameEndedCard room={room} roleInfo={roleInfo} selfId={selfId} onRestart={noop} />
          </div>
        );

      // ── Stats ──
      case 'live-stats':
        return (
          <div className="p-4 max-w-3xl">
            <LiveStatsPanel room={room} isCollapsed={false} onToggle={noop} />
          </div>
        );

      // ── Game Header ──
      case 'game-header':
        return (
          <GameHeader
            room={room}
            player={player}
            roleInfo={roleInfo}
            socket={{ emit: noop, on: noop, off: noop, id: selfId }}
            muted={false}
            setMuted={noop}
            statsOpen={false}
            setStatsOpen={noop}
            onLeaveRoom={noop}
          />
        );

      // ── Guru Admin ──
      case 'guru-playing':
        return (
          <AdminView
            room={room}
            player={player}
            roleInfo={roleInfo}
            logs={['[DEV] Game started', '[DEV] Andi answered correctly']}
            socket={{ emit: noop, on: noop, off: noop, id: 'guru' }}
            statsOpen={false}
            onToggleStats={noop}
            onPauseDebat={noop}
            onResetGame={noop}
            onRestart={noop}
            onTriggerTopicDebate={noopWithArg}
            onTriggerPresentation={noopWithArg}
            onEndPresentation={noop}
          />
        );

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
            taskLocked={activeScreen === 'warga-locked' ? true : false}
            sabotageQuiz={activeScreen === 'prov-sab-quiz' ? { question: MOCK_SABOTAGE_QUESTION, timer: 10 } : null}
            onSubmitSabotageQuiz={noopWithArg}
            duelCooldownRemaining={0}
            taskTimer={taskTimer}
            onSelectOption={noopWithArg}
            onSubmitQuiz={noop}
            onMinigameComplete={noopWithArg}
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

  // ── Determine which overlays to also show ──
  const showSabotageOverlay = activeScreen === 'warga-locked';
  const showDuelOverlay = false; // duel is its own screen
  const showDebateOverlay = false; // debate is its own screen

  return (
    <>
      <Head>
        <title>DEV Mode — TU-DUH! Pancasila</title>
      </Head>
      <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-[#13003a]' : 'bg-gray-100'}`}>

        {/* ── Dev Navbar ── */}
        <DevNavbar activeScreen={activeScreen} setActiveScreen={setActiveScreen} darkMode={darkMode} setDarkMode={setDarkMode} />

        {/* ── Screen info badge ── */}
        <div className="shrink-0 px-4 py-2 bg-[#ffc312] border-b-4 border-black flex items-center gap-3">
          <Eye size={14} className="text-[#3f2e00]" />
          <span className="font-mono text-[#3f2e00] text-xs font-bold uppercase tracking-wider">
            Preview: {screen?.group} → {screen?.label}
          </span>
          <span className="font-mono text-[#3f2e00] text-[10px]">
            (role: {roleInfo?.isGuru ? 'Guru' : roleInfo?.role || 'n/a'} | player: {player?.name || 'n/a'} | dead: {isPlayerDead ? 'Yes' : 'No'})
          </span>
        </div>

        {/* ── Main content ── */}
        <div className="flex-1 overflow-hidden relative" style={{ minHeight: 'calc(100vh - 100px)' }}>
          {renderContent()}

          {/* ── Overlay stacking for combined views ── */}
          {showSabotageOverlay && (
            <SabotageOverlay sabotage={room.sabotage} role={roleInfo.role} />
          )}
        </div>
      </div>
    </>
  );
}

// ── DEV NAVBAR ────────────────────────────────────────────────────────

function DevNavbar({ activeScreen, setActiveScreen, darkMode, setDarkMode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const grouped = {};
  SCREENS.forEach(s => {
    if (!grouped[s.group]) grouped[s.group] = [];
    grouped[s.group].push(s);
  });

  return (
    <div className="shrink-0 sticky top-0 z-[999]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#93000a] border-b-4 border-black">
        <div className="flex items-center gap-3">
          <Layers size={18} className="text-[#ffdad6]" />
          <span className="font-rubik italic text-[#ffdad6] text-lg font-bold">DEV MODE</span>
          <span className="neo-badge bg-[#ffc312] text-[#3f2e00] border-black text-[10px] py-0.5 px-2">STYLE PREVIEW</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(v => !v)}
            className="px-3 py-1.5 bg-[#270067] text-[#d3c5ab] border-2 border-black font-mono text-xs font-bold hover:bg-[#330081]"
          >
            {sidebarOpen ? '◀ Hide Nav' : '▶ Show Nav'}
          </button>
          <button
            onClick={() => setDarkMode(v => !v)}
            className="px-3 py-1.5 bg-[#270067] text-[#d3c5ab] border-2 border-black font-mono text-xs font-bold hover:bg-[#330081] flex items-center gap-1"
          >
            <Palette size={12} /> {darkMode ? 'Light BG' : 'Dark BG'}
          </button>
          <a href="/" className="px-3 py-1.5 bg-[#190047] text-[#9c8f78] border-2 border-black font-mono text-xs font-bold hover:bg-[#270067] flex items-center gap-1">
            <ArrowLeft size={12} /> Home
          </a>
        </div>
      </div>

      {/* Sidebar navigation */}
      {sidebarOpen && (
        <div className="flex gap-1 px-3 py-2 bg-[#190047] border-b-2 border-[#4f4632] overflow-x-auto">
          {GROUP_ORDER.map(group => (
            <div key={group} className="flex items-center gap-1 shrink-0">
              <span className="font-mono text-[#9c8f78] text-[10px] uppercase tracking-wider mr-1">{group}</span>
              {grouped[group]?.map(s => (
                <button
                  key={s.id}
                  onClick={() => setActiveScreen(s.id)}
                  className={`px-2 py-1 border-2 border-solid font-mono text-[10px] font-bold transition-all whitespace-nowrap ${
                    activeScreen === s.id
                      ? 'bg-[#ffc312] border-[#ffc312] text-[#3f2e00]'
                      : 'bg-[#22005c] border-[#4f4632] text-[#e9ddff] hover:border-[#ffc312] hover:text-white'
                  }`}
                >
                  {s.label}
                </button>
              ))}
              <span className="text-[#4f4632] mx-1">|</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
