import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LabeledReferenceImage {
  image: string;
  characterName: string;
}

interface CharacterIssue {
  characterName: string;
  issues: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      prompt, 
      panelId, 
      referenceImages = [], 
      labeledImages = [], 
      panelCharacters = [],
      consistencyIssues = [],
      enhancedMode = false
    } = await req.json();
    
    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    console.log(`Generating enhanced image for panel ${panelId}`);
    console.log(`Enhanced mode: ${enhancedMode}, Consistency issues: ${consistencyIssues.length}`);

    // Build enhanced instruction with specific issue corrections
    const hasLabeledImages = labeledImages.length > 0;
    const imagesToUse = hasLabeledImages ? labeledImages : referenceImages.map((img: string, i: number) => ({
      image: img,
      characterName: `CHARACTER ${i + 1}`
    }));

    // Filter to relevant characters
    let relevantImages: LabeledReferenceImage[] = imagesToUse;
    if (panelCharacters.length > 0) {
      const filtered = imagesToUse.filter((img: LabeledReferenceImage) => 
        panelCharacters.some((char: string) => 
          img.characterName.toUpperCase().includes(char.toUpperCase()) ||
          char.toUpperCase().includes(img.characterName.toUpperCase())
        )
      );
      if (filtered.length > 0) {
        relevantImages = filtered;
      }
    }

    // Build consistency correction instructions
    let consistencyCorrections = '';
    if (consistencyIssues.length > 0) {
      const issuesByCharacter = consistencyIssues as CharacterIssue[];
      consistencyCorrections = `
CRITICAL CORRECTIONS REQUIRED:
${issuesByCharacter.map((ci: CharacterIssue) => 
  `For ${ci.characterName}:
${ci.issues.map((issue: string) => `  - FIX: ${issue}`).join('\n')}`
).join('\n')}

You MUST address each of these specific issues in the generated image.
`;
    }

    // Enhanced character consistency instructions
    const enhancedInstructions = enhancedMode ? `
ENHANCED CHARACTER CONSISTENCY MODE:
- Apply 2x weight to character reference adherence
- Prioritize exact facial feature matching over artistic interpretation
- Maintain precise clothing details, accessories, and distinctive features
- Use reference images as the PRIMARY source of truth for character appearance
- If in doubt, favor the reference image over the scene description
` : '';

    // Build character instructions
    const characterInstructions = relevantImages.map((img: LabeledReferenceImage, i: number) => 
      `Reference Image ${i + 1} = "${img.characterName}" - EXACTLY match this appearance, face, hair, clothing, and all distinctive features.`
    ).join('\n');
    
    const instructionText = `MAXIMUM PRIORITY CHARACTER CONSISTENCY INSTRUCTIONS:
${characterInstructions}

${enhancedInstructions}

${consistencyCorrections}

STRICT RULES:
1. Each character MUST be visually identical to their reference image
2. Hair color, style, length must match EXACTLY
3. Face shape, features, expression style must match
4. Clothing, accessories, and distinctive marks must be preserved
5. Body proportions and posture should align with reference
6. Art style must remain consistent across all characters

Generate this comic panel with PERFECT character consistency:
${prompt}`;

    let messageContent: any;
    
    if (relevantImages.length > 0) {
      // Include reference images multiple times for enhanced mode
      const refImages = enhancedMode 
        ? [...relevantImages, ...relevantImages] // Duplicate refs for extra weight
        : relevantImages;

      messageContent = [
        {
          type: "text",
          text: instructionText,
        },
        ...refImages.map((img: LabeledReferenceImage) => ({
          type: "image_url",
          image_url: { url: img.image },
        })),
      ];
    } else {
      messageContent = instructionText;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image-preview",
        messages: [
          {
            role: "user",
            content: messageContent,
          },
        ],
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    
    if (!imageData) {
      console.error("No image in response:", JSON.stringify(data));
      throw new Error("No image generated");
    }

    console.log(`Successfully generated enhanced image for panel ${panelId}`);

    return new Response(
      JSON.stringify({ 
        image: imageData,
        panelId,
        enhanced: enhancedMode,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error generating enhanced panel:", error);
    const message = error instanceof Error ? error.message : "Failed to generate image";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
