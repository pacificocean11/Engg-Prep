/**
 * FE THEOREM RAPID FLASHCARD STUDIO
 * Part of Engg.tv Prep — NCEES FE Exam Preparation Platform
 */
(function() {
    'use strict';

    let currentDeck = [];
    let currentIndex = 0;
    let isFlipped = true;
    let currentMode = 'recall'; // 'recall' or 'identify'
    let currentDiscipline = 'current';
    let currentSubjectFilter = 'all'; // 'all' or 1..14
    let activeMediaTab = 'video'; // 'video' or 'blueprint'

    const MECHANICAL_SUBJECTS = [
        { id: 1, name: '1. Mathematics' },
        { id: 2, name: '2. Probability & Statistics' },
        { id: 3, name: '3. Ethics & Professional Practice' },
        { id: 4, name: '4. Engineering Economics' },
        { id: 5, name: '5. Electricity & Magnetism' },
        { id: 6, name: '6. Statics' },
        { id: 7, name: '7. Dynamics & Vibrations' },
        { id: 8, name: '8. Mechanics of Materials' },
        { id: 9, name: '9. Material Properties & Processing' },
        { id: 10, name: '10. Fluid Mechanics' },
        { id: 11, name: '11. Thermodynamics' },
        { id: 12, name: '12. Heat Transfer' },
        { id: 13, name: '13. Measurements & Controls' },
        { id: 14, name: '14. Mechanical Design & Analysis' }
    ];

    function getMechanicalSubjectId(title, examTip) {
        const lower = (title || '').toLowerCase();
        // 1. Mathematics
        if (/distance formula|angle between two non-vertical|slope-intercept|conic section|types of parabolas|l’hôpital|gradient vector|chain rule for differentiation|product and quotient rules|integration by parts|taylor and maclaurin|taylor series|infinite series convergence|homogeneous vs non-homogeneous|order and degree of differential|second-order linear homogeneous ode|laplace transforms|laplace transform definition|matrix multiplication|inverse of a square matrix|inverse of a matrix|vector magnitude|vector dot product|vector cross product|properties of dot|properties of cross|length of a vector|curl of a vector|divergence of a vector|newton-raphson|newton's method for root|trapezoidal rule|simpson’s 1\/3 rule|simpson's rule|algorithm|flowchart|pseudocode|quadratic equation|complex numbers:|law of sines|double-angle|arithmetic vs geometric|volumes of basic shapes|coordinates of foci and equation of directrix|maxima and minima|partial derivatives|curvature of any curve|properties of identity matrix|complementary function and particular integral/i.test(lower)) return 1;
        // 2. Probability and Statistics
        if (/expected value and variance of a linear combination of variables|properties of normal distribution|when to use normal distribution|general character of probability|type i and type ii|binomial distribution|standard normal distribution|probability density function|cumulative distribution|sample variance|median of a sample|mode of a sample|variance and standard deviation|sample mean and standard error|confidence intervals|student’s \$t\$-confidence|expected values|simple linear regression|correlation coefficient and coefficient|permutations and combinations|null hypothesis|student's t-distribution two-sample|one-way analysis of variance|chi-square goodness|statistical process control|western electric|six sigma|bathtub failure|mean time between failures|parallel system reliability|standby redundancy/i.test(lower)) return 2;
        // 3. Ethics and Professional Practice
        if (/paramount duty|pe seal integrity|code of ethics|safety data sheet|signal words|flammability, lfl and ufl|confined space safety|noise pollution measurements|osha|hazard quotient|excess lifetime cancer|chronic daily intake|hierarchy of controls|nfpa 704|electrical safety: gfci|hazop study|lower and upper flammability|intellectual property: patents|conflicts of interest|whistleblowing|ergonomic posture assessment/i.test(lower)) return 3;
        // 4. Engineering Economics
        if (/compound interest|nominal vs\. effective annual|capitalized cost|straight-line depreciation|book value|macrs|bonds|benefit-cost|break-even production volume|internal rate of return|simple payback period|break-even analysis for make-or-buy|payback period:|sensitivity analysis|critical path method|economic order quantity|earned value management|predetermined motion time|kanban production|bill of materials|exponential smoothing|forecasting error|total productive maintenance/i.test(lower)) return 4;
        // 5. Electricity and Magnetism
        if (/ohm’s law and joule|poynting vector|kirchhoff|thevenin|wheatstone bridge|first-order rc transient|first-order rc circuit time|operational amplifier|ideal operational amplifier|instrumentation amplifier|schmitt trigger|equivalent resistance in series|series rlc resonance|equivalent capacitance and inductance|ac power triangle|three-phase induction motor|synchronous machine|dc shunt motor|ideal transformer|dc motor back-emf|specific resistance of a conductor/i.test(lower)) return 5;
        // 6. Statics
        if (/resolution of a force|lami's theorem|2d static equilibrium|moments \(couples\)|gravity retaining wall|free body diagram support|two-force and three-force|truss zero-force|method of joints|method of sections|parallel axis theorem \(second moment|centroid of composite|area moment of inertia|radius of gyration|product of inertia|centroid and moment of inertia for composite|centroids and area moments of inertia for standard shapes|coulomb dry friction|limiting friction/i.test(lower)) return 6;
        // 7. Dynamics, Kinematics, and Vibrations
        if (/variable acceleration rotational motion equations|constant acceleration rotational motion equations|instantaneous centers of various types of links|rotational motion|underdamped|critically damped|overdamped|coriolis|normal and tangential acceleration in curvilinear|rectilinear kinematics|constant acceleration motion|variable acceleration motion|relative motion|projectile motion|kinematics of particles: normal|uniform circular motion|kinetic friction|particle kinetics: direct|potential energy in many|kinetic energy|linear impulse and momentum|coefficient of restitution|instantaneous center of rotation|kennedy's rule|planar rigid body relative velocity|work-energy principle \(rigid body|rotational kinetic energy|mass moment of inertia of common|mass moment of inertia parallel axis|angular impulse and momentum|planar rigid body equations of motion|conservation of linear and angular momentum for colliding|sdof undamped natural frequency|damped sdof natural frequency|logarithmic decrement|vibration transmissibility/i.test(lower)) return 7;
        // 8. Mechanics of Materials
        if (/differential relationships between load, shear|mohr’s circle for plane stress|analytical in-plane principal stresses|generalized hooke’s law|isotropic elastic constants|elastic strain energy|cantilever sheet pile|triaxial shear|vertical stress increase beneath point loads|axial stress and elongation|poisson’s ratio|elastic flexure formula|elastic section modulus|beam flexure formula|torsion formula|polar moment of inertia|pure torsion of circular shafts|transverse shear stress in beams|maximum shear stress in rectangular cross-section|thermal expansion deformation and thermal stress|combined axial and bending|moment-area first theorem|moment-area second theorem|beam deflection differential|cantilever beam tip deflection|simply supported beam center deflection|euler’s critical buckling|slenderness ratio for steel|thin-walled pressure vessel|modulus of elasticity vs\. modulus of rigidity|transformation of composite section|theoretical effective-length factors/i.test(lower)) return 8;
        // 9. Material Properties and Processing
        if (/standard portland cement|bragg's law|engineering stress-strain vs|modulus of resilience vs|cubic crystal structures|binary eutectic phase diagram|iron-carbon microstructures|binary phase diagram lever rule|eutectic and eutectoid|gibbs phase rule|fick’s first law|fick's first law|first-order chemical reaction half-life|malleability and ductility|hardness of a material|charpy and izod|thermoplastics vs|peritectic vs|failure by creep|failure by fracture/i.test(lower)) return 9;
        // 10. Fluid Mechanics
        if (/newton's law of viscosity|newtonian vs non-newtonian|power-law|non-newtonian|surface tension|capillarity|capillary rise height|hydrostatic pressure distribution|manometers|bouyancy force|hydrostatic force on submerged curved|buoyancy and metacentric|hydrostatic center of pressure|archimedes’ principle|bernoulli’s principle|continuity equation|modified fluid energy equation|darcy-weisbach|reynolds number|hagen-poiseuille|moody, darcy|hydraulic diameter for non-circular|laminar flow friction factor|rapid sand filter|storm sewer gravity|hazen-williams|hardy cross|minor head losses in pipe|drag coefficient and lift|stokes' law|boundary layer displacement|speed of sound & mach|stagnation temperature|froude number and hydraulic|net positive suction head|pump hydraulic power|centrifugal pump cavitation|centrifugal pump affinity laws|pump specific speed|pitot tube|venturi meter|orifice meter|orifice discharging freely|orifice$|coagulation velocity gradient|camp-stein rapid mixing|viscosity of a fluid|impulse turbine vs/i.test(lower)) return 10;
        // 11. Thermodynamics
        if (/ideal gas law equation|van der waals|compressibility factor|properties for two-phase|mole fraction vs\. mass fraction|zeroth law of thermodynamics|mollier chart|clausius-clapeyron|first law of thermodynamics \(closed|steady-flow energy equation|enthalpy$|carnot thermal efficiency|entropy$|exergy|clausius inequality|entropy change of ideal gases|isothermal process|le chatelier’s principle|isentropic relations for ideal|polytropic process boundary|enthalpy definition and specific heat|ideal rankine cycle|ideal otto cycle|isentropic efficiencies of turbines|gas turbine regenerator|ideal diesel cycle|ideal brayton cycle|refrigeration cycles|coefficient of performance \(cop\)|cop of refrigeration vs|vapor-compression refrigeration|psychrometric humidity ratio|psychrometric chart|dry-bulb, wet-bulb|absolute humidity vs\.|hvac processes|indoor air quality single-compartment|combustion theoretical air|excess air and theoretical|intensive vs\. extensive|universal vs\. specific gas constant|combustion of methane|steam tables|superheated water/i.test(lower)) return 11;
        // 12. Heat Transfer
        if (/fourier’s law of thermal conduction|critical radius of thermal insulation|extended surface fin efficiency|conduction through a plain|conduction through a cylindrical|thermal resistance of an object|newton’s law of cooling|natural convection rayleigh|pool boiling curve|condensation heat transfer|stefan-boltzmann law|radiation view factor|radiation heat exchange|black body vs\. grey|net energy exchange by radiation|biot number for transient|lumped capacitance method|biot number vs\. fourier|log mean temperature difference|overall heat transfer coefficient|effectiveness-ntu method|heat exchanger fouling/i.test(lower)) return 12;
        // 13. Measurements, Instrumentation, and Controls
        if (/strain gauge gauge factor|temperature sensors: thermocouple|first-order sensor dynamic step|second-order sensor natural frequency|open-loop step response method|laplace transform final value|closed-loop feedback control|steady-state error constants|bode plot gain margin|routh-hurwitz stability|root locus construction|pid controller time-domain|process control: first-order|process control: ziegler-nichols|ratio control strategy|cascade control architecture|uncertainty/i.test(lower)) return 13;
        // 14. Mechanical Design and Analysis
        if (/modified goodman fatigue criterion|modified goodman fatigue failure|soderberg theory|s-n fatigue curve|maximum shear stress theory|distortion energy theory|maximum normal stress theory|coulomb-mohr and modified mohr|marin factors for fatigue|helical compression spring|equivalent spring stiffness for springs in parallel and series|rolling element bearing rated|equivalent dynamic radial load|power screws lifting torque|flat belt friction|agma lewis bending|asme transmission shaft|spur gear geometry|bolted joint preload|pressure relief valve sizing|types of fits|first angle vs\. third|geometric dimensioning and tolerancing|failure by fatigue/i.test(lower)) return 14;

        return 1;
    }

    const CIVIL_SUBJECTS = [
        { id: 1, name: '1. Mathematics & Statistics' },
        { id: 2, name: '2. Ethics & Professional Practice' },
        { id: 3, name: '3. Engineering Economics' },
        { id: 4, name: '4. Statics' },
        { id: 5, name: '5. Dynamics' },
        { id: 6, name: '6. Mechanics of Materials' },
        { id: 7, name: '7. Materials' },
        { id: 8, name: '8. Fluid Mechanics' },
        { id: 9, name: '9. Surveying' },
        { id: 10, name: '10. Water Resources & Environmental' },
        { id: 11, name: '11. Structural Engineering' },
        { id: 12, name: '12. Geotechnical Engineering' },
        { id: 13, name: '13. Transportation Engineering' },
        { id: 14, name: '14. Construction Engineering' }
    ];

    function getCivilSubjectId(title, examTip, description) {
        const lower = (title || '').toLowerCase();
        const tip = (examTip || '').toLowerCase();

        // Priority overrides
        if (/plastic section modulus and shape factor/i.test(lower)) return 11;
        if (/total float and free float in activity networks|bill of materials explosion tree/i.test(lower)) return 14;
        if (/mass haul diagram|first angle vs\. third angle/i.test(lower)) return 14;
        if (/osha soil classifications|construction equipment fleet productivity|osha permissible noise/i.test(lower)) return 14;
        if (/lrfd load combinations|wind load design velocity pressure/i.test(lower)) return 11;
        if (/standard portland cement types|binary phase diagram lever rule|concrete maturity method|hardness of a material/i.test(lower)) return 7;
        if (/type iii zone settling|solution concentration: molarity/i.test(lower)) return 10;
        if (/modified goodman fatigue|strain gauge gauge factor|distortion energy theory|coulomb-mohr and modified mohr failure criteria/i.test(lower)) return 6;
        if (/hierarchy of controls|nfpa 704|hazop study/i.test(lower)) return 2;
        if (/pressure relief valve sizing/i.test(lower)) return 8;
        if (/kanban production system/i.test(lower)) return 3;
        if (/permutations and combinations|bathtub failure curve|exponential smoothing forecasting|forecasting error metrics/i.test(lower)) return 1;
        if (/integration by parts|calculus|derivative|integral|limit|chain rule|taylor|l’hôpital|homogeneous vs non-homogeneous|order and degree of differential|newton-raphson|trapezoidal rule|simpson’s 1\/3 rule|laplace transforms|newton's method for root|simpson's rule|infinite series convergence/i.test(lower)) return 1;
        if (/equivalent capacitance and inductance|ohm’s law|kirchhoff|circuit analysis/i.test(lower) || /circuit/i.test(tip)) return 1;

        // 12. Geotechnical Engineering
        if (/terzaghi|darcy’s law for hydraulic seepage|hydraulic conductivity|effective stress|boussinesq|consolidation|settlement|bearing capacity|rankine|coulomb.*earth pressure|mohr-coulomb.*soil|quick condition|soil boiling|atterberg|plasticity index|void ratio|porosity|proctor|retaining wall|slope stability|flow net|seepage|active lateral|passive lateral|earth pressure|foundation|pile|footing|unconfined compression.*soil|triaxial.*test|cyclic stress ratio|liquefaction|group index|aashto soil classification/i.test(lower) ||
            /geotechnical|foundation engineering|soil mechanics/i.test(tip)) return 12;

        // 14. Construction Engineering
        if (/critical path method|cpm|float equation|earliest start|latest finish|earned value management|cost variance and schedule|project delivery|construction safety|excavation safety|trench|earthwork.*haul|mass haul/i.test(lower) || 
            /construction|project management|project controls/i.test(tip)) return 14;

        // 13. Transportation Engineering
        if (/traffic|highway|stopping sight distance|sight distance|crest vertical|sag vertical|horizontal curve|horizontal circular curve|superelevation|greenshields|pavement|esal|structural number|peak hour factor|level of service|trip generation|vertical curvature \(\$k\$-value\)|conflict points/i.test(lower) ||
            /transportation|highway design/i.test(tip)) return 13;

        // 9. Surveying
        if (/surveying|traverse|leveling|benchmark|azimuth|compass rule|bowditch|curvature and refraction|stadia|prismoidal|end area/i.test(lower) ||
            /(?<!bearing\s)bearing/i.test(lower) ||
            /surveying/i.test(tip)) return 9;

        // 10. Water Resources & Environmental Engineering
        if (/manning|open channel|hazen-williams|rational method|storm runoff|aquifer|dupuit|weir|froude|specific energy|hydraulic jump|hydrology|water treatment|wastewater|bod|biochemical oxygen demand|streeter-phelps|chlorination|coagulation|flocculation|sedimentation basin|filtration|detention basin|runoff|flood|groundwater|well|shields diagram/i.test(lower) ||
            /hydraulics|hydrology|water resources|environmental/i.test(tip)) return 10;

        // 11. Structural Engineering
        if (/whitney rectangular|plastic moment capacity of structural steel|aci 318|aisc|structural steel|reinforced concrete|concrete beam|flexural reinforcement|shear stirrup|punching shear|development length|short column.*aci|cracking moment|prestress|influence line|müller-breslau|moment distribution|hardy cross|degree of static indeterminacy|virtual work.*beam|castigliano.*truss|temperature and fabrication deflections in trusses|seismic base shear|equivalent lateral force|theoretical effective-length factors/i.test(lower) ||
            /reinforced concrete|concrete design|steel design|structural analysis|prestressed concrete/i.test(tip)) return 11;

        // 7. Materials
        if (/concrete.*mix|asphalt|aggregate|superpave|marshall|curing|fineness modulus|air entrainment|slump test|compressive strength of concrete|wood design|timber|modulus of elasticity of structural concrete|concrete maturity method|malleability and ductility|charpy and izod|hardness of a material/i.test(lower) ||
            /material properties|concrete technology/i.test(tip)) return 7;

        // 6. Mechanics of Materials
        if (/flexure formula|torsion formula|shear stress|transverse shear|jourawski|thin-walled.*tube|bredt|shear center|stress and elongation|axial stress|poisson’s ratio|thermal expansion.*stress|mohr’s circle|beam deflection|cantilever beam tip deflection|simply supported beam center|elastic section modulus|elastic strain energy|principal stresses|combined axial and bending|hooke’s law|pressure vessel|torsion of circular shafts|maximum shear stress in rectangular|euler’s critical buckling|modulus of elasticity vs\. modulus of rigidity|failure by fatigue|failure by fracture|transformation of composite section/i.test(lower) ||
            /mechanics of materials/i.test(tip)) return 6;

        // 8. Fluid Mechanics
        if (/bernoulli|darcy-weisbach|reynolds number|continuity equation|viscosity|surface tension|capillarity|buoyancy|archimedes|hydrostatic pressure|center of pressure|manometer|pitot tube|venturi|orifice|impulse turbine vs|universal vs\. specific gas constant/i.test(lower) ||
            /fluid mechanics/i.test(tip)) return 8;

        // 4. Statics
        if (/concurrent forces|lami's theorem|moments \(couples\)|2d static equilibrium|free body diagram|support reaction|two-force|three-force|truss zero-force|method of joints|method of sections|parallel axis theorem|centroid of composite|area moment of inertia|radius of gyration|product of inertia|static friction|coulomb dry friction/i.test(lower) ||
            /statics/i.test(tip)) return 4;

        // 5. Dynamics
        if (/kinematics|constant acceleration|relative motion|curvilinear|normal and tangential|uniform circular|instantaneous center|particle kinetics|equations of motion|mass moment of inertia|linear impulse|angular impulse|momentum|restitution|work-energy|kinetic energy|potential energy|vibration|frequency|damping/i.test(lower) ||
            /dynamics/i.test(tip)) return 5;

        // 3. Engineering Economics
        if (/compound interest|nominal vs\. effective|straight-line depreciation|macrs|book value|benefit-cost|break-even|internal rate of return|simple payback|capitalized cost|bonds|sensitivity analysis/i.test(lower) ||
            /engineering economics|economics/i.test(tip)) return 3;

        // 2. Ethics & Professional Practice
        if (/ethics|code of ethics|public welfare|pe seal|licensure|conflict of interest|whistleblowing|liability|contract law/i.test(lower) ||
            /ethics|professional practice/i.test(tip)) return 2;

        // 1. Mathematics & Statistics
        if (/confidence interval|sample mean|variance|standard deviation|normal distribution|binomial|regression|curve fitting|hypothesis|anova|chi-square/i.test(lower) || /statistics/i.test(tip)) return 1;
        if (/vector|matrix|linear algebra|determinant|dot product|cross product/i.test(lower)) return 1;
        if (/calculus|derivative|integral|limit|chain rule|taylor|l’hôpital/i.test(lower)) return 1;

        return 1;
    }

    const OTHER_SUBJECTS = [
        { id: 1, name: '1. Mathematics' },
        { id: 2, name: '2. Probability & Statistics' },
        { id: 3, name: '3. Chemistry' },
        { id: 4, name: '4. Instrumentation & Controls' },
        { id: 5, name: '5. Ethics & Societal Impacts' },
        { id: 6, name: '6. Safety, Health & Environment' },
        { id: 7, name: '7. Engineering Economics' },
        { id: 8, name: '8. Statics' },
        { id: 9, name: '9. Dynamics' },
        { id: 10, name: '10. Strength of Materials' },
        { id: 11, name: '11. Materials' },
        { id: 12, name: '12. Fluid Mechanics' },
        { id: 13, name: '13. Basic Electrical Engineering' },
        { id: 14, name: '14. Thermodynamics & Heat Transfer' }
    ];

    function getOtherSubjectId(title, examTip, description) {
        const lower = (title || '').toLowerCase();
        const tip = (examTip || '').toLowerCase();

        // Priority overrides
        if (/mohr/i.test(lower)) return 10;
        if (/magnetic force on a straight current/i.test(lower)) return 13;
        if (/rectifier with filter capacitor ripple voltage/i.test(lower)) return 13;
        if (/bjt|mosfet|transconductance|cmos inverter/i.test(lower)) return 4;
        if (/critical path method/i.test(lower)) return 7;
        if (/fick’s first law|fick's first law/i.test(lower)) return 11;
        if (/mollier chart/i.test(lower)) return 14;
        if (/refrigeration cycles/i.test(lower)) return 14;

        // 1. Mathematics
        if (/distance formula|angle between two non-vertical|slope-intercept|conic section|types of parabolas|parabola|ellipse|hyperbola|circle|trigonometr|law of sines|law of cosines|double-angle|complex number|algebra|arithmetic vs geometric progression|quadratic equation|polar coordinates|homogeneous vs non-homogeneous|order and degree of differential|second-order linear homogeneous ode|differential equation|first-order linear ode|laplace transforms|laplace transform definition|newton-raphson|newton's method for root|trapezoidal rule|simpson’s 1\/3 rule|simpson's rule|numerical integration|algorithm|flowchart|pseudocode|precision limits|matrix|linear algebra|eigenvalue|determinant|vector magnitude|vector dot product|vector cross product|properties of dot|properties of cross|length of a vector|curl of a vector|divergence of a vector|gradient vector|green’s theorem|divergence theorem|stokes’ theorem|l’hôpital|chain rule for differentiation|product and quotient rules|integration by parts|taylor and maclaurin|taylor series|infinite series convergence/i.test(lower) && !/beam deflection|force|stress|strain|truss/i.test(lower)) return 1;

        // 2. Probability and Statistics
        if (/confidence interval|student’s \$t\$-confidence|sample mean and standard error|expected value|sample variance|variance and standard deviation|median of a sample|mode of a sample|central tendenc|dispersion|binomial distribution|standard normal distribution|normal distribution|probability density function|cumulative distribution|student's t-distribution two-sample|one-way analysis of variance|anova|chi-square|null hypothesis|permutations and combinations|bathtub failure curve|simple linear regression|correlation coefficient|least squares|goodness of fit|curve fitting|forecasting error metrics/i.test(lower)) return 2;

        // 3. Chemistry
        if (/galvanic cell|nernst equation|faraday’s law of electrolysis|oxidation|reduction|redox|molarity, molality|solution concentration|ph scale|acids? and bases?|buffer|periodic table|chemical equilibrium constant|chemical compatibility|first-order chemical reaction half-life|photosynthesis|alcohols|aldehydes and ketones|alkanes, alkenes, alkynes|ethers, carboxylic/i.test(lower)) return 3;

        // 4. Instrumentation and Controls
        if (/strain gauge gauge factor|first-order sensor dynamic step|second-order sensor natural frequency|temperature sensors: thermocouple|thermocouple seebeck|operational amplifier|op-amp|instrumentation amplifier|schmitt trigger|nyquist-shannon|flip-flop|multiplexers and demultiplexers|two's complement|half-adder and full-adder|binary ripple carry|static cmos inverter|closed-loop feedback control|steady-state error constants|bode plot gain margin/i.test(lower)) return 4;

        // 5. Engineering Ethics and Societal Impacts
        if (/paramount duty to public welfare|code of ethics|pe seal integrity|conflicts of interest|whistleblowing|intellectual property: patents|ergonomic posture/i.test(lower)) return 5;

        // 6. Safety, Health, and Environment
        if (/carcinogens|dose-response|chronic daily intake|excess lifetime cancer|exposure limits|hazard quotient|pressure relief valve sizing|flammability, lfl and ufl|lower and upper flammability|electrical safety: gfci|confined space safety|safety data sheet|signal words|noise pollution|nfpa 704|osha recordable|osha permissible noise|hazop study|osha soil classifications|osha excavation safety/i.test(lower)) return 6;

        // 7. Engineering Economics
        if (/compound interest|nominal vs\. effective annual|effective annual|straight-line depreciation|macrs|book value|benefit-cost|break-even|internal rate of return|simple payback|capitalized cost|bonds|sensitivity analysis|economic order quantity|earned value management|kanban production|bill of materials|exponential smoothing|hierarchy of controls/i.test(lower) || /economics|industrial/i.test(tip)) return 7;

        // 8. Statics
        if (/resolution of a force|concurrent forces|lami's theorem|moments \(couples\)|2d static equilibrium|free body diagram support|two-force and three-force|truss zero-force|method of joints|method of sections|gravity retaining wall|parallel axis theorem|centroid of composite|area moment of inertia|radius of gyration|product of inertia|centroids and area moments|coulomb dry friction|angle of static friction|flat belt friction|power screws lifting|weight and mass/i.test(lower) || /statics/i.test(tip)) return 8;

        // 9. Dynamics
        if (/rectilinear kinematics|constant acceleration motion|relative motion|normal and tangential acceleration|uniform circular motion|instantaneous center of rotation|kennedy's rule|planar rigid body relative velocity|particle kinetics: direct|kinetic friction|planar rigid body equations of motion|newton’s second law for rigid|mass moment of inertia|linear impulse and momentum|angular impulse and momentum|coefficient of restitution|conservation of linear and angular momentum|work-energy principle|kinetic energy|rotational kinetic energy|dynamic friction|sdof undamped natural frequency|damped sdof natural frequency|logarithmic decrement|vibration transmissibility|vibration/i.test(lower) || (/\bdynamics\b/i.test(tip) && !/thermodynamics/i.test(tip))) return 9;

        // 10. Strength of Materials
        if (/differential relationships between load, shear|axial stress and elongation|poisson’s ratio|elastic flexure formula|beam flexure formula|torsion formula|polar moment of inertia|pure torsion of circular shafts|transverse shear stress in beams|maximum shear stress in rectangular|thermal expansion deformation and thermal stress|elastic section modulus|helical compression spring|agma lewis bending|combined axial and bending|beam deflection differential|cantilever beam tip deflection|simply supported beam center deflection|moment-area first theorem|moment-area second theorem|elastic strain energy|analytical in-plane principal stresses|maximum shear stress theory|distortion energy theory|maximum normal stress theory|coulomb-mohr and modified mohr|euler’s critical buckling|slenderness ratio for steel|thin-walled pressure vessel|modified goodman|soderberg|s-n fatigue curve|marin factor|rolling element bearing|cantilever sheet pile|modulus of elasticity vs\. modulus of rigidity|transformation of composite section|theoretical effective-length factors|failure by fatigue/i.test(lower) || (/mechanics of materials|mechanical design/i.test(tip) && !/hardness of a material|failure by creep|failure by fracture/i.test(lower))) return 10;

        // 11. Materials
        if (/binary eutectic phase diagram|iron-carbon microstructures|binary phase diagram lever rule|engineering stress-strain vs|modulus of resilience vs|factor of safety definition|cubic crystal structures|types of fits|first angle vs\. third angle|malleability and ductility|charpy and izod|hardness of a material|thermoplastics vs|peritectic vs|failure by creep|failure by fracture/i.test(lower) || /material/i.test(tip)) return 11;

        // 12. Fluid Mechanics
        if (/newton's law of viscosity|power-law|non-newtonian|surface tension|capillarity|capillary rise height|drag coefficient and lift|reynolds number|speed of sound & mach|hydrostatic pressure distribution|buoyancy and metacentric|hydrostatic center of pressure|archimedes’ principle|bernoulli’s principle|continuity equation|linear impulse-momentum for fluid|modified fluid energy equation|darcy-weisbach|hydraulic diameter for non-circular|laminar flow friction factor|minor head losses in pipe|manning’s equation|pitot tube|venturi meter|orifice meter|orifice discharging freely|net positive suction head|pump hydraulic power|centrifugal pump affinity laws|pump specific speed|viscosity of a fluid|impulse turbine vs/i.test(lower) || (/fluid/i.test(tip) && !/universal vs\. specific gas constant/i.test(lower))) return 12;

        // 13. Basic Electrical Engineering
        if (/ohm’s law and joule|kirchhoff|first-order rc transient|equivalent resistance in series|series rlc resonance|equivalent capacitance and inductance|ac power triangle|wheatstone bridge|thevenin’s equivalent|norton’s equivalent|norton's equivalent|norton|poynting vector|ideal transformer|three-phase induction motor|dc motor back-emf|specific resistance of a conductor/i.test(lower) || /electrical/i.test(tip)) return 13;

        // 14. Thermodynamics and Heat Transfer
        if (/zeroth law of thermodynamics|first law of thermodynamics \(closed|second law of thermodynamics \(carnot|ideal gas law equation|van der waals|compressibility factor|mole fraction vs\. mass fraction|isothermal process|steady-flow energy equation|ideal rankine cycle|ideal otto cycle|coefficient of performance \(cop\)|fourier’s law of thermal conduction|critical radius of thermal insulation|newton’s law of cooling|stefan-boltzmann law|biot number vs\. fourier|log mean temperature difference|overall heat transfer coefficient|effectiveness-ntu method|conduction through a plain|conduction through a cylindrical|thermal resistance of an object|pool boiling curve|condensation heat transfer|dry-bulb, wet-bulb|absolute humidity vs\.|psychrometric chart|hvac processes|combustion theoretical air|excess air and theoretical|intensive vs\. extensive|universal vs\. specific gas constant|combustion of methane|steam tables|superheated water/i.test(lower) || /thermodynamics|heat transfer/i.test(tip)) return 14;

        return 1;
    }



// Universal Discipline Definitions and Classifier Functions for ENGG.tv FE Flashcards

const ELECTRICAL_SUBJECTS = [
    { id: 1, name: '1. Mathematics' },
    { id: 2, name: '2. Probability & Statistics' },
    { id: 3, name: '3. Ethics & Professional Practice' },
    { id: 4, name: '4. Engineering Economics' },
    { id: 5, name: '5. Properties of Electrical Materials' },
    { id: 6, name: '6. Circuit Analysis' },
    { id: 7, name: '7. Linear Systems' },
    { id: 8, name: '8. Signal Processing' },
    { id: 9, name: '9. Electronics' },
    { id: 10, name: '10. Power Systems' },
    { id: 11, name: '11. Electromagnetics' },
    { id: 12, name: '12. Control Systems' },
    { id: 13, name: '13. Communications' },
    { id: 14, name: '14. Computer Networks' },
    { id: 15, name: '15. Digital Systems' },
    { id: 16, name: '16. Computer Systems' },
    { id: 17, name: '17. Software Engineering' }
];

function getElectricalSubjectId(title, examTip, description) {
    const lower = (title || '').toLowerCase();
    const tip = (examTip || '').toLowerCase();

    // Specific overrides
    if (/dirac delta impulse and unit step integration/i.test(lower)) return 7;
    if (/laplace transform time delay property/i.test(lower)) return 7;
    if (/second-order control system step response overshoot/i.test(lower)) return 12;
    if (/biot-savart law for magnetic fields/i.test(lower)) return 11;
    if (/energy stored in inductors and magnetic field density/i.test(lower)) return 11;
    if (/parallel-plate capacitor capacitance and energy density/i.test(lower)) return 11;
    if (/inductive and capacitive reactance and susceptance/i.test(lower)) return 6;
    if (/full-wave bridge rectifier with filter capacitor ripple voltage/i.test(lower)) return 9;

    // 17. Software Engineering
    if (/software engineering|data structures|algorithms/i.test(tip) ||
        /big-o|sorting algorithm|binary search tree|stack and queue|hash table|object-oriented|breadth-first|depth-first|dijkstra|linked list|software development life cycle/i.test(lower)) {
        return 17;
    }

    // 16. Computer Systems
    if (/computer systems|computer architecture|microprocessors|processor design|memory architecture|operating systems|parallel computing|embedded systems/i.test(tip) ||
        /cache memory|hit ratio|pipeline|instruction set|von neumann|harvard architecture|microcontroller|assembly language|interrupt vector|virtual memory|page fault|little-endian|direct memory access|alu /i.test(lower)) {
        return 16;
    }

    // 15. Digital Systems
    if (/digital systems|sequential logic|arithmetic circuits|digital ics/i.test(tip) ||
        /karnaugh map|k-map|de morgan|boolean algebra|multiplexer|demultiplexer|decoder|priority encoder|flip-flop|jk flip-flop|d flip-flop|sr latch|finite state machine|mealy|moore|setup and hold time|clock skew|propagation delay.*logic|two’s complement|full adder|ripple carry/i.test(lower)) {
        return 15;
    }

    // 14. Computer Networks
    if (/computer networks/i.test(tip) ||
        /osi model|tcp\/ip|csma\/cd|ethernet|ip addressing|subnet mask|cidr|routing table|distance-vector|link-state|transport layer|flow control|sliding window|network security|firewall/i.test(lower)) {
        return 14;
    }

    // 13. Communications
    if (/communications/i.test(tip) ||
        /shannon-hartley|channel capacity|amplitude modulation|frequency modulation|phase modulation|am modulation index|frequency deviation|fsk|psk|qam|signal-to-noise|noise figure|friis transmission|multiplexing|tdm|fdm/i.test(lower)) {
        return 13;
    }

    // 12. Control Systems
    if (/control systems|controls|controls: dynamic|controls: frequency/i.test(tip) ||
        /routh-hurwitz|bode plot|gain margin|phase margin|nyquist stability|root locus|state-space|pid controller|lead-lag compensator|steady-state error|system type number|second-order control system step response overshoot|closed-loop transfer function|block diagram reduction/i.test(lower)) {
        return 12;
    }

    // 11. Electromagnetics
    if (/electromagnetics/i.test(tip) ||
        /maxwell’s equations|gauss’s law|biot-savart|ampere’s circuital|faraday’s law of induction|lorenz force|poynting vector|skin depth|characteristic impedance.*transmission line|standing wave ratio|vswr|reflection coefficient|smith chart|parallel-plate capacitor capacitance and energy density|energy stored in inductors and magnetic field density|coulomb’s law|electric dipole/i.test(lower)) {
        return 11;
    }

    // 10. Power Systems
    if (/power systems|power engineering|ac power systems|power:|rotating machines|transformers/i.test(tip) ||
        /power factor correction|synchronous generator|synchronous motor|three-phase induction motor|slip.*induction|per-unit system|symmetrical components|positive sequence|zero sequence|transmission line regulation|complex power|apparent power|transformer turns ratio|short-circuit ratio|dc shunt motor|torque-speed characteristic/i.test(lower)) {
        return 10;
    }

    // 9. Electronics
    if (/electronics|semiconductor electronics|active filters|power supplies|operational amplifiers|bjts|mosfets/i.test(tip) ||
        /operational amplifier|op-amp|inverting op-amp|non-inverting op-amp|summing amplifier|instrumentation amplifier|bjt|bipolar junction|mosfet|threshold voltage|drain current|small-signal hybrid-pi|zener diode|full-wave bridge rectifier|half-wave rectifier|ripple voltage|pn junction diode equation|clamping circuit|clipper circuit|class a amplifier|class b amplifier|cmos inverter/i.test(lower)) {
        return 9;
    }

    // 8. Signal Processing
    if (/signal processing|digital signal processing/i.test(tip) ||
        /nyquist-shannon sampling|aliasing|discrete fourier transform|fast fourier transform|dft|fft|z-transform|region of convergence|bilinear transform|convolution integral|continuous-time fourier transform|impulse response|finite impulse response|fir filter|iir filter/i.test(lower)) {
        return 8;
    }

    // 7. Linear Systems
    if (/linear systems|signals and systems/i.test(tip) ||
        /transfer function|poles and zeros|impulse response and step response|dirac delta impulse and unit step integration|laplace transform time delay property|state-transition matrix|convolution sum|frequency response function/i.test(lower)) {
        return 7;
    }

    // 6. Circuit Analysis
    if (/circuit analysis|electrical circuits|transient circuit|ac circuits|circuit transients/i.test(tip) ||
        /thevenin|norton|kirchhoff|kcl|kvl|maximum power transfer|superposition|mesh current|node voltage|first-order rc|first-order rl|series rlc resonance|parallel rlc|quality factor.*resonance|resonant frequency|inductive and capacitive reactance and susceptance|balanced three-phase|delta-wye|wye-delta|two-port network|impedance parameters|admittance parameters|joule heating/i.test(lower)) {
        return 6;
    }

    // 5. Properties of Electrical Materials
    if (/properties of electrical materials|materials|semiconductor physics/i.test(tip) ||
        /intrinsic semiconductor|carrier concentration|band gap|dielectric constant|dielectric breakdown|permittivity|permeability|resistivity and conductivity|temperature coefficient of resistance|fermi level|drift velocity|hall effect|specific resistance of a conductor/i.test(lower)) {
        return 5;
    }

    // 4. Engineering Economics
    if (/engineering economics|economics/i.test(tip) ||
        /present worth|future worth|capital recovery|uniform series|benefit-cost|internal rate of return|depreciation|macrs|straight-line depreciation|annual worth/i.test(lower)) {
        return 4;
    }

    // 3. Ethics and Professional Practice
    if (/ethics/i.test(tip) ||
        /code of ethics|public health|safety.*welfare|licensure|conflict of interest|whistleblowing|contract/i.test(lower)) {
        return 3;
    }

    // 2. Probability and Statistics
    if (/probability|statistics/i.test(tip) ||
        /central limit|bayes’ theorem|binomial distribution|poisson distribution|normal distribution|standard normal|confidence interval|hypothesis test|linear regression|expected value|variance|standard deviation/i.test(lower)) {
        return 2;
    }

    // 1. Mathematics
    return 1;
}

const CHEMICAL_SUBJECTS = [
    { id: 1, name: '1. Mathematics' },
    { id: 2, name: '2. Probability & Statistics' },
    { id: 3, name: '3. Engineering Sciences' },
    { id: 4, name: '4. Materials Science' },
    { id: 5, name: '5. Chemistry and Biology' },
    { id: 6, name: '6. Fluid Mechanics/Dynamics' },
    { id: 7, name: '7. Thermodynamics' },
    { id: 8, name: '8. Material/Energy Balances' },
    { id: 9, name: '9. Heat Transfer' },
    { id: 10, name: '10. Mass Transfer and Separation' },
    { id: 11, name: '11. Solids Handling' },
    { id: 12, name: '12. Chemical Reaction Engineering' },
    { id: 13, name: '13. Economics' },
    { id: 14, name: '14. Process Design' },
    { id: 15, name: '15. Process Control' },
    { id: 16, name: '16. Safety, Health, and Environment' }
];

function getChemicalSubjectId(title, examTip, description) {
    const lower = (title || '').toLowerCase();
    const tip = (examTip || '').toLowerCase();

    // 16. Safety, Health, and Environment
    if (/pressure relief valve sizing|hazop|flammability limits|lower and upper flammability|threshold limit value|toxic vapor dispersion|nfpa 704|hierarchy of controls|osha|safety/i.test(lower) || /process safety|safety/i.test(tip)) {
        return 16;
    }

    // 15. Process Control
    if (/process control|process dynamics|pid controller|bode plot|routh-hurwitz|nyquist|closed-loop|feedback control|control valve/i.test(tip) ||
        /transfer function|first-order process|time constant and dead time|pid tuning|ziegler-nichols|control valve sizing/i.test(lower)) {
        return 15;
    }

    // 14. Process Design
    if (/process design|chemical plant design|pinch analysis|composite curve|process flow diagram|piping and instrumentation diagram|p&id|utility heat exchanger network/i.test(tip) ||
        /pinch analysis|heat exchanger network|minimum hot and cold utility|steam economy in multiple-effect|packed tower flooding velocity|six-tenths rule of cost sizing/i.test(lower)) {
        return 14;
    }

    // 13. Economics
    if (/engineering economics|economics|cost estimation|profitability|depreciation|macrs|payback period|internal rate of return|net present value|bare module cost|cepci/i.test(tip) ||
        /capital cost|cepci|guthrie bare module|present worth|future worth|break-even|depreciation|benefit-cost/i.test(lower)) {
        return 13;
    }

    // 12. Chemical Reaction Engineering
    if (/reaction engineering|kinetics|cstr|pfr|plug flow|batch reactor|arrhenius|activation energy|michaelis-menten|catalyst|effectiveness factor|thiele modulus|levenspiel/i.test(tip) ||
        /arrhenius|activation energy|cstr|pfr|plug flow reactor|continuous stirred-tank|batch reactor space time|damköhler number|reaction order|rate law|catalytic effectiveness|thiele modulus|levenspiel plot/i.test(lower)) {
        return 12;
    }

    // 11. Solids Handling
    if (/solids handling|particle|filtration|settling|cyclone|elutriation|fluidization|ergun|packed bed|pneumatic conveying/i.test(tip) ||
        /ergun equation|minimum fluidization velocity|terminal settling velocity|stokes’ law for particle|cake filtration equation|rotary drum filter|sieve analysis|particle size distribution/i.test(lower)) {
        return 11;
    }

    // 10. Mass Transfer and Separation
    if (/mass transfer|separations|distillation|absorption|stripping|mccabe-thiele|fick’s|diffusion|extraction|membrane|adsorption isotherm|freundlich|langmuir/i.test(tip) ||
        /fick’s first law|fick’s second law|equimolar counterdiffusion|mccabe-thiele|relative volatility|minimum reflux ratio|underwood equation|fenske equation|absorption factor|kremser equation|height of a transfer unit|number of transfer units|htu|ntu|liquid-liquid extraction|tie line|lever rule.*extraction|langmuir|freundlich/i.test(lower)) {
        return 10;
    }

    // 9. Heat Transfer
    if (/heat transfer|conduction|convection|radiation|heat exchanger|lmtd|ntu|fourier’s law|nusselt|prandtl|stefan-boltzmann|boiling/i.test(tip) ||
        /fourier’s law of heat conduction|newton’s law of cooling|overall heat transfer coefficient|log mean temperature difference|lmtd|effectiveness-ntu|stefan-boltzmann|view factor|radiation heat transfer|fouling factor|critical radius of insulation|nucleate pool boiling|critical heat flux/i.test(lower)) {
        return 9;
    }

    // 8. Material/Energy Balances
    if (/material and energy balances|material balances|energy balances|recycle|purge|bypass|stoichiometric combustion|excess air/i.test(tip) ||
        /material balance|mass balance|recycle ratio|purge ratio|bypass stream|extent of reaction|atomic species balance|steady-state energy balance|heat of reaction|hess’s law|latent heat of vaporization|single-pass conversion|combustion of methane/i.test(lower)) {
        return 8;
    }

    // 7. Thermodynamics
    if (/thermodynamics|chemical thermodynamics|phase equilibrium|vle|raoult’s|henry’s|antoine|clausius-clapeyron|fugacity|activity coefficient|van der waals|peng-robinson|virial|carnot/i.test(tip) ||
        /raoult’s law|henry’s law|antoine equation|clausius-clapeyron|van der waals equation|redlich-kwong|compressibility factor|gibbs free energy|chemical potential|joule-thomson|carnot efficiency|rankine cycle|refrigeration cycle|fugacity coefficient|activity coefficient|intensive vs\. extensive|universal vs\. specific gas constant|steam tables|superheated water/i.test(lower)) {
        return 7;
    }

    // 6. Fluid Mechanics/Dynamics
    if (/fluid mechanics|transport phenomena|fluid dynamics|pumps|friction factor|darcy-weisbach|bernoulli|hagen-poiseuille/i.test(tip) ||
        /hagen-poiseuille|bernoulli equation|darcy-weisbach|moody diagram|reynolds number|pump npsh|net positive suction head|system head curve|orifice plate|venturi meter|rotameter|drag coefficient|manometer|fluid statics|choked mass flow|viscosity of a fluid/i.test(lower)) {
        return 6;
    }

    // 5. Chemistry and Biology
    if (/chemistry|biology|bioprocessing|organic chemistry|physical chemistry/i.test(tip) ||
        /le chatelier|equilibrium constant|ph and poh|henderson-hasselbalch|buffer solution|solubility product|ksp|galvanic cell|nernst equation|faraday’s law of electrolysis|organic functional groups|sn1 and sn2|enzyme kinetics|monod cell growth|photosynthesis/i.test(lower)) {
        return 5;
    }

    // 4. Materials Science
    if (/materials science|materials|corrosion/i.test(tip) ||
        /lever rule|binary phase diagram|bragg’s law|miller indices|eutectic|yield strength|ultimate tensile|hooke’s law.*materials|tarnishing|galvanic corrosion|crevice corrosion|malleability and ductility|failure by creep|thermoplastics vs|peritectic vs/i.test(lower)) {
        return 4;
    }

    // 3. Engineering Sciences
    if (/engineering sciences|statics|dynamics|mechanics of materials|circuits|electricity/i.test(tip) ||
        /free body diagram|concurrent forces|method of joints|moment of inertia|projectile motion|work-energy|torsion formula|flexure formula|axial stress|shear stress|ohm’s law|kirchhoff/i.test(lower)) {
        return 3;
    }

    // 2. Probability and Statistics
    if (/probability|statistics/i.test(tip) ||
        /central limit|bayes’ theorem|binomial|poisson|normal distribution|hypothesis testing|student’s t-test|confidence interval|linear regression/i.test(lower)) {
        return 2;
    }

    // 1. Mathematics
    return 1;
}

const ENVIRONMENTAL_SUBJECTS = [
    { id: 1, name: '1. Mathematics' },
    { id: 2, name: '2. Probability & Statistics' },
    { id: 3, name: '3. Ethics & Professional Practice' },
    { id: 4, name: '4. Engineering Economics' },
    { id: 5, name: '5. Materials Science' },
    { id: 6, name: '6. Environmental Science and Chemistry' },
    { id: 7, name: '7. Thermodynamics and Phase Equilibrium' },
    { id: 8, name: '8. Fluid Mechanics' },
    { id: 9, name: '9. Water Resources' },
    { id: 10, name: '10. Water and Wastewater Engineering' },
    { id: 11, name: '11. Air Quality and Control' },
    { id: 12, name: '12. Solid and Hazardous Waste' },
    { id: 13, name: '13. Groundwater and Soils' },
    { id: 14, name: '14. Environmental Health and Safety' }
];

function getEnvironmentalSubjectId(title, examTip, description) {
    const lower = (title || '').toLowerCase();
    const tip = (examTip || '').toLowerCase();

    // 14. Environmental Health and Safety
    if (/environmental health|industrial hygiene|radiation protection|toxicology|noise|osha/i.test(tip) ||
        /sound pressure level|decibel addition|noise reduction coefficient|dosimetry|dose-response|ld50|carcinogenic risk|hazard index|hazard quotient|reference dose|radiation half-life|absorbed dose|sievert|gray|rad|rem|osha permissible exposure|time-weighted average twa/i.test(lower)) {
        return 14;
    }

    // 13. Groundwater and Soils
    if (/hydrogeology|groundwater|subsurface|soil remediation|geotechnical/i.test(tip) ||
        /darcy’s law for groundwater|hydraulic conductivity|transmissivity|theis equation|cooper-jacob|dupuit|unconfined aquifer|confined aquifer|drawdown|well cone of depression|retardation factor|contaminant transport|dispersion coefficient|soil vapor extraction|air sparging|pump and treat|permeable reactive barrier|uscs soil classification/i.test(lower)) {
        return 13;
    }

    // 12. Solid and Hazardous Waste
    if (/solid waste|hazardous waste|landfill|remediation/i.test(tip) ||
        /municipal solid waste|landfill leachate|landfill gas generation|methane generation|rcra|hazardous waste characteristics|toxicity characteristic leaching procedure|tclp|incineration destruction and removal efficiency|dre|clay liner permeability|geomembrane|composting c:n ratio/i.test(lower)) {
        return 12;
    }

    // 11. Air Quality and Control
    if (/air quality|air pollution|climate/i.test(tip) ||
        /gaussian plume|atmospheric dispersion|pasquill-gifford|plume rise|holland equation|cyclone separator cut diameter|baghouse fabric filter|electrostatic precipitator|deutsch-anderson|venturi scrubber|flue gas desulfurization|scrubber absorption|ambient air quality standards|naaqs|ppm to mg\/m3|greenhouse gas global warming potential/i.test(lower)) {
        return 11;
    }

    // 10. Water and Wastewater Engineering
    if (/water quality|water treatment|wastewater|drinking water|disinfection|sludge/i.test(tip) ||
        /streeter-phelps|dissolved oxygen sag|critical deficit|bod|biochemical oxygen demand|ultimate bod|chick-watson disinfection kinetics|chlorine contact chamber|ct concept|sedimentation basin surface overflow rate|rapid mix velocity gradient|g-value|camp-stein|coagulation|flocculation|dual media filtration|carman-kozeny|activated sludge|aeration tank|mean cell residence time|mcrt|food-to-mass ratio|f\/m ratio|sludge volume index|svi|weir overflow rate|break point chlorination|nitrogen removal|nitrification and denitrification|phosphorus removal/i.test(lower)) {
        return 10;
    }

    // 9. Water Resources
    if (/water resources|hydrology|hydraulics and hydrologic|stormwater/i.test(tip) ||
        /rational method runoff|runoff coefficient|time of concentration|scs curve number|hydrograph|unit hydrograph|manning’s equation for open channel|hydraulic jump|specific energy|froude number|weir equation|sharp-crested weir|v-notch weir|reservoir routing|flood frequency/i.test(lower)) {
        return 9;
    }

    // 8. Fluid Mechanics
    if ((/fluid mechanics|hydraulics|fluid statics|pipe flow/i.test(tip) && !/universal vs\. specific gas constant/i.test(lower)) ||
        /bernoulli equation|darcy-weisbach|friction factor|moody diagram|hazen-williams|pipe network|hardy cross|pump characteristic curve|net positive suction head|npsh|cavitation|fluid viscosity|viscosity of a fluid|hydrostatic pressure|buoyancy|continuity equation/i.test(lower)) {
        return 8;
    }

    // 7. Thermodynamics and Phase Equilibrium
    if ((/thermodynamics|phase equilibrium/i.test(tip) && !/combustion of methane/i.test(lower)) ||
        /ideal gas law|partial pressure|dalton’s law|henry’s law for gas solubility|raoult’s law|vapor pressure|antoine equation|latent heat|enthalpy|entropy|first law of thermodynamics|second law of thermodynamics|intensive vs\. extensive|universal vs\. specific gas constant/i.test(lower)) {
        return 7;
    }

    // 6. Environmental Science and Chemistry
    if (/environmental chemistry|chemistry|water chemistry|ecology/i.test(tip) ||
        /carbonate equilibrium|alkalinity|hardness|calcium carbonate equivalent|ph and poh|henderson-hasselbalch|solubility product constant|ksp|nernst equation|chemical equilibrium constant|freundlich adsorption|langmuir adsorption|monod kinetics|photosynthesis and respiration|nitrogen cycle|phosphorus cycle|combustion of methane/i.test(lower)) {
        return 6;
    }

    // 5. Materials Science
    if (/materials science|materials|corrosion/i.test(tip) ||
        /corrosion rate|galvanic series|passivity|cathodic protection|polymer degradation/i.test(lower)) {
        return 5;
    }

    // 4. Engineering Economics
    if (/engineering economics|economics/i.test(tip) ||
        /present worth|future worth|annual worth|capital recovery|benefit-cost ratio|internal rate of return|payback period|depreciation|macrs|capitalized cost/i.test(lower)) {
        return 4;
    }

    // 3. Ethics and Professional Practice
    if (/ethics/i.test(tip) ||
        /code of ethics|public health, safety|licensure|conflict of interest|whistleblowing|environmental ethics/i.test(lower)) {
        return 3;
    }

    // 2. Probability and Statistics
    if (/probability|statistics/i.test(tip) ||
        /central limit|probability distribution|normal distribution|student’s t|confidence interval|hypothesis test|linear regression|correlation coefficient|variance|standard deviation/i.test(lower)) {
        return 2;
    }

    // 1. Mathematics
    return 1;
}

const INDUSTRIAL_SUBJECTS = [
    { id: 1, name: '1. Mathematics' },
    { id: 2, name: '2. Engineering Sciences' },
    { id: 3, name: '3. Ethics & Professional Practice' },
    { id: 4, name: '4. Engineering Economics' },
    { id: 5, name: '5. Probability & Statistics' },
    { id: 6, name: '6. Modeling and Computations' },
    { id: 7, name: '7. Industrial Management' },
    { id: 8, name: '8. Manufacturing, Production, and Service Systems' },
    { id: 9, name: '9. Facilities and Logistics' },
    { id: 10, name: '10. Human Factors, Ergonomics, and Safety' },
    { id: 11, name: '11. Work Design' },
    { id: 12, name: '12. Quality' },
    { id: 13, name: '13. Systems Engineering, Analysis, and Design' }
];

function getIndustrialSubjectId(title, examTip, description) {
    const lower = (title || '').trim().toLowerCase();
    const tip = (examTip || '').toLowerCase();

    // Priority overrides
    if (/vector cross product|vector dot product|vector magnitude/i.test(lower)) {
        return 1;
    }
    if (/chronic daily intake|excess lifetime cancer|exposure limits|hazard quotient|toxicology|noise pollution|permissible noise/i.test(lower) || /environmental health|hygiene|safety/i.test(tip)) {
        return 10;
    }
    if (/poynting vector|centrifugal pump|retaining wall|engineering stress-strain|modulus of resilience|first angle vs\. third/i.test(lower)) {
        return 2;
    }
    if (/rolling element bearing/i.test(lower)) {
        return 13;
    }

    // 13. Systems Engineering, Analysis, and Design
    if (/systems engineering|reliability engineering|decision analysis|\breliability\b/i.test(tip) ||
        /fault tree|\bfmea\b|decision tree|monetary value|utility theory|\breliability\b|standby redundancy|k-out-of-n|\bmtbf\b|\bmttf\b|bathtub curve/i.test(lower)) {
        return 13;
    }

    // 12. Quality
    if (/quality|six sigma|statistical process control|\bspc\b/i.test(tip) ||
        /shewhart|control chart|x-bar|r chart|p-chart|c-chart|u-chart|process capability|\bcp\b|\bcpk\b|\bpp\b|\bppk\b|control limit|\bdmaic\b|operating characteristic|\baql\b|gage r&r/i.test(lower)) {
        return 12;
    }

    // 11. Work Design
    if (/work design|work measurement|methods engineering|time study/i.test(tip) ||
        /time study|standard time|normal time|observed time|performance rating|allowance factor|predetermined motion|methods-time|\bmtm\b|work sampling|learning curve/i.test(lower)) {
        return 11;
    }

    // 10. Human Factors, Ergonomics, and Safety
    if (/ergonomics|human factors|industrial safety|safety/i.test(tip) ||
        /niosh|lifting|biomechanic|l5\/s1|anthropometric|\brula\b|metabolic|noise exposure|\bdba\b|hierarchy of controls|osha|hazard/i.test(lower)) {
        return 10;
    }

    // 9. Facilities and Logistics
    if (/facilities|logistics|supply chain|warehouse/i.test(tip) ||
        /center of gravity|rectilinear|euclidean distance|layout planning|from-to chart|assembly line balancing|cycle time|balance delay|automated guided vehicle|\bagv\b|material handling/i.test(lower)) {
        return 9;
    }

    // 8. Manufacturing, Production, and Service Systems
    if (/production|inventory|manufacturing|forecasting|lean|operations|scheduling/i.test(tip) ||
        /economic order quantity|\beoq\b|\bepq\b|reorder point|safety stock|exponential smoothing|moving average|tracking signal|\bmrp\b|bill of materials|\bbom\b|johnson’s rule|kanban|takt time|just-in-time|\bsmed\b|setup reduction|overall equipment effectiveness|\boee\b|dispatching rule|available-to-promise|\batp\b|inventory cost/i.test(lower)) {
        return 8;
    }

    // 7. Industrial Management
    if (/project management|\bcpm\b|management|cost accounting/i.test(tip) ||
        /critical path|\bcpm\b|\bpert\b|crashing|earned value|cost variance|schedule variance|standard costing/i.test(lower)) {
        return 7;
    }

    // 6. Modeling and Computations
    if (/operations research|queueing|queuing|simulation|linear programming|stochastic/i.test(tip) ||
        /little’s law|m\/m\/|linear programming|simplex|graphical lp|dual problem|shadow price|transportation problem|assignment problem|hungarian|markov|transition matrix|steady-state|monte carlo/i.test(lower)) {
        return 6;
    }

    // 5. Probability and Statistics
    if (/probability|statistics|design of experiments|\bdoe\b/i.test(tip) ||
        /central limit|bayes|binomial|poisson|exponential distribution|normal distribution|sample mean|sample variance|confidence interval|hypothesis test|student’s t|chi-square|anova|linear regression|factorial design/i.test(lower)) {
        return 5;
    }

    // 4. Engineering Economics
    if (/engineering economics|economics/i.test(tip) ||
        /present worth|future worth|annual worth|capital recovery|uniform gradient|internal rate|benefit-cost|depreciation|macrs|capitalized cost|breakeven/i.test(lower)) {
        return 4;
    }

    // 3. Ethics and Professional Practice
    if (/ethics/i.test(tip) ||
        /code of ethics|public safety|licensure|whistleblowing|conflict of interest/i.test(lower)) {
        return 3;
    }

    // 2. Engineering Sciences
    if (/statics|dynamics|mechanics of materials|electricity|circuits|thermodynamics|geotechnical/i.test(tip) ||
        /rigid bod|free body|truss|centroid|moment of inertia|kinematic|work-energy|stress and strain|hooke|shear and moment|ohm’s law|kirchhoff|malleability and ductility|failure by fatigue|failure by creep|charpy and izod|hardness of a material|thermoplastics vs/i.test(lower)) {
        return 2;
    }

    // 1. Mathematics
    return 1;
}

const DISCIPLINE_SUBJECT_CONFIG = {
    'Mechanical': { list: MECHANICAL_SUBJECTS, getSubjectId: getMechanicalSubjectId, defaultName: '1. Mathematics' },
    'Civil': { list: CIVIL_SUBJECTS, getSubjectId: getCivilSubjectId, defaultName: '1. Mathematics & Statistics' },
    'Other': { list: OTHER_SUBJECTS, getSubjectId: getOtherSubjectId, defaultName: '1. Mathematics' },
    'Electrical and Computer': { list: ELECTRICAL_SUBJECTS, getSubjectId: getElectricalSubjectId, defaultName: '1. Mathematics' },
    'Chemical': { list: CHEMICAL_SUBJECTS, getSubjectId: getChemicalSubjectId, defaultName: '1. Mathematics' },
    'Environmental': { list: ENVIRONMENTAL_SUBJECTS, getSubjectId: getEnvironmentalSubjectId, defaultName: '1. Mathematics' },
    'Industrial': { list: INDUSTRIAL_SUBJECTS, getSubjectId: getIndustrialSubjectId, defaultName: '1. Mathematics' }
};


    function syncSubjectSelectVisibility() {
        const select = document.getElementById('fc-subject-select');
        if (!select) return;
        const actualDisc = (currentDiscipline === 'current' || !currentDiscipline) 
            ? getActiveDiscipline() 
            : currentDiscipline;
        const hasSubjects = (actualDisc !== 'all' && Boolean(DISCIPLINE_SUBJECT_CONFIG[actualDisc]));

        if (hasSubjects) {
            select.classList.remove('hidden');
        } else {
            select.classList.add('hidden');
        }
    }

    function updateSubjectSelectOptions(fullDeck, actualDisc) {
        const select = document.getElementById('fc-subject-select');
        if (!select) return;

        const config = DISCIPLINE_SUBJECT_CONFIG[actualDisc];
        if (!config) {
            select.classList.add('hidden');
            return;
        }

        const subjectList = config.list;
        const getSubjectFn = config.getSubjectId;

        const counts = {};
        fullDeck.forEach(c => {
            const sId = c.subjectId || getSubjectFn(c.title, c.examTip, c.description);
            counts[sId] = (counts[sId] || 0) + 1;
        });

        const totalCount = fullDeck.length;
        let html = `<option value="all">All Subjects (${totalCount} Cards)</option>`;
        subjectList.forEach(sub => {
            const count = counts[sub.id] || 0;
            html += `<option value="${sub.id}">${sub.name} (${count})</option>`;
        });

        select.innerHTML = html;
        select.value = currentSubjectFilter;
        select.title = 'Switch Subject (FE ' + actualDisc + ' Syllabus)';
    }

    // Get active discipline from app or localStorage
    function getActiveDiscipline() {
        if (typeof window.getActiveMotivationDiscipline === 'function') {
            return window.getActiveMotivationDiscipline();
        }
        return localStorage.getItem('enggtv_discipline') || 'Mechanical';
    }

    // Build the theorem queue for current session
    function buildSessionQueue(disc, mode, subjectFilter = 'all') {
        const datasets = window.THEOREMS_BY_DISCIPLINE || {};
        let actualDisc = disc;
        if (disc === 'current' || !disc) {
            actualDisc = getActiveDiscipline();
        }

        let allTheorems = [];
        if (disc === 'all') {
            Object.keys(datasets).forEach(d => {
                (datasets[d] || []).forEach(t => allTheorems.push({ ...t, disc: d }));
            });
        } else {
            allTheorems = (datasets[actualDisc] || []).map(t => ({ ...t, disc: actualDisc }));
        }

        // Only include flashcards that have videos associated with them
        allTheorems = allTheorems.filter(card => Boolean(card && card.videoUrl));

        // Tag cards with subject information according to NCEES CBT specifications
        const config = DISCIPLINE_SUBJECT_CONFIG[actualDisc];
        if (config) {
            allTheorems.forEach(card => {
                card.subjectId = config.getSubjectId(card.title, card.examTip, card.description);
                const subObj = config.list.find(s => s.id === card.subjectId);
                card.subjectName = subObj ? subObj.name : config.defaultName;
            });

            // Apply subject filter if selected
            if (subjectFilter && subjectFilter !== 'all') {
                const targetSubId = Number(subjectFilter);
                allTheorems = allTheorems.filter(card => card.subjectId === targetSubId);
            }
        }

        return allTheorems;
    }

    // Render current card state
        // =========================================================================
    // Instant Image Preloader & Decoded Memory Cache (Eliminates Flashcard Lag)
    // =========================================================================
    const preloadedImageCache = new Map();

    function preloadCardImage(url) {
        if (!url || preloadedImageCache.has(url)) return;
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = url;
        preloadedImageCache.set(url, img);
        if (img.decode) {
            img.decode().catch(() => {});
        }
    }

    function preloadAdjacentCardImages(index, lookaheadCount = 6) {
        if (!currentDeck || !currentDeck.length) return;
        const total = currentDeck.length;
        // Preload upcoming lookaheadCount cards (primary navigation direction)
        for (let offset = 1; offset <= lookaheadCount; offset++) {
            const nextIdx = (index + offset) % total;
            const nextCard = currentDeck[nextIdx];
            if (nextCard && nextCard.imageUrl) {
                preloadCardImage(nextCard.imageUrl);
            }
        }
        // Preload previous 2 cards (backward navigation)
        for (let offset = 1; offset <= 2; offset++) {
            const prevIdx = (index - offset + total) % total;
            const prevCard = currentDeck[prevIdx];
            if (prevCard && prevCard.imageUrl) {
                preloadCardImage(prevCard.imageUrl);
            }
        }
    }

    // Format flashcard formula into stacked lines if excessive, preserving full font size and expanding vertically
    function formatFlashcardFormula(formulaStr) {
        if (!formulaStr) return '';
        let inner = String(formulaStr).trim();
        if (inner.startsWith('$$') && inner.endsWith('$$')) {
            inner = inner.slice(2, -2).trim();
        } else if (inner.startsWith('$') && inner.endsWith('$')) {
            inner = inner.slice(1, -1).trim();
        }

        // If concise and lacks top-level multi-statement delimiters, render as single row
        if (inner.length <= 50 && !inner.includes('; \\quad') && !inner.includes(';\\quad') && !inner.includes('\\\\')) {
            return '<div class="fc-formula-row">$$' + inner + '$$</div>';
        }

        const rawParts = [];
        let cur = '';
        let envDepth = 0;
        let braceDepth = 0;
        let i = 0;

        while (i < inner.length) {
            if (inner.startsWith('\\begin{', i)) {
                envDepth++;
                cur += '\\begin{';
                i += 7;
                continue;
            }
            if (inner.startsWith('\\end{', i)) {
                envDepth = Math.max(0, envDepth - 1);
                cur += '\\end{';
                i += 5;
                continue;
            }
            if (inner[i] === '{') {
                braceDepth++;
                cur += '{';
                i++;
                continue;
            }
            if (inner[i] === '}') {
                braceDepth = Math.max(0, braceDepth - 1);
                cur += '}';
                i++;
                continue;
            }

            // At top level (outside matrix, cases, aligned, and braces)
            if (envDepth === 0 && braceDepth === 0) {
                // Semicolon separator
                if (inner.startsWith('; \\quad', i)) {
                    cur += ';';
                    rawParts.push(cur.trim());
                    cur = '';
                    i += 7;
                    continue;
                }
                if (inner.startsWith(';\\quad', i)) {
                    cur += ';';
                    rawParts.push(cur.trim());
                    cur = '';
                    i += 6;
                    continue;
                }
                // Explicit top-level newline
                if (inner.startsWith('\\\\', i)) {
                    rawParts.push(cur.trim());
                    cur = '';
                    i += 2;
                    continue;
                }
                // Comma quad separator
                if (inner.startsWith(', \\quad', i) || inner.startsWith(',\\quad', i)) {
                    const advance = inner.startsWith(', \\quad', i) ? 7 : 6;
                    cur += ',';
                    if (cur.length > 25 || inner.length > 70) {
                        rawParts.push(cur.trim());
                        cur = '';
                    } else {
                        cur += ' \\quad ';
                    }
                    i += advance;
                    continue;
                }
            }

            cur += inner[i];
            i++;
        }

        if (cur.trim().length > 0) {
            rawParts.push(cur.trim());
        }

        const validParts = rawParts.map(p => {
            let s = p.trim();
            if (s.endsWith(',')) s = s.slice(0, -1).trim();
            return s;
        }).filter(p => p.length > 0);

        if (validParts.length <= 1) {
            return '<div class="fc-formula-row">$$' + inner + '$$</div>';
        }

        // Group parts so we don't produce tiny fragments (group consecutive short parts <= 55 chars)
        const grouped = [];
        let accum = '';

        for (let pIdx = 0; pIdx < validParts.length; pIdx++) {
            const part = validParts[pIdx];
            if (!accum) {
                accum = part;
            } else {
                if (accum.length + part.length < 55 && !accum.endsWith(';') && !accum.includes('\\begin{') && !part.includes('\\begin{')) {
                    accum += ', \\quad ' + part;
                } else {
                    grouped.push(accum);
                    accum = part;
                }
            }
        }
        if (accum) grouped.push(accum);

        return grouped.map(g => '<div class="fc-formula-row">$$' + g + '$$</div>').join('');
    }

    function renderCard() {
        const modal = document.getElementById('fe-flashcards-modal');
        if (!modal || modal.classList.contains('hidden')) return;

        const summaryView = document.getElementById('fc-summary-view');
        const cardTrigger = document.getElementById('fc-card-trigger');
        const ratingDock = document.getElementById('fc-rating-dock');

        if (!currentDeck || currentDeck.length === 0) {
            if (cardTrigger) cardTrigger.classList.add('hidden');
            return;
        }

        if (cardTrigger) cardTrigger.classList.remove('hidden');
        if (summaryView) summaryView.classList.add('hidden');
        if (ratingDock) ratingDock.classList.remove('hidden');

        // Circular wrap-around bounds check
        if (currentIndex < 0) currentIndex = currentDeck.length - 1;
        if (currentIndex >= currentDeck.length) currentIndex = 0;

        const card = currentDeck[currentIndex];
        // Lookahead Preloader: Warm up upcoming card images in the background
        preloadAdjacentCardImages(currentIndex, 6);
        isFlipped = true;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');

        // Update Header Progress
        const progressText = document.getElementById('fc-progress-text');
        const progressBar = document.getElementById('fc-session-progress-bar');

        if (progressText) progressText.textContent = `Card ${currentIndex + 1} of ${currentDeck.length}`;
        if (progressBar) {
            const pct = Math.round(((currentIndex + 1) / currentDeck.length) * 100);
            progressBar.style.width = `${Math.max(2, pct)}%`;
        }

        // Card Front Fields
        const cardDisc = document.getElementById('fc-card-discipline');
        const cardLvl = document.getElementById('fc-card-level-badge');
        const frontPrompt = document.getElementById('fc-front-prompt-label');
        const frontTitle = document.getElementById('fc-front-title');
        const frontFormulaView = document.getElementById('fc-front-formula-view');
        const frontHint = document.getElementById('fc-front-hint');

        if (cardDisc) {
            if (card.subjectName) {
                cardDisc.textContent = `${card.disc} FE Focus • ${card.subjectName}`;
            } else {
                cardDisc.textContent = `${card.disc || getActiveDiscipline()} FE Focus`;
            }
        }
        if (cardLvl) {
            cardLvl.textContent = `#${currentIndex + 1} of ${currentDeck.length}`;
            cardLvl.className = 'text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30';
        }

        if (currentMode === 'identify') {
            if (frontPrompt) frontPrompt.textContent = 'Identify this Governing Principle:';
            if (frontTitle) frontTitle.classList.add('hidden');
            if (frontFormulaView) {
                frontFormulaView.classList.remove('hidden');
                frontFormulaView.innerHTML = formatFlashcardFormula(card.formula);
            }
            if (frontHint) {
                frontHint.innerHTML = 'What is the name of this theorem, and what FE topic does it govern?';
            }
            triggerMathTypeset([frontFormulaView]);
        } else {
            if (frontPrompt) frontPrompt.textContent = 'Recall the Governing Equation:';
            if (frontTitle) {
                frontTitle.classList.remove('hidden');
                frontTitle.innerHTML = card.title || '';
            }
            if (frontFormulaView) frontFormulaView.classList.add('hidden');
            if (frontHint) {
                const cleanSnippet = (card.description || '').replace(/\$\$[\s\S]*?\$\$/g, '').trim();
                frontHint.innerHTML = cleanSnippet || 'What is the mathematical equation, key variables, and assumptions?';
            }
            triggerMathTypeset([frontTitle, frontHint]);
        }

        // Responsive Front Blueprint Image Setup (Visible on Desktop/Laptop/Tablet, Hidden on Mobile Phones)
        const hasImage = Boolean(card.imageUrl);
        const frontGrid = document.getElementById('fc-front-grid');
        const frontTextCol = document.getElementById('fc-front-text-col');
        const frontImgCol = document.getElementById('fc-front-image-col');
        const frontImg = document.getElementById('fc-front-image');
        const frontImgContainer = document.getElementById('fc-front-image-container');
        const frontCaptionText = document.getElementById('fc-front-caption-text');

        if (hasImage) {
            if (frontImgCol) {
                frontImgCol.classList.remove('hidden');
                frontImgCol.className = 'hidden md:flex md:col-span-5 flex-col items-center justify-center shrink-0 w-full transition-all duration-300';
            }
            if (frontGrid) {
                frontGrid.className = 'w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-center justify-center transition-all duration-300';
            }
            if (frontTextCol) {
                frontTextCol.className = 'w-full md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left gap-3 transition-all duration-300';
            }
            if (frontImg) {
                frontImg.alt = card.imageTitle || card.title || 'Technical Diagram';
                frontImg.decoding = 'async';
                frontImg.loading = 'eager';

                const cached = preloadedImageCache.get(card.imageUrl);
                const isAlreadyLoaded = (frontImg.src && frontImg.src.endsWith(card.imageUrl) && frontImg.complete && frontImg.naturalWidth > 0) ||
                                        (cached && cached.complete && cached.naturalWidth > 0);

                if (isAlreadyLoaded) {
                    frontImg.src = card.imageUrl;
                    frontImg.classList.remove('opacity-0');
                    frontImg.classList.add('opacity-100');
                } else {
                    frontImg.classList.remove('opacity-100');
                    frontImg.classList.add('opacity-0');
                    frontImg.onload = function() {
                        frontImg.classList.remove('opacity-0');
                        frontImg.classList.add('opacity-100');
                    };
                    frontImg.src = card.imageUrl;
                }
            }
            if (frontCaptionText) {
                frontCaptionText.textContent = card.imageTitle || 'Technical Illustration Blueprint';
            }
            if (frontImgContainer) {
                frontImgContainer.onclick = function(e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    openBlueprintLightbox(e);
                };
            }
        } else {
            if (frontImgCol) {
                frontImgCol.className = 'hidden';
            }
            if (frontGrid) {
                frontGrid.className = 'w-full max-w-5xl flex flex-col items-center justify-center text-center gap-4 transition-all duration-300';
            }
            if (frontTextCol) {
                frontTextCol.className = 'w-full flex flex-col items-center justify-center text-center gap-3 transition-all duration-300';
            }
            if (frontImg) {
                frontImg.removeAttribute('src');
            }
        }

        // Card Back Fields
        const backTitle = document.getElementById('fc-back-title');
        const backFormula = document.getElementById('fc-back-formula');
        const backDesc = document.getElementById('fc-back-desc');
        const backTip = document.getElementById('fc-back-tip');

        if (backTitle) backTitle.innerHTML = card.title || '';
        if (backFormula) backFormula.innerHTML = formatFlashcardFormula(card.formula);
        if (backDesc) backDesc.innerHTML = card.description || '';
        if (backTip) backTip.innerHTML = card.examTip || '';

        // Typeset back math directly on every card render
        const backEls = [backFormula, backDesc, backTip, backTitle].filter(Boolean);
        triggerMathTypeset(backEls);
        setTimeout(() => triggerMathTypeset(backEls), 50);
        setTimeout(() => triggerMathTypeset(backEls), 200);

        // Responsive Media Layout on Back
        const hasVideo = Boolean(card.videoUrl);
        const backColVideo = document.getElementById('fc-back-col-video');
        const backColPrimary = document.getElementById('fc-back-col-primary');
        const mediaSwitcher = document.getElementById('fc-media-switcher');
        const mediaStaticHeader = document.getElementById('fc-media-static-header');
        const headerIcon = document.getElementById('fc-media-header-icon');
        const headerLabel = document.getElementById('fc-media-header-label');
        const videoDur = document.getElementById('fc-back-video-duration');
        const backVideo = document.getElementById('fc-back-video');
        const backImg = document.getElementById('fc-back-image');
        const backVideoContainer = document.getElementById('fc-back-video-container');
        const backImgContainer = document.getElementById('fc-back-image-container');

        if (hasVideo && hasImage) {
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'order-2 lg:order-none w-full lg:col-span-7 flex flex-col space-y-2 mt-1 sm:mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'contents lg:flex lg:flex-col lg:col-span-5 lg:justify-start lg:space-y-3';
            }

            if (backVideo) {
                backVideo.src = card.videoUrl;
                backVideo.load();
            }

            if (backImg) {
                backImg.alt = card.imageTitle || card.title || 'Technical Blueprint Diagram';
                backImg.decoding = 'async';
                backImg.loading = 'eager';
                backImg.src = card.imageUrl;
            }
            if (backImgContainer) {
                backImgContainer.onclick = openBlueprintLightbox;
            }

            if (mediaSwitcher) {
                mediaSwitcher.classList.remove('hidden');
                mediaSwitcher.classList.add('flex');
            }
            if (mediaStaticHeader) mediaStaticHeader.classList.add('hidden');

            const btnVid = document.getElementById('fc-toggle-btn-video');
            const btnBp = document.getElementById('fc-toggle-btn-blueprint');
            if (btnVid) btnVid.onclick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); setMediaTab('video'); };
            if (btnBp) btnBp.onclick = (e) => { if (e && e.stopPropagation) e.stopPropagation(); setMediaTab('blueprint'); };

            if (videoDur) {
                videoDur.textContent = card.videoDuration || '10s';
            }
            setMediaTab('video');
        } else if (hasVideo) {
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'order-2 lg:order-none w-full lg:col-span-7 flex flex-col space-y-2 mt-1 sm:mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'contents lg:flex lg:flex-col lg:col-span-5 lg:justify-start lg:space-y-3';
            }

            if (backVideo) {
                backVideo.src = card.videoUrl;
                backVideo.load();
            }

            if (backVideoContainer) backVideoContainer.classList.remove('hidden');
            if (backImgContainer) backImgContainer.classList.add('hidden');

            if (mediaSwitcher) {
                mediaSwitcher.classList.add('hidden');
                mediaSwitcher.classList.remove('flex');
            }
            if (mediaStaticHeader) mediaStaticHeader.classList.remove('hidden');
            if (headerIcon) {
                headerIcon.textContent = 'smart_display';
                headerIcon.className = 'material-symbols-outlined text-[15px] text-cyan-400';
            }
            if (headerLabel) {
                headerLabel.textContent = '10s Video Explainer';
                headerLabel.className = 'text-[10px] font-black uppercase tracking-widest text-cyan-400';
            }
            if (videoDur) {
                videoDur.textContent = card.videoDuration || '10s';
            }
            activeMediaTab = 'video';
            playBackVideo();
        } else if (hasImage) {
            // Blueprint fallback on back only if no video exists
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'order-2 lg:order-none w-full lg:col-span-7 flex flex-col space-y-2 mt-1 sm:mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'contents lg:flex lg:flex-col lg:col-span-5 lg:justify-start lg:space-y-3';
            }
            if (mediaSwitcher) {
                mediaSwitcher.classList.add('hidden');
                mediaSwitcher.classList.remove('flex');
            }
            if (mediaStaticHeader) mediaStaticHeader.classList.remove('hidden');
            if (headerIcon) {
                headerIcon.textContent = 'architecture';
                headerIcon.className = 'material-symbols-outlined text-[15px] text-purple-400';
            }
            if (headerLabel) {
                headerLabel.textContent = 'Technical Blueprint';
                headerLabel.className = 'text-[10px] font-black uppercase tracking-widest text-purple-400';
            }
            if (backImg) {
                backImg.alt = card.imageTitle || card.title || 'Technical Blueprint Diagram';
                backImg.decoding = 'async';
                backImg.loading = 'eager';

                const cached = preloadedImageCache.get(card.imageUrl);
                const isAlreadyLoaded = (backImg.src && backImg.src.endsWith(card.imageUrl) && backImg.complete && backImg.naturalWidth > 0) ||
                                        (cached && cached.complete && cached.naturalWidth > 0);

                if (isAlreadyLoaded) {
                    backImg.src = card.imageUrl;
                    backImg.classList.remove('opacity-0');
                    backImg.classList.add('opacity-100');
                } else {
                    backImg.classList.remove('opacity-100');
                    backImg.classList.add('opacity-0');
                    backImg.onload = function() {
                        backImg.classList.remove('opacity-0');
                        backImg.classList.add('opacity-100');
                    };
                    backImg.src = card.imageUrl;
                }
                if (backImgContainer) {
                    backImgContainer.onclick = openBlueprintLightbox;
                }
            }
            setMediaTab('blueprint');
        } else {
            // Neither video nor image exists
            if (backColVideo) backColVideo.classList.add('hidden');
            if (backColPrimary) {
                backColPrimary.className = 'w-full sm:col-span-12 max-w-2xl lg:max-w-4xl mx-auto space-y-4';
            }
            if (backVideo) {
                backVideo.pause();
                backVideo.removeAttribute('src');
            }
        }

        // Solved Example Handling on Card Back (Video Side - Floating on Video)
        const btnVideoExample = document.getElementById('fc-btn-video-example');
        const exampleOverlay = document.getElementById('fc-video-example-overlay');
        const exampleQuestion = document.getElementById('fc-video-example-question');
        const exampleSolution = document.getElementById('fc-video-example-solution');
        const solutionBtnLabel = document.getElementById('fc-solution-btn-label');

        if (card.solvedExample) {
            if (btnVideoExample) btnVideoExample.classList.remove('hidden');
            if (exampleOverlay) exampleOverlay.classList.add('hidden');
            if (exampleSolution) exampleSolution.classList.add('hidden');
            if (solutionBtnLabel) solutionBtnLabel.textContent = 'Show me the Solution';

            if (exampleQuestion) {
                exampleQuestion.innerHTML = formatSolvedExampleQuestion(card.solvedExample.question || '');
            }
            if (exampleSolution) {
                exampleSolution.innerHTML = formatSolvedExampleSolution(card.solvedExample.solution || '');
            }

            // Ensure media column is displayed on the back face so solved example is visible
            if (!hasVideo && !hasImage) {
                if (backColVideo) {
                    backColVideo.classList.remove('hidden');
                    backColVideo.className = 'order-2 lg:order-none w-full lg:col-span-7 flex flex-col space-y-2 mt-1 sm:mt-2 lg:mt-0';
                }
                if (backColPrimary) {
                    backColPrimary.className = 'contents lg:flex lg:flex-col lg:col-span-5 lg:justify-start lg:space-y-3';
                }
                if (backVideoContainer) {
                    backVideoContainer.classList.remove('hidden');
                    backVideoContainer.style.background = 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)';
                }
                const mediaStaticHeader = document.getElementById('fc-media-static-header');
                const mediaSubtext = document.getElementById('fc-media-subtext');
                const videoDurationBadge = document.getElementById('fc-back-video-duration');
                if (mediaStaticHeader) mediaStaticHeader.classList.remove('hidden');
                if (videoDurationBadge) videoDurationBadge.classList.add('hidden');
                const headerIcon = document.getElementById('fc-media-header-icon');
                const headerLabel = document.getElementById('fc-media-header-label');
                if (headerIcon) {
                    headerIcon.textContent = 'school';
                    headerIcon.className = 'material-symbols-outlined text-[15px] text-emerald-400';
                }
                if (headerLabel) {
                    headerLabel.textContent = 'FE Practice Problem';
                    headerLabel.className = 'text-[10px] font-black uppercase tracking-widest text-emerald-400';
                }
                if (mediaSubtext) mediaSubtext.classList.add('hidden');
            } else {
                if (backVideoContainer) backVideoContainer.style.background = '';
                const videoDurationBadge = document.getElementById('fc-back-video-duration');
                if (videoDurationBadge) videoDurationBadge.classList.remove('hidden');
                const mediaSubtext = document.getElementById('fc-media-subtext');
                if (mediaSubtext) mediaSubtext.classList.remove('hidden');
            }
        } else {
            if (btnVideoExample) btnVideoExample.classList.add('hidden');
            if (exampleOverlay) exampleOverlay.classList.add('hidden');
            if (exampleSolution) exampleSolution.classList.add('hidden');
            if (backVideoContainer) backVideoContainer.style.background = '';
            const videoDurationBadge = document.getElementById('fc-back-video-duration');
            if (videoDurationBadge) videoDurationBadge.classList.remove('hidden');
        }

        // Initialize In-Video Karaoke Captions
        initKaraokeCues(card);
        wireKaraokeVideoEvents();
    }

    // Helper to format solved example questions, ensuring LaTeX delimiters on math options
    function formatSolvedExampleQuestion(html) {
        if (!html || typeof html !== 'string') return '';
        let processed = html.replace(/\bfont-mono\b/g, 'font-sans font-medium');

        processed = processed.replace(/(<div class="[^"]*p-2[^"]*">\s*\(([A-D])\)\s*)([\s\S]*?)(<\/div>)/g, (fullMatch, prefix, letter, content, suffix) => {
            let trimmed = content.trim();
            if (trimmed.includes('$')) return fullMatch;

            const englishWords = (trimmed.match(/\b[a-zA-Z]{3,}\b/g) || []).filter(w => !/^(rad|rpm|sec|min|deg|avg|max|min|solid|hollow|sync|gauge|abs|amp)$/i.test(w));
            if (englishWords.length >= 4) return fullMatch;

            if (!/[=\^_×⁻²³ζωστδαθλρμΩ°]/.test(trimmed) && !/^\s*[-+]?\d+(?:\.\d+)?\s*[a-zA-Z/°Ω·%]*\s*$/.test(trimmed) && !/[a-zA-Z]_[a-zA-Z0-9]/.test(trimmed)) {
                return fullMatch;
            }

            let latex = trimmed
                .replace(/ζ/g, '\\zeta')
                .replace(/ω_d/g, '\\omega_d')
                .replace(/ω_0/g, '\\omega_0')
                .replace(/ω/g, '\\omega')
                .replace(/σ_avg/g, '\\sigma_{\\text{avg}}')
                .replace(/σ_max/g, '\\sigma_{\\max}')
                .replace(/σ_min/g, '\\sigma_{\\min}')
                .replace(/σ_h/g, '\\sigma_h')
                .replace(/σ_l/g, '\\sigma_l')
                .replace(/σ_1/g, '\\sigma_1')
                .replace(/σ_2/g, '\\sigma_2')
                .replace(/σ_T/g, '\\sigma_T')
                .replace(/σ_E/g, '\\sigma_E')
                .replace(/σ/g, '\\sigma')
                .replace(/τ_max/g, '\\tau_{\\max}')
                .replace(/τ_y/g, '\\tau_y')
                .replace(/τ/g, '\\tau')
                .replace(/δ/g, '\\delta')
                .replace(/Δd/g, '\\Delta d')
                .replace(/ΔM/g, '\\Delta M')
                .replace(/Δh/g, '\\Delta h')
                .replace(/ΔP_f/g, '\\Delta P_f')
                .replace(/ΔP/g, '\\Delta P')
                .replace(/Δ/g, '\\Delta ')
                .replace(/α/g, '\\alpha')
                .replace(/θ/g, '\\theta')
                .replace(/λ/g, '\\lambda')
                .replace(/ρ/g, '\\rho')
                .replace(/μ_app/g, '\\mu_{\\text{app}}')
                .replace(/μ_p/g, '\\mu_p')
                .replace(/με/g, '\\ \\mu\\epsilon')
                .replace(/μ/g, '\\mu')
                .replace(/ε_T/g, '\\epsilon_T')
                .replace(/ε_E/g, '\\epsilon_E')
                .replace(/×/g, '\\times ')
                .replace(/≈/g, '\\approx ')
                .replace(/·/g, '\\cdot ')
                .replace(/\bI_solid\b/g, 'I_{\\text{solid}}')
                .replace(/\bI_hollow\b/g, 'I_{\\text{hollow}}')
                .replace(/\bI_G\b/g, 'I_G')
                .replace(/\bI_O\b/g, 'I_O')
                .replace(/\bI_x\b/g, 'I_x')
                .replace(/\bI_y\b/g, 'I_y')
                .replace(/\bI_xy\b/g, 'I_{xy}')
                .replace(/\bV_th\b/g, 'V_{\\text{th}}')
                .replace(/\bR_th\b/g, 'R_{\\text{th}}')
                .replace(/\bC_eq\b/g, 'C_{\\text{eq}}')
                .replace(/\bL_eq\b/g, 'L_{\\text{eq}}')
                .replace(/\bV_s\b/g, 'V_s')
                .replace(/\bI_s\b/g, 'I_s')
                .replace(/\bZ_in\b/g, 'Z_{\\text{in}}')
                .replace(/\bE_b\b/g, 'E_b')
                .replace(/\bn_sync\b/g, 'n_{\\text{sync}}')
                .replace(/\bF_x\b/g, 'F_x')
                .replace(/\bF_y\b/g, 'F_y')
                .replace(/\bF_n\b/g, 'F_n')
                .replace(/\bF_c\b/g, 'F_c')
                .replace(/\bF_R\b/g, 'F_R')
                .replace(/\bF_H\b/g, 'F_H')
                .replace(/\bF_V\b/g, 'F_V')
                .replace(/\bR_Ax\b/g, 'R_{Ax}')
                .replace(/\bR_Ay\b/g, 'R_{Ay}')
                .replace(/\bR_By\b/g, 'R_{By}')
                .replace(/\ba_t\b/g, 'a_t')
                .replace(/\ba_n\b/g, 'a_n')
                .replace(/\ba_c\b/g, 'a_c')
                .replace(/\bv_A2\b/g, 'v_{A2}')
                .replace(/\bv_B2\b/g, 'v_{B2}')
                .replace(/\bv_1'\b/g, "v_1'")
                .replace(/\bv_2'\b/g, "v_2'")
                .replace(/\bv_A\b/g, 'v_A')
                .replace(/\bv_B\b/g, 'v_B')
                .replace(/\bv_1\b/g, 'v_1')
                .replace(/\bv_2\b/g, 'v_2')
                .replace(/\bQ_1\b/g, 'Q_1')
                .replace(/\bQ_2\b/g, 'Q_2')
                .replace(/\bP_gauge\b/g, 'P_{\\text{gauge}}')
                .replace(/\bP_abs\b/g, 'P_{\\text{abs}}')
                .replace(/\bP_1\b/g, 'P_1')
                .replace(/\bP_2\b/g, 'P_2')
                .replace(/\bh_p\b/g, 'h_p')
                .replace(/\bh_f\b/g, 'h_f')
                .replace(/\bh_c\b/g, 'h_c')
                .replace(/\by_cp\b/g, 'y_{cp}')
                .replace(/\bW_L\b/g, 'W_L')
                .replace(/\bW_α\b/g, 'W_\\alpha')
                .replace(/\bt_1\/2\b/g, 't_{1/2}')
                .replace(/10\^([0-9\-]+)/g, '10^{$1}')
                .replace(/(?<=\d|\))\s*m\/s\^2\b/g, '\\text{ m/s}^2')
                .replace(/(?<=\d|\))\s*rad\/s\^2\b/g, '\\text{ rad/s}^2')
                .replace(/(?<=\d|\))\s*rad\/s\b/g, '\\text{ rad/s}')
                .replace(/(?<=\d|\))\s*m\/s\b/g, '\\text{ m/s}')
                .replace(/(?<=\d|\))\s*m\^3\/s\b/g, '\\text{ m}^3/\\text{s}')
                .replace(/(?<=\d|\))\s*m\^4\b/g, '\\text{ m}^4')
                .replace(/(?<=\d|\))\s*mm\^4\b/g, '\\text{ mm}^4')
                .replace(/(?<=\d|\))\s*mm\^3\b/g, '\\text{ mm}^3')
                .replace(/(?<=\d|\))\s*kJ\/m³\b/g, '\\text{ kJ/m}^3')
                .replace(/(?<=\d|\))\s*MJ\/m³\b/g, '\\text{ MJ/m}^3')
                .replace(/(?<=\d|\))\s*kg\/m³\b/g, '\\text{ kg/m}^3')
                .replace(/(?<=\d|\))\s*kg\/m\^3\b/g, '\\text{ kg/m}^3')
                .replace(/(?<=\d|\))\s*kg·m\^2\b/g, '\\text{ kg}\\cdot\\text{m}^2')
                .replace(/(?<=\d|\))\s*kN·m\b/g, '\\text{ kN}\\cdot\\text{m}')
                .replace(/(?<=\d|\))\s*N·m\b/g, '\\text{ N}\\cdot\\text{m}')
                .replace(/(?<=\d|\))\s*kN\/m\b/g, '\\text{ kN/m}')
                .replace(/(?<=\d|\))\s*N\/m\b/g, '\\text{ N/m}')
                .replace(/(?<=\d|\))\s*kN\b/g, '\\text{ kN}')
                .replace(/(?<=\d|\))\s*MN\b/g, '\\text{ MN}')
                .replace(/(?<=\d|\))\s*MPa\b/g, '\\text{ MPa}')
                .replace(/(?<=\d|\))\s*kPa\b/g, '\\text{ kPa}')
                .replace(/(?<=\d|\))\s*GPa\b/g, '\\text{ GPa}')
                .replace(/(?<=\d|\))\s*Pa·s\b/g, '\\text{ Pa}\\cdot\\text{s}')
                .replace(/(?<=\d|\))\s*Pa\b/g, '\\text{ Pa}')
                .replace(/(?<=\d|\))\s*mm\b/g, '\\text{ mm}')
                .replace(/(?<=\d|\))\s*km\/h\b/g, '\\text{ km/h}')
                .replace(/(?<=\d|\))\s*Hz\b/g, '\\text{ Hz}')
                .replace(/(?<=\d|\))\s*rpm\b/g, '\\text{ rpm}')
                .replace(/(?<=\d|\))\s*kJ\b/g, '\\text{ kJ}')
                .replace(/(?<=\d|\))\s*MJ\b/g, '\\text{ MJ}')
                .replace(/(?<=\d|\))\s*J\b/g, '\\text{ J}')
                .replace(/(?<=\d|\))\s*kW\b/g, '\\text{ kW}')
                .replace(/(?<=\d|\))\s*MW\b/g, '\\text{ MW}')
                .replace(/(?<=\d|\))\s*W\b/g, '\\text{ W}')
                .replace(/(?<=\d|\))\s*μF\b/g, '\\mu\\text{F}')
                .replace(/(?<=\d|\))\s*mH\b/g, '\\text{mH}')
                .replace(/(?<=\d|\))\s*Ω\b/g, '\\ \\Omega')
                .replace(/(?<=\d)°/g, '^\\circ')
                .replace(/,\s+/g, ',\\quad ');

            return `${prefix}$${latex}$${suffix}`;
        });

        return processed;
    }

    // Helper to format solved example solution text
    function formatSolvedExampleSolution(html) {
        if (!html || typeof html !== 'string') return '';
        return html.replace(/(<span class="[^"]*text-emerald-300 font-bold[^"]*">\s*\(([A-D])\)\s*)([^<]+)(<\/span>)/g, (fullMatch, prefix, letter, content, suffix) => {
            let trimmed = content.trim();
            if (trimmed.includes('$')) return fullMatch;
            const englishWords = (trimmed.match(/\b[a-zA-Z]{3,}\b/g) || []).filter(w => !/^(rad|rpm|sec|min|deg|avg|max|min|solid|hollow|sync|gauge|abs|amp)$/i.test(w));
            if (englishWords.length >= 4) return fullMatch;
            if (!/[=\^_×⁻²³ζωστδαθλρμΩ°]/.test(trimmed) && !/^\s*[-+]?\d+(?:\.\d+)?\s*[a-zA-Z/°Ω·%]*\s*$/.test(trimmed) && !/[a-zA-Z]_[a-zA-Z0-9]/.test(trimmed)) {
                return fullMatch;
            }
            let latex = trimmed
                .replace(/ζ/g, '\\zeta')
                .replace(/ω_d/g, '\\omega_d')
                .replace(/ω_0/g, '\\omega_0')
                .replace(/ω/g, '\\omega')
                .replace(/σ_avg/g, '\\sigma_{\\text{avg}}')
                .replace(/σ_max/g, '\\sigma_{\\max}')
                .replace(/σ_min/g, '\\sigma_{\\min}')
                .replace(/σ_h/g, '\\sigma_h')
                .replace(/σ_l/g, '\\sigma_l')
                .replace(/σ_1/g, '\\sigma_1')
                .replace(/σ_2/g, '\\sigma_2')
                .replace(/σ_T/g, '\\sigma_T')
                .replace(/σ_E/g, '\\sigma_E')
                .replace(/σ/g, '\\sigma')
                .replace(/τ_max/g, '\\tau_{\\max}')
                .replace(/τ_y/g, '\\tau_y')
                .replace(/τ/g, '\\tau')
                .replace(/δ/g, '\\delta')
                .replace(/Δd/g, '\\Delta d')
                .replace(/ΔM/g, '\\Delta M')
                .replace(/Δh/g, '\\Delta h')
                .replace(/ΔP_f/g, '\\Delta P_f')
                .replace(/ΔP/g, '\\Delta P')
                .replace(/Δ/g, '\\Delta ')
                .replace(/α/g, '\\alpha')
                .replace(/θ/g, '\\theta')
                .replace(/λ/g, '\\lambda')
                .replace(/ρ/g, '\\rho')
                .replace(/μ_app/g, '\\mu_{\\text{app}}')
                .replace(/μ_p/g, '\\mu_p')
                .replace(/με/g, '\\ \\mu\\epsilon')
                .replace(/μ/g, '\\mu')
                .replace(/ε_T/g, '\\epsilon_T')
                .replace(/ε_E/g, '\\epsilon_E')
                .replace(/×/g, '\\times ')
                .replace(/≈/g, '\\approx ')
                .replace(/·/g, '\\cdot ')
                .replace(/\bI_solid\b/g, 'I_{\\text{solid}}')
                .replace(/\bI_hollow\b/g, 'I_{\\text{hollow}}')
                .replace(/\bI_G\b/g, 'I_G')
                .replace(/\bI_O\b/g, 'I_O')
                .replace(/\bI_x\b/g, 'I_x')
                .replace(/\bI_y\b/g, 'I_y')
                .replace(/\bI_xy\b/g, 'I_{xy}')
                .replace(/\bV_th\b/g, 'V_{\\text{th}}')
                .replace(/\bR_th\b/g, 'R_{\\text{th}}')
                .replace(/\bC_eq\b/g, 'C_{\\text{eq}}')
                .replace(/\bL_eq\b/g, 'L_{\\text{eq}}')
                .replace(/\bV_s\b/g, 'V_s')
                .replace(/\bI_s\b/g, 'I_s')
                .replace(/\bZ_in\b/g, 'Z_{\\text{in}}')
                .replace(/\bE_b\b/g, 'E_b')
                .replace(/\bn_sync\b/g, 'n_{\\text{sync}}')
                .replace(/\bF_x\b/g, 'F_x')
                .replace(/\bF_y\b/g, 'F_y')
                .replace(/\bF_n\b/g, 'F_n')
                .replace(/\bF_c\b/g, 'F_c')
                .replace(/\bF_R\b/g, 'F_R')
                .replace(/\bF_H\b/g, 'F_H')
                .replace(/\bF_V\b/g, 'F_V')
                .replace(/\bR_Ax\b/g, 'R_{Ax}')
                .replace(/\bR_Ay\b/g, 'R_{Ay}')
                .replace(/\bR_By\b/g, 'R_{By}')
                .replace(/\ba_t\b/g, 'a_t')
                .replace(/\ba_n\b/g, 'a_n')
                .replace(/\ba_c\b/g, 'a_c')
                .replace(/\bv_A2\b/g, 'v_{A2}')
                .replace(/\bv_B2\b/g, 'v_{B2}')
                .replace(/\bv_1'\b/g, "v_1'")
                .replace(/\bv_2'\b/g, "v_2'")
                .replace(/\bv_A\b/g, 'v_A')
                .replace(/\bv_B\b/g, 'v_B')
                .replace(/\bv_1\b/g, 'v_1')
                .replace(/\bv_2\b/g, 'v_2')
                .replace(/\bQ_1\b/g, 'Q_1')
                .replace(/\bQ_2\b/g, 'Q_2')
                .replace(/\bP_gauge\b/g, 'P_{\\text{gauge}}')
                .replace(/\bP_abs\b/g, 'P_{\\text{abs}}')
                .replace(/\bP_1\b/g, 'P_1')
                .replace(/\bP_2\b/g, 'P_2')
                .replace(/\bh_p\b/g, 'h_p')
                .replace(/\bh_f\b/g, 'h_f')
                .replace(/\bh_c\b/g, 'h_c')
                .replace(/\by_cp\b/g, 'y_{cp}')
                .replace(/\bW_L\b/g, 'W_L')
                .replace(/\bW_α\b/g, 'W_\\alpha')
                .replace(/\bt_1\/2\b/g, 't_{1/2}')
                .replace(/10\^([0-9\-]+)/g, '10^{$1}')
                .replace(/(?<=\d|\))\s*m\/s\^2\b/g, '\\text{ m/s}^2')
                .replace(/(?<=\d|\))\s*rad\/s\^2\b/g, '\\text{ rad/s}^2')
                .replace(/(?<=\d|\))\s*rad\/s\b/g, '\\text{ rad/s}')
                .replace(/(?<=\d|\))\s*m\/s\b/g, '\\text{ m/s}')
                .replace(/(?<=\d|\))\s*m\^3\/s\b/g, '\\text{ m}^3/\\text{s}')
                .replace(/(?<=\d|\))\s*m\^4\b/g, '\\text{ m}^4')
                .replace(/(?<=\d|\))\s*mm\^4\b/g, '\\text{ mm}^4')
                .replace(/(?<=\d|\))\s*mm\^3\b/g, '\\text{ mm}^3')
                .replace(/(?<=\d|\))\s*kJ\/m³\b/g, '\\text{ kJ/m}^3')
                .replace(/(?<=\d|\))\s*MJ\/m³\b/g, '\\text{ MJ/m}^3')
                .replace(/(?<=\d|\))\s*kg\/m³\b/g, '\\text{ kg/m}^3')
                .replace(/(?<=\d|\))\s*kg\/m\^3\b/g, '\\text{ kg/m}^3')
                .replace(/(?<=\d|\))\s*kg·m\^2\b/g, '\\text{ kg}\\cdot\\text{m}^2')
                .replace(/(?<=\d|\))\s*kN·m\b/g, '\\text{ kN}\\cdot\\text{m}')
                .replace(/(?<=\d|\))\s*N·m\b/g, '\\text{ N}\\cdot\\text{m}')
                .replace(/(?<=\d|\))\s*kN\/m\b/g, '\\text{ kN/m}')
                .replace(/(?<=\d|\))\s*N\/m\b/g, '\\text{ N/m}')
                .replace(/(?<=\d|\))\s*kN\b/g, '\\text{ kN}')
                .replace(/(?<=\d|\))\s*MN\b/g, '\\text{ MN}')
                .replace(/(?<=\d|\))\s*MPa\b/g, '\\text{ MPa}')
                .replace(/(?<=\d|\))\s*kPa\b/g, '\\text{ kPa}')
                .replace(/(?<=\d|\))\s*GPa\b/g, '\\text{ GPa}')
                .replace(/(?<=\d|\))\s*Pa·s\b/g, '\\text{ Pa}\\cdot\\text{s}')
                .replace(/(?<=\d|\))\s*Pa\b/g, '\\text{ Pa}')
                .replace(/(?<=\d|\))\s*mm\b/g, '\\text{ mm}')
                .replace(/(?<=\d|\))\s*km\/h\b/g, '\\text{ km/h}')
                .replace(/(?<=\d|\))\s*Hz\b/g, '\\text{ Hz}')
                .replace(/(?<=\d|\))\s*rpm\b/g, '\\text{ rpm}')
                .replace(/(?<=\d|\))\s*kJ\b/g, '\\text{ kJ}')
                .replace(/(?<=\d|\))\s*MJ\b/g, '\\text{ MJ}')
                .replace(/(?<=\d|\))\s*J\b/g, '\\text{ J}')
                .replace(/(?<=\d|\))\s*kW\b/g, '\\text{ kW}')
                .replace(/(?<=\d|\))\s*MW\b/g, '\\text{ MW}')
                .replace(/(?<=\d|\))\s*W\b/g, '\\text{ W}')
                .replace(/(?<=\d|\))\s*μF\b/g, '\\mu\\text{F}')
                .replace(/(?<=\d|\))\s*mH\b/g, '\\text{mH}')
                .replace(/(?<=\d|\))\s*Ω\b/g, '\\ \\Omega')
                .replace(/(?<=\d)°/g, '^\\circ')
                .replace(/,\s+/g, ',\\quad ');

            return `${prefix}$${latex}$${suffix}`;
        });
    }

    function toggleSolvedExample(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        const overlay = document.getElementById('fc-video-example-overlay');
        const questionEl = document.getElementById('fc-video-example-question');
        const video = document.getElementById('fc-back-video');
        const karaokeBox = document.getElementById('fc-karaoke-box');

        if (!overlay) return;
        const isHidden = overlay.classList.contains('hidden');

        if (isHidden) {
            overlay.classList.remove('hidden');
            // Pause video and hide captions if playing
            if (video && !video.paused) {
                video.pause();
            }
            if (karaokeBox) karaokeBox.classList.add('hidden');
            triggerMathTypeset([questionEl]);
            setTimeout(() => triggerMathTypeset([questionEl]), 60);
            setTimeout(() => triggerMathTypeset([questionEl]), 220);
        } else {
            overlay.classList.add('hidden');
        }
    }

    function toggleSolvedExampleSolution(e) {
        if (e && e.stopPropagation) e.stopPropagation();
        const solution = document.getElementById('fc-video-example-solution');
        const btnLabel = document.getElementById('fc-solution-btn-label');

        if (!solution) return;
        const isHidden = solution.classList.contains('hidden');

        if (isHidden) {
            solution.classList.remove('hidden');
            if (btnLabel) btnLabel.textContent = 'Hide Solution';
            triggerMathTypeset([solution]);
            setTimeout(() => triggerMathTypeset([solution]), 60);
            setTimeout(() => triggerMathTypeset([solution]), 220);
            setTimeout(() => {
                if (solution && typeof solution.scrollIntoView === 'function') {
                    solution.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 50);
        } else {
            solution.classList.add('hidden');
            if (btnLabel) btnLabel.textContent = 'Show me the Solution';
        }
    }

    // Typeset math helper
    function triggerMathTypeset(elements) {
        const els = (elements || []).filter(el => el && el.nodeType === 1);
        if (els.length === 0) return;

        if (typeof window.safeTypesetMath === 'function') {
            window.safeTypesetMath(els);
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            try {
                if (typeof window.MathJax.typesetClear === 'function') {
                    window.MathJax.typesetClear(els);
                }
                window.MathJax.typesetPromise(els).catch(err => console.warn('MathJax notice:', err));
            } catch (e) {}
        }
    }

    
    // Autoplay flashcard video with robust browser policy fallback
    function playBackVideo() {
        const video = document.getElementById('fc-back-video');
        if (!video) return;

        const card = currentDeck && currentDeck[currentIndex];
        if (!card || !card.videoUrl) return;
        if (activeMediaTab !== 'video') return;

        const attemptPlay = () => {
            const modal = document.getElementById('fe-flashcards-modal');
            if (!modal || modal.classList.contains('hidden')) return;

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(err => {
                    // Browser prevented unmuted autoplay; mute and retry playback
                    video.muted = true;
                    video.play().catch(() => {});
                });
            }
        };

        if (video.readyState >= 2) {
            attemptPlay();
        } else {
            video.addEventListener('canplay', attemptPlay, { once: true });
            attemptPlay();
        }
    }

    // Set active media tab (Option A: Switch between Video and Blueprint Diagram)
    function setMediaTab(tab) {
        activeMediaTab = tab;
        const videoContainer = document.getElementById('fc-back-video-container');
        const imageContainer = document.getElementById('fc-back-image-container');
        const btnVideo = document.getElementById('fc-toggle-btn-video');
        const btnBlueprint = document.getElementById('fc-toggle-btn-blueprint');
        const subtext = document.getElementById('fc-media-subtext');
        const video = document.getElementById('fc-back-video');
        const badge = document.getElementById('fc-back-video-duration');

        if (tab === 'blueprint') {
            if (videoContainer) videoContainer.classList.add('hidden');
            if (imageContainer) imageContainer.classList.remove('hidden');
            if (subtext) subtext.textContent = 'Click diagram to zoom in full resolution';
            if (badge) badge.textContent = 'HD CAD';

            if (btnBlueprint) {
                btnBlueprint.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm';
            }
            if (btnVideo) {
                btnVideo.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-slate-200';
            }
            if (video) video.pause();
        } else {
            if (imageContainer) imageContainer.classList.add('hidden');
            if (videoContainer) videoContainer.classList.remove('hidden');
            if (subtext) subtext.textContent = 'Autoplays instantly • Tap for controls';

            const card = currentDeck[currentIndex];
            if (badge) badge.textContent = (card && card.videoDuration) || '10s';

            if (btnVideo) {
                btnVideo.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm';
            }
            if (btnBlueprint) {
                btnBlueprint.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-slate-200';
            }
            playBackVideo();
        }
        updateKaraokeUI();
    }

            // =========================================================================
    // In-Video Karaoke Captions Engine
    // =========================================================================
    // Default to OFF unless explicitly activated by the user
    let karaokeActive = localStorage.getItem('engg_fc_karaoke') === 'true';
    let currentActiveCueIndex = -1;

    function toggleKaraokeCaptions() {
        karaokeActive = !karaokeActive;
        try { localStorage.setItem('engg_fc_karaoke', karaokeActive); } catch (e) {}
        updateKaraokeUI();
    }

    /**
     * Retrieves precision captions or dynamically generates karaoke cues on-the-fly
     * for any 10-second NCEES theorem explainer video across all disciplines.
     */
    function getCardCaptions(card) {
        if (!card || !card.videoUrl) return [];
        if (card.captions && Array.isArray(card.captions) && card.captions.length > 0) {
            return card.captions;
        }

        const cues = [];
        const dur = 10.0;

        // Phase 1 (0.0s - 4.4s): Concept & Core Principle
        let p1Text = card.title || '';
        if (card.description) {
            const rawSentence = card.description.split('.')[0].trim();
            p1Text = `${card.title}: ${rawSentence}.`;
        }
        const words1 = p1Text.split(/\s+/).filter(Boolean);
        const p1Duration = 4.4;
        const wDur1 = p1Duration / Math.max(words1.length, 1);
        const timedWords1 = words1.map((w, idx) => ({
            text: w,
            start: parseFloat((idx * wDur1).toFixed(2)),
            end: parseFloat(((idx + 1) * wDur1).toFixed(2))
        }));
        cues.push({
            start: 0.0,
            end: 4.4,
            words: timedWords1
        });

        // Phase 2 (4.4s - 7.6s): Governing Formula (displayed in live MathJax without word-splitting)
        if (card.formula) {
            cues.push({
                start: 4.4,
                end: 7.6,
                isEquation: true,
                text: card.formula
            });
        }

        // Phase 3 (7.6s - 10.0s): NCEES Exam Trap & Key Tip
        let p3Text = card.examTip || 'Found in NCEES FE Reference Handbook. Review core assumptions!';
        const cleanTip = p3Text.replace(/^Search NCEES Handbook under [^.]*\.\s*/i, '').trim();
        const tipSentence = cleanTip.split('.')[0] || cleanTip;
        const p3Display = `Exam Tip: ${tipSentence}!`;
        const words3 = p3Display.split(/\s+/).filter(Boolean);
        const p3Start = card.formula ? 7.6 : 4.6;
        const p3Duration = dur - p3Start;
        const wDur3 = p3Duration / Math.max(words3.length, 1);
        const timedWords3 = words3.map((w, idx) => ({
            text: w,
            start: parseFloat((p3Start + idx * wDur3).toFixed(2)),
            end: parseFloat((p3Start + (idx + 1) * wDur3).toFixed(2))
        }));
        cues.push({
            start: p3Start,
            end: dur,
            words: timedWords3
        });

        return cues;
    }

    function updateKaraokeUI() {
        const btn = document.getElementById('fc-btn-toggle-captions');
        const statusText = document.getElementById('fc-caption-status-text');
        const overlay = document.getElementById('fc-video-caption-overlay');
        const box = document.getElementById('fc-karaoke-box');
        const card = currentDeck[currentIndex];
        const captions = getCardCaptions(card);
        const hasCaptions = Boolean(card && card.videoUrl && captions.length > 0);

        if (!hasCaptions || activeMediaTab !== 'video') {
            if (btn) {
                btn.classList.add('hidden');
                btn.classList.remove('flex');
            }
            if (overlay) overlay.classList.add('hidden');
            if (box) box.classList.add('hidden');
            return;
        }

        if (btn) {
            btn.classList.remove('hidden');
            btn.classList.add('flex');
            if (karaokeActive) {
                btn.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer shadow-sm';
                if (statusText) statusText.textContent = 'CC On';
            } else {
                btn.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 cursor-pointer';
                if (statusText) statusText.textContent = 'CC Off';
            }
        }

        if (overlay) {
            if (karaokeActive) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
                if (box) box.classList.add('hidden');
            }
        }
    }

    function initKaraokeCues(card) {
        currentActiveCueIndex = -1;
        const textEl = document.getElementById('fc-karaoke-text');
        const box = document.getElementById('fc-karaoke-box');
        if (textEl) textEl.innerHTML = '';
        if (box) box.classList.add('hidden');
        updateKaraokeUI();
    }

    function renderKaraokeCue(cue, cueIndex) {
        currentActiveCueIndex = cueIndex;
        const textEl = document.getElementById('fc-karaoke-text');
        const box = document.getElementById('fc-karaoke-box');
        if (!textEl || !box) return;

        box.classList.remove('hidden');

        if (cue.isEquation) {
            // Presenter is showing/stating the equation: render full MathJax formula with Apple dock badge
            textEl.innerHTML = `<div class="inline-flex items-center gap-2.5 py-0.5 px-2 font-mono tracking-wide text-sm sm:text-base text-cyan-300"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/35 shadow-sm">NCEES Equation</span><span>${cue.text}</span></div>`;
            triggerMathTypeset([textEl]);
        } else if (cue.words && Array.isArray(cue.words)) {
            // Render Karaoke words
            textEl.innerHTML = cue.words.map((w, idx) => {
                return `<span class="fc-karaoke-word" data-idx="${idx}" data-start="${w.start}" data-end="${w.end}">${w.text}</span>`;
            }).join(' ');
        } else if (cue.text) {
            textEl.textContent = cue.text;
        }
    }

    function wireKaraokeVideoEvents() {
        const video = document.getElementById('fc-back-video');
        if (!video || video._karaokeWired) return;
        video._karaokeWired = true;

        video.addEventListener('timeupdate', () => {
            const card = currentDeck[currentIndex];
            const overlay = document.getElementById('fc-video-caption-overlay');
            const box = document.getElementById('fc-karaoke-box');
            const textEl = document.getElementById('fc-karaoke-text');
            const captions = getCardCaptions(card);

            if (!card || !card.videoUrl || captions.length === 0 || !karaokeActive) {
                if (box) box.classList.add('hidden');
                return;
            }

            const t = video.currentTime;
            const newIndex = captions.findIndex(c => t >= c.start && t < c.end);

            if (newIndex === -1) {
                currentActiveCueIndex = -1;
                if (box) box.classList.add('hidden');
                return;
            }

            const activeCue = captions[newIndex];

            // If cue index changed, rebuild the cue content
            if (newIndex !== currentActiveCueIndex) {
                renderKaraokeCue(activeCue, newIndex);
            }

            // If cue has words, update the instant Karaoke highlight
            if (activeCue.words && textEl) {
                const wordSpans = textEl.querySelectorAll('.fc-karaoke-word');
                wordSpans.forEach(span => {
                    const start = parseFloat(span.dataset.start);
                    const end = parseFloat(span.dataset.end);
                    if (t < start) {
                        span.className = 'fc-karaoke-word';
                    } else if (t >= start && t < end) {
                        span.className = 'fc-karaoke-word is-active';
                    } else {
                        span.className = 'fc-karaoke-word is-spoken';
                    }
                });
            }
        });
    }

    // Open Blueprint Lightbox
    function openBlueprintLightbox() {
        const card = currentDeck[currentIndex];
        if (!card || !card.imageUrl) return;
        const lightbox = document.getElementById('fc-blueprint-lightbox');
        const img = document.getElementById('fc-lightbox-img');
        const title = document.getElementById('fc-lightbox-title');
        if (img) img.src = card.imageUrl;
        if (title) {
            title.innerHTML = `<span class="material-symbols-outlined text-[18px]">architecture</span><span>${card.imageTitle || card.title || 'Technical Blueprint Diagram'}</span>`;
        }
        if (lightbox) {
            lightbox.classList.remove('hidden');
            lightbox.classList.add('flex');
        }
    }

    // Close Blueprint Lightbox
    function closeBlueprintLightbox() {
        const lightbox = document.getElementById('fc-blueprint-lightbox');
        if (lightbox) {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
        }
    }

    // Flip action (Direct view: no-op)
    function flipCard() {
        // Direct back-side view: no flip action needed
    }

    // Previous card action
    function prevCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
        renderCard();
    }

    // Next card action
    function nextCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        currentIndex = (currentIndex + 1) % currentDeck.length;
        renderCard();
    }

    // Shuffle deck
    function shuffleCards() {
        if (currentDeck.length <= 1) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
        }
        currentIndex = 0;
        renderCard();
    }

    // Open Flashcard Studio Modal
    function openFlashcardStudio(disc, mode, subjectFilter) {
        currentDiscipline = disc || currentDiscipline;
        currentMode = mode || currentMode;
        if (typeof subjectFilter !== 'undefined') {
            currentSubjectFilter = subjectFilter;
        }

        const actualDisc = (currentDiscipline === 'current' || !currentDiscipline) 
            ? getActiveDiscipline() 
            : currentDiscipline;
        if (actualDisc === 'all' || !DISCIPLINE_SUBJECT_CONFIG[actualDisc]) {
            currentSubjectFilter = 'all';
        }

        currentDeck = buildSessionQueue(currentDiscipline, currentMode, currentSubjectFilter);
        currentIndex = 0;
        isFlipped = true;

        // Immediately preload first 8 cards in this session
        if (currentDeck && currentDeck.length > 0) {
            for (let i = 0; i < Math.min(8, currentDeck.length); i++) {
                if (currentDeck[i].imageUrl) preloadCardImage(currentDeck[i].imageUrl);
            }
        }

        const modal = document.getElementById('fe-flashcards-modal');
        const card = document.getElementById('flashcard-studio-card');
        if (!modal) return;

        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            if (card) {
                card.classList.remove('scale-95', 'opacity-0');
                card.classList.add('scale-100', 'opacity-100');
            }
        });

        // Set select values
        const discSelect = document.getElementById('fc-discipline-select');
        const modeSelect = document.getElementById('fc-mode-select');
        if (discSelect) discSelect.value = currentDiscipline;
        if (modeSelect) modeSelect.value = currentMode;

        if (actualDisc !== 'all' && DISCIPLINE_SUBJECT_CONFIG[actualDisc]) {
            const datasets = window.THEOREMS_BY_DISCIPLINE || {};
            const fullDeck = (datasets[actualDisc] || []).filter(card => Boolean(card && card.videoUrl));
            updateSubjectSelectOptions(fullDeck, actualDisc);
        }
        syncSubjectSelectVisibility();

        renderCard();
    }

    // Close Flashcard Studio Modal
    function closeFlashcardStudio() {
        const modal = document.getElementById('fe-flashcards-modal');
        const card = document.getElementById('flashcard-studio-card');
        const video = document.getElementById('fc-back-video');
        if (video) {
            video.pause();
            video.currentTime = 0;
        }

        if (modal) {
            modal.classList.add('opacity-0');
            if (card) {
                card.classList.remove('scale-100', 'opacity-100');
                card.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 250);
        }
    }

    // Attach Keyboard Hotkeys
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('fe-flashcards-modal');
        if (!modal || modal.classList.contains('hidden')) return;

        if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return;

        if (e.code === 'Escape') {
            const lb = document.getElementById('fc-blueprint-lightbox');
            if (lb && !lb.classList.contains('hidden')) {
                e.preventDefault();
                closeBlueprintLightbox();
                return;
            }
            e.preventDefault();
            closeFlashcardStudio();
        } else if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            nextCard();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            prevCard();
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            nextCard();
        }
    });

    // Wire dropdown change events
    document.addEventListener('DOMContentLoaded', () => {
        const discSelect = document.getElementById('fc-discipline-select');
        const modeSelect = document.getElementById('fc-mode-select');
        const subjectSelect = document.getElementById('fc-subject-select');

        if (discSelect) {
            discSelect.addEventListener('change', (e) => {
                currentDiscipline = e.target.value;
                currentSubjectFilter = 'all';
                openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);
            });
        }

        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                currentMode = e.target.value;
                openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);
            });
        }

        if (subjectSelect) {
            subjectSelect.addEventListener('change', (e) => {
                currentSubjectFilter = e.target.value;
                openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);
            });
        }

        window.addEventListener('resize', syncSubjectSelectVisibility);
    });

    // Re-typeset active flashcard when MathJax finishes loading asynchronously
    window.addEventListener('mathjax-ready', () => {
        const modal = document.getElementById('fe-flashcards-modal');
        if (modal && !modal.classList.contains('hidden')) {
            renderCard();
            if (isFlipped) {
                const backFormula = document.getElementById('fc-back-formula');
                const backDesc = document.getElementById('fc-back-desc');
                const backTip = document.getElementById('fc-back-tip');
                const backTitle = document.getElementById('fc-back-title');
                const backEls = [backFormula, backDesc, backTip, backTitle].filter(Boolean);
                triggerMathTypeset(backEls);
            }
        }
    });

    // Public Window API
    window.setMediaTab = setMediaTab;
    window.openBlueprintLightbox = openBlueprintLightbox;
    window.closeBlueprintLightbox = closeBlueprintLightbox;
    window.openFlashcardStudio = openFlashcardStudio;
    window.closeFlashcardStudio = closeFlashcardStudio;
    window.flipFlashcard = flipCard;
    window.prevFlashcard = prevCard;
    window.nextFlashcard = nextCard;
    window.shuffleFlashcards = shuffleCards;
    window.toggleKaraokeCaptions = toggleKaraokeCaptions;
    window.toggleTeleprompter = toggleKaraokeCaptions;
    window.toggleSolvedExample = toggleSolvedExample;
    window.toggleSolvedExampleSolution = toggleSolvedExampleSolution;
    // Backwards compatibility aliases
    window.rateFlashcard = nextCard;
    window.restartFlashcardSession = () => openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);

})();

    // Idle Background Preloader for Flashcard Blueprints
    if (typeof window !== 'undefined') {
        const idlePreloadTheorems = () => {
            try {
                const datasets = window.THEOREMS_BY_DISCIPLINE || {};
                let count = 0;
                for (const d of Object.keys(datasets)) {
                    for (const t of datasets[d]) {
                        if (t && t.imageUrl && !preloadedImageCache.has(t.imageUrl)) {
                            preloadCardImage(t.imageUrl);
                            count++;
                            if (count >= 15) return;
                        }
                    }
                }
            } catch (err) {}
        };
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(idlePreloadTheorems, { timeout: 3000 });
        } else {
            setTimeout(idlePreloadTheorems, 2000);
        }
    }
