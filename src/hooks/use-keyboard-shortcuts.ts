import { useEffect, useCallback } from 'react';

interface KeyboardShortcutOptions {
  onToggleView?: () => void;
  onNewCharacter?: () => void;
  onOpenDetail?: () => void;
  onDelete?: () => void;
  onEdit?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
  onNavigateNext?: () => void;
  onNavigatePrev?: () => void;
  onShowHelp?: () => void;
  onCompare?: () => void;
  isEnabled?: boolean;
}

export function useKeyboardShortcuts({
  onToggleView,
  onNewCharacter,
  onOpenDetail,
  onDelete,
  onEdit,
  onSearch,
  onEscape,
  onNavigateNext,
  onNavigatePrev,
  onShowHelp,
  onCompare,
  isEnabled = true,
}: KeyboardShortcutOptions) {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isEnabled) return;

    // Skip if user is typing in an input, textarea, or contenteditable
    const target = e.target as HTMLElement;
    if (
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable
    ) {
      // Still allow Escape in inputs
      if (e.key === 'Escape' && onEscape) {
        onEscape();
        e.preventDefault();
      }
      return;
    }

    // Handle ? for help (with or without shift)
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {
      if (onShowHelp) {
        e.preventDefault();
        onShowHelp();
      }
      return;
    }

    // Prevent shortcuts when modifiers are pressed (except for expected combos)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    switch (e.key.toLowerCase()) {
      case 'g':
        if (onToggleView) {
          e.preventDefault();
          onToggleView();
        }
        break;

      case 'n':
        if (onNewCharacter) {
          e.preventDefault();
          onNewCharacter();
        }
        break;

      case 'enter':
        if (onOpenDetail) {
          e.preventDefault();
          onOpenDetail();
        }
        break;

      case 'delete':
      case 'backspace':
        if (onDelete && e.shiftKey) {
          e.preventDefault();
          onDelete();
        }
        break;

      case 'e':
        if (onEdit) {
          e.preventDefault();
          onEdit();
        }
        break;

      case 'c':
        if (onCompare) {
          e.preventDefault();
          onCompare();
        }
        break;

      case '/':
        if (onSearch) {
          e.preventDefault();
          onSearch();
        }
        break;

      case 'escape':
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        break;

      case 'arrowright':
      case 'j':
        if (onNavigateNext) {
          e.preventDefault();
          onNavigateNext();
        }
        break;

      case 'arrowleft':
      case 'k':
        if (onNavigatePrev) {
          e.preventDefault();
          onNavigatePrev();
        }
        break;
    }
  }, [
    isEnabled,
    onToggleView,
    onNewCharacter,
    onOpenDetail,
    onDelete,
    onEdit,
    onSearch,
    onEscape,
    onNavigateNext,
    onNavigatePrev,
    onShowHelp,
    onCompare,
  ]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Keyboard shortcut hints for UI display
export const KEYBOARD_SHORTCUTS = [
  { key: 'G', action: 'Toggle gallery view' },
  { key: 'N', action: 'New character' },
  { key: 'C', action: 'Compare characters' },
  { key: '/', action: 'Focus search' },
  { key: 'Enter', action: 'Open details' },
  { key: 'E', action: 'Edit selected' },
  { key: 'Shift+Delete', action: 'Delete selected' },
  { key: '← →', action: 'Navigate characters' },
  { key: '?', action: 'Show shortcuts help' },
  { key: 'Esc', action: 'Close dialog' },
];
