const fs = require('fs');

const fileRoot = 'd:\\Engg-Prep\\questions.js';

let content = fs.readFileSync(fileRoot, 'utf8');
const prefix = 'const QUESTIONS = ';
const startIndex = content.indexOf(prefix) + prefix.length;
const endIndex = content.lastIndexOf(';');
let jsonString = content.substring(startIndex, endIndex);

let questions;
try {
    questions = JSON.parse(jsonString);
} catch (e) {
    console.error("Error parsing original JSON:", e);
    process.exit(1);
}

const newQuestions = {
    "chem-bio": [
        {
            "topic": "Biological Growth",
            "title": "Monod Kinetics",
            "question": "In biochemical engineering, the 'Monod Equation' ($\\mu = \\frac{\\mu_{max} S}{K_s + S}$) mathematically models exactly how fast a population of bacteria will physically multiply based on the concentration of available food (Substrate, $S$). What physical condition does the constant '$K_s$' explicitly represent?",
            "options": [
                { "label": "A", "text": "The temperature at which the bacteria die", "is_correct": false },
                { "label": "B", "text": "The exact physical concentration of food required for the bacteria to multiply at exactly HALF of their absolute maximum possible speed ($\\mu_{max} / 2$)", "is_correct": true },
                { "label": "C", "text": "The maximum number of bacteria the tank can hold", "is_correct": false },
                { "label": "D", "text": "The amount of oxygen required", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Math Trick", "content": "If you set the Substrate concentration $S = K_s$, the equation becomes $\\mu = \\mu_{max}(K_s) / (2K_s)$. The $K_s$ cancels out, leaving exactly $\\mu_{max} / 2$." },
                    { "title": "The Meaning", "content": "A small $K_s$ value means the bacteria have an extremely high 'affinity' for the food. They can reach their maximum growth speed even when there are only a few crumbs of food floating around in the massive tank." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Bioreactors",
            "title": "Exponential Growth Phase",
            "question": "When a small handful of bacteria is injected into a massive, food-rich bioreactor, they undergo several distinct growth phases (Lag, Exponential, Stationary, Death). During the violent 'Exponential' (Log) phase, the mathematical rate of physical cell generation is strictly proportional to:",
            "options": [
                { "label": "A", "text": "The speed of the mixer propeller", "is_correct": false },
                { "label": "B", "text": "The volume of the tank", "is_correct": false },
                { "label": "C", "text": "The exact physical number of living cells that are currently present in the tank ($dX/dt = \\mu X$)", "is_correct": true },
                { "label": "D", "text": "The square root of the temperature", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Snowball Effect", "content": "One cell splits into two. Two into four. Four into eight. Because every single newly created cell instantly begins reproducing itself, the growth rate violently explodes upward." },
                    { "title": "The Calculus", "content": "The differential equation is $dX/dt = \\mu X$. Integrating this gives $X = X_0 e^{\\mu t}$, which is the absolute classic mathematical definition of unstoppable exponential growth. It continues until the food runs out (Stationary Phase) or they drown in their own toxic waste (Death Phase)." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Cellular Biology",
            "title": "Stoichiometry of Cell Growth",
            "question": "Chemical engineers must treat living bacteria physically like a complex chemical reaction: $Food + O_2 \\rightarrow Cells + CO_2 + Water$. To mass-balance a bioreactor, engineers use the elemental formula of a 'Standard Average Bacteria Cell', which is mathematically approximated as:",
            "options": [
                { "label": "A", "text": "$NaCl$", "is_correct": false },
                { "label": "B", "text": "$H_2O$", "is_correct": false },
                { "label": "C", "text": "$CH_4$", "is_correct": false },
                { "label": "D", "text": "$CH_{1.8}O_{0.5}N_{0.2}$", "is_correct": true }
            ],
            "solution": {
                "steps": [
                    { "title": "The Elemental Composition", "content": "Living cells are mostly water, but the actual dry biomass is made of Carbon, Hydrogen, Oxygen, and Nitrogen (proteins/DNA)." },
                    { "title": "The Balancing Act", "content": "By approximating the physical cell as a single generic molecule ($CH_{1.8}O_{0.5}N_{0.2}$), the engineer can use brutal mathematical stoichiometry to calculate exactly how many pounds of ammonia (Nitrogen) and pounds of sugar (Carbon) must be pumped into the tank every hour to physically build $1000\\text{ kg}$ of fresh bacteria." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Bioreactors",
            "title": "Sterilization",
            "question": "Before injecting a valuable, genetically modified yeast into a $10,000\\text{-gallon}$ bioreactor, the tank MUST be perfectly sterilized using $121^\\circ\\text{C}$ steam. The physical destruction of contaminating wild bacteria mathematically follows strict First-Order decay kinetics ($dN/dt = -k_d N$). Why is this mathematically terrifying for an engineer?",
            "options": [
                { "label": "A", "text": "The mathematical curve is an exponential asymptote ($e^{-kt}$), meaning it mathematically NEVER actually reaches absolutely zero living cells, so the engineer must just cook it long enough to make the statistical probability of a survivor less than 1 in a billion", "is_correct": true },
                { "label": "B", "text": "First-order kinetics means the bacteria multiply while being boiled", "is_correct": false },
                { "label": "C", "text": "The math predicts the tank will explode", "is_correct": false },
                { "label": "D", "text": "The steam turns into acid", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Half-Life Problem", "content": "If you boil a billion cells, a 1-minute 'half-life' leaves $500$ million. Another minute leaves $250$ million. Another leaves $125$ million." },
                    { "title": "The Asymptote", "content": "Because the line curves and perfectly approaches the zero-axis without ever crossing it, it mathematically requires 'infinite' time to kill $100\\%$ of the cells. Engineers use a statistical limit called the 'Del Factor'. Once the math predicts $10^{-3}$ cells are left, they declare the tank 'sterile', because $1/1000$th of a cell physically cannot exist." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Biological Yield",
            "title": "Biomass Yield Coefficient",
            "question": "In a penicillin factory, the yeast physically eats sugar to grow and to produce medicine. Engineers use the Yield Coefficient ($Y_{X/S}$) to track efficiency. Mathematically, $Y_{X/S}$ is the strict ratio of:",
            "options": [
                { "label": "A", "text": "Volume of oxygen consumed divided by the pressure", "is_correct": false },
                { "label": "B", "text": "Mass of new living Cells ($X$) physically generated divided strictly by the mass of Food Substrate ($S$) physically consumed", "is_correct": true },
                { "label": "C", "text": "Time taken divided by temperature", "is_correct": false },
                { "label": "D", "text": "Mass of medicine divided by the mass of water", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Profit Margin", "content": "Sugar costs money. The engineer needs to know exactly how much biomass they get for every dollar of sugar." },
                    { "title": "The Ratio", "content": "If $Y_{X/S} = 0.5$, it means that for every $100\\text{ kg}$ of sugar pumped into the tank, the bacteria physically grew by $50\\text{ kg}$. The other $50\\text{ kg}$ was literally burned as energy and exhaled out of the vent pipe as invisible $CO_2$ gas." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Fermentation",
            "title": "Aerobic vs Anaerobic",
            "question": "Yeast can physically operate in two different thermodynamic modes. In an 'Aerobic' bioreactor (air aggressively bubbled in), yeast converts sugar into massive amounts of new yeast cells. However, in an 'Anaerobic' tank (zero oxygen), the yeast mathematically and physically cannot fully burn the sugar, resulting in the massive accumulation of:",
            "options": [
                { "label": "A", "text": "Solid iron", "is_correct": false },
                { "label": "B", "text": "Nitrogen gas", "is_correct": false },
                { "label": "C", "text": "A toxic, half-burned energy byproduct known as Ethanol (Alcohol)", "is_correct": true },
                { "label": "D", "text": "Pure gold", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Oxygen Fire", "content": "With Oxygen, yeast burns sugar completely into $CO_2$ and Water, extracting massive energy ($36\\text{ ATP}$) to rapidly build millions of new cells." },
                    { "title": "The Suffocation", "content": "Without Oxygen, they resort to emergency fermentation. They only extract $2\\text{ ATP}$ of energy, leaving $95\\%$ of the sugar's energy locked inside the molecule. They spit out this half-burned, high-energy garbage molecule into the tank. That molecule is Ethanol. This is literally how all beer and wine is manufactured." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Enzymes",
            "title": "Competitive Inhibition",
            "question": "In biochemistry, enzymes are protein robots that grab molecules (substrates) into a physical 'Active Site' and mathematically break them apart. In 'Competitive Inhibition', a toxic drug is injected into the patient. How does this drug mathematically slow down the enzyme?",
            "options": [
                { "label": "A", "text": "It explodes the enzyme", "is_correct": false },
                { "label": "B", "text": "It freezes the water in the cell", "is_correct": false },
                { "label": "C", "text": "It lowers the body temperature", "is_correct": false },
                { "label": "D", "text": "The drug is physically shaped identically to the real food, allowing it to jam itself perfectly into the active site, physically blocking the real food from entering", "is_correct": true }
            ],
            "solution": {
                "steps": [
                    { "title": "The Keyhole", "content": "An enzyme is a lock. The substrate is the key. They must match perfectly." },
                    { "title": "The Sabotage", "content": "A Competitive Inhibitor is a fake key that fits into the lock, but won't turn. While the fake key is stuck in the lock, the real food cannot get processed. Mathematically, this artificially inflates the $K_m$ value, making the enzyme appear incredibly sluggish and inefficient. This is how many lethal poisons and life-saving medicines operate." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Bioreactors",
            "title": "Oxygen Mass Transfer (kLa)",
            "question": "The absolute biggest physical bottleneck in a massive $50,000\\text{L}$ aerobic bioreactor is getting oxygen gas to dissolve into the thick, soupy liquid fast enough to keep the bacteria from suffocating. The mathematical equation is $OTR = k_L a (C^* - C_L)$. What does the '$a$' variable explicitly represent?",
            "options": [
                { "label": "A", "text": "The geometric total interfacial Surface Area of every single individual air bubble floating in the tank, divided by the tank volume", "is_correct": true },
                { "label": "B", "text": "The acceleration of gravity", "is_correct": false },
                { "label": "C", "text": "The age of the bacteria", "is_correct": false },
                { "label": "D", "text": "The atomic weight of oxygen", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Surface Area Problem", "content": "Oxygen cannot teleport into the water. It can ONLY physically cross the liquid barrier at the exact surface of an air bubble." },
                    { "title": "The Engineering Solution", "content": "If you pump a single giant beach-ball sized bubble into the tank, the surface area ('$a$') is tiny, and the bacteria suffocate. Engineers use massive, violent, high-speed propellers (impellers) to violently smash that big bubble into $10$ million microscopic microscopic bubbles. This mathematically causes the total surface area ('$a$') to astronomically explode, massively multiplying the oxygen transfer rate." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Chemostat",
            "title": "Washout",
            "question": "A 'Chemostat' is a continuous biological CSTR where fresh food is constantly pumped in, and liquid (containing live bacteria) is constantly pumped out. Mathematically, if an engineer turns the pump flow rate ($F$) up too high, they will trigger a catastrophic failure known as 'Washout'. What physically happens?",
            "options": [
                { "label": "A", "text": "The tank overflows onto the floor", "is_correct": false },
                { "label": "B", "text": "The bacteria get too clean", "is_correct": false },
                { "label": "C", "text": "The fluid is physically flushing out of the tank faster than the mathematical maximum speed ($u_{max}$) at which the bacteria can reproduce, causing the entire population to be literally pumped down the drain to extinction", "is_correct": true },
                { "label": "D", "text": "The water boils away", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Treadmill", "content": "The bacteria are running on a treadmill. They must reproduce fast enough to replace the cells that are being sucked out the exit pipe." },
                    { "title": "The Speed Limit", "content": "Even with infinite food, bacteria have a maximum biological speed limit ($u_{max}$, perhaps 1 division every 20 minutes). If the engineer sets the tank to completely flush every 15 minutes ($D > u_{max}$), the math is unforgiving. Every cell will be washed out before it can divide, leaving a completely dead, empty tank of pure sugar water." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Cellular Biology",
            "title": "ATP (Adenosine Triphosphate)",
            "question": "Inside every living biological cell, the molecule ATP acts as the universal physical 'currency' of energy. Thermodynamically, how does ATP mathematically store and release massive amounts of energy to power the cell's machinery?",
            "options": [
                { "label": "A", "text": "It undergoes nuclear fusion", "is_correct": false },
                { "label": "B", "text": "By storing intense physical electrostatic repulsion energy inside its three negatively-charged Phosphate groups; snapping the third phosphate off acts like releasing a tightly coiled physical spring", "is_correct": true },
                { "label": "C", "text": "It acts as a microscopic magnet", "is_correct": false },
                { "label": "D", "text": "It burns like a tiny candle", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Coil", "content": "Phosphate groups are highly negatively charged. Putting three of them right next to each other is physically like trying to glue three 'North' magnets together. They violently repel each other." },
                    { "title": "The Snap", "content": "When the cell needs energy to flex a muscle, it uses an enzyme to snip off the third phosphate. The violent 'spring-loaded' snapping apart of the molecule instantly releases exactly $7.3\\text{ kcal/mol}$ of pure thermodynamic energy. The cell then uses food energy to painfully shove the phosphate back on, recharging the battery." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Bioreactors",
            "title": "Scale-Up Challenges",
            "question": "A chemical engineer successfully grows genetically modified insulin-producing bacteria in a small $1\\text{-Liter}$ glass flask in the lab. When they try to 'Scale-Up' the exact same math to a $100,000\\text{-Liter}$ steel factory tank, the bacteria instantly die. What is the most common physical failure in massive geometric bioreactor scale-up?",
            "options": [
                { "label": "A", "text": "The steel is toxic", "is_correct": false },
                { "label": "B", "text": "The bacteria get dizzy", "is_correct": false },
                { "label": "C", "text": "The Volume mathematically scales as the Cube ($r^3$) while the Surface Area scales only as the Square ($r^2$), making it physically impossible to remove the massive heat generated by $100,000\\text{L}$ of living cells without boiling them alive", "is_correct": true },
                { "label": "D", "text": "The gravity is higher in a big tank", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Square-Cube Law", "content": "A $1\\text{L}$ flask has massive surface area compared to its tiny volume. Heat easily escapes through the glass." },
                    { "title": "The Giant Insulator", "content": "If you multiply the radius by $100$, the Volume (heat generating bacteria) explodes by $1,000,000\\times$. But the Surface Area (cooling jacket) only increases by $10,000\\times$. The tank is mathematically producing $100$ times more heat than the walls can physically remove. The core of the tank hits $60^\\circ\\text{C}$ and the cells violently rupture." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Biological Growth",
            "title": "Death Phase (Endogenous Metabolism)",
            "question": "If a Batch Bioreactor is left running long after the sugar supply hits absolute zero, the bacteria enter the 'Death Phase'. However, the cell mass ($X$) does not drop to zero instantly; it slowly decays. Physically and mathematically, what is the bacteria doing during this phase to stay alive?",
            "options": [
                { "label": "A", "text": "They perform photosynthesis", "is_correct": false },
                { "label": "B", "text": "They enter a state of 'Endogenous Metabolism', physically cannibalizing their own internal cellular proteins and eating their dead neighbors to survive, resulting in a strict mathematical first-order mass decay", "is_correct": true },
                { "label": "C", "text": "They eat the steel walls of the tank", "is_correct": false },
                { "label": "D", "text": "They split water into hydrogen and oxygen", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Starvation", "content": "When food hits zero, the cells don't all magically die on the same second." },
                    { "title": "The Cannibalism", "content": "To keep their basic life-support systems running (maintenance energy), they literally start eating their own internal reserves (Endogenous decay). When those run out, they die, rupture, and dump their guts into the water, which the surviving cells instantly eat. This creates a slow, mathematically predictable exponential decay curve." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Enzymes",
            "title": "Turnover Number (kcat)",
            "question": "In the Michaelis-Menten enzyme equation ($-r = \\frac{k_{cat} [E_0] [S]}{K_m + [S]}$), the constant '$k_{cat}$' is known as the Turnover Number. Physically, what does the Turnover Number explicitly measure?",
            "options": [
                { "label": "A", "text": "The weight of the enzyme", "is_correct": false },
                { "label": "B", "text": "The temperature of the cell", "is_correct": false },
                { "label": "C", "text": "The absolute maximum number of substrate molecules that ONE SINGLE physical enzyme robot can mathematically snatch, break, and throw away every single second when running at absolute maximum speed", "is_correct": true },
                { "label": "D", "text": "The number of hours the enzyme lives", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Speed Limit", "content": "If a factory worker can build $5$ cars an hour, $k_{cat} = 5$." },
                    { "title": "The Biological Extremes", "content": "Some enzymes are slow ($k_{cat} = 2$ per second). Others, like Catalase (which destroys toxic hydrogen peroxide in your blood), have a terrifying $k_{cat}$ of $40,000,000$ per second. A single microscopic protein physically violently shatters forty million molecules every single second to keep you alive." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Biological Yield",
            "title": "Maintenance Energy",
            "question": "When an engineer calculates the theoretical biological yield of a cell, the math rarely matches the physical reality of the tank. The bacteria ALWAYS consume slightly more sugar than the math predicts. This is due to the mathematical 'Maintenance Energy' ($m_s$). Physically, what is this sugar being used for?",
            "options": [
                { "label": "A", "text": "It is evaporating into the air", "is_correct": false },
                { "label": "B", "text": "It is burned purely to repair cellular damage, pump ions, and keep the cell alive without generating absolutely any new physical biomass or reproduction", "is_correct": true },
                { "label": "C", "text": "It is converted into diamonds", "is_correct": false },
                { "label": "D", "text": "It is destroyed by the mixer blades", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Idle Engine", "content": "If you park your car and leave the engine running, you are burning gasoline (Sugar) but you are moving zero miles (Zero new cells built)." },
                    { "title": "The Cellular Tax", "content": "Even when a cell is not multiplying, it has to constantly run ion pumps to stop from exploding due to osmosis, and it has to constantly rebuild proteins that degrade. This physical 'cost of living' tax is mathematically subtracted from the sugar supply before any reproduction can occur." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass and Energy Balances",
            "title": "Degrees of Freedom Analysis",
            "question": "Before attempting to mathematically solve a complex chemical plant flowchart with 15 intersecting pipes, an engineer MUST perform a 'Degrees of Freedom' (DOF) analysis. The mathematical equation is $DOF = (Number\\_of\\_Unknowns) - (Number\\_of\\_Independent\\_Equations)$. If the calculated $DOF$ is EXACTLY ZERO, what does this mathematically guarantee?",
            "options": [
                { "label": "A", "text": "The plant will explode", "is_correct": false },
                { "label": "B", "text": "The problem has infinite solutions", "is_correct": false },
                { "label": "C", "text": "The problem is perfectly specified and the engineer can successfully use algebra to uniquely solve for every single unknown physical flow rate and concentration in the entire factory", "is_correct": true },
                { "label": "D", "text": "The problem is physically impossible to solve", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Algebraic Rule", "content": "If you have $3$ unknown variables ($x, y, z$), you absolutely must have exactly $3$ unique equations to solve the system." },
                    { "title": "The Danger of DOF", "content": "If $DOF > 0$, you are missing information (like a flow rate) and the math is impossible. If $DOF < 0$, the system is 'Over-specified', meaning the measurements you wrote down mathematically contradict each other and you violated the laws of physics." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Balances",
            "title": "Recycle Streams",
            "question": "In almost every single industrial chemical plant, engineers physically pipe the exit stream of a Separator backward to the front of the Reactor. This is called a 'Recycle Stream'. What is the absolute primary economic and mathematical purpose of a Recycle stream?",
            "options": [
                { "label": "A", "text": "To violently heat up the fluid", "is_correct": false },
                { "label": "B", "text": "To mathematically increase the 'Overall' plant conversion to near $100\\%$ by capturing unreacted, expensive raw materials from the exhaust and forcing them physically back through the reactor for a second chance", "is_correct": true },
                { "label": "C", "text": "To change the color of the product", "is_correct": false },
                { "label": "D", "text": "To decrease the pressure in the pipes", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Single-Pass Failure", "content": "Because of thermodynamic equilibrium, a reactor might only convert $20\\%$ of the gas on a 'Single-Pass'. If you just vent the exhaust, you throw $80\\%$ of your million-dollar raw materials into the atmosphere." },
                    { "title": "The Loop", "content": "You put a separator after the reactor. It pulls out the $20\\%$ valuable product. The remaining $80\\%$ unreacted gas is piped backward into the entrance. Over continuous loops, the 'Overall' mathematical conversion approaches $99\\%$, maximizing extreme corporate profit." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Balances",
            "title": "Purge Streams",
            "question": "Whenever an engineer uses a Recycle Stream, they are mathematically forced to install a 'Purge Stream' (a tiny pipe that permanently vents a small fraction of the recycle gas into the atmosphere). If the engineer physically closes the Purge valve completely, what catastrophic mathematical event will eventually destroy the plant?",
            "options": [
                { "label": "A", "text": "The reactor will freeze solid", "is_correct": false },
                { "label": "B", "text": "Inert, useless trace impurities entering with the fresh feed will get trapped in the recycle loop, mathematically accumulating to infinity until they physically choke the entire reactor to death", "is_correct": true },
                { "label": "C", "text": "The catalyst will dissolve", "is_correct": false },
                { "label": "D", "text": "The product will turn into pure water", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Trapped Gas", "content": "If the fresh feed contains $99\\%$ reactant and $1\\%$ useless Argon gas, the Argon goes through the reactor, does nothing, and gets recycled. The next hour, more Argon enters. It gets trapped in the loop." },
                    { "title": "The Build Up", "content": "Without a purge, the Argon mathematically accumulates forever. Soon the tank is $10\\%$ Argon, then $50\\%$, then $90\\%$ Argon. The reactor pressure explodes and the reaction completely dies. The Purge stream acts as a kidney, constantly bleeding off a tiny amount of gas just to physically drag the trapped Argon out of the loop." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Balances",
            "title": "Overall vs Single-Pass Conversion",
            "question": "In a recycle system, the 'Single-Pass Conversion' measures exactly what happens strictly across the reactor itself. The 'Overall Conversion' measures the entire plant from fresh feed to final exit. Mathematically, how do these two numbers almost always compare?",
            "options": [
                { "label": "A", "text": "They are exactly equal", "is_correct": false },
                { "label": "B", "text": "Single-Pass is always $100\\%$", "is_correct": false },
                { "label": "C", "text": "The Overall Conversion is mathematically vastly HIGHER than the Single-Pass Conversion because the unreacted materials are forced to go through the reactor multiple times", "is_correct": true },
                { "label": "D", "text": "Overall Conversion is mathematically zero", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Ammonia Plant", "content": "In the Haber-Bosch process, the reactor only converts $15\\%$ of the Nitrogen gas into Ammonia on a single pass ($15\\%$ Single-Pass conversion)." },
                    { "title": "The Magic of Recycle", "content": "Because the remaining $85\\%$ is perfectly separated and looped back indefinitely, virtually none of the Nitrogen ever escapes the building. The plant boundary mathematically achieves a $98\\%$ Overall Conversion, despite the physical reactor being incredibly weak." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Energy Balances",
            "title": "Standard Heat of Formation",
            "question": "To perform a mathematical Energy Balance on a massive chemical explosion, an engineer uses the 'Standard Heat of Formation' ($\\Delta H_f^\circ$) for every molecule. What explicit physical state is mathematically assigned a Heat of Formation of exactly ZERO?",
            "options": [
                { "label": "A", "text": "Liquid water at boiling", "is_correct": false },
                { "label": "B", "text": "Carbon dioxide gas", "is_correct": false },
                { "label": "C", "text": "Pure elemental substances completely stable in their natural physical state at room temperature (like $O_2$ gas, solid Carbon graphite, or $N_2$ gas)", "is_correct": true },
                { "label": "D", "text": "Any gas at absolute zero temperature", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Baseline", "content": "You cannot measure 'Absolute' energy, you can only measure differences. You need an arbitrary starting line (zero)." },
                    { "title": "The Pure Elements", "content": "Engineers globally agreed that nature provides pure $O_2$ gas and solid Carbon for 'free'. Therefore, it takes exactly $0\\text{ Joules}$ to 'form' them. But if you want to smash them together to form a complex molecule like Glucose, it requires a massive change in energy ($\\Delta H_f$). The math calculates the energy released by tracking how far the molecules deviate from the pure zero baseline." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Energy Balances",
            "title": "Heat of Reaction from Heats of Formation",
            "question": "Hess's Law states that the mathematical total Heat of Reaction ($\\Delta H_{rxn}^\circ$) is independent of the pathway. The absolute most fundamental mathematical formula an engineer uses to calculate the total heat released by ANY reaction is:",
            "options": [
                { "label": "A", "text": "Pressure times Volume", "is_correct": false },
                { "label": "B", "text": "The mathematical Sum of the Heats of Formation of all the PRODUCTS, strictly minus the Sum of the Heats of Formation of all the REACTANTS", "is_correct": true },
                { "label": "C", "text": "The mass divided by temperature", "is_correct": false },
                { "label": "D", "text": "The integral of gravity", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Equation", "content": "$\\Delta H_{rxn} = \\sum (n \\cdot \\Delta H_f)_{products} - \\sum (n \\cdot \\Delta H_f)_{reactants}$." },
                    { "title": "The Logic", "content": "You mathematically pretend you completely shattered all the Reactants down into pure elemental dust (costing energy), and then you rebuilt that dust into the new Products (releasing energy). The difference between the rebuilding energy and the shattering energy is exactly how much heat shoots out of the physical reactor." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Balances",
            "title": "Theoretical Air in Combustion",
            "question": "When burning massive quantities of Methane ($CH_4$) in a power plant, engineers mathematically calculate the 'Theoretical Air' required. What is the explicit physical and mathematical definition of $100\\%$ Theoretical Air?",
            "options": [
                { "label": "A", "text": "Filling the entire room with oxygen", "is_correct": false },
                { "label": "B", "text": "Using a vacuum chamber", "is_correct": false },
                { "label": "C", "text": "The exact, perfectly balanced stoichiometric mathematical minimum amount of Oxygen (and accompanying Nitrogen) required to physically burn absolutely every single Carbon atom into exactly $CO_2$ and every Hydrogen into exactly $H_2O$, with exactly zero Oxygen left over", "is_correct": true },
                { "label": "D", "text": "Blowing wind over the fire", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Stoichiometric Balance", "content": "$CH_4 + 2 O_2 \\rightarrow CO_2 + 2 H_2O$. The math says you need exactly $2\\text{ moles}$ of $O_2$ for every $1\\text{ mole}$ of Methane. That is $100\\%$ theoretical oxygen." },
                    { "title": "The Real World Excess", "content": "If you inject exactly $100\\%$ in a real physical furnace, the gases won't mix perfectly, and you will get lethal Carbon Monoxide ($CO$) from half-burned fuel. Real plants always inject '$120\\%$ Excess Air' to mathematically guarantee a massive surplus of Oxygen, ensuring every fuel molecule finds a partner." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Balances",
            "title": "Bypass Streams",
            "question": "While a Recycle stream loops fluid backward, a 'Bypass Stream' splits the fresh feed pipe, sending half the fluid through the reactor and mathematically piping the other half straight to the exit, skipping the reactor entirely. What is the physical engineering purpose of a Bypass stream?",
            "options": [
                { "label": "A", "text": "To increase the reaction rate", "is_correct": false },
                { "label": "B", "text": "To violently boil the fluid", "is_correct": false },
                { "label": "C", "text": "To precisely and mathematically control the exact final concentration or temperature of the exit stream by mixing heavily processed fluid with untouched raw fluid at the very end", "is_correct": true },
                { "label": "D", "text": "To slow down the reactor", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Orange Juice Example", "content": "If a machine concentrates orange juice, it ruins the flavor. They concentrate $80\\%$ of the juice into a thick paste, bypass the other $20\\%$ as fresh raw juice, and mix them at the end. The fresh juice mathematically restores the exact perfect flavor profile while still being concentrated." },
                    { "title": "The Air Conditioning Example", "content": "In HVAC, an AC coil might freeze the air to $40^\\circ\\text{F}$ to remove humidity. That's too cold for a room. You bypass $30\\%$ of the warm $80^\\circ\\text{F}$ room air around the coil and mix it back in, delivering perfectly mathematically blended $68^\\circ\\text{F}$ air to the vents." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Energy Balances",
            "title": "Latent Heat vs Sensible Heat",
            "question": "In an Enthalpy ($H$) balance of a distillation column, the engineer must mathematically sum up the 'Sensible Heat' and the 'Latent Heat'. What is the exact physical thermodynamic difference between these two mathematical terms?",
            "options": [
                { "label": "A", "text": "They are exactly the same thing", "is_correct": false },
                { "label": "B", "text": "Sensible heat is mathematically calculated using $m C_p \\Delta T$ and physically causes the thermometer to rise; Latent heat is calculated using $m \\Delta H_{vap}$ and physically causes a massive Phase Change (boiling/condensing) while the temperature stays mathematically locked at a constant flatline", "is_correct": true },
                { "label": "C", "text": "Sensible heat is imaginary, Latent is real", "is_correct": false },
                { "label": "D", "text": "Sensible heat only applies to solids", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Sensible (Sensing)", "content": "If the temperature goes from $20^\\circ$ to $80^\\circ$, you can 'sense' the change. The math is $Q = m C_p \\Delta T$." },
                    { "title": "Latent (Hidden)", "content": "When water boils at $100^\\circ$, you are blasting it with fire, but the thermometer stays exactly at $100^\\circ$. The heat is mathematically 'hidden' in the ripping apart of the atomic bonds to form a gas. The equation is $Q = m \\Delta H_{vap}$. This phase change requires astronomically more energy than just warming the water up." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Balances",
            "title": "Accumulation Term",
            "question": "The absolute most fundamental mathematical law of chemical engineering is the General Balance Equation: $IN - OUT + GENERATION - CONSUMPTION = ACCUMULATION$. If a giant water tank is operating at perfect mathematical 'Steady-State', what does the Accumulation term physically equal?",
            "options": [
                { "label": "A", "text": "Infinity", "is_correct": false },
                { "label": "B", "text": "The volume of the tank", "is_correct": false },
                { "label": "C", "text": "Exactly Zero ($0.0$); meaning the physical water level inside the tank is perfectly mathematically frozen in place, never rising or falling", "is_correct": true },
                { "label": "D", "text": "The flow rate", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Bathtub Analogy", "content": "If you turn the faucet on (IN = $5\\text{ gal/min}$) and open the drain (OUT = $3\\text{ gal/min}$), the Accumulation is $+2\\text{ gal/min}$. The physical water level is actively rising over time. This is a Transient (unsteady) state." },
                    { "title": "Steady State", "content": "If you open the drain exactly to $5\\text{ gal/min}$, IN equals OUT. Accumulation = $0$. The math $d(Mass)/dt = 0$ means the system is locked in perfect physical equilibrium. $99\\%$ of all chemical plants are designed to operate exclusively in Steady-State." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Energy Balances",
            "title": "Heat Capacity (Cp vs Cv)",
            "question": "When heating a gas, there are mathematically two different Specific Heats: $C_p$ (Constant Pressure) and $C_v$ (Constant Volume). For any gas, $C_p$ is mathematically ALWAYS physically LARGER than $C_v$. Why does it physically require more energy to heat a gas at Constant Pressure?",
            "options": [
                { "label": "A", "text": "Because the gas changes color", "is_correct": false },
                { "label": "B", "text": "Because Constant Pressure requires the physical container to violently expand like a balloon against the heavy atmosphere; the fire must provide energy to heat the gas PLUS extra energy to physically perform the mechanical Work of expanding the balloon", "is_correct": true },
                { "label": "C", "text": "Because the gravity is stronger", "is_correct": false },
                { "label": "D", "text": "Because it creates a vacuum", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Constant Volume ($C_v$)", "content": "If you heat a gas in a sealed steel titanium box, $100\\%$ of the fire's energy goes straight into speeding up the atoms (raising the temperature)." },
                    { "title": "Constant Pressure ($C_p$)", "content": "If you heat a gas in a piston, the gas expands to keep the pressure flat. As it expands, it physically pushes the heavy steel piston upward. Pushing steel is mechanical Work ($W = P\\Delta V$). The fire has to do two jobs: heat the atoms, AND lift the heavy steel. Therefore, you must pump mathematically more total heat ($C_p$) into the gas to reach the same temperature." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Energy Balances",
            "title": "Open System Energy Balance",
            "question": "When performing a mathematical First Law Energy Balance on a massive, spinning Steam Turbine, engineers use the 'Open System' equation: $\\Delta H = Q - W$. Why is the mathematical property Enthalpy ($H$) used here instead of Internal Energy ($U$)?",
            "options": [
                { "label": "A", "text": "Because $U$ is imaginary", "is_correct": false },
                { "label": "B", "text": "Because the fluid is violently flowing through pipes; Enthalpy mathematically combines the internal heat energy ($U$) WITH the massive physical 'Flow Work' ($PV$) required to physically shove the fluid into and out of the high-pressure steel pipes", "is_correct": true },
                { "label": "C", "text": "Because the turbine is cold", "is_correct": false },
                { "label": "D", "text": "Because $H$ is easier to spell", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Flow Work", "content": "Imagine injecting a syringe of water into a high-pressure submarine at the bottom of the ocean. The water has its own internal heat ($U$), but you must also expend massive physical mechanical energy just to shove it against the crushing pressure ($P \\times V$)." },
                    { "title": "The Enthalpy Shortcut", "content": "In any flowing pipe, the fluid carries both $U$ and $PV$. Engineers got tired of writing $U + PV$ thousands of times, so they mathematically invented Enthalpy ($H = U + PV$) to combine them into one single, powerful thermodynamic property." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Transfer",
            "title": "Fick's First Law of Diffusion",
            "question": "Fick's First Law ($J_A = -D_{AB} \\frac{dC_A}{dx}$) is the absolute governing mathematical equation for all chemical diffusion. What physical driving force mathematically dictates the exact speed ($J_A$) at which a chemical physically diffuses through a liquid?",
            "options": [
                { "label": "A", "text": "The magnetic field", "is_correct": false },
                { "label": "B", "text": "The speed of sound", "is_correct": false },
                { "label": "C", "text": "The Concentration Gradient (the physical steepness of the difference between an area of extremely high chemical concentration and an area of zero concentration)", "is_correct": true },
                { "label": "D", "text": "The color of the dye", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Gravity Analogy", "content": "Just like Heat ($q$) is violently driven by a Temperature difference ($dT/dx$), Mass Diffusion ($J_A$) is violently driven by a Concentration difference ($dC/dx$)." },
                    { "title": "The Mechanism", "content": "If you put a drop of pure red dye in a pool, the concentration is $100\\%$ in the drop and $0\\%$ in the water. The gradient is infinitely steep. The dye molecules violently explode outward to mathematically equalize the chaos (increasing entropy). The coefficient '$D_{AB}$' just measures how easily the molecule can slip through the water atoms." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Distillation",
            "title": "Relative Volatility",
            "question": "A massive industrial Distillation Column separates liquid chemicals by boiling them. The mathematical ability of the column to successfully separate Chemical A from Chemical B depends entirely on their 'Relative Volatility' ($\\alpha_{AB}$). If $\\alpha_{AB}$ is exactly mathematically equal to $1.0$, what physically happens in the tower?",
            "options": [
                { "label": "A", "text": "The chemicals explode", "is_correct": false },
                { "label": "B", "text": "Chemical A boils instantly", "is_correct": false },
                { "label": "C", "text": "Separation becomes mathematically and physically IMPOSSIBLE by standard distillation, because both chemicals physically boil and vaporize at the exact same rate, creating an 'Azeotrope'", "is_correct": true },
                { "label": "D", "text": "The column freezes", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Boiling Race", "content": "Distillation is a race. The lighter chemical (A) wants to boil faster than the heavy chemical (B). If $\\alpha = 2.0$, A boils twice as fast. The vapor floating up the tower is rich in A, and the liquid falling down is rich in B. Separation works perfectly." },
                    { "title": "The Azeotrope Trap", "content": "If $\\alpha = 1.0$, the vapor boiling off the liquid has the EXACT same $50/50$ ratio as the liquid itself. Boiling it a million times changes nothing. This is exactly why you cannot distill Alcohol past $95\\%$ purity; it hits an azeotrope and mathematically refuses to separate from the water." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Distillation",
            "title": "McCabe-Thiele Method",
            "question": "The McCabe-Thiele plot is a famous graphical mathematical method used to physically design Distillation Columns. On this plot, the engineer draws 'stair-steps' between the Operating Line and the Equilibrium Curve. What does each physical 'stair-step' explicitly mathematically represent?",
            "options": [
                { "label": "A", "text": "One hour of time", "is_correct": false },
                { "label": "B", "text": "One pound of liquid", "is_correct": false },
                { "label": "C", "text": "One physical, theoretical 'Tray' (or plate) inside the massive steel distillation tower", "is_correct": true },
                { "label": "D", "text": "One degree of temperature", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Equilibrium Stage", "content": "Inside a tower, liquid sits on a metal tray. Hot vapor bubbles up through the liquid. They touch, mix, and mathematically reach thermodynamic equilibrium before separating again. This is one 'stage'." },
                    { "title": "The Staircase", "content": "On the graph, dropping a vertical line is the liquid falling to the next tray. Moving horizontally is the vapor boiling up to the next tray. If the engineer has to draw $12$ steps to get from $50\\%$ purity to $99\\%$ purity on the graph, they must physically hire welders to install exactly $12$ steel trays inside the real tower." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Distillation",
            "title": "Reflux Ratio",
            "question": "At the very top of a Distillation Column, the pure vapor is condensed into a liquid. The engineer then physically splits this liquid: some is sold as product, but a massive amount is violently dumped backward down into the top of the tower. This mathematical ratio is the 'Reflux Ratio' ($R = L/D$). What is the physical engineering purpose of Reflux?",
            "options": [
                { "label": "A", "text": "To clean the pipes", "is_correct": false },
                { "label": "B", "text": "To mathematically provide the necessary liquid down-flow that physically contacts and 'washes' the rising vapor, which is thermodynamically required to achieve high-purity separation", "is_correct": true },
                { "label": "C", "text": "To increase the pressure", "is_correct": false },
                { "label": "D", "text": "It is an accident", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Washing Machine", "content": "A distillation tower requires vapor going UP, and liquid washing DOWN. If you don't pour liquid down the top, the top trays go bone dry. Dry trays do absolutely zero separation." },
                    { "title": "The Economic Tradeoff", "content": "If you increase the Reflux Ratio (dumping $90\\%$ of your pure product back in), the separation purity mathematically skyrockets, requiring very few steel trays. But you must burn astronomical amounts of steam at the bottom to re-boil all that liquid. High Reflux = High Energy Bill. Low Reflux = Tall, Expensive Tower." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Transfer",
            "title": "Gas Absorption",
            "question": "In a Gas Absorption tower (a 'Scrubber'), a chemical engineer sprays massive amounts of pure liquid water down a tower while toxic, dirty exhaust gas (like Ammonia mixed with Air) blows upward. Physically and mathematically, what drives the toxic Ammonia gas to violently transfer OUT of the air and INTO the liquid water?",
            "options": [
                { "label": "A", "text": "Gravity", "is_correct": false },
                { "label": "B", "text": "Magnetic attraction", "is_correct": false },
                { "label": "C", "text": "The mathematical solubility difference (Henry's Law); the Ammonia is physically highly soluble in water but the Air is not, creating a massive concentration gradient driving force", "is_correct": true },
                { "label": "D", "text": "The water is boiling", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Sponge", "content": "Water acts like a chemical sponge that specifically loves Ammonia molecules but ignores Nitrogen molecules." },
                    { "title": "The Gradient", "content": "Because the falling water has $0\\%$ Ammonia, and the rising gas has $10\\%$ Ammonia, the concentration gradient violently forces the Ammonia molecules to physically diffuse across the gas-liquid boundary layer into the water droplets. The gas exits the top perfectly clean, and the toxic Ammonia water exits the bottom for treatment." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Transfer",
            "title": "Liquid-Liquid Extraction",
            "question": "When distillation is impossible (because the chemicals explode when heated), engineers use 'Liquid-Liquid Extraction'. They pour a second, special 'Solvent' liquid into the tank. What is the fundamental physical requirement for this mathematical separation to actually work?",
            "options": [
                { "label": "A", "text": "The two liquids must violently boil", "is_correct": false },
                { "label": "B", "text": "The two liquids must mathematically be completely IMMISCIBLE (like oil and water, they physically refuse to mix) AND the target chemical must have a mathematically higher affinity to jump into the new solvent", "is_correct": true },
                { "label": "C", "text": "Both liquids must be the exact same color", "is_correct": false },
                { "label": "D", "text": "The liquids must turn into a solid", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Kidnapping", "content": "You have Chemical A trapped in Water. You cannot boil the water. So you pour in an organic Oil. The oil and water physically separate into two distinct layers." },
                    { "title": "The Partition Coefficient", "content": "Chemical A happens to mathematically 'love' the Oil 100 times more than it loves the Water ($K = 100$). Because of this thermodynamic affinity, $99\\%$ of Chemical A physically diffuses across the boundary into the Oil layer. You then simply drain the water layer out the bottom, and you have successfully stolen Chemical A using zero heat." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Transfer",
            "title": "Membrane Separation",
            "question": "In modern Reverse Osmosis (RO) water desalination plants, seawater is physically shoved against a microscopic polymer membrane. To mathematically force the pure water molecules through the plastic while blocking the salt, the engineer MUST apply a massive physical pump pressure that strictly exceeds:",
            "options": [
                { "label": "A", "text": "The vapor pressure of water", "is_correct": false },
                { "label": "B", "text": "The boiling point", "is_correct": false },
                { "label": "C", "text": "The mathematical 'Osmotic Pressure' ($\\pi$) of the concentrated saltwater, which is the natural thermodynamic force of the water trying to flow backward to dilute the salt", "is_correct": true },
                { "label": "D", "text": "The speed of sound", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Law of Osmosis", "content": "Nature hates concentration differences. If you put pure water and saltwater on opposite sides of a membrane, the pure water will physically push its way THROUGH the plastic into the saltwater trying to dilute it. This natural pushing force is called Osmotic Pressure." },
                    { "title": "Reverse Osmosis", "content": "To get drinking water, the engineer has to fight nature. They must use massive $1000\\text{ PSI}$ electrical pumps on the saltwater side to violently overpower the natural Osmotic Pressure, physically crushing the water molecules backward through the microscopic pores of the plastic, leaving the large salt ions trapped behind." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Mass Transfer",
            "title": "Two-Film Theory",
            "question": "When a gas molecule physically transfers into a liquid (like $O_2$ dissolving into a bioreactor), the mathematical 'Two-Film Theory' dictates that the molecule must physically fight its way through two microscopic, stagnant boundary layers (a gas film and a liquid film). The overall mathematical resistance to mass transfer ($1/K_L$) is:",
            "options": [
                { "label": "A", "text": "Zero", "is_correct": false },
                { "label": "B", "text": "The mathematical sum of the physical resistance of the gas film PLUS the physical resistance of the liquid film, acting exactly like two electrical resistors wired in series", "is_correct": true },
                { "label": "C", "text": "Only based on the gas", "is_correct": false },
                { "label": "D", "text": "Only based on the liquid", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Double Wall", "content": "The bulk gas is violently mixed. The bulk liquid is violently mixed. But right at the exact microscopic surface where they touch, the fluids are stagnant due to friction." },
                    { "title": "The Series Resistors", "content": "The $O_2$ molecule must slowly diffuse through the stagnant gas layer ($1/k_g$), and then it must slowly diffuse through the stagnant liquid layer ($1/k_l$). The total resistance is $1/K_L = 1/k_g + 1/Hk_l$. Usually, one side is much thicker than the other, and that side becomes the physical 'rate-limiting step' for the entire factory." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        }
    ]
};

let modified = false;

for (let subject in newQuestions) {
    if (questions[subject]) {
        questions[subject] = questions[subject].concat(newQuestions[subject]);
        modified = true;
    } else {
        questions[subject] = newQuestions[subject];
        modified = true;
    }
}

if (modified) {
    const newContent = `const QUESTIONS = ${JSON.stringify(questions, null, 4)};\n\n` + content.substring(endIndex + 1).trim();
    const dest1 = 'd:\\Engg-Prep\\www\\questions.js';
    const dest2 = 'd:\\Engg-Prep\\android\\app\\src\\main\\assets\\public\\questions.js';

    fs.writeFileSync(fileRoot, newContent, 'utf8');
    fs.writeFileSync(dest1, newContent, 'utf8');
    fs.writeFileSync(dest2, newContent, 'utf8');
    console.log('Chem/Env Standard Batch 2 (chem-bio, balances, mass-sep - 76 Qs) processed and synced.');
} else {
    console.log('No modifications needed.');
}
