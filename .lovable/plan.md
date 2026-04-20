

## Plan: Logo images for CoA & Episode 7 pages

The user wants visual consistency across all four storyplan pages. BA and Darker Ages already use logo images; CoA and Episode 7 still use text titles.

### Issue
No logos have been uploaded for these two pages. I need source images before I can wire them in.

### Options

**Option A — User uploads logos (recommended)**
User provides two images (one for CoA, one for EP7), I copy them to `src/assets/`, import them into `ChildrenOfAquarius.tsx` and `Episode7.tsx`, and replace the `<h1>` text with `<img>` tags using the same pattern as BA/Darker Ages:
```tsx
<img src={logo} alt="Children of Aquarius" className="mx-auto max-w-md w-full h-auto mb-2" />
```

**Option B — Generate placeholder logos via AI**
Use Lovable AI image generation (`google/gemini-3-pro-image-preview`) to create stylized logo treatments matching each storyplan's tone (cosmic/aquatic for CoA, sci-fi/military for EP7). User can swap them out later.

**Option C — Stylized text treatment**
Skip raster logos entirely; build CSS-styled text "logos" with custom fonts, glow, and layout that visually match the weight of the BA/DA image logos. No new assets needed.

### My recommendation
**Option A.** The BA and Darker Ages logos are clearly hand-crafted artwork — auto-generated images won't match that quality, and CSS text won't match that visual weight. Best to wait for real artwork.

### Action needed
Please either:
1. Upload the two logo images (PNG or JPEG), or
2. Tell me to proceed with Option B or C.

Once I have the assets (or your go-ahead on B/C), the wiring itself is ~10 lines per page and mirrors the BA/DA pattern exactly.

