import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { sourceImages, targetImages, targetDescription, features } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting style transfer:', { 
      sourceCount: sourceImages?.length, 
      targetCount: targetImages?.length,
      features 
    });

    // First, analyze the source style
    const featureList = [];
    if (features?.artStyle) featureList.push('art style and line work');
    if (features?.colorPalette) featureList.push('color palette');
    if (features?.lineWeight) featureList.push('line weight and thickness');
    if (features?.shadingStyle) featureList.push('shading and rendering style');

    const styleAnalysisPrompt = `Analyze the visual style of this character reference image. Focus on:
${featureList.map(f => `- ${f}`).join('\n')}

Describe these elements in detail so they can be applied to another character.`;

    // Analyze source style
    const analysisResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: styleAnalysisPrompt },
              { type: 'image_url', image_url: { url: sourceImages[0] } }
            ]
          }
        ],
      }),
    });

    if (!analysisResponse.ok) {
      const errorText = await analysisResponse.text();
      console.error('Style analysis failed:', analysisResponse.status, errorText);
      if (analysisResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (analysisResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error('Style analysis failed');
    }

    const analysisData = await analysisResponse.json();
    const styleDescription = analysisData.choices?.[0]?.message?.content || '';
    console.log('Style analysis complete');

    // Now generate new image with transferred style
    const transferPrompt = `Create a new character portrait that combines:
    
TARGET CHARACTER: ${targetDescription}

STYLE TO APPLY:
${styleDescription}

Important: Keep the target character's unique identity (face structure, body type, distinguishing features) 
but render them in the source character's art style, color palette, and visual treatment.

Generate a high-quality portrait that looks like the target character drawn by the same artist who created the source.`;

    const generateResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: transferPrompt },
              { type: 'image_url', image_url: { url: targetImages[0] } }
            ]
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!generateResponse.ok) {
      const errorText = await generateResponse.text();
      console.error('Image generation failed:', generateResponse.status, errorText);
      if (generateResponse.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (generateResponse.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error('Image generation failed');
    }

    const generateData = await generateResponse.json();
    const generatedImage = generateData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      console.error('No image in response');
      throw new Error('No image generated');
    }

    console.log('Style transfer complete');

    return new Response(JSON.stringify({ 
      images: [generatedImage],
      styleDescription 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('transfer-style error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
