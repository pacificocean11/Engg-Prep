(function() {
    // --- 1. Unlock Logic ---
    function checkFESimulatorUnlock() {
        const lockedDiv = document.getElementById('fe-simulator-locked');
        const unlockedDiv = document.getElementById('fe-simulator-unlocked');
        const progBar = document.getElementById('fe-sim-progress');
        const lockText = document.getElementById('fe-sim-lock-text');
        
        if (!lockedDiv) return;
        
        // Use window.state dynamically so it isn't undefined when IIFE runs early
        const points = (window.state && window.state.userPoints) ? window.state.userPoints : 0;
        const required = 500;
        
        console.log(`[FE Simulator] Unlock Check - Points: ${points}, Required: ${required}`);
        
        if (points >= required) {
            lockedDiv.classList.remove('flex');
            lockedDiv.classList.add('hidden');
            lockedDiv.style.display = 'none'; // Fallback
            
            unlockedDiv.classList.remove('hidden');
            unlockedDiv.classList.add('flex');
            unlockedDiv.style.display = 'flex'; // Fallback
        } else {
            lockedDiv.classList.remove('hidden');
            lockedDiv.classList.add('flex');
            lockedDiv.style.display = 'flex'; // Fallback
            
            unlockedDiv.classList.remove('flex');
            unlockedDiv.classList.add('hidden');
            unlockedDiv.style.display = 'none'; // Fallback
            const pct = Math.min(100, (points / required) * 100);
            if (progBar) progBar.style.width = pct + '%';
            if (lockText) lockText.innerHTML = `<span class="material-symbols-outlined text-[14px] align-text-bottom">lock</span> ${points}/${required} Points to Unlock`;
        }
    }
    
    // Expose globally so app.js updateGamificationUI can call it
    window.checkFESimulatorUnlock = checkFESimulatorUnlock;
    
    // Initial check
    checkFESimulatorUnlock();


    // --- 2. FE EXAM GENERATOR (110 questions, NCEES Blueprint) ---
    function generateFEExam() {
        // NCEES FE Mechanical Blueprint (110 questions)
        const blueprint = {
            'math': 8,                 // Mathematics
            'stats': 5,                // Probability and Statistics
            'ethics': 4,               // Ethics and Professional Practice
            'econ': 4,                 // Engineering Economics
            'electricity': 6,          // Electricity and Magnetism
            'statics': 10,             // Statics
            'dynamics': 10,            // Dynamics, Kinematics, and Vibrations
            'materials-strength': 10,  // Mechanics of Materials
            'materials-science': 8,    // Material Properties and Processing
            'fluids': 11,              // Fluid Mechanics
            'thermo': 12,              // Thermodynamics
            'heat': 8,                 // Heat Transfer
            'instr-controls': 6,       // Measurements, Instrumentation, and Controls
            'design': 8                // Mechanical Design and Analysis
        };
        
        let subjectGroups = [];
        const sourceDB = (typeof EXAM_QUESTIONS !== 'undefined') ? EXAM_QUESTIONS : ((typeof QUESTIONS !== 'undefined') ? QUESTIONS : window.QUESTIONS); 
        
        for (const [subjectId, count] of Object.entries(blueprint)) {
            if (sourceDB && sourceDB[subjectId]) {
                const pool = [...sourceDB[subjectId]].map(q => ({...q, subjectId}));
                pool.sort(() => Math.random() - 0.5);
                
                let group = pool.slice(0, count);
                while (group.length < count && pool.length > 0) {
                     group.push(pool[Math.floor(Math.random() * pool.length)]);
                }
                
                subjectGroups.push(group);
            }
        }
        
        // Shuffle the order of the subjects
        subjectGroups.sort(() => Math.random() - 0.5);
        
        // Flatten the array so subjects are presented together
        let selectedQuestions = subjectGroups.flat();
        
        // Final fallback padding if somehow we are short
        while (selectedQuestions.length < 110) {
            const allKeys = sourceDB ? Object.keys(sourceDB) : [];
            if(allKeys.length === 0) break;
            const randomSub = allKeys[Math.floor(Math.random() * allKeys.length)];
            if(sourceDB[randomSub] && sourceDB[randomSub].length > 0) {
                const q = sourceDB[randomSub][Math.floor(Math.random() * sourceDB[randomSub].length)];
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

    window.startFullFEExamFlow = function() {
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
        
        const questions = generateFEExam();

        window.state.currentSubject = { name: "Mechanical FE Simulator", id: "fe-simulator" };
        window.state.currentTopic = "Official Mechanical Blueprint";
        
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
