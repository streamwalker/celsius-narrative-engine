import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ParsedPanel {
  description: string;
  dialogue?: string;
  narration?: string;
  characters?: string[];
}

interface LayoutRequest {
  panels: ParsedPanel[];
  pageNumber: number;
  genre?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { panels, pageNumber, genre }: LayoutRequest = await req.json();

    console.log(`Analyzing layout for page ${pageNumber} with ${panels.length} panels`);

    const panelDescriptions = panels.map((p, i) => 
      `Panel ${i + 1}: ${p.description}${p.dialogue ? ` | Dialogue: "${p.dialogue.substring(0, 100)}..."` : ''}${p.narration ? ` | Narration: "${p.narration.substring(0, 50)}..."` : ''}`
    ).join('\n');

    const prompt = `You are an expert comic book layout designer. Analyze these comic panels and suggest optimal layouts.

PAGE ${pageNumber} PANELS:
${panelDescriptions}

${genre ? `GENRE: ${genre}` : ''}

For each panel, provide:
1. suggestedSize: "full" | "large" | "medium" | "small" | "strip"
2. cameraAngle: "wide" | "medium" | "closeup" | "extreme-closeup" | "bird-eye" | "worm-eye"
3. dramaticWeight: 1-5 (5 being most dramatic/important)
4. isKeyMoment: true/false
5. keyMomentType: "revelation" | "action-peak" | "emotional-beat" | "transition" | "establishing" (if isKeyMoment is true)
6. compositionNotes: Brief notes on framing and composition
7. reasoning: Why you made these choices

Also provide:
- overallPacing: "fast" | "medium" | "slow" | "variable"
- suggestedTemplate: "standard-grid" | "dynamic-flow" | "splash-heavy" | "dialogue-focused" | "action-sequence"
- narrativeNotes: Overall page flow suggestions

Respond in JSON format:
{
  "overallPacing": "...",
  "suggestedTemplate": "...",
  "narrativeNotes": "...",
  "estimatedImpact": 1-10,
  "panelSuggestions": [
    {
      "panelIndex": 0,
      "suggestedSize": "...",
      "cameraAngle": "...",
      "dramaticWeight": 3,
      "isKeyMoment": false,
      "keyMomentType": null,
      "compositionNotes": "...",
      "reasoning": "..."
    }
  ]
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 2048,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON in response');
    }

    const analysisResult = JSON.parse(jsonMatch[0]);

    // Validate and normalize the response
    const normalizedResult = {
      overallPacing: analysisResult.overallPacing || 'medium',
      suggestedTemplate: analysisResult.suggestedTemplate || 'standard-grid',
      narrativeNotes: analysisResult.narrativeNotes || '',
      estimatedImpact: Math.min(10, Math.max(1, analysisResult.estimatedImpact || 5)),
      panelSuggestions: (analysisResult.panelSuggestions || []).map((s: any, i: number) => ({
        panelIndex: s.panelIndex ?? i,
        panelKey: `${pageNumber}-${i}`,
        suggestedSize: s.suggestedSize || 'medium',
        suggestedCameraAngle: s.cameraAngle || 'medium',
        dramaticWeight: Math.min(5, Math.max(1, s.dramaticWeight || 2)),
        isKeyMoment: s.isKeyMoment || false,
        keyMomentType: s.keyMomentType || undefined,
        compositionNotes: s.compositionNotes || '',
        reasoning: s.reasoning || '',
      })),
    };

    console.log('Layout analysis complete:', normalizedResult.suggestedTemplate);

    return new Response(
      JSON.stringify(normalizedResult),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Scene layout analysis error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        overallPacing: 'medium',
        suggestedTemplate: 'standard-grid',
        narrativeNotes: 'Analysis failed - using defaults',
        estimatedImpact: 5,
        panelSuggestions: [],
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
