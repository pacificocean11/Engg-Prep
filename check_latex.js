const fs = require('fs');
const content = fs.readFileSync('www/questions.js', 'utf8');
const lines = content.split('\n');
let found = 0;
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Quick checks for unescaped latex commands.
    // In questions.js, a correctly escaped latex command should look like \\frac, \\text
    // If it looks like \frac (in source code), it will be 5 chars: \, f, r, a, c.
    // Let's use a regex to look for literal backslash followed by a character, 
    // but not preceded by a backslash.
    
    const unescapedMatch = line.match(/(?<!\\)\\(?!["\\nrt])/g); 
    // This matches a \ that is not preceded by a \ and not followed by ", \, n, r, t
    
    if (unescapedMatch) {
        console.log(`Line ${i+1}: ${line.trim()}`);
        found++;
    } else if (line.includes('\\text') && !line.includes('\\\\text')) {
        // Also check if they explicitly typed \text (since \t is excluded above)
        // If the string contains \text literally (not \\text)
        console.log(`Line ${i+1}: ${line.trim()}`);
        found++;
    } else if (line.includes('\\frac') && !line.includes('\\\\frac')) {
        console.log(`Line ${i+1}: ${line.trim()}`);
        found++;
    }
}
console.log('Total suspicious lines: ' + found);
