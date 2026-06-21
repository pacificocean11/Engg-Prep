const fs = require('fs');

const oldQuestionsPath = 'D:\\Engg-Prep\\android\\app\\build\\intermediates\\assets\\debug\\mergeDebugAssets\\public\\questions.js';
const newQuestionsPath = 'd:\\Engg-Prep\\questions.js';

let oldContent = fs.readFileSync(oldQuestionsPath, 'utf8');
let questionsIndex = oldContent.indexOf('const QUESTIONS = {');

if (questionsIndex === -1) {
    console.error("Could not find QUESTIONS in old file!");
    process.exit(1);
}

let subjectsContent = oldContent.substring(0, questionsIndex);

let currentContent = fs.readFileSync(newQuestionsPath, 'utf8');

if (!currentContent.includes('const MECHANICAL_SUBJECTS')) {
    let combined = subjectsContent + currentContent;
    fs.writeFileSync(newQuestionsPath, combined, 'utf8');
    
    // Sync to www and android
    fs.writeFileSync('d:\\Engg-Prep\\www\\questions.js', combined, 'utf8');
    fs.writeFileSync('D:\\Engg-Prep\\android\\app\\src\\main\\assets\\public\\questions.js', combined, 'utf8');
    console.log("Successfully restored SUBJECTS and synced!");
} else {
    console.log("SUBJECTS already present in questions.js");
}
