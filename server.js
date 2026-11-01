const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const PORT = 8000;
const ROOT = __dirname;

// Load local .env if present
try {
    const envFile = path.join(ROOT, '.env');
    if (fs.existsSync(envFile)) {
        const lines = fs.readFileSync(envFile, 'utf8').split(/\r?\n/);
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const idx = trimmed.indexOf('=');
                if (idx !== -1) {
                    const k = trimmed.slice(0, idx).trim();
                    const v = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
                    if (!process.env[k]) process.env[k] = v;
                }
            }
        }
    }
} catch (e) {
    console.warn('⚠️ Notice: Could not read .env file:', e.message);
}

/**
 * Intelligent rule-based evaluation engine.
 * Acts as an instant, zero-latency diagnostic engine or fallback when Gemini key is not configured.
 */
function generateHeuristicAudit(payload) {
    const {
        username = 'Candidate',
        discipline = 'Mechanical',
        streakDays = 0,
        totalQuestions = 0,
        totalCorrect = 0,
        weaknesses = [],
        srsDueCount = 0,
        recentScores = []
    } = payload;

    const accuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    // Filter and compute error rates
    const analyzed = (weaknesses || [])
        .filter(w => (w.total || 0) > 0)
        .map(w => ({
            subject: w.subject || w.subjectId || 'Core Engineering',
            topic: w.topic || 'General',
            wrong: Number(w.wrong) || 0,
            total: Number(w.total) || 0,
            errorRate: Math.round(((Number(w.wrong) || 0) / (Number(w.total) || 1)) * 100)
        }))
        .sort((a, b) => b.errorRate - a.errorRate || b.total - a.total);

    const worstTopics = analyzed.slice(0, 4);
    const strongTopics = analyzed.filter(w => w.errorRate <= 30 && w.total >= 3);
    const comfortTopic = strongTopics[0] || { topic: 'Introductory Concepts', total: 0, errorRate: 0 };
    const fatalTopic = worstTopics[0] || { topic: 'Core Engineering Systems', total: 0, errorRate: 75 };

    // Pass probability calculation (scaled to FE NCEES 70% threshold)
    let passProb = 30;
    if (totalQuestions < 15) {
        passProb = Math.max(12, Math.min(38, accuracy));
    } else {
        const severePenalty = (worstTopics[0] && worstTopics[0].errorRate >= 60) ? 14 : 0;
        const streakBonus = Math.min(8, Math.floor(streakDays / 2));
        const srsPenalty = srsDueCount > 15 ? 8 : (srsDueCount > 5 ? 4 : 0);
        passProb = Math.min(94, Math.max(10, Math.round((accuracy * 0.90) - severePenalty + streakBonus - srsPenalty)));
    }

    let readinessStatus = "Dangerously Unprepared";
    let statusClass = "text-rose-500";
    if (passProb >= 75) {
        readinessStatus = "Exam Ready";
        statusClass = "text-emerald-500";
    } else if (passProb >= 60) {
        readinessStatus = "Borderline Pass";
        statusClass = "text-amber-500";
    } else if (passProb >= 42) {
        readinessStatus = "False Confidence Alert";
        statusClass = "text-orange-500";
    }

    // 1. Executive Verdict Deep Dive
    let bluntSummary = "";
    if (totalQuestions < 20) {
        bluntSummary = `You have only solved ${totalQuestions} questions. You cannot assess readiness on guesswork. Sit down, open the FE Reference Handbook, and complete a full diagnostic run.`;
    } else if (accuracy < 60) {
        bluntSummary = `Your aggregate accuracy is ${accuracy}%. In the actual NCEES scoring framework, this is a decisive fail. You are guessing on equations and not verifying units or boundary conditions.`;
    } else if (accuracy < 72) {
        bluntSummary = `At ${accuracy}% accuracy, you are on the borderline. One difficult section or pacing miscalculation on exam morning will drop your scaled score below the passing line.`;
    } else {
        bluntSummary = `Strong ${accuracy}% accuracy baseline. Your danger now is mental fatigue and time management across the 5-hour, 20-minute marathon.`;
    }

    const scaledScoreAnalysis = `The NCEES FE exam does not use a simple raw percentage. It uses an item-response theory psychometric scale where passing roughly correlates to earning ~68% to 70% of available points across 110 questions. With an aggregate accuracy of ${accuracy}% and an estimated pass probability of ${passProb}%, you are currently ${passProb >= 70 ? 'exceeding' : 'falling dangerously short of'} this threshold. More importantly, 10 of the 110 items are unscored experimental questions designed to test your mental stamina—if you burn 8 minutes trying to solve an experimental question in your weak areas, you lose the opportunity to pick up free points in later chapters.`;

    const examEnduranceAnalysis = `The FE Exam is a cognitive marathon consisting of two 55-question sections separated by a single 25-minute break. In the morning breadth session, speed is everything (target: 2 minutes 30 seconds per question). In the afternoon depth session, problems are multi-step and fatigue sets in. Without timed block conditioning, your error rate will spike by an estimated 18% to 25% between hour 3 and hour 5.`;

    // 2. Habit & Momentum Forensic Audit
    let dailyVolume = "0.0";
    if (payload.dailyVolume && !isNaN(parseFloat(payload.dailyVolume))) {
        dailyVolume = parseFloat(payload.dailyVolume).toFixed(1);
    } else {
        const activeDays = Math.max(1, payload.activeDays || (streakDays > 1 ? streakDays : 14));
        const rawVol = totalQuestions / activeDays;
        dailyVolume = (streakDays <= 1 && rawVol > 35) ? (Math.min(25, Math.round(totalQuestions / 14))).toFixed(1) : rawVol.toFixed(1);
    }

    const volNum = parseFloat(dailyVolume) || 0;
    let streakVerdict = "";
    let vanityIndex = "Moderate";
    let consistencyScore = 5;

    if (streakDays === 0) {
        streakVerdict = "0 active days logged. Inconsistent studying is the single biggest predictor of failing the FE exam. Formula intuition deteriorates rapidly without daily practice.";
        vanityIndex = "High (Non-existent Habit Loop)";
        consistencyScore = 2;
    } else if (streakDays > 0 && volNum < 4) {
        streakVerdict = `You have a ${streakDays}-day streak, but your practice velocity is only ${dailyVolume} questions per day. This is a cosmetic vanity streak meant to feel productive without enduring the real exam stress.`;
        vanityIndex = "Critical (Vanity Streak Detected)";
        consistencyScore = 4;
    } else {
        streakVerdict = `Active ${streakDays}-day momentum with a healthy volume of ${dailyVolume} questions per day. Maintain this tempo, but stop allocating repetitions to mastered chapters.`;
        vanityIndex = "Low (Genuine Cognitive Momentum)";
        consistencyScore = Math.min(10, Math.max(5, Math.round(volNum / 3) + 2));
    }

    const srsBacklogAnalysis = srsDueCount > 0
        ? `You currently have ${srsDueCount} due items in your Spaced Repetition queue that have lapsed past their review window. According to the Ebbinghaus Forgetting Curve, memory retention for complex engineering formulas drops to below 35% within 6 days if not triggered by active recall. Having ${srsDueCount} unreviewed cards means you are actively leaking equations you previously understood.`
        : `Your Spaced Repetition deck is clear. However, formula recall under exam pressure requires instantaneous handbook indexing rather than memorizing isolated equations.`;

    // 3. Cognitive Blind Spots & Comfort-Zone Avoidance
    let comfortZoneAudit = "";
    if (worstTopics.length > 0 && strongTopics.length > 0) {
        comfortZoneAudit = `Avoidance behavior detected: You have completed ${strongTopics[0].total} items in '${strongTopics[0].topic}' (${strongTopics[0].errorRate}% error), while '${worstTopics[0].topic}' sits at a devastating ${worstTopics[0].errorRate}% error rate. On exam day, NCEES will not allow you to pick your favorite topics.`;
    } else if (worstTopics.length > 0) {
        comfortZoneAudit = `Catastrophic vulnerability in '${worstTopics[0].topic}' (${worstTopics[0].errorRate}% error rate). If 5 questions on this topic appear on your afternoon section, your chance of passing is effectively destroyed.`;
    } else {
        comfortZoneAudit = "Sample size too small. Complete at least 25 questions across 3 different topics to reveal your genuine cognitive blind spots.";
    }

    const psychologicalAnalysis = `This is a classic 'Illusion of Competence' bias: Human brains naturally crave the dopamine of high scores. When candidates open practice modules, they unconsciously pick chapters where they feel proficient (e.g. ${comfortTopic.topic}), while dreading and avoiding complex chapters (e.g. ${fatalTopic.topic}). Every hour spent solving questions you already know how to answer yields zero marginal exam improvement. Real preparation is characterized by friction, confusion, and error correction.`;

    const topVulnerabilities = worstTopics.map((w, idx) => ({
        subject: w.subject,
        topic: w.topic,
        errorRate: `${w.errorRate}%`,
        wrong: w.wrong,
        total: w.total,
        verdict: w.errorRate >= 60 ? "Fatal Weakness — Immediate Intervention Required" : "High Risk Area",
        consequenceOnExam: `Appears on both morning & afternoon sections. At ${w.errorRate}% error rate, expected loss is ${(w.errorRate * 0.08).toFixed(1)} to ${(w.errorRate * 0.12).toFixed(1)} raw scaled points.`,
        fixPriority: idx === 0 ? "URGENT (Top Priority)" : (idx === 1 ? "HIGH" : "MEDIUM")
    }));

    // 4. Discipline Diagnostic (NCEES Knowledge Areas)
    const topicReadinessTable = [
        {
            topic: fatalTopic.topic,
            subject: fatalTopic.subject || discipline,
            status: "High Risk",
            statusColor: "text-rose-400 bg-rose-500/10 border-rose-500/20",
            errorRate: `${fatalTopic.errorRate}%`,
            attempts: `${fatalTopic.total || 0} Questions`,
            recommendation: "Quarantine & Handbook Equation Drill"
        },
        ...(worstTopics.slice(1).map(w => ({
            topic: w.topic,
            subject: w.subject,
            status: w.errorRate > 50 ? "Unstable" : "Borderline",
            statusColor: w.errorRate > 50 ? "text-amber-400 bg-amber-500/10 border-amber-500/20" : "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
            errorRate: `${w.errorRate}%`,
            attempts: `${w.total} Questions`,
            recommendation: "Targeted Mini-Exam & Unit Conversion Review"
        }))),
        ...(strongTopics.slice(0, 2).map(s => ({
            topic: s.topic,
            subject: s.subject,
            status: "Proficient",
            statusColor: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
            errorRate: `${s.errorRate}%`,
            attempts: `${s.total} Questions`,
            recommendation: "Maintain with Weekly Spaced Repetition only"
        })))
    ];

    // 5. Strategic Prescription (Emergency 48-Hour & 14-Day Blueprint)
    const emergency48h = [
        {
            stepNumber: 1,
            title: `Quarantine '${fatalTopic.topic}'`,
            duration: "60 Minutes",
            target: "Solve 15 consecutive problems in this specific topic.",
            details: "Do not guess. Open the official NCEES Reference Handbook on split screen. Locate every governing equation before attempting calculations. If an equation takes longer than 45 seconds to locate, bookmark the page."
        },
        {
            stepNumber: 2,
            title: "Spaced Repetition & Formula Recall Flush",
            duration: "30 Minutes",
            target: srsDueCount > 0 ? `Clear all ${srsDueCount} due cards.` : "Review flashcards for top 2 weak chapters.",
            details: "Practice active recall without flipping the card. Write the units of every constant from memory (e.g., dynamic vs. kinematic viscosity, gas constant R vs Ru, shear stress formulas)."
        },
        {
            stepNumber: 3,
            title: "Strict 20-Question Timed Mini-Exam",
            duration: "58 Minutes (2m 54s / question)",
            target: "Complete 20 mixed questions under strict exam conditions.",
            details: "Zero phone usage. No pausing. Flag questions that cannot be formulated within 45 seconds, guess immediately, and return to them only if time permits. Practice pacing discipline."
        }
    ];

    const twoWeekBlueprint = [
        {
            phase: "Phase 1: Days 1 to 4",
            title: "Triage & Bleeding Control",
            focus: "Isolate the top 2 fatal weakness chapters.",
            goal: "Drive error rate from >65% down to under 40% using focused handbook drills."
        },
        {
            phase: "Phase 2: Days 5 to 9",
            title: "Formula Fluency & Handbook Indexing",
            focus: "Zero-latency lookup across all discipline chapters.",
            goal: "Reduce handbook search time to under 30 seconds per problem."
        },
        {
            phase: "Phase 3: Days 10 to 14",
            title: "Stamina & Full-Length Simulation",
            focus: "5-hour timed blocks with scheduled 25-minute break.",
            goal: "Build cognitive endurance and eliminate afternoon session mental fatigue."
        }
    ];

    const handbookTactics = [
        {
            rule: "Ctrl+F is a Trap Without Specific Search Terms",
            explanation: "Searching 'stress' returns over 250 matches. Search specific terms like 'Mohr's circle', 'von Mises', or 'Rankine' to jump directly to the right equation."
        },
        {
            rule: "Master the Unit Conversion Table (Page 1)",
            explanation: "Over 35% of failed calculations on the FE exam result from mixing lbf/lbm, psi/psf, or Celsius/Kelvin. Always verify conversion factors on page 1 of the handbook."
        },
        {
            rule: "The 3-Minute Limit Rule",
            explanation: "With 110 questions in 320 minutes, your average budget is 2.9 minutes per question. If you cannot identify the governing equation within 50 seconds, flag it and move on."
        }
    ];

    return {
        source: "engine",
        discipline,
        // Legacy top-level keys for backward compatibility
        passProbability: passProb,
        readinessStatus,
        statusClass,
        bluntSummary,
        streakVerdict,
        comfortZoneAudit,
        topVulnerabilities,
        tacticalPrescription48h: emergency48h.map(e => `${e.title}: ${e.target}`),

        // Rich Multi-Screen Chapters
        chapters: {
            executiveVerdict: {
                passProbability: passProb,
                readinessStatus,
                bluntSummary,
                scaledScoreAnalysis,
                examEnduranceAnalysis,
                totalQuestions,
                accuracy,
                projectedOutcome: passProb >= 70 ? "On Track for Scaled Pass" : "High Likelihood of Scaled Exam Failure"
            },
            habitAudit: {
                streakDays,
                totalQuestions,
                dailyVolume,
                vanityIndex,
                consistencyScore,
                streakVerdict,
                srsBacklogAnalysis,
                srsDueCount
            },
            blindSpotAnalysis: {
                comfortZoneAudit,
                comfortTopic: comfortTopic.topic,
                comfortErrorRate: `${comfortTopic.errorRate}%`,
                comfortQuestions: comfortTopic.total,
                avoidedTopic: fatalTopic.topic,
                avoidedErrorRate: `${fatalTopic.errorRate}%`,
                avoidedQuestions: fatalTopic.total,
                psychologicalAnalysis,
                topVulnerabilities
            },
            disciplineDiagnostic: {
                discipline,
                topicReadinessTable
            },
            strategicPrescription: {
                emergency48h,
                twoWeekBlueprint,
                handbookTactics,
                pacingTarget: "2 Minutes 54 Seconds / Question"
            }
        }
    };
}

