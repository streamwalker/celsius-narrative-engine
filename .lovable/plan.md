
The user uploaded a third zip (`celsius-next_2.zip`). Same workflow as before: extract, diff against current build, port deltas. I'm in read-only mode so I can't unzip — need approval to switch to default mode.

## Plan: Incorporate `celsius-next_2.zip`

### Step 1 — Extract & diff
1. `lov-copy user-uploads://celsius-next_2.zip /tmp/celsius_v3.zip`
2. Unzip to `/tmp/celsius_v3/`
3. Diff against `/tmp/celsius_v2/` (previous bundle) and current `src/`, `supabase/` to identify new/changed/removed files.

### Step 2 — Triage & port
- **Assets** → copy to `public/assets/`
- **Pages/components** → port deltas, converting Next.js patterns (`next/link`, `next/image`, `'use client'`, `useRouter`) to React Router + `<img>`
- **Edge functions** → mirror to `supabase/functions/`
- **Migrations** → run only the new ones (skip already-applied schema)
- **Dependencies** → install any new npm packages

### Step 3 — Wire & verify
- Update `src/App.tsx` routes & `AppSidebar.tsx` entries as needed
- Run `npx tsc --noEmit` to verify build

### Conflict policy
Same as last time: **merge intelligently** — take new content/fields from upload, keep existing routing/imports/design-token wiring.

### Reporting back
Summary of: files added, files updated, new routes, new tables, new edge functions, new secrets needed (if any).
