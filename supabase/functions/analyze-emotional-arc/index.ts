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
    const { characterName, characterProfile, storyEvents, currentMoods, storyArc } = await req.json();
    
    console.log('Analyzing emotional arc for:', characterName);
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert storytelling consultant specializing in character emotional arcs. 
Analyze the character and story context to suggest how their emotions should evolve throughout the narrative.
Consider narrative structure (rising action, climax, resolution), character personality, and story events.
Return structured suggestions for emotional progression.`;

    const userPrompt = `Analyze the emotional arc for this character:

CHARACTER: ${characterName}
${characterProfile ? `PROFILE: ${JSON.stringify(characterProfile)}` : ''}
${storyEvents ? `STORY EVENTS: ${JSON.stringify(storyEvents)}` : ''}
${currentMoods ? `CURRENT MOOD TIMELINE: ${JSON.stringify(currentMoods)}` : ''}
${storyArc ? `STORY ARC INFO: ${JSON.stringify(storyArc)}` : ''}

Suggest an emotional progression for this character across the story panels.`;

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
          { role: 'user', content: userPrompt }
        ],
        tools: [{
          type: 'function',
          function: {
            name: 'suggest_emotional_arc',
            description: 'Suggest emotional progression for a character',
            parameters: {
              type: 'object',
              properties: {
                characterName: { type: 'string' },
                suggestedArc: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      panelRange: {
                        type: 'object',
                        properties: {
                          start: { type: 'number' },
                          end: { type: 'number' }
                        },
                        required: ['start', 'end']
                      },
                      suggestedMood: { type: 'string' },
                      intensity: { type: 'number', minimum: 1, maximum: 3 },
                      reasoning: { type: 'string' },
                      emotionalTurningPoint: { type: 'boolean' }
                    },
                    required: ['panelRange', 'suggestedMood', 'intensity', 'reasoning', 'emotionalTurningPoint']
                  }
                },
                overallAnalysis: { type: 'string' },
                conflictsDetected: {
                  type: 'array',
                  items: { type: 'string' }
                }
              },
              required: ['characterName', 'suggestedArc', 'overallAnalysis', 'conflictsDetected']
            }
          }
        }],
        tool_choice: { type: 'function', function: { name: 'suggest_emotional_arc' } }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    console.log('AI response received');
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Fallback if no tool call
    return new Response(JSON.stringify({
      characterName,
      suggestedArc: [],
      overallAnalysis: 'Unable to generate analysis',
      conflictsDetected: []
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in analyze-emotional-arc:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
