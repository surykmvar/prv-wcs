

## Fix: GooeyText alignment, visibility, and content

### Problems
1. Text words stack vertically instead of displaying on one line — the `span` elements are `absolute` but the parent container has insufficient height/width constraints
2. Text is too dim (`text-muted-foreground`) and not visually impactful
3. Content is generic/cringe — needs edgy, topic-based phrases

### Changes

**`src/components/MainActions.tsx`** — Update the GooeyText wrapper and props:
- Give the container a proper fixed height (`h-12`) and full width so the absolute-positioned spans have room
- Change texts to topic-based phrases: `"Talk Engineering"`, `"Ditch AI Slop"`, `"Review Nearby Spots"`, `"Expose Fake News"`, `"Debate Bold Ideas"`
- Use brighter, bolder text styling: `text-xl sm:text-2xl font-bold text-foreground` instead of muted

**`src/components/ui/gooey-text-morphing.tsx`** — Fix the layout so text renders in a single horizontal line:
- Add `whitespace-nowrap` to both span elements to prevent word wrapping
- Ensure the parent flex container has `min-h-[1em]` and proper width so spans don't collapse

### File changes
1. `src/components/ui/gooey-text-morphing.tsx` — Add `whitespace-nowrap` to span classNames
2. `src/components/MainActions.tsx` — Update texts array, increase container height, use brighter text classes

