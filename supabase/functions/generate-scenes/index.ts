import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { storyData, medium, mediumConfig, episodeNumber, totalEpisodes } = await req.json();

    const isTvSeriesEpisode = medium === 'tv_series' && episodeNumber && totalEpisodes;

    // Determine scene count based on medium
    let sceneRange = '24-32';
    let structureNotes = '3-act structure, classic beat sheet pacing';
    
    switch (medium) {
      case 'film':
        sceneRange = '24-32';
        structureNotes = `3-act feature film structure. Runtime: ${mediumConfig?.length || '120'} min. Classic beat sheet with inciting incident, midpoint, low point, climax.`;
        break;
      case 'tv_episode':
        sceneRange = '8-12';
        structureNotes = `TV episode structure. Length: ${mediumConfig?.length || '44'} min. Teaser/cold open + 4-5 acts + tag. Each act ends on a mini-cliffhanger.`;
        break;
      case 'tv_series':
        sceneRange = '8-12';
        if (isTvSeriesEpisode) {
          const arcPhase = episodeNumber <= Math.ceil(totalEpisodes * 0.3)
            ? 'SETUP PHASE (establish world, characters, central conflict)'
            : episodeNumber <= Math.ceil(totalEpisodes * 0.7)
              ? 'ESCALATION PHASE (deepen conflict, raise stakes, complicate relationships)'
              : 'RESOLUTION PHASE (converge threads, climax, resolve or transform)';

          // Determine allowed beat tiers for this episode
          const setupEnd = Math.ceil(totalEpisodes * 0.3);
          const escalationEnd = Math.ceil(totalEpisodes * 0.7);
          const collapseEnd = Math.ceil(totalEpisodes * 0.8);
          let allowedBeatTiers = '';
          if (episodeNumber <= setupEnd) {
            allowedBeatTiers = `ALLOWED BEAT TIERS for Episode ${episodeNumber}: "setup" and "escalation" ONLY.
FORBIDDEN: NO "midpoint", "collapse", or "resolution" tier beats. NO major reveals, NO identity collapses, NO irreversible shifts. Save those for later episodes.`;
          } else if (episodeNumber <= escalationEnd) {
            allowedBeatTiers = `ALLOWED BEAT TIERS for Episode ${episodeNumber}: "escalation" and "midpoint".
Major betrayals, identity questions, false victories, and midpoint reversals belong here. This is where the story deepens and complicates.`;
          } else if (episodeNumber <= collapseEnd) {
            allowedBeatTiers = `ALLOWED BEAT TIERS for Episode ${episodeNumber}: "collapse".
Everything breaks. Internal flaws are exposed. The antagonist gains control. Characters face their worst fears.`;
          } else {
            allowedBeatTiers = `ALLOWED BEAT TIERS for Episode ${episodeNumber}: "resolution".
Final confrontations, transformations, thematic payoff. Converge all major threads.`;
          }

          // Extract beat anchoring from story data
          const beatAnchoring = storyData ? `
BEAT ANCHORING FROM STORY DATA:
- Inciting Incident (from a1_inciting): Episodes 1-${setupEnd} ONLY
- Midpoint/Trap (from mid_choice, mid_change): Episodes ${setupEnd + 1}-${escalationEnd} ONLY
- Low Point (from low_external, low_internal): Episodes ${escalationEnd + 1}-${collapseEnd} ONLY
- Final Confrontation (from a3_confrontation): Episodes ${collapseEnd + 1}-${totalEpisodes} ONLY
If the story data contains these beats, ensure they appear in the correct episode range. Do NOT place them outside their designated range.` : '';
          
          structureNotes = `TV series — EPISODE ${episodeNumber} OF ${totalEpisodes} (${mediumConfig?.length || '44'} min each).
SEASON ARC POSITION: ${arcPhase}.

${allowedBeatTiers}
${beatAnchoring}

EPISODE INTERNAL STRUCTURE (MANDATORY):
Every episode must have its own self-contained tri-axis arc:
- ACT I (Hook): At least one A-axis scene (immediate objective), one B-axis scene (flaw pressure introduced), one C-axis scene (opposition presence felt)
- ACT II (Escalation): A-axis scene (plan progresses/fails), B-axis scene (internal tension increases), C-axis scene (antagonist adapts)
- ACT III (Turn): A-axis scene (outcome), B-axis scene (internal shift), C-axis scene (opposition advances or slips)
- ENDING: Cliffhanger that advances the SEASON arc without resolving it

Every scene MUST be tagged with:
- primaryAxis: "A" (External Drive), "B" (Internal Resistance), or "C" (Opposition Intelligence)
- beatTier: one of "setup", "escalation", "midpoint", "collapse", "resolution" — must match the allowed tiers for this episode

This is episode ${episodeNumber} of a ${totalEpisodes}-episode season. Structure this episode with:
- Cold open / teaser hook
- 4-5 act structure with act breaks
- Episode-specific A-plot that advances the season arc
- B-plot that develops character or thematic depth
- Cliffhanger or revelation ending that pulls into episode ${episodeNumber + 1 <= totalEpisodes ? episodeNumber + 1 : 'the season finale'}
${episodeNumber === 1 ? '- As the PILOT, establish the world, introduce the central conflict, and end with a hook that launches the season.' : ''}
${episodeNumber === totalEpisodes ? '- As the SEASON FINALE, converge all major threads, deliver the climactic confrontation, and resolve or transform the central question.' : ''}
${episodeNumber === Math.ceil(totalEpisodes / 2) ? '- As the MIDSEASON episode, deliver a major revelation or reversal that reframes everything.' : ''}`;
        } else {
          structureNotes = `TV series episode structure. ${mediumConfig?.episodes || '10'} episodes × ${mediumConfig?.length || '44'} min. Scene breakdown for a single representative episode with season arc awareness.`;
        }
        break;
      case 'comic': {
        const totalIssues = parseInt(mediumConfig?.issues || '6') || 6;
        const pagesPerIssue = parseInt(mediumConfig?.pages || '32') || 32;
        const isComicIssue = episodeNumber && totalEpisodes;

        sceneRange = '15-20';

        if (isComicIssue) {
          const arcPhase = episodeNumber <= Math.ceil(totalIssues * 0.3)
            ? 'SETUP ARC (introduce world, characters, central conflict)'
            : episodeNumber <= Math.ceil(totalIssues * 0.7)
              ? 'ESCALATION ARC (deepen conflict, raise stakes, twists)'
              : 'RESOLUTION ARC (converge threads, climax, payoff)';

          structureNotes = `Comic book — ISSUE ${episodeNumber} OF ${totalIssues} (${pagesPerIssue} pages each).
SERIES ARC POSITION: ${arcPhase}.

ISSUE INTERNAL STRUCTURE:
- Opening splash or hook page (high visual impact)
- Rising action across ${pagesPerIssue} pages with page-turn reveals
- Climactic sequence with splash or double-spread potential
- Cliffhanger ending that pulls into Issue ${episodeNumber + 1 <= totalIssues ? episodeNumber + 1 : 'the finale'}
${episodeNumber === 1 ? '- As ISSUE #1, establish the world, introduce the central conflict, and end with a hook.' : ''}
${episodeNumber === totalIssues ? '- As the FINAL ISSUE, converge all major threads and deliver the climactic resolution.' : ''}

Every scene MUST include these comic-specific fields:
- panelCount (integer 1-6): how many panels this scene spans on the page
- pageLayout (string): one of "standard-grid", "dynamic-flow", "splash-heavy", "dialogue-focused", "action-sequence"
- isSplashPage (boolean): true if this scene is a full-page splash

LAYOUT GUIDELINES:
- Action/revelation scenes → "splash-heavy" or "dynamic-flow", lower panel count (1-2)
- Dialogue scenes → "dialogue-focused" or "standard-grid", higher panel count (4-6)
- Chase/fight scenes → "action-sequence", medium panel count (3-4)
- Total panels across all scenes should approximate ${pagesPerIssue * 4} (avg 4 panels/page for ${pagesPerIssue} pages)`;
        } else {
          structureNotes = `Comic book structure. ${pagesPerIssue} pages per issue, ${totalIssues}-issue series. Include page-turn beats, splash page moments, and panel density notes.

Every scene MUST include these comic-specific fields:
- panelCount (integer 1-6): how many panels this scene spans
- pageLayout (string): one of "standard-grid", "dynamic-flow", "splash-heavy", "dialogue-focused", "action-sequence"
- isSplashPage (boolean): true if this scene is a full-page splash`;
        }
        break;
      }
      case 'stage_play':
        sceneRange = '12-20';
        structureNotes = `Stage play structure. ${mediumConfig?.acts || '3'}-act play, ~${mediumConfig?.runtime || '120'} min runtime. Include entrance/exit notes, stage directions, and intermission placement. Scenes defined by character entrances/exits.`;
        break;
    }

    // Build story context from filled fields
    const storyContext = Object.entries(storyData || {})
      .filter(([k, v]) => v && typeof v === 'string' && (v as string).trim() && !k.startsWith('_'))
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n');

    const systemPrompt = `You are a professional story architect and scene decomposition engine for the Celsius narrative platform, powered by the Celsius Narrative Triad™ framework. 
You break down stories into causally-linked scenes with rich metadata using Tri-Axis Story Architecture.
Every scene must answer: Why does it exist? What changes because of it? What breaks if you remove it?
You enforce narrative causality — each scene must logically build from the previous and set up the next.
You model conflict using the A-AXIS (External Drive), B-AXIS (Internal Resistance), and C-AXIS (Opposition Intelligence) framework.`;

    const episodeContext = isTvSeriesEpisode
      ? `\nIMPORTANT: You are generating scenes for EPISODE ${episodeNumber} OF ${totalEpisodes} in a TV series season. Each scene must be tagged with episode: ${episodeNumber}. The scenes should form a complete episode arc while serving the larger season narrative.`
      : '';

    const userPrompt = `Decompose this story into ${sceneRange} structured scenes.${episodeContext}

MEDIUM: ${medium || 'film'}
STRUCTURE NOTES: ${structureNotes}

STORY DATA:
${storyContext || 'No story data provided — generate a placeholder structure based on the medium.'}

Generate a complete scene breakdown. Each scene must include ALL of the following fields with substantive content (not placeholders):
- sceneNumber (integer)
- title (evocative scene title)
- act (integer: 1, 2, or 3 — or up to 5 for stage plays)
- sequence (string: e.g. "Setup", "Rising Action", "Climax")
- purpose (why this scene exists in the story)
- summary (2-3 sentence scene description)
- tone (e.g. "Tense, philosophical", "High-energy, chaotic")
- dialogueDensity ("Low", "Moderate", or "High")
- estimatedDialogueLines (integer: realistic estimate)
- conflictInternal (character vs self tension)
- conflictExternal (character vs character/system tension)
- buildsFrom (what previous scene/event this depends on)
- setsUp (what this scene makes possible next)
- keyFunction (narrative function: "Catalyst", "Point of No Return", "Revelation", "Escalation", "Resolution", etc.)
- visualSignature (key visual/setting description for this scene)
- energyLevel (integer 0-100, the "Celsius Scale" tension level)
- episode (integer: ${isTvSeriesEpisode ? episodeNumber : medium === 'comic' && episodeNumber ? episodeNumber : '1'})
- primaryAxis ("A" = External Drive, "B" = Internal Resistance, "C" = Opposition Intelligence — which narrative axis this scene primarily serves)
- beatTier ("setup", "escalation", "midpoint", "collapse", or "resolution" — the weight/importance of this story beat)
${medium === 'stage_play' ? '- entrancesExits (which characters enter/exit)\n- stageDirections (key blocking/staging notes)' : ''}
${medium === 'comic' ? '- panelCount (integer 1-6: how many panels this scene spans)\n- pageLayout (string: one of "standard-grid", "dynamic-flow", "splash-heavy", "dialogue-focused", "action-sequence")\n- isSplashPage (boolean: true if this is a full-page splash scene)' : ''}

CRITICAL RULES:
1. Scenes must form a causal chain — each scene's "buildsFrom" references the previous scene's events
2. Energy levels should create a recognizable tension arc (rising, dipping, climaxing)
3. Every scene needs genuine conflict (internal AND/OR external)
4. The "keyFunction" must be a specific narrative function, not generic
5. Every scene MUST have a primaryAxis (A, B, or C) and beatTier assigned
6. Aim for balanced axis distribution across the episode: roughly equal A, B, C scenes
${isTvSeriesEpisode ? `7. ALL scenes must have episode: ${episodeNumber}\n8. Scene numbering starts at 1 for this episode (not cumulative across the season)\n9. beatTier MUST match the allowed tiers for this episode's position in the season` : ''}`;

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) throw new Error('LOVABLE_API_KEY not configured');

    const toolSchema = {
      type: "function",
      function: {
        name: "scene_breakdown",
        description: "Returns a structured array of narrative scenes",
        parameters: {
          type: "object",
          properties: {
            scenes: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  sceneNumber: { type: "integer" },
                  title: { type: "string" },
                  act: { type: "integer" },
                  sequence: { type: "string" },
                  purpose: { type: "string" },
                  summary: { type: "string" },
                  tone: { type: "string" },
                  dialogueDensity: { type: "string", enum: ["Low", "Moderate", "High"] },
                  estimatedDialogueLines: { type: "integer" },
                  conflictInternal: { type: "string" },
                  conflictExternal: { type: "string" },
                  buildsFrom: { type: "string" },
                  setsUp: { type: "string" },
                  keyFunction: { type: "string" },
                  visualSignature: { type: "string" },
                  energyLevel: { type: "integer" },
                  episode: { type: "integer" },
                  entrancesExits: { type: "string" },
                  stageDirections: { type: "string" },
                  panelCount: { type: "integer" },
                  pageLayout: { type: "string", enum: ["standard-grid", "dynamic-flow", "splash-heavy", "dialogue-focused", "action-sequence"] },
                  isSplashPage: { type: "boolean" },
                  primaryAxis: { type: "string", enum: ["A", "B", "C"] },
                  beatTier: { type: "string", enum: ["setup", "escalation", "midpoint", "collapse", "resolution"] },
                },
                required: [
                  "sceneNumber", "title", "act", "sequence", "purpose", "summary",
                  "tone", "dialogueDensity", "estimatedDialogueLines",
                  "conflictInternal", "conflictExternal", "buildsFrom", "setsUp",
                  "keyFunction", "visualSignature", "energyLevel", "episode",
                  "primaryAxis", "beatTier"
                ]
              }
            }
          },
          required: ["scenes"]
        }
      }
    };

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [toolSchema],
        tool_choice: { type: "function", function: { name: "scene_breakdown" } },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('AI API error:', errText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const result = await response.json();
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    
    if (!toolCall?.function?.arguments) {
      throw new Error('No structured response from AI');
    }

    const scenes = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(scenes), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Scene generation error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Scene generation failed' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
