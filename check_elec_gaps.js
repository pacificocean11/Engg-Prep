const fs = require('fs');
const content = fs.readFileSync('questions.js', 'utf8');
const match = content.match(/const ELECTRICAL_COMPUTER_SUBJECTS = (\[[\s\S]*?\]);\s*const/);
const elecSubjects = eval(match[1]);
const qMatch = content.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
const questions = JSON.parse(qMatch[1]);

console.log('=== ELECTRICAL & COMPUTER SPECIFIC SUBJECTS GAPS ===');
let grandTotal = 0;
elecSubjects.forEach(subject => {
    const eceSpecific = ['elec-materials', 'circuits', 'linear-systems', 'signals', 'electronics', 'power', 'electromagnetics', 'control-systems', 'communications', 'networks', 'computer-systems', 'software'];
    if (!eceSpecific.includes(subject.id)) return;
    
    const qs = questions[subject.id] || [];
    const topics = {};
    qs.forEach(q => { topics[q.topic] = (topics[q.topic]||0)+1; });
    
    let neededForSubject = 0;
    Object.entries(topics).forEach(([t, c]) => {
        if (c < 10) neededForSubject += (10 - c);
    });
    grandTotal += neededForSubject;
    console.log(`[${subject.id}] ${subject.name}: currently ${qs.length} qs, needs +${neededForSubject} qs`);
    Object.entries(topics).forEach(([t, c]) => {
        if (c < 10) console.log(`  - ${t}: currently ${c}, needs ${10-c} more`);
    });
});
console.log('GRAND TOTAL QUESTIONS NEEDED: ' + grandTotal);
