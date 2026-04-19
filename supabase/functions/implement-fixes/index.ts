import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Strip scenes down to only the fields the AI needs for decision-making
function slimScene(scene: any) {
  return {
    sceneNumber: scene.sceneNumber,
    title: scene.title,
    episode: scene.episode,
    beatTier: scene.beatTier,
    primaryAxis: scene.primaryAxis,
    act: scene.act,
    sequence: scene.sequence,
    purpose: scene.purpose,
    summary: typeof scene.summary === "string" ? scene.summary.slice(0, 100) : scene.summary,
    buildsFrom: scene.buildsFrom,
    setsUp: scene.setsUp,
    keyFunction: scene.keyFunction,
    energyLevel: scene.energyLevel,
    tone: scene.tone,
    dialogueDensity: scene.dialogueDensity,
    estimatedDialogueLines: scene.estimatedDialogueLines,
  };
}

// Merge corrected slim scene back onto the original full scene
function mergeScene(original: any, corrected: any) {
  return {
    ...original,
    sceneNumber: corrected.sceneNumber,
    title: corrected.title,
    episode: corrected.episode,
    beatTier: corrected.beatTier,
    primaryAxis: corrected.primaryAxis,
    act: corrected.act,
    sequence: corrected.sequence ?? original.sequence,
    purpose: corrected.purpose ?? original.purpose,
    summary: corrected.summary ?? original.summary,
    buildsFrom: corrected.buildsFrom ?? original.buildsFrom,
    setsUp: corrected.setsUp ?? original.setsUp,
    keyFunction: corrected.keyFunction ?? original.keyFunction,
    energyLevel: corrected.energyLevel ?? original.energyLevel,
    tone: corrected.tone ?? original.tone,
    dialogueDensity: corrected.dialogueDensity ?? original.dialogueDensity,
    estimatedDialogueLines: corrected.estimatedDialogueLines ?? original.estimatedDialogueLines,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { scenes, analysis, storyData } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    if (!scenes || !Array.isArray(scenes) || scenes.length === 0) {
      return new Response(JSON.stringify({ error: "No scenes provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!analysis) {
      return new Response(JSON.stringify({ error: "No analysis provided" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const medium = storyData?._medium || "tv_series";

    // Slim down the payload
    const slimScenes = scenes.map(slimScene);
    const storySummary = {
      title: storyData?.title || storyData?._title || "Untitled",
      medium,
      episodeCount: storyData?._episodeCount || storyData?.episodeCount,
    };

    const systemPrompt = `Story structure engineer. Apply ALL analysis recommendations to the scene array. Move scenes between episodes, reassign beatTier/primaryAxis, update buildsFrom/setsUp for continuity, renumber sceneNumber per episode (from 1). Medium: ${medium}. Return the COMPLETE corrected array. You MUST use the provided tool to return results. Do not refuse or explain — apply the best structural corrections you can, even if the scenes don't perfectly match the story plan.`;

    // Compact JSON (no pretty-print) to reduce token count
    const userPrompt = `Scenes (${slimScenes.length}):
${JSON.stringify(slimScenes)}

Analysis:
${typeof analysis === 'string' ? analysis.slice(0, 6000) : JSON.stringify(analysis).slice(0, 6000)}

Story: ${JSON.stringify(storySummary)}

Apply every recommendation and return the corrected scenes array.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        temperature: 0,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "return_corrected_scenes",
              description: "Return the full corrected array of scenes after applying all fixes.",
              parameters: {
                type: "object",
                properties: {
                  correctedScenes: {
                    type: "array",
                    description: "The complete corrected scene array",
                    items: {
                      type: "object",
                      properties: {
                        sceneNumber: { type: "number" },
                        title: { type: "string" },
                        act: { type: "number" },
                        sequence: { type: "string" },
                        purpose: { type: "string" },
                        summary: { type: "string" },
                        tone: { type: "string" },
                        dialogueDensity: { type: "string" },
                        estimatedDialogueLines: { type: "number" },
                        buildsFrom: { type: "string" },
                        setsUp: { type: "string" },
                        keyFunction: { type: "string" },
                        energyLevel: { type: "number" },
                        episode: { type: "number" },
                        primaryAxis: { type: "string", enum: ["A", "B", "C"] },
                        beatTier: { type: "string", enum: ["setup", "escalation", "midpoint", "collapse", "resolution"] },
                      },
                      required: ["sceneNumber", "title", "episode", "beatTier", "primaryAxis", "act", "energyLevel"],
                    },
                  },
                  changesSummary: {
                    type: "string",
                    description: "Brief summary of all changes made.",
                  },
                },
                required: ["correctedScenes", "changesSummary"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "return_corrected_scenes" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please wait a moment and try again." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(JSON.stringify({ error: "AI processing failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const result = await response.json();
    const message = result.choices?.[0]?.message;
    const toolCall = message?.tool_calls?.[0];
    if (!toolCall?.function?.arguments) {
      // AI refused tool call — return original scenes with explanation
      const explanation = message?.content || "AI could not process the request.";
      console.warn("No tool call in response, returning fallback with explanation");
      return new Response(JSON.stringify({
        correctedScenes: scenes,
        changesSummary: explanation,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);

    // Merge corrected slim scenes back onto originals to restore stripped fields
    const mergedScenes = (parsed.correctedScenes || []).map((corrected: any) => {
      // Match by title (sceneNumber changes after renumbering)
      const original = scenes.find((s: any) => s.title === corrected.title);
      if (original) {
        return mergeScene(original, corrected);
      }
      // If no match by title (renamed scene), return corrected as-is
      return corrected;
    });

    return new Response(JSON.stringify({
      correctedScenes: mergedScenes,
      changesSummary: parsed.changesSummary,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("implement-fixes error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
