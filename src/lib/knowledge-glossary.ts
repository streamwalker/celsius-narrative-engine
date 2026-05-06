import { narrativeGlossary, type GlossaryEntry as NarrativeEntry } from './narrative-glossary';

export type KnowledgeCategory =
  | 'characters'
  | 'organizations'
  | 'technologies'
  | 'locations'
  | 'symbols'
  | 'historical'
  | 'lore'
  | 'business'
  | 'technical'
  | 'legal'
  | 'products'
  // legacy narrative categories
  | 'structure'
  | 'character'
  | 'proprietary'
  | 'industry'
  | 'medium';

export interface KnowledgeEntry {
  id: string;
  term: string;
  category: KnowledgeCategory;
  short: string;            // tooltip-length
  full: string;             // expanded explanation
  plain: string;            // plain-English version
  example?: string;
  whyItMatters?: string;
  related?: string[];       // ids of related entries
  icon?: string;            // emoji or short symbol
  image?: string;           // optional URL
  link?: string;            // external/full glossary link
}

export const categoryLabels: Record<KnowledgeCategory, string> = {
  characters: 'Characters',
  organizations: 'Organizations',
  technologies: 'Technologies',
  locations: 'Locations',
  symbols: 'Symbols',
  historical: 'Historical Events',
  lore: 'Lore / Mythology',
  business: 'Business',
  technical: 'Technical',
  legal: 'Legal / Financial',
  products: 'Products / Services',
  structure: 'Story Structure',
  character: 'Character Craft',
  proprietary: 'Celsius™',
  industry: 'Industry',
  medium: 'Medium',
};

export const categoryColors: Record<KnowledgeCategory, string> = {
  characters: 'border-amber-500/50 text-amber-400',
  organizations: 'border-emerald-500/50 text-emerald-400',
  technologies: 'border-cyan-500/50 text-cyan-400',
  locations: 'border-lime-500/50 text-lime-400',
  symbols: 'border-fuchsia-500/50 text-fuchsia-400',
  historical: 'border-orange-500/50 text-orange-400',
  lore: 'border-purple-500/50 text-purple-400',
  business: 'border-blue-500/50 text-blue-400',
  technical: 'border-sky-500/50 text-sky-400',
  legal: 'border-rose-500/50 text-rose-400',
  products: 'border-primary/50 text-primary',
  structure: 'border-blue-500/50 text-blue-400',
  character: 'border-amber-500/50 text-amber-400',
  proprietary: 'border-primary/50 text-primary',
  industry: 'border-emerald-500/50 text-emerald-400',
  medium: 'border-purple-500/50 text-purple-400',
};

