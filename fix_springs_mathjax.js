const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

let content = fs.readFileSync(filePath, 'utf8');
let modified = false;

const target = '"content": "$\\frac{1}{k_{eq}} = \\frac{1}{k_1} + \\frac{1}{k_2} = \\frac{1}{10} + \\frac{1}{15} = \\frac{3 + 2}{30} = \\frac{5}{30} \\rightarrow k_{eq} = 6\\text{ N/mm}$."';
const replace = '"content": "$\\\\\\\\frac{1}{k_{eq}} = \\\\\\\\frac{1}{k_1} + \\\\\\\\frac{1}{k_2} = \\\\\\\\frac{1}{10} + \\\\\\\\frac{1}{15} = \\\\\\\\frac{3 + 2}{30} = \\\\\\\\frac{5}{30} \\\\\\\\rightarrow k_{eq} = 6\\\\\\\\text{ N/mm}$."';

if (content.includes(target)) {
    content = content.replace(target, replace);
    modified = true;
    console.log("Fixed escaping for Series Springs question.");
}

if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("File updated.");
} else {
    console.log("No exact match found. The user might have already used double backslashes or the string differs slightly.");
}
