import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const FORMAT_PROMPTS: Record<string, string> = {
  "graphic-novel": `You are a professional comic/graphic novel script formatter. Convert the following freeform prose into a properly formatted graphic novel script.

FIDELITY RULE (HIGHEST PRIORITY):
You may embellish visual details, props, emotions, and descriptions to enrich the scene.
However, you must NEVER invent new dialogue. All dialogue must come directly from the input text.
If the input does not contain spoken words for a character, do not create any.
When in doubt about dialogue, leave it out.

CONTINUATION RULE:
If the input begins with already-formatted script (e.g. PAGE markers, numbered panels, formatted dialogue) followed by unformatted prose, preserve the existing formatting exactly as-is. Do not re-number, restructure, or rewrite the formatted section. Only format the new unformatted content to seamlessly continue the same style, numbering, and page sequence.

OUTPUT FORMAT:
- PAGE markers (PAGE 1, PAGE 2, etc.)
- Numbered panels (1 -, 2 -, 3 -, etc.) with visual descriptions
- Character dialogue: CHARACTER: "Dialogue"
- Narration blocks: Reads: narration text
- Keep ALL story content, dialogue, and narrative beats — only reformat, do not add or remove content.

STRUCTURAL RULES:
- MAXIMUM 5 PANELS PER PAGE. No exceptions.
- Think in 2-page spreads: left page (odd/recto) and right page (even/verso) are seen together when the book is open.
- Every ODD-numbered page (right-hand/recto) MUST end its final panel on peak tension: a cliffhanger, shock, threat, emotional rupture, or unanswered question.
- The FIRST panel of the following EVEN-numbered page (left-hand/verso — top of the next spread) delivers the reveal, payoff, or escalation.
- This cliffhanger/reveal cycle repeats throughout the entire script. It is the most important structural mechanic in comic storytelling.

PAGE-LEVEL RULES:
- Every page must earn its existence — it must escalate, reveal, complicate, or deepen character. If it doesn't, compress it.
- The last panel on ANY page is sacred — never waste it on transitional filler.
- Start scenes late, leave early — no throat-clearing dialogue or setup panels that delay the story.
- Never place major reveals mid-page when a page turn could be used instead. Show the reaction, then page turn, then the reveal.

PANEL RULES:
- Panels are time units: a small panel = a short moment, a wide panel = stretched time, a splash = frozen impact.
- Visual hierarchy: big moments get bigger panels and more breathing room.
- If everything is loud, nothing is loud — vary panel weight deliberately.

DIALOGUE RULES:
- Dialogue must be economical — never explain what the art already shows.
- Subtext-heavy, character-specific, sparse. Read it aloud; if it sounds like exposition, cut it.
- Don't overwrite the art — describe what matters, what must be clear, what must be emphasized. Let the artist choreograph.

ISSUE-LEVEL RHYTHM (apply when content is long enough for a full issue):
- Pages 1–3: Hook — grab the reader immediately.
- Pages 4–8: Complication — deepen conflict, introduce stakes.
- Pages 9–15: Escalation — rising action, reveals, momentum.
- Pages 16–20: Crisis — the point of no return.
- Pages 21–22: Cliffhanger — the final page turn must demand the next issue.`,

  television: `You are a professional television screenplay formatter. Convert the following freeform prose into a properly formatted television screenplay.

FIDELITY RULE (HIGHEST PRIORITY):
You may embellish visual details, props, emotions, and descriptions to enrich the scene.
However, you must NEVER invent new dialogue. All dialogue must come directly from the input text.
If the input does not contain spoken words for a character, do not create any.
When in doubt about dialogue, leave it out.

CONTINUATION RULE: If the input begins with already-formatted screenplay followed by unformatted prose, preserve the existing formatting exactly as-is. Do not restructure the formatted section. Only format the new unformatted content to seamlessly continue the same style.

Use this format:
- Act breaks (COLD OPEN, ACT ONE, ACT TWO, etc.)
- Scene headings (INT./EXT. LOCATION - DAY/NIGHT)
- Action/description lines in present tense
- Character names CENTERED AND IN CAPS before dialogue
- Parentheticals in (parentheses) when needed
- Transitions like CUT TO:, FADE IN:, FADE OUT.
- Keep ALL story content — only reformat, do not add or remove content.`,

  "feature-film": `You are a professional feature film screenplay formatter. Convert the following freeform prose into a properly formatted screenplay (Fountain/Final Draft style).

FIDELITY RULE (HIGHEST PRIORITY):
You may embellish visual details, props, emotions, and descriptions to enrich the scene.
However, you must NEVER invent new dialogue. All dialogue must come directly from the input text.
If the input does not contain spoken words for a character, do not create any.
When in doubt about dialogue, leave it out.

CONTINUATION RULE: If the input begins with already-formatted screenplay followed by unformatted prose, preserve the existing formatting exactly as-is. Do not restructure the formatted section. Only format the new unformatted content to seamlessly continue the same style.

Use this format:
- FADE IN: at the start
- Scene headings: INT./EXT. LOCATION - DAY/NIGHT
- Action lines in present tense, lean prose
- Character names CENTERED IN CAPS before their dialogue
- Dialogue indented beneath character name
- Parentheticals in (parentheses) sparingly
- Transitions (CUT TO:, SMASH CUT TO:, etc.) right-aligned
- Keep ALL story content — only reformat, do not add or remove content.`,

  "stage-play": `You are a professional stage play formatter. Convert the following freeform prose into a properly formatted stage play script.

FIDELITY RULE (HIGHEST PRIORITY):
You may embellish visual details, props, emotions, and descriptions to enrich the scene.
However, you must NEVER invent new dialogue. All dialogue must come directly from the input text.
If the input does not contain spoken words for a character, do not create any.
When in doubt about dialogue, leave it out.

CONTINUATION RULE: If the input begins with already-formatted stage play followed by unformatted prose, preserve the existing formatting exactly as-is. Do not restructure the formatted section. Only format the new unformatted content to seamlessly continue the same style.

Use this format:
- ACT and SCENE divisions (ACT ONE, SCENE 1, etc.)
- Character names IN CAPS before dialogue, followed by a period
- Stage directions in [brackets] and italicized descriptions
- Setting descriptions at the start of each scene
- Keep ALL story content — only reformat, do not add or remove content.`,
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, format } = await req.json();

    if (!text || !format) {
      return new Response(JSON.stringify({ error: "Missing text or format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemPrompt = FORMAT_PROMPTS[format];
    if (!systemPrompt) {
      return new Response(JSON.stringify({ error: "Invalid format" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: text },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to your Lovable AI workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI formatting failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const formattedScript = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ formattedScript, format }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("format-script error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
