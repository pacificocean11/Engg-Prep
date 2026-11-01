/**
 * ENGG.tv - AI-Assisted Blunt Performance Evaluator (Experimental)
 * 
 * Presents an unvarnished, multi-screen comprehensive diagnostic report dossier
 * analyzing candidate's pass probability, NCEES scaled score trajectory,
 * vanity streaks, cognitive blind spots, and 48-hour recovery blueprint.
 * 
 * Supports both Light Mode and Dark Mode dynamically, adapting to user's saved theme.
 */

(function () {
    'use strict';

    const FLAG_KEY = 'enggtv_ai_eval_enabled';
    const API_KEY_STORAGE = 'enggtv_gemini_api_key';

    let currentChapterIndex = 0;
    const TOTAL_CHAPTERS = 5;
    let lastEvaluationResult = null;

    // Feature flag: enabled by default for testing, can be toggled off anytime
    function isFeatureEnabled() {
        const val = localStorage.getItem(FLAG_KEY);
        return val === null ? true : val === 'true';
    }

    function isDarkMode() {
        return document.documentElement.classList.contains('dark') || (localStorage.getItem('enggtv_theme') === 'dark');
    }

    /**
     * Aggregates granular metrics from localStorage, state, userProgress, and recent activity
     */
    function collectEvaluationMetrics() {
        const state = window.state || {};

        // 1. Resolve username with multi-key fallback
        let username = state.user?.username;
        if (!username || username === 'guest') {
            try {
                const storedUser = JSON.parse(localStorage.getItem('enggtv_user'));
                if (storedUser?.username && storedUser.username !== 'guest') {
                    username = storedUser.username;
                }
            } catch (e) {}
        }
        if (!username) username = 'guest';

        const discipline = localStorage.getItem('enggtv_discipline') || (state.currentDiscipline?.name) || (state.user?.discipline) || 'Mechanical';

        // Gather all candidate username keys for robust retrieval
        const candidateUsernames = Array.from(new Set([
            username,
            state.user?.username,
            'guest',
            'Candidate'
        ])).filter(Boolean);

        // 2. Aggregate Weakness Data across potential keys
        let weaknessesRaw = {};
        for (const u of candidateUsernames) {
            try {
                const raw = localStorage.getItem(`enggtv_weakness_${u}`);
                if (raw) {
                    const parsed = JSON.parse(raw);
                    if (parsed && typeof parsed === 'object') {
                        Object.keys(parsed).forEach(k => {
                            if (!weaknessesRaw[k] || (parsed[k].total || 0) > (weaknessesRaw[k].total || 0)) {
                                weaknessesRaw[k] = parsed[k];
                            }
                        });
                    }
                }
            } catch (e) {
                console.warn(`Failed to parse weakness data for ${u}`, e);
            }
        }

        // Also scan for any other enggtv_weakness_* if still empty
        if (Object.keys(weaknessesRaw).length === 0) {
            try {
                for (let i = 0; i < localStorage.length; i++) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('enggtv_weakness_')) {
                        const parsed = JSON.parse(localStorage.getItem(key) || '{}');
                        if (parsed && typeof parsed === 'object') {
                            Object.assign(weaknessesRaw, parsed);
                        }
                    }
                }
            } catch (e) {}
        }

        const weaknesses = [];
        let weaknessTotalQuestions = 0;
        let weaknessTotalWrong = 0;

        Object.keys(weaknessesRaw).forEach(k => {
            const item = weaknessesRaw[k];
            if (item && item.total > 0) {
                weaknessTotalQuestions += item.total;
                weaknessTotalWrong += (item.wrong || 0);
                weaknesses.push({
                    subject: item.subjectId || discipline,
                    topic: item.topic || k.split('::')[1] || 'General',
                    wrong: item.wrong || 0,
                    total: item.total || 0,
                    errorRate: Math.round(((item.wrong || 0) / item.total) * 100)
                });
            }
        });

        // 3. User Progress: Sum completed questions per subject
        let userProgressObj = state.userProgress || {};
        if (!userProgressObj || Object.keys(userProgressObj).length === 0) {
            for (const u of candidateUsernames) {
                try {
                    const raw = localStorage.getItem(`enggtv_progress_${u}`);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (parsed && Object.keys(parsed).length > 0) {
                            userProgressObj = parsed;
                            break;
                        }
                    }
                } catch (e) {}
            }
        }

        let progressTotalCompleted = 0;
        const progressSubjectStats = {};
        if (userProgressObj && typeof userProgressObj === 'object') {
            Object.keys(userProgressObj).forEach(subKey => {
                const completed = Number(userProgressObj[subKey]?.completed || 0);
                if (completed > 0) {
                    progressTotalCompleted += completed;
                    progressSubjectStats[subKey] = completed;
                }
            });
        }

        // 4. Recent Activity: Aggregate attempts, scores, and topic breakdown
        let recentActivityList = Array.isArray(state.recentActivity) ? state.recentActivity : [];
        if (recentActivityList.length === 0) {
            for (const u of candidateUsernames) {
                try {
                    const raw = localStorage.getItem(`enggtv_recent_activity_${u}`);
                    if (raw) {
                        const parsed = JSON.parse(raw);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                            recentActivityList = parsed;
                            break;
                        }
                    }
                } catch (e) {}
            }
        }

        let activityTotalAttempted = 0;
        let activityTotalCorrect = 0;
        const activityTopicMap = {};

        recentActivityList.forEach(act => {
            if (!act) return;
            const attempted = Number(act.attempted) || (Array.isArray(act.stateSnapshot?.submitted) ? act.stateSnapshot.submitted.filter(Boolean).length : 0);
            let score = 0;
            if (act.score !== undefined) {
                score = Number(act.score) || 0;
            } else if (act.correct !== undefined) {
                score = Number(act.correct) || 0;
            } else if (act.accuracy !== undefined && attempted > 0) {
                score = Math.round((Number(act.accuracy) / 100) * attempted);
            }
            if (attempted > 0) {
                activityTotalAttempted += attempted;
                activityTotalCorrect += Math.min(score, attempted);

                const topic = act.minimalSnapshot?.topic || act.topic || act.title || 'General';
                const subjectId = act.subjectId || act.minimalSnapshot?.subjectId || discipline;
                const mapKey = `${subjectId}::${topic}`;
                if (!activityTopicMap[mapKey]) {
                    activityTopicMap[mapKey] = { subject: subjectId, topic, total: 0, wrong: 0 };
                }
                activityTopicMap[mapKey].total += attempted;
                activityTopicMap[mapKey].wrong += Math.max(0, attempted - score);
            }
        });

        // 5. Points: Check if points exist as additional proof of activity
        let points = Number(state.userPoints) || 0;
        if (!points) {
            for (const u of candidateUsernames) {
                const storedPoints = parseInt(localStorage.getItem(`enggtv_points_${u}`), 10);
                if (!isNaN(storedPoints) && storedPoints > points) {
                    points = storedPoints;
                }
            }
        }

        // 6. Harmonize and Reconcile Total Questions Solved & Correct
        let totalQuestions = Math.max(weaknessTotalQuestions, activityTotalAttempted, progressTotalCompleted);
        // If still 0 but user has accumulated points, deduce minimum questions solved (e.g. 10 pts per question)
        if (totalQuestions === 0 && points >= 10) {
            totalQuestions = Math.floor(points / 10);
        }

        let totalCorrect = 0;
        if (totalQuestions > 0) {
            if (weaknessTotalQuestions >= totalQuestions && weaknessTotalQuestions > 0) {
                totalCorrect = Math.max(0, weaknessTotalQuestions - weaknessTotalWrong);
            } else if (activityTotalAttempted > 0) {
                const actRatio = activityTotalCorrect / activityTotalAttempted;
                totalCorrect = Math.round(totalQuestions * actRatio);
            } else if (weaknessTotalQuestions > 0) {
                const weakRatio = Math.max(0, weaknessTotalQuestions - weaknessTotalWrong) / weaknessTotalQuestions;
                totalCorrect = Math.round(totalQuestions * weakRatio);
            } else {
                // Verified progress default passing benchmark ~72%
                totalCorrect = Math.round(totalQuestions * 0.72);
            }
            totalCorrect = Math.min(totalQuestions, Math.max(0, totalCorrect));
        }

        // 7. If weaknesses array is empty but we have activity or progress data, synthesize weaknesses
        if (weaknesses.length === 0) {
            if (Object.keys(activityTopicMap).length > 0) {
                Object.values(activityTopicMap).forEach(item => {
                    weaknesses.push({
                        subject: item.subject,
                        topic: item.topic,
                        wrong: item.wrong,
                        total: item.total,
                        errorRate: Math.round(((item.wrong || 0) / (item.total || 1)) * 100)
                    });
                });
            } else if (Object.keys(progressSubjectStats).length > 0) {
                Object.keys(progressSubjectStats).forEach(sKey => {
                    const count = progressSubjectStats[sKey];
                    const cleanSubj = sKey.replace('_advanced', '').replace(/_/g, ' ');
                    weaknesses.push({
                        subject: cleanSubj,
                        topic: 'Subject Practice Problems',
                        wrong: Math.round(count * 0.28),
                        total: count,
                        errorRate: 28
                    });
                });
            }
        }

        // 8. SRS Data (Spaced Repetition due count)
        let srsDueCount = 0;
        const now = Date.now();
        for (const u of candidateUsernames) {
            try {
                const srsRaw = localStorage.getItem(`enggtv_srs_${u}`);
                if (srsRaw) {
                    const srs = JSON.parse(srsRaw);
                    if (srs && typeof srs === 'object') {
                        Object.values(srs).forEach(card => {
                            if (card && card.nextReview && card.nextReview <= now) {
                                srsDueCount++;
                            }
                        });
                        break;
                    }
                }
            } catch (e) {
                console.warn(`Failed to parse SRS data for ${u}`, e);
            }
        }

        // 9. Streak Days & Activity
        let streakDays = 0;
        if (typeof window.calculateStreak === 'function') {
            try { streakDays = window.calculateStreak(); } catch (e) {}
        }
        if (!streakDays) {
            const streakStorage = localStorage.getItem('enggtv_current_streak') || localStorage.getItem('enggtv_streak');
            if (streakStorage !== null && !isNaN(parseInt(streakStorage, 10))) {
                streakDays = parseInt(streakStorage, 10);
            } else if (recentActivityList.length > 0) {
                const dates = new Set();
                recentActivityList.forEach(a => {
                    if (a && a.timestamp) {
                        const d = new Date(a.timestamp).toISOString().split('T')[0];
                        dates.add(d);
                    }
                });
                streakDays = dates.size;
            }
        }

        // 10. Recent scores
        const recentScores = [];
        if (recentActivityList.length > 0) {
            recentActivityList
                .filter(a => a && (a.score !== undefined || a.correct !== undefined || a.accuracy !== undefined))
                .slice(-10)
                .forEach(a => {
                    const attempted = Number(a.attempted) || 1;
                    const score = a.score !== undefined ? a.score : (a.correct !== undefined ? a.correct : Math.round((Number(a.accuracy) / 100) * attempted));
                    recentScores.push({
                        title: a.title || a.topic || (a.minimalSnapshot && a.minimalSnapshot.topic) || 'Quiz',
                        score: a.accuracy !== undefined ? Math.round(Number(a.accuracy)) : (attempted ? Math.round((score / attempted) * 100) : null),
                        date: a.timestamp ? new Date(a.timestamp).toLocaleDateString() : 'Recent'
                    });
                });
        }

        // 11. Practice Volume Velocity (Questions / day)
        const dayAttemptsMap = {};
        const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
        let questionsInPast7Days = 0;
        let recentActivityTotal = 0;

        recentActivityList.forEach(a => {
            if (a && a.timestamp) {
                const dayStr = new Date(a.timestamp).toISOString().split('T')[0];
                const count = Number(a.attempted) || 1;
                dayAttemptsMap[dayStr] = (dayAttemptsMap[dayStr] || 0) + count;
                recentActivityTotal += count;
                if (a.timestamp >= oneWeekAgo) {
                    questionsInPast7Days += count;
                }
            }
        });

        const activeDaysCount = Object.keys(dayAttemptsMap).length;

        // Estimate study tenure (days since user joined or started)
        let tenureDays = 1;
        const dateJoined = localStorage.getItem('enggtv_date_joined');
        if (dateJoined) {
            const joinedTime = new Date(dateJoined).getTime();
            if (!isNaN(joinedTime) && joinedTime > 0 && joinedTime < Date.now()) {
                tenureDays = Math.max(1, Math.round((Date.now() - joinedTime) / (24 * 60 * 60 * 1000)));
            }
        }

        let dailyVolume = "0.0";
        if (activeDaysCount > 1) {
            // True average questions solved per active study day
            dailyVolume = (recentActivityTotal / activeDaysCount).toFixed(1);
        } else if (questionsInPast7Days > 0) {
            // Solved in the past 7 days averaged over 7
            dailyVolume = (questionsInPast7Days / 7).toFixed(1);
        } else if (streakDays > 1) {
            // Established streak
            dailyVolume = (totalQuestions / streakDays).toFixed(1);
        } else {
            // If streak is 0 or 1, spread total questions across account tenure or a realistic study window (min 14 days)
            const divisor = Math.max(activeDaysCount, tenureDays, 14);
            dailyVolume = (totalQuestions / divisor).toFixed(1);
        }

        // Sanity bound: single-digit or double-digit realistic FE study volume
        const numDaily = parseFloat(dailyVolume);
        if (numDaily > 40 && (streakDays <= 1 || activeDaysCount <= 1)) {
            dailyVolume = Math.min(25, Math.max(4, Math.round(totalQuestions / Math.max(tenureDays, 14)))).toFixed(1);
        } else if (numDaily === 0 && totalQuestions > 0) {
            dailyVolume = "1.0";
        }

        return {
            username,
            discipline,
            streakDays,
            activeDays: Math.max(activeDaysCount, streakDays, 1),
            dailyVolume,
            totalQuestions,
            totalCorrect,
            weaknesses,
            srsDueCount,
            recentScores,
            apiKey: localStorage.getItem(API_KEY_STORAGE) || ''
        };
    }

    /**
     * Calls server API /api/ai-evaluation
     */
    async function requestEvaluation() {
        const metrics = collectEvaluationMetrics();
        const customKey = localStorage.getItem(API_KEY_STORAGE) || '';

        const headers = { 'Content-Type': 'application/json' };
        if (customKey) headers['x-gemini-api-key'] = customKey;

        const res = await fetch('/api/ai-evaluation', {
            method: 'POST',
            headers,
            body: JSON.stringify(metrics)
        });

        if (!res.ok) {
            throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
        }

        return await res.json();
    }

    /**
     * UI Injection: Dashboard Overview Card (Light & Dark Theme adaptive)
     */
    function injectDashboardCard() {
        // Disabled on Settings page per user request. AI Performance Audit Report lives exclusively on the Feedback page.
        return;
        const card = document.createElement('div');
        card.id = 'ai-reality-check-card';
        card.className = 'col-span-1 md:col-span-12 lg:col-span-12 rounded-3xl p-6 sm:p-7 relative overflow-hidden group border border-rose-200 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500/60 transition-all duration-300 shadow-[0_10px_35px_rgba(244,63,94,0.08)] bg-gradient-to-br from-rose-50/90 via-white/95 to-amber-50/80 dark:from-rose-950/20 dark:via-slate-900/60 dark:to-amber-950/20 text-slate-900 dark:text-slate-100';

        card.innerHTML = `
            <div class="absolute -top-24 -right-24 w-64 h-64 bg-gradient-to-br from-rose-500/15 via-orange-500/10 to-transparent dark:from-rose-500/25 dark:via-orange-500/15 blur-[90px] pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
            
            <div class="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div class="flex-1">
                    <div class="flex flex-wrap items-center gap-2 mb-2">
                        <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:bg-rose-500/15 dark:text-rose-400 text-xs font-black uppercase tracking-wider border border-rose-500/20 dark:border-rose-500/30">
                            <span class="material-symbols-outlined text-[15px] animate-pulse">local_fire_department</span>
                            Full Diagnostic Dossier
                        </span>
                        <span class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                            5-Chapter Unvarnished Audit Report
                        </span>
                    </div>

                    <h2 class="text-xl sm:text-2xl font-bold font-display-lg text-slate-900 dark:text-white leading-tight mb-2 flex items-center gap-2">
                        <span>AI Performance Audit Report</span>
                        <span class="text-xs font-mono font-normal px-2.5 py-0.5 rounded-md bg-slate-100 text-rose-700 border border-slate-200 dark:bg-white/10 dark:text-rose-300 dark:border-white/10">Comprehensive Report</span>
                    </h2>

                    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed mb-4">
                        A multi-screen deep dive into your actual exam preparedness: NCEES scaled pass probability, vanity streak forensics, cognitive comfort-zone traps, and a complete 48-hour recovery action plan.
                    </p>

                    <div class="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <div class="flex items-center gap-1.5 bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                            <span class="material-symbols-outlined text-rose-500 dark:text-rose-400 text-[16px]">equalizer</span>
                            <span>Ch 1: Scaled Pass Analysis</span>
                        </div>
                        <div class="flex items-center gap-1.5 bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                            <span class="material-symbols-outlined text-amber-500 dark:text-amber-400 text-[16px]">timelapse</span>
                            <span>Ch 2: Habit Forensics</span>
                        </div>
                        <div class="flex items-center gap-1.5 bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                            <span class="material-symbols-outlined text-cyan-600 dark:text-cyan-400 text-[16px]">visibility_off</span>
                            <span>Ch 3: Blind Spot Matrix</span>
                        </div>
                        <div class="flex items-center gap-1.5 bg-white/80 dark:bg-black/40 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-sm">
                            <span class="material-symbols-outlined text-emerald-600 dark:text-emerald-400 text-[16px]">medical_services</span>
                            <span>Ch 5: 48h Recovery Blueprint</span>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row md:flex-col gap-3 w-full md:w-56 shrink-0">
                    <button id="btn-run-ai-eval" class="w-full bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:brightness-110 text-white font-black py-4 px-5 rounded-2xl shadow-lg shadow-rose-600/30 active:scale-95 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border border-rose-400/40">
                        <span class="material-symbols-outlined text-[18px]">menu_book</span>
                        Open Full Audit Report
                    </button>
                    <button id="btn-ai-eval-settings" class="w-full bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 active:scale-95 transition-all text-[11px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-sm">
                        <span class="material-symbols-outlined text-[15px]">tune</span>
                        Settings / Rollback
                    </button>
                </div>
            </div>
        `;

        overviewPane.insertBefore(card, overviewPane.children[1] || overviewPane.firstChild);

        document.getElementById('btn-run-ai-eval')?.addEventListener('click', openAndRunEvaluation);
        document.getElementById('btn-ai-eval-settings')?.addEventListener('click', openSettingsModal);
    }

    /**
     * Create the Multi-Screen Comprehensive Dossier Modal
     */
    function createModalElements() {
        const existing = document.getElementById('ai-eval-modal');
        if (existing) existing.remove();

        const modal = document.createElement('div');
        modal.id = 'ai-eval-modal';
        modal.className = 'fixed inset-0 z-[11000] hidden flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 dark:bg-black/85 backdrop-blur-md overflow-hidden';

        modal.innerHTML = `
            <div class="relative w-full max-w-5xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-rose-500/40 rounded-3xl shadow-[0_25px_80px_rgba(244,63,94,0.15)] text-slate-900 dark:text-slate-100 flex flex-col h-[94vh] max-h-[94vh] overflow-hidden">
                
                <!-- Ambient Accent Glow -->
                <div class="absolute -top-32 -right-32 w-80 h-80 bg-rose-500/10 dark:bg-rose-500/15 blur-[120px] pointer-events-none"></div>
                <div class="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/10 blur-[120px] pointer-events-none"></div>

                <!-- 1. Sticky Header Bar -->
                <div class="flex items-center justify-between px-5 sm:px-7 py-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/90 dark:bg-slate-900/80 backdrop-blur-md relative z-20">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-2xl bg-rose-500/15 dark:bg-rose-500/20 border border-rose-500/30 dark:border-rose-500/40 flex items-center justify-center text-rose-600 dark:text-rose-400 shrink-0">
                            <span class="material-symbols-outlined text-2xl">policy</span>
                        </div>
                        <div>
                            <div class="flex items-center gap-2 flex-wrap">
                                <h3 class="font-display-lg text-base sm:text-lg font-black text-slate-900 dark:text-white">FE Candidate Diagnostic Audit Dossier</h3>
                                <span id="eval-source-badge" class="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-700 border border-rose-500/30 dark:bg-rose-500/20 dark:text-rose-300">NCEES Diagnostic</span>
                            </div>
                            <p id="eval-candidate-meta" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Comprehensive Performance Reality Check</p>
                        </div>
                    </div>
                    <div class="flex items-center gap-2">
                        <button id="btn-copy-dossier" class="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-all border border-slate-200 dark:border-white/10 cursor-pointer shadow-sm" title="Copy Complete Report as Markdown">
                            <span class="material-symbols-outlined text-[15px]">content_copy</span>
                            <span>Copy Report</span>
                        </button>
                        <button id="btn-close-ai-eval" class="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer" title="Close Dossier">
                            <span class="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>
                </div>

                <!-- 2. Sticky Multi-Screen Chapter Navigation Bar -->
                <div class="flex items-center gap-1 sm:gap-2 px-3 sm:px-6 py-2.5 bg-slate-100/90 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shrink-0 relative z-20 text-xs font-bold">
                    <button class="chapter-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-white bg-rose-600 shadow-md whitespace-nowrap transition-all cursor-pointer" data-chapter="0">
                        <span class="material-symbols-outlined text-[16px]">speed</span>
                        <span>1. Executive Verdict</span>
                    </button>
                    <button class="chapter-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 whitespace-nowrap transition-all cursor-pointer" data-chapter="1">
                        <span class="material-symbols-outlined text-[16px]">timelapse</span>
                        <span>2. Habit Forensics</span>
                    </button>
                    <button class="chapter-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 whitespace-nowrap transition-all cursor-pointer" data-chapter="2">
                        <span class="material-symbols-outlined text-[16px]">visibility_off</span>
                        <span>3. Blind Spots</span>
                    </button>
                    <button class="chapter-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 whitespace-nowrap transition-all cursor-pointer" data-chapter="3">
                        <span class="material-symbols-outlined text-[16px]">fact_check</span>
                        <span>4. Discipline Diagnostic</span>
                    </button>
                    <button class="chapter-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 whitespace-nowrap transition-all cursor-pointer" data-chapter="4">
                        <span class="material-symbols-outlined text-[16px]">medical_services</span>
                        <span>5. Recovery Action Plan</span>
                    </button>
                </div>

                <!-- 3. Loading State -->
                <div id="eval-loading-state" class="flex-1 flex flex-col items-center justify-center gap-4 text-center p-8">
                    <div class="relative w-16 h-16">
                        <div class="absolute inset-0 rounded-full border-4 border-rose-500/20"></div>
                        <div class="absolute inset-0 rounded-full border-4 border-rose-500 border-t-transparent animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="material-symbols-outlined text-rose-500 text-xl animate-pulse">analytics</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-base font-bold text-slate-900 dark:text-white tracking-wide">Compiling 5-Chapter Diagnostic Dossier...</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Cross-referencing item response theory, error distributions, and forgetting curves</p>
                    </div>
                </div>

                <!-- 4. Content Area: 5 Scrollable Chapter Screens -->
                <div id="eval-content-state" class="flex-1 overflow-y-auto p-5 sm:p-7 relative z-10 no-scrollbar hidden">
                    
                    <!-- ============================================== -->
                    <!-- SCREEN 1: EXECUTIVE VERDICT & SCALED SCORING  -->
                    <!-- ============================================== -->
                    <div id="chapter-screen-0" class="chapter-screen flex flex-col gap-6">
                        
                        <!-- Top Banner: Gauge + High-level standing -->
                        <div class="grid grid-cols-1 md:grid-cols-12 gap-5 items-center bg-slate-50 dark:bg-black/40 p-6 rounded-3xl border border-slate-200 dark:border-white/5 shadow-sm">
                            <!-- Left: Pass Probability Ring -->
                            <div class="md:col-span-5 flex items-center gap-5 justify-center md:justify-start">
                                <div class="relative w-28 h-28 shrink-0 flex items-center justify-center">
                                    <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                        <circle id="screen1-radial-track" cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" stroke-width="8"/>
                                        <circle id="screen1-radial-circle" cx="50" cy="50" r="40" fill="none"
                                            stroke="#f43f5e" stroke-width="8"
                                            stroke-linecap="round"
                                            stroke-dasharray="251.3"
                                            stroke-dashoffset="251.3"
                                            style="transition: stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1);"/>
                                    </svg>
                                    <div class="absolute inset-0 flex flex-col items-center justify-center">
                                        <span id="screen1-prob-percent" class="text-3xl font-black font-mono text-slate-900 dark:text-white">0%</span>
                                        <span class="text-[9px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold">Pass Prob</span>
                                    </div>
                                </div>
                                <div class="flex flex-col">
                                    <span class="text-[10px] uppercase font-bold tracking-widest text-slate-500 dark:text-slate-400">Current Standing</span>
                                    <span id="screen1-readiness-status" class="text-lg sm:text-xl font-black text-rose-500 dark:text-rose-400 leading-tight">Analyzing...</span>
                                    <span class="text-xs text-slate-500 dark:text-slate-400 mt-1">Based on 70% NCEES Scaled Curve</span>
                                </div>
                            </div>

                            <!-- Right: Key Summary Stats -->
                            <div class="md:col-span-7 grid grid-cols-3 gap-2.5 text-center border-t md:border-t-0 md:border-l border-slate-200 dark:border-slate-800 pt-4 md:pt-0 md:pl-5">
                                <div class="bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                    <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Questions Solved</span>
                                    <span id="screen1-total-q" class="text-xl font-black text-slate-900 dark:text-slate-100 font-mono">0</span>
                                </div>
                                <div class="bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                    <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Overall Accuracy</span>
                                    <span id="screen1-accuracy" class="text-xl font-black text-amber-600 dark:text-amber-400 font-mono">0%</span>
                                </div>
                                <div class="bg-white dark:bg-white/5 p-3 rounded-2xl border border-slate-200 dark:border-white/5 shadow-sm">
                                    <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Active Streak</span>
                                    <span id="screen1-streak" class="text-xl font-black text-rose-600 dark:text-rose-400 font-mono">0d</span>
                                </div>
                            </div>
                        </div>

                        <!-- The Unvarnished Truth Quote -->
                        <div class="bg-rose-50/80 dark:bg-gradient-to-r dark:from-rose-950/40 dark:via-slate-900/80 dark:to-slate-900/80 p-5 sm:p-6 rounded-2xl border-l-4 border-rose-500 border-t border-r border-b border-rose-200 dark:border-slate-800 shadow-sm">
                            <div class="flex items-center gap-2 mb-2 text-rose-600 dark:text-rose-400 font-bold text-xs uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[18px]">campaign</span>
                                The Unvarnished Truth
                            </div>
                            <p id="screen1-blunt-summary" class="text-sm sm:text-base font-medium text-slate-800 dark:text-slate-200 leading-relaxed italic">
                                -
                            </p>
                        </div>

                        <!-- Deep Dive: How NCEES Actually Scores the Exam -->
                        <div class="bg-slate-50/90 dark:bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 shadow-sm">
                            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[17px]">psychology_alt</span>
                                Forensic Breakdown: NCEES Scaled Scoring vs. Raw Percentages
                            </div>
                            <p id="screen1-scaled-analysis" class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                -
                            </p>
                        </div>

                        <!-- Exam Endurance & Afternoon Collapse Risk -->
                        <div class="bg-slate-50/90 dark:bg-slate-900/70 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 shadow-sm">
                            <div class="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[17px]">battery_alert</span>
                                Cognitive Marathon Risk (5h 20m Fatigue Curve)
                            </div>
                            <p id="screen1-endurance-analysis" class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                -
                            </p>
                        </div>

                    </div>

                    <!-- ============================================== -->
                    <!-- SCREEN 2: HABIT FORENSICS & MEMORY RETENTION   -->
                    <!-- ============================================== -->
                    <div id="chapter-screen-1" class="chapter-screen hidden flex flex-col gap-6">
                        
                        <!-- Top Header Card -->
                        <div class="bg-amber-50/90 dark:bg-gradient-to-r dark:from-amber-950/30 dark:to-slate-900 p-6 rounded-3xl border border-amber-200 dark:border-amber-500/30 flex flex-col gap-2 shadow-sm">
                            <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[18px]">timelapse</span>
                                Chapter 2: Habit Architecture & Retention Forensics
                            </div>
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white">Vanity Streaks vs. True Cognitive Intensity</h4>
                            <p id="screen2-streak-verdict" class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                                -
                            </p>
                        </div>

                        <!-- 2-Column Metrics Grid -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            <!-- Practice Velocity Card -->
                            <div class="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 shadow-sm">
                                <span class="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-amber-500 text-[16px]">speed</span>
                                    Practice Volume Velocity
                                </span>
                                <div class="flex items-baseline gap-2">
                                    <span id="screen2-daily-vol" class="text-3xl font-black text-amber-600 dark:text-amber-400 font-mono">0.0</span>
                                    <span class="text-xs text-slate-500 dark:text-slate-400">Questions / Day</span>
                                </div>
                                <div class="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden mt-1">
                                    <div id="screen2-velocity-bar" class="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-700" style="width: 20%"></div>
                                </div>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                                    Target for guaranteed pass: <strong>15 to 20 questions/day</strong>. Solving under 5 questions/day preserves the habit loop but does not build problem-solving stamina.
                                </p>
                            </div>

                            <!-- Vanity Index & Consistency Rating -->
                            <div class="bg-slate-50 dark:bg-black/40 p-5 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 shadow-sm">
                                <span class="text-xs uppercase font-bold text-slate-500 dark:text-slate-400 block flex items-center gap-1.5">
                                    <span class="material-symbols-outlined text-rose-500 text-[16px]">verified</span>
                                    Vanity Risk Index
                                </span>
                                <div class="flex items-baseline gap-2">
                                    <span id="screen2-vanity-index" class="text-lg font-black text-rose-600 dark:text-rose-400">Moderate</span>
                                </div>
                                <div class="flex items-center gap-2 mt-2">
                                    <span class="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-bold">Consistency Score:</span>
                                    <span id="screen2-consistency-score" class="text-sm font-mono font-bold text-slate-800 dark:text-white bg-slate-200 dark:bg-white/10 px-2 py-0.5 rounded-md">5 / 10</span>
                                </div>
                                <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-normal">
                                    Evaluates whether question submissions are spread out across deep problem-solving sessions or quick guesses.
                                </p>
                            </div>

                        </div>

                        <!-- Ebbinghaus Memory Decay & Spaced Repetition (SRS) Backlog -->
                        <div class="bg-slate-50/90 dark:bg-slate-900/80 p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 shadow-sm">
                            <div class="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[17px]">psychology</span>
                                The Ebbinghaus Forgetting Curve & Spaced Repetition Decay
                            </div>
                            <p id="screen2-srs-analysis" class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                                -
                            </p>
                            <div class="flex items-center gap-3 p-3.5 bg-white dark:bg-black/40 rounded-xl border border-slate-200 dark:border-white/5 mt-2 shadow-sm">
                                <span class="material-symbols-outlined text-rose-500 text-2xl">event_busy</span>
                                <div class="text-xs">
                                    <span class="font-bold text-slate-900 dark:text-white block">Formula Decay Alert</span>
                                    <span id="screen2-srs-due-text" class="text-slate-600 dark:text-slate-400">0 Spaced Repetition items currently overdue for active recall.</span>
                                </div>
                            </div>
                        </div>

                    </div>

                    <!-- ============================================== -->
                    <!-- SCREEN 3: COGNITIVE BLIND SPOTS & AVOIDANCE    -->
                    <!-- ============================================== -->
                    <div id="chapter-screen-2" class="chapter-screen hidden flex flex-col gap-6">
                        
                        <!-- Top Header Card -->
                        <div class="bg-cyan-50/90 dark:bg-gradient-to-r dark:from-cyan-950/30 dark:to-slate-900 p-6 rounded-3xl border border-cyan-200 dark:border-cyan-500/30 flex flex-col gap-2 shadow-sm">
                            <div class="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[18px]">visibility_off</span>
                                Chapter 3: Cognitive Blind Spots & Comfort-Zone Avoidance
                            </div>
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white">The Illusion of Competence Trap</h4>
                            <p id="screen3-psychological-analysis" class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                                -
                            </p>
                        </div>

                        <!-- Visual Side-by-Side: Comfort Zone vs. Catastrophic Leak -->
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                            
                            <!-- Over-Practiced Comfort Zone -->
                            <div class="bg-emerald-50/80 dark:bg-emerald-950/20 p-5 rounded-2xl border border-emerald-200 dark:border-emerald-500/30 flex flex-col gap-2.5 shadow-sm">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs uppercase font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-[16px]">check_circle</span>
                                        Your Comfort Zone (Over-practiced)
                                    </span>
                                    <span id="screen3-comfort-error" class="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-2 py-0.5 rounded">0% Error</span>
                                </div>
                                <h5 id="screen3-comfort-topic" class="text-base font-bold text-slate-900 dark:text-white">Introductory Concepts</h5>
                                <p id="screen3-comfort-desc" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    You spend disproportionate time practicing chapters where you feel confident. This produces positive feelings but zero marginal score increase.
                                </p>
                            </div>

                            <!-- Catastrophic Avoided Weakness -->
                            <div class="bg-rose-50/80 dark:bg-rose-950/20 p-5 rounded-2xl border border-rose-200 dark:border-rose-500/30 flex flex-col gap-2.5 shadow-sm">
                                <div class="flex items-center justify-between">
                                    <span class="text-xs uppercase font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
                                        <span class="material-symbols-outlined text-[16px]">dangerous</span>
                                        Your Fatal Blind Spot (Avoided)
                                    </span>
                                    <span id="screen3-avoided-error" class="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-500/10 px-2 py-0.5 rounded">0% Error</span>
                                </div>
                                <h5 id="screen3-avoided-topic" class="text-base font-bold text-slate-900 dark:text-white">Core Engineering</h5>
                                <p id="screen3-avoided-desc" class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                    High-error rate topic that you are subconsciously avoiding. If 4 to 6 questions on this appear on exam morning, failure is guaranteed.
                                </p>
                            </div>

                        </div>

                        <!-- Fatal Vulnerabilities Detailed Table -->
                        <div class="flex flex-col gap-3">
                            <span class="text-xs uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-[17px]">warning</span>
                                Priority Risk Matrix: High-Error Chapters
                            </span>
                            <div id="screen3-vulnerabilities-table" class="flex flex-col gap-2.5">
                                <!-- Injected dynamically -->
                            </div>
                        </div>

                    </div>

                    <!-- ============================================== -->
                    <!-- SCREEN 4: DISCIPLINE DIAGNOSTIC & SYLLABUS     -->
                    <!-- ============================================== -->
                    <div id="chapter-screen-3" class="chapter-screen hidden flex flex-col gap-6">
                        
                        <!-- Top Header Card -->
                        <div class="bg-purple-50/90 dark:bg-gradient-to-r dark:from-purple-950/30 dark:to-slate-900 p-6 rounded-3xl border border-purple-200 dark:border-purple-500/30 flex flex-col gap-2 shadow-sm">
                            <div class="flex items-center gap-2 text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[18px]">fact_check</span>
                                Chapter 4: NCEES Official Syllabus Alignment
                            </div>
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white">Discipline Knowledge Area Diagnostics</h4>
                            <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                                The FE Exam is divided into Morning Breadth (common engineering math, ethics, economics, statics) and Afternoon Depth (discipline-specific systems). Here is how your recorded accuracy compares across key knowledge areas.
                            </p>
                        </div>

                        <!-- Knowledge Area Readiness Table -->
                        <div class="bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-sm">
                            <table class="w-full text-left text-xs">
                                <thead>
                                    <tr class="bg-slate-100 dark:bg-black/40 border-b border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                                        <th class="py-3 px-4">Knowledge Area</th>
                                        <th class="py-3 px-3">Standing</th>
                                        <th class="py-3 px-3">Error Rate</th>
                                        <th class="py-3 px-3">Volume</th>
                                        <th class="py-3 px-4">Prescription</th>
                                    </tr>
                                </thead>
                                <tbody id="screen4-readiness-tbody" class="divide-y divide-slate-100 dark:divide-white/5 text-slate-800 dark:text-slate-200">
                                    <!-- Injected dynamically -->
                                </tbody>
                            </table>
                        </div>

                    </div>

                    <!-- ============================================== -->
                    <!-- SCREEN 5: STRATEGIC RECOVERY ACTION PLAN       -->
                    <!-- ============================================== -->
                    <div id="chapter-screen-4" class="chapter-screen hidden flex flex-col gap-6">
                        
                        <!-- Top Header Card -->
                        <div class="bg-emerald-50/90 dark:bg-gradient-to-r dark:from-emerald-950/30 dark:to-slate-900 p-6 rounded-3xl border border-emerald-200 dark:border-emerald-500/30 flex flex-col gap-2 shadow-sm">
                            <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[18px]">medical_services</span>
                                Chapter 5: Strategic Recovery Blueprint
                            </div>
                            <h4 class="text-lg font-bold text-slate-900 dark:text-white">48-Hour Emergency Triage & 14-Day Recovery Plan</h4>
                            <p class="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed mt-1">
                                Stop browsing randomly. Execute this structured emergency protocol to plug your fatal leaks before scheduling full exam simulations.
                            </p>
                        </div>

                        <!-- Emergency 48-Hour Protocol Cards -->
                        <div class="flex flex-col gap-3">
                            <span class="text-xs uppercase font-bold tracking-wider text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-[16px]">bolt</span>
                                Immediate 48-Hour Emergency Triage
                            </span>
                            <div id="screen5-emergency-steps" class="flex flex-col gap-3">
                                <!-- Injected dynamically -->
                            </div>
                        </div>

                        <!-- 14-Day Phase Roadmap -->
                        <div class="flex flex-col gap-3 mt-2">
                            <span class="text-xs uppercase font-bold tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                                <span class="material-symbols-outlined text-[16px]">calendar_month</span>
                                14-Day Exam Readiness Phase Roadmap
                            </span>
                            <div id="screen5-twoweek-roadmap" class="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <!-- Injected dynamically -->
                            </div>
                        </div>

                        <!-- FE Reference Handbook Speed Tactics -->
                        <div class="bg-slate-50/90 dark:bg-slate-900/80 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-white/10 flex flex-col gap-3 mt-2 shadow-sm">
                            <div class="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
                                <span class="material-symbols-outlined text-[17px]">menu_book</span>
                                Reference Handbook Exam-Day Speed Rules
                            </div>
                            <div id="screen5-handbook-rules" class="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-700 dark:text-slate-300">
                                <!-- Injected dynamically -->
                            </div>
                        </div>

                    </div>

                </div>

                <!-- 5. Sticky Footer: Pagination & Actions -->
                <div class="flex items-center justify-between px-5 sm:px-7 py-3.5 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50/95 dark:bg-slate-900/90 backdrop-blur-md relative z-20">
                    <div class="flex items-center gap-2">
                        <button id="btn-prev-chapter" class="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-200 dark:border-white/10 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm">
                            <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                            <span>Previous Chapter</span>
                        </button>
                        <span id="chapter-step-indicator" class="text-xs font-mono text-slate-500 dark:text-slate-400 px-2 hidden sm:inline">Chapter 1 of 5</span>
                    </div>

                    <div class="flex items-center gap-2.5">
                        <button id="btn-next-chapter" class="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-white/10 dark:hover:bg-white/20 text-slate-800 dark:text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-slate-300 dark:border-white/15 shadow-sm">
                            <span>Next Chapter</span>
                            <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                        </button>
                        <button id="btn-launch-priority-drill" class="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:brightness-110 text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer shadow-lg shadow-rose-600/20">
                            <span class="material-symbols-outlined text-[16px]">play_arrow</span>
                            <span>Start Priority Drill</span>
                        </button>
                    </div>
                </div>

            </div>
        `;

        document.body.appendChild(modal);

        // Bind Events
        document.getElementById('btn-close-ai-eval')?.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
        document.getElementById('btn-prev-chapter')?.addEventListener('click', prevChapter);
        document.getElementById('btn-next-chapter')?.addEventListener('click', nextChapter);
        document.getElementById('btn-copy-dossier')?.addEventListener('click', copyCompleteDossier);
        document.getElementById('btn-launch-priority-drill')?.addEventListener('click', launchPriorityDrill);

        // Bind Chapter Nav Buttons
        modal.querySelectorAll('.chapter-nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const target = parseInt(e.currentTarget.getAttribute('data-chapter'), 10);
                if (!isNaN(target)) switchChapter(target);
            });
        });
    }

    /**
     * Switch between the 5 screens
     */
    function switchChapter(idx) {
        if (idx < 0) idx = 0;
        if (idx >= TOTAL_CHAPTERS) idx = TOTAL_CHAPTERS - 1;
        currentChapterIndex = idx;

        // Toggle screen visibility
        for (let i = 0; i < TOTAL_CHAPTERS; i++) {
            const screen = document.getElementById(`chapter-screen-${i}`);
            if (screen) {
                if (i === idx) {
                    screen.classList.remove('hidden');
                } else {
                    screen.classList.add('hidden');
                }
            }
        }

        // Update nav buttons active style
        const navBtns = document.querySelectorAll('.chapter-nav-btn');
        navBtns.forEach((btn, i) => {
            if (i === idx) {
                btn.className = 'chapter-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-white bg-rose-600 shadow-md whitespace-nowrap transition-all cursor-pointer';
            } else {
                btn.className = 'chapter-nav-btn flex items-center gap-1.5 px-3 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-white/5 whitespace-nowrap transition-all cursor-pointer';
            }
        });

        // Update indicator & prev/next buttons
        const indicator = document.getElementById('chapter-step-indicator');
        if (indicator) indicator.textContent = `Chapter ${idx + 1} of ${TOTAL_CHAPTERS}`;

        const prevBtn = document.getElementById('btn-prev-chapter');
        if (prevBtn) prevBtn.disabled = idx === 0;

        const nextBtn = document.getElementById('btn-next-chapter');
        if (nextBtn) {
            if (idx === TOTAL_CHAPTERS - 1) {
                nextBtn.innerHTML = `<span>Back to Start</span><span class="material-symbols-outlined text-[16px]">restart_alt</span>`;
            } else {
                nextBtn.innerHTML = `<span>Next Chapter</span><span class="material-symbols-outlined text-[16px]">chevron_right</span>`;
            }
        }

        // Scroll content container to top
        const contentContainer = document.getElementById('eval-content-state');
        if (contentContainer) contentContainer.scrollTop = 0;
    }

    function prevChapter() {
        switchChapter(currentChapterIndex - 1);
    }

    function nextChapter() {
        if (currentChapterIndex >= TOTAL_CHAPTERS - 1) {
            switchChapter(0);
        } else {
            switchChapter(currentChapterIndex + 1);
        }
    }

    /**
     * Settings / Rollback Modal (Light & Dark Theme adaptive)
     */
    function openSettingsModal() {
        const existing = document.getElementById('ai-eval-settings-modal');
        if (existing) existing.remove();

        const currentKey = localStorage.getItem(API_KEY_STORAGE) || '';
        const enabled = isFeatureEnabled();

        const settingsModal = document.createElement('div');
        settingsModal.id = 'ai-eval-settings-modal';
        settingsModal.className = 'fixed inset-0 z-[12000] flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/80 backdrop-blur-md';

        settingsModal.innerHTML = `
            <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-3xl p-6 sm:p-7 shadow-2xl text-slate-900 dark:text-slate-100 flex flex-col gap-5">
                <div class="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                    <div class="flex items-center gap-2.5">
                        <span class="material-symbols-outlined text-rose-500">tune</span>
                        <h3 class="font-bold text-base text-slate-900 dark:text-white">AI Evaluation Settings & Rollback</h3>
                    </div>
                    <button onclick="document.getElementById('ai-eval-settings-modal').remove()" class="text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <div class="flex flex-col gap-4 text-xs text-slate-600 dark:text-slate-300">
                    <div class="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-black/40 rounded-2xl border border-slate-200 dark:border-white/5">
                        <div>
                            <span class="font-bold text-slate-900 dark:text-white text-sm block">Experimental Feature State</span>
                            <span class="text-slate-500 dark:text-slate-400 text-[11px]">Turn off to completely hide this experimental feature without modifying codebase.</span>
                        </div>
                        <label class="relative inline-flex items-center cursor-pointer ml-3">
                            <input type="checkbox" id="ai-toggle-feature" class="sr-only peer" ${enabled ? 'checked' : ''}>
                            <div class="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="font-bold text-slate-800 dark:text-white flex items-center justify-between">
                            <span>Google Gemini API Key (Optional)</span>
                            <span class="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Stored securely in .env / browser</span>
                        </label>
                        <input type="password" id="ai-custom-key-input" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-rose-500 outline-none" placeholder="AIzaSy... (leave blank to use built-in engine)" value="${currentKey}">
                        <p class="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                            If no API key is provided, the application uses its built-in rule-based diagnostic engine. Adding a key enables deep Gemini 3.5 Flash Generative AI analysis.
                        </p>
                    </div>
                </div>

                <div class="flex justify-end gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <button onclick="document.getElementById('ai-eval-settings-modal').remove()" class="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors cursor-pointer">
                        Cancel
                    </button>
                    <button id="btn-save-ai-settings" class="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white transition-all cursor-pointer">
                        Save Preferences
                    </button>
                </div>
            </div>
        `;

        document.body.appendChild(settingsModal);

        document.getElementById('btn-save-ai-settings')?.addEventListener('click', () => {
            const toggle = document.getElementById('ai-toggle-feature');
            const keyInput = document.getElementById('ai-custom-key-input');

            if (toggle) localStorage.setItem(FLAG_KEY, toggle.checked ? 'true' : 'false');
            if (keyInput) localStorage.setItem(API_KEY_STORAGE, keyInput.value.trim());

            settingsModal.remove();
            location.reload();
        });
    }

    function openAndRunEvaluation() {
        createModalElements();
        const modal = document.getElementById('ai-eval-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
        runEvaluationFlow();
    }

    function closeModal() {
        const modal = document.getElementById('ai-eval-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
        }
    }

    async function runEvaluationFlow() {
        const loading = document.getElementById('eval-loading-state');
        const content = document.getElementById('eval-content-state');

        if (loading) loading.classList.remove('hidden');
        if (content) content.classList.add('hidden');

        try {
            const result = await requestEvaluation();
            lastEvaluationResult = result;
            renderEvaluationResult(result);
            switchChapter(0);
        } catch (err) {
            console.error('Failed to run AI evaluation', err);
            if (loading) {
                loading.innerHTML = `
                    <div class="text-rose-500 flex flex-col items-center gap-2">
                        <span class="material-symbols-outlined text-3xl">error</span>
                        <p class="font-bold text-sm text-slate-900 dark:text-white">Evaluation Encountered an Error</p>
                        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm">${err.message}</p>
                        <button onclick="window.closeAIEvalModal && window.closeAIEvalModal()" class="mt-4 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-xs font-bold text-slate-800 dark:text-white cursor-pointer">Close</button>
                    </div>
                `;
            }
        }
    }

    /**
     * Render data across all 5 chapter screens
     */
    function renderEvaluationResult(res) {
        const loading = document.getElementById('eval-loading-state');
        const content = document.getElementById('eval-content-state');

        if (loading) loading.classList.add('hidden');
        if (content) content.classList.remove('hidden');

        const chapters = res.chapters || {};
        const ch1 = chapters.executiveVerdict || {};
        const ch2 = chapters.habitAudit || {};
        const ch3 = chapters.blindSpotAnalysis || {};
        const ch4 = chapters.disciplineDiagnostic || {};
        const ch5 = chapters.strategicPrescription || {};

        // Source badge
        const sourceBadge = document.getElementById('eval-source-badge');
        if (sourceBadge) {
            sourceBadge.textContent = res.source?.includes('gemini') ? 'Gemini 3.5 Flash' : 'Diagnostic Engine';
            sourceBadge.className = res.source?.includes('gemini') 
                ? 'text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 border border-emerald-500/20 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30'
                : 'text-[9px] uppercase font-mono px-2.5 py-0.5 rounded-full bg-rose-500/10 text-rose-700 border border-rose-500/20 dark:bg-rose-500/20 dark:text-rose-300 dark:border-rose-500/30';
        }

        const candidateMeta = document.getElementById('eval-candidate-meta');
        if (candidateMeta) {
            candidateMeta.textContent = `${res.discipline || 'Mechanical'} Candidate • Comprehensive 5-Chapter Diagnostic Dossier`;
        }

        // ================= SCREEN 1: EXECUTIVE VERDICT =================
        const prob = Math.min(100, Math.max(0, Number(ch1.passProbability || res.passProbability) || 0));
        const circle = document.getElementById('screen1-radial-circle');
        const track = document.getElementById('screen1-radial-track');
        const textPercent = document.getElementById('screen1-prob-percent');
        const statusText = document.getElementById('screen1-readiness-status');

        if (track) {
            track.setAttribute('stroke', isDarkMode() ? '#334155' : '#e2e8f0');
        }

        if (circle) {
            const circumference = 251.3;
            const offset = circumference - (prob / 100) * circumference;
            circle.style.strokeDashoffset = offset;
            if (prob >= 75) circle.style.stroke = '#10b981';
            else if (prob >= 60) circle.style.stroke = '#f59e0b';
            else circle.style.stroke = '#f43f5e';
        }

        if (textPercent) textPercent.textContent = `${prob}%`;
        if (statusText) {
            statusText.textContent = ch1.readinessStatus || res.readinessStatus || 'Borderline Pass';
            if (prob >= 75) statusText.className = 'text-lg sm:text-xl font-black text-emerald-600 dark:text-emerald-400 leading-tight';
            else if (prob >= 60) statusText.className = 'text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400 leading-tight';
            else statusText.className = 'text-lg sm:text-xl font-black text-rose-600 dark:text-rose-400 leading-tight';
        }

        const screen1TotalQ = document.getElementById('screen1-total-q');
        if (screen1TotalQ) screen1TotalQ.textContent = `${ch1.totalQuestions ?? res.totalQuestions ?? 0}`;

        const screen1Accuracy = document.getElementById('screen1-accuracy');
        if (screen1Accuracy) screen1Accuracy.textContent = `${ch1.accuracy ?? 0}%`;

        const screen1Streak = document.getElementById('screen1-streak');
        if (screen1Streak) screen1Streak.textContent = `${ch2.streakDays ?? res.streakDays ?? 0}d`;

        const bluntSummary = document.getElementById('screen1-blunt-summary');
        if (bluntSummary) bluntSummary.textContent = `“${ch1.bluntSummary || res.bluntSummary || 'Continue disciplined problem solving.'}”`;

        const scaledAnalysis = document.getElementById('screen1-scaled-analysis');
        if (scaledAnalysis) scaledAnalysis.textContent = ch1.scaledScoreAnalysis || 'NCEES evaluates candidates on scaled scoring across 110 problems.';

        const enduranceAnalysis = document.getElementById('screen1-endurance-analysis');
        if (enduranceAnalysis) enduranceAnalysis.textContent = ch1.examEnduranceAnalysis || 'Cognitive fatigue over 5 hours requires timed simulation.';

        // ================= SCREEN 2: HABIT FORENSICS =================
        const streakVerdict = document.getElementById('screen2-streak-verdict');
        if (streakVerdict) streakVerdict.textContent = ch2.streakVerdict || res.streakVerdict || 'No streak data.';

        const dailyVol = document.getElementById('screen2-daily-vol');
        if (dailyVol) dailyVol.textContent = `${ch2.dailyVolume || '0.0'}`;

        const velocityBar = document.getElementById('screen2-velocity-bar');
        if (velocityBar) {
            const volNum = parseFloat(ch2.dailyVolume) || 0;
            const pct = Math.min(100, Math.round((volNum / 20) * 100));
            velocityBar.style.width = `${Math.max(10, pct)}%`;
        }

        const vanityIndex = document.getElementById('screen2-vanity-index');
        if (vanityIndex) vanityIndex.textContent = ch2.vanityIndex || 'Moderate Risk';

        const consistencyScore = document.getElementById('screen2-consistency-score');
        if (consistencyScore) consistencyScore.textContent = `${ch2.consistencyScore || 5} / 10`;

        const srsAnalysis = document.getElementById('screen2-srs-analysis');
        if (srsAnalysis) srsAnalysis.textContent = ch2.srsBacklogAnalysis || 'Keep formula deck fresh.';

        const srsDueText = document.getElementById('screen2-srs-due-text');
        if (srsDueText) srsDueText.textContent = `${ch2.srsDueCount || 0} Spaced Repetition items currently overdue for active recall.`;

        // ================= SCREEN 3: BLIND SPOTS =================
        const psychAnalysis = document.getElementById('screen3-psychological-analysis');
        if (psychAnalysis) psychAnalysis.textContent = ch3.psychologicalAnalysis || res.comfortZoneAudit || 'Avoidance behavior detected.';

        const comfortTopic = document.getElementById('screen3-comfort-topic');
        if (comfortTopic) comfortTopic.textContent = ch3.comfortTopic || 'Familiar Concepts';

        const comfortError = document.getElementById('screen3-comfort-error');
        if (comfortError) comfortError.textContent = `${ch3.comfortErrorRate || '0%'} Error (${ch3.comfortQuestions || 0} Qs)`;

        const avoidedTopic = document.getElementById('screen3-avoided-topic');
        if (avoidedTopic) avoidedTopic.textContent = ch3.avoidedTopic || 'Complex System Chapters';

        const avoidedError = document.getElementById('screen3-avoided-error');
        if (avoidedError) avoidedError.textContent = `${ch3.avoidedErrorRate || '75%'} Error (${ch3.avoidedQuestions || 0} Qs)`;

        // Vulnerabilities Table
        const vulnTable = document.getElementById('screen3-vulnerabilities-table');
        if (vulnTable) {
            vulnTable.innerHTML = '';
            const list = ch3.topVulnerabilities || res.topVulnerabilities || [];
            if (list.length === 0) {
                vulnTable.innerHTML = `<p class="text-xs text-slate-500 dark:text-slate-400 italic">No catastrophic weaknesses identified yet.</p>`;
            } else {
                list.forEach(v => {
                    const row = document.createElement('div');
                    row.className = 'p-4 rounded-2xl bg-white dark:bg-black/40 border border-slate-200 dark:border-rose-500/20 text-xs flex flex-col gap-2 shadow-sm';
                    row.innerHTML = `
                        <div class="flex items-center justify-between flex-wrap gap-2">
                            <div class="flex items-center gap-2">
                                <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                                <span class="font-bold text-slate-900 dark:text-white text-sm">${v.topic}</span>
                                <span class="text-[11px] text-slate-500 dark:text-slate-400">(${v.subject})</span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-mono font-bold text-rose-600 dark:text-rose-400 text-sm">${v.errorRate} Error</span>
                                <span class="text-[10px] uppercase font-bold text-rose-700 bg-rose-100 border border-rose-200 dark:text-rose-300 dark:bg-rose-500/15 dark:border-rose-500/25 px-2 py-0.5 rounded">${v.fixPriority || 'URGENT'}</span>
                            </div>
                        </div>
                        <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">${v.consequenceOnExam || v.verdict}</p>
                    `;
                    vulnTable.appendChild(row);
                });
            }
        }

        // ================= SCREEN 4: DISCIPLINE DIAGNOSTIC =================
        const readinessTbody = document.getElementById('screen4-readiness-tbody');
        if (readinessTbody) {
            readinessTbody.innerHTML = '';
            const rows = ch4.topicReadinessTable || [];
            if (rows.length === 0) {
                readinessTbody.innerHTML = `<tr><td colspan="5" class="py-4 text-center text-slate-500 dark:text-slate-400">Complete more topics to populate syllabus diagnostic table.</td></tr>`;
            } else {
                rows.forEach(r => {
                    const tr = document.createElement('tr');
                    tr.className = 'hover:bg-slate-50 dark:hover:bg-white/5 transition-colors';
                    tr.innerHTML = `
                        <td class="py-3 px-4 font-bold text-slate-900 dark:text-white">${r.topic}</td>
                        <td class="py-3 px-3"><span class="px-2 py-0.5 rounded text-[10px] font-bold border ${r.statusColor}">${r.status}</span></td>
                        <td class="py-3 px-3 font-mono font-bold">${r.errorRate}</td>
                        <td class="py-3 px-3 text-slate-500 dark:text-slate-400">${r.attempts}</td>
                        <td class="py-3 px-4 text-slate-600 dark:text-slate-300">${r.recommendation}</td>
                    `;
                    readinessTbody.appendChild(tr);
                });
            }
        }

        // ================= SCREEN 5: STRATEGIC PRESCRIPTION =================
        const emergencySteps = document.getElementById('screen5-emergency-steps');
        if (emergencySteps) {
            emergencySteps.innerHTML = '';
            const steps = ch5.emergency48h || [];
            steps.forEach(s => {
                const item = document.createElement('div');
                item.className = 'p-4 rounded-2xl bg-white dark:bg-black/40 border border-emerald-200 dark:border-emerald-500/25 flex flex-col gap-2 shadow-sm';
                item.innerHTML = `
                    <div class="flex items-center justify-between flex-wrap gap-2">
                        <div class="flex items-center gap-2">
                            <span class="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 font-mono text-xs font-bold flex items-center justify-center border border-emerald-300 dark:border-emerald-500/40">${s.stepNumber}</span>
                            <h5 class="font-bold text-slate-900 dark:text-white text-sm">${s.title}</h5>
                        </div>
                        <span class="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 dark:text-emerald-400 dark:bg-emerald-500/10 dark:border-emerald-500/20 px-2 py-0.5 rounded">${s.duration}</span>
                    </div>
                    <p class="text-xs font-semibold text-emerald-700 dark:text-emerald-300">${s.target}</p>
                    <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">${s.details}</p>
                `;
                emergencySteps.appendChild(item);
            });
        }

        const roadmap = document.getElementById('screen5-twoweek-roadmap');
        if (roadmap) {
            roadmap.innerHTML = '';
            const phases = ch5.twoWeekBlueprint || [];
            phases.forEach(p => {
                const pCard = document.createElement('div');
                pCard.className = 'p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-white/10 flex flex-col gap-2 text-xs shadow-sm';
                pCard.innerHTML = `
                    <span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400">${p.phase}</span>
                    <h6 class="font-bold text-slate-900 dark:text-white text-sm">${p.title}</h6>
                    <p class="text-slate-600 dark:text-slate-300 leading-relaxed">${p.focus}</p>
                    <div class="pt-2 border-t border-slate-200 dark:border-white/5 mt-auto">
                        <span class="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">Deliverable:</span>
                        <span class="text-slate-800 dark:text-slate-200 font-medium">${p.goal}</span>
                    </div>
                `;
                roadmap.appendChild(pCard);
            });
        }

        const handbookRules = document.getElementById('screen5-handbook-rules');
        if (handbookRules) {
            handbookRules.innerHTML = '';
            const rules = ch5.handbookTactics || [];
            rules.forEach(r => {
                const rCard = document.createElement('div');
                rCard.className = 'p-3.5 rounded-xl bg-white dark:bg-black/40 border border-slate-200 dark:border-white/5 flex flex-col gap-1.5 shadow-sm';
                rCard.innerHTML = `
                    <h6 class="font-bold text-cyan-700 dark:text-cyan-300 text-xs">${r.rule}</h6>
                    <p class="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">${r.explanation}</p>
                `;
                handbookRules.appendChild(rCard);
            });
        }
    }

    /**
     * Copies complete 5-chapter dossier as formatted markdown
     */
    function copyCompleteDossier() {
        if (!lastEvaluationResult) return;
        const res = lastEvaluationResult;
        const chapters = res.chapters || {};
        const ch1 = chapters.executiveVerdict || {};
        const ch2 = chapters.habitAudit || {};
        const ch3 = chapters.blindSpotAnalysis || {};
        const ch5 = chapters.strategicPrescription || {};

        const md = [
            `# FE CANDIDATE DIAGNOSTIC AUDIT DOSSIER`,
            `*Discipline:* ${res.discipline || 'Mechanical'} | *Status:* ${ch1.readinessStatus} | *Pass Probability:* ${ch1.passProbability}%`,
            ``,
            `## CHAPTER 1: EXECUTIVE VERDICT`,
            `> "${ch1.bluntSummary}"`,
            ``,
            `**Scaled Score Trajectory:**`,
            `${ch1.scaledScoreAnalysis}`,
            ``,
            `**Cognitive Marathon Risk:**`,
            `${ch1.examEnduranceAnalysis}`,
            ``,
            `## CHAPTER 2: HABIT FORENSICS`,
            `- **Active Streak:** ${ch2.streakDays} days`,
            `- **Practice Velocity:** ${ch2.dailyVolume} questions / day`,
            `- **Vanity Risk Index:** ${ch2.vanityIndex}`,
            `- **Verdict:** ${ch2.streakVerdict}`,
            `- **Spaced Repetition Decay:** ${ch2.srsBacklogAnalysis}`,
            ``,
            `## CHAPTER 3: COGNITIVE BLIND SPOTS & AVOIDANCE`,
            `**The Illusion of Competence:**`,
            `${ch3.psychologicalAnalysis}`,
            ``,
            `**Comfort Zone (Over-practiced):** ${ch3.comfortTopic} (${ch3.comfortErrorRate} error)`,
            `**Fatal Blind Spot (Avoided):** ${ch3.avoidedTopic} (${ch3.avoidedErrorRate} error)`,
            ``,
            `## CHAPTER 5: 48-HOUR EMERGENCY ACTION PLAN`,
            ...(ch5.emergency48h || []).map(s => `${s.stepNumber}. **${s.title}** (${s.duration}): ${s.target} - ${s.details}`),
            ``,
            `---`,
            `Generated by ENGG.tv AI Diagnostic Engine`
        ].join('\n');

        navigator.clipboard.writeText(md).then(() => {
            const btn = document.getElementById('btn-copy-dossier');
            if (btn) {
                const orig = btn.innerHTML;
                btn.innerHTML = `<span class="material-symbols-outlined text-[15px] text-emerald-500">check</span><span>Copied!</span>`;
                setTimeout(() => { btn.innerHTML = orig; }, 2500);
            }
        }).catch(() => {
            alert('Full dossier copied to clipboard!');
        });
    }

    /**
     * Start Priority Drill Handler (Never blank screen)
     */
    function launchPriorityDrill() {
        closeModal();

        // 1. Try launching the Focus Zone weakness drill if available
        if (typeof window.startFocusQuiz === 'function' && window._weakTopicEntries && window._weakTopicEntries.length > 0) {
            try {
                window.startFocusQuiz();
                return;
            } catch (e) {
                console.warn('startFocusQuiz failed, falling back', e);
            }
        }

        // 2. Try starting a quiz on the top vulnerability directly
        const state = window.state || {};
        const ch3 = lastEvaluationResult?.chapters?.blindSpotAnalysis;
        const topVuln = ch3?.topVulnerabilities?.[0] || lastEvaluationResult?.topVulnerabilities?.[0];

        if (topVuln && typeof window.startQuiz === 'function' && Array.isArray(state.subjects) && state.subjects.length > 0) {
            const targetSubject = state.subjects.find(s => 
                s.id === topVuln.subject || 
                (s.name && s.name.toLowerCase().includes((topVuln.subject || '').toLowerCase())) ||
                (s.topics && s.topics.some(t => t.toLowerCase() === (topVuln.topic || '').toLowerCase()))
            );

            if (targetSubject) {
                try {
                    window.startQuiz(targetSubject.id, topVuln.topic);
                    if (typeof window.showToast === 'function') {
                        window.showToast('Priority Drill Launched', `Focusing on ${topVuln.topic} (${targetSubject.name})`, 'psychology');
                    }
                    return;
                } catch (e) {
                    console.warn('Direct startQuiz failed, falling back to assessment center', e);
                }
            }
        }

        // 3. Robust fallback: Navigate to Assessment Center ('study')
        if (typeof window.navigateTo === 'function') {
            window.navigateTo('study');
            if (typeof window.switchTestTab === 'function') {
                window.switchTestTab('quiz');
            }
            if (typeof window.showToast === 'function') {
                const topicName = topVuln?.topic ? ` Target: ${topVuln.topic}` : '';
                window.showToast('Assessment Center', `Select a practice quiz to drill.${topicName}`, 'quiz');
            }
        }
    }

    // Global Escape key listener
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            const modal = document.getElementById('ai-eval-modal');
            if (modal && !modal.classList.contains('hidden')) {
                closeModal();
            }
        }
    });

    // Expose helpers for external invocation
    window.closeAIEvalModal = closeModal;
    window.openAIEvalModal = openAndRunEvaluation;

    // Initialization
    function init() {
        injectDashboardCard();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
