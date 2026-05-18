const fs = require('fs');
let fc = fs.readFileSync('questions.js', 'utf8');
const m = fc.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
const Q = JSON.parse(m[1]);

function ra(qs, si) {
  let c = si; const L = ["A","B","C","D"];
  return qs.map(q => {
    let ci = c++ % 4;
    let ct = q.options.find(o=>o.is_correct).text;
    let it = q.options.filter(o=>!o.is_correct).map(o=>o.text);
    let no = []; let ii = 0;
    for(let i=0;i<4;i++) no.push(i===ci?{label:L[i],text:ct,is_correct:true}:{label:L[i],text:it[ii++],is_correct:false});
    q.options=no; if(q.solution) q.solution.final_answer=L[ci]; return q;
  });
}

const energyEnvQ = [
  {topic:"Energy Sources",title:"Renewable vs Non-renewable",question:"Which of the following is considered a non-renewable energy source?",options:[{text:"Natural Gas",is_correct:true},{text:"Geothermal",is_correct:false},{text:"Biomass",is_correct:false},{text:"Hydropower",is_correct:false}],solution:{steps:[{title:"Non-renewable definition",content:"Non-renewable sources are those that are not replenished at a rate comparable to their consumption. Natural gas is a fossil fuel and is non-renewable."}]}},
  {topic:"Environmental Impact",title:"Carbon Footprint",question:"The term 'carbon footprint' primarily refers to:",options:[{text:"The total greenhouse gas emissions caused by an individual, event, organization, or product",is_correct:true},{text:"The amount of carbon sequestered by a forest",is_correct:false},{text:"The physical mark left by carbon mining",is_correct:false},{text:"The amount of solid carbon waste produced by a factory",is_correct:false}],solution:{steps:[{title:"Carbon Footprint Definition",content:"A carbon footprint is a measure of the total greenhouse gases produced, usually expressed in equivalent tons of carbon dioxide ($CO_2$)."}]}},
  {topic:"Energy Sources",title:"Nuclear Energy",question:"Nuclear power plants primarily generate electricity using which process?",options:[{text:"Nuclear fission",is_correct:true},{text:"Nuclear fusion",is_correct:false},{text:"Radioactive decay",is_correct:false},{text:"Chemical combustion",is_correct:false}],solution:{steps:[{title:"Nuclear Power Process",content:"Current commercial nuclear reactors use nuclear fission, where heavy atomic nuclei (like U-235) are split, releasing a large amount of energy as heat."}]}},
  {topic:"Environmental Impact",title:"Life Cycle Assessment",question:"A Life Cycle Assessment (LCA) evaluates the environmental impacts of a product from:",options:[{text:"Raw material extraction through disposal (cradle-to-grave)",is_correct:true},{text:"Manufacturing to sale",is_correct:false},{text:"Purchase to disposal",is_correct:false},{text:"Design to manufacturing",is_correct:false}],solution:{steps:[{title:"LCA Scope",content:"LCA is a 'cradle-to-grave' approach that considers all stages of a product's life, including resource extraction, production, use, and end-of-life disposal or recycling."}]}},
  {topic:"Energy Sources",title:"Solar Photovoltaics",question:"Photovoltaic (PV) cells convert solar energy directly into:",options:[{text:"Electricity",is_correct:true},{text:"Heat",is_correct:false},{text:"Mechanical energy",is_correct:false},{text:"Chemical energy",is_correct:false}],solution:{steps:[{title:"PV Operation",content:"Photovoltaic cells use the photoelectric effect to absorb photons from sunlight and release electrons, directly generating electrical current."}]}},
  {topic:"Environmental Impact",title:"Energy Efficiency",question:"The energy efficiency of a power plant is defined as the ratio of:",options:[{text:"Useful energy output to total energy input",is_correct:true},{text:"Total energy input to useful energy output",is_correct:false},{text:"Electrical output to waste heat",is_correct:false},{text:"Waste heat to total energy input",is_correct:false}],solution:{steps:[{title:"Efficiency Formula",content:"Efficiency $\\eta = \\frac{E_{out}}{E_{in}} \\times 100\\%$, where $E_{out}$ is the useful work or electricity generated and $E_{in}$ is the fuel energy consumed."}]}},
  {topic:"Energy Sources",title:"Wind Power",question:"The power available in the wind is proportional to the wind speed raised to which power?",options:[{text:"Third power (cubed)",is_correct:true},{text:"Second power (squared)",is_correct:false},{text:"First power (linear)",is_correct:false},{text:"Fourth power",is_correct:false}],solution:{steps:[{title:"Wind Power Equation",content:"The theoretical power in wind is $P = \\frac{1}{2} \\rho A v^3$, meaning it is proportional to the cube of the wind speed ($v^3$)."}]}}
];

