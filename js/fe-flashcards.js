/**
 * FE THEOREM RAPID FLASHCARD STUDIO
 * Part of Engg.tv Prep — NCEES FE Exam Preparation Platform
 */
(function() {
    'use strict';

    let currentDeck = [];
    let currentIndex = 0;
    let isFlipped = false;
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
        if (/distance formula|angle between two non-vertical|slope-intercept|conic section|types of parabolas|l’hôpital|gradient vector|chain rule for differentiation|product and quotient rules|integration by parts|taylor and maclaurin|taylor series|infinite series convergence|homogeneous vs non-homogeneous|order and degree of differential|second-order linear homogeneous ode|laplace transforms|laplace transform definition|matrix multiplication|inverse of a square matrix|inverse of a matrix|vector magnitude|vector dot product|vector cross product|properties of dot|properties of cross|length of a vector|curl of a vector|divergence of a vector|newton-raphson|newton's method for root|trapezoidal rule|simpson’s 1\/3 rule|simpson's rule|algorithm|flowchart|pseudocode|quadratic equation|complex numbers:|law of sines|double-angle|arithmetic vs geometric/i.test(lower)) return 1;
        // 2. Probability and Statistics
        if (/binomial distribution|standard normal distribution|probability density function|cumulative distribution|sample variance|median of a sample|mode of a sample|variance and standard deviation|sample mean and standard error|confidence intervals|student’s \$t\$-confidence|expected values|simple linear regression|correlation coefficient and coefficient|permutations and combinations|null hypothesis|student's t-distribution two-sample|one-way analysis of variance|chi-square goodness|statistical process control|western electric|six sigma|bathtub failure|mean time between failures|parallel system reliability|standby redundancy/i.test(lower)) return 2;
        // 3. Ethics and Professional Practice
        if (/paramount duty|pe seal integrity|code of ethics|safety data sheet|signal words|flammability, lfl and ufl|confined space safety|noise pollution measurements|osha|hazard quotient|excess lifetime cancer|chronic daily intake|hierarchy of controls|nfpa 704|electrical safety: gfci|hazop study|lower and upper flammability|intellectual property: patents|conflicts of interest|whistleblowing|ergonomic posture assessment/i.test(lower)) return 3;
        // 4. Engineering Economics
        if (/compound interest|nominal vs\. effective annual|capitalized cost|straight-line depreciation|book value|macrs|bonds|benefit-cost|break-even production volume|internal rate of return|simple payback period|break-even analysis for make-or-buy|payback period:|sensitivity analysis|critical path method|economic order quantity|earned value management|predetermined motion time|kanban production|bill of materials|exponential smoothing|forecasting error|total productive maintenance/i.test(lower)) return 4;
        // 5. Electricity and Magnetism
        if (/ohm’s law and joule|poynting vector|kirchhoff|thevenin|wheatstone bridge|first-order rc transient|first-order rc circuit time|operational amplifier|ideal operational amplifier|instrumentation amplifier|schmitt trigger|equivalent resistance in series|series rlc resonance|equivalent capacitance and inductance|ac power triangle|three-phase induction motor|synchronous machine|dc shunt motor|ideal transformer|dc motor back-emf/i.test(lower)) return 5;
        // 6. Statics
        if (/resolution of a force|lami's theorem|2d static equilibrium|moments \(couples\)|gravity retaining wall|free body diagram support|two-force and three-force|truss zero-force|method of joints|method of sections|parallel axis theorem \(second moment|centroid of composite|area moment of inertia|radius of gyration|product of inertia|centroid and moment of inertia for composite|centroids and area moments of inertia for standard shapes|coulomb dry friction|limiting friction/i.test(lower)) return 6;
        // 7. Dynamics, Kinematics, and Vibrations
        if (/normal and tangential acceleration in curvilinear|rectilinear kinematics|constant acceleration motion|variable acceleration motion|relative motion|projectile motion|kinematics of particles: normal|uniform circular motion|kinetic friction|particle kinetics: direct|potential energy in many|kinetic energy|linear impulse and momentum|coefficient of restitution|instantaneous center of rotation|kennedy's rule|planar rigid body relative velocity|work-energy principle \(rigid body|rotational kinetic energy|mass moment of inertia of common|mass moment of inertia parallel axis|angular impulse and momentum|planar rigid body equations of motion|conservation of linear and angular momentum for colliding|sdof undamped natural frequency|damped sdof natural frequency|logarithmic decrement|vibration transmissibility/i.test(lower)) return 7;
        // 8. Mechanics of Materials
        if (/differential relationships between load, shear|mohr’s circle for plane stress|analytical in-plane principal stresses|generalized hooke’s law|isotropic elastic constants|elastic strain energy|cantilever sheet pile|triaxial shear|vertical stress increase beneath point loads|axial stress and elongation|poisson’s ratio|elastic flexure formula|elastic section modulus|beam flexure formula|torsion formula|polar moment of inertia|pure torsion of circular shafts|transverse shear stress in beams|maximum shear stress in rectangular cross-section|thermal expansion deformation and thermal stress|combined axial and bending|moment-area first theorem|moment-area second theorem|beam deflection differential|cantilever beam tip deflection|simply supported beam center deflection|euler’s critical buckling|slenderness ratio for steel|thin-walled pressure vessel/i.test(lower)) return 8;
        // 9. Material Properties and Processing
        if (/standard portland cement|bragg's law|engineering stress-strain vs|modulus of resilience vs|cubic crystal structures|binary eutectic phase diagram|iron-carbon microstructures|binary phase diagram lever rule|eutectic and eutectoid|gibbs phase rule|fick’s first law|fick's first law|first-order chemical reaction half-life/i.test(lower)) return 9;
        // 10. Fluid Mechanics
        if (/newton's law of viscosity|newtonian vs non-newtonian|surface tension|capillarity|capillary rise height|hydrostatic pressure distribution|manometers|bouyancy force|hydrostatic force on submerged curved|buoyancy and metacentric|hydrostatic center of pressure|archimedes’ principle|bernoulli’s principle|continuity equation|modified fluid energy equation|darcy-weisbach|reynolds number|hagen-poiseuille|moody, darcy|hydraulic diameter for non-circular|laminar flow friction factor|rapid sand filter|storm sewer gravity|hazen-williams|hardy cross|minor head losses in pipe|drag coefficient and lift|stokes' law|boundary layer displacement|speed of sound & mach|stagnation temperature|froude number and hydraulic|net positive suction head|pump hydraulic power|centrifugal pump cavitation|centrifugal pump affinity laws|pump specific speed|pitot tube|venturi meter|orifice meter|orifice discharging freely|orifice$|coagulation velocity gradient|camp-stein rapid mixing/i.test(lower)) return 10;
        // 11. Thermodynamics
        if (/ideal gas law equation|van der waals|compressibility factor|properties for two-phase|mole fraction vs\. mass fraction|zeroth law of thermodynamics|mollier chart|clausius-clapeyron|first law of thermodynamics \(closed|steady-flow energy equation|enthalpy$|carnot thermal efficiency|entropy$|exergy|clausius inequality|entropy change of ideal gases|isothermal process|le chatelier’s principle|isentropic relations for ideal|polytropic process boundary|enthalpy definition and specific heat|ideal rankine cycle|ideal otto cycle|isentropic efficiencies of turbines|gas turbine regenerator|ideal diesel cycle|ideal brayton cycle|refrigeration cycles|coefficient of performance \(cop\)|cop of refrigeration vs|vapor-compression refrigeration|psychrometric humidity ratio|psychrometric chart|dry-bulb, wet-bulb|absolute humidity vs\.|hvac processes|indoor air quality single-compartment|combustion theoretical air|excess air and theoretical/i.test(lower)) return 11;
        // 12. Heat Transfer
        if (/fourier’s law of thermal conduction|critical radius of thermal insulation|extended surface fin efficiency|conduction through a plain|conduction through a cylindrical|thermal resistance of an object|newton’s law of cooling|natural convection rayleigh|pool boiling curve|condensation heat transfer|stefan-boltzmann law|radiation view factor|radiation heat exchange|black body vs\. grey|net energy exchange by radiation|biot number for transient|lumped capacitance method|biot number vs\. fourier|log mean temperature difference|overall heat transfer coefficient|effectiveness-ntu method|heat exchanger fouling/i.test(lower)) return 12;
        // 13. Measurements, Instrumentation, and Controls
        if (/strain gauge gauge factor|temperature sensors: thermocouple|first-order sensor dynamic step|second-order sensor natural frequency|open-loop step response method|laplace transform final value|closed-loop feedback control|steady-state error constants|bode plot gain margin|routh-hurwitz stability|root locus construction|pid controller time-domain|process control: first-order|process control: ziegler-nichols|ratio control strategy|cascade control architecture|uncertainty/i.test(lower)) return 13;
        // 14. Mechanical Design and Analysis
        if (/modified goodman fatigue criterion|modified goodman fatigue failure|soderberg theory|s-n fatigue curve|maximum shear stress theory|distortion energy theory|maximum normal stress theory|coulomb-mohr and modified mohr|marin factors for fatigue|helical compression spring|equivalent spring stiffness for springs in parallel and series|rolling element bearing rated|equivalent dynamic radial load|power screws lifting torque|flat belt friction|agma lewis bending|asme transmission shaft|spur gear geometry|bolted joint preload|pressure relief valve sizing|types of fits|first angle vs\. third|geometric dimensioning and tolerancing/i.test(lower)) return 14;

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
        if (/rectilinear kinematics|constant acceleration motion|relative motion|normal and tangential acceleration|uniform circular motion|instantaneous center of rotation|kennedy's rule|planar rigid body relative velocity|particle kinetics: direct|kinetic friction|planar rigid body equations of motion|newton’s second law for rigid|mass moment of inertia|linear impulse and momentum|angular impulse and momentum|coefficient of restitution|conservation of linear and angular momentum|work-energy principle|kinetic energy|rotational kinetic energy|dynamic friction|sdof undamped natural frequency|damped sdof natural frequency|logarithmic decrement|vibration transmissibility|vibration/i.test(lower) || /dynamics/i.test(tip)) return 9;

        // 10. Strength of Materials
        if (/differential relationships between load, shear|axial stress and elongation|poisson’s ratio|elastic flexure formula|beam flexure formula|torsion formula|polar moment of inertia|pure torsion of circular shafts|transverse shear stress in beams|maximum shear stress in rectangular|thermal expansion deformation and thermal stress|elastic section modulus|helical compression spring|agma lewis bending|combined axial and bending|beam deflection differential|cantilever beam tip deflection|simply supported beam center deflection|moment-area first theorem|moment-area second theorem|elastic strain energy|analytical in-plane principal stresses|maximum shear stress theory|distortion energy theory|maximum normal stress theory|coulomb-mohr and modified mohr|euler’s critical buckling|slenderness ratio for steel|thin-walled pressure vessel|modified goodman|soderberg|s-n fatigue curve|marin factor|rolling element bearing|cantilever sheet pile/i.test(lower) || /mechanics of materials|mechanical design/i.test(tip)) return 10;

        // 11. Materials
        if (/binary eutectic phase diagram|iron-carbon microstructures|binary phase diagram lever rule|engineering stress-strain vs|modulus of resilience vs|factor of safety definition|cubic crystal structures|types of fits|first angle vs\. third angle/i.test(lower) || /material/i.test(tip)) return 11;

        // 12. Fluid Mechanics
        if (/newton's law of viscosity|surface tension|capillarity|capillary rise height|drag coefficient and lift|reynolds number|speed of sound & mach|hydrostatic pressure distribution|buoyancy and metacentric|hydrostatic center of pressure|archimedes’ principle|bernoulli’s principle|continuity equation|linear impulse-momentum for fluid|modified fluid energy equation|darcy-weisbach|hydraulic diameter for non-circular|laminar flow friction factor|minor head losses in pipe|manning’s equation|pitot tube|venturi meter|orifice meter|orifice discharging freely|net positive suction head|pump hydraulic power|centrifugal pump affinity laws|pump specific speed/i.test(lower) || /fluid/i.test(tip)) return 12;

        // 13. Basic Electrical Engineering
        if (/ohm’s law and joule|kirchhoff|first-order rc transient|equivalent resistance in series|series rlc resonance|equivalent capacitance and inductance|ac power triangle|wheatstone bridge|thevenin’s equivalent|poynting vector|ideal transformer|three-phase induction motor|dc motor back-emf/i.test(lower) || /electrical/i.test(tip)) return 13;

        // 14. Thermodynamics and Heat Transfer
        if (/zeroth law of thermodynamics|first law of thermodynamics \(closed|second law of thermodynamics \(carnot|ideal gas law equation|van der waals|compressibility factor|mole fraction vs\. mass fraction|isothermal process|steady-flow energy equation|ideal rankine cycle|ideal otto cycle|coefficient of performance \(cop\)|fourier’s law of thermal conduction|critical radius of thermal insulation|newton’s law of cooling|stefan-boltzmann law|biot number vs\. fourier|log mean temperature difference|overall heat transfer coefficient|effectiveness-ntu method|conduction through a plain|conduction through a cylindrical|thermal resistance of an object|pool boiling curve|condensation heat transfer|dry-bulb, wet-bulb|absolute humidity vs\.|psychrometric chart|hvac processes|combustion theoretical air|excess air and theoretical/i.test(lower) || /thermodynamics|heat transfer/i.test(tip)) return 14;

        return 1;
    }


    function syncSubjectSelectVisibility() {
        const select = document.getElementById('fc-subject-select');
        if (!select) return;
        const actualDisc = (currentDiscipline === 'current' || !currentDiscipline) 
            ? getActiveDiscipline() 
            : currentDiscipline;
        const hasSubjects = (actualDisc === 'Mechanical' || actualDisc === 'Other');
        const isDesktop = window.innerWidth >= 1024; // Desktop and Laptop only

        if (hasSubjects && isDesktop) {
            select.classList.remove('hidden');
            select.classList.add('lg:inline-block');
        } else {
            select.classList.add('hidden');
            select.classList.remove('lg:inline-block');
        }
    }

    function updateSubjectSelectOptions(fullDeck, actualDisc) {
        const select = document.getElementById('fc-subject-select');
        if (!select) return;

        const isOther = (actualDisc === 'Other');
        const subjectList = isOther ? OTHER_SUBJECTS : MECHANICAL_SUBJECTS;
        const getSubjectFn = isOther ? getOtherSubjectId : getMechanicalSubjectId;

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

        // Tag Mechanical or Other cards with subject information
        if (actualDisc === 'Mechanical') {
            allTheorems.forEach(card => {
                card.subjectId = getMechanicalSubjectId(card.title, card.examTip);
                const subObj = MECHANICAL_SUBJECTS.find(s => s.id === card.subjectId);
                card.subjectName = subObj ? subObj.name : '1. Mathematics';
            });

            // Apply subject filter if selected
            if (subjectFilter && subjectFilter !== 'all') {
                const targetSubId = Number(subjectFilter);
                allTheorems = allTheorems.filter(card => card.subjectId === targetSubId);
            }
        } else if (actualDisc === 'Other') {
            allTheorems.forEach(card => {
                card.subjectId = getOtherSubjectId(card.title, card.examTip, card.description);
                const subObj = OTHER_SUBJECTS.find(s => s.id === card.subjectId);
                card.subjectName = subObj ? subObj.name : '1. Mathematics';
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
        isFlipped = false;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');

        // Update flip button text
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = 'Flip Card';

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
            if ((card.disc === 'Mechanical' || card.disc === 'Other') && card.subjectName) {
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
                frontFormulaView.innerHTML = card.formula || '';
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
        if (backFormula) backFormula.innerHTML = card.formula || '';
        if (backDesc) backDesc.innerHTML = card.description || '';
        if (backTip) backTip.innerHTML = card.examTip || '';

        // If card is currently flipped, typeset back math now
        if (isFlipped) {
            triggerMathTypeset([backFormula, backDesc, backTip, backTitle]);
        }

        // Responsive Media Layout on Back (Video prominent; Blueprint moved to front face)
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

        if (hasVideo) {
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'w-full lg:col-span-7 flex flex-col space-y-2 mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'w-full lg:col-span-5 flex flex-col justify-between space-y-3';
            }

            if (backVideo) {
                backVideo.src = card.videoUrl;
                backVideo.load();
            }

            if (backVideoContainer) backVideoContainer.classList.remove('hidden');
            if (backImgContainer) backImgContainer.classList.add('hidden');

            // Hide tab switcher - technical blueprint image is now prominently displayed on the front side of the card!
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
        } else if (hasImage) {
            // Blueprint fallback on back only if no video exists
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'w-full lg:col-span-7 flex flex-col space-y-2 mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'w-full lg:col-span-5 flex flex-col justify-between space-y-3';
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

        // Initialize In-Video Karaoke Captions
        initKaraokeCues(card);
        wireKaraokeVideoEvents();
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
            if (subtext) subtext.textContent = 'Auto-plays on flip • Tap for controls';

            const card = currentDeck[currentIndex];
            if (badge) badge.textContent = (card && card.videoDuration) || '10s';

            if (btnVideo) {
                btnVideo.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm';
            }
            if (btnBlueprint) {
                btnBlueprint.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-slate-200';
            }
            if (isFlipped && video && card && card.videoUrl) {
                const p = video.play();
                if (p !== undefined) p.catch(() => {});
            }
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

    // Flip action
    function flipCard() {
        if (currentDeck.length === 0) return;
        const inner = document.getElementById('fc-flip-inner');
        if (!inner) return;

        isFlipped = !isFlipped;
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = isFlipped ? 'View Front' : 'Flip Card';

        if (isFlipped) {
            inner.classList.add('flipped');

            const card = currentDeck[currentIndex];
            const backFormula = document.getElementById('fc-back-formula');
            const backDesc = document.getElementById('fc-back-desc');
            const backTip = document.getElementById('fc-back-tip');
            const backTitle = document.getElementById('fc-back-title');

            if (card) {
                if (backTitle) backTitle.innerHTML = card.title || '';
                if (backFormula) backFormula.innerHTML = card.formula || '';
                if (backDesc) backDesc.innerHTML = card.description || '';
                if (backTip) backTip.innerHTML = card.examTip || '';
            }

            const backEls = [backFormula, backDesc, backTip, backTitle].filter(Boolean);
            // Trigger typeset immediately and staggered across 3D rotation
            triggerMathTypeset(backEls);
            setTimeout(() => triggerMathTypeset(backEls), 120);
            setTimeout(() => triggerMathTypeset(backEls), 320);

            // Auto-play explainer video if present
            if (card && card.videoUrl && activeMediaTab === 'video') {
                setTimeout(() => {
                    const video = document.getElementById('fc-back-video');
                    if (video) {
                        video.currentTime = 0;
                        const p = video.play();
                        if (p !== undefined) p.catch(() => {});
                    }
                }, 180);
            }
        } else {
            inner.classList.remove('flipped');
            const video = document.getElementById('fc-back-video');
            if (video) video.pause();
        }
    }

    // Previous card action
    function prevCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        // Always return to front face when navigating cards
        isFlipped = false;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = 'Flip Card';

        currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
        renderCard();
    }

    // Next card action
    function nextCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        // Always return to front face when navigating cards
        isFlipped = false;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = 'Flip Card';

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
        if (actualDisc !== 'Mechanical' && actualDisc !== 'Other') {
            currentSubjectFilter = 'all';
        }

        currentDeck = buildSessionQueue(currentDiscipline, currentMode, currentSubjectFilter);
        currentIndex = 0;
        isFlipped = false;

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

        if (actualDisc === 'Mechanical' || actualDisc === 'Other') {
            const datasets = window.THEOREMS_BY_DISCIPLINE || {};
            const fullDeck = (datasets[actualDisc] || []);
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
        if (video) video.pause();

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
            flipCard();
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
