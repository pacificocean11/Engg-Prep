const fs = require('fs');

const discipline = 'Electrical and Computer';
const subject = 'Electronics';
const chapter = 'OPAMP';
const topicName = 'Inverting & Non-Inverting Amplifiers';

const tikzDiagram = `
    <!-- TikZJax Diagram Block -->
    <div class="text-center my-4">
        <script type="text/tikz">
          \\begin{tikzpicture}[thick, scale=1.2]
            % Draw the op-amp triangle
            \\draw (0,1) -- (0,-1) -- (2,0) -- cycle;
            \\node at (0.3, 0.5) {$-$};
            \\node at (0.3, -0.5) {$+$};
            
            % Draw the input resistor (R_in) and Vin
            \\draw (-2, 0.5) -- (-1.5, 0.5) 
                  -- (-1.4, 0.7) -- (-1.2, 0.3) -- (-1.0, 0.7) -- (-0.8, 0.3) -- (-0.6, 0.5) 
                  -- (0, 0.5);
            \\node at (-1.0, 0.9) {$R_{in}$};
            \\node[left] at (-2, 0.5) {$V_{in}$};
            
            % Draw the non-inverting terminal to ground
            \\draw (0, -0.5) -- (-0.5, -0.5) -- (-0.5, -1.2);
            \\draw (-0.8, -1.2) -- (-0.2, -1.2);
            \\draw (-0.6, -1.3) -- (-0.4, -1.3);
            \\draw (-0.55, -1.4) -- (-0.45, -1.4); % Ground symbol
            
            % Draw the feedback resistor (R_f)
            \\draw (-0.3, 0.5) -- (-0.3, 2) -- (0.5, 2)
                  -- (0.6, 2.2) -- (0.8, 1.8) -- (1.0, 2.2) -- (1.2, 1.8) -- (1.4, 2)
                  -- (2.5, 2) -- (2.5, 0);
            \\node at (1.0, 2.5) {$R_f$};
            
            % Draw the output terminal
            \\draw (2, 0) -- (3, 0);
            \\node[right] at (3, 0) {$V_{out}$};
            \\fill (2.5, 0) circle (2pt);
            \\fill (-0.3, 0.5) circle (2pt);
          \\end{tikzpicture}
        </script>
    </div>
`;

const files = ['notes.js', 'www/notes.js'];

files.forEach(notesFile => {
    let notesData;
    eval(fs.readFileSync(notesFile, 'utf8').replace('const notesData =', 'notesData ='));
    
    let updated = false;
    for (let item of notesData) {
        if (item.content_html) {
            // Insert the TikZ block right after Inverting Amplifier heading
            if (!item.content_html.includes('text/tikz')) {
                const searchStr = 'Inverting Amplifier</h5>';
                if (item.content_html.includes(searchStr)) {
                    item.content_html = item.content_html.replace(
                        searchStr, 
                        searchStr + '\\n' + tikzDiagram
                    );
                    updated = true;
                }
            }
        }
    }
    
    if (updated) {
        fs.writeFileSync(notesFile, `const notesData = ${JSON.stringify(notesData, null, 4)};\n`);
        console.log(`Updated ${notesFile}`);
    } else {
        console.log(`No update needed or topic not found in ${notesFile}`);
    }
});

console.log("Done");
