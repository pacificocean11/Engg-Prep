const fs = require('fs');

let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS in questions.js");
  process.exit(1);
}

const questionsObj = JSON.parse(match[1]);

// ELECTROMAGNETICS (+40 questions)
const electromagneticsNew = [
  // Electrostatics (8 needed)
  {
    "topic": "Electrostatics",
    "title": "Coulomb's Law Force Sizing",
    "question": "Two point charges, $q_1 = +2.0\\text{ \\mu C}$ and $q_2 = -4.0\\text{ \\mu C}$, are located in free space at a distance of $r = 3.0\\text{ m}$ apart. Calculate the magnitude of the electrostatic force ($F$) acting between them.",
    "options": [
      { "label": "A", "text": "8.0 \\times 10^{-3} N (attractive)", "is_correct": true },
      { "label": "B", "text": "8.0 \\times 10^{-3} N (repulsive)", "is_correct": false },
      { "label": "C", "text": "2.4 \\times 10^{-2} N (attractive)", "is_correct": false },
      { "label": "D", "text": "4.0 \\times 10^{-3} N (attractive)", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Coulomb's Law Formula",
          "content": "$F = k_e \\frac{|q_1 q_2|}{r^2}$, where $k_e = \\frac{1}{4\\pi\\epsilon_0} \\approx 8.988 \\times 10^9\\text{ N}\\cdot\\text{m}^2/\\text{C}^2$."
        },
        {
          "title": "Substitute and Calculate Force",
          "content": "$F = (8.988 \\times 10^9) \\times \\frac{(2.0 \\times 10^{-6}) \\times (4.0 \\times 10^{-6})}{3.0^2}$"
        },
        {
          "title": "Calculate Numerical Value",
          "content": "$F = (8.988 \\times 10^9) \\times \\frac{8.0 \\times 10^{-12}}{9.0} = 8.988 \\times 10^9 \\times 8.889 \\times 10^{-13} = 7.99 \\times 10^{-3}\\text{ N} \\approx 8.0 \\times 10^{-3}\\text{ N}$.\nSince the charges are opposite in sign, the force is attractive."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electrostatics",
    "title": "Electric Field from Line Charge",
    "question": "An infinitely long line charge in free space has a uniform charge density of $\\rho_L = 50\\text{ nC/m}$ along the z-axis. Calculate the electric field magnitude ($E$) at a radial distance of $\\rho = 2.0\\text{ m}$ from the line.",
    "options": [
      { "label": "A", "text": "450 V/m", "is_correct": true },
      { "label": "B", "text": "900 V/m", "is_correct": false },
      { "label": "C", "text": "225 V/m", "is_correct": false },
      { "label": "D", "text": "141 V/m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Line Charge Electric Field Formula",
          "content": "$E = \\frac{\\rho_L}{2\\pi\\epsilon_0 \\rho}$"
        },
        {
          "title": "Substitute and Calculate",
          "content": "Using $\\frac{1}{2\\pi\\epsilon_0} = 2 \\times k_e \\approx 1.7976 \\times 10^{10}\\text{ m/F}$:\n$E = (1.7976 \\times 10^{10}) \\times \\frac{50 \\times 10^{-9}}{2.0} = (1.7976 \\times 10^{10}) \\times (2.5 \\times 10^{-8}) = 449.4\\text{ V/m} \\approx 450\\text{ V/m}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electrostatics",
    "title": "Gauss's Law Sphere Charge Integration",
    "question": "A solid conducting sphere of radius $R = 0.5\\text{ m}$ carries a total charge of $Q = 10\\text{ nC}$. What is the electric field magnitude ($E$) at a distance of $r = 0.2\\text{ m}$ (inside the sphere) under electrostatic conditions?",
    "options": [
      { "label": "A", "text": "0 V/m", "is_correct": true },
      { "label": "B", "text": "2250 V/m", "is_correct": false },
      { "label": "C", "text": "900 V/m", "is_correct": false },
      { "label": "D", "text": "450 V/m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Electrostatic Conductor Properties",
          "content": "For a conducting material under electrostatic conditions, all excess charges reside exclusively on the outer surface of the conductor. The volume charge density inside is zero."
        },
        {
          "title": "Evaluate Field using Gauss's Law",
          "content": "A Gaussian sphere of radius $r = 0.2\\text{ m} < R$ encloses zero net charge: $Q_{enc} = 0$. Therefore, the electric field is zero."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electrostatics",
    "title": "Electric Potential of Point Charge",
    "question": "A point charge of $q = 5.0\\text{ \\mu C}$ is located at the origin in free space. What is the electric potential ($V$) at a point $r = 10.0\\text{ m}$ away from the charge, relative to potential at infinity?",
    "options": [
      { "label": "A", "text": "4500 V", "is_correct": true },
      { "label": "B", "text": "450 V", "is_correct": false },
      { "label": "C", "text": "9000 V", "is_correct": false },
      { "label": "D", "text": "2250 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Potential Formula",
          "content": "$V = \\frac{q}{4\\pi\\epsilon_0 r} = k_e \\frac{q}{r}$"
        },
        {
          "title": "Calculate Potential",
          "content": "$V = (8.988 \\times 10^9) \\times \\frac{5.0 \\times 10^{-6}}{10.0} = (8.988 \\times 10^9) \\times (5.0 \\times 10^{-7}) = 4494\\text{ V} \\approx 4500\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electrostatics",
    "title": "Parallel Plate Capacitor Electric Field",
    "question": "A parallel plate capacitor is filled with air ($\\epsilon_r = 1.0$) and has a plate spacing of $d = 2.0\\text{ mm}$. If a DC voltage of $100\\text{ V}$ is applied across the plates, calculate the electric field magnitude ($E$) inside the capacitor gap.",
    "options": [
      { "label": "A", "text": "50,000 V/m", "is_correct": true },
      { "label": "B", "text": "200 V/m", "is_correct": false },
      { "label": "C", "text": "20,000 V/m", "is_correct": false },
      { "label": "D", "text": "500 V/m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Uniform Electric Field Formula",
          "content": "$E = \\frac{V}{d}$"
        },
        {
          "title": "Calculate Field",
          "content": "$E = \\frac{100\\text{ V}}{2.0 \\times 10^{-3}\\text{ m}} = 50,000\\text{ V/m}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electrostatics",
    "title": "Capacitor Energy Storage",
    "question": "A $10\\text{ \\mu F}$ capacitor is charged to a potential of $12.0\\text{ V}$ DC. Calculate the electrostatic energy ($W_e$) stored inside the electric field of the capacitor.",
    "options": [
      { "label": "A", "text": "7.20 \\times 10^{-4} J", "is_correct": true },
      { "label": "B", "text": "1.44 \\times 10^{-3} J", "is_correct": false },
      { "label": "C", "text": "1.20 \\times 10^{-4} J", "is_correct": false },
      { "label": "D", "text": "3.60 \\times 10^{-4} J", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Capacitor Energy Formula",
          "content": "$W_e = \\frac{1}{2} C V^2$"
        },
        {
          "title": "Substitute and Calculate",
          "content": "$W_e = \\frac{1}{2} \\times (10 \\times 10^{-6}\\text{ F}) \\times (12.0\\text{ V})^2 = (5 \\times 10^{-6}) \\times 144 = 7.20 \\times 10^{-4}\\text{ Joules}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electrostatics",
    "title": "Boundary Condition for Normal D",
    "question": "At a boundary between two dielectric materials with no free surface charge density ($\\rho_s = 0$), how does the normal component of the electric flux density vector ($D_n$) behave?",
    "options": [
      { "label": "A", "text": "It is perfectly continuous (D_n1 = D_n2)", "is_correct": true },
      { "label": "B", "text": "It is discontinuous by the dielectric constant ratio", "is_correct": false },
      { "label": "C", "text": "It drops to zero at the interface", "is_correct": false },
      { "label": "D", "text": "It is proportional to the normal electric field component", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Normal Flux Boundary Condition",
          "content": "From Maxwell's boundary relations: $D_{n1} - D_{n2} = \\rho_s$. If there is no surface free charge ($\\rho_s = 0$), then $D_{n1} = D_{n2}$, meaning the normal component is continuous."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electrostatics",
    "title": "Boundary Condition for Tangential E",
    "question": "At any dielectric-dielectric interface, what is the boundary relation for the tangential component of the electric field vector ($E_t$)?",
    "options": [
      { "label": "A", "text": "It is always continuous (E_t1 = E_t2)", "is_correct": true },
      { "label": "B", "text": "It is discontinuous by the surface free charge", "is_correct": false },
      { "label": "C", "text": "It is discontinuous by the ratio of permittivity", "is_correct": false },
      { "label": "D", "text": "It is always zero at the interface", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Tangential E Boundary",
          "content": "Applying KVL to a closed rectangular path crossing the boundary shows that the line integral of $E$ must be zero, which results in: $E_{t1} = E_{t2}$. The tangential component is always continuous."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Magnetostatics (7 needed)
  {
    "topic": "Magnetostatics",
    "title": "Biot-Savart Law Infinite Wire",
    "question": "An infinitely long filamentary conductor carrying a direct current $I = 10\\text{ A}$ along the z-axis is in free space. Calculate the magnetic field intensity magnitude ($H$) at a radial distance of $\\rho = 2.0\\text{ m}$ from the line.",
    "options": [
      { "label": "A", "text": "0.796 A/m", "is_correct": true },
      { "label": "B", "text": "5.000 A/m", "is_correct": false },
      { "label": "C", "text": "1.592 A/m", "is_correct": false },
      { "label": "D", "text": "10.000 A/m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Ampere's Law for Line Current",
          "content": "$\\oint \\mathbf{H} \\cdot d\\mathbf{l} = I_{enc} \\implies H \\cdot (2\pi\rho) = I \\implies H = \\frac{I}{2\\pi\\rho}$"
        },
        {
          "title": "Calculate Magnetizing Field",
          "content": "$H = \\frac{10}{2\\pi \\times 2.0} = \\frac{10}{4\\pi} \\approx 0.7958\\text{ A/m}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Magnetostatics",
    "title": "Magnetic Flux Density in Air vs Medium",
    "question": "If the magnetic field intensity in a non-magnetic material is $H = 50\\text{ A/m}$, calculate the corresponding magnetic flux density ($B$) in Tesla.",
    "options": [
      { "label": "A", "text": "6.28 \\times 10^{-5} T", "is_correct": true },
      { "label": "B", "text": "6.28 \\times 10^{-7} T", "is_correct": false },
      { "label": "C", "text": "4.00 \\times 10^{-6} T", "is_correct": false },
      { "label": "D", "text": "1.00 \\times 10^{-4} T", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Magnetic Flux Formula",
          "content": "$B = \\mu_0 H$, where $\\mu_0 = 4\\pi \\times 10^{-7}\\text{ H/m}$."
        },
        {
          "title": "Calculate Density",
          "content": "$B = (4\\pi \\times 10^{-7}) \\times 50 = 200\\pi \\times 10^{-7} = 2\\pi \\times 10^{-5} \\approx 6.283 \\times 10^{-5}\\text{ Tesla}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Magnetostatics",
    "title": "Ampere's Circuital Law Coaxial Cable",
    "question": "A coaxial cable has an inner solid conductor of radius $a = 1.0\\text{ mm}$ carrying a current $I = 2\\text{ A}$ along $+a_z$, and an outer shield at radius $b = 3.0\\text{ mm}$ carrying the return current $I = 2\\text{ A}$ along $-a_z$. What is the magnetic field intensity magnitude ($H$) at radial distance $r = 5.0\\text{ mm}$ outside the cable?",
    "options": [
      { "label": "A", "text": "0 A/m", "is_correct": true },
      { "label": "B", "text": "63.7 A/m", "is_correct": false },
      { "label": "C", "text": "127.3 A/m", "is_correct": false },
      { "label": "D", "text": "31.8 A/m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Ampere's Law outside Coax",
          "content": "According to Ampere's Circuital Law, the closed line integral of $H$ is equal to the net enclosed current: $\\oint \\mathbf{H} \\cdot d\\mathbf{l} = I_{enc}$."
        },
        {
          "title": "Calculate Enclosed Current",
          "content": "For a path at $r = 5.0\\text{ mm} > b$, the path encloses both the inner positive current ($+2\\text{ A}$) and outer return negative current ($-2\\text{ A}$): $I_{enc} = +2 - 2 = 0\\text{ A}$. Therefore, $H = 0\\text{ A/m}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Magnetostatics",
    "title": "Magnetic Force on Moving Charge",
    "question": "A proton ($q = 1.602 \\times 10^{-19}\\text{ C}$) enters a region with a uniform magnetic field $\\mathbf{B} = 0.5 \\mathbf{a}_z\\text{ T}$ moving at velocity $\\mathbf{v} = 10^6 \\mathbf{a}_y\\text{ m/s}$. Calculate the magnetic force vector ($\\mathbf{F}_m$) acting on the proton.",
    "options": [
      { "label": "A", "text": "8.01 \\times 10^{-14} a_x N", "is_correct": true },
      { "label": "B", "text": "-8.01 \\times 10^{-14} a_x N", "is_correct": false },
      { "label": "C", "text": "8.01 \\times 10^{-14} a_y N", "is_correct": false },
      { "label": "D", "text": "0 N", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Lorentz Force Equation",
          "content": "$\\mathbf{F}_m = q (\\mathbf{v} \\times \\mathbf{B})$"
        },
        {
          "title": "Evaluate Vector Cross Product",
          "content": "$\\mathbf{v} \\times \\mathbf{B} = (10^6 \\mathbf{a}_y) \\times (0.5 \\mathbf{a}_z) = 0.5 \\times 10^6 (\\mathbf{a}_y \\times \\mathbf{a}_z) = 5 \\times 10^5 \\mathbf{a}_x\\text{ T}\\cdot\\text{m/s}$."
        },
        {
          "title": "Multiply by Charge",
          "content": "$\\mathbf{F}_m = (1.602 \\times 10^{-19}) \\times (5 \\times 10^5 \\mathbf{a}_x) = 8.01 \\times 10^{-14} \\mathbf{a}_x\\text{ N}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Magnetostatics",
    "title": "Solenoid Magnetic Field Sizing",
    "question": "A solenoid of length $L = 0.5\\text{ m}$ is uniformly wound with $N = 1000$ turns of wire. If it carries a current of $I = 2.0\\text{ A}$, calculate the magnetic field intensity ($H$) along the center axis inside the solenoid.",
    "options": [
      { "label": "A", "text": "4000 A/m", "is_correct": true },
      { "label": "B", "text": "2000 A/m", "is_correct": false },
      { "label": "C", "text": "1000 A/m", "is_correct": false },
      { "label": "D", "text": "8000 A/m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Solenoid Central Field Formula",
          "content": "For a long solenoid: $H = \\frac{N I}{L}$"
        },
        {
          "title": "Calculate Field Intensity",
          "content": "$H = \\frac{1000 \\times 2.0}{0.5} = \\frac{2000}{0.5} = 4000\\text{ A/m}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Magnetostatics",
    "title": "Self-Inductance of Solenoid",
    "question": "Calculate the self-inductance ($L$) of an air-core solenoid having $N = 500$ turns, length $l = 0.2\\text{ m}$, and cross-sectional area $A = 10^{-4}\\text{ m}^2$.",
    "options": [
      { "label": "A", "text": "0.157 mH", "is_correct": true },
      { "label": "B", "text": "1.570 mH", "is_correct": false },
      { "label": "C", "text": "0.078 mH", "is_correct": false },
      { "label": "D", "text": "0.314 mH", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Solenoid Inductance Formula",
          "content": "$L = \\frac{\\mu_0 N^2 A}{l}$"
        },
        {
          "title": "Substitute and Calculate Inductance",
          "content": "$L = \\frac{(4\\pi \\times 10^{-7}) \\times 500^2 \\times 10^{-4}}{0.2} = \\frac{(4\\pi \\times 10^{-7}) \\times 250000 \\times 10^{-4}}{0.2}$"
        },
        {
          "title": "Calculate Numerical Value",
          "content": "$L = \\frac{4\\pi \\times 10^{-7} \\times 25}{0.2} = \\frac{100\\pi \\times 10^{-7}}{0.2} = 500\\pi \\times 10^{-7} = 5\\pi \\times 10^{-5} \\approx 1.57 \\times 10^{-4}\\text{ H} = 0.157\\text{ mH}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Magnetostatics",
    "title": "Boundary Condition for Normal B",
    "question": "At any boundary between two materials with differing magnetic permeabilities ($\\mu_1 \\ne \\mu_2$), how does the normal component of the magnetic flux density vector ($B_n$) behave?",
    "options": [
      { "label": "A", "text": "It is always continuous (B_n1 = B_n2)", "is_correct": true },
      { "label": "B", "text": "It is discontinuous by the ratio of permeability", "is_correct": false },
      { "label": "C", "text": "It is always zero at the interface", "is_correct": false },
      { "label": "D", "text": "It is discontinuous by the surface sheet current density", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Gauss's Law for Magnetic Fields",
          "content": "Since magnetic monopoles do not exist, Maxwell's equation states that $\\nabla \\cdot \\mathbf{B} = 0$. Integrating this over a thin cylinder across the interface yields $B_{n1} = B_{n2}$, indicating the normal magnetic flux density component is always continuous."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Maxwell's Equations (7 needed)
  {
    "topic": "Maxwell's Equations",
    "title": "Faraday's Law Induced Voltage",
    "question": "A single-loop coil of area $A = 0.1\\text{ m}^2$ is placed in a uniform magnetic field perpendicular to the loop. If the magnetic flux density changes at a constant rate of $dB/dt = -5.0\\text{ T/s}$, calculate the induced electromotive force ($e$) in the loop.",
    "options": [
      { "label": "A", "text": "0.50 V", "is_correct": true },
      { "label": "B", "text": "-5.00 V", "is_correct": false },
      { "label": "C", "text": "0.05 V", "is_correct": false },
      { "label": "D", "text": "1.00 V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Faraday's Law",
          "content": "$e = -N \\frac{d\\Phi_m}{dt}$, where $\\Phi_m = B \\cdot A$ and $N = 1$."
        },
        {
          "title": "Calculate Induced EMF",
          "content": "$e = -1 \\times A \\frac{dB}{dt} = -0.1 \\times (-5.0\\text{ T/s}) = 0.50\\text{ V}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Maxwell's Equations",
    "title": "Displacement Current Density Calculation",
    "question": "Inside a dielectric material ($\\epsilon = 4\\epsilon_0$), the electric field varies with time as $\\mathbf{E} = 100 \\sin(10^9 t) \\mathbf{a}_x\\text{ V/m}$. Calculate the maximum magnitude of the displacement current density ($J_d$).",
    "options": [
      { "label": "A", "text": "3.54 A/m^2", "is_correct": true },
      { "label": "B", "text": "0.88 A/m^2", "is_correct": false },
      { "label": "C", "text": "354.00 A/m^2", "is_correct": false },
      { "label": "D", "text": "1.41 A/m^2", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Displacement Current Formula",
          "content": "$\\mathbf{J}_d = \\frac{\\partial \\mathbf{D}}{\\partial t} = \\epsilon \\frac{\\partial \\mathbf{E}}{\\partial t}$"
        },
        {
          "title": "Differentiate E-Field with Time",
          "content": "$\\frac{\\partial \\mathbf{E}}{\\partial t} = 100 \\times 10^9 \\cos(10^9 t) \\mathbf{a}_x\\text{ V/m}\\cdot\\text{s}$."
        },
        {
          "title": "Calculate Maximum Magnitude",
          "content": "$J_{d,max} = \\epsilon (10^{11}) = 4\\epsilon_0 (10^{11}) = 4 \\times (8.854 \\times 10^{-12}) \\times 10^{11} = 3.5416\\text{ A/m}^2$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Maxwell's Equations",
    "title": "Maxwell-Ampere Equation Interpretation",
    "question": "Which of Maxwell's equations represents the physical concept that magnetic fields are produced both by moving electrical conduction charges and by time-varying electric fields?",
    "options": [
      { "label": "A", "text": "\\nabla \\times \\mathbf{H} = \\mathbf{J} + \\frac{\\partial \\mathbf{D}}{\\partial t}", "is_correct": true },
      { "label": "B", "text": "\\nabla \\times \\mathbf{E} = -\\frac{\\partial \\mathbf{B}}{\\partial t}", "is_correct": false },
      { "label": "C", "text": "\\nabla \\cdot \\mathbf{D} = \\rho_v", "is_correct": false },
      { "label": "D", "text": "\\nabla \\cdot \\mathbf{B} = 0", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Maxwell-Ampere Equation",
          "content": "The equation $\\nabla \\times \\mathbf{H} = \\mathbf{J} + \\frac{\\partial \\mathbf{D}}{\\partial t}$ shows that the curl of $H$ (magnetic field) is caused by: \n1. Conduction current density $\\mathbf{J}$\n2. Displacement current density $\\frac{\\partial \\mathbf{D}}{\\partial t}$ (time-varying electric field)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Maxwell's Equations",
    "title": "Gauss's Law for Magnetic Fields Physical Meaning",
    "question": "The Maxwell equation $\\nabla \\cdot \\mathbf{B} = 0$ is a mathematical formulation of which fundamental physical law?",
    "options": [
      { "label": "A", "text": "Isolated magnetic monopoles do not exist, and magnetic lines form closed loops", "is_correct": true },
      { "label": "B", "text": "Magnetic fields propagate at the speed of light in free space", "is_correct": false },
      { "label": "C", "text": "Conservation of electrical conduction charge", "is_correct": false },
      { "label": "D", "text": "Magnetic flux is proportional to the induced electric EMF loop", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Interpret Zero Divergence of B",
          "content": "A divergence of zero indicates that the net flux leaving any closed surface is zero. Since lines must loop back, it proves that individual north or south magnetic poles cannot be isolated."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Maxwell's Equations",
    "title": "Lorentz Gauge Condition",
    "question": "In electrodynamics, what is the Lorentz gauge condition relating the magnetic vector potential $\\mathbf{A}$ and electric scalar potential $V$?",
    "options": [
      { "label": "A", "text": "\\nabla \\cdot \\mathbf{A} = -\\mu \\epsilon \\frac{\\partial V}{\\partial t}", "is_correct": true },
      { "label": "B", "text": "\\nabla \\times \\mathbf{A} = \\mathbf{B}", "is_correct": false },
      { "label": "C", "text": "\\nabla \\cdot \\mathbf{A} = 0", "is_correct": false },
      { "label": "D", "text": "\\nabla V = -\\mathbf{E}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Gauge Condition",
          "content": "The Lorentz gauge condition decouples the wave equations for electromagnetic potentials $A$ and $V$, and is defined as: $\\nabla \\cdot \\mathbf{A} + \\mu\\epsilon \\frac{\\partial V}{\\partial t} = 0 \\implies \\nabla \\cdot \\mathbf{A} = -\\mu\\epsilon \\frac{\\partial V}{\\partial t}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Maxwell's Equations",
    "title": "Poynting's Theorem Energy Flow",
    "question": "Poynting's vector $\\mathbf{S} = \\mathbf{E} \\times \\mathbf{H}$ represents which of the following physical quantities in electromagnetic fields?",
    "options": [
      { "label": "A", "text": "Power flow density vector in W/m^2", "is_correct": true },
      { "label": "B", "text": "Total energy density stored in J/m^3", "is_correct": false },
      { "label": "C", "text": "Force per unit area in N/m^2", "is_correct": false },
      { "label": "D", "text": "Conduction current density in A/m^2", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Poynting Vector",
          "content": "Poynting's vector is the cross product of the electric field ($E$, V/m) and magnetic field ($H$, A/m). The units are: $\\text{V/m} \\times \\text{A/m} = \\text{W/m}^2$, which describes the power flow density and direction of electromagnetic waves."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Maxwell's Equations",
    "title": "Continuity Equation of Charge",
    "question": "The continuity equation $\\nabla \\cdot \\mathbf{J} = -\\frac{\\partial \\rho_v}{\\partial t}$ is a mathematical representation of which fundamental physical principle?",
    "options": [
      { "label": "A", "text": "Conservation of electric charge", "is_correct": true },
      { "label": "B", "text": "Conservation of energy in electromagnetic waves", "is_correct": false },
      { "label": "C", "text": "Faraday's law of induction", "is_correct": false },
      { "label": "D", "text": "Ampere's law for DC fields", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Interpret Continuity Equation",
          "content": "The equation states that the net divergence of current density leaving a volume equals the rate of decrease of charge within that volume. This means charge cannot be created or destroyed, only moved."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Wave Propagation (6 needed)
  {
    "topic": "Wave Propagation",
    "title": "Intrinsic Impedance of Free Space",
    "question": "Calculate the theoretical intrinsic impedance ($\\eta_0$) of free space using the values of permittivity $\\epsilon_0$ and permeability $\\mu_0$.",
    "options": [
      { "label": "A", "text": "377 \\Omega", "is_correct": true },
      { "label": "B", "text": "120 \\Omega", "is_correct": false },
      { "label": "C", "text": "50 \\Omega", "is_correct": false },
      { "label": "D", "text": "75 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Intrinsic Impedance Formula",
          "content": "$\\eta_0 = \\sqrt{\\frac{\\mu_0}{\\epsilon_0}}$"
        },
        {
          "title": "Calculate Value",
          "content": "$\\eta_0 = \\sqrt{\\frac{4\\pi \\times 10^{-7}}{8.854 \\times 10^{-12}}} = \\sqrt{1.4192 \\times 10^5} \\approx 376.73\\text{ \\Omega} \\approx 120\\pi\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Wave Propagation",
    "title": "Wave Speed in Dielectric Medium",
    "question": "An electromagnetic wave propagates through a lossless, non-magnetic medium with a relative dielectric constant of $\\epsilon_r = 4.0$. Calculate the propagation velocity ($v$) of the wave.",
    "options": [
      { "label": "A", "text": "1.50 \\times 10^8 m/s", "is_correct": true },
      { "label": "B", "text": "3.00 \\times 10^8 m/s", "is_correct": false },
      { "label": "C", "text": "7.50 \\times 10^7 m/s", "is_correct": false },
      { "label": "D", "text": "2.25 \\times 10^8 m/s", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Wave Speed Formula",
          "content": "$v = \\frac{c}{\\sqrt{\\epsilon_r \\mu_r}}$, where $c \\approx 3.00 \\times 10^8\\text{ m/s}$."
        },
        {
          "title": "Calculate Speed",
          "content": "Since the medium is non-magnetic, $\\mu_r = 1.0$.\n$v = \\frac{3.00 \\times 10^8}{\\sqrt{4.0}} = \\frac{3.00 \\times 10^8}{2.0} = 1.50 \\times 10^8\\text{ m/s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Wave Propagation",
    "title": "EM Wave Attenuation skin depth",
    "question": "A plane wave propagates through a good conductor with conductivity $\\sigma$ at frequency $f$. If the skin depth (penetration depth) is denoted by $\\delta$, what is the physical meaning of the skin depth?",
    "options": [
      { "label": "A", "text": "The depth at which the electric field amplitude decays to 36.8% (1/e) of its surface value", "is_correct": true },
      { "label": "B", "text": "The depth at which the field amplitude decays to exactly zero", "is_correct": false },
      { "label": "C", "text": "The depth at which the wave energy is half-power reflected", "is_correct": false },
      { "label": "D", "text": "The wavelength divided by 2\\pi", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Interpret Skin Depth",
          "content": "Skin depth $\\delta$ is defined as the distance a wave travels in a lossy medium before its field amplitude decays by a factor of $e^{-1} \\approx 0.368$ (or $36.8\\%$)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Wave Propagation",
    "title": "TEM Wave Relation of E and H",
    "question": "In a transverse electromagnetic (TEM) plane wave propagating along the $+a_z$ direction in free space, if the electric field vector is polarized along $+a_x$ ($\\mathbf{E} = E_x \\mathbf{a}_x$), what is the polarization direction of the magnetic field vector $\\mathbf{H}$?",
    "options": [
      { "label": "A", "text": "+a_y direction", "is_correct": true },
      { "label": "B", "text": "-a_y direction", "is_correct": false },
      { "label": "C", "text": "+a_z direction", "is_correct": false },
      { "label": "D", "text": "-a_x direction", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply TEM Direction Rule",
          "content": "For a TEM wave, the electric field $\\mathbf{E}$, magnetic field $\\mathbf{H}$, and direction of propagation $\\mathbf{a}_k$ are mutually perpendicular and form a right-handed system:\n$\\mathbf{a}_E \\times \\mathbf{a}_H = \\mathbf{a}_k$"
        },
        {
          "title": "Find H-field polarization direction",
          "content": "$\\mathbf{a}_x \\times \\mathbf{a}_H = \\mathbf{a}_z \\implies \\mathbf{a}_H = \\mathbf{a}_y$. Therefore, $\\mathbf{H}$ is polarized along $+a_y$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Wave Propagation",
    "title": "Loss Tangent of Dielectric Material",
    "question": "A dielectric material has a permittivity of $\\epsilon = \\epsilon' - j\\epsilon''$. What is the definition of the 'loss tangent' ($\\tan\\theta_d$) of this material?",
    "options": [
      { "label": "A", "text": "\\tan\\theta_d = \\frac{\\epsilon''}{\\epsilon'}", "is_correct": true },
      { "label": "B", "text": "\\tan\\theta_d = \\frac{\\epsilon'}{\\epsilon''}", "is_correct": false },
      { "label": "C", "text": "\\tan\\theta_d = \\frac{\\sigma}{\\omega \\epsilon'}", "is_correct": false },
      { "label": "D", "text": "\\tan\\theta_d = \\epsilon' \\cdot \\epsilon''", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Define Loss Tangent",
          "content": "The complex permittivity represents real energy storage ($\\epsilon'$) and loss components ($\\epsilon''$ due to conduction and dielectric damping). The loss tangent is the ratio of imaginary to real parts: $\\tan\\theta_d = \\frac{\\epsilon''}{\\epsilon'}$ (which simplifies to $\\frac{\\sigma}{\\omega\\epsilon}$ for a simple conductive dielectric)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Wave Propagation",
    "title": "Wave Reflection Coefficient Normal Incidence",
    "question": "A plane wave in air is normally incident on a dielectric medium with relative permittivity $\\epsilon_r = 9.0$. Calculate the reflection coefficient ($\\Gamma$) at the boundary.",
    "options": [
      { "label": "A", "text": "-0.50", "is_correct": true },
      { "label": "B", "text": "0.50", "is_correct": false },
      { "label": "C", "text": "-0.33", "is_correct": false },
      { "label": "D", "text": "0.33", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Calculate Medium Impedance",
          "content": "$\eta_1 = \\eta_0 \\approx 377\\text{ \\Omega}$.\n$\\eta_2 = \\frac{\\eta_0}{\\sqrt{\\epsilon_{r2}}} = \\frac{\\eta_0}{\\sqrt{9.0}} = \\frac{\\eta_0}{3} \\approx 125.7\\text{ \\Omega}$."
        },
        {
          "title": "Calculate Reflection Coefficient",
          "content": "$\\Gamma = \\frac{\\eta_2 - \\eta_1}{\\eta_2 + \\eta_1} = \\frac{\\eta_0/3 - \\eta_0}{\\eta_0/3 + \\eta_0} = \\frac{-2/3 \\eta_0}{4/3 \\eta_0} = -\\frac{2}{4} = -0.50$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Transmission Lines (8 needed)
  {
    "topic": "Transmission Lines",
    "title": "Lossless Line Input Impedance Short Circuit",
    "question": "A lossless transmission line of length $l = \\lambda/8$ has characteristic impedance $Z_0 = 50\\text{ \\Omega}$. If the line is short-circuited at the load end ($Z_L = 0$), calculate the input impedance ($Z_{in}$) of the line.",
    "options": [
      { "label": "A", "text": "j50 \\Omega", "is_correct": true },
      { "label": "B", "text": "-j50 \\Omega", "is_correct": false },
      { "label": "C", "text": "50 \\Omega", "is_correct": false },
      { "label": "D", "text": "0 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Lossless Line Input Impedance Formula",
          "content": "$Z_{in} = Z_0 \\frac{Z_L + j Z_0 \\tan(\\beta l)}{Z_0 + j Z_L \\tan(\\beta l)}$"
        },
        {
          "title": "Apply Short Circuit Condition",
          "content": "Since $Z_L = 0$, $Z_{in} = j Z_0 \\tan(\\beta l)$."
        },
        {
          "title": "Calculate Electrical Length",
          "content": "$\\beta l = \\left(\\frac{2\\pi}{\\lambda}\\right) \\left(\\frac{\\lambda}{8}\\right) = \\frac{\\pi}{4}\\text{ rad} = 45^\\circ$.\n$\\tan(45^\\circ) = 1.0$."
        },
        {
          "title": "Calculate Input Impedance",
          "content": "$Z_{in} = j (50) \\times 1.0 = j50\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Input Impedance of Open-Circuited Line",
    "question": "For the same lossless line in the previous question ($l = \\lambda/8$, $Z_0 = 50\\text{ \\Omega}$), if the line is open-circuited at the load end ($Z_L \\to \\infty$), calculate the input impedance ($Z_{in}$).",
    "options": [
      { "label": "A", "text": "-j50 \\Omega", "is_correct": true },
      { "label": "B", "text": "j50 \\Omega", "is_correct": false },
      { "label": "C", "text": "0 \\Omega", "is_correct": false },
      { "label": "D", "text": "Infinity", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Apply Open Circuit Impedance Formula",
          "content": "For $Z_L \\to \\infty$, the input impedance simplifies to: $Z_{in} = -j Z_0 \\cot(\\beta l)$."
        },
        {
          "title": "Substitute Values",
          "content": "$\\beta l = 45^\\circ \\implies \\cot(45^\\circ) = 1.0$.\n$Z_{in} = -j (50) \\times 1.0 = -j50\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Quarter-Wave Impedance Inversion",
    "question": "A quarter-wave lossless transmission line ($l = \\lambda/4$, $Z_0 = 75\\text{ \\Omega}$) is terminated by a load impedance $Z_L = 150\\text{ \\Omega}$. Calculate the input impedance ($Z_{in}$).",
    "options": [
      { "label": "A", "text": "37.5 \\Omega", "is_correct": true },
      { "label": "B", "text": "150.0 \\Omega", "is_correct": false },
      { "label": "C", "text": "75.0 \\Omega", "is_correct": false },
      { "label": "D", "text": "300.0 \\Omega", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Identify Quarter-wave Line Formula",
          "content": "For a $\\lambda/4$ line: $Z_{in} = \\frac{Z_0^2}{Z_L}$"
        },
        {
          "title": "Calculate Input Impedance",
          "content": "$Z_{in} = \\frac{75^2}{150} = \\frac{5625}{150} = 37.5\\text{ \\Omega}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Transmission Line Parameters Definition",
    "question": "In the standard distributed model of a lossy transmission line, the parameters $R$, $L$, $G$, and $C$ are defined per unit length. What does the parameter $G$ represent?",
    "options": [
      { "label": "A", "text": "Shunt conductance per unit length due to dielectric insulation leakage", "is_correct": true },
      { "label": "B", "text": "Series resistance per unit length of the metal conductors", "is_correct": false },
      { "label": "C", "text": "The reciprocal of the characteristic impedance", "is_correct": false },
      { "label": "D", "text": "The ground reflection coefficient amplitude", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Distributed Parameters",
          "content": "- $R$: Series resistance of the conductor.\n- $L$: Series inductance.\n- $C$: Shunt capacitance between conductors.\n- $G$: Shunt leakage conductance through the insulating dielectric substrate."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "distortionless line Condition",
    "question": "What is the relation between the primary line parameters ($R$, $L$, $G$, $C$) that defines a 'distortionless line'?",
    "options": [
      { "label": "A", "text": "\\frac{R}{L} = \\frac{G}{C}", "is_correct": true },
      { "label": "B", "text": "R \\cdot C = G \\cdot L", "is_correct": false },
      { "label": "C", "text": "R = 0, G = 0", "is_correct": false },
      { "label": "D", "text": "\\frac{R}{G} = \\frac{C}{L}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Heaviside Condition",
          "content": "The Heaviside distortionless line condition states that if the parameters satisfy: $\\frac{R}{L} = \\frac{G}{C}$, then the attenuation constant is independent of frequency, and the phase velocity is constant, preventing wave distortion."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Transmission Line Propagation Constant",
    "question": "A lossy transmission line has a complex propagation constant $\\gamma = 0.02 + j1.5\\text{ m}^{-1}$. What are the values of the attenuation constant ($\\alpha$) and phase constant ($\\beta$)?",
    "options": [
      { "label": "A", "text": "\\alpha = 0.02 Np/m, \\beta = 1.5 rad/m", "is_correct": true },
      { "label": "B", "text": "\\alpha = 1.5 Np/m, \\beta = 0.02 rad/m", "is_correct": false },
      { "label": "C", "text": "\\alpha = 0.02 rad/m, \\beta = 1.5 Np/m", "is_correct": false },
      { "label": "D", "text": "\\alpha = 0.04 Np/m, \\beta = 3.0 rad/m", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Propagation Constant Form",
          "content": "The propagation constant is defined as: $\\gamma = \\alpha + j\\beta$, where $\\alpha$ is the attenuation constant (in Nepers per meter) and $\\beta$ is the phase constant (in radians per meter)."
        },
        {
          "title": "Extract Constants",
          "content": "From $\\gamma = 0.02 + j1.5$:\n$\\alpha = 0.02\\text{ Np/m}$\n$\\beta = 1.5\\text{ rad/m}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Smith Chart Impedance Coordinate Interpretation",
    "question": "What kind of coordinate grid system is represented on a standard Smith Chart used in microwave engineering?",
    "options": [
      { "label": "A", "text": "Constant resistance and constant reactance circles in the complex reflection coefficient plane", "is_correct": true },
      { "label": "B", "text": "Constant attenuation and constant phase lines in rectangular Cartesian format", "is_correct": false },
      { "label": "C", "text": "Logarithmic impedance values in frequency polar domain", "is_correct": false },
      { "label": "D", "text": "VSWR values plotted versus signal-to-noise ratio in decibels", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Understand Smith Chart Design",
          "content": "The Smith Chart maps normalized impedances $z = r + jx$ onto the complex reflection coefficient $\\Gamma$ plane. It consists of circles representing constant normalized resistance $r$ and arcs representing constant normalized reactance $x$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Transmission Lines",
    "title": "Standing Wave Node Sizing",
    "question": "On a transmission line with mismatched load impedance, what is the distance between two consecutive standing wave voltage minimums (nodes)?",
    "options": [
      { "label": "A", "text": "One-half of a wavelength (\\lambda/2)", "is_correct": true },
      { "label": "B", "text": "One full wavelength (\\lambda)", "is_correct": false },
      { "label": "C", "text": "One-quarter of a wavelength (\\lambda/4)", "is_correct": false },
      { "label": "D", "text": "Variable, depending on reflection phase angle", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "Analyze Standing Wave Spatial Period",
          "content": "The standing wave pattern has a spatial period of half a wavelength because a round trip of distance $d = \\lambda/2$ introduces a phase shift of $2\\beta d = 2 \\left(\\frac{2\\pi}{\\lambda}\\right) \\left(\\frac{\\lambda}{2}\\right) = 2\\pi$, returning the pattern to the same constructive or destructive state. Thus, minima are spaced by $\\lambda/2$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },

  // Electromagnetics (General) (4 needed)
  {
    "topic": "Electromagnetics",
    "title": "Divergence Theorem Physical Concept",
    "question": "The Divergence Theorem relates which of the following integrations of any vector field $\\mathbf{A}$?",
    "options": [
      { "label": "A", "text": "The volume integral of the divergence of A to the closed surface integral of A", "is_correct": true },
      { "label": "B", "text": "The closed line integral of A to the open surface integral of the curl of A", "is_correct": false },
      { "label": "C", "text": "The volume integral of the curl of A to the closed surface integral of the gradient of A", "is_correct": false },
      { "label": "D", "text": "The double surface integral of A to the line integral of A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Divergence Theorem",
          "content": "The Divergence (or Gauss's) Theorem states: $\\iiint_V (\\nabla \\cdot \\mathbf{A}) dV = \\oint_S \\mathbf{A} \\cdot d\\mathbf{S}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electromagnetics",
    "title": "Stokes' Theorem Vector Formulation",
    "question": "Stokes' Theorem relates which of the following integrations of any vector field $\\mathbf{A}$?",
    "options": [
      { "label": "A", "text": "The closed line integral of A to the open surface integral of the curl of A", "is_correct": true },
      { "label": "B", "text": "The volume integral of the divergence of A to the closed surface integral of A", "is_correct": false },
      { "label": "C", "text": "The gradient line integral of A to the volume integral of A", "is_correct": false },
      { "label": "D", "text": "The closed surface integral of A to the curl of A", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Stokes' Theorem",
          "content": "Stokes' Theorem states: $\\oint_C \\mathbf{A} \\cdot d\\mathbf{l} = \\iint_S (\\nabla \\times \\mathbf{A}) \\cdot d\\mathbf{S}$, where $C$ is the closed perimeter bounding the open surface $S$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electromagnetics",
    "title": "Permittivity and Permeability of Free Space Relation",
    "question": "What is the speed of light ($c$) in free space in terms of the fundamental constants of permittivity ($\\epsilon_0$) and permeability ($\\mu_0$)?",
    "options": [
      { "label": "A", "text": "c = \\frac{1}{\\sqrt{\\mu_0 \\epsilon_0}}", "is_correct": true },
      { "label": "B", "text": "c = \\sqrt{\\mu_0 \\epsilon_0}", "is_correct": false },
      { "label": "C", "text": "c = \\frac{\\mu_0}{\\epsilon_0}", "is_correct": false },
      { "label": "D", "text": "c = \\frac{1}{\\mu_0 \\epsilon_0}", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Speed of Light Formula",
          "content": "From Maxwell's wave equations, the speed of electromagnetic waves in a vacuum is: $c = \\frac{1}{\\sqrt{\\mu_0 \\epsilon_0}} \\approx 2.998 \\times 10^8\\text{ m/s}$."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  },
  {
    "topic": "Electromagnetics",
    "title": "Gradient, Divergence, and Curl Identities",
    "question": "For any twice-differentiable scalar field $V$ and vector field $\\mathbf{A}$, which of the following mathematical identities is always identically zero?",
    "options": [
      { "label": "A", "text": "The curl of the gradient of V, and the divergence of the curl of A", "is_correct": true },
      { "label": "B", "text": "The gradient of the divergence of A", "is_correct": false },
      { "label": "C", "text": "The curl of the curl of A", "is_correct": false },
      { "label": "D", "text": "The divergence of the gradient of V", "is_correct": false }
    ],
    "solution": {
      "steps": [
        {
          "title": "State Vector Identities",
          "content": "Two major vector identities that are always zero for any continuous fields:\n1. $\\nabla \\times (\\nabla V) = \\mathbf{0}$ (curl of a gradient is zero)\n2. $\\nabla \\cdot (\\nabla \\times \\mathbf{A}) = 0$ (divergence of a curl is zero)."
        }
      ],
      "final_answer": "A",
      "solution_image": ""
    }
  }
];

questionsObj["electromagnetics"] = electromagneticsNew;

// Write back to questions.js
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefix = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefix + 'const QUESTIONS = ' + updatedJson + ';', 'utf8');

console.log("Successfully added 40 electromagnetics questions in Part C.");
