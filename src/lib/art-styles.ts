export type ArtStyle = 
  | 'western' 
  | 'manga' 
  | 'noir' 
  | 'watercolor'
  | 'arthur-adams'
  | 'alan-davis'
  | 'mark-silvestri'
  | 'john-byrne'
  | 'jim-lee'
  | 'barry-windsor-smith'
  | 'wendy-pini'
  | 'frank-miller'
  | 'oliver-coipel'
  | 'moebius'
  | 'mike-mignola'
  | 'todd-mcfarlane'
  | 'alex-ross';

export interface ArtStyleConfig {
  id: ArtStyle;
  name: string;
  description: string;
  promptModifier: string;
  preview: string;
  category: 'general' | 'artist';
  artistName?: string;
}

export interface StyleMix {
  primaryStyle: ArtStyle;
  secondaryStyle: ArtStyle;
  primaryIntensity: number; // 0-100
  secondaryIntensity: number; // 0-100
}

export const ART_STYLES: ArtStyleConfig[] = [
  // General Styles
  {
    id: 'western',
    name: 'Western Comics',
    description: 'Classic American comic book style with bold colors and dynamic action',
    promptModifier: 'American comic book art style, bold ink lines, vibrant saturated colors, dramatic shadows, dynamic poses, Marvel/DC style illustration',
    preview: '🦸',
    category: 'general',
  },
  {
    id: 'manga',
    name: 'Manga',
    description: 'Japanese manga style with expressive characters and screen tones',
    promptModifier: 'Japanese manga art style, clean line art, large expressive eyes, speed lines for motion, screen tone shading, black and white with occasional color accents, shounen manga aesthetic',
    preview: '🎌',
    category: 'general',
  },
  {
    id: 'noir',
    name: 'Noir',
    description: 'Dark, moody detective comic style with heavy shadows',
    promptModifier: 'Film noir comic style, high contrast black and white, heavy shadows, dramatic chiaroscuro lighting, gritty urban atmosphere, Sin City inspired, stark silhouettes',
    preview: '🌙',
    category: 'general',
  },
  {
    id: 'watercolor',
    name: 'Watercolor',
    description: 'Soft, painterly style with flowing colors',
    promptModifier: 'Watercolor painting style, soft flowing colors, organic brushstrokes, subtle gradients, dreamy atmospheric quality, fine art illustration, delicate linework with watercolor washes',
    preview: '🎨',
    category: 'general',
  },
  // Artist-Inspired Styles
  {
    id: 'arthur-adams',
    name: 'Arthur Adams',
    artistName: 'Arthur Adams',
    description: 'Hyper-detailed linework with intricate cross-hatching and dynamic creature designs',
    promptModifier: 'Arthur Adams comic art style, hyper-detailed linework, intricate cross-hatching, dynamic creature designs, densely packed compositions, anatomically exaggerated musculature, lush environmental detail, 1980s Marvel aesthetic',
    preview: '✨',
    category: 'artist',
  },
  {
    id: 'alan-davis',
    name: 'Alan Davis',
    artistName: 'Alan Davis',
    description: 'Clean, elegant linework with classic heroic proportions and expressive faces',
    promptModifier: 'Alan Davis comic art style, clean elegant linework, classic heroic proportions, expressive character faces, dynamic yet readable compositions, Excalibur era aesthetic, smooth shading, polished superhero illustration',
    preview: '🦅',
    category: 'artist',
  },
  {
    id: 'mark-silvestri',
    name: 'Mark Silvestri',
    artistName: 'Mark Silvestri',
    description: 'Gritty, edgy artwork with heavy shadows and kinetic energy',
    promptModifier: 'Mark Silvestri comic art style, gritty edgy linework, heavy dramatic shadows, sharp angular character features, kinetic action poses, scratchy textured inking, X-Men 90s aesthetic, intense atmospheric mood',
    preview: '⚡',
    category: 'artist',
  },
  {
    id: 'john-byrne',
    name: 'John Byrne',
    artistName: 'John Byrne',
    description: 'Classic Bronze Age style with clean storytelling and iconic poses',
    promptModifier: 'John Byrne comic art style, classic Bronze Age aesthetic, clean precise linework, strong anatomical foundations, iconic heroic poses, clear visual storytelling, X-Men and Fantastic Four era influence, traditional superhero illustration',
    preview: '🌟',
    category: 'artist',
  },
  {
    id: 'jim-lee',
    name: 'Jim Lee',
    artistName: 'Jim Lee',
    description: 'Highly detailed, dynamic artwork with intricate costumes and extreme poses',
    promptModifier: 'Jim Lee comic art style, highly detailed illustration, intricate costume designs, extreme dynamic poses, heavy cross-hatching, muscular heroic figures, 90s X-Men aesthetic, dramatic foreshortening, explosive action scenes',
    preview: '💥',
    category: 'artist',
  },
  {
    id: 'barry-windsor-smith',
    name: 'Barry Windsor-Smith',
    artistName: 'Barry Windsor-Smith',
    description: 'Elegant, illustrative approach with classical composition and painterly sensibilities',
    promptModifier: 'Barry Windsor-Smith art style, elegant illustrative approach, fine detailed linework, classical artistic composition, painterly sensibilities, Pre-Raphaelite influence, Conan the Barbarian era aesthetic, ornate decorative elements, fantasy illustration',
    preview: '⚔️',
    category: 'artist',
  },
  {
    id: 'wendy-pini',
    name: 'Wendy Pini',
    artistName: 'Wendy Pini',
    description: 'Graceful, expressive characters with manga influences and emotional storytelling',
    promptModifier: 'Wendy Pini art style, graceful expressive characters, manga-influenced large eyes, flowing organic linework, emotional storytelling focus, Elfquest aesthetic, fantasy illustration, delicate yet dynamic poses, nature-integrated compositions',
    preview: '🧝',
    category: 'artist',
  },
  {
    id: 'frank-miller',
    name: 'Frank Miller',
    artistName: 'Frank Miller',
    description: 'Bold, stark contrasts with noir influences and brutal, raw energy',
    promptModifier: 'Frank Miller art style, extreme high contrast black and white, bold graphic shapes, stark silhouettes, noir atmosphere, Sin City aesthetic, brutal raw energy, heavy black ink, minimal detail with maximum impact, gritty urban violence',
    preview: '🖤',
    category: 'artist',
  },
  {
    id: 'oliver-coipel',
    name: 'Oliver Coipel',
    artistName: 'Oliver Coipel',
    description: 'Modern cinematic style with fluid motion and emotional depth',
    promptModifier: 'Oliver Coipel art style, modern cinematic composition, fluid dynamic motion, emotional character expressions, elegant figure work, House of M era Marvel aesthetic, sophisticated linework, dramatic lighting, contemporary superhero illustration',
    preview: '🎬',
    category: 'artist',
  },
  {
    id: 'moebius',
    name: 'Moebius',
    artistName: 'Jean Giraud (Moebius)',
    description: 'Surreal sci-fi landscapes with intricate linework and dreamlike atmospheres',
    promptModifier: 'Moebius art style, intricate fine linework, surreal science fiction landscapes, dreamlike atmospheric quality, European bande dessinée aesthetic, psychedelic color palettes, otherworldly environments, detailed organic machinery, Heavy Metal magazine influence',
    preview: '🌌',
    category: 'artist',
  },
  {
    id: 'mike-mignola',
    name: 'Mike Mignola',
    artistName: 'Mike Mignola',
    description: 'Bold graphic shapes with heavy shadows and gothic horror atmosphere',
    promptModifier: 'Mike Mignola art style, bold graphic shapes, heavy black shadows, gothic horror atmosphere, Hellboy aesthetic, minimalist detail with maximum impact, stark angular forms, supernatural mood, expressionist influence, dramatic silhouettes',
    preview: '🔥',
    category: 'artist',
  },
  {
    id: 'todd-mcfarlane',
    name: 'Todd McFarlane',
    artistName: 'Todd McFarlane',
    description: 'Hyper-detailed with intricate cape work and spawn-style darkness',
    promptModifier: 'Todd McFarlane art style, hyper-detailed linework, intricate flowing capes and chains, extreme dynamic poses, Spawn aesthetic, dark supernatural atmosphere, complex textures, web-like details, 90s Image Comics style, dramatic compositions',
    preview: '🕷️',
    category: 'artist',
  },
  {
    id: 'alex-ross',
    name: 'Alex Ross',
    artistName: 'Alex Ross',
    description: 'Photorealistic painted style with classical heroic compositions',
    promptModifier: 'Alex Ross art style, photorealistic painted illustration, classical heroic compositions, realistic human anatomy, oil painting technique, Kingdom Come aesthetic, dramatic lighting, iconic superhero poses, fine art quality, Norman Rockwell influence',
    preview: '🖼️',
    category: 'artist',
  },
];

