import type { ReactNode } from 'react';
import {
  Info,
  Lightbulb,
  AlertTriangle,
  BookOpen,
  Wrench,
  Sparkles,
  Quote,
  Compass,
} from 'lucide-react';
import { cn } from '@/lib/utils';

type CalloutKind =
  | 'simple'
  | 'why'
  | 'context'
  | 'lore'
  | 'technical'
  | 'warning'
  | 'example'
  | 'behind';

const config: Record<CalloutKind, { label: string; Icon: typeof Info; tone: string }> = {
  simple:    { label: 'In Simple Terms',  Icon: Lightbulb,    tone: 'border-amber-500/50 bg-amber-500/5 text-amber-300' },
  why:       { label: 'Why This Matters', Icon: Sparkles,     tone: 'border-primary/50 bg-primary/5 text-primary' },
  context:   { label: 'Important Context',Icon: Info,         tone: 'border-accent/50 bg-accent/5 text-accent' },
  lore:      { label: 'Story Lore',       Icon: BookOpen,     tone: 'border-purple-500/50 bg-purple-500/5 text-purple-300' },
  technical: { label: 'Technical Note',   Icon: Wrench,       tone: 'border-cyan-500/50 bg-cyan-500/5 text-cyan-300' },
  warning:   { label: 'Warning',          Icon: AlertTriangle,tone: 'border-destructive/50 bg-destructive/5 text-destructive' },
  example:   { label: 'Example',          Icon: Quote,        tone: 'border-emerald-500/50 bg-emerald-500/5 text-emerald-300' },
  behind:    { label: 'Behind the Concept',Icon: Compass,     tone: 'border-fuchsia-500/50 bg-fuchsia-500/5 text-fuchsia-300' },
};

interface ContextCalloutProps {
  kind: CalloutKind;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function ContextCallout({ kind, title, children, className }: ContextCalloutProps) {
  const { label, Icon, tone } = config[kind];
  return (
    <aside
      className={cn(
        'rounded-lg border-l-4 border bg-card/60 px-4 py-3 backdrop-blur',
        tone,
        className,
      )}
      role="note"
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className="h-4 w-4" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wider">{title ?? label}</p>
      </div>
      <div className="text-sm text-foreground/85 leading-relaxed">{children}</div>
    </aside>
  );
}
