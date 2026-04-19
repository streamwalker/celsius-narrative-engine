import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Trash2, 
  Download, 
  Shuffle, 
  X,
  CheckSquare,
  Square,
  Tag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

interface BatchActionsToolbarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onDelete: () => void;
  onExport: () => void;
  onStyleTransfer?: () => void;
  className?: string;
}

export function BatchActionsToolbar({
  selectedCount,
  totalCount,
  onSelectAll,
  onDeselectAll,
  onDelete,
  onExport,
  onStyleTransfer,
  className = '',
}: BatchActionsToolbarProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  if (selectedCount === 0) return null;

  const allSelected = selectedCount === totalCount;

  return (
    <>
      <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${className}`}>
        <div className="flex items-center gap-2 bg-background border border-border rounded-full shadow-lg px-4 py-2 animate-fade-in">
          {/* Selection Info */}
          <Badge variant="secondary" className="gap-1">
            <CheckSquare className="w-3 h-3" />
            {selectedCount} selected
          </Badge>

          <div className="w-px h-6 bg-border" />

          {/* Select/Deselect All */}
          <Button
            variant="ghost"
            size="sm"
            onClick={allSelected ? onDeselectAll : onSelectAll}
            className="gap-1"
          >
            {allSelected ? (
              <>
                <Square className="w-4 h-4" />
                Deselect All
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4" />
                Select All
              </>
            )}
          </Button>

          <div className="w-px h-6 bg-border" />

          {/* Actions */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            className="gap-1"
          >
            <Download className="w-4 h-4" />
            Export
          </Button>

          {onStyleTransfer && selectedCount >= 2 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onStyleTransfer}
              className="gap-1"
            >
              <Shuffle className="w-4 h-4" />
              Style Transfer
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowDeleteConfirm(true)}
            className="gap-1 text-red-500 hover:text-red-600 hover:bg-red-500/10"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>

          <div className="w-px h-6 bg-border" />

          {/* Close */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onDeselectAll}
            className="h-8 w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {selectedCount} character(s)?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The selected characters will be permanently removed
              from your library.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                onDelete();
                setShowDeleteConfirm(false);
              }}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
