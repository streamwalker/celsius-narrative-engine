
import { useState, useMemo } from "react";
import { Link } from 'react-router-dom';
import { useNavigate } from "react-router-dom";
import { ArrowLeft, BookOpen, Star, Film, Tv, Clapperboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StoryNotesSearch from "@/components/story-notes-search";
import { storyPlanMappings } from "@/lib/story-plan-data";
const battlefieldAtlantisLogo = "/assets/battlefield-atlantis-logo.jpg";
const darkerAgesLogo = "/assets/darker-ages-logo.png";
const episode7Logo = "/assets/episode-7-logo.png";
const childrenOfAquariusLogo = "/assets/children-of-aquarius-logo.png";

const allSections = [
  // Battlefield: Atlantis
  { id: "page-1", label: "Page 1 — World & Character Lists", project: "ba" },
  { id: "page-2", label: "Page 2 — Violence in Storytelling (Russell 2)", project: "ba" },
  { id: "page-3", label: "Page 3 — Character & Location Notes", project: "ba" },
  { id: "page-4", label: "Page 4 — Exordium Outline (A-1 / A-2)", project: "ba" },
  { id: "page-5", label: "Page 5 — Handwritten Notes", project: "ba" },
  { id: "page-6", label: "Page 6 — Act Structure (SQ1–SQ8)", project: "ba" },
  { id: "page-7", label: "Page 7 — Handwritten Notes (BA2 & BA3)", project: "ba" },
  { id: "page-8", label: "Page 8 — Story Bible (Version A)", project: "ba" },
  { id: "page-9", label: "Page 9 — Outline Headings & Tables", project: "ba" },
  { id: "page-10", label: "Page 10 — Exordium Outline (Duplicate)", project: "ba" },
  { id: "page-11", label: "Page 11 — Act Structure (Continued)", project: "ba" },
  { id: "page-12", label: "Page 12 — Blank Act Template (BA1)", project: "ba" },
  { id: "page-13", label: "Page 13 — Blank Act Template (BA3)", project: "ba" },
  { id: "page-14", label: "Page 14 — Story Bible (Version B)", project: "ba" },
  { id: "page-15", label: "Page 15 — Handwritten Notes (The Planet)", project: "ba" },
  { id: "page-16", label: "Page 16 — Handwritten Notes", project: "ba" },
  { id: "page-17", label: "Page 17 — Handwritten Notes", project: "ba" },
  { id: "page-18", label: "Page 18 — Handwritten Notes (Zeus)", project: "ba" },
  { id: "page-19", label: "Page 19 — Handwritten Notes (Orion / Astra)", project: "ba" },
  { id: "page-20", label: "Page 20 — Handwritten Notes (Battle)", project: "ba" },
  { id: "page-21", label: "Page 21 — Screenwriting Notes", project: "ba" },
  { id: "page-22", label: "Page 22 — Realization & Character Keys", project: "ba" },
  { id: "page-23", label: "Page 23 — Keys to Great Scenes", project: "ba" },
  { id: "page-24", label: "Page 24 — Building Suspense", project: "ba" },
  { id: "page-25", label: "Page 25 — Tri-Planetary Coalition Roster", project: "ba" },
  { id: "page-26", label: "Page 26 — Prometheus / Pandora / Asterya", project: "ba" },
  // Episode 7 (2011)
  { id: "ep7-page-1", label: "Page 1 — Concept: 30 Years After Endor", project: "ep7" },
  { id: "ep7-page-2", label: "Page 2 — Continuation & Timeline Opening (Handwritten)", project: "ep7" },
  { id: "ep7-page-3", label: "Page 3 — Timeline: Luke's Return & Xan's Choice", project: "ep7" },
  { id: "ep7-page-4", label: "Page 4 — Battle Conclusion & Part II (Handwritten)", project: "ep7" },
  { id: "ep7-page-5", label: "Page 5 — Note 1 (Leia/Han/Lando) & Note 2 (Training)", project: "ep7" },
  { id: "ep7-page-6", label: "Page 6 — Note 3 (Dagobah) & Note 4 (Xan's Character)", project: "ep7" },
  { id: "ep7-page-7", label: "Page 7 — Note 6 (Falcon Cockpit) & Atlantis Note", project: "ep7" },
  // Darker Ages
  { id: "da-page-1", label: "Page 1 — Backstory: Corbin Rothchylde & Estelle", project: "da" },
  { id: "da-page-2", label: "Page 2 — Backstory (Continued): Temporal Rift", project: "da" },
  { id: "da-page-3", label: "Page 3 — Climax: Maven, Shinobu & The Rift", project: "da" },
  { id: "da-page-4", label: "Page 4 — Denouement & Epilogue (Handwritten)", project: "da" },
  { id: "da-page-5", label: "Page 5 — First Act: Maven's Introduction", project: "da" },
  { id: "da-page-6", label: "Page 6 — First Act: Titus's Trial", project: "da" },
  { id: "da-page-7", label: "Page 7 — First Act: Shinobu's Introduction", project: "da" },
  { id: "da-page-8", label: "Page 8 — First Act: Convergence", project: "da" },
  { id: "da-page-9", label: "Page 9 — Convergence pt. 2 (Handwritten)", project: "da" },
  { id: "da-page-10", label: "Page 10 — Act II SQ I: Tavern Scene (Handwritten)", project: "da" },
  { id: "da-page-11", label: "Page 11 — Side Note: Storytelling Philosophy", project: "da" },
  { id: "da-page-12", label: "Page 12 — 18 Things: Ironic Hook & Values Table", project: "da" },
  { id: "da-page-13", label: "Page 13 — Moral-Physical Premise & Character Rules", project: "da" },
  { id: "da-page-14", label: "Page 14 — Shinobu & The Omagari Family: Bloodline & Patricide", project: "da" },
  { id: "da-page-15", label: "Page 15 — Shinobu & The Omagari Family: Season Two — Dark Heir", project: "da" },
  { id: "da-page-16", label: "Page 16 — Maven & The Dark Queen (Estelle): Origin Revised", project: "da" },
  { id: "da-page-17", label: "Page 17 — Maven's Journey: Awakening to Phoenix", project: "da" },
  { id: "da-page-18", label: "Page 18 — Owen (The Time Traveler) & Lord Titus", project: "da" },
  { id: "da-page-19", label: "Page 19 — The Love Square", project: "da" },
  // Story Plans
  { id: "exordium-draft-a", label: "Exordium Issue 1 — Script (Draft A)", project: "ba" },
  { id: "exordium-draft-b", label: "Exordium Issue 1 — Script (Draft B / Celtx)", project: "ba" },
  { id: "origin-issue-1", label: 'Issue 1: "Origin" — Prologue Script', project: "ba" },
  { id: "origin-issue-2", label: 'Issue 2: "Origin" Pt. 2 — Script', project: "ba" },
  { id: "ba-characters", label: "Character Creator", project: "ba" },
  { id: "ba-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown", project: "ba" },
  { id: "ep7-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown", project: "ep7" },
  { id: "da-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown", project: "da" },
  { id: "da-manuscript", label: "Novel Manuscript — Darker Ages", project: "da" },
  // Children of Aquarius
  { id: "coa-page-1", label: "Page 1 — Historical Timeline (1775–2020)", project: "coa" },
  { id: "coa-page-2", label: "Page 2 — Act 1–2: Edmund's Wedding & Civil War 2", project: "coa" },
  { id: "coa-page-3", label: "Page 3 — Act 3 & Epilogue: Renault's Revelation", project: "coa" },
  { id: "coa-page-4", label: "Page 4 — Trinity: Hi-Concept & Synopsis", project: "coa" },
  { id: "coa-page-5", label: "Page 5 — Cold Open & Act 1: Rwanda, Kobe, 9/11", project: "coa" },
  { id: "coa-page-6", label: "Page 6 — Act 2: Marcus & Simon's Subplot", project: "coa" },
  { id: "coa-page-7", label: "Page 7 — Act 3 & Finale: Lance of Longinus", project: "coa" },
  { id: "coa-page-8", label: "Page 8 — Character Dialogue Descriptions", project: "coa" },
  { id: "coa-page-9", label: "Page 9 — Expanded Timeline (Dec 2019 Draft)", project: "coa" },
  { id: "coa-page-10", label: "Page 10 — Acts 1–3 Expanded & Epilogue", project: "coa" },
  { id: "coa-page-11", label: "Page 11 — Issue 2 Treatment: Resurrection & FBI", project: "coa" },
  { id: "coa-page-12", label: "Page 12 — Issue 2 Treatment (Continued)", project: "coa" },
  { id: "coa-page-13", label: "Page 13 — Issue 2 Plot Plan & Issues 3–7 Summaries", project: "coa" },
  { id: "coa-page-14", label: "Page 14 — Issue 3 Treatment: Dark-Walker & Nightshade", project: "coa" },
  { id: "coa-page-15", label: "Page 15 — Issue 3 Treatment (Continued): Abduction", project: "coa" },
  { id: "coa-page-16", label: "Page 16 — Animated Series Pitch & Revised Synopsis", project: "coa" },
  { id: "coa-page-17", label: "Page 17 — Revised Act Structure & Alternate Act 3", project: "coa" },
  { id: "coa-page-18", label: "Page 18 — Subplots: Simon/Madeline & Blaire Flashbacks", project: "coa" },
  { id: "coa-page-19", label: "Page 19 — The Gathering of the Three", project: "coa" },
  { id: "coa-page-20", label: "Page 20 — Dramatic Questions, September 1993 & World-Building", project: "coa" },
  { id: "coa-page-21", label: "Page 21 — Children of Aquarius: Season Two (8 Episodes)", project: "coa" },
  { id: "coa-page-22", label: "Page 22 — Season One Critical Notes", project: "coa" },
  { id: "coa-issue-1", label: 'Issue One: "Trinity" — Script', project: "coa" },
  { id: "coa-issue-2", label: 'Issue Two — Working Script', project: "coa" },
  { id: "coa-story-plan", label: "Story Plan — Three-Act / Eight-Sequence Breakdown", project: "coa" },
];

const projectRoutes: Record<string, string> = {
  ba: "/astralnaut-studios/battlefield-atlantis",
  da: "/astralnaut-studios/darker-ages",
  ep7: "/astralnaut-studios/episode-7",
  coa: "/astralnaut-studios/children-of-aquarius",
};

const projectNames: Record<string, string> = {
  ba: "Battlefield: Atlantis",
  da: "Darker Ages",
  ep7: "Episode 7 (2011)",
  coa: "Children of Aquarius",
};

const formatIcons: Record<string, React.ReactNode> = {
  film: <Film className="h-3 w-3" />,
  tv_series: <Tv className="h-3 w-3" />,
  tv_episode: <Tv className="h-3 w-3" />,
  comic: <Clapperboard className="h-3 w-3" />,
};

const FormatBadge = ({ storyId }: { storyId: string }) => {
  const mapping = storyPlanMappings[storyId];
  if (!mapping?.defaultFormat) return null;
  return (
    <Badge variant="secondary" className="text-[10px] gap-1 font-normal">
      {formatIcons[mapping.defaultFormat.medium]}
      {mapping.defaultFormat.label}
    </Badge>
  );
};

export default function AstralnautStudios() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const results = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return allSections.filter((s) => s.label.toLowerCase().includes(q));
  }, [search]);

  return (
    <div className="min-h-screen astralnaut-bg text-foreground">
      {/* Sticky header */}
      <header className="glass-panel sticky top-0 z-50 border-b border-white/[0.06]">
        <div className="container max-w-6xl mx-auto flex items-center gap-4 py-4 px-4">
          <Link to="/">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative gradient-sunrise star-field flex flex-col items-center justify-center text-center px-4 py-32 min-h-[70vh]">
        <p className="text-xs uppercase tracking-[0.4em] text-muted-foreground mb-4">Welcome to</p>
        <h1 className="text-5xl sm:text-7xl md:text-8xl font-comic tracking-[0.12em] text-glow text-primary mb-4 animate-pulse-glow">
          ASTRALNAUT STUDIOS
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground max-w-lg mb-10">
          Creative Reference Hub — Story notes, outlines, and world-building across three universes.
        </p>

        <div className="w-full max-w-xl">
          <StoryNotesSearch
            query={search}
            onChange={setSearch}
            placeholder="Search across all story projects…"
          />
        </div>
      </section>

      <main className="container max-w-6xl mx-auto px-4 pb-20 -mt-8 relative z-10">
        {/* Search results */}
        {search.trim() && (
          <div className="glass-panel border-glow rounded-lg p-6 mb-10">
            <h2 className="text-lg font-comic tracking-wider text-primary mb-4">
              {results.length} result{results.length !== 1 ? "s" : ""}
            </h2>
            {results.length === 0 ? (
              <p className="text-sm text-muted-foreground">No matching pages found.</p>
            ) : (
              <nav className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {results.map((s) => (
                  <button
                    key={`${s.project}-${s.id}`}
                    onClick={() => navigate(`${projectRoutes[s.project]}#${s.id}`)}
                    className="text-left text-sm text-muted-foreground hover:text-primary transition-colors py-1.5 px-3 rounded hover:bg-white/[0.04]"
                  >
                    <span className="text-xs text-accent mr-1">[{projectNames[s.project]}]</span>
                    {s.label}
                  </button>
                ))}
              </nav>
            )}
          </div>
        )}

        {/* Project cards */}
        {!search.trim() && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Link to="/astralnaut-studios/battlefield-atlantis" className="group">
              <div className="glass-panel border-glow rounded-xl p-8 h-full transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={battlefieldAtlantisLogo} alt="Battlefield: Atlantis logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-comic tracking-wider text-accent group-hover:text-primary transition-colors">
                      Battlefield: Atlantis
                    </h2>
                    <p className="text-xs text-muted-foreground">26 Pages + 4 Script Archives + Character Creator</p>
                    <FormatBadge storyId="battlefield-atlantis" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Sci-fi action-adventure set 35,000 years ago across Earth, Mars, and Ares. Follows Zeuzano Constra, Orion the Hunter, and Astra against Poseidon's forces. Includes story bibles, act outlines, and screenwriting frameworks.
                </p>
              </div>
            </Link>

            <Link to="/astralnaut-studios/darker-ages" className="group">
              <div className="glass-panel border-glow rounded-xl p-8 h-full transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={darkerAgesLogo} alt="Darker Ages logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-comic tracking-wider text-accent group-hover:text-primary transition-colors">
                      Darker Ages
                    </h2>
                    <p className="text-xs text-muted-foreground">19 Pages of Story Notes</p>
                    <FormatBadge storyId="darker-ages" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Dark fantasy following Maven, Shinobu, and Titus through the five kingdoms of Draconion. Features Corbin Rothchylde's temporal rift, the Writhers, and a quest for the nexus of souls.
                </p>
              </div>
            </Link>

            <Link to="/astralnaut-studios/episode-7" className="group">
              <div className="glass-panel border-glow rounded-xl p-8 h-full transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={episode7Logo} alt="Episode 7 logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-comic tracking-wider text-accent group-hover:text-primary transition-colors">
                      Episode 7 (2011)
                    </h2>
                    <p className="text-xs text-muted-foreground">7 Pages of Story Notes</p>
                    <FormatBadge storyId="episode-7" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Original 2011 treatment set 30 years after Endor. Follows Luke's mastery of both sides of the Force, Xan — daughter of Han and Leia — and the birth of a second Galactic Empire.
                </p>
              </div>
            </Link>

            <Link to="/astralnaut-studios/children-of-aquarius" className="group">
              <div className="glass-panel border-glow rounded-xl p-8 h-full transition-all">
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-12 h-12 rounded-lg overflow-hidden flex items-center justify-center">
                    <img src={childrenOfAquariusLogo} alt="Children of Aquarius logo" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-comic tracking-wider text-accent group-hover:text-primary transition-colors">
                      Children of Aquarius
                    </h2>
                    <p className="text-xs text-muted-foreground">22 Pages + 1 Script Archive + Story Plan</p>
                    <FormatBadge storyId="children-of-aquarius" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Conspiracy thriller meets supernatural action. Two intertwined stories: the Burke/Renault Illuminati dynasty spanning centuries, and Father Blaire's quest to gather the Trinity — the Heralds of Christ — to confront the second coming and usher in the Age of Aquarius.
                </p>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
};

