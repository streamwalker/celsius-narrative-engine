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
    const { imageData, artStyle, promptModifier, preserveContent } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!imageData) {
      throw new Error('Image data is required');
    }

    console.log('Starting art style application:', { 
      artStyle,
      hasPromptModifier: !!promptModifier,
      preserveContent
    });

    // Build the transformation prompt
    const styleDescription = promptModifier || `${artStyle} comic book art style`;
    
    const transformPrompt = preserveContent
      ? `Transform this photograph into ${styleDescription}. 
         IMPORTANT: Preserve the exact composition, subjects, poses, and elements from the original photo.
         Apply the art style rendering while keeping all subjects and details recognizable.
         The result should look like a comic book panel or illustration version of this exact photo.`
      : `Create a comic book style illustration inspired by this image using ${styleDescription}.
         Reimagine the scene as comic book art, focusing on dramatic composition and visual impact.
         Apply bold line work, dynamic shading, and the characteristic elements of ${artStyle}.`;

    // Generate the stylized image
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-pro-image-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: transformPrompt },
              { type: 'image_url', image_url: { url: imageData } }
            ]
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Style application failed:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error('Style application failed');
    }

    const data = await response.json();
    const generatedImage = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!generatedImage) {
      console.error('No image in response:', data);
      throw new Error('No image generated');
    }

    console.log('Art style application complete');

    return new Response(JSON.stringify({ 
      image: generatedImage,
      style: artStyle
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('apply-art-style error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
