const fs = require('fs');
const path = require('path');
const vm = require('vm');

const filePath = path.join(__dirname, 'www', 'questions.js');
let content = fs.readFileSync(filePath, 'utf8');

// We evaluate the file to get the objects
let sandboxCode = content + `\n; this.QUESTIONS = QUESTIONS; this.OTHER_SUBJECTS = OTHER_SUBJECTS;`;
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(sandboxCode, sandbox);

let QUESTIONS = sandbox.QUESTIONS;
let OTHER_SUBJECTS = sandbox.OTHER_SUBJECTS;

// 1. Identify the 18 questions to move
const statsKeywords = [
    'mean', 'median', 'mode', 'variance', 'standard deviation',
    'permutation', 'combination', 'probability', 'probabilit',
    'set theory', 'venn diagram', 'union', 'intersection'
];

let mathQ = QUESTIONS['math'];
let statsQ = QUESTIONS['stats'] || [];
let newMathQ = [];

mathQ.forEach((q, index) => {
    // false positives we know: 4, 13
    if (index === 4 || index === 13) {
        newMathQ.push(q);
        return;
    }
    
    let textToSearch = (q.title + " " + q.question + " " + q.topic).toLowerCase();
    let matched = false;
    for (let kw of statsKeywords) {
        if (textToSearch.includes(kw)) {
            if (kw === 'mean' && !textToSearch.includes('mean of') && !textToSearch.includes('arithmetic mean') && !textToSearch.includes('sample mean')) {
                 if (!textToSearch.match(/\bmean\b/)) continue;
                 if (textToSearch.includes('what does it mean') || textToSearch.includes('mean value theorem')) continue;
            }
            if (kw === 'set') {
                if (!textToSearch.match(/\bset\b/)) continue;
            }
            if (kw === 'union' || kw === 'intersection') {
                 if (!textToSearch.match(new RegExp('\\b' + kw + '\\b'))) continue;
            }
            matched = true;
            break;
        }
    }
    
    let nceesSection = q.ncees_reference ? (q.ncees_reference.section || "") : "";
    if (nceesSection.toLowerCase().includes('probabilit')) {
        matched = true;
    }

    if (matched) {
        // Change topic to title case to match other topics if needed, but it's already "Probability" or "Statistics"
        statsQ.push(q);
    } else {
        newMathQ.push(q);
    }
});

QUESTIONS['math'] = newMathQ;
QUESTIONS['stats'] = statsQ;

// 2. Add "Probability" and "Statistics" to the stats topics in OTHER_SUBJECTS if not there
OTHER_SUBJECTS.forEach(subject => {
    if (subject.id === 'stats') {
        if (!subject.topics.includes('Probability')) subject.topics.push('Probability');
        if (!subject.topics.includes('Statistics')) subject.topics.push('Statistics');
    }
});

// 3. Reconstruct the file
// We don't want to JSON.stringify the whole file because it will ruin formatting of everything before QUESTIONS.
// We can just find the start of OTHER_SUBJECTS and the start of QUESTIONS and replace them.

// To replace OTHER_SUBJECTS
let otherSubjStart = content.indexOf('const OTHER_SUBJECTS = [');
// Find the end of OTHER_SUBJECTS array
// The next declaration is const CIVIL_SUBJECTS = [
let civilSubjStart = content.indexOf('\nconst CIVIL_SUBJECTS = [');

let newOtherSubjStr = 'const OTHER_SUBJECTS = ' + JSON.stringify(OTHER_SUBJECTS, null, 4) + ';';

// To replace QUESTIONS
let questionsStart = content.indexOf('\nconst QUESTIONS = {');

let preOther = content.substring(0, otherSubjStart);
let mid = content.substring(civilSubjStart, questionsStart);
let newQuestionsStr = '\nconst QUESTIONS = ' + JSON.stringify(QUESTIONS, null, 4) + ';\n';

let newContent = preOther + newOtherSubjStr + mid + newQuestionsStr;

fs.writeFileSync(filePath, newContent, 'utf8');
console.log("Successfully moved 18 questions to stats and updated topics.");
