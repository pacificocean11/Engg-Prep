const fs = require('fs');
const path = require('path');

const notesPath = path.join(__dirname, 'notes.js');
let rawContent = fs.readFileSync(notesPath, 'utf8');

const prefixMatch = rawContent.match(/^[\s\S]*?const\s+notesData\s*=\s*/);
if (!prefixMatch) {
    console.error("Could not find const notesData in notes.js");
    process.exit(1);
}
const prefix = prefixMatch[0];
let dataStr = rawContent.substring(prefix.length);

let suffixMatch = dataStr.match(/;?\s*(?:module\.exports\s*=\s*notesData;)?\s*(?:if\s*\(\s*typeof\s+window\s*!==\s*'undefined'\s*\)\s*\{\s*window\.notesData\s*=\s*notesData;\s*\}\s*)?$/);
let suffix = suffixMatch ? suffixMatch[0] : '';
if (suffix) {
    dataStr = dataStr.substring(0, dataStr.length - suffix.length);
}

let notesData;
try {
    notesData = JSON.parse(dataStr);
} catch (e) {
    console.error("Error parsing JSON:", e.message);
    process.exit(1);
}

const mechMath = notesData.filter(n => n.discipline === "Mechanical" && n.subject === "Mathematics");
const elecMath = notesData.filter(n => n.discipline === "Electrical and Computer" && n.subject === "Mathematics");

const newElecMath = JSON.parse(JSON.stringify(mechMath)).map(n => {
    n.discipline = "Electrical and Computer";
    return n;
});

const existingKeys = new Set(elecMath.map(n => `${n.chapter}|${n.topic}|${n.subtopic}`));

let addedCount = 0;
for (const n of newElecMath) {
    const key = `${n.chapter}|${n.topic}|${n.subtopic}`;
    if (!existingKeys.has(key)) {
        notesData.push(n);
        existingKeys.add(key);
        addedCount++;
    }
}

console.log(`Added ${addedCount} entries to Electrical and Computer -> Mathematics`);

const newContent = prefix + JSON.stringify(notesData, null, 4) + suffix;
fs.writeFileSync(notesPath, newContent, 'utf8');

const wwwNotesPath = path.join(__dirname, 'www', 'notes.js');
fs.writeFileSync(wwwNotesPath, newContent, 'utf8');

console.log("Updated notes.js in root and www/ directories");
