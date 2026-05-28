import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SHOT_TYPES = [
  "ESTABLISHING",
  "WIDE",
  "MEDIUM",
  "CLOSE",
  "ECU",      // extreme close up
  "OTS",      // over the shoulder
  "POV",
  "INSERT",   // detail / object
  "SPLASH",   // full-page or near-full panel
] as const;

const TRANSITIONS = [
  "NONE",                // first panel of the page
  "MOMENT_TO_MOMENT",
  "ACTION_TO_ACTION",
  "SUBJECT_TO_SUBJECT",
  "SCENE_TO_SCENE",
  "ASPECT_TO_ASPECT",
  "NON_SEQUITUR",
] as const;

const PANEL_FUNCTIONS = [
  "SETUP", "EXPOSITION", "BEAT", "TRANSITION",
  "ESCALATE", "TURN", "COMBAT", "REVEAL", "CLIMAX",
] as const;

const SYSTEM_PROMPT = `You are PANELCRAFT-PANELS, a comic book panel director. You are given ONE page's outline (and optional neighbor context). Convert it into 4-6 panels using comics visual grammar.

CRITICAL: Your output is pure JSON. No markdown fences, no preamble, no commentary. The first character must be { and the last must be }.

RULES

- Produce 4-6 panels. Use 1-3 only for splash / dramatic emphasis pages, and 7+ only for dense action — but never more than 9.
- The first panel's "transitionFromPrev" must be "NONE".
- Subsequent panels pick a transition relative to the previous panel:
  MOMENT_TO_MOMENT (tiny time advance, same subject), ACTION_TO_ACTION (same subject, new action),
  SUBJECT_TO_SUBJECT (same scene, different subject), SCENE_TO_SCENE (time/place jump),
  ASPECT_TO_ASPECT (mood/detail of the same moment), NON_SEQUITUR (unrelated — use sparingly).
- "shotType" must be one of: ESTABLISHING, WIDE, MEDIUM, CLOSE, ECU, OTS, POV, INSERT, SPLASH.
- Vary shot types — avoid 3+ same-shot panels in a row unless intentional rhythm (e.g. ECU staccato).
- "function" must be one of: SETUP, EXPOSITION, BEAT, TRANSITION, ESCALATE, TURN, COMBAT, REVEAL, CLIMAX. Pick the function that best fits each panel's job.
- "description" is 1-2 sentences, concrete and visual: subject, action, framing, lighting, key prop. No dialogue here.
- If the page isCliffhanger, the FINAL panel should land the page-turn image — typically a CLOSE/ECU/SPLASH with REVEAL or TURN function.

OUTPUT SCHEMA

{
  "panels": [
    {
      "function": "SETUP",
      "shotType": "ESTABLISHING",
      "transitionFromPrev": "NONE",
      "description": "1-2 concrete visual sentences."
    }
  ]
}

Respond with JSON only.`;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function extractJson(text: string): unknown {
  let cleaned = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/i, "").trim();
  const start = cleaned.search(/[\{\[]/);
  if (start === -1) throw new Error("The model returned an empty response instead of JSON.");
  const opener = cleaned[start];
  const closer = opener === "[" ? "]" : "}";
  const end = cleaned.lastIndexOf(closer);
  if (end === -1 || end <= start) throw new Error("The model response was incomplete JSON.");
  cleaned = cleaned.slice(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch {
    return JSON.parse(
      cleaned
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, ""),
    );
  }
}

interface IncomingPage {
  number?: number;
  side?: "L" | "R";
  title?: string;
  summary?: string;
  isCliffhanger?: boolean;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const page: IncomingPage = body?.page ?? {};
    const prevPage: IncomingPage | undefined = body?.prevPage ?? undefined;
    const nextPage: IncomingPage | undefined = body?.nextPage ?? undefined;
    const theme: string = typeof body?.theme === "string" ? body.theme : "";

    if (!page.summary || String(page.summary).trim().length < 5) {
      return jsonResponse({ code: "invalid_input", error: "Page summary is required." });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const pageDesc = (p: IncomingPage | undefined, label: string) =>
      p
        ? `${label} (page ${p.number ?? "?"}, ${p.side ?? "?"}${p.isCliffhanger ? ", cliffhanger" : ""}): ${p.title ?? ""} — ${p.summary ?? ""}`
        : `${label}: (none)`;

    const userMessage = [
      `Issue theme: ${theme || "(unspecified)"}`,
      "",
      pageDesc(prevPage, "PREVIOUS PAGE"),
      pageDesc(page, "THIS PAGE"),
      pageDesc(nextPage, "NEXT PAGE"),
      "",
      "Generate 4-6 panels for THIS PAGE.",
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return jsonResponse({ code: "rate_limited", error: "Rate limited. Please try again in a moment." });
      }
      if (response.status === 402) {
        return jsonResponse({
          code: "credits_exhausted",
          error: "AI credits exhausted. Add funds in Lovable Cloud workspace settings.",
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return jsonResponse({ code: "ai_gateway_error", error: "AI gateway error. Please try again." });
    }

    const data = await response.json();
    const text: string = data.choices?.[0]?.message?.content ?? "";
    const snippet = (text ?? "").replace(/\s+/g, " ").trim().slice(0, 300);

    let parsed: any;
    try {
      parsed = extractJson(text);
    } catch (e) {
      console.error("Invalid model JSON:", e, text.slice(0, 1000));
      return jsonResponse({
        code: "invalid_model_json",
        error: e instanceof Error ? e.message : "The model returned invalid JSON. Please try again.",
        snippet,
      });
    }

    if (!parsed || !Array.isArray(parsed.panels) || parsed.panels.length === 0) {
      return jsonResponse({ code: "invalid_model_json", error: "Response missing panels array.", snippet });
    }

    const pickOne = <T extends readonly string[]>(arr: T, v: unknown, fallback: T[number]): T[number] =>
      (arr as readonly string[]).includes(String(v)) ? (v as T[number]) : fallback;

    const panels = parsed.panels.slice(0, 9).map((p: any, i: number) => ({
      function: pickOne(PANEL_FUNCTIONS, p.function, i === 0 ? "SETUP" : "BEAT"),
      shotType: pickOne(SHOT_TYPES, p.shotType, "MEDIUM"),
      transitionFromPrev: i === 0
        ? "NONE"
        : pickOne(TRANSITIONS, p.transitionFromPrev, "ACTION_TO_ACTION"),
      description: String(p.description || "").slice(0, 600),
    }));

    return jsonResponse({ panels });
  } catch (e) {
    console.error("panelcraft-generate-panels error:", e);
    return jsonResponse({ code: "server_error", error: e instanceof Error ? e.message : "Unknown error" });
  }
});
