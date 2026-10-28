/**
 * ENGG.tv - Simplistic Study Mode (Zen Focus Mode)
 * Distraction-free 2-tab micro-learning tool:
 * Tab 1: Single discipline FE Theorem/Formula with shuffle icon
 * Tab 2: Single discipline FE Practice Question with shuffle icon, hidden explanation, and +1 score integration
 */

(function() {
    'use strict';

    let currentDiscipline = 'Mechanical';
    let currentTheoremIndex = 0;
    let currentQuestion = null;
    let hasAnswered = false;
    let hasRevealedExplanation = false;
    let activeZenTab = 'theorem';

    // Map discipline names to standard keys
    function normalizeDiscipline(disc) {
        if (!disc) return 'Mechanical';
        if (disc === 'Civil Engineering') return 'Civil';
        if (disc === 'Electrical') return 'Electrical and Computer';
        if (disc === 'Other Disciplines' || disc === 'FE_Other Discipline' || disc.toLowerCase().includes('other')) return 'Other';
        return disc;
    }

    function getActiveDiscipline() {
        if (window.getActiveMotivationDiscipline) {
            return window.getActiveMotivationDiscipline();
        }
        const disc = localStorage.getItem('enggtv_discipline') || 
                     (window.state && window.state.user && window.state.user.discipline) || 
                     'Mechanical';
        return normalizeDiscipline(disc);
    }

    function getTheoremsList() {
        const disc = getActiveDiscipline();
        const theoremsMap = window.THEOREMS_BY_DISCIPLINE || {};
        if (theoremsMap[disc] && theoremsMap[disc].length > 0) {
            return theoremsMap[disc];
        }
        return theoremsMap['Mechanical'] || [];
    }

    function getAllDisciplineQuestions() {
        const disc = getActiveDiscipline();
        const source = window.getQuestionsSource ? window.getQuestionsSource() : (typeof QUESTIONS !== 'undefined' ? QUESTIONS : {});
        const allQuestions = [];

        // 1. Try to use window.state.subjects if populated
        let subjects = (window.state && window.state.subjects) || [];

        // 2. If state subjects are empty or don't match current discipline, retrieve from global arrays
        if (!subjects || subjects.length === 0) {
            if (disc === 'Mechanical' && typeof MECHANICAL_SUBJECTS !== 'undefined') subjects = MECHANICAL_SUBJECTS;
            else if (disc === 'Civil' && typeof CIVIL_SUBJECTS !== 'undefined') subjects = CIVIL_SUBJECTS;
            else if (disc === 'Chemical' && typeof CHEMICAL_SUBJECTS !== 'undefined') subjects = CHEMICAL_SUBJECTS;
            else if (disc === 'Industrial' && typeof INDUSTRIAL_SUBJECTS !== 'undefined') subjects = INDUSTRIAL_SUBJECTS;
            else if (disc === 'Environmental' && typeof ENVIRONMENTAL_SUBJECTS !== 'undefined') subjects = ENVIRONMENTAL_SUBJECTS;
            else if (disc === 'Electrical and Computer' && typeof ELECTRICAL_COMPUTER_SUBJECTS !== 'undefined') subjects = ELECTRICAL_COMPUTER_SUBJECTS;
            else if (typeof OTHER_SUBJECTS !== 'undefined') subjects = OTHER_SUBJECTS;
        }

        if (subjects && subjects.length > 0) {
            subjects.forEach(sub => {
                if (source[sub.id] && Array.isArray(source[sub.id])) {
                    source[sub.id].forEach(q => {
                        allQuestions.push({
                            ...q,
                            subjectId: sub.id,
                            subjectName: sub.name || sub.id
                        });
                    });
                }
            });
        }

        // Fallback: If still empty, collect all questions in source
        if (allQuestions.length === 0 && source) {
            Object.keys(source).forEach(key => {
                if (Array.isArray(source[key])) {
                    source[key].forEach(q => {
                        allQuestions.push({
                            ...q,
                            subjectId: key,
                            subjectName: key
                        });
                    });
                }
            });
        }

        return allQuestions;
    }

    // --- Tab 1: Theorem Logic ---
    function renderTheorem() {
        const theorems = getTheoremsList();
        if (!theorems || theorems.length === 0) return;

        if (currentTheoremIndex >= theorems.length) {
            currentTheoremIndex = 0;
        }

        const th = theorems[currentTheoremIndex];
        const titleEl = document.getElementById('zen-theorem-title');
        const formulaEl = document.getElementById('zen-theorem-formula');
        const descEl = document.getElementById('zen-theorem-desc');
        const tipEl = document.getElementById('zen-theorem-tip');
        const countEl = document.getElementById('zen-theorem-count');

        if (titleEl) titleEl.textContent = th.title;
        if (formulaEl) formulaEl.innerHTML = th.formula;
        if (descEl) descEl.textContent = th.description;
        if (tipEl) tipEl.textContent = th.examTip;
        if (countEl) countEl.textContent = `Formula ${currentTheoremIndex + 1} of ${theorems.length}`;

        // Typeset LaTeX equation
        const panel = document.getElementById('zen-theorem-panel');
        if (panel) {
            if (window.safeTypesetMath) {
                window.safeTypesetMath([panel]);
            } else if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([panel]).catch(e => console.warn('MathJax zen render:', e));
            }
        }
    }

    function shuffleTheorem() {
        const theorems = getTheoremsList();
        if (theorems.length <= 1) return;

        let nextIndex = Math.floor(Math.random() * theorems.length);
        while (nextIndex === currentTheoremIndex && theorems.length > 1) {
            nextIndex = Math.floor(Math.random() * theorems.length);
        }
        currentTheoremIndex = nextIndex;

        // Visual feedback on shuffle button
        const shuffleBtn = document.getElementById('zen-shuffle-theorem-btn');
        if (shuffleBtn) {
            shuffleBtn.classList.add('rotate-180');
            setTimeout(() => shuffleBtn.classList.remove('rotate-180'), 300);
        }

        renderTheorem();
    }

    function nextTheorem() {
        const theorems = getTheoremsList();
        if (!theorems || theorems.length === 0) return;
        currentTheoremIndex = (currentTheoremIndex + 1) % theorems.length;
        renderTheorem();
    }

    function prevTheorem() {
        const theorems = getTheoremsList();
        if (!theorems || theorems.length === 0) return;
        currentTheoremIndex = (currentTheoremIndex - 1 + theorems.length) % theorems.length;
        renderTheorem();
    }

    // --- Tab 2: Question Logic ---
    function loadRandomQuestion() {
        const questions = getAllDisciplineQuestions();
        if (!questions || questions.length === 0) {
            const qPrompt = document.getElementById('zen-question-prompt');
            if (qPrompt) qPrompt.textContent = 'No questions found for this discipline.';
            return;
        }

        let nextQ = questions[Math.floor(Math.random() * questions.length)];
        if (currentQuestion && questions.length > 1) {
            while (nextQ.id === currentQuestion.id) {
                nextQ = questions[Math.floor(Math.random() * questions.length)];
            }
        }
        currentQuestion = nextQ;
        hasAnswered = false;
        hasRevealedExplanation = false;

        renderCurrentQuestion();
    }

    function renderCurrentQuestion() {
        if (!currentQuestion) return;

        const topicEl = document.getElementById('zen-question-topic');
        const promptEl = document.getElementById('zen-question-prompt');
        const imageContainer = document.getElementById('zen-question-image-container');
        const optionsContainer = document.getElementById('zen-options-container');
        const explanationContainer = document.getElementById('zen-explanation-container');
        const toggleExpBtn = document.getElementById('zen-toggle-exp-btn');
        const feedbackBanner = document.getElementById('zen-feedback-banner');

        if (topicEl) {
            topicEl.textContent = `${currentQuestion.subjectName || 'FE Practice'} • ${currentQuestion.topic || 'Core Problem'}`;
        }
        if (promptEl) {
            promptEl.innerHTML = currentQuestion.question || '';
        }

        // Image Handling
        if (imageContainer) {
            const qImg = currentQuestion.local_image || currentQuestion.image;
            if (qImg) {
                const src = window.toDriveImgUrl ? window.toDriveImgUrl(qImg) : qImg;
                imageContainer.innerHTML = `<img src="${src}" alt="Problem Diagram" class="max-h-56 mx-auto rounded-xl border border-slate-700/60 shadow-md my-3 object-contain">`;
                imageContainer.classList.remove('hidden');
            } else {
                imageContainer.innerHTML = '';
                imageContainer.classList.add('hidden');
            }
        }

        // Reset Feedback Banner
        if (feedbackBanner) {
            feedbackBanner.innerHTML = '';
            feedbackBanner.className = 'hidden mb-4 p-3.5 rounded-2xl text-xs font-bold transition-all';
        }

        // Render Options A, B, C, D
        if (optionsContainer) {
            optionsContainer.innerHTML = '';
            const letters = ['A', 'B', 'C', 'D'];
            (currentQuestion.options || []).forEach((opt, idx) => {
                const optBtn = document.createElement('button');
                optBtn.className = 'zen-option-btn w-full p-4 rounded-2xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 hover:border-indigo-500/60 transition-all flex items-start gap-3.5 text-left text-sm text-slate-200 cursor-pointer group active:scale-[0.99]';
                optBtn.setAttribute('data-index', idx);
                optBtn.innerHTML = `
                    <span class="zen-opt-letter w-7 h-7 rounded-xl bg-slate-700/80 text-slate-300 text-xs font-black flex items-center justify-center shrink-0 border border-slate-600 group-hover:border-indigo-400 group-hover:text-white transition-colors">
                        ${letters[idx] || (idx + 1)}
                    </span>
                    <span class="zen-opt-text flex-1 pt-0.5 leading-relaxed">${opt.text || ''}</span>
                `;
                optBtn.onclick = () => handleOptionSelect(idx);
                optionsContainer.appendChild(optBtn);
            });
        }

        // Reset & Populate Explanation (Hidden Initially)
        if (explanationContainer) {
            explanationContainer.classList.add('hidden');
            populateExplanationContent(explanationContainer);
        }

        // Reset Explanation Toggle Button
        if (toggleExpBtn) {
            toggleExpBtn.innerHTML = `
                <span class="material-symbols-outlined text-[18px]">visibility</span>
                <span>Explain Solution (Hidden)</span>
            `;
            toggleExpBtn.className = 'px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/30 flex items-center gap-2 transition-all cursor-pointer shadow-sm';
        }

        // Typeset MathJax in Question Prompt and Options
        const panel = document.getElementById('zen-question-panel');
        if (panel) {
            if (window.safeTypesetMath) {
                window.safeTypesetMath([panel]);
            } else if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([panel]).catch(e => console.warn('MathJax zen question render:', e));
            }
        }
    }

    function populateExplanationContent(container) {
        if (!currentQuestion) return;

        let stepsHtml = '';
        if (currentQuestion.solution && currentQuestion.solution.steps && Array.isArray(currentQuestion.solution.steps)) {
            stepsHtml = currentQuestion.solution.steps.map((st, i) => `
                <div class="p-3.5 rounded-xl bg-slate-800/90 border border-slate-700/60 mb-2.5">
                    <span class="text-xs font-black text-indigo-300 block mb-1 uppercase tracking-wider">Step ${i + 1}: ${st.title || ''}</span>
                    <p class="text-xs text-slate-300 leading-relaxed">${st.content || ''}</p>
                </div>
            `).join('');
        }

        // NCEES reference box
        let nceesHtml = '';
        if (currentQuestion.ncees_reference) {
            const ref = currentQuestion.ncees_reference;
            nceesHtml = `
                <div class="mt-3 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
                    <span class="material-symbols-outlined text-amber-400 text-lg shrink-0 mt-0.5">menu_book</span>
                    <div>
                        <span class="font-bold text-amber-300 block mb-0.5 uppercase tracking-wide text-[10px]">NCEES Reference Handbook • ${ref.section || 'General'}</span>
                        <p class="text-amber-100/90 leading-tight">Topic: <strong>${ref.topic || ''}</strong> ${ref.page_number ? `• Page ${ref.page_number}` : ''} ${ref.search_term ? `• Search: <em>"${ref.search_term}"</em>` : ''}</p>
                    </div>
                </div>
            `;
        }

        // Engg.tv AI Big Idea / Pitfalls
        let copilotHtml = '';
        if (currentQuestion.copilot_explanation) {
            const copilot = currentQuestion.copilot_explanation;
            if (copilot.big_idea) {
                copilotHtml += `
                    <div class="mt-3 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-xs text-indigo-200 leading-relaxed">
                        <strong class="text-indigo-300 block mb-1 text-[11px] uppercase tracking-wider font-bold">💡 The Big Idea:</strong>
                        ${copilot.big_idea}
                    </div>
                `;
            }
        }

        const finalAnswer = (currentQuestion.solution && currentQuestion.solution.final_answer) || '';

        container.innerHTML = `
            <div class="p-5 rounded-2xl bg-slate-900/90 border border-indigo-500/30 space-y-3 mt-4 shadow-xl">
                <div class="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div class="flex items-center gap-2">
                        <span class="material-symbols-outlined text-indigo-400 text-xl">auto_stories</span>
                        <span class="text-xs font-black uppercase tracking-wider text-indigo-200">Step-by-Step Explanation</span>
                    </div>
                    ${finalAnswer ? `<span class="px-2.5 py-1 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-xs font-bold">Final: ${finalAnswer}</span>` : ''}
                </div>

                <div class="space-y-2 pt-1">
                    ${stepsHtml}
                </div>

                ${nceesHtml}
                ${copilotHtml}
            </div>
        `;
    }

    function handleOptionSelect(selectedIndex) {
        if (hasAnswered || !currentQuestion) return;
        hasAnswered = true;

        const options = currentQuestion.options || [];
        const selectedOpt = options[selectedIndex];
        const isCorrect = !!(selectedOpt && selectedOpt.is_correct);

        const optionButtons = document.querySelectorAll('#zen-options-container .zen-option-btn');
        optionButtons.forEach((btn, idx) => {
            const opt = options[idx];
            btn.classList.remove('hover:bg-slate-750', 'hover:border-indigo-500/60', 'cursor-pointer');
            btn.classList.add('cursor-default');

            if (opt && opt.is_correct) {
                btn.className = 'zen-option-btn w-full p-4 rounded-2xl bg-emerald-950/60 border-2 border-emerald-500 text-emerald-200 transition-all flex items-start gap-3.5 text-left text-sm shadow-[0_0_20px_rgba(16,185,129,0.2)]';
                const letterEl = btn.querySelector('.zen-opt-letter');
                if (letterEl) letterEl.className = 'zen-opt-letter w-7 h-7 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black flex items-center justify-center shrink-0';
            } else if (idx === selectedIndex) {
                btn.className = 'zen-option-btn w-full p-4 rounded-2xl bg-rose-950/60 border-2 border-rose-500 text-rose-200 transition-all flex items-start gap-3.5 text-left text-sm shadow-[0_0_20px_rgba(244,63,94,0.2)]';
                const letterEl = btn.querySelector('.zen-opt-letter');
                if (letterEl) letterEl.className = 'zen-opt-letter w-7 h-7 rounded-xl bg-rose-500 text-white text-xs font-black flex items-center justify-center shrink-0';
            } else {
                btn.classList.add('opacity-40');
            }
        });

        // Feedback Banner & Points Award
        const feedbackBanner = document.getElementById('zen-feedback-banner');
        if (feedbackBanner) {
            feedbackBanner.classList.remove('hidden');
            if (isCorrect) {
                feedbackBanner.className = 'mb-4 p-3.5 rounded-2xl text-xs font-bold bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 flex items-center justify-between';
                
                // Award 1 point if not previously revealed
                if (!hasRevealedExplanation) {
                    if (window.addPoints) {
                        window.addPoints(1, 'Simplistic Study Mode Correct Answer!');
                    }
                    if (typeof window.publishPeerMilestone === 'function' && currentQuestion) {
                        const disc = getActiveDiscipline();
                        window.publishPeerMilestone({
                            type: 'zen_solved',
                            title: `Solved ${currentQuestion.topic || 'FE Practice'} Problem in Simplistic Study`,
                            detail: `FE ${disc} Focus • +1 Point awarded`,
                            discipline: disc
                        });
                    }
                    feedbackBanner.innerHTML = `
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-emerald-400">check_circle</span>
                            <span>Correct! +1 point added to your score.</span>
                        </div>
                        <span class="px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-black uppercase tracking-wider">+1 PT</span>
                    `;
                } else {
                    feedbackBanner.innerHTML = `
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-emerald-400">check_circle</span>
                            <span>Correct! (Solution was previously revealed)</span>
                        </div>
                    `;
                }
            } else {
                feedbackBanner.className = 'mb-4 p-3.5 rounded-2xl text-xs font-bold bg-rose-500/20 border border-rose-500/50 text-rose-300 flex items-center gap-2';
                feedbackBanner.innerHTML = `
                    <span class="material-symbols-outlined text-rose-400">cancel</span>
                    <span>Incorrect. Review the step-by-step solution below.</span>
                `;
            }
        }

        // Auto-reveal explanation upon answering
        revealExplanation(true);
    }

    function toggleExplanation() {
        const expContainer = document.getElementById('zen-explanation-container');
        if (!expContainer) return;

        const isHidden = expContainer.classList.contains('hidden');
        if (isHidden) {
            hasRevealedExplanation = true;
            revealExplanation(false);
        } else {
            expContainer.classList.add('hidden');
            const toggleExpBtn = document.getElementById('zen-toggle-exp-btn');
            if (toggleExpBtn) {
                toggleExpBtn.innerHTML = `
                    <span class="material-symbols-outlined text-[18px]">visibility</span>
                    <span>Explain Solution (Hidden)</span>
                `;
            }
        }
    }

    function revealExplanation(isAfterAnswering) {
        const expContainer = document.getElementById('zen-explanation-container');
        const toggleExpBtn = document.getElementById('zen-toggle-exp-btn');
        if (!expContainer) return;

        expContainer.classList.remove('hidden');

        setTimeout(() => {
            expContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 60);

        if (toggleExpBtn) {
            toggleExpBtn.innerHTML = `
                <span class="material-symbols-outlined text-[18px]">visibility_off</span>
                <span>Hide Explanation</span>
            `;
            toggleExpBtn.className = 'px-4 py-2.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 text-xs font-bold border border-indigo-500/50 flex items-center gap-2 transition-all cursor-pointer shadow-sm';
        }

        // If revealed before answering, highlight correct option so user learns immediately
        if (!hasAnswered && currentQuestion && currentQuestion.options) {
            const optionButtons = document.querySelectorAll('#zen-options-container .zen-option-btn');
            optionButtons.forEach((btn, idx) => {
                const opt = currentQuestion.options[idx];
                if (opt && opt.is_correct) {
                    btn.className = 'zen-option-btn w-full p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/60 text-emerald-200 transition-all flex items-start gap-3.5 text-left text-sm';
                }
            });
        }

        // Typeset MathJax inside explanation container
        if (window.safeTypesetMath) {
            window.safeTypesetMath([expContainer]);
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([expContainer]).catch(e => console.warn('MathJax exp render:', e));
        }
    }

    function shuffleQuestion() {
        const shuffleBtn = document.getElementById('zen-shuffle-question-btn');
        if (shuffleBtn) {
            shuffleBtn.classList.add('rotate-180');
            setTimeout(() => shuffleBtn.classList.remove('rotate-180'), 300);
        }
        loadRandomQuestion();
    }

    // --- Tab Switching ---
    function setZenTab(tab) {
        activeZenTab = tab;
        const theoremPanel = document.getElementById('zen-theorem-panel');
        const questionPanel = document.getElementById('zen-question-panel');
        const tabTheoremBtn = document.getElementById('zen-tab-theorem-btn');
        const tabQuestionBtn = document.getElementById('zen-tab-question-btn');

        if (tab === 'theorem') {
            if (theoremPanel) theoremPanel.classList.remove('hidden');
            if (questionPanel) questionPanel.classList.add('hidden');

            if (tabTheoremBtn) {
                tabTheoremBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30 transition-all cursor-pointer';
            }
            if (tabQuestionBtn) {
                tabQuestionBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer';
            }

            renderTheorem();
        } else {
            if (theoremPanel) theoremPanel.classList.add('hidden');
            if (questionPanel) questionPanel.classList.remove('hidden');

            if (tabQuestionBtn) {
                tabQuestionBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-md shadow-indigo-500/30 transition-all cursor-pointer';
            }
            if (tabTheoremBtn) {
                tabTheoremBtn.className = 'px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-slate-200 transition-all cursor-pointer';
            }

            if (!currentQuestion) {
                loadRandomQuestion();
            } else {
                if (questionPanel) {
                    if (window.safeTypesetMath) {
                        window.safeTypesetMath([questionPanel]);
                    } else if (window.MathJax && window.MathJax.typesetPromise) {
                        window.MathJax.typesetPromise([questionPanel]).catch(e => console.warn(e));
                    }
                }
            }
        }
    }

    // --- Modal Lifecycle ---
    function openModal() {
        const modal = document.getElementById('simplistic-study-modal');
        if (!modal) return;

        currentDiscipline = getActiveDiscipline();
        const discBadge = document.getElementById('zen-discipline-badge');
        if (discBadge) {
            discBadge.textContent = currentDiscipline;
        }

        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('opacity-0');
            const sheet = document.getElementById('zen-modal-card');
            if (sheet) {
                sheet.classList.remove('scale-95', 'opacity-0');
                sheet.classList.add('scale-100', 'opacity-100');
            }
        }, 10);

        setZenTab(activeZenTab);
    }

    function closeModal() {
        const modal = document.getElementById('simplistic-study-modal');
        const sheet = document.getElementById('zen-modal-card');
        if (!modal) return;

        if (sheet) {
            sheet.classList.remove('scale-100', 'opacity-100');
            sheet.classList.add('scale-95', 'opacity-0');
        }
        modal.classList.add('opacity-0');

        setTimeout(() => {
            modal.classList.add('hidden');
        }, 250);
    }

    function toggleModal() {
        const modal = document.getElementById('simplistic-study-modal');
        if (!modal) return;
        if (modal.classList.contains('hidden')) {
            openModal();
        } else {
            closeModal();
        }
    }

    function init() {
        // Wire up tab buttons
        const tabTheoremBtn = document.getElementById('zen-tab-theorem-btn');
        if (tabTheoremBtn) {
            tabTheoremBtn.onclick = () => setZenTab('theorem');
        }

        const tabQuestionBtn = document.getElementById('zen-tab-question-btn');
        if (tabQuestionBtn) {
            tabQuestionBtn.onclick = () => setZenTab('question');
        }

        // Shuffle buttons
        const shuffleThBtn = document.getElementById('zen-shuffle-theorem-btn');
        if (shuffleThBtn) {
            shuffleThBtn.onclick = shuffleTheorem;
        }

        const prevThBtn = document.getElementById('zen-prev-theorem-btn');
        if (prevThBtn) {
            prevThBtn.onclick = prevTheorem;
        }

        const nextThBtn = document.getElementById('zen-next-theorem-btn');
        if (nextThBtn) {
            nextThBtn.onclick = nextTheorem;
        }

        const shuffleQBtn = document.getElementById('zen-shuffle-question-btn');
        if (shuffleQBtn) {
            shuffleQBtn.onclick = shuffleQuestion;
        }

        const nextQBtn = document.getElementById('zen-next-q-btn');
        if (nextQBtn) {
            nextQBtn.onclick = shuffleQuestion;
        }

        // Toggle Explanation Button
        const toggleExpBtn = document.getElementById('zen-toggle-exp-btn');
        if (toggleExpBtn) {
            toggleExpBtn.onclick = toggleExplanation;
        }

        // Close Modal button & backdrop
        const closeBtn = document.getElementById('zen-modal-close-btn');
        if (closeBtn) {
            closeBtn.onclick = closeModal;
        }

        const modal = document.getElementById('simplistic-study-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    closeModal();
                }
            });
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
                closeModal();
            }
        });
    }

    // Expose globally
    window.openSimplisticStudyModal = openModal;
    window.closeSimplisticStudyModal = closeModal;
    window.toggleSimplisticStudyModal = toggleModal;
    window.setZenTab = setZenTab;
    window.shuffleZenTheorem = shuffleTheorem;
    window.nextZenTheorem = nextTheorem;
    window.prevZenTheorem = prevTheorem;
    window.shuffleZenQuestion = shuffleQuestion;
    window.handleZenOptionSelect = handleOptionSelect;
    window.toggleZenExplanation = toggleExplanation;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }
})();
