
import { useState, useMemo } from "react";
import { PortToEngineButton } from "@/components/port-to-engine-button";
import { Link } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { PageSection, Pre, Heading } from "@/components/story-page-helpers";
import StoryNotesSearch from "@/components/story-notes-search";
import BattlefieldAtlantisStoryPlan from "@/components/storyplans/BattlefieldAtlantisStoryPlan";
import ExordiumDraftA from "@/components/storyplans/ExordiumDraftA";
import ExordiumDraftB from "@/components/storyplans/ExordiumDraftB";
import OriginIssueOneScript from "@/components/storyplans/OriginIssueOneScript";
import OriginIssueTwoScript from "@/components/storyplans/OriginIssueTwoScript";
import BACharacterCreator from "@/components/storyplans/BACharacterCreator";
import NotebookTranscript001A from "@/components/storyplans/NotebookTranscript001A";
import NotebookTranscript001B from "@/components/storyplans/NotebookTranscript001B";
import NotebookTranscript002A from "@/components/storyplans/NotebookTranscript002A";
import NotebookTranscript002B from "@/components/storyplans/NotebookTranscript002B";
import NotebookTranscript003 from "@/components/storyplans/NotebookTranscript003";

const sections = [
  { id: "page-1", label: "Page 1 — World & Character Lists" },
  { id: "page-2", label: "Page 2 — Violence in Storytelling (Russell 2)" },
  { id: "page-3", label: "Page 3 — Character & Location Notes" },
  { id: "page-4", label: "Page 4 — Exordium Outline (A-1 / A-2)" },
  { id: "page-5", label: "Page 5 — Handwritten Notes" },
  { id: "page-6", label: "Page 6 — Act Structure (SQ1–SQ8)" },
  { id: "page-7", label: "Page 7 — Handwritten Notes (BA2 & BA3)" },
  { id: "page-8", label: "Page 8 — Story Bible (Version A)" },
  { id: "page-9", label: "Page 9 — Outline Headings & Tables" },
  { id: "page-10", label: "Page 10 — Exordium Outline (Duplicate)" },
  { id: "page-11", label: "Page 11 — Act Structure (Continued)" },
  { id: "page-12", label: "Page 12 — Blank Act Template (BA1)" },
  { id: "page-13", label: "Page 13 — Blank Act Template (BA3)" },
  { id: "page-14", label: "Page 14 — Story Bible (Version B)" },
  { id: "page-15", label: "Page 15 — Handwritten Notes (The Planet)" },
  { id: "page-16", label: "Page 16 — Handwritten Notes" },
  { id: "page-17", label: "Page 17 — Handwritten Notes" },
  { id: "page-18", label: "Page 18 — Handwritten Notes (Zeus)" },
  { id: "page-19", label: "Page 19 — Handwritten Notes (Orion / Astra)" },
  { id: "page-20", label: "Page 20 — Handwritten Notes (Battle)" },
  { id: "page-21", label: "Page 21 — Screenwriting Notes" },
  { id: "page-22", label: "Page 22 — Realization & Character Keys" },
  { id: "page-23", label: "Page 23 — Keys to Great Scenes" },
  { id: "page-24", label: "Page 24 — Building Suspense" },
  { id: "page-25", label: "Page 25 — Tri-Planetary Coalition Roster" },
  { id: "page-26", label: "Page 26 — Prometheus / Pandora / Asterya" },
  { id: "page-27", label: "Page 27 — BA3 Climax Notes" },
  { id: "page-28", label: "Page 28 — BA3 Script Page 15" },
  { id: "page-29", label: "Page 29 — History of Earth Pt. 1" },
  { id: "page-30", label: "Page 30 — Proposed BA3 Opening" },
  { id: "page-31", label: "Page 31 — BA Ongoing Series (Tercet) Plot" },
  { id: "page-32", label: "Page 32 — Mumbai Attack Reference Notes" },
  { id: "page-33", label: "Page 33 — Aesir/Risen Breakdown & Resolution" },
  { id: "page-34", label: "Page 34 — Casting/Personality Notes" },
  { id: "page-35", label: "Page 35 — Motivation: Very Important" },
  { id: "page-36", label: "Page 36 — Social Structure & Illuminati Subplot" },
  { id: "page-37", label: "Page 37 — Leadership & Weapons Platforms" },
  { id: "page-38", label: "Page 38 — STRID-R Concept" },
  { id: "page-39", label: "Page 39 — Astra Character Profile" },
  { id: "page-40", label: "Page 40 — Orbital & Ground Battle Notes" },
  { id: "exordium-draft-a", label: "Exordium Issue 1 — Script (Draft A)" },
  { id: "exordium-draft-b", label: "Exordium Issue 1 — Script (Draft B / Celtx)" },
  { id: "origin-issue-1", label: 'Issue 1: "Origin" — Prologue Script' },
  { id: "origin-issue-2", label: 'Issue 2: "Origin" Pt. 2 — Script' },
  { id: "notebook-001a", label: "Notebook Transcript 001A — Issues 1-6 & Character Notes" },
  { id: "notebook-001b", label: "Notebook Transcript 001B — Issues 7-12 & Plotting" },
  { id: "notebook-002a", label: "Notebook Transcript 002A — Issues 9-10 Action Scripts" },
  { id: "notebook-002b", label: "Notebook Transcript 002B — Issues 10-12 & World-Building" },
  { id: "notebook-003", label: "Notebook Transcript 003 — BA Rewrites & Series Bible (Jan 27, 2016)" },
  { id: "ba-characters", label: "Character Creator" },
  { id: "ba-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown" },
];

