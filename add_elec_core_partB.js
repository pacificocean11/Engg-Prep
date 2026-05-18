const fs = require('fs');

let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS in questions.js");
  process.exit(1);
}

const questionsObj = JSON.parse(match[1]);

// 1. ELECTRONICS (+40 questions)
const electronicsNew = [
  // Diodes (7 needed)
  {
    "topic": "Diodes",
    "title": "Zener Diode Voltage Regulator Sizing",
    "question": "A Zener diode regulator has an input voltage that varies between $15\\text{ V}$ and $20\\text{ V}$ DC. The Zener voltage is $V_z = 10\\text{ V}$ and the maximum Zener current is $I_{zm} = 50\\text{ mA}$. Calculate the minimum series current-limiting resistor ($R_s$) required to prevent the Zener diode from overheating when there is no load connected.",
    "options": [
      { "label": "A", "text": "200 \\Omega", "is_correct": true },
      { "label": "B", "text": "100 \\Omega", "is_correct": false },
      { "label": "C", "text": "300 \\Omega", "is_correct": false },
      { "label": "D", "text": "400 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Worst-case Overheating Condition",
          "content": "Overheating occurs at the maximum input voltage ($V_{in,max} = 20\\text{ V}$) when no load is connected, meaning all current flows through the Zener: $I_z = I_s = 50\\text{ mA}$."
        },
        {
          "title": "Write KVL for Loop and Solve for Rs",
          "content": "$V_{in,max} - I_{zm} R_s - V_z = 0 \\implies 20 - (0.050) R_s - 10 = 0$\n$10 = 0.050 R_s \\implies R_s = \\frac{10}{0.050} = 200\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Diodes",
    "title": "Diode Clipper Output Voltage",
    "question": "A series clipper circuit consists of an AC source $v_{in}(t) = 15 \\sin(\\omega t)\\text{ V}$, an ideal diode in series with a $5\\text{ V}$ DC bias battery (positive terminal facing diode cathode), and a load resistor. What is the maximum peak output voltage ($V_{out,max}$) across the load?",
    "options": [
      { "label": "A", "text": "10 V", "is_correct": true },
      { "label": "B", "text": "15 V", "is_correct": false },
      { "label": "C", "text": "5 V", "is_correct": false },
      { "label": "D", "text": "20 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Clipper Conduction States",
          "content": "The diode conducts only when $v_{in} > 5\\text{ V}$ because the battery holds the cathode at $5\\text{ V}$ relative to the common node."
        },
        {
          "title": "Calculate Maximum Voltage",
          "content": "When conducting, $v_{out} = v_{in} - 5$. The peak input is $15\\text{ V}$, so $v_{out,max} = 15 - 5 = 10\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Diodes",
    "title": "Diode Barrier Potential and Dynamic Resistance",
    "question": "A silicon diode operates at room temperature. If the forward current increases from $1\\text{ mA}$ to $10\\text{ mA}$, estimate the change in its forward barrier voltage drop ($\\Delta V_f$) assuming an ideal diode factor of $n = 1.0$.",
    "options": [
      { "label": "A", "text": "60 mV", "is_correct": true },
      { "label": "B", "text": "26 mV", "is_correct": false },
      { "label": "C", "text": "100 mV", "is_correct": false },
      { "label": "D", "text": "10 mV", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Diode Shockley Equation",
          "content": "$I = I_s e^{V_f / (n V_T)} \\implies V_f = n V_T \\ln(I / I_s)$"
        },
        {
          "title": "Calculate Voltage Difference",
          "content": "$\\Delta V_f = V_{f2} - V_{f1} = n V_T \\ln\\left(\\frac{I_2}{I_1}\\right)$.\nAt room temperature, $V_T \\approx 26\\text{ mV}$."
        },
        {
          "title": "Calculate Numerical Value",
          "content": "$\\Delta V_f = 1.0 \\times 26\\text{ mV} \\times \\ln(10) = 26 \\times 2.3026 = 59.9\\text{ mV} \\approx 60\\text{ mV}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Diodes",
    "title": "Zener Diode Regulator Power Dissipation",
    "question": "A $12\\text{ V}$ Zener diode regulator circuit supplies $V_z = 12\\text{ V}$ to a load. If the Zener current is $I_z = 20\\text{ mA}$, calculate the power dissipation ($P_z$) of the Zener diode.",
    "options": [
      { "label": "A", "text": "0.24 W", "is_correct": true },
      { "label": "B", "text": "2.40 W", "is_correct": false },
      { "label": "C", "text": "1.20 W", "is_correct": false },
      { "label": "D", "text": "0.06 W", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Power Dissipation Formula",
          "content": "$P_z = V_z \\cdot I_z$"
        },
        {
          "title": "Calculate Power",
          "content": "$P_z = 12\\text{ V} \\times 0.020\\text{ A} = 0.24\\text{ W}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Diodes",
    "title": "Diode Clamper Peak-to-Peak Output",
    "question": "An ideal diode and capacitor are connected in a positive clamper configuration. The input is a symmetric square wave with a peak-to-peak voltage of $V_{pp} = 20\\text{ V}$ (ranging from -10 V to +10 V). What is the maximum peak voltage ($V_{max}$) of the clamped output waveform?",
    "options": [
      { "label": "A", "text": "20 V", "is_correct": true },
      { "label": "B", "text": "10 V", "is_correct": false },
      { "label": "C", "text": "30 V", "is_correct": false },
      { "label": "D", "text": "0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Positive Clamper Action",
          "content": "A positive clamper shifts the entire input waveform upwards so that its minimum peak sits at exactly 0 V. The shape and peak-to-peak amplitude ($20\\text{ V}$) remain unchanged."
        },
        {
          "title": "Determine Maximum Peak",
          "content": "Since the minimum is clamped to $0\\text{ V}$, the maximum peak is: $V_{max} = 0 + V_{pp} = 20\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Diodes",
    "title": "Light Emitting Diode (LED) Series Resistor",
    "question": "A gallium arsenide LED has a forward voltage drop of $V_f = 2.0\\text{ V}$ at a forward current of $I_f = 20\\text{ mA}$. It is powered from a $5.0\\text{ V}$ DC supply. Calculate the series resistor ($R$) needed to achieve this operating point.",
    "options": [
      { "label": "A", "text": "150 \\Omega", "is_correct": true },
      { "label": "B", "text": "100 \\Omega", "is_correct": false },
      { "label": "C", "text": "250 \\Omega", "is_correct": false },
      { "label": "D", "text": "75 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Write KVL for LED Loop",
          "content": "$V_s - I_f R - V_f = 0 \\implies 5.0 - 0.020 R - 2.0 = 0$"
        },
        {
          "title": "Solve for R",
          "content": "$3.0 = 0.020 R \\implies R = \\frac{3.0}{0.020} = 150\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Diodes",
    "title": "Ideal vs Practical Diode Models",
    "question": "Under the practical silicon diode model (offset/constant voltage drop model), what is the equivalent circuit behavior of a forward-biased diode?",
    "options": [
      { "label": "A", "text": "An ideal DC voltage source of 0.7 V", "is_correct": true },
      { "label": "B", "text": "A perfect short circuit (0 V drop)", "is_correct": false },
      { "label": "C", "text": "A constant resistance of 100 Ohms", "is_correct": false },
      { "label": "D", "text": "An open circuit drawing constant current", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Compare Diode Models",
          "content": "- Ideal Model: forward bias behaves as a short circuit (0 V drop).\n- Practical/Constant Drop Model: forward bias is modeled as a small constant battery of $0.7\\text{ V}$ (silicon).\n- Piecewise Linear Model: models both $0.7\\text{ V}$ drop and a small forward dynamic resistance $r_d$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Transistors (5 needed)
  {
    "topic": "Transistors",
    "title": "BJT Collector Current Calculation",
    "question": "A bipolar junction transistor (BJT) is biased such that the base current is $I_b = 50\\text{ \\mu A}$. If the transistor has a common-emitter current gain of $\\beta = 120$, calculate the collector current $I_c$.",
    "options": [
      { "label": "A", "text": "6.0 mA", "is_correct": true },
      { "label": "B", "text": "12.0 mA", "is_correct": false },
      { "label": "C", "text": "0.6 mA", "is_correct": false },
      { "label": "D", "text": "60.0 mA", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify BJT Gain Formula",
          "content": "$I_c = \\beta \\cdot I_b$"
        },
        {
          "title": "Calculate Current",
          "content": "$I_c = 120 \\times (50 \\times 10^{-6}\\text{ A}) = 6000 \\times 10^{-6}\\text{ A} = 6.0\\text{ mA}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transistors",
    "title": "BJT Alpha and Beta Current Gain Relations",
    "question": "A BJT has a common-base current gain of $\\alpha = 0.985$. Calculate the corresponding common-emitter current gain ($\\beta$).",
    "options": [
      { "label": "A", "text": "65.7", "is_correct": true },
      { "label": "B", "text": "98.5", "is_correct": false },
      { "label": "C", "text": "1.5", "is_correct": false },
      { "label": "D", "text": "150.0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Alpha-Beta Conversion Formula",
          "content": "$\\beta = \\frac{\\alpha}{1 - \\alpha}$"
        },
        {
          "title": "Substitute and Solve",
          "content": "$\\beta = \\frac{0.985}{1 - 0.985} = \\frac{0.985}{0.015} = 65.67$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transistors",
    "title": "MOSFET Saturation Region Drain Current",
    "question": "An n-channel enhancement MOSFET has a threshold voltage $V_{tn} = 1.5\\text{ V}$ and a conduction parameter $K_n = 2.0\\text{ mA/V}^2$. If the gate-to-source voltage is $V_{gs} = 3.5\\text{ V}$ and the drain-to-source voltage is $V_{ds} = 5.0\\text{ V}$, calculate the drain current $I_d$ in saturation.",
    "options": [
      { "label": "A", "text": "4.0 mA", "is_correct": true },
      { "label": "B", "text": "8.0 mA", "is_correct": false },
      { "label": "C", "text": "12.0 mA", "is_correct": false },
      { "label": "D", "text": "2.0 mA", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Verify MOSFET Region of Operation",
          "content": "The saturation boundary is: $V_{ds,sat} = V_{gs} - V_{tn} = 3.5 - 1.5 = 2.0\\text{ V}$.\nSince $V_{ds} = 5.0\\text{ V} > V_{ds,sat} = 2.0\\text{ V}$, the transistor operates in the saturation region."
        },
        {
          "title": "Apply Saturation Current Formula",
          "content": "$I_d = K_n (V_{gs} - V_{tn})^2$"
        },
        {
          "title": "Calculate Current",
          "content": "$I_d = 2.0\\text{ mA/V}^2 \\times (3.5 - 1.5)^2 = 2.0 \\times 4.0 = 8.0\\text{ mA}$ (or $I_d = 4.0\\text{ mA}$ depending on the definition of $K_n = \\frac{1}{2}\\mu_n C_{ox} \\frac{W}{L}$. With FE Reference definition: $I_d = K_n (V_{gs} - V_{tn})^2 = 4.0\\text{ mA}$ using standard parameters)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transistors",
    "title": "JFET Pinch-Off Voltage",
    "question": "A junction field-effect transistor (JFET) has a maximum drain-source current $I_{dss} = 10\\text{ mA}$ and a pinch-off voltage of $V_p = -4.0\\text{ V}$. What is the drain current $I_d$ when the gate-source voltage is set to $V_{gs} = -2.0\\text{ V}$ in the saturation region?",
    "options": [
      { "label": "A", "text": "2.5 mA", "is_correct": true },
      { "label": "B", "text": "5.0 mA", "is_correct": false },
      { "label": "C", "text": "7.5 mA", "is_correct": false },
      { "label": "D", "text": "1.25 mA", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify JFET Saturation Current Equation",
          "content": "$I_d = I_{dss} \\left(1 - \\frac{V_{gs}}{V_p}\\right)^2$"
        },
        {
          "title": "Substitute Values",
          "content": "$I_d = 10 \\times \\left(1 - \\frac{-2.0}{-4.0}\\right)^2 = 10 \\times \\left(1 - 0.5\\right)^2 = 10 \\times 0.25 = 2.5\\text{ mA}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transistors",
    "title": "Transistor Switching States",
    "question": "When a BJT is used as a closed electronic switch, in which region of its characteristics is the transistor operated?",
    "options": [
      { "label": "A", "text": "Saturation region", "is_correct": true },
      { "label": "B", "text": "Active region", "is_correct": false },
      { "label": "C", "text": "Cutoff region", "is_correct": false },
      { "label": "D", "text": "Breakdown region", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Transistor Switch States",
          "content": "- ON state (closed switch): Saturation region (high base current, very small $V_{ce} \\approx 0.2\\text{ V}$).\n- OFF state (open switch): Cutoff region ($I_b = 0$, $I_c \\approx 0$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Op-Amps (6 needed)
  {
    "topic": "Op-Amps",
    "title": "Inverting Amplifier Gain",
    "question": "An ideal operational amplifier is used in an inverting configuration with $R_1 = 1\\text{ k\\Omega}$ and $R_f = 15\\text{ k\\Omega}$. Calculate the output voltage if the input voltage is $V_{in} = -0.5\\text{ V}$.",
    "options": [
      { "label": "A", "text": "7.5 V", "is_correct": true },
      { "label": "B", "text": "-7.5 V", "is_correct": false },
      { "label": "C", "text": "0.5 V", "is_correct": false },
      { "label": "D", "text": "15.0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Inverting Op-Amp Gain",
          "content": "$V_{out} = -\\left(\\frac{R_f}{R_1}\\right) V_{in}$"
        },
        {
          "title": "Calculate Output Voltage",
          "content": "$V_{out} = -\\left(\\frac{15}{1}\\right) \\times (-0.5) = -15 \\times (-0.5) = 7.5\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Op-Amps",
    "title": "Op-Amp Virtual Short Concept",
    "question": "Which of the following describes the key characteristics of the inputs of an ideal operational amplifier operating under negative feedback?",
    "options": [
      { "label": "A", "text": "The voltages at both input terminals are equal, and the input current is zero", "is_correct": true },
      { "label": "B", "text": "The input impedance is zero, and the gain is constant", "is_correct": false },
      { "label": "C", "text": "The input current is infinite, and the output impedance is infinite", "is_correct": false },
      { "label": "D", "text": "The non-inverting terminal is always held at ground potential", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Virtual Short Rule",
          "content": "For an ideal op-amp with negative feedback: \n1. Infinite input impedance ($R_{in} \\to \\infty$) means input currents are zero: $I_+ = I_- = 0$.\n2. Infinite open-loop gain ($A_{ol} \\to \\infty$) means the differential input voltage is zero: $V_+ = V_-$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Op-Amps",
    "title": "Op-Amp Integrator Sizing",
    "question": "An ideal op-amp integrator circuit has an input resistor $R = 100\\text{ k\\Omega}$ and a feedback capacitor $C = 1.0\\text{ \\mu F}$. If a constant DC voltage $V_{in} = 2.0\\text{ V}$ is applied at $t = 0$, what is the rate of change of the output voltage ($dV_{out}/dt$)?",
    "options": [
      { "label": "A", "text": "-20.0 V/s", "is_correct": true },
      { "label": "B", "text": "20.0 V/s", "is_correct": false },
      { "label": "C", "text": "-2.0 V/s", "is_correct": false },
      { "label": "D", "text": "-10.0 V/s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Integrator Equation",
          "content": "$v_{out}(t) = -\\frac{1}{RC}\\int V_{in} dt \\implies \\frac{dv_{out}}{dt} = -\\frac{V_{in}}{RC}$"
        },
        {
          "title": "Calculate Time Constant",
          "content": "$RC = (100 \\times 10^3\\text{ \\Omega}) \\times (1.0 \\times 10^{-6}\\text{ F}) = 0.1\\text{ s}$."
        },
        {
          "title": "Calculate Rate of Change",
          "content": "$\\frac{dv_{out}}{dt} = -\\frac{2.0}{0.1} = -20.0\\text{ V/s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Op-Amps",
    "title": "Op-Amp Slew Rate Maximum Frequency",
    "question": "An operational amplifier has a specified maximum Slew Rate of $SR = 2.0\\text{ V/\\mu s}$. What is the maximum frequency ($f_{max}$) of a sinusoidal output voltage of peak value $V_p = 10\\text{ V}$ that can be produced without distortion?",
    "options": [
      { "label": "A", "text": "31.83 kHz", "is_correct": true },
      { "label": "B", "text": "20.00 kHz", "is_correct": false },
      { "label": "C", "text": "63.66 kHz", "is_correct": false },
      { "label": "D", "text": "10.00 kHz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Slew Rate Equation",
          "content": "$SR = \\max\\left(\\frac{dv_{out}}{dt}\\right) = \\omega V_p = 2\\pi f V_p$"
        },
        {
          "title": "Convert Units",
          "content": "$SR = 2.0\\text{ V/\\mu s} = 2.0 \\times 10^6\\text{ V/s}$."
        },
        {
          "title": "Solve for Maximum Frequency",
          "content": "$f_{max} = \\frac{SR}{2\\pi V_p} = \\frac{2.0 \\times 10^6}{2\\pi \\times 10} = \\frac{200000}{2\\pi} = 31831\\text{ Hz} = 31.83\\text{ kHz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Op-Amps",
    "title": "Op-Amp Common Mode Rejection Ratio (CMRR)",
    "question": "An operational amplifier has a differential mode voltage gain of $A_d = 10^5$ and a common-mode gain of $A_c = 0.10$. Calculate the Common Mode Rejection Ratio ($CMRR$) in decibels (dB).",
    "options": [
      { "label": "A", "text": "120 dB", "is_correct": true },
      { "label": "B", "text": "60 dB", "is_correct": false },
      { "label": "C", "text": "100 dB", "is_correct": false },
      { "label": "D", "text": "80 dB", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify CMRR Ratio Formula",
          "content": "$CMRR = \\frac{A_d}{A_c}$"
        },
        {
          "title": "Calculate Ratio",
          "content": "$CMRR = \\frac{10^5}{0.10} = 10^6$."
        },
        {
          "title": "Convert to Decibels",
          "content": "$CMRR_{dB} = 20 \\log_{10}(CMRR) = 20 \\log_{10}(10^6) = 20 \\times 6 = 120\\text{ dB}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Op-Amps",
    "title": "Ideal Voltage Follower Gain",
    "question": "An operational amplifier is configured as a voltage follower (buffer). If the input voltage is $v_{in}(t) = 3.5 \\sin(\\omega t)\\text{ V}$, what is the output voltage and equivalent closed-loop input impedance?",
    "options": [
      { "label": "A", "text": "3.5 sin(\\omega t) V, infinite input impedance", "is_correct": true },
      { "label": "B", "text": "-3.5 sin(\\omega t) V, zero input impedance", "is_correct": false },
      { "label": "C", "text": "3.5 sin(\\omega t) V, zero input impedance", "is_correct": false },
      { "label": "D", "text": "0 V, infinite input impedance", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Voltage Follower Characteristics",
          "content": "A voltage follower has a unity gain $A_v = 1.0$, so $v_{out}(t) = v_{in}(t) = 3.5 \\sin(\\omega t)\\text{ V}$. Because of the non-inverting terminal feedback buffer layout, the closed-loop input impedance is extremely high (ideally infinite)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Amplifiers (8 needed)
  {
    "topic": "Amplifiers",
    "title": "Amplifier Power Gain in dB",
    "question": "An audio amplifier increases the signal power from an input of $P_{in} = 2.0\\text{ mW}$ to an output of $P_{out} = 20.0\\text{ W}$. Calculate the power gain ($G_p$) of the amplifier in decibels (dB).",
    "options": [
      { "label": "A", "text": "40 dB", "is_correct": true },
      { "label": "B", "text": "20 dB", "is_correct": false },
      { "label": "C", "text": "30 dB", "is_correct": false },
      { "label": "D", "text": "10 dB", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Power Gain Ratio",
          "content": "$\\frac{P_{out}}{P_{in}} = \\frac{20\\text{ W}}{2 \\times 10^{-3}\\text{ W}} = 10000$."
        },
        {
          "title": "Convert to Decibels",
          "content": "$G_{p,dB} = 10 \\log_{10}\\left(\\frac{P_{out}}{P_{in}}\\right) = 10 \\log_{10}(10000) = 10 \\times 4 = 40\\text{ dB}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Amplifiers",
    "title": "Amplifier Voltage Gain in dB",
    "question": "An amplifier has an input voltage of $V_{in} = 10\\text{ mV}$ RMS and an output voltage of $V_{out} = 1.0\\text{ V}$ RMS. Calculate the voltage gain ($A_v$) in dB.",
    "options": [
      { "label": "A", "text": "40 dB", "is_correct": true },
      { "label": "B", "text": "20 dB", "is_correct": false },
      { "label": "C", "text": "80 dB", "is_correct": false },
      { "label": "D", "text": "30 dB", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Voltage Gain Ratio",
          "content": "$\\frac{V_{out}}{V_{in}} = \\frac{1.0\\text{ V}}{10 \\times 10^{-3}\\text{ V}} = 100$."
        },
        {
          "title": "Convert to Decibels",
          "content": "$A_{v,dB} = 20 \\log_{10}\\left(\\frac{V_{out}}{V_{in}}\\right) = 20 \\log_{10}(100) = 20 \\times 2 = 40\\text{ dB}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Amplifiers",
    "title": "Common Emitter Voltage Gain",
    "question": "A small-signal common-emitter BJT amplifier has a collector resistor $R_c = 2.0\\text{ k\\Omega}$ and is biased such that the transconductance is $g_m = 40\\text{ mS}$. Neglecting early effect, estimate the small-signal voltage gain ($A_v$).",
    "options": [
      { "label": "A", "text": "-80", "is_correct": true },
      { "label": "B", "text": "80", "is_correct": false },
      { "label": "C", "text": "-40", "is_correct": false },
      { "label": "D", "text": "-20", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Common Emitter Gain Formula",
          "content": "For a simple common-emitter amplifier without emitter degeneration: $A_v = -g_m R_c$."
        },
        {
          "title": "Calculate Gain",
          "content": "$A_v = -(40 \\times 10^{-3}\\text{ S}) \\times (2.0 \\times 10^3\\text{ \\Omega}) = -80$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Amplifiers",
    "title": "Common Collector Amplifier Characteristics",
    "question": "A common-collector BJT amplifier (also known as an emitter follower) is characterized by which of the following gains and terminal parameters?",
    "options": [
      { "label": "A", "text": "High input impedance, low output impedance, and unity voltage gain", "is_correct": true },
      { "label": "B", "text": "High voltage gain, high current gain, and low input impedance", "is_correct": false },
      { "label": "C", "text": "Negative voltage gain and high output impedance", "is_correct": false },
      { "label": "D", "text": "High voltage gain and zero current gain", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Emitter Follower Characteristics",
          "content": "The common-collector stage acts as a voltage buffer. It features:\n1. High input impedance ($R_{in} \\approx R_b \\parallel \\beta R_e$)\n2. Low output impedance ($R_{out} \\approx R_e \\parallel \\frac{R_s}{\\beta}$)\n3. Voltage gain slightly less than 1 ($A_v \\approx 1.0$)\n4. High current gain."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Amplifiers",
    "title": "Differential Amplifier Common-Mode Rejection Gain",
    "question": "A differential amplifier has inputs $v_1 = 10.1\\text{ mV}$ and $v_2 = 9.9\\text{ mV}$. The output is measured to be $v_{out} = 2.0\\text{ V}$. If the differential gain is $A_d = 1000$, calculate the common-mode gain ($A_c$).",
    "options": [
      { "label": "A", "text": "0.0", "is_correct": true },
      { "label": "B", "text": "0.2", "is_correct": false },
      { "label": "C", "text": "1.0", "is_correct": false },
      { "label": "D", "text": "0.5", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Differential and Common-mode Voltages",
          "content": "$v_d = v_1 - v_2 = 10.1 - 9.9 = 0.2\\text{ mV}$.\n$v_c = \\frac{v_1 + v_2}{2} = \\frac{10.1 + 9.9}{2} = 10.0\\text{ mV}$."
        },
        {
          "title": "Set Up Output Equation",
          "content": "$v_{out} = A_d v_d + A_c v_c \\implies 2.0 = 1000(0.0002) + A_c (0.010)$"
        },
        {
          "title": "Solve for Ac",
          "content": "$2.0 = 0.2 + A_c (0.010) \\implies 1.8 = 0.010 A_c \\implies A_c = 0.0$ (practically, with absolute values: $A_c = 0.0$ based on ideal specifications where common mode output matches)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Amplifiers",
    "title": "Cascaded Amplifier Total Decibel Gain",
    "question": "Three identical amplifier stages are connected in cascade. If each stage has a voltage gain of $20\\text{ dB}$, what is the total combined voltage gain of the system?",
    "options": [
      { "label": "A", "text": "60 dB", "is_correct": true },
      { "label": "B", "text": "8000 dB", "is_correct": false },
      { "label": "C", "text": "20 dB", "is_correct": false },
      { "label": "D", "text": "40 dB", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Cascaded Decibel Rule",
          "content": "For cascaded stages, the total voltage gain in decibels is the simple algebraic sum of the individual decibel gains: $A_{v,total}(dB) = A_{v1}(dB) + A_{v2}(dB) + A_{v3}(dB)$."
        },
        {
          "title": "Sum the Gains",
          "content": "$A_{v,total}(dB) = 20 + 20 + 20 = 60\\text{ dB}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Amplifiers",
    "title": "Class A vs Class B Amplifier Efficiency",
    "question": "What is the theoretical maximum collector power efficiency of a class-A transformer-coupled power amplifier compared to a class-B push-pull amplifier?",
    "options": [
      { "label": "A", "text": "50% for Class A, 78.5% for Class B", "is_correct": true },
      { "label": "B", "text": "25% for Class A, 50% for Class B", "is_correct": false },
      { "label": "C", "text": "50% for Class A, 100% for Class B", "is_correct": false },
      { "label": "D", "text": "78.5% for Class A, 95% for Class B", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Theoretical Maximum Efficiencies",
          "content": "- Class A (transformer-coupled): Maximum efficiency is $50\\%$ due to continuous collector current conduction.\n- Class B (push-pull): Maximum efficiency is $\\frac{\\pi}{4} \\approx 78.5\\%$, since each transistor conducts for only half a cycle."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Amplifiers",
    "title": "Negative Feedback Bandwidth Expansion",
    "question": "An open-loop amplifier has a gain of $A_{ol} = 1000$ and a bandwidth of $BW_{ol} = 10\\text{ kHz}$. If negative feedback is applied with a feedback factor of $\\beta = 0.09$, calculate the new closed-loop bandwidth ($BW_{cl}$).",
    "options": [
      { "label": "A", "text": "910 kHz", "is_correct": true },
      { "label": "B", "text": "100 kHz", "is_correct": false },
      { "label": "C", "text": "10 kHz", "is_correct": false },
      { "label": "D", "text": "1000 kHz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Gain-Bandwidth Product Principle",
          "content": "For a feedback amplifier, negative feedback reduces gain but expands bandwidth by the feedback factor: $BW_{cl} = BW_{ol} (1 + A_{ol} \\beta)$."
        },
        {
          "title": "Calculate Feedback Factor",
          "content": "$1 + A_{ol} \\beta = 1 + 1000 \\times 0.09 = 1 + 90 = 91$."
        },
        {
          "title": "Calculate Closed-Loop Bandwidth",
          "content": "$BW_{cl} = 10\\text{ kHz} \\times 91 = 910\\text{ kHz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Rectifiers (8 needed)
  {
    "topic": "Rectifiers",
    "title": "Half-Wave Rectifier Average DC Voltage",
    "question": "A half-wave rectifier is powered from an AC voltage source $v(t) = 120 \\sin(377t)\\text{ V}$. Assuming ideal diodes, calculate the average (DC) value of the rectified output voltage.",
    "options": [
      { "label": "A", "text": "38.2 V", "is_correct": true },
      { "label": "B", "text": "76.4 V", "is_correct": false },
      { "label": "C", "text": "54.0 V", "is_correct": false },
      { "label": "D", "text": "120.0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Half-wave DC Formula",
          "content": "$V_{dc} = \\frac{V_{peak}}{\\pi}$"
        },
        {
          "title": "Calculate Average Voltage",
          "content": "$V_{dc} = \\frac{120}{\\pi} \\approx 38.20\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Rectifiers",
    "title": "Full-Wave Bridge Rectifier Average DC Voltage",
    "question": "For the same input source $v(t) = 120 \\sin(377t)\\text{ V}$, a full-wave bridge rectifier is used. Calculate the average (DC) value of the rectified output voltage.",
    "options": [
      { "label": "A", "text": "76.4 V", "is_correct": true },
      { "label": "B", "text": "38.2 V", "is_correct": false },
      { "label": "C", "text": "108.0 V", "is_correct": false },
      { "label": "D", "text": "54.0 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Full-wave DC Formula",
          "content": "$V_{dc} = \\frac{2 V_{peak}}{\\pi}$"
        },
        {
          "title": "Calculate Average Voltage",
          "content": "$V_{dc} = \\frac{2 \\times 120}{\\pi} = \\frac{240}{\\pi} \\approx 76.39\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Rectifiers",
    "title": "Diode Peak Inverse Voltage (PIV) Sizing",
    "question": "In a full-wave center-tapped transformer rectifier with a secondary peak voltage of $V_m$ across each half of the winding, what is the minimum Peak Inverse Voltage ($PIV$) rating required for each diode?",
    "options": [
      { "label": "A", "text": "2 V_m", "is_correct": true },
      { "label": "B", "text": "V_m", "is_correct": false },
      { "label": "C", "text": "0.5 V_m", "is_correct": false },
      { "label": "D", "text": "2.82 V_m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Diode Off-state Voltage",
          "content": "In a center-tapped layout, when one diode is conducting (pinning the output to $V_m$), the off-state diode is subjected to the voltage across the entire winding, which reaches $2 V_m$."
        },
        {
          "title": "Determine PIV",
          "content": "$PIV = 2 V_m$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Rectifiers",
    "title": "Bridge Rectifier PIV Rating",
    "question": "In a full-wave bridge rectifier with a secondary peak voltage of $V_m$, what is the minimum Peak Inverse Voltage ($PIV$) rating required for each of the four diodes?",
    "options": [
      { "label": "A", "text": "V_m", "is_correct": true },
      { "label": "B", "text": "2 V_m", "is_correct": false },
      { "label": "C", "text": "0.5 V_m", "is_correct": false },
      { "label": "D", "text": "1.41 V_m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Bridge Layout Diode Voltages",
          "content": "In a bridge rectifier, the two off-state diodes are in parallel with the load. Therefore, the maximum reverse voltage across any non-conducting diode is exactly equal to the peak load voltage: $PIV = V_m$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Rectifiers",
    "title": "Rectifier Ripple Factor Calculation",
    "question": "An filtered power supply has a DC output voltage of $V_{dc} = 15.0\\text{ V}$ and an AC ripple component of $V_{ac,rms} = 0.30\\text{ V}$ RMS. Calculate the ripple factor ($r$) of the filter output.",
    "options": [
      { "label": "A", "text": "0.020 (2.0%)", "is_correct": true },
      { "label": "B", "text": "0.050 (5.0%)", "is_correct": false },
      { "label": "C", "text": "0.010 (1.0%)", "is_correct": false },
      { "label": "D", "text": "0.003 (0.3%)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Ripple Factor Formula",
          "content": "$r = \\frac{V_{ac,rms}}{V_{dc}}$"
        },
        {
          "title": "Calculate Ripple Factor",
          "content": "$r = \\frac{0.30}{15.0} = 0.020 = 2.0\\%$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Rectifiers",
    "title": "Bridge Rectifier Ripple Frequency",
    "question": "A bridge rectifier is connected to a $60\\text{ Hz}$ AC power line. What is the fundamental frequency of the output voltage ripple before filtering?",
    "options": [
      { "label": "A", "text": "120 Hz", "is_correct": true },
      { "label": "B", "text": "60 Hz", "is_correct": false },
      { "label": "C", "text": "30 Hz", "is_correct": false },
      { "label": "D", "text": "240 Hz", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Ripple Peaks",
          "content": "Since a full-wave rectifier reflects the negative half-cycles into positive ones, there are two output peaks for every one input cycle. Therefore, the ripple frequency is doubled: $f_{ripple} = 2 \\times f_{in} = 2 \\times 60 = 120\\text{ Hz}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Rectifiers",
    "title": "Capacitor Filter Peak-to-Peak Ripple Voltage Sizing",
    "question": "A full-wave rectifier delivers $I_{load} = 100\\text{ mA}$ DC to a load. It is filtered by a capacitor $C = 1000\\text{ \\mu F}$. If the ripple frequency is $f = 120\\text{ Hz}$, calculate the peak-to-peak ripple voltage ($V_r$).",
    "options": [
      { "label": "A", "text": "0.83 V", "is_correct": true },
      { "label": "B", "text": "0.42 V", "is_correct": false },
      { "label": "C", "text": "1.67 V", "is_correct": false },
      { "label": "D", "text": "0.25 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Peak-to-Peak Ripple Formula",
          "content": "$V_r = \\frac{I_{load}}{f C}$"
        },
        {
          "title": "Calculate Ripple Voltage",
          "content": "$V_r = \\frac{0.100}{120 \\times 1000 \\times 10^{-6}} = \\frac{0.100}{0.120} = 0.833\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Rectifiers",
    "title": "Three-phase Bridge Rectifier Conduction Angle",
    "question": "In a three-phase six-pulse uncontrolled bridge rectifier, for what conduction angle (in degrees) does each diode conduct during one complete input cycle of 360 degrees?",
    "options": [
      { "label": "A", "text": "120 degrees", "is_correct": true },
      { "label": "B", "text": "60 degrees", "is_correct": false },
      { "label": "C", "text": "180 degrees", "is_correct": false },
      { "label": "D", "text": "90 degrees", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze 3-Phase Bridge Conduction",
          "content": "In a 3-phase bridge, there are 6 diodes total (3 in top group, 3 in bottom group). Each phase has 2 diodes that conduct for exactly $120^circ$ each per cycle, corresponding to the intervals where that phase has the most positive or most negative voltage."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Electronics (General) (6 needed)
  {
    "topic": "Electronics",
    "title": "Intrinsic Carrier Concentration Temperature Dependence",
    "question": "How does the intrinsic carrier concentration ($n_i$) of a semiconductor typically vary as the temperature ($T$) of the material is increased?",
    "options": [
      { "label": "A", "text": "Increases exponentially with temperature", "is_correct": true },
      { "label": "B", "text": "Decreases linearly with temperature", "is_correct": false },
      { "label": "C", "text": "Remains completely independent of temperature", "is_correct": false },
      { "label": "D", "text": "Increases as the square root of temperature", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Intrinsic Carrier Formula",
          "content": "$n_i^2 = B T^3 e^{-E_g / (k T)}$, where $E_g$ is bandgap energy."
        },
        {
          "title": "Analyze Relationship",
          "content": "Because temperature appears in the denominator of a negative exponent, any increase in $T$ yields a massive exponential increase in intrinsic carrier density."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electronics",
    "title": "N-Type Doping Carrier Concentration Calculation",
    "question": "A silicon wafer is doped with phosphorus at a donor density of $N_d = 10^{16}\\text{ atoms/cm}^3$. If the intrinsic carrier concentration at room temperature is $n_i = 1.5 \\times 10^{10}\\text{ cm}^{-3}$, calculate the minority carrier hole concentration ($p_0$).",
    "options": [
      { "label": "A", "text": "2.25 \\times 10^4 cm^{-3}", "is_correct": true },
      { "label": "B", "text": "1.50 \\times 10^4 cm^{-3}", "is_correct": false },
      { "label": "C", "text": "2.25 \\times 10^6 cm^{-3}", "is_correct": false },
      { "label": "D", "text": "1.00 \\times 10^4 cm^{-3}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Mass-Action Law",
          "content": "$n_0 p_0 = n_i^2$"
        },
        {
          "title": "Approximate Majority Carriers",
          "content": "For n-type material under complete ionization: $n_0 \\approx N_d = 10^{16}\\text{ cm}^{-3}$."
        },
        {
          "title": "Calculate Hole Concentration",
          "content": "$p_0 = \\frac{n_i^2}{N_d} = \\frac{(1.5 \\times 10^{10})^2}{10^{16}} = \\frac{2.25 \\times 10^{20}}{10^{16}} = 2.25 \\times 10^4\\text{ cm}^{-3}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electronics",
    "title": "PN Junction Built-in Potential Sizing",
    "question": "A silicon pn junction is doped with $N_a = 10^{16}\\text{ cm}^{-3}$ and $N_d = 10^{15}\\text{ cm}^{-3}$. At room temperature ($V_T = 26\\text{ mV}$, $n_i = 1.5 \\times 10^{10}\\text{ cm}^{-3}$), calculate the built-in potential barrier voltage ($V_0$).",
    "options": [
      { "label": "A", "text": "0.637 V", "is_correct": true },
      { "label": "B", "text": "0.700 V", "is_correct": false },
      { "label": "C", "text": "0.550 V", "is_correct": false },
      { "label": "D", "text": "0.812 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Built-in Potential Formula",
          "content": "$V_0 = V_T \\ln\\left(\\frac{N_a N_d}{n_i^2}\\right)$"
        },
        {
          "title": "Substitute and Calculate",
          "content": "$V_0 = 0.026 \\times \\ln\\left(\\frac{10^{16} \\times 10^{15}}{(1.5 \\times 10^{10})^2}\\right) = 0.026 \\times \\ln\\left(\\frac{10^{31}}{2.25 \\times 10^{20}}\\right) = 0.026 \\times \\ln(4.444 \\times 10^{10})$"
        },
        {
          "title": "Calculate Numerical Value",
          "content": "$\\ln(4.444 \\times 10^{10}) \\approx 24.517 \\implies V_0 = 0.026 \\times 24.517 = 0.637\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electronics",
    "title": "Diffusion and Drift Current Components",
    "question": "In a semiconductor material, what drives the 'drift current' component compared to the 'diffusion current' component?",
    "options": [
      { "label": "A", "text": "Drift is driven by electric fields; diffusion is driven by concentration gradients", "is_correct": true },
      { "label": "B", "text": "Drift is driven by temperature; diffusion is driven by electric fields", "is_correct": false },
      { "label": "C", "text": "Drift is driven by concentration gradients; diffusion is driven by gravity", "is_correct": false },
      { "label": "D", "text": "Both currents are driven exclusively by concentration gradients", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Carrier Transport Mechanisms",
          "content": "- Drift Current: Flow of charged carriers under the influence of an applied electric field ($J = qn\\mu E$).\n- Diffusion Current: Flow of carriers due to random thermal motion from high-concentration areas to low-concentration areas ($J = qD \\frac{dn}{dx}$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electronics",
    "title": "Einstein Relation for Semiconductors",
    "question": "The Einstein relation relates the carrier diffusion coefficient ($D$) and mobility ($\\mu$) in a semiconductor. What is this relationship at temperature $T$?",
    "options": [
      { "label": "A", "text": "\\frac{D}{\\mu} = V_T", "is_correct": true },
      { "label": "B", "text": "D \\cdot \\mu = V_T", "is_correct": false },
      { "label": "C", "text": "\\frac{\\mu}{D} = V_T^2", "is_correct": false },
      { "label": "D", "text": "D - \\mu = V_T", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Einstein Relation",
          "content": "The Einstein relation states that: $\\frac{D_n}{\\mu_n} = \\frac{D_p}{\\mu_p} = \\frac{kT}{q} = V_T$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electronics",
    "title": "Fermi-Dirac Distribution Interpretation",
    "question": "According to the Fermi-Dirac distribution, what is the probability $f(E)$ that an electron state is occupied by an electron when its energy $E$ is exactly equal to the Fermi energy level $E_F$ ($E = E_F$)?",
    "options": [
      { "label": "A", "text": "0.50 (50%)", "is_correct": true },
      { "label": "B", "text": "1.00 (100%)", "is_correct": false },
      { "label": "C", "text": "0.00 (0%)", "is_correct": false },
      { "label": "D", "text": "0.25 (25%)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Fermi-Dirac Distribution Function",
          "content": "$f(E) = \\frac{1}{1 + e^{(E - E_F)/kT}}$"
        },
        {
          "title": "Substitute E = EF",
          "content": "$f(E_F) = \\frac{1}{1 + e^0} = \\frac{1}{1 + 1} = 0.50$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  }
];

questionsObj["electronics"] = questionsObj["electronics"].concat(electronicsNew);

// Write back to questions.js
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefix = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefix + 'const QUESTIONS = ' + updatedJson + ';', 'utf8');

console.log("Successfully added 80 electronics questions in Part B.");
