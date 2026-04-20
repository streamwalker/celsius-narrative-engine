import StoryCharacterCreator, { type CharacterData } from "@/components/story-character-creator";

const SPECIES_OPTIONS = ["Human", "Trinity Vessel", "Christ Entity", "Anti-Christ", "Draconian Alien", "Immortal"];
const CLASS_OPTIONS = [
  "Vessel",
  "Head of Christ",
  "Hand of Christ",
  "Priest",
  "Conspirator",
  "Soldier",
  "Civilian",
  "Detective",
  "Reporter",
];

const PORTRAIT_DESCRIPTIONS: Record<string, string> = {
  michael:
    "Teenage boy in modern street clothes, brown hair, intense blue eyes, faint glow around his hands. Reluctant messianic figure — more confused than commanding. A subtle aura of resurrection energy. Photo-real, dramatic side light.",
  ryoko:
    "Asian woman in her late twenties, athletic build, sharp jaw, jet-black tactical clothing. Stoic, all-business expression. A faint telekinetic shimmer in the air around her hands. Sgt-Rock energy — cold competence.",
  simon:
    "Lean man in his late twenties, pale skin, short dark hair, surgical precision in his posture. Wears a fitted black coat. Calculating, regretful eyes. Holds his hand out as if mid-healing-touch — golden light at his fingertips.",
  blaire:
    "Catholic priest in his apparent forties (truly 120+), dark cassock with worn collar, salt-and-pepper hair, weathered but kind face. Eyes that have seen everything. Patient, wise, on the edge of a crisis of faith.",
  edmund:
    "Handsome man in his thirties, perfectly tailored dark suit, slicked-back dark hair, blue eyes that hide deep doubt. Patrician bearing. Stands beneath a portrait of his father. Conflicted heir to an empire.",
  carter:
    "Imposing patriarch in his late sixties, silver hair, sharp suit, ice-cold gaze. Holds a glass of bourbon. Stands in a wood-paneled study with maps of the world. The face of inherited power.",
  franco:
    "Aristocratic European man in his fifties, charcoal three-piece suit, silver-streaked dark hair, knowing smile. Speaks with theatrical menace. The face of the Consortium — Edmund's true father.",
  theresa:
    "Striking woman in her sixties, sharp cheekbones, severe blonde bob, designer black dress. Cold, intelligent, devout in her own dark faith. The true believer who faked her own death.",
  marcus:
    "Mysterious child of about seven, pale skin, unsettlingly calm expression, short dark hair, plain white clothes. The Christ Child — or possibly the Anti-Christ. Eyes too old for his face.",
  cassandra:
    "Athletic young woman in her early twenties, tactical gear festooned with heavy weapons, dark hair pulled back, fierce determination. Carries the trauma of childhood abduction in her eyes. Heavy-weapons specialist.",
  gil:
    "Working-class man in his fifties, broad shoulders, FDNY t-shirt under a flannel, kind exhausted eyes. The firefighter who delivered Michael during 9/11 and adopted him. Salt-of-the-earth dad.",
  rell:
    "Tall, gaunt humanoid figure with subtly inhuman features — narrow vertical pupils, pale gray skin, elongated fingers. Wears an immaculate black suit. The Draconian alien who gave the order on 9/11.",
};

