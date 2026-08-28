const fs = require('fs');
const path = 'd:\\\\Engg-Prep\\\\questions.js';

let content = fs.readFileSync(path, 'utf8');
let lines = content.split('\n');

const newStr = `const ELECTRICAL_COMPUTER_SUBJECTS = [
    {
        "id": "math",
        "name": "Mathematics",
        "icon": "📐",
        "topics": [
            "Calculus",
            "Linear Algebra",
            "Differential Equations"
        ]
    },
    {
        "id": "stats",
        "name": "Probability and Statistics",
        "icon": "📊",
        "topics": [
            "Probability Distributions",
            "Statistical Inference"
        ]
    },
    {
        "id": "ethics",
        "name": "Ethics and Professional Practice",
        "icon": "🤝",
        "topics": [
            "Codes of Ethics",
            "Public Health, Safety, and Welfare"
        ]
    },
    {
        "id": "econ",
        "name": "Engineering Economics",
        "icon": "💰",
        "topics": [
            "Time Value of Money",
            "Cost Types",
            "Economic Analyses"
        ]
    },
    {
        "id": "elec-materials",
        "name": "Properties of Electrical Materials",
        "icon": "💎",
        "topics": [
            "Semiconductors",
            "Magnetic Materials"
        ]
    },
    {
        "id": "circuits",
        "name": "Circuit Analysis",
        "icon": "🔌",
        "topics": [
            "KCL/KVL",
            "Thevenin/Norton",
            "Phasors"
        ]
    },
    {
        "id": "linear-systems",
        "name": "Linear Systems",
        "icon": "📉",
        "topics": [
            "Frequency Response",
            "Transfer Functions"
        ]
    },
    {
        "id": "signals",
        "name": "Signal Processing",
        "icon": "📶",
        "topics": [
            "Sampling",
            "Digital Filters"
        ]
    },
    {
        "id": "electronics",
        "name": "Electronics",
        "icon": "🔋",
        "topics": [
            "Diodes",
            "Transistors",
            "Op-Amps"
        ]
    },
    {
        "id": "power",
        "name": "Power Systems",
        "icon": "⚡",
        "topics": [
            "Transformers",
            "Motors/Generators",
            "Power Systems"
        ]
    },
    {
        "id": "electromagnetics",
        "name": "Electromagnetics",
        "icon": "🧲",
        "topics": [
            "Maxwell's Equations",
            "Transmission Lines"
        ]
    },
    {
        "id": "control-systems",
        "name": "Control Systems",
        "icon": "🕹️",
        "topics": [
            "Feedback Control",
            "Stability"
        ]
    },
    {
        "id": "communications",
        "name": "Communications",
        "icon": "📡",
        "topics": [
            "Modulation",
            "Noise"
        ]
    },
    {
        "id": "networks",
        "name": "Computer Networks",
        "icon": "🌐",
        "topics": [
            "OSI Model",
            "Routing"
        ]
    },
    {
        "id": "digital-systems",
        "name": "Digital Systems",
        "icon": "🔢",
        "topics": [
            "Logic Gates",
            "FPGAs"
        ]
    },
    {
        "id": "computer-systems",
        "name": "Computer Systems",
        "icon": "🖥️",
        "topics": [
            "Architecture",
            "Operating Systems"
        ]
    },
    {
        "id": "software",
        "name": "Software Engineering",
        "icon": "💻",
        "topics": [
            "Algorithms",
            "Data Structures"
        ]
    }
];`;

let newLines = newStr.split('\n');

// Find the index
let startIdx = lines.findIndex(l => l.includes('const ELECTRICAL_COMPUTER_SUBJECTS = ['));
let endIdx = -1;
for (let i = startIdx; i < lines.length; i++) {
    if (lines[i] === '];' || lines[i] === '];\r') {
        // Next line is `const QUESTIONS = {`
        if(i + 2 < lines.length && lines[i+2].includes('const QUESTIONS = {')) {
            endIdx = i;
            break;
        }
    }
}

if(startIdx !== -1 && endIdx !== -1) {
    let before = lines.slice(0, startIdx);
    let after = lines.slice(endIdx + 1);
    
    // We must handle \r if it was present
    if (lines[startIdx].endsWith('\r')) {
        newLines = newLines.map(l => l + '\r');
    }

    let finalLines = before.concat(newLines, after);
    fs.writeFileSync(path, finalLines.join('\n'), 'utf8');
    console.log('Successfully updated questions.js');
} else {
    console.log('Error: Could not find startIdx or endIdx. startIdx:', startIdx, 'endIdx:', endIdx);
}
