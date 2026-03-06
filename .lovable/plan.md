

## Assessment: PWA is Already Mostly Functional

Your app already has a solid PWA setup. Here's what exists and what needs fixing:

### Already in Place
- `manifest.json` with correct name, icons (192x192, 512x512), display: standalone
- `sw.js` with caching and offline support
- Service worker registration in `main.tsx`
- iOS meta tags (`apple-mobile-web-app-capable`, status bar style, title)
- `apple-touch-icon` link
- `theme-color` meta tags (light/dark)
- `PWAInstallPrompt` component with iOS instructions and Android install button
- `usePWAInstall` hook managing install state

### What Needs Fixing (3 items)

1. **Service worker caches stale `/start` route** -- `sw.js` line 4 still caches `/start` which no longer exists. Replace with current routes like `/feed`, `/about`.

2. **No offline fallback page** -- When both cache and network fail, the user gets a browser error. Add an offline HTML fallback that shows a friendly "You are offline" message, and serve it from the service worker when navigation requests fail.

3. **Bump cache version** -- Change `CACHE_NAME` from `woices-v1` to `woices-v2` so existing users get the updated cache.

### Files Changed
1. `public/sw.js` -- Fix cached routes, add offline fallback, bump cache version
2. `public/offline.html` -- New minimal offline page with Woices branding

No changes needed to `manifest.json`, `index.html`, `main.tsx`, `PWAInstallPrompt.tsx`, or `vite.config.ts` -- they're already correct. Note: `vite-plugin-pwa` is not needed since we have a hand-written service worker that works fine.

