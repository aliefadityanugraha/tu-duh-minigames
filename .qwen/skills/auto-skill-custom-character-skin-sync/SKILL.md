---
name: custom-character-skin-sync
description: Pattern for creating a real-time synchronized custom skin system using dynamic state and socket broadcasting.
source: auto-skill
extracted_at: '2026-06-25T13:33:16.081Z'
---

# Custom Character Skin Sync

Procedure for implementing a collaborative, synchronized custom skin system.

## Procedure

1. **Backend Integration**
   - Use `multer` to handle multipart file uploads and store assets in a dedicated static directory (e.g., `public/images/characters/custom/`).
   - Add a server-side endpoint (`/api/upload-skin`) to receive files and return the path URL.

2. **State Management Migration**
   - Move the skin collection from a static constant to dynamic state within the `SocketProvider`.
   - Ensure the server maintains a master `skins` list for the room, initialized with `DEFAULT_SKINS`.

3. **Socket Synchronization**
   - Implement `skin-list-updated` event broadcast whenever a new skin is added to the room's collection.
   - Clients must subscribe to this event to keep their local `skinList` state synchronized across all players in the room.

4. **Dynamic Rendering**
   - Replace static imports of `SKINS` in components (`WaitingRoom`, `PlayerView`, `AdminView`) with `const { skinList } = useSocket()`.
   - Ensure components pass `skinList` down through props if they are not direct children of the socket-aware container.
   - Update all rendering logic to map over the dynamic `skinList`.
   - **Important:** Ensure components dependent on `skinList` (like the UI for selecting a skin) initialize their state (e.g., `activeSkin`) by accessing `skinList[skinId]`, not a static constant.

5. **Upload UX**
   - Implement loading states (e.g., `isUploading`) during the `fetch` request to the backend.
   - Disable UI interactions while the upload is in progress to prevent duplicate submissions.

## Why
Static skin definitions prevent collaboration in dynamic multiplayer environments. Centralizing skin management in the socket state ensures all clients maintain visual parity.

## How to apply
When adding new cosmetic features, always evaluate if the state needs to be strictly localized or if it requires server-side broadcast to maintain cross-client consistency.