export function getStyleById(id: ArtStyle): ArtStyleConfig {
  return ART_STYLES.find(s => s.id === id) || ART_STYLES[0];
}

export function getStylesByCategory(category: 'general' | 'artist'): ArtStyleConfig[] {
  return ART_STYLES.filter(s => s.category === category);
}

export function generateMixedStylePrompt(mix: StyleMix): string {
  const primary = getStyleById(mix.primaryStyle);
  const secondary = getStyleById(mix.secondaryStyle);
  
  const primaryWeight = mix.primaryIntensity / 100;
  const secondaryWeight = mix.secondaryIntensity / 100;
  
  if (secondaryWeight === 0) {
    return primary.promptModifier;
  }
  
  if (primaryWeight === 0) {
    return secondary.promptModifier;
  }
  
  // Create a blended prompt with weighted emphasis
  const primaryEmphasis = primaryWeight > secondaryWeight ? 'primarily' : 'with elements of';
  const secondaryEmphasis = secondaryWeight > primaryWeight ? 'primarily' : 'blended with';
  
  return `Art style blend: ${primaryEmphasis} ${primary.name} style (${primary.promptModifier}), ${secondaryEmphasis} ${secondary.name} style (${secondary.promptModifier}). Balance the visual elements with ${Math.round(primaryWeight * 100)}% ${primary.name} influence and ${Math.round(secondaryWeight * 100)}% ${secondary.name} influence.`;
}
