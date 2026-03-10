

## Plan: Fix Invisible GooeyText + Clean Up

### Root Cause
The `GooeyText` component uses an SVG `feColorMatrix` filter with alpha values `255 -140` which acts as a threshold — this works for dark text on light backgrounds but makes light text on dark backgrounds completely invisible. That's why you can't see the animation.

### Changes

**`src/components/ui/gooey-text-morphing.tsx`**:
- Remove the SVG `feColorMatrix` threshold filter entirely — it's incompatible with dark themes
- Replace with a simpler CSS-only blur approach for the morph effect (the blur + opacity animation already creates the gooey transition without the SVG filter)
- Remove `style={{ filter: "url(#threshold) blur(0.6px)" }}` from the container div

**`src/components/MainActions.tsx`**:
- Remove unused `useTrendingThoughts` import and `materializeTrendingTopic` usage
- Remove unused `handleStartRecording`, `handleOpenAuth` functions
- Remove unused `recordingTrendingTopicId`, `materializedThoughtId` state and the `VoiceRecorder` block
- Remove unused `motion` and `SparkleField` imports
- Keep only: GooeyText, SmartThoughtInput, WriteNoteDialog
- Result: clean, minimal layout with just the morphing text + input bar

### File changes
1. `src/components/ui/gooey-text-morphing.tsx` — Remove SVG filter, use CSS-only morph
2. `src/components/MainActions.tsx` — Remove all trending topic remnants and unused code

