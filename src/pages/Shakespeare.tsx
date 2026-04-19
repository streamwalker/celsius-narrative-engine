import { Link } from "react-router-dom";
import { ArrowLeft, BookOpen, Feather, Theater, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection, Pre, Heading } from "@/components/story-page-helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  { id: "reading", label: "Reading Shakespeare", icon: BookOpen },
  { id: "writing", label: "Writing Shakespeare", icon: Feather },
  { id: "appreciating", label: "Appreciating Shakespeare", icon: Theater },
  { id: "performing", label: "Performing Shakespeare", icon: Mic },
];

export default function Shakespeare() {
  return (
    <div className="min-h-screen astralnaut-bg text-foreground">
      {/* Header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="container max-w-5xl mx-auto flex items-center gap-4 py-4 px-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          <h1 className="text-sm font-comic tracking-[0.2em] text-primary uppercase">Shakespeare</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="relative gradient-sunrise star-field flex flex-col items-center justify-center text-center px-4 py-24">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">A Guide to</p>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-comic tracking-[0.12em] text-glow text-primary mb-4">
          SHAKESPEARE
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg">
          Read it. Write it. Feel it. Perform it.
        </p>
      </section>

      <main className="container max-w-5xl mx-auto px-4 pb-20 -mt-6 relative z-10 space-y-10">
        {/* Table of Contents */}
        <nav id="table-of-contents" className="glass-panel border-glow rounded-lg p-6">
          <h2 className="text-lg font-comic tracking-[0.15em] text-accent uppercase mb-4">Table of Contents</h2>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map((s, i) => {
              const Icon = s.icon;
              return (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById(s.id)?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded hover:bg-white/[0.04]"
                  >
                    <Icon className="w-4 h-4 text-accent" />
                    <span className="text-accent mr-1">{i + 1}.</span> {s.label}
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ──────────────────────────── 1. READING ──────────────────────────── */}
        <PageSection id="reading" title="1 · Reading Shakespeare">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="early-modern" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Understanding Early Modern English
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Shakespeare wrote in Early Modern English — not Old English, not Middle English. Most of his vocabulary is still in use; the challenge is unfamiliar grammar.

Key patterns:
• Thou / Thee — informal "you" (subject / object). "Thou art" = you are.
• Thy / Thine — your / yours. "Give me thy hand."
• Verb endings — -est (2nd person: "thou knowest"), -eth (3rd person: "he hath").
• Inverted syntax — verb before subject for emphasis: "Speaks he the truth?" instead of "Does he speak the truth?"
• Double negatives — intensify rather than cancel: "I will not budge for no man's pleasure."

Once you internalise these patterns, 90 % of Shakespeare opens up.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="glossary" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Glossary of Common Archaic Words
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`anon — soon, shortly
art — are (with "thou")
ay — yes
betwixt — between
doth — does
ere — before
fain — gladly, willingly
fie — an exclamation of disgust
forsooth — in truth, indeed
hark — listen
hence — from here
hither — to here
marry — a mild oath (by the Virgin Mary)
methinks — it seems to me
nay — no
prithee — I pray thee (please)
sirrah — form of address to an inferior
thither — to there
verily — truly
whence — from where
wherefore — why (NOT "where")
withal — in addition, with
woe — grief, sorrow`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pentameter-reading" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                How to Parse Iambic Pentameter Line by Line
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Iambic pentameter is the heartbeat of Shakespeare's verse: five pairs of syllables per line, each pair going da-DUM (unstressed-stressed).

Example — Romeo and Juliet (II.ii):
  "But SOFT, what LIGHT through YON-der WIN-dow BREAKS?"
   da  DUM   da   DUM     da  DUM  da   DUM  da  DUM

Steps:
1. Count syllables — aim for 10.
2. Mark the natural stresses of each word.
3. See where Shakespeare matches or breaks the pattern.
4. Breaks are intentional — a stressed first syllable ("BREAKS") can signal urgency.

Tip: Don't force a mechanical beat. The tension between natural speech rhythm and the underlying meter is what makes the verse alive.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="reading-tips" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Tips for Reading Aloud
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`1. Read it aloud — always. Shakespeare wrote for the ear, not the page.

2. Follow the punctuation, NOT the line breaks.
   A line ending without punctuation means the thought continues — don't pause there.

3. If a sentence runs across three lines, read it as one flowing thought.

4. Emphasise antithesis (opposites placed side by side):
   "To BE or NOT to be" — the contrast carries the meaning.

5. Look for lists and build them:
   "Tomorrow and tomorrow and tomorrow" — each repetition adds weight.

6. Don't worry about understanding every word on the first pass. Get the shape of the speech; meaning follows.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────────────────── 2. WRITING ──────────────────────────── */}
        <PageSection id="writing" title="2 · Writing Shakespeare">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="what-is-ip" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                What Is Iambic Pentameter?
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Iambic pentameter = five iambs per line.
An iamb = one unstressed syllable followed by one stressed syllable (da-DUM).

  da-DUM da-DUM da-DUM da-DUM da-DUM
  "Shall I | com-PARE | thee TO | a SUM | mer's DAY?"

Five beats. Ten syllables. That's it.

Why this meter? It's the closest English gets to natural speech rhythm. We say "a-BOUT," "be-LIEVE," "to-DAY" — all iambs. Shakespeare just lined them up.

Variations to learn:
• Trochee (DUM-da) — inverts the first foot for impact: "ONCE more | un-TO | the BREACH"
• Feminine ending — an extra unstressed syllable at the end: "To BE | or NOT | to BE | that IS | the QUES-tion" (11 syllables)
• Caesura — a pause mid-line, often marked by punctuation: "To die, | to sleep — | no more"`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sonnet-form" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                The Shakespearean Sonnet
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`14 lines of iambic pentameter.

Structure:
  Quatrain 1 (lines 1–4)   — ABAB — introduce the subject
  Quatrain 2 (lines 5–8)   — CDCD — develop or complicate
  Quatrain 3 (lines 9–12)  — EFEF — twist or deepen
  Couplet (lines 13–14)     — GG   — resolve, surprise, or subvert

Example — Sonnet 18:
  Shall I compare thee to a summer's day?    A
  Thou art more lovely and more temperate.    B
  Rough winds do shake the darling buds of May, A
  And summer's lease hath all too short a date. B
  …
  So long as men can breathe or eyes can see,  E
  So long lives this, and this gives life to thee. F → couplet resolves everything.

The volta (turn) usually arrives at line 9 or 13 — the moment the poem shifts direction.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rhetoric" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Rhetorical Devices Shakespeare Favoured
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`1. Antithesis — placing opposites side by side:
   "Fair is foul, and foul is fair."

2. Metaphor — direct comparison without "like" or "as":
   "All the world's a stage."

3. Wordplay (puns) — multiple meanings at once:
   "Ask for me tomorrow and you shall find me a grave man." (Mercutio, dying)

4. Anaphora — repeating a word at the start of successive lines:
   "This royal throne of kings, this sceptred isle, this earth of majesty…"

5. Personification — giving human traits to abstract ideas:
   "Death, that hath sucked the honey of thy breath."

6. Hendiadys — expressing one idea with two nouns joined by "and":
   "The slings and arrows of outrageous fortune" (= fortune's outrageous slings).`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="exercises" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Writing Exercises
              </AccordionTrigger>
              <AccordionContent>
                <Heading>Exercise 1 — Write a Couplet</Heading>
                <Pre>{`Two lines of iambic pentameter that rhyme. Topic: something you saw today.
Example: "The morning train departs without a sound, / and leaves me standing on the frozen ground."`}</Pre>

                <Heading>Exercise 2 — Write a Quatrain</Heading>
                <Pre>{`Four lines, ABAB rhyme scheme. Topic: a person you admire.
Try to include one antithesis (contrasting pair).`}</Pre>

                <Heading>Exercise 3 — Write a Full Sonnet</Heading>
                <Pre>{`Follow the ABAB CDCD EFEF GG structure. 14 lines. Iambic pentameter.
Topic: something you've lost, or something you hope for.
Remember: the couplet must surprise or resolve. It's the punchline.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────────────────── 3. APPRECIATING ──────────────────────────── */}
        <PageSection id="appreciating" title="3 · Appreciating Shakespeare">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="context" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Historical Context: The Elizabethan Theatre
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Shakespeare worked in a very specific world:

• The Globe Theatre (1599) — open-air, 3,000 capacity. Groundlings stood in the pit for a penny.
• No sets — language had to paint the scene ("But look, the morn in russet mantle clad…").
• No lighting — afternoon performances. Night scenes were acted in broad daylight.
• All-male casts — boys played women. This adds layers to comedies where women disguise as men (Viola, Rosalind).
• The audience talked, ate, threw things. Plays had to grab attention fast.

Shakespeare was a shareholder in his company (the Lord Chamberlain's Men, later the King's Men). He wrote for specific actors and a specific space — always practical, never merely literary.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="themes" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Universal Themes
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Why does Shakespeare still matter? Because the themes are inescapable:

• Power & corruption — Macbeth, Richard III, Julius Caesar
• Jealousy & trust — Othello, The Winter's Tale
• Love & desire — Romeo and Juliet, A Midsummer Night's Dream, Twelfth Night
• Identity & self-knowledge — Hamlet, King Lear, As You Like It
• Ambition & consequence — Macbeth, Coriolanus
• Justice & mercy — The Merchant of Venice, Measure for Measure
• Appearance vs. reality — Much Ado About Nothing, The Tempest

Every play asks: What does it cost to be human?`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="how-to-watch" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                How to Watch or Read a Play
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Folio vs. Quarto:
• Quarto — individual play editions published during Shakespeare's lifetime (varying quality).
• First Folio (1623) — the collected works, published after his death by colleagues. The definitive source for 18 plays that survive nowhere else.

Reading tips:
• Read stage directions carefully — they reveal action Shakespeare trusted to the actors.
• Soliloquies are the character thinking aloud TO the audience. They're invitations into a mind.
• Prose vs. verse — lower-class characters often speak prose; nobles speak verse. When a noble drops into prose, something has shifted.
• Watch a performance first, then read. Or: read a scene, then watch it performed. The two experiences feed each other.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="starting-plays" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Recommended Starting Plays by Genre
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Comedy:
• A Midsummer Night's Dream — magic, chaos, and love in the woods
• Much Ado About Nothing — the original rom-com; Beatrice and Benedick are electric
• Twelfth Night — gender, disguise, and melancholy wrapped in laughter

Tragedy:
• Macbeth — the shortest, fastest, most intense. Start here.
• Hamlet — the big one. Take your time.
• Othello — intimate, devastating, driven by one villain's manipulation

History:
• Henry V — patriotism, war, leadership, and doubt
• Richard III — Shakespeare's greatest villain before Iago

Romance (Late Plays):
• The Tempest — magic, forgiveness, and farewell. Shakespeare's last solo play.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────────────────── 4. PERFORMING ──────────────────────────── */}
        <PageSection id="performing" title="4 · Performing Shakespeare">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="speaking-verse" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Speaking the Verse: Breath, Stress & the Iambic Line
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`The line is a unit of breath. Shakespeare gives you roughly one thought per line, and the line length matches a comfortable breath.

Rules of thumb:
1. Breathe at the end of a line ONLY if there's punctuation.
2. If there's no punctuation (enjambment), carry the thought into the next line without pausing.
3. Stress the operative words — usually the ones that carry new information.
4. Let the meter support you, not constrain you. It's a rhythm beneath the speech, like a bass line.

Exercise: Take any speech. Mark the end-stops (lines ending with punctuation) and enjambments. Read it aloud, breathing only at end-stops. Notice how the pace changes.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="acting-clues" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Acting Clues Hidden in the Text
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Shakespeare embedded stage directions in the verse itself:

• Short lines (fewer than 10 syllables) — indicate a pause, a moment of silence, or a shared line with another character. Something happens in that gap.

• Shared lines — when two characters complete one line of pentameter between them, the cue is rapid: no pause. The second speaker picks up instantly.
  JULIET: "Good night, good night! Parting is such sweet sorrow—"
  ROMEO: "—That I shall say good night till it be morrow."

• Prose vs. verse shifts — if a character who normally speaks verse suddenly drops into prose, they may be mad (Hamlet), drunk (Cassio), or speaking to someone of lower status.

• Repeated words — when a character repeats a word, they're stuck on it emotionally.
  "Never, never, never, never, never." — Lear, holding Cordelia's body.

• Lists that build — Shakespeare piles images when a character is overwhelmed:
  "To die, to sleep — to sleep, perchance to dream…"`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="soliloquy" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Soliloquy Technique: Who Is the Character Talking To?
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`A soliloquy is not a monologue delivered to empty air. The character is always talking TO someone:

Options:
1. The audience — sharing a plan, seeking complicity ("Now is the winter of our discontent…" — Richard III recruits us).
2. Themselves — wrestling with a decision ("To be or not to be" — Hamlet is alone with his thoughts).
3. God or the cosmos — appealing to something larger ("Is this a dagger which I see before me?" — Macbeth, on the edge).
4. An absent person — addressing someone who can't hear ("O Romeo, Romeo, wherefore art thou Romeo?" — Juliet speaks to the night).

The choice of audience changes everything about how you perform the speech. Decide who you're talking to before you begin.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rehearsal" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Practical Tips for Rehearsal & Memorisation
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`1. Learn the thoughts, not the words. Understand what each sentence means; the language follows.

2. Chunk by punctuation. Each sentence is a beat. Master one beat before moving to the next.

3. Write it out by hand — studies show handwriting improves retention.

4. Speak it in your own words first, then translate back to Shakespeare's. This ensures you know the meaning.

5. Rehearse with movement — walk, gesture, sit, stand. The body remembers what the mind forgets.

6. Record yourself and listen back. You'll catch rhythms you miss when reading silently.

7. Run the speech at triple speed — gabble it. Then slow down to performance pace. This frees you from over-thinking individual words.

8. Final test: can you perform it while doing something else (folding laundry, walking)? If yes, it's in your bones.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>
      </main>
    </div>
  );
};

