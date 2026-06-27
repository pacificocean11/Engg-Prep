const fs = require('fs');

const appJsPath = 'd:/Engg-Prep/www/app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');

const modules = [
    {
        startMarker: '// ===== GLOBAL DEEP SEARCH =====',
        endMarker: '// ===== INTERACTIVE ONBOARDING FLOW =====',
        file: 'js/global-search.js'
    },
    {
        startMarker: '// ===== INTERACTIVE ONBOARDING FLOW =====',
        endMarker: '// ===== ACHIEVEMENT SHARING LOGIC =====',
        file: 'js/onboarding.js'
    },
    {
        startMarker: '// ===== ACHIEVEMENT SHARING LOGIC =====',
        endMarker: '// ===== NAME EDITOR LOGIC =====',
        file: 'js/achievements.js'
    },
    {
        startMarker: '// ===== NAME EDITOR LOGIC =====',
        endMarker: '// Extracted to js/scratchpad.js',
        file: 'js/name-editor.js'
    }
];

let extracted = 0;

for (const mod of modules) {
    const startIndex = appJs.indexOf(mod.startMarker);
    const endIndex = appJs.indexOf(mod.endMarker);
    
    if (startIndex !== -1 && endIndex !== -1) {
        const content = appJs.substring(startIndex, endIndex).trim();
        // Since we exposed state and functions globally (window.state, window.navigateTo), we can safely use them!
        // But the extracted code just references `state`, not `window.state`.
        // Because they were originally inside a closure, we can just wrap them in an IIFE and define `const state = window.state` at the top!
        const fileContent = `document.addEventListener('DOMContentLoaded', () => {
    const state = window.state;
    // Ensure all window-exported functions are available directly if needed, but JS will look up the prototype chain.
    ${content}
});\n`;
        fs.writeFileSync('d:/Engg-Prep/www/' + mod.file, fileContent);
        appJs = appJs.substring(0, startIndex) + '\n// Extracted to ' + mod.file + '\n\n' + appJs.substring(endIndex);
        extracted++;
    } else {
        console.log("Could not find markers for " + mod.file);
    }
}

fs.writeFileSync(appJsPath, appJs);
console.log('Successfully extracted ' + extracted + ' modules!');
