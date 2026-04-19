import { useEffect } from 'react';

interface ScriptFormatterShortcuts {
  onSave?: () => void;
  onFormat?: () => void;
  onNewScript?: () => void;
  onClearText?: () => void;
  onShowHelp?: () => void;
  isEnabled?: boolean;
}

/**
 * Keyboard shortcuts for the Script Formatter page.
 *
 * Bindings (Mac: ⌘, Win/Linux: Ctrl):
 *   ⌘/Ctrl + S       → save now
 *   ⌘/Ctrl + Enter   → format script
 *   ⌘/Ctrl + Shift+N → new script
 *   ⌘/Ctrl + Shift+K → clear the editor text
 *   ?                → show help (when focus is not in an input)
 */
export function useScriptFormatterShortcuts({
  onSave,
  onFormat,
  onNewScript,
  onClearText,
  onShowHelp,
  isEnabled = true,
}: ScriptFormatterShortcuts) {
  useEffect(() => {
    if (!isEnabled) return;

    const handler = (e: KeyboardEvent) => {
      const isMeta = e.ctrlKey || e.metaKey;

      if (!isMeta && e.key === '?') {
        const target = e.target as HTMLElement;
        const typing =
          target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
        if (!typing && onShowHelp) {
          e.preventDefault();
          onShowHelp();
        }
        return;
      }

      if (!isMeta) return;

      if (e.key.toLowerCase() === 's' && !e.shiftKey) {
        if (onSave) {
          e.preventDefault();
          onSave();
        }
        return;
      }

      if (e.key === 'Enter') {
        if (onFormat) {
          e.preventDefault();
          onFormat();
        }
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'n') {
        if (onNewScript) {
          e.preventDefault();
          onNewScript();
        }
        return;
      }

      if (e.shiftKey && e.key.toLowerCase() === 'k') {
        if (onClearText) {
          e.preventDefault();
          onClearText();
        }
        return;
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isEnabled, onSave, onFormat, onNewScript, onClearText, onShowHelp]);
}

/** The shortcut bindings in human-readable form, for the help dialog. */
export const SCRIPT_FORMATTER_SHORTCUTS = [
  { keys: ['⌘/Ctrl', 'S'], label: 'Save now' },
  { keys: ['⌘/Ctrl', '⏎ Enter'], label: 'Format script' },
  { keys: ['⌘/Ctrl', 'Shift', 'N'], label: 'New script' },
  { keys: ['⌘/Ctrl', 'Shift', 'K'], label: 'Clear editor text' },
  { keys: ['?'], label: 'Show this help' },
] as const;
