// Lightweight dynamic questions loader for ENGG.tv
(function() {
    window.QUESTIONS = window.QUESTIONS || {};
    window.__LOADED_DISCIPLINES__ = window.__LOADED_DISCIPLINES__ || {};
    window.__PENDING_DISCIPLINES__ = window.__PENDING_DISCIPLINES__ || {};

    function normalizeDiscipline(disc) {
        if (!disc) return 'mechanical';
        const lower = String(disc).toLowerCase().trim();
        if (lower.includes('mech')) return 'mechanical';
        if (lower.includes('civ')) return 'civil';
        if (lower.includes('elec') || lower.includes('computer')) return 'electrical';
        if (lower.includes('chem')) return 'chemical';
        if (lower.includes('env')) return 'environmental';
        if (lower.includes('ind')) return 'industrial';
        return 'other';
    }

    function loadDisciplineQuestions(discipline) {
        const key = normalizeDiscipline(discipline);
        if (window.__LOADED_DISCIPLINES__[key]) {
            return Promise.resolve();
        }
        if (window.__PENDING_DISCIPLINES__[key]) {
            return window.__PENDING_DISCIPLINES__[key];
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `questions_${key}.js?v=4`;
            script.async = true;
            script.onload = () => {
                window.__LOADED_DISCIPLINES__[key] = true;
                delete window.__PENDING_DISCIPLINES__[key];
                console.log(`⚡ Questions loaded for discipline: ${key}`);
                resolve();
            };
            script.onerror = (err) => {
                delete window.__PENDING_DISCIPLINES__[key];
                console.error(`Failed to load questions for discipline: ${key}`, err);
                reject(err);
            };
            document.head.appendChild(script);
        });

        window.__PENDING_DISCIPLINES__[key] = promise;
        return promise;
    }

    window.normalizeDiscipline = normalizeDiscipline;
    window.loadDisciplineQuestions = loadDisciplineQuestions;

    // Helper: Ensure questions for a given subjectId are loaded
    window.ensureSubjectQuestionsLoaded = async function(subjectId) {
        if (window.QUESTIONS && window.QUESTIONS[subjectId] && window.QUESTIONS[subjectId].length > 0) {
            return true;
        }

        // Determine which discipline contains this subject
        const discChecks = [
            { key: 'mechanical', list: window.MECHANICAL_SUBJECTS },
            { key: 'civil', list: window.CIVIL_SUBJECTS },
            { key: 'electrical', list: window.ELECTRICAL_COMPUTER_SUBJECTS },
            { key: 'chemical', list: window.CHEMICAL_SUBJECTS },
            { key: 'environmental', list: window.ENVIRONMENTAL_SUBJECTS },
            { key: 'industrial', list: window.INDUSTRIAL_SUBJECTS },
            { key: 'other', list: window.OTHER_SUBJECTS }
        ];

        let targetDisc = 'mechanical';
        for (const item of discChecks) {
            if (item.list && item.list.some(s => s.id === subjectId)) {
                targetDisc = item.key;
                break;
            }
        }

        await loadDisciplineQuestions(targetDisc);
        return !!(window.QUESTIONS && window.QUESTIONS[subjectId]);
    };

    // Immediately load the active user's discipline
    const initialDiscipline = localStorage.getItem('enggtv_discipline') || 'Mechanical';
    window.currentDisciplinePromise = loadDisciplineQuestions(initialDiscipline);
})();