/* Searchable text content per page id – used for filtering */
const pageContent: Record<string, string> = {
  "page-1": "Ore bod apple Cyberies Syberid Technor Eorth Artemis Alympicd Frejd Fryor Constrayd 2evs Rlad Atlds Ca contal Arternis Neotinos Poseidon Rilkar Arind Hoydon Kotan Pronalhs Alyssd Ares Halimor City Lontos Anlyn Talon Lee Velour Sena Artu Revoté Rove Mas Astre Renod City Orion",
  "page-2": "Russell 2 Integrating violence into their compositions fantasy violence horror authors provoke alter reader mindset Stephen King mentally ill asylums insane normal grimaces hysterical irrationality Jones age 13 alone afraid adolescence innocent rage cooperation nice-boy persona suffocated fears desires",
  "page-3": "Terron Sol Goins Resemus AKropolis Grey Alions Arethis Gis Gint Osin Anubis Norbanus Osinis Andrdnon Terses Colle Hommis Ruins Anint Ciliton Chronos Dracores Hemerd Licord Drecnion Conlty Belitesin God",
  "page-4": "Battlefield Atlantis Exordium A-1 A-2 SQ1-A INCITING INCIDENT Sahntee Station Mars orbit explodes Renoa City 2.1 million SQ2-A Tri-Planetary Coalition Council Halimar City Ares Arolyn Lantos Zeuzano Constra Prometheus Katan Rail Asyllia Orion Hunter Rikkard Poseidon Neptunos Nativus Luminator SQ-3 Herana Costra Nerrian Defense Force Ryûken Astra SQ-3 B Neptunian assassins SQ-4 Midpoint SQ-5 Rhea Leviathans",
  "page-5": "Rhed Carth orbit ships electrostatic",
  "page-6": "Battlefield Atlantis Act-1 SQ1-A INTRO Talos Dark Avenger criminals Alympia Orion Hunter SQ1-B INCITING INCIDENT Halimar City Ares Gaian Separatist Movement heir of light Atlas Zeus Act-2 Act-3 A-3 SQ-6 Main Culmination Poseidon Leviathans SQ-7 New Tension Twist traitor Ryuken Astra TK shield Zeus gravimetric singularity SQ-8 Resolution Astra Asterya Poseidon Orion eulogy",
  "page-7": "Battlefield Atlantis 2 3 Act-1 Act-2 Act-3 Tutemas",
  "page-8": "Act 1 Intro Scene Inciting Incident Sahntee Station Mars Sequence One action-adventure fantasy telepathy telekinesis Ascended Zeuzano Constra Alympia Zeus Rikkard Poseidon Neptunos Water arrogant ruthless Tri-Planetary Coalition Gaian Protectorate Terran Sol Background Gaians Humans Constra Second Gaian War Dramatic Premise Herrhea Constra Ryuken Orion Hunter Astra telekinetic",
  "page-9": "Predicament Obstacle Solution Action Block Lock-In Plot Point",
  "page-10": "Battlefield Atlantis Exordium A-1 A-2 SQ1-A INCITING INCIDENT Sahntee Station Mars Renoa City SQ2-A Tri-Planetary Coalition Halimar City Poseidon Nativus Luminator SQ-3 Herana Costra Ryûken Astra Neptunian assassins",
  "page-11": "SQ-4 Midpoint Culmination Ryuken Astra tidal wave Poseidon SQ-5 Subplot Rising Action Rhea Gaian Separatist Leviathans SQ-6 Main Culmination SQ-7 New Tension Twist traitor Ryuken Astra Zeus gravimetric singularity SQ-8 Resolution Asterya Poseidon Orion eulogy Talos Dark Avenger",
  "page-12": "Battlefield Atlantis Act-1 SQ1-A INTRO SQ1-B INCITING INCIDENT Act-2 Act-3 Resolution",
  "page-13": "Battlefield Atlantis 3 Act-1 SQ1-A INTRO SQ1-B INCITING INCIDENT Act-2 Act-3 Resolution Concluded",
  "page-14": "Act 1 Intro Scene Inciting Incident Sahntee Station Mars Sequence One Sci-fi action-adventure fantasy telepathy telekinesis Ascended Zeuzano Constra Alympia Zeus Rikkard Poseidon Neptunos Tri-Planetary Coalition Gaian Protectorate Terran Sol Consterya Herrhea Constra Ryuken Orion Hunter Astra telekinetic Summanus Predicament Lock-In",
  "page-15": "Plonet Eort Homars Goions Ares Mars",
  "page-16": "",
  "page-17": "",
  "page-18": "Zeus Olympic SFA ELECTRICIT Orim Hunter Plaret Mors Pilot weapons tatics",
  "page-19": "ORION THE HUNTER Astran telepaly ALLIES ASTIEA ZEUS Poseidon Nephre water",
  "page-20": "Orion defense",
  "page-21": "Screenwriting Goals Needs Atas Poseidon Earth Ascended Character Power Degree Character Flow Catalyst Ferct attack Arrs Big Event Besuter Pinch Orion Crisis Earth peril Noptra Tri-Planetary coalition Mars",
  "page-22": "Showdon Akrs Poseidon Redlization Atas Rhed Atlrs Olympie Plantet Eart Atlontis Keys Creating Good Characters Goal Opposites Motivation Backstory will act point view attitudes Room Grow Believability Details idiosyncrasies habits quirks Main Character Atlas Poseidon Gaian Separatist Lelentos Artanis Pandora",
  "page-23": "Keys Great Scenes purpose TELL SHOW talking heads pacing Action dialogue cliffhanger reversal revelation decision emotion mood goal intention subtext feelings attitude conflict Red Matter Dreamer Eros Legends Atlas Orion suspense emotion characters believable Powerful Opposition Poseidon",
  "page-24": "Build Suspense expectation tension surprise urgency consequences ticking clock doubt red herring",
  "page-25": "Tri-Planetary Coalition Nerrian Defense Force Separatists Movement Zeut Atlas Amubi Osiris Astre Lelonts Anet Horos Nojorar Orion Eros Orolin Set Feryd Rhed Artanis Poseidon Corlo Promethews Pandord Nemisis Benes Berserker Toctial Annihilotor Helm",
  "page-26": "Prometheus Pandora Asterya Astreyd Osiris psychic blocks ascend goddess Ares",
  "exordium-draft-a": "Exordium Issue 1 Draft A script Sahntee Station Renoa City council Poseidon Luminator 24 hours Zeus Rolin Prometheus Orion Rhea Ryuken assassins Neptunian Astra PSI racist Leviathans sky-skimmer Mero",
  "exordium-draft-b": "Exordium Issue 1 Draft B Celtx Rolynn Arianna Poseidon daughter Alympian Guard Nator-Lumi revised draft",
  "origin-issue-1": "Origin Issue 1 Prologue Constreya Ascended Allies Ares Mars Gaians Helotians Zeus Astra Orion Poseidon Neptune TPC Nerian Galaxy Defense Force Leviathans",
  "origin-issue-2": "Origin Issue 2 Ryuken bridge Rhea Carlo Benes Leviathan jamming signal javelin singularity quantum black hole Astra Asterya Oneness Way Poseidon fugue Orion eulogy pregnancy Atlas warning",
  "ba-characters": "Character Creator Zeus Astra Asterya Orion Poseidon Rolynn Rhea Carlo Benes MMORPG stats attributes abilities equipment backstory alignment species class",
  "ba-story-plan": "Story Plan three act eight sequence Save the Cat Dude with a Problem Superhero Zeus sacrifice leadership power Poseidon Astra Asterya Leviathans singularity catalyst midpoint climax finale opening image theme stated bioelectric tethering Arianna pregnancy Atlas",
  "page-27": "BA3 Climax Aesir Poseidon corpse Zombie tidal waves Astra Asterya merge Pandora Atlas Artemis dies",
  "page-28": "BA3 Script Page 15 Rhea Atlas shuttlecraft cockpit Halimar Airspace NYC Asgard birthright",
  "page-29": "History Earth Humans Ares Gaians dominant species Esteya Consterya first Ascended Gaian Wars Zeus descendant slaves indigenous",
  "page-30": "BA3 Opening Zeus Astra fighting Poseidon flashback Sahntee Station Now surrender Orion",
  "page-31": "Tercet ongoing series Nemisis Berserker Annihilator TALOS Dark Avenger cold open robbery reception Ares Atlas Lelantos Lyssa Prometheus Rhea Anubis Orolyn Eros conflicts",
  "page-32": "Mumbai attacks coordinated multiple targets bombing sniper hostage Skyport reception hotel Eros Anat Annihilator Lelantos",
  "page-33": "Risen Aesir Nesir Odinn Gaian Separatist Anubis ambassador infiltrator Atlantis south pole Atlas continent Astra Asterya merge Risen resolution",
  "page-34": "Dark Knight Mumbai casting Alicia Vikander Saoirse Ronan Sophie Turner Hayley Atwell Nathalie Emmanuel Bryce Dallas Howard Artemis Pandora Velour",
  "page-35": "Motivation Ascended powers Gaians extended lifespans immortality Earth atmosphere water human physiology Osiris human freshwater BA1 BA2 BA3 Ascension arc",
  "page-36": "Hijab Niqab social structure Degree Perceived Entitativity Illuminati Chosen 1999 terror Edward Burke Carter Burke conspiracy",
  "page-37": "Leadership WMD cadre weapons platforms Rizin Sarin VX chemical agents ammunition storage transport power generators Tesla panic room",
  "page-38": "STRID-R Space Time Reconnaissance Intelligence Disruptor Recovery Agent Deja Vu time manipulation changed your past 2015",
  "page-39": "Astra character profile 19-23 female Ares orphan Telepathy Telekinesis Collective Soul Convergence Physical Matter Manipulation rebellious punk crush Zeus brash impulsive Level 3 Ascension corporeal entity Child of Light indigenous humans",
  "page-40": "Irving Kershner orbital ground battle Rhea standoff Gaian commander deadline forces infiltrate Alympia Orion strike team female Lieutenant streets siege",
  "notebook-001a": "Notebook Transcript 001A Issues 1-6 Tercet fight Dark Avenger Talos Nemisis Berserker Annihilator Royal troops Rhea NDF detention interrogation Heir of Light Eros Atlas Lelantos character posters love triangles Pandora subplot Prometheus secret Klef JNet Nildon Abator",
  "notebook-001b": "Notebook Transcript 001B Issues 7-12 Planet Ares Lyssa Gossamer bar Nemisis voice Orion meets Atlas Son of Zeus fire eyes Ghost Shroud cloaking Rhea discovers Talos surveillance Artemis launch spacewalk sword Carlo confrontation training Level 2 Ascension",
  "notebook-002a": "Notebook Transcript 002A Issues 9-10 Anat Nemisis Velour chase skycycles Halimar City pursuit Spiderman sharpshooting Lelantos Orion training fight Eros wall-kick Tony Jaa Artemis metallic web Rhea Carlo Atlas Talos wound arm rock form transformation",
  "notebook-002b": "Notebook Transcript 002B Issues 10-12 Velour investigation Prometheus incompetence Orolyn Lyssa targeted Anders telepathic Revote mole gun corridor chase exhaust tube skycycle Eros Astral Plane rescue Gossamer prison Lelantos anchor timer Atlas Artemis ship fight Orion telepathic news report plot architecture three parallel Pandora deep lore adopted Anubis mind entity Osiris Level 3 screenplay high concept Technopath Neridian Galaxy Poseidon finale rock creature ocean floor doomsday Constra",
  "notebook-003": "Notebook Transcript 003 January 2016 rewrites Terran Sol Earth destroyed Atlas ark Atlantis Ocean Gaian Homeworld BA1 BA2 BA3 Victory Tragedy Poseidon Luminator Osiris Pandora Chronos Arolyn Ares Astra coma Vanier Aesir Odinn limited series Atlas Ascends Rise Gaians Fall Nerria Talos HUD criminals Ledge Nemesis Annihilator Berserker Lo-Zar Conjurer Tempest Apex Humans Arens Helotians Draconians emotional attachments Zeus betrayal Rhea estranged Orion kinship Carlo Benes Asterya Lady Wood Gadriel Star Wars merge Luke Leila Hercrayless Akropolis ascended battle Kickstarter hi-concept Artemis backstory Lo-Zar silicon nanotech clone Zeus powers Anubis Sylista saboteur Abator suicide run Rhea dies Olympia Neptunian Ghelt Poseidon Anubis dynamic bow scrape human filth Nerrian Protectorate character comparisons Batman Wolverine Superman Cyclops Wonder Woman Terminator Cable Picard casting Tom Welling Liv Tyler Karl Urban Timberlake Ealy Spiridakos Mooney Chung Kravitz Yeun Somerhalder Wong Saldana Yune",
};

