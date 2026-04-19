import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Pen,
  Clapperboard,
  Camera,
  Film,
  Briefcase,
  Paintbrush,
  Music,
  BookOpen,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageSection, Pre, Heading } from "@/components/story-page-helpers";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const sections = [
  { id: "screenwriting", label: "Screenwriting", icon: Pen },
  { id: "directing", label: "Directing", icon: Clapperboard },
  { id: "cinematography", label: "Cinematography", icon: Camera },
  { id: "editing", label: "Editing & Post-Production", icon: Film },
  { id: "producing", label: "Producing", icon: Briefcase },
  { id: "production-design", label: "Production Design & Art Direction", icon: Paintbrush },
  { id: "sound", label: "Sound & Music", icon: Music },
  { id: "history", label: "Film History, Theory & Critical Studies", icon: BookOpen },
];

export default function FilmSchool() {
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
          <h1 className="text-sm font-comic tracking-[0.2em] text-primary uppercase">Film School</h1>
        </div>
      </header>

      {/* Hero */}
      <section className="relative gradient-sunrise star-field flex flex-col items-center justify-center text-center px-4 py-24">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">The Complete Curriculum</p>
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-comic tracking-[0.12em] text-glow text-primary mb-4">
          FILM SCHOOL
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
          NYU Tisch · USC · AFI · UCLA · Chapman · UT Austin — combined into one program.
        </p>
      </section>

      <main className="container max-w-5xl mx-auto px-4 pb-20 -mt-6 relative z-10 space-y-10">
        {/* Table of Contents */}
        <nav id="table-of-contents" className="glass-panel border-glow rounded-lg p-6">
          <h2 className="text-lg font-comic tracking-[0.15em] text-accent uppercase mb-4">Departments</h2>
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

        {/* ──────────────── 1. SCREENWRITING ──────────────── */}
        <PageSection id="screenwriting" title="1 · Screenwriting">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="story-structure" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Story Structure
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Every screenplay is an argument about structure. The dominant models:

THREE-ACT STRUCTURE (Syd Field)
Act I (Setup, ~25%) — Introduce the protagonist, their world, and the dramatic question. Ends with the Inciting Incident (sometimes called the Catalyst) and a turning point that launches Act II.
Act II (Confrontation, ~50%) — Rising obstacles, escalating stakes. The midpoint shifts the protagonist from reactive to proactive (or vice versa). Ends with the "All Is Lost" moment.
Act III (Resolution, ~25%) — Climax answers the dramatic question. Denouement shows the new normal.

SAVE THE CAT BEATS (Blake Snyder)
1. Opening Image — a snapshot of the "before" world.
2. Theme Stated — someone says what the movie is really about (often unknowingly).
3. Setup — establish the hero's flaws and stakes.
4. Catalyst — the event that upends everything.
5. Debate — the hero resists the call.
6. Break into Two — the hero commits to the journey.
7. B Story — often the love interest or mentor; carries the theme.
8. Fun and Games — the "promise of the premise." This is why the audience bought the ticket.
9. Midpoint — false victory or false defeat. Stakes rise.
10. Bad Guys Close In — external pressure and internal doubts converge.
11. All Is Lost — the lowest point.
12. Dark Night of the Soul — the hero processes the loss.
13. Break into Three — a new idea or piece of information sparks the final push.
14. Finale — the hero applies everything learned; the climax.
15. Final Image — mirrors the Opening Image, showing transformation.

SEQUENCE APPROACH (Frank Daniel / USC)
Divide the screenplay into 8 sequences of roughly 12-15 minutes each. Each sequence has its own internal tension and resolution, creating momentum independent of act breaks. This is how USC structures its first-year curriculum.

These aren't competing systems — they're different lenses on the same underlying principles: setup, escalation, crisis, resolution.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="character-dev" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Character Development
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`WANT VS. NEED
The want is conscious — what the character pursues (the gold, the girl, the title). The need is unconscious — what the character must learn or become to be whole. The gap between want and need is the engine of character arc.

Example: In "The Social Network," Mark Zuckerberg wants status and validation. He needs genuine human connection. He gets the want; he loses the need.

FLAWS
A flaw is not a quirk. It's a moral or psychological limitation that causes the character to make bad decisions. Without a meaningful flaw, there's no arc — just a competent person solving problems.

Categories of flaws:
• Moral (selfishness, cowardice, cruelty)
• Psychological (denial, obsession, fear of intimacy)
• Worldview (naivety, cynicism, blind idealism)

CHARACTER ARC
Positive arc: character overcomes the flaw. (Most common.)
Negative arc: character succumbs to the flaw. (Tragedy: Macbeth, There Will Be Blood.)
Flat arc: character doesn't change — they change the world around them. (Indiana Jones, James Bond.)

BACKSTORY
Backstory is not story. It's the iceberg under the surface. Reveal only what the present-tense scene demands. The audience should feel there's more than you're showing.

EXERCISE: Write a one-page character biography. Then cross out everything the audience will never need to know. What remains is usable backstory.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="dialogue" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Dialogue Craft
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`SUBTEXT
Characters rarely say what they mean. Real dialogue is two conversations: the surface (what's said) and the undercurrent (what's meant). 

In "Casablanca," when Ilsa says "Play it, Sam," she's not requesting a song — she's reopening a wound.

Rules:
• If a character says exactly what they feel, you're writing on-the-nose dialogue. Rewrite.
• Subtext comes from the gap between what a character says and what they do.

EXPOSITION
The hardest skill. The audience needs information, but they must never feel "informed." Techniques:
• Conflict-driven: embed exposition in an argument (Aaron Sorkin's method).
• Visual: show, don't tell. A cluttered apartment tells us about the character without a word.
• Dramatic irony: the audience knows something the character doesn't, so exposition becomes tension.

VOICE
Every character should sound distinct. Test: cover the character names. Can you tell who's speaking? If not, the voices are interchangeable.

How to differentiate voice:
• Vocabulary level (educated vs. colloquial)
• Sentence length (short, punchy vs. rambling)
• Rhythm (staccato vs. flowing)
• Verbal habits (catchphrases, hedging, interrupting)

EXERCISE: Write the same scene — two characters arguing about what to order for dinner — three times. Once with a married couple, once with a boss and employee, once with two strangers on a first date. The content is identical; the voices must be entirely different.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="format" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Format & Industry Standards
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`SPEC SCRIPT vs. SHOOTING SCRIPT
A spec (speculative) script is written to sell. It reads like a novel — lean, propulsive, no camera directions. A shooting script is a production document: scene numbers, shot descriptions, revision colors.

Never write a shooting script as a spec. Directors and producers want to imagine their own shots.

STANDARD FORMAT
• Courier 12pt, 1 inch margins on all sides.
• One page ≈ one minute of screen time.
• Scene headings (sluglines): INT./EXT. LOCATION — TIME OF DAY
• Action lines: present tense, active voice, minimal adjectives. "She runs" not "She is running."
• Character name: centered, ALL CAPS above dialogue.
• Parentheticals: sparingly. They direct the actor; actors resent them.
• Transitions: rarely needed. CUT TO is implied.

PAGE COUNT
• Feature: 90-120 pages (comedies shorter, dramas longer).
• TV hour: 55-65 pages.
• TV half-hour (single-cam): 28-35 pages.
• TV half-hour (multi-cam): 45-55 pages (double-spaced format).

SOFTWARE: Final Draft remains the industry standard. Highland, WriterSolo, and Fade In are viable alternatives.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="rewriting" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Rewriting & the Workshop Process
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`"Writing is rewriting." — every screenwriting professor at every film school.

THE WORKSHOP MODEL (NYU Tisch / AFI)
1. Writer distributes the script one week before the session.
2. Classmates read and prepare written notes.
3. In workshop, the writer stays silent while peers discuss the script in third person.
4. Professor moderates, synthesising feedback into actionable notes.
5. Writer responds only at the end with questions.

WHAT TO LISTEN FOR
• Patterns — if three people stumble at the same point, that's a real problem.
• Confusion vs. mystery — if readers don't understand the plot, that's confusion (bad). If they don't know what will happen next, that's mystery (good).
• Emotional response — trust "I felt bored in Act II" more than "You should add a car chase in Act II."

REWRITING PASSES
1. Structural pass — does each act work? Are turning points in the right places?
2. Character pass — is every character's arc complete? Is the antagonist as developed as the protagonist?
3. Dialogue pass — read every line aloud. Cut anything that sounds written.
4. Trim pass — cut 10%. Every script is too long in the first draft.

EXERCISE: Take a completed scene and cut it by one-third without losing any essential information. Notice what was filler.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sw-exercises" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Exercises: Logline, Treatment, Scene
              </AccordionTrigger>
              <AccordionContent>
                <Heading>Logline</Heading>
                <Pre>{`A logline is one sentence that captures the entire movie:
"When [PROTAGONIST] faces [INCITING INCIDENT], they must [GOAL] before [STAKES]."

Example: "When a young FBI trainee seeks the help of an imprisoned cannibalistic serial killer to catch another serial killer, she must navigate his psychological games before more women die."

Rules: Under 40 words. Include protagonist, conflict, and stakes. Create irony if possible.

EXERCISE: Write loglines for three movies you love. Then write one for an original idea.`}</Pre>
                <Heading>Treatment</Heading>
                <Pre>{`A treatment is a prose summary of the entire film, written in present tense, 5-15 pages. It tells the story scene by scene without dialogue.

Purpose: it's a sales document and a structural blueprint. Studios request treatments before greenlighting a script.

EXERCISE: Write a 3-page treatment for a short film. Include the opening image, the inciting incident, the midpoint, the climax, and the final image.`}</Pre>
                <Heading>Scene Writing</Heading>
                <Pre>{`EXERCISE: Write a 3-page scene where two characters with opposing objectives meet. Requirements:
• Clear subtext (they can't say what they really want).
• A power shift — one character enters with power and leaves without it.
• At least one moment of silence that speaks louder than dialogue.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────── 2. DIRECTING ──────────────── */}
        <PageSection id="directing" title="2 · Directing">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="director-role" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                The Director's Role
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`The director is the single creative vision guiding every department. This doesn't mean dictating — it means communicating a coherent idea so clearly that every collaborator can contribute to it.

VISION
Before production begins, the director must be able to answer: "What is this film about?" — not plot, but theme. Every subsequent decision (casting, lens choice, color palette, pacing) flows from that answer.

COMMUNICATION
A director who can't articulate their vision wastes everyone's time. Develop a visual vocabulary: reference films, photographs, paintings, music. Create a look book or mood board.

LEADERSHIP
Sets are high-pressure, time-constrained environments. The director must:
• Make decisions quickly, even under uncertainty.
• Protect the actors' emotional space.
• Stay calm when everything goes wrong (it will).
• Know when to delegate and when to insist.

The best directors listen more than they talk. They hire brilliant people and create conditions for brilliance to emerge.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="working-actors" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Working with Actors
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`OBJECTIVES & TACTICS
Every character in every scene wants something (objective). They pursue it through specific actions (tactics): persuading, threatening, seducing, bargaining, mocking.

Never tell an actor how to feel. Instead, give them a playable action: "You're trying to get her to stay" is useful. "Be sad" is not.

ADJUSTMENTS
When a take isn't working, give an adjustment — a small redirect:
• "Try it as if you know something she doesn't."
• "This time, you've already decided to leave before the scene starts."
• "Play the opposite — instead of angry, try amused."

Good adjustments are specific, imaginative, and quick. They change behavior, not emotion.

REHEARSAL
• Table reads: actors read the full script aloud. Listen for where energy drops.
• Blocking rehearsals: work out physical movement before camera arrives.
• Private rehearsals: some actors (especially Method actors) need one-on-one time.

Different actors require different approaches. Some want detailed discussion; others want to be left alone. Your job is to know which is which.

THE AUDITION
You're not looking for the best actor. You're looking for the actor who IS the character. Chemistry between actors matters more than individual brilliance. Always do callback reads with potential scene partners together.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="blocking" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Blocking & Staging
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Blocking is spatial storytelling — where characters stand, move, and relate to each other physically.

PRINCIPLES
• Proximity = intimacy or threat. Moving closer changes the power dynamic.
• Height = authority. The character standing while others sit holds visual power.
• Barriers = conflict. A desk, a door, a crowd between two characters creates tension.
• Movement = change. A character who crosses the room has made a decision.

STAGING FOR CAMERA
Stage in depth (foreground/background), not width. This creates layers and allows the camera to move through the space.

Use the "triangle" method: position three characters in a triangle to create natural sight lines and easy coverage.

EXERCISE: Stage a two-person argument in a kitchen. Use the table, the counter, and the doorway to create three distinct power dynamics without changing a word of dialogue.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="visual-storytelling" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Visual Storytelling
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Every shot is a narrative choice. The director selects what the audience sees, from what angle, for how long.

SHOT SIZE AS MEANING
• Wide shot — context, isolation, geography. "This is where we are."
• Medium shot — relationships, body language. "This is how they relate."
• Close-up — emotion, reaction, intimacy. "This is what they feel."
• Extreme close-up — obsession, detail, revelation. An eye. A trigger. A ring.

LENS AS MEANING
• Wide lens (24mm-35mm) — distorts edges, exaggerates depth. Creates unease or comedy.
• Normal lens (50mm) — closest to human vision. Neutral, naturalistic.
• Long lens (85mm-200mm) — compresses depth, isolates subject. Creates intimacy or surveillance.

CAMERA ANGLE AS MEANING
• Low angle — power, dominance, heroism.
• High angle — vulnerability, insignificance.
• Dutch angle — disorientation, instability (use sparingly).
• Eye level — neutrality, the audience as equal witness.

Study: Spielberg for blocking, Kubrick for symmetry, Scorsese for camera energy, Ozu for stillness.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="directing-formats" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Directing for Different Formats
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`FILM
Maximum creative control. The director shapes every frame. Pacing is cinematic — you can hold a shot, linger on a face, let silence breathe.

TELEVISION
The showrunner is king; the director serves the show's established visual language. Episode directors must match the series' tone, not impose their own. Speed is essential — TV shoots 5-8 pages per day vs. film's 2-3.

COMMERCIAL
30-60 seconds. Every frame is storyboarded in advance. The client and agency have final approval. The director's job is to elevate the concept with craft.

DOCUMENTARY
The director discovers the story rather than imposing one. Key skills: interviewing (making subjects comfortable), recognizing moments, shooting ratio management (you can't afford to shoot everything).

MUSIC VIDEO
Pure visual experimentation. No rules on continuity, logic, or narrative structure. A playground for developing visual style.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="on-set" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                On-Set Protocol & Chain of Command
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THE HIERARCHY
Director → communicates vision.
1st AD (Assistant Director) → runs the set, manages the schedule, calls "Action" and "Cut" (on some sets).
2nd AD → manages background actors, prepares call sheets.
Script Supervisor → tracks continuity, notes every take.
DP (Director of Photography) → executes the visual plan with the camera and lighting teams.
Gaffer → chief lighting technician, reports to DP.
Key Grip → manages camera support and rigging, reports to DP.

SET ETIQUETTE
• Only the director speaks to actors about performance.
• "Quiet on set" means absolute silence.
• "Rolling" → "Speed" → "Action" → scene plays → "Cut."
• Between takes, the director confers with the DP and script supervisor.
• The 1st AD owns the schedule. If the director is behind, the 1st AD finds solutions.

CALL SHEETS
Issued the night before by the 2nd AD. Contains: scenes to be shot, cast call times, crew call time, location address, weather forecast, special equipment, catering schedule. Every department reads this religiously.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────── 3. CINEMATOGRAPHY ──────────────── */}
        <PageSection id="cinematography" title="3 · Cinematography">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="camera-fundamentals" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Camera Fundamentals
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THE EXPOSURE TRIANGLE
Every image is controlled by three variables:

1. Aperture (f-stop) — the size of the lens opening.
   • Low f-stop (f/1.4) = wide open = more light, shallow depth of field (blurry background).
   • High f-stop (f/16) = small opening = less light, deep depth of field (everything sharp).

2. Shutter Speed / Shutter Angle
   • The 180-degree rule: set shutter speed to double your frame rate. At 24fps, shoot at 1/48 (≈1/50). This produces natural motion blur.
   • Faster shutter = less blur = staccato, jarring (Saving Private Ryan's D-Day sequence).
   • Slower shutter = more blur = dreamy, disorienting.

3. ISO / Sensitivity
   • Low ISO (100-400) = clean image, needs more light.
   • High ISO (3200+) = noisy/grainy image, works in low light.
   • Modern cinema cameras (ARRI Alexa, RED, Sony Venice) have excellent high-ISO performance.

SENSOR SIZE
• Super 35mm — the standard for cinema. Roughly APS-C equivalent.
• Full-frame — shallower depth of field, wider field of view at the same focal length.
• Large format (ARRI Alexa 65, RED Monstro) — even shallower DOF, "immersive" feel.

LENS TYPES
• Prime lenses — fixed focal length (35mm, 50mm, 85mm). Sharper, faster, forces you to move the camera.
• Zoom lenses — variable focal length. More flexible, slightly less sharp. Essential for documentary and TV.
• Anamorphic — creates the widescreen "cinematic" look with characteristic lens flares and oval bokeh.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="composition" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Composition
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`RULE OF THIRDS
Divide the frame into a 3×3 grid. Place key elements along the lines or at intersections. This creates natural visual balance.

LEADING LINES
Use architectural lines, roads, shadows, or eye direction to guide the viewer's gaze to the subject.

DEPTH
Create foreground, midground, and background layers. A branch in the foreground, the subject in the midground, mountains in the background = three-dimensional image on a two-dimensional screen.

HEADROOM & LEAD ROOM
• Headroom — the space above a character's head. Too much = they look small. Too little = they look trapped.
• Lead room (nose room) — space in front of the direction a character faces or moves. Removing lead room creates claustrophobia or tension.

NEGATIVE SPACE
Empty areas of the frame aren't wasted — they create mood. A small figure in a vast landscape = isolation. A face crammed to one edge = unease.

SYMMETRY
Centered compositions feel formal, powerful, unsettling. Kubrick and Wes Anderson use symmetry obsessively but to very different emotional effect.

EXERCISE: Watch a scene from any Deakins-shot film (Blade Runner 2049, 1917, No Country for Old Men). Pause every 10 seconds. Identify: Where does your eye go first? Why?`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="lighting" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Lighting
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THREE-POINT LIGHTING (the foundation)
1. Key light — the main source. Determines the quality and direction of light. Hard key = dramatic; soft key = flattering.
2. Fill light — placed opposite the key, reduces shadows. The ratio of key-to-fill determines contrast. High ratio (4:1) = noir. Low ratio (1:1) = comedy/commercial.
3. Back light (rim/hair light) — separates the subject from the background, adds dimension.

MOTIVATED LIGHTING
Every light source in the frame should have a justifiable origin: a window, a lamp, a candle, headlights. Even if you supplement with hidden film lights, the audience should believe the light comes from the environment.

NATURAL LIGHT
Shooting with available light only. Requires careful time-of-day scheduling:
• Golden hour — warm, low, directional. The most flattering light.
• Blue hour — cool, ambient, moody.
• Overcast — soft, even, no harsh shadows. Ideal for close-ups.
• Harsh noon sun — generally avoided; creates unflattering under-eye shadows.

Terrence Malick, Emmanuel Lubezki, and the Dardenne brothers are masters of natural light.

STYLIZED LIGHTING
Breaking motivated realism for emotional effect. Colored gels, extreme contrast, unmotivated sources. Dario Argento's "Suspiria," Nicolas Winding Refn's "Drive," Wong Kar-wai's entire filmography.

LIGHTING UNITS
• Tungsten (warm, 3200K) — traditional film lights.
• HMI (daylight-balanced, 5600K) — powerful, expensive.
• LED panels — variable color temperature, lightweight, efficient. Industry standard for 2020s.
• Practical lights — visible on-screen sources (lamps, candles, neon signs). Often the most beautiful.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="camera-movement" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Camera Movement
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`STATIC
The camera doesn't move. This isn't lazy — it's a deliberate choice. Static frames feel observational, composed, painterly. Ozu, Bresson, early Kubrick.

PAN & TILT
Pan = horizontal rotation. Tilt = vertical rotation. Both keep the camera in one position. Useful for following action or revealing geography.

DOLLY
Camera moves on a track (or wheels). Dolly-in creates intimacy or menace. Dolly-out reveals context or isolation.

The Spielberg dolly-in: slow push toward a character's face at the moment of realization. It's cinematic shorthand for "this matters."

STEADICAM
A body-mounted stabilizer allowing smooth, floating movement through complex spaces. Invented by Garrett Brown.
Iconic uses: The Shining (Overlook Hotel corridors), Goodfellas (Copacabana shot), Rocky (running up stairs).

HANDHELD
Adds energy, urgency, documentary realism. The Bourne films, Children of Men, the Dardenne brothers. Too much handheld = nausea. Use intentionally.

CRANE / JIB
Vertical movement. Rising crane shots often signal transcendence, revelation, or scope. Falling crane shots create dread.

DRONE
Aerial perspectives previously available only via helicopter. Ubiquitous since 2015. Risk: overuse creates visual cliché. Use when the bird's-eye perspective serves the story.

PRINCIPLE: Camera movement should have a reason. If you can't articulate why the camera moves, it shouldn't.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="color-theory" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Color Theory & the Grading Pipeline
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`COLOR PSYCHOLOGY IN CINEMA
• Red — passion, danger, violence (Schindler's List red coat, American Beauty roses)
• Blue — melancholy, isolation, cold rationality (Blade Runner, Moonlight)
• Green — nature, sickness, envy, the uncanny (The Matrix, Vertigo)
• Yellow/Amber — warmth, nostalgia, madness (Amélie, The Shining, Chinatown)
• Desaturated — realism, bleakness, historical distance (Saving Private Ryan, The Road)

COLOR PALETTES
• Complementary (opposite colors, e.g. orange/teal) — creates visual pop. Dominates Hollywood blockbusters.
• Analogous (adjacent colors) — creates harmony. Wong Kar-wai's greens and yellows.
• Monochromatic — creates mood and stylistic unity. Yorgos Lanthimos, David Fincher's muted palettes.

THE PIPELINE
1. On set: production design and lighting establish the base palette.
2. In camera: shoot flat/log profiles to preserve maximum dynamic range.
3. In post: the colorist applies a LUT (Look-Up Table) as a starting point, then refines scene-by-scene.
4. Color correction — technical: matching shots, fixing exposure, ensuring continuity.
5. Color grading — creative: pushing the image toward the intended mood and style.

Software: DaVinci Resolve (industry standard for grading), Baselight.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="digital-vs-film" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Digital vs. Film
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`FILM (Celluloid)
• Captures light photochemically on emulsion.
• 35mm, 16mm, 65mm/IMAX formats.
• Organic grain structure (not pixel-based noise).
• Limited by stock costs and magazine length (~10 minutes per roll for 35mm).
• Requires lab processing — you don't see the image until dailies.
• Colors and dynamic range have a character that digital still struggles to fully replicate.
• Shooting on film forces discipline: every take costs money.

DIGITAL
• Captures light electronically on a sensor.
• Effectively unlimited recording time.
• Instant playback on set.
• Superior low-light performance (modern sensors).
• Greater dynamic range on high-end cameras (15+ stops).
• Post-production workflow is faster and more flexible (RAW/Log shooting).

THE DEBATE IS OVER — mostly. 90%+ of professional productions shoot digital. But Christopher Nolan, Quentin Tarantino, Paul Thomas Anderson, and others still champion film for its aesthetic qualities and the discipline it imposes.

Key cameras (2020s):
• ARRI Alexa 35 / Alexa Mini LF — the default cinema camera. Beloved for skin tones and color science.
• RED V-RAPTOR / Komodo — high resolution (8K), compact, versatile.
• Sony Venice 2 — dual-ISO, excellent low-light, popular for TV and streaming.
• Blackmagic URSA — professional quality at lower price points.
• Canon C70/C300 — documentary and run-and-gun favorite.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────── 4. EDITING & POST-PRODUCTION ──────────────── */}
        <PageSection id="editing" title="4 · Editing & Post-Production">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="language-editing" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                The Language of Editing
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Walter Murch's rule: cut on the emotion. The best cut happens at the moment when the audience's eye wants to look somewhere else.

TYPES OF CUTS
• Hard cut — the standard. Scene A to Scene B, no transition.
• Match cut — connects two shots through visual similarity. "2001" bone → satellite. "Lawrence of Arabia" match → sunrise.
• Jump cut — removes time within the same shot. Creates urgency (Godard) or disorientation.
• Smash cut — abrupt transition for shock or comedy. A character says "Nothing can go wrong!" → cut to everything going wrong.
• Cross-cut (parallel editing) — alternates between two or more scenes happening simultaneously. Builds suspense (The Godfather baptism sequence).
• Montage — compresses time. Training montages, relationship montages, passage-of-time sequences.

TRANSITIONS
• Dissolve — one image fades into the next. Suggests time passing or thematic connection.
• Fade to black — ending. A chapter break. Finality.
• Wipe — one image pushes the other off screen. Retro, playful (Star Wars, early cinema).

PACING
Fast cutting = energy, chaos, urgency. Slow cutting = contemplation, tension, dread. The rhythm should serve the emotion of the scene, not the editor's ego.

EXERCISE: Re-edit a scene from a film using only different take selections or cut points. Notice how the same footage can produce entirely different emotional effects.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="continuity-montage" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Continuity Editing vs. Montage Theory
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`CONTINUITY EDITING (The Hollywood System)
The goal: invisible cuts. The audience should never be aware they're watching edited footage.

Rules:
• 180-degree rule — draw an imaginary line between two characters. Keep the camera on one side. Crossing the line disorients the viewer.
• 30-degree rule — when cutting between shots of the same subject, change the angle by at least 30 degrees. Less than that creates a jump cut.
• Shot/reverse shot — the backbone of dialogue scenes. Character A → Character B → A → B.
• Eyeline match — when a character looks off-screen, the next shot should show what they see.
• Match on action — cut during movement. The eye follows the motion and doesn't register the cut.

SOVIET MONTAGE THEORY (Eisenstein)
The opposite philosophy: editing should be felt. Collision between shots creates meaning that exists in neither shot alone.

The Kuleshov Effect: the same expressionless face paired with a bowl of soup = hunger. Paired with a dead child = grief. Paired with a beautiful woman = desire. The audience generates the emotion from the juxtaposition.

Eisenstein's methods:
• Metric montage — cuts at fixed intervals regardless of content. Creates mechanical rhythm.
• Rhythmic montage — cuts follow the rhythm of movement within the frame.
• Tonal montage — cuts based on the emotional tone of the shots.
• Intellectual montage — juxtaposing conceptually unrelated images to create metaphor. The slaughterhouse intercut with the workers' revolt in "Strike."

Modern filmmakers blend both approaches. The Coen Brothers use classical continuity most of the time, but shift to Eisenstein-style collision for key moments.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sound-design" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Sound Design
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Sound is 50% of the cinematic experience (some argue more).

DIEGETIC SOUND
Sound whose source exists within the world of the film: dialogue, footsteps, traffic, a radio playing in the room.

NON-DIEGETIC SOUND
Sound added for the audience only: musical score, voice-over narration, sound effects that enhance mood.

FOLEY
The art of recreating everyday sounds in a studio: footsteps, clothing rustle, door handles, glass clinking. Named after Jack Foley. Performed in sync with picture by a Foley artist.

AMBIENCE / ROOM TONE
Every location has a sonic signature. A hospital sounds different from a library. Recording and layering ambience creates the sense of place that the audience feels but doesn't consciously hear.

SOUND EFFECTS (SFX)
• Hard effects — specific, synchronised: gunshots, car crashes, explosions.
• Backgrounds — continuous: wind, rain, city traffic, forest insects.
• Design effects — created or processed sounds that don't exist in reality: lightsabers, the Inception "BWAAAH," the Predator's clicking.

THE SOUND MAP
Before editing, create a sound map: a timeline showing which layers (dialogue, Foley, ambience, SFX, music) are active at each moment. This prevents sonic clutter and ensures dynamic range.

Study: Ben Burtt (Star Wars, Wall-E), Gary Rydstrom (Jurassic Park, Saving Private Ryan), Skip Lievsay (No Country for Old Men, Gravity).`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="music-scoring" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Music & Scoring
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`TEMP TRACKS
During editing, the editor places existing music (from other films, albums, classical recordings) under scenes to establish pacing and mood. The danger: "temp love" — becoming so attached to the temp that nothing else satisfies.

SPOTTING SESSION
The director and composer watch the locked cut together, deciding where music starts ("hit points"), where it stops, and what it should accomplish emotionally in each cue.

COMPOSER COLLABORATION
The composer writes to picture, synchronizing musical phrases with visual events. The director communicates in emotions and metaphors, not musical terms: "This should feel like drowning" is more useful than "Give me a diminished chord."

SCORE vs. SOUNDTRACK
• Score — original music composed for the film.
• Soundtrack — pre-existing songs placed in the film.
• Some films use both (Tarantino: no original score; Scorsese: extensive use of both).

WHEN NOT TO USE MUSIC
Silence can be the most powerful score. The absence of music in a scene that "should" have it creates unease and rawness. No Country for Old Men has almost no score — the silence is the point.

EXERCISE: Take a scene from a film. Mute the original score. Lay three different pieces of music under it. Notice how radically the music changes the meaning of the same images.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="vfx" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Visual Effects & Compositing
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`VFX CATEGORIES
• Invisible VFX — removing wires, erasing crew reflections, adding sky replacements, extending sets. The audience never knows. This is 90% of VFX work.
• Visible VFX — creatures, explosions, space battles, fantastical environments. What people think of as "VFX."

COMPOSITING
Layering multiple image elements into a single frame. Green/blue screen footage + CG background + atmospheric effects + color correction = final composite.

Key concepts:
• Keying — extracting a subject from a green/blue screen background.
• Rotoscoping — manually tracing frames to isolate elements. Tedious but precise.
• Tracking — matching CG elements to camera movement so they appear anchored in the real world.
• Light matching — ensuring CG elements receive the same light direction, color, and intensity as the live-action plate.

SOFTWARE
• Nuke (Foundry) — industry standard for feature film compositing.
• After Effects (Adobe) — motion graphics, lower-budget compositing, title design.
• Houdini (SideFX) — procedural effects: water, fire, destruction, particles.
• Maya / Blender — 3D modeling, animation, rigging.
• Unreal Engine — real-time rendering, virtual production (The Mandalorian).

VIRTUAL PRODUCTION
LED wall stages (like ILM's StageCraft / The Volume) display real-time CG environments that react to camera movement. Actors perform in front of the environment, not a green screen. This is the biggest technical shift since digital cameras.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="color-pipeline" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Color Correction vs. Color Grading
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`These are often confused but serve different purposes:

COLOR CORRECTION (Technical)
• Matching shots within a scene so cuts are seamless.
• Fixing exposure issues, white balance errors, skin tones.
• Ensuring consistency across cameras and shooting days.
• This is the "cleanup" phase.

COLOR GRADING (Creative)
• Pushing the image toward the intended aesthetic.
• Creating the "look" of the film: warm, cold, desaturated, hyper-saturated.
• Shot-specific adjustments: making a sunset more dramatic, a night scene moodier.
• Power windows (masks) to isolate and adjust specific areas of the frame.

THE WORKFLOW
1. Apply a show LUT (Look-Up Table) — a preset starting point.
2. Primary correction — global adjustments to exposure, contrast, white balance.
3. Secondary correction — targeted adjustments to specific colors, luminance ranges, or masked areas.
4. Scene-by-scene matching.
5. Creative grading — the final artistic pass.

THE COLORIST
A specialist who partners with the DP and director. The best colorists have both technical mastery and an artistic sensibility. They work in calibrated suites with reference monitors costing $20,000+.

DaVinci Resolve is the dominant grading platform. Baselight is used on high-end features.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────── 5. PRODUCING ──────────────── */}
        <PageSection id="producing" title="5 · Producing">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="development" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Development
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Development is where projects are born — and where most die. Only a fraction of developed projects ever get made.

OPTIONING MATERIAL
If you want to adapt a book, article, or life story, you don't buy the rights — you option them. An option is a time-limited exclusive right (typically 12-18 months) to develop the material into a screenplay. Option prices range from $1 (for unknown material) to millions (for bestsellers).

PACKAGING
Attaching elements that make the project attractive to financiers: a star actor, a proven director, a completed screenplay. Agencies (CAA, WME, UTA) package projects using their own clients — this is both efficient and controversial.

FINANCING
• Studio financing — the studio funds the film and owns the distribution rights. Least risk for the producer, least creative freedom.
• Independent financing — equity investors, pre-sales (selling distribution rights territory-by-territory before the film is made), tax incentives, gap financing.
• Co-productions — international partnerships that unlock funding from multiple countries.

THE PITCH
You pitch the concept to studios or investors in a room. The pitch is a performance: story, characters, market positioning, comparable titles, and personal passion — all in 10-20 minutes.

EXERCISE: Develop a pitch package for an original film idea: logline, synopsis, character descriptions, tone references (comparable films), and a one-paragraph market analysis.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pre-production" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Pre-Production
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Pre-production is where the film is actually won or lost. Every dollar and day is allocated here.

BUDGETING
• Above-the-line — creative talent: writer, director, producers, lead cast. Negotiated individually.
• Below-the-line — everyone else: crew, equipment, locations, post-production. Standardised rates.
• Contingency — always budget 10% for the unexpected. It will be spent.

Budget tiers:
• Micro-budget: under $500K. Usually non-union, skeleton crew.
• Low-budget: $500K-$5M. SAG low-budget agreements apply.
• Mid-budget: $5M-$50M. The endangered species of filmmaking.
• Big-budget: $50M+. Studio tentpoles, franchise films.

SCHEDULING
The line producer and 1st AD create the shooting schedule using strip boards (now digital via Movie Magic Scheduling or StudioBinder).

Scheduling principles:
• Group by location (minimize company moves).
• Front-load difficult scenes (actors and crew are freshest).
• Night shoots are expensive and exhausting — cluster them.
• Child actors have legally mandated work-hour limits.

HIRING CREW
The department heads (DP, production designer, costume designer, editor) are the producer's and director's first hires. Each department head then hires their own team.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="production-mgmt" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Production Management
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`The producer keeps the machine running during the shoot.

DAILY OPERATIONS
• Call sheet — the bible for each shooting day. Published the evening before.
• Daily production report — tracks scenes completed, footage shot, hours worked, any incidents.
• Cost report — weekly comparison of actual spending vs. budget.

PROBLEM SOLVING
Weather cancels an exterior? The producer has a cover set (an interior scene ready to go). An actor is injured? The schedule is rearranged overnight. Budget is running over? The producer decides what to cut — without compromising the director's vision if possible.

PRODUCER TYPES
• Executive Producer — often the financier or deal-maker. May never visit the set.
• Producer — the primary creative and logistical lead. On set daily.
• Line Producer — manages the physical production: budget, schedule, crew deals.
• Co-Producer — a credit given for various contributions (financing, creative input, producing partner).
• Associate Producer — often a courtesy credit, though sometimes given to a key production coordinator.

The Producers Guild of America (PGA) has attempted to standardise these titles with the "p.g.a." mark, awarded only to the producers who were genuinely involved in the creative process.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="post-supervision" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Post-Production Supervision & Delivery
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`EDITORIAL
The editor assembles a rough cut during production (sometimes even delivering a first assembly before wrap). The director then takes their contractual "director's cut" period (typically 10 weeks for DGA members).

POST PIPELINE
1. Picture lock — the final edit is approved. No more changes to timing or structure.
2. Sound editorial — dialogue editing, Foley, sound effects, ADR (Automated Dialogue Replacement — re-recording lines in a studio).
3. Music — scoring, licensing, recording sessions.
4. VFX — final shots delivered and integrated.
5. Color grading — the colorist creates the final look.
6. Sound mix — all audio elements balanced for theatrical, streaming, and broadcast deliverables.
7. DCP (Digital Cinema Package) — the final delivery format for theatrical projection.

DELIVERABLES
The distributor requires a mountain of materials: the DCP, multiple audio mixes (5.1, 7.1, Atmos, stereo), textless backgrounds (for international versions), trailer materials, behind-the-scenes footage, EPK (Electronic Press Kit), and more.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="distribution" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Distribution
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`FILM FESTIVALS
The launchpad for independent cinema:
• Sundance — independent American cinema. Where distribution deals happen.
• Cannes — the most prestigious. Palme d'Or is the highest honor.
• Venice — increasingly where Oscar campaigns begin.
• Toronto (TIFF) — the audience award here is a strong Oscar predictor.
• Berlin, Telluride, SXSW, Tribeca — important secondary festivals.

Strategy: premiere at a top-tier festival, generate buzz, negotiate distribution.

SALES AGENTS
International sales agents represent the film at markets (Cannes Marché, AFM, EFM) and sell distribution rights territory-by-territory.

DISTRIBUTION MODELS
• Theatrical — the traditional model. Increasingly reserved for tentpoles and prestige films.
• Streaming — Netflix, Amazon, Apple, etc. Either acquire completed films or fund originals. Guaranteed audience, less theatrical prestige.
• Hybrid — limited theatrical release followed by streaming window.
• Self-distribution — platforms like Vimeo On Demand, direct-to-audience strategies. Viable for niche content with built-in audiences.

THE THEATRICAL WINDOW
Historically: theatrical → home video (3-4 months) → streaming (6-9 months) → TV. Post-COVID, these windows have collapsed dramatically. Some films go day-and-date (simultaneous theatrical and streaming).`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="business" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                The Business of Hollywood
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`GUILDS & UNIONS
• WGA (Writers Guild of America) — represents screenwriters. Minimum rates, residuals, credits.
• DGA (Directors Guild of America) — represents directors and ADs. Protects creative rights.
• SAG-AFTRA — represents actors and voiceover artists. Mandates pay, working conditions, residuals.
• IATSE — represents below-the-line crew: grips, electricians, editors, costumers, etc.
• Teamsters — represent drivers and transportation department.

Union membership provides health insurance, pension contributions, and minimum pay rates. The 2023 WGA and SAG-AFTRA strikes reshaped AI and streaming residual agreements.

DEALS
• Spec sale — selling a completed screenplay.
• Open writing assignment (OWA) — studios hire writers for specific projects.
• Overall deal — a studio pays a creator an annual fee for exclusive development.
• First-look deal — a studio gets first right of refusal on a creator's projects.
• Backend / profit participation — a share of the film's profits (notoriously manipulated through "Hollywood accounting").

RESIDUALS
Ongoing payments to creatives when a film is rebroadcast, streamed, or sold in new markets. The 2023 strikes established new streaming residual formulas that account for viewership data.

ENTERTAINMENT LAW
Every deal requires a lawyer. Entertainment attorneys negotiate contracts, handle rights clearances, and protect intellectual property. They typically charge 5% of the deal value or hourly rates.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────── 6. PRODUCTION DESIGN ──────────────── */}
        <PageSection id="production-design" title="6 · Production Design & Art Direction">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="pd-role" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                The Role of the Production Designer
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`The production designer (PD) creates the physical world of the film. Every environment the audience sees — sets, locations, color palettes, textures, architecture — falls under the PD's domain.

The PD works directly with the director and DP to ensure visual coherence. If the director's vision is "oppressive bureaucracy," the PD translates that into low ceilings, fluorescent lighting, and institutional green walls.

DEPARTMENT HIERARCHY
• Production Designer — creative lead.
• Art Director — manages the execution of the PD's vision, handles blueprints, budgets, and construction logistics.
• Set Decorator — furnishes the set with furniture, drapery, and decorative objects.
• Props Master — manages all objects actors interact with.
• Construction Coordinator — leads the team that builds the sets.
• Scenic Artist — painters, aging/distressing specialists.

THE DESIGN PROCESS
1. Script breakdown — identify every location, prop, vehicle, and visual element mentioned or implied.
2. Research — historical, architectural, cultural. Reference photos, museum visits, location scouts.
3. Concept art — sketches, renderings, 3D previews of key environments.
4. Mood boards — collages of color, texture, and visual tone.
5. Technical drawings — blueprints and elevations for construction.
6. Construction and dressing — building and furnishing the sets.
7. On-set supervision — ensuring everything reads correctly on camera.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="research-mood" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Research, Mood Boards & Concept Art
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`RESEARCH
Great production design starts with obsessive research. For a period film, this means:
• Architecture of the era (construction methods, materials, proportions).
• Social customs (how people lived, what they owned, how rooms were arranged).
• Technology (what existed, what didn't, what was common vs. rare).
• Regional specifics (a 1920s apartment in New York looks nothing like one in New Orleans).

For contemporary films, research means understanding the socioeconomic reality of the characters: a grad student's apartment vs. a tech CEO's office.

MOOD BOARDS
A visual communication tool. Combine photographs, paintings, fabric swatches, color chips, and typography samples that capture the feeling of the world. Share with the director, DP, and costume designer to align everyone's mental image.

Tools: Pinterest, Milanote, physical collage boards.

CONCEPT ART
More specific than mood boards. Concept artists create detailed illustrations of key sets before construction begins. These serve as blueprints for the emotional and aesthetic intent.

Major concept artists in film: Ralph McQuarrie (Star Wars), Syd Mead (Blade Runner), Doug Chiang (The Mandalorian).`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sets-locations" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Set Construction, Location Scouting & Dressing
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`BUILD VS. FIND
The fundamental decision: build a set on a soundstage or shoot on location?

Soundstage advantages:
• Total control over lighting, sound, and weather.
• Walls can be "floated" (removed) for camera access.
• Can build to exact specifications.

Location advantages:
• Authenticity and texture that's expensive to replicate.
• Natural light and ambience.
• Often cheaper than building from scratch.

LOCATION SCOUTING
The PD and locations manager search for real-world spaces that match the script's requirements. They photograph and video each option, noting: available light, sound issues, accessibility, parking for trucks, proximity to other locations, and modification potential.

SET DRESSING
The set decorator fills the space with objects that tell the story:
• Hero props — items the camera features closely.
• Background dressing — creates depth and authenticity.
• Aging and distressing — new objects look fake on camera. The scenic team adds wear, dirt, patina, and history.

Every object is a choice. A character's bookshelf tells us about their intellectual life. The dishes in the sink tell us about their emotional state.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="costume" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Costume Design
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Costume design is character development through clothing. Every fabric, color, and silhouette tells the audience who this person is before they speak.

PRINCIPLES
• Social status — material quality, fit, accessories.
• Emotional state — characters often dress differently as their arc progresses.
• Period accuracy — for historical films, this is research-intensive.
• Color coordination — costumes must work within the overall color palette established by the PD and DP.
• Practical considerations — actors must be able to move, fight, dance. Stunt doubles need identical costumes.

CHARACTER ARCS IN CLOTHING
In "The Dark Knight," Harvey Dent's suits go from pristine white to singed and torn — mirroring his descent into Two-Face.
In "Mad Men," the entire show's visual identity is built on period-perfect costuming that defines each character's personality and social position.

THE COSTUME DEPARTMENT
• Costume Designer — creative lead. Designs, sources, or commissions all wardrobe.
• Costume Supervisor — manages logistics: fittings, multiples, continuity.
• Wardrobe Assistants — on-set support, dressing actors, maintaining continuity.
• Cutter/Fitter — constructs custom garments.

MULTIPLES
Action films require multiple identical costumes (6-10 copies of the hero's outfit is common) for stunt work, damage continuity, and backup.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="props" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Props & Set Decoration
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`PROPS vs. SET DRESSING
Props (properties) are objects actors touch, hold, or interact with: a gun, a letter, a phone, a drink. Set dressing is everything else in the environment: the painting on the wall, the lamp on the table.

THE PROP MASTER
Responsible for sourcing, creating, and managing all props. On a period film, this means extensive research and often custom fabrication.

KEY CONSIDERATIONS
• Continuity — if a character picks up a coffee cup in shot A, it must be in the same hand, at the same fill level, in shot B.
• Safety — prop weapons must be cleared by the armorer. Since the Rust tragedy (2021), on-set firearms protocols have been radically tightened.
• Legal clearances — brand logos on props may require permission or must be obscured.
• Hero vs. stunt props — hero props are detailed and screen-ready. Stunt props are lightweight or breakaway versions.

GRAPHIC PROPS
Newspapers, letters, text messages, computer screens, documents — all designed by the graphics department to be legible and authentic on camera. Generic placeholder text is a telltale sign of lazy production design.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="world-building" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                World-Building
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`PERIOD FILMS
The challenge: historical accuracy vs. cinematic readability. Audiences need to believe the world without being confused by it. Production designers often simplify or heighten period details for clarity.

Iconic period design: "Barry Lyndon" (Kubrick, candlelit interiors), "The Grand Budapest Hotel" (Anderson, stylized European history), "12 Years a Slave" (McQueen, unflinching realism).

SCI-FI AND FANTASY
Here, the production designer invents the world from scratch. The best sci-fi design is extrapolation: take current technology or architecture and push it forward logically.

Approaches:
• Used future (Alien, Blade Runner) — everything is worn, dirty, lived-in.
• Clean future (2001, Her) — minimalist, pristine, sterile.
• Retro-future (Brazil, Fallout) — imagining the future as the past imagined it.
• Organic (Avatar, Dune 2021) — designs inspired by biological forms and natural textures.

VISUAL RULES
Every world needs internal visual rules — consistent architecture, consistent technology, consistent wear patterns. If a sci-fi city has hovering vehicles, the roads should still show the infrastructure. If a fantasy kingdom is medieval, the lighting shouldn't be electric.

The audience may not notice these details consciously, but they feel them. Inconsistency breaks immersion; consistency builds belief.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────── 7. SOUND & MUSIC ──────────────── */}
        <PageSection id="sound" title="7 · Sound & Music">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="production-sound" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Production Sound
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Production sound is capturing clean dialogue and ambience on set. Everything else can be recreated in post; the actor's original performance cannot.

THE SOUND TEAM
• Production Sound Mixer — the department head. Operates the mixing board, monitors audio quality, makes level adjustments in real-time.
• Boom Operator — positions the boom microphone above or below the frame, following actors' movements. An art form of timing and endurance.
• Sound Utility / Cable Person — manages wireless transmitters, cables, and equipment.

MICROPHONES
• Shotgun mic (Sennheiser MKH 416, Schoeps CMIT 5U) — highly directional, mounted on the boom. The primary dialogue mic.
• Lavalier (lav) — tiny clip-on mic hidden in wardrobe. Backup for dialogue, especially in wide shots where the boom can't reach.
• Plant mics — hidden in the set for specific sound sources (a clock, a faucet, an engine).

CHALLENGES
• Location noise — traffic, HVAC, airplanes, construction. The mixer identifies and mitigates (turning off fridges, requesting holds for flyovers).
• Wardrobe rustle — lavs pick up fabric noise. The costume department and sound team coordinate on lav placement.
• Multiple actors — overlapping dialogue is realistic but unmixable. The mixer may request wild lines (actors re-performing lines after the take).

ROOM TONE
At the end of shooting at each location, the mixer records 30-60 seconds of silence. This "room tone" is used in editing to fill gaps and smooth cuts.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="sound-editing-mixing" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Sound Editing & Mixing
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`SOUND EDITING (building the elements)
After picture lock, the sound editorial team constructs the film's sonic world:

• Dialogue editing — cleaning, smoothing, removing pops and clicks. Selecting the best line readings from multiple takes.
• ADR (Automated Dialogue Replacement) — re-recording lines in a studio when production audio is unusable. The actor watches the scene and lip-syncs their performance.
• Foley — recreating physical sounds in sync with picture: footsteps on different surfaces, handling props, body movements.
• Sound effects editing — placing and layering specific sounds: doors, vehicles, weapons, environments.
• Ambience/backgrounds — continuous environmental sound layers that create a sense of place.

SOUND MIXING (balancing everything)
The re-recording mixers (typically two: one for dialogue/music, one for effects) combine all elements into the final mix.

MIXING STAGES
• Predubs — premixing individual categories (all dialogue, all Foley, all backgrounds) to manageable submixes.
• Final mix — balancing predubs against each other and the music. This happens on a calibrated dubbing stage with theater-quality speakers.

The mix is an emotional art: deciding what's loud, what's quiet, what's present, what's subliminal. A great mixer can make you feel rain without consciously hearing it.

DELIVERABLES
Multiple mix versions are required:
• Theatrical mix (5.1, 7.1, or Atmos)
• Near-field mix (streaming/TV — optimized for smaller speakers)
• M&E (Music & Effects) — dialogue stripped out for international dubbing.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="composer-role" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                The Composer & Music Supervisor
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THE FILM COMPOSER
A film composer writes original music timed precisely to picture. The job requires:
• Musical ability across orchestral, electronic, and hybrid styles.
• Technical skill in DAWs (Logic Pro, Cubase, Pro Tools) and notation software.
• Emotional intelligence — translating directorial intent into musical expression.
• Speed — scoring schedules are tight (4-12 weeks for a feature).

Great film composers: John Williams, Hans Zimmer, Ennio Morricone, Bernard Herrmann, Trent Reznor & Atticus Ross, Jonny Greenwood, Hildur Guðnadóttir.

THE MUSIC SUPERVISOR
Selects and licenses pre-existing songs for use in the film. The music supervisor:
• Understands the director's musical taste and the film's tone.
• Negotiates sync licenses (the right to use the song with picture) and master licenses (the right to use the specific recording).
• Manages the music budget — licensing can range from thousands to millions.
• Coordinates with the composer to ensure songs and score coexist without clashing.

ORIGINAL SONGS vs. LICENSED SONGS
Some films commission original songs (A Star Is Born, Frozen). Others rely entirely on existing catalogs (Guardians of the Galaxy, Baby Driver). The choice shapes the audience's emotional relationship with the film.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="scoring-picture" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Scoring to Picture
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`SPOTTING
The director and composer watch the locked cut and decide:
• Where music enters and exits.
• What emotion each cue should serve.
• What should be scored vs. what should be silent.
• Hit points — specific visual moments the music should synchronize with (a door opening, a kiss, a gunshot).

THEMES & LEITMOTIFS
A theme is a musical idea associated with a character, place, or concept. A leitmotif is a shorter, more flexible version that can be varied and developed.

John Williams is the master: the Imperial March (Vader), Hedwig's Theme (Harry Potter), the shark motif (Jaws — just two notes).

Leitmotifs can be:
• Transformed — major key becomes minor key as a hero falls.
• Fragmented — only a piece of the theme plays, suggesting memory or absence.
• Combined — two character themes play simultaneously during a scene between them.

ORCHESTRATION
The composer (or a dedicated orchestrator) decides which instruments play which parts. Orchestration IS composition — the same melody sounds completely different on a solo oboe vs. a full string section.

RECORDING
Major scores are recorded with live orchestras (Abbey Road Studios, Sony Scoring Stage, AIR Studios). The conductor (often the composer) leads the orchestra while watching the film projected on a screen. Click tracks synchronize the musicians to picture.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="mixing-formats" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Mixing for Theaters, Streaming & Broadcast
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THEATRICAL FORMATS
• 5.1 Surround — left, center, right, left surround, right surround + subwoofer. The standard since the 1990s.
• 7.1 Surround — adds two extra surround channels for finer spatial resolution.
• Dolby Atmos — object-based audio. Instead of channel-based mixing, individual sounds are placed in 3D space. The rendering system adapts to any speaker configuration. 128 audio tracks + up to 64 speaker feeds.
• IMAX — a proprietary 12-channel system optimized for IMAX theaters.

STREAMING / HOME
Home viewers use everything from TV speakers to soundbars to headphones. The mix must translate across all of them.
• Near-field mix — optimized for closer listening distances and smaller speakers. Dialogue is louder relative to effects.
• Dialogue normalization — streaming platforms apply loudness standards (e.g., -24 LKFS for Netflix).
• Atmos for home — binaural rendering for headphones, or speaker-based for Atmos-enabled soundbars.

BROADCAST
Television has strict loudness standards (CALM Act in the US, EBU R128 in Europe). Mixes must comply with measured loudness targets. The dynamic range is compressed compared to theatrical mixes.

THE CHALLENGE
A film mixed for a 60-speaker Atmos theater needs to sound equally powerful on AirPods. This is the modern sound mixer's impossible — and essential — mandate.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>

        {/* ──────────────── 8. FILM HISTORY, THEORY & CRITICAL STUDIES ──────────────── */}
        <PageSection id="history" title="8 · Film History, Theory & Critical Studies">
          <Accordion type="multiple" className="w-full">
            <AccordionItem value="silent-studio" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Silent Era Through the Studio System (1890s–1960s)
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THE BIRTH OF CINEMA (1890s-1910s)
• Lumière brothers (1895) — first public screenings. "Workers Leaving the Lumière Factory," "Arrival of a Train."
• Georges Méliès — the first filmmaker to use narrative, special effects, and fantasy. "A Trip to the Moon" (1902).
• Edwin S. Porter — "The Great Train Robbery" (1903) established editing as narrative technique.
• D.W. Griffith — pioneered close-ups, cross-cutting, and feature-length storytelling. "The Birth of a Nation" (1915) is technically groundbreaking and morally abhorrent.

THE SILENT ERA (1910s-1920s)
• Charlie Chaplin — physical comedy as social commentary.
• Buster Keaton — deadpan, mechanical, breathtakingly choreographed.
• F.W. Murnau — German Expressionism; "Nosferatu" (1922), "The Last Laugh" (1924).
• Sergei Eisenstein — Soviet montage theory; "Battleship Potemkin" (1925), the Odessa Steps sequence.
• Fritz Lang — "Metropolis" (1927), the blueprint for cinematic dystopia.

THE COMING OF SOUND (1927-1930s)
"The Jazz Singer" (1927) — first feature with synchronized dialogue. Within three years, silent cinema was dead. Many silent stars couldn't transition; new stars (James Cagney, Bette Davis) emerged.

THE STUDIO SYSTEM (1930s-1960s)
Five major studios (Paramount, MGM, Warner Bros., 20th Century Fox, RKO) controlled production, distribution, AND exhibition. Actors, directors, and writers were under exclusive contracts. This vertical integration was dismantled by the 1948 Supreme Court decision in United States v. Paramount Pictures.

The Production Code (Hays Code, 1934-1968) — enforced moral standards: no explicit sex, crime couldn't be shown to pay, profanity was banned. This forced filmmakers into subtext and innuendo, arguably sharpening their craft.

KEY FIGURES: Alfred Hitchcock, John Ford, Howard Hawks, Billy Wilder, Orson Welles ("Citizen Kane," 1941 — still cited as the greatest film ever made).`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="new-hollywood" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                New Hollywood & the Auteur Era (1960s–1980s)
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THE COLLAPSE OF THE STUDIO SYSTEM
By the mid-1960s, the old model was failing. Expensive epics flopped. Audiences — especially young audiences — wanted something different. The Production Code was replaced by the MPAA rating system (1968), opening the door to adult content.

THE NEW HOLLYWOOD (1967-1980)
A generation of film-school-educated directors who had studied European art cinema brought radical energy to American filmmaking:

• "Bonnie and Clyde" (1967, Arthur Penn) — graphic violence, moral ambiguity.
• "The Graduate" (1967, Mike Nichols) — generational alienation, Simon & Garfunkel score.
• "Easy Rider" (1969, Dennis Hopper) — counterculture, low-budget, enormous profit.
• "The Godfather" (1972, Coppola) — the crime epic as American mythology.
• "Chinatown" (1974, Polanski) — noir nihilism.
• "Jaws" (1975, Spielberg) — invented the summer blockbuster.
• "Taxi Driver" (1976, Scorsese) — urban alienation, Vietnam PTSD.
• "Star Wars" (1977, Lucas) — changed everything. Again.
• "Apocalypse Now" (1979, Coppola) — the war film as fever dream.

THE AUTEUR THEORY
Originated in French criticism (Cahiers du Cinéma, 1950s). Andrew Sarris brought it to America: the director is the "author" of the film. The theory values personal vision over studio product.

THE END OF NEW HOLLYWOOD
"Heaven's Gate" (1980, Michael Cimino) — a catastrophic flop that ended director-driven autonomy. Studios reasserted control. The blockbuster model (Spielberg, Lucas) became the dominant paradigm.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="world-cinema" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                World Cinema
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`FRENCH NEW WAVE (Nouvelle Vague, late 1950s-1960s)
• Filmmakers: Jean-Luc Godard, François Truffaut, Agnès Varda, Éric Rohmer, Jacques Rivette, Claude Chabrol.
• Style: jump cuts, handheld cameras, location shooting, direct address to camera, improvisation.
• Philosophy: cinema as personal expression. The director writes with the camera.
• Key films: "Breathless" (1960), "The 400 Blows" (1959), "Cléo from 5 to 7" (1962).

ITALIAN NEOREALISM (1940s-1950s)
• Filmmakers: Roberto Rossellini, Vittorio De Sica, Luchino Visconti.
• Style: non-professional actors, real locations, stories of working-class and poverty.
• Key films: "Rome, Open City" (1945), "Bicycle Thieves" (1948), "La Terra Trema" (1948).
• Legacy: directly influenced the French New Wave, British kitchen-sink realism, and independent cinema worldwide.

JAPANESE CINEMA
• Akira Kurosawa — "Rashomon" (1950, perspective and truth), "Seven Samurai" (1954, the template for ensemble action), "Ikiru" (1952, existential meaning).
• Yasujirō Ozu — "Tokyo Story" (1953). Minimalist compositions, tatami-level camera, the quiet devastation of family life.
• Kenji Mizoguchi — long takes, female-centered stories, "Ugetsu" (1953).
• Modern: Hirokazu Kore-eda ("Shoplifters"), Ryusuke Hamaguchi ("Drive My Car").

OTHER ESSENTIAL MOVEMENTS
• German Expressionism (1920s) — angular sets, extreme shadows, psychological horror.
• British New Wave (1960s) — working-class realism: "Saturday Night and Sunday Morning," "This Sporting Life."
• New German Cinema (1970s) — Fassbinder, Herzog, Wenders.
• Iranian New Wave — Abbas Kiarostami, Jafar Panahi, Asghar Farhadi. Cinema under restriction.
• Korean New Wave — Bong Joon-ho, Park Chan-wook. Genre filmmaking with social critique.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="genre-theory" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Genre Theory
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Genre is a contract between filmmaker and audience: a set of expectations (visual style, narrative patterns, emotional payoff) that the film can fulfill, subvert, or blend.

HORROR
• Function: confront what we fear.
• Subgenres: slasher, supernatural, folk horror, body horror, psychological.
• The "final girl" (Carol Clover) — the last survivor who confronts the monster.
• Key: the horror film is about the audience's body. Fear is physiological.

FILM NOIR
• 1940s-1950s. Hard shadows, femme fatales, morally compromised protagonists.
• Visual signature: low-key lighting, wet streets, venetian blinds.
• Neo-noir: "Chinatown," "Blade Runner," "Drive."
• Noir is less a genre than a mode — it can be applied to any genre.

WESTERN
• The foundational American myth: civilization vs. wilderness, law vs. freedom.
• Classical (John Ford) → revisionist ("Unforgiven") → contemporary ("No Country for Old Men").
• The western is the most mythological American genre.

SCI-FI
• Function: explore what-if. Technology, society, humanity's future.
• Hard sci-fi (realistic extrapolation) vs. soft sci-fi (social/philosophical focus).
• Key works: "2001," "Blade Runner," "Solaris," "Arrival," "Ex Machina."

MELODRAMA
• Heightened emotion, often dismissed but artistically rich.
• Douglas Sirk ("All That Heaven Allows") used melodrama to critique 1950s American society.
• Todd Haynes ("Far from Heaven," "Carol") revived Sirkian melodrama.

GENRE BLENDING
The most interesting contemporary films operate across genres: "Get Out" (horror + social satire), "Parasite" (comedy + thriller + tragedy), "Everything Everywhere All at Once" (martial arts + family drama + sci-fi + absurdist comedy).`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="film-theory" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Film Theory
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`Film theory provides frameworks for understanding HOW and WHY cinema creates meaning.

SEMIOTICS (Ferdinand de Saussure, Christian Metz)
Cinema is a language. Shots are "signs" composed of signifier (the image) and signified (the concept). Editing is syntax. A close-up of a gun followed by a close-up of a face creates a "sentence" about threat.

PSYCHOANALYTIC THEORY (Laura Mulvey, Jacques Lacan)
"Visual Pleasure and Narrative Cinema" (Mulvey, 1975) — introduced the concept of the "male gaze." Classical Hollywood cinema positions the audience as a male viewer and women as objects of spectacle. This framework remains foundational for analyzing representation.

APPARATUS THEORY (Jean-Louis Baudry)
The cinema itself — the darkened room, the projected light, the immobile spectator — constructs a specific ideological relationship between viewer and image. Watching a film is never neutral.

FEMINIST FILM THEORY
Beyond Mulvey: examining how gender is constructed, performed, and subverted in cinema. The Bechdel Test (does the film have two named women who talk to each other about something other than a man?) is a blunt but useful starting point.

POSTCOLONIAL THEORY
How cinema represents (and misrepresents) colonized peoples, non-Western cultures, and the legacy of empire. Edward Said's "Orientalism" applied to film: who gets to tell whose story?

AUTEUR THEORY (revisited)
Not just "the director is the author" — but a critical tool for identifying recurring themes, visual motifs, and worldviews across a director's body of work.

These theories aren't mutually exclusive. A single scene can be analyzed through all of them simultaneously.`}</Pre>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="contemporary" className="border-white/[0.06]">
              <AccordionTrigger className="text-sm text-foreground hover:no-underline">
                Contemporary Cinema & the Streaming Revolution
              </AccordionTrigger>
              <AccordionContent>
                <Pre>{`THE STREAMING ERA (2013-present)
Netflix's "House of Cards" (2013) proved that streaming platforms could produce prestige content. By the 2020s, streaming had fundamentally restructured the industry:

• Theatrical windows have collapsed.
• Mid-budget adult dramas migrated to streaming.
• Theaters increasingly rely on franchises and event films.
• The volume of content has exploded; the audience's attention is the scarce resource.

THE FRANCHISE MODEL
Marvel, DC, Star Wars, Fast & Furious, Harry Potter — intellectual property as the dominant creative and financial model. These franchises generate billions but are criticized for homogenizing visual style and narrative ambition.

THE A24 PHENOMENON
A24 (founded 2012) became the defining independent studio of the 2010s-2020s by combining auteur-driven filmmaking with sophisticated marketing: "Moonlight," "Lady Bird," "Hereditary," "Everything Everywhere All at Once," "The Whale."

INTERNATIONAL BREAKTHROUGH
"Parasite" (Bong Joon-ho, 2019) won Best Picture at the Oscars — the first non-English-language film to do so. This moment, combined with streaming's global reach, accelerated international cinema's visibility: Korean, Indian, Japanese, Nigerian, and Latin American films now reach worldwide audiences routinely.

AI AND THE FUTURE
Generative AI for scriptwriting, pre-visualization, and visual effects is the industry's most contentious frontier. The 2023 WGA strike established guardrails. The fundamental question: how do we preserve human artistry while embracing tools that can accelerate production?

THE ENDURING TRUTH
Technology changes. Platforms change. Distribution changes. The fundamentals don't: a compelling character, a well-told story, an image that makes you feel something. That's what film school actually teaches — regardless of which school or which era.`}</Pre>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </PageSection>
      </main>
    </div>
  );
};

