document.addEventListener("DOMContentLoaded", () => {
    const pageTitle = document.getElementById('page-title');
    const subjectList = document.getElementById('subject-list');
    const quizView = document.getElementById('quiz-view');
    const questionText = document.getElementById('question-text');
    const optionsContainer = document.getElementById('options-container');
    const questionMeta = document.getElementById('question-meta');
    const quizProgressInner = document.getElementById('quiz-progress-inner');
    const quizTimer = document.getElementById('quiz-timer');
    const explanationContainer = document.getElementById('explanation-container');
    const explanationText = document.getElementById('explanation-text');
    const questionMap = document.getElementById('question-map');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const submitBtn = document.getElementById('submit-btn');
    const flagBtn = document.getElementById('flag-btn');
    const finishBtn = document.getElementById('finish-btn');
    const closeResultsBtn = document.getElementById('close-results');
    const reviewResultsBtn = document.getElementById('review-results');
    const resultsQuestionMap = document.getElementById('results-question-map');
    const resultsDetailedList = document.getElementById('results-detailed-list');
    const resetDataBtn = document.getElementById('reset-data-btn');
    const exitQuizBtn = document.getElementById('exit-quiz');
    const quizLegendActive = document.getElementById('quiz-legend-active');
    const quizLegendReview = document.getElementById('quiz-legend-review');
    // const startMockExamBtn = document.getElementById('start-mock-exam');
    const resTotal = document.getElementById('res-total');
    const resAttempted = document.getElementById('res-attempted');
    const resCorrect = document.getElementById('res-correct');
    const resAccuracy = document.getElementById('res-accuracy');
    const resultsSubjectName = document.getElementById('results-subject-name');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const circleBg = document.getElementById('overall-progress-circle');
    const textDisplay = document.getElementById('overall-progress-text');
    const circleDisplay = document.getElementById('overall-progress-circle-text');
    const syncIndicator = document.getElementById('cloud-sync-indicator');

    function startQuiz(subjectId, topicName) {
        // Update background theme for the subject (A-1)
        if (window.updateBackgroundTheme) window.updateBackgroundTheme(subjectId);

        const subject = window.state.subjects.find(s => s.id === subjectId);
        let questions = getQuestionsSource()[subjectId] || [];
        
        if (topicName) {
            questions = questions.filter(q => q.topic === topicName);
        }

        if (questions.length === 0) {
            alert("No questions available for this topic yet.");
            return;
        }

        window.state.currentSubject = subject;
        window.state.currentTopic = topicName;
        
        const selectedRaw = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);
        // Tag each question with its subjectId for persistence
        const taggedQuestions = selectedRaw.map(q => ({ ...q, subjectId: subjectId }));
        window.state.quizQuestions = prepareQuestions(taggedQuestions);
        
        window.state.currentQuestionIndex = 0;
        window.state.answers = new Array(window.state.quizQuestions.length).fill(null);
        window.state.submitted = new Array(window.state.quizQuestions.length).fill(false);
        window.state.flagged = new Array(window.state.quizQuestions.length).fill(false);
        window.state.confidence = new Array(window.state.quizQuestions.length).fill(null);
        window.state.questionTimes = new Array(window.state.quizQuestions.length).fill(0);
        window.state.questionEnteredAt = Date.now();
        window.state.score = 0;
        window.state.secondsElapsed = 0;
        window.state.isFinished = false;
        window.state.isMockExam = false;

        navigateTo('quiz-view');
        updateQuestionMap();
        loadQuestion();
        startTimer();
    }

    function loadQuestion() {
        if (typeof stopSpeech === 'function') stopSpeech();
        // Record time spent on previous question before loading new one
        if (window.state.questionEnteredAt && !window.state.isFinished) {
            // We don't record here because time is recorded on submit; just reset the entry timestamp
        }
        window.state.questionEnteredAt = Date.now();

        const question = window.state.quizQuestions[window.state.currentQuestionIndex];
        questionMeta.textContent = `Question ${window.state.currentQuestionIndex + 1} of ${window.state.quizQuestions.length} • ${window.state.currentTopic || window.state.currentSubject.name}`;
        
        questionText.innerHTML = `<p>${injectFormulaTriggers(question.question)}</p>`;
        
        const diagramsUnlocked = true; // Images unlocked for all users
        
        if (diagramsUnlocked) {
            if (question.question_image) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'question-image-container';
                imgDiv.innerHTML = `<img src="${toDriveImgUrl(question.question_image)}" alt="Question Diagram" class="quiz-image">`;
                questionText.appendChild(imgDiv);
            } else if (question.image) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'question-image-container';
                imgDiv.innerHTML = `<img src="${toDriveImgUrl(question.image)}" alt="Question Diagram" class="quiz-image">`;
                questionText.appendChild(imgDiv);
            } else if (question.tikz) {
                const tikzDiv = document.createElement('div');
                tikzDiv.className = 'tikz-container';
                const script = document.createElement('script');
                script.type = 'text/tikz';
                script.textContent = question.tikz;
                tikzDiv.appendChild(script);
                questionText.appendChild(tikzDiv);
                
                const trigger = () => window.dispatchEvent(new Event('load'));
                setTimeout(trigger, 50);
                setTimeout(trigger, 200);
                setTimeout(trigger, 500);
            }
        } else if (question.question_image || question.image || question.tikz) {
            const lockedDiv = document.createElement('div');
            lockedDiv.className = 'bg-surface-container-low dark:bg-slate-800 p-4 rounded-xl text-center my-4 border border-outline/20 dark:border-slate-700';
            lockedDiv.innerHTML = '<span class="material-symbols-outlined text-outline dark:text-slate-400 mb-2">lock</span><p class="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">Diagram locked. Earn 150 points to view.</p>';
            questionText.appendChild(lockedDiv);
        }
        
        const progress = ((window.state.currentQuestionIndex + 1) / window.state.quizQuestions.length) * 100;
        quizProgressInner.style.width = `${progress}%`;

        explanationContainer.classList.add('hidden');
        explanationText.innerHTML = '';

        // --- Confidence Slider ---
        const existingConfBar = document.getElementById('confidence-bar');
        if (existingConfBar) existingConfBar.remove();
        // Remove stale review badges to prevent stacking on question navigation
        document.querySelectorAll('.confidence-review-badge').forEach(el => el.remove());

        if (!window.state.isFinished && !window.state.submitted[window.state.currentQuestionIndex]) {
            const confBar = document.createElement('div');
            confBar.id = 'confidence-bar';
            confBar.className = 'confidence-bar';
            const savedConf = window.state.confidence[window.state.currentQuestionIndex];
            confBar.innerHTML = `
                <div class="confidence-label">How confident are you?</div>
                <div class="confidence-options">
                    ${[1,2,3,4,5].map(level => {
                        const emojis = ['😰','🤔','😐','😊','😎'];
                        const labels = ['Guessing','Unsure','Neutral','Fairly Sure','Certain'];
                        return `<button class="conf-btn ${savedConf === level ? 'conf-active' : ''}" data-conf="${level}" title="${labels[level-1]}">
                            <span class="conf-emoji">${emojis[level-1]}</span>
                            <span class="conf-text">${labels[level-1]}</span>
                        </button>`;
                    }).join('')}
                </div>
            `;
            // Insert before the quiz footer
            const quizFooter = document.querySelector('.quiz-footer');
            if (quizFooter) {
                quizFooter.parentNode.insertBefore(confBar, quizFooter);
            }
            confBar.querySelectorAll('.conf-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    const level = parseInt(btn.getAttribute('data-conf'));
                    window.state.confidence[window.state.currentQuestionIndex] = level;
                    confBar.querySelectorAll('.conf-btn').forEach(b => b.classList.remove('conf-active'));
                    btn.classList.add('conf-active');
                });
            });
        } else if (window.state.isFinished || window.state.submitted[window.state.currentQuestionIndex]) {
            // Show confidence badge in review mode if one was recorded
            const confLevel = window.state.confidence[window.state.currentQuestionIndex];
            if (confLevel) {
                const emojis = ['😰','🤔','😐','😊','😎'];
                const labels = ['Guessing','Unsure','Neutral','Fairly Sure','Certain'];
                const badge = document.createElement('div');
                badge.className = 'confidence-review-badge';
                badge.innerHTML = `<span>${emojis[confLevel-1]}</span> You felt: <strong>${labels[confLevel-1]}</strong>`;
                const quizFooter = document.querySelector('.quiz-footer');
                if (quizFooter) {
                    quizFooter.parentNode.insertBefore(badge, quizFooter);
                }
            }
        }

        optionsContainer.innerHTML = '';
        question.options.forEach((option, index) => {
            const div = document.createElement('div');
            div.className = 'option';
            if (window.state.answers[window.state.currentQuestionIndex] === index) {
                div.classList.add('selected');
            }
            
            div.innerHTML = `
                <span class="option-prefix">${option.label}</span>
                <span class="option-text">${option.text}</span>
            `;
            
            div.addEventListener('click', () => selectOption(index));
            optionsContainer.appendChild(div);
        });

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }

        updateQuestionMap();

        if (window.state.isFinished) {
            quizLegendActive.classList.add('hidden');
            quizLegendReview.classList.remove('hidden');
        } else {
            quizLegendActive.classList.remove('hidden');
            quizLegendReview.classList.add('hidden');
        }

        prevBtn.disabled = window.state.currentQuestionIndex === 0;
        
        if (window.state.flagged[window.state.currentQuestionIndex]) {
            flagBtn.classList.add('active');
        } else {
            flagBtn.classList.remove('active');
        }

        nextBtn.disabled = window.state.currentQuestionIndex === window.state.quizQuestions.length - 1;
        nextBtn.classList.remove('hidden');
        prevBtn.classList.remove('hidden');

        if (window.state.isFinished) {
            showFeedback();
            submitBtn.classList.add('hidden');
        } else {
            if (window.state.submitted[window.state.currentQuestionIndex]) {
                submitBtn.classList.add('hidden');
            } else {
                submitBtn.classList.remove('hidden');
            }
        }
    }

    function selectOption(index) {
        if (window.state.isFinished || window.state.submitted[window.state.currentQuestionIndex]) return; 
        
        if (navigator.vibrate) navigator.vibrate(10);
        
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected', 'tap-bounce'));
        
        const selectedOpt = options[index];
        selectedOpt.classList.add('selected', 'tap-bounce');
        setTimeout(() => selectedOpt.classList.remove('tap-bounce'), 200);
        
        window.state.answers[window.state.currentQuestionIndex] = index;
        updateQuestionMap();
    }

    function updateQuestionMap() {
        if (!questionMap) return;
        questionMap.innerHTML = '';
        window.state.quizQuestions.forEach((_, idx) => {
            const btn = document.createElement('button');
            btn.className = 'map-btn w-8 h-8 rounded-lg font-bold text-xs transition-all active:scale-90 flex items-center justify-center';
            btn.textContent = idx + 1;
            
            // Apply semantic color-coding based on active quiz state
            if (idx === window.state.currentQuestionIndex) {
                btn.classList.add('current');
            }
            
            if (window.state.flagged[idx]) {
                btn.classList.add('flagged');
            }
            
            if (window.state.submitted[idx]) {
                if (window.state.isFinished) {
                    const q = window.state.quizQuestions[idx];
                    const selectedIdx = window.state.answers[idx];
                    const isCorrect = selectedIdx !== null && q.options[selectedIdx] && q.options[selectedIdx].is_correct;
                    btn.classList.add(isCorrect ? 'correct-res' : 'wrong-res');
                } else {
                    btn.classList.add('answered');
                }
            }
            
            btn.onclick = () => {
                window.state.currentQuestionIndex = idx;
                loadQuestion();
            };
            
            questionMap.appendChild(btn);
        });
        
        // Also update results question map if it exists
        if (resultsQuestionMap && window.state.isFinished) {
            resultsQuestionMap.innerHTML = questionMap.innerHTML;
            const resultBtns = resultsQuestionMap.querySelectorAll('button');
            resultBtns.forEach((btn, idx) => {
                btn.onclick = () => {
                    navigateTo('quiz-view');
                    window.state.currentQuestionIndex = idx;
                    loadQuestion();
                };
            });
        }
        
        if (window.updateFollowerListeners) window.updateFollowerListeners();
    }

    function showFeedback() {
        const question = window.state.quizQuestions[window.state.currentQuestionIndex];
        const selectedIndex = window.state.answers[window.state.currentQuestionIndex];
        const options = document.querySelectorAll('.option');
        
        options.forEach((opt, idx) => {
            if (question.options[idx].is_correct) {
                opt.classList.add('correct');
            } else if (idx === selectedIndex) {
                opt.classList.add('wrong');
            }
        });

        explanationText.innerHTML = '';

        const diagramsUnlocked = true; // Images unlocked for all users
        const solImg = question.solution_image || (question.solution && question.solution.solution_image);
        
        if (diagramsUnlocked) {
            if (solImg) {
                const globalImgDiv = document.createElement('div');
                globalImgDiv.className = 'solution-image-container';
                globalImgDiv.innerHTML = `<img src="${toDriveImgUrl(solImg)}" alt="Solution Overview" class="quiz-image">`;
                explanationText.appendChild(globalImgDiv);
            }
        } else if (solImg) {
            const lockedDiv = document.createElement('div');
            lockedDiv.className = 'bg-surface-container-low dark:bg-slate-800 p-4 rounded-xl text-center my-4 border border-outline/20 dark:border-slate-700';
            lockedDiv.innerHTML = '<span class="material-symbols-outlined text-outline dark:text-slate-400 mb-2">lock</span><p class="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">Solution diagram locked. Earn 150 points to view.</p>';
            explanationText.appendChild(lockedDiv);
        }

        question.solution.steps.forEach((step, idx) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'solution-step';
            
            stepDiv.innerHTML = `
                <h5>Step ${idx + 1}: ${step.title}</h5>
                <p>${injectFormulaTriggers(step.content)}</p>
            `;
            const stepImg = step.solution_image || step.image;
            
            if (diagramsUnlocked) {
                if (stepImg) {
                    const imgDiv = document.createElement('div');
                    imgDiv.className = 'step-image-container';
                    imgDiv.innerHTML = `<img src="${stepImg}" alt="Step ${idx + 1} Diagram" class="quiz-image">`;
                    stepDiv.appendChild(imgDiv);
                } else if (step.tikz) {
                    const tikzDiv = document.createElement('div');
                    tikzDiv.className = 'tikz-container';
                    const script = document.createElement('script');
                    script.type = 'text/tikz';
                    script.textContent = step.tikz;
                    tikzDiv.appendChild(script);
                    stepDiv.appendChild(tikzDiv);
                    
                    const trigger = () => window.dispatchEvent(new Event('load'));
                    setTimeout(trigger, 50);
                    setTimeout(trigger, 200);
                    setTimeout(trigger, 500);
                }
            } else if (stepImg || step.tikz) {
                const lockedDiv = document.createElement('div');
                lockedDiv.className = 'bg-surface-container-low dark:bg-slate-800 p-4 rounded-xl text-center my-4 border border-outline/20 dark:border-slate-700';
                lockedDiv.innerHTML = '<span class="material-symbols-outlined text-outline dark:text-slate-400 mb-2">lock</span><p class="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">Step diagram locked. Earn 150 points to view.</p>';
                stepDiv.appendChild(lockedDiv);
            }
            explanationText.appendChild(stepDiv);
        });

        const finalDiv = document.createElement('div');
        finalDiv.className = 'final-answer';
        finalDiv.innerHTML = `<strong>Final Answer:</strong> ${question.solution.final_answer}`;
        explanationText.appendChild(finalDiv);

        // --- NCEES Handbook Reference ---
        if (question.ncees_reference) {
            const nceesDiv = document.createElement('div');
            nceesDiv.className = 'mt-4 mb-2 p-4 rounded-[20px] bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40 flex items-center gap-3 relative overflow-hidden';
            nceesDiv.innerHTML = `
                <div class="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900/60 shadow-inner flex items-center justify-center shrink-0 z-10 border border-amber-200 dark:border-amber-700/50">
                    <span class="material-symbols-outlined text-amber-600 dark:text-amber-400 text-2xl" style="font-variation-settings:'FILL' 1;">menu_book</span>
                </div>
                <div class="flex-1 min-w-0 z-10">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-[9px] font-black bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm px-1.5 py-0.5 rounded uppercase tracking-widest">NCEES v${question.ncees_reference.version || '10.6'}</span>
                        <span class="text-xs font-bold text-amber-900 dark:text-amber-100 truncate">${question.ncees_reference.section}</span>
                    </div>
                    <p class="text-[11px] text-amber-700 dark:text-amber-300 leading-tight">
                        Topic: <strong>${question.ncees_reference.topic}</strong><br>
                        ${question.ncees_reference.page_number ? `<span class="opacity-100 font-bold bg-amber-200/50 dark:bg-amber-800/50 px-1 rounded inline-block mt-0.5 mb-0.5 shadow-sm">Page ${question.ncees_reference.page_number}</span> &middot; ` : ''}<span class="opacity-80">Search for: <em>"${question.ncees_reference.search_term}"</em></span>
                    </p>
                </div>
                <div class="absolute -right-6 -top-6 w-24 h-24 bg-white/40 dark:bg-white/5 blur-2xl rounded-full pointer-events-none"></div>
            `;
            explanationText.appendChild(nceesDiv);
        }

        // --- Video Explanation (Vimeo) ---
        const videoField = question.solution && question.solution.video_explanation;
        if (videoField && videoField.trim() !== '') {
            // Accept full URL (https://vimeo.com/123456789) or bare numeric ID
            const vimeoIdMatch = videoField.trim().match(/(?:vimeo\.com\/|^)(\d+)/);
            const vimeoId = vimeoIdMatch ? vimeoIdMatch[1] : null;
            if (vimeoId) {
                const videoDiv = document.createElement('div');
                videoDiv.className = 'video-explanation-container';
                videoDiv.innerHTML = `
                    <div class="video-explanation-header">
                        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1; color: #FF006E;">play_circle</span>
                        <span>Video Explanation</span>
                    </div>
                    <div class="video-iframe-wrapper">
                        <iframe
                            src="https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479"
                            frameborder="0"
                            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                            allowfullscreen
                            title="Video Explanation"
                            loading="lazy">
                        </iframe>
                    </div>
                `;
                explanationText.appendChild(videoDiv);
            }
        }

        // --- Performance Benchmarking ---
        const qStr = question.question.substring(0, 50);
        let hash = 0;
        for(let i=0; i<qStr.length; i++) hash = ((hash << 5) - hash) + qStr.charCodeAt(i);
        const peerTime = 40 + Math.abs(hash % 120); 
        const peerSuccess = 35 + Math.abs(hash % 50); 
        
        const userTime = window.state.questionTimes[window.state.currentQuestionIndex] || 0;
        const timeDiff = userTime - peerTime;
        let timeColor = timeDiff > 10 ? 'text-amber-500' : (timeDiff < -10 ? 'text-green-500' : 'text-slate-500 dark:text-slate-400');
        
        const benchmarkDiv = document.createElement('div');
        benchmarkDiv.className = 'mt-4 p-4 rounded-[20px] bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col gap-2 relative overflow-hidden';
        benchmarkDiv.innerHTML = `
            <div class="absolute -right-4 -top-4 w-16 h-16 bg-secondary/10 rounded-full blur-xl pointer-events-none"></div>
            <div class="flex items-center gap-2 mb-1">
                <span class="material-symbols-outlined text-secondary text-lg" style="font-variation-settings:'FILL' 1;">analytics</span>
                <span class="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">Peer Benchmarking</span>
            </div>
            <div class="flex flex-col sm:flex-row gap-4 relative z-10">
                <div class="flex-1 flex flex-col gap-1">
                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Time Spent</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-xl font-black ${timeColor}">${userTime}s</span>
                        <span class="text-[10px] text-slate-400 font-medium bg-slate-200/50 dark:bg-slate-700/50 px-1.5 py-0.5 rounded">Avg: ${peerTime}s</span>
                    </div>
                </div>
                <div class="w-px bg-slate-200 dark:bg-slate-700 hidden sm:block"></div>
                <div class="flex-1 flex flex-col gap-1">
                    <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Success Rate</span>
                    <div class="flex items-baseline gap-2">
                        <span class="text-xl font-black text-slate-700 dark:text-slate-200">${peerSuccess}%</span>
                        <span class="text-[10px] text-slate-400 font-medium">Got it right</span>
                    </div>
                </div>
            </div>
        `;
        explanationText.appendChild(benchmarkDiv);

        explanationContainer.classList.remove('hidden');


        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }

        submitBtn.classList.add('hidden');
        nextBtn.classList.remove('hidden');
    }

    function setupQuizListeners() {
        if (finishBtn) {
            finishBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to finish the quiz and see your results?")) {
                    finishQuiz();
                }
            });
        }

        if (flagBtn) {
            flagBtn.addEventListener('click', () => {
                window.state.flagged[window.state.currentQuestionIndex] = !window.state.flagged[window.state.currentQuestionIndex];
                flagBtn.classList.toggle('active');
                updateQuestionMap();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                const selectedIdx = window.state.answers[window.state.currentQuestionIndex];
                if (selectedIdx === null || selectedIdx === undefined) {
                    alert("Please select an option first.");
                    return;
                }
                
                // Record time spent on this question
                if (window.state.questionEnteredAt) {
                    const timeSpent = (Date.now() - window.state.questionEnteredAt) / 1000; // seconds
                    window.state.questionTimes[window.state.currentQuestionIndex] = Math.round(timeSpent);
                }

                // Default confidence to 3 (Neutral) if not set
                if (window.state.confidence[window.state.currentQuestionIndex] === null) {
                    window.state.confidence[window.state.currentQuestionIndex] = 3;
                }

                const question = window.state.quizQuestions[window.state.currentQuestionIndex];
                const isCorrect = question.options[selectedIdx].is_correct;
                
                if (window.recordSRS) window.recordSRS(question, isCorrect);
                if (window.incrementQuestProgress) window.incrementQuestProgress('questions_answered', 1);
                
                window.state.submitted[window.state.currentQuestionIndex] = true;
                window.state.flagged[window.state.currentQuestionIndex] = false;
                
                const selectedEl = document.querySelector('.option.selected');
                
                if (isCorrect) {
                    addPoints(1);
                    if (navigator.vibrate) navigator.vibrate([30, 50, 30]); // Success vibration
                    if (selectedEl) {
                        selectedEl.classList.add('correct-pulse');
                        setTimeout(() => selectedEl.classList.remove('correct-pulse'), 400);
                    }
                } else {
                    if (navigator.vibrate) navigator.vibrate([100, 50, 100]); // Failure vibration
                    if (selectedEl) {
                        selectedEl.classList.add('shake-error');
                        setTimeout(() => selectedEl.classList.remove('shake-error'), 400);
                    }
                }
                
                updateQuestionMap();
                
                if (window.state.currentQuestionIndex < window.state.quizQuestions.length - 1) {
                    setTimeout(() => {
                        if (!window.state.isFinished) {
                            window.state.currentQuestionIndex++;
                            loadQuestion();
                        }
                    }, 300);
                } else {
                    loadQuestion();
                    alert("Last question answered! Click 'Finish Session' to see results.");
                }
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                if (window.state.currentQuestionIndex < window.state.quizQuestions.length - 1) {
                    window.state.currentQuestionIndex++;
                    loadQuestion();
                }
            });
        }

        if (closeResultsBtn) {
            closeResultsBtn.addEventListener('click', () => {
                navigateTo('study');
            });
        }

        if (reviewResultsBtn) {
            reviewResultsBtn.addEventListener('click', () => {
                navigateTo('quiz-view');
                window.state.currentQuestionIndex = 0;
                loadQuestion();
            });
        }

        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to erase all your progress? This cannot be undone.")) {
                    const key = `enggtv_progress_${window.state.user.username}`;
                    localStorage.removeItem(key);
                    window.state.userProgress = {};
                    renderSubjects();
                    updateDashboardStats();
                    alert("All progress has been reset.");
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (window.state.currentQuestionIndex > 0) {
                    window.state.currentQuestionIndex--;
                    loadQuestion();
                }
            });
        }

        if (exitQuizBtn) {
            exitQuizBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to exit the quiz? Your progress won't be saved.")) {
                    stopTimer();
                    navigateTo('study');
                }
            });
        }

        // Expose functions to global scope for inline handlers
        window.startMockExam = startMockExam;
        window.startQuiz = startQuiz;
        window.openMockPreview = openMockPreview;
        window.closeMockPreview = closeMockPreview;
        window.confirmStartMock = confirmStartMock;
    }

    function openMockPreview() {
        const modal = document.getElementById('mock-preview-modal');
        if (modal) modal.classList.remove('hidden');
    }

    function closeMockPreview() {
        const modal = document.getElementById('mock-preview-modal');
        if (modal) modal.classList.add('hidden');
    }

    function confirmStartMock() {
        closeMockPreview();
        startMockExam();
    }

    function startMockExam() {
        const totalExamQuestions = 20;
        let selectedQuestions = [];
        let availablePools = [];

        window.state.subjects.forEach(subject => {
            const subjectQuestions = QUESTIONS[subject.id] || [];
            if (subjectQuestions.length > 0) {
                // Tag each question with its subjectId
                const taggedPool = [...subjectQuestions].map(q => ({ ...q, subjectId: subject.id }));
                availablePools.push(taggedPool.sort(() => 0.5 - Math.random()));
            }
        });

        if (availablePools.length === 0) {
            alert("No questions available.");
            return;
        }

        let poolIndex = 0;
        while (selectedQuestions.length < totalExamQuestions && availablePools.length > 0) {
            const question = availablePools[poolIndex].pop();
            selectedQuestions.push(question);
            
            if (availablePools[poolIndex].length === 0) {
                availablePools.splice(poolIndex, 1);
            } else {
                poolIndex++;
            }
            
            if (poolIndex >= availablePools.length) {
                poolIndex = 0;
            }
        }

        window.state.currentSubject = { name: "Full Mock Exam", id: "mock" };
        window.state.currentTopic = "All Subjects";
        window.state.quizQuestions = prepareQuestions(selectedQuestions);
        window.state.currentQuestionIndex = 0;
        window.state.answers = new Array(window.state.quizQuestions.length).fill(null);
        window.state.submitted = new Array(window.state.quizQuestions.length).fill(false);
        window.state.flagged = new Array(window.state.quizQuestions.length).fill(false);
        window.state.score = 0;
        window.state.secondsElapsed = 0;
        window.state.isFinished = false;
        window.state.isMockExam = true;

        navigateTo('quiz-view');
        updateQuestionMap();
        loadQuestion();
        startTimer();
    }

    function showToast(title, subtitle, icon = 'stars') {
        const container = document.getElementById('toast-container');
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 5000);
    }

    function finishQuiz() {
        stopTimer();
        
        if (window.state.isFinished) {
            navigateTo('results-view');
            return;
        }

        // Record time for the currently viewed question if not yet submitted
        if (window.state.questionEnteredAt && !window.state.submitted[window.state.currentQuestionIndex]) {
            const timeSpent = (Date.now() - window.state.questionEnteredAt) / 1000;
            window.state.questionTimes[window.state.currentQuestionIndex] = Math.round(timeSpent);
        }

        const prevPoints = window.state.userPoints;
        let attempted = 0;
        let correct = 0;

        window.state.quizQuestions.forEach((q, idx) => {
            if (window.state.submitted[idx]) {
                attempted++;
                const selectedIndex = window.state.answers[idx];
                if (selectedIndex !== null && q.options[selectedIndex].is_correct) {
                    correct++;
                }
            }
        });
        
        // Save points (User specific)
        const pointsKey = `enggtv_points_${window.state.user.username}`;
        localStorage.setItem(pointsKey, window.state.userPoints.toString());
        
        window.state.score = correct;
        const newPoints = window.state.userPoints;

        // Check for achievements
        ACHIEVEMENTS.forEach(ach => {
            if (prevPoints < ach.points && newPoints >= ach.points) {
                setTimeout(() => {
                    window.showToast('Milestone Unlocked! 🏆', ach.name, ach.icon);
                    if (window.confetti) window.confetti({ particleCount: 250, spread: 100, origin: { y: 0.4 }, zIndex: 10005 });
                }, 1000);
            }
        });

        if (window.state.isMockExam) {
            setTimeout(() => {
                if (window.confetti) window.confetti({ particleCount: 400, spread: 120, origin: { y: 0.5 }, zIndex: 10000 });
            }, 500);
        }

        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
        
        if (accuracy >= 80 && window.incrementQuestProgress) {
            window.incrementQuestProgress('perfect_quiz', 1);
        }
        if (window.state.currentSubject && window.state.currentSubject.id === 'srs-review' && window.incrementQuestProgress) {
            window.incrementQuestProgress('srs_review', 1);
        }
        
        // Save to recent activity
        const activityTitle = window.state.isMockExam ? 'Mock Exam' : (window.state.currentTopic || window.state.currentSubject.name);
        const isActivityAdvanced = !window.state.isMockExam && localStorage.getItem('enggtv_advanced_mode') === 'true';
        const newActivity = {
            id: Date.now().toString(),
            title: activityTitle,
            score: correct,
            accuracy: accuracy,
            attempted: attempted,
            isMockExam: window.state.isMockExam,
            isAdvanced: isActivityAdvanced,
            timestamp: Date.now(),
            stateSnapshot: {
                quizQuestions: JSON.parse(JSON.stringify(window.state.quizQuestions)),
                answers: [...window.state.answers],
                submitted: [...window.state.submitted],
                flagged: [...window.state.flagged],
                confidence: [...window.state.confidence],
                questionTimes: [...window.state.questionTimes],
                currentSubject: JSON.parse(JSON.stringify(window.state.currentSubject)),
                currentTopic: window.state.currentTopic
            },
            minimalSnapshot: {
                isAdvanced: isActivityAdvanced,
                subjectId: window.state.currentSubject.id,
                topic: window.state.currentTopic,
                questions: window.state.quizQuestions.map(q => {
                    const sId = q.subjectId || window.state.currentSubject.id;
                    const masterList = (isActivityAdvanced ? ADVANCED_QUESTIONS : QUESTIONS)[sId] || [];
                    return {
                        sid: sId,
                        idx: masterList.findIndex(item => item.title === q.title)
                    };
                }),
                // Store answer indices relative to the MASTER list (stable), not the shuffled list
                answers: window.state.answers.map((ansIdx, qIdx) => {
                    if (ansIdx === null) return null;
                    return window.state.quizQuestions[qIdx].options[ansIdx].originalIndex;
                }),
                submitted: [...window.state.submitted],
                flagged: [...window.state.flagged],
                confidence: [...window.state.confidence],
                questionTimes: [...window.state.questionTimes]
            }
        };
        window.state.recentActivity.unshift(newActivity);
        
        // Strip huge stateSnapshot from older activities to save space
        window.state.recentActivity.forEach((act, idx) => {
            if (idx >= 5 && act.stateSnapshot) {
                delete act.stateSnapshot;
            }
        });

        if (window.state.recentActivity.length > 100) {
            window.state.recentActivity.pop();
        }
        const activityKey = `enggtv_recent_activity_${window.state.user.username}`;
        localStorage.setItem(activityKey, JSON.stringify(window.state.recentActivity));

        // Final Cloud Sync
        window.syncToFirebase();
        updateGamificationUI();

        resTotal.textContent = window.state.quizQuestions.length;
        resAttempted.textContent = attempted;
        resCorrect.textContent = window.state.score;
        resAccuracy.textContent = `${accuracy}%`;
        resultsSubjectName.textContent = window.state.currentTopic || window.state.currentSubject.name;

        resultsQuestionMap.innerHTML = window.state.quizQuestions.map((q, idx) => {
            let statusClass = '';
            if (window.state.submitted[idx]) {
                const selectedIndex = window.state.answers[idx];
                if (selectedIndex !== null && q.options[selectedIndex].is_correct) {
                    statusClass = 'correct-res';
                } else {
                    statusClass = 'wrong-res';
                }
            }
            return `<button class="map-btn ${statusClass}" data-index="${idx}">${idx + 1}</button>`;
        }).join('');

        document.querySelectorAll('.results-map .map-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                window.state.currentQuestionIndex = parseInt(btn.getAttribute('data-index'));
                window.state.isFinished = true;
                navigateTo('quiz-view');
                loadQuestion();
            });
        });

        // Populate Detailed List
        resultsDetailedList.innerHTML = window.state.quizQuestions.map((q, idx) => {
            let status = 'unanswered';
            let icon = '○';
            if (window.state.submitted[idx]) {
                const selectedIndex = window.state.answers[idx];
                if (selectedIndex !== null && q.options[selectedIndex].is_correct) {
                    status = 'correct';
                    icon = '✓';
                } else {
                    status = 'wrong';
                    icon = '✗';
                }
            }
            
            // Keep LaTeX markers and truncate carefully
            let displayHeader = q.question;
            if (displayHeader.length > 100) {
                displayHeader = displayHeader.substring(0, 100) + '...';
            }
            
            // --- Performance Benchmarking ---
            const qStr = q.question.substring(0, 50);
            let hash = 0;
            for(let i=0; i<qStr.length; i++) hash = ((hash << 5) - hash) + qStr.charCodeAt(i);
            const peerTime = 40 + Math.abs(hash % 120); 
            const peerSuccess = 35 + Math.abs(hash % 50); 
            
            const userTime = window.state.questionTimes[idx] || 0;
            const timeDiff = userTime - peerTime;
            let timeColor = timeDiff > 10 ? 'text-amber-500' : (timeDiff < -10 ? 'text-green-500' : 'text-slate-400');
            
            return `
                <div class="result-item" data-index="${idx}" style="flex-direction: column; align-items: stretch; gap: 12px; padding-bottom: 16px;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div class="result-status-icon ${status} shrink-0">${icon}</div>
                        <div class="result-text">${idx + 1}. ${displayHeader}</div>
                    </div>
                    <div class="flex items-center gap-6 ml-[55px] text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <div class="flex items-center gap-1.5" title="Time Spent vs Average">
                            <span class="material-symbols-outlined text-[14px]">timer</span>
                            <span class="${timeColor}">${userTime}s</span> <span class="opacity-60">(Avg: ${peerTime}s)</span>
                        </div>
                        <div class="flex items-center gap-1.5" title="Global Success Rate">
                            <span class="material-symbols-outlined text-[14px]">public</span>
                            <span>${peerSuccess}% Success</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }

        if (window.state.score === window.state.quizQuestions.length && window.state.quizQuestions.length > 0) {
            triggerConfetti();
        }

        document.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                window.state.currentQuestionIndex = parseInt(item.getAttribute('data-index'));
                window.state.isFinished = true;
                navigateTo('quiz-view');
                loadQuestion();
            });
        });

        // ================================================================
        // SESSION AUTOPSY — Post-Quiz Performance Breakdown
        // ================================================================
        renderSessionAutopsy(attempted, correct, accuracy);

        // Save Progress
        if (!window.state.isMockExam) {
            updateProgress(window.state.currentSubject.id, attempted);
        }
        window.state.isFinished = true;
        navigateTo('results-view');

        // Show summary toast for points gained - Triggered AFTER navigation for visibility
        setTimeout(() => {
            const pointText = correct === 1 ? 'point' : 'points';
            if (typeof window.showToast === 'function') {
                window.showToast(`+${correct} ${pointText} gained!`, `Total: ${newPoints} points`, 'stars');
            }
        }, 1000);
    }

    // ================================================================
    // SESSION AUTOPSY RENDERER
    // ================================================================
    function renderSessionAutopsy(attempted, correct, accuracy) {
        let autopsyContainer = document.getElementById('session-autopsy');
        if (!autopsyContainer) {
            // Create the autopsy section inside results-view
            const resultsReviewSection = document.querySelector('.results-review-section');
            if (!resultsReviewSection) return;
            autopsyContainer = document.createElement('div');
            autopsyContainer.id = 'session-autopsy';
            autopsyContainer.className = 'session-autopsy';
            resultsReviewSection.parentNode.insertBefore(autopsyContainer, resultsReviewSection);
        }

        const times = window.state.questionTimes;
        const totalTimeSec = times.reduce((a, b) => a + b, 0);
        const avgTimeSec = attempted > 0 ? (totalTimeSec / window.state.quizQuestions.length) : 0;
        const maxTime = Math.max(...times, 1);
        const fastestIdx = times.indexOf(Math.min(...times.filter(t => t > 0)));
        const slowestIdx = times.indexOf(Math.max(...times));

        // Build Confidence vs Accuracy matrix data with per-question tracking
        let matrix = { confRight: [], confWrong: [], unsureRight: [], unsureWrong: [] };
        window.state.quizQuestions.forEach((q, idx) => {
            if (!window.state.submitted[idx]) return;
            const selectedIndex = window.state.answers[idx];
            const isCorrect = selectedIndex !== null && q.options[selectedIndex].is_correct;
            const conf = window.state.confidence[idx] || 3;
            const isConfident = conf >= 4;
            if (isConfident && isCorrect) matrix.confRight.push(idx);
            else if (isConfident && !isCorrect) matrix.confWrong.push(idx);
            else if (!isConfident && isCorrect) matrix.unsureRight.push(idx);
            else matrix.unsureWrong.push(idx);
        });

        const totalMatrix = matrix.confRight.length + matrix.confWrong.length + matrix.unsureRight.length + matrix.unsureWrong.length;

        // Helper to render clickable question number badges for a matrix cell
        function renderMatrixQBadges(indices, cssClass) {
            if (indices.length === 0) return '';
            return `<div class="matrix-q-badges">${indices.map(i =>
                `<span class="matrix-q-badge ${cssClass}" data-q-index="${i}">Q${i + 1}</span>`
            ).join('')}</div>`;
        }

        // Insight generation
        let speedInsight = '';
        if (avgTimeSec < 30) speedInsight = '⚡ Lightning fast! Make sure you\'re reading carefully.';
        else if (avgTimeSec < 60) speedInsight = '✅ Good pace — well-balanced speed and thought.';
        else if (avgTimeSec < 120) speedInsight = '🧠 Thoughtful approach. Practice will increase speed.';
        else speedInsight = '🐢 Taking your time. Focus on pattern recognition to speed up.';

        let blindSpotInsight = '';
        if (matrix.confWrong.length > 0) {
            const pct = Math.round((matrix.confWrong.length / totalMatrix) * 100);
            blindSpotInsight = `<div class="autopsy-alert autopsy-alert-danger">
                <span class="material-symbols-outlined">warning</span>
                <div>
                    <strong>Blind Spot Detected!</strong>
                    <p>${matrix.confWrong.length} question${matrix.confWrong.length > 1 ? 's' : ''} (${pct}%) — you felt confident but answered incorrectly. These are the most dangerous gaps in your knowledge.</p>
                </div>
            </div>`;
        } else {
            blindSpotInsight = `<div class="autopsy-alert autopsy-alert-success">
                <span class="material-symbols-outlined">verified</span>
                <div>
                    <strong>No Blind Spots!</strong>
                    <p>Your confidence aligned well with your accuracy. Great self-awareness!</p>
                </div>
            </div>`;
        }

        autopsyContainer.innerHTML = `
            <div class="autopsy-header">
                <div class="autopsy-icon">🔬</div>
                <div>
                    <h3>Session Autopsy</h3>
                    <p class="autopsy-subtitle">Deep-dive into your performance patterns</p>
                </div>
            </div>

            <!-- Quick Stats Row -->
            <div class="autopsy-quick-stats">
                <div class="autopsy-stat-pill">
                    <span class="material-symbols-outlined">timer</span>
                    <div>
                        <span class="pill-value">${formatTimeCompact(totalTimeSec)}</span>
                        <span class="pill-label">Total Time</span>
                    </div>
                </div>
                <div class="autopsy-stat-pill">
                    <span class="material-symbols-outlined">speed</span>
                    <div>
                        <span class="pill-value">${formatTimeCompact(Math.round(avgTimeSec))}</span>
                        <span class="pill-label">Avg / Question</span>
                    </div>
                </div>
                <div class="autopsy-stat-pill">
                    <span class="material-symbols-outlined">bolt</span>
                    <div>
                        <span class="pill-value">${formatTimeCompact(times[fastestIdx] || 0)}</span>
                        <span class="pill-label">Fastest (Q${fastestIdx + 1})</span>
                    </div>
                </div>
                <div class="autopsy-stat-pill">
                    <span class="material-symbols-outlined">hourglass_top</span>
                    <div>
                        <span class="pill-value">${formatTimeCompact(times[slowestIdx] || 0)}</span>
                        <span class="pill-label">Slowest (Q${slowestIdx + 1})</span>
                    </div>
                </div>
            </div>

            <p class="autopsy-speed-insight">${speedInsight}</p>

            <!-- Time Per Question Histogram -->
            <div class="autopsy-section">
                <h4><span class="material-symbols-outlined">bar_chart</span> Time Per Question</h4>
                <div class="autopsy-histogram">
                    ${window.state.quizQuestions.map((q, idx) => {
                        const t = times[idx] || 0;
                        const pct = Math.max(4, (t / maxTime) * 100);
                        const selectedIndex = window.state.answers[idx];
                        const isCorrect = window.state.submitted[idx] && selectedIndex !== null && q.options[selectedIndex].is_correct;
                        const isWrong = window.state.submitted[idx] && !isCorrect;
                        const barClass = !window.state.submitted[idx] ? 'bar-unanswered' : isCorrect ? 'bar-correct' : 'bar-wrong';
                        return `
                            <div class="hist-col" title="Q${idx+1}: ${t}s — ${!window.state.submitted[idx] ? 'Unanswered' : isCorrect ? 'Correct' : 'Wrong'}">
                                <div class="hist-bar ${barClass}" style="height:${pct}%">
                                    <span class="hist-time">${t}s</span>
                                </div>
                                <span class="hist-label">Q${idx+1}</span>
                            </div>`;
                    }).join('')}
                </div>
                <div class="hist-legend">
                    <span><span class="hist-dot bar-correct"></span> Correct</span>
                    <span><span class="hist-dot bar-wrong"></span> Wrong</span>
                    <span><span class="hist-dot bar-unanswered"></span> Unanswered</span>
                </div>
            </div>

            <!-- Confidence vs Accuracy Matrix -->
            <div class="autopsy-section">
                <h4><span class="material-symbols-outlined">psychology</span> Confidence vs. Accuracy</h4>
                <div class="conf-matrix">
                    <div class="matrix-corner"></div>
                    <div class="matrix-col-header">✅ Correct</div>
                    <div class="matrix-col-header">❌ Incorrect</div>
                    
                    <div class="matrix-row-header">😎 Confident<br><span>(4-5)</span></div>
                    <div class="matrix-cell cell-good">
                        <span class="matrix-count">${matrix.confRight.length}</span>
                        <span class="matrix-label">Mastered</span>
                        ${renderMatrixQBadges(matrix.confRight, 'badge-good')}
                    </div>
                    <div class="matrix-cell cell-danger">
                        <span class="matrix-count">${matrix.confWrong.length}</span>
                        <span class="matrix-label">Blind Spot ⚠️</span>
                        ${renderMatrixQBadges(matrix.confWrong, 'badge-danger')}
                    </div>
                    
                    <div class="matrix-row-header">🤔 Unsure<br><span>(1-3)</span></div>
                    <div class="matrix-cell cell-lucky">
                        <span class="matrix-count">${matrix.unsureRight.length}</span>
                        <span class="matrix-label">Lucky / Intuitive</span>
                        ${renderMatrixQBadges(matrix.unsureRight, 'badge-lucky')}
                    </div>
                    <div class="matrix-cell cell-expected">
                        <span class="matrix-count">${matrix.unsureWrong.length}</span>
                        <span class="matrix-label">Learning Zone</span>
                        ${renderMatrixQBadges(matrix.unsureWrong, 'badge-expected')}
                    </div>
                </div>
                ${blindSpotInsight}
            </div>
        `;

        // Attach click handlers to all question badges in matrix cells
        autopsyContainer.querySelectorAll('.matrix-q-badge').forEach(badge => {
            badge.addEventListener('click', (e) => {
                e.stopPropagation();
                const qIdx = parseInt(badge.getAttribute('data-q-index'));
                window.state.currentQuestionIndex = qIdx;
                window.state.isFinished = true;
                navigateTo('quiz-view');
                loadQuestion();
            });
        });
    }

    function formatTimeCompact(seconds) {
        if (seconds < 60) return seconds + 's';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return mins + 'm ' + secs + 's';
    }

    function updateProgress(subjectId, newlyCompleted) {
        const compKey = getSubjectProgressKey(subjectId);
        if (!window.state.userProgress[compKey]) {
            window.state.userProgress[compKey] = { completed: 0 };
        }
        
        // Add newly completed questions to cumulative total
        window.state.userProgress[compKey].completed += newlyCompleted;
        
        // Cap at total questions (calculated from QUESTIONS object)
        const questionsInSubject = (getQuestionsSource()[subjectId] || []).length;
        if (window.state.userProgress[compKey].completed > questionsInSubject) {
            window.state.userProgress[compKey].completed = questionsInSubject;
        }

        const progressKey = `enggtv_progress_${window.state.user.username}`;
        localStorage.setItem(progressKey, JSON.stringify(window.state.userProgress));
        window.syncToFirebase();
        renderSubjects();
    }

    // Timer Utilities
    function startTimer() {
        window.state.secondsElapsed = 0;
        if (window.state.isMockExam) {
            window.state.secondsRemaining = 60 * 60; // 60 minutes
            quizTimer.classList.remove('blinking-timer');
            updateTimerDisplay();
        } else {
            updateTimerDisplay();
        }
        
        window.state.timer = setInterval(() => {
            if (window.state.isMockExam) {
                window.state.secondsRemaining--;
                updateTimerDisplay();
                
                if (window.state.secondsRemaining <= 300 && window.state.secondsRemaining > 0) {
                    quizTimer.classList.add('blinking-timer');
                } else {
                    quizTimer.classList.remove('blinking-timer');
                }
                
                if (window.state.secondsRemaining <= 0) {
                    stopTimer();
                    alert("Time is up! The mock exam has ended.");
                    
                    // Force finish
                    window.state.isFinished = true;
                    finishQuiz();
                }
            } else {
                window.state.secondsElapsed++;
                updateTimerDisplay();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(window.state.timer);
        quizTimer.classList.remove('blinking-timer');
    }

    function updateTimerDisplay() {
        if (window.state.isMockExam) {
            quizTimer.textContent = formatTime(window.state.secondsRemaining);
        } else {
            quizTimer.textContent = formatTime(window.state.secondsElapsed);
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }


    // Expose globals
    window.startQuiz = startQuiz;
    window.loadQuestion = loadQuestion;
    window.selectOption = selectOption;
    window.updateQuestionMap = updateQuestionMap;
    window.showFeedback = showFeedback;
    window.setupQuizListeners = setupQuizListeners;
    window.openMockPreview = openMockPreview;
    window.closeMockPreview = closeMockPreview;
    window.confirmStartMock = confirmStartMock;
    window.startMockExam = startMockExam;
    window.finishQuiz = finishQuiz;
    window.renderSessionAutopsy = renderSessionAutopsy;
    window.renderMatrixQBadges = renderMatrixQBadges;
    window.formatTimeCompact = formatTimeCompact;
    window.updateProgress = updateProgress;
    window.startTimer = startTimer;
    window.stopTimer = stopTimer;
    window.updateTimerDisplay = updateTimerDisplay;
    window.formatTime = formatTime;
});
