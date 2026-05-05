I’ll make two coordinated fixes:

1. Add focused tests for the `letter-page-analyze` panel cleanup
   - Extract the panel normalization/filtering logic from `supabase/functions/letter-page-analyze/index.ts` into a small exported helper, so it can be tested without calling the AI service.
   - Add tests covering the exact regression class:
     - paper-thin horizontal strips are discarded;
     - extreme aspect-ratio boxes are discarded;
     - near-duplicate overlapping strips/boxes are removed;
     - clean panels 2 and 3 are preserved and re-indexed in reading order.
   - Include a fixture resembling the current bad AI output plus correct panel 2/3 boxes, so the test fails if those strips come back.

2. Wire the tests into CI
   - Update the existing GitHub Actions test step to run both:
     - `src/test/comic-bubbles.test.ts`
     - the new letter-page analyze cleanup test
   - Keep it as a PR/push gate so future changes can’t reintroduce paper-thin overlapping detections.

3. Correct the “Can’t see anything” canvas issue on `/letter-page`
   - The response in the network log now returns four panels, including clean panel 2/3/4 boxes, but the visible page is mostly covered by opaque bubble-editor placeholder backgrounds inside each detected panel.
   - Update the letter-page overlay use of `PanelBubbleEditor` so it renders bubbles transparently over the uploaded full-page artwork instead of painting each panel with the “No image yet — generate the panel first.” placeholder.
   - This should make the artwork visible underneath all panels while keeping bubbles, tails, target badges, and panel outlines interactive.

Technical notes:
- No database changes are needed.
- No AI call is needed for the unit tests; the tests will exercise deterministic cleanup code only.
- I’ll preserve the current full-page uploaded image behavior and only adjust the overlay/background behavior for letter-page usage.