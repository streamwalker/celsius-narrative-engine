
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
import DarkerAgesStoryPlan from "@/components/storyplans/DarkerAgesStoryPlan";
import DarkerAgesContentOutlineFeb2019 from "@/components/storyplans/DarkerAgesContentOutlineFeb2019";
import DACharacterCreator from "@/components/storyplans/DACharacterCreator";
import DarkerAgesManuscript from "@/components/storyplans/DarkerAgesManuscript";
import darkerAgesLogo from "@/assets/darker-ages-logo.png";

const darkerAgesSections = [
  { id: "da-page-1", label: "Page 1 — Backstory: Corbin Rothchylde & Estelle" },
  { id: "da-page-2", label: "Page 2 — Backstory (Continued): Temporal Rift" },
  { id: "da-page-3", label: "Page 3 — Climax: Maven, Shinobu & The Rift" },
  { id: "da-page-4", label: "Page 4 — Denouement & Epilogue (Handwritten)" },
  { id: "da-page-5", label: "Page 5 — First Act: Maven's Introduction" },
  { id: "da-page-6", label: "Page 6 — First Act: Titus's Trial" },
  { id: "da-page-7", label: "Page 7 — First Act: Shinobu's Introduction" },
  { id: "da-page-8", label: "Page 8 — First Act: Convergence" },
  { id: "da-page-9", label: "Page 9 — Convergence pt. 2 (Handwritten)" },
  { id: "da-page-10", label: "Page 10 — Act II SQ I: Tavern Scene (Handwritten)" },
  { id: "da-page-11", label: "Page 11 — Side Note: Storytelling Philosophy" },
  { id: "da-page-12", label: "Page 12 — 18 Things: Ironic Hook & Values Table" },
  { id: "da-page-13", label: "Page 13 — Moral-Physical Premise & Character Rules" },
  { id: "da-page-14", label: "Page 14 — Shinobu & The Omagari Family: Bloodline & Patricide" },
  { id: "da-page-15", label: "Page 15 — Shinobu & The Omagari Family: Season Two — Dark Heir" },
  { id: "da-page-16", label: "Page 16 — Maven & The Dark Queen (Estelle): Origin Revised" },
  { id: "da-page-17", label: "Page 17 — Maven's Journey: Awakening to Phoenix" },
  { id: "da-page-18", label: "Page 18 — Owen (The Time Traveler) & Lord Titus" },
  { id: "da-page-19", label: "Page 19 — The Love Square" },
  { id: "da-content-outline-feb2019", label: 'Content Outline (Feb 2019) — Season One: "The Darkest Dawn"' },
  { id: "da-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown" },
  { id: "da-characters", label: "Character Creator" },
  { id: "da-manuscript", label: "Novel Manuscript — Darker Ages" },
];

