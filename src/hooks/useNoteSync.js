import { useEffect, useRef, useCallback, useState } from 'react';
import { noteService, serializeNote } from '../api/noteService';

const DEBOUNCE_MS = 1500;
const DRAFT_PREFIX = 'note_draft_';
const NEW_DRAFT_KEY = 'note_draft_new';

/**
 * useNoteSync — two-layer save system
 *
 * Layer 1: localStorage — written immediately on every change (crash safety)
 * Layer 2: Backend PATCH — debounced 1500ms, only dirty fields sent
 *
 * On mount:
 *   - If noteId provided: load from server, check if localStorage draft is newer
 *   - If no noteId (new note): restore from NEW_DRAFT_KEY if any
 *
 * Returns:
 *   { saveStatus, noteId, markDirty, forceFlush, loadNote }
 */
export const useNoteSync = (getState, noteId, setNoteId) => {
  // 'idle' | 'saving' | 'saved' | 'error' | 'loading'
  const [saveStatus, setSaveStatus] = useState(noteId ? 'loading' : 'idle');

  const dirtyRef = useRef(new Set());
  const debounceTimer = useRef(null);
  const isMountedRef = useRef(true);
  const isCreatingRef = useRef(false); // guard against double-create races

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(debounceTimer.current);
    };
  }, []);

  // ── localStorage helpers ──────────────────────────────────────────────────

  const draftKey = (id) => id ? `${DRAFT_PREFIX}${id}` : NEW_DRAFT_KEY;

  const saveDraft = useCallback(() => {
    try {
      const state = getState();
      const key = draftKey(noteId);
      localStorage.setItem(key, JSON.stringify({
        ...state,
        _savedAt: Date.now(),
      }));
    } catch { /* quota exceeded — silently skip */ }
  }, [getState, noteId]);

  const clearDraft = useCallback((id) => {
    try { localStorage.removeItem(draftKey(id)); } catch { /* */ }
  }, []);

  const loadDraft = useCallback((id) => {
    try {
      const raw = localStorage.getItem(draftKey(id));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }, []);

  // ── Core save to backend ──────────────────────────────────────────────────

  const saveToBackend = useCallback(async (forcedDirty) => {
    const dirty = forcedDirty ?? dirtyRef.current;
    // For a forced flush (manual save / Ctrl+S), always send content even if
    // dirtyRef was already cleared by a previous debounced save.
    const isForced = !!forcedDirty;
    if (dirty.size === 0 && !isForced) return;
    // If nothing is dirty but user forced a save, mark content so we send something
    if (dirty.size === 0 && isForced) dirty.add('content');

    const state = getState();
    const payload = serializeNote(state, dirty);
    if (Object.keys(payload).length === 0) return;

    // Snapshot dirty set and clear it before the async call
    // so any changes that arrive during the request get a fresh set
    dirtyRef.current = new Set();

    if (!isMountedRef.current) return;
    setSaveStatus('saving');

    try {
      let currentId = noteId;

      if (!currentId) {
        // First save — create the note
        if (isCreatingRef.current) return;
        isCreatingRef.current = true;
        const res = await noteService.create(payload);
        isCreatingRef.current = false;
        if (!isMountedRef.current) return;
        currentId = res.data.id;
        setNoteId(currentId);
        // Move the draft from the "new" key to the real id key
        const newDraft = loadDraft(null);
        if (newDraft) {
          localStorage.setItem(draftKey(currentId), JSON.stringify(newDraft));
          clearDraft(null);
        }
      } else {
        await noteService.update(currentId, payload);
      }

      if (!isMountedRef.current) return;
      setSaveStatus('saved');
      clearDraft(currentId);
    } catch (err) {
      isCreatingRef.current = false;
      if (!isMountedRef.current) return;
      setSaveStatus('error');
      // Re-add fields to dirty so next flush retries them
      dirty.forEach(f => dirtyRef.current.add(f));
      console.error('[useNoteSync] save failed', err);
    }
  }, [getState, noteId, setNoteId, loadDraft, clearDraft]);

  // ── markDirty — called whenever any state changes ─────────────────────────

  const markDirty = useCallback((fields) => {
    // Layer 1: immediate localStorage draft
    saveDraft();

    // Add to dirty set
    const arr = Array.isArray(fields) ? fields : [fields];
    arr.forEach(f => dirtyRef.current.add(f));

    // Layer 2: debounced backend save
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      saveToBackend();
    }, DEBOUNCE_MS);
  }, [saveDraft, saveToBackend]);

  // ── forceFlush — call before export to ensure server is up to date ────────

  const forceFlush = useCallback(async () => {
    clearTimeout(debounceTimer.current);
    // Pass current dirty fields (or a forced sentinel) so saveToBackend always runs
    const dirty = dirtyRef.current.size > 0 ? dirtyRef.current : new Set(['content']);
    await saveToBackend(dirty);
  }, [saveToBackend]);

  // ── loadNote — called on mount when noteId is known ──────────────────────

  const loadNote = useCallback(async (id, applyState) => {
    setSaveStatus('loading');
    try {
      const res = await noteService.get(id);
      const serverNote = res.data;

      // Check if we have a newer draft in localStorage
      const draft = loadDraft(id);
      if (draft && draft._savedAt) {
        const serverTime = new Date(serverNote.updated_at).getTime();
        if (draft._savedAt > serverTime) {
          // Draft is newer — restore it, mark everything dirty for re-sync
          const { _savedAt, ...draftState } = draft;
          applyState(draftState);
          ['title','content','paperStyle','paperColor','lineColor','textColor','fontFamily',
           'fontSize','lineSpacing','drawingData'].forEach(f => dirtyRef.current.add(f));
          setSaveStatus('saved'); // will re-save on next markDirty
          return;
        }
      }

      applyState(serverNote);
      clearDraft(id);
      setSaveStatus('saved');
    } catch (err) {
      console.error('[useNoteSync] load failed', err);
      setSaveStatus('error');
    }
  }, [loadDraft, clearDraft]);

  return { saveStatus, markDirty, forceFlush, loadNote };
};
