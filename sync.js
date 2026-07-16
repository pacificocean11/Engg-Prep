const fs = require('fs');
const path = require('path');
const https = require('https');

const wwwFilePath = path.join(__dirname, 'www', 'questions.js');
let content = fs.readFileSync(wwwFilePath, 'utf8');

// Function to extract ID
function extractId(url) {
    const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (m) return m[1];
    const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (m2) return m2[1];
    return null;
}

// Ensure dir exists
const imgDir = path.join(__dirname, 'www', 'assets', 'quiz-images');
if (!fs.existsSync(imgDir)) {
    fs.mkdirSync(imgDir, { recursive: true });
}

function downloadImage(url, dest) {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            if (res.statusCode === 301 || res.statusCode === 302) {
                return downloadImage(res.headers.location, dest).then(resolve).catch(reject);
            }
            if (res.statusCode !== 200) {
                return reject(new Error(`Status code: ${res.statusCode}`));
            }
            const file = fs.createWriteStream(dest);
            res.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function run() {
    let modified = false;
    let sandboxCode = content + `\n; this.QUESTIONS = QUESTIONS; this.OTHER_SUBJECTS = OTHER_SUBJECTS;`;
    const vm = require('vm');
    const sandbox = {};
    vm.createContext(sandbox);
    try {
        vm.runInContext(sandboxCode, sandbox);
    } catch(e) {
        console.error("Failed to parse file", e);
        return;
    }
    
    let QUESTIONS = sandbox.QUESTIONS;
    
    for (let subject in QUESTIONS) {
        for (let q of QUESTIONS[subject]) {
            for (let field of ['question_image', 'solution_image', 'explanation_image']) {
                if (q[field] && q[field].includes('drive.google.com')) {
                    const id = extractId(q[field]);
                    if (id) {
                        const localField = 'local_' + field;
                        const expectedLocalPath = `assets/quiz-images/img_${id}.jpg`;
                        const absoluteLocalPath = path.join(__dirname, 'www', expectedLocalPath);
                        
                        if (!q[localField] || q[localField] !== expectedLocalPath) {
                            q[localField] = expectedLocalPath;
                            modified = true;
                        }
                        
                        // Check if file exists on disk
                        if (!fs.existsSync(absoluteLocalPath)) {
                            console.log(`Downloading ${id} for ${field}...`);
                            try {
                                const dlUrl = `https://drive.google.com/thumbnail?id=${id}&sz=w1000`;
                                await downloadImage(dlUrl, absoluteLocalPath);
                                console.log(`Saved ${absoluteLocalPath}`);
                            } catch (e) {
                                console.error(`Failed to download ${id}:`, e.message);
                            }
                        }
                    }
                }
            }
        }
    }
    
    if (modified) {
        console.log("Saving changes to www/questions.js...");
        let questionsStart = content.indexOf('\nconst QUESTIONS = {');
        if (questionsStart === -1) questionsStart = content.indexOf('const QUESTIONS = {');
        
        let preQuestions = content.substring(0, questionsStart);
        let newQuestionsStr = '\nconst QUESTIONS = ' + JSON.stringify(QUESTIONS, null, 4) + ';\n';
        
        fs.writeFileSync(wwwFilePath, preQuestions + newQuestionsStr, 'utf8');
        console.log("Updated www/questions.js");
    } else {
        console.log("No new images to link in JSON.");
    }
    
    // Copy file to other locations
    const dests = [
        path.join(__dirname, 'questions.js'),
        path.join(__dirname, 'android', 'app', 'src', 'main', 'assets', 'public', 'questions.js')
    ];
    
    const finalContent = fs.readFileSync(wwwFilePath, 'utf8');
    for (let dest of dests) {
        if (fs.existsSync(path.dirname(dest))) {
            fs.writeFileSync(dest, finalContent, 'utf8');
            console.log(`Copied to ${dest}`);
        }
    }
}

run();
