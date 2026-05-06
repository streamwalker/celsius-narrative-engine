import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export interface ComparisonRow {
  term: string;
  meaning: string;
  plain: string;
  related?: string;
  whyItMatters?: string;
}

export function ComparisonTable({ rows, caption }: { rows: ComparisonRow[]; caption?: string }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-card/40">
      <Table>
        {caption && <caption className="py-2 text-xs text-muted-foreground">{caption}</caption>}
        <TableHeader>
          <TableRow>
            <TableHead className="w-[18%]">Term</TableHead>
            <TableHead>Meaning</TableHead>
            <TableHead>Plain English</TableHead>
            <TableHead>Related</TableHead>
            <TableHead>Why it matters</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => (
            <TableRow key={r.term}>
              <TableCell className="font-medium">{r.term}</TableCell>
              <TableCell className="text-sm text-foreground/85">{r.meaning}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.plain}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.related ?? '—'}</TableCell>
              <TableCell className="text-sm text-muted-foreground">{r.whyItMatters ?? '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
