const fs = require('fs');

const particlesPath = 'd:/Engg-Prep/www/js/particles.js';
let content = fs.readFileSync(particlesPath, 'utf8');

// The state block starts with `// Determine the logged-in user first`
const stateStart = content.indexOf('// Determine the logged-in user first');
const stateEnd = content.indexOf('});', stateStart); // The end of the file

if (stateStart === -1) {
    console.log("State block not found in particles.js! Maybe already extracted?");
    process.exit(0);
}

const stateBlock = content.substring(stateStart, stateEnd).trim();

// Keep only the particle logic in particles.js
fs.writeFileSync(particlesPath, content.substring(0, stateStart) + '\n});\n');

// Inject the state block back into app.js
const appJsPath = 'd:/Engg-Prep/www/app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');
appJs = appJs.replace('// Extracted to js/particles.js', '// Extracted to js/particles.js\n\n' + stateBlock + '\n\n// We must expose state globally for the extracted modules to use it.\nwindow.state = state;\nwindow.loggedInUser = loggedInUser;\nwindow.getQuestionsSource = getQuestionsSource;\nwindow.getSubjectProgressKey = getSubjectProgressKey;\n');

// We also need to expose other global functions used by the modules
// navigateTo, loadQuestion, updateQuestionMap, startTimer, prepareQuestions, toDriveImgUrl
appJs = appJs.replace(/function navigateTo\(/g, 'window.navigateTo = function navigateTo(');
appJs = appJs.replace(/function loadQuestion\(/g, 'window.loadQuestion = function loadQuestion(');
appJs = appJs.replace(/function updateQuestionMap\(/g, 'window.updateQuestionMap = function updateQuestionMap(');
appJs = appJs.replace(/function startTimer\(/g, 'window.startTimer = function startTimer(');
appJs = appJs.replace(/function prepareQuestions\(/g, 'window.prepareQuestions = function prepareQuestions(');
appJs = appJs.replace(/function toDriveImgUrl\(/g, 'window.toDriveImgUrl = function toDriveImgUrl(');

fs.writeFileSync(appJsPath, appJs);
console.log('Fixed state extraction and exposed globals!');
