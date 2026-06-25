const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('fe-handbook-10-6.pdf');

const SUBJECT_MAPPING = {
    'math': 'Mathematics',
    'stats': 'Engineering Probability and Statistics',
    'ethics': 'Engineering Ethics and Societal Impacts',
    'safety': 'Safety, Health, and Environment',
    'econ': 'Engineering Economics',
    'statics': 'Statics',
    'dynamics': 'Dynamics',
    'mechanics': 'Mechanics of Materials',
    'materials': 'Materials Science',
    'fluids': 'Fluid Mechanics',
    'thermo': 'Thermodynamics',
    'heat-transfer': 'Heat Transfer',
    'circuits': 'Electrical and Computer Engineering',
    'chem-rxn': 'Chemical Engineering',
    'mass-transfer': 'Chemical Engineering',
    'geotech': 'Civil Engineering',
    'structural': 'Civil Engineering',
    'transportation': 'Civil Engineering',
    'water-res': 'Civil Engineering',
    'environmental': 'Environmental Engineering',
    'construction': 'Civil Engineering',
    'surveying': 'Civil Engineering',
    'manufacturing': 'Industrial and Systems Engineering',
    'software': 'Electrical and Computer Engineering',
    'networks': 'Electrical and Computer Engineering'
};

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

    let schemaUpdated = 0;
    let pagesMapped = 0;
    const PAGE_OFFSET = 7;
    
    let qs = db.QUESTIONS;
    if (qs && typeof qs === 'object') {
        Object.keys(qs).forEach(subjectKey => {
            let subjectQuestions = qs[subjectKey];
            if (Array.isArray(subjectQuestions)) {
                subjectQuestions.forEach(q => {
                    // Update Schema if missing
                    if (!q.ncees_reference || !q.ncees_reference.page_number) {
                        let section = SUBJECT_MAPPING[subjectKey] || subjectKey;
                        let handbookTopic = q.topic || q.title || 'General';
                        let search_term = (q.topic || q.title || '').trim().toLowerCase();
                        
                        if (!q.ncees_reference) {
                            q.ncees_reference = {
                                version: '10.6',
                                section: section,
                                topic: handbookTopic,
                                search_term: search_term
                            };
                            schemaUpdated++;
                        } else {
                            search_term = q.ncees_reference.search_term.toLowerCase();
                        }

                        // Map Page Number
                        if (search_term.length > 3) {
                            let foundPage = null;
                            for (let i = 25; i < pages.length; i++) {
                                if (pages[i].toLowerCase().includes(search_term)) {
                                    foundPage = (i + 1) - PAGE_OFFSET; 
                                    break;
                                }
                            }
                            if (foundPage) {
                                q.ncees_reference.page_number = foundPage;
                                pagesMapped++;
                            }
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
    console.log('Schema attached to ' + schemaUpdated + ' questions. Successfully mapped exact page numbers for ' + pagesMapped + ' questions!');
}).catch(function(err) {
    console.log('Error parsing PDF: ', err);
});
