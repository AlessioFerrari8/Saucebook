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


// dashboard on init
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard()
})

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