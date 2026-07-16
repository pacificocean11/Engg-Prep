const fs = require('fs');
const content = fs.readFileSync('d:\\Engg-Prep\\www\\questions.js', 'utf8');
const idx = content.indexOf('"$C = ');
if (idx !== -1) {
    for (let i = idx; i < idx + 20; i++) {
        console.log(content[i], content.charCodeAt(i));
    }
}
