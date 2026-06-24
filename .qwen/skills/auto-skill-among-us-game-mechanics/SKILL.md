---
name: among-us-game-mechanics
description: Patterns for implementing Among Us-style game mechanics: private notifications, role-specific task flows, cross-role cooldowns, and dual-path role abilities in a Socket.io + Next.js multiplayer game.
source: auto-skill
extracted_at: '2026-06-23T13:46:08.412Z'
---

# Among Us Pancasila — Game Mechanics Implementation Patterns

## Architecture Overview
- **Server**: Express + Socket.io (`server/handlers/gameHandler.js`, `server/lib/gameLogic.js`, `server/lib/roomHelpers.js`)
- **Client**: Next.js + React (`src/pages/game.js`, `src/hooks/useSocket.js`, `src/components/panels/`, `src/components/overlays/`)
- **State sync**: Server broadcasts `room-updated` (sanitized room state) every second via ticker + on every state change. Client keeps a single `room` React state that drives all rendering.

## Key Patterns

### 1. Private (Role-Scoped) Notifications
**Problem**: Broadcast notifications (`io.to(code).emit(...)`) reveal game events to all players, breaking privacy for mechanics like duels.

**Solution**: Send event to specific participants only, then broadcast `room-updated` to all:
```js
// Private event to participants only
io.to(provId).emit('duel-triggered', payload);
io.to(citId).emit('duel-triggered', payload);
// General state update to all (no duel-triggered broadcast)
io.to(code).emit('room-updated', getSanitizedRoom(code));
```

**Client-side gating**: Even though `room.duel` data reaches all clients via `room-updated`, the overlay must check participant identity:
```jsx
{room.duel?.active &&
  (player?.name === room.duel?.provocateur || player?.name === room.duel?.citizen) && (
  <DuelOverlay ... />
)}
```
This prevents non-participants from seeing private overlays while still allowing the room state to be consistent.

**Also applies to**: `duel-resolved`, `duel-answer-wrong` — all duel lifecycle events must be scoped to participants. Don't forget the ticker timeout path in `gameLogic.js` must also send privately.

### 2. Role-Specific Task Delivery
**Problem**: A role (e.g., provocateur) needs to answer quiz questions like the citizen role, but with different effects on game state.

**Solution**: Extend existing task handlers to accept multiple roles, with conditional logic:
```js
// In _deliverNextTask: allow multiple roles
if (!player || player.isDead || (player.role !== 'warga' && player.role !== 'provokator')) return;

// Force quiz-only for provocateur (no minigames)
const quizRatio = player.role === 'provokator' ? 1 : (minigameOn ? (s.quizRatio ?? 0.4) : 1);
```

In the answer handler, flip the effect based on role:
```js
if (isCorrect) {
  player.score++;
  if (player.role === 'provokator') {
    room.tasksCompleted--;  // Decreases warga progress
  } else {
    room.tasksCompleted++;  // Normal warga behavior
  }
}
```

**Client wiring**: Add task-related props to the role panel component and pass them through `PlayerView.js` → `ProvokateurPanel.js`. Include `TaskContainer` component inside the panel. The `game.js` useEffect for requesting initial tasks must include the new role:
```js
if (roleInfo.role === 'warga' || roleInfo.role === 'provokator') {
  socket.emit('get-next-task');
}
```

### 3. Multi-Tier Cooldown System
**Problem**: Different situations need different cooldown durations for the same ability.

**Solution**: Use multiple cooldown constants and apply them at different trigger points:
```js
const DUEL_COOLDOWN_MS = 30_000;          // After duel ends (resolved)
const DUEL_WRONG_ANSWER_COOLDOWN_MS = 10_000; // After wrong answer during duel
```

Apply contextually:
- **Wrong answer during duel**: `player.duelCooldownEndsAt = Date.now() + DUEL_WRONG_ANSWER_COOLDOWN_MS`
- **After duel resolution**: `provPlayer.duelCooldownEndsAt = Date.now() + DUEL_COOLDOWN_MS`

The cooldown is stored as `duelCooldownEndsAt` (absolute timestamp) on the player object, exposed via `getSanitizedRoom`, and synced on the client via `useSocket.js` with a local countdown interval.

