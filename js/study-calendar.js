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