const DEFAULT_CHARACTERS: CharacterData[] = [
  {
    id: "michael",
    name: "Michael",
    title: "The Third / Trinity Vessel",
    species: "Trinity Vessel",
    classRole: "Vessel",
    abilities: ["Resurrection", "Energy Transfer", "Latent Cosmic Power"],
    stats: { strength: 55, agility: 60, intelligence: 65, willpower: 70, charisma: 75, psiPower: 100 },
    equipment: ["Street Clothes", "Cross Pendant (from Maria)"],
    backstory:
      "Born during 9/11 inside the burning World Trade Center. His mother Maria died moments after naming him a 'miracle.' Raised by firefighter Gil Dubinski as his own son. Resurrected after being shot in a school shooting by transferring his wound onto his friend Lila — his first miracle. Confused, impulsive, and the vessel for cosmic change.",
    alignmentLaw: 50,
    alignmentMoral: 15,
    image: "",
  },
  {
    id: "ryoko",
    name: "Ryoko",
    title: "Head of Christ",
    species: "Trinity Vessel",
    classRole: "Head of Christ",
    abilities: ["Telekinesis", "Psychometry", "TK-Augmented Martial Arts", "TK Shield"],
    stats: { strength: 70, agility: 90, intelligence: 85, willpower: 95, charisma: 50, psiPower: 92 },
    equipment: ["Tactical Suit", "Concealed Sidearm", "Hologram Wrist-Display"],
    backstory:
      "Present at Michael's birth as a six-year-old, where she levitated the unconscious Gil with telekinesis. Now twenty-six, she is the Head of Christ — all business, always right, the Sgt. Rock of the Trinity. Sent to retrieve Michael when the Consortium discovers he is 'out.'",
    alignmentLaw: 80,
    alignmentMoral: 25,
    image: "",
  },
  {
    id: "simon",
    name: "Simon",
    title: "Hand of Christ",
    species: "Trinity Vessel",
    classRole: "Hand of Christ",
    abilities: ["Healing", "Matter Manipulation", "Cellular Reconstruction"],
    stats: { strength: 50, agility: 65, intelligence: 90, willpower: 75, charisma: 45, psiPower: 88 },
    equipment: ["Fitted Black Coat", "Medical Kit", "Encrypted Comms"],
    backstory:
      "Present at Michael's birth as a seven-year-old. Now the Hand of Christ — cold, calculating, and quietly haunted by past choices. His healing touch can rebuild flesh from atoms but he uses it sparingly. Believes the mission justifies anything.",
    alignmentLaw: 75,
    alignmentMoral: 50,
    image: "",
  },
  {
    id: "blaire",
    name: "Father Blaire",
    title: "Immortal Priest",
    species: "Immortal",
    classRole: "Priest",
    abilities: ["Longevity (120+ years)", "Cosmic Awareness", "Spiritual Sight"],
    stats: { strength: 40, agility: 45, intelligence: 95, willpower: 90, charisma: 80, psiPower: 70 },
    equipment: ["Cassock", "Bible", "Blessed Crucifix"],
    backstory:
      "A rogue Catholic priest who has walked the earth for over 120 years awaiting the Trinity. Delivered Michael during 9/11, raised Simon and Ryoko, and now stands at the edge of his own crisis of faith as the prophecy he served his entire life finally unfolds.",
    alignmentLaw: 90,
    alignmentMoral: 20,
    image: "",
  },
  {
    id: "edmund",
    name: "Edmund Burke",
    title: "Heir to the Burke Dynasty",
    species: "Human",
    classRole: "Conspirator",
    abilities: ["Political Manipulation", "Tactical Command", "Resourcefulness"],
    stats: { strength: 55, agility: 60, intelligence: 90, willpower: 70, charisma: 95, psiPower: 10 },
    equipment: ["Tailored Suit", "Encrypted Phone", "Family Signet Ring"],
    backstory:
      "Privileged heir of the Burke dynasty, married to Emily Rosenberg in an extravagant political wedding. Blindly loyal to his father Carter — until he learns Franco Renault is his true father and the entire Burke identity is a lie. His arc ends when he leaps into the void rather than accept the truth.",
    alignmentLaw: 60,
    alignmentMoral: 60,
    image: "",
  },
  {
    id: "carter",
    name: "Carter Burke",
    title: "Burke Patriarch",
    species: "Human",
    classRole: "Conspirator",
    abilities: ["Strategic Mastery", "Decades of Connections", "Cold Calculation"],
    stats: { strength: 45, agility: 35, intelligence: 95, willpower: 95, charisma: 85, psiPower: 5 },
    equipment: ["Bourbon Glass", "Family Estate", "Private Security Detail"],
    backstory:
      "Patriarch of the Burke dynasty who broke from the Consortium over the 9/11 attacks. Confronts the Nine over the New York target — 'New York was never in play.' Killed by his own wife Theresa, who remained loyal to the Consortium and ensured 9/11's success.",
    alignmentLaw: 85,
    alignmentMoral: 80,
    image: "",
  },
  {
    id: "franco",
    name: "Franco Renault",
    title: "Face of the Consortium",
    species: "Human",
    classRole: "Conspirator",
    abilities: ["Theatrical Menace", "Global Influence", "Generational Patience"],
    stats: { strength: 50, agility: 45, intelligence: 95, willpower: 90, charisma: 95, psiPower: 15 },
    equipment: ["Three-Piece Suit", "Consortium Sigil", "Private Jet"],
    backstory:
      "The aristocratic European face of the Consortium and Edmund Burke's true father. Reveals the Burke identity is a manufactured cover for Consortium succession. 'I am your father' — the line that breaks Edmund's world.",
    alignmentLaw: 70,
    alignmentMoral: 90,
    image: "",
  },
  {
    id: "theresa",
    name: "Theresa Burke",
    title: "True Believer",
    species: "Human",
    classRole: "Conspirator",
    abilities: ["Manipulation", "Faked Death Network", "Devout Conviction"],
    stats: { strength: 40, agility: 40, intelligence: 90, willpower: 95, charisma: 80, psiPower: 10 },
    equipment: ["Designer Wardrobe", "Hidden Identities", "Consortium Pendant"],
    backstory:
      "Carter Burke's wife who faked her own death to remain inside the Consortium after Carter's schism. The true believer whose conviction ensured 9/11 succeeded as planned. Edmund's mother — the woman he mourned — is alive and orchestrating against him.",
    alignmentLaw: 80,
    alignmentMoral: 95,
    image: "",
  },
  {
    id: "marcus",
    name: "Marcus",
    title: "The Christ Child (?)",
    species: "Christ Entity",
    classRole: "Vessel",
    abilities: ["Latent Cosmic Power", "Unsettling Knowledge", "Reality Influence"],
    stats: { strength: 20, agility: 25, intelligence: 95, willpower: 80, charisma: 60, psiPower: 100 },
    equipment: ["Plain White Clothes"],
    backstory:
      "A child of about seven who may be the Christ Child — or the Anti-Christ engineered by the Consortium as a counter to the cosmic judgement. His true nature is the central mystery of the Trinity arc. Calm, knowing, and utterly inscrutable.",
    alignmentLaw: 50,
    alignmentMoral: 50,
    image: "",
  },
  {
    id: "cassandra",
    name: "Cassandra Sunderson",
    title: "Heavy Weapons Specialist",
    species: "Human",
    classRole: "Soldier",
    abilities: ["Heavy Weapons", "Combat Tactics", "Trauma-Forged Resilience"],
    stats: { strength: 80, agility: 85, intelligence: 70, willpower: 90, charisma: 55, psiPower: 20 },
    equipment: ["Belt-Fed Squad Weapon", "Tactical Vest", "Dog Tags from her FBI Father"],
    backstory:
      "Daughter of an FBI agent. Abducted by aliens as a child and rescued by Father Blaire's team. The trauma forged her into the Trinity's heavy-weapons specialist — the human firepower that bridges Ryoko and Simon's psychic gifts.",
    alignmentLaw: 60,
    alignmentMoral: 30,
    image: "",
  },
  {
    id: "gil",
    name: "Gil Dubinski",
    title: "FDNY Firefighter / Adoptive Father",
    species: "Human",
    classRole: "Civilian",
    abilities: ["Firefighting", "Paternal Love", "Working-Class Grit"],
    stats: { strength: 75, agility: 60, intelligence: 65, willpower: 85, charisma: 70, psiPower: 0 },
    equipment: ["FDNY Turnout Gear", "Halligan Bar", "Wedding Ring"],
    backstory:
      "The firefighter who delivered Michael inside the burning World Trade Center on 9/11. Survived the collapse holding Maria's body. Adopted Michael and raised him as his own son with his wife Annie. The most ordinary — and most heroic — figure in the story.",
    alignmentLaw: 70,
    alignmentMoral: 15,
    image: "",
  },
  {
    id: "rell",
    name: "Rell Tambular",
    title: "Draconian of the Nine",
    species: "Draconian Alien",
    classRole: "Conspirator",
    abilities: ["Inhuman Longevity", "Cold Logic", "Authority over the Final Eight"],
    stats: { strength: 65, agility: 60, intelligence: 95, willpower: 95, charisma: 70, psiPower: 60 },
    equipment: ["Immaculate Black Suit", "Consortium Regalia"],
    backstory:
      "A Draconian alien and member of the Nine who orchestrated 9/11 after Carter Burke's schism. Argued for the higher probability of success and gave the final order: 'Execute.' The Circle of Nine became the Final Eight after Carter walked out.",
    alignmentLaw: 95,
    alignmentMoral: 100,
    image: "",
  },
];

export default function CoACharacterCreator() {
  return (
    <StoryCharacterCreator
      storyTitle="Children of Aquarius"
      storageKey="coa-character-creator"
      defaultCharacters={DEFAULT_CHARACTERS}
      speciesOptions={SPECIES_OPTIONS}
      classOptions={CLASS_OPTIONS}
      portraitDescriptions={PORTRAIT_DESCRIPTIONS}
      characterCount={12}
      clothingCategories={["Modern", "Tactical", "Formal", "Clerical"]}
    />
  );
}