/**
 * Call Gemini REST API for deep, LLM-generated blunt evaluation
 */
async function callGeminiAPI(apiKey, prompt) {
    const payload = {
        contents: [
            {
                parts: [
                    { text: prompt }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.3
        }
    };

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${apiKey}`;
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(15000)
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini API error (HTTP ${response.status}): ${errText}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error('No content returned by Gemini API');
    return JSON.parse(text);
}

/**
 * Main Controller for /api/ai-evaluation
 */
async function handleAIEvaluation(payload, req, res) {
    const apiKey = (process.env.GEMINI_API_KEY || req.headers['x-gemini-api-key'] || payload.apiKey || '').trim();

    // If an API key is available, call Gemini
    if (apiKey) {
        const prompt = `You are an elite, brutally honest FE (Fundamentals of Engineering) exam coach and diagnostician.
Your job is to provide a blunt, realistic reality check of the candidate's exam preparedness. Do not flatter, do not give participation trophies, and do not sugarcoat weaknesses.

Candidate Metrics:
- Discipline: ${payload.discipline || 'Mechanical'}
- Active Streak: ${payload.streakDays || 0} days
- Total Questions Attempted: ${payload.totalQuestions || 0}
- Overall Correct: ${payload.totalCorrect || 0} (${payload.totalQuestions > 0 ? Math.round(((payload.totalCorrect || 0) / payload.totalQuestions) * 100) : 0}% accuracy)
- Weakness & Topic Breakdown: ${JSON.stringify(payload.weaknesses || [])}
- Due Spaced Repetition Items: ${payload.srsDueCount || 0}
- Recent Quiz Scores: ${JSON.stringify(payload.recentScores || [])}

Analyze their data for:
1. False confidence & vanity streaks (e.g. logging daily just to keep a streak without solving enough hard problems).
2. Comfort-zone bias (drilling topics they already know while ignoring severe weaknesses).
3. Realistic NCEES pass probability (scaled where 70% is passing).
4. Uncompromising 48-hour tactical prescription.

You MUST respond strictly with this JSON structure:
{
  "source": "gemini-3.5-flash",
  "discipline": "${payload.discipline || 'Mechanical'}",
  "passProbability": number (0 to 100),
  "readinessStatus": "Dangerously Unprepared" | "False Confidence Alert" | "Borderline Pass" | "Exam Ready",
  "bluntSummary": string (2-3 biting, direct, insightful sentences analyzing their true standing),
  "streakVerdict": string (sharp evaluation of whether their streak represents real mastery or cosmetic effort),
  "comfortZoneAudit": string (names specific topics they are avoiding vs over-practicing),
  "topVulnerabilities": [
    {
      "subject": string,
      "topic": string,
      "errorRate": string,
      "verdict": string
    }
  ],
  "tacticalPrescription48h": [
    string (exact action 1),
    string (exact action 2),
    string (exact action 3)
  ]
}`;

        try {
            const aiResult = await callGeminiAPI(apiKey, prompt);
            const baseline = generateHeuristicAudit(payload);
            const mergedChapters = {
                ...baseline.chapters,
                executiveVerdict: {
                    ...baseline.chapters.executiveVerdict,
                    passProbability: typeof aiResult.passProbability === 'number' ? aiResult.passProbability : baseline.chapters.executiveVerdict.passProbability,
                    readinessStatus: aiResult.readinessStatus || baseline.chapters.executiveVerdict.readinessStatus,
                    bluntSummary: aiResult.bluntSummary || baseline.chapters.executiveVerdict.bluntSummary
                },
                habitAudit: {
                    ...baseline.chapters.habitAudit,
                    streakVerdict: aiResult.streakVerdict || baseline.chapters.habitAudit.streakVerdict
                },
                blindSpotAnalysis: {
                    ...baseline.chapters.blindSpotAnalysis,
                    comfortZoneAudit: aiResult.comfortZoneAudit || baseline.chapters.blindSpotAnalysis.comfortZoneAudit,
                    topVulnerabilities: aiResult.topVulnerabilities || baseline.chapters.blindSpotAnalysis.topVulnerabilities
                }
            };

            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                ...baseline,
                ...aiResult,
                chapters: mergedChapters,
                hasApiKey: true
            }));
            return;
        } catch (err) {
            console.warn('⚠️ Gemini API error, falling back to heuristic engine:', err.message);
            const fallbackResult = generateHeuristicAudit(payload);
            res.writeHead(200, {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            });
            res.end(JSON.stringify({
                ...fallbackResult,
                hasApiKey: true,
                warning: 'Gemini request fell back to local diagnostic engine: ' + err.message
            }));
            return;
        }
    }

    // No API key provided -> Return instant intelligent diagnostic heuristic
    const localResult = generateHeuristicAudit(payload);
    res.writeHead(200, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
    });
    res.end(JSON.stringify({
        ...localResult,
        hasApiKey: false,
        note: 'Generated via built-in diagnostic rule engine. Provide GEMINI_API_KEY in .env or Settings for generative AI analysis.'
    }));
}

function streamDriveVideo(driveId, req, res) {
    const driveUrl = `https://drive.usercontent.google.com/download?id=${driveId}&export=download`;
    const headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    };
    if (req.headers.range) {
        headers['Range'] = req.headers.range;
    }

    const driveReq = https.get(driveUrl, { headers }, driveRes => {
        if (driveRes.statusCode === 302 || driveRes.statusCode === 303 || driveRes.statusCode === 307) {
            const redirectUrl = driveRes.headers.location;
            https.get(redirectUrl, { headers }, redRes => {
                res.writeHead(redRes.statusCode, {
                    'Content-Type': 'video/mp4',
                    'Content-Length': redRes.headers['content-length'] || '',
                    'Content-Range': redRes.headers['content-range'] || '',
                    'Accept-Ranges': 'bytes',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'public, max-age=86400'
                });
                redRes.pipe(res);
            }).on('error', err => {
                res.writeHead(500);
                res.end(err.message);
            });
            return;
        }

        res.writeHead(driveRes.statusCode, {
            'Content-Type': 'video/mp4',
            'Content-Length': driveRes.headers['content-length'] || '',
            'Content-Range': driveRes.headers['content-range'] || '',
            'Accept-Ranges': 'bytes',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=86400'
        });
        driveRes.pipe(res);
    });

    driveReq.on('error', err => {
        res.writeHead(500);
        res.end(err.message);
    });

    req.on('close', () => {
        driveReq.destroy();
    });
}

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm'
};

