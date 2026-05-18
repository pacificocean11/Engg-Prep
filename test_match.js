const fs = require('fs');

const partB = fs.readFileSync('add_elec_core_partB.js', 'utf8');
const partC = fs.readFileSync('add_elec_core_partC.js', 'utf8');
const partD = fs.readFileSync('add_elec_core_partD.js', 'utf8');

// Match arrays
const elecMatch = partB.match(/const electronicsNew = (\[[\s\S]*?\]);\s*questionsObj/);
const emMatch = partC.match(/const electromagneticsNew = (\[[\s\S]*?\]);\s*questionsObj/);
const csMatch = partD.match(/const controlSystemsNew = (\[[\s\S]*?\]);\s*const communicationsNew/);
const commMatch = partD.match(/const communicationsNew = (\[[\s\S]*?\]);\s*questionsObj/);

if (elecMatch && emMatch && csMatch && commMatch) {
  console.log("Match success!");
  const elecNew = eval(elecMatch[1]);
  const emNew = eval(emMatch[1]);
  const csNew = eval(csMatch[1]);
  const commNew = eval(commMatch[1]);
  console.log("Electronics new count:", elecNew.length);
  console.log("Electromagnetics new count:", emNew.length);
  console.log("Control Systems new count:", csNew.length);
  console.log("Communications new count:", commNew.length);
} else {
  console.log("Match failed!");
  if (!elecMatch) console.log("elecMatch failed");
  if (!emMatch) console.log("emMatch failed");
  if (!csMatch) console.log("csMatch failed");
  if (!commMatch) console.log("commMatch failed");
}
