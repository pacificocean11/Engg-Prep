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

const wwQ = [
  {topic:"Water Treatment",title:"Chlorination Disinfection",question:"Chlorine is added to drinking water primarily to:",options:[{text:"Kill pathogenic microorganisms",is_correct:true},{text:"Remove dissolved iron",is_correct:false},{text:"Reduce turbidity",is_correct:false},{text:"Adjust pH to neutral",is_correct:false}],solution:{steps:[{title:"Chlorination Purpose",content:"Chlorination is the main disinfection method in water treatment, killing bacteria, viruses, and other pathogens."}]}},
  {topic:"Water Treatment",title:"Sedimentation",question:"In water treatment, sedimentation removes particles primarily by:",options:[{text:"Gravity settling",is_correct:true},{text:"Chemical precipitation",is_correct:false},{text:"Biological degradation",is_correct:false},{text:"Membrane filtration",is_correct:false}],solution:{steps:[{title:"Sedimentation",content:"Sedimentation (clarification) allows suspended particles to settle to the bottom of a basin under gravity."}]}},
  {topic:"Wastewater Treatment",title:"BOD Definition",question:"Biochemical Oxygen Demand (BOD) measures:",options:[{text:"The oxygen consumed by microorganisms decomposing organic matter",is_correct:true},{text:"The total dissolved oxygen in water",is_correct:false},{text:"The chemical oxidant demand of water",is_correct:false},{text:"The nitrogen content of wastewater",is_correct:false}],solution:{steps:[{title:"BOD",content:"BOD is a measure of the amount of dissolved oxygen consumed by biological organisms when decomposing organic matter in a given water sample."}]}},
  {topic:"Wastewater Treatment",title:"Primary vs Secondary Treatment",question:"Secondary wastewater treatment primarily removes:",options:[{text:"Dissolved organic matter using biological processes",is_correct:true},{text:"Large solids by physical screening",is_correct:false},{text:"Nutrients (nitrogen and phosphorus)",is_correct:false},{text:"Pathogens through disinfection",is_correct:false}],solution:{steps:[{title:"Secondary Treatment",content:"Secondary treatment uses biological processes (activated sludge, trickling filters) to remove dissolved and colloidal organic matter after primary (physical) treatment."}]}},
  {topic:"Water Treatment",title:"Hardness Removal",question:"Lime-soda softening removes water hardness by:",options:[{text:"Precipitating calcium and magnesium as carbonates and hydroxides",is_correct:true},{text:"Ion exchange with sodium",is_correct:false},{text:"Reverse osmosis",is_correct:false},{text:"Activated carbon adsorption",is_correct:false}],solution:{steps:[{title:"Lime-Soda Process",content:"Adding lime ($Ca(OH)_2$) and soda ash ($Na_2CO_3$) raises pH and precipitates $Ca^{2+}$ as $CaCO_3$ and $Mg^{2+}$ as $Mg(OH)_2$."}]}},
  {topic:"Wastewater Treatment",title:"Activated Sludge Process",question:"In the activated sludge process, what is the purpose of returning sludge to the aeration tank?",options:[{text:"To maintain a sufficient population of microorganisms",is_correct:true},{text:"To aerate the wastewater",is_correct:false},{text:"To neutralize pH",is_correct:false},{text:"To remove nitrogen",is_correct:false}],solution:{steps:[{title:"Return Activated Sludge",content:"Return Activated Sludge (RAS) recycles settled microorganisms back to the aeration basin to maintain high biomass concentration for treatment."}]}},
  {topic:"Water Treatment",title:"Turbidity Removal",question:"Which unit operation in a conventional water treatment plant is primarily responsible for removing turbidity?",options:[{text:"Coagulation-flocculation followed by sedimentation",is_correct:true},{text:"Chlorination",is_correct:false},{text:"pH adjustment",is_correct:false},{text:"Activated carbon adsorption",is_correct:false}],solution:{steps:[{title:"Turbidity Removal",content:"Coagulation neutralizes particle charges and flocculation aggregates them. Subsequent sedimentation removes the floc particles."}]}}
];

