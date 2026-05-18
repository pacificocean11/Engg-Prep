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

const engSciencesNew = [
  // Dynamics (3)
  { topic: "Dynamics", title: "Projectile Range", question: "A projectile is launched with an initial velocity of $20\\ \\text{m/s}$ at an angle of $30^{\\circ}$ above the horizontal. Ignoring air resistance, what is its maximum horizontal range? ($g = 9.81\\ \\text{m/s}^2$)", options: [ { text: "$35.3\\ \\text{m}$", is_correct: true }, { text: "$20.4\\ \\text{m}$", is_correct: false }, { text: "$40.8\\ \\text{m}$", is_correct: false }, { text: "$17.7\\ \\text{m}$", is_correct: false } ], solution: { steps: [ { title: "Apply Range Formula", content: "$R = \\frac{v_0^2 \\sin(2\\theta)}{g} = \\frac{20^2 \\sin(60^{\\circ})}{9.81} = \\frac{400 \\times 0.866}{9.81} = 35.3\\ \\text{m}$." } ] } },
  { topic: "Dynamics", title: "Conservation of Momentum", question: "A $2\\ \\text{kg}$ object moving at $3\\ \\text{m/s}$ collides perfectly inelastically with a stationary $3\\ \\text{kg}$ object. What is their common velocity after the collision?", options: [ { text: "$1.2\\ \\text{m/s}$", is_correct: true }, { text: "$1.5\\ \\text{m/s}$", is_correct: false }, { text: "$0.8\\ \\text{m/s}$", is_correct: false }, { text: "$2.0\\ \\text{m/s}$", is_correct: false } ], solution: { steps: [ { title: "Apply Momentum Conservation", content: "$m_1 v_1 + m_2 v_2 = (m_1 + m_2) v_f \\implies 2(3) + 3(0) = (2+3) v_f \\implies v_f = 6/5 = 1.2\\ \\text{m/s}$." } ] } },
  { topic: "Dynamics", title: "Work-Energy Theorem", question: "A constant force of $50\\ \\text{N}$ is applied to a $10\\ \\text{kg}$ block, initially at rest, over a distance of $5\\ \\text{m}$ on a frictionless horizontal surface. What is its final kinetic energy?", options: [ { text: "$250\\ \\text{J}$", is_correct: true }, { text: "$500\\ \\text{J}$", is_correct: false }, { text: "$125\\ \\text{J}$", is_correct: false }, { text: "$50\\ \\text{J}$", is_correct: false } ], solution: { steps: [ { title: "Calculate Work Done", content: "Work done $W = F \\times d = 50 \\times 5 = 250\\ \\text{J}$. By the work-energy theorem, this equals the change in kinetic energy." } ] } },
  // Statics (3)
  { topic: "Statics", title: "Moment of a Force", question: "A $100\\ \\text{N}$ force is applied perpendicularly to the end of a $2\\ \\text{m}$ wrench. What is the magnitude of the moment about the bolt?", options: [ { text: "$200\\ \\text{N}\\cdot\\text{m}$", is_correct: true }, { text: "$50\\ \\text{N}\\cdot\\text{m}$", is_correct: false }, { text: "$100\\ \\text{N}\\cdot\\text{m}$", is_correct: false }, { text: "$0\\ \\text{N}\\cdot\\text{m}$", is_correct: false } ], solution: { steps: [ { title: "Calculate Moment", content: "$M = F \\times d = 100 \\times 2 = 200\\ \\text{N}\\cdot\\text{m}$." } ] } },
  { topic: "Statics", title: "Centroid of a Triangle", question: "The centroid of a right triangle with base $b$ and height $h$, measured from the right angle, is located at:", options: [ { text: "$(\\frac{b}{3}, \\frac{h}{3})$", is_correct: true }, { text: "$(\\frac{b}{2}, \\frac{h}{2})$", is_correct: false }, { text: "$(\\frac{b}{4}, \\frac{h}{4})$", is_correct: false }, { text: "$(\\frac{2b}{3}, \\frac{2h}{3})$", is_correct: false } ], solution: { steps: [ { title: "Recall Centroid Formula", content: "For a right triangle, the centroid is at one-third the base and one-third the height from the right angle." } ] } },
  { topic: "Statics", title: "Friction on an Incline", question: "A block is on the verge of sliding down an inclined plane at an angle $\\theta = 30^{\\circ}$. What is the coefficient of static friction $\\mu_s$?", options: [ { text: "$0.577$", is_correct: true }, { text: "$0.500$", is_correct: false }, { text: "$0.866$", is_correct: false }, { text: "$1.000$", is_correct: false } ], solution: { steps: [ { title: "Determine Coefficient", content: "At impending slip on an incline, $\\mu_s = \\tan(\\theta) = \\tan(30^{\\circ}) = 1/\\sqrt{3} \\approx 0.577$." } ] } },
  // Strength of Materials (4)
  { topic: "Strength of Materials", title: "Axial Stress", question: "A solid circular rod with a diameter of $20\\ \\text{mm}$ is subjected to an axial tensile load of $31.4\\ \\text{kN}$. What is the normal stress in the rod?", options: [ { text: "$100\\ \\text{MPa}$", is_correct: true }, { text: "$31.4\\ \\text{MPa}$", is_correct: false }, { text: "$50\\ \\text{MPa}$", is_correct: false }, { text: "$200\\ \\text{MPa}$", is_correct: false } ], solution: { steps: [ { title: "Calculate Area and Stress", content: "$A = \\pi r^2 = \\pi (0.01)^2 = 3.14 \\times 10^{-4}\\ \\text{m}^2$. Stress $\\sigma = P/A = 31.4\\ \\text{kN} / 3.14 \\times 10^{-4} = 100\\ \\text{MPa}$." } ] } },
  { topic: "Strength of Materials", title: "Hooke's Law", question: "A material has a modulus of elasticity $E = 200\\ \\text{GPa}$. If it experiences a normal strain of $0.002$, what is the normal stress?", options: [ { text: "$400\\ \\text{MPa}$", is_correct: true }, { text: "$200\\ \\text{MPa}$", is_correct: false }, { text: "$100\\ \\text{MPa}$", is_correct: false }, { text: "$800\\ \\text{MPa}$", is_correct: false } ], solution: { steps: [ { title: "Apply Hooke's Law", content: "$\\sigma = E \\epsilon = 200 \\times 10^9 \\times 0.002 = 400 \\times 10^6\\ \\text{Pa} = 400\\ \\text{MPa}$." } ] } },
  { topic: "Strength of Materials", title: "Torsional Shear Stress", question: "The maximum shear stress in a solid circular shaft subjected to a torque $T$ is given by:", options: [ { text: "$\\tau_{max} = \\frac{T c}{J}$", is_correct: true }, { text: "$\\tau_{max} = \\frac{T L}{G J}$", is_correct: false }, { text: "$\\tau_{max} = \\frac{V Q}{I t}$", is_correct: false }, { text: "$\\tau_{max} = \\frac{M c}{I}$", is_correct: false } ], solution: { steps: [ { title: "Identify Formula", content: "The torsion formula for maximum shear stress is $\\tau_{max} = Tc/J$, where $c$ is the outer radius." } ] } },
  { topic: "Strength of Materials", title: "Poisson's Ratio", question: "Poisson's ratio ($\\nu$) is defined as the negative ratio of:", options: [ { text: "Transverse strain to axial strain", is_correct: true }, { text: "Axial strain to transverse strain", is_correct: false }, { text: "Shear strain to normal strain", is_correct: false }, { text: "Normal stress to shear stress", is_correct: false } ], solution: { steps: [ { title: "Define Poisson's Ratio", content: "$\\nu = - \\frac{\\epsilon_{transverse}}{\\epsilon_{axial}}$." } ] } }
];

