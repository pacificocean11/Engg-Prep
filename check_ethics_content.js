const fs = require('fs');

const content = fs.readFileSync('notes.js', 'utf8');
const jsonString = content.replace(/^const notesData = /, '').replace(/;\s*$/, '');
const notesData = JSON.parse(jsonString);

let mechEthics = notesData.filter(x => x.discipline === 'Mechanical' && x.subject === 'Ethics and Professional Practice' && (x.chapter === 'Codes of Ethics' || x.chapter === 'Public Health, Safety and Welfare'));
let civilEthics = notesData.filter(x => x.discipline === 'Civil' && x.subject === 'Ethics and Professional Practice' && (x.chapter === 'Codes of Ethics' || x.chapter === 'Public Health, Safety and Welfare'));

console.log("Mechanical Items:", JSON.stringify(mechEthics, null, 2));
console.log("Civil Items:", JSON.stringify(civilEthics, null, 2));
