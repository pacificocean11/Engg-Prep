const fs = require('fs');

const discipline = 'Electrical and Computer';
const subject = 'Electronics';
const chapter = 'OPAMP';

const newTopics = [
    {
        discipline: discipline,
        subject: subject,
        chapter: chapter,
        topic: 'Ideal OPAMP Characteristics',
        subtopic: 'Overview',
        content_html: `
<div class="container-fluid">
    <div class="row align-items-start">
        <div class="col col-lg-8">
            <p>An ideal operational amplifier (Op-Amp) simplifies circuit analysis. It possesses the following theoretical characteristics:</p>
            <ul>
                <li><strong>Infinite Input Impedance (\\(Z_{in} = \\infty\\)):</strong> No current flows into the input terminals.</li>
                <li><strong>Infinite Open-Loop Voltage Gain (\\(A_{ol} = \\infty\\)):</strong> Even a microvolt difference between inputs results in saturation.</li>
                <li><strong>Zero Output Impedance (\\(Z_{out} = 0\\)):</strong> It can drive any load without voltage drop.</li>
                <li><strong>Infinite Bandwidth:</strong> It amplifies all frequencies equally.</li>
                <li><strong>Infinite Common-Mode Rejection Ratio (CMRR):</strong> It only amplifies the difference between the two inputs, completely rejecting noise common to both.</li>
            </ul>
            <h5>The Two Golden Rules (with negative feedback)</h5>
            <p>For solving FE Exam circuit problems involving ideal op-amps with negative feedback, always apply these two rules:</p>
            <ol>
                <li><strong>\\(I_+ = I_- = 0\\)</strong> (No current flows into the inverting or non-inverting terminals).</li>
                <li><strong>\\(V_+ = V_-\\)</strong> (The voltage at the inverting terminal equals the voltage at the non-inverting terminal—often called a "virtual short").</li>
            </ol>
        </div>
        <div class="col text-center">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/7d/Amplificatore_operazionale.svg" alt="OPAMP" class="img-fluid mb-2" style="max-width: 250px;">
            <p><small class="text-muted">Standard Op-Amp Symbol</small></p>
        </div>
    </div>
</div>`,
        important: '',
        resources: '',
        images: [],
        local_images: []
    },
    {
        discipline: discipline,
        subject: subject,
        chapter: chapter,
        topic: 'Inverting & Non-Inverting Amplifiers',
        subtopic: 'Overview',
        content_html: `
<div class="container-fluid">
    <p>The two most fundamental op-amp configurations tested on the FE exam.</p>
    <div class="row mt-3">
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-body">
                    <h5 class="card-title text-primary">Inverting Amplifier</h5>
                    <p>The input signal is applied to the inverting terminal (-), resulting in a 180-degree phase shift (a negative gain).</p>
                    <div class="text-center my-3">
                        <button type="button" class="btn btn-light shadow-sm">
                            \\[ V_{out} = -\\left(\\frac{R_f}{R_{in}}\\right) V_{in} \\]
                        </button>
                    </div>
                    <p><strong>Input Impedance:</strong> \\(Z_{in} \\approx R_{in}\\) (Not infinite!).</p>
                </div>
            </div>
        </div>
        <div class="col-md-6">
            <div class="card shadow-sm h-100">
                <div class="card-body">
                    <h5 class="card-title text-success">Non-Inverting Amplifier</h5>
                    <p>The input signal is applied to the non-inverting terminal (+). Output is in phase with the input.</p>
                    <div class="text-center my-3">
                        <button type="button" class="btn btn-light shadow-sm">
                            \\[ V_{out} = \\left(1 + \\frac{R_f}{R_{in}}\\right) V_{in} \\]
                        </button>
                    </div>
                    <p><strong>Input Impedance:</strong> \\(Z_{in} = \\infty\\) (Ideal).</p>
                </div>
            </div>
        </div>
    </div>
    <div class="alert alert-info mt-4" role="alert">
        <strong>Unity Gain Buffer (Voltage Follower):</strong> A non-inverting amplifier where \\(R_f = 0\\) and \\(R_{in} = \\infty\\) (removed). The equation simplifies to <strong>\\(V_{out} = V_{in}\\)</strong>. It is primarily used for impedance matching to prevent a high-impedance source from being loaded down by a low-impedance load.
    </div>
</div>`,
        important: '',
        resources: '',
        images: [],
        local_images: []
    },
    {
        discipline: discipline,
        subject: subject,
        chapter: chapter,
        topic: 'Summing & Difference Amplifiers',
        subtopic: 'Overview',
        content_html: `
<div class="container-fluid">
    <div class="row">
        <div class="col-lg-6">
            <h5 class="text-primary">Summing Amplifier (Inverting)</h5>
            <p>Used to add multiple input voltages together, each scaled by their respective input resistors. Because the inputs connect to the inverting terminal's virtual ground, the branches do not interact with one another.</p>
            <div class="text-center my-3">
                <button class="btn btn-outline-primary shadow-sm w-100">
                    \\[ V_{out} = -R_f \\left( \\frac{V_1}{R_1} + \\frac{V_2}{R_2} + \\dots + \\frac{V_n}{R_n} \\right) \\]
                </button>
            </div>
            <p><small class="text-muted">If all resistors are equal (\\(R_f = R_1 = R_2\\)), then \\(V_{out} = -(V_1 + V_2)\\).</small></p>
        </div>
        <div class="col-lg-6">
            <h5 class="text-danger">Difference Amplifier</h5>
            <p>Amplifies the difference between two input voltages. It utilizes both the inverting and non-inverting inputs simultaneously.</p>
            <p>General equation for balanced resistors (where \\(\\frac{R_f}{R_1} = \\frac{R_g}{R_2}\\)):</p>
            <div class="text-center my-3">
                <button class="btn btn-outline-danger shadow-sm w-100">
                    \\[ V_{out} = \\frac{R_f}{R_1} (V_2 - V_1) \\]
                </button>
            </div>
            <p><small class="text-muted">Where \\(V_1\\) is tied to the inverting input via \\(R_1\\) and \\(V_2\\) is tied to the non-inverting input via \\(R_2\\).</small></p>
        </div>
    </div>
</div>`,
        important: '',
        resources: '',
        images: [],
        local_images: []
    },
    {
        discipline: discipline,
        subject: subject,
        chapter: chapter,
        topic: 'Integrators & Differentiators',
        subtopic: 'Overview',
        content_html: `
<div class="container-fluid">
    <p>By replacing resistors with capacitors in the feedback loop or at the input, op-amps can perform calculus operations on signals.</p>
    
    <div class="row mt-3">
        <div class="col-md-6">
            <h5>1. Ideal Integrator</h5>
            <p><strong>Configuration:</strong> Resistor \\(R\\) at the input, Capacitor \\(C\\) in the feedback loop.</p>
            <p>Produces an output voltage proportional to the integral of the input voltage over time. Often used to convert a square wave into a triangle wave.</p>
            <div class="p-3 bg-light border rounded text-center">
                \\[ V_{out}(t) = -\\frac{1}{RC} \\int_{0}^{t} V_{in}(\\tau) d\\tau + V_{out}(0) \\]
            </div>
            <p class="mt-2 text-muted"><small>In the s-domain (Laplace): \\( V_{out}(s) = -\\frac{1}{RCs} V_{in}(s) \\)</small></p>
        </div>
        
        <div class="col-md-6">
            <h5>2. Ideal Differentiator</h5>
            <p><strong>Configuration:</strong> Capacitor \\(C\\) at the input, Resistor \\(R\\) in the feedback loop.</p>
            <p>Produces an output proportional to the rate of change of the input. Often used to convert a triangle wave into a square wave.</p>
            <div class="p-3 bg-light border rounded text-center">
                \\[ V_{out}(t) = -RC \\frac{d V_{in}(t)}{dt} \\]
            </div>
            <p class="mt-2 text-muted"><small>In the s-domain (Laplace): \\( V_{out}(s) = -RCs V_{in}(s) \\)</small></p>
        </div>
    </div>
</div>`,
        important: '',
        resources: '',
        images: [],
        local_images: []
    }
];

