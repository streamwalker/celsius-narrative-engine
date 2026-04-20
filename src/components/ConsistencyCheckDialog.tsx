import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Progress } from '@/components/ui/progress';
import { Loader2, ShieldCheck, AlertTriangle, CheckCircle2, Upload, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ReferenceImage {
  characterName: string;
  image: string;
}

interface CharacterMatch {
  characterName: string;
  matchScore: number;
  issues: string[];
  details: string;
}

interface ConsistencyResult {
  overallScore: number;
  characterMatches: CharacterMatch[];
  generalIssues: string[];
}

interface CharacterPreset {
  id: string;
  name?: string;
  referenceImages?: string[];
  poses?: { image: string }[];
}

interface ConsistencyCheckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panelImage: string;
  panelLabel?: string;
}

export function ConsistencyCheckDialog({
  open,
  onOpenChange,
  panelImage,
  panelLabel,
}: ConsistencyCheckDialogProps) {
  const [presets, setPresets] = useState<CharacterPreset[]>([]);
  const [selectedPresets, setSelectedPresets] = useState<Set<string>>(new Set());
  const [uploadedRefs, setUploadedRefs] = useState<ReferenceImage[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<ConsistencyResult | null>(null);

  useEffect(() => {
    if (!open) return;
    try {
      const raw = JSON.parse(localStorage.getItem('comic-character-presets') || '[]');
      setPresets(Array.isArray(raw) ? raw : []);
    } catch {
      setPresets([]);
    }
    setResult(null);
    setSelectedPresets(new Set());
    setUploadedRefs([]);
  }, [open]);

  const togglePreset = (id: string) => {
    setSelectedPresets((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        const name = file.name.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').toUpperCase();
        setUploadedRefs((prev) => [...prev, { characterName: name, image: dataUrl }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const buildReferenceImages = (): ReferenceImage[] => {
    const fromPresets: ReferenceImage[] = [];
    presets
      .filter((p) => selectedPresets.has(p.id))
      .forEach((p) => {
        const img =
          p.poses?.[0]?.image ||
          p.referenceImages?.[0] ||
          null;
        if (img) {
          fromPresets.push({ characterName: p.name || 'Character', image: img });
        }
      });
    return [...fromPresets, ...uploadedRefs];
  };

  const handleCheck = async () => {
    const refs = buildReferenceImages();
    if (refs.length === 0) {
      toast.error('Select at least one character reference (from library or upload).');
      return;
    }
    setIsChecking(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke('check-consistency', {
        body: {
          panelImage,
          referenceImages: refs,
          characterNames: refs.map((r) => r.characterName),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data as ConsistencyResult);
    } catch (e: any) {
      toast.error(e.message || 'Consistency check failed');
    } finally {
      setIsChecking(false);
    }
  };

  const removeUpload = (idx: number) => {
    setUploadedRefs((prev) => prev.filter((_, i) => i !== idx));
  };

  const refCount = selectedPresets.size + uploadedRefs.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Character Consistency Check
            {panelLabel && (
              <Badge variant="outline" className="ml-2 font-mono text-[10px]">
                {panelLabel}
              </Badge>
            )}
          </DialogTitle>
          <DialogDescription>
            Compare this panel against character references to spot visual inconsistencies.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-3">
          <div className="space-y-4">
            {/* Panel preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                  Generated panel
                </p>
                <img
                  src={panelImage}
                  alt="Panel under review"
                  className="w-full rounded border border-border"
                />
              </div>

              <div className="space-y-2">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Character references ({refCount})
                </p>

                {presets.length > 0 && (
                  <div className="border rounded-md p-2 max-h-40 overflow-y-auto space-y-1">
                    {presets.map((p) => {
                      const img = p.poses?.[0]?.image || p.referenceImages?.[0];
                      const selected = selectedPresets.has(p.id);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => togglePreset(p.id)}
                          className={cn(
                            'w-full flex items-center gap-2 p-1.5 rounded text-left transition-colors',
                            selected ? 'bg-primary/10 ring-1 ring-primary' : 'hover:bg-accent'
                          )}
                        >
                          {img ? (
                            <img src={img} alt={p.name} className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <div className="w-8 h-8 rounded bg-muted" />
                          )}
                          <span className="text-xs flex-1 truncate">{p.name || 'Unnamed'}</span>
                          {selected && <CheckCircle2 className="h-4 w-4 text-primary" />}
                        </button>
                      );
                    })}
                  </div>
                )}

                <label className="block">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleUpload}
                    className="hidden"
                  />
                  <span className="cursor-pointer inline-flex items-center gap-2 text-xs px-3 py-1.5 border rounded hover:bg-accent">
                    <Upload className="h-3 w-3" /> Upload reference image
                  </span>
                </label>

                {uploadedRefs.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {uploadedRefs.map((r, i) => (
                      <div key={i} className="relative group">
                        <img src={r.image} alt={r.characterName} className="w-12 h-12 rounded object-cover" />
                        <button
                          type="button"
                          onClick={() => removeUpload(i)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <Button onClick={handleCheck} disabled={isChecking || refCount === 0} className="w-full">
              {isChecking ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 mr-2" /> Run consistency check
                </>
              )}
            </Button>

            {/* Results */}
            {result && (
              <div className="space-y-3 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Overall consistency</p>
                  <Badge
                    variant={result.overallScore >= 75 ? 'default' : 'destructive'}
                    className="font-mono"
                  >
                    {result.overallScore}/100
                  </Badge>
                </div>
                <Progress value={result.overallScore} className="h-2" />

                {result.characterMatches?.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                      Per-character match
                    </p>
                    {result.characterMatches.map((m, i) => (
                      <div key={i} className="border rounded-md p-3 space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">{m.characterName}</span>
                          <Badge
                            variant={m.matchScore >= 75 ? 'default' : 'destructive'}
                            className="font-mono text-[10px]"
                          >
                            {m.matchScore}
                          </Badge>
                        </div>
                        {m.details && (
                          <p className="text-xs text-muted-foreground">{m.details}</p>
                        )}
                        {m.issues?.length > 0 && (
                          <ul className="text-xs space-y-0.5">
                            {m.issues.map((iss, j) => (
                              <li key={j} className="flex items-start gap-1.5">
                                <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                                <span>{iss}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {result.generalIssues?.length > 0 && (
                  <div className="border rounded-md p-3 bg-amber-500/5">
                    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">
                      General issues
                    </p>
                    <ul className="text-xs space-y-0.5">
                      {result.generalIssues.map((iss, j) => (
                        <li key={j} className="flex items-start gap-1.5">
                          <AlertTriangle className="h-3 w-3 text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>{iss}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}
