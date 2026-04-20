
import { useState, useMemo } from "react";
import { PortToEngineButton } from "@/components/port-to-engine-button";
import { Link } from 'react-router-dom';
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection, Pre, Heading } from "@/components/story-page-helpers";
import StoryNotesSearch from "@/components/story-notes-search";
import ChildrenOfAquariusStoryPlan from "@/components/storyplans/ChildrenOfAquariusStoryPlan";
import CoAIssueOneScript from "@/components/storyplans/CoAIssueOneScript";
import CoAIssueTwoScript from "@/components/storyplans/CoAIssueTwoScript";
import CoACharacterCreator from "@/components/storyplans/CoACharacterCreator";
import childrenOfAquariusLogo from "@/assets/children-of-aquarius-logo.png";

const sections = [
  { id: "coa-character-creator", label: "Character Creator — Trinity & Consortium Cast" },
  { id: "coa-page-1", label: "Page 1 — Historical Timeline (1775–2020)" },
  { id: "coa-page-2", label: "Page 2 — Act 1–2: Edmund's Wedding & Civil War 2" },
  { id: "coa-page-3", label: "Page 3 — Act 3 & Epilogue: Renault's Revelation" },
  { id: "coa-page-4", label: "Page 4 — Trinity: Hi-Concept & Synopsis" },
  { id: "coa-page-5", label: "Page 5 — Cold Open & Act 1: Rwanda, Kobe, 9/11" },
  { id: "coa-page-6", label: "Page 6 — Act 2: Marcus & Simon's Subplot" },
  { id: "coa-page-7", label: "Page 7 — Act 3 & Finale: Lance of Longinus" },
  { id: "coa-page-8", label: "Page 8 — Character Dialogue Descriptions" },
  { id: "coa-page-9", label: "Page 9 — Expanded Timeline (Dec 2019 Draft)" },
  { id: "coa-page-10", label: "Page 10 — Acts 1–3 Expanded & Epilogue" },
  { id: "coa-page-11", label: "Page 11 — Issue 2 Treatment: Resurrection & FBI" },
  { id: "coa-page-12", label: "Page 12 — Issue 2 Treatment (Continued)" },
  { id: "coa-page-13", label: "Page 13 — Issue 2 Plot Plan & Issues 3–7 Summaries" },
  { id: "coa-page-14", label: "Page 14 — Issue 3 Treatment: Dark-Walker & Nightshade" },
  { id: "coa-page-15", label: "Page 15 — Issue 3 Treatment (Continued): Abduction" },
  { id: "coa-page-16", label: "Page 16 — Animated Series Pitch & Revised Synopsis" },
  { id: "coa-page-17", label: "Page 17 — Revised Act Structure & Alternate Act 3" },
  { id: "coa-page-18", label: "Page 18 — Subplots: Simon/Madeline & Blaire Flashbacks" },
  { id: "coa-page-19", label: "Page 19 — The Gathering of the Three" },
  { id: "coa-page-20", label: "Page 20 — Dramatic Questions, September 1993 & World-Building" },
  { id: "coa-page-21", label: "Page 21 — Children of Aquarius: Season Two (8 Episodes)" },
  { id: "coa-page-22", label: "Page 22 — Season One Critical Notes" },
  { id: "coa-issue-1", label: 'Issue One: "Trinity" — Script' },
  { id: "coa-issue-2", label: 'Issue Two — Working Script' },
  { id: "coa-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown" },
];

const pageContent: Record<string, string> = {
  "coa-page-1": "1775 Edmund Burke Revolutionary War 1941 Richard Burke Pearl Harbor 2001 Carter Burke Consortium NYC Ides of March 9/11 Treasury Tacoma missiles",
  "coa-page-2": "wedding Carter Edmund Emily Rosenberg Ides of March gun control bill Civil War 2 Theresa 9/11 Franco Renault Consortium Randall Reynolds reporter evidence",
  "coa-page-3": "cargo plane Renault I am your father Edmund jumps Emily parachute pregnant grandchild Randall Renault legacy",
  "coa-page-4": "Trinity Agenda Catholic Priest Alistaire Blaire mission God heralds Christ Illuminati Christ child 120 years excommunicated rogue mission Rwandan Kobe 9/11",
  "coa-page-5": "cold open Africa tribesmen conquistadors Rwanda Hutus Tutsi genocide Kobe earthquake 9/11 birth Peter Ryoko telekinesis Simon healing Trinity powers Head Hand Heart",
  "coa-page-6": "Marcus Christ Anti-Christ miracles Simon Madeline sneaking car wreck healing powers bigots interracial compound infiltration kidnap",
  "coa-page-7": "Lance Longinus Christ entity Anti-Christ quantum computing gene editing Michael all-powerful Source knowledge Age Aquarius Blaire faith crisis Maria",
  "coa-page-8": "character dialogue Ryoko business highway Blaire patient wise Michael inquisitive impulsive Simon cold calculating Monarch pilot alien tech Stacy cautious voice reason",
  "coa-page-9": "expanded 2019 draft Lexington Barrett 50 Cal sniper Minutemen Richard Burke Pearl Harbor Carter Consortium Ides March Treasury Tacoma",
  "coa-page-10": "expanded acts wedding Theresa alive true believer Renault I am your father Edmund jumps Emily pregnant Randall Renault grandchild epilogue",
  "coa-page-11": "Issue 2 Michael Ryoko escape resurrection hospital morgue Stacy Sunderson Berelli FBI aliens 47 colonies Pope Benedict alien helmsman Burke tactical operations",
  "coa-page-12": "air duct hologram elevator shaft morgue gravimetric device telekinesis Cassandra Sunderson cannon tattoo school shooter alien mothership Christ Child virus",
  "coa-page-13": "Issue 2 plot plan Issue 3 4 5 6 7 summaries Children Aquarius Consortium Marauders Ripper 1888 precog Africa Burke Renault Christ entity Age Aquarius",
  "coa-page-14": "Issue 3 1963 Chicago Dark-Walker Nightshade gangsters Father Blaire Nightwatcher Tox Uthat quantum phase inhibitor Simon recruitment Ripper encounter",
  "coa-page-15": "Nightshade emergence death Simon Ryoko Cassandra alien abduction tractor beam flying saucer private jet time dilation",
  "coa-page-16": "animated series Netflix Amazon adaptation Hi-Concept Trinity synopsis Cold Open Rwanda Kobe 9/11 Robert Towne Eight Sequences power assignment Michael Heart Simon Hand",
  "coa-page-17": "revised act structure alternate Act 3 Simon Chosen Madeline kills Michael resurrection Trinity powers midpoint culmination Anti-Christ",
  "coa-page-18": "subplot Simon Madeline bigots kung fu shooting Father Blaire flashbacks Africa 1790 Ajuta Ba'air slave ship Tibet 1868 mysticism scrolls Britain 1912 Downton Abbey NYC 1961 David Third Reich September 1993 FBI aliens assimilated Trinity vision",
  "coa-page-19": "Gathering Three Rwanda 1994 Saving Private Ryan Predator mercs Simon Kobe 1995 earthquake baby Ryoko TK shield Manhattan 2001 9/11 birth pearl orb teleport Peter miracle",
  "coa-page-20": "dramatic questions who wants what willing why now Chosen Anti-Christ September 1993 Max Snyder Shana Humphrey Draconians aliens spacecraft Roswell resurrection consecrated ground Children Aquarius Piscean age Lance Longinus",
  "coa-page-21": "Children of Aquarius Season Two limited series 8 episodes Adam Anderson Paul Anderson Theresa Anderson Jonathan Raysun Nerrian Empire Grey aliens SAP Mackenzie Connelly body dysmorphia gauntlets solid light Barrington Cartwright matter manipulation Colby Rush multi-dimensional Samantha Sanderson telepathy cosmic entities Source Vanier Eternity Chaos Order In-Betweener Kinslayer Helotia Imperial Guard kidnapping abduction Albion singularity 7 seals nuclear powers Shadow Able Wright Simon Olatunji Ryoko Tsurayaba homecoming cliffhanger",
  "coa-page-22": "Terrans Beginner's Guide Destroying World consecrated ground resurrection Piscean age Christ Child intergalactic conquerors Source inter-dimensional enigma God anthropomorphism quantum computing AI gene editing hallowed ground Rwandan Massacre 1994 Hamadan Earthquake 1995 Mass School Shooting 2029 Conduit Simon First Ryoko Second Michael Third Father Blaire Season One Critical Notes",
  "coa-issue-1": "Issue One Trinity Script Michael birth 9/11 WTC Maria Gil firefighter Father Blaire Simon Ryoko Monarch teleport rooftop miracle school shooting Lila Stacy Jeff resurrection Detective Sepulveda healed wound Lexington 1775 Edmund Burke sniper Pearl Harbor Randall Burke Carter Burke Rell Tambular Draconian Nine schism Final Eight Ryoko extraction missile RPG Annie Dubinski",
  "coa-issue-2": "Issue Two Working Script Alara Ark Revelation Pope Benedict Revelation Protocols seven seals Michael Ryoko telekinetic shield Gil Laura Consortium shock troops junction portal Sunderson Berelli FBI Cassandra Blaire Stacy morgue resurrection Burke DNA Carter Burke Consortium mothership alien stasis pod Cassandra Heralds Aquarian Age gravitational disruptor telekinesis air duct elevator shaft Cassandra Sunderson tactical armor",
  "coa-story-plan": "Story Plan three act eight sequence Dude Problem Superhero Burke Renault Illuminati Consortium Trinity Children Aquarius Michael Blaire Ryoko Simon Edmund catalyst midpoint climax Age Aquarius",
  "coa-character-creator": "Character Creator Trinity Michael Ryoko Simon Father Blaire Edmund Burke Carter Burke Franco Renault Theresa Burke Marcus Christ Child Cassandra Sunderson Gil Dubinski Rell Tambular Draconian Consortium roster cast portraits stats abilities equipment backstory",
};

