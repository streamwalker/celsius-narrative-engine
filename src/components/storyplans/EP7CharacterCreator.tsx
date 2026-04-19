
import { StoryCharacterRoster, type CharacterData } from "./story-character-roster";

const SPECIES_OPTIONS = ["Human", "Human (Spirit)", "Unknown", "Droid"];
const CLASS_OPTIONS = ["Jedi Knight", "Jedi Grand Master", "Commander", "General", "Smuggler", "Sith"];

const PORTRAIT_DESCRIPTIONS: Record<string, string> = {
  xan: "Young woman with fierce determined expression, wearing practical military armor with subtle Jedi elements. Mixed heritage — strength of Leia, grit of Han. Chief of security bearing. Lightsaber at hip. Star Wars aesthetic.",
  luke: "Older Luke Skywalker with grey beard and robes combining light and dark elements. Transcendent, powerful aura. Eyes showing mastery beyond normal Jedi. Surrounded by faint Force energy. Wise but dangerous.",
  leia: "Older Leia Organa in regal New Republic leader attire with subtle Jedi training evident. Commanding presence, diplomatic bearing. Crown-like hair arrangement. Strength and grace personified.",
  lando: "Older Lando Calrissian in decorated military general's uniform. Charismatic smile, confident bearing. Cape and medals. Seasoned leader who has seen loss and found love.",
  han: "Han Solo as a translucent Force ghost with his classic smirk. Ethereal blue glow. Still wearing his vest and blaster belt. Sarcastic expression even in death. Spectral but unmistakably Han.",
  sith_pupil: "Dark hooded figure in black Sith robes with unstable, crackling energy — mix of light and dark Force power. Scarred face partially visible under hood. Former Jedi turned dark. Dangerous and unbalanced.",
};

const DEFAULT_CHARACTERS: CharacterData[] = [
  {
    id: "xan", name: "Xan", title: "Chief of Security / Jedi Knight", species: "Human", classRole: "Jedi Knight",
    abilities: ["Force Sensitivity", "Combat Training", "Force Balance"],
    stats: { strength: 70, agility: 88, intelligence: 65, willpower: 85, charisma: 60, psiPower: 80 },
    equipment: ["Lightsaber", "Security Credentials", "Blaster Pistol"],
    backstory: "Leia's daughter and Han Solo's child, raised without knowing her true parentage. Xan serves as Leia's chief of security and most shielded Jedi. She hungers for war where Leia yearns for peace — the perfect mixture of her mother's strength and her father's grit. Luke sees in her the potential to balance the Force.",
    alignmentLaw: 45, alignmentMoral: 25, image: "",
  },
  {
    id: "luke", name: "Luke Skywalker", title: "Jedi Grand Master", species: "Human", classRole: "Jedi Grand Master",
    abilities: ["Total Force Mastery", "Lightning", "Healing", "Spirit Summoning"],
    stats: { strength: 70, agility: 65, intelligence: 95, willpower: 98, charisma: 80, psiPower: 100 },
    equipment: ["Lightsaber", "Jedi Robes", "R2-D2"],
    backstory: "After Han's sacrifice, Luke disappeared to master both light and dark sides of the Force. He can heal wounds, call lightning, read thoughts, move anything, and summon spirits from the netherworld — including Palpatine himself. He returns after years to find Xan, believing she can achieve the true balance of the Force.",
    alignmentLaw: 50, alignmentMoral: 30, image: "",
  },
  {
    id: "leia", name: "Leia Organa", title: "Leader of the New Republic / Jedi", species: "Human", classRole: "Commander",
    abilities: ["Leadership", "Force Sensitivity", "Diplomacy"],
    stats: { strength: 40, agility: 35, intelligence: 92, willpower: 88, charisma: 95, psiPower: 55 },
    equipment: ["Diplomatic Credentials", "Lightsaber", "Command Ship"],
    backstory: "Leader of the New Republic and Jedi, Leia carries the weight of Han's sacrifice and the secret of Xan's parentage. She contends that the dark side corrupts absolutely, putting her at odds with Luke's philosophy. She yearns for peace while grooming Xan to one day lead both the Order and the Republic.",
    alignmentLaw: 20, alignmentMoral: 10, image: "",
  },
  {
    id: "lando", name: "Lando Calrissian", title: "General", species: "Human", classRole: "General",
    abilities: ["Tactical Command", "Piloting", "Diplomacy"],
    stats: { strength: 50, agility: 55, intelligence: 75, willpower: 65, charisma: 80, psiPower: 10 },
    equipment: ["General's Uniform", "Blaster", "Command Ship"],
    backstory: "Leia's partner and Xan's stepfather figure. What began as obligation after Han's death — Lando vowing to care for Leia and her unborn child — turned into love. A seasoned general who provides stability and tactical brilliance to the New Republic.",
    alignmentLaw: 35, alignmentMoral: 20, image: "",
  },
  {
    id: "han", name: "Han Solo", title: "Force Ghost", species: "Human (Spirit)", classRole: "Smuggler",
    abilities: ["Spirit Manifestation", "Sarcasm"],
    stats: { strength: 5, agility: 5, intelligence: 60, willpower: 40, charisma: 85, psiPower: 15 },
    equipment: ["Spectral Blaster Belt", "Ghostly Vest"],
    backstory: "Han sacrificed himself to save Coruscant from a doomsday device. Now a Force ghost, he visits Luke involuntarily — playing Luke's conscience and treating him like 'that farmboy from years ago.' His spectral presence is both comic relief and emotional anchor, reminding everyone what was lost.",
    alignmentLaw: 70, alignmentMoral: 25, image: "",
  },
  {
    id: "sith_pupil", name: "The Sith Pupil", title: "Luke's Former Student", species: "Unknown", classRole: "Sith",
    abilities: ["Dark Side Mastery", "Balance Powers (Unstable)"],
    stats: { strength: 82, agility: 70, intelligence: 55, willpower: 60, charisma: 30, psiPower: 88 },
    equipment: ["Dark Lightsaber", "Sith Robes"],
    backstory: "Once Luke's most promising pupil, this warrior was overcome by the darkness while attempting to master both sides of the Force. Luke was forced to dispatch some of his students who fell to the dark side, but this one survived and grew in power. Wields balance powers wildly and cannot fully control them.",
    alignmentLaw: 75, alignmentMoral: 80, image: "",
  },
];

export default function EP7CharacterCreator() {
  return <StoryCharacterRoster storyTitle="Episode 7" characters={DEFAULT_CHARACTERS} />;
}
