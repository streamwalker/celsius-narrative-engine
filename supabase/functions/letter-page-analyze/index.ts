import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { cleanPanels, validatePanelsPayload, type CleanPanel } from "../_shared/letter-page-panels.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type PanelOut = CleanPanel;

const SYSTEM = `You analyze a single page of finished comic-book artwork to prepare it for lettering.

Given:
- One image (the full page).
- A roster of character names that may appear.

Return STRICT JSON only, matching this TypeScript shape:
{
  "panels": Array<{
    "index": number,                 // 1-based reading order (top→bottom, left→right)
    "x": number, "y": number,        // top-left of panel as fraction of page width/height (0..1)
    "w": number, "h": number,        // panel size as fraction of page width/height (0..1)
    "speakers": Array<{
      "name": string,                // MUST be one of the provided roster names
      "x": number, "y": number       // head/face center as fraction of page width/height (0..1)
    }>
  }>
}

Rules:
- Use percentages of the FULL PAGE for every coordinate, not the panel.
- Panel order MUST follow Western reading order unless the page is obviously manga.
- Only list speakers you can clearly identify from the roster; omit unknowns.
- Output JSON only, no prose, no markdown fences.`;

export const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageDataUrl, characters, region } = await req.json();
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return json({ error: "imageDataUrl required" }, 400);
    }
    const roster: string[] = Array.isArray(characters)
      ? characters.filter((c) => typeof c === "string" && c.trim()).slice(0, 30)
      : [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI service not configured" }, 500);

    const hasRegion =
      region &&
      [region.x, region.y, region.w, region.h].every((n: any) => typeof n === "number") &&
      region.w > 0 &&
      region.h > 0;
    const regionInstruction = hasRegion
      ? `\n\nIMPORTANT: ONLY detect panels whose centers fall inside the rectangle x=[${region.x.toFixed(
          3
        )}..${(region.x + region.w).toFixed(3)}], y=[${region.y.toFixed(3)}..${(
          region.y + region.h
        ).toFixed(
          3
        )}] (fractions of the full page). Ignore everything outside this rectangle. Coordinates in the response MUST still be relative to the FULL page.`
      : "";

    const userText = `Character roster: ${roster.length ? roster.join(", ") : "(none provided — leave speakers empty)"}\n\nAnalyze the attached page.${regionInstruction}`;

    const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM },
          {
            role: "user",
            content: [
              { type: "text", text: userText },
              { type: "image_url", image_url: { url: imageDataUrl } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!resp.ok) {
      const t = await resp.text();
      console.error("AI gateway error:", resp.status, t);
      if (resp.status === 429) return json({ error: "Rate limit. Try again shortly." }, 429);
      if (resp.status === 402) return json({ error: "AI credits exhausted." }, 402);
      return json({ error: "AI gateway error" }, 500);
    }

    const data = await resp.json();
    const raw = data.choices?.[0]?.message?.content ?? "";
    const cleaned = String(raw).replace(/^```json\s*|\s*```$/g, "").trim();

    let parsed: any;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("JSON parse failed:", cleaned.slice(0, 400));
      return json(
        {
          error: "Model returned invalid JSON",
          code: "invalid_json",
          raw: cleaned.slice(0, 400),
        },
        502,
      );
    }

    const validation = validatePanelsPayload(parsed);
    if (!validation.ok) {
      console.error("Panels validation failed:", validation.code, validation.message, validation.issues.slice(0, 5));
      return json(
        {
          error: validation.message,
          code: validation.code,
          issues: validation.issues.slice(0, 20),
          raw: cleaned.slice(0, 400),
        },
        502,
      );
    }

    const panels: PanelOut[] = cleanPanels((parsed as { panels: any[] }).panels);
    if (panels.length === 0) {
      return json(
        {
          error: "All detected panels were filtered out as too small, extreme aspect ratio, or duplicates.",
          code: "all_panels_filtered",
          rejected: validation.rejected,
          issues: validation.issues.slice(0, 20),
        },
        422,
      );
    }

    return json({ panels, warnings: validation.rejected > 0 ? { rejectedRawPanels: validation.rejected, issues: validation.issues.slice(0, 20) } : undefined });
  } catch (err) {
    console.error("letter-page-analyze error:", err);
    return json({ error: err instanceof Error ? err.message : "Unknown error" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