export default function BattlefieldAtlantis() {
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    if (!search.trim()) return sections;
    const q = search.toLowerCase();
    return sections.filter(
      (s) =>
        s.label.toLowerCase().includes(q) ||
        (pageContent[s.id] || "").toLowerCase().includes(q)
    );
  }, [search]);

  const visibleIds = new Set(filteredSections.map((s) => s.id));

  return (
    <div className="min-h-screen astralnaut-bg text-foreground">
      {/* Hero banner */}
      <div className="gradient-sunrise py-16 px-4 text-center">
        <div className="container max-w-5xl mx-auto">
          <div className="flex items-center justify-start mb-6">
            <Link to="/astralnaut-studios">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
          </div>
          <h1 className="text-4xl sm:text-5xl font-comic tracking-[0.1em] text-glow text-primary mb-2">
            Battlefield: Atlantis
          </h1>
          <p className="text-sm text-muted-foreground mb-4">Raw Story Notes — 40 Pages + 4 Script Archives + 4 Notebook Transcripts + Character Creator</p>
          <PortToEngineButton storyId="battlefield-atlantis" />
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-10 space-y-8">
        <StoryNotesSearch query={search} onChange={setSearch} placeholder="Search Battlefield: Atlantis notes…" />

        {/* Table of Contents */}
        <div id="table-of-contents" className="glass-panel border-glow rounded-lg overflow-hidden">
          <div className="border-b border-white/[0.06] px-6 py-4">
            <h2 className="text-xl font-comic tracking-wider text-primary">Table of Contents</h2>
          </div>
          <div className="px-6 py-4">
            <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {filteredSections.map((s) => (
                <a key={s.id} href={`#${s.id}`} className="text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded hover:bg-white/[0.04]">
                  {s.label}
                </a>
              ))}
            </nav>
          </div>
        </div>

        {/* ===== PAGE 1 ===== */}
        {visibleIds.has("page-1") && (
          <PageSection id="page-1" title="Page 1 — World & Character Lists">
            <Pre>{`Ore bod apple in edch comp

Cyberies / Syberid

Technor

Eorth

Artemis
- Alympicd
- Frejd Fryor
- Constrayd
- 2evs/Rlad/ Atlds
- Ca contal Arternis

Neotinos
- Poseidon
- Rilkar/ Arind
- Hoydon
- Kotan
- Pronalhs /Alyssd

Ares - Halimor City
- Lontos
- Anlyn/Talon/ Lee
- Velour
- Sena/Artu
- Revoté
- Rove

Mas

Astre
- Renod City (cs)
- Orion`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 2 ===== */}
        {visibleIds.has("page-2") && (
          <PageSection id="page-2" title="Page 2 — Violence in Storytelling (Russell 2)">
            <Pre>{`Russell 2

Integrating violence into their compositions. Whether it is fantasy violence or horror, the authors are capable to provoke and alter the reader's mindset from what it was previously. For example, in the article 'Why we crave horror movies', Stephen King introduces the reader with an alarming observation: "I think that we're all mentally ill; those of us outside the asylums only hide it a little better—and maybe not all that much better, after all." (p. 561 pg.1) The words 'mentally ill' are often classified as being 'insane' or 'not normal'. Many people would often take offense to this, so his article would evidently grab the reader's attention. King also uses vocabulary like "grimaces", "hysterical", and "irrationality". These words are not used frequently within our utopian society simply because of their negative connotations inflicts us.

Inside Jones' first sentence in his article, he explains that "At age 13 I was alone and afraid." (p.565 pg.1) He tactfully sets an off-putting tone to the article, catching the reader's attention and curiosity as to why he felt that way at such a young age. The age 13 is the year of adolescence, but is still distinguished as a child. Children are often seen as 'innocent' and are 'undeterred' from negative influences. "Rage was something to overcome and cooperation was always better than conflict, I suffocated my deepest fears and desires under a nice-boy persona." (p.565. pg.1) This sentence completely discredits the embodiment of society's values of how children should feel along with the innocence that they had. It is a lot easier to grab the reader's attention and change their way of thinking when the author starts off his or her work with an offensive topic or a displeased tone.

Since both authors are consistent with the tones of their articles, the reader's mind will start to become influenced by the potential fear and desired outcomes by`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 3 ===== */}
        {visibleIds.has("page-3") && (
          <PageSection id="page-3" title="Page 3 — Character & Location Notes">
            <Pre>{`2

Terron Sol (Goins) Resemus

AKropolis Grey Alions

Arethis Gis Gint

Osin's/Anubis -Norbanus

Andt? Hows -1hd

dset

Osinis set roise the dd to do his biddns Andrdnon

Terses Colle (Hommis)
- Ruins fon Anint Ciliton -Sulntry(

destoyod by hterplot wer Chronos

- Tounit /Besurt world Tount hy m Kon cvivere you

Dracores Hemerd Licord- men (Drecnion)

21st Centny Furth lit kat Adllow lort Hw e)

-felies on dh teh fom cher wolds

-Conlty relis didess

- Belitesin "God"`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 4 ===== */}
        {visibleIds.has("page-4") && (
          <PageSection id="page-4" title="Page 4 — Battlefield: Atlantis - Exordium (A-1 / A-2)">
            <Heading>Battlefield: Atlantis - Exordium</Heading>
            <Heading>A-1</Heading>
            <Pre>{`SQ1-A: INCITING INCIDENT - 35,000 years ago a massive sky port, Sahntee Station, in Mars orbit explodes. A giant chunk of debris goes careening down towards the planet, on a direct course for the densely populated Renoa City and its completely unaware inhabitants. The impact destroys the entire city killing over 2.1 million people.

SQ2-A: The Tri-Planetary Coalition Council holds an emergency session in Halimar City on Planet Ares hosted by the King of Ares, Arolyn Lantos, and chaired by the ruler of Earth Nation Alympia, Zeuzano Constra. Other council members in attendance are the ruler of the Earth Nation Haydon, Prometheus Katan, the Martian Premier, Rail Asyllia, and the commander of the Nerrian Defense Force, Orion the Hunter. The scene begins in the middle of the meeting where a previous council member and uninvited guest, Rikkard Poseidon, the ruler of Neptunos, who appears via giant view screen has engaged in a heated exchange over an extreme course of action.

Rikkard Poseidon's position is that since the Gaian Separatist Movement has taken responsibility for the attack on Sahntee Station, the Gaian homeworld, Terran Sol, must be destroyed. On Planet Earth, in the heart of Alympia is the Nativus Luminator, an ancient weapon built out of a volcano that fires a blast of energy from the Earth's core. The Luminator existed long before Humans settled on Earth even before the first Gaian settlers before them. When the council refuses, Poseidon threatens to invade Alympia and take control of the weapon. Battle lines are drawn and the gauntlet thrown down by Poseidon is quickly picked up by Zeusano. The sequence ends with Prometheus withdrawing his support in protest of the council's decision to battle amongst each other vs retaliation against the Gaians and Zeusano declaring that any aggression against Alympia will be viewed as a proclamation of war.`}</Pre>
            <Heading>A-2</Heading>
            <Pre>{`SQ-3 (A): First Obstacle: While still on Ares, Zeuzano and Orion are contacted by the commander of the Nerrian Defense Force Armada, Herana Costra, Zeuzano's wife and Queen of Alympia, currently heading up the relief effort on Mars. She informs him that three Gaian ships are headed for the Nerrian border. Zeus orders her to send two ships to the border to intercept them and to bring the NDF Flagship, the Ryûken, to Earth in geosynchronous orbit over Alympia as the last line of defense. Orion goes to prepare their transport for departure when Astra, Zeuzano's former apprentice and his third Ascended Operative, appears to ask if they are going to war. It becomes apparent that Astra's unrequited love for Zeuzano may forever go unnoticed.

SQ-3 (B): Zeuzano and Astra are attacked by Neptunian assassins. The duo make short work of them with the help of Orion who appears with the transport at a tense moment and blasts the remaining few. It is now apparent that Poseidon has moved up his timetable to take them by surprise and an attack on Alympia is imminent. Zeuzano, Astra and Orion head to Earth to intercept Poseidon's forces.

SQ-4: Midpoint Culmination: With the help of the Ryuken, the Allies are able to fight their way down to the surface before the second wave of Poseidon's forces attack. Astra uses her powers to hold back a massive tidal wave. When it is evident that she can stave off and counter anything Poseidon throws their way, the real battle begins.

SQ-5: Subplot & Rising Action: Rhea and the crew of the Ryuken are staving off an attack in orbit by the Gaian Separatist Movement who want the laminator to destroy Terran Sol in order to start a Third Gaian War. The Neptunian Offensive, appearing to be on the ropes, rallies when the first three Leviathans rise out of the ocean. Astra, Zeus and Orion, with great effort, are able to`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 5 ===== */}
        {visibleIds.has("page-5") && (
          <PageSection id="page-5" title="Page 5 — Handwritten Notes">
            <Pre>{`The in Rhed tus the te by iy her Ct Carth's orbit.

hk t t their ships.

Bs Or con thto te se T some eectrostatic intene.

Rhew: Tum thom towards the Goion Ships

Cab: what?

o of welkuss he ther dofenes.

I a ih tom disbke thr shiels`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 6 ===== */}
        {visibleIds.has("page-6") && (
          <PageSection id="page-6" title="Page 6 — Act Structure (SQ1–SQ8)">
            <Heading>Battlefield: Atlantis</Heading>
            <Heading>Act-1</Heading>
            <Pre>{`SQ1-A: INTRO
Talos, the Dark Avenger, takes out criminals on the run in the streets of Alympia. He interrogates one for information on the whereabouts of Orion the Hunter.

SO1-B: INCITING INCIDENT
During a celebration in Halimar City on Planet Ares, terrorists working for the Gaian Separatist Movement attack and attempt to abduct the "heir of light". All assume this is Atlas as his father, Zeus, controlled lightning. A big fight breaks out between the GsM and Helmers forces. Most energy is cut off.`}</Pre>
            <Heading>Act-2</Heading>
            <Pre>{`Now need of of sptias SQ3Te boes tphnt S S oetet Boredun. by th NDF SQ6:M Ats df Pos bt Rhe is`}</Pre>
            <Heading>Act-3</Heading>
            <Pre>{`The minor de Atints n his hoer. To be continued Rd t t P while Ens is inth Astral Plang`}</Pre>
            <Heading>A-3</Heading>
            <Pre>{`SQ-6: Main Culmination
Poseidon somehow raises four more Leviathans out of the sea. There are now seven total and no way to stop them from destroying Alympia, first, and then the entire planet. In orbit, The Ryuken, under Rhea's leadership, has the Gaian ships on the ropes.

SQ-7: New Tension & Twist
A traitor onboard the Ryuken caused the ship to lose power at a crucial moment. The Ryuken, power lost, and now badly damaged, begins to fall out of the sky. Astra uses all of her power to correct the Ryuken's descent and is unable to keep her TK shield up to block the Leviathans' attack. During this struggle, Zeus uses his powers to open a gravimetric singularity within the planet's atmosphere to suck the Leviathans through. The problem is, that he can only close it from the other side, meaning he has to go through with the Leviathans, never to return.

SQ-8: Resolution
Zeus and Astra communicate telepathically as she tries to sway Zeus from this course of action. Astra confesses her love for Zeus, but to no avail. He passes through the portal and is gone forever. Astra, saddened and then enraged, ASCENDS to level three, which for a PSI, has never been seen before. Her body and soul split into two separate entities; Astra, the body, and Asterya, the collective soul emerged as a corporeal being of pure energy. Asterya wipes out Poseidon's mind and flies off into the void in search for Zeus. Later, Rhea, in her quarters onboard the Ryuken, is visited by Asterya's astral form and is delivered a warning about the future. A few days later, repairs are being made to the city and Orion delivers a eulogy for Zeus for a memorial service that has representatives from all over the Nerrian Galaxy in attendance. The final scene is in Poseidon's hospital room where in one frame he is there under restraints, still in a comatose state. The next panel, he has disappeared.

To Be Continued`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 7 ===== */}
        {visibleIds.has("page-7") && (
          <PageSection id="page-7" title="Page 7 — Handwritten Notes (BA2 & BA3)">
            <Pre>{`Battlefield: Atlantis 2
Battlefield: Atlantis

Act-1
Thiiduy the jnp tte fte bs Chos to stop Osinis.

Le th Aher o ofher sledrt on tWhn 2 A

SQ-5: SM O B td R R fn the doad to figlt ther loved ones

Act-3
tot n me t ut et the asd

To Be Concluded

Battlefield: Atlantis 3

Act-1 (Tutemas)
so tn b e b i d

Ledm Now SO IITING NCIDNT-Th Vomr hod to E

Shae 23 dic cer row

Act-2
T o te Th e

Freye SO-3(B:m dctal Aesr nemed 0dmn.

Frejor re MCZes Asn t tre Ccalti

Futd Re Sone tho dy

Woive SQ-5:

Cy eri

Act-3
SQ-7: SaResition`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 8 ===== */}
        {visibleIds.has("page-8") && (
          <PageSection id="page-8" title="Page 8 — Story Bible (Version A)">
            <Heading>Act 1</Heading>
            <Heading>Intro Scene / Inciting Incident #1:</Heading>
            <Pre>{`Caption Reads: Sahntee Station, Mars Orbit..35,000 years ago. Massive Space station in orbit over Mars explodes. Giant sized debris destroys a heavily populated city on the surface.`}</Pre>
            <Heading>Sequence One</Heading>
            <Pre>{`Word of the Story: Sci-fi action-adventure, fantasy set in our galaxy's distant past when the planets Earth, Mars, and Ares are even more populated than today. The powers of the mind where abilities lie telepathy and telekinesis are commonplace. Ascended beings are able to bridge the gap between mind, body, and soul making them infinitely more powerful.`}</Pre>
            <Heading>Introduce Protagonist:</Heading>
            <Pre>{`Zeuzano Constra is the ruler of the Earth Nation Alympia and chancellor of the Tri-Planetary Coalition. Zeuzano, or Zeus as he is referred to by those close to him, is an Ascended who can manipulate energy in its rawest physical form; electricity.`}</Pre>
            <Heading>Introduce Antagonist:</Heading>
            <Pre>{`Rikkard Poseidon, Ruler of the Earth nation Neptunos, is an Ascended human who controls Water in all forms. Arrogant, ruthless, loud and headstrong. Poseidon believes Earth is to be ruled by Humans alone and the Tri-Planetary Coalition is an affront to all they fought for during the Second Gaian War.`}</Pre>
            <Heading>Status Quo:</Heading>
            <Pre>{`There's an unsteady truce between the Tri-Planetary Coalition (Earth/Mars/Ares) and the Gaian Protectorate (Planet Terran Sol). Peace has been maintained.`}</Pre>
            <Heading>Background:</Heading>
            <Pre>{`Humans and Gaians have always been at odds over who has true claim to the planet Earth. Gaians had already lived on Earth for more than a millennium before the first Humans came to Earth from the Planet Ares. Although, there were a primitive race of humans who were indigenous to Earth. The First Gaian War was resolved when the first ascended human, Constra, whose powers emerged and she drove the Gaians off the planet. The people named the final stand took place at Constra's stronghold. Hundreds of years later, young Zeuzano Constra descended from this Ascended lineage. Poseidon, ruler of Neptunos and Prometheus, ruler of Haydon, used their powers to win a second Gaian war launched from the Gaians' homeworld, Terran Sol.`}</Pre>
            <Heading>Dramatic Premise:</Heading>
            <Pre>{`An emergency session of the Tri-Planetary Coalition council is convened on the Planet Ares. Zeuzano Constra, Arolyn Lantos (King of Ares), Prometheus, and the Martian Premier Rail Asyll are in attendance. Poseidon, no longer a council member, has appeared via satellite.

The Gaian Separatist Movement has claimed responsibility for the terror attack and not the Gaian Protectorate.`}</Pre>
            <Heading>Inciting Incident (Plot Point #1):</Heading>
            <Pre>{`Poseidon demands that the TPC use an ancient alien weapon the size of a volcano in the center of Constra's city, Alympia, and use the weapon himself.`}</Pre>
            <Heading>Sequence Two</Heading>
            <Pre>{`Zeuzano must act to defend Alympia against Poseidon's attack while at the same time figure out who destroyed Sahntee Station in the interest of igniting this conflict.`}</Pre>
            <Heading>Introduce Supporting Character #1:</Heading>
            <Pre>{`Herrhea Constra, Zeuzano's queen and commander of the Nerrian Defense Force Armada. Commanding officer of the NDF Flagship Ryuken. Beautiful, independent, stubborn in command. A decisive leader who doesn't always see eye-to-eye with her husband. Herrhea is central to an act II subplot happening in Earth's orbit aboard the Ryuken.`}</Pre>
            <Heading>Introduce Supporting Character #2:</Heading>
            <Pre>{`Hunte, General in the Nerrian Defense Force, an elite Ascended, the Allies. Orion is also Zeuzano's oldest friend.`}</Pre>
            <Heading>Introduce Supporting Character #3:</Heading>
            <Pre>{`Astra, a powerful telekinetic with telepathic abilities. Zeuzano rescued her when he was a child. Astra is secretly in love with Zeus, keeps her feelings to herself, especially from Zeus, but Orion knows.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 9 ===== */}
        {visibleIds.has("page-9") && (
          <PageSection id="page-9" title="Page 9 — Outline Headings & Tables">
            <Pre>{`Predicament Obstacle:

Predicament Solution: 8

Action Block #1:

The Lock-In (Plot Point #2):`}</Pre>
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>65</TableCell><TableCell>33</TableCell><TableCell>133</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <Pre>{`Link to article`}</Pre>
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>22</TableCell><TableCell>7</TableCell><TableCell>1</TableCell>
                    <TableCell>620</TableCell><TableCell>693</TableCell><TableCell>160</TableCell>
                    <TableCell>40</TableCell><TableCell>48</TableCell><TableCell>1203</TableCell>
                    <TableCell>177</TableCell><TableCell>+138</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </PageSection>
        )}

        {/* ===== PAGE 10 ===== */}
        {visibleIds.has("page-10") && (
          <PageSection id="page-10" title="Page 10 — Exordium Outline (Duplicate)">
            <Heading>Battlefield: Atlantis - Exordium</Heading>
            <Heading>A-1</Heading>
            <Pre>{`SQ1-A: INCITING INCIDENT - 35,000 years ago a massive sky port, Sahntee Station, in Mars orbit explodes. A giant chunk of debris goes careening down towards the planet, on a direct course for the densely populated Renoa City and its completely unaware inhabitants. The impact destroys the entire city killing over 2.1 million people.

SQ2-A: The Tri-Planetary Coalition Council holds an emergency session in Halimar City on Planet Ares hosted by the King of Ares, Arolyn Lantos, and chaired by the ruler of Earth Nation Alympia, Zeuzano Constra. Other council members in attendance are the ruler of the Earth Nation Haydon, Prometheus Katan, the Martian Premier, Rail Asyllia, and the commander of the Nerrian Defense Force, Orion the Hunter. The scene begins in the middle of the meeting where a previous council member and uninvited guest, Rikkard Poseidon, the ruler of Neptunos, who appears via giant view screen has engaged in a heated exchange over an extreme course of action.

Rikkard Poseidon's position is that since the Gaian Separatist Movement has taken responsibility for the attack on Sahntee Station, the Gaian homeworld, Terran Sol, must be destroyed. On Planet Earth, in the heart of Alympia is the Nativus Luminator, an ancient weapon built out of a volcano that fires a blast of energy from the Earth's core. The Luminator existed long before Humans settled on Earth even before the first Gaian settlers before them. When the council refuses, Poseidon threatens to invade Alympia and take control of the weapon. Battle lines are drawn and the gauntlet thrown down by Poseidon is quickly picked up by Zeusano. The sequence ends with Prometheus withdrawing his support in protest of the council's decision to battle amongst each other vs retaliation against the Gaians and Zeusano declaring that any aggression against Alympia will be viewed as a proclamation of war.`}</Pre>
            <Heading>A-2</Heading>
            <Pre>{`SQ-3 (A): First Obstacle: While still on Ares, Zeuzano and Orion are contacted by the commander of the Nerrian Defense Force Armada, Herana Costra, Zeuzano's wife and Queen of Alympia, currently heading up the relief effort on Mars. She informs him that three Gaian ships are headed for the Nerrian border. Zeus orders her to send two ships to the border to intercept them and to bring the NDF Flagship, the Ryûken, to Earth in geosynchronous orbit over Alympia as the last line of defense. Orion goes to prepare their transport for departure when Astra, Zeuzano's former apprentice and his third Ascended Operative, appears to ask if they are going to war. It becomes apparent that Astra's unrequited love for Zeuzano may forever go unnoticed.

SQ-3 (B): Zeuzano and Astra are attacked by Neptunian assassins. The duo make short work of them with the help of Orion who appears with the transport at a tense moment and blasts the remaining few. It is now apparent that Poseidon has moved up his timetable to take them by surprise and an attack on Alympia is imminent. Zeuzano, Astra and Orion head to Earth to intercept Poseidon's forces.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 11 ===== */}
        {visibleIds.has("page-11") && (
          <PageSection id="page-11" title="Page 11 — Act Structure (Continued)">
            <Pre>{`10`}</Pre>
            <Heading>SQ-4: Midpoint Culmination</Heading>
            <Pre>{`With the help of the Ryuken, the Allies are able to fight their way down to the surface before the second wave of Poseidon's forces attack. Astra uses her powers to hold back a massive tidal wave. When it is evident that she can stave off and counter anything Poseidon throws their way, the real battle begins.`}</Pre>
            <Heading>SQ-5: Subplot & Rising Action</Heading>
            <Pre>{`Rhea and the crew of the Ryuken are staving off an attack in orbit by the Gaian Separatist Movement who want the laminator to destroy Terran Sol in order to start a Third Gaian War. The Neptunian Offensive, appearing to be on the ropes, rallies when the first three Leviathans rise out of the ocean. Astra, Zeus and Orion, with great effort, are able to hold the three Leviathans back and subdue Poseidon.`}</Pre>
            <Heading>SQ-6: Main Culmination</Heading>
            <Pre>{`Poseidon somehow raises four more Leviathans out of the sea. There are now seven total and no way to stop them from destroying Alympia, first, and then the entire planet. In orbit, The Ryuken, under Rhea's leadership, has the Gaian ships on the ropes.`}</Pre>
            <Heading>SQ-7: New Tension & Twist</Heading>
            <Pre>{`A traitor onboard the Ryuken caused the ship to lose power at a crucial moment. The Ryuken, power lost, and now badly damaged, begins to fall out of the sky. Astra uses all of her power to correct the Ryuken's descent and is unable to keep her TK shield up to block the Leviathans' attack. During this struggle, Zeus uses his powers to open a gravimetric singularity within the planet's atmosphere to suck the Leviathans through. The problem is, that he can only close it from the other side, meaning he has to go through with the Leviathans, never to return.`}</Pre>
            <Heading>SQ-8: Resolution</Heading>
            <Pre>{`Zeus and Astra communicate telepathically as she tries to sway Zeus from this course of action. Astra confesses her love for Zeus, but to no avail. He passes through the portal and is gone forever. Astra, saddened and then enraged, ASCENDS to level three, which for a PSI, has never been seen before. Her body and soul split into two separate entities; Astra, the body, and Asterya, the collective soul emerged as a corporeal being of pure energy. Asterya wipes out Poseidon's mind and flies off into the void in search for Zeus. Later, Rhea, in her quarters onboard the Ryuken, is visited by Asterya's astral form and is delivered a warning about the future. A few days later, repairs are being made to the city and Orion delivers a eulogy for Zeus for a memorial service that has representatives from all over the Nerrian Galaxy in attendance. The final scene is in Poseidon's hospital room where in one frame he is there under restraints, still in a comatose state. The next panel, he has disappeared.

To Be Continued`}</Pre>
            <Heading>Battlefield: Atlantis 1</Heading>
            <Heading>Act-1</Heading>
            <Pre>{`SQ1-A: INTRO
Talos, the Dark Avenger, takes out criminals on the run in the streets of Alympia. He interrogates one for information on the whereabouts of Orion the Hunter.

SQ1-B: INCITING INCIDENT
During a celebration in Halimar City on Planet Ares, Terrorists working for the Gaian Separatist Movement attack and attempt to abduct the "heir of`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 12 ===== */}
        {visibleIds.has("page-12") && (
          <PageSection id="page-12" title="Page 12 — Blank Act Template (BA1)">
            <Heading>Battlefield: Atlantis</Heading>
            <Pre>{`Act-1
SQ1-A: INTRO -
SQ1-B: INCITING INCIDENT -

Act-2
SQ2-A:
SQ-3 (A): First Obstacle:
SQ-3 (B):
SQ-4: Midpoint Culmination:
SQ-5:
SQ-6: Main Culmination:

Act-3
SQ-7:
SQ-8: Resolution:

To be continued`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 13 ===== */}
        {visibleIds.has("page-13") && (
          <PageSection id="page-13" title="Page 13 — Blank Act Template (BA3)">
            <Heading>Battlefield: Atlantis 3</Heading>
            <Pre>{`Act-1
SQ1-A: INTRO -
SQ1-B: INCITING INCIDENT

Act-2
SQ-3 (A): First Obstacle:
SQ-3 (B):
SQ-4: Midpoint Culmination:
SQ-5:
SQ-6: Main Culmination:

Act-3
SQ-7:
SQ-8: Resolution:

To Be Concluded`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 14 ===== */}
        {visibleIds.has("page-14") && (
          <PageSection id="page-14" title="Page 14 — Story Bible (Version B)">
            <Heading>Act 1</Heading>
            <Heading>Intro Scene / Inciting Incident #1:</Heading>
            <Pre>{`Caption Reads: Sahntee Station, Mars Orbit. 35,000 years ago. Massive Space station in orbit over Mars explodes. Giant sized debris destroys a heavily populated city on the surface.`}</Pre>
            <Heading>Sequence One</Heading>
            <Heading>World of the Story:</Heading>
            <Pre>{`Sci-fi, action-adventure, fantasy set in our galaxy's distant past when the planets Earth, Mars, and Ares are even more populated and technologically advanced than they are today. Aliens from all over the galaxy live on these three planets, governed by the Tri-Planetary Coalition (TPC), that serve as the hub for diplomacy and commerce for the entire Nerrian Galaxy. People in this time are able to more easily manipulate energy using only the powers of the mind, where abilities like telepathy and telekinesis are commonplace. Ascended beings are able to bridge the gap between mind, body, and soul making them infinitely more powerful.`}</Pre>
            <Heading>Introduce Protagonist:</Heading>
            <Pre>{`Zeuzano Constra is the ruler of the Earth Nation Alympia and chancellor of the Tri-Planetary Coalition. Zeuzano, or Zeus as he is referred to by those close to him, is an Ascended who can manipulate energy in its rawest physical form; electricity.`}</Pre>
            <Heading>Introduce Antagonist:</Heading>
            <Pre>{`Rikkard Poseidon, Ruler of the Earth nation Neptunos, is an Ascended human who controls Water in all forms. Arrogant, ruthless, loud and headstrong. Poseidon believes Earth is to be ruled by Humans alone and the TPC is an affront to all they fought for during the Second Gaian War.`}</Pre>
            <Heading>Status Quo:</Heading>
            <Pre>{`There is an unsteady truce between the Tri-Planetary Coalition (Earth/Mars/Ares) and the Gaian Protectorate (Planet Terran Sol), but peace has been maintained.`}</Pre>
            <Heading>Background:</Heading>
            <Pre>{`Human and Gaians have always been at odds over who has true claim to the planet Earth. Gaians had already lived on Earth for more than a millennium before the first Humans came to Earth from the Planet Ares. Although, there were a primitive race of humans who were indigenous to the Earth living under Gaian rule, the Humans from Ares didn't like how their distant cousins were being treated. This dispute started the first Gaian War which was resolved when the first ascended human, Consterya's, powers emerged and she drove the Gaians off the planet. The people named the land where the final stand took place Consterya in her honor. Hundreds of years later, a young Zeuzano, Consterya's direct descendant, along with his Ascended Allies Poseidon, ruler of Neptunos and Prometheus, ruler of Haydon, used their powers to win a second Gaian war launched from the Gaian's homeworld, Terran Sol.`}</Pre>
            <Heading>Status Quo Obstacle:</Heading>
            <Pre>{`In the years hence, the original Allies have grown apart and Zeus and Poseidon are now adversaries who battle over position and territory.`}</Pre>
            <Heading>Dramatic Premise:</Heading>
            <Pre>{`An emergency session of the Tri-Planetary Coalition council is convened on the Planet Ares. Zeuzano Constra, Arolyn Lantos, King of Ares, Prometheus and the Martian Premier, Rail Asyllia, are all in attendance. Poseidon, no longer a council member, has appeared via satellite comm on the big screen to demand the council take action against the Gaians in retaliation, even though it has been made clear that a splinter faction, the Gaian Separatist Movement, has claimed responsibility for the terror attack and not the Gaian Protectorate.`}</Pre>
            <Heading>Inciting Incident (Plot Point #1):</Heading>
            <Pre>{`Poseidon demands that the TPC use an ancient alien weapon the size of a Volcano in the center of Consteraya's capital city, Alympia, to destroy the Gaian's homeworld. When the council refuses, Poseidon gives them 24 hours to comply or he will launch an attack on Alympia and use the weapon himself.`}</Pre>
            <Heading>Sequence Two</Heading>
            <Heading>Protagonist's Objective:</Heading>
            <Pre>{`Zeuzano must get back to Earth and ready Alympia's defenses against Poseidon's attack, while at the same time figure out who destroyed Sahntee Station in the interest of igniting this conflict.`}</Pre>
            <Heading>Introduce Supporting Character #1:</Heading>
            <Pre>{`Herrhea Constra, Zeuzano's queen and commander of the Nerrian Defense Force Armada. Commanding officer of the NDF Flagship Ryuken. Beautiful, independent, stubborn, in command. A decisive leader who doesn't always see eye-to-eye with her husband. Herrhea is central to an act II subplot happening in Earth's orbit aboard the Ryuken.`}</Pre>
            <Heading>Introduce Supporting Character #2:</Heading>
            <Pre>{`Orion the Hunter or 'General Orion' is head of the Nerrian Defense Force's and a member of Zeuzano's trio of elite Ascended, the Allies. Orion is also Zeuzano's oldest friend.`}</Pre>
            <Heading>Introduce Supporting Character #3:</Heading>
            <Pre>{`Astra is a powerful telekinetic with telepathic abilities. Zeuzano rescued her when she was still a child and taught her how to use her abilities. Now, as a young woman she puts those abilities to use as the third member of Zeuzano's elite operatives, the Ascended Allies. Astra, secretly in love with Zeus, keeps her feelings to herself...especially from Zeus, but Orion "knows".`}</Pre>
            <Heading>Introduce Supporting Character #4:</Heading>
            <Pre>{`Commander Summanus is an NDF soldier who acts as General Orion's "go-to" guy. Summanus is central to one of the subplots happening on the ground at Alympia at the onset of Poseidon's initial attack.`}</Pre>
            <Pre>{`Predicament Obstacle:

Predicament Solution:

Action Block #1:

The Lock-In (Plot Point #2):

Source`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 15 ===== */}
        {visibleIds.has("page-15") && (
          <PageSection id="page-15" title="Page 15 — Handwritten Notes (The Planet)">
            <Pre>{`Poye I

The Plonet

The mijony i Eort's siter Plts.…. 3

Edrth.. mote d ue Homars

25000 yeus Goions, Hltios.

8 Mon Ares.

"obto oo 7 orbitl

A iser 75 ..nd Mars.

T hhdt o techlly Tagether, thee fhoe plat

advond so of mo dift wlten rokes and cultrs.

are the conter of te commic farth and portied sucthre for Me

Kaw golkexy,

in the middle of whot is nore kwm as the Atbentic Oceome.

sot plto f hig th s Stetis. eim y s

Avs Explion. 5

And Right now .….itis ot Wer!`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 16 ===== */}
        {visibleIds.has("page-16") && (
          <PageSection id="page-16" title="Page 16 — Handwritten Notes">
            <Pre>{`unts
ip Lea3
μM $2^}$

E

5

S $1Ksu7  1
2

  7

  $ H411
  @

t 2`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 17 ===== */}
        {visibleIds.has("page-17") && (
          <PageSection id="page-17" title="Page 17 — Handwritten Notes">
            <Pre>{`gp0

61

   n
   7

2

12

47
+q    7
E2\\`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 18 ===== */}
        {visibleIds.has("page-18") && (
          <PageSection id="page-18" title="Page 18 — Handwritten Notes (Zeus)">
            <Pre>{`Page 4
He is called Zeus Olympic, Cgitel. 8 SFA

(nstroyd-

N Roche Pere

He is a buen bany wh poses He d to mow wck, every m it rovest fA ELECTRICIT/

Pal

3 B SFX:BIAT3 4

Hhis dbilig comes m the Alonside ham frght Orim, the Honter.…. from the thit we line h Plaret Mors.

povers of the mind

A Superior Pilot...

Noter

…ind mastor of weapons anl tatics...`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 19 ===== */}
        {visibleIds.has("page-19") && (
          <PageSection id="page-19" title="Page 19 — Handwritten Notes (Orion / Astra)">
            <Pre>{`ORION THE HUNTER

e too is ronded t by the yo 2 and Beoutiel Astran whos skolls wit telepaly & tote kerins go imporaleed. she i th jon o te plet Ares

Toyelor the thre of ho or cll the V μ Did you put ALLIES... Nic Cotch, Astro on weight, ORISN?

ASTIEA ZEUS 1

Poseidon..

14 Their oorent. te es nd p Poseider.. Ruter of land of Nephre and has the dbility to control water..

Zeus...

h iwter he should whe it oll.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 20 ===== */}
        {visibleIds.has("page-20") && (
          <PageSection id="page-20" title="Page 20 — Handwritten Notes (Battle)">
            <Pre>{`We need d wedy post his defense.

Orion... On it..`}</Pre>
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableBody>
                  <TableRow>
                    <TableCell>TXX</TableCell><TableCell>Bo</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>……Gef me</TableCell><TableCell>8</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>on oponing</TableCell><TableCell>25</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>F</TableCell><TableCell></TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
            <Pre>{`Telekeniticelly lonchd Boldors come roers towtan Poesiten from behnd

Astre Now whie heis foung

The Bouldes...

$l ra hip`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 21 ===== */}
        {visibleIds.has("page-21") && (
          <PageSection id="page-21" title="Page 21 — Screenwriting Notes">
            <Heading>Screenwriting Notes</Heading>
            <Heading>Goals vs Needs:</Heading>
            <Pre>{`Conscious Goal: Atas must expose and stop Poseidon from destroying Earth.

Unconscious Need: Atas must use his ascended ability to cope with his good.`}</Pre>
            <Heading>Character Power:</Heading>
            <Pre>{`Atas is insecure about his power and leans too much on his tech, which he can control, because his power, which he can't control.`}</Pre>
            <Heading>Degree of Character Flow:</Heading>
            <Pre>{`Atas is really insecure because he feels like no matter how much descended power he has, he will never be the hero his father was. He must get over this and realize that he doesn't have to be.`}</Pre>
            <Heading>Six Key Turning Points:</Heading>
            <Pre>{`Atas only needs to be Atas.`}</Pre>
            <Heading>Catalyst:</Heading>
            <Pre>{`Ferct attack Arrs.`}</Pre>
            <Heading>Big Event:</Heading>
            <Pre>{`Atas' talent decides to break Besuker ort, become fijitus, and.`}</Pre>
            <Heading>Pinch:</Heading>
            <Pre>{`Go find Orion the tutor. Atas learns to use his powers, and details believe in his own abilities and stop pushing his tech as a crutch.`}</Pre>
            <Heading>Crisis:</Heading>
            <Pre>{`- Earth under threat from carbon event.
- Earth's inhabitants peril (Noptra).
- Atas tries to convince the Tri-Planetary coalition sent on Mars to invade Nestere and fight, where most want to scuttle/retreat -- Atas and Orion guide them.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 22 ===== */}
        {visibleIds.has("page-22") && (
          <PageSection id="page-22" title="Page 22 — Realization & Character Keys">
            <Pre>{`Showdon: She thal showdom ocwrs when Akrs goes to Negtne to foe offt aganrst Poseidon. and himself.

Redlization! Atas stegs out of his fathers shadow, pots dside his own insecnitier for the sike of the plunt, and dscends to lavel2 dflowy hon to defest Poscidon.

2

Rhed redlizes thait Atlds is d mon dnd d hero i his onn right ond fors the Reigrs of the kingloun over t him. He is row kigof Olympie

3

The plantet Eart and the knofirns of Consteya vecogie dnd dchrowlde thot Atlrs ys dhd pot dbdndn the Plont when everyon else wd ready to, saveed the pldnt by rollyy the korgdons to band fogethor dnd fit ds a cited forcé - os one nttion. Thir notron of ore remoins ntact and the Contivent of constuyd choges to the contint of o Atlontis.`}</Pre>
            <Heading>Keys to Creating Good Characters:</Heading>
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableBody>
                  <TableRow><TableCell>6</TableCell><TableCell>Goal & Opposites</TableCell></TableRow>
                  <TableRow><TableCell>2</TableCell><TableCell>Motivation</TableCell></TableRow>
                  <TableRow><TableCell>2</TableCell><TableCell>Backstory</TableCell></TableRow>
                  <TableRow><TableCell>4</TableCell><TableCell>The will to act</TableCell></TableRow>
                  <TableRow><TableCell>5</TableCell><TableCell>A point of view and attitudes</TableCell></TableRow>
                  <TableRow><TableCell>6</TableCell><TableCell>Room to Grow</TableCell></TableRow>
                  <TableRow><TableCell>7</TableCell><TableCell>Believability</TableCell></TableRow>
                  <TableRow><TableCell>8</TableCell><TableCell>Details (idiosyncrasies, habits, quirks..)</TableCell></TableRow>
                  <TableRow><TableCell>9</TableCell><TableCell>A writer who cares (Ohes Pegh, Pesl Gpries</TableCell></TableRow>
                  <TableRow><TableCell>10</TableCell><TableCell>Strong Supporting Cast</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
            <Pre>{`- Main Character / Atlas

Strong Opposing Character/ Poseidon / Gaian Separatist

- Funny Confidant Sidekick / Lelentos --Goes have interest / Artanis - Pandora

- All different personalities`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 23 ===== */}
        {visibleIds.has("page-23") && (
          <PageSection id="page-23" title="Page 23 — Keys to Great Scenes">
            <Heading>Keys to Great Scenes:</Heading>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body text-sm leading-relaxed">
              <li>Each scene should move the story forward in terms of both plot and character. Ask yourself, "What is the purpose of this scene?"</li>
              <li>Never TELL what you can SHOW.</li>
              <li>Arrange talking heads.</li>
              <li>Start each scene as close to the end of the scene as possible.</li>
              <li>Pacing! Action followed by dialogue. Construct beady scenes with light scenes. Short scenes build tension near climax.</li>
              <li>Scenes should culminate in something dramatic:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>a decision</li>
                  <li>a reversal</li>
                  <li>a cliffhanger</li>
                  <li>a revelation</li>
                  <li>something that makes us want to see what happens next.</li>
                </ul>
              </li>
              <li>Each scene should contain a definite emotion or mood. For example:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Character's goal/intention for the scene drives subtext.</li>
                  <li>Character's feelings.</li>
                  <li>Attitude.</li>
                </ul>
              </li>
              <li>Focus scenes on well-motivated conflict.</li>
              <li>At odds: Red Matter vs. Son vs. Dreamer.</li>
              <li>Eros + Legends (dy students).</li>
              <li>Atlas + Orion (n strong).</li>
              <li>Referred to Carlo Con the bride.</li>
              <li>Each scene should have a definite purpose to build suspense!</li>
              <li>Invoke emotion/crack linked characters/must be believable/feel what they feel.</li>
              <li>Create Conflict:
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Powerful Opposition: create no-win situations but win.</li>
                  <li>Poseidon plans to feed the plot with his power deeper.</li>
                </ul>
              </li>
            </ul>
          </PageSection>
        )}

        {/* ===== PAGE 24 ===== */}
        {visibleIds.has("page-24") && (
          <PageSection id="page-24" title="Page 24 — Building Suspense">
            <Heading>To Build Suspense (Cont.)</Heading>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground font-body text-sm leading-relaxed">
              <li><strong>Build expectation:</strong> Create expectation for trouble to come.</li>
              <li><strong>Increase Tension:</strong> put audience in superior position. Let audience know of the danger while the central characters do not.
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Use different forms of surprise / occasional twist</li>
                  <li>Create sense of urgency: if something is vital for the characters, it is vital for the audience as well</li>
                </ul>
              </li>
              <li><strong>Establish consequences:</strong> consequences if the characters don't achieve goal.
                <ul className="list-disc list-inside ml-4 mt-1">
                  <li>Adds wisdom planning to singlehandedly save the earth, but the situational circumstances come about where they had no choice but to face certain death for the sake of attempting to save the planet and he succeeds.</li>
                </ul>
              </li>
              <li><strong>Limit time!</strong> Put a ticking clock on it</li>
              <li><strong>Maintain Doubt!</strong> Should be a red herring doubt to how the story will end</li>
            </ul>
          </PageSection>
        )}

        {/* ===== PAGE 25 ===== */}
        {visibleIds.has("page-25") && (
          <PageSection id="page-25" title="Page 25 — Tri-Planetary Coalition Roster">
            <Heading>Tri-Planetary Coalition</Heading>
            <Heading>Current Status</Heading>
            <Pre>{`Himonsd wis ow forth 6be9 a Tri-Planetary Coalition

Sha flw 27T o AMars 1 bmb Nw Gdions ssma Nerion Definse Fore`}</Pre>
            <Heading>Relations</Heading>
            <Pre>{`IWoey M Mrt h g e li Ares

189

KaMY 6uba 202 ni20 I 1gI`}</Pre>
            <Heading>Separatists Movement</Heading>
            <Pre>{`pl18 1w c0Intson to cbber 6A O din`}</Pre>
            <div className="overflow-x-auto mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Column 1</TableHead>
                    <TableHead>Column 2</TableHead>
                    <TableHead>Column 3</TableHead>
                    <TableHead>Column 4</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow><TableCell>Zeut</TableCell><TableCell>5 Atlas</TableCell><TableCell>Amubi</TableCell><TableCell>Osiris</TableCell></TableRow>
                  <TableRow><TableCell>Astre</TableCell><TableCell>Lelonts</TableCell><TableCell>Anet</TableCell><TableCell>Horos</TableCell></TableRow>
                  <TableRow><TableCell>Nojorar</TableCell><TableCell>Orion</TableCell><TableCell>Eros</TableCell><TableCell>Orolin</TableCell></TableRow>
                  <TableRow><TableCell>Set</TableCell><TableCell>Feryd</TableCell><TableCell>Rhed</TableCell><TableCell>Artanis</TableCell></TableRow>
                  <TableRow><TableCell>hub</TableCell><TableCell>t be</TableCell><TableCell>00 Frigjor</TableCell><TableCell></TableCell></TableRow>
                  <TableRow><TableCell>Poseidon</TableCell><TableCell>Corlo</TableCell><TableCell>Promethews</TableCell><TableCell></TableCell></TableRow>
                  <TableRow><TableCell>Nemisis</TableCell><TableCell>Benes</TableCell><TableCell>Pandord</TableCell><TableCell></TableCell></TableRow>
                  <TableRow><TableCell>Berserker</TableCell><TableCell>Toctial</TableCell><TableCell>Annihilotor</TableCell><TableCell>Helm</TableCell></TableRow>
                </TableBody>
              </Table>
            </div>
            <Pre>{`Comm`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 26 ===== */}
        {visibleIds.has("page-26") && (
          <PageSection id="page-26" title="Page 26 — Prometheus / Pandora / Asterya">
            <Heading>Prometheus</Heading>
            <Pre>{`Prometheus discovered Pandora when she was only a baby. His psychic vision saw and knew she was destined to ascend and be the powerful goddess Astreyd. Prometheus kept this secret and had psychic blocks put in the child's mind to keep her from accessing her powers.

In part I, Osiris Kings Pandora and Remore, her psychic blocks. When she activates, the energies she releases destroy the entire part Ares.

Note's Asterid: Titan goddess of nocturnal oracles and following stars that lead the lost into the sea to escape Zeus' advances.

Portrayed by the vengeful Hord.

Note: Osiris: lord of the dead.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 27 ===== */}
        {visibleIds.has("page-27") && (
          <PageSection id="page-27" title="Page 27 — BA3 Climax Notes (6/03/2013)">
            <Heading>BA3 Climax — The Risen and Zombie Poseidon</Heading>
            <Pre>{`The Aesir raise Poseidon's corpse into a superpowered Zombie. His reanimated body causes massive tidal waves that threaten the entire planet.

Astra and Asterya must merge — becoming one entity — to challenge the Aesir directly.

Meanwhile, Atlas and Pandora take on Zombie Poseidon together.

Note: Artemis dies in BA2. Her death is described as a "touching departure" — one of the emotional anchors of the second film.

BA3 resolves the Risen threat:
• The Risen cause a global catastrophe — magnetic field reversal, floods, supervolcanoes
• Atlas moves the continent of Consterya south (it becomes Atlantis / the new South Pole)
• Astra and Asterya merge permanently to become one of the Risen
• Atlas goes Level 2 — transforms into a giant rock creature, breaks out of the catacombs
• He controls the Earth itself — opens holes in the ocean floor to drain Poseidon's water source`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 28 ===== */}
        {visibleIds.has("page-28") && (
          <PageSection id="page-28" title="Page 28 — BA3 Script Page 15">
            <Heading>Rhea and Atlas — Shuttlecraft Scene</Heading>
            <Pre>{`INT. SHUTTLECRAFT — COCKPIT — DAY

Rhea and Atlas sit side by side in the cockpit. Atlas stares out the viewport at the approaching city.

RHEA: "You don't have to be the King that your father was. You have to be the King that YOU are."

The shuttlecraft enters Halimar Airspace — a sprawling metropolis that looks like NYC mixed with Asgard. Towering spires, sky-bridges, holographic signage, flying vehicles.

ATLAS: (quiet, looking at the city) "This was his birthright. Not mine."

RHEA: "It IS yours, Atlas. Whether you want it or not."`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 29 ===== */}
        {visibleIds.has("page-29") && (
          <PageSection id="page-29" title="Page 29 — History of Earth Pt. 1">
            <Heading>The Origin of Humans on Earth</Heading>
            <Pre>{`Humans are not originally from Earth. They arrived on Earth from Planet Ares (Mars) thousands of years ago.

When they arrived, the Gaians were the dominant species on Earth. Indigenous primitive humans already existed on the planet but served the Gaians essentially as slaves — a lower caste with no rights or autonomy.

Esteya Consterya was the first human to Ascend. She used her powers to drive the Gaians off Earth in what became known as the First Gaian War. The continent was named "Consterya" after her.

Zeus, Orion, Prometheus, and Poseidon all fought together as young men in the Second Gaian War. The Tri-Planetary Coalition objected to invading the Terran Sol system, creating a cold war with the Gaians that persists to the present day.

The Gaian Separatist Movement arose from factions who believed Earth rightfully belonged to the Gaians.

Zeus is a direct descendant of Esteya Consterya.

Three flashback sequences are planned:
1. Esteya Consterya and the First Gaian War
2. The Second Gaian War (young Zeus, Orion, Prometheus, Poseidon)
3. The founding of the Tri-Planetary Coalition`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 30 ===== */}
        {visibleIds.has("page-30") && (
          <PageSection id="page-30" title="Page 30 — Proposed BA3 Opening">
            <Heading>Cold Open — Zeus and Astra vs. Poseidon</Heading>
            <Pre>{`The film opens with Zeus and Astra in the middle of fighting Poseidon. Full-scale battle, powers unleashed.

Astra narrates:

ASTRA: "This is what it has all been leading up to..."

The scene freezes. Flashes back through the entire BA1 timeline — key moments from the Exordium, the Leviathan battle, Zeus's sacrifice, Astra's ascension.

Returns to "Now."

POSEIDON: "Surrender. You cannot win."

ZEUS: "I didn't come here to win, Poseidon. I came here to end this."

ORION: (arriving) "Then let's end it together."

Structure note: This is a framing device — the entire BA trilogy is told as Astra's memory/narration, bookended by this climactic confrontation.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 31 ===== */}
        {visibleIds.has("page-31") && (
          <PageSection id="page-31" title="Page 31 — BA Ongoing Series (Tercet) Plot">
            <Heading>Three-Villain Structure (The Tercet)</Heading>
            <Pre>{`The BA ongoing series uses a "Tercet" structure — three villains operating independently but converging:

1. NEMISIS — Sharpshooter / tactician. Personal vendetta.
2. BERSERKER — Brute force. Captured early, interrogated, breaks free.
3. ANNIHILATOR — The true threat. Coordinated attack on Halimar City.

COLD OPEN: TALOS (Atlas in his Dark Avenger suit) stops a robbery in progress. Establishes him as a street-level hero.

INCITING INCIDENT: Reception on Planet Ares. Political gathering. Character introductions and conflicts:

Character Conflicts:
• Atlas v Lelantos — rivalry, distrust, forced alliance
• Lyssa v Prometheus — father/daughter tension, secrets
• Rhea v Anubis — political maneuvering, Gaian ambassador
• Orolyn v Rhea — chain of command disputes
• Eros v Lyssa — attraction, telepathic connection`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 32 ===== */}
        {visibleIds.has("page-32") && (
          <PageSection id="page-32" title="Page 32 — Mumbai Attack Reference Notes">
            <Heading>Coordinated Multi-Target Attack on Halimar</Heading>
            <Pre>{`Structure inspired by the 2008 Mumbai terrorist attacks — multiple simultaneous targets creating chaos and dividing response forces.

THREE TARGETS:
1. THE RECEPTION — Hostage situation. Political leaders trapped. Annihilator leads.
2. SKYPORT — Bomb threat. Transportation hub. Mass civilian danger.
3. ROYAL HOTEL — Rampage. High-profile civilian target.

Eros vs Anat subplot runs through the attack — Eros uses telepathy to track attackers while Anat (Gaian operative) coordinates the assault.

The attack forces the heroes to split up:
• Atlas and Lelantos to the Reception
• Eros to track the bombers telepathically
• Velour coordinates NDF response

ANNIHILATOR confrontation at the climax — reveals the attack was a distraction for the real objective.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 33 ===== */}
        {visibleIds.has("page-33") && (
          <PageSection id="page-33" title="Page 33 — Aesir/Risen Breakdown & Resolution">
            <Heading>The Risen (Not Nesir) — Ancient Powers</Heading>
            <Pre>{`The Risen are ancient, immensely powerful beings — beyond normal Ascended levels.

Odinn is the first Aesir God — the progenitor of the Risen.

Anubis serves as the Gaian Ambassador but is secretly an infiltrator — working to undermine the TPC from within. His true allegiance is to the Risen.

BA3 FINAL CONFLICT RESOLUTION:
• The Risen cause a global catastrophe — magnetic field reversal, catastrophic flooding, supervolcanic eruptions
• Atlas moves the entire continent of Consterya south — it becomes the lost continent of Atlantis (positioned at the new South Pole)
• Asterya re-unites with Astra to become one of the Risen — the merger is permanent
• Atlas achieves Level 2 Ascension — transforms into a giant rock creature
• He controls the Earth itself, reshaping geography to counter the threat
• The continent's renaming from Consterya to Atlantis marks the birth of the legend`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 34 ===== */}
        {visibleIds.has("page-34") && (
          <PageSection id="page-34" title="Page 34 — Casting/Personality Notes">
            <Heading>Reference Notes — Tone and Casting</Heading>
            <Pre>{`Tone Reference: "The Dark Knight" — grounded, consequences matter, villain is ideological not just physical.

Mumbai Attack Timeline: Used as structural reference for the coordinated assault on Halimar City.

Dream Casting List:
• Alicia Vikander
• Saoirse Ronan
• Sophie Turner
• Hayley Atwell
• Nathalie Emmanuel
• Bryce Dallas Howard

These are reference archetypes for characters like Artemis, Pandora, Velour, and Lyssa — strong women who carry authority, vulnerability, and physical presence.

Personality Note: Each character should feel like they could carry their own film. No one is just a supporting player.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 35 ===== */}
        {visibleIds.has("page-35") && (
          <PageSection id="page-35" title="Page 35 — Motivation: Very Important">
            <Heading>The Engine of Conflict — Ascension vs. Longevity</Heading>
            <Pre>{`VERY IMPORTANT — Core World Motivation:

HUMANS possess the secrets of ASCENSION — the ability to transcend normal physical and mental limits. Telepathy, telekinesis, bioelectric manipulation, matter control.

GAIANS possess EXTENDED LIFESPANS — the secret to near-immortality. They live for thousands of years but cannot Ascend.

THE KEY: Earth's unique atmosphere + water + human physiology is what enables Ascension. It cannot be replicated on other planets.

GAIAN SECRET (revealed in BA2): Gaians have discovered they can partially replicate the Ascension effect by importing Earth's freshwater to their homeworld. This is why they want Earth back — not just territory, but survival.

OSIRIS REVELATION (BA2): Osiris is naturally Ascended because he is actually Human — not Gaian as everyone believes. This revelation shatters political alliances.

THREE-FILM ASCENSION ARC:
• BA1: Ascension is shown as rare and powerful (Zeus, Astra)
• BA2: Ascension's origins are revealed; Pandora/Lyssa awakens
• BA3: Ascension reaches its ultimate form — the Risen`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 36 ===== */}
        {visibleIds.has("page-36") && (
          <PageSection id="page-36" title="Page 36 — Social Structure & Illuminati Subplot">
            <Heading>Cultural and Social World-Building</Heading>
            <Pre>{`Cultural Notes:
• Hijab/Niqab — references to cultural modesty practices, potentially integrated into Gaian or Aresian social customs
• Social hierarchy concepts — how different species/races interact in public vs private spaces
• "Degree of Perceived Entitativity" — sociological concept about how groups are perceived as unified entities

"THE CHOSEN" SUBPLOT:
• 1999 — A terror plot is uncovered
• Edward Burke — patriarch of a powerful family with connections to both human and Gaian power structures
• Carter Burke — Edward's relative, drawn into the conspiracy
• Carter's niece becomes a key witness or target
• The subplot explores how shadowy organizations manipulate both sides of the human-Gaian conflict
• Illuminati parallels — secret societies that have known about Ascension for centuries and have been controlling access to it`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 37 ===== */}
        {visibleIds.has("page-37") && (
          <PageSection id="page-37" title="Page 37 — Leadership & Weapons Platforms">
            <Heading>Military and Tactical World-Building</Heading>
            <Pre>{`WMD CADRE NOTES:
"Where you stand depends on where you sit." — Political positioning determines military strategy.

CHEMICAL AGENTS (world-building reference):
• Rizin (Ricin analog)
• Sarin
• VX nerve agent
These exist in the BA universe as forbidden weapons — their use is a war crime under TPC law.

WEAPONS PLATFORMS CLASSIFICATION:
1. LONG RANGE — Orbital strikes, planetary defense systems, the Ryuken's javelin array
2. TACTICAL — Sky-skimmers, air-strikers, ground assault vehicles
3. CORNERING — Close-quarters weapons designed for urban warfare and boarding actions
4. CLOSE COMBAT — Personal weapons, bladed weapons, powered gauntlets

LOGISTICS NOTES:
• Ammunition storage and transport
• Power generators (Tesla-class)
• Panic room specifications for VIP protection
• Supply chain vulnerabilities as plot devices`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 38 ===== */}
        {visibleIds.has("page-38") && (
          <PageSection id="page-38" title="Page 38 — STRID-R Concept (16 Jul 2015)">
            <Heading>STRID-R — Space Time Reconnaissance/Intelligence Disruptor — Recovery Agent</Heading>
            <Pre>{`Date: 16 Jul 2015

CONCEPT: STRID-R is a device or agent capable of manipulating space-time for reconnaissance and intelligence purposes.

THE DEJA VU PRINCIPLE:
"When you experience Deja Vu, it actually means someone just changed your past."

This concept reframes Deja Vu as evidence of temporal manipulation — the sensation you feel when a STRID-R agent has altered a timeline that previously included you.

Applications in the BA universe:
• Recovery operations — extracting people or objects from altered timelines
• Intelligence disruption — changing past events to alter present outcomes
• Reconnaissance — observing past events without direct interference

Note: This concept may tie into the fourth-dimensional pulse detected by the Ryuken crew in BA1 (the time distortion at the same coordinates as the jamming signal). Could suggest someone was already manipulating the timeline during the Battle of Alympia.`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 39 ===== */}
        {visibleIds.has("page-39") && (
          <PageSection id="page-39" title="Page 39 — Astra Character Profile (17 Sep 2015)">
            <Heading>Astra — Full Character Profile</Heading>
            <Pre>{`Date: 17 Sep 2015

BASIC INFO:
• Age: 19-23
• Gender: Female
• Birthplace: Planet Ares
• Background: Orphan — survivor of a Gaian Separatist attack on a cruiser from Ares
• Status: Member of the Allies

POWERS & ABILITIES:
• Telepathy — reads and projects thoughts
• Telekinesis — moves objects with her mind, can create shields and project force
• Collective Soul Convergence — her unique ability; can merge consciousness with others
• Physical Matter Manipulation — at higher levels, can alter physical matter itself

PERSONALITY:
• Rebellious punk — doesn't follow rules easily
• Secret crush on Zeus — keeps it hidden from everyone (Orion knows)
• Brash and impulsive — acts first, thinks second
• Fiercely loyal — would die for her friends without hesitation
• Humor as defense mechanism — uses jokes to deflect vulnerability

ASCENSION LEVELS:
• Level 1: Standard PSI abilities (telepathy, telekinesis)
• Level 2: Enhanced powers, physical transformation (what she achieves in BA1 — becomes Asterya)
• Level 3: Creates a corporeal "higher" entity — a separate physical being made of pure Ascended energy

"CHILD OF LIGHT":
The indigenous humans of Earth — the primitive species that existed before the Aresian humans arrived — call her "Child of Light." They recognize something in her that the Ascended humans do not understand. This title may connect to the Risen.

ARC NOTE — ROOM TO GROW:
"Astra's greatest strength is also her greatest weakness — she feels everything. Her empathy is what makes her powerful, but it's also what makes her vulnerable. She must learn to channel her emotions rather than be consumed by them."`}</Pre>
          </PageSection>
        )}

        {/* ===== PAGE 40 ===== */}
        {visibleIds.has("page-40") && (
          <PageSection id="page-40" title="Page 40 — Orbital & Ground Battle Notes">
            <Heading>Irving Kershner Reference — Orbital and Ground Battle</Heading>
            <Pre>{`ORBITAL BATTLE:
Rhea and the Ryuken face a standoff with a Gaian commander in orbit. The Gaians give Earth a deadline — withdraw all military assets from Terran Sol or face bombardment.

Rhea refuses:
RHEA: "This is OUR home. You don't get to tell us when to leave."

GAIAN COMMANDER: "Then you will burn with it."

The orbital battle tests Rhea's tactical brilliance — she must outmaneuver a superior force using terrain (asteroid fields, orbital stations) and her crew's abilities.

GROUND BATTLE:
Forces infiltrate Alympia from multiple entry points — underwater, through tunnel systems, and via aerial insertion.

Orion leads a strike team through the streets of Alympia. A female Lieutenant (unnamed — possibly Velour or a new character) fights alongside him.

The streets are under siege — buildings burning, civilians evacuating, enemy troops moving in formation.

ORION: "Hold the line! Every block we lose is a block closer to the palace!"

The ground battle runs parallel to the orbital engagement — creating cross-cutting tension between Rhea's space battle and Orion's street fight.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("exordium-draft-a") && <ExordiumDraftA />}
        {visibleIds.has("exordium-draft-b") && <ExordiumDraftB />}
        {visibleIds.has("origin-issue-1") && <OriginIssueOneScript />}
        {visibleIds.has("origin-issue-2") && <OriginIssueTwoScript />}

        {visibleIds.has("notebook-001a") && <NotebookTranscript001A />}
        {visibleIds.has("notebook-001b") && <NotebookTranscript001B />}
        {visibleIds.has("notebook-002a") && <NotebookTranscript002A />}
        {visibleIds.has("notebook-002b") && <NotebookTranscript002B />}
        {visibleIds.has("notebook-003") && <NotebookTranscript003 />}

        {visibleIds.has("ba-characters") && (
          <PageSection id="ba-characters" title="Character Creator">
            <BACharacterCreator />
          </PageSection>
        )}

        {visibleIds.has("ba-story-plan") && <BattlefieldAtlantisStoryPlan />}

        <div className="text-center py-8">
          <a href="#" className="text-primary hover:text-accent transition-colors text-sm">
            ↑ Back to Top
          </a>
        </div>
      </main>
    </div>
  );
};

