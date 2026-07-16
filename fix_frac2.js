const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

let content = fs.readFileSync(filePath, 'utf8');

// Use regex to replace exact substrings
// $C = \frac  ->  $C = \\frac
let modified = false;

if (content.includes('$C = \\frac')) {
    content = content.replace(/\$C = \\frac/g, '$C = \\\\\\frac');
    modified = true;
    console.log('Replaced $C = \\frac');
}

if (content.includes('C \\times P')) {
    content = content.replace(/C \\times P/g, 'C \\\\\\times P');
    modified = true;
    console.log('Replaced C \\times P');
}

if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated successfully.");
} else {
    console.log("No changes made.");
}
