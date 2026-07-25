const fs = require('fs');
['www/exam_questions.js', 'www/questions.js', 'www/advanced_questions.js'].forEach(file => {
    let p = 'd:/Engg-Prep/' + file;
    if(fs.existsSync(p)){
        let c = fs.readFileSync(p, 'utf8');
        // This removes the duplicate empty key that follows a populated key
        const regex = /("local_(question|explanation|solution)_image"\s*:\s*"[^"\n]+",\s*)"local_\2_image"\s*:\s*"",?\s*/g;
        c = c.replace(regex, '$1');
        fs.writeFileSync(p, c);
    }
});
console.log('Fixed duplicates');