const econNew = [
  // Cost Types and Breakdowns (5)
  { topic: "Cost Types and Breakdowns", title: "Sunk Costs", question: "A cost that has already been incurred and cannot be recovered is known as a:", options: [ { text: "Sunk cost", is_correct: true }, { text: "Opportunity cost", is_correct: false }, { text: "Fixed cost", is_correct: false }, { text: "Variable cost", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "Sunk costs are historical costs that should be ignored in future engineering economic decisions." } ] } },
  { topic: "Cost Types and Breakdowns", title: "Opportunity Cost", question: "The potential benefit that is given up when you choose one alternative over another is called the:", options: [ { text: "Opportunity cost", is_correct: true }, { text: "Marginal cost", is_correct: false }, { text: "Indirect cost", is_correct: false }, { text: "Life-cycle cost", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "Opportunity cost reflects the value of the next best alternative forgone." } ] } },
  { topic: "Cost Types and Breakdowns", title: "Fixed vs Variable Costs", question: "Costs that vary directly with the level of production output are known as:", options: [ { text: "Variable costs", is_correct: true }, { text: "Fixed costs", is_correct: false }, { text: "Overhead costs", is_correct: false }, { text: "Capital costs", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "Examples of variable costs include raw materials and direct labor." } ] } },
  { topic: "Cost Types and Breakdowns", title: "Direct vs Indirect Costs", question: "Administrative salaries and facility lighting are typically classified as:", options: [ { text: "Indirect costs (overhead)", is_correct: true }, { text: "Direct material costs", is_correct: false }, { text: "Direct labor costs", is_correct: false }, { text: "Variable costs", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "Indirect costs cannot be easily traced to a specific unit of production." } ] } },
  { topic: "Cost Types and Breakdowns", title: "Marginal Cost", question: "The additional cost incurred from producing one more unit of a product is called the:", options: [ { text: "Marginal cost", is_correct: true }, { text: "Average cost", is_correct: false }, { text: "Total cost", is_correct: false }, { text: "Fixed cost", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "Marginal cost is the derivative of total cost with respect to quantity." } ] } },
  // Economic Analyses (3)
  { topic: "Economic Analyses", title: "Benefit-Cost Ratio", question: "A public project is generally considered economically viable if its Benefit-Cost Ratio (B/C) is:", options: [ { text: "Greater than or equal to 1.0", is_correct: true }, { text: "Less than 1.0", is_correct: false }, { text: "Exactly zero", is_correct: false }, { text: "Negative", is_correct: false } ], solution: { steps: [ { title: "Criterion", content: "If $B/C \\ge 1.0$, the present worth of benefits exceeds or equals the present worth of costs." } ] } },
  { topic: "Economic Analyses", title: "Payback Period", question: "The simple payback period method for evaluating projects is often criticized because it:", options: [ { text: "Ignores the time value of money and cash flows after the payback period", is_correct: true }, { text: "Is too mathematically complex", is_correct: false }, { text: "Requires knowing the exact inflation rate", is_correct: false }, { text: "Only applies to public sector projects", is_correct: false } ], solution: { steps: [ { title: "Limitation", content: "Simple payback simply sums cash flows without discounting and ignores anything past the breakeven point." } ] } },
  { topic: "Economic Analyses", title: "Internal Rate of Return", question: "The Internal Rate of Return (IRR) is the interest rate at which:", options: [ { text: "The Net Present Value (NPV) of a project is exactly zero", is_correct: true }, { text: "The Benefit-Cost ratio is maximized", is_correct: false }, { text: "The payback period is 5 years", is_correct: false }, { text: "The inflation rate matches the bank rate", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "IRR is found by setting $PW = 0$ and solving for $i$." } ] } }
];

