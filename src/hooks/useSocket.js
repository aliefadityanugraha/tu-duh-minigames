import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { io } from 'socket.io-client';
import { INITIAL_SKINS } from '../components/lobby/WaitingRoom';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const router = useRouter();
  const [socket, setSocket]   = useState(null);
  const [room, setRoom]       = useState(null);
  const [player, setPlayer]   = useState(null);
  const [roleInfo, setRoleInfo] = useState({ role: null, isGuru: false, teammates: [] });

  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const [logs, setLogs]       = useState([]);

  // State task (kuis atau mini-game) & feedback
  const [currentTask, setCurrentTask]         = useState(null);
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

  const [skinList, setSkinList] = useState(INITIAL_SKINS);
  
  // Sinkronisasi skin list dari server
  useEffect(() => {
    if (socket) {
      socket.on('skin-list-updated', (newList) => {
        setSkinList(newList);
      });
      // Ambil initial list jika perlu
      socket.emit('get-skin-list');
    }
  }, [socket]);

  // State audio
  const [audio, setAudio] = useState(null);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef(null);
  const isMutedRef = useRef(false);

  // Keep isMutedRef in sync with isMuted state
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  // State debat topik
  const [topicDebateNotif, setTopicDebateNotif] = useState(null);

  // State task locked (Warga yang bukan target rescue)
  const [taskLocked, setTaskLocked] = useState(false);
  const [taskError, setTaskError] = useState(null);
  const [minigameRetryKey, setMinigameRetryKey] = useState(0);
  const [taskTimer, setTaskTimer] = useState(null);

  useEffect(() => {
    const s = io({
      // Reconnect otomatis dengan exponential backoff
      reconnection:        true,
      reconnectionAttempts: Infinity,
      reconnectionDelay:   1000,
      reconnectionDelayMax: 10000,
      timeout:             60000, // Tingkatkan dari 20s ke 60s untuk koneksi idle
      // Mulai dengan polling lalu upgrade ke websocket (lebih stabil di idle)
      transports: ['websocket', 'polling'],
      // Konfigurasi ping/pong sinkron dengan server
      pingInterval: 30000,
      pingTimeout:  120000,
    });
    setSocket(s);

    // ── Koneksi / reconnect ──
    s.on('connect', () => {
      console.log('[Socket] Terhubung:', s.id);
      // Auto re-join setelah reconnect (socket.id baru)
      if (typeof window === 'undefined') return;
      const saved = _loadSession();
      if (saved?.roomCode && saved?.name && saved?.sessionId) {
        console.log('[Socket] Auto re-join room:', saved.roomCode);
        s.emit('join-room', {
          roomCode:  saved.roomCode,
          name:      saved.name,
          isGuru:    saved.isGuru ?? false,
          sessionId: saved.sessionId,
        });
      }
    });

    s.on('disconnect', (reason) => {
      console.log('[Socket] Terputus:', reason);
      // Jika server yang memutuskan, Socket.io akan reconnect otomatis
      if (reason === 'io server disconnect') {
        // Server memutus koneksi — reconnect otomatis
        s.connect();
      }
    });

    s.on('reconnect', (attempt) => {
      console.log('[Socket] Reconnected setelah', attempt, 'percobaan');
    });

    s.on('reconnect_failed', () => {
      console.warn('[Socket] Reconnect gagal. Mencoba lagi...');
    });

    s.on('reconnect_error', (err) => {
      console.warn('[Socket] Reconnect error:', err.message);
    });

    s.on('reconnect_attempt', () => {
      console.log('[Socket] Mencoba reconnect...');
    });

    // Handle jika room sudah dihapus server saat idle / error join
    s.on('join-error', (msg) => {
      if (msg.includes('tidak ditemukan')) {
        console.warn('[Socket] Room sudah tidak ada, mungkin sudah dihapus karena idle.');
        if (typeof window !== 'undefined') {
          _clearSession();
        }
      }
      setError(msg);
      setLoading(false);
    });

    // ── Join ──
    s.on('join-success', ({ roomCode, player }) => {
      setPlayer(player);
      setRoleInfo({ role: player.role, isGuru: player.isGuru, teammates: player.teammates || [] });
      setLoading(false);
      addLog(`Bergabung ke Room ${roomCode}.`);
      // Simpan session untuk auto re-join jika koneksi terputus
      const sessionId = getSessionId();
      _saveSession({ roomCode, name: player.name, isGuru: player.isGuru, sessionId });
    });

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
    s.on('role-assigned', ({ role, isGuru, teammates }) => {
      setRoleInfo({ role, isGuru, teammates: teammates || [] });
      setCurrentTask(null); setCurrentQuestion(null);
      setFeedback(null); setIsAnswered(false); setSelectedOption(null);
      setTaskError(null); setMinigameRetryKey(0);
      setSabotageQuiz(null); setSabotageRescue(null);
      setTaskLocked(false);

      // Play backsound on game start
      const newAudio = new Audio('/sounds/bg-game.mp3');
      newAudio.loop = true;
      newAudio.muted = isMutedRef.current;
      newAudio.play().catch(e => console.log('Autoplay blocked:', e));
      audioRef.current = newAudio;
      setAudio(newAudio);

      router.push('/game');
    });

    // ── Task delivery (kuis atau mini-game) ──
    const _applyTaskDelivery = (task) => {
      setCurrentTask(task);
      setFeedback(null);
      setIsAnswered(false);
      setSelectedOption(null);
      setTaskError(null);
      setMinigameRetryKey(0);
      setTaskTimer(task.timer ?? 15);
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

    s.on('kicked-by-guru', (msg) => {
      alert(msg);
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('among_us_room_session');
        window.location.href = '/';
      }
    });

    // ── Task locked (Warga non-target saat sabotase fase 2) ──
    s.on('task-locked', ({ message }) => {
      setTaskLocked(true);
      addLog(`🔒 ${message}`);
    });

    // ── Task timer countdown (server pushes per-second) ──
    s.on('task-timer-update', ({ sessionId, timer }) => {
      setTaskTimer(timer);
    });

    // ── Task timeout (auto-skip after 15s) ──
    s.on('task-timeout', ({ sessionId, message }) => {
      setCurrentTask(null);
      setFeedback(null);
      setIsAnswered(false);
      setSelectedOption(null);
      setTaskTimer(null);
      setTaskError(null);
      addLog(`⏱️ ${message}`);
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
      if (winner || loser) {
        addLog(`🏁 DUEL SELESAI: ${reason}`);
      } else {
        addLog(`🏁 ${reason}`);
      }
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
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
      setAudio(null);
      // Jangan reset roleInfo di sini — biarkan room-updated yang sync
      setCurrentTask(null); setFeedback(null);
      setIsAnswered(false); setSelectedOption(null);
      setTaskError(null); setMinigameRetryKey(0);
      setSabotageQuiz(null); setSabotageRescue(null);
      setTaskLocked(false); setPresentationNotif(null);
      setTopicDebateNotif(null); setDuelCooldownRemaining(0);
      // Update session: room code tetap, tapi hapus data game
      _clearSession();
      router.push('/');
    });

    s.on('player-left', ({ name }) => addLog(`🚪 ${name} terputus dari room.`));

    return () => {
      s.disconnect();
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    };
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

  // ── Session persistence untuk auto re-join ──
  const _loadSession = () => {
    if (typeof window === 'undefined') return null;
    const data = sessionStorage.getItem('among_us_room_session');
    return data ? JSON.parse(data) : null;
  };

  const _saveSession = ({ roomCode, name, isGuru, sessionId }) => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('among_us_room_session', JSON.stringify({ roomCode, name, isGuru, sessionId }));
  };

  const _clearSession = () => {
    if (typeof window === 'undefined') return;
    sessionStorage.removeItem('among_us_room_session');
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

  const uploadCustomSkin = (skinUrl) => {
    if (socket) socket.emit('add-custom-skin', { skinUrl });
  };

  const leaveRoom = () => {
    if (socket) {
      socket.emit('leave-room');
      socket.disconnect();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setAudio(null);
    _clearSession();
    setRoom(null);
    setPlayer(null);
    setRoleInfo({ role: null, isGuru: false, teammates: [] });
    setCurrentTask(null);
    setFeedback(null);
    setIsAnswered(false);
    setSelectedOption(null);
    setTaskError(null);
    setSabotageQuiz(null);
    setSabotageRescue(null);
    setTaskLocked(false);
    setDuelCooldownRemaining(0);
    setPresentationNotif(null);
    setTopicDebateNotif(null);
  };

  return (
    <SocketContext.Provider value={{
      socket, room, player, roleInfo,
      error, setError, loading, setLoading,
      logs, joinRoom, startGame, leaveRoom,
      // soal & task
      currentTask, feedback, isAnswered, selectedOption,
      setCurrentTask, setSelectedOption, setIsAnswered, setFeedback,
      taskError, setTaskError, minigameRetryKey,
      taskTimer,
      // audio
      isMuted, toggleMute: () => {
        if (audioRef.current) {
          audioRef.current.muted = !audioRef.current.muted;
        }
        setIsMuted(prev => !prev);
      },
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
      uploadCustomSkin,
      skinList,
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
