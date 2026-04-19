import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

/**
 * Unified allowed-tiers logic — aligned with frontend pacing.ts (0.3/0.7/0.8 breakpoints).
 * Uses Math.ceil percentage thresholds on 1-based episode numbers.
 * IMPORTANT: episodeNumber is 1-based (episode 1, 2, 3...) to match frontend.
 */
function getAllowedTiers(episodeNumber: number, totalEpisodes: number): string[] {
  if (totalEpisodes <= 1) return ["setup", "escalation", "midpoint", "collapse", "resolution"];
  const setupEnd = Math.ceil(totalEpisodes * 0.3);
  const escalationEnd = Math.ceil(totalEpisodes * 0.7);
  const collapseEnd = Math.ceil(totalEpisodes * 0.8);
  if (episodeNumber <= setupEnd) return ["setup", "escalation"];
  if (episodeNumber <= escalationEnd) return ["escalation", "midpoint"];
  if (episodeNumber <= collapseEnd) return ["collapse"];
  return ["resolution"];
}

interface SceneData {
  sceneNumber?: number;
  title?: string;
  act?: string;
  primaryAxis?: string;
  beatTier?: string;
  energyLevel?: number;
  keyFunction?: string;
  purpose?: string;
  episode?: number;
}

function buildSceneSummary(scenes: SceneData[], medium: string, totalEpisodes: number, totalIssues: number): string {
  if (!scenes || scenes.length === 0) return "";

  const grouped: Record<number, SceneData[]> = {};
  for (const s of scenes) {
    const ep = s.episode ?? 0;
    if (!grouped[ep]) grouped[ep] = [];
    grouped[ep].push(s);
  }

  const isTvSeries = medium === "tv_series";
  const isComic = medium === "comic";
  const unitLabel = isComic ? "ISSUE" : "EPISODE";
  const totalUnits = isComic ? totalIssues : totalEpisodes;

  let summary = `\n\nSCENE ENGINE OUTPUT (${scenes.length} total scenes across ${Object.keys(grouped).length} ${unitLabel.toLowerCase()}s):\n`;

  const violations: string[] = [];

  const sortedEps = Object.keys(grouped).map(Number).sort((a, b) => a - b);
  for (const epIdx of sortedEps) {
    const epScenes = grouped[epIdx];
    const epNum = epIdx + 1;
    summary += `\n${unitLabel} ${epNum} (${epScenes.length} scenes):\n`;

    const axisCounts: Record<string, number> = { A: 0, B: 0, C: 0 };
    
    const allowedTiers = (isTvSeries || isComic)
      ? getAllowedTiers(epNum, totalUnits)
      : ["setup", "escalation", "midpoint", "collapse", "resolution"];

    for (const s of epScenes) {
      const axis = s.primaryAxis || "?";
      if (axis in axisCounts) axisCounts[axis]++;
      const tier = s.beatTier || "?";
      const violates = tier !== "?" && !allowedTiers.includes(tier);
      const flag = violates ? " ⚠️ VIOLATION" : "";
      if (violates) {
        violations.push(`${unitLabel} ${epNum}, Scene ${s.sceneNumber}: "${s.title}" has beatTier="${tier}" but ${unitLabel.toLowerCase()} ${epNum} only allows [${allowedTiers.join(", ")}]`);
      }
      summary += `  S${s.sceneNumber}: "${s.title || "Untitled"}" | ${s.act || "?"} | Axis: ${axis} | Tier: ${tier} | Energy: ${s.energyLevel ?? "?"} | Function: ${s.keyFunction || "?"}${flag}\n`;
    }
    summary += `  Axis Balance: A:${axisCounts.A} B:${axisCounts.B} C:${axisCounts.C}\n`;
  }

  if (violations.length > 0) {
    summary += `\nPRE-FLAGGED VIOLATIONS (${violations.length}):\n`;
    for (const v of violations) {
      summary += `  ⚠️ ${v}\n`;
    }
  }

  return summary;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { storyData, scenes, previousAnalysis } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const formatKeys = ['_medium', '_comic_pages', '_comic_issues', '_tv_ep_length', '_tv_series_ep_length', '_tv_series_episodes', '_film_length', '_stage_acts', '_stage_runtime'];
    const filledFields = Object.entries(storyData)
      .filter(([k, v]) => !formatKeys.includes(k) && (v as string)?.trim())
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");

    const emptyFields = Object.entries(storyData)
      .filter(([k, v]) => !formatKeys.includes(k) && !(v as string)?.trim())
      .map(([k]) => k);

    // Build format/pacing context
    let formatContext = "";
    const medium = storyData._medium;
    if (medium === "comic") {
      const pages = storyData._comic_pages || "?";
      const issues = storyData._comic_issues || "?";
      const total = pages !== "?" && issues !== "?" ? parseInt(pages) * parseInt(issues) : "?";
      formatContext = `FORMAT: Comic book — ${pages} pages/issue, ${issues}-issue miniseries (${total} total pages).
Pacing notes: Act I ≈ issues 1–${issues !== "?" ? Math.ceil(parseInt(issues) * 0.25) : "?"}, Act II ≈ issues ${issues !== "?" ? Math.ceil(parseInt(issues) * 0.25) + 1 : "?"}–${issues !== "?" ? Math.ceil(parseInt(issues) * 0.75) : "?"}, Act III ≈ issues ${issues !== "?" ? Math.ceil(parseInt(issues) * 0.75) + 1 : "?"}–${issues}. Midpoint ≈ issue ${issues !== "?" ? Math.ceil(parseInt(issues) / 2) : "?"}. Each issue ends on a cliffhanger. Max 5 panels/page. Final panel of every page is sacred — never wasted on filler.`;
    } else if (medium === "tv_episode") {
      const len = storyData._tv_ep_length || "?";
      formatContext = `FORMAT: TV episode — ${len} minutes. Act I ≈ first 25%, Act II ≈ middle 50%, Act III ≈ final 25%. ${parseInt(len) >= 44 ? "Cold open/teaser in first 2–3 min." : ""} Midpoint ≈ ${len !== "?" ? Math.round(parseInt(len) / 2) : "?"} min mark. ~1 script page per minute.`;
    } else if (medium === "tv_series") {
      const epLen = storyData._tv_series_ep_length || "?";
      const eps = storyData._tv_series_episodes || "?";
      formatContext = `FORMAT: TV series — ${eps} episodes × ${epLen} min/ep. Season arc: Setup (eps 1–${eps !== "?" ? Math.ceil(parseInt(eps) * 0.3) : "?"}), Escalation (eps ${eps !== "?" ? Math.ceil(parseInt(eps) * 0.3) + 1 : "?"}–${eps !== "?" ? Math.ceil(parseInt(eps) * 0.7) : "?"}), Resolution (eps ${eps !== "?" ? Math.ceil(parseInt(eps) * 0.7) + 1 : "?"}–${eps}). Season midpoint ≈ ep ${eps !== "?" ? Math.ceil(parseInt(eps) / 2) : "?"}. Penultimate crisis ≈ ep ${eps !== "?" ? parseInt(eps) - 1 : "?"}. Each episode needs its own mini-arc within the season arc.`;
    } else if (medium === "film") {
      const len = storyData._film_length || "?";
      formatContext = `FORMAT: Feature film — ${len} min runtime (~${len} script pages). Inciting incident ≈ p${len !== "?" ? Math.round(parseInt(len) * 0.12) : "?"}. End of Act I ≈ p${len !== "?" ? Math.round(parseInt(len) * 0.25) : "?"}. Midpoint ≈ p${len !== "?" ? Math.round(parseInt(len) * 0.5) : "?"}. Low point ≈ p${len !== "?" ? Math.round(parseInt(len) * 0.75) : "?"}. Climax ≈ p${len !== "?" ? Math.round(parseInt(len) * 0.9) : "?"}.`;
    } else if (medium === "stage_play") {
      const acts = storyData._stage_acts || "?";
      const runtime = storyData._stage_runtime || "?";
      formatContext = `FORMAT: Stage play — ${acts}-act structure, ~${runtime} min runtime. Scene changes defined by character entrances/exits.${parseInt(acts) >= 2 ? ` Intermission after Act ${Math.ceil(parseInt(acts) / 2)} (~${runtime !== "?" ? Math.round(parseInt(runtime) * 0.5) : "?"} min mark).` : ""}`;
    }

    // Build scene summary if scenes provided
    const totalEpisodes = storyData._tv_series_episodes ? parseInt(storyData._tv_series_episodes) : 10;
    const totalIssues = storyData._comic_issues ? parseInt(storyData._comic_issues) : 6;
    const sceneSummary = scenes && scenes.length > 0
      ? buildSceneSummary(scenes, medium, totalEpisodes, totalIssues)
      : "";

    const hasScenes = sceneSummary.length > 0;

    // Scene validation instructions block
    const sceneValidationBlock = hasScenes ? `

SCENE ENGINE VALIDATION (CRITICAL — analyze this thoroughly):
You have been provided the full Scene Engine output below. Cross-reference it against the Narrative Engine story fields above.

SEASON-LEVEL STRUCTURE VALIDATION:
- Check that each episode/issue's scenes use only beat tiers ALLOWED for that position in the arc:
  * Episodes 1–30%: only "setup" and "escalation" tiers
  * Episodes 31%–70%: "escalation" and "midpoint" tiers
  * Episodes 71%–80%: "collapse" tier only
  * Episodes 81%–100%: "resolution" tier only
- Pre-flagged violations are marked with ⚠️ — explain WHY each is wrong and WHERE the scene should go

CROSS-REFERENCE WITH NARRATIVE ENGINE FIELDS:
- Find the content described in "Inciting Incident" fields — does it appear in episodes 1-2? If not, flag it.
- Find the content described in "Midpoint" / "The Trap" fields — does it appear in mid-season episodes? If not, flag it.
- Find the content described in "Low Point" / "All Is Lost" fields — does it appear in episodes 7-8 (for 10-ep)? If not, flag it.
- Find the content described in "Climax" / "Final Confrontation" fields — does it appear in the final episodes? If not, flag it.
- Look for CHARACTER NAMES mentioned in specific Narrative Engine sections and verify they appear in the correct episode range in the Scene Engine output.

EPISODE ARC INTEGRITY:
- Does each episode have a balanced A/B/C axis distribution? Flag episodes that are missing an axis entirely.
- Does each episode have its own internal Hook → Escalation → Turn structure?
- Does each episode's ending set up the next episode? Flag disconnected transitions.

CAUSAL CHAIN CONTINUITY:
- Do events in later episodes logically follow from earlier ones?
- Are there scenes that reference events/reveals that haven't happened yet in earlier episodes?
` : "";

    // Context-aware re-analysis block
    const previousAnalysisBlock = previousAnalysis
      ? `

PREVIOUS ANALYSIS CONTEXT:
You previously analyzed this story and provided the following feedback. The user has since applied fixes to the scene engine output. Compare the current state against your previous analysis. Identify what has been RESOLVED, what REMAINS, and any NEW issues introduced by the changes. Do NOT repeat resolved issues — focus on remaining gaps and new observations.

--- PREVIOUS ANALYSIS ---
${previousAnalysis}
--- END PREVIOUS ANALYSIS ---
`
      : "";

    const systemPrompt = `You are an expert story consultant trained in three-act structure, Save the Cat, and the A/B/C multi-thread narrative system (the Celsius Narrative Triad™). You analyze story outlines and their scene breakdowns to ensure structural integrity across the full production.

The A/B/C system works as follows:
- A Story (External Engine): The protagonist's external goal, plan, and confrontation
- B Story (Internal Engine): The protagonist's flaws, internal contradictions, and transformation
- C Story (Opposition Engine): The antagonist's motivation, philosophy, and mirror to the protagonist

Key principles:
- The B Story flaw must DIRECTLY block the A Story goal
- The C Story antagonist must represent a competing PHILOSOPHY, not just be "the bad guy"
- The midpoint must be a wrong choice made for the right reason
- Internal change (B) must happen BEFORE external victory (A)
- The antagonist fails because of THEIR OWN flaw, mirroring the protagonist
${formatContext ? `\n${formatContext}\nWhen analyzing, reference the specific format — mention page numbers, issue numbers, episode numbers, or minute marks where story beats should land. Advise on pacing specific to this medium.\n` : ""}${sceneValidationBlock}${previousAnalysisBlock}
Analyze the provided story data${hasScenes ? " AND scene engine output" : ""} and give:
1. STRENGTHS: What's working well (2-3 points)
2. CRITICAL GAPS: What's missing or weak (2-3 points with specific suggestions)
3. THREAD CONNECTIONS: How well the A/B/C stories interlock${formatContext ? "\n4. PACING & FORMAT: How well the story fits the chosen format, where key beats should land" : ""}
${hasScenes ? `${formatContext ? "5" : "4"}. SCENE ENGINE ALIGNMENT: How well the generated scenes match the Narrative Engine's story arc plan. Are the major beats landing in the right episodes/issues?
${formatContext ? "6" : "5"}. MISPLACED SCENES: List EVERY scene that violates beat-tier placement rules or appears in the wrong episode relative to the Narrative Engine's plan. For each, specify: current location, correct location, and why.
${formatContext ? "7" : "6"}. EPISODE ARC INTEGRITY: For each episode/issue, assess A/B/C axis balance and internal arc completeness. Flag episodes missing an axis or lacking a proper turn.` : `${formatContext ? "5" : "4"}. NEXT STEPS: The most important 2-3 fields to fill next and why`}
${previousAnalysis ? `\n${formatContext ? (hasScenes ? "8" : "6") : (hasScenes ? "7" : "5")}. RESOLVED vs REMAINING: Explicitly list which issues from your previous analysis have been fixed and which still need attention.` : ""}

Be direct, specific, and reference their actual content. No generic advice. When flagging misplaced scenes, be PRECISE — cite episode numbers, scene numbers, scene titles, and character names.`;

    const userPrompt = `Here is my story outline so far:
${formatContext ? `\n${formatContext}\n` : ""}
FILLED FIELDS:
${filledFields || "(Nothing filled yet)"}

EMPTY FIELDS: ${emptyFields.join(", ") || "(All filled)"}
${sceneSummary}
Analyze this ${hasScenes ? "outline AND scene engine output" : "outline"} and give me specific, actionable feedback based on the A/B/C multi-thread narrative system${formatContext ? " and the selected format/pacing" : ""}${hasScenes ? ". Pay special attention to scenes that are misplaced relative to the season/series arc" : ""}.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited — please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI analysis failed" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("analyze-story error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
