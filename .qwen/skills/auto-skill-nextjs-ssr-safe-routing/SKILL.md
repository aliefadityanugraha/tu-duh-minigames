---
name: nextjs-ssr-safe-routing
description: Pattern for preventing NextRouter Not Mounted errors during build-time static generation by ensuring client-only hooks access.
source: auto-skill
extracted_at: '2026-06-25T02:34:54.368Z'
---

# SSR Safe Routing in Next.js

When using `useRouter` or `socket` connections in Next.js pages that undergo static generation/prerendering, ensure hooks access is guarded to prevent `NextRouter was not mounted` errors.

## Approach

1. **Guard with `useEffect`**:
   Use `useEffect` to trigger side effects that rely on router or socket, as this lifecycle method only runs on the client.

   ```javascript
   const [mounted, setMounted] = useState(false);
   useEffect(() => {
     setMounted(true);
   }, []);

   if (!mounted) return null; // Or a loading skeleton
   ```

2. **Conditional Rendering**:
   If a component *must* use `useRouter`, only render it when `mounted` is true.

3. **Dynamic Imports**:
   For complex pages (like `/game` or `/dev`), use dynamic imports with `ssr: false` in `next/dynamic` to force client-side rendering.

   ```javascript
   import dynamic from 'next/dynamic';
   const GamePage = dynamic(() => import('../components/GamePage'), { ssr: false });
   ```

4. **Verify Environment**:
   Always check `typeof window !== 'undefined'` before accessing browser APIs or `sessionStorage`.
