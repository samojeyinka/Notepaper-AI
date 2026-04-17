import { useEffect, useRef, useCallback, useState } from 'react';
import { paperService, serializePaper } from '../api/paperService';
import { workspaceCache } from '../api/workspaceCache';

const DEBOUNCE_MS = 1500;
const DRAFT_PREFIX = 'paper_draft_';
const NEW_DRAFT_KEY = 'paper_draft_new';

export const usePaperSync = (getState, paperId, setPaperId) => {
  const [saveStatus, setSaveStatus] = useState(paperId ? 'loading' : 'idle');

  const dirtyRef        = useRef(new Set());
  const debounceTimer   = useRef(null);
  const isMountedRef    = useRef(true);
  const isCreatingRef   = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      clearTimeout(debounceTimer.current);
    };
  }, []);

  const draftKey   = (id) => id ? `${DRAFT_PREFIX}${id}` : NEW_DRAFT_KEY;
  const saveDraft  = useCallback(() => {
    try {
      const state = getState();
      localStorage.setItem(draftKey(paperId), JSON.stringify({ ...state, _savedAt: Date.now() }));
    } catch { /* quota */ }
  }, [getState, paperId]);
  const clearDraft = useCallback((id) => { try { localStorage.removeItem(draftKey(id)); } catch { /* */ } }, []);
  const loadDraft  = useCallback((id) => { try { const r = localStorage.getItem(draftKey(id)); return r ? JSON.parse(r) : null; } catch { return null; } }, []);

  const saveToBackend = useCallback(async (forcedDirty) => {
    const dirty = forcedDirty ?? dirtyRef.current;
    const isForced = !!forcedDirty;
    if (dirty.size === 0 && !isForced) return;
    if (dirty.size === 0 && isForced) dirty.add('content');

    const state   = getState();
    const payload = serializePaper(state, dirty);
    if (Object.keys(payload).length === 0) return;

    dirtyRef.current = new Set();
    if (!isMountedRef.current) return;
    setSaveStatus('saving');

    try {
      let currentId = paperId;
      if (!currentId) {
        if (isCreatingRef.current) return;
        isCreatingRef.current = true;
        const res = await paperService.create(payload);
        isCreatingRef.current = false;
        if (!isMountedRef.current) return;
        currentId = res.data.id;
        setPaperId(currentId);
        workspaceCache.invalidateNotes();
        const newDraft = loadDraft(null);
        if (newDraft) {
          localStorage.setItem(draftKey(currentId), JSON.stringify(newDraft));
          clearDraft(null);
        }
      } else {
        await paperService.update(currentId, payload);
        workspaceCache.invalidateNotes();
      }
      if (!isMountedRef.current) return;
      setSaveStatus('saved');
      clearDraft(currentId);
    } catch (err) {
      isCreatingRef.current = false;
      if (!isMountedRef.current) return;
      setSaveStatus('error');
      dirty.forEach(f => dirtyRef.current.add(f));
      console.error('[usePaperSync] save failed', err);
    }
  }, [getState, paperId, setPaperId, loadDraft, clearDraft]);

  const markDirty = useCallback((fields) => {
    saveDraft();
    const arr = Array.isArray(fields) ? fields : [fields];
    arr.forEach(f => dirtyRef.current.add(f));
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => { saveToBackend(); }, DEBOUNCE_MS);
  }, [saveDraft, saveToBackend]);

  const forceFlush = useCallback(async () => {
    clearTimeout(debounceTimer.current);
    const dirty = dirtyRef.current.size > 0 ? dirtyRef.current : new Set(['content']);
    await saveToBackend(dirty);
  }, [saveToBackend]);

  const loadPaper = useCallback(async (id, applyState) => {
    setSaveStatus('loading');
    try {
      const res        = await paperService.get(id);
      const serverPaper = res.data;
      const draft      = loadDraft(id);
      if (draft && draft._savedAt) {
        const serverTime = new Date(serverPaper.updated_at).getTime();
        if (draft._savedAt > serverTime) {
          const { _savedAt, ...draftState } = draft;
          applyState({ ...draftState, folder: serverPaper.folder ?? null, folder_id: serverPaper.folder_id ?? null });
          ['title','content','textColor','fontFamily','fontSize','lineSpacing','drawingData','paddingX','paddingY']
            .forEach(f => dirtyRef.current.add(f));
          setSaveStatus('saved');
          return;
        }
      }
      applyState(serverPaper);
      clearDraft(id);
      setSaveStatus('saved');
    } catch (err) {
      console.error('[usePaperSync] load failed', err);
      setSaveStatus('error');
    }
  }, [loadDraft, clearDraft]);

  return { saveStatus, markDirty, forceFlush, loadPaper };
};
