/**
 * ENGG.tv - Ingestion Engine for FE Solved Practice Problems
 * Merges solved problems from window.solvedProblemsData into Topic Quiz banks (window.QUESTIONS)
 */
(function() {
    window.QUESTIONS = window.QUESTIONS || {};
    window.__INGESTED_SOLVED_PROBLEMS__ = false;
    let ingestionPromise = null;

    const SUBJECT_MAP = {
        'MATH': 'math',
        'Mathematics': 'math',
        'PROB': 'stats',
        'Probability and Statistics': 'stats',
        'ETHC': 'ethics',
        'Engineering Ethics and Societal Impacts': 'ethics',
        'Ethics': 'ethics',
        'ECON': 'econ',
        'Engineering Economics': 'econ',
        'ELEC': 'electricity',
        'Electricity, Power, and Magnetism': 'electricity',
        'Electricity and Magnetism': 'electricity',
        'STCS': 'statics',
        'Statics': 'statics',
        'DYNM': 'dynamics',
        'Dynamics': 'dynamics',
        'MOMT': 'materials-strength',
        'Strength of Materials': 'materials-strength',
        'Mechanics of Materials': 'materials-strength',
        'MTRL': 'materials-science',
        'Materials Science': 'materials-science',
        'FLUD': 'fluids',
        'Fluid Mechanics': 'fluids',
        'THRM': 'thermo',
        'Thermodynamics': 'thermo',
        'HTTR': 'heat',
        'Heat Transfer': 'heat',
        'MICT': 'instr-controls',
        'Measurements, Instrumentation, and Controls': 'instr-controls',
        'Instrumentation and Controls': 'instr-controls',
        'DSGN': 'design',
        'Mechanical Design and Analysis': 'design',
        'Mechanical Design': 'design',
        'CNST': 'construction',
        'Construction Engineering': 'construction',
        'Geotechnical Engineering': 'geotech',
        'Structural Engineering': 'structural',
        'Surveying': 'surveying',
        'Transportation Engineering': 'transport',
        'Water Resources and Environmental Engineering': 'water-res',
        'Circuit Analysis': 'circuits',
        'Communications': 'communications',
        'Computer Networks': 'networks',
        'Digital Systems': 'digital-systems',
        'Electromagnetics': 'electromagnetics',
        'Electronics': 'electronics',
        'Linear Systems': 'linear-systems',
        'Signal Processing': 'signals',
        'Power Systems': 'power',
        'Software Engineering': 'software',
        'Control Systems': 'control-systems',
        'Computer Systems': 'computer-systems',
        'Chemical Reaction Engineering': 'reaction-eng',
        'Chemistry and Biology': 'chem-bio',
        'Chemistry': 'chemistry',
        'Mass Transfer and Separation': 'mass-sep',
        'Solids Handling': 'solids',
        'Process Design': 'process-design',
        'Process Design and Economics': 'process-design',
        'Process Control': 'process-control',
        'Fundamental Principles': 'principles',
        'Air Quality and Control': 'air-quality',
        'Environmental Chemistry': 'env-chem',
        'Groundwater, Soils, and Sediments': 'groundwater-soils',
        'Solid and Hazardous Waste': 'waste',
        'Water and Wastewater': 'water-wastewater',
        'Surface Water Resources and Hydrology': 'water-hydrology',
        'Safety, Health, and Environment': 'safety',
        'Energy and Environment': 'energy-env',
        'Engineering Management': 'eng-mgmt',
        'Facilities and Supply Chain': 'supply-chain',
        'Human Factors, Ergonomics, and Safety': 'ergonomics',
        'Manufacturing, Service, and Other Production Systems': 'production',
        'Modeling and Quantitative Analysis': 'modeling',
        'Quality': 'quality',
        'Systems Engineering, Analysis, and Design': 'systems',
        'Work Design': 'work-design'
    };

    function transformSolvedProblem(p, subjectId) {
        const correctLabel = String(p.ans || '').trim().toUpperCase();
        const options = (p.options || []).map(opt => {
            const optLabel = String(opt.label || '').trim().toUpperCase();
            return {
                label: optLabel,
                text: opt.text || '',
                is_correct: (optLabel === correctLabel)
            };
        });

        const solutionContent = (p.solution && p.solution.trim()) 
            ? p.solution 
            : `<p>The correct answer is <strong>Option ${correctLabel}</strong>.</p>`;

        const title = p.topic || p.chapter || 'FE Solved Practice Problem';
        const topic = p.topic || 'General Practice';

        return {
            id: p.id ? `solved_${p.id}` : `solved_${p.qnum || Math.random().toString(36).substr(2, 9)}`,
            topic: topic,
            title: title,
            question: p.question || '',
            question_image: '',
            local_question_image: '',
            times_presented: 0,
            options: options,
            solution: {
                steps: [
                    {
                        title: 'Worked Solution',
                        content: solutionContent
                    }
                ],
                final_answer: correctLabel,
                solution_image: '',
                video_explanation: p.vidurl || ''
            },
            ncees_reference: {
                version: '10.6',
                section: p.chapter || p.subject || '',
                topic: topic,
                search_term: topic.toLowerCase(),
                page_number: p.handbook_pg > 0 ? p.handbook_pg : null
            },
            copilot_explanation: {
                big_idea: `This solved practice problem tests concepts in **${topic}** (${p.chapter || p.subject || 'FE Syllabus'}).`,
                ncees_shortcut: p.handbook_pg > 0 ? `Consult NCEES FE Reference Handbook page ${p.handbook_pg}.` : `Search the NCEES FE Reference Handbook under **${p.chapter || p.subject || topic}**.`,
                step_by_step: [
                    {
                        step: '1. Solution Breakdown',
                        explanation: solutionContent
                    }
                ],
                common_pitfalls: [
                    'Double check unit conversions and sign conventions.',
                    'Verify governing equations and boundary assumptions.'
                ]
            },
            difficulty: p.difficulty || 'Numerical',
            source: p.source ? `FE Solved Problem • ${p.source}` : 'FE Solved Practice Problem',
            isSolvedProblem: true
        };
    }

    function ingestSolvedProblems() {
        if (!window.solvedProblemsData) return false;

        let addedCount = 0;
        const data = window.solvedProblemsData;

        for (const topicKey in data) {
            const problems = data[topicKey];
            if (!Array.isArray(problems)) continue;

            problems.forEach(p => {
                const rawSub = p.subject ? p.subject.trim() : '';
                const subjectId = SUBJECT_MAP[rawSub] || SUBJECT_MAP[p.subject];
                if (!subjectId) return;

                window.QUESTIONS[subjectId] = window.QUESTIONS[subjectId] || [];
                const targetList = window.QUESTIONS[subjectId];

                const pId = p.id ? `solved_${p.id}` : null;
                const normSnippet = (p.question || '').trim().toLowerCase().slice(0, 60);

                const exists = targetList.some(q => 
                    (pId && q.id === pId) || 
                    (q.question && q.question.trim().toLowerCase().slice(0, 60) === normSnippet)
                );

                if (!exists) {
                    targetList.push(transformSolvedProblem(p, subjectId));
                    addedCount++;
                }
            });
        }

        window.__INGESTED_SOLVED_PROBLEMS__ = true;
        console.log(`⚡ Ingested ${addedCount} FE Solved Problems into Topic Quiz Question Banks.`);

        // Re-render subjects if Assessment Center is active
        try {
            if (typeof window.renderSubjects === 'function') {
                const subjectList = document.getElementById('subject-list');
                const studyPage = document.getElementById('study');
                if (subjectList && studyPage && studyPage.classList.contains('active')) {
                    window.renderSubjects();
                }
            }
        } catch (e) {
            console.error('Error refreshing subject list after ingestion:', e);
        }

        return true;
    }

    window.ensureSolvedProblemsIngested = function() {
        if (window.__INGESTED_SOLVED_PROBLEMS__) {
            return Promise.resolve(true);
        }
        if (ingestionPromise) {
            return ingestionPromise;
        }

        ingestionPromise = new Promise((resolve) => {
            if (window.solvedProblemsData) {
                ingestSolvedProblems();
                resolve(true);
                return;
            }

            let attempts = 0;
            const maxAttempts = 100;
            const timer = setInterval(() => {
                attempts++;
                if (window.solvedProblemsData) {
                    clearInterval(timer);
                    ingestSolvedProblems();
                    resolve(true);
                } else if (attempts >= maxAttempts) {
                    clearInterval(timer);
                    resolve(false);
                }
            }, 50);

            if (typeof window.loadSolvedProblemsData === 'function') {
                window.loadSolvedProblemsData();
            }
        });

        return ingestionPromise;
    };

    window.ingestSolvedProblems = ingestSolvedProblems;

    // Auto-ingest when window.solvedProblemsData is set or when script loads
    if (window.solvedProblemsData) {
        ingestSolvedProblems();
    }
})();
