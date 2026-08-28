const fs = require('fs');

const files = ['notes.js', 'www/notes.js'];

files.forEach(notesFile => {
    console.log("Processing", notesFile);
    const content = fs.readFileSync(notesFile, 'utf8');
    const jsonString = content.replace(/^const notesData = /, '').replace(/;\s*$/, '');
    let notesData = JSON.parse(jsonString);

    const initialLength = notesData.length;
    notesData = notesData.filter(x => {
        if (x.discipline === 'Civil' && x.subject === 'Fluid Mechanics' && 
            (x.chapter === 'Airfoil Theory' || x.chapter === 'Compressible Flow')) {
            return false; // exclude
        }
        return true;
    });
    
    console.log(`Removed ${initialLength - notesData.length} items from ${notesFile}`);

    const output = `const notesData = ${JSON.stringify(notesData, null, 4)};\n`;
    fs.writeFileSync(notesFile, output);
});
console.log("Done");
