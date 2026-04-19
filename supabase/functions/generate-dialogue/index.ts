import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CharacterVoice {
  name: string;
  description?: string;
  traits?: string[];
  archetype?: string;
}

interface DialogueRequest {
  sceneDescription: string;
  characters: CharacterVoice[];
  storyContext?: string;
  tone: string;
  previousDialogue?: string;
  panelDescription?: string;
  count?: number;
  maxLength?: number;
  style?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      sceneDescription, 
      characters, 
      storyContext, 
      tone,
      previousDialogue,
      panelDescription,
      count = 5,
      maxLength = 100,
      style = 'comic'
    }: DialogueRequest = await req.json();

    console.log('Generating dialogue for scene:', sceneDescription);
    console.log('Characters:', characters.map(c => c.name).join(', '));
    console.log('Tone:', tone);

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build character descriptions
    const characterDescriptions = characters.map(c => {
      let desc = `- ${c.name}`;
      if (c.description) desc += `: ${c.description}`;
      if (c.traits && c.traits.length > 0) desc += ` (Traits: ${c.traits.join(', ')})`;
      if (c.archetype) desc += ` [${c.archetype}]`;
      return desc;
    }).join('\n');

    const systemPrompt = `You are an expert dialogue writer for ${style} graphic novels and comics.
Your task is to generate natural, character-appropriate dialogue based on the scene context.

Guidelines:
- Keep dialogue concise and punchy - suitable for speech bubbles (max ${maxLength} characters per line)
- Match each character's personality and speech patterns
- Consider the emotional tone: ${tone}
- Dialogue should advance the story or reveal character
- Use natural contractions and speech patterns
- Avoid exposition dumps - show, don't tell
- Include emotional cues to help with panel composition

IMPORTANT: Respond ONLY with valid JSON in this exact format:
{
  "suggestions": [
    {
      "speaker": "CHARACTER_NAME",
      "dialogue": "The actual dialogue line",
      "emotion": "emotional_state"
    }
  ]
}

Do not include any text before or after the JSON.`;

    const userPrompt = `Generate ${count} dialogue suggestions for this comic panel.

SCENE: ${sceneDescription}
${panelDescription ? `PANEL VISUAL: ${panelDescription}` : ''}

CHARACTERS IN SCENE:
${characterDescriptions || 'No specific characters provided'}

STORY CONTEXT: ${storyContext || 'Not provided'}
PREVIOUS DIALOGUE: ${previousDialogue || 'None - this is the start of the scene'}
TONE: ${tone}

Generate ${count} different dialogue options. Each should feature a different character speaking or offer a different emotional approach to the scene. Include emotions like: determined, worried, angry, hopeful, sarcastic, tender, etc.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please wait a moment and try again." }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;
    
    console.log('AI response content:', content);

    if (!content) {
      throw new Error('No content in AI response');
    }

    // Parse JSON from response
    let suggestions;
    try {
      // Try to find JSON in the response
      const jsonMatch = content.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        suggestions = parsed.suggestions || [];
      } else {
        // Try parsing the whole content as JSON
        const parsed = JSON.parse(content);
        suggestions = parsed.suggestions || [];
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.log('Raw content:', content);
      suggestions = [];
    }

    // Validate and clean suggestions
    const validSuggestions = suggestions
      .filter((s: any) => s.speaker && s.dialogue)
      .map((s: any) => ({
        speaker: String(s.speaker).trim(),
        dialogue: String(s.dialogue).trim(),
        emotion: String(s.emotion || 'neutral').toLowerCase().trim(),
      }))
      .slice(0, count);

    console.log('Generated suggestions:', validSuggestions.length);

    return new Response(
      JSON.stringify({ suggestions: validSuggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error generating dialogue:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        suggestions: [] 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
