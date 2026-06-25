---
name: among-us-mission-transition-robustness
description: Pattern for creating manual, robust mission-transition flows in multiplayer games using loading states, z-index management, and manual state resetting.
source: auto-skill
extracted_at: '2026-06-25T03:02:06.591Z'
---

# Among Us Mission Transition Robustness

## Problem
In multiplayer games, automatic mission transitions (like using `setTimeout` to trigger the next mission) can cause desynchronization between server and client states, leading to buttons becoming unclickable ("stuck" state).

## Solution Pattern
1. **Manual Trigger**: Avoid automatic `setTimeout` for transitions. Require the user to manually click the "Next Mission" button to ensure they have seen the feedback and the server has confirmed the state.
2. **Loading States**: Use a local `isLoading` (or `isNextTaskLoading`) state on the UI transition button. Disable the button and show a "Processing..." state immediately upon clicking to prevent duplicate socket events (race conditions).
3. **Z-Index Management**: Ensure mission transition banners (which contain the "Next Task" button) have high `z-index` (e.g., `z-[100]`) to ensure they overlay other UI elements and remain clickable.
4. **State Verification**: Always reset mission-specific states (`isAnswered`, `feedback`, `currentTask`) upon trigger, and ensure the server acknowledges the task transition before enabling the transition button again.
5. **Multiplayer Safety**: Use consistent `SocketProvider` contexts that persist across page transitions and re-join sessions automatically if the socket disconnects.