export default function ChildrenOfAquarius() {
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
            src={childrenOfAquariusLogo}
            alt="Children of Aquarius"
            className="mx-auto max-w-md w-full h-auto mb-2"
          />
          <p className="text-sm text-muted-foreground mb-4">Raw Story Notes — 22 Pages + 2 Script Archives + Story Plan</p>
          <PortToEngineButton storyId="children-of-aquarius" />
        </div>
      </div>

      <main className="container max-w-5xl mx-auto px-4 py-10 space-y-8">
        <StoryNotesSearch query={search} onChange={setSearch} placeholder="Search Children of Aquarius notes…" />

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

        {/* Character Creator (pinned to top) */}
        {visibleIds.has("coa-character-creator") && (
          <PageSection id="coa-character-creator" title="Character Creator — Trinity & Consortium Cast">
            <CoACharacterCreator />
          </PageSection>
        )}

        {/* Page 1 — Historical Timeline */}
        {visibleIds.has("coa-page-1") && (
          <PageSection id="coa-page-1" title="Page 1 — Historical Timeline (1775–2020)">
            <Heading>Illuminati (2018 Notes)</Heading>
            <Pre>{`A story of treachery, betrayal, savagery, and despair.

1775: Edmund Burke facilitates the Revolutionary War.

1941: Richard Burke oversees the Japanese bombing of Pearl Harbor, thrusting the US into WWII

9-9-2001: Carter Burke stands opposed to a group called The Consortium. They are in a disagreement over NYC. For the first time since its conception, the consortium is fractured. Carter leaves them with an ominous warning from Shakespeare: "Beware the Ides of March"

9-11-2001: The consortium, sans Burke, executes the worst terrorist attack on US Soil until...

4-15-2020: Seven heavily armed men storm the US Treasury building in DC, killings three hundred people before gaining access to a part of the facility that isn't supposed to exist; a covert mission control station for a satellite based anti-missile defense system. They launch two missiles: one destroys the treasury building, devastating the surrounding area for several square blocks. The other destroys a nuclear power plant in Washington state, creating a chain reaction that destroys most of Tacoma.`}</Pre>
          </PageSection>
        )}

        {/* Page 2 — Act 1-2 */}
        {visibleIds.has("coa-page-2") && (
          <PageSection id="coa-page-2" title="Page 2 — Act 1–2: Edmund's Wedding & Civil War 2">
            <Heading>Act 1 (Sq2)</Heading>
            <Pre>{`Act 1 opens on a extravagant weeding. Carter Burke is celebrating the wedding of his son, Edmund Burke, and Fiancé Emily Rosenberg.

During a private discussion between Carter and his son, it becomes apparent that they initiated "Ides of March" attack ahead of whatever the consortium had planned. They are vying for control of the United States. While the Consortium's plan was to assassinate the president and his cabinet and place their own man in the Oval Office, The Burkes executed a massive terror attack to push through a gun control bill into law that would require all Americans to surrender their firearms.

This began a second civil war. (midpoint culmination)`}</Pre>

            <Heading>Act 2 (SQ 3 & 4)</Heading>
            <Pre>{`It is revealed that Edmund's mother, Theresa, officially died in the 9/11 attacks in the World Trade Center. This was a cover-up. Unofficially, she was meant to stop the attack on NY But died in the process.

Carter's friend and greatest adversary, Franco Renault, is the "face" of the consortium.

Randall Reynolds, a reporter-friend Emily has known since college, approaches her and, to her horror, reveals to her that the Burkes are not just a family of wealthy land developers, but by connecting the dots, shows her that they own a sizable interest in the entire planet.

The reporter uses his personal connection to attempt to sway Emily from her husband and convince her to help him gather enough evidence to bring them down.`}</Pre>

            <Heading>Act 2 (SQ 5 & 6)</Heading>
            <Pre>{`During a civil war 2 related conflict at the midpoint, Carter Burke dies...by the hand of Theresa Burke! Who was not only alive all these years, but faked her death when Carter split from the consortium because, unlike Carter, Theresa was a "true believer". She didn't die in 9-11, she ensured the attack's success.

Edmund is able to capture his mother alive and holds her for questioning. She somehow still looks younger than her son.

Theresa is about to reveal why she left him and her father right before Renault's men, surprisingly the same men who attacked the Treasury building, "storm the palace." Edmund is captured and Theresa is assumed dead in the explosion.`}</Pre>
          </PageSection>
        )}

        {/* Page 3 — Act 3 & Epilogue */}
        {visibleIds.has("coa-page-3") && (
          <PageSection id="coa-page-3" title="Page 3 — Act 3 & Epilogue: Renault's Revelation">
            <Heading>Act 3 (SQ 7 & 8)</Heading>
            <Pre>{`On Renault's private cargo plane, he tries to sway Edmund to his side by disclosing the darkest revelation yet.

Renault: Do you know why your mother chose to stay with the consortium?

Edmund: ....

Renault: Did she tell you the truth about your father?

Edmund: She told me enough, Franco. She told me YOU killed him.

Renault: No, Edmund. "I" am you father.

Edmund: No! That isn't true! That's impossible!

Renault: She had no choice, really. Had Carter learned the truth, he would have surely killed you both. I promised, after the schism, that I would not allow you, or Carter to be harmed...

Edmund: ...if she went with you...

Renault: Yes. You are not a Burke. You never were. You are a Renault. Heir to all my lands and titles...all you have to do is say "Yes".

- Edmund, with his entire world shattered, jumps off the plane.

- Emily kills the man holding her, grabs a parachute, and follows her husband.`}</Pre>
          </PageSection>
        )}

        {/* Page 4 — Trinity Hi-Concept */}
        {visibleIds.has("coa-page-4") && (
          <PageSection id="coa-page-4" title="Page 4 — Trinity: Hi-Concept & Synopsis">
            <Heading>What follows are notes from a September 6, 2019 update to the outline: Trinity</Heading>
            <Pre>{`Cold Open:

NOTE: at the lowest point they face their greatest threat

A battle in Africa between tribesmen and conquistadors.`}</Pre>

            <Heading>Trinity (aka The Agenda)</Heading>
            <Pre>{`Hi-Concept

Catholic Priest Alistaire Blaire is on a mission from God to gather the Trinity, the Heralds of Christ. Three humans imbued with the powers and abilities of Jesus Christ in order to confront those who would stand in the way of the second coming, the "Illuminati".

Synopsis:

Three times in our recent history, Christ has returned in the body of a human being. His nature is revealed when the child reaches puberty and miracles begin to occur. Father Blaire, an excommunicated Priest has been on a rogue mission the last 120 years to find and protect the Christ child so that his purpose may be fulfilled but the evil "Illuminati" has always been on step ahead of him with agents in place to kill the child once he emerges..

This time is different.

Father Blaire prayed for a solution and upon him was laid a vision. The Christ Child is not able to protect himself until he reaches maturity. Until that time, his powers will be split amongst three protectors...the Trinity. Along with Father Blaire, the immortal, they will find and protect the Christ child until he has reached maturity and is able to fulfill his destiny.`}</Pre>
          </PageSection>
        )}

        {/* Page 5 — Cold Open & Act 1 */}
        {visibleIds.has("coa-page-5") && (
          <PageSection id="coa-page-5" title="Page 5 — Cold Open & Act 1: Rwanda, Kobe, 9/11">
            <Heading>Cold Open</Heading>
            <Pre>{`Father Blaire is given a vision of three events where the Heralds will be revealed. One is the Rwandan massacre, the result of the civil war between the Hutus and the Tutsi.

The "Illumaniti" created this conflict for their own personal gain.

NOTE:

The Rwandan genocide, also known as the genocide against the Tutsi, was a genocidal mass slaughter of Tutsi in Rwanda by members of the Hutu majority government. An estimated more than 800,000 Rwandans were killed during the 100-day period from April 7 to mid-July 1994, constituting as many as 70% of the Tutsi population. Additionally, 30% of the Pygmy Batwa were killed. The genocide and widespread slaughter of Rwandans ended when the Tutsi-backed and heavily armed Rwandan Patriotic Front (RPF) led by Paul Kagame took control of the country. An estimated 2,000,000 Rwandans, mostly Hutus, were displaced and became refugees.

END NOTE:`}</Pre>

            <Heading>Synopsis continued</Heading>
            <Pre>{`Father Blaire foresaw The Great Hanshin earthquake in Kobe Japan in January 1995 that killed more than 5,500 and injured 26,000 others. The economic loss has been estimated at about $US 200 billion.

The last event Father Blaire forsaw was the terror attack on the World Trade Center.
A female executive is in labor. She and a firefighter are trapped in a room. He dies while telling her to push when a giant beam falls on him.
Alone, fire everywhere, the woman feels that all is lost. Then, Father Blaire is there, suddenly, telling her to push. She does. Two other children are with Father Blaire, one, Ryoko, is holding up rubble and steel telekinetically. The other child, Simon, places his hand on the woman's forehead and she no longer feels any pain.
The child is born and the five of them seem to teleport out before tower falls.

On a rooftop close by, the mother holds her child once, tells him that his name is Peter and that he isn't a mistake. He is a miracle, then she dies.`}</Pre>

            <Heading>Act I</Heading>
            <Pre>{`Father Blaire and his team raise the children and keep them safe. They train them in the use of their powers and reveal which of Christ's attributes each has an affinity for.

Ryoko (Jamie Chung) is the Head of Christ. She has telekinesis. She is also able to use psychometric abilities to read the history of objects and people to read their past and see their future.
Simon (Michael B Jordan) is the Hand of Christ with the ability to heal others and change the mass, density and chemical composition of matter.
Peter is the Heart of Christ: Peter has super strength, invulnerability, and an iron will. Peter, because he has heart, never quits and never gives up. He is the youngest and therefore the most underestimated.
Micheal's Gift is resurrection`}</Pre>

            <Heading>The Catalyst</Heading>
            <Pre>{`New Miracles are being reported. Father Blaire and the Trinity go to investigate. A huge battle between the Trinity and the Illuminati take place. They believe they have found the Christ child, a teenage boy named Marcus. There is also the danger that Marcus may be the Anti-Christ, who is also prophesied to emerge at the same time as Christ.`}</Pre>
          </PageSection>
        )}

        {/* Page 6 — Act 2 */}
        {visibleIds.has("coa-page-6") && (
          <PageSection id="coa-page-6" title="Page 6 — Act 2: Marcus & Simon's Subplot">
            <Heading>Act 2: pt1</Heading>
            <Pre>{`-The Trinity learn about their powers, the world around them, and Marcus.
-Simon has been sneaking out to see some girl.
-Strange things that happen around the compound that lead some to believe that Marcus may be the anti-Christ.
-Simon and this girl (Madeline) are in a car wreck. He uses his healing powers on her, thus revealing his secret. Madeline gets Simon to use his powers more and more openly. She convinces him that he is the real "star" and his talents are being marginalized by Father Blaire and the others.`}</Pre>

            <Heading>Act 2: pt 2</Heading>
            <Pre>{`At the midpoint culmination:

Father Blaire and the Trinity rescue Marcus when The Illuminati, who have infiltrated the compound, attempt kidnap Marcus. Marcus is able to use some of the same abilities that the Trinity use, but mostly by accident to serendipitously save himself and an unconscious Father Blaire several times over. Marcus, doubting himself, is not sure whether he is Christ or Anti-Christ, all he know is that he needs to do the right thing and save the Priest who saved him.

SUBPLOT 1

Simon & Madeline:
- Simon and Madeline are confronted by bigots who don't agree with their interracial relationship. They jump Simon, not expecting him to be a master of Kung Fu. One punk gets a shot off with a gun and hits Madeline. Simon and the punk desperately try to save her. Simon's healing powers aren't working on Madeline at first.

Government sends troops into the caverns when negotiates with the aliens falls apart`}</Pre>
          </PageSection>
        )}

        {/* Page 7 — Act 3 & Finale */}
        {visibleIds.has("coa-page-7") && (
          <PageSection id="coa-page-7" title="Page 7 — Act 3 & Finale: Lance of Longinus">
            <Heading>Children of Aquarius pt 2</Heading>
            <Pre>{`Father Blaire and the Christ Child are wreaking havoc all over the planet breaking seals.
Michael (Level 2) can protect the Trinity from Blaire's mind blasts.

The Children of Aquarius are on a quest to find the lance of Longinus. They plan to use it to drive the Christ entity from its corporal from.
Upon retrieving it, they soon learn that it will not kill the Christ child. They learn it was never the lance but the believer who lost his faith that can drive the Christ Entity from its corporal form.
Father Blaire has to be the one to lose his faith and betray the Christ child to stop the Apocalypse

Michael: "Blaire, you don't want to destroy the world. You wanted to destroy the wicked. The ones who took your family away from you. Who took your brother. Who took my mother"
Blaire: "…Maria."
Michael: "Come with me. End this."`}</Pre>

            <Heading>The Anti-Christ</Heading>
            <Pre>{`The Consortium has a plan of their own. They want the Lance to receive the DNA of the original vessel. By using the dangerous combination of A.I., Quantum computing and gene editing/manipulation, they create a being that can tap into the source; a counter to the Christ entity. An "Anti-Christ."

A soul must be captured in order to bring their creation to life, but the soul of a trusted companion is resurrected into the Consortium's abomination.`}</Pre>

            <Heading>How does it end?</Heading>
            <Pre>{`The Christ Child gains the collective knowledge of every world it culls as the life energy passes through him into the beyond. The collective knowledge makes him more powerful with each world he destroys.

NOTE: The Christ child defeats the anti-Christ and takes his powers back from the Trinity. There is a loophole that allows Michael to use the same method to take the power back from the Christ child. For a moment, Michael becomes all-powerful, all-knowing, all-seeing. Michael is walking alongside the Source. He says no born entity should have this much power.

When Michael releases the power, instead of sending it back to the source, he puts it into all living things, and the power becomes knowledge. All beings have the knowledge that they are part of a greater whole. The outpouring of Knowledge like the water of life. And Thus begins, the true age of Aquarius.`}</Pre>
          </PageSection>
        )}

        {/* Page 8 — Character Dialogue Descriptions */}
        {visibleIds.has("coa-page-8") && (
          <PageSection id="coa-page-8" title="Page 8 — Character Dialogue Descriptions">
            <Heading>Children of Aquarius: Character Dialogue Descriptions</Heading>
            <Pre>{`Ryoko: All business. Her way or the highway - unwilling to compromise because she is always right. Easily annoyed. Tactless. Sgt Rock.

Father Blaire: Patient and wise. Confident and determined. Having others look at the bigger picture. Showing others that they could be doing more.

Michael: Inquisitive, impulsive, impatient, unsure of himself, insecure. Thinks he knows more than he actually does. Tends to put his foot in his mouth.

Simon: Didn't want to be perceived as a dumb jock, probably why he went into finance. Good at hiding his abilities. Cold and calculating. Feels like he made dumb decisions that ruined his life for years. Wishes he could have done things differently. The Vision

Monarch: Team's pilot. Uses alien/future tech. The engineer. Cool under pressure. Not easy to surprise. Always has a war story. Ethan Hunt.

Stacy: Michael's friend from school. scared, cautious, voice of reason. Mom figure.`}</Pre>
          </PageSection>
        )}

        {/* Page 9 — Expanded Timeline (Dec 2019) */}
        {visibleIds.has("coa-page-9") && (
          <PageSection id="coa-page-9" title="Page 9 — Expanded Timeline (Dec 2019 Draft)">
            <Heading>What follows is an update from December 2019: Illuminati (Feb 24 2017 Draft)</Heading>
            <Pre>{`A story of treachery, betrayal, savagery, and despair.

1775: Edmund Burke facilitates the Revolutionary War by orchestrating the murder of a high ranking Minutemen Commander at the Lexington Summit where a peace treaty was to be signed, but instead, because of that single shot, fired from a Barrett .50 Cal with a sniper and spotter hidden in the trees, turned into the bloodbath later called the Battle of Lexington and Concord.

1941: Edmund's dependent, Richard Burke oversees the Japanese bombing of Pearl Harbor, thrusting the US into WWII

9-9-2001: Richard's son, Carter Burke stands opposed to the group in a disagreement over NYC. For the first time since its conception, the consortium is fractured. Carter leaves them with an ominous warning from Shakespeare: "Beware the Ides of March"

9-11-2001: The consortium, sans Burke, executes the worst terrorist attack on US Soil until...

4-15-2020: Seven heavily armed men storm the US Treasury building in DC, killings three hundred people before gaining access to a part of the facility that isn't supposed to exist; a covert control station for a satellite based anti-missile defense system. They launch two missiles: one destroys the treasury building, devastating the surrounding area for several square blocks. The other destroys a nuclear power plant in Washington state, creating a chain reaction that destroys most of Tacoma.`}</Pre>
          </PageSection>
        )}

        {/* Page 10 — Acts 1-3 Expanded */}
        {visibleIds.has("coa-page-10") && (
          <PageSection id="coa-page-10" title="Page 10 — Acts 1–3 Expanded & Epilogue">
            <Heading>Act 1 (Sq2)</Heading>
            <Pre>{`Act 1 opens on a extravagant weeding. Carter Burke is celebrating the wedding of his son, Edmund Burke, and Fiancé Emily Rosenberg.

During a private discussion between Carter and his son, it becomes apparent that they initiated "Ides of March" attack ahead of whatever the consortium had planned. They are vying for control of the United States. While the Consortium's plan was to assassinate the president and his cabinet and place their own man in the Oval Office, The Burkes executed a massive terror attack to push through a gun control bill into law that would require all Americans to surrender their firearms.

This began a second civil war. (midpoint culmination)`}</Pre>

            <Heading>Act 2 (SQ 3 & 4)</Heading>
            <Pre>{`It is revealed that Edmund's mother, Theresa, officially died in the 9/11 attacks in the World Trade Center. This was a cover-up. Unofficially, she was meant to stop the attack on NY But died in the process.

Carter's friend and greatest adversary, Franco Renault, is the "face" of the consortium.

Randall Reynolds, a reporter-friend Emily has known since college, approaches her and, to her horror, reveals to her that the Burkes are not just a family of wealthy land developers, but by connecting the dots, shows her that they own a sizable interest in the entire planet.

The reporter uses his personal connection to attempt to sway Emily from her husband and convince her to help him gather enough evidence to bring them down.`}</Pre>

            <Heading>Act 2 (SQ 5 & 6)</Heading>
            <Pre>{`During a civil war 2 related conflict at the midpoint, Carter Burke dies...by the hand of Theresa Burke! Who was not only alive all these years, but faked her death when Carter split from the consortium because, unlike Carter, Theresa was a "true believer". She didn't die in 9-11, she ensured the attack's success.

Edmund is able to capture his mother alive and holds her for questioning. She somehow still looks younger than her son.

Theresa is about to reveal why she left him and her father right before Renault's men, surprisingly the same men who attacked the Treasury building, "storm the palace." Edmund is captured and Theresa is assumed dead in the explosion.`}</Pre>

            <Heading>Act 3 (SQ 7 & 8)</Heading>
            <Pre>{`On Renault's private cargo plane, he tries to sway Edmund to his side by disclosing the darkest revelation yet.

Renault: Do you know why your mother chose to stay with the consortium?

Edmund: ....

Renault: Did she tell you the truth about your father?

Edmund: She told me enough, Franco. She told me YOU killed him.

Renault: No, Edmund. "I" am you father.

Edmund: No! That isn't true! That's impossible!

Renault: She had no choice, really. Had Carter learned the truth, he would have surely killed you both. I promised, after the schism, that I would not allow you, or Carter to be harmed...

Edmund: ...if she went with you...

Renault: Yes. You are not a Burke. You never were. You are a Renault. Heir to all my lands and titles...all you have to do is say "Yes".

- Edmund, with his entire world shattered, jumps off the plane.

- Emily kills the man holding her, grabs a parachute, and follows her husband into the void.`}</Pre>

            <Heading>Epilogue</Heading>
            <Pre>{`It is revealed that Emily is pregnant, with Edmund's child; Franco's grandchild and his legacy.

It also turns out that Randall Reynolds is really Randall Renault. Just as Carter had his son's wife picked out from high school, unbeknownst to Edmund, Franco, as soon as he has learned of Carter's pick, set Randall upon her.

"Go get my grandchild back" he says to Randall.

"Yes, Father." is Randall's reply.

To be continued.`}</Pre>
          </PageSection>
        )}

        {/* Page 11 — Issue 2 Treatment */}
        {visibleIds.has("coa-page-11") && (
          <PageSection id="coa-page-11" title="Page 11 — Issue 2 Treatment: Resurrection & FBI">
            <Heading>Issue 2 — PLOT</Heading>
            <Pre>{`A-Story: Michael and Ryoko escape their pursuers, but Michael, learning how he came back from the dead, demands to be taken to the hospital morgue so that he can bring back the girl who died.
They are rescued by Simon at the end of the issue.

B-Story: the X-files

C-Story: power struggle between the two factions of the Illuminati

Dual Theme: a warning of things to come.`}</Pre>

            <Heading>TREATMENT — A-Story</Heading>
            <Pre>{`Cold Open: Voiceover - "This planet is not under the control of Terrans alone. "Terrans?" Terran is a term to describe a type 0 civilization, a single planet society that has not achieved intergalactic or inter-dimensional travel.

Only the Church has access to this technology."

We see a fleet of aliens ships. On the bridge is the Pope Benedict. The Pope is giving orders to an alien helmsman. I'm sorry

What are the 47 colonies? - Michael wakes up. Fire all around. Fathers Blaire was inside Michael's head, feeding him a vision and telling him to wake up.

NOTE: Telepathic communication is like augmented reality.`}</Pre>

            <Heading>B-Story: DC. J. Edgar Hoover Building. 1993</Heading>
            <Pre>{`An eerily familiar looking FBI agent (Sunderson) is being told to wake up! It startles him and he snaps up to the sound of a ringing telephone. His female partner (Berelli) asks where he is going. He doesn't respond. She follows him discreetly, spying on him. He meets with a man dressed as a priest. They exchange words, the conversation seems heated. When he gets back to his car, his partner is there waiting. She asks about who the man is and he is reluctant to answer. The agent tells his partner, "He knows how to find Cassandra…and the beings that took her."

Berelli: "You can't be serious" she replies.

Sunderson: "He's taking me to them."

Berelli: When?

Sunderson: Tonight`}</Pre>

            <Heading>A-Story (continued)</Heading>
            <Pre>{`Present day. Michael's home is on fire, debris everywhere. Ryoko uses her TK shield to protect the family from the explosion, but Gil took some shrapnel in the leg.

Ryoko takes them out the back. They encounter shock troops in the bushes. Ryoko takes them out using TK enhanced martial arts.

The goal is to evade and escape. There are drones everywhere. Ryoko: we need to get off the street

Michael: where are we going?

Ryoko: we need to find the nearest junction. From there I can port us to a safe location.

Michael: I didn't understand a single word you just said.

Ryoko: shut up and stay out of the light. This is no good. We need to get off the street.`}</Pre>

            <Heading>C-Story</Heading>
            <Pre>{`Carter Burke is on the phone with the director of the tactical operations center. We get our first glimpses of him as he is established as the story's level 2 antagonist.

Note: Burke is being updated on the detective's police report by his assistant. The consortium learned of Michael's abilities and tracked him to his home. Ryoko knew because she works for the government to stay close to the consortium while remaining anonymously undetected.`}</Pre>
          </PageSection>
        )}

        {/* Page 12 — Issue 2 Treatment Continued */}
        {visibleIds.has("coa-page-12") && (
          <PageSection id="coa-page-12" title="Page 12 — Issue 2 Treatment (Continued)">
            <Heading>B-Story (continued)</Heading>
            <Pre>{`EXT. forest area. Night. Blaire and the two FBI agents are on a ridge overlooking a lit clearing with modular buildings…`}</Pre>

            <Heading>A-Story (parallel to B-Story)</Heading>
            <Pre>{`They are home free, but because Ryoko says in passing how Michael brought himself back from the dead, he remembers healing Lila before passing out. Michael demands to go back "behind enemy lines" to the hospital morgue to bring STACY back to life.`}</Pre>

            <Heading>B-Story: Alien Mothership</Heading>
            <Pre>{`Blaire and Sunderson jump on the Alien mothership as it is coming in for a landing. They make their way inside and find Subderson and Berelli's daughter. As they are being reunited, Father Blaire telepathically senses the Christ Child, and finds her, but she is already infected with a virus that is making her more alien than human and she won't survive the transformation. This is when she gives Father Blaire the mission to find the heralds.`}</Pre>

            <Heading>A-Story: Hospital Infiltration</Heading>
            <Pre>{`EXT. Hospital- Night: tight on an exterior AC outflow panel being closed from the inside. Ryoko and Michael are crawling through the air ducts. Ryoko pulls up a hologram schematic of the building to plot their course. Michael is amazed and asks about it. She shuts him down as they have reached their destination, an elevator shaft. Michael starts to ask how they will even get down and Ryoko uses her TK to float them down the shaft. In the Morgue, Michael finds the password to the terminal under a keyboard and finds STACY's storage locker. He pulls it over and unzips her body bag.`}</Pre>

            <Heading>B-Story (conclusion)</Heading>
            <Pre>{`The ship rattling and shaking as it is beginning to take off. Sunderson is felled in a firefight with the Aliens. Blaire promises to get the daughter off the ship and look out for her. They barely make it off before the ship warps off into space.`}</Pre>

            <Heading>A-Story: Morgue Confrontation</Heading>
            <Pre>{`Michael tries concentrating on bringing STACY back but doesn't know what to do. Ryoko is keeping watch and sees a man dressed as a doctor murder a security guard. She tells Michael to hurry and she is going to buy him some time. Ryoko and the man fight in the hallway. He uses gravimetric device to counter the effects of her telekinesis.

Michael hears Blaire's voice in his head guiding him. He revives Stacy just as the fight breaks into the Morgue.

Ryoko is felled by a lucky shot. Michael, in anger, stand up to the Killer. As he is about to get taken out, the killer gets taken down by a huge energy blast.

A woman in full tactical gear holding a really big cannon tells them to get moving as he won't be down for long.

Michael bids them to wait as she sees something on the killer that gives him pause, we don't know what. On one of the overturned autopsy slabs is the school shooters body. He looks at the arm and finds a distinctive tattoo. The same tat that is on the killer's neck.

CUT TO: Michael, Shelly, Ryoko and the woman, who is driving introduces herself as Cassandra SUNDERSON.

TO BE CONTINUED.`}</Pre>
          </PageSection>
        )}

        {/* Page 13 — Issue 2 Plot Plan & Issues 3-7 */}
        {visibleIds.has("coa-page-13") && (
          <PageSection id="coa-page-13" title="Page 13 — Issue 2 Plot Plan & Issues 3–7 Summaries">
            <Heading>Issue 2 — Plot Plan</Heading>
            <Pre>{`A-Story: Michael and Ryoko escape their pursuers, but Michael, learning how he came back from the dead, demands to be taken to the hospital morgue so that he can bring back the girl who died.
They are rescued by Cassandra Saunderson at the end of the issue.

B-Story: the X-files

C-Story: power struggle between the two factions of the Illuminati

Dual Theme: a warning of things to come.`}</Pre>

            <Heading>Issue 3</Heading>
            <Pre>{`A-Story: Michael meets Father Blaire and learns of the mission. There is tension between Cassandra & Ryoko. Ryoko reluctantly goes to bring Simon reluctantly back into the fold. We learn that Michael's abilities are more than originally expected. He appears, in some small measure, to be able to use Simon & Ryoko's powers as well as his own. Speculation arises that he may actually be the Christ child.

B-Story: 1963 - Gotham

C-Story: Simon and Ryoko sent to grow up on a hostile planet. Time dilation is why they are not older in 2015 than they should be.

Dual Theme: is this young man who we think he is?`}</Pre>

            <Heading>Issue 4</Heading>
            <Pre>{`A-Story: The Children of Aquarius go head-to-head against the Consortium and their Mauraders when Michael goes to get revenge for his parents.

B-Story: Father Blaire in 1888 meets the Consortium's assassin "The Ripper".
Blaire works with a woman who turns out to be a precog. She dies at the end of the issue (or does she?)

C-Story: Burke facilities the Children of Aquarius' escape from Renault's men and The Ripper's new form.

Dual Theme: A new power emerges`}</Pre>

            <Heading>Issue 5</Heading>
            <Pre>{`A-Story: Michael messes up seeking revenge for his parents and now the Consortium has what they need to find the Christ Child despite the cloak

B-Story: Africa part 1

C-Story: Burke shows his hand. The Consortium used a precog to find where the next emergence will be every time. Turn out to be the one who was supposedly killed by the Ripper.

Dual Theme: Revelations part 1`}</Pre>

            <Heading>Issue 6</Heading>
            <Pre>{`A-Story: Micheal and the Children of Atlantis storm the castle. They find the precog and Father Blaire flips the F out.

B-Story: Africa part 2 - Blaire goes to save his brother and the others from the slavers ship. He fails, the ship sinks and his brother dies.

A and C Story intersect - The Children learn their true destiny and the purpose of the Christ child—to prevent the planet to transcending to the next age and to instead restart the age of Pisces.

The visions the Christ entity gave Blaire were of the experiments done on female abductees. The aliens were attempting to cultivate their own Christ entity. Simon, Ryoko, and Michael are the most promising results of humans created who can channel energy from the source.

Theme: Revelations Part 2`}</Pre>

            <Heading>Issue 7: "Disillusion and re-birth"</Heading>
            <Pre>{`A-Story: The Children of Aquarius are faced with a difficult decision - Join Father Blaire and the Christ Child or Join the Illuminati and stop them from destroying the planet.

NOTE: Aliens on Earth want to bring Terrans into the Aquarian age through open contact, but first, the Earth must be judged.
Planets that don't pass judgement must reset the Piscean age.

C-Story: Burke learns of his true parentage.`}</Pre>
          </PageSection>
        )}

        {/* Page 14 — Issue 3 Treatment */}
        {visibleIds.has("coa-page-14") && (
          <PageSection id="coa-page-14" title="Page 14 — Issue 3 Treatment: Dark-Walker & Nightshade">
            <Heading>Issue 3 — Plot</Heading>
            <Pre>{`A-Story: Michael meets Father Blaire and learns of the mission. There is tension between Cassandra & Ryoko. Ryoko reluctantly goes to bring Simon reluctantly back into the fold. We learn that Michael's abilities are more than originally expected. He appears, in some small measure, to be able to use Simon & Ryoko's powers as well as his own. Speculation arises that he may actually be the Christ child.

B-Story: 1963 - Gotham

C-Story: Simon and Ryoko sent to grow up on a hostile planet. Time dilation is why they are not older in 2015 than they should be.

Dual Theme: is this young man who we think he is?`}</Pre>

            <Heading>Treatment — Opens with B-Story: 1963 - Chicago - Night</Heading>
            <Pre>{`Gangsters doing gangster stuff. Suddenly, they are stomped out by a figure dressed in a black trenchcoat with his eyes covered by a mask, the Dark-Walker. He is assisted by his spotter and long range shooter, a teenage boy, also wearing a mask, Nightshade.

When they return to their mansion home, Father Blaire is waiting for them and reveals he knows their secret.`}</Pre>

            <Heading>A-Story</Heading>
            <Pre>{`Ext. Modern Mansion - Day: Cassandra and Ryoko are in an office reporting to Father Blaire who is behind a desk facing away from them looking out a window. Throughout their conversation, Blaire witnesses a rabbit being stalked by an eagle. Cassandra and Ryoko are at odds about the previous evening's events and the plan forward. Father Blaire breaks the tie in the conversation just as the Hawk captures the rabbit. Father Blaire declares they are going to need all the help they can get and dispatched them to go and recruit Simon back into the fold.`}</Pre>

            <Heading>B-Story: Father Blaire & The Nightwatcher</Heading>
            <Pre>{`Father Blaire and the Nightwatcher go back a ways, to the war. Blaire saved the Nightwatcher's life. Blaire tells them that the Emergence is at hand and that he believes the boy is the Christ Child's vessel. He tells them that he must come with him to fulfill his destiny.

Of course, they both refuse to believe and the Nightwatcher get a call. A tip from an informant on the whereabouts of the Goon's shipment of war munitions. This opportunity is too good to pass up. Blaire warns them that this is just the type trap the Consortium would set to draw them out and kill the Christ Child's vessel to stop the Emergence. They agree to let him come along on the raid.`}</Pre>

            <Heading>A-Story: Michael & Father Blaire</Heading>
            <Pre>{`Father Blaire and Michael speak face-to-face. The talk about the "Great year" and the transition from the Age of Pisces into the Age of Aquarius`}</Pre>

            <Heading>A1-Story: Simon Recruitment</Heading>
            <Pre>{`Ryoko and Cassandra go to Simon's Job where he is an entry level analyst at an Asset Management Firm.`}</Pre>

            <Heading>B-Story: 1963 - Chicago - Night - Warehouse District</Heading>
            <Pre>{`Gangsters about to exchange money for guns, or so that is what it looks like. One of the gangsters opens a case with a glowing technological artifact.

Father Blaire face turns to a look of horror as he seems to recognize what it is. The "Tox Uthat", a quantum phase inhibitor, a device of halting all nuclear fusion within a star. Invented by a scientist named Kal Dano in the 27th century

He knows that this is, in fact, a set-up.`}</Pre>

            <Heading>A-Story: Michael & Shelly</Heading>
            <Pre>{`Michael and Shelly are trying to make sense of their new reality.`}</Pre>

            <Heading>A1-Story: Simon's Decision</Heading>
            <Pre>{`Ryoko tries to convince Simon to join the fight but he refuses. She tells him that the Ripper is back. Back at work, he is getting unnecessary crap from a middle manager. He jumps out of an open window and lands in front of Ryoko's car causing her to slam on breaks. He says he will join under one condition; he gets to kill the Ripper.`}</Pre>
          </PageSection>
        )}

        {/* Page 15 — Issue 3 Treatment Continued */}
        {visibleIds.has("coa-page-15") && (
          <PageSection id="coa-page-15" title="Page 15 — Issue 3 Treatment (Continued): Abduction">
            <Heading>B-Story: The Raid</Heading>
            <Pre>{`The Nigthwatcher tells his son to provide cover, Father Blaire tries to stop him, but the Nightwatcer tells him to help or get out of his way.

Nightwatcher starts in on the gangsters, Father Blaire goes for the Tox Uthat. The ripper comes out of the shadows and starts giving the Nightwatcher a run for his money. Father Blaire pleads to the boy to leave, but Nightshade recognizes the Ripper as the butcher who killed his mother and goes after him, only to get himself killed to the horror of Nightwatcher and Blaire.

As the Ripper is about to deliver the killing blow to the Nightwatcher, Father Blaire hits him with a telepathic mind blast, the type he rarely attempts, putting the ripper down.

The gangsters grab up the ripper as they use magazines dumps to cover their retreat.

Father Blaire and The Nightwatcher witness the Nightshade's emergence just before he dies.`}</Pre>

            <Heading>A-Story: Alien Abduction</Heading>
            <Pre>{`Ryoko, Cassandra Simon set off to return to the Mansion by private jet. They converse about them being raised and/or trained on an alien world and how time dilation is the reason they are younger than they should be in 2015.

Suddenly, there is a blinding light coming from outside. The pilot exclaimed he has lost control of the aircraft and can't raise the tower (ATC).

EXT- Pilot and co-pilot are looking up outside the window.

Ext- side of plane, close on Simon, Ryoko and Cassandra looking out of the windows.

Next page: full spread: the Plane caught in a tractor beam of a giant flying saucer shaped ship.

TO BE CONTINUED`}</Pre>
          </PageSection>
        )}

        {/* Page 16 — Animated Series Pitch & Revised Synopsis */}
        {visibleIds.has("coa-page-16") && (
          <PageSection id="coa-page-16" title="Page 16 — Animated Series Pitch & Revised Synopsis">
            <Heading>Plot Plan and Story Arc Strategy</Heading>
            <Pre>{`Hi-Concept

I wish to adapt my graphic novel into an animated series for Nexflix or Amazon.

Trinity:

An excommunicated priest must find and gather three children who have been imbued with the powers of Christ to herald the second coming by finding the Christ child and protecting it from the evil Illuminati.

Catholic Priest Alistaire Blaire is on a mission from God to gather the Trinity, the Heralds of Christ. Three humans imbued with the powers and abilities of Jesus Christ in order to confront those who would stand in the way of the second coming, the "Illuminati".

Synopsis:

Three times in our recent history, Christ has returned in the body of a human being. His nature is revealed when the child reaches puberty and the miracles begin to occur. Father Blaire, an excommunicated Priest has been on a rogue mission the last 120 years to find and protect the Christ child so that his purpose maybe fulfilled but the evil "Illuminati" has always been on step ahead of him with agents in place to kill the child once it's identity is revealed.

This time is different.

Father Blaire prayed for a solution and a solution was presented. The Christ Child is not able to protect himself until he reaches maturity. Until that time, his powers will be split amongst three protectors...the Trinity. Along with Father Blaire, the immortal, they will find and protect the Christ child until he has reached maturity and is able to fulfill his destiny.`}</Pre>

            <Heading>Cold Open</Heading>
            <Pre>{`Father Blaire is given a vision of three events where the Heralds will be revealed. One is the Rwandan massacre, the result of the civil war between the Hutus and the Tutsi.

The "Illumaniti" created this conflict for their own personal gain.

NOTE:

The Rwandan genocide, also known as the genocide against the Tutsi, was a genocidal mass slaughter of Tutsi in Rwanda by members of the Hutu majority government. An estimated more than 800,000 Rwandans were killed during the 100-day period from April 7 to mid-July 1994, constituting as many as 70% of the Tutsi population. Additionally, 30% of the Pygmy Batwa were killed. The genocide and widespread slaughter of Rwandans ended when the Tutsi-backed and heavily armed Rwandan Patriotic Front (RPF) led by Paul Kagame took control of the country. An estimated 2,000,000 Rwandans, mostly Hutus, were displaced and became refugees.

END NOTE:

Synopsis continued:

Father Blaire foresaw The Great Hanshin earthquake in Kobe Japan in January 1995 that killed more than 5,500 and injured 26,000 others. The economic loss has been estimated at about $US 200 billion.

The last event Father Blaire forsaw was the terror attack on the World Trade Center.`}</Pre>

            <Heading>Screenwriting Framework Note</Heading>
            <Pre>{`NOTE: "A movie, I think, is really only four or five moments between two people; the rest of it exists to give those moments their impact and resonance. The script exists for that. Everything does." - Robert Towne

When breaking down a film's structure, generally speaking, "The Eight Sequences" framework is the standard: two in Act One, four in Act Two, and two in Act Three.

But the number 8 is only part of the equation. If the sequences are what shape a screenplay's three-act structure, then the five major plot points are the building blocks behind sequence construction: Inciting Incident, Lock In, Midpoint, Main Culmination, and Third Act Twist.`}</Pre>

            <Heading>Power Assignment Note</Heading>
            <Pre>{`NOTE: In this version, the power assignments differ from earlier drafts:

• Michael is the Heart of Christ with the ability to heal others and change the mass, density and chemical composition of matter.
• Simon is the Hand of Christ: Simon has super strength, invulnerability, and an iron will. Simon, because he has heart, never quits and never gives up.

In the September 2019 draft (Page 5), the assignments are reversed: Simon is the Hand (healing) and Michael's Gift is resurrection. This discrepancy reflects the evolving nature of the story across drafts.`}</Pre>
          </PageSection>
        )}

        {/* Page 17 — Revised Act Structure & Alternate Act 3 */}
        {visibleIds.has("coa-page-17") && (
          <PageSection id="coa-page-17" title="Page 17 — Revised Act Structure & Alternate Act 3">
            <Heading>Act I</Heading>
            <Pre>{`Father Blaire places the children with families who are loyal to the cause to raise the children and keep them safe. Once their powers begin to emerge, Father Blaire collects them and brings them to the compound. There, they train them in the use of their powers which reveal which of Christ's attributes each has an affinity for.

Ryoko (Jamie Chung) is the Head of Christ. She has telekinesis. She is also able to use psychometric abilities to read the history of objects and people to read their past and see their future.
Michael is the Heart of Christ with the ability to heal others and change the mass, density and chemical composition of matter.
Simon is the Hand of Christ: Peter has super strength, invulnerability, and an iron will. Simon, because he has heart, never quits and never gives up.

The Catalyst:
A miracle has been detected. Father Blaire and the Trinity go to investigate. A huge battle between the Trinity and the Illuminati take place. They believe they have found the Christ child, a teenage boy named.`}</Pre>

            <Heading>Act 2: pt1</Heading>
            <Pre>{`-The Trinity learn about their powers, the world around them, and Michael
-Simon has been sneaking out to see some girl.
-Strange things that happen around the compound that lead some to believe that Michael may, instead, be the anti-Christ.`}</Pre>

            <Heading>Act 2: pt 2 — Midpoint Culmination</Heading>
            <Pre>{`Father Blaire and the Trinity rescue Michael when The Illuminati, who have infiltrated the compound, attempt kidnap Michael. Michael is able to use some of the same abilities that the Trinity use, but mostly by accident to serendipitously save himself and an unconscious Father Blaire several times over. Michael, doubting himself, is not sure whether he is Christ or Anti-Christ, all he know is that he needs to do the right thing and save the Priest who saved him.`}</Pre>

            <Heading>ACT 3 — Alternate Version: Simon's Betrayal</Heading>
            <Pre>{`Simon is being told by Madeline that he is "The Chosen". Simon kills Michael at the "all is lost" moment. Michael comes back from the dead and using all of the powers of the Trinity, is able to stop the chosen from initiating their takeover.

NOTE: This is an alternate Act 3 that differs from the primary version (Page 7). In the primary version, the climax centers on the Lance of Longinus quest and Father Blaire's crisis of faith. In this version, Simon is manipulated by Madeline into believing he is "The Chosen" (the Anti-Christ), creating a betrayal-from-within climax that is resolved by Michael's resurrection power.`}</Pre>
          </PageSection>
        )}

        {/* Page 18 — Subplots */}
        {visibleIds.has("coa-page-18") && (
          <PageSection id="coa-page-18" title="Page 18 — Subplots: Simon/Madeline & Blaire Flashbacks">
            <Heading>SUBPLOT 1 — Simon & Madeline</Heading>
            <Pre>{`Simon and Madeline are confronted by bigots who don't agree with their interracial relationship. They jump Simon, not expecting him to be a master of Kung Fu. One punk gets a shot off with a gun and hits Madeline. Simon and the punk desperately try to save her. Simon's healing powers aren't working on Madeline at first.`}</Pre>

            <Heading>SUBPLOT 3 — Father Blaire Flashbacks</Heading>

            <Heading>Africa 1790</Heading>
            <Pre>{`Warrior Ajuta Ba'air chases down and overtakes a slave ship to in order to liberate the last of his family, but his younger brother dies.`}</Pre>

            <Heading>Tibet 1868</Heading>
            <Pre>{`Learns the ways of eastern mysticism to learn to read the scrolls; his first encounter with the Illumaniti; his Sage dies.`}</Pre>

            <Heading>Great Britain 1912</Heading>
            <Pre>{`Downton Abbey setting where the First Christ Child's mother is found and is killed before "Alistare Blaire" can save her.`}</Pre>

            <Heading>NYC 1961</Heading>
            <Pre>{`A wealthy land developer and his stepson (David) (late wife passed away) wage a secret war against remnants of the 3rd Reich in America. Allistare Blaire approaches them because he believes the stepson is the vessel of Christ. Allistare accompanies them on their final battle with the final boss, they are able to stop the illuminati's evil plan but David dies in the process.`}</Pre>

            <Heading>September 1993</Heading>
            <Pre>{`Now a priest, Father Blaire seeks out an FBI agent and his partner who's child was abducted by Aliens. During a confrontation with the Aliens, Father Blaire is transported aboard their ship where he finds the child, but it is too late. She has already been assimilated and is turning. A physical transformation is occurring. The child grabs father Blaire and connects with his mind. He is given visions of the Trinity, three heralds who will use the powers of Christ until the Christ child can defend itself. Father Blair is able to fight his way off the ship before it warps off into hyperspace.`}</Pre>
          </PageSection>
        )}

        {/* Page 19 — The Gathering of the Three */}
        {visibleIds.has("coa-page-19") && (
          <PageSection id="coa-page-19" title="Page 19 — The Gathering of the Three">
            <Heading>SUBPLOT 2 — The gathering of the "Three"</Heading>

            <Heading>Rwanda — 1994</Heading>
            <Pre>{`Father Allistar Blaire and a crew of mercenaries are on a mission to rescue one child. In the spirit of Saving Private Ryan meets Predator, the mercs begin to fall one-by-one until only Father Blaire, a junior merc, and the child, Simon, are left. The merc dies getting Father Blaire and the child to the plane just in time.`}</Pre>

            <Heading>Kobe, Japan — 1995</Heading>
            <Pre>{`Father Blaire is trying to convince a couple to leave Japan with him. He warns them that the end is near. They refuse, the Earthquake begins. Father Blaire is able to make it back to the apartment, but not in time to save the parents. Father Blaire, finds the child, Ryoko, in a crib and shields her from the falling rubble with his own body. Debris is falling all around them. When the dust clears, it is revealed that Father Blaire is being protected by a TK shield. the baby is looking up at him giggling.`}</Pre>

            <Heading>Manhattan, NY — 2001</Heading>
            <Pre>{`A female executive is in labor. She and a firefighter are trapped in a room. He dies while telling her to push when a giant beam falls on him.

Alone, fire everywhere, the woman feels that all is lost. Then, Father Blaire is there, suddenly, telling her to push. She does. Two other children are with Father Blaire, one, Ryoko, is holding up rubble and steel telekinetically. The other child, Simon, places his hand on the woman's forehead and she no longer feels any pain.

The child is born. Father Blaire grabs a softball sized orb, a pearl which turns from white to bright blue and the five of them seem to teleport out before tower falls.

On a rooftop close by, the mother holds her child once, tells him that his name is Peter and that he isn't a mistake, he is a miracle, then she dies.`}</Pre>
          </PageSection>
        )}

        {/* Page 20 — Dramatic Questions, September 1993 & World-Building */}
        {visibleIds.has("coa-page-20") && (
          <PageSection id="coa-page-20" title="Page 20 — Dramatic Questions, September 1993 & World-Building">
            <Heading>Dramatic Questions</Heading>
            <Pre>{`Q 1: Who wants what from who?
Father Blaire wants Michael to take up the mantel of Christ and stop the illumaniti from bringing about the apocalypse.

Q 2: What are they willing to do to get it?
Father Blaire is willing to sacrifice his life and everyone else's to see "The Second" fulfil his destiny.

Q3: Why NOW?
Father Blaire has been given the tools for success, The Trinity and the Illumaniti now have the "The Chosen" (The Anti-Christ) which brings them closer to fulfilling THEIR goal.`}</Pre>

            <Heading>September 1993 — Expanded</Heading>
            <Pre>{`Father Blaire approaches Special Agent Max Snyder. He tell him that he can help him find his son. Max's partner, Shana Humphrey is the child's mother and is equally concerned but more than skeptical of what Father Blaire's true motivates and intentions are.

Father Blaire explains that their child is indeed special, but not in the way they think. She was taken by an alien race called the Draconians. These Aliens are part of a larger scheme to halt or delay the second coming.

"second coming?" Max says with a puzzled look on his face.

"He's talking about Christ" Shana says as we then focus on the cross around her neck, denoting that she is, indeed, a woman of some faith.

"You're telling me that our daughter is Jesus Christ", max says

"Jesus was the last known conduit to reach maturity, but, yes, Samantha is the Christ Child and we have to find the ship she is on before the Draconians find a way to harness her power and use it to their own ends..."

"And just how are we supposed to track down an alien spacecraft...it not like the entire planet hasn't been looking since the Roswell crash..." shana says

"Yeah, their not know to register their intergalactic plates with the DMV" Max says

"With this." Father Blaire says, and suddenly a spaceship appears overhead, shining a beam of light down on them.

"The Draconians aren't the only other species on this Planet...or did I fail to mention that before?`}</Pre>

            <Heading>World-Building Notes</Heading>
            <Pre>{`Father Blaire's Resurrection Mechanic:
Father Blaire dies, is buried for three days and rises again. Has to be buried in consecrated ground.

Children of Aquarius — Cosmic Function:
The function of the Christ Child is to reset the Piscean age. This world, if allowed to pass into the age of Aquarius, will be become a world of intergalactic conquerors. It is too soon for them to have this technology.
The Christ child does this, destroys the world, by giving humans all knowledge.

Lance of Longinus — Alternate Version:
The Children of Aquarius are on a quest to find the lance of Longinus.
Upon retrieving it, they soon learn that it will not kill the Christ child. They learn it was never the lance but the believe who lost his faith that can drive the Christ Entity from its corporal form.
Father Blaire has to be the one to lose his faith and betray the Christ child to stop the Apocalypse.

Michael: "Blaire, you don't want to destroy the world. You wanted to destroy the wicked. The ones who took your family away from you. Who took your brother.
Come with me. End this."

NOTE: This version of the Lance of Longinus dialogue omits the "Who took my mother" line present in the primary version (Page 7), suggesting this was an earlier draft of the climactic exchange.`}</Pre>
          </PageSection>
        )}

        {/* Page 21 — Children of Aquarius: Season Two */}
        {visibleIds.has("coa-page-21") && (
          <PageSection id="coa-page-21" title="Page 21 — Children of Aquarius: Season Two (8 Episodes)">
            <Pre>{`Children of Aquarius: Season Two (V2)

Limited Series – 8 Episodes
Genre: Sci-Fi, Action, Drama
Format: 8 Episodes, 1 Hour Each`}</Pre>

            <Heading>Episode 1: "The Sky is Falling"</Heading>
            <Pre>{`Cold Open:
A charter plane is caught in heavy turbulence. Inside, Paul Anderson and his wife, Theresa Anderson, struggle to control the aircraft while their young sons, Adam and Jonathan, remain strapped in their seats.

Suddenly, a flash of light fills the cabin. Outside, alien craft appear, pacing the plane and surrounding it. Grey extraterrestrials materialize inside the cockpit, stating that they have come for Paul. They claim he has a bounty on his head, placed by Emperor Raysun, who seeks vengeance against his former captor.

Revelation: Years ago, Paul Anderson was involved in a top-secret SAP (Special Access Program) tasked with retrieving alien spacecraft. During one such mission, Raysun, then a young Nerrian warrior, crashed on Earth while being pursued by another alien faction.

Present Day:
Adam dreams of Raysun, haunted by visions of the alien ruler. Years later, his mother reaches out to him telepathically from across the galaxy, revealing that his brother Jonathan is alive. Adam's mission becomes clear—find Jonathan. Even after being taken in by Father Alistare Blaire, Adam continues his search.`}</Pre>

            <Heading>Episode 2: "The Beast Within"</Heading>
            <Pre>{`Blaire's First Students:
Adam is the first student to join Father Blaire's school. Mackenzie Connelly is the second.

Mackenzie's Struggles:
Mackenzie battles body dysmorphia and an overactive mind that races ahead of the world around him. He finds solace in science, using his genius to design and construct specialized gauntlets for Adam, allowing him to channel and refine his solid light blasts with extreme precision.`}</Pre>

            <Heading>Episode 3: "The Angel's Burden"</Heading>
            <Pre>{`Barrington Cartwright becomes Blaire's third student.

A Life of Duality:
Barrington lives in two worlds—one as a privileged high-society heir, the other as a hybrid outcast. He hides his abilities from his bigoted boarding school friends, fearing rejection.

Finding Perspective:
Seeing Mackenzie's work with Adam, Barrington asks for a way to control his powers, which allow him to change the properties of physical matter. Mackenzie engineers a device to help him stabilize the transformation process, but it is classmate Colby Rush who shifts Barrington's outlook.

"I wish we could trade," Colby admits. "These big feet for those hands."

The comment forces Barrington to reconsider his self-loathing—perhaps his abilities are a gift, not a burden.`}</Pre>

            <Heading>Episode 4: "Breaking the Ice"</Heading>
            <Pre>{`Colby Rush joins as the fourth student.

Power Struggles:
Unlike the others, Colby embraces his abilities with enthusiasm, but his excitement turns to fear as he realizes his powers are growing unstable. His ability to exist in multiple dimensions simultaneously starts causing unexpected anomalies, warping reality around him.

Mackenzie develops a device to help him anchor his presence in a single plane of existence, preventing reality from collapsing around him.`}</Pre>

            <Heading>Episode 5: "The Fire Within"</Heading>
            <Pre>{`Samantha Sanderson arrives as Blaire's fifth and final student.

Grief and Psychic Horror:
Samantha is haunted by the death of her closest friend, a tragedy worsened by an accidental telepathic link she formed as the friend was dying.

However, her abilities extend beyond simple telepathy. Samantha can move objects with her mind and communicate across vast distances. But she has also been speaking to interdimensional entities—beings that even Blaire cannot perceive. She talks to The Source, the Vanier, Eternity, Chaos and Order, the In-Betweener, and Kinslayer.

Blaire's Revelation:
Mackenzie develops a helmet that allows Blaire to tune into Samantha's unique psionic frequency. When he dons the device, he finally sees the cosmic beings Samantha has been communicating with.

They turn and look at him.

Blaire, realizing they have now become aware of him, rips the helmet off in sheer terror.`}</Pre>

            <Heading>Episode 6: "The Kidnapping"</Heading>
            <Pre>{`Just as Blaire begins training his students to control their abilities as a team, they are abducted by the Nerrian Empire—right before his eyes.

Raysun's Revenge:
Raysun has brought the young Children of Aquarius to Helotia, the capital of the Nerrian Galaxy, seeking revenge on Paul Anderson by making his son suffer.

The Imperial Guard:
The students find themselves facing seasoned Nerrian warriors—the Emperor's elite enforcers. Outclassed and outmatched, they must learn to work together to escape.

Adam's Tragic Discovery:
During the chaos, Adam learns that his mother died years ago—she stole a Nerrian ship and launched a suicidal assault on Raysun's stronghold in an attempt to kill him.`}</Pre>

            <Heading>Episode 7: "The Legacy of Paul Anderson"</Heading>
            <Pre>{`The Truth About Adam's Father:
Years after being captured, Paul Anderson escaped a Nerrian prison with three fellow inmates. They stole a ship and attempted to return to Earth.

However, one of his companions possessed a device that could locate their closest genetic relative—a tool meant to guide lost travelers home.

The Time Displacement Incident:
Upon reaching Earth, they discovered that 3,000 years had passed due to an error in their method of space travel.

Adam's closest relative? Jonathan Anderson.

Adam and his father later theorize that Jonathan isn't just a distant descendant—he is likely Adam's own son, transported into the far future as a baby.

Escape and Divine Intervention:
With no means to return home, Samantha seeks help from her "friends."

Albion, a Vanier, intervenes, transporting the Children of Aquarius from the Nerrian Galaxy back to Earth via singularity.`}</Pre>

            <Heading>Episode 8: "Homecoming" (Season Cliffhanger)</Heading>
            <Pre>{`The Children of Aquarius return home just in time to witness Blaire preparing for war.

The 7 seals are the 7 nuclear powers. The Christ child means to trigger them all.
The Christ child says "they forged the sword of their own annihilation."
Adam: Nuclear…

Blaire's Response:
Determined to rescue his students, Blaire has gathered a team of experienced hybrids to launch a counteroffensive into space.

His new team consists of:
• Shadow – a being who can slip in and out of shadows
• Able Wright – a tactical genius capable of analyzing any opponent's weakness and exploiting it
• Simon Olatunji – a powerhouse with super strength and near-invulnerability
• Ryoko Tsurayaba – a fierce telekinetic warrior

As Blaire and his new recruits prepare to depart for Helotia, the original team returns, battered and forever changed.

End of Season Two.`}</Pre>
          </PageSection>
        )}

        {/* Page 22 — Season One Critical Notes */}
        {visibleIds.has("coa-page-22") && (
          <PageSection id="coa-page-22" title="Page 22 — Season One Critical Notes">
            <Heading>Series Title Framing</Heading>
            <Pre>{`Terrans

Children of Aquarius: Book One

"The Beginner's Guide to Destroying the World"`}</Pre>

            <Heading>Father Blaire's Resurrection</Heading>
            <Pre>{`Father Blaire dies, is buried for three days and rises again. Has to be buried in consecrated ground.`}</Pre>

            <Heading>The Function of the Christ Child</Heading>
            <Pre>{`Children of Aquarius

The function of the Christ Child is to reset the Piscean age. This world, if allowed to pass into the age of Aquarius, will become a world of intergalactic conquerors. It is too soon for them to have this technology.

The Christ child does this, destroys the world, by giving humans all knowledge`}</Pre>

            <Heading>The Office of the President</Heading>
            <Pre>{`The Office of the President of the United States has become little more than a target for wannabe journalists looking to make a name for themselves and old hack gunning for a Pulitzer Prize.`}</Pre>

            <Heading>Technology Fragment</Heading>
            <Pre>{`The combination of quantum computing, AI and gene editing…`}</Pre>

            <Heading>The Source</Heading>
            <Pre>{`When the Christ Child's feet touch hallowed ground he will have full access to the Source.

Our power doesn't come from the Christ Child, it comes from the Source.

The Source is an inter-dimensional enigma. It is what you call "God".

Our brains are not complex enough to comprehend what the Source is, so, through Anthropomorphism our ancestors personified the Source by attributing it to the highest being in human hierarchy, the Father of all fathers, the King of all Kings and called him "God".`}</Pre>

            <Heading>The Trinity & The Conduits</Heading>
            <Pre>{`The Trinity are born again in the midst of great tragedies: The Rwandan Massacre of 1994, The Hamadan Earthquake of 1995, and the Mass School Shooting of 2029.

Simon was the First Conduit, Ryoko was the Second Conduit. Father Blaire tells Michael that he waited a long time for the Third Conduit to appear, and Michael is the Third.`}</Pre>
          </PageSection>
        )}

        {/* Issue One Script */}
        {visibleIds.has("coa-issue-1") && <CoAIssueOneScript />}

        {/* Issue Two Script */}
        {visibleIds.has("coa-issue-2") && <CoAIssueTwoScript />}

        {/* Story Plan */}
        {visibleIds.has("coa-story-plan") && <ChildrenOfAquariusStoryPlan />}
      </main>
    </div>
  );
};