### 4. Sanitized Room State Pattern
The `getSanitizedRoom(roomCode)` function in `roomHelpers.js` strips sensitive data (answer keys, secret roles until game ends) before sending to clients. All game state changes emit this sanitized version via `room-updated`.

**Important**: When making events private (like duels), don't try to per-player-filter `getSanitizedRoom` — it's called in ~15+ places. Instead, gate the UI rendering on the client side using participant checks, and scope only the *event* notifications (duel-triggered, duel-resolved) to participants via `io.to(playerId).emit()`. The room state can still contain duel data for everyone since the overlay is gated.

### 5. Event Flow for State Consistency
- Server state change → `io.to(code).emit('room-updated', getSanitizedRoom(code))` (always)
- Private events → `io.to(specificPlayerId).emit(...)` (in addition to room-updated)
- Client `useSocket.js` processes both; `room-updated` overwrites full room state, private events update specific state (sabotageQuiz, sabotageRescue, cooldown)
- Ticker in `gameLogic.js` runs every 1s, managing timers for sabotage, duel, debate, topicDebate, and game timer

### 6. Key File Responsibilities
| File | Role |
|------|------|
| `server/handlers/gameHandler.js` | All socket event handlers: start, tasks, sabotage, duel, debate, vote, presentation |
| `server/lib/gameLogic.js` | Win conditions, vote tally, 1-second room ticker (timers) |
| `server/lib/roomHelpers.js` | Room storage, `getSanitizedRoom()` (strips secrets), vote summary |
| `src/hooks/useSocket.js` | Socket context provider: all event listeners, state management, session persistence |
| `src/pages/game.js` | Wires all handlers, renders overlays conditionally |
| `src/components/game/PlayerView.js` | Renders role-specific panel (WargaPanel or ProvokateurPanel) |
| `src/components/panels/` | Role panels with task/action UI |

### 7. Per-Task Timer System (15-Second Countdown)
**Problem**: Each quiz/minigame mission needs a time limit — correct before timeout = next task, wrong before timeout = next task, timeout = auto-skip with no score.

**Solution**: Three-part system:

**Server — timer field + ticker countdown**:
```js
const TASK_TIMEOUT = 15;
// In _deliverNextTask:
room.activeTaskSessions[socket.id] = { sessionId, type, issuedAt, timer: TASK_TIMEOUT };
payload = { type, sessionId, timer: TASK_TIMEOUT, data: {...} };

// In gameLogic.js ticker (new section 6):
if (r.activeTaskSessions && r.state === 'playing') {
  const timerPaused = r.sabotage?.active || r.duel?.active || r.debate?.active || r.topicDebate?.active;
  if (!timerPaused) {
    for (const [socketId, session] of Object.entries(r.activeTaskSessions)) {
      if (session.timer != null && session.timer > 0) {
        session.timer--;
        io.to(socketId).emit('task-timer-update', { sessionId: session.sessionId, timer: session.timer });
        if (session.timer <= 0) {
          // Timeout — auto-skip, no score
          delete r.activeTaskSessions[socketId];
          io.to(socketId).emit('task-timeout', { sessionId: session.sessionId, message: '...' });
        }
      }
    }
  }
}
```

**Client — taskTimer state + prop chain**:
- `useSocket.js`: `taskTimer` state, `task-timer-update` listener → update state, `task-timeout` listener → clear task state + auto-request next task via useEffect
- Prop chain: `game.js` → `PlayerView.js` → `WargaPanel.js`/`ProvokateurPanel.js` → `TaskContainer.js`
- `TaskContainer.js`: quiz shows full timer banner (`⏱️ WAKTU MISI`), minigame shows badge in header + small indicator

**Timer pauses during**: sabotage, duel, debate, topicDebate (checked via `timerPaused` flag in ticker).

### 8. Voting/Elimination Mechanics
**Trigger paths**: (1) Guru `teacher-pause` event, (2) Emergency meeting after Warga loses a duel (Provokator duel-loss does NOT trigger debate).

**Flow**: Debate starts with `room.debate = { active: true, timer: 90, votes: {} }` → players vote via `vote-player` → tally triggered on timer expiry OR all-living-voted → `tallyVotes()` → elimination or no-action.