const pageContent: Record<string, string> = {
  "da-page-1": "Corbin Rothchylde Estelle sorcerer eastern quadrant Draconion five kingdoms Writhers dark cult religious radicals Heretic demonic power temporal rift spell stasis",
  "da-page-2": "temporal rift volatile perpetuity power drained centuries nexus of souls 1982 England feeble old man assumed name",
  "da-page-3": "Climax Maven Shinobu Titus nexus of souls catacombs Rothchylde guardian mystical sacrifice magical ability Battlefield Atlantis 35000 years past",
  "da-page-4": "Denouement Epilogue Rothchylde dies nexus Corbin plan catacombs rift sealed Maven Shinobu new world Titus tavern uncle",
  "da-page-5": "First Act Maven village uncle blacksmith magical ability Writhers escape pod journal Rothchylde nexus of souls map",
  "da-page-6": "Titus trial desertion knight Writher fighting pits gladiatorial combat transformation skin hardens senses sharpen inhuman",
  "da-page-7": "Shinobu mystic healer spirits dead spirit sight Writhers master killed fireball escape",
  "da-page-8": "Convergence Maven Shinobu crossroads wraiths spectral creatures cursed totem magical ability spirit sight Rothchylde journal nexus",
  "da-page-9": "Convergence Titus bad shape Shinobu heals Maven magic spirit sight warrior transforming catacombs",
  "da-page-10": "Act II tavern Draconion territory Rothchylde five kingdoms Writhers death cult Heretic sorcerer catacombs nexus dangerous",
  "da-page-11": "storytelling philosophy character story moral premise psychological conflict physical conflict Maven power Writhers Heretic antagonist false belief",
  "da-page-12": "18 Things ironic hook logline formula conflict of values Maven safety secrecy courage Shinobu independence trust Titus self-preservation sacrifice Heretic control fear Corbin love",
  "da-page-13": "moral premise physical premise hiding isolation powerlessness embracing connection strength character development Vonnegut antagonist hero supporting characters",
  "da-page-14": "Omagari extra-dimensional symbiotic patricide decapitated Kataija Matsuo demon rival bloodline ninja techniques sibling divide",
  "da-page-15": "Dark Heir clan trial Japan Dark Queen Kataija Matsuo hunt Shinobu battle Cole Maven intervene season two",
  "da-page-16": "Estelle time traveler 2027 2037 Christian thief artifact Dark Ages worshipped gods Dark Queen midwife Brother Billy Sister Agatha breeding Maven daughter",
  "da-page-17": "Phoenix awakening Dark Riders Brother Billy Sister Agatha mother reveal Maven blunt force magic scalpel Owen fragile strongest protects world",
  "da-page-18": "Owen time traveler magic technology scalpel tools spells Titus Knight Briar Castle Balorian arrogant Rule of Law",
  "da-page-19": "Love Square Owen Maven Shinobu Titus romantic not all at once gradually develops",
  "da-story-plan": "Story Plan three act eight sequence Save the Cat Golden Fleece Buddy Love Maven identity hiding embracing power sacrifice nexus Writhers Heretic catalyst midpoint climax finale opening image theme stated",
  "da-characters": "Character Creator Maven Shinobu Titus Corbin Rothchylde Estelle Heretic Owen Kataija Matsuo Christian sorcerer mystic warrior archmage noble dark priest time mage ninja stats abilities equipment",
  "da-manuscript": "Novel Manuscript grimdark fantasy Prologue Thief Artifact Estelle Christian time traveler Dark Queen Blacksmith Niece Maven village Writhers Fallen Knight Titus fighting pits Spirit Healer Shinobu Omagari patricide Crossroads wraiths totem Broken Warrior transformation Tavern Rothchylde catacombs Owen scalpel precision magic Omagari Kataija Matsuo clan Heretic offer catacombs guardian nexus sacrifice Phoenix mother daughter Battlefield Atlantis epilogue",
};

