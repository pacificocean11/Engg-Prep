const fs = require('fs'); 
const content = fs.readFileSync('notes.js', 'utf8'); 
const matches = [...content.matchAll(/\"discipline\":\s*\"Electrical and Computer\",\s*\"subject\":\s*\"([^\"]+)\"/g)]; 
const subjects = new Set(matches.map(m => m[1])); 
console.log(Array.from(subjects));
