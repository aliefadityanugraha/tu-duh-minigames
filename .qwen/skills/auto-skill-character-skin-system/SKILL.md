---
name: character-skin-system
description: Pattern for transitioning from emoji-based character identifiers to image-based character assets in the lobby/roster.
source: auto-skill
extracted_at: '2026-06-24T12:36:54.600Z'
---

# Character Skin System

This skill documents the approach for replacing character emoji identifiers with image-based assets (e.g., PNGs) within the game's skin system.

## Procedure

1.  **Data Schema Migration**
    *   Update the `SKINS` constant definition (typically in `WaitingRoom.js`).
    *   Replace `emoji: '...'` with `img: '/images/characters/<name>.png'`.
    *   Ensure all existing skin objects share the same schema for consistency.

2.  **Asset Preparation**
    *   Create the target directory: `public/images/characters/`.
    *   Ensure all images are optimized, appropriately sized (e.g., 64x64 or 128x128), and follow consistent naming conventions.

3.  **UI Component Updates**
    *   **Skin Selection Modal:** Find rendering loops for `SKINS.map(...)` and replace `<span className="text-3xl">{skin.emoji}</span>` with `<img src={skin.img} alt={skin.name} className="..." />`.
    *   **Waiting Room Roster:** Update the mapping in the player grid. Ensure consistent styling (`object-contain`) to prevent image distortion.
    *   **Player Preview Buttons:** Update `MySkinButton` or equivalent preview components.

4.  **Styling & UX**
    *   Use `object-contain` for `<img>` tags to ensure images scale correctly within square containers.
    *   Retain existing shadow/border props from the original emoji-based design to maintain the neo-brutalist aesthetic.

## Why
Images provide higher visual fidelity and more thematic branding than standard Unicode emojis, essential for a game's identity.

## How to apply
When migrating or adding new skins, ensure both the data constant and the `public/images` directory are synchronized. Always use standard `alt` text for accessibility.
