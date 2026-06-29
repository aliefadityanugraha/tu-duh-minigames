const { rooms } = require('../server/lib/roomHelpers');
const { checkWinConditions, tallyVotes } = require('../server/lib/gameLogic');

// ── Helper ──
function createMockIo() {
  const emitted = [];
  const io = (event, data) => { emitted.push([event, data]); return io; };
  io.to = () => io;
  io.emit = (event, data) => { emitted.push([event, data]); return io; };
  io.sockets = { sockets: { get: () => null } };
  io._emitted = emitted;
  return io;
}

function makePlayer(id, { role, isGuru = false, isDead = false, isOnline = true, name } = {}) {
  return { id, name: name || `Player${id}`, role, isGuru, isDead, isOnline, score: 0 };
}

const ROOM_CODE = 'TESTRM';

beforeEach(() => {
  // Bersihkan semua room
  for (const key of Object.keys(rooms)) delete rooms[key];
});

describe('checkWinConditions', () => {
  test('provokator wins when all citizens eliminated', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players: [
        makePlayer('p1', { role: 'provokator', name: 'Prov1' }),
        makePlayer('p2', { role: 'warga', isDead: true, name: 'DeadCit' }),
      ],
      tasksCompleted: 0, tasksRequired: 5,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].state).toBe('ended');
    expect(rooms[ROOM_CODE].winner).toBe('provokator');
    const events = io._emitted.filter(e => e[0] === 'game-over');
    expect(events.length).toBe(1);
    expect(events[0][1].winner).toBe('provokator');
  });

  test('provokator wins when citizens <= provocateurs (parity)', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players: [
        makePlayer('p1', { role: 'provokator', name: 'Prov1' }),
        makePlayer('p2', { role: 'provokator', name: 'Prov2' }),
        makePlayer('p3', { role: 'warga', name: 'Cit1' }),
        makePlayer('p4', { role: 'warga', name: 'Cit2' }),
      ],
      tasksCompleted: 0, tasksRequired: 5,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].state).toBe('ended');
    expect(rooms[ROOM_CODE].winner).toBe('provokator');
  });

  test('provokator wins when parity with 2 citizens vs 2 provocateurs', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players: [
        makePlayer('p1', { role: 'provokator', name: 'Prov1' }),
        makePlayer('p2', { role: 'provokator', name: 'Prov2' }),
        makePlayer('p3', { role: 'warga', name: 'Cit1' }),
        makePlayer('p4', { role: 'warga', name: 'Cit2' }),
      ],
      tasksCompleted: 0, tasksRequired: 5,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].winner).toBe('provokator');
  });

  test('provokator does NOT win when citizens > provocateurs', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players: [
        makePlayer('p1', { role: 'provokator', name: 'Prov1' }),
        makePlayer('p2', { role: 'warga', name: 'Cit1' }),
        makePlayer('p3', { role: 'warga', name: 'Cit2' }),
        makePlayer('p4', { role: 'warga', name: 'Cit3' }),
      ],
      tasksCompleted: 0, tasksRequired: 5,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].state).toBe('playing');
  });

  test('warga wins when all provocateurs eliminated', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players: [
        makePlayer('p1', { role: 'provokator', isDead: true, name: 'DeadProv' }),
        makePlayer('p2', { role: 'warga', name: 'Cit1' }),
        makePlayer('p3', { role: 'warga', name: 'Cit2' }),
      ],
      tasksCompleted: 0, tasksRequired: 5,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].state).toBe('ended');
    expect(rooms[ROOM_CODE].winner).toBe('warga');
  });

  test('warga wins when all tasks completed', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players: [
        makePlayer('p1', { role: 'provokator', name: 'Prov1' }),
        makePlayer('p2', { role: 'warga', name: 'Cit1' }),
        makePlayer('p3', { role: 'warga', name: 'Cit2' }),
      ],
      tasksCompleted: 10, tasksRequired: 10,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].state).toBe('ended');
    expect(rooms[ROOM_CODE].winner).toBe('warga');
  });

  test('does nothing when room does not exist', () => {
    const io = createMockIo();
    expect(() => checkWinConditions('NONEXIST', io)).not.toThrow();
    expect(io._emitted.filter(e => e[0] === 'game-over').length).toBe(0);
  });

  test('does nothing when state is not playing', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'lobby',
      players: [],
      tasksCompleted: 0, tasksRequired: 0,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].state).toBe('lobby');
  });

  test('does not end game twice (state already ended)', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'ended',
      players: [
        makePlayer('p1', { role: 'warga', name: 'Cit1' }),
      ],
      tasksCompleted: 0, tasksRequired: 5,
    };
    const io = createMockIo();
    checkWinConditions(ROOM_CODE, io);
    // Should not emit game-over again
    expect(io._emitted.filter(e => e[0] === 'game-over').length).toBe(0);
  });
});

