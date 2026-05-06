import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { getEntry, categoryColors, categoryLabels } from '@/lib/knowledge-glossary';
import { useGlossaryDrawer } from './GlossaryDrawer';
import { usePlainEnglish } from './PlainEnglishContext';

export function ConceptCard({ termId }: { termId: string }) {
  const entry = getEntry(termId);
  const { open } = useGlossaryDrawer();
  const { plain } = usePlainEnglish();
  if (!entry) return null;

  return (
    <Card className="group hover:border-primary/50 transition-colors bg-card/60 backdrop-blur">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {entry.icon && <span className="text-xl" aria-hidden>{entry.icon}</span>}
            <CardTitle className="text-base">{entry.term}</CardTitle>
          </div>
          <Badge variant="outline" className={`text-[9px] ${categoryColors[entry.category]}`}>
            {categoryLabels[entry.category]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          {plain ? entry.plain : entry.short}
        </p>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => open(entry.id)}
          className="text-xs text-primary hover:text-primary px-2 h-7"
        >
          Learn more <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </CardContent>
    </Card>
  );
}
