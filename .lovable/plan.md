
# Celsius JARVIS Redesign — Build Plan

Port the uploaded `celsius-redesign-prototype.html` into the existing React/Tailwind app. Use the exact tokens, fonts, copy, structure, and behavior from the prototype. Keep all existing routes and existing app functionality intact — this is purely a presentation-layer reskin of the shell + landing page.

## What changes (scope)

1. **Design tokens & fonts** (`src/index.css`, `tailwind.config.ts`)
   - Replace Orbitron + magenta tokens with the prototype palette:
     - `--bg-0 #05050a`, `--bg-1 #08080c`, `--bg-2 #0d0d14`, `--bg-3 #14141e`
     - `--pink #f53d99`, `--pink-soft #ff8ec3`, `--cyan #6df7ff`, `--amber #ffb547`
     - `--good #4cffaf`, `--warn #ffc857`, text-0/1/2/3, line + line-strong
   - Convert each to HSL and wire as semantic shadcn tokens (`--background`, `--primary`, `--accent`, `--muted-foreground`, `--border`, sidebar tokens, etc.) so existing components keep theming.
   - Swap Google Fonts import to **Space Mono + Space Grotesk**. Body = Space Mono 14px. Display class = Space Grotesk (uppercase, letter-spacing 0.04–0.12em). Remove Orbitron.
   - Add reusable utilities: `.hud-grid` (fixed 48px grid with radial mask), `.hud-vignette`, `.corner-bracket` (4 variants tl/tr/bl/br), `.pulse-dot`, `.scan-sweep`, `.ticker`, `.btn-shimmer`. Keep all colors via HSL tokens.

2. **Telemetry bar** (new `src/components/Telemetry.tsx`)
   - Sticky top strip: live dot + "CELSIUS · ONLINE", marquee ticker with the exact prototype strings, version stamp `v1.9 · 2026-05-27 ·`. Uses the prototype's `@keyframes ticker` (40s linear).

3. **App shell** (`src/components/AppLayout.tsx`)
   - Render `<Telemetry />` above the shell.
   - Replace mobile top bar styling with the prototype `.mobile-bar` (brand mark + `≡ MENU` toggle).
   - Keep the existing sidebar slide-in behavior on mobile; on `lg` it's static.

4. **Sidebar / Command Bay** (`src/components/AppSidebar.tsx`)
   - Keep current `NAV_SECTIONS` (Workshop / Characters / Astralnaut Studios / Reference / Legal) and all existing `href`s — no link changes.
   - Brand block: 36×36 pink-bordered tile with rotating inner ring and `C°` glyph; "CELSIUS" + "Script → Graphic Novel" caption; dashed bottom border.
   - Group headers: tiny uppercase label, dashed rule treatment, with `◇` glyph right-aligned via `::after`.
   - Nav items: 12px Space Mono, lucide icons in `.ico` style; active state = pink gradient fill + 2px inset pink left bar + pink text; hover = faint pink bg.
   - Add a `status` field per item: `'live' | 'phase'` (extends the existing `NavItem` interface). Mapping uses the existing live/phase classification from `Index.tsx` TOOLS plus reasonable defaults (Home/Library/Script Formatter/Letter a Page = live; Narrative Engine, Panelcraft, Panelcraft 2 = phase; Characters/Studios/Reference items default to no dot, matching the prototype's behavior of only showing dots in Workshop).
   - Render right-aligned status dot: pulsing green for live, dim amber for phase.

5. **Index page redesign** (`src/pages/Index.tsx`)
   - **Hero (left column)**: eyebrow pill "° CELSIUS · WORKSHOP ONLINE" with pulsing pink dot; H1 Space Grotesk uppercase `Transform / screenplays into / graphic novels.` with `.glow` on the last line; body paragraph copy from prototype; CTA row — **primary "Initialize Workshop"** → `/script-formatter`, **ghost "Open Library"** → `/library`. Primary button uses the shimmer-on-hover pseudo-element.
   - **Hero (right column)**: new `<HudConsole />` component
     - Bordered card with 4 corner brackets (top-left + top-right via `::before`/`::after`, bottom corners via children) and pink glow shadow
     - Console header: `// LIVE TRANSFORM · DEMO` + 3 light dots (random strobe via interval)
     - Two panes side-by-side at ≥520px:
       - **Script pane**: streams the prototype's 5 Fountain lines (slug/action/character/dialogue/action) with staggered 0.45s type-in animation, loops every 8s
       - **Panel pane**: inline SVG (Neo-Atlantis rooftop scene exactly as in the prototype: sky gradient, moon, city silhouette, window lights, lone figure), scan-line sweep overlay (2.6s), speech bubble "They're here." popping in at 1.8s
       - Three ring meters under the panel (Coherence 85, Tone 66, Pacing 94) — SVG circles with pink stroke and dashoffset
   - **Tools section**: `// THE WORKSHOP` eyebrow + `Tools` H2 + `06 MODULES` count; dashed bottom rule
     - Six `<ToolCard />` instances, same 6 tools and same routes as today (Script Formatter, Narrative Engine, Character Builder, Library, Astralnaut Studios, Film School). Card has 4 corner brackets, cursor-follow radial pink glow (via `--mx`/`--my` CSS vars set on mousemove), live = green pulsing dot pill / phase = amber pill, lucide icon in pink-bordered tile, `Launch →` / `Preview →` / `Open →` affordance with arrow that translates on hover.
   - **Footer strip**: replace current footer with `CELSIUS · HEROLINC · WORKSHOP v1.9` / `WRITERS ONLINE · 1,284` / `SYS · NOMINAL · ●`. Keep the legal links row below it (Terms / Privacy / Cookies / Compliance) since the prototype omits them but we need them for compliance.

## What does NOT change
- All routes in `App.tsx`, all other pages, all edge functions, all Supabase code, all panelcraft / character / studio components.
- `AppSidebar` link list and `href`s — only visual treatment + status dots are added.
- Print styles, knowledge providers, cookie banner.

## File touch list
- edit `src/index.css` (tokens, fonts, utilities, animations)
- edit `tailwind.config.ts` (font families, any new color tokens if needed)
- edit `src/components/AppLayout.tsx` (mount Telemetry, mobile bar restyle)
- edit `src/components/AppSidebar.tsx` (Command Bay treatment + status dots)
- edit `src/pages/Index.tsx` (hero + tools + footer strip)
- new `src/components/jarvis/Telemetry.tsx`
- new `src/components/jarvis/HudConsole.tsx`
- new `src/components/jarvis/ToolCard.tsx`
- new `src/components/jarvis/CornerBrackets.tsx` (shared 4-corner overlay)

## Technical notes
- All colors written as HSL semantic tokens in `index.css`; component code uses Tailwind classes (`bg-background`, `text-primary`, etc.) plus a handful of custom utility classes for the JARVIS-specific effects (scan, ticker, hud-grid) — no hardcoded hex in `.tsx`.
- The streaming script demo and the strobe lights run inside `useEffect` with `setInterval`, cleared on unmount.
- Tool card cursor glow uses an `onMouseMove` handler that writes `--mx` / `--my` to `style`.
- Mobile viewport tested at 380px (matches prototype): hero collapses to single column, console grid collapses to single column under 520px.
- No new dependencies.

Once you approve, I'll switch to build mode and implement.
