const fs = require('fs');
const filePath = 'd:\\Engg-Prep\\www\\questions.js';

let content = fs.readFileSync(filePath, 'utf8');
let modified = false;

const replacements = [
    {
        find: '"text": "$mu geq \\tan \\lambda$ (where $\\lambda$ is the lead angle)",',
        replace: '"text": "$\\\\\\\\mu \\\\\\\\geq \\\\\\\\tan \\\\\\\\lambda$ (where $\\\\\\\\lambda$ is the lead angle)",'
    },
    {
        find: '"text": "$\\mu \\leq \\tan \\lambda",',
        replace: '"text": "$\\\\\\\\mu \\\\\\\\leq \\\\\\\\tan \\\\\\\\lambda",',
    },
    {
        // Notice: The file has $\lambda \geq 45\^circ$
        // the original string in JSON might literally be `$\\lambda \\geq 45\\^circ"` 
        find: '"text": "$\\lambda \\geq 45\\^circ",',
        replace: '"text": "$\\\\\\\\lambda \\\\\\\\geq 45^\\\\\\\\circ",', 
    },
    {
        find: '"text": "$\\mu = 0",',
        replace: '"text": "$\\\\\\\\mu = 0",',
    },
    {
        find: '"content": "A power screw is self-locking if the torque to lower the load is positive ($T_L > 0$). This occurs mathematically when $pi mu d_m geq l \\rightarrow mu geq \\frac{l}{pi d_m} \\rightarrow mu geq \\tanlambda$."',
        replace: '"content": "A power screw is self-locking if the torque to lower the load is positive ($T_L > 0$). This occurs mathematically when $\\\\\\\\pi \\\\\\\\mu d_m \\\\\\\\geq l \\\\\\\\rightarrow \\\\\\\\mu \\\\\\\\geq \\\\\\\\frac{l}{\\\\\\\\pi d_m} \\\\\\\\rightarrow \\\\\\\\mu \\\\\\\\geq \\\\\\\\tan \\\\\\\\lambda$."'
    }
];

// In JS source, a literal backslash is represented as \\
// if the user typed \mu, JS parses it as \mu (or just m if it doesn't escape).
// Let's use regex to find and replace.

content = content.replace(/"text": "\$mu geq \\tan \\lambda\$ \(where \$\\lambda\$ is the lead angle\)",/g, 
    '"text": "$\\\\\\\\mu \\\\\\\\geq \\\\\\\\tan \\\\\\\\lambda$ (where $\\\\\\\\lambda$ is the lead angle)",');

content = content.replace(/"text": "\$\\mu \\leq \\tan \\lambda\$",/g, 
    '"text": "$\\\\\\\\mu \\\\\\\\leq \\\\\\\\tan \\\\\\\\lambda$",');

content = content.replace(/"text": "\$\\lambda \\geq 45\\\^circ\$",/g, 
    '"text": "$\\\\\\\\lambda \\\\\\\\geq 45^\\\\\\\\circ$",');

content = content.replace(/"text": "\$\\mu = 0\$",/g, 
    '"text": "$\\\\\\\\mu = 0$",');

content = content.replace(/"content": "A power screw is self-locking if the torque to lower the load is positive \(\$T_L > 0\$\)\. This occurs mathematically when \$pi mu d_m geq l \\rightarrow mu geq \\frac{l}{pi d_m} \\rightarrow mu geq \\tanlambda\$\."/g, 
    '"content": "A power screw is self-locking if the torque to lower the load is positive ($T_L > 0$). This occurs mathematically when $\\\\\\\\pi \\\\\\\\mu d_m \\\\\\\\geq l \\\\\\\\rightarrow \\\\\\\\mu \\\\\\\\geq \\\\\\\\frac{l}{\\\\\\\\pi d_m} \\\\\\\\rightarrow \\\\\\\\mu \\\\\\\\geq \\\\\\\\tan \\\\\\\\lambda$."');

// Verify modifying happened
fs.writeFileSync(filePath, content, 'utf8');
console.log("File updated using regex replace.");
