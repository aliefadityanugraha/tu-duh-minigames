---
name: framer-motion-neo-brutalist
description: Framer Motion animation patterns for neo-brutalist UI components — spring configs, keyframe rules, AnimatePresence for modals, staggered lists, and hover/tap interactions.
source: auto-skill
extracted_at: '2026-06-24T09:49:59.133Z'
---

# Framer Motion — Neo-Brutalist Animation Patterns

## Spring Configs (match the bold, punchy aesthetic)

```js
const snappy = { type: 'spring', stiffness: 500, damping: 30 };   // General hover/enter — fast, snappy settle
const punchy = { type: 'spring', stiffness: 600, damping: 20 };   // Buttons/tap — extra punch, slight overshoot
const gentle  = { type: 'spring', stiffness: 120, damping: 14 };  // Background/idle — slow float, soft motion
```

**Why these values**: Neo-brutalist design (thick borders, offset shadows) needs animations that feel decisive, not floaty. `stiffness: 500+` gives fast response; `damping: 20-30` prevents wobble. The `gentle` config is reserved for decorative/ambient animations only (empty slots, background elements).

## ⚠️ Critical Rule: Spring Animations Only Support 2 Keyframes

Framer Motion's spring and inertia transitions **only support exactly 2 keyframes** (start → end). Multi-step sequences like `rotate: [0, -10, 10, -5, 0]` will throw a runtime error:

```
Error: Only two keyframes currently supported with spring and inertia animations.
Trying to animate 0,-10,10,-5,0.
```

**Fix**: For multi-keyframe animations, use a **tween/duration-based transition** instead of spring:
```jsx
// ❌ BROKEN — spring + 5 keyframes
<motion.span animate={{ rotate: [0, -10, 10, -5, 0] }} transition={{ ...snappy }} />

// ✅ CORRECT — tween (duration-based) + multi keyframes
<motion.span animate={{ rotate: [0, -12, 12, -6, 0] }} transition={{ duration: 0.5, ease: 'easeInOut' }} />

// ✅ ALSO VALID — spring with only 2 keyframes
<motion.div animate={{ scale: [1, 1.1] }} transition={{ ...snappy, repeat: Infinity, repeatType: 'mirror' }} />
```

**Guard**: Any time you write an `animate` with an array longer than 2 elements, the transition must use `duration` + `ease`, NOT `type: 'spring'`. Springs are only for start→end 2-frame transitions or `whileHover`/`whileTap` (which are inherently 2-frame).

## Pattern Catalog

### 1. Page Entrance (fade + slide up)
```jsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ ...snappy, delay: 0.05 }}
>
```

### 2. Panel Slide-In (from left or right)
```jsx
// Left panel
<motion.div initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ ...snappy, delay: 0.15 }} />
// Right panel
<motion.div initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} transition={{ ...snappy, delay: 0.25 }} />
```

### 3. Modal with AnimatePresence (scale + fade enter/exit)
```jsx
<AnimatePresence>
  {showModal && (
    <>
      {/* Backdrop — fade only */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm"
      />
      {/* Modal body — scale + slide */}
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 30 }}
        transition={snappy}
      >
        {/* modal content */}
      </motion.div>
    </>
  )}
</AnimatePresence>
```
**Important**: `AnimatePresence` must wrap the conditional rendering, not be inside it. The children must have `exit` props defined for unmount animations to work.

### 4. Staggered List/Grid Entrance
```jsx
{items.map((item, i) => (
  <motion.div
    key={item.id}
    initial={{ opacity: 0, scale: 0.5, y: 20 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ ...snappy, delay: 0.35 + i * 0.05 }}
  >
    {/* card content */}
  </motion.div>
))}
```
**Timing**: Base delay ~0.35s (after panels slide in), per-item stagger ~0.04-0.05s. Don't exceed total ~1.5s for 15 items.

### 5. Button Interactions (whileHover + whileTap)
```jsx
<motion.button
  whileHover={{ scale: 1.04 }}
  whileTap={{ scale: 0.94 }}
  transition={punchy}
>
```
**Note**: Neo-brutalist buttons already have CSS shadow-offset press effects. `whileTap: { scale: 0.94 }` adds a complementary spring squeeze. Don't conflict with CSS `active:translate-x/y` — either remove the CSS active transform or let Framer Motion handle the tap entirely.

### 6. Decorative Icon Animations (infinite loops)
```jsx
// Gentle scale pulse (2 keyframes → spring OK)
<motion.div
  animate={{ scale: [1, 1.1] }}
  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
/>

// Multi-step wiggle (tween required)
<motion.span
  animate={{ rotate: [0, -12, 12, -6, 0] }}
  transition={{ duration: 0.5, ease: 'easeInOut' }}
/>

// Sequential traffic-light dots
<motion.div animate={{ scale: [1, 1.3, 1] }}
  transition={{ duration: 1.5, delay: 0.4, repeat: Infinity, repeatDelay: 3 }}
/>
```

### 7. Floating/Bobbing Empty Slots
```jsx
<motion.div
  initial={{ opacity: 0, scale: 0.7 }}
  animate={{ opacity: 0.25, scale: 1 }}
  transition={{ ...gentle, delay: 0.5 + idx * 0.04 }}
>
  <motion.span
    animate={{ y: [0, -3, 0] }}
    transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: idx * 0.2 }}
  >?</motion.span>
</motion.div>
```

### 8. Opacity Pulse for "Waiting" States
```jsx
<motion.div
  animate={{ opacity: [1, 0.5, 1] }}
  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
>
  MENUNGGU GURU...
</motion.div>
```

## General Guidelines for This Project

