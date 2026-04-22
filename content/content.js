// INIT -> DOM pronto e trovo pagina voto
function isVotePage() {
    return document.querySelector('.vote-form') !== null;
}

if (isVotePage()) {
    enhanceVoteUI();
}



// DOM ehnancer -> sostituisce tutte le stelle con UI interattiva
function enhanceVoteUI() {
    // load dark mode
    chrome.storage.sync.get('darkMode', (result) => {
        const isDarkMode = result.darkMode || false;
        if (isDarkMode) {
            document.body.classList.add('fve-dark-mode')
        }
    })

    // 4 categorie
    const categories = document.querySelectorAll('[data-controller="vote-category"]')
    
    // chiamo l'ai suggester
    const projectText = document.body.innerText; 
    const suggestions = suggestScores(projectText);


    categories.forEach(category => {
        const header = category.querySelector('.vote-category__header').textContent.trim();
        const scoreEl = category.querySelector('.vote-category__score')
        const footer = category.querySelector('.vote-category__footer').textContent.trim();
        console.log('Found category:', header, footer); // test

        // per ogni categoria chiamo l'imrpove delle star
        enhanceStarRating(category, header);
    })

    addExportButton()

    // preview panel
    createPreviewPanel()

    // dopo aver costruito UI
    // carico bozza
    loadDraft()
}

/**
 * loads a draft
 */
async function loadDraft() {
    const projectId = getProjectId()
    // "caso base"
    if (projectId === 'unknown') return;

    const result = await chrome.storage.local.get('fve_drafts')
    const drafts = result['fve_drafts'] || {}
    const draft = drafts[projectId]

    // nessuna bozza
    if (!draft) return;

    // restore
    restoreRatings(draft.ratings)
    restoreFeedback(draft.notes)

    // avviso utente
    showRestoredIndicator()

}


// rimette i rating
function restoreRatings(ratings) {
    if (!ratings) return;

    // 4 campi
    const fieldMap = {
        originality: 'originality_score',
        technicality: 'technical_score',
        usability: 'usability_score',
        storytelling: 'storytelling_score'
    }

    // aggiungo
    Object.entries(fieldMap).forEach(([key, fieldName]) => {
        const value = ratings[key];
        if (!value) return;

        const input = document.querySelector(
            `input[name="vote[${fieldName}]"][value="${value}"]`
        )
        if (input) input.click()
    })
}


// rimette il tsto nella textarea
function restoreFeedback(feedback) {
    if (!feedback) return;

    // 4 campi
    const textarea = document.querySelector('textarea[name="vote[reason]"]')
    if (textarea) textarea.value = feedback;
}



// restore indicator
function showRestoredIndicator() {
    let indicator = document.querySelector('.fve-saved');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'fve-saved';
        document.querySelector('.vote-form').prepend(indicator);
    }
    indicator.textContent = 'Draft restored';
    indicator.style.opacity = '1';
    setTimeout(() => indicator.style.opacity = '0', 3000);
}




function enhanceStarRating(container, category) {
    const originalInput = container.querySelector('input, select');
    const wrapper = document.createElement('div');
    wrapper.className = 'fve-star-wrapper';

    // creo 9 stelle
    for (let i = 1; i < 10; i++) {
        const star = document.createElement('span')
        star.className = 'fve-star'
        star.dataset.value = i;
        star.textContent = '⭐'
        star.addEventListener('click', () => setRating(container, category, i));
        star.addEventListener('mouseenter', () => previewRating(container, i));
        wrapper.appendChild(star);
    }

    // aggiungo label
    // valroe numerico
    const label = document.createElement('span');
    label.className = 'fve-score-label';
    label.textContent = '-';
    wrapper.appendChild(label)

    wrapper.addEventListener('mouseleave', () => {
        const key = category.toLowerCase();
        updateStarDisplay(wrapper, state[key]);
    });


    // AI
    const aiHint = document.createElement('div');
    aiHint.className = 'fve-ai-hint';
    wrapper.appendChild(aiHint);

    container.appendChild(wrapper);
}

const state = { originality: 0, technicality: 0, usability: 0, storytelling: 0 };

function updatePreview() {
    const avg = Object.values(state).reduce((a, b) => a + b, 0) / 4;
    // ancora da creare pannello nel DOM
    //   document.querySelector('.fve-preview-score').textContent =
    //     `Media: ${avg.toFixed(1)}/10`;
    //   document.querySelector('.fve-preview-bar').style.width = `${avg / 9 * 100}%`;
    console.log('Actual average:', avg.toFixed(1)); // test per ora
}

