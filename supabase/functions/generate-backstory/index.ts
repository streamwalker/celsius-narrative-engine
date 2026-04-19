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
    const { characterName, race, characterClass, appearance, style } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const styleGuide = {
      heroic: 'noble, courageous, and destined for greatness. Include moments of bravery and self-sacrifice.',
      tragic: 'marked by loss and hardship. Include a defining tragedy that shaped their path.',
      mysterious: 'shrouded in secrets and enigma. Include unexplained events and hidden motivations.',
      comedic: 'filled with amusing mishaps and ironic twists. Keep it light-hearted despite the adventure.',
    };

    const prompt = `Create a compelling 2-3 paragraph origin story for a fantasy character with these traits:

Character: ${characterName || 'The Unnamed Hero'}
Race: ${race}
Class: ${characterClass}
Appearance: ${appearance}
Narrative Style: ${styleGuide[style as keyof typeof styleGuide] || styleGuide.heroic}

The backstory should include:
1. Their origins and early life (where they came from, their family or lack thereof)
2. A defining moment or turning point that set them on their current path
3. What drives them to adventure and their current goals

Write in third person, past tense. Be vivid and evocative but concise. Do not include any meta-commentary or explanations - just the backstory itself.`;

    console.log('Generating backstory for:', characterName, race, characterClass);

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
            role: 'system', 
            content: 'You are a creative fantasy writer specializing in character backstories. Write engaging, atmospheric origin stories that feel authentic to the fantasy genre.' 
          },
          { role: 'user', content: prompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const backstory = data.choices?.[0]?.message?.content?.trim();

    if (!backstory) {
      throw new Error('No backstory generated');
    }

    console.log('Backstory generated successfully');

    return new Response(JSON.stringify({ backstory }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-backstory:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
