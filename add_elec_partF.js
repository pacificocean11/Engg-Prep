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

// 1. LINEAR SYSTEMS (80 questions)
const linearSystemsNew = [
  // Transfer Functions (8)
  {
    topic: "Transfer Functions",
    title: "RLC Circuit Transfer Function",
    question: "A series RLC circuit has a resistor $R = 10\\ \\Omega$, an inductor $L = 0.1\\ \\text{H}$, and a capacitor $C = 100\\ \\mu\\text{F}$. If the output is the voltage across the capacitor, what is the s-domain transfer function $H(s) = \\frac{V_c(s)}{V_{in}(s)}$?",
    options: [
      { text: "$\\frac{100,000}{s^2 + 100s + 100,000}$", is_correct: true },
      { text: "$\\frac{1}{0.1s^2 + 10s + 100}$", is_correct: false },
      { text: "$\\frac{10,000}{s^2 + 10s + 10,000}$", is_correct: false },
      { text: "$\\frac{100,000}{s^2 + 10s + 100,000}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Write s-domain Impedances",
          content: "$$Z_R = R = 10$$ \n$$Z_L = sL = 0.1s$$ \n$$Z_C = \\frac{1}{sC} = \\frac{1}{100 \\times 10^{-6} s} = \\frac{10,000}{s}$$"
        },
        {
          title: "Apply Voltage Divider to Capacitor",
          content: "$$H(s) = \\frac{Z_C}{Z_R + Z_L + Z_C} = \\frac{\\frac{10,000}{s}}{10 + 0.1s + \\frac{10,000}{s}}$$"
        },
        {
          title: "Simplify the Expression",
          content: "Multiply numerator and denominator by $10s$:\n$$H(s) = \\frac{100,000}{s^2 + 100s + 100,000}$$"
        }
      ]
    }
  },
  {
    topic: "Transfer Functions",
    title: "Op-Amp Low-Pass Transfer Function",
    question: "An active low-pass filter uses an inverting op-amp configuration with a feedback resistor $R_f = 100\\ \\text{k}\\Omega$ in parallel with a capacitor $C_f = 1\\ \\text{nF}$, and an input resistor $R_i = 10\\ \\text{k}\\Omega$. What is the transfer function $H(s)$ of this filter?",
    options: [
      { text: "$-\\frac{10}{10^{-4} s + 1}$", is_correct: true },
      { text: "$-\\frac{100}{10^{-3} s + 1}$", is_correct: false },
      { text: "$-\\frac{10}{s + 10^4}$", is_correct: false },
      { text: "$-\\frac{1}{10^{-4} s + 10}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Inverting Amplifier Gain",
          content: "For an inverting op-amp:\n$$H(s) = -\\frac{Z_f(s)}{R_i}$$"
        },
        {
          title: "Find Feedback Impedance $Z_f(s)$",
          content: "$$Z_f(s) = R_f \\parallel \\frac{1}{sC_f} = \\frac{R_f}{s R_f C_f + 1}$$"
        },
        {
          title: "Calculate $H(s)$",
          content: "$$H(s) = -\\frac{R_f/R_i}{s R_f C_f + 1}$$\nSubstitute $R_f = 10^5\\ \\Omega$, $R_i = 10^4\\ \\Omega$, $C_f = 10^{-9}\\ \\text{F}$:\n$$R_f/R_i = 10$$\n$$R_f C_f = 10^5 \\times 10^{-9} = 10^{-4}\\ \\text{s}$$\n$$H(s) = -\\frac{10}{10^{-4} s + 1}$$"
        }
      ]
    }
  },
  {
    topic: "Transfer Functions",
    title: "DC Gain of a Transfer Function",
    question: "Given a stable linear system with the transfer function $H(s) = \\frac{3s^2 + 10s + 24}{2s^3 + 8s^2 + 12s + 8}$, what is the steady-state DC gain of the system?",
    options: [
      { text: "3", is_correct: true },
      { text: "1.5", is_correct: false },
      { text: "12", is_correct: false },
      { text: "0", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand DC Gain",
          content: "The DC gain of a continuous-time system represents its steady-state response to a step input. It is found by evaluating the transfer function at $s = 0$ (DC, zero frequency)."
        },
        {
          title: "Evaluate $H(0)$",
          content: "$$H(0) = \\frac{3(0)^2 + 10(0) + 24}{2(0)^3 + 8(0)^2 + 12(0) + 8} = \\frac{24}{8} = 3$$"
        }
      ]
    }
  },
  {
    topic: "Transfer Functions",
    title: "Impulse Response from Transfer Function",
    question: "A system has a transfer function $H(s) = \\frac{4}{s+2}$. What is the system's impulse response $h(t)$ for $t \\ge 0$?",
    options: [
      { text: "$4 e^{-2t} u(t)$", is_correct: true },
      { text: "$4 e^{2t} u(t)$", is_correct: false },
      { text: "$2 e^{-4t} u(t)$", is_correct: false },
      { text: "$4 t e^{-2t} u(t)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Relate Transfer Function to Impulse Response",
          content: "The transfer function $H(s)$ is the Laplace transform of the impulse response $h(t)$:\n$$h(t) = \\mathcal{L}^{-1}\\{H(s)\\}$$"
        },
        {
          title: "Apply Inverse Laplace Transform",
          content: "Using the standard transform pair:\n$$\\mathcal{L}^{-1}\\left\\{\\frac{1}{s+a}\\right\\} = e^{-at} u(t)$$\nTherefore:\n$$\\mathcal{L}^{-1}\\{H(s)\\} = \\mathcal{L}^{-1}\\left\\{\\frac{4}{s+2}\\right\\} = 4 e^{-2t} u(t)$$"
        }
      ]
    }
  },
  {
    topic: "Transfer Functions",
    title: "Zeroes and Poles of a Network",
    question: "A transfer function is given by $H(s) = \\frac{s(s+3)}{(s+2)(s^2 + 4s + 13)}$. At which s-values are the poles of the system located?",
    options: [
      { text: "$s = -2$, $s = -2 \\pm j3$", is_correct: true },
      { text: "$s = -2$, $s = -2 \\pm j9$", is_correct: false },
      { text: "$s = 0$, $s = -3$", is_correct: false },
      { text: "$s = -2$, $s = -4 \\pm j13$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Poles of a Transfer Function",
          content: "Poles are the roots of the denominator polynomial (values of $s$ where the gain goes to infinity)."
        },
        {
          title: "Find Denominator Roots",
          content: "Denominator: $(s+2)(s^2 + 4s + 13) = 0$.\nRoot 1: $s = -2$\nFor the quadratic term $s^2 + 4s + 13 = 0$, use the quadratic formula:\n$$s = \\frac{-4 \\pm \\sqrt{4^2 - 4(1)(13)}}{2} = \\frac{-4 \\pm \\sqrt{16 - 52}}{2} = \\frac{-4 \\pm \\sqrt{-36}}{2}$$\n$$s = \\frac{-4 \\pm j6}{2} = -2 \\pm j3$$"
        },
        {
          title: "List All Poles",
          content: "The poles are at $s = -2$ and $s = -2 \\pm j3$."
        }
      ]
    }
  },
  {
    topic: "Transfer Functions",
    title: "Cascaded System Transfer Function",
    question: "Two independent linear systems with transfer functions $H_1(s) = \\frac{2}{s+1}$ and $H_2(s) = \\frac{s}{s+3}$ are connected in cascade. What is the overall transfer function $H(s)$ of the combined system?",
    options: [
      { text: "$\\frac{2s}{(s+1)(s+3)}$", is_correct: true },
      { text: "$\\frac{3s+3}{(s+1)(s+3)}$", is_correct: false },
      { text: "$\\frac{2s}{2s+4}$", is_correct: false },
      { text: "$\\frac{2}{(s+1)(s+3)}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Cascade System Rule",
          content: "When two non-loading systems are connected in cascade (series), the overall transfer function is the product of the individual transfer functions:\n$$H(s) = H_1(s) \\times H_2(s)$$"
        },
        {
          title: "Multiply Transfer Functions",
          content: "$$H(s) = \\frac{2}{s+1} \\times \\frac{s}{s+3} = \\frac{2s}{(s+1)(s+3)}$$"
        }
      ]
    }
  },
  {
    topic: "Transfer Functions",
    title: "Feedback System Transfer Function",
    question: "A closed-loop control system has a forward path transfer function $G(s) = \\frac{10}{s+2}$ and a unity negative feedback path ($H(s) = 1$). What is the closed-loop transfer function $T(s) = \\frac{C(s)}{R(s)}$?",
    options: [
      { text: "$\\frac{10}{s+12}$", is_correct: true },
      { text: "$\\frac{10}{s+2}$", is_correct: false },
      { text: "$\\frac{10}{s-8}$", is_correct: false },
      { text: "$\\frac{1}{s+12}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Closed-Loop Formula",
          content: "The closed-loop transfer function $T(s)$ for negative feedback is:\n$$T(s) = \\frac{G(s)}{1 + G(s) H(s)}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $G(s) = \\frac{10}{s+2}$ and $H(s) = 1$:\n$$T(s) = \\frac{\\frac{10}{s+2}}{1 + \\frac{10}{s+2}}$$"
        },
        {
          title: "Simplify the Transfer Function",
          content: "Multiply numerator and denominator by $(s+2)$:\n$$T(s) = \\frac{10}{(s+2) + 10} = \\frac{10}{s+12}$$"
        }
      ]
    }
  },
  {
    topic: "Transfer Functions",
    title: "All-Pass Filter Transfer Function",
    question: "An all-pass filter has a flat magnitude response $|H(j\\omega)| = 1$ for all frequencies. Which of the following transfer functions represents a first-order all-pass filter?",
    options: [
      { text: "$\\frac{s-a}{s+a}$", is_correct: true },
      { text: "$\\frac{s+a}{s-a}$", is_correct: false },
      { text: "$\\frac{a}{s+a}$", is_correct: false },
      { text: "$\\frac{s}{s+a}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Magnitude Response",
          content: "Let $H(s) = \\frac{s-a}{s+a}$. Substitute $s = j\\omega$:\n$$|H(j\\omega)| = \\left| \\frac{j\\omega - a}{j\\omega + a} \\right| = \\frac{\\sqrt{\\omega^2 + a^2}}{\\sqrt{\\omega^2 + a^2}} = 1$$\nSince the magnitude is exactly 1 for all $\\omega$, this is indeed an all-pass filter."
        }
      ]
    }
  },

  // Stability (9)
  {
    topic: "Stability",
    title: "BIBO Stability Criterion",
    question: "A continuous-time LTI system is bounded-input bounded-output (BIBO) stable if and only if its impulse response $h(t)$ is:",
    options: [
      { text: "Absolutely integrable", is_correct: true },
      { text: "Absolutely square-integrable", is_correct: false },
      { text: "Causal", is_correct: false },
      { text: "A decaying exponential only", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State BIBO Stability Condition",
          content: "A system is BIBO stable if every bounded input $|x(t)| \\le M_x < \\infty$ produces a bounded output $|y(t)| \\le M_y < \\infty$. For an LTI system, this is mathematically equivalent to:\n$$\\int_{-\\infty}^{\\infty} |h(t)|\\, dt < \\infty$$\nwhich means the impulse response is absolutely integrable."
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Routh-Hurwitz Stability Criterion",
    question: "A system's characteristic equation is given by $q(s) = s^3 + 2s^2 + 4s + K = 0$. For the system to be stable, what is the range of the feedback gain $K$?",
    options: [
      { text: "$0 < K < 8$", is_correct: true },
      { text: "$K > 0$", is_correct: false },
      { text: "$K > 8$", is_correct: false },
      { text: "$K < 0$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Construct Routh Array",
          content: "Row $s^3$: 1, 4\nRow $s^2$: 2, $K$\nRow $s^1$: $\\frac{2(4) - 1(K)}{2} = \\frac{8 - K}{2}$\nRow $s^0$: $K$"
        },
        {
          title: "Apply First Column Sign Criterion",
          content: "For stability, all elements in the first column must be positive:\n1. $1 > 0$ (Satisfied)\n2. $2 > 0$ (Satisfied)\n3. $\\frac{8 - K}{2} > 0 \\implies 8 - K > 0 \\implies K < 8$\n4. $K > 0$"
        },
        {
          title: "Determine Range",
          content: "Combining the inequalities gives $0 < K < 8$."
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Right-Half Plane Poles",
    question: "A system has the transfer function $H(s) = \\frac{s-1}{(s+2)(s-3)}$. What can be concluded about the stability and causality of this system?",
    options: [
      { text: "It is unstable if it is causal", is_correct: true },
      { text: "It is stable if it is causal", is_correct: false },
      { text: "It is BIBO stable because the zero is at $s=1$", is_correct: false },
      { text: "It has a pole at $s = -1$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Poles",
          content: "The poles of the system are at $s = -2$ and $s = 3$. The pole at $s = 3$ is in the Right-Half of the s-plane (RHP)."
        },
        {
          title: "Relate ROC to Causality and Stability",
          content: "For a causal system, the Region of Convergence (ROC) must be to the right of the rightmost pole: $\\text{Re}(s) > 3$. Since this ROC does not contain the $j\\omega$ axis ($\\text{Re}(s) = 0$), the causal system is unstable."
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Marginal Stability Condition",
    question: "If a system has characteristic poles located exactly on the imaginary axis of the s-plane with multiplicity 1, and all other poles have negative real parts, the system is:",
    options: [
      { text: "Marginally stable", is_correct: true },
      { text: "BIBO stable", is_correct: false },
      { text: "Unstable", is_correct: false },
      { text: "Asymptotically stable", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Stability States",
          content: "Asymptotically Stable: All poles in Left-Half Plane (LHP, negative real parts). Bound inputs decay.\nMarginally Stable: Simple, non-repeated poles on the $j\\omega$ axis, all other poles in LHP. The impulse response has constant-amplitude oscillations.\nUnstable: Any pole in RHP, or repeated poles on the $j\\omega$ axis."
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Repeated imaginary Poles",
    question: "A system's impulse response contains a term $t \\sin(\\omega_0 t) u(t)$ due to repeated poles on the imaginary axis. This system is classified as:",
    options: [
      { text: "Unstable", is_correct: true },
      { text: "Marginally stable", is_correct: false },
      { text: "BIBO stable", is_correct: false },
      { text: "Asymptotically stable", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Repeated Imaginary Poles",
          content: "Poles on the imaginary axis of multiplicity 2 or higher (repeated poles) yield terms containing $t \\cos(\\omega_0 t)$ or $t \\sin(\\omega_0 t)$ in the impulse response. As $t \\to \\infty$, these terms grow boundlessly. Therefore, the system is unstable."
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Nyquist Stability Criterion",
    question: "According to the Nyquist stability criterion, the closed-loop system is stable if the Nyquist plot of the loop transfer function $G(s)H(s)$ encircles the critical point $(-1, j0)$ in the counterclockwise direction exactly:",
    options: [
      { text: "$P$ times, where $P$ is the number of open-loop poles in the right-half s-plane", is_correct: true },
      { text: "Zero times, regardless of open-loop poles", is_correct: false },
      { text: "$Z$ times, where $Z$ is the number of open-loop zeroes in the LHP", is_correct: false },
      { text: "Exactly twice", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Nyquist Formula",
          content: "The Nyquist stability criterion relates the number of closed-loop RHP poles ($Z$) to open-loop RHP poles ($P$) and counterclockwise encirclements ($N$) of $(-1, j0)$:\n$$Z = P - N$$\nFor closed-loop stability, we must have $Z = 0$, which requires:\n$$N = P$$"
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Gain Margin Definition",
    question: "On a Bode plot, the gain margin is defined as the reciprocal of the loop gain magnitude evaluated at the frequency where the phase angle is:",
    options: [
      { text: "$-180^\\circ$", is_correct: true },
      { text: "$-90^\\circ$", is_correct: false },
      { text: "$0^\\circ$", is_correct: false },
      { text: "$-270^\\circ$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Phase Crossover Frequency",
          content: "The phase crossover frequency $\\omega_{pc}$ is the frequency where the loop phase is exactly $-180^\\circ$.\nGain Margin (GM) is the additional gain required to make the system marginally stable:\n$$\\text{GM} = \\frac{1}{|G(j\\omega_{pc}) H(j\\omega_{pc})|}$$"
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Zero-Input Response Stability",
    question: "A system described by the differential equation $\\frac{d^2 y}{dt^2} - 3\\frac{dy}{dt} + 2y = 0$ is excited by initial conditions. The zero-input response of this system is:",
    options: [
      { text: "Unstable (grows exponentially)", is_correct: true },
      { text: "Stable (decays to zero)", is_correct: false },
      { text: "Constant value", is_correct: false },
      { text: "Marginally stable (oscillatory)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Find Characteristic Roots",
          content: "The characteristic equation is:\n$$\\lambda^2 - 3\\lambda + 2 = 0$$\n$$(\\lambda - 1)(\\lambda - 2) = 0\\implies \\lambda_1 = 1, \\lambda_2 = 2$$"
        },
        {
          title: "Write Zero-Input Response",
          content: "The response is of the form:\n$$y(t) = C_1 e^t + C_2 e^{2t}$$\nSince both roots are positive (RHP), the response grows exponentially as $t \\to \\infty$, making the system unstable."
        }
      ]
    }
  },
  {
    topic: "Stability",
    title: "Region of Convergence (ROC) for Stable Systems",
    question: "For a continuous-time system to be BIBO stable, what condition must its transfer function's Region of Convergence (ROC) satisfy?",
    options: [
      { text: "The ROC must include the imaginary ($j\\omega$) axis", is_correct: true },
      { text: "The ROC must cover the entire s-plane", is_correct: false },
      { text: "The ROC must lie entirely in the right-half plane", is_correct: false },
      { text: "The ROC must exclude all zeroes of the system", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Relate Fourier and Laplace",
          content: "A system is stable if its Fourier transform exists, which requires the imaginary axis $s = j\\omega$ to lie within the region of convergence of the Laplace transform $H(s)$."
        }
      ]
    }
  },

  // Laplace Transforms (6)
  {
    topic: "Laplace Transforms",
    title: "Laplace Transform of a Cosine Function",
    question: "What is the Laplace transform of the function $f(t) = e^{-3t} \\cos(4t) u(t)$?",
    options: [
      { text: "$\\frac{s+3}{(s+3)^2 + 16}$", is_correct: true },
      { text: "$\\frac{4}{(s+3)^2 + 16}$", is_correct: false },
      { text: "$\\frac{s+3}{(s-3)^2 + 16}$", is_correct: false },
      { text: "$\\frac{s}{(s+3)^2 + 16}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Laplace of Cosine",
          content: "$$\\mathcal{L}\\{\\cos(\\omega t)\\} = \\frac{s}{s^2 + \\omega^2}$$"
        },
        {
          title: "Apply Frequency Shifting Property",
          content: "The shifting property states:\n$$\\mathcal{L}\\{e^{-at} g(t)\\} = G(s+a)$$"
        },
        {
          title: "Substitute Values",
          content: "Given $a = 3$ and $\\omega = 4$:\n$$\\mathcal{L}\\{e^{-3t} \\cos(4t)\\} = \\frac{s+3}{(s+3)^2 + 4^2} = \\frac{s+3}{(s+3)^2 + 16}$$"
        }
      ]
    }
  },
  {
    topic: "Laplace Transforms",
    title: "Final Value Theorem Application",
    question: "A system's output Laplace transform is $Y(s) = \\frac{5(s+2)}{s(s^2 + 3s + 2)}$. What is the final value of the output $y(\\infty) = \\lim_{t \\to \\infty} y(t)$?",
    options: [
      { text: "5", is_correct: true },
      { text: "10", is_correct: false },
      { text: "0", is_correct: false },
      { text: "Infinity", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Final Value Theorem",
          content: "If $s Y(s)$ has all its poles in the Left-Half Plane (LHP), then:\n$$y(\\infty) = \\lim_{s \\to 0} s Y(s)$$"
        },
        {
          title: "Check Pole Locations of $s Y(s)$",
          content: "$$s Y(s) = \\frac{5(s+2)}{s^2 + 3s + 2} = \\frac{5(s+2)}{(s+1)(s+2)} = \\frac{5}{s+1}$$\nThe pole is at $s = -1$ (LHP), so the theorem is valid."
        },
        {
          title: "Evaluate Limit",
          content: "$$y(\\infty) = \\lim_{s \\to 0} \\frac{5}{s+1} = 5$$"
        }
      ]
    }
  },
  {
    topic: "Laplace Transforms",
    title: "Initial Value Theorem Application",
    question: "Given the Laplace transform $X(s) = \\frac{2s + 5}{s^2 + 4s + 13}$, what is the initial value $x(0^+) = \\lim_{t \\to 0^+} x(t)$?",
    options: [
      { text: "2", is_correct: true },
      { text: "5", is_correct: false },
      { text: "0", is_correct: false },
      { text: "0.38", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Initial Value Theorem",
          content: "The initial value $x(0^+)$ can be found using:\n$$x(0^+) = \\lim_{s \\to \\infty} s X(s)$$"
        },
        {
          title: "Evaluate Limit",
          content: "$$s X(s) = \\frac{s(2s + 5)}{s^2 + 4s + 13} = \\frac{2s^2 + 5s}{s^2 + 4s + 13}$$\nDivide numerator and denominator by $s^2$:\n$$\\lim_{s \\to \\infty} \\frac{2 + 5/s}{1 + 4/s + 13/s^2} = \\frac{2 + 0}{1 + 0 + 0} = 2$$"
        }
      ]
    }
  },
  {
    topic: "Laplace Transforms",
    title: "Laplace Transform of a Derivative",
    question: "If $X(s)$ is the Laplace transform of $x(t)$, what is the Laplace transform of the second derivative $\\frac{d^2 x(t)}{dt^2}$ in terms of initial conditions $x(0^-)$ and $x'(0^-)$?",
    options: [
      { text: "$s^2 X(s) - s x(0^-) - x'(0^-)$", is_correct: true },
      { text: "$s^2 X(s) - x(0^-) - s x'(0^-)$", is_correct: false },
      { text: "$s^2 X(s)$", is_correct: false },
      { text: "$\\frac{X(s)}{s^2}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Differentiation Property",
          content: "For a first derivative:\n$$\\mathcal{L}\\{x'(t)\\} = s X(s) - x(0^-)$$\nFor a second derivative, apply the rule twice:\n$$\\mathcal{L}\\{x''(t)\\} = s \\mathcal{L}\\{x'(t)\\} - x'(0^-)$$\n$$\\mathcal{L}\\{x''(t)\\} = s (s X(s) - x(0^-)) - x'(0^-) = s^2 X(s) - s x(0^-) - x'(0^-)$$"
        }
      ]
    }
  },
  {
    topic: "Laplace Transforms",
    title: "Laplace Transform of Unit Ramp",
    question: "What is the Laplace transform of the unit ramp function $f(t) = t u(t)$?",
    options: [
      { text: "$\\frac{1}{s^2}$", is_correct: true },
      { text: "$\\frac{1}{s}$", is_correct: false },
      { text: "$s$", is_correct: false },
      { text: "$\\frac{2}{s^3}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Calculate the Laplace Transform Integral",
          content: "$$F(s) = \\int_{0}^{\\infty} t e^{-st}\\, dt$$\nUsing integration by parts ($u = t$, $dv = e^{-st} dt$):\n$$F(s) = \\left[ -\\frac{t}{s} e^{-st} \\right]_{0}^{\\infty} + \\frac{1}{s} \\int_{0}^{\\infty} e^{-st}\\, dt$$\n$$F(s) = 0 + \\frac{1}{s} \\left[ -\\frac{1}{s} e^{-st} \\right]_{0}^{\\infty} = \\frac{1}{s^2}$$"
        }
      ]
    }
  },
  {
    topic: "Laplace Transforms",
    title: "Laplace Transform Time-Delay Property",
    question: "If the Laplace transform of $x(t) u(t)$ is $X(s)$, what is the Laplace transform of the time-delayed signal $y(t) = x(t-t_0) u(t-t_0)$ where $t_0 > 0$?",
    options: [
      { text: "$e^{-s t_0} X(s)$", is_correct: true },
      { text: "$e^{s t_0} X(s)$", is_correct: false },
      { text: "$X(s - t_0)$", is_correct: false },
      { text: "$\\frac{X(s)}{s t_0}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Apply Shifting Theorem",
          content: "The time-delay theorem states that shifting a signal in time by $t_0$ (delayed) corresponds to multiplying its Laplace transform by $e^{-s t_0}$:\n$$\\mathcal{L}\\{x(t - t_0) u(t - t_0)\\} = e^{-s t_0} X(s)$$"
        }
      ]
    }
  },

  // Frequency Response (6)
  {
    topic: "Frequency Response",
    title: "Cutoff Frequency of RC Low-Pass Filter",
    question: "A simple RC low-pass filter consists of a resistor $R = 10\\ \\text{k}\\Omega$ and a capacitor $C = 15.9\\ \\text{nF}$. What is the half-power (3 dB) cutoff frequency in Hertz?",
    options: [
      { text: "$1.0\\ \\text{kHz}$", is_correct: true },
      { text: "$6.28\\ \\text{kHz}$", is_correct: false },
      { text: "$10.0\\ \\text{kHz}$", is_correct: false },
      { text: "$0.16\\ \\text{kHz}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Cutoff Frequency Formula",
          content: "The cutoff frequency $f_c$ in Hertz is:\n$$f_c = \\frac{1}{2\\pi R C}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $R = 10,000\\ \\Omega$ and $C = 15.9 \\times 10^{-9}\\ \\text{F}$:\n$$f_c = \\frac{1}{2\\pi \\times 10^4 \\times 15.9 \\times 10^{-9}}$$"
        },
        {
          title: "Calculate $f_c$",
          content: "$$f_c = \\frac{1}{2\\pi \\times 1.59 \\times 10^{-4}} = \\frac{1}{10^{-3}} = 1000\\ \\text{Hz} = 1.0\\ \\text{kHz}$$"
        }
      ]
    }
  },
  {
    topic: "Frequency Response",
    title: "Phase Shift of an Integrator",
    question: "An ideal integrator has a transfer function $H(s) = \\frac{1}{s}$. What is the phase shift introduced by this system at any frequency $\\omega > 0$?",
    options: [
      { text: "$-90^\\circ$ (constant)", is_correct: true },
      { text: "$+90^\\circ$ (constant)", is_correct: false },
      { text: "$0^\\circ$", is_correct: false },
      { text: "$-180^\\circ$ (constant)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Substitute $s = j\\omega$",
          content: "$$H(j\\omega) = \\frac{1}{j\\omega} = -j \\frac{1}{\\omega}$$"
        },
        {
          title: "Calculate the Phase Angle",
          content: "$$\\angle H(j\\omega) = \\angle (-j) - \\angle(\\omega) = -90^\\circ - 0^\\circ = -90^\\circ$$\nTherefore, the phase shift is constantly $-90^\\circ$ at all positive frequencies."
        }
      ]
    }
  },
  {
    topic: "Frequency Response",
    title: "Bandwidth of Bandpass Filter",
    question: "A bandpass filter has a center frequency $f_0 = 50\\ \\text{kHz}$ and a quality factor $Q = 10$. What is the 3 dB bandwidth ($B$) of this filter?",
    options: [
      { text: "$5\\ \\text{kHz}$", is_correct: true },
      { text: "$500\\ \\text{kHz}$", is_correct: false },
      { text: "$0.2\\ \\text{kHz}$", is_correct: false },
      { text: "$25\\ \\text{kHz}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Relate Quality Factor to Bandwidth",
          content: "The quality factor $Q$ of a resonant system is defined as:\n$$Q = \\frac{f_0}{B}$$\nwhere $f_0$ is the resonant frequency and $B$ is the bandwidth."
        },
        {
          title: "Calculate Bandwidth $B$",
          content: "$$B = \\frac{f_0}{Q} = \\frac{50\\ \\text{kHz}}{10} = 5\\ \\text{kHz}$$"
        }
      ]
    }
  },
  {
    topic: "Frequency Response",
    title: "Resonant Frequency of LC Tank",
    question: "An LC parallel tank circuit has an inductance $L = 2.0\\ \\mu\\text{H}$ and a capacitance $C = 50\\ \\text{pF}$. What is its resonant frequency $f_0$?",
    options: [
      { text: "15.9 MHz", is_correct: true },
      { text: "100.0 MHz", is_correct: false },
      { text: "7.95 MHz", is_correct: false },
      { text: "31.8 MHz", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Resonant Frequency Equation",
          content: "$$f_0 = \\frac{1}{2\\pi \\sqrt{L C}}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $L = 2.0 \\times 10^{-6}\\ \\text{H}$ and $C = 50 \\times 10^{-12}\\ \\text{F}$:\n$$\\sqrt{L C} = \\sqrt{2.0 \\times 10^{-6} \\times 50 \\times 10^{-12}} = \\sqrt{100 \\times 10^{-18}} = 10^{-8}\\ \\text{s}$$"
        },
        {
          title: "Calculate $f_0$",
          content: "$$f_0 = \\frac{1}{2\\pi \\times 10^{-8}} = \\frac{10^8}{2\\pi} \\approx 1.5915 \\times 10^7\\ \\text{Hz} \\approx 15.9\\ \\text{MHz}$$"
        }
      ]
    }
  },
  {
    topic: "Frequency Response",
    title: "High-Pass Filter Cutoff",
    question: "A high-pass filter is represented by the transfer function $H(s) = \\frac{s}{s + 100}$. What is the magnitude of the response (in dB) at a very high frequency $\\omega \\to \\infty$?",
    options: [
      { text: "0 dB", is_correct: true },
      { text: "20 dB", is_correct: false },
      { text: "$-3$ dB", is_correct: false },
      { text: "Infinity dB", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Evaluate Limit at Infinity",
          content: "$$\\lim_{\\omega \\to \\infty} |H(j\\omega)| = \\lim_{\\omega \\to \\infty} \\left| \\frac{j\\omega}{j\\omega + 100} \\right| = 1$$"
        },
        {
          title: "Convert to Decibels",
          content: "$$\\text{Gain in dB} = 20 \\log_{10}(1) = 0\\ \\text{dB}$$"
        }
      ]
    }
  },
  {
    topic: "Frequency Response",
    title: "Second-Order System Damping Factor",
    question: "A second-order system has a characteristic denominator $s^2 + 6s + 25$. What is its natural frequency ($\\omega_n$) and damping ratio ($\\zeta$)?",
    options: [
      { text: "$\\omega_n = 5\\ \\text{rad/s}$, $\\zeta = 0.6$", is_correct: true },
      { text: "$\\omega_n = 25\\ \\text{rad/s}$, $\\zeta = 0.12$", is_correct: false },
      { text: "$\\omega_n = 5\\ \\text{rad/s}$, $\\zeta = 0.3$", is_correct: false },
      { text: "$\\omega_n = 5\\ \\text{rad/s}$, $\\zeta = 1.2$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Standard Form",
          content: "The standard second-order denominator is:\n$$s^2 + 2\\zeta\\omega_n s + \\omega_n^2$$"
        },
        {
          title: "Find $\\omega_n$",
          content: "$$\\omega_n^2 = 25 \\implies \\omega_n = 5\\ \\text{rad/s}$$"
        },
        {
          title: "Find $\\zeta$",
          content: "$$2\\zeta\\omega_n = 6 \\implies 2\\zeta(5) = 6 \\implies 10\\zeta = 6 \\implies \\zeta = 0.6$$"
        }
      ]
    }
  },

  // State-Space (8)
  {
    topic: "State-Space",
    title: "State-Space Model Output Equation",
    question: "A system is modeled in state-space as $\\dot{\\mathbf{x}}(t) = \\mathbf{A}\\mathbf{x}(t) + \\mathbf{B}u(t)$ and $y(t) = \\mathbf{C}\\mathbf{x}(t) + D u(t)$. What does the matrix $\\mathbf{A}$ represent?",
    options: [
      { text: "System matrix (internal dynamics)", is_correct: true },
      { text: "Input matrix", is_correct: false },
      { text: "Output matrix", is_correct: false },
      { text: "Feedforward transmission scalar", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze State-Space Variables",
          content: "- $\\mathbf{x}(t)$: State vector.\n- $\\mathbf{A}$: System matrix. Relates the state derivative to the state vector.\n- $\\mathbf{B}$: Input matrix. Relates state derivative to the input $u(t)$.\n- $\\mathbf{C}$: Output matrix. Relates the output to the states.\n- $D$: Direct transmission term."
        }
      ]
    }
  },
  {
    topic: "State-Space",
    title: "Characteristic Equation from State Matrix",
    question: "A system has the state matrix $\\mathbf{A} = \\begin{bmatrix} 0 & 1 \\\\ -6 & -5 \\end{bmatrix}$. What is the characteristic equation of this system?",
    options: [
      { text: "$\\lambda^2 + 5\\lambda + 6 = 0$", is_correct: true },
      { text: "$\\lambda^2 - 5\\lambda + 6 = 0$", is_correct: false },
      { text: "$\\lambda^2 + 6\\lambda + 5 = 0$", is_correct: false },
      { text: "$\\lambda^2 - 6 = 0$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Formulate Eigenvalue Problem",
          content: "The characteristic equation is found using:\n$$\\det(\\lambda\\mathbf{I} - \\mathbf{A}) = 0$$"
        },
        {
          title: "Compute Determinant",
          content: "$$\\lambda\\mathbf{I} - \\mathbf{A} = \\begin{bmatrix} \\lambda & 0 \\\\ 0 & \\lambda \\end{bmatrix} - \\begin{bmatrix} 0 & 1 \\\\ -6 & -5 \\end{bmatrix} = \\begin{bmatrix} \\lambda & -1 \\\\ 6 & \\lambda + 5 \\end{bmatrix}$$\n$$\\det(\\lambda\\mathbf{I} - \\mathbf{A}) = \\lambda(\\lambda + 5) - (-1)(6) = \\lambda^2 + 5\\lambda + 6 = 0$$"
        }
      ]
    }
  },
  {
    topic: "State-Space",
    title: "State Transition Matrix Calculation",
    question: "What is the state transition matrix $\\mathbf{\\Phi}(t) = e^{\\mathbf{A}t}$ for a diagonal state matrix $\\mathbf{A} = \\begin{bmatrix} -2 & 0 \\\\ 0 & -3 \\end{bmatrix}$?",
    options: [
      { text: "$\\begin{bmatrix} e^{-2t} & 0 \\\\ 0 & e^{-3t} \\end{bmatrix}$", is_correct: true },
      { text: "$\\begin{bmatrix} e^{2t} & 0 \\\\ 0 & e^{3t} \\end{bmatrix}$", is_correct: false },
      { text: "$\\begin{bmatrix} -2e^t & 0 \\\\ 0 & -3e^t \\end{bmatrix}$", is_correct: false },
      { text: "$\\begin{bmatrix} e^{-2t} & e^{-3t} \\\\ e^{-3t} & e^{-2t} \\end{bmatrix}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Calculate Matrix Exponential for Diagonal Matrix",
          content: "For any diagonal matrix $\\mathbf{A} = \\begin{bmatrix} a_1 & 0 \\\\ 0 & a_2 \\end{bmatrix}$, its matrix exponential is simply:\n$$e^{\\mathbf{A}t} = \\begin{bmatrix} e^{a_1 t} & 0 \\\\ 0 & e^{a_2 t} \\end{bmatrix}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Substituting $a_1 = -2$, $a_2 = -3$ gives:\n$$\\mathbf{\\Phi}(t) = \\begin{bmatrix} e^{-2t} & 0 \\\\ 0 & e^{-3t} \\end{bmatrix}$$"
        }
      ]
    }
  },
  {
    topic: "State-Space",
    title: "Transfer Function from State Model",
    question: "A system is defined by state equations with matrices $\\mathbf{A} = \\begin{bmatrix} 0 & 1 \\\\ -2 & -3 \\end{bmatrix}$, $\\mathbf{B} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$, $\\mathbf{C} = \\begin{bmatrix} 1 & 0 \\end{bmatrix}$, and $D = 0$. What is the system's s-domain transfer function $H(s)$?",
    options: [
      { text: "$\\frac{1}{s^2 + 3s + 2}$", is_correct: true },
      { text: "$\\frac{s}{s^2 + 3s + 2}$", is_correct: false },
      { text: "$\\frac{s+3}{s^2 + 3s + 2}$", is_correct: false },
      { text: "$\\frac{1}{s^2 - 3s + 2}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Transfer Function Formula",
          content: "The transfer function $H(s)$ from state-space matrices is:\n$$H(s) = \\mathbf{C}(s\\mathbf{I} - \\mathbf{A})^{-1}\\mathbf{B} + D$$"
        },
        {
          title: "Find $(s\\mathbf{I} - \\mathbf{A})^{-1}$",
          content: "$$s\\mathbf{I} - \\mathbf{A} = \\begin{bmatrix} s & -1 \\\\ 2 & s + 3 \\end{bmatrix}$$\n$$\\det(s\\mathbf{I} - \\mathbf{A}) = s(s+3) + 2 = s^2 + 3s + 2$$\n$$(s\\mathbf{I} - \\mathbf{A})^{-1} = \\frac{1}{s^2 + 3s + 2} \\begin{bmatrix} s+3 & 1 \\\\ -2 & s \\end{bmatrix}$$"
        },
        {
          title: "Compute $H(s)$",
          content: "$$H(s) = \\begin{bmatrix} 1 & 0 \\end{bmatrix} \\left( \\frac{1}{s^2 + 3s + 2} \\begin{bmatrix} s+3 & 1 \\\\ -2 & s \\end{bmatrix} \\right) \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$$\n$$H(s) = \\frac{1}{s^2 + 3s + 2} \\begin{bmatrix} 1 & 0 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ s \\end{bmatrix} = \\frac{1}{s^2 + 3s + 2}$$"
        }
      ]
    }
  },
  {
    topic: "State-Space",
    title: "Controllability Matrix and Check",
    question: "A system is defined by $\\mathbf{A} = \\begin{bmatrix} 1 & 2 \\\\ 0 & 3 \\end{bmatrix}$ and $\\mathbf{B} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$. What is the rank of the controllability matrix $\\mathbf{Q}_c$, and is the system controllable?",
    options: [
      { text: "Rank = 1, Not controllable", is_correct: true },
      { text: "Rank = 2, Controllable", is_correct: false },
      { text: "Rank = 0, Not controllable", is_correct: false },
      { text: "Rank = 1, Controllable", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Formulate Controllability Matrix $\\mathbf{Q}_c$",
          content: "For a second-order system:\n$$\\mathbf{Q}_c = \\begin{bmatrix} \\mathbf{B} & \\mathbf{A}\\mathbf{B} \\end{bmatrix}$$"
        },
        {
          title: "Compute $\\mathbf{A}\\mathbf{B}$",
          content: "$$\\mathbf{A}\\mathbf{B} = \\begin{bmatrix} 1 & 2 \\\\ 0 & 3 \\end{bmatrix} \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$$"
        },
        {
          title: "Analyze Matrix $\\mathbf{Q}_c$",
          content: "$$$\\mathbf{Q}_c = \\begin{bmatrix} 1 & 1 \\\\ 0 & 0 \\end{bmatrix}$$\nThe determinant is $1(0) - 1(0) = 0$. The columns are linearly dependent. Thus, the rank is 1. Since $\\text{Rank}(\\mathbf{Q}_c) < 2$, the system is not controllable."
        }
      ]
    }
  },
  {
    topic: "State-Space",
    title: "Observability Matrix Check",
    question: "A system has matrices $\\mathbf{A} = \\begin{bmatrix} -1 & 0 \\\\ 2 & -3 \\end{bmatrix}$ and $\\mathbf{C} = \\begin{bmatrix} 1 & 1 \\end{bmatrix}$. What is the observability matrix $\\mathbf{Q}_o$, and is the system observable?",
    options: [
      { text: "$\\mathbf{Q}_o = \\begin{bmatrix} 1 & 1 \\\\ 1 & -3 \\end{bmatrix}$, Observable", is_correct: true },
      { text: "$\\mathbf{Q}_o = \\begin{bmatrix} 1 & 1 \\\\ -1 & 0 \\end{bmatrix}$, Not Observable", is_correct: false },
      { text: "$\\mathbf{Q}_o = \\begin{bmatrix} 1 & 1 \\\\ -3 & 1 \\end{bmatrix}$, Observable", is_correct: false },
      { text: "$\\mathbf{Q}_o = \\begin{bmatrix} 1 & 1 \\\\ 1 & 1 \\end{bmatrix}$, Not Observable", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Formulate Observability Matrix $\\mathbf{Q}_o$",
          content: "For a second-order system:\n$$\\mathbf{Q}_o = \\begin{bmatrix} \\mathbf{C} \\\\ \\mathbf{C}\\mathbf{A} \\end{bmatrix}$$"
        },
        {
          title: "Compute $\\mathbf{C}\\mathbf{A}$",
          content: "$$\\mathbf{C}\\mathbf{A} = \\begin{bmatrix} 1 & 1 \\end{bmatrix} \\begin{bmatrix} -1 & 0 \\\\ 2 & -3 \\end{bmatrix} = \\begin{bmatrix} 1(-1) + 1(2) & 1(0) + 1(-3) \\end{bmatrix} = \\begin{bmatrix} 1 & -3 \\end{bmatrix}$$"
        },
        {
          title: "Find Observability Matrix and Rank",
          content: "$$\\mathbf{Q}_o = \\begin{bmatrix} 1 & 1 \\\\ 1 & -3 \\end{bmatrix}$$\nDeterminant: $1(-3) - 1(1) = -4 \\ne 0$. The matrix is full-rank (rank = 2), so the system is fully observable."
        }
      ]
    }
  },
  {
    topic: "State-Space",
    title: "State-Space to Differential Equation",
    question: "A system is defined by $\\dot{x}_1 = x_2$ and $\\dot{x}_2 = -4 x_1 - 5 x_2 + u(t)$. What is the corresponding single second-order differential equation relating the state $x_1(t)$ to the input $u(t)$?",
    options: [
      { text: "$\\frac{d^2 x_1}{dt^2} + 5\\frac{dx_1}{dt} + 4x_1 = u(t)$", is_correct: true },
      { text: "$\\frac{d^2 x_1}{dt^2} - 5\\frac{dx_1}{dt} + 4x_1 = u(t)$", is_correct: false },
      { text: "$\\frac{d^2 x_1}{dt^2} + 4\\frac{dx_1}{dt} + 5x_1 = u(t)$", is_correct: false },
      { text: "$\\frac{d^2 x_1}{dt^2} + 5\\frac{dx_1}{dt} - 4x_1 = u(t)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Differentiate first state equation",
          content: "$$\\dot{x}_1 = x_2 \\implies \\ddot{x}_1 = \\dot{x}_2$$"
        },
        {
          title: "Substitute second state equation",
          content: "$$\\ddot{x}_1 = -4 x_1 - 5 x_2 + u(t)$$"
        },
        {
          title: "Eliminate $x_2$",
          content: "Since $x_2 = \\dot{x}_1$:\n$$\\ddot{x}_1 = -4 x_1 - 5 \\dot{x}_1 + u(t)$$\n$$\\ddot{x}_1 + 5\\dot{x}_1 + 4x_1 = u(t)$$"
        }
      ]
    }
  },
  {
    topic: "State-Space",
    title: "Phase-Variable Canonical Form",
    question: "A system is described by the differential equation $\\ddot{y} + a_1 \\dot{y} + a_0 y = u(t)$. If we select state variables $x_1 = y$ and $x_2 = \\dot{y}$, what are the resulting state-space matrices $\\mathbf{A}$ and $\\mathbf{B}$?",
    options: [
      { text: "$\\mathbf{A} = \\begin{bmatrix} 0 & 1 \\\\ -a_0 & -a_1 \\end{bmatrix}$, $\\mathbf{B} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$", is_correct: true },
      { text: "$\\mathbf{A} = \\begin{bmatrix} -a_0 & -a_1 \\\\ 0 & 1 \\end{bmatrix}$, $\\mathbf{B} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$", is_correct: false },
      { text: "$\\mathbf{A} = \\begin{bmatrix} 0 & 1 \\\\ -a_1 & -a_0 \\end{bmatrix}$, $\\mathbf{B} = \\begin{bmatrix} 1 \\\\ 0 \\end{bmatrix}$", is_correct: false },
      { text: "$\\mathbf{A} = \\begin{bmatrix} 1 & 0 \\\\ -a_0 & -a_1 \\end{bmatrix}$, $\\mathbf{B} = \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Write State Derivatives",
          content: "$$\\dot{x}_1 = \\dot{y} = x_2$$\n$$\\dot{x}_2 = \\ddot{y} = -a_1 \\dot{y} - a_0 y + u(t) = -a_0 x_1 - a_1 x_2 + u(t)$$"
        },
        {
          title: "Express in Matrix Form",
          content: "$$\\begin{bmatrix} \\dot{x}_1 \\\\ \\dot{x}_2 \\end{bmatrix} = \\begin{bmatrix} 0 & 1 \\\\ -a_0 & -a_1 \\end{bmatrix} \\begin{bmatrix} x_1 \\\\ x_2 \\end{bmatrix} + \\begin{bmatrix} 0 \\\\ 1 \\end{bmatrix} u(t)$$\nThis shows the matrices are as given in option A."
        }
      ]
    }
  },

  // Linearity (8)
  {
    topic: "Linearity",
    title: "Linearity of Squaring System",
    question: "A system is defined by the input-output relationship $y(t) = x^2(t)$. Is this system linear?",
    options: [
      { text: "No, because it violates both additivity and homogeneity", is_correct: true },
      { text: "Yes, because it is memoryless", is_correct: false },
      { text: "Yes, because it satisfies homogeneity", is_correct: false },
      { text: "No, because it is time-variant", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Homogeneity",
          content: "Let $x_1(t) = a x(t)$. The output is:\n$$y_1(t) = [x_1(t)]^2 = [a x(t)]^2 = a^2 x^2(t) = a^2 y(t)$$\nFor homogeneity, we must have $y_1(t) = a y(t)$. Since $a^2 y(t) \\ne a y(t)$ for $a \\ne 1$, the system violates homogeneity."
        },
        {
          title: "Test Additivity",
          content: "Let $x_3(t) = x_1(t) + x_2(t)$. The output is:\n$$y_3(t) = (x_1(t) + x_2(t))^2 = x_1^2(t) + x_2^2(t) + 2x_1(t)x_2(t) \\ne y_1(t) + y_2(t)$$\nThis violates additivity. Therefore, the system is non-linear."
        }
      ]
    }
  },
  {
    topic: "Linearity",
    title: "Linearity of Modulator",
    question: "A system is defined by $y(t) = x(t) \\cos(\\omega_c t)$. Is this system linear?",
    options: [
      { text: "Yes, because it satisfies both additivity and homogeneity", is_correct: true },
      { text: "No, because it has a time-dependent multiplier", is_correct: false },
      { text: "No, because it violates homogeneity", is_correct: false },
      { text: "Yes, because it is time-invariant", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Additivity",
          content: "Let $x_3(t) = a x_1(t) + b x_2(t)$. The output is:\n$$y_3(t) = (a x_1(t) + b x_2(t)) \\cos(\\omega_c t) = a x_1(t) \\cos(\\omega_c t) + b x_2(t) \\cos(\\omega_c t)$$\n$$y_3(t) = a y_1(t) + b y_2(t)$$\nSince superposition holds, the system is fully linear."
        }
      ]
    }
  },
  {
    topic: "Linearity",
    title: "Linearity of System with Offset",
    question: "A system is described by $y(t) = 3 x(t) + 5$. Which of the following best describes this system?",
    options: [
      { text: "It is non-linear (an incrementally linear system)", is_correct: true },
      { text: "It is linear because it represents a straight line", is_correct: false },
      { text: "It is linear because its derivative is constant", is_correct: false },
      { text: "It is linear only if the input $x(t) > 0$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Homogeneity (Zero-Input Condition)",
          content: "A fundamental property of any linear system is that a zero input must produce a zero output: $x(t) = 0 \\implies y(t) = 0$."
        },
        {
          title: "Evaluate Zero-Input Response",
          content: "For this system: $y(t) = 3(0) + 5 = 5 \\ne 0$. Because of this non-zero bias, the system violates homogeneity and is non-linear (specifically, it is classified as 'incrementally linear')."
        }
      ]
    }
  },
  {
    topic: "Linearity",
    title: "Linearity of Integral System",
    question: "A system has the input-output relationship $y(t) = \\int_{-\\infty}^{t} x(\\tau)\\, d\\tau$. This system is:",
    options: [
      { text: "Linear and time-invariant", is_correct: true },
      { text: "Non-linear and time-invariant", is_correct: false },
      { text: "Linear and time-variant", is_correct: false },
      { text: "Non-linear and time-variant", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Superposition",
          content: "Since integration is a linear operator:\n$$\\int (a x_1 + b x_2)\\, d\\tau = a \\int x_1\\, d\\tau + b \\int x_2\\, d\\tau$$\nSuperposition holds, so the system is linear."
        },
        {
          title: "Test Time-Invariance",
          content: "Shifting the input by $t_0$ shifts the limits of integration correspondingly, yielding $y(t-t_0)$. Thus, the system is linear and time-invariant (LTI)."
        }
      ]
    }
  },
  {
    topic: "Linearity",
    title: "Linearity of Ideal Sampler",
    question: "A discrete-time system is formed by sampling: $y[n] = x(n T_s)$. Is this system linear?",
    options: [
      { text: "Yes, it is linear", is_correct: true },
      { text: "No, because sampling loses high frequency data", is_correct: false },
      { text: "No, because it is time-variant", is_correct: false },
      { text: "No, because it is a non-linear operator", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Superposition for Sampler",
          content: "Let $x_3(t) = a x_1(t) + b x_2(t)$. The output is:\n$$y_3[n] = x_3(n T_s) = a x_1(n T_s) + b x_2(n T_s) = a y_1[n] + b y_2[n]$$\nSince superposition holds, the sampling system is linear (though it is time-variant due to scaling of the time variable)."
        }
      ]
    }
  },
  {
    topic: "Linearity",
    title: "Linearity of Time-Scaling System",
    question: "A system is defined by $y(t) = x(2t)$. Which of the following is true?",
    options: [
      { text: "It is linear and time-variant", is_correct: true },
      { text: "It is non-linear and time-invariant", is_correct: false },
      { text: "It is linear and time-invariant", is_correct: false },
      { text: "It is non-linear and time-variant", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Linearity",
          content: "Let $x_3(t) = a x_1(t) + b x_2(t)$. The output is:\n$$y_3(t) = x_3(2t) = a x_1(2t) + b x_2(2t) = a y_1(t) + b y_2(t)$$\nSuperposition holds, so the system is linear."
        },
        {
          title: "Test Time-Invariance",
          content: "If the input is delayed by $t_0$, the delayed output is:\n$$y_d(t) = x(2t - t_0)$$\nHowever, shifting the original output by $t_0$ gives:\n$$y(t - t_0) = x(2(t - t_0)) = x(2t - 2t_0) \\ne y_d(t)$$\nSince $y_d(t) \\ne y(t-t_0)$, the system is time-variant."
        }
      ]
    }
  },
  {
    topic: "Linearity",
    title: "Linearity of Envelope Detector",
    question: "An envelope detector outputs the absolute value of the input signal: $y(t) = |x(t)|$. Is this system linear?",
    options: [
      { text: "No, because it violates homogeneity for negative scaling constants", is_correct: true },
      { text: "Yes, because the output is always positive", is_correct: false },
      { text: "Yes, because it is memoryless", is_correct: false },
      { text: "No, because it violates time-invariance", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Homogeneity with a Negative Scalar",
          content: "Let $a = -2$. If homogeneity holds, we must have $y_a(t) = -2 y(t)$.\nHowever:\n$$y_a(t) = |-2 x(t)| = 2 |x(t)| = 2 y(t) \\ne -2 y(t)$$\nSince it violates homogeneity for negative scalars, the system is non-linear."
        }
      ]
    }
  },
  {
    topic: "Linearity",
    title: "Linearity of Logarithmic System",
    question: "A system is defined by the input-output relationship $y(t) = \\ln(x(t))$. Is this system linear?",
    options: [
      { text: "No, because it violates both additivity and homogeneity", is_correct: true },
      { text: "Yes, because logarithm is a continuous function", is_correct: false },
      { text: "Yes, because it satisfies homogeneity", is_correct: false },
      { text: "No, because it has memory", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Additivity",
          content: "Let $x_3(t) = x_1(t) + x_2(t)$. The output is:\n$$y_3(t) = \\ln(x_1(t) + x_2(t)) \\ne \\ln(x_1(t)) + \\ln(x_2(t))$$\nSince $\\ln(A+B) \\ne \\ln(A) + \\ln(B)$, it violates additivity and is therefore non-linear."
        }
      ]
    }
  },

  // Causality (9)
  {
    topic: "Causality",
    title: "Causality of Ideal Delay",
    question: "A system is defined by $y(t) = x(t - t_0)$ where $t_0 > 0$. Is this system causal?",
    options: [
      { text: "Yes, because the output depends only on past and present inputs", is_correct: true },
      { text: "No, because it introduces a delay", is_correct: false },
      { text: "No, because it has memory", is_correct: false },
      { text: "Only if $t_0 < 0$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Causality",
          content: "A system is causal if its output at any time $t$ depends only on the input at the current time $t$ and/or past times (i.e. $\\tau \\le t$)."
        },
        {
          title: "Apply Definition",
          content: "Since $t_0 > 0$, the term $t - t_0$ is strictly less than $t$ (past time). Therefore, the output depends only on the past input, making the system causal."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality of Ideal Predictor",
    question: "A system is defined by the relationship $y(t) = x(t + 2)$. Is this system causal?",
    options: [
      { text: "No, because the output at time $t$ depends on future inputs", is_correct: true },
      { text: "Yes, because it is a simple time shift", is_correct: false },
      { text: "Yes, because it is linear and time-invariant", is_correct: false },
      { text: "No, because it has infinite memory", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Evaluate Time Dependancy",
          content: "For this system, the output at time $t = 0$ requires knowledge of the input at time $t = 2$ (future input). Since the system relies on future values of the input, it is non-causal (or anticipatory)."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality of Time-Reversal System",
    question: "A system is defined by $y(t) = x(-t)$. Is this system causal?",
    options: [
      { text: "No, because for $t < 0$, the output depends on future inputs", is_correct: true },
      { text: "Yes, because it is memoryless", is_correct: false },
      { text: "Yes, for all $t$", is_correct: false },
      { text: "Only if the input is symmetric", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Evaluate Specific Times",
          content: "Let's check the output at a negative time, say $t = -3$:\n$$y(-3) = x(-(-3)) = x(3)$$\nHere, the output at $t = -3$ depends on the input at future time $t = 3$. Because it requires future inputs for any negative time, the system is non-causal."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality of Accumulator",
    question: "A discrete-time system is described by $y[n] = \\sum_{k=-\\infty}^{n} x[k]$. Is this system causal?",
    options: [
      { text: "Yes, because it only sums values from $-\\infty$ up to the present index $n$", is_correct: true },
      { text: "No, because the summation range is infinite", is_correct: false },
      { text: "No, because it requires future values of $x[n]$", is_correct: false },
      { text: "Only if $n > 0$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Indices",
          content: "The output $y[n]$ is the sum of inputs $x[k]$ for $k \\le n$. All terms in the sum represent either past inputs ($k < n$) or the present input ($k = n$). Since no future inputs ($k > n$) are included, the system is causal."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality of Moving Average Filter",
    question: "A symmetric moving average filter is defined by $y[n] = \\frac{1}{3}(x[n-1] + x[n] + x[n+1])$. Which of the following is true?",
    options: [
      { text: "It is non-causal because it depends on $x[n+1]$", is_correct: true },
      { text: "It is causal because it is a low-pass filter", is_correct: false },
      { text: "It is causal because it uses the present value $x[n]$", is_correct: false },
      { text: "It is non-causal only if $n < 0$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Check Future Dependencies",
          content: "The term $x[n+1]$ represents the input at the next time step (a future input). Since calculating $y[n]$ requires this future value, the filter is non-causal. (In real-time systems, this is made causal by introducing a delay of 1 sample)."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality and Impulse Response",
    question: "A continuous-time LTI system is causal if and only if its impulse response $h(t)$ satisfies:",
    options: [
      { text: "$h(t) = 0$ for all $t < 0$", is_correct: true },
      { text: "$h(t) = 0$ for all $t > 0$", is_correct: false },
      { text: "$h(t)$ is absolutely integrable", is_correct: false },
      { text: "$h(t)$ is a step function", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Relate Causality to Impulse Response",
          content: "The output of an LTI system is the convolution of input and impulse response:\n$$y(t) = \\int_{-\\infty}^{\\infty} x(t - \\tau) h(\\tau)\\, d\\tau$$\nFor the system to be causal, $y(t)$ must not depend on future inputs $x(t-\\tau)$ where $\\tau < 0$. This requires $h(\\tau) = 0$ for all $\\tau < 0$."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality of Hilbert Transformer",
    question: "An ideal Hilbert transformer has an impulse response $h(t) = \\frac{1}{\\pi t}$ for $-\\infty < t < \\infty$. What can be concluded about its causality?",
    options: [
      { text: "It is non-causal because $h(t) \\ne 0$ for $t < 0$", is_correct: true },
      { text: "It is causal because it is a phase-shifting system", is_correct: false },
      { text: "It is causal because it is stable", is_correct: false },
      { text: "It is causal for positive frequencies only", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Check Causality Condition",
          content: "The impulse response $h(t) = \\frac{1}{\\pi t}$ is non-zero for negative times ($t < 0$). Therefore, the ideal Hilbert transformer is non-causal and cannot be implemented in real-time."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality of Ideal Low-Pass Filter",
    question: "An ideal low-pass filter has a frequency response $H(f) = \\text{rect}(f / 2B)$. Why is this filter physically unrealizable in real-time?",
    options: [
      { text: "Its impulse response is a Sinc function that is non-zero for $t < 0$ (non-causal)", is_correct: true },
      { text: "Its bandwidth is finite", is_correct: false },
      { text: "It has infinite gain at the cutoff frequency", is_correct: false },
      { text: "It requires infinite power to operate", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Find Impulse Response",
          content: "The impulse response $h(t)$ is the inverse Fourier transform of $H(f)$:\n$$h(t) = \\mathcal{F}^{-1}\\{\\text{rect}(f/2B)\\} = 2B \\text{sinc}(2Bt)$$"
        },
        {
          title: "Analyze Causality",
          content: "The Sinc function extends from $-\\infty$ to $+\\infty$, meaning $h(t) \\ne 0$ for $t < 0$. Thus, the ideal LPF is non-causal, which makes it physically unrealizable in real-time."
        }
      ]
    }
  },
  {
    topic: "Causality",
    title: "Causality of Absolute Integrator",
    question: "Is the system defined by $y(t) = \\int_{t-2}^{t+2} x(\\tau)\\, d\\tau$ causal?",
    options: [
      { text: "No, because the upper limit is $t+2$ (future inputs)", is_correct: true },
      { text: "Yes, because the integration window has a finite length of 4", is_correct: false },
      { text: "Yes, because it only integrates real values", is_correct: false },
      { text: "Only if $t > 2$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Examine Integration Limits",
          content: "The output at time $t$ integrates the input over the window $[t-2, t+2]$. This requires inputs up to $t+2$, which are future inputs. Therefore, the system is non-causal."
        }
      ]
    }
  },

  // Convolution (9)
  {
    topic: "Convolution",
    title: "Convolution of Two Step Functions",
    question: "What is the convolution of a unit step function $x(t) = u(t)$ with itself?",
    options: [
      { text: "$t u(t)$ (Unit Ramp)", is_correct: true },
      { text: "$u(t)$", is_correct: false },
      { text: "$\\frac{1}{2} t^2 u(t)$", is_correct: false },
      { text: "$\\delta(t)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Write Convolution Integral",
          content: "$$y(t) = u(t) * u(t) = \\int_{-\\infty}^{\\infty} u(\\tau) u(t - \\tau)\\, d\\tau$$"
        },
        {
          title: "Apply Step Function Bounds",
          content: "$u(\\tau) = 1$ for $\\tau > 0$, and $u(t - \\tau) = 1$ for $\\tau < t$. This restricts the integration range to:\n$$0 < \\tau < t$$\nThis integral is only non-zero for $t > 0$."
        },
        {
          title: "Evaluate Integral",
          content: "$$y(t) = \\left( \\int_{0}^{t} 1\\, d\\tau \\right) u(t) = t u(t)$$"
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Convolution with Impulse Function",
    question: "Given a signal $x(t) = e^{-3t} u(t)$, what is the result of convolving $x(t)$ with a shifted delta function $h(t) = \\delta(t - 4)$?",
    options: [
      { text: "$e^{-3(t-4)} u(t-4)$", is_correct: true },
      { text: "$e^{-3t} u(t-4)$", is_correct: false },
      { text: "$e^{-3(t-4)} u(t)$", is_correct: false },
      { text: "$e^{-3t} \\delta(t-4)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Shifting Property of Delta Function",
          content: "Convolving any signal $g(t)$ with a shifted impulse $\\delta(t - t_0)$ simply shifts the signal in time by $t_0$:\n$$g(t) * \\delta(t - t_0) = g(t - t_0)$$"
        },
        {
          title: "Substitute Given Values",
          content: "Substituting $x(t) = e^{-3t} u(t)$ and $t_0 = 4$:\n$$y(t) = e^{-3(t-4)} u(t-4)$$"
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Convolution of Rectangular Pulses",
    question: "Two rectangular pulses $x(t)$ and $h(t)$ are both of height 1 and width $T$, starting at $t=0$. What shape is the resulting convolved signal $y(t) = x(t) * h(t)$?",
    options: [
      { text: "Triangular pulse of width $2T$, peaking at $t=T$", is_correct: true },
      { text: "Symmetric trapezoidal pulse", is_correct: false },
      { text: "Rectangular pulse of width $2T$", is_correct: false },
      { text: "Gaussian pulse", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Visualize Convolution",
          content: "When convolving two identical rectangular pulses of width $T$, the area of overlap increases linearly from $t=0$ to $t=T$ (forming a ramp), and then decreases linearly from $t=T$ to $t=2T$, returning to zero."
        },
        {
          title: "Identify Shape",
          content: "This represents a symmetric triangular pulse of total base width $2T$, with its peak at $t = T$."
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Discrete-Time Convolution Sum",
    question: "Compute the convolution $y[n] = x[n] * h[n]$ of the finite sequences $x[n] = [1, 2, 3]$ and $h[n] = [1, 1]$ where the first elements are at $n=0$.",
    options: [
      { text: "$[1, 3, 5, 3]$", is_correct: true },
      { text: "$[1, 2, 3]$", is_correct: false },
      { text: "$[1, 3, 3, 3]$", is_correct: false },
      { text: "$[2, 3, 5, 3]$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Write Convolution Table",
          content: "We can compute this via polynomial multiplication:\n$$(1 + 2x + 3x^2) \\times (1 + x)$$"
        },
        {
          title: "Perform Multiplication",
          content: "$$(1 + 2x + 3x^2) \\times 1 = 1 + 2x + 3x^2$$\n$$(1 + 2x + 3x^2) \\times x = x + 2x^2 + 3x^3$$\nSumming like terms:\n$$1 + (2+1)x + (3+2)x^2 + 3x^3 = 1 + 3x + 5x^2 + 3x^3$$"
        },
        {
          title: "Write Resulting Sequence",
          content: "The coefficients represent the sequence: $[1, 3, 5, 3]$ starting at $n=0$."
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Convolution in Frequency Domain",
    question: "According to the convolution theorem, convolving two signals in the time domain, $y(t) = x(t) * h(t)$, corresponds in the frequency domain to:",
    options: [
      { text: "Multiplication of their Fourier transforms", is_correct: true },
      { text: "Convolution of their Fourier transforms", is_correct: false },
      { text: "Addition of their Fourier transforms", is_correct: false },
      { text: "Integration of their product", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Convolution Theorem",
          content: "The convolution theorem states:\n$$\\mathcal{F}\\{x(t) * h(t)\\} = X(f) \\cdot H(f)$$\nThis shows that time-domain convolution is equivalent to frequency-domain multiplication, which makes filter design highly simplified."
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Convolution of Exponential Functions",
    question: "What is the convolution of the signals $x(t) = e^{-at} u(t)$ and $h(t) = e^{-bt} u(t)$ where $a \\ne b$?",
    options: [
      { text: "$\\frac{e^{-at} - e^{-bt}}{b - a} u(t)$", is_correct: true },
      { text: "$\\frac{e^{-at} - e^{-bt}}{a - b} u(t)$", is_correct: false },
      { text: "$(e^{-at} + e^{-bt}) u(t)$", is_correct: false },
      { text: "$e^{-(a+b)t} u(t)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Write Convolution Integral",
          content: "$$y(t) = \\int_{0}^{t} e^{-a\\tau} e^{-b(t-\\tau)}\\, d\\tau = e^{-bt} \\int_{0}^{t} e^{(b-a)\\tau}\\, d\\tau$$"
        },
        {
          title: "Evaluate Integral",
          content: "$$y(t) = e^{-bt} \\left[ \\frac{e^{(b-a)\\tau}}{b-a} \\right]_{0}^{t} = e^{-bt} \\frac{e^{(b-a)t} - 1}{b-a}$$\n$$y(t) = \\frac{e^{-at} - e^{-bt}}{b-a}$$\nThis is valid for $t \\ge 0$, which yields the result."
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Commutative Property of Convolution",
    question: "The commutative property of convolution, $x(t) * h(t) = h(t) * x(t)$, implies that:",
    options: [
      { text: "The order of system cascade does not affect the overall response", is_correct: true },
      { text: "Systems must be causal to commute", is_correct: false },
      { text: "Impulse response is always symmetric", is_correct: false },
      { text: "The input and output have the same bandwidth", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Commutative Meaning",
          content: "Since $x * h = h * x$, in a cascade connection of systems, whether the signal passes through system $H_1$ first and then $H_2$, or $H_2$ first and then $H_1$, the resulting output remains identical."
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Convolution of Sine and Step",
    question: "Find the convolution of $x(t) = \\sin(t) u(t)$ with a unit step $h(t) = u(t)$.",
    options: [
      { text: "$(1 - \\cos(t)) u(t)$", is_correct: true },
      { text: "$\\cos(t) u(t)$", is_correct: false },
      { text: "$(t - \\sin(t)) u(t)$", is_correct: false },
      { text: "$-\\cos(t) u(t)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Write Convolution Integral",
          content: "$$y(t) = \\int_{0}^{t} \\sin(\\tau) u(\\tau) u(t-\\tau)\\, d\\tau = \\left( \\int_{0}^{t} \\sin(\\tau)\\, d\\tau \\right) u(t)$$"
        },
        {
          title: "Evaluate Integral",
          content: "$$\\int_{0}^{t} \\sin(\\tau)\\, d\\tau = [-\\cos(\\tau)]_{0}^{t} = -\\cos(t) - (-\\cos(0)) = 1 - \\cos(t)$$\n$$y(t) = (1 - \\cos(t)) u(t)$$"
        }
      ]
    }
  },
  {
    topic: "Convolution",
    title: "Graphical Convolution Width Rule",
    question: "If a signal $x(t)$ has a non-zero duration of $W_1$ and $h(t)$ has a non-zero duration of $W_2$, what is the non-zero duration of the convolved signal $y(t) = x(t) * h(t)$?",
    options: [
      { text: "$W_1 + W_2$", is_correct: true },
      { text: "$\\max(W_1, W_2)$", is_correct: false },
      { text: "$|W_1 - W_2|$", is_correct: false },
      { text: "$W_1 \\times W_2$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain the Width Rule of Convolution",
          content: "Let $x(t)$ be non-zero in $[t_1, t_2]$ (width $W_1 = t_2 - t_1$).\nLet $h(t)$ be non-zero in $[\\tau_1, \\tau_2]$ (width $W_2 = \\tau_2 - \\tau_1$).\nTheir convolution $y(t)$ will be non-zero in $[t_1 + \\tau_1, t_2 + \\tau_2]$, which has a total width of:\n$$(t_2 + \\tau_2) - (t_1 + \\tau_1) = (t_2 - t_1) + (\\tau_2 - \\tau_1) = W_1 + W_2$$"
        }
      ]
    }
  },

  // Linear Systems (8)
  {
    topic: "Linear Systems",
    title: "LTI System Eigenfunctions",
    question: "For any continuous-time LTI system, complex exponential signals of the form $x(t) = e^{st}$ are considered 'eigenfunctions' of the system because:",
    options: [
      { text: "The output is a scaled version of the same complex exponential, $y(t) = H(s) e^{st}$", is_correct: true },
      { text: "They are the only signals that can pass through the system without attenuation", is_correct: false },
      { text: "They convert the system differential equations into algebraic equations", is_correct: false },
      { text: "They are periodic in nature", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Prove Eigenfunction Property",
          content: "Let $x(t) = e^{st}$ be input to LTI system $h(t)$:\n$$y(t) = \\int_{-\\infty}^{\\infty} h(\\tau) x(t-\\tau)\\, d\\tau = \\int_{-\\infty}^{\\infty} h(\\tau) e^{s(t-\\tau)}\\, d\\tau$$\n$$y(t) = e^{st} \\int_{-\\infty}^{\\infty} h(\\tau) e^{-s\\tau}\\, d\\tau = H(s) e^{st}$$\nSince the output is the input scaled by the eigenvalue $H(s)$, $e^{st}$ is an eigenfunction."
        }
      ]
    }
  },
  {
    topic: "Linear Systems",
    title: "Differential Equation Order",
    question: "A system is modeled by the differential equation $\\frac{d^3 y}{dt^3} + 4\\frac{d^2 y}{dt^2} + 5\\frac{dy}{dt} + 2y = 3\\frac{dx}{dt} + x$. What is the order of this system?",
    options: [
      { text: "3", is_correct: true },
      { text: "2", is_correct: false },
      { text: "1", is_correct: false },
      { text: "4", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify System Order",
          content: "The order of a linear system described by an ordinary differential equation is defined by the highest derivative of the output variable $y(t)$. Here, the highest derivative of $y(t)$ is the third derivative ($\\frac{d^3 y}{dt^3}$), making it a third-order system."
        }
      ]
    }
  },
  {
    topic: "Linear Systems",
    title: "Time-Invariance Test",
    question: "A system is defined by $y(t) = t x(t)$. Is this system time-invariant?",
    options: [
      { text: "No, because the system parameters change explicitly with time $t$", is_correct: true },
      { text: "Yes, because it is linear", is_correct: false },
      { text: "Yes, because it is memoryless", is_correct: false },
      { text: "No, because it has memory", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Test Time-Invariance",
          content: "Let $x_d(t) = x(t-t_0)$ be the delayed input. The output is:\n$$y_d(t) = t x_d(t) = t x(t-t_0)$$\nNow, delaying the original output by $t_0$ gives:\n$$y(t-t_0) = (t-t_0) x(t-t_0)$$\nSince $y_d(t) \\ne y(t-t_0)$ because of the coefficient $t$, the system is time-variant."
        }
      ]
    }
  },
  {
    topic: "Linear Systems",
    title: "Superposition Principle components",
    question: "The principle of superposition, which defines linear systems, is comprised of which two mathematical properties?",
    options: [
      { text: "Additivity and Homogeneity", is_correct: true },
      { text: "Causality and Stability", is_correct: false },
      { text: "Linearity and Time-Invariance", is_correct: false },
      { text: "Commutativity and Associativity", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Superposition",
          content: "Superposition requires:\n1. Additivity: $f(x_1 + x_2) = f(x_1) + f(x_2)$\n2. Homogeneity (Scaling): $f(a x) = a f(x)$\nCombined: $f(a x_1 + b x_2) = a f(x_1) + b f(x_2)$."
        }
      ]
    }
  },
  {
    topic: "Linear Systems",
    title: "Static vs Dynamic Systems",
    question: "A system is classified as 'static' (or memoryless) if its output at any instant $t_0$ depends:",
    options: [
      { text: "Only on the input at that same instant $t_0$", is_correct: true },
      { text: "Only on past inputs", is_correct: false },
      { text: "On both past and present inputs", is_correct: false },
      { text: "On the rate of change of the input", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Memoryless Systems",
          content: "A static/memoryless system requires no storage elements (like capacitors or inductors). Its output $y(t)$ is entirely determined by the current input $x(t)$. If it depends on any other time instant, it is a dynamic system (with memory)."
        }
      ]
    }
  },
  {
    topic: "Linear Systems",
    title: "Step Response from Impulse Response",
    question: "If $h(t)$ is the impulse response of an LTI system, how is its unit step response $s(t)$ calculated?",
    options: [
      { text: "$s(t) = \\int_{-\\infty}^{t} h(\\tau)\\, d\\tau$", is_correct: true },
      { text: "$s(t) = \\frac{dh(t)}{dt}$", is_correct: false },
      { text: "$s(t) = h(t) * \\delta(t)$", is_correct: false },
      { text: "$s(t) = \\int_{0}^{\\infty} h(\\tau)\\, d\\tau$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Relate Step and Impulse Responses",
          content: "The step response $s(t)$ is the convolution of impulse response $h(t)$ and step input $u(t)$:\n$$s(t) = h(t) * u(t) = \\int_{-\\infty}^{\\infty} h(\\tau) u(t - \\tau)\\, d\\tau$$\nSince $u(t-\\tau) = 1$ for $\\tau \\le t$:\n$$s(t) = \\int_{-\\infty}^{t} h(\\tau)\\, d\\tau$$"
        }
      ]
    }
  },
  {
    topic: "Linear Systems",
    title: "Distributive Property of LTI Systems",
    question: "The parallel interconnection of two LTI systems with impulse responses $h_1(t)$ and $h_2(t)$ is equivalent to a single LTI system with impulse response:",
    options: [
      { text: "$h_1(t) + h_2(t)$", is_correct: true },
      { text: "$h_1(t) * h_2(t)$", is_correct: false },
      { text: "$h_1(t) \\times h_2(t)$", is_correct: false },
      { text: "$h_1(t) - h_2(t)$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Parallel Connection",
          content: "For a parallel connection, the outputs of the two systems are summed:\n$$y(t) = y_1(t) + y_2(t) = x(t) * h_1(t) + x(t) * h_2(t)$$\nUsing the distributive property of convolution:\n$$y(t) = x(t) * (h_1(t) + h_2(t))$$\nSo the equivalent impulse response is $h_1(t) + h_2(t)$."
        }
      ]
    }
  },
  {
    topic: "Linear Systems",
    title: "Zero-State vs Zero-Input Response",
    question: "The complete response of a linear system is the sum of its zero-input response and zero-state response. What does the 'zero-state response' represent?",
    options: [
      { text: "The response of the system to an external input when all initial energy storage states are zero", is_correct: true },
      { text: "The response of the system to initial conditions with zero external input", is_correct: false },
      { text: "The steady-state response after all transient oscillations die out", is_correct: false },
      { text: "The response when the system is unstable", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Response Components",
          content: "Zero-Input Response (ZIR): Response due only to initial stored energy (initial conditions), with $x(t) = 0$.\nZero-State Response (ZSR): Response due only to the external input $x(t)$, with all initial conditions (capacitor voltages, inductor currents) set to zero."
        }
      ]
    }
  },

  // Time Response (9)
  {
    topic: "Time Response",
    title: "First-Order Time Constant and Settling Time",
    question: "A first-order system has a transfer function $H(s) = \\frac{1}{0.05s + 1}$. How long does it take for the step response to reach 98% of its final steady-state value? (Using the 2% settling criterion)",
    options: [
      { text: "0.20 seconds", is_correct: true },
      { text: "0.05 seconds", is_correct: false },
      { text: "0.15 seconds", is_correct: false },
      { text: "0.25 seconds", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Time Constant $\\tau$",
          content: "A standard first-order denominator is $\\tau s + 1$. Here, the time constant $\\tau$ is:\n$$\\tau = 0.05\\ \\text{seconds}$$"
        },
        {
          title: "Determine Settling Time",
          content: "Using the standard 2% settling criterion, the settling time $t_s$ for a first-order system is approximately:\n$$t_s \\approx 4\\tau$$\n$$t_s = 4 \\times 0.05 = 0.20\\ \\text{seconds}$$"
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Second-Order Rise Time",
    question: "For an underdamped second-order system, an increase in the damping ratio ($\\zeta$) while keeping the natural frequency ($\\omega_n$) constant will result in:",
    options: [
      { text: "An increased rise time and decreased peak overshoot", is_correct: true },
      { text: "A decreased rise time and increased peak overshoot", is_correct: false },
      { text: "An increased settling time and increased peak overshoot", is_correct: false },
      { text: "No change in rise time", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Damping Effects",
          content: "As $\\zeta$ increases (more damping):\n- Peak overshoot $M_p = e^{-\\pi\\zeta / \\sqrt{1-\\zeta^2}}$ decreases.\n- Rise time $t_r \\approx \\frac{\\pi - \\theta}{\\omega_d}$ increases (system responds more slowly/sluggishly)."
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Damping Classification of Characteristic Roots",
    question: "A system's characteristic poles are located at $s = -3 \\pm j4$. How is this system classified in terms of its damping?",
    options: [
      { text: "Underdamped", is_correct: true },
      { text: "Critically damped", is_correct: false },
      { text: "Overdamped", is_correct: false },
      { text: "Undamped", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Classify Damping States",
          content: "1. Distinct real negative roots ($s = -a, -b$): Overdamped ($\\zeta > 1$).\n2. Repeated real negative roots ($s = -a, -a$): Critically damped ($\\zeta = 1$).\n3. Complex conjugate roots with negative real parts ($s = -a \\pm jb$): Underdamped ($0 < \\zeta < 1$).\n4. Purely imaginary roots ($s = \\pm jb$): Undamped ($\\zeta = 0$)."
        },
        {
          title: "Identify State",
          content: "Since the poles are complex conjugates with negative real parts ($s = -3 \\pm j4$), the system is underdamped."
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Second-Order Peak Time Calculation",
    question: "An underdamped second-order system has natural frequency $\\omega_n = 10\\ \\text{rad/s}$ and damping ratio $\\zeta = 0.6$. What is the peak time ($t_p$) of its unit step response?",
    options: [
      { text: "0.393 seconds", is_correct: true },
      { text: "0.314 seconds", is_correct: false },
      { text: "0.524 seconds", is_correct: false },
      { text: "0.628 seconds", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Peak Time Formula",
          content: "The peak time $t_p$ is:\n$$t_p = \\frac{\\pi}{\\omega_d}$$"
        },
        {
          title: "Calculate Damped Natural Frequency $\\omega_d$",
          content: "$$\\omega_d = \\omega_n \\sqrt{1 - \\zeta^2}$$\n$$\\omega_d = 10 \\sqrt{1 - 0.6^2} = 10 \\sqrt{1 - 0.36} = 10 \\sqrt{0.64} = 8\\ \\text{rad/s}$$"
        },
        {
          title: "Calculate $t_p$",
          content: "$$t_p = \\frac{\\pi}{8} \\approx \\frac{3.14159}{8} \\approx 0.3927\\ \\text{seconds}$$"
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Second-Order Settling Time",
    question: "Using the 2% settling criterion, what is the settling time ($t_s$) of an underdamped second-order system with $\\omega_n = 5\\ \\text{rad/s}$ and damping ratio $\\zeta = 0.4$?",
    options: [
      { text: "2.0 seconds", is_correct: true },
      { text: "1.0 seconds", is_correct: false },
      { text: "4.0 seconds", is_correct: false },
      { text: "0.5 seconds", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Settling Time Equation",
          content: "For a second-order system, the 2% settling time is:\n$$t_s \\approx \\frac{4}{\\zeta \\omega_n}$$"
        },
        {
          title: "Substitute Given Values",
          content: "Given $\\omega_n = 5\\ \\text{rad/s}$ and $\\zeta = 0.4$:\n$$\\zeta \\omega_n = 0.4 \\times 5 = 2.0\\ \\text{rad/s}$$"
        },
        {
          title: "Calculate $t_s$",
          content: "$$t_s = \\frac{4}{2.0} = 2.0\\ \\text{seconds}$$"
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Steady-State Error of Type 0 System",
    question: "A unity feedback system has an open-loop transfer function $G(s) = \\frac{10}{(s+2)(s+5)}$. What is the steady-state error ($e_{ss}$) of the closed-loop system for a unit step input?",
    options: [
      { text: "0.50", is_correct: true },
      { text: "0.09", is_correct: false },
      { text: "0.00", is_correct: false },
      { text: "1.00", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify System Type",
          content: "The open-loop transfer function has no poles at $s=0$ (no pure integrations). Thus, this is a Type 0 system."
        },
        {
          title: "Calculate Position Error Constant $K_p$",
          content: "$$K_p = \\lim_{s \\to 0} G(s) = \\lim_{s \\to 0} \\frac{10}{(s+2)(s+5)} = \\frac{10}{2 \\times 5} = 1$$"
        },
        {
          title: "Calculate Steady-State Error",
          content: "$$e_{ss} = \\frac{1}{1 + K_p} = \\frac{1}{1 + 1} = 0.50$$"
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Steady-State Error of Type 1 System",
    question: "A unity negative feedback system has open-loop transfer function $G(s) = \\frac{K}{s(s+4)}$. What is the steady-state error ($e_{ss}$) to a unit ramp input $r(t) = t u(t)$?",
    options: [
      { text: "$\\frac{4}{K}$", is_correct: true },
      { text: "0", is_correct: false },
      { text: "$\\frac{K}{4}$", is_correct: false },
      { text: "Infinity", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify System Type",
          content: "The system has one integrator ($s$ in denominator), which means it is a Type 1 system."
        },
        {
          title: "Calculate Velocity Error Constant $K_v$",
          content: "$$K_v = \\lim_{s \\to 0} s G(s) = \\lim_{s \\to 0} s \\frac{K}{s(s+4)} = \\frac{K}{4}$$"
        },
        {
          title: "Calculate Steady-State Error",
          content: "For a Type 1 system subjected to a ramp input:\n$$e_{ss} = \\frac{1}{K_v} = \\frac{1}{K/4} = \\frac{4}{K}$$"
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Rise Time of First-Order System",
    question: "For a first-order system with time constant $\\tau$, how long does it take for the output to rise from 10% to 90% of its final value in response to a step input?",
    options: [
      { text: "$2.2\\tau$", is_correct: true },
      { text: "$1.0\\tau$", is_correct: false },
      { text: "$3.0\\tau$", is_correct: false },
      { text: "$4.0\\tau$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Formulate Step Response",
          content: "The step response is:\n$$y(t) = V_0(1 - e^{-t/\\tau})$$"
        },
        {
          title: "Find Time to reach 10%",
          content: "$$0.1 = 1 - e^{-t_1/\\tau} \\implies e^{-t_1/\\tau} = 0.9 \\implies t_1 = -\\tau \\ln(0.9) \\approx 0.105\\tau$$"
        },
        {
          title: "Find Time to reach 90%",
          content: "$$0.9 = 1 - e^{-t_2/\\tau} \\implies e^{-t_2/\\tau} = 0.1 \\implies t_2 = -\\tau \\ln(0.1) \\approx 2.303\\tau$$"
        },
        {
          title: "Calculate Rise Time",
          content: "$$t_r = t_2 - t_1 = 2.303\\tau - 0.105\\tau = 2.198\\tau \\approx 2.2\\tau$$"
        }
      ]
    }
  },
  {
    topic: "Time Response",
    title: "Critically Damped Settling Time",
    question: "A critically damped second-order system has repeated characteristic poles at $s = -p$. What is its unit step response $y(t)$ for $t \\ge 0$ under zero initial conditions?",
    options: [
      { text: "$1 - e^{-pt}(1 + pt)$", is_correct: true },
      { text: "$1 - e^{-pt}$", is_correct: false },
      { text: "$1 - e^{-pt}\\cos(pt)$", is_correct: false },
      { text: "$t e^{-pt}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Write Transfer Function",
          content: "For repeated poles at $-p$, the closed loop transfer function is:\n$$T(s) = \\frac{p^2}{(s+p)^2}$$"
        },
        {
          title: "Find Output Laplace Transform",
          content: "For step input $R(s) = 1/s$:\n$$Y(s) = \\frac{p^2}{s(s+p)^2} = \\frac{1}{s} - \\frac{1}{s+p} - \\frac{p}{(s+p)^2}$$"
        },
        {
          title: "Take Inverse Laplace Transform",
          content: "$$y(t) = \\left( 1 - e^{-pt} - p t e^{-pt} \\right) u(t) = \\left( 1 - e^{-pt}(1 + pt) \\right) u(t)$$"
        }
      ]
    }
  }
];

// Perform answer rotation to ensure balanced options
const linearSystemsRotated = rotateAnswers(linearSystemsNew, 0);

// Merge
questionsObj["linear-systems"] = [...(questionsObj["linear-systems"] || []), ...linearSystemsRotated];

// Save back to questions.js
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefix = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefix + 'const QUESTIONS = ' + updatedJson + ';', 'utf8');

console.log("Successfully added 80 questions in Part F.");
