const fs = require('fs');

const appJsPath = 'd:/Engg-Prep/www/app.js';
let appJs = fs.readFileSync(appJsPath, 'utf8');

// Revert the named function expression bindings
appJs = appJs.replace(/window\.loadQuestion = function loadQuestion\(/g, 'function loadQuestion(');
appJs = appJs.replace(/window\.updateQuestionMap = function updateQuestionMap\(/g, 'function updateQuestionMap(');
appJs = appJs.replace(/window\.startTimer = function startTimer\(/g, 'function startTimer(');
appJs = appJs.replace(/window\.prepareQuestions = function prepareQuestions\(/g, 'function prepareQuestions(');
appJs = appJs.replace(/window\.toDriveImgUrl = function toDriveImgUrl\(/g, 'function toDriveImgUrl(');

// Remove the old export block
const oldExportBlock = `window.state = state;
window.loggedInUser = loggedInUser;
window.getQuestionsSource = getQuestionsSource;
window.getSubjectProgressKey = getSubjectProgressKey;`;

const newExportBlock = `window.state = state;
window.loggedInUser = loggedInUser;
window.getQuestionsSource = getQuestionsSource;
window.getSubjectProgressKey = getSubjectProgressKey;

// Safely export functions so they remain available in the local closure
if (typeof loadQuestion === 'function') window.loadQuestion = loadQuestion;
if (typeof updateQuestionMap === 'function') window.updateQuestionMap = updateQuestionMap;
if (typeof startTimer === 'function') window.startTimer = startTimer;
if (typeof prepareQuestions === 'function') window.prepareQuestions = prepareQuestions;
if (typeof toDriveImgUrl === 'function') window.toDriveImgUrl = toDriveImgUrl;`;

appJs = appJs.replace(oldExportBlock, newExportBlock);

fs.writeFileSync(appJsPath, appJs);
console.log('Fixed function exports!');
