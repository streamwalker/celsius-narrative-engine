import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';
import { toast } from 'sonner';
import type { PanelcraftIssue } from '@/lib/panelcraft/types';
import { exportPanelcraftScript } from '@/lib/panelcraft/export';
import { useMemo } from 'react';

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  issue: PanelcraftIssue;
}

export function ExportDialog({ open, onOpenChange, issue }: Props) {
  const text = useMemo(() => exportPanelcraftScript(issue), [issue]);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    toast.success('Script copied to clipboard');
  };

  const download = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(issue.title || 'panelcraft').replace(/\s+/g, '-').toLowerCase()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between gap-3">
            <span>Export — Industry Format</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={copy}>
                <Copy className="h-3.5 w-3.5 mr-1" /> Copy
              </Button>
              <Button size="sm" onClick={download}>
                <Download className="h-3.5 w-3.5 mr-1" /> Download
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        <pre className="flex-1 overflow-auto text-xs font-mono bg-muted/40 p-4 rounded border border-border leading-relaxed whitespace-pre-wrap">
          {text}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
