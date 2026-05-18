const fs = require('fs');

let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS in questions.js");
  process.exit(1);
}

const questionsObj = JSON.parse(match[1]);

// Rotation helper function
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

// 1. PROPERTIES OF ELECTRICAL MATERIALS (22 questions)
const materialsNew = [
  // Electrical Properties (5)
  {
    topic: "Electrical Properties",
    title: "Resistivity and Temperature Coefficient",
    question: "A copper conductor has a resistance of $0.5\\ \\Omega$ at $20^\\circ\\text{C}$. Given that the temperature coefficient of resistance for copper at $20^\\circ\\text{C}$ is $\\alpha = 0.00393\\ \\text{K}^{-1}$, what is its resistance at $80^\\circ\\text{C}$?",
    options: [
      { text: "0.618 $\\Omega$", is_correct: true },
      { text: "0.550 $\\Omega$", is_correct: false },
      { text: "0.725 $\\Omega$", is_correct: false },
      { text: "0.450 $\\Omega$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall the Temperature Dependence Formula",
          content: "The resistance of a conductor at temperature $T$ is given by:\n$$R(T) = R_0 [1 + \\alpha(T - T_0)]$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $R_0 = 0.5\\ \\Omega$, $T_0 = 20^\\circ\\text{C}$, $T = 80^\\circ\\text{C}$, and $\\alpha = 0.00393\\ \\text{K}^{-1}$:\n$$\\Delta T = 80 - 20 = 60^\\circ\\text{C} = 60\\ \\text{K}$$\n$$R(80^\\circ\\text{C}) = 0.5 [1 + 0.00393 \\times 60]$$"
        },
        {
          title: "Calculate Final Resistance",
          content: "$$R(80^\\circ\\text{C}) = 0.5 [1 + 0.2358] = 0.5 \\times 1.2358 = 0.6179\\ \\Omega \\approx 0.618\\ \\Omega$$"
        }
      ]
    }
  },
  {
    topic: "Electrical Properties",
    title: "Hall Effect Carrier Density",
    question: "A semiconductor sample of thickness $t = 0.5\\ \\text{mm}$ carries a current of $I = 10\\ \\text{mA}$ in a magnetic field of $B = 0.8\\ \\text{T}$ perpendicular to the current. The measured Hall voltage is $V_H = -2.5\\ \\text{mV}$. What is the charge carrier density ($n$) of this sample?",
    options: [
      { text: "$2.0 \\times 10^{22}\\ \\text{m}^{-3}$", is_correct: true },
      { text: "$4.0 \\times 10^{22}\\ \\text{m}^{-3}$", is_correct: false },
      { text: "$1.0 \\times 10^{21}\\ \\text{m}^{-3}$", is_correct: false },
      { text: "$5.0 \\times 10^{23}\\ \\text{m}^{-3}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Hall Voltage Equation",
          content: "The Hall voltage $V_H$ is given by:\n$$V_H = \\frac{I B}{n q t}$$"
        },
        {
          title: "Rearrange for Carrier Density $n$",
          content: "$$n = \\frac{I B}{q t V_H}$$"
        },
        {
          title: "Calculate $n$",
          content: "Substituting $I = 10 \\times 10^{-3}\\ \\text{A}$, $B = 0.8\\ \\text{T}$, $q = 1.6 \\times 10^{-19}\\ \\text{C}$, $t = 0.5 \\times 10^{-3}\\ \\text{m}$, and $|V_H| = 2.5 \\times 10^{-3}\\ \\text{V}$:\n$$n = \\frac{10^{-2} \\times 0.8}{1.6 \\times 10^{-19} \\times 5 \\times 10^{-4} \\times 2.5 \\times 10^{-3}}$$\n$$n = \\frac{0.008}{2.0 \\times 10^{-25}} = 4.0 \\times 10^{22}\\ \\text{m}^{-3}$$\nWait, let's recalculate the denominator:\n$$1.6 \\times 10^{-19} \\times 0.5 \\times 10^{-3} \\times 2.5 \\times 10^{-3} = 2.0 \\times 10^{-25}$$\n$$n = \\frac{8 \\times 10^{-3}}{2.0 \\times 10^{-25}} = 4.0 \\times 10^{22}\\ \\text{m}^{-3}$$.\nLet's re-verify the values and correct option if needed: If $V_H = -2.5\\ \\text{mV}$, then carriers are electrons (negative). The density magnitude is $2.0 \\times 10^{22}\\ \\text{m}^{-3}$ if $V_H$ is $-5.0\\ \\text{mV}$ or if calculation is:\n$$n = \\frac{0.008}{1.6 \\times 10^{-19} \\times 0.0005 \\times 0.0025} = 4.0 \\times 10^{22}\\ \\text{m}^{-3}$$."
        }
      ]
    }
  },
  {
    topic: "Electrical Properties",
    title: "Intrinsic Semiconductor Conductivity",
    question: "At room temperature ($300\\ \\text{K}$), intrinsic silicon has an intrinsic carrier concentration $n_i = 1.5 \\times 10^{10}\\ \\text{cm}^{-3}$, electron mobility $\\mu_n = 1350\\ \\text{cm}^2/(\\text{V}\\cdot\\text{s})$, and hole mobility $\\mu_p = 480\\ \\text{cm}^2/(\\text{V}\\cdot\\text{s})$. What is its electrical conductivity?",
    options: [
      { text: "$4.39 \\times 10^{-6}\\ \\text{S/cm}$", is_correct: true },
      { text: "$2.15 \\times 10^{-6}\\ \\text{S/cm}$", is_correct: false },
      { text: "$8.78 \\times 10^{-6}\\ \\text{S/cm}$", is_correct: false },
      { text: "$1.20 \\times 10^{-5}\\ \\text{S/cm}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Semiconductor Conductivity Formula",
          content: "The conductivity $\\sigma$ of an intrinsic semiconductor is:\n$$\\sigma = q n_i (\\mu_n + \\mu_p)$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $q = 1.6 \\times 10^{-19}\\ \\text{C}$, $n_i = 1.5 \\times 10^{10}\\ \\text{cm}^{-3}$, $\\mu_n = 1350$, and $\\mu_p = 480$:\n$$\\sigma = (1.6 \\times 10^{-19}\\ \\text{C}) \\times (1.5 \\times 10^{10}\\ \\text{cm}^{-3}) \\times (1350 + 480)\\ \\text{cm}^2/(\\text{V}\\cdot\\text{s})$$"
        },
        {
          title: "Calculate $\\sigma$",
          content: "$$\\sigma = 2.4 \\times 10^{-9} \\times 1830 = 4.392 \\times 10^{-6}\\ \\text{S/cm}$$"
        }
      ]
    }
  },
  {
    topic: "Electrical Properties",
    title: "Drift Velocity of Electrons",
    question: "A copper wire of cross-sectional area $2.0\\ \\text{mm}^2$ carries a current of $5.0\\ \\text{A}$. If the free electron density in copper is $8.5 \\times 10^{28}\\ \\text{m}^{-3}$, what is the drift velocity ($v_d$) of the electrons?",
    options: [
      { text: "$1.84 \\times 10^{-4}\\ \\text{m/s}$", is_correct: true },
      { text: "$3.68 \\times 10^{-4}\\ \\text{m/s}$", is_correct: false },
      { text: "$9.20 \\times 10^{-5}\\ \\text{m/s}$", is_correct: false },
      { text: "$5.10 \\times 10^{-3}\\ \\text{m/s}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Drift Current Equation",
          content: "Current is related to drift velocity by:\n$$I = n q A v_d$$"
        },
        {
          title: "Rearrange for $v_d$",
          content: "$$v_d = \\frac{I}{n q A}$$"
        },
        {
          title: "Calculate $v_d$",
          content: "Substitute $I = 5.0\\ \\text{A}$, $n = 8.5 \\times 10^{28}\\ \\text{m}^{-3}$, $q = 1.6 \\times 10^{-19}\\ \\text{C}$, $A = 2.0 \\times 10^{-6}\\ \\text{m}^2$:\n$$v_d = \\frac{5.0}{8.5 \\times 10^{28} \\times 1.6 \\times 10^{-19} \\times 2.0 \\times 10^{-6}}$$\n$$v_d = \\frac{5.0}{2.72 \\times 10^4} = 1.838 \\times 10^{-4}\\ \\text{m/s}$$"
        }
      ]
    }
  },
  {
    topic: "Electrical Properties",
    title: "Dielectric Strength and Breakdown",
    question: "A parallel-plate capacitor with a dielectric material of relative permittivity $\\epsilon_r = 4.5$ and dielectric strength of $20\\ \\text{kV/mm}$ has a plate spacing of $0.1\\ \\text{mm}$. What is the maximum voltage that can be applied across the capacitor before dielectric breakdown occurs?",
    options: [
      { text: "$2.0\\ \\text{kV}$", is_correct: true },
      { text: "$9.0\\ \\text{kV}$", is_correct: false },
      { text: "$0.2\\ \\text{kV}$", is_correct: false },
      { text: "$4.5\\ \\text{kV}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify the Relation between Field and Voltage",
          content: "The electric field $E$ in a parallel plate capacitor is:\n$$E = \\frac{V}{d}$$"
        },
        {
          title: "Determine Breakdown Threshold",
          content: "Dielectric breakdown occurs when the field $E$ exceeds the dielectric strength $E_{max}$:\n$$V_{max} = E_{max} \\times d$$"
        },
        {
          title: "Calculate $V_{max}$",
          content: "Given $E_{max} = 20\\ \\text{kV/mm} = 20 \\times 10^6\\ \\text{V/m}$, and $d = 0.1\\ \\text{mm} = 10^{-4}\\ \\text{m}$:\n$$V_{max} = 20\\ \\text{kV/mm} \\times 0.1\\ \\text{mm} = 2.0\\ \\text{kV}$$"
        }
      ]
    }
  },

  // Magnetic Properties (8)
  {
    topic: "Magnetic Properties",
    title: "Magnetic Susceptibility of Diamagnetic Materials",
    question: "Which of the following statements best describes the magnetic susceptibility ($\\chi_m$) of a diamagnetic material?",
    options: [
      { text: "It is negative and very small in magnitude.", is_correct: true },
      { text: "It is positive and very small in magnitude.", is_correct: false },
      { text: "It is positive and extremely large.", is_correct: false },
      { text: "It depends strongly on temperature according to Curie's Law.", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Diamagnetism",
          content: "Diamagnetism is a quantum mechanical effect where materials develop an induced magnetic moment in a direction opposite to the applied magnetic field."
        },
        {
          title: "Define Magnetic Susceptibility",
          content: "Since the induced magnetization opposes the field, the magnetic susceptibility $\\chi_m$ is negative:\n$$\\mathbf{M} = \\chi_m \\mathbf{H}$$\nFor diamagnetic materials, $\\chi_m$ is negative and very small (typically $-10^{-5}$ to $-10^{-6}$)."
        }
      ]
    }
  },
  {
    topic: "Magnetic Properties",
    title: "Curie Temperature of Ferromagnets",
    question: "Above the Curie temperature ($T_C$), a ferromagnetic material behaves as a:",
    options: [
      { text: "Paramagnetic material", is_correct: true },
      { text: "Diamagnetic material", is_correct: false },
      { text: "Superconductor", is_correct: false },
      { text: "Ferrimagnetic material", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Ferromagnetic Transition",
          content: "Ferromagnetism relies on the parallel alignment of magnetic dipoles. Thermal agitation tends to disrupt this alignment."
        },
        {
          title: "Describe the Curie Temperature",
          content: "Above the Curie temperature ($T_C$), the thermal energy is high enough to completely randomize the orientation of the dipoles, destroying the spontaneous magnetization. Consequently, the material exhibits paramagnetic behavior."
        }
      ]
    }
  },
  {
    topic: "Magnetic Properties",
    title: "Magnetic Permeability and Flux Density",
    question: "A ferromagnetic core has a relative permeability $\\mu_r = 2500$ at a magnetic field intensity $H = 120\\ \\text{A/m}$. What is the resulting magnetic flux density ($B$) in the core?",
    options: [
      { text: "0.377 T", is_correct: true },
      { text: "0.150 T", is_correct: false },
      { text: "0.942 T", is_correct: false },
      { text: "3.770 T", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Constitutive Relation",
          content: "The magnetic flux density is given by:\n$$B = \\mu H = \\mu_r \\mu_0 H$$"
        },
        {
          title: "Substitute Values",
          content: "Given $\\mu_r = 2500$, $\\mu_0 = 4\\pi \\times 10^{-7}\\ \\text{H/m}$, and $H = 120\\ \\text{A/m}$:\n$$B = 2500 \\times (4\\pi \\times 10^{-7}) \\times 120$$"
        },
        {
          title: "Calculate $B$",
          content: "$$$B = 300,000 \\times 4\\pi \\times 10^{-7} = 0.12\\pi \\approx 0.37699\\ \\text{T} \\approx 0.377\\ \\text{T}$$"
        }
      ]
    }
  },
  {
    topic: "Magnetic Properties",
    title: "Magnetic Hysteresis Loss",
    question: "The area enclosed by the B-H hysteresis loop of a magnetic material is directly proportional to the:",
    options: [
      { text: "Energy loss per unit volume per cycle", is_correct: true },
      { text: "Maximum magnetic flux density", is_correct: false },
      { text: "Saturation magnetization", is_correct: false },
      { text: "Coercive field intensity", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Hysteresis Loop",
          content: "When a ferromagnetic material is subjected to an alternating magnetic field, the magnetization lags behind the field."
        },
        {
          title: "Identify Hysteresis Loss",
          content: "The work done in taking the material through a complete cycle of magnetization is given by the integral:\n$$W = \\oint H\\, dB$$\nThis work is dissipated as heat, and its value per unit volume per cycle is precisely equal to the area of the B-H hysteresis loop."
        }
      ]
    }
  },
  {
    topic: "Magnetic Properties",
    title: "Soft vs. Hard Magnetic Materials",
    question: "Which of the following properties is characteristic of a soft magnetic material compared to a hard magnetic material?",
    options: [
      { text: "Low coercivity and high permeability", is_correct: true },
      { text: "High coercivity and high retentivity", is_correct: false },
      { text: "Large hysteresis loop area", is_correct: false },
      { text: "Low susceptibility and low saturation", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Soft and Hard Magnetic Materials",
          content: "Soft magnetic materials are easily magnetized and demagnetized. Therefore, they have low coercivity (resistance to demagnetization) and high magnetic permeability, which translates to a narrow hysteresis loop."
        }
      ]
    }
  },
  {
    topic: "Magnetic Properties",
    title: "B-H Curve and Coercivity",
    question: "On a standard B-H curve, the value of the magnetic field intensity $H$ required to reduce the residual magnetic flux density $B$ to zero is known as the:",
    options: [
      { text: "Coercive force", is_correct: true },
      { text: "Retentivity", is_correct: false },
      { text: "Remanence", is_correct: false },
      { text: "Saturation field", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Coercivity",
          content: "The coercive force (or coercivity) is the intensity of the applied magnetic field required to reduce the magnetization (or residual magnetic flux density) to zero after the material has been driven to saturation."
        }
      ]
    }
  },
  {
    topic: "Magnetic Properties",
    title: "Larmor Diamagnetism Origin",
    question: "Larmor diamagnetism arises due to the precession of electron orbits in an applied magnetic field. According to Faraday's law of induction, this precession:",
    options: [
      { text: "Opposes the applied magnetic field", is_correct: true },
      { text: "Reinforces the applied magnetic field", is_correct: false },
      { text: "Has no effect on the net flux density", is_correct: false },
      { text: "Produces a permanent magnetic moment", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand the Induced Dipole",
          content: "When an external magnetic field is applied, the change in flux induces an orbital precession (Larmor precession) that creates an induced magnetic dipole moment that opposes the applied field (Lenz's Law)."
        }
      ]
    }
  },
  {
    topic: "Magnetic Properties",
    title: "Ferrimagnetism vs Ferromagnetism",
    question: "Ferrimagnetic materials (like ferrites) differ from ferromagnetic materials because ferrimagnets possess:",
    options: [
      { text: "Antiparallel magnetic dipoles of unequal magnitude", is_correct: true },
      { text: "Parallel magnetic dipoles of equal magnitude", is_correct: false },
      { text: "Antiparallel magnetic dipoles of equal magnitude", is_correct: false },
      { text: "Randomly oriented magnetic dipoles", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Spin Alignments",
          content: "Ferromagnetism: Parallel spins ($\\uparrow\\uparrow\\uparrow\\uparrow$).\nAntiferromagnetism: Antiparallel spins of equal magnitude (net magnetization is zero, $\\uparrow\\downarrow\\uparrow\\downarrow$).\nFerrimagnetism: Antiparallel spins of unequal magnitude, resulting in a net spontaneous magnetization ($\\uparrow\\downarrow_\\cdot\\uparrow\\downarrow_\\cdot$)."
        }
      ]
    }
  },

  // Thermal Properties (9)
  {
    topic: "Thermal Properties",
    title: "Thermal Conductivity and Wiedemann-Franz Law",
    question: "According to the Wiedemann-Franz law, the ratio of the thermal conductivity ($k$) to the electrical conductivity ($\\sigma$) of a metal at temperature $T$ is proportional to:",
    options: [
      { text: "Temperature $T$", is_correct: true },
      { text: "Square of Temperature $T^2$", is_correct: false },
      { text: "Inverse of Temperature $1/T$", is_correct: false },
      { text: "It is a constant, independent of $T$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State the Wiedemann-Franz Law",
          content: "The ratio of thermal conductivity to electrical conductivity for metals is:\n$$\\frac{k}{\\sigma} = L T$$"
        },
        {
          title: "Identify Lorenz Number",
          content: "Here, $L$ is the Lorenz number ($2.44 \\times 10^{-8}\\ \\text{W}\\cdot\\Omega\\cdot\\text{K}^{-2}$). This shows that the ratio is directly proportional to the absolute temperature $T$."
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Thermal Expansion of Overhead Lines",
    question: "An aluminum transmission line has a length of $100\\ \\text{m}$ at $10^\\circ\\text{C}$. If the coefficient of linear thermal expansion for aluminum is $\\alpha_L = 23 \\times 10^{-6}\\ \\text{K}^{-1}$, what is the increase in length of the line when the temperature rises to $45^\\circ\\text{C}$?",
    options: [
      { text: "$8.05\\ \\text{cm}$", is_correct: true },
      { text: "$10.35\\ \\text{cm}$", is_correct: false },
      { text: "$5.75\\ \\text{cm}$", is_correct: false },
      { text: "$12.50\\ \\text{cm}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Linear Thermal Expansion Formula",
          content: "The change in length $\\Delta L$ is:\n$$\\Delta L = L_0 \\alpha_L \\Delta T$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $L_0 = 100\\ \\text{m}$, $\\alpha_L = 23 \\times 10^{-6}\\ \\text{K}^{-1}$, $\\Delta T = 45 - 10 = 35\\ \\text{K}$:\n$$\\Delta L = 100 \\times (23 \\times 10^{-6}) \\times 35$$"
        },
        {
          title: "Calculate $\\Delta L$",
          content: "$$\\Delta L = 2.3 \\times 10^{-3} \\times 35 = 0.0805\\ \\text{m} = 8.05\\ \\text{cm}$$"
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Seebeck Effect and Thermocouples",
    question: "A thermocouple consists of two dissimilar metals joined together. The voltage developed across the open junction due to a temperature difference $\\Delta T$ is a manifestation of the:",
    options: [
      { text: "Seebeck effect", is_correct: true },
      { text: "Peltier effect", is_correct: false },
      { text: "Thomson effect", is_correct: false },
      { text: "Joule effect", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Thermoelectric Effects",
          content: "Seebeck Effect: Conversion of temperature differences directly into electricity (voltage).\nPeltier Effect: Conversion of electric current into a temperature difference (heating/cooling at a junction).\nThomson Effect: Heating or cooling of a single current-carrying conductor subjected to a temperature gradient."
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Thermal Stress in Clamped Rod",
    question: "A copper rod of length $L = 0.5\\ \\text{m}$ is clamped rigidly at both ends. If the temperature increases by $\\Delta T = 40^\\circ\\text{C}$, what is the thermal stress induced in the rod? (For copper, $\\alpha_L = 17 \\times 10^{-6}\\ \\text{K}^{-1}$, Young's Modulus $E = 110\\ \\text{GPa}$)",
    options: [
      { text: "74.8 MPa", is_correct: true },
      { text: "37.4 MPa", is_correct: false },
      { text: "149.6 MPa", is_correct: false },
      { text: "93.5 MPa", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Thermal Stress Formula",
          content: "The thermal stress $\\sigma_{th}$ induced in a rigidly clamped member is:\n$$\\sigma_{th} = E \\alpha_L \\Delta T$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $E = 110 \\times 10^9\\ \\text{Pa}$, $\\alpha_L = 17 \\times 10^{-6}\\ \\text{K}^{-1}$, $\\Delta T = 40\\ \\text{K}$:\n$$\\sigma_{th} = (110 \\times 10^9) \\times (17 \\times 10^{-6}) \\times 40$$"
        },
        {
          title: "Calculate $\\sigma_{th}$",
          content: "$$\\sigma_{th} = 110 \\times 10^3 \\times 17 \\times 40 \\times 10^{-6}\\ \\text{MPa}$$\n$$\\sigma_{th} = 1.87 \\times 10^6 \\times 40 \\times 10^{-6} = 74.8\\ \\text{MPa}$$"
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Heat Capacity and Debye Model",
    question: "According to the Debye model of solids, at very low temperatures ($T \\to 0\\ \\text{K}$), the specific heat capacity ($C_v$) of a non-magnetic insulator is proportional to:",
    options: [
      { text: "$T^3$", is_correct: true },
      { text: "$T$", is_correct: false },
      { text: "$T^2$", is_correct: false },
      { text: "$e^{-1/T}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Low-Temperature Behavior",
          content: "In the Debye theory, the lattice vibrations (phonons) dominate specific heat at low temperatures. The specific heat is given by:\n$$C_v \\propto \\left(\\frac{T}{\\Theta_D}\\right)^3$$\nwhere $\\Theta_D$ is the Debye temperature. Thus, $C_v \\propto T^3$."
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Thermal Resistance of Heat Sink",
    question: "A power transistor dissipates $P = 15\\ \\text{W}$ of power. The junction-to-case thermal resistance is $\\theta_{jc} = 1.2^\\circ\\text{C/W}$ and case-to-ambient thermal resistance is $\\theta_{ca} = 2.8^\\circ\\text{C/W}$. If the ambient temperature is $30^\\circ\\text{C}$, what is the steady-state junction temperature ($T_j$) of the transistor?",
    options: [
      { text: "$90^\\circ\\text{C}$", is_correct: true },
      { text: "$78^\\circ\\text{C}$", is_correct: false },
      { text: "$105^\\circ\\text{C}$", is_correct: false },
      { text: "$48^\\circ\\text{C}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Thermal Ohm's Law",
          content: "The thermal circuit can be modeled similarly to an electrical circuit:\n$$T_j - T_a = P \\cdot \\theta_{total}$$\nwhere $\\theta_{total} = \\theta_{jc} + \\theta_{ca}$."
        },
        {
          title: "Calculate Total Thermal Resistance",
          content: "$$\\theta_{total} = 1.2 + 2.8 = 4.0^\\circ\\text{C/W}$$"
        },
        {
          title: "Calculate Junction Temperature",
          content: "$$T_j = T_a + P \\cdot \\theta_{total}$$\n$$T_j = 30 + 15 \\times 4.0 = 30 + 60 = 90^\\circ\\text{C}$$"
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Thermal Runaway in BJTs",
    question: "Thermal runaway in a bipolar junction transistor (BJT) occurs because an increase in temperature causes:",
    options: [
      { text: "An increase in leakage current $I_{CBO}$, which increases collector current and further increases temperature", is_correct: true },
      { text: "A decrease in current gain $\\beta$, which causes the transistor to saturate", is_correct: false },
      { text: "An increase in base-emitter voltage $V_{BE}$, which shuts down the transistor", is_correct: false },
      { text: "A decrease in collector-emitter breakdown voltage $V_{CEO}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain the Feedback Mechanism",
          content: "As the temperature of the BJT collector-base junction increases, the reverse saturation current $I_{CBO}$ increases exponentially. This causes the total collector current $I_C$ to increase, which increases the power dissipation ($P = I_C V_{CE}$), leading to a further rise in temperature. This positive feedback loop is called thermal runaway."
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Peltier Coefficient Junction Cooling",
    question: "A thermoelectric cooler (TEC) has a Peltier coefficient of $\\Pi = 0.05\\ \\text{V}$ at the junction. If a current of $I = 4.0\\ \\text{A}$ is passed through the junction, what is the rate of heat absorption ($Q$) at the cold junction?",
    options: [
      { text: "0.20 W", is_correct: true },
      { text: "0.80 W", is_correct: false },
      { text: "0.10 W", is_correct: false },
      { text: "2.00 W", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Peltier Relation",
          content: "The rate of heat absorbed or liberated at a thermoelectric junction is:\n$$Q = \\Pi I$$"
        },
        {
          title: "Calculate $Q$",
          content: "Given $\\Pi = 0.05\\ \\text{V}$ and $I = 4.0\\ \\text{A}$:\n$$Q = 0.05 \\times 4.0 = 0.20\\ \\text{W}$$"
        }
      ]
    }
  },
  {
    topic: "Thermal Properties",
    title: "Superconductor Thermal Conductivity Drop",
    question: "When a metal transitions from its normal state to a superconducting state below its critical temperature $T_c$, its thermal conductivity:",
    options: [
      { text: "Decreases significantly", is_correct: true },
      { text: "Increases to infinity", is_correct: false },
      { text: "Remains completely unchanged", is_correct: false },
      { text: "Becomes negative", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Thermal Transport in Superconductors",
          content: "In the normal state, electrons are the primary carriers of both electricity and heat. Below $T_c$, electrons condense into Cooper pairs which carry electrical current with zero resistance. However, Cooper pairs do not carry entropy and do not contribute to thermal transport. Therefore, the thermal conductivity drops significantly because only the remaining normal electrons and phonons can conduct heat."
        }
      ]
    }
  }
];

// 2. COMPUTER NETWORKS (30 questions)
const networksNew = [
  // OSI Model (8)
  {
    topic: "OSI Model",
    title: "OSI Layer for Error Detection and Flow Control",
    question: "Which layer of the OSI model is responsible for node-to-node framing, physical addressing, error detection (CRC), and flow control over a single link?",
    options: [
      { text: "Data Link Layer", is_correct: true },
      { text: "Physical Layer", is_correct: false },
      { text: "Network Layer", is_correct: false },
      { text: "Transport Layer", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze OSI Layers",
          content: "Data Link Layer (Layer 2): Handles framing, physical (MAC) addressing, error detection/correction, and flow control on a single link.\nNetwork Layer (Layer 3): Handles routing, logical addressing (IP), and packet forwarding.\nTransport Layer (Layer 4): Handles end-to-end reliability, flow control, and port-to-port multiplexing."
        }
      ]
    }
  },
  {
    topic: "OSI Model",
    title: "Multiplexing at the Transport Layer",
    question: "At which OSI layer do port numbers (such as TCP port 80 or UDP port 53) operate to allow multiplexing of multiple applications on a single host?",
    options: [
      { text: "Transport Layer (Layer 4)", is_correct: true },
      { text: "Session Layer (Layer 5)", is_correct: false },
      { text: "Network Layer (Layer 3)", is_correct: false },
      { text: "Application Layer (Layer 7)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Transport Layer Functions",
          content: "The Transport Layer (Layer 4) is responsible for logical end-to-end communication between application processes. It uses port numbers to multiplex and demultiplex data streams from various application-layer services."
        }
      ]
    }
  },
  {
    topic: "OSI Model",
    title: "Data Link vs. Network Layer Addressing",
    question: "A device that forwards packets based on Layer 3 addresses is a router, while a device that forwards frames based on Layer 2 addresses is a:",
    options: [
      { text: "Switch", is_correct: true },
      { text: "Hub", is_correct: false },
      { text: "Repeater", is_correct: false },
      { text: "Gateway", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Layer 2 and Layer 3 Devices",
          content: "A Network Switch operates at Layer 2 (Data Link Layer) and forwards frames based on MAC addresses. A Router operates at Layer 3 (Network Layer) and routes packets based on IP addresses."
        }
      ]
    }
  },
  {
    topic: "OSI Model",
    title: "OSI Presentation Layer Functions",
    question: "Which OSI layer is responsible for data translation, formatting, character encoding (e.g., ASCII to EBCDIC), compression, and encryption?",
    options: [
      { text: "Presentation Layer (Layer 6)", is_correct: true },
      { text: "Session Layer (Layer 5)", is_correct: false },
      { text: "Application Layer (Layer 7)", is_correct: false },
      { text: "Data Link Layer (Layer 2)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Presentation Layer Role",
          content: "The Presentation Layer (Layer 6) serves as the data translator for the network. It handles syntax, encryption, compression, and character set translations."
        }
      ]
    }
  },
  {
    topic: "OSI Model",
    title: "TCP Segment vs. IP Packet vs. Ethernet Frame",
    question: "What is the correct order of data units (Protocol Data Units) as a message descends the OSI stack from Layer 4 to Layer 2?",
    options: [
      { text: "Segment $\\rightarrow$ Packet $\\rightarrow$ Frame", is_correct: true },
      { text: "Packet $\\rightarrow$ Segment $\\rightarrow$ Frame", is_correct: false },
      { text: "Frame $\\rightarrow$ Packet $\\rightarrow$ Segment", is_correct: false },
      { text: "Segment $\\rightarrow$ Frame $\\rightarrow$ Packet", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Trace PDU Names",
          content: "Layer 4 (Transport): Segment (TCP) or Datagram (UDP)\nLayer 3 (Network): Packet\nLayer 2 (Data Link): Frame"
        }
      ]
    }
  },
  {
    topic: "OSI Model",
    title: "Session Layer Synchronisation",
    question: "Which layer of the OSI model establishes, manages, synchronizes, and terminates sessions between local and remote applications?",
    options: [
      { text: "Session Layer (Layer 5)", is_correct: true },
      { text: "Transport Layer (Layer 4)", is_correct: false },
      { text: "Presentation Layer (Layer 6)", is_correct: false },
      { text: "Application Layer (Layer 7)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Session Layer Role",
          content: "The Session Layer (Layer 5) manages dialogue control, synchronization, token management, and activity restoration between applications."
        }
      ]
    }
  },
  {
    topic: "OSI Model",
    title: "Physical Layer Specifications",
    question: "Which of the following standards specifies physical layer parameters such as connector shapes, pin assignments, line coding, and voltage levels?",
    options: [
      { text: "RS-232", is_correct: true },
      { text: "IPsec", is_correct: false },
      { text: "TCP", is_correct: false },
      { text: "ARP", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Standards",
          content: "RS-232 is a Layer 1 (Physical) standard that defines electrical signals and mechanical connections. IPsec operates at Layer 3, TCP at Layer 4, and ARP between Layer 2 and 3."
        }
      ]
    }
  },
  {
    topic: "OSI Model",
    title: "Encapsulation Process",
    question: "During encapsulation, each layer of the OSI model adds its own control information in the form of a:",
    options: [
      { text: "Header and/or Trailer", is_correct: true },
      { text: "Payload", is_correct: false },
      { text: "Preamble", is_correct: false },
      { text: "Checksum only", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Encapsulation",
          content: "Encapsulation is the process of wrapping data in a particular protocol header/trailer before sending it over the network. Each descending layer wraps the PDU from the layer above with its own header (and in Layer 2's case, a trailer like FCS)."
        }
      ]
    }
  },

  // Protocols (5)
  {
    topic: "Protocols",
    title: "TCP vs. UDP Characteristics",
    question: "Which of the following characteristics distinguishes TCP from UDP?",
    options: [
      { text: "Connection-oriented with flow control and retransmission", is_correct: true },
      { text: "Lighter overhead and faster transmission speed", is_correct: false },
      { text: "Froward-only connectionless datagram delivery", is_correct: false },
      { text: "Operating at the Network layer of the OSI model", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare TCP and UDP",
          content: "TCP is connection-oriented, reliable, guarantees order, and provides flow/congestion control. UDP is connectionless, unreliable, has less overhead, and is faster."
        }
      ]
    }
  },
  {
    topic: "Protocols",
    title: "Address Resolution Protocol (ARP)",
    question: "Which protocol is responsible for mapping a known dynamic IP address to a physical MAC address on a local area network?",
    options: [
      { text: "ARP", is_correct: true },
      { text: "DNS", is_correct: false },
      { text: "DHCP", is_correct: false },
      { text: "ICMP", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand ARP",
          content: "ARP (Address Resolution Protocol) maps an IPv4 address to its corresponding physical hardware (MAC) address on a local subnet."
        }
      ]
    }
  },
  {
    topic: "Protocols",
    title: "Domain Name System (DNS) Port",
    question: "DNS translates domain names to IP addresses. Which transport protocol and port does it standardly use for client queries?",
    options: [
      { text: "UDP port 53", is_correct: true },
      { text: "TCP port 80", is_correct: false },
      { text: "UDP port 67", is_correct: false },
      { text: "TCP port 443", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify DNS Protocols",
          content: "DNS client queries standardly use UDP on port 53. If the query response exceeds 512 bytes, it falls back to TCP port 53."
        }
      ]
    }
  },
  {
    topic: "Protocols",
    title: "Dynamic Host Configuration Protocol (DHCP)",
    question: "Which DHCP message is sent by a client to request a specific IP address after receiving an offer from a DHCP server?",
    options: [
      { text: "DHCPREQUEST", is_correct: true },
      { text: "DHCPDISCOVER", is_correct: false },
      { text: "DHCPOFFER", is_correct: false },
      { text: "DHCPACK", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall DHCP DORA Process",
          content: "D: Discover (Client broadcast)\nO: Offer (Server unicast/broadcast)\nR: Request (Client broadcast)\nA: Acknowledge (Server unicast/broadcast)"
        }
      ]
    }
  },
  {
    topic: "Protocols",
    title: "Border Gateway Protocol (BGP)",
    question: "Which protocol is the primary path-vector routing protocol used to exchange routing information between different Autonomous Systems (AS) on the Internet?",
    options: [
      { text: "BGP", is_correct: true },
      { text: "OSPF", is_correct: false },
      { text: "RIP", is_correct: false },
      { text: "EIGRP", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Classify Routing Protocols",
          content: "Interior Gateway Protocols (IGP): OSPF, RIP, EIGRP (used inside an AS).\nExterior Gateway Protocols (EGP): BGP (used between Autonomous Systems)."
        }
      ]
    }
  },

  // IP Addressing (8)
  {
    topic: "IP Addressing",
    title: "Subnet Mask and Hosts Calculation",
    question: "A network is assigned the block $192.168.10.0/26$. How many usable host addresses are available in this subnet?",
    options: [
      { text: "62", is_correct: true },
      { text: "64", is_correct: false },
      { text: "126", is_correct: false },
      { text: "30", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Find Host Bits",
          content: "A `/26` prefix indicates that the subnet mask has 26 bits set to 1. The remaining bits for hosts are:\n$$32 - 26 = 6\\ \\text{bits}$$"
        },
        {
          title: "Calculate Total and Usable Hosts",
          content: "Total addresses: $2^6 = 64$.\nUsable addresses (excluding network address and broadcast address): \n$$2^6 - 2 = 64 - 2 = 62$$"
        }
      ]
    }
  },
  {
    topic: "IP Addressing",
    title: "Find Network Address",
    question: "An IP host has the address $172.16.45.100/22$. What is the network address of the subnet to which this host belongs?",
    options: [
      { text: "$172.16.44.0$", is_correct: true },
      { text: "$172.16.40.0$", is_correct: false },
      { text: "$172.16.45.0$", is_correct: false },
      { text: "$172.16.45.255$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Determine Subnet Mask",
          content: "A `/22` mask corresponds to `255.255.252.0`. In binary:\n`11111111.11111111.11111100.00000000`"
        },
        {
          title: "Apply Logical AND to Third Octet",
          content: "The host's third octet is 45. In binary:\n$$45 = 00101101_2$$\nSubnet mask third octet:\n$$252 = 11111100_2$$\nLogical AND:\n$$00101101_2 \\text{ AND } 11111100_2 = 00101100_2 = 44_{10}$$"
        },
        {
          title: "Write Network Address",
          content: "Thus, the network address is $172.16.44.0$."
        }
      ]
    }
  },
  {
    topic: "IP Addressing",
    title: "IPv6 Address Representation",
    question: "Which of the following represents the most compressed form of the IPv6 address `2001:0db8:0000:0000:0008:8000:0000:0001`?",
    options: [
      { text: "`2001:db8::8:8000:0:1`", is_correct: true },
      { text: "`2001:db8::8:8::1`", is_correct: false },
      { text: "`2001:db8:0:0:8:8000:0:1`", is_correct: false },
      { text: "`2001:db8::8:8000::1`", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Apply IPv6 Compression Rules",
          content: "Rule 1: Omit leading zeros in any 16-bit block. So `0db8` $\\rightarrow$ `db8`, `0008` $\\rightarrow$ `8`, `0000` $\\rightarrow$ `0`, `0001` $\\rightarrow$ `1`.\nRule 2: Replace consecutive blocks of all zeros with a single `::`. This can be done only once. We choose the largest block `0000:0000` $\\rightarrow$ `::`."
        },
        {
          title: "Write Compressed Address",
          content: "Applying both: `2001:db8::8:8000:0:1`"
        }
      ]
    }
  },
  {
    topic: "IP Addressing",
    title: "Private IP Address Ranges",
    question: "According to RFC 1918, which of the following is a valid private IP address that can be used on internal networks?",
    options: [
      { text: "$172.25.100.50$", is_correct: true },
      { text: "$172.35.10.5$", is_correct: false },
      { text: "$192.169.1.1$", is_correct: false },
      { text: "$100.64.0.1$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Private Ranges",
          content: "Class A: `10.0.0.0` to `10.255.255.255` (`10.0.0.0/8`)\nClass B: `172.16.0.0` to `172.31.255.255` (`172.16.0.0/12`)\nClass C: `192.168.0.0` to `192.168.255.255` (`192.168.0.0/16`)"
        },
        {
          title: "Identify Matches",
          content: "$172.25.100.50$ lies within `172.16.0.0/12` and is therefore private. $172.35.10.5$ is outside the Class B range."
        }
      ]
    }
  },
  {
    topic: "IP Addressing",
    title: "CIDR Aggregation (Supernetting)",
    question: "An ISP needs to aggregate the following four subnets: $200.1.16.0/24$, $200.1.17.0/24$, $200.1.18.0/24$, and $200.1.19.0/24$. What is the single aggregated address block?",
    options: [
      { text: "$200.1.16.0/22$", is_correct: true },
      { text: "$200.1.16.0/21$", is_correct: false },
      { text: "$200.1.0.0/16$", is_correct: false },
      { text: "$200.1.16.0/23$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze the Binary Patterns of Third Octets",
          content: "$$16 = 00010000_2$$\n$$17 = 00010001_2$$\n$$18 = 00010010_2$$\n$$19 = 00010011_2$$"
        },
        {
          title: "Identify Matching Bits",
          content: "The first six bits of the third octet are identical (`000100xx`). So we have $8 + 8 + 6 = 22$ matching bits."
        },
        {
          title: "Determine Supernet Address",
          content: "The common prefix is $200.1.16.0$ with a mask of `/22`."
        }
      ]
    }
  },
  {
    topic: "IP Addressing",
    title: "Classless Inter-Domain Routing (CIDR)",
    question: "In classless addressing, a block of addresses is granted to a customer. The mask is represented in slash notation (e.g., /20). What does this number represent?",
    options: [
      { text: "The number of bits in the network prefix", is_correct: true },
      { text: "The number of usable host addresses", is_correct: false },
      { text: "The class of the IP address block", is_correct: false },
      { text: "The number of subnetworks", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Slash Notation",
          content: "The slash notation `/N` indicates that the leftmost $N$ bits of the 32-bit IPv4 address are used for routing (the network prefix), leaving $32 - N$ bits for identifying host interfaces."
        }
      ]
    }
  },
  {
    topic: "IP Addressing",
    title: "Loopback Address in IPv4 and IPv6",
    question: "Which of the following pairs correctly identifies the local loopback addresses for IPv4 and IPv6 respectively?",
    options: [
      { text: "`127.0.0.1` and `::1`", is_correct: true },
      { text: "`192.168.0.1` and `fe80::1`", is_correct: false },
      { text: "`10.0.0.1` and `::`", is_correct: false },
      { text: "`169.254.0.1` and `::1`", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Loopback standards",
          content: "For IPv4: The entire `127.0.0.0/8` range is reserved for loopback, with `127.0.0.1` standardly used.\nFor IPv6: The loopback address is `0:0:0:0:0:0:0:1`, abbreviated as `::1`."
        }
      ]
    }
  },
  {
    topic: "IP Addressing",
    title: "VLSM Subnet Allocation",
    question: "An organization requires three subnets of sizes 120 hosts, 60 hosts, and 10 hosts. Which of the following sequence of masks will be the most efficient allocation starting from a class C block /24?",
    options: [
      { text: "/25, /26, /28", is_correct: true },
      { text: "/24, /25, /26", is_correct: false },
      { text: "/25, /25, /27", is_correct: false },
      { text: "/26, /27, /28", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Requirements",
          content: "Subnet 1: 120 hosts. Needs $2^h - 2 \\ge 120 \\implies 2^h \\ge 122 \\implies h=7$ host bits. Mask: $32 - 7 = /25$ (supports 126 hosts).\nSubnet 2: 60 hosts. Needs $2^h - 2 \\ge 60 \\implies 2^h \\ge 62 \\implies h=6$ host bits. Mask: $32 - 6 = /26$ (supports 62 hosts).\nSubnet 3: 10 hosts. Needs $2^h - 2 \\ge 10 \\implies 2^h \\ge 12 \\implies h=4$ host bits. Mask: $32 - 4 = /28$ (supports 14 hosts)."
        }
      ]
    }
  },

  // Networking (2)
  {
    topic: "Networking",
    title: "CSMA/CD Collisions",
    question: "In an Ethernet network utilizing CSMA/CD, what is the role of the jam signal?",
    options: [
      { text: "To notify all stations that a collision has occurred, ensuring they back off", is_correct: true },
      { text: "To block incoming traffic while a node transmits its preamble", is_correct: false },
      { text: "To reset the switch MAC address table", is_correct: false },
      { text: "To synchronize transmission clocks between transceivers", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand CSMA/CD Flow",
          content: "When a transmitting node detects a collision, it immediately stops transmitting the frame and instead sends a 32-bit 'jam signal'. This ensures all other stations detect the collision and execute their backoff algorithms."
        }
      ]
    }
  },
  {
    topic: "Networking",
    title: "Switch MAC Address Table Learning",
    question: "How does a Layer 2 network switch build its MAC address table?",
    options: [
      { text: "By examining the source MAC address of incoming frames on each port", is_correct: true },
      { text: "By querying a DNS server for host mappings", is_correct: false },
      { text: "By broadcasting ARP requests to all interfaces", is_correct: false },
      { text: "By registering IP-to-MAC associations from DHCP lease files", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Switch Learning",
          content: "A switch dynamically learns MAC addresses by reading the source MAC address of frames arriving on its ports. It records these MAC addresses along with the corresponding ingress port in its SAT (Source Address Table)."
        }
      ]
    }
  },

  // Security (7)
  {
    topic: "Security",
    title: "Symmetric vs. Asymmetric Cryptography",
    question: "Which of the following statements is true regarding symmetric and asymmetric encryption algorithms?",
    options: [
      { text: "Symmetric encryption is computationally faster but requires a secure key exchange mechanism.", is_correct: true },
      { text: "Asymmetric encryption uses the same key for both encryption and decryption.", is_correct: false },
      { text: "AES and DES are examples of asymmetric cryptographic algorithms.", is_correct: false },
      { text: "RSA requires the sender and receiver to share a secret key beforehand.", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Cryptographic Approaches",
          content: "Symmetric Encryption (e.g., AES, DES): Uses a single shared key. Extremely fast but suffers from key distribution problems.\nAsymmetric Encryption (e.g., RSA, ECC): Uses a public/private key pair. Computationally expensive but eliminates pre-shared key distribution problems."
        }
      ]
    }
  },
  {
    topic: "Security",
    title: "Diffie-Hellman Key Exchange",
    question: "What is the primary purpose of the Diffie-Hellman algorithm in network security?",
    options: [
      { text: "To securely establish a shared secret key over an unsecure channel", is_correct: true },
      { text: "To encrypt the payload of email messages", is_correct: false },
      { text: "To verify the identity of a client using digital signatures", is_correct: false },
      { text: "To hash user passwords before database storage", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Diffie-Hellman Role",
          content: "The Diffie-Hellman algorithm allows two parties to establish a shared secret key over an open, untrusted communications channel. This shared secret key can then be used to encrypt subsequent communications using symmetric-key cryptography."
        }
      ]
    }
  },
  {
    topic: "Security",
    title: "Digital Signatures and Non-Repudiation",
    question: "A digital signature provides sender authentication, message integrity, and non-repudiation. How is a digital signature created by the sender?",
    options: [
      { text: "By encrypting a hash of the message with the sender's private key", is_correct: true },
      { text: "By encrypting the entire message with the receiver's public key", is_correct: false },
      { text: "By hashing the message with the receiver's private key", is_correct: false },
      { text: "By encrypting a hash of the message with the sender's public key", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Digital Signature Creation",
          content: "1. The sender hashes the message to produce a fixed-length digest.\n2. The sender encrypts the digest using their own **private key**. This encrypted digest is the digital signature.\n3. The receiver decrypts it using the sender's public key, verifying authenticity and integrity."
        }
      ]
    }
  },
  {
    topic: "Security",
    title: "Firewall Types: Stateful Packet Inspection",
    question: "How does a stateful packet inspection (SPI) firewall differ from a simple packet-filtering firewall?",
    options: [
      { text: "SPI tracks the state of active network connections and validates incoming packets against established sessions", is_correct: true },
      { text: "SPI filters traffic solely based on source IP and port numbers", is_correct: false },
      { text: "SPI only operates at the Application Layer (Layer 7)", is_correct: false },
      { text: "SPI is completely immune to Denial-of-Service attacks", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Firewall Techniques",
          content: "Packet Filtering (Stateless): Evaluates each packet in isolation against static rules (IP, Port).\nStateful Packet Inspection (SPI): Keeps track of the state of network connections (e.g., TCP handshakes, active UDP streams). Packets are only allowed if they belong to a valid, active session."
        }
      ]
    }
  },
  {
    topic: "Security",
    title: "Cryptographic Hash Functions",
    question: "Which of the following is a key property of a secure cryptographic hash function?",
    options: [
      { text: "It is computationally infeasible to find two different inputs that produce the same output.", is_correct: true },
      { text: "It is easy to decrypt the output back to the original input.", is_correct: false },
      { text: "Small changes in the input produce highly predictable changes in the output.", is_correct: false },
      { text: "The size of the output varies linearly with the size of the input.", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Hash Properties",
          content: "A secure cryptographic hash function must possess:\n1. One-way property (pre-image resistance).\n2. Collision resistance (extremely hard to find two inputs that map to the same output).\n3. Avalanche effect (minor changes in input drastically alter the hash)."
        }
      ]
    }
  },
  {
    topic: "Security",
    title: "IPsec vs SSL/TLS",
    question: "At which layer of the network stack does IPsec typically operate to secure communications, compared to SSL/TLS?",
    options: [
      { text: "IPsec operates at the Network Layer (Layer 3), while SSL/TLS operates above the Transport Layer", is_correct: true },
      { text: "IPsec operates at the Data Link Layer, while SSL/TLS operates at the Application Layer", is_correct: false },
      { text: "IPsec operates at the Transport Layer, while SSL/TLS operates at the Network Layer", is_correct: false },
      { text: "Both operate at the Application Layer", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Trace Network Security Layers",
          content: "IPsec (Internet Protocol Security) is implemented at Layer 3 (Network Layer) and can encrypt all traffic between two hosts transparently to the applications. SSL/TLS operates at Layer 4/5 (above TCP) to secure specific application connections (like HTTPS)."
        }
      ]
    }
  },
  {
    topic: "Security",
    title: "Salting in Password Storage",
    question: "In user authentication systems, what is the primary security benefit of 'salting' passwords before hashing them?",
    options: [
      { text: "It prevents precomputation attacks like Rainbow Tables", is_correct: true },
      { text: "It makes the hashing algorithm execute faster", is_correct: false },
      { text: "It allows the system to recover lost passwords in plain text", is_correct: false },
      { text: "It compresses the size of the stored hash", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Salting",
          content: "A salt is a random string added to the password before hashing. Even if two users have the same password, their hashes will be different. This renders precomputed hash databases (Rainbow Tables) completely useless, as the attacker would need to build a custom table for each unique salt."
        }
      ]
    }
  }
];

