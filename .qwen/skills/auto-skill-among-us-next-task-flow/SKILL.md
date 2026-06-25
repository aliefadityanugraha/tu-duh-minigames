---
name: among-us-next-task-flow
description: Pattern for handling manual, robust mission-transition flows in multiplayer games using loading states and z-index management.
source: auto-skill
extracted_at: '2026-06-25T01:59:37.552Z'
---

## Among Us Next Task Flow Synchronization

When implementing a "Next Task" button in a multiplayer environment where state desynchronization can occur, follow this pattern:

### 1. Manual Flow over Auto-Transition
Avoid using `setTimeout` to automatically transition states. In multiplayer games, auto-transitions often conflict with pending server responses, leading to state staleness. Force a manual user click to act as a confirmation of state transition.

### 2. Preventing Double-Submission (Race Conditions)
Always include a loading state (`isNextTaskLoading`) on the UI trigger button.
- **Implementation**:
  ```javascript
  const [isLoading, setIsLoading] = useState(false);
  const handleAction = () => {
    setIsLoading(true);
    onAction();
    // Safety timeout to reset state if server interaction hangs
    setTimeout(() => setIsLoading(false), 2000);
  };
  ```

### 3. Z-Index Management
UI overlays for mission completion MUST have high `z-index` (e.g., `z-[100]`) to ensure they are rendered above all background elements or game overlays, guaranteeing user interaction is possible.

### 4. Client-Server Reconciliation
- Always log the mission-delivery flow: [Client] RequestSent -> [Server] TaskDelivered.
- Server-side handlers must perform state validation (`isAnswered`, `taskLocked`) before delivering a new task to prevent invalid requests from corrupting the game state.
