document.addEventListener('DOMContentLoaded', () => {
    const state = window.state;

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
            if (qState[questId] < questDef.target) {
                qState[questId] += amount;
                if (qState[questId] > questDef.target) qState[questId] = questDef.target;
                localStorage.setItem(key, JSON.stringify(qState));
                
                if (qState[questId] === questDef.target && !qState.claimed[questId]) {
                    window.showToast("Quest Completed!", `You completed: ${questDef.title}. Claim your points!`, "military_tech");
                }
                
                if (state.currentPage === 'dashboard') renderDailyQuests();
            }
        }
    };

    window.claimQuestReward = function(questId) {
        if (!state.user || !state.user.username) return;
        const { key, qState } = getDailyQuestsState();
        if (!qState.claimed[questId]) {
            const questDef = QUESTS.find(q => q.id === questId);
            qState.claimed[questId] = true;
            localStorage.setItem(key, JSON.stringify(qState));
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

    function renderDailyQuests() {
        const container = document.getElementById('daily-quests-list');
        if (!container) return;

        const { qState } = getDailyQuestsState();
        
        container.innerHTML = QUESTS.map(q => {
            const progress = qState[q.id] || 0;
            const isCompleted = progress >= q.target;
            const isClaimed = qState.claimed && qState.claimed[q.id];
            const pct = Math.min(100, (progress / q.target) * 100);
            
            let actionHtml = '';
            let clickAction = '';
            let hoverClasses = '';
            let cardBg = 'bg-white dark:bg-slate-800/80 border-slate-100 dark:border-slate-700';
            let titleColor = 'text-slate-800 dark:text-slate-100';
            
            if (isClaimed) {
                actionHtml = `<span class="text-[10px] font-black text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-widest border border-slate-200 dark:border-slate-700">Claimed</span>`;
                cardBg = 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-100/50 dark:border-emerald-800/30';
                titleColor = 'text-slate-500 dark:text-slate-400';
            } else if (isCompleted) {
                actionHtml = `<button onclick="claimQuestReward('${q.id}'); event.stopPropagation();" class="text-[10px] font-black text-white bg-gradient-to-r from-amber-500 to-orange-500 px-3 py-1 rounded-full uppercase tracking-widest shadow-md shadow-amber-500/30 active:scale-95 transition-all">Claim +${q.reward}</button>`;
            } else {
                actionHtml = `<span class="text-[10px] font-bold text-slate-500 dark:text-slate-400">${progress}/${q.target}</span>`;
                hoverClasses = 'cursor-pointer hover:border-amber-400/50 hover:bg-amber-50/30 dark:hover:border-amber-500/50 dark:hover:bg-amber-900/10 active:scale-[0.98] transition-all';
                if (q.id === 'srs_review') {
                    clickAction = `onclick="const btn = document.getElementById('btn-start-srs-quiz'); if(btn) { btn.click(); }"`;
                } else {
                    clickAction = `onclick="window.showToast('Daily Quest', 'Select any topic to start a quiz and earn progress!', 'military_tech'); navigateTo('study');"`;
                }
            }

            return `
                <div ${clickAction} class="${cardBg} rounded-2xl p-3 border ${hoverClasses}">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-xl ${isCompleted && !isClaimed ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500'} flex items-center justify-center shrink-0 transition-colors">
                            <span class="material-symbols-outlined text-lg" style="font-variation-settings:'FILL' ${isCompleted ? 1 : 0};">${q.icon}</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <div class="flex items-center justify-between mb-1">
                                <h5 class="text-sm font-bold ${titleColor} truncate">${q.title}</h5>
                                ${actionHtml}
                            </div>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 leading-tight mb-2">${q.desc} for +${q.reward} bonus points!</p>
                            <div class="w-full h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                <div class="h-full ${isClaimed ? 'bg-slate-300 dark:bg-slate-600' : 'bg-amber-500'} transition-all duration-500 rounded-full" style="width: ${pct}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Expose rendering
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
