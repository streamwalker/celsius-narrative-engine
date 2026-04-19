import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ConsistencyResult {
  overallScore: number;
  characterMatches: {
    characterName: string;
    matchScore: number;
    issues: string[];
    details: string;
  }[];
  generalIssues: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { panelImage, referenceImages, characterNames } = await req.json();

    if (!panelImage) {
      return new Response(
        JSON.stringify({ error: "Panel image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Checking consistency for panel with ${referenceImages?.length || 0} reference images`);

    // Build content array with panel image and all reference images
    const content: any[] = [
      {
        type: "text",
        text: `You are a character consistency checker for comic book art. Analyze the GENERATED PANEL IMAGE and compare each character's appearance to their REFERENCE IMAGES.

For each character that appears in both the panel and references, check:
1. Hair color and style
2. Face shape and features
3. Clothing and accessories
4. Body type and proportions
5. Any distinctive features (scars, tattoos, etc.)

Characters to check: ${characterNames?.join(', ') || 'All visible characters'}

Respond in this exact JSON format:
{
  "overallScore": <0-100 consistency score>,
  "characterMatches": [
    {
      "characterName": "<name>",
      "matchScore": <0-100>,
      "issues": ["<specific inconsistency 1>", "<specific inconsistency 2>"],
      "details": "<brief explanation of match/mismatch>"
    }
  ],
  "generalIssues": ["<any general art style inconsistencies>"]
}

Be specific about inconsistencies. If a character looks correct, give them a high score with empty issues array.`
      },
      {
        type: "text",
        text: "GENERATED PANEL IMAGE (analyze this):"
      },
      {
        type: "image_url",
        image_url: { url: panelImage }
      }
    ];

    // Add reference images with labels
    if (referenceImages && referenceImages.length > 0) {
      content.push({
        type: "text",
        text: "REFERENCE IMAGES (compare characters against these):"
      });

      for (let i = 0; i < referenceImages.length; i++) {
        const ref = referenceImages[i];
        content.push({
          type: "text",
          text: `Reference ${i + 1} - Character: "${ref.characterName || 'Unknown'}"`
        });
        content.push({
          type: "image_url",
          image_url: { url: ref.image }
        });
      }
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const responseText = data.choices?.[0]?.message?.content || "";
    
    console.log("AI Response:", responseText.substring(0, 500));

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Failed to parse consistency check response");
    }

    const result: ConsistencyResult = JSON.parse(jsonMatch[0]);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in check-consistency function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
