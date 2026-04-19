import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CharacterInput {
  name: string;
  description: string;
  archetype?: string;
  traits?: string[];
}

interface ChapterInput {
  title: string;
  status: string;
  themes: string[];
}

interface StoryArcInput {
  title: string;
  genre: string;
  themes: string[];
  chapters: ChapterInput[];
}

interface EventInput {
  title: string;
  type: string;
  significance: string;
  involvedCharacters: string[];
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { characters, storyArcs, events } = await req.json() as {
      characters: CharacterInput[];
      storyArcs: StoryArcInput[];
      events: EventInput[];
    };

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Build context for AI analysis
    const characterSummary = characters.map(c => 
      `- ${c.name}: ${c.description}${c.archetype ? ` (${c.archetype})` : ''}${c.traits?.length ? ` - Traits: ${c.traits.join(', ')}` : ''}`
    ).join('\n');

    const arcSummary = storyArcs.map(arc =>
      `- "${arc.title}" (${arc.genre}): Themes: ${arc.themes.join(', ')}. Chapters: ${arc.chapters.map(ch => `${ch.title} [${ch.status}]`).join(', ')}`
    ).join('\n');

    const recentEvents = events.slice(-10).map(e =>
      `- ${e.title} (${e.type}, ${e.significance}): Characters: ${e.involvedCharacters.join(', ')}`
    ).join('\n');

    const prompt = `You are a creative writing assistant specializing in narrative development. Analyze the following story elements and provide creative suggestions.

CHARACTERS:
${characterSummary || 'No characters defined yet.'}

STORY ARCS:
${arcSummary || 'No story arcs defined yet.'}

RECENT EVENTS:
${recentEvents || 'No events recorded yet.'}

Based on this analysis, provide:

1. PLOT SUGGESTIONS: Generate 3-4 plot development ideas that would fit well with the existing characters and story. Each should have:
   - A compelling title
   - Brief description
   - Type (plot_twist, character_development, conflict, resolution, or relationship)
   - Which characters would be involved
   - The setup (how to introduce this plot point)
   - The payoff (what makes this satisfying)
   - Tension level (low, medium, high)

2. CHARACTER ARC SUGGESTIONS: For each main character, suggest a potential character arc including:
   - Their current state based on events
   - A suggested arc/transformation
   - Key milestones for their journey
   - Challenges they might face
   - Potential growth outcome

Respond in this exact JSON format:
{
  "plotSuggestions": [
    {
      "title": "string",
      "description": "string",
      "type": "plot_twist|character_development|conflict|resolution|relationship",
      "involvedCharacters": ["string"],
      "setup": "string",
      "payoff": "string",
      "tension": "low|medium|high"
    }
  ],
  "characterArcSuggestions": [
    {
      "characterName": "string",
      "currentState": "string",
      "suggestedArc": "string",
      "milestones": ["string"],
      "challenges": ["string"],
      "potentialGrowth": "string"
    }
  ]
}`;

    console.log("Generating story suggestions...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: "You are an expert story consultant who provides insightful narrative suggestions. Always respond with valid JSON only, no markdown formatting."
          },
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Usage limit reached. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("No content in AI response");
    }

    // Parse the JSON response
    let suggestions;
    try {
      // Try to extract JSON if wrapped in markdown
      const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/```\s*([\s\S]*?)\s*```/);
      const jsonStr = jsonMatch ? jsonMatch[1] : content;
      suggestions = JSON.parse(jsonStr.trim());
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      // Return default suggestions on parse failure
      suggestions = {
        plotSuggestions: [
          {
            title: "Unexpected Alliance",
            description: "Two opposing characters must work together to overcome a common threat.",
            type: "conflict",
            involvedCharacters: characters.slice(0, 2).map(c => c.name),
            setup: "A mutual enemy emerges that neither can defeat alone.",
            payoff: "They discover unexpected respect for each other.",
            tension: "medium"
          }
        ],
        characterArcSuggestions: characters.slice(0, 3).map(c => ({
          characterName: c.name,
          currentState: `${c.name} is establishing their role in the story.`,
          suggestedArc: "A journey of self-discovery and growth.",
          milestones: ["Face a significant challenge", "Make a difficult choice", "Achieve a meaningful victory"],
          challenges: ["Overcoming self-doubt", "Dealing with external opposition"],
          potentialGrowth: "Emerges as a more confident and capable individual."
        }))
      };
    }

    console.log("Generated suggestions successfully");

    return new Response(
      JSON.stringify(suggestions),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: unknown) {
    console.error("Error generating suggestions:", error);
    const message = error instanceof Error ? error.message : "Failed to generate suggestions";
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
