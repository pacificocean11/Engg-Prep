const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

let content = fs.readFileSync(filePath, 'utf8');

// The exact strings to find and replace
// We use double backslash to match a single backslash in the file text.
const replacements = [
    {
        find: '"text": "$C = \\frac{K_b}{K_b + K_m}$"',
        replace: '"text": "$C = \\\\\\frac{K_b}{K_b + K_m}$"'
    },
    {
        find: '"text": "$C = \\frac{K_m}{K_b + K_m}$"',
        replace: '"text": "$C = \\\\\\frac{K_m}{K_b + K_m}$"'
    },
    {
        find: '"text": "$C = \\frac{K_b}{K_m}$"',
        replace: '"text": "$C = \\\\\\frac{K_b}{K_m}$"'
    },
    {
        find: 'where $C = \\frac{K_b}{K_b + K_m}$',
        replace: 'where $C = \\\\\\frac{K_b}{K_b + K_m}$'
    },
    {
        find: 'increase of $P_b = C \\times P$',
        replace: 'increase of $P_b = C \\\\\\times P$'
    }
];

let modified = false;

for (let r of replacements) {
    if (content.includes(r.find)) {
        content = content.replace(r.find, r.replace);
        modified = true;
        console.log(`Replaced: ${r.find.substring(0, 30)}...`);
    } else {
        console.log(`Could not find: ${r.find.substring(0, 30)}...`);
    }
}

if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated successfully.");
} else {
    console.log("No changes made.");
}
