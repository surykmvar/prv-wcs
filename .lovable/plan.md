

## Fix: GooeyText invisible on dark mode

### Problem
The `GooeyText` component's SVG `feColorMatrix` filter (`0 0 0 255 -140` alpha channel) acts as a threshold that clips transparency. This works for **dark text on light backgrounds** but makes **light text on dark backgrounds completely invisible** — which is why you can't see the morphing animation.

The screenshot you shared appears to be from a cached/published version. The current code already has the clean layout (no "Share your voice" heading, no trending topics on the Index page). The only issue is the GooeyText being invisible due to this filter.

### Changes

**`src/components/ui/gooey-text-morphing.tsx`**:
- Remove the SVG `<filter id="threshold">` and `feColorMatrix` element entirely
- Remove `style={{ filter: "url(#threshold)" }}` from the container div
- The blur + opacity animation in `setMorph` already creates the gooey morphing effect without the SVG filter — it works on both light and dark themes
- Add `whitespace-nowrap` to both spans to keep multi-word phrases on one line

**`src/components/MainActions.tsx`** — no changes needed, already clean.

**`src/components/LiveTrendingBanner.tsx`** — delete this file (unused, not imported anywhere).

### Result
The morphing text animation will be visible on dark backgrounds, showing "Talk Engineering", "Ditch AI Slop", etc. in the same clean layout that already exists.

