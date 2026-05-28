import { useEffect, useState } from 'react';
import { CornerBrackets } from './CornerBrackets';

const LINES = [
  { cls: 'slug',      text: 'EXT. NEO-ATLANTIS ROOFTOP — NIGHT' },
  { cls: 'action',    text: 'Rain falls in sheets. AURELIA stands at the edge, silhouetted against the storm.' },
  { cls: 'character', text: 'Aurelia' },
  { cls: 'dialogue',  text: "They're here." },
  { cls: 'action',    text: 'A low hum builds. The city below begins to glow.' },
];

const LINE_CLS: Record<string, string> = {
  slug:      'text-[hsl(var(--pink-soft))] font-bold uppercase',
  action:    'text-[hsl(var(--text-1))] italic',
  character: 'text-[hsl(var(--accent))] text-center uppercase mt-2',
  dialogue:  'text-foreground text-center px-4',
};

function Ring({ value, label }: { value: number; label: string }) {
  const dash = 94.2;
  const offset = dash * (1 - value / 100);
  return (
    <div className="flex-1 text-center text-[8px] uppercase tracking-[0.16em] text-muted-foreground">
      <div className="relative mx-auto mb-1 h-[38px] w-[38px]">
        <svg width="38" height="38" viewBox="0 0 38 38" style={{ transform: 'rotate(-90deg)' }}>
          <circle cx="19" cy="19" r="15" fill="none" stroke="hsl(var(--bg-3))" strokeWidth="3" />
          <circle
            cx="19" cy="19" r="15" fill="none"
            stroke="hsl(var(--primary))" strokeWidth="3" strokeLinecap="round"
            strokeDasharray={dash} strokeDashoffset={offset}
            style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary) / 0.55))' }}
          />
        </svg>
        <div className="absolute inset-0 grid place-items-center font-display text-[10px] font-bold text-foreground">
          {value}
        </div>
      </div>
      {label}
    </div>
  );
}

