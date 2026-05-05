import type { PanelBubbleData } from '@/lib/comic-bubbles';

/**
 * Pure SVG `<g>` renderer for a single bubble's shape (body + tail).
 *
 * Coordinate system: the parent <svg> is expected to use
 *   viewBox="0 0 100 100"  preserveAspectRatio="none"
 * and stretch over the full panel box. All paths use
 * vector-effect="non-scaling-stroke" so strokes stay pixel-uniform
 * regardless of panel aspect ratio.
 */

interface BubbleShapeProps {
  bubble: PanelBubbleData;
  /** Border / accent color for the bubble (typically derived from the speaker). */
  color: string;
  /** True while the bubble is selected — adds a subtle ring. */
  selected?: boolean;
}

export function BubbleShape({ bubble, color, selected }: BubbleShapeProps) {
  const stroke = color;
  const fill = bubble.kind === 'caption' ? '#fff7d1' : '#ffffff';
  const strokeWidth = 1.4;

  const common = {
    fill,
    stroke,
    strokeWidth,
    strokeLinejoin: 'round' as const,
    strokeLinecap: 'round' as const,
    vectorEffect: 'non-scaling-stroke' as const,
  };

  let body: JSX.Element;
  switch (bubble.kind) {
    case 'speech':
      body = <path d={speechPath(bubble)} {...common} />;
      break;
    case 'whisper':
      body = (
        <path
          d={speechPath(bubble)}
          {...common}
          strokeDasharray="2 1.5"
        />
      );
      break;
    case 'thought':
      body = (
        <>
          <path d={cloudPath(bubble)} {...common} />
          {thoughtTrailDots(bubble).map((d, i) => (
            <ellipse
              key={i}
              cx={d.cx}
              cy={d.cy}
              rx={d.r}
              ry={d.r}
              {...common}
            />
          ))}
        </>
      );
      break;
    case 'shout':
      body = <path d={shoutPath(bubble)} {...common} strokeWidth={strokeWidth + 0.4} />;
      break;
    case 'caption':
      body = <path d={captionPath(bubble)} {...common} />;
      break;
  }

  return (
    <g pointerEvents="none">
      {selected && <path d={haloPath(bubble)} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={3} vectorEffect="non-scaling-stroke" />}
      {body}
    </g>
  );
}

// ---------------------------------------------------------------------------
// Path builders — all coordinates are panel-normalized 0..1 multiplied by 100
// ---------------------------------------------------------------------------

interface BoxXY {
  x: number; y: number; w: number; h: number;
  cx: number; cy: number;
  tx?: number; ty?: number;
}

function unpack(b: PanelBubbleData): BoxXY {
  const x = b.x * 100, y = b.y * 100, w = b.w * 100, h = b.h * 100;
  return {
    x, y, w, h,
    cx: x + w / 2,
    cy: y + h / 2,
    tx: b.tail ? b.tail.x * 100 : undefined,
    ty: b.tail ? b.tail.y * 100 : undefined,
  };
}

/** Plain rounded rect with no tail. */
function roundedRectPath(x: number, y: number, w: number, h: number, r: number): string {
  const rr = Math.max(0, Math.min(r, w / 2, h / 2));
  return [
    `M${x + rr},${y}`,
    `H${x + w - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w},${y + rr}`,
    `V${y + h - rr}`,
    `A${rr},${rr} 0 0 1 ${x + w - rr},${y + h}`,
    `H${x + rr}`,
    `A${rr},${rr} 0 0 1 ${x},${y + h - rr}`,
    `V${y + rr}`,
    `A${rr},${rr} 0 0 1 ${x + rr},${y}`,
    'Z',
  ].join(' ');
}

/**
 * Speech / whisper path: rounded rect with a triangular tail attached to the
 * edge nearest the tail tip. Single continuous path so there is no seam.
 */
