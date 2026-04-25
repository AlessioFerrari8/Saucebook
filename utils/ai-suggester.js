// ai suggester, no api key
// analizzo il testo del progetto e suggerisce punteggio


/**
 * Suggest a score based on some words contained
 * @param {*} projectText - the description of the project
 * @returns - calculated scores
 */
function suggestScores(projectText) {
    const text = projectText.toLowerCase()

    // field
    let scores = {
        originality: 5,
        technicality: 5,
        usability: 5,
        storytelling: 5
    }

    // originality hints
    if (text.includes('novel') || text.includes('unique') || text.includes('first')) {
        scores.originality += 2;
    }
    if (text.includes('inspired by') || text.includes('based on')) {
        scores.originality -= 1;
    }
    
    // technicality hints
    if (text.includes('api') || text.includes('database') || text.includes('algorithm')) {
        scores.technicality += 2;
    }
    if (text.includes('github') || text.includes('repo') || text.includes('code')) {
        scores.technicality += 1;
    }

    // usability hints
    if (text.includes('demo') || text.includes('live') || text.includes('app')) {
        scores.usability += 2;
    }
    if (text.includes('ui') || text.includes('interface') || text.includes('user')) {
        scores.usability += 1;
    }
    
    // storytelling hints
    if (text.includes('passion') || text.includes('journey') || text.includes('story')) {
        scores.storytelling += 2;
    }
    if (text.includes('team') || text.includes('collaboration') || text.includes('together')) {
        scores.storytelling += 1;
    }

    // da 1 a 9
    Object.keys(scores).forEach(key => {
        scores[key] = Math.min(9, Math.max(1, scores[key]))
    })


    return scores;
}