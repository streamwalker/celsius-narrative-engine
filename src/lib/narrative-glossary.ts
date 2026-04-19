export interface GlossaryEntry {
  term: string;
  definition: string;
  category: 'structure' | 'character' | 'proprietary' | 'industry' | 'medium';
}

export const narrativeGlossary: Record<string, GlossaryEntry> = {
  // ── Structure Terms ──
  'inciting_incident': {
    term: 'Inciting Incident',
    definition: 'The event that disrupts the protagonist\'s status quo and launches the main conflict. It cannot be ignored or reversed — it demands a response.',
    category: 'structure',
  },
  'point_of_no_return': {
    term: 'Point of No Return',
    definition: 'The moment where the protagonist commits to the journey. Retreat is no longer possible — the old world is gone.',
    category: 'structure',
  },
  'midpoint': {
    term: 'Midpoint / The Trap',
    definition: 'The structural center of Act II where the protagonist makes the wrong choice for the right reason. It redefines the problem and raises the stakes.',
    category: 'structure',
  },
  'low_point': {
    term: 'Low Point',
    definition: 'The emotional and tactical bottom — everything collapses externally and internally. All hope appears lost before Act III.',
    category: 'structure',
  },
  'denouement': {
    term: 'Denouement',
    definition: 'The final resolution after the climax. It shows the new status quo, the cost of victory, and proves (or disproves) the theme.',
    category: 'structure',
  },
  'climax': {
    term: 'Climax',
    definition: 'The highest point of dramatic tension where the central conflict is resolved through the protagonist\'s final action or decision.',
    category: 'structure',
  },
  'three_act_structure': {
    term: 'Three-Act Structure',
    definition: 'A narrative model dividing a story into Setup (Act I), Confrontation (Act II), and Resolution (Act III). The backbone of most screenwriting frameworks.',
    category: 'structure',
  },
  'beat': {
    term: 'Beat',
    definition: 'The smallest unit of story change — a shift in value, information, or emotion. Multiple beats form a scene; multiple scenes form a sequence.',
    category: 'structure',
  },
  'franchise_extension_hook': {
    term: 'Franchise Extension Hook',
    definition: 'A planted narrative element that creates sequel or spinoff potential without undermining the current story\'s resolution.',
    category: 'structure',
  },
  'causality_chain': {
    term: 'Causality Chain',
    definition: 'The logical sequence where each scene\'s events are caused by the previous scene and cause the next. "Because of X, then Y" — not "and then."',
    category: 'structure',
  },
  'stakes': {
    term: 'Stakes',
    definition: 'What the protagonist stands to lose if they fail. Stakes must be specific, irreversible, and escalating to maintain audience investment.',
    category: 'structure',
  },

  // ── Character Terms ──
  'archetype': {
    term: 'Archetype',
    definition: 'A recurring character pattern (e.g., Reluctant Hero, Anti-Hero, Mentor, Trickster) that provides audience shorthand for behavior expectations and narrative function.',
    category: 'character',
  },
  'misbelief': {
    term: 'Misbelief',
    definition: 'The false internal truth the character operates under. Their arc is defined by confronting and overcoming (or succumbing to) this lie.',
    category: 'character',
  },
  'core_flaw': {
    term: 'Core Flaw',
    definition: 'The protagonist\'s internal weakness that actively sabotages their progress. It\'s not a quirk — it\'s the thing that will destroy them if left unchecked.',
    category: 'character',
  },
  'character_arc': {
    term: 'Character Arc',
    definition: 'The internal transformation a character undergoes from who they are at the start to who they become by the end. Positive arcs overcome the misbelief; negative arcs succumb to it.',
    category: 'character',
  },
  'mirror_character': {
    term: 'Mirror Character',
    definition: 'An antagonist whose flaw is the inverse or reflection of the protagonist\'s. Their defeat thematically proves the protagonist\'s growth.',
    category: 'character',
  },
  'revelation': {
    term: 'Revelation',
    definition: 'The moment in Act III where the protagonist recognizes their misbelief and chooses a new truth. "I thought ___, but the real truth is ___."',
    category: 'character',
  },
  'internal_contradiction': {
    term: 'Internal Contradiction',
    definition: 'When a character wants one thing but behaves in the opposite way. Creates dramatic irony and drives internal conflict.',
    category: 'character',
  },
  'protagonist': {
    term: 'Protagonist',
    definition: 'The central character whose pursuit of a goal drives the story. Not necessarily the "hero" — they must want something and face escalating obstacles.',
    category: 'character',
  },
  'antagonist': {
    term: 'Antagonist',
    definition: 'The primary opposing force. The strongest antagonists believe they are right, have logical motivation, and escalate pressure intelligently.',
    category: 'character',
  },

  // ── Proprietary / Celsius Terms ──
  'core_story_dna': {
    term: 'Core Story DNA',
    definition: 'The foundational elements (theme, protagonist, objective, antagonist) that must be solid before any structural work begins. If the DNA is weak, everything built on it fails.',
    category: 'proprietary',
  },
  'a_axis': {
    term: 'A-AXIS (External Drive)',
    definition: 'The observable, goal-driven progression of the protagonist. What they want, what they do to get it, and the external stakes of failure. The engine of plot.',
    category: 'proprietary',
  },
  'b_axis': {
    term: 'B-AXIS (Internal Resistance)',
    definition: 'The psychological and emotional barriers preventing success. Flaws, vulnerabilities, and internal contradictions that the protagonist must overcome or be destroyed by.',
    category: 'proprietary',
  },
  'c_axis': {
    term: 'C-AXIS (Opposition Intelligence)',
    definition: 'The structured logic of the antagonist or opposing force — their motivation, credibility, escalation strategy, and why their worldview is defensible.',
    category: 'proprietary',
  },
  'celsius_tension_index': {
    term: 'Celsius Tension Index™',
    definition: 'Proprietary metric (0–100°C) measuring narrative energy and dramatic tension at any point in the story. Higher values indicate scenes of maximum conflict and stakes.',
    category: 'proprietary',
  },
  'narrative_pressure_score': {
    term: 'Narrative Pressure Score™',
    definition: 'Derived metric combining conflict density, dialogue intensity, and causality weight. Rates scenes as Low, Medium, High, or Critical pressure.',
    category: 'proprietary',
  },
  'axis_stability_rating': {
    term: 'Axis Stability Rating™',
    definition: 'Shows which narrative axes (A/B/C) are active in a scene and their relative weight. Unbalanced axes signal structural opportunities or risks.',
    category: 'proprietary',
  },
  'narrative_triad': {
    term: 'Celsius Narrative Triad™',
    definition: 'The proprietary Tri-Axis Story Architecture that models narrative across three simultaneous axes: A-AXIS (External Drive), B-AXIS (Internal Resistance), and C-AXIS (Opposition Intelligence).',
    category: 'proprietary',
  },
  'scene_engine': {
    term: 'Scene Engine',
    definition: 'The Celsius module that decomposes a narrative into structured, causally-linked scenes with purpose, tone, conflict analysis, and energy tracking.',
    category: 'proprietary',
  },
  'failure_diagnostics': {
    term: 'Failure Diagnostics',
    definition: 'Three critical checks: (1) Is the goal clear? (2) Does the flaw matter? (3) Is the antagonist right enough? If any fail, the story fails.',
    category: 'proprietary',
  },

  // ── Industry / Film Terms ──
  'cold_open': {
    term: 'Cold Open / Teaser',
    definition: 'A pre-credits sequence designed to hook the audience before the title card. Common in TV dramas and thrillers. Establishes tone and urgency.',
    category: 'industry',
  },
  'bottle_episode': {
    term: 'Bottle Episode',
    definition: 'A TV episode confined to a single location with minimal cast, typically for budget reasons. Often produces the most character-driven storytelling.',
    category: 'industry',
  },
  'b_roll': {
    term: 'B-Roll',
    definition: 'Supplemental footage intercut with the main shot. In narrative context, visual storytelling that conveys information without dialogue.',
    category: 'industry',
  },
  'logline': {
    term: 'Logline',
    definition: 'A one-to-two sentence summary of a story that captures the protagonist, conflict, and stakes. The elevator pitch of screenwriting.',
    category: 'industry',
  },
  'subtext': {
    term: 'Subtext',
    definition: 'What characters really mean beneath what they literally say. The strongest dialogue operates on two levels — surface and subtext.',
    category: 'industry',
  },
  'dramatic_irony': {
    term: 'Dramatic Irony',
    definition: 'When the audience knows something a character doesn\'t. Creates tension, suspense, and emotional investment.',
    category: 'industry',
  },
  'exposition': {
    term: 'Exposition',
    definition: 'Information the audience needs to understand the story. Bad exposition is told; good exposition is shown through conflict and action.',
    category: 'industry',
  },
  'act_break': {
    term: 'Act Break',
    definition: 'The transition point between acts, marked by a significant shift in the protagonist\'s situation. In TV, these align with commercial breaks.',
    category: 'industry',
  },
  'pacing': {
    term: 'Pacing',
    definition: 'The rhythm and speed at which story information is revealed. Controlled through scene length, dialogue density, and action-to-reflection ratio.',
    category: 'industry',
  },

  // ── Medium Terms ──
  'splash_page': {
    term: 'Splash Page',
    definition: 'A full-page comic panel used for maximum visual impact at key story moments — reveals, climaxes, or establishing shots.',
    category: 'medium',
  },
  'page_turn_reveal': {
    term: 'Page-Turn Reveal',
    definition: 'A comic storytelling technique where a major reveal is placed on the first panel of a new page, creating a dramatic moment when the reader turns the page.',
    category: 'medium',
  },
  'intermission': {
    term: 'Intermission',
    definition: 'A break between acts in a stage play. Typically placed after the midpoint to let the audience process the first half\'s escalation.',
    category: 'medium',
  },
  'stage_directions': {
    term: 'Stage Directions',
    definition: 'Written instructions in a play script describing character movement, positioning, and physical action. Distinct from dialogue.',
    category: 'medium',
  },
  'episode_arc': {
    term: 'Episode Arc',
    definition: 'The self-contained story within a single TV episode. Must resolve its own conflict while advancing the season-long narrative.',
    category: 'medium',
  },
  'season_arc': {
    term: 'Season Arc',
    definition: 'The overarching narrative spanning an entire TV season. Each episode advances this arc while telling its own story.',
    category: 'medium',
  },
};

export function getGlossaryEntry(key: string): GlossaryEntry | undefined {
  return narrativeGlossary[key];
}

export function getAllGlossaryEntries(): GlossaryEntry[] {
  return Object.values(narrativeGlossary);
}
