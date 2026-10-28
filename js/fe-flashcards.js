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
        if (/powder metallurgy|electrical properties of material|non-traditional machining|non traditional machining/i.test(lower)) return 9;
        if (/types of springs|helical compression|helical torsion|belleville/i.test(lower)) return 14;
        if (/valves in fluid power|directional control valve|flow control valve|logic control valve|\bvalves\b/i.test(lower) && !/pressure relief valve sizing formula for vapor/i.test(lower)) return 14;
        if (/pneumatic system|components of a pneumatic|components of a hydraulic system/i.test(lower)) return 14;
        if (/applying boundary conditions|boundary conditions/i.test(lower)) return 1;
        if (/sustainability/i.test(lower)) return 3;
        if (/types of cash flows|cash flow/i.test(lower)) return 4;
        if (/depreciation methods|depreciation/i.test(lower)) return 4;
        if (/pneumatic system|components of a pneumatic|components of a hydraulic system/i.test(lower)) return 14;
        if (/applying boundary conditions|boundary conditions/i.test(lower)) return 1;
        if (/sustainability/i.test(lower)) return 3;
        if (/types of cash flows|cash flow/i.test(lower)) return 4;
        if (/depreciation methods|depreciation/i.test(lower)) return 4;
        if (/concept of complex numbers|complex numbers/i.test(lower)) return 1;
        if (/derivative of logarithmic|indefinite integrals/i.test(lower)) return 1;
        if (/control systems/i.test(lower)) return 13;
        // Priority overrides for new additions
        if (/methods for controlling corrosion|corrosion/i.test(lower)) return 9;
        if (/feature control frame/i.test(lower)) return 14;
        if (/ceramics/i.test(lower)) return 9;
        if (/composite plane wall|heat transfer through fins|types of convection/i.test(lower)) return 12;
        if (/fisher’s equation|fisher's equation|inflation/i.test(lower)) return 4;
        if (/dimensionless numbers/i.test(lower)) return 10;
        if (/static vs\.? kinetic friction/i.test(lower)) return 6;
        if (/elastic vs\.? inelastic collision|damped free vibrations/i.test(lower)) return 7;
        if (/third law of thermodynamics|second law of thermodynamics|mayer’s formula|meyer’s formula|meyers formula/i.test(lower)) return 11;
        if (/permutations with repetition|multinomial permutations/i.test(lower)) return 2;
        if (/elastomer|stainless steel|cast iron/i.test(lower)) return 9;
        if (/inversion of a mechanism|kinematic inversion/i.test(lower)) return 7;
        if (/forward rectangular|rectangular rule/i.test(lower)) return 1;
        if (/incremental cost/i.test(lower)) return 4;
        if (/ethical and legal|professional and technical societies/i.test(lower)) return 3;
        // 1. Mathematics
        if (/distance formula|angle between two non-vertical|slope-intercept|conic section|types of parabolas|l’hôpital|gradient vector|chain rule for differentiation|product and quotient rules|integration by parts|taylor and maclaurin|taylor series|infinite series convergence|homogeneous vs non-homogeneous|order and degree of differential|second-order linear homogeneous ode|laplace transforms|laplace transform definition|matrix multiplication|inverse of a square matrix|inverse of a matrix|vector magnitude|vector dot product|vector cross product|properties of dot|properties of cross|length of a vector|curl of a vector|divergence of a vector|newton-raphson|newton's method for root|trapezoidal rule|simpson’s 1\/3 rule|simpson's rule|algorithm|flowchart|pseudocode|quadratic equation|complex numbers:|law of sines|double-angle|arithmetic vs geometric|volumes of basic shapes|coordinates of foci and equation of directrix|maxima and minima|partial derivatives|curvature of any curve|properties of identity matrix|complementary function and particular integral/i.test(lower)) return 1;
        // 2. Probability and Statistics
        if (/geometric mean|expected value and variance of a linear combination of variables|properties of normal distribution|when to use normal distribution|general character of probability|type i and type ii|binomial distribution|standard normal distribution|probability density function|cumulative distribution|sample variance|median of a sample|mode of a sample|variance and standard deviation|sample mean and standard error|confidence intervals|student’s \$t\$-confidence|expected values|simple linear regression|correlation coefficient and coefficient|permutations and combinations|null hypothesis|student's t-distribution two-sample|one-way analysis of variance|chi-square goodness|statistical process control|2^n factorial experiments|2n factorial experiments|analysis of variance for 2^n factorial|analysis of variance for 2n factorial|exponentially weighted moving average|western electric|six sigma|bathtub failure|mean time between failures|parallel system reliability|standby redundancy/i.test(lower)) return 2;
        // 3. Ethics and Professional Practice
        if (/trademark/i.test(lower)) return 3;
        if (/paramount duty|pe seal integrity|code of ethics|safety data sheet|signal words|flammability, lfl and ufl|confined space safety|noise pollution measurements|osha|hazard quotient|excess lifetime cancer|chronic daily intake|hierarchy of controls|nfpa 704|electrical safety: gfci|hazop study|lower and upper flammability|intellectual property: patents|conflicts of interest|whistleblowing|conflict of interest|obligations of a licensed|licensed professional engineer|design patent vs utility patent|design patent|ncees model rules|ergonomic posture assessment/i.test(lower)) return 3;
        // 4. Engineering Economics
        if (/sunk cost|sunk costs|overhead rate|overhead analysis|compound interest|nominal vs\. effective annual|capitalized cost|straight-line depreciation|book value|macrs|bonds|benefit-cost|break-even production volume|internal rate of return|simple payback period|break-even analysis for make-or-buy|payback period:|sensitivity analysis|critical path method|economic order quantity|earned value management|predetermined motion time|kanban production|bill of materials|exponential smoothing|forecasting error|total productive maintenance/i.test(lower)) return 4;
        // 5. Electricity and Magnetism
        if (/coulomb’s law|coulomb's law|coulombs law|electrostatic|ohm’s law and joule|poynting vector|kirchhoff|thevenin|wheatstone bridge|first-order rc transient|first-order rc circuit time|operational amplifier|ideal operational amplifier|instrumentation amplifier|schmitt trigger|equivalent resistance in series|series rlc resonance|second-order rlc|characteristic roots and damping|equivalent capacitance and inductance|ac power triangle|three-phase induction motor|synchronous machine|dc shunt motor|ideal transformer|dc motor back-emf|specific resistance of a conductor|capacitance of a parallel plate|parallel plate capacitor/i.test(lower)) return 5;
        // 6. Statics
        if (/resolution of a force|lami's theorem|2d static equilibrium|moments \(couples\)|gravity retaining wall|free body diagram support|two-force and three-force|truss zero-force|method of joints|method of sections|parallel axis theorem \(second moment|centroid of composite|area moment of inertia|radius of gyration|product of inertia|centroid and moment of inertia for composite|centroids and area moments of inertia for standard shapes|coulomb dry friction|limiting friction/i.test(lower)) return 6;
        // 7. Dynamics, Kinematics, and Vibrations
        if (/variable acceleration rotational motion equations|constant acceleration rotational motion equations|instantaneous centers of various types of links|rotational motion|underdamped|critically damped|overdamped|coriolis|normal and tangential acceleration in curvilinear|rectilinear kinematics|constant acceleration motion|variable acceleration motion|relative motion|projectile motion|kinematics of particles: normal|uniform circular motion|kinetic friction|particle kinetics: direct|potential energy in many|kinetic energy|linear impulse and momentum|coefficient of restitution|instantaneous center of rotation|kennedy's rule|planar rigid body relative velocity|work-energy principle \(rigid body|rotational kinetic energy|mass moment of inertia of common|mass moment of inertia parallel axis|angular impulse and momentum|planar rigid body equations of motion|conservation of linear and angular momentum for colliding|sdof undamped natural frequency|damped sdof natural frequency|logarithmic decrement|vibration transmissibility/i.test(lower)) return 7;
        // 8. Mechanics of Materials
        if (/factor of safety|differential relationships between load, shear|mohr’s circle for plane stress|analytical in-plane principal stresses|generalized hooke’s law|isotropic elastic constants|elastic strain energy|cantilever sheet pile|triaxial shear|vertical stress increase beneath point loads|axial stress and elongation|poisson’s ratio|elastic flexure formula|elastic section modulus|beam flexure formula|torsion formula|polar moment of inertia|pure torsion of circular shafts|transverse shear stress in beams|shear center|maximum shear stress in rectangular cross-section|thermal expansion deformation and thermal stress|combined axial and bending|moment-area first theorem|moment-area second theorem|beam deflection differential|cantilever beam tip deflection|simply supported beam center deflection|euler’s critical buckling|slenderness ratio for steel|thin-walled pressure vessel|modulus of elasticity vs\. modulus of rigidity|transformation of composite section|theoretical effective-length factors/i.test(lower)) return 8;
        // 9. Material Properties and Processing
        if (/standard portland cement|bragg's law|engineering stress-strain vs|modulus of resilience vs|cubic crystal structures|binary eutectic phase diagram|iron-carbon microstructures|binary phase diagram lever rule|eutectic and eutectoid|gibbs phase rule|fick’s first law|fick's first law|first-order chemical reaction half-life|malleability and ductility|hardness of a material|relationship between hardness and tensile|ductile-to-brittle transition|ductile to brittle transition|amorphous materials vs. crystalline|amorphous materials vs crystalline|hardness and tensile strength|jominy hardenability|photoelectric effect|charpy and izod|thermoplastics vs|peritectic vs|failure by creep|failure by fracture|difference between quenching and annealing|intrinsic semiconductors vs extrinsic semiconductor|difference between quenching and annealing|quenching and annealing/i.test(lower)) return 9;
        // 10. Fluid Mechanics
        if (/newton's law of viscosity|newtonian vs non-newtonian|power-law|non-newtonian|surface tension|capillarity|capillary rise height|hydrostatic pressure distribution|manometers|bouyancy force|hydrostatic force on submerged curved|buoyancy and metacentric|hydrostatic center of pressure|archimedes’ principle|bernoulli’s principle|continuity equation|modified fluid energy equation|darcy-weisbach|reynolds number|schmidt number|hagen-poiseuille|moody, darcy|hydraulic diameter for non-circular|laminar flow friction factor|rapid sand filter|storm sewer gravity|hazen-williams|hardy cross|minor head losses in pipe|drag coefficient and lift|stokes' law|boundary layer displacement|speed of sound & mach|stagnation temperature|froude number and hydraulic|net positive suction head|pump hydraulic power|centrifugal pump cavitation|centrifugal pump affinity laws|pump specific speed|pitot tube|venturi meter|orifice meter|orifice discharging freely|orifice$|coagulation velocity gradient|camp-stein rapid mixing|viscosity of a fluid|impulse turbine vs|specific gravity|energy equation for steady incompressible flow|concept of head in fluid mechanics/i.test(lower)) return 10;
        // 11. Thermodynamics
        if (/ideal gas law equation|van der waals|compressibility factor|properties for two-phase|mole fraction vs\. mass fraction|zeroth law of thermodynamics|mollier chart|clausius-clapeyron|first law of thermodynamics \(closed|steady-flow energy equation|enthalpy$|carnot thermal efficiency|entropy$|exergy|clausius inequality|entropy change of ideal gases|isothermal process|le chatelier’s principle|isentropic relations for ideal|polytropic process boundary|enthalpy definition and specific heat|ideal rankine cycle|ideal otto cycle|isentropic efficiencies of turbines|gas turbine regenerator|ideal diesel cycle|ideal brayton cycle|refrigeration cycles|coefficient of performance \(cop\)|cop of refrigeration vs|vapor-compression refrigeration|psychrometric humidity ratio|psychrometric chart|dry-bulb, wet-bulb|absolute humidity vs\.|hvac processes|indoor air quality single-compartment|combustion theoretical air|excess air and theoretical|intensive vs\. extensive|universal vs\. specific gas constant|combustion of methane|steam tables|superheated water|work done in open process vs closed process|work done in open vs closed|gibbs free energy vs helmholtz free energy/i.test(lower)) return 11;
        // 12. Heat Transfer
        if (/fourier’s law of thermal conduction|critical radius of thermal insulation|extended surface fin efficiency|conduction through a plain|conduction through a cylindrical|thermal resistance of an object|newton’s law of cooling|natural convection rayleigh|pool boiling curve|condensation heat transfer|stefan-boltzmann law|radiation view factor|radiation heat exchange|black body vs\. grey|net energy exchange by radiation|biot number for transient|lumped capacitance method|biot number vs\. fourier|log mean temperature difference|overall heat transfer coefficient|effectiveness-ntu method|heat exchanger fouling/i.test(lower)) return 12;
        // 13. Measurements, Instrumentation, and Controls
        if (/strain gauge gauge factor|temperature sensors: thermocouple|first-order sensor dynamic step|second-order sensor natural frequency|open-loop step response method|laplace transform final value|closed-loop feedback control|steady-state error constants|bode plot gain margin|ce, cb and cc transistor|ce cb and cc transistor|routh-hurwitz stability|root locus construction|pid controller time-domain|process control: first-order|process control: ziegler-nichols|ratio control strategy|cascade control architecture|uncertainty|piezoelectric effect|piezoelectric/i.test(lower)) return 13;
        // 14. Mechanical Design and Analysis
        if (/types of screw threads|types of threads|screw threads|power screws|modified goodman fatigue criterion|modified goodman fatigue failure|soderberg theory|s-n fatigue curve|maximum shear stress theory|distortion energy theory|maximum normal stress theory|coulomb-mohr and modified mohr|marin factors for fatigue|helical compression spring|equivalent spring stiffness for springs in parallel and series|rolling element bearing rated|equivalent dynamic radial load|power screws lifting torque|flat belt friction|agma lewis bending|asme transmission shaft|spur gear geometry|bolted joint preload|pressure relief valve sizing|types of fits|three types of fits in manufacturing|moving average forecasting|three types of fits in manufacturing|involute gear tooth nomenclature|ansi symbols for hydraulic power|first angle vs\. third|geometric dimensioning and tolerancing|failure by fatigue/i.test(lower)) return 14;

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
        if (/ceramics/i.test(lower)) return 7;
        if (/composite plane wall/i.test(lower)) return 7;
        if (/fisher’s equation|fisher's equation|inflation/i.test(lower)) return 3;
        if (/dimensionless numbers/i.test(lower)) return 8;
        if (/static vs\.? kinetic friction/i.test(lower)) return 4;
        if (/elastic vs\.? inelastic collision|damped free vibrations/i.test(lower)) return 5;
        if (/permutations with repetition|multinomial permutations/i.test(lower)) return 1;
        if (/elastomer|stainless steel|cast iron/i.test(lower)) return 7;
        if (/inversion of a mechanism|kinematic inversion/i.test(lower)) return 5;
        if (/forward rectangular|rectangular rule/i.test(lower)) return 1;
        if (/incremental cost/i.test(lower)) return 3;
        if (/ethical and legal|professional and technical societies/i.test(lower)) return 2;
        if (/geometric mean/i.test(lower)) return 1;
        if (/law of cosines|law of sines|trigonometric/i.test(lower)) return 1;
        if (/fourier/i.test(lower)) return 1;
        if (/plastic section modulus and shape factor/i.test(lower)) return 11;
        if (/total float and free float in activity networks|bill of materials explosion tree/i.test(lower)) return 14;
        if (/mass haul diagram|first angle vs\. third angle/i.test(lower)) return 14;
        if (/osha soil classifications|construction equipment fleet productivity|osha permissible noise/i.test(lower)) return 14;
        if (/lrfd load combinations|wind load design velocity pressure/i.test(lower)) return 11;
        if (/standard portland cement types|binary phase diagram lever rule|concrete maturity method|hardness of a material/i.test(lower)) return 7;
        if (/type iii zone settling|solution concentration: molarity/i.test(lower)) return 10;
        if (/modified goodman fatigue|strain gauge gauge factor|distortion energy theory|coulomb-mohr and modified mohr failure criteria/i.test(lower)) return 6;
        if (/hazard quotient|hazard index/i.test(lower)) return 10;
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
        if (/trademark/i.test(lower)) return 2;
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
        if (/ceramics/i.test(lower)) return 11;
        if (/composite plane wall|heat transfer through fins|types of convection|third law of thermodynamics|second law of thermodynamics|mayer’s formula|meyer’s formula|meyers formula/i.test(lower)) return 14;
        if (/fisher’s equation|fisher's equation|inflation/i.test(lower)) return 7;
        if (/dimensionless numbers/i.test(lower)) return 12;
        if (/static vs\.? kinetic friction/i.test(lower)) return 8;
        if (/elastic vs\.? inelastic collision|damped free vibrations/i.test(lower)) return 9;
        if (/permutations with repetition|multinomial permutations/i.test(lower)) return 2;
        if (/elastomer|stainless steel|cast iron/i.test(lower)) return 11;
        if (/inversion of a mechanism|kinematic inversion/i.test(lower)) return 9;
        if (/forward rectangular|rectangular rule/i.test(lower)) return 1;
        if (/incremental cost/i.test(lower)) return 7;
        if (/ethical and legal|professional and technical societies/i.test(lower)) return 5;
        if (/coulomb’s law|coulomb's law|coulombs law/i.test(lower)) return 13;
        if (/geometric mean/i.test(lower)) return 2;
        if (/law of cosines|law of sines|trigonometric/i.test(lower)) return 1;
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
        if (/galvanic cell|nernst equation|faraday’s law of electrolysis|oxidation|reduction|redox|molarity, molality|solution concentration|ph scale|acids? and bases?|buffer|periodic table|chemical equilibrium constant|chemical compatibility|first-order chemical reaction half-life|photosynthesis|alcohols|selected rules of nomenclature in organic chemistry: alcohols|selected rules of nomenclature in organic chemistry|cellular biology|aldehydes and ketones|alkanes, alkenes, alkynes|ethers, carboxylic/i.test(lower)) return 3;

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
        if (/newton's law of viscosity|power-law|non-newtonian|surface tension|capillarity|capillary rise height|drag coefficient and lift|reynolds number|schmidt number|speed of sound & mach|hydrostatic pressure distribution|buoyancy and metacentric|hydrostatic center of pressure|archimedes’ principle|bernoulli’s principle|continuity equation|linear impulse-momentum for fluid|modified fluid energy equation|darcy-weisbach|hydraulic diameter for non-circular|laminar flow friction factor|minor head losses in pipe|manning’s equation|pitot tube|venturi meter|orifice meter|orifice discharging freely|net positive suction head|pump hydraulic power|centrifugal pump affinity laws|pump specific speed|viscosity of a fluid|impulse turbine vs/i.test(lower) || (/fluid/i.test(tip) && !/universal vs\. specific gas constant/i.test(lower))) return 12;

        // 13. Basic Electrical Engineering
        if (/ohm’s law and joule|kirchhoff|first-order rc transient|equivalent resistance in series|series rlc resonance|second-order rlc|characteristic roots and damping|equivalent capacitance and inductance|ac power triangle|wheatstone bridge|thevenin’s equivalent|norton’s equivalent|norton's equivalent|norton|poynting vector|ideal transformer|three-phase induction motor|dc motor back-emf|specific resistance of a conductor/i.test(lower) || /electrical/i.test(tip)) return 13;

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
    if (/forward rectangular|rectangular rule/i.test(lower)) return 1;
    if (/incremental cost/i.test(lower)) return 4;
    if (/ethical and legal|professional and technical societies/i.test(lower)) return 3;
    if (/geometric mean/i.test(lower)) return 2;
    if (/law of cosines|law of sines|trigonometric/i.test(lower)) return 1;
    if (/attenuation constant and phase constant/i.test(lower)) return 11;
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

    // Overrides
    if (/elastomer|stainless steel|cast iron/i.test(lower)) return 4;
    if (/inversion of a mechanism|kinematic inversion/i.test(lower)) return 3;
    if (/forward rectangular|rectangular rule/i.test(lower)) return 1;
    if (/incremental cost/i.test(lower)) return 13;
    if (/ethical and legal|professional and technical societies/i.test(lower)) return 16;
    if (/law of cosines|law of sines|trigonometric/i.test(lower)) return 1;

    // 16. Safety, Health, and Environment
    if (/hazard quotient|hazard index|gaussian plume|pressure relief valve sizing|hazop|flammability limits|lower and upper flammability|threshold limit value|toxic vapor dispersion|nfpa 704|hierarchy of controls|osha|safety/i.test(lower) || /process safety|safety/i.test(tip)) {
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

    // Overrides
    if (/elastomer|stainless steel|cast iron/i.test(lower)) return 5;
    if (/forward rectangular|rectangular rule/i.test(lower)) return 1;
    if (/incremental cost/i.test(lower)) return 4;
    if (/ethical and legal|professional and technical societies/i.test(lower)) return 3;
    if (/geometric mean/i.test(lower)) return 2;
    if (/law of cosines|law of sines|trigonometric/i.test(lower)) return 1;

    // 14. Environmental Health and Safety
    if (/environmental health|industrial hygiene|radiation protection|toxicology|noise|osha/i.test(tip) ||
        /sound pressure level|decibel addition|noise reduction coefficient|dosimetry|dose-response|ld50|carcinogenic risk|hazard index|hazard quotient|reference dose|radiation half-life|absorbed dose|sievert|gray|\brad\b|\brem\b|osha permissible exposure|time-weighted average twa/i.test(lower)) {
        return 14;
    }

    // 13. Groundwater and Soils
    if (/hydrogeology|groundwater|subsurface|soil remediation|geotechnical/i.test(tip) ||
        /darcy’s law for groundwater|hydraulic conductivity|transmissivity|theis equation|cooper-jacob|dupuit|unconfined aquifer|confined aquifer|drawdown|well cone of depression|retardation factor|contaminant transport|dispersion coefficient|soil vapor extraction|air sparging|pump and treat|permeable reactive barrier|uscs soil classification/i.test(lower)) {
        return 13;
    }

    // 12. Solid and Hazardous Waste
    if (/solid waste|hazardous waste|landfill|remediation/i.test(tip) ||
        /landfill|municipal solid waste|landfill leachate|landfill gas generation|methane generation|rcra|hazardous waste characteristics|toxicity characteristic leaching procedure|tclp|incineration destruction and removal efficiency|dre|clay liner permeability|geomembrane|composting c:n ratio/i.test(lower)) {
        return 12;
    }

    // 11. Air Quality and Control
    if (/air quality|air pollution|climate/i.test(tip) ||
        /gaussian plume|atmospheric dispersion|pasquill-gifford|plume rise|holland equation|cyclone separator cut diameter|baghouse fabric filter|electrostatic precipitator|deutsch-anderson|venturi scrubber|flue gas desulfurization|scrubber absorption|ambient air quality standards|naaqs|ppm to mg\/m3|greenhouse gas global warming potential/i.test(lower)) {
        return 11;
    }

    // 10. Water and Wastewater Engineering
    if (/water quality|water treatment|wastewater|drinking water|disinfection|sludge/i.test(tip) ||
        /streeter-phelps|dissolved oxygen sag|critical deficit|bod|biochemical oxygen demand|ultimate bod|trickling filter|nrc formula|two-film|chick-watson disinfection kinetics|chlorine contact chamber|ct concept|sedimentation basin surface overflow rate|rapid mix velocity gradient|g-value|camp-stein|coagulation|flocculation|dual media filtration|carman-kozeny|activated sludge|aeration tank|mean cell residence time|mcrt|food-to-mass ratio|f\/m ratio|sludge volume index|svi|weir overflow rate|break point chlorination|nitrogen removal|nitrification and denitrification|phosphorus removal/i.test(lower)) {
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
    if (/elastomer|stainless steel|cast iron|inversion of a mechanism|kinematic inversion/i.test(lower)) return 2;
    if (/forward rectangular|rectangular rule/i.test(lower)) return 1;
    if (/incremental cost/i.test(lower)) return 4;
    if (/ethical and legal|professional and technical societies/i.test(lower)) return 3;
    if (/law of cosines|law of sines|trigonometric/i.test(lower)) return 1;
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


    // =========================================================================
    // FE Rapid Flashcard Subject & Chapter Classification (Option A: Megamenu)
    // =========================================================================
    function getCardChapter(card, disc, subjectId) {
        if (card.chapter) return card.chapter;
        const text = (card.title + ' ' + (card.examTip || '') + ' ' + (card.description || '')).toLowerCase();

        // 1. Mathematics
        if (subjectId === 1) {
            if (/differential equation|particular integral|complementary function|cauchy-euler|homogeneous equation|separable|integrating factor|laplace transform|wronskian|undetermined coefficients|initial value problem|boundary value|ode/i.test(text)) {
                return 'Differential Equations';
            }
            if (/matrix|matrices|eigenvalue|eigenvector|determinant|cramer|vector dot|vector cross|linear algebra|rank of matrix|inverse matrix/i.test(text)) {
                return 'Linear Algebra';
            }
            if (/derivative|integral|integration|limit|calculus|taylor series|maclaurin|l'hopital|curvature|gradient|divergence|curl|chain rule|power rule|product rule|quotient rule|maxima and minima|partial derivative|inflection point|definite integral|indefinite integral/i.test(text)) {
                return 'Calculus';
            }
            if (/ellipse|parabola|hyperbola|circle|conic|straight line|slope|perpendicular|distance between|coordinates|polar coordinates|cartesian|tangent to curve|analytic geometry|foci|directrix|eccentricity/i.test(text)) {
                return 'Analytic Geometry';
            }
            if (/numerical|algorithm|iteration|newton-raphson|bisection|euler's method|trapezoidal rule|simpson/i.test(text)) {
                return 'Numerical Methods';
            }
            return 'Math Basics';
        }

        // 2. Probability & Statistics
        if (subjectId === 2) {
            if (/regression|least squares|correlation coefficient|curve fitting/i.test(text)) return 'Regression & Curve Fitting';
            if (/hypothesis|t-test|z-test|confidence interval|p-value|significance/i.test(text)) return 'Hypothesis Testing';
            if (/permutation|combination|counting/i.test(text)) return 'Permutations & Combinations';
            if (/normal distribution|binomial|poisson|probability density|expected value|variance|standard deviation/i.test(text)) return 'Distributions & Expected Values';
            return 'Laws of Probability';
        }

        // 3. Ethics & Professional Practice
        if (subjectId === 3) {
            if (/intellectual property|patent|copyright|trade secret/i.test(text)) return 'Intellectual Property';
            if (/public health|safety|welfare|whistleblowing/i.test(text)) return 'Public Health & Safety';
            return 'Codes of Ethics';
        }

        // 4. Engineering Economics
        if (subjectId === 4) {
            if (/break-even|payback/i.test(text)) return 'Break-even Analysis';
            if (/capitalized cost|perpetuity/i.test(text)) return 'Capitalized Costs';
            if (/inflation|depreciation/i.test(text)) return 'Inflation & Depreciation';
            if (/annual compounding|effective rate|nominal rate/i.test(text)) return 'Compounding Rates';
            return 'Time Value of Money';
        }

        // 5. Electricity & Magnetism
        if (subjectId === 5) {
            if (/ac circuit|impedance|phasor|power factor|reactive power/i.test(text)) return 'AC Circuits';
            if (/capacitor|inductor|rc circuit|rl circuit|rlc circuit/i.test(text)) return 'Capacitors & Inductors';
            if (/three-phase|wye|delta/i.test(text)) return 'Three-phase Power';
            if (/transformer|mutual inductance/i.test(text)) return 'Transformers';
            if (/motor|generator|torque-speed/i.test(text)) return 'Motors & Generators';
            return 'Electrical Fundamentals';
        }

        // 6. Statics
        if (subjectId === 6) {
            if (/truss|method of joints|method of sections|zero force/i.test(text)) return 'Statically Determinate Truss';
            if (/friction|impending slip|belt friction|screw thread|angle of repose/i.test(text)) return 'Static Friction';
            if (/centroid|center of gravity|first moment/i.test(text)) return 'Centroids';
            if (/moment of inertia|parallel axis|radius of gyration/i.test(text)) return 'Moment of Inertia';
            if (/moment|couple|torque/i.test(text)) return 'Moments & Couples';
            return 'Equilibrium of Rigid Bodies';
        }

        // 7. Dynamics & Vibrations
        if (subjectId === 7) {
            if (/vibration|natural frequency|damping|resonance|sdof/i.test(text)) return 'Vibrations';
            if (/impulse|momentum|collision|restitution/i.test(text)) return 'Impulse & Momentum';
            if (/work-energy|kinetic energy|potential energy|conservation of energy/i.test(text)) return 'Work-Energy Principles';
            if (/rigid body|rotation|instantaneous center|rolling without slip/i.test(text)) return 'Kinematics & Kinetics of Rigid Bodies';
            return 'Kinematics of Particles';
        }

        // 8. Mechanics of Materials
        if (subjectId === 8) {
            if (/mohr|principal stress|shear stress|stress transformation/i.test(text)) return 'Mohr\'s Circle & Stress States';
            if (/beam|shear diagram|moment diagram|flexure formula|bending stress/i.test(text)) return 'Beams & Bending Loads';
            if (/torsion|torsional shear|polar moment/i.test(text)) return 'Torsion';
            if (/column|buckling|euler buckling/i.test(text)) return 'Columns & Buckling';
            if (/pressure vessel|thin-walled|hoop stress/i.test(text)) return 'Pressure Vessels';
            if (/thermal deformation|thermal stress/i.test(text)) return 'Thermal Deformations';
            return 'Uniaxial Stress-Strain';
        }

        // 9. Material Properties & Processing
        if (subjectId === 9) {
            if (/phase diagram|eutectic|heat treat|austenite|martensite/i.test(text)) return 'Phase Diagrams & Heat Treating';
            if (/corrosion|galvanic|oxidation/i.test(text)) return 'Corrosion & Degradation';
            if (/failure mechanism|fatigue|creep|fracture toughness|sn curve/i.test(text)) return 'Failure Mechanisms';
            if (/ferrous|steel|cast iron|nonferrous|aluminum|brass/i.test(text)) return 'Ferrous & Nonferrous Metals';
            return 'Material Properties & Testing';
        }

        // 10. Fluid Mechanics
        if (subjectId === 10) {
            if (/pipe flow|head loss|darcy|friction factor|moody|minor loss|internal flow/i.test(text)) return 'Internal Flow & Pipe Networks';
            if (/manometer|buoyancy|hydrostatic|pressure distribution/i.test(text)) return 'Fluid Statics';
            if (/bernoulli|continuity|energy equation|one-dimensional/i.test(text)) return 'One-Dimensional Fluid Flow';
            if (/mach number|compressible|isentropic flow|shock wave/i.test(text)) return 'Compressible Flow';
            if (/pump|turbine|scaling laws|specific speed/i.test(text)) return 'Fluid Machinery & Pumps';
            if (/reynolds|dimensionless|dimensional analysis|buckingham/i.test(text)) return 'Dimensional Analysis';
            return 'Fluid Properties';
        }

        // 11. Thermodynamics
        if (subjectId === 11) {
            if (/carnot|brayton|rankine|otto|diesel|cycle/i.test(text)) return 'Power & Refrigeration Cycles';
            if (/first law|closed system|open system|steady flow/i.test(text)) return 'First Law of Thermodynamics';
            if (/second law|entropy|clausius|kelvin-planck|irreversibility/i.test(text)) return 'Second Law & Entropy';
            if (/ideal gas|pvt|equation of state|compressibility factor/i.test(text)) return 'Properties of Ideal Gases & Pure Substances';
            if (/psychrometric|humidity|dew point|wet bulb/i.test(text)) return 'Psychrometrics';
            return 'Thermodynamic Processes';
        }

        // 12. Heat Transfer
        if (subjectId === 12) {
            if (/conduction|fourier|thermal resistance|composite wall/i.test(text)) return 'Conduction';
            if (/convection|nusselt|prandtl|heat transfer coefficient/i.test(text)) return 'Convection';
            if (/radiation|stefan-boltzmann|emissivity|view factor|blackbody/i.test(text)) return 'Radiation';
            if (/heat exchanger|lmtd|ntu/i.test(text)) return 'Heat Exchangers';
            return 'Conduction & Thermal Resistance';
        }

        // 13. Measurements & Controls
        if (subjectId === 13) {
            if (/bode|root locus|transfer function|block diagram|feedback|stability|pid|control/i.test(text)) return 'Control Systems';
            if (/sensor|transducer|thermocouple|strain gauge/i.test(text)) return 'Sensors & Transducers';
            if (/uncertainty|error propagation/i.test(text)) return 'Measurement Uncertainty';
            return 'Dynamic System Response';
        }

        // 14. Mechanical Design & Analysis
        if (subjectId === 14) {
            if (/spring|helical spring|spring constant/i.test(text)) return 'Springs';
            if (/bearing|journal bearing|ball bearing|roller bearing/i.test(text)) return 'Bearings';
            if (/gear|gear train|pinion|spur gear|power transmission/i.test(text)) return 'Power Transmission & Gears';
            if (/bolt|rivet|weld|joining/i.test(text)) return 'Fasteners & Joining Methods';
            if (/failure theory|von mises|tresca|goodman|soderberg/i.test(text)) return 'Static & Fatigue Failure Theories';
            if (/power screw|lead screw/i.test(text)) return 'Power Screws';
            return 'Machine Element Analysis';
        }

        return 'Core Topics';
    }

    let cachedHierarchy = null;
    let megamenuActiveSubjectId = 1;

    function buildDisciplineHierarchy(fullDeck, actualDisc) {
        const config = DISCIPLINE_SUBJECT_CONFIG[actualDisc];
        if (!config) return null;

        const subjectList = config.list;
        const getSubjectFn = config.getSubjectId;

        const hierarchy = {
            discipline: actualDisc,
            totalCards: fullDeck.length,
            subjects: []
        };

        const subjectMap = {};
        subjectList.forEach(sub => {
            subjectMap[sub.id] = {
                id: sub.id,
                name: sub.name,
                total: 0,
                chapters: {}
            };
        });

        fullDeck.forEach(c => {
            const sId = c.subjectId || getSubjectFn(c.title, c.examTip, c.description);
            const ch = c.chapter || getCardChapter(c, actualDisc, sId);
            c.subjectId = sId;
            c.chapter = ch;
            if (subjectMap[sId]) {
                subjectMap[sId].total++;
                if (!subjectMap[sId].chapters[ch]) {
                    subjectMap[sId].chapters[ch] = {
                        count: 0,
                        topicsMap: {},
                        topics: []
                    };
                }
                subjectMap[sId].chapters[ch].count++;
                const top = (c.title || '').trim();
                if (top && !subjectMap[sId].chapters[ch].topicsMap[top]) {
                    subjectMap[sId].chapters[ch].topicsMap[top] = true;
                    subjectMap[sId].chapters[ch].topics.push(top);
                }
            }
        });

        hierarchy.subjects = subjectList.map(sub => {
            const data = subjectMap[sub.id];
            const chList = Object.keys(data.chapters).map(chName => ({
                name: chName,
                count: data.chapters[chName].count,
                topics: data.chapters[chName].topics || []
            }));
            chList.sort((a, b) => b.count - a.count);
            return {
                id: sub.id,
                name: sub.name,
                total: data.total,
                chapterCount: chList.length,
                chapters: chList
            };
        });

        return hierarchy;
    }

    function updateMegamenuTriggerLabel(hierarchy) {
        const label = document.getElementById('fc-megamenu-label');
        if (!label || !hierarchy) return;

        if (currentSubjectFilter === 'all' || !currentSubjectFilter) {
            label.textContent = `All Subjects (${hierarchy.totalCards})`;
            return;
        }

        if (typeof currentSubjectFilter === 'string' && currentSubjectFilter.includes(':')) {
            const [subIdStr, chapterName] = currentSubjectFilter.split(':');
            const targetSub = hierarchy.subjects.find(s => s.id === Number(subIdStr));
            if (!targetSub) {
                label.textContent = `All Subjects (${hierarchy.totalCards})`;
                return;
            }
            const cleanSubName = targetSub.name.replace(/^\d+\.\s*/, '');
            if (!chapterName || chapterName === 'all') {
                label.textContent = `${cleanSubName} (${targetSub.total})`;
            } else {
                const chObj = targetSub.chapters.find(c => c.name === chapterName);
                const count = chObj ? chObj.count : 0;
                label.textContent = `${cleanSubName} > ${chapterName} (${count})`;
            }
        } else {
            const targetSub = hierarchy.subjects.find(s => s.id === Number(currentSubjectFilter));
            if (targetSub) {
                const cleanSubName = targetSub.name.replace(/^\d+\.\s*/, '');
                label.textContent = `${cleanSubName} (${targetSub.total})`;
            } else {
                label.textContent = `All Subjects (${hierarchy.totalCards})`;
            }
        }
    }

    function highlightFlashcardSearchMatch(text, query) {
        if (!query || !text) return text;
        const qClean = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        if (!qClean) return text;
        try {
            const regex = new RegExp('(' + qClean + ')', 'gi');
            return text.replace(regex, '<mark class="bg-amber-300/90 dark:bg-amber-400/50 text-slate-900 dark:text-amber-100 px-0.5 rounded font-bold">$1</mark>');
        } catch (e) {
            return text;
        }
    }

    function renderMegamenuSubjects(filterQuery = '') {
        const listEl = document.getElementById('fc-megamenu-subjects-list');
        if (!listEl || !cachedHierarchy) return;

        const q = (filterQuery || '').toLowerCase().trim();
        const subjects = cachedHierarchy.subjects;
        let html = '';

        if (q) {
            // Count total matching chapters & topics across syllabus
            let totalMatchingChapters = 0;
            let totalMatchingTopics = 0;
            subjects.forEach(sub => {
                sub.chapters.forEach(ch => {
                    const chMatches = ch.name.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q);
                    const matchingTops = ch.topics ? ch.topics.filter(t => t.toLowerCase().includes(q)) : [];
                    if (chMatches || matchingTops.length > 0) {
                        totalMatchingChapters++;
                        totalMatchingTopics += (matchingTops.length > 0 ? matchingTops.length : 1);
                    }
                });
            });

            const isAllResultsActive = (!megamenuActiveSubjectId || megamenuActiveSubjectId === 'all_results');

            html += `
                <div onclick="window.setMegamenuActiveSubject('all_results')" class="flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${isAllResultsActive ? 'bg-gradient-to-r from-[#be0055] to-pink-600 text-white font-bold shadow-md shadow-pink-500/20 border-pink-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="material-symbols-outlined text-[17px] ${isAllResultsActive ? 'text-white' : 'text-[#be0055] dark:text-pink-400'}">search_check</span>
                        <span class="text-xs truncate font-bold">All Matching Topics (${totalMatchingTopics})</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${isAllResultsActive ? 'bg-white/20 text-white' : 'bg-pink-500/10 text-[#be0055] dark:text-pink-300'}">${totalMatchingChapters} chaps</span>
                </div>
            `;

            subjects.forEach(sub => {
                let subMatchingChapters = 0;
                let subMatchingTopics = 0;
                sub.chapters.forEach(ch => {
                    const chMatches = ch.name.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q);
                    const matchingTops = ch.topics ? ch.topics.filter(t => t.toLowerCase().includes(q)) : [];
                    if (chMatches || matchingTops.length > 0) {
                        subMatchingChapters++;
                        subMatchingTopics += (matchingTops.length > 0 ? matchingTops.length : 1);
                    }
                });

                if (subMatchingChapters === 0) return;

                const isSubActive = (megamenuActiveSubjectId === sub.id);

                html += `
                    <div class="group/sub rounded-xl transition-all border ${isSubActive ? 'bg-pink-500/10 border-pink-500/40 text-[#be0055] dark:text-pink-300 shadow-sm' : 'border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'}">
                        <div onclick="event.stopPropagation(); window.setMegamenuActiveSubject(${sub.id}, event)" onmouseenter="if(window.innerWidth>=640){ window.setMegamenuActiveSubject(${sub.id}, event); }" class="flex items-center justify-between p-2.5 cursor-pointer">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="material-symbols-outlined text-[16px] ${isSubActive ? 'text-[#be0055] dark:text-pink-400' : 'text-slate-400'}">folder</span>
                                <span class="text-xs font-semibold truncate ${isSubActive ? 'text-[#be0055] dark:text-pink-300 font-bold' : ''}">${highlightFlashcardSearchMatch(sub.name, q)}</span>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#be0055] text-white">${subMatchingTopics} topics</span>
                                <span class="material-symbols-outlined text-[16px] text-slate-400 transition-transform ${isSubActive ? 'rotate-90 sm:rotate-0' : ''}">chevron_right</span>
                            </div>
                        </div>

                        <!-- Mobile Inline Accordion with Matching Topics -->
                        <div class="sm:hidden px-3 pb-3 pt-1 space-y-2 border-t border-slate-200/40 dark:border-slate-800/40 ${isSubActive ? 'block' : 'hidden'}">
                            <div class="grid grid-cols-1 gap-1.5 pt-1">
                                ${sub.chapters.map(ch => {
                                    const chMatches = ch.name.toLowerCase().includes(q);
                                    const matchingTops = ch.topics ? ch.topics.filter(t => t.toLowerCase().includes(q)) : [];
                                    if (!chMatches && matchingTops.length === 0) return '';
                                    return `
                                        <div class="rounded-xl border transition-all overflow-hidden border-pink-500/80 bg-pink-500/10 shadow-sm">
                                            <div data-sub-id="${sub.id}" data-chap="${encodeURIComponent(ch.name)}" onclick="window.selectFlashcardSubjectChapterFromEl(this)" class="p-2.5 text-xs flex items-center justify-between cursor-pointer font-bold text-[#be0055] dark:text-pink-300">
                                                <div class="flex items-center gap-1.5 min-w-0">
                                                    <span class="material-symbols-outlined text-[15px] text-[#be0055] dark:text-pink-400 shrink-0">menu_book</span>
                                                    <span class="truncate">${highlightFlashcardSearchMatch(ch.name, q)}</span>
                                                </div>
                                                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 bg-[#be0055] text-white">${ch.count}</span>
                                            </div>
                                            ${ch.topics && ch.topics.length > 0 ? `
                                                <div class="px-2.5 pb-2 pt-0.5 space-y-1 border-t border-slate-100 dark:border-slate-800/60">
                                                    ${ch.topics.map(top => {
                                                        const isMatch = top.toLowerCase().includes(q);
                                                        return `
                                                            <div data-sub-id="${sub.id}" data-chap="${encodeURIComponent(ch.name)}" data-topic="${encodeURIComponent(top)}" onclick="event.stopPropagation(); window.selectFlashcardTopicFromEl(this)" class="flex items-center gap-1.5 text-[11px] py-1 px-1.5 rounded cursor-pointer transition-all ${isMatch ? 'bg-pink-500/20 text-[#be0055] dark:text-pink-200 font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-[#be0055]'}">
                                                                <span class="w-1.5 h-1.5 rounded-full ${isMatch ? 'bg-[#be0055]' : 'bg-slate-300'} shrink-0"></span>
                                                                <span class="truncate">${highlightFlashcardSearchMatch(top, q)}</span>
                                                                ${isMatch ? '<span class="ml-auto text-[9px] px-1 rounded bg-[#be0055] text-white font-bold">Topic Match</span>' : ''}
                                                            </div>
                                                        `;
                                                    }).join('')}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
            });

        } else {
            // Normal browsing (no query)
            const isAllSelected = (currentSubjectFilter === 'all' || !currentSubjectFilter);
            html += `
                <div onclick="window.selectFlashcardSubjectChapter('all', 'all')" class="flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${isAllSelected ? 'bg-pink-500/15 border-pink-500/50 text-[#be0055] dark:text-pink-300 font-bold shadow-sm' : 'border-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'}">
                    <div class="flex items-center gap-2 min-w-0">
                        <span class="material-symbols-outlined text-[17px] ${isAllSelected ? 'text-[#be0055] dark:text-pink-400' : 'text-slate-400'}">apps</span>
                        <span class="text-xs truncate font-bold">All Subjects (Complete Deck)</span>
                    </div>
                    <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${isAllSelected ? 'bg-[#be0055] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">${cachedHierarchy.totalCards}</span>
                </div>
            `;

            subjects.forEach(sub => {
                const isSubActive = (megamenuActiveSubjectId === sub.id);
                const isSubFiltered = (
                    (typeof currentSubjectFilter === 'string' && currentSubjectFilter.startsWith(`${sub.id}:`)) ||
                    String(currentSubjectFilter) === String(sub.id)
                );

                html += `
                    <div class="group/sub rounded-xl transition-all border ${isSubActive ? 'bg-pink-500/10 border-pink-500/40 text-[#be0055] dark:text-pink-300' : 'border-transparent hover:bg-slate-100/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'}">
                        <div onclick="event.stopPropagation(); window.setMegamenuActiveSubject(${sub.id}, event)" onmouseenter="if(window.innerWidth>=640){ window.setMegamenuActiveSubject(${sub.id}, event); }" class="flex items-center justify-between p-2.5 cursor-pointer">
                            <div class="flex items-center gap-2 min-w-0">
                                <span class="material-symbols-outlined text-[16px] ${isSubFiltered ? 'text-[#be0055] dark:text-pink-400' : 'text-slate-400'}">folder</span>
                                <span class="text-xs font-semibold truncate ${isSubFiltered ? 'text-[#be0055] dark:text-pink-300 font-bold' : ''}">${sub.name}</span>
                            </div>
                            <div class="flex items-center gap-1.5 shrink-0">
                                <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${isSubFiltered ? 'bg-[#be0055] text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">${sub.total}</span>
                                <span class="material-symbols-outlined text-[16px] text-slate-400 transition-transform ${isSubActive ? 'rotate-90 sm:rotate-0' : ''}">chevron_right</span>
                            </div>
                        </div>

                        <!-- Mobile Inline Accordion with Chapters and Topics -->
                        <div class="sm:hidden px-3 pb-3 pt-1 space-y-1.5 border-t border-slate-200/40 dark:border-slate-800/40 ${isSubActive ? 'block' : 'hidden'}">
                            <div data-sub-id="${sub.id}" data-chap="all" onclick="window.selectFlashcardSubjectChapterFromEl(this)" class="p-2 rounded-lg text-xs font-semibold flex items-center justify-between bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 cursor-pointer hover:bg-pink-500/20">
                                <span>All Chapters in ${sub.name.replace(/^\d+\.\s*/, '')}</span>
                                <span class="text-[10px] font-bold bg-[#be0055] text-white px-1.5 py-0.5 rounded">${sub.total}</span>
                            </div>
                            <div class="grid grid-cols-1 gap-1.5 pt-1">
                                ${sub.chapters.map(ch => {
                                    const isChActive = (currentSubjectFilter === `${sub.id}:${ch.name}`);
                                    return `
                                        <div class="rounded-xl border transition-all overflow-hidden ${isChActive ? 'border-pink-500 bg-pink-500/10 shadow-sm' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'}">
                                            <div data-sub-id="${sub.id}" data-chap="${encodeURIComponent(ch.name)}" onclick="window.selectFlashcardSubjectChapterFromEl(this)" class="p-2.5 text-xs flex items-center justify-between cursor-pointer font-bold ${isChActive ? 'text-[#be0055] dark:text-pink-300' : 'text-slate-800 dark:text-slate-100'}">
                                                <div class="flex items-center gap-1.5 min-w-0">
                                                    <span class="material-symbols-outlined text-[15px] ${isChActive ? 'text-[#be0055] dark:text-pink-400' : 'text-slate-400'} shrink-0">menu_book</span>
                                                    <span class="truncate">${ch.name}</span>
                                                </div>
                                                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded ml-2 shrink-0 ${isChActive ? 'bg-[#be0055] text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'}">${ch.count}</span>
                                            </div>
                                            ${ch.topics && ch.topics.length > 0 ? `
                                                <div class="px-2.5 pb-2 pt-0.5 space-y-1 border-t border-slate-100 dark:border-slate-800/60">
                                                    ${ch.topics.map(top => `
                                                        <div data-sub-id="${sub.id}" data-chap="${encodeURIComponent(ch.name)}" data-topic="${encodeURIComponent(top)}" onclick="event.stopPropagation(); window.selectFlashcardTopicFromEl(this)" class="flex items-center gap-1.5 text-[11px] py-1 px-1.5 rounded cursor-pointer text-slate-500 dark:text-slate-400 hover:text-[#be0055] hover:bg-pink-500/10 transition-all">
                                                            <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></span>
                                                            <span class="truncate">${top}</span>
                                                        </div>
                                                    `).join('')}
                                                </div>
                                            ` : ''}
                                        </div>
                                    `;
                                }).join('')}
                            </div>
                        </div>
                    </div>
                `;
            });
        }

        listEl.innerHTML = html;
    }

    function renderMegamenuChapters(filterQuery = '') {
        const panelEl = document.getElementById('fc-megamenu-chapters-panel');
        if (!panelEl || !cachedHierarchy) return;

        const q = (typeof filterQuery === 'string' ? filterQuery : (document.getElementById('fc-megamenu-search')?.value || '')).toLowerCase().trim();
        const subjects = cachedHierarchy.subjects;

        let displayChapters = [];
        let isGlobalSearch = false;
        let headerTitle = '';
        let headerSubtitle = '';

        if (q) {
            if (!megamenuActiveSubjectId || megamenuActiveSubjectId === 'all_results') {
                isGlobalSearch = true;
                // Gather matching chapters across ALL subjects
                subjects.forEach(sub => {
                    sub.chapters.forEach(ch => {
                        const chMatches = ch.name.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q);
                        const matchingTops = ch.topics ? ch.topics.filter(t => t.toLowerCase().includes(q)) : [];
                        if (chMatches || matchingTops.length > 0) {
                            displayChapters.push({
                                ...ch,
                                subId: sub.id,
                                subjectName: sub.name,
                                matchingTopics: matchingTops
                            });
                        }
                    });
                });
                headerTitle = `Search Results for "${filterQuery}"`;
                headerSubtitle = `Found ${displayChapters.length} matching chapter(s) across rapid deck`;
            } else {
                const sub = subjects.find(s => s.id === megamenuActiveSubjectId) || subjects[0];
                sub.chapters.forEach(ch => {
                    const chMatches = ch.name.toLowerCase().includes(q) || sub.name.toLowerCase().includes(q);
                    const matchingTops = ch.topics ? ch.topics.filter(t => t.toLowerCase().includes(q)) : [];
                    if (chMatches || matchingTops.length > 0) {
                        displayChapters.push({
                            ...ch,
                            subId: sub.id,
                            subjectName: sub.name,
                            matchingTopics: matchingTops
                        });
                    }
                });
                headerTitle = `"${filterQuery}" in ${sub.name}`;
                headerSubtitle = `${displayChapters.length} matching chapter(s)`;
            }
        } else {
            // Normal browsing (no search query)
            const sub = subjects.find(s => s.id === megamenuActiveSubjectId) || subjects[0];
            if (!sub) {
                panelEl.innerHTML = '<div class="text-xs text-slate-400 p-4 text-center">No chapters found for this subject</div>';
                return;
            }
            displayChapters = sub.chapters.map(ch => ({
                ...ch,
                subId: sub.id,
                subjectName: sub.name,
                matchingTopics: []
            }));
            headerTitle = sub.name;
            headerSubtitle = `${sub.chapterCount} Chapters • ${sub.total} Rapid Flashcards`;
        }

        let html = `
            <div class="mb-3 pb-2 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <h4 class="text-xs font-bold text-slate-900 dark:text-white">${headerTitle}</h4>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">${headerSubtitle}</p>
                </div>
                ${!q ? `
                    <button type="button" data-sub-id="${megamenuActiveSubjectId}" data-chap="all" onclick="window.selectFlashcardSubjectChapterFromEl(this)" class="px-2 py-1 text-[11px] font-bold rounded-lg border transition-all cursor-pointer border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-pink-500 hover:text-[#be0055]">
                        All Chapters (${cachedHierarchy.totalCards})
                    </button>
                ` : ''}
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        `;

        if (!displayChapters || displayChapters.length === 0) {
            html += `
                <div class="col-span-3 p-8 text-center text-xs text-slate-400">
                    <span class="material-symbols-outlined text-[32px] text-slate-300 dark:text-slate-600 block mb-2">search_off</span>
                    No flashcard topics or chapters matching "<strong>${filterQuery}</strong>". Try searching for another concept or formula.
                </div>
            `;
        } else {
            displayChapters.forEach(ch => {
                const subId = ch.subId;
                const subName = ch.subjectName;
                const isChSelected = (currentSubjectFilter === `${subId}:${ch.name}`);
                const matchingTops = ch.matchingTopics || [];
                const otherTops = ch.topics ? ch.topics.filter(t => !matchingTops.includes(t)) : [];

                html += `
                    <div class="rounded-xl border transition-all flex flex-col group overflow-hidden shadow-sm hover:shadow-md ${matchingTops.length > 0 ? 'border-pink-500/70 bg-pink-500/[0.04] dark:bg-pink-950/20' : (isChSelected ? 'bg-pink-500/[0.08] dark:bg-pink-950/30 border-pink-500 shadow-pink-500/10' : 'bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800/80 hover:border-pink-500/50 hover:bg-pink-50/20 dark:hover:bg-slate-900')}">
                        <!-- Chapter Header (Direct click opens chapter) -->
                        <div data-sub-id="${subId}" data-chap="${encodeURIComponent(ch.name)}" onclick="window.selectFlashcardSubjectChapterFromEl(this)" class="p-3 pb-2.5 flex items-center justify-between gap-2 cursor-pointer border-b border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-pink-500/10 transition-colors" title="Open ${ch.name}">
                            <div class="min-w-0 flex-1">
                                ${isGlobalSearch ? `<span class="text-[9px] font-black uppercase tracking-wider text-[#be0055] dark:text-pink-400 block truncate mb-0.5">${highlightFlashcardSearchMatch(subName, q)}</span>` : ''}
                                <div class="flex items-center gap-1.5 min-w-0">
                                    <span class="material-symbols-outlined text-[16px] text-[#be0055] dark:text-pink-400 shrink-0">menu_book</span>
                                    <span class="text-xs font-bold truncate group-hover:text-[#be0055] dark:group-hover:text-pink-300 text-slate-900 dark:text-white transition-colors">${highlightFlashcardSearchMatch(ch.name, q)}</span>
                                </div>
                            </div>
                            <div class="flex items-center gap-1 shrink-0">
                                ${matchingTops.length > 0 ? `
                                    <span class="px-1.5 py-0.5 rounded-full text-[9px] font-black bg-pink-500 text-white flex items-center gap-0.5 shadow-sm" title="${matchingTops.length} matching topics">
                                        <span class="material-symbols-outlined text-[11px]">bolt</span>${matchingTops.length}
                                    </span>
                                ` : ''}
                                <span class="px-2 py-0.5 rounded-lg text-[10px] font-black shrink-0 ${isChSelected ? 'bg-[#be0055] text-white' : 'bg-pink-500/10 text-[#be0055] dark:text-pink-300 border border-pink-500/20'}">${ch.count} cards</span>
                            </div>
                        </div>

                        <!-- Topics List under Chapter -->
                        <div class="p-2.5 pt-2 flex flex-col gap-1 flex-1">
                            <!-- Matched Topics First (Highlighted) -->
                            ${matchingTops.map(top => `
                                <div data-sub-id="${subId}" data-chap="${encodeURIComponent(ch.name)}" data-topic="${encodeURIComponent(top)}" onclick="event.stopPropagation(); window.selectFlashcardTopicFromEl(this)" class="flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-[11px] bg-pink-500/15 dark:bg-pink-950/40 text-[#be0055] dark:text-pink-200 font-bold border border-pink-500/30 cursor-pointer hover:bg-pink-500/25 transition-all shadow-xs" title="Click to open topic: ${top}">
                                    <span class="material-symbols-outlined text-[13px] text-[#be0055] dark:text-pink-400 shrink-0">check_circle</span>
                                    <span class="truncate flex-1">${highlightFlashcardSearchMatch(top, q)}</span>
                                    <span class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-[#be0055] text-white shrink-0">Topic Match</span>
                                </div>
                            `).join('')}

                            <!-- Other Topics in Chapter -->
                            ${otherTops.map(top => `
                                <div data-sub-id="${subId}" data-chap="${encodeURIComponent(ch.name)}" data-topic="${encodeURIComponent(top)}" onclick="event.stopPropagation(); window.selectFlashcardTopicFromEl(this)" class="flex items-center gap-1.5 px-2 py-1 rounded-lg text-[11px] text-slate-600 dark:text-slate-400 hover:text-[#be0055] dark:hover:text-pink-300 hover:bg-pink-50/50 dark:hover:bg-pink-950/20 cursor-pointer transition-all">
                                    <span class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-700 shrink-0"></span>
                                    <span class="truncate" title="${top}">${top}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                `;
            });
        }

        html += `</div>`;
        panelEl.innerHTML = html;
    }

    window.setMegamenuActiveSubject = function(subId, event) {
        if (event) {
            try { event.stopPropagation(); } catch (e) {}
        }
        megamenuActiveSubjectId = subId;
        const q = (document.getElementById('fc-megamenu-search')?.value || '');
        renderMegamenuSubjects(q);
        renderMegamenuChapters(q);
    };

    window.selectFlashcardSubjectChapterFromEl = function(el) {
        if (!el) return;
        const subId = el.getAttribute('data-sub-id') || 'all';
        const chap = decodeURIComponent(el.getAttribute('data-chap') || '');
        const topic = decodeURIComponent(el.getAttribute('data-topic') || '');
        window.selectFlashcardSubjectChapter(subId, chap, topic);
    };

    window.selectFlashcardTopicFromEl = function(el) {
        if (!el) return;
        const subId = el.getAttribute('data-sub-id') || 'all';
        const chap = decodeURIComponent(el.getAttribute('data-chap') || '');
        const topic = decodeURIComponent(el.getAttribute('data-topic') || '');
        window.selectFlashcardSubjectChapter(subId, chap, topic);
    };

    window.selectFlashcardSubjectChapter = function(subId, chapterName, targetCardTitle) {
        if (subId === 'all') {
            currentSubjectFilter = 'all';
        } else if (chapterName === 'all') {
            currentSubjectFilter = String(subId);
        } else {
            currentSubjectFilter = `${subId}:${chapterName}`;
        }
        closeMegamenu();
        openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter, targetCardTitle);
    };

    function openMegamenu() {
        const trigger = document.getElementById('fc-megamenu-trigger');
        const dropdown = document.getElementById('fc-megamenu-dropdown');
        const backdrop = document.getElementById('fc-megamenu-backdrop');
        if (!dropdown || !trigger) return;

        const rect = trigger.getBoundingClientRect();
        const isMobile = window.innerWidth < 640;

        if (isMobile) {
            dropdown.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 480)}px`;
            dropdown.style.left = '8px';
            dropdown.style.right = '8px';
            dropdown.style.width = 'auto';
            dropdown.style.maxHeight = '82vh';
        } else {
            const dropdownWidth = Math.min(1240, window.innerWidth - 32);
            let left = Math.max(16, (window.innerWidth - dropdownWidth) / 2);
            dropdown.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 580)}px`;
            dropdown.style.left = `${left}px`;
            dropdown.style.right = 'auto';
            dropdown.style.width = `${dropdownWidth}px`;
            dropdown.style.maxHeight = '85vh';
        }

        if (backdrop) backdrop.classList.remove('hidden');
        dropdown.classList.remove('hidden');
        requestAnimationFrame(() => {
            if (backdrop) backdrop.classList.remove('opacity-0');
            dropdown.classList.remove('opacity-0', 'scale-95');
            dropdown.classList.add('opacity-100', 'scale-100');
        });

        const searchInput = document.getElementById('fc-megamenu-search');
        if (searchInput) {
            searchInput.value = '';
            searchInput.focus();
        }
    }

    function closeMegamenu() {
        const dropdown = document.getElementById('fc-megamenu-dropdown');
        const backdrop = document.getElementById('fc-megamenu-backdrop');
        if (!dropdown) return;

        dropdown.classList.remove('opacity-100', 'scale-100');
        dropdown.classList.add('opacity-0', 'scale-95');
        if (backdrop) backdrop.classList.add('opacity-0');

        setTimeout(() => {
            dropdown.classList.add('hidden');
            if (backdrop) backdrop.classList.add('hidden');
        }, 200);
    }

    function syncSubjectSelectVisibility() {
        const trigger = document.getElementById('fc-megamenu-trigger');
        const legacySelect = document.getElementById('fc-subject-select');
        const actualDisc = (currentDiscipline === 'current' || !currentDiscipline) 
            ? getActiveDiscipline() 
            : currentDiscipline;
        const hasSubjects = (actualDisc !== 'all' && Boolean(DISCIPLINE_SUBJECT_CONFIG[actualDisc]));

        if (hasSubjects) {
            if (trigger) {
                trigger.classList.remove('hidden');
                trigger.classList.add('flex');
            }
        } else {
            if (trigger) {
                trigger.classList.remove('flex');
                trigger.classList.add('hidden');
            }
            if (legacySelect) legacySelect.classList.add('hidden');
        }
    }

    function updateSubjectSelectOptions(fullDeck, actualDisc) {
        const config = DISCIPLINE_SUBJECT_CONFIG[actualDisc];
        if (!config) {
            const trigger = document.getElementById('fc-megamenu-trigger');
            if (trigger) trigger.classList.add('hidden');
            return;
        }

        cachedHierarchy = buildDisciplineHierarchy(fullDeck, actualDisc);
        if (!cachedHierarchy) return;

        if (typeof currentSubjectFilter === 'string' && currentSubjectFilter.includes(':')) {
            megamenuActiveSubjectId = Number(currentSubjectFilter.split(':')[0]) || 1;
        } else if (currentSubjectFilter && currentSubjectFilter !== 'all') {
            megamenuActiveSubjectId = Number(currentSubjectFilter) || 1;
        }

        updateMegamenuTriggerLabel(cachedHierarchy);

        const discBadge = document.getElementById('fc-megamenu-discipline-badge');
        if (discBadge) discBadge.textContent = actualDisc;
        const totalCountEl = document.getElementById('fc-megamenu-total-count');
        if (totalCountEl) totalCountEl.textContent = cachedHierarchy.totalCards;

        renderMegamenuSubjects();
        renderMegamenuChapters();

        const select = document.getElementById('fc-subject-select');
        if (select) {
            let html = `<option value="all">All Subjects (${cachedHierarchy.totalCards} Cards)</option>`;
            cachedHierarchy.subjects.forEach(sub => {
                html += `<option value="${sub.id}">${sub.name} (${sub.total})</option>`;
            });
            select.innerHTML = html;
            select.value = (typeof currentSubjectFilter === 'string' && currentSubjectFilter.includes(':'))
                ? currentSubjectFilter.split(':')[0]
                : currentSubjectFilter;
        }
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
                card.chapter = getCardChapter(card, actualDisc, card.subjectId);
            });

            // Apply subject and chapter filter if selected
            if (subjectFilter && subjectFilter !== 'all') {
                if (typeof subjectFilter === 'string' && subjectFilter.includes(':')) {
                    const [subIdStr, chapterName] = subjectFilter.split(':');
                    const targetSubId = Number(subIdStr);
                    allTheorems = allTheorems.filter(card => {
                        if (card.subjectId !== targetSubId) return false;
                        if (!chapterName || chapterName === 'all') return true;
                        return card.chapter === chapterName;
                    });
                } else {
                    const targetSubId = Number(subjectFilter);
                    if (!isNaN(targetSubId)) {
                        allTheorems = allTheorems.filter(card => card.subjectId === targetSubId);
                    }
                }
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

    // Format flashcard formula: Semantic Clause Splitting (Logical Multi-Line Breaking)
    // 1. Splits on display blocks and top-level statement semicolons (;)
    // 2. In long clauses (>= 48 chars), splits at top-level equality (=, \approx) or separators (\quad, \qquad)
    // to prevent formulas from shrinking to tiny unreadable font heights in one line.
    function formatFlashcardFormula(formulaStr) {
        if (!formulaStr) return '';
        const str = String(formulaStr).trim();

        // Extract individual $$...$$ display equation blocks
        let rawBlocks = [];
        const blockMatches = str.match(/\$\$[\s\S]*?\$\$/g);
        if (blockMatches && blockMatches.length > 0) {
            rawBlocks = blockMatches.map(b => b.replace(/^\$\$|\$\$$/g, '').trim());
        } else {
            rawBlocks = [str.replace(/^\$+|\$+$/g, '').trim()];
        }

        const clauses = [];

        rawBlocks.forEach(block => {
            block = block.replace(/[\r\n]+/g, ' ').trim();
            if (!block) return;

            let cur = '';
            let envDepth = 0;
            let braceDepth = 0;
            let bracketDepth = 0;
            let parenDepth = 0;
            let i = 0;

            while (i < block.length) {
                if (block.startsWith('\\begin{', i)) {
                    envDepth++;
                    cur += '\\begin{';
                    i += 7;
                    continue;
                }
                if (block.startsWith('\\end{', i)) {
                    envDepth = Math.max(0, envDepth - 1);
                    cur += '\\end{';
                    i += 5;
                    continue;
                }

                const ch = block[i];
                if (ch === '{') braceDepth++;
                else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
                else if (ch === '[') bracketDepth++;
                else if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1);
                else if (ch === '(') parenDepth++;
                else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);

                // Split strictly at top-level statement boundaries:
                // Semicolon (;) outside any brackets, parens, or LaTeX environments, excluding LaTeX spacing like \;
                if (envDepth === 0 && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
                    if (ch === ';' && (i === 0 || block[i - 1] !== '\\')) {
                        const trimmed = cur.trim();
                        if (trimmed) clauses.push(trimmed);
                        cur = '';
                        i++;
                        while (block.startsWith('\\quad', i) || block[i] === ' ') {
                            if (block.startsWith('\\quad', i)) i += 5;
                            else i++;
                        }
                        continue;
                    }
                }

                cur += ch;
                i++;
            }

            if (cur.trim()) {
                clauses.push(cur.trim());
            }
        });

        // Helper: Split an individual long clause (>= 48 chars) at a natural mathematical breakpoint
        // so it renders on multiple lines at 100% full font size without horizontal scaling.
        function splitClauseIfLong(clause) {
            const s = clause.trim();
            if (s.length < 48) return [s];

            // Don't split if already inside an explicit multi-line or tabular LaTeX environment
            if (s.includes('\\begin{cases}') || s.includes('\\begin{aligned}') || s.includes('\\begin{matrix}') || s.includes('\\begin{array}')) {
                return [s];
            }

            let envDepth = 0, braceDepth = 0, bracketDepth = 0, parenDepth = 0;
            const candidates = [];

            let i = 0;
            while (i < s.length) {
                if (s.startsWith('\\begin{', i)) { envDepth++; i += 7; continue; }
                if (s.startsWith('\\end{', i)) { envDepth = Math.max(0, envDepth - 1); i += 5; continue; }

                const ch = s[i];
                if (ch === '{') braceDepth++;
                else if (ch === '}') braceDepth = Math.max(0, braceDepth - 1);
                else if (ch === '[') bracketDepth++;
                else if (ch === ']') bracketDepth = Math.max(0, bracketDepth - 1);
                else if (ch === '(') parenDepth++;
                else if (ch === ')') parenDepth = Math.max(0, parenDepth - 1);

                if (envDepth === 0 && braceDepth === 0 && bracketDepth === 0 && parenDepth === 0) {
                    if (s.startsWith('\\qquad', i) && !/[a-zA-Z]/.test(s[i + 6] || '')) {
                        candidates.push({ index: i, len: 6, type: 'sep' });
                    } else if (s.startsWith('\\quad', i) && !/[a-zA-Z]/.test(s[i + 5] || '')) {
                        candidates.push({ index: i, len: 5, type: 'sep' });
                    } else if (ch === '=' && s[i + 1] !== '=' && (i === 0 || s[i - 1] !== '=') && (i === 0 || s[i - 1] !== '\\')) {
                        candidates.push({ index: i, len: 1, type: 'eq' });
                    } else if (s.startsWith('\\approx', i) && !/[a-zA-Z]/.test(s[i + 7] || '')) {
                        candidates.push({ index: i, len: 7, type: 'rel' });
                    } else if (s.startsWith('\\equiv', i) && !/[a-zA-Z]/.test(s[i + 6] || '')) {
                        candidates.push({ index: i, len: 6, type: 'rel' });
                    }
                }
                i++;
            }

            if (candidates.length === 0) return [s];

            // Priority 1: Spacing separators (\quad, \qquad)
            const seps = candidates.filter(c => c.type === 'sep');
            if (seps.length > 0) {
                const mid = s.length / 2;
                seps.sort((a, b) => Math.abs(a.index - mid) - Math.abs(b.index - mid));
                const best = seps[0];
                const p1 = s.substring(0, best.index).trim();
                const p2 = s.substring(best.index + best.len).trim();
                if (p1 && p2) {
                    const sub2 = splitClauseIfLong(p2);
                    return [p1, ...sub2];
                }
            }

            // Priority 2: Equality or relation operators (=, \approx, etc.)
            const eqs = candidates.filter(c => c.type === 'eq' || c.type === 'rel');
            if (eqs.length > 0) {
                const mid = s.length / 2;
                eqs.sort((a, b) => Math.abs(a.index - mid) - Math.abs(b.index - mid));
                const best = eqs[0];
                const p1 = s.substring(0, best.index + best.len).trim();
                const p2 = s.substring(best.index + best.len).trim();
                if (p1 && p2) {
                    const sub2 = splitClauseIfLong(p2);
                    return [p1, ...sub2];
                }
            }

            return [s];
        }

        const cleanedClauses = [];
        clauses.forEach(c => {
            let s = c.trim();
            s = s.replace(/;+$/, '').trim();
            s = s.replace(/^(\\quad|\s)+|(\\quad|\s)+$/g, '').trim();
            if (s) {
                const parts = splitClauseIfLong(s);
                cleanedClauses.push(...parts);
            }
        });

        return cleanedClauses.map(clause => `<div class="fc-formula-row">$$${clause}$$</div>`).join('');
    }

    function renderCard() {
        const headerNotesControls = document.getElementById('header-notes-controls');
        if (headerNotesControls) {
            headerNotesControls.classList.add('hidden');
            headerNotesControls.classList.remove('flex');
        }
        if (typeof window.closeNotesMegamenu === 'function') {
            window.closeNotesMegamenu();
        }
        const modal = document.getElementById('fe-flashcards-modal');
        const cardEl = document.getElementById('flashcard-studio-card');
        const paneFc = document.getElementById('study-pane-flashcards');
        const paneNotes = document.getElementById('study-pane-notes');
        if (paneFc) paneFc.classList.remove('hidden');
        if (paneNotes) paneNotes.classList.add('hidden');
        if (!modal) return;
        if (modal.classList.contains('hidden') && modal.style.display !== 'flex') return;

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
            cardLvl.className = 'hidden'; cardLvl.style.display = 'none';
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

                function setFlashcardVideoSource(videoUrl) {
            const backVideo = document.getElementById('fc-back-video');
            const driveFrame = document.getElementById('fc-back-drive-frame');
            if (!videoUrl) {
                if (backVideo) {
                    backVideo.pause();
                    backVideo.removeAttribute('src');
                    backVideo.load();
                    backVideo.classList.add('hidden');
                }
                if (driveFrame) {
                    driveFrame.src = '';
                    driveFrame.classList.add('hidden');
                }
                return;
            }

            const isDrive = videoUrl.includes('drive.google.com') || videoUrl.includes('drive.usercontent.google.com') || videoUrl.startsWith('/api/drive-stream/');
            let targetSrc = videoUrl;
            let driveId = '';
            if (isDrive) {
                const m = videoUrl.match(/(?:\/file\/d\/|[?&]id=|\/api\/drive-stream\/)([a-zA-Z0-9_-]+)/);
                if (m) driveId = m[1];
                targetSrc = driveId ? ('/api/drive-stream/' + driveId) : videoUrl;
            }

            if (backVideo) {
                if (driveFrame) {
                    driveFrame.src = '';
                    driveFrame.classList.add('hidden');
                }
                backVideo.classList.remove('hidden');
                backVideo.src = targetSrc;
                backVideo.load();

                if (driveId) {
                    backVideo.onerror = function() {
                        console.warn('Direct stream error, falling back to Drive iframe preview');
                        backVideo.classList.add('hidden');
                        if (driveFrame) {
                            driveFrame.src = 'https://drive.google.com/file/d/' + driveId + '/preview';
                            driveFrame.classList.remove('hidden');
                        }
                    };
                }

                if (typeof playBackVideo === 'function') {
                    playBackVideo();
                } else {
                    backVideo.muted = typeof userAudioMuted !== 'undefined' ? userAudioMuted : true;
                    backVideo.play().catch(() => {
                        backVideo.muted = true;
                        backVideo.play().catch(() => {});
                    });
                }
            }
        }


        if (hasVideo && hasImage) {
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'order-2 lg:order-none w-full lg:col-span-7 flex flex-col space-y-2 mt-1 sm:mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'contents lg:flex lg:flex-col lg:col-span-5 lg:justify-start lg:space-y-3';
            }

        setFlashcardVideoSource(card.videoUrl);

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

            setFlashcardVideoSource(card.videoUrl);

            if (backVideoContainer) backVideoContainer.classList.remove('hidden');
            if (backImgContainer) backImgContainer.classList.add('hidden');

            if (mediaSwitcher) {
                mediaSwitcher.classList.add('hidden');
                mediaSwitcher.classList.remove('flex');
            }
            if (mediaStaticHeader) mediaStaticHeader.classList.remove('hidden');
            if (headerIcon) {
                headerIcon.textContent = 'smart_display';
                headerIcon.className = 'material-symbols-outlined text-[15px] text-[#FF006E]';
            }
            if (headerLabel) {
                headerLabel.textContent = '10s Video Explainer';
                headerLabel.className = 'text-[10px] font-black uppercase tracking-widest text-[#FF006E]';
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
        const exampleFeedback = document.getElementById('fc-example-feedback');

        if (card.solvedExample) {
            if (btnVideoExample) btnVideoExample.classList.remove('hidden');
            if (exampleOverlay) exampleOverlay.classList.add('hidden');
            if (exampleSolution) exampleSolution.classList.add('hidden');
            if (solutionBtnLabel) solutionBtnLabel.textContent = 'Show me the Solution';
            if (exampleFeedback) {
                exampleFeedback.classList.add('hidden');
                exampleFeedback.innerHTML = '';
            }

            if (exampleQuestion) {
                exampleQuestion.innerHTML = formatSolvedExampleQuestion(card.solvedExample.question || '');
            }
            if (exampleSolution) {
                exampleSolution.innerHTML = formatSolvedExampleSolution(card.solvedExample.solution || '');
            }

            // Restore previous answer state if user previously attempted this card
            const answeredMap = getAnsweredSolvedExamples();
            const pastAttempt = answeredMap[card.title];
            const correctAnswer = extractSolvedExampleAnswer(card);

            if (pastAttempt) {
                applySolvedExampleOptionStyles(pastAttempt.selectedOption, pastAttempt.isCorrect, correctAnswer);
                if (exampleFeedback) {
                    exampleFeedback.classList.remove('hidden');
                    if (pastAttempt.isCorrect) {
                        exampleFeedback.innerHTML = `
                            <div class="p-2.5 rounded-xl bg-pink-50 dark:bg-pink-500/15 border border-pink-300 dark:border-pink-400/40 text-pink-950 dark:text-pink-200 text-xs font-semibold flex items-center gap-2.5">
                                <span class="material-symbols-outlined text-[#be0055] dark:text-pink-300 text-[18px]">verified</span>
                                <span>Previously Solved Correctly: Option (${pastAttempt.selectedOption})</span>
                            </div>
                        `;
                    } else {
                        exampleFeedback.innerHTML = `
                            <div class="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-400/35 text-amber-900 dark:text-amber-200 text-xs font-semibold flex items-center gap-2.5">
                                <span class="material-symbols-outlined text-amber-700 dark:text-amber-300 text-[18px]">info</span>
                                <span>Previously Attempted: Option (${pastAttempt.selectedOption}) | Correct: Option (${correctAnswer || 'N/A'})</span>
                            </div>
                        `;
                    }
                }
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
                    headerIcon.className = 'material-symbols-outlined text-[15px] text-[#FF006E]';
                }
                if (headerLabel) {
                    headerLabel.textContent = 'FE Practice Problem';
                    headerLabel.className = 'text-[10px] font-black uppercase tracking-widest text-[#FF006E]';
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

        // Transform options grid into responsive layout and option divs into interactive clickable buttons
        processed = processed.replace(/<div class="grid grid-cols-2 gap-2/g, '<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5');

        processed = processed.replace(/<div class="[^"]*p-2[^"]*">\s*\(([A-D])\)\s*([\s\S]*?)<\/div>/g, (m, letter, content) => {
            const cleanContent = content.trim();
            return `<button type="button" data-option="${letter}" onclick="event.stopPropagation(); window.selectSolvedExampleOption && window.selectSolvedExampleOption('${letter}', this, event);" class="fc-example-option group/opt w-full text-left p-2.5 sm:p-3 rounded-xl border border-slate-300 dark:border-slate-700/80 bg-white hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800/90 hover:border-[#FF006E] dark:hover:border-pink-400/80 active:scale-[0.99] transition-all duration-200 cursor-pointer flex items-start gap-2.5 shadow-sm text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                <span class="fc-option-letter w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-950/80 border border-pink-300 dark:border-pink-500/40 text-[#be0055] dark:text-pink-300 font-bold text-xs flex items-center justify-center shrink-0 group-hover/opt:border-[#FF006E] group-hover/opt:bg-pink-200 dark:group-hover/opt:bg-pink-900 transition-colors">${letter}</span>
                <span class="fc-option-text flex-1 text-slate-800 dark:text-slate-200 leading-relaxed font-sans font-medium">${cleanContent}</span>
                <span class="fc-option-status-icon hidden text-[16px] shrink-0"></span>
            </button>`;
        });

        return processed;
    }

    // Helper to extract the correct answer (A, B, C, D) from solved example solution
    function extractSolvedExampleAnswer(card) {
        if (!card || !card.solvedExample) return null;
        const sol = card.solvedExample.solution || '';
        const patterns = [
            /Correct\s+(?:Answer|Option)[^:(<]*[:\s]+(?:<[^>]+>\s*)*\(([A-D])\)/i,
            /Correct\s+(?:Answer|Option)[^:(<]*[:\s]+(?:<[^>]+>\s*)*([A-D])(?:\b|\s|\))/i,
            /Answer\s*[:\s]+(?:<[^>]+>\s*)*\(([A-D])\)/i,
            /text-emerald-300[^>]*>\s*\(([A-D])\)/i,
            /font-bold[^>]*>\s*\(([A-D])\)/i,
            /\b(?:choice|option)\s+\(([A-D])\)/i,
            /\(([A-D])\)\s*is\s+correct/i
        ];
        for (const pat of patterns) {
            const m = sol.match(pat);
            if (m && m[1]) return m[1].toUpperCase();
        }
        return null;
    }

    // Solved example state storage in localStorage
    function getAnsweredSolvedExamples() {
        try {
            const raw = localStorage.getItem('enggtv_solved_examples_answered');
            return raw ? JSON.parse(raw) : {};
        } catch (e) {
            return {};
        }
    }

    function markSolvedExampleAnswered(cardTitle, selectedOption, isCorrect) {
        if (!cardTitle) return;
        try {
            const answered = getAnsweredSolvedExamples();
            answered[cardTitle] = {
                selectedOption,
                isCorrect,
                timestamp: Date.now()
            };
            localStorage.setItem('enggtv_solved_examples_answered', JSON.stringify(answered));
        } catch (e) {}
    }

    // Apply visual styling to option buttons according to selection and correct answer
    function applySolvedExampleOptionStyles(selectedOption, isCorrect, correctAnswer) {
        const allBtns = document.querySelectorAll('.fc-example-option');
        allBtns.forEach(btn => {
            btn.disabled = true;
            btn.classList.remove('hover:bg-slate-800/90', 'hover:border-cyan-400/60', 'hover:border-pink-400/80', 'cursor-pointer', 'active:scale-[0.99]');
            btn.classList.add('cursor-default');

            const opt = (btn.getAttribute('data-option') || '').toUpperCase();
            const letterEl = btn.querySelector('.fc-option-letter');
            const statusIcon = btn.querySelector('.fc-option-status-icon');

            if (opt === (correctAnswer || '').toUpperCase()) {
                // Highlight correct option in glowing emerald green
                btn.classList.remove('bg-white', 'bg-slate-900/90', 'border-slate-300', 'border-slate-700/80', 'text-slate-900', 'text-slate-100');
                btn.classList.add('bg-emerald-50', 'dark:bg-emerald-500/20', 'border-emerald-500', 'dark:border-emerald-400', 'text-emerald-950', 'dark:text-emerald-100', 'shadow-[0_0_15px_rgba(16,185,129,0.25)]');
                if (letterEl) {
                    letterEl.className = 'fc-option-letter w-6 h-6 rounded-lg bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm';
                }
                if (statusIcon) {
                    statusIcon.className = 'fc-option-status-icon material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[18px] shrink-0';
                    statusIcon.textContent = 'check_circle';
                    statusIcon.classList.remove('hidden');
                }
            } else if (opt === (selectedOption || '').toUpperCase() && !isCorrect) {
                // Highlight user's incorrect pick in rose red
                btn.classList.remove('bg-white', 'bg-slate-900/90', 'border-slate-300', 'border-slate-700/80', 'text-slate-900', 'text-slate-100');
                btn.classList.add('bg-rose-50', 'dark:bg-rose-500/20', 'border-rose-400', 'dark:border-rose-500', 'text-rose-950', 'dark:text-rose-200');
                if (letterEl) {
                    letterEl.className = 'fc-option-letter w-6 h-6 rounded-lg bg-rose-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm';
                }
                if (statusIcon) {
                    statusIcon.className = 'fc-option-status-icon material-symbols-outlined text-rose-600 dark:text-rose-400 text-[18px] shrink-0';
                    statusIcon.textContent = 'cancel';
                    statusIcon.classList.remove('hidden');
                }
            } else {
                btn.classList.add('opacity-45');
            }
        });
    }

    // Handler when user clicks an option in solved example
    function selectSolvedExampleOption(selectedOption, clickedBtn, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        const card = currentDeck && currentDeck[currentIndex];
        if (!card || !card.solvedExample) return;

        const correctAnswer = extractSolvedExampleAnswer(card);
        const answered = getAnsweredSolvedExamples();
        const alreadyAnswered = Boolean(answered[card.title]);
        const isCorrect = Boolean(correctAnswer && selectedOption.toUpperCase() === correctAnswer.toUpperCase());

        if (!alreadyAnswered) {
            if (isCorrect) {
                markSolvedExampleAnswered(card.title, selectedOption, true);
                if (window.addPoints) {
                    window.addPoints(1, '🎯 Solved Example Correct!');
                }
            } else {
                markSolvedExampleAnswered(card.title, selectedOption, false);
            }
        }

        applySolvedExampleOptionStyles(selectedOption, isCorrect, correctAnswer);

        // Display feedback banner
        const feedbackEl = document.getElementById('fc-example-feedback');
        if (feedbackEl) {
            feedbackEl.classList.remove('hidden');
            if (isCorrect) {
                feedbackEl.innerHTML = `
                    <div class="p-3 rounded-xl bg-pink-50 dark:bg-pink-500/15 border border-pink-300 dark:border-pink-400/40 text-pink-950 dark:text-pink-200 text-xs font-semibold flex items-center gap-3 animate-fadeIn shadow-sm">
                        <span class="w-8 h-8 rounded-lg bg-pink-500/20 dark:bg-pink-500/30 border border-pink-400/50 flex items-center justify-center text-[#be0055] dark:text-pink-300 shrink-0">
                            <span class="material-symbols-outlined text-[20px]">military_tech</span>
                        </span>
                        <div class="flex-1">
                            <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm flex items-center gap-2">
                                <span>Correct! Option (${selectedOption})</span>
                                <span class="px-2 py-0.5 rounded-full bg-pink-200 dark:bg-pink-500/30 text-[10px] font-black text-[#be0055] dark:text-pink-300 uppercase tracking-wider">+1 Point</span>
                            </div>
                            <div class="text-[11px] text-pink-800 dark:text-pink-200/90 mt-0.5">Great job solving this FE practice problem independently. Full step-by-step solution shown below!</div>
                        </div>
                    </div>
                `;
            } else {
                feedbackEl.innerHTML = `
                    <div class="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/15 border border-amber-300 dark:border-amber-400/35 text-amber-950 dark:text-amber-200 text-xs font-semibold flex items-center gap-3 animate-fadeIn shadow-sm">
                        <span class="w-8 h-8 rounded-lg bg-amber-500/20 dark:bg-amber-500/30 border border-amber-400/40 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
                            <span class="material-symbols-outlined text-[20px]">lightbulb</span>
                        </span>
                        <div class="flex-1">
                            <div class="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">Incorrect — Correct Option is (${correctAnswer || 'N/A'})</div>
                            <div class="text-[11px] text-amber-800 dark:text-amber-200/90 mt-0.5">No points this time, but examine the step-by-step FE solution below to master this concept.</div>
                        </div>
                    </div>
                `;
            }
        }

        // Automatically reveal the solution so user can review the mathematical derivation
        const solution = document.getElementById('fc-video-example-solution');
        const btnLabel = document.getElementById('fc-solution-btn-label');
        if (solution) {
            solution.classList.remove('hidden');
            if (btnLabel) btnLabel.textContent = 'Hide Solution';
            triggerMathTypeset([solution]);
            setTimeout(() => {
                if (solution && typeof solution.scrollIntoView === 'function') {
                    solution.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
            }, 80);
        }
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
        const card = currentDeck && currentDeck[currentIndex];

        if (!solution) return;
        const isHidden = solution.classList.contains('hidden');

        if (isHidden) {
            solution.classList.remove('hidden');
            if (btnLabel) btnLabel.textContent = 'Hide Solution';

            // If user opened solution directly without attempting, disable options so they cannot claim points retroactively
            if (card) {
                const answeredMap = getAnsweredSolvedExamples();
                if (!answeredMap[card.title]) {
                    const allBtns = document.querySelectorAll('.fc-example-option');
                    const correctAnswer = extractSolvedExampleAnswer(card);
                    if (allBtns.length > 0) {
                        allBtns.forEach(btn => {
                            btn.disabled = true;
                            btn.classList.remove('hover:bg-slate-800/90', 'hover:border-cyan-400/60', 'hover:border-pink-400/80', 'cursor-pointer');
                            btn.classList.add('cursor-default');
                            const opt = (btn.getAttribute('data-option') || '').toUpperCase();
                            if (opt === (correctAnswer || '').toUpperCase()) {
                                btn.classList.add('border-emerald-500', 'bg-emerald-50', 'dark:border-emerald-400/70', 'dark:bg-emerald-500/15');
                            } else {
                                btn.classList.add('opacity-45');
                            }
                        });
                        const feedbackEl = document.getElementById('fc-example-feedback');
                        if (feedbackEl && feedbackEl.classList.contains('hidden')) {
                            feedbackEl.classList.remove('hidden');
                            feedbackEl.innerHTML = `
                                <div class="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-2">
                                    <span class="material-symbols-outlined text-slate-500 dark:text-slate-400 text-[18px]">visibility</span>
                                    <span>Solution revealed directly without self-attempt (0 points).</span>
                                </div>
                            `;
                        }
                    }
                }
            }

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

    
    // Autoplay flashcard video with robust unmuted sound policy
    function playBackVideo() {
        const video = document.getElementById('fc-back-video');
        if (!video) return;

        const card = currentDeck && currentDeck[currentIndex];
        if (!card || !card.videoUrl) return;
        if (activeMediaTab !== 'video') return;

        // Ensure video element matches user preference (default: unmuted)
        video.muted = userAudioMuted;
        updateAudioButtonUI(video.muted);

        // Cancel previous pending canplay listener if any
        if (video._pendingPlayHandler) {
            video.removeEventListener('canplay', video._pendingPlayHandler);
            video._pendingPlayHandler = null;
        }

        const startPlayback = () => {
            video._pendingPlayHandler = null;
            const modal = document.getElementById('fe-flashcards-modal');
            if (!modal || modal.classList.contains('hidden') || modal.style.display === 'none') return;
            if (activeMediaTab !== 'video') return;

            // Ensure muted matches user preference at moment of playback
            video.muted = userAudioMuted;

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    updateAudioButtonUI(video.muted);
                }).catch(err => {
                    // Browser prevented unmuted autoplay due to policy
                    if (!userAudioMuted) {
                        console.warn('[Flashcards] Browser blocked unmuted autoplay; falling back to muted with tap-to-unmute:', err);
                        video.muted = true;
                        updateAudioButtonUI(true, true);
                        video.play().catch(() => {});
                        armOneTouchUnmute();
                    }
                });
            }
        };

        if (video.readyState >= 2) {
            startPlayback();
        } else {
            // DO NOT call startPlayback() immediately when readyState < 2 (prevents premature promise rejection & bogus muting)
            video._pendingPlayHandler = startPlayback;
            video.addEventListener('canplay', startPlayback, { once: true });
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
                btnVideo.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 bg-[#FF006E]/20 text-pink-300 border border-[#FF006E]/40 shadow-sm';
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

    
    // Flashcard Video Audio Control (Mute / Unmute) & User Preference Persistence
    let userAudioMuted = (function() {
        try {
            return localStorage.getItem('fe_flashcard_user_muted') === 'true';
        } catch (e) {
            return false;
        }
    })();

    function updateAudioButtonUI(isMuted, isAutoplayBlocked = false) {
        const icon = document.getElementById('fc-audio-icon');
        const text = document.getElementById('fc-audio-text');
        const btn = document.getElementById('fc-btn-toggle-audio');
        if (!icon || !text) return;
        if (isMuted) {
            icon.textContent = 'volume_off';
            if (isAutoplayBlocked) {
                text.textContent = 'Tap for Sound';
                if (btn) {
                    btn.className = 'flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-amber-500/25 text-amber-300 border-amber-400/50 hover:bg-amber-500/35 cursor-pointer shadow-sm animate-pulse';
                    btn.title = 'Sound muted by browser autoplay policy — tap here or on video to enable sound';
                }
            } else {
                text.textContent = 'Muted';
                if (btn) {
                    btn.className = 'flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-slate-800/80 text-amber-300 border-amber-500/40 hover:bg-amber-500/20 cursor-pointer shadow-sm';
                    btn.title = 'Sound is muted — click to unmute';
                }
            }
        } else {
            icon.textContent = 'volume_up';
            text.textContent = 'Sound On';
            if (btn) {
                btn.className = 'flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-[#FF006E]/20 text-pink-300 border border-[#FF006E]/40 hover:bg-[#FF006E]/30 cursor-pointer shadow-sm';
                btn.title = 'Sound is active — click to mute';
            }
        }
    }

    function armOneTouchUnmute() {
        const container = document.getElementById('fc-back-video-container');
        if (!container || container._oneTouchArmed) return;
        container._oneTouchArmed = true;

        const unmuteHandler = (e) => {
            const video = document.getElementById('fc-back-video');
            if (video && video.muted && !userAudioMuted) {
                video.muted = false;
                updateAudioButtonUI(false);
                if (video.paused) video.play().catch(() => {});
            }
            container.removeEventListener('click', unmuteHandler);
            container.removeEventListener('touchstart', unmuteHandler);
            container._oneTouchArmed = false;
        };

        container.addEventListener('click', unmuteHandler, { once: true });
        container.addEventListener('touchstart', unmuteHandler, { once: true, passive: true });
    }

    function toggleFlashcardAudio() {
        const video = document.getElementById('fc-back-video');
        if (!video) return;
        userAudioMuted = !video.muted;
        try {
            localStorage.setItem('fe_flashcard_user_muted', userAudioMuted ? 'true' : 'false');
        } catch (e) {}

        video.muted = userAudioMuted;
        updateAudioButtonUI(video.muted);

        if (!video.muted && video.paused) {
            video.play().catch(() => {});
        }
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
                btn.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-[#FF006E]/20 text-pink-300 border border-[#FF006E]/40 hover:bg-[#FF006E]/30 cursor-pointer shadow-sm';
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
            textEl.innerHTML = `<div class="inline-flex items-center gap-2.5 py-0.5 px-2 font-mono tracking-wide text-sm sm:text-base text-pink-300"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FF006E]/20 text-pink-300 border border-[#FF006E]/40 shadow-sm">NCEES Equation</span><span>${cue.text}</span></div>`;
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

        video.addEventListener('volumechange', () => {
            updateAudioButtonUI(video.muted);
        });

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
        if (video) {
            video.pause();
            if (!userAudioMuted) video.muted = false;
        }

        currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
        renderCard();
    }

    // Next card action
    function nextCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) {
            video.pause();
            if (!userAudioMuted) video.muted = false;
        }

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
    function openFlashcardStudio(disc, mode, subjectFilter, targetCardTitle) {
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

        if (targetCardTitle && currentDeck && currentDeck.length > 0) {
            const cleanTarget = targetCardTitle.toLowerCase().trim();
            const foundIdx = currentDeck.findIndex(c => 
                (c.title && c.title.toLowerCase().trim() === cleanTarget) ||
                (c.title && c.title.toLowerCase().includes(cleanTarget))
            );
            if (foundIdx !== -1) {
                currentIndex = foundIdx;
            }
        }

        // Immediately preload first 8 cards in this session
        if (currentDeck && currentDeck.length > 0) {
            for (let i = 0; i < Math.min(8, currentDeck.length); i++) {
                if (currentDeck[i].imageUrl) preloadCardImage(currentDeck[i].imageUrl);
            }
        }

        const modal = document.getElementById('fe-flashcards-modal');
        const card = document.getElementById('flashcard-studio-card');
        if (!modal) return;

        modal.classList.remove('hidden', 'opacity-0');
        modal.classList.add('opacity-100');
        modal.style.display = 'flex';
        modal.style.opacity = '1';
        modal.style.visibility = 'visible';
        modal.style.pointerEvents = 'auto';
        if (card) {
            card.classList.remove('scale-95', 'opacity-0');
            card.classList.add('scale-100', 'opacity-100');
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }

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
    function closeFlashcardStudio(resetTab = true) {
        const modal = document.getElementById('fe-flashcards-modal');
        const card = document.getElementById('flashcard-studio-card');
        const video = document.getElementById('fc-back-video');
        const driveFrame = document.getElementById('fc-back-drive-frame');
        if (driveFrame) {
            driveFrame.src = '';
            driveFrame.classList.add('hidden');
        }
        if (video) {
            try {
                video.pause();
                video.currentTime = 0;
            } catch (err) {}
        }

        if (modal) {
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            modal.style.opacity = '0';
            modal.style.pointerEvents = 'none';
            if (card) {
                card.classList.remove('scale-100', 'opacity-100');
                card.classList.add('scale-95', 'opacity-0');
                card.style.opacity = '0';
                card.style.transform = 'scale(0.95)';
            }
            setTimeout(() => {
                modal.classList.add('hidden');
                modal.style.display = 'none';
                modal.style.visibility = 'hidden';
            }, 250);
        }

        if (resetTab && typeof window.switchStudyMode === 'function') {
            window.switchStudyMode('notes');
        }
    }

    
    // Close Megamenu on click outside
    document.addEventListener('click', (e) => {
        const dropdown = document.getElementById('fc-megamenu-dropdown');
        const trigger = document.getElementById('fc-megamenu-trigger');
        if (!dropdown || dropdown.classList.contains('hidden')) return;
        // Never close if clicked inside the dropdown or trigger
        if (dropdown.contains(e.target) || (trigger && trigger.contains(e.target))) return;
        closeMegamenu();
    });

    // Reposition on window resize
    window.addEventListener('resize', () => {
        const dropdown = document.getElementById('fc-megamenu-dropdown');
        const trigger = document.getElementById('fc-megamenu-trigger');
        if (!dropdown || dropdown.classList.contains('hidden') || !trigger) return;
        const rect = trigger.getBoundingClientRect();
        const isMobile = window.innerWidth < 640;
        if (isMobile) {
            dropdown.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 480)}px`;
            dropdown.style.left = '8px';
            dropdown.style.right = '8px';
            dropdown.style.width = 'auto';
        } else {
            const dropdownWidth = Math.min(1240, window.innerWidth - 32);
            let left = Math.max(16, (window.innerWidth - dropdownWidth) / 2);
            dropdown.style.top = `${Math.min(rect.bottom + 8, window.innerHeight - 580)}px`;
            dropdown.style.left = `${left}px`;
            dropdown.style.width = `${dropdownWidth}px`;
        }
    });

    // Attach Keyboard Hotkeys
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('fe-flashcards-modal');
        if (!modal || modal.classList.contains('hidden') || modal.style.display === 'none') return;

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

    // Wire studio controls and button click events (idempotent)
    function wireStudioControls() {
        const discSelect = document.getElementById('fc-discipline-select');
        const modeSelect = document.getElementById('fc-mode-select');
        const subjectSelect = document.getElementById('fc-subject-select');

        if (discSelect && !discSelect.dataset.wired) {
            discSelect.dataset.wired = 'true';
            discSelect.addEventListener('change', (e) => {
                currentDiscipline = e.target.value;
                currentSubjectFilter = 'all';
                openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);
            });
        }

        if (modeSelect && !modeSelect.dataset.wired) {
            modeSelect.dataset.wired = 'true';
            modeSelect.addEventListener('change', (e) => {
                currentMode = e.target.value;
                openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);
            });
        }

        if (subjectSelect && !subjectSelect.dataset.wired) {
            subjectSelect.dataset.wired = 'true';
            subjectSelect.addEventListener('change', (e) => {
                currentSubjectFilter = e.target.value;
                openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);
            });
        }

        // Wire Megamenu Trigger & Controls
        const trigger = document.getElementById('fc-megamenu-trigger');
        const closeBtnMegamenu = document.getElementById('fc-megamenu-close-btn');
        const backdrop = document.getElementById('fc-megamenu-backdrop');
        const allBtn = document.getElementById('fc-megamenu-all-btn');
        const searchInput = document.getElementById('fc-megamenu-search');

        if (trigger && (!trigger.dataset || !trigger.dataset.wired)) {
            if (trigger.dataset) trigger.dataset.wired = 'true';
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const dropdown = document.getElementById('fc-megamenu-dropdown');
                if (dropdown && !dropdown.classList.contains('hidden')) {
                    closeMegamenu();
                } else {
                    openMegamenu();
                }
            });
        }

        if (closeBtnMegamenu && (!closeBtnMegamenu.dataset || !closeBtnMegamenu.dataset.wired)) {
            if (closeBtnMegamenu.dataset) closeBtnMegamenu.dataset.wired = 'true';
            closeBtnMegamenu.addEventListener('click', (e) => {
                e.preventDefault();
                closeMegamenu();
            });
        }

        if (backdrop && (!backdrop.dataset || !backdrop.dataset.wired)) {
            if (backdrop.dataset) backdrop.dataset.wired = 'true';
            backdrop.addEventListener('click', () => {
                closeMegamenu();
            });
        }

        if (allBtn && (!allBtn.dataset || !allBtn.dataset.wired)) {
            if (allBtn.dataset) allBtn.dataset.wired = 'true';
            allBtn.addEventListener('click', (e) => {
                e.preventDefault();
                window.selectFlashcardSubjectChapter('all', 'all');
            });
        }

        if (searchInput && (!searchInput.dataset || !searchInput.dataset.wired)) {
            if (searchInput.dataset) searchInput.dataset.wired = 'true';
            searchInput.addEventListener('input', (e) => {
                const q = e.target.value;
                renderMegamenuSubjects(q);
                renderMegamenuChapters(q);
            });
        }


        // Top-right Close Button
        const closeBtn = document.getElementById('fc-close-btn');
        if (closeBtn) {
            closeBtn.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                closeFlashcardStudio();
            };
        }

        // Bottom-right Next Button
        const nextBtn = document.getElementById('fc-btn-next');
        if (nextBtn) {
            nextBtn.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                nextCard();
            };
        }

        // Bottom-left Previous Button
        const prevBtn = document.getElementById('fc-btn-prev');
        if (prevBtn) {
            prevBtn.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                prevCard();
            };
        }

        // Top Shuffle Button
        const shuffleBtn = document.getElementById('fc-shuffle-btn');
        if (shuffleBtn) {
            shuffleBtn.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                shuffleCards();
            };
        }

        // Bottom Nav Revise Tab
        const reviseNavBtn = document.getElementById('bottom-nav-revise');
        if (reviseNavBtn) {
            reviseNavBtn.onclick = (e) => {
                if (e) { e.preventDefault(); e.stopPropagation(); }
                openFlashcardStudio();
            };
        }

        // Backdrop click to close (click outside flashcard container)
        const modal = document.getElementById('fe-flashcards-modal');
        if (modal) {
            modal.onclick = (e) => {
                if (e.target === modal) {
                    closeFlashcardStudio();
                }
            };
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', wireStudioControls);
    } else {
        wireStudioControls();
    }
    window.addEventListener('resize', syncSubjectSelectVisibility);

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
    window.jumpToFlashcard = function(target) {
        if (!currentDeck || currentDeck.length === 0) return false;
        if (typeof target === 'number') {
            currentIndex = Math.max(0, Math.min(target, currentDeck.length - 1));
            renderCard();
            return true;
        }
        const clean = String(target).trim().toLowerCase();
        const idx = currentDeck.findIndex(c => (c.title || '').trim().toLowerCase() === clean || (c.title || '').toLowerCase().includes(clean));
        if (idx !== -1) {
            currentIndex = idx;
            renderCard();
            return true;
        }
        return false;
    };
    window.closeFlashcardStudio = closeFlashcardStudio;
    window.flipFlashcard = flipCard;
    window.prevFlashcard = prevCard;
    window.nextFlashcard = nextCard;
    window.shuffleFlashcards = shuffleCards;
    window.toggleKaraokeCaptions = toggleKaraokeCaptions;
    window.toggleFlashcardAudio = toggleFlashcardAudio;
    window.toggleTeleprompter = toggleKaraokeCaptions;
    window.toggleSolvedExample = toggleSolvedExample;
    window.toggleSolvedExampleSolution = toggleSolvedExampleSolution;
    window.selectSolvedExampleOption = selectSolvedExampleOption;
    // Backwards compatibility aliases
    window.rateFlashcard = nextCard;
    window.restartFlashcardSession = () => openFlashcardStudio(currentDiscipline, currentMode, currentSubjectFilter);
    window.DISCIPLINE_SUBJECT_CONFIG = DISCIPLINE_SUBJECT_CONFIG;

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
