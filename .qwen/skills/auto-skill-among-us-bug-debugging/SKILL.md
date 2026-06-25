---
name: among-us-bug-debugging
description: Workflow for debugging minigame UI inconsistencies and state synchronization issues in Among Us-style multiplayer games.
source: auto-skill
extracted_at: '2026-06-25T01:22:07.747Z'
---

# Among Us Bug Debugging Procedure

## 1. State Synchronization Debugging
When "Misi Berikutnya" (Next Task) is inconsistent:
- **Server-Client Sync**: Always check `MiniGamesContainer.js`. The button is rendered based on `showMinigameSuccess`.
- **Validation**: Ensure `isAnswered` and `feedback` states correctly receive the response from the server via `socket.on('task-feedback')`.
- **Race Condition Prevention**: Use the `fireTaskComplete` utility which calls callbacks in a controlled sequence. If buttons fail to appear, the client likely didn't receive the `task-feedback` event.
- **Fallback UI**: Add a `setTimeout` or a status indicator in the UI to confirm whether the server has acknowledged the task completion if the "Misi Berikutnya" button doesn't render within 1-2 seconds.

## 2. Minigame/Provokateur UI Cleanup
For inconsistent minigame/quiz rendering:
- **Wrapper Logic**: Use `MinigameShell.js` and `getMinigameShellClasses()` consistently.
- **Provokateur Panel**: Ensure `ProvokateurPanel.js` uses flex/grid containers properly so that nested components don't overflow or collapse.
- **Responsive Design**: Wrap complex minigames in a `overflow-y-auto` container to ensure content remains scrollable on smaller screens.

## 3. Sabotage Timer Logic
For timer-related bugs:
- **Server Source of Truth**: The timer should only be decremented or validated in `server/handlers/gameHandler.js`.
- **Client-Side Display**: Use the `task-timer-update` socket event rather than local `setInterval` to prevent drift.
- **Thresholds**: Hard-code sanity limits in the server-side validator:
  ```javascript
  s.gameTimer = Math.min(1800, Math.max(60, parseInt(newSettings.gameTimer) || 300));
  ```
  Ensure these limits are respected in the UI sliders.

## 4. General Debugging Strategy
1. **Grep Pattern**: Use `grep_search` for key events (e.g., `"Misi Berikutnya"`, `fireTaskComplete`, `task-feedback`) to find related logic quickly.
2. **Event Tracing**: Log incoming socket events in `useSocket.js` using `addLog()` to verify the sequence of messages arriving from the server.
3. **Registry Check**: If a task fails to render, check `MINIGAME_REGISTRY` in `src/components/minigames/index.js` to ensure the component is properly exported and mapped.
