

## Plan: Remove heading, enlarge GooeyText

### Changes

**`src/components/MainActions.tsx`**:
1. Remove the "What's on your voice?" `<h1>` block (lines 81-85)
2. Increase GooeyText container height from `h-12` to `h-16` and add top margin
3. Increase `textClassName` to `text-2xl sm:text-3xl md:text-4xl font-bold text-foreground` to match the previous heading size

