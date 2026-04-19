import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Cloud, CloudOff, Loader2, Check, AlertCircle } from "lucide-react";
import { formatTimeSince } from "@/hooks/useAutoSave";

interface AutoSaveIndicatorProps {
  lastSaveTime: Date | null;
  isSaving: boolean;
  hasUnsavedChanges: boolean;
  error: Error | null;
  onSaveNow: () => void;
  disabled?: boolean;
}

export function AutoSaveIndicator({
  lastSaveTime,
  isSaving,
  hasUnsavedChanges,
  error,
  onSaveNow,
  disabled = false,
}: AutoSaveIndicatorProps) {
  const getStatusIcon = () => {
    if (isSaving) return <Loader2 className="w-4 h-4 animate-spin text-primary" />;
    if (error) return <AlertCircle className="w-4 h-4 text-destructive" />;
    if (hasUnsavedChanges) return <CloudOff className="w-4 h-4 text-amber-500" />;
    if (lastSaveTime) return <Check className="w-4 h-4 text-green-500" />;
    return <Cloud className="w-4 h-4 text-muted-foreground" />;
  };

  const getStatusText = () => {
    if (isSaving) return "Saving...";
    if (error) return "Save failed";
    if (hasUnsavedChanges) return "Unsaved changes";
    if (lastSaveTime) return "All changes saved";
    return "Auto-save enabled";
  };

  const getTooltipContent = () => {
    if (isSaving) return "Saving your changes...";
    if (error) return `Save failed: ${error.message}. Click to retry.`;
    if (hasUnsavedChanges) return "You have unsaved changes. Click to save now.";
    if (lastSaveTime) return `Last saved ${formatTimeSince(lastSaveTime)}`;
    return "Auto-save is enabled.";
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSaveNow}
          disabled={disabled || isSaving || (!hasUnsavedChanges && !error)}
          className="h-8 px-2 gap-1.5 text-xs"
        >
          {getStatusIcon()}
          <span className="hidden sm:inline">{getStatusText()}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{getTooltipContent()}</p>
      </TooltipContent>
    </Tooltip>
  );
}
