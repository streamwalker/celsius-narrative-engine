import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface PoseAnalysis {
  poseType: 'front' | 'side' | 'back' | 'action' | 'portrait' | 'full-body' | 'custom';
  tags: string[];
  description: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { image, characterName } = await req.json();

    if (!image) {
      return new Response(
        JSON.stringify({ error: 'Image is required' }),
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

    const systemPrompt = `You are an expert at analyzing character reference images for comic and animation production.

Analyze the provided image and determine:
1. The pose type - classify as one of: front, side, back, action, portrait, full-body, or custom
2. Tags - generate 3-6 descriptive tags for the pose (e.g., "standing", "dynamic", "calm", "fighting", "running", "smiling", "angry", "neutral")
3. Description - a brief 1-2 sentence description of what the character is doing in this pose

${characterName ? `The character's name is: ${characterName}` : ''}

Return your analysis as a JSON object with this exact structure:
{
  "poseType": "front|side|back|action|portrait|full-body|custom",
  "tags": ["tag1", "tag2", "tag3"],
  "description": "Brief description of the pose"
}

ONLY return the JSON object, no other text.`;

    console.log('Analyzing pose for:', characterName || 'unknown character');

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
              { type: 'text', text: 'Analyze this character reference image and classify the pose.' },
              { type: 'image_url', image_url: { url: image } }
            ]
          }
        ],
        max_tokens: 500,
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
        JSON.stringify({ error: 'AI analysis failed' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    console.log('AI response:', content);

    // Parse JSON from response
    let analysis: PoseAnalysis;
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return defaults
      analysis = {
        poseType: 'custom',
        tags: ['reference'],
        description: 'Character reference image',
      };
    }

    // Validate pose type
    const validPoseTypes = ['front', 'side', 'back', 'action', 'portrait', 'full-body', 'custom'];
    if (!validPoseTypes.includes(analysis.poseType)) {
      analysis.poseType = 'custom';
    }

    // Ensure tags is an array
    if (!Array.isArray(analysis.tags)) {
      analysis.tags = [];
    }

    console.log('Returning analysis:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-pose:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
