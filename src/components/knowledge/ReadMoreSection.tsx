import { useState, type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

interface ReadMoreSectionProps {
  preview: ReactNode;
  children: ReactNode;
  moreLabel?: string;
  lessLabel?: string;
}

export function ReadMoreSection({
  preview,
  children,
  moreLabel = 'Read more',
  lessLabel = 'Show less',
}: ReadMoreSectionProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <div className="text-foreground/85 leading-relaxed">{preview}</div>
      {open && <div className="text-foreground/85 leading-relaxed animate-in fade-in-50">{children}</div>}
      <Button
        size="sm"
        variant="ghost"
        onClick={() => setOpen((v) => !v)}
        className="text-xs text-primary hover:text-primary px-2"
      >
        {open ? lessLabel : moreLabel}
        <ChevronDown
          className={`ml-1 h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </Button>
    </div>
  );
}