describe('tallyVotes', () => {
  function setupDebateRoom(players, votes) {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players,
      debate: { active: true, votes, chat: [] },
      gameStats: { playersEliminated: 0, eventLog: [] },
    };
  }

  test('eliminates player with majority votes', () => {
    const players = [
      makePlayer('p1', { role: 'warga', name: 'Alice' }),
      makePlayer('p2', { role: 'warga', name: 'Bob' }),
      makePlayer('p3', { role: 'provokator', name: 'Charlie' }),
    ];
    setupDebateRoom(players, { p1: 'p3', p2: 'p3' });
    const io = createMockIo();
    tallyVotes(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].players.find(p => p.id === 'p3').isDead).toBe(true);
    expect(rooms[ROOM_CODE].debate.active).toBe(false);
    const ended = io._emitted.find(e => e[0] === 'debate-ended');
    expect(ended[1].eliminated.name).toBe('Charlie');
  });

  test('no elimination when skip has most votes', () => {
    const players = [
      makePlayer('p1', { role: 'warga', name: 'Alice' }),
      makePlayer('p2', { role: 'warga', name: 'Bob' }),
      makePlayer('p3', { role: 'warga', name: 'Charlie' }),
    ];
    setupDebateRoom(players, { p1: 'p3', p2: 'skip', p3: 'skip' });
    const io = createMockIo();
    tallyVotes(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].players.every(p => !p.isDead)).toBe(true);
    const ended = io._emitted.find(e => e[0] === 'debate-ended');
    expect(ended[1].eliminated).toBeNull();
    expect(ended[1].reason).toContain('Skip');
  });

  test('no elimination on tie', () => {
    const players = [
      makePlayer('p1', { role: 'warga', name: 'Alice' }),
      makePlayer('p2', { role: 'warga', name: 'Bob' }),
      makePlayer('p3', { role: 'provokator', name: 'Charlie' }),
      makePlayer('p4', { role: 'warga', name: 'Diana' }),
    ];
    setupDebateRoom(players, { p1: 'p3', p2: 'p4', p3: 'p3', p4: 'p4' });
    const io = createMockIo();
    tallyVotes(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].players.every(p => !p.isDead)).toBe(true);
    const ended = io._emitted.find(e => e[0] === 'debate-ended');
    expect(ended[1].eliminated).toBeNull();
    expect(ended[1].reason).toContain('seri');
  });

  test('no elimination when votes below majority threshold', () => {
    const players = [
      makePlayer('p1', { role: 'warga', name: 'Alice' }),
      makePlayer('p2', { role: 'warga', name: 'Bob' }),
      makePlayer('p3', { role: 'warga', name: 'Charlie' }),
      makePlayer('p4', { role: 'warga', name: 'Diana' }),
      makePlayer('p5', { role: 'warga', name: 'Eve' }),
    ];
    // Majority threshold = ceil(5/2) = 3. Highest is 2 votes (p3), no tie, no skip.
    setupDebateRoom(players, { p1: 'p3', p2: 'p3', p3: 'p4', p4: 'p5' });
    const io = createMockIo();
    tallyVotes(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].players.every(p => !p.isDead)).toBe(true);
    const ended = io._emitted.find(e => e[0] === 'debate-ended');
    expect(ended[1].eliminated).toBeNull();
    expect(ended[1].reason).toContain('tidak mencapai mayoritas');
  });

  test('no elimination when no votes cast', () => {
    const players = [
      makePlayer('p1', { role: 'warga', name: 'Alice' }),
      makePlayer('p2', { role: 'warga', name: 'Bob' }),
    ];
    setupDebateRoom(players, {});
    const io = createMockIo();
    tallyVotes(ROOM_CODE, io);
    expect(rooms[ROOM_CODE].players.every(p => !p.isDead)).toBe(true);
    const ended = io._emitted.find(e => e[0] === 'debate-ended');
    expect(ended[1].eliminated).toBeNull();
  });

  test('does nothing when debate is not active', () => {
    rooms[ROOM_CODE] = {
      code: ROOM_CODE, state: 'playing',
      players: [makePlayer('p1', { role: 'warga', name: 'Alice' })],
      debate: { active: false },
    };
    const io = createMockIo();
    tallyVotes(ROOM_CODE, io);
    expect(io._emitted.filter(e => e[0] === 'debate-ended').length).toBe(0);
  });

  test('does nothing when room does not exist', () => {
    const io = createMockIo();
    expect(() => tallyVotes('NONEXIST', io)).not.toThrow();
  });
});
