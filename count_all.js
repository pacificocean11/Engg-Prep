const fs = require('fs');

// Read questions.js
const qContent = fs.readFileSync('www/questions.js', 'utf8');
const qMatch = qContent.match(/const\s+QUESTIONS\s*=\s*(\{[\s\S]*?\});/);
let standardCount = 0;
if (qMatch) {
    try {
        const standardQuestions = JSON.parse(qMatch[1]);
        for (let subject in standardQuestions) {
            standardCount += standardQuestions[subject].length;
        }
    } catch (e) {
        console.error("Error parsing standard questions", e);
    }
}

// Read advanced_questions.js
const aqContent = fs.readFileSync('www/advanced_questions.js', 'utf8');
const aqMatch = aqContent.match(/const\s+ADVANCED_QUESTIONS\s*=\s*(\{[\s\S]*?\});/);
let advancedCount = 0;
if (aqMatch) {
    try {
        const advancedQuestions = JSON.parse(aqMatch[1]);
        for (let subject in advancedQuestions) {
            advancedCount += advancedQuestions[subject].length;
        }
    } catch (e) {
        console.error("Error parsing advanced questions", e);
    }
}

console.log(`Standard: ${standardCount}, Advanced: ${advancedCount}, Total: ${standardCount + advancedCount}`);
