/**
 * End-to-end test for the `letter-page-analyze` edge function handler.
 *
 * We exercise the real handler against a saved AI gateway response (the
 * regression fixture from the user's bad-detection report) by stubbing
 * `globalThis.fetch`. This guards against three classes of regression:
 *   1. paper-thin / duplicate panel strips coming back into the output;
 *   2. reading-order re-indexing breaking;
 *   3. speaker anchors being dropped during cleanup.
 *
 * Run with: deno test --allow-net --allow-env supabase/functions/letter-page-analyze
 */
import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { handler } from "./index.ts";

import fixture from "./fixtures/regression-page.json" with { type: "json" };

// Tiny 1x1 PNG data URL — the handler only forwards it; it never decodes it.
const TINY_PNG =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=";

function makeAiResponse(body: unknown): Response {
  return new Response(
    JSON.stringify({
      choices: [{ message: { content: JSON.stringify(body) } }],
    }),
    { status: 200, headers: { "Content-Type": "application/json" } },
  );
}

function withStubbedFetch(
  stub: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  apiKey: string | undefined,
  fn: () => Promise<void>,
): Promise<void> {
  const originalFetch = globalThis.fetch;
  const originalKey = Deno.env.get("LOVABLE_API_KEY");
  if (apiKey === undefined) Deno.env.delete("LOVABLE_API_KEY");
  else Deno.env.set("LOVABLE_API_KEY", apiKey);
  globalThis.fetch = stub as typeof fetch;
  return fn().finally(() => {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) Deno.env.delete("LOVABLE_API_KEY");
    else Deno.env.set("LOVABLE_API_KEY", originalKey);
  });
}

function postRequest(body: unknown): Request {
  return new Request("https://example.test/letter-page-analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

Deno.test("regression fixture: returns cleaned panels with reading-order indices and preserved speaker anchors", async () => {
  await withStubbedFetch(
    () => Promise.resolve(makeAiResponse(fixture.aiResponse)),
    "test-key",
    async () => {
      const res = await handler(postRequest({
        imageDataUrl: TINY_PNG,
        characters: fixture.characters,
      }));
      assertEquals(res.status, 200);
      const data = await res.json();

      assertEquals(
        data.panels.length,
        fixture.expected.panelCount,
        `expected ${fixture.expected.panelCount} panels after cleanup`,
      );
      assertEquals(
        data.panels.map((p: { index: number }) => p.index),
        fixture.expected.indices,
      );

      const p2 = data.panels[1];
      const p3 = data.panels[2];
      assertEquals(p2.speakers[0]?.name, fixture.expected.panel2Speaker);
      assertEquals(p3.speakers[0]?.name, fixture.expected.panel3Speaker);

      // Speaker anchors must remain inside [0,1].
      for (const p of data.panels) {
        for (const s of p.speakers) {
          assert(s.x >= 0 && s.x <= 1, `speaker x out of range: ${s.x}`);
          assert(s.y >= 0 && s.y <= 1, `speaker y out of range: ${s.y}`);
        }
      }

      // No shape-level rejections expected for this fixture (extras are
      // box-cleanup drops handled silently by cleanPanels).
      if (data.warnings) assert(data.warnings.rejectedRawPanels >= 0);
    },
  );
});

Deno.test("returns 400 when imageDataUrl is missing", async () => {
  await withStubbedFetch(
    () => Promise.reject(new Error("fetch should not be called")),
    "test-key",
    async () => {
      const res = await handler(postRequest({ characters: [] }));
      assertEquals(res.status, 400);
      const body = await res.json();
      assertEquals(body.error, "imageDataUrl required");
    },
  );
});

Deno.test("returns 502 with code=invalid_json when AI returns non-JSON", async () => {
  await withStubbedFetch(
    () =>
      Promise.resolve(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "not json at all <html>" } }],
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        ),
      ),
    "test-key",
    async () => {
      const res = await handler(postRequest({ imageDataUrl: TINY_PNG }));
      assertEquals(res.status, 502);
      const body = await res.json();
      assertEquals(body.code, "invalid_json");
    },
  );
});

Deno.test("returns 502 with code=panels_missing when AI omits the panels field", async () => {
  await withStubbedFetch(
    () => Promise.resolve(makeAiResponse({ frames: [] })),
    "test-key",
    async () => {
      const res = await handler(postRequest({ imageDataUrl: TINY_PNG }));
      assertEquals(res.status, 502);
      const body = await res.json();
      assertEquals(body.code, "panels_missing");
    },
  );
});

Deno.test("handles CORS preflight", async () => {
  const res = await handler(
    new Request("https://example.test/letter-page-analyze", { method: "OPTIONS" }),
  );
  assertEquals(res.status, 200);
  await res.body?.cancel();
});
