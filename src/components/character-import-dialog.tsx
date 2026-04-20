import React, { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  FileJson, 
  FileSpreadsheet,
  Globe,
  CheckCircle,
  AlertTriangle,
  X,
  Loader2,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';
import { 
  parseCharacterData, 
  ImportedCharacter, 
  ImportResult,
  getRaceForImport,
  getClassForImport
} from '@/lib/character-importers';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CharacterImportDialogProps {
  onImport: (characters: ImportedCharacter[]) => void;
  trigger?: React.ReactNode;
}

export function CharacterImportDialog({ onImport, trigger }: CharacterImportDialogProps) {
  const [open, setOpen] = useState(false);
  const [importTab, setImportTab] = useState<'file' | 'paste' | 'url' | 'analyze'>('file');
  const [pasteContent, setPasteContent] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [selectedCharacters, setSelectedCharacters] = useState<Set<number>>(new Set());
  const [analyzeImage, setAnalyzeImage] = useState<string | null>(null);
  const [analyzeFilename, setAnalyzeFilename] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyzeFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAnalyzeFilename(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setAnalyzeImage(ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleAnalyzeImage = async () => {
    if (!analyzeImage) {
      toast.error('Upload a character reference image first');
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('analyze-character', {
        body: { image: analyzeImage, filenameHint: analyzeFilename },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const a = data?.analysis;
      if (!a) throw new Error('No analysis returned');

      const character: ImportedCharacter = {
        name: a.suggestedName || 'CHARACTER',
        race: 'human',
        class: 'fighter',
        stats: {},
        equipment: [],
        backstory: [
          a.physicalDescription && `Appearance: ${a.physicalDescription}`,
          a.clothing && `Clothing: ${a.clothing}`,
          a.distinguishingFeatures && `Distinguishing features: ${a.distinguishingFeatures}`,
          a.colorPalette && `Color palette: ${a.colorPalette}`,
          a.estimatedAge && `Apparent age: ${a.estimatedAge}`,
        ]
          .filter(Boolean)
          .join('\n'),
        source: 'manual',
      };

      const importResult: ImportResult = {
        success: true,
        characters: [character],
        errors: [],
        warnings: a.confidence === 'low' ? ['AI confidence was low — please review and edit fields.'] : [],
      };
      setResult(importResult);
      setSelectedCharacters(new Set([0]));
      toast.success('Character analyzed');
    } catch (e: any) {
      toast.error(e.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parseResult = parseCharacterData(content);
        setResult(parseResult);
        setSelectedCharacters(new Set(parseResult.characters.map((_, i) => i)));
      } catch (err) {
        toast.error('Failed to read file');
      } finally {
        setIsLoading(false);
      }
    };
    
    reader.readAsText(file);
    e.target.value = '';
  };

  const handlePasteImport = () => {
    if (!pasteContent.trim()) {
      toast.error('Please paste some content first');
      return;
    }

    setIsLoading(true);
    try {
      const parseResult = parseCharacterData(pasteContent);
      setResult(parseResult);
      setSelectedCharacters(new Set(parseResult.characters.map((_, i) => i)));
    } catch (err) {
      toast.error('Failed to parse content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUrlImport = async () => {
    if (!urlInput.trim()) {
      toast.error('Please enter a URL');
      return;
    }

    setIsLoading(true);
    try {
      // Note: D&D Beyond doesn't have a public API, so this is a placeholder
      // In a real implementation, you'd need to handle CORS and potentially use a proxy
      toast.error('URL import requires a backend proxy. Please use file or paste instead.');
    } catch (err) {
      toast.error('Failed to fetch from URL');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCharacter = (index: number) => {
    const newSelected = new Set(selectedCharacters);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedCharacters(newSelected);
  };

  const handleConfirmImport = () => {
    if (!result || selectedCharacters.size === 0) return;

    const charactersToImport = result.characters.filter((_, i) => selectedCharacters.has(i));
    onImport(charactersToImport);
    toast.success(`Imported ${charactersToImport.length} character(s)`);
    handleClose();
  };

  const handleClose = () => {
    setOpen(false);
    setResult(null);
    setPasteContent('');
    setUrlInput('');
    setSelectedCharacters(new Set());
  };

  return (
    <Dialog open={open} onOpenChange={(o) => o ? setOpen(true) : handleClose()}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Upload className="w-4 h-4" />
            Import from D&D Beyond
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5 text-primary" />
            Import Characters
          </DialogTitle>
          <DialogDescription>
            Import character data from D&D Beyond, JSON files, or CSV spreadsheets
          </DialogDescription>
        </DialogHeader>

        {!result ? (
          <Tabs value={importTab} onValueChange={(v) => setImportTab(v as typeof importTab)}>
            <TabsList className="w-full">
              <TabsTrigger value="file" className="flex-1 gap-2">
                <FileJson className="w-4 h-4" />
                File Upload
              </TabsTrigger>
              <TabsTrigger value="paste" className="flex-1 gap-2">
                <FileSpreadsheet className="w-4 h-4" />
                Paste Data
              </TabsTrigger>
              <TabsTrigger value="url" className="flex-1 gap-2">
                <Globe className="w-4 h-4" />
                From URL
              </TabsTrigger>
            </TabsList>

            <TabsContent value="file" className="space-y-4 mt-4">
              <div 
                className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <Upload className="w-10 h-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports JSON (D&D Beyond export) and CSV files
                </p>
              </div>
              
              <div className="text-xs text-muted-foreground">
                <strong>Supported formats:</strong>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>D&D Beyond character export (JSON)</li>
                  <li>Generic character JSON with name, race, class fields</li>
                  <li>CSV with columns: name, race, class, description</li>
                </ul>
              </div>
            </TabsContent>

            <TabsContent value="paste" className="space-y-4 mt-4">
              <Textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Paste JSON or CSV data here..."
                className="min-h-[200px] font-mono text-xs"
              />
              <Button 
                onClick={handlePasteImport} 
                disabled={!pasteContent.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Parse Data
              </Button>
            </TabsContent>

            <TabsContent value="url" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">D&D Beyond Character URL</label>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://www.dndbeyond.com/characters/..."
                  className="w-full px-3 py-2 border rounded-md bg-background"
                />
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    URL import requires a backend service. For now, please export your character 
                    from D&D Beyond and use the file upload option.
                  </p>
                </div>
              </div>
              <Button 
                onClick={handleUrlImport} 
                disabled={!urlInput.trim() || isLoading}
                className="w-full"
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Fetch Character
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {/* Results Summary */}
            <div className="flex items-center gap-4">
              {result.success ? (
                <Badge variant="default" className="gap-1 bg-green-500">
                  <CheckCircle className="w-3 h-3" />
                  {result.characters.length} character(s) found
                </Badge>
              ) : (
                <Badge variant="destructive" className="gap-1">
                  <X className="w-3 h-3" />
                  Import failed
                </Badge>
              )}
            </div>

            {/* Errors */}
            {result.errors.length > 0 && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm font-medium text-red-500 mb-1">Errors:</p>
                <ul className="text-xs text-red-400 list-disc list-inside">
                  {result.errors.map((err, i) => <li key={i}>{err}</li>)}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {result.warnings.length > 0 && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-sm font-medium text-amber-500 mb-1">Warnings:</p>
                <ul className="text-xs text-amber-400 list-disc list-inside">
                  {result.warnings.map((warn, i) => <li key={i}>{warn}</li>)}
                </ul>
              </div>
            )}

            {/* Character List */}
            {result.characters.length > 0 && (
              <ScrollArea className="h-[250px] pr-2">
                <div className="space-y-2">
                  {result.characters.map((char, index) => {
                    const race = getRaceForImport(char.race);
                    const charClass = getClassForImport(char.class);
                    const isSelected = selectedCharacters.has(index);

                    return (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-primary bg-primary/5' 
                            : 'border-border hover:border-primary/50'
                        }`}
                        onClick={() => toggleCharacter(index)}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{char.name}</span>
                              {char.level && (
                                <Badge variant="outline" className="text-xs">
                                  Level {char.level}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {race?.name || char.race}
                              </Badge>
                              <Badge variant="outline" className="text-xs capitalize">
                                {charClass?.name || char.class}
                              </Badge>
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button variant="outline" onClick={() => setResult(null)} className="flex-1">
                Back
              </Button>
              <Button 
                onClick={handleConfirmImport} 
                disabled={selectedCharacters.size === 0}
                className="flex-1"
              >
                Import {selectedCharacters.size} Character(s)
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
