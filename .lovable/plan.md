
# Incorporate Panelcraft into the Narrative Engine

Panelcraft is a page-by-page comic scripting workbench: per-page panel cards with `function` tags (SETUP, ESCALATE, TURN, REVEAL, CLIMAX…), tone-tagged dialogue/caption/SFX lines, automatic craft-check warnings (page-turn discipline, dialogue density, COMBAT-without-SFX, tonal monotony), a tension arc graph for the issue, and a one-click industry-format script export.

The uploaded file is a single-file React/JS prototype with inline styles and a `window.storage` persistence hook. We will refactor it into the project's stack (TypeScript, Tailwind semantic tokens, shadcn, Supabase) and surface it inside the Narrative Engine.

## Where it lives

- New route: `/narrative-engine/panelcraft` (rendered inside `AppLayout` like the rest of the engine).
- New sidebar entry under **Workshop**: "Panelcraft" (icon: `LayoutGrid`), placed next to "Narrative Engine".
- New button on the Narrative Engine page header: **"Open Panelcraft →"** so the two tools feel like one product.

## Files to create

1. **`src/lib/panelcraft/types.ts`** — `PanelFunction`, `LineType`, `ToneTag`, `PanelLine`, `Panel`, `Page`, `PanelcraftIssue` (`{ id, title, theme, pages }`).
2. **`src/lib/panelcraft/constants.ts`** — `PANEL_FUNCTIONS`, `FUNCTION_MAP`, `TONE_TAGS`, `LINE_TYPES`. Colors moved to semantic tokens (`--accent`, `--destructive`, `--muted-foreground`, etc.) instead of raw hex.
3. **`src/lib/panelcraft/checks.ts`** — pure `checksForPage(page)` and `tensionForPage(page)` ported verbatim from the prototype.
4. **`src/lib/panelcraft/export.ts`** — `exportPanelcraftScript(issue): string` extracted from `ExportView`.
5. **`src/lib/panelcraft/sample-issue.ts`** — `makeIssue2()` (the 32-page Children of Aquarius Issue 2 stub + worked examples for pages 1–3) preserved as a seed/template the user can load.
6. **`src/components/panelcraft/PageListItem.tsx`** — left-rail page list item with tension gradient bar, side badge (L/R), cliffhanger dot.
7. **`src/components/panelcraft/LineRow.tsx`** — one dialogue/caption/SFX line row (type select, character input for speech, text input, tone select, delete).
8. **`src/components/panelcraft/PanelCard.tsx`** — panel card with function selector, word count, description textarea, lines list, add-line buttons.
9. **`src/components/panelcraft/PageEditor.tsx`** — center column: page title, summary, cliffhanger toggle (R-pages only), panels, "+ Add Panel".
10. **`src/components/panelcraft/StoryArcGraph.tsx`** — right-rail SVG tension graph (clickable nodes, current-page marker, cliffhanger dots).
11. **`src/components/panelcraft/CraftPanel.tsx`** — right-rail issue list (warn vs note styling).
12. **`src/components/panelcraft/ExportDialog.tsx`** — shadcn `Dialog` wrapping a `<pre>` of the formatted script with Copy and Download buttons.
13. **`src/pages/Panelcraft.tsx`** — the page composition: header (project title input, save indicator, Reset, Export, Back to Narrative Engine), three-column layout (page list / editor / arc+craft). Wrapped in `AppLayout`.

## Files to edit

- **`src/App.tsx`** — add `<Route path="/narrative-engine/panelcraft" element={<Panelcraft />} />` and the import.
- **`src/components/AppSidebar.tsx`** — add `{ href: "/narrative-engine/panelcraft", label: "Panelcraft", icon: LayoutGrid }` in the Workshop section right after Narrative Engine.
- **`src/pages/NarrativeEngine.tsx`** — add a small "Open Panelcraft" `Button` (variant `outline`, icon `LayoutGrid`) in the existing header action row, navigating to `/narrative-engine/panelcraft`. No other changes to engine logic.

## Persistence

Panelcraft uses localStorage (key `panelcraft:state:v1`) for autosave, matching the prototype and the engine's existing `narrative-engine-data` pattern. Debounced 600ms save with idle/saving/saved indicator. Reset button reloads `makeIssue2()` after confirm. (No DB schema changes in this phase — projects table integration can come later if requested; out of scope here.)

## Design system compliance

- Replace every inline hex (`#0a0e14`, `#e8a83a`, `#e94f37`, `#161b22`, etc.) with semantic Tailwind tokens already in `index.css` / `tailwind.config.ts`: `bg-background`, `text-foreground`, `text-accent`, `text-destructive`, `border-border`, `bg-muted`, etc. Function-tag colors become a small theme map using HSL CSS variables (`hsl(var(--accent))` for ESCALATE/TURN, `hsl(var(--destructive))` for REVEAL/CLIMAX, `hsl(var(--muted-foreground))` for SETUP/BEAT).
- Use shadcn `Button`, `Input`, `Textarea`, `Select`, `Dialog`, `Badge`, `Tooltip`, `ScrollArea` instead of raw HTML elements with inline styles.
- Use `lucide-react` icons (`LayoutGrid`, `Plus`, `Trash2`, `Download`, `Copy`, `RotateCcw`) — drop the Unicode `×` / `●` glyphs.
- Drop the prototype's inline `<style>` Google-Fonts import; the app already loads fonts globally.

## Functional fidelity (preserved exactly)

- All 9 panel functions with tension weights 1–9.
- All 16 tone tags.
- All 6 line types (DIALOGUE / CAPTION / THOUGHT / WHISPER / SHOUT / SFX).
- Craft checks: R-page cliffhanger must end on TURN/REVEAL/CLIMAX; 1 panel = splash warning; ≥8 panels = density warn; per-panel tonal monotony info; >25 / >35 words density notes; COMBAT without SFX info; empty description info.
- Tension graph: average of panel tensions per page, click to navigate, current-page marker line, red dots for R-page cliffhangers.
- Export format: `PAGE ONE (THREE PANELS)`, `[Title — CLIFFHANGER]`, panel description block, `CHARACTER (thought) (tone)` blocks, SFX/CAPTION lines, blank lines between panels — bit-for-bit the same output as the prototype.
- Issue 2 seed data (32 stubbed pages + 3 worked examples) preserved verbatim.

## Out of scope (call out for the user)

- Saving Panelcraft issues into the Supabase `story_projects` table alongside Narrative Engine projects.
- AI assistance for panel descriptions / craft suggestions.
- PDF export.
- Multi-issue management UI (only one issue lives in localStorage in this phase, same as the prototype).

Happy to fold any of those in as a follow-up phase once the port is in.
