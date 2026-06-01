# iOS 26 SwiftUI Port — Handoff Package

Goal: produce a single zip in `/mnt/documents/celsius-ios-port.zip` that gives Claude Code everything it needs to rebuild Celsius as a native iOS 26 SwiftUI app with full feature parity, reusing the existing Lovable Cloud (Supabase) backend.

## What goes in the zip

```text
celsius-ios-port/
├── CLAUDE.md                      # master prompt + build order for Claude Code
├── README.md                      # human-facing overview
├── spec/
│   ├── 00-overview.md             # product, audience, design language
│   ├── 01-architecture.md         # SwiftUI app target, modules, packages
│   ├── 02-design-system.md        # Liquid Glass mapping of index.css tokens
│   ├── 03-navigation.md           # Tab + NavigationStack map of all 27 pages
│   ├── 04-features/               # one .md per feature area
│   │   ├── script-formatter.md
│   │   ├── panelcraft.md
│   │   ├── panelcraft2.md
│   │   ├── characters.md
│   │   ├── library.md
│   │   ├── narrative-engine.md
│   │   ├── letter-page.md
│   │   ├── astralnaut-studios.md
│   │   ├── knowledge-layer.md
│   │   ├── glossary-shakespeare-filmschool.md
│   │   ├── legal-pages.md
│   │   └── admin-security.md
│   ├── 05-backend-contract.md     # Supabase URL, anon key, REST + RPC usage
│   ├── 06-edge-functions.md       # all 35 functions: inputs/outputs/auth
│   ├── 07-database-schema.sql     # full public schema dump
│   ├── 08-rls-and-roles.md        # has_role / has_project_access / project_role
│   ├── 09-storage.md              # character-portraits (public), lettering-pages (private)
│   ├── 10-auth.md                 # email+password, Google, Apple, HIBP
│   ├── 11-ios26-features.md       # Liquid Glass, NavigationStack, Observation, SwiftData
│   └── 12-testing.md              # mirrors of existing vitest/deno tests
├── reference-web/                 # read-only snapshot of current web app
│   ├── src/                       # full src/ tree
│   ├── supabase/                  # config.toml, migrations/, functions/
│   ├── package.json
│   └── tailwind.config.ts
├── assets/
│   ├── screenshots/               # captured preview screenshots per route
│   └── palette.json               # HSL tokens from index.css
└── swift-skeleton/                # optional starter Xcode project layout
    ├── Package.swift              # SPM with supabase-swift dependency
    ├── CelsiusApp.swift
    ├── DesignSystem/
    ├── Networking/SupabaseClient.swift
    ├── Features/                  # empty folders mirroring spec/04-features
    └── Resources/Assets.xcassets
```

## Scope confirmed

- Full parity: all 27 pages and 35 edge functions
- Backend: reuse Lovable Cloud via supabase-swift SDK (URL + anon key embedded; auth required for protected functions)
- iOS 26 target: Liquid Glass + standard SwiftUI (NavigationStack, `@Observable`, SwiftData for local cache, async/await)
- Output: zip in `/mnt/documents/`

## Build order (encoded in CLAUDE.md for Claude Code)

1. Bootstrap Xcode project + SPM deps (supabase-swift, swift-markdown-ui)
2. Design system: port HSL tokens from `src/index.css` to a `Theme` with Liquid Glass materials; map Space Grotesk / Space Mono
3. Auth shell: email+password, Google, Apple via Supabase
4. Tab navigation matching sidebar sections (Workshop, Characters, Astralnaut Studios, Reference, Legal)
5. Features in this order, each as its own SwiftUI module:
   Library → Script Formatter → Characters/Builder → Panelcraft → Panelcraft 2 → Narrative Engine → Letter a Page → Astralnaut Studios → Knowledge/Glossary/Shakespeare/Film School → Legal → Admin (Email Logs, Security Summary)
6. Edge function client wrappers (typed Swift structs per function)
7. Realtime subscriptions for collaborator-enabled tables
8. Tests: port `extractJson` and `letter-page-analyze` fixtures into Swift unit tests

## Technical details

- **Backend contract**: hardcode `SUPABASE_URL=https://jhtbircnacbdbixfzzkq.supabase.co` and the publishable anon key. All edge functions now require JWT (per recent security work) except auth/email webhooks — the spec lists per-function `verify_jwt` from `supabase/config.toml`.
- **Schema dump**: generated via `pg_dump --schema-only --schema=public` and committed as `07-database-schema.sql`; 20 tables listed (comic_projects/pages/panels, project_collaborators, story_projects, lettering_projects, user_roles, user_preferences, etc.).
- **Storage**: `character-portraits` is public (read via `getPublicUrl`, writes restricted to `{user_id}/` prefix); `lettering-pages` is private.
- **Design tokens**: pink primary `hsl(327 90% 60%)`, cyan accent `hsl(184 100% 71%)`, layered dark bg; mapped to SwiftUI `Color` + `.glassEffect()` materials and SF Pro fallbacks for Space Grotesk/Mono.
- **Knowledge layer**: 20+ components (GlossaryDrawer, HighlightedTerm, AIExplainerWidget, etc.) — spec describes the contract; SwiftUI implementations use sheets + popovers.
- **Panelcraft canvas**: ported to SwiftUI Canvas + drag gestures; types in `src/lib/panelcraft/types.ts` become Swift structs in `spec/04-features/panelcraft.md`.
- **Screenshots**: captured headlessly for each route into `assets/screenshots/` so Claude Code has visual ground truth.

## Out of scope

- No live rebuild — this task only produces the handoff package.
- No changes to the existing web app codebase.
- No new backend resources; the iOS app talks to the existing project.

## Deliverable

`<presentation-artifact path="celsius-ios-port.zip" mime_type="application/zip"></presentation-artifact>` once built, plus a short summary of what's inside.
