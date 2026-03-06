

## Plan: Fix Mobile Widget Crash + Add Persistent Install Button

### Issue 1: "Something went wrong" on Landing page (mobile)

The `VoiceWidgetDemoEnhanced` component is wrapped in an `ErrorBoundary` and crashes on mobile. The component renders `ModernVoicePlayer` inside a `Carousel`, and the `VotingButtons` component inside the player calls `useAuth()` and `useNavigate()` and runs Supabase queries to check existing votes -- this can fail on mobile due to timing or resource constraints.

**Fix**: Wrap each individual widget card rendering inside the `VoiceWidgetDemoEnhanced` component with try/catch-safe patterns, and more importantly, add a simpler mobile-safe fallback. The most robust fix is to wrap the two sub-sections (Website Integration and Social Media Integration) each in their own `ErrorBoundary` so one failing doesn't take down both, and to ensure the `VotingButtons` component handles errors gracefully when used in demo mode (the `demo` prop only disables subscriptions in `ModernVoicePlayer` but `VotingButtons` still tries to query Supabase for user votes with the demo IDs like "demo-1").

**Files changed:**
- `src/components/VoiceWidgetDemoEnhanced.tsx` -- Wrap each section in its own `ErrorBoundary`; pass `demo` prop through to `VotingButtons`
- `src/components/VotingButtons.tsx` -- When `voiceResponseId` starts with "demo-", skip the Supabase query for existing votes to prevent errors
- `src/components/ModernVoicePlayer.tsx` -- Pass `demo` prop to `VotingButtons`

### Issue 2: Persistent "Install App" button

Currently the PWA install prompt appears once and after dismissal it's hidden for 7 days. Users who've logged in should always have access to install the app.

**Fix**: Add a "Install App" option in the Header's user dropdown menu (next to "My Profile", "Get Credits", etc.) that triggers the PWA install flow. This uses the existing `usePWAInstall` hook. The option only shows when the app is not already in standalone mode.

**Files changed:**
- `src/components/Header.tsx` -- Add `usePWAInstall` hook, add "Install App" dropdown menu item with `Download` icon for logged-in users (hidden when `isStandalone` is true)

### Summary of all file changes
1. `src/components/VoiceWidgetDemoEnhanced.tsx` -- Separate ErrorBoundaries per section
2. `src/components/VotingButtons.tsx` -- Skip Supabase vote query for demo IDs
3. `src/components/ModernVoicePlayer.tsx` -- Forward `demo` prop to VotingButtons
4. `src/components/Header.tsx` -- Add persistent "Install App" menu item

