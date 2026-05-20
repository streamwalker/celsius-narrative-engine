## Goal

Ship a second variant of the Panelcraft tool ("Panelcraft 2") at its own route, with its own storage and its own sidebar entry directly beneath the existing Panelcraft link. The two tools run independently so you can compare the UI/UX.

## What's new in v2 vs current Panelcraft

The uploaded `panelcraft-2.jsx` adds three things on top of the editor we already shipped:

1. **Intake screen** — paste a prose treatment (or upload `.txt` / `.md` / `.docx`), pick a target page count (Auto / 22 / 32), optionally add title + theme, then generate a per-page breakdown (page number, R/L side, cliffhanger flag, title, summary). "Load example · Issue 2" still seeds the same demo content.
2. **Editor enhancements** — page list shows a per-page tension heat overlay; right rail adds a **Function Legend**; header adds **view source** (opens the original treatment in a modal) and **new issue** (returns to intake).
3. **View router + persistence** — `intake` ↔ `editor`, persisted to localStorage. Independent of the current Panelcraft so both tools keep separate state.

Everything else (panel functions, tone tags, line types, craft checks, tension graph, industry-format export) is identical to v1.

## Plan

### Routing & nav

- New route `/narrative-engine/panelcraft-2` → `pages/Panelcraft2.tsx`, wrapped in `AppLayout`.
- `AppSidebar`: add `{ href: "/narrative-engine/panelcraft-2", label: "Panelcraft 2", icon: LayoutGrid }` immediately after the existing Panelcraft entry in the Workshop section.
- Add an "Open Panelcraft 2" button next to the existing "Open Panelcraft" button on the Narrative Engine page header.

### Files to create

```
src/pages/Panelcraft2.tsx                              # App shell: intake|editor view router + persistence
src/components/panelcraft2/IntakeView.tsx              # Treatment paste/upload + generate UI
src/components/panelcraft2/EditorView.tsx              # 3-pane editor (header, pages list, editor, right rail)
src/components/panelcraft2/PageListItemV2.tsx         # Page list row with tension heat overlay
src/components/panelcraft2/FunctionLegend.tsx          # Function legend block for right rail
src/components/panelcraft2/SourceDialog.tsx            # Modal showing original treatment
src/lib/panelcraft2/generate.ts                        # Calls panelcraft-generate edge function, validates JSON
supabase/functions/panelcraft-generate/index.ts        # Edge function: treatment → per-page breakdown JSON (Lovable AI gateway)
```

### Files to reuse from existing Panelcraft

These are already generic enough — no fork needed:

- `src/lib/panelcraft/types.ts`, `constants.ts`, `checks.ts`, `export.ts`, `sample-issue.ts`
- `src/components/panelcraft/PanelCard.tsx`, `LineRow.tsx`, `PageEditor.tsx`, `StoryArcGraph.tsx`, `CraftPanel.tsx`, `ExportDialog.tsx`

### Files to edit

- `src/App.tsx` — register the new route.
- `src/components/AppSidebar.tsx` — add the Panelcraft 2 nav item.
- `src/pages/NarrativeEngine.tsx` — add the "Open Panelcraft 2" header button.

### Storage isolation

- localStorage key: `panelcraft2:state:v1` (separate from v1's `panelcraft:state:v1`).
- Layout/UI prefs use their own namespace too (`panelcraft2:layout:*`, `panelcraft2:ui:*`).
- This means Panelcraft and Panelcraft 2 keep independent state — you can have Issue 2 loaded in one and a new generated breakdown in the other.

### AI generation (Lovable AI, not direct Anthropic)

The uploaded prototype calls Anthropic directly from the client with no API key — that won't work and would leak a key. We'll route generation through an edge function that uses the Lovable AI gateway (same pattern as the existing `knowledge-explain` function), so no user setup is required.

- Edge function `panelcraft-generate` accepts `{ title, theme, treatment, targetPages }`, calls `google/gemini-2.5-pro` via the Lovable AI gateway with the system prompt from the prototype, parses + validates JSON, returns `{ title, theme, pages: [...] }` with empty `panels: []` arrays attached for editor compatibility.
- Handles 429 (rate limited) and 402 (credits exhausted) the same way `knowledge-explain` does.

### .docx upload

- Add `mammoth` dependency for client-side `.docx` → text extraction (same as the prototype). `.txt` / `.md` are read with `file.text()`. `.pdf` is left as a "not supported, paste text" notice, matching the prototype.

### View flow

- On mount: load `panelcraft2:state:v1`. If a valid breakdown exists → `editor` view; otherwise → `intake`.
- Intake "Load example · Issue 2" → seeds `makeIssue2()` from the existing sample-issue module, jumps to editor.
- Intake "Generate" → calls edge function, on success sets state + switches to editor.
- Editor "new issue" → confirms, clears storage, returns to intake.
- Editor "view source" → opens `SourceDialog` showing the stored `treatment` string.

### Editor differences from v1

The v2 editor keeps the same three-pane resizable layout we just built for v1, with these additions:

- `PageListItemV2` renders an amber tension gradient behind each row, intensity scaled by `tensionForPage(page)`.
- Right rail gets a third section: **Function Legend** — a list of all 9 panel functions with their color swatch, label, and tension weight, rendered from the existing `PANEL_FUNCTIONS` constant.
- Header gets **view source** + **new issue** buttons in addition to Reset / Export.

### Design system

- All new components use semantic Tailwind tokens (`bg-card`, `text-accent`, `border-border`, etc.) and shadcn primitives — no inline hex colors, no Google Fonts import. The amber palette in the prototype maps to our existing `--accent` token; warn red maps to `--destructive`; tension/function swatches inherit from `--muted-foreground` / `--accent`.

### Out of scope (for this pass)

- Supabase `story_projects` integration (still localStorage-only, like v1).
- Multi-issue management (only the most recent breakdown lives in storage).
- PDF export (the existing industry-format text export is reused).
- Wiring v2 into the Knowledge Layer or Glossary cross-links.

## Verification

- Visit `/narrative-engine/panelcraft-2` → intake view renders, "Load example" jumps to editor with 32 pages.
- Sidebar shows "Panelcraft" and "Panelcraft 2" stacked under Workshop; active highlighting works for each independently.
- Edits in Panelcraft 2 don't affect Panelcraft state (and vice versa) after refresh.
- Generate flow: paste short treatment → edge function returns valid JSON → editor loads. Errors surface inline on the intake screen.
- `.docx` upload populates the treatment textarea.
