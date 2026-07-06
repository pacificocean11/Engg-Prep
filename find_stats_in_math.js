const fs = require('fs');
const vm = require('vm');
const path = require('path');

const filePath = path.join(__dirname, 'www', 'questions.js');
let content = fs.readFileSync(filePath, 'utf8');

// Append an export so we can extract QUESTIONS and ADVANCED_QUESTIONS
content += `\n; this.QUESTIONS = typeof QUESTIONS !== 'undefined' ? QUESTIONS : null;`;
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(content, sandbox);

const questionsDict = sandbox.QUESTIONS;

if (!questionsDict || !questionsDict['math']) {
    console.error("Could not find 'math' in QUESTIONS");
    process.exit(1);
}

const mathQuestions = questionsDict['math'];
const statsKeywords = [
    'mean', 'median', 'mode', 'variance', 'standard deviation',
    'permutation', 'combination', 'probability', 'probabilit',
    'set theory', 'venn diagram', 'union', 'intersection'
];

let suspiciousQuestions = [];

mathQuestions.forEach((q, index) => {
    let textToSearch = (q.title + " " + q.question + " " + q.topic).toLowerCase();
    
    // Some basic filtering to reduce false positives for 'mean' and 'set'
    // 'set' is too common (e.g. "set of equations"). Let's check for 'venn diagram' or 'set theory' instead.
    
    let matchedKeywords = [];
    
    for (let kw of statsKeywords) {
        if (textToSearch.includes(kw)) {
            // Further refine false positives
            if (kw === 'mean' && !textToSearch.includes('mean of') && !textToSearch.includes('arithmetic mean') && !textToSearch.includes('sample mean')) {
                 if (!textToSearch.match(/\bmean\b/)) continue;
                 // It could be "what does it mean"
                 if (textToSearch.includes('what does it mean') || textToSearch.includes('mean value theorem')) continue;
            }
            if (kw === 'set') {
                if (!textToSearch.match(/\bset\b/)) continue;
            }
            if (kw === 'union' || kw === 'intersection') {
                 if (!textToSearch.match(new RegExp('\\b' + kw + '\\b'))) continue;
            }
            matchedKeywords.push(kw);
        }
    }
    
    // Also check if ncees_reference points to Probability and Statistics
    let nceesSection = q.ncees_reference ? (q.ncees_reference.section || "") : "";
    if (nceesSection.toLowerCase().includes('probabilit')) {
        matchedKeywords.push('ncees: ' + nceesSection);
    }

    if (matchedKeywords.length > 0) {
        suspiciousQuestions.push({
            index: index,
            topic: q.topic,
            title: q.title,
            question: q.question,
            matches: matchedKeywords.join(', ')
        });
    }
});

console.log(JSON.stringify(suspiciousQuestions, null, 2));