const modelingQ = [
  {topic:"Optimization",title:"Objective Function",question:"In mathematical optimization, the objective function is the equation that:",options:[{text:"Needs to be maximized or minimized",is_correct:true},{text:"Defines the limitations of the system",is_correct:false},{text:"Sets the variables to zero",is_correct:false},{text:"Represents the feasible region",is_correct:false}],solution:{steps:[{title:"Objective Function",content:"The objective function defines the goal of the optimization problem, such as maximizing profit or minimizing cost."}]}},
  {topic:"Linear Programming",title:"Feasible Region",question:"In a linear programming problem, the feasible region is determined by the:",options:[{text:"Constraints",is_correct:true},{text:"Objective function",is_correct:false},{text:"Decision variables only",is_correct:false},{text:"Optimal solution",is_correct:false}],solution:{steps:[{title:"Feasible Region Definition",content:"The feasible region is the set of all possible points that satisfy all constraints (including non-negativity constraints) of the problem."}]}},
  {topic:"Linear Programming",title:"Corner Point Theorem",question:"According to the Fundamental Theorem of Linear Programming, if an optimal solution exists, it will occur at:",options:[{text:"A corner point (vertex) of the feasible region",is_correct:true},{text:"The center of the feasible region",is_correct:false},{text:"The origin",is_correct:false},{text:"An interior point of the feasible region",is_correct:false}],solution:{steps:[{title:"Corner Point Theorem",content:"The optimal value of a linear objective function over a convex polygon (feasible region) always occurs at one of the vertices."}]}},
  {topic:"Simulation",title:"Monte Carlo Simulation",question:"Monte Carlo simulation relies on which of the following to model complex systems?",options:[{text:"Repeated random sampling",is_correct:true},{text:"Exact analytical solutions",is_correct:false},{text:"Deterministic equations",is_correct:false},{text:"Linear programming algorithms",is_correct:false}],solution:{steps:[{title:"Monte Carlo Method",content:"Monte Carlo methods use repeated random sampling and statistical analysis to estimate outcomes for complex systems that might be difficult to solve deterministically."}]}},
  {topic:"Optimization",title:"Shadow Price",question:"In linear programming, the shadow price (or dual value) of a constraint represents:",options:[{text:"The change in the objective function value per unit increase in the right-hand side of the constraint",is_correct:true},{text:"The cost of producing one additional unit",is_correct:false},{text:"The penalty for not satisfying the constraint",is_correct:false},{text:"The value of the objective function at the origin",is_correct:false}],solution:{steps:[{title:"Shadow Price Definition",content:"The shadow price indicates the marginal value of an additional unit of a constrained resource."}]}},
  {topic:"Simulation",title:"Discrete Event Simulation",question:"In discrete event simulation, the state of the system changes only at:",options:[{text:"Discrete, but possibly irregular, points in time",is_correct:true},{text:"Continuous intervals",is_correct:false},{text:"The beginning of the simulation",is_correct:false},{text:"Regular, fixed time intervals only",is_correct:false}],solution:{steps:[{title:"Discrete Event Concept",content:"A discrete-event simulation models the operation of a system as a sequence of events in time. Each event occurs at a particular instant and marks a change of state."}]}},
  {topic:"Optimization",title:"Local vs Global Optimum",question:"A local optimum is guaranteed to be a global optimum if the optimization problem is:",options:[{text:"Convex",is_correct:true},{text:"Nonlinear",is_correct:false},{text:"Unconstrained",is_correct:false},{text:"Integer",is_correct:false}],solution:{steps:[{title:"Convex Optimization",content:"In convex optimization problems (convex objective function and convex feasible region), any local minimum is also a global minimum."}]}}
];


if (!Q['energy-env']) Q['energy-env'] = [];
Q['energy-env'].push(...ra(energyEnvQ, Q['energy-env'].length));
if (!Q['modeling']) Q['modeling'] = [];
Q['modeling'].push(...ra(modelingQ, Q['modeling'].length));

const nc = fc.replace(/const QUESTIONS = \{[\s\S]*\};?\s*$/, `const QUESTIONS = ${JSON.stringify(Q, null, 4)};\n`);
fs.writeFileSync('questions.js', nc);
console.log(`energy-env: ${Q['energy-env'].length}, modeling: ${Q['modeling'].length}`);
