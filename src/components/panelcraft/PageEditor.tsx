import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Sparkles, Loader2 } from 'lucide-react';
import type { Page, Panel } from '@/lib/panelcraft/types';
import { uid } from '@/lib/panelcraft/constants';
import { PanelCard } from './PanelCard';

interface Props {
  page: Page;
  onChange: (page: Page) => void;
  onAutoFillPanels?: (pageNumber: number) => Promise<Panel[]>;
}

export function PageEditor({ page, onChange, onAutoFillPanels }: Props) {
  const [autoLoading, setAutoLoading] = useState(false);
  const update = (patch: Partial<Page>) => onChange({ ...page, ...patch });

  const addPanel = () => {
    update({ panels: [...page.panels, { id: uid(), function: 'BEAT', description: '', lines: [] }] });
  };
  const updatePanel = (panelId: string, newPanel: Panel) => {
    update({ panels: page.panels.map(p => p.id === panelId ? newPanel : p) });
  };
  const deletePanel = (panelId: string) => {
    update({ panels: page.panels.filter(p => p.id !== panelId) });
  };

  const handleAutoFill = async () => {
    if (!onAutoFillPanels) return;
    setAutoLoading(true);
    try {
      const panels = await onAutoFillPanels(page.number);
      if (panels.length > 0) update({ panels: [...page.panels, ...panels] });
    } finally {
      setAutoLoading(false);
    }
  };



  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="flex items-baseline gap-3 mb-1 flex-wrap">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Page {page.number} · {page.side === 'R' ? 'Right' : 'Left'}
        </div>
        {page.side === 'R' && (
          <label className="flex items-center gap-2 text-[10px] font-mono cursor-pointer text-muted-foreground">
            <Checkbox
              checked={page.isCliffhanger}
              onCheckedChange={(c) => update({ isCliffhanger: !!c })}
            />
            <span className={page.isCliffhanger ? 'text-destructive' : ''}>CLIFFHANGER</span>
          </label>
        )}
      </div>
      <Input
        value={page.title}
        onChange={(e) => update({ title: e.target.value })}
        className="text-3xl mb-2 bg-transparent border-0 px-0 h-auto py-1 font-semibold focus-visible:ring-0"
        placeholder="Page title"
      />
      <Textarea
        value={page.summary}
        onChange={(e) => update({ summary: e.target.value })}
        placeholder="Page-level summary from the breakdown. The shape and intent of this page."
        rows={3}
        className="text-sm mb-6 resize-none italic border-0 border-b border-border rounded-none px-0 focus-visible:ring-0"
      />

      <div className="space-y-3">
        {page.panels.map((panel, idx) => (
          <PanelCard
            key={panel.id}
            panel={panel}
            index={idx}
            onChange={(p) => updatePanel(panel.id, p)}
            onDelete={() => deletePanel(panel.id)}
          />
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button variant="outline" onClick={addPanel} className="font-mono text-xs tracking-widest border-dashed text-accent border-accent/40">
          <Plus className="h-3.5 w-3.5 mr-1" /> ADD PANEL
        </Button>
        {onAutoFillPanels && (
          <Button
            variant="outline"
            onClick={handleAutoFill}
            disabled={autoLoading}
            className="font-mono text-xs tracking-widest border-dashed"
            title="Generate 4-6 panels from this page's summary using AI"
          >
            {autoLoading ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Sparkles className="h-3.5 w-3.5 mr-1" />}
            {page.panels.length === 0 ? 'AUTO-FILL PANELS' : 'ADD AI PANELS'}
          </Button>
        )}
      </div>

    </div>
  );
}