**Tally rules** (majority of living players required):
- `skipVotes >= highestVotes` → nobody eliminated
- Tie between players → nobody eliminated
- Single plurality winner WITH `highestVotes >= Math.ceil(living/2)` → **eliminated** (majority rule)
- Single plurality winner WITHOUT majority → nobody eliminated ("Suara tidak mencapai mayoritas")
- No votes → nobody eliminated

**Elimination**: `target.isDead = true` — player cannot vote, do tasks, trigger sabotage/duel, or chat. Role is revealed to all via `debate-ended` event. `checkWinConditions` called after.

**Vote privacy**: During active debate, `getSanitizedRoom` only reveals **who voted** (keys of votes map), not **what they voted for**. Full vote summary sent after tally via `getVoteSummary()`.

**Server-side vote validation** (all fixed 2026-06-24):
- Vote-lock: `room.debate.votes[voter.id] != null` → reject if already voted (prevents overwrite)
- Self-vote: `targetPlayerId === voter.id` → reject (cannot vote for yourself)
- Target validation: target must be alive, non-Guru, and exist in room — reject otherwise
- Client: self card shows "CANNOT VOTE SELF" label instead of vote button; `isSelf` added to disabled condition

### 9. Common Pitfalls
- **Don't forget the ticker**: When making events private, the `gameLogic.js` ticker timeout path must also send privately (not broadcast).
- **Room-updated is all-powerful**: It overwrites client room state entirely. Any per-player state that shouldn't be visible must be gated in client rendering, not in `getSanitizedRoom`.
- **Cooldown stacking**: If a wrong-answer cooldown (10s) and a post-duel cooldown (30s) both apply, they stack naturally since both write to `duelCooldownEndsAt`. The longer one wins if applied later.
- **Task session management**: `activeTaskSessions` tracks per-socket sessions. Must be cleaned up (`delete room.activeTaskSessions[socket.id]`) in both `_handleTaskAnswer` and after minigame completion.
- **Role extensions**: When extending a handler to accept a new role, check ALL paths — `_deliverNextTask`, `submit-task`, `submit-answer`, and the client-side useEffect that requests tasks.

### 8. Fixed Bug Patterns — Re-introduction Guards

These bugs were found and **all fixed** on 2026-06-24. When modifying related code, use this checklist to prevent re-introduction:

#### 🔴 Critical — Re-introduction would break the game

**A. Negative task counter → use `Math.max(0, ...)` ✅ FIXED**
- Provokator correct answers now use `room.tasksCompleted = Math.max(0, room.tasksCompleted - 1)` instead of `room.tasksCompleted--`.
- **Guard**: Any code that decrements `tasksCompleted` must use `Math.max(0, ...)` floor. The win condition `tasksCompleted >= tasksRequired` breaks if the counter goes negative.

**B. Ghost players → logout must emit leave-room ✅ FIXED**
- `GameHeader.js` logout now calls `onLeaveRoom()` (emits `leave-room` + disconnects socket + clears session + resets state). Server has a `leave-room` handler that always removes the player (even during `playing` state), resolves duels/debates, and checks win conditions.
- **Guard**: Any navigation away from the game page must call `leaveRoom()` first. Never use bare `router.push('/')`.

**C. Room code collision → loop until unique ✅ FIXED**
- `generateRoomCode()` now uses `do...while (rooms[code] && attempts < 100)` to ensure uniqueness.
- **Guard**: Any code that generates room codes must check against existing rooms.

#### 🟡 Important — Re-introduction would cause UX/logic issues

**D. Hardcoded timer max values → use dynamic maxTimer ✅ FIXED**
- Server sends `sabotage.maxTimer` in `getSanitizedRoom`. Both `SabotageOverlay` and `SabotageRescueOverlay` now use `maxTimer` prop/dynamic value with `Math.min(100, Math.max(0, ...))` clamp instead of hardcoded 40.
- **Guard**: Any timer progress bar must use the configured max, not a hardcoded constant.

**E. Duel cooldown progress bar → still uses hardcoded 30**
- `ProvokateurPanel.js` still divides by 30 for the cooldown bar. This is the remaining unfixed item — acceptable since `DUEL_COOLDOWN_MS` is server-constant (30s) and unlikely to change, but note it.

