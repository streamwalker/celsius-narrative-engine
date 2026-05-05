import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface PanelOut {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speakers: { name: string; x: number; y: number }[];
}

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { imageDataUrl, characters } = await req.json();
    if (!imageDataUrl || typeof imageDataUrl !== "string") {
      return json({ error: "imageDataUrl required" }, 400);
    }
    const roster: string[] = Array.isArray(characters)
      ? characters.filter((c) => typeof c === "string" && c.trim()).slice(0, 30)
      : [];

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) return json({ error: "AI service not configured" }, 500);

    const userText = `Character roster: ${roster.length ? roster.join(", ") : "(none provided — leave speakers empty)"}\n\nAnalyze the attached page.`;

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
      return json({ error: "Model returned invalid JSON", raw: cleaned.slice(0, 400) }, 502);
    }

    const panelsRaw: any[] = Array.isArray(parsed?.panels) ? parsed.panels : [];
    const clamp = (v: any) => Math.max(0, Math.min(1, Number(v) || 0));
    const panels: PanelOut[] = panelsRaw
      .map((p, i): PanelOut => ({
        index: Number.isFinite(p?.index) ? Number(p.index) : i + 1,
        x: clamp(p?.x),
        y: clamp(p?.y),
        w: clamp(p?.w),
        h: clamp(p?.h),
        speakers: Array.isArray(p?.speakers)
          ? p.speakers
              .map((s: any) => ({
                name: String(s?.name ?? "").trim(),
                x: clamp(s?.x),
                y: clamp(s?.y),
              }))
              .filter((s: any) => s.name)
          : [],
      }))
      .filter((p) => p.w > 0.02 && p.h > 0.02)
      .sort((a, b) => a.index - b.index);

    return json({ panels });
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
