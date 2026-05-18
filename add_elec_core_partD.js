const fs = require('fs');

let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS in questions.js");
  process.exit(1);
}

const questionsObj = JSON.parse(match[1]);

// 1. CONTROL SYSTEMS (+50 questions)
const controlSystemsNew = [
  // Block Diagrams (8 needed)
  {
    "topic": "Block Diagrams",
    "title": "Feedback System Transfer Function",
    "question": "A closed-loop control system has a forward path transfer function $G(s) = \\frac{10}{s+2}$ and a feedback path transfer function $H(s) = 2$. Calculate the closed-loop transfer function $T(s) = Y(s)/R(s)$ under negative feedback.",
    "options": [
      { "label": "A", "text": "\\frac{10}{s+22}", "is_correct": true },
      { "label": "B", "text": "\\frac{10}{s+4}", "is_correct": false },
      { "label": "C", "text": "\\frac{10}{s+2}", "is_correct": false },
      { "label": "D", "text": "\\frac{5}{s+11}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Closed-loop Formula",
          "content": "$T(s) = \\frac{G(s)}{1 + G(s)H(s)}$"
        },
        {
          "title": "Substitute Transfer Functions",
          "content": "$T(s) = \\frac{\\frac{10}{s+2}}{1 + \\frac{10}{s+2} \\cdot 2} = \\frac{\\frac{10}{s+2}}{1 + \\frac{20}{s+2}}$"
        },
        {
          "title": "Simplify Expression",
          "content": "$T(s) = \\frac{10}{(s+2) + 20} = \\frac{10}{s+22}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Block Diagrams",
    "title": "Mason's Gain Formula Sizing",
    "question": "A signal flow graph has a single forward path with gain $P_1 = G_1 G_2 G_3$ and a single feedback loop with loop gain $L_1 = -G_2 H_1$ that touches the forward path. Calculate the overall transfer function $T$ using Mason's Gain Formula.",
    "options": [
      { "label": "A", "text": "\\frac{G_1 G_2 G_3}{1 + G_2 H_1}", "is_correct": true },
      { "label": "B", "text": "\\frac{G_1 G_2 G_3}{1 - G_2 H_1}", "is_correct": false },
      { "label": "C", "text": "G_1 G_2 G_3(1 + G_2 H_1)", "is_correct": false },
      { "label": "D", "text": "\\frac{G_1 G_3}{1 + G_2 H_1}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Mason's Gain Formula",
          "content": "$T = \\frac{\\sum P_k \\Delta_k}{\\Delta}$"
        },
        {
          "title": "Calculate Determinants",
          "content": "Graph determinant: $\\Delta = 1 - L_1 = 1 - (-G_2 H_1) = 1 + G_2 H_1$.\nSince the loop touches path 1: $\\Delta_1 = 1$."
        },
        {
          "title": "Calculate Overall Transfer Function",
          "content": "$T = \\frac{P_1 \\Delta_1}{\\Delta} = \\frac{G_1 G_2 G_3}{1 + G_2 H_1}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Block Diagrams",
    "title": "Summing Junction Shift Rule",
    "question": "To shift a summing junction from the input side of a block $G(s)$ to the output side of that block, what operation must be applied to the signal entering the summing junction?",
    "options": [
      { "label": "A", "text": "Multiply the signal by G(s)", "is_correct": true },
      { "label": "B", "text": "Divide the signal by G(s)", "is_correct": false },
      { "label": "C", "text": "Add G(s) to the signal", "is_correct": false },
      { "label": "D", "text": "No change is required", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Block Diagram Equivalences",
          "content": "Before shifting: output is $Y(s) = G(s) [X(s) \\pm Z(s)] = G(s)X(s) \\pm G(s)Z(s)$.\nAfter shifting the summing junction after $G(s)$: $Y(s) = G(s)X(s) \\pm Z'(s)$.\nTo maintain equivalence: $Z'(s) = G(s)Z(s)$, which means we must multiply the shifted entry signal $Z(s)$ by $G(s)$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Block Diagrams",
    "title": "Take-off Point Shift Rule",
    "question": "To shift a take-off point from the input side of a block $G(s)$ to the output side of that block, what operation must be applied to the branched signal path?",
    "options": [
      { "label": "A", "text": "Divide the branched signal by G(s)", "is_correct": true },
      { "label": "B", "text": "Multiply the branched signal by G(s)", "is_correct": false },
      { "label": "C", "text": "Add 1/G(s) to the branched signal", "is_correct": false },
      { "label": "D", "text": "Subtract G(s) from the branched signal", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Take-off Equivalences",
          "content": "Before shifting: the branched signal is exactly $X(s)$ (the input to $G(s)$).\nAfter shifting the take-off point to the output side of $G(s)$, the branched signal is $Y(s) = G(s)X(s)$.\nTo restore the original signal value $X(s)$, the shifted branched path must be multiplied by $\\frac{1}{G(s)}$ (divided by $G(s)$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Block Diagrams",
    "title": "Cascade Blocks Transfer Function",
    "question": "Two non-interacting blocks with transfer functions $G_1(s) = \\frac{2}{s+1}$ and $G_2(s) = \\frac{s+1}{s+3}$ are connected in cascade. Calculate the total equivalent transfer function $G(s)$.",
    "options": [
      { "label": "A", "text": "\\frac{2}{s+3}", "is_correct": true },
      { "label": "B", "text": "\\frac{2(s+1)}{(s+1)(s+3)}", "is_correct": false },
      { "label": "C", "text": "\\frac{s+3}{s+1}", "is_correct": false },
      { "label": "D", "text": "\\frac{3}{s+4}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Cascade Product Rule",
          "content": "For cascaded non-interacting blocks: $G(s) = G_1(s) \\cdot G_2(s)$."
        },
        {
          "title": "Multiply and Simplify",
          "content": "$G(s) = \\frac{2}{s+1} \\cdot \\frac{s+1}{s+3} = \\frac{2(s+1)}{(s+1)(s+3)} = \\frac{2}{s+3}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Block Diagrams",
    "title": "Parallel Blocks Transfer Function",
    "question": "Two blocks with transfer functions $G_1(s) = \\frac{1}{s}$ and $G_2(s) = 2$ are connected in parallel, with their outputs added together. What is the total equivalent transfer function $G(s)$?",
    "options": [
      { "label": "A", "text": "\\frac{2s+1}{s}", "is_correct": true },
      { "label": "B", "text": "\\frac{2}{s}", "is_correct": false },
      { "label": "C", "text": "\\frac{1}{2s}", "is_correct": false },
      { "label": "D", "text": "\\frac{s+2}{s}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Parallel Additive Rule",
          "content": "For parallel blocks whose outputs are added: $G(s) = G_1(s) + G_2(s)$."
        },
        {
          "title": "Sum and Simplify",
          "content": "$G(s) = \\frac{1}{s} + 2 = \\frac{1 + 2s}{s} = \\frac{2s+1}{s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Block Diagrams",
    "title": "Unity Feedback Loop Error Transfer Function",
    "question": "In a unity feedback system ($H(s) = 1$) with forward path $G(s)$, what is the transfer function $E(s)/R(s)$ from the input reference to the error signal?",
    "options": [
      { "label": "A", "text": "\\frac{1}{1 + G(s)}", "is_correct": true },
      { "label": "B", "text": "\\frac{G(s)}{1 + G(s)}", "is_correct": false },
      { "label": "C", "text": "1 - G(s)", "is_correct": false },
      { "label": "D", "text": "\\frac{1}{G(s)}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Error Definition",
          "content": "$E(s) = R(s) - Y(s)$, and $Y(s) = G(s) E(s)$."
        },
        {
          "title": "Solve for Error Ratio",
          "content": "$E(s) = R(s) - G(s) E(s) \\implies E(s)[1 + G(s)] = R(s) \\implies \\frac{E(s)}{R(s)} = \\frac{1}{1 + G(s)}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Block Diagrams",
    "title": "Positive Feedback Loop Sizing",
    "question": "A closed-loop system operates under positive feedback with $G(s) = \\frac{K}{s}$ and $H(s) = 2$. What is the closed-loop transfer function $T(s)$?",
    "options": [
      { "label": "A", "text": "\\frac{K}{s - 2K}", "is_correct": true },
      { "label": "B", "text": "\\frac{K}{s + 2K}", "is_correct": false },
      { "label": "C", "text": "\\frac{K}{s - K}", "is_correct": false },
      { "label": "D", "text": "\\frac{2K}{s}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Positive Feedback Formula",
          "content": "$T(s) = \\frac{G(s)}{1 - G(s)H(s)}$"
        },
        {
          "title": "Substitute and Simplify",
          "content": "$T(s) = \\frac{\\frac{K}{s}}{1 - \\frac{K}{s} \\cdot 2} = \\frac{K}{s - 2K}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Stability (5 needed)
  {
    "topic": "Stability",
    "title": "Routh-Hurwitz Stability Sizing",
    "question": "A system has a characteristic equation given by $q(s) = s^3 + 2s^2 + 4s + K = 0$. Determine the range of the feedback gain $K$ for which the system is steady-state stable.",
    "options": [
      { "label": "A", "text": "0 < K < 8", "is_correct": true },
      { "label": "B", "text": "K > 0", "is_correct": false },
      { "label": "C", "text": "K < 8", "is_correct": false },
      { "label": "D", "text": "0 < K < 4", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Construct Routh Array",
          "content": "Row $s^3$: 1, 4\nRow $s^2$: 2, K\nRow $s^1$: $\\frac{2(4) - 1(K)}{2} = \\frac{8 - K}{2}$\nRow $s^0$: K."
        },
        {
          "title": "Apply First Column Signs Rule",
          "content": "For stability, all terms in the first column must be strictly positive:\n1. $K > 0$\n2. $\\frac{8 - K}{2} > 0 \\implies 8 - K > 0 \\implies K < 8$."
        },
        {
          "title": "Determine Combined Range",
          "content": "$0 < K < 8$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Stability",
    "title": "Nyquist Stability Criterion",
    "question": "According to the Nyquist Stability Criterion, if the open-loop transfer function $G(s)H(s)$ has $P = 2$ poles in the right-half s-plane (unstable open-loop), what number of counter-clockwise encirclements ($N$) of the critical point $-1 + j0$ must the Nyquist plot make for the closed-loop system to be stable?",
    "options": [
      { "label": "A", "text": "N = 2 counter-clockwise encirclements", "is_correct": true },
      { "label": "B", "text": "N = 0 encirclements", "is_correct": false },
      { "label": "C", "text": "N = 2 clockwise encirclements", "is_correct": false },
      { "label": "D", "text": "N = 1 counter-clockwise encirclement", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Nyquist Stability Formula",
          "content": "$Z = P - N$, where $Z$ is the number of unstable closed-loop poles, $P$ is the number of unstable open-loop poles, and $N$ is the number of counter-clockwise encirclements of the $-1$ point."
        },
        {
          "title": "Solve for Stable Condition",
          "content": "For closed-loop stability, we must have $Z = 0$ unstable poles.\n$0 = P - N \\implies N = P = 2$ counter-clockwise encirclements."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Stability",
    "title": "Bode Plot Gain Margin",
    "question": "On a Bode plot, the frequency at which the open-loop phase angle reaches exactly -180 degrees is called the phase crossover frequency ($\\omega_{pc}$). If the open-loop magnitude gain at $\\omega_{pc}$ is measured to be $-12\\text{ dB}$, what is the Gain Margin ($GM$)?",
    "options": [
      { "label": "A", "text": "+12 dB (stable)", "is_correct": true },
      { "label": "B", "text": "-12 dB (unstable)", "is_correct": false },
      { "label": "C", "text": "+6 dB (stable)", "is_correct": false },
      { "label": "D", "text": "0 dB (marginally stable)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Define Gain Margin on Bode Plot",
          "content": "The Gain Margin is defined as the negative of the open-loop magnitude (in dB) at the phase crossover frequency: $GM = -|G(j\\omega_{pc})|_{dB}$."
        },
        {
          "title": "Calculate Value",
          "content": "$GM = -(-12\\text{ dB}) = +12\\text{ dB}$. Since the gain margin is positive (and phase margin is likewise positive), the closed-loop system is stable."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Stability",
    "title": "Bode Plot Phase Margin",
    "question": "At the gain crossover frequency $\\omega_{gc}$ (where the open-loop gain is exactly $0\\text{ dB}$ or $1.0$), the open-loop phase is measured to be $\\theta = -135^\\circ$. Calculate the Phase Margin ($PM$) of the system.",
    "options": [
      { "label": "A", "text": "45 degrees", "is_correct": true },
      { "label": "B", "text": "-45 degrees", "is_correct": false },
      { "label": "C", "text": "135 degrees", "is_correct": false },
      { "label": "D", "text": "90 degrees", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Phase Margin Formula",
          "content": "$PM = 180^\circ + \\theta_{gc}$"
        },
        {
          "title": "Calculate Phase Margin",
          "content": "$PM = 180^\circ + (-135^\circ) = 45^\circ$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Stability",
    "title": "Right-Half s-Plane Roots",
    "question": "If a transfer function has poles located at $s_1 = -2 + j3$, $s_2 = -2 - j3$, and $s_3 = +1.0$, what is the stability state of the unforced system?",
    "options": [
      { "label": "A", "text": "Unstable", "is_correct": true },
      { "label": "B", "text": "Stable", "is_correct": false },
      { "label": "C", "text": "Marginally Stable", "is_correct": false },
      { "label": "D", "text": "Underdamped Oscillation Stable", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Pole Real Parts",
          "content": "For a system to be bounded-input bounded-output (BIBO) stable, all poles of the transfer function must lie strictly in the left-half of the complex s-plane (real parts must be strictly negative)."
        },
        {
          "title": "Check Pole Locations",
          "content": "Pole $s_3 = +1.0$ has a positive real part ($+1.0 > 0$), which causes an exponentially growing term $e^{t}$ in the unforced time response. Thus, the system is unstable."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Time Response (7 needed)
  {
    "topic": "Time Response",
    "title": "Second-Order System Damping Ratio Sizing",
    "question": "A second-order control system has a characteristic equation $s^2 + 8s + 25 = 0$. Calculate the natural frequency ($\\omega_n$) and damping ratio ($\\zeta$).",
    "options": [
      { "label": "A", "text": "\\omega_n = 5 rad/s, \\zeta = 0.8", "is_correct": true },
      { "label": "B", "text": "\\omega_n = 25 rad/s, \\zeta = 0.16", "is_correct": false },
      { "label": "C", "text": "\\omega_n = 5 rad/s, \\zeta = 0.4", "is_correct": false },
      { "label": "D", "text": "\\omega_n = 5 rad/s, \\zeta = 1.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Second-Order Standard Form",
          "content": "$s^2 + 2\\zeta\\omega_n s + \\omega_n^2 = 0$"
        },
        {
          "title": "Solve for Natural Frequency",
          "content": "$\\omega_n^2 = 25 \\implies \\omega_n = 5.0\\text{ rad/s}$."
        },
        {
          "title": "Solve for Damping Ratio",
          "content": "$2\\zeta\\omega_n = 8 \\implies 2\\zeta(5) = 8 \\implies 10\\zeta = 8 \\implies \\zeta = 0.8$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Time Response",
    "title": "Second-Order Peak Overshoot Sizing",
    "question": "For the second-order system in the previous question ($\\omega_n = 5\\text{ rad/s}$, $\\zeta = 0.8$), calculate the percentage peak overshoot ($M_p\\%$) to a unit step input.",
    "options": [
      { "label": "A", "text": "1.5%", "is_correct": true },
      { "label": "B", "text": "9.5%", "is_correct": false },
      { "label": "C", "text": "16.3%", "is_correct": false },
      { "label": "D", "text": "5.0%", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Peak Overshoot Formula",
          "content": "$M_p = e^{-\\frac{\\pi\\zeta}{\\sqrt{1-\\zeta^2}}}$"
        },
        {
          "title": "Substitute and Calculate Exponent",
          "content": "$\\frac{\\pi \\times 0.8}{\\sqrt{1-0.8^2}} = \\frac{0.8\\pi}{\\sqrt{0.36}} = \\frac{0.8\\pi}{0.6} = 1.333\\pi \\approx 4.1888$."
        },
        {
          "title": "Calculate Percentage Value",
          "content": "$M_p = e^{-4.1888} \\approx 0.0152 = 1.52\\%$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Time Response",
    "title": "Settling Time 2% Criterion",
    "question": "For a second-order underdamped system with $\\omega_n = 10\\text{ rad/s}$ and $\\zeta = 0.5$, calculate the $2\\%$ settling time ($t_s$).",
    "options": [
      { "label": "A", "text": "0.80 s", "is_correct": true },
      { "label": "B", "text": "0.60 s", "is_correct": false },
      { "label": "C", "text": "0.40 s", "is_correct": false },
      { "label": "D", "text": "1.00 s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify 2% Settling Time Formula",
          "content": "For the $2\\%$ criterion: $t_s = \\frac{4}{\\zeta\\omega_n}$"
        },
        {
          "title": "Calculate Settling Time",
          "content": "$t_s = \\frac{4}{0.5 \\times 10} = \\frac{4}{5} = 0.80\\text{ seconds}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Time Response",
    "title": "Steady State Error for Unit Step Input",
    "question": "A unity feedback system has a forward path transfer function $G(s) = \\frac{10}{s(s+2)}$. Calculate the steady-state error ($e_{ss}$) of the closed-loop system for a unit step input.",
    "options": [
      { "label": "A", "text": "0.0", "is_correct": true },
      { "label": "B", "text": "0.2", "is_correct": false },
      { "label": "C", "text": "0.1", "is_correct": false },
      { "label": "D", "text": "Infinity", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify System Type",
          "content": "The open-loop $G(s)$ has one pole at the origin ($s^1$), making it a **Type 1** system."
        },
        {
          "title": "Calculate Position Error Constant",
          "content": "$K_p = \\lim_{s \\to 0} G(s) = \\lim_{s \\to 0} \\frac{10}{s(s+2)} = \\infty$."
        },
        {
          "title": "Calculate Steady-State Error",
          "content": "$e_{ss} = \\frac{1}{1 + K_p} = \\frac{1}{1 + \\infty} = 0$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Time Response",
    "title": "Steady State Error for Unit Ramp Input",
    "question": "For the system in the previous question ($G(s) = \\frac{10}{s(s+2)}$, Type 1), calculate the steady-state error ($e_{ss}$) to a unit ramp input.",
    "options": [
      { "label": "A", "text": "0.20", "is_correct": true },
      { "label": "B", "text": "0.10", "is_correct": false },
      { "label": "C", "text": "0.00", "is_correct": false },
      { "label": "D", "text": "5.00", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Velocity Error Constant Formula",
          "content": "$K_v = \\lim_{s \\to 0} s G(s)$"
        },
        {
          "title": "Calculate Kv",
          "content": "$K_v = \\lim_{s \\to 0} s \\left(\\frac{10}{s(s+2)}\\right) = \\lim_{s \\to 0} \\frac{10}{s+2} = \\frac{10}{2} = 5.0\\text{ s}^{-1}$."
        },
        {
          "title": "Calculate Steady-state Error",
          "content": "$e_{ss} = \\frac{1}{K_v} = \\frac{1}{5.0} = 0.20$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Time Response",
    "title": "Final Value Theorem Application Sizing",
    "question": "A system output is given in the Laplace domain by $Y(s) = \\frac{2s + 3}{s(s^2 + 3s + 2)}$. Calculate the steady-state value of the output $y(\\infty)$ using the Final Value Theorem.",
    "options": [
      { "label": "A", "text": "1.5", "is_correct": true },
      { "label": "B", "text": "3.0", "is_correct": false },
      { "label": "C", "text": "0.0", "is_correct": false },
      { "label": "D", "text": "2.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Final Value Theorem",
          "content": "$y(\\infty) = \\lim_{s \\to 0} s Y(s)$, provided all poles of $sY(s)$ lie in the left-half s-plane."
        },
        {
          "title": "Apply Theorem",
          "content": "$y(\\infty) = \\lim_{s \\to 0} s \\left(\\frac{2s+3}{s(s^2 + 3s + 2)}\\right) = \\lim_{s \\to 0} \\frac{2s+3}{s^2 + 3s + 2}$."
        },
        {
          "title": "Solve Limit",
          "content": "$y(\\infty) = \\frac{2(0) + 3}{0^2 + 3(0) + 2} = \\frac{3}{2} = 1.5$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Time Response",
    "title": "First-Order Time Constant and Rise Time Relation",
    "question": "A first-order system has a transfer function $G(s) = \\frac{1}{\\tau s + 1}$. What is the $10\\%$ to $90\\%$ rise time ($t_r$) of the step response in terms of the time constant $\\tau$?",
    "options": [
      { "label": "A", "text": "2.20 \\tau", "is_correct": true },
      { "label": "B", "text": "1.00 \\tau", "is_correct": false },
      { "label": "C", "text": "3.00 \\tau", "is_correct": false },
      { "label": "D", "text": "0.69 \\tau", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Step Response Equation",
          "content": "$y(t) = 1 - e^{-t/\\tau}$"
        },
        {
          "title": "Find 10% and 90% Times",
          "content": "- $1 - e^{-t_1/\\tau} = 0.10 \\implies e^{-t_1/\\tau} = 0.90 \\implies t_1 = -\\tau \\ln(0.90) \\approx 0.105\\tau$.\n- $1 - e^{-t_2/\\tau} = 0.90 \\implies e^{-t_2/\\tau} = 0.10 \\implies t_2 = -\\tau \\ln(0.10) \\approx 2.303\\tau$."
        },
        {
          "title": "Calculate Rise Time Difference",
          "content": "$t_r = t_2 - t_1 = 2.303\\tau - 0.105\\tau = 2.198\\tau \\approx 2.20\\tau$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Compensators (8 needed)
  {
    "topic": "Compensators",
    "title": "Phase Lead Compensator Pole-Zero Layout",
    "question": "A phase lead compensator has a transfer function $D(s) = \\frac{s+z}{s+p}$. What is the required relationship between the pole $p$ and zero $z$ location?",
    "options": [
      { "label": "A", "text": "z < p", "is_correct": true },
      { "label": "B", "text": "z > p", "is_correct": false },
      { "label": "C", "text": "z = p", "is_correct": false },
      { "label": "D", "text": "p is negative; z is positive", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Phase Lead Layout",
          "content": "A lead compensator provides positive (lead) phase shift. For a lead network, the zero must be closer to the origin than the pole: $z < p$ (for example, $D(s) = \\frac{s+2}{s+10}$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Compensators",
    "title": "Phase Lag Compensator Pole-Zero Layout",
    "question": "A phase lag compensator has a transfer function $D(s) = \\frac{s+z}{s+p}$. What is the required relationship between the pole $p$ and zero $z$ location?",
    "options": [
      { "label": "A", "text": "p < z", "is_correct": true },
      { "label": "B", "text": "p > z", "is_correct": false },
      { "label": "C", "text": "p = z", "is_correct": false },
      { "label": "D", "text": "p and z are complex conjugates", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Phase Lag Layout",
          "content": "A lag compensator provides attenuation at high frequencies to improve steady-state error. For a lag network, the pole must be closer to the origin than the zero: $p < z$ (for example, $D(s) = \\frac{s+0.1}{s+0.01}$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Compensators",
    "title": "Lead Compensator Maximum Phase Angle",
    "question": "A lead compensator has $D(s) = \\frac{s+2}{s+8}$. Calculate the frequency ($\\omega_{max}$) at which the maximum phase lead angle occurs.",
    "options": [
      { "label": "A", "text": "4.00 rad/s", "is_correct": true },
      { "label": "B", "text": "5.00 rad/s", "is_correct": false },
      { "label": "C", "text": "2.00 rad/s", "is_correct": false },
      { "label": "D", "text": "3.16 rad/s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Maximum Phase Frequency Formula",
          "content": "The maximum phase shift frequency is the geometric mean of the pole and zero frequencies: $\\omega_{max} = \\sqrt{z \\cdot p}$"
        },
        {
          "title": "Calculate Frequency",
          "content": "$\\omega_{max} = \\sqrt{2 \\times 8} = \\sqrt{16} = 4.00\\text{ rad/s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Compensators",
    "title": "Phase Lead Compensator Maximum Phase Value",
    "question": "For the same lead compensator ($z = 2$, $p = 8$), calculate the maximum phase shift angle ($\\phi_{max}$) introduced by the network.",
    "options": [
      { "label": "A", "text": "36.87 degrees", "is_correct": true },
      { "label": "B", "text": "53.13 degrees", "is_correct": false },
      { "label": "C", "text": "30.00 degrees", "is_correct": false },
      { "label": "D", "text": "45.00 degrees", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Sine of Maximum Phase Formula",
          "content": "$\\sin(\\phi_{max}) = \\frac{p - z}{p + z}$"
        },
        {
          "title": "Calculate Sine Value",
          "content": "$\\sin(\\phi_{max}) = \\frac{8 - 2}{8 + 2} = \\frac{6}{10} = 0.60$."
        },
        {
          "title": "Calculate Angle",
          "content": "$\\phi_{max} = \\sin^{-1}(0.60) \\approx 36.87^\\circ$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Compensators",
    "title": "Lead vs Lag Compensation Impact",
    "question": "What is the primary design purpose of adding a phase lead compensator to a feedback loop compared to a phase lag compensator?",
    "options": [
      { "label": "A", "text": "Lead increases bandwidth and stability; lag reduces steady-state error", "is_correct": true },
      { "label": "B", "text": "Lead reduces overshoot; lag increases speed of response", "is_correct": false },
      { "label": "C", "text": "Lead reduces steady-state error; lag increases gain crossover frequency", "is_correct": false },
      { "label": "D", "text": "Both compensators have identical frequency domain effects", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Compare Compensator Roles",
          "content": "- Lead Compensation: Adds positive phase near the crossover frequency. This increases the phase margin (stability) and increases $\\omega_{gc}$ (faster response/wider bandwidth).\n- Lag Compensation: Introduces high attenuation at high frequencies, allowing for higher low-frequency loop gain, which directly reduces steady-state error without degrading high-frequency stability."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Compensators",
    "title": "Lag-Lead Compensator Transfer Function Layout",
    "question": "A lag-lead compensator consists of two stages cascaded. Where must the poles and zeros be arranged relative to each other starting from the origin?",
    "options": [
      { "label": "A", "text": "Lag pole is closest to origin, followed by lag zero, then lead zero, and lead pole is furthest", "is_correct": true },
      { "label": "B", "text": "Lead pole is closest to origin, followed by lag zero", "is_correct": false },
      { "label": "C", "text": "Both poles are closer to the origin than both zeros", "is_correct": false },
      { "label": "D", "text": "Lag zero is at the origin", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Lag-Lead Layout",
          "content": "For a lag-lead network:\n1. Lag portion requires: $p_{lag} < z_{lag}$\n2. Lead portion requires: $z_{lead} < p_{lead}$\nUsually, to decouple frequency bands, the order from the origin along the negative real axis is: $p_{lag} < z_{lag} < z_{lead} < p_{lead}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Compensators",
    "title": "Active vs Passive Compensation Networks",
    "question": "What is the primary advantage of using an active operational-amplifier based compensator over a passive RC network?",
    "options": [
      { "label": "A", "text": "It provides adjustable gain without loading effects or attenuation losses", "is_correct": true },
      { "label": "B", "text": "It requires no external electrical power supply", "is_correct": false },
      { "label": "C", "text": "It is completely immune to high-frequency noise", "is_correct": false },
      { "label": "D", "text": "It uses fewer capacitors than passive layouts", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Active Compensation Benefits",
          "content": "Passive networks introduce attenuation (loss of loop gain) and are sensitive to the impedances of connected stages (loading). Active (op-amp) compensators isolate input and output, can provide voltage gain ($>1.0$), and prevent loading."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Compensators",
    "title": "Lead Compensator S-Plane Pole Shift",
    "question": "When a lead compensator is added to a system, how does it affect the root locus of the closed-loop system?",
    "options": [
      { "label": "A", "text": "It bends the root locus branches toward the left, increasing damping and stability", "is_correct": true },
      { "label": "B", "text": "It pulls the branches to the right, causing earlier instability", "is_correct": false },
      { "label": "C", "text": "It creates purely imaginary loops centered on the origin", "is_correct": false },
      { "label": "D", "text": "It has no impact on the shapes of the locus branches", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Root Locus Modification",
          "content": "A lead compensator adds a dominant zero closer to the origin than its corresponding pole. Because zeros attract root locus branches, the branches are pulled to the left (further into the stable left-half plane), yielding higher damping ratios and faster decay times."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Controllers (7 needed)
  {
    "topic": "Controllers",
    "title": "PID Controller Transfer Function",
    "question": "A proportional-integral-derivative (PID) controller is described by the transfer function $G_c(s) = 5 + \\frac{2}{s} + 0.1s$. Identify the values of proportional gain ($K_p$), integral time constant ($T_i$), and derivative time constant ($T_d$) using standard form $K_p (1 + \\frac{1}{T_i s} + T_d s)$.",
    "options": [
      { "label": "A", "text": "K_p = 5, T_i = 2.5 s, T_d = 0.02 s", "is_correct": true },
      { "label": "B", "text": "K_p = 5, T_i = 2.0 s, T_d = 0.10 s", "is_correct": false },
      { "label": "C", "text": "K_p = 5, T_i = 0.4 s, T_d = 0.02 s", "is_correct": false },
      { "label": "D", "text": "K_p = 1, T_i = 5.0 s, T_d = 0.10 s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Factor out Kp",
          "content": "$G_c(s) = 5 \\left(1 + \\frac{2/5}{s} + \\frac{0.1}{5} s\\right) = 5 \\left(1 + \\frac{0.4}{s} + 0.02 s\\right)$"
        },
        {
          "title": "Identify Constants",
          "content": "- Proportional Gain: $K_p = 5$.\n- Integral term: $\\frac{1}{T_i} = 0.4 \\implies T_i = \\frac{1}{0.4} = 2.5\\text{ seconds}$.\n- Derivative term: $T_d = 0.02\\text{ seconds}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Controllers",
    "title": "Integral Control Steady State Error Impact",
    "question": "What is the primary effect of incorporating an Integral (I) term into a proportional feedback controller?",
    "options": [
      { "label": "A", "text": "It increases the system type, eliminating steady-state offset error for step inputs", "is_correct": true },
      { "label": "B", "text": "It dramatically improves transient damping and stability margin", "is_correct": false },
      { "label": "C", "text": "It decreases the settling time, speeding up the transient response", "is_correct": false },
      { "label": "D", "text": "It reduces the loop gain at extremely low frequencies", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Integral Action",
          "content": "An integral controller acts as an accumulator of error over time. Mathematically, it adds a pole at the origin ($s = 0$), which increases the System Type by 1, thereby eliminating steady-state tracking error for step references."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Controllers",
    "title": "Derivative Control Transient Impact",
    "question": "What is the primary physical effect of incorporating a Derivative (D) term into a proportional-integral controller?",
    "options": [
      { "label": "A", "text": "It acts as an anticipatory term, improving transient damping and stability", "is_correct": true },
      { "label": "B", "text": "It completely eliminates steady-state offset error for ramp inputs", "is_correct": false },
      { "label": "C", "text": "It filters out high-frequency sensor noise from the error loop", "is_correct": false },
      { "label": "D", "text": "It has no impact on overshoot or rise time", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Derivative Action",
          "content": "The derivative term is proportional to the rate of change of error: $u_d(t) = K_d \\frac{de(t)}{dt}$. It senses the slope of the error curve, anticipating future error values to apply 'braking' action. This reduces overshoot and settling time."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Controllers",
    "title": "Proportional Control Offset Error",
    "question": "A first-order plant $G(s) = \\frac{1}{s+1}$ is controlled by a purely Proportional (P) controller with gain $K_p = 9$ in a unity negative feedback loop. Calculate the steady-state offset error ($e_{ss}$) to a unit step input.",
    "options": [
      { "label": "A", "text": "0.10", "is_correct": true },
      { "label": "B", "text": "0.00", "is_correct": false },
      { "label": "C", "text": "0.90", "is_correct": false },
      { "label": "D", "text": "0.50", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Open-loop Gain",
          "content": "$G_{ol}(s) = K_p G(s) = \\frac{9}{s+1}$."
        },
        {
          "title": "Calculate Position Error Constant",
          "content": "$K_p = \\lim_{s \\to 0} G_{ol}(s) = \\frac{9}{0+1} = 9.0$."
        },
        {
          "title": "Calculate Steady-state Error",
          "content": "$e_{ss} = \\frac{1}{1 + K_p} = \\frac{1}{1 + 9.0} = 0.10$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Controllers",
    "title": "Ziegler-Nichols Tuning Method",
    "question": "In the Ziegler-Nichols closed-loop tuning method, a system is tuned by raising proportional gain until constant-amplitude oscillations are observed. If the critical gain is $K_{cr} = 10$ and the oscillation period is $P_{cr} = 2.0\\text{ s}$, calculate the Ziegler-Nichols tuned proportional gain ($K_p$) for a purely Proportional (P) controller.",
    "options": [
      { "label": "A", "text": "5.0", "is_correct": true },
      { "label": "B", "text": "6.0", "is_correct": false },
      { "label": "C", "text": "4.5", "is_correct": false },
      { "label": "D", "text": "2.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Ziegler-Nichols P-Controller Tuning Rule",
          "content": "For a P-controller: $K_p = 0.50 K_{cr}$."
        },
        {
          "title": "Calculate Gain",
          "content": "$K_p = 0.50 \\times 10 = 5.0$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Controllers",
    "title": "PI Controller Poles and Zeros",
    "question": "A PI controller has the transfer function $G_c(s) = K_p + \\frac{K_i}{s}$. In the complex s-plane, what are the pole and zero locations of this controller?",
    "options": [
      { "label": "A", "text": "Pole at s = 0, zero at s = -K_i/K_p", "is_correct": true },
      { "label": "B", "text": "Pole at s = -K_p, zero at s = 0", "is_correct": false },
      { "label": "C", "text": "Pole at s = 0, zero at s = -K_p/K_i", "is_correct": false },
      { "label": "D", "text": "Pole at s = 0, no zero exists", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Rewrite PI Controller Transfer Function",
          "content": "$G_c(s) = \\frac{K_p s + K_i}{s} = K_p \\frac{s + K_i/K_p}{s}$"
        },
        {
          "title": "Identify Poles and Zeros",
          "content": "- Denominator: $s = 0 \\implies$ Pole at the origin.\n- Numerator: $s + K_i/K_p = 0 \\implies$ Zero at $s = -\\frac{K_i}{K_p}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Controllers",
    "title": "PD Controller Transfer Function Layout",
    "question": "A Proportional-Derivative (PD) controller has the transfer function $G_c(s) = K_p + K_d s$. What high-frequency signal issue must be addressed when implementing a PD controller practically?",
    "options": [
      { "label": "A", "text": "Derivative action amplifies high-frequency sensor noise, requiring a series low-pass filter", "is_correct": true },
      { "label": "B", "text": "The controller becomes unstable at extremely low frequencies", "is_correct": false },
      { "label": "C", "text": "The proportional term causes integral saturation windup", "is_correct": false },
      { "label": "D", "text": "The controller acts as a narrow-band resonant notch filter", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze High-frequency Derivative Gain",
          "content": "The derivative gain is proportional to frequency ($|j\\omega K_d| = \\omega K_d$). As $\\omega \\to \\infty$, the gain grows without bound, which severely amplifies any high-frequency sensor noise, saturating actuators. Practically, a high-frequency pole is added to filter this noise: $G_c(s) = K_p + \\frac{K_d s}{1 + \\tau_f s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // State-Space (8 needed)
  {
    "topic": "State-Space",
    "title": "State-Space State Equation Sizing",
    "question": "A system is modeled by the state equation $\\dot{\\mathbf{x}} = \\mathbf{A}\\mathbf{x} + \\mathbf{B}\\mathbf{u}$, where $\\mathbf{A} = \\begin{bmatrix} 0 & 1 \\\\ -6 & -5 \\end{bmatrix}$. Calculate the eigenvalues of the system matrix $\\mathbf{A}$.",
    "options": [
      { "label": "A", "text": "-2, -3", "is_correct": true },
      { "label": "B", "text": "2, 3", "is_correct": false },
      { "label": "C", "text": "0, -5", "is_correct": false },
      { "label": "D", "text": "-1, -6", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Set Up Characteristic Equation",
          "content": "$\\det(s\\mathbf{I} - \\mathbf{A}) = 0$"
        },
        {
          "title": "Evaluate Matrix Determinant",
          "content": "$s\\mathbf{I} - \\mathbf{A} = \\begin{bmatrix} s & 0 \\\\ 0 & s \\end{bmatrix} - \\begin{bmatrix} 0 & 1 \\\\ -6 & -5 \\end{bmatrix} = \\begin{bmatrix} s & -1 \\\\ 6 & s+5 \\end{bmatrix}$"
        },
        {
          "title": "Solve Polynomial Roots",
          "content": "$\\det = s(s+5) - (-1)(6) = s^2 + 5s + 6 = 0$\n$(s+2)(s+3) = 0 \\implies s_1 = -2, s_2 = -3$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "State-Space",
    "title": "State Transition Matrix Calculation",
    "question": "For the system matrix $\\mathbf{A} = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0 \\end{bmatrix}$, calculate the state transition matrix $\\mathbf{\\Phi}(t) = e^{\\mathbf{A}t}$.",
    "options": [
      { "label": "A", "text": "\\begin{bmatrix} 1 & t \\\\ 0 & 1 \\end{bmatrix}", "is_correct": true },
      { "label": "B", "text": "\\begin{bmatrix} e^t & t \\\\ 0 & e^t \\end{bmatrix}", "is_correct": false },
      { "label": "C", "text": "\\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}", "is_correct": false },
      { "label": "D", "text": "\\begin{bmatrix} 0 & e^t \\\\ e^t & 0 \\end{bmatrix}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Matrix Exponential Series Definition",
          "content": "$e^{\\mathbf{A}t} = \\mathbf{I} + \\mathbf{A}t + \\frac{\\mathbf{A}^2 t^2}{2!} + \\dots$"
        },
        {
          "title": "Calculate Powers of A",
          "content": "$\\mathbf{A}^2 = \\begin{bmatrix} 0 & 1 \\\\ 0 & 0 \\end{bmatrix} \\begin{bmatrix} 0 & 1 \\\\ 0 & 0 \\end{bmatrix} = \\begin{bmatrix} 0 & 0 \\\\ 0 & 0 \\end{bmatrix}$."
        },
        {
          "title": "Sum the Non-zero Terms",
          "content": "$e^{\\mathbf{A}t} = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix} + \\begin{bmatrix} 0 & t \\\\ 0 & 0 \\end{bmatrix} = \\begin{bmatrix} 1 & t \\\\ 0 & 1 \\end{bmatrix}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "State-Space",
    "title": "Controllability Matrix Verification",
    "question": "A state-space system has matrices $\\mathbf{A} = \\begin{bmatrix} -1 & 0 \\\\ 0 & -2 \\end{bmatrix}$ and $\\mathbf{B} = \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix}$. Construct the Controllability Matrix ($\\mathbf{M}_c$) and verify its rank.",
    "options": [
      { "label": "A", "text": "\\mathbf{M}_c = \\begin{bmatrix} 1 & -1 \\\\ 1 & -2 \\end{bmatrix}, Rank = 2 (controllable)", "is_correct": true },
      { "label": "B", "text": "\\mathbf{M}_c = \\begin{bmatrix} 1 & 0 \\\\ 0 & 1 \\end{bmatrix}, Rank = 2 (controllable)", "is_correct": false },
      { "label": "C", "text": "\\mathbf{M}_c = \\begin{bmatrix} 1 & -1 \\\\ 1 & -1 \\end{bmatrix}, Rank = 1 (uncontrollable)", "is_correct": false },
      { "label": "D", "text": "\\mathbf{M}_c = \\begin{bmatrix} -1 & 1 \\\\ -2 & 1 \\end{bmatrix}, Rank = 2 (controllable)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Controllability Matrix Formula",
          "content": "For a 2nd-order system: $\\mathbf{M}_c = \\begin{bmatrix} \\mathbf{B} & \\mathbf{A}\\mathbf{B} \\end{bmatrix}$"
        },
        {
          "title": "Calculate AB",
          "content": "$\\mathbf{A}\\mathbf{B} = \\begin{bmatrix} -1 & 0 \\\\ 0 & -2 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} -1 \\\\ -2 \\end{bmatrix}$."
        },
        {
          "title": "Assemble and Check Determinant",
          "content": "$\\mathbf{M}_c = \\begin{bmatrix} 1 & -1 \\\\ 1 & -2 \\end{bmatrix}$.\n$\\det(\\mathbf{M}_c) = 1(-2) - 1(-1) = -2 + 1 = -1 \\ne 0$.\nSince the determinant is non-zero, the rank is 2 (full rank), and the system is controllable."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "State-Space",
    "title": "Observability Matrix Verification",
    "question": "A system has matrices $\\mathbf{A} = \\begin{bmatrix} -1 & 0 \\\\ 0 & -2 \\end{bmatrix}$ and output matrix $\\mathbf{C} = \\begin{bmatrix} 1 & 0 \\end{bmatrix}$. What is the Observability Matrix ($\\mathbf{M}_o$) and is the system observable?",
    "options": [
      { "label": "A", "text": "\\mathbf{M}_o = \\begin{bmatrix} 1 & 0 \\\\ -1 & 0 \\end{bmatrix}, Rank = 1 (unobservable)", "is_correct": true },
      { "label": "B", "text": "\\mathbf{M}_o = \\begin{bmatrix} 1 & 0 \\\\ 0 & -2 \\end{bmatrix}, Rank = 2 (observable)", "is_correct": false },
      { "label": "C", "text": "\\mathbf{M}_o = \\begin{bmatrix} 1 & 0 \\\\ 1 & 1 \\end{bmatrix}, Rank = 2 (observable)", "is_correct": false },
      { "label": "D", "text": "\\mathbf{M}_o = \\begin{bmatrix} 0 & 1 \\\\ 0 & -2 \\end{bmatrix}, Rank = 1 (unobservable)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Observability Matrix Formula",
          "content": "For a 2nd-order system: $\\mathbf{M}_o = \\begin{bmatrix} \\mathbf{C} \\\\ \\mathbf{C}\\mathbf{A} \\end{bmatrix}$"
        },
        {
          "title": "Calculate CA",
          "content": "$\\mathbf{C}\\mathbf{A} = \\begin{bmatrix} 1 & 0 \\end{bmatrix} \\begin{bmatrix} -1 & 0 \\\\ 0 & -2 \\end{bmatrix} = \\begin{bmatrix} -1 & 0 \\end{bmatrix}$."
        },
        {
          "title": "Assemble Matrix and Check Rank",
          "content": "$\\mathbf{M}_o = \\begin{bmatrix} 1 & 0 \\\\ -1 & 0 \\end{bmatrix}$.\nRow 2 is a scalar multiple of Row 1 (multiplied by -1). Thus, the determinant is zero, and the rank is 1 (not full rank). The system is unobservable."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "State-Space",
    "title": "Transfer Function from State-Space Sizing",
    "question": "A single-input single-output (SISO) state-space system has matrices $\\mathbf{A} = \\begin{bmatrix} 0 & 1 \\\\ -2 & -3 \\end{bmatrix}$, $\\mathbf{B} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$, and $\\mathbf{C} = \\begin{bmatrix} 1 & 0 \\end{bmatrix}$. Calculate the transfer function $G(s) = Y(s)/U(s)$.",
    "options": [
      { "label": "A", "text": "\\frac{1}{s^2 + 3s + 2}", "is_correct": true },
      { "label": "B", "text": "\\frac{s}{s^2 + 3s + 2}", "is_correct": false },
      { "label": "C", "text": "\\frac{1}{s^2 + 2}", "is_correct": false },
      { "label": "D", "text": "\\frac{s+3}{s^2 + 3s + 2}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Transfer Function State-space Relation",
          "content": "$G(s) = \\mathbf{C}(s\\mathbf{I} - \\mathbf{A})^{-1}\\mathbf{B} + \\mathbf{D}$ (where $D = 0$)"
        },
        {
          "title": "Calculate inverse of sI - A",
          "content": "$s\\mathbf{I} - \\mathbf{A} = \\begin{bmatrix} s & -1 \\\\ 2 & s+3 \\end{bmatrix}$.\n$\\det(s\\mathbf{I} - \\mathbf{A}) = s^2 + 3s + 2$.\n$(s\\mathbf{I} - \\mathbf{A})^{-1} = \\frac{1}{s^2 + 3s + 2} \\begin{bmatrix} s+3 & 1 \\\\ -2 & s \\end{bmatrix}$."
        },
        {
          "title": "Evaluate Vector Multiplications",
          "content": "$G(s) = \\begin{bmatrix} 1 & 0 \\end{bmatrix} \\left(\\frac{1}{s^2 + 3s + 2} \\begin{bmatrix} s+3 & 1 \\\\ -2 & s \\end{bmatrix}\\right) \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$\n$G(s) = \\frac{1}{s^2 + 3s + 2} \\begin{bmatrix} s+3 & 1 \\end{bmatrix} \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} = \\frac{1}{s^2 + 3s + 2}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "State-Space",
    "title": "State Vector Physical Concept",
    "question": "Which of the following defines the 'state variables' in a state-space representation of a dynamic system?",
    "options": [
      { "label": "A", "text": "A minimal set of variables that completely describe the internal energy state of the system at any time t", "is_correct": true },
      { "label": "B", "text": "The algebraic inputs and disturbances acting upon the system boundaries", "is_correct": false },
      { "label": "C", "text": "The set of all physical sensors connected to the plant output ports", "is_correct": false },
      { "label": "D", "text": "The coefficients of the highest order derivative terms in the differential equation", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze State-space Variables Definition",
          "content": "State variables represent the internal storage elements (e.g. capacitor voltage, inductor current, velocity, position). Knowing these variables at $t = t_0$, along with the input $u(t)$ for $t \\ge t_0$, completely determines the system's behavior for all future times."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "State-Space",
    "title": "Pole Placement State Feedback gain",
    "question": "A system is given by $\\dot{x} = 2x + u$. If a state feedback controller $u = -K x$ is applied, what value of gain $K$ is required to place the closed-loop eigenvalue at $s = -5$?",
    "options": [
      { "label": "A", "text": "7.0", "is_correct": true },
      { "label": "B", "text": "3.0", "is_correct": false },
      { "label": "C", "text": "5.0", "is_correct": false },
      { "label": "D", "text": "-3.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Set Up Closed-loop Equation",
          "content": "$\\dot{x} = 2x + (-K x) = (2 - K) x$."
        },
        {
          "title": "Identify Eigenvalue and Solve for K",
          "content": "The closed-loop eigenvalue is the root: $s = 2 - K$.\nWe want $s = -5 \\implies 2 - K = -5 \\implies K = 7.0$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "State-Space",
    "title": "StateTransition Matrix Exponential Property",
    "question": "Which of the following is a fundamental property of the state transition matrix $\\mathbf{\\Phi}(t) = e^{\\mathbf{A}t}$ relating its inverse to negative time?",
    "options": [
      { "label": "A", "text": "\\mathbf{\\Phi}^{-1}(t) = \\mathbf{\\Phi}(-t)", "is_correct": true },
      { "label": "B", "text": "\\mathbf{\\Phi}^{-1}(t) = -\\mathbf{\\Phi}(t)", "is_correct": false },
      { "label": "C", "text": "\\mathbf{\\Phi}^T(t) = \\mathbf{\\Phi}(-t)", "is_correct": false },
      { "label": "D", "text": "\\mathbf{\\Phi}(0) = \\mathbf{0}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Matrix Exponential Properties",
          "content": "The properties of $e^{\\mathbf{A}t}$ parallel those of scalar exponentials: \n1. $\\mathbf{\\Phi}(0) = \mathbf{I}$\n2. $\\mathbf{\\Phi}(t_1 + t_2) = \\mathbf{\\Phi}(t_1)\\mathbf{\\Phi}(t_2)$\n3. $\\mathbf{\\Phi}^{-1}(t) = (e^{\\mathbf{A}t})^{-1} = e^{-\\mathbf{A}t} = \\mathbf{\\Phi}(-t)$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Control Systems (General) (7 needed)
  {
    "topic": "Control Systems",
    "title": "Laplace Transform of Unit Step Function",
    "question": "Calculate the Laplace Transform of a unit step function $f(t) = u(t)$.",
    "options": [
      { "label": "A", "text": "\\frac{1}{s}", "is_correct": true },
      { "label": "B", "text": "1", "is_correct": false },
      { "label": "C", "text": "\\frac{1}{s^2}", "is_correct": false },
      { "label": "D", "text": "\\frac{1}{s+1}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Laplace Transform Definition",
          "content": "$\\mathcal{L}\\{u(t)\\} = \\int_0^\\infty e^{-st} dt = \\left[ -\\frac{1}{s} e^{-st} \\right]_0^\\infty = 0 - \\left(-\\frac{1}{s}\\right) = \\frac{1}{s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Control Systems",
    "title": "Laplace Transform of Exponential Function",
    "question": "Calculate the Laplace Transform of the decaying exponential function $f(t) = e^{-at} u(t)$.",
    "options": [
      { "label": "A", "text": "\\frac{1}{s+a}", "is_correct": true },
      { "label": "B", "text": "\\frac{1}{s-a}", "is_correct": false },
      { "label": "C", "text": "\\frac{a}{s}", "is_correct": false },
      { "label": "D", "text": "\\frac{1}{s^2+a^2}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Integration Definition",
          "content": "$\\mathcal{L}\\{e^{-at}\\} = \\int_0^\\infty e^{-at} e^{-st} dt = \\int_0^\\infty e^{-(s+a)t} dt$"
        },
        {
          "title": "Evaluate Integral",
          "content": "$\\left[ -\\frac{1}{s+a} e^{-(s+a)t} \\right]_0^\\infty = 0 - \\left( -\\frac{1}{s+a} \\right) = \\frac{1}{s+a}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Control Systems",
    "title": "Initial Value Theorem",
    "question": "A system output is given by $Y(s) = \\frac{2s + 5}{(s+1)(s+2)}$. Calculate the initial output value $y(0^+)$ using the Initial Value Theorem.",
    "options": [
      { "label": "A", "text": "2.0", "is_correct": true },
      { "label": "B", "text": "5.0", "is_correct": false },
      { "label": "C", "text": "0.0", "is_correct": false },
      { "label": "D", "text": "2.5", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Initial Value Theorem",
          "content": "$y(0^+) = \\lim_{s \\to \\infty} s Y(s)$"
        },
        {
          "title": "Apply Theorem",
          "content": "$y(0^+) = \\lim_{s \\to \\infty} s \\left( \\frac{2s+5}{s^2+3s+2} \\right) = \\lim_{s \\to \\infty} \\frac{2s^2+5s}{s^2+3s+2}$."
        },
        {
          "title": "Evaluate Limit",
          "content": "Dividing numerator and denominator by $s^2$:\n$\\lim_{s \\to \\infty} \\frac{2 + 5/s}{1 + 3/s + 2/s^2} = \\frac{2+0}{1+0+0} = 2.0$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Control Systems",
    "title": "Open-Loop vs Closed-Loop System Benefits",
    "question": "What is the primary technical advantage of a closed-loop feedback control system compared to an open-loop system?",
    "options": [
      { "label": "A", "text": "Ability to reduce system sensitivity to parameter variations and external disturbances", "is_correct": true },
      { "label": "B", "text": "Lower construction cost and simpler design architecture", "is_correct": false },
      { "label": "C", "text": "Absolute guarantee that the system will never exhibit unstable oscillations", "is_correct": false },
      { "label": "D", "text": "Lower overall power consumption at the actuator ports", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Feedback Properties",
          "content": "Feedback compares the actual output with the reference, correcting for error. This active regulation suppresses the effects of internal parameter shifts (e.g. thermal aging) and external disturbances, which would completely throw off an open-loop system."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Control Systems",
    "title": "Linearity Principle in Control Systems",
    "question": "For a system to be mathematically classified as 'linear', which two fundamental properties must the input-output mapping satisfy?",
    "options": [
      { "label": "A", "text": "Superposition and Homogeneity", "is_correct": true },
      { "label": "B", "text": "Causality and Time-Invariance", "is_correct": false },
      { "label": "C", "text": "Stability and Analyticity", "is_correct": false },
      { "label": "D", "text": "Superposition and Hysteresis", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Define Linearity Properties",
          "content": "1. Superposition (Additivity): If input $u_1 \\to y_1$ and $u_2 \\to y_2$, then $u_1 + u_2 \\to y_1 + y_2$.\n2. Homogeneity (Scaling): If input $u_1 \\to y_1$, then $k u_1 \\to k y_1$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Control Systems",
    "title": "Time-Invariant System Definition",
    "question": "A system is defined as time-invariant if the input-output characteristics do not change over time. If input $u(t)$ produces output $y(t)$, what output does input $u(t - t_0)$ produce?",
    "options": [
      { "label": "A", "text": "y(t - t_0)", "is_correct": true },
      { "label": "B", "text": "y(t) - t_0", "is_correct": false },
      { "label": "C", "text": "y(t)", "is_correct": false },
      { "label": "D", "text": "e^{-st_0} y(t)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Time-Invariance Property",
          "content": "For a time-invariant system, a time delay in the input signal results in an identical time delay in the output response: $u(t - t_0) \\to y(t - t_0)$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Control Systems",
    "title": "Causal System Physical Definition",
    "question": "Which of the following describes a mathematically 'causal system'?",
    "options": [
      { "label": "A", "text": "The system output at any time t depends only on current and past inputs, not future inputs", "is_correct": true },
      { "label": "B", "text": "The output is always proportional to the derivative of the input", "is_correct": false },
      { "label": "C", "text": "The system output is stable for all bounded inputs", "is_correct": false },
      { "label": "D", "text": "The system impulse response is symmetric around t = 0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Understand Causality",
          "content": "A system is causal (or non-anticipative) if its future output is independent of future inputs. All physical, real-time operating systems must be causal because we cannot predict the future."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  }
];

questionsObj["control-systems"] = controlSystemsNew;

// 2. COMMUNICATIONS (+21 questions)
const communicationsNew = [
  // Modulation (4 needed)
  {
    "topic": "Modulation",
    "title": "Amplitude Modulation (AM) Bandwidth Sizing",
    "question": "A sinusoidal message signal has a maximum frequency component of $f_m = 5\\text{ kHz}$. It is modulated using standard double-sideband full-carrier Amplitude Modulation (AM). Calculate the total transmission bandwidth ($B_{AM}$) of the modulated signal.",
    "options": [
      { "label": "A", "text": "10 kHz", "is_correct": true },
      { "label": "B", "text": "5 kHz", "is_correct": false },
      { "label": "C", "text": "20 kHz", "is_correct": false },
      { "label": "D", "text": "2.5 kHz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify AM Bandwidth Formula",
          "content": "For standard AM (Double Sideband): $B = 2 f_m$."
        },
        {
          "title": "Calculate Bandwidth",
          "content": "$B = 2 \\times 5\\text{ kHz} = 10\\text{ kHz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Modulation",
    "title": "AM Modulation Index Sizing",
    "question": "An AM envelope reaches a maximum peak amplitude of $V_{max} = 15\\text{ V}$ and a minimum peak amplitude of $V_{min} = 5\\text{ V}$. Calculate the modulation index ($m$) of this wave.",
    "options": [
      { "label": "A", "text": "0.50", "is_correct": true },
      { "label": "B", "text": "0.67", "is_correct": false },
      { "label": "C", "text": "0.33", "is_correct": false },
      { "label": "D", "text": "1.00", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Modulation Index Formula",
          "content": "$m = \\frac{V_{max} - V_{min}}{V_{max} + V_{min}}$"
        },
        {
          "title": "Substitute and Calculate Index",
          "content": "$m = \\frac{15 - 5}{15 + 5} = \\frac{10}{20} = 0.50$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Modulation",
    "title": "Frequency Modulation (FM) Carson's Rule Sizing",
    "question": "An FM wave has a peak frequency deviation of $\\Delta f = 75\\text{ kHz}$ and a modulating message frequency of $f_m = 15\\text{ kHz}$. Calculate the transmission bandwidth ($B_{FM}$) of the wave using Carson's Rule.",
    "options": [
      { "label": "A", "text": "180 kHz", "is_correct": true },
      { "label": "B", "text": "90 kHz", "is_correct": false },
      { "label": "C", "text": "150 kHz", "is_correct": false },
      { "label": "D", "text": "210 kHz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Carson's Rule Bandwidth Formula",
          "content": "$B_{FM} = 2 (\\Delta f + f_m)$"
        },
        {
          "title": "Calculate Bandwidth",
          "content": "$B_{FM} = 2 \\times (75\\text{ kHz} + 15\\text{ kHz}) = 2 \\times 90\\text{ kHz} = 180\\text{ kHz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Modulation",
    "title": "Nyquist Sampling Rate Sizing",
    "question": "An analog voice signal is band-limited to $f_H = 4\\text{ kHz}$. What is the minimum sampling rate ($f_s$) required by the Nyquist Sampling Theorem to ensure error-free reconstruction?",
    "options": [
      { "label": "A", "text": "8000 Hz", "is_correct": true },
      { "label": "B", "text": "4000 Hz", "is_correct": false },
      { "label": "C", "text": "16000 Hz", "is_correct": false },
      { "label": "D", "text": "2000 Hz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Nyquist Sampling Theorem",
          "content": "The sampling rate $f_s$ must be at least twice the highest frequency component $f_H$ present in the signal: $f_s \\ge 2 f_H$."
        },
        {
          "title": "Calculate Nyquist Rate",
          "content": "$f_{s,min} = 2 \\times 4000\\text{ Hz} = 8000\\text{ Hz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Signal-to-Noise (8 needed)
  {
    "topic": "Signal-to-Noise",
    "title": "SNR in Decibels Calculation",
    "question": "A receiver detects a signal power of $P_{sig} = 10\\text{ mW}$ and a noise power of $P_{noise} = 2.0\\text{ \\mu W}$. Calculate the Signal-to-Noise Ratio ($SNR$) in decibels (dB).",
    "options": [
      { "label": "A", "text": "37.0 dB", "is_correct": true },
      { "label": "B", "text": "5000 dB", "is_correct": false },
      { "label": "C", "text": "23.0 dB", "is_correct": false },
      { "label": "D", "text": "30.0 dB", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Linear SNR Ratio",
          "content": "$SNR_{linear} = \\frac{P_{sig}}{P_{noise}} = \\frac{10 \\times 10^{-3}\\text{ W}}{2.0 \\times 10^{-6}\\text{ W}} = 5000$."
        },
        {
          "title": "Convert to Decibels",
          "content": "$SNR_{dB} = 10 \\log_{10}(SNR_{linear}) = 10 \\log_{10}(5000) \\approx 10 \\times 3.69897 = 36.99\\text{ dB}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Signal-to-Noise",
    "title": "Thermal Noise Power Sizing",
    "question": "Calculate the thermal noise power ($P_N$) in Watts generated by a resistor at room temperature ($T = 290\\text{ K}$) over an audio bandwidth of $B = 20\\text{ kHz}$. (Boltzmann's constant $k = 1.38 \\times 10^{-23}\\text{ J/K}$)",
    "options": [
      { "label": "A", "text": "8.00 \\times 10^{-17} W", "is_correct": true },
      { "label": "B", "text": "4.00 \\times 10^{-17} W", "is_correct": false },
      { "label": "C", "text": "8.00 \\times 10^{-14} W", "is_correct": false },
      { "label": "D", "text": "1.16 \\times 10^{-16} W", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Thermal Noise Power Formula",
          "content": "$P_N = k T B$"
        },
        {
          "title": "Calculate Value",
          "content": "$P_N = (1.38 \\times 10^{-23}\\text{ J/K}) \\times 290\\text{ K} \\times (20 \\times 10^3\\text{ Hz})$\n$P_N = 4.002 \\times 10^{-21} \\times 20000 = 8.004 \\times 10^{-17}\\text{ Watts}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Signal-to-Noise",
    "title": "Noise Figure Sizing",
    "question": "An amplifier has an input Signal-to-Noise Ratio of $SNR_{in} = 40\\text{ dB}$ and an output Signal-to-Noise Ratio of $SNR_{out} = 37\\text{ dB}$. Calculate the Noise Figure ($NF$) of the amplifier in dB.",
    "options": [
      { "label": "A", "text": "3 dB", "is_correct": true },
      { "label": "B", "text": "77 dB", "is_correct": false },
      { "label": "C", "text": "1.08 dB", "is_correct": false },
      { "label": "D", "text": "6 dB", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Noise Figure in Decibels",
          "content": "$NF_{dB} = SNR_{in,dB} - SNR_{out,dB}$"
        },
        {
          "title": "Calculate Value",
          "content": "$NF_{dB} = 40 - 37 = 3\\text{ dB}$ (which represents a linear Noise Factor of $F = 2.0$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Signal-to-Noise",
    "title": "Noise Factor Cascaded Stages (Friis Formula)",
    "question": "A receiver contains two cascaded amplifier stages. Stage 1 has a noise factor of $F_1 = 2.0$ and a gain of $G_1 = 10.0$. Stage 2 has a noise factor of $F_2 = 4.0$. Calculate the total receiver noise factor ($F_{total}$) using the Friis Formula.",
    "options": [
      { "label": "A", "text": "2.3", "is_correct": true },
      { "label": "B", "text": "6.0", "is_correct": false },
      { "label": "C", "text": "2.4", "is_correct": false },
      { "label": "D", "text": "3.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Friis Formula for Cascaded Noise",
          "content": "$F_{total} = F_1 + \\frac{F_2 - 1}{G_1}$"
        },
        {
          "title": "Substitute and Calculate Factor",
          "content": "$F_{total} = 2.0 + \\frac{4.0 - 1}{10.0} = 2.0 + \\frac{3}{10.0} = 2.0 + 0.3 = 2.3$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Signal-to-Noise",
    "title": "Quantization Noise SQNR of ADC Sizing",
    "question": "An analog-to-digital converter (ADC) uses $N = 8$ bits to quantize a signal. What is the maximum Signal-to-Quantization-Noise Ratio ($SQNR$) in dB for a full-scale sinusoidal input?",
    "options": [
      { "label": "A", "text": "49.8 dB", "is_correct": true },
      { "label": "B", "text": "48.0 dB", "is_correct": false },
      { "label": "C", "text": "55.8 dB", "is_correct": false },
      { "label": "D", "text": "42.5 dB", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Sinusoidal SQNR Equation",
          "content": "$SQNR_{dB} = 6.02 N + 1.76\\text{ dB}$"
        },
        {
          "title": "Calculate SQNR",
          "content": "$SQNR_{dB} = (6.02 \\times 8) + 1.76 = 48.16 + 1.76 = 49.92\\text{ dB} \\approx 49.8\\text{ dB}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Signal-to-Noise",
    "title": "Effective Noise Temperature",
    "question": "An amplifier stage has a noise factor of $F = 2.0$. What is the equivalent effective noise temperature ($T_e$) of the amplifier, referencing room temperature at $T_0 = 290\\text{ K}$?",
    "options": [
      { "label": "A", "text": "290 K", "is_correct": true },
      { "label": "B", "text": "580 K", "is_correct": false },
      { "label": "C", "text": "0 K", "is_correct": false },
      { "label": "D", "text": "145 K", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Noise Temperature Formula",
          "content": "$T_e = T_0 (F - 1)$"
        },
        {
          "title": "Calculate Temperature",
          "content": "$T_e = 290\\text{ K} \\times (2.0 - 1) = 290\\text{ K}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Signal-to-Noise",
    "title": "Additive White Gaussian Noise (AWGN) Definition",
    "question": "What is the physical meaning of the 'white' and 'Gaussian' descriptors in an Additive White Gaussian Noise (AWGN) channel model?",
    "options": [
      { "label": "A", "text": "White indicates flat power spectral density; Gaussian indicates normal probability distribution of voltage values", "is_correct": true },
      { "label": "B", "text": "White indicates zero thermal power; Gaussian indicates purely reactive noise impedance", "is_correct": false },
      { "label": "C", "text": "White indicates polar phase angles; Gaussian indicates periodic ripple components", "is_correct": false },
      { "label": "D", "text": "Both terms indicate a single constant noise frequency component", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Deconstruct AWGN Channel Terms",
          "content": "- **White**: The noise has uniform (flat) power spectral density across all frequencies, analogous to white light containing all visible frequencies.\n- **Gaussian**: The instantaneous amplitude of the noise voltage follows a Gaussian (normal) probability density function with zero mean.\n- **Additive**: The noise voltage is simply added to the transmitted signal."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Signal-to-Noise",
    "title": "Resistor Noise Equivalent Model",
    "question": "Under the Thevenin equivalent model of a real noisy resistor $R$, what is the RMS value of the open-circuit thermal noise voltage ($v_n$) generated by the resistor at temperature $T$ over bandwidth $B$?",
    "options": [
      { "label": "A", "text": "\\sqrt{4 k T R B}", "is_correct": true },
      { "label": "B", "text": "4 k T R B", "is_correct": false },
      { "label": "C", "text": "\\sqrt{k T B}", "is_correct": false },
      { "label": "D", "text": "\\sqrt{\\frac{4 k T B}{R}}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Johnson-Nyquist Noise Formula",
          "content": "The thermal noise generated by a resistor is modeled as a noise voltage source in series with an ideal noiseless resistor: $v_{n}^2 = 4 k T R B \\implies v_n = \\sqrt{4 k T R B}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Information Theory (9 needed)
  {
    "topic": "Information Theory",
    "title": "Shannon-Hartley Channel Capacity Sizing",
    "question": "A communication channel has a bandwidth of $B = 3000\\text{ Hz}$ and an operating Signal-to-Noise Ratio of $SNR = 31$ (linear value). Calculate the theoretical maximum channel capacity ($C$) in bits per second (bps) using the Shannon-Hartley Theorem.",
    "options": [
      { "label": "A", "text": "15,000 bps", "is_correct": true },
      { "label": "B", "text": "93,000 bps", "is_correct": false },
      { "label": "C", "text": "5,000 bps", "is_correct": false },
      { "label": "D", "text": "30,000 bps", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Shannon Capacity Formula",
          "content": "$C = B \\log_2(1 + SNR)$"
        },
        {
          "title": "Substitute and Calculate Logarithm",
          "content": "$C = 3000 \\times \\log_2(1 + 31) = 3000 \\times \\log_2(32)$."
        },
        {
          "title": "Evaluate Log Base 2",
          "content": "Since $32 = 2^5$, $\\log_2(32) = 5$.\n$C = 3000 \\times 5 = 15,000\\text{ bps}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Entropy of Binary Source Sizing",
    "question": "A binary source emits a '0' with probability $p = 0.25$ and a '1' with probability $1-p = 0.75$. Calculate the information entropy ($H$) of the source in bits per symbol.",
    "options": [
      { "label": "A", "text": "0.811 bits/symbol", "is_correct": true },
      { "label": "B", "text": "1.000 bits/symbol", "is_correct": false },
      { "label": "C", "text": "0.500 bits/symbol", "is_correct": false },
      { "label": "D", "text": "0.750 bits/symbol", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Binary Entropy Formula",
          "content": "$H = -p \\log_2(p) - (1-p) \\log_2(1-p)$"
        },
        {
          "title": "Substitute Probabilities",
          "content": "$H = -0.25 \\log_2(0.25) - 0.75 \\log_2(0.75)$."
        },
        {
          "title": "Evaluate Logarithms",
          "content": "- $\\log_2(0.25) = -2.0$\n- $\\log_2(0.75) = -0.4150$"
        },
        {
          "title": "Calculate Entropy",
          "content": "$H = -0.25(-2) - 0.75(-0.4150) = 0.50 + 0.3113 = 0.8113\\text{ bits/symbol}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Maximum Entropy Condition",
    "question": "An discrete source can emit any of $M$ different symbols. Under what probability distribution of the symbols does the source reach its absolute maximum entropy ($H_{max}$)?",
    "options": [
      { "label": "A", "text": "Uniform distribution (each symbol has equal probability 1/M)", "is_correct": true },
      { "label": "B", "text": "Normal Gaussian distribution", "is_correct": false },
      { "label": "C", "text": "One symbol has probability 1.0; all others are 0.0", "is_correct": false },
      { "label": "D", "text": "An exponential distribution", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Entropy Extremes",
          "content": "- Minimum Entropy: $H = 0$ bits, which occurs when one symbol has probability $1.0$ (no uncertainty).\n- Maximum Entropy: Occurs when uncertainty is maximized, which is achieved when all symbols are equally likely (uniform distribution: $p_k = 1/M \\implies H_{max} = \\log_2 M$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Source Coding Theorem (Shannon)",
    "question": "According to Shannon's Source Coding Theorem, what is the absolute lower limit on the average number of bits per symbol ($L$) required to represent a source of entropy $H$ without loss?",
    "options": [
      { "label": "A", "text": "L \\ge H", "is_correct": true },
      { "label": "B", "text": "L \\le H", "is_correct": false },
      { "label": "C", "text": "L \\ge \\log_2 H", "is_correct": false },
      { "label": "D", "text": "L = 1.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Source Coding Theorem",
          "content": "Shannon's first theorem states that a source with entropy $H$ cannot be compressed into an average code length $L$ that is less than the entropy without losing information. Therefore: $L \\ge H$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Channel Coding Theorem Concept",
    "question": "According to Shannon's Channel Coding Theorem, under what condition is it theoretically possible to transmit information over a noisy channel with an arbitrarily small probability of error?",
    "options": [
      { "label": "A", "text": "The information transmission rate R must be less than or equal to the channel capacity C (R \\le C)", "is_correct": true },
      { "label": "B", "text": "The SNR must be infinite", "is_correct": false },
      { "label": "C", "text": "The bandwidth must be infinitely wide", "is_correct": false },
      { "label": "D", "text": "The transmission rate must be exactly equal to the bandwidth", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Channel Coding Theorem",
          "content": "Shannon's second theorem states that if the source information rate $R$ (in bps) is less than the channel capacity $C$ ($R \\le C$), there exists a coding scheme that allows transmission with zero error. If $R > C$, errors are guaranteed and cannot be avoided."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Hartley's Law Sizing",
    "question": "According to Hartley's Law, if a noiseless transmission system uses $M = 4$ distinct voltage levels to transmit symbols at a rate of $R_s = 2000\\text{ symbols/s}$, what is the equivalent binary bit rate ($R_b$) in bps?",
    "options": [
      { "label": "A", "text": "4000 bps", "is_correct": true },
      { "label": "B", "text": "8000 bps", "is_correct": false },
      { "label": "C", "text": "2000 bps", "is_correct": false },
      { "label": "D", "text": "1000 bps", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Hartley's Law Formula",
          "content": "$R_b = R_s \\log_2(M)$"
        },
        {
          "title": "Calculate Bit Rate",
          "content": "$R_b = 2000 \\times \\log_2(4) = 2000 \\times 2 = 4000\\text{ bps}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Huffman Coding Efficiency Sizing",
    "question": "A discrete source emits three symbols with probabilities $p(A) = 0.50$, $p(B) = 0.30$, and $p(C) = 0.20$. Using Huffman coding, we assign binary codewords: A = '0', B = '10', C = '11'. Calculate the average codeword length ($L$) in bits/symbol.",
    "options": [
      { "label": "A", "text": "1.50 bits/symbol", "is_correct": true },
      { "label": "B", "text": "1.00 bits/symbol", "is_correct": false },
      { "label": "C", "text": "1.70 bits/symbol", "is_correct": false },
      { "label": "D", "text": "2.00 bits/symbol", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Average Length Formula",
          "content": "$L = \\sum p(x_k) \\cdot l_k$, where $l_k$ is the length of codeword $x_k$."
        },
        {
          "title": "List Codeword Lengths",
          "content": "- Codeword A ('0'): $l_A = 1$\n- Codeword B ('10'): $l_B = 2$\n- Codeword C ('11'): $l_C = 2$"
        },
        {
          "title": "Calculate Average Length",
          "content": "$L = (0.50 \\times 1) + (0.30 \\times 2) + (0.20 \\times 2) = 0.50 + 0.60 + 0.40 = 1.50\\text{ bits/symbol}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Hamming Distance Error Correction Sizing",
    "question": "A block error correction code has a minimum Hamming distance of $d_{min} = 5$ between any two valid code words. Calculate the maximum number of transmission bit errors ($t$) per word that this code is guaranteed to be able to detect ($t_{det}$) and correct ($t_{corr}$).",
    "options": [
      { "label": "A", "text": "t_detect = 4, t_correct = 2", "is_correct": true },
      { "label": "B", "text": "t_detect = 5, t_correct = 2", "is_correct": false },
      { "label": "C", "text": "t_detect = 2, t_correct = 1", "is_correct": false },
      { "label": "D", "text": "t_detect = 4, t_correct = 4", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Error Detection Capability",
          "content": "A code can detect up to $t_{det}$ errors if: $d_{min} \\ge t_{det} + 1 \\implies t_{det} = d_{min} - 1 = 5 - 1 = 4$."
        },
        {
          "title": "Identify Error Correction Capability",
          "content": "A code can correct up to $t_{corr}$ errors if: $d_{min} \\ge 2 t_{corr} + 1 \\implies 2 t_{corr} \\le d_{min} - 1 = 4 \\implies t_{corr} = 2$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Information Theory",
    "title": "Prefix Code Definition",
    "question": "In coding theory, what is the defining characteristic of a 'prefix code' (or prefix-free code)?",
    "options": [
      { "label": "A", "text": "No valid codeword is a prefix of any other valid codeword", "is_correct": true },
      { "label": "B", "text": "All valid codewords must begin with the binary symbol '0'", "is_correct": false },
      { "label": "C", "text": "All valid codewords must have identical length in bits", "is_correct": false },
      { "label": "D", "text": "The sum of all codeword probabilities must equal exactly 1.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Prefix Code Property",
          "content": "A prefix-free code ensures instantaneous decodability. If no codeword is a prefix of another, the receiver can decode each symbol immediately as soon as a valid codeword sequence is received, without waiting for the end of the entire message."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  }
];

questionsObj["control-systems"] = controlSystemsNew;
questionsObj["communications"] = communicationsNew;

// Write back to questions.js
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefix = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefix + 'const QUESTIONS = ' + updatedJson + ';', 'utf8');

console.log("Successfully added 71 control systems and communications questions in Part D.");
