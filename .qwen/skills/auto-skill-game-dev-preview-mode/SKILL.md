---
name: game-dev-preview-mode
description: Pattern for creating a /dev page that lets developers navigate and preview all game screens/components with mock data for styling — no server connection required.
source: auto-skill
extracted_at: '2026-06-24T08:30:20.987Z'
---

# Game Dev Preview Mode — Style Editor Page

## What It Solves
When building a game app with many screens (lobby, playing, overlays, end states), developers need to see and edit styles for each screen without playing through the entire game to reach that state. A `/dev` page provides instant navigation to every screen with mock data.

## Architecture

### Single Page with Mock Data Factory
Create `src/pages/dev.js` that:
1. Catalogs all screens in a `SCREENS` array with `{ id, group, label }`
2. Groups screens logically (Lobby, Game, Task, Minigame, Overlay, End, Stats, UI)
3. Uses a `buildRoom(overrides)` factory function to generate consistent mock room objects
4. Switches mock data per screen via `switch` statement (room, player, roleInfo, currentTask, etc.)
5. Renders the real component with mock props — no Socket.io connection needed

### Key Pattern: Mock Data Factory
```js
function buildRoom(overrides = {}) {
  return {
    code: 'DEV01', state: 'playing', players: MOCK_PLAYERS,
    tasksCompleted: 5, tasksRequired: 10, gameTimer: 180,
    gameStats: MOCK_GAME_STATS, settings: MOCK_SETTINGS,
    sabotage: null, duel: null, debate: null,
    ...overrides,  // Per-screen overrides override defaults
  };
}
```

This allows screens like `warga-locked` to inject `{ sabotage: { active: true, phase: 'warga_rescue', ... } }` while inheriting all other mock data.

### Key Pattern: Noop Callbacks
```js
const noop = () => {};
const noopWithArg = () => {};
```
All event handler props (`onVote`, `onSubmitQuiz`, `onTriggerDuel`, etc.) use noops since dev mode is purely visual.

### Key Pattern: Standalone Minigame Wrapper
For minigames that need both Full and Compact modes:
```jsx
function MinigameStandalone({ component, compact, label }) {
  const C = component;
  return (
    <div className="flex flex-col h-full">
      <div>Header with label + mode badge</div>
      <div className="flex-1 overflow-y-auto">
        <C compact={compact} onComplete={noop} onGameComplete={noop} />
      </div>
      <div>Footer hint about editing styles</div>
    </div>
  );
}
```

Each minigame gets two screens: `mg-xxx-full` and `mg-xxx-compact` to preview both layouts.

## Screen Categories to Include

| Group | Example Screens |
|-------|----------------|
| Lobby | Login Form, Waiting Room |
| Game | Warga Playing, Warga Locked, Warga Dead, Provokateur Playing/Dead/Sab-Quiz, Guru Admin |
| Task | Quiz ( unanswered / correct / wrong / timer-low ), each minigame inside TaskContainer |
| Minigame | Each minigame standalone — Full + Compact modes |
| Overlay | Sabotage (per-role view), Rescue, Duel, Debate, Presentation, Topic Debate |
| End | Game Ended — each winner outcome |
| Stats | Live Stats Panel |
| UI | Game Header |

## Dev Navbar Component
A sticky navbar at the top with:
- **Screen group navigation** — horizontal button bar, grouped by category
- **Dark/Light background toggle** — for testing styles on different backgrounds
- **Hide/Show nav** toggle — to see the full screen without nav clutter
- **Info badge** — shows current role, player name, dead status

## Mock Data Shapes Required

The most complex mock object is `room` — it must match the full room shape used by game components:
- `code`, `state`, `players[]`, `tasksCompleted/Required`, `gameTimer`, `gameStats`, `settings`
- `sabotage`, `duel`, `debate`, `topicDebate`, `presentation` (nullable sub-states)
- `winner`, `winReason` (for ended state)

Player mock needs: `id`, `name`, `isGuru`, `isDead`, `role`, `score`, `skinId`, `duelCooldownEndsAt`

For overlays that need specific data shapes (debate votes/chat, duel questions, sabotage phases), create dedicated mock constants.

## Important Notes
- **Don't import SocketProvider** — dev mode renders components directly, no socket needed. Some components (WaitingRoom) accept a mock socket object `{ emit: noop, on: noop, off: noop, id: 'mock-id' }`.
- **Build verifies mock props** — if a component's prop signature changes, the dev page build will fail. This is a useful guard that keeps mock data in sync with real component APIs.
- **Files can disappear** — Next.js module-not-found errors may indicate a source file was accidentally deleted (e.g., TaskContainer.js). Always verify the file exists in the filesystem before assuming a code bug.
- **Access route**: `/dev` — add this to your `next.config.js` if needed, or just navigate directly since Next.js auto-routes pages.
