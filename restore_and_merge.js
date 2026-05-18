const fs = require('fs');

// 1. Read the new questions from the scripts
const partB = fs.readFileSync('add_elec_core_partB.js', 'utf8');
const partC = fs.readFileSync('add_elec_core_partC.js', 'utf8');
const partD = fs.readFileSync('add_elec_core_partD.js', 'utf8');

// Match arrays robustly by using the assignment line as the end anchor
const elecMatch = partB.match(/const electronicsNew = (\[[\s\S]*?\]);\s*questionsObj\["electronics"\]/);
const emMatch = partC.match(/const electromagneticsNew = (\[[\s\S]*?\]);\s*questionsObj\["electromagnetics"\]/);
const csMatch = partD.match(/const controlSystemsNew = (\[[\s\S]*?\]);\s*questionsObj\["control-systems"\]/);
const commMatch = partD.match(/const communicationsNew = (\[[\s\S]*?\]);\s*questionsObj\["control-systems"\]/);

if (!elecMatch || !emMatch || !csMatch || !commMatch) {
  console.log("Parsing failed!");
  if (!elecMatch) console.log("Failed to match electronicsNew");
  if (!emMatch) console.log("Failed to match electromagneticsNew");
  if (!csMatch) console.log("Failed to match controlSystemsNew");
  if (!commMatch) console.log("Failed to match communicationsNew");
  process.exit(1);
}

const elecNew = eval(elecMatch[1]);
const emNew = eval(emMatch[1]);
const csNew = eval(csMatch[1]);
const commNew = eval(commMatch[1]);

console.log("Successfully parsed new questions:");
console.log(" - Electronics new:", elecNew.length);
console.log(" - Electromagnetics new:", emNew.length);
console.log(" - Control Systems new:", csNew.length);
console.log(" - Communications new:", commNew.length);

// 2. Read the original questions from batch files
const b2 = JSON.parse(fs.readFileSync('scratch/batch2_final.json', 'utf8'));
const b3 = JSON.parse(fs.readFileSync('scratch/batch3_final.json', 'utf8'));

const electronicsOriginal = b2["electronics"];
const electromagneticsOriginal = b2["electromagnetics"];
const controlSystemsOriginal = b2["control-systems"];
const communicationsOriginal = b3["communications"];

console.log("Successfully read original questions:");
console.log(" - Electronics original:", electronicsOriginal.length);
console.log(" - Electromagnetics original:", electromagneticsOriginal.length);
console.log(" - Control Systems original:", controlSystemsOriginal.length);
console.log(" - Communications original:", communicationsOriginal.length);

// 3. Load current questions.js
let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS in questions.js");
  process.exit(1);
}

const questionsObj = JSON.parse(match[1]);

// 4. Merge
questionsObj["electronics"] = [...electronicsOriginal, ...elecNew];
questionsObj["electromagnetics"] = [...electromagneticsOriginal, ...emNew];
questionsObj["control-systems"] = [...controlSystemsOriginal, ...csNew];
questionsObj["communications"] = [...communicationsOriginal, ...commNew];

console.log("Merged counts:");
console.log(" - Electronics total:", questionsObj["electronics"].length);
console.log(" - Electromagnetics total:", questionsObj["electromagnetics"].length);
console.log(" - Control Systems total:", questionsObj["control-systems"].length);
console.log(" - Communications total:", questionsObj["communications"].length);

// 5. Write back to questions.js
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefix = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefix + 'const QUESTIONS = ' + updatedJson + ';', 'utf8');

console.log("Successfully restored and merged all Core Electrical Engineering questions!");
