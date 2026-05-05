## Problem

From the screenshot:
- **Script panel says "Parsed: 0 panels · 0 speakers"** even though the script is full of `CHARACTER` / dialogue pairs. Cause: `parseComicScript` requires `PAGE N` headers and `1 - description` panel markers (the format the in-app Script Formatter emits). A pasted Celtx/screenplay script has neither, so it returns `[]` → empty character roster → bubble placement has nothing to map.
- **Panels 2 and 3 render as paper-thin horizontal strips** overlapping panel 1. Cause: `letter-page-analyze` returned boxes with near-zero height; the current filter only drops boxes with `w<0.02 || h<0.02`, and aspect-ratio sanity isn't checked. With a complex 6-photo composite page the model produced bad geometry and we kept it.

## Fix

### 1. Screenplay-format fallback in `src/lib/comic-panel-parser.ts`

Add a second parser path that activates when no `PAGE` header is found:

- Detect blocks of `^[A-Z][A-Z0-9 _-]{1,30}$` lines immediately followed by one or more non-blank text lines (standard screenplay character cue → dialogue).
- Treat parenthetical lines after the cue (e.g. `(thought)`, `(whisper)`) as kind modifiers, same as today's inline `NAME (THOUGHT):` rule.
- Skip obvious boilerplate: lines matching `^(Created using|CONTINUED|FADE|INT\.|EXT\.|\d+\.)` and stray page numbers.
- Wrap the result as a single `ComicPage { pageNumber: 1, panels: [oneSyntheticPanel] }` whose `dialogues[]` contains every extracted line in order, and `characters[]` contains the unique speaker set. Description stays empty (no visual prose).
- The existing `PAGE`/numbered-panel parser stays the primary path; the fallback only runs when `pageMatches.length === 0`.

This makes the **character roster + dialogue lines** populate from any screenplay, which is what the Letter Page actually needs to drive bubble placement (panel boxes themselves come from the AI vision pass, not the script).

### 2. Reject degenerate panels in `supabase/functions/letter-page-analyze/index.ts`

Tighten the post-filter:
- Drop any panel with `w < 0.05` or `h < 0.05` (was `0.02`).
- Drop panels whose aspect ratio is more extreme than 8:1 in either direction (these are the thin strips in the screenshot).
- After filtering, drop any panel that overlaps an earlier (larger) one by more than 80% of the smaller box's area — keeps the bigger, well-formed detection.
- Re-index `index` to `1..N` after filtering so reading order stays clean.

### 3. Re-index test coverage

`src/test/comic-bubbles.test.ts` is unaffected (it tests bubble model, not the parser). No CI changes needed.

## Technical notes

- Files touched: `src/lib/comic-panel-parser.ts`, `supabase/functions/letter-page-analyze/index.ts`.
- No DB migration, no new edge function, no UI changes.
- Existing `PAGE 1` + `1 - …` scripts continue to work identically — the fallback only fires when there are zero `PAGE` matches.
- After the fix, your current screenplay will show `Parsed: 1 panel · N speakers` (Zeus, Rhea, …), and re-running **Auto-letter** on the artwork should produce 4 clean panel boxes instead of overlapping strips.
