const FOLDER_NAME = "Saucebook"

// Ottiene il Client ID dal storage
async function getClientId() {
    const result = await chrome.storage.sync.get('googleClientId')
    const clientId = result.googleClientId
    
    if (!clientId) {
        throw new Error(
            'Google Client ID not configured. Please go to Options and add your Client ID.'
        )
    }
    return clientId
}

// OAuth2 manuale con launchWebAuthFlow
async function getAuthTokenManual() {
    try {
        const clientId = await getClientId()
        
        // Check if token exists and is valid
        const result = await chrome.storage.sync.get('googleAuthToken')
        if (result.googleAuthToken) {
            return result.googleAuthToken
        }
        
        // Redirect URI per estensioni Chrome
        const redirectUri = chrome.identity.getRedirectURL()
        
        // Build auth URL
        const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
        authUrl.searchParams.append('client_id', clientId)
        authUrl.searchParams.append('response_type', 'token')
        authUrl.searchParams.append('scope', 'https://www.googleapis.com/auth/drive.file')
        authUrl.searchParams.append('redirect_uri', redirectUri)
        
        // Usa launchWebAuthFlow
        const redirectedUrl = await chrome.identity.launchWebAuthFlow({
            url: authUrl.toString(),
            interactive: true
        })
        
        // Estrai token dalla redirect URL
        const url = new URL(redirectedUrl)
        const token = url.searchParams.get('access_token')
        
        if (!token) {
            throw new Error('OAuth2 authentication failed')
        }
        
        // Salva token
        await chrome.storage.sync.set({ googleAuthToken: token })
        return token
        
    } catch (error) {
        console.error("Auth error:", error)
        throw error
    }
}

// ottengo token google - versione aggiornata
function getAuthToken() {
    return getAuthTokenManual()
}



/**
 * Creates/finds folder on Drive
 * @returns - the id of the folder
 */
async function ensureFolder() {
    try {
        // controllo se id è già saved
        const { folderId } = await chrome.storage.local.get("folderId")
        if (folderId) return folderId;

        // altrimenti cerca la cartella
        const token = await getAuthToken()
        const query = encodeURIComponent(
            `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
        )

        // res search
        const searchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${query}`,
            { headers: { Authorization: "Bearer " + token } }
        )

        const searchData = await searchRes.json()

        if (searchData.files && searchData.files.length > 0) {
            const id = searchData.files[0].id;
            await chrome.storage.local.set({ folderId: id })
            return id;
        }

        // se non esiste creo
        const createRes = await fetch(
            "https://www.googleapis.com/drive/v3/files",
            {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + token,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: FOLDER_NAME,
                    mimeType: "application/vnd.google-apps.folder",
                }),
            }
        );

        // creo e ritorno id
        const createData = await createRes.json()
        await chrome.storage.local.set({ folderId: createData.id })
        return createData.id;
    } catch (error) {
        console.error('FVE: ensureFolder failed', error)
        throw error;
    }
}

// carico json su drive
async function uploadVoteData(voteData, projectId) {
    try {
        // prendo token e folderID
        const token = await getAuthToken()
        const folderId = await ensureFolder()

        // nome file con timestamp
        const fileName = `vote_${projectId}_${Date.now()}.json`
        const fileContent = JSON.stringify(voteData, null, 2)

        // upload multipart
        const boundary = 'FVE_BOUNDARY'
        const body = [
            `--${boundary}`,
            'Content-Type: application/json',
            '',
            JSON.stringify({ name: fileName, parents: [folderId] }),
            `--${boundary}`,
            'Content-Type: application/json',
            '',
            fileContent,
            `--${boundary}--`
        ].join('\r\n');

        // fetcho come al solito + content-type
        const res = await fetch(
            'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
            {
                method: 'POST',
                headers: {
                    'Authorization': 'Bearer ' + token,
                    'Content-Type': `multipart/related; boundary=${boundary}`
                },
                body
            }
        );

        // res
        const data = await res.json()
        if (!data.id) throw new Error('Upload failed')
        return data.id;
    } catch (error) {
        console.error('FVE: upload failed', error)
        throw error;
    }
}


// si possono exportare per uso in service-worker.js
// usndo: ->  module system: export { getAuthToken, ensureFolder, uploadVoteData };

// Oppure come global functions 
// Basta richiamarle direttamente da service-worker.js