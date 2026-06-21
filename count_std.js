const fs = require('fs');

const fileRoot = 'd:\\Engg-Prep\\questions.js';
let content = fs.readFileSync(fileRoot, 'utf8');
const prefix = 'const QUESTIONS = ';
const startIndex = content.indexOf(prefix) + prefix.length;
const endIndex = content.lastIndexOf(';');
let jsonString = content.substring(startIndex, endIndex);
let q = JSON.parse(jsonString);

const disciplines = {
    "General Engineering": ['math', 'stats', 'safety', 'econ', 'ethics', 'modeling', 'comp-tools', 'principles', 'eng-sciences', 'other'],
    "Civil Engineering": ['structural', 'geotech', 'transport', 'water-res', 'water-wastewater', 'construction', 'surveying', 'civil'],
    "Mechanical Engineering": ['thermo', 'fluids', 'heat', 'design', 'solids', 'dynamics', 'statics', 'materials-strength', 'materials-science', 'instr-controls', 'mechanical'],
    "Chemical & Environmental": ['chemistry', 'reaction-eng', 'chem-bio', 'balances', 'mass-sep', 'process-design', 'process-control', 'env-chem', 'fluids-hyd', 'water-hydrology', 'groundwater-soils', 'air-quality', 'waste', 'energy-env', 'chemical', 'environmental'],
    "Industrial & Systems": ['eng-mgmt', 'production', 'supply-chain', 'ergonomics', 'work-design', 'quality', 'systems', 'industrial'],
    "Electrical & Computer": ['circuits', 'elec-materials', 'linear-systems', 'signals', 'electronics', 'power', 'electromagnetics', 'control-systems', 'communications', 'networks', 'digital-systems', 'computer-systems', 'software', 'electrical-computer']
};

console.log("=========================================");
console.log("QUESTIONS DATABASE (STANDARD) - CURRENT STATE");
console.log("=========================================\n");

let civilTotal = 0;
console.log("[CIVIL ENGINEERING]");
disciplines["Civil Engineering"].forEach(sub => {
    let count = q[sub] ? q[sub].length : 0;
    console.log(`  - ${sub}: ${count}`);
    civilTotal += count;
});
console.log(`  >> DISCIPLINE TOTAL: ${civilTotal}`);
console.log(`  >> 40% INCREASE TARGET: ${Math.ceil(civilTotal * 0.4)}`);
