const fs = require('fs');
let count = 0;
['www/exam_questions.js', 'www/questions.js', 'www/advanced_questions.js'].forEach(file => {
    let p = 'd:/Engg-Prep/' + file;
    if(fs.existsSync(p)) {
        let c = fs.readFileSync(p, 'utf8');
        let m = c.match(/"local_(question|explanation|solution)_image"\s*:\s*"assets\/quiz-images\/[^"\n]+"/g);
        if(m) {
            console.log(file + ' has ' + m.length);
            count += m.length;
        }
    }
});
console.log('Total duplicates cleaned: ' + count);
