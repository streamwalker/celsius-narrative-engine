import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import {
  HighlightedTerm,
  PlainEnglishToggle,
  ContextCallout,
  ReadMoreSection,
  FAQBlock,
  ConceptCard,
  ComparisonTable,
} from '@/components/knowledge';

export default function Knowledge() {
  useEffect(() => {
    document.title = 'Knowledge Layer — Interactive context system';
  }, []);

  return (
    <main className="min-h-screen px-4 sm:px-8 py-8 max-w-4xl mx-auto space-y-10">
      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="inline h-3 w-3 mx-1" />
        <span className="text-foreground">Knowledge</span>
      </nav>

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

      <section className="prose-invert text-foreground/90 leading-relaxed space-y-4">
        <p>
          When an{' '}
          <HighlightedTerm termId="astralnaut" /> dives into the{' '}
          <HighlightedTerm termId="astral_field" />, only a calibrated{' '}
          <HighlightedTerm termId="resonance_suit" variant="popover" /> can keep their mind
          intact. The <HighlightedTerm termId="aquarius_order" /> watches every dive from the{' '}
          <HighlightedTerm termId="silent_waters" variant="tooltip" /> below the cathedrals.
        </p>
        <p>
          Our platform — the <HighlightedTerm termId="celsius_engine" /> — applies the same
          rigor to your scripts using{' '}
          <HighlightedTerm termId="tri_axis" />.
        </p>
      </section>

      <ContextCallout kind="simple">
        Think of the Astral Field as a giant invisible internet for thoughts — and Astralnauts
        as the only people trained to log in safely.
      </ContextCallout>

      <ContextCallout kind="why">
        Every faction in the universe is fighting over who gets to map and exploit the Astral
        Field. Understanding the field is the key to understanding every plot.
      </ContextCallout>

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
    </main>
  );
}
