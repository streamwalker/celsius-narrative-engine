/** Original teaching prompts; the twelve-stage framework is attributed to Vogler. */
export const GUIDE_SOURCE = 'https://mwp.com/product/writers-journey-25th-anniversary-edition-mythic-structure-writers/';
export const STAGES = [
  ['ordinary', 'Ordinary World', 1, 'Reveal what normal life rewards, hides, and costs.', 'Which custom or institution keeps the protagonist comfortable—and constrained?', 'Show the belief that currently helps them survive.'],
  ['call', 'Call to Adventure', 1, 'Disturb the existing order with a problem the protagonist cannot ignore.', 'Which crack in the world becomes impossible to overlook?', 'Make the opportunity and its personal cost visible.'],
  ['refusal', 'Refusal of the Call', 1, 'Let hesitation reveal something worth losing.', 'Which border, taboo, obligation, or material risk makes refusal reasonable?', 'A refusal can be brief, transferred to another character, or deliberately omitted.'],
  ['mentor', 'Meeting the Mentor', 1, 'Offer knowledge, a tool, or a perspective—not an automatic solution.', 'Whose history does the guide carry, and where is that knowledge incomplete?', 'A mentor need not be older, trustworthy, or even a person.'],
  ['threshold', 'Crossing the First Threshold', 2, 'Turn intention into a commitment with consequences.', 'Which boundary changes the rules of survival, belonging, or power?', 'The threshold can be a decision or relationship rather than a physical journey.'],
  ['tests', 'Tests, Allies, and Enemies', 2, 'Use escalating encounters to test the protagonist’s strategy.', 'Let factions, resources, and customs create choices rather than exposition.', 'Show how allies and opponents adapt to the protagonist.'],
  ['approach', 'Approach to the Inmost Cave', 2, 'Prepare for a confrontation that the old strategy may not survive.', 'Which place or institution concentrates the world’s central conflict?', 'The cave can be an emotional, political, or moral danger.'],
  ['ordeal', 'The Ordeal', 2, 'Force a costly collision between desire, fear, and reality.', 'How does a historical conflict or world rule make the personal crisis unavoidable?', 'This major crisis is not automatically the final climax. Literal death is optional.'],
  ['reward', 'The Reward', 2, 'Give the protagonist something gained—and something newly owed.', 'Who loses power or access when this truth, artifact, or alliance is acquired?', 'A reward can be ambiguous; success may make the next problem worse.'],
  ['road-back', 'The Road Back', 3, 'Make the consequences of the ordeal follow the protagonist.', 'How do communities and rival powers respond to the changed balance?', 'Return can mean renewed commitment, not simply retracing a route.'],
  ['resurrection', 'The Resurrection', 3, 'Stage a decisive test of the protagonist’s changed—or unchanged—values.', 'Which old and new rules collide, and what must be sacrificed?', 'A flat or tragic arc can deliberately reject a positive transformation.'],
  ['elixir', 'Return with the Elixir', 3, 'Show what the story’s choices leave behind.', 'What changes for ordinary people, and who still bears the cost?', 'Restoration, disruption, and failure are all possible endings.'],
] as const;
export type Structure = 'hero' | 'three-act' | 'freeform';
export const STRUCTURES: Record<Structure, string> = { hero: 'Hero’s Journey', 'three-act': 'Three-act', freeform: 'Freeform' };
export const LANES = [
  { key: 'external', label: 'External drive', axis: 'A', prompt: 'What happens, and what does the protagonist want now?' },
  { key: 'internal', label: 'Internal resistance', axis: 'B', prompt: 'Which belief is tested? How do they respond?' },
  { key: 'opposition', label: 'Opposition intelligence', axis: 'C', prompt: 'What does the opposing person, system, or force do next?' },
  { key: 'world', label: 'World pressure', axis: 'W', prompt: 'Which cultural, physical, technological, or magical rule shapes the choice?' },
  { key: 'decision', label: 'Decisive choice', axis: '→', prompt: 'What do they choose instead of the available alternative?' },
  { key: 'consequence', label: 'Consequence', axis: '↗', prompt: 'Because of this choice, what must happen next?' },
] as const;
export const WORLD_KINDS = ['Geography', 'Culture', 'History', 'Faction', 'Magic', 'Technology', 'Cosmology'] as const;
export const DNA = [
  ['protag_name', 'Protagonist', 'Who is under pressure?'],
  ['theme', 'Thematic question', 'What competing values will this story test?'],
  ['a_goal', 'External objective', 'What do they want, and what happens if they fail?'],
  ['protag_flaw', 'Vulnerability / inner conflict', 'What makes their usual strategy costly?'],
  ['protag_misbelief', 'Starting belief', 'What do they believe about themselves or the world?'],
  ['antag_name', 'Opposing person or force', 'A rival, an institution, nature, or an internal conflict…'],
  ['antag_want', 'Opposition’s objective', 'What does the opposition protect or pursue?'],
  ['antag_belief', 'Opposition’s logic', 'Why does its behavior make sense on its own terms?'],
  ['world_before', 'World before', 'Who benefits from the starting order?'],
  ['world_after', 'World after', 'Who benefits, who pays, and what cannot be restored?'],
] as const;