export function HudConsole() {
  const [tick, setTick] = useState(0);
  const [lights, setLights] = useState([true, true, false]);

  useEffect(() => {
    const a = setInterval(() => setTick(t => t + 1), 8000);
    const b = setInterval(() => {
      setLights(prev => prev.map(v => (Math.random() > 0.7 ? !v : v)));
    }, 900);
    return () => { clearInterval(a); clearInterval(b); };
  }, []);

  return (
    <div
      className="relative overflow-hidden rounded-[14px] border border-[hsl(var(--primary)/0.42)] p-[18px]"
      style={{
        background: 'linear-gradient(160deg, hsl(var(--bg-3) / 0.85), hsl(var(--bg-1) / 0.95))',
        boxShadow:
          '0 0 0 1px hsl(var(--primary) / 0.08), 0 30px 60px -20px hsl(var(--primary) / 0.25), inset 0 1px 0 hsl(0 0% 100% / 0.04)',
      }}
    >
      <CornerBrackets size="lg" />

      {/* Header */}
      <div className="mb-[14px] flex items-center justify-between border-b border-dashed border-[hsl(var(--primary)/0.18)] pb-[10px] text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span>// LIVE TRANSFORM · DEMO</span>
        <div className="flex gap-1.5">
          {lights.map((on, i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full"
              style={{
                background: on ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground-2))',
                boxShadow: on ? '0 0 8px hsl(var(--primary))' : undefined,
              }}
            />
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-[14px] grid-cols-1 min-[520px]:grid-cols-2">
        {/* Script pane */}
        <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--background)/0.65)] p-3 font-mono text-[11px]">
          <h6 className="mb-2.5 flex items-center justify-between font-display text-[9px] uppercase tracking-[0.24em] text-primary">
            SCRIPT INPUT
            <span className="rounded border border-[hsl(var(--primary)/0.18)] px-1.5 py-0.5 text-[8px] tracking-[0.18em] text-muted-foreground">FOUNTAIN</span>
          </h6>
          <div key={tick}>
            {LINES.map((l, i) => (
              <div
                key={i}
                className={`animate-type-in mb-1 whitespace-pre-wrap ${LINE_CLS[l.cls] || 'text-[hsl(var(--text-1))]'}`}
                style={{ animationDelay: `${i * 0.45}s` }}
              >
                {l.text}
              </div>
            ))}
          </div>
        </div>

        {/* Panel pane */}
        <div className="relative min-h-[220px] overflow-hidden rounded-lg border border-[hsl(var(--primary)/0.18)] bg-[hsl(var(--background)/0.65)] p-3">
          <h6 className="mb-2.5 flex items-center justify-between font-display text-[9px] uppercase tracking-[0.24em] text-primary">
            PANEL OUTPUT
            <span className="rounded border border-[hsl(var(--primary)/0.18)] px-1.5 py-0.5 text-[8px] tracking-[0.18em] text-muted-foreground">v1.9</span>
          </h6>

          <div
            className="scan-sweep relative mt-1.5 overflow-hidden rounded-md border border-[hsl(var(--primary)/0.42)]"
            style={{ aspectRatio: '4 / 5' }}
          >
            <svg viewBox="0 0 200 250" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full">
              <defs>
                <linearGradient id="hud-sky" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3a0a25" />
                  <stop offset="60%" stopColor="#0a0a14" />
                </linearGradient>
                <radialGradient id="hud-moon" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ffd5e8" />
                  <stop offset="100%" stopColor="rgba(245,61,153,0)" />
                </radialGradient>
              </defs>
              <rect width="200" height="250" fill="url(#hud-sky)" />
              <circle cx="155" cy="55" r="42" fill="url(#hud-moon)" />
              <circle cx="155" cy="55" r="14" fill="#ffeaf3" />
              <path
                d="M0 200 L0 160 L20 160 L20 140 L40 140 L40 170 L60 170 L60 130 L80 130 L80 150 L100 150 L100 120 L120 120 L120 145 L140 145 L140 165 L160 165 L160 135 L180 135 L180 175 L200 175 L200 250 L0 250 Z"
                fill="#0a0a14" stroke="rgba(245,61,153,0.4)" strokeWidth="0.6"
              />
              <g fill="#ffb547">
                <rect x="64" y="138" width="2" height="3" />
                <rect x="70" y="142" width="2" height="3" />
                <rect x="104" y="128" width="2" height="3" />
                <rect x="110" y="135" width="2" height="3" />
                <rect x="144" y="152" width="2" height="3" />
                <rect x="166" y="148" width="2" height="3" />
              </g>
              <g stroke="#f53d99" strokeWidth="1.4" fill="none" strokeLinecap="round">
                <circle cx="95" cy="195" r="3" fill="#f53d99" />
                <path d="M95 198 L95 212 M95 205 L88 210 M95 205 L102 210 M95 212 L91 222 M95 212 L99 222" />
              </g>
            </svg>
            <div
              key={`speech-${tick}`}
              className="animate-pop absolute right-[8%] top-[14%] rounded-xl bg-foreground px-2.5 py-1.5 font-display text-[10px] font-bold uppercase tracking-[0.08em] text-background"
              style={{ boxShadow: '0 4px 12px hsl(0 0% 0% / 0.5)' }}
            >
              "They're here."
              <span
                className="absolute bottom-[-6px] left-4 h-0 w-0"
                style={{ borderLeft: '6px solid transparent', borderRight: '6px solid transparent', borderTop: '6px solid hsl(var(--foreground))' }}
              />
            </div>
          </div>

          <div className="mt-2.5 flex justify-between gap-2">
            <Ring value={85} label="Coherence" />
            <Ring value={66} label="Tone" />
            <Ring value={94} label="Pacing" />
          </div>
        </div>
      </div>
    </div>
  );
}
