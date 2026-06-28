---
name: character-skin-system
description: Pattern for transitioning to image-based character assets and implementing dynamic custom skin uploads.
source: auto-skill
extracted_at: '2026-06-25T15:27:10.595Z'
---

# Character Skin System

This skill documents the approach for replacing character emoji identifiers with image-based assets and enabling dynamic custom skin uploads.

## Procedure

1.  **Data Schema Migration**
    *   Update the `SKINS` constant definition (typically in `WaitingRoom.js`).
    *   Replace `emoji: '...'` with `img: '/images/characters/<name>.png'`.
    *   Ensure all existing skin objects share the same schema for consistency.

2.  **Dynamic Upload Implementation**
    *   **Backend:** Use `multer` in `server.js` to handle `multipart/form-data`.
    *   **Endpoint:** Create an API route (e.g., `/api/upload-skin`) that saves files to `public/images/characters/custom/`.
    *   **Client:** Create an `CustomSkinUploader` component that uses `FormData` and `fetch` to POST images to the server.
    *   **State:** Update the client-side `SKINS` array dynamically once the server returns the new `skinUrl`.

3.  **Asset Preparation**
    *   Ensure the target directory `public/images/characters/custom/` exists and is writable.
    *   Use appropriate file naming (e.g., `skin-<timestamp>.png`).

4.  **UI Component Updates**
    *   **Skin Selection Modal:** Include `CustomSkinUploader` as an entry point for users to add their own character images.
    *   **Rendering:** Ensure the mapping loop in the `SkinModal` renders both static and custom-uploaded skins using `object-contain` for consistency.

5.  **Styling & UX**
    *   Maintain the neo-brutalist aesthetic (thick borders, flat shadows) for custom skin tiles.
    *   Ensure proper loading/error states for image uploads.

## Why
Images provide higher visual fidelity than emojis. Allowing custom user uploads increases engagement and personal branding.

## How to apply
When migrating or adding new skins, ensure both the data constant and the `public/images` directory are synchronized. Always use standard `alt` text for accessibility.
