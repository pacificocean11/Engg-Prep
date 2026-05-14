document.addEventListener('DOMContentLoaded', () => {
    // Determine the logged-in user first to use for specific storage keys
    const loggedInUser = (() => {
        try {
            const user = JSON.parse(localStorage.getItem('enggtv_user')) || { tier: 'premium', username: 'guest' };
            // Ensure the user is always premium
            user.tier = 'premium';
            localStorage.setItem('enggtv_user', JSON.stringify(user));
            
            // Force Mechanical for demo user
            if (user.username === 'demo') {
                user.discipline = 'Mechanical';
                localStorage.setItem('enggtv_user', JSON.stringify(user));
                localStorage.setItem('enggtv_discipline', 'Mechanical');
            }
            return user;
        } catch (e) {
            return { tier: 'premium', username: 'guest' };
        }
    })();

    // State Management
    const state = {
        currentPage: 'dashboard',
        currentSubject: null,
        currentQuestionIndex: 0,
        quizQuestions: [],
        answers: [],
        submitted: [],
        flagged: [],
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
            return OTHER_SUBJECTS;
        })(),
        charts: {
            radar: null,
            line: null
        }
    };


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

    // Firebase Data Synchronization
    async function syncToFirebase() {
        if (!window.saveUserProgress) {
            console.warn("⚠️ Firebase save function not available.");
            return;
        }
        if (!state.user.username || state.user.username === 'guest') {
            console.log("ℹ️ Skipping sync for guest user.");
            return;
        }

        console.log(`🔄 Syncing data for ${state.user.username} to Firebase...`);

        try {
            const lightActivity = (state.recentActivity || []).map(a => ({
                id: a.id,
                title: a.title,
                score: a.score,
                accuracy: a.accuracy,
                attempted: a.attempted,
                isMockExam: a.isMockExam,
                timestamp: a.timestamp,
                minimalSnapshot: a.minimalSnapshot
            }));

            // Gather all profile data
            const discipline = localStorage.getItem('enggtv_discipline') || state.user.discipline || 'Mechanical';
            const dateJoined = localStorage.getItem('enggtv_date_joined') || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
            const avatar = localStorage.getItem('enggtv_avatar') || null;

            const payload = {
                userPoints: state.userPoints,
                userProgress: state.userProgress,
                recentActivity: lightActivity,
                discipline: discipline,
                dateJoined: dateJoined,
            };
            if (avatar) payload.avatar = avatar;

            await window.saveUserProgress(state.user.username, payload);
            console.log("✅ Firebase sync successful.");
        } catch (error) {
            console.error("❌ Firebase sync failed:", error);
        }
    }

    async function loadFromFirebase() {
        if (!window.getUserProgress) {
            console.warn("⚠️ Firebase load function not available.");
            return;
        }
        if (!state.user.username || state.user.username === 'guest') return;

        console.log(`📂 Loading data for ${state.user.username} from Firebase...`);
        try {
            const data = await window.getUserProgress(state.user.username);
            if (data) {
                if (data.userPoints !== undefined) {
                    state.userPoints = data.userPoints;
                    localStorage.setItem(`enggtv_points_${state.user.username}`, state.userPoints.toString());
                }
                if (data.userProgress) {
                    state.userProgress = data.userProgress;
                    localStorage.setItem(`enggtv_progress_${state.user.username}`, JSON.stringify(state.userProgress));
                }
                if (data.recentActivity) {
                    const localActivity = JSON.parse(localStorage.getItem(`enggtv_recent_activity_${state.user.username}`)) || [];
                    // Merge: Keep local stateSnapshot if cloud version doesn't have it
                    state.recentActivity = data.recentActivity.map(cloudAct => {
                        const localAct = localActivity.find(l => l.id === cloudAct.id);
                        if (localAct && localAct.stateSnapshot && !cloudAct.stateSnapshot) {
                            return { ...cloudAct, stateSnapshot: localAct.stateSnapshot };
                        }
                        return cloudAct;
                    });
                    localStorage.setItem(`enggtv_recent_activity_${state.user.username}`, JSON.stringify(state.recentActivity));
                }

                if (data.discipline) {
                    localStorage.setItem('enggtv_discipline', data.discipline);
                    state.user.discipline = data.discipline;
                }
                if (data.dateJoined) {
                    localStorage.setItem('enggtv_date_joined', data.dateJoined);
                }
                if (data.avatar) {
                    localStorage.setItem('enggtv_avatar', data.avatar);
                }

                updateDashboardStats();
                updateGamificationUI();
                renderRecentActivity();
                renderSubjects();
                applyAvatar();
                updateUIForTier();
                console.log("✅ Data restored from Firebase.");
            }
        } catch (error) {
            console.error("❌ Firebase load failed:", error);
        }
    }

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
        syncToFirebase();
        
        window.showToast(`+${points} ${points === 1 ? 'point' : 'points'}`, reason, 'military_tech');
        
        if (points >= 1) {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#FF006E', '#FDA60A', '#720026']
            });
        }
    }

    // Initialization
    function init() {
        setupQuizListeners();
        setupDashboardListeners();
        renderSubjects();
        setupNavigation();
        setupMobileMenu();
        updateUIForTier();
        // startFreeTrialTimer();
        updateDashboardStats();
        updateGamificationUI();
        // Load cloud data, then do an initial sync to push any localStorage data not yet in Firebase
        loadFromFirebase().then(() => {
            syncToFirebase();
            initTilt();
            initMagneticButtons();
            initCursorFollower();
            setupHeaderScroll();
        });
        initTilt();
        initMagneticButtons();
        initCursorFollower();
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

    function initCursorFollower() {
        const follower = document.getElementById('cursor-follower');
        if (!follower) return;

        let mouseX = 0;
        let mouseY = 0;
        let followerX = 0;
        let followerY = 0;

        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
            
            // For spotlight effects on cards
            const cards = document.querySelectorAll('.glass-card, .tilt-card');
            cards.forEach(card => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
            });
        });

        function animateFollower() {
            // Smooth lerp (linear interpolation) for momentum effect
            followerX += (mouseX - followerX) * 0.15;
            followerY += (mouseY - followerY) * 0.15;

            follower.style.transform = `translate(${followerX}px, ${followerY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateFollower);
        }
        animateFollower();

        // Refresh interactive elements listeners periodically or on page change
        function updateFollowerListeners() {
            const interactiveElements = document.querySelectorAll('button, a, .option, .map-btn, .nav-links li, .glass-card, .tilt-card, .subject-card-tilt');
            
            interactiveElements.forEach(el => {
                el.addEventListener('mouseenter', () => {
                    follower.classList.add('active');
                });
                el.addEventListener('mouseleave', () => {
                    follower.classList.remove('active');
                });
            });
        }
        updateFollowerListeners();
        
        // Expose to global so we can call it after rendering dynamic content
        window.updateFollowerListeners = updateFollowerListeners;
    }

    function initTilt() {
        if (typeof VanillaTilt === 'undefined') return;
        
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
        const magneticBtns = document.querySelectorAll('.magnetic-btn');
        
        magneticBtns.forEach(btn => {
            btn.addEventListener('mousemove', function(e) {
                const position = btn.getBoundingClientRect();
                const x = e.pageX - position.left - position.width / 2;
                const y = e.pageY - position.top - position.height / 2;
                
                btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px) scale(1.05)`;
            });
            
            btn.addEventListener('mouseout', function() {
                btn.style.transform = 'translate(0px, 0px) scale(1)';
            });
        });
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
                    syncToFirebase();
                    renderRecentActivity();
                }
            }
        });
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

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function prepareQuestions(questions) {
        return questions.map(q => {
            // Deep clone to avoid modifying original data (crucial as QUESTIONS is a global reference)
            const newQ = JSON.parse(JSON.stringify(q));
            
            // Capture original indices before shuffling to ensure answers stay stable across devices
            newQ.options.forEach((opt, idx) => {
                opt.originalIndex = idx;
            });

            // Shuffle options
            shuffleArray(newQ.options);
            
            // Re-assign labels and update final_answer if it exists
            const labels = ['A', 'B', 'C', 'D', 'E', 'F'];
            newQ.options.forEach((opt, idx) => {
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
        state.currentPage = pageId;
        
        // Auto-hide navigation and header for focused sessions (Quiz/Exam)
        if (pageId === 'quiz-view') {
            document.body.classList.add('nav-hidden');
        } else {
            document.body.classList.remove('nav-hidden');
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
                const adminSelector = document.getElementById('admin-discipline-selector');
                if (adminSelector) {
                    if (state.user.username === 'admin') {
                        adminSelector.classList.remove('hidden');
                        const selectDisc = document.getElementById('select-discipline');
                        if (selectDisc) {
                            selectDisc.value = localStorage.getItem('enggtv_discipline') || 'Mechanical';
                        }
                    } else {
                        adminSelector.classList.add('hidden');
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
        
        SUBJECTS.forEach((subject, idx) => {
            const color = colors[idx % colors.length];
            
            // Calculate progress
            const questionsInSubject = (QUESTIONS[subject.id] || []).length;
            const completed = (state.userProgress[subject.id] && state.userProgress[subject.id].completed) || 0;
            const percentage = questionsInSubject > 0 ? Math.round((completed / questionsInSubject) * 100) : 0;
            
            const subjectCard = document.createElement('div');
            subjectCard.className = 'stagger-item bg-surface-container-lowest dark:bg-slate-900 rounded-[16px] p-card-padding shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-white/50 dark:border-slate-800 flex flex-col gap-4 active:scale-[0.98] transition-transform duration-150 cursor-pointer';
            subjectCard.style.animationDelay = `${idx * 100}ms`;
            
            
            const accentGlow = color.text === 'text-primary' ? 'rgba(126, 87, 0, 0.2)' : 
                              (color.text === 'text-tertiary' ? 'rgba(215, 186, 255, 0.2)' : 'rgba(255, 0, 110, 0.2)');
            subjectCard.style.setProperty('--accent-glow-dynamic', accentGlow);
            
            subjectCard.onclick = () => startQuiz(subject.id);
            
            subjectCard.innerHTML = `
                <div class="flex justify-between items-start">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-xl ${color.bg} flex items-center justify-center">
                            <span class="material-symbols-outlined ${color.text} text-2xl" data-icon="${color.icon}">${color.icon}</span>
                        </div>
                        <div>
                            <h3 class="font-title-sm text-title-sm text-on-surface dark:text-slate-100">${subject.name}</h3>
                            <p class="font-body-sm text-body-sm text-on-surface-variant dark:text-slate-400">${questionsInSubject} Questions Available</p>
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
            const questionsInSubject = (QUESTIONS[subject.id] || []).length;
            const completed = (state.userProgress[subject.id] && state.userProgress[subject.id].completed) || 0;
            
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

        // Liquid Wave Animation
        const wave = document.getElementById('liquid-wave-element');
        const waveBack = document.getElementById('liquid-wave-element-back');
        if (wave) {
            const topValue = 100 - (percentage * 1.1); 
            wave.style.top = `${topValue}%`;
            if (waveBack) waveBack.style.top = `${topValue - 5}%`; // Offset for depth
        }

        const peerText = textDisplay.nextElementSibling;
        if (peerText && peerText.tagName === 'P') {
            const peerPercent = Math.min(99, Math.max(5, percentage + 25));
            peerText.textContent = `You're ahead of ${peerPercent}% of peers!`;
        }
        
        renderRecentActivity();
        initCharts(percentage, state.intensityRange || '7d');
    }

    function calculateStreak() {
        if (!state.recentActivity || state.recentActivity.length === 0) return 0;
        
        // Get unique dates sorted descending
        const dates = [...new Set(state.recentActivity.map(a => 
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

        list.innerHTML = state.recentActivity.map((activity, idx) => {
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
        state.currentSubject = activity.stateSnapshot.currentSubject;
        state.currentTopic = activity.stateSnapshot.currentTopic;
        state.isMockExam = activity.isMockExam;
        state.score = activity.score;
        state.isFinished = true;

        navigateTo('quiz-view');
        state.currentQuestionIndex = 0;
        loadQuestion();
    };

    function updateGamificationUI() {
        const pointsDisplay = document.getElementById('user-points-display');
        const levelDisplay = document.getElementById('user-level-display');
        const levelBadge = document.getElementById('level-badge-display');
        
        if (pointsDisplay) pointsDisplay.textContent = state.userPoints;
        
        // Mock levels
        let level = 'Apprentice';
        if (state.userPoints >= 1000) level = 'Exam Ready';
        else if (state.userPoints >= 500) level = 'Master';
        else if (state.userPoints >= 250) level = 'Lead Engineer';
        else if (state.userPoints >= 100) level = 'Senior Engineer';
        else if (state.userPoints >= 50) level = 'Dedicated';
        
        if (levelDisplay) levelDisplay.textContent = level;
        if (levelBadge) levelBadge.textContent = level;

        // Update Exam Lock status
        const examLock = document.getElementById('exam-lock-overlay');
        const examNav = document.querySelector('[data-page="exam"]');
        const examUnlockProgress = document.getElementById('exam-unlock-progress');
        const examUnlockText = document.getElementById('exam-unlock-text');
        
        const examThreshold = 100;
        const isExamUnlocked = state.userPoints >= examThreshold;
        
        if (examLock) {
            if (isExamUnlocked) {
                examLock.classList.add('hidden');
            } else {
                examLock.classList.remove('hidden');
                if (examUnlockProgress) {
                    const progress = Math.min(100, Math.round((state.userPoints / examThreshold) * 100));
                    examUnlockProgress.style.width = `${progress}%`;
                }
                if (examUnlockText) {
                    examUnlockText.textContent = `${state.userPoints}/${examThreshold} PTS to Unlock`;
                }
            }
        }
        
        if (examNav) {
            if (isExamUnlocked) {
                examNav.style.opacity = "1";
                examNav.style.pointerEvents = "auto";
            } else {
                examNav.style.opacity = "0.5";
                examNav.style.pointerEvents = "none";
            }
        }
    }

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

        container.innerHTML = state.recentActivity.map((activity, idx) => {
            const timeAgo = getTimeAgo(activity.timestamp);
            return `
                <div class="stagger-item bg-surface-container-lowest dark:bg-slate-900 rounded-xl p-4 shadow-[0_4px_20px_rgba(0,0,0,0.05)] flex items-center gap-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onclick="window.loadRecentActivity('${activity.id}')" style="animation-delay: ${idx * 100}ms">
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
            console.log("🛠️ Reconstructing activity from minimal snapshot...", activityId);
            const min = activity.minimalSnapshot;
            
            // Rebuild quizQuestions from indices or per-question refs
            let rebuiltQuestions = [];
            try {
                if (min.questions) {
                    rebuiltQuestions = min.questions.map(qRef => {
                        const masterList = QUESTIONS[qRef.sid] || [];
                        const q = masterList[qRef.idx];
                        if (q) return { ...JSON.parse(JSON.stringify(q)), subjectId: qRef.sid };
                        return null;
                    }).filter(q => q);
                } else if (min.questionIndices) {
                    const masterList = QUESTIONS[min.subjectId] || [];
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
        state.currentSubject = activity.stateSnapshot.currentSubject;
        state.currentTopic = activity.stateSnapshot.currentTopic;
        
        state.isMockExam = activity.isMockExam;
        state.score = activity.score;
        state.isFinished = true;

        // Display results
        let attempted = activity.attempted || 0;
        
        resTotal.textContent = state.quizQuestions.length;
        resAttempted.textContent = attempted;
        resCorrect.textContent = state.score;
        resAccuracy.textContent = `${activity.accuracy}%`;
        resultsSubjectName.textContent = state.currentTopic || state.currentSubject.name;

        updateQuestionMap();

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise();
        }

        if (state.score === state.quizQuestions.length && state.quizQuestions.length > 0) {
            triggerConfetti();
        }

        navigateTo('results-view');
    };
    
    // Quiz Engine
    function startQuiz(subjectId, topicName) {
        const subject = SUBJECTS.find(s => s.id === subjectId);
        let questions = QUESTIONS[subjectId] || [];
        
        if (topicName) {
            questions = questions.filter(q => q.topic === topicName);
        }

        if (questions.length === 0) {
            alert("No questions available for this topic yet.");
            return;
        }

        state.currentSubject = subject;
        state.currentTopic = topicName;
        
        const selectedRaw = [...questions].sort(() => 0.5 - Math.random()).slice(0, 10);
        // Tag each question with its subjectId for persistence
        const taggedQuestions = selectedRaw.map(q => ({ ...q, subjectId: subjectId }));
        state.quizQuestions = prepareQuestions(taggedQuestions);
        
        state.currentQuestionIndex = 0;
        state.answers = new Array(state.quizQuestions.length).fill(null);
        state.submitted = new Array(state.quizQuestions.length).fill(false);
        state.flagged = new Array(state.quizQuestions.length).fill(false);
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
        const question = state.quizQuestions[state.currentQuestionIndex];
        questionMeta.textContent = `Question ${state.currentQuestionIndex + 1} of ${state.quizQuestions.length} • ${state.currentTopic || state.currentSubject.name}`;
        
        questionText.innerHTML = `<p>${question.question}</p>`;
        
        const diagramsUnlocked = state.userPoints >= 150 || state.user.tier === 'premium' || state.user.username === 'admin' || state.user.role === 'admin';
        
        if (diagramsUnlocked) {
            if (question.question_image) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'question-image-container';
                imgDiv.innerHTML = `<img src="${question.question_image}" alt="Question Diagram" class="quiz-image">`;
                questionText.appendChild(imgDiv);
            } else if (question.image) {
                const imgDiv = document.createElement('div');
                imgDiv.className = 'question-image-container';
                imgDiv.innerHTML = `<img src="${question.image}" alt="Question Diagram" class="quiz-image">`;
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
        
        const options = document.querySelectorAll('.option');
        options.forEach(opt => opt.classList.remove('selected'));
        options[index].classList.add('selected');
        
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
            
            if (idx === state.currentQuestionIndex) {
                btn.classList.add('bg-secondary', 'text-white', 'ring-2', 'ring-offset-2', 'ring-secondary/50');
            } else if (state.submitted[idx]) {
                const q = state.quizQuestions[idx];
                const selectedIdx = state.answers[idx];
                const isCorrect = selectedIdx !== null && q.options[selectedIdx] && q.options[selectedIdx].is_correct;
                
                if (state.isFinished) {
                    btn.classList.add(isCorrect ? 'bg-green-500' : 'bg-red-500', 'text-white');
                } else {
                    btn.classList.add('bg-slate-200', 'dark:bg-slate-700', 'text-slate-600', 'dark:text-slate-300');
                }
            } else if (state.flagged[idx]) {
                btn.classList.add('bg-amber-500', 'text-white');
                btn.innerHTML = '<span class="material-symbols-outlined text-xs">flag</span>';
            } else {
                btn.classList.add('bg-slate-100', 'dark:bg-slate-800', 'text-slate-400', 'hover:bg-slate-200');
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

        const diagramsUnlocked = state.userPoints >= 150 || state.user.tier === 'premium' || state.user.username === 'admin' || state.user.role === 'admin';
        const solImg = question.solution_image || (question.solution && question.solution.solution_image);
        
        if (diagramsUnlocked) {
            if (solImg) {
                const globalImgDiv = document.createElement('div');
                globalImgDiv.className = 'solution-image-container';
                globalImgDiv.innerHTML = `<img src="${solImg}" alt="Solution Overview" class="quiz-image">`;
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
                <p>${step.content}</p>
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
                if (selectedIdx === null) {
                    alert("Please select an option first.");
                    return;
                }
                
                const question = state.quizQuestions[state.currentQuestionIndex];
                const isCorrect = question.options[selectedIdx].is_correct;
                
                state.submitted[state.currentQuestionIndex] = true;
                state.flagged[state.currentQuestionIndex] = false;
                
                if (isCorrect) {
                    addPoints(1);
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

    function startMockExam() {
        const totalExamQuestions = 20;
        let selectedQuestions = [];
        let availablePools = [];

        state.subjects.forEach(subject => {
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

        state.currentSubject = { name: "Full Mock Exam", id: "mock" };
        state.currentTopic = "All Subjects";
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
                    window.showToast('Milestone Unlocked! 🏆', ach.name, ach.icon);
                }, 1000);
            }
        });

        const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
        
        // Save to recent activity
        const activityTitle = state.isMockExam ? 'Mock Exam' : (state.currentTopic || state.currentSubject.name);
        const newActivity = {
            id: Date.now().toString(),
            title: activityTitle,
            score: correct,
            accuracy: accuracy,
            attempted: attempted,
            isMockExam: state.isMockExam,
            timestamp: Date.now(),
            stateSnapshot: {
                quizQuestions: JSON.parse(JSON.stringify(state.quizQuestions)),
                answers: [...state.answers],
                submitted: [...state.submitted],
                flagged: [...state.flagged],
                currentSubject: JSON.parse(JSON.stringify(state.currentSubject)),
                currentTopic: state.currentTopic
            },
            minimalSnapshot: {
                subjectId: state.currentSubject.id,
                topic: state.currentTopic,
                questions: state.quizQuestions.map(q => {
                    const sId = q.subjectId || state.currentSubject.id;
                    const masterList = QUESTIONS[sId] || [];
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
                flagged: [...state.flagged]
            }
        };
        state.recentActivity.unshift(newActivity);
        if (state.recentActivity.length > 5) {
            state.recentActivity.pop();
        }
        const activityKey = `enggtv_recent_activity_${state.user.username}`;
        localStorage.setItem(activityKey, JSON.stringify(state.recentActivity));

        // Save Progress
        if (!state.isMockExam) {
            updateProgress(state.currentSubject.id, attempted);
        }

        // Final Cloud Sync
        syncToFirebase();
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
            
            return `
                <div class="result-item" data-index="${idx}">
                    <div class="result-status-icon ${status}">${icon}</div>
                    <div class="result-text">${idx + 1}. ${displayHeader}</div>
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

    function updateProgress(subjectId, newlyCompleted) {
        if (!state.userProgress[subjectId]) {
            state.userProgress[subjectId] = { completed: 0 };
        }
        
        // Add newly completed questions to cumulative total
        state.userProgress[subjectId].completed += newlyCompleted;
        
        // Cap at total questions (calculated from QUESTIONS object)
        const questionsInSubject = (QUESTIONS[subjectId] || []).length;
        if (state.userProgress[subjectId].completed > questionsInSubject) {
            state.userProgress[subjectId].completed = questionsInSubject;
        }

        const progressKey = `enggtv_progress_${state.user.username}`;
        localStorage.setItem(progressKey, JSON.stringify(state.userProgress));
        syncToFirebase();
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
        const annSection = document.getElementById('announcement-section');
        const annLocked = document.getElementById('announcement-locked');
        const pointsProgress = document.getElementById('points-progress-bar');
        const pointsNeededText = document.getElementById('points-needed-text');
        const settingsPoints = document.getElementById('settings-points-display');
        const pointsToNextLevel = document.getElementById('points-to-next-level');

        const points = state.userPoints;
        const required = 50;

        // Note: Removed state.user.tier === 'premium' bypass to make point-based progression meaningful
        const isUnlocked = points >= required || state.user.username === 'admin' || state.user.role === 'admin';

        if (annSection && annLocked) {
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

        const examUnlocked = document.getElementById('exam-unlocked');
        const examLocked = document.getElementById('exam-locked');
        const navExam = document.getElementById('nav-exam');
        const milestoneBadge = document.getElementById('milestone-badge');
        const dashboardMilestoneBadge = document.getElementById('dashboard-milestone-badge');
        
        const examRequired = 100;
        // Note: Removed state.user.tier === 'premium' bypass to make point-based progression meaningful
        const isExamUnlocked = points >= examRequired || state.user.username === 'admin' || state.user.role === 'admin';
        
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
                    streakSubtitle.textContent = `${streak} days strong 🔥`;
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

    // Settings Functionality
    const btnAccount = document.getElementById('btn-account-info');
    const btnNotif = document.getElementById('btn-notifications');
    const toggleDark = document.getElementById('toggle-dark-mode');
    const btnSub = document.getElementById('btn-subscription');
    const btnSupport = document.getElementById('btn-support');
    const btnLogout = document.getElementById('btn-logout');

    if (btnAccount) btnAccount.addEventListener('click', () => navigateTo('account-info-view'));
    if (btnSupport) btnSupport.addEventListener('click', () => navigateTo('support-view'));
    
    // Account Info View Logic
    const backToSettingsBtn = document.getElementById('back-to-settings');
    const saveAccountBtn = document.getElementById('save-account-info');
    const dateJoinedDisplay = document.getElementById('date-joined-display');
    const userDisciplineDisplay = document.getElementById('user-discipline-display');
    const backFromSupportBtn = document.getElementById('back-from-support');

    if (backToSettingsBtn) backToSettingsBtn.addEventListener('click', () => navigateTo('settings'));
    if (backFromSupportBtn) backFromSupportBtn.addEventListener('click', () => navigateTo('settings'));

    function initAccountInfo() {
        // Display Discipline (Static)
        const savedDiscipline = localStorage.getItem('enggtv_discipline') || state.user.discipline || 'Mechanical';
        if (userDisciplineDisplay) userDisciplineDisplay.textContent = savedDiscipline;
        if (document.getElementById('discipline-profile-display')) {
            document.getElementById('discipline-profile-display').textContent = savedDiscipline;
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
            
            // Reload subjects
            if (newDiscipline === 'Mechanical') state.subjects = MECHANICAL_SUBJECTS;
            else if (newDiscipline === 'Civil' || newDiscipline === 'Civil Engineering') state.subjects = CIVIL_SUBJECTS;
            else state.subjects = OTHER_SUBJECTS;
            
            updateUIForTier();
            renderSubjects();
            updateDashboardStats();
            syncToFirebase(); // Sync discipline change to cloud
            
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
                        subject:      subjectVal,
                        message:      msgVal,
                        reply_to:     'admin@engg.tv',
                        sent_at:      new Date().toLocaleString(),
                        discipline:   localStorage.getItem('enggtv_discipline') || 'Unknown',
                        user_points:  state.userPoints
                    });
                } else {
                    // Fallback: open mailto with pre-filled content so the message still reaches admin
                    const mailtoBody  = encodeURIComponent(`From: ${nameVal} (${state.user.username})\nSubject: ${subjectVal}\n\n${msgVal}`);
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
    if (btnLogout) btnLogout.addEventListener('click', () => { 
        if(confirm('Are you sure you want to log out?')) {
            localStorage.removeItem('enggtv_authenticated');
            window.location.href = 'login.html';
        }
    });

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

    const ACHIEVEMENTS = [
        { id: 'first_point', name: 'First Step', points: 1, icon: 'bolt', description: 'Earn your first point.' },
        { id: 'consistent', name: 'Consistent Learner', points: 10, icon: 'auto_stories', description: 'Reach 10 points.' },
        { id: 'dedicated', name: 'Dedicated Engineer', points: 25, icon: 'engineering', description: 'Reach 25 points.' },
        { id: 'announcement_unlocked', name: 'Insider Access', points: 50, icon: 'campaign', description: 'Unlock the Announcements section.' },
        { id: 'scholar', name: 'Senior Engineer', points: 100, icon: 'school', description: 'Unlock the full-length Mock Exam simulation.' },
        { id: 'master', name: 'Lead Engineer', points: 250, icon: 'workspace_premium', description: 'Commanding a strong grasp of FE fundamentals.' },
        { id: 'senior', name: 'Concept Master', points: 500, icon: 'military_tech', description: 'Exhibiting advanced mastery of core engineering principles.' },
        { id: 'professional', name: 'Official Exam Ready', points: 1000, icon: 'verified', description: 'Our Professors say Go ahead and be successful in your actual exam' }
    ];

    function renderAchievements() {
        const list = document.getElementById('achievements-list');
        const totalPointsDisplay = document.getElementById('achievements-total-points');
        if (!list || !totalPointsDisplay) return;

        totalPointsDisplay.textContent = `${state.userPoints} Points`;
        list.innerHTML = '';

        ACHIEVEMENTS.forEach(ach => {
            const isUnlocked = state.userPoints >= ach.points;
            const card = document.createElement('div');
            card.className = `flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                isUnlocked 
                ? 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 shadow-sm' 
                : 'bg-slate-50/50 dark:bg-slate-900/50 border-slate-100 dark:border-slate-800 opacity-60'
            }`;

            card.innerHTML = `
                <div class="w-12 h-12 rounded-xl flex items-center justify-center ${
                    isUnlocked ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                }">
                    <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' ${isUnlocked ? 1 : 0};">${ach.icon}</span>
                </div>
                <div class="flex-1 text-left">
                    <div class="flex justify-between items-center">
                        <h5 class="font-bold text-sm ${isUnlocked ? 'text-slate-800 dark:text-slate-100' : 'text-slate-400'}">${ach.name}</h5>
                        <span class="text-[10px] font-black uppercase tracking-widest ${isUnlocked ? 'text-amber-600' : 'text-slate-400'}">${ach.points} PTS</span>
                    </div>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400">${ach.description}</p>
                </div>
                ${isUnlocked ? '<span class="material-symbols-outlined text-green-500 text-sm">check_circle</span>' : ''}
            `;
            list.appendChild(card);
        });
    }

    const btnPointsInfo = document.getElementById('btn-points-info');
    const backFromAchievements = document.getElementById('back-from-achievements');

    if (btnPointsInfo) btnPointsInfo.addEventListener('click', () => navigateTo('achievements-view'));
    if (backFromAchievements) backFromAchievements.addEventListener('click', () => navigateTo('settings'));

    const MOCK_LEADERBOARD = [
        { username: 'Sara', points: 482, discipline: 'Civil', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=sara', trend: 'up', streak: 12 },
        { username: 'MikeEng', points: 395, discipline: 'Mechanical', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=mike', trend: 'down', streak: 5 },
        { username: 'Julia', points: 320, discipline: 'Civil', country: 'Egypt', avatar: 'https://i.pravatar.cc/150?u=julia', trend: 'up', streak: 8 },
        { username: 'Tom', points: 285, discipline: 'Mechanical', country: 'United Arab Emirates', avatar: 'https://i.pravatar.cc/150?u=tom', trend: 'same', streak: 3 },
        { username: 'Elena', points: 210, discipline: 'Mechanical', country: 'India', avatar: 'https://i.pravatar.cc/150?u=elena', trend: 'up', streak: 15 },
        { username: 'David', points: 195, discipline: 'Other', country: 'United Kingdom', avatar: 'https://i.pravatar.cc/150?u=david', trend: 'down', streak: 2 },
        { username: 'Chris', points: 150, discipline: 'Mechanical', country: 'Australia', avatar: 'https://i.pravatar.cc/150?u=chris', trend: 'up', streak: 4 },
        { username: 'Emma', points: 120, discipline: 'Other', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=emma', trend: 'same', streak: 0 },
        { username: 'Ryan', points: 95, discipline: 'Civil', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=ryan', trend: 'down', streak: 1 }
    ];

    function renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        const userCountry = state.user.country || 'Other';
        const userStreak = calculateStreak();

        // Combine mock data with current user
        const allUsers = [...MOCK_LEADERBOARD, {
            username: state.user.username === 'demo' ? 'You (Alex)' : `You (${state.user.username})`,
            points: state.userPoints,
            discipline: localStorage.getItem('enggtv_discipline') || 'FE Candidate',
            country: userCountry,
            isCurrentUser: true,
            trend: 'up',
            streak: userStreak,
            avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe2S82u2sZJ3xmW3cB9zBfpog-Qu3ypJ-ZTjq6ymCTfI96k-XIcFqQH3_f-tnsCfhMQ8xlR31x9mShYD9i8-wV6691uWOysJOwRmYJOT1Ri-FqPpcoLhpq1mI6oavBfjrHajem7t3UOUFVx768eyERSx9s7OsNOezurrmnjosEF6xlDNMD4mV6KEGawwDBhd8IsqV63tn97lLQ5B0aCocCRUAL3iKJJLR_byQT4Dg_BIwq5vtnwpwp3QJNAE0FMVnXpM1IfkQKccq4'
        }];

        // Sort by points descending
        allUsers.sort((a, b) => b.points - a.points);

        // Take top 10
        const top10 = allUsers.slice(0, 10);

        list.innerHTML = top10.map((user, index) => {
            const rank = index + 1;
            let rankBadge = '';
            if (rank === 1) rankBadge = 'bg-amber-400 text-white';
            else if (rank === 2) rankBadge = 'bg-slate-300 text-slate-700';
            else if (rank === 3) rankBadge = 'bg-amber-600/60 text-white';
            else rankBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-400';

            const trendIcon = user.trend === 'up' ? 'trending_up' : (user.trend === 'down' ? 'trending_down' : 'remove');
            const trendColor = user.trend === 'up' ? 'text-green-500' : (user.trend === 'down' ? 'text-red-500' : 'text-slate-400');

            return `
                <div class="flex items-center gap-4 p-5 ${user.isCurrentUser ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary' : ''}">
                    <div class="flex flex-col items-center shrink-0 w-8">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${rankBadge}">
                            ${rank}
                        </div>
                        <span class="material-symbols-outlined text-[14px] ${trendColor} mt-1">${trendIcon}</span>
                    </div>
                    <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 relative">
                        <img src="${user.avatar}" class="w-full h-full object-cover" alt="${user.username}">
                        ${user.streak > 5 ? '<div class="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-0.5"><span class="material-symbols-outlined text-[10px] block">local_fire_department</span></div>' : ''}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm ${user.isCurrentUser ? 'text-primary' : 'text-slate-800 dark:text-slate-100'} flex items-center gap-1">
                            ${user.username} 
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

    let pendingAvatarId = localStorage.getItem('enggtv_avatar') || null;

    function applyAvatar() {
        const savedId = localStorage.getItem('enggtv_avatar');
        const preset = AVATAR_PRESETS.find(a => a.id === savedId);

        const headerContainer   = document.getElementById('header-avatar-container');
        const settingsContainer = document.getElementById('settings-avatar-container');

        [headerContainer, settingsContainer].forEach((container, i) => {
            if (!container) return;
            if (preset) {
                const size = i === 0 ? '22px' : '36px';
                container.innerHTML = `
                    <div class="avatar-emoji-display"
                         style="background:${preset.gradient}; font-size:${size};">
                        ${preset.emoji}
                    </div>`;
            } else {
                // Restore original imgs if no avatar chosen
                if (i === 0) {
                    container.innerHTML = `<img id="header-avatar-img" class="w-full h-full object-cover"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe2S82u2sZJ3xmW3cB9zBfpog-Qu3ypJ-ZTjq6ymCTfI96k-XIcFqQH3_f-tnsCfhMQ8xlR31x9mShYD9i8-wV6691uWOysJOwRmYJOT1Ri-FqPpcoLhpq1mI6oavBfjrHajem7t3UOUFVx768eyERSx9s7OsNOezurrmnjosEF6xlDNMD4mV6KEGawwDBhd8IsqV63tn97lLQ5B0aCocCRUAL3iKJJLR_byQT4Dg_BIwq5vtnwpwp3QJNAE0FMVnXpM1IfkQKccq4"/>`;
                } else {
                    container.innerHTML = `<img id="settings-avatar-img" class="w-full h-full object-cover" alt="Profile"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5KvXfnOr12k5SzP6fbV0MWcvNYjQppUc89dWdHwtt0LrMrxWc1UtbF12daBvTIvDM4-Pbiso8pORGGDZgEp95bsmWYDbPdggsVh89FcxWsuzHhPxhY9KM5FxwbYYVVJlRdHw1eVngYCCJYLEwkE1OZnwygR0y-za4B_I1aACLrZJ5_SsP0Uundq_5ePMlIxpXJi2YoSsNZnCF4Mp0shocQ1xiC60lxWTjsK-CY3Md962fc6vAc6Csv8KEhV8gBTOGs4jAoTC5mKjN"/>`;
                }
            }
        });
    }

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
            if (pendingAvatarId) localStorage.setItem('enggtv_avatar', pendingAvatarId);
            else localStorage.removeItem('enggtv_avatar');
            applyAvatar();
            syncToFirebase(); // Sync avatar change to cloud
            avatarModal.classList.remove('open');
        });
    }
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            pendingAvatarId = null;
            localStorage.removeItem('enggtv_avatar');
            applyAvatar();
            syncToFirebase(); // Sync avatar removal to cloud
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

    // Run Init
    init();
});
