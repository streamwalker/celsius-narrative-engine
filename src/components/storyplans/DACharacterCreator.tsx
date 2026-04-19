'use client';

import { StoryCharacterRoster, type CharacterData } from "./story-character-roster";

const SPECIES_OPTIONS = ["Human", "Human (Ancient)", "Human (Transforming)", "Human (Extra-Dimensional)", "Human (Time Traveler)", "Unknown", "Spirit"];
const CLASS_OPTIONS = ["Sorcerer", "Mystic", "Warrior", "Archmage", "Noble", "Dark Priest", "Knight", "Time Mage", "Ninja"];

const PORTRAIT_DESCRIPTIONS: Record<string, string> = {
  maven: "Young woman in medieval peasant clothing with a faint magical glow around her hands. Brown hair, determined expression. Hidden power simmering beneath a humble exterior. Daughter of Estelle and Christian — destined to become the Phoenix. Fantasy village setting.",
  shinobu: "Young woman of Japanese descent with ethereal appearance, wearing mystic healer robes. Soft glowing eyes suggesting spirit sight and extra-dimensional heritage. Gentle but resolute expression. Surrounded by faint spectral wisps. Carries the weight of patricide.",
  titus: "Muscular knight with scarred face and partially hardened skin showing inhuman transformation. Worn armor of a Knight of Briar, haunted expression. Master of Castle Balorian. Battle-damaged but powerful. Dark fantasy aesthetic.",
  corbin: "Ancient frail old man with long white beard, wearing tattered sorcerer robes that hint at former grandeur. Wise but exhausted eyes. Faint temporal energy crackling around his fingers.",
  estelle: "Beautiful woman with a dark, regal presence. Once a party girl and thief from the year 2027, now the Dark Queen of Draconion. Cold, emotionless expression. Immense magical power radiating from her. Dark fantasy queen aesthetic.",
  heretic: "Dark hooded figure with demonic energy radiating from beneath religious vestments. Glowing red eyes under a shadowed cowl. Sinister presence. Dark cult leader aesthetic.",
  kataija: "Young Japanese woman in traditional clan armor with a commanding presence. Sharp eyes, disciplined posture. She acts older than her years — head of the Omagari clan. Extra-dimensional heritage visible in faint energy around her hands.",
  matsuo: "Japanese young man in dark ninja garb with controlled extra-dimensional energy crackling along his arms. Loyal, intense expression. Shinobu's brother who embraced his heritage.",
  owen: "Young man in a blend of medieval and futuristic clothing — leather and cloth mixed with small technological devices. Clever, watchful eyes. Carries tools fashioned to channel magic. Time traveler aesthetic.",
  christian: "Handsome man in dark robes with an air of quiet authority. Estelle's lover and co-ruler. Warm but intense expression. Faint magical aura suggesting immense power. Dark fantasy mage aesthetic.",
};

