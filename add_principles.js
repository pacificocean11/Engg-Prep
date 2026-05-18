const fs = require('fs');

let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS");
  process.exit(1);
}
const questionsObj = JSON.parse(match[1]);

function rotateAnswers(questions, startIdx) {
  let count = startIdx;
  const labels = ["A", "B", "C", "D"];
  return questions.map(q => {
    let correctIdx = count % 4;
    count++;
    let originalCorrectText = q.options.find(o => o.is_correct).text;
    let incorrectTexts = q.options.filter(o => !o.is_correct).map(o => o.text);
    
    let newOpts = [];
    let incCount = 0;
    for (let i = 0; i < 4; i++) {
      if (i === correctIdx) {
        newOpts.push({ label: labels[i], text: originalCorrectText, is_correct: true });
      } else {
        newOpts.push({ label: labels[i], text: incorrectTexts[incCount++], is_correct: false });
      }
    }
    q.options = newOpts;
    q.solution.final_answer = labels[correctIdx];
    return q;
  });
}

const principlesNew = [
  // Dynamics (4)
  { topic: "Dynamics", title: "Kinetic Energy", question: "A $5\\ \\text{kg}$ object is moving at a velocity of $10\\ \\text{m/s}$. What is its kinetic energy?", options: [ { text: "$250\\ \\text{J}$", is_correct: true }, { text: "$50\\ \\text{J}$", is_correct: false }, { text: "$500\\ \\text{J}$", is_correct: false }, { text: "$125\\ \\text{J}$", is_correct: false } ], solution: { steps: [ { title: "Apply Formula", content: "$KE = \\frac{1}{2}mv^2 = 0.5 \\times 5 \\times 10^2 = 250\\ \\text{J}$." } ] } },
  { topic: "Dynamics", title: "Angular Velocity", question: "A wheel completes $120$ revolutions per minute. What is its angular velocity in radians per second?", options: [ { text: "$4\\pi\\ \\text{rad/s}$", is_correct: true }, { text: "$2\\pi\\ \\text{rad/s}$", is_correct: false }, { text: "$120\\pi\\ \\text{rad/s}$", is_correct: false }, { text: "$12\\ \\text{rad/s}$", is_correct: false } ], solution: { steps: [ { title: "Convert Units", content: "$120\\ \\text{rev/min} = 2\\ \\text{rev/s}$. $2 \\times 2\\pi = 4\\pi\\ \\text{rad/s}$." } ] } },
  { topic: "Dynamics", title: "Newton's Second Law", question: "A force of $100\\ \\text{N}$ is applied to a $20\\ \\text{kg}$ mass. Ignoring friction, what is the resulting acceleration?", options: [ { text: "$5\\ \\text{m/s}^2$", is_correct: true }, { text: "$0.2\\ \\text{m/s}^2$", is_correct: false }, { text: "$120\\ \\text{m/s}^2$", is_correct: false }, { text: "$2000\\ \\text{m/s}^2$", is_correct: false } ], solution: { steps: [ { title: "Apply Formula", content: "$F = ma \\implies a = F/m = 100/20 = 5\\ \\text{m/s}^2$." } ] } },
  { topic: "Dynamics", title: "Impulse", question: "A force of $50\\ \\text{N}$ is applied for $2\\ \\text{s}$ to an object. What is the impulse delivered to the object?", options: [ { text: "$100\\ \\text{N}\\cdot\\text{s}$", is_correct: true }, { text: "$25\\ \\text{N}\\cdot\\text{s}$", is_correct: false }, { text: "$52\\ \\text{N}\\cdot\\text{s}$", is_correct: false }, { text: "$2500\\ \\text{N}\\cdot\\text{s}$", is_correct: false } ], solution: { steps: [ { title: "Apply Formula", content: "$Impulse = F \\times \\Delta t = 50 \\times 2 = 100\\ \\text{N}\\cdot\\text{s}$." } ] } },
  
  // Materials Science (3)
  { topic: "Materials Science", title: "Hardness Testing", question: "Which of the following scales is commonly used to measure the hardness of a material?", options: [ { text: "Rockwell scale", is_correct: true }, { text: "Richter scale", is_correct: false }, { text: "Kelvin scale", is_correct: false }, { text: "Beaufort scale", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "The Rockwell scale measures hardness based on the depth of penetration of an indenter." } ] } },
  { topic: "Materials Science", title: "Ductility vs Brittleness", question: "A material that undergoes significant plastic deformation before failure is considered to be:", options: [ { text: "Ductile", is_correct: true }, { text: "Brittle", is_correct: false }, { text: "Elastic", is_correct: false }, { text: "Tough", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "Ductility refers to a material's ability to deform under tensile stress." } ] } },
  { topic: "Materials Science", title: "Yield Strength", question: "The point on a stress-strain curve where a material begins to transition from elastic to plastic deformation is called the:", options: [ { text: "Yield point (Yield strength)", is_correct: true }, { text: "Ultimate tensile strength", is_correct: false }, { text: "Fracture point", is_correct: false }, { text: "Proportional limit", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "The yield point marks the onset of permanent (plastic) deformation." } ] } },

  // Statics (3)
  { topic: "Statics", title: "Conditions for Equilibrium", question: "For a rigid body to be in static equilibrium in 2D space, the net force and net moment must be:", options: [ { text: "Zero in all directions", is_correct: true }, { text: "Equal to gravity", is_correct: false }, { text: "Maximized", is_correct: false }, { text: "Opposite to each other", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "$\\sum F_x = 0$, $\\sum F_y = 0$, and $\\sum M = 0$." } ] } },
  { topic: "Statics", title: "Truss Analysis (Method of Joints)", question: "When using the method of joints to analyze a truss, the forces at any given joint are modeled as a:", options: [ { text: "Concurrent force system", is_correct: true }, { text: "Parallel force system", is_correct: false }, { text: "Collinear force system", is_correct: false }, { text: "Non-concurrent force system", is_correct: false } ], solution: { steps: [ { title: "Methodology", content: "All forces at a joint intersect at that joint, making it a concurrent system." } ] } },
  { topic: "Statics", title: "Friction Direction", question: "The force of static friction between two surfaces always acts:", options: [ { text: "Parallel to the surfaces and opposite to the direction of impending motion", is_correct: true }, { text: "Perpendicular to the surfaces", is_correct: false }, { text: "In the same direction as the normal force", is_correct: false }, { text: "In the direction of motion", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "Friction opposes relative or impending relative motion." } ] } }
];

const allNewQuestions = {
  "principles": rotateAnswers(principlesNew, 0)
};

for (const [subj, newQs] of Object.entries(allNewQuestions)) {
  if (questionsObj[subj]) {
    questionsObj[subj].push(...newQs);
  } else {
    questionsObj[subj] = newQs;
  }
}

const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefixContent = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefixContent + 'const QUESTIONS = ' + updatedJson + ';\n', 'utf8');
console.log(`Successfully added gaps for principles.`);
