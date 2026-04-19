
import { StoryCharacterRoster, type CharacterData } from "./story-character-roster";

const baZeus = "/assets/ba-zeus.jpg";
const baGroup = "/assets/ba-group.jpg";
const baRolynn = "/assets/ba-rolynn.jpg";
const baCarlo = "/assets/ba-carlo.jpg";
const baBenes = "/assets/ba-benes.jpg";
const baProfiles = "/assets/ba-profiles.png";

const SPECIES_OPTIONS = ["Alympian", "Neptunian", "Martian", "Gaian", "PSI", "Ascended"];
const CLASS_OPTIONS = ["Ascended", "Warrior", "Commander", "Operative", "Officer", "Diplomat"];

const CHARACTERS_NEEDING_PORTRAITS: Record<string, string> = {
  astra: "Young woman with silver/white hair with cyan highlights, wearing silver futuristic armor with glowing blue-white energy aura. Side profile or 3/4 view. Ethereal and powerful appearance. She is a PSI operative and Ascended goddess.",
  orion: "Muscular bearded man with brown hair, wearing a military cape and uniform with gold medallion. Rugged warrior look, battle-hardened NDF General. Shape-shifter from Mars with twin pistols holstered.",
  poseidon: "Man with long dark red-brown hair and beard, wearing dark armor with gold accents and a large medallion. Stern, commanding expression. Aquatic/oceanic theme. Ruler of Neptunos, controls water.",
  rhea: "Blonde woman with intense glowing blue eyes, wearing dark blue military uniform and armor. Strong commanding presence. Queen of Alympia and Captain of the starship Ryuken. Dual-wielding swords.",
};

