const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

let content = fs.readFileSync(filePath, 'utf8');
let modified = false;

const replacements = [
    {
        find: '"text": "$T_R = \\\\frac{F d_m}{2} left[ \\\\frac{l + pi mu d_m}{pi d_m - mu l} \\right]$"',
        replace: '"text": "$T_R = \\\\\\\\frac{F d_m}{2} \\\\\\\\left[ \\\\\\\\frac{l + \\\\\\\\pi \\\\\\\\mu d_m}{\\\\\\\\pi d_m - \\\\\\\\mu l} \\\\\\\\right]$"'
    },
    {
        find: '"text": "$T_R = \\\\frac{F d_m}{2} left[ \\\\frac{pi mu d_m - l}{pi d_m + mu l} \\right]$"',
        replace: '"text": "$T_R = \\\\\\\\frac{F d_m}{2} \\\\\\\\left[ \\\\\\\\frac{\\\\\\\\pi \\\\\\\\mu d_m - l}{\\\\\\\\pi d_m + \\\\\\\\mu l} \\\\\\\\right]$"'
    },
    {
        find: '"text": "$T_R = F d_m mu$"',
        replace: '"text": "$T_R = F d_m \\\\\\\\mu$"'
    },
    {
        find: '"text": "$T_R = \\\\frac{F d_m}{2} \\tan lambda$"',
        replace: '"text": "$T_R = \\\\\\\\frac{F d_m}{2} \\\\\\\\tan \\\\\\\\lambda$"'
    }
];

for (let rep of replacements) {
    if (content.includes(rep.find)) {
        content = content.replace(rep.find, rep.replace);
        console.log("Replaced:", rep.find);
        modified = true;
    } else {
        // Fallback for missing backslashes due to string eval in node script 
        // Note: \right and \tan could have been evaluated by JS when creating the JSON if it wasn't escaped
        console.log("Not found:", rep.find);
    }
}

if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated!");
} else {
    console.log("No changes made.");
}