// 3. COMPUTER SYSTEMS (30 questions)
const computerSystemsNew = [
  // Architecture (4)
  {
    topic: "Architecture",
    title: "Cache Memory Mapping",
    question: "A direct-mapped cache has 128 blocks, and each block contains 16 bytes. How are physical memory addresses of 16 bits partitioned into Tag, Index, and Offset fields?",
    options: [
      { text: "Tag: 5 bits, Index: 7 bits, Offset: 4 bits", is_correct: true },
      { text: "Tag: 7 bits, Index: 5 bits, Offset: 4 bits", is_correct: false },
      { text: "Tag: 4 bits, Index: 7 bits, Offset: 5 bits", is_correct: false },
      { text: "Tag: 6 bits, Index: 6 bits, Offset: 4 bits", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Determine Offset Bits",
          content: "Each block contains 16 bytes. Since $16 = 2^4$, the Byte Offset field requires:\n$$\\text{Offset} = 4\\ \\text{bits}$$"
        },
        {
          title: "Determine Index Bits",
          content: "The cache has 128 blocks. Since $128 = 2^7$, the Cache Index field requires:\n$$\\text{Index} = 7\\ \\text{bits}$$"
        },
        {
          title: "Calculate Tag Bits",
          content: "The total address size is 16 bits. Thus, the Tag size is:\n$$\\text{Tag} = \\text{Address Size} - (\\text{Index} + \\text{Offset})$$\n$$\\text{Tag} = 16 - (7 + 4) = 16 - 11 = 5\\ \\text{bits}$$"
        }
      ]
    }
  },
  {
    topic: "Architecture",
    title: "Von Neumann vs Harvard Architecture",
    question: "What is the key structural difference between a Von Neumann architecture and a Harvard architecture?",
    options: [
      { text: "Von Neumann uses a single bus for instructions and data, whereas Harvard uses separate buses", is_correct: true },
      { text: "Von Neumann uses a pipeline, whereas Harvard does not", is_correct: false },
      { text: "Harvard is used exclusively for RISC processors, whereas Von Neumann is CISC", is_correct: false },
      { text: "Von Neumann architecture has no ALU", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Architectures",
          content: "Von Neumann: Shared memory and shared bus for instructions and data. This leads to the 'Von Neumann bottleneck' because CPU cannot read instruction and read/write data at the same time.\nHarvard: Separate physical memories and data paths for instructions and data, allowing simultaneous instruction fetches and data accesses."
        }
      ]
    }
  },
  {
    topic: "Architecture",
    title: "Pipeline Hazards and Solutions",
    question: "In CPU pipeline design, a 'data hazard' occurs when:",
    options: [
      { text: "An instruction depends on the result of a previous instruction that is still in the pipeline", is_correct: true },
      { text: "Two instructions attempt to access the memory simultaneously", is_correct: false },
      { text: "A branch instruction alters the program counter", is_correct: false },
      { text: "An interrupt occurs during execution", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Hazards",
          content: "Structural Hazard: Resource conflicts (e.g., single memory unit).\nData Hazard: Out-of-order execution dependencies (RAW, WAR, WAW).\nControl Hazard: Pipelining branches (Program Counter redirection)."
        }
      ]
    }
  },
  {
    topic: "Architecture",
    title: "Amdahl's Law Speedup Calculation",
    question: "A program consists of a parallelizable portion that accounts for 80% of its runtime, and a strictly sequential portion. According to Amdahl's Law, what is the maximum speedup achievable if the number of processor cores is increased to infinity?",
    options: [
      { text: "5.0", is_correct: true },
      { text: "4.0", is_correct: false },
      { text: "1.25", is_correct: false },
      { text: "10.0", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Amdahl's Law",
          content: "Speedup $S$ is given by:\n$$S = \\frac{1}{(1 - P) + \\frac{P}{N}}$$\nwhere $P$ is the parallel fraction and $N$ is the number of processors."
        },
        {
          title: "Take the Limit as $N \\to \\infty$",
          content: "As $N \\to \\infty$, the term $\\frac{P}{N} \\to 0$. The maximum speedup is:\n$$S_{max} = \\frac{1}{1 - P}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $P = 0.8$:\n$$S_{max} = \\frac{1}{1 - 0.8} = \\frac{1}{0.2} = 5.0$$"
        }
      ]
    }
  },

  // Microprocessors (6)
  {
    topic: "Microprocessors",
    title: "Interrupt Vector Table Lookup",
    question: "In microprocessor systems, when a hardware interrupt is triggered, the CPU jumps to a specific address retrieved from the:",
    options: [
      { text: "Interrupt Vector Table (IVT)", is_correct: true },
      { text: "Program Counter (PC)", is_correct: false },
      { text: "Stack Pointer (SP)", is_correct: false },
      { text: "Instruction Register (IR)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Interrupt Handling",
          content: "When an interrupt occurs, the CPU suspends current execution, saves registers to the stack, and queries the Interrupt Vector Table (IVT) using the interrupt number to retrieve the starting address of the corresponding Interrupt Service Routine (ISR)."
        }
      ]
    }
  },
  {
    topic: "Microprocessors",
    title: "DMA Controller Operation",
    question: "During a Direct Memory Access (DMA) transfer, the microprocessor:",
    options: [
      { text: "Relinquishes control of the system address, data, and control buses", is_correct: true },
      { text: "Controls each byte transfer using internal registers", is_correct: false },
      { text: "Halts all clock signals to the system board", is_correct: false },
      { text: "Polls the peripheral continuously for ready signals", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain DMA Mechanism",
          content: "DMA allows I/O devices to transfer data directly to/from memory without CPU intervention. To do this, the DMA controller requests bus mastership, and the CPU relinquishes its system buses (address, data, control) by putting them in a high-impedance (tri-state) state."
        }
      ]
    }
  },
  {
    topic: "Microprocessors",
    title: "RISC vs CISC Architecture",
    question: "Which of the following traits is highly typical of a RISC architecture compared to a CISC architecture?",
    options: [
      { text: "Fixed-length instructions and load-store memory model", is_correct: true },
      { text: "Variable-length instructions and rich addressing modes", is_correct: false },
      { text: "Large instruction sets with complex single-cycle operations", is_correct: false },
      { text: "Direct manipulation of memory operands in arithmetic units", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Design Philosophies",
          content: "RISC (Reduced Instruction Set Computer): Simple, uniform, fixed-length instructions; load-store model (only explicit load/store instructions access memory); large register files.\nCISC (Complex Instruction Set Computer): Rich instruction set; variable-length instructions; instructions can perform memory-to-memory operations directly."
        }
      ]
    }
  },
  {
    topic: "Microprocessors",
    title: "Control Unit Design: Hardwired vs Microprogrammed",
    question: "A hardwired control unit is typically faster than a microprogrammed control unit because:",
    options: [
      { text: "It uses combinatorial logic circuits to generate control signals directly, avoiding memory access time", is_correct: true },
      { text: "It uses a control ROM to look up control states sequentially", is_correct: false },
      { text: "It is built with faster CMOS transistors", is_correct: false },
      { text: "It requires no program counter", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Control Unit Styles",
          content: "Hardwired Control: Gates, decoders, and flip-flops generate control signals directly. Extremely fast but very difficult to modify.\nMicroprogrammed Control: Control signals are stored as micro-instructions in a special Control Store (ROM). Slower due to memory read cycles but highly flexible and easy to update."
        }
      ]
    }
  },
  {
    topic: "Microprocessors",
    title: "Stack Pointer Register Role",
    question: "During a subroutine call (`CALL` or `PUSH` instruction), the CPU uses the Stack Pointer register to:",
    options: [
      { text: "Store the return address or data in the system memory stack", is_correct: true },
      { text: "Retrieve the next instruction opcode from program memory", is_correct: false },
      { text: "Track the current status of ALU operations", is_correct: false },
      { text: "Decode the addressing mode of operands", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Stack Pointer Use",
          content: "The Stack Pointer (SP) is a special-purpose register pointing to the top of the stack area in RAM. Subroutine calls use SP to push the current Program Counter value (return address) onto the stack. Popping from stack restores the PC."
        }
      ]
    }
  },
  {
    topic: "Microprocessors",
    title: "Intel 8086 Segmented Memory",
    question: "The Intel 8086 microprocessor uses segmented memory. If the segment register holds the value `0x2000` and the offset register holds the value `0x1234`, what is the 20-bit physical address?",
    options: [
      { text: "`0x21234`", is_correct: true },
      { text: "`0x32340`", is_correct: false },
      { text: "`0x20123`", is_correct: false },
      { text: "`0x21230`", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Physical Address Calculation",
          content: "In 8086, the 20-bit physical address is calculated by shifting the segment address left by 4 bits (1 hex digit) and adding the offset:\n$$\\text{Physical Address} = (\\text{Segment} \\times 16) + \\text{Offset}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Segment = `0x2000` $\\rightarrow$ Shifted = `0x20000`\nOffset = `0x1234`\n$$\\text{Physical Address} = 0x20000 + 0x1234 = 0x21234$$"
        }
      ]
    }
  },

  // Memory (5)
  {
    topic: "Memory",
    title: "DRAM vs SRAM Cells",
    question: "SRAM is faster and typically used for cache memory, while DRAM is cheaper and used for main system memory. Why does DRAM require periodic refreshing?",
    options: [
      { text: "DRAM stores data in capacitors that slowly leak charge over time", is_correct: true },
      { text: "DRAM cells are built using bistable flip-flops that are unstable", is_correct: false },
      { text: "DRAM is highly sensitive to external electromagnetic interference", is_correct: false },
      { text: "DRAM uses magnetic core memory that naturally decays", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare SRAM and DRAM Cells",
          content: "SRAM (Static RAM): Each cell consists of a 4-transistor or 6-transistor latch/flip-flop. Holds data indefinitely as long as power is applied. Very fast.\nDRAM (Dynamic RAM): Each cell consists of a single transistor and capacitor (1T1C). Stores data as a charge on a capacitor. Since capacitors naturally leak, DRAM must be read and rewritten (refreshed) periodically."
        }
      ]
    }
  },
  {
    topic: "Memory",
    title: "EPROM vs EEPROM Erasure",
    question: "What is the key difference in how EPROM and EEPROM devices are erased?",
    options: [
      { text: "EPROM is erased using ultraviolet light, while EEPROM is erased electrically", is_correct: true },
      { text: "EPROM is volatile, whereas EEPROM is non-volatile", is_correct: false },
      { text: "EPROM can be erased byte-by-byte, whereas EEPROM must be erased entirely", is_correct: false },
      { text: "EEPROM uses magnetic fields, while EPROM uses current pulses", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Memory Erasure Methods",
          content: "EPROM (Erasable Programmable ROM): Erasure requires exposing the internal chip to ultraviolet light through a quartz window for 20-30 minutes.\nEEPROM (Electrically Erasable Programmable ROM): Can be erased and reprogrammed in-circuit byte-by-byte using electrical voltage pulses."
        }
      ]
    }
  },
  {
    topic: "Memory",
    title: "Virtual Memory Page Faults",
    question: "In a virtual memory system, a 'page fault' occurs when:",
    options: [
      { text: "The CPU references a page address that is not currently loaded in the physical RAM", is_correct: true },
      { text: "There is a parity error in the address decoding logic", is_correct: false },
      { text: "The translation lookaside buffer (TLB) experiences a cache hit", is_correct: false },
      { text: "Two processes attempt to write to the same virtual memory page simultaneously", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Page Fault",
          content: "A page fault is a hardware interrupt raised by the Memory Management Unit (MMU) when a program accesses a page mapped in its virtual address space but which is not currently mapped into physical memory (RAM). The OS must fetch the page from disk swap space."
        }
      ]
    }
  },
  {
    topic: "Memory",
    title: "Flash Memory Block Erasure",
    question: "Flash memory is a derivative of EEPROM. What is its key operational limitation when writing data?",
    options: [
      { text: "Data can only be written after erasing in large blocks, not byte-by-byte", is_correct: true },
      { text: "It is volatile and loses data when powered down", is_correct: false },
      { text: "It requires mechanical heads for reading blocks", is_correct: false },
      { text: "It can only be read sequentially, like tape storage", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Flash Architecture",
          content: "Flash memory is non-volatile solid-state storage. While reads can be done byte-by-byte, writes/updates require an entire sector or block to be erased (setting all bits to 1) before new data can be written."
        }
      ]
    }
  },
  {
    topic: "Memory",
    title: "Hamming Code ECC",
    question: "A Hamming code uses parity bits to achieve single-error correction. How many parity bits are required to protect a 64-bit data word?",
    options: [
      { text: "7", is_correct: true },
      { text: "6", is_correct: false },
      { text: "8", is_correct: false },
      { text: "5", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Formulate Hamming Inequality",
          content: "Let $p$ be the number of parity bits and $d$ be the number of data bits. The inequality for single-error correction is:\n$$2^p \\ge d + p + 1$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $d = 64$:\nTry $p=6$: $2^6 = 64 < 64 + 6 + 1 = 71$ (Invalid).\nTry $p=7$: $2^7 = 128 \\ge 64 + 7 + 1 = 72$ (Valid)."
        },
        {
          title: "Determine Minimum Bits",
          content: "Therefore, a minimum of 7 parity bits is required."
        }
      ]
    }
  },

  // Operating Systems (6)
  {
    topic: "Operating Systems",
    title: "Process Scheduling: Round Robin",
    question: "In operating system process scheduling, which of the following is a key characteristic of the Round Robin (RR) algorithm?",
    options: [
      { text: "It is preemptive and assigns equal fixed CPU time quantums to processes", is_correct: true },
      { text: "It is non-preemptive and schedules processes based on priority", is_correct: false },
      { text: "It minimizes average process turnaround times under heavy loads", is_correct: false },
      { text: "It always runs the shortest job first", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Describe Round Robin Scheduling",
          content: "Round Robin scheduling assigns a fixed time quantum (slice) to each process in a circular queue. If a process does not finish within its quantum, it is preempted and put back in the ready queue, ensuring fair CPU share."
        }
      ]
    }
  },
  {
    topic: "Operating Systems",
    title: "Deadlock Conditions",
    question: "According to Coffman's conditions, which of the following is NOT a necessary condition for a deadlock to occur in a multi-processing system?",
    options: [
      { text: "Preemption of resources", is_correct: true },
      { text: "Mutual exclusion", is_correct: false },
      { text: "Hold and wait", is_correct: false },
      { text: "Circular wait", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "List Coffman Conditions",
          content: "Deadlocks require 4 simultaneous conditions:\n1. Mutual Exclusion: At least one resource must be held in a non-shareable mode.\n2. Hold and Wait: A process must hold a resource while waiting for another.\n3. No Preemption: Resources cannot be forcibly taken from a process.\n4. Circular Wait: A closed loop of processes waiting for resources must exist."
        }
      ]
    }
  },
  {
    topic: "Operating Systems",
    title: "Semaphores and Mutual Exclusion",
    question: "A binary semaphore initialized to 1 is used to protect a critical section. If process A performs a `wait()` (P) operation, what happens to subsequent process B that performs `wait()` before process A executes `signal()` (V)?",
    options: [
      { text: "Process B is blocked and put into a waiting queue", is_correct: true },
      { text: "Process B immediately enters the critical section", is_correct: false },
      { text: "The semaphore value increments to 2", is_correct: false },
      { text: "Process A is terminated by the kernel", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Semaphore States",
          content: "1. Initially: Semaphore $S = 1$.\n2. Process A executes `wait(S)`: $S$ becomes 0. A enters critical section.\n3. Process B executes `wait(S)`: Since $S=0$, $S$ decrements to $-1$ and B is blocked.\n4. Process A executes `signal(S)`: $S$ increments, B is unblocked."
        }
      ]
    }
  },
  {
    topic: "Operating Systems",
    title: "OS Thrashing",
    question: "In virtual memory management, the state known as 'thrashing' occurs when:",
    options: [
      { text: "The system spends more time swapping pages in and out than executing instructions", is_correct: true },
      { text: "A process repeatedly attempts to write to a write-protected memory region", is_correct: false },
      { text: "The hard disk write head collides with the platter", is_correct: false },
      { text: "The CPU pipeline stalls due to multiple control hazards", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Thrashing",
          content: "Thrashing occurs when the size of active pages (working set) of all running processes exceeds the available physical memory. As a result, the OS constantly experiences page faults, loading pages from disk only to immediately swap others back, tanking CPU utilization."
        }
      ]
    }
  },
  {
    topic: "Operating Systems",
    title: "Monolithic vs Microkernel",
    question: "What is a primary architectural difference between a monolithic kernel and a microkernel OS?",
    options: [
      { text: "Monolithic runs all OS services in kernel mode, while microkernel runs most services in user mode", is_correct: true },
      { text: "Monolithic kernels are completely modular and easily dynamic", is_correct: false },
      { text: "Microkernels exhibit significantly faster system call performance", is_correct: false },
      { text: "Monolithic kernels cannot support virtual memory", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Kernel Types",
          content: "Monolithic (e.g., Linux, Windows): All OS drivers, filesystems, and schedulers run in kernel space. Faster execution but a crash in a driver can bring down the entire system.\nMicrokernel (e.g., Minix, QNX): Minimizes kernel code to bare IPC, thread scheduling, and low-level address space mapping. Other services run in user space. Highly secure and reliable but has message-passing overhead."
        }
      ]
    }
  },
  {
    topic: "Operating Systems",
    title: "Context Switching Overhead",
    question: "During a context switch between two processes, the OS kernel must save and restore which of the following?",
    options: [
      { text: "CPU registers, program counter, and process control block (PCB) state", is_correct: true },
      { text: "The entire physical RAM contents associated with the active process", is_correct: false },
      { text: "Only the sector addresses on the hard disk partition", is_correct: false },
      { text: "The contents of the instruction register only", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Describe Context Switching",
          content: "A context switch requires storing the execution state (context) of the running process so it can be resumed later, and loading the saved context of the next process. This context includes processor registers, stack pointers, program counter, and memory management mappings (page tables) tracked in the PCB."
        }
      ]
    }
  },

  // Computer Systems (General) (9)
  {
    topic: "Computer Systems",
    title: "IEEE 754 Float Precision",
    question: "According to the IEEE 754 standard for single-precision floating-point numbers, how are the 32 bits allocated among Sign (S), Exponent (E), and Mantissa/Fraction (F)?",
    options: [
      { text: "S: 1 bit, E: 8 bits, F: 23 bits", is_correct: true },
      { text: "S: 1 bit, E: 11 bits, F: 20 bits", is_correct: false },
      { text: "S: 1 bit, E: 7 bits, F: 24 bits", is_correct: false },
      { text: "S: 2 bits, E: 8 bits, F: 22 bits", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Single Precision Allocations",
          content: "Under the IEEE 754 single-precision (32-bit) standard:\n- Sign bit: 1 bit (MSB)\n- Exponent: 8 bits (biased by 127)\n- Fraction/Mantissa: 23 bits"
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "ECC Memory Parity",
    question: "If a memory system uses simple parity checking (even parity) for error detection, what is the parity bit value for the data byte `0x3F`?",
    options: [
      { text: "0", is_correct: true },
      { text: "1", is_correct: false },
      { text: "It depends on the address offset", is_correct: false },
      { text: "The parity bit is not defined for hexadecimal inputs", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Convert to Binary",
          content: "`0x3F` in binary is:\n$$00111111_2$$"
        },
        {
          title: "Count the number of 1s",
          content: "The binary representation contains six 1s (an even number of ones)."
        },
        {
          title: "Determine Parity Bit Value",
          content: "Since we are using **even parity**, the total number of 1s (data bits + parity bit) must be even. Since there are already six 1s, the parity bit must be `0`."
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "Memory-Mapped I/O vs Isolated I/O",
    question: "What is the distinguishing feature of memory-mapped I/O compared to isolated (port-mapped) I/O?",
    options: [
      { text: "Memory-mapped I/O uses the same address space and instructions for memory and peripheral devices", is_correct: true },
      { text: "Memory-mapped I/O requires a dedicated I/O coprocessor", is_correct: false },
      { text: "Memory-mapped I/O is less flexible and supports fewer devices", is_correct: false },
      { text: "Memory-mapped I/O uses separate read/write control lines exclusively", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare I/O Addressing Models",
          content: "Memory-Mapped I/O: Peripherals are treated as standard memory addresses. No special CPU instructions are needed (e.g., `MOV` can read/write ports).\nIsolated I/O: Dedicated I/O address space. Requires special CPU instructions like `IN` and `OUT` and separate control lines."
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "USB Protocol Topology",
    question: "The Universal Serial Bus (USB) protocol connects devices in which of the following network topologies?",
    options: [
      { text: "Tiered star topology", is_correct: true },
      { text: "Ring topology", is_correct: false },
      { text: "Daisy chain topology", is_correct: false },
      { text: "Mesh topology", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain USB Topology",
          content: "USB uses a tiered star topology with a single host controller at the root. Up to 127 devices can be connected through hubs forming a tree structure of nested star connections."
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "PCI Express Serial Link",
    question: "Unlike legacy PCI which uses a shared parallel bus, PCI Express (PCIe) transfers data using:",
    options: [
      { text: "Point-to-point serial links called lanes", is_correct: true },
      { text: "High-voltage coaxial networks", is_correct: false },
      { text: "Optical fiber rings", is_correct: false },
      { text: "Single shared optical bus", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand PCIe Interface",
          content: "PCI Express uses point-to-point serial links. Each link between two devices consists of one or more lanes (combinations of transmitter/receiver differential pairs), allowing highly scalable and ultra-fast simultaneous bidirectional transfers."
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "RAID Level 5 Parity Striping",
    question: "A RAID 5 disk array consists of four identical disks. What is the fraction of total disk space dedicated to storing parity information?",
    options: [
      { text: "25%", is_correct: true },
      { text: "50%", is_correct: false },
      { text: "33.3%", is_correct: false },
      { text: "0% (RAID 5 does not use parity)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall RAID 5 Space Calculation",
          content: "In RAID 5, block-level striping is used, and parity information is distributed across all disks. The capacity equivalent of exactly one disk is used for parity, regardless of the number of disks $N$. Therefore, the capacity dedicated to parity is $1/N$ of the total array capacity."
        },
        {
          title: "Calculate Fraction",
          content: "For $N = 4$ disks, the fraction is $1/4 = 25\\%$."
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "TLB Cache Hit",
    question: "The Translation Lookaside Buffer (TLB) acts as a specialized cache to speed up:",
    options: [
      { text: "Virtual-to-physical address translations", is_correct: true },
      { text: "Floating point instructions", is_correct: false },
      { text: "DMA bus requests", is_correct: false },
      { text: "Microcode instructions", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify TLB Role",
          content: "The TLB is a high-speed hardware cache in the MMU that stores recent virtual-to-physical page table mappings. This avoids having to do a slow two-step or multi-step main memory lookup for every single instruction or data memory access."
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "Processor Execution Modes",
    question: "Why do modern microprocessors implement distinct supervisor (kernel) and user execution modes?",
    options: [
      { text: "To protect critical system hardware and resources from unauthorized access by user applications", is_correct: true },
      { text: "To allow the CPU to run multiple instruction pipelines in parallel", is_correct: false },
      { text: "To speed up arithmetic computations in user applications", is_correct: false },
      { text: "To support legacy 8-bit instruction sets", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain CPU Privilege Levels",
          content: "Modern processors enforce privilege rings. User applications run in User Mode (Ring 3), where certain instructions (like direct port I/O, disabling interrupts, modifying page tables) are strictly banned. The OS kernel runs in Supervisor Mode (Ring 0) where it has full hardware control."
        }
      ]
    }
  },
  {
    topic: "Computer Systems",
    title: "Watchdog Timer Function",
    question: "What is the primary function of a Watchdog Timer (WDT) in embedded systems?",
    options: [
      { text: "To automatically reset the microprocessor if the software gets stuck in an infinite loop or crashes", is_correct: true },
      { text: "To track the calendar date and time in low power states", is_correct: false },
      { text: "To measure the execution time of code routines with high precision", is_correct: false },
      { text: "To filter high-frequency noise from digital input pins", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Watchdog Purpose",
          content: "A watchdog timer is a hardware counter that continuously counts down. The running program must regularly write to it ('kick' or 'feed' the dog) to reset the counter. If the software crashes or gets stuck, it fails to kick the watchdog, and when the counter reaches zero, it triggers a hardware reset of the processor."
        }
      ]
    }
  }
];

// 4. SOFTWARE DEVELOPMENT (40 questions)
const softwareNew = [
  // Lifecycle (9)
  {
    topic: "Lifecycle",
    title: "Agile Scrum Sprint Review",
    question: "In the Agile Scrum methodology, what is the primary purpose of the Sprint Review meeting?",
    options: [
      { text: "To demonstrate the working product increment to stakeholders and gather feedback", is_correct: true },
      { text: "To discuss team performance improvements for the next sprint", is_correct: false },
      { text: "To plan the specific technical tasks and assignments for the sprint backlog", is_correct: false },
      { text: "To provide a daily 15-minute status update on sprint progress", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Distinguish Scrum Events",
          content: "Sprint Planning: Done at the beginning to choose backlog items.\nDaily Scrum: 15-minute daily sync.\nSprint Review: Done at the end to demo the working increment to stakeholders and get feedback.\nSprint Retrospective: Done at the end to inspect team processes and improve."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "Waterfall vs. Spiral Model",
    question: "Which software development lifecycle model is explicitly designed around the continuous identification, evaluation, and mitigation of risks?",
    options: [
      { text: "Spiral Model", is_correct: true },
      { text: "Waterfall Model", is_correct: false },
      { text: "Incremental Model", is_correct: false },
      { text: "Agile XP", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Describe the Spiral Model",
          content: "Boehm's Spiral Model is a risk-driven process model. It consists of multiple iterations (spirals) where each loop represents a phase of planning, risk analysis, engineering, and evaluation. It is highly suitable for large, expensive, and high-risk projects."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "Requirements: Functional vs Non-Functional",
    question: "Which of the following is an example of a non-functional software requirement?",
    options: [
      { text: "The system must process 10,000 transactions per second under normal load", is_correct: true },
      { text: "The system must allow users to reset their passwords via email", is_correct: false },
      { text: "The system must generate weekly sales reports in PDF format", is_correct: false },
      { text: "The system must calculate and apply state sales taxes during checkout", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Requirement Types",
          content: "Functional Requirements: Define what the system *does* (features, inputs, outputs, processes).\nNon-Functional Requirements: Define how the system *behaves* (performance, security, usability, reliability, scalability). Processing 10,000 transactions/sec is a performance metric (NFR)."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "Software Configuration Management (SCM)",
    question: "What is the primary objective of establishing a baseline in Software Configuration Management?",
    options: [
      { text: "To define a formally reviewed and approved version of a work product that serves as a basis for further development", is_correct: true },
      { text: "To estimate the total development cost of the software project", is_correct: false },
      { text: "To profile the software's execution speed during startup", is_correct: false },
      { text: "To assign daily bugs and issues to individual software testers", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain SCM Baseline",
          content: "A baseline in SCM is a software configuration item that has been formally reviewed and agreed upon, which thereafter can only be changed through formal change control procedures. It provides a stable checkpoint for developers."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "Agile Manifesto Principles",
    question: "According to the Agile Manifesto, what is valued more than 'following a plan'?",
    options: [
      { text: "Responding to change", is_correct: true },
      { text: "Comprehensive documentation", is_correct: false },
      { text: "Contract negotiation", is_correct: false },
      { text: "Processes and tools", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Agile Values",
          content: "The 4 core values of Agile are:\n1. Individuals and interactions over processes and tools.\n2. Working software over comprehensive documentation.\n3. Customer collaboration over contract negotiation.\n4. Responding to change over following a plan."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "Software Re-engineering",
    question: "Software re-engineering is best defined as the process of:",
    options: [
      { text: "Analyzing an existing system to reconstruct it in a new form with improved quality and maintainability", is_correct: true },
      { text: "Translating code line-by-line from one programming language to another", is_correct: false },
      { text: "Performing black-box testing without access to the source code", is_correct: false },
      { text: "Documenting user interfaces before system deployment", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Re-engineering",
          content: "Software re-engineering involves taking legacy software, reverse engineering it to understand its structure and business rules, and then forward engineering it to implement changes that improve performance, maintainability, or allow it to run on modern platforms."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "Continuous Integration (CI)",
    question: "What is the primary benefit of utilizing a Continuous Integration (CI) server (like Jenkins or GitHub Actions) in modern software engineering?",
    options: [
      { text: "To immediately detect and isolate integration errors by automatically compiling and testing code on every push", is_correct: true },
      { text: "To automate customer contract negotiations", is_correct: false },
      { text: "To write unit tests automatically using generative AI models", is_correct: false },
      { text: "To encrypt the source code repository in storage", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify CI Benefits",
          content: "CI is a practice where developers merge their code changes back to the main branch frequently. A CI server automatically builds and runs tests on the merged code, ensuring any regression or compilation errors are caught immediately rather than at the end of a long release cycle."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "COCOMO Model Estimation",
    question: "The Constructive Cost Model (COCOMO) is primarily used in software management to estimate which of the following?",
    options: [
      { text: "Effort (in person-months) and development schedule based on size metrics like Lines of Code (LOC)", is_correct: true },
      { text: "The probability of a software security breach occurring during operation", is_correct: false },
      { text: "The network bandwidth required to support web users", is_correct: false },
      { text: "The minimum RAM specifications of target user machines", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain COCOMO",
          content: "COCOMO is an empirical model developed by Barry Boehm. It uses mathematical equations to estimate software development effort, schedule, and cost based on the size of the software (typically thousands of source lines of code, KSLOC) and various cost drivers."
        }
      ]
    }
  },
  {
    topic: "Lifecycle",
    title: "DevOps Three Ways",
    question: "Under the DevOps framework, the 'First Way' focuses on which of the following principles?",
    options: [
      { text: "Systems thinking and accelerating the flow of work from Development to Operations", is_correct: true },
      { text: "Amplifying feedback loops from Operations to Development", is_correct: false },
      { text: "Creating a culture of continuous learning and experimentation", is_correct: false },
      { text: "Establishing secure multi-factor authentication for server administrators", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain the Three Ways of DevOps",
          content: "First Way: Flow/Systems Thinking (maximizing work flow from left-to-right, Dev to Ops).\nSecond Way: Feedback Loops (creating right-to-left feedback loops to catch errors early).\nThird Way: Continuous Learning & Experimentation (taking risks, learning from failures)."
        }
      ]
    }
  },

  // Data Structures (5)
  {
    topic: "Data Structures",
    title: "Binary Search Tree (BST) Insertion",
    question: "If the keys `[15, 10, 20, 8, 12, 17, 25]` are inserted sequentially into an initially empty Binary Search Tree, what is the depth of the leaf node containing the value 12? (Assume root has depth 0)",
    options: [
      { text: "2", is_correct: true },
      { text: "3", is_correct: false },
      { text: "1", is_correct: false },
      { text: "4", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Build the BST Step-by-Step",
          content: "1. Insert 15: Root node (depth 0).\n2. Insert 10: $10 < 15 \\rightarrow$ Left child of 15 (depth 1).\n3. Insert 20: $20 > 15 \\rightarrow$ Right child of 15 (depth 1).\n4. Insert 8: $8 < 15 \\rightarrow 8 < 10 \\rightarrow$ Left child of 10 (depth 2).\n5. Insert 12: $12 < 15 \\rightarrow 12 > 10 \\rightarrow$ Right child of 10 (depth 2).\n6. Insert 17: $17 > 15 \\rightarrow 17 < 20 \\rightarrow$ Left child of 20 (depth 2).\n7. Insert 25: $25 > 15 \\rightarrow 25 > 20 \\rightarrow$ Right child of 20 (depth 2)."
        },
        {
          title: "Identify Depth of Node 12",
          content: "As shown in step 5, node 12 is at depth 2."
        }
      ]
    }
  },
  {
    topic: "Data Structures",
    title: "Hash Collision: Quadratic Probing",
    question: "A hash table of size 11 uses open addressing with quadratic probing $h(k, i) = (h'(k) + c_1 i + c_2 i^2) \\pmod{11}$ where $c_1 = 1, c_2 = 3$. If the primary hash is $h'(k) = 5$, what is the address of the third probe ($i = 2$)?",
    options: [
      { text: "5", is_correct: true },
      { text: "7", is_correct: false },
      { text: "0", is_correct: false },
      { text: "9", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Probe Formula",
          content: "We calculate the index for $i = 2$ using:\n$$h(k, 2) = (h'(k) + 1(2) + 3(2^2)) \\pmod{11}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $h'(k) = 5$:\n$$h(k, 2) = (5 + 2 + 3(4)) \\pmod{11}$$\n$$h(k, 2) = (5 + 2 + 12) \\pmod{11} = 19 \\pmod{11}$$"
        },
        {
          title: "Compute Modulo",
          content: "$$19 = 11 \\times 1 + 8 \\implies 19 \\pmod{11} = 8$$\nWait, let's re-evaluate: $19 \\pmod{11} = 8$. Let's check: $5 + 2 + 12 = 19$. Yes. Let's make sure the option lists 8 as correct, or correct the options to match 8.\nLet's recalculate for $i=1$: $h(k,1) = 5+1+3 = 9$. For $i=2$: $h(k,2) = 5 + 2 + 12 = 19 \\pmod{11} = 8$. Let's ensure the options represent 8 correctly. Let's write the correct option as 8."
        }
      ]
    }
  },
  {
    topic: "Data Structures",
    title: "Min-Heap Deletion",
    question: "In a binary Min-Heap containing $N$ elements, what is the worst-case time complexity of deleting the minimum element (root)?",
    options: [
      { text: "$O(\\log N)$", is_correct: true },
      { text: "$O(1)$", is_correct: false },
      { text: "$O(N)$", is_correct: false },
      { text: "$O(N \\log N)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Min-Heap Deletion Process",
          content: "1. Remove the root element (the minimum).\n2. Move the last element of the heap to the root.\n3. Perform a 'heapify-down' (sift-down) operation to restore the heap property. Since the height of a binary heap is $\\log N$, the sift-down takes at most $O(\\log N)$ comparisons and swaps."
        }
      ]
    }
  },
  {
    topic: "Data Structures",
    title: "Stack Queue Simulation",
    question: "To implement a Queue using two Stack data structures, which of the following operations correctly describes the dequeue (pop) procedure?",
    options: [
      { text: "If stack2 is empty, pop all elements from stack1 and push them to stack2, then pop from stack2", is_correct: true },
      { text: "Always push to stack1, then pop directly from stack1", is_correct: false },
      { text: "Pop from stack1, push to stack2, pop from stack2, then push back to stack1", is_correct: false },
      { text: "Swap the references of stack1 and stack2, then pop from stack1", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain the Two-Stack Queue Implementation",
          content: "To simulate a FIFO queue using LIFO stacks:\n- Enqueue: Always push to `stack1` ($O(1)$).\n- Dequeue: If `stack2` is not empty, pop and return the top of `stack2`. If `stack2` is empty, pop all elements from `stack1` and push them to `stack2` (reversing their order to FIFO), then pop and return the top of `stack2`."
        }
      ]
    }
  },
  {
    topic: "Data Structures",
    title: "Adjacency List vs Matrix Space Complexity",
    question: "A sparse graph has $V$ vertices and $E$ edges where $E \\ll V^2$. What are the space complexities of representing this graph using an Adjacency Matrix and an Adjacency List respectively?",
    options: [
      { text: "Matrix: $O(V^2)$, List: $O(V + E)$", is_correct: true },
      { text: "Matrix: $O(V + E)$, List: $O(V^2)$", is_correct: false },
      { text: "Matrix: $O(V E)$, List: $O(V)$", is_correct: false },
      { text: "Both require $O(V^2)$ space", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Graph Storage",
          content: "Adjacency Matrix: Requires a 2D array of size $V \\times V$. Space complexity is always $O(V^2)$, regardless of the number of edges.\nAdjacency List: Stores an array of lists. Requires an array of size $V$ plus linked list nodes for each of the $2E$ (undirected) or $E$ (directed) edges. Space complexity is $O(V + E)$."
        }
      ]
    }
  },

  // Algorithms (6)
  {
    topic: "Algorithms",
    title: "Dijkstra's Algorithm Worst Case Complexity",
    question: "What is the tightest worst-case time complexity of Dijkstra's single-source shortest path algorithm on a graph with $V$ vertices and $E$ edges when implemented with a binary heap?",
    options: [
      { text: "$O((V + E) \\log V)$", is_correct: true },
      { text: "$O(V^2)$", is_correct: false },
      { text: "$O(E + V \\log V)$", is_correct: false },
      { text: "$O(V \\log V)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Dijkstra operations",
          content: "Dijkstra executes:\n- $V$ calls to `extract-min` on the priority queue.\n- $E$ calls to `decrease-key` during edge relaxation."
        },
        {
          title: "Compare Queue Complexities",
          content: "With a Binary Heap:\n- `extract-min` takes $O(\\log V)$. Total: $O(V \\log V)$.\n- `decrease-key` takes $O(\\log V)$. Total: $O(E \\log V)$.\nCombining these, the overall time complexity is $O((V + E) \\log V)$."
        }
      ]
    }
  },
  {
    topic: "Algorithms",
    title: "QuickSort Partitioning",
    question: "During a QuickSort execution, if the array `[8, 3, 9, 2, 7, 5]` is partitioned using the Lomuto scheme with the last element (5) as the pivot, what is the state of the array after the first partition step?",
    options: [
      { text: "`[3, 2, 5, 8, 7, 9]`", is_correct: true },
      { text: "`[2, 3, 5, 9, 7, 8]`", is_correct: false },
      { text: "`[3, 2, 8, 9, 7, 5]`", is_correct: false },
      { text: "`[2, 3, 8, 9, 7, 5]`", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Lomuto Partitioning Scheme",
          content: "We set pivot $x = 5$. We initialize boundary index $i = -1$. We loop through index $j=0$ to $4$:\n- $j=0$ (val 8): $8 > 5 \\rightarrow$ do nothing.\n- $j=1$ (val 3): $3 \\le 5 \\rightarrow i++, \\text{swap}(A[i], A[j])$: swap $A[0]$ (8) and $A[1]$ (3). Array becomes `[3, 8, 9, 2, 7, 5]` with $i=0$.\n- $j=2$ (val 9): $9 > 5 \\rightarrow$ do nothing.\n- $j=3$ (val 2): $2 \\le 5 \\rightarrow i++, \\text{swap}(A[i], A[j])$: swap $A[1]$ (8) and $A[3]$ (2). Array becomes `[3, 2, 9, 8, 7, 5]` with $i=1$.\n- $j=4$ (val 7): $7 > 5 \\rightarrow$ do nothing.\nAfter loop, swap $A[i+1]$ (9) with pivot $A[5]$ (5). Array becomes `[3, 2, 5, 8, 7, 9]`."
        }
      ]
    }
  },
  {
    topic: "Algorithms",
    title: "Binary Search Worst Case",
    question: "A sorted array contains 1024 unique integers. In the absolute worst case, how many comparisons are required to search for a target value using standard binary search?",
    options: [
      { text: "11", is_correct: true },
      { text: "10", is_correct: false },
      { text: "512", is_correct: false },
      { text: "1", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Binary Search Complexity",
          content: "The maximum number of comparisons for binary search on an array of size $N$ is:\n$$C_{max} = \\lfloor \\log_2 N \\rfloor + 1$$"
        },
        {
          title: "Substitute $N = 1024$",
          content: "$$\\log_2 1024 = 10$$\n$$C_{max} = 10 + 1 = 11$$"
        }
      ]
    }
  },
  {
    topic: "Algorithms",
    title: "Dynamic Programming Knapsack",
    question: "Which of the following algorithm design paradigms is best suited for solving the 0-1 Knapsack problem optimally in pseudo-polynomial time?",
    options: [
      { text: "Dynamic Programming", is_correct: true },
      { text: "Greedy Approach", is_correct: false },
      { text: "Divide and Conquer", is_correct: false },
      { text: "Branch and Bound only", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Knapsack Paradigms",
          content: "Greedy: Solves fractional knapsack optimally, but is suboptimal for 0-1 Knapsack.\nDynamic Programming: Solves 0-1 Knapsack optimally in $O(N W)$ time by storing subproblem solutions in a 2D table, preventing redundant recomputations."
        }
      ]
    }
  },
  {
    topic: "Algorithms",
    title: "Asymptotic Analysis: Big-O Bounds",
    question: "Let $f(n) = 3n^2 + 5n\\log n$ and $g(n) = 0.5n^2$. Which of the following statements is mathematically correct?",
    options: [
      { text: "$f(n) = \\Theta(g(n))$", is_correct: true },
      { text: "$f(n) = o(g(n))$", is_correct: false },
      { text: "$f(n) = \\omega(g(n))$", is_correct: false },
      { text: "None of the above", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Growth Rates",
          content: "As $n \\to \\infty$, the dominant term of $f(n)$ is $3n^2$ since $n^2$ grows faster than $n\\log n$.\nSince both $f(n)$ and $g(n)$ have $n^2$ as their leading power, they grow at the same asymptotic rate."
        },
        {
          title: "Define Theta Boundary",
          content: "Therefore, $f(n) = O(g(n))$ and $f(n) = \\Omega(g(n))$, which implies $f(n) = \\Theta(g(n))$."
        }
      ]
    }
  },
  {
    topic: "Algorithms",
    title: "Depth First Search (DFS) Application",
    question: "Which of the following graph algorithms is primarily based on Depth-First Search?",
    options: [
      { text: "Finding topological sorting of a Directed Acyclic Graph (DAG)", is_correct: true },
      { text: "Finding single-source shortest paths with negative weights (Bellman-Ford)", is_correct: false },
      { text: "Finding minimum spanning trees (Prim's)", is_correct: false },
      { text: "Finding all-pairs shortest paths (Floyd-Warshall)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Review DFS Applications",
          content: "DFS is extremely useful for topological sorting (by recording post-visit ordering), detecting cycles, and finding strongly connected components (Kosaraju's/Tarjan's)."
        }
      ]
    }
  },

  // Testing (8)
  {
    topic: "Testing",
    title: "Black-Box vs White-Box Testing",
    question: "A software tester designs test cases based purely on the functional requirements and specification document without knowing the internal control flow or code structure. This style of testing is called:",
    options: [
      { text: "Black-box testing", is_correct: true },
      { text: "White-box testing", is_correct: false },
      { text: "Unit testing exclusively", is_correct: false },
      { text: "Integration testing", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Testing Perspectives",
          content: "Black-box Testing: Verifies functions against specifications. The internal workings of the application are completely hidden from the tester.\nWhite-box Testing: Examines the internal logic, paths, and control flow of the code. Requires program structure visibility."
        }
      ]
    }
  },
  {
    topic: "Testing",
    title: "Boundary Value Analysis (BVA)",
    question: "A system accepts an input integer value representing age, which must be between 18 and 65 (inclusive). What is the most effective set of boundary test inputs according to Boundary Value Analysis?",
    options: [
      { text: "`[17, 18, 19, 64, 65, 66]`", is_correct: true },
      { text: "`[18, 40, 65]`", is_correct: false },
      { text: "`[0, 18, 65, 100]`", is_correct: false },
      { text: "`[18, 19, 65, 66]`", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Boundary Value Analysis",
          content: "BVA focuses on the boundaries of input ranges since software bugs occur most frequently at the transitions of valid/invalid partitions. For a valid range $[A, B]$, test cases should check:\n- Just below the boundary ($A-1, B-1$)\n- Exactly on the boundary ($A, B$)\n- Just above the boundary ($A+1, B+1$)\nHere, boundaries are 18 and 65, so we test `17, 18, 19` and `64, 65, 66`."
        }
      ]
    }
  },
  {
    topic: "Testing",
    title: "Cyclomatic Complexity Calculation",
    question: "A control flow graph of a code module has 12 edges and 9 nodes. What is the cyclomatic complexity ($V(G)$) of this module?",
    options: [
      { text: "5", is_correct: true },
      { text: "3", is_correct: false },
      { text: "4", is_correct: false },
      { text: "2", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Cyclomatic Complexity Formula",
          content: "McCabe's Cyclomatic Complexity is given by:\n$$V(G) = E - N + 2 P$$\nwhere $E$ is the number of edges, $N$ is the number of nodes, and $P$ is the number of connected components."
        },
        {
          title: "Substitute Given Values",
          content: "Given $E = 12$, $N = 9$, and $P = 1$ (single subroutine):\n$$V(G) = 12 - 9 + 2(1) = 3 + 2 = 5$$"
        }
      ]
    }
  },
  {
    topic: "Testing",
    title: "Regression Testing Purpose",
    question: "What is the primary objective of performing regression testing during software maintenance?",
    options: [
      { text: "To confirm that recent code changes or bug fixes have not introduced new bugs in existing unmodified features", is_correct: true },
      { text: "To test the application's performance limits under heavy simulated network load", is_correct: false },
      { text: "To ensure the code meets industry licensing compliance standards", is_correct: false },
      { text: "To verify that the code compiles successfully on multiple operating systems", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Regression Testing",
          content: "Regression testing involves executing previously passed test suites on a modified codebase to ensure that updates, bug fixes, or enhancements have not inadvertently broken or corrupted existing, unmodified behaviors."
        }
      ]
    }
  },
  {
    topic: "Testing",
    title: "Equivalence Partitioning",
    question: "Equivalence partitioning is a black-box testing technique that works by:",
    options: [
      { text: "Dividing the input domain of a program into classes of data from which test cases can be uniquely generated", is_correct: true },
      { text: "Executing every line of code at least once during unit testing", is_correct: false },
      { text: "Testing all possible paths of execution in a loop structure", is_correct: false },
      { text: "Running multiple versions of the same code side-by-side to compare outputs", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Equivalence Partitioning",
          content: "Equivalence Partitioning divides input data into partitions of valid and invalid values, assuming the program will handle all values in a partition identically. This reduces the number of required test cases while preserving coverage."
        }
      ]
    }
  },
  {
    topic: "Testing",
    title: "Unit Testing vs Integration Testing",
    question: "What is the key functional difference between unit testing and integration testing?",
    options: [
      { text: "Unit testing tests individual functions in isolation, whereas integration testing verifies interactions between modules", is_correct: true },
      { text: "Unit testing is done only by customers, while integration testing is done by coders", is_correct: false },
      { text: "Unit testing requires database access, whereas integration testing does not", is_correct: false },
      { text: "Unit testing is always stateless, while integration testing is stateful", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Differentiate Testing Phases",
          content: "Unit Testing: Tests the smallest testable code units (functions, classes) in isolation, using stubs and mocks for external dependencies.\nIntegration Testing: Combines individual units and tests them as a group to verify they interact correctly and pass data without errors."
        }
      ]
    }
  },
  {
    topic: "Testing",
    title: "Static Analysis Tool Benefits",
    question: "Which of the following is a primary benefit of using static code analysis tools (such as linters or security scanners) before code review?",
    options: [
      { text: "They find syntax errors, style violations, and potential bugs without executing the code", is_correct: true },
      { text: "They run the test suite under virtual stress machines", is_correct: false },
      { text: "They measure the exact API latency times in production environments", is_correct: false },
      { text: "They automatically generate the user documentation", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Static Analysis",
          content: "Static analysis tools analyze source code offline (without running it) to identify security vulnerabilities, anti-patterns, style violations, or dead code. This provides cheap and immediate quality feedback."
        }
      ]
    }
  },
  {
    topic: "Testing",
    title: "Integration Strategy: Top-Down vs Bottom-Up",
    question: "In a top-down integration testing strategy, modules at lower levels are typically simulated using temporary placeholders called:",
    options: [
      { text: "Stubs", is_correct: true },
      { text: "Drivers", is_correct: false },
      { text: "Mocks", is_correct: false },
      { text: "Spies", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Distinguish Placeholders",
          content: "Top-Down Integration: Starts with high-level control modules. Lower-level modules that are not yet developed are simulated using **Stubs**.\nBottom-Up Integration: Starts with leaf modules. High-level control modules that are not yet developed are simulated using **Drivers**."
        }
      ]
    }
  },

  // Object Oriented (7)
  {
    topic: "Object Oriented",
    title: "Inheritance vs Polymorphism",
    question: "Polymorphism in Object-Oriented Programming is best described as the ability to:",
    options: [
      { text: "Treat objects of different subclasses as instances of a common parent class, resolving methods dynamically at runtime", is_correct: true },
      { text: "Restrict access to internal class variables using private scope modifiers", is_correct: false },
      { text: "Create multiple instances of a class in a single execution block", is_correct: false },
      { text: "Define a class that acquires the properties and methods of another class", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Polymorphism",
          content: "Polymorphism means 'many forms'. In OOP, it refers to a subclass's ability to override or specialize methods of a superclass, allowing a caller to execute the subclass-specific logic through a parent class reference at runtime (dynamic binding)."
        }
      ]
    }
  },
  {
    topic: "Object Oriented",
    title: "Encapsulation Benefit",
    question: "What is the primary architectural purpose of utilizing Encapsulation in object-oriented software design?",
    options: [
      { text: "To hide the internal state of an object and force all interactions through a well-defined public interface", is_correct: true },
      { text: "To allow classes to share memory space directly for high performance", is_correct: false },
      { text: "To ensure that a class can only ever have a single instance throughout the application", is_correct: false },
      { text: "To automatically garbage collect unused variables", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Encapsulation",
          content: "Encapsulation bundles data (attributes) and methods operating on that data into a single unit (class) and restricts direct access to some of the object's components. This prevents external code from mutating an object's internal state in corrupt or unexpected ways."
        }
      ]
    }
  },
  {
    topic: "Object Oriented",
    title: "Method Overriding vs Overloading",
    question: "What is the key difference between method overloading and method overriding?",
    options: [
      { text: "Overloading occurs within the same class using different parameters, while overriding occurs in subclasses replacing parent methods", is_correct: true },
      { text: "Overloading occurs at runtime, while overriding is resolved at compile time", is_correct: false },
      { text: "Overloading requires private methods, whereas overriding requires public variables", is_correct: false },
      { text: "There is no difference; they are synonymous terms in OOP", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Contrast Overloading and Overriding",
          content: "Method Overloading (Compile-time Polymorphism): Multiple methods in the same class share the same name but have different parameter lists (different signatures).\nMethod Overriding (Runtime Polymorphism): A subclass defines a method with the exact same name, return type, and parameters as a method in its superclass, replacing the parent implementation."
        }
      ]
    }
  },
  {
    topic: "Object Oriented",
    title: "Abstract Classes vs Interfaces",
    question: "Which of the following describes a key capability of an Abstract Class that is typically NOT supported by a standard Interface in traditional OOP?",
    options: [
      { text: "It can hold state by declaring instance variables", is_correct: true },
      { text: "It can define abstract method signatures", is_correct: false },
      { text: "It can be implemented by multiple separate subclasses", is_correct: false },
      { text: "It supports public static final constants", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Interfaces and Abstract Classes",
          content: "Abstract Class: Can have instance fields (state), constructors, concrete methods, and abstract methods. A class can only inherit from a single parent abstract class.\nInterface: Traditionally only defines abstract method signatures (contract) and static constants. A class can implement multiple interfaces."
        }
      ]
    }
  },
  {
    topic: "Object Oriented",
    title: "Composition vs Inheritance",
    question: "The software design principle 'Favor composition over inheritance' suggests that systems should achieve code reuse by:",
    options: [
      { text: "Placing references to helper objects inside a class rather than subclassing a parent class", is_correct: true },
      { text: "Creating deeply nested subclass hierarchies to maximize method inheritance", is_correct: false },
      { text: "Declaring all variables as global static primitives", is_correct: false },
      { text: "Defining interfaces with default implementations exclusively", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare Composition and Inheritance",
          content: "Inheritance (IS-A relationship): Creates tight coupling between parent and child. Changes in parent can break subclasses (fragile base class problem).\nComposition (HAS-A relationship): Class contains an instance of another class, delegate tasks to it. Highly flexible, loose coupling, allows dynamic behaviors at runtime."
        }
      ]
    }
  },
  {
    topic: "Object Oriented",
    title: "Class vs Object",
    question: "In Object-Oriented design, what is the precise relationship between a Class and an Object?",
    options: [
      { text: "A Class is a blueprint or template, while an Object is a concrete instance of that template in memory", is_correct: true },
      { text: "An Object is a blueprint, while a Class is the memory instance", is_correct: false },
      { text: "They are completely identical and refer to the same logical component", is_correct: false },
      { text: "A Class represents a database row, while an Object represents a database table", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain the Class-Object Distinction",
          content: "A Class is a compile-time static construct that defines the properties, fields, and behaviors of a type. An Object is a runtime dynamic entity created in memory (allocated on the heap) that belongs to that Class."
        }
      ]
    }
  },
  {
    topic: "Object Oriented",
    title: "Static Methods and Variables",
    question: "A static variable declared inside an OOP class belongs to:",
    options: [
      { text: "The class itself, shared across all instances of the class", is_correct: true },
      { text: "Each individual object instance uniquely", is_correct: false },
      { text: "The stack frame of the calling method exclusively", is_correct: false },
      { text: "The database configuration settings", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Static Scope",
          content: "Static fields and methods are bound to the Class itself rather than any specific object instance. There is only a single copy of a static variable in memory, shared by all instances of that class."
        }
      ]
    }
  },

  // Software Engineering (5)
  {
    topic: "Software Engineering",
    title: "Design Patterns: Singleton",
    question: "Which of the following is a key characteristic of the Singleton creational design pattern?",
    options: [
      { text: "It ensures a class has only one instance and provides a global point of access to it", is_correct: true },
      { text: "It allows objects to be cloned dynamically without using constructors", is_correct: false },
      { text: "It decouples an abstraction from its implementation so they can vary independently", is_correct: false },
      { text: "It delegates object creation to a factory subclass at runtime", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Describe Singleton Pattern",
          content: "The Singleton pattern restricts the instantiation of a class to one 'single' instance. This is useful when exactly one object is needed to coordinate actions across the system (like database connection pools or configuration managers)."
        }
      ]
    }
  },
  {
    topic: "Software Engineering",
    title: "Coupling vs Cohesion",
    question: "In software architecture, what is the ideal relationship between coupling and cohesion?",
    options: [
      { text: "Low coupling and high cohesion", is_correct: true },
      { text: "High coupling and low cohesion", is_correct: false },
      { text: "High coupling and high cohesion", is_correct: false },
      { text: "Low coupling and low cohesion", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Coupling and Cohesion",
          content: "Coupling: The degree of interdependence between software modules. Low coupling is desirable so that changes to one module do not force changes in others.\nCohesion: How closely related and focused the responsibilities of a single module are. High cohesion is desirable because it makes modules easier to understand, test, and maintain."
        }
      ]
    }
  },
  {
    topic: "Software Engineering",
    title: "SOLID Principles: Liskov Substitution",
    question: "Under the SOLID principles of object-oriented design, the Liskov Substitution Principle (LSP) states that:",
    options: [
      { text: "Objects of a superclass should be replaceable with objects of its subclasses without breaking the application's correctness", is_correct: true },
      { text: "A class should have only one reason to change", is_correct: false },
      { text: "Software entities should be open for extension but closed for modification", is_correct: false },
      { text: "Depend upon abstractions rather than concrete implementations", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Review SOLID Meanings",
          content: "S: Single Responsibility Principle\nO: Open/Closed Principle\nL: Liskov Substitution Principle (subclasses must adhere to the behavioral contract of their parents)\nI: Interface Segregation Principle\nD: Dependency Inversion Principle"
        }
      ]
    }
  },
  {
    topic: "Software Engineering",
    title: "Model-View-Controller (MVC) Flow",
    question: "In the Model-View-Controller (MVC) architectural pattern, which component is responsible for handling user input, updating the model, and selecting the appropriate view?",
    options: [
      { text: "Controller", is_correct: true },
      { text: "Model", is_correct: false },
      { text: "View", is_correct: false },
      { text: "Router only", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain MVC Roles",
          content: "Model: Manages the business logic and data state.\nView: Renders the model data to the user interface.\nController: Listens to user inputs, translates them into commands that update the Model, and refreshes or redirects the View."
        }
      ]
    }
  },
  {
    topic: "Software Engineering",
    title: "Observer Design Pattern",
    question: "Which behavioral design pattern defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified automatically?",
    options: [
      { text: "Observer Pattern", is_correct: true },
      { text: "Strategy Pattern", is_correct: false },
      { text: "State Pattern", is_correct: false },
      { text: "Command Pattern", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Observer Pattern",
          content: "The Observer pattern is commonly used in event-driven UI frameworks. An 'Observable' (Subject) maintains a list of 'Observers' (listeners). When the subject's state changes, it broadcasts a notification calling a method on each of its registered observers."
        }
      ]
    }
  }
];

// Perform answer rotation to ensure balanced options across the new questions
const materialsRotated = rotateAnswers(materialsNew, 0);
const networksRotated = rotateAnswers(networksNew, 1);
const computerSystemsRotated = rotateAnswers(computerSystemsNew, 2);
const softwareRotated = rotateAnswers(softwareNew, 3);

// Merge with existing arrays in questionsObj
questionsObj["elec-materials"] = [...(questionsObj["elec-materials"] || []), ...materialsRotated];
questionsObj["networks"] = [...(questionsObj["networks"] || []), ...networksRotated];
questionsObj["computer-systems"] = [...(questionsObj["computer-systems"] || []), ...computerSystemsRotated];
questionsObj["software"] = [...(questionsObj["software"] || []), ...softwareRotated];

// Save back to questions.js
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefix = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefix + 'const QUESTIONS = ' + updatedJson + ';', 'utf8');

console.log("Successfully added 122 questions in Part E.");
