import { apiClient } from './apiClient';

const BASE = '/workspace/papers';

const FONT_MAP = {
  sans:         'Inter',
  handwriting:  'Kalam',
  casual:       'Caveat',
  fun:          'Indie Flower',
  shadows:      'Shadows Into Light',
  dancing:      'Dancing Script',
};

const FONT_MAP_REVERSE = {
  'Inter':              'sans',
  'Kalam':              'handwriting',
  'Caveat':             'casual',
  'Indie Flower':       'fun',
  'Shadows Into Light': 'shadows',
  'Dancing Script':     'dancing',
};

/**
 * Serialize frontend paper state into backend payload.
 * Only fields in dirtyFields are included.
 */
export const serializePaper = (state, dirtyFields) => {
  const payload = {};

  if (dirtyFields.has('title')) payload.title = state.title;

  if (
    dirtyFields.has('content') ||
    dirtyFields.has('fontSize') ||
    dirtyFields.has('lineSpacing') ||
    dirtyFields.has('drawingData') ||
    dirtyFields.has('paddingX') ||
    dirtyFields.has('paddingY')
  ) {
    payload.content = JSON.stringify({
      pages:       state.pages,
      fontSize:    state.fontSize,
      lineSpacing: state.lineSpacing,
      drawingData: state.drawingData,
      paddingX:    state.paddingX,
      paddingY:    state.paddingY,
    });
  }

  if (dirtyFields.has('textColor'))  payload.text_color  = state.textColor;
  if (dirtyFields.has('fontFamily')) payload.font_style  = FONT_MAP[state.fontFamily] ?? 'Inter';
  if (dirtyFields.has('folderId') && state.folderId) payload.folder_id = state.folderId;

  return payload;
};

/**
 * Deserialize a backend paper response into frontend state.
 */
export const deserializePaper = (paper) => {
  let pages       = [''];
  let fontSize    = 16;
  let lineSpacing = 28;
  let drawingData = [''];
  let paddingX    = 96;
  let paddingY    = 80;

  if (paper.content) {
    try {
      const parsed = JSON.parse(paper.content);
      pages       = parsed.pages       ?? [''];
      fontSize    = parsed.fontSize    ?? 16;
      lineSpacing = parsed.lineSpacing ?? 28;
      drawingData = parsed.drawingData ?? [''];
      paddingX    = parsed.paddingX    ?? 96;
      paddingY    = parsed.paddingY    ?? 80;
    } catch {
      pages = [paper.content];
    }
  }

  return {
    paperId:     paper.id,
    title:       paper.title ?? 'Untitled Paper',
    pages,
    fontSize,
    lineSpacing,
    drawingData,
    paddingX,
    paddingY,
    textColor:   paper.text_color  ?? '#1e293b',
    fontFamily:  FONT_MAP_REVERSE[paper.font_style] ?? 'sans',
    folderId:    paper.folder_id   ?? null,
    folder:      paper.folder      ?? null,
    updatedAt:   paper.updated_at,
  };
};

export const paperService = {
  create:    (payload) => apiClient(BASE, { method: 'POST', body: payload }),
  update:    (id, payload) => apiClient(`${BASE}/${id}`, { method: 'PATCH', body: payload }),
  get:       (id) => apiClient(`${BASE}/${id}`),
  getPublic: (id) => apiClient(`/public/papers/${id}`),
  list:      (params = '') => apiClient(`${BASE}${params ? `?${params}` : ''}`),
  versions:  (id) => apiClient(`${BASE}/${id}/versions`),
  revert:    (id, versionId) => apiClient(`${BASE}/${id}/revert/${versionId}`, { method: 'PATCH' }),
  duplicate: (id) => apiClient(`${BASE}/duplicate/${id}`, { method: 'POST' }),
  presentations: (id) => apiClient(`${BASE}/${id}/presentations`),
  destroy: (id) => apiClient(`${BASE}/${id}`, { method: 'DELETE' }),
};
