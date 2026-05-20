import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are PANELCRAFT, a comic book story editor. Your job is to convert a prose treatment for a single comic issue into a per-page breakdown.

CRITICAL: Your output is pure JSON. No markdown fences. No preamble. No commentary. The first character must be { and the last must be }.

METHODOLOGY

Count discrete plot beats across all story tracks in the treatment (A-story, B-story, C-story, flashbacks, etc.). Determine page count: use the user's requested count if specified; otherwise 22 pages for treatments with about twenty or fewer beats, 32 pages for twenty-one or more beats.

PAGE CONVENTIONS

Page 1 is a right-hand page. Odd-numbered pages are "R" (right-hand). Even-numbered pages are "L" (left-hand). Right-hand pages should typically end on a cliffhanger or page-turn beat — a moment that pulls the reader to turn the page. The reveal or payoff lands on the following left-hand page. Only "R" pages may have isCliffhanger: true. The final page should not be a cliffhanger; it should land the issue or set up a "to be continued."

CRAFT PRINCIPLES

Intercut between story tracks at page boundaries when the treatment has multiple tracks. Allocate beats with appropriate breathing room — quiet beats and action beats both need their space. Each page should accomplish one or two clear story functions, not five. Title each page distinctively (no duplicate titles). Make summaries concrete: name the beat, the action, the setting, the characters. For R pages that cliffhang, end the summary by describing the cliffhanger image or moment.

OUTPUT SCHEMA

{
  "title": "string (issue title)",
  "theme": "string (the issue's theme as stated or inferred)",
  "pages": [
    {
      "number": 1,
      "side": "R",
      "title": "short evocative title, 2-5 words",
      "summary": "1-3 sentences. Concrete. For cliffhangers, end with the page-turn image.",
      "isCliffhanger": true
    }
  ]
}

Generate the breakdown for the provided treatment now. Respond with JSON only.`;

const jsonResponse = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

function extractJson(text: string): unknown {
  let cleaned = text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { title, theme, treatment, targetPages } = await req.json();

    if (typeof treatment !== "string" || treatment.trim().length < 20) {
      return jsonResponse({ code: "invalid_input", error: "Treatment is too short." });
    }

    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("LOVABLE_API_KEY is not configured");

    const userMessage = [
      `Title: ${title || "Untitled Issue"}`,
      `Theme: ${theme || "(infer from treatment)"}`,
      `Target page count: ${targetPages === "auto" || !targetPages ? "auto (decide based on beat density)" : targetPages}`,
      "",
      "Treatment:",
      "",
      treatment,
    ].join("\n");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        temperature: 0.2,
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
    let text: string = data.choices?.[0]?.message?.content ?? "";

    if (text.startsWith("```")) {
      text = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    }

    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      return new Response(
        JSON.stringify({ error: `Model returned invalid JSON. First 300 chars: ${text.slice(0, 300)}` }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!parsed || !Array.isArray(parsed.pages) || parsed.pages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Response missing pages array." }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const pages = parsed.pages.map((p: any, i: number) => ({
      number: typeof p.number === "number" ? p.number : i + 1,
      side: p.side === "R" || p.side === "L" ? p.side : ((i + 1) % 2 === 1 ? "R" : "L"),
      title: String(p.title || `Page ${i + 1}`).slice(0, 80),
      summary: String(p.summary || "").slice(0, 1000),
      isCliffhanger: !!p.isCliffhanger,
      panels: [],
    }));

    return new Response(
      JSON.stringify({
        title: String(parsed.title || title || "Untitled Issue"),
        theme: String(parsed.theme || theme || ""),
        treatment,
        pages,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("panelcraft-generate error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