**F. `_saveSession` includes sessionId → auto re-join works ✅ FIXED**
- `_saveSession` now accepts and saves `sessionId`. `join-success` handler calls `getSessionId()` and passes it.
- **Guard**: If session persistence logic changes, ensure `sessionId` is always saved.

**G. Single join-error handler ✅ FIXED**
- Merged into one handler with combined logic (room-not-found cleanup + error display).
- **Guard**: Don't register duplicate listeners for the same event.

**H. Vote state derived from server ✅ FIXED**
- `DebateOverlay.js` derives `hasVoted`/`votedFor` from `debate.votes` server data instead of local state. No double-vote UI on remount.
- **Guard**: Vote-related state must always be derived from server data, not local useState.

**I. Task retry guarded by `isAnswered` ✅ FIXED**
- `TaskContainer.js` `handleRetryError` now checks `!isAnswered` before retrying. Server already deduplicates via `activeTaskSessions` check.
- **Guard**: Any retry path must check whether the server has already confirmed before re-sending.

**K. Vote dots hidden during active voting ✅ FIXED**
- `getDotsForPlayer` returns `false` when `debate.active` — dots only shown after tally.
- **Guard**: Don't reveal voting participation data during active social deduction phases.

**L. Voting — server-side validation + vote-lock + self-vote + majority threshold ✅ FIXED**
- Server `vote-player` handler now validates: target must be alive & non-Guru & exist in room; voter cannot vote for themselves; vote is locked once cast (reject overwrites). Client DebateOverlay hides self-vote button (shows "CANNOT VOTE SELF" label).
- Tally now requires `highestVotes >= Math.ceil(living/2)` (majority of living players) for elimination. Below threshold → "Suara tidak mencapai mayoritas" message, nobody eliminated.
- **Guard**: Any vote handler must validate the target (alive, present, non-Guru, not self) server-side — never trust the client. Always lock votes after recording. Elimination must require majority, not just plurality, to prevent 1-vote eliminations.

**M. Components outside render body ✅ FIXED**
- `SliderRow` and `MySkinButton` moved outside `WaitingRoom` function body, receiving `isGuru`, `onUpdate`, `mySkin`, `onClick` as props.
- **Guard**: Never define React components inside another component's render body — causes remount churn and lost state.

#### 🟢 Minor — Fixed cosmetic/edge cases

**J. GuruPanel cooldown shows remaining seconds ✅ FIXED**
- Now displays `⏳ CD DUEL {remaining}s` with `Math.max(0, ...)` — more informative even with slight clock skew.

**N. Inline error message instead of blocking `alert()` ✅ FIXED**
- `UrutanMufakat.js` uses `errorMsg` state + styled red banner instead of `alert()`. `shuffleArray` has safety limit of 100 attempts.
- **Guard**: Never use `alert()` in game UI — it blocks the thread.

**O. `selfRank` returns `null` when selfId not found ✅ FIXED**
- `CollapsibleScoreboard.js` now shows `#—` instead of `#0` when selfId is missing.
- **Guard**: `findIndex` returns -1; always guard against it.

**P. Server-side input validation ✅ FIXED**
- Chat messages: sanitized & capped at 200 chars. Topic input: capped at 150 chars. Player names: server validates 2–12 chars. Client `maxLength` added on GuruPanel topic input.
- **Guard**: All user-provided text must be sanitized and length-limited on the server side, not just the client.

**Q. Lost `{condition && (` JSX wrapper ✅ FIXED**
- When adding a timer banner inside an existing `if (isQuiz)` return block that already had `{taskError && (...)}`, the `{taskError && (` wrapper was lost during edits, leaving a stray `)}` closing bracket that broke JSX parsing. The `<div>` for taskError was rendered unconditionally instead of gated by `taskError`.
- **Guard**: When inserting new JSX elements between existing conditional wrappers `{condition && (...)}` and sibling components inside a fragment, always verify the wrapper braces `{` and closing `)}` stay paired. Read the file after edits to confirm JSX structure is intact — a stray `)}` with no matching opening `{condition && (` is a syntax error that kills the build.
