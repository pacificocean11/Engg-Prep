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
        const pOverview = document.getElementById('dash-pane-overview');
        const pHistory = document.getElementById('dash-pane-history');
        if (pOverview) { pOverview.classList.remove('hidden'); pOverview.style.display = 'grid'; }
        if (pHistory) { pHistory.classList.remove('hidden'); pHistory.style.display = 'grid'; }
        if (typeof window.renderStudyCalendar === 'function') window.renderStudyCalendar();
        if (typeof renderRecentActivity === 'function') renderRecentActivity();
    }

    window.switchDashboardTab = switchDashboardTab;
    function init() {
        switchDashboardTab('overview', false);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 50);
    }
})();
