/**
 * ENGG.tv - Dashboard Segmented Sub-Navigation Module
 * Divides the Home view into 4 focused panes:
 * 1. Overview (Launchpad, Mentoring, Readiness, Quests)
 * 2. Analytics (Diagnostic Performance Report)
 * 3. History (Study Calendar, Recent Activity)
 * 4. Alumni & Theory (Engg.tv Alumni Spotlight, Daily Mindset Quotes, FE Theorems)
 */

(function() {
    const TABS = ['overview', 'analytics', 'history'];
    let currentTab = 'overview';

    function switchDashboardTab(tabId, persist = true) {
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
        if (tabId === 'history') {
            // Trigger calendar day re-render if available
            if (typeof window.renderStudyCalendar === 'function') {
                window.renderStudyCalendar();
            }
        } else if (tabId === 'analytics') {
            if (typeof window.updateDashboardStats === 'function') {
                window.updateDashboardStats();
            }
            if (typeof window.renderDiagnosticReport === 'function') {
                window.renderDiagnosticReport();
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
