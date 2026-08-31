const fs = require('fs');

let content = fs.readFileSync('notes.js', 'utf8');

// Fix the literal \n
content = content.replace('Inverting Amplifier</h5>\\\\n\\n', 'Inverting Amplifier</h5>\\n');

// The TikZ block has 4 backslashes in JSON (which evaluate to 2 in JS, i.e. \\begin).
// We want it to be 2 backslashes in JSON (which evaluate to 1 in JS, i.e. \begin).
const oldTikZ = `        \\\\\\\\begin{tikzpicture}[thick, scale=1.2]
            % Draw the op-amp triangle
            \\\\\\\\draw (0,1) -- (0,-1) -- (2,0) -- cycle;
            \\\\\\\\node at (0.3, 0.5) {$-$};
            \\\\\\\\node at (0.3, -0.5) {$+$};
            
            % Draw the input resistor (R_in) and Vin
            \\\\\\\\draw (-2, 0.5) -- (-1.5, 0.5) 
                  -- (-1.4, 0.7) -- (-1.2, 0.3) -- (-1.0, 0.7) -- (-0.8, 0.3) -- (-0.6, 0.5) 
                  -- (0, 0.5);
            \\\\\\\\node at (-1.0, 0.9) {$R_{in}$};
            \\\\\\\\node[left] at (-2, 0.5) {$V_{in}$};
            
            % Draw the non-inverting terminal to ground
            \\\\\\\\draw (0, -0.5) -- (-0.5, -0.5) -- (-0.5, -1.2);
            \\\\\\\\draw (-0.8, -1.2) -- (-0.2, -1.2);
            \\\\\\\\draw (-0.6, -1.3) -- (-0.4, -1.3);
            \\\\\\\\draw (-0.55, -1.4) -- (-0.45, -1.4); % Ground symbol
            
            % Draw the feedback resistor (R_f)
            \\\\\\\\draw (-0.3, 0.5) -- (-0.3, 2) -- (0.5, 2)
                  -- (0.6, 2.2) -- (0.8, 1.8) -- (1.0, 2.2) -- (1.2, 1.8) -- (1.4, 2)
                  -- (2.5, 2) -- (2.5, 0);
            \\\\\\\\node at (1.0, 2.5) {$R_f$};
            
            % Draw the output terminal
            \\\\\\\\draw (2, 0) -- (3, 0);
            \\\\\\\\node[right] at (3, 0) {$V_{out}$};
            \\\\\\\\fill (2.5, 0) circle (2pt);
            \\\\\\\\fill (-0.3, 0.5) circle (2pt);
          \\\\\\\\end{tikzpicture}`;

const newTikZ = oldTikZ.replace(/\\\\\\\\/g, '\\\\');

content = content.replace(oldTikZ, newTikZ);

fs.writeFileSync('notes.js', content);
fs.writeFileSync('www/notes.js', content);
console.log('Fixed notes.js and www/notes.js');
