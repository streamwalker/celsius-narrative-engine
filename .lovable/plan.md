

## Recommendation: **(a) Wire them in**

Both functions are already built, tested-quality code that solve real problems your app has. Deleting them throws away working AI infrastructure; wiring them costs ~1 small UI change each.

### Why wire, not delete

**`analyze-character`** — Takes a reference image, returns structured character data (name, physical description, clothing, distinguishing features, color palette, age, confidence). This is a perfect fit for `character-import-dialog.tsx` and `character-profile-editor.tsx`, which already handle character image uploads but require the user to type every field manually. One button ("Auto-fill from image") removes 5 minutes of data entry per character.

**`check-consistency`** — Takes a generated panel + reference images, returns per-character match scores and specific inconsistencies ("hair color wrong", "missing scar"). This is exactly the QA gap in `ComicPanel.tsx` / `ComicPanels.tsx` — right now there's no way to know if a generated panel actually matches the character refs. This function closes that loop.

**Codebase fit** — You already have `character-consistency-model.ts`, `character-importers.ts`, and a whole reference-image pipeline (`generate-character-reference`). These two functions complete that system rather than duplicating it.

**Cost of deleting** — You lose ~400 lines of working edge function code plus the LLM prompts (which are non-trivial to rewrite). If you ever want either feature later, it's a much bigger lift to recreate from scratch than to wire up now.

**Cost of wiring** — One button + one result panel per function. Maybe 150 lines of UI total.

### If you want to wire them, the plan would be

1. **`analyze-character`** → Add "Auto-fill from image" button to `character-import-dialog.tsx`. On click: send the uploaded image, populate name/description/clothing/features fields with the result, let user edit before saving.

2. **`check-consistency`** → Add "Check consistency" button to `ComicPanel.tsx` panel actions. On click: send the panel image + selected character reference images, show a result drawer with overall score, per-character match scores, and a list of specific issues.

### When deleting would make sense

Only if you've decided the Character Builder is feature-frozen and you're optimizing for a minimal backend surface (fewer functions to maintain, audit, monitor). Given you just *added* the CoA creator and are actively expanding the character system, that's clearly not the case.

**My vote: wire them.** Want me to proceed with the wiring plan above?

