
Same workflow as v1–v5. Read-only mode, need approval to switch to default.

## Plan: Incorporate `celsius-next_6.zip`

### Step 1 — Extract & diff
1. Copy upload to `/tmp/celsius_v6.zip` and unzip to `/tmp/celsius_v6/`
2. Diff against current `src/` and `supabase/` to identify new/changed/removed files

### Step 2 — Triage & port
- **Assets** → `src/assets/` (imported) or `public/assets/` (static)
- **Pages/components** → port deltas, converting Next.js patterns (`'use client'`, `next/link`, `next/image`, `useRouter`) to React Router + `<img>`
- **Edge functions** → mirror to `supabase/functions/` and deploy
- **Migrations** → run only new ones via migration tool
- **Dependencies** → install any new npm packages

### Step 3 — Wire & verify
- Update `src/App.tsx` routes and `AppSidebar.tsx` entries as needed
- Run `npx tsc --noEmit` and `vite build` to confirm clean build

### Conflict policy
Merge intelligently — take new content/fields from upload, keep existing routing/imports/design-token wiring and prior local fixes (e.g. `LegalFooter` casing, `__scenes` story_data workaround).

### Reporting back
Summary of: files added, files updated, new routes, new tables, new edge functions, new secrets needed.