function speechPath(b: PanelBubbleData): string {
  const u = unpack(b);
  const r = Math.min(3, u.w / 5, u.h / 5);
  if (u.tx === undefined || u.ty === undefined) {
    return roundedRectPath(u.x, u.y, u.w, u.h, r);
  }

  const dx = u.tx - u.cx;
  const dy = u.ty - u.cy;
  // Pick side: weight by aspect so stretched bubbles still pick a sane edge
  const horizontal = Math.abs(dx) * u.h > Math.abs(dy) * u.w;
  const tw = Math.min(3, u.w / 5, u.h / 5); // tail half-width along the edge

  const right = u.x + u.w, bottom = u.y + u.h;

  if (horizontal && dx > 0) {
    const ay = clamp(u.cy + dy * 0.25, u.y + r + tw, bottom - r - tw);
    return [
      `M${u.x + r},${u.y}`,
      `H${right - r}`,
      `A${r},${r} 0 0 1 ${right},${u.y + r}`,
      `V${ay - tw}`,
      `L${u.tx},${u.ty}`,
      `L${right},${ay + tw}`,
      `V${bottom - r}`,
      `A${r},${r} 0 0 1 ${right - r},${bottom}`,
      `H${u.x + r}`,
      `A${r},${r} 0 0 1 ${u.x},${bottom - r}`,
      `V${u.y + r}`,
      `A${r},${r} 0 0 1 ${u.x + r},${u.y}`,
      'Z',
    ].join(' ');
  }
  if (horizontal && dx < 0) {
    const ay = clamp(u.cy + dy * 0.25, u.y + r + tw, bottom - r - tw);
    return [
      `M${u.x + r},${u.y}`,
      `H${right - r}`,
      `A${r},${r} 0 0 1 ${right},${u.y + r}`,
      `V${bottom - r}`,
      `A${r},${r} 0 0 1 ${right - r},${bottom}`,
      `H${u.x + r}`,
      `A${r},${r} 0 0 1 ${u.x},${bottom - r}`,
      `V${ay + tw}`,
      `L${u.tx},${u.ty}`,
      `L${u.x},${ay - tw}`,
      `V${u.y + r}`,
      `A${r},${r} 0 0 1 ${u.x + r},${u.y}`,
      'Z',
    ].join(' ');
  }
  if (!horizontal && dy > 0) {
    // Tail bottom
    const ax = clamp(u.cx + dx * 0.25, u.x + r + tw, right - r - tw);
    return [
      `M${u.x + r},${u.y}`,
      `H${right - r}`,
      `A${r},${r} 0 0 1 ${right},${u.y + r}`,
      `V${bottom - r}`,
      `A${r},${r} 0 0 1 ${right - r},${bottom}`,
      `H${ax + tw}`,
      `L${u.tx},${u.ty}`,
      `L${ax - tw},${bottom}`,
      `H${u.x + r}`,
      `A${r},${r} 0 0 1 ${u.x},${bottom - r}`,
      `V${u.y + r}`,
      `A${r},${r} 0 0 1 ${u.x + r},${u.y}`,
      'Z',
    ].join(' ');
  }
  // Tail top
  const ax = clamp(u.cx + dx * 0.25, u.x + r + tw, right - r - tw);
  return [
    `M${u.x + r},${u.y}`,
    `H${ax - tw}`,
    `L${u.tx},${u.ty}`,
    `L${ax + tw},${u.y}`,
    `H${right - r}`,
    `A${r},${r} 0 0 1 ${right},${u.y + r}`,
    `V${bottom - r}`,
    `A${r},${r} 0 0 1 ${right - r},${bottom}`,
    `H${u.x + r}`,
    `A${r},${r} 0 0 1 ${u.x},${bottom - r}`,
    `V${u.y + r}`,
    `A${r},${r} 0 0 1 ${u.x + r},${u.y}`,
    'Z',
  ].join(' ');
}

/**
 * Cloud path — perimeter built from rounded scallops so the bubble looks
 * cloud-like without drifting too far from the bubble box.
 */