const statsNew = [
  // Expected Value (3)
  { topic: "Expected Value", title: "Expected Value of a Die", question: "What is the expected value of a single roll of a fair six-sided die?", options: [ { text: "3.5", is_correct: true }, { text: "3.0", is_correct: false }, { text: "4.0", is_correct: false }, { text: "1.0", is_correct: false } ], solution: { steps: [ { title: "Calculation", content: "$E[X] = \\sum x_i P(x_i) = (1+2+3+4+5+6)/6 = 21/6 = 3.5$." } ] } },
  { topic: "Expected Value", title: "Linearity of Expectation", question: "If $E[X] = 5$ and $E[Y] = 10$, what is $E[2X + Y]$?", options: [ { text: "20", is_correct: true }, { text: "15", is_correct: false }, { text: "25", is_correct: false }, { text: "30", is_correct: false } ], solution: { steps: [ { title: "Apply Linearity", content: "$E[2X + Y] = 2E[X] + E[Y] = 2(5) + 10 = 20$." } ] } },
  { topic: "Expected Value", title: "Expected Value of Constant", question: "If $c$ is a constant, what is the expected value $E[c]$?", options: [ { text: "$c$", is_correct: true }, { text: "$0$", is_correct: false }, { text: "$1$", is_correct: false }, { text: "Infinity", is_correct: false } ], solution: { steps: [ { title: "Rule", content: "The expected value of a constant is the constant itself." } ] } },
  // Measures of Central Tendencies and Dispersions (1)
  { topic: "Measures of Central Tendencies and Dispersions", title: "Variance Definition", question: "Variance is defined as the expected value of:", options: [ { text: "The squared deviation from the mean: $E[(X - \\mu)^2]$", is_correct: true }, { text: "The absolute deviation from the mean", is_correct: false }, { text: "The square root of the standard deviation", is_correct: false }, { text: "The difference between the maximum and minimum values", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "$Var(X) = E[(X - \\mu)^2] = E[X^2] - (E[X])^2$." } ] } },
  // Regression and Curve Fitting (4)
  { topic: "Regression and Curve Fitting", title: "Correlation Coefficient", question: "A Pearson correlation coefficient of $r = -1$ indicates:", options: [ { text: "A perfect negative linear relationship", is_correct: true }, { text: "No linear relationship", is_correct: false }, { text: "A perfect positive linear relationship", is_correct: false }, { text: "A parabolic relationship", is_correct: false } ], solution: { steps: [ { title: "Interpretation", content: "$r$ ranges from -1 to 1. -1 means a perfect downward sloping line." } ] } },
  { topic: "Regression and Curve Fitting", title: "Least Squares Method", question: "The method of least squares finds the line of best fit by minimizing the sum of the:", options: [ { text: "Squared residuals (vertical offsets)", is_correct: true }, { text: "Absolute residuals", is_correct: false }, { text: "Perpendicular distances to the line", is_correct: false }, { text: "Horizontal offsets", is_correct: false } ], solution: { steps: [ { title: "Methodology", content: "It minimizes $\\sum (y_i - \\hat{y}_i)^2$." } ] } },
  { topic: "Regression and Curve Fitting", title: "Coefficient of Determination", question: "The coefficient of determination, $R^2$, represents:", options: [ { text: "The proportion of variance in the dependent variable explained by the model", is_correct: true }, { text: "The slope of the regression line", is_correct: false }, { text: "The standard error of the estimate", is_correct: false }, { text: "The correlation between two independent variables", is_correct: false } ], solution: { steps: [ { title: "Definition", content: "$R^2$ is the explained variation divided by total variation." } ] } },
  { topic: "Regression and Curve Fitting", title: "Linear Regression Equation", question: "In a simple linear regression equation $\\hat{y} = b_0 + b_1 x$, the term $b_1$ represents the:", options: [ { text: "Slope of the regression line", is_correct: true }, { text: "y-intercept", is_correct: false }, { text: "Residual error", is_correct: false }, { text: "Correlation coefficient", is_correct: false } ], solution: { steps: [ { title: "Equation Components", content: "$b_1$ is the slope, indicating the change in $y$ for a one-unit change in $x$." } ] } }
];

const allNewQuestions = {
  "eng-sciences": rotateAnswers(engSciencesNew, 0),
  "econ": rotateAnswers(econNew, 0),
  "stats": rotateAnswers(statsNew, 0)
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
console.log(`Successfully added gaps for eng-sciences, econ, and stats.`);
