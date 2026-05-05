## What's in the zip

`celsius-comic-creator.zip` contains a fork of the current project plus an inventory doc (`CELSIUS_INVENTORY_AND_GAPS.md`) comparing Celsius to jenova.ai's comic creator.

Compared to the live project, the only code changes are a focused feature: **multi-bubble in-canvas panel editing** (gaps #3 and #6 in the inventory).

### Files added (3)
- `src/components/BubbleShape.tsx` (323 lines) — SVG shapes for speech / thought / shout / whisper / caption
- `src/components/BubbleToolbar.tsx` (275 lines) — bubble kind + speaker + style controls
- `src/components/PanelBubbleEditor.tsx` (460 lines) — drag/resize/edit overlay on top of a panel

### Files modified (3)
- `src/components/ComicPanel.tsx` — wires PanelBubbleEditor in over the rendered image (166 → 188 lines)
- `src/components/GraphicNovelPageLayout.tsx` — minor grid/layout tweaks (79 → 101 lines)
- `src/pages/ComicPanels.tsx` — bubble state plumbing, save/load, export integration (383 → 490 lines)

### Unchanged
- All 27 edge functions — identical
- Both DB migrations — identical
- `package.json`, `App.tsx`, parser, types — identical
- All other pages (Astralnaut Studios, storyplans, character builder, etc.) — identical

So no DB migration, no new deps, no secrets, no routing changes.

## Evaluation

**Pros**
- Pure additive UI feature, narrowly scoped to the comic panel surface.
- No schema changes — bubble state lives in component state and the existing `comic_panels.dialogue` / `narration` columns (or in-memory only; will confirm during implementation).
- Doesn't touch any of the storyplan pages we've been iterating on.
- Closes two of the largest jenova-parity gaps.

**Cautions**
- Bubble positions/kinds aren't in the DB schema — if the new editor only persists to local state, edits will be lost on reload. Worth a quick look at `ComicPanels.tsx` save path during deploy.
- Need a typecheck pass after copying since three files swap in larger versions.

## Deployment plan

1. Copy the three new component files into `src/components/`.
2. Overwrite `src/components/ComicPanel.tsx`, `src/components/GraphicNovelPageLayout.tsx`, and `src/pages/ComicPanels.tsx` with the zip versions.
3. Let the harness typecheck/build; fix any import or type mismatch that surfaces.
4. Spot-check `/comic-panels/:draftId` in preview to confirm the bubble overlay renders and existing panels still load.
5. Report back what persists vs. what's local-only so you can decide whether to add a follow-up migration for `bubbles` JSON.

Nothing else from the zip (the inventory doc, lockfiles, vite timestamp files) needs to be deployed.