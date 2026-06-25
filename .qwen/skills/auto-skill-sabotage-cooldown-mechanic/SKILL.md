---
name: sabotage-cooldown-mechanic
description: Pattern for preventing action spam by implementing server-side absolute timestamp cooldowns for sabotage and duel events.
source: auto-skill
extracted_at: '2026-06-25T15:21:03.123Z'
---

# Sabotage & Duel Cooldown Mechanics

To prevent spam of game-breaking events (sabotage, duels) by the Provokator, a robust absolute-timestamp cooldown system is implemented on the server.

## 1. Implementation Pattern
Cooldowns are stored as absolute future timestamps on the `player` object, ensuring persistence even if the client-side UI timer drifts or the player reconnects.

### Server-Side State
Store the timestamp in `player` objects:
```javascript
// In gameHandler.js
const SABOTAGE_COOLDOWN_MS = 30_000; // 30 seconds

// On trigger/event:
player.sabotageCooldownEndsAt = Date.now() + SABOTAGE_COOLDOWN_MS;
```

### Server-Side Enforcement (The "Guard")
Check before allowing any action trigger:
```javascript
// Before initiating sabotage
if (player.sabotageCooldownEndsAt && Date.now() < player.sabotageCooldownEndsAt) {
  const remaining = Math.ceil((player.sabotageCooldownEndsAt - Date.now()) / 1000);
  socket.emit('sabotage-cooldown', { remaining, message: `Cooldown: ${remaining}s` });
  return;
}
```

### Client-Side Feedback
Clients should listen for the specific `cooldown` error event and display it as an ephemeral toast or banner, preventing the UI from allowing the action until the cooldown expires.

## 2. Key Cooldown Constants
Current standard cooldowns for Among Us Pancasila:
- **Sabotage Cooldown**: 30 seconds (`SABOTAGE_COOLDOWN_MS`)
- **Duel Cooldown**: 30 seconds (`DUEL_COOLDOWN_MS`)
- **Duel Wrong Answer Cooldown**: 10 seconds (`DUEL_WRONG_ANSWER_COOLDOWN_MS`)

## 3. Integration Points
- **Trigger Handler**: Always check at the start of `socket.on('trigger-sabotage', ...)` or `trigger-duel`.
- **Event Resolution**: Always update the `EndsAt` timestamp when a relevant event finishes (e.g., duel resolution or incorrect answer) or when the action is triggered.
- **Sanitization**: Include the `EndsAt` timestamp in the player object within `getSanitizedRoom` if the client needs to render a progress bar (e.g., `duelCooldownEndsAt` is already handled this way).

## 4. Why Absolute Timestamps?
Using `Date.now() + duration` (absolute) rather than simple boolean toggles (`isOnCooldown = true`) avoids issues with:
- Client-server clock desync (the server is the source of truth).
- Reconnection logic (the cooldown remains valid upon socket reconnect).
- Drift in `setTimeout` loops.

Always compare `Date.now() < endsAt`.
