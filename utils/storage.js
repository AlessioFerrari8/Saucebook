const STORAGE_KEY = 'fve_drafts';

// chrome + firefox
const ext = typeof browser !== 'undefined' ? browser : chrome;

/**
 * Saves the user vote in LocalStorage
 * @param {*} projectId - the id of the project
 * @param {*} ratings - votes for the 4 categories
 * @param {*} notes - user notes
 * @returns {Promive<void>}
 */
async function saveDraft(projectId, ratings, notes) {
    const existing = await getDrafts();

    // aggiorno
    existing[projectId] = {
        ratings,
        notes,
        savedAt: new Date().toISOString(),
        projectId
    };
    await ext.storage.local.set({ [STORAGE_KEY] : existing })
}

// prende singolo draft
async function getDraft(projectId) {
    const drafts = await getDrafts()
    return drafts[projectId] || null;
}

// prendo drats e ritorno oggetto o {}, per costruirlo in seguito con saveDraft
async function getDrafts() {
    const result = await ext.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || {};
}

async function deleteDraft(projectId) {
    const drafts = await getDrafts();
    delete drafts[projectId];
    await ext.storage.local.set({ [STORAGE_KEY] : drafts })
}