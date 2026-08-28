const fs = require('fs');

// Update notes.js & www/notes.js
const files = ['notes.js', 'www/notes.js'];
let mechItems = [];

files.forEach(notesFile => {
    const content = fs.readFileSync(notesFile, 'utf8');
    const jsonString = content.replace(/^const notesData = /, '').replace(/;\s*$/, '');
    let notesData = JSON.parse(jsonString);

    if (mechItems.length === 0) {
        mechItems = notesData.filter(x => x.discipline === 'Mechanical' && 
                                          x.subject === 'Ethics and Professional Practice' && 
                                          (x.chapter === 'Codes of Ethics' || x.chapter === 'Public Health, Safety and Welfare'));
    }

    // Remove existing civil items for these chapters
    notesData = notesData.filter(x => !(x.discipline === 'Civil' && 
                                        x.subject === 'Ethics and Professional Practice' && 
                                        (x.chapter === 'Codes of Ethics' || x.chapter === 'Public Health, Safety and Welfare')));

    // Add modified mech items
    const newCivilItems = mechItems.map(item => ({ ...item, discipline: 'Civil' }));
    notesData.push(...newCivilItems);

    const output = `const notesData = ${JSON.stringify(notesData, null, 4)};\n`;
    fs.writeFileSync(notesFile, output);
    console.log(`Updated ${notesFile}`);
});

// Update Civil_notes_hierarchy.json
const mechHierarchy = JSON.parse(fs.readFileSync('mechanical_notes_hierarchy.json', 'utf8'));
const mechEthics = mechHierarchy.subjects.find(s => s.subject === 'Ethics and Professional Practice');
const mechChapters = mechEthics.chapters.filter(c => c.chapter === 'Codes of Ethics' || c.chapter === 'Public Health, Safety and Welfare');

const civilHierarchy = JSON.parse(fs.readFileSync('Civil_notes_hierarchy.json', 'utf8'));
const civilEthics = civilHierarchy.subjects.find(s => s.subject === 'Ethics and Professional Practice');
civilEthics.chapters = civilEthics.chapters.filter(c => c.chapter !== 'Codes of Ethics' && c.chapter !== 'Public Health, Safety and Welfare');
civilEthics.chapters.push(...mechChapters);

// Sort chapters alphabetically
civilEthics.chapters.sort((a, b) => a.chapter.localeCompare(b.chapter));

fs.writeFileSync('Civil_notes_hierarchy.json', JSON.stringify(civilHierarchy, null, 4));
console.log('Updated Civil_notes_hierarchy.json');
