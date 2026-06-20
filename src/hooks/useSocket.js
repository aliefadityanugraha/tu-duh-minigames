import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const router = useRouter();
  const [socket, setSocket]   = useState(null);
  const [room, setRoom]       = useState(null);
  const [player, setPlayer]   = useState(null);
  const [roleInfo, setRoleInfo] = useState({ role: null, isGuru: false });

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs]       = useState([]);

  // State task (kuis atau mini-game) & feedback
  const [currentTask, setCurrentTask]         = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null); // legacy alias
  const [feedback, setFeedback]                 = useState(null);
  const [isAnswered, setIsAnswered]             = useState(false);
  const [selectedOption, setSelectedOption]     = useState(null);

  // State sabotase
  const [sabotageFeedback, setSabotageFeedback] = useState('');
  // Soal math untuk Provokator (fase 1 sabotase)
  const [sabotageQuiz, setSabotageQuiz]         = useState(null);
  // Soal rescue untuk Warga terpilih (fase 2 sabotase)
  const [sabotageRescue, setSabotageRescue]     = useState(null);

  // State duel cooldown (sisa detik, hanya relevan untuk Provokator)
  const [duelCooldownRemaining, setDuelCooldownRemaining] = useState(0);

  // State presentasi (notifikasi ke pemain terpilih)
  const [presentationNotif, setPresentationNotif] = useState(null);

  // State debat topik
  const [topicDebateNotif, setTopicDebateNotif] = useState(null);

  // State task locked (Warga yang bukan target rescue)
  const [taskLocked, setTaskLocked] = useState(false);
  const [taskError, setTaskError] = useState(null);
  const [minigameRetryKey, setMinigameRetryKey] = useState(0);

  useEffect(() => {
    const s = io();
    setSocket(s);

    // ── Join ──
    s.on('join-success', ({ roomCode, player }) => {
      setPlayer(player);
      setRoleInfo({ role: player.role, isGuru: player.isGuru });
      setLoading(false);
      addLog(`Bergabung ke Room ${roomCode}.`);
    });
    s.on('join-error', (msg) => { setError(msg); setLoading(false); });

    // ── Room update ──
    s.on('room-updated', (updatedRoom) => {
      setRoom(updatedRoom);
      if (updatedRoom && s.id) {
        const self = updatedRoom.players.find(p => p.id === s.id);
        if (self) {
          setPlayer(self);
          // Pertahankan isGuru dari player data (tidak berubah sepanjang sesi)
          setRoleInfo(prev => ({
            ...prev,
            isGuru: self.isGuru,
          }));
          // Sync cooldown dari server
          if (self.duelCooldownEndsAt) {
            const rem = Math.max(0, Math.ceil((self.duelCooldownEndsAt - Date.now()) / 1000));
            setDuelCooldownRemaining(rem);
          } else {
            setDuelCooldownRemaining(0);
          }
        }
      }
    });

    // ── Peran ditetapkan ──
    s.on('role-assigned', ({ role, isGuru }) => {
      setRoleInfo({ role, isGuru });
      setCurrentTask(null); setCurrentQuestion(null);
      setFeedback(null); setIsAnswered(false); setSelectedOption(null);
      setTaskError(null); setMinigameRetryKey(0);
      setSabotageQuiz(null); setSabotageRescue(null);
      setTaskLocked(false);
      router.push('/game');
    });

    // ── Task delivery (kuis atau mini-game) ──
    const _applyTaskDelivery = (task) => {
      setCurrentTask(task);
      if (task.type === 'quiz') setCurrentQuestion(task.data);
      else setCurrentQuestion(null);
      setFeedback(null);
      setIsAnswered(false);
      setSelectedOption(null);
      setTaskError(null);
      setMinigameRetryKey(0);
    };

    s.on('next-task-delivery', (task) => {
      _applyTaskDelivery(task);
    });
    s.on('next-question-delivery', () => {
      // Legacy — delivery ditangani next-task-delivery; abaikan agar tidak timpa sessionId
    });

    const _applyTaskFeedback = (res) => {
      setFeedback(res);
      setIsAnswered(true);
      setTaskError(null);
    };
    s.on('task-feedback', _applyTaskFeedback);

    s.on('task-error', ({ message }) => {
      setTaskError(message);
      // Remount mini-game hanya jika session benar-benar invalid
      if (message.includes('tidak valid') || message.includes('kedaluwarsa')) {
        setMinigameRetryKey(k => k + 1);
      }
      addLog(`⚠️ ${message}`);
    });
    s.on('game-error', (msg) => {
      setError(msg);
      addLog(`⚠️ ${msg}`);
    });

    // ── Task locked (Warga non-target saat sabotase fase 2) ──
    s.on('task-locked', ({ message }) => {
      setTaskLocked(true);
      addLog(`🔒 ${message}`);
    });

    // ── Sabotase: soal math untuk Provokator (fase 1) ──
    s.on('sabotage-quiz-start', ({ question, timer, message }) => {
      setSabotageQuiz({ question, timer });
      addLog(`⚡ ${message}`);
    });
    s.on('sabotage-quiz-wrong', ({ question, timer }) => {
      setSabotageQuiz({ question, timer });
    });

    // ── Sabotase: soal rescue untuk Warga terpilih (fase 2) ──
    s.on('sabotage-rescue-assigned', ({ question, timer, message }) => {
      setSabotageRescue({ question, timer });
      setTaskLocked(false); // target rescue tidak terkunci
      addLog(`🆘 ${message}`);
    });
    s.on('sabotage-rescue-wrong', ({ question, timer }) => {
      setSabotageRescue({ question, timer });
    });

    // ── Sabotase events ──
    s.on('sabotage-triggered', ({ message, targetWargaName }) => {
      setTaskLocked(true); // default lock, akan di-override oleh rescue-assigned
      addLog(`🚨 SABOTASE: ${message}`);
      setSabotageFeedback('');
    });
    s.on('sabotage-resolved', ({ solvedBy, message }) => {
      setSabotageQuiz(null); setSabotageRescue(null);
      setSabotageFeedback(''); setTaskLocked(false);
      addLog(`✅ SABOTASE DIATASI: ${message}`);
    });
    s.on('sabotage-cancelled', ({ reason }) => {
      setSabotageQuiz(null); setSabotageRescue(null);
      setTaskLocked(false);
      addLog(`❌ Sabotase dibatalkan: ${reason}`);
    });
    s.on('sabotage-incorrect', ({ message }) => setSabotageFeedback(message));

    // ── Duel ──
    s.on('duel-triggered', ({ provocateur, citizen }) => {
      addLog(`⚔️ DUEL: ${provocateur} vs ${citizen}`);
    });
    s.on('duel-resolved', ({ winner, loser, reason }) => {
      addLog(`🏁 DUEL SELESAI: ${reason}`);
    });
    s.on('duel-answer-wrong', ({ message }) => {
      addLog(`❌ ${message}`);
    });
    s.on('duel-cooldown', ({ remaining, message }) => {
      setDuelCooldownRemaining(remaining);
      addLog(`⏳ ${message}`);
    });

    // ── Debat voting ──
    s.on('debate-triggered', ({ reason }) => addLog(`📢 RAPAT: ${reason}`));
    s.on('debate-ended', ({ eliminated, reason }) => {
      if (eliminated) addLog(`💀 ELIMINASI: ${eliminated.name} tereliminasi.`);
      addLog(`📢 HASIL SIDANG: ${reason}`);
    });

    // ── Debat topik ──
    s.on('topic-debate-triggered', ({ topic, timer }) => {
      setTopicDebateNotif({ topic, timer });
      addLog(`💬 DEBAT TOPIK: "${topic}"`);
    });
    s.on('topic-debate-ended', ({ message }) => {
      setTopicDebateNotif(null);
      addLog(`💬 ${message}`);
    });

    // ── Presentasi ──
    s.on('presentation-assigned', ({ message }) => {
      setPresentationNotif(message);
      addLog(`🎤 ${message}`);
    });
    s.on('presentation-triggered', ({ playerName }) => {
      addLog(`🎤 PRESENTASI: ${playerName} dipilih untuk presentasi!`);
    });
    s.on('presentation-ended', ({ message }) => {
      setPresentationNotif(null);
      addLog(`🎤 ${message}`);
    });

    // ── Game over / restart ──
    s.on('game-over', ({ winner, reason }) => {
      addLog(`🏆 GAME OVER! Pemenang: ${winner.toUpperCase()}. ${reason}`);
    });
    s.on('game-restarted', () => {
      addLog('🔄 Game di-restart ke lobi.');
      // Jangan reset roleInfo di sini — biarkan room-updated yang sync
      // roleInfo.isGuru harus tetap true agar WaitingRoom menampilkan tombol Guru
      setCurrentTask(null); setCurrentQuestion(null); setFeedback(null);
      setIsAnswered(false); setSelectedOption(null);
      setTaskError(null); setMinigameRetryKey(0);
      setSabotageQuiz(null); setSabotageRescue(null);
      setTaskLocked(false); setPresentationNotif(null);
      setTopicDebateNotif(null); setDuelCooldownRemaining(0);
      router.push('/');
    });

    s.on('player-left', ({ name }) => addLog(`🚪 ${name} terputus dari room.`));

    return () => s.disconnect();
  }, []);

  // Countdown cooldown duel di sisi client (sinkronisasi dengan server)
  useEffect(() => {
    if (duelCooldownRemaining <= 0) return;
    const t = setInterval(() => {
      setDuelCooldownRemaining(prev => {
        if (prev <= 1) { clearInterval(t); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [duelCooldownRemaining]);

  const addLog = (text) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${text}`, ...prev.slice(0, 30)]);
  };

  const getSessionId = () => {
    if (typeof window === 'undefined') return null;
    let sid = sessionStorage.getItem('among_us_session');
    if (!sid) {
      sid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('among_us_session', sid);
    }
    return sid;
  };

  const joinRoom = (roomCode, name, isGuru) => {
    setError(''); setLoading(true);
    const sessionId = getSessionId();
    if (socket) socket.emit('join-room', { roomCode, name, isGuru, sessionId });
  };

  const startGame = () => { if (socket) socket.emit('start-game'); };

  const sendDebateChat = (message) => {
    if (socket) socket.emit('send-debate-chat', { message });
  };

  const changeSkin = (skinId) => {
    if (socket) socket.emit('change-skin', { skinId });
  };

  return (
    <SocketContext.Provider value={{
      socket, room, player, roleInfo,
      error, setError, loading, setLoading,
      logs, joinRoom, startGame,
      // soal & task
      currentTask, currentQuestion, feedback, isAnswered, selectedOption,
      setCurrentTask, setSelectedOption, setIsAnswered, setFeedback,
      taskError, setTaskError, minigameRetryKey,
      // sabotase
      sabotageFeedback, setSabotageFeedback,
      sabotageQuiz, setSabotageQuiz,
      sabotageRescue, setSabotageRescue,
      taskLocked,
      // duel
      duelCooldownRemaining,
      // presentasi & debat topik
      presentationNotif, setPresentationNotif,
      topicDebateNotif,
      // debat
      sendDebateChat,
      // skin
      changeSkin,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
