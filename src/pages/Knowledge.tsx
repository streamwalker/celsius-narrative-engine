import { useEffect } from 'react';
import {
  HighlightedTerm,
  PlainEnglishToggle,
  ContextCallout,
  ReadMoreSection,
  FAQBlock,
  ExplainerAccordion,
  ConceptCard,
  ComparisonTable,
  FootnotesProvider,
  FootnoteLink,
  FootnotesList,
  TimelineModule,
  BreadcrumbContext,
  AnnotatedImage,
  InteractiveDiagram,
  VideoExplainer,
  PronunciationButton,
  WhyItMattersPanel,
} from '@/components/knowledge';

export default function Knowledge() {
  useEffect(() => {
    document.title = 'Knowledge Layer — Interactive context system';
  }, []);

  return (
    <FootnotesProvider>
      <main className="min-h-screen px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-12">
        <BreadcrumbContext
          items={[
            { label: 'Home', to: '/' },
            { label: 'Knowledge' },
          ]}
        />

        <header className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Interactive Knowledge Layer</h1>
            <p className="text-sm text-muted-foreground mt-2 max-w-2xl">
              Hover or tap any highlighted term to see definitions, plain-English explanations,
              and side-panel deep dives. Toggle Plain English Mode to simplify the page.
            </p>
          </div>
          <PlainEnglishToggle />
        </header>

        <section className="text-foreground/90 leading-relaxed space-y-4">
          <p>
            When an <HighlightedTerm termId="astralnaut" />{' '}
            <PronunciationButton word="Astralnaut" phonetic="/ˈæs.trə.nɔːt/" /> dives into the{' '}
            <HighlightedTerm termId="astral_field" />, only a calibrated{' '}
            <HighlightedTerm termId="resonance_suit" variant="popover" /> can keep their mind
            intact.<FootnoteLink id="suit-history">First documented in the trial of the Nine Houses, c. AY 412.</FootnoteLink>{' '}
            The <HighlightedTerm termId="aquarius_order" /> watches every dive from the{' '}
            <HighlightedTerm termId="silent_waters" variant="tooltip" /> below the cathedrals.
          </p>
          <p>
            Our platform — the <HighlightedTerm termId="celsius_engine" /> — applies the same
            rigor to your scripts using <HighlightedTerm termId="tri_axis" />.<FootnoteLink id="engine-cite">
              See: Celsius Narrative Engine technical brief, §2.
            </FootnoteLink>
          </p>
        </section>

        <ContextCallout kind="simple">
          Think of the Astral Field as a giant invisible internet for thoughts — and Astralnauts
          as the only people trained to log in safely.
        </ContextCallout>

        <WhyItMattersPanel>
          Every faction in the universe is fighting over who gets to map and exploit the Astral
          Field. Understanding the field is the key to understanding every plot.
        </WhyItMattersPanel>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Concept cards</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <ConceptCard termId="astralnaut" />
            <ConceptCard termId="astral_field" />
            <ConceptCard termId="resonance_suit" />
            <ConceptCard termId="aquarius_order" />
            <ConceptCard termId="celsius_engine" />
            <ConceptCard termId="tri_axis" />
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Annotated image</h2>
          <AnnotatedImage
            src="/placeholder.svg"
            alt="Resonance suit schematic"
            markers={[
              { id: 'helm', x: 50, y: 18, label: 'Resonance Helm', description: 'Bone-channel implants tune the wearer to the Field.', termId: 'resonance_suit' },
              { id: 'core', x: 50, y: 55, label: 'Chant Core', description: 'Drives resonance via a rotating chant-protocol.', termId: 'astral_field' },
              { id: 'sigil', x: 30, y: 75, label: 'Sigil of Nine', description: 'Marks a sealed astralnaut authorized to dive.', termId: 'sigil_of_nine' },
            ]}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Interactive diagram</h2>
          <InteractiveDiagram
            height={320}
            caption="Tap a node to see the relationship."
            nodes={[
              { id: 'order', label: 'Order of Aquarius', x: 50, y: 12, termId: 'aquarius_order', description: 'Trains and authorizes astralnauts.' },
              { id: 'astro', label: 'Astralnauts', x: 20, y: 55, termId: 'astralnaut', description: 'The travelers.' },
              { id: 'suit', label: 'Resonance Suit', x: 50, y: 55, termId: 'resonance_suit', description: 'The enabling tech.' },
              { id: 'field', label: 'Astral Field', x: 80, y: 55, termId: 'astral_field', description: 'The substrate.' },
              { id: 'concord', label: 'Concord of Silent Waters', x: 50, y: 92, termId: 'concord_silent_waters', description: 'The treaty governing dives.' },
            ]}
            edges={[
              { from: 'order', to: 'astro' },
              { from: 'order', to: 'suit' },
              { from: 'astro', to: 'suit' },
              { from: 'suit', to: 'field' },
              { from: 'order', to: 'concord' },
              { from: 'concord', to: 'field' },
            ]}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Timeline</h2>
          <TimelineModule
            items={[
              {
                date: 'AY 0',
                title: 'The First Resonance',
                short: 'A signal of unknown origin opens the Astral Field to human awareness.',
                relatedTermIds: ['astral_field'],
              },
              {
                date: 'AY 412',
                title: 'Trial of the Nine Houses',
                short: 'The first standardized Resonance Suit is approved.',
                full: 'After two decades of fatal experimentation, House Veres delivers a calibrated suit that survives a 30-minute dive.',
                relatedTermIds: ['resonance_suit'],
              },
              {
                date: 'AY 877',
                title: 'Concord of Silent Waters signed',
                short: 'Treaty codifying who may dive and at what depth.',
                relatedTermIds: ['concord_silent_waters', 'aquarius_order'],
              },
            ]}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Read more</h2>
          <ReadMoreSection
            preview={
              <p>
                The Concord of Silent Waters codifies who may dive, when, and at what depth — it
                is renewed every nine years under starlight…
              </p>
            }
          >
            <p>
              Each renewal is a political event in itself. The Houses negotiate access quotas,
              the Order audits suit calibrations, and the Sigil of Nine is re-burned on every
              sealed astralnaut still in service. Rejection of the Concord is, by treaty, an act
              of war.
            </p>
          </ReadMoreSection>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Comparison</h2>
          <ComparisonTable
            rows={[
              {
                term: 'Astralnaut',
                meaning: 'A trained traveler of the Astral Field.',
                plain: 'A space-mind explorer.',
                related: 'Resonance Suit',
                whyItMatters: 'They are the only legal travelers.',
              },
              {
                term: 'Echo Disorder',
                meaning: 'Persistent intrusion of foreign thought after a dive.',
                plain: 'Hearing thoughts that are not yours.',
                related: 'Astral Field',
                whyItMatters: 'Most veteran astralnauts carry mild forms.',
              },
            ]}
          />
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-3">Video explainer</h2>
          <VideoExplainer
            src="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
            title="Sample video explainer"
            caption="Drop in any YouTube, Vimeo, Loom, or direct video URL."
          />
        </section>

        <FAQBlock
          items={[
            {
              q: 'What is the Astral Field?',
              a: (
                <>
                  It's the non-local layer where thought, time, and gravity behave as gradients.
                  See the <HighlightedTerm termId="astral_field" variant="tooltip" /> entry.
                </>
              ),
            },
            {
              q: 'Why does Plain English Mode exist?',
              a: 'To make complex worldbuilding and technical concepts approachable without dumbing them down.',
            },
            {
              q: 'How do I add new terms?',
              a: 'Add an entry to src/lib/knowledge-glossary.ts and reference it via <HighlightedTerm termId="…" />.',
            },
          ]}
        />

        <FootnotesList />
      </main>
    </FootnotesProvider>
  );
}
