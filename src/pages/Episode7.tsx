
import { useState, useMemo } from "react";
import { PortToEngineButton } from "@/components/port-to-engine-button";
import { Link } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection, Pre, Heading } from "@/components/story-page-helpers";
import StoryNotesSearch from "@/components/story-notes-search";
import Episode7StoryPlan from "@/components/storyplans/Episode7StoryPlan";
import EP7CharacterCreator from "@/components/storyplans/EP7CharacterCreator";

const episode7Sections = [
  { id: "ep7-page-1", label: "Page 1 — Concept: 30 Years After Endor" },
  { id: "ep7-page-2", label: "Page 2 — Continuation & Timeline Opening (Handwritten)" },
  { id: "ep7-page-3", label: "Page 3 — Timeline: Luke's Return & Xan's Choice" },
  { id: "ep7-page-4", label: "Page 4 — Battle Conclusion & Part II (Handwritten)" },
  { id: "ep7-page-5", label: "Page 5 — Note 1 (Leia/Han/Lando) & Note 2 (Training)" },
  { id: "ep7-page-6", label: "Page 6 — Note 3 (Dagobah) & Note 4 (Xan's Character)" },
  { id: "ep7-page-7", label: "Page 7 — Note 6 (Falcon Cockpit) & Atlantis Note" },
  { id: "ep7-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown" },
  { id: "ep7-characters", label: "Character Creator" },
];

const pageContent: Record<string, string> = {
  "ep7-page-1": "Concept Endor New Republic Palpatine Empire Vader Han sacrifice Mon Mothma Luke Skywalker disappears Force light dark side heal lightning Yoda master Palpatine spirit netherworld",
  "ep7-page-2": "Palpatine spirit Han Solo ghost Leia Lando Calrissian C-3PO R2-D2 Timeline treatment battle Jedi Darth Vader Xan security shield",
  "ep7-page-3": "Timeline Luke Jedi return Coruscant Xan parents mother balance Force New Alderaan Dagobah Millennium Falcon Leia confrontation dark side light side choice",
  "ep7-page-4": "Battle three fronts Coruscant space Sith pupil balance powers Xan defeat New Republic Galactic Empire Empress Organa Rebel Alliance Dagobah cave",
  "ep7-page-5": "Note 1 Leia pregnant Han Lando sacrifice Xan identity origins Jedi orphans Note 2 training Millennium Falcon lightsaber droids Obi-Wan helmet Force calm storm",
  "ep7-page-6": "Note 3 epilogue Dagobah cave Yoda test Note 4 Xan character Leia strength Han grit Chief Security war peace dark side emotions become the Force",
  "ep7-page-7": "Note 6 Millennium Falcon cockpit Captain Solo authentication launch clearance Atlantis horsemen plague zombie apocalypse",
  "ep7-story-plan": "Story Plan three act eight sequence Save the Cat Rites of Passage Institutionalized Xan identity choice Force balance light dark Jedi Republic Empire catalyst midpoint climax finale opening image theme stated",
  "ep7-characters": "Character Creator Xan Luke Skywalker Leia Organa Lando Calrissian Han Solo Sith Pupil Jedi Force stats abilities equipment",
};

