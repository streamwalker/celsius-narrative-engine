import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface LabeledReferenceImage {
  image: string;
  characterName: string;
}

interface KeyFeatures {
  hairColor?: string;
  hairStyle?: string;
  eyeColor?: string;
  skinTone?: string;
  facialFeatures?: string[];
  clothing?: string[];
  accessories?: string[];
  distinctiveMarks?: string[];
  bodyType?: string;
}

interface CharacterProfile {
  name: string;
  keyFeatures?: KeyFeatures;
  consistencyWeight?: number;
}

interface CharacterMoodData {
  characterName: string;
  moodId: string;
  moodName: string;
  visualCues: string[];
  colorTones: string[];
  expressionKeywords: string[];
  bodyLanguageHints: string[];
  intensity: number;
}

interface ConsistencyConfig {
  characterWeight: number;
  preserveKeyFeatures: boolean;
  faceMatchingPriority: 'high' | 'medium' | 'low';
  clothingConsistency: boolean;
  poseFlexibility: 'strict' | 'moderate' | 'flexible';
}

const DEFAULT_CONFIG: ConsistencyConfig = {
  characterWeight: 0.8,
  preserveKeyFeatures: true,
  faceMatchingPriority: 'medium',
  clothingConsistency: true,
  poseFlexibility: 'moderate',
};

function buildFeatureList(features: KeyFeatures): string {
  const lines: string[] = [];
  
  if (features.hairColor || features.hairStyle) {
    lines.push(`- Hair: ${features.hairColor || ''} ${features.hairStyle || ''}`.trim());
  }
  if (features.eyeColor) {
    lines.push(`- Eyes: ${features.eyeColor}`);
  }
  if (features.skinTone) {
    lines.push(`- Skin: ${features.skinTone}`);
  }
  if (features.facialFeatures && features.facialFeatures.length > 0) {
    lines.push(`- Face: ${features.facialFeatures.join(', ')}`);
  }
  if (features.clothing && features.clothing.length > 0) {
    lines.push(`- Clothing: ${features.clothing.join(', ')}`);
  }
  if (features.accessories && features.accessories.length > 0) {
    lines.push(`- Accessories: ${features.accessories.join(', ')}`);
  }
  if (features.distinctiveMarks && features.distinctiveMarks.length > 0) {
    lines.push(`- Distinctive: ${features.distinctiveMarks.join(', ')}`);
  }
  if (features.bodyType) {
    lines.push(`- Build: ${features.bodyType}`);
  }
  
  return lines.length > 0 ? lines.join('\n') : 'No specific features defined';
}

