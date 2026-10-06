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
    activeSprint:  null,
    sprintsList:   null,
    noteContent:   {},  // { [id]: { data, fetchedAt } }
    paperContent:  {},  // { [id]: { data, fetchedAt } }
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

    getActiveSprint: () => cache.activeSprint ?? null,
    setActiveSprint: (sprint, challenges) => { cache.activeSprint = { sprint, challenges, fetchedAt: Date.now() }; },
    invalidateActiveSprint: () => { cache.activeSprint = null; },

    getSprintsList: () => cache.sprintsList?.data ?? null,
    setSprintsList: (data) => { cache.sprintsList = { data, fetchedAt: Date.now() }; },
    invalidateSprintsList: () => { cache.sprintsList = null; },

    getNoteContent: (id) => {
        const e = cache.noteContent[id];
        if (!e || Date.now() - e.fetchedAt > 60_000) return null;
        return e.data;
    },
    setNoteContent: (id, data) => { cache.noteContent[id] = { data, fetchedAt: Date.now() }; },
    invalidateNoteContent: (id) => { delete cache.noteContent[id]; },

    getPaperContent: (id) => {
        const e = cache.paperContent[id];
        if (!e || Date.now() - e.fetchedAt > 60_000) return null;
        return e.data;
    },
    setPaperContent: (id, data) => { cache.paperContent[id] = { data, fetchedAt: Date.now() }; },
    invalidatePaperContent: (id) => { delete cache.paperContent[id]; },

    invalidateAll: () => { cache.folders = null; cache.notes = null; cache.papers = null; cache.presentations = null; cache.activeSprint = null; cache.sprintsList = null; cache.noteContent = {}; cache.paperContent = {}; },

    getTickets: () => cache.tickets?.data ?? null,
    setTickets: (data) => { cache.tickets = { data, fetchedAt: Date.now() }; },
    invalidateTickets: () => { cache.tickets = null; },
};
