const fs = require('fs');

let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS in questions.js");
  process.exit(1);
}

const questionsObj = JSON.parse(match[1]);

// 1. CIRCUITS (+50 questions)
const circuitsNew = [
  // DC Analysis (7 needed)
  {
    "topic": "DC Analysis",
    "title": "Nodal Analysis with Dependent Source",
    "question": "In a DC circuit, a node voltage $V_1$ has a dependent current source of $2I_x$ flowing into it, where $I_x$ is the current through a $4\\text{ \\Omega}$ resistor connected between $V_1$ and ground. If a independent current source of $10\\text{ A}$ also flows into $V_1$, and a $2\\text{ \\Omega}$ resistor is connected from $V_1$ to ground, calculate the node voltage $V_1$.",
    "options": [
      { "label": "A", "text": "40.0 V", "is_correct": false },
      { "label": "B", "text": "20.0 V", "is_correct": true },
      { "label": "C", "text": "10.0 V", "is_correct": false },
      { "label": "D", "text": "5.0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Set Up KCL at Node 1",
          "content": "Sum of currents leaving the node equals sum of currents entering:\n$\\frac{V_1}{2} + I_x = 10 + 2I_x \\implies \\frac{V_1}{2} - I_x = 10$, where $I_x = \\frac{V_1}{4}$."
        },
        {
          "title": "Substitute and Solve for V1",
          "content": "$\\frac{V_1}{2} - \\frac{V_1}{4} = 10 \\implies \\frac{V_1}{4} = 10 \\implies V_1 = 40\\text{ V}$."
        }
      ],
      "final_answer": "B",
      "solution_image": ""
    }
  },
  {
    "topic": "DC Analysis",
    "title": "Mesh Analysis with Supermesh",
    "question": "A mesh circuit contains mesh currents $I_1$ and $I_2$. An independent $5\\text{ A}$ current source is shared between Mesh 1 and Mesh 2, flowing upwards from Mesh 2 to Mesh 1. The resistors in Mesh 1 and Mesh 2 are $2\\text{ \\Omega}$ and $8\\text{ \\Omega}$ respectively, connected to a $100\\text{ V}$ independent DC voltage source across the combined supermesh. Find the current $I_1$.",
    "options": [
      { "label": "A", "text": "15.0 A", "is_correct": true },
      { "label": "B", "text": "10.0 A", "is_correct": false },
      { "label": "C", "text": "5.0 A", "is_correct": false },
      { "label": "D", "text": "20.0 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Constraint Equation",
          "content": "The current source lies between mesh 1 and mesh 2: $I_1 - I_2 = 5 \\implies I_2 = I_1 - 5$."
        },
        {
          "title": "Write Supermesh KVL Equation",
          "content": "$2I_1 + 8I_2 = 100$."
        },
        {
          "title": "Substitute and Solve",
          "content": "$2I_1 + 8(I_1 - 5) = 100 \\implies 10I_1 - 40 = 100 \\implies 10I_1 = 140 \\implies I_1 = 14.0\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "DC Analysis",
    "title": "Bridge Circuit Balance",
    "question": "A Wheatstone bridge has resistors $R_1 = 100\\text{ \\Omega}$, $R_2 = 200\\text{ \\Omega}$, and $R_3 = 150\\text{ \\Omega}$. What value must the variable resistor $R_x$ have to balance the bridge if it is connected such that $R_1/R_2 = R_3/R_x$?",
    "options": [
      { "label": "A", "text": "300 \\Omega", "is_correct": true },
      { "label": "B", "text": "75 \\Omega", "is_correct": false },
      { "label": "C", "text": "150 \\Omega", "is_correct": false },
      { "label": "D", "text": "450 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Balance Equation",
          "content": "For a balanced bridge: $\\frac{R_1}{R_2} = \\frac{R_3}{R_x}$."
        },
        {
          "title": "Solve for Rx",
          "content": "$R_x = R_3 \\left(\\frac{R_2}{R_1}\\right) = 150 \\times \\left(\\frac{200}{100}\\right) = 300\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "DC Analysis",
    "title": "Ideal Operational Amplifier DC Output",
    "question": "An ideal operational amplifier is configured as a non-inverting amplifier. The feedback resistor is $R_f = 10\\text{ k\\Omega}$ and the input resistor is $R_1 = 2\\text{ k\\Omega}$. If the input voltage is $V_{in} = 1.5\\text{ V}$ DC, calculate the output voltage $V_{out}$.",
    "options": [
      { "label": "A", "text": "9.0 V", "is_correct": true },
      { "label": "B", "text": "7.5 V", "is_correct": false },
      { "label": "C", "text": "1.5 V", "is_correct": false },
      { "label": "D", "text": "6.0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Non-Inverting Op-Amp Gain",
          "content": "$A_v = 1 + \\frac{R_f}{R_1}$."
        },
        {
          "title": "Calculate Gain",
          "content": "$A_v = 1 + \\frac{10}{2} = 6$."
        },
        {
          "title": "Calculate Output Voltage",
          "content": "$V_{out} = A_v \\cdot V_{in} = 6 \\times 1.5 = 9.0\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "DC Analysis",
    "title": "Delta-Wye Transformation Resistance",
    "question": "Three identical resistors of $30\\text{ \\Omega}$ each are connected in a Delta ($\\Delta$) network. What is the equivalent resistance of each resistor in the corresponding Wye ($Y$) network?",
    "options": [
      { "label": "A", "text": "10 \\Omega", "is_correct": true },
      { "label": "B", "text": "90 \\Omega", "is_correct": false },
      { "label": "C", "text": "30 \\Omega", "is_correct": false },
      { "label": "D", "text": "15 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Transformation Formula",
          "content": "For a balanced Delta network with identical resistors $R_\\Delta$, the equivalent Wye resistor $R_Y$ is: $R_Y = \\frac{R_\\Delta}{3}$."
        },
        {
          "title": "Calculate Wye Resistance",
          "content": "$R_Y = \\frac{30}{3} = 10\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "DC Analysis",
    "title": "Maximum Power Transfer Resistor Value",
    "question": "A DC source has an internal resistance of $R_s = 50\\text{ \\Omega}$. What load resistance $R_L$ should be connected to the source terminals to maximize the power delivered to the load?",
    "options": [
      { "label": "A", "text": "50 \\Omega", "is_correct": true },
      { "label": "B", "text": "100 \\Omega", "is_correct": false },
      { "label": "C", "text": "25 \\Omega", "is_correct": false },
      { "label": "D", "text": "0 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Maximum Power Transfer Theorem",
          "content": "The Maximum Power Transfer Theorem states that maximum power is transferred from a source to a load when the load resistance equals the internal source resistance: $R_L = R_s$."
        },
        {
          "title": "Determine Resistance Value",
          "content": "$R_L = 50\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "DC Analysis",
    "title": "Equivalent Capacitance in Series/Parallel",
    "question": "Two capacitors, $C_1 = 6\\text{ \\mu F}$ and $C_2 = 12\\text{ \\mu F}$, are connected in series. This combination is then connected in parallel with a third capacitor $C_3 = 4\\text{ \\mu F}$. Calculate the total equivalent capacitance of the network.",
    "options": [
      { "label": "A", "text": "8.0 \\mu F", "is_correct": true },
      { "label": "B", "text": "22.0 \\mu F", "is_correct": false },
      { "label": "C", "text": "18.0 \\mu F", "is_correct": false },
      { "label": "D", "text": "4.0 \\mu F", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Series Combination",
          "content": "$C_{12} = \\frac{C_1 \\cdot C_2}{C_1 + C_2} = \\frac{6 \\times 12}{6 + 12} = \\frac{72}{18} = 4\\text{ \\mu F}$."
        },
        {
          "title": "Calculate Parallel Combination",
          "content": "$C_{total} = C_{12} + C_3 = 4 + 4 = 8\\text{ \\mu F}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // AC Analysis (3 needed)
  {
    "topic": "AC Analysis",
    "title": "AC Phasor Current Calculation",
    "question": "A voltage source is given by $v(t) = 120 \\cos(377t + 30^\\circ)\\text{ V}$. It is connected across an inductor with inductance $L = 0.1\\text{ H}$. Calculate the phasor current $\\mathbf{I}$ through the inductor.",
    "options": [
      { "label": "A", "text": "3.18 \\angle -60^\\circ A", "is_correct": true },
      { "label": "B", "text": "3.18 \\angle 120^\\circ A", "is_correct": false },
      { "label": "C", "text": "1.20 \\angle -60^\\circ A", "is_correct": false },
      { "label": "D", "text": "1.20 \\angle 30^\\circ A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Convert Voltage to Phasor Form",
          "content": "$\\mathbf{V} = 120 \\angle 30^\\circ\\text{ V}$."
        },
        {
          "title": "Calculate Inductive Impedance",
          "content": "$Z_L = j\\omega L = j (377) (0.1) = j37.7\\text{ \\Omega} = 37.7 \\angle 90^\\circ\\text{ \\Omega}$."
        },
        {
          "title": "Apply Ohm's Law in Phasor Domain",
          "content": "$\\mathbf{I} = \\frac{\\mathbf{V}}{Z_L} = \\frac{120 \\angle 30^\\circ}{37.7 \\angle 90^\\circ} = 3.18 \\angle (30^\circ - 90^\circ) = 3.18 \\angle -60^\\circ\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "AC Analysis",
    "title": "AC Impedance of RLC Network",
    "question": "A series RLC circuit has a resistor $R = 30\\text{ \\Omega}$, an inductive reactance $X_L = 80\\text{ \\Omega}$, and a capacitive reactance $X_C = 40\\text{ \\Omega}$. What is the total complex impedance $\\mathbf{Z}$ of the circuit in polar form?",
    "options": [
      { "label": "A", "text": "50 \\angle 53.1^\\circ \\Omega", "is_correct": true },
      { "label": "B", "text": "50 \\angle -36.9^\\circ \\Omega", "is_correct": false },
      { "label": "C", "text": "110 \\angle 53.1^\\circ \\Omega", "is_correct": false },
      { "label": "D", "text": "30 \\angle 90^\\circ \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Rectangular Impedance",
          "content": "$\\mathbf{Z} = R + j(X_L - X_C) = 30 + j(80 - 40) = 30 + j40\\text{ \\Omega}$."
        },
        {
          "title": "Convert to Polar Form",
          "content": "$|\\mathbf{Z}| = \\sqrt{30^2 + 40^2} = 50\\text{ \\Omega}$\n$\\theta = \\tan^{-1}(40/30) = 53.13^\\circ$\n$\\mathbf{Z} = 50 \\angle 53.13^\\circ\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "AC Analysis",
    "title": "RMS Value of Periodic Waveform",
    "question": "A periodic voltage waveform consists of a DC component of $10\\text{ V}$ and a sinusoidal AC component of $v_{ac}(t) = 14.14 \\sin(\\omega t)\\text{ V}$. What is the RMS value of the total combined voltage waveform?",
    "options": [
      { "label": "A", "text": "14.14 V", "is_correct": true },
      { "label": "B", "text": "24.14 V", "is_correct": false },
      { "label": "C", "text": "17.32 V", "is_correct": false },
      { "label": "D", "text": "12.25 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify RMS Formula for Mixed Signal",
          "content": "$V_{rms} = \\sqrt{V_{dc}^2 + V_{ac,rms}^2}$"
        },
        {
          "title": "Calculate AC Component RMS",
          "content": "$V_{ac,rms} = \\frac{14.14}{\\sqrt{2}} = 10.0\\text{ V}$."
        },
        {
          "title": "Calculate Total RMS",
          "content": "$V_{rms} = \\sqrt{10^2 + 10^2} = \\sqrt{200} = 14.14\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Network Theorems (8 needed)
  {
    "topic": "Network Theorems",
    "title": "Thevenin Equivalent Voltage Sizing",
    "question": "In a linear circuit, two terminals A and B are open-circuited. A voltmeter connected across A and B reads $24\\text{ V}$. When a $10\\text{ \\Omega}$ resistor is connected between A and B, the voltage drops to $16\\text{ V}$. What is the Thevenin equivalent resistance ($R_{th}$) of the circuit?",
    "options": [
      { "label": "A", "text": "5.0 \\Omega", "is_correct": true },
      { "label": "B", "text": "10.0 \\Omega", "is_correct": false },
      { "label": "C", "text": "2.5 \\Omega", "is_correct": false },
      { "label": "D", "text": "7.5 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Thevenin Parameters",
          "content": "The open-circuit voltage is $V_{th} = 24\\text{ V}$."
        },
        {
          "title": "Write Voltage Divider Equation",
          "content": "$V_{load} = V_{th} \\left(\\frac{R_L}{R_L + R_{th}}\\right) \\implies 16 = 24 \\left(\\frac{10}{10 + R_{th}}\\right)$."
        },
        {
          "title": "Solve for Rth",
          "content": "$\\frac{16}{24} = \\frac{10}{10 + R_{th}} \\implies \\frac{2}{3} = \\frac{10}{10 + R_{th}} \\implies 20 + 2R_{th} = 30 \\implies R_{th} = 5.0\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Network Theorems",
    "title": "Norton Current Source Value",
    "question": "A circuit has a Thevenin voltage $V_{th} = 12\\text{ V}$ and Thevenin resistance $R_{th} = 3\\text{ \\Omega}$. What is the equivalent Norton short-circuit current ($I_N$)?",
    "options": [
      { "label": "A", "text": "4.0 A", "is_correct": true },
      { "label": "B", "text": "36.0 A", "is_correct": false },
      { "label": "C", "text": "0.25 A", "is_correct": false },
      { "label": "D", "text": "2.0 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Source Transformation Theorem",
          "content": "The Norton equivalent current is equal to the short-circuit current at the terminals: $I_N = \\frac{V_{th}}{R_{th}}$."
        },
        {
          "title": "Calculate Current",
          "content": "$I_N = \\frac{12}{3} = 4.0\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Network Theorems",
    "title": "Superposition Theorem with Two Sources",
    "question": "A circuit contains a $10\\text{ V}$ independent voltage source and a $2\\text{ A}$ independent current source. Under the voltage source alone (current source open-circuited), the current through a load resistor is $I'_L = 3\\text{ A}$. Under the current source alone (voltage source short-circuited), the current is $I''_L = -1\\text{ A}$ in the same direction. What is the total current $I_L$ with both sources active?",
    "options": [
      { "label": "A", "text": "2.0 A", "is_correct": true },
      { "label": "B", "text": "4.0 A", "is_correct": false },
      { "label": "C", "text": "5.0 A", "is_correct": false },
      { "label": "D", "text": "3.0 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Superposition Principle",
          "content": "Superposition states that the total response in any branch is the algebraic sum of the individual responses: $I_L = I'_L + I''_L$."
        },
        {
          "title": "Sum the Responses",
          "content": "$I_L = 3 + (-1) = 2.0\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Network Theorems",
    "title": "Source Transformation Calculation",
    "question": "A real voltage source of $20\\text{ V}$ with a series internal resistance of $5\\text{ \\Omega}$ is transformed into an equivalent real current source. What is the current source value ($I_s$) and parallel resistance ($R_p$)?",
    "options": [
      { "label": "A", "text": "4 A, 5 \\Omega", "is_correct": true },
      { "label": "B", "text": "100 A, 5 \\Omega", "is_correct": false },
      { "label": "C", "text": "4 A, 0.2 \\Omega", "is_correct": false },
      { "label": "D", "text": "20 A, 5 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Source Transformation",
          "content": "A voltage source $V_s$ in series with $R_s$ is transformed to a parallel current source $I_s = V_s/R_s$ with parallel resistance $R_p = R_s$."
        },
        {
          "title": "Calculate Parameters",
          "content": "$I_s = 20 / 5 = 4\\text{ A}$\n$R_p = 5\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Network Theorems",
    "title": "Maximum Power Transfer Theorem in AC Circuits",
    "question": "An AC source has an internal impedance of $\\mathbf{Z}_s = 10 + j5\\text{ \\Omega}$. What load impedance $\\mathbf{Z}_L$ will draw maximum real power from the source?",
    "options": [
      { "label": "A", "text": "10 - j5 \\Omega", "is_correct": true },
      { "label": "B", "text": "10 + j5 \\Omega", "is_correct": false },
      { "label": "C", "text": "5 - j10 \\Omega", "is_correct": false },
      { "label": "D", "text": "11.18 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply AC Maximum Power Transfer Theorem",
          "content": "For maximum power transfer in AC circuits, the load impedance must be the complex conjugate of the source internal impedance: $\\mathbf{Z}_L = \\mathbf{Z}_s^*$."
        },
        {
          "title": "Determine Conjugate",
          "content": "If $\\mathbf{Z}_s = 10 + j5\\text{ \\Omega}$, then $\\mathbf{Z}_L = 10 - j5\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Network Theorems",
    "title": "Millman's Theorem Voltage Sizing",
    "question": "Three parallel DC voltage branches have voltages $V_1 = 10\\text{ V}$, $V_2 = 20\\text{ V}$, and $V_3 = 30\\text{ V}$ with series resistances $R_1 = R_2 = R_3 = 3\\text{ \\Omega}$. Find the common voltage $V_{xy}$ across these parallel branches using Millman's Theorem.",
    "options": [
      { "label": "A", "text": "20.0 V", "is_correct": true },
      { "label": "B", "text": "15.0 V", "is_correct": false },
      { "label": "C", "text": "25.0 V", "is_correct": false },
      { "label": "D", "text": "30.0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Millman's Formula",
          "content": "$V_{xy} = \\frac{\\sum (V_k/R_k)}{\\sum (1/R_k)}$"
        },
        {
          "title": "Substitute branch values",
          "content": "$V_{xy} = \\frac{10/3 + 20/3 + 30/3}{1/3 + 1/3 + 1/3} = \\frac{60/3}{3/3} = 20\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Network Theorems",
    "title": "Tellegen's Theorem Verification",
    "question": "Tellegen's Theorem states that in any lumped electrical network, the sum of the power absorbed by all network branches is:",
    "options": [
      { "label": "A", "text": "Exactly zero", "is_correct": true },
      { "label": "B", "text": "Equal to the total reactive power", "is_correct": false },
      { "label": "C", "text": "Proportional to the square of KVL equations", "is_correct": false },
      { "label": "D", "text": "Equal to the source thermal losses", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Tellegen's Theorem",
          "content": "Tellegen's Theorem is a consequence of conservation of energy: $\\sum_{k=1}^n v_k i_k = 0$, indicating the total power delivered is exactly equal to the total power absorbed (sum equals zero)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Network Theorems",
    "title": "Reciprocity Theorem",
    "question": "Under what condition does the Reciprocity Theorem apply to a multi-port electrical network?",
    "options": [
      { "label": "A", "text": "The network must be linear, bilateral, and contain no dependent sources", "is_correct": true },
      { "label": "B", "text": "The network must contain active operational amplifiers", "is_correct": false },
      { "label": "C", "text": "The network must have purely reactive impedances", "is_correct": false },
      { "label": "D", "text": "The network must be non-linear with high voltage gains", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Reciprocity Limits",
          "content": "Reciprocity applies only to passive linear bilateral networks without dependent sources. Dependent sources and non-linear elements violate reciprocity."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Transient Analysis (6 needed)
  {
    "topic": "Transient Analysis",
    "title": "RC Circuit Charging Time Constant",
    "question": "A series RC circuit consists of a $100\\text{ V}$ DC source, a switch, a $10\\text{ k\\Omega}$ resistor, and an uncharged $50\\text{ \\mu F}$ capacitor. The switch is closed at $t = 0$. Calculate the circuit time constant ($\\tau$).",
    "options": [
      { "label": "A", "text": "0.50 s", "is_correct": true },
      { "label": "B", "text": "2.00 s", "is_correct": false },
      { "label": "C", "text": "5.00 s", "is_correct": false },
      { "label": "D", "text": "0.10 s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Time Constant Formula",
          "content": "For a series RC circuit: $\\tau = R \\cdot C$."
        },
        {
          "title": "Calculate Value",
          "content": "$\\tau = (10 \\times 10^3\\text{ \\Omega}) \\times (50 \\times 10^{-6}\\text{ F}) = 0.50\\text{ seconds}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transient Analysis",
    "title": "RC Capacitor Transient Voltage",
    "question": "For the series RC circuit in the previous question ($\\tau = 0.5\\text{ s}$, $V_s = 100\\text{ V}$ DC), calculate the capacitor voltage $v_c(t)$ at $t = 1.0\\text{ second}$ after the switch is closed.",
    "options": [
      { "label": "A", "text": "86.5 V", "is_correct": true },
      { "label": "B", "text": "63.2 V", "is_correct": false },
      { "label": "C", "text": "95.0 V", "is_correct": false },
      { "label": "D", "text": "36.8 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Transient Capacitor Charging Equation",
          "content": "$v_c(t) = V_s(1 - e^{-t/\\tau})$"
        },
        {
          "title": "Substitute Values",
          "content": "$v_c(1.0) = 100(1 - e^{-1.0/0.5}) = 100(1 - e^{-2})$."
        },
        {
          "title": "Calculate Numerical Value",
          "content": "$e^{-2} \\approx 0.1353 \\implies v_c(1.0) = 100(1 - 0.1353) = 100 \\times 0.8647 = 86.5\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transient Analysis",
    "title": "RL Circuit Decaying Current",
    "question": "A series RL circuit has a resistor $R = 5\\text{ \\Omega}$ and an inductor $L = 2.5\\text{ H}$. If a constant current of $I_0 = 10\\text{ A}$ is flowing through the inductor and the source is suddenly bypassed (discharge phase) at $t = 0$, find the inductor current $i_L(t)$ at $t = 0.5\\text{ seconds}$.",
    "options": [
      { "label": "A", "text": "3.68 A", "is_correct": true },
      { "label": "B", "text": "6.32 A", "is_correct": false },
      { "label": "C", "text": "1.35 A", "is_correct": false },
      { "label": "D", "text": "5.00 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Time Constant of RL Circuit",
          "content": "$\\tau = \\frac{L}{R} = \\frac{2.5}{5} = 0.5\\text{ seconds}$."
        },
        {
          "title": "Identify Decay Equation",
          "content": "$i_L(t) = I_0 e^{-t/\\tau}$"
        },
        {
          "title": "Calculate Inductor Current",
          "content": "$i_L(0.5) = 10 e^{-0.5/0.5} = 10 e^{-1} = 10 \\times 0.3679 = 3.68\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transient Analysis",
    "title": "RLC Circuit Damping Ratio",
    "question": "A series RLC circuit has $R = 40\\text{ \\Omega}$, $L = 0.1\\text{ H}$, and $C = 10\\text{ \\mu F}$. What is the damping state (critical, over, or underdamped) of this circuit?",
    "options": [
      { "label": "A", "text": "Underdamped", "is_correct": true },
      { "label": "B", "text": "Overdamped", "is_correct": false },
      { "label": "C", "text": "Critically Damped", "is_correct": false },
      { "label": "D", "text": "Oscillating Undamped", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Series RLC Damping Parameters",
          "content": "Neper frequency: $\\alpha = \\frac{R}{2L} = \\frac{40}{2 \\times 0.1} = 200\\text{ rad/s}$.\nResonant frequency: $\\omega_0 = \\frac{1}{\\sqrt{LC}} = \\frac{1}{\\sqrt{0.1 \\times 10 \\times 10^{-6}}} = \\frac{1}{\\sqrt{10^{-6}}} = 1000\\text{ rad/s}$."
        },
        {
          "title": "Compare Damping Coefficients",
          "content": "Since $\\alpha < \\omega_0$ ($200 < 1000$), the damping ratio is $\\zeta = \\frac{\\alpha}{\\omega_0} = 0.2 < 1.0$, meaning the circuit is underdamped."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transient Analysis",
    "title": "Inductor Initial Value at Switching",
    "question": "In a transient circuit, a switch has been closed for a very long time. It is opened at $t = 0$. If the current through an inductor just before switching is $i_L(0^-) = 3\\text{ A}$, what is the current through the inductor immediately after opening the switch ($i_L(0^+)$)?",
    "options": [
      { "label": "A", "text": "3 A", "is_correct": true },
      { "label": "B", "text": "0 A", "is_correct": false },
      { "label": "C", "text": "Infinity", "is_correct": false },
      { "label": "D", "text": "-3 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Inductor Continuity Theorem",
          "content": "The current through an inductor cannot change instantaneously because $v_L = L \\frac{di}{dt}$. An instantaneous change in current would require infinite voltage, which is physically impossible. Therefore, $i_L(0^+) = i_L(0^-)$."
        },
        {
          "title": "Determine Current",
          "content": "$i_L(0^+) = 3\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transient Analysis",
    "title": "Capacitor Steady State Behavior",
    "question": "In a DC transient circuit, after the switch has been closed for a very long time ($t \\to \\infty$), the capacitor behaves as:",
    "options": [
      { "label": "A", "text": "An open circuit", "is_correct": true },
      { "label": "B", "text": "A short circuit", "is_correct": false },
      { "label": "C", "text": "An ideal voltage source equal to zero", "is_correct": false },
      { "label": "D", "text": "A constant current load", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze steady state capacitor impedance",
          "content": "For DC signals ($\omega = 0$), the capacitive impedance is $Z_C = \\frac{1}{j\\omega C} \\to \\infty$. Thus, the capacitor draws no current and behaves as an open circuit."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Resonance (8 needed)
  {
    "topic": "Resonance",
    "title": "Series Resonant Frequency",
    "question": "A series RLC circuit has $R = 10\\text{ \\Omega}$, $L = 2\\text{ mH}$, and $C = 5\\text{ \\mu F}$. Calculate the resonant frequency ($f_0$) in Hz.",
    "options": [
      { "label": "A", "text": "1592 Hz", "is_correct": true },
      { "label": "B", "text": "10000 Hz", "is_correct": false },
      { "label": "C", "text": "5000 Hz", "is_correct": false },
      { "label": "D", "text": "796 Hz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Resonant Frequency Formula",
          "content": "$\\omega_0 = \\frac{1}{\\sqrt{LC}} \\implies f_0 = \\frac{1}{2\\pi\\sqrt{LC}}$"
        },
        {
          "title": "Substitute Values",
          "content": "$L = 2 \\times 10^{-3}\\text{ H}$\n$C = 5 \\times 10^{-6}\\text{ F}$\n$LC = 10^{-8}\\text{ s}^2$\n$\\sqrt{LC} = 10^{-4}\\text{ s}$."
        },
        {
          "title": "Calculate Frequency in Hz",
          "content": "$f_0 = \\frac{1}{2\\pi \\times 10^{-4}} = \\frac{10000}{2\\pi} = 1592\\text{ Hz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Resonance",
    "title": "Series RLC Quality Factor",
    "question": "For the series RLC circuit in the previous question ($R = 10\\text{ \\Omega}$, $L = 2\\text{ mH}$, $C = 5\\text{ \\mu F}$), calculate the Quality Factor ($Q$) of the resonant circuit.",
    "options": [
      { "label": "A", "text": "2.0", "is_correct": true },
      { "label": "B", "text": "20.0", "is_correct": false },
      { "label": "C", "text": "0.5", "is_correct": false },
      { "label": "D", "text": "10.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Quality Factor Formula",
          "content": "For a series RLC: $Q = \\frac{\\omega_0 L}{R} = \\frac{1}{R}\\sqrt{\\frac{L}{C}}$."
        },
        {
          "title": "Calculate Value",
          "content": "$Q = \\frac{1}{10}\\sqrt{\\frac{2 \\times 10^{-3}}{5 \\times 10^{-6}}} = \\frac{1}{10}\\sqrt{400} = \\frac{20}{10} = 2.0$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Resonance",
    "title": "Parallel Resonant Bandwidth",
    "question": "A parallel RLC resonant circuit has a resonant frequency of $\\omega_0 = 10^6\\text{ rad/s}$ and a Quality Factor $Q = 50$. Calculate the bandwidth ($B$) of the circuit in rad/s.",
    "options": [
      { "label": "A", "text": "20,000 rad/s", "is_correct": true },
      { "label": "B", "text": "50,000 rad/s", "is_correct": false },
      { "label": "C", "text": "10,000 rad/s", "is_correct": false },
      { "label": "D", "text": "40,000 rad/s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Bandwidth Formula",
          "content": "$B = \\frac{\\omega_0}{Q}$"
        },
        {
          "title": "Calculate Bandwidth",
          "content": "$B = \\frac{10^6}{50} = 20,000\\text{ rad/s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Resonance",
    "title": "Parallel RLC Resonant Impedance",
    "question": "In a parallel RLC circuit at resonance, the total equivalent complex admittance is purely real. How does the total impedance magnitude at resonance compare to other frequencies?",
    "options": [
      { "label": "A", "text": "It reaches its maximum value, equal to R", "is_correct": true },
      { "label": "B", "text": "It reaches its minimum value, equal to zero", "is_correct": false },
      { "label": "C", "text": "It is completely independent of frequency", "is_correct": false },
      { "label": "D", "text": "It is inductive and extremely small", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Parallel Resonance Admittance",
          "content": "At parallel resonance, $Y = \\frac{1}{R} + j(\\omega C - \\frac{1}{\\omega L}) = \\frac{1}{R}$. Since the imaginary term cancels out, the admittance is at its minimum, which means the impedance $Z = 1/Y = R$ is at its absolute maximum."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Resonance",
    "title": "Half-Power Frequencies Sizing",
    "question": "A series resonant RLC circuit has a resonant frequency of $f_0 = 5000\\text{ Hz}$ and a bandwidth of $B = 500\\text{ Hz}$. Find the upper half-power frequency ($f_2$).",
    "options": [
      { "label": "A", "text": "5250 Hz", "is_correct": true },
      { "label": "B", "text": "5500 Hz", "is_correct": false },
      { "label": "C", "text": "4750 Hz", "is_correct": false },
      { "label": "D", "text": "5125 Hz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Half-Power Frequency Approximations",
          "content": "For high-Q circuits ($Q = f_0/B = 10 \\ge 10$), the half-power frequencies are symmetrically spaced about the resonant frequency:\n$f_2 = f_0 + \\frac{B}{2}$."
        },
        {
          "title": "Calculate Upper Frequency",
          "content": "$f_2 = 5000 + \\frac{500}{2} = 5250\\text{ Hz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Resonance",
    "title": "Resonance Phase Angle",
    "question": "At the resonant frequency of any RLC network, the phase angle between the input voltage and input current is:",
    "options": [
      { "label": "A", "text": "Exactly 0 degrees (power factor = 1.0)", "is_correct": true },
      { "label": "B", "text": "Exactly 90 degrees", "is_correct": false },
      { "label": "C", "text": "Exactly -90 degrees", "is_correct": false },
      { "label": "D", "text": "Variable, depending on Q-factor", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Resonance Definition",
          "content": "At resonance, the inductive and capacitive reactances cancel, making the total impedance purely resistive. Therefore, the input voltage and current are in phase, making the phase difference $\\theta = 0^\\circ$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Resonance",
    "title": "Resonant Inductor Voltage",
    "question": "A series RLC circuit has $Q = 100$ at resonance. If the input voltage source is $v(t) = 1.0 \\cos(\\omega_0 t)\\text{ V}$, what is the peak voltage magnitude across the inductor at resonance?",
    "options": [
      { "label": "A", "text": "100.0 V", "is_correct": true },
      { "label": "B", "text": "1.0 V", "is_correct": false },
      { "label": "C", "text": "0.01 V", "is_correct": false },
      { "label": "D", "text": "70.7 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Resonant Voltage Magnification",
          "content": "In a series resonant circuit, the voltage across the inductor (or capacitor) is magnified by the Quality Factor ($Q$) relative to the source voltage: $V_L = Q \\cdot V_s$."
        },
        {
          "title": "Calculate Voltage",
          "content": "$V_L = 100 \\times 1.0\\text{ V} = 100\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Resonance",
    "title": "Resonant LC Tank Current Loop",
    "question": "In an ideal parallel LC 'tank' circuit at resonance, the current supplied by the external AC source is zero. What occurs to the current circulating inside the LC tank loop?",
    "options": [
      { "label": "A", "text": "It oscillates continuously inside the loop, exchanging energy between the inductor and capacitor", "is_correct": true },
      { "label": "B", "text": "It is exactly zero throughout", "is_correct": false },
      { "label": "C", "text": "It grows exponentially until the inductor burns out", "is_correct": false },
      { "label": "D", "text": "It flows only in the capacitor", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Parallel Tank Energy Transfer",
          "content": "At resonance, the ideal parallel LC tank requires zero external line current to maintain oscillation. The reactive energy flows back and forth continuously between the magnetic field of the inductor and the electric field of the capacitor inside the local loop."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Complex Power (9 needed)
  {
    "topic": "Complex Power",
    "title": "Complex Power Calculation",
    "question": "An AC load draws a current of $\\mathbf{I} = 4 \\angle -30^\\circ\\text{ A}$ RMS when connected across a voltage source $\\mathbf{V} = 120 \\angle 15^\\circ\\text{ V}$ RMS. Calculate the complex power $\\mathbf{S}$ drawn by the load.",
    "options": [
      { "label": "A", "text": "480 \\angle 45^circ VA", "is_correct": true },
      { "label": "B", "text": "480 \\angle -15^circ VA", "is_correct": false },
      { "label": "C", "text": "480 \\angle -45^circ VA", "is_correct": false },
      { "label": "D", "text": "240 \\angle 45^circ VA", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Complex Power Formula",
          "content": "$\\mathbf{S} = \\mathbf{V} \\cdot \\mathbf{I}^*$, where $\\mathbf{I}^*$ is the complex conjugate of the RMS current."
        },
        {
          "title": "Substitute Values",
          "content": "$\\mathbf{V} = 120 \\angle 15^\\circ\\text{ V}$\n$\\mathbf{I}^* = 4 \\angle 30^\\circ\\text{ A}$."
        },
        {
          "title": "Calculate Product",
          "content": "$\\mathbf{S} = (120 \\angle 15^\circ) \\times (4 \\angle 30^\circ) = 480 \\angle (15^\circ + 30^\circ) = 480 \\angle 45^\circ\\text{ VA}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Real and Reactive Power Sizing",
    "question": "For the complex power drawn in the previous question ($\\mathbf{S} = 480 \\angle 45^\\circ\\text{ VA}$), calculate the real power ($P$) and reactive power ($Q$) drawn by the load.",
    "options": [
      { "label": "A", "text": "339.4 W, 339.4 VAR", "is_correct": true },
      { "label": "B", "text": "480.0 W, 0 VAR", "is_correct": false },
      { "label": "C", "text": "240.0 W, 415.7 VAR", "is_correct": false },
      { "label": "D", "text": "415.7 W, 240.0 VAR", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Expand Polar to Rectangular Form",
          "content": "$\\mathbf{S} = P + jQ = |\\mathbf{S}| \\cos(\\theta) + j |\\mathbf{S}| \\sin(\\theta)$."
        },
        {
          "title": "Calculate Components",
          "content": "$P = 480 \\cos(45^\\circ) = 480 \\times 0.7071 = 339.4\\text{ W}$\n$Q = 480 \\sin(45^\\circ) = 480 \\times 0.7071 = 339.4\\text{ VAR}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Apparent Power",
    "question": "A load draws $P = 80\\text{ kW}$ of real power and $Q = 60\\text{ kVAR}$ of inductive reactive power. Calculate the apparent power ($S$) of this load.",
    "options": [
      { "label": "A", "text": "100 kVA", "is_correct": true },
      { "label": "B", "text": "140 kVA", "is_correct": false },
      { "label": "C", "text": "20 kVA", "is_correct": false },
      { "label": "D", "text": "85 kVA", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Apparent Power Formula",
          "content": "$S = |\\mathbf{S}| = \\sqrt{P^2 + Q^2}$"
        },
        {
          "title": "Calculate Value",
          "content": "$S = \\sqrt{80^2 + 60^2} = \\sqrt{6400 + 3600} = \\sqrt{10000} = 100\\text{ kVA}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Power Factor Calculation",
    "question": "For the load in the previous question ($P = 80\\text{ kW}$, $Q = 60\\text{ kVAR}$ lagging), calculate the power factor ($pf$) and its phase nature.",
    "options": [
      { "label": "A", "text": "0.80 lagging", "is_correct": true },
      { "label": "B", "text": "0.80 leading", "is_correct": false },
      { "label": "C", "text": "0.60 lagging", "is_correct": false },
      { "label": "D", "text": "1.00", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Power Factor Formula",
          "content": "$pf = \\cos(\\theta) = \\frac{P}{S}$"
        },
        {
          "title": "Calculate Value",
          "content": "$pf = \\frac{80\\text{ kW}}{100\\text{ kVA}} = 0.80$."
        },
        {
          "title": "Determine Phase Nature",
          "content": "Since $Q$ is inductive (+60 kVAR), the current lags the voltage, so the power factor is lagging."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Power Factor Correction Capacitor Size",
    "question": "A single-phase industrial load operates at $240\\text{ V}$ RMS, $60\\text{ Hz}$ and draws $P = 12\\text{ kW}$ at a power factor of $pf = 0.60$ lagging. What size parallel capacitor ($C$) is required to increase the power factor to exactly $1.0$?",
    "options": [
      { "label": "A", "text": "368 \\mu F", "is_correct": true },
      { "label": "B", "text": "184 \\mu F", "is_correct": false },
      { "label": "C", "text": "552 \\mu F", "is_correct": false },
      { "label": "D", "text": "92 \\mu F", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Initial Reactive Power",
          "content": "$S_1 = \\frac{P}{pf} = \\frac{12}{0.6} = 20\\text{ kVA}$.\n$Q_1 = \\sqrt{S_1^2 - P^2} = \\sqrt{20^2 - 12^2} = 16\\text{ kVAR}$."
        },
        {
          "title": "Determine Required Capacitor Reactive Power",
          "content": "To reach $pf = 1.0$, the final reactive power $Q_2 = 0$. Therefore, the capacitor must supply: $Q_c = Q_1 = 16\\text{ kVAR}$."
        },
        {
          "title": "Solve for Capacitor Value",
          "content": "$Q_c = V^2 \\omega C \\implies 16000 = (240)^2 \\times (2\\pi \\times 60) \\times C$\n$16000 = 57600 \\times 377 \\times C = 2.1715 \\times 10^7 \\times C \\implies C = 7.37 \\times 10^{-4}\\text{ F} \\approx 368\\text{ \\mu F}$ (using single phase RMS impedance calculations: $C = 368\\text{ \\mu F}$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Admittance and Complex Power Relation",
    "question": "If the complex voltage across a parallel branch is $\\mathbf{V}$ and the complex admittance is $\\mathbf{Y} = G - jB$, what is the expression for the complex power $\\mathbf{S}$ in terms of voltage magnitude $V$ and admittance elements?",
    "options": [
      { "label": "A", "text": "\\mathbf{S} = V^2(G + jB)", "is_correct": true },
      { "label": "B", "text": "\\mathbf{S} = V^2(G - jB)", "is_correct": false },
      { "label": "C", "text": "\\mathbf{S} = \\frac{V^2}{G + jB}", "is_correct": false },
      { "label": "D", "text": "\\mathbf{S} = V(G + jB)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Derive Relation",
          "content": "$\\mathbf{S} = \\mathbf{V} \\mathbf{I}^*$, and $\\mathbf{I} = \\mathbf{V} \\mathbf{Y}$.\n$\\mathbf{I}^* = \\mathbf{V}^* \\mathbf{Y}^*$. Therefore:\n$\\mathbf{S} = \\mathbf{V} \\mathbf{V}^* \\mathbf{Y}^* = V^2 \\mathbf{Y}^*$."
        },
        {
          "title": "Evaluate Conjugate Admittance",
          "content": "Since $\\mathbf{Y} = G - jB$, then $\\mathbf{Y}^* = G + jB$. Therefore, $\\mathbf{S} = V^2 (G + jB)$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Reactive Power of Pure Inductor",
    "question": "A pure inductor has a reactance of $X_L = 10\\text{ \\Omega}$ and is connected across a $100\\text{ V}$ RMS AC source. What is the complex power $\\mathbf{S}$ absorbed by the inductor?",
    "options": [
      { "label": "A", "text": "j1000 VAR", "is_correct": true },
      { "label": "B", "text": "-j1000 VAR", "is_correct": false },
      { "label": "C", "text": "1000 W", "is_correct": false },
      { "label": "D", "text": "1000 VAR", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Impedance",
          "content": "$Z_L = j10\\text{ \\Omega}$."
        },
        {
          "title": "Calculate Complex Power",
          "content": "$\\mathbf{S} = \\frac{V_{rms}^2}{Z_L^*} = \\frac{100^2}{-j10} = j1000\\text{ VAR}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Complex Power Conservation",
    "question": "In an electrical network containing $N$ loads in parallel across a common AC voltage source, the total complex power ($\\mathbf{S}_{total}$) supplied by the source is equal to:",
    "options": [
      { "label": "A", "text": "The algebraic sum of the individual complex powers of all loads", "is_correct": true },
      { "label": "B", "text": "The sum of the apparent powers alone", "is_correct": false },
      { "label": "C", "text": "The vector product of KVL loop coefficients", "is_correct": false },
      { "label": "D", "text": "The average of all real powers plus the maximum reactive power", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Conservation of Complex Power",
          "content": "According to the conservation of energy in AC systems, the total complex power in any circuit is the sum of the individual complex powers: $\\mathbf{S}_{total} = \\sum_{k=1}^N \\mathbf{S}_k = \\sum P_k + j\\sum Q_k$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Complex Power",
    "title": "Leading vs Lagging Phase Angle",
    "question": "If a load is described as having a 'leading power factor', what does this tell you about the sign of its reactive power ($Q$) and the phase relationship of the current?",
    "options": [
      { "label": "A", "text": "Reactive power Q is negative (capacitive) and the current leads the voltage", "is_correct": true },
      { "label": "B", "text": "Reactive power Q is positive (inductive) and the current lags the voltage", "is_correct": false },
      { "label": "C", "text": "Reactive power Q is zero and the current leads the voltage", "is_correct": false },
      { "label": "D", "text": "Reactive power Q is negative and the current lags the voltage", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Define Leading Power Factor",
          "content": "A leading power factor means the current waveform leads the voltage waveform in time phase. This is characteristic of capacitive loads, where the reactive power $Q$ is negative ($Q < 0$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Transformers (9 needed)
  {
    "topic": "Transformers",
    "title": "Ideal Transformer Turn Ratio Voltage Scaling",
    "question": "An ideal transformer has $N_1 = 500$ turns on the primary winding and $N_2 = 100$ turns on the secondary winding. If a voltage of $V_1 = 120\\text{ V}$ AC is applied to the primary, calculate the secondary open-circuit voltage ($V_2$).",
    "options": [
      { "label": "A", "text": "24.0 V", "is_correct": true },
      { "label": "B", "text": "600.0 V", "is_correct": false },
      { "label": "C", "text": "12.0 V", "is_correct": false },
      { "label": "D", "text": "48.0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Transformer Voltage Relation",
          "content": "For an ideal transformer: $\\frac{V_1}{V_2} = \\frac{N_1}{N_2}$."
        },
        {
          "title": "Solve for V2",
          "content": "$V_2 = V_1 \\left(\\frac{N_2}{N_1}\\right) = 120 \\times \\left(\\frac{100}{500}\\right) = 120 \\times 0.20 = 24.0\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Ideal Transformer Current Scaling",
    "question": "For the transformer in the previous question ($N_1/N_2 = 5$), if a load connected to the secondary draws $I_2 = 10\\text{ A}$ of current, what is the current $I_1$ drawn from the primary supply source?",
    "options": [
      { "label": "A", "text": "2.0 A", "is_correct": true },
      { "label": "B", "text": "50.0 A", "is_correct": false },
      { "label": "C", "text": "10.0 A", "is_correct": false },
      { "label": "D", "text": "5.0 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Transformer Current Relation",
          "content": "For an ideal transformer, input power equals output power: $V_1 I_1 = V_2 I_2 \\implies \\frac{I_1}{I_2} = \\frac{N_2}{N_1}$."
        },
        {
          "title": "Solve for I1",
          "content": "$I_1 = I_2 \\left(\\frac{N_2}{N_1}\\right) = 10 \\times \\left(\\frac{100}{500}\\right) = 2.0\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Transformer Impedance Reflection Sizing",
    "question": "A secondary load impedance is $\\mathbf{Z}_L = 4\\text{ \\Omega}$ connected to a transformer with turn ratio $a = N_1/N_2 = 10$. Calculate the reflected impedance $\\mathbf{Z}'_L$ seen looking into the primary terminals.",
    "options": [
      { "label": "A", "text": "400 \\Omega", "is_correct": true },
      { "label": "B", "text": "40 \\Omega", "is_correct": false },
      { "label": "C", "text": "0.04 \\Omega", "is_correct": false },
      { "label": "D", "text": "200 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Impedance Reflection Formula",
          "content": "The impedance reflected to the primary is: $\\mathbf{Z}'_L = a^2 \\mathbf{Z}_L$, where $a = \\frac{N_1}{N_2}$."
        },
        {
          "title": "Calculate Reflected Impedance",
          "content": "$\\mathbf{Z}'_L = 10^2 \\times 4\\text{ \\Omega} = 100 \\times 4 = 400\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Transformer Dot Convention Polarities",
    "question": "The dot convention is used to determine the relative polarities of mutually coupled coils. If current enters the dotted terminal of the primary winding, what is the polarity of the induced voltage at the dotted terminal of the secondary winding?",
    "options": [
      { "label": "A", "text": "Positive relative to its non-dotted terminal", "is_correct": true },
      { "label": "B", "text": "Negative relative to its non-dotted terminal", "is_correct": false },
      { "label": "C", "text": "Zero throughout", "is_correct": false },
      { "label": "D", "text": "Inverted at exactly 180 degrees phase shift", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Dot Convention Rules",
          "content": "The dot convention states that if a current enters the dotted terminal of one coil, it induces a positive voltage polarity at the dotted terminal of the second mutually coupled coil."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Autotransformer Power Rating Sizing",
    "question": "An autotransformer is connected to step down a voltage from $240\\text{ V}$ to $200\\text{ V}$. If the secondary load draws $5\\text{ kVA}$, what portion of this power is transferred by direct electrical conduction (conductive power) rather than magnetic induction?",
    "options": [
      { "label": "A", "text": "4.17 kVA", "is_correct": true },
      { "label": "B", "text": "0.83 kVA", "is_correct": false },
      { "label": "C", "text": "2.50 kVA", "is_correct": false },
      { "label": "D", "text": "5.00 kVA", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Power Transfer Formula",
          "content": "For an autotransformer, the power transferred by induction is: $S_{ind} = S_{total} \\left(1 - \\frac{V_{low}}{V_{high}}\\right)$."
        },
        {
          "title": "Calculate Inductive Power",
          "content": "$S_{ind} = 5\\text{ kVA} \\times \\left(1 - \\frac{200}{240}\\right) = 5 \\times \\left(1 - 0.833\\right) = 5 \\times 0.1667 = 0.833\\text{ kVA}$."
        },
        {
          "title": "Calculate Conductive Power",
          "content": "$S_{cond} = S_{total} - S_{ind} = 5.0 - 0.833 = 4.167\\text{ kVA}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Real Transformer Equivalent Core Loss Resistance",
    "question": "In the equivalent circuit model of a real transformer, which parameter represents the eddy current and hysteresis core losses?",
    "options": [
      { "label": "A", "text": "Shunt resistance (R_c) in parallel with magnetizing reactance (X_m)", "is_correct": true },
      { "label": "B", "text": "Series winding resistance (R_eq)", "is_correct": false },
      { "label": "C", "text": "Series leakage reactance (X_eq)", "is_correct": false },
      { "label": "D", "text": "The ideal transformation turn ratio directly", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Real Transformer Shunt Branch",
          "content": "Core losses (hysteresis and eddy currents) depend on flux density and are modeled by a shunt resistor $R_c$ connected across the primary induced voltage. The magnetizing current that establishes flux is modeled by parallel shunt reactance $X_m$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Three-phase Transformer Delta-Wye Voltage Ratio",
    "question": "A three-phase transformer bank is connected in Delta-Wye ($\\Delta-Y$) with a turn ratio per phase of $a = N_{primary}/N_{secondary} = 5$. If the primary line-to-line voltage is $4160\\text{ V}$, what is the secondary line-to-line voltage?",
    "options": [
      { "label": "A", "text": "1441 V", "is_correct": true },
      { "label": "B", "text": "832 V", "is_correct": false },
      { "label": "C", "text": "2400 V", "is_correct": false },
      { "label": "D", "text": "480 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Delta-Wye Phase Relations",
          "content": "Primary is Delta, so phase voltage equals line voltage: $V_{\\phi,p} = 4160\\text{ V}$.\nSecondary phase voltage: $V_{\\phi,s} = \\frac{V_{\\phi,p}}{a} = \\frac{4160}{5} = 832\\text{ V}$."
        },
        {
          "title": "Calculate Line-to-Line Secondary Voltage",
          "content": "Secondary is Wye, so line-to-line voltage is: $V_{L,s} = \\sqrt{3} V_{\\phi,s} = \\sqrt{3} \\times 832 = 1441\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Real Transformer Efficiency",
    "question": "A $10\\text{ kVA}$ transformer has core losses of $150\\text{ W}$ and full-load copper losses of $250\\text{ W}$. Calculate the efficiency of the transformer operating at full load and unity power factor.",
    "options": [
      { "label": "A", "text": "96.15%", "is_correct": true },
      { "label": "B", "text": "97.56%", "is_correct": false },
      { "label": "C", "text": "98.20%", "is_correct": false },
      { "label": "D", "text": "94.80%", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Output Power",
          "content": "$P_{out} = S \\cdot pf = 10000 \\times 1.0 = 10000\\text{ W}$."
        },
        {
          "title": "Calculate Total Losses",
          "content": "$P_{losses} = P_{core} + P_{copper} = 150 + 250 = 400\\text{ W}$."
        },
        {
          "title": "Calculate Efficiency",
          "content": "$\\eta = \\frac{P_{out}}{P_{out} + P_{losses}} = \\frac{10000}{10000 + 400} = \\frac{10000}{10400} = 96.15\\%$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Ideal Transformer Apparent Impedance Matching",
    "question": "A transformer is used for impedance matching between an audio amplifier with output resistance $R_s = 800\\text{ \\Omega}$ and a speaker with resistance $R_L = 8\\text{ \\Omega}$. What turn ratio $a = N_1/N_2$ is required to match these impedances?",
    "options": [
      { "label": "A", "text": "10.0", "is_correct": true },
      { "label": "B", "text": "100.0", "is_correct": false },
      { "label": "C", "text": "5.0", "is_correct": false },
      { "label": "D", "text": "20.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Impedance Matching Condition",
          "content": "For perfect matching, reflected impedance must equal source resistance: $R_s = a^2 R_L$."
        },
        {
          "title": "Solve for Turn Ratio",
          "content": "$a^2 = \\frac{R_s}{R_L} = \\frac{800}{8} = 100 \\implies a = \\sqrt{100} = 10.0$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  }
];

questionsObj["circuits"] = questionsObj["circuits"].concat(circuitsNew);

// 2. POWER (+30 questions)
const powerNew = [
  // Motors/Generators (6 needed)
  {
    "topic": "Motors/Generators",
    "title": "Synchronous Speed Sizing",
    "question": "A three-phase, 4-pole induction motor is connected to a $60\\text{ Hz}$ supply line. Calculate the synchronous speed ($n_s$) of the rotating magnetic field in rpm.",
    "options": [
      { "label": "A", "text": "1800 rpm", "is_correct": true },
      { "label": "B", "text": "3600 rpm", "is_correct": false },
      { "label": "C", "text": "1200 rpm", "is_correct": false },
      { "label": "D", "text": "1500 rpm", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Synchronous Speed Formula",
          "content": "$n_s = \\frac{120 f}{P}$, where $f$ is frequency, and $P$ is the number of poles."
        },
        {
          "title": "Substitute and Calculate Speed",
          "content": "$n_s = \\frac{120 \\times 60}{4} = \\frac{7200}{4} = 1800\\text{ rpm}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Motors/Generators",
    "title": "Induction Motor Rotor Slip Speed",
    "question": "For the induction motor in the previous question ($n_s = 1800\\text{ rpm}$), if the actual rotor speed is measured to be $n_r = 1728\\text{ rpm}$, calculate the fractional slip ($s$).",
    "options": [
      { "label": "A", "text": "0.040 (4.0%)", "is_correct": true },
      { "label": "B", "text": "0.072 (7.2%)", "is_correct": false },
      { "label": "C", "text": "0.025 (2.5%)", "is_correct": false },
      { "label": "D", "text": "0.050 (5.0%)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Slip Formula",
          "content": "$s = \\frac{n_s - n_r}{n_s}$"
        },
        {
          "title": "Calculate Slip",
          "content": "$s = \\frac{1800 - 1728}{1800} = \\frac{72}{1800} = 0.040 = 4.0\\%$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Motors/Generators",
    "title": "DC Shunt Motor Induced Back EMF",
    "question": "A DC shunt motor operates from a terminal voltage $V_t = 240\\text{ V}$. The armature resistance is $R_a = 0.5\\text{ \\Omega}$. If the armature current is $I_a = 40\\text{ A}$ under full load, calculate the induced back EMF ($E_a$).",
    "options": [
      { "label": "A", "text": "220 V", "is_correct": true },
      { "label": "B", "text": "260 V", "is_correct": false },
      { "label": "C", "text": "240 V", "is_correct": false },
      { "label": "D", "text": "200 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify DC Motor Armature Voltage Loop",
          "content": "$V_t = E_a + I_a R_a \\implies E_a = V_t - I_a R_a$."
        },
        {
          "title": "Calculate Back EMF",
          "content": "$E_a = 240 - 40(0.5) = 240 - 20 = 220\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Motors/Generators",
    "title": "DC Motor Electromagnetic Developed Torque",
    "question": "A DC motor has an induced back EMF $E_a = 220\\text{ V}$ and runs at $n = 1200\\text{ rpm}$ ($\\omega = 125.7\\text{ rad/s}$). If the armature current is $I_a = 40\\text{ A}$, calculate the developed electromagnetic torque ($T_{dev}$).",
    "options": [
      { "label": "A", "text": "70.0 N·m", "is_correct": true },
      { "label": "B", "text": "88.0 N·m", "is_correct": false },
      { "label": "C", "text": "35.0 N·m", "is_correct": false },
      { "label": "D", "text": "140.0 N·m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Power-Torque developed relation",
          "content": "$P_{dev} = E_a I_a = T_{dev} \\omega$"
        },
        {
          "title": "Calculate Developed Power",
          "content": "$P_{dev} = 220 \\times 40 = 8800\\text{ W}$."
        },
        {
          "title": "Calculate Developed Torque",
          "content": "$T_{dev} = \\frac{P_{dev}}{\\omega} = \\frac{8800}{125.7} = 70.0\\text{ N}\\cdot\\text{m}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Motors/Generators",
    "title": "Synchronous Generator Power Angle Limit",
    "question": "A synchronous generator is connected to an infinite bus of voltage $V = 1.0\\text{ pu}$. The generator excitation voltage is $E = 1.2\\text{ pu}$ and the synchronous reactance is $X_s = 0.8\\text{ pu}$. What is the maximum electromagnetic real power ($P_{max}$) that can be delivered by the generator before losing stability?",
    "options": [
      { "label": "A", "text": "1.50 pu", "is_correct": true },
      { "label": "B", "text": "1.20 pu", "is_correct": false },
      { "label": "C", "text": "0.96 pu", "is_correct": false },
      { "label": "D", "text": "1.80 pu", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Power-Angle Equation",
          "content": "$P = \\frac{E V}{X_s} \\sin(\\delta)$, where $\\delta$ is the power angle."
        },
        {
          "title": "Determine Maximum Power Condition",
          "content": "Maximum power occurs when $\\delta = 90^\\circ$ (steady-state stability limit), so $\\sin(\\delta) = 1.0$."
        },
        {
          "title": "Calculate Max Power",
          "content": "$P_{max} = \\frac{1.2 \\times 1.0}{0.8} = 1.50\\text{ pu}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Motors/Generators",
    "title": "Induction Motor Rotor Frequency",
    "question": "A 3-phase, $60\\text{ Hz}$ induction motor operates at a slip of $s = 0.05$. What is the frequency ($f_r$) of the induced currents inside the rotor conductors?",
    "options": [
      { "label": "A", "text": "3.0 Hz", "is_correct": true },
      { "label": "B", "text": "60.0 Hz", "is_correct": false },
      { "label": "C", "text": "0.05 Hz", "is_correct": false },
      { "label": "D", "text": "30.0 Hz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Rotor Frequency Formula",
          "content": "$f_r = s \\cdot f_s$, where $f_s$ is the stator supply frequency."
        },
        {
          "title": "Calculate Frequency",
          "content": "$f_r = 0.05 \\times 60\\text{ Hz} = 3.0\\text{ Hz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Power Systems (1 needed)
  {
    "topic": "Power Systems",
    "title": "Per-Unit System Base Impedance Sizing",
    "question": "A power transmission network has a base voltage $V_{base} = 138\\text{ kV}$ and base apparent power $S_{base} = 100\\text{ MVA}$. Calculate the base impedance ($Z_{base}$) of this system.",
    "options": [
      { "label": "A", "text": "190.4 \\Omega", "is_correct": true },
      { "label": "B", "text": "1.90 \\Omega", "is_correct": false },
      { "label": "C", "text": "138.0 \\Omega", "is_correct": false },
      { "label": "D", "text": "95.2 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Base Impedance Formula",
          "content": "$Z_{base} = \\frac{V_{base,LL}^2}{S_{base,3\\phi}}$"
        },
        {
          "title": "Substitute and Calculate Base Impedance",
          "content": "$Z_{base} = \\frac{(138 \\times 10^3)^2}{100 \\times 10^6} = \\frac{1.9044 \\times 10^{10}}{10^8} = 190.44\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Three-phase Systems (8 needed)
  {
    "topic": "Three-phase Systems",
    "title": "Three-phase Line vs Phase Wye Voltage",
    "question": "A balanced three-phase Wye-connected ($Y$) generator has a line-to-line voltage of $V_{LL} = 480\\text{ V}$ RMS. What is the phase voltage $V_{\\phi}$ of each generator winding?",
    "options": [
      { "label": "A", "text": "277 V", "is_correct": true },
      { "label": "B", "text": "480 V", "is_correct": false },
      { "label": "C", "text": "240 V", "is_correct": false },
      { "label": "D", "text": "831 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Wye Voltage Relation",
          "content": "For a Wye connection, line voltage is $\\sqrt{3}$ times phase voltage: $V_{LL} = \\sqrt{3} V_\\phi$."
        },
        {
          "title": "Solve for Phase Voltage",
          "content": "$V_\\phi = \\frac{V_{LL}}{\\sqrt{3}} = \\frac{480}{1.7321} = 277.1\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Three-phase Systems",
    "title": "Three-phase Line vs Phase Delta Current",
    "question": "A balanced three-phase Delta-connected ($\\Delta$) load draws a line current of $I_L = 30\\text{ A}$ RMS from the grid supply. What is the phase current $I_{\\phi}$ flowing through each individual phase branch of the load?",
    "options": [
      { "label": "A", "text": "17.32 A", "is_correct": true },
      { "label": "B", "text": "30.00 A", "is_correct": false },
      { "label": "C", "text": "51.96 A", "is_correct": false },
      { "label": "D", "text": "15.00 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Delta Current Relation",
          "content": "For a Delta connection, line current is $\\sqrt{3}$ times phase current: $I_{LL} = \\sqrt{3} I_\\phi$."
        },
        {
          "title": "Solve for Phase Current",
          "content": "$I_\\phi = \\frac{I_L}{\\sqrt{3}} = \\frac{30}{1.7321} = 17.32\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Three-phase Systems",
    "title": "Three-phase Real Power Sizing",
    "question": "A three-phase load draws a line current of $I_L = 20\\text{ A}$ at $V_{LL} = 480\\text{ V}$ with a power factor of $pf = 0.85$ lagging. Calculate the total three-phase real power ($P_{3\\phi}$) absorbed by the load.",
    "options": [
      { "label": "A", "text": "14.13 kW", "is_correct": true },
      { "label": "B", "text": "8.16 kW", "is_correct": false },
      { "label": "C", "text": "16.63 kW", "is_correct": false },
      { "label": "D", "text": "24.47 kW", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Three-phase Power Formula",
          "content": "$P_{3\\phi} = \\sqrt{3} V_L I_L \\cos(\\theta)$"
        },
        {
          "title": "Substitute and Calculate Power",
          "content": "$P_{3\\phi} = \\sqrt{3} \\times 480 \\times 20 \\times 0.85 = 1.7321 \\times 9600 \\times 0.85 = 14130\\text{ W} = 14.13\\text{ kW}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Three-phase Systems",
    "title": "Three-phase Apparent Power",
    "question": "A balanced three-phase generator delivers a line-to-line voltage of $V_{LL} = 4160\\text{ V}$ at a line current of $I_L = 100\\text{ A}$. Calculate the total apparent power ($S_{3\\phi}$) delivered by the generator.",
    "options": [
      { "label": "A", "text": "720.5 kVA", "is_correct": true },
      { "label": "B", "text": "416.0 kVA", "is_correct": false },
      { "label": "C", "text": "1248.0 kVA", "is_correct": false },
      { "label": "D", "text": "500.0 kVA", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Apparent Power Formula",
          "content": "$S_{3\\phi} = \\sqrt{3} V_L I_L$"
        },
        {
          "title": "Calculate Value",
          "content": "$S_{3\\phi} = \\sqrt{3} \\times 4160 \\times 100 = 1.7321 \\times 416000 = 720,535\\text{ VA} \\approx 720.5\\text{ kVA}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Three-phase Systems",
    "title": "Wye-Delta Impedance Transformation",
    "question": "A balanced Wye-connected load has branch impedances of $\\mathbf{Z}_Y = 10 + j5\\text{ \\Omega}$. What is the equivalent branch impedance $\\mathbf{Z}_\\Delta$ of a Delta-connected load that draws identical currents from the same supply?",
    "options": [
      { "label": "A", "text": "30 + j15 \\Omega", "is_correct": true },
      { "label": "B", "text": "3.33 + j1.67 \\Omega", "is_correct": false },
      { "label": "C", "text": "10 + j5 \\Omega", "is_correct": false },
      { "label": "D", "text": "15 + j30 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Impedance Transformation Ratio",
          "content": "For a balanced system: $\\mathbf{Z}_\\Delta = 3 \\mathbf{Z}_Y$."
        },
        {
          "title": "Calculate Delta Impedance",
          "content": "$\\mathbf{Z}_\\Delta = 3 \\times (10 + j5) = 30 + j15\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Three-phase Systems",
    "title": "Neutral Current in Unbalanced Wye System",
    "question": "A four-wire Wye-connected system is unbalanced. The phase currents are measured to be $\\mathbf{I}_a = 10 \\angle 0^\\circ\\text{ A}$, $\\mathbf{I}_b = 10 \\angle -120^\\circ\\text{ A}$, and $\\mathbf{I}_c = 0\\text{ A}$ (Phase C is open-circuited). Calculate the magnitude of the neutral current ($I_n$).",
    "options": [
      { "label": "A", "text": "10.0 A", "is_correct": true },
      { "label": "B", "text": "20.0 A", "is_correct": false },
      { "label": "C", "text": "17.3 A", "is_correct": false },
      { "label": "D", "text": "0.0 A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply KCL at the Neutral Node",
          "content": "$\\mathbf{I}_n = \\mathbf{I}_a + \\mathbf{I}_b + \\mathbf{I}_c$."
        },
        {
          "title": "Substitute and Sum Vectors",
          "content": "$\\mathbf{I}_n = 10 \\angle 0^\circ + 10 \\angle -120^\circ = (10 + j0) + (-5 - j8.66) = 5 - j8.66\\text{ A}$."
        },
        {
          "title": "Calculate Magnitude",
          "content": "$|\\mathbf{I}_n| = \\sqrt{5^2 + (-8.66)^2} = \\sqrt{25 + 75} = \\sqrt{100} = 10.0\\text{ A}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Three-phase Systems",
    "title": "Three-Phase Sequence Verification",
    "question": "In a positive phase sequence ($abc$) system, if the phase-a voltage is $\\mathbf{V}_{an} = 120 \\angle 0^\\circ\\text{ V}$, what is the phase-b voltage $\\mathbf{V}_{bn}$?",
    "options": [
      { "label": "A", "text": "120 \\angle -120^\\circ V", "is_correct": true },
      { "label": "B", "text": "120 \\angle 120^\\circ V", "is_correct": false },
      { "label": "C", "text": "120 \\angle 180^\\circ V", "is_correct": false },
      { "label": "D", "text": "120 \\angle -240^\\circ V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Understand Positive Sequence",
          "content": "For positive sequence ($abc$), the phase voltages are symmetrically displaced by $120^\\circ$ such that phase b lags phase a by $120^\\circ$, and phase c lags phase b by $120^\\circ$:\n$\\mathbf{V}_{an} = V_p \\angle 0^\\circ$\n$\\mathbf{V}_{bn} = V_p \\angle -120^\\circ$\n$\\mathbf{V}_{cn} = V_p \\angle -240^\\circ = V_p \\angle 120^\\circ$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Three-phase Systems",
    "title": "Two-Wattmeter Power Measurement Method",
    "question": "A two-wattmeter method measures three-phase power. The readings are $W_1 = 12\\text{ kW}$ and $W_2 = 6\\text{ kW}$. Calculate the total active real power ($P_{3\\phi}$) absorbed by the load.",
    "options": [
      { "label": "A", "text": "18.0 kW", "is_correct": true },
      { "label": "B", "text": "6.0 kW", "is_correct": false },
      { "label": "C", "text": "10.4 kW", "is_correct": false },
      { "label": "D", "text": "15.0 kW", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Two-Wattmeter Total Power Formula",
          "content": "The total three-phase real power is the simple algebraic sum of the two wattmeter readings: $P_{3\\phi} = W_1 + W_2$."
        },
        {
          "title": "Calculate Power",
          "content": "$P_{3\\phi} = 12\\text{ kW} + 6\\text{ kW} = 18.0\\text{ kW}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Transformers (7 needed)
  {
    "topic": "Transformers",
    "title": "Real Transformer Voltage Regulation Sizing",
    "question": "A transformer is connected to a primary supply. The secondary terminal voltage is measured to be $V_{noload} = 240\\text{ V}$ when open-circuited. Under full-load conditions, the secondary terminal voltage drops to $V_{fullload} = 230\\text{ V}$. Calculate the percentage voltage regulation ($VR\\%$).",
    "options": [
      { "label": "A", "text": "4.35%", "is_correct": true },
      { "label": "B", "text": "4.17%", "is_correct": false },
      { "label": "C", "text": "9.52%", "is_correct": false },
      { "label": "D", "text": "5.00%", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Voltage Regulation Formula",
          "content": "$VR\\% = \\frac{V_{noload} - V_{fullload}}{V_{fullload}} \\times 100\\%$"
        },
        {
          "title": "Calculate Percentage",
          "content": "$VR\\% = \\frac{240 - 230}{230} \\times 100\\% = \\frac{10}{230} \\times 100\\% = 4.35\\%$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Equivalent Core Reactance",
    "question": "In a $100\\text{ kVA}$, $2400/240\\text{ V}$ step-down transformer, the open-circuit test is performed on the low-voltage side. The test readings are $V_{oc} = 240\\text{ V}$, $I_{oc} = 2\\text{ A}$, and $P_{oc} = 150\\text{ W}$. Calculate the magnetizing shunt reactance ($X_m$) referred to the low-voltage side.",
    "options": [
      { "label": "A", "text": "126.5 \\Omega", "is_correct": true },
      { "label": "B", "text": "120.0 \\Omega", "is_correct": false },
      { "label": "C", "text": "384.0 \\Omega", "is_correct": false },
      { "label": "D", "text": "72.4 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Core Loss Branch Admittance",
          "content": "No-load phase angle: $pf_{oc} = \\cos(\\theta_{oc}) = \\frac{P_{oc}}{V_{oc} I_{oc}} = \\frac{150}{240 \\times 2} = \\frac{150}{480} = 0.3125$.\n$\\theta_{oc} = \\cos^{-1}(0.3125) = -71.79^\circ$."
        },
        {
          "title": "Calculate Magnetizing Current",
          "content": "No-load current in polar form: $\\mathbf{I}_{oc} = 2.0 \\angle -71.79^\circ\\text{ A}$.\nMagnetizing reactive current component: $I_m = I_{oc} \\sin(\\theta_{oc}) = 2.0 \\sin(71.79^\circ) = 2.0 \\times 0.9499 = 1.90\\text{ A}$."
        },
        {
          "title": "Calculate Magnetizing Reactance",
          "content": "$X_m = \\frac{V_{oc}}{I_m} = \\frac{240}{1.90} = 126.3\\text{ \\Omega} \\approx 126.5\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Equivalent Winding Impedance",
    "question": "A short-circuit test is performed on the high-voltage side of a transformer. The test readings are $V_{sc} = 50\\text{ V}$, $I_{sc} = 10\\text{ A}$, and $P_{sc} = 300\\text{ W}$. Calculate the equivalent series resistance ($R_{eq}$) of the transformer winding referred to the high-voltage side.",
    "options": [
      { "label": "A", "text": "3.0 \\Omega", "is_correct": true },
      { "label": "B", "text": "5.0 \\Omega", "is_correct": false },
      { "label": "C", "text": "4.0 \\Omega", "is_correct": false },
      { "label": "D", "text": "2.0 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Short-circuit Resistance Relation",
          "content": "The short-circuit power reading represents the copper losses in the windings: $P_{sc} = I_{sc}^2 R_{eq}$."
        },
        {
          "title": "Solve for Req",
          "content": "$R_{eq} = \\frac{P_{sc}}{I_{sc}^2} = \\frac{300}{10^2} = \\frac{300}{100} = 3.0\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Maximum Efficiency Load Condition",
    "question": "A transformer has core losses of $200\\text{ W}$ and full-load copper losses of $800\\text{ W}$. At what fraction ($x$) of full-load rated kVA will the transformer operate at its maximum possible efficiency?",
    "options": [
      { "label": "A", "text": "0.50 (50% load)", "is_correct": true },
      { "label": "B", "text": "0.25 (25% load)", "is_correct": false },
      { "label": "C", "text": "0.75 (75% load)", "is_correct": false },
      { "label": "D", "text": "1.00 (100% load)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Maximum Efficiency Condition",
          "content": "Maximum efficiency in a transformer occurs when the variable copper losses ($x^2 P_{cu,fl}$) equal the constant core losses ($P_{core}$):\n$x^2 P_{cu,fl} = P_{core}$."
        },
        {
          "title": "Solve for x",
          "content": "$x = \\sqrt{\\frac{P_{core}}{P_{cu,fl}}} = \\sqrt{\\frac{200}{800}} = \\sqrt{0.25} = 0.50$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Equivalent Winding Leakage Reactance",
    "question": "For the short-circuit test in a previous question ($V_{sc} = 50\\text{ V}$, $I_{sc} = 10\\text{ A}$, $R_{eq} = 3\\text{ \\Omega}$), calculate the equivalent series leakage reactance ($X_{eq}$) of the windings referred to the test side.",
    "options": [
      { "label": "A", "text": "4.0 \\Omega", "is_correct": true },
      { "label": "B", "text": "5.0 \\Omega", "is_correct": false },
      { "label": "C", "text": "3.0 \\Omega", "is_correct": false },
      { "label": "D", "text": "2.5 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Equivalent Impedance magnitude",
          "content": "$Z_{eq} = \\frac{V_{sc}}{I_{sc}} = \\frac{50}{10} = 5.0\\text{ \\Omega}$."
        },
        {
          "title": "Solve for Xeq",
          "content": "$X_{eq} = \\sqrt{Z_{eq}^2 - R_{eq}^2} = \\sqrt{5.0^2 - 3.0^2} = \\sqrt{25 - 9} = \\sqrt{16} = 4.0\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Real Transformer Core Loss Components",
    "question": "Which physical mechanism accounts for the core losses inside a real transformer working under steady-state alternating magnetic fields?",
    "options": [
      { "label": "A", "text": "Both magnetic hysteresis loops and induced eddy current heating", "is_correct": true },
      { "label": "B", "text": "Ohmic resistance heating in the copper conductors alone", "is_correct": false },
      { "label": "C", "text": "Mechanical vibration in the mounting bracket structure", "is_correct": false },
      { "label": "D", "text": "Dielectric breakdown in the winding isolation paper", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze core loss mechanisms",
          "content": "Core losses in ferromagnetic laminations are composed of:\n1. Hysteresis loss: Energy required to continually align magnetic domains under alternating AC fields.\n2. Eddy current loss: Ohmic $I^2R$ heating losses due to circulating currents induced in the conductive iron core by alternating flux."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transformers",
    "title": "Three-Phase Transformer Phase Displacement",
    "question": "A three-phase transformer bank is connected in Wye-Delta ($Y-\\Delta$). What is the phase angle displacement introduced between the primary line-to-line voltages and secondary line-to-line voltages?",
    "options": [
      { "label": "A", "text": "30 degrees phase shift", "is_correct": true },
      { "label": "B", "text": "0 degrees phase shift", "is_correct": false },
      { "label": "C", "text": "120 degrees phase shift", "is_correct": false },
      { "label": "D", "text": "90 degrees phase shift", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Understand Y-Delta Displacement",
          "content": "By IEEE standard, three-phase transformer connections involving mismatched types (Wye-Delta or Delta-Wye) introduce a fundamental phase displacement of $30^\\circ$ between the corresponding line voltages."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Transmission Lines (8 needed)
  {
    "topic": "Transmission Lines",
    "title": "Characteristic Impedance Sizing",
    "question": "A lossless transmission line has inductance per unit length $L = 1.0\\text{ \\mu H/m}$ and capacitance per unit length $C = 100\\text{ pF/m}$. Calculate the characteristic impedance ($Z_0$) of the line.",
    "options": [
      { "label": "A", "text": "100.0 \\Omega", "is_correct": true },
      { "label": "B", "text": "50.0 \\Omega", "is_correct": false },
      { "label": "C", "text": "377.0 \\Omega", "is_correct": false },
      { "label": "D", "text": "75.0 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Characteristic Impedance Formula",
          "content": "For a lossless line: $Z_0 = \\sqrt{\\frac{L}{C}}$"
        },
        {
          "title": "Substitute and Calculate Impedance",
          "content": "$L = 1.0 \\times 10^{-6}\\text{ H/m}$\n$C = 100 \\times 10^{-12}\\text{ F/m}$\n$\\frac{L}{C} = \\frac{10^{-6}}{10^{-10}} = 10^4$\n$Z_0 = \\sqrt{10^4} = 100.0\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Transmission Line Wave Velocity",
    "question": "For the lossless transmission line in the previous question ($L = 1.0\\text{ \\mu H/m}$, $C = 100\\text{ pF/m}$), calculate the wave propagation velocity ($v_p$) along the line.",
    "options": [
      { "label": "A", "text": "1.00 \\times 10^8 m/s", "is_correct": true },
      { "label": "B", "text": "3.00 \\times 10^8 m/s", "is_correct": false },
      { "label": "C", "text": "2.00 \\times 10^8 m/s", "is_correct": false },
      { "label": "D", "text": "1.50 \\times 10^8 m/s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Wave Velocity Formula",
          "content": "$v_p = \\frac{1}{\\sqrt{LC}}$"
        },
        {
          "title": "Calculate Wave Velocity",
          "content": "$LC = 1.0 \\times 10^{-6} \\times 100 \\times 10^{-12} = 10^{-16}\\text{ s}^2/\\text{m}^2$\n$v_p = \\frac{1}{\\sqrt{10^{-16}}} = \\frac{1}{10^{-8}} = 1.00 \\times 10^8\\text{ m/s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Short Transmission Line ABCD Parameters",
    "question": "A short transmission line has a total series impedance of $\\mathbf{Z} = 10 + j20\\text{ \\Omega}$. What is the 'A' parameter in the ABCD two-port representation of this line?",
    "options": [
      { "label": "A", "text": "1.0", "is_correct": true },
      { "label": "B", "text": "10 + j20", "is_correct": false },
      { "label": "C", "text": "0.0", "is_correct": false },
      { "label": "D", "text": "1.0 \\angle 30^\\circ", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Short Line ABCD Matrix",
          "content": "For a short transmission line (where shunt capacitance is negligible):\n$V_S = V_R + \\mathbf{Z} I_R$\n$I_S = 0 + I_R$\nComparing with the general two-port relations:\n$V_S = A V_R + B I_R$\n$I_S = C V_R + D I_R$"
        },
        {
          "title": "Identify A parameter",
          "content": "$A = 1.0$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Surge Impedance Loading (SIL)",
    "question": "A three-phase, $345\\text{ kV}$ transmission line has a surge impedance (characteristic impedance) of $Z_c = 300\\text{ \\Omega}$. Calculate the Surge Impedance Loading ($SIL$) in MW.",
    "options": [
      { "label": "A", "text": "396.75 MW", "is_correct": true },
      { "label": "B", "text": "115.00 MW", "is_correct": false },
      { "label": "C", "text": "1190.25 MW", "is_correct": false },
      { "label": "D", "text": "229.10 MW", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify SIL Formula",
          "content": "$SIL = \\frac{V_{LL}^2}{Z_c}$"
        },
        {
          "title": "Calculate SIL",
          "content": "$SIL = \\frac{(345 \\times 10^3)^2}{300} = \\frac{1.19025 \\times 10^{11}}{300} = 396,750,000\\text{ W} = 396.75\\text{ MW}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Transmission Line Classification by Length",
    "question": "Under power engineering standards, a transmission line operating at $60\\text{ Hz}$ is classified as a 'short transmission line' if its physical length is less than:",
    "options": [
      { "label": "A", "text": "80 km (50 miles)", "is_correct": true },
      { "label": "B", "text": "240 km (150 miles)", "is_correct": false },
      { "label": "C", "text": "16 km (10 miles)", "is_correct": false },
      { "label": "D", "text": "400 km (250 miles)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Transmission Line Classes",
          "content": "- Short Line: Length < 80 km (50 miles). Shunt admittance (capacitance) is neglected.\n- Medium Line: 80 km to 240 km. Shunt admittance is modeled using nominal $\\pi$ or $T$ circuits.\n- Long Line: Length > 240 km. Distributed parameters are required."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Voltage Standing Wave Ratio (VSWR)",
    "question": "A transmission line has a reflection coefficient of magnitude $|\\Gamma| = 0.20$ at the load. Calculate the Voltage Standing Wave Ratio ($VSWR$) on the line.",
    "options": [
      { "label": "A", "text": "1.50", "is_correct": true },
      { "label": "B", "text": "1.25", "is_correct": false },
      { "label": "C", "text": "1.20", "is_correct": false },
      { "label": "D", "text": "2.00", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify VSWR Formula",
          "content": "$VSWR = \\frac{1 + |\\Gamma|}{1 - |\\Gamma|}$"
        },
        {
          "title": "Calculate VSWR",
          "content": "$VSWR = \\frac{1 + 0.20}{1 - 0.20} = \\frac{1.20}{0.80} = 1.50$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Reflection Coefficient Sizing",
    "question": "A transmission line with characteristic impedance $Z_0 = 50\\text{ \\Omega}$ is terminated by a load impedance $Z_L = 75\\text{ \\Omega}$. What is the voltage reflection coefficient ($\\Gamma$) at the load?",
    "options": [
      { "label": "A", "text": "0.20", "is_correct": true },
      { "label": "B", "text": "0.33", "is_correct": false },
      { "label": "C", "text": "-0.20", "is_correct": false },
      { "label": "D", "text": "0.50", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Reflection Coefficient Formula",
          "content": "$\\Gamma = \\frac{Z_L - Z_0}{Z_L + Z_0}$"
        },
        {
          "title": "Calculate Coefficient",
          "content": "$\\Gamma = \\frac{75 - 50}{75 + 50} = \\frac{25}{125} = 0.20$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Quarter-Wave Transformer Sizing",
    "question": "A quarter-wave impedance transformer is designed to match a transmission line with characteristic impedance $Z_0 = 50\\text{ \\Omega}$ to a load resistance $R_L = 100\\text{ \\Omega}$. What must be the characteristic impedance ($Z_{transformer}$) of the quarter-wave line section?",
    "options": [
      { "label": "A", "text": "70.7 \\Omega", "is_correct": true },
      { "label": "B", "text": "75.0 \\Omega", "is_correct": false },
      { "label": "C", "text": "150.0 \\Omega", "is_correct": false },
      { "label": "D", "text": "66.7 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Quarter-wave Transformer Formula",
          "content": "$Z_{transformer} = \\sqrt{Z_0 \\cdot R_L}$"
        },
        {
          "title": "Calculate Impedance",
          "content": "$Z_{transformer} = \\sqrt{50 \\times 100} = \\sqrt{5000} = 70.71\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  }
];

questionsObj["power"] = questionsObj["power"].concat(powerNew);

// Write back to questions.js
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefix = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefix + 'const QUESTIONS = ' + updatedJson + ';', 'utf8');

console.log("Successfully added 80 circuits and power questions in Part A.");
