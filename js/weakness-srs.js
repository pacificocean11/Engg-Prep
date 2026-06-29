document.addEventListener('DOMContentLoaded', () => {
    const state = window.state;

    // ================================================================
    // SMART WEAKNESS ANALYZER & SPACED REPETITION SYSTEM (SRS)
    // ================================================================
    const WEAKNESS_KEY = () => `enggtv_weakness_${state.user.username}`;
    const SRS_KEY = () => `enggtv_srs_${state.user.username}`;

    /**
     * Called at the end of finishQuiz/navigation.
     * Records wrong-answer topic data into localStorage per user.
     */
    function recordWeaknessData() {
        if (!state.user || !state.user.username) return;
        const rawData = (() => {
            try { return JSON.parse(localStorage.getItem(WEAKNESS_KEY())) || {}; }
            catch (e) { return {}; }
        })();

        state.quizQuestions.forEach((q, idx) => {
            if (!state.submitted[idx]) return;
            const topicKey  = (q.topic || 'General').trim();
            const subjectId = q.subjectId || (state.currentSubject && state.currentSubject.id) || 'unknown';
            const key       = subjectId + '::' + topicKey;

            if (!rawData[key]) rawData[key] = { topic: topicKey, subjectId, wrong: 0, total: 0 };
            rawData[key].total++;
            const selectedIdx = state.answers[idx];
            const isCorrect   = selectedIdx !== null && q.options[selectedIdx] && q.options[selectedIdx].is_correct;
            if (!isCorrect) rawData[key].wrong++;
        });

        localStorage.setItem(WEAKNESS_KEY(), JSON.stringify(rawData));
    }

    function recordSRS(question, isCorrect) {
        if (!question || !question.title || !state.user || !state.user.username) return;
        let srsData = JSON.parse(localStorage.getItem(SRS_KEY()) || '{}');
        const qId = question.title; // Unique identifier

        let item = srsData[qId] || { interval: 0, nextReview: Date.now() };

        if (isCorrect) {
            if (item.interval === 0) item.interval = 1;
            else if (item.interval === 1) item.interval = 3;
            else if (item.interval === 3) item.interval = 7;
            else if (item.interval === 7) item.interval = 14;
            else item.interval = 30; // Max out at 30 days
        } else {
            item.interval = 0; // Reset interval to 0 days
        }

        item.nextReview = Date.now() + (item.interval * 24 * 60 * 60 * 1000);
        
        srsData[qId] = item;
        localStorage.setItem(SRS_KEY(), JSON.stringify(srsData));
        if (state.currentPage === 'dashboard') renderSRSCard();
    }

    function renderSRSCard() {
        const card = document.getElementById('srs-review-card');
        const dueCountBadge = document.getElementById('srs-due-count');
        if (!card || !dueCountBadge) return;
        if (!state.user || !state.user.username) {
            card.classList.add('hidden');
            return;
        }

        let srsData = JSON.parse(localStorage.getItem(SRS_KEY()) || '{}');
        const now = Date.now();
        
        let dueCount = 0;
        for (const [key, item] of Object.entries(srsData)) {
            if (item.nextReview <= now) dueCount++;
        }

        if (dueCount > 0) {
            dueCountBadge.textContent = `${dueCount} DUE`;
        } else {
            dueCountBadge.textContent = `0 DUE`;
        }
        card.classList.remove('hidden');
    }

    function startFocusQuiz() {
        const entries = window._weakTopicEntries || [];
        if (entries.length === 0) {
            window.showToast('No weak topics yet!', 'Complete a few quizzes first.', 'psychology');
            return;
        }

        let quizPool = [];
        const sourceBank = (window.getQuestionsSource ? window.getQuestionsSource() : QUESTIONS);
        Object.keys(sourceBank).forEach(subj => {
            sourceBank[subj].forEach(q => quizPool.push({ ...q, subjectId: subj }));
        });

        // Filter questions belonging to the top weak topics
        const weakKeys = entries.map(e => e.key);
        let matchedQuestions = quizPool.filter(q => {
            const topicKey = (q.topic || 'General').trim();
            const subjectId = q.subjectId || 'unknown';
            const key = subjectId + '::' + topicKey;
            return weakKeys.includes(key);
        });

        if (matchedQuestions.length === 0) {
            window.showToast('No questions found', 'Try practicing more topics first.', 'quiz');
            return;
        }

        matchedQuestions.sort(() => 0.5 - Math.random());
        matchedQuestions = matchedQuestions.slice(0, 10);

        state.quizQuestions = matchedQuestions;
        state.currentQuestionIndex = 0;
        state.answers = new Array(state.quizQuestions.length).fill(null);
        state.submitted = new Array(state.quizQuestions.length).fill(false);
        state.flagged   = new Array(state.quizQuestions.length).fill(false);
        state.confidence = new Array(state.quizQuestions.length).fill(null);
        state.questionTimes = new Array(state.quizQuestions.length).fill(0);
        state.questionEnteredAt = Date.now();
        state.score     = 0;
        state.secondsElapsed = 0;
        state.isFinished    = false;
        state.isMockExam    = false;
        state.currentSubject = { name: "Focus Zone Quiz", id: "focus-zone" };

        if (window.navigateTo) window.navigateTo('quiz-view');
        if (window.updateQuestionMap) window.updateQuestionMap();
        if (window.loadQuestion) window.loadQuestion();
        if (window.startTimer) window.startTimer();
    }

    /**
     * Renders the Focus Zone card on the dashboard.
     */
    function renderFocusZone() {
        const card      = document.getElementById('focus-zone-card');
        const listEl    = document.getElementById('weak-topics-list');
        if (!card || !listEl) return;
        if (!state.user || !state.user.username) {
            card.classList.add('hidden');
            return;
        }

        const rawData = (() => {
            try { return JSON.parse(localStorage.getItem(WEAKNESS_KEY())) || {}; }
            catch (e) { return {}; }
        })();

        // Filter: at least 2 attempts, compute error rate
        const entries = Object.entries(rawData)
            .filter(([, v]) => v.total >= 2)
            .map(([key, v]) => ({ key, ...v, rate: v.wrong / v.total }))
            .sort((a, b) => b.rate - a.rate)
            .slice(0, 3);

        if (entries.length === 0) {
            listEl.innerHTML = `<div class="text-xs text-center text-slate-400 py-6 italic border border-dashed border-slate-200 dark:border-slate-700 rounded-xl">Complete quizzes to see AI analysis of your weak topics here.</div>`;
            card.classList.remove('hidden');
            return;
        }

        card.classList.remove('hidden');
        listEl.innerHTML = entries.map((entry, i) => {
            const pct   = Math.round(entry.rate * 100);
            const color = pct >= 70 ? 'bg-red-500' : pct >= 40 ? 'bg-amber-500' : 'bg-yellow-400';
            const textColor = pct >= 70 ? 'text-red-500' : pct >= 40 ? 'text-amber-500' : 'text-yellow-500';
            return `
                <div class="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl">
                    <div class="w-7 h-7 rounded-xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
                        <span class="text-sm font-black text-amber-600">${i + 1}</span>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">${entry.topic}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <div class="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div class="${color} h-full rounded-full" style="width:${pct}%"></div>
                            </div>
                            <span class="text-[10px] font-black ${textColor}">${pct}% errors</span>
                        </div>
                    </div>
                    <span class="text-[9px] text-slate-400 font-medium shrink-0">${entry.wrong}/${entry.total}</span>
                </div>
            `;
        }).join('');

        // Store current weak topics for the focus quiz
        window._weakTopicEntries = entries;
    }

    // Expose globally
    window.recordWeaknessData = recordWeaknessData;
    window.recordSRS = recordSRS;
    window.renderSRSCard = renderSRSCard;
    window.renderFocusZone = renderFocusZone;
    window.startFocusQuiz = startFocusQuiz;

    // Attach listeners
    const btnSrs = document.getElementById('btn-start-srs-quiz');
    if (btnSrs) {
        btnSrs.addEventListener('click', () => {
            if (!state.user || !state.user.username) return;
            let srsData = JSON.parse(localStorage.getItem(SRS_KEY()) || '{}');
            const now = Date.now();
            let dueTitles = Object.keys(srsData).filter(key => srsData[key].nextReview <= now);
            
            if (dueTitles.length === 0) {
                window.showToast('All Caught Up!', 'There are no questions due for spaced repetition right now. Great job!', 'check_circle');
                return;
            }

            let quizPool = [];
            const sourceBank = (window.getQuestionsSource ? window.getQuestionsSource() : QUESTIONS);
            Object.keys(sourceBank).forEach(subj => {
                sourceBank[subj].forEach(q => quizPool.push({ ...q, subjectId: subj }));
            });

            let srsQuestions = quizPool.filter(q => dueTitles.includes(q.title));
            srsQuestions.sort(() => 0.5 - Math.random());
            srsQuestions = srsQuestions.slice(0, 10); // Cap daily review session length
            
            if (srsQuestions.length === 0) return;

            state.quizQuestions = srsQuestions;
            state.currentQuestionIndex = 0;
            state.answers = new Array(state.quizQuestions.length).fill(null);
            state.submitted = new Array(state.quizQuestions.length).fill(false);
            state.flagged   = new Array(state.quizQuestions.length).fill(false);
            state.confidence = new Array(state.quizQuestions.length).fill(null);
            state.questionTimes = new Array(state.quizQuestions.length).fill(0);
            state.questionEnteredAt = Date.now();
            state.score     = 0;
            state.secondsElapsed = 0;
            state.isFinished    = false;
            state.isMockExam    = false;
            state.currentSubject = { name: "Spaced Repetition Zone", id: "srs-review" };

            if (window.navigateTo) window.navigateTo('quiz-view');
            if (window.updateQuestionMap) window.updateQuestionMap();
            if (window.loadQuestion) window.loadQuestion();
            if (window.startTimer) window.startTimer();
        });
    }

    const btnFocusQuiz = document.getElementById('btn-start-focus-quiz');
    if (btnFocusQuiz) btnFocusQuiz.addEventListener('click', startFocusQuiz);

    // Hook weakness recording and rendering into the global navigation function
    const _origNav = window.navigateTo;
    if (_origNav) {
        window.navigateTo = function(pageId) {
            if (pageId === 'results-view') {
                recordWeaknessData();
            }
            _origNav(pageId);
            if (pageId === 'dashboard') {
                renderSRSCard();
                renderFocusZone();
            }
        };
    }

    // Initial render of SRS and Focus Zone
    renderSRSCard();
    renderFocusZone();
});
