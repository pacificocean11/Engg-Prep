const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

const buffer = fs.readFileSync(filePath);
console.log(buffer.slice(0, 10));
