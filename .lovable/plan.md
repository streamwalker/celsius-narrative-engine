# Phase 4 — Polish & real AI

Three focused upgrades to finish the knowledge layer.

## 1. Wire the AI Explainer to Lovable AI

Today `AIExplainerWidget` returns canned matches. We'll keep that as a fallback and add a real backend.

**New edge function** — `supabase/functions/knowledge-explain/index.ts`
- Accepts `{ question, glossary, plain }`.
- Calls the Lovable AI Gateway (`google/gemini-3-flash-preview`) with two system messages:
  1. Behavior rules (answer only from glossary, no invented terms, plain or standard tone).
  2. A compact dump of the glossary entries the client sent.
- Surfaces 429 / 402 cleanly.
- Returns `{ answer }`. No streaming for the small widget — keeps code simple.

**Widget changes** — `src/components/knowledge/AIExplainerWidget.tsx`
- On submit, call the function via `supabase.functions.invoke('knowledge-explain', { body: { question, glossary, plain } })` where `glossary = getAllEntries()` projected to the lite shape.
- Honor the global Plain English toggle.
- Loading state + typing indicator.
- On error or empty answer, fall back to the existing `sampleAnswer()` so the widget keeps working offline.
- Surface 429 / 402 messages via toast.

No DB changes, no new secrets — `LOVABLE_API_KEY` is already provisioned.

## 2. ContextualExamples component

A small reusable block to attach example usages to any concept.

**New file** — `src/components/knowledge/ContextualExamples.tsx`
- Props: `{ termId?: string; title?: string; examples?: string[] }`.
- If `termId` is given and the entry has an `example`, prepend it.
- Renders as a quoted list with a left accent bar matching the design system.
- Exported from the barrel.

## 3. Accessibility polish on HighlightedTerm

Small but meaningful tweaks in `src/components/knowledge/HighlightedTerm.tsx`:
- Add `focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm` to the trigger so keyboard focus is visible.
- `aria-haspopup="dialog"` on the trigger; `role="note"` on the rich preview.
- Ensure mobile tap closes via outside click (Popover already does this — verify).
- Keep all colors via design tokens.

## Demo page touch-up

Add one `ContextualExamples` block to `/knowledge` so the new component is visible.

## Out of scope (deferred)

- Streaming responses (overkill for a Q&A widget).
- Persistence of chat history.
- Per-page glossary scoping (we send the full unified glossary; ~80 entries, well within context).

Approve to implement.
