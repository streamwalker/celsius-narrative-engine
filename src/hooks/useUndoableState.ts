import { useState, useCallback, useRef } from 'react';

const MAX_HISTORY = 30;

/**
 * Generic undoable-state hook. Wraps a useState with undo/redo stacks.
 */
export function useUndoableState<T>(initialState: T | (() => T)) {
  const [state, setStateRaw] = useState<T>(initialState);
  const undoStack = useRef<T[]>([]);
  const redoStack = useRef<T[]>([]);

  const setState = useCallback((updater: T | ((prev: T) => T)) => {
    setStateRaw((prev) => {
      const next = typeof updater === 'function' ? (updater as (p: T) => T)(prev) : updater;
      if (next !== prev) {
        undoStack.current = [...undoStack.current.slice(-(MAX_HISTORY - 1)), prev];
        redoStack.current = [];
      }
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    setStateRaw((prev) => {
      if (undoStack.current.length === 0) return prev;
      const previous = undoStack.current[undoStack.current.length - 1];
      undoStack.current = undoStack.current.slice(0, -1);
      redoStack.current = [...redoStack.current, prev];
      return previous;
    });
  }, []);

  const redo = useCallback(() => {
    setStateRaw((prev) => {
      if (redoStack.current.length === 0) return prev;
      const next = redoStack.current[redoStack.current.length - 1];
      redoStack.current = redoStack.current.slice(0, -1);
      undoStack.current = [...undoStack.current, prev];
      return next;
    });
  }, []);

  const canUndo = undoStack.current.length > 0;
  const canRedo = redoStack.current.length > 0;

  return [state, setState, { undo, redo, canUndo, canRedo }] as const;
}
