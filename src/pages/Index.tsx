import { Link } from 'react-router-dom';
import { FileText, Library, Users, Rocket, Film, Feather, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const TOOLS = [
  {
    href: '/script-formatter',
    icon: FileText,
    name: 'Script Formatter',
    desc: 'Convert freeform prose into graphic novel scripts, TV screenplays, feature films, or stage plays.',
    status: 'live',
  },
  {
    href: '/narrative-engine',
    icon: Sparkles,
    name: 'Narrative Engine',
    desc: 'Plan story arcs, emotional beats, and scene structure with AI assistance.',
    status: 'phase-2',
  },
  {
    href: '/character-builder',
    icon: Users,
    name: 'Character Builder',
    desc: 'Craft characters with archetypes, appearances, backstories, and relationship maps.',
    status: 'phase-2',
  },
  {
    href: '/library',
    icon: Library,
    name: 'Library',
    desc: 'All your saved scripts, drafts, and versions in one place.',
    status: 'live',
  },
  {
    href: '/astralnaut-studios',
    icon: Rocket,
    name: 'Astralnaut Studios',
    desc: 'Children of Aquarius, Battlefield: Atlantis, Darker Ages, and more.',
    status: 'phase-2',
  },
  {
    href: '/film-school',
    icon: Film,
    name: 'Film School',
    desc: 'Study craft through annotated breakdowns of screenwriting fundamentals.',
    status: 'phase-2',
  },
];

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="star-field relative overflow-hidden">
        <div className="hero-gradient absolute inset-0" />
        <div className="relative max-w-5xl mx-auto px-4 py-20 md:py-32">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-4 animate-slide-up">
            ° CELSIUS
          </p>
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl tracking-wider mb-6 text-glow animate-slide-up">
            Transform Screenplays
            <br />
            Into Graphic Novels
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-8 leading-relaxed animate-slide-up">
            Professional script formatting, narrative planning, and character tools — built for writers of comics,
            television, film, and stage.
          </p>
          <div className="flex flex-wrap gap-3 animate-slide-up">
            <Link to="/script-formatter">
              <Button size="lg" className="font-mono tracking-wide">
                Start Formatting <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
            <Link to="/library">
              <Button size="lg" variant="outline">
                My Library
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Tools grid */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">The Workshop</p>
        <h2 className="font-display text-3xl md:text-4xl tracking-wider mb-10">Tools</h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isLive = tool.status === 'live';
            return (
              <Link
                key={tool.href}
                to={tool.href}
                className="group relative rounded-lg border border-border bg-card p-6 border-glow transition-all hover:-translate-y-0.5"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  {isLive ? (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  ) : (
                    <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                      Phase 2
                    </span>
                  )}
                </div>
                <h3 className="font-display text-lg tracking-wide mb-2">{tool.name}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{tool.desc}</p>
                <div className="mt-4 flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-primary opacity-0 transition-opacity group-hover:opacity-100">
                  Open <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-mono text-xs text-muted-foreground">Celsius © 2026 — Built on Next.js</p>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <Link to="/terms" className="hover:text-foreground">
              Terms
            </Link>
            <Link to="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link to="/cookies" className="hover:text-foreground">
              Cookies
            </Link>
            <Link to="/compliance" className="hover:text-foreground">
              Compliance
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
