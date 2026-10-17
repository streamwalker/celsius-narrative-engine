# Celsius Story Architect — review increment

This is an additive upgrade to the existing Celsius platform, not a replacement application. The workspace is available at `/story-architect` and in the existing Workshop sidebar. The Narrative Engine, character tools, Panelcraft, Library, authentication, Supabase functions, and production story data are not replaced.

## What works

- Separate local projects with a Hero’s Journey, three-act, or freeform starting structure.
- Editable and reorderable beats with external drive (A), internal resistance (B), opposition intelligence (C), world pressure (W), decision, and consequence fields.
- Original stage-specific teaching prompts. Stages can be renamed, moved between acts, or deliberately omitted. The author, not an algorithm, sets review status.
- A world bible for geography, culture, history, factions, magic, technology, and cosmology. Each entry records its claim, limits, cost, source/scope, and draft/canon/rumor status.
- Stable-ID links between world entries and beats, plus scene cards linked to beats. Removing a beat retains its scenes and removes their obsolete links. Removing a world entry removes its links without deleting story notes.
- Scene creation copies the author’s notes without making an AI request or inventing new canon. Editing a scene title, summary, or purpose retains the rest of its original payload.
- Independent project branching by deep copy; validated legacy imports; full versioned JSON backups; readable Markdown briefs.
- Local checks for empty causal fields, missing references, provisional world knowledge, unstated limits/costs, and canon entries with matching titles but different descriptions. These are prompts for human review, not semantic contradiction detection or a story quality score.

## Data safety and compatibility

The new workspace writes only to `celsius-story-architect-v1`. It does not write to `narrative-engine-data`, `celsius-scenes-local`, other legacy scene keys, or cloud tables. “Copy local engine draft” reads the locally cached fields and creates a separate project; it deliberately does not guess which scene cache belongs to that draft.

Imports support the new `kind: celsius-story-architect`, `schemaVersion: 1` project format, a workspace recovery export, legacy flat string-field exports, and Supabase story rows containing `story_data` and optional `scene_data` or embedded `__scenes`. Complete scene payloads, source snapshots, and version-1 extension properties are retained. Imports receive new project IDs and never replace existing projects. Future schema versions are rejected instead of silently downgraded.

Limits: 5 MB per import/local workspace, 100 projects per local workspace, 250 beats, 500 world entries, 2,500 scene cards per project, and 100,000 characters per text field. Unsafe property names, malformed shapes, excessive nesting, and duplicate entity IDs are rejected. User content is rendered as text rather than injected HTML.

Corrupt storage is left untouched; edits run in a temporary in-memory workspace with a recovery warning. Failed or stale-tab saves pause saving and expose workspace export. Before-unload warnings protect unsaved recovery edits. The compare-and-set check and storage listener prevent many stale-tab overwrites, but localStorage is not transactional and does not guarantee safe simultaneous editing across tabs. Use one editing tab and export backups regularly.

Backups are plain-text JSON, not encrypted. They may contain story material and original source-row metadata. Treat them accordingly.

The Markdown brief is intentionally not a lossless backup. JSON is the round-trip format. These new backups should be imported into Story Architect, not the old Narrative Engine’s flat-field importer.

## Verification

The supplied revision was checked with:

```sh
npm test
node node_modules/typescript/bin/tsc -p tsconfig.app.json --noEmit
node node_modules/eslint/bin/eslint.js src/lib/architect/*.ts src/pages/StoryArchitect.tsx src/test/architect.test.ts src/test/StoryArchitect.test.tsx
npm run build
```

The suite includes the original 45 tests and 46 additional model/storage/component tests: **91 passing tests**. Desktop (1512 px) and mobile (390 px) DOM rendering and interaction smoke checks were performed in Chromium using the self-contained preview. The test browser could not navigate under its runtime policy, so those checks used a test-only in-memory storage fixture; real-origin browser persistence and live cloud services were not verified there. Storage round trips, quota errors, corrupt data recovery, and stale-tab protection are separately covered by automated tests. The distributed HTML preview does not include that fixture.

The build still reports existing ecosystem warnings concerning old Browserslist data, a Bluebird dependency using `eval`, and the large application bundle. This increment does not claim to resolve those.

## Review and release

Start in the new sidebar workspace. “Open an independent sample” loads *The Last Tide*, an original illustrative scenario explicitly marked as a sample—not canon for Battlefield: Atlantis, Children of Aquarius, or any existing project. Check editing, branch creation, world-to-beat links, scene creation, backup/reimport, and mobile navigation before merging.

This is a local-first preview. It does not add cloud sync, shared editing, automatic AI continuity analysis, provider billing, or new production AI endpoints. Existing features remain in their existing workspaces. No database migration or domain change is required by this increment.

## Next engineering priorities

1. Introduce a shared, versioned project repository for the legacy engine and this workspace; migrate with explicit backups and per-user access controls rather than copying localStorage into production implicitly.
2. Repair the legacy Narrative Engine’s scene-less JSON export, unchecked import path, custom-title overwrite on cloud save, and project-specific autosave identity. See `src/pages/NarrativeEngine.tsx`.
3. Reconcile episode indexing across scene generation, pacing validation, and backend analysis. The current helper skips falsy episode zero while backend scene summaries add one to stored episode indices. Add zero-/one-based boundary tests before changing existing plans.
4. Add evidence-linked AI suggestions behind explicit author actions and approval. Keep generated proposals separate from author-approved canon; provide a diff and rollback before applying changes.
5. Split the large bundle and simplify overlapping production modules only after regression coverage is in place.

## Framework attribution

The twelve-stage structure is Christopher Vogler’s adaptation of Joseph Campbell, described in *The Writer’s Journey*. The publisher’s primary reference is https://mwp.com/product/writers-journey-25th-anniversary-edition-mythic-structure-writers/ . The stage prompts and world-building questions in this increment are original. The act grouping follows the requested guide and remains editable; it is not a required universal arrangement or a test of literary quality.
