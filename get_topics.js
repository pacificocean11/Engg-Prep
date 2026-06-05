const c = require('fs').readFileSync('questions.js', 'utf8');
const m = c.match(/"topic":\s*"([^"]+)"/g);
const s = [...new Set(m)].sort();
s.forEach(x => console.log(x));
