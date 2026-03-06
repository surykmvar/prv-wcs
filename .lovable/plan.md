

## Plan: Set Default Theme to Dark Mode

A single change in `src/App.tsx`: update the `ThemeProvider` `defaultTheme` prop from `"light"` to `"dark"`. The existing `ThemeToggle` component already allows users to switch to light mode.

### Change
**File: `src/App.tsx` (line 33)**
- Change `defaultTheme="light"` → `defaultTheme="dark"`

This ensures new users (with no stored preference) see dark mode by default. Users who already have a stored theme preference in localStorage will keep their existing choice.

