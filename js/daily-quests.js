document.addEventListener('DOMContentLoaded', () => {
    const state = window.state || {};

    // ===== DAILY QUESTS SYSTEM =====
    const QUESTS = [
        { id: 'questions_answered', title: 'Daily Grind', desc: 'Answer 15 questions today', target: 15, reward: 5, icon: 'edit_square' },
        { id: 'perfect_quiz', title: 'Flawless Victory', desc: 'Score 80%+ on any quiz', target: 1, reward: 10, icon: 'verified' },
        { id: 'srs_review', title: 'Memory Builder', desc: 'Complete an SRS Review', target: 1, reward: 5, icon: 'cycle' }
    ];

    function getDailyQuestsState() {
        if (!state.user || !state.user.username) {
            return { key: '', qState: { questions_answered: 0, perfect_quiz: 0, srs_review: 0, claimed: {} } };
        }
        const today = new Date().toISOString().split('T')[0];
        const key = `enggtv_quests_${state.user.username}_${today}`;
        let qState = JSON.parse(localStorage.getItem(key));
        if (!qState) {
            qState = { questions_answered: 0, perfect_quiz: 0, srs_review: 0, claimed: {} };
            localStorage.setItem(key, JSON.stringify(qState));
        }
        return { key, qState };
    }

    window.incrementQuestProgress = function(questId, amount) {
        if (!state.user || !state.user.username) return;
        const { key, qState } = getDailyQuestsState();
        if (qState[questId] !== undefined) {
            const questDef = QUESTS.find(q => q.id === questId);
            if (!questDef) return;

            if (qState[questId] < questDef.target) {
                qState[questId] += amount;
                if (qState[questId] > questDef.target) qState[questId] = questDef.target;
                localStorage.setItem(key, JSON.stringify(qState));
                
                if (qState[questId] === questDef.target && !qState.claimed[questId]) {
                    window.showToast("Quest Completed!", `You completed: ${questDef.title}. Claim your points!`, "military_tech");
                    if (typeof window.publishPeerMilestone === 'function') {
                        const disc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
                        window.publishPeerMilestone({
                            type: 'daily_quest',
                            title: `Completed Daily Quest: ${questDef.title} 🎯`,
                            detail: questDef.desc,
                            discipline: disc
                        });
                    }
                }
                
                if (state.currentPage === 'dashboard' || state.currentPage === 'feedback') renderDailyQuests();
            }
        }
    };

    window.claimQuestReward = function(questId) {
        if (!state.user || !state.user.username) return;
        const { key, qState } = getDailyQuestsState();
        if (!qState.claimed[questId]) {
            const questDef = QUESTS.find(q => q.id === questId);
            if (!questDef) return;

            qState.claimed[questId] = true;
            localStorage.setItem(key, JSON.stringify(qState));

            // Joyful Confetti Animation
            if (typeof confetti === 'function') {
                try {
                    confetti({
                        particleCount: 70,
                        spread: 80,
                        origin: { y: 0.6 }
                    });
                } catch (e) {
                    console.warn('Confetti animation failed', e);
                }
            }

            if (window.addPoints) {
                window.addPoints(questDef.reward, "Daily Quest Reward!");
            } else {
                state.userPoints += questDef.reward;
                localStorage.setItem(`enggtv_points_${state.user.username}`, state.userPoints.toString());
                if (window.updateGamificationUI) window.updateGamificationUI();
                if (window.syncToFirebase) window.syncToFirebase();
                window.showToast("Reward Claimed!", `+${questDef.reward} Bonus Points added!`, "stars");
            }

            renderDailyQuests();
        }
    };

    /**
     * Renders Daily Quests as animated circular dials with interactive states
     */
    function renderDailyQuests() {
        const container = document.getElementById('daily-quests-list');
        if (!container) return;

        const { qState } = getDailyQuestsState();
        const circumference = 238.76; // 2 * PI * 38 (for r = 38 inside 100x100 viewBox)
        let totalCompleted = 0;

        const dialsHtml = QUESTS.map((q) => {
            const progress = qState[q.id] || 0;
            const isCompleted = progress >= q.target;
            const isClaimed = qState.claimed && qState.claimed[q.id];
            const pct = Math.min(100, Math.round((progress / q.target) * 100));
            const targetOffset = circumference - (pct / 100) * circumference;

            if (isCompleted) totalCompleted++;

            // Visual themes per quest
            let strokeGradient = `url(#dial-grad-${q.id})`;
            let iconColor = 'text-amber-500 dark:text-amber-400';
            let cardGlow = '';
            let ringPulse = '';
            let centerText = `${progress}/${q.target}`;
            let centerIcon = q.icon;
            let actionBtn = '';

            if (q.id === 'perfect_quiz') {
                iconColor = 'text-rose-500 dark:text-rose-400';
            } else if (q.id === 'srs_review') {
                iconColor = 'text-emerald-500 dark:text-emerald-400';
            }

            if (isClaimed) {
                strokeGradient = '#10b981';
                iconColor = 'text-emerald-500';
                centerIcon = 'check_circle';
                centerText = 'Done';
                actionBtn = `
                    <span class="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/40 rounded-xl">
                        <span class="material-symbols-outlined text-[13px]">check</span> Claimed
                    </span>
                `;
            } else if (isCompleted) {
                cardGlow = 'ring-2 ring-amber-400/80 dark:ring-amber-400/60 shadow-lg shadow-amber-500/20';
                ringPulse = 'animate-pulse';
                centerIcon = 'stars';
                centerText = '100%';
                actionBtn = `
                    <button onclick="claimQuestReward('${q.id}'); event.stopPropagation();" class="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 text-[10px] font-black text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-xl uppercase tracking-wider shadow-md shadow-amber-500/30 hover:brightness-110 active:scale-95 transition-all animate-bounce cursor-pointer">
                        <span class="material-symbols-outlined text-[13px]">military_tech</span> Claim +${q.reward}
                    </button>
                `;
            } else {
                let actionLabel = 'Start Drill';
                if (q.id === 'srs_review') actionLabel = 'Review SRS';
                actionBtn = `
                    <button class="inline-flex items-center justify-center gap-1 w-full py-1.5 px-2 text-[10px] font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-amber-100/70 dark:bg-slate-700/60 dark:hover:bg-amber-950/40 hover:text-amber-700 dark:hover:text-amber-400 rounded-xl transition-all border border-slate-200/60 dark:border-slate-600/40 cursor-pointer">
                        <span>${actionLabel}</span>
                        <span class="material-symbols-outlined text-[11px]">arrow_forward</span>
                    </button>
                `;
            }

            let clickAction = '';
            if (isClaimed) {
                clickAction = `onclick="window.showToast('Daily Quest', 'You already claimed ${q.title}! Resets at midnight.', 'check_circle');"`;
            } else if (isCompleted) {
                clickAction = `onclick="claimQuestReward('${q.id}'); event.stopPropagation();"`;
            } else if (q.id === 'srs_review') {
                clickAction = `onclick="const btn = document.getElementById('btn-start-srs-quiz'); if(btn) { btn.click(); } else { navigateTo('study'); }"`;
            } else {
                clickAction = `onclick="window.showToast('Daily Quest: ${q.title}', '${q.desc}. Launching practice quiz...', 'military_tech'); navigateTo('study');"`;
            }

            return `
                <div ${clickAction} class="relative flex flex-col items-center p-3 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 hover:border-amber-400/60 dark:hover:border-amber-500/50 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer ${cardGlow}">
                    
                    <!-- Top Title & Reward Badge -->
                    <div class="flex items-center justify-between w-full mb-1 px-0.5">
                        <span class="text-[9px] uppercase tracking-wider font-mono font-bold text-slate-600 dark:text-slate-300 truncate max-w-[68px] sm:max-w-none" title="${q.title}">${q.title}</span>
                        <span class="text-[9px] font-black font-mono text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-1.5 py-0.2 rounded-md border border-amber-300 dark:border-amber-700/50 shrink-0">+${q.reward}</span>
                    </div>

                    <!-- Animated Circular Dial Container -->
                    <div class="relative w-16 h-16 sm:w-20 sm:h-20 my-1 shrink-0 flex items-center justify-center">
                        <svg class="w-full h-full -rotate-90 transform ${ringPulse}" viewBox="0 0 100 100">
                            <!-- Background Track Circle -->
                            <circle cx="50" cy="50" r="38" fill="none" stroke="currentColor" stroke-width="8" class="text-slate-100 dark:text-slate-700/50" />
                            <!-- Animated Foreground Progress Arc -->
                            <circle class="quest-dial-circle" cx="50" cy="50" r="38" fill="none"
                                stroke="${strokeGradient}"
                                stroke-width="8"
                                stroke-linecap="round"
                                stroke-dasharray="238.76"
                                stroke-dashoffset="238.76"
                                data-target-offset="${targetOffset}"
                                style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1);"/>
                        </svg>

                        <!-- Dial Center: Icon & Ratio -->
                        <div class="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
                            <span class="material-symbols-outlined text-base sm:text-lg ${iconColor} transition-transform group-hover:scale-110" style="font-variation-settings:'FILL' ${isCompleted ? 1 : 0};">${centerIcon}</span>
                            <span class="text-[10px] sm:text-[11px] font-mono font-black text-slate-800 dark:text-slate-100 tracking-tighter mt-0.5">${centerText}</span>
                        </div>
                    </div>

                    <!-- Quest Objective -->
                    <p class="text-[10px] text-slate-500 dark:text-slate-400 text-center leading-tight line-clamp-1 mb-2 px-0.5" title="${q.desc}">
                        ${q.desc}
                    </p>

                    <!-- Bottom Action Button -->
                    <div class="w-full mt-auto">
                        ${actionBtn}
                    </div>
                </div>
            `;
        }).join('');

        // Container Layout with SVG Gradients Defs + 3 Dials Grid + Status Footer
        container.innerHTML = `
            <!-- SVG Gradient Definitions -->
            <svg width="0" height="0" class="absolute pointer-events-none" aria-hidden="true">
                <defs>
                    <linearGradient id="dial-grad-questions_answered" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f59e0b" />
                        <stop offset="100%" stop-color="#ea580c" />
                    </linearGradient>
                    <linearGradient id="dial-grad-perfect_quiz" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f43f5e" />
                        <stop offset="100%" stop-color="#be0055" />
                    </linearGradient>
                    <linearGradient id="dial-grad-srs_review" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="100%" stop-color="#06b6d4" />
                    </linearGradient>
                </defs>
            </svg>

            <!-- 3 Animated Circular Dials Grid -->
            <div class="grid grid-cols-3 gap-2 sm:gap-2.5">
                ${dialsHtml}
            </div>

            <!-- Dial Summary Banner -->
            <div class="mt-2.5 p-2.5 rounded-2xl bg-slate-50 dark:bg-black/30 border border-slate-200/80 dark:border-white/5 flex items-center justify-between gap-2 shadow-xs">
                <div class="flex items-center gap-2 min-w-0">
                    <span class="material-symbols-outlined text-amber-500 text-base shrink-0">military_tech</span>
                    <span class="text-[11px] text-slate-600 dark:text-slate-300 truncate">
                        ${totalCompleted === 3 ? '🎉 <strong>All Dials Maxed!</strong> All daily bonus points unlocked.' : 'Complete quizzes to advance your daily circular dials.'}
                    </span>
                </div>
                <div class="flex items-center gap-1.5 shrink-0">
                    <span class="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${totalCompleted === 3 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400' : 'bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}">
                        ${totalCompleted}/3 Done
                    </span>
                </div>
            </div>
        `;

        // Trigger dynamic stroke animation on render
        setTimeout(() => {
            container.querySelectorAll('.quest-dial-circle').forEach(circle => {
                const targetOffset = circle.getAttribute('data-target-offset');
                if (targetOffset !== null) {
                    circle.style.strokeDashoffset = targetOffset;
                }
            });
        }, 50);
    }

    // Expose rendering globally
    window.renderDailyQuests = renderDailyQuests;

    // Hook daily quests rendering into the global navigation function
    const _origNav = window.navigateTo;
    if (_origNav) {
        window.navigateTo = function(pageId) {
            _origNav(pageId);
            if (pageId === 'dashboard') {
                renderDailyQuests();
            }
        };
    }

    // Initial render of daily quests
    renderDailyQuests();
});
