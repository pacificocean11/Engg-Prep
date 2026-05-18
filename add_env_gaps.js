const fs = require('fs');

let fileContent = fs.readFileSync('questions.js', 'utf8');
const match = fileContent.match(/const QUESTIONS = (\{[\s\S]*\});?\s*$/);
if (!match) {
  console.log("Could not find QUESTIONS in questions.js");
  process.exit(1);
}

const questionsObj = JSON.parse(match[1]);

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

// 1. Environmental Chemistry (env-chem)
const envChemNew = [
  // Atmospheric Chemistry (4)
  {
    topic: "Atmospheric Chemistry",
    title: "Ozone Depletion Mechanism",
    question: "Which of the following compounds is the primary catalyst for the destruction of stratospheric ozone?",
    options: [
      { text: "Chlorofluorocarbons (CFCs)", is_correct: true },
      { text: "Carbon dioxide ($CO_2$)", is_correct: false },
      { text: "Sulfur dioxide ($SO_2$)", is_correct: false },
      { text: "Methane ($CH_4$)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Ozone Depleting Substances",
          content: "Chlorine atoms, largely from CFCs, act as catalysts in the stratosphere, continuously breaking down ozone ($O_3$) into oxygen ($O_2$)."
        }
      ]
    }
  },
  {
    topic: "Atmospheric Chemistry",
    title: "Photochemical Smog",
    question: "Photochemical smog is primarily formed by the reaction of sunlight with which two primary pollutants?",
    options: [
      { text: "Nitrogen oxides ($NO_x$) and Volatile Organic Compounds (VOCs)", is_correct: true },
      { text: "Sulfur dioxide ($SO_2$) and Particulate Matter", is_correct: false },
      { text: "Carbon monoxide ($CO$) and Ozone", is_correct: false },
      { text: "Methane ($CH_4$) and Ammonia ($NH_3$)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Smog Formation",
          content: "In the presence of UV radiation from sunlight, $NO_x$ and VOCs react to form secondary pollutants, such as ground-level ozone, which is the main component of photochemical smog."
        }
      ]
    }
  },
  {
    topic: "Atmospheric Chemistry",
    title: "Acid Rain Formation",
    question: "Which acid is most commonly formed in the atmosphere from the oxidation of sulfur dioxide ($SO_2$)?",
    options: [
      { text: "Sulfuric acid ($H_2SO_4$)", is_correct: true },
      { text: "Nitric acid ($HNO_3$)", is_correct: false },
      { text: "Hydrochloric acid ($HCl$)", is_correct: false },
      { text: "Carbonic acid ($H_2CO_3$)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Trace Oxidation Path",
          content: "$SO_2$ oxidizes in the atmosphere to form $SO_3$, which then reacts with water vapor to form sulfuric acid ($H_2SO_4$), a major contributor to acid rain."
        }
      ]
    }
  },
  {
    topic: "Atmospheric Chemistry",
    title: "Global Warming Potential",
    question: "Compared to Carbon Dioxide ($CO_2$), Methane ($CH_4$) has a Global Warming Potential (GWP) over a 100-year period that is approximately:",
    options: [
      { text: "25 to 30 times higher", is_correct: true },
      { text: "Equal to $CO_2$", is_correct: false },
      { text: "250 to 300 times higher", is_correct: false },
      { text: "10 times lower", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Compare GWPs",
          content: "While $CH_4$ has a much shorter atmospheric lifetime than $CO_2$, it is far more efficient at trapping radiation. Its 100-year GWP is widely accepted to be around 28-30."
        }
      ]
    }
  },
  // Soil Chemistry (6)
  {
    topic: "Soil Chemistry",
    title: "Cation Exchange Capacity",
    question: "Which of the following soil components generally contributes most to a high Cation Exchange Capacity (CEC)?",
    options: [
      { text: "Clay and organic matter", is_correct: true },
      { text: "Sand and silt", is_correct: false },
      { text: "Gravel", is_correct: false },
      { text: "Calcium carbonate", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define CEC",
          content: "Cation Exchange Capacity is a measure of the soil's ability to hold positively charged ions. Clay minerals and organic matter have high surface areas and net negative charges, leading to high CEC."
        }
      ]
    }
  },
  {
    topic: "Soil Chemistry",
    title: "Soil pH and Nutrient Availability",
    question: "At which of the following soil pH levels is the availability of macronutrients (N, P, K) generally optimal for most plants?",
    options: [
      { text: "6.0 to 7.0", is_correct: true },
      { text: "4.0 to 5.0", is_correct: false },
      { text: "8.0 to 9.0", is_correct: false },
      { text: "3.0 to 4.0", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Optimal pH",
          content: "Most essential macronutrients are highly soluble and available to plant roots in slightly acidic to neutral soils (pH 6.0 to 7.0)."
        }
      ]
    }
  },
  {
    topic: "Soil Chemistry",
    title: "Sorption in Soils",
    question: "The partitioning of a hydrophobic organic contaminant between soil and water is best described by which coefficient?",
    options: [
      { text: "Organic carbon-water partition coefficient ($K_{oc}$)", is_correct: true },
      { text: "Henry's Law constant ($K_H$)", is_correct: false },
      { text: "Acid dissociation constant ($K_a$)", is_correct: false },
      { text: "Solubility product ($K_{sp}$)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Relate Hydrophobicity to Soil Organics",
          content: "Hydrophobic organic compounds tend to sorb onto the organic carbon fraction of the soil. The $K_{oc}$ normalizes the sorption partition coefficient to the organic carbon content."
        }
      ]
    }
  },
  {
    topic: "Soil Chemistry",
    title: "Soil Salinity",
    question: "Which parameter is most commonly used to measure the salinity of soil?",
    options: [
      { text: "Electrical Conductivity (EC)", is_correct: true },
      { text: "pH", is_correct: false },
      { text: "Redox Potential (Eh)", is_correct: false },
      { text: "Cation Exchange Capacity (CEC)", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Salinity Measurement",
          content: "Saline soils contain high levels of soluble salts. Since dissolved salts increase the electrical conductivity of water, measuring the EC of a soil extract is the standard method for determining salinity."
        }
      ]
    }
  },
  {
    topic: "Soil Chemistry",
    title: "Redox Potential in Soils",
    question: "In waterlogged soils where oxygen is depleted, what happens to the redox potential (Eh) and which electron acceptor is typically reduced first?",
    options: [
      { text: "Eh decreases; Nitrate ($NO_3^-$) is reduced", is_correct: true },
      { text: "Eh increases; Iron ($Fe^{3+}$) is reduced", is_correct: false },
      { text: "Eh decreases; Sulfate ($SO_4^{2-}$) is reduced", is_correct: false },
      { text: "Eh increases; Carbon dioxide ($CO_2$) is reduced", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Anaerobic Conditions",
          content: "When soils become anaerobic, the redox potential drops. Following the thermodynamic sequence, after oxygen is depleted, nitrate is the next preferred electron acceptor used by microorganisms."
        }
      ]
    }
  },
  {
    topic: "Soil Chemistry",
    title: "Heavy Metal Mobility",
    question: "How does a decrease in soil pH typically affect the mobility and bioavailability of most heavy metals (e.g., Lead, Cadmium)?",
    options: [
      { text: "Mobility and bioavailability increase", is_correct: true },
      { text: "Mobility and bioavailability decrease", is_correct: false },
      { text: "Mobility increases but bioavailability decreases", is_correct: false },
      { text: "It has no effect on heavy metals", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Relate pH to Metal Solubility",
          content: "At lower pH (more acidic conditions), $H^+$ ions compete with heavy metal cations for exchange sites on soil particles. This causes the metals to desorb and dissolve into the soil solution, increasing their mobility."
        }
      ]
    }
  }
];

