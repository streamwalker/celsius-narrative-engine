import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Library,
  Users,
  UserPlus,
  Rocket,
  Feather,
  Film,
  Sparkles,
  BookOpen,
  Home,
  Scale,
  ChevronRight,
  Wand2,
  LayoutGrid,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  label: string;
  items: NavItem[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Workshop",
    items: [
      { href: "/", label: "Home", icon: Home },
      { href: "/script-formatter", label: "Script Formatter", icon: FileText },
      { href: "/library", label: "Library", icon: Library },
      { href: "/narrative-engine", label: "Narrative Engine", icon: Sparkles },
      { href: "/narrative-engine/panelcraft", label: "Panelcraft", icon: LayoutGrid },
      { href: "/narrative-engine/panelcraft-2", label: "Panelcraft 2", icon: LayoutGrid },
      { href: "/letter-page", label: "Letter a Page", icon: Wand2 },
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
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <div className="flex h-full flex-col">
      {/* Brand */}
      <div className="flex h-14 items-center gap-2 border-b border-border px-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10">
          <span className="font-display text-sm font-bold text-primary">C°</span>
        </div>
        <div className="flex flex-col leading-tight">
          <span className="font-display text-sm tracking-widest">CELSIUS</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            Script → Graphic Novel
          </span>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-2 py-4">
        {NAV_SECTIONS.map((section, sectionIdx) => (
          <div key={section.label} className={cn(sectionIdx > 0 && "mt-4")}>
            <div className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {section.label}
            </div>
            <nav className="space-y-0.5">
              {section.items.map((item) => {
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname === item.href || pathname.startsWith(item.href + "/");
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-3 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary/10 text-primary font-medium"
                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="flex-1 truncate">{item.label}</span>
                    {isActive && <ChevronRight className="h-3 w-3" />}
                  </Link>
                );
              })}
            </nav>
            {sectionIdx < NAV_SECTIONS.length - 1 && <Separator className="mt-4 opacity-50" />}
          </div>
        ))}
      </ScrollArea>

      {/* Footer */}
      <div className="border-t border-border p-3">
        <p className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Celsius v1.0
        </p>
      </div>
    </div>
  );
}
