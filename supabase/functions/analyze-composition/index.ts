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
    const { panelImage, panelDescription } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Starting composition analysis');

    const analysisPrompt = `You are an expert comic book artist and visual storytelling consultant. Analyze this comic panel image for composition quality.

Panel description: ${panelDescription || 'Not provided'}

Evaluate the following aspects and provide scores (0-100) and specific feedback:

1. **Visual Flow** - How well does the panel guide the reader's eye? Consider reading direction, movement lines, and visual hierarchy.

2. **Focal Points** - Are there clear focal points? Is the main subject emphasized appropriately? Are there competing elements that distract?

3. **Balance** - Is the visual weight distributed effectively? Consider symmetry/asymmetry, negative space, and element placement.

4. **Panel Transitions** - How well would this panel connect with adjacent panels narratively? Does it tell its part of the story clearly?

5. **Emotional Impact** - Does the composition effectively convey mood and emotion? Are framing and perspective used to enhance storytelling?

Respond in this exact JSON format:
{
  "overallScore": <number 0-100>,
  "scores": [
    {
      "category": "Visual Flow",
      "score": <number>,
      "feedback": "<brief feedback>",
      "suggestions": ["<improvement 1>", "<improvement 2>"]
    },
    // ... repeat for all 5 categories
  ],
  "summary": "<2-3 sentence overall assessment>",
  "topSuggestions": ["<most important improvement 1>", "<most important improvement 2>", "<most important improvement 3>"]
}`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
              { type: 'text', text: analysisPrompt },
              { type: 'image_url', image_url: { url: panelImage } }
            ]
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Composition analysis failed:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit reached' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Usage limit reached' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      throw new Error('Analysis failed');
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Parse the JSON from the response
    let analysis;
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse analysis:', parseError);
      // Return a default structure if parsing fails
      analysis = {
        overallScore: 70,
        scores: [
          { category: 'Visual Flow', score: 70, feedback: 'Analysis unavailable', suggestions: [] },
          { category: 'Focal Points', score: 70, feedback: 'Analysis unavailable', suggestions: [] },
          { category: 'Balance', score: 70, feedback: 'Analysis unavailable', suggestions: [] },
          { category: 'Panel Transitions', score: 70, feedback: 'Analysis unavailable', suggestions: [] },
          { category: 'Emotional Impact', score: 70, feedback: 'Analysis unavailable', suggestions: [] },
        ],
        summary: 'Could not complete detailed analysis. The panel appears to have standard composition.',
        topSuggestions: ['Consider reviewing panel manually for improvements'],
      };
    }

    console.log('Composition analysis complete:', { overallScore: analysis.overallScore });

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('analyze-composition error:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
