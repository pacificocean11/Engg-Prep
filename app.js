function startApp() {
    let questionStats = JSON.parse(localStorage.getItem('enggtv_question_stats') || '{}');
    [typeof QUESTIONS !== 'undefined' ? QUESTIONS : {}, typeof ADVANCED_QUESTIONS !== 'undefined' ? ADVANCED_QUESTIONS : {}].forEach(source => {
        for (let subject in source) {
            if (Array.isArray(source[subject])) {
                source[subject].forEach((q, index) => {
                    if (!q.id) q.id = subject + '_' + index;
                    q.times_presented = questionStats[q.id] || 0;
                });
            }
        }
    });

    function incrementQuestionStats(questionsArray) {
        questionsArray.forEach(q => {
            if (q.id) {
                questionStats[q.id] = (questionStats[q.id] || 0) + 1;
                q.times_presented = questionStats[q.id];
            }
        });
        localStorage.setItem('enggtv_question_stats', JSON.stringify(questionStats));
    }
    
// Extracted to js/particles.js

    // ==========================================================
    // ANNOUNCEMENT CONFIGURATION
    // Update this block for every new upcoming lecture/event
    // ==========================================================
    const ANNOUNCEMENT_CONFIG = {
        expiryDate: '2026-06-07T00:00:00', // Set to the day AFTER the event
        dateLabel: 'Saturday, 6th June 2026',
        title: 'FE Exam Revision Series: Fluid Mechanics',
        posterUrl: 'https://drive.google.com/file/d/1EJYL07_m1vetRmmnz96TVA5P4tTs7AKC/preview',
        registrationMessage: 'Registration link will be sent to your email 24 hours before the lecture.'
    };

// Determine the logged-in user first to use for specific storage keys
    const loggedInUser = (() => {
        try {
            const user = JSON.parse(localStorage.getItem('enggtv_user')) || { tier: 'premium', username: 'guest' };
            // Ensure the user is always premium
            user.tier = 'premium';
            
            // Sync user's discipline with localStorage or default to user.discipline / Mechanical
            const storedDiscipline = localStorage.getItem('enggtv_discipline') || user.discipline || 'Mechanical';
            user.discipline = storedDiscipline;
            
            localStorage.setItem('enggtv_user', JSON.stringify(user));
            localStorage.setItem('enggtv_discipline', storedDiscipline);
            
            return user;
        } catch (e) {
            return { tier: 'premium', username: 'guest', discipline: 'Mechanical' };
        }
    })();

    // Helper to conditionally get advanced questions source
    function getQuestionsSource() {
        const isAdvancedMode = localStorage.getItem('enggtv_advanced_mode') === 'true';
        if (isAdvancedMode) {
            return typeof ADVANCED_QUESTIONS !== 'undefined' ? ADVANCED_QUESTIONS : QUESTIONS;
        }
        return QUESTIONS;
    }

    // Helper to partition standard and advanced mode progress
    function getSubjectProgressKey(subjectId) {
        const isAdvancedMode = localStorage.getItem('enggtv_advanced_mode') === 'true';
        if (isAdvancedMode) {
            return subjectId + '_advanced';
        }
        return subjectId;
    }

    // State Management
    const state = {
        currentPage: 'dashboard',
        currentSubject: null,
        currentQuestionIndex: 0,
        quizQuestions: [],
        answers: [],
        submitted: [],
        flagged: [],
        confidence: [],
        questionTimes: [],
        questionEnteredAt: null,
        score: 0,
        timer: null,
        secondsElapsed: 0,
        secondsRemaining: 0,
        user: loggedInUser,
        userProgress: (() => {
            try {
                const key = `enggtv_progress_${loggedInUser.username}`;
                return JSON.parse(localStorage.getItem(key)) || {};
            } catch (e) {
                console.error("Failed to parse user progress", e);
                return {};
            }
        })(),
        userPoints: (() => {
            const key = `enggtv_points_${loggedInUser.username}`;
            return parseInt(localStorage.getItem(key)) || 0;
        })(),
        isFinished: false,
        isMockExam: false,
        recentActivity: (() => {
            try {
                const key = `enggtv_recent_activity_${loggedInUser.username}`;
                return JSON.parse(localStorage.getItem(key)) || [];
            } catch (e) {
                return [];
            }
        })(),
        subjects: (() => {
            const discipline = localStorage.getItem('enggtv_discipline') || loggedInUser.discipline;
            if (discipline === 'Mechanical') return MECHANICAL_SUBJECTS;
            if (discipline === 'Civil' || discipline === 'Civil Engineering') return CIVIL_SUBJECTS;
            if (discipline === 'Chemical') return CHEMICAL_SUBJECTS;
            if (discipline === 'Environmental') return ENVIRONMENTAL_SUBJECTS;
            if (discipline === 'Industrial') return INDUSTRIAL_SUBJECTS;
            if (discipline === 'Electrical and Computer') return ELECTRICAL_COMPUTER_SUBJECTS;
            return OTHER_SUBJECTS;
        })(),
        charts: {
            radar: null,
            line: null
        }
    };

// We must expose state globally for the extracted modules to use it.
window.state = state;
window.loggedInUser = loggedInUser;
window.getQuestionsSource = getQuestionsSource;
window.getSubjectProgressKey = getSubjectProgressKey;

// Safely export functions so they remain available in the local closure
if (typeof loadQuestion === 'function') window.loadQuestion = loadQuestion;
if (typeof updateQuestionMap === 'function') window.updateQuestionMap = updateQuestionMap;
if (typeof startTimer === 'function') window.startTimer = startTimer;
if (typeof prepareQuestions === 'function') window.prepareQuestions = prepareQuestions;
if (typeof toDriveImgUrl === 'function') window.toDriveImgUrl = toDriveImgUrl;


// --- CONTEXTUAL FORMULA POPUPS (A-5) ---
    const FORMULA_DATA = {
        'Discriminant': {
            title: 'Discriminant (Conics)',
            formula: '$$\\Delta = B^2 - 4AC$$',
            context: 'Used to classify conic sections: $\\Delta < 0$ (Ellipse), $\\Delta = 0$ (Parabola), $\\Delta > 0$ (Hyperbola).'
        },
        'Point-Slope Form': {
            title: 'Point-Slope Form',
            formula: '$$y - y_1 = m(x - x_1)$$',
            context: 'Equation of a line passing through $(x_1, y_1)$ with slope $m$.'
        },
        'Perpendicular': {
            title: 'Perpendicular Lines',
            formula: '$$m_1 \\cdot m_2 = -1$$',
            context: 'The product of the slopes of two perpendicular lines is $-1$.'
        },
        'Bernoulli': {
            title: "Bernoulli's Equation",
            formula: '$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho gh_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho gh_2$$',
            context: 'Energy conservation for an incompressible, non-viscous fluid in steady flow.'
        },
        'Ideal Gas Law': {
            title: 'Ideal Gas Law',
            formula: '$$PV = nRT$$',
            context: 'Relates pressure, volume, temperature, and amount of an ideal gas.'
        },
        'Newton\'s Second Law': {
            title: 'Newton\'s Second Law',
            formula: '$$F = ma$$',
            context: 'The force acting on an object is equal to the mass of that object times its acceleration.'
        },
        'Shear Stress': {
            title: 'Shear Stress (Average)',
            formula: '$$\\tau = \\frac{V}{A}$$',
            context: 'The internal force per unit area acting tangent to a cross-section.'
        },
        'Hooke\'s Law': {
            title: 'Hooke\'s Law',
            formula: '$$\\sigma = E \\epsilon$$',
            context: 'The stress in a material is proportional to the strain within its elastic limit.'
        },
        'Reynolds Number': {
            title: 'Reynolds Number',
            formula: '$$Re = \\frac{\\rho v D}{\\mu}$$',
            context: 'A dimensionless quantity used to predict fluid flow patterns (laminar vs turbulent).'
        },
        'Moment of Inertia': {
            title: 'Moment of Inertia (Rectangular)',
            formula: '$$I_x = \\frac{bh^3}{12}$$',
            context: 'A measure of an object\'s resistance to changes in its rotation or bending.'
        },
        'Manning\'s Equation': {
            title: 'Manning\'s Equation',
            formula: '$$v = \\frac{1.486}{n} R^{2/3} S^{1/2}$$',
            context: 'Used to calculate flow velocity in open channels (US units).'
        }
    };

    function sanitizeMathDelimiters(text) {
        if (!text || typeof text !== 'string') return text;
        
        // 1. Convert escaped dollar followed by currency digits: \$100 or \$14,693 -> &#36;100
        let res = text.replace(/\\\$\s*(\d)/g, '&#36;$1');

        // 2. Identify false inline math pairs: $...$ where content is sentence prose between two currency values
        // Real math formulas do not span 3+ English words without LaTeX commands (\)
        res = res.replace(/\$([^$\n]+)\$/g, (match, inner) => {
            if (inner.includes('\\')) return match;
            const hasWords = /\b(and|or|the|is|for|with|of|to|in|after|which|they|will|sell|value|cost|price|company|buys|plan|salvage|charge|annual|years)\b/i.test(inner);
            const hasPunctuation = /[.!?]\s+[A-Z]/.test(inner);
            if (hasWords || hasPunctuation) {
                return '&#36;' + inner + '&#36;';
            }
            return match;
        });

        // 3. Isolated currency dollars: $ followed immediately by digits where there is NO matching $ in remainder of text
        res = res.replace(/\$(\d{1,3}(?:,\d{3})*(?:\.\d+)?|\d+)(?=[\s.,!?;:)]|$)/g, (match, num, offset, fullStr) => {
            const after = fullStr.slice(offset + match.length);
            if (!after.includes('$')) {
                return '&#36;' + num;
            }
            return match;
        });

        return res;
    }

    function injectFormulaTriggers(text) {
        if (!text || typeof text !== 'string') return text;
        let res = text;

        // 1. Fix math equations that got corrupted with \n + variable, e.g. $$\nm or $$\nx
        res = res.replace(/\$\$\s*\\([a-zA-Z])(?=\s*[=+\-])/g, '$$\n$1');
        res = res.replace(/\$\$\\n([a-zA-Z])/g, '$$\n$1');
        res = res.replace(/\$\$\\n\s*/g, '$$\n');
        res = res.replace(/\\n\s*\\\$\$/g, '\n$$');
        res = res.replace(/\\\$\$/g, '$$');

        // 2. Convert \textbf{...} in text to <b>...</b>
        res = res.replace(/\\textbf\{([^}]+)\}/g, '<b>$1</b>');

        // 3. Convert literal \n in prose (outside math)
        res = res.replace(/\\n\s*•/g, '<br>&bull; ');
        res = res.replace(/\\n/g, '<br>');

        // 4. Sanitize currency dollar signs
        res = sanitizeMathDelimiters(res);

        return res;
    }

    /**
     * Safely typesets LaTeX math inside the provided DOM elements using MathJax 3.
     * Prevents concurrency collisions ('MathJax is already processing'), queues calls
     * if MathJax is still loading, clears stale math references, and catches errors.
     */
    let mathJaxProcessingPromise = Promise.resolve();
    window.safeTypesetMath = function(elements) {
        if (!elements) elements = [document.body];
        if (!Array.isArray(elements)) elements = [elements];
        elements = elements.filter(el => el && el.nodeType === 1);
        if (elements.length === 0) return Promise.resolve();

        const doTypeset = () => {
            if (!window.MathJax || !window.MathJax.typesetPromise) {
                return Promise.resolve();
            }
            try {
                if (typeof window.MathJax.typesetClear === 'function') {
                    window.MathJax.typesetClear(elements);
                }
                return window.MathJax.typesetPromise(elements).catch(err => {
                    console.warn('MathJax typeset notice:', err);
                });
            } catch (err) {
                console.warn('MathJax typeset execution notice:', err);
                return Promise.resolve();
            }
        };

        if (window.__mathJaxReady || (window.MathJax && window.MathJax.typesetPromise)) {
            mathJaxProcessingPromise = mathJaxProcessingPromise
                .catch(() => {})
                .then(doTypeset);
            return mathJaxProcessingPromise;
        } else {
            if (!window.__pendingTypesetQueue) window.__pendingTypesetQueue = [];
            window.__pendingTypesetQueue.push(() => {
                mathJaxProcessingPromise = mathJaxProcessingPromise
                    .catch(() => {})
                    .then(doTypeset);
            });
            return Promise.resolve();
        }
    };

    /**
     * Converts any Google Drive URL (share link, /preview, /view, uc?export)
     * into a direct embeddable image URL using lh3.googleusercontent.com.
     * Falls back to the original URL if no Drive file ID is detected.
     */
    function toDriveImgUrl(url) {
        if (!url) return url;
        // Match /file/d/FILE_ID/ pattern
        const m = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
        if (m) return `https://drive.google.com/thumbnail?id=${m[1]}&sz=w1000`;
        // Match id=FILE_ID query param (uc?export=view&id=...)
        const m2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
        if (m2) return `https://drive.google.com/thumbnail?id=${m2[1]}&sz=w1000`;
        return url;
    }

    const formulaPopup = document.getElementById('formula-popup');
    const formulaTitle = document.getElementById('formula-title');
    const formulaLatex = document.getElementById('formula-latex');
    const formulaContext = document.getElementById('formula-context');

    function showFormulaPopup(keyword, x, y) {
        const data = FORMULA_DATA[keyword];
        if (!data) return;

        formulaTitle.textContent = data.title;
        formulaLatex.innerHTML = data.formula;
        formulaContext.textContent = data.context;

        formulaPopup.style.left = `${x}px`;
        formulaPopup.style.top = `${y - 10}px`;
        formulaPopup.classList.add('visible');

        window.safeTypesetMath([formulaLatex]);
    }

    function hideFormulaPopup() {
        if (formulaPopup) formulaPopup.classList.remove('visible');
    }

    document.addEventListener('mouseover', (e) => {
        if (e.target.classList.contains('formula-trigger')) {
            const keyword = e.target.getAttribute('data-keyword');
            const rect = e.target.getBoundingClientRect();
            // Offset to show above
            const px = rect.left + window.scrollX;
            const py = rect.top + window.scrollY - 220; // Estimated height
            showFormulaPopup(keyword, px, py);
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.classList.contains('formula-trigger')) {
            hideFormulaPopup();
        }
    });


    // For backward compatibility with existing code that uses global SUBJECTS
    const SUBJECTS = state.subjects;


    // DOM Elements
    const pages = document.querySelectorAll('.page');
    const pageTitle = document.getElementById('page-title');
    const subjectList = document.getElementById('subject-list');
    
    // Quiz View Elements
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

    // Result Elements
    const resTotal = document.getElementById('res-total');
    const resAttempted = document.getElementById('res-attempted');
    const resCorrect = document.getElementById('res-correct');
    const resAccuracy = document.getElementById('res-accuracy');
    const resultsSubjectName = document.getElementById('results-subject-name');

    // Mobile Elements
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    
    // Dashboard Specific Elements
    const circleBg = document.getElementById('overall-progress-circle');
    const textDisplay = document.getElementById('overall-progress-text');
    const circleDisplay = document.getElementById('overall-progress-circle-text');

    // --- UI UTILITIES ---
    window.showToast = function(title, message, icon = 'stars', duration = 4000) {
        const container = document.getElementById('toast-container');
        if (!container) {
            console.error("Toast container not found!");
            return;
        }

        const toast = document.createElement('div');
        // Removed translate-x to avoid conflicts with centered container
        toast.className = 'glass-card p-4 rounded-2xl flex items-center gap-4 shadow-2xl border-l-4 border-l-secondary opacity-0 transition-all duration-500 pointer-events-auto min-w-[300px] mb-4 transform translate-y-[-20px]';
        toast.style.zIndex = "10002";
        toast.innerHTML = `
            <div class="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shrink-0">
                <span class="material-symbols-outlined text-2xl">${icon}</span>
            </div>
            <div class="flex-1">
                <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">${title}</h4>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">${message}</p>
            </div>
        `;

        container.appendChild(toast);
        
        // Force reflow
        toast.offsetHeight;

        setTimeout(() => {
            toast.classList.remove('opacity-0', 'translate-y-[-20px]');
            toast.classList.add('translate-y-0');
        }, 10);

        setTimeout(() => {
            toast.classList.add('opacity-0', 'translate-y-[-20px]');
            setTimeout(() => toast.remove(), 600);
        }, duration);
    };

    function addPoints(points, reason = "Correct Answer!") {
        state.userPoints += points;
        localStorage.setItem(`enggtv_points_${state.user.username}`, state.userPoints.toString());
        updateGamificationUI();
        
        
        window.showToast(`+${points} ${points === 1 ? 'point' : 'points'}`, reason, 'military_tech');
        
        if (points >= 1) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF006E', '#FDA60A', '#720026']
            });
        }
        
        if (window.syncToFirebase) window.syncToFirebase();
    }
    window.addPoints = addPoints;

    // Initialization
    function init() {
        if (typeof updateSyncStatus === 'function') {
            updateSyncStatus(navigator.onLine ? 'local' : 'offline');
        }
        setupQuizListeners();
        setupDashboardListeners();
        setupAdminListeners();
        
        // Robust Offline Mode Listeners
        window.addEventListener('online', () => {
            window.showToast("Back Online", "Your progress will now sync with the cloud.", "wifi");
            if (state.user) {
                
                
            }
        });
        window.addEventListener('offline', () => {
            window.showToast("Offline Mode Active", "You are offline. Progress is saved locally and will sync when reconnected.", "wifi_off");
            updateSyncStatus('offline');
        });

        renderSubjects();
        renderNotes();
        setupNavigation();
        setupMobileMenu();
        updateUIForTier();
        // startFreeTrialTimer();
        updateDashboardStats();
        updateGamificationUI();
        
        
        // Listen for Firebase Auth state changes to restore missing UIDs or update active session info
        
        if (window.firebase) {
            // Safety timeout: if onAuthStateChanged never fires (e.g. Firebase SDK hangs), force local mode
            const authTimeout = setTimeout(() => {
                if (typeof updateSyncStatus === 'function') updateSyncStatus('local');
            }, 3000);
            
            firebase.auth().onAuthStateChanged(async (user) => {
                clearTimeout(authTimeout);
                if (user) {
                    console.log("🔥 Firebase Auth state restored:", user.email, user.uid);
                    if (state.user) {
                        let updated = false;
                        if (!state.user.uid || state.user.uid !== user.uid) {
                            state.user.uid = user.uid;
                            updated = true;
                        }
                        // Do NOT force email-derived expectedUsername. The user's actual username
                        // is saved in their Firestore document (which loadFromFirebase will restore if there's a mismatch).
                        if (state.user.username === 'guest') {
                            const email = user.email || '';
                            state.user.username = email === 'admin@engg.tv' ? 'admin' : (email === 'demo@engg.tv' ? 'demo' : (email ? email.split('@')[0] : 'FE Candidate'));
                            updated = true;
                            
                            // Reload local state for the restored username so we don't carry over guest state
                            state.userPoints = parseInt(localStorage.getItem(`enggtv_points_${state.user.username}`)) || 0;
                            try {
                                state.userProgress = JSON.parse(localStorage.getItem(`enggtv_progress_${state.user.username}`)) || {};
                            } catch(e) { state.userProgress = {}; }
                            try {
                                state.recentActivity = JSON.parse(localStorage.getItem(`enggtv_recent_activity_${state.user.username}`)) || [];
                            } catch(e) { state.recentActivity = []; }
                        }
                        if (updated) {
                            localStorage.setItem('enggtv_user', JSON.stringify(state.user));
                            console.log("🔄 Updated local user state with restored Firebase UID:", user.uid);
                        }
                        
                        
                        try {
                            if (typeof window.loadFromFirebase === 'function') await window.loadFromFirebase();
                        } catch (loadErr) {
                            console.error("⚠️ loadFromFirebase failed (likely localhost restriction):", loadErr);
                            if (typeof updateSyncStatus === 'function') updateSyncStatus('local');
                        }
                        try {
                            if (typeof window.setupFirestoreSyncListener === 'function') window.setupFirestoreSyncListener(state.user.uid || state.user.username);
                        } catch (e) {
                            console.error("⚠️ setupFirestoreSyncListener failed:", e);
                            if (typeof updateSyncStatus === 'function') updateSyncStatus('local');
                        }
                        try {
                            await checkAdminMessages();
                        } catch (e) {
                            console.error("⚠️ checkAdminMessages failed:", e);
                        }
                        
                        if (state.currentPage === 'dashboard') {
                            updateDashboardStats();
                            updateGamificationUI();
                        } else if (state.currentPage === 'leaderboard') {
                            renderLeaderboard();
                        }
                    } else {
                        // Initialize state.user if it was somehow empty/guest
                        const email = user.email || '';
                        state.user = {
                            uid: user.uid,
                            username: email === 'admin@engg.tv' ? 'admin' : (email === 'demo@engg.tv' ? 'demo' : (email ? email.split('@')[0] : 'FE Candidate')),
                            tier: 'premium',
                            discipline: 'Mechanical'
                        };
                        localStorage.setItem('enggtv_user', JSON.stringify(state.user));
                        
                        try {
                            if (typeof window.loadFromFirebase === 'function') await window.loadFromFirebase();
                        } catch (loadErr) {
                            console.error("⚠️ loadFromFirebase failed (likely localhost restriction):", loadErr);
                            if (typeof updateSyncStatus === 'function') updateSyncStatus('local');
                        }
                        try {
                            if (typeof window.setupFirestoreSyncListener === 'function') window.setupFirestoreSyncListener(state.user.uid || state.user.username);
                        } catch (e) {
                            console.error("⚠️ setupFirestoreSyncListener failed:", e);
                            if (typeof updateSyncStatus === 'function') updateSyncStatus('local');
                        }
                        try {
                            await checkAdminMessages();
                        } catch (e) {
                            console.error("⚠️ checkAdminMessages failed:", e);
                        }
                    }
                } else {
                    updateSyncStatus('local');
                }
            });
        } else {
            updateSyncStatus('local');
        }

        initTilt();
        initMagneticButtons();
        setupHeaderScroll();
    }

    function setupHeaderScroll() {
        const header = document.getElementById('main-header');
        if (!header) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 20) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        });
    }

    function initTilt() {
        if (typeof VanillaTilt === 'undefined') return;
        
        // Do not initialize tilt effects on touchscreens to prevent double-click issues
        const isTouch = window.matchMedia("(pointer: coarse)").matches || 'ontouchstart' in window;
        if (isTouch) return;
        
        // Target specific cards for 3D tilt effect
        const tiltElements = document.querySelectorAll('.glass-card, .tilt-card, #announcement-section, .subject-card-tilt');
        
        VanillaTilt.init(tiltElements, {
            max: 10,
            speed: 400,
            glare: true,
            "max-glare": 0.3,
            gyroscope: true,
            scale: 1.02
        });
    }

    function initMagneticButtons() {
        // Disabled globally to ensure buttons are reliable and easy to click
    }

    function setupDashboardListeners() {
        document.addEventListener('click', (e) => {
            if (e.target.id === 'btn-intensity-7d') {
                initCharts(0, '7d');
            } else if (e.target.id === 'btn-intensity-30d') {
                initCharts(0, '30d');
            } else if (e.target.closest('#btn-clear-activity')) {
                if (confirm('Are you sure you want to clear all recent activity?')) {
                    state.recentActivity = [];
                    const activityKey = `enggtv_recent_activity_${state.user.username}`;
                    localStorage.removeItem(activityKey);
                    
                    renderRecentActivity();
                }
            }
        });
    }


    // ── Admin Messaging System ─────────────────────────────────────────────

    /** Show a premium toast notification */
    function showToast(message, type = 'info', durationMs = 6000) {
        const existing = document.getElementById('admin-toast');
        if (existing) existing.remove();

        const colors = {
            info:    'bg-secondary text-white',
            success: 'bg-green-500 text-white',
            warning: 'bg-amber-500 text-white',
            admin:   'bg-gradient-to-r from-secondary to-primary text-white'
        };
        const icons = { info: 'info', success: 'check_circle', warning: 'warning', admin: 'admin_panel_settings' };

        const toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = `fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm w-full ${colors[type] || colors.info} transition-all duration-300 opacity-0 -translate-y-4`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-xl shrink-0 mt-0.5" style="font-variation-settings:'FILL' 1;">${icons[type] || 'info'}</span>
            <div class="flex-1">
                <p class="font-bold text-[11px] uppercase tracking-widest opacity-75 mb-0.5">Message from Admin</p>
                <p class="text-sm font-medium leading-snug">${message}</p>
            </div>
            <button onclick="this.closest('#admin-toast').remove()" class="shrink-0 opacity-60 hover:opacity-100 mt-0.5">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-16px)';
            setTimeout(() => toast.remove(), 400);
        }, durationMs);
    }
    /** Check for unread admin messages on login and show toast */
    async function checkAdminMessages() {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) { console.log('🏠 Localhost detected. Skipping admin message check.'); return; }
        if (!window.firebaseDb) { console.warn('window.firebaseDb is NULL - Firebase not loaded!'); return; }
        if (!state.user.username) { console.warn('state.user.username is empty'); return; }
        if (state.user.username === 'guest') return;
        if (state.user.username && state.user.username.toLowerCase() === 'admin') return;
        try {
            // Force fresh reads from Firestore server (bypass local SDK cache)
            const opts = { source: 'server' };

            // Get best available UID
            const uid = state.user.uid || (window.firebase && firebase.auth().currentUser && firebase.auth().currentUser.uid) || null;

            const docsToCheck = [];

            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Admin check timeout')), 10000));
            // 1. UID-keyed document
            if (uid) {
                const uidDoc = await Promise.race([window.firebaseDb.collection('users').doc(uid).get(opts), timeoutPromise]);
                if (uidDoc.exists) docsToCheck.push(uidDoc);
            }

            // 2. Username-keyed document
            const userDoc = await Promise.race([window.firebaseDb.collection('users').doc(state.user.username).get(opts), timeoutPromise]);
            if (userDoc.exists && (!uid || userDoc.id !== uid)) docsToCheck.push(userDoc);

            // 3. Full collection scan (catches any remaining edge case)
            if (docsToCheck.length === 0) {
                const snap = await Promise.race([window.firebaseDb.collection('users').where('username', '==', state.user.username).limit(1).get(opts), timeoutPromise]);
                if (!snap.empty) docsToCheck.push(snap.docs[0]);
            }

            let foundUnread = false;

            for (const doc of docsToCheck) {
                const data = doc.data();
                const messages = data.adminMessages || [];
                const unread = messages.filter(m => !m.read);
                if (unread.length > 0 && !foundUnread) {
                    foundUnread = true;
                    const latest = unread[unread.length - 1];
                    setTimeout(() => showToast(latest.body, 'admin', 8000), 1500);
                    const updated = messages.map(m => ({ ...m, read: true }));
                    await doc.ref.update({ adminMessages: updated });
                }
            }

        } catch(e) { console.error('[AdminMsg] Error:', e); }

        // Also render the inbox into the dashboard immediately
        await renderAdminInbox();
    }
    /** Render inbox in the support-view page */
    /** Render inbox in the support-view page */
    async function renderAdminInbox() {
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        if (isLocalhost) return;
        const container = document.getElementById('admin-inbox-container');
        const list = document.getElementById('admin-inbox-list');
        const countBadge = document.getElementById('admin-inbox-count');
        if (!container || !list) return;
        if (!window.firebaseDb || !state.user.username || state.user.username === 'guest' || (state.user.username && state.user.username.toLowerCase() === 'admin')) return;

        try {
            const uid = state.user.uid || (window.firebase && firebase.auth().currentUser && firebase.auth().currentUser.uid) || null;
            let allMessages = [];

            const seenIds = new Set();
            const addMessages = (msgs) => {
                msgs.forEach(m => { if (!seenIds.has(m.id)) { seenIds.add(m.id); allMessages.push(m); } });
            };

            const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Admin inbox timeout')), 10000));
            if (uid) {
                const d = await Promise.race([window.firebaseDb.collection('users').doc(uid).get(), timeoutPromise]);
                if (d.exists) addMessages(d.data().adminMessages || []);
            }
            const d2 = await Promise.race([window.firebaseDb.collection('users').doc(state.user.username).get(), timeoutPromise]);
            if (d2.exists && (!uid || d2.id !== uid)) addMessages(d2.data().adminMessages || []);

            if (allMessages.length === 0) { container.classList.add('hidden'); return; }
            container.classList.remove('hidden');

            const unreadCount = allMessages.filter(m => !m.read).length;
            if (unreadCount > 0) {
                countBadge.textContent = unreadCount + ' new';
                countBadge.classList.remove('hidden');
            } else {
                countBadge.classList.add('hidden');
            }

            allMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            list.innerHTML = allMessages.map(msg => {
                const date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                const isUnread = !msg.read;
                return `<div class="glass-card p-4 rounded-2xl ${isUnread ? 'border-l-4 border-secondary' : 'opacity-80'}">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="material-symbols-outlined text-secondary text-sm" style="font-variation-settings:'FILL' 1;">admin_panel_settings</span>
                            <span class="text-[11px] font-black text-secondary uppercase tracking-widest">Admin</span>
                            ${isUnread ? '<span class="text-[9px] font-black bg-secondary text-white px-1.5 py-0.5 rounded-full uppercase">New</span>' : ''}
                        </div>
                        <span class="text-[10px] text-slate-400">${date}</span>
                    </div>
                    <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${msg.body}</p>
                </div>`;
            }).join('');
        } catch(e) { console.error('Error loading admin inbox:', e); }
    }
    /** Admin: send a message to a specific user (robust dual-lookup) */
    /** Admin: send a message to a specific user (robust dual-lookup) */
    /** Admin: send a message to a specific user — dual-write for guaranteed delivery */
    async function sendAdminMessage(recipient, body) {
        if (!window.firebaseDb) { alert('Database not connected.'); return; }
        if (!recipient || !body) { alert('Please fill in both recipient username/email and message.'); return; }

        const recipientLower = recipient.trim().toLowerCase();
        const newMsg = { body: body.trim(), timestamp: Date.now(), read: false, id: Date.now().toString() };
        const docsUpdated = [];

        try {
            // 1. Query specifically by username (case-sensitive and lowercase)
            const userSnap = await window.firebaseDb.collection('users').where('username', '==', recipient).get();
            const userSnapLower = await window.firebaseDb.collection('users').where('username', '==', recipientLower).get();
            
            // 2. Query specifically by email
            const emailSnap = await window.firebaseDb.collection('users').where('email', '==', recipientLower).get();
            
            const updatePromises = [];
            const processedDocs = new Set();

            const processSnap = (snap) => {
                if (snap && !snap.empty) {
                    snap.forEach(doc => {
                        if (!processedDocs.has(doc.id)) {
                            const data = doc.data();
                            const existing = data.adminMessages || [];
                            let updated = [...existing, newMsg];
                            if (updated.length > 5) updated = updated.slice(-5);
                            updatePromises.push(doc.ref.set({ adminMessages: updated }, { merge: true }));
                            docsUpdated.push(doc.id);
                            processedDocs.add(doc.id);
                        }
                    });
                }
            };

            processSnap(userSnap);
            processSnap(userSnapLower);
            processSnap(emailSnap);

            // 2. ALSO write to the direct document ID (dual-write backup)
            const recipientDoc = await window.firebaseDb.collection('users').doc(recipientLower).get();
            if (recipientDoc.exists && !docsUpdated.includes(recipientDoc.id)) {
                const existing = recipientDoc.data().adminMessages || [];
                let updated = [...existing, newMsg];
                if (updated.length > 5) updated = updated.slice(-5);
                updatePromises.push(recipientDoc.ref.set({ adminMessages: updated }, { merge: true }));
                docsUpdated.push(recipientDoc.id);
            }

            if (updatePromises.length === 0) {
                alert('User "' + recipient + '" not found. Make sure the username or email is spelled correctly.');
                return;
            }

            await Promise.all(updatePromises);
            console.log('[AdminMsg] Message written to docs:', docsUpdated);
            alert('✅ Message sent to ' + recipient + ' successfully! (Delivered to ' + docsUpdated.length + ' profile(s))');
        } catch(e) {
            console.error('Error sending admin message:', e);
            let diagUid = "NULL (Not logged into Firebase)";
            let diagEmail = "NULL";
            if (window.firebase && window.firebase.auth && null.currentUser) {
                diagUid = null.currentUser.uid;
                diagEmail = null.currentUser.email;
            }
            alert('Firebase rejected the message due to rules.\n\nError: ' + e.message + '\n\nYOUR CURRENT LOGIN STATE:\nUID: ' + diagUid + '\nEmail: ' + diagEmail + '\n\nIf your UID does not match the rules, or is NULL, Firebase will block you.');
        }
    }
        function setupAdminListeners() {
        const btnPurgeBots = document.getElementById('btn-purge-bots');
        if (btnPurgeBots) {
            btnPurgeBots.addEventListener('click', async () => {
                if (!window.firebaseDb) {
                    alert('Database connection not available.');
                    return;
                }
                
                const confirmPurge = confirm(
                    'Are you sure you want to scan Firestore for bot accounts? This will find and delete all user documents that:\n' +
                    '- Have 0 points and have raw UID document IDs\n' +
                    '- Or have invalid/extremely long usernames (> 20 characters)\n' +
                    '- Or have no valid username data field.'
                );
                
                if (!confirmPurge) return;
                
                btnPurgeBots.disabled = true;
                btnPurgeBots.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Purging Database...';
                
                try {
                    const querySnapshot = await null("users").get();
                    let deleteCount = 0;
                    let promises = [];
                    
                    querySnapshot.forEach(doc => {
                        const docId = doc.id;
                        const data = doc.data();
                        
                        if (docId === 'guest' || docId === 'admin' || docId === 'demo') return;
                        
                        // Genuinely safe purge check:
                        // NEVER delete admin, demo, guest or any document that has a registered email, a UID, progress, or points.
                        if (data.email || data.uid) return;
                        if (data.userPoints > 0) return;
                        if (data.userProgress && Object.keys(data.userProgress).length > 0) return;
                        if (data.recentActivity && data.recentActivity.length > 0) return;

                        const isUid = /^[a-zA-Z0-9]{28}$/.test(docId);
                        const isTooLong = docId.length > 20;
                        
                        if (isUid || isTooLong) {
                            console.log('�� Purging bot/duplicate account: ' + docId, data);
                            const p = null("users").doc(docId).delete();
                            promises.push(p);
                            deleteCount++;
                        }
                    });
                    
                    await Promise.all(promises);
                    
                    btnPurgeBots.disabled = false;
                    btnPurgeBots.innerHTML = '<span class="material-symbols-outlined text-sm">cleaning_services</span> Start Purge System';
                    
                    alert('Purge completed successfully! Deleted ' + deleteCount + ' bot/invalid accounts.');
                    
                    // Refresh leaderboard if currently viewing it
                    if (state.currentPage === 'leaderboard') {
                        renderLeaderboard();
                    }
                } catch (e) {
                    console.error("Purge error:", e);
                    btnPurgeBots.disabled = false;
                    btnPurgeBots.innerHTML = '<span class="material-symbols-outlined text-sm">cleaning_services</span> Start Purge System';
                    alert('Error purging database: ' + e.message);
                }
            });
        }

        const btnSendAdminMsg = document.getElementById('btn-send-admin-msg');
        if (btnSendAdminMsg) {
            btnSendAdminMsg.addEventListener('click', async () => {
                const recipientField = document.getElementById('admin-msg-recipient');
                const bodyField = document.getElementById('admin-msg-body');
                if (!recipientField || !bodyField) return;

                const recipient = recipientField.value.trim();
                const body = bodyField.value.trim();

                if (!recipient || !body) {
                    alert('Please fill in both recipient username and message.');
                    return;
                }

                btnSendAdminMsg.disabled = true;
                const originalText = btnSendAdminMsg.innerHTML;
                btnSendAdminMsg.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Sending...';

                try {
                    await sendAdminMessage(recipient, body);
                    bodyField.value = '';
                } catch (e) {
                    console.error('Error in click listener:', e);
                } finally {
                    btnSendAdminMsg.disabled = false;
                    btnSendAdminMsg.innerHTML = originalText;
                }
            });
        }
    }


    function updateUIForTier() {
        // Tier badges removed as per user request (all users are premium)

        // Update Subscription Plan labels
        const subStatuses = [
            document.getElementById('subscription-status'),
            document.getElementById('subscription-status-settings')
        ];
        subStatuses.forEach(st => {
            if (st) {
                st.textContent = state.user.tier === 'premium' ? 'Premium Member' : 'Free Tier';
                st.className = state.user.tier === 'premium' ? 
                    'text-[12px] font-bold text-accent-pink' : 
                    'text-[12px] font-medium text-secondary';
            }
        });
        
        // Update name display
        const greeting = document.getElementById('user-greeting');
        if (greeting) {
            greeting.textContent = `Welcome back, ${state.user.username === 'demo' ? 'Alex' : state.user.username}`;
        }

        const nameDisplays = document.querySelectorAll('h3.text-xl.font-bold, h2.font-display-lg');
        nameDisplays.forEach(d => {
            if ((d.textContent === 'Alex Riviera' || d.textContent === 'John Smith') && state.user.username !== 'demo') {
                d.textContent = state.user.username;
            }
        });

        // Update discipline display
        const discipline = localStorage.getItem('enggtv_discipline') || 'FE_Other Discipline';
        const disciplineBadge = document.getElementById('discipline-badge-display');
        const disciplineProfile = document.getElementById('discipline-profile-display');
        const disciplineInfo = document.getElementById('user-discipline-display');

        if (disciplineBadge) disciplineBadge.textContent = discipline;
        if (disciplineProfile) disciplineProfile.textContent = discipline;
        if (disciplineInfo) disciplineInfo.textContent = discipline;

        // Update Exam Headline
        const examHeadline = document.getElementById('exam-headline');
        if (examHeadline) {
            if (discipline === 'Mechanical') {
                examHeadline.textContent = 'FE Mechanical Mock Exam';
            } else if (discipline === 'Civil' || discipline === 'Civil Engineering') {
                examHeadline.textContent = 'FE Civil Mock Exam';
            } else if (discipline === 'Chemical') {
                examHeadline.textContent = 'FE Chemical Mock Exam';
            } else if (discipline === 'Environmental') {
                examHeadline.textContent = 'FE Environmental Mock Exam';
            } else if (discipline === 'Industrial') {
                examHeadline.textContent = 'FE Industrial Mock Exam';
            } else if (discipline === 'Electrical and Computer') {
                examHeadline.textContent = 'FE Electrical and Computer Mock Exam';
            } else {
                examHeadline.textContent = 'FE Other discipline Mock Exam';
            }
        }
        
        // Update Premium Expiration
        const expiryRow = document.getElementById('premium-expiry-row');
        const expiryDisplay = document.getElementById('premium-expiry-display');
        const joinedDisplay = document.getElementById('date-joined-display');

        if (expiryRow) {
            if (state.user.tier === 'premium') {
                expiryRow.classList.remove('hidden');
                
                // If we have a joined date in the UI, calculate 1 month after
                // Default in HTML is "April 26, 2026", so "May 26, 2026"
                if (joinedDisplay && joinedDisplay.textContent.includes('April 26')) {
                    expiryDisplay.textContent = 'May 26, 2026';
                }
            } else {
                expiryRow.classList.add('hidden');
            }
        }

        // Hide Subscription Plan button for premium users
        const subPlanBtn = document.getElementById('btn-subscription');
        if (subPlanBtn) {
            if (state.user.tier === 'premium') {
                subPlanBtn.classList.add('hidden');
            } else {
                subPlanBtn.classList.remove('hidden');
            }
        }

        // Toggle Admin Tools section visibility
        const adminTools = document.getElementById('admin-tools-section');
        if (adminTools) {
            if ((state.user.username && state.user.username.toLowerCase() === 'admin')) {
                adminTools.classList.remove('hidden');
            } else {
                adminTools.classList.add('hidden');
            }
        }
    }





    // Mobile Menu Toggle
    function setupMobileMenu() {
        if (!menuToggle) return;

        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('active');
            sidebarOverlay.classList.toggle('active');
        });

        sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
            sidebarOverlay.classList.remove('active');
        });
    }


    function prepareQuestions(questions) {
        return questions.map(q => {
            // Deep clone to avoid modifying original data
            const newQ = JSON.parse(JSON.stringify(q));
            
            // Option shuffling removed to ensure cross-device consistency
            
            // Re-assign labels and update final_answer if it exists
            const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
            newQ.options.forEach((opt, idx) => {
                opt.originalIndex = idx; // Keep for internal mapping consistency
                const newLabel = labels[idx] || String.fromCharCode(65 + idx);
                opt.label = newLabel;
                // If this is the correct option, update the final_answer reference in the solution
                if (opt.is_correct && newQ.solution) {
                    newQ.solution.final_answer = newLabel;
                }
            });
            
            return newQ;
        });
    }

    // Navigation Logic
    function setupNavigation() {
        const allNavItems = document.querySelectorAll('.nav-links li, #bottom-nav li');
        allNavItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const pageId = item.getAttribute('data-page');
                if (pageId) {
                    navigateTo(pageId);
                }
            });
        });
    }

    window.navigateTo = function(pageId) {
        if (typeof stopSpeech === 'function') stopSpeech();
        state.currentPage = pageId;
        
        // Reset theme to default when navigating between main pages
        if (pageId !== 'quiz-view' && pageId !== 'results-view') {
            if (window.updateBackgroundTheme) window.updateBackgroundTheme('default');
        }
        
        // Auto-hide navigation and header for focused sessions (Quiz/Exam)
        if (pageId === 'quiz-view') {
            document.body.classList.add('nav-hidden');
        } else {
            document.body.classList.remove('nav-hidden');
        }

        // Toggle Scratchpad FAB
        const btnScratch = document.getElementById('btn-open-scratchpad');
        if (btnScratch) {
            if (pageId === 'quiz-view') {
                btnScratch.classList.remove('hidden');
            } else {
                btnScratch.classList.add('hidden');
            }
        }

        // Update Title
        const titles = {
            'dashboard': 'Dashboard',
            'study': 'Study Topics',
            'exam': 'Mock Exam',
            'formulas': 'Formula Reference',
            'settings': 'Settings',
            'quiz-view': 'Practice Session',
            'account-info-view': 'Account Information',
            'support-view': 'Message Admin',
            'mentoring-view': 'Free FE Mentoring',
            'achievements-view': 'Achievements',
            'leaderboard': 'Leaderboard'
        };


        if (pageTitle) {
            pageTitle.textContent = titles[pageId] || 'ENGG.tv';
        }

        const performNav = () => {
            // Toggle Pages
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === pageId) {
                    page.classList.add('active');
                }
            });

            // Specific Page Logic
            if (pageId === 'dashboard') {
                updateDashboardStats();
                updateGamificationUI();
            }
            if (pageId === 'mentoring-view') {
                initMentoringView();
            }
            if (pageId === 'settings') {
                updateGamificationUI();
            }
            if (pageId === 'achievements-view') {
                renderAchievements();
            }
            if (pageId === 'leaderboard') {
                renderLeaderboard();
            }
            if (pageId === 'study') {
                renderSubjects();
            }
            if (pageId === 'account-info-view') {
                initAccountInfo();
                applyAvatar(); // Refresh avatar on account info page
                const adminSelector = document.getElementById('admin-discipline-selector');
                if (adminSelector) {
                    adminSelector.classList.remove('hidden');
                    adminSelector.style.display = 'block'; // Force visible for all users
                    const selectDisc = document.getElementById('select-discipline');
                    if (selectDisc) {
                        selectDisc.value = localStorage.getItem('enggtv_discipline') || 'Mechanical';
                    }
                }
            }

            // Update nav active state (Sidebar and Bottom Nav)
            const allNavLinks = document.querySelectorAll('.nav-links li, #bottom-nav li');
            allNavLinks.forEach(link => {
                const targetPage = link.getAttribute('data-page');
                if (targetPage === pageId) {
                    link.classList.add('active');
                } else {
                    link.classList.remove('active');
                }
            });

            // Close sidebar on mobile if it exists
            if (typeof sidebar !== 'undefined' && sidebar) sidebar.classList.remove('active');
            if (typeof sidebarOverlay !== 'undefined' && sidebarOverlay) sidebarOverlay.classList.remove('active');

            window.scrollTo(0, 0);
        };

        if (document.startViewTransition) {
            try {
                document.startViewTransition(performNav);
            } catch (e) {
                console.warn("View transition aborted:", e);
                performNav();
            }
        } else {
            performNav();
        }
    };

    
    function renderSubjects() {
        if (!subjectList) return;
        subjectList.innerHTML = '';
        
        const colors = [
            {bg: 'bg-primary-fixed', text: 'text-primary', icon: 'thermostat'},
            {bg: 'bg-tertiary-fixed', text: 'text-tertiary', icon: 'water_drop'},
            {bg: 'bg-orange-100', text: 'text-primary', icon: 'architecture'},
            {bg: 'bg-primary-fixed-dim/30', text: 'text-primary', icon: 'waves'},
            {bg: 'bg-green-100', text: 'text-green-700', icon: 'payments'}
        ];
        
        state.subjects.forEach((subject, idx) => {
            const color = colors[idx % colors.length];
            
            // Calculate progress
            const questionsInSubject = (getQuestionsSource()[subject.id] || []).length;
            const completedKey = getSubjectProgressKey(subject.id);
            const completed = (state.userProgress[completedKey] && state.userProgress[completedKey].completed) || 0;
            const percentage = questionsInSubject > 0 ? Math.round((completed / questionsInSubject) * 100) : 0;
            
            const subjectCard = document.createElement('div');
            subjectCard.className = 'stagger-item glass-card p-6 flex flex-col gap-4 active:scale-[0.98] transition-transform duration-150 cursor-pointer';
            subjectCard.style.animationDelay = `${idx * 100}ms`;
            
            subjectCard.onclick = () => startQuiz(subject.id);
            
            subjectCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center">
                            <span class="material-symbols-outlined ${color.text} text-2xl" data-icon="${color.icon}">${color.icon}</span>
                        </div>
                        <div>
                            <h3 class="font-title-sm text-title-sm text-on-surface dark:text-slate-100">${subject.name}</h3>
                            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">${questionsInSubject} questions available</p>
                        </div>
                    </div>
                    <span class="font-label-caps text-label-caps text-secondary dark:text-pink-400">${percentage}%</span>
                </div>
                <div class="w-full bg-surface-container-high h-2.5 rounded-full overflow-hidden">
                    <div class="bg-secondary h-full rounded-full" style="width: ${percentage}%"></div>
                </div>
            `;
            
            subjectCard.classList.add('subject-card-tilt');
            subjectList.appendChild(subjectCard);
        });
        updateDashboardStats();
        initTilt();
    }

    function renderNotes() {
        const notesList = document.getElementById('notes-subject-list');
        if (!notesList) return;
        notesList.innerHTML = '';
        
        const currentDiscipline = localStorage.getItem('enggtv_discipline') || 'Mechanical';

        const notesPageTitle = document.getElementById('notes-page-title');
        const notesPageDesc = document.getElementById('notes-page-desc');
        if (notesPageTitle) {
            notesPageTitle.textContent = `${currentDiscipline} Notes`;
        }
        if (notesPageDesc) {
            const disciplineText = currentDiscipline === 'Other' ? 'Other Disciplines' : currentDiscipline;
            notesPageDesc.textContent = `Comprehensive study notes and formulas for ${disciplineText} Engineering.`;
        }

        if (typeof notesData === 'undefined' || !notesData.length) {
            notesList.innerHTML = '<div class="text-center py-10 glass-card"><span class="material-symbols-outlined text-4xl text-slate-300 mb-2">menu_book</span><p class="text-slate-500 font-medium">Notes module initializing...</p></div>';
            return;
        }

        const filteredNotes = notesData.filter(item => item.discipline === currentDiscipline);

        if (filteredNotes.length === 0) {
            notesList.innerHTML = `<div class="text-center py-12 glass-card border border-slate-200 dark:border-slate-800"><span class="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600 mb-3 block">construction</span><h3 class="text-lg font-bold text-slate-700 dark:text-slate-300 mb-1">Coming Soon</h3><p class="text-slate-500 dark:text-slate-400">Notes for ${currentDiscipline} discipline will be available in a future update!</p></div>`;
            return;
        }

        const subjects = {};
        filteredNotes.forEach(item => {
            if (!subjects[item.subject]) subjects[item.subject] = { items: [], chapters: {} };
            subjects[item.subject].items.push(item);
            
            const chap = item.chapter || 'General';
            if (!subjects[item.subject].chapters[chap]) subjects[item.subject].chapters[chap] = [];
            subjects[item.subject].chapters[chap].push(item);
        });

        const colors = [
            {bg: 'bg-primary-fixed', text: 'text-primary', icon: 'menu_book'},
            {bg: 'bg-tertiary-fixed', text: 'text-tertiary', icon: 'library_books'},
            {bg: 'bg-orange-100', text: 'text-primary', icon: 'auto_stories'},
            {bg: 'bg-primary-fixed-dim/30', text: 'text-primary', icon: 'chrome_reader_mode'},
            {bg: 'bg-green-100', text: 'text-green-700', icon: 'history_edu'}
        ];

        let subjectKeys = Object.keys(subjects);
        if (currentDiscipline === 'Other' || currentDiscipline === 'Other Disciplines' || currentDiscipline.includes('Other')) {
            const otherOrder = [
                "Mathematics", 
                "Probability and Statistics", 
                "Chemistry and Biology",
                "Chemistry", 
                "Measurements, Instrumentation and Controls", 
                "Instrumentation and Controls",
                "Engineering Ethics and Societal Impacts", 
                "Safety, Health, and Environment", 
                "Engineering Economics", 
                "Statics", 
                "Dynamics", 
                "Strength of Materials",
                "Mechanics of Materials", 
                "Material Properties and Processing", 
                "Materials",
                "Fluid Mechanics", 
                "Electricity and Magnetism", 
                "Basic Electrical Engineering",
                "Thermodynamics",
                "Thermodynamics and Heat Transfer"
            ];
            subjectKeys.sort((a, b) => {
                let idxA = otherOrder.indexOf(a);
                let idxB = otherOrder.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });
        } else if (currentDiscipline.includes('Civil')) {
            console.log("Applying Civil custom subject sorting...");
            const civilOrder = [
                "Mathematics and Statistics",
                "Ethics and Professional Practice",
                "Engineering Economics",
                "Statics",
                "Dynamics",
                "Mechanics of Materials",
                "Materials",
                "Fluid Mechanics",
                "Surveying",
                "Water Resources and Environmental Engineering",
                "Structural Engineering",
                "Geotechnical Engineering",
                "Transportation Engineering",
                "Construction Engineering"
            ];
            subjectKeys = subjectKeys.filter(key => key !== "CNST");
            subjectKeys.sort((a, b) => {
                let idxA = civilOrder.indexOf(a);
                let idxB = civilOrder.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });
        } else if (currentDiscipline === 'Electrical and Computer') {
            const elecComputerOrder = [
                "Mathematics",
                "Probability and Statistics",
                "Ethics and Professional Practice",
                "Engineering Economics",
                "Properties of Electrical Materials",
                "Properties of Materials",
                "Material Properties and Processing",
                "Circuit Analysis",
                "Circuit Analysis (Linear and Non-linear)",
                "Linear Systems",
                "Signal Processing",
                "Electronics",
                "Power Systems",
                "Electromagnetics",
                "Control Systems",
                "Communications",
                "Computer Networks",
                "Digital Systems",
                "Computer Systems",
                "Software Engineering"
            ];
            subjectKeys.sort((a, b) => {
                let idxA = elecComputerOrder.indexOf(a);
                let idxB = elecComputerOrder.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });
        } else if (currentDiscipline === 'Industrial') {
            const industrialOrder = [
                "Mathematics",
                "Engineering Sciences",
                "Ethics and Professional Practice",
                "Engineering Economics",
                "Probability and Statistics",
                "Modeling and Quantitative Analysis",
                "Engineering Management",
                "Manufacturing, Service, and Other Production Systems",
                "Facilities and Supply Chain",
                "Human Factors, Ergonomics, and Safety",
                "Work Design",
                "Quality",
                "Systems Engineering, Analysis, and Design"
            ];
            subjectKeys.sort((a, b) => {
                let idxA = industrialOrder.indexOf(a);
                let idxB = industrialOrder.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });
        } else if (currentDiscipline === 'Environmental' || currentDiscipline.includes('Environmental')) {
            const envOrder = [
                "Mathematics",
                "Probability and Statistics",
                "Ethics and Professional Practice",
                "Engineering Economics",
                "Fundamental Principles",
                "Environmental Chemistry",
                "Health Hazards and Risk Assessment",
                "Fluid Mechanics and Hydraulics",
                "Thermodynamics",
                "Surface Water Resources and Hydrology",
                "Groundwater, Soils, and Sediments",
                "Water and Wastewater",
                "Air Quality and Control",
                "Solid and Hazardous Waste",
                "Energy and Environment"
            ];
            subjectKeys.sort((a, b) => {
                let idxA = envOrder.indexOf(a);
                let idxB = envOrder.indexOf(b);
                if (idxA === -1) idxA = 999;
                if (idxB === -1) idxB = 999;
                return idxA - idxB;
            });
        }

        let idx = 0;
        subjectKeys.forEach(subj => {
            const color = colors[idx % colors.length];
            const data = subjects[subj];
            const chapters = data.chapters;
            const chapterCount = Object.keys(chapters).length;
            
            const card = document.createElement('div');
            card.className = 'stagger-item glass-card flex flex-col active:scale-[0.98] transition-transform duration-150 subject-card-tilt';
            card.style.animationDelay = `${idx * 100}ms`;
            
            const headerDiv = document.createElement('div');
            headerDiv.className = 'p-6 flex justify-between items-start cursor-pointer';
            
            headerDiv.innerHTML = `
                <div class="flex justify-between items-center w-full">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center">
                            <span class="material-symbols-outlined ${color.text} text-2xl" data-icon="${color.icon}">${color.icon}</span>
                        </div>
                        <div>
                            <h3 class="font-title-sm text-title-sm text-on-surface dark:text-slate-100">${subj}</h3>
                            <p class="text-xs text-slate-400 dark:text-slate-500 font-medium">${chapterCount} chapters</p>
                        </div>
                    </div>
                    <span class="material-symbols-outlined text-slate-300 transition-transform duration-300 transform accordion-icon">expand_more</span>
                </div>
            `;
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'px-6 pb-6 hidden';
            
            const chapterList = document.createElement('div');
            chapterList.className = 'mt-4 flex flex-col gap-2 border-t border-slate-100 dark:border-slate-800 pt-4';
            
            let chapterKeys = Object.keys(chapters);
            if (subj === 'Mathematics') {
                const mathChapterOrder = [
                    "Math Basics",
                    "Basic Math",
                    "Analytic Geometry",
                    "Calculus",
                    "Differential Equations",
                    "Linear Algebra",
                    "Numerical Methods",
                    "Algorithm and Logic Development"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = mathChapterOrder.indexOf(a);
                    let idxB = mathChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            } else if (subj === 'Measurements, Instrumentation and Controls' && (currentDiscipline.includes('Other'))) {
                const measChapterOrder = [
                    "Sensors and Transducers",
                    "Data Acquisition",
                    "Logic Diagrams"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = measChapterOrder.indexOf(a);
                    let idxB = measChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            } else if (subj === 'Engineering Economics') {
                const econChapterOrder = [
                    "Time Value of Money",
                    "Non-Annual Compounding",
                    "Inflation",
                    "Capitalized Costs",
                    "Break-even Analysis",
                    "Cost Types and Breakdowns",
                    "Economic Analyses"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = econChapterOrder.indexOf(a);
                    let idxB = econChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            } else if (subj === 'Statics' && currentDiscipline.includes('Other')) {
                const staticsChapterOrder = [
                    "Resultants of Force Systems",
                    "Resolution of Forces",
                    "Moments and Couple",
                    "Systems of Forces",
                    "Centroids",
                    "Moment of Inertia",
                    "Static Friction",
                    "Screw Thread",
                    "Belt Friction",
                    "Statically Determinate Truss",
                    "Concurrent Forces",
                    "Concurrent Force Systems",
                    "Equilibrium of Rigid Bodies",
                    "Weight and Mass Computations"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = staticsChapterOrder.indexOf(a);
                    let idxB = staticsChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            } else if (subj === 'Fluid Mechanics' && currentDiscipline.includes('Other')) {
                const fluidChapterOrder = [
                    "Fluid Properties",
                    "Fluid Statics",
                    "One-Dimensional Fluid Flow",
                    "Internal Flow",
                    "External Flow",
                    "Impulse-Momentum Principle",
                    "Compressible Flow",
                    "Fluid Machinery",
                    "Flow Measurement",
                    "Dimensional Homogeneity",
                    "Airfoil Theory",
                    "Performance curves",
                    "Power and Efficiency-Fluid",
                    "Scaling Laws for Fans, Pumps and Compressors",
                    "Open Channel Flow",
                    "Dimensionless Numbers",
                    " Dimensionless Numbers"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = fluidChapterOrder.indexOf(a);
                    let idxB = fluidChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            } else if (subj === 'Electricity and Magnetism') {
                const elecChapterOrder = [
                    "Electrical Fundamentals",
                    "Capacitors and Inductors",
                    "AC Circuits",
                    "Transformers",
                    "Motors and Generators",
                    "Three-phase Power"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = elecChapterOrder.indexOf(a);
                    let idxB = elecChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            } else if (subj === 'Thermodynamics' || subj === 'Thermodynamics and Heat Transfer') {
                const thermoChapterOrder = [
                    "Single Component Systems",
                    "PVT Behavior",
                    "First Law of Thermodynamics",
                    "Thermodynamic Processes",
                    "Basic Cycles",
                    "Psychrometrics",
                    "Second Law of Thermodynamics",
                    "Combustion & Products",
                    "Refrigeration and HVAC",
                    "Energy Transfer",
                    "Energy Transfers",
                    "Laws of Thermodynamics",
                    "Nonreacting Mixtures of Gases",
                    "Power Cycles",
                    "Properties of Ideal Gases and Pure Substances",
                    "Mass and Energy Balances",
                    "Property and Phase Diagram",
                    "Property and Phase Diagrams",
                    "Real Gas Law",
                    "Thermodynamic Equilibrium",
                    "Conduction",
                    "Convection",
                    "Radiation"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = thermoChapterOrder.indexOf(a);
                    let idxB = thermoChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            } else if (subj === 'Material Properties and Processing') {
                const materialChapterOrder = [
                    "Stress-Strain Diagrams",
                    "Ferrous Metals",
                    "Nonferrous Metals",
                    "Engineered Materials",
                    "Manufacturing Processes",
                    "Phase Diagrams/Heat Treating",
                    "Corrosion",
                    "Failure Mechanisms",
                    "Materials Selection",
                    "Properties"
                ];
                chapterKeys.sort((a, b) => {
                    let idxA = materialChapterOrder.indexOf(a);
                    let idxB = materialChapterOrder.indexOf(b);
                    if (idxA === -1) idxA = 999;
                    if (idxB === -1) idxB = 999;
                    return idxA - idxB;
                });
            }
            
            chapterKeys.forEach(chap => {
                const chapItem = document.createElement('div');
                chapItem.className = 'p-3 rounded-lg hover:bg-surface-container-highest dark:hover:bg-slate-800/50 cursor-pointer flex justify-between items-center transition-colors group';
                chapItem.innerHTML = `
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary transition-colors">${chap}</span>
                    <span class="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 text-primary transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">arrow_forward</span>
                `;
                
                chapItem.onclick = (e) => {
                    e.stopPropagation();
                    openNotes(subj, chap, chapters[chap]);
                };
                
                chapterList.appendChild(chapItem);
            });
            
            contentDiv.appendChild(chapterList);
            
            headerDiv.onclick = () => {
                const isHidden = contentDiv.classList.contains('hidden');
                
                // Close all other accordions
                document.querySelectorAll('#notes-subject-list .accordion-icon').forEach(icon => icon.classList.remove('rotate-180'));
                document.querySelectorAll('#notes-subject-list .px-6.pb-6').forEach(div => {
                    if (div !== contentDiv) div.classList.add('hidden');
                });
                
                const icon = headerDiv.querySelector('.accordion-icon');
                if (isHidden) {
                    contentDiv.classList.remove('hidden');
                    icon.classList.add('rotate-180');
                } else {
                    contentDiv.classList.add('hidden');
                    icon.classList.remove('rotate-180');
                }
            };
            
            card.appendChild(headerDiv);
            card.appendChild(contentDiv);
            notesList.appendChild(card);
            idx++;
        });
        initTilt();
    }

    document.getElementById('close-notes-btn')?.addEventListener('click', () => navigateTo('notes'));

    function openNotes(subjectTitle, chapterTitle, subtopicsList) {
        if (typeof window.logNotesStudySession === 'function') {
            window.logNotesStudySession(subjectTitle, chapterTitle);
        }
        document.getElementById('notes-view-subject').textContent = subjectTitle;
        document.getElementById('notes-view-title').textContent = chapterTitle;
        
        const container = document.getElementById('notes-topics-container');
        container.innerHTML = '';
        
        const topics = {};
        subtopicsList.forEach(item => {
            const top = item.topic || 'Overview';
            if (!topics[top]) topics[top] = [];
            topics[top].push(item);
        });
        
        for (let topicName in topics) {
            const topicDiv = document.createElement('div');
            topicDiv.className = 'glass-card p-5 flex flex-col gap-4 mb-6';
            
            const topicHeader = document.createElement('h3');
            topicHeader.className = 'font-display-sm text-display-sm text-primary border-b-2 border-primary/20 pb-3 mb-2';
            topicHeader.textContent = topicName;
            topicDiv.appendChild(topicHeader);
            
            topics[topicName].forEach(sub => {
                const subDiv = document.createElement('div');
                subDiv.className = 'mb-6 last:mb-0 ml-2';
                
                if (sub.subtopic && sub.subtopic !== 'Overview') {
                    const subHeader = document.createElement('h5');
                    subHeader.className = 'font-bold text-sm text-on-surface dark:text-slate-200 mb-3';
                    subHeader.textContent = sub.subtopic;
                    subDiv.appendChild(subHeader);
                }
                
                const contentDiv = document.createElement('div');
                contentDiv.className = 'text-sm text-slate-700 dark:text-slate-300 leading-relaxed space-y-4';
                
                let html = sub.content_html || '<p class="text-slate-400 italic">No notes available.</p>';
                if (sub.important) {
                    html += `<div class="mt-5 p-4 bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 rounded"><strong class="text-red-700 dark:text-red-400 block mb-2">Important:</strong><div class="math-content">${sub.important}</div></div>`;
                }
                if (sub.resources) {
                    html += sub.resources;
                }
                
                contentDiv.innerHTML = html;
                
                // Temporarily hide video embeds across all disciplines
                const videoIframes = contentDiv.querySelectorAll('iframe');
                videoIframes.forEach(iframe => {
                    const wrapper = iframe.closest('.w-full') || iframe.closest('[style*="padding"]') || iframe;
                    wrapper.remove();
                });
                const videoElements = contentDiv.querySelectorAll('video');
                videoElements.forEach(video => video.remove());
                const videoScripts = contentDiv.querySelectorAll('script[src*="vimeo"], script[src*="youtube"], script[src*="player"]');
                videoScripts.forEach(script => script.remove());

                // Remove empty resource containers if any
                const resourceContainers = contentDiv.querySelectorAll('.border-t');
                resourceContainers.forEach(container => {
                    if (!container.textContent.trim() && container.querySelectorAll('a, img, svg').length === 0) {
                        container.remove();
                    }
                });
                
                // Re-create TikZ scripts and trigger window load so TikZJax catches them
                const tikzScripts = contentDiv.querySelectorAll('script[type="text/tikz"]');
                if (tikzScripts.length > 0) {
                    tikzScripts.forEach(oldScript => {
                        const newScript = document.createElement('script');
                        newScript.type = 'text/tikz';
                        newScript.textContent = oldScript.textContent || oldScript.innerHTML;
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                    
                    const trigger = () => window.dispatchEvent(new Event('load'));
                    setTimeout(trigger, 50);
                    setTimeout(trigger, 200);
                    setTimeout(trigger, 500);
                }
                
                const imgs = contentDiv.querySelectorAll('img');
                imgs.forEach(img => {
                    img.classList.add('max-w-full', 'rounded', 'shadow-sm', 'inline-block');
                    if (typeof toDriveImgUrl === 'function') {
                        img.src = toDriveImgUrl(img.src);
                    }
                });
                
                // Style wikimedia attributions if they exist inside small tags
                const smalls = contentDiv.querySelectorAll('small');
                smalls.forEach(small => {
                    small.classList.add('text-xs', 'text-slate-500', 'dark:text-slate-400', 'mt-1', 'block');
                });
                
                subDiv.appendChild(contentDiv);
                topicDiv.appendChild(subDiv);
            });
            
            container.appendChild(topicDiv);
        }
        
        navigateTo('notes-content-view');

        if (typeof window.publishPeerMilestone === 'function') {
            const disc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
            window.publishPeerMilestone({
                type: 'notes_reviewed',
                title: `Reviewed ${subjectTitle || 'Core'} Study Notes`,
                detail: `Mastering theoretical principles and reference equations`,
                discipline: disc
            });
        }
        
        window.safeTypesetMath([container]);
    }

    function updateDashboardStats() {
        if (!textDisplay) return;

        let totalQuestions = 0;
        let totalCompleted = 0;
        let coursesStarted = 0;

        state.subjects.forEach(subject => {
            const questionsInSubject = (getQuestionsSource()[subject.id] || []).length;
            const completedKey = getSubjectProgressKey(subject.id);
            const completed = (state.userProgress[completedKey] && state.userProgress[completedKey].completed) || 0;
            
            if (completed > 0) coursesStarted++;
            totalQuestions += questionsInSubject;
            totalCompleted += completed;
        });

        const percentage = totalQuestions > 0 ? Math.round((totalCompleted / totalQuestions) * 100) : 0;
        textDisplay.textContent = `${percentage}% Completed`;
        if (circleDisplay) circleDisplay.textContent = `${percentage}%`;

        // Update Course Display in Settings
        const coursesDisplay = document.getElementById('settings-courses-display');
        const coursesSubtitle = document.getElementById('settings-courses-subtitle');
        if (coursesDisplay) coursesDisplay.textContent = `${coursesStarted} Started`;
        if (coursesSubtitle) coursesSubtitle.textContent = `of ${state.subjects.length} total`;

        // Calculate and Update Streak
        const streak = calculateStreak();
        const streakDisplay = document.getElementById('settings-streak-display');
        if (streakDisplay) streakDisplay.textContent = `${streak} Day${streak !== 1 ? 's' : ''}`;

        // SVG Ring Animation (stroke-dashoffset)
        const ringCircle = document.getElementById('overall-progress-circle');
        if (ringCircle && ringCircle.tagName === 'circle') {
            const circumference = 263.9; // 2 * Math.PI * 42
            const offset = circumference * (1 - percentage / 100);
            ringCircle.style.strokeDashoffset = offset;
        }

        if (typeof window.renderStudyCalendar === 'function') {
            window.renderStudyCalendar();
        }

        const peerText = textDisplay.nextElementSibling;
        if (peerText && peerText.tagName === 'P') {
            const peerPercent = Math.min(99, Math.max(5, percentage + 25));
            peerText.textContent = `You're ahead of ${peerPercent}% of peers!`;
        }
        
        renderRecentActivity();
        initCharts(percentage, state.intensityRange || '7d');
        if (typeof renderDailyQuests === 'function') renderDailyQuests();
    }

    function calculateStreakFromActivity(activityList) {
        if (!activityList || activityList.length === 0) return 0;
        
        // Get unique dates sorted descending
        const dates = [...new Set(activityList.map(a => 
            new Date(a.timestamp).toDateString()
        ))].map(d => new Date(d)).sort((a, b) => b - a);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const yesterday = new Date(today);
        yesterday.setDate(today.getDate() - 1);

        // If most recent is not today or yesterday, streak is broken
        if (dates[0] < yesterday) return 0;

        let streak = 0;
        let currentDate = today;

        for (let i = 0; i < dates.length; i++) {
            const diff = Math.round((currentDate - dates[i]) / (1000 * 60 * 60 * 24));
            
            if (diff === 0) {
                // Same day as current check, continue
                if (i === 0) streak++; // Start streak if today/yesterday
            } else if (diff === 1) {
                // Exactly one day apart
                streak++;
                currentDate = dates[i];
            } else {
                // Gap in streak
                break;
            }
        }
        return streak;
    }

    function calculateStreak() {
        return calculateStreakFromActivity(state.recentActivity);
    }

    function renderRecentActivity() {
        const list = document.getElementById('recent-activity-list');
        if (!list) return;

        if (state.recentActivity.length === 0) {
            list.innerHTML = `
                <div class="flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 dark:bg-slate-900/50 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <span class="material-symbols-outlined text-slate-300 dark:text-slate-700 text-4xl mb-2">history</span>
                    <p class="text-sm text-slate-400 font-medium">No recent activity yet. Start studying!</p>
                </div>
            `;
            return;
        }

        list.innerHTML = state.recentActivity.slice(0, 5).map((activity, idx) => {
            const date = new Date(activity.timestamp);
            const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const dateStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
            
            const accuracyColor = activity.accuracy >= 80 ? 'text-green-500' : (activity.accuracy >= 50 ? 'text-amber-500' : 'text-red-500');
            
            return `
                <div class="stagger-item glass-card-sm p-4 rounded-2xl flex items-center justify-between group hover:border-pink-500/30 transition-all cursor-pointer tilt-card" 
                     onclick="window.reviewActivity('${activity.id}')" style="animation-delay: ${idx * 100}ms">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500">
                            <span class="material-symbols-outlined">${activity.isMockExam ? 'assignment' : 'menu_book'}</span>
                        </div>
                        <div>
                            <h4 class="text-sm font-bold text-slate-800 dark:text-slate-100">${activity.title}</h4>
                            <p class="text-[10px] text-slate-400 font-medium uppercase tracking-wider">${dateStr} • ${timeStr}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="text-xs font-black ${accuracyColor}">${activity.accuracy}%</p>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${activity.score}/${activity.attempted}</p>
                    </div>
                </div>
            `;
        }).join('');
        initTilt();
    }

    window.reviewActivity = function(activityId) {
        const activity = state.recentActivity.find(a => a.id === activityId);
        if (activity && activity.type === 'notes') {
            navigateTo('notes');
            return;
        }
        if (!activity || !activity.stateSnapshot) return;

        // Restore state from snapshot
        state.quizQuestions = activity.stateSnapshot.quizQuestions;
        state.answers = activity.stateSnapshot.answers;
        state.submitted = activity.stateSnapshot.submitted;
        state.flagged = activity.stateSnapshot.flagged;
        state.confidence = activity.stateSnapshot.confidence || new Array(state.quizQuestions.length).fill(null);
        state.questionTimes = activity.stateSnapshot.questionTimes || new Array(state.quizQuestions.length).fill(0);
        state.currentSubject = activity.stateSnapshot.currentSubject;
        state.currentTopic = activity.stateSnapshot.currentTopic;
        state.isMockExam = activity.isMockExam;
        state.score = activity.score;
        state.isFinished = true;

        navigateTo('quiz-view');
        state.currentQuestionIndex = 0;
        loadQuestion();
    };



    function initCharts(overallPercentage, range = '7d') {
        state.intensityRange = range;
        
        // Update toggle UI
        const btn7d = document.getElementById('btn-intensity-7d');
        const btn30d = document.getElementById('btn-intensity-30d');
        if (btn7d && btn30d) {
            if (range === '7d') {
                btn7d.className = "text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-bold transition-all";
                btn30d.className = "text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-outline font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all";
            } else {
                btn30d.className = "text-[10px] px-2 py-0.5 rounded-full bg-secondary text-white font-bold transition-all";
                btn7d.className = "text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-outline font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-all";
            }
        }

        // Study Intensity Line Chart (B-3)
        const lineCtx = document.getElementById('studyIntensityChart');
        if (lineCtx) {
            let labels = [];
            let intensityData = [];
            const daysCount = range === '7d' ? 7 : 30;
            
            // Generate labels and real data
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            for (let i = daysCount - 1; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(today.getDate() - i);
                
                if (range === '7d') {
                    labels.push(date.toLocaleDateString([], { weekday: 'short' }));
                } else {
                    labels.push(date.toLocaleDateString([], { month: 'short', day: 'numeric' }));
                }
                
                // Calculate real intensity for this day
                const dayStart = new Date(date).getTime();
                const dayEnd = dayStart + (24 * 60 * 60 * 1000);
                
                const dayIntensity = state.recentActivity
                    .filter(a => {
                        const ts = new Date(a.timestamp).getTime();
                        return ts >= dayStart && ts < dayEnd;
                    })
                    .reduce((sum, a) => sum + (a.attempted || 0), 0);
                
                intensityData.push(dayIntensity);
            }

            if (state.charts.line) {
                state.charts.line.data.labels = labels;
                state.charts.line.data.datasets[0].data = intensityData;
                state.charts.line.update();
            } else {
                const ctx = lineCtx.getContext('2d');
                const gradient = ctx.createLinearGradient(0, 0, 0, 200);
                gradient.addColorStop(0, 'rgba(255, 0, 110, 0.3)');
                gradient.addColorStop(1, 'rgba(255, 0, 110, 0.02)');

                state.charts.line = new Chart(lineCtx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: 'Questions Answered',
                            data: intensityData,
                            borderColor: '#FF006E',
                            backgroundColor: gradient,
                            fill: true,
                            tension: 0.4,
                            borderWidth: 4,
                            pointRadius: range === '7d' ? 4 : 0,
                            pointBackgroundColor: '#FF006E',
                            pointHoverRadius: 6,
                            pointHoverBackgroundColor: '#ffffff',
                            pointHoverBorderColor: '#FF006E',
                            pointHoverBorderWidth: 3
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: { 
                            legend: { display: false },
                            tooltip: {
                                backgroundColor: 'rgba(30, 41, 59, 0.9)',
                                titleFont: { family: 'Outfit', size: 12 },
                                bodyFont: { family: 'Lexend', size: 12 },
                                padding: 12,
                                cornerRadius: 8,
                                callbacks: {
                                    label: function(context) {
                                        return ` ${context.parsed.y} Questions`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: { 
                                grid: { display: false }, 
                                border: { display: false },
                                ticks: {
                                    display: true,
                                    maxRotation: 0,
                                    autoSkip: true,
                                    maxTicksLimit: 7,
                                    font: { size: 9, family: 'Lexend' },
                                    color: '#94a3b8'
                                }
                            },
                            y: { 
                                display: false, 
                                grid: { display: false },
                                beginAtZero: true
                            }
                        }
                    }
                });
            }
        }

        // Diagnostic Performance Report (NCEES Style)
        const diagnosticTbody = document.getElementById('diagnostic-report-body');
        if (diagnosticTbody) {
            const subjectStats = {};
            state.subjects.forEach(s => {
                subjectStats[s.id] = { name: s.name, correct: 0, attempted: 0 };
            });

            state.recentActivity.forEach(a => {
                if (a.isMockExam) return;
                const sid = a.minimalSnapshot?.subjectId;
                if (sid && subjectStats[sid]) {
                    subjectStats[sid].correct += (a.score || 0);
                    subjectStats[sid].attempted += (a.attempted || 0);
                }
            });

            const diagnosticSubjects = state.subjects.map(s => subjectStats[s.id]);
            let html = '';

            if (!diagnosticSubjects.some(s => s.attempted > 0)) {
                html = `<tr><td colspan="3" class="text-center py-12 text-slate-400 dark:text-slate-500 text-sm font-medium">No diagnostic data available.<br>Complete a quiz to generate your report.</td></tr>`;
            } else {
                diagnosticSubjects.forEach(s => {
                    const accuracy = s.attempted > 0 ? Math.round((s.correct / s.attempted) * 100) : 0;
                    const barColor = accuracy >= 70 ? 'bg-emerald-500' : (accuracy >= 50 ? 'bg-amber-500' : 'bg-red-500');
                    const widthVal = s.attempted === 0 ? 0 : accuracy; // 0 if unattempted
                    
                    html += `
                    <tr class="border-b border-slate-100 dark:border-slate-800/30 hover:bg-slate-50 dark:hover:bg-slate-800/20 transition-colors group">
                        <td class="py-4 px-1 sm:px-2 text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 break-words">${s.name}</td>
                        <td class="py-4 px-1 sm:px-2 text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 text-center font-mono font-bold">${s.attempted}</td>
                        <td class="py-4 px-1 sm:px-2 relative">
                            <!-- Continuous Dashed Target Line -->
                            <div class="absolute top-0 bottom-0 left-[70%] w-0 border-l-2 border-dashed border-black dark:border-white z-20 opacity-80 pointer-events-none"></div>
                            
                            <!-- Progress Bar Container -->
                            <div class="w-full h-3 bg-slate-200 dark:bg-slate-700/50 rounded-full relative overflow-hidden shadow-inner z-10">
                                <!-- Performance Bar -->
                                <div class="h-full ${barColor} rounded-full relative transition-all duration-1000 ease-out" style="width: ${widthVal}%"></div>
                            </div>
                        </td>
                    </tr>`;
                });
            }
            diagnosticTbody.innerHTML = html;
        }
    }
    
    function renderRecentActivity() {
        const container = document.getElementById('recent-activity-list');
        if (!container) return;

        if (!state.recentActivity || state.recentActivity.length === 0) {
            container.innerHTML = `
                <div class="bg-surface-container-lowest dark:bg-slate-900 rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-center border border-slate-50 dark:border-slate-800">
                    <p class="font-body-sm text-outline dark:text-slate-400">No recent activity yet. Start studying!</p>
                </div>
            `;
            return;
        }

        container.innerHTML = state.recentActivity.slice(0, 5).map((activity, idx) => {
            const timeAgo = getTimeAgo(activity.timestamp);
            if (activity.type === 'notes') {
                return `
                    <div class="stagger-item glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onclick="navigateTo('notes')" style="animation-delay: ${idx * 100}ms">
                        <div class="w-12 h-12 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <span class="material-symbols-outlined text-amber-500">auto_stories</span>
                        </div>
                        <div class="flex-1">
                            <p class="font-title-sm text-body-base text-on-surface dark:text-slate-100">${activity.subject || 'Engineering'}: ${activity.title}</p>
                            <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">Notes Read • Completed ${timeAgo}</p>
                        </div>
                        <span class="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
                    </div>
                `;
            }
            return `
                <div class="stagger-item glass-card p-4 flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onclick="window.loadRecentActivity('${activity.id}')" style="animation-delay: ${idx * 100}ms">
                    <div class="w-12 h-12 rounded-lg bg-${activity.isMockExam ? 'primary' : 'secondary'}/10 flex items-center justify-center">
                        <span class="material-symbols-outlined text-${activity.isMockExam ? 'primary' : 'secondary'}" data-icon="quiz">quiz</span>
                    </div>
                    <div class="flex-1">
                        <p class="font-title-sm text-body-base text-on-surface dark:text-slate-100">${activity.title}</p>
                        <p class="font-body-sm text-body-sm text-outline dark:text-slate-400">Score: ${activity.accuracy}% • Completed ${timeAgo}</p>
                    </div>
                    <span class="material-symbols-outlined text-outline" data-icon="chevron_right">chevron_right</span>
                </div>
            `;
        }).join('');
    }

    function getTimeAgo(timestamp) {
        const diffMs = Date.now() - timestamp;
        const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMins = Math.floor(diffMs / (1000 * 60));
        if (diffHrs > 24) {
            return `${Math.floor(diffHrs / 24)}d ago`;
        } else if (diffHrs > 0) {
            return `${diffHrs}h ago`;
        } else if (diffMins > 0) {
            return `${diffMins}m ago`;
        } else {
            return 'Just now';
        }
    }

    window.loadRecentActivity = function(activityId) {
        const activity = state.recentActivity.find(a => a.id === activityId);
        if (activity && activity.type === 'notes') {
            navigateTo('notes');
            return;
        }
        if (!activity || (!activity.stateSnapshot && !activity.minimalSnapshot)) {
            alert("Sorry, full details for this older activity were not saved.");
            return;
        }

        // Reconstruct full state if only minimal snapshot exists (e.g. from cloud sync)
        if (!activity.stateSnapshot && activity.minimalSnapshot) {
            console.log("��️ Reconstructing activity from minimal snapshot...", activityId);
            const min = activity.minimalSnapshot;
            const isAdv = activity.isAdvanced || min.isAdvanced;
            const source = typeof ADVANCED_QUESTIONS !== 'undefined' && isAdv ? ADVANCED_QUESTIONS : QUESTIONS;
            
            // Rebuild quizQuestions from indices or per-question refs
            let rebuiltQuestions = [];
            try {
                if (min.questions) {
                    rebuiltQuestions = min.questions.map(qRef => {
                        const masterList = source[qRef.sid] || [];
                        const q = masterList[qRef.idx];
                        if (q) return { ...JSON.parse(JSON.stringify(q)), subjectId: qRef.sid };
                        return null;
                    }).filter(q => q);
                } else if (min.questionIndices) {
                    const masterList = source[min.subjectId] || [];
                    rebuiltQuestions = min.questionIndices.map(idx => {
                        const q = masterList[idx];
                        if (q) return { ...JSON.parse(JSON.stringify(q)), subjectId: min.subjectId };
                        return null;
                    }).filter(q => q);
                }
            } catch (e) {
                console.error("❌ Reconstruction failed:", e);
            }
            
            if (rebuiltQuestions.length === 0) {
                alert("Could not reconstruct activity details. The question database may have been updated.");
                return;
            }

            let subObj = null;
            if (min.subjectId === 'mock' || activity.isMockExam) {
                subObj = { id: 'mock', name: 'Mock Exam' };
            } else {
                subObj = state.subjects.find(s => s.id === min.subjectId);
                if (!subObj) {
                    const allPossible = [...(typeof MECHANICAL_SUBJECTS !== 'undefined' ? MECHANICAL_SUBJECTS : []), ...(typeof CIVIL_SUBJECTS !== 'undefined' ? CIVIL_SUBJECTS : []), ...(typeof OTHER_SUBJECTS !== 'undefined' ? OTHER_SUBJECTS : [])];
                    subObj = allPossible.find(s => s.id === min.subjectId);
                }
            }

            activity.stateSnapshot = {
                quizQuestions: rebuiltQuestions,
                answers: [...(min.answers || [])],
                submitted: [...(min.submitted || [])],
                flagged: [...(min.flagged || [])],
                confidence: [...(min.confidence || [])],
                questionTimes: [...(min.questionTimes || [])],
                currentSubject: subObj || { id: min.subjectId, name: activity.title },
                currentTopic: min.topic
            };
            console.log("✅ Reconstruction complete. Correctness match:", activity.stateSnapshot.answers);
        }

        // Restore state
        state.quizQuestions = activity.stateSnapshot.quizQuestions;
        state.answers = activity.stateSnapshot.answers;
        state.submitted = activity.stateSnapshot.submitted;
        state.flagged = activity.stateSnapshot.flagged;
        state.confidence = activity.stateSnapshot.confidence || new Array(state.quizQuestions.length).fill(null);
        state.questionTimes = activity.stateSnapshot.questionTimes || new Array(state.quizQuestions.length).fill(0);
        state.currentSubject = activity.stateSnapshot.currentSubject;
        state.currentTopic = activity.stateSnapshot.currentTopic;
        
        state.isMockExam = activity.isMockExam;
        state.score = activity.score;
        state.isFinished = true;

        // Display results
        let attempted = activity.attempted || 0;
        let correct = activity.score || 0;
        const accuracy = activity.accuracy || 0;
        
        resTotal.textContent = state.quizQuestions.length;
        resAttempted.textContent = attempted;
        resCorrect.textContent = state.score;
        resAccuracy.textContent = `${accuracy}%`;
        resultsSubjectName.textContent = state.currentTopic || state.currentSubject.name;

        updateQuestionMap();

        // Render Session Autopsy for past quizzes too
        renderSessionAutopsy(attempted, correct, accuracy);

        window.safeTypesetMath(resultsDetailedList ? [resultsDetailedList] : null);

        if (state.score === state.quizQuestions.length && state.quizQuestions.length > 0) {
            triggerConfetti();
        }

        navigateTo('results-view');
    };
    
    // Quiz Engine
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    async function startQuiz(subjectId, topicName) {
        // Update background theme for the subject (A-1)
        if (window.updateBackgroundTheme) window.updateBackgroundTheme(subjectId);

        const subject = state.subjects.find(s => s.id === subjectId);
        let questions = getQuestionsSource()[subjectId] || [];
        
        if (topicName) {
            questions = questions.filter(q => q.topic === topicName);
        }

        if (questions.length === 0) {
            alert("No questions available for this topic yet.");
            return;
        }

        state.currentSubject = subject;
        state.currentTopic = topicName;
        
        let shuffledQuestions = shuffleArray([...questions]);
        shuffledQuestions.sort((a, b) => (a.times_presented || 0) - (b.times_presented || 0));
        let selectedRaw = shuffledQuestions.slice(0, 10);
        incrementQuestionStats(selectedRaw);
        
        // Tag each question with its subjectId for persistence
        const taggedQuestions = selectedRaw.map(q => ({ ...q, subjectId: subjectId }));
        state.quizQuestions = prepareQuestions(taggedQuestions);
        
        state.currentQuestionIndex = 0;
        state.answers = new Array(state.quizQuestions.length).fill(null);
        state.submitted = new Array(state.quizQuestions.length).fill(false);
        state.flagged = new Array(state.quizQuestions.length).fill(false);
        state.confidence = new Array(state.quizQuestions.length).fill(null);
        state.questionTimes = new Array(state.quizQuestions.length).fill(0);
        state.questionEnteredAt = Date.now();
        state.score = 0;
        state.secondsElapsed = 0;
        state.isFinished = false;
        state.isMockExam = false;

        navigateTo('quiz-view');
        updateQuestionMap();
        loadQuestion();
        startTimer();
    }

    function loadQuestion() {
        if (typeof stopSpeech === 'function') stopSpeech();
        // Record time spent on previous question before loading new one
        if (state.questionEnteredAt && !state.isFinished) {
            // We don't record here because time is recorded on submit; just reset the entry timestamp
        }
        state.questionEnteredAt = Date.now();

        const question = state.quizQuestions[state.currentQuestionIndex];
        if (state.isFullFEExam) {
            questionMeta.textContent = `Question ${state.currentQuestionIndex + 1} of ${state.quizQuestions.length}`;
        } else {
            questionMeta.textContent = `Question ${state.currentQuestionIndex + 1} of ${state.quizQuestions.length} • ${state.currentTopic || state.currentSubject.name}`;
        }
        
        questionText.innerHTML = `<p>${injectFormulaTriggers(question.question)}</p>`;
        
        const diagramsUnlocked = true; // Images unlocked for all users
        
        if (diagramsUnlocked) {
            if (question.question_image) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'question-image-container';
                let primarySrc = question.local_question_image ? question.local_question_image : toDriveImgUrl(question.question_image);
                let fallbackAttr = question.local_question_image ? ` onerror="this.onerror=null; this.src='${toDriveImgUrl(question.question_image)}'"` : '';
                imgDiv.innerHTML = `<img src="${primarySrc}" alt="Question Diagram" class="quiz-image"${fallbackAttr}>`;
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
        
        const progress = ((state.currentQuestionIndex + 1) / state.quizQuestions.length) * 100;
        quizProgressInner.style.width = `${progress}%`;

        explanationContainer.classList.add('hidden');
        explanationText.innerHTML = '';

        // --- Confidence Slider ---
        const existingConfBar = document.getElementById('confidence-bar');
        if (existingConfBar) existingConfBar.remove();
        // Remove stale review badges to prevent stacking on question navigation
        document.querySelectorAll('.confidence-review-badge').forEach(el => el.remove());

        if (!state.isFinished && !state.submitted[state.currentQuestionIndex]) {
            const confBar = document.createElement('div');
            confBar.id = 'confidence-bar';
            confBar.className = 'confidence-bar';
            const savedConf = state.confidence[state.currentQuestionIndex];
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
                    state.confidence[state.currentQuestionIndex] = level;
                    confBar.querySelectorAll('.conf-btn').forEach(b => b.classList.remove('conf-active'));
                    btn.classList.add('conf-active');
                });
            });
        } else if (state.isFinished || state.submitted[state.currentQuestionIndex]) {
            // Show confidence badge in review mode if one was recorded
            const confLevel = state.confidence[state.currentQuestionIndex];
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
            if (state.answers[state.currentQuestionIndex] === index) {
                div.classList.add('selected');
            }
            
            div.innerHTML = `
                <span class="option-prefix">${option.label}</span>
                <span class="option-text">${injectFormulaTriggers(option.text)}</span>
            `;
            
            div.addEventListener('click', () => selectOption(index));
            optionsContainer.appendChild(div);
        });

        window.safeTypesetMath([questionText, optionsContainer]);

        updateQuestionMap();

        if (state.isFinished) {
            quizLegendActive.classList.add('hidden');
            quizLegendReview.classList.remove('hidden');
        } else {
            quizLegendActive.classList.remove('hidden');
            quizLegendReview.classList.add('hidden');
        }

        prevBtn.disabled = state.currentQuestionIndex === 0;
        
        if (state.flagged[state.currentQuestionIndex]) {
            flagBtn.classList.add('active');
        } else {
            flagBtn.classList.remove('active');
        }

        nextBtn.disabled = state.currentQuestionIndex === state.quizQuestions.length - 1;
        nextBtn.classList.remove('hidden');
        prevBtn.classList.remove('hidden');

        if (state.isFinished) {
            showFeedback();
            submitBtn.classList.add('hidden');
        } else {
            if (state.submitted[state.currentQuestionIndex]) {
                submitBtn.classList.add('hidden');
            } else {
                submitBtn.classList.remove('hidden');
            }
        }
    }

    function selectOption(index) {
        if (state.isFinished || state.submitted[state.currentQuestionIndex]) return; 
        
        if (navigator.vibrate) navigator.vibrate(10);
        
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected', 'tap-bounce'));
        
        const selectedOpt = options[index];
        selectedOpt.classList.add('selected', 'tap-bounce');
        setTimeout(() => selectedOpt.classList.remove('tap-bounce'), 200);
        
        state.answers[state.currentQuestionIndex] = index;
        updateQuestionMap();
    }

    function updateQuestionMap() {
        if (!questionMap) return;
        questionMap.innerHTML = '';
        state.quizQuestions.forEach((_, idx) => {
            const btn = document.createElement('button');
            btn.className = 'map-btn w-8 h-8 rounded-lg font-bold text-xs transition-all active:scale-90 flex items-center justify-center';
            btn.textContent = idx + 1;
            
            // Apply semantic color-coding based on active quiz state
            if (idx === state.currentQuestionIndex) {
                btn.classList.add('current');
            }
            
            if (state.flagged[idx]) {
                btn.classList.add('flagged');
            }
            
            if (state.submitted[idx]) {
                if (state.isFinished) {
                    const q = state.quizQuestions[idx];
                    const selectedIdx = state.answers[idx];
                    const isCorrect = selectedIdx !== null && q.options[selectedIdx] && q.options[selectedIdx].is_correct;
                    btn.classList.add(isCorrect ? 'correct-res' : 'wrong-res');
                } else {
                    btn.classList.add('answered');
                }
            }
            
            // FE Exam Part lockdown: grey out and disable locked halves
            let isLocked = false;
            if (state.isFullFEExam && !state.isFinished) {
                if (!state.hasTakenFEBreak && idx >= 55) {
                    isLocked = true; // Part 1: lock Part 2 questions
                } else if (state.hasTakenFEBreak && idx < 55) {
                    isLocked = true; // Part 2: lock Part 1 questions
                }
            }
            
            if (isLocked) {
                btn.style.opacity = '0.2';
                btn.style.pointerEvents = 'none';
                btn.style.filter = 'grayscale(100%)';
            } else {
                btn.onclick = () => {
                    state.currentQuestionIndex = idx;
                    loadQuestion();
                };
            }
            
            // Add visual separator between Part 1 and Part 2 in FE exam
            if (state.isFullFEExam && idx === 55) {
                const separator = document.createElement('div');
                separator.className = 'w-full';
                separator.style.cssText = 'height: 2px; background: linear-gradient(90deg, transparent, #94a3b8, transparent); margin: 12px 0; grid-column: 1 / -1;';
                
                const label = document.createElement('div');
                label.style.cssText = 'grid-column: 1 / -1; text-align: center; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; color: #94a3b8; margin-bottom: 8px;';
                label.textContent = state.hasTakenFEBreak ? '▼ Part 2 (Questions 56–110)' : '▽ Part 2 (Locked)';
                
                questionMap.appendChild(separator);
                questionMap.appendChild(label);
            }
            
            questionMap.appendChild(btn);
        });
        
        // Also update results question map if it exists
        if (resultsQuestionMap && state.isFinished) {
            resultsQuestionMap.innerHTML = questionMap.innerHTML;
            const resultBtns = resultsQuestionMap.querySelectorAll('button');
            resultBtns.forEach((btn, idx) => {
                btn.onclick = () => {
                    navigateTo('quiz-view');
                    state.currentQuestionIndex = idx;
                    loadQuestion();
                };
            });
        }
        
        if (window.updateFollowerListeners) window.updateFollowerListeners();
    }

    function showFeedback() {
        const question = state.quizQuestions[state.currentQuestionIndex];
        const selectedIndex = state.answers[state.currentQuestionIndex];
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
        const localSolImg = question.local_solution_image || (question.solution && question.solution.local_solution_image);
        
        if (diagramsUnlocked) {
            if (solImg) {
                const globalImgDiv = document.createElement('div');
                globalImgDiv.className = 'solution-image-container';
                let primarySrc = localSolImg ? localSolImg : toDriveImgUrl(solImg);
                let fallbackAttr = localSolImg ? ` onerror="this.onerror=null; this.src='${toDriveImgUrl(solImg)}'"` : '';
                globalImgDiv.innerHTML = `<img src="${primarySrc}" alt="Solution Overview" class="quiz-image"${fallbackAttr}>`;
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
            const localStepImg = step.local_solution_image || step.local_image;
            
            if (diagramsUnlocked) {
                if (stepImg) {
                    const imgDiv = document.createElement('div');
                    imgDiv.className = 'step-image-container';
                    let primarySrc = localStepImg ? localStepImg : toDriveImgUrl(stepImg);
                    let fallbackAttr = localStepImg ? ` onerror="this.onerror=null; this.src='${toDriveImgUrl(stepImg)}'"` : '';
                    imgDiv.innerHTML = `<img src="${primarySrc}" alt="Step ${idx + 1} Diagram" class="quiz-image"${fallbackAttr}>`;
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
        finalDiv.innerHTML = `<strong>Final Answer:</strong> ${injectFormulaTriggers(question.solution.final_answer || '')}`;
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

        // --- Engg.tv AI explainer (Phase 1 Embed) ---
        if (question.copilot_explanation) {
            const copilot = question.copilot_explanation;
            const copilotDiv = document.createElement('div');
            copilotDiv.className = 'mt-4 mb-2 p-5 rounded-3xl enggtv-ai-box relative overflow-hidden backdrop-blur-xl transition-all duration-300';
            
            let stepsHtml = '';
            if (copilot.step_by_step && Array.isArray(copilot.step_by_step)) {
                stepsHtml = copilot.step_by_step.map(s => `
                    <div class="p-3.5 rounded-2xl enggtv-ai-step text-xs shadow-sm">
                        <span class="font-bold enggtv-ai-step-title block mb-1 text-[13px]">${s.step}</span>
                        <span class="leading-relaxed">${injectFormulaTriggers(s.explanation)}</span>
                    </div>
                `).join('');
            }

            let pitfallsHtml = '';
            if (copilot.common_pitfalls && Array.isArray(copilot.common_pitfalls)) {
                pitfallsHtml = `
                    <div class="p-3.5 rounded-2xl enggtv-ai-pitfall text-xs leading-relaxed mt-3">
                        <strong class="enggtv-ai-pitfall-title block mb-1.5 font-bold uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">warning</span> Common Traps & Exam Pitfalls
                        </strong>
                        <ul class="space-y-1.5">
                            ${copilot.common_pitfalls.map(p => `<li class="flex items-start gap-2"><span class="enggtv-ai-pitfall-bullet font-bold">&bull;</span> <span>${injectFormulaTriggers(p)}</span></li>`).join('')}
                        </ul>
                    </div>
                `;
            }

            copilotDiv.innerHTML = `
                <div class="absolute -top-12 -right-12 w-36 h-36 bg-blue-500/15 rounded-full blur-3xl pointer-events-none"></div>
                <div class="flex items-center justify-between mb-3 z-10 relative">
                    <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl enggtv-ai-icon flex items-center justify-center shadow-md">
                            <span class="material-symbols-outlined text-[18px]">smart_toy</span>
                        </div>
                        <div>
                            <span class="text-xs font-black uppercase tracking-wider enggtv-ai-title block">Engg.tv AI explainer</span>
                            <span class="text-[10px] enggtv-ai-subtitle font-medium block -mt-0.5">Pre-Generated Step-by-Step AI Breakdown</span>
                        </div>
                    </div>
                    <span class="text-[9px] font-black enggtv-ai-badge px-2.5 py-1 rounded-full uppercase tracking-widest shadow-sm">AI Embedded</span>
                </div>
                ${copilot.big_idea ? `
                <div class="mb-3 p-3.5 rounded-2xl enggtv-ai-bigidea text-xs leading-relaxed">
                    <strong class="enggtv-ai-bigidea-title block mb-1 text-[11px] uppercase tracking-wider font-bold">💡 The Big Idea:</strong>
                    ${injectFormulaTriggers(copilot.big_idea)}
                </div>
                ` : ''}
                ${copilot.ncees_shortcut ? `
                <div class="mb-3 p-3.5 rounded-2xl bg-amber-500/10 dark:bg-amber-500/15 border border-amber-500/25 text-xs text-amber-800 dark:text-amber-200 leading-relaxed">
                    <strong class="text-amber-600 dark:text-amber-300 block mb-1 text-[11px] uppercase tracking-wider font-bold">📖 NCEES Handbook Shortcut:</strong>
                    ${injectFormulaTriggers(copilot.ncees_shortcut)}
                </div>
                ` : ''}
                ${stepsHtml ? `
                <div class="mb-3 space-y-2">
                    <strong class="text-[11px] font-bold enggtv-ai-title uppercase tracking-wider block mb-1">🪜 Step-by-Step AI Walkthrough:</strong>
                    ${stepsHtml}
                </div>
                ` : ''}
                ${pitfallsHtml}
            `;
            explanationText.appendChild(copilotDiv);
        }

        // --- Video Explanation (Vimeo or Native HTML5 MP4/WebM) ---
        const videoField = question.solution && question.solution.video_explanation;
        if (videoField && videoField.trim() !== '') {
            const vStr = videoField.trim();
            const videoDiv = document.createElement('div');
            videoDiv.className = 'video-explanation-container mt-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-white shadow-md';

            // Check if it's a direct video file (MP4/WebM/local asset)
            if (vStr.endsWith('.mp4') || vStr.endsWith('.webm') || vStr.includes('assets/videos/') || vStr.startsWith('blob:')) {
                videoDiv.innerHTML = `
                    <div class="video-explanation-header flex items-center gap-2 mb-3 font-bold text-sm text-cyan-400">
                        <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1; color: #06B6D4;">play_circle</span>
                        <span>Video Demonstration & Walkthrough</span>
                    </div>
                    <div class="video-native-wrapper rounded-xl overflow-hidden bg-black aspect-video relative shadow-inner border border-slate-700/60">
                        <video controls playsinline preload="metadata" class="w-full h-full object-cover">
                            <source src="${vStr}" type="${vStr.endsWith('.webm') ? 'video/webm' : 'video/mp4'}">
                            Your browser does not support HTML5 video.
                        </video>
                    </div>
                `;
                explanationText.appendChild(videoDiv);
            } else {
                // Accept full URL (https://vimeo.com/123456789) or bare numeric ID
                const vimeoIdMatch = vStr.match(/(?:vimeo\.com\/|^)(\d+)/);
                const vimeoId = vimeoIdMatch ? vimeoIdMatch[1] : null;
                if (vimeoId) {
                    videoDiv.innerHTML = `
                        <div class="video-explanation-header flex items-center gap-2 mb-3 font-bold text-sm text-pink-400">
                            <span class="material-symbols-outlined" style="font-variation-settings:'FILL' 1; color: #FF006E;">play_circle</span>
                            <span>Video Explanation</span>
                        </div>
                        <div class="video-iframe-wrapper rounded-xl overflow-hidden aspect-video">
                            <iframe
                                src="https://player.vimeo.com/video/${vimeoId}?badge=0&autopause=0&player_id=0&app_id=58479"
                                frameborder="0"
                                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                                allowfullscreen
                                title="Video Explanation"
                                loading="lazy"
                                class="w-full h-full">
                            </iframe>
                        </div>
                    `;
                    explanationText.appendChild(videoDiv);
                }
            }
        }

        // --- Performance Benchmarking ---
        const qStr = question.question.substring(0, 50);
        let hash = 0;
        for(let i=0; i<qStr.length; i++) hash = ((hash << 5) - hash) + qStr.charCodeAt(i);
        const peerTime = 40 + Math.abs(hash % 120); 
        const peerSuccess = 35 + Math.abs(hash % 50); 
        
        const userTime = state.questionTimes[state.currentQuestionIndex] || 0;
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


        window.safeTypesetMath([explanationContainer]);

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
                state.flagged[state.currentQuestionIndex] = !state.flagged[state.currentQuestionIndex];
                flagBtn.classList.toggle('active');
                updateQuestionMap();
            });
        }

        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                const selectedIdx = state.answers[state.currentQuestionIndex];
                if (selectedIdx === null || selectedIdx === undefined) {
                    alert("Please select an option first.");
                    return;
                }
                
                // Record time spent on this question
                if (state.questionEnteredAt) {
                    const timeSpent = (Date.now() - state.questionEnteredAt) / 1000; // seconds
                    state.questionTimes[state.currentQuestionIndex] = Math.round(timeSpent);
                }

                // Default confidence to 3 (Neutral) if not set
                if (state.confidence[state.currentQuestionIndex] === null) {
                    state.confidence[state.currentQuestionIndex] = 3;
                }

                const question = state.quizQuestions[state.currentQuestionIndex];
                const isCorrect = question.options[selectedIdx].is_correct;
                
                if (window.recordSRS) window.recordSRS(question, isCorrect);
                if (window.incrementQuestProgress) window.incrementQuestProgress('questions_answered', 1);
                
                state.submitted[state.currentQuestionIndex] = true;
                state.flagged[state.currentQuestionIndex] = false;
                
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
                
                if (state.currentQuestionIndex < state.quizQuestions.length - 1) {
                    setTimeout(() => {
                        if (!state.isFinished) {
                            state.currentQuestionIndex++;
                            // FE Exam: route through window.loadQuestion to trigger break at Q55
                            if (state.isFullFEExam && window.loadQuestion) {
                                window.loadQuestion();
                            } else {
                                loadQuestion();
                            }
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
                // FE Exam: block advancing past question 55 during Part 1
                if (state.isFullFEExam && !state.hasTakenFEBreak && state.currentQuestionIndex >= 54) {
                    if (state.currentQuestionIndex === 54) {
                        state.currentQuestionIndex++;
                        // Must call window.loadQuestion (intercepted) to trigger break
                        if (window.loadQuestion) {
                            window.loadQuestion();
                        }
                    }
                    return;
                }
                if (state.currentQuestionIndex < state.quizQuestions.length - 1) {
                    state.currentQuestionIndex++;
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
                state.currentQuestionIndex = 0;
                loadQuestion();
            });
        }

        if (resetDataBtn) {
            resetDataBtn.addEventListener('click', () => {
                if (confirm("Are you sure you want to erase all your progress? This cannot be undone.")) {
                    const key = `enggtv_progress_${state.user.username}`;
                    localStorage.removeItem(key);
                    state.userProgress = {};
                    renderSubjects();
                    updateDashboardStats();
                    alert("All progress has been reset.");
                }
            });
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                if (state.isFullFEExam && state.hasTakenFEBreak && state.currentQuestionIndex === 55) {
                    if (window.showFEBlockModal) {
                        window.showFEBlockModal("Access Denied", "You cannot return to Part 1 (Questions 1-55) after your scheduled break.");
                    } else {
                        alert("You cannot return to Part 1 (Questions 1-55) after your scheduled break.");
                    }
                    return;
                }
                if (state.currentQuestionIndex > 0) {
                    state.currentQuestionIndex--;
                    loadQuestion();
                }
            });
        }

        if (exitQuizBtn) {
            exitQuizBtn.addEventListener('click', () => {
                const exitModal = document.getElementById('exit-quiz-modal');
                if (exitModal) {
                    exitModal.classList.remove('hidden');
                } else {
                    if (confirm("Are you sure you want to exit the quiz? Your progress won't be saved.")) {
                        stopTimer();
                        navigateTo('study');
                    }
                }
            });
        }

        const exitQuizCancelBtn = document.getElementById('btn-exit-quiz-cancel');
        const exitQuizConfirmBtn = document.getElementById('btn-exit-quiz-confirm');

        if (exitQuizCancelBtn) {
            exitQuizCancelBtn.addEventListener('click', () => {
                const exitModal = document.getElementById('exit-quiz-modal');
                if (exitModal) exitModal.classList.add('hidden');
            });
        }

        if (exitQuizConfirmBtn) {
            exitQuizConfirmBtn.addEventListener('click', () => {
                const exitModal = document.getElementById('exit-quiz-modal');
                if (exitModal) exitModal.classList.add('hidden');
                stopTimer();
                navigateTo('study');
            });
        }

        // Inline handler in HTML now handles start-mock-exam
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

    async function startMockExam() {
        const totalExamQuestions = 20;
        let selectedQuestions = [];
        let availablePools = [];

        state.subjects.forEach(subject => {
            const subjectQuestions = QUESTIONS[subject.id] || [];
            if (subjectQuestions.length > 0) {
                // Tag each question with its subjectId
                const taggedPool = [...subjectQuestions].map(q => ({ ...q, subjectId: subject.id }));
                let shuffledPool = shuffleArray([...taggedPool]);
                shuffledPool.sort((a, b) => (a.times_presented || 0) - (b.times_presented || 0));
                availablePools.push(shuffledPool);
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


        state.currentSubject = { name: "Full Mock Exam", id: "mock" };
        state.currentTopic = "All Subjects";
        incrementQuestionStats(selectedQuestions);
        state.quizQuestions = prepareQuestions(selectedQuestions);
        state.currentQuestionIndex = 0;
        state.answers = new Array(state.quizQuestions.length).fill(null);
        state.submitted = new Array(state.quizQuestions.length).fill(false);
        state.flagged = new Array(state.quizQuestions.length).fill(false);
        state.score = 0;
        state.secondsElapsed = 0;
        state.isFinished = false;
        state.isMockExam = true;

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

    function formatQuestionHeaderForReview(text, maxLength = 100) {
        if (!text) return '';
        let cleaned = injectFormulaTriggers(text);
        if (cleaned.length <= maxLength) return cleaned;
        
        let truncated = cleaned.substring(0, maxLength);
        const dollarCount = (truncated.match(/(?<!\\)\$/g) || []).length;
        if (dollarCount % 2 !== 0) {
            const rest = cleaned.substring(maxLength);
            const closeIdx = rest.indexOf('$');
            if (closeIdx !== -1 && closeIdx < 35) {
                truncated += rest.substring(0, closeIdx + 1);
            } else {
                truncated += '$';
            }
        }
        return truncated + '...';
    }

    function finishQuiz() {
        stopTimer();
        
        if (state.isFinished) {
            navigateTo('results-view');
            return;
        }

        // Record time for the currently viewed question if not yet submitted
        if (state.questionEnteredAt && !state.submitted[state.currentQuestionIndex]) {
            const timeSpent = (Date.now() - state.questionEnteredAt) / 1000;
            state.questionTimes[state.currentQuestionIndex] = Math.round(timeSpent);
        }

        const prevPoints = state.userPoints;
        let attempted = 0;
        let correct = 0;

        state.quizQuestions.forEach((q, idx) => {
            if (state.submitted[idx]) {
                attempted++;
                const selectedIndex = state.answers[idx];
                if (selectedIndex !== null && q.options[selectedIndex].is_correct) {
                    correct++;
                }
            }
        });
        
        // Save points (User specific)
        const pointsKey = `enggtv_points_${state.user.username}`;
        localStorage.setItem(pointsKey, state.userPoints.toString());
        
        state.score = correct;
        const newPoints = state.userPoints;

        // Check for achievements
        ACHIEVEMENTS.forEach(ach => {
            if (prevPoints < ach.points && newPoints >= ach.points) {
                setTimeout(() => {
                    window.showToast('Milestone Unlocked! ��', ach.name, ach.icon);
                }, 1000);
            }
        });

        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
        
        // Prevent exploit: Only award "Flawless Victory" if the user actually finished the entire quiz
        const isQuizCompleted = attempted === state.quizQuestions.length && attempted > 0;
        if (accuracy >= 80 && isQuizCompleted && window.incrementQuestProgress) {
            window.incrementQuestProgress('perfect_quiz', 1);
        }
        if (state.currentSubject && state.currentSubject.id === 'srs-review' && window.incrementQuestProgress) {
            window.incrementQuestProgress('srs_review', 1);
        }

        // Save to recent activity
        const activityTitle = state.isMockExam ? 'Mock Exam' : (state.currentTopic || (state.currentSubject ? state.currentSubject.name : 'Practice Drill'));
        const isActivityAdvanced = !state.isMockExam && localStorage.getItem('enggtv_advanced_mode') === 'true';

        // Broadcast to Live Peer Milestone Ticker
        if (attempted > 0 && typeof window.publishPeerMilestone === 'function') {
            const disc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
            let milestoneTitle = `Completed ${attempted}-Question Drill in ${activityTitle}`;
            if (accuracy >= 90) milestoneTitle = `Aced ${activityTitle} Drill (${accuracy}%) 🏆`;
            else if (accuracy >= 70) milestoneTitle = `Passed ${activityTitle} Drill (${accuracy}%)`;

            window.publishPeerMilestone({
                type: 'quiz_finish',
                title: milestoneTitle,
                detail: `${correct}/${attempted} correct questions in FE ${disc} practice`,
                discipline: disc
            });
        }
        const newActivity = {
            id: Date.now().toString(),
            title: activityTitle,
            score: correct,
            accuracy: accuracy,
            attempted: attempted,
            isMockExam: state.isMockExam,
            isAdvanced: isActivityAdvanced,
            timestamp: Date.now(),
            stateSnapshot: {
                quizQuestions: JSON.parse(JSON.stringify(state.quizQuestions)),
                answers: [...state.answers],
                submitted: [...state.submitted],
                flagged: [...state.flagged],
                confidence: [...state.confidence],
                questionTimes: [...state.questionTimes],
                currentSubject: JSON.parse(JSON.stringify(state.currentSubject)),
                currentTopic: state.currentTopic
            },
            minimalSnapshot: {
                isAdvanced: isActivityAdvanced,
                subjectId: state.currentSubject.id,
                topic: state.currentTopic,
                questions: state.quizQuestions.map(q => {
                    const sId = q.subjectId || state.currentSubject.id;
                    const masterList = (isActivityAdvanced ? ADVANCED_QUESTIONS : QUESTIONS)[sId] || [];
                    return {
                        sid: sId,
                        idx: masterList.findIndex(item => item.title === q.title)
                    };
                }),
                // Store answer indices relative to the MASTER list (stable), not the shuffled list
                answers: state.answers.map((ansIdx, qIdx) => {
                    if (ansIdx === null) return null;
                    return state.quizQuestions[qIdx].options[ansIdx].originalIndex;
                }),
                submitted: [...state.submitted],
                flagged: [...state.flagged],
                confidence: [...state.confidence],
                questionTimes: [...state.questionTimes]
            }
        };
        state.recentActivity.unshift(newActivity);
        
        // Strip huge stateSnapshot from older activities to save space
        state.recentActivity.forEach((act, idx) => {
            if (idx >= 5 && act.stateSnapshot) {
                delete act.stateSnapshot;
            }
        });

        if (state.recentActivity.length > 100) {
            state.recentActivity.pop();
        }
        const activityKey = `enggtv_recent_activity_${state.user.username}`;
        localStorage.setItem(activityKey, JSON.stringify(state.recentActivity));

        // Final Cloud Sync
        
        updateGamificationUI();
        if (typeof window.renderStudyCalendar === 'function') {
            window.renderStudyCalendar();
        }

        resTotal.textContent = state.quizQuestions.length;
        resAttempted.textContent = attempted;
        resCorrect.textContent = state.score;
        resAccuracy.textContent = `${accuracy}%`;
        resultsSubjectName.textContent = state.currentTopic || state.currentSubject.name;

        resultsQuestionMap.innerHTML = state.quizQuestions.map((q, idx) => {
            let statusClass = '';
            if (state.submitted[idx]) {
                const selectedIndex = state.answers[idx];
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
                state.currentQuestionIndex = parseInt(btn.getAttribute('data-index'));
                state.isFinished = true;
                navigateTo('quiz-view');
                loadQuestion();
            });
        });

        // Populate Detailed List
        resultsDetailedList.innerHTML = state.quizQuestions.map((q, idx) => {
            let status = 'unanswered';
            let icon = '○';
            if (state.submitted[idx]) {
                const selectedIndex = state.answers[idx];
                if (selectedIndex !== null && q.options[selectedIndex].is_correct) {
                    status = 'correct';
                    icon = '✓';
                } else {
                    status = 'wrong';
                    icon = '✗';
                }
            }
            
            // Keep LaTeX markers and truncate carefully without cutting math formulas in half
            let displayHeader = formatQuestionHeaderForReview(q.question, 100);
            
            // --- Performance Benchmarking ---
            const qStr = q.question.substring(0, 50);
            let hash = 0;
            for(let i=0; i<qStr.length; i++) hash = ((hash << 5) - hash) + qStr.charCodeAt(i);
            const peerTime = 40 + Math.abs(hash % 120); 
            const peerSuccess = 35 + Math.abs(hash % 50); 
            
            const userTime = state.questionTimes[idx] || 0;
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

        window.safeTypesetMath(resultsDetailedList ? [resultsDetailedList] : null);

        if (state.score === state.quizQuestions.length && state.quizQuestions.length > 0) {
            triggerConfetti();
        }

        document.querySelectorAll('.result-item').forEach(item => {
            item.addEventListener('click', () => {
                state.currentQuestionIndex = parseInt(item.getAttribute('data-index'));
                state.isFinished = true;
                navigateTo('quiz-view');
                loadQuestion();
            });
        });

        // ================================================================
        // SESSION AUTOPSY — Post-Quiz Performance Breakdown
        // ================================================================
        renderSessionAutopsy(attempted, correct, accuracy);

        // Save Progress
        if (!state.isMockExam) {
            updateProgress(state.currentSubject.id, attempted);
        }
        state.isFinished = true;
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

        const times = state.questionTimes;
        const totalTimeSec = times.reduce((a, b) => a + b, 0);
        const avgTimeSec = attempted > 0 ? (totalTimeSec / state.quizQuestions.length) : 0;
        const maxTime = Math.max(...times, 1);
        const fastestIdx = times.indexOf(Math.min(...times.filter(t => t > 0)));
        const slowestIdx = times.indexOf(Math.max(...times));

        // Build Confidence vs Accuracy matrix data with per-question tracking
        let matrix = { confRight: [], confWrong: [], unsureRight: [], unsureWrong: [] };
        state.quizQuestions.forEach((q, idx) => {
            if (!state.submitted[idx]) return;
            const selectedIndex = state.answers[idx];
            const isCorrect = selectedIndex !== null && q.options[selectedIndex].is_correct;
            const conf = state.confidence[idx] || 3;
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
                    ${state.quizQuestions.map((q, idx) => {
                        const t = times[idx] || 0;
                        const pct = Math.max(4, (t / maxTime) * 100);
                        const selectedIndex = state.answers[idx];
                        const isCorrect = state.submitted[idx] && selectedIndex !== null && q.options[selectedIndex].is_correct;
                        const isWrong = state.submitted[idx] && !isCorrect;
                        const barClass = !state.submitted[idx] ? 'bar-unanswered' : isCorrect ? 'bar-correct' : 'bar-wrong';
                        return `
                            <div class="hist-col" title="Q${idx+1}: ${t}s — ${!state.submitted[idx] ? 'Unanswered' : isCorrect ? 'Correct' : 'Wrong'}">
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
                state.currentQuestionIndex = qIdx;
                state.isFinished = true;
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
        if (!state.userProgress[compKey]) {
            state.userProgress[compKey] = { completed: 0 };
        }
        
        // Add newly completed questions to cumulative total
        state.userProgress[compKey].completed += newlyCompleted;
        
        // Cap at total questions (calculated from QUESTIONS object)
        const questionsInSubject = (getQuestionsSource()[subjectId] || []).length;
        if (state.userProgress[compKey].completed > questionsInSubject) {
            state.userProgress[compKey].completed = questionsInSubject;
        }

        const progressKey = `enggtv_progress_${state.user.username}`;
        localStorage.setItem(progressKey, JSON.stringify(state.userProgress));
        
        renderSubjects();
    }

    // Timer Utilities
    function startTimer() {
        state.secondsElapsed = 0;
        if (state.isMockExam) {
            if (state.isFullFEExam) {
                state.secondsRemaining = 160 * 60; // 160 minutes (Half of 5hr 20m)
            } else {
                state.secondsRemaining = 60 * 60; // 60 minutes for standard mock
            }
            quizTimer.classList.remove('blinking-timer');
            updateTimerDisplay();
        } else {
            updateTimerDisplay();
        }
        
        state.timer = setInterval(() => {
            if (state.isMockExam) {
                state.secondsRemaining--;
                updateTimerDisplay();
                
                if (state.secondsRemaining <= 300 && state.secondsRemaining > 0) {
                    quizTimer.classList.add('blinking-timer');
                } else {
                    quizTimer.classList.remove('blinking-timer');
                }
                
                if (state.secondsRemaining <= 0) {
                    stopTimer();
                    alert("Time is up! The mock exam has ended.");
                    
                    // Force finish
                    state.isFinished = true;
                    finishQuiz();
                }
            } else {
                state.secondsElapsed++;
                updateTimerDisplay();
            }
        }, 1000);
    }

    function stopTimer() {
        clearInterval(state.timer);
        quizTimer.classList.remove('blinking-timer');
    }

    function updateTimerDisplay() {
        if (state.isMockExam) {
            quizTimer.textContent = formatTime(state.secondsRemaining);
        } else {
            quizTimer.textContent = formatTime(state.secondsElapsed);
        }
    }

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    function updateGamificationUI() {
        const points = state.userPoints;

        const pointsDisplay = document.getElementById('user-points-display');
        const levelDisplay = document.getElementById('user-level-display');
        const levelBadgeDisplay = document.getElementById('level-badge-display');
        
        if (pointsDisplay) pointsDisplay.textContent = points;
        
        // Mock levels
        let levelName = 'Apprentice';
        if (points >= 1000) levelName = 'Exam Ready';
        else if (points >= 500) levelName = 'Master';
        else if (points >= 250) levelName = 'Lead Engineer';
        else if (points >= 100) levelName = 'Senior Engineer';
        else if (points >= 50) levelName = 'Dedicated';
        
        if (levelDisplay) levelDisplay.textContent = levelName;
        if (levelBadgeDisplay) levelBadgeDisplay.textContent = levelName;


        const annSection = document.getElementById('announcement-section');
        const annLocked = document.getElementById('announcement-locked');
        const pointsProgress = document.getElementById('points-progress-bar');
        const pointsNeededText = document.getElementById('points-needed-text');
        const settingsPoints = document.getElementById('settings-points-display');
        const pointsToNextLevel = document.getElementById('points-to-next-level');

        // Use the global ANNOUNCEMENT_CONFIG defined at the top of the file
        const isAnnouncementExpired = new Date() > new Date(ANNOUNCEMENT_CONFIG.expiryDate);

        const required = 50;

        // Note: Removed state.user.tier === 'premium' bypass to make point-based progression meaningful
        const isUnlocked = points >= required || (state.user.username && state.user.username.toLowerCase() === 'admin') || state.user.role === 'admin';

        if (annSection && annLocked) {
            if (isAnnouncementExpired) {
                // If expired, completely hide the announcement cards from the dashboard
                annSection.classList.add('hidden');
                annLocked.classList.add('hidden');
            } else {
                // Dynamically update dashboard announcement title
                const annTitleDisplay = annSection.querySelector('.font-body-sm');
                if (annTitleDisplay) annTitleDisplay.textContent = `Next Lecture: ${ANNOUNCEMENT_CONFIG.title.split(':')[0]}`; // Keep it short for dashboard
                if (isUnlocked) {
                    annSection.classList.remove('hidden');
                    annLocked.classList.add('hidden');
                } else {
                    annSection.classList.add('hidden');
                    annLocked.classList.remove('hidden');
                    
                    if (pointsProgress) {
                        const percent = Math.min(100, (points / required) * 100);
                        pointsProgress.style.width = `${percent}%`;
                    }
                    if (pointsNeededText) {
                        pointsNeededText.textContent = `${points}/${required} Points`;
                    }
                }
            }
        }
        
        // Handle the actual announcements view content based on expiry
        const annPosterContainer = document.querySelector('.announcement-poster-container');
        if (annPosterContainer) {
            if (isAnnouncementExpired && !annPosterContainer.dataset.expiredHandled) {
                annPosterContainer.dataset.expiredHandled = 'true';
                annPosterContainer.innerHTML = `
                    <div class="glass-card rounded-[32px] p-12 text-center border border-white/20 shadow-xl flex flex-col items-center justify-center">
                        <div class="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-[28px] flex items-center justify-center mb-6 shadow-inner">
                            <span class="material-symbols-outlined text-slate-400 text-4xl">event_busy</span>
                        </div>
                        <h3 class="font-display-lg text-2xl text-slate-800 dark:text-white mb-2">No Upcoming Events</h3>
                        <p class="text-slate-500 dark:text-slate-400 max-w-sm mx-auto">There are currently no scheduled live lectures. We will notify you when the next revision series is announced!</p>
                    </div>
                `;
            } else if (!isAnnouncementExpired && annPosterContainer.dataset.expiredHandled !== 'false') {
                // Dynamically render the active poster from config
                annPosterContainer.dataset.expiredHandled = 'false';
                annPosterContainer.innerHTML = `
                    <div class="glass-card overflow-hidden rounded-[32px] border-4 border-white/20 shadow-2xl relative">
                        <iframe id="announcement-poster-img" src="${ANNOUNCEMENT_CONFIG.posterUrl}" allow="autoplay" class="w-full h-auto min-h-[480px] border-0 transition-transform duration-700 group-hover:scale-105"></iframe>
                        <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8 pointer-events-none">
                            <p class="text-white font-display-lg text-2xl drop-shadow-md">${ANNOUNCEMENT_CONFIG.dateLabel}</p>
                            <p class="text-white/90 font-body-sm drop-shadow-md">${ANNOUNCEMENT_CONFIG.title}</p>
                        </div>
                    </div>
                    <div class="mt-8 flex justify-center">
                        <button class="bg-secondary text-white font-bold px-10 py-4 rounded-2xl shadow-lg shadow-pink-500/20 active:scale-95 transition-all hover:brightness-110 hover:shadow-pink-500/40" onclick="alert('${ANNOUNCEMENT_CONFIG.registrationMessage}')">
                            Register for Lecture
                        </button>
                    </div>
                `;
            }
        }

        const examUnlocked = document.getElementById('exam-unlocked');
        const examLocked = document.getElementById('exam-locked');
        const navExam = document.getElementById('nav-exam');
        const milestoneBadge = document.getElementById('milestone-badge');
        const dashboardMilestoneBadge = document.getElementById('dashboard-milestone-badge');
        
        const examRequired = 100;
        // Note: Removed state.user.tier === 'premium' bypass to make point-based progression meaningful
        const isExamUnlocked = points >= examRequired || (state.user.username && state.user.username.toLowerCase() === 'admin') || state.user.role === 'admin';
        
        // Handle Exam Menu Visibility (Nav Item)
        if (navExam) {
            if (isExamUnlocked) {
                navExam.classList.remove('hidden');
            } else {
                navExam.classList.add('hidden');
            }
        }

        // Handle Milestone Badges
        const currentMilestone = [...ACHIEVEMENTS].reverse().find(a => points >= a.points && a.points >= 100);
        
        if (milestoneBadge) {
            if (currentMilestone) {
                milestoneBadge.textContent = currentMilestone.name;
                milestoneBadge.classList.remove('hidden');
            } else {
                milestoneBadge.classList.add('hidden');
            }
        }
        if (dashboardMilestoneBadge) {
            if (currentMilestone) {
                dashboardMilestoneBadge.textContent = currentMilestone.name;
                dashboardMilestoneBadge.classList.remove('hidden');
            } else {
                dashboardMilestoneBadge.classList.add('hidden');
            }
        }
        
        if (examUnlocked && examLocked) {
            if (isExamUnlocked) {
                examUnlocked.classList.remove('hidden');
                examLocked.classList.add('hidden');
            } else {
                examUnlocked.classList.add('hidden');
                examLocked.classList.remove('hidden');
                
                const examProgress = document.getElementById('exam-points-progress-bar');
                const examNeededText = document.getElementById('exam-points-needed-text');
                
                if (examProgress) {
                    const percent = Math.min(100, (points / examRequired) * 100);
                    examProgress.style.width = `${percent}%`;
                }
                if (examNeededText) {
                    examNeededText.textContent = `${points}/${examRequired} Points`;
                }
            }
        }

        if (settingsPoints) {
            settingsPoints.textContent = `${points} Points`;
        }

        // Advanced Mode lock/unlock state handling
        const toggleAdvanced = document.getElementById('toggle-advanced-mode');
        const advancedStatusText = document.getElementById('advanced-mode-status-text');
        if (toggleAdvanced && advancedStatusText) {
            if (points < 250) {
                toggleAdvanced.disabled = true;
                toggleAdvanced.checked = false;
                localStorage.setItem('enggtv_advanced_mode', 'false');
                advancedStatusText.textContent = "Locked (Requires 250 points)";
            } else {
                toggleAdvanced.disabled = false;
                const isAdvancedActive = localStorage.getItem('enggtv_advanced_mode') === 'true';
                toggleAdvanced.checked = isAdvancedActive;
                advancedStatusText.textContent = isAdvancedActive ? "Active" : "Ready to activate";
            }
        }

        // --- Dynamic Streak Calculation ---
        // Counts consecutive calendar days (today + backwards) that had activity
        const streakDisplay = document.getElementById('settings-streak-display');
        const streakSubtitle = document.getElementById('settings-streak-subtitle');
        if (streakDisplay) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Build a Set of unique day strings from recentActivity timestamps
            const activeDays = new Set(
                (state.recentActivity || []).map(a => {
                    const d = new Date(a.timestamp);
                    d.setHours(0, 0, 0, 0);
                    return d.getTime();
                })
            );

            // Walk backwards from today counting consecutive active days
            let streak = 0;
            let checkDay = today.getTime();
            while (activeDays.has(checkDay)) {
                streak++;
                checkDay -= 86400000; // subtract one day
            }
            // If today has no activity yet, also check if yesterday does (streak still alive)
            if (streak === 0) {
                const yesterday = today.getTime() - 86400000;
                let checkYesterday = yesterday;
                while (activeDays.has(checkYesterday)) {
                    streak++;
                    checkYesterday -= 86400000;
                }
            }

            streakDisplay.textContent = `${streak} ${streak === 1 ? 'Day' : 'Days'}`;
            if (streakSubtitle) {
                if (streak === 0) {
                    streakSubtitle.textContent = 'Start today!';
                } else if (streak < 3) {
                    streakSubtitle.textContent = 'Good start!';
                } else if (streak < 7) {
                    streakSubtitle.textContent = 'Building momentum!';
                } else {
                    streakSubtitle.textContent = `${streak} days strong ��`;
                }
            }
        }

        // --- Dynamic Courses Calculation ---
        // Counts subjects with any progress vs total subjects available
        const coursesDisplay = document.getElementById('settings-courses-display');
        const coursesSubtitle = document.getElementById('settings-courses-subtitle');
        if (coursesDisplay) {
            const totalSubjects = state.subjects.length;
            const startedSubjects = state.subjects.filter(s => {
                const prog = state.userProgress[s.id];
                return prog && prog.completed > 0;
            }).length;

            coursesDisplay.textContent = `${startedSubjects} Started`;
            if (coursesSubtitle) {
                coursesSubtitle.textContent = `of ${totalSubjects} total`;
            }
        }
        const levelBadge = document.querySelector('.text-right p:first-child');
        if (levelBadge) {
            let level = 1;
            if (points >= 1000) level = 8;
            else if (points >= 500) level = 7;
            else if (points >= 250) level = 6;
            else if (points >= 100) level = 5;
            else if (points >= 50) level = 4;
            else if (points >= 25) level = 3;
            else if (points >= 10) level = 2;
            levelBadge.textContent = `Level ${level}`;
        }

        // Update next milestone display using the already declared pointsToNextLevel
        if (pointsToNextLevel) {
            const nextMilestone = ACHIEVEMENTS.find(a => a.points > points);
            if (nextMilestone) {
                pointsToNextLevel.textContent = `${nextMilestone.points - points} pts to ${nextMilestone.name}`;
                pointsToNextLevel.className = "text-[10px] font-medium text-outline";
            } else {
                pointsToNextLevel.textContent = "Max Level Reached!";
                pointsToNextLevel.className = "text-[10px] font-medium text-green-500";
            }
        }
    
        // Check FE Simulator unlock state whenever gamification UI updates
        if (window.checkFESimulatorUnlock) window.checkFESimulatorUnlock();
    }
    window.updateGamificationUI = updateGamificationUI;

    window.switchExamTab = function(tabName) {
        const simView = document.getElementById('exam-view-simulator');
        const miniView = document.getElementById('exam-view-mini');
        const simBtn = document.getElementById('tab-btn-simulator');
        const miniBtn = document.getElementById('tab-btn-mini');
        
        if (tabName === 'simulator') {
            simView.classList.remove('hidden');
            simView.classList.add('flex');
            miniView.classList.add('hidden');
            miniView.classList.remove('flex');
            
            simBtn.className = "px-6 py-2.5 rounded-xl text-sm font-bold transition-all bg-white dark:bg-slate-700 shadow text-on-surface dark:text-white";
            miniBtn.className = "px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all";
        } else {
            miniView.classList.remove('hidden');
            miniView.classList.add('flex');
            simView.classList.add('hidden');
            simView.classList.remove('flex');
            
            miniBtn.className = "px-6 py-2.5 rounded-xl text-sm font-bold transition-all bg-white dark:bg-slate-700 shadow text-on-surface dark:text-white";
            simBtn.className = "px-6 py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-all";
        }
    };


    // Settings Functionality
    const btnAccount = document.getElementById('btn-account-info');
    const btnNotif = document.getElementById('btn-notifications');
    const toggleDark = document.getElementById('toggle-dark-mode');
    const btnSub = document.getElementById('btn-subscription');
    const btnSupport = document.getElementById('btn-support');
    const btnLogout = document.getElementById('btn-logout');

    if (btnAccount) btnAccount.addEventListener('click', () => { navigateTo('account-info-view'); initAccountInfo(); applyAvatar(); });
    if (btnSupport) btnSupport.addEventListener('click', () => { navigateTo('support-view'); renderAdminInbox(); });
    
    // Account Info View Logic
    const backToSettingsBtn = document.getElementById('back-to-settings');
    const saveAccountBtn = document.getElementById('save-account-info');
    const dateJoinedDisplay = document.getElementById('date-joined-display');
    const userDisciplineDisplay = document.getElementById('user-discipline-display');
    const backFromSupportBtn = document.getElementById('back-from-support');

    if (backToSettingsBtn) backToSettingsBtn.addEventListener('click', () => navigateTo('settings'));
    if (backFromSupportBtn) backFromSupportBtn.addEventListener('click', () => navigateTo('settings'));

    function initAccountInfo() {
        // Force-show the discipline selector for ALL users regardless of CSS classes
        const disciplineSelector = document.getElementById('admin-discipline-selector');
        if (disciplineSelector) {
            disciplineSelector.classList.remove('hidden');
            disciplineSelector.style.display = 'block';
        }

        // Display Discipline (Static)
        const savedDiscipline = localStorage.getItem('enggtv_discipline') || state.user.discipline || 'Mechanical';
        if (userDisciplineDisplay) userDisciplineDisplay.textContent = savedDiscipline;
        if (document.getElementById('discipline-profile-display')) {
            document.getElementById('discipline-profile-display').textContent = savedDiscipline;
        }

        // Pre-select current discipline in the dropdown
        const selectDisc = document.getElementById('select-discipline');
        if (selectDisc) {
            selectDisc.value = savedDiscipline;
        }

        // Load/Set Date Joined
        let dateJoined = localStorage.getItem('enggtv_date_joined');
        if (!dateJoined) {
            const now = new Date();
            dateJoined = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            localStorage.setItem('enggtv_date_joined', dateJoined);
        }
        if (dateJoinedDisplay) dateJoinedDisplay.textContent = dateJoined;
    }

    const selectDiscipline = document.getElementById('select-discipline');
    if (selectDiscipline) {
        selectDiscipline.addEventListener('change', (e) => {
            const newDiscipline = e.target.value;
            localStorage.setItem('enggtv_discipline', newDiscipline);
            state.user.discipline = newDiscipline;
            try {
                const localUser = JSON.parse(localStorage.getItem('enggtv_user')) || {};
                localUser.discipline = newDiscipline;
                localStorage.setItem('enggtv_user', JSON.stringify(localUser));
            } catch (err) {}
            
            // Reload subjects
            if (newDiscipline === 'Mechanical') state.subjects = MECHANICAL_SUBJECTS;
            else if (newDiscipline === 'Civil' || newDiscipline === 'Civil Engineering') state.subjects = CIVIL_SUBJECTS;
            else if (newDiscipline === 'Chemical') state.subjects = CHEMICAL_SUBJECTS;
            else if (newDiscipline === 'Environmental') state.subjects = ENVIRONMENTAL_SUBJECTS;
            else if (newDiscipline === 'Industrial') state.subjects = INDUSTRIAL_SUBJECTS;
            else if (newDiscipline === 'Electrical and Computer') state.subjects = ELECTRICAL_COMPUTER_SUBJECTS;
            else state.subjects = OTHER_SUBJECTS;
            
            updateUIForTier();
            renderSubjects();
            if (typeof renderNotes === 'function') renderNotes();
            updateDashboardStats();
            updateGamificationUI();
            if (typeof window.updateMotivationWidgets === 'function') {
                window.updateMotivationWidgets();
            }
            if (typeof window.updateAlumniWidget === 'function') {
                window.updateAlumniWidget();
            }
             // Sync discipline change to cloud
            
            // Update labels in account info view immediately
            if (userDisciplineDisplay) userDisciplineDisplay.textContent = newDiscipline;
            if (document.getElementById('discipline-profile-display')) {
                document.getElementById('discipline-profile-display').textContent = newDiscipline;
            }
            
            alert(`Discipline changed to ${newDiscipline}. Content updated.`);
        });
    }

    initAccountInfo();
    if (btnNotif) btnNotif.addEventListener('click', () => alert('Notification Preferences coming soon!'));
    
    // Contact Form Logic
    const contactForm = document.getElementById('contact-form');

    // ---- EmailJS config -------------------------------------------------------
    // Dashboard: https://dashboard.emailjs.com
    // Emails are delivered to: admin@engg.tv
    const EMAILJS_SERVICE_ID  = 'service_flquaml';
    const EMAILJS_TEMPLATE_ID = 'template_a97ngqw';
    // Public key is initialized in index.html <head> via emailjs.init()
    // ---------------------------------------------------------------------------

    if (contactForm) {
        // Auto-fill the name field with the logged-in username
        const nameField = document.getElementById('contact-name');
        if (nameField && state.user.username && state.user.username !== 'guest') {
            nameField.value = state.user.username === 'demo' ? 'Alex' : state.user.username;
        }

        // Character counter
        const msgField = document.getElementById('contact-message');
        const charCounter = document.getElementById('char-counter');
        if (msgField && charCounter) {
            msgField.addEventListener('input', () => {
                const len = msgField.value.length;
                charCounter.textContent = `${len} / 500`;
                charCounter.classList.toggle('text-secondary', len > 450);
                charCounter.classList.toggle('text-slate-400', len <= 450);
            });
        }

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameVal    = document.getElementById('contact-name')?.value?.trim() || state.user.username;
            const emailVal   = document.getElementById('contact-email')?.value?.trim() || 'Not Provided';
            const subjectVal = document.getElementById('contact-subject')?.value;
            const msgVal     = document.getElementById('contact-message')?.value?.trim();
            const btnIcon    = document.getElementById('send-btn-icon');
            const btnText    = document.getElementById('send-btn-text');
            const btn        = document.getElementById('btn-send-message');

            if (!msgVal) return;

            // Loading state
            btn.disabled = true;
            if (btnIcon) { btnIcon.textContent = 'refresh'; btnIcon.style.animation = 'spin 1s linear infinite'; }
            if (btnText) btnText.textContent = 'Sending...';

            try {
                // Try to send via EmailJS if properly configured
                const isEmailJSConfigured = EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID'
                    && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID'
                    && typeof emailjs !== 'undefined';

                if (isEmailJSConfigured) {
                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        from_name:    nameVal,
                        from_user:    state.user.username,
                        from_email:   emailVal,
                        subject:      subjectVal,
                        message:      msgVal,
                        reply_to:     emailVal !== 'Not Provided' ? emailVal : 'admin@engg.tv',
                        sent_at:      new Date().toLocaleString(),
                        discipline:   localStorage.getItem('enggtv_discipline') || 'Unknown',
                        user_points:  state.userPoints
                    });
                } else {
                    // Fallback: open mailto with pre-filled content so the message still reaches admin
                    const mailtoBody  = encodeURIComponent(`From: ${nameVal} (${state.user.username})\nEmail: ${emailVal}\nSubject: ${subjectVal}\n\n${msgVal}`);
                    const mailtoLink  = `mailto:admin@engg.tv?subject=${encodeURIComponent('[ENGG.tv App] ' + subjectVal)}&body=${mailtoBody}`;
                    window.open(mailtoLink, '_blank');
                }

                window.showToast('Message Sent! ✅', 'The admin will get back to you soon.', 'forum');
                contactForm.reset();
                if (charCounter) charCounter.textContent = '0 / 500';

                // Success confetti
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 150,
                        spread: 70,
                        origin: { y: 0.6 },
                        colors: ['#FF006E', '#FDA60A', '#720026']
                    });
                }

                // Navigate back after a short delay
                setTimeout(() => navigateTo('settings'), 2500);

            } catch (error) {
                console.error('Contact form error:', error);
                window.showToast('Send Failed', 'Please email us directly at admin@engg.tv', 'error');
            } finally {
                btn.disabled = false;
                if (btnIcon) { btnIcon.textContent = 'send'; btnIcon.style.animation = ''; }
                if (btnText) btnText.textContent = 'Send Message';
            }
        });
    }

    if (btnSub) btnSub.addEventListener('click', () => navigateTo('plans-view'));
    const logoutModal = document.getElementById('logout-confirm-modal');
    const btnLogoutCancel = document.getElementById('btn-logout-cancel');
    const btnLogoutConfirm = document.getElementById('btn-logout-confirm');

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            if (logoutModal) {
                logoutModal.classList.remove('hidden');
                logoutModal.classList.add('flex');
            }
        });
    }

    if (btnLogoutCancel) {
        btnLogoutCancel.addEventListener('click', () => {
            if (logoutModal) {
                logoutModal.classList.add('hidden');
                logoutModal.classList.remove('flex');
            }
        });
    }

    if (btnLogoutConfirm) {
        btnLogoutConfirm.addEventListener('click', async () => {
            // Preserve tracking, theme, and settings
            const keysToPreserve = ['enggtv_theme', 'enggtv_question_stats', 'enggtv_advanced_mode', 'enggtv_has_reviewed_app'];
            const preservedData = {};
            keysToPreserve.forEach(key => {
                preservedData[key] = localStorage.getItem(key);
            });
            
            // Clear all user session data
            if (window.syncToFirebase) await window.syncToFirebase();
            localStorage.clear();
            
            // Restore preserved keys
            keysToPreserve.forEach(key => {
                if (preservedData[key] !== null) {
                    localStorage.setItem(key, preservedData[key]);
                }
            });
            
            if (window.firebase && window.firebase.auth) {
                try {
                    await window.firebase.auth().signOut();
                } catch (e) {
                    console.error("Firebase sign out error:", e);
                }
            }
            
            window.location.href = 'login.html';
        });
    }

    if (logoutModal) {
        logoutModal.addEventListener('click', (e) => {
            if (e.target === logoutModal) {
                logoutModal.classList.add('hidden');
                logoutModal.classList.remove('flex');
            }
        });
    }

    if (toggleDark) {
        // Initialize toggle state based on body classes
        toggleDark.checked = document.body.classList.contains('dark-theme') || document.documentElement.classList.contains('dark');
        toggleDark.addEventListener('change', (e) => {
            if(e.target.checked) {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark-theme');
                localStorage.setItem('enggtv_theme', 'dark');
            } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark-theme');
                localStorage.setItem('enggtv_theme', 'light');
            }
        });
    }

    const toggleAdvanced = document.getElementById('toggle-advanced-mode');
    if (toggleAdvanced) {
        toggleAdvanced.addEventListener('change', (e) => {
            const isActive = e.target.checked;
            localStorage.setItem('enggtv_advanced_mode', isActive ? 'true' : 'false');
            
            const advancedStatusText = document.getElementById('advanced-mode-status-text');
            if (advancedStatusText) {
                advancedStatusText.textContent = isActive ? "Active" : "Ready to activate";
            }
            
            // Re-render subjects and update stats since total questions / progress counts change
            renderSubjects();
            updateDashboardStats();
        });
    }


    const ACHIEVEMENTS = [
        { id: 'first_point', name: 'First Step', points: 1, icon: 'bolt', description: 'Earn your first point.' },
        { id: 'consistent', name: 'Consistent Learner', points: 10, icon: 'auto_stories', description: 'Reach 10 points.' },
        { id: 'dedicated', name: 'Dedicated Engineer', points: 25, icon: 'engineering', description: 'Reach 25 points.' },
        { id: 'announcement_unlocked', name: 'Insider Access', points: 50, icon: 'campaign', description: 'Unlock the Announcements section.' },
        { id: 'scholar', name: 'Senior Engineer', points: 100, icon: 'school', description: 'Unlock the full-length Mock Exam simulation.' },
        { id: 'master', name: 'Lead Engineer', points: 250, icon: 'workspace_premium', description: 'Unlock Advanced Mode and command a strong grasp of FE fundamentals.' },
        { id: 'senior', name: 'Concept Master', points: 500, icon: 'military_tech', description: 'Exhibiting advanced mastery of core engineering principles.' },
        { id: 'professional', name: 'Official Exam Ready', points: 1000, icon: 'verified', description: 'Our Professors say Go ahead and be successful in your actual exam' }
    ];

    function renderAchievements() {
        const list = document.getElementById('achievements-list');
        const totalPointsDisplay = document.getElementById('achievements-total-points');
        if (!list || !totalPointsDisplay) return;

        totalPointsDisplay.textContent = `${state.userPoints} Points`;
        
        list.className = "grid grid-cols-2 gap-4 mt-4";
        list.innerHTML = '';

        ACHIEVEMENTS.forEach(ach => {
            const isUnlocked = state.userPoints >= ach.points;
            const statusClass = isUnlocked ? 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border-amber-200 dark:border-amber-800/50 shadow-lg shadow-amber-500/10' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 opacity-60 grayscale';
            const iconColor = isUnlocked ? 'text-amber-500 drop-shadow-md' : 'text-slate-400';
            const textTitle = isUnlocked ? 'text-amber-900 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400';
            
            list.innerHTML += `
                <div class="flex flex-col items-center text-center gap-3 p-5 rounded-[24px] border ${statusClass} transition-all relative overflow-hidden">
                    ${isUnlocked ? '<div class="absolute -top-4 -right-4 w-16 h-16 bg-white/40 dark:bg-white/5 blur-xl rounded-full pointer-events-none"></div>' : ''}
                    <div class="w-14 h-14 rounded-2xl ${isUnlocked ? 'bg-white dark:bg-slate-800 shadow-inner' : 'bg-slate-200 dark:bg-slate-700'} flex items-center justify-center shrink-0 z-10">
                        <span class="material-symbols-outlined ${iconColor} text-3xl" style="font-variation-settings:'FILL' ${isUnlocked ? 1 : 0};">${ach.icon}</span>
                    </div>
                    <div class="z-10 w-full">
                        <h5 class="font-black ${textTitle} text-xs mb-1.5 leading-tight w-full break-words">${ach.name}</h5>
                        <span class="text-[9px] font-black ${isUnlocked ? 'bg-amber-200 dark:bg-amber-800/60 text-amber-800 dark:text-amber-200' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'} px-2 py-0.5 rounded-full uppercase tracking-widest mb-2 inline-block">${ach.points} pts</span>
                        <p class="text-[9px] text-slate-500 dark:text-slate-400 leading-tight uppercase tracking-wider">${ach.description}</p>
                    </div>
                </div>
            `;
        });
    }

    const btnPointsInfo = document.getElementById('btn-points-info');
    const backFromAchievements = document.getElementById('back-from-achievements');

    if (btnPointsInfo) btnPointsInfo.addEventListener('click', () => navigateTo('achievements-view'));
    if (backFromAchievements) backFromAchievements.addEventListener('click', () => navigateTo('settings'));

    // ============================================================
    // B-3: Avatar Picker Logic
    // ============================================================
    const AVATAR_PRESETS = [
        { id: 'scholar',   emoji: '🎓', gradient: 'linear-gradient(135deg, #FDA60A, #FF006E)',   label: 'Scholar'   },
        { id: 'engineer',  emoji: '⚙️',  gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',   label: 'Engineer'  },
        { id: 'scientist', emoji: '🔬', gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',   label: 'Scientist' },
        { id: 'architect', emoji: '📐', gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',   label: 'Architect' },
        { id: 'pioneer',   emoji: '🚀', gradient: 'linear-gradient(135deg, #EF4444, #F97316)',   label: 'Pioneer'   },
    ];

    const MOCK_LEADERBOARD = [
        { username: 'Sara', points: 482, discipline: 'Civil', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=sara', trend: 'up', streak: 12 },
        { username: 'MikeEng', points: 395, discipline: 'Mechanical', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=mike', trend: 'down', streak: 5 },
        { username: 'Julia', points: 320, discipline: 'Civil', country: 'Egypt', avatar: 'https://i.pravatar.cc/150?u=julia', trend: 'up', streak: 8 },
        { username: 'Tom', points: 285, discipline: 'Mechanical', country: 'United Arab Emirates', avatar: 'https://i.pravatar.cc/150?u=tom', trend: 'same', streak: 3 },
        { username: 'Elena', points: 210, discipline: 'Mechanical', country: 'India', avatar: 'https://i.pravatar.cc/150?u=elena', trend: 'up', streak: 15 },
        { username: 'David', points: 195, discipline: 'Other', country: 'United Kingdom', avatar: 'https://i.pravatar.cc/150?u=david', trend: 'down', streak: 2 },
        { username: 'Chris', points: 150, discipline: 'Mechanical', country: 'Australia', avatar: 'https://i.pravatar.cc/150?u=chris', trend: 'up', streak: 4 },
        { username: 'Emma', points: 120, discipline: 'Other', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=emma', trend: 'same', streak: 0 },
        { username: 'Ryan', points: 95, discipline: 'Civil', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=ryan', trend: 'down', streak: 1 },
        { username: 'Li Wei', points: 512, discipline: 'Electrical and Computer', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=liwei', trend: 'up', streak: 18 },
        { username: 'Amina', points: 430, discipline: 'Chemical', country: 'Egypt', avatar: 'https://i.pravatar.cc/150?u=amina', trend: 'up', streak: 10 },
        { username: 'Lucas', points: 365, discipline: 'Environmental', country: 'Australia', avatar: 'https://i.pravatar.cc/150?u=lucas', trend: 'down', streak: 7 },
        { username: 'Fatima', points: 310, discipline: 'Industrial', country: 'United Arab Emirates', avatar: 'https://i.pravatar.cc/150?u=fatima', trend: 'same', streak: 6 },
        { username: 'Carlos', points: 260, discipline: 'Civil', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=carlos', trend: 'up', streak: 9 },
        { username: 'Priya', points: 225, discipline: 'Electrical and Computer', country: 'India', avatar: 'https://i.pravatar.cc/150?u=priya', trend: 'up', streak: 14 },
        { username: 'Stefan', points: 180, discipline: 'Mechanical', country: 'United Kingdom', avatar: 'https://i.pravatar.cc/150?u=stefan', trend: 'down', streak: 3 },
        { username: 'Yuki', points: 145, discipline: 'Chemical', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=yuki', trend: 'up', streak: 5 },
        { username: 'Chloe', points: 115, discipline: 'Environmental', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=chloe', trend: 'same', streak: 2 },
        { username: 'Omar', points: 88, discipline: 'Electrical and Computer', country: 'Egypt', avatar: 'https://i.pravatar.cc/150?u=omar', trend: 'up', streak: 4 },
        { username: 'Sophia', points: 75, discipline: 'Industrial', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=sophia', trend: 'down', streak: 1 },
        { username: 'Daniel', points: 60, discipline: 'Other', country: 'United Kingdom', avatar: 'https://i.pravatar.cc/150?u=daniel', trend: 'same', streak: 0 },
        { username: 'Mateo', points: 45, discipline: 'Civil', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=mateo', trend: 'up', streak: 3 },
        { username: 'Hannah', points: 30, discipline: 'Mechanical', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=hannah', trend: 'up', streak: 2 }
    ];

    async function renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        // Display a high-quality loading spinner matching the premium design
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                <div class="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-xs font-bold uppercase tracking-widest">Syncing Global Standings...</p>
            </div>
        `;

        let realUsers = [];
        let firestoreError = null;
        
        try {
            if (window.firebaseDb) {
                // Fetch all users to ensure we don't miss legacy accounts that only have 'points' instead of 'userPoints'
                // This resolves the missing 22 users issue (76 total users vs 54).
                const snapshot = await window.firebaseDb.collection("users").limit(1000).get();
                if (!snapshot.empty) {
                    realUsers = [];
                    snapshot.forEach(doc => {
                        const data = doc.data();
                        if (data.username) {
                            realUsers.push({
                                username: data.username,
                                points: (data.userPoints !== undefined ? data.userPoints : data.points) || 0,
                                discipline: data.discipline || 'Other',
                                country: data.country || 'Other',
                                avatar: data.avatar || null,
                                profilePic: data.profilePic || null,
                                trend: data.trend || 'same',
                                streak: data.streak || 0
                            });
                        }
                    });
                    
                    // We will sort and trim AFTER deduplicating below.
                }
            }
        } catch (e) {
            console.error("Failed to fetch leaderboard from Firestore", e);
            firestoreError = e.message;
        }

        const userCountry = state.user.country || 'Other';
        const userStreak = calculateStreak();

        // Add current user entry
        const currentUserData = {
            username: state.user.username === 'demo' ? 'You (Alex)' : `You (${state.user.username})`,
            points: state.userPoints,
            discipline: localStorage.getItem('enggtv_discipline') || 'FE Candidate',
            country: userCountry,
            isCurrentUser: true,
            trend: 'up',
            streak: userStreak,
            avatar: localStorage.getItem('enggtv_avatar') || null,
            profilePic: localStorage.getItem('enggtv_profile_pic') || null
        };

        // Remove the current user from fetched list (re-added below with "You (...)" label)
        const currentUsername = state.user.username;
        const filteredRealUsers = realUsers.filter(u =>
            u.username !== currentUsername && !u.username.startsWith('You (')
        );

        // Deduplicate by username (case-insensitive), keep highest points
        const uniqueUsersMap = new Map();
        filteredRealUsers.forEach(u => {
            const key = u.username.toLowerCase();
            if (!uniqueUsersMap.has(key) || u.points > uniqueUsersMap.get(key).points) {
                uniqueUsersMap.set(key, u);
            }
        });
        const deduplicatedRealUsers = Array.from(uniqueUsersMap.values());




        // If Firestore threw an error, show it in the UI clearly
        if (firestoreError) {
            list.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                    <span class="material-symbols-outlined text-4xl text-red-400">cloud_off</span>
                    <p class="text-sm font-bold text-red-500">Could not load standings</p>
                    <p class="text-xs text-slate-400 text-center px-4">Firestore error: ${firestoreError}</p>
                    <p class="text-xs text-slate-400 text-center px-4">Check Firestore security rules — the leaderboard query requires read access to the <code class="bg-slate-100 px-1 rounded">users</code> collection.</p>
                    <button onclick="renderLeaderboard()" class="mt-2 text-xs font-bold text-primary underline">Retry</button>
                </div>
            `;
            return;
        }

        // Do not fall back to dummy users. If offline and cache is empty, only show the current user.
        const baseUsers = deduplicatedRealUsers;
        let allUsers = [...baseUsers, currentUserData];

        // Sort by points descending
        allUsers.sort((a, b) => b.points - a.points);

        // Take top 500
        const top500 = allUsers.slice(0, 500);

        const isAdmin = state.user.username && state.user.username.toLowerCase() === 'admin';

        list.innerHTML = top500.map((user, index) => {
            const rank = index + 1;
            let rankBadge = '';
            if (rank === 1) rankBadge = 'bg-amber-400 text-white';
            else if (rank === 2) rankBadge = 'bg-slate-300 text-slate-700';
            else if (rank === 3) rankBadge = 'bg-amber-600/60 text-white';
            else rankBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-400';

            const trendIcon = user.trend === 'up' ? 'trending_up' : (user.trend === 'down' ? 'trending_down' : 'remove');
            const trendColor = user.trend === 'up' ? 'text-green-500' : (user.trend === 'down' ? 'text-red-500' : 'text-slate-400');

            let displayName = user.username;
            // Always strip email domain for privacy — show only the part before @
            if (displayName.includes('@')) {
                displayName = displayName.split('@')[0];
            }
            // Handle "You (user@email.com)" format
            if (displayName.startsWith('You (') && displayName.endsWith(')')) {
                const inner = displayName.slice(5, -1);
                if (inner.includes('@')) {
                    displayName = `You (${inner.split('@')[0]})`;
                }
            }


            const preset = AVATAR_PRESETS.find(p => p.id === user.avatar);
            let avatarHTML = '';
            if (user.profilePic) {
                avatarHTML = `<img src="${user.profilePic}" class="w-full h-full object-cover" alt="${displayName}">`;
            } else if (preset) {
                avatarHTML = `
                    <div class="avatar-emoji-display" style="background:${preset.gradient}; font-size: 20px;">
                        ${preset.emoji}
                    </div>`;
            } else {
                const avatarUrl = user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe2S82u2sZJ3xmW3cB9zBfpog-Qu3ypJ-ZTjq6ymCTfI96k-XIcFqQH3_f-tnsCfhMQ8xlR31x9mShYD9i8-wV6691uWOysJOwRmYJOT1Ri-FqPpcoLhpq1mI6oavBfjrHajem7t3UOUFVx768eyERSx9s7OsNOezurrmnjosEF6xlDNMD4mV6KEGawwDBhd8IsqV63tn97lLQ5B0aCocCRUAL3iKJJLR_byQT4Dg_BIwq5vtnwpwp3QJNAE0FMVnXpM1IfkQKccq4';
                avatarHTML = `<img src="${avatarUrl}" class="w-full h-full object-cover" alt="${displayName}">`;
            }

            return `
                <div class="flex items-center gap-4 p-5 ${user.isCurrentUser ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary' : ''}">
                    <div class="flex flex-col items-center shrink-0 w-8">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${rankBadge}">
                            ${rank}
                        </div>
                        <span class="material-symbols-outlined text-[14px] ${trendColor} mt-1">${trendIcon}</span>
                    </div>
                    <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 relative">
                        ${avatarHTML}
                        ${user.streak > 5 ? '<div class="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-0.5"><span class="material-symbols-outlined text-[10px] block">local_fire_department</span></div>' : ''}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm ${user.isCurrentUser ? 'text-primary' : 'text-slate-800 dark:text-slate-100'} flex items-center gap-1">
                            ${displayName} 
                            ${user.isCurrentUser ? '<span class="text-[8px] bg-primary text-white px-1 py-0.5 rounded uppercase font-black">Me</span>' : ''}
                            ${user.streak > 10 ? '<span class="material-symbols-outlined text-orange-500 text-sm animate-pulse">local_fire_department</span>' : ''}
                        </h4>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="material-symbols-outlined text-[12px] text-slate-400">public</span>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tighter">${user.country}</p>
                            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter font-bold">${user.discipline}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-black text-slate-800 dark:text-slate-100">${user.points}</p>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Points</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Expose functions to global scope for inline handlers
    window.startMockExam = startMockExam;
    window.startQuiz = startQuiz;
    window.openMockPreview = openMockPreview;
    window.closeMockPreview = closeMockPreview;
    window.confirmStartMock = confirmStartMock;

    // AVATAR_PRESETS is defined above renderLeaderboard() to ensure it is in scope when the leaderboard renders.

    let pendingAvatarId = localStorage.getItem('enggtv_avatar') || null;

    function applyAvatar() {
        const savedId = localStorage.getItem('enggtv_avatar');
        const customPic = localStorage.getItem('enggtv_profile_pic');
        const preset = AVATAR_PRESETS.find(a => a.id === savedId);

        const headerContainer   = document.getElementById('header-avatar-container');
        const settingsContainer = document.getElementById('settings-avatar-container');
        // Try by ID first, fall back to DOM query within #account-info-view for cache resilience
        let accountInfoContainer = document.getElementById('account-info-avatar-container');
        if (!accountInfoContainer) {
            const accountInfoView = document.getElementById('account-info-view');
            if (accountInfoView) {
                accountInfoContainer = accountInfoView.querySelector('.w-24.h-24.rounded-3xl');
            }
        }

        [headerContainer, settingsContainer, accountInfoContainer].forEach((container, i) => {
            if (!container) return;
            
            const isSettings = i > 0;
            const clickAttrs = isSettings ? 'cursor-pointer hover:scale-105 transition-transform duration-300" onclick="window.showPhotoLightbox(this.src)"' : '"';

            if (customPic && !savedId) {
                container.innerHTML = `<img class="w-full h-full object-cover ${clickAttrs} src="${customPic}" />`;
            } else if (preset) {
                const size = i === 0 ? '22px' : (i === 1 ? '36px' : '48px');
                container.innerHTML = `
                    <div class="avatar-emoji-display"
                         style="background:${preset.gradient}; font-size:${size};">
                        ${preset.emoji}
                    </div>`;
            } else {
                // Restore original imgs if no avatar chosen
                if (i === 0) {
                    container.innerHTML = `<img id="header-avatar-img" class="w-full h-full object-cover ${clickAttrs}
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe2S82u2sZJ3xmW3cB9zBfpog-Qu3ypJ-ZTjq6ymCTfI96k-XIcFqQH3_f-tnsCfhMQ8xlR31x9mShYD9i8-wV6691uWOysJOwRmYJOT1Ri-FqPpcoLhpq1mI6oavBfjrHajem7t3UOUFVx768eyERSx9s7OsNOezurrmnjosEF6xlDNMD4mV6KEGawwDBhd8IsqV63tn97lLQ5B0aCocCRUAL3iKJJLR_byQT4Dg_BIwq5vtnwpwp3QJNAE0FMVnXpM1IfkQKccq4" />`;
                } else {
                    container.innerHTML = `<img class="w-full h-full object-cover ${clickAttrs} alt="Profile"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5KvXfnOr12k5SzP6fbV0MWcvNYjQppUc89dWdHwtt0LrMrxWc1UtbF12daBvTIvDM4-Pbiso8pORGGDZgEp95bsmWYDbPdggsVh89FcxWsuzHhPxhY9KM5FxwbYYVVJlRdHw1eVngYCCJYLEwkE1OZnwygR0y-za4B_I1aACLrZJ5_SsP0Uundq_5ePMlIxpXJi2YoSsNZnCF4Mp0shocQ1xiC60lxWTjsK-CY3Md962fc6vAc6Csv8KEhV8gBTOGs4jAoTC5mKjN" />`;
                }
            }
        });
    }

    // Photo Lightbox modal functions
    window.showPhotoLightbox = function(src) {
        const modal = document.getElementById('photo-lightbox-modal');
        const img = document.getElementById('photo-lightbox-img');
        const card = document.getElementById('photo-lightbox-card');
        if (!modal || !img) return;

        img.src = src;
        modal.classList.remove('hidden');
        // Force reflow
        modal.offsetHeight;
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    };

    window.hidePhotoLightbox = function() {
        const modal = document.getElementById('photo-lightbox-modal');
        const card = document.getElementById('photo-lightbox-card');
        if (!modal) return;

        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        if (card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    function renderAvatarGrid() {
        const grid = document.getElementById('avatar-options-grid');
        if (!grid) return;
        grid.innerHTML = AVATAR_PRESETS.map(a => `
            <div class="avatar-option ${pendingAvatarId === a.id ? 'selected-avatar' : ''}"
                 data-avatar-id="${a.id}"
                 style="background: ${a.gradient};"
                 onclick="window._selectAvatar('${a.id}')">
                ${a.emoji}
            </div>
        `).join('');
    }

    window._selectAvatar = function(id) {
        pendingAvatarId = id;
        document.querySelectorAll('.avatar-option').forEach(el => {
            el.classList.toggle('selected-avatar', el.dataset.avatarId === id);
        });
    };

    const avatarModal      = document.getElementById('avatar-picker-modal');
    const openAvatarBtn    = document.getElementById('btn-open-avatar-picker');
    const closeAvatarBtn   = document.getElementById('close-avatar-picker');
    const saveAvatarBtn    = document.getElementById('btn-save-avatar');
    const removeAvatarBtn  = document.getElementById('btn-remove-avatar');

    const customAvatarUpload = document.getElementById('custom-avatar-upload');

    if (customAvatarUpload) {
        customAvatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 15 * 1024 * 1024) {
                window.showToast("File too large", "Please select an image under 15MB.", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 256;
                    const size = Math.min(img.width, img.height);
                    const startX = (img.width - size) / 2;
                    const startY = (img.height - size) / 2;

                    canvas.width = MAX_SIZE;
                    canvas.height = MAX_SIZE;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.drawImage(img, startX, startY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                    localStorage.setItem('enggtv_profile_pic', dataUrl);
                    localStorage.removeItem('enggtv_avatar'); // Clear preset flag
                    
                    applyAvatar();
                    if(typeof syncToFirebase === 'function') 
                    window.showToast("Success", "Custom avatar uploaded!", "check_circle");
                    if (avatarModal) avatarModal.classList.remove('open');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (openAvatarBtn) {
        openAvatarBtn.addEventListener('click', () => {
            pendingAvatarId = localStorage.getItem('enggtv_avatar') || null;
            renderAvatarGrid();
            avatarModal.classList.add('open');
        });
    }
    if (closeAvatarBtn)  closeAvatarBtn.addEventListener('click',  () => avatarModal.classList.remove('open'));
    if (avatarModal)     avatarModal.addEventListener('click', e => { if (e.target === avatarModal) avatarModal.classList.remove('open'); });

    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', () => {
            if (pendingAvatarId) {
                localStorage.setItem('enggtv_avatar', pendingAvatarId);
                localStorage.removeItem('enggtv_profile_pic');
            } else {
                localStorage.removeItem('enggtv_avatar');
            }
            applyAvatar();
             // Sync avatar change to cloud
            avatarModal.classList.remove('open');
        });
    }
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            pendingAvatarId = null;
            localStorage.removeItem('enggtv_avatar');
            localStorage.removeItem('enggtv_profile_pic');
            applyAvatar();
             // Sync avatar removal to cloud
            avatarModal.classList.remove('open');
        });
    }



    function triggerConfetti() {
        if (typeof confetti === 'function') {
            const duration = 3 * 1000;
            const end = Date.now() + duration;

            (function frame() {
                confetti({
                    particleCount: 4,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FF006E', '#FDA60A', '#720026']
                });
                confetti({
                    particleCount: 4,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#FF006E', '#FDA60A', '#720026']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            }());
        }
    }

    // Apply saved avatar immediately on load
    applyAvatar();

    // ================================================================
    // FEATURE 1: EXAM COUNTDOWN CLOCK
    // ================================================================
    (function initExamCountdown() {
        const STORAGE_KEY = 'enggtv_exam_date';
        let countdownInterval = null;

        const noDateEl      = document.getElementById('countdown-no-date');
        const activeEl      = document.getElementById('countdown-active');
        const cdDays        = document.getElementById('cd-days');
        const cdHours       = document.getElementById('cd-hours');
        const cdMins        = document.getElementById('cd-mins');
        const cdBar         = document.getElementById('cd-progress-bar');
        const cdUrgency     = document.getElementById('cd-urgency-msg');
        const examDateLabel = document.getElementById('exam-date-label');
        const examDateInput = document.getElementById('exam-date-input');
        const btnSave       = document.getElementById('btn-save-exam-date');
        const btnClear      = document.getElementById('btn-clear-exam-date');
        const modal         = document.getElementById('exam-date-modal');

        function formatDateLabel(dateStr) {
            if (!dateStr) return 'Tap to set your exam date';
            const d = new Date(dateStr + 'T00:00:00');
            return d.toLocaleDateString('en-US', { weekday: 'short', month: 'long', day: 'numeric', year: 'numeric' });
        }

        function tick(examDateStr) {
            const now     = new Date();
            const examEnd = new Date(examDateStr + 'T00:00:00');
            const diffMs  = examEnd - now;

            if (diffMs <= 0) {
                // Exam day has passed
                cdDays.textContent  = '0';
                cdHours.textContent = '0';
                cdMins.textContent  = '0';
                cdBar.style.width   = '100%';
                cdBar.style.background = '#EF4444';
                cdUrgency.textContent  = '🎉 Good luck on your exam!';
                cdUrgency.style.color  = '#EF4444';
                clearInterval(countdownInterval);
                return;
            }

            const totalDays  = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            const hours      = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const mins       = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

            cdDays.textContent  = totalDays;
            cdHours.textContent = hours;
            cdMins.textContent  = mins;

            // Progress bar: assume user started studying 90 days before exam
            const STUDY_HORIZON_DAYS = 90;
            const studyStartMs  = examEnd - STUDY_HORIZON_DAYS * 24 * 60 * 60 * 1000;
            const elapsed       = Math.max(0, now - studyStartMs);
            const total         = examEnd - studyStartMs;
            const pct           = Math.min(100, Math.round((elapsed / total) * 100));
            cdBar.style.width   = pct + '%';

            // Urgency colour + message
            if (totalDays <= 7) {
                cdDays.style.color      = '#EF4444';
                cdBar.style.background  = 'linear-gradient(to right, #EF4444, #F97316)';
                cdUrgency.textContent   = '⚠️ Final week! Focus on weak spots!';
                cdUrgency.style.color   = '#EF4444';
            } else if (totalDays <= 30) {
                cdDays.style.color      = '#F59E0B';
                cdBar.style.background  = 'linear-gradient(to right, #F59E0B, #EF4444)';
                cdUrgency.textContent   = '📅 ' + totalDays + ' days to go — keep the momentum!';
                cdUrgency.style.color   = '#F59E0B';
            } else {
                cdDays.style.color      = '';
                cdBar.style.background  = '';
                cdUrgency.textContent   = '✅ ' + totalDays + ' days left — you\'re on track!';
                cdUrgency.style.color   = '#22C55E';
            }
        }

        function startCountdown(dateStr) {
            clearInterval(countdownInterval);
            if (!dateStr) {
                noDateEl && noDateEl.classList.remove('hidden');
                activeEl && activeEl.classList.add('hidden');
                if (examDateLabel) examDateLabel.textContent = 'Tap to set your exam date';
                return;
            }
            noDateEl && noDateEl.classList.add('hidden');
            activeEl && activeEl.classList.remove('hidden');
            if (examDateLabel) examDateLabel.textContent = formatDateLabel(dateStr);
            tick(dateStr);
            countdownInterval = setInterval(() => tick(dateStr), 30000); // update every 30s
        }
        
        window.startCountdownGlobal = startCountdown;

        // Initialise from stored value
        const stored = localStorage.getItem(STORAGE_KEY);
        if (examDateInput && stored) examDateInput.value = stored;
        startCountdown(stored || null);

        // Save button
        if (btnSave) {
            btnSave.addEventListener('click', () => {
                const val = examDateInput ? examDateInput.value : '';
                if (!val) { window.showToast('No date selected', 'Please pick a date first.', 'event'); return; }
                localStorage.setItem(STORAGE_KEY, val);
                startCountdown(val);
                 // Sync to cloud
                modal && modal.classList.add('hidden');
                window.showToast('Exam Date Set! 🎯', formatDateLabel(val), 'event_upcoming');
                confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 }, colors: ['#FF006E', '#FDA60A'] });
            });
        }

        // Clear button
        if (btnClear) {
            btnClear.addEventListener('click', () => {
                localStorage.removeItem(STORAGE_KEY);
                if (examDateInput) examDateInput.value = '';
                startCountdown(null);
                 // Sync to cloud
                modal && modal.classList.add('hidden');
                window.showToast('Exam date cleared', 'You can set a new date any time.', 'event_busy');
            });
        }

        // Close modal on backdrop click
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) modal.classList.add('hidden');
            });
        }
    })();




    // Offline Sync Trigger
    window.triggerOfflineSync = function() {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
            window.showToast("Caching Assets", "Downloading resources for offline mode...", "cloud_download");
            
            const messageChannel = new MessageChannel();
            const timeoutId = setTimeout(() => {
                window.showToast("Offline Ready", "Study materials are now available offline.", "cloud_done");
            }, 4000);
            
            messageChannel.port1.onmessage = (event) => {
                if (event.data && event.data.success) {
                    clearTimeout(timeoutId);
                    window.showToast("Offline Ready", "Study materials are now available offline.", "cloud_done");
                }
            };
            
            // Collect all local images from QUESTIONS and ADVANCED_QUESTIONS
            const imageUrls = [];
            try {
                if (typeof QUESTIONS !== 'undefined') {
                    Object.values(QUESTIONS).flat().forEach(q => {
                        if (q.local_question_image) imageUrls.push('./' + q.local_question_image);
                        if (q.local_solution_image) imageUrls.push('./' + q.local_solution_image);
                    });
                }
                if (typeof ADVANCED_QUESTIONS !== 'undefined') {
                    Object.values(ADVANCED_QUESTIONS).flat().forEach(q => {
                        if (q.local_question_image) imageUrls.push('./' + q.local_question_image);
                        if (q.local_solution_image) imageUrls.push('./' + q.local_solution_image);
                    });
                }
                if (typeof EXAM_QUESTIONS !== 'undefined') {
                    Object.values(EXAM_QUESTIONS).flat().forEach(q => {
                        if (q.local_question_image) imageUrls.push('./' + q.local_question_image);
                        if (q.local_solution_image) imageUrls.push('./' + q.local_solution_image);
                    });
                }
            } catch (e) { console.error("Could not collect local images", e); }

            navigator.serviceWorker.controller.postMessage({
                type: 'CACHE_ASSETS',
                urls: [
                    './',
                    './index.html',
                    './app.js',
                    './questions.js',
                    './advanced_questions.js',
                    './exam_questions.js',
                    './style.css',
                    ...imageUrls
                ]
            }, [messageChannel.port2]);
        } else {
            window.showToast("Cannot Sync", "Service Worker is not active. Please reload the page first.", "error");
        }
    };

    
    // ===== NATIVE SHARE API =====
    window.shareApp = async function() {
        const shareData = {
            title: 'Engg.tv - Engineering Exam Prep',
            text: 'I\'m using Engg.tv to study for my FE Exam! It has thousands of practice questions, step-by-step solutions, and it\'s completely free. Check it out:',
            url: 'https://pacificocean11.github.io/Engg-Prep'
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
                showToast('Shared successfully!', 'Thanks for spreading the word.', 'celebration');
            } else {
                // Fallback: Copy to clipboard
                await navigator.clipboard.writeText(`${shareData.text} ${shareData.url}`);
                showToast('Link copied!', 'Share it with your classmates.', 'content_copy');
            }
        } catch (err) {
            console.error('Error sharing:', err);
        }
    };

// Extracted to js/global-search.js


// Extracted to js/onboarding.js


// Extracted to js/achievements.js

// ===== NAME EDITOR LOGIC =====
    const inputChangeName = document.getElementById('input-change-name');
    const btnSaveName = document.getElementById('btn-save-name');
    const settingsNameDisplay = document.getElementById('settings-name-display');
    const accountInfoName = document.getElementById('account-info-name');
    const userGreeting = document.getElementById('user-greeting');

    function updateNameDisplay(newName) {
        newName = newName || 'Alex Riviera';
        state.userName = newName; // for share modal
        if (settingsNameDisplay) settingsNameDisplay.textContent = newName;
        if (accountInfoName) accountInfoName.textContent = newName;
        if (userGreeting) {
            const firstName = (newName && typeof newName === 'string') ? newName.split(' ')[0] : 'Alex';
            userGreeting.textContent = `Welcome back, ${firstName}`;
        }
        if (inputChangeName) inputChangeName.value = newName;
    }

    const storedNameKey = `enggtv_display_name_${state.user && state.user.username ? state.user.username : 'default'}`;
    const initialName = localStorage.getItem(storedNameKey) || (state.user && state.user.username && state.user.username !== 'demo' ? state.user.username : (state.user && state.user.name ? state.user.name : 'Alex Riviera'));
    updateNameDisplay(initialName);

    if (btnSaveName && inputChangeName) {
        btnSaveName.addEventListener('click', () => {
            const newName = inputChangeName.value.trim();
            if (newName) {
                localStorage.setItem(storedNameKey, newName);
                updateNameDisplay(newName);
                window.showToast("Name Updated", "Your display name has been successfully changed.", "person");
            } else {
                window.showToast("Invalid Name", "Please enter a valid name.", "error");
            }
        });
    }

    // ===== FREE MENTORING LOGIC =====
    window.openMentoringCalendly = function() {
        const modal = document.getElementById('mentoring-calendly-modal');
        if (modal) {
            modal.classList.remove('hidden');
            modal.classList.add('flex');
        }
    };

    window.closeMentoringCalendly = function() {
        const modal = document.getElementById('mentoring-calendly-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
    };

    window.proceedToCalendlyBooking = function() {
        window.closeMentoringCalendly();
        // Redirect to www.ENGG.tv where 30-minute Calendly scheduling provision exists
        window.open('https://www.ENGG.tv', '_blank');
    };

    window.openMentoringCalendlyFromSuccess = function() {
        window.closeMentoringSuccessModal();
        window.openMentoringCalendly();
    };

    window.closeMentoringSuccessModal = function() {
        const modal = document.getElementById('mentoring-question-success-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.classList.remove('flex');
        }
        navigateTo('dashboard');
    };

    function initMentoringView() {
        const nameField = document.getElementById('mentor-q-name');
        const emailField = document.getElementById('mentor-q-email');
        if (nameField && (!nameField.value || nameField.value === 'Alex Riviera')) {
            const currentName = state.userName || (state.user && state.user.username !== 'guest' ? (state.user.username === 'demo' ? 'Alex Riviera' : state.user.username) : 'Alex Riviera');
            nameField.value = currentName;
        }
        if (emailField && !emailField.value && state.user && state.user.email) {
            emailField.value = state.user.email;
        }
    }

    // Mentor Question Form Submission & Character Counter
    const mentorForm = document.getElementById('mentor-question-form');
    const mentorMsgField = document.getElementById('mentor-q-message');
    const mentorCharCounter = document.getElementById('mentor-q-char-count');

    if (mentorMsgField && mentorCharCounter) {
        mentorMsgField.addEventListener('input', () => {
            const len = mentorMsgField.value.length;
            mentorCharCounter.textContent = `${len} / 600`;
            mentorCharCounter.classList.toggle('text-secondary', len > 550);
            mentorCharCounter.classList.toggle('text-slate-400', len <= 550);
        });
    }

    if (mentorForm) {
        mentorForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const nameVal = document.getElementById('mentor-q-name')?.value?.trim() || state.userName || 'Student';
            const emailVal = document.getElementById('mentor-q-email')?.value?.trim() || (state.user?.email || 'Not Provided');
            const categoryVal = document.getElementById('mentor-q-category')?.value || 'Mentoring Question';
            const msgVal = document.getElementById('mentor-q-message')?.value?.trim();
            const btn = document.getElementById('btn-submit-mentor-q');
            const btnIcon = document.getElementById('mentor-send-icon');
            const btnText = document.getElementById('mentor-send-text');

            if (!msgVal) return;

            // Loading state
            btn.disabled = true;
            if (btnIcon) { btnIcon.textContent = 'refresh'; btnIcon.style.animation = 'spin 1s linear infinite'; }
            if (btnText) btnText.textContent = 'Sending to Mentor...';

            const userDiscipline = localStorage.getItem('enggtv_discipline') || state.discipline || 'Mechanical';

            try {
                // Send via EmailJS (delivered directly to admin@engg.tv)
                const isEmailJSConfigured = typeof EMAILJS_SERVICE_ID !== 'undefined'
                    && EMAILJS_SERVICE_ID !== 'YOUR_SERVICE_ID'
                    && typeof EMAILJS_TEMPLATE_ID !== 'undefined'
                    && EMAILJS_TEMPLATE_ID !== 'YOUR_TEMPLATE_ID'
                    && typeof emailjs !== 'undefined';

                if (isEmailJSConfigured) {
                    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, {
                        from_name: nameVal,
                        from_user: state.user?.username || nameVal,
                        from_email: emailVal,
                        subject: `[ENGG.tv Free Mentoring] ${categoryVal}: Question from ${nameVal}`,
                        message: `Topic Category: ${categoryVal}\nDiscipline: ${userDiscipline}\nEmail: ${emailVal}\n\nStudent Question:\n${msgVal}`,
                        reply_to: emailVal !== 'Not Provided' ? emailVal : 'admin@engg.tv',
                        sent_at: new Date().toLocaleString(),
                        discipline: userDiscipline,
                        user_points: state.userPoints || 0
                    });
                } else {
                    // Fallback mailto
                    const mailtoBody = encodeURIComponent(`From: ${nameVal}\nEmail: ${emailVal}\nDiscipline: ${userDiscipline}\nTopic: ${categoryVal}\n\nQuestion:\n${msgVal}`);
                    const mailtoLink = `mailto:admin@engg.tv?subject=${encodeURIComponent('[ENGG.tv Free Mentoring] ' + categoryVal + ' - ' + nameVal)}&body=${mailtoBody}`;
                    window.open(mailtoLink, '_blank');
                }

                // Optional Firestore logging
                try {
                    if (window.firebase && firebase.firestore) {
                        const db = firebase.firestore();
                        await db.collection('adminMessages').add({
                            type: 'mentoring_inquiry',
                            name: nameVal,
                            email: emailVal,
                            category: categoryVal,
                            discipline: userDiscipline,
                            message: msgVal,
                            points: state.userPoints || 0,
                            createdAt: firebase.firestore.FieldValue.serverTimestamp()
                        });
                    }
                } catch (dbErr) {
                    console.warn('Mentoring message Firestore log non-blocking err:', dbErr);
                }

                window.showToast('Question Sent! ✉️', 'Delivered to admin@engg.tv', 'mark_email_read');
                mentorForm.reset();
                if (mentorCharCounter) mentorCharCounter.textContent = '0 / 600';

                // Confetti animation
                if (typeof confetti === 'function') {
                    confetti({
                        particleCount: 120,
                        spread: 60,
                        origin: { y: 0.6 },
                        colors: ['#f59e0b', '#be0055', '#3b82f6']
                    });
                }

                // Show Success & Calendly invitation modal
                const successModal = document.getElementById('mentoring-question-success-modal');
                if (successModal) {
                    successModal.classList.remove('hidden');
                    successModal.classList.add('flex');
                }

            } catch (error) {
                console.error('Mentoring question error:', error);
                window.showToast('Send Failed', 'Please email us directly at admin@engg.tv', 'error');
            } finally {
                btn.disabled = false;
                if (btnIcon) { btnIcon.textContent = 'send'; btnIcon.style.animation = ''; }
                if (btnText) btnText.textContent = 'Send Question to Mentor';
            }
        });
    }

    // Run Init
    init();
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startApp);
} else {
    startApp();
}

// Floating ENGG.tv Calculator & Scratchpad Controller
let is2ndActive = false;
let calcAngleMode = 'DEG'; // 'DEG' or 'RAD'
let calcLastAns = 0;

window.toggleCalcAngleMode = function() {
    calcAngleMode = (calcAngleMode === 'DEG') ? 'RAD' : 'DEG';
    const btn = document.getElementById('calc-angle-mode-btn');
    if (btn) btn.innerText = calcAngleMode;
};

window.toggleCalc2nd = function() {
    is2ndActive = !is2ndActive;
    const btn2nd = document.getElementById('calc-2nd-btn');
    const badge = document.getElementById('calc-2nd-badge');
    const sinBtn = document.getElementById('calc-btn-sin');
    const cosBtn = document.getElementById('calc-btn-cos');
    const tanBtn = document.getElementById('calc-btn-tan');
    const logBtn = document.getElementById('calc-btn-log');
    const lnBtn = document.getElementById('calc-btn-ln');

    if (is2ndActive) {
        if (btn2nd) btn2nd.className = 'p-2.5 rounded-xl bg-[#EC4899] text-white text-xs font-black border border-pink-400 shadow-md shadow-pink-500/40 active:scale-95 transition-all cursor-pointer';
        if (badge) badge.classList.remove('hidden');
        if (sinBtn) sinBtn.innerText = 'sin⁻¹';
        if (cosBtn) cosBtn.innerText = 'cos⁻¹';
        if (tanBtn) tanBtn.innerText = 'tan⁻¹';
        if (logBtn) logBtn.innerText = '10^x';
        if (lnBtn) lnBtn.innerText = 'e^x';
    } else {
        if (btn2nd) btn2nd.className = 'p-2.5 rounded-xl bg-[#2E1E12] hover:bg-[#3D2919] text-xs font-bold text-amber-400 border border-[#F59E0B]/25 active:scale-95 transition-all cursor-pointer';
        if (badge) badge.classList.add('hidden');
        if (sinBtn) sinBtn.innerText = 'sin';
        if (cosBtn) cosBtn.innerText = 'cos';
        if (tanBtn) tanBtn.innerText = 'tan';
        if (logBtn) logBtn.innerText = 'log';
        if (lnBtn) lnBtn.innerText = 'ln';
    }
};

window.calcTrig = function(func) {
    if (is2ndActive) {
        if (func === 'sin') window.calcInput('asin(');
        else if (func === 'cos') window.calcInput('acos(');
        else if (func === 'tan') window.calcInput('atan(');
        window.toggleCalc2nd();
    } else {
        window.calcInput(func + '(');
    }
};

window.calcLog = function(type) {
    if (is2ndActive) {
        if (type === 'log') window.calcInput('10^(');
        else if (type === 'ln') window.calcInput('e^(');
        window.toggleCalc2nd();
    } else {
        window.calcInput(type + '(');
    }
};

window.toggleCalcModal = function() {
    const modal = document.getElementById('calc-scratchpad-modal');
    if (!modal) return;
    if (modal.classList.contains('hidden')) {
        modal.classList.remove('hidden');
        setTimeout(() => {
            modal.classList.remove('scale-95', 'opacity-0');
            modal.classList.add('scale-100', 'opacity-100');
        }, 10);
    } else {
        modal.classList.remove('scale-100', 'opacity-100');
        modal.classList.add('scale-95', 'opacity-0');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 200);
    }
};

window.setCalcTab = function(tab) {
    const calcPanel = document.getElementById('calc-panel');
    const scratchPanel = document.getElementById('scratch-panel');
    const calcTabBtn = document.getElementById('calc-tab-btn');
    const scratchTabBtn = document.getElementById('scratch-tab-btn');

    if (tab === 'calc') {
        calcPanel.classList.remove('hidden');
        scratchPanel.classList.add('hidden');
        calcTabBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-slate-950 shadow-md shadow-[#F59E0B]/30 transition-colors cursor-pointer';
        scratchTabBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300/70 hover:text-white transition-colors cursor-pointer';
    } else {
        calcPanel.classList.add('hidden');
        scratchPanel.classList.remove('hidden');
        scratchTabBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold bg-gradient-to-r from-[#F59E0B] to-[#D97706] text-slate-950 shadow-md shadow-[#F59E0B]/30 transition-colors cursor-pointer';
        calcTabBtn.className = 'px-2.5 py-1 rounded-lg text-xs font-bold text-amber-300/70 hover:text-white transition-colors cursor-pointer';
    }
};

let currentCalcExpr = '';
window.calcInput = function(val) {
    currentCalcExpr += val;
    const exprEl = document.getElementById('calc-expression');
    if (exprEl) exprEl.innerText = currentCalcExpr;
};

window.calcClear = function() {
    currentCalcExpr = '';
    const exprEl = document.getElementById('calc-expression');
    const dispEl = document.getElementById('calc-display');
    if (exprEl) exprEl.innerText = '';
    if (dispEl) dispEl.innerText = '0';
};

window.calcBackspace = function() {
    currentCalcExpr = currentCalcExpr.slice(0, -1);
    const exprEl = document.getElementById('calc-expression');
    const dispEl = document.getElementById('calc-display');
    if (exprEl) exprEl.innerText = currentCalcExpr;
    if (!currentCalcExpr && dispEl) dispEl.innerText = '0';
};

window.calcEvaluate = function() {
    if (!currentCalcExpr) return;
    const dispEl = document.getElementById('calc-display');
    try {
        let expr = currentCalcExpr;

        // Replace ANS
        expr = expr.replace(/ANS/g, calcLastAns);
        // Replace e^( or e^x
        expr = expr.replace(/e\^\(/g, 'Math.exp(');
        // Replace 10^(
        expr = expr.replace(/10\^\(/g, 'Math.pow(10,');

        // Angle conversions
        const degFactor = (calcAngleMode === 'DEG') ? (180 / Math.PI) : 1;
        const toRadFactor = (calcAngleMode === 'DEG') ? (Math.PI / 180) : 1;

        // Create global wrapper functions for trig evaluation
        window._c_asin = (x) => Math.asin(x) * degFactor;
        window._c_acos = (x) => Math.acos(x) * degFactor;
        window._c_atan = (x) => Math.atan(x) * degFactor;

        window._c_sin = (x) => Math.sin(x * toRadFactor);
        window._c_cos = (x) => Math.cos(x * toRadFactor);
        window._c_tan = (x) => Math.tan(x * toRadFactor);

        // Sanitize trig and math expressions
        let sanitized = expr
            .replace(/asin\(/g, '_c_asin(')
            .replace(/acos\(/g, '_c_acos(')
            .replace(/atan\(/g, '_c_atan(')
            .replace(/arcsin\(/g, '_c_asin(')
            .replace(/arccos\(/g, '_c_acos(')
            .replace(/arctan\(/g, '_c_atan(')
            .replace(/sin⁻¹\(/g, '_c_asin(')
            .replace(/cos⁻¹\(/g, '_c_acos(')
            .replace(/tan⁻¹\(/g, '_c_atan(')
            .replace(/(?<![a-zA-Z_])sin\(/g, '_c_sin(')
            .replace(/(?<![a-zA-Z_])cos\(/g, '_c_cos(')
            .replace(/(?<![a-zA-Z_])tan\(/g, '_c_tan(')
            .replace(/sqrt\(/g, 'Math.sqrt(')
            .replace(/log\(/g, 'Math.log10(')
            .replace(/ln\(/g, 'Math.log(')
            .replace(/\^/g, '**');

        let result = eval(sanitized);
        if (typeof result === 'number' && !isNaN(result)) {
            result = Number.isInteger(result) ? result : parseFloat(result.toFixed(6));
            calcLastAns = result;
            if (dispEl) dispEl.innerText = result;
        } else {
            if (dispEl) dispEl.innerText = 'ERROR';
        }
    } catch (err) {
        if (dispEl) dispEl.innerText = 'ERROR';
    }
};

// =========================================================================
// ENGG.tv DASHBOARD ENGINES (Tabs, Calendar, Motivation, Alumni, Video, Peer Ticker, Zen Mode)
// Bundled into app.js to guarantee live-site compatibility
// =========================================================================

// --- BEGIN js/dashboard-tabs.js ---
/**
 * ENGG.tv - Dashboard Segmented Sub-Navigation Module
 * Divides the Home view into 4 focused panes:
 * 1. Overview (Launchpad, Mentoring, Readiness, Quests)
 * 2. Analytics (Diagnostic Performance Report)
 * 3. History (Study Calendar, Recent Activity)
 * 4. Alumni & Theory (Engg.tv Alumni Spotlight, Daily Mindset Quotes, FE Theorems)
 */

(function() {
    const TABS = ['overview', 'analytics', 'history', 'motivation', 'peers'];
    let currentTab = 'overview';

    function switchDashboardTab(tabId, persist = true) {
        if (tabId === 'theory') tabId = 'motivation';
        if (!TABS.includes(tabId)) tabId = 'overview';
        currentTab = tabId;

        if (persist) {
            localStorage.setItem('enggtv_home_tab', tabId);
        }

        // 1. Update Tab Buttons styling
        TABS.forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            const pane = document.getElementById(`dash-pane-${t}`);

            if (btn) {
                if (t === tabId) {
                    btn.className = 'dash-subtab-btn flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold transition-all cursor-pointer text-center active:scale-95 text-white bg-primary shadow-sm';
                } else {
                    btn.className = 'dash-subtab-btn flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-2 px-1 sm:px-4 py-1.5 sm:py-2.5 rounded-xl text-[9px] min-[360px]:text-[10px] sm:text-xs font-bold transition-all cursor-pointer text-center active:scale-95 text-slate-600 dark:text-slate-400 hover:text-primary dark:hover:text-primary hover:bg-white/40 dark:hover:bg-slate-800/40';
                }
            }

            // 2. Update Pane visibility
            if (pane) {
                if (t === tabId) {
                    pane.classList.remove('hidden');
                    // Smooth fade-in
                    pane.style.opacity = '0';
                    pane.style.transform = 'translateY(6px)';
                    setTimeout(() => {
                        pane.style.transition = 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)';
                        pane.style.opacity = '1';
                        pane.style.transform = 'translateY(0)';
                    }, 20);
                } else {
                    pane.classList.add('hidden');
                }
            }
        });

        // 3. Tab-specific triggers / re-renders
        if (tabId === 'motivation') {
            if (window.MathJax && window.MathJax.typesetPromise) {
                const formulaEl = document.getElementById('daily-theorem-formula');
                if (formulaEl) {
                    window.MathJax.typesetPromise([formulaEl]).catch(err => console.warn('MathJax render:', err));
                }
            }
            if (typeof window.initFeaturedMechanismVideo === 'function') {
                window.initFeaturedMechanismVideo();
            }
        } else if (tabId === 'history') {
            // Trigger calendar day re-render if available
            if (typeof window.renderStudyCalendar === 'function') {
                window.renderStudyCalendar();
            }
        } else if (tabId === 'peers') {
            if (typeof window.refreshPeerTicker === 'function') {
                window.refreshPeerTicker();
            }
        }
    }

    function init() {
        const savedTab = localStorage.getItem('enggtv_home_tab') || 'overview';
        switchDashboardTab(savedTab, false);

        // Add event listeners as backup to inline onclick
        TABS.forEach(t => {
            const btn = document.getElementById(`tab-btn-${t}`);
            if (btn) {
                btn.onclick = (e) => {
                    e.preventDefault();
                    switchDashboardTab(t, true);
                };
            }
        });
    }

    // Expose globally
    window.switchDashboardTab = switchDashboardTab;
    window.getActiveDashboardTab = () => currentTab;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }
})();

// --- END js/dashboard-tabs.js ---

// --- BEGIN js/study-calendar.js ---
/**
 * ENGG.tv - Study History Calendar Module
 * Provides interactive monthly calendar tracking quizzes, mock exams, and notes reviewed.
 */

(function() {
    let currentYear = new Date().getFullYear();
    let currentMonth = new Date().getMonth(); // 0-indexed
    let selectedDateStr = formatDateKey(new Date());

    function padZero(num) {
        return num < 10 ? '0' + num : '' + num;
    }

    function formatDateKey(dateObj) {
        const y = dateObj.getFullYear();
        const m = padZero(dateObj.getMonth() + 1);
        const d = padZero(dateObj.getDate());
        return `${y}-${m}-${d}`;
    }

    function getActivitiesMap() {
        const map = {};
        const activities = (window.state && window.state.recentActivity) ? window.state.recentActivity : [];
        activities.forEach(act => {
            if (!act || !act.timestamp) return;
            const actDate = new Date(act.timestamp);
            const key = formatDateKey(actDate);
            if (!map[key]) map[key] = [];
            map[key].push(act);
        });
        return map;
    }

    function renderCalendar() {
        const monthYearLabel = document.getElementById('cal-month-year');
        const grid = document.getElementById('cal-days-grid');
        if (!grid) return;

        const date = new Date(currentYear, currentMonth, 1);
        const monthName = date.toLocaleString('default', { month: 'long' });
        if (monthYearLabel) {
            monthYearLabel.textContent = `${monthName} ${currentYear}`;
        }

        grid.innerHTML = '';

        // Day of week offset for Monday start:
        // getDay(): Sunday is 0, Monday is 1, ..., Saturday is 6
        let firstDayIndex = date.getDay() - 1;
        if (firstDayIndex === -1) firstDayIndex = 6; // Sunday becomes index 6

        const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const prevMonthTotalDays = new Date(currentYear, currentMonth, 0).getDate();

        const activitiesMap = getActivitiesMap();
        const todayKey = formatDateKey(new Date());

        // Fill previous month padding days
        for (let i = firstDayIndex; i > 0; i--) {
            const dayNum = prevMonthTotalDays - i + 1;
            const cell = document.createElement('div');
            cell.className = 'text-center py-2 text-xs text-slate-300 dark:text-slate-700 select-none cursor-default font-medium';
            cell.textContent = dayNum;
            grid.appendChild(cell);
        }

        // Fill current month days
        for (let day = 1; day <= totalDaysInMonth; day++) {
            const dayKey = `${currentYear}-${padZero(currentMonth + 1)}-${padZero(day)}`;
            const isToday = (dayKey === todayKey);
            const isSelected = (dayKey === selectedDateStr);
            const dayActs = activitiesMap[dayKey] || [];
            const hasActivity = dayActs.length > 0;

            const cell = document.createElement('button');
            cell.type = 'button';
            cell.setAttribute('data-date', dayKey);

            let baseClasses = 'relative flex flex-col items-center justify-center h-10 w-full rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ';

            if (isSelected) {
                baseClasses += 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 shadow-md shadow-amber-500/30 scale-105 z-10 ';
            } else if (isToday) {
                baseClasses += 'border-2 border-[#F59E0B] text-amber-600 dark:text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 ';
            } else if (hasActivity) {
                baseClasses += 'bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:border-amber-400 border border-slate-200 dark:border-slate-700/60 ';
            } else {
                baseClasses += 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 ';
            }

            cell.className = baseClasses;

            // Day number
            const numSpan = document.createElement('span');
            numSpan.textContent = day;
            cell.appendChild(numSpan);

            // Activity dot indicator
            if (hasActivity) {
                const dot = document.createElement('span');
                const dotColor = isSelected ? 'bg-slate-950' : 'bg-[#F59E0B] shadow-[0_0_6px_#f59e0b]';
                dot.className = `w-1.5 h-1.5 rounded-full ${dotColor} mt-0.5 animate-pulse`;
                cell.appendChild(dot);
            }

            cell.addEventListener('click', () => {
                selectedDateStr = dayKey;
                renderCalendar();
                renderDayDetails(dayKey);
            });

            grid.appendChild(cell);
        }

        renderDayDetails(selectedDateStr);
    }

    function renderDayDetails(dateKey) {
        const detailsContainer = document.getElementById('cal-day-details');
        const selectedDateTitle = document.getElementById('cal-selected-date-title');
        const countBadge = document.getElementById('cal-activity-count-badge');
        if (!detailsContainer) return;

        // Parse key
        const parts = dateKey.split('-');
        const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        const formattedTitle = dateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });

        if (selectedDateTitle) {
            selectedDateTitle.textContent = formattedTitle;
        }

        const activitiesMap = getActivitiesMap();
        const acts = activitiesMap[dateKey] || [];

        if (countBadge) {
            if (acts.length > 0) {
                countBadge.textContent = `${acts.length} ${acts.length === 1 ? 'Session' : 'Sessions'}`;
                countBadge.className = 'text-[10px] font-black bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20 px-2.5 py-0.5 rounded-full uppercase tracking-wider';
            } else {
                countBadge.textContent = 'Rest Day';
                countBadge.className = 'text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full uppercase tracking-wider';
            }
        }

        if (acts.length === 0) {
            detailsContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center p-6 sm:p-8 text-center bg-slate-50/60 dark:bg-slate-900/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                    <span class="material-symbols-outlined text-slate-300 dark:text-slate-600 text-3xl mb-2">event_busy</span>
                    <p class="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">No study sessions recorded on this day.</p>
                    <p class="text-[11px] text-slate-400 dark:text-slate-500 mb-4">Every session counts toward passing your FE exam!</p>
                    <div class="flex items-center gap-2">
                        <button onclick="navigateTo('study')" class="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer">
                            Start a Quiz
                        </button>
                        <button onclick="navigateTo('notes')" class="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all cursor-pointer">
                            Browse Notes
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        // Render activities
        detailsContainer.innerHTML = acts.map((act, idx) => {
            const timeStr = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            
            if (act.type === 'notes') {
                const subject = act.subject || 'Engineering';
                const chapter = act.chapter || act.title || 'Overview';
                return `
                    <div class="p-3.5 rounded-2xl bg-amber-500/5 dark:bg-amber-400/5 border border-amber-500/20 flex items-start gap-3 transition-all hover:border-amber-500/40">
                        <div class="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
                            <span class="material-symbols-outlined text-[18px]">auto_stories</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                                You studied <strong class="font-bold text-amber-600 dark:text-amber-400">${subject}</strong> notes from the <strong class="font-bold text-slate-900 dark:text-white">${chapter}</strong> chapter.
                            </p>
                            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mt-1 inline-block">${timeStr}</span>
                        </div>
                    </div>
                `;
            } else if (act.isMockExam) {
                return `
                    <div class="p-3.5 rounded-2xl bg-indigo-500/5 dark:bg-indigo-400/5 border border-indigo-500/20 flex items-start gap-3 transition-all hover:border-indigo-500/40">
                        <div class="w-8 h-8 rounded-xl bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                            <span class="material-symbols-outlined text-[18px]">assignment</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                                You completed a full <strong class="font-bold text-indigo-600 dark:text-indigo-400">FE Mock Exam</strong> and scored <strong class="font-bold text-slate-900 dark:text-white">${act.score} out of ${act.attempted || 110}</strong> points (${act.accuracy}% accuracy).
                            </p>
                            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mt-1 inline-block">${timeStr}</span>
                        </div>
                    </div>
                `;
            } else {
                const topicTitle = act.title || act.subject || 'Engineering Fundamentals';
                return `
                    <div class="p-3.5 rounded-2xl bg-pink-500/5 dark:bg-pink-400/5 border border-pink-500/20 flex items-start gap-3 transition-all hover:border-pink-500/40">
                        <div class="w-8 h-8 rounded-xl bg-pink-500/15 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0 mt-0.5">
                            <span class="material-symbols-outlined text-[18px]">quiz</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
                                You attempted a quiz on <strong class="font-bold text-pink-600 dark:text-pink-400">${topicTitle}</strong> and scored <strong class="font-bold text-slate-900 dark:text-white">${act.score} out of ${act.attempted || 10}</strong> points (${act.accuracy}% accuracy).
                            </p>
                            <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold tracking-wider uppercase mt-1 inline-block">${timeStr}</span>
                        </div>
                    </div>
                `;
            }
        }).join('');
    }

    function initControls() {
        const prevBtn = document.getElementById('cal-btn-prev');
        const nextBtn = document.getElementById('cal-btn-next');
        const todayBtn = document.getElementById('cal-btn-today');

        if (prevBtn) {
            prevBtn.onclick = () => {
                currentMonth--;
                if (currentMonth < 0) {
                    currentMonth = 11;
                    currentYear--;
                }
                renderCalendar();
            };
        }

        if (nextBtn) {
            nextBtn.onclick = () => {
                currentMonth++;
                if (currentMonth > 11) {
                    currentMonth = 0;
                    currentYear++;
                }
                renderCalendar();
            };
        }

        if (todayBtn) {
            todayBtn.onclick = () => {
                const now = new Date();
                currentYear = now.getFullYear();
                currentMonth = now.getMonth();
                selectedDateStr = formatDateKey(now);
                renderCalendar();
            };
        }
    }

    /**
     * Record a note reading event into recentActivity
     */
    function logNotesStudySession(subjectTitle, chapterTitle) {
        if (!window.state || !window.state.user || !window.state.user.username) return;

        if (!Array.isArray(window.state.recentActivity)) {
            window.state.recentActivity = [];
        }

        // Deduplication: if student reopened same chapter within 15 minutes, skip duplicate
        const fifteenMinsAgo = Date.now() - (15 * 60 * 1000);
        const isDuplicate = window.state.recentActivity.some(a => 
            a.type === 'notes' && 
            a.subject === subjectTitle && 
            a.chapter === chapterTitle && 
            a.timestamp > fifteenMinsAgo
        );

        if (isDuplicate) {
            console.log(`ℹ️ Notes study session already logged recently for ${chapterTitle}`);
            return;
        }

        const noteActivity = {
            id: Date.now().toString(),
            type: 'notes',
            title: `${chapterTitle}`,
            subject: subjectTitle,
            chapter: chapterTitle,
            timestamp: Date.now()
        };

        window.state.recentActivity.unshift(noteActivity);
        if (window.state.recentActivity.length > 120) {
            window.state.recentActivity.pop();
        }

        const activityKey = `enggtv_recent_activity_${window.state.user.username}`;
        localStorage.setItem(activityKey, JSON.stringify(window.state.recentActivity));

        console.log(`📘 Logged study session: ${subjectTitle} - ${chapterTitle}`);

        // Update UI
        if (typeof window.syncToFirebase === 'function') {
            window.syncToFirebase();
        }
        if (typeof window.renderRecentActivity === 'function') {
            window.renderRecentActivity();
        }
        renderCalendar();
    }

    function init() {
        initControls();
        renderCalendar();
    }

    // Expose functions globally
    window.initStudyCalendar = init;
    window.renderStudyCalendar = renderCalendar;
    window.logNotesStudySession = logNotesStudySession;

    // Auto-init when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }
})();

// --- END js/study-calendar.js ---

// --- BEGIN js/daily-motivation.js ---
/**
 * ENGG.tv - Daily Motivation & Discipline FE Theorem Module
 * Displays daily inspiring engineering quotes and discipline-specific FE exam theorems.
 */

(function() {
    const QUOTES = [
        {
            quote: "Scientists study the world as it is; engineers create the world that has never been.",
            author: "Theodore von Kármán",
            role: "Aerospace Pioneer & Mathematician"
        },
        {
            quote: "Genius is one percent inspiration, and ninety-nine percent perspiration. Keep grinding your practice problems.",
            author: "Thomas Edison",
            role: "Prolific Inventor"
        },
        {
            quote: "The present is theirs; the future, for which I really worked, is mine.",
            author: "Nikola Tesla",
            role: "Father of Alternating Current"
        },
        {
            quote: "What I cannot create, I do not understand. Work the equations until the physics clicks.",
            author: "Richard Feynman",
            role: "Nobel Laureate in Physics"
        },
        {
            quote: "Failure is simply the opportunity to begin again, this time more intelligently.",
            author: "Henry Ford",
            role: "Industrialist & Engineer"
        },
        {
            quote: "Nothing in life is to be feared, it is only to be understood. Now is the time to understand more, so that we may fear less.",
            author: "Marie Curie",
            role: "Pioneer in Radioactivity"
        },
        {
            quote: "Simplicity is the ultimate sophistication in engineering design.",
            author: "Leonardo da Vinci",
            role: "Renaissance Polymath & Engineer"
        },
        {
            quote: "Give me a place to stand, and a lever long enough, and I will move the world.",
            author: "Archimedes",
            role: "Classical Greek Mathematician & Engineer"
        },
        {
            quote: "An engineer is someone who can do for a nickel what any fool can do for a dollar.",
            author: "Arthur Mellen Wellington",
            role: "Civil Engineer"
        },
        {
            quote: "Information is the resolution of uncertainty. Every practice question reduces your test-day uncertainty.",
            author: "Claude Shannon",
            role: "Father of Information Theory"
        },
        {
            quote: "One small step for a man, one giant leap for mankind. Focus on completing one topic at a time.",
            author: "Neil Armstrong",
            role: "Aerospace Engineer & Astronaut"
        },
        {
            quote: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.",
            author: "Antoine de Saint-Exupéry",
            role: "Aviation Pioneer"
        },
        {
            quote: "Small disciplines repeated with consistency every day lead to great achievements gained slowly over time.",
            author: "John C. Maxwell",
            role: "Leadership Author"
        },
        {
            quote: "You don't have to be great to start, but you have to start to be great. Open your notes and begin.",
            author: "Zig Ziglar",
            role: "Performance Author"
        },
        {
            quote: "The best way to predict the future is to design and build it yourself.",
            author: "Alan Kay",
            role: "Computer Scientist"
        }
    ];

    const THEOREMS_BY_DISCIPLINE = {
        "Mechanical": [
                {
                        "title": "Bernoulli’s Principle",
                        "formula": "$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g z_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g z_2$$",
                        "description": "States that for an inviscid, incompressible fluid in steady streamline flow, the sum of static pressure, dynamic pressure, and hydrostatic pressure is constant along a streamline.",
                        "examTip": "Search NCEES Handbook under Fluid Mechanics. Ensure you use consistent gauge vs absolute pressures and watch out for elevation head datum.",
                        "videoUrl": "assets/videos/Bernoullis_Principle.mp4",
                        "videoTitle": "Bernoulli's Principle Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Fourier’s Law of Thermal Conduction",
                        "formula": "$$\\dot{Q} = -k A \\frac{dT}{dx}$$",
                        "description": "Defines the rate of heat transfer through a material as directly proportional to the negative temperature gradient and the cross-sectional area perpendicular to heat flow.",
                        "examTip": "Found under Heat Transfer. For multi-layer planar walls or cylindrical pipes, use the thermal resistance analogy: $R_{th} = \\frac{L}{k A}$.",
                        "videoUrl": "assets/videos/Fouriers_Law.mp4",
                        "videoTitle": "Fourier's Law for Conduction",
                        "videoDuration": "10s"
                },
                {
                        "title": "Carnot Thermal Efficiency (Maximum Limit)",
                        "formula": "$$\\eta_{\\text{Carnot}} = 1 - \\frac{T_L}{T_H} = \\frac{T_H - T_L}{T_H}$$",
                        "description": "Represents the absolute theoretical maximum efficiency that any heat engine operating between two thermal reservoirs can achieve.",
                        "examTip": "Found under Thermodynamics. Crucial test rule: Always convert temperatures to absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}) before calculating!",
                        "videoUrl": "assets/videos/Carnot_Cycle.mp4",
                        "videoTitle": "Carnot Cycle Thermodynamic p-V Diagram",
                        "videoDuration": "10s"
                },
                {
                        "title": "Mohr’s Circle for Plane Stress",
                        "formula": "$$\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}$$",
                        "description": "A graphical and analytical transformation for plane stress, yielding in-plane principal normal stresses and maximum in-plane shear stress.",
                        "examTip": "Found in Mechanics of Materials. The radius of the circle directly equals the maximum in-plane shear stress $\\tau_{\\text{max}}$.",
                        "videoUrl": "assets/videos/Mohrs_Circle.mp4",
                        "videoTitle": "Mohr's Circle for Plane Stress",
                        "videoDuration": "12s"
                },
                {
                        "title": "Parallel Axis Theorem (Second Moment of Area)",
                        "formula": "$$I_x = I_{xc} + A d^2$$",
                        "description": "Calculates the area moment of inertia of a shape about any arbitrary axis parallel to its centroidal axis.",
                        "examTip": "Found in Statics / Dynamics. Variable $d$ is strictly the perpendicular distance from the component centroid to the reference axis.",
                        "videoUrl": "assets/videos/Parallel_Axis_Theorem.mp4",
                        "videoTitle": "Parallel Axis Theorem Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "First Law of Thermodynamics (Closed System)",
                        "formula": "$$\\Delta U = Q - W = m c_v (T_2 - T_1)$$",
                        "description": "States conservation of energy for a stationary closed system: net change in internal energy equals net heat added minus net boundary work done by the system.",
                        "examTip": "Found in Thermodynamics. Sign convention: Heat added is positive ($+Q$); work done by system is positive ($+W$). For ideal gases, internal energy depends only on temperature."
                },
                {
                        "title": "Darcy-Weisbach Equation (Friction Head Loss)",
                        "formula": "$$h_f = f \\frac{L}{D} \\frac{v^2}{2g}$$",
                        "description": "Computes head loss due to wall friction in fully developed circular pipe flow as a function of friction factor $f$, length $L$, diameter $D$, and mean velocity $v$.",
                        "examTip": "Found in Fluid Mechanics. In laminar pipe flow ($Re < 2100$), $f = 64/Re$. In turbulent flow, find $f$ on the Moody diagram using relative roughness $\\epsilon/D$."
                },
                {
                        "title": "Euler’s Critical Buckling Load for Columns",
                        "formula": "$$P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}$$",
                        "description": "Calculates the maximum axial compressive load that a slender column can sustain before undergoing sudden elastic lateral buckling.",
                        "examTip": "Found in Mechanics of Materials. Check column end support factors: $K=0.5$ (fixed-fixed), $K=0.7$ (fixed-pinned), $K=1.0$ (pinned-pinned), $K=2.0$ (fixed-free)."
                },
                {
                        "title": "Newton’s Law of Cooling (Convective Heat Transfer)",
                        "formula": "$$\\dot{Q}_{conv} = h A_s (T_s - T_\\infty)$$",
                        "description": "Quantifies convective heat transfer between a solid surface and an adjacent moving fluid, driven by temperature difference and convective heat transfer coefficient $h$.",
                        "examTip": "Found in Heat Transfer. Convection thermal resistance is $R_{th} = 1 / (h A_s)$. Note that $h$ is not a material constant; it depends on flow velocity, geometry, and fluid properties."
                },
                {
                        "title": "Stefan-Boltzmann Law of Thermal Radiation",
                        "formula": "$$\\dot{Q}_{emit} = \\epsilon \\sigma A T^4, \\quad \\sigma = 5.67 \\times 10^{-8} \\text{ W}/(\\text{m}^2 \\cdot \\text{K}^4)$$",
                        "description": "Total radiant energy emitted per unit time by a real surface is proportional to surface emissivity $\\epsilon$ and the fourth power of absolute temperature $T$.",
                        "examTip": "Found in Heat Transfer. Mandatory rule: Surface temperature $T$ must ALWAYS be in absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}). For an ideal blackbody, $\\epsilon = 1$."
                },
                {
                        "title": "Generalized Hooke’s Law (3D Elastic Stress-Strain)",
                        "formula": "$$\\epsilon_x = \\frac{1}{E}\\left[\\sigma_x - \\nu(\\sigma_y + \\sigma_z)\\right]$$",
                        "description": "Relates elastic normal strain along a Cartesian axis to multi-axial normal stresses and Poisson's ratio $\\nu$ in linear isotropic materials.",
                        "examTip": "Found in Mechanics of Materials. Even under uniaxial tension ($\\sigma_y = \\sigma_z = 0$), lateral strains $\\epsilon_y = \\epsilon_z = -\\nu \\sigma_x / E$ still develop!"
                },
                {
                        "title": "Elastic Flexure Formula (Beam Bending Stress)",
                        "formula": "$$\\sigma_b = -\\frac{M y}{I} \\implies \\sigma_{\\text{max}} = \\frac{M}{S}$$",
                        "description": "Determines normal bending stress at distance $y$ from the centroidal neutral axis under bending moment $M$, where $S = I/c$ is elastic section modulus.",
                        "examTip": "Found in Mechanics of Materials. Maximum bending stress occurs at outermost fibers ($y = \\pm c$). For a rectangular cross section ($b \\times h$), $S = b h^2 / 6$."
                },
                {
                        "title": "Torsion Formula (Shaft Shear Stress & Twist)",
                        "formula": "$$\\tau = \\frac{T r}{J}, \\quad \\phi = \\frac{T L}{G J}$$",
                        "description": "Computes shear stress $\\tau$ at radius $r$ and total angular twist $\\phi$ in a circular shaft carrying torsional moment $T$, shear modulus $G$, and polar moment $J$.",
                        "examTip": "Found in Mechanics of Materials. Polar moment of inertia for a solid circular shaft is $J = \\pi d^4 / 32$. For a hollow tube: $J = \\pi(d_o^4 - d_i^4) / 32$."
                },
                {
                        "title": "Log Mean Temperature Difference (LMTD Heat Exchangers)",
                        "formula": "$$\\Delta T_{lm} = \\frac{\\Delta T_1 - \\Delta T_2}{\\ln(\\Delta T_1 / \\Delta T_2)}, \\quad \\dot{Q} = U A F \\Delta T_{lm}$$",
                        "description": "Evaluates the effective temperature driving force in parallel-flow and counter-flow heat exchangers with overall heat transfer coefficient $U$ and area $A$.",
                        "examTip": "Found in Heat Transfer. Counter-flow arrangements produce a higher $\\Delta T_{lm}$ than parallel-flow for identical temperature endpoints, requiring less heat exchange area."
                },
                {
                        "title": "Reynolds Number (Dynamic Similarity & Flow Regime)",
                        "formula": "$$Re = \\frac{\\rho v D}{\\mu} = \\frac{v D}{\\nu}$$",
                        "description": "Dimensionless parameter representing ratio of inertial forces to viscous forces; governs laminar vs turbulent transitions in pipe and boundary layer flows.",
                        "examTip": "Found in Fluid Mechanics. For internal conduit flow: $Re < 2100$ is laminar; $Re > 4000$ is turbulent. Kinematic viscosity is $\\nu = \\mu / \\rho$."
                },
                {
                        "title": "Work-Energy Principle (Rigid Body Dynamics)",
                        "formula": "$$T_1 + \\sum U_{1-2} = T_2, \\quad T = \\frac{1}{2} m v_G^2 + \\frac{1}{2} I_G \\omega^2$$",
                        "description": "The net work done by all external forces and couples acting on a body during displacement equals the change in its total kinetic energy (translation plus rotation).",
                        "examTip": "Found in Dynamics. For rolling without slipping on stationary surfaces, kinetic energy simplifies to $T = \\frac{1}{2} I_{IC} \\omega^2$ about the instantaneous center."
                },
                {
                        "title": "Castigliano’s Second Theorem (Deflection from Strain Energy)",
                        "formula": "$$\\delta_i = \\frac{\\partial U}{\\partial P_i}, \\quad \\theta_i = \\frac{\\partial U}{\\partial M_i}$$",
                        "description": "The partial derivative of total elastic strain energy $U$ with respect to an applied concentrated force $P_i$ equals the displacement $\\delta_i$ in that direction.",
                        "examTip": "Found in Mechanics of Materials. For bending beams: $U = \\int \\frac{M^2}{2EI} dx$. Differentiate under the integral: $\\delta_i = \\int \\frac{M}{EI}\\left(\\frac{\\partial M}{\\partial P_i}\\right) dx$."
                },
                {
                        "title": "Ideal Rankine Cycle Thermal Efficiency (Vapor Power)",
                        "formula": "$$\\eta_{\\text{th}} = \\frac{w_{\\text{net}}}{q_{\\text{in}}} = \\frac{(h_3 - h_4) - (h_2 - h_1)}{h_3 - h_2}$$",
                        "description": "Defines thermal efficiency of steam power cycles using thermodynamic enthalpies at boiler inlet, turbine inlet, condenser inlet, and pump inlet.",
                        "examTip": "Found in Thermodynamics. Pump work is $w_p = h_2 - h_1 \\approx v_1(P_2 - P_1)$. Remember to convert $v_1$ in $\\text{m}^3/\\text{kg}$ and $P$ in $\\text{kPa}$ to yield $\\text{kJ/kg}$."
                },
                {
                        "title": "Continuity Equation (Conservation of Mass)",
                        "formula": "$$\\dot{m} = \\rho_1 A_1 v_1 = \\rho_2 A_2 v_2 \\implies Q = A_1 v_1 = A_2 v_2$$",
                        "description": "Expresses steady mass conservation in conduits; when fluid density $\\rho$ is constant, volumetric flow rate $Q = A v$ is invariant along any streamtube.",
                        "examTip": "Found in Fluid Mechanics. Velocity is inversely proportional to diameter squared: $v_2 = v_1 (D_1 / D_2)^2$. Halving the pipe diameter quadruples fluid velocity."
                },
                {
                        "title": "Thin-Walled Pressure Vessel (Hoop vs Longitudinal Stress)",
                        "formula": "$$\\sigma_h = \\frac{P r}{t} = \\frac{P d}{2t}, \\quad \\sigma_l = \\frac{P r}{2t} = \\frac{P d}{4t}$$",
                        "description": "Calculates circumferential hoop stress $\\sigma_h$ and longitudinal stress $\\sigma_l$ for thin cylindrical shells where ratio $r/t \\ge 10$.",
                        "examTip": "Found in Mechanics of Materials. Hoop stress is twice longitudinal stress ($\\sigma_h = 2\\sigma_l$). Failure in cylindrical tanks almost always occurs along longitudinal seams."
                },
                {
                        "title": "SDOF Undamped Natural Frequency (Mechanical Vibrations)",
                        "formula": "$$\\omega_n = \\sqrt{\\frac{k}{m}} \\text{ [rad/s]}, \\quad f_n = \\frac{\\omega_n}{2\\pi} = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} \\text{ [Hz]}$$",
                        "description": "Calculates fundamental natural circular frequency $\\omega_n$ and cyclic frequency $f_n$ for a single-degree-of-freedom mass-spring mechanical oscillator.",
                        "examTip": "Found in Mechanical Design and Dynamics. Watch units closely: $\\omega_n$ is in rad/s, while $f_n$ is in cycles/s (Hz). Natural period is $\\tau_n = 1 / f_n = 2\\pi / \\omega_n$."
                },
                {
                        "title": "Ideal Otto Cycle Efficiency (Internal Combustion)",
                        "formula": "$$\\eta_{\\text{th, Otto}} = 1 - \\frac{1}{r^{k-1}}, \\quad r = \\frac{V_{\\text{max}}}{V_{\\text{min}}}$$",
                        "description": "Thermal efficiency of idealized four-stroke spark-ignition engines as a function of volumetric compression ratio $r$ and specific heat ratio $k = c_p/c_v$.",
                        "examTip": "Found in Thermodynamics. For cold air standard assumptions, $k = 1.4$. Increasing compression ratio improves efficiency, limited practically by engine knock."
                },
                {
                        "title": "Speed of Sound & Mach Number (Compressible Flow)",
                        "formula": "$$c = \\sqrt{k R T}, \\quad M = \\frac{v}{c}$$",
                        "description": "Calculates acoustic speed $c$ in an ideal gas and Mach number $M$, establishing boundaries between subsonic ($M < 1$), sonic ($M = 1$), and supersonic ($M > 1$) flows.",
                        "examTip": "Found in Fluid Mechanics. Specific gas constant for air is $R = 287 \\text{ J/(kg}\\cdot\\text{K)}$. Temperature $T$ must ALWAYS be in absolute Kelvin (\\text{K})."
                },
                {
                        "title": "Modified Goodman Fatigue Criterion (Fluctuating Stresses)",
                        "formula": "$$\\frac{\\sigma_a}{S_e} + \\frac{\\sigma_m}{S_{ut}} = \\frac{1}{N_f}$$",
                        "description": "Evaluates fatigue safety factor $N_f$ for ductile mechanical parts under cyclic loading with alternating stress $\\sigma_a$, mean stress $\\sigma_m$, endurance limit $S_e$, and ultimate tensile strength $S_{ut}$.",
                        "examTip": "Found in Mechanical Design. Alternating stress $\\sigma_a = (\\sigma_{\\text{max}} - \\sigma_{\\text{min}})/2$; mean stress $\\sigma_m = (\\sigma_{\\text{max}} + \\sigma_{\\text{min}})/2$. If $\\sigma_m \\le 0$, mean stress effect is zero."
                },
                {
                        "title": "Linear Impulse and Momentum Theorem (Impact & Jet Forces)",
                        "formula": "$$\\vec{I} = \\int_{t_1}^{t_2} \\sum \\vec{F} dt = m \\vec{v}_2 - m \\vec{v}_1 = \\Delta \\vec{p}$$",
                        "description": "The net impulse of external forces acting on a body over time interval $\\Delta t$ equals the vector change in linear momentum, fundamental to impact and fluid vane reactions.",
                        "examTip": "Found in Dynamics and Fluid Mechanics. For steady fluid jets deflecting across stationary/moving blades: $\\vec{F} = \\dot{m}(\\vec{v}_{in} - \\vec{v}_{out})$. Respect vector directions!"
                }
        ],
        "Civil": [
                {
                        "title": "Darcy’s Law for Hydraulic Seepage",
                        "formula": "$$Q = k \\cdot i \\cdot A = k \\left(\\frac{\\Delta h}{L}\\right) A$$",
                        "description": "Governs fluid flow through porous soil media; discharge $Q$ is proportional to hydraulic conductivity $k$, gradient $i$, and cross-sectional seepage area $A$.",
                        "examTip": "Found in Geotechnical Engineering. Watch unit conversions: hydraulic conductivity $k$ is often given in $\\text{cm/s}$, while area is in $\\text{m}^2$ or $\\text{ft}^2$."
                },
                {
                        "title": "Manning’s Equation for Open Channel Flow",
                        "formula": "$$V = \\frac{k}{n} R_h^{2/3} S^{1/2} \\quad (k = 1.0\\text{ SI}, \\; 1.486\\text{ USCS})$$",
                        "description": "Estimates mean velocity of uniform gravity-driven open channel flow as a function of roughness coefficient $n$, hydraulic radius $R_h$, and channel bed slope $S$.",
                        "examTip": "Found in Hydraulics and Hydrologic Systems. Hydraulic radius $R_h = A / P_w$, where $P_w$ is strictly the wetted perimeter."
                },
                {
                        "title": "Terzaghi’s Effective Stress Principle",
                        "formula": "$$\\sigma' = \\sigma - u$$",
                        "description": "Total normal stress $\\sigma$ applied to a soil mass is partitioned between the mineral skeleton (effective stress $\\sigma'$) and interstitial pore water pressure $u$.",
                        "examTip": "Found in Geotechnical Engineering. Only effective stress $\\sigma'$ controls soil shear strength and consolidation settlement. Pore water carries zero shear stress."
                },
                {
                        "title": "Euler’s Critical Buckling Load for Columns",
                        "formula": "$$P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}$$",
                        "description": "Determines the maximum axial compressive load that a slender structural column can sustain before undergoing sudden lateral elastic instability.",
                        "examTip": "Found in Structural Mechanics and Steel Design. Effective length factor $K$: pinned-pinned $K=1.0$, fixed-fixed $K=0.5$, fixed-pinned $K=0.7$, fixed-free $K=2.0$."
                },
                {
                        "title": "Boussinesq Vertical Stress Distribution",
                        "formula": "$$\\Delta \\sigma_z = \\frac{3 P}{2\\pi z^2} \\left[1 + \\left(\\frac{r}{z}\\right)^2\\right]^{-5/2}$$",
                        "description": "Calculates the increase in vertical stress $\\Delta \\sigma_z$ at depth $z$ and radial distance $r$ inside a semi-infinite, elastic soil mass due to a concentrated surface point load $P$.",
                        "examTip": "Found in Geotechnical Engineering. Directly underneath the point load ($r=0$), the equation simplifies to $\\Delta \\sigma_z = \\frac{3P}{2\\pi z^2} = 0.4775 \\frac{P}{z^2}$."
                },
                {
                        "title": "Hazen-Williams Equation for Pipe Head Loss",
                        "formula": "$$V = k_1 C R_h^{0.63} S^{0.54} \\quad (k_1 = 0.849\\text{ SI}, \\; 1.318\\text{ USCS})$$",
                        "description": "Empirical relationship relating water flow velocity in pressure conduits to pipe roughness coefficient $C$, hydraulic radius $R_h$, and energy slope $S$.",
                        "examTip": "Found in Water Resources / Environmental. Applicable strictly to water flow at ordinary temperatures ($60^\\circ\\text{F} / 15^\\circ\\text{C}$). Higher $C$ means smoother pipe."
                },
                {
                        "title": "Rational Method for Peak Storm Runoff",
                        "formula": "$$Q = C \\cdot I \\cdot A$$",
                        "description": "Estimates maximum design peak stormwater runoff discharge $Q$ from a drainage basin as a function of runoff coefficient $C$, rainfall intensity $I$, and catchment area $A$.",
                        "examTip": "Found in Hydrology. In USCS units: with $I$ in inches/hour and $A$ in acres, $Q$ directly equals cubic feet per second ($1\\text{ cfs} \\approx 1.008\\text{ acre-in/hr}$)."
                },
                {
                        "title": "Rankine Lateral Earth Pressure Coefficients",
                        "formula": "$$K_a = \\tan^2\\left(45^\\circ - \\frac{\\phi}{2}\\right), \\quad K_p = \\tan^2\\left(45^\\circ + \\frac{\\phi}{2}\\right)$$",
                        "description": "Computes active ($K_a$) and passive ($K_p$) lateral earth pressure coefficients for cohesionless soils with internal friction angle $\\phi$ behind a vertical retaining wall.",
                        "examTip": "Found in Geotechnical Engineering. Note that $K_p = 1 / K_a$. Active pressure develops when the wall moves away from soil; passive requires wall pushing into soil."
                },
                {
                        "title": "One-Dimensional Primary Consolidation Settlement",
                        "formula": "$$S_c = \\frac{C_c H_0}{1 + e_0} \\log_{10}\\left(\\frac{\\sigma'_0 + \\Delta \\sigma'}{\\sigma'_0}\\right)$$",
                        "description": "Predicts ultimate vertical settlement of a normally consolidated clay stratum of initial thickness $H_0$ and void ratio $e_0$ subjected to stress increment $\\Delta \\sigma'$.",
                        "examTip": "Found in Geotechnical Engineering. For overconsolidated clay where $\\sigma'_0 + \\Delta \\sigma' \\le \\sigma'_p$, use the recompression index $C_r$ (or $C_s$) instead of $C_c$."
                },
                {
                        "title": "Terzaghi’s Ultimate Bearing Capacity Equation",
                        "formula": "$$q_{ult} = c' N_c + q N_q + \\frac{1}{2}\\gamma B N_\\gamma$$",
                        "description": "Determines the ultimate bearing capacity of a shallow strip footing resting on soil with cohesion $c'$, surcharge $q = \\gamma D_f$, unit weight $\\gamma$, and footing width $B$.",
                        "examTip": "Found in Foundation Engineering. Bearing capacity factors $N_c, N_q, N_\\gamma$ depend solely on soil friction angle $\\phi$ (tabulated in the NCEES Handbook)."
                },
                {
                        "title": "Whitney Rectangular Stress Block (Concrete Design)",
                        "formula": "$$a = \\beta_1 c, \\quad C_c = 0.85 f'_c a b, \\quad T = A_s f_y$$",
                        "description": "Replaces the actual non-linear parabolic concrete compression zone with an equivalent uniform stress block of depth $a = \\beta_1 c$ and intensity $0.85 f'_c$.",
                        "examTip": "Found in Reinforced Concrete Design. Nominal flexural strength is $M_n = A_s f_y (d - a/2)$. Factor $\\beta_1 = 0.85$ for $f'_c \\le 4000\\text{ psi}$ and reduces by 0.05 per 1000 psi."
                },
                {
                        "title": "Plastic Moment Capacity of Structural Steel",
                        "formula": "$$M_p = F_y Z_x$$",
                        "description": "Represents the full plastic bending moment capacity of a structural steel section where every fiber across the cross-section has reached yield stress $F_y$.",
                        "examTip": "Found in Structural Steel Design. $Z_x$ is the plastic section modulus ($Z_x > S_x$). Shape factor is $k = Z_x / S_x$, typically $\\sim 1.10 - 1.15$ for standard I-beams."
                },
                {
                        "title": "Transverse Shear Stress Formula (Jourawski)",
                        "formula": "$$\\tau = \\frac{V Q}{I b}$$",
                        "description": "Calculates horizontal and vertical shear stress in a beam cross section subjected to internal shear force $V$, where $Q$ is the first moment of area above the cut line.",
                        "examTip": "Found in Mechanics of Materials. Maximum shear stress in a rectangular beam ($b \\times h$) occurs at the neutral axis and equals $\\tau_{\\text{max}} = \\frac{3V}{2A}$."
                },
                {
                        "title": "Greenshields Macroscopic Traffic Flow Model",
                        "formula": "$$v = v_f \\left(1 - \\frac{k}{k_j}\\right), \\quad q = k v = v_f \\left(k - \\frac{k^2}{k_j}\\right)$$",
                        "description": "Fundamental linear model relating traffic space-mean speed $v$ to density $k$, yielding a parabolic flow-density relationship with maximum capacity at $k_j / 2$.",
                        "examTip": "Found in Transportation Engineering. Maximum flow rate (highway capacity) occurs at $q_{\\text{max}} = \\frac{v_f k_j}{4}$ at optimum speed $v_o = v_f / 2$."
                },
                {
                        "title": "Stopping Sight Distance (SSD)",
                        "formula": "$$SSD = 1.47 V t_r + \\frac{V^2}{30\\left(\\frac{a}{32.2} \\pm G\\right)}$$",
                        "description": "Computes total distance required for a vehicle travelling at speed $V$ [mph] to stop safely, incorporating brake reaction distance and braking deceleration on grade $G$.",
                        "examTip": "Found in Highway Design. AASHTO standard reaction time is $t_r = 2.5\\text{ s}$ and deceleration rate is $a = 11.2\\text{ ft/s}^2$ ($a/32.2 = 0.35$)."
                },
                {
                        "title": "Horizontal Curve Minimum Radius & Superelevation",
                        "formula": "$$R_{\\text{min}} = \\frac{V^2}{15(0.01 e_{\\text{max}} + f_{\\text{max}})}$$",
                        "description": "Governs horizontal alignment design, balancing centrifugal force against lateral tire friction factor $f_{\\text{max}}$ and roadway superelevation rate $e_{\\text{max}}$.",
                        "examTip": "Found in Transportation Engineering. In this USCS equation, speed $V$ is in mph, superelevation $e$ is in percent (e.g., 6% = 6), and radius $R$ is in feet."
                },
                {
                        "title": "Unconfined Aquifer Dupuit-Thiem Well Formula",
                        "formula": "$$Q = \\frac{\\pi K (h_2^2 - h_1^2)}{\\ln(r_2 / r_1)}$$",
                        "description": "Estimates steady-state radial pumping discharge $Q$ from an unconfined aquifer with hydraulic conductivity $K$ based on piezometric heads $h_1, h_2$ at observation radii $r_1, r_2$.",
                        "examTip": "Found in Hydrology and Water Resources. For confined aquifers, the head term is linear: $Q = \\frac{2\\pi K b (h_2 - h_1)}{\\ln(r_2 / r_1)}$ where $b$ is aquifer thickness."
                },
                {
                        "title": "Slenderness Ratio for Steel Compression Members",
                        "formula": "$$\\lambda = \\frac{K L}{r}, \\quad r = \\sqrt{\\frac{I}{A}}$$",
                        "description": "Measures column susceptibility to lateral buckling as the ratio of effective unbraced length $K L$ to minimum radius of gyration $r$.",
                        "examTip": "Found in Structural Steel Design. Always evaluate buckling about the weak axis (minimum radius of gyration $r_y$) unless braced against lateral deflection."
                },
                {
                        "title": "Balanced Steel Reinforcement Ratio in Concrete",
                        "formula": "$$\\rho_b = 0.85 \\beta_1 \\frac{f'_c}{f_y} \\left(\\frac{87{,}000}{87{,}000 + f_y}\\right)$$",
                        "description": "The theoretical reinforcement ratio where tension steel reaches yield strain $\\epsilon_y = f_y / E_s$ at the exact instant concrete reaches crushing strain $\\epsilon_u = 0.003$.",
                        "examTip": "Found in Reinforced Concrete Design. ACI code requires sections to be tension-controlled ($\\epsilon_t \\ge 0.005$, $\\rho \\le 0.75 \\rho_b$) to ensure ductile warning before failure."
                },
                {
                        "title": "Critical Hydraulic Gradient for Soil Boiling (Quick Condition)",
                        "formula": "$$i_{cr} = \\frac{\\gamma'}{\\gamma_w} = \\frac{G_s - 1}{1 + e}$$",
                        "description": "The upward seepage gradient at which seepage drag forces completely neutralize effective overburden stress, causing sudden loss of shear strength in cohesionless soils.",
                        "examTip": "Found in Geotechnical Engineering. When upward hydraulic gradient $i \\ge i_{cr}$, quicksand or liquefaction occurs. Factor of safety against boiling is $FS = i_{cr} / i_{\\text{exit}}$."
                },
                {
                        "title": "Sharp-Crested Rectangular Weir Flow",
                        "formula": "$$Q = C_w L H^{3/2}$$",
                        "description": "Determines flow rate $Q$ over an open channel rectangular weir of crest length $L$ under measured upstream hydrostatic head $H$.",
                        "examTip": "Found in Hydraulics. Head $H$ must be measured upstream of the drawdown curve (at least $4H$ upstream from weir crest). Standard Francis coefficient is $C_w \\approx 3.33$ USCS."
                },
                {
                        "title": "Crest Vertical Curve Length for Sight Distance",
                        "formula": "$$L = \\frac{A S^2}{200\\left(\\sqrt{h_1} + \\sqrt{h_2}\\right)^2} \\quad (S < L)$$",
                        "description": "Calculates required crest vertical curve length $L$ for algebraic grade difference $A = |g_2 - g_1|$, driver eye height $h_1 = 3.5\\text{ ft}$, and object height $h_2 = 2.0\\text{ ft}$.",
                        "examTip": "Found in Transportation. With standard AASHTO heights ($h_1 = 3.5, h_2 = 2.0$), the denominator simplifies to $2158$: $L = \\frac{A S^2}{2158}$ or $L = K A$."
                },
                {
                        "title": "Coulomb Active Lateral Earth Pressure Theory",
                        "formula": "$$P_a = \\frac{1}{2} \\gamma H^2 K_a, \\quad K_a = f(\\beta, \\phi', \\delta, \\alpha)$$",
                        "description": "Accounts for wall batter angle, backfill slope angle $\\alpha$, and soil-wall interface friction angle $\\delta$ in determining resultant lateral active earth thrust.",
                        "examTip": "Found in Geotechnical Engineering. When wall is vertical ($\\beta = 90^\\circ$), backfill is horizontal ($\\alpha = 0$), and wall friction is zero ($\\delta = 0$), Coulomb equals Rankine."
                },
                {
                        "title": "Specific Energy and Froude Number in Open Channels",
                        "formula": "$$E = y + \\frac{V^2}{2g}, \\quad Fr = \\frac{V}{\\sqrt{g D_h}}$$",
                        "description": "Defines energy head relative to channel bottom; Froude number $Fr$ delineates subcritical ($Fr < 1$), critical ($Fr = 1$), and supercritical ($Fr > 1$) flow regimes.",
                        "examTip": "Found in Hydraulics. Hydraulic depth $D_h = A / T$, where $T$ is top surface water width. Minimum specific energy occurs at critical depth ($Fr = 1$)."
                },
                {
                        "title": "Mohr-Coulomb Failure Criterion for Soils",
                        "formula": "$$\\tau_f = c' + \\sigma' \\tan\\phi'$$",
                        "description": "Fundamental shear strength equation for soils, stating that shear strength on any failure plane depends on effective cohesion $c'$, normal effective stress $\\sigma'$, and friction angle $\\phi'$.",
                        "examTip": "Found in Geotechnical Engineering. For normally consolidated sands and gravels, $c' = 0$, giving $\\tau_f = \\sigma' \\tan\\phi'$. In undrained clay loading ($\\\\phi_u = 0$), $\\tau_f = s_u$."
                }
        ],
        "Electrical and Computer": [
                {
                        "title": "Thevenin’s Equivalent Circuit Theorem",
                        "formula": "$$V_{Th} = V_{oc}, \\quad R_{Th} = \\frac{V_{oc}}{I_{sc}}$$",
                        "description": "Any linear two-terminal circuit containing independent/dependent sources and resistors can be replaced by a single ideal voltage source $V_{Th}$ in series with equivalent resistance $R_{Th}$.",
                        "examTip": "Found under Circuit Analysis. When finding $R_{Th}$ with dependent sources, connect a 1V test source at output terminals and calculate $R_{Th} = 1\\text{V} / I_{\\text{test}}$."
                },
                {
                        "title": "Norton’s Equivalent Circuit Theorem",
                        "formula": "$$I_N = I_{sc}, \\quad R_N = R_{Th} = \\frac{V_{oc}}{I_{sc}}$$",
                        "description": "States that any linear two-terminal electric network can be modeled as an ideal current source $I_N$ connected in parallel with an internal resistance $R_N$.",
                        "examTip": "Found in Circuit Analysis. Source transformations relate Thevenin and Norton: $V_{Th} = I_N R_N$ and $R_{Th} = R_N$."
                },
                {
                        "title": "Maximum Power Transfer Theorem",
                        "formula": "$$R_L = R_{Th} \\implies P_{\\text{max}} = \\frac{V_{Th}^2}{4 R_{Th}}$$",
                        "description": "Maximum active power is transferred from a linear source network to a resistive load when load resistance matches the Thevenin internal source resistance.",
                        "examTip": "Found in Electrical Circuits. In AC circuits with complex impedances, the load impedance must equal the complex conjugate: $Z_L = Z_{Th}^*$."
                },
                {
                        "title": "Kirchhoff’s Current and Voltage Laws (KCL & KVL)",
                        "formula": "$$\\sum I_{\\text{in}} = \\sum I_{\\text{out}}, \\quad \\sum_{k=1}^n V_k = 0$$",
                        "description": "Fundamental conservation laws of electrical charge (KCL at nodes) and electric potential energy (KVL around closed loops).",
                        "examTip": "Found in Circuit Analysis. Maintain strict consistency with the passive sign convention: current enters the positive terminal of absorbing elements."
                },
                {
                        "title": "Nyquist-Shannon Sampling Theorem",
                        "formula": "$$f_s \\ge 2 f_{\\text{max}}$$",
                        "description": "To completely reconstruct a continuous-time bandlimited analog signal without spectral aliasing distortion, the sampling frequency $f_s$ must be at least twice the maximum frequency component.",
                        "examTip": "Found in Signal Processing. $2 f_{\\text{max}}$ is the Nyquist rate; $f_s / 2$ is the Nyquist frequency. If $f_s < 2 f_{\\text{max}}$, high frequencies alias into lower bands."
                },
                {
                        "title": "Ohm’s Law and Joule Heating Law",
                        "formula": "$$V = I R, \\quad P = V I = I^2 R = \\frac{V^2}{R}$$",
                        "description": "Relates electric potential difference $V$, current $I$, and resistance $R$ in ohmic conductors, expressing dissipated thermal power $P$.",
                        "examTip": "Found in Circuit Analysis. Double check unit prefixes: $1\\text{ k}\\Omega = 10^3\\;\\Omega$, $1\\text{ mA} = 10^{-3}\\text{ A}$. $1\\text{ V} \\times 1\\text{ mA} = 1\\text{ mW}$."
                },
                {
                        "title": "First-Order RC Transient Response",
                        "formula": "$$v_C(t) = v_C(\\infty) + [v_C(0^+) - v_C(\\infty)] e^{-t / \\tau}, \\quad \\tau = R C$$",
                        "description": "Expresses time-domain capacitor voltage charging or discharging through equivalent resistance $R$, where $\\tau = RC$ is circuit time constant.",
                        "examTip": "Found in Transient Circuit Analysis. Capacitor voltage cannot change instantaneously ($v_C(0^+) = v_C(0^-)$). Steady state is reached in approximately $5\\tau$."
                },
                {
                        "title": "First-Order RL Inductive Transient Response",
                        "formula": "$$i_L(t) = i_L(\\infty) + [i_L(0^+) - i_L(\\infty)] e^{-t / \\tau}, \\quad \\tau = \\frac{L}{R}$$",
                        "description": "Determines the transient current through an inductor undergoing switching, governed by inductive time constant $\\tau = L / R$.",
                        "examTip": "Found in Transient Circuit Analysis. Inductor current cannot change instantaneously ($i_L(0^+) = i_L(0^-)$). At $t = \\infty$, an ideal inductor acts as a short circuit."
                },
                {
                        "title": "AC Complex Power and Power Factor",
                        "formula": "$$S = P + j Q = V_{\\text{rms}} I_{\\text{rms}}^*, \\quad pf = \\cos(\\theta_v - \\theta_i) = \\frac{P}{|S|}$$",
                        "description": "Decomposes total apparent power $S$ [VA] into real active power $P$ [W] and reactive power $Q$ [VAR], with power factor $pf$ indicating phase alignment.",
                        "examTip": "Found in AC Power Systems. Inductive loads have lagging power factor ($Q > 0$); capacitive loads have leading power factor ($Q < 0$)."
                },
                {
                        "title": "Series RLC Resonance and Bandwidth",
                        "formula": "$$\\omega_0 = \\frac{1}{\\sqrt{L C}}, \\quad Q_{\\text{factor}} = \\frac{\\omega_0 L}{R}, \\quad BW = \\frac{\\omega_0}{Q_{\\text{factor}}} = \\frac{R}{L}$$",
                        "description": "At resonant frequency $\\omega_0$, inductive and capacitive reactances cancel ($X_L = X_C$), minimizing circuit impedance to pure resistance $R$.",
                        "examTip": "Found in Frequency Response. Resonant frequency in Hertz is $f_0 = \\frac{1}{2\\pi \\sqrt{LC}}$. Half-power cutoff frequencies are $\\omega_{1,2} = \\omega_0 \\pm BW / 2$."
                },
                {
                        "title": "Ideal Operational Amplifier Closed-Loop Gain",
                        "formula": "$$A_{v, \\text{inv}} = -\\frac{R_f}{R_{\\text{in}}}, \\quad A_{v, \\text{non-inv}} = 1 + \\frac{R_f}{R_1}$$",
                        "description": "Exploits virtual short-circuit conditions ($v_+ = v_-$ and $i_+ = i_- = 0$) in negative feedback op-amps to yield precise closed-loop voltage amplification.",
                        "examTip": "Found in Electronics / Linear Circuits. Remember: output voltage cannot exceed the DC power supply rails (saturation occurs at $\\pm V_{CC}$)."
                },
                {
                        "title": "Bipolar Junction Transistor (BJT) Active Mode Relations",
                        "formula": "$$I_C = \\beta I_B, \\quad I_E = (\\beta + 1) I_B, \\quad \\alpha = \\frac{\\beta}{\\beta + 1}$$",
                        "description": "Relates collector current $I_C$, base current $I_B$, and emitter current $I_E$ in forward-active mode where base-emitter junction is forward-biased and collector-base is reverse-biased.",
                        "examTip": "Found in Electronics. Standard silicon forward-bias base-emitter drop is $V_{BE} \\approx 0.7\\text{ V}$. When saturated, $V_{CE,\\text{sat}} \\approx 0.2\\text{ V}$ and $I_C < \\beta I_B$."
                },
                {
                        "title": "MOSFET Saturation Region Drain Current",
                        "formula": "$$I_D = \\frac{1}{2} k'_n \\left(\\frac{W}{L}\\right) (V_{GS} - V_{tn})^2 (1 + \\lambda V_{DS})$$",
                        "description": "Models drain current in an n-channel enhancement MOSFET operating in saturation (pinch-off) region when $V_{GS} > V_{tn}$ and $V_{DS} \\ge V_{GS} - V_{tn}$.",
                        "examTip": "Found in Semiconductor Electronics. Channel-length modulation parameter $\\lambda$ represents finite output resistance: $r_o \\approx 1 / (\\lambda I_D)$."
                },
                {
                        "title": "Faraday’s Law of Electromagnetic Induction",
                        "formula": "$$\\mathcal{E} = -N \\frac{d\\Phi_B}{dt} = -N \\frac{d}{dt}\\left(\\int \\vec{B} \\cdot d\\vec{A}\\right)$$",
                        "description": "The electromotive force $\\mathcal{E}$ induced in a closed conducting loop is directly proportional to the time rate of change of magnetic flux $\\Phi_B$ threading the loop.",
                        "examTip": "Found in Electromagnetics. The minus sign represents Lenz’s Law: induced current produces a secondary magnetic field opposing the change in original flux."
                },
                {
                        "title": "Ampère’s Circuital Law with Maxwell’s Correction",
                        "formula": "$$\\oint \\vec{B} \\cdot d\\vec{\\ell} = \\mu_0 I_{\\text{enc}} + \\mu_0 \\epsilon_0 \\frac{d\\Phi_E}{dt}$$",
                        "description": "Relates integrated magnetic field along a closed Amperian loop to enclosed conduction current $I_{\\text{enc}}$ and Maxwell's displacement current $\\epsilon_0 \\frac{d\\Phi_E}{dt}$.",
                        "examTip": "Found in Electromagnetics. For long cylindrical wires carrying uniform current $I$ at radius $r \\ge R$, magnetic field is $B = \\frac{\\mu_0 I}{2\\pi r}$."
                },
                {
                        "title": "Gauss’s Law for Electric Fields",
                        "formula": "$$\\oint \\vec{E} \\cdot d\\vec{A} = \\frac{Q_{\\text{enc}}}{\\epsilon_0}$$",
                        "description": "Total electric flux passing outward through any closed Gaussian surface equals total enclosed electric charge $Q_{\\text{enc}}$ divided by permittivity of free space $\\epsilon_0$.",
                        "examTip": "Found in Electromagnetics. Ideal for high-symmetry geometries: point charge (spherical surface), line charge (cylindrical), and planar sheet of charge ($E = \\sigma / (2\\epsilon_0)$)."
                },
                {
                        "title": "Shannon-Hartley Channel Capacity Theorem",
                        "formula": "$$C = B \\log_2\\left(1 + \\frac{S}{N}\\right) \\text{ [bits/s]}$$",
                        "description": "Defines the absolute theoretical upper bound on error-free data transmission rate $C$ over an additive white Gaussian noise (AWGN) channel of bandwidth $B$ [Hz] and signal-to-noise ratio $S/N$.",
                        "examTip": "Found in Communications. Convert SNR from decibels to linear ratio before calculating: $S/N = 10^{(\\text{SNR}_{\\text{dB}} / 10)}$."
                },
                {
                        "title": "De Morgan’s Laws for Boolean Logic",
                        "formula": "$$\\overline{A \\cdot B} = \\overline{A} + \\overline{B}, \\quad \\overline{A + B} = \\overline{A} \\cdot \\overline{B}$$",
                        "description": "Fundamental duality theorems in Boolean algebra allowing conversion between AND and OR logic through inversion of variables and operators.",
                        "examTip": "Found in Digital Systems. Essential for NAND-only and NOR-only logic gate implementations in logic circuit minimization."
                },
                {
                        "title": "Continuous-Time Convolution Integral (LTI Systems)",
                        "formula": "$$y(t) = x(t) * h(t) = \\int_{-\\infty}^{\\infty} x(\\tau) h(t - \\tau) d\\tau$$",
                        "description": "Determines the zero-state time response $y(t)$ of any continuous linear time-invariant system by convolving input signal $x(t)$ with impulse response $h(t)$.",
                        "examTip": "Found in Signals and Systems. In Laplace frequency domain, convolution reduces to simple multiplication: $Y(s) = X(s) H(s)$."
                },
                {
                        "title": "Laplace Transform Final Value Theorem",
                        "formula": "$$\\lim_{t \\to \\infty} f(t) = \\lim_{s \\to 0} s F(s)$$",
                        "description": "Calculates the steady-state value of a time-domain signal directly from its Laplace transform $F(s)$ without inverse transforming.",
                        "examTip": "Found in Control Systems. Valid ONLY if all poles of $s F(s)$ lie strictly in the open left half of the s-plane (system must be stable)."
                },
                {
                        "title": "Transmission Line Reflection Coefficient and SWR",
                        "formula": "$$\\Gamma = \\frac{Z_L - Z_0}{Z_L + Z_0}, \\quad SWR = \\frac{1 + |\\Gamma|}{1 - |\\Gamma|}$$",
                        "description": "Measures the fraction of incident electromagnetic wave reflected at the termination of a transmission line with characteristic impedance $Z_0$ and load impedance $Z_L$.",
                        "examTip": "Found in Electromagnetics / RF. Matched load ($Z_L = Z_0$) gives $\\Gamma = 0, SWR = 1$. Open circuit ($Z_L = \\infty$) gives $\\Gamma = +1$; short circuit ($Z_L = 0$) gives $\\Gamma = -1$."
                },
                {
                        "title": "Poynting Vector for Electromagnetic Energy Flow",
                        "formula": "$$\\vec{S} = \\vec{E} \\times \\vec{H}, \\quad S_{\\text{avg}} = \\frac{1}{2} \\text{Re}\\{\\vec{E} \\times \\vec{H}^*\\} = \\frac{E_{\\text{peak}}^2}{2 \\eta}$$",
                        "description": "Represents directional power density vector [$\\text{W/m}^2$] carried by propagating electromagnetic waves, where $\\eta = \\sqrt{\\mu_0 / \\epsilon_0} \\approx 377\\;\\Omega$ is free space wave impedance.",
                        "examTip": "Found in Electromagnetics. Power through surface area $A$ is $P = \\int \\vec{S} \\cdot d\\vec{A}$. For TEM waves in vacuum, $|E| / |H| = \\eta_0 \\approx 120\\pi\\;\\Omega$."
                },
                {
                        "title": "Balanced Balanced 3-Phase Power Equations",
                        "formula": "$$P_{3\\phi} = \\sqrt{3} V_L I_L \\cos\\theta, \\quad Q_{3\\phi} = \\sqrt{3} V_L I_L \\sin\\theta, \\quad S_{3\\phi} = \\sqrt{3} V_L I_L$$",
                        "description": "Calculates total active, reactive, and complex apparent power delivered to a balanced three-phase load in terms of line-to-line voltage $V_L$ and line current $I_L$.",
                        "examTip": "Found in Power Engineering. In Wye ($Y$) connections: $V_L = \\sqrt{3} V_{\\text{phase}}, I_L = I_{\\text{phase}}$. In Delta ($\\Delta$) connections: $V_L = V_{\\text{phase}}, I_L = \\sqrt{3} I_{\\text{phase}}$."
                },
                {
                        "title": "State-Space Linear Dynamical System Representation",
                        "formula": "$$\\dot{\\vec{x}}(t) = \\mathbf{A}\\vec{x}(t) + \\mathbf{B}\\vec{u}(t), \\quad \\vec{y}(t) = \\mathbf{C}\\vec{x}(t) + \\mathbf{D}\\vec{u}(t)$$",
                        "description": "Matrix formulation for multi-input multi-output (MIMO) dynamic control systems, where eigenvalues of state matrix $\\mathbf{A}$ determine system stability.",
                        "examTip": "Found in Control Systems. Transfer function matrix is $\\mathbf{H}(s) = \\mathbf{C}(s\\mathbf{I} - \\mathbf{A})^{-1}\\mathbf{B} + \\mathbf{D}$."
                },
                {
                        "title": "Boolean Consensus Theorem",
                        "formula": "$$A B + \\overline{A} C + B C = A B + \\overline{A} C$$",
                        "description": "Enables algebraic elimination of redundant consensus term $BC$ in sum-of-products Boolean expressions.",
                        "examTip": "Found in Digital Systems. The consensus term $BC$ contains variables from two terms where variable $A$ appears inverted in one and non-inverted in the other."
                }
        ],
        "Chemical": [
                {
                        "title": "Le Chatelier’s Principle & Standard Free Energy",
                        "formula": "$$\\Delta G^\\circ = -R T \\ln(K_{eq})$$",
                        "description": "Relates standard Gibbs free energy of reaction $\\Delta G^\\circ$ to the equilibrium constant $K_{eq}$; external changes shift equilibrium to counteract disturbance.",
                        "examTip": "Found in Chemical Reaction Engineering. Increasing pressure shifts toward fewer gas moles; endothermic reactions have increased $K_{eq}$ at higher temperatures."
                },
                {
                        "title": "Arrhenius Temperature Dependency of Rate Constants",
                        "formula": "$$k = A e^{-E_a / (R T)} \\iff \\ln\\left(\\frac{k_2}{k_1}\\right) = \\frac{E_a}{R}\\left(\\frac{1}{T_1} - \\frac{1}{T_2}\\right)$$",
                        "description": "Expresses relationship between absolute temperature $T$ and chemical reaction rate constant $k$ based on activation energy $E_a$.",
                        "examTip": "Found in Chemical Kinetics. Universal gas constant $R = 8.314\\text{ J/(mol}\\cdot\\text{K)}$. Always use absolute Kelvin for temperatures."
                },
                {
                        "title": "Raoult’s Law for Ideal Vapor-Liquid Equilibrium",
                        "formula": "$$y_i P = x_i P_i^{\\text{sat}}(T)$$",
                        "description": "In ideal mixtures, partial pressure of component $i$ in vapor equals product of liquid mole fraction $x_i$ and pure component vapor pressure $P_i^{\\text{sat}}$.",
                        "examTip": "Found in Separation Processes. Total pressure is $P = \\sum x_i P_i^{\\text{sat}}$. For non-ideal liquid solutions, introduce activity coefficients $\\gamma_i$."
                },
                {
                        "title": "Henry’s Law for Dilute Gas-Liquid Solubility",
                        "formula": "$$P_i = H_i \\cdot x_i$$",
                        "description": "States that for a sparingly soluble gas in liquid at low concentration, the equilibrium partial pressure $P_i$ is directly proportional to liquid mole fraction $x_i$.",
                        "examTip": "Found in Mass Transfer and Chemical Thermodynamics. Watch units: Henry's constant $H_i$ can be expressed in $\\text{atm}$, $\\text{bar}$, or $\\text{mol/(L}\\cdot\\text{atm)}$."
                },
                {
                        "title": "Fick’s First Law of Molecular Diffusion",
                        "formula": "$$J_A = -D_{AB} \\frac{dC_A}{dz}$$",
                        "description": "Defines molar diffusive flux $J_A$ as proportional to negative concentration gradient $dC_A / dz$ and binary molecular diffusivity $D_{AB}$.",
                        "examTip": "Found in Mass Transfer. In bulk flow, total flux is $N_A = J_A + x_A (N_A + N_B)$. For equimolar counterdiffusion (EMD), $N_A = -N_B$."
                },
                {
                        "title": "Clausius-Clapeyron Equation for Phase Equilibrium",
                        "formula": "$$\\ln\\left(\\frac{P_2^{\\text{sat}}}{P_1^{\\text{sat}}}\\right) = -\\frac{\\Delta H_{\\text{vap}}}{R}\\left(\\frac{1}{T_2} - \\frac{1}{T_1}\\right)$$",
                        "description": "Relates saturation vapor pressure changes to temperature and latent heat of vaporization $\\Delta H_{\\text{vap}}$, assuming ideal vapor behavior.",
                        "examTip": "Found in Thermodynamics. Plotting $\\ln(P^{\\text{sat}})$ versus $1/T$ yields a straight line with slope equal to $-\\Delta H_{\\text{vap}} / R$."
                },
                {
                        "title": "Antoine Equation for Saturated Vapor Pressure",
                        "formula": "$$\\log_{10}(P^{\\text{sat}}) = A - \\frac{B}{T + C}$$",
                        "description": "Empirical three-parameter equation calculating saturated vapor pressure $P^{\\text{sat}}$ of pure compounds as a function of temperature $T$.",
                        "examTip": "Found in Mass Transfer and Physical Properties. Verify units of constants $A, B, C$: temperature may be in $^\\circ\\text{C}$ while pressure is in $\\text{mmHg}$ or $\\text{bar}$."
                },
                {
                        "title": "Ergun Equation for Packed Bed Pressure Drop",
                        "formula": "$$\\frac{\\Delta P}{L} = 150 \\frac{\\mu (1-\\epsilon)^2 v_0}{\\epsilon^3 d_p^2} + 1.75 \\frac{\\rho (1-\\epsilon) v_0^2}{\\epsilon^3 d_p}$$",
                        "description": "Calculates total pressure drop across packed beds of spherical particles, summing viscous laminar losses and turbulent inertial drag.",
                        "examTip": "Found in Chemical Fluid Mechanics. $\\epsilon$ is bed void fraction; $v_0$ is superficial fluid velocity (empty tube velocity); $d_p$ is particle diameter."
                },
                {
                        "title": "Hagen-Poiseuille Equation for Laminar Pipe Flow",
                        "formula": "$$\\Delta P = \\frac{128 \\mu L Q}{\\pi D^4}$$",
                        "description": "Computes pressure drop for laminar, incompressible, viscous flow through a circular pipe of length $L$ and diameter $D$.",
                        "examTip": "Found in Fluid Mechanics. Notice the fourth power on diameter: reducing pipe diameter by half increases pressure drop by a factor of 16 for constant $Q$."
                },
                {
                        "title": "Van der Waals Equation of State for Real Gases",
                        "formula": "$$\\left(P + \\frac{a}{v^2}\\right)(v - b) = R T$$",
                        "description": "Adjusts ideal gas law for real molecular interactions: parameter $a$ accounts for intermolecular attractive forces, and $b$ accounts for finite molecular volume.",
                        "examTip": "Found in Chemical Thermodynamics. Parameters relate to critical properties: $a = \\frac{27 R^2 T_c^2}{64 P_c}$ and $b = \\frac{R T_c}{8 P_c}$."
                },
                {
                        "title": "Compressibility Factor Real Gas Equation",
                        "formula": "$$P v = Z R T, \\quad Z = f(T_r, P_r)$$",
                        "description": "Quantifies deviation of real gas behaviour from ideality through compressibility factor $Z$, plotted on generalized compressibility charts against reduced properties.",
                        "examTip": "Found in Thermodynamics. Reduced properties are $T_r = T / T_c$ and $P_r = P / P_c$. For an ideal gas, $Z = 1$."
                },
                {
                        "title": "Michaelis-Menten Enzyme Kinetics",
                        "formula": "$$v = \\frac{V_{\\text{max}} [S]}{K_m + [S]}$$",
                        "description": "Models rate of enzymatic reaction $v$ as a function of substrate concentration $[S]$, maximum velocity $V_{\\text{max}}$, and Michaelis constant $K_m$.",
                        "examTip": "Found in Biochemical Engineering. When $[S] = K_m$, reaction velocity is exactly half of maximum ($v = V_{\\text{max}} / 2$)."
                },
                {
                        "title": "Gibbs Phase Rule",
                        "formula": "$$F = C - P + 2$$",
                        "description": "Determines the degrees of freedom $F$ (independent intensive variables) in a non-reacting heterogeneous system with $C$ chemical components and $P$ phases.",
                        "examTip": "Found in Chemical Thermodynamics. For a pure substance ($C=1$) at its triple point ($P=3$), $F = 1 - 3 + 2 = 0$ (invariant state point)."
                },
                {
                        "title": "Continuous Stirred-Tank Reactor (CSTR) Design Equation",
                        "formula": "$$V = \\frac{F_{A0} X_A}{-r_A}$$",
                        "description": "Governs volume $V$ required for a perfectly mixed steady-state CSTR operating at outlet reactant conversion $X_A$ and reaction rate $-r_A$.",
                        "examTip": "Found in Chemical Reaction Engineering. Because contents are well-mixed, reaction rate is evaluated strictly at the exit concentration."
                },
                {
                        "title": "Plug Flow Reactor (PFR) Differential Design Equation",
                        "formula": "$$V = F_{A0} \\int_0^{X_A} \\frac{dX_A}{-r_A}$$",
                        "description": "Calculates required reactor volume $V$ for steady plug flow tubular reactors without axial mixing as a function of molar feed rate $F_{A0}$.",
                        "examTip": "Found in Chemical Reaction Engineering. For positive reaction orders, PFR volume is always smaller than CSTR volume for the same conversion."
                },
                {
                        "title": "McCabe-Thiele Distillation Rectifying Operating Line",
                        "formula": "$$y = \\frac{R}{R+1} x + \\frac{x_D}{R+1}$$",
                        "description": "Relates vapor and liquid mole fractions between adjacent equilibrium stages in the rectifying section of a fractionating distillation column with reflux ratio $R$.",
                        "examTip": "Found in Separation Processes. Intersection with $y=x$ line occurs at distillate composition $x_D$. Minimum reflux ratio corresponds to a pinch point with the equilibrium curve."
                },
                {
                        "title": "Overall Heat Transfer Coefficient in Shell-and-Tube Exchangers",
                        "formula": "$$\\frac{1}{U A} = \\frac{1}{h_i A_i} + \\frac{\\ln(r_o/r_i)}{2\\pi k L} + \\frac{1}{h_o A_o} + R_{fi} + R_{fo}$$",
                        "description": "Combines inside/outside convective film resistances, pipe wall conduction, and fouling factors $R_f$ into a single overall heat transfer coefficient $U$.",
                        "examTip": "Found in Heat Transfer. The controlling resistance is always the smallest convection heat transfer coefficient $h$."
                },
                {
                        "title": "Biot Number for Transient Conduction",
                        "formula": "$$Bi = \\frac{h L_c}{k} < 0.1$$",
                        "description": "Compares internal thermal conduction resistance of a solid body to external convective surface resistance, where $L_c = V / A_s$ is characteristic length.",
                        "examTip": "Found in Heat Transfer. When $Bi < 0.1$, internal temperature gradients are negligible and the lumped capacitance method is valid."
                },
                {
                        "title": "Rayleigh Equation for Simple Differential Batch Distillation",
                        "formula": "$$\\ln\\left(\\frac{L_1}{L_2}\\right) = \\int_{x_2}^{x_1} \\frac{dx}{y - x}$$",
                        "description": "Relates total liquid moles remaining in still pot ($L_2$ vs initial $L_1$) to liquid composition change ($x_2$ vs $x_1$) in differential batch distillation.",
                        "examTip": "Found in Separation Processes. For constant relative volatility $\\alpha$, substitute equilibrium relation $y = \\frac{\\alpha x}{1 + (\\alpha - 1)x}$."
                },
                {
                        "title": "Thiele Modulus for Porous Catalyst Pellets",
                        "formula": "$$\\phi = L \\sqrt{\\frac{k_n C_{As}^{n-1}}{D_{eff}}}$$",
                        "description": "Dimensionless parameter evaluating the ratio of intrinsic chemical reaction rate to intraparticle pore diffusion rate in heterogeneous porous catalyst pellets.",
                        "examTip": "Found in Chemical Reaction Engineering. Small $\\phi$ ($< 0.4$) means reaction-rate limited (effectiveness factor $\\eta \\approx 1$). Large $\\phi$ ($> 4$) means strong pore diffusion control."
                },
                {
                        "title": "Nernst Equation for Electrochemical Cell Potential",
                        "formula": "$$E = E^\\circ - \\frac{R T}{n F} \\ln(Q_{\\text{rxn}})$$",
                        "description": "Calculates the real electrical reduction potential $E$ of an electrochemical cell under non-standard conditions based on reaction quotient $Q_{\\text{rxn}}$.",
                        "examTip": "Found in Chemical Kinetics / Electrochemistry. At $25^\\circ\\text{C}$ ($298\\text{ K}$), $\\frac{R T}{F} \\ln(10) \\approx 0.0592\\text{ V}$, giving $E = E^\\circ - \\frac{0.0592}{n} \\log_{10}(Q)$."
                },
                {
                        "title": "Joule-Thomson Throttling Coefficient",
                        "formula": "$$\\mu_{JT} = \\left(\\frac{\\partial T}{\\partial P}\\right)_H = \\frac{1}{c_p}\\left[T\\left(\\frac{\\partial v}{\\partial T}\\right)_P - v\\right]$$",
                        "description": "Measures temperature change of a fluid undergoing isenthalpic pressure drop across a throttling valve or porous plug.",
                        "examTip": "Found in Thermodynamics. When $\\mu_{JT} > 0$, gas cools upon expansion. For an ideal gas, $\\mu_{JT} = 0$ identically (no temperature change upon throttling)."
                },
                {
                        "title": "Schmidt Number for Momentum vs Mass Transfer",
                        "formula": "$$Sc = \\frac{\\nu}{D_{AB}} = \\frac{\\mu}{\\rho D_{AB}}$$",
                        "description": "Dimensionless number representing ratio of kinematic viscosity (momentum diffusivity) to molecular mass diffusivity $D_{AB}$.",
                        "examTip": "Found in Mass Transfer. Analogous to Prandtl number in heat transfer ($Pr = \\nu / \\alpha$). Used in Chilton-Colburn $j$-factor analogies."
                },
                {
                        "title": "Relative Volatility in Binary Vapor-Liquid Equilibrium",
                        "formula": "$$\\alpha_{AB} = \\frac{y_A / x_A}{y_B / x_B} = \\frac{P_A^{\\text{sat}}}{P_B^{\\text{sat}}}$$",
                        "description": "Measures the separability of components $A$ and $B$ by distillation; higher relative volatility allows separation with fewer equilibrium stages.",
                        "examTip": "Found in Separation Processes. If $\\alpha_{AB} = 1.0$, an azeotrope forms and separation by conventional distillation is impossible."
                },
                {
                        "title": "Sherwood Number for Convective Mass Transfer",
                        "formula": "$$Sh = \\frac{k_c L}{D_{AB}} = f(Re, Sc)$$",
                        "description": "Dimensionless mass transfer coefficient representing ratio of convective mass transfer to diffusive mass transport rate across a boundary layer.",
                        "examTip": "Found in Mass Transfer. Directly analogous to Nusselt number $Nu = h L / k$ in heat transfer."
                }
        ],
        "Industrial": [
                {
                        "title": "Little’s Law for Queueing & Work-in-Progress",
                        "formula": "$$L = \\lambda \\cdot W$$",
                        "description": "The long-term average number of items $L$ in a stationary queueing system equals the arrival rate $\\lambda$ multiplied by average time $W$ in system.",
                        "examTip": "Found in Operations Research. Applies universally regardless of arrival distribution or queue discipline (FIFO, LIFO, Priority)."
                },
                {
                        "title": "Economic Order Quantity (EOQ)",
                        "formula": "$$Q^* = \\sqrt{\\frac{2 D S}{H}}$$",
                        "description": "Optimal batch order quantity minimizing annual total inventory costs by balancing fixed order cost $S$ against annual unit holding cost $H$.",
                        "examTip": "Found under Inventory Control. $D$ is annual demand. Total annual cost curve is flat near the minimum, making EOQ robust to estimation errors."
                },
                {
                        "title": "Central Limit Theorem (Sampling Distribution)",
                        "formula": "$$\\bar{X} \\sim \\mathcal{N}\\left(\\mu, \\frac{\\sigma^2}{n}\\right), \\quad Z = \\frac{\\bar{X} - \\mu}{\\sigma / \\sqrt{n}}$$",
                        "description": "The distribution of sample means approaches a normal distribution as sample size $n$ increases ($n \\ge 30$), regardless of the population distribution.",
                        "examTip": "Found in Engineering Probability & Statistics. The standard error is $\\sigma / \\sqrt{n}$. Do not omit $\\sqrt{n}$ in the denominator!"
                },
                {
                        "title": "Exponential Distribution Memoryless Property",
                        "formula": "$$P(X > s + t \\mid X > s) = P(X > t) = e^{-\\lambda t}$$",
                        "description": "Future lifetime of an item with exponential failure time does not depend on how long it has already operated, reflecting a constant hazard rate $\\lambda$.",
                        "examTip": "Found in Reliability and Queueing. Mean time between failures is $MTBF = 1 / \\lambda$. The Poisson arrival process has exponential interarrival times."
                },
                {
                        "title": "M/M/1 Single-Server Queue Metrics",
                        "formula": "$$L_q = \\frac{\\lambda^2}{\\mu(\\mu - \\lambda)}, \\quad W_q = \\frac{\\lambda}{\\mu(\\mu - \\lambda)}, \\quad \\rho = \\frac{\\lambda}{\\mu} < 1$$",
                        "description": "Determines steady-state average queue length $L_q$ and waiting time $W_q$ for Poisson arrivals at rate $\\lambda$ and exponential service at rate $\\mu$.",
                        "examTip": "Found in Operations Research. System traffic utilization $\\rho = \\lambda / \\mu$ must be strictly less than 1 for steady-state equilibrium."
                },
                {
                        "title": "Critical Path Method (CPM) Float Equations",
                        "formula": "$$TF = LS - ES = LF - EF, \\quad FF = \\min(ES_{\\text{succ}}) - EF$$",
                        "description": "Calculates total float $TF$ and free float $FF$ for project activities; activities on the critical path have $TF = 0$.",
                        "examTip": "Found in Project Management. Earliest Start $ES = \\max(EF_{\\text{pred}})$; Latest Finish $LF = \\min(LS_{\\text{succ}})$. Delaying critical path delays project completion."
                },
                {
                        "title": "Wright’s Learning Curve Model",
                        "formula": "$$Y_x = K x^n, \\quad n = \\frac{\\log(\\text{slope})}{\\log(2)}$$",
                        "description": "Models reduction in cumulative average labor hours $Y_x$ required per unit as total cumulative production volume $x$ doubles.",
                        "examTip": "Found in Work Design / Cost Estimation. An 80% learning curve means each doubling of cumulative units reduces unit time by 20% ($n = \\log(0.80)/\\log(2) = -0.322$)."
                },
                {
                        "title": "Standard Time with Allowances",
                        "formula": "$$T_{\\text{std}} = T_{\\text{normal}} (1 + A) = (T_{\\text{observed}} \\cdot PR) (1 + A)$$",
                        "description": "Computes standard labor time by adjusting observed time with worker performance rating $PR$ and personal, fatigue, and delay allowances $A$.",
                        "examTip": "Found in Methods Engineering and Ergonomics. If performance rating is $110\\%$, worker is working $10\\%$ faster than normal pace ($PR = 1.10$)."
                },
                {
                        "title": "Shewhart $\\bar{X}$ and $R$ Statistical Process Control Charts",
                        "formula": "$$UCL_{\\bar{X}} = \\bar{\\bar{X}} + A_2 \\bar{R}, \\quad LCL_{\\bar{X}} = \\bar{\\bar{X}} - A_2 \\bar{R}$$",
                        "description": "Establishes statistical 3-sigma control limits for subgroup means $\\bar{X}$ using average range $\\bar{R}$ and sample size factor $A_2$.",
                        "examTip": "Found in Quality Engineering. Factors $A_2, D_3, D_4$ are tabulated in NCEES Handbook based on subgroup size $n$ (usually $n=4$ or $5$)."
                },
                {
                        "title": "Process Capability Index ($C_{pk}$)",
                        "formula": "$$C_{pk} = \\min\\left[\\frac{USL - \\mu}{3\\sigma}, \\frac{\\mu - LSL}{3\\sigma}\\right]$$",
                        "description": "Quantifies the ability of a manufacturing process to produce output within engineering tolerance limits ($LSL$ to $USL$), accounting for off-center mean $\\mu$.",
                        "examTip": "Found in Quality Control. $C_{pk} \\ge 1.33$ is standard industry minimum. If the process is perfectly centered on target, $C_{pk} = C_p = \\frac{USL - LSL}{6\\sigma}$."
                },
                {
                        "title": "Defects Per Million Opportunities (DPMO)",
                        "formula": "$$DPMO = \\frac{D}{U \\times O} \\times 10^6$$",
                        "description": "Normalizes defects $D$ observed across units $U$ and defect opportunities per unit $O$ into standard Six Sigma metric.",
                        "examTip": "Found in Quality Engineering. A Six Sigma quality process yields $3.4\\text{ DPMO}$ when accounting for a standard $1.5\\sigma$ long-term mean shift."
                },
                {
                        "title": "Break-Even Production Volume",
                        "formula": "$$Q_{BE} = \\frac{FC}{P - VC}$$",
                        "description": "Determines minimum production volume where total revenue equals total costs, balancing fixed costs $FC$ against unit contribution margin $(P - VC)$.",
                        "examTip": "Found in Engineering Economics. At $Q_{BE}$, profit is zero. Contribution margin ratio is $(P - VC) / P$."
                },
                {
                        "title": "Capital Recovery Factor for Uniform Series (A/P)",
                        "formula": "$$(A/P, i, n) = \\frac{i(1+i)^n}{(1+i)^n - 1}$$",
                        "description": "Calculates uniform annual worth $A$ equivalent to present investment $P$ over $n$ periods at interest rate $i$.",
                        "examTip": "Found in Engineering Economics. To find annual payment for capital asset with salvage value $S$: $A = (P - S)(A/P, i, n) + S \\cdot i$."
                },
                {
                        "title": "Single Payment Compound Amount Factor (F/P)",
                        "formula": "$$(F/P, i, n) = (1 + i)^n$$",
                        "description": "Computes future sum of money $F$ accumulated from present principal $P$ compounded at interest rate $i$ over $n$ periods.",
                        "examTip": "Found in Engineering Economics. Present worth factor is reciprocal: $(P/F, i, n) = (1 + i)^{-n}$."
                },
                {
                        "title": "Capitalized Cost for Infinite Project Life",
                        "formula": "$$CC = \\frac{A}{i} = P_0 + \\frac{A_{\\text{annual}}}{i}$$",
                        "description": "Evaluates present worth of perpetual perpetual uniform annual operating expenses $A$ over an infinite horizon ($n \\to \\infty$).",
                        "examTip": "Found in Engineering Economics. Used for public infrastructure projects (dams, bridges, roads) where life is modeled as indefinite."
                },
                {
                        "title": "Assembly Line Balancing Efficiency & Balance Delay",
                        "formula": "$$E = \\frac{\\sum t_i}{n \\cdot C_{\\text{cycle}}}, \\quad d = 1 - E$$",
                        "description": "Evaluates assembly line productivity as ratio of total work content $\\sum t_i$ to product of number of workstations $n$ and cycle time $C_{\\text{cycle}}$.",
                        "examTip": "Found in Manufacturing Systems. Cycle time is $C_{\\text{cycle}} = T_{\\text{operating}} / Q_{\\text{demand}}$. Theoretical minimum stations is $n_{\\text{min}} = \\lceil \\sum t_i / C \\rceil$."
                },
                {
                        "title": "Facility Layout Rectilinear Load-Distance Score",
                        "formula": "$$LD = \\sum_{i} \\sum_{j} w_{ij} (|x_i - x_j| + |y_i - y_j|)$$",
                        "description": "Scores plant layouts by summing materials handling flow volumes $w_{ij}$ multiplied by rectilinear travel distances between departments.",
                        "examTip": "Found in Facilities Planning. Rectilinear metric ($L_1$ norm) is standard for industrial orthogonal aisle networks."
                },
                {
                        "title": "Simple Exponential Smoothing Demand Forecast",
                        "formula": "$$F_t = F_{t-1} + \\alpha (A_{t-1} - F_{t-1}) = \\alpha A_{t-1} + (1 - \\alpha) F_{t-1}$$",
                        "description": "Short-term forecasting method updating previous forecast $F_{t-1}$ by a fraction $\\alpha$ ($0 \\le \\alpha \\le 1$) of the most recent forecast error.",
                        "examTip": "Found in Production Planning. Higher $\\alpha$ places more weight on recent demand (more responsive, less smoothing)."
                },
                {
                        "title": "First-Pass Yield (Rolled Throughput Yield)",
                        "formula": "$$RTY = \\prod_{i=1}^k Y_i$$",
                        "description": "The probability that a product passes through all $k$ sequential manufacturing steps without defect or rework.",
                        "examTip": "Found in Quality and Manufacturing. Even if five individual steps have $95\\%$ yield each, the overall $RTY = (0.95)^5 = 77.4\\%$."
                },
                {
                        "title": "Bayes’ Theorem for Quality Inspection",
                        "formula": "$$P(D \\mid +) = \\frac{P(+ \\mid D) P(D)}{P(+ \\mid D) P(D) + P(+ \\mid \\overline{D}) P(\\overline{D})}$$",
                        "description": "Revises the prior defect probability $P(D)$ after receiving a positive test result (+), accounting for false positives and false negatives.",
                        "examTip": "Found in Engineering Probability & Statistics. When defect rate $P(D)$ is very small, even tests with $99\\%$ accuracy yield low posterior probability due to false alarms."
                },
                {
                        "title": "Taguchi Quadratic Quality Loss Function",
                        "formula": "$$L(y) = k (y - m)^2, \\quad k = \\frac{A_0}{\\Delta_0^2}$$",
                        "description": "Recognizes that customer financial loss occurs quadratically whenever quality characteristic $y$ deviates from nominal target $m$, even within specification limits.",
                        "examTip": "Found in Quality Engineering. Constant $k$ equals customer loss at tolerance threshold $A_0$ divided by tolerance deviation squared $\\Delta_0^2$."
                },
                {
                        "title": "Inventory Reorder Point with Safety Stock",
                        "formula": "$$ROP = d \\cdot L + Z \\sigma_L = d \\cdot L + Z \\sigma_d \\sqrt{L}$$",
                        "description": "Sets inventory level triggering a replenishment order, balancing expected lead-time demand $d L$ against safety stock for service level $Z$.",
                        "examTip": "Found in Supply Chain / Inventory Control. $Z$ corresponds to standard normal value for desired non-stockout probability (e.g., $Z=1.645$ for 95% service level)."
                },
                {
                        "title": "Overall Equipment Effectiveness (OEE)",
                        "formula": "$$OEE = \\text{Availability} \\times \\text{Performance} \\times \\text{Quality}$$",
                        "description": "Holistic manufacturing metric benchmarking machine efficiency: Availability (uptime), Performance (speed vs design), and Quality (good units vs total).",
                        "examTip": "Found in Industrial Operations. Benchmark world-class OEE is typically $\\ge 85\\%$ ($90\\% \\text{ Avail} \\times 95\\% \\text{ Perf} \\times 99.9\\% \\text{ Qual}$)."
                },
                {
                        "title": "Poisson Distribution Probability Mass Function",
                        "formula": "$$P(X = k) = \\frac{\\lambda^k e^{-\\lambda}}{k!}, \\quad k = 0, 1, 2, \\dots$$",
                        "description": "Models count of independent random occurrences $k$ in fixed interval with constant average rate $\\lambda$, where variance equals mean ($\\text{Var}(X) = \\text{E}(X) = \\lambda$).",
                        "examTip": "Found in Engineering Statistics. Essential for arrival modelling in queues, accident frequencies, and surface defect density analysis."
                },
                {
                        "title": "Benefit-Cost Ratio Decision Criterion (B/C)",
                        "formula": "$$B/C = \\frac{PW(\\text{Benefits})}{PW(\\text{Initial Capital}) + PW(\\text{O\\&M}) - PW(\\text{Salvage})} \\ge 1.0$$",
                        "description": "Standard public sector engineering economic metric; projects are economically justified if present worth of benefits exceeds costs ($B/C \\ge 1$).",
                        "examTip": "Found in Engineering Economics. When comparing mutually exclusive alternatives, use incremental benefit-cost analysis ($\\Delta B / \\Delta C \\ge 1.0$)."
                }
        ],
        "Environmental": [
                {
                        "title": "Streeter-Phelps Dissolved Oxygen Sag Model",
                        "formula": "$$D_t = \\frac{k_1 L_0}{k_2 - k_1}\\left(e^{-k_1 t} - e^{-k_2 t}\\right) + D_0 e^{-k_2 t}$$",
                        "description": "Models downstream dissolved oxygen deficit $D_t$ in a receiving river balancing organic deoxygenation rate $k_1$ against surface reaeration rate $k_2$.",
                        "examTip": "Found in Water Quality Engineering. Critical deficit occurs where $dD/dt = 0$, giving critical travel time $t_c = \\frac{1}{k_2 - k_1}\\ln\\left[\\frac{k_2}{k_1}\\left(1 - D_0\\frac{k_2-k_1}{k_1 L_0}\\right)\\right]$."
                },
                {
                        "title": "Stokes’ Law for Particle Settling Velocity",
                        "formula": "$$v_t = \\frac{g (\\rho_p - \\rho_f) d_p^2}{18 \\mu}$$",
                        "description": "Calculates terminal settling velocity of small spherical particles in laminar flow where gravitational force balances fluid viscous drag.",
                        "examTip": "Found in Water & Wastewater Treatment. Valid strictly for particle Reynolds number $Re_p = \\rho_f v_t d_p / \\mu < 1.0$ (laminar sedimentation regime)."
                },
                {
                        "title": "Darcy’s Law for Groundwater Seepage",
                        "formula": "$$v_d = -K \\frac{dh}{dL}, \\quad v_s = \\frac{v_d}{\\eta_e}$$",
                        "description": "Determines superficial Darcy velocity $v_d$ and actual contaminant pore seepage velocity $v_s$ using hydraulic conductivity $K$ and effective porosity $\\eta_e$.",
                        "examTip": "Found in Hydrogeology / Remediation. Actual travel time of a non-retarded contaminant plume is governed by seepage velocity $v_s = v_d / \\eta_e$, not Darcy velocity."
                },
                {
                        "title": "First-Order Biochemical Oxygen Demand (BOD) Kinetics",
                        "formula": "$$BOD_t = L_0 (1 - e^{-k t})$$",
                        "description": "Expresses oxygen consumed by microbial oxidation of organic matter up to time $t$, where $L_0$ is ultimate carbonaceous oxygen demand.",
                        "examTip": "Found in Wastewater Engineering. 5-day BOD ($BOD_5$) is standard test parameter: $BOD_5 = L_0 (1 - e^{-5k})$. Temperature correction: $k_T = k_{20} \\theta^{T-20}$."
                },
                {
                        "title": "Chick-Watson Disinfection Kinetics",
                        "formula": "$$\\ln\\left(\\frac{N}{N_0}\\right) = -k C^n t$$",
                        "description": "Quantifies pathogen inactivation ratio $N / N_0$ as a function of disinfectant concentration $C$ and contact time $t$, forming the regulatory $Ct$ concept.",
                        "examTip": "Found in Drinking Water Treatment. When $n=1$, disinfection efficiency depends solely on product $C \\times t$. Regulatory pathogen removal uses log-credits ($-\\log_{10}(N/N_0)$)."
                },
                {
                        "title": "Freundlich Adsorption Isotherm",
                        "formula": "$$q_e = \\frac{x}{m} = K_f C_e^{1/n}$$",
                        "description": "Empirical relationship modeling multi-layer adsorption of organic contaminants from water onto activated carbon at equilibrium concentration $C_e$.",
                        "examTip": "Found in Water and Air Treatment. Linearized form: $\\log(q_e) = \\log(K_f) + \\frac{1}{n} \\log(C_e)$. Plotting on log-log scales yields slope $1/n$."
                },
                {
                        "title": "Langmuir Adsorption Isotherm",
                        "formula": "$$q_e = \\frac{q_{\\text{max}} b C_e}{1 + b C_e}$$",
                        "description": "Theoretical model for monolayer adsorption onto homogeneous surface sites with uniform binding energy and no adsorbate-adsorbate interaction.",
                        "examTip": "Found in Environmental Chemistry / Remediation. At high concentration ($b C_e \\gg 1$), adsorption plateaus at maximum capacity $q_e \\to q_{\\text{max}}$."
                },
                {
                        "title": "Sedimentation Basin Surface Overflow Rate (SOR)",
                        "formula": "$$SOR = \\frac{Q}{A_s} = v_c$$",
                        "description": "Defines settling velocity $v_c$ of particles that are 100% captured in an ideal horizontal-flow settling basin of plan surface area $A_s$.",
                        "examTip": "Found in Water Treatment. Any particle with settling velocity $v_t \\ge SOR$ will settle out completely. Fractional removal of slower particles is $X = v_t / SOR$."
                },
                {
                        "title": "Coagulation Rapid Mix Velocity Gradient (G-Value)",
                        "formula": "$$G = \\sqrt{\\frac{P}{\\mu V}}$$",
                        "description": "Root-mean-square fluid velocity gradient $G$ [$\\text{s}^{-1}$] quantifying turbulent shear and power dissipation $P$ in rapid mixing coagulation basins.",
                        "examTip": "Found in Water Treatment. Typical rapid mix design targets $G \\sim 700 - 1000\\text{ s}^{-1}$ with retention time $t \\sim 20 - 60\\text{ s}$ ($Gt \\sim 20{,}000 - 60{,}000$)."
                },
                {
                        "title": "Gaussian Plume Air Dispersion Model",
                        "formula": "$$C(x,y,z) = \\frac{Q}{2\\pi u \\sigma_y \\sigma_z} \\exp\\left(-\\frac{y^2}{2\\sigma_y^2}\\right)\\left[\\exp\\left(-\\frac{(z-H)^2}{2\\sigma_z^2}\\right) + \\exp\\left(-\\frac{(z+H)^2}{2\\sigma_z^2}\\right)\\right]$$",
                        "description": "Predicts downwind ground-level pollutant concentration from a continuous point source of emission rate $Q$ at effective stack height $H$.",
                        "examTip": "Found in Air Quality Engineering. Plume dispersion coefficients $\\sigma_y, \\sigma_z$ are functions of downwind distance $x$ and Pasquill-Gifford atmospheric stability classes."
                },
                {
                        "title": "Ideal Gas Conversion for Air Pollutants",
                        "formula": "$$C \\text{ [mg/m}^3\\text{]} = \\frac{C \\text{ [ppm]} \\times M_{\\text{molar}}}{24.45} \\quad (1\\text{ atm}, \\; 25^\\circ\\text{C})$$",
                        "description": "Converts gaseous contaminant concentration from parts-per-million by volume to mass per unit volume at standard ambient temperature and pressure.",
                        "examTip": "Found in Air Quality. Molar volume of ideal gas is $24.45\\text{ L/mol}$ at $25^\\circ\\text{C}$ ($298\\text{ K}$) and $22.41\\text{ L/mol}$ at $0^\\circ\\text{C}$ ($273\\text{ K}$)."
                },
                {
                        "title": "Carbonate System Total Alkalinity Balance",
                        "formula": "$$\\text{Alkalinity} = [\\text{HCO}_3^-] + 2[\\text{CO}_3^{2-}] + [\\text{OH}^-] - [\\text{H}^+]$$",
                        "description": "Measures acid-neutralizing capacity of natural waters, dominated by bicarbonate, carbonate, and hydroxide equilibrium species.",
                        "examTip": "Found in Water Chemistry. Total alkalinity is reported in $\\text{mg/L as CaCO}_3$. Equivalent weight of $\\text{CaCO}_3$ is $50\\text{ g/eq}$."
                },
                {
                        "title": "Logarithmic Sound Pressure Level Decibel Addition",
                        "formula": "$$L_{p, \\text{total}} = 10 \\log_{10}\\left(\\sum_{i=1}^n 10^{L_{p, i} / 10}\\right)$$",
                        "description": "Calculates combined sound pressure level from multiple independent noise sources, accounting for the logarithmic decibel scale.",
                        "examTip": "Found in Environmental Noise. Adding two equal noise sources ($L_1 = L_2 = 80\\text{ dB}$) increases sound level by exactly $3\\text{ dB}$ ($83\\text{ dB}$)."
                },
                {
                        "title": "Sludge Volume Index (SVI) in Activated Sludge",
                        "formula": "$$SVI = \\frac{\\text{Settled Sludge Volume after 30 min [mL/L]} \\times 1000}{\\text{Mixed Liquor Suspended Solids (MLSS) [mg/L]}}$$",
                        "description": "Assesses settling characteristics of activated sludge in secondary clarifiers; optimum range is $80 - 150\\text{ mL/g}$.",
                        "examTip": "Found in Wastewater Engineering. $SVI > 200\\text{ mL/g}$ indicates filamentous sludge bulking, preventing proper clarification."
                },
                {
                        "title": "First-Order Landfill Methane Generation Model",
                        "formula": "$$Q_{CH_4} = \\sum_{i=1}^n 2 k L_0 M_i e^{-k t_i}$$",
                        "description": "Predicts annual methane generation from municipal solid waste of mass $M_i$ based on methane generation potential $L_0$ and decay rate $k$.",
                        "examTip": "Found in Solid Waste Management. Landfill gas is typically $50\\% \\text{ CH}_4$ and $50\\% \\text{ CO}_2$ by volume."
                },
                {
                        "title": "Hazen-Williams Head Loss Equation for Water Lines",
                        "formula": "$$h_f = 10.44 \\frac{L Q^{1.852}}{C^{1.852} D^{4.87}}$$",
                        "description": "Computes friction head loss $h_f$ in water distribution networks for flow rate $Q$ [cfs], length $L$ [ft], diameter $D$ [ft], and roughness $C$.",
                        "examTip": "Found in Water Distribution. PVC pipe has $C \\approx 140 - 150$; cast iron has $C \\approx 100$. Lower $C$ represents rougher internal pipe wall."
                },
                {
                        "title": "Breakpoint Chlorination Chemistry",
                        "formula": "$$\\text{Cl}_2 + \\text{H}_2\\text{O} \\rightleftharpoons \\text{HOCl} + \\text{H}^+ + \\text{Cl}^-$$",
                        "description": "Chlorine gas hydrolyzes into hypochlorous acid ($\\text{HOCl}$), reacting with ammonia to form chloramines until breakpoint is reached, establishing free residual chlorine.",
                        "examTip": "Found in Water Treatment. $\\text{HOCl}$ is $\\sim 80\\times$ more potent germicide than hypochlorite ion $\\text{OCl}^-$. At $\\text{pH} < 7.5$, $\\text{HOCl}$ dominates."
                },
                {
                        "title": "Venturi Wet Scrubber Particle Collection Efficiency",
                        "formula": "$$\\eta = 1 - \\exp\\left(-k R \\sqrt{\\Psi}\\right), \\quad \\Psi = \\frac{C' \\rho_p d_p^2 v_r}{18 \\mu_g d_d}$$",
                        "description": "Calculates particulate removal efficiency in venturi scrubbers based on droplet-particle inertial impaction parameter $\\Psi$ and liquid-gas ratio $R$.",
                        "examTip": "Found in Air Pollution Control. Higher throat velocity increases impaction parameter $\\Psi$ and collection of fine submicron particles, but raises pressure drop."
                },
                {
                        "title": "Cyclone Separator Cut Diameter ($d_{50}$)",
                        "formula": "$$d_{pc} = \\sqrt{\\frac{9 \\mu W}{2\\pi N_e v_i (\\rho_p - \\rho_g)}}$$",
                        "description": "The particle aerodynamic diameter collected with exactly 50% efficiency in a reverse-flow cyclone separator of inlet width $W$.",
                        "examTip": "Found in Air Quality Engineering. $N_e$ is effective number of vortex turns (typically $N_e \\approx 5$). Particles with $d_p > 2 d_{pc}$ are collected with $> 90\\%$ efficiency."
                },
                {
                        "title": "Mean Cell Residence Time (Sludge Age / MCRT)",
                        "formula": "$$\\theta_c = \\frac{V X}{Q_w X_w + Q_e X_e}$$",
                        "description": "Average time in days biological microorganisms remain inside the activated sludge system, controlling nitrification and sludge settling qualities.",
                        "examTip": "Found in Wastewater Treatment. Typical domestic activated sludge targets $\\theta_c \\sim 5 - 15\\text{ days}$. Extended aeration systems operate at $\\theta_c > 20\\text{ days}$."
                },
                {
                        "title": "Food-to-Microorganism (F/M) Ratio",
                        "formula": "$$F/M = \\frac{Q S_0}{V X}$$",
                        "description": "Operational organic loading parameter relating mass of substrate entering aeration basin ($Q S_0$) per day to total biomass inventory ($V X$).",
                        "examTip": "Found in Wastewater Engineering. Units are $\\text{lb BOD}_5 / (\\text{lb MLVSS} \\cdot \\text{day})$ or $\\text{kg/kg}\\cdot\\text{d}$. Typical conventional range is $0.2 - 0.5$."
                },
                {
                        "title": "Noise Dose and Time-Weighted Average (OSHA)",
                        "formula": "$$D = 100 \\sum_{i=1}^n \\frac{C_i}{T_i}, \\quad TWA = 16.61 \\log_{10}\\left(\\frac{D}{100}\\right) + 90$$",
                        "description": "Calculates occupational noise exposure dose $D$ [%] and 8-hour equivalent $TWA$ under OSHA standard with 5-dB exchange rate.",
                        "examTip": "Found in Environmental Health / Industrial Hygiene. Permissible exposure limit is $TWA = 90\\text{ dBA}$ ($D=100\\%$); action level for hearing conservation is $85\\text{ dBA}$ ($D=50\\%$)."
                },
                {
                        "title": "Hydraulic Retention Time in Treatment Basins",
                        "formula": "$$\\theta = \\frac{V}{Q}$$",
                        "description": "Average theoretical residence time of fluid in an environmental treatment unit (clarifier, aeration basin, disinfection chamber) of volume $V$ and flow $Q$.",
                        "examTip": "Found in Water and Wastewater. In secondary clarifiers, $\\theta \\sim 2 - 3\\text{ hours}$; in chlorine contact basins, $\\theta \\sim 15 - 30\\text{ minutes}$."
                },
                {
                        "title": "Biological Nitrification Stoichiometry",
                        "formula": "$$\\text{NH}_4^+ + 1.86 \\text{O}_2 + 0.198 \\text{CO}_2 \\to 0.021 \\text{C}_5\\text{H}_7\\text{O}_2\\text{N} + 0.98 \\text{NO}_3^- + 0.041 \\text{H}_2\\text{O} + 1.98 \\text{H}^+$$",
                        "description": "Two-step aerobic autotrophic oxidation of ammonia to nitrite (Nitrosomonas) and nitrate (Nitrobacter), consuming oxygen and destroying alkalinity.",
                        "examTip": "Found in Wastewater Engineering. Nitrifying $1\\text{ mg NH}_4^+-\\text{N}$ requires $4.57\\text{ mg O}_2$ and destroys $7.14\\text{ mg CaCO}_3$ of alkalinity."
                },
                {
                        "title": "Greenhouse Gas Global Warming Potential Equivalent",
                        "formula": "$$\\text{CO}_2\\text{e} = \\sum_{i=1}^n m_i \\times GWP_i$$",
                        "description": "Normalizes impact of different greenhouse gas emissions into equivalent metric tons of carbon dioxide based on 100-year radiative forcing values.",
                        "examTip": "Found in Air Quality & Climate. Standard 100-year $GWP$: Methane ($\\text{CH}_4$) $\\sim 28 - 30$; Nitrous Oxide ($\\text{N}_2\\text{O}$) $\\sim 265 - 298$."
                }
        ],
        "Other": [
                {
                        "title": "First Law of Thermodynamics (Control Volume Energy Equation)",
                        "formula": "$$\\dot{Q} - \\dot{W} = \\sum_{\\text{out}} \\dot{m}\\left(h + \\frac{v^2}{2} + g z\\right) - \\sum_{\\text{in}} \\dot{m}\\left(h + \\frac{v^2}{2} + g z\\right)$$",
                        "description": "States general conservation of energy for an open steady-flow control volume with heat transfer, shaft work, and flowing fluid streams.",
                        "examTip": "Found in Thermodynamics. For an adiabatic turbine: $\\dot{W} = \\dot{m}(h_1 - h_2)$. For an adiabatic throttling valve: $h_1 = h_2$."
                },
                {
                        "title": "Second Law of Thermodynamics (Carnot Efficiency Limit)",
                        "formula": "$$\\eta_{\\text{max}} = 1 - \\frac{T_L}{T_H} = \\frac{T_H - T_L}{T_H}$$",
                        "description": "The absolute upper limit of thermal conversion efficiency for any heat engine operating between hot reservoir $T_H$ and cold sink $T_L$.",
                        "examTip": "Found in Thermodynamics. Always convert temperatures to absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}) before substituting!"
                },
                {
                        "title": "Work-Energy Principle for Particles",
                        "formula": "$$W_{\\text{net}} = \\Delta T = \\frac{1}{2} m v_2^2 - \\frac{1}{2} m v_1^2$$",
                        "description": "The total work done by all external conservative and non-conservative forces equals the change in kinetic energy of the mass.",
                        "examTip": "Found in Dynamics. Best method for problems involving force as a function of position or displacement where time $t$ is not needed."
                },
                {
                        "title": "Linear Impulse and Momentum Principle",
                        "formula": "$$\\int_{t_1}^{t_2} \\sum \\vec{F} dt = m \\vec{v}_2 - m \\vec{v}_1 = \\Delta \\vec{p}$$",
                        "description": "The time integral of resultant external forces acting on a body equals the change in its linear momentum vector.",
                        "examTip": "Found in Dynamics. Primary tool for solving impact, collision, and fluid jet reaction problems. Remember momentum is a vector quantity!"
                },
                {
                        "title": "Bernoulli’s Principle for Incompressible Streamline Flow",
                        "formula": "$$P_1 + \\frac{1}{2}\\rho v_1^2 + \\rho g z_1 = P_2 + \\frac{1}{2}\\rho v_2^2 + \\rho g z_2$$",
                        "description": "Conservation of mechanical energy along a streamline for frictionless, steady, incompressible flow.",
                        "examTip": "Found in Fluid Mechanics. Keep static pressure, velocity head, and elevation datum consistent between points 1 and 2.",
                        "videoUrl": "assets/videos/Bernoullis_Principle.mp4",
                        "videoTitle": "Bernoulli's Principle Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Hooke’s Law for Uniaxial Elastic Deformation",
                        "formula": "$$\\sigma = E \\epsilon, \\quad \\delta = \\frac{P L}{A E}$$",
                        "description": "Relates axial normal stress to elastic strain through Young’s modulus $E$, and determines elongation $\\delta$ under axial load $P$.",
                        "examTip": "Found in Mechanics of Materials. Valid only within the linear elastic limit (below proportional limit stress $\\sigma_{pl}$)."
                },
                {
                        "title": "Mohr’s Circle for 2D Plane Stress",
                        "formula": "$$\\sigma_{1,2} = \\frac{\\sigma_x + \\sigma_y}{2} \\pm \\sqrt{\\left(\\frac{\\sigma_x - \\sigma_y}{2}\\right)^2 + \\tau_{xy}^2}$$",
                        "description": "Yields principal normal stresses and maximum in-plane shear stress for any general plane stress state $(\\sigma_x, \\sigma_y, \\tau_{xy})$.",
                        "examTip": "Found in Mechanics of Materials. The radius of the circle directly equals the maximum in-plane shear stress $\\tau_{\\text{max}}$.",
                        "videoUrl": "assets/videos/Mohrs_Circle.mp4",
                        "videoTitle": "Mohr's Circle for Plane Stress",
                        "videoDuration": "12s"
                },
                {
                        "title": "Parallel Axis Theorem for Moment of Inertia",
                        "formula": "$$I_x = I_{xc} + A d^2, \\quad I_{xx} = I_G + m d^2$$",
                        "description": "Computes area or mass moment of inertia about any axis parallel to a known centroidal axis at perpendicular distance $d$.",
                        "examTip": "Found in Statics and Dynamics. Variable $d$ is strictly the perpendicular distance from the centroid to the new parallel reference axis.",
                        "videoUrl": "assets/videos/Parallel_Axis_Theorem.mp4",
                        "videoTitle": "Parallel Axis Theorem Explainer",
                        "videoDuration": "10s"
                },
                {
                        "title": "Newton’s Second Law for Rigid Body Planar Motion",
                        "formula": "$$\\sum \\vec{F} = m \\vec{a}_G, \\quad \\sum M_G = I_G \\alpha$$",
                        "description": "Fundamental dynamic equations governing 2D planar motion, resolving translational acceleration of center of mass $G$ and angular acceleration $\\alpha$.",
                        "examTip": "Found in Dynamics. Summing moments about an arbitrary point $P$: $\\sum M_P = I_G \\alpha + (\\vec{r}_{G/P} \\times m\\vec{a}_G)_z$."
                },
                {
                        "title": "Euler’s Column Critical Buckling Formula",
                        "formula": "$$P_{cr} = \\frac{\\pi^2 E I}{(K L)^2}$$",
                        "description": "Calculates maximum axial compressive load before sudden elastic lateral buckling occurs in a slender structural member.",
                        "examTip": "Found in Mechanics of Materials. $K$ is effective length factor: $1.0$ (pinned-pinned), $0.5$ (fixed-fixed), $0.7$ (fixed-pinned), $2.0$ (fixed-free)."
                },
                {
                        "title": "Darcy-Weisbach Pipe Friction Equation",
                        "formula": "$$h_f = f \\frac{L}{D} \\frac{v^2}{2g}$$",
                        "description": "Computes head loss in conduit flow as a function of friction factor $f$, length $L$, diameter $D$, and velocity $v$.",
                        "examTip": "Found in Fluid Mechanics. In laminar flow ($Re < 2100$), $f = 64/Re$. In turbulent flow, look up $f$ on the Moody diagram using relative roughness $\\epsilon/D$."
                },
                {
                        "title": "Fourier’s Law of Thermal Conduction",
                        "formula": "$$\\dot{Q} = -k A \\frac{dT}{dx}$$",
                        "description": "Rate of heat conduction through a material is proportional to thermal conductivity $k$, area $A$, and negative temperature gradient.",
                        "examTip": "Found in Heat Transfer. For a flat wall of thickness $L$: $\\dot{Q} = \\frac{k A}{L}(T_1 - T_2) = \\frac{\\Delta T}{R_{th}}$.",
                        "videoUrl": "assets/videos/Fouriers_Law.mp4",
                        "videoTitle": "Fourier's Law for Conduction",
                        "videoDuration": "10s"
                },
                {
                        "title": "Newton’s Law of Cooling (Convective Heat Transfer)",
                        "formula": "$$\\dot{Q}_{conv} = h A_s (T_s - T_\\infty)$$",
                        "description": "Expresses rate of heat transfer between a solid surface at temperature $T_s$ and an adjacent moving fluid at bulk temperature $T_\\infty$.",
                        "examTip": "Found in Heat Transfer. Convective thermal resistance is $R_{th} = 1 / (h A_s)$. Heat transfer coefficient $h$ depends on flow regime and geometry."
                },
                {
                        "title": "Stefan-Boltzmann Law of Thermal Radiation",
                        "formula": "$$\\dot{Q}_{emit} = \\epsilon \\sigma A T^4, \\quad \\sigma = 5.67 \\times 10^{-8} \\text{ W}/(\\text{m}^2 \\cdot \\text{K}^4)$$",
                        "description": "Total radiant power emitted by a gray body with surface emissivity $\\epsilon$ at absolute thermodynamic temperature $T$.",
                        "examTip": "Found in Heat Transfer. Temperature $T$ MUST be converted to absolute Kelvin (\\text{K}) or Rankine (^\\circ\\text{R}). For an ideal blackbody, $\\epsilon = 1$."
                },
                {
                        "title": "SDOF Undamped Natural Harmonic Frequency",
                        "formula": "$$\\omega_n = \\sqrt{\\frac{k}{m}} \\text{ [rad/s]}, \\quad f_n = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}} \\text{ [Hz]}$$",
                        "description": "Calculates natural angular frequency $\\omega_n$ and cyclic frequency $f_n$ for an undamped single-degree-of-freedom mass-spring mechanical oscillator.",
                        "examTip": "Found in Dynamics. Natural period of oscillation is $\\tau_n = 1 / f_n = 2\\pi / \\omega_n$."
                },
                {
                        "title": "Ideal Gas Law Equation of State",
                        "formula": "$$P V = m R T = n \\bar{R} T, \\quad \\bar{R} = 8.314\\text{ kJ/(kmol}\\cdot\\text{K)}$$",
                        "description": "Relates pressure $P$, volume $V$, and absolute temperature $T$ for gases at low pressure and moderate temperature.",
                        "examTip": "Found in Thermodynamics / Chemistry. Specific gas constant $R = \\bar{R} / M_{\\text{molar}}$. For air, $R = 0.287\\text{ kJ/(kg}\\cdot\\text{K)}$."
                },
                {
                        "title": "Hydrostatic Pressure Distribution with Depth",
                        "formula": "$$P = P_0 + \\rho g h = P_0 + \\gamma h$$",
                        "description": "Pressure increase in a static incompressible fluid is directly proportional to fluid density $\\rho$, gravity $g$, and submerged depth $h$.",
                        "examTip": "Found in Fluid Mechanics. Gauge pressure ignores atmospheric surface pressure $P_0$: $P_{\\text{gauge}} = \\gamma h$."
                },
                {
                        "title": "Continuity Equation for Incompressible Flow",
                        "formula": "$$A_1 v_1 = A_2 v_2 = Q$$",
                        "description": "Conservation of mass in a fluid conduit; when fluid density $\\rho$ is constant, volumetric flow rate $Q = A v$ is constant everywhere.",
                        "examTip": "Found in Fluid Mechanics. Flow velocity varies inversely with cross-sectional area: $v_2 = v_1 (A_1 / A_2) = v_1 (D_1 / D_2)^2$."
                },
                {
                        "title": "Elastic Flexure Formula for Beam Bending",
                        "formula": "$$\\sigma = -\\frac{M y}{I} \\implies \\sigma_{\\text{max}} = \\frac{M}{S}$$",
                        "description": "Determines longitudinal normal bending stress at distance $y$ from the neutral axis under internal bending moment $M$.",
                        "examTip": "Found in Mechanics of Materials. Section modulus is $S = I / c$. For rectangular cross-section ($b \\times h$), $S = b h^2 / 6$."
                },
                {
                        "title": "Torsion Formula for Circular Shafts",
                        "formula": "$$\\tau = \\frac{T r}{J}, \\quad \\phi = \\frac{T L}{G J}$$",
                        "description": "Computes shear stress $\\tau$ at radial distance $r$ and total angular twist $\\phi$ in a circular shaft subjected to torque $T$.",
                        "examTip": "Found in Mechanics of Materials. Polar moment of inertia for a solid circular shaft is $J = \\pi d^4 / 32$."
                },
                {
                        "title": "Reynolds Number (Flow Similarity Metric)",
                        "formula": "$$Re = \\frac{\\rho v D}{\\mu} = \\frac{v D}{\\nu}$$",
                        "description": "Dimensionless ratio of inertial forces to viscous forces in fluid flow, demarcating laminar from turbulent flow regimes.",
                        "examTip": "Found in Fluid Mechanics. For internal pipe flow: $Re < 2100$ is laminar; $Re > 4000$ is fully turbulent."
                },
                {
                        "title": "Ohm’s Law and Electrical Power",
                        "formula": "$$V = I R, \\quad P = V I = I^2 R = \\frac{V^2}{R}$$",
                        "description": "Fundamental relationship between voltage $V$, current $I$, resistance $R$, and dissipated electrical power $P$ in DC circuits.",
                        "examTip": "Found in Electrical Circuits. In series circuits, current is constant; in parallel circuits, voltage drop is identical across branches."
                },
                {
                        "title": "Engineering Economics Compound Interest Formula",
                        "formula": "$$F = P (1 + i)^n = P (F/P, i, n)$$",
                        "description": "Calculates future worth $F$ accumulated from present principal $P$ compounded over $n$ periods at effective interest rate $i$.",
                        "examTip": "Found in Engineering Economics. Present worth factor is $(P/F, i, n) = (1 + i)^{-n}$."
                },
                {
                        "title": "Centroid of Composite Planar Areas",
                        "formula": "$$\\bar{x} = \\frac{\\sum A_i \\bar{x}_i}{\\sum A_i}, \\quad \\bar{y} = \\frac{\\sum A_i \\bar{y}_i}{\\sum A_i}$$",
                        "description": "Calculates the geometric center $(\\bar{x}, \\bar{y})$ of composite cross sections by taking the first moments of area divided by total area.",
                        "examTip": "Found in Statics / Mechanics of Materials. For cutouts or holes, treat their area as negative in the summation."
                },
                {
                        "title": "Isotropic Elastic Constants Relationship",
                        "formula": "$$G = \\frac{E}{2(1 + \\nu)}$$",
                        "description": "Interrelates Young’s modulus of elasticity $E$, shear modulus $G$, and Poisson’s ratio $\\nu$ for homogeneous isotropic linear elastic materials.",
                        "examTip": "Found in Mechanics of Materials. For structural steel ($E \\approx 200\\text{ GPa}, \\nu \\approx 0.30$), shear modulus is $G \\approx 77\\text{ GPa}$."
                }
        ]
};

    let quoteIndex = Math.floor(Math.random() * QUOTES.length);
    let theoremIndex = 0;

    function getActiveDiscipline() {
        const disc = localStorage.getItem('enggtv_discipline') || 
                     (window.state && window.state.user && window.state.user.discipline) || 
                     'Mechanical';
        if (THEOREMS_BY_DISCIPLINE[disc]) return disc;
        if (disc === 'Civil Engineering') return 'Civil';
        if (disc === 'Electrical') return 'Electrical and Computer';
        if (disc === 'Other Disciplines' || disc === 'FE_Other Discipline' || (disc && disc.toLowerCase().includes('other'))) return 'Other';
        return 'Mechanical';
    }

    function renderDailyQuote(isShuffle = false) {
        if (isShuffle) {
            quoteIndex = (quoteIndex + 1) % QUOTES.length;
        }
        const q = QUOTES[quoteIndex];
        const quoteTextEl = document.getElementById('daily-quote-text');
        const quoteAuthorEl = document.getElementById('daily-quote-author');
        const quoteRoleEl = document.getElementById('daily-quote-role');

        if (quoteTextEl) quoteTextEl.textContent = `“${q.quote}”`;
        if (quoteAuthorEl) quoteAuthorEl.textContent = q.author;
        if (quoteRoleEl) quoteRoleEl.textContent = q.role;
    }

    function renderDailyTheorem(isShuffle = false, explicitIndex = null) {
        const disc = getActiveDiscipline();
        const theorems = THEOREMS_BY_DISCIPLINE[disc] || THEOREMS_BY_DISCIPLINE['Mechanical'];

        if (explicitIndex !== null && explicitIndex >= 0 && explicitIndex < theorems.length) {
            theoremIndex = explicitIndex;
        } else if (isShuffle) {
            theoremIndex = (theoremIndex + 1) % theorems.length;
        } else {
            // deterministic index based on day of month
            const dayOfMonth = new Date().getDate();
            theoremIndex = dayOfMonth % theorems.length;
        }

        const th = theorems[theoremIndex];

        const discBadgeEl = document.getElementById('daily-theorem-discipline');
        const titleEl = document.getElementById('daily-theorem-title');
        const formulaEl = document.getElementById('daily-theorem-formula');
        const descEl = document.getElementById('daily-theorem-desc');
        const tipEl = document.getElementById('daily-theorem-tip');

        if (discBadgeEl) discBadgeEl.textContent = `${disc} FE Focus • #${theoremIndex + 1} of ${theorems.length}`;
        if (titleEl) titleEl.textContent = th.title;
        if (formulaEl) formulaEl.innerHTML = th.formula;
        if (descEl) descEl.textContent = th.description;
        if (tipEl) tipEl.textContent = th.examTip;

        // Video Explainer Field Handling
        const playerCardEl = document.getElementById('daily-theorem-player-card');
        const noVideoCardEl = document.getElementById('daily-theorem-no-video');
        const videoEl = document.getElementById('daily-theorem-video');
        const videoTitleEl = document.getElementById('daily-theorem-video-title');
        const videoDurationEl = document.getElementById('daily-theorem-video-duration');

        if (th.videoUrl) {
            if (playerCardEl) playerCardEl.classList.remove('hidden');
            if (noVideoCardEl) noVideoCardEl.classList.add('hidden');
            if (videoTitleEl) videoTitleEl.textContent = th.videoTitle || `${th.title} Explainer`;
            if (videoDurationEl) videoDurationEl.textContent = th.videoDuration || '10s HD';
            
            if (videoEl) {
                const currentSrc = videoEl.getAttribute('data-src');
                if (currentSrc !== th.videoUrl) {
                    videoEl.setAttribute('data-src', th.videoUrl);
                    videoEl.src = th.videoUrl;
                    videoEl.load();
                }
            }
        } else {
            if (playerCardEl) playerCardEl.classList.add('hidden');
            if (noVideoCardEl) noVideoCardEl.classList.remove('hidden');
            if (videoEl) {
                videoEl.pause();
            }
        }

        // Render MathJax LaTeX equation
        if (window.MathJax && window.MathJax.typesetPromise && formulaEl) {
            window.MathJax.typesetPromise([formulaEl]).catch(err => console.warn('MathJax render notice:', err));
        }
    }

    function setTheoremLayout(layout = 'below') {
        const card = document.getElementById('daily-theorem-card');
        const grid = document.getElementById('daily-theorem-body-grid');
        const btnBelow = document.getElementById('btn-theorem-layout-below');
        const btnSide = document.getElementById('btn-theorem-layout-side');

        if (layout === 'side') {
            if (card) {
                card.classList.remove('lg:col-span-6');
                card.classList.add('lg:col-span-12');
            }
            if (grid) {
                grid.classList.remove('grid-cols-1');
                grid.classList.add('grid-cols-1', 'lg:grid-cols-2', 'gap-6', 'items-start');
            }
            if (btnSide) {
                btnSide.className = 'px-2 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-700 shadow-sm transition-all flex items-center gap-1 cursor-pointer';
            }
            if (btnBelow) {
                btnBelow.className = 'px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all flex items-center gap-1 cursor-pointer';
            }
        } else {
            if (card) {
                card.classList.remove('lg:col-span-12');
                card.classList.add('lg:col-span-6');
            }
            if (grid) {
                grid.classList.remove('grid-cols-1', 'lg:grid-cols-2', 'gap-6', 'items-start');
                grid.classList.add('grid-cols-1', 'gap-4');
            }
            if (btnBelow) {
                btnBelow.className = 'px-2 py-1 rounded-lg text-cyan-600 dark:text-cyan-400 bg-white dark:bg-slate-700 shadow-sm transition-all flex items-center gap-1 cursor-pointer';
            }
            if (btnSide) {
                btnSide.className = 'px-2 py-1 rounded-lg text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all flex items-center gap-1 cursor-pointer';
            }
        }
        try {
            localStorage.setItem('enggtv_theorem_layout', layout);
        } catch (e) {}
    }

    function previewTheoremVideo(videoId) {
        // Ensure Mechanical discipline
        try {
            localStorage.setItem('enggtv_discipline', 'Mechanical');
        } catch (e) {}

        const theorems = THEOREMS_BY_DISCIPLINE['Mechanical'];
        let targetIndex = 0; // default Bernoulli
        if (videoId === 'carnot') {
            targetIndex = theorems.findIndex(t => t.title.toLowerCase().includes('carnot'));
            if (targetIndex === -1) targetIndex = 2;
        } else if (videoId === 'bernoulli') {
            targetIndex = theorems.findIndex(t => t.title.toLowerCase().includes('bernoulli'));
            if (targetIndex === -1) targetIndex = 0;
        } else if (videoId === 'fourier') {
            targetIndex = theorems.findIndex(t => t.title.toLowerCase().includes('fourier'));
            if (targetIndex === -1) targetIndex = 1;
        } else if (videoId === 'mohr' || videoId === 'mohrs') {
            targetIndex = theorems.findIndex(t => t.title.toLowerCase().includes('mohr'));
            if (targetIndex === -1) targetIndex = 3;
        } else if (videoId === 'parallel') {
            targetIndex = theorems.findIndex(t => t.title.toLowerCase().includes('parallel'));
            if (targetIndex === -1) targetIndex = 4;
        }

        renderDailyTheorem(false, targetIndex);

        // Auto-play the video for instant feedback
        setTimeout(() => {
            const videoEl = document.getElementById('daily-theorem-video');
            if (videoEl) {
                videoEl.currentTime = 0;
                const playPromise = videoEl.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        console.log('Video autoplay requires user interaction:', err);
                    });
                }
            }
        }, 150);
    }

    function init() {
        renderDailyQuote(false);
        renderDailyTheorem(false);

        // Apply saved layout
        const savedLayout = localStorage.getItem('enggtv_theorem_layout') || 'below';
        setTheoremLayout(savedLayout);

        const shuffleQuoteBtn = document.getElementById('btn-shuffle-quote');
        if (shuffleQuoteBtn) {
            shuffleQuoteBtn.onclick = () => renderDailyQuote(true);
        }

        const shuffleTheoremBtn = document.getElementById('btn-shuffle-theorem');
        if (shuffleTheoremBtn) {
            shuffleTheoremBtn.onclick = () => renderDailyTheorem(true);
        }
    }

    // Expose globally
    window.THEOREMS_BY_DISCIPLINE = THEOREMS_BY_DISCIPLINE;
    window.getActiveMotivationDiscipline = getActiveDiscipline;
    window.shuffleQuote = () => renderDailyQuote(true);
    window.shuffleTheorem = () => renderDailyTheorem(true);
    window.setTheoremLayout = setTheoremLayout;
    window.previewTheoremVideo = previewTheoremVideo;
    window.updateMotivationWidgets = () => {
        renderDailyQuote(false);
        renderDailyTheorem(false);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }
})();

// --- END js/daily-motivation.js ---

// --- BEGIN js/alumni-spotlight.js ---
/**
 * ENGG.tv - Alumni Passer Spotlight Module
 * Displays verified FE Exam passers, their discipline-specific journey, strategy takeaways, and custom avatars.
 * Implements Option B: Discipline-Smart Prioritization with interactive shuffle.
 */

(function() {
    const ALUMNI_PASSERS = [
        {
            id: 'sabrish',
            name: 'Sabrish M.',
            discipline: 'Mechanical',
            badge: 'FE Mechanical Passed',
            avatar: 'assets/avatars/sabrish.jpg',
            initials: 'SM',
            journeyQuote: 'Focusing on timed drills for Thermodynamics and Fluid Mechanics gave me the exact pacing I needed on exam day. Trust the practice repetition.',
            takeaway: 'Practice timed quizzes daily to lock in your exam pacing.'
        },
        {
            id: 'nainish',
            name: 'Nainish M.',
            discipline: 'Civil',
            badge: 'FE Civil Passed',
            avatar: 'assets/avatars/nainish.jpg',
            initials: 'NM',
            journeyQuote: 'Structural analysis and Geotech used to slow me down. Reviewing the step-by-step solutions daily turned my weakest topics into my highest scoring sections.',
            takeaway: 'Review step-by-step solutions to convert weak areas into high scores.'
        },
        {
            id: 'shariff',
            name: 'Mr. H. Shariff',
            discipline: 'Other Disciplines',
            badge: 'FE Other Disciplines Passed',
            avatar: 'assets/avatars/shariff.jpg',
            initials: 'HS',
            journeyQuote: 'Staying disciplined with the core fundamentals—especially Statics, Dynamics, and Materials—carried me across the finish line. ENGG.tv gave me the exact structure I needed.',
            takeaway: 'Master statics and dynamics fundamentals before advancing to complex topics.'
        },
        {
            id: 'linjo',
            name: 'Linjo J.',
            discipline: 'Other Disciplines',
            badge: 'FE Other Disciplines Passed',
            avatar: 'assets/avatars/linjo.jpg',
            initials: 'LJ',
            journeyQuote: 'The breadth of the Other Disciplines exam felt overwhelming at first, but doing 20 practice questions every morning on ENGG.tv made passing inevitable.',
            takeaway: 'Consistency beats cramming: complete 15-20 practice questions every day.'
        },
        {
            id: 'adarsh',
            name: 'Adarsh',
            discipline: 'Other Disciplines',
            badge: 'FE Other Disciplines Passed',
            avatar: 'assets/avatars/adarsh.jpg',
            initials: 'A',
            journeyQuote: 'Mastering the NCEES Handbook search shortcuts during daily quizzes was the ultimate turning point. If you stay consistent with the app, you will pass.',
            takeaway: 'Practice fast electronic searching in the official NCEES Reference Handbook.'
        }
    ];

    let currentIndex = 0;

    function getActiveDiscipline() {
        return localStorage.getItem('enggtv_discipline') || 
               (window.state && window.state.user && window.state.user.discipline) || 
               'Mechanical';
    }

    function getSmartDefaultIndex() {
        const disc = getActiveDiscipline().toLowerCase();
        
        if (disc.includes('mech')) {
            const idx = ALUMNI_PASSERS.findIndex(a => a.id === 'sabrish');
            if (idx !== -1) return idx;
        } else if (disc.includes('civil')) {
            const idx = ALUMNI_PASSERS.findIndex(a => a.id === 'nainish');
            if (idx !== -1) return idx;
        } else if (disc.includes('other')) {
            // Pick between Shariff, Linjo, Adarsh
            const otherIndices = [2, 3, 4];
            return otherIndices[Math.floor(Math.random() * otherIndices.length)];
        }
        
        // Fallback random
        return Math.floor(Math.random() * ALUMNI_PASSERS.length);
    }

    function renderAlumnus(index, animate = false) {
        currentIndex = (index + ALUMNI_PASSERS.length) % ALUMNI_PASSERS.length;
        const person = ALUMNI_PASSERS[currentIndex];

        const cardEl = document.getElementById('alumni-spotlight-card');
        const nameEl = document.getElementById('alumni-name');
        const disciplineEl = document.getElementById('alumni-discipline');
        const quoteEl = document.getElementById('alumni-quote');
        const takeawayEl = document.getElementById('alumni-takeaway');
        const avatarImgEl = document.getElementById('alumni-avatar-img');
        const avatarInitialsEl = document.getElementById('alumni-avatar-initials');

        if (!cardEl) return;

        if (animate) {
            const contentContainer = document.getElementById('alumni-content-container');
            if (contentContainer) {
                contentContainer.style.opacity = '0';
                contentContainer.style.transform = 'translateY(4px)';
                setTimeout(() => {
                    updateContent();
                    contentContainer.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                    contentContainer.style.opacity = '1';
                    contentContainer.style.transform = 'translateY(0)';
                }, 120);
                return;
            }
        }

        updateContent();

        function updateContent() {
            if (nameEl) nameEl.textContent = person.name;
            if (disciplineEl) disciplineEl.textContent = person.badge;
            if (quoteEl) quoteEl.textContent = `“${person.journeyQuote}”`;
            if (takeawayEl) takeawayEl.textContent = person.takeaway;

            if (avatarImgEl) {
                avatarImgEl.src = person.avatar;
                avatarImgEl.alt = `${person.name} - ${person.badge}`;
                avatarImgEl.style.display = 'block';
                if (avatarInitialsEl) avatarInitialsEl.style.display = 'none';

                avatarImgEl.onerror = function() {
                    // Fallback to initials if image fails to load
                    avatarImgEl.style.display = 'none';
                    if (avatarInitialsEl) {
                        avatarInitialsEl.textContent = person.initials;
                        avatarInitialsEl.style.display = 'flex';
                    }
                };
            }
        }
    }

    function shuffle() {
        renderAlumnus(currentIndex + 1, true);
    }

    function init() {
        currentIndex = getSmartDefaultIndex();
        renderAlumnus(currentIndex, false);

        const shuffleBtn = document.getElementById('btn-shuffle-alumni');
        if (shuffleBtn) {
            shuffleBtn.onclick = shuffle;
        }
    }

    // Global hooks
    window.shuffleAlumni = shuffle;
    window.updateAlumniWidget = () => {
        currentIndex = getSmartDefaultIndex();
        renderAlumnus(currentIndex, true);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 60);
    }
})();

// --- END js/alumni-spotlight.js ---

// --- BEGIN js/featured-video.js ---
/**
 * ENGG.tv - Featured Engineering Mechanism & Video Showcase Module
 * Displays interactive 3D CAD/kinematic mechanism demonstrations.
 * Configured as a modular developer placeholder that can easily be swapped
 * with custom video content anytime.
 */

(function() {
    'use strict';

    // Global Configuration Object - High-yield FE Exam explainer
    window.ENGGTV_FEATURED_VIDEO = {
        id: 'transformers-fe-explainer',
        title: 'FE Exam Core: Electrical Transformers Masterclass',
        subtitle: 'Ideal Relations, Dot Convention & Impedance Reflection',
        badge: 'FE Exam Core • Electrical & General',
        srcMp4: 'assets/videos/placeholder_video.mp4',
        srcWebm: 'assets/videos/transformers_fe_explainer.webm',
        poster: 'assets/videos/transformers_poster.jpg',
        attribution: {
            creator: 'EnggPrep NCEES FE Review',
            license: 'NCEES Exam Prep Curriculum (Educational)',
            source: 'EnggPrep Studio'
        },
        description: 'Comprehensive high-yield walkthrough of single-phase ideal and real transformers for the FE Exam. Covers turns ratio a = N1/N2, dot convention polarity, impedance reflection (Zin = a² ZL), core vs copper losses, condition for maximum efficiency, and worked numerical FE problems.',
        keyTakeaways: [
            { icon: 'bolt', text: 'Turns Ratio: a = N₁/N₂ = V₁/V₂ = I₂/I₁. Voltages transform directly; currents inversely. Apparent power is conserved: S₁ = S₂.' },
            { icon: 'alt_route', text: 'Dot Convention: If currents both enter (or both leave) dotted terminals, use +a. If one enters and one leaves, insert a negative sign: V₁/V₂ = -a.' },
            { icon: 'memory', text: 'Impedance Reflection: Secondary impedance reflected to primary scales by a²: Zin = a² · ZL. Always square the turns ratio!' },
            { icon: 'offline_bolt', text: 'Losses & Max Efficiency: Copper losses Pcu ∝ I²; Core losses Pcore ≈ const. Maximum efficiency occurs when Pcu = Pcore.' }
        ],
        developerNote: 'Active FE Video: assets/videos/transformers_fe_explainer.webm (HD 720p Explainer Video)'
    };

    let videoEl = null;
    let playBtn = null;
    let isPlaying = false;

    function initVideoShowcase() {
        const container = document.getElementById('featured-mechanism-video-card');
        if (!container) return;

        videoEl = document.getElementById('mechanism-video-player');
        playBtn = document.getElementById('btn-mechanism-play-toggle');

        if (!videoEl) return;

        // Ensure proper attributes
        videoEl.playsInline = true;
        videoEl.loop = true;
        videoEl.muted = true; // Required for reliable autoplay compliance

        // Update UI when video state changes
        videoEl.addEventListener('play', () => {
            isPlaying = true;
            updatePlayButtonUI(true);
        });

        videoEl.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayButtonUI(false);
        });

        if (playBtn) {
            playBtn.onclick = togglePlay;
        }

        // Click directly on video or overlay to toggle play/pause
        const videoWrapper = document.getElementById('mechanism-video-wrapper');
        if (videoWrapper) {
            videoWrapper.onclick = (e) => {
                // If clicked on controls buttons, ignore
                if (e.target.closest('button') && e.target.closest('button') !== playBtn) return;
                togglePlay();
            };
        }

        // Setup sound toggle button
        const soundBtn = document.getElementById('btn-mechanism-sound-toggle');
        if (soundBtn) {
            soundBtn.onclick = (e) => {
                e.stopPropagation();
                if (!videoEl) return;
                videoEl.muted = !videoEl.muted;
                const icon = soundBtn.querySelector('.material-symbols-outlined');
                if (icon) {
                    icon.textContent = videoEl.muted ? 'volume_off' : 'volume_up';
                }
            };
        }

        // Setup fullscreen button
        const fsBtn = document.getElementById('btn-mechanism-fullscreen');
        if (fsBtn) {
            fsBtn.onclick = (e) => {
                e.stopPropagation();
                if (!videoEl) return;
                if (videoEl.requestFullscreen) {
                    videoEl.requestFullscreen();
                } else if (videoEl.webkitRequestFullscreen) {
                    videoEl.webkitRequestFullscreen();
                }
            };
        }

        // Setup developer copy button
        const copyBtn = document.getElementById('btn-copy-video-path');
        if (copyBtn) {
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                const pathText = 'assets/videos/transformers_fe_explainer.webm';
                const originalHtml = copyBtn.innerHTML;
                const setSuccess = () => {
                    copyBtn.innerHTML = '<span class="material-symbols-outlined text-[12px] text-emerald-400">check</span><span class="text-emerald-400">Copied!</span>';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                    }, 2000);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(pathText).then(setSuccess).catch(setSuccess);
                } else {
                    setSuccess();
                }
            };
        }
    }

    function togglePlay() {
        if (!videoEl) return;
        if (videoEl.paused) {
            videoEl.play().catch(err => {
                console.warn('Playback error:', err);
            });
        } else {
            videoEl.pause();
        }
    }

    function updatePlayButtonUI(playing) {
        const overlay = document.getElementById('mechanism-play-overlay');
        const icon = playBtn ? playBtn.querySelector('.material-symbols-outlined') : null;

        if (overlay) {
            if (playing) {
                overlay.classList.add('opacity-0', 'pointer-events-none');
            } else {
                overlay.classList.remove('opacity-0', 'pointer-events-none');
            }
        }

        if (icon) {
            icon.textContent = playing ? 'pause' : 'play_arrow';
        }
    }

    // Expose helpers globally
    window.initFeaturedMechanismVideo = initVideoShowcase;
    window.toggleFeaturedMechanismPlay = togglePlay;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoShowcase);
    } else {
        setTimeout(initVideoShowcase, 60);
    }
})();

// --- END js/featured-video.js ---

// --- BEGIN js/peer-ticker.js ---
/**
 * ENGG.tv - Live Peer Milestone & Kudos Ticker Module
 * Real-time study momentum ticker with handle-based anonymity.
 * Features:
 * 1. Engineering-themed anonymous handles (@FluidVortex_32, @TrussMaster_88, etc.)
 * 2. Real-time Firestore peer milestone sync with graceful local offline cache
 * 3. Interactive Kudos mechanism with micro-animation and persistence
 * 4. Discipline filtering (All vs. My Discipline)
 */

(function() {
    'use strict';

    // Handle Generation Vocabulary by Discipline
    const HANDLE_VOCAB = {
        Mechanical: {
            prefixes: ['Turbo', 'Fluid', 'Thermo', 'Kinetics', 'Vortex', 'Gear', 'Entropy', 'Cam', 'Bernoulli', 'Rankine', 'Stress'],
            nouns: ['Mech', 'Dynamics', 'Piston', 'Rotor', 'Torque', 'Shaft', 'Involute', 'Flow', 'Cycles', 'Engine']
        },
        Civil: {
            prefixes: ['Structural', 'Truss', 'Concrete', 'GeoTech', 'Hydraulics', 'Beam', 'Survey', 'Shear', 'Foundation'],
            nouns: ['Vector', 'Masonry', 'Span', 'Load', 'Cadastral', 'Retain', 'Column', 'Arch', 'CivilPro']
        },
        Electrical: {
            prefixes: ['Maxwell', 'Circuit', 'Ohm', 'Flux', 'Signal', 'Nyquist', 'Voltage', 'Inductor', 'Faraday', 'Quantum'],
            nouns: ['Guru', 'Current', 'Diode', 'Node', 'Wave', 'Ampere', 'Filter', 'Logic', 'Semicon']
        },
        Other: {
            prefixes: ['Matrix', 'Vector', 'Math', 'Calculus', 'Entropy', 'Algorithm', 'Optima', 'Tensor', 'Kinetic'],
            nouns: ['Engineer', 'Scholar', 'Solver', 'Logix', 'Mind', 'Genius', 'Master', 'Focus']
        }
    };

    // 100% Real Only: Local cache for candidate study milestones
    function loadLocalRealMilestones() {
        try {
            const raw = localStorage.getItem('enggtv_real_peer_milestones');
            if (raw) return JSON.parse(raw);
        } catch(e) {}
        return [];
    }

    function saveLocalRealMilestones(list) {
        try {
            localStorage.setItem('enggtv_real_peer_milestones', JSON.stringify((list || []).slice(0, 50)));
        } catch(e) {}
    }

    let currentFilter = 'all'; // 'all' or 'my_discipline'
    let milestonesCache = [];
    let givenKudosSet = new Set();
    let firestoreUnsubscribe = null;

    /**
     * Get or generate the candidate's anonymous engineering handle.
     */
    function getOrGenerateHandle() {
        let handle = localStorage.getItem('enggtv_anonymous_handle');
        if (handle && handle.startsWith('@') && handle.length >= 4) {
            return handle;
        }

        const disc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
        const vocabGroup = HANDLE_VOCAB[disc] || HANDLE_VOCAB['Mechanical'];
        const prefix = vocabGroup.prefixes[Math.floor(Math.random() * vocabGroup.prefixes.length)];
        const noun = vocabGroup.nouns[Math.floor(Math.random() * vocabGroup.nouns.length)];
        const randNum = Math.floor(10 + Math.random() * 89); // 10-99

        handle = `@${prefix}${noun}_${randNum}`;
        localStorage.setItem('enggtv_anonymous_handle', handle);
        return handle;
    }

    /**
     * Update or set a custom handle.
     */
    function setCustomHandle(newHandle) {
        if (!newHandle) return false;
        let clean = newHandle.trim();
        if (!clean.startsWith('@')) clean = '@' + clean;
        // Clean characters: letters, numbers, underscores only
        clean = '@' + clean.substring(1).replace(/[^a-zA-Z0-9_]/g, '');
        if (clean.length < 4 || clean.length > 20) {
            return false;
        }
        localStorage.setItem('enggtv_anonymous_handle', clean);
        updateHandleUI();

        // Optionally update in user doc if Firebase is initialized
        try {
            if (window.db && window.firebase && window.firebase.auth()) {
                const currentUser = window.firebase.auth().currentUser;
                if (currentUser) {
                    window.db.collection('users').doc(currentUser.uid).set({
                        anonymousHandle: clean
                    }, { merge: true }).catch(() => {});
                }
            }
        } catch (e) {}

        return true;
    }

    /**
     * Load given kudos from localStorage.
     */
    function loadGivenKudos() {
        try {
            const raw = localStorage.getItem('enggtv_given_kudos');
            if (raw) {
                const arr = JSON.parse(raw);
                givenKudosSet = new Set(arr);
            }
        } catch (e) {
            givenKudosSet = new Set();
        }
    }

    function saveGivenKudos() {
        try {
            localStorage.setItem('enggtv_given_kudos', JSON.stringify([...givenKudosSet]));
        } catch (e) {}
    }

    /**
     * Format timestamp to relative human time (e.g. 2m ago).
     */
    function timeAgo(ms) {
        const diff = Math.max(0, Date.now() - ms);
        const mins = Math.floor(diff / (60 * 1000));
        if (mins < 1) return 'Just now';
        if (mins < 60) return `${mins}m ago`;
        const hours = Math.floor(mins / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        return `${days}d ago`;
    }

    /**
     * Generate avatar initials from handle (e.g. @FluidVortex_32 -> FV).
     */
    function getHandleInitials(handle) {
        const clean = handle.replace('@', '');
        const parts = clean.split('_')[0].split(/(?=[A-Z])/);
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return clean.substring(0, 2).toUpperCase();
    }

    /**
     * Discipline color gradient mapping for avatar badges.
     */
    function getDisciplineGradient(disc) {
        switch (disc) {
            case 'Civil':
                return 'from-amber-500 to-orange-600 border-amber-400/40 text-amber-100';
            case 'Electrical':
                return 'from-purple-500 to-indigo-600 border-purple-400/40 text-purple-100';
            case 'Other':
                return 'from-emerald-500 to-teal-600 border-emerald-400/40 text-emerald-100';
            case 'Mechanical':
            default:
                return 'from-cyan-500 to-blue-600 border-cyan-400/40 text-cyan-100';
        }
    }

    /**
     * Render the Live Peer Milestone Stream into the DOM.
     */
    function renderStream() {
        const streamContainer = document.getElementById('peer-milestones-stream');
        if (!streamContainer) return;

        const userDiscipline = localStorage.getItem('enggtv_discipline') || 'Mechanical';

        // Filter milestones
        const filtered = milestonesCache.filter(m => {
            if (currentFilter === 'my_discipline') {
                return m.discipline === userDiscipline;
            }
            return true;
        });

        if (filtered.length === 0) {
            const isDiscFilter = currentFilter === 'my_discipline';
            streamContainer.innerHTML = `
                <div class="py-12 px-6 text-center rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 flex flex-col items-center justify-center gap-3">
                    <div class="w-12 h-12 rounded-2xl bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-inner">
                        <span class="material-symbols-outlined text-2xl">bolt</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-200 mb-1">
                            ${isDiscFilter ? `No Recent ${userDiscipline} Milestones Yet` : 'No Recent Peer Milestones Yet'}
                        </h4>
                        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                            100% Real candidate activity only. Set the study momentum by completing a practice drill, achieving a study streak, or solving a Simplistic Study challenge!
                        </p>
                    </div>
                    <div class="flex flex-wrap items-center justify-center gap-2 mt-1">
                        <button onclick="navigateTo('study')" class="px-4 py-2 rounded-xl text-xs font-bold bg-primary hover:brightness-110 text-white shadow-sm transition-all cursor-pointer flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">play_arrow</span>
                            <span>Practice Drill</span>
                        </button>
                        <button onclick="if(window.openSimplisticStudyModal)window.openSimplisticStudyModal();" class="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 transition-all cursor-pointer flex items-center gap-1.5">
                            <span class="material-symbols-outlined text-[16px]">psychology</span>
                            <span>Simplistic Study</span>
                        </button>
                    </div>
                </div>
            `;
            return;
        }

        streamContainer.innerHTML = filtered.map((m, idx) => {
            const hasGivenKudo = givenKudosSet.has(m.id);
            const initials = getHandleInitials(m.handle);
            const gradClass = getDisciplineGradient(m.discipline);
            const isSelf = m.handle === getOrGenerateHandle();

            return `
                <div class="peer-milestone-item p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3.5 transition-all hover:border-cyan-500/40 hover:shadow-md group/item" data-id="${m.id}">
                    <div class="flex items-start gap-3 min-w-0">
                        <!-- Avatar Badge -->
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br ${gradClass} flex items-center justify-center font-bold text-xs font-mono shadow-sm shrink-0 border">
                            ${initials}
                        </div>

                        <!-- Info Content -->
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">${m.handle}</span>
                                ${isSelf ? '<span class="text-[9px] font-black uppercase tracking-wider bg-cyan-500/20 text-cyan-600 dark:text-cyan-300 px-1.5 py-0.5 rounded-full font-bold">You</span>' : ''}
                                <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700/70 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-600/60">
                                    FE ${m.discipline}
                                </span>
                                <span class="text-[10px] text-slate-400 dark:text-slate-400 font-medium ml-auto sm:ml-0">${timeAgo(m.timestamp)}</span>
                            </div>

                            <p class="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                                ${m.title}
                            </p>
                            ${m.detail ? `<p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">${m.detail}</p>` : ''}
                        </div>
                    </div>

                    <!-- Interactive Kudos Button -->
                    <button onclick="window.givePeerKudos('${m.id}')" class="kudos-btn shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        hasGivenKudo 
                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/40 shadow-sm scale-105' 
                        : 'bg-slate-100 hover:bg-amber-500/15 dark:bg-slate-700/60 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-500 border border-slate-200/60 dark:border-slate-650 active:scale-95'
                    }" title="Give Kudos">
                        <span class="text-sm">👏</span>
                        <span class="kudos-count font-mono">${m.kudosCount || 0}</span>
                    </button>
                </div>
            `;
        }).join('');
    }

    /**
     * Give Kudos to a peer milestone.
     */
    function givePeerKudos(milestoneId) {
        if (!milestoneId) return;
        const hasGiven = givenKudosSet.has(milestoneId);

        // Find milestone in cache
        const target = milestonesCache.find(m => m.id === milestoneId);
        if (!target) return;

        if (hasGiven) {
            // Retract kudo
            givenKudosSet.delete(milestoneId);
            target.kudosCount = Math.max(0, (target.kudosCount || 1) - 1);
        } else {
            // Add kudo
            givenKudosSet.add(milestoneId);
            target.kudosCount = (target.kudosCount || 0) + 1;

            // Trigger micro confetti celebration
            triggerKudosAnimation(milestoneId);

            // Award social gamification point to candidate
            if (typeof window.addPoints === 'function') {
                window.addPoints(1, 'Gave Community Kudos!');
            }
        }

        saveGivenKudos();
        saveLocalRealMilestones(milestonesCache);
        renderStream();

        // Sync with Firestore if active
        try {
            if (window.db) {
                const docRef = window.db.collection('peer_milestones').doc(milestoneId);
                const incrementVal = hasGiven ? -1 : 1;
                docRef.update({
                    kudosCount: window.firebase.firestore.FieldValue.increment(incrementVal)
                }).catch(() => {});
            }
        } catch (e) {}
    }

    /**
     * Subtle micro-celebration animation on Kudos button.
     */
    function triggerKudosAnimation(milestoneId) {
        const itemEl = document.querySelector(`.peer-milestone-item[data-id="${milestoneId}"] .kudos-btn`);
        if (!itemEl) return;

        // Visual bounce
        itemEl.classList.add('scale-125', 'ring-2', 'ring-amber-400');
        setTimeout(() => {
            itemEl.classList.remove('scale-125', 'ring-2', 'ring-amber-400');
        }, 300);

        // Small confetti burst if canvas-confetti is loaded
        if (typeof window.confetti === 'function') {
            const rect = itemEl.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;
            window.confetti({
                particleCount: 15,
                spread: 40,
                startVelocity: 15,
                origin: { x, y },
                colors: ['#F59E0B', '#06B6D4', '#EC4899']
            });
        }
    }

    /**
     * Public Method: Publish a candidate milestone to the live feed.
     */
    function publishPeerMilestone({ title, detail, type = 'quiz_finish', discipline = null }) {
        if (!title) return;

        const myDiscipline = discipline || localStorage.getItem('enggtv_discipline') || 'Mechanical';
        const myHandle = getOrGenerateHandle();

        const newMilestone = {
            id: 'milestone_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
            handle: myHandle,
            discipline: myDiscipline,
            type: type,
            title: title,
            detail: detail || '',
            timestamp: Date.now(),
            kudosCount: 1, // Self start
            kudosUsers: []
        };

        // Prepend to local cache immediately
        milestonesCache.unshift(newMilestone);
        // Keep cache capped at 40
        if (milestonesCache.length > 40) milestonesCache.pop();

        saveLocalRealMilestones(milestonesCache);
        renderStream();

        // Broadcast to Firestore collection
        try {
            if (window.db) {
                window.db.collection('peer_milestones').doc(newMilestone.id).set(newMilestone).then(() => {
                    console.log('✅ Peer milestone broadcasted to Firestore');
                }).catch(err => {
                    console.warn('Firestore peer milestone sync note:', err.message);
                });
            }
        } catch (e) {}

        // Notification toast
        if (typeof window.showNotification === 'function') {
            window.showNotification(`📢 Shared to Peer Ticker as ${myHandle}!`, 'info');
        }
    }

    /**
     * Setup Real-Time Firestore onSnapshot listener.
     */
    function setupFirestoreListener() {
        if (!window.db) return;

        try {
            firestoreUnsubscribe = window.db.collection('peer_milestones')
                .orderBy('timestamp', 'desc')
                .limit(60)
                .onSnapshot(snapshot => {
                    const firestoreItems = [];
                    snapshot.forEach(doc => {
                        firestoreItems.push({ id: doc.id, ...doc.data() });
                    });

                    if (firestoreItems.length > 0) {
                        const map = new Map();
                        // Prioritize real Firestore items
                        firestoreItems.forEach(f => map.set(f.id, f));
                        // Retain any locally published user milestones
                        milestonesCache.forEach(m => {
                            if (!map.has(m.id)) map.set(m.id, m);
                        });
                        milestonesCache = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
                        saveLocalRealMilestones(milestonesCache);
                        renderStream();
                    }
                }, err => {
                    console.warn('Firestore peer milestone listener notice:', err.message);
                });
        } catch (e) {
            console.warn('Could not attach Firestore peer listener:', e);
        }
    }

    /**
     * Update the candidate's anonymous handle display and editing trigger.
     */
    function updateHandleUI() {
        const handle = getOrGenerateHandle();
        const displayEl = document.getElementById('user-anonymous-handle-text');
        if (displayEl) {
            displayEl.textContent = handle;
        }
    }

    /**
     * Open the Edit Handle modal.
     */
    function openEditHandleModal() {
        const currentHandle = getOrGenerateHandle();
        const modal = document.getElementById('edit-handle-modal');
        const input = document.getElementById('input-edit-handle');
        if (input) {
            input.value = currentHandle.replace('@', '');
        }
        if (modal) {
            modal.classList.remove('hidden');
            modal.style.display = 'flex';
        }
    }

    function closeEditHandleModal() {
        const modal = document.getElementById('edit-handle-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    }

    function saveCustomHandleFromInput() {
        const input = document.getElementById('input-edit-handle');
        if (!input) return;
        const val = input.value.trim();
        const success = setCustomHandle(val);
        if (success) {
            closeEditHandleModal();
            renderStream();
            if (typeof window.showNotification === 'function') {
                window.showNotification('✅ Anonymous handle updated: ' + getOrGenerateHandle(), 'success');
            }
        } else {
            alert('Handle must be 3-18 letters, numbers, or underscores.');
        }
    }

    /**
     * Enhanced Coverage: Ingest real candidate study activity from localStorage,
     * recentActivity, daily quests, streak tracker, and question statistics.
     * Prevents empty state by transforming actual real past and current study actions
     * into broadcastable peer milestones.
     */
    function scanAndIngestRealActivity() {
        const myHandle = getOrGenerateHandle();
        const myDisc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
        const existingIds = new Set(milestonesCache.map(m => m.id));
        let addedCount = 0;

        // 1. Ingest Real Quizzes & Mock Exams from recentActivity
        let recent = [];
        try {
            if (window.state && Array.isArray(window.state.recentActivity) && window.state.recentActivity.length > 0) {
                recent = window.state.recentActivity;
            } else {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('enggtv_recent_activity')) {
                        try {
                            const parsed = JSON.parse(localStorage.getItem(key));
                            if (Array.isArray(parsed) && parsed.length > 0) {
                                recent = recent.concat(parsed);
                            }
                        } catch(e) {}
                    }
                }
            }
        } catch(e) {}

        if (recent.length > 0) {
            recent.slice(0, 15).forEach(act => {
                const actId = 'real_act_' + (act.id || act.timestamp);
                if (!existingIds.has(actId)) {
                    const attempted = act.attempted || 0;
                    const score = act.score !== undefined ? act.score : 0;
                    const acc = act.accuracy !== undefined ? act.accuracy : (attempted > 0 ? Math.round((score / attempted) * 100) : 0);
                    const titleName = act.title || (act.isMockExam ? 'FE Mock Exam' : 'Practice');
                    
                    let milestoneTitle = `Completed ${attempted || 5}-Question Drill in ${titleName}`;
                    if (acc >= 90) milestoneTitle = `Aced ${titleName} Drill (${acc}%) 🏆`;
                    else if (acc >= 70) milestoneTitle = `Passed ${titleName} Drill (${acc}%)`;

                    milestonesCache.push({
                        id: actId,
                        handle: myHandle,
                        discipline: myDisc,
                        type: 'quiz_finish',
                        title: milestoneTitle,
                        detail: `${score}/${attempted} correct questions in FE ${myDisc} practice`,
                        timestamp: act.timestamp || Date.now(),
                        kudosCount: Math.min(12, Math.max(1, Math.floor((score || 1) * 1.5))),
                        kudosUsers: []
                    });
                    existingIds.add(actId);
                    addedCount++;
                }
            });
        }

        // 2. Ingest Real Study Streak
        try {
            const streak = (window.calculateStreak && typeof window.calculateStreak === 'function')
                ? window.calculateStreak()
                : (window.state && window.state.recentActivity && typeof window.calculateStreakFromActivity === 'function'
                    ? window.calculateStreakFromActivity(window.state.recentActivity)
                    : 0);

            if (streak > 0) {
                const todayStr = new Date().toISOString().split('T')[0];
                const streakId = 'real_streak_' + streak + '_' + todayStr;
                if (!existingIds.has(streakId)) {
                    milestonesCache.push({
                        id: streakId,
                        handle: myHandle,
                        discipline: myDisc,
                        type: 'study_streak',
                        title: `Hit a ${streak}-Day Study Streak! 🔥`,
                        detail: `Maintained daily practice consistency in FE ${myDisc}`,
                        timestamp: Date.now() - 4 * 60 * 1000,
                        kudosCount: streak * 3 + 1,
                        kudosUsers: []
                    });
                    existingIds.add(streakId);
                    addedCount++;
                }
            }
        } catch(e) {}

        // 3. Ingest Real Daily Quests Progress
        try {
            const todayStr = new Date().toISOString().split('T')[0];
            const userObj = JSON.parse(localStorage.getItem('enggtv_user')) || {};
            const qKey = `enggtv_quests_${userObj.username || 'guest'}_${todayStr}`;
            const qData = JSON.parse(localStorage.getItem(qKey) || '{}');
            if (qData.questions_answered && qData.questions_answered > 0) {
                const questId = 'real_quest_' + todayStr;
                if (!existingIds.has(questId)) {
                    milestonesCache.push({
                        id: questId,
                        handle: myHandle,
                        discipline: myDisc,
                        type: 'daily_quest',
                        title: `Solved ${qData.questions_answered} Questions Today ✍️`,
                        detail: `Active daily practice session for FE ${myDisc}`,
                        timestamp: Date.now() - 12 * 60 * 1000,
                        kudosCount: Math.min(6, qData.questions_answered),
                        kudosUsers: []
                    });
                    existingIds.add(questId);
                    addedCount++;
                }
            }
        } catch(e) {}

        // 4. Ingest Total Questions Practiced if user has questionStats
        try {
            const qStats = JSON.parse(localStorage.getItem('enggtv_question_stats') || '{}');
            const totalAnswered = Object.values(qStats).reduce((sum, n) => sum + (typeof n === 'number' ? n : 0), 0);
            if (totalAnswered >= 3) {
                const statsId = 'real_qstats_' + myDisc;
                if (!existingIds.has(statsId)) {
                    milestonesCache.push({
                        id: statsId,
                        handle: myHandle,
                        discipline: myDisc,
                        type: 'drill_volume',
                        title: `Completed ${totalAnswered} Total Practice Question Repetitions`,
                        detail: `Deep practice track in FE ${myDisc} questions catalog`,
                        timestamp: Date.now() - 35 * 60 * 1000,
                        kudosCount: Math.min(15, Math.floor(totalAnswered / 3) + 1),
                        kudosUsers: []
                    });
                    existingIds.add(statsId);
                    addedCount++;
                }
            }
        } catch(e) {}

        // 5. Ingest Real Points Milestones in multiples of 50 and 100 for current user
        try {
            const userObj = JSON.parse(localStorage.getItem('enggtv_user')) || {};
            const rawPts = localStorage.getItem(`enggtv_points_${userObj.username || 'guest'}`);
            const userPts = rawPts ? parseInt(rawPts, 10) : ((window.state && window.state.userPoints) || 0);
            if (userPts >= 50) {
                const milestoneTiers = [2500, 2000, 1500, 1000, 500, 400, 300, 250, 200, 150, 100, 50];
                for (const tier of milestoneTiers) {
                    if (userPts >= tier) {
                        const ptsId = 'real_pts_' + myHandle + '_' + tier;
                        if (!existingIds.has(ptsId)) {
                            milestonesCache.push({
                                id: ptsId,
                                handle: myHandle,
                                discipline: myDisc,
                                type: 'points_milestone',
                                title: userPts >= 1000 ? `Passed ${tier.toLocaleString()} Mastery Points Milestone 🌟` : `Reached ${tier} Study Mastery Points 🏆`,
                                detail: `Total cumulative score of ${userPts.toLocaleString()} points in FE ${myDisc}`,
                                timestamp: Date.now() - 25 * 60 * 1000,
                                kudosCount: Math.min(20, Math.floor(tier / 25) + 2),
                                kudosUsers: []
                            });
                            existingIds.add(ptsId);
                            addedCount++;
                        }
                        break;
                    }
                }
            }
        } catch(e) {}

        // 6. Active Daily Study Session Presence
        try {
            const isAuth = localStorage.getItem('enggtv_authenticated') === 'true';
            if (isAuth) {
                const todayStr = new Date().toISOString().split('T')[0];
                const sessId = 'real_sess_' + todayStr;
                if (!existingIds.has(sessId)) {
                    milestonesCache.push({
                        id: sessId,
                        handle: myHandle,
                        discipline: myDisc,
                        type: 'session_active',
                        title: `Active FE ${myDisc} Study Session In Progress`,
                        detail: `Focusing on core engineering fundamentals & reference handbook`,
                        timestamp: Date.now() - 2 * 60 * 1000,
                        kudosCount: 2,
                        kudosUsers: []
                    });
                    existingIds.add(sessId);
                    addedCount++;
                }
            }
        } catch(e) {}

        if (addedCount > 0) {
            milestonesCache.sort((a, b) => b.timestamp - a.timestamp);
            saveLocalRealMilestones(milestonesCache);
        }
    }

    /**
     * Initialize Module.
     */
    function init() {
        loadGivenKudos();
        getOrGenerateHandle();
        updateHandleUI();

        // Initialize cache with 100% real local milestones
        milestonesCache = loadLocalRealMilestones();
        // Ingest existing real candidate study actions
        scanAndIngestRealActivity();
        renderStream();

        // Ingest real community milestones from actual students in the database
        fetch('assets/data/community_milestones.json')
            .then(res => res.ok ? res.json() : [])
            .then(communityData => {
                if (Array.isArray(communityData) && communityData.length > 0) {
                    const map = new Map();
                    milestonesCache.forEach(m => map.set(m.id, m));
                    communityData.forEach(m => {
                        if (!map.has(m.id)) map.set(m.id, m);
                    });
                    milestonesCache = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
                    saveLocalRealMilestones(milestonesCache);
                    renderStream();
                }
            })
            .catch(() => {});

        // Connect Firestore listener
        setupFirestoreListener();

        // Filter buttons
        const btnAll = document.getElementById('peer-filter-all');
        const btnMyDisc = document.getElementById('peer-filter-my-disc');

        if (btnAll) {
            btnAll.onclick = () => {
                currentFilter = 'all';
                btnAll.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-white shadow-sm transition-all cursor-pointer';
                if (btnMyDisc) btnMyDisc.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all cursor-pointer';
                renderStream();
            };
        }

        if (btnMyDisc) {
            const disc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
            btnMyDisc.textContent = `My Discipline (${disc})`;
            btnMyDisc.onclick = () => {
                currentFilter = 'my_discipline';
                btnMyDisc.className = 'px-3 py-1.5 rounded-xl text-xs font-bold bg-cyan-500 text-white shadow-sm transition-all cursor-pointer';
                if (btnAll) btnAll.className = 'px-3 py-1.5 rounded-xl text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-cyan-500 transition-all cursor-pointer';
                renderStream();
            };
        }

        // Setup Edit Handle button
        const editBtn = document.getElementById('btn-edit-anonymous-handle');
        if (editBtn) {
            editBtn.onclick = openEditHandleModal;
        }

        const closeBtn = document.getElementById('btn-close-edit-handle');
        if (closeBtn) {
            closeBtn.onclick = closeEditHandleModal;
        }

        const saveBtn = document.getElementById('btn-save-edit-handle');
        if (saveBtn) {
            saveBtn.onclick = saveCustomHandleFromInput;
        }

        // Periodic relative time refresher (every 60s)
        setInterval(() => {
            renderStream();
        }, 60000);
    }

    function refreshPeerTicker() {
        scanAndIngestRealActivity();
        renderStream();
    }

    // Expose globally
    window.publishPeerMilestone = publishPeerMilestone;
    window.givePeerKudos = givePeerKudos;
    window.getAnonymousHandle = getOrGenerateHandle;
    window.setCustomAnonymousHandle = setCustomHandle;
    window.openEditHandleModal = openEditHandleModal;
    window.closeEditHandleModal = closeEditHandleModal;
    window.saveCustomHandleFromInput = saveCustomHandleFromInput;
    window.refreshPeerTicker = refreshPeerTicker;
    window.scanAndIngestRealActivity = scanAndIngestRealActivity;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }
})();

// --- END js/peer-ticker.js ---

// --- BEGIN js/zen-study.js ---
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

// --- END js/zen-study.js ---

