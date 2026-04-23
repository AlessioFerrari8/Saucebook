document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const tabName = btn.dataset.tab

        // rimuovo active
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'))
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'))

        // aggiungo active al click
        btn.classList.add('active')
        document.getElementById(tabName).classList.add('active')
    })
})


function showToast(message, type = 'info') {
    const toast = document.getElementById('toast')
    toast.textContent = message;
    toast.className = `toast ${type} show`

    // timeout
    setTimeout(() => {
        toast.classList.remove('show')
    }, 3000)
}


async function loadDashboard() {
    const result = await chrome.storage.local.get('fve_drafts')
    const drafts = result['fve_drafts'] || {}

    // numeor bozze
    document.getElementById('stat-drafts').textContent = Object.keys(drafts).length

    // calcola media voti
    let totalScore = 0, count = 0;
    Object.values(drafts).forEach(draft => {
        if (draft.ratings) {
            const avg = Object.values(draft.ratings).reduce((a, b) => a + b, 0) / 4;
            totalScore += avg
            count++
        }
    })

    // calcolo l'average e inserisco in html
    const avgScore = count > 0 ? (totalScore / count).toFixed(1) : '-'
    document.getElementById('stat-average').textContent = avgScore;


    // ultima bozza 
    const latest = Object.values(drafts)[Object.keys(drafts).length - 1]
    const latestDate = latest ? new Date(latest.savedAt).toLocaleDateString() : '-'
    document.getElementById('stat-latest').textContent = latestDate;
}


// carica bozze in storage tab
async function loadDraftsList() {
    const result = await chrome.storage.local.get('fve_drafts')
    const drafts = result['fve_drafts'] || {};
    const list = document.getElementById('drafts-list')

    // se non ce en sono
    if (Object.keys(drafts).length === 0) {
        list.innerHTML = '<p class="empty-state">No drafts saved</p>';
        return
    }

    // mi costruisco 
    list.innerHTML = '';
    Object.entries(drafts).forEach(([id, draft]) => {
        const date = new Date(draft.savedAt).toLocaleString();
        const item = document.createElement('div')
        item.className = 'draft-item'
        item.innerHTML = `
            <span>Project #${id}</span>
            <small>${date}</small>
            <button class="btn-delete-draft" data-id="${id}">Delete</button>
        `;
        list.appendChild(item)
    })

    // Attach delete listeners
    list.querySelectorAll('.btn-delete-draft').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const id = e.target.dataset.id;
            if (!confirm('Delete this draft?')) return;
            
            const result = await chrome.storage.local.get('fve_drafts');
            const drafts = result['fve_drafts'] || {};
            delete drafts[id];
            await chrome.storage.local.set({ 'fve_drafts': drafts });
            
            await loadDraftsList();
            await loadDashboard();
            showToast('Draft deleted', 'success');
        });
    });
}


// chiamo al caricamento della pagina
loadDraftsList()


// export all drafts as JSON
document.getElementById('btn-export').addEventListener('click', async () => {
    // solita procedura
    const result = await chrome.storage.local.get('fve_drafts')
    const drafts = result['fve_drafts'] || {}

    // prendo data, blob e url
    const data = JSON.stringify(drafts, null, 2)
    const blob = new Blob([data], { type: 'application/json'})
    const url = URL.createObjectURL(blob)

    // creo l'elemento
    const a = document.createElement('a')
    a.href = url;
    a.download = `saucebook-backup-${Date.now()}.json`
    a.click()

    URL.revokeObjectURL(url)
    showToast('Backup downloaded', 'success')
})


// delete all drafts
document.getElementById('btn-clear-all').addEventListener('click', async () => {
    // chiedo conferma
    if (!confirm('Delete ALL drafts? This cannot be undone')) return;

    await chrome.storage.local.set({ 'fve_drafts': {} })
    await loadDraftsList()
    await loadDashboard()

    showToast('All drafts deleted', 'success')
})


// drive info
async function loadDriveInfo() {
    const result = await chrome.storage.local.get('folderId')
    const folderId = result['folderId']

    document.getElementById('drive-status').textContent =
        folderId ? 'Connected' : 'Not connected';
    
    document.getElementById('drive-folder-id').textContent =
        folderId || '-';

    // file count placeholder
    document.getElementById('drive-file-count').textContent = '-'
    
}

