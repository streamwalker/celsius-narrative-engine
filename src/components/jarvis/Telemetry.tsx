export function Telemetry() {
  return (
    <div className="sticky top-0 z-50 flex items-center gap-3 border-b border-[hsl(var(--primary)/0.18)] bg-gradient-to-b from-[hsl(var(--bg-1)/0.95)] to-[hsl(var(--bg-1)/0.7)] px-4 py-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
      <div className="flex items-center gap-2 shrink-0">
        <span className="status-dot" />
        <span className="hidden sm:inline">CELSIUS · ONLINE</span>
        <span className="sm:hidden">CELSIUS</span>
      </div>
      <div
        className="flex-1 overflow-hidden whitespace-nowrap"
        style={{
          maskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
          WebkitMaskImage: 'linear-gradient(90deg, transparent, black 10%, black 90%, transparent)',
        }}
      >
        <div className="animate-ticker text-muted-foreground">
          <span className="text-primary mx-4">SYS</span> narrative_engine standing by ·
          <span className="text-primary mx-4">NET</span> 14 scripts indexed today ·
          <span className="text-primary mx-4">OBS</span> Battlefield: Atlantis · panel 042 generated ·
          <span className="text-primary mx-4">SYS</span> formatter v1.9 ·
          <span className="text-primary mx-4">USR</span> writers online: 1,284 ·
          <span className="text-primary mx-4">OBS</span> Episode 7 · arc complete
        </div>
      </div>
      <div className="shrink-0 hidden md:flex items-center gap-2">
        v1.9 · 2026-05-27 · <span className="text-primary">●</span>
      </div>
    </div>
  );
}
