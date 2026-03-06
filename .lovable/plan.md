## Plan: Make `/` the Main Action Page of information but not the landing page

### Overview

Swap the routes so visitors land directly on the streamlined action page. The `/start` page gets decluttered to feel like a bold, attention-hungry social app (think TikTok/BeReal entry point) rather than an informational product page.

### Route Changes (src/App.tsx)

- `/` renders `Index` (the action page) instead of `Landing`
- Remove `/start` route (or redirect it to `/`)
- Update PWA manifest `start_url` to `/`

### Simplify the Action Page (src/pages/Index.tsx + src/components/MainActions.tsx)

**Remove from MainActions:**

- The two explanation cards like que cards ("Ask Questions" / "Voice Replies") — too much hand-holding
- The subtitle paragraph ("Ask meaningful questions or reply with thoughtful 60-second voices")
- Reduce the heading to something punchier and shorter (e.g., "What's on your voice?")

**Keep:**

- The `SmartThoughtInput` bar (primary CTA)
- The `LiveTrendingBanner` (social proof / engagement hook)
- `WriteNoteDialog` and `VoiceRecorder` (functional components)

**Remove from Index:**

- `SocialProof` section for non-auth users (this info lives on `/about` now)

### Header Updates (src/components/Header.tsx)

- Change "Get Started" button to navigate to `/` instead of `/start`
- Logo click stays as `/` (already correct after the swap)
- Add a small "About" or "Learn More" link pointing to `/about` (optional, replaces the old home concept)

### Manifest Update (public/manifest.json)

- `start_url` stays `/` (or update from `/start` to `/`)
- Shortcuts URL updated from `/start` to `/`

### Files Changed

1. `src/App.tsx` — route swap
2. `src/pages/Index.tsx` — remove SocialProof, simplify
3. `src/components/MainActions.tsx` — strip explanation cards, shorter headline
4. `src/components/Header.tsx` — update nav targets
5. `public/manifest.json` — update start_url and shortcut URLs