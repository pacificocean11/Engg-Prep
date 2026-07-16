const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

let content = fs.readFileSync(filePath, 'utf8');
let modified = false;

// We need to match the exact string containing `\\frac`
// Note: in string literals, '\\\\frac' represents `\\frac`.
const target1 = '"text": "$C = \\\\frac{K_b}{K_b + K_m}$"';
const replace1 = '"text": "$C = \\\\\\\\frac{K_b}{K_b + K_m}$"';

const target2 = '"text": "$C = \\\\frac{K_m}{K_b + K_m}$"';
const replace2 = '"text": "$C = \\\\\\\\frac{K_m}{K_b + K_m}$"';

const target3 = '"text": "$C = \\\\frac{K_b}{K_m}$"';
const replace3 = '"text": "$C = \\\\\\\\frac{K_b}{K_m}$"';

const target4 = 'where $C = \\\\frac{K_b}{K_b + K_m}$';
const replace4 = 'where $C = \\\\\\\\frac{K_b}{K_b + K_m}$';

const target5 = 'increase of $P_b = C \\\\times P$';
const replace5 = 'increase of $P_b = C \\\\\\\\times P$';

const replacements = [
    { t: target1, r: replace1 },
    { t: target2, r: replace2 },
    { t: target3, r: replace3 },
    { t: target4, r: replace4 },
    { t: target5, r: replace5 },
];

for (let rep of replacements) {
    if (content.includes(rep.t)) {
        content = content.replace(rep.t, rep.r);
        console.log("Replaced:", rep.t);
        modified = true;
    } else {
        console.log("Not found:", rep.t);
    }
}

if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated!");
} else {
    console.log("No changes made.");
}
