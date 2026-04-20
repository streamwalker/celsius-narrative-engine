

## Plan: Replace text titles with logo images

### Step 1 — Add assets
Copy the two uploaded images into `src/assets/`:
- `user-uploads://IMG_4075.jpeg` → `src/assets/battlefield-atlantis-logo.jpeg`
- `user-uploads://93FD5E5B-96BA-410E-84BA-FBC917D16F50.png` → `src/assets/darker-ages-logo.png`

### Step 2 — Wire into pages
- **`src/pages/BattlefieldAtlantis.tsx`**: import the logo, replace the H1 text "Battlefield: Atlantis" (or equivalent hero title) with an `<img>` using the imported asset. Keep the original heading text in `alt` for a11y/SEO. Constrain with `max-w-` + `mx-auto` so it scales on mobile.
- **`src/pages/DarkerAges.tsx`**: same treatment with the Darker Ages logo.

### Step 3 — Verify
Confirm both pages render the logo where the text title was, with no layout breakage on the 1050px viewport or mobile.

### Notes
- Need to view both page files first to find the exact title element and surrounding layout (subtitle, badges, buttons).
- Use ES6 imports from `@/assets/...` per project convention.
- Keep any existing subtitle / metadata directly under the new logo image.

