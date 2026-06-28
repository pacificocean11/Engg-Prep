const fs = require('fs');

const appJsPath = 'd:/Engg-Prep/www/app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');

const modules = [
    {
        startMarker: '// ===== DIGITAL SCRATCHPAD LOGIC =====',
        endMarker: '// ===== NAME EDITOR LOGIC =====',
        file: 'js/scratchpad.js'
    },
    {
        startMarker: '// --- DYNAMIC BACKGROUND PARTICLE SYSTEM (A-1) ---',
        endMarker: '// --- CONTEXTUAL FORMULA POPUPS (A-5) ---',
        file: 'js/particles.js'
    }
];

if (!fs.existsSync('d:/Engg-Prep/www/js')) {
    fs.mkdirSync('d:/Engg-Prep/www/js');
}

for (const mod of modules) {
    const startIndex = appJs.indexOf(mod.startMarker);
    const endIndex = appJs.indexOf(mod.endMarker);
    if (startIndex !== -1 && endIndex !== -1) {
        const content = appJs.substring(startIndex, endIndex).trim();
        const fileContent = "document.addEventListener('DOMContentLoaded', () => {\n" + content + "\n});\n";
        fs.writeFileSync('d:/Engg-Prep/www/' + mod.file, fileContent);
        appJs = appJs.substring(0, startIndex) + '\n// Extracted to ' + mod.file + '\n\n' + appJs.substring(endIndex);
    }
}

fs.writeFileSync(appJsPath, appJs);
console.log('Successfully extracted modules!');
