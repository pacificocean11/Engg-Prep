const fs = require('fs');
const content = fs.readFileSync('questions.js', 'utf8');

const parseArray = (name) => {
  const match = content.match(new RegExp(`const ${name} = (\\[[\\s\\S]*?\\n\\]);`));
  if (!match) return [];
  return eval(match[1]);
};

const disciplines = {
  'Other': parseArray('OTHER_SUBJECTS'),
  'Mechanical': parseArray('MECHANICAL_SUBJECTS'),
  'Civil': parseArray('CIVIL_SUBJECTS'),
  'Chemical': parseArray('CHEMICAL_SUBJECTS'),
  'Environmental': parseArray('ENVIRONMENTAL_SUBJECTS'),
  'Industrial': parseArray('INDUSTRIAL_SUBJECTS'),
  'Electrical & Computer': parseArray('ELECTRICAL_COMPUTER_SUBJECTS')
};

const qMatch = content.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
const questions = JSON.parse(qMatch[1]);

Object.entries(disciplines).forEach(([dName, subjects]) => {
  console.log(`\n========================================`);
  console.log(`Discipline: ${dName}`);
  console.log(`========================================`);
  
  let completeCount = 0;
  let incompleteCount = 0;
  
  subjects.forEach(subject => {
    const qs = questions[subject.id] || [];
    const topics = {};
    qs.forEach(q => { topics[q.topic] = (topics[q.topic]||0)+1; });
    
    let isComplete = true;
    const topicKeys = Object.keys(topics);
    if (topicKeys.length === 0) {
      isComplete = false;
    } else {
      topicKeys.forEach(t => {
        if (topics[t] < 10) isComplete = false;
      });
    }
    
    if (isComplete) {
      completeCount++;
    } else {
      incompleteCount++;
      console.log(`  [INCOMPLETE] ${subject.id} (${subject.name}) - ${qs.length} total qs`);
      Object.entries(topics).sort((a,b)=>a[0].localeCompare(b[0])).forEach(([t,c]) => {
        if (c < 10) {
          console.log(`    - ${t}: ${c} questions (need ${10-c} more)`);
        }
      });
    }
  });
  console.log(`Summary for ${dName}: ${completeCount} subjects complete, ${incompleteCount} subjects incomplete.`);
});
