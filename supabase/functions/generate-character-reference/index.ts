import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ART_STYLE_PROMPTS: Record<string, string> = {
  'western-comics': 'in the style of classic American comic books, bold lines, dynamic shading, vibrant colors like Marvel or DC comics',
  'manga': 'in Japanese manga art style, clean lines, expressive eyes, dynamic poses, black and white with screentones',
  'noir': 'in noir comic style, high contrast black and white, heavy shadows, dramatic lighting, gritty atmosphere',
  'watercolor': 'in watercolor illustration style, soft edges, flowing colors, artistic brush strokes, painterly quality',
  'digital-art': 'in modern digital art style, clean rendering, smooth gradients, polished professional look',
  'realistic': 'in realistic illustration style, detailed anatomy, natural proportions, lifelike rendering',
};

const POSE_PROMPTS: Record<string, string> = {
  'front': 'front view, facing the viewer directly, standing pose, full body visible, neutral expression',
  'side': 'side profile view, 90 degree angle, standing pose, full body visible from the side',
  'back': 'back view, facing away from viewer, full body visible from behind',
  'action': 'dynamic action pose, movement and energy, dramatic angle, showing motion',
  'portrait': 'portrait shot, head and shoulders, detailed facial features, expressive',
  'full-body': 'full body shot, standing naturally, entire figure visible, character sheet style',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characterName, characterDescription, poseType, artStyle } = await req.json();

    if (!characterName || !characterDescription) {
      return new Response(
        JSON.stringify({ error: 'Character name and description are required' }),
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

    const stylePrompt = ART_STYLE_PROMPTS[artStyle] || ART_STYLE_PROMPTS['western-comics'];
    const posePrompt = POSE_PROMPTS[poseType] || POSE_PROMPTS['front'];

    const prompt = `Create a character reference illustration of ${characterName}.

Character description: ${characterDescription}

Pose: ${posePrompt}

Art style: ${stylePrompt}

This is a character reference sheet illustration. The character should be clearly visible against a simple, clean background. Focus on showing the character's distinctive features, clothing, and overall design clearly. Professional quality illustration suitable for comic/animation production.`;

    console.log('Generating character reference:', characterName, poseType, artStyle);

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
            content: prompt
          }
        ],
        modalities: ['image', 'text'],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limited. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Image generation failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');

    // Extract generated image
    const images = data.choices?.[0]?.message?.images;
    if (!images || images.length === 0) {
      console.error('No image in response:', JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: 'No image was generated' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const imageUrl = images[0]?.image_url?.url;
    if (!imageUrl) {
      console.error('Invalid image format:', JSON.stringify(images[0]));
      return new Response(
        JSON.stringify({ error: 'Invalid image format' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Successfully generated character reference for:', characterName);

    return new Response(
      JSON.stringify({ 
        image: imageUrl,
        characterName,
        poseType,
        artStyle,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-character-reference:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