// 2. Fluid Mechanics and Hydraulics (fluids-hyd)
const fluidsHydNew = [
  // Closed Conduit Flow (3)
  {
    topic: "Closed Conduit Flow",
    title: "Friction Factor in Turbulent Flow",
    question: "For fully rough turbulent flow in a pipe, the Darcy-Weisbach friction factor $f$ depends primarily on which of the following?",
    options: [
      { text: "Relative roughness only", is_correct: true },
      { text: "Reynolds number only", is_correct: false },
      { text: "Both relative roughness and Reynolds number", is_correct: false },
      { text: "Pipe diameter only", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall the Moody Chart",
          content: "In the fully rough turbulent regime (high Reynolds numbers), the curves on the Moody chart become horizontal, indicating that the friction factor $f$ depends only on the relative roughness ($\\epsilon/D$) and becomes independent of the Reynolds number."
        }
      ]
    }
  },
  {
    topic: "Closed Conduit Flow",
    title: "Minor Losses",
    question: "Head loss due to a sudden expansion in a pipe can be calculated using the velocity in the smaller pipe ($V_1$) and the larger pipe ($V_2$). What is the correct formula for this head loss ($h_L$)?",
    options: [
      { text: "$h_L = \\frac{(V_1 - V_2)^2}{2g}$", is_correct: true },
      { text: "$h_L = \\frac{V_1^2 - V_2^2}{2g}$", is_correct: false },
      { text: "$h_L = K \\frac{V_2^2}{2g}$", is_correct: false },
      { text: "$h_L = \\frac{(V_1 + V_2)^2}{2g}$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Apply Borda-Carnot Equation",
          content: "The energy loss due to a sudden expansion is derived from the momentum and energy equations, leading to the Borda-Carnot equation: $h_L = \\frac{(V_1 - V_2)^2}{2g}$."
        }
      ]
    }
  },
  {
    topic: "Closed Conduit Flow",
    title: "Equivalent Pipe Length",
    question: "The concept of 'equivalent length' is used in pipe network analysis to account for:",
    options: [
      { text: "The head loss of minor fittings expressed as a length of straight pipe", is_correct: true },
      { text: "The length of pipe that gives the same friction factor as a rougher pipe", is_correct: false },
      { text: "The straight line distance between two nodes", is_correct: false },
      { text: "The total length of all branches in a parallel pipe system", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Equivalent Length",
          content: "Minor losses (due to valves, bends) are often converted into an equivalent length of straight pipe ($L_{eq} = K \\frac{D}{f}$) so that all head losses can be treated as friction losses for simplified calculations."
        }
      ]
    }
  },
  // Fluid Statics (3)
  {
    topic: "Fluid Statics",
    title: "Hydrostatic Force on Submerged Plane",
    question: "The magnitude of the resultant hydrostatic force on a completely submerged planar surface is equal to the pressure at the centroid of the surface multiplied by:",
    options: [
      { text: "The total area of the surface", is_correct: true },
      { text: "The depth of the centroid", is_correct: false },
      { text: "The specific weight of the fluid", is_correct: false },
      { text: "The moment of inertia of the surface", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Hydrostatic Force Formula",
          content: "The total force $F$ on a submerged plane is given by $F = P_c A$, where $P_c$ is the pressure at the geometric centroid and $A$ is the area of the plane."
        }
      ]
    }
  },
  {
    topic: "Fluid Statics",
    title: "Center of Pressure",
    question: "For a submerged vertical rectangular gate, the center of pressure is always located:",
    options: [
      { text: "Below the centroid", is_correct: true },
      { text: "At the centroid", is_correct: false },
      { text: "Above the centroid", is_correct: false },
      { text: "At the bottom edge", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Pressure Distribution",
          content: "Because hydrostatic pressure increases linearly with depth, the resultant force acts at the centroid of the pressure prism, which is always located below the geometric centroid of the submerged surface."
        }
      ]
    }
  },
  {
    topic: "Fluid Statics",
    title: "Manometer Principles",
    question: "A U-tube manometer contains a fluid of specific gravity $SG_m = 13.6$. It is used to measure the pressure difference between two pipes carrying water ($SG = 1.0$). If the manometer deflection is $h$, the pressure difference $\\Delta P$ is proportional to:",
    options: [
      { text: "$h(\\gamma_m - \\gamma_w)$", is_correct: true },
      { text: "$h(\\gamma_m + \\gamma_w)$", is_correct: false },
      { text: "$h \\gamma_m$", is_correct: false },
      { text: "$h \\gamma_w$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Apply Hydrostatic Equation",
          content: "Starting from one pipe and moving to the other through the manometer: $P_1 + \\gamma_w z_1 - \\gamma_m h - \\gamma_w z_2 = P_2$. If the pipes are at the same elevation, $\\Delta P = P_1 - P_2 = h(\\gamma_m - \\gamma_w)$."
        }
      ]
    }
  },
  // Open Channel Flow (4)
  {
    topic: "Open Channel Flow",
    title: "Froude Number and Flow Regime",
    question: "In an open channel, if the flow velocity is $2\\ \\text{m/s}$ and the hydraulic depth is $1\\ \\text{m}$ (assume $g = 9.81\\ \\text{m/s}^2$), what is the flow regime?",
    options: [
      { text: "Subcritical flow", is_correct: true },
      { text: "Supercritical flow", is_correct: false },
      { text: "Critical flow", is_correct: false },
      { text: "Laminar flow", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Calculate Froude Number",
          content: "The Froude number is $Fr = \\frac{V}{\\sqrt{g D}}$.\n$$Fr = \\frac{2}{\\sqrt{9.81 \\times 1}} = \\frac{2}{3.13} \\approx 0.64$$"
        },
        {
          title: "Determine Regime",
          content: "Since $Fr < 1$, the flow is subcritical."
        }
      ]
    }
  },
  {
    topic: "Open Channel Flow",
    title: "Hydraulic Jump Energy Loss",
    question: "A hydraulic jump occurs when flow transitions from:",
    options: [
      { text: "Supercritical to subcritical flow", is_correct: true },
      { text: "Subcritical to supercritical flow", is_correct: false },
      { text: "Laminar to turbulent flow", is_correct: false },
      { text: "Critical to subcritical flow", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Hydraulic Jump",
          content: "A hydraulic jump is an abrupt increase in fluid depth accompanied by significant energy loss, which happens when a high-velocity, shallow (supercritical) flow is forced to transition into a low-velocity, deep (subcritical) flow."
        }
      ]
    }
  },
  {
    topic: "Open Channel Flow",
    title: "Manning's Equation Application",
    question: "According to Manning's equation for open channel flow, if the channel slope ($S_0$) is quadrupled while keeping all other parameters constant, the discharge ($Q$) will:",
    options: [
      { text: "Double", is_correct: true },
      { text: "Quadruple", is_correct: false },
      { text: "Increase by a factor of 16", is_correct: false },
      { text: "Remain unchanged", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "State Manning's Equation",
          content: "$Q = \\frac{1}{n} A R^{2/3} S_0^{1/2}$"
        },
        {
          title: "Evaluate Effect of Slope",
          content: "Discharge is proportional to the square root of the slope ($Q \\propto \\sqrt{S_0}$). If $S_0$ becomes $4 S_0$, $Q$ becomes $\\sqrt{4} = 2$ times the original discharge."
        }
      ]
    }
  },
  {
    topic: "Open Channel Flow",
    title: "Best Hydraulic Section",
    question: "For a rectangular open channel, the most efficient hydraulic section (minimum wetted perimeter for a given area) occurs when the ratio of width ($b$) to depth ($y$) is:",
    options: [
      { text: "$b = 2y$", is_correct: true },
      { text: "$b = y$", is_correct: false },
      { text: "$b = 0.5y$", is_correct: false },
      { text: "$b = 4y$", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Optimize Wetted Perimeter",
          content: "Area $A = by$ so $b = A/y$. Wetted perimeter $P = b + 2y = \\frac{A}{y} + 2y$.\nTo minimize $P$, $\\frac{dP}{dy} = -\\frac{A}{y^2} + 2 = 0 \\implies A = 2y^2$.\nSubstituting $A = by$ gives $by = 2y^2$, so $b = 2y$."
        }
      ]
    }
  }
];

