## Goal

Add a "Letter a finished page" workflow: user uploads (1) a finished comic page image already laid out into panels, and (2) the matching script page text. The platform detects panels, maps script lines to the right panel, places speech/narration bubbles inside each panel, and points each bubble's tail at the correct character.

## New route

`/letter-page` — standalone tool, linked from the Comic Panels page and the sidebar. No draft required (works on a one-shot upload).

## UI flow

```text
┌──────────────────────────┬──────────────────────────────┐
│ 1. Upload artwork (PNG)  │ Live preview canvas:         │
│ 2. Paste script page     │  - artwork as background     │
│ 3. [Detect panels]       │  - detected panel rectangles │
│ 4. [Auto-letter]         │  - placed bubbles + tails    │
│ 5. Review / drag / edit  │  - draggable in PanelBubble  │
│ 6. [Export PNG]          │    Editor                    │
└──────────────────────────┴──────────────────────────────┘
```

Existing `PanelBubbleEditor` + `BubbleShape` components are reused for the review/edit/export step — only panel detection and AI-driven placement are new.

## How it works (technical)

### 1. Panel detection (`detect-comic-panels` edge function, new)
- Send the uploaded artwork to `google/gemini-2.5-pro` with a strict JSON-output prompt: "Return an array of panel bounding boxes as `{x, y, w, h}` percentages of the image, in reading order (top-to-bottom, left-to-right; right-to-left if user toggles manga mode)."
- Validate the JSON with Zod, clamp boxes to [0,1], sort by reading order.
- Return `{ panels: [{ id, x, y, w, h, order }] }`.
- Fallback: if AI returns nothing usable, default to a single full-page panel and let the user split manually (out of scope to build splitter now; just surface the rectangles for editing).

### 2. Character localization per panel (`detect-panel-speakers` edge function, new)
- For each detected panel, crop the image client-side (canvas) and send the crop + the script's character roster to `google/gemini-2.5-pro`.
- Prompt: "Given this panel and characters [Zeus, Astra, …], return for each visible character `{ name, head: {x, y} }` in panel-relative percentages (head = where a tail should point)."
- Returns `{ speakers: [{ name, x, y }] }` per panel.

### 3. Script-to-panel mapping (client, reusing `parseComicScript`)
- Run the existing parser on the pasted script. It already emits `{ panelNumber, narration, dialogue, characters }` per panel.
- Match parsed panels to detected panels by index (panel 1 → first detected box, etc.). If counts mismatch, show a one-row mapper UI letting the user drag script panels onto detected boxes.

### 4. Bubble placement (client, deterministic)
- For each (detected panel, parsed panel) pair:
  - One narration caption pinned to top-left of the panel.
  - One speech bubble per dialogue line, stacked vertically from top, sized to text length.
  - Tail anchor = the matched speaker's head from step 2; if speaker not found, no tail (caption-style).
  - Bubble kind chosen from script cues: `THINK:` → thought, `SHOUT:`/`!!` → shout, `(whisper)` → whisper, else speech.
- Output is a `BubblesByPanel` object compatible with the existing `PanelBubbleEditor`.

### 5. Review + export
- Render artwork in a container; overlay `PanelBubbleEditor` per detected panel rect.
- User drags, edits text, retargets tails.
- "Export PNG" uses `html-to-image` (new dep) to flatten artwork + bubbles to a single PNG download.

## Files

**New**
- `src/pages/LetterPage.tsx` — the upload + review UI.
- `src/lib/panel-detection.ts` — client helpers: image upload to base64, crop panels, call edge functions, mapping logic.
- `supabase/functions/detect-comic-panels/index.ts` — Gemini panel-detection.
- `supabase/functions/detect-panel-speakers/index.ts` — Gemini per-panel speaker localization.

**Modified**
- `src/App.tsx` — register `/letter-page` route.
- `src/components/AppSidebar.tsx` — add "Letter a Page" entry.
- `package.json` — add `html-to-image` (~10 KB).
- Optionally extend `PanelBubbleEditor` to accept an external panel rect (already accepts a child container, so likely no change).

## Out of scope (call out, don't build)
- Manual panel-rectangle drawing tool (we let the user nudge AI-detected boxes via simple drag handles in v1; full freehand splitter is a follow-up).
- Persistence — v1 is a one-shot session. Saving lettered pages back to a `comic_projects` row is a follow-up.
- Manga right-to-left reading order toggle — easy to add but skipped in v1.

## Risks
- Gemini panel-detection accuracy varies on dense layouts; the editable rectangles are the safety net.
- Speaker localization is the hardest step; if a character is off-panel or unclear, we fall back to a tail-less caption and the user retargets manually.
- Edge function token cost: one call for panel detection + N calls (one per panel) for speakers. Acceptable for a single page.

## Confirm before building
This is ~600–800 lines new code, two new edge functions, one new dep, no DB schema change. OK to proceed?