/**
 * Set ratings for each category
 * @param {*} container - the html container
 * @param {*} category - the category (there are 4)
 * @param {*} value - the value of the vote
 */
function setRating(container, category, value) {
    // aggiorna state golable
    const key = category.toLowerCase()
    state[key] = value;

    // mappa categoria -> field name
    const fieldMap = {
        originality: 'originality_score',
        technicality: 'technical_score',
        usability: 'usability_score',
        storytelling: 'storytelling_score'
    };

    // click radio button
    const fieldName = fieldMap[key];
    const input = document.querySelector(
        `input[name="vote[${fieldName}]"][value="${value}"]`
    )

    if (input) input.click()

    // aggiorna visual stelle
    updateStarDisplay(container, value)
    
    // salvo auto e aggiorna preview
    triggerAutoSave()
    updatePreview()
}

// preview al hover
function previewRating(container, value) {
    updateStarDisplay(container, value)
}

function updateStarDisplay(container, value) {
    const stars = container.querySelectorAll('.fve-star')

    stars.forEach(star => {
        if (parseInt(star.dataset.value) <= value) {
            star.classList.add('fve-star--active');
        } else {
            star.classList.remove('fve-star--active')
        }
    })

    // aggiorna label
    const label = container.querySelector('.fve-score-label')
    if (label) label.textContent = value > 0 ? value : '-';
}


let autoSaveTimer;

// auto save
function triggerAutoSave() {
    clearTimeout(autoSaveTimer);
    // ogni sec
    autoSaveTimer = setTimeout(() => {
        const projectId = getProjectId()
        const data = collectVoteData()

        saveDraft(projectId, data.ratings, data.feedback)
        showSavedIndicator()
    }, 1000);
}

// draft saved indicatore
function showSavedIndicator() {
    let indicator = document.querySelector('.fve-saved')
    if (!indicator) {
        indicator = document.createElement('div')
        indicator.className = 'fve-saved';
        document.querySelector('.vote-form').prepend(indicator)
    }

    indicator.textContent = 'Draft saved';
    indicator.classList.add('show')
    setTimeout(() => indicator.classList.remove('show'), 2000)
}


// aggiorno la preview della media
function updatePreview() {
    // mi calcolo la media
    const avg = Object.values(state).reduce((a, b) => a + b, 0) / 4;

    // aggiorno il testo
    const scoreEl = document.getElementById('fve-preview-text')
    if (scoreEl) {
        scoreEl.textContent = `Avg: ${avg.toFixed(1)}/9`
    }

    // aggiorno barra con %
    const barEl = document.getElementById('fve-preview-bar')
    if (barEl) {
        barEl.style.width = `${(avg / 9 ) * 100}%`
    }
    console.log('Average score:', avg.toFixed(1));
}

// raccoglie tutti i dati del voto
function collectVoteData() {
    return {
        originality: getSelectedScore('originality_score'),
        technicality: getSelectedScore('technical_score'),
        usability: getSelectedScore('usability_score'),
        storytelling: getSelectedScore('storytelling_score'),
        feedback: document.querySelector('textarea[name="vote[reason]"]')?.value || ''
    }
}


// leggo il voto selezionato per un field
function getSelectedScore(field) {
    const checked = document.querySelector(`input[name="vote[${field}]"]`)
    return checked ? parseInt(checked.value) : null;
}


// estraggo project id dal token
function getProjectId() {
    try {
        const tokenInput = document.querySelector('input[name="suggestion_token"]')
        if (!tokenInput) return 'unknown'

        const base64 = tokenInput.value.split('--')
        const decoded = JSON.parse(atob(base64))
        return decoded.ship_event_id.toString()
    } catch (error) {
        console.warn("FVE: impossible reading project id", error)
        return 'unknown';
    }
}


// export handler
function exportToDrive() {
    const data = collectVoteData();
    chrome.runtime.sendMessage({
        type: 'UPLOAD_VOTE',
        payload: {
            projectId: getProjectId(),
            ...data
        }
    }, (response) => {
        if (response.success) {
            showToast('Vote uploaded to Drive!', 'success')
        } else {
            showToast('Upload failed: ' + response.error, 'error')
        }
    })
}


function showToast(message, type) {
    console.log(`[${type}]`, message)
}


function createPreviewPanel() {
    // creo il container
    const previewPanel = document.createElement('div')
    previewPanel.id = 'fve-preview-panel'
    previewPanel.className = 'fve-preview-panel'

    // aggiungo HTML
    previewPanel.innerHTML = `
        <div class="fve-preview-score" id="fve-preview-text">Avg: -/9</div>
        <div class="fve-preview-bar" id="fve-preview-bar"></div>
    `

    // aggiungo al form
    document.querySelector('.vote-form').prepend(previewPanel)
}