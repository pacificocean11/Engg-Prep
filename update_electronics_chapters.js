const fs = require('fs');

const discipline = 'Electrical and Computer';
const subject = 'Electronics';

const newChapters = {
    'Amplifiers': [
        {
            topic: 'BJT Amplifier Configurations',
            content_html: `
<div class="container-fluid">
    <p>Bipolar Junction Transistors (BJTs) are used to create small-signal amplifiers. The FE exam often tests the characteristics of the three basic configurations.</p>
    <div class="table-responsive">
        <table class="table table-bordered table-striped">
            <thead class="table-primary">
                <tr>
                    <th>Configuration</th>
                    <th>Voltage Gain (\\(A_v\\))</th>
                    <th>Current Gain (\\(A_i\\))</th>
                    <th>Input Impedance (\\(Z_{in}\\))</th>
                    <th>Output Impedance (\\(Z_{out}\\))</th>
                    <th>Phase Shift</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Common Emitter (CE)</strong></td>
                    <td>High</td>
                    <td>High</td>
                    <td>Medium</td>
                    <td>Medium to High</td>
                    <td>180&deg; (Inverting)</td>
                </tr>
                <tr>
                    <td><strong>Common Collector (CC) / Emitter Follower</strong></td>
                    <td>\\(\\approx 1\\) (Unity)</td>
                    <td>High</td>
                    <td>High</td>
                    <td>Low</td>
                    <td>0&deg;</td>
                </tr>
                <tr>
                    <td><strong>Common Base (CB)</strong></td>
                    <td>High</td>
                    <td>\\(\\approx 1\\) (Unity)</td>
                    <td>Low</td>
                    <td>High</td>
                    <td>0&deg;</td>
                </tr>
            </tbody>
        </table>
    </div>
    <div class="alert alert-info">
        <strong>Tip:</strong> The Common Collector (Emitter Follower) is primarily used as a voltage buffer for impedance matching because of its high input impedance and low output impedance.
    </div>
</div>`
        },
        {
            topic: 'MOSFET Amplifier Configurations',
            content_html: `
<div class="container-fluid">
    <p>Metal-Oxide-Semiconductor Field-Effect Transistors (MOSFETs) offer near-infinite input impedance at low frequencies, making them highly desirable for amplifier input stages.</p>
    <ul class="list-group mb-3">
        <li class="list-group-item">
            <h5 class="text-primary">Common Source (CS)</h5>
            Similar to the BJT Common Emitter. Provides high voltage gain and inverts the signal (180&deg; phase shift). Input impedance is practically infinite.
        </li>
        <li class="list-group-item">
            <h5 class="text-success">Common Drain (CD) / Source Follower</h5>
            Similar to the BJT Common Collector. Voltage gain is approximately 1 (non-inverting). Used primarily as a voltage buffer to drive low-impedance loads.
        </li>
        <li class="list-group-item">
            <h5 class="text-danger">Common Gate (CG)</h5>
            Similar to the BJT Common Base. Provides voltage gain but no current gain. Known for excellent high-frequency response.
        </li>
    </ul>
</div>`
        }
    ],
    'Discrete Devices': [
        {
            topic: 'Diodes & Applications',
            content_html: `
<div class="container-fluid">
    <div class="row">
        <div class="col-md-6">
            <h5 class="text-primary">Diode Models</h5>
            <ul>
                <li><strong>Ideal Diode:</strong> Acts as a perfect switch. 0V drop when forward-biased, blocks all current when reverse-biased.</li>
                <li><strong>Practical Diode:</strong> Has a forward voltage drop (\\(V_D \\approx 0.7V\\) for Silicon, \\(0.3V\\) for Germanium).</li>
                <li><strong>Zener Diode:</strong> Designed to operate safely in the reverse breakdown region. Used to maintain a constant voltage (voltage regulation) across a load.</li>
            </ul>
        </div>
        <div class="col-md-6">
            <h5 class="text-success">Rectifiers</h5>
            <p>Convert AC to DC. Important FE equations for average DC voltage (assuming ideal diodes):</p>
            <ul>
                <li><strong>Half-Wave Rectifier:</strong> <br>\\[ V_{dc} = \\frac{V_{peak}}{\\pi} \\]</li>
                <li><strong>Full-Wave Rectifier:</strong> <br>\\[ V_{dc} = \\frac{2 V_{peak}}{\\pi} \\]</li>
            </ul>
        </div>
    </div>
</div>`
        },
        {
            topic: 'BJT & MOSFET Operating Regions',
            content_html: `
<div class="container-fluid">
    <h5 class="text-primary">BJT (Bipolar Junction Transistor)</h5>
    <p>Controlled by base current (\\(I_B\\)).</p>
    <ul>
        <li><strong>Cutoff:</strong> \\(I_B = 0\\), switch is OFF.</li>
        <li><strong>Active (Linear):</strong> Used for amplification. \\(I_C = \\beta I_B\\). The base-emitter junction is forward-biased, base-collector is reverse-biased.</li>
        <li><strong>Saturation:</strong> Switch is fully ON. Both junctions are forward-biased. \\(V_{CE} \\approx 0.2V\\).</li>
    </ul>
    
    <h5 class="text-success mt-4">MOSFET (Metal-Oxide-Semiconductor FET)</h5>
    <p>Controlled by gate-to-source voltage (\\(V_{GS}\\)). No steady-state current flows into the gate.</p>
    <ul>
        <li><strong>Cutoff:</strong> \\(V_{GS} < V_{Threshold}\\). Transistor is OFF.</li>
        <li><strong>Triode (Ohmic/Linear):</strong> Acts as a voltage-controlled resistor. Occurs when \\(V_{DS} < V_{GS} - V_{th}\\).</li>
        <li><strong>Saturation (Active):</strong> Used for amplification. Current \\(I_D\\) is nearly independent of \\(V_{DS}\\). Occurs when \\(V_{DS} \\geq V_{GS} - V_{th}\\).</li>
    </ul>
</div>`
        }
    ],
    'Instrumentation': [
        {
            topic: 'Measurement & Sensors',
            content_html: `
<div class="container-fluid">
    <h5 class="text-primary">Wheatstone Bridge</h5>
    <p>A classic circuit used to measure an unknown electrical resistance by balancing two legs of a bridge circuit. It is heavily tested on the FE exam.</p>
    <div class="text-center my-2 p-3 bg-light border rounded">
        The bridge is balanced (voltage across the middle is zero) when:<br>
        \\[ \\frac{R_1}{R_2} = \\frac{R_3}{R_4} \\]
    </div>
    
    <h5 class="text-success mt-4">Common Sensors</h5>
    <ul>
        <li><strong>Strain Gauges:</strong> Resistance changes with mechanical strain. Often placed in a Wheatstone bridge to measure tiny changes in resistance.</li>
        <li><strong>Thermocouples:</strong> Produces a temperature-dependent voltage as a result of the Seebeck effect (junction of two dissimilar metals).</li>
        <li><strong>RTDs (Resistance Temperature Detectors):</strong> Pure metals (like Platinum) whose resistance increases predictably with temperature.</li>
    </ul>
</div>`
        },
        {
            topic: 'Data Acquisition (ADC & DAC)',
            content_html: `
<div class="container-fluid">
    <div class="row">
        <div class="col-md-6">
            <h5 class="text-primary">Sampling Theorem (Nyquist)</h5>
            <p>To perfectly reconstruct an analog signal without aliasing, the sampling frequency (\\(f_s\\)) must be at least twice the highest frequency component (\\(f_{max}\\)) of the signal.</p>
            <div class="text-center bg-light p-2 border rounded">\\[ f_s \\geq 2 f_{max} \\]</div>
        </div>
        <div class="col-md-6">
            <h5 class="text-success">ADC Resolution</h5>
            <p>An Analog-to-Digital Converter converts continuous voltage to discrete digital levels. For an \\(n\\)-bit ADC with a full-scale reference voltage \\(V_{ref}\\):</p>
            <ul>
                <li><strong>Number of states:</strong> \\( 2^n \\)</li>
                <li><strong>Resolution (Step Size):</strong> \\[ \\Delta V = \\frac{V_{ref}}{2^n} \\] *(Note: some texts use \\(2^n - 1\\) depending on exact definitions, but \\(2^n\\) is standard for calculating LSB size).*</li>
            </ul>
        </div>
    </div>
</div>`
        }
    ],
    'Operational Amplifiers': [
        {
            topic: 'Non-Ideal Characteristics',
            content_html: `
<div class="container-fluid">
    <p>While the "OPAMP" chapter covers ideal analysis, real op-amps have physical limitations tested on the FE exam.</p>
    
    <ul class="list-group">
        <li class="list-group-item">
            <h6 class="text-primary">Gain-Bandwidth Product (GBP)</h6>
            <p>The product of the open-loop gain (\\(A\\)) and the bandwidth (\\(f_c\\)) is constant. If you use negative feedback to reduce the gain, the bandwidth increases proportionally.</p>
            <div class="text-center">\\[ GBP = A_{ol} \\times f_c \\]</div>
        </li>
        <li class="list-group-item">
            <h6 class="text-success">Slew Rate (SR)</h6>
            <p>The maximum rate at which the output voltage can change. If the required rate of change exceeds the slew rate, the signal distorts (turns into a triangle wave).</p>
            <div class="text-center">\\[ SR = \\frac{dV_{out}}{dt}\\bigg|_{max} = 2\\pi f V_{peak} \\]</div>
        </li>
        <li class="list-group-item">
            <h6 class="text-danger">Common Mode Rejection Ratio (CMRR)</h6>
            <p>A real op-amp amplifies the difference between inputs (\\(A_d\\)) but also slightly amplifies noise common to both inputs (\\(A_{cm}\\)).</p>
            <div class="text-center">\\[ CMRR_{dB} = 20 \\log_{10} \\left( \\frac{A_d}{A_{cm}} \\right) \\]</div>
        </li>
    </ul>
</div>`
        }
    ],
    'Power Electronics': [
        {
            topic: 'DC-DC Converters',
            content_html: `
<div class="container-fluid">
    <p>Used to step up or step down DC voltages efficiently using high-frequency switching. Let \\(D\\) be the duty cycle (\\(0 \\leq D \\leq 1\\)).</p>
    <div class="row">
        <div class="col-md-4">
            <div class="card shadow-sm h-100 border-primary">
                <div class="card-body">
                    <h5 class="card-title text-primary">Buck Converter</h5>
                    <p class="card-text">Steps DOWN the voltage.</p>
                    <div class="text-center p-2 bg-light border rounded">
                        \\[ V_{out} = D \\cdot V_{in} \\]
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm h-100 border-success">
                <div class="card-body">
                    <h5 class="card-title text-success">Boost Converter</h5>
                    <p class="card-text">Steps UP the voltage.</p>
                    <div class="text-center p-2 bg-light border rounded">
                        \\[ V_{out} = \\frac{V_{in}}{1 - D} \\]
                    </div>
                </div>
            </div>
        </div>
        <div class="col-md-4">
            <div class="card shadow-sm h-100 border-danger">
                <div class="card-body">
                    <h5 class="card-title text-danger">Buck-Boost Converter</h5>
                    <p class="card-text">Inverts and scales voltage.</p>
                    <div class="text-center p-2 bg-light border rounded">
                        \\[ V_{out} = -V_{in} \\left(\\frac{D}{1 - D}\\right) \\]
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>`
        },
        {
            topic: 'Thyristors & Inverters',
            content_html: `
<div class="container-fluid">
    <h5 class="text-primary">SCR (Silicon Controlled Rectifier)</h5>
    <p>A four-layer solid-state device that controls current. It acts as an open switch until a short pulse is applied to the <strong>Gate</strong>. Once triggered, it latches ON and stays ON until the current flowing through it drops to zero (commutation).</p>
    
    <h5 class="text-success mt-4">Inverters (DC to AC)</h5>
    <p>Convert DC power to AC power. Often tested conceptually:</p>
    <ul>
        <li><strong>Half-Bridge & Full-Bridge:</strong> Use transistor switches to alternate polarity across a load.</li>
        <li><strong>PWM (Pulse Width Modulation):</strong> Rapidly switching transistors ON and OFF with varying duty cycles to create an output that averages to a sinusoidal waveform. This heavily reduces lower-order harmonics.</li>
    </ul>
</div>`
        }
    ]
};

const chaptersToUpdate = Object.keys(newChapters);
let newItems = [];

for (const chapter of chaptersToUpdate) {
    const topics = newChapters[chapter];
    for (const t of topics) {
        newItems.push({
            discipline: discipline,
            subject: subject,
            chapter: chapter,
            topic: t.topic,
            subtopic: 'Overview',
            content_html: t.content_html,
            important: '',
            resources: '',
            images: [],
            local_images: []
        });
    }
}

const files = ['notes.js', 'www/notes.js'];

files.forEach(notesFile => {
    let notesData = JSON.parse(fs.readFileSync(notesFile, 'utf8').replace(/^const notesData = /, '').replace(/;\s*$/, ''));
    
    // Remove existing chapters
    notesData = notesData.filter(x => !(
        x.discipline === discipline &&
        x.subject === subject &&
        chaptersToUpdate.includes(x.chapter)
    ));
    
    notesData.push(...newItems);
    
    fs.writeFileSync(notesFile, `const notesData = ${JSON.stringify(notesData, null, 4)};\n`);
    console.log(`Updated ${notesFile}`);
});

// Update Hierarchy
const hierarchyFile = 'Electrical_and_Computer_notes_hierarchy.json';
const hierarchy = JSON.parse(fs.readFileSync(hierarchyFile, 'utf8'));
const subjectNode = hierarchy.subjects.find(s => s.subject === subject);
if (subjectNode) {
    for (const chapter of chaptersToUpdate) {
        let chapterNode = subjectNode.chapters.find(c => c.chapter === chapter);
        if (!chapterNode) {
            chapterNode = { chapter: chapter, topics: [] };
            subjectNode.chapters.push(chapterNode);
        }
        chapterNode.topics = newChapters[chapter].map(t => ({
            topic: t.topic,
            subtopics: ["Overview"]
        }));
    }
    fs.writeFileSync(hierarchyFile, JSON.stringify(hierarchy, null, 4));
    console.log(`Updated ${hierarchyFile}`);
}

console.log("Done");