// chiamo al caricamento
loadDriveInfo()


async function loadAuthStatus() {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
        const status = token ? 'Connected' : 'Not connected';
        document.getElementById('auth-status').textContent = status;
        
        // Mostra connect o disconnect in base allo stato
        document.getElementById('btn-connect').style.display = token ? 'none' : 'inline-block';
        document.getElementById('btn-disconnect').style.display = token ? 'inline-block' : 'none';
        
        document.getElementById('auth-email').textContent = token ? 'logged-in' : '-';
        document.getElementById('auth-since').textContent = '-';
    });
}

// chiamo al caricamento
loadAuthStatus()



// open drive folder
document.getElementById('btn-open-drive').addEventListener('click', async () => {
    // solita procedura
    const result = await chrome.storage.local.get('folderId')
    const folderId = result['folderId']

    // se non è cnnnes
    if (!folderId) {
        showToast('Folder not connected', 'error')
        return;
    }

    // creo
    chrome.tabs.create({
        url: `https://drive.google.com/drive/folders/${folderId}`
    })
})


// reset ref folder
document.getElementById('btn-reset-folder').addEventListener('click', async () => {
    await chrome.storage.local.remove('folderId')
    await loadDriveInfo()
    // messaggio
    showToast('Folder reset', 'success')
})


// disconnect google
document.getElementById('btn-disconnect').addEventListener('click', async () => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
        if (!token) return
        

        fetch(`https://accounts.google.com/o/oauth2/revoke?token=${token}`)
            .finally(() => {
                chrome.identity.removeCachedAuthToken({ token })
                loadAuthStatus()
                showToast('Disconnected', 'success')
            })
    })
})


// Connect Google button handler
document.getElementById('btn-connect').addEventListener('click', async () => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
        if (token) {
            loadAuthStatus();
            showToast('Connected to Google', 'success');
        }
    });
});



// dark mode
const darkModeToggle = document.getElementById('dark-mode-toggle')

// saved preference on init
document.addEventListener('DOMContentLoaded', () => {
    // prendo dark mode e applico modifiche
    chrome.storage.sync.get('darkMode', (result) => {
        const isDarkMode = result.darkMode || false
        darkModeToggle.checked = isDarkMode
        applyDarkMode(isDarkMode)
    })

    // event change
    darkModeToggle.addEventListener('change', (e) => {
        const isDarkMode = e.target.checked;
        chrome.storage.sync.set({ darkMode: isDarkMode })
        applyDarkMode(isDarkMode)
    })


    // dal precedente onInit
    loadDashboard()
})

function applyDarkMode(isDark) {
    if (isDark) {
        document.body.classList.add('dark-mode')
    } else {
        document.body.classList.remove('dark-mode')
    }
}


// ===== GOOGLE CLIENT ID SETUP =====
async function loadClientIdStatus() {
    const result = await chrome.storage.sync.get('googleClientId')
    const clientId = result.googleClientId
    const statusEl = document.getElementById('client-id-status')
    
    if (clientId) {
        document.getElementById('client-id-input').value = clientId
        statusEl.innerHTML = `Client ID configured`
        statusEl.style.color = '#2ecc71'
    } else {
        statusEl.innerHTML = `Client ID not configured`
        statusEl.style.color = '#e74c3c'
    }
}

// Salva Client ID
document.getElementById('btn-save-client-id').addEventListener('click', async () => {
    const clientId = document.getElementById('client-id-input').value.trim()
    
    if (!clientId) {
        showToast('Please enter a Client ID', 'error')
        return
    }
    
    if (!clientId.includes('.apps.googleusercontent.com')) {
        showToast('Invalid Client ID format', 'error')
        return
    }
    
    await chrome.storage.sync.set({ googleClientId: clientId })
    showToast('Client ID saved successfully!', 'success')
    await loadClientIdStatus()
})

// Load at page init
document.addEventListener('DOMContentLoaded', () => {
    loadClientIdStatus()
})