function cloudPath(b: PanelBubbleData): string {
  const u = unpack(b);
  const cx = u.cx, cy = u.cy;
  const rx = u.w / 2;
  const ry = u.h / 2;
  const bumps = 14;
  const ampOuter = 1.0;
  const ampInner = 0.85;

  const points: { x: number; y: number; out: boolean }[] = [];
  for (let i = 0; i < bumps * 2; i++) {
    const angle = (i / (bumps * 2)) * Math.PI * 2 - Math.PI / 2;
    const out = i % 2 === 0;
    const r = out ? 1 : ampInner;
    points.push({
      x: cx + Math.cos(angle) * rx * r * (out ? ampOuter : 1),
      y: cy + Math.sin(angle) * ry * r * (out ? ampOuter : 1),
      out,
    });
  }
  // Build a path with quadratic curves between alternating in/out points
  let d = `M${points[0].x},${points[0].y}`;
  for (let i = 1; i <= points.length; i++) {
    const p = points[i % points.length];
    const prev = points[i - 1];
    const mx = (prev.x + p.x) / 2;
    const my = (prev.y + p.y) / 2;
    d += ` Q${prev.x},${prev.y} ${mx},${my}`;
  }
  d += ' Z';
  return d;
}

/** Two or three small ellipses leading from the bubble center to the tail tip. */
function thoughtTrailDots(b: PanelBubbleData): { cx: number; cy: number; r: number }[] {
  if (!b.tail) return [];
  const u = unpack(b);
  const tx = u.tx!, ty = u.ty!;
  const dots: { cx: number; cy: number; r: number }[] = [];
  // Start just outside the bubble center toward the tail tip
  const steps = 3;
  for (let i = 1; i <= steps; i++) {
    const t = 0.55 + (i / steps) * 0.45;
    dots.push({
      cx: u.cx + (tx - u.cx) * t,
      cy: u.cy + (ty - u.cy) * t,
      r: 0.9 + (steps - i) * 0.4,
    });
  }
  return dots;
}

/** Star-burst / explosion polygon for the shout bubble. */
function shoutPath(b: PanelBubbleData): string {
  const u = unpack(b);
  const cx = u.cx, cy = u.cy;
  const rx = u.w / 2, ry = u.h / 2;
  const spikes = 18;
  const innerScale = 0.78;

  const pts: string[] = [];
  for (let i = 0; i < spikes * 2; i++) {
    const angle = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
    const r = i % 2 === 0 ? 1 : innerScale;
    pts.push(`${cx + Math.cos(angle) * rx * r},${cy + Math.sin(angle) * ry * r}`);
  }

  // Optional tail: extend the spike nearest to the tail tip out to the tip.
  if (u.tx !== undefined && u.ty !== undefined) {
    const dx = u.tx - cx, dy = u.ty - cy;
    const targetAngle = Math.atan2(dy, dx);
    let bestIdx = 0;
    let bestDelta = Infinity;
    for (let i = 0; i < spikes * 2; i += 2) {
      const a = (i / (spikes * 2)) * Math.PI * 2 - Math.PI / 2;
      const delta = Math.abs(angularDelta(a, targetAngle));
      if (delta < bestDelta) {
        bestDelta = delta;
        bestIdx = i;
      }
    }
    pts[bestIdx] = `${u.tx},${u.ty}`;
  }
  return `M${pts[0]} L${pts.slice(1).join(' L ')} Z`;
}

function captionPath(b: PanelBubbleData): string {
  const u = unpack(b);
  return roundedRectPath(u.x, u.y, u.w, u.h, 0.6);
}

function haloPath(b: PanelBubbleData): string {
  const u = unpack(b);
  const pad = 1.2;
  return roundedRectPath(u.x - pad, u.y - pad, u.w + pad * 2, u.h + pad * 2, 3);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}

function angularDelta(a: number, b: number): number {
  let d = a - b;
  while (d > Math.PI) d -= 2 * Math.PI;
  while (d < -Math.PI) d += 2 * Math.PI;
  return d;
}
