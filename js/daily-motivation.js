/**
 * ENGG.tv - Daily Motivation & Discipline FE Theorem Module
 * Displays daily inspiring engineering quotes and discipline-specific FE exam theorems.
 */

(function() {
    const QUOTES = [
        {
            quote: "Scientists study the world as it is; engineers create the world that has never been.",
            author: "Theodore von Kármán",
            role: "Aerospace Pioneer & Mathematician"
        },
        {
            quote: "Genius is one percent inspiration, and ninety-nine percent perspiration. Keep grinding your practice problems.",
            author: "Thomas Edison",
            role: "Prolific Inventor"
        },
        {
            quote: "The present is theirs; the future, for which I really worked, is mine.",
            author: "Nikola Tesla",
            role: "Father of Alternating Current"
        },
        {
            quote: "What I cannot create, I do not understand. Work the equations until the physics clicks.",
            author: "Richard Feynman",
            role: "Nobel Laureate in Physics"
        },
        {
            quote: "Failure is simply the opportunity to begin again, this time more intelligently.",
            author: "Henry Ford",
            role: "Industrialist & Engineer"
        },
        {
            quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
            author: "Marie Curie",
            role: "Pioneer in Radioactivity"
        },
        {
            quote: "Simplicity is the ultimate sophistication in engineering design.",
            author: "Leonardo da Vinci",
            role: "Renaissance Polymath & Engineer"
        },
        {
            quote: "Give me a place to stand, and a lever long enough, and I will move the world.",
            author: "Archimedes",
            role: "Classical Greek Mathematician & Engineer"
        },
        {
            quote: "An engineer is someone who can do for a nickel what any fool can do for a dollar.",
            author: "Arthur Mellen Wellington",
            role: "Civil Engineer"
        },
        {
            quote: "Information is the resolution of uncertainty. Every practice question reduces your test-day uncertainty.",
            author: "Claude Shannon",
            role: "Father of Information Theory"
        },
        {
            quote: "One small step for a man, one giant leap for mankind. Focus on completing one topic at a time.",
            author: "Neil Armstrong",
            role: "Aerospace Engineer & Astronaut"
        },
        {
            quote: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
            author: "Antoine de Saint-Exupéry",
            role: "Aviation Pioneer"
        },
        {
            quote: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
            author: "John C. Maxwell",
            role: "Leadership Author"
        },
        {
            quote: "You don't have to be great to start, but you have to start to be great. Open your notes and begin.",
            author: "Zig Ziglar",
            role: "Performance Author"
        },
        {
            quote: "The best way to predict the future is to design and build it yourself.",
            author: "Alan Kay",
            role: "Computer Scientist"
        }
    ];

    const THEOREMS_BY_DISCIPLINE = {
        "Mechanical": [
                {
                        "title": "Bernoulli’s Principle",
                        "formula": "$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g z_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g z_2$$",
                        "description": "States that for an inviscid, incompressible fluid in steady streamline flow, the sum of static pressure, dynamic pressure, and hydrostatic pressure is constant along a streamline.",
                        "examTip": "Search NCEES Handbook under Fluid Mechanics. Ensure you use consistent gauge vs absolute pressures and watch out for elevation head datum.",
                        "videoUrl": "assets/videos/Bernoullis_Principle.mp4",
                        "videoTitle": "Bernoulli's Principle Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Fourier’s Law of Thermal Conduction",
                        "formula": "$$\\dot{Q} = -k A \\frac{dT}{dx}$$",
                        "description": "Defines the rate of heat transfer through a material as directly proportional to the negative temperature gradient and the cross-sectional area perpendicular to heat flow.",
                        "examTip": "Found under Heat Transfer. For multi-layer planar walls or cylindrical pipes, use the thermal resistance analogy: $R_{th} = \\frac{L}{k A}$.",
                        "videoUrl": "assets/videos/Fouriers_Law.mp4",
			"videoTitle": "Fourier's Law Thermal Conduction Explainer",
			"videoDuration": "10s"
                },
                {
                        "title": "Carnot Thermal Efficiency (Maximum Limit)",
                        "formula": "$$\\eta_{\\text{Carnot}} = 1 - \\frac{T_L}{T_H} = \\frac{T_H - T_L}{T_H}$$",
                        "description": "Represents the absolute theoretical maximum efficiency that any heat engine operating between two thermal reservoirs can achieve.",
                        "examTip": "Found under Thermodynamics. Crucial test rule: Always convert temperatures to absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}) before calculating!",
                        "videoUrl": "assets/videos/Carnot_Cycle.mp4",
                        "videoTitle": "Carnot Cycle Thermodynamic p-V Diagram",
                        "videoDuration": "10s"
                },
                {
                        "title": "Mohr’s Circle for Plane Stress",
                        "formula": "$$\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}$$",
                        "description": "A graphical and analytical transformation for plane stress, yielding in-plane principal normal stresses and maximum in-plane shear stress.",
                        "examTip": "Found in Mechanics of Materials. The radius of the circle directly equals the maximum in-plane shear stress $\\tau_{\\text{max}}$.",
                        "videoUrl": "assets/videos/Mohrs_Circle.mp4",
                        "videoTitle": "Mohr's Circle for Plane Stress Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Parallel Axis Theorem (Second Moment of Area)",
                        "formula": "$$I_x = I_{xc} + A d^2$$",
                        "description": "Calculates the area moment of inertia of a shape about any arbitrary axis parallel to its centroidal axis.",
                        "examTip": "Found in Statics / Dynamics. Variable $d$ is strictly the perpendicular distance from the component centroid to the reference axis.",
                        "videoUrl": "assets/videos/Parallel_Axis_Theorem.mp4",
                        "videoTitle": "Parallel Axis Theorem Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "First Law of Thermodynamics (Closed System)",
                        "formula": "$$\\Delta U = Q - W = m c_v (T_2 - T_1)$$",
                        "description": "States conservation of energy for a stationary closed system: net change in internal energy equals net heat added minus net boundary work done by the system.",
                        "examTip": "Found in Thermodynamics. Sign convention: Heat added is positive ($+Q$); work done by system is positive ($+W$). For ideal gases, internal energy depends only on temperature.",
                        "videoUrl": "assets/videos/First_Law_of_Thermodynamics.mp4",
                        "videoTitle": "First Law of Thermodynamics Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Darcy-Weisbach Equation (Friction Head Loss)",
                        "videoUrl": "assets/videos/Darcy_Weisbach_Equation.mp4",
                        "videoTitle": "Darcy-Weisbach Equation Explainer",
                        "videoDuration": "10s",
                        "formula": "$$h_f = f \\frac{L}{D} \\frac{v^2}{2g}$$",
                        "description": "Computes head loss due to wall friction in fully developed circular pipe flow as a function of friction factor $f$, length $L$, diameter $D$, and mean velocity $v$.",
                        "examTip": "Found in Fluid Mechanics. In laminar pipe flow ($Re < 2100$), $f = 64/Re$. In turbulent flow, find $f$ on the Moody diagram using relative roughness $\\epsilon/D$."
                },
                {
                        "title": "Euler’s Critical Buckling Load for Columns",
                        "videoUrl": "assets/videos/Eulers_Critical_Buckling_Load.mp4",
                        "videoTitle": "Euler's Critical Buckling Load Explainer",
                        "videoDuration": "10s",
                        "formula": "$$P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}$$",
                        "description": "Calculates the maximum axial compressive load that a slender column can sustain before undergoing sudden elastic lateral buckling.",
                        "examTip": "Found in Mechanics of Materials. Check column end support factors: $K=0.5$ (fixed-fixed), $K=0.7$ (fixed-pinned), $K=1.0$ (pinned-pinned), $K=2.0$ (fixed-free)."
                },
                {
                        "title": "Newton’s Law of Cooling (Convective Heat Transfer)",
                        "videoUrl": "assets/videos/Newtons_Law_of_Cooling.mp4",
                        "videoTitle": "Newton's Law of Cooling Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\dot{Q}_{conv} = h A_s (T_s - T_\\infty)$$",
                        "description": "Quantifies convective heat transfer between a solid surface and an adjacent moving fluid, driven by temperature difference and convective heat transfer coefficient $h$.",
                        "examTip": "Found in Heat Transfer. Convection thermal resistance is $R_{th} = 1 / (h A_s)$. Note that $h$ is not a material constant; it depends on flow velocity, geometry, and fluid properties."
                },
                {
                        "title": "Stefan-Boltzmann Law of Thermal Radiation",
                        "videoUrl": "assets/videos/Stefan_Boltzmann_Law.mp4",
                        "videoTitle": "Stefan-Boltzmann Law Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\dot{Q}_{emit} = \\epsilon \\sigma A T^4, \\quad \\sigma = 5.67 \\times 10^{-8} \\text{ W}/(\\text{m}^2 \\cdot \\text{K}^4)$$",
                        "description": "Total radiant energy emitted per unit time by a real surface is proportional to surface emissivity $\\epsilon$ and the fourth power of absolute temperature $T$.",
                        "examTip": "Found in Heat Transfer. Mandatory rule: Surface temperature $T$ must ALWAYS be in absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}). For an ideal blackbody, $\\epsilon = 1$."
                },
                {
                        "title": "Generalized Hooke’s Law (3D Elastic Stress-Strain)",
                        "formula": "$$\\epsilon_x = \\frac{1}{E}\\left[\\sigma_x - \\nu(\\sigma_y + \\sigma_z)\\right]$$",
                        "description": "Relates elastic normal strain along a Cartesian axis to multi-axial normal stresses and Poisson's ratio $\\nu$ in linear isotropic materials.",
                        "examTip": "Found in Mechanics of Materials. Even under uniaxial tension ($\\sigma_y = \\sigma_z = 0$), lateral strains $\\epsilon_y = \\epsilon_z = -\\nu \\sigma_x / E$ still develop!"
                },
                {
                        "title": "Elastic Flexure Formula (Beam Bending Stress)",
                        "formula": "$$\\sigma_b = -\\frac{M y}{I} \\implies \\sigma_{\\text{max}} = \\frac{M}{S}$$",
                        "description": "Determines normal bending stress at distance $y$ from the centroidal neutral axis under bending moment $M$, where $S = I/c$ is elastic section modulus.",
                        "examTip": "Found in Mechanics of Materials. Maximum bending stress occurs at outermost fibers ($y = \\pm c$). For a rectangular cross section ($b \\times h$), $S = b h^2 / 6$.",
                        "videoUrl": "assets/videos/Bending_Formula.mp4",
                        "videoTitle": "Bending Formula (Beam Flexure Stress)",
                        "videoDuration": "10s"
                },
                {
                        "title": "Torsion Formula (Shaft Shear Stress & Twist)",
                        "formula": "$$\\tau = \\frac{T r}{J}, \\quad \\phi = \\frac{T L}{G J}$$",
                        "description": "Computes shear stress $\\tau$ at radius $r$ and total angular twist $\\phi$ in a circular shaft carrying torsional moment $T$, shear modulus $G$, and polar moment $J$.",
                        "examTip": "Found in Mechanics of Materials. Polar moment of inertia for a solid circular shaft is $J = \\pi d^4 / 32$. For a hollow tube: $J = \\pi(d_o^4 - d_i^4) / 32$.",
                        "videoUrl": "assets/videos/Torsion_Formula.mp4",
                        "videoTitle": "Torsion Formula (Shaft Shear Stress & Twist)",
                        "videoDuration": "10s"
                },
                {
                        "title": "Log Mean Temperature Difference (LMTD Heat Exchangers)",
                        "videoUrl": "assets/videos/LMTD.mp4",
                        "videoTitle": "Log Mean Temperature Difference (LMTD) Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}, \\quad \\dot{Q} = U A F \\Delta T_{lm}$$",
                        "description": "Evaluates the effective temperature driving force in parallel-flow and counter-flow heat exchangers with overall heat transfer coefficient $U$ and area $A$.",
                        "examTip": "Found in Heat Transfer. Counter-flow arrangements produce a higher $\\Delta T_{lm}$ than parallel-flow for identical temperature endpoints, requiring less heat exchange area."
                },
                {
                        "title": "Reynolds Number (Dynamic Similarity & Flow Regime)",
                        "videoUrl": "assets/videos/Reynolds_Number.mp4",
                        "videoTitle": "Reynolds Number Explainer",
                        "videoDuration": "10s",
                        "formula": "$$Re = \\frac{\\rho v D}{\\mu} = \\frac{v D}{\\nu}$$",
                        "description": "Dimensionless parameter representing ratio of inertial forces to viscous forces; governs laminar vs turbulent transitions in pipe and boundary layer flows.",
                        "examTip": "Found in Fluid Mechanics. For internal conduit flow: $Re < 2100$ is laminar; $Re > 4000$ is turbulent. Kinematic viscosity is $\\nu = \\mu / \\rho$."
                },
                {
                        "title": "Work-Energy Principle (Rigid Body Dynamics)",
                        "formula": "$$T_1 + \\sum U_{1-2} = T_2, \\quad T = \\frac{1}{2} m v_G^2 + \\frac{1}{2} I_G \\omega^2$$",
                        "description": "The net work done by all external forces and couples acting on a body during displacement equals the change in its total kinetic energy (translation plus rotation).",
                        "examTip": "Found in Dynamics. For rolling without slipping on stationary surfaces, kinetic energy simplifies to $T = \\frac{1}{2} I_{IC} \\omega^2$ about the instantaneous center."
                },
                {
                        "title": "Castigliano’s Second Theorem (Deflection from Strain Energy)",
                        "formula": "$$\\delta_i = \\frac{\\partial U}{\\partial P_i}, \\quad \\theta_i = \\frac{\\partial U}{\\partial M_i}$$",
                        "description": "The partial derivative of total elastic strain energy $U$ with respect to an applied concentrated force $P_i$ equals the displacement $\\delta_i$ in that direction.",
                        "examTip": "Found in Mechanics of Materials. For bending beams: $U = \\int \\frac{M^2}{2EI} dx$. Differentiate under the integral: $\\delta_i = \\int \\frac{M}{EI}\\left(\\frac{\\partial M}{\\partial P_i}\\right) dx$."
                },
                {
                        "title": "Ideal Rankine Cycle Thermal Efficiency (Vapor Power)",
                        "videoUrl": "assets/videos/Rankine_Cycle.mp4",
                        "videoTitle": "Ideal Rankine Cycle Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\eta_{\\text{th}} = \\frac{w_{\\text{net}}}{q_{\\text{in}}} = \\frac{(h_3 - h_4) - (h_2 - h_1)}{h_3 - h_2}$$",
                        "description": "Defines thermal efficiency of steam power cycles using thermodynamic enthalpies at boiler inlet, turbine inlet, condenser inlet, and pump inlet.",
                        "examTip": "Found in Thermodynamics. Pump work is $w_p = h_2 - h_1 \\approx v_1(P_2 - P_1)$. Remember to convert $v_1$ in $\\text{m}^3/\\text{kg}$ and $P$ in $\\text{kPa}$ to yield $\\text{kJ/kg}$."
                },
                {
                        "title": "Continuity Equation (Conservation of Mass)",
                        "formula": "$$\\dot{m} = \\rho_1 A_1 v_1 = \\rho_2 A_2 v_2 \\implies Q = A_1 v_1 = A_2 v_2$$",
                        "description": "Expresses steady mass conservation in conduits; when fluid density $\\rho$ is constant, volumetric flow rate $Q = A v$ is invariant along any streamtube.",
                        "examTip": "Found in Fluid Mechanics. Velocity is inversely proportional to diameter squared: $v_2 = v_1 (D_1 / D_2)^2$. Halving the pipe diameter quadruples fluid velocity.",
                        "videoUrl": "assets/videos/Continuity_Equation.mp4",
                        "videoTitle": "Continuity Equation (Conservation of Mass) Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Thin-Walled Pressure Vessel (Hoop vs Longitudinal Stress)",
                        "formula": "$$\\sigma_h = \\frac{P r}{t} = \\frac{P d}{2t}, \\quad \\sigma_l = \\frac{P r}{2t} = \\frac{P d}{4t}$$",
                        "description": "Calculates circumferential hoop stress $\\sigma_h$ and longitudinal stress $\\sigma_l$ for thin cylindrical shells where ratio $r/t \\ge 10$.",
                        "examTip": "Found in Mechanics of Materials. Hoop stress is twice longitudinal stress ($\\sigma_h = 2\\sigma_l$). Failure in cylindrical tanks almost always occurs along longitudinal seams.",
                        "videoUrl": "assets/videos/Pressure_Vessels.mp4",
                        "videoTitle": "Thin-Walled Pressure Vessels Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "SDOF Undamped Natural Frequency (Mechanical Vibrations)",
                        "videoUrl": "assets/videos/Single_DOF_Natural_Frequency.mp4",
                        "videoTitle": "Single DOF Natural Frequency Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\omega_n = \\sqrt{\\frac{k}{m}} \\text{ [rad/s]}, \\quad f_n = \\frac{\\omega_n}{2\\pi} = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} \\text{ [Hz]}$$",
                        "description": "Calculates fundamental natural circular frequency $\\omega_n$ and cyclic frequency $f_n$ for a single-degree-of-freedom mass-spring mechanical oscillator.",
                        "examTip": "Found in Mechanical Design and Dynamics. Watch units closely: $\\omega_n$ is in rad/s, while $f_n$ is in cycles/s (Hz). Natural period is $\\tau_n = 1 / f_n = 2\\pi / \\omega_n$."
                },
                {
                        "title": "Ideal Otto Cycle Efficiency (Internal Combustion)",
                        "videoUrl": "assets/videos/Otto_Cycle.mp4",
                        "videoTitle": "Air-Standard Otto Cycle Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\eta_{\\text{th, Otto}} = 1 - \\frac{1}{r^{k-1}}, \\quad r = \\frac{V_{\\text{max}}}{V_{\\text{min}}}$$",
                        "description": "Thermal efficiency of idealized four-stroke spark-ignition engines as a function of volumetric compression ratio $r$ and specific heat ratio $k = c_p/c_v$.",
                        "examTip": "Found in Thermodynamics. For cold air standard assumptions, $k = 1.4$. Increasing compression ratio improves efficiency, limited practically by engine knock."
                },
                {
                        "title": "Speed of Sound & Mach Number (Compressible Flow)",
                        "videoUrl": "assets/videos/Speed_of_Sound_and_Mach_Number.mp4",
                        "videoTitle": "Speed of Sound & Mach Number Explainer",
                        "videoDuration": "10s",
                        "formula": "$$c = \\sqrt{k R T}, \\quad M = \\frac{v}{c}$$",
                        "description": "Calculates acoustic speed $c$ in an ideal gas and Mach number $M$, establishing boundaries between subsonic ($M < 1$), sonic ($M = 1$), and supersonic ($M > 1$) flows.",
                        "examTip": "Found in Fluid Mechanics. Specific gas constant for air is $R = 287 \\text{ J/(kg}\\cdot\\text{K)}$. Temperature $T$ must ALWAYS be in absolute Kelvin (\\text{K})."
                },
                {
                        "title": "Modified Goodman Fatigue Criterion (Fluctuating Stresses)",
                        "formula": "$$\\frac{\\sigma_a}{S_e} + \\frac{\\sigma_m}{S_{ut}} = \\frac{1}{N_f}$$",
                        "description": "Evaluates fatigue safety factor $N_f$ for ductile mechanical parts under cyclic loading with alternating stress $\\sigma_a$, mean stress $\\sigma_m$, endurance limit $S_e$, and ultimate tensile strength $S_{ut}$.",
                        "examTip": "Found in Mechanical Design. Alternating stress $\\sigma_a = (\\sigma_{\\text{max}} - \\sigma_{\\text{min}})/2$; mean stress $\\sigma_m = (\\sigma_{\\text{max}} + \\sigma_{\\text{min}})/2$. If $\\sigma_m \\le 0$, mean stress effect is zero."
                },
                {
                        "title": "Linear Impulse and Momentum Theorem (Impact & Jet Forces)",
                        "formula": "$$\\vec{I} = \\int_{t_1}^{t_2} \\sum \\vec{F} dt = m \\vec{v}_2 - m \\vec{v}_1 = \\Delta \\vec{p}$$",
                        "description": "The net impulse of external forces acting on a body over time interval $\\Delta t$ equals the vector change in linear momentum, fundamental to impact and fluid vane reactions.",
                        "examTip": "Found in Dynamics and Fluid Mechanics. For steady fluid jets deflecting across stationary/moving blades: $\\vec{F} = \\dot{m}(\\vec{v}_{in} - \\vec{v}_{out})$. Respect vector directions!",
                        "videoUrl": "assets/videos/Impulse_Momentum_Principle.mp4",
                        "videoTitle": "Linear Impulse and Momentum Theorem Explainer",
                        "videoDuration": "10s"
                }
        ],
        "Civil": [
                {
                        "title": "Darcy’s Law for Hydraulic Seepage",
                        "formula": "$$Q = k \\cdot i \\cdot A = k \\left(\\frac{\\Delta h}{L}\\right) A$$",
                        "description": "Governs fluid flow through porous soil media; discharge $Q$ is proportional to hydraulic conductivity $k$, gradient $i$, and cross-sectional seepage area $A$.",
                        "examTip": "Found in Geotechnical Engineering. Watch unit conversions: hydraulic conductivity $k$ is often given in $\\text{cm/s}$, while area is in $\\text{m}^2$ or $\\text{ft}^2$."
                },
                {
                        "title": "Manning’s Equation for Open Channel Flow",
                        "videoUrl": "assets/videos/Mannings_Equation.mp4",
                        "videoTitle": "Manning's Equation Explainer",
                        "videoDuration": "10s",
                        "formula": "$$V = \\frac{k}{n} R_h^{2/3} S^{1/2} \\quad (k = 1.0\\text{ SI}, \\; 1.486\\text{ USCS})$$",
                        "description": "Estimates mean velocity of uniform gravity-driven open channel flow as a function of roughness coefficient $n$, hydraulic radius $R_h$, and channel bed slope $S$.",
                        "examTip": "Found in Hydraulics and Hydrologic Systems. Hydraulic radius $R_h = A / P_w$, where $P_w$ is strictly the wetted perimeter."
                },
                {
                        "title": "Terzaghi’s Effective Stress Principle",
                        "formula": "$$\\sigma' = \\sigma - u$$",
                        "description": "Total normal stress $\\sigma$ applied to a soil mass is partitioned between the mineral skeleton (effective stress $\\sigma'$) and interstitial pore water pressure $u$.",
                        "examTip": "Found in Geotechnical Engineering. Only effective stress $\\sigma'$ controls soil shear strength and consolidation settlement. Pore water carries zero shear stress."
                },
                {
                        "title": "Euler’s Critical Buckling Load for Columns",
                        "videoUrl": "assets/videos/Eulers_Critical_Buckling_Load.mp4",
                        "videoTitle": "Euler's Critical Buckling Load Explainer",
                        "videoDuration": "10s",
                        "formula": "$$P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}$$",
                        "description": "Determines the maximum axial compressive load that a slender structural column can sustain before undergoing sudden lateral elastic instability.",
                        "examTip": "Found in Structural Mechanics and Steel Design. Effective length factor $K$: pinned-pinned $K=1.0$, fixed-fixed $K=0.5$, fixed-pinned $K=0.7$, fixed-free $K=2.0$."
                },
                {
                        "title": "Boussinesq Vertical Stress Distribution",
                        "formula": "$$\\Delta \\sigma_z = \\frac{3 P}{2\\pi z^2} \\left[1 + \\left(\\frac{r}{z}\\right)^2\\right]^{-5/2}$$",
                        "description": "Calculates the increase in vertical stress $\\Delta \\sigma_z$ at depth $z$ and radial distance $r$ inside a semi-infinite, elastic soil mass due to a concentrated surface point load $P$.",
                        "examTip": "Found in Geotechnical Engineering. Directly underneath the point load ($r=0$), the equation simplifies to $\\Delta \\sigma_z = \\frac{3P}{2\\pi z^2} = 0.4775 \\frac{P}{z^2}$."
                },
                {
                        "title": "Hazen-Williams Equation for Pipe Head Loss",
                        "formula": "$$V = k_1 C R_h^{0.63} S^{0.54} \\quad (k_1 = 0.849\\text{ SI}, \\; 1.318\\text{ USCS})$$",
                        "description": "Empirical relationship relating water flow velocity in pressure conduits to pipe roughness coefficient $C$, hydraulic radius $R_h$, and energy slope $S$.",
                        "examTip": "Found in Water Resources / Environmental. Applicable strictly to water flow at ordinary temperatures ($60^\\circ\\text{F} / 15^\\circ\\text{C}$). Higher $C$ means smoother pipe."
                },
                {
                        "title": "Rational Method for Peak Storm Runoff",
                        "formula": "$$Q = C \\cdot I \\cdot A$$",
                        "description": "Estimates maximum design peak stormwater runoff discharge $Q$ from a drainage basin as a function of runoff coefficient $C$, rainfall intensity $I$, and catchment area $A$.",
                        "examTip": "Found in Hydrology. In USCS units: with $I$ in inches/hour and $A$ in acres, $Q$ directly equals cubic feet per second ($1\\text{ cfs} \\approx 1.008\\text{ acre-in/hr}$)."
                },
                {
                        "title": "Rankine Lateral Earth Pressure Coefficients",
                        "formula": "$$K_a = \\tan^2\\left(45^\\circ - \\frac{\\phi}{2}\\right), \\quad K_p = \\tan^2\\left(45^\\circ + \\frac{\\phi}{2}\\right)$$",
                        "description": "Computes active ($K_a$) and passive ($K_p$) lateral earth pressure coefficients for cohesionless soils with internal friction angle $\\phi$ behind a vertical retaining wall.",
                        "examTip": "Found in Geotechnical Engineering. Note that $K_p = 1 / K_a$. Active pressure develops when the wall moves away from soil; passive requires wall pushing into soil."
                },
                {
                        "title": "One-Dimensional Primary Consolidation Settlement",
                        "formula": "$$S_c = \\frac{C_c H_0}{1 + e_0} \\log_{10}\\left(\\frac{\\sigma'_0 + \\Delta \\sigma'}{\\sigma'_0}\\right)$$",
                        "description": "Predicts ultimate vertical settlement of a normally consolidated clay stratum of initial thickness $H_0$ and void ratio $e_0$ subjected to stress increment $\\Delta \\sigma'$.",
                        "examTip": "Found in Geotechnical Engineering. For overconsolidated clay where $\\sigma'_0 + \\Delta \\sigma' \\le \\sigma'_p$, use the recompression index $C_r$ (or $C_s$) instead of $C_c$."
                },
                {
                        "title": "Terzaghi’s Ultimate Bearing Capacity Equation",
                        "formula": "$$q_{ult} = c' N_c + q N_q + \\frac{1}{2}\\gamma B N_\\gamma$$",
                        "description": "Determines the ultimate bearing capacity of a shallow strip footing resting on soil with cohesion $c'$, surcharge $q = \\gamma D_f$, unit weight $\\gamma$, and footing width $B$.",
                        "examTip": "Found in Foundation Engineering. Bearing capacity factors $N_c, N_q, N_\\gamma$ depend solely on soil friction angle $\\phi$ (tabulated in the NCEES Handbook)."
                },
                {
                        "title": "Whitney Rectangular Stress Block (Concrete Design)",
                        "formula": "$$a = \\beta_1 c, \\quad C_c = 0.85 f'_c a b, \\quad T = A_s f_y$$",
                        "description": "Replaces the actual non-linear parabolic concrete compression zone with an equivalent uniform stress block of depth $a = \\beta_1 c$ and intensity $0.85 f'_c$.",
                        "examTip": "Found in Reinforced Concrete Design. Nominal flexural strength is $M_n = A_s f_y (d - a/2)$. Factor $\\beta_1 = 0.85$ for $f'_c \\le 4000\\text{ psi}$ and reduces by 0.05 per 1000 psi."
                },
                {
                        "title": "Plastic Moment Capacity of Structural Steel",
                        "formula": "$$M_p = F_y Z_x$$",
                        "description": "Represents the full plastic bending moment capacity of a structural steel section where every fiber across the cross-section has reached yield stress $F_y$.",
                        "examTip": "Found in Structural Steel Design. $Z_x$ is the plastic section modulus ($Z_x > S_x$). Shape factor is $k = Z_x / S_x$, typically $\\sim 1.10 - 1.15$ for standard I-beams."
                },
                {
                        "title": "Transverse Shear Stress Formula (Jourawski)",
                        "formula": "$$\\tau = \\frac{V Q}{I b}$$",
                        "description": "Calculates horizontal and vertical shear stress in a beam cross section subjected to internal shear force $V$, where $Q$ is the first moment of area above the cut line.",
                        "examTip": "Found in Mechanics of Materials. Maximum shear stress in a rectangular beam ($b \\times h$) occurs at the neutral axis and equals $\\tau_{\\text{max}} = \\frac{3V}{2A}$."
                },
                {
                        "title": "Greenshields Macroscopic Traffic Flow Model",
                        "formula": "$$v = v_f \\left(1 - \\frac{k}{k_j}\\right), \\quad q = k v = v_f \\left(k - \\frac{k^2}{k_j}\\right)$$",
                        "description": "Fundamental linear model relating traffic space-mean speed $v$ to density $k$, yielding a parabolic flow-density relationship with maximum capacity at $k_j / 2$.",
                        "examTip": "Found in Transportation Engineering. Maximum flow rate (highway capacity) occurs at $q_{\\text{max}} = \\frac{v_f k_j}{4}$ at optimum speed $v_o = v_f / 2$.",
                        "videoUrl": "assets/videos/Greenshields_Model.mp4",
                        "videoTitle": "Greenshields Model (Traffic Flow & Capacity)",
                        "videoDuration": "10s"
                },
                {
                        "title": "Stopping Sight Distance (SSD)",
                        "videoUrl": "assets/videos/Stopping_Sight_Distance.mp4",
                        "videoTitle": "Stopping Sight Distance Explainer",
                        "videoDuration": "10s",
                        "formula": "$$SSD = 1.47 V t_r + \\frac{V^2}{30\\left(\\frac{a}{32.2} \\pm G\\right)}$$",
                        "description": "Computes total distance required for a vehicle travelling at speed $V$ [mph] to stop safely, incorporating brake reaction distance and braking deceleration on grade $G$.",
                        "examTip": "Found in Highway Design. AASHTO standard reaction time is $t_r = 2.5\\text{ s}$ and deceleration rate is $a = 11.2\\text{ ft/s}^2$ ($a/32.2 = 0.35$)."
                },
                {
                        "title": "Horizontal Curve Minimum Radius & Superelevation",
                        "formula": "$$R_{\\text{min}} = \\frac{V^2}{15(0.01 e_{\\text{max}} + f_{\\text{max}})}$$",
                        "description": "Governs horizontal alignment design, balancing centrifugal force against lateral tire friction factor $f_{\\text{max}}$ and roadway superelevation rate $e_{\\text{max}}$.",
                        "examTip": "Found in Transportation Engineering. In this USCS equation, speed $V$ is in mph, superelevation $e$ is in percent (e.g., 6% = 6), and radius $R$ is in feet."
                },
                {
                        "title": "Unconfined Aquifer Dupuit-Thiem Well Formula",
                        "formula": "$$Q = \\frac{\\pi K (h_2^2 - h_1^2)}{\\ln(r_2 / r_1)}$$",
                        "description": "Estimates steady-state radial pumping discharge $Q$ from an unconfined aquifer with hydraulic conductivity $K$ based on piezometric heads $h_1, h_2$ at observation radii $r_1, r_2$.",
                        "examTip": "Found in Hydrology and Water Resources. For confined aquifers, the head term is linear: $Q = \\frac{2\\pi K b (h_2 - h_1)}{\\ln(r_2 / r_1)}$ where $b$ is aquifer thickness."
                },
                {
                        "title": "Slenderness Ratio for Steel Compression Members",
                        "videoUrl": "assets/videos/Slenderness_Ratio.mp4",
                        "videoTitle": "Column Slenderness Ratio Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\lambda = \\frac{K L}{r}, \\quad r = \\sqrt{\\frac{I}{A}}$$",
                        "description": "Measures column susceptibility to lateral buckling as the ratio of effective unbraced length $K L$ to minimum radius of gyration $r$.",
                        "examTip": "Found in Structural Steel Design. Always evaluate buckling about the weak axis (minimum radius of gyration $r_y$) unless braced against lateral deflection."
                },
                {
                        "title": "Balanced Steel Reinforcement Ratio in Concrete",
                        "formula": "$$\\rho_b = 0.85 \\beta_1 \\frac{f'_c}{f_y} \\left(\\frac{87{,}000}{87{,}000 + f_y}\\right)$$",
                        "description": "The theoretical reinforcement ratio where tension steel reaches yield strain $\\epsilon_y = f_y / E_s$ at the exact instant concrete reaches crushing strain $\\epsilon_u = 0.003$.",
                        "examTip": "Found in Reinforced Concrete Design. ACI code requires sections to be tension-controlled ($\\epsilon_t \\ge 0.005$, $\\rho \\le 0.75 \\rho_b$) to ensure ductile warning before failure."
                },
                {
                        "title": "Critical Hydraulic Gradient for Soil Boiling (Quick Condition)",
                        "formula": "$$i_{cr} = \\frac{\\gamma'}{\\gamma_w} = \\frac{G_s - 1}{1 + e}$$",
                        "description": "The upward seepage gradient at which seepage drag forces completely neutralize effective overburden stress, causing sudden loss of shear strength in cohesionless soils.",
                        "examTip": "Found in Geotechnical Engineering. When upward hydraulic gradient $i \\ge i_{cr}$, quicksand or liquefaction occurs. Factor of safety against boiling is $FS = i_{cr} / i_{\\text{exit}}$."
                },
                {
                        "title": "Sharp-Crested Rectangular Weir Flow",
                        "formula": "$$Q = C_w L H^{3/2}$$",
                        "description": "Determines flow rate $Q$ over an open channel rectangular weir of crest length $L$ under measured upstream hydrostatic head $H$.",
                        "examTip": "Found in Hydraulics. Head $H$ must be measured upstream of the drawdown curve (at least $4H$ upstream from weir crest). Standard Francis coefficient is $C_w \\approx 3.33$ USCS."
                },
                {
                        "title": "Crest Vertical Curve Length for Sight Distance",
                        "formula": "$$L = \\frac{A S^2}{200\\left(\\sqrt{h_1} + \\sqrt{h_2}\\right)^2} \\quad (S < L)$$",
                        "description": "Calculates required crest vertical curve length $L$ for algebraic grade difference $A = |g_2 - g_1|$, driver eye height $h_1 = 3.5\\text{ ft}$, and object height $h_2 = 2.0\\text{ ft}$.",
                        "examTip": "Found in Transportation. With standard AASHTO heights ($h_1 = 3.5, h_2 = 2.0$), the denominator simplifies to $2158$: $L = \\frac{A S^2}{2158}$ or $L = K A$."
                },
                {
                        "title": "Coulomb Active Lateral Earth Pressure Theory",
                        "formula": "$$P_a = \\frac{1}{2} \\gamma H^2 K_a, \\quad K_a = f(\\beta, \\phi', \\delta, \\alpha)$$",
                        "description": "Accounts for wall batter angle, backfill slope angle $\\alpha$, and soil-wall interface friction angle $\\delta$ in determining resultant lateral active earth thrust.",
                        "examTip": "Found in Geotechnical Engineering. When wall is vertical ($\\beta = 90^\\circ$), backfill is horizontal ($\\alpha = 0$), and wall friction is zero ($\\delta = 0$), Coulomb equals Rankine."
                },
                {
                        "title": "Specific Energy and Froude Number in Open Channels",
                        "formula": "$$E = y + \\frac{V^2}{2g}, \\quad Fr = \\frac{V}{\\sqrt{g D_h}}$$",
                        "description": "Defines energy head relative to channel bottom; Froude number $Fr$ delineates subcritical ($Fr < 1$), critical ($Fr = 1$), and supercritical ($Fr > 1$) flow regimes.",
                        "examTip": "Found in Hydraulics. Hydraulic depth $D_h = A / T$, where $T$ is top surface water width. Minimum specific energy occurs at critical depth ($Fr = 1$)."
                },
                {
                        "title": "Mohr-Coulomb Failure Criterion for Soils",
                        "formula": "$$\\tau_f = c' + \\sigma' \\tan\\phi'$$",
                        "description": "Fundamental shear strength equation for soils, stating that shear strength on any failure plane depends on effective cohesion $c'$, normal effective stress $\\sigma'$, and friction angle $\\phi'$.",
                        "examTip": "Found in Geotechnical Engineering. For normally consolidated sands and gravels, $c' = 0$, giving $\\tau_f = \\sigma' \\tan\\phi'$. In undrained clay loading ($\\\\phi_u = 0$), $\\tau_f = s_u$."
                }
        ],
        "Electrical and Computer": [
                {
                        "title": "Thevenin’s Equivalent Circuit Theorem",
                        "videoUrl": "assets/videos/Thevenin_Theorem.mp4",
                        "videoTitle": "Thévenin's Theorem Explainer",
                        "videoDuration": "10s",
                        "formula": "$$V_{Th} = V_{oc}, \\quad R_{Th} = \\frac{V_{oc}}{I_{sc}}$$",
                        "description": "Any linear two-terminal circuit containing independent/dependent sources and resistors can be replaced by a single ideal voltage source $V_{Th}$ in series with equivalent resistance $R_{Th}$.",
                        "examTip": "Found under Circuit Analysis. When finding $R_{Th}$ with dependent sources, connect a 1V test source at output terminals and calculate $R_{Th} = 1\\text{V} / I_{\\text{test}}$."
                },
                {
                        "title": "Norton’s Equivalent Circuit Theorem",
                        "formula": "$$I_N = I_{sc}, \\quad R_N = R_{Th} = \\frac{V_{oc}}{I_{sc}}$$",
                        "description": "States that any linear two-terminal electric network can be modeled as an ideal current source $I_N$ connected in parallel with an internal resistance $R_N$.",
                        "examTip": "Found in Circuit Analysis. Source transformations relate Thevenin and Norton: $V_{Th} = I_N R_N$ and $R_{Th} = R_N$."
                },
                {
                        "title": "Maximum Power Transfer Theorem",
                        "videoUrl": "assets/videos/Maximum_Power_Transfer_Theorem.mp4",
                        "videoTitle": "Maximum Power Transfer Theorem Explainer",
                        "videoDuration": "10s",
                        "formula": "$$R_L = R_{Th} \\implies P_{\\text{max}} = \\frac{V_{Th}^2}{4 R_{Th}}$$",
                        "description": "Maximum active power is transferred from a linear source network to a resistive load when load resistance matches the Thevenin internal source resistance.",
                        "examTip": "Found in Electrical Circuits. In AC circuits with complex impedances, the load impedance must equal the complex conjugate: $Z_L = Z_{Th}^*$."
                },
                {
                        "title": "Kirchhoff’s Current and Voltage Laws (KCL & KVL)",
                        "videoUrl": "assets/videos/Kirchhoffs_Current_and_Voltage_Laws.mp4",
                        "videoTitle": "Kirchhoff’s Current and Voltage Laws (KCL & KVL) Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}, \\quad \\sum_{k=1}^n V_k = 0$$",
                        "description": "Fundamental conservation laws of electrical charge (KCL at nodes) and electric potential energy (KVL around closed loops).",
                        "examTip": "Found in Circuit Analysis. Maintain strict consistency with the passive sign convention: current enters the positive terminal of absorbing elements."
                },
                {
                        "title": "Nyquist-Shannon Sampling Theorem",
                        "videoUrl": "assets/videos/Nyquist_Theorem.mp4",
                        "videoTitle": "Nyquist-Shannon Sampling Theorem Explainer",
                        "videoDuration": "10s",
                        "formula": "$$f_s \\ge 2 f_{\\text{max}}$$",
                        "description": "To completely reconstruct a continuous-time bandlimited analog signal without spectral aliasing distortion, the sampling frequency $f_s$ must be at least twice the maximum frequency component.",
                        "examTip": "Found in Signal Processing. $2 f_{\\text{max}}$ is the Nyquist rate; $f_s / 2$ is the Nyquist frequency. If $f_s < 2 f_{\\text{max}}$, high frequencies alias into lower bands."
                },
                {
                        "title": "Ohm’s Law and Joule Heating Law",
                        "videoUrl": "assets/videos/Ohms_Law.mp4",
                        "videoTitle": "Ohm's Law Explainer",
                        "videoDuration": "10s",
                        "formula": "$$V = I R, \\quad P = V I = I^2 R = \\frac{V^2}{R}$$",
                        "description": "Relates electric potential difference $V$, current $I$, and resistance $R$ in ohmic conductors, expressing dissipated thermal power $P$.",
                        "examTip": "Found in Circuit Analysis. Double check unit prefixes: $1\\text{ k}\\Omega = 10^3\\;\\Omega$, $1\\text{ mA} = 10^{-3}\\text{ A}$. $1\\text{ V} \\times 1\\text{ mA} = 1\\text{ mW}$."
                },
                {
                        "title": "First-Order RC Transient Response",
                        "videoUrl": "assets/videos/First_Order_RC_Transient_Response.mp4",
                        "videoTitle": "First-Order RC Transient Response Explainer",
                        "videoDuration": "10s",
                        "formula": "$$v_C(t) = v_C(\\infty) + [v_C(0^+) - v_C(\\infty)] e^{-t / \\tau}, \\quad \\tau = R C$$",
                        "description": "Expresses time-domain capacitor voltage charging or discharging through equivalent resistance $R$, where $\\tau = RC$ is circuit time constant.",
                        "examTip": "Found in Transient Circuit Analysis. Capacitor voltage cannot change instantaneously ($v_C(0^+) = v_C(0^-)$). Steady state is reached in approximately $5\\tau$."
                },
                {
                        "title": "First-Order RL Inductive Transient Response",
                        "formula": "$$i_L(t) = i_L(\\infty) + [i_L(0^+) - i_L(\\infty)] e^{-t / \\tau}, \\quad \\tau = \\frac{L}{R}$$",
                        "description": "Determines the transient current through an inductor undergoing switching, governed by inductive time constant $\\tau = L / R$.",
                        "examTip": "Found in Transient Circuit Analysis. Inductor current cannot change instantaneously ($i_L(0^+) = i_L(0^-)$). At $t = \\infty$, an ideal inductor acts as a short circuit."
                },
                {
                        "title": "AC Complex Power and Power Factor",
                        "formula": "$$S = P + j Q = V_{\\text{rms}} I_{\\text{rms}}^*, \\quad pf = \\cos(\\theta_v - \\theta_i) = \\frac{P}{|S|}$$",
                        "description": "Decomposes total apparent power $S$ [VA] into real active power $P$ [W] and reactive power $Q$ [VAR], with power factor $pf$ indicating phase alignment.",
                        "examTip": "Found in AC Power Systems. Inductive loads have lagging power factor ($Q > 0$); capacitive loads have leading power factor ($Q < 0$)."
                },
                {
                        "title": "Series RLC Resonance and Bandwidth",
                        "videoUrl": "assets/videos/Series_RLC_Resonance_and_Bandwidth.mp4",
                        "videoTitle": "Series RLC Resonance and Bandwidth Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\omega_0 = \\frac{1}{\\sqrt{L C}}, \\quad Q_{\\text{factor}} = \\frac{\\omega_0 L}{R}, \\quad BW = \\frac{\\omega_0}{Q_{\\text{factor}}} = \\frac{R}{L}$$",
                        "description": "At resonant frequency $\\omega_0$, inductive and capacitive reactances cancel ($X_L = X_C$), minimizing circuit impedance to pure resistance $R$.",
                        "examTip": "Found in Frequency Response. Resonant frequency in Hertz is $f_0 = \\frac{1}{2\\pi \\sqrt{LC}}$. Half-power cutoff frequencies are $\\omega_{1,2} = \\omega_0 \\pm BW / 2$."
                },
                {
                        "title": "Ideal Operational Amplifier Closed-Loop Gain",
                        "videoUrl": "assets/videos/OPAMP.mp4",
                        "videoTitle": "Operational Amplifier (OP-AMP) Explainer",
                        "videoDuration": "10s",
                        "formula": "$$A_{v, \\text{inv}} = -\\frac{R_f}{R_{\\text{in}}}, \\quad A_{v, \\text{non-inv}} = 1 + \\frac{R_f}{R_1}$$",
                        "description": "Exploits virtual short-circuit conditions ($v_+ = v_-$ and $i_+ = i_- = 0$) in negative feedback op-amps to yield precise closed-loop voltage amplification.",
                        "examTip": "Found in Electronics / Linear Circuits. Remember: output voltage cannot exceed the DC power supply rails (saturation occurs at $\\pm V_{CC}$)."
                },
                {
                        "title": "Bipolar Junction Transistor (BJT) Active Mode Relations",
                        "videoUrl": "assets/videos/Bipolar_Junction_Transistor_BJT_Active_Mode_Relations.mp4",
                        "videoTitle": "Bipolar Junction Transistor (BJT) Active Mode Relations Explainer",
                        "videoDuration": "10s",
                        "formula": "$$I_C = \\beta I_B, \\quad I_E = (\\beta + 1) I_B, \\quad \\alpha = \\frac{\\beta}{\\beta + 1}$$",
                        "description": "Relates collector current $I_C$, base current $I_B$, and emitter current $I_E$ in forward-active mode where base-emitter junction is forward-biased and collector-base is reverse-biased.",
                        "examTip": "Found in Electronics. Standard silicon forward-bias base-emitter drop is $V_{BE} \\approx 0.7\\text{ V}$. When saturated, $V_{CE,\\text{sat}} \\approx 0.2\\text{ V}$ and $I_C < \\beta I_B$."
                },
                {
                        "title": "MOSFET Saturation Region Drain Current",
                        "formula": "$$I_D = \\frac{1}{2} k'_n \\left(\\frac{W}{L}\\right) (V_{GS} - V_{tn})^2 (1 + \\lambda V_{DS})$$",
                        "description": "Models drain current in an n-channel enhancement MOSFET operating in saturation (pinch-off) region when $V_{GS} > V_{tn}$ and $V_{DS} \\ge V_{GS} - V_{tn}$.",
                        "examTip": "Found in Semiconductor Electronics. Channel-length modulation parameter $\\lambda$ represents finite output resistance: $r_o \\approx 1 / (\\lambda I_D)$."
                },
                {
                        "title": "Faraday’s Law of Electromagnetic Induction",
                        "formula": "$$\\mathcal{E} = -N \\frac{d\\Phi_B}{dt} = -N \\frac{d}{dt}\\left(\\int \\vec{B} \\cdot d\\vec{A}\\right)$$",
                        "description": "The electromotive force $\\mathcal{E}$ induced in a closed conducting loop is directly proportional to the time rate of change of magnetic flux $\\Phi_B$ threading the loop.",
                        "examTip": "Found in Electromagnetics. The minus sign represents Lenz’s Law: induced current produces a secondary magnetic field opposing the change in original flux."
                },
                {
                        "title": "Ampère’s Circuital Law with Maxwell’s Correction",
                        "formula": "$$\\oint \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}} + \\mu_0 \\epsilon_0 \\frac{d\\Phi_E}{dt}$$",
                        "description": "Relates integrated magnetic field along a closed Amperian loop to enclosed conduction current $I_{\\text{enc}}$ and Maxwell's displacement current $\\epsilon_0 \\frac{d\\Phi_E}{dt}$.",
                        "examTip": "Found in Electromagnetics. For long cylindrical wires carrying uniform current $I$ at radius $r \\ge R$, magnetic field is $B = \\frac{\\mu_0 I}{2\\pi r}$."
                },
                {
                        "title": "Gauss’s Law for Electric Fields",
                        "formula": "$$\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\epsilon_0}$$",
                        "description": "Total electric flux passing outward through any closed Gaussian surface equals total enclosed electric charge $Q_{\\text{enc}}$ divided by permittivity of free space $\\epsilon_0$.",
                        "examTip": "Found in Electromagnetics. Ideal for high-symmetry geometries: point charge (spherical surface), line charge (cylindrical), and planar sheet of charge ($E = \\sigma / (2\\epsilon_0)$)."
                },
                {
                        "title": "Shannon-Hartley Channel Capacity Theorem",
                        "formula": "$$C = B \\log_2\\left(1 + \\frac{S}{N}\\right) \\text{ [bits/s]}$$",
                        "description": "Defines the absolute theoretical upper bound on error-free data transmission rate $C$ over an additive white Gaussian noise (AWGN) channel of bandwidth $B$ [Hz] and signal-to-noise ratio $S/N$.",
                        "examTip": "Found in Communications. Convert SNR from decibels to linear ratio before calculating: $S/N = 10^{(\\text{SNR}_{\\text{dB}} / 10)}$."
                },
                {
                        "title": "De Morgan’s Laws for Boolean Logic",
                        "videoUrl": "assets/videos/De_Morgans_Laws_for_Boolean_Logic.mp4",
                        "videoTitle": "De Morgan's Laws Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\overline{A \\cdot B} = \\overline{A} + \\overline{B}, \\quad \\overline{A + B} = \\overline{A} \\cdot \\overline{B}$$",
                        "description": "Fundamental duality theorems in Boolean algebra allowing conversion between AND and OR logic through inversion of variables and operators.",
                        "examTip": "Found in Digital Systems. Essential for NAND-only and NOR-only logic gate implementations in logic circuit minimization."
                },
                {
                        "title": "Continuous-Time Convolution Integral (LTI Systems)",
                        "formula": "$$y(t) = x(t) * h(t) = \\int_{-\\infty}^{\\infty} x(\\tau) h(t - \\tau) d\\tau$$",
                        "description": "Determines the zero-state time response $y(t)$ of any continuous linear time-invariant system by convolving input signal $x(t)$ with impulse response $h(t)$.",
                        "examTip": "Found in Signals and Systems. In Laplace frequency domain, convolution reduces to simple multiplication: $Y(s) = X(s) H(s)$."
                },
                {
                        "title": "Laplace Transform Final Value Theorem",
                        "videoUrl": "assets/videos/Laplace_Transform_Final_Value_Theorem.mp4",
                        "videoTitle": "Laplace Transform Final Value Theorem Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\lim_{t \\to \\infty} f(t) = \\lim_{s \\to 0} s F(s)$$",
                        "description": "Calculates the steady-state value of a time-domain signal directly from its Laplace transform $F(s)$ without inverse transforming.",
                        "examTip": "Found in Control Systems. Valid ONLY if all poles of $s F(s)$ lie strictly in the open left half of the s-plane (system must be stable)."
                },
                {
                        "title": "Transmission Line Reflection Coefficient and SWR",
                        "formula": "$$\\Gamma = \\frac{Z_L - Z_0}{Z_L + Z_0}, \\quad SWR = \\frac{1 + |\\Gamma|}{1 - |\\Gamma|}$$",
                        "description": "Measures the fraction of incident electromagnetic wave reflected at the termination of a transmission line with characteristic impedance $Z_0$ and load impedance $Z_L$.",
                        "examTip": "Found in Electromagnetics / RF. Matched load ($Z_L = Z_0$) gives $\\Gamma = 0, SWR = 1$. Open circuit ($Z_L = \\infty$) gives $\\Gamma = +1$; short circuit ($Z_L = 0$) gives $\\Gamma = -1$."
                },
                {
                        "title": "Poynting Vector for Electromagnetic Energy Flow",
                        "formula": "$$\\vec{S} = \\vec{E} \\times \\vec{H}, \\quad S_{\\text{avg}} = \\frac{1}{2} \\text{Re}\\{\\vec{E} \\times \\vec{H}^*\\} = \\frac{E_{\\text{peak}}^2}{2 \\eta}$$",
                        "description": "Represents directional power density vector [$\\text{W/m}^2$] carried by propagating electromagnetic waves, where $\\eta = \\sqrt{\\mu_0 / \\epsilon_0} \\approx 377\\;\\Omega$ is free space wave impedance.",
                        "examTip": "Found in Electromagnetics. Power through surface area $A$ is $P = \\int \\vec{S} \\cdot d\\vec{A}$. For TEM waves in vacuum, $|E| / |H| = \\eta_0 \\approx 120\\pi\\;\\Omega$."
                },
                {
                        "title": "Balanced Balanced 3-Phase Power Equations",
                        "formula": "$$P_{3\\phi} = \\sqrt{3} V_L I_L \\cos\\theta, \\quad Q_{3\\phi} = \\sqrt{3} V_L I_L \\sin\\theta, \\quad S_{3\\phi} = \\sqrt{3} V_L I_L$$",
                        "description": "Calculates total active, reactive, and complex apparent power delivered to a balanced three-phase load in terms of line-to-line voltage $V_L$ and line current $I_L$.",
                        "examTip": "Found in Power Engineering. In Wye ($Y$) connections: $V_L = \\sqrt{3} V_{\\text{phase}}, I_L = I_{\\text{phase}}$. In Delta ($\\Delta$) connections: $V_L = V_{\\text{phase}}, I_L = \\sqrt{3} I_{\\text{phase}}$."
                },
                {
                        "title": "State-Space Linear Dynamical System Representation",
                        "formula": "$$\\dot{\\vec{x}}(t) = \\mathbf{A}\\vec{x}(t) + \\mathbf{B}\\vec{u}(t), \\quad \\vec{y}(t) = \\mathbf{C}\\vec{x}(t) + \\mathbf{D}\\vec{u}(t)$$",
                        "description": "Matrix formulation for multi-input multi-output (MIMO) dynamic control systems, where eigenvalues of state matrix $\\mathbf{A}$ determine system stability.",
                        "examTip": "Found in Control Systems. Transfer function matrix is $\\mathbf{H}(s) = \\mathbf{C}(s\\mathbf{I} - \\mathbf{A})^{-1}\\mathbf{B} + \\mathbf{D}$."
                },
                {
                        "title": "Boolean Consensus Theorem",
                        "formula": "$$A B + \\overline{A} C + B C = A B + \\overline{A} C$$",
                        "description": "Enables algebraic elimination of redundant consensus term $BC$ in sum-of-products Boolean expressions.",
                        "examTip": "Found in Digital Systems. The consensus term $BC$ contains variables from two terms where variable $A$ appears inverted in one and non-inverted in the other."
                }
        ],
        "Chemical": [
                {
                        "title": "Le Chatelier’s Principle & Standard Free Energy",
                        "formula": "$$\\Delta G^\\circ = -R T \\ln(K_{eq})$$",
                        "description": "Relates standard Gibbs free energy of reaction $\\Delta G^\\circ$ to the equilibrium constant $K_{eq}$; external changes shift equilibrium to counteract disturbance.",
                        "examTip": "Found in Chemical Reaction Engineering. Increasing pressure shifts toward fewer gas moles; endothermic reactions have increased $K_{eq}$ at higher temperatures."
                },
                {
                        "title": "Arrhenius Temperature Dependency of Rate Constants",
                        "formula": "$$k = A e^{-E_a / (R T)} \\iff \\ln\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)$$",
                        "description": "Expresses relationship between absolute temperature $T$ and chemical reaction rate constant $k$ based on activation energy $E_a$.",
                        "examTip": "Found in Chemical Kinetics. Universal gas constant $R = 8.314\\text{ J/(mol}\\cdot\\text{K)}$. Always use absolute Kelvin for temperatures."
                },
                {
                        "title": "Raoult’s Law for Ideal Vapor-Liquid Equilibrium",
                        "formula": "$$y_i P = x_i P_i^{\\text{sat}}(T)$$",
                        "description": "In ideal mixtures, partial pressure of component $i$ in vapor equals product of liquid mole fraction $x_i$ and pure component vapor pressure $P_i^{\\text{sat}}$.",
                        "examTip": "Found in Separation Processes. Total pressure is $P = \\sum x_i P_i^{\\text{sat}}$. For non-ideal liquid solutions, introduce activity coefficients $\\gamma_i$."
                },
                {
                        "title": "Henry’s Law for Dilute Gas-Liquid Solubility",
                        "formula": "$$P_i = H_i \\cdot x_i$$",
                        "description": "States that for a sparingly soluble gas in liquid at low concentration, the equilibrium partial pressure $P_i$ is directly proportional to liquid mole fraction $x_i$.",
                        "examTip": "Found in Mass Transfer and Chemical Thermodynamics. Watch units: Henry's constant $H_i$ can be expressed in $\\text{atm}$, $\\text{bar}$, or $\\text{mol/(L}\\cdot\\text{atm)}$."
                },
                {
                        "title": "Fick’s First Law of Molecular Diffusion",
                        "formula": "$$J_A = -D_{AB} \\frac{dC_A}{dz}$$",
                        "description": "Defines molar diffusive flux $J_A$ as proportional to negative concentration gradient $dC_A / dz$ and binary molecular diffusivity $D_{AB}$.",
                        "examTip": "Found in Mass Transfer. In bulk flow, total flux is $N_A = J_A + x_A (N_A + N_B)$. For equimolar counterdiffusion (EMD), $N_A = -N_B$."
                },
                {
                        "title": "Clausius-Clapeyron Equation for Phase Equilibrium",
                        "formula": "$$\\ln\\left(\\frac{P_2^{\\text{sat}}}{P_1^{\\text{sat}}}\\right) = -\\frac{\\Delta H_{\\text{vap}}}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right)$$",
                        "description": "Relates saturation vapor pressure changes to temperature and latent heat of vaporization $\\Delta H_{\\text{vap}}$, assuming ideal vapor behavior.",
                        "examTip": "Found in Thermodynamics. Plotting $\\ln(P^{\\text{sat}})$ versus $1/T$ yields a straight line with slope equal to $-\\Delta H_{\\text{vap}} / R$."
                },
                {
                        "title": "Antoine Equation for Saturated Vapor Pressure",
                        "formula": "$$\\log_{10}(P^{\\text{sat}}) = A - \\frac{B}{T + C}$$",
                        "description": "Empirical three-parameter equation calculating saturated vapor pressure $P^{\\text{sat}}$ of pure compounds as a function of temperature $T$.",
                        "examTip": "Found in Mass Transfer and Physical Properties. Verify units of constants $A, B, C$: temperature may be in $^\\circ\\text{C}$ while pressure is in $\\text{mmHg}$ or $\\text{bar}$."
                },
                {
                        "title": "Ergun Equation for Packed Bed Pressure Drop",
                        "formula": "$$\\frac{\\Delta P}{L} = 150 \\frac{\\mu (1-\\epsilon)^2 v_0}{\\epsilon^3 d_p^2} + 1.75 \\frac{\\rho (1-\\epsilon) v_0^2}{\\epsilon^3 d_p}$$",
                        "description": "Calculates total pressure drop across packed beds of spherical particles, summing viscous laminar losses and turbulent inertial drag.",
                        "examTip": "Found in Chemical Fluid Mechanics. $\\epsilon$ is bed void fraction; $v_0$ is superficial fluid velocity (empty tube velocity); $d_p$ is particle diameter."
                },
                {
                        "title": "Hagen-Poiseuille Equation for Laminar Pipe Flow",
                        "formula": "$$\\Delta P = \\frac{128 \\mu L Q}{\\pi D^4}$$",
                        "description": "Computes pressure drop for laminar, incompressible, viscous flow through a circular pipe of length $L$ and diameter $D$.",
                        "examTip": "Found in Fluid Mechanics. Notice the fourth power on diameter: reducing pipe diameter by half increases pressure drop by a factor of 16 for constant $Q$."
                },
                {
                        "title": "Van der Waals Equation of State for Real Gases",
                        "formula": "$$\\left(P + \\frac{a}{v^2}\\right)(v - b) = R T$$",
                        "description": "Adjusts ideal gas law for real molecular interactions: parameter $a$ accounts for intermolecular attractive forces, and $b$ accounts for finite molecular volume.",
                        "examTip": "Found in Chemical Thermodynamics. Parameters relate to critical properties: $a = \\frac{27 R^2 T_c^2}{64 P_c}$ and $b = \\frac{R T_c}{8 P_c}$."
                },
                {
                        "title": "Compressibility Factor Real Gas Equation",
                        "formula": "$$P v = Z R T, \\quad Z = f(T_r, P_r)$$",
                        "description": "Quantifies deviation of real gas behaviour from ideality through compressibility factor $Z$, plotted on generalized compressibility charts against reduced properties.",
                        "examTip": "Found in Thermodynamics. Reduced properties are $T_r = T / T_c$ and $P_r = P / P_c$. For an ideal gas, $Z = 1$."
                },
                {
                        "title": "Michaelis-Menten Enzyme Kinetics",
                        "formula": "$$v = \\frac{V_{\\text{max}} [S]}{K_m + [S]}$$",
                        "description": "Models rate of enzymatic reaction $v$ as a function of substrate concentration $[S]$, maximum velocity $V_{\\text{max}}$, and Michaelis constant $K_m$.",
                        "examTip": "Found in Biochemical Engineering. When $[S] = K_m$, reaction velocity is exactly half of maximum ($v = V_{\\text{max}} / 2$)."
                },
                {
                        "title": "Gibbs Phase Rule",
                        "formula": "$$F = C - P + 2$$",
                        "description": "Determines the degrees of freedom $F$ (independent intensive variables) in a non-reacting heterogeneous system with $C$ chemical components and $P$ phases.",
                        "examTip": "Found in Chemical Thermodynamics. For a pure substance ($C=1$) at its triple point ($P=3$), $F = 1 - 3 + 2 = 0$ (invariant state point)."
                },
                {
                        "title": "Continuous Stirred-Tank Reactor (CSTR) Design Equation",
                        "formula": "$$V = \\frac{F_{A0} X_A}{-r_A}$$",
                        "description": "Governs volume $V$ required for a perfectly mixed steady-state CSTR operating at outlet reactant conversion $X_A$ and reaction rate $-r_A$.",
                        "examTip": "Found in Chemical Reaction Engineering. Because contents are well-mixed, reaction rate is evaluated strictly at the exit concentration."
                },
                {
                        "title": "Plug Flow Reactor (PFR) Differential Design Equation",
                        "formula": "$$V = F_{A0} \\int_0^{X_A} \\frac{dX_A}{-r_A}$$",
                        "description": "Calculates required reactor volume $V$ for steady plug flow tubular reactors without axial mixing as a function of molar feed rate $F_{A0}$.",
                        "examTip": "Found in Chemical Reaction Engineering. For positive reaction orders, PFR volume is always smaller than CSTR volume for the same conversion."
                },
                {
                        "title": "McCabe-Thiele Distillation Rectifying Operating Line",
                        "formula": "$$y = \\frac{R}{R+1} x + \\frac{x_D}{R+1}$$",
                        "description": "Relates vapor and liquid mole fractions between adjacent equilibrium stages in the rectifying section of a fractionating distillation column with reflux ratio $R$.",
                        "examTip": "Found in Separation Processes. Intersection with $y=x$ line occurs at distillate composition $x_D$. Minimum reflux ratio corresponds to a pinch point with the equilibrium curve."
                },
                {
                        "title": "Overall Heat Transfer Coefficient in Shell-and-Tube Exchangers",
                        "formula": "$$\\frac{1}{U A} = \\frac{1}{h_i A_i} + \\frac{\\ln(r_o/r_i)}{2\\pi k L} + \\frac{1}{h_o A_o} + R_{fi} + R_{fo}$$",
                        "description": "Combines inside/outside convective film resistances, pipe wall conduction, and fouling factors $R_f$ into a single overall heat transfer coefficient $U$.",
                        "examTip": "Found in Heat Transfer. The controlling resistance is always the smallest convection heat transfer coefficient $h$."
                },
                {
                        "title": "Biot Number for Transient Conduction",
                        "formula": "$$Bi = \\frac{h L_c}{k} < 0.1$$",
                        "description": "Compares internal thermal conduction resistance of a solid body to external convective surface resistance, where $L_c = V / A_s$ is characteristic length.",
                        "examTip": "Found in Heat Transfer. When $Bi < 0.1$, internal temperature gradients are negligible and the lumped capacitance method is valid."
                },
                {
                        "title": "Rayleigh Equation for Simple Differential Batch Distillation",
                        "formula": "$$\\ln\\left(\\frac{L_1}{L_2}\\right) = \\int_{x_2}^{x_1} \\frac{dx}{y - x}$$",
                        "description": "Relates total liquid moles remaining in still pot ($L_2$ vs initial $L_1$) to liquid composition change ($x_2$ vs $x_1$) in differential batch distillation.",
                        "examTip": "Found in Separation Processes. For constant relative volatility $\\alpha$, substitute equilibrium relation $y = \\frac{\\alpha x}{1 + (\\alpha - 1)x}$."
                },
                {
                        "title": "Thiele Modulus for Porous Catalyst Pellets",
                        "formula": "$$\\phi = L \\sqrt{\\frac{k_n C_{As}^{n-1}}{D_{eff}}}$$",
                        "description": "Dimensionless parameter evaluating the ratio of intrinsic chemical reaction rate to intraparticle pore diffusion rate in heterogeneous porous catalyst pellets.",
                        "examTip": "Found in Chemical Reaction Engineering. Small $\\phi$ ($< 0.4$) means reaction-rate limited (effectiveness factor $\\eta \\approx 1$). Large $\\phi$ ($> 4$) means strong pore diffusion control."
                },
                {
                        "title": "Nernst Equation for Electrochemical Cell Potential",
                        "formula": "$$E = E^\\circ - \\frac{R T}{n F} \\ln(Q_{\\text{rxn}})$$",
                        "description": "Calculates the real electrical reduction potential $E$ of an electrochemical cell under non-standard conditions based on reaction quotient $Q_{\\text{rxn}}$.",
                        "examTip": "Found in Chemical Kinetics / Electrochemistry. At $25^\\circ\\text{C}$ ($298\\text{ K}$), $\\frac{R T}{F} \\ln(10) \\approx 0.0592\\text{ V}$, giving $E = E^\\circ - \\frac{0.0592}{n} \\log_{10}(Q)$."
                },
                {
                        "title": "Joule-Thomson Throttling Coefficient",
                        "formula": "$$\\mu_{JT} = \\left(\\frac{\\partial T}{\\partial P}\\right)_H = \\frac{1}{c_p}\\left[T\\left(\\frac{\\partial v}{\\partial T}\\right)_P - v\\right]$$",
                        "description": "Measures temperature change of a fluid undergoing isenthalpic pressure drop across a throttling valve or porous plug.",
                        "examTip": "Found in Thermodynamics. When $\\mu_{JT} > 0$, gas cools upon expansion. For an ideal gas, $\\mu_{JT} = 0$ identically (no temperature change upon throttling)."
                },
                {
                        "title": "Schmidt Number for Momentum vs Mass Transfer",
                        "formula": "$$Sc = \\frac{\\nu}{D_{AB}} = \\frac{\\mu}{\\rho D_{AB}}$$",
                        "description": "Dimensionless number representing ratio of kinematic viscosity (momentum diffusivity) to molecular mass diffusivity $D_{AB}$.",
                        "examTip": "Found in Mass Transfer. Analogous to Prandtl number in heat transfer ($Pr = \\nu / \\alpha$). Used in Chilton-Colburn $j$-factor analogies."
                },
                {
                        "title": "Relative Volatility in Binary Vapor-Liquid Equilibrium",
                        "formula": "$$\\alpha_{AB} = \\frac{y_A / x_A}{y_B / x_B} = \\frac{P_A^{\\text{sat}}}{P_B^{\\text{sat}}}$$",
                        "description": "Measures the separability of components $A$ and $B$ by distillation; higher relative volatility allows separation with fewer equilibrium stages.",
                        "examTip": "Found in Separation Processes. If $\\alpha_{AB} = 1.0$, an azeotrope forms and separation by conventional distillation is impossible."
                },
                {
                        "title": "Sherwood Number for Convective Mass Transfer",
                        "formula": "$$Sh = \\frac{k_c L}{D_{AB}} = f(Re, Sc)$$",
                        "description": "Dimensionless mass transfer coefficient representing ratio of convective mass transfer to diffusive mass transport rate across a boundary layer.",
                        "examTip": "Found in Mass Transfer. Directly analogous to Nusselt number $Nu = h L / k$ in heat transfer."
                }
        ],
        "Industrial": [
                {
                        "title": "Little’s Law for Queueing & Work-in-Progress",
                        "formula": "$$L = \\lambda \\cdot W$$",
                        "description": "The long-term average number of items $L$ in a stationary queueing system equals the arrival rate $\\lambda$ multiplied by average time $W$ in system.",
                        "examTip": "Found in Operations Research. Applies universally regardless of arrival distribution or queue discipline (FIFO, LIFO, Priority)."
                },
                {
                        "title": "Economic Order Quantity (EOQ)",
                        "formula": "$$Q^* = \\sqrt{\\frac{2 D S}{H}}$$",
                        "description": "Optimal batch order quantity minimizing annual total inventory costs by balancing fixed order cost $S$ against annual unit holding cost $H$.",
                        "examTip": "Found under Inventory Control. $D$ is annual demand. Total annual cost curve is flat near the minimum, making EOQ robust to estimation errors."
                },
                {
                        "title": "Central Limit Theorem (Sampling Distribution)",
                        "formula": "$$\\bar{X} \\sim \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right), \\quad Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}$$",
                        "description": "The distribution of sample means approaches a normal distribution as sample size $n$ increases ($n \\ge 30$), regardless of the population distribution.",
                        "examTip": "Found in Engineering Probability & Statistics. The standard error is $\\sigma / \\sqrt{n}$. Do not omit $\\sqrt{n}$ in the denominator!"
                },
                {
                        "title": "Exponential Distribution Memoryless Property",
                        "formula": "$$P(X > s + t \\mid X > s) = P(X > t) = e^{-\\lambda t}$$",
                        "description": "Future lifetime of an item with exponential failure time does not depend on how long it has already operated, reflecting a constant hazard rate $\\lambda$.",
                        "examTip": "Found in Reliability and Queueing. Mean time between failures is $MTBF = 1 / \\lambda$. The Poisson arrival process has exponential interarrival times."
                },
                {
                        "title": "M/M/1 Single-Server Queue Metrics",
                        "formula": "$$L_q = \\frac{\\lambda^2}{\\mu(\\mu - \\lambda)}, \\quad W_q = \\frac{\\lambda}{\\mu(\\mu - \\lambda)}, \\quad \\rho = \\frac{\\lambda}{\\mu} < 1$$",
                        "description": "Determines steady-state average queue length $L_q$ and waiting time $W_q$ for Poisson arrivals at rate $\\lambda$ and exponential service at rate $\\mu$.",
                        "examTip": "Found in Operations Research. System traffic utilization $\\rho = \\lambda / \\mu$ must be strictly less than 1 for steady-state equilibrium."
                },
                {
                        "title": "Critical Path Method (CPM) Float Equations",
                        "formula": "$$TF = LS - ES = LF - EF, \\quad FF = \\min(ES_{\\text{succ}}) - EF$$",
                        "description": "Calculates total float $TF$ and free float $FF$ for project activities; activities on the critical path have $TF = 0$.",
                        "examTip": "Found in Project Management. Earliest Start $ES = \\max(EF_{\\text{pred}})$; Latest Finish $LF = \\min(LS_{\\text{succ}})$. Delaying critical path delays project completion."
                },
                {
                        "title": "Wright’s Learning Curve Model",
                        "formula": "$$Y_x = K x^n, \\quad n = \\frac{\\log(\\text{slope})}{\\log(2)}$$",
                        "description": "Models reduction in cumulative average labor hours $Y_x$ required per unit as total cumulative production volume $x$ doubles.",
                        "examTip": "Found in Work Design / Cost Estimation. An 80% learning curve means each doubling of cumulative units reduces unit time by 20% ($n = \\log(0.80)/\\log(2) = -0.322$)."
                },
                {
                        "title": "Standard Time with Allowances",
                        "formula": "$$T_{\\text{std}} = T_{\\text{normal}} (1 + A) = (T_{\\text{observed}} \\cdot PR) (1 + A)$$",
                        "description": "Computes standard labor time by adjusting observed time with worker performance rating $PR$ and personal, fatigue, and delay allowances $A$.",
                        "examTip": "Found in Methods Engineering and Ergonomics. If performance rating is $110\\%$, worker is working $10\\%$ faster than normal pace ($PR = 1.10$)."
                },
                {
                        "title": "Shewhart $\\bar{X}$ and $R$ Statistical Process Control Charts",
                        "formula": "$$UCL_{\\bar{X}} = \\bar{\\bar{X}} + A_2 \\bar{R}, \\quad LCL_{\\bar{X}} = \\bar{\\bar{X}} - A_2 \\bar{R}$$",
                        "description": "Establishes statistical 3-sigma control limits for subgroup means $\\bar{X}$ using average range $\\bar{R}$ and sample size factor $A_2$.",
                        "examTip": "Found in Quality Engineering. Factors $A_2, D_3, D_4$ are tabulated in NCEES Handbook based on subgroup size $n$ (usually $n=4$ or $5$)."
                },
                {
                        "title": "Process Capability Index ($C_{pk}$)",
                        "formula": "$$C_{pk} = \\min\\left[\\frac{USL - \\mu}{3\\sigma}, \\frac{\\mu - LSL}{3\\sigma}\\right]$$",
                        "description": "Quantifies the ability of a manufacturing process to produce output within engineering tolerance limits ($LSL$ to $USL$), accounting for off-center mean $\\mu$.",
                        "examTip": "Found in Quality Control. $C_{pk} \\ge 1.33$ is standard industry minimum. If the process is perfectly centered on target, $C_{pk} = C_p = \\frac{USL - LSL}{6\\sigma}$."
                },
                {
                        "title": "Defects Per Million Opportunities (DPMO)",
                        "formula": "$$DPMO = \\frac{D}{U \\times O} \\times 10^6$$",
                        "description": "Normalizes defects $D$ observed across units $U$ and defect opportunities per unit $O$ into standard Six Sigma metric.",
                        "examTip": "Found in Quality Engineering. A Six Sigma quality process yields $3.4\\text{ DPMO}$ when accounting for a standard $1.5\\sigma$ long-term mean shift."
                },
                {
                        "title": "Break-Even Production Volume",
                        "formula": "$$Q_{BE} = \\frac{FC}{P - VC}$$",
                        "description": "Determines minimum production volume where total revenue equals total costs, balancing fixed costs $FC$ against unit contribution margin $(P - VC)$.",
                        "examTip": "Found in Engineering Economics. At $Q_{BE}$, profit is zero. Contribution margin ratio is $(P - VC) / P$."
                },
                {
                        "title": "Capital Recovery Factor for Uniform Series (A/P)",
                        "formula": "$$(A/P, i, n) = \\frac{i(1+i)^n}{(1+i)^n - 1}$$",
                        "description": "Calculates uniform annual worth $A$ equivalent to present investment $P$ over $n$ periods at interest rate $i$.",
                        "examTip": "Found in Engineering Economics. To find annual payment for capital asset with salvage value $S$: $A = (P - S)(A/P, i, n) + S \\cdot i$."
                },
                {
                        "title": "Single Payment Compound Amount Factor (F/P)",
                        "formula": "$$(F/P, i, n) = (1 + i)^n$$",
                        "description": "Computes future sum of money $F$ accumulated from present principal $P$ compounded at interest rate $i$ over $n$ periods.",
                        "examTip": "Found in Engineering Economics. Present worth factor is reciprocal: $(P/F, i, n) = (1 + i)^{-n}$.",
                        "videoUrl": "assets/videos/Compound_Interest_Formula.mp4",
                        "videoTitle": "Compound Interest (Single Payment F/P) Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Capitalized Cost for Infinite Project Life",
                        "formula": "$$CC = \\frac{A}{i} = P_0 + \\frac{A_{\\text{annual}}}{i}$$",
                        "description": "Evaluates present worth of perpetual perpetual uniform annual operating expenses $A$ over an infinite horizon ($n \\to \\infty$).",
                        "examTip": "Found in Engineering Economics. Used for public infrastructure projects (dams, bridges, roads) where life is modeled as indefinite."
                },
                {
                        "title": "Assembly Line Balancing Efficiency & Balance Delay",
                        "formula": "$$E = \\frac{\\sum t_i}{n \\cdot C_{\\text{cycle}}}, \\quad d = 1 - E$$",
                        "description": "Evaluates assembly line productivity as ratio of total work content $\\sum t_i$ to product of number of workstations $n$ and cycle time $C_{\\text{cycle}}$.",
                        "examTip": "Found in Manufacturing Systems. Cycle time is $C_{\\text{cycle}} = T_{\\text{operating}} / Q_{\\text{demand}}$. Theoretical minimum stations is $n_{\\text{min}} = \\lceil \\sum t_i / C \\rceil$."
                },
                {
                        "title": "Facility Layout Rectilinear Load-Distance Score",
                        "formula": "$$LD = \\sum_{i} \\sum_{j} w_{ij} (|x_i - x_j| + |y_i - y_j|)$$",
                        "description": "Scores plant layouts by summing materials handling flow volumes $w_{ij}$ multiplied by rectilinear travel distances between departments.",
                        "examTip": "Found in Facilities Planning. Rectilinear metric ($L_1$ norm) is standard for industrial orthogonal aisle networks."
                },
                {
                        "title": "Simple Exponential Smoothing Demand Forecast",
                        "formula": "$$F_t = F_{t-1} + \\alpha (A_{t-1} - F_{t-1}) = \\alpha A_{t-1} + (1 - \\alpha) F_{t-1}$$",
                        "description": "Short-term forecasting method updating previous forecast $F_{t-1}$ by a fraction $\\alpha$ ($0 \\le \\alpha \\le 1$) of the most recent forecast error.",
                        "examTip": "Found in Production Planning. Higher $\\alpha$ places more weight on recent demand (more responsive, less smoothing)."
                },
                {
                        "title": "First-Pass Yield (Rolled Throughput Yield)",
                        "formula": "$$RTY = \\prod_{i=1}^k Y_i$$",
                        "description": "The probability that a product passes through all $k$ sequential manufacturing steps without defect or rework.",
                        "examTip": "Found in Quality and Manufacturing. Even if five individual steps have $95\\%$ yield each, the overall $RTY = (0.95)^5 = 77.4\\%$."
                },
                {
                        "title": "Bayes’ Theorem for Quality Inspection",
                        "formula": "$$P(D \\mid +) = \\frac{P(+ \\mid D) P(D)}{P(+ \\mid D) P(D) + P(+ \\mid \\overline{D}) P(\\overline{D})}$$",
                        "description": "Revises the prior defect probability $P(D)$ after receiving a positive test result (+), accounting for false positives and false negatives.",
                        "examTip": "Found in Engineering Probability & Statistics. When defect rate $P(D)$ is very small, even tests with $99\\%$ accuracy yield low posterior probability due to false alarms."
                },
                {
                        "title": "Taguchi Quadratic Quality Loss Function",
                        "formula": "$$L(y) = k (y - m)^2, \\quad k = \\frac{A_0}{\\Delta_0^2}$$",
                        "description": "Recognizes that customer financial loss occurs quadratically whenever quality characteristic $y$ deviates from nominal target $m$, even within specification limits.",
                        "examTip": "Found in Quality Engineering. Constant $k$ equals customer loss at tolerance threshold $A_0$ divided by tolerance deviation squared $\\Delta_0^2$."
                },
                {
                        "title": "Inventory Reorder Point with Safety Stock",
                        "formula": "$$ROP = d \\cdot L + Z \\sigma_L = d \\cdot L + Z \\sigma_d \\sqrt{L}$$",
                        "description": "Sets inventory level triggering a replenishment order, balancing expected lead-time demand $d L$ against safety stock for service level $Z$.",
                        "examTip": "Found in Supply Chain / Inventory Control. $Z$ corresponds to standard normal value for desired non-stockout probability (e.g., $Z=1.645$ for 95% service level)."
                },
                {
                        "title": "Overall Equipment Effectiveness (OEE)",
                        "formula": "$$OEE = \\text{Availability} \\times \\text{Performance} \\times \\text{Quality}$$",
                        "description": "Holistic manufacturing metric benchmarking machine efficiency: Availability (uptime), Performance (speed vs design), and Quality (good units vs total).",
                        "examTip": "Found in Industrial Operations. Benchmark world-class OEE is typically $\\ge 85\\%$ ($90\\% \\text{ Avail} \\times 95\\% \\text{ Perf} \\times 99.9\\% \\text{ Qual}$)."
                },
                {
                        "title": "Poisson Distribution Probability Mass Function",
                        "formula": "$$P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad k = 0, 1, 2, \\dots$$",
                        "description": "Models count of independent random occurrences $k$ in fixed interval with constant average rate $\\lambda$, where variance equals mean ($\\text{Var}(X) = \\text{E}(X) = \\lambda$).",
                        "examTip": "Found in Engineering Statistics. Essential for arrival modelling in queues, accident frequencies, and surface defect density analysis."
                },
                {
                        "title": "Benefit-Cost Ratio Decision Criterion (B/C)",
                        "formula": "$$B/C = \\frac{PW(\\text{Benefits})}{PW(\\text{Initial Capital}) + PW(\\text{O\\&M}) - PW(\\text{Salvage})} \\ge 1.0$$",
                        "description": "Standard public sector engineering economic metric; projects are economically justified if present worth of benefits exceeds costs ($B/C \\ge 1$).",
                        "examTip": "Found in Engineering Economics. When comparing mutually exclusive alternatives, use incremental benefit-cost analysis ($\\Delta B / \\Delta C \\ge 1.0$)."
                }
        ],
        "Environmental": [
                {
                        "title": "Streeter-Phelps Dissolved Oxygen Sag Model",
                        "formula": "$$D_t = \\frac{k_1 L_0}{k_2 - k_1}\\left(e^{-k_1 t} - e^{-k_2 t}\\right) + D_0 e^{-k_2 t}$$",
                        "description": "Models downstream dissolved oxygen deficit $D_t$ in a receiving river balancing organic deoxygenation rate $k_1$ against surface reaeration rate $k_2$.",
                        "examTip": "Found in Water Quality Engineering. Critical deficit occurs where $dD/dt = 0$, giving critical travel time $t_c = \\frac{1}{k_2 - k_1}\\ln\\left[\\frac{k_2}{k_1}\\left(1 - D_0\\frac{k_2-k_1}{k_1 L_0}\\right)\\right]$."
                },
                {
                        "title": "Stokes’ Law for Particle Settling Velocity",
                        "formula": "$$v_t = \\frac{g (\\rho_p - \\rho_f) d_p^2}{18 \\mu}$$",
                        "description": "Calculates terminal settling velocity of small spherical particles in laminar flow where gravitational force balances fluid viscous drag.",
                        "examTip": "Found in Water & Wastewater Treatment. Valid strictly for particle Reynolds number $Re_p = \\rho_f v_t d_p / \\mu < 1.0$ (laminar sedimentation regime)."
                },
                {
                        "title": "Darcy’s Law for Groundwater Seepage",
                        "formula": "$$v_d = -K \\frac{dh}{dL}, \\quad v_s = \\frac{v_d}{\\eta_e}$$",
                        "description": "Determines superficial Darcy velocity $v_d$ and actual contaminant pore seepage velocity $v_s$ using hydraulic conductivity $K$ and effective porosity $\\eta_e$.",
                        "examTip": "Found in Hydrogeology / Remediation. Actual travel time of a non-retarded contaminant plume is governed by seepage velocity $v_s = v_d / \\eta_e$, not Darcy velocity."
                },
                {
                        "title": "First-Order Biochemical Oxygen Demand (BOD) Kinetics",
                        "formula": "$$BOD_t = L_0 (1 - e^{-k t})$$",
                        "description": "Expresses oxygen consumed by microbial oxidation of organic matter up to time $t$, where $L_0$ is ultimate carbonaceous oxygen demand.",
                        "examTip": "Found in Wastewater Engineering. 5-day BOD ($BOD_5$) is standard test parameter: $BOD_5 = L_0 (1 - e^{-5k})$. Temperature correction: $k_T = k_{20} \\theta^{T-20}$."
                },
                {
                        "title": "Chick-Watson Disinfection Kinetics",
                        "formula": "$$\\ln\\left(\\frac{N}{N_0}\\right) = -k C^n t$$",
                        "description": "Quantifies pathogen inactivation ratio $N / N_0$ as a function of disinfectant concentration $C$ and contact time $t$, forming the regulatory $Ct$ concept.",
                        "examTip": "Found in Drinking Water Treatment. When $n=1$, disinfection efficiency depends solely on product $C \\times t$. Regulatory pathogen removal uses log-credits ($-\\log_{10}(N/N_0)$)."
                },
                {
                        "title": "Freundlich Adsorption Isotherm",
                        "formula": "$$q_e = \\frac{x}{m} = K_f C_e^{1/n}$$",
                        "description": "Empirical relationship modeling multi-layer adsorption of organic contaminants from water onto activated carbon at equilibrium concentration $C_e$.",
                        "examTip": "Found in Water and Air Treatment. Linearized form: $\\log(q_e) = \\log(K_f) + \\frac{1}{n} \\log(C_e)$. Plotting on log-log scales yields slope $1/n$."
                },
                {
                        "title": "Langmuir Adsorption Isotherm",
                        "formula": "$$q_e = \\frac{q_{\\text{max}} b C_e}{1 + b C_e}$$",
                        "description": "Theoretical model for monolayer adsorption onto homogeneous surface sites with uniform binding energy and no adsorbate-adsorbate interaction.",
                        "examTip": "Found in Environmental Chemistry / Remediation. At high concentration ($b C_e \\gg 1$), adsorption plateaus at maximum capacity $q_e \\to q_{\\text{max}}$."
                },
                {
                        "title": "Sedimentation Basin Surface Overflow Rate (SOR)",
                        "formula": "$$SOR = \\frac{Q}{A_s} = v_c$$",
                        "description": "Defines settling velocity $v_c$ of particles that are 100% captured in an ideal horizontal-flow settling basin of plan surface area $A_s$.",
                        "examTip": "Found in Water Treatment. Any particle with settling velocity $v_t \\ge SOR$ will settle out completely. Fractional removal of slower particles is $X = v_t / SOR$."
                },
                {
                        "title": "Coagulation Rapid Mix Velocity Gradient (G-Value)",
                        "formula": "$$G = \\sqrt{\\frac{P}{\\mu V}}$$",
                        "description": "Root-mean-square fluid velocity gradient $G$ [$\\text{s}^{-1}$] quantifying turbulent shear and power dissipation $P$ in rapid mixing coagulation basins.",
                        "examTip": "Found in Water Treatment. Typical rapid mix design targets $G \\sim 700 - 1000\\text{ s}^{-1}$ with retention time $t \\sim 20 - 60\\text{ s}$ ($Gt \\sim 20{,}000 - 60{,}000$)."
                },
                {
                        "title": "Gaussian Plume Air Dispersion Model",
                        "formula": "$$C(x,y,z) = \\frac{Q}{2\\pi u \\sigma_y \\sigma_z} \\exp\\left(-\\frac{y^2}{2\\sigma_y^2}\\right)\\left[\\exp\\left(-\\frac{(z-H)^2}{2\\sigma_z^2}\\right) + \\exp\\left(-\\frac{(z+H)^2}{2\\sigma_z^2}\\right)\\right]$$",
                        "description": "Predicts downwind ground-level pollutant concentration from a continuous point source of emission rate $Q$ at effective stack height $H$.",
                        "examTip": "Found in Air Quality Engineering. Plume dispersion coefficients $\\sigma_y, \\sigma_z$ are functions of downwind distance $x$ and Pasquill-Gifford atmospheric stability classes."
                },
                {
                        "title": "Ideal Gas Conversion for Air Pollutants",
                        "formula": "$$C \\text{ [mg/m}^3\\text{]} = \\frac{C \\text{ [ppm]} \\times M_{\\text{molar}}}{24.45} \\quad (1\\text{ atm}, \\; 25^\\circ\\text{C})$$",
                        "description": "Converts gaseous contaminant concentration from parts-per-million by volume to mass per unit volume at standard ambient temperature and pressure.",
                        "examTip": "Found in Air Quality. Molar volume of ideal gas is $24.45\\text{ L/mol}$ at $25^\\circ\\text{C}$ ($298\\text{ K}$) and $22.41\\text{ L/mol}$ at $0^\\circ\\text{C}$ ($273\\text{ K}$)."
                },
                {
                        "title": "Carbonate System Total Alkalinity Balance",
                        "formula": "$$\\text{Alkalinity} = [\\text{HCO}_3^-] + 2[\\text{CO}_3^{2-}] + [\\text{OH}^-] - [\\text{H}^+]$$",
                        "description": "Measures acid-neutralizing capacity of natural waters, dominated by bicarbonate, carbonate, and hydroxide equilibrium species.",
                        "examTip": "Found in Water Chemistry. Total alkalinity is reported in $\\text{mg/L as CaCO}_3$. Equivalent weight of $\\text{CaCO}_3$ is $50\\text{ g/eq}$."
                },
                {
                        "title": "Logarithmic Sound Pressure Level Decibel Addition",
                        "formula": "$$L_{p, \\text{total}} = 10 \\log_{10}\\left(\\sum_{i=1}^n 10^{L_{p, i} / 10}\\right)$$",
                        "description": "Calculates combined sound pressure level from multiple independent noise sources, accounting for the logarithmic decibel scale.",
                        "examTip": "Found in Environmental Noise. Adding two equal noise sources ($L_1 = L_2 = 80\\text{ dB}$) increases sound level by exactly $3\\text{ dB}$ ($83\\text{ dB}$)."
                },
                {
                        "title": "Sludge Volume Index (SVI) in Activated Sludge",
                        "formula": "$$SVI = \\frac{\\text{Settled Sludge Volume after 30 min [mL/L]} \\times 1000}{\\text{Mixed Liquor Suspended Solids (MLSS) [mg/L]}}$$",
                        "description": "Assesses settling characteristics of activated sludge in secondary clarifiers; optimum range is $80 - 150\\text{ mL/g}$.",
                        "examTip": "Found in Wastewater Engineering. $SVI > 200\\text{ mL/g}$ indicates filamentous sludge bulking, preventing proper clarification."
                },
                {
                        "title": "First-Order Landfill Methane Generation Model",
                        "formula": "$$Q_{CH_4} = \\sum_{i=1}^n 2 k L_0 M_i e^{-k t_i}$$",
                        "description": "Predicts annual methane generation from municipal solid waste of mass $M_i$ based on methane generation potential $L_0$ and decay rate $k$.",
                        "examTip": "Found in Solid Waste Management. Landfill gas is typically $50\\% \\text{ CH}_4$ and $50\\% \\text{ CO}_2$ by volume."
                },
                {
                        "title": "Hazen-Williams Head Loss Equation for Water Lines",
                        "formula": "$$h_f = 10.44 \\frac{L Q^{1.852}}{C^{1.852} D^{4.87}}$$",
                        "description": "Computes friction head loss $h_f$ in water distribution networks for flow rate $Q$ [cfs], length $L$ [ft], diameter $D$ [ft], and roughness $C$.",
                        "examTip": "Found in Water Distribution. PVC pipe has $C \\approx 140 - 150$; cast iron has $C \\approx 100$. Lower $C$ represents rougher internal pipe wall."
                },
                {
                        "title": "Breakpoint Chlorination Chemistry",
                        "formula": "$$\\text{Cl}_2 + \\text{H}_2\\text{O} \\rightleftharpoons \\text{HOCl} + \\text{H}^+ + \\text{Cl}^-$$",
                        "description": "Chlorine gas hydrolyzes into hypochlorous acid ($\\text{HOCl}$), reacting with ammonia to form chloramines until breakpoint is reached, establishing free residual chlorine.",
                        "examTip": "Found in Water Treatment. $\\text{HOCl}$ is $\\sim 80\\times$ more potent germicide than hypochlorite ion $\\text{OCl}^-$. At $\\text{pH} < 7.5$, $\\text{HOCl}$ dominates."
                },
                {
                        "title": "Venturi Wet Scrubber Particle Collection Efficiency",
                        "formula": "$$\\eta = 1 - \\exp\\left(-k R \\sqrt{\\Psi}\\right), \\quad \\Psi = \\frac{C' \\rho_p d_p^2 v_r}{18 \\mu_g d_d}$$",
                        "description": "Calculates particulate removal efficiency in venturi scrubbers based on droplet-particle inertial impaction parameter $\\Psi$ and liquid-gas ratio $R$.",
                        "examTip": "Found in Air Pollution Control. Higher throat velocity increases impaction parameter $\\Psi$ and collection of fine submicron particles, but raises pressure drop."
                },
                {
                        "title": "Cyclone Separator Cut Diameter ($d_{50}$)",
                        "formula": "$$d_{pc} = \\sqrt{\\frac{9 \\mu W}{2\\pi N_e v_i (\\rho_p - \\rho_g)}}$$",
                        "description": "The particle aerodynamic diameter collected with exactly 50% efficiency in a reverse-flow cyclone separator of inlet width $W$.",
                        "examTip": "Found in Air Quality Engineering. $N_e$ is effective number of vortex turns (typically $N_e \\approx 5$). Particles with $d_p > 2 d_{pc}$ are collected with $> 90\\%$ efficiency."
                },
                {
                        "title": "Mean Cell Residence Time (Sludge Age / MCRT)",
                        "formula": "$$\\theta_c = \\frac{V X}{Q_w X_w + Q_e X_e}$$",
                        "description": "Average time in days biological microorganisms remain inside the activated sludge system, controlling nitrification and sludge settling qualities.",
                        "examTip": "Found in Wastewater Treatment. Typical domestic activated sludge targets $\\theta_c \\sim 5 - 15\\text{ days}$. Extended aeration systems operate at $\\theta_c > 20\\text{ days}$."
                },
                {
                        "title": "Food-to-Microorganism (F/M) Ratio",
                        "formula": "$$F/M = \\frac{Q S_0}{V X}$$",
                        "description": "Operational organic loading parameter relating mass of substrate entering aeration basin ($Q S_0$) per day to total biomass inventory ($V X$).",
                        "examTip": "Found in Wastewater Engineering. Units are $\\text{lb BOD}_5 / (\\text{lb MLVSS} \\cdot \\text{day})$ or $\\text{kg/kg}\\cdot\\text{d}$. Typical conventional range is $0.2 - 0.5$."
                },
                {
                        "title": "Noise Dose and Time-Weighted Average (OSHA)",
                        "formula": "$$D = 100 \\sum_{i=1}^n \\frac{C_i}{T_i}, \\quad TWA = 16.61 \\log_{10}\\left(\\frac{D}{100}\\right) + 90$$",
                        "description": "Calculates occupational noise exposure dose $D$ [%] and 8-hour equivalent $TWA$ under OSHA standard with 5-dB exchange rate.",
                        "examTip": "Found in Environmental Health / Industrial Hygiene. Permissible exposure limit is $TWA = 90\\text{ dBA}$ ($D=100\\%$); action level for hearing conservation is $85\\text{ dBA}$ ($D=50\\%$)."
                },
                {
                        "title": "Hydraulic Retention Time in Treatment Basins",
                        "formula": "$$\\theta = \\frac{V}{Q}$$",
                        "description": "Average theoretical residence time of fluid in an environmental treatment unit (clarifier, aeration basin, disinfection chamber) of volume $V$ and flow $Q$.",
                        "examTip": "Found in Water and Wastewater. In secondary clarifiers, $\\theta \\sim 2 - 3\\text{ hours}$; in chlorine contact basins, $\\theta \\sim 15 - 30\\text{ minutes}$."
                },
                {
                        "title": "Biological Nitrification Stoichiometry",
                        "formula": "$$\\text{NH}_4^+ + 1.86 \\text{O}_2 + 0.198 \\text{CO}_2 \\to 0.021 \\text{C}_5\\text{H}_7\\text{O}_2\\text{N} + 0.98 \\text{NO}_3^- + 0.041 \\text{H}_2\\text{O} + 1.98 \\text{H}^+$$",
                        "description": "Two-step aerobic autotrophic oxidation of ammonia to nitrite (Nitrosomonas) and nitrate (Nitrobacter), consuming oxygen and destroying alkalinity.",
                        "examTip": "Found in Wastewater Engineering. Nitrifying $1\\text{ mg NH}_4^+-\\text{N}$ requires $4.57\\text{ mg O}_2$ and destroys $7.14\\text{ mg CaCO}_3$ of alkalinity."
                },
                {
                        "title": "Greenhouse Gas Global Warming Potential Equivalent",
                        "formula": "$$\\text{CO}_2\\text{e} = \\sum_{i=1}^n m_i \\times GWP_i$$",
                        "description": "Normalizes impact of different greenhouse gas emissions into equivalent metric tons of carbon dioxide based on 100-year radiative forcing values.",
                        "examTip": "Found in Air Quality & Climate. Standard 100-year $GWP$: Methane ($\\text{CH}_4$) $\\sim 28 - 30$; Nitrous Oxide ($\\text{N}_2\\text{O}$) $\\sim 265 - 298$."
                }
        ],
        "Other": [
                {
                        "title": "First Law of Thermodynamics (Control Volume Energy Equation)",
                        "formula": "$$\\dot{Q} - \\dot{W} = \\sum_{\\text{out}} \\dot{m}\\left(h + \\frac{v^2}{2} + g z\\right) - \\sum_{\\text{in}} \\dot{m}\\left(h + \\frac{v^2}{2} + g z\\right)$$",
                        "description": "States general conservation of energy for an open steady-flow control volume with heat transfer, shaft work, and flowing fluid streams.",
                        "examTip": "Found in Thermodynamics. For an adiabatic turbine: $\\dot{W} = \\dot{m}(h_1 - h_2)$. For an adiabatic throttling valve: $h_1 = h_2$.",
                        "videoUrl": "assets/videos/First_Law_of_Thermodynamics.mp4",
                        "videoTitle": "First Law of Thermodynamics Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Second Law of Thermodynamics (Carnot Efficiency Limit)",
                        "formula": "$$\\eta_{\\text{max}} = 1 - \\frac{T_L}{T_H} = \\frac{T_H - T_L}{T_H}$$",
                        "description": "The absolute upper limit of thermal conversion efficiency for any heat engine operating between hot reservoir $T_H$ and cold sink $T_L$.",
                        "examTip": "Found in Thermodynamics. Always convert temperatures to absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}) before substituting!",
                        "videoUrl": "assets/videos/Carnot_Cycle.mp4",
                        "videoTitle": "Carnot Cycle Thermodynamic p-V Diagram",
                        "videoDuration": "10s"
                },
                {
                        "title": "Work-Energy Principle for Particles",
                        "formula": "$$W_{\\text{net}} = \\Delta T = \\frac{1}{2} m v_2^2 - \\frac{1}{2} m v_1^2$$",
                        "description": "The total work done by all external conservative and non-conservative forces equals the change in kinetic energy of the mass.",
                        "examTip": "Found in Dynamics. Best method for problems involving force as a function of position or displacement where time $t$ is not needed."
                },
                {
                        "title": "Linear Impulse and Momentum Principle",
                        "formula": "$$\\int_{t_1}^{t_2} \\sum \\vec{F} dt = m \\vec{v}_2 - m \\vec{v}_1 = \\Delta \\vec{p}$$",
                        "description": "The time integral of resultant external forces acting on a body equals the change in its linear momentum vector.",
                        "examTip": "Found in Dynamics. Primary tool for solving impact, collision, and fluid jet reaction problems. Remember momentum is a vector quantity!",
                        "videoUrl": "assets/videos/Impulse_Momentum_Principle.mp4",
                        "videoTitle": "Linear Impulse and Momentum Principle Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Bernoulli’s Principle for Incompressible Streamline Flow",
                        "formula": "$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g z_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g z_2$$",
                        "description": "Conservation of mechanical energy along a streamline for frictionless, steady, incompressible flow.",
                        "examTip": "Found in Fluid Mechanics. Keep static pressure, velocity head, and elevation datum consistent between points 1 and 2.",
                        "videoUrl": "assets/videos/Bernoullis_Principle.mp4",
                        "videoTitle": "Bernoulli's Principle Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Hooke’s Law for Uniaxial Elastic Deformation",
                        "formula": "$$\\sigma = E \\epsilon, \\quad \\delta = \\frac{P L}{A E}$$",
                        "description": "Relates axial normal stress to elastic strain through Young’s modulus $E$, and determines elongation $\\delta$ under axial load $P$.",
                        "examTip": "Found in Mechanics of Materials. Valid only within the linear elastic limit (below proportional limit stress $\\sigma_{pl}$)."
                },
                {
                        "title": "Mohr’s Circle for 2D Plane Stress",
                        "formula": "$$\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}$$",
                        "description": "Yields principal normal stresses and maximum in-plane shear stress for any general plane stress state $(\\sigma_x, \\sigma_y, \\tau_{xy})$.",
                        "examTip": "Found in Mechanics of Materials. The radius of the circle directly equals the maximum in-plane shear stress $\\tau_{\\text{max}}$.",
                        "videoUrl": "assets/videos/Mohrs_Circle.mp4",
                        "videoTitle": "Mohr's Circle for Plane Stress Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Parallel Axis Theorem for Moment of Inertia",
                        "formula": "$$I_x = I_{xc} + A d^2, \\quad I_{xx} = I_G + m d^2$$",
                        "description": "Computes area or mass moment of inertia about any axis parallel to a known centroidal axis at perpendicular distance $d$.",
                        "examTip": "Found in Statics and Dynamics. Variable $d$ is strictly the perpendicular distance from the centroid to the new parallel reference axis.",
                        "videoUrl": "assets/videos/Parallel_Axis_Theorem.mp4",
                        "videoTitle": "Parallel Axis Theorem Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Newton’s Second Law for Rigid Body Planar Motion",
                        "formula": "$$\\sum \\vec{F} = m \\vec{a}_G, \\quad \\sum M_G = I_G \\alpha$$",
                        "description": "Fundamental dynamic equations governing 2D planar motion, resolving translational acceleration of center of mass $G$ and angular acceleration $\\alpha$.",
                        "examTip": "Found in Dynamics. Summing moments about an arbitrary point $P$: $\\sum M_P = I_G \\alpha + (\\vec{r}_{G/P} \\times m\\vec{a}_G)_z$."
                },
                {
                        "title": "Euler’s Column Critical Buckling Formula",
                        "videoUrl": "assets/videos/Eulers_Critical_Buckling_Load.mp4",
                        "videoTitle": "Euler's Critical Buckling Load Explainer",
                        "videoDuration": "10s",
                        "formula": "$$P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}$$",
                        "description": "Calculates maximum axial compressive load before sudden elastic lateral buckling occurs in a slender structural member.",
                        "examTip": "Found in Mechanics of Materials. $K$ is effective length factor: $1.0$ (pinned-pinned), $0.5$ (fixed-fixed), $0.7$ (fixed-pinned), $2.0$ (fixed-free)."
                },
                {
                        "title": "Darcy-Weisbach Pipe Friction Equation",
                        "videoUrl": "assets/videos/Darcy_Weisbach_Equation.mp4",
                        "videoTitle": "Darcy-Weisbach Equation Explainer",
                        "videoDuration": "10s",
                        "formula": "$$h_f = f \\frac{L}{D} \\frac{v^2}{2g}$$",
                        "description": "Computes head loss in conduit flow as a function of friction factor $f$, length $L$, diameter $D$, and velocity $v$.",
                        "examTip": "Found in Fluid Mechanics. In laminar flow ($Re < 2100$), $f = 64/Re$. In turbulent flow, look up $f$ on the Moody diagram using relative roughness $\\epsilon/D$."
                },
                {
                        "title": "Fourier’s Law of Thermal Conduction",
                        "formula": "$$\\dot{Q} = -k A \\frac{dT}{dx}$$",
                        "description": "Rate of heat conduction through a material is proportional to thermal conductivity $k$, area $A$, and negative temperature gradient.",
                        "examTip": "Found in Heat Transfer. For a flat wall of thickness $L$: $\\dot{Q} = \\frac{k A}{L}(T_1 - T_2) = \\frac{\\Delta T}{R_{th}}$.",
                        "videoUrl": "assets/videos/Fouriers_Law.mp4",
                        "videoTitle": "Fourier's Law Thermal Conduction Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Newton’s Law of Cooling (Convective Heat Transfer)",
                        "videoUrl": "assets/videos/Newtons_Law_of_Cooling.mp4",
                        "videoTitle": "Newton's Law of Cooling Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\dot{Q}_{conv} = h A_s (T_s - T_\\infty)$$",
                        "description": "Expresses rate of heat transfer between a solid surface at temperature $T_s$ and an adjacent moving fluid at bulk temperature $T_\\infty$.",
                        "examTip": "Found in Heat Transfer. Convective thermal resistance is $R_{th} = 1 / (h A_s)$. Heat transfer coefficient $h$ depends on flow regime and geometry."
                },
                {
                        "title": "Stefan-Boltzmann Law of Thermal Radiation",
                        "videoUrl": "assets/videos/Stefan_Boltzmann_Law.mp4",
                        "videoTitle": "Stefan-Boltzmann Law Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\dot{Q}_{emit} = \\epsilon \\sigma A T^4, \\quad \\sigma = 5.67 \\times 10^{-8} \\text{ W}/(\\text{m}^2 \\cdot \\text{K}^4)$$",
                        "description": "Total radiant power emitted by a gray body with surface emissivity $\\epsilon$ at absolute thermodynamic temperature $T$.",
                        "examTip": "Found in Heat Transfer. Temperature $T$ MUST be converted to absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}). For an ideal blackbody, $\\epsilon = 1$."
                },
                {
                        "title": "SDOF Undamped Natural Harmonic Frequency",
                        "videoUrl": "assets/videos/Single_DOF_Natural_Frequency.mp4",
                        "videoTitle": "Single DOF Natural Frequency Explainer",
                        "videoDuration": "10s",
                        "formula": "$$\\omega_n = \\sqrt{\\frac{k}{m}} \\text{ [rad/s]}, \\quad f_n = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} \\text{ [Hz]}$$",
                        "description": "Calculates natural angular frequency $\\omega_n$ and cyclic frequency $f_n$ for an undamped single-degree-of-freedom mass-spring mechanical oscillator.",
                        "examTip": "Found in Dynamics. Natural period of oscillation is $\\tau_n = 1 / f_n = 2\\pi / \\omega_n$."
                },
                {
                        "title": "Ideal Gas Law Equation of State",
                        "formula": "$$P V = m R T = n \\bar{R} T, \\quad \\bar{R} = 8.314\\text{ kJ/(kmol}\\cdot\\text{K)}$$",
                        "description": "Relates pressure $P$, volume $V$, and absolute temperature $T$ for gases at low pressure and moderate temperature.",
                        "examTip": "Found in Thermodynamics / Chemistry. Specific gas constant $R = \\bar{R} / M_{\\text{molar}}$. For air, $R = 0.287\\text{ kJ/(kg}\\cdot\\text{K)}$.",
                        "videoUrl": "assets/videos/Ideal_Gas_Law.mp4",
                        "videoTitle": "Ideal Gas Law Equation of State Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Hydrostatic Pressure Distribution with Depth",
                        "formula": "$$P = P_0 + \\rho g h = P_0 + \\gamma h$$",
                        "description": "Pressure increase in a static incompressible fluid is directly proportional to fluid density $\\rho$, gravity $g$, and submerged depth $h$.",
                        "examTip": "Found in Fluid Mechanics. Gauge pressure ignores atmospheric surface pressure $P_0$: $P_{\\text{gauge}} = \\gamma h$.",
                        "videoUrl": "assets/videos/Hydrostatic_Pressure.mp4",
                        "videoTitle": "Hydrostatic Pressure Distribution Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Continuity Equation for Incompressible Flow",
                        "formula": "$$A_1 v_1 = A_2 v_2 = Q$$",
                        "description": "Conservation of mass in a fluid conduit; when fluid density $\\rho$ is constant, volumetric flow rate $Q = A v$ is constant everywhere.",
                        "examTip": "Found in Fluid Mechanics. Flow velocity varies inversely with cross-sectional area: $v_2 = v_1 (A_1 / A_2) = v_1 (D_1 / D_2)^2$.",
                        "videoUrl": "assets/videos/Continuity_Equation.mp4",
                        "videoTitle": "Continuity Equation (Conservation of Mass) Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Elastic Flexure Formula for Beam Bending",
                        "formula": "$$\\sigma = -\\frac{M y}{I} \\implies \\sigma_{\\text{max}} = \\frac{M}{S}$$",
                        "description": "Determines longitudinal normal bending stress at distance $y$ from the neutral axis under internal bending moment $M$.",
                        "examTip": "Found in Mechanics of Materials. Section modulus is $S = I / c$. For rectangular cross-section ($b \\times h$), $S = b h^2 / 6$.",
                        "videoUrl": "assets/videos/Bending_Formula.mp4",
                        "videoTitle": "Bending Formula (Beam Flexure Stress)",
                        "videoDuration": "10s"
                },
                {
                        "title": "Torsion Formula for Circular Shafts",
                        "formula": "$$\\tau = \\frac{T r}{J}, \\quad \\phi = \\frac{T L}{G J}$$",
                        "description": "Computes shear stress $\\tau$ at radial distance $r$ and total angular twist $\\phi$ in a circular shaft subjected to torque $T$.",
                        "examTip": "Found in Mechanics of Materials. Polar moment of inertia for a solid circular shaft is $J = \\pi d^4 / 32$.",
                        "videoUrl": "assets/videos/Torsion_Formula.mp4",
                        "videoTitle": "Torsion Formula (Shaft Shear Stress & Twist)",
                        "videoDuration": "10s"
                },
                {
                        "title": "Reynolds Number (Flow Similarity Metric)",
                        "videoUrl": "assets/videos/Reynolds_Number.mp4",
                        "videoTitle": "Reynolds Number Explainer",
                        "videoDuration": "10s",
                        "formula": "$$Re = \\frac{\\rho v D}{\\mu} = \\frac{v D}{\\nu}$$",
                        "description": "Dimensionless ratio of inertial forces to viscous forces in fluid flow, demarcating laminar from turbulent flow regimes.",
                        "examTip": "Found in Fluid Mechanics. For internal pipe flow: $Re < 2100$ is laminar; $Re > 4000$ is fully turbulent."
                },
                {
                        "title": "Ohm’s Law and Electrical Power",
                        "videoUrl": "assets/videos/Ohms_Law.mp4",
                        "videoTitle": "Ohm's Law Explainer",
                        "videoDuration": "10s",
                        "formula": "$$V = I R, \\quad P = V I = I^2 R = \\frac{V^2}{R}$$",
                        "description": "Fundamental relationship between voltage $V$, current $I$, resistance $R$, and dissipated electrical power $P$ in DC circuits.",
                        "examTip": "Found in Electrical Circuits. In series circuits, current is constant; in parallel circuits, voltage drop is identical across branches."
                },
                {
                        "title": "Engineering Economics Compound Interest Formula",
                        "formula": "$$F = P (1 + i)^n = P (F/P, i, n)$$",
                        "description": "Calculates future worth $F$ accumulated from present principal $P$ compounded over $n$ periods at effective interest rate $i$.",
                        "examTip": "Found in Engineering Economics. Present worth factor is $(P/F, i, n) = (1 + i)^{-n}$.",
                        "videoUrl": "assets/videos/Compound_Interest_Formula.mp4",
                        "videoTitle": "Compound Interest Formula Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Centroid of Composite Planar Areas",
                        "formula": "$$\\bar{x} = \\frac{\\sum A_i \\bar{x}_i}{\\sum A_i}, \\quad \\bar{y} = \\frac{\\sum A_i \\bar{y}_i}{\\sum A_i}$$",
                        "description": "Calculates the geometric center $(\\bar{x}, \\bar{y})$ of composite cross sections by taking the first moments of area divided by total area.",
                        "examTip": "Found in Statics / Mechanics of Materials. For cutouts or holes, treat their area as negative in the summation.",
                        "videoUrl": "assets/videos/Centroid_of_Composite_Planar_Areas.mp4",
                        "videoTitle": "Centroid of Composite Planar Areas Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Isotropic Elastic Constants Relationship",
                        "formula": "$$G = \\frac{E}{2(1 + \\nu)}$$",
                        "description": "Interrelates Young’s modulus of elasticity $E$, shear modulus $G$, and Poisson’s ratio $\\nu$ for homogeneous isotropic linear elastic materials.",
                        "examTip": "Found in Mechanics of Materials. For structural steel ($E \\approx 200\\text{ GPa}, \\nu \\approx 0.30$), shear modulus is $G \\approx 77\\text{ GPa}$."
                }
        ]
};

    let quoteIndex = Math.floor(Math.random() * QUOTES.length);
    let theoremIndex = 0;

    function getActiveDiscipline() {
        const disc = localStorage.getItem('enggtv_discipline') || 
                     (window.state && window.state.user && window.state.user.discipline) || 
                     'Mechanical';
        if (THEOREMS_BY_DISCIPLINE[disc]) return disc;
        if (disc === 'Civil Engineering') return 'Civil';
        if (disc === 'Electrical') return 'Electrical and Computer';
        if (disc === 'Other Disciplines' || disc === 'FE_Other Discipline' || (disc && disc.toLowerCase().includes('other'))) return 'Other';
        return 'Mechanical';
    }

    function renderDailyQuote(isShuffle = false) {
        if (isShuffle) {
            quoteIndex = (quoteIndex + 1) % QUOTES.length;
        }
        const q = QUOTES[quoteIndex];
        const quoteTextEl = document.getElementById('daily-quote-text');
        const quoteAuthorEl = document.getElementById('daily-quote-author');
        const quoteRoleEl = document.getElementById('daily-quote-role');

        if (quoteTextEl) quoteTextEl.textContent = `“${q.quote}”`;
        if (quoteAuthorEl) quoteAuthorEl.textContent = q.author;
        if (quoteRoleEl) quoteRoleEl.textContent = q.role;
    }

    function renderDailyTheorem(isShuffle = false, explicitIndex = null, autoPlay = false) {
        const disc = getActiveDiscipline();
        const theorems = THEOREMS_BY_DISCIPLINE[disc] || THEOREMS_BY_DISCIPLINE['Mechanical'];

        if (explicitIndex !== null && explicitIndex >= 0 && explicitIndex < theorems.length) {
            theoremIndex = explicitIndex;
        } else if (isShuffle) {
            theoremIndex = (theoremIndex + 1) % theorems.length;
        } else {
            // deterministic index based on day of month
            const dayOfMonth = new Date().getDate();
            theoremIndex = dayOfMonth % theorems.length;
        }

        const th = theorems[theoremIndex];

        const discBadgeEl = document.getElementById('daily-theorem-discipline');
        const titleEl = document.getElementById('daily-theorem-title');
        const formulaEl = document.getElementById('daily-theorem-formula');
        const descEl = document.getElementById('daily-theorem-desc');
        const tipEl = document.getElementById('daily-theorem-tip');

        if (discBadgeEl) discBadgeEl.textContent = `${disc} FE Focus • #${theoremIndex + 1} of ${theorems.length}`;
        if (titleEl) titleEl.textContent = th.title;
        if (formulaEl) formulaEl.innerHTML = th.formula;
        if (descEl) descEl.textContent = th.description;
        if (tipEl) tipEl.textContent = th.examTip;

        // Video Explainer Field Handling
        const playerCardEl = document.getElementById('daily-theorem-player-card');
        const noVideoCardEl = document.getElementById('daily-theorem-no-video');
        const videoEl = document.getElementById('daily-theorem-video');
        const videoTitleEl = document.getElementById('daily-theorem-video-title');
        const videoDurationEl = document.getElementById('daily-theorem-video-duration');

        if (th.videoUrl) {
            if (playerCardEl) playerCardEl.classList.remove('hidden');
            if (noVideoCardEl) noVideoCardEl.classList.add('hidden');
            if (videoTitleEl) videoTitleEl.textContent = th.videoTitle || `${th.title} Explainer`;
            if (videoDurationEl) videoDurationEl.textContent = th.videoDuration || '10s HD';
            
            if (videoEl) {
                const currentSrc = videoEl.getAttribute('data-src');
                const isNewSrc = currentSrc !== th.videoUrl;
                if (isNewSrc) {
                    videoEl.setAttribute('data-src', th.videoUrl);
                    videoEl.src = th.videoUrl;
                    videoEl.load();
                }

                // Automatically play the video once shuffled or explicitly navigated
                if (isShuffle || autoPlay) {
                    videoEl.currentTime = 0;
                    const triggerPlay = () => {
                        const playPromise = videoEl.play();
                        if (playPromise !== undefined) {
                            playPromise.catch(err => {
                                console.log('Autoplay attempt caught:', err);
                            });
                        }
                    };

                    if (isNewSrc) {
                        videoEl.addEventListener('canplay', function onCanPlay() {
                            videoEl.removeEventListener('canplay', onCanPlay);
                            triggerPlay();
                        }, { once: true });
                        setTimeout(triggerPlay, 180);
                    } else {
                        triggerPlay();
                    }
                }
            }
        } else {
            if (playerCardEl) playerCardEl.classList.add('hidden');
            if (noVideoCardEl) noVideoCardEl.classList.remove('hidden');
            if (videoEl) {
                videoEl.pause();
            }
        }

        // Render MathJax LaTeX equation & text (formula, description, tip, title)
        const mathElements = [formulaEl, descEl, tipEl, titleEl].filter(Boolean);
        if (window.safeTypesetMath) {
            window.safeTypesetMath(mathElements);
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            if (typeof window.MathJax.typesetClear === 'function') {
                window.MathJax.typesetClear(mathElements);
            }
            window.MathJax.typesetPromise(mathElements).catch(err => console.warn('MathJax render notice:', err));
        }
    }

    function setTheoremLayout(layout = 'below') {
        const card = document.getElementById('daily-theorem-card');
        const grid = document.getElementById('daily-theorem-body-grid');
        const btnBelow = document.getElementById('btn-theorem-layout-below');
        const btnSide = document.getElementById('btn-theorem-layout-side');

        if (layout === 'side') {
            if (card) {
                card.classList.remove('lg:col-span-6');
                card.classList.add('lg:col-span-12');
            }
            if (grid) {
                grid.classList.remove('grid-cols-1');
                grid.classList.add('grid-cols-1', 'lg:grid-cols-2', 'gap-6', 'items-start');
            }
            if (btnSide) {
                btnSide.className = 'px-2 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-700 shadow-sm transition-all flex items-center gap-1 cursor-pointer';
            }
            if (btnBelow) {
                btnBelow.className = 'px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all flex items-center gap-1 cursor-pointer';
            }
        } else {
            if (card) {
                card.classList.remove('lg:col-span-12');
                card.classList.add('lg:col-span-6');
            }
            if (grid) {
                grid.classList.remove('grid-cols-1', 'lg:grid-cols-2', 'gap-6', 'items-start');
                grid.classList.add('grid-cols-1', 'gap-4');
            }
            if (btnBelow) {
                btnBelow.className = 'px-2 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-700 shadow-sm transition-all flex items-center gap-1 cursor-pointer';
            }
            if (btnSide) {
                btnSide.className = 'px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all flex items-center gap-1 cursor-pointer';
            }
        }
        try {
            localStorage.setItem('enggtv_theorem_layout', layout);
        } catch (e) {}
    }

    function previewTheoremVideo(videoId) {
        if (typeof window.switchDashboardTab === 'function') {
            try { window.switchDashboardTab('motivation'); } catch (e) {}
        }
        let disc = 'Mechanical';
        if (videoId === 'greenshields' || videoId === 'greenshield' || videoId === 'stopping' || videoId === 'ssd' || videoId === 'manning' || videoId === 'mannings' || videoId === 'slenderness') {
            disc = 'Civil';
        } else if (videoId === 'demorgan' || videoId === 'demorgans' || videoId === 'boolean' || videoId === 'thevenin' || videoId === 'nyquist' || videoId === 'sampling' || videoId === 'ohm' || videoId === 'ohms' || videoId === 'opamp' || videoId === 'amplifier' || videoId === 'maximumpower' || videoId === 'power' || videoId === 'kirchhoff' || videoId === 'kcl' || videoId === 'kvl' || videoId === 'rctransient' || videoId === 'rc' || videoId === 'rlc' || videoId === 'resonance' || videoId === 'bjt' || videoId === 'transistor' || videoId === 'laplace' || videoId === 'finalvalue') {
            disc = 'Electrical and Computer';
        } else if (videoId === 'idealgas' || videoId === 'gas' || videoId === 'hydrostatic' || videoId === 'hydro' || videoId === 'compound' || videoId === 'interest' || videoId === 'centroid' || videoId === 'composite') {
            disc = 'Other';
        } else if (videoId === 'firstlaw' || videoId === 'thermodynamics' || videoId === 'pressurevessel' || videoId === 'pressure' || videoId === 'vessel' || videoId === 'vessels' || videoId === 'continuity' || videoId === 'impulse' || videoId === 'momentum' || videoId === 'euler' || videoId === 'buckling' || videoId === 'cooling' || videoId === 'newton' || videoId === 'newtons' || videoId === 'stefan' || videoId === 'boltzmann' || videoId === 'radiation' || videoId === 'sdof' || videoId === 'harmonic' || videoId === 'vibrations' || videoId === 'lmtd' || videoId === 'mach' || videoId === 'sound' || videoId === 'darcy' || videoId === 'weisbach' || videoId === 'weisback' || videoId === 'rankine' || videoId === 'otto') {
            disc = 'Mechanical';
        }
        try {
            localStorage.setItem('enggtv_discipline', disc);
        } catch (e) {}

        const theorems = THEOREMS_BY_DISCIPLINE[disc] || THEOREMS_BY_DISCIPLINE['Mechanical'];
        const keyMap = {
            'bernoulli': ['bernoulli'],
            'fourier': ['fourier'],
            'carnot': ['carnot'],
            'mohr': ['mohr'],
            'parallel': ['parallel'],
            'bending': ['bending', 'flexure'],
            'torsion': ['torsion'],
            'greenshields': ['greenshield'],
            'ssd': ['stopping sight', 'ssd'],
            'stopping': ['stopping sight', 'ssd'],
            'reynolds': ['reynolds'],
            'manning': ['manning'],
            'mannings': ['manning'],
            'slenderness': ['slenderness'],
            'euler': ['euler', 'buckling'],
            'buckling': ['euler', 'buckling'],
            'demorgan': ['de morgan', 'demorgan'],
            'demorgans': ['de morgan', 'demorgan'],
            'thevenin': ['thevenin'],
            'nyquist': ['nyquist', 'sampling'],
            'cooling': ['cooling', 'convective'],
            'newton': ['cooling', 'convective'],
            'newtons': ['cooling', 'convective'],
            'ohm': ['ohm'],
            'ohms': ['ohm'],
            'stefan': ['stefan', 'boltzmann'],
            'boltzmann': ['stefan', 'boltzmann'],
            'radiation': ['stefan', 'boltzmann'],
            'sdof': ['sdof', 'natural harmonic', 'natural frequency'],
            'harmonic': ['sdof', 'natural harmonic', 'natural frequency'],
            'vibrations': ['sdof', 'natural harmonic', 'natural frequency'],
            'lmtd': ['lmtd', 'log mean'],
            'mach': ['mach', 'speed of sound'],
            'sound': ['mach', 'speed of sound'],
            'opamp': ['opamp', 'operational amplifier'],
            'amplifier': ['opamp', 'operational amplifier'],
            'darcy': ['darcy', 'weisbach'],
            'weisbach': ['darcy', 'weisbach'],
            'weisback': ['darcy', 'weisbach'],
            'rankine': ['rankine'],
            'otto': ['otto'],
            'firstlaw': ['first law of thermodynamics', 'first law'],
            'thermodynamics': ['first law of thermodynamics', 'first law'],
            'pressurevessel': ['thin-walled pressure vessel', 'pressure vessel'],
            'vessel': ['thin-walled pressure vessel', 'pressure vessel'],
            'vessels': ['thin-walled pressure vessel', 'pressure vessel'],
            'continuity': ['continuity equation', 'continuity'],
            'impulse': ['linear impulse and momentum', 'impulse'],
            'momentum': ['linear impulse and momentum', 'momentum'],
            'idealgas': ['ideal gas law', 'ideal gas'],
            'gas': ['ideal gas law', 'ideal gas'],
            'hydrostatic': ['hydrostatic pressure', 'hydrostatic'],
            'hydro': ['hydrostatic pressure', 'hydrostatic'],
            'compound': ['compound interest', 'compound amount factor', 'compound'],
            'interest': ['compound interest', 'compound amount factor', 'compound'],
            'centroid': ['centroid of composite', 'centroid'],
            'composite': ['centroid of composite', 'composite'],
            'maximumpower': ['maximum power', 'power transfer'],
            'power': ['maximum power', 'power transfer'],
            'kirchhoff': ['kirchhoff', 'kcl', 'kvl'],
            'kcl': ['kirchhoff', 'kcl'],
            'kvl': ['kirchhoff', 'kvl'],
            'rctransient': ['first-order rc', 'rc transient'],
            'rc': ['first-order rc', 'rc transient'],
            'rlc': ['series rlc', 'resonance and bandwidth'],
            'resonance': ['series rlc', 'resonance and bandwidth'],
            'bjt': ['bipolar junction transistor', 'bjt'],
            'transistor': ['bipolar junction transistor', 'bjt'],
            'laplace': ['laplace transform', 'final value theorem'],
            'finalvalue': ['laplace transform', 'final value theorem']
        };
        const searchTerms = keyMap[videoId] || [videoId];
        let targetIndex = theorems.findIndex(t => searchTerms.some(term => t.title.toLowerCase().includes(term)));
        if (targetIndex === -1) targetIndex = 0;

        renderDailyTheorem(false, targetIndex);

        // Auto-play the video for instant feedback
        setTimeout(() => {
            const videoEl = document.getElementById('daily-theorem-video');
            if (videoEl) {
                videoEl.currentTime = 0;
                const playPromise = videoEl.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.log('Video autoplay requires user interaction:', err);
                    });
                }
            }
        }, 150);
    }

    function init() {
        renderDailyQuote(false);
        renderDailyTheorem(false);

        // Apply saved layout
        const savedLayout = localStorage.getItem('enggtv_theorem_layout') || 'below';
        setTheoremLayout(savedLayout);

        const shuffleQuoteBtn = document.getElementById('btn-shuffle-quote');
        if (shuffleQuoteBtn) {
            shuffleQuoteBtn.onclick = () => renderDailyQuote(true);
        }

        const shuffleTheoremBtn = document.getElementById('btn-shuffle-theorem');
        if (shuffleTheoremBtn) {
            shuffleTheoremBtn.onclick = () => renderDailyTheorem(true);
        }
    }

    // Expose globally
    window.THEOREMS_BY_DISCIPLINE = THEOREMS_BY_DISCIPLINE;
    window.getActiveMotivationDiscipline = getActiveDiscipline;
    window.shuffleQuote = () => renderDailyQuote(true);
    window.shuffleTheorem = () => renderDailyTheorem(true);
    window.setTheoremLayout = setTheoremLayout;
    window.previewTheoremVideo = previewTheoremVideo;
    window.updateMotivationWidgets = () => {
        renderDailyQuote(false);
        renderDailyTheorem(false);
    };

    window.addEventListener('mathjax-ready', () => {
        const formulaEl = document.getElementById('daily-theorem-formula');
        const descEl = document.getElementById('daily-theorem-desc');
        const tipEl = document.getElementById('daily-theorem-tip');
        const titleEl = document.getElementById('daily-theorem-title');
        const mathElements = [formulaEl, descEl, tipEl, titleEl].filter(Boolean);
        if (window.safeTypesetMath) {
            window.safeTypesetMath(mathElements);
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            if (typeof window.MathJax.typesetClear === 'function') {
                window.MathJax.typesetClear(mathElements);
            }
            window.MathJax.typesetPromise(mathElements).catch(err => console.warn('MathJax render notice:', err));
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }
})();
