import { PANEL_FUNCTIONS } from '@/lib/panelcraft/constants';

export function FunctionLegend() {
  return (
    <div className="space-y-1">
      {PANEL_FUNCTIONS.map(f => (
        <div key={f.id} className="flex items-center gap-2 text-[11px]" title={f.desc}>
          <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: f.color }} />
          <span className="font-mono tracking-wide text-foreground/80">{f.label}</span>
          <span className="ml-auto font-mono text-[9px] text-muted-foreground">t·{f.tension}</span>
        </div>
      ))}
    </div>
  );
}