// campi radio
// vote[originality_score]
// vote[technical_score]
// vote[usability_score]
// vote[storytelling_score]

// document.querySelector('textarea[name="vote[reason]"]')
// uso
// getSelectedScore('originality_score')
// getSelectedScore('technical_score')
// getSelectedScore('usability_score')
// getSelectedScore('storytelling_score')


// lettura voti
function getSelectedScore(fieldName) {
    const checked = document.querySelector(`input[name="vote[${fieldName}]"]:checked`)
    return checked ? parseInt(checked.value) : null;
}


// raccolta dati
function collectVoteData() {
    return {
        originality: getSelectedScore('originality_score'),
        technicality: getSelectedScore('technical_score'),
        usability: getSelectedScore('usability_score'),
        storytelling: getSelectedScore('storytelling_score'),
        feedback: document.querySelector('textarea[name="vote[reason]"]')?.value || ''
    }
}


// TODO: da rivedere
function getProjectId() {
    try {
        const tokenInput = document.querySelector('input[name="suggestion_token"]');
        if (!tokenInput) return 'unknown';

        // Il token è base64 prima del "--"
        const base64 = tokenInput.value.split('--')[0];
        const decoded = JSON.parse(atob(base64));

        // decoded contiene: { user_id, ship_event_id, ua, expires_at }
        return decoded.ship_event_id.toString();
    } catch (error) {
        console.warn("FVE: impossible reading project ID", error)
        return 'unknown';
    }


}


function showSavedIndicator() {
    let indicator = document.querySelector('.fve-saved');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'fve-saved';
        document.querySelector('.vote-form').prepend(indicator);
    }
    indicator.textContent = '✓ Draft saved';
    indicator.style.opacity = '1';
    setTimeout(() => indicator.style.opacity = '0', 2000);
}


let autoSaveTimer;

function triggerAutoSave() {
    clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(() => {
        const projectId = getProjectId();
        const data = collectVoteData(); // usa collectVoteData che già esiste
        const { feedback, ...ratings } = data;
        saveDraft(projectId, ratings, feedback);
        showSavedIndicator();
    }, 1000);
}

// DRAFT manager -> salvo/carico bozze automaticamente


// AI Suggester 


// export handler

function exportToDrive() {
    chrome.runtime.sendMessage({ type: 'UPLOAD_VOTE', payload: collectVoteData() })
}


function setRating(container, category, value) {
    // aggiorno state con nuovo valore
    const key = category.toLowerCase();
    state[key] = value;

    // radio button originale
    const fieldMap = {
        originality: 'originality_score',
        technicality: 'technical_score',
        usability: 'usability_score',
        storytelling: 'storytelling_score'
    }

    // field con click
    const fieldName = fieldMap[key];
    const input = document.querySelector(
        `input[name="vote[${fieldName}]"][value="${value}"]`
    );
    if (input) input.click();

    // aggiorno stelle
    updateStarDisplay(container, value);

    // salvo e aggiorno preview
    triggerAutoSave();
    updatePreview();
}


// chiamata a hover di una stella
function previewRating(container, value) {
    // coloro temporaneamente le stelle fino al valore su 
    // cui passo con il mouse
    updateStarDisplay(container, value)
}

function updateStarDisplay(container, value) {
    // prendo tutte le stelle
    const stars = container.querySelectorAll('.fve-star')

    // for each epr ogni stella
    stars.forEach(star => {
        if (parseInt(star.dataset.value) <= value) {
            // aggiungo classe 
            star.classList.add('fve-star--active');
        } else {
            star.classList.remove('fve-star--active');
        }
    })
}


function addExportButton() {
    // creo bottone
    const exportBtn = document.createElement('button')
    exportBtn.id = 'fve-export-btn'
    exportBtn.className = 'fve-export-btn'
    exportBtn.textContent = 'Export to Drive'

    // evento click
    exportBtn.addEventListener('click', () => {
        exportToDrive()
    })

    // lo aggiungo vicino al form submit
    const submitBtn = document.querySelector('button')
    if (submitBtn) {
        submitBtn.parentElement.insertBefore(exportBtn, submitBtn)
    }
}