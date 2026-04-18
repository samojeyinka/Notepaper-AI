/**
 * Simple in-memory cache for workspace data.
 * Data lives for the browser session and is invalidated on mutations.
 */
const cache = {
    folders:       null,
    notes:         null,
    papers:        null,
    presentations: null,
    tickets:       null,
};

export const workspaceCache = {
    getFolders: () => cache.folders ?? null,
    setFolders: (payload) => { cache.folders = { ...payload, fetchedAt: Date.now() }; },
    invalidateFolders: () => { cache.folders = null; },

    getNotes: () => cache.notes ? { data: cache.notes.data, meta: cache.notes.meta } : null,
    setNotes: (data, meta) => { cache.notes = { data, meta, fetchedAt: Date.now() }; },
    invalidateNotes: () => { cache.notes = null; },

    getPapers: () => cache.papers ? { data: cache.papers.data, meta: cache.papers.meta } : null,
    setPapers: (data, meta) => { cache.papers = { data, meta, fetchedAt: Date.now() }; },
    invalidatePapers: () => { cache.papers = null; },

    getPresentations: () => cache.presentations ? { data: cache.presentations.data, meta: cache.presentations.meta } : null,
    setPresentations: (data, meta) => { cache.presentations = { data, meta, fetchedAt: Date.now() }; },
    invalidatePresentations: () => { cache.presentations = null; },

    invalidateAll: () => { cache.folders = null; cache.notes = null; cache.papers = null; cache.presentations = null; },

    getTickets: () => cache.tickets?.data ?? null,
    setTickets: (data) => { cache.tickets = { data, fetchedAt: Date.now() }; },
    invalidateTickets: () => { cache.tickets = null; },
};