- **Don't animate shadows**: Neo-brutalist offset shadows (`shadow-[4px_4px_0px_#000]`) are part of the design language. Animating them with Framer Motion's `boxShadow` creates performance issues and looks inconsistent. Keep shadow changes as CSS transitions (`hover:shadow-[3px_3px_0px_#000]`).
- **Migrate CSS transitions to Framer Motion**: When a component gets `motion.*`, replace `transition-all` CSS with Framer Motion `whileHover`/`whileTap` for transform properties (scale, translate). Keep CSS transitions for color/background changes.
- **Layout animations**: Use `layout` prop on elements that change position when items add/remove (e.g., roster grid). Combined with `AnimatePresence`, this gives smooth insert/remove reflows.
- **Avoid over-animation**: Every element doesn't need entrance animation. Reserve stagger for visually distinct cards/panels. Text, icons in headers, and static labels can just appear (no `initial`/`animate`).
- **Hydration safety**: `suppressHydrationWarning` is still needed on elements that use `Date.now()` (e.g., cooldown timers) — Framer Motion doesn't affect server-rendered HTML mismatch.

## Hydration Mismatch with Time-Dependent Content

**Problem**: Next.js SSR renders time-based content (event log timestamps, elapsed timers) on the server at one moment, then hydrates on the client 1+ seconds later. The mismatch causes: `Text content does not match server-rendered HTML. Server: "16:54:16" Client: "16:54:17"`.

**Three fix strategies** (use the narrowest one that solves the problem):

### Strategy 1: `useEffect` for time formatting (component-level)
Move time formatting into `useEffect` so it only runs on the client. Render `null` or a placeholder on first pass so server and client produce identical output:
```jsx
function EventTimestamp({ evtTime }) {
  const [timeStr, setTimeStr] = useState('');
  useEffect(() => {
    const time = new Date(evtTime);
    setTimeStr(`${time.getHours().toString().padStart(2,'0')}:${time.getMinutes().toString().padStart(2,'0')}:${time.getSeconds().toString().padStart(2,'0')}`);
  }, [evtTime]);
  if (!timeStr) return null;  // Server and client both render null on first pass
  return <span className="...">{timeStr}</span>;
}
```

### Strategy 2: `suppressHydrationWarning` (element-level)
For simple inline time displays (like cooldown countdowns), add `suppressHydrationWarning` to the specific element:
```jsx
<span suppressHydrationWarning className="...">
  ⏳ CD DUEL {Math.max(0, Math.ceil((p.duelCooldownEndsAt - Date.now()) / 1000))}s
</span>
```
This tells React to skip the mismatch warning for that element. **Only use for small inline values** — not for entire sections that differ.

### Strategy 3: `dynamic = 'force-dynamic'` (page-level)
For dev/preview pages that are full of `Date.now()` calls and shouldn't be SSR'd anyway:
```js
// At the top of the page file (before imports)
export const dynamic = 'force-dynamic';
```
This skips static prerendering entirely. **Only for pages that don't need SSR** — never use on production game/lobby pages.

**Guard**: Any `Date.now()`, `new Date()`, or time-formatted string rendered in JSX will cause hydration mismatch if the page is SSR'd. Always pick one of the three strategies above.

## Overlay/Modal Conversion Pattern (Generic → Neo-Brutalist)

When converting a generic Tailwind modal (white bg, rounded, soft shadows) to the project's neo-brutalist aesthetic, follow this checklist:

### Structural changes:
| Before | After |
|--------|-------|
| `bg-white` | `bg-[#190047]` (dark purple base) |
| `border` / `border-2 border-slate-*` | `border-4 border-black` |
| `shadow-flat-lg` / `shadow-2xl` | `shadow-[12px_12px_0px_#000000]` |
| `rounded-2xl` on all inner cards | Keep `rounded-2xl` on outer modal only; inner cards use no radius + `border-4` |
| Header inline with no background | Header as colored bar (`border-b-4 border-black`) — amber for duel, crimson for sabotage, purple for generic |

### Color scheme per overlay type:
- **Duel**: Header `bg-[#ffc312]` (amber), timer box `bg-[#270067]`, options `bg-[#270067] border-black`, selected `bg-[#ffc312]`
- **Sabotage (viewer)**: Header `bg-[#93000a]` (crimson), content `bg-[#270067]`, timer `bg-[#270067]` or `bg-[#ffdad6]` (urgent)
- **Sabotage Rescue (target warga)**: Same crimson header, question card `bg-[#270067] border-4 border-black`, selected option `bg-[#93000a]`, submit `bg-[#ffc312]`

### Text styling:
| Before | After |
|--------|-------|
| `font-extrabold` | `font-rubik italic font-bold` for headings |
| `font-mono-tech` | `font-mono` (project uses Rubik + Mono fonts) |
| `text-slate-*` | `text-[#e9ddff]` (primary), `text-[#d3c5ab]` (secondary), `text-[#ffc312]` (accent), `text-[#9c8f78]` (muted) |

### Animation additions:
Wrap the modal with Framer Motion AnimatePresence pattern (see Pattern 3 above). Add `motion.*` to:
- Modal body (scale+fade enter/exit)
- Header icon (wiggle/pulse on open)
- Options buttons (`whileHover`, `whileTap` with `punchy`)
- Submit button (`whileHover`, `whileTap` with `punchy`)
- Timer badge (`scale` pulse animation when `isUrgent`)
- Content sections (`initial={{ opacity: 0, scale: 0.95 }}` fade-in)
- Emoji icons (wiggle/float infinite loops for spectator views)

**Guard**: When converting overlays, keep the functional logic (state, handlers, conditional rendering) exactly the same — only change visual props (className, style) and wrap elements with `motion.*`. Don't refactor the component structure.
