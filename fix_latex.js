const fs = require('fs');
let content = fs.readFileSync('d:/Engg-Prep/www/questions.js', 'utf8');

const latexCommands = new Set([
    'frac', 'text', 'times', 'right', 'left', 'pi', 'sin', 'cos', 'ln', 'mu', 'rho', 'alpha', 'beta', 
    'gamma', 'Delta', 'Sigma', 'Omega', 'infty', 'rightarrow', 'implies', 'approx', 'cdot', 'div', 'pm', 'mp', 
    'le', 'ge', 'neq', 'equiv', 'sim', 'simeq', 'propto', 'nabla', 'partial', 'int', 'oint', 'sum', 'prod', 
    'lim', 'log', 'exp', 'min', 'max', 'tan', 'csc', 'sec', 'cot', 'sinh', 'cosh', 'tanh', 'arcsin', 'arccos', 
    'arctan', 'Big', 'bigg', 'langle', 'rangle', 'begin', 'end', 'quad', 'qquad', 'mathrm', 'mathbf', 'mathit', 
    'mathsf', 'mathtt', 'mathcal', 'mathbb', 'mathfrak', 'hat', 'bar', 'vec', 'dot', 'ddot', 'tilde', 'check', 
    'breve', 'acute', 'grave', 'circ', 'bullet', 'ast', 'star', 'dagger', 'ddagger', 'amalg', 'oplus', 'ominus', 
    'otimes', 'oslash', 'odot', 'bigcirc', 'setminus', 'uplus', 'sqcap', 'sqcup', 'triangleleft', 'triangleright', 
    'wr', 'bigtriangleup', 'bigtriangledown', 'asymp', 'cong', 'doteq', 'bowtie', 'models', 'perp', 'mid', 
    'parallel', 'smile', 'frown', 'hookrightarrow', 'hookleftarrow', 'leftharpoonup', 'leftharpoondown', 
    'rightharpoonup', 'rightharpoondown', 'rightleftharpoons', 'leadsto', 'uparrow', 'downarrow', 'updownarrow', 
    'Uparrow', 'Downarrow', 'Updownarrow', 'nearrow', 'searrow', 'swarrow', 'nwarrow', 'aleph', 'hbar', 'imath', 
    'jmath', 'ell', 'wp', 'Re', 'Im', 'mho', 'emptyset', 'surd', 'top', 'bot', 'vdash', 'dashv', 'triangle', 
    'forall', 'exists', 'neg', 'flat', 'natural', 'sharp', 'clubsuit', 'diamondsuit', 'heartsuit', 'spadesuit', 
    'coprod', 'bigvee', 'bigwedge', 'biguplus', 'bigcap', 'bigcup', 'intop', 'ointop', 'bigotimes', 'bigoplus', 
    'bigodot', 'bigsqcup', 'smallint', 'lhd', 'rhd', 'unlhd', 'unrhd', 'sqsubseteq', 'sqsupseteq', 'sqsubset', 
    'sqsupset', 'Join', 'ltimes', 'rtimes', 'll', 'gg', 'prec', 'succ', 'preceq', 'succeq', 'subset', 'supset', 
    'subseteq', 'supseteq', 'in', 'ni', 'notin', 'leftarrow', 'Rightarrow', 'Leftarrow', 'leftrightarrow', 
    'Leftrightarrow', 'longrightarrow', 'longleftarrow', 'Longrightarrow', 'Longleftarrow', 'longleftrightarrow', 
    'Longleftrightarrow', 'mapsto', 'longmapsto', 'emph', 'textbf', 'textit', 'vspace', 'hspace', 'hline', 'clearpage'
]);

let changes = 0;
// Match a single backslash not preceded by a backslash, followed by letters
const regex = /(?<!\\)\\([a-zA-Z]+)/g;

content = content.replace(regex, (match, commandName) => {
    if (latexCommands.has(commandName)) {
        changes++;
        return '\\\\' + commandName;
    }
    return match;
});

console.log('Made ' + changes + ' replacements.');
fs.writeFileSync('d:/Engg-Prep/www/questions.js', content, 'utf8');
fs.copyFileSync('d:/Engg-Prep/www/questions.js', 'd:/Engg-Prep/questions.js');