// 3. Surface Water Resources and Hydrology (water-hydrology)
const waterHydrologyNew = [
  // Hydrographs (4)
  {
    topic: "Hydrographs",
    title: "Unit Hydrograph Definition",
    question: "A Unit Hydrograph represents the direct runoff response of a catchment to:",
    options: [
      { text: "One unit depth of effective rainfall occurring uniformly over a specified duration", is_correct: true },
      { text: "One inch of total rainfall in one hour", is_correct: false },
      { text: "A storm event producing one unit of peak discharge", is_correct: false },
      { text: "The baseflow contribution over one day", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Unit Hydrograph",
          content: "A unit hydrograph is defined as the direct runoff hydrograph resulting from 1 unit (e.g., 1 inch or 1 cm) of excess rainfall (effective rainfall) generated uniformly over the drainage area at a constant rate for an effective duration."
        }
      ]
    }
  },
  {
    topic: "Hydrographs",
    title: "Baseflow Separation",
    question: "Which of the following is NOT a common method for separating baseflow from a total runoff hydrograph?",
    options: [
      { text: "Rational Method", is_correct: true },
      { text: "Straight-line method", is_correct: false },
      { text: "Fixed base method", is_correct: false },
      { text: "Variable slope method", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Baseflow Separation Techniques",
          content: "Straight-line, fixed base, and variable slope are standard empirical techniques to separate baseflow. The Rational Method ($Q=CIA$) is used to estimate peak runoff for small catchments, not to separate baseflow."
        }
      ]
    }
  },
  {
    topic: "Hydrographs",
    title: "Time of Concentration",
    question: "The time of concentration ($T_c$) for a watershed is strictly defined as the time required for water to travel from:",
    options: [
      { text: "The hydraulically most remote point of the basin to the outlet", is_correct: true },
      { text: "The centroid of the basin to the outlet", is_correct: false },
      { text: "The onset of rainfall to the peak of the hydrograph", is_correct: false },
      { text: "The start of direct runoff to the end of direct runoff", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define $T_c$",
          content: "Time of concentration is the time needed for a drop of water to travel from the most hydraulically distant point in the watershed to the point of interest (outlet), ensuring the entire basin is contributing to runoff."
        }
      ]
    }
  },
  {
    topic: "Hydrographs",
    title: "S-Curve Application",
    question: "In unit hydrograph theory, what is the primary purpose of constructing an S-curve?",
    options: [
      { text: "To convert a unit hydrograph of a specific duration to one of a different duration", is_correct: true },
      { text: "To estimate groundwater recharge", is_correct: false },
      { text: "To route a flood through a reservoir", is_correct: false },
      { text: "To calculate total evaporation over a basin", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain S-Curve",
          content: "An S-curve represents the continuous cumulative runoff from a continuous effective rainfall of 1 unit/duration. Shifting two S-curves allows the derivation of a unit hydrograph of any duration (integer or fractional)."
        }
      ]
    }
  },
  // Hydrologic Cycle (3)
  {
    topic: "Hydrologic Cycle",
    title: "Evapotranspiration",
    question: "The combined process by which water is transferred from the land to the atmosphere by evaporation from the soil and other surfaces and by transpiration from plants is called:",
    options: [
      { text: "Evapotranspiration", is_correct: true },
      { text: "Infiltration", is_correct: false },
      { text: "Sublimation", is_correct: false },
      { text: "Percolation", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Evapotranspiration",
          content: "Evapotranspiration (ET) accounts for both the physical evaporation of water from soil and water bodies, and the biological transpiration from plant leaves."
        }
      ]
    }
  },
  {
    topic: "Hydrologic Cycle",
    title: "Water Balance Equation",
    question: "For a given watershed over a specific time period, the general water balance equation can be written as $P - R - G - E - T = \\Delta S$. What does $\\Delta S$ represent?",
    options: [
      { text: "Change in total water storage", is_correct: true },
      { text: "Surface runoff", is_correct: false },
      { text: "Total precipitation", is_correct: false },
      { text: "Groundwater depletion", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Terms",
          content: "In mass balance equations for hydrology, inputs (Precipitation P) minus outputs (Runoff R, Groundwater flow G, Evaporation E, Transpiration T) equals the change in storage ($\\Delta S$) within the watershed."
        }
      ]
    }
  },
  {
    topic: "Hydrologic Cycle",
    title: "Infiltration Capacity",
    question: "Horton's equation models infiltration capacity. As a rainstorm continues over dry soil, the infiltration capacity:",
    options: [
      { text: "Decreases exponentially towards a constant minimum rate", is_correct: true },
      { text: "Increases linearly with time", is_correct: false },
      { text: "Remains constant throughout the storm", is_correct: false },
      { text: "Drops immediately to zero when the soil is saturated", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Horton's Equation",
          content: "Horton's equation $f(t) = f_c + (f_0 - f_c)e^{-kt}$ shows that infiltration starts at a high initial rate ($f_0$) and decays exponentially to a lower, steady-state rate ($f_c$) as the soil becomes saturated."
        }
      ]
    }
  },
  // Runoff (3)
  {
    topic: "Runoff",
    title: "Rational Method Coefficient",
    question: "In the Rational Method formula $Q = CIA$, the runoff coefficient $C$ represents:",
    options: [
      { text: "The ratio of peak runoff rate to average rainfall intensity", is_correct: true },
      { text: "The total volume of infiltration", is_correct: false },
      { text: "The roughness of the channel", is_correct: false },
      { text: "The slope of the watershed", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define C",
          content: "The runoff coefficient $C$ is a dimensionless factor representing the fraction of rainfall that becomes direct surface runoff. It inherently accounts for losses like infiltration and depression storage."
        }
      ]
    }
  },
  {
    topic: "Runoff",
    title: "NRCS Curve Number Method",
    question: "Using the NRCS (SCS) Curve Number method, a higher Curve Number (CN) indicates:",
    options: [
      { text: "Higher runoff potential and lower infiltration", is_correct: true },
      { text: "Lower runoff potential and higher infiltration", is_correct: false },
      { text: "Denser vegetation cover", is_correct: false },
      { text: "Sandy soils with high permeability", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Understand Curve Numbers",
          content: "The Curve Number ranges from 0 to 100. A value of 100 represents an impermeable surface (like concrete) with maximum runoff, while lower numbers represent permeable soils with high infiltration."
        }
      ]
    }
  },
  {
    topic: "Runoff",
    title: "Antecedent Moisture Condition",
    question: "In rainfall-runoff modeling, AMC II represents which condition?",
    options: [
      { text: "Average soil moisture conditions prior to the storm", is_correct: true },
      { text: "Dry soil conditions (wilting point)", is_correct: false },
      { text: "Fully saturated soil conditions", is_correct: false },
      { text: "Frozen soil conditions", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define AMC Levels",
          content: "The NRCS methodology classifies Antecedent Moisture Conditions into three levels: AMC I (dry), AMC II (average/normal), and AMC III (wet/near saturation)."
        }
      ]
    }
  }
];

