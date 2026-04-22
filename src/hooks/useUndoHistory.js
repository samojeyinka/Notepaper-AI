import { useRef, useState, useCallback } from 'react';

const MAX = 50;

/**
 * useUndoHistory — snapshot-based undo/redo stack.
 *
 * Call push(snapshot) BEFORE a change is applied to record the old state.
 * undo(current) returns the previous snapshot (caller must apply it).
 * redo(current) returns the next snapshot (caller must apply it).
 */
export const useUndoHistory = () => {
  const pastRef   = useRef([]); // [...older, newest-before-current]
  const futureRef = useRef([]); // [next-after-current, ...newer]

  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);

  const sync = () => {
    setCanUndo(pastRef.current.length > 0);
    setCanRedo(futureRef.current.length > 0);
  };

  /** Push the state snapshot BEFORE a change is applied. */
  const push = useCallback((snapshot) => {
    pastRef.current = [...pastRef.current, snapshot].slice(-MAX);
    futureRef.current = [];  // new action clears redo branch
    sync();
  }, []);

  /**
   * Undo: pop from past, push current to future.
   * Returns the snapshot to restore, or null if nothing to undo.
   */
  const undo = useCallback((currentSnapshot) => {
    if (!pastRef.current.length) return null;
    const prev = pastRef.current[pastRef.current.length - 1];
    pastRef.current  = pastRef.current.slice(0, -1);
    futureRef.current = [currentSnapshot, ...futureRef.current].slice(0, MAX);
    sync();
    return prev;
  }, []);

  /**
   * Redo: shift from future, push current to past.
   * Returns the snapshot to restore, or null if nothing to redo.
   */
  const redo = useCallback((currentSnapshot) => {
    if (!futureRef.current.length) return null;
    const next = futureRef.current[0];
    futureRef.current = futureRef.current.slice(1);
    pastRef.current = [...pastRef.current, currentSnapshot].slice(-MAX);
    sync();
    return next;
  }, []);

  return { push, undo, redo, canUndo, canRedo };
};