const airQ = [
  {topic:"Air Pollutants",title:"Criteria Pollutants",question:"Which of the following is NOT classified as a NAAQS (National Ambient Air Quality Standards) criteria pollutant?",options:[{text:"Carbon dioxide ($CO_2$)",is_correct:true},{text:"Ozone ($O_3$)",is_correct:false},{text:"Sulfur dioxide ($SO_2$)",is_correct:false},{text:"Lead ($Pb$)",is_correct:false}],solution:{steps:[{title:"Criteria Pollutants",content:"The six NAAQS criteria pollutants are: CO, Pb, NO₂, O₃, PM (2.5 and 10), and SO₂. CO₂ is not a criteria pollutant."}]}},
  {topic:"Air Pollutants",title:"Photochemical Smog Formation",question:"Photochemical smog is primarily formed when:",options:[{text:"NOx and VOCs react in sunlight to form ground-level ozone",is_correct:true},{text:"SO₂ reacts with water vapor to form acid rain",is_correct:false},{text:"Carbon monoxide reduces atmospheric oxygen",is_correct:false},{text:"Industrial dust accumulates in still air",is_correct:false}],solution:{steps:[{title:"Smog Formation",content:"NOx + VOCs + UV sunlight → ground-level O₃ and other secondary pollutants (PAN, aldehydes) forming photochemical smog."}]}},
  {topic:"Control Technologies",title:"Cyclone Separator Efficiency",question:"Cyclone separators are most effective for removing particles of:",options:[{text:"Larger diameters (>10 μm)",is_correct:true},{text:"Very fine particles (<1 μm)",is_correct:false},{text:"Gas-phase pollutants",is_correct:false},{text:"Dissolved contaminants",is_correct:false}],solution:{steps:[{title:"Cyclone Efficiency",content:"Cyclones use centrifugal force. Their efficiency drops sharply below 5-10 μm. They are effective and inexpensive pre-cleaners for coarse particles."}]}},
  {topic:"Air Pollutants",title:"Acid Rain Formation",question:"Acid rain is primarily caused by atmospheric reactions involving:",options:[{text:"$SO_2$ and $NO_x$ reacting with water vapor to form acids",is_correct:true},{text:"Carbon monoxide and ozone",is_correct:false},{text:"Particulate matter and ammonia",is_correct:false},{text:"Lead and mercury emissions",is_correct:false}],solution:{steps:[{title:"Acid Rain Chemistry",content:"$SO_2 + H_2O \\rightarrow H_2SO_3$ (sulfurous acid) then $H_2SO_4$. $NO_x + H_2O \\rightarrow HNO_3$ (nitric acid). These lower precipitation pH."}]}},
  {topic:"Control Technologies",title:"Wet Scrubber Operation",question:"A wet scrubber removes pollutants from a gas stream by:",options:[{text:"Contacting the gas with a liquid to absorb or dissolve pollutants",is_correct:true},{text:"Electrostatic precipitation",is_correct:false},{text:"Physical filtration through a fabric",is_correct:false},{text:"Thermal incineration",is_correct:false}],solution:{steps:[{title:"Wet Scrubbers",content:"Wet scrubbers spray liquid (usually water) into the gas stream. Pollutants dissolve or are captured by the liquid droplets. Effective for both gases and particulates."}]}},
  {topic:"Air Pollutants",title:"PM2.5 Health Effects",question:"PM2.5 (fine particulate matter with diameter ≤ 2.5 μm) is considered especially hazardous because:",options:[{text:"It penetrates deep into the lungs and enters the bloodstream",is_correct:true},{text:"It is highly flammable",is_correct:false},{text:"It reflects solar radiation",is_correct:false},{text:"It contains only toxic metals",is_correct:false}],solution:{steps:[{title:"PM2.5 Hazard",content:"PM2.5 is small enough to bypass nasal and bronchial filtering, reaching alveoli and even entering the bloodstream, causing respiratory and cardiovascular disease."}]}}
];

if (!Q['water-wastewater']) Q['water-wastewater'] = [];
Q['water-wastewater'].push(...ra(wwQ, Q['water-wastewater'].length));
if (!Q['air-quality']) Q['air-quality'] = [];
Q['air-quality'].push(...ra(airQ, Q['air-quality'].length));

const nc = fc.replace(/const QUESTIONS = \{[\s\S]*\};?\s*$/, `const QUESTIONS = ${JSON.stringify(Q, null, 4)};\n`);
fs.writeFileSync('questions.js', nc);
console.log(`water-wastewater: ${Q['water-wastewater'].length}, air-quality: ${Q['air-quality'].length}`);
