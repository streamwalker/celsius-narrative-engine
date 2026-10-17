# Celsius Story Architect — first increment

Route: `/story-architect`. The new sidebar entry and lazy-loaded route are the only changes to existing application code. The original Narrative Triad, Narrative Engine, character tools, scene generation, lettering, library, and story canon remain in place.

## Working features

- Editable 12-stage journey with A (external), B (internal), C (opposition), and world consequences for each beat.
- Editable act placement, accessible move-up/down controls, custom beats, and reversible omission. Freeform/three-act lens preserves all notes; it does not generate a different story automatically.
- World atlas: places, cultures, factions, history, science/magic, and ecology. Entries hold rules, costs, exceptions, author approval, and links to beats.
- Causal-chain prompts and a pressure curve based on the author's own 0–100 estimates. Neither field completion nor tension is presented as a quality score.
- A review desk with transparent, deterministic editorial questions and recorded-link checks. This is NOT semantic continuity analysis or AI prose evaluation.
- Multiple browser-local projects, visible save failures, cross-tab overwrite protection, guarded recovery, schema validation, and JSON import/export. Imports create new projects after review.
- Legacy import recognizes actual Narrative Engine keys and optional `__scenes` or `scene_data`. Original string fields and scene objects are retained in the new export. Legacy scene objects are not edited by this interface.
- A clearly labeled, original study sample, The Last Tide. It never auto-populates an author's existing project or canon.

## Storage and boundaries

`celsius-story-architect-v1` is separate from `narrative-engine-data` and the existing scene-cache keys. The current-engine-fields import reads that original draft key but does not modify it. It deliberately does not guess which separately cached scene set belongs to the draft.

Story Architect has no cloud synchronization in this increment. Data belongs to the browser profile and origin; private mode, clearing website data, a different domain, or a different browser can remove access. Export regularly. Corrupted or unsupported saved data is not overwritten automatically. Recovery first saves the on-disk content under a timestamped recovery key. If storage is unavailable or full, export the in-memory story before leaving.

The JSON story export is a versioned envelope with the complete project. The advanced saved-data export is a raw workspace recovery file for manual repair; it is not the standard per-story import format. Import limit: 5 MB. Workspace limits: 30 projects, 100 beats/project, 200 world entries/project, and 5,000 preserved legacy scenes/project.

The existing AI service is unchanged and is not automatically given new world/beat fields. A future integration should explicitly package author-approved canon, preserve evidence references, separate suggestions from saved facts, and show a diff before changing a draft. Do not equate the new deterministic checks with that future capability.

## Review and running

Use the repository's existing configuration and public client environment variables. Do not introduce private provider keys into Vite/browser code.

```sh
bun install --frozen-lockfile
bunx tsc --noEmit -p tsconfig.app.json
bunx vitest run
bun run build
bun run dev
```

Open `/story-architect`. The new module adds 26 unit/integration cases; the complete frontend suite has 71 passing tests at this increment. Tests cover legacy and new-format round trips, malformed imports, storage failure/conflicts, project switching, beat omission/reordering, world links, and import confirmation. Browser checks also exercised the standalone feature at desktop and 390-pixel mobile widths, JSON download/import, and the review desk. The isolated browser renderer used a Storage adapter; real browser-profile persistence and the production backend were not end-to-end tested.

The standalone downloadable HTML contains only this feature and its required client dependencies. It does not contain a copy of the backend, authentication, old tools, private keys, fonts, or the author's established story assets. Its original-engine links lead to an explanatory preview page rather than pretending those tools are included.

## Follow-on work (not implemented here)

Project-scoped cloud persistence and collaboration; authenticated, evidence-grounded AI critique; semantic timeline/canon validation; bidirectional scene/project integration; accessibility testing with screen readers; broader application code-splitting and an audited dependency update. The existing full build still reports large legacy chunks and old Browserslist data; those warnings are not hidden by this change.

## Narrative basis

The user supplied the 12-stage Hero's Journey/world-building outline. The stage prompts in `journey.ts` are original editorial wording. The labels follow the familiar Vogler adaptation of Campbell; they are an optional lens, not mandatory stages or a universal psychological model. Background reference: https://reedsy.com/blog/guide/story-structure/heros-journey/