const DEFAULT_CHARACTERS: CharacterData[] = [
  {
    id: "maven", name: "Maven", title: "The Phoenix — Daughter of the Dark Queen", species: "Human", classRole: "Sorcerer",
    abilities: ["Hidden Magic", "Elemental Control", "Raw Blunt Force Magic", "Phoenix Transformation"],
    stats: { strength: 35, agility: 50, intelligence: 60, willpower: 80, charisma: 45, psiPower: 75 },
    equipment: ["Rothchylde's Journal", "Traveler's Pack"],
    backstory: "The daughter of Christian and Estelle (the Dark Queen), Maven was spirited away at birth by a midwife who used a spell to make her appear dead. Raised by adopted parents after being found by 'Brother Billy,' she was visited by 'Sister Agatha' who fed her lies about her mother. After her adopted parents were killed by Dark Riders attracted by her uncontrolled magic, Maven set out to find herself and met Shinobu in a tavern. She begins as a fragile character with raw, blunt force magic and no skill, but undergoes a massive transformation into the 'Phoenix' — from the weakest who needs protection to the strongest who protects the world. Estelle eventually confronts her and reveals the truth: 'No. I am your mother.'",
    alignmentLaw: 40, alignmentMoral: 15, image: "",
  },
  {
    id: "shinobu", name: "Shinobu Omagari", title: "Spirit Healer — Extra-Dimensional Heritage", species: "Human (Extra-Dimensional)", classRole: "Ninja",
    abilities: ["Spirit Sight", "Healing", "Spirit Realm Navigation", "Extra-Dimensional Abilities"],
    stats: { strength: 25, agility: 45, intelligence: 85, willpower: 70, charisma: 60, psiPower: 90 },
    equipment: ["Healer's Herbs", "Spirit Talisman"],
    backstory: "Shinobu's father was not a human possessed by a demon — he was an extra-dimensional being whose symbiotic race could access parts of the brain to tap into abilities from their dimension, explaining their ninja techniques. Shinobu believed he was possessed and, at his begging, decapitated him — an act witnessed by her sister Kataija. While her siblings embraced their heritage, Shinobu fought it. She made a deal with a rival demon to enact revenge, and the two demons now play a game with lives as pawns. After her master was killed by the Writhers, she escaped using the spirit realm and joined Maven.",
    alignmentLaw: 35, alignmentMoral: 20, image: "",
  },
  {
    id: "titus", name: "Lord Titus", title: "Knight of Briar — Master of Castle Balorian", species: "Human (Transforming)", classRole: "Knight",
    abilities: ["Combat Mastery", "Inhuman Transformation", "Enhanced Senses", "Military Strategy"],
    stats: { strength: 88, agility: 78, intelligence: 45, willpower: 55, charisma: 35, psiPower: 20 },
    equipment: ["Gladiator's Blade", "Knight of Briar Armor"],
    backstory: "A trained Knight of Briar, skilled in combat and strategy. Titus grew to become the Master of Castle Balorian. In his early days, he is arrogant and prioritizes the 'Rule of Law' over what is normative. Disgraced for desertion during a Writher attack and sentenced to the fighting pits, his body began transforming during his escape — skin hardening, senses sharpening. He joins Maven and Shinobu with nothing left to lose. He is intrigued by Shinobu.",
    alignmentLaw: 60, alignmentMoral: 40, image: "",
  },
  {
    id: "corbin", name: "Corbin Rothchylde", title: "Ancient Sorcerer", species: "Human (Ancient)", classRole: "Archmage",
    abilities: ["Temporal Rift", "Sorcery", "Life Extension"],
    stats: { strength: 10, agility: 15, intelligence: 98, willpower: 95, charisma: 50, psiPower: 92 },
    equipment: ["Temporal Rift Sphere", "Ancient Tomes"],
    backstory: "Once the most powerful sorcerer in the eastern quadrant of Draconion, Corbin cast a temporal rift spell to freeze his mortally wounded wife Estelle in stasis. Centuries later, now a feeble old man living under an assumed name in 1982 England, he orchestrates Maven's journey to the catacombs — sacrificing himself to seal the rift he created.",
    alignmentLaw: 30, alignmentMoral: 35, image: "",
  },
  {
    id: "estelle", name: "Estelle (The Dark Queen)", title: "Time Traveler from 2027 — Dark Queen of Draconion", species: "Human (Time Traveler)", classRole: "Archmage",
    abilities: ["Immense Magic", "Time Travel", "Mind Manipulation", "Jedi Mind Tricks"],
    stats: { strength: 40, agility: 35, intelligence: 90, willpower: 95, charisma: 70, psiPower: 98 },
    equipment: ["Time Travel Artifact", "Dark Queen Vestments"],
    backstory: "Estelle is actually from the future — the year 2027 (or 2037). In her original time, she was a thief and party girl who used magic for 'Jedi mind tricks' to pick pockets. An old woman (possibly an older Estelle) gave her an artifact to travel back to the Dark Ages where natural energy was abundant. She and her lover Christian traveled back, their powers grew enormous, and they were worshipped as gods. After Christian died, Estelle slaughtered his mage students and became cold and emotionless — the Dark Queen. Maven is her daughter by Christian, stolen at birth by a midwife's spell.",
    alignmentLaw: 20, alignmentMoral: 10, image: "",
  },
  {
    id: "heretic", name: "The Heretic", title: "Dark Priest of the Writhers", species: "Unknown", classRole: "Dark Priest",
    abilities: ["Demonic Power", "Religious Authority", "Dark Magic"],
    stats: { strength: 60, agility: 40, intelligence: 70, willpower: 95, charisma: 85, psiPower: 90 },
    equipment: ["Dark Vestments", "Cursed Staff"],
    backstory: "The enigmatic leader of the Writhers, a dark cult of religious radicals whose mission is to slaughter all who possess magical ability. The Heretic wields a demonic power that is virtually indomitable. He believes he is saving the world from the chaos of unchecked power, making him the hero of his own twisted story.",
    alignmentLaw: 75, alignmentMoral: 85, image: "",
  },
  {
    id: "kataija", name: "Kataija Omagari", title: "Head of the Omagari Clan", species: "Human (Extra-Dimensional)", classRole: "Ninja",
    abilities: ["Extra-Dimensional Combat", "Clan Leadership", "Ninja Techniques"],
    stats: { strength: 70, agility: 88, intelligence: 65, willpower: 80, charisma: 55, psiPower: 72 },
    equipment: ["Clan Blade", "Omagari Armor"],
    backstory: "Shinobu's younger sister who acts like the older one. After witnessing Shinobu decapitate their father, Kataija embraced her extra-dimensional heritage and learned to control her powers. Now the head of the Omagari clan, she is on a mission with her brother Matsuo to bring Shinobu back to Japan to stand trial for patricide. She is as good a fighter as Shinobu — fighting both siblings together nearly overwhelms Shinobu.",
    alignmentLaw: 70, alignmentMoral: 30, image: "",
  },
  {
    id: "matsuo", name: "Matsuo Omagari", title: "Omagari Clan Enforcer", species: "Human (Extra-Dimensional)", classRole: "Ninja",
    abilities: ["Extra-Dimensional Combat", "Stealth", "Ninja Techniques"],
    stats: { strength: 65, agility: 85, intelligence: 55, willpower: 70, charisma: 40, psiPower: 68 },
    equipment: ["Shadow Blade", "Ninja Garb"],
    backstory: "Shinobu's brother who, like Kataija, embraced his extra-dimensional heritage. Loyal to his clan and sister Kataija, he hunts Shinobu to bring her to justice. A formidable fighter in his own right, the combined assault of Matsuo and Kataija is almost too much for Shinobu to handle.",
    alignmentLaw: 65, alignmentMoral: 35, image: "",
  },
  {
    id: "owen", name: "Owen", title: "Time Traveler from the Future", species: "Human (Time Traveler)", classRole: "Time Mage",
    abilities: ["Magic-Technology Hybrid", "Spell Tools", "Precision Magic"],
    stats: { strength: 30, agility: 55, intelligence: 92, willpower: 75, charisma: 60, psiPower: 80 },
    equipment: ["Spell-Casting Tools", "Technological Devices", "Future Artifacts"],
    backstory: "Owen travels back from the future to stop Estelle (and Maven) because he is in love with Maven. He utilizes a mix of magic and technology, fashioning tools to cast spells by drawing on the abundance of natural energy in this age. He uses magic on a small scale but effectively — like a scalpel compared to Maven's blunt force. He attempts to teach Maven how to focus her magic. Owen only has eyes for Maven, though Shinobu thinks he's cute.",
    alignmentLaw: 45, alignmentMoral: 25, image: "",
  },
  {
    id: "christian", name: "Christian", title: "Estelle's Lover — Co-Ruler of Draconion", species: "Human (Time Traveler)", classRole: "Archmage",
    abilities: ["Immense Magic", "Mage Training", "Co-Rulership"],
    stats: { strength: 45, agility: 40, intelligence: 88, willpower: 85, charisma: 75, psiPower: 92 },
    equipment: ["Ancient Robes", "Mage Staff"],
    backstory: "Estelle's lover who traveled back in time with her to the Dark Ages. Their powers grew enormous and they were worshipped as gods, ruling side-by-side. Christian trained mages but eventually died. His death was the turning point that transformed Estelle into the cold, emotionless Dark Queen. Maven is his daughter by Estelle, though he never knew she survived.",
    alignmentLaw: 35, alignmentMoral: 25, image: "",
  },
];

export default function DACharacterCreator() {
  return <StoryCharacterRoster storyTitle="Darker Ages" characters={DEFAULT_CHARACTERS} />;
}
