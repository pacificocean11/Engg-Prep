document.addEventListener('DOMContentLoaded', () => {
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

    function injectFormulaTriggers(text) {
        return text;
    }

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

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([formulaLatex]);
        }
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
                        }
                        try {
                            if (typeof window.setupFirestoreSyncListener === 'function') window.setupFirestoreSyncListener(state.user.uid || state.user.username);
                        } catch (e) {
                            console.error("⚠️ setupFirestoreSyncListener failed:", e);
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
                        }
                        try {
                            if (typeof window.setupFirestoreSyncListener === 'function') window.setupFirestoreSyncListener(state.user.uid || state.user.username);
                        } catch (e) {
                            console.error("⚠️ setupFirestoreSyncListener failed:", e);
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

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }

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
        questionMeta.textContent = `Question ${state.currentQuestionIndex + 1} of ${state.quizQuestions.length} • ${state.currentTopic || state.currentSubject.name}`;
        
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
                <span class="option-text">${option.text}</span>
            `;
            
            div.addEventListener('click', () => selectOption(index));
            optionsContainer.appendChild(div);
        });

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }

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
            
            btn.onclick = () => {
                state.currentQuestionIndex = idx;
                loadQuestion();
            };
            
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
                if (state.currentQuestionIndex > 0) {
                    state.currentQuestionIndex--;
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
        
        if (accuracy >= 80 && window.incrementQuestProgress) {
            window.incrementQuestProgress('perfect_quiz', 1);
        }
        if (state.currentSubject && state.currentSubject.id === 'srs-review' && window.incrementQuestProgress) {
            window.incrementQuestProgress('srs_review', 1);
        }
        
        // Save to recent activity
        const activityTitle = state.isMockExam ? 'Mock Exam' : (state.currentTopic || state.currentSubject.name);
        const isActivityAdvanced = !state.isMockExam && localStorage.getItem('enggtv_advanced_mode') === 'true';
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

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }

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
            state.secondsRemaining = 60 * 60; // 60 minutes
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
    }
    window.updateGamificationUI = updateGamificationUI;

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
            updateDashboardStats();
            updateGamificationUI();
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
                const snapshot = await window.firebaseDb.collection("users").limit(300).get();
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
                    
                    // Sort descending in memory since we fetched all
                    realUsers.sort((a, b) => b.points - a.points);
                    // Trim to top 100
                    realUsers = realUsers.slice(0, 100);
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

        // Take top 100
        const top100 = allUsers.slice(0, 100);

        const isAdmin = state.user.username && state.user.username.toLowerCase() === 'admin';

        list.innerHTML = top100.map((user, index) => {
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

    window.shareDiagnosticReport = async function() {
        try {
            if (typeof html2canvas === 'undefined') {
                window.showToast("Error", "Screenshot tool is still loading...", "error");
                return;
            }
            
            window.showToast("Generating...", "Creating a snapshot of your report...", "refresh");
            
            const captureElement = document.getElementById('diagnostic-report-card');
            
            // Briefly hide the share button from the screenshot
            const shareBtn = captureElement.querySelector('button');
            if(shareBtn) shareBtn.style.opacity = '0';

            // Temporarily expand width to prevent clipping on mobile devices
            const originalWidth = captureElement.style.width;
            const originalMaxWidth = captureElement.style.maxWidth;
            captureElement.style.width = 'max-content';
            captureElement.style.maxWidth = 'none';
            // Allow DOM to reflow
            await new Promise(r => setTimeout(r, 50));

            const canvas = await html2canvas(captureElement, {
                scale: 2,
                backgroundColor: null,
                useCORS: true,
                allowTaint: true,
                windowWidth: captureElement.scrollWidth
            });
            
            // Restore width
            captureElement.style.width = originalWidth;
            captureElement.style.maxWidth = originalMaxWidth;
            
            if(shareBtn) shareBtn.style.opacity = '1';

            canvas.toBlob(async (blob) => {
                if (!blob) return;
                
                const file = new File([blob], `ENGG_tv_Diagnostic_${(state.user.username || 'Student').replace(/\s+/g, '_')}.png`, { type: 'image/png' });
                const shareData = {
                    title: 'My FE Exam Diagnostic Report',
                    text: `I am tracking my FE Exam readiness using the NCEES diagnostic format on ENGG.tv! 🚀\n\nStart studying for free: https://pacificocean11.github.io/Engg-Prep\n\n#FEExam #Engineering #ENGGtv`,
                    files: [file]
                };

                if (navigator.canShare && navigator.canShare(shareData)) {
                    try {
                        await navigator.share(shareData);
                        window.showToast("Shared!", "Report shared successfully.", "check_circle");
                    } catch (err) {
                        if (err.name !== 'AbortError') {
                            downloadCanvasAsImage(canvas, file.name);
                        }
                    }
                } else {
                    downloadCanvasAsImage(canvas, file.name);
                }
            });
            
            function downloadCanvasAsImage(canvas, filename) {
                const link = document.createElement('a');
                link.download = filename;
                link.href = canvas.toDataURL('image/png');
                link.click();
                window.showToast("Report Downloaded!", "You can now post this image on LinkedIn.", "check_circle");
                
                const caption = `I am tracking my FE Exam readiness using the NCEES diagnostic format on ENGG.tv! 🚀\n\nStart studying for free: https://pacificocean11.github.io/Engg-Prep\n\n#FEExam #Engineering #ENGGtv`;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(caption).catch(e => console.log('Clipboard failed', e));
                }
            }
            
        } catch (error) {
            console.error("Error generating report snapshot:", error);
            window.showToast("Error", "Could not generate report image.", "error");
        }
    };

    window.exportDiagnosticPDF = async function() {
        try {
            if (typeof html2pdf === 'undefined') {
                window.showToast("Error", "PDF tool is still loading...", "error");
                return;
            }
            
            window.showToast("Generating...", "Creating a styled PDF report...", "picture_as_pdf");
            
            const captureElement = document.getElementById('diagnostic-report-card');
            
            // Briefly hide the buttons from the screenshot
            const buttons = captureElement.querySelectorAll('button');
            const originalDisplays = [];
            buttons.forEach(btn => {
                originalDisplays.push(btn.style.display);
                btn.style.display = 'none';
            });
            
            // Temporarily remove dark mode for a printer-friendly PDF
            const htmlElement = document.documentElement;
            const wasDark = htmlElement.classList.contains('dark');
            if (wasDark) {
                htmlElement.classList.remove('dark');
                // Wait for styles to apply
                await new Promise(r => setTimeout(r, 100));
            }

            const username = (state.user.username || 'Student').replace(/\s+/g, '_');
            
            // Temporarily expand width to prevent clipping on mobile devices
            const originalWidth = captureElement.style.width;
            const originalMaxWidth = captureElement.style.maxWidth;
            captureElement.style.width = 'max-content';
            captureElement.style.maxWidth = 'none';
            
            const opt = {
              margin:       0.5,
              filename:     `ENGG_tv_Diagnostic_${username}.pdf`,
              image:        { type: 'jpeg', quality: 0.98 },
              html2canvas:  { scale: 2, useCORS: true, backgroundColor: '#ffffff', windowWidth: captureElement.scrollWidth },
              jsPDF:        { unit: 'in', format: 'letter', orientation: 'landscape' }
            };

            await html2pdf().set(opt).from(captureElement).save();
            
            // Restore state
            captureElement.style.width = originalWidth;
            captureElement.style.maxWidth = originalMaxWidth;
            
            buttons.forEach((btn, index) => {
                btn.style.display = originalDisplays[index];
            });
            if (wasDark) {
                htmlElement.classList.add('dark');
            }
            
            window.showToast("Success!", "Your PDF report has been downloaded.", "check_circle");
        } catch (error) {
            console.error("Error generating PDF:", error);
            window.showToast("Error", "Could not generate PDF.", "error");
            
            // Ensure restore even on error
            const htmlElement = document.documentElement;
            if (htmlElement && !htmlElement.classList.contains('dark') && localStorage.getItem('enggtv_theme') === 'dark') {
                htmlElement.classList.add('dark');
            }
        }
    };
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
                    QUESTIONS.forEach(q => {
                        if (q.local_question_image) imageUrls.push('./' + q.local_question_image);
                        if (q.local_solution_image) imageUrls.push('./' + q.local_solution_image);
                    });
                }
                if (typeof ADVANCED_QUESTIONS !== 'undefined') {
                    ADVANCED_QUESTIONS.forEach(q => {
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
        state.userName = newName; // for share modal
        if (settingsNameDisplay) settingsNameDisplay.textContent = newName;
        if (accountInfoName) accountInfoName.textContent = newName;
        if (userGreeting) {
            const firstName = newName.split(' ')[0];
            userGreeting.textContent = `Welcome back, ${firstName}`;
        }
        if (inputChangeName) inputChangeName.value = newName;
    }

    const storedNameKey = `enggtv_display_name_${state.user ? state.user.username : 'default'}`;
    const initialName = localStorage.getItem(storedNameKey) || (state.user && state.user.username !== 'demo' ? state.user.username : 'Alex Riviera');
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

    // Run Init
    init();
});
