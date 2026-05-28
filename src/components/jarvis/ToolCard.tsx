import { Link } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';
import { CornerBrackets } from './CornerBrackets';

interface Props {
  href: string;
  icon: LucideIcon;
  name: string;
  desc: string;
  status: 'live' | 'phase';
  cta?: string;
}

export function ToolCard({ href, icon: Icon, name, desc, status, cta }: Props) {
  const isLive = status === 'live';
  const ctaLabel = cta ?? (isLive ? 'Launch' : 'Preview');

  return (
    <Link
      to={href}
      onMouseMove={(e) => {
        const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
        (e.currentTarget as HTMLElement).style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`);
        (e.currentTarget as HTMLElement).style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`);
      }}
      className="group relative block overflow-hidden rounded-xl border border-[hsl(var(--primary)/0.18)] p-5 pb-[18px] transition-all duration-300 hover:-translate-y-[3px] hover:border-[hsl(var(--primary)/0.42)]"
      style={{
        background: 'linear-gradient(160deg, hsl(var(--bg-3) / 0.6), hsl(var(--bg-1) / 0.85))',
      }}
    >
      {/* Cursor glow */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            'radial-gradient(circle at var(--mx, 50%) var(--my, 0%), hsl(var(--primary) / 0.18), transparent 50%)',
        }}
      />
      <CornerBrackets />

      <div className="mb-[18px] flex items-start justify-between">
        <div
          className="grid h-[42px] w-[42px] place-items-center rounded-[10px] border border-[hsl(var(--primary)/0.42)] text-primary"
          style={{ background: 'linear-gradient(135deg, hsl(var(--primary) / 0.22), hsl(var(--primary) / 0.05))' }}
        >
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <span className={`pill ${isLive ? 'live' : 'phase'}`}>{isLive ? 'Live' : 'Phase 2'}</span>
      </div>

      <h3 className="mb-2 font-display text-base font-bold uppercase tracking-[0.06em] text-foreground">{name}</h3>
      <p className="mb-4 text-[11px] leading-relaxed text-[hsl(var(--text-1))]">{desc}</p>
      <span className="inline-flex items-center gap-1.5 font-display text-[10px] uppercase tracking-[0.2em] text-primary">
        {ctaLabel} <span className="inline-block transition-transform duration-200 group-hover:translate-x-1">→</span>
      </span>
    </Link>
  );
}
