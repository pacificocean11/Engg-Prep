document.addEventListener('DOMContentLoaded', () => {
    // ===== GLOBAL DEEP SEARCH =====
    const globalSearchInput = document.getElementById('global-search-input');
    const globalSearchModal = document.getElementById('global-search-modal');
    const btnCloseSearch = document.getElementById('btn-close-search');
    const searchResultsContainer = document.getElementById('search-results-container');
    const searchResultsFooter = document.getElementById('search-results-footer');
    const searchResultCount = document.getElementById('search-result-count');
    const searchQueryDisplay = document.getElementById('search-query-display');
    const btnStartSearchQuiz = document.getElementById('btn-start-search-quiz');

    let currentSearchResults = [];
    let searchDebounceTimer = null;

    function renderSearchResults(query, results) {
        searchQueryDisplay.textContent = `"${query}"`;
        searchResultsContainer.innerHTML = '';
        currentSearchResults = results;

        if (results.length === 0) {
            searchResultsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center py-10 text-center">
                    <span class="material-symbols-outlined text-4xl text-slate-300 mb-2">search_off</span>
                    <p class="text-slate-500 font-bold">No results found.</p>
                    <p class="text-xs text-slate-400 mt-1">Try searching for broader terms like "fluid", "force", or "entropy".</p>
                </div>
            `;
            searchResultsFooter.classList.add('hidden');
            return;
        }

        results.forEach((q, idx) => {
            const el = document.createElement('div');
            el.className = "bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700/50 hover:shadow-md transition-shadow";
            
            const topicLabel = q.topic || 'General';
            
            el.innerHTML = `
                <div class="flex justify-between items-start mb-2">
                    <span class="text-[9px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-0.5 rounded-full">${topicLabel}</span>
                    ${q.isAdvanced ? '<span class="text-[9px] font-bold uppercase tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">Advanced</span>' : ''}
                </div>
                <h4 class="font-bold text-slate-800 dark:text-slate-100 text-sm mb-1">${q.title || 'Practice Question'}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${(q.question || '').replace(/<[^>]*>?/gm, '')}</p>
            `;
            searchResultsContainer.appendChild(el);
        });

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([searchResultsContainer]).catch(err => console.error(err));
        }

        searchResultCount.textContent = results.length;
        searchResultsFooter.classList.remove('hidden');
    }

    function performSearch(query) {
        if (!query || query.trim().length < 2) {
            globalSearchModal.classList.remove('opacity-100');
            setTimeout(() => globalSearchModal.classList.add('hidden'), 300);
            return;
        }

        const qLower = query.toLowerCase();
        let allQuestions = [];

        // Safely access standard bank
        let standardBank = null;
        if (typeof window.getQuestionsSource === 'function') {
            standardBank = window.getQuestionsSource();
        } else if (typeof QUESTIONS !== 'undefined') {
            standardBank = QUESTIONS;
        }

        if (standardBank) {
            Object.keys(standardBank).forEach(subj => {
                if (Array.isArray(standardBank[subj])) {
                    standardBank[subj].forEach(q => allQuestions.push({ ...q, subjectId: subj, isAdvanced: false }));
                }
            });
        }

        // Safely access advanced bank
        if (typeof ADVANCED_QUESTIONS !== 'undefined' && ADVANCED_QUESTIONS) {
            Object.keys(ADVANCED_QUESTIONS).forEach(subj => {
                if (Array.isArray(ADVANCED_QUESTIONS[subj])) {
                    ADVANCED_QUESTIONS[subj].forEach(q => allQuestions.push({ ...q, subjectId: subj, isAdvanced: true }));
                }
            });
        }

        const results = allQuestions.filter(q => {
            const matchesTitle = (q.title && q.title.toLowerCase().includes(qLower));
            const matchesTopic = (q.topic && q.topic.toLowerCase().includes(qLower));
            const matchesQuestion = (q.question && q.question.toLowerCase().includes(qLower));
            
            let matchesSolution = false;
            if (q.solution && q.solution.steps) {
                matchesSolution = q.solution.steps.some(step => step.content && step.content.toLowerCase().includes(qLower));
            }
            
            return matchesTitle || matchesTopic || matchesQuestion || matchesSolution;
        });

        globalSearchModal.classList.remove('hidden');
        setTimeout(() => globalSearchModal.classList.add('opacity-100'), 10);

        renderSearchResults(query, results);
    }

    if (globalSearchInput) {
        globalSearchInput.addEventListener('input', (e) => {
            clearTimeout(searchDebounceTimer);
            searchDebounceTimer = setTimeout(() => {
                performSearch(e.target.value);
            }, 400); 
        });
    }

    if (btnCloseSearch) {
        btnCloseSearch.addEventListener('click', () => {
            globalSearchModal.classList.remove('opacity-100');
            setTimeout(() => {
                globalSearchModal.classList.add('hidden');
            }, 300);
        });
    }

    if (btnStartSearchQuiz) {
        btnStartSearchQuiz.addEventListener('click', () => {
            if (currentSearchResults.length === 0) return;
            
            const state = window.state;
            if (!state) {
                console.error("Global state is not defined yet.");
                return;
            }
            
            globalSearchModal.classList.remove('opacity-100');
            setTimeout(() => globalSearchModal.classList.add('hidden'), 300);
            
            const selected = currentSearchResults.sort(() => 0.5 - Math.random()).slice(0, 20);

            state.currentSubject = { id: 'search', name: 'Custom Search Quiz' };
            state.currentTopic   = 'Search Results';
            state.quizQuestions  = window.prepareQuestions ? window.prepareQuestions(selected) : selected;
            state.currentQuestionIndex = 0;
            state.answers   = new Array(state.quizQuestions.length).fill(null);
            state.submitted = new Array(state.quizQuestions.length).fill(false);
            state.flagged   = new Array(state.quizQuestions.length).fill(false);
            state.confidence = new Array(state.quizQuestions.length).fill(null);
            state.questionTimes = new Array(state.quizQuestions.length).fill(0);
            state.questionEnteredAt = Date.now();
            state.score     = 0;
            state.secondsElapsed = 0;
            state.isFinished    = false;
            state.isMockExam    = false;

            if (window.navigateTo) window.navigateTo('quiz-view');
            if (window.updateQuestionMap) window.updateQuestionMap();
            if (window.loadQuestion) window.loadQuestion();
            if (window.startTimer) window.startTimer();
            globalSearchInput.value = '';
        });
    }
});
