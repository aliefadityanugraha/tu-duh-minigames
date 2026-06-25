---
name: game-audio-synchronization
description: Pattern for triggering synchronous background audio across all clients using existing WebSocket events without additional network overhead.
source: auto-skill
extracted_at: '2026-06-25T01:03:18.222Z'
---

# Game Audio Synchronization Pattern

This pattern allows for background music to start synchronously across all connected game clients using existing socket events, avoiding unnecessary network traffic.

## Approach

1.  **Event-Triggered Initialization:** 
    Use an existing, global "game start" event (e.g., `role-assigned` in this project) as the trigger for the audio object's `play()` method. Since the server broadcasts this event to all clients simultaneously, the audio starts at nearly the same time on all devices.

2.  **Audio Object Lifecycle:** 
    - Store the `Audio` object in a global hook (e.g., `SocketContext` provider) so it can be managed (muted/unmuted, paused, reset) from any component.
    - Initialize the audio within the socket event handler.
    - Add `audio.loop = true` for continuous background play.

3.  **State Management (Mute/Unmute):**
    - Maintain a global `isMuted` state. 
    - Apply this state to the `audio` object immediately upon creation (`audio.muted = isMuted`) and provide a `toggleMute` function to update both the UI state and the `Audio` object's `muted` property.

4.  **Handling Browser Autoplay Policies:**
    - Wrap the `.play()` call in a promise `.catch()` block to gracefully handle scenarios where browsers block autoplay (e.g., if the user hasn't interacted with the page yet). 
    - Ensure the user interacts with the app (e.g., clicking "Join") *before* the game-start event to satisfy most browser autoplay policies.

5.  **Reset Logic:** 
    - Listen for game termination/restart events to `pause()` the audio and reset `currentTime = 0`. This ensures that subsequent game starts do not result in overlapping audio tracks.
