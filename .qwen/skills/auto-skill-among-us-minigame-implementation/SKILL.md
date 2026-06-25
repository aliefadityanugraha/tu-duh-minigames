---
name: among-us-minigame-implementation
description: Pattern for integrating Among Us-style minigames (Sila 1-5) using a modular shell and consistent registry for dev/game preview.
source: auto-skill
extracted_at: '2026-06-24T12:20:00.000Z'
---

# Among Us Minigame Integration Pattern

## Modular Architecture

### 1. The Minigame Shell (`MinigameShell.js`)
All minigames use a unified shell for consistency. This shell handles:
- **Root/Container**: Standardized outer padding and layout.
- **Header**: Uniform icon, title, sila label, and status indicator.
- **WorkArea**: Consistent padding and visual wrappers for game content.
- **Components**: Standardized `Section`, `Hint`, `Progress`, `Button`, `WinBanner`, and `Footer` components.
- **Sila Labels**: A centralized `SILA_LABELS` object ensuring uniform copy across all minigame screens.

### 2. Registry (`index.js`)
Centralize all minigames in `src/components/minigames/index.js` using a `MINIGAME_REGISTRY`:
```javascript
export const MINIGAME_REGISTRY = {
  'tebak-ibadah': { component: TebakRumahIbadah, sila: 1, label: 'Tebak Rumah Ibadah' },
  // ...others
};
```
This enables dynamic loading and easy debugging in the `/dev` page.

### 3. Consistency Rules
- **Compact vs Full**: Every minigame component MUST support a `compact` prop.
  - `compact=true`: For the Mission Book panel (usually less vertical space).
  - `compact=false`: For full-screen task display.
- **Callbacks**: Every component MUST accept `onComplete` (for standard integration) and `onGameComplete` (legacy debug compatibility).
- **Completion Logic**: Use `fireTaskComplete(onComplete, onGameComplete)` from `shellClasses.js` to ensure uniform success event handling.

## Implementation Pattern
When creating a new minigame (e.g., Sila X):
1. **Shell Import**: Import everything from `MinigameShell.js`.
2. **WorkArea Content**: Place interactive game logic in `<MinigameWorkArea>`.
3. **State Management**:
   - Track local state for input/interactions.
   - Use `completedRef` to prevent redundant task completion signals.
4. **Layout**:
   - Use CSS classes from `shellClasses.js`.
   - Grid layout is highly recommended for balanced UI (e.g., image/hint on left, choices/validation on right).
5. **Previewing**: Immediately add new minigame screens to `src/pages/dev.js` registry and render them using a wrapper.

## Debugging Workflow
To efficiently develop a new game:
1. **Mock Screen**: Add `mg-<name>-full` and `mg-<name>-compact` to the `SCREENS` array in `dev.js`.
2. **Implementation**: Build/Refine the minigame component in isolation.
3. **Registry**: Register the component in `MINIGAME_REGISTRY`.
4. **Integration**: Verify interaction works correctly by playing through the `/dev` preview and checking for consistency with other minigames in the suite.
