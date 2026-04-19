import React, { useState } from 'react';
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
import { 
  History, 
  RotateCcw, 
  Clock,
  ChevronRight,
  AlertTriangle
} from 'lucide-react';
import { 
  CharacterVersion, 
  getCharacterVersions, 
  formatVersionDate,
  getChangeTypeLabel,
  getChangeTypeColor
} from '@/lib/character-history';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CharacterHistoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  characterId: string;
  characterName: string;
  onRestore: (snapshot: unknown) => void;
}

export function CharacterHistoryDialog({
  open,
  onOpenChange,
  characterId,
  characterName,
  onRestore,
}: CharacterHistoryDialogProps) {
  const [selectedVersion, setSelectedVersion] = useState<CharacterVersion | null>(null);
  const [confirmRestore, setConfirmRestore] = useState(false);
  
  const versions = getCharacterVersions(characterId);
  const reversedVersions = [...versions].reverse(); // Show newest first

  const handleRestore = () => {
    if (selectedVersion) {
      onRestore(selectedVersion.snapshot);
      setConfirmRestore(false);
      onOpenChange(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" />
              Version History
            </DialogTitle>
            <DialogDescription>
              View and restore previous versions of "{characterName}"
            </DialogDescription>
          </DialogHeader>

          {versions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No version history available yet.</p>
              <p className="text-sm mt-1">Changes will be tracked automatically as you edit.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Version List */}
              <ScrollArea className="h-[400px] pr-2">
                <div className="space-y-2">
                  {reversedVersions.map((version, index) => (
                    <div
                      key={version.id}
                      className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                        selectedVersion?.id === version.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <Badge className={`text-[10px] ${getChangeTypeColor(version.changeType)}`}>
                            {getChangeTypeLabel(version.changeType)}
                          </Badge>
                          <p className="text-sm mt-1 truncate">{version.changeDescription}</p>
                        </div>
                        <ChevronRight className={`w-4 h-4 flex-shrink-0 text-muted-foreground transition-transform ${
                          selectedVersion?.id === version.id ? 'rotate-90' : ''
                        }`} />
                      </div>
                      <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatVersionDate(version.timestamp)}
                        {index === 0 && (
                          <Badge variant="outline" className="ml-2 text-[10px]">Latest</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>

              {/* Version Details */}
              <div className="border rounded-lg p-4">
                {selectedVersion ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm">Version Details</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(selectedVersion.timestamp).toLocaleString()}
                      </p>
                    </div>
                    
                    <div>
                      <Badge className={getChangeTypeColor(selectedVersion.changeType)}>
                        {getChangeTypeLabel(selectedVersion.changeType)}
                      </Badge>
                      <p className="text-sm mt-2">{selectedVersion.changeDescription}</p>
                    </div>

                    <div className="pt-4 border-t">
                      <Button
                        className="w-full gap-2"
                        onClick={() => setConfirmRestore(true)}
                      >
                        <RotateCcw className="w-4 h-4" />
                        Restore This Version
                      </Button>
                      <p className="text-xs text-muted-foreground text-center mt-2">
                        This will replace the current character data
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Select a version to view details</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirm Restore Dialog */}
      <AlertDialog open={confirmRestore} onOpenChange={setConfirmRestore}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Restore Previous Version?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will replace the current character data with the selected version. 
              The current state will be saved to history before restoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Restore Version
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