// 4. Solid and Hazardous Waste (waste)
const wasteNew = [
  // Disposal Methods (3)
  {
    topic: "Disposal Methods",
    title: "Sanitary Landfill Daily Cover",
    question: "What is the primary purpose of applying daily cover (usually 6 inches of soil) in a sanitary landfill?",
    options: [
      { text: "To control vectors, odors, and blowing litter", is_correct: true },
      { text: "To prevent groundwater contamination", is_correct: false },
      { text: "To increase the rate of waste decomposition", is_correct: false },
      { text: "To collect and remove landfill gas", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Identify Daily Cover Function",
          content: "While liners and leachate collection systems prevent groundwater contamination, daily cover is an operational practice specifically designed to manage nuisances like rats, birds, insects, odors, and loose trash."
        }
      ]
    }
  },
  {
    topic: "Disposal Methods",
    title: "Incineration Volume Reduction",
    question: "Municipal solid waste incineration typically reduces the volume of the waste by approximately:",
    options: [
      { text: "80% to 90%", is_correct: true },
      { text: "40% to 50%", is_correct: false },
      { text: "95% to 99%", is_correct: false },
      { text: "20% to 30%", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Recall Incinerator Stats",
          content: "Mass-burn incinerators convert solid waste into ash, reducing the mass by roughly 70-75% and the volume by 80-90%, thereby saving significant landfill space."
        }
      ]
    }
  },
  {
    topic: "Disposal Methods",
    title: "Composting Process",
    question: "In the context of solid waste management, municipal composting is primarily considered a:",
    options: [
      { text: "Aerobic biological degradation process", is_correct: true },
      { text: "Anaerobic chemical reduction process", is_correct: false },
      { text: "Thermal oxidation process", is_correct: false },
      { text: "Physical separation process", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define Composting",
          content: "Composting relies on aerobic microorganisms to rapidly break down organic waste into a stable humus-like product. It requires adequate oxygen, moisture, and a proper C:N ratio."
        }
      ]
    }
  },
  // Hazardous Waste (2)
  {
    topic: "Hazardous Waste",
    title: "RCRA Definition of Hazardous",
    question: "Under the Resource Conservation and Recovery Act (RCRA), which of the following is NOT one of the four characteristic properties of hazardous waste?",
    options: [
      { text: "Radioactivity", is_correct: true },
      { text: "Ignitability", is_correct: false },
      { text: "Corrosivity", is_correct: false },
      { text: "Reactivity", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "List RCRA Characteristics",
          content: "The EPA defines characteristic hazardous wastes under RCRA using four properties: Ignitability, Corrosivity, Reactivity, and Toxicity. Radioactivity is regulated separately under the Atomic Energy Act."
        }
      ]
    }
  },
  {
    topic: "Hazardous Waste",
    title: "TCLP Testing",
    question: "The Toxicity Characteristic Leaching Procedure (TCLP) is used to simulate which of the following scenarios?",
    options: [
      { text: "Leaching of contaminants in a municipal solid waste landfill", is_correct: true },
      { text: "Volatilization of organics in an incinerator", is_correct: false },
      { text: "Direct human exposure via ingestion", is_correct: false },
      { text: "Biomagnification in aquatic food webs", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain TCLP",
          content: "TCLP is an extraction method designed to simulate the leaching that occurs when a waste is co-disposed with municipal solid waste in a landfill, determining its toxicity characteristic."
        }
      ]
    }
  },
  // Waste Collection (5)
  {
    topic: "Waste Collection",
    title: "Collection Economics",
    question: "In a typical municipal solid waste management system, which phase accounts for the largest percentage of total costs?",
    options: [
      { text: "Collection and transport", is_correct: true },
      { text: "Landfill operation", is_correct: false },
      { text: "Incineration", is_correct: false },
      { text: "Sorting and recycling", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Analyze Cost Distribution",
          content: "Due to high labor, equipment, fuel, and maintenance costs, collection and transportation usually account for 60% to 80% of the total cost of municipal solid waste management."
        }
      ]
    }
  },
  {
    topic: "Waste Collection",
    title: "Hauled Container vs Stationary Container",
    question: "In a 'hauled-container system' for solid waste collection:",
    options: [
      { text: "The container is picked up, transported to disposal, emptied, and returned", is_correct: true },
      { text: "Waste is unloaded from small containers into a larger compactor truck on site", is_correct: false },
      { text: "Residents bring their waste to a central transfer station", is_correct: false },
      { text: "Waste is transported via underground pneumatic tubes", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Define System Types",
          content: "In a hauled-container system (like roll-off dumpsters), the entire container full of waste is hauled to the disposal site. In a stationary-container system, the container is emptied into the collection vehicle and left at the site."
        }
      ]
    }
  },
  {
    topic: "Waste Collection",
    title: "Transfer Stations",
    question: "What is the primary economic justification for constructing a solid waste transfer station?",
    options: [
      { text: "When the distance to the final disposal site makes direct hauling in small collection vehicles too costly", is_correct: true },
      { text: "To eliminate the need for sanitary landfills", is_correct: false },
      { text: "To serve as a long-term storage facility for hazardous waste", is_correct: false },
      { text: "To convert waste into energy on-site", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Explain Transfer Station Purpose",
          content: "Transfer stations consolidate waste from multiple small local collection trucks into larger long-haul vehicles (trailers or trains). This is economically viable only when the final disposal site is far away."
        }
      ]
    }
  },
  {
    topic: "Waste Collection",
    title: "Routing Heuristics",
    question: "Which of the following is a standard heuristic guideline for designing waste collection routes?",
    options: [
      { text: "Routes should not overlap, and should begin as close to the garage as possible", is_correct: true },
      { text: "Vehicles should always travel in counter-clockwise circles", is_correct: false },
      { text: "Waste should be collected on heavily trafficked streets during peak rush hours", is_correct: false },
      { text: "Steep hills should be traversed going uphill during collection", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Review Routing Guidelines",
          content: "Good routing minimizes deadheading (traveling without collecting). Standard rules include avoiding overlaps, starting near the depot, collecting on right-hand sides of busy streets, and traversing steep hills downhill for safety and fuel efficiency."
        }
      ]
    }
  },
  {
    topic: "Waste Collection",
    title: "Compaction Ratio",
    question: "A collection vehicle compresses 20 cubic yards of loose waste into 5 cubic yards. What is the compaction ratio?",
    options: [
      { text: "4:1", is_correct: true },
      { text: "0.25:1", is_correct: false },
      { text: "15:1", is_correct: false },
      { text: "25:1", is_correct: false }
    ],
    solution: {
      steps: [
        {
          title: "Calculate Compaction Ratio",
          content: "The compaction ratio is the ratio of the initial volume of loose waste to the final volume of compacted waste.\n$$CR = \\frac{V_i}{V_f} = \\frac{20}{5} = 4$$\nThus, it is a 4:1 compaction ratio."
        }
      ]
    }
  }
];

// Rotate all and merge
const allNewQuestions = {
  "env-chem": rotateAnswers(envChemNew, 0),
  "fluids-hyd": rotateAnswers(fluidsHydNew, 0),
  "water-hydrology": rotateAnswers(waterHydrologyNew, 0),
  "waste": rotateAnswers(wasteNew, 0)
};

// Add to questionsObj
for (const [subj, newQs] of Object.entries(allNewQuestions)) {
  if (questionsObj[subj]) {
    questionsObj[subj].push(...newQs);
  } else {
    questionsObj[subj] = newQs;
  }
}

// Write back
const updatedJson = JSON.stringify(questionsObj, null, 4);
const prefixContent = fileContent.substring(0, fileContent.indexOf('const QUESTIONS ='));
fs.writeFileSync('questions.js', prefixContent + 'const QUESTIONS = ' + updatedJson + ';\n', 'utf8');

console.log(`Successfully added 40 questions to Environmental Engineering gaps.`);
