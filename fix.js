const fs = require('fs');
['www/questions.js', 'questions.js'].forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(/\"text\": \"12 kips\",\s*\"is_correct\": false/, '\"text\": \"12 kips\",\n                    \"is_correct\": true');
    fs.writeFileSync(file, content, 'utf8');
    console.log(file + ' updated successfully.');
});
