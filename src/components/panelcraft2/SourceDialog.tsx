import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  treatment: string;
}

export function SourceDialog({ open, onOpenChange, treatment }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-serif italic text-xl">Source Treatment</DialogTitle>
        </DialogHeader>
        <pre className="flex-1 overflow-auto text-sm whitespace-pre-wrap font-serif leading-relaxed text-muted-foreground p-2">
          {treatment || '(No source treatment stored for this issue.)'}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
