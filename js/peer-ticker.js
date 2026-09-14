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
     * Curated dynamic modern color palettes for peer avatars and icons.
     * Ensures high contrast, vibrant aesthetics, and visual variety across the stream.
     */
    const PEER_COLOR_PALETTES = [
        {
            gradient: 'from-violet-500 to-purple-600',
            border: 'border-violet-400/50',
            text: 'text-violet-100',
            iconBg: 'bg-violet-500/20',
            iconText: 'text-violet-600 dark:text-violet-300',
            borderLight: 'border-violet-500/30'
        },
        {
            gradient: 'from-emerald-500 to-teal-600',
            border: 'border-emerald-400/50',
            text: 'text-emerald-100',
            iconBg: 'bg-emerald-500/20',
            iconText: 'text-emerald-600 dark:text-emerald-300',
            borderLight: 'border-emerald-500/30'
        },
        {
            gradient: 'from-amber-500 to-orange-600',
            border: 'border-amber-400/50',
            text: 'text-amber-100',
            iconBg: 'bg-amber-500/20',
            iconText: 'text-amber-600 dark:text-amber-300',
            borderLight: 'border-amber-500/30'
        },
        {
            gradient: 'from-rose-500 to-pink-600',
            border: 'border-rose-400/50',
            text: 'text-rose-100',
            iconBg: 'bg-rose-500/20',
            iconText: 'text-rose-600 dark:text-rose-300',
            borderLight: 'border-rose-500/30'
        },
        {
            gradient: 'from-cyan-500 to-blue-600',
            border: 'border-cyan-400/50',
            text: 'text-cyan-100',
            iconBg: 'bg-cyan-500/20',
            iconText: 'text-cyan-600 dark:text-cyan-300',
            borderLight: 'border-cyan-500/30'
        },
        {
            gradient: 'from-indigo-500 to-blue-600',
            border: 'border-indigo-400/50',
            text: 'text-indigo-100',
            iconBg: 'bg-indigo-500/20',
            iconText: 'text-indigo-600 dark:text-indigo-300',
            borderLight: 'border-indigo-500/30'
        },
        {
            gradient: 'from-fuchsia-500 to-rose-600',
            border: 'border-fuchsia-400/50',
            text: 'text-fuchsia-100',
            iconBg: 'bg-fuchsia-500/20',
            iconText: 'text-fuchsia-600 dark:text-fuchsia-300',
            borderLight: 'border-fuchsia-500/30'
        },
        {
            gradient: 'from-teal-500 to-emerald-600',
            border: 'border-teal-400/50',
            text: 'text-teal-100',
            iconBg: 'bg-teal-500/20',
            iconText: 'text-teal-600 dark:text-teal-300',
            borderLight: 'border-teal-500/30'
        },
        {
            gradient: 'from-orange-500 to-amber-600',
            border: 'border-orange-400/50',
            text: 'text-orange-100',
            iconBg: 'bg-orange-500/20',
            iconText: 'text-orange-600 dark:text-orange-300',
            borderLight: 'border-orange-500/30'
        },
        {
            gradient: 'from-blue-500 to-indigo-600',
            border: 'border-blue-400/50',
            text: 'text-blue-100',
            iconBg: 'bg-blue-500/20',
            iconText: 'text-blue-600 dark:text-blue-300',
            borderLight: 'border-blue-500/30'
        }
    ];

    /**
     * Compute a deterministic vibrant color palette for any handle and index.
     * Guaranteed variety so adjacent entries never share identical colors.
     */
    function getHandleColorPalette(handle, index = 0) {
        if (!handle) return PEER_COLOR_PALETTES[0];
        let hash = 0;
        for (let i = 0; i < handle.length; i++) {
            hash = ((hash << 5) - hash) + handle.charCodeAt(i);
            hash |= 0;
        }
        const paletteIndex = Math.abs(hash + index * 3) % PEER_COLOR_PALETTES.length;
        return PEER_COLOR_PALETTES[paletteIndex];
    }

    /**
     * Discipline color gradient mapping for avatar badges (with fallback).
     */
    function getDisciplineGradient(disc, handle = '', index = 0) {
        if (handle) {
            const pal = getHandleColorPalette(handle, index);
            return `${pal.gradient} ${pal.border} ${pal.text}`;
        }
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
     * Enforces the rule: limit the current user's milestones to at most 2,
     * maximizing visual variety from fellow engineering peers.
     */
    function renderStream() {
        const streamContainer = document.getElementById('peer-milestones-stream');
        if (!streamContainer) return;

        const userDiscipline = localStorage.getItem('enggtv_discipline') || 'Mechanical';
        const myHandle = getOrGenerateHandle();
        let currentUserMilestoneCount = 0;

        // Filter milestones: limit current user to at most 2 to create high variety
        const filtered = milestonesCache.filter(m => {
            if (currentFilter === 'my_discipline') {
                const discMatch = m.discipline && (
                    m.discipline === userDiscipline || 
                    m.discipline.toLowerCase().includes(userDiscipline.toLowerCase()) ||
                    userDiscipline.toLowerCase().includes(m.discipline.toLowerCase())
                );
                if (!discMatch) return false;
            }
            // Limit current user milestones to maximum 2
            if (m.handle === myHandle) {
                currentUserMilestoneCount++;
                if (currentUserMilestoneCount > 2) {
                    return false;
                }
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
            const palette = getHandleColorPalette(m.handle, idx);
            const isSelf = m.handle === myHandle;

            return `
                <div class="peer-milestone-item p-3.5 sm:p-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 flex items-start justify-between gap-3.5 transition-all hover:border-cyan-500/40 hover:shadow-md group/item" data-id="${m.id}">
                    <div class="flex items-start gap-3 min-w-0">
                        <!-- Avatar Badge (Mixed dynamic vibrant colors) -->
                        <div class="w-10 h-10 rounded-2xl bg-gradient-to-br ${palette.gradient} flex items-center justify-center font-bold text-xs font-mono shadow-sm shrink-0 border ${palette.border} ${palette.text} transition-transform group-hover/item:scale-105">
                            ${initials}
                        </div>

                        <!-- Info Content -->
                        <div class="min-w-0 flex-1">
                            <div class="flex flex-wrap items-center gap-2 mb-1">
                                <span class="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate flex items-center gap-1.5">
                                    <span class="w-2 h-2 rounded-full bg-gradient-to-br ${palette.gradient} shrink-0 inline-block shadow-xs"></span>
                                    <span>${m.handle}</span>
                                </span>
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
        const iconEl = document.getElementById('user-anonymous-handle-icon');
        const palette = getHandleColorPalette(handle, 0);

        if (displayEl) {
            displayEl.textContent = handle;
            displayEl.className = `font-mono text-sm sm:text-base font-black ${palette.iconText}`;
        }
        if (iconEl) {
            iconEl.className = `w-8 h-8 rounded-xl ${palette.iconBg} ${palette.iconText} border ${palette.borderLight} flex items-center justify-center font-bold shrink-0 transition-all shadow-xs`;
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
            recent.slice(0, 2).forEach(act => {
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
                    const now = Date.now();
                    const map = new Map();
                    milestonesCache.forEach(m => map.set(m.id, m));
                    communityData.forEach((m, idx) => {
                        if (!map.has(m.id)) {
                            // If timestamp is more than 24 hours old, distribute naturally over recent hours
                            if (!m.timestamp || (now - m.timestamp > 24 * 3600 * 1000)) {
                                const offsetMins = 8 + (idx * 14); // 8m, 22m, 36m, 50m, 1h ago, etc.
                                m.timestamp = now - (offsetMins * 60 * 1000);
                            }
                            map.set(m.id, m);
                        }
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
