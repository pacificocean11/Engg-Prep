const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('fe-handbook-10-6.pdf');

pdf(dataBuffer).then(function(data) {
    let pages = data.text.split('\n\n');
    console.log('Successfully extracted ' + pages.length + ' pages from the NCEES Handbook.');
    
    let code = fs.readFileSync('www/questions.js', 'utf8');
    const arrs = ['OTHER_SUBJECTS', 'MECHANICAL_SUBJECTS', 'CIVIL_SUBJECTS', 'CHEMICAL_SUBJECTS', 'ENVIRONMENTAL_SUBJECTS', 'INDUSTRIAL_SUBJECTS', 'ELECTRICAL_COMPUTER_SUBJECTS', 'QUESTIONS'];

    const regex = new RegExp('const\\s+(' + arrs.join('|') + ')\\s*=', 'g');
    code = code.replace(regex, function(match, p1) {
        return 'exports.' + p1 + ' =';
    });

    fs.writeFileSync('temp_module.js', code);
    const db = require('./temp_module.js');

    let updated = 0;
    const PAGE_OFFSET = 7; // The PDF has 7 unnumbered intro pages
    
    let qs = db.QUESTIONS;
    if (qs && typeof qs === 'object') {
        Object.keys(qs).forEach(subjectKey => {
            let subjectQuestions = qs[subjectKey];
            if (Array.isArray(subjectQuestions)) {
                subjectQuestions.forEach(q => {
                    if (subjectKey === 'math' && q.ncees_reference) {
                        let term = q.ncees_reference.search_term.split(',')[0].trim().toLowerCase();
                        
                        let foundPage = null;
                        for (let i = 30; i < pages.length; i++) {
                            if (pages[i].toLowerCase().includes(term)) {
                                foundPage = (i + 1) - PAGE_OFFSET; 
                                break;
                            }
                        }
                        
                        if (foundPage) {
                            q.ncees_reference.page_number = foundPage;
                            updated++;
                        }
                    }
                });
            }
        });
    }

    let finalString = '';
    arrs.forEach(arrName => {
        finalString += 'const ' + arrName + ' = ' + JSON.stringify(db[arrName], null, 4) + ';\n\n';
    });

    fs.writeFileSync('questions.js', finalString);
    console.log('Successfully injected CORRECTED page numbers into ' + updated + ' Mathematics questions!');
}).catch(function(err) {
    console.log('Error parsing PDF: ', err);
});
