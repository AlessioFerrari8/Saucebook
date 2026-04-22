// apertura popup
document.addEventListener('DOMContentLoaded', () => {
    updateDriveLinks();
    checkAuthStatus();
    loadDraftsList();

    // bttone di auth
    document.getElementById('btn-auth').addEventListener('click', () => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (token) showLoggedIn();
        });
    });


    // bottone di logout
    // stesso procedimento sopra
    document.getElementById('btn-logout').addEventListener('click', () => {
        chrome.identity.getAuthToken({ interactive: false }, (token) => {
            if (!token) return;
            // revoco token
            fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
                .finally(() => {
                    chrome.identity.removeCachedAuthToken({ token })
                    showLoggedOut() // mostro logged out
                })
        })

    })

});

async function checkAuthStatus() {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (token) {
            showLoggedIn();
        } else {
            showLoggedOut();
        }
    });
}

function showLoggedIn() {
    // aggiorno la scritta
    document.getElementById('auth-status').textContent = 'Connected to google'
    // setto 1 a hidden e uno lo mostro
    document.getElementById('btn-auth').hidden = true;
    document.getElementById('btn-logout').hidden = false;
}

// stessa logica sopra, solo inversa
function showLoggedOut() {
    // aggiorno la scritta
    document.getElementById('auth-status').textContent = 'Not connected'
    // setto 1 a hidden e uno lo mostro
    document.getElementById('btn-auth').hidden = false;
    document.getElementById('btn-logout').hidden = true;
}


// mostro bozze salvate
async function loadDraftsList() {
    const result = await chrome.storage.local.get('fve_drafts')
    const drafts = result['fve_drafts'] || {};
    const list = document.getElementById('drafts-list');

    list.hidden = false; // Mostra l'elemento

    const keys = Object.keys(drafts)
    if (keys.length === 0) {
        list.textContent = 'No drafts saved'
        return
    }

    // mi costruisco i draft
    list.innerHTML = '';
    keys.forEach(projectId => {
        const draft = drafts[projectId]
        const item = document.createElement('div')
        item.className = 'fve-draft-item'
        item.innerHTML = `
            <span>Project #${projectId}</span>
            <small>${new Date(draft.savedAt).toLocaleString('en-GB')}</small>
            <button data-id="${projectId}" class="btn-delete-draft">␡</button>
        `;
        list.appendChild(item)
    })

    // bottoni elimina
    list.querySelectorAll('.btn-delete-draft').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            await deleteDraftFromPopup(id);
            loadDraftsList()
        })
    })
}

// rimuove una draft
async function deleteDraftFromPopup(projectId) {
    // prendo i vari elementi
    const result = await chrome.storage.local.get('fve_drafts')
    const drafts = result['fve_drafts'] || {}
    // rimuovo
    delete drafts[projectId]
    await chrome.storage.local.set({ 'fve_drafts': drafts })
}

// prendo folderId dallo storage
async function updateDriveLinks() {
    const result = await chrome.storage.local.get('folderId')
    const folderId = result.folderId;

    if (folderId) {
        document.getElementById('link-drive').href =
            `https://drive.google.com/drive/folders/${folderId}`;
    }
}

// link rapidi
document.getElementById('link-notebook').href =
    'https://notebooklm.google.com/';


