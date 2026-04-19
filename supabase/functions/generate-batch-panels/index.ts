import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface LabeledReferenceImage {
  imageData: string;
  label: string;
}

interface CharacterProfile {
  id: string;
  name: string;
  physicalDescription: string;
  clothingDescription: string;
  distinctiveFeatures: string;
  colorPalette: string[];
  consistencyWeight: number;
}

interface PanelRequest {
  panelKey: string;
  pageNumber: number;
  panelIndex: number;
  prompt: string;
  characters: string[];
  mood?: string;
  compositionNotes?: string;
}

interface BatchRequest {
  panels: PanelRequest[];
  referenceImages: string[];
  labeledImages: LabeledReferenceImage[];
  characterProfiles: CharacterProfile[];
  artStyle: string;
  stylePromptModifier: string;
  consistencyWeight: number;
  sessionContext?: string;
  moodDescriptions?: Record<string, string>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const request: BatchRequest = await req.json();
    const { 
      panels, 
      referenceImages, 
      labeledImages, 
      characterProfiles,
      artStyle,
      stylePromptModifier,
      consistencyWeight,
      sessionContext,
      moodDescriptions 
    } = request;

    console.log(`Processing batch of ${panels.length} panels`);

    const results: Array<{
      panelKey: string;
      success: boolean;
      imageData?: string;
      error?: string;
      characterContext?: string;
    }> = [];

    let accumulatedContext = sessionContext || '';

    // Process panels sequentially within the batch for consistency
    for (const panel of panels) {
      try {
        console.log(`Generating panel ${panel.panelKey}: ${panel.prompt.substring(0, 50)}...`);

        // Build character descriptions from profiles
        const characterDescriptions = panel.characters
          .map(charName => {
            const profile = characterProfiles.find(
              p => p.name.toLowerCase() === charName.toLowerCase()
            );
            if (profile) {
              return `${profile.name}: ${profile.physicalDescription}. ${profile.clothingDescription}. Distinctive features: ${profile.distinctiveFeatures}`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n');

        // Build mood context
        const moodContext = panel.characters
          .map(charName => {
            const moodDesc = moodDescriptions?.[charName];
            if (moodDesc) {
              return `${charName} is feeling: ${moodDesc}`;
            }
            return null;
          })
          .filter(Boolean)
          .join('\n');

        // Build the full prompt with all context
        const fullPrompt = `Create a ${artStyle} comic panel.

SCENE: ${panel.prompt}

${panel.compositionNotes ? `COMPOSITION: ${panel.compositionNotes}` : ''}

${characterDescriptions ? `CHARACTERS IN THIS PANEL:\n${characterDescriptions}` : ''}

${moodContext ? `EMOTIONAL CONTEXT:\n${moodContext}` : ''}

${accumulatedContext ? `PREVIOUS CONTEXT (maintain consistency):\n${accumulatedContext}` : ''}

STYLE: ${stylePromptModifier}

IMPORTANT: Maintain strict visual consistency for all characters. Use the exact same character designs, proportions, and color schemes as established.`;

        // Build message content with reference images
        const messageContent: any[] = [];

        // Add reference images
        for (const labeled of labeledImages) {
          messageContent.push({
            type: "image_url",
            image_url: {
              url: labeled.imageData.startsWith('data:') 
                ? labeled.imageData 
                : `data:image/png;base64,${labeled.imageData}`
            }
          });
          messageContent.push({
            type: "text",
            text: `Reference for ${labeled.label} - maintain this exact appearance`
          });
        }

        // Add unlabeled references
        for (const ref of referenceImages) {
          messageContent.push({
            type: "image_url",
            image_url: {
              url: ref.startsWith('data:') ? ref : `data:image/png;base64,${ref}`
            }
          });
        }

        // Add the generation prompt
        messageContent.push({
          type: "text",
          text: fullPrompt
        });

        const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "google/gemini-3-pro-image-preview",
            messages: [
              {
                role: "user",
                content: messageContent
              }
            ],
            modalities: ["text", "image"],
            max_tokens: 4096,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`API error for panel ${panel.panelKey}:`, errorText);
          results.push({
            panelKey: panel.panelKey,
            success: false,
            error: `API error: ${response.status}`,
          });
          continue;
        }

        const data = await response.json();
        
        // Extract image from response
        let imageData: string | undefined;
        let characterContext: string | undefined;

        if (data.choices?.[0]?.message?.content) {
          const content = data.choices[0].message.content;
          
          if (Array.isArray(content)) {
            for (const part of content) {
              if (part.type === 'image_url' && part.image_url?.url) {
                imageData = part.image_url.url;
              } else if (part.type === 'text' && part.text) {
                // Capture any character descriptions for context
                if (part.text.includes('character') || part.text.includes('appearance')) {
                  characterContext = part.text.substring(0, 500);
                }
              }
            }
          } else if (typeof content === 'string') {
            // Check for base64 image in string
            const base64Match = content.match(/data:image\/[^;]+;base64,[A-Za-z0-9+/=]+/);
            if (base64Match) {
              imageData = base64Match[0];
            }
          }
        }

        if (imageData) {
          // Update accumulated context for next panels
          if (characterDescriptions) {
            accumulatedContext += `\nPanel ${panel.panelKey} established: ${panel.characters.join(', ')} with described appearances.`;
          }

          results.push({
            panelKey: panel.panelKey,
            success: true,
            imageData,
            characterContext,
          });
          console.log(`Successfully generated panel ${panel.panelKey}`);
        } else {
          results.push({
            panelKey: panel.panelKey,
            success: false,
            error: 'No image generated in response',
          });
          console.error(`No image in response for panel ${panel.panelKey}`);
        }

        // Small delay between panels to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (panelError) {
        console.error(`Error generating panel ${panel.panelKey}:`, panelError);
        results.push({
          panelKey: panel.panelKey,
          success: false,
          error: panelError instanceof Error ? panelError.message : 'Unknown error',
        });
      }
    }

    return new Response(
      JSON.stringify({
        results,
        sessionContext: accumulatedContext,
        completedCount: results.filter(r => r.success).length,
        failedCount: results.filter(r => !r.success).length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Batch generation error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        results: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
