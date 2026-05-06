import { usePlainEnglish } from './PlainEnglishContext';
import { Switch } from '@/components/ui/switch';
import { Sparkles } from 'lucide-react';

export function PlainEnglishToggle({ className }: { className?: string }) {
  const { plain, toggle } = usePlainEnglish();
  return (
    <label
      className={`inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1.5 text-xs font-medium text-foreground shadow-sm backdrop-blur ${className ?? ''}`}
    >
      <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden />
      <span>Plain English</span>
      <Switch checked={plain} onCheckedChange={toggle} aria-label="Toggle Plain English mode" />
    </label>
  );
}
