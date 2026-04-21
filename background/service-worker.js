chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    switch (msg.type) {
        case 'GET_AUTH_TOKEN':
            getAuthToken().then(sendResponse)
            break;
        case 'UPLOAD_VOTE':
            // o await
            handleVoteUpload(msg.payload).then(sendResponse)
            break;
        case 'GET_ALL_DRAFTS':
            chrome.storage.local.get('fve_drafts')
                .then(result => sendResponse(result['fve_drafts'] || {}))
            break;

        default:
            sendResponse({ error: 'Unknown message type' })
            break;
    }

    // per dire a chrome che risposta è asincrona
    return true
})


function getAuthToken() {
    // ritorno una promise per poi usarla con then nello switch
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                console.error("FVE: auth error", chrome.runtime.lastError);
                reject(chrome.runtime.lastError);
                return;
            }
            resolve(token);
        });
    });
}

const FOLDER_NAME = "Saucebook"

async function ensureFolder() {
    try {
        // Controlla se abbiamo già l'ID salvato
        const { folderId } = await chrome.storage.local.get("folderId");

        if (folderId) {
            return folderId;
        }

        // token auth
        const token = await getAuthToken();

        // cerco cartella su drive
        const query = encodeURIComponent(
            `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
        );

        // Res
        const searchRes = await fetch(
            `https://www.googleapis.com/drive/v3/files?q=${query}`,
            {
                headers: {
                    Authorization: "Bearer " + token,
                },
            }
        );

        const searchData = await searchRes.json();

        // Se esiste, salva ID e ritorna
        if (searchData.files && searchData.files.length > 0) {
            const id = searchData.files[0].id;

            await chrome.storage.local.set({ folderId: id });
            return id;
        }

        // sennò creo
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

        // creo
        const createData = await createRes.json();

        if (!createData.id) {
            throw new Error("Errore nella creazione della cartella");
        }

        // salvo l'id
        await chrome.storage.local.set({ folderId: createData.id });

        // ritorno l'id della cartella creata
        return createData.id;
    } catch (error) {
        console.error('Fve: ensureFolder failed', error)
        throw error;
    }
}


// carico JSON su drive
async function uploadVoteData(voteData, projectId) {
    // prendo dati del voto
    const token = await getAuthToken();
    const folderId = await ensureFolder();

    // nome file
    const fileName = `vote_${projectId}_${Date.now()}.json`

    // content del file
    const fileContent = JSON.stringify(voteData, null, 2);

    // separatore
    const boundary = 'FVE_BOUNDARY'

    // body con le due parti
    // metadata
    // content
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
    ].join('\r\n')

    // carico il file 
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
    )

    // metto in formato json
    const data = await res.json()

    if (!data.id) throw new Error('Upload failed')

    return data.id
}


// carico il file drive-api.js

// funzione chiamata quando arriva UPLOAD_VOTE
async function handleVoteUpload(payload) {
    try {
        const { projectId, ...voteData } = payload;
        
        // Usa le funzioni da drive-api.js
        const fileId = await uploadVoteData(voteData, projectId);
        
        // Salva riferimento
        await chrome.storage.local.set({ [`drive_${projectId}`]: fileId });
        
        return { success: true, fileId };
    } catch (error) {
        console.error('FVE: upload failed', error);
        return { success: false, error: error.message };
    }
}
