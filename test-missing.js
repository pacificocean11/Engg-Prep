const fs = require('fs');
const txt = fs.readFileSync('www/questions.js', 'utf8');

const regex = /"(question_image|solution_image|explanation_image)"\s*:\s*"([^"]*drive\.google\.com[^"]*)"/g;
let match;
let missingCount = 0;

while ((match = regex.exec(txt)) !== null) {
    const fullMatchStr = match[0];
    const startIndex = match.index;
    const substrAfter = txt.substring(startIndex, startIndex + 300);
    if (!substrAfter.includes(`local_${match[1]}`)) {
        missingCount++;
        console.log(`Missing fallback for: ${match[2]}`);
    }
}
console.log(`Total missing: ${missingCount}`);