function buildConsistencyRules(config: ConsistencyConfig): string {
  const rules: string[] = [];
  const weightPercent = Math.round(config.characterWeight * 100);

  rules.push(`CHARACTER CONSISTENCY PROTOCOL (Weight: ${weightPercent}%):`);

  if (config.preserveKeyFeatures) {
    rules.push('- PRESERVE KEY FEATURES: Hair color/style, eye color, clothing, and accessories must match references EXACTLY');
  }

  switch (config.faceMatchingPriority) {
    case 'high':
      rules.push('- FACE PRIORITY: HIGH - Facial structure, proportions, and expression style must closely match reference');
      break;
    case 'medium':
      rules.push('- FACE PRIORITY: MEDIUM - Maintain recognizable facial features with some artistic flexibility');
      break;
    case 'low':
      rules.push('- FACE PRIORITY: LOW - General resemblance acceptable');
      break;
  }

  if (config.clothingConsistency) {
    rules.push('- CLOTHING LOCK: Maintain consistent outfit details across all panels');
  }

  switch (config.poseFlexibility) {
    case 'strict':
      rules.push('- POSE MODE: STRICT - Character proportions and style must remain constant');
      break;
    case 'moderate':
      rules.push('- POSE MODE: MODERATE - Allow dynamic poses while maintaining character identity');
      break;
    case 'flexible':
      rules.push('- POSE MODE: FLEXIBLE - Prioritize action/emotion over strict consistency');
      break;
  }

  return rules.join('\n');
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
      consistencyConfig,
      characterProfiles = [],
      characterMoods = []
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

    // Merge with defaults
    const config: ConsistencyConfig = { ...DEFAULT_CONFIG, ...consistencyConfig };
    
    console.log(`Generating image for panel ${panelId}: ${prompt.substring(0, 150)}...`);
    console.log(`Consistency config: weight=${config.characterWeight}, face=${config.faceMatchingPriority}`);
    console.log(`Reference images count: ${referenceImages.length}, Labeled images count: ${labeledImages.length}`);

    // Build message content with labeled reference images
    let messageContent: any;
    
    // Prefer labeled images over unlabeled ones
    const hasLabeledImages = labeledImages.length > 0;
    const imagesToUse = hasLabeledImages ? labeledImages : referenceImages.map((img: string, i: number) => ({
      image: img,
      characterName: `CHARACTER ${i + 1}`
    }));
    
    if (imagesToUse.length > 0) {
      // Filter to relevant characters if panel has specific characters
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
          console.log(`Using ${filtered.length} relevant character references for panel`);
        }
      }

      // Build consistency rules based on config
      const consistencyRules = buildConsistencyRules(config);

      // Build character-specific instructions with profiles if available
      const characterInstructions = relevantImages.map((img: LabeledReferenceImage, i: number) => {
        const profile = characterProfiles.find((p: CharacterProfile) => 
          p.name.toUpperCase() === img.characterName.toUpperCase()
        );
        
        // Find mood data for this character
        const moodData = characterMoods.find((m: CharacterMoodData) => 
          m.characterName.toUpperCase() === img.characterName.toUpperCase()
        );
        
        let instruction = `Reference Image ${i + 1} shows character "${img.characterName}"`;
        
        if (profile?.keyFeatures) {
          const featureList = buildFeatureList(profile.keyFeatures);
          const charWeight = (profile.consistencyWeight || 0.8) * config.characterWeight;
          instruction += ` (Identity Weight: ${Math.round(charWeight * 100)}%)\nKey Features:\n${featureList}`;
        }
        
        // Add mood/emotion instructions
        if (moodData) {
          const intensityLabel = moodData.intensity === 3 ? 'INTENSE' : moodData.intensity === 2 ? 'MODERATE' : 'SUBTLE';
          instruction += `\n\nEMOTIONAL STATE for ${img.characterName}: ${moodData.moodName.toUpperCase()} (${intensityLabel})`;
          instruction += `\n- Expression: ${moodData.expressionKeywords.join(', ')}`;
          instruction += `\n- Visual cues: ${moodData.visualCues.join(', ')}`;
          instruction += `\n- Body language: ${moodData.bodyLanguageHints.join(', ')}`;
          instruction += `\n- Color influence: Use ${moodData.colorTones.join(', ')} tones for emotional emphasis`;
        }
        
        instruction += `\nYou MUST use this exact appearance for ${img.characterName} in the panel.`;
        return instruction;
      }).join('\n\n');

      // Build global mood atmosphere if multiple characters share similar moods
      let moodAtmosphere = '';
      if (characterMoods.length > 0) {
        const dominantTones = characterMoods.flatMap((m: CharacterMoodData) => m.colorTones);
        const uniqueTones = [...new Set(dominantTones)].slice(0, 3);
        if (uniqueTones.length > 0) {
          moodAtmosphere = `\nSCENE EMOTIONAL ATMOSPHERE: The panel should incorporate ${uniqueTones.join(', ')} color tones to reinforce the characters' emotional states.`;
        }
      }

      // Weight-based instruction intensity
      const weightIntensity = config.characterWeight >= 0.9 ? 'MAXIMUM' :
                              config.characterWeight >= 0.7 ? 'HIGH' :
                              config.characterWeight >= 0.5 ? 'BALANCED' : 'FLEXIBLE';
      
      const instructionText = `${consistencyRules}

REFERENCE ADHERENCE LEVEL: ${weightIntensity}

CHARACTER REFERENCES:
${characterInstructions}
${moodAtmosphere}

GENERATION RULES:
1. ${config.characterWeight >= 0.8 ? 'Match each character EXACTLY to their reference image' : 'Maintain recognizable character identity with artistic interpretation allowed'}
2. Pay close attention to: hair color/style, clothing, face shape, body type, accessories
3. ${config.preserveKeyFeatures ? 'Key features (hair, eyes, distinctive marks) must be IDENTICAL' : 'Key features should be recognizable but can vary slightly'}
4. ${config.clothingConsistency ? 'Clothing details must remain consistent' : 'Clothing can adapt to scene context'}
5. Maintain art style consistency across all characters
6. Character expressions and body language MUST reflect their designated emotional states

Now generate this comic panel:
${prompt}`;

      // Duplicate reference images for higher weight (more emphasis)
      const refMultiplier = config.characterWeight >= 0.9 ? 2 : 1;
      const refImages = refMultiplier > 1 
        ? [...relevantImages, ...relevantImages]
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
      messageContent = prompt;
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

    console.log(`Successfully generated image for panel ${panelId}`);

    return new Response(
      JSON.stringify({ 
        image: imageData,
        panelId,
        consistencyApplied: config.characterWeight,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error generating panel:", error);
    const message = error instanceof Error ? error.message : "Failed to generate image";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
