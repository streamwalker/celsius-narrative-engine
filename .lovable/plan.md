## Add "Content Outline (Feb 2019)" to /darker-ages

The Feb 2019 content outline (Season One: "The Darkest Dawn") is **not** currently on the page. The closest existing section is the "Story Plan — Three-Act / Eight-Sequence Breakdown", which is a different, later draft (Maven/Shinobu/Titus + Corbin Rothchylde nexus quest). The Feb 2019 outline features a different cast (Maven, Shinobu, Will/Ser Will, Owen, Estelle, Tiger) and structure, so it should live as its own section.

### Plan

1. **Create** `src/components/storyplans/DarkerAgesContentOutlineFeb2019.tsx`
   - Follows the exact pattern of `DarkerAgesStoryPlan.tsx` (uses `PageSection`, `Heading`, `Pre` from `story-page-helpers`).
   - `id="da-content-outline-feb2019"`, title `Content Outline (Feb 2019) — Season One: "The Darkest Dawn"`.
   - Sections rendered as `Heading` + `Pre` blocks, preserving the user's text verbatim:
     - Top notes (central character / midpoint motivation)
     - Act 1 — SQ1-A: Intro / Status Quo (A, B, C, D, D.1, D.2)
     - Act 1 — SQ1-B: Inciting Incident
     - Act 1 — SQ2-A: Big Event
     - Act 1 — SQ2-B: Champion unleashed
     - Act 2 — SQ3-A: First Obstacle
     - Act 2 — SQ3-B: Baylor / Blood of Ne'vam
     - Act 2 — SQ3-C: Opposition closes in
     - Act 2 — SQ4: Midpoint Culmination
     - Act 2 — SQ5: All Is Lost
     - Act 2 — SQ6: Main Culmination
     - Act 3 — SQ7: Climax & Twist
     - Act 3 — SQ8: Resolution
     - Act 3 — SQ8A: Denouement
     - Alternate Opening
     - Character Flaws / Naming notes (Shin = Natsume Obunaga)

2. **Edit** `src/pages/DarkerAges.tsx`
   - Import the new component.
   - Add a new entry to `darkerAgesSections` (placed just before `da-story-plan` so it reads chronologically as an earlier draft):
     `{ id: "da-content-outline-feb2019", label: 'Content Outline (Feb 2019) — Season One: "The Darkest Dawn"' }`
   - Add a matching `pageContent` search-keyword entry (Maven Shinobu Will Owen Estelle Tiger Wraiths Baylor Ne'vam Omagaia Alessandra Dark Queen Champion Hunter Dyson Sphere etc.).
   - Render `{visibleIds.has("da-content-outline-feb2019") && <DarkerAgesContentOutlineFeb2019 />}` directly above the Story Plan render.

### Out of scope
- No changes to glossary, knowledge layer, or other story pages.
- No reformatting of existing sections.
- No new design tokens — reuses existing `PageSection`/`Heading`/`Pre` styling.
