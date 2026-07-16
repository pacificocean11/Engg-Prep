const fs = require('fs');
let content = fs.readFileSync('www/advanced_questions.js', 'utf8');
const regex = /\\\\([^a-zA-Z0-9])/g;
let match;
let count = 0;
while ((match = regex.exec(content)) !== null) {
    let ctx = content.substring(match.index - 30, match.index + 30);
    // Ignore valid double backslashes in JSON like \\n \\r \\t \\" \\\\ \\f \\b
    if (['n', 'r', 't', '"', '\\', 'f', 'b', 'u'].includes(match[1])) continue;
    if (ctx.includes('["')) continue;
    console.log(ctx.replace(/\n/g, ' '));
    count++;
}
console.log('Total:', count);
