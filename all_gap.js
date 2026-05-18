const fs = require('fs');
const content = fs.readFileSync('questions.js', 'utf8');

// Parse subjects
const chemMatch = content.match(/const CHEMICAL_SUBJECTS = (\[[\s\S]*?\]);/);
const envMatch = content.match(/const ENVIRONMENTAL_SUBJECTS = (\[[\s\S]*?\]);/);
const indMatch = content.match(/const INDUSTRIAL_SUBJECTS = (\[[\s\S]*?\]);/);
const elecMatch = content.match(/const ELECTRICAL_COMPUTER_SUBJECTS = (\[[\s\S]*?\]);/);

const chemSubjects = eval(chemMatch[1]);
const envSubjects = eval(envMatch[1]);
const indSubjects = eval(indMatch[1]);
const elecSubjects = eval(elecMatch[1]);

const qMatch = content.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
const questions = JSON.parse(qMatch[1]);

function checkDiscipline(name, subjects) {
    console.log(`\n========================================\n=== DISCIPLINE: ${name} ===\n========================================`);
    subjects.forEach(subject => {
        const qs = questions[subject.id] || [];
        const topics = {};
        qs.forEach(q => { topics[q.topic] = (topics[q.topic]||0)+1; });
        console.log(`\n[${subject.id}] ${subject.name} (${qs.length} total)`);
        if (Object.keys(topics).length === 0) {
            console.log('  *** NO QUESTIONS ***');
        } else {
            Object.entries(topics).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([t,c])=>{
                const status = c >= 10 ? '✓' : `NEED ${10-c} MORE`;
                console.log(`  [${c}] ${t} ${status}`);
            });
        }
    });
}

checkDiscipline('Chemical Engineering', chemSubjects);
checkDiscipline('Environmental Engineering', envSubjects);
checkDiscipline('Industrial Engineering', indSubjects);
checkDiscipline('Electrical and Computer Engineering', elecSubjects);
