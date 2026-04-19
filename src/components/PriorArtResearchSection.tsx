import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search } from 'lucide-react';

interface PriorArtEntry {
  tool: string;
  capability: string;
  gap: string;
}

interface PriorArtComparison {
  provisionalId: string;
  provisionalTitle: string;
  entries: PriorArtEntry[];
}

const priorArtResearch: PriorArtComparison[] = [
  {
    provisionalId: 'core-system',
    provisionalTitle: 'Provisional #1 — Multi-Axis Narrative Modeling System',
    entries: [
      { tool: 'Final Draft', capability: 'Linear scene list with index card view for reordering scenes', gap: 'No multi-axis data model; no real-time diagnostic computation; no structured gap detection across parallel data streams' },
      { tool: 'Scrivener', capability: 'Index card corkboard with folder-based organization and metadata fields', gap: 'No diagnostic engine; no automatic detection of missing data nodes or structural imbalances across act segments' },
      { tool: 'WriterSolo', capability: 'Beat sheet templates with predefined structural models', gap: 'Static templates without real-time validation; no multi-axis processing architecture; no computed metrics output' },
      { tool: 'Dramatica', capability: 'Rule-based theoretical analysis with multi-element structural model', gap: 'No interactive software implementation; no real-time diagnostics; no computed scalar metrics; no medium-aware calibration' },
      { tool: 'ChatGPT / Sudowrite', capability: 'General-purpose AI text feedback on submitted content', gap: 'Format-agnostic processing; no medium-specific parameter adjustment; no structured data model with axis state machines' },
      { tool: 'StudioBinder', capability: 'Production management tools for breakdowns, shot lists, and scheduling', gap: 'Production-oriented, not structural analysis; no diagnostic computation; no multi-axis data processing' },
      { tool: 'Midjourney / DALL-E', capability: 'Single-prompt image generation with style and subject control', gap: 'No cross-image consistency model; no script parsing engine; no sequential output pipeline with character feature preservation' },
      { tool: 'Pixton / Storyboard That', capability: 'Template-based visual creation with drag-and-drop assets', gap: 'Pre-made assets only; no generative pipeline from structured script data; no character consistency computation' },
    ],
  },
  {
    provisionalId: 'interface-transformation',
    provisionalTitle: 'Provisional #2 — Visualization and Cross-Format Transformation System',
    entries: [
      { tool: 'Final Draft', capability: '.fdx file export/import for script interchange between applications', gap: 'File-based format conversion only; no live field mapping; no structured prose-to-keyed-data transformation' },
      { tool: 'Scrivener', capability: 'Compile feature exports to .docx, .pdf, .epub, .fdx formats', gap: 'Output format conversion only; no cross-module interactive field population; no auto-import triggers' },
      { tool: 'Celtx', capability: 'Cloud-based project sync across devices with shared access', gap: 'Same-app sync only; no structured mapping layer; no cross-module data shuttle architecture' },
      { tool: 'Highland', capability: 'Fountain plain-text format with markdown-style writing', gap: 'Text format interchange only; no mapping layer for structured interactive field import across modules' },
      { tool: 'Plottr', capability: 'Linear timeline with character threads and scene cards', gap: 'Single-lane rendering; no multi-lane parallel visualization; no bidirectional sync to document state' },
      { tool: 'Aeon Timeline', capability: 'Chronological timeline with relationship tracking for events', gap: 'Calendar-based, not structure-based; no act-boundary segmentation; no proportional lane sizing from data weights' },
      { tool: 'Milanote', capability: 'Visual mood boards and flexible canvas for creative planning', gap: 'Free-form canvas, not act-structured; no beat-synced navigation; no completion state tracking' },
      { tool: 'TV Tropes', capability: 'Crowdsourced catalogue of patterns and devices', gap: 'Wiki-style text, not structured data; no template extraction; no side-by-side comparison rendering with aligned diffing' },
    ],
  },
];

export const PriorArtResearchSection = () => {
  return (
    <div className="mt-12">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-secondary">
          <Search className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Prior Art Research & Technical Differentiation</h2>
          <p className="text-sm text-muted-foreground">
            Detailed comparison of each provisional filing against existing software tools
          </p>
        </div>
      </div>

      <Accordion type="multiple" className="w-full space-y-3">
        {priorArtResearch.map((comparison) => (
          <AccordionItem
            key={comparison.provisionalId}
            value={comparison.provisionalId}
            className="border border-border rounded-lg px-4 bg-card"
          >
            <AccordionTrigger className="text-sm font-semibold hover:no-underline py-3">
              {comparison.provisionalTitle}
            </AccordionTrigger>
            <AccordionContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-border">
                    <TableHead className="text-xs font-semibold uppercase tracking-wider w-[140px]">Tool</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Capability</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wider">Technical Gap</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {comparison.entries.map((entry, idx) => (
                    <TableRow key={idx} className="border-border">
                      <TableCell className="text-xs font-medium whitespace-nowrap">{entry.tool}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{entry.capability}</TableCell>
                      <TableCell className="text-xs text-primary/90">{entry.gap}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};
