import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CharacterAnalysis {
  suggestedName: string;
  physicalDescription: string;
  clothing: string;
  distinguishingFeatures: string;
  colorPalette: string;
  estimatedAge: string;
  confidence: 'high' | 'medium' | 'low';
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, filenameHint } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Analyzing character image...');

    const systemPrompt = `You are an expert character analyst for comic book and graphic novel production. 
Analyze the provided reference image and extract detailed character information for maintaining visual consistency across comic panels.

Respond with a JSON object containing these fields:
- suggestedName: A suggested character name based on visual cues (text in image, costume symbols, or descriptive name like "BLUE_KNIGHT" or "FLAME_WARRIOR"). Use UPPERCASE with underscores.
- physicalDescription: Detailed physical description (body type, height impression, skin tone, hair color/style, facial features)
- clothing: Detailed clothing/costume description (colors, materials, distinctive elements)
- distinguishingFeatures: Unique identifying features (scars, tattoos, powers, accessories, weapons)
- colorPalette: Main colors associated with the character (comma-separated)
- estimatedAge: Apparent age range (e.g., "Young adult", "Middle-aged", "Elderly")
- confidence: Your confidence level in the analysis ("high", "medium", or "low")

${filenameHint ? `Hint from filename: "${filenameHint}" - consider this when suggesting the character name.` : ''}

Respond ONLY with valid JSON, no additional text.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this character reference image and provide detailed character information as JSON.'
              },
              {
                type: 'image_url',
                image_url: { url: image }
              }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to analyze image' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    if (!content) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'No analysis generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse JSON from response (handle markdown code blocks)
    let analysis: CharacterAnalysis;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
      const jsonStr = jsonMatch[1].trim();
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', content);
      // Create a fallback analysis
      analysis = {
        suggestedName: filenameHint?.toUpperCase().replace(/[^A-Z0-9]/g, '_') || 'CHARACTER',
        physicalDescription: 'Unable to extract detailed description',
        clothing: 'Unable to extract clothing details',
        distinguishingFeatures: 'Unable to extract features',
        colorPalette: 'Unknown',
        estimatedAge: 'Unknown',
        confidence: 'low'
      };
    }

    console.log('Character analysis complete:', analysis.suggestedName);

    return new Response(
      JSON.stringify({ analysis }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-character:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
