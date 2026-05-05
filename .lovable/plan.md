# Analyzing celsius-comic-creator-2.zip

## What's in the zip

The zip is a full project snapshot (`celsius-narrative-engine-main/`) that is **older than your current project**. Comparing every file:

**Files only in the zip (new):**
- `src/test/comic-bubbles.test.ts` — a vitest suite for the bubble model

**Files only in your live project (zip is missing them):**
- `src/components/PanelBoxEditor.tsx` (manual panel drawing)
- `src/lib/lettering-library.ts` (Supabase persistence layer)
- `src/pages/LetterPage.tsx` (the entire Letter-a-Page workflow)
- `src/pages/AdminEmailLogs.tsx` (email admin dashboard)
- `src/pages/Unsubscribe.tsx` (transactional email unsubscribe)

**Files that exist in both but the zip version is older / smaller:**
| File | Zip lines | Project lines | What's missing in the zip |
|---|---|---|---|
| `src/App.tsx` | 77 | 83 | `/letter-page`, `/admin/email-logs`, `/unsubscribe` routes |
| `src/components/AppSidebar.tsx` | 146 | 148 | Letter-a-Page nav entry |
| `src/components/AuthModal.tsx` | 178 | 333 | Inline confirmation-status alert + manual resend button |
| `src/components/PanelBubbleEditor.tsx` | 460 | 516 | Lock toggle + per-bubble Tail dropdown |
| `src/lib/comic-bubbles.ts` | 210 | 223 | `locked` and `tailTarget` fields |
| `src/lib/comic-panel-parser.ts` | 165 | 194 | Multi-dialogue-per-panel parsing |
| `supabase/.../types.ts` | — | — | Auto-generated; never hand-edited |

## Conclusion

Importing the zip's source files would **regress recent features** (lettering workflow, multi-dialogue, bubble locking, multi-mapping tail targets, manual resend, admin logs, etc.). I should not overwrite anything.

The only genuinely new artifact is the unit-test file, which still matches the public API of the current `comic-bubbles.ts` (it imports `buildSpeakerRoster`, `clamp01`, `clampBubbleBox`, `createBubble`, `loadBubblesForDraft`, `saveBubblesForDraft`, `seedBubblesFromScript`, `speakerIdFromName`, `SPEAKER_PALETTE` — all still exported).

## Plan

1. Add `src/test/comic-bubbles.test.ts` exactly as shipped in the zip.
2. Do **not** touch any other file from the zip — they would undo recent work.
3. After the test runs once, fix any small assertion drift if the current implementation has slightly different defaults (e.g. minimum bubble size thresholds). I'll only adjust the test, never weaken the live code.

## What I will NOT do (and why)

- Overwrite `AuthModal.tsx`, `PanelBubbleEditor.tsx`, `comic-bubbles.ts`, `comic-panel-parser.ts`, `App.tsx`, `AppSidebar.tsx` — the zip versions are pre-regression.
- Touch `src/integrations/supabase/types.ts` — auto-generated.
- Re-import the zip's `supabase/functions/*` — the live edge functions are newer (e.g., `letter-page-analyze`, `process-email-queue`, `auth-email-hook`, `retry-signup-confirmations`, `send-transactional-email`, etc. — none of which exist in the zip).

If you actually wanted a specific feature from the zip ported in, tell me which one and I'll cherry-pick it instead.