const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.svg', '.txt']);

const server = http.createServer((req, res) => {
    let rawUrl = (req.url || '/').split('?')[0];
    let decodedUrl = decodeURIComponent(rawUrl);

    // Google Drive video stream proxy endpoint
    if (decodedUrl.startsWith('/api/drive-stream/')) {
        const driveId = decodedUrl.replace('/api/drive-stream/', '').trim();
        streamDriveVideo(driveId, req, res);
        return;
    }

    // AI-Assisted Blunt Performance Evaluation Proxy
    if (decodedUrl === '/api/ai-evaluation' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
            if (body.length > 1e6) req.destroy(); // 1MB limit
        });
        req.on('end', async () => {
            try {
                const payload = JSON.parse(body || '{}');
                await handleAIEvaluation(payload, req, res);
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
                res.end(JSON.stringify({ error: 'Invalid JSON payload: ' + err.message }));
            }
        });
        return;
    }

    // CORS preflight for evaluation endpoint
    if (decodedUrl === '/api/ai-evaluation' && req.method === 'OPTIONS') {
        res.writeHead(204, {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, x-gemini-api-key'
        });
        res.end();
        return;
    }

    let filePath = path.join(ROOT, decodedUrl);

    // Prevent directory traversal
    if (!filePath.startsWith(ROOT)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden');
        return;
    }

    if (filePath.endsWith(path.sep) || (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory())) {
        filePath = path.join(filePath, 'index.html');
    }

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';
        const totalSize = stats.size;
        const range = req.headers.range;

        // Video streaming with byte-range support
        if (range && (ext === '.mp4' || ext === '.webm')) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
            const chunksize = (end - start) + 1;
            const fileStream = fs.createReadStream(filePath, { start, end, highWaterMark: 256 * 1024 });

            res.writeHead(206, {
                'Content-Range': `bytes ${start}-${end}/${totalSize}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': contentType,
            });

            fileStream.pipe(res);
            res.on('close', () => fileStream.destroy());
            fileStream.on('error', () => {
                if (!res.headersSent) res.writeHead(500);
                res.end();
            });
            return;
        }

        // Conditional GET / ETag support for instantaneous reloads
        const etag = `W/"${stats.size.toString(16)}-${stats.mtime.getTime().toString(16)}"`;
        if (req.headers['if-none-match'] === etag) {
            res.writeHead(304, {
                'ETag': etag,
                'Cache-Control': 'no-cache',
            });
            res.end();
            return;
        }

        const acceptEncoding = req.headers['accept-encoding'] || '';
        const canGzip = COMPRESSIBLE.has(ext) && acceptEncoding.includes('gzip');

        const headers = {
            'Content-Type': contentType,
            'Accept-Ranges': 'bytes',
            'ETag': etag,
            'Cache-Control': 'no-cache',
        };

        if (canGzip) {
            headers['Content-Encoding'] = 'gzip';
            res.writeHead(200, headers);

            const fileStream = fs.createReadStream(filePath, { highWaterMark: 256 * 1024 });
            const gzip = zlib.createGzip({ level: 4 }); // Fast compression

            fileStream.pipe(gzip).pipe(res);

            res.on('close', () => {
                fileStream.destroy();
                gzip.destroy();
            });

            fileStream.on('error', () => {
                if (!res.headersSent) res.writeHead(500);
                res.end();
            });
        } else {
            headers['Content-Length'] = totalSize;
            res.writeHead(200, headers);

            const fileStream = fs.createReadStream(filePath, { highWaterMark: 256 * 1024 });
            fileStream.pipe(res);

            res.on('close', () => fileStream.destroy());
            fileStream.on('error', () => {
                if (!res.headersSent) res.writeHead(500);
                res.end();
            });
        }
    });
});

// Configure keep-alive timeouts to prevent socket stalls
server.keepAliveTimeout = 65000;
server.headersTimeout = 66000;

server.listen(PORT, () => {
    console.log(`⚡ Optimized Dev Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop');
});
