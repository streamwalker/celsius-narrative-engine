import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface KeyFeatures {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  facialFeatures: string[];
  clothing: string[];
  accessories: string[];
  distinctiveMarks: string[];
  bodyType: string;
}

interface ProfileAnalysisResult {
  keyFeatures: KeyFeatures;
  suggestedDescription: string;
  confidence: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { images, characterName, existingDescription } = await req.json();

    if (!images || images.length === 0) {
      return new Response(
        JSON.stringify({ error: "At least one image is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Analyzing profile for ${characterName || 'unknown character'} with ${images.length} image(s)`);

    const content: any[] = [
      {
        type: "text",
        text: `You are a character profile analyzer for comic book art consistency. Analyze the provided reference image(s) of ${characterName || 'this character'} and extract detailed visual features.

${existingDescription ? `Existing description to consider: "${existingDescription}"` : ''}

Analyze the image(s) carefully and extract:
1. Hair color (be specific: e.g., "jet black", "auburn red", "platinum blonde")
2. Hair style (e.g., "short spiky", "long straight", "curly shoulder-length")
3. Eye color (e.g., "bright blue", "dark brown", "emerald green")
4. Skin tone (e.g., "fair", "medium", "olive", "dark brown")
5. Facial features (list key features like: "sharp jawline", "round face", "high cheekbones", "beard", "glasses")
6. Clothing items (list each piece: "red cape", "blue t-shirt", "leather jacket")
7. Accessories (list items: "gold necklace", "watch", "earrings", "headband")
8. Distinctive marks (scars, tattoos, birthmarks, unique features)
9. Body type (e.g., "athletic", "slim", "muscular", "average")

Respond in this exact JSON format:
{
  "keyFeatures": {
    "hairColor": "<color>",
    "hairStyle": "<style>",
    "eyeColor": "<color>",
    "skinTone": "<tone>",
    "facialFeatures": ["<feature1>", "<feature2>"],
    "clothing": ["<item1>", "<item2>"],
    "accessories": ["<item1>", "<item2>"],
    "distinctiveMarks": ["<mark1>", "<mark2>"],
    "bodyType": "<type>"
  },
  "suggestedDescription": "<A comprehensive 2-3 sentence description combining all visual features>",
  "confidence": <0-100 score based on image clarity and feature visibility>
}

Be thorough and specific. If a feature is not visible or determinable, use an empty string or empty array.`
      },
    ];

    // Add all images
    for (const image of images) {
      content.push({
        type: "image_url",
        image_url: { url: image }
      });
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
      throw new Error("Failed to parse profile analysis response");
    }

    const result: ProfileAnalysisResult = JSON.parse(jsonMatch[0]);

    // Ensure all arrays exist
    result.keyFeatures = {
      hairColor: result.keyFeatures?.hairColor || '',
      hairStyle: result.keyFeatures?.hairStyle || '',
      eyeColor: result.keyFeatures?.eyeColor || '',
      skinTone: result.keyFeatures?.skinTone || '',
      facialFeatures: result.keyFeatures?.facialFeatures || [],
      clothing: result.keyFeatures?.clothing || [],
      accessories: result.keyFeatures?.accessories || [],
      distinctiveMarks: result.keyFeatures?.distinctiveMarks || [],
      bodyType: result.keyFeatures?.bodyType || '',
    };

    console.log(`Profile analysis complete for ${characterName}, confidence: ${result.confidence}%`);

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in analyze-profile function:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
