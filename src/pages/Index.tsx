import { Link } from 'react-router-dom';
import { FileText, Library, Users, Rocket, Film, Sparkles } from 'lucide-react';
import { HudConsole } from '@/components/jarvis/HudConsole';
import { ToolCard } from '@/components/jarvis/ToolCard';

const TOOLS = [
  { href: '/script-formatter', icon: FileText, name: 'Script Formatter',
    desc: 'Convert freeform prose into graphic novel scripts, TV screenplays, feature films, or stage plays — instantly compliant with industry standards.',
    status: 'live' as const, cta: 'Launch' },
  { href: '/narrative-engine', icon: Sparkles, name: 'Narrative Engine',
    desc: 'Plan story arcs, emotional beats, and scene structure with adaptive AI assistance. Reverse-engineer pacing from beloved works.',
    status: 'phase' as const },
  { href: '/character-builder', icon: Users, name: 'Character Builder',
    desc: 'Craft characters with archetypes, appearances, backstories, and relationship maps. Memory persists across every script.',
    status: 'phase' as const },
  { href: '/library', icon: Library, name: 'Library',
    desc: 'All your saved scripts, drafts, and projects — versioned, searchable, ready to recall. Time-travel through your own canon.',
    status: 'live' as const, cta: 'Open' },
  { href: '/astralnaut-studios', icon: Rocket, name: 'Astralnaut Studios',
    desc: 'Children of Aquarius. Battlefield: Atlantis. Darker Ages. Step into curated worlds with pre-built canon and characters.',
    status: 'phase' as const },
  { href: '/film-school', icon: Film, name: 'Film School',
    desc: 'Study craft through annotated screenplays, structural breakdowns, and dialogue analysis from masters of the form.',
    status: 'phase' as const },
];

export default function Index() {
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-12">
        {/* HERO */}
        <section className="mb-14 grid items-center gap-6 lg:gap-10 grid-cols-1 lg:[grid-template-columns:1.05fr_1fr]">
          <div>
            <div className="mb-[18px] inline-flex items-center gap-2 rounded-full border border-[hsl(var(--primary)/0.42)] bg-[hsl(var(--primary)/0.06)] px-2.5 py-1 text-[10px] uppercase tracking-[0.24em] text-primary">
              <span className="status-dot" style={{ background: 'hsl(var(--primary))', boxShadow: '0 0 8px hsl(var(--primary))' }} />
              ° CELSIUS · WORKSHOP ONLINE
            </div>
            <h1
              className="mb-[18px] font-display font-bold uppercase text-foreground"
              style={{ fontSize: 'clamp(36px, 6vw, 64px)', lineHeight: 0.95, letterSpacing: '-0.02em' }}
            >
              Transform<br />
              screenplays into<br />
              <span className="text-primary text-glow-pink">graphic novels.</span>
            </h1>
            <p className="mb-6 max-w-[460px] font-mono text-sm text-[hsl(var(--text-1))]">
              Professional script formatting, narrative planning, and character tools —
              engineered for writers of comics, television, film, and stage. Watch your prose become panels.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/script-formatter" className="jbtn primary">
                Initialize Workshop <span className="arrow">→</span>
              </Link>
              <Link to="/library" className="jbtn ghost">
                Open Library
              </Link>
            </div>
          </div>

          <HudConsole />
        </section>

        {/* TOOLS */}
        <section className="mb-14">
          <div className="mb-[22px] flex items-baseline gap-4 border-b border-dashed border-[hsl(var(--primary)/0.18)] pb-3">
            <div>
              <div className="text-[10px] uppercase tracking-[0.24em] text-muted-foreground">// THE WORKSHOP</div>
              <h2 className="font-display text-2xl uppercase tracking-[0.04em] text-foreground">Tools</h2>
            </div>
            <div className="ml-auto text-[10px] tracking-[0.2em] text-primary">06 MODULES</div>
          </div>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map(t => <ToolCard key={t.href} {...t} />)}
          </div>
        </section>

        {/* Footer strip */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-[hsl(var(--primary)/0.18)] py-4 text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground-2))]">
          <div>CELSIUS · <b className="text-primary">HEROLINC</b> · WORKSHOP v1.9</div>
          <div>WRITERS ONLINE · <b className="text-primary">1,284</b></div>
          <div>SYS · NOMINAL · <b style={{ color: 'hsl(var(--good))' }}>●</b></div>
        </div>

        <div className="mt-3 flex flex-wrap gap-4 text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground-2))]">
          <Link to="/terms" className="hover:text-foreground">Terms</Link>
          <Link to="/privacy" className="hover:text-foreground">Privacy</Link>
          <Link to="/cookies" className="hover:text-foreground">Cookies</Link>
          <Link to="/compliance" className="hover:text-foreground">Compliance</Link>
          <Link to="/dpa" className="hover:text-foreground">DPA</Link>
          <Link to="/acceptable-use" className="hover:text-foreground">Acceptable Use</Link>
          <Link to="/patents" className="hover:text-foreground">Patents</Link>
        </div>
      </div>
    </div>
  );
}
