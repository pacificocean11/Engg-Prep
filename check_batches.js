const fs = require('fs');

const b1 = JSON.parse(fs.readFileSync('scratch/batch1_final.json', 'utf8'));
const b2 = JSON.parse(fs.readFileSync('scratch/batch2_final.json', 'utf8'));
const b3 = JSON.parse(fs.readFileSync('scratch/batch3_final.json', 'utf8'));

console.log('--- BATCH 1 KEYS ---');
Object.keys(b1).forEach(k => console.log(k, b1[k].length));

console.log('--- BATCH 2 KEYS ---');
Object.keys(b2).forEach(k => console.log(k, b2[k].length));

console.log('--- BATCH 3 KEYS ---');
Object.keys(b3).forEach(k => console.log(k, b3[k].length));
