
Same workflow as previous bundles (v1–v4). Read-only mode — need approval to switch to default to extract and write files.

## Plan: Incorporate `celsius-next_5.zip`

### Step 1 — Extract & diff
1. `lov-copy user-uploads://celsius-next_5.zip /tmp/celsius_v6.zip`
2. Unzip to `/tmp/celsius_v6/`
3. Diff against `/tmp/celsius_v5/` (last bundle, if still present) and current `src/` + `supabase/` to identify new/changed/removed files.

### Step 2 — Triage & port
- **Assets** → `public/assets/` or `src/assets/`
- **Pages/components** → port deltas, converting Next.js patterns (`next/link`, `next/image`, `'use client'`, `useRouter`) to React Router + `<img>`
- **Edge functions** → mirror to `supabase/functions/` and deploy
- **Migrations** → run only new ones
- **Dependencies** → install any new npm packages

### Step 3 — Wire & verify
- Update `src/App.tsx` routes & `AppSidebar.tsx` entries as needed
- Run `npx tsc --noEmit` to confirm clean build

### Conflict policy
**Merge intelligently** (same as v2–v4) — take new content/fields from upload, keep existing routing/imports/design-token wiring and any local fixes.

### Reporting back
Summary of: files added, files updated, new routes, new tables, new edge functions, new secrets needed (if any).
