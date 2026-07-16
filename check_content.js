const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

let content = fs.readFileSync(filePath, 'utf8');
let idx = content.indexOf('A bolted joint is clamped');
if (idx !== -1) {
    console.log(content.substring(idx, idx + 1000));
} else {
    console.log("Not found");
}
