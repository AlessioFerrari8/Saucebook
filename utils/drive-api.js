const FOLDER_NAME = "Saucebook"

// ottengo token google
function getAuthToken() {
    // promise
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken( { interactive: true }, (token) => {
            // se c'è un errore
            if (chrome.runtime.lastError) {
                console.error("FVE: auth error", chrome.runtime.lastError)
                reject(chrome.runtime.lastError)
                return;
            }
            // di base
            resolve(token)
        })
    })
}


// crea/trova cartella su drive
async function ensureFolder() {
    try {
        // controllo se id è già saved
        const { folderId } = await chrome.storage.local.get("folderId")
        if (folderId) return folderId;

        // altrimenti cerca la cartella
        const token = await getAuthToken()
        const query = encodeURIComponent(
            `name='${FOLDER_NAME}' application/vnd.google-apps.folder' and trashed=false`
        )

        // res search
        const searchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${query}`,
            { headers: { Authorization: "Bearer" + token } }
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
        const createData = await createRes.JSON()
        await chrome.storage.local.set({ folderid: createData.id })
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