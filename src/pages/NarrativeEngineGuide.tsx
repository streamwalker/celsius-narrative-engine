import { Link } from "react-router-dom";
import { ArrowLeft, Dna, BookOpen, Target, Heart, Skull, Zap, AlertTriangle, Wand2, LayoutGrid, Settings2, Film, Save, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { LegalFooter } from "@/components/LegalFooter";

const tocSections = [
  { id: "getting-started", label: "Getting Started" },
  { id: "core-dna", label: "Core Story DNA" },
  { id: "three-axes", label: "The Three Axes" },
  { id: "act-structure", label: "Act Structure" },
  { id: "format-pacing", label: "Format & Pacing" },
  { id: "timeline", label: "Story Thread Timeline" },
  { id: "scene-engine", label: "Scene Engine" },
  { id: "ai-consultant", label: "AI Story Consultant" },
  { id: "diagnostics", label: "Failure Diagnostics" },
  { id: "projects", label: "Projects & Saving" },
  { id: "templates", label: "Film Templates & Examples" },
  { id: "tips", label: "Tips & Shortcuts" },
];

export default function NarrativeEngineGuide() {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="container max-w-4xl mx-auto flex items-center gap-4 py-4 px-4">
          <Link to="/narrative-engine">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Engine
            </Button>
          </Link>
          <h1 className="text-sm font-['Orbitron'] tracking-[0.15em] text-primary uppercase flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            User Guide
          </h1>
        </div>
      </header>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center text-center px-4 py-16">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-3">Celsius Narrative Triad™</p>
        <h1 className="text-3xl sm:text-5xl font-['Orbitron'] tracking-[0.12em] text-primary mb-4">
          NARRATIVE ENGINE
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-xl">
          Complete guide to building character-driven, multi-threaded narratives with the Tri-Axis Story Architecture.
        </p>
      </section>

      <main className="container max-w-4xl mx-auto px-4 pb-20 -mt-4 relative z-10 space-y-10">
        {/* Table of Contents */}
        <div className="bg-card border border-border rounded-lg p-6">
          <h2 className="text-sm font-['Orbitron'] text-foreground mb-4">TABLE OF CONTENTS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {tocSections.map((s, i) => (
              <button
                key={s.id}
                onClick={() => scrollTo(s.id)}
                className="text-left text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
              >
                <span className="text-xs font-mono text-muted-foreground/50 w-5">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sections */}
        <Accordion type="multiple" defaultValue={["getting-started"]} className="space-y-4">
          {/* 1. Getting Started */}
          <AccordionItem value="getting-started" id="getting-started" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Dna className="w-4 h-4" /> 01 — Getting Started</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>The <strong className="text-foreground">Narrative Engine</strong> is Celsius's core story-building tool. It uses the <strong className="text-primary">Celsius Narrative Triad™</strong> — a Tri-Axis Story Architecture that models your narrative across three simultaneous axes:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><Badge variant="outline" className="border-blue-500/50 text-blue-400 text-[10px]">A-AXIS</Badge> — External Drive (plot, goals, stakes)</li>
                <li><Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">B-AXIS</Badge> — Internal Resistance (flaws, psychology, growth)</li>
                <li><Badge variant="outline" className="border-red-500/50 text-red-400 text-[10px]">C-AXIS</Badge> — Opposition Intelligence (antagonist logic, escalation)</li>
              </ul>
              <p><strong className="text-foreground">Start with Core Story DNA.</strong> Theme, protagonist, archetype, flaw, misbelief, objective, and antagonist. If the DNA is weak, everything built on top will fail. The engine enforces this — the Scene Engine won't activate until minimum fields are filled.</p>
              <p>Work top to bottom: DNA → Act I → Act II → Act III → Denouement → Scene Engine → AI Consultant.</p>
            </AccordionContent>
          </AccordionItem>

          {/* 2. Core Story DNA */}
          <AccordionItem value="core-dna" id="core-dna" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Dna className="w-4 h-4" /> 02 — Core Story DNA</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>Ten fields that define your story's genetic code:</p>
              <div className="space-y-3">
                <div><strong className="text-foreground">Theme</strong> — The non-negotiable truth your story proves. Not a topic ("revenge"), but a statement ("revenge destroys the avenger"). Every scene should reinforce or challenge this.</div>
                <div><strong className="text-foreground">Protagonist Name & Archetype</strong> — Who they are and what pattern they follow. Archetypes (Reluctant Hero, Anti-Hero, Everyman) set audience expectations.</div>
                <div><strong className="text-foreground">Core Flaw</strong> — Their internal weakness. Not a charming quirk — it's the thing that will destroy them if left unchecked.</div>
                <div><strong className="text-foreground">Misbelief</strong> — The lie they live by. Their entire arc is about confronting this false truth.</div>
                <div><strong className="text-foreground">Primary Objective</strong> — Must be stated as: "Must achieve ___ BEFORE ___ or ___ (irreversible consequence)." Vague goals = weak stories.</div>
                <div><strong className="text-foreground">Antagonist</strong> — Name, desire, belief system, and flaw. The best antagonists believe they're right and have a mirror relationship to the protagonist.</div>
              </div>
              <p className="text-xs text-muted-foreground/80 italic">Common mistake: Making the antagonist "evil." Give them logic. If you can't argue their side, they're too weak.</p>
            </AccordionContent>
          </AccordionItem>

          {/* 3. Three Axes */}
          <AccordionItem value="three-axes" id="three-axes" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Target className="w-4 h-4" /> 03 — The Three Axes</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <div className="space-y-4">
                <div className="border-l-2 border-blue-500/50 pl-4">
                  <h4 className="text-foreground font-semibold flex items-center gap-2"><Badge variant="outline" className="border-blue-500/50 text-blue-400">A-AXIS</Badge> External Drive</h4>
                  <p className="mt-1">What the protagonist wants. The engine of plot. Drives forward momentum — goals, plans, wins, complications, climax. If nobody wants anything, nothing happens.</p>
                </div>
                <div className="border-l-2 border-amber-500/50 pl-4">
                  <h4 className="text-foreground font-semibold flex items-center gap-2"><Badge variant="outline" className="border-amber-500/50 text-amber-400">B-AXIS</Badge> Internal Resistance</h4>
                  <p className="mt-1">What's stopping them from within. Flaws, contradictions, internal blocks. Creates character depth and determines whether the protagonist transforms or breaks.</p>
                </div>
                <div className="border-l-2 border-red-500/50 pl-4">
                  <h4 className="text-foreground font-semibold flex items-center gap-2"><Badge variant="outline" className="border-red-500/50 text-red-400">C-AXIS</Badge> Opposition Intelligence</h4>
                  <p className="mt-1">The antagonist's logic system. Their motivation, adaptability, and escalation. Most frameworks stop at A+B — the C-AXIS is what separates functional stories from exceptional ones.</p>
                </div>
              </div>
              <p>All three axes must operate simultaneously across all three acts. A scene that only activates one axis is usually a weak scene.</p>
            </AccordionContent>
          </AccordionItem>

          {/* 4. Act Structure */}
          <AccordionItem value="act-structure" id="act-structure" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> 04 — Act Structure</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <div className="space-y-3">
                <div>
                  <h4 className="text-foreground font-semibold">ACT I — Setup (~25% of story)</h4>
                  <p>Establish the world, introduce the protagonist, plant the flaw, trigger the conflict. Ends at the Point of No Return.</p>
                  <p className="text-xs mt-1">Key beats: Who wants what → Why now → Inciting Incident → Point of No Return</p>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">ACT II — Confrontation (~50% of story)</h4>
                  <p>The protagonist executes their plan, wins small victories, hits the Midpoint (wrong choice, right reason), faces escalating opposition, and crashes at the Low Point.</p>
                  <p className="text-xs mt-1">Key beats: Plan → Wins → Midpoint Trap → Complications → Low Point</p>
                </div>
                <div>
                  <h4 className="text-foreground font-semibold">ACT III — Resolution (~25% of story)</h4>
                  <p>The protagonist faces their misbelief (Revelation), makes a new decision, executes the real plan, confronts the antagonist, and pays the cost of victory.</p>
                  <p className="text-xs mt-1">Key beats: Revelation → New Decision → Climax → Sacrifice → Denouement</p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 5. Format & Pacing */}
          <AccordionItem value="format-pacing" id="format-pacing" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Settings2 className="w-4 h-4" /> 05 — Format & Pacing</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>Select your medium to get pacing guidance tailored to your format:</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-foreground">Feature Film</strong> — 90–150 min. ~1 script page per minute. Classic 3-act structure with inciting incident, midpoint, low point, climax markers.</li>
                <li><strong className="text-foreground">TV Episode</strong> — 22–60 min. Teaser + act structure with commercial break points. Shorter runtime means tighter beats.</li>
                <li><strong className="text-foreground">TV Series</strong> — Season-level planning. Set episode count and length, get setup/escalation/resolution episode ranges and midpoint placement.</li>
                <li><strong className="text-foreground">Comic Book</strong> — 20 or 32 pages per issue, 4–12 issue series. Pacing calculates total pages, act breaks by issue, and midpoint placement.</li>
                <li><strong className="text-foreground">Stage Play</strong> — 1-act to 5-act structures, 60–150 min runtime. Includes intermission placement and scene-change guidance.</li>
              </ul>
              <p>The medium selection also feeds into the Scene Engine, adjusting expected scene counts and structural beats.</p>
            </AccordionContent>
          </AccordionItem>

          {/* 6. Timeline */}
          <AccordionItem value="timeline" id="timeline" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Zap className="w-4 h-4" /> 06 — Story Thread Timeline</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>The visual timeline shows all three axes across three acts, with individual beats as dots.</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-foreground">Filled dots</strong> — Beat has content written. Color-coded to its axis.</li>
                <li><strong className="text-foreground">Empty dots</strong> — Beat is incomplete. Shows as a hollow circle.</li>
                <li><strong className="text-foreground">Click any dot</strong> — Jumps directly to that section and auto-opens it.</li>
                <li><strong className="text-foreground">Hover</strong> — Shows a preview of the beat's content (first 80 characters).</li>
              </ul>
              <p>The Denouement bar at the bottom tracks resolution beats separately (Truth, Protagonist change, Cost of victory).</p>
            </AccordionContent>
          </AccordionItem>

          {/* 7. Scene Engine */}
          <AccordionItem value="scene-engine" id="scene-engine" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><LayoutGrid className="w-4 h-4" /> 07 — Scene Engine</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>The Scene Engine decomposes your narrative into structured, causally-linked scenes. It activates once you've filled at least 4 Core DNA fields.</p>
              <div className="space-y-3">
                <div><strong className="text-foreground">Build Scenes</strong> — Click to generate a full scene breakdown using AI. Scenes are structured with purpose, summary, tone, conflict, dialogue density, and causality chains.</div>
                <div><strong className="text-foreground">Celsius Tension Index™</strong> — Each scene has an energy level (0–100°C) displayed as a temperature gauge. Track dramatic tension across your entire story.</div>
                <div><strong className="text-foreground">Narrative Pressure Score™</strong> — Computed from conflict density and dialogue intensity. Displayed as Low / Medium / High / Critical.</div>
                <div><strong className="text-foreground">Axis Stability Rating™</strong> — Shows which axes (A/B/C) are active per scene and their relative weight.</div>
                <div><strong className="text-foreground">Scene Editing</strong> — Click any scene to expand its detail panel. Edit fields directly, then save changes.</div>
                <div><strong className="text-foreground">Regenerate</strong> — Regenerate individual scenes without rebuilding the entire breakdown.</div>
                <div><strong className="text-foreground">Reorder</strong> — Drag scenes or use arrow controls to reorder the sequence.</div>
                <div><strong className="text-foreground">Medium Toggle</strong> — Switch between film, TV, comic, and stage play modes. Scene count and structure adapt automatically.</div>
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* 8. AI Consultant */}
          <AccordionItem value="ai-consultant" id="ai-consultant" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Wand2 className="w-4 h-4" /> 08 — AI Story Consultant</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>The AI Story Consultant analyzes your entire narrative and provides professional-level feedback.</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong className="text-foreground">Click "Analyze Story"</strong> — The AI reads all filled fields and streams a detailed analysis.</li>
                <li>It evaluates: thematic consistency, character arc logic, antagonist credibility, causal connections, pacing, and structural completeness.</li>
                <li>Analysis streams in real-time — you can read as it generates.</li>
                <li><strong className="text-foreground">Copy</strong> — Copy the analysis to clipboard for external use.</li>
                <li><strong className="text-foreground">Print / Save PDF</strong> — Opens a print-formatted version of the analysis report.</li>
              </ul>
              <p className="text-xs italic">Tip: Run the consultant after completing at least Act I and Act II for the most useful feedback. Running on just DNA gives surface-level results.</p>
            </AccordionContent>
          </AccordionItem>

          {/* 9. Diagnostics */}
          <AccordionItem value="diagnostics" id="diagnostics" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> 09 — Failure Diagnostics</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <p>Three binary checks. If a story built with this engine fails, it fails for one of these reasons:</p>
              <ol className="list-decimal list-inside space-y-2 pl-2">
                <li><strong className="text-foreground">The goal wasn't clear</strong> — Checked against the Primary Objective field. If the audience can't state what the protagonist wants in one sentence, the goal is unclear.</li>
                <li><strong className="text-foreground">The flaw didn't matter</strong> — Checked against the Core Flaw field. If the flaw doesn't actively cause failure in Act II and force transformation in Act III, it's decorative.</li>
                <li><strong className="text-foreground">The antagonist wasn't right enough</strong> — Checked against the Antagonist Belief field. If you can't argue the antagonist's position, they're not credible enough to sustain conflict.</li>
              </ol>
              <p>Each check shows green (crossed out) when the field is filled, red when empty. All three must pass.</p>
            </AccordionContent>
          </AccordionItem>

          {/* 10. Projects */}
          <AccordionItem value="projects" id="projects" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Save className="w-4 h-4" /> 10 — Projects & Saving</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li><strong className="text-foreground">Local Save</strong> — Always active. Your data is saved to browser storage automatically when you edit fields.</li>
                <li><strong className="text-foreground">Cloud Save</strong> — Sign in to save projects to the cloud. Multiple projects supported with rename and delete.</li>
                <li><strong className="text-foreground">JSON Export/Import</strong> — Export your story data as a JSON file for backup or sharing. Import from any previously exported file.</li>
                <li><strong className="text-foreground">PDF Export</strong> — Generate a formatted PDF document of your complete narrative, branded with Celsius Narrative Triad™ headers.</li>
                <li><strong className="text-foreground">New Project</strong> — Click "New" in the Projects panel to start fresh. Your previous project stays saved.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>

          {/* 11. Templates */}
          <AccordionItem value="templates" id="templates" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><Film className="w-4 h-4" /> 11 — Film Templates & Examples</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <div className="space-y-3">
                <div><strong className="text-foreground">💡 Lightbulb Icons</strong> — Next to each field label, click the lightbulb to see how professional films and TV shows handle that specific beat. Learn by example.</div>
                <div><strong className="text-foreground">🎬 Full Story DNA Templates</strong> — In the Core DNA section, click "Load Film Template" to populate all fields with a complete breakdown of a famous film or show. Use as a study tool — see how the Triad applies to real stories.</div>
                <div><strong className="text-foreground">📊 Film Compare</strong> — Use the comparison dialog to see how different films handle the same structural beats side by side.</div>
              </div>
              <p className="text-xs italic">Templates load in "Study Mode" — they fill your fields but don't create a project. Modify freely to make the story your own.</p>
            </AccordionContent>
          </AccordionItem>

          {/* 12. Tips */}
          <AccordionItem value="tips" id="tips" className="border border-border rounded-lg px-4 scroll-mt-24">
            <AccordionTrigger className="text-sm font-['Orbitron'] text-primary">
              <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> 12 — Tips & Shortcuts</span>
            </AccordionTrigger>
            <AccordionContent className="text-sm text-muted-foreground space-y-4 leading-relaxed">
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Fill Core Story DNA completely before moving to act structure. The engine is designed to cascade — weak foundations = weak structure.</li>
                <li>Use the progress bar to track completion. Aim for 100% before running the AI Consultant for best results.</li>
                <li>Click timeline dots to jump directly to any section — faster than scrolling.</li>
                <li>The Scene Engine adapts to your medium selection. Switch between film/TV/comic/stage play to see how the same story restructures.</li>
                <li>Export JSON regularly as a backup. Cloud saves are persistent but local backups add safety.</li>
                <li>The Failure Diagnostics section is your final check. If all three items aren't green, go back and fix them before considering the story done.</li>
                <li>Import story plans from Astralnaut Studios — they auto-populate the corresponding fields.</li>
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </main>

      <LegalFooter />
    </div>
  );
};

