import type { Page } from '@/lib/panelcraft/types';
import { tensionForPage } from '@/lib/panelcraft/checks';

interface Props {
  pages: Page[];
  currentPage: number;
  onSelect: (n: number) => void;
}

export function StoryArcGraph({ pages, currentPage, onSelect }: Props) {
  const width = 280;
  const height = 100;
  const padX = 8;
  const padY = 6;
  const innerW = width - padX * 2;
  const innerH = height - padY * 2;

  const tensions = pages.map(tensionForPage);
  const points = tensions.map((t, i) => {
    const x = padX + (i / Math.max(1, pages.length - 1)) * innerW;
    const y = padY + innerH - (t / 9) * innerH;
    return [x, y] as const;
  });

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' ');
  const fillPath = path + ` L ${padX + innerW} ${padY + innerH} L ${padX} ${padY + innerH} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full block">
      <defs>
        <linearGradient id="pc-arcFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.35" />
          <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      {[2, 4, 6, 8].map(t => {
        const y = padY + innerH - (t / 9) * innerH;
        return <line key={t} x1={padX} y1={y} x2={padX + innerW} y2={y} stroke="hsl(var(--border))" strokeOpacity="0.4" />;
      })}
      <path d={fillPath} fill="url(#pc-arcFill)" />
      <path d={path} fill="none" stroke="hsl(var(--accent))" strokeWidth="1.5" />
      {points.map((p, i) => {
        const page = pages[i];
        const isCurrent = page.number === currentPage;
        const isCliffhanger = page.side === 'R' && page.isCliffhanger;
        return (
          <g key={i} onClick={() => onSelect(page.number)} style={{ cursor: 'pointer' }}>
            <circle
              cx={p[0]} cy={p[1]}
              r={isCurrent ? 3.5 : (isCliffhanger ? 2 : 1.4)}
              fill={isCurrent ? 'hsl(var(--foreground))' : (isCliffhanger ? 'hsl(var(--destructive))' : 'hsl(var(--accent))')}
              stroke={isCurrent ? 'hsl(var(--accent))' : 'none'}
              strokeWidth={isCurrent ? 1.5 : 0}
            />
            {isCurrent && (
              <line x1={p[0]} y1={padY} x2={p[0]} y2={padY + innerH} stroke="hsl(var(--foreground))" strokeOpacity="0.2" strokeDasharray="2 2" />
            )}
          </g>
        );
      })}
    </svg>
  );
}
