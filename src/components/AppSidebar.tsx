import { Link, useLocation } from "react-router-dom";
import {
  FileText, Library, Users, UserPlus, Rocket, Feather, Film, Sparkles,
  BookOpen, Home, Scale, Wand2, LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

type Status = 'live' | 'phase' | undefined;

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  status?: Status;
}

interface NavSection { label: string; items: NavItem[] }

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workshop",
    items: [
      { href: "/", label: "Home", icon: Home, status: "live" },
      { href: "/script-formatter", label: "Script Formatter", icon: FileText, status: "live" },
      { href: "/library", label: "Library", icon: Library, status: "live" },
      { href: "/narrative-engine", label: "Narrative Engine", icon: Sparkles, status: "phase" },
      { href: "/narrative-engine/panelcraft", label: "Panelcraft", icon: LayoutGrid, status: "phase" },
      { href: "/narrative-engine/panelcraft-2", label: "Panelcraft 2", icon: LayoutGrid, status: "phase" },
      { href: "/letter-page", label: "Letter a Page", icon: Wand2, status: "live" },
    ],
  },
  {
    label: "Characters",
    items: [
      { href: "/characters", label: "Character Library", icon: Users },
      { href: "/character-builder", label: "Character Builder", icon: UserPlus },
    ],
  },
  {
    label: "Astralnaut Studios",
    items: [
      { href: "/astralnaut-studios", label: "Studios Home", icon: Rocket },
      { href: "/astralnaut-studios/children-of-aquarius", label: "Children of Aquarius", icon: Rocket },
      { href: "/astralnaut-studios/battlefield-atlantis", label: "Battlefield: Atlantis", icon: Rocket },
      { href: "/astralnaut-studios/darker-ages", label: "Darker Ages", icon: Rocket },
      { href: "/astralnaut-studios/episode-7", label: "Episode 7", icon: Rocket },
      { href: "/astralnaut-studios/cross-story-cast", label: "Cross-Story Cast", icon: Users },
    ],
  },
  {
    label: "Reference",
    items: [
      { href: "/knowledge", label: "Knowledge Layer", icon: Sparkles },
      { href: "/glossary", label: "Glossary", icon: BookOpen },
      { href: "/shakespeare", label: "Shakespeare", icon: Feather },
      { href: "/film-school", label: "Film School", icon: Film },
      { href: "/narrative-engine/guide", label: "Narrative Guide", icon: BookOpen },
    ],
  },
  {
    label: "Legal",
    items: [
      { href: "/terms", label: "Terms of Service", icon: Scale },
      { href: "/privacy", label: "Privacy Policy", icon: Scale },
      { href: "/cookies", label: "Cookie Policy", icon: Scale },
      { href: "/compliance", label: "Compliance", icon: Scale },
      { href: "/dpa", label: "Data Processing", icon: Scale },
      { href: "/acceptable-use", label: "Acceptable Use", icon: Scale },
      { href: "/patents", label: "Patent Portfolio", icon: Scale },
    ],
  },
];

export function AppSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { pathname } = useLocation();

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex items-center gap-2.5 border-b border-dashed border-[hsl(var(--primary)/0.18)] px-3.5 pb-4 pt-4">
        <div
          className="relative grid h-9 w-9 place-items-center rounded-lg border border-primary"
          style={{
            background: 'radial-gradient(circle, hsl(var(--primary)/0.25), transparent 70%)',
            boxShadow: '0 0 18px hsl(var(--primary)/0.35), inset 0 0 8px hsl(var(--primary)/0.4)',
          }}
        >
          <span className="absolute inset-1 rounded-[5px] border border-[hsl(var(--primary)/0.45)] animate-spin-slow" />
          <span className="font-display text-sm font-bold text-primary" style={{ textShadow: '0 0 8px hsl(var(--primary)/0.55)' }}>
            C°
          </span>
        </div>
        <div className="leading-tight">
          <div className="font-display text-sm font-bold tracking-[0.12em] text-foreground">CELSIUS</div>
          <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.22em] text-muted-foreground">
            Script → Graphic Novel
          </div>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-2.5 py-3.5">
        {NAV_SECTIONS.map((section) => (
          <div key={section.label} className="mb-4">
            <div className="flex items-center justify-between px-1.5 pb-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-[hsl(var(--muted-foreground-2))]">
              <span>{section.label}</span>
              <span className="text-[hsl(var(--primary)/0.42)]">◇</span>
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-2.5 rounded-md border border-transparent px-2.5 py-1.5 text-xs transition-all",
                      isActive
                        ? "text-primary border-[hsl(var(--primary)/0.42)]"
                        : "text-[hsl(var(--text-1))] hover:text-foreground hover:border-[hsl(var(--primary)/0.18)] hover:bg-[hsl(var(--primary)/0.06)]"
                    )}
                    style={isActive ? {
                      background: 'linear-gradient(90deg, hsl(var(--primary)/0.18), hsl(var(--primary)/0.04))',
                      boxShadow: 'inset 2px 0 0 hsl(var(--primary))',
                    } : undefined}
                  >
                    <Icon className={cn("h-3.5 w-3.5 shrink-0", isActive ? "opacity-100" : "opacity-60")} strokeWidth={1.8} />
                    <span className="flex-1 truncate">{item.label}</span>
                    {item.status === 'live' && <span className="status-dot ml-auto" style={{ width: 5, height: 5 }} />}
                    {item.status === 'phase' && <span className="status-dot warn ml-auto" style={{ width: 5, height: 5 }} />}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-[hsl(var(--primary)/0.18)] p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[hsl(var(--muted-foreground-2))]">
          Celsius v1.9 · <span className="text-primary">●</span>
        </p>
      </div>
    </div>
  );
}