export default function DarkerAges() {
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    if (!search.trim()) return darkerAgesSections;
    const q = search.toLowerCase();
    return darkerAgesSections.filter(
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
          <img
            src={darkerAgesLogo}
            alt="Darker Ages"
            className="mx-auto max-w-md w-full h-auto mb-2"
          />
          <p className="text-sm text-muted-foreground mb-4">Raw Story Notes — 19 Pages</p>
          <PortToEngineButton storyId="darker-ages" />
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-10 space-y-8">
        <StoryNotesSearch query={search} onChange={setSearch} placeholder="Search Darker Ages notes…" />

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

        {visibleIds.has("da-page-1") && (
          <PageSection id="da-page-1" title="Page 1 — Backstory: Corbin Rothchylde & Estelle">
            <Heading>Backstory</Heading>
            <Pre>{`In a time before our time lived a powerful sorcerer named Corbin Rothchylde, who, along with his wife Estelle, ruled the entire eastern quadrant of Draconion. In a time of unending war amongst the five kingdoms for control of the land, Corbin's kingdom thrived due to his immense power. So much so that none dared invade his territory.

However, a great change came when a dark cult of religious radicals known as the Writhers began to descend upon all five kingdoms. Their sinister mission was to slaughter all who possess magical ability, the only people truly powerful enough to challenge them. Their leader, a dark priest and mystic known only as The Heretic, possessed a demonic power that was virtually indomitable.

When the writhers came for Corbin and Estelle, a massive battle ensued, during which Estelle was mortally wounded. Unable to accept his wife's death, Corbin, in an act of desperation, cast a temporal rift spell to freeze Estelle's body in a state of temporal stasis while he searched for a way to revive her. The temporal rift spell was exceedingly rare and extraordinarily dangerous.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-2") && (
          <PageSection id="da-page-2" title="Page 2 — Backstory (Continued): Temporal Rift">
            <Pre>{`But for a sorcerer of Corbin Rothchylde's power, it was child's play. However, as powerful as Corbin was, the temporal rift was volatile and the spell had to be maintained in perpetuity. Corbin placed Estelle in a temporal rift sphere in a secret location away from the Writher onslaught and set out to find a way to bring her back. In order to keep the temporal rift from collapsing, Corbin had to expend an extraordinary amount of power. Combined with the energy needed to stay alive and continue his search, his power was being drained at an alarming rate. The temporal rift spell would not fail as long as the caster was alive. Therefore, the longer Corbin remained alive, the more his power diminished.

Centuries passed and Corbin's search for a cure proved fruitless. However, he did discover the existence of a realm of supernatural power known as the nexus of souls. In this place, it was said that anything was possible. Corbin, now a feeble old man living under an assumed name in 1982 England, began searching for the nexus. For decades, Corbin lived alone, using what remained of his power to stay alive and power the temporal rift spell that kept Estelle frozen in stasis.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-3") && (
          <PageSection id="da-page-3" title="Page 3 — Climax: Maven, Shinobu & The Rift">
            <Heading>Climax</Heading>
            <Pre>{`Maven, Shinobu, and Titus reach the entrance to the nexus of souls. Rothchylde had told them that the nexus was within the ancient catacombs beneath the ruins of his former kingdom. Once they cross through the threshold, they encounter a mystical guardian who tells them that once they enter the nexus, they cannot return to their reality. Instead, they will be transported to a world of the nexus' choosing. Maven must decide if she is willing to leave her reality and her uncle behind in order to save the world from the temporal rift collapse.

Maven decides to enter the nexus. Shinobu decides to go with her but Titus stays behind. The guardian tells Maven that the nexus has the power to seal the rift, but she must sacrifice something of great value. Maven offers her magical ability. The nexus accepts and the rift is sealed. Maven and Shinobu are transported to a new world — a strange land unlike anything they've ever seen. They have no idea where they are. The final panel reveals they are in the world of Battlefield: Atlantis, 35,000 years in the past.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-4") && (
          <PageSection id="da-page-4" title="Page 4 — Denouement & Epilogue (Handwritten)">
            <Heading>Denouement</Heading>
            <Pre>{`B te the b n Rothchylde dies. Th th ky th the
Nexus hs nv exst ot or m w a s
or ws al pt of Corbn's plan t lre Mvn t the ctcombs.

Thre i n nxs.

Th rl ws alwys Corbn's. He cst it nd only he cn
cls it. B sacrificng hmslf, the rft is seld.`}</Pre>
            <Heading>Epilogue</Heading>
            <Pre>{`Mvn nd Shinbu in nw wrld.

Tits rtrns t th tvern.

Th wrld is svd bt t wht cst?

Th ncl is stl gne.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-5") && (
          <PageSection id="da-page-5" title="Page 5 — First Act: Maven's Introduction">
            <Heading>First Act</Heading>
            <Pre>{`In a small village on the outskirts of one of the five kingdoms, a young woman named Maven lives with her uncle, a retired soldier and blacksmith. Maven is gifted with an innate magical ability that she keeps hidden for fear of the Writhers. One night, a strange object falls from the sky and crashes in the forest near the village. Maven investigates and discovers what appears to be some kind of escape pod.

Inside the pod, Maven finds an old journal belonging to Corbin Rothchylde. The journal details Rothchylde's search for the nexus of souls and contains a map to its supposed location. Before Maven can process what she's found, the Writhers attack the village. Maven's uncle fights them off and tells Maven to run. Maven watches from the tree line as her uncle is taken by the Writhers.

Maven, now alone, decides to follow the map in Rothchylde's journal to find the nexus of souls, believing it may hold the power to save her uncle and stop the Writhers.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-6") && (
          <PageSection id="da-page-6" title="Page 6 — First Act: Titus's Trial">
            <Pre>{`Meanwhile, in the capital of the northern kingdom, a warrior named Titus is on trial for desertion. Titus, once a celebrated knight, abandoned his post during a Writher attack, an act of cowardice that haunts him. He is sentenced to the fighting pits — a gladiatorial arena where criminals fight for their freedom.

Titus survives several rounds in the pits, each fight revealing more of his formidable combat skills. During his final bout, a Writher raid on the capital causes chaos. In the confusion, Titus escapes the pits. As he flees the city, he notices something strange — his body is beginning to change. His skin hardens, his senses sharpen. Titus is transforming into something inhuman.

Terrified and confused, Titus flees into the wilderness, unsure of what he is becoming.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-7") && (
          <PageSection id="da-page-7" title="Page 7 — First Act: Shinobu's Introduction">
            <Pre>{`In the southern kingdom, a young woman named Shinobu serves as an apprentice to a mystic healer. Shinobu possesses a rare form of magic — the ability to see and communicate with the spirits of the dead. Her master has kept this ability secret, training Shinobu in the art of concealment.

One day, Shinobu's master is visited by a group of Writhers posing as travelers seeking healing. Shinobu senses their true nature but her master, unaware, welcomes them. The Writhers reveal themselves and kill Shinobu's master. Shinobu barely escapes, using her spirit sight to navigate through the spirit realm and emerge miles away.

As she catches her breath, Shinobu sees a massive fireball streak across the sky — the same object that Maven witnessed crash in the forest. She decides to follow it, sensing that it holds some significance.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-8") && (
          <PageSection id="da-page-8" title="Page 8 — First Act: Convergence">
            <Heading>First Act: Convergence</Heading>
            <Pre>{`Maven, following the map from Rothchylde's journal, arrives at a crossroads where he encounters Shinobu. Both are suspicious of each other but realize they are both fleeing from the Writhers. They decide to travel together for safety.

As they make camp that night, they are attacked by a group of wraiths — spectral creatures that serve the Writhers. Maven uses his hidden magical ability to fight them off while Shinobu uses her spirit sight to locate the wraiths' anchor — a cursed totem hidden nearby. Together, they destroy the totem and the wraiths dissipate.

This battle forges a bond between Maven and Shinobu. Maven shares what he found in Rothchylde's journal and his quest to find the nexus of souls. Shinobu, having lost her master and with nowhere else to go, decides to join him.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-9") && (
          <PageSection id="da-page-9" title="Page 9 — Convergence pt. 2 (Handwritten)">
            <Pre>{`Thy mt Tits on the rod. He is in bd shpe.

Shnobu hels hm. Tits jns thm.

Mvn tells Tits abt the nxs.

Tits sys he hs nthng lft t lse.

Th thre set ot tgthr.

Mvn - mgic (hdn)
Shinbu - sprt sght
Tits - wrrior (trnsfrming)

Th grp hed twrds th ctcombs.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-10") && (
          <PageSection id="da-page-10" title="Page 10 — Act II SQ I: Tavern Scene (Handwritten)">
            <Heading>Act II - SQ I</Heading>
            <Pre>{`Th grp rrves t a tvern on the edg of Draconion trritory.

Thy mt an old mn who knws of Rothchylde.

Th old mn tlls thm the stry of the fve kngdoms
nd the ris of th Wrthrs.

Draconion lor:
- Fve kngdms onc untd
- Mgic ws cmmn
- Wrthrs ros frm a dth clt
- Th Hrtc ws onc a grt srcrr
- Crbns kngdm ws th lst t fll

Th old mn wrns thm tht th ctcombs r dngrs
nd tht mny hv sght th nxs nd nvr rtrnd.

Mvn is dtrmnd t cntne.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-11") && (
          <PageSection id="da-page-11" title="Page 11 — Side Note: Storytelling Philosophy">
            <Heading>Side Note</Heading>
            <Pre>{`The best stories are not about the events that happen, but about the people they happen to. Character is story. If the audience doesn't care about your character, they won't care about your plot.

The moral premise of a story is the lesson the protagonist learns. It is the theme expressed through action. A good moral premise has two parts:

1. The psychological conflict — what the character believes vs. what is true
2. The physical conflict — the external obstacles that force the character to confront their false belief

Example: Maven believes she must hide her power to be safe. The truth is that her power is the only thing that can save the people she loves. The physical conflict (the Writhers taking her uncle, the quest for the nexus) forces Maven to use her power openly, thus learning the moral premise.

Every scene should serve the moral premise. If a scene doesn't challenge the character's false belief or advance the physical conflict, it should be cut.

The antagonist should embody the opposite of the moral premise — what happens when someone fully commits to the false belief. The Heretic hides behind religious dogma to justify destroying those with power, when in truth, he fears what he cannot control.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-12") && (
          <PageSection id="da-page-12" title="Page 12 — 18 Things: Ironic Hook & Values Table">
            <Heading>18 Things Every Story Should Have</Heading>
            <Pre>{`1. A strong ironic hook — the logline should contain irony.

Logline formula: On the verge of [a life-changing event], a [flawed protagonist] must [do something difficult] before [a deadline], or else [dire consequences].

Example: On the verge of losing her only family, a young woman hiding magical powers must journey to a mythical realm before the world tears itself apart, or else the people she loves will be consumed by an unstoppable darkness.

2. A conflict of values — the story should present a genuine dilemma where both sides have merit.`}</Pre>
            <Heading>Conflict of Values Table</Heading>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Character</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Counter-Value</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Maven</TableCell>
                  <TableCell>Safety through secrecy</TableCell>
                  <TableCell>Courage through openness</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Shinobu</TableCell>
                  <TableCell>Independence / self-reliance</TableCell>
                  <TableCell>Trust / interdependence</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Titus</TableCell>
                  <TableCell>Self-preservation</TableCell>
                  <TableCell>Sacrifice / honor</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>The Heretic</TableCell>
                  <TableCell>Control through fear</TableCell>
                  <TableCell>Freedom through acceptance</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Corbin</TableCell>
                  <TableCell>Love (holding on)</TableCell>
                  <TableCell>Love (letting go)</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </PageSection>
        )}

        {visibleIds.has("da-page-13") && (
          <PageSection id="da-page-13" title="Page 13 — Moral-Physical Premise & Character Rules">
            <Heading>Moral-Physical Premise</Heading>
            <Pre>{`The moral premise is the internal lesson. The physical premise is the external proof.

Moral: Hiding who you are leads to isolation and powerlessness; embracing who you are leads to connection and strength.

Physical: Maven hides her magic → loses her uncle → quest forces her to use magic openly → gains allies → confronts the nexus → sacrifices her magic to save the world → finds a new identity in a new world.`}</Pre>
            <Heading>Character Development Rules</Heading>
            <Pre>{`4. Every character must want something, even if it's just a glass of water. — Kurt Vonnegut

5. The protagonist's greatest strength should also be their greatest weakness. Maven's magic makes her powerful, but her fear of it makes her vulnerable.

6. The antagonist must believe they are the hero of their own story. The Heretic believes he is saving the world from the chaos of unchecked power.

7. Supporting characters should each represent a different response to the central dilemma. Shinobu runs from connection. Titus runs from responsibility. Corbin clings to what he's lost.

8. Character change must be earned through suffering. The audience should feel that the character's transformation was inevitable given what they endured.

9. The final choice must cost the protagonist something real. Maven gives up her magic — the very thing that defined her — to save a world that feared people like her.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-14") && (
          <PageSection id="da-page-14" title="Page 14 — Shinobu & The Omagari Family: Bloodline & Patricide">
            <Heading>The Truth of the Bloodline</Heading>
            <Pre>{`Shinobu's father was not a human possessed by a demon; he was, in actuality, an extra-dimensional being. His race is symbiotic, allowing them to access parts of the brain to tap into abilities from their dimension, which explains their amazing Ninja techniques.`}</Pre>
            <Heading>The "Patricide"</Heading>
            <Pre>{`In the past, Shinobu believed her father was possessed by the demon that killed their mother. During a moment of clarity, her father begged her to end his suffering. Shinobu decapitated him and fled into the woods, an act witnessed by her sister.`}</Pre>
            <Heading>The Sibling Divide</Heading>
            <Pre>{`While Shinobu fought her heritage believing it was demonic, her sister (Kataija) and brother (Matsuo) embraced their nature and learned to control their powers.`}</Pre>
            <Heading>The Deal</Heading>
            <Pre>{`Shinobu made a deal with a demon to enact revenge. This demon is a rival to the one that was part of her father, and the two demons are playing a game with people's lives as pawns.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-15") && (
          <PageSection id="da-page-15" title="Page 15 — Shinobu & The Omagari Family: Season Two — Dark Heir">
            <Heading>The Hunt</Heading>
            <Pre>{`Shinobu's younger sister, Kataija Omagari (who acts like the older sister), is now the head of the clan. She and her brother, Matsuo Omagari, are on a mission to bring Shinobu back to Japan to stand trial for killing their father.`}</Pre>
            <Heading>The Confrontation</Heading>
            <Pre>{`Kataija and Matsuo were alerted to Shinobu's whereabouts by tales of the battle with the Dark Queen reaching Japan.`}</Pre>
            <Heading>The Battle</Heading>
            <Pre>{`Kataija is as good a fighter as Shinobu, and fighting both siblings together is almost too much for Shinobu to handle. Cole and Maven eventually intervene to help.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-16") && (
          <PageSection id="da-page-16" title="Page 16 — Maven & The Dark Queen (Estelle): Origin Revised">
            <Heading>Estelle's Origin (The Dark Queen)</Heading>
            <Pre>{`Time Traveler: Estelle is actually from the future — specifically the year 2027 (or 2037).

Pre-Travel Life: In her original time, she was a thief and party girl who frequented nightclubs and used magic for "Jedi mind tricks" to pick pockets. Her lover was a man named Christian.

The Journey: An old woman (potentially an older Estelle) gave her an artifact to travel back in time to an age where natural energy was abundant.

Rise to Power: Estelle and Christian traveled back to the "Dark Ages". Their powers grew enormous, and they were worshipped as gods, ruling side-by-side.

The Turning Point: Christian trained mages but eventually died. Following his death, Estelle slaughtered the survivors and became cold and emotionless.`}</Pre>
            <Heading>Maven's Origin</Heading>
            <Pre>{`Birth: Maven is the daughter of Christian and Estelle.

Hidden Identity: A midwife told Estelle the baby died, using a spell to make the child appear fallen. The baby was sent away to be trained to take her mother's place as ruler.

Upbringing: The plan to train her was foiled when she was lost and found by "Brother Billy". She was raised by adopted parents.

Deception: "Sister Agatha" would visit Maven and tell her lies about her mother, claiming the Dark Queen betrayed and killed her "real" mother to steal her power.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-17") && (
          <PageSection id="da-page-17" title="Page 17 — Maven's Journey: Awakening to Phoenix">
            <Heading>Awakening</Heading>
            <Pre>{`After her adopted parents died at the hands of Dark Riders (attracted by her uncontrolled magic), Maven set out to find who she really was. She eventually met Shinobu in a tavern.`}</Pre>
            <Heading>Power Dynamics</Heading>
            <Pre>{`Maven possesses raw, blunt force magic with no skill, whereas the time-traveler Owen uses magic like a scalpel.`}</Pre>
            <Heading>Character Arc</Heading>
            <Pre>{`She begins as a fragile character, constantly running scared. However, a huge shift occurs when she becomes the "Phoenix," transforming from the weakest one who needs protection to the strongest one who protects the world.`}</Pre>
            <Heading>The Reveal</Heading>
            <Pre>{`Eventually, Estelle confronts Maven, recognizing her by her powers. Estelle reveals the truth: "No. I am your mother".`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-18") && (
          <PageSection id="da-page-18" title="Page 18 — Owen (The Time Traveler) & Lord Titus">
            <Heading>Owen</Heading>
            <Pre>{`Mission: Owen travels back from the future to stop Estelle (and Maven) because he is in love with Maven.

Abilities: He utilizes a mix of magic and technology. He fashions tools to cast spells, drawing on the abundance of natural energy in this age.

Role: He uses magic on a small scale but effectively. He attempts to teach Maven how to focus her magic.`}</Pre>
            <Heading>Lord Titus</Heading>
            <Pre>{`Background: A trained Knight of Briar, skilled in combat and strategy.

Status: He grew to become the Master of Castle Balorian.

Personality: In the early days, he is arrogant and prioritizes the "Rule of Law" over what is normative.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-page-19") && (
          <PageSection id="da-page-19" title="Page 19 — The Love Square">
            <Heading>The "Love Square"</Heading>
            <Pre>{`The notes describe a complex romantic dynamic involving the four main characters:

• Owen is in love with Maven.
• Shinobu thinks Owen is cute, but Owen only has eyes for Maven.
• Maven has eyes for Sir Titus.
• Titus is intrigued by Shinobu.

Note: The author specifies this happens "Not all at once" — it develops gradually over the course of the story.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("da-story-plan") && <DarkerAgesStoryPlan />}

        {visibleIds.has("da-characters") && (
          <PageSection id="da-characters" title="Character Creator">
            <DACharacterCreator />
          </PageSection>
        )}

        {visibleIds.has("da-manuscript") && <DarkerAgesManuscript />}

        <div className="text-center py-8">
          <a href="#" className="text-primary hover:text-accent transition-colors text-sm">
            ↑ Back to Top
          </a>
        </div>
      </main>
    </div>
  );
};

