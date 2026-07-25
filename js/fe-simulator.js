(function() {
    // --- 1. Unlock Logic ---
    function checkFESimulatorUnlock() {
        const points = (window.state && window.state.userPoints) ? window.state.userPoints : 0;
        const required = 500;
        
        let rawDiscipline = localStorage.getItem('enggtv_discipline') || (window.state && window.state.user && window.state.user.discipline) || 'Mechanical';
        const discipline = rawDiscipline.replace(' Engineer', '').replace(' Engineering', '');
        
        const card = document.getElementById('full-fe-exam-card');
        if (!card) return;
        
        const titleEl = document.getElementById('fe-simulator-title');
        const subtitleEl = document.getElementById('fe-simulator-subtitle');
        const iconEl = document.getElementById('fe-simulator-icon');
        const iconContainer = document.getElementById('fe-simulator-icon-container');
        
        if (titleEl) titleEl.innerText = `${discipline} FE Simulator`;
        if (subtitleEl) subtitleEl.innerText = `110 Questions • 6 Hours • Official Engg.tv ${discipline} Blueprint`;
        
        let colorClass = 'text-amber-500';
        let bgClass = 'bg-amber-500/10';
        let borderClass = 'border-amber-500/20';
        let btnClass = 'bg-amber-500 hover:bg-amber-600 shadow-amber-500/30';
        let progClass = 'bg-amber-500';
        
        if (discipline.toLowerCase().includes('civil')) { colorClass = 'text-blue-500'; bgClass = 'bg-blue-500/10'; borderClass = 'border-blue-500/20'; btnClass = 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30'; progClass = 'bg-blue-500'; }
        else if (discipline.toLowerCase().includes('chemical')) { colorClass = 'text-emerald-500'; bgClass = 'bg-emerald-500/10'; borderClass = 'border-emerald-500/20'; btnClass = 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30'; progClass = 'bg-emerald-500'; }
        else if (discipline.toLowerCase().includes('electrical')) { colorClass = 'text-purple-500'; bgClass = 'bg-purple-500/10'; borderClass = 'border-purple-500/20'; btnClass = 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/30'; progClass = 'bg-purple-500'; }
        else if (discipline.toLowerCase().includes('environmental')) { colorClass = 'text-green-500'; bgClass = 'bg-green-500/10'; borderClass = 'border-green-500/20'; btnClass = 'bg-green-500 hover:bg-green-600 shadow-green-500/30'; progClass = 'bg-green-500'; }
        else if (discipline.toLowerCase().includes('industrial')) { colorClass = 'text-orange-500'; bgClass = 'bg-orange-500/10'; borderClass = 'border-orange-500/20'; btnClass = 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30'; progClass = 'bg-orange-500'; }
        else if (discipline.toLowerCase().includes('other')) { colorClass = 'text-primary'; bgClass = 'bg-primary/10'; borderClass = 'border-primary/20'; btnClass = 'bg-primary hover:bg-pink-600 shadow-pink-500/30'; progClass = 'bg-primary'; }
        
        if (iconEl) iconEl.className = `material-symbols-outlined text-3xl ${colorClass}`;
        if (iconContainer) iconContainer.className = `w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 border ${bgClass} ${borderClass}`;
        
        const startBtn = document.getElementById('btn-start-fe-simulator');
        if (startBtn) {
            startBtn.className = `w-full sm:w-auto text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg active:scale-95 transition-all text-sm uppercase tracking-widest flex items-center justify-center gap-2 ${btnClass}`;
            startBtn.onclick = () => window.startFullFEExamFlow(discipline.toLowerCase());
        }

        const lockedDiv = document.getElementById('fe-simulator-locked');
        const unlockedDiv = document.getElementById('fe-simulator-unlocked');
        const progBar = document.getElementById('fe-sim-progress');
        const lockText = document.getElementById('fe-sim-lock-text');

        if (points >= required) {
            if(lockedDiv) { lockedDiv.classList.remove('flex'); lockedDiv.classList.add('hidden'); lockedDiv.style.display = 'none'; }
            if(unlockedDiv) { unlockedDiv.classList.remove('hidden'); unlockedDiv.classList.add('flex'); unlockedDiv.style.display = 'flex'; }
        } else {
            if(lockedDiv) { lockedDiv.classList.remove('hidden'); lockedDiv.classList.add('flex'); lockedDiv.style.display = 'flex'; }
            if(unlockedDiv) { unlockedDiv.classList.remove('flex'); unlockedDiv.classList.add('hidden'); unlockedDiv.style.display = 'none'; }
            const pct = Math.min(100, (points / required) * 100);
            if (progBar) {
                progBar.style.width = pct + '%';
                progBar.className = `h-full rounded-full transition-all duration-1000 ${progClass}`;
            }
            if (lockText) {
                lockText.innerHTML = `<span class="material-symbols-outlined text-[14px] align-text-bottom">lock</span> ${points}/${required} Points to Unlock`;
                lockText.className = `text-xs font-bold uppercase tracking-widest ${colorClass}`;
            }
        }
    }
    
    // Expose globally so app.js updateGamificationUI can call it
    window.checkFESimulatorUnlock = checkFESimulatorUnlock;
    
    // Initial check
    checkFESimulatorUnlock();


    // --- 2. FE EXAM GENERATOR (110 questions, NCEES Blueprint) ---
    function generateFEExam(discipline = 'mechanical') {
        const blueprints = {
            'mechanical': {
                'math': 8, 'stats': 5, 'ethics': 4, 'econ': 4, 'electricity': 6, 'statics': 10, 'dynamics': 10, 'materials-strength': 10, 'materials-science': 8, 'fluids': 11, 'thermo': 12, 'heat': 8, 'instr-controls': 6, 'design': 8
            },
            'civil': {
                'math': 8, 'stats': 5, 'ethics': 4, 'econ': 5, 'statics': 8, 'dynamics': 4, 'materials-strength': 7, 'materials-science': 5, 'fluids': 6, 'surveying': 6, 'water-res': 11, 'structural': 11, 'geotech': 11, 'transport': 10, 'construction': 9
            },
            'chemical': {
                'math': 6, 'stats': 4, 'ethics': 3, 'econ': 3, 'materials-science': 5, 'fluids': 10, 'thermo': 12, 'heat': 10, 'mass-sep': 10, 'reaction-eng': 11, 'balances': 11, 'chem-bio': 6, 'process-control': 6, 'process-design': 6, 'safety': 7
            },
            'electrical': {
                'math': 12, 'stats': 5, 'ethics': 4, 'econ': 4, 'elec-materials': 5, 'circuits': 11, 'linear-systems': 6, 'signals': 6, 'electronics': 8, 'power': 9, 'electromagnetics': 6, 'control-systems': 7, 'communications': 6, 'networks': 6, 'computer-systems': 8, 'software': 7
            },
            'environmental': {
                'math': 5, 'stats': 4, 'ethics': 4, 'econ': 4, 'principles': 5, 'env-chem': 6, 'risk': 5, 'fluids-hyd': 8, 'thermo': 4, 'water-hydrology': 9, 'groundwater-soils': 9, 'water-wastewater': 15, 'air-quality': 13, 'waste': 12, 'energy-env': 7
            },
            'industrial': {
                'math': 7, 'stats': 10, 'ethics': 4, 'econ': 10, 'modeling': 9, 'eng-mgmt': 8, 'production': 9, 'supply-chain': 9, 'ergonomics': 9, 'work-design': 9, 'quality': 9, 'systems': 9, 'materials-science': 4, 'safety': 4
            },
            'other': {
                'math': 9, 'stats': 7, 'chemistry': 6, 'instr-controls': 5, 'ethics': 5, 'safety': 5, 'econ': 6, 'statics': 10, 'dynamics': 9, 'materials-strength': 10, 'materials-science': 9, 'fluids': 10, 'electricity': 9, 'thermo': 10
            }
        };
        
        let bKey = 'mechanical';
        if (discipline.toLowerCase().includes('civil')) bKey = 'civil';
        else if (discipline.toLowerCase().includes('chemical')) bKey = 'chemical';
        else if (discipline.toLowerCase().includes('electrical')) bKey = 'electrical';
        else if (discipline.toLowerCase().includes('environmental')) bKey = 'environmental';
        else if (discipline.toLowerCase().includes('industrial')) bKey = 'industrial';
        else if (discipline.toLowerCase().includes('other')) bKey = 'other';
        
        const blueprint = blueprints[bKey] || blueprints['mechanical'];
        
        const primaryDB = (typeof EXAM_QUESTIONS !== 'undefined') ? EXAM_QUESTIONS : null;
        const fallbackDB = (typeof QUESTIONS !== 'undefined') ? QUESTIONS : window.QUESTIONS;
        
        let subjectGroups = [];
        
        for (const [subjectId, count] of Object.entries(blueprint)) {
            let pool = [];
            
            // Try to get from primary database first (exam_questions.js)
            if (primaryDB && primaryDB[subjectId]) {
                pool = [...primaryDB[subjectId]].map(q => ({...q, subjectId}));
            }
            
            // If primary doesn't have enough (or any), pull from fallback database (questions.js)
            if (pool.length < count && fallbackDB && fallbackDB[subjectId]) {
                const existingText = pool.map(q => q.question_text || q.question);
                const extraNeeded = count - pool.length;
                
                let fallbackPool = [...fallbackDB[subjectId]]
                    .map(q => ({...q, subjectId}))
                    .filter(q => !existingText.includes(q.question_text || q.question));
                
                // Shuffle fallback and take what we need
                fallbackPool.sort(() => Math.random() - 0.5);
                pool = pool.concat(fallbackPool);
            }
            
            // Now shuffle the combined pool and take exactly `count`
            pool.sort(() => Math.random() - 0.5);
            let group = pool.slice(0, count);
            
            // If still not enough (extremely rare), allow duplicates from the pool
            while (group.length < count && pool.length > 0) {
                 group.push(pool[Math.floor(Math.random() * pool.length)]);
            }
            
            subjectGroups.push(group);
        }
        
        // Shuffle the order of the subjects
        subjectGroups.sort(() => Math.random() - 0.5);
        
        // Flatten the array so subjects are presented together
        let selectedQuestions = subjectGroups.flat();
        
        // Final fallback padding if somehow we are still short (e.g., both DBs missing subject)
        while (selectedQuestions.length < 110) {
            const anyDB = primaryDB || fallbackDB;
            const allKeys = anyDB ? Object.keys(anyDB) : [];
            if(allKeys.length === 0) break;
            const randomSub = allKeys[Math.floor(Math.random() * allKeys.length)];
            if(anyDB[randomSub] && anyDB[randomSub].length > 0) {
                const q = anyDB[randomSub][Math.floor(Math.random() * anyDB[randomSub].length)];
                selectedQuestions.push({...q, subjectId: randomSub});
            } else {
                break;
            }
        }
        
        return selectedQuestions.slice(0, 110);
    }
    
    // --- 3. NDA & TUTORIAL MODAL FLOW ---
    let feIntroTimerInterval = null;
    let feCurrentIntroPhase = 'nda'; // 'nda' or 'tutorial'

    // --- Interceptors State ---
    let interceptorsSetup = false;
    let originalLoadQuestion = null;
    let originalUpdateQuestionMap = null;

    window.startFullFEExamFlow = function(discipline = 'mechanical') {
        window.currentSimulatorDiscipline = discipline;
        if (!interceptorsSetup) {
            setupFEInterceptors();
            interceptorsSetup = true;
        }
        
        const modal = document.getElementById('fe-exam-intro-modal');
        if (modal) modal.classList.remove('hidden');
        showNDAScreen();
    };

    function showNDAScreen() {
        feCurrentIntroPhase = 'nda';
        document.getElementById('fe-intro-title').innerText = "Nondisclosure Agreement";
        document.getElementById('fe-intro-content').innerHTML = `
            <div class="space-y-4">
                <p><strong>Please read the following Nondisclosure Agreement carefully.</strong></p>
                <p>This exam simulator is highly confidential. The examination questions and materials are the copyrighted property of Engg.tv.</p>
                <p>By proceeding, you agree that you will not:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li>Disclose, publish, reproduce, or transmit this exam, in whole or in part, in any form or by any means.</li>
                    <li>Memorize questions to share with other candidates.</li>
                    <li>Use unauthorized materials or devices during this session.</li>
                </ul>
                <p class="text-sm text-red-500 font-bold mt-4">Violation of this agreement may result in the invalidation of your exam results and suspension from future Engg.tv simulator sessions.</p>
            </div>
        `;
        
        // 2 Minutes NDA
        startIntroTimer(120, () => {
            // After 2 minutes, force next
            showTutorialScreen();
        });
    }

    function showTutorialScreen() {
        feCurrentIntroPhase = 'tutorial';
        document.getElementById('fe-intro-title').innerText = "FE Exam Tutorial & Rules";
        document.getElementById('fe-intro-content').innerHTML = `
            <div class="space-y-4">
                <p><strong>Welcome to the FE Exam Simulator Tutorial.</strong></p>
                <p>This session strictly follows the official FE Exam environment rules:</p>
                <ul class="list-disc pl-6 space-y-2">
                    <li><strong>Reference Handbook:</strong> You are allowed to use the official searchable Engg.tv FE Reference Handbook. No other reference materials are permitted.</li>
                    <li><strong>Calculator:</strong> You may use an approved calculator (e.g., TI-36X Pro, Casio fx-115). No programmable calculators or phones.</li>
                    <li><strong>Scratchpad:</strong> You are provided with a reusable scratchpad and a marker.</li>
                    <li><strong>Format & Break:</strong> The exam contains 110 questions. After you submit the 55th question, an optional 25-minute break will begin.</li>
                    <li><strong>Navigation:</strong> Once you return from your scheduled break, you <strong>cannot</strong> review or change answers for the first 55 questions.</li>
                </ul>
                <p>Take a deep breath. Read every question carefully. Manage your time efficiently.</p>
            </div>
        `;
        
        // 8 Minutes Tutorial
        startIntroTimer(480, () => {
            // After 8 minutes, force start exam
            startFEExamPart1();
        });
    }

    function startIntroTimer(seconds, onExpire) {
        clearInterval(feIntroTimerInterval);
        
        const btnAction = document.getElementById('btn-fe-intro-action');
        const waitText = document.getElementById('fe-intro-wait-text');
        const timerDisplay = document.getElementById('fe-intro-timer');
        
        btnAction.classList.add('hidden');
        waitText.classList.remove('hidden');
        
        // Allow skip after 5 seconds for convenience in this simulator, but officially it's strict
        setTimeout(() => {
            btnAction.classList.remove('hidden');
            waitText.classList.add('hidden');
            
            btnAction.onclick = () => {
                clearInterval(feIntroTimerInterval);
                if (feCurrentIntroPhase === 'nda') {
                    showTutorialScreen();
                } else {
                    startFEExamPart1();
                }
            };
        }, 5000);

        let timeRemaining = seconds;
        const updateDisplay = () => {
            const m = Math.floor(timeRemaining / 60).toString().padStart(2, '0');
            const s = (timeRemaining % 60).toString().padStart(2, '0');
            timerDisplay.innerText = `${m}:${s}`;
            
            if (timeRemaining <= 0) {
                clearInterval(feIntroTimerInterval);
                onExpire();
            }
            timeRemaining--;
        };
        
        updateDisplay();
        feIntroTimerInterval = setInterval(updateDisplay, 1000);
    }

    // --- 4. EXAM EXECUTION & BREAK LOGIC ---
    let feBreakTimerInterval = null;

    function startFEExamPart1() {
        document.getElementById('fe-exam-intro-modal').classList.add('hidden');
        
        const discipline = window.currentSimulatorDiscipline || 'mechanical';
        const questions = generateFEExam(discipline);

        let titleDiscipline = discipline.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
        if (discipline.includes('other')) titleDiscipline = 'Other Disciplines';

        window.state.currentSubject = { name: `${titleDiscipline} FE Simulator`, id: `fe-simulator-${titleDiscipline.replace(/\s+/g, '-').toLowerCase()}` };
        window.state.currentTopic = `Official ${titleDiscipline} Blueprint`;
        
        if (window.prepareQuestions) {
            window.state.quizQuestions = window.prepareQuestions(questions);
        } else {
            window.state.quizQuestions = questions;
        }

        window.state.currentQuestionIndex = 0;
        window.state.answers = new Array(window.state.quizQuestions.length).fill(null);
        window.state.submitted = new Array(window.state.quizQuestions.length).fill(false);
        window.state.flagged = new Array(window.state.quizQuestions.length).fill(false);
        window.state.score = 0;
        window.state.secondsElapsed = 0;
        window.state.isFinished = false;
        window.state.isMockExam = true; 
        window.state.isFullFEExam = true; 
        window.state.hasTakenFEBreak = false;

        window.navigateTo('quiz-view');
        if (window.updateQuestionMap) window.updateQuestionMap();
        if (window.loadQuestion) window.loadQuestion();
        
        if (window.startTimer) window.startTimer();
    }

    function showFEBreakConfirmModal(onConfirm, onCancel) {
        let modal = document.getElementById('fe-break-confirm-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'fe-break-confirm-modal';
            modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 hidden opacity-0 transition-opacity duration-300';
            modal.innerHTML = `
                <div class="glass-card rounded-[32px] p-8 max-w-md w-full border border-white/20 shadow-2xl flex flex-col items-center text-center transform scale-95 transition-transform duration-300" id="fe-break-modal-content">
                    <div class="w-20 h-20 bg-amber-500/10 rounded-[28px] flex items-center justify-center mb-6 shadow-inner border border-amber-500/30">
                        <span class="material-symbols-outlined text-amber-500 text-4xl">warning</span>
                    </div>
                    <h3 class="font-display-lg text-2xl text-slate-800 dark:text-white mb-4">Submit Part 1?</h3>
                    <div class="text-slate-600 dark:text-slate-300 font-body-sm space-y-3 mb-8">
                        <p>You are about to finish Part 1 and begin your scheduled break.</p>
                        <p class="text-amber-600 dark:text-amber-400 font-bold p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">Once you proceed, you WILL NOT be able to review or change any answers in Part 1 (Questions 1-55).</p>
                        <p>Are you sure you are ready to submit?</p>
                    </div>
                    <div class="flex gap-4 w-full">
                        <button id="fe-break-cancel-btn" class="flex-1 bg-slate-200 dark:bg-white/10 text-slate-800 dark:text-white font-bold py-4 rounded-2xl active:scale-95 transition-all hover:bg-slate-300 dark:hover:bg-white/20">Go Back</button>
                        <button id="fe-break-confirm-btn" class="flex-1 bg-amber-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all hover:brightness-110">Proceed</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        const confirmBtn = document.getElementById('fe-break-confirm-btn');
        const cancelBtn = document.getElementById('fe-break-cancel-btn');
        const modalContent = document.getElementById('fe-break-modal-content');
        
        // Clear old listeners
        const newConfirmBtn = confirmBtn.cloneNode(true);
        const newCancelBtn = cancelBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newConfirmBtn, confirmBtn);
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
        
        const closeModal = () => {
            modal.classList.remove('opacity-100');
            modalContent.classList.remove('scale-100');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };
        
        newConfirmBtn.addEventListener('click', () => {
            closeModal();
            if (onConfirm) onConfirm();
        });
        
        newCancelBtn.addEventListener('click', () => {
            closeModal();
            if (onCancel) onCancel();
        });
        
        modal.classList.remove('hidden');
        // Small delay to trigger animation
        requestAnimationFrame(() => {
            modal.classList.add('opacity-100');
            modalContent.classList.add('scale-100');
        });
    }

    function setupFEInterceptors() {
        originalLoadQuestion = window.loadQuestion;
        if (originalLoadQuestion) {
            window.loadQuestion = function() {
                if (window.state && window.state.isFullFEExam && window.state.currentQuestionIndex === 55 && !window.state.hasTakenFEBreak) {
                    showFEBreakConfirmModal(
                        () => {
                            // Proceed
                            triggerFEBreak();
                        },
                        () => {
                            // Cancel
                            window.state.currentQuestionIndex = 54;
                            originalLoadQuestion();
                        }
                    );
                } else {
                    originalLoadQuestion();
                    
                    // Hide prev button at start of Part 2
                    if (window.state && window.state.isFullFEExam && window.state.hasTakenFEBreak) {
                        const prevBtn = document.getElementById('prev-btn');
                        if (prevBtn && window.state.currentQuestionIndex === 55) {
                            prevBtn.classList.add('hidden');
                        }
                    }
                }
            };
        }
    }

    function triggerFEBreak() {
        if (window.stopTimer) window.stopTimer();
        
        const breakModal = document.getElementById('fe-exam-break-modal');
        if (breakModal) breakModal.classList.remove('hidden');
        
        let breakTime = 25 * 60;
        const breakDisplay = document.getElementById('fe-break-timer');
        
        clearInterval(feBreakTimerInterval);
        feBreakTimerInterval = setInterval(() => {
            const m = Math.floor(breakTime / 60).toString().padStart(2, '0');
            const s = (breakTime % 60).toString().padStart(2, '0');
            if (breakDisplay) breakDisplay.innerText = `${m}:${s}`;
            
            if (breakTime <= 0) {
                clearInterval(feBreakTimerInterval);
                window.resumeFEExamPart2();
            }
            breakTime--;
        }, 1000);
    }

    window.showFEBlockModal = function(title, message) {
        let modal = document.getElementById('fe-block-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'fe-block-modal';
            modal.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md px-4 hidden opacity-0 transition-opacity duration-300';
            modal.innerHTML = `
                <div class="glass-card rounded-[32px] p-8 max-w-md w-full border border-white/20 shadow-2xl flex flex-col items-center text-center transform scale-95 transition-transform duration-300" id="fe-block-modal-content">
                    <div class="w-20 h-20 bg-red-500/10 rounded-[28px] flex items-center justify-center mb-6 shadow-inner border border-red-500/30">
                        <span class="material-symbols-outlined text-red-500 text-4xl">block</span>
                    </div>
                    <h3 class="font-display-lg text-2xl text-slate-800 dark:text-white mb-4" id="fe-block-title">Access Denied</h3>
                    <div class="text-slate-600 dark:text-slate-300 font-body-sm space-y-3 mb-8">
                        <p class="text-red-600 dark:text-red-400 font-bold p-3 bg-red-500/10 rounded-xl border border-red-500/20" id="fe-block-message">Action not permitted.</p>
                    </div>
                    <div class="flex gap-4 w-full">
                        <button id="fe-block-ok-btn" class="flex-1 bg-red-500 text-white font-bold py-4 rounded-2xl shadow-lg shadow-red-500/20 active:scale-95 transition-all hover:brightness-110">Understood</button>
                    </div>
                </div>
            `;
            document.body.appendChild(modal);
        }
        
        document.getElementById('fe-block-title').textContent = title || 'Access Denied';
        document.getElementById('fe-block-message').textContent = message || 'Action not permitted.';
        
        const okBtn = document.getElementById('fe-block-ok-btn');
        const modalContent = document.getElementById('fe-block-modal-content');
        
        const newOkBtn = okBtn.cloneNode(true);
        okBtn.parentNode.replaceChild(newOkBtn, okBtn);
        
        const closeModal = () => {
            modal.classList.remove('opacity-100');
            modalContent.classList.remove('scale-100');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 300);
        };
        
        newOkBtn.addEventListener('click', closeModal);
        
        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.add('opacity-100');
            modalContent.classList.add('scale-100');
        });
    };

    window.resumeFEExamPart2 = function() {
        clearInterval(feBreakTimerInterval);
        const breakModal = document.getElementById('fe-exam-break-modal');
        if (breakModal) breakModal.classList.add('hidden');
        
        if (window.state) window.state.hasTakenFEBreak = true;
        
        if (window.startTimer) window.startTimer();
        if (window.loadQuestion) window.loadQuestion();
        if (window.updateQuestionMap) window.updateQuestionMap();
    };
})();
