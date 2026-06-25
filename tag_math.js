const fs = require('fs');
let code = fs.readFileSync('www/questions.js', 'utf8');

const arrs = ['OTHER_SUBJECTS', 'MECHANICAL_SUBJECTS', 'CIVIL_SUBJECTS', 'CHEMICAL_SUBJECTS', 'ENVIRONMENTAL_SUBJECTS', 'INDUSTRIAL_SUBJECTS', 'ELECTRICAL_COMPUTER_SUBJECTS', 'QUESTIONS'];

// Convert constants to CommonJS exports
const regex = new RegExp('const\\s+(' + arrs.join('|') + ')\\s*=', 'g');
code = code.replace(regex, function(match, p1) {
    return 'exports.' + p1 + ' =';
});

fs.writeFileSync('temp_module.js', code);

// Load the module natively
const db = require('./temp_module.js');

let updated = 0;
let mathTagged = 0;

// Update the QUESTIONS object which holds the real data
let qs = db.QUESTIONS;
if (qs && typeof qs === 'object') {
    Object.keys(qs).forEach(subjectKey => {
        let subjectQuestions = qs[subjectKey];
        if (Array.isArray(subjectQuestions)) {
            subjectQuestions.forEach(q => {
                q.ncees_reference = null;
                updated++;
                if (subjectKey === 'math') { // The "Mathematics" subject id is "math"
                    let section = 'Mathematics';
                    let handbookTopic = 'General Math';
                    let search_term = '';
                    
                    let title = (q.title || '').toLowerCase();
                    if (title.includes('geometry') || title.includes('line') || title.includes('conic')) { handbookTopic = 'Analytic Geometry'; search_term = 'Straight Line, Conic Sections'; }
                    else if (title.includes('derivative') || title.includes('integral') || title.includes('calculus')) { handbookTopic = 'Calculus'; search_term = 'Derivatives, Integrals'; }
                    else if (title.includes('root') || title.includes('equation')) { handbookTopic = 'Algebra and Trigonometry'; search_term = 'Roots of Quadratic Equation'; }
                    else if (title.includes('vector') || title.includes('cross product')) { handbookTopic = 'Vectors'; search_term = 'Vector Analysis, Cross Product'; }
                    else if (title.includes('probability') || title.includes('statistics') || title.includes('mean') || title.includes('variance')) { section = 'Engineering Probability and Statistics'; handbookTopic = 'Probability'; search_term = 'Probability Functions'; }
                    else if (title.includes('complex')) { handbookTopic = 'Complex Numbers'; search_term = 'Complex Numbers'; }
                    else if (title.includes('matrix') || title.includes('determinant')) { handbookTopic = 'Matrices'; search_term = 'Matrices, Determinants'; }
                    else if (title.includes('differential')) { handbookTopic = 'Differential Equations'; search_term = 'Differential Equations'; }
                    else { handbookTopic = q.title; search_term = q.title; }
                    
                    q.ncees_reference = {
                        version: '10.6',
                        section: section,
                        topic: handbookTopic,
                        search_term: search_term
                    };
                    mathTagged++;
                }
            });
        }
    });
}

// Reconstruct the file
let finalString = '';
arrs.forEach(arrName => {
    finalString += 'const ' + arrName + ' = ' + JSON.stringify(db[arrName], null, 4) + ';\n\n';
});

fs.writeFileSync('questions.js', finalString);
console.log('Successfully mapped ' + mathTagged + ' Math questions. Total questions parsed: ' + updated);
