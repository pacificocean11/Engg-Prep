const fs = require('fs');

const EXCLUSION_LIST = [
    "double integr",
    "eigen",
];

function sanitizeDatabase(filename, varName) {
    let code = fs.readFileSync(filename, 'utf8');
    
    // Convert to CommonJS to safely parse
    const arrs = ['OTHER_SUBJECTS', 'MECHANICAL_SUBJECTS', 'CIVIL_SUBJECTS', 'CHEMICAL_SUBJECTS', 'ENVIRONMENTAL_SUBJECTS', 'INDUSTRIAL_SUBJECTS', 'ELECTRICAL_COMPUTER_SUBJECTS', varName];
    const regex = new RegExp('const\\s+(' + arrs.join('|') + ')\\s*=', 'g');
    let tempCode = code.replace(regex, function(match, p1) {
        return 'exports.' + p1 + ' =';
    });

    let tempFile = 'temp_sanitize_' + varName + '.js';
    fs.writeFileSync(tempFile, tempCode);
    const db = require('./' + tempFile);

    let deletedCount = 0;
    let qs = db[varName];

    if (qs && typeof qs === 'object') {
        Object.keys(qs).forEach(subjectKey => {
            let subjectQuestions = qs[subjectKey];
            if (Array.isArray(subjectQuestions)) {
                let originalLength = subjectQuestions.length;
                
                // Filter out blacklisted questions
                qs[subjectKey] = subjectQuestions.filter(q => {
                    let text = JSON.stringify(q).toLowerCase();
                    let shouldExclude = EXCLUSION_LIST.some(term => text.includes(term.toLowerCase()));
                    
                    if (shouldExclude) {
                        deletedCount++;
                        return false; // Remove it
                    }
                    return true; // Keep it
                });
            }
        });
    }

    // Reconstruct the file string exactly as it was
    let finalString = '';
    arrs.forEach(arrName => {
        if (db[arrName]) {
            finalString += 'const ' + arrName + ' = ' + JSON.stringify(db[arrName], null, 4) + ';\n\n';
        }
    });

    fs.writeFileSync(filename, finalString);
    fs.unlinkSync(tempFile); // Cleanup temp file
    
    return deletedCount;
}

console.log("Starting Database Sanitization...");
let stdDeleted = sanitizeDatabase('questions.js', 'QUESTIONS');
let advDeleted = sanitizeDatabase('advanced_questions.js', 'ADVANCED_QUESTIONS');

console.log(`\nSanitization Complete!`);
console.log(`- Deleted ${stdDeleted} questions from standard database.`);
console.log(`- Deleted ${advDeleted} questions from advanced database.`);
console.log(`- Total Irrelevant Questions Purged: ${stdDeleted + advDeleted}`);
