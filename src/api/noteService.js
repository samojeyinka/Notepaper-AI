import { apiClient } from './apiClient';

const BASE = '/workspace/notes';

// Map frontend fontFamily id → backend font_style value (must match enum exactly)
const FONT_MAP = {
  sans:         'Inter',
  handwriting:  'Kalam',
  casual:       'Caveat',
  fun:          'Indie Flower',
  shadows:      'Shadows Into Light',
  dancing:      'Dancing Script',
};

// Map frontend paperStyle to backend paper_type enum
const PAPER_MAP = {
  plain: 'blank',
  ruled: 'ruled',
  grid: 'grid',
  dotted: 'dotted',
};

const PAPER_MAP_REVERSE = {
  blank: 'plain',
  ruled: 'ruled',
  grid: 'grid',
  dotted: 'dotted',
};

// Map backend font_style value → frontend fontFamily id
const FONT_MAP_REVERSE = {
  'Inter':              'sans',
  'Kalam':              'handwriting',
  'Caveat':             'casual',
  'Indie Flower':       'fun',
  'Shadows Into Light': 'shadows',
  'Dancing Script':     'dancing',
};

/**
 * Serialize all frontend note state into the backend payload.
 * `dirtyFields` is a Set — only include those fields.
 */
export const serializeNote = (state, dirtyFields) => {
  const payload = {};

  if (dirtyFields.has('title')) payload.title = state.title;

  // All content-related state goes into the `content` JSON blob
  if (
    dirtyFields.has('content') ||
    dirtyFields.has('fontSize') ||
    dirtyFields.has('lineSpacing') ||
    dirtyFields.has('drawingData')
  ) {
    payload.content = JSON.stringify({
      pages: state.pages,
      fontSize: state.fontSize,
      lineSpacing: state.lineSpacing,
      drawingData: state.drawingData,
    });
  }

  if (dirtyFields.has('paperStyle'))
    payload.paper_type = PAPER_MAP[state.paperStyle] ?? 'blank';

  if (dirtyFields.has('paperColor'))
    payload.paper_background_color = state.paperColor;

  if (dirtyFields.has('lineColor'))
    payload.paper_line_color = state.lineColor;

  if (dirtyFields.has('textColor'))
    payload.text_color = state.textColor;

  if (dirtyFields.has('fontFamily'))
    payload.font_style = FONT_MAP[state.fontFamily] ?? 'Caveat';

  if (dirtyFields.has('folderId') && state.folderId)
    payload.folder_id = state.folderId;

  return payload;
};

/**
 * Deserialize a backend note response into frontend state.
 */
export const deserializeNote = (note) => {
  let pages = [''];
  let fontSize = 18;
  let lineSpacing = 32;
  let drawingData = [''];

  if (note.content) {
    try {
      const parsed = JSON.parse(note.content);
      pages = parsed.pages ?? [''];
      fontSize = parsed.fontSize ?? 18;
      lineSpacing = parsed.lineSpacing ?? 32;
      drawingData = parsed.drawingData ?? [''];
    } catch {
      // Legacy plain-text content — treat as first page
      pages = [note.content];
    }
  }

  return {
    noteId: note.id,
    title: note.title ?? 'Untitled Note',
    pages,
    fontSize,
    lineSpacing,
    drawingData,
    paperStyle: PAPER_MAP_REVERSE[note.paper_type] ?? 'ruled',
    paperColor: note.paper_background_color ?? '#ffffff',
    lineColor: note.paper_line_color ?? '#cbd5e1',
    textColor: note.text_color ?? '#1e293b',
    fontFamily: FONT_MAP_REVERSE[note.font_style] ?? 'sans',
    folderId: note.folder_id ?? null,
    folder: note.folder ?? null,
    updatedAt: note.updated_at,
  };
};

export const noteService = {
  create: (payload) =>
    apiClient(BASE, { method: 'POST', body: payload }),

  update: (id, payload) =>
    apiClient(`${BASE}/${id}`, { method: 'PATCH', body: payload }),

  get: (id) =>
    apiClient(`${BASE}/${id}`),

  list: (params = '') =>
    apiClient(`${BASE}${params ? `?${params}` : ''}`),

  versions: (id) =>
    apiClient(`${BASE}/${id}/versions`),

  revert: (id, versionId) =>
    apiClient(`${BASE}/${id}/revert/${versionId}`, { method: 'PATCH' }),

  duplicate: (id) =>
    apiClient(`${BASE}/duplicate/${id}`, { method: 'POST' }),
};
