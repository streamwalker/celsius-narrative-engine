
## Plan: Incorporate the new `celsius-next_1.zip` into the build

### Why I need approval
The uploaded file is a binary zip in the `user-uploads://` virtual namespace. To unzip it I need `lov-copy` + shell `unzip`, which require default (write) mode. Once approved, here's exactly what I'll do.

### Step 1 — Extract and diff
1. `lov-copy user-uploads://celsius-next_1.zip /tmp/celsius_v2.zip`
2. Unzip to `/tmp/celsius_v2/`
3. Diff against the previously extracted `/tmp/celsius/celsius-next/` to identify:
   - New files (pages, components, edge functions, assets, migrations)
   - Modified files (changed source, updated copy, new fields)
   - Removed files

### Step 2 — Triage changes into buckets
- **Assets** (images in `public/assets/`) → copy into `public/assets/` so existing pages render (e.g. `ba-carlo.jpg` and other studio art)
- **Source code changes** (pages/components/lib) → port the deltas into our Vite tree, converting any Next.js patterns (`next/link`, `next/image`, `'use client'`, route handlers) to React Router / `<img>` equivalents
- **Edge functions** (`supabase/functions/*`) → mirror into our `supabase/functions/` so they auto-deploy
- **Migrations / schema changes** → run a new migration if the DB shape changed (new tables, columns, RLS)
- **Config** (env keys, dependencies in package.json) → add any missing npm packages, request secrets via `add_secret` if new API keys are needed

### Step 3 — Wire & verify
- Add any new routes to `src/App.tsx`
- Add new sidebar entries to `AppSidebar.tsx` if applicable
- Run `tsc --noEmit` to catch type errors
- Report a summary of: files added, files updated, new routes, new tables, new secrets needed

### What I will NOT do without asking
- Overwrite already-customized pages (Index, ScriptFormatter, AppSidebar) blindly — if the new zip has conflicting edits, I'll surface them and ask which version wins
- Add new paid third-party services or secrets without confirming with you first
- Remove any existing routes/pages even if absent from the new zip (treat as additive unless you say otherwise)

### Open question for after extraction
Once I see the diff, if there are conflicts on already-customized files I'll ask: keep mine, take theirs, or merge.

<lov-actions>
<lov-suggestion message="Approved — extract the new zip, diff against the existing build, port over all new/changed files, copy assets, deploy any new edge functions, run any new migrations, and verify the build compiles. For conflicts on already-customized files, prefer the newer uploaded version.">Approve — prefer uploaded version on conflicts</lov-suggestion>
<lov-suggestion message="Approved — extract and diff, but for any file that conflicts with my existing customizations, keep my current version and just show me the diff so I can decide.">Approve — keep mine on conflicts</lov-suggestion>
<lov-suggestion message="Just extract the zip and show me a summary of what's new/changed vs the current build before porting anything.">Extract and show diff first</lov-suggestion>
</lov-actions>
