const fs = require('fs');

const fileRoot = 'd:\\Engg-Prep\\advanced_questions.js';

let content = fs.readFileSync(fileRoot, 'utf8');
const prefix = 'const ADVANCED_QUESTIONS = ';
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
    "modeling": [
        {
            "topic": "System Dynamics",
            "title": "State Space Representation",
            "question": "In modern control theory and mathematical system modeling, a dynamic, time-invariant system is universally represented by the state equation $\\dot{x} = Ax + Bu$. The specific square matrix $A$ in this formulation is formally known as the:",
            "options": [
                { "label": "A", "text": "System matrix (or State matrix)", "is_correct": true },
                { "label": "B", "text": "Input matrix", "is_correct": false },
                { "label": "C", "text": "Output matrix", "is_correct": false },
                { "label": "D", "text": "Feedthrough (or Feedforward) matrix", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "State Space Matrices", "content": "In $\\dot{x} = Ax + Bu$ and $y = Cx + Du$: $A$ is the System matrix, $B$ is the Input matrix, $C$ is the Output matrix, and $D$ is the Feedthrough matrix." },
                    { "title": "Function of A", "content": "The System matrix $A$ mathematically contains the internal dynamic properties (like mass, damping, spring constants) that dictate how the system states evolve over time independently of the external inputs." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Numerical Methods",
            "title": "Euler's Method Truncation Error",
            "question": "Euler's method is the simplest first-order numerical procedure for solving ordinary differential equations (ODEs) with a given initial value. Mathematically, the 'local truncation error' introduced at each single step of size $h$ is strictly proportional to what power of $h$?",
            "options": [
                { "label": "A", "text": "$h^2$ (Order 2)", "is_correct": true },
                { "label": "B", "text": "$h$ (Order 1)", "is_correct": false },
                { "label": "C", "text": "$h^3$ (Order 3)", "is_correct": false },
                { "label": "D", "text": "$h^4$ (Order 4)", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Taylor Series Expansion", "content": "Euler's method is derived by truncating the Taylor series expansion after the first derivative term." },
                    { "title": "Local vs Global Error", "content": "Because the remaining largest term in the Taylor series involves $h^2$, the local truncation error for a single step is $O(h^2)$. However, since you take $1/h$ steps, the overall global accumulated error becomes $O(h)$, making it a 'first-order' method." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Optimization",
            "title": "Linear Programming Solutions",
            "question": "In a standard mathematical linear programming problem solved via the classical Simplex algorithm, the optimal maximum or minimum solution to the linear objective function, assuming one exists and is finite, is mathematically proven to always occur exactly at:",
            "options": [
                { "label": "A", "text": "A vertex (extreme point) of the feasible region polygon", "is_correct": true },
                { "label": "B", "text": "The exact geometric centroid of the feasible region", "is_correct": false },
                { "label": "C", "text": "The mathematical origin $(0,0)$", "is_correct": false },
                { "label": "D", "text": "An interior point determined by taking the partial derivative", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Linearity Principle", "content": "Because both the objective function and all constraints are strictly linear equations, the feasible region forms a convex polygon (or polyhedron in higher dimensions)." },
                    { "title": "Fundamental Theorem", "content": "The Fundamental Theorem of Linear Programming states that the maximum or minimum of a linear function over a convex polygon must occur at one of the vertices (corners). The Simplex method simply crawls from corner to corner until it finds the best one." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Queuing Theory",
            "title": "M/M/1 Queue Notation",
            "question": "In the standard Kendall's notation used to classify queuing models in operations research, an M/M/1 queue specifically and mathematically denotes a system that processes with:",
            "options": [
                { "label": "A", "text": "Markovian (Poisson) arrivals, Markovian (exponential) service times, and exactly 1 server", "is_correct": true },
                { "label": "B", "text": "Deterministic arrivals, Deterministic service times, and 1 server", "is_correct": false },
                { "label": "C", "text": "Minimum arrivals, Maximum service times, and 1 server", "is_correct": false },
                { "label": "D", "text": "Multiple arrivals, Multiple service times, and 1 server", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Kendall's Notation Format", "content": "The format is A/S/c, where A is the arrival process, S is the service time distribution, and c is the number of servers." },
                    { "title": "Interpret M", "content": "The 'M' stands for Markovian (or Memoryless). For arrivals, this means a Poisson process. For service times, it means an exponential distribution." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Modeling",
            "title": "Buckingham Pi Theorem",
            "question": "The Buckingham Pi theorem is widely used in fluid mechanics and heat transfer to logically nondimensionalize physical models. If a physical problem correctly involves $n$ relevant physical variables and $m$ independent fundamental physical dimensions, how many completely independent dimensionless Pi groups can theoretically be formed?",
            "options": [
                { "label": "A", "text": "$n - m$", "is_correct": true },
                { "label": "B", "text": "$n + m$", "is_correct": false },
                { "label": "C", "text": "$n / m$", "is_correct": false },
                { "label": "D", "text": "$m - n$", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Define Variables", "content": "Let $n$ be the total number of variables (e.g., velocity, density, diameter, viscosity). Let $m$ be the fundamental dimensions involved (e.g., Mass, Length, Time)." },
                    { "title": "Apply Theorem", "content": "The Buckingham Pi Theorem proves that the original $n$ variables can be mathematically reduced into exactly $n - m$ independent dimensionless parameters (like the Reynolds or Mach numbers)." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Simulation",
            "title": "Monte Carlo Methods",
            "question": "A Monte Carlo simulation is a highly robust computational modeling technique. It fundamentally and mathematically relies on the heavy computational use of what specific element to predict outcomes and model risk in complex systems?",
            "options": [
                { "label": "A", "text": "Repeated random number generation (sampling from probability distributions)", "is_correct": true },
                { "label": "B", "text": "Solving massive systems of coupled partial differential equations", "is_correct": false },
                { "label": "C", "text": "Finding the exact analytical closed-form solution to integrals", "is_correct": false },
                { "label": "D", "text": "Using purely deterministic linear algebra matrices", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Core Concept", "content": "Instead of predicting one exact future, a Monte Carlo simulation uses random numbers to sample from the statistical distribution of every input variable simultaneously." },
                    { "title": "Execution", "content": "It runs the scenario tens of thousands of times (trials) to create a highly accurate bell curve of all possible outcomes and their probabilities, allowing engineers to quantify risk." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "System Dynamics",
            "title": "Damping Ratio Definition",
            "question": "For a standard second-order mathematical model of a mechanical mass-spring-damper system, the dimensionless damping ratio $\\zeta$ is strictly defined mathematically as the ratio of the actual physical damping coefficient $c$ to the:",
            "options": [
                { "label": "A", "text": "Critical damping coefficient $c_c$", "is_correct": true },
                { "label": "B", "text": "Spring stiffness constant $k$", "is_correct": false },
                { "label": "C", "text": "Mass $m$ of the system", "is_correct": false },
                { "label": "D", "text": "Natural frequency $\\omega_n$", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Damping Ratio Formula", "content": "$\\zeta = \\frac{c}{c_c}$." },
                    { "title": "Critical Damping", "content": "The critical damping coefficient $c_c = 2\\sqrt{km}$ (or $2m\\omega_n$) is the exact amount of damping required to prevent the system from oscillating. If $c < c_c$, $\\zeta < 1$ and the system is underdamped and will bounce." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        }
    ],
    "comp-tools": [
        {
            "topic": "Programming",
            "title": "Big O Notation (Linear Time)",
            "question": "In computer science algorithm analysis, Big O notation is utilized to mathematically describe efficiency bounds. An algorithm whose absolute worst-case execution time grows perfectly proportionately with the size of the input data set $n$ is said to have a time complexity of:",
            "options": [
                { "label": "A", "text": "$O(n)$ (Linear time)", "is_correct": true },
                { "label": "B", "text": "$O(1)$ (Constant time)", "is_correct": false },
                { "label": "C", "text": "$O(n^2)$ (Quadratic time)", "is_correct": false },
                { "label": "D", "text": "$O(\\log n)$ (Logarithmic time)", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Analyze Growth Rates", "content": "$O(1)$ means it takes the same time no matter how large the list is. $O(n^2)$ means doubling the list quadruples the time (like nested loops)." },
                    { "title": "Linear Time", "content": "If you have to inspect every item in a list once (like finding the maximum value in an unsorted array), the time taken grows directly linearly with the number of items ($n$). This is $O(n)$." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Spreadsheets",
            "title": "Absolute Referencing in Excel",
            "question": "In modern spreadsheet software formulas like Microsoft Excel, strategically placing a dollar sign before both the column letter and row number (for example, $\\$B\\$5$) strictly creates an:",
            "options": [
                { "label": "A", "text": "Absolute cell reference, which will absolutely not change when the formula is copied or dragged to other cells", "is_correct": true },
                { "label": "B", "text": "Relative cell reference, which updates automatically based on the new location", "is_correct": false },
                { "label": "C", "text": "Error flag indicating the cell contains currency formatting", "is_correct": false },
                { "label": "D", "text": "External link reference to a completely different workbook", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Relative vs Absolute", "content": "By default, Excel uses relative references (like B5). If you drag the formula down one row, it becomes B6." },
                    { "title": "The Dollar Sign Function", "content": "The $\\$$ acts as an anchor. $\\$B\\$5$ locks both the column and the row. No matter where you copy the formula, it will always point exactly to cell B5. This is highly critical for pointing to fixed constants like a discount rate." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Data Structures",
            "title": "Stack Data Structure Principle",
            "question": "In software engineering, a 'Stack' is a fundamental abstract data type and data structure. It mathematically operates on a strict principle where the last element added to the structure is always the very first one to be removed. This principle is formally known by the acronym:",
            "options": [
                { "label": "A", "text": "LIFO (Last-In, First-Out)", "is_correct": true },
                { "label": "B", "text": "FIFO (First-In, First-Out)", "is_correct": false },
                { "label": "C", "text": "GIGO (Garbage-In, Garbage-Out)", "is_correct": false },
                { "label": "D", "text": "FILO (First-In, Last-Out)", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Real World Analogy", "content": "A stack is exactly like a stack of heavy plates in a cafeteria. You 'push' a new plate onto the top, and you 'pop' a plate off the top. You cannot easily grab a plate from the bottom." },
                    { "title": "Identify Acronym", "content": "Therefore, the last plate you put on the stack is the first plate you take off. This is Last-In, First-Out (LIFO). (Note: A Queue operates on FIFO)." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Databases",
            "title": "Relational Primary Keys",
            "question": "In the rigorous design of a relational database (SQL), a specific designated column (or set of columns) that uniquely identifies each individual row or record in a table is strictly mathematically defined as the:",
            "options": [
                { "label": "A", "text": "Primary Key", "is_correct": true },
                { "label": "B", "text": "Foreign Key", "is_correct": false },
                { "label": "C", "text": "Candidate Index", "is_correct": false },
                { "label": "D", "text": "Null Constraint", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Key Definitions", "content": "A database needs a way to guarantee every record can be distinctly referenced without confusion. For employees, 'First Name' is terrible because two people can be named John." },
                    { "title": "Primary Key Concept", "content": "A Primary Key (like an Employee ID Number) is enforced by the database engine to be $100\\%$ unique and non-null for every row in the table." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Numerical Tools",
            "title": "Newton-Raphson Iteration Formula",
            "question": "The Newton-Raphson method is a massive, widely used computational algorithm for rapidly finding the numerical roots of a differentiable function (where $f(x) = 0$). The fundamental mathematical iterative update formula is defined as:",
            "options": [
                { "label": "A", "text": "$x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$", "is_correct": true },
                { "label": "B", "text": "$x_{n+1} = x_n + f(x_n) \\times f'(x_n)$", "is_correct": false },
                { "label": "C", "text": "$x_{n+1} = \\frac{x_n + x_{n-1}}{2}$", "is_correct": false },
                { "label": "D", "text": "$x_{n+1} = x_n - \\frac{f'(x_n)}{f(x_n)}$", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Geometric Derivation", "content": "You guess a point $x_n$, find the tangent line at that point, and trace that tangent line down to where it hits the x-axis. That intercept becomes your new, better guess $x_{n+1}$." },
                    { "title": "Mathematical Equation", "content": "The slope of the tangent is $f'(x_n) = \\frac{0 - f(x_n)}{x_{n+1} - x_n}$. Solving this for $x_{n+1}$ yields $x_{n+1} = x_n - \\frac{f(x_n)}{f'(x_n)}$." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Computer Architecture",
            "title": "IEEE 754 Floating Point Standard",
            "question": "According to the internationally recognized IEEE 754 standard for computer arithmetic hardware, a standard 'double-precision' floating-point number occupies exactly how many bits in physical computer memory?",
            "options": [
                { "label": "A", "text": "$64\\text{ bits}$ (8 bytes)", "is_correct": true },
                { "label": "B", "text": "$32\\text{ bits}$ (4 bytes)", "is_correct": false },
                { "label": "C", "text": "$16\\text{ bits}$ (2 bytes)", "is_correct": false },
                { "label": "D", "text": "$128\\text{ bits}$ (16 bytes)", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Floating Point Sizes", "content": "A 'single-precision' float (commonly used in 3D graphics for speed) uses $32\\text{ bits}$." },
                    { "title": "Double Precision", "content": "A 'double-precision' float (the standard in engineering, scientific computing, and JavaScript) uses $64\\text{ bits}$: $1\\text{ sign bit}$, $11\\text{ exponent bits}$, and $52\\text{ fraction (mantissa) bits}$. $64\\text{ bits} / 8 = 8\\text{ bytes}$." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Software Engineering",
            "title": "Git Version Control",
            "question": "In modern collaborative software development, Git is universally utilized as a distributed version control system. When a developer wants to formally integrate their completed, peer-reviewed feature branch back into the main production codebase, they initiate a:",
            "options": [
                { "label": "A", "text": "Pull Request (or Merge Request)", "is_correct": true },
                { "label": "B", "text": "Force Push", "is_correct": false },
                { "label": "C", "text": "Hard Reset", "is_correct": false },
                { "label": "D", "text": "Git Clone", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Git Workflow", "content": "Developers 'clone' a repository, make a 'branch', 'commit' their changes, and 'push' to the remote server." },
                    { "title": "Integration Process", "content": "To get those changes into the main branch, they open a 'Pull Request' (PR) on platforms like GitHub. It is a request asking the repository maintainers to review the code and 'pull' (merge) it into the master branch." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        }
    ],
    "principles": [
        {
            "topic": "Ethics",
            "title": "Utilitarian Philosophy",
            "question": "The foundational ethical philosophy of Utilitarianism, which is deeply and often implicitly applied in engineering cost-benefit analysis and risk management, fundamentally dictates that the 'right' moral action is strictly the one that:",
            "options": [
                { "label": "A", "text": "Maximizes the overall net utility or happiness for the greatest number of people", "is_correct": true },
                { "label": "B", "text": "Strictly follows absolute moral rules regardless of the consequences (Deontology)", "is_correct": false },
                { "label": "C", "text": "Prioritizes the financial profit of the corporation above all else", "is_correct": false },
                { "label": "D", "text": "Focuses entirely on the personal virtues and character of the engineer", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Ethical Frameworks", "content": "Duty ethics (Kant) says actions are inherently right or wrong regardless of outcome. Virtue ethics focuses on character." },
                    { "title": "Utilitarian Concept", "content": "Utilitarianism (Bentham/Mill) is purely consequentialist. It involves a calculation: whichever option produces the maximum net positive benefit (utility) for society as a whole is mathematically the morally correct choice." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Design Process",
            "title": "Iterative Design Methodology",
            "question": "The modern engineering design process is almost universally described as highly 'iterative'. In systems engineering, this specifically and procedurally means that the design team must continuously:",
            "options": [
                { "label": "A", "text": "Cycle back through previous steps (testing, evaluating, redesigning) to rigorously refine and improve the solution based on new data", "is_correct": true },
                { "label": "B", "text": "Move strictly linearly from step 1 to step 10 without ever looking backward (Waterfall method)", "is_correct": false },
                { "label": "C", "text": "Ensure that every single component is designed simultaneously by different teams", "is_correct": false },
                { "label": "D", "text": "Rely entirely on computer simulations without building physical prototypes", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Iterative Definition", "content": "Iteration means repetition. A linear 'waterfall' approach often fails in complex engineering because problems are discovered late." },
                    { "title": "Iterative Loop", "content": "Iterative design involves creating a prototype, testing it, discovering flaws, and intentionally looping back to the concept or design phase to fix them, spiraling closer to the optimal solution with each cycle." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Systems Engineering",
            "title": "Requirements Traceability",
            "question": "In rigorous aerospace and defense systems engineering, 'Requirements Traceability' is the critical, legally mandated project management process of maintaining a documented, unbroken mathematical link between the high-level stakeholder needs and the:",
            "options": [
                { "label": "A", "text": "Low-level technical design specifications and the final verification test cases", "is_correct": true },
                { "label": "B", "text": "Financial budget constraints set by the accounting department", "is_correct": false },
                { "label": "C", "text": "Resumes and qualifications of the engineering staff", "is_correct": false },
                { "label": "D", "text": "Marketing materials provided to the general public", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Traceability Matrix", "content": "Engineers use a Traceability Matrix. If the customer says 'It must fly in rain' (High Level), it traces to 'Sealant X must be used' (Low Level Design), which traces to 'Test Procedure Y' (Verification)." },
                    { "title": "Purpose", "content": "This ensures no customer requirement is forgotten, and conversely, prevents 'gold-plating' (designing expensive features that do not trace back to any actual customer requirement)." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Design Constraints",
            "title": "Factor of Safety Definition",
            "question": "In structural and mechanical design engineering, the mathematical Factor of Safety (FS) is formally and universally calculated as the ratio of the component's absolute ultimate failure load (or ultimate material strength) to the:",
            "options": [
                { "label": "A", "text": "Maximum allowable working load (or design stress)", "is_correct": true },
                { "label": "B", "text": "Minimum expected load during its lifespan", "is_correct": false },
                { "label": "C", "text": "Weight of the component itself", "is_correct": false },
                { "label": "D", "text": "Elastic limit of the material", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Factor of Safety Formula", "content": "$FS = \\frac{\\text{Actual Failure Strength}}{\\text{Allowable Working Stress}}$." },
                    { "title": "Application", "content": "If a steel cable snaps at $10,000\\text{ lbs}$, and you rate it for a maximum safe working load of $2,000\\text{ lbs}$, your Factor of Safety is exactly 5. This buffer accounts for unknowns in material defects, dynamic loads, and human misuse." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Project Management",
            "title": "Critical Path Method (CPM)",
            "question": "In advanced project management scheduling (such as PERT or CPM), the 'Critical Path' through a massive project network diagram is strictly mathematically defined as the sequence of dependent tasks that has exactly zero:",
            "options": [
                { "label": "A", "text": "Float (or slack) time, meaning any delay in these tasks will directly delay the entire project completion date", "is_correct": true },
                { "label": "B", "text": "Financial cost associated with their completion", "is_correct": false },
                { "label": "C", "text": "Risk of failure or safety incidents", "is_correct": false },
                { "label": "D", "text": "Dependency on external contractors", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Define Float", "content": "Float (slack) is the amount of time a task can be delayed without delaying the subsequent task or the project." },
                    { "title": "The Critical Path", "content": "The critical path is the longest continuous chain of tasks through the project. Because it is the longest, it dictates the minimum time the project can take. Therefore, every task on this path has zero float." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Measurement",
            "title": "Accuracy vs Precision",
            "question": "In scientific measurement theory and metrology, 'Precision' refers strictly to the degree of repeatability, resolution, or tight scatter among multiple measurements. Conversely, 'Accuracy' refers fundamentally and strictly to:",
            "options": [
                { "label": "A", "text": "How closely the average of the measurements aligns with the true, actual target value", "is_correct": true },
                { "label": "B", "text": "The number of significant figures displayed on the digital readout", "is_correct": false },
                { "label": "C", "text": "How tightly grouped the measurements are to each other", "is_correct": false },
                { "label": "D", "text": "The absolute minimum value the instrument can physically detect", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "The Target Analogy", "content": "Imagine a dartboard. If all darts hit tightly together in the top right corner, you have high precision, but terrible accuracy." },
                    { "title": "Define Accuracy", "content": "Accuracy means the darts (or the average of the darts) hit the bullseye. A calibrated instrument is accurate. A finely-tuned instrument is precise." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Intellectual Property",
            "title": "Utility Patents",
            "question": "In the United States legal system, a standard utility patent formally grants the inventor the exclusive federal right to completely exclude others from making, using, or selling the invention for a maximum legal period of:",
            "options": [
                { "label": "A", "text": "$20\\text{ years}$ from the exact date the patent application was filed", "is_correct": true },
                { "label": "B", "text": "$10\\text{ years}$ from the date the invention was first sketched", "is_correct": false },
                { "label": "C", "text": "The entire lifetime of the inventor plus $70\\text{ years}$", "is_correct": false },
                { "label": "D", "text": "Forever, as long as annual maintenance fees are paid", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Differentiate IP", "content": "Copyrights last for the life of the author plus $70\\text{ years}$. Trademarks can last forever if defended." },
                    { "title": "Patent Law", "content": "Utility patents, which cover novel and non-obvious engineering mechanisms, processes, and machines, expire exactly $20\\text{ years}$ from the filing date, after which the invention enters the public domain for anyone to use." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        }
    ],
    "eng-sciences": [
        {
            "topic": "Statics",
            "title": "Two-Force Members",
            "question": "In the rigorous mathematical static analysis of a pin-jointed truss, a 'two-force member' is defined as a structural element loaded entirely by pins at its two ends with absolutely no intermediate loads or moments. For the member to remain in perfect static equilibrium, the two forces must be equal in magnitude, opposite in direction, and strictly:",
            "options": [
                { "label": "A", "text": "Collinear (acting exactly along the straight mathematical line connecting the two pins)", "is_correct": true },
                { "label": "B", "text": "Parallel but offset to create a stabilizing moment", "is_correct": false },
                { "label": "C", "text": "Perpendicular to the longitudinal axis of the member", "is_correct": false },
                { "label": "D", "text": "Acting at exactly a $45^\\circ$ angle to the horizontal plane", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Equilibrium Requirements", "content": "For sum of forces to be zero, the forces must be equal and opposite." },
                    { "title": "Moment Requirement", "content": "For the sum of moments to be zero anywhere on the member, the two forces cannot have any perpendicular offset between their lines of action. Therefore, they must lie on the exact same straight line (collinear)." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Dynamics",
            "title": "Conservation of Linear Momentum",
            "question": "According to Newton's fundamental laws and the principle of conservation of linear momentum, if the net external force vector acting on a closed system of interacting particles is exactly zero, the total vector momentum of the entire system:",
            "options": [
                { "label": "A", "text": "Remains perfectly constant in both magnitude and direction", "is_correct": true },
                { "label": "B", "text": "Slowly decays to zero due to internal friction and heat", "is_correct": false },
                { "label": "C", "text": "Must equal the total kinetic energy of the system", "is_correct": false },
                { "label": "D", "text": "Increases exponentially over time", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Newton's Second Law", "content": "$\\Sigma F_{ext} = \\frac{dP}{dt}$, where $P$ is the total momentum." },
                    { "title": "Conservation Principle", "content": "If $\\Sigma F_{ext} = 0$, then $\\frac{dP}{dt} = 0$. If the derivative is zero, the quantity $P$ must be a constant. This holds true even during perfectly inelastic collisions where immense kinetic energy is lost." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Thermodynamics",
            "title": "The First Law of Thermodynamics",
            "question": "The First Law of Thermodynamics ($Q - W = \\Delta U$) is a formal, rigorous mathematical statement of the fundamental universal principle of:",
            "options": [
                { "label": "A", "text": "Conservation of Energy (energy can neither be created nor destroyed, only altered in form)", "is_correct": true },
                { "label": "B", "text": "Conservation of Mass (mass in equals mass out)", "is_correct": false },
                { "label": "C", "text": "Entropy Increase (the disorder of the universe always increases)", "is_correct": false },
                { "label": "D", "text": "Absolute Zero (no system can reach zero Kelvin)", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Identify the Laws", "content": "The Second Law dictates Entropy. The Third Law dictates Absolute Zero limits." },
                    { "title": "First Law Meaning", "content": "The First Law states that the change in internal energy of a closed system is strictly equal to the heat added to it minus the work done by it. This is the ultimate bookkeeping equation proving energy is purely conserved." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Materials Science",
            "title": "Hooke's Law and Young's Modulus",
            "question": "In the purely linear elastic region of a solid material's stress-strain curve, Hooke's Law states that the normal stress ($\\sigma$) is directly mathematically proportional to the normal strain ($\\epsilon$). The fundamental constant of proportionality governing this relationship is formally called the:",
            "options": [
                { "label": "A", "text": "Modulus of Elasticity (or Young's Modulus, $E$)", "is_correct": true },
                { "label": "B", "text": "Shear Modulus (or Modulus of Rigidity, $G$)", "is_correct": false },
                { "label": "C", "text": "Bulk Modulus ($K$)", "is_correct": false },
                { "label": "D", "text": "Poisson's Ratio ($\\nu$)", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Hooke's Law Equation", "content": "$\\sigma = E \\times \\epsilon$." },
                    { "title": "Identify the Constant", "content": "The slope of the linear elastic region ($E$) is Young's Modulus. It represents the inherent stiffness of the material itself (e.g., steel is stiffer than aluminum), independent of the part's physical geometry." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Fluid Mechanics",
            "title": "Bernoulli's Equation Origins",
            "question": "Bernoulli's equation ($P + \\frac{1}{2}\\rho v^2 + \\rho g h = \\text{constant}$) for steady, incompressible, perfectly frictionless fluid flow along a streamline states that the sum of pressure energy, kinetic energy, and potential energy is constant. It is fundamentally and mathematically derived from the physical principle of:",
            "options": [
                { "label": "A", "text": "Conservation of Energy (the work-energy theorem)", "is_correct": true },
                { "label": "B", "text": "Conservation of Mass (the continuity equation)", "is_correct": false },
                { "label": "C", "text": "Conservation of Linear Momentum", "is_correct": false },
                { "label": "D", "text": "The Ideal Gas Law", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Equation Components", "content": "$P$ acts as flow work/energy, $\\frac{1}{2}\\rho v^2$ is kinetic energy per unit volume, and $\\rho g h$ is gravitational potential energy per unit volume." },
                    { "title": "Theoretical Basis", "content": "Because there is no friction to steal energy (inviscid flow), the total mechanical energy of a fluid particle traveling down a streamline remains perfectly conserved, merely trading pressure for velocity or height." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Heat Transfer",
            "title": "Fourier's Law of Conduction",
            "question": "Fourier's Law of Heat Conduction mathematically states that the conductive heat transfer rate ($q$) through a solid material is directly proportional to the cross-sectional area ($A$) and the temperature gradient ($dT/dx$). This rate strictly relies on an intrinsic material property known as:",
            "options": [
                { "label": "A", "text": "Thermal conductivity ($k$)", "is_correct": true },
                { "label": "B", "text": "Specific heat capacity ($C_p$)", "is_correct": false },
                { "label": "C", "text": "Convective heat transfer coefficient ($h$)", "is_correct": false },
                { "label": "D", "text": "Stefan-Boltzmann constant ($\\sigma$)", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Fourier's Law Equation", "content": "$q = -k A \\frac{dT}{dx}$." },
                    { "title": "Identify Variable", "content": "The constant $k$ is the thermal conductivity (e.g., $W/m\\cdot K$), measuring how easily heat naturally diffuses through the atomic lattice of the solid material." }
                ],
                "solution_image": "", "video_explanation": ""
            }
        },
        {
            "topic": "Circuits",
            "title": "Ohm's Law Fundamentals",
            "question": "Ohm's Law, arguably the most fundamental and ubiquitous relationship in electrical engineering, mathematically relates voltage potential ($V$), electrical current ($I$), and pure resistance ($R$) in a standard linear DC circuit via the exact equation:",
            "options": [
                { "label": "A", "text": "$V = I \\times R$", "is_correct": true },
                { "label": "B", "text": "$P = V \\times I$", "is_correct": false },
                { "label": "C", "text": "$I = V \\times R$", "is_correct": false },
                { "label": "D", "text": "$R = V \\times I$", "is_correct": false }
            ],
            "solution": {
                "steps": [
                    { "title": "Physical Concept", "content": "Voltage ($V$) is the pressure pushing the electrons. Resistance ($R$) is the restriction in the pipe. Current ($I$) is the actual resulting flow rate of electrons." },
                    { "title": "Mathematical Law", "content": "Ohm discovered that the voltage drop across a resistor is exactly equal to the current flowing through it multiplied by its resistance: $V = I R$." }
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
    }
}

if (modified) {
    const newContent = `const ADVANCED_QUESTIONS = ${JSON.stringify(questions, null, 4)};\n`;
    const dest1 = 'd:\\Engg-Prep\\www\\advanced_questions.js';
    const dest2 = 'd:\\Engg-Prep\\android\\app\\src\\main\\assets\\public\\advanced_questions.js';

    fs.writeFileSync(fileRoot, newContent, 'utf8');
    fs.writeFileSync(dest1, newContent, 'utf8');
    fs.writeFileSync(dest2, newContent, 'utf8');
    console.log('Ind Batch 2 processed and synced (Modeling, Comp Tools, Principles, Eng Sciences brought up to 10).');
} else {
    console.log('No modifications needed.');
}
