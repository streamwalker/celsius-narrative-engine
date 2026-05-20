import { useRef, useState } from 'react';
import mammoth from 'mammoth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, ArrowRight, Loader2, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { GenerateInput } from '@/lib/panelcraft2/generate';

interface Props {
  onGenerate: (input: GenerateInput) => void;
  onLoadExample: () => void;
  isGenerating: boolean;
  error: string | null;
}

const PAGE_OPTIONS: { v: GenerateInput['targetPages']; label: string; desc: string }[] = [
  { v: 'auto', label: 'Auto', desc: 'Let Panelcraft decide based on beat density.' },
  { v: '22', label: '22 pages', desc: 'Standard single-issue length.' },
  { v: '32', label: '32 pages', desc: 'Extended issue for dense or multi-track stories.' },
];

export function IntakeView({ onGenerate, onLoadExample, isGenerating, error }: Props) {
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('');
  const [targetPages, setTargetPages] = useState<GenerateInput['targetPages']>('auto');
  const [treatment, setTreatment] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setUploadStatus(`Reading ${file.name}…`);
    try {
      if (file.name.endsWith('.docx')) {
        const buffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer: buffer });
        setTreatment(result.value || '');
        setUploadStatus(`Loaded ${file.name} (${result.value.length} chars)`);
      } else if (file.name.endsWith('.txt') || file.name.endsWith('.md') || file.type.startsWith('text/')) {
        const text = await file.text();
        setTreatment(text);
        setUploadStatus(`Loaded ${file.name} (${text.length} chars)`);
      } else if (file.name.endsWith('.pdf')) {
        setUploadStatus('PDF upload is not supported yet. Please paste the treatment text.');
      } else {
        setUploadStatus('Unsupported file type. Use .txt, .md, or .docx, or paste text.');
      }
    } catch (err) {
      setUploadStatus(`Error reading file: ${err instanceof Error ? err.message : 'unknown error'}`);
    }
  };

  const canGenerate = treatment.trim().length > 40 && !isGenerating;

  return (
    <div className="w-full h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Branding */}
        <div className="mb-10">
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.4em] uppercase mb-2 text-accent">
            <LayoutGrid className="h-3.5 w-3.5" /> Panelcraft 2
          </div>
          <h1 className="text-4xl mb-2 font-serif italic">New Issue</h1>
          <p className="text-base font-serif italic text-muted-foreground leading-relaxed">
            Paste a treatment for a single issue. Panelcraft will return a per-page breakdown — page count,
            R/L convention, cliffhanger placement, and an evocative title and summary for each page — ready
            to refine in the editor.
          </p>
        </div>

        <div className="space-y-6">
          {/* Title + Theme */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Issue Title
              </Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Issue 4"
                className="font-serif"
              />
            </div>
            <div>
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
                Theme (optional)
              </Label>
              <Input
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                placeholder="The cost of being known."
                className="font-serif italic"
              />
            </div>
          </div>

          {/* Target pages */}
          <div>
            <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Target Page Count
            </Label>
            <div className="flex flex-col sm:flex-row gap-2">
              {PAGE_OPTIONS.map(opt => (
                <button
                  key={opt.v}
                  onClick={() => setTargetPages(opt.v)}
                  title={opt.desc}
                  className={cn(
                    'flex-1 px-4 py-3 rounded text-left border transition-colors',
                    targetPages === opt.v
                      ? 'border-accent bg-accent/10'
                      : 'border-border bg-card hover:bg-accent/5',
                  )}
                >
                  <div className={cn(
                    'font-mono text-xs uppercase tracking-widest',
                    targetPages === opt.v ? 'text-accent' : 'text-foreground',
                  )}>
                    {opt.label}
                  </div>
                  <div className="text-[11px] mt-1 text-muted-foreground">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Treatment */}
          <div>
            <div className="flex items-baseline justify-between mb-1.5 flex-wrap gap-2">
              <Label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Treatment{' '}
                <span className="text-muted-foreground/60">· {treatment.length.toLocaleString()} chars</span>
              </Label>
              <div className="flex items-center gap-3">
                {uploadStatus && (
                  <span className="font-mono text-[10px] text-accent">{uploadStatus}</span>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.docx,.pdf,text/*"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0])}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-mono text-[10px] uppercase tracking-widest h-7"
                >
                  <Upload className="h-3 w-3 mr-1" /> upload file
                </Button>
              </div>
            </div>
            <Textarea
              value={treatment}
              onChange={(e) => setTreatment(e.target.value)}
              placeholder="Paste your treatment here. Prose summary of the issue — plot beats across all story tracks (A-story, B-story, etc.), key dialogue, settings, character actions. The more concrete the treatment, the better the breakdown."
              rows={18}
              className="font-serif text-sm leading-relaxed min-h-[300px]"
            />
          </div>

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>
                <div className="font-mono text-[10px] uppercase tracking-widest mb-1">Generation Error</div>
                {error}
              </AlertDescription>
            </Alert>
          )}

          {/* Action row */}
          <div className="flex items-center justify-between pt-2 flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={onLoadExample}
              disabled={isGenerating}
              className="font-mono text-[11px] uppercase tracking-widest"
            >
              load example · Issue 2
            </Button>

            <Button
              onClick={() => onGenerate({ title, theme, treatment, targetPages })}
              disabled={!canGenerate}
              size="lg"
              className="font-mono text-xs uppercase tracking-widest"
            >
              {isGenerating ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> generating breakdown…</>
              ) : (
                <>generate per-page plan <ArrowRight className="h-4 w-4 ml-2" /></>
              )}
            </Button>
          </div>

          {/* Tips */}
          <div className="pt-6 mt-6 border-t border-border">
            <div className="font-mono text-[10px] uppercase tracking-widest mb-3 text-muted-foreground">
              What Panelcraft Does
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-[12px] text-muted-foreground leading-relaxed">
              <div>
                <div className="text-accent font-serif italic text-sm mb-1">01 — Counts the beats</div>
                Identifies discrete plot beats across A/B/C story tracks. Picks 22 or 32 pages by density
                unless you override.
              </div>
              <div>
                <div className="text-accent font-serif italic text-sm mb-1">02 — Places the page turns</div>
                Page 1 is right-hand. Odd pages are R, even are L. Cliffhangers live on R; reveals land on L.
                The final page lands the issue.
              </div>
              <div>
                <div className="text-accent font-serif italic text-sm mb-1">03 — Hands you the editor</div>
                Output loads into the panel-scripting workspace: function tags, tone ledger, story-arc graph,
                craft checks, industry-format export.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
