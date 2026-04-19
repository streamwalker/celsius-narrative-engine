import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const shortcuts = {
  Navigation: [
    { key: '← →', description: 'Navigate between characters' },
    { key: '/', description: 'Focus search' },
    { key: 'Esc', description: 'Close dialog' },
  ],
  Actions: [
    { key: 'N', description: 'New character' },
    { key: 'E', description: 'Edit selected character' },
    { key: 'Enter', description: 'Open character details' },
    { key: 'Shift + Del', description: 'Delete selected character' },
  ],
  View: [
    { key: 'G', description: 'Toggle gallery/list view' },
    { key: 'C', description: 'Compare characters' },
    { key: '?', description: 'Show this help' },
  ],
};

export function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="w-5 h-5 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {Object.entries(shortcuts).map(([category, items]) => (
            <div key={category}>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <div key={item.key} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">{item.description}</span>
                    <kbd className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs font-mono min-w-[2rem] text-center">
                      {item.key}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="text-xs text-muted-foreground text-center pt-2 border-t border-border">
          Press <kbd className="px-1 bg-muted rounded">?</kbd> anytime to show this help
        </div>
      </DialogContent>
    </Dialog>
  );
}
