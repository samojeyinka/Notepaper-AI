/**
 * Simple in-memory cache for workspace data.
 * Data lives for the browser session and is invalidated on mutations.
 */
const cache = {
    folders: null,   // { data: [], fetchedAt: timestamp }
    notes:   null,   // { data: [], meta: {}, fetchedAt: timestamp }
};

export const workspaceCache = {
    getFolders: () => cache.folders ?? null,
    setFolders: (payload) => { cache.folders = { ...payload, fetchedAt: Date.now() }; },

    getNotes: () => cache.notes ? { data: cache.notes.data, meta: cache.notes.meta } : null,
    setNotes: (data, meta) => { cache.notes = { data, meta, fetchedAt: Date.now() }; },

    /** Call after creating/deleting a folder */
    invalidateFolders: () => { cache.folders = null; },

    /** Call after creating/deleting a note */
    invalidateNotes: () => { cache.notes = null; },

    /** Call after any mutation that affects both (e.g. moving a note) */
    invalidateAll: () => { cache.folders = null; cache.notes = null; },
};