const DEFAULT_CHARACTERS: CharacterData[] = [
  {
    id: "zeus", name: "Zeus", title: "King of Alympia", species: "Alympian", classRole: "Ascended",
    abilities: ["Electricity", "Telepathy", "Bioelectric Tethering"],
    stats: { strength: 75, agility: 60, intelligence: 85, willpower: 95, charisma: 90, psiPower: 98 },
    equipment: ["Alympian Armor", "Lightning Gauntlets"],
    backstory: "Zeuzano Constra, King of Alympia and ruler of Earth Nation Alympia. The most powerful Ascended in the Nerian Galaxy, Zeus commands bioelectric energy and leads the Tri-Planetary Coalition against Poseidon's aggression. His sacrifice to destroy the Leviathans defines the story's climax.",
    alignmentLaw: 20, alignmentMoral: 15, image: baZeus,
  },
  {
    id: "astra", name: "Astra / Asterya", title: "PSI Operative / Ascended Goddess", species: "PSI", classRole: "Ascended",
    abilities: ["Telekinesis", "Telepathy", "Ascension (Level 2)"],
    stats: { strength: 40, agility: 70, intelligence: 80, willpower: 90, charisma: 75, psiPower: 100 },
    equipment: ["Ally Uniform", "Silver Armor (post-ascension)"],
    backstory: "Zeus's former apprentice and third Ascended Operative. Rescued as a child from a cruiser attack, Astra carries an unrequited love for Zeus. After his sacrifice, she ascends beyond Level 1 to become Asterya — 'the Oneness and the Way' — and defeats Poseidon.",
    alignmentLaw: 40, alignmentMoral: 10, image: baGroup,
  },
  {
    id: "orion", name: "Orion", title: "NDF General", species: "Martian", classRole: "Warrior",
    abilities: ["Shape-shifting", "Marksmanship", "Enhanced Senses"],
    stats: { strength: 90, agility: 85, intelligence: 65, willpower: 70, charisma: 60, psiPower: 30 },
    equipment: ["Twin Pistols", "Sky-skimmer", "Combat Blade"],
    backstory: "Commander of the Nerrian Defense Force and Zeus's most trusted general. A shape-shifter from Mars, Orion is a soldier's soldier — blunt, loyal, and lethal. He delivers Zeus's eulogy and carries the weight of survival.",
    alignmentLaw: 30, alignmentMoral: 25, image: baProfiles,
  },
  {
    id: "poseidon", name: "Poseidon", title: "Ruler of Neptunos", species: "Neptunian", classRole: "Ascended",
    abilities: ["Hydrokinesis", "Leviathan Summoning", "Water Walking"],
    stats: { strength: 80, agility: 55, intelligence: 75, willpower: 85, charisma: 70, psiPower: 88 },
    equipment: ["Trident", "Neptunian Battle Armor"],
    backstory: "Rikkard Poseidon, ruler of Neptunos. Demands the activation of the Nativus Luminator to destroy Terran Sol in retaliation for the Sahntee Station attack. His daughter Arianna was in Renoa City. Vanishes from a hospital in a catatonic fugue after Asterya's defeat.",
    alignmentLaw: 70, alignmentMoral: 65, image: baGroup,
  },
  {
    id: "rolynn", name: "Rolynn", title: "Council Elder / Mediator", species: "Alympian", classRole: "Diplomat",
    abilities: ["Diplomacy", "Strategic Command", "PSI Awareness"],
    stats: { strength: 45, agility: 35, intelligence: 90, willpower: 80, charisma: 85, psiPower: 50 },
    equipment: ["Ceremonial Sword", "Council Robes"],
    backstory: "Senior council member and mediator of the Tri-Planetary Coalition. Rolynn attempts to broker peace between Zeus and Poseidon, serving as the voice of reason in a galaxy spiraling toward war.",
    alignmentLaw: 15, alignmentMoral: 20, image: baRolynn,
  },
  {
    id: "rhea", name: "Rhea", title: "Queen of Alympia / Captain of the Ryuken", species: "Alympian", classRole: "Commander",
    abilities: ["Tactical Command", "Ship Warfare", "Combat Training"],
    stats: { strength: 65, agility: 70, intelligence: 85, willpower: 90, charisma: 80, psiPower: 45 },
    equipment: ["Ryuken Command", "Sword (dual-wielding)"],
    backstory: "Herana Costra, Queen of Alympia and Captain of the NDF flagship Ryuken. Commands the fleet during the Leviathan assault while managing the jamming signal crisis. Learns of her pregnancy with Zeus's child — Atlas — after his death.",
    alignmentLaw: 20, alignmentMoral: 15, image: baZeus,
  },
  {
    id: "carlo", name: "Carlo", title: "Ryuken Bridge Officer", species: "Gaian", classRole: "Officer",
    abilities: ["Sensor Operations", "Signal Analysis", "Bridge Command"],
    stats: { strength: 50, agility: 55, intelligence: 80, willpower: 65, charisma: 55, psiPower: 20 },
    equipment: ["Sidearm", "Operations Console"],
    backstory: "Bridge officer aboard the Ryuken. Carlo mans the sensor array and detects the fourth-dimensional temporal spike from the Leviathans. Takes the bridge when Rhea breaks down after learning of Zeus's fate.",
    alignmentLaw: 25, alignmentMoral: 20, image: baCarlo,
  },
  {
    id: "benes", name: "Benes", title: "Ryuken Bridge Officer", species: "Gaian", classRole: "Officer",
    abilities: ["Tactical Systems", "Combat Training", "Bridge Operations"],
    stats: { strength: 55, agility: 70, intelligence: 75, willpower: 60, charisma: 50, psiPower: 15 },
    equipment: ["Sidearm", "Tactical Console"],
    backstory: "Tactical officer aboard the Ryuken. Benes coordinates the javelin missile strikes that destroy the jamming signal source, enabling communications during the Leviathan battle.",
    alignmentLaw: 25, alignmentMoral: 20, image: baBenes,
  },
];

export default function BACharacterCreator() {
  return <StoryCharacterRoster storyTitle="Battlefield: Atlantis" characters={DEFAULT_CHARACTERS} />;
}
