const fs = require('fs');
const content = fs.readFileSync('questions.js', 'utf8');
const qMatch = content.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
const questions = JSON.parse(qMatch[1]);

console.log('--- ELECTROMAGNETICS TOPICS ---');
const em = questions['electromagnetics'] || [];
const emTopics = {};
em.forEach((q, i) => {
    emTopics[q.topic] = (emTopics[q.topic]||0)+1;
});
console.log(emTopics);

console.log('--- CONTROL SYSTEMS TOPICS ---');
const cs = questions['control-systems'] || [];
const csTopics = {};
cs.forEach((q, i) => {
    csTopics[q.topic] = (csTopics[q.topic]||0)+1;
});
console.log(csTopics);

console.log('--- COMMUNICATIONS TOPICS ---');
const cm = questions['communications'] || [];
const cmTopics = {};
cm.forEach((q, i) => {
    cmTopics[q.topic] = (cmTopics[q.topic]||0)+1;
});
console.log(cmTopics);