const AstralonautEpisode7 = () => {
  const [search, setSearch] = useState("");

  const filteredSections = useMemo(() => {
    if (!search.trim()) return episode7Sections;
    const q = search.toLowerCase();
    return episode7Sections.filter(
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
            Episode 7 (2011)
          </h1>
          <p className="text-sm text-muted-foreground mb-4">Raw Story Notes — 7 Pages</p>
          <PortToEngineButton storyId="episode-7" />
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-10 space-y-8">
        <StoryNotesSearch query={search} onChange={setSearch} placeholder="Search Episode 7 notes…" />

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

        {visibleIds.has("ep7-page-1") && (
          <PageSection id="ep7-page-1" title="Page 1 — Concept: 30 Years After Endor">
            <Heading>Concept</Heading>
            <Pre>{`-30 years after the Battle of Endor.

- In the years since:

- A new republic is declared to replace the Galactic Empire. Mon Mothma is named leader of the Republic.
- Palpatine and the 1st Galactic Empire, as ruthless as it was, kept the galaxy in order. Because of that, a lot of rival organizations were held in check by Vader. Many of these factions start to spring up to grasp control of different territories of the galaxy.
- In those battles with one of the more powerful factions, Mon Mothma takes her place. In this battle, Han and his crew sacrifice themselves to save Coruscant from a doomsday device. There was no other way.
- Wracked with guilt over not being able to save his friend, Luke Skywalker disappears. He believed that if he had not been a failure to live up to his full potential, he might have been able to save everyone.
- Luke believes that the true balance of the Force lies in being able to manipulate the total Force, the light side and the dark.
- Luke, many years ago, decided to resist the temptation of the dark side, and he was also able to master the light on his own after the death of his master, Yoda. Luke, in his studies, has been able to do things that no Jedi or Sith has ever accomplished. Luke can use his powers to heal wounds; he can move literally anything. He can call lightning down from the sky and control elements of nature. Luke is able to read thoughts and see near and far perimeters. And Luke can call forth any spirit from the netherworld, sometimes involuntarily.
- Luke called forth Palpatine's spirit from the netherworld to show him the secrets of the dark side. Apt irony, as Palpatine.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("ep7-page-2") && (
          <PageSection id="ep7-page-2" title="Page 2 — Continuation & Timeline Opening (Handwritten)">
            <Pre>{`fnoly got luke as his pypil, but of th expeve of hoving his fortrred soul inpisored withn loke's mind.

- Involntainly, Luke is, rondonly visited by the sinit of Hen Solo (ol Hamism Ford). Hon phys lobes consaie and for all of hi poner, be still trests Tuke like fat dwkemerd formboy fom yous dyo
- Lir and ber night and, Genersl Lond Collorsion, m diswer are mon thon friends. what sterted out a leanen ore dnother for support dre to fhir motral loss, has men o sioe blocoed into d nomome that neither of than hod evar expeded
- C3O stoyed with Leid while R2 D2 disspond slony wtn Loke. (* See Note 1)`}</Pre>
            <Heading>Timche 4 trestnnt</Heading>
            <Pre>{`- Opens with bothe bethm now regulk endwaniny facten.
- heid Jed go m ond mp yo digdayin ter syo dhilite is jedis
- Loter driy respne to anotter bott, when Jedi ore on the reps, bde Wkei Ninjis Jedi coe an ie seere
- Rar of Darthi Varders retum hare sparted thshot te ploxy for weks dmongst some of the fections.
- Diriy the seond botthe, whon Loke's Jedi come on the scere, Conndened star testoyers that the eneny is using on he scrtore dnd binght dorn by dn onhsn force, ther destryed by tee listonny enersy bots fon te stmglere
- Xon is leie's right hond dnd chist ot secunty. she is dlo beid's anst shiled Jedi. As the esgdodrs sten destoners stop cnaythy, bofore she paser ot, sbebte seu d bere voled fiue foot doun fhon sthe sky. It is korth Voder, Betore the darlnp tabes bery the figrre remores the hebnat. It is Llie Skywalker
- Xon awelens onbond stage shyp It is d vg repste frigode. The sane one that trengontel Leid organd and wes cetured by the Imperils so long dga Lote, ne dine, has dwoke ftt af mmomd sh
- Yon moes ber way, stiethly, thop the ship. Usise vonts and cordors o evade obstadles. she wes the fore to mosk her presence aond misdract ter cgtors`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("ep7-page-3") && (
          <PageSection id="ep7-page-3" title="Page 3 — Timeline: Luke's Return & Xan's Choice">
            <Heading>Timeline for Treatment</Heading>
            <Pre>{`- After taking down the Jedi Mind and coming to a stalemate with a particularly skilled foe, Luke intervenes and reveals his plans.
- Controlly led Obi-Wan to rescue Xan and take face each other for the first time in years.
- Luke and his Jedi return to Coruscant with Leia and Xan.
- They return to Luke's temple on New Alderaan. Luke reveals to Xan that he has been watching her for a while to assess her potential. It is revealed that Leia is, in fact, her mother. This comes after Luke shows Xan that she has the potential to balance the Force, something none of his pupils have ever been able to fully manage (return to Dagobah).
- Xan is intrigued by the potential of her own abilities. It is the insecurity she carries that has always held her back.
- Luke starts to tell Xan one evening that he has discovered what has the potential of completely destroying the New Republic's already fragile support.
- Luke offers Xan the chance to come with him, destroy this new threat, and he will show her the balance of the Force.
- Xan agrees and she, Luke, and R2 head off in the Millennium Falcon while Luke's troops head on to conduct and track the enemy.
- Luke and Xan, in the middle of a training session, are intercepted when Leia and her fleet find the Falcon and board it.
- Luke and Leia now face each other for the first time in years. Luke argues that the power of the Force lies in mastery between the light and the dark. Leia contends that the dark side corrupts absolutely, as she can see in his mind that Luke has had to dispatch some of his Jedi who were overcome by the darkness.
- Xan asks if this is the case, why he didn't fall to that path. Luke explains that he sees in her the same potential that Luke himself has, that she can balance the Force.
- Xan is caught in the middle of her master and mother and her uncle who is letting her chase her full potential. She must choose between the two.
- Leia and Luke join forces to take down the new threat to the Republic.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("ep7-page-4") && (
          <PageSection id="ep7-page-4" title="Page 4 — Battle Conclusion & Part II (Handwritten)">
            <Heading>Whan te dtteck enoes</Heading>
            <Pre>{`A botthe is joed on 3 frnt. In tk Shy over consont, in Spae dnd in the shperiel Pole betnen Loe, Xas, ond d ponerfl sithmihs was once lke' ste pubil. bte uses bolonce poners but widly dnd connt contort then filly -Yan is dbke to deect Kuse, bit luke is stock don...or lke uses oll of his por ts sty ryt fom vasns i consnt..sh eltet bory to dicguete hie phyried forn dad Pormsdy d "nat killed en)

- The new republic is saved but confrdere has brben doum in to Now rpisli: dbility to hld to gulay fogether les Ayees and dederes th barth ot the second Goloctn Enpire. with teret ds Exprss.

-Xon disegres with tho move and decides, thst it is time to find hor oun woy ond she goes ste to take lukes ploe ods his foyps.! and lenig the bolance ot the fortr. Liuke disorpoirted form cons tegether ds paure energy... sot dead or dlive bot somet hirg o betreen. Fronscended. none" wit the foee

End PT I(See nute 3)`}</Pre>
            <Heading>Part II</Heading>
            <Pre>{`Ore singh leader of one of th larger Cebob is cbk to cnite oll ot the different factiors inder one floy ond dne wllrs thamstlves the Ribel Alliance.

-Leid makes a conent to Londe as they ser one of these popogendy flyers in the strects of Corsent thot hey wu y ch te reln b thy sy pyplaer opinin ovdy frm the Gpive.

-Like dod Xin junay to Dagobah so thot Xon may teom the bolance of te force as loke did..in the cave.

-The Empite, ender Empress Orgind, begin retaking systoms ore of α fire The Jed dons with the imprel shok tropes, aree finee to be reared with.`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("ep7-page-5") && (
          <PageSection id="ep7-page-5" title="Page 5 — Note 1 (Leia/Han/Lando) & Note 2 (Training)">
            <Heading>Note 1:</Heading>
            <Pre>{`On the evening of the fatal Battle where Han and his crew sacrificed their lives for Coruscant, Leia revealed to Lando that she was pregnant and that she never got to tell Han. Lando, in shock and shame that Han had died in his place, vowed to take care of Leia and her child. What was once out of obligation turned into an even more powerful healing force... Love... but years later, what has gone on?

Leia and Lando's friendship is based on mutual respect and a strong bond shared through an epic ordeal and the loss of a best dear friend. Luke left before Leia could share with him that she was having a child. To protect her from Han's many enemies, both inside and outside the Republic, the details of her origins were kept private. When Xan was old enough, the nature of her identity was revealed to her, but not the past. Because of the close kinship between a Rodian and her master, his questions about Xan's mother never came up as most Jedi are orphans.`}</Pre>
            <Heading>Note 2:</Heading>
            <Pre>{`Luke and Xan aboard the ship Millennium Falcon: Luke is in a training session with Xan. He is testing the limits of her capabilities. Xan, already a seasoned Jedi Knight for her age, is able to deftly pass and excel in tests using the Force to visualize her surroundings. During the training, using the same training helmet Luke once wore for Obi-Wan Kenobi, Xan is able to fend off multiple droids, the loathsome boxes and piles of equipment she deflects with her lightsaber. Then she is distracted by 2 additional droids and Luke's lightsaber flying in the door. While successfully fending off these attacks, Luke Skywalker has to exert his power to stand against the powerfully wrathful barrage. Xan feels all the power and ferocity of a rage-filled assault, but within Luke all she can sense is... calm. Like he is the eye of the center of a storm. Xan is tasked to make deft moves of her own and battle to victory as the Falcon is attacked by a barrage of blasts... warning she shuts down from Valor (Luke's Ship).`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("ep7-page-6") && (
          <PageSection id="ep7-page-6" title="Page 6 — Note 3 (Dagobah) & Note 4 (Xan's Character)">
            <Heading>Note 3:</Heading>
            <Pre>{`In the final epilogue: Luke and Xan finally travel to Dagobah. Luke leads Xan to the cave where he failed Yoda's test. We see Xan awake as she walks toward the cave.`}</Pre>
            <Heading>Note 4:</Heading>
            <Pre>{`It is evident that Leia has selected Xan to one day replace her as Master of the Order and the leader of the Republic. Even though Xan has dislocated the role that she has been groomed for since birth, it is apparent that she has ideals and notions that contradict her duty to follow protocol and remain in the box boundaries of her expectations.

Xan may be good, but as she does, she is very hard on her job of Chief of Security, where Leia yearns for peace... Xan hungers for war. She craves drastic action and has the power and skill to back up her bravado. She is the perfect mixture of her mother's strength and her father's grit.

I very much dislike to see Leia, who seems to dispel her borrowings. Xan says: "He only just found me. I have so much to learn and now he is gone. He didn't have to leave; you drove him away and now I hate you both." A Jedi has to constantly keep their emotions in check. Abundance of emotion tends to loss of control... loss of control leads to the dark side. The trick that Xan can become empowered and not be corrupted by the dark side relies on her ability to "become the Force."`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("ep7-page-7") && (
          <PageSection id="ep7-page-7" title="Page 7 — Note 6 (Falcon Cockpit) & Atlantis Note">
            <Heading>Note 6</Heading>
            <Pre>{`When Xom is doord tte Milliron Folom, with her wordad Balone Jedi counterpant who she broght bok fram the dorkside, but be lost o dem in the process. She is m th Cockpit: py Xoni "Star tower; ote Minno Folo renuestry lounch c/earoucode x4972.

Stortoney Millen Polon, dlmetde reqety sternl:

Xon: (ept Xon.. Solo: cuthentecte"

stertoner: duthmnated "God jouny, Copt Solo`}</Pre>
            <Heading>ATLANTIS NOTE!</Heading>
            <Pre>{`Befire the world ends, the Aserr's horserren reledse o plage that brirs dbout d Zombie Apodyspe.

Shokrz

7221 Broddmoon St.

Navdrre FL 32566`}</Pre>
          </PageSection>
        )}

        {visibleIds.has("ep7-story-plan") && <Episode7StoryPlan />}

        {visibleIds.has("ep7-characters") && (
          <PageSection id="ep7-characters" title="Character Creator">
            <EP7CharacterCreator />
          </PageSection>
        )}
      </main>
    </div>
  );
};

export default AstralonautEpisode7;