// New seed entries spanning the full range of categories.
const seedEntries: KnowledgeEntry[] = [
  {
    id: 'astralnaut',
    term: 'Astralnaut',
    category: 'characters',
    icon: '🚀',
    short: 'A traveler bound to the Astral Field by ritual and machine.',
    full: 'Astralnauts are individuals trained to project consciousness across the Astral Field using a paired Resonance Suit and chant-protocol. They are part explorer, part priest, part pilot.',
    plain: 'A space-mind explorer who uses a special suit to travel with their thoughts.',
    example: '"Send the senior astralnaut — the trench is collapsing again."',
    whyItMatters: 'Astralnauts anchor most of our cross-story arcs and define the rules of contact between worlds.',
    related: ['astral_field', 'resonance_suit', 'aquarius_order'],
  },
  {
    id: 'astral_field',
    term: 'Astral Field',
    category: 'lore',
    icon: '🌌',
    short: 'The substrate connecting minds, memories, and far places.',
    full: 'A non-local layer of reality where thought, time, and gravity behave as gradients. Travel is by intent; risk is by exposure.',
    plain: 'An invisible layer where thoughts can travel between people and places.',
    example: 'Crossing the Astral Field at full bandwidth is the cause of most "echo" disorders.',
    whyItMatters: 'Every faction in the universe is fighting over who gets to map and exploit it.',
    related: ['astralnaut', 'echo_disorder'],
  },
  {
    id: 'aquarius_order',
    term: 'Order of Aquarius',
    category: 'organizations',
    icon: '♒',
    short: 'A monastic-engineering order stewarding the Astral Field.',
    full: 'Founded after the First Resonance, the Order trains astralnauts, maintains the Resonance Cathedrals, and enforces the Concord of Silent Waters.',
    plain: 'A group of monk-engineers who train space travelers and protect the rules.',
    example: 'The Order of Aquarius refused to authorize the dive — for the third time.',
    whyItMatters: 'They are the gatekeepers; nearly every plot conflict eventually passes through them.',
    related: ['astralnaut', 'concord_silent_waters'],
  },
  {
    id: 'resonance_suit',
    term: 'Resonance Suit',
    category: 'technologies',
    icon: '🛠️',
    short: 'A wearable that tunes the wearer to the Astral Field.',
    full: 'A layered garment of conductive silk, bone-channel implants, and a chant-driven resonator. Calibrated per-wearer; uncalibrated use is fatal.',
    plain: 'A high-tech suit that lets a person safely connect to the Astral Field.',
    example: 'Her resonance suit was humming a fourth above standard — a sign of drift.',
    whyItMatters: 'The suit defines who can travel and who cannot — pure power and politics.',
    related: ['astralnaut', 'astral_field'],
  },
  {
    id: 'silent_waters',
    term: 'Silent Waters',
    category: 'locations',
    icon: '🌊',
    short: 'The forbidden inner sea beneath the Cathedrals.',
    full: 'A vast subterranean ocean where the Astral Field touches matter. Sound does not propagate; thought does.',
    plain: 'A hidden underground sea where you can hear thoughts but not voices.',
    example: 'Only sealed astralnauts may walk the shore of the Silent Waters.',
    related: ['aquarius_order', 'concord_silent_waters'],
  },
  {
    id: 'concord_silent_waters',
    term: 'Concord of Silent Waters',
    category: 'historical',
    icon: '📜',
    short: 'The treaty that ended the First Resonance Wars.',
    full: 'Signed by the surviving Houses and the Order, it codified who may dive, when, and at what depth. It is renewed every nine years under starlight.',
    plain: 'An old peace treaty that decides who is allowed to use the Astral Field.',
    whyItMatters: 'Every modern crisis tests whether this treaty still holds.',
    related: ['aquarius_order', 'silent_waters'],
  },
  {
    id: 'sigil_of_nine',
    term: 'Sigil of Nine',
    category: 'symbols',
    icon: '✶',
    short: 'A nine-pointed mark worn by sealed astralnauts.',
    full: 'Each point represents one renewal of the Concord. The sigil is burned, not drawn.',
    plain: 'A nine-pointed star tattoo that marks a fully trained astralnaut.',
    related: ['concord_silent_waters', 'astralnaut'],
  },
  {
    id: 'echo_disorder',
    term: 'Echo Disorder',
    category: 'technical',
    icon: '🧠',
    short: 'Persistent intrusion of foreign thought after a dive.',
    full: 'A spectrum condition characterized by recursive memory, voice-echoes, and time-stutter. Treated with grounding rituals and signal-dampening implants.',
    plain: 'A condition where someone keeps hearing thoughts that are not theirs after a trip.',
    example: 'He was grounded for six months after a Class-3 echo disorder.',
    related: ['astral_field', 'resonance_suit'],
  },
  {
    id: 'celsius_engine',
    term: 'Celsius Narrative Engine™',
    category: 'products',
    icon: '🔥',
    short: 'A proprietary system for designing and stress-testing stories.',
    full: 'Combines Tri-Axis Story Architecture, the Celsius Tension Index™, and AI-assisted scene engineering into one workflow.',
    plain: 'Software that helps writers build stronger stories by checking structure and tension.',
    example: 'The Engine flagged Act II as low pressure; we rewrote the midpoint.',
    whyItMatters: 'It is the core product the rest of the universe is built around.',
    related: ['narrative_triad', 'celsius_tension_index'],
  },
  {
    id: 'ip_license',
    term: 'IP License',
    category: 'legal',
    icon: '⚖️',
    short: 'A formal grant to use a creative property under set terms.',
    full: 'A contract specifying scope, territory, term, royalties, and approvals for using a character, world, or system.',
    plain: 'A written deal that says how someone is allowed to use a creative work.',
    whyItMatters: 'Determines who profits when stories scale into film, games, or merch.',
    related: ['franchise_extension_hook'],
  },
  {
    id: 'tri_axis',
    term: 'Tri-Axis Architecture',
    category: 'business',
    icon: '🧭',
    short: 'A three-axis model of narrative used by the Engine.',
    full: 'A-AXIS (external drive), B-AXIS (internal resistance), C-AXIS (opposition intelligence). All three must be active for a scene to load.',
    plain: 'A way to check that every scene has action, feeling, and a real opponent.',
    example: 'Scene 12 is all A-AXIS — add B before staging.',
    related: ['narrative_triad', 'celsius_engine'],
  },
];

// Adapt narrative glossary entries (short-form) into KnowledgeEntry shape.
const narrativeAdapted: KnowledgeEntry[] = Object.entries(narrativeGlossary).map(
  ([id, e]: [string, NarrativeEntry]) => ({
    id,
    term: e.term,
    category: e.category as KnowledgeCategory,
    short: e.definition.length > 140 ? e.definition.slice(0, 137) + '…' : e.definition,
    full: e.definition,
    plain: e.definition,
  }),
);

const all: KnowledgeEntry[] = [...seedEntries, ...narrativeAdapted];
const byId = new Map(all.map((e) => [e.id, e]));
// also index by lowercased term for HighlightedTerm convenience
const byTerm = new Map(all.map((e) => [e.term.toLowerCase(), e]));

export function getEntry(idOrTerm: string): KnowledgeEntry | undefined {
  return byId.get(idOrTerm) ?? byTerm.get(idOrTerm.toLowerCase());
}

export function getAllEntries(): KnowledgeEntry[] {
  return all;
}

export function getCategories(): KnowledgeCategory[] {
  return Array.from(new Set(all.map((e) => e.category)));
}
