import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const AVAILABLE_MOODS = [
  { id: 'happy', name: 'Happy', category: 'positive' },
  { id: 'content', name: 'Content', category: 'positive' },
  { id: 'excited', name: 'Excited', category: 'positive' },
  { id: 'hopeful', name: 'Hopeful', category: 'positive' },
  { id: 'sad', name: 'Sad', category: 'negative' },
  { id: 'angry', name: 'Angry', category: 'negative' },
  { id: 'fearful', name: 'Fearful', category: 'negative' },
  { id: 'disgusted', name: 'Disgusted', category: 'negative' },
  { id: 'neutral', name: 'Neutral', category: 'neutral' },
  { id: 'curious', name: 'Curious', category: 'neutral' },
  { id: 'thoughtful', name: 'Thoughtful', category: 'neutral' },
  { id: 'determined', name: 'Determined', category: 'intense' },
  { id: 'desperate', name: 'Desperate', category: 'intense' },
  { id: 'menacing', name: 'Menacing', category: 'intense' },
  { id: 'victorious', name: 'Victorious', category: 'intense' },
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { panelDescription, dialogue, characters } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    if (!characters || characters.length === 0) {
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an expert at analyzing comic panel descriptions and dialogue to determine character emotions.
Given a panel description and optional dialogue, analyze the emotional state of each character mentioned.

Available moods (use only these IDs):
${AVAILABLE_MOODS.map(m => `- ${m.id}: ${m.name} (${m.category})`).join('\n')}

Analyze context clues like:
- Action verbs and their intensity
- Punctuation (exclamation marks, question marks)
- Keywords indicating emotion
- Scene setting and atmosphere
- Character relationships and interactions
- Dialogue tone and content`;

    const userPrompt = `Analyze the following panel and determine the most appropriate mood for each character.

Panel Description: ${panelDescription}
${dialogue ? `Dialogue: ${dialogue}` : ''}
Characters to analyze: ${characters.join(', ')}

For each character, provide:
1. The most appropriate mood ID from the available list
2. A confidence score (0.0 to 1.0)
3. A brief reasoning (1-2 sentences)`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'suggest_moods',
              description: 'Provide mood suggestions for each character in the panel',
              parameters: {
                type: 'object',
                properties: {
                  suggestions: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        characterName: { type: 'string', description: 'Name of the character' },
                        suggestedMoodId: { type: 'string', description: 'ID of the suggested mood' },
                        confidence: { type: 'number', description: 'Confidence score from 0.0 to 1.0' },
                        reasoning: { type: 'string', description: 'Brief explanation for the suggestion' }
                      },
                      required: ['characterName', 'suggestedMoodId', 'confidence', 'reasoning'],
                      additionalProperties: false
                    }
                  }
                },
                required: ['suggestions'],
                additionalProperties: false
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'suggest_moods' } }
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const errorText = await response.text();
      console.error('AI Gateway error:', status, errorText);
      
      if (status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (status === 402) {
        return new Response(
          JSON.stringify({ error: 'Usage limit reached. Please add credits.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error(`AI Gateway error: ${status}`);
    }

    const data = await response.json();
    
    // Extract tool call result
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      
      // Validate mood IDs
      const validatedSuggestions = result.suggestions.map((s: any) => ({
        ...s,
        suggestedMoodId: AVAILABLE_MOODS.find(m => m.id === s.suggestedMoodId)?.id || 'neutral'
      }));
      
      console.log('Mood detection successful:', validatedSuggestions);
      
      return new Response(
        JSON.stringify({ suggestions: validatedSuggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fallback to neutral for all characters
    const fallbackSuggestions = characters.map((char: string) => ({
      characterName: char,
      suggestedMoodId: 'neutral',
      confidence: 0.5,
      reasoning: 'Could not determine mood from context'
    }));

    return new Response(
      JSON.stringify({ suggestions: fallbackSuggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-mood function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
