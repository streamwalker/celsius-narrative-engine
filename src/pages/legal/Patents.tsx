import { Link } from 'react-router-dom';
import { LegalFooter } from '@/components/LegalFooter';
import { PatentDiagram } from '@/components/PatentDiagram';
import { PriorArtResearchSection } from '@/components/PriorArtResearchSection';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ArrowLeft, Cpu, Workflow } from 'lucide-react';

type FilingStatus = 'provisional' | 'pending' | 'granted' | 'preparation';

interface SubComponent {
  name: string;
  description: string;
}

interface ProvisionalFiling {
  id: string;
  diagramId: string;
  title: string;
  icon: React.ElementType;
  status: FilingStatus;
  filingDate?: string;
  description: string;
  claims: string[];
  subComponents: SubComponent[];
  priorArtSummary: string;
}

const statusConfig: Record<FilingStatus, { label: string; className: string }> = {
  granted: { label: 'Granted', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  pending: { label: 'Pending', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  provisional: { label: 'Provisional Filed', className: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  preparation: { label: 'In Preparation', className: 'bg-muted text-muted-foreground border-border' },
};

const provisionals: ProvisionalFiling[] = [
  {
    id: 'core-system',
    diagramId: 'core-system',
    title: 'System and Method for Multi-Axis Narrative Modeling with Real-Time Diagnostic Feedback',
    icon: Cpu,
    status: 'provisional',
    filingDate: '2025-Q2',
    description:
      'A software system that processes narrative input as structured data across three simultaneous computation axes (A-AXIS, B-AXIS, C-AXIS), each maintained as independent state machines. The system executes real-time diagnostic evaluation of data completeness, inter-axis causal dependency validation, and outputs computed scalar metrics including the Celsius Tension Index™ (0–100), Narrative Pressure Score™, and Axis Stability Rating™. Includes a medium-aware parameter adjustment module that calibrates processing against comic page, TV episode, or film act conventions, and a script parsing engine that extracts structured panel data with character consistency modeling.',
    claims: [
      'A tri-axis structured data model maintaining independent A/B/C computation axes with per-axis state machines and structured opposition logic as a first-class axis (C-AXIS)',
      'A real-time diagnostic engine that evaluates data completeness across all three axes simultaneously, detecting missing data nodes, unresolved dependency chains, and structural imbalances per act segment',
      'An inter-axis causal dependency graph with cross-act validation that computes how mutations in one axis propagate to the other two',
      'Celsius Tension Index™ — a computed 0–100 scalar derived from scene-level conflict density, dialogue weight, and causality chain length',
      'Narrative Pressure Score™ — a conflict density metric computed from dialogue-to-action ratios, opposition frequency, and causal event clustering',
      'Axis Stability Rating™ — a per-scene weight vector showing active axes and their relative contribution to structural integrity',
      'A medium-aware parameter adjustment module that calibrates structural validation against format-specific conventions (comic page counts, TV episode beat density, film act proportions)',
      'A script parsing engine that extracts structured panel data (descriptions, dialogue, narration, character references) with a character consistency model using feature preservation weights for cross-panel visual identity',
      'A batch generation queue with priority scheduling, progress tracking, and art style application layer supporting multiple visual renderers with consistent character modeling',
    ],
    subComponents: [
      { name: 'Celsius Narrative Triad™', description: 'Tri-axis data architecture with A/B/C state machines and proprietary metrics computation' },
      { name: 'Multi-Threaded Narrative Engine', description: 'Parallel thread data model with real-time gap detection and act-based segmentation logic' },
      { name: 'Medium-Aware AI Analysis Module', description: 'Format detection and parameter adjustment for medium-specific structural validation' },
      { name: 'Script-to-Visual Generation Pipeline', description: 'Script parsing, character consistency modeling, and sequential art generation system' },
    ],
    priorArtSummary:
      'Existing writing tools (Final Draft, Scrivener) provide linear outlining without parallel-axis data modeling or real-time diagnostic computation. General-purpose AI assistants (ChatGPT, Sudowrite) deliver format-agnostic text feedback without medium-calibrated structural analysis. Image generation tools (Midjourney, DALL-E) operate on single prompts without cross-image character consistency or script parsing.',
  },
  {
    id: 'interface-transformation',
    diagramId: 'interface-transformation',
    title: 'Interactive Narrative Visualization and Cross-Format Story Transformation System',
    icon: Workflow,
    status: 'provisional',
    filingDate: '2025-Q2',
    description:
      'A software system providing multi-lane timeline rendering with bidirectional synchronization between timeline UI state and document scroll/expand state, a structured mapping layer that converts prose-form archives into keyed field data for cross-module transport, and a side-by-side structural comparison renderer with aligned section diffing. The system executes client-side data transformation pipelines that shuttle structured data between independent application modules via storage-based auto-import triggers.',
    claims: [
      'A multi-lane timeline renderer displaying parallel data streams across act-boundary segments with bidirectional sync between timeline interaction events and document scroll position / section expand-collapse state',
      'Act-proportional lane sizing computed from data weight distribution across structural segments',
      'Color-coded beat indicators with hover-triggered preview rendering and completion state tracking',
      'A structured mapping layer that converts prose-form narrative archives into keyed field data matching target application schemas, with automatic field population and section auto-expansion on import',
      'A cross-module data shuttle using client-side storage for zero-latency inter-tool structured data transfer with toast confirmation feedback',
      'Bidirectional data porting between narrative engine and script formatter modules via extensible source-to-target field transformation architecture',
      'A side-by-side structural comparison renderer that extracts data templates from reference works and displays them with aligned section diffing, beat-level difference highlighting, and hoverable contextual examples from 25+ reference datasets',
      'Responsive timeline adaptation from horizontal (desktop) to vertical (mobile) rendering orientation',
    ],
    subComponents: [
      { name: 'Interactive Visual Timeline', description: 'Multi-lane beat visualization with bidirectional UI-to-document synchronization' },
      { name: 'Cross-Tool Porting System', description: 'Structured mapping layer with client-side storage shuttle for cross-module data transfer' },
      { name: 'Structural Comparison Engine', description: 'Side-by-side template rendering with aligned section diffing and beat-level analysis' },
    ],
    priorArtSummary:
      'Timeline tools in project management (Gantt) and video editing (NLEs) do not model structured narrative data. Writing tool import/export is limited to file format conversion (.fdx, .fountain) without live field mapping. Film study tools analyze individual works without side-by-side structural comparison at the data level.',
  },
];

export default function Patents() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-5xl mx-auto px-4 py-12">
        <Link to="/">
          <Button variant="ghost" size="sm" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Home
          </Button>
        </Link>

        <h1 className="text-3xl font-bold mb-2 font-mono tracking-tight">Patent Portfolio</h1>
        <p className="text-muted-foreground mb-6 max-w-2xl">
          Celsius's intellectual property portfolio documenting novel software systems for structured narrative data processing, multi-axis diagnostic computation, and cross-format data transformation.
        </p>

        {/* Summary Stats */}
        <div className="flex flex-wrap gap-3 mb-8">
          <div className="px-4 py-2 rounded-lg bg-secondary border border-border">
            <span className="text-2xl font-bold text-foreground">{provisionals.length}</span>
            <span className="text-xs text-muted-foreground ml-2">Provisional Filings</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
            <span className="text-2xl font-bold text-amber-400">{provisionals.reduce((n, p) => n + p.subComponents.length, 0)}</span>
            <span className="text-xs text-amber-400/70 ml-2">Sub-Components Covered</span>
          </div>
          <div className="px-4 py-2 rounded-lg bg-secondary border border-border">
            <span className="text-2xl font-bold text-muted-foreground">{provisionals.reduce((n, p) => n + p.claims.length, 0)}</span>
            <span className="text-xs text-muted-foreground ml-2">Total Claims</span>
          </div>
        </div>

        {/* Provisional Filings */}
        <div className="grid gap-6">
          {provisionals.map((filing) => {
            const sc = statusConfig[filing.status];
            return (
              <Card key={filing.id} className="bg-card border-border">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-secondary">
                      <filing.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold leading-tight">{filing.title}</CardTitle>
                      {filing.filingDate && (
                        <p className="text-xs text-muted-foreground mt-0.5">Filed: {filing.filingDate}</p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className={sc.className}>
                    {sc.label}
                  </Badge>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{filing.description}</p>

                  {/* Sub-components */}
                  <div className="flex flex-wrap gap-2">
                    {filing.subComponents.map((sub) => (
                      <Badge key={sub.name} variant="secondary" className="text-xs font-normal">
                        {sub.name}
                      </Badge>
                    ))}
                  </div>

                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="claims" className="border-border">
                      <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                        Claims ({filing.claims.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-1.5">
                          {filing.claims.map((claim, i) => (
                            <li key={i} className="text-xs text-foreground/80 flex items-start gap-2">
                              <span className="text-primary mt-0.5 font-mono">{i + 1}.</span>
                              {claim}
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="sub-components" className="border-border">
                      <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                        Consolidated Sub-Components
                      </AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {filing.subComponents.map((sub) => (
                            <li key={sub.name} className="text-xs">
                              <span className="font-medium text-foreground">{sub.name}</span>
                              <span className="text-muted-foreground"> — {sub.description}</span>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="diagram" className="border-border">
                      <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                        Architecture Diagram
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                          <PatentDiagram diagramId={filing.diagramId} />
                        </div>
                      </AccordionContent>
                    </AccordionItem>

                    <AccordionItem value="prior-art" className="border-b-0">
                      <AccordionTrigger className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:no-underline py-2">
                        Prior Art Summary
                      </AccordionTrigger>
                      <AccordionContent>
                        <p className="text-xs text-foreground/80">{filing.priorArtSummary}</p>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <PriorArtResearchSection />

        <div className="mt-12 p-6 rounded-lg bg-secondary/50 border border-border">
          <h2 className="text-lg font-semibold mb-3">Patent & IP Inquiries</h2>
          <p className="text-sm text-muted-foreground mb-2">
            Filing strategy: 2 consolidated provisional applications covering all sub-components.
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            Estimated cost: $6K–$12K (provisionals) · $20K–$40K each (utility conversion).
          </p>
          <ul className="text-sm space-y-1 text-foreground/80">
            <li>IP Counsel: legal@celsius.io</li>
            <li>Licensing: licensing@celsius.io</li>
          </ul>
        </div>
      </div>
      <LegalFooter />
    </div>
  );
};