const files = ['notes.js', 'www/notes.js'];

files.forEach(notesFile => {
    let notesData = JSON.parse(fs.readFileSync(notesFile, 'utf8').replace(/^const notesData = /, '').replace(/;\s*$/, ''));
    
    // Remove existing OPAMP chapter from Electrical and Computer > Electronics
    notesData = notesData.filter(x => !(
        x.discipline === discipline &&
        x.subject === subject &&
        x.chapter === chapter
    ));
    
    notesData.push(...newTopics);
    
    fs.writeFileSync(notesFile, `const notesData = ${JSON.stringify(notesData, null, 4)};\n`);
    console.log(`Updated ${notesFile}`);
});

// Update Hierarchy
const hierarchyFile = 'Electrical_and_Computer_notes_hierarchy.json';
const hierarchy = JSON.parse(fs.readFileSync(hierarchyFile, 'utf8'));
const subjectNode = hierarchy.subjects.find(s => s.subject === subject);
if (subjectNode) {
    let chapterNode = subjectNode.chapters.find(c => c.chapter === chapter);
    if (!chapterNode) {
        chapterNode = { chapter: chapter, topics: [] };
        subjectNode.chapters.push(chapterNode);
    }
    // Replace topics
    chapterNode.topics = newTopics.map(t => ({
        topic: t.topic,
        subtopics: ["Overview"]
    }));
    fs.writeFileSync(hierarchyFile, JSON.stringify(hierarchy, null, 4));
    console.log(`Updated ${hierarchyFile}`);
}

console.log("Done");
