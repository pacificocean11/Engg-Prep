/**
 * ENGG.tv Video Hub - YouTube Style Video Browser
 * Part of Engg.tv Prep — NCEES FE Exam Preparation Platform
 */
(function() {
    'use strict';

    let allVideos = [];
    let filteredVideos = [];
    let currentDiscipline = 'Mechanical';
    let activeSubjectFilter = 'all';
    let searchQuery = '';
    let renderedCount = 0;
    const PAGE_SIZE = 24;

    function getDriveId(url) {
        if (!url) return null;
        const m = url.match(/(?:\/file\/d\/|[?&]id=|\/api\/drive-stream\/)([a-zA-Z0-9_-]+)/);
        return m ? m[1] : null;
    }

    function normalizeDiscipline(raw) {
        if (!raw) return 'Mechanical';
        const d = String(raw).trim().toLowerCase();
        if (d.includes('mech')) return 'Mechanical';
        if (d.includes('civil')) return 'Civil';
        if (d.includes('elect') || d.includes('comp')) return 'Electrical and Computer';
        if (d.includes('chem')) return 'Chemical';
        if (d.includes('indus')) return 'Industrial';
        if (d.includes('env')) return 'Environmental';
        if (d.includes('other')) return 'Other';
        return 'Mechanical';
    }

    function getActiveDiscipline() {
        const raw = localStorage.getItem('enggtv_discipline') || 
                    (window.currentUser && (window.currentUser.discipline || window.currentUser.fe_discipline)) || 
                    'Mechanical';
        return normalizeDiscipline(raw);
    }

    function getSubjectName(card, disc) {
        const title = (card.title || '').toLowerCase();
        const tip = (card.examTip || '').toLowerCase();

        if (/math|calculus|derivative|integral|matrix|vector|laplace|taylor|series|differential|foci|ellipse/i.test(title)) return 'Mathematics';
        if (/probability|statistics|normal distribution|binomial|confidence|variance/i.test(title)) return 'Probability & Stats';
        if (/ethics|pe seal|licensure|conflict|safety|osha|epa|whistleblowing/i.test(title)) return 'Ethics & Safety';
        if (/economics|interest|cash flow|depreciation|macrs|benefit-cost|break-even|sunk cost/i.test(title)) return 'Engineering Economics';
        if (/fluid|viscosity|bernoulli|reynolds|darcy|turbine|head loss|pipe flow|manometer/i.test(title)) return 'Fluid Mechanics';
        if (/thermo|gas law|carnot|entropy|enthalpy|steam table|refrigeration|cycle|brayton|otto|diesel/i.test(title)) return 'Thermodynamics';
        if (/heat transfer|conduction|convection|radiation|fin|fourier|stefan-boltzmann|heat exchanger/i.test(title)) return 'Heat Transfer';
        if (/statics|equilibrium|truss|centroid|moment of inertia|friction/i.test(title)) return 'Statics';
        if (/dynamics|kinematics|vibration|coriolis|pendulum|damping|impulse|momentum|collision/i.test(title)) return 'Dynamics & Vibrations';
        if (/mechanics of materials|stress|strain|mohr|shear|bending|torsion|beam deflection|buckling/i.test(title)) return 'Mechanics of Materials';
        if (/material|crystal|phase diagram|eutectic|fick|hardening|ductility|steel|polymer|ceramics/i.test(title)) return 'Material Science';
        if (/electric|circuit|ohm|kirchhoff|capacitor|inductor|op-amp|transistor|motor|generator/i.test(title)) return 'Electricity & Magnetism';
        if (/instrumentation|measurement|control|pid|bode|sensor|feedback/i.test(title)) return 'Controls & Instrumentation';
        if (/geotech|soil|foundation|bearing capacity|permeability|compaction|effective stress/i.test(title)) return 'Geotechnical';
        if (/transport|highway|traffic|sight distance|pavement|horizontal curve/i.test(title)) return 'Transportation';
        if (/structural|concrete|steel|beam|column|truss|virtual work/i.test(title)) return 'Structural Design';
        if (/water|environmental|wastewater|bod|hydrology|runoff|filtration/i.test(title)) return 'Water Resources';
        return 'Core Engineering';
    }

    function getSubjectColor(subj) {
        const map = {
            'Mathematics': { bg: 'from-blue-600 to-indigo-600', icon: 'functions', badge: 'text-blue-500 bg-blue-500/10' },
            'Probability & Stats': { bg: 'from-purple-600 to-pink-600', icon: 'query_stats', badge: 'text-purple-500 bg-purple-500/10' },
            'Fluid Mechanics': { bg: 'from-cyan-600 to-blue-600', icon: 'waves', badge: 'text-cyan-500 bg-cyan-500/10' },
            'Thermodynamics': { bg: 'from-amber-600 to-red-600', icon: 'thermostat', badge: 'text-amber-500 bg-amber-500/10' },
            'Heat Transfer': { bg: 'from-orange-600 to-amber-600', icon: 'local_fire_department', badge: 'text-orange-500 bg-orange-500/10' },
            'Statics': { bg: 'from-emerald-600 to-teal-600', icon: 'balance', badge: 'text-emerald-500 bg-emerald-500/10' },
            'Dynamics & Vibrations': { bg: 'from-teal-600 to-cyan-600', icon: 'speed', badge: 'text-teal-500 bg-teal-500/10' },
            'Mechanics of Materials': { bg: 'from-indigo-600 to-violet-600', icon: 'architecture', badge: 'text-indigo-500 bg-indigo-500/10' },
            'Material Science': { bg: 'from-rose-600 to-pink-600', icon: 'science', badge: 'text-rose-500 bg-rose-500/10' },
            'Electricity & Magnetism': { bg: 'from-yellow-600 to-amber-600', icon: 'electric_bolt', badge: 'text-yellow-500 bg-yellow-500/10' },
            'Ethics & Safety': { bg: 'from-slate-600 to-slate-800', icon: 'verified_user', badge: 'text-slate-500 bg-slate-500/10' },
            'Engineering Economics': { bg: 'from-green-600 to-emerald-600', icon: 'attach_money', badge: 'text-green-500 bg-green-500/10' },
            'Structural Design': { bg: 'from-stone-600 to-zinc-700', icon: 'domain', badge: 'text-amber-600 bg-amber-600/10' },
            'Geotechnical': { bg: 'from-amber-800 to-yellow-900', icon: 'terrain', badge: 'text-amber-700 bg-amber-700/10' },
            'Transportation': { bg: 'from-blue-700 to-slate-700', icon: 'traffic', badge: 'text-blue-600 bg-blue-600/10' },
            'Water Resources': { bg: 'from-sky-600 to-cyan-700', icon: 'water', badge: 'text-sky-500 bg-sky-500/10' }
        };
        return map[subj] || { bg: 'from-pink-600 to-rose-600', icon: 'smart_display', badge: 'text-pink-500 bg-pink-500/10' };
    }

    function loadVideosForDiscipline() {
        currentDiscipline = getActiveDiscipline();
        const datasets = window.THEOREMS_BY_DISCIPLINE || {};
        
        let deck = datasets[currentDiscipline] || [];
        if (!deck.length || deck.filter(c => Boolean(c && c.videoUrl)).length === 0) {
            deck = datasets['Mechanical'] || [];
        }

        let videoCards = deck.filter(card => Boolean(card && card.videoUrl));
        if (videoCards.length === 0) {
            for (const key of Object.keys(datasets)) {
                const list = (datasets[key] || []).filter(c => Boolean(c && c.videoUrl));
                if (list.length > 0) {
                    videoCards = list;
                    currentDiscipline = key;
                    break;
                }
            }
        }

        allVideos = videoCards.map((card, idx) => ({
            ...card,
            originalIndex: idx,
            subject: getSubjectName(card, currentDiscipline)
        }));

        applyFilters();
    }

    function applyFilters() {
        const query = (searchQuery || '').toLowerCase().trim();
        filteredVideos = allVideos.filter(card => {
            if (activeSubjectFilter === 'solved') {
                if (!card.solvedExample) return false;
            } else if (activeSubjectFilter !== 'all') {
                if (card.subject !== activeSubjectFilter) return false;
            }

            if (query) {
                const titleMatch = (card.title || '').toLowerCase().includes(query);
                const subjMatch = (card.subject || '').toLowerCase().includes(query);
                const tipMatch = (card.examTip || '').toLowerCase().includes(query);
                const descMatch = (card.description || '').toLowerCase().includes(query);
                const formulaMatch = (card.formula || '').toLowerCase().includes(query);
                if (!titleMatch && !subjMatch && !tipMatch && !descMatch && !formulaMatch) {
                    return false;
                }
            }
            return true;
        });

        renderedCount = 0;
        renderGrid();
        updateCounter();
    }

    function updateCounter() {
        const counterEl = document.getElementById('tv-video-count-badge');
        if (counterEl) {
            counterEl.textContent = `${filteredVideos.length} ${filteredVideos.length === 1 ? 'Video' : 'Videos'}`;
        }
    }

    function renderFilterChips() {
        const container = document.getElementById('tv-filter-chips-container');
        if (!container) return;

        const subjectCounts = {};
        let solvedCount = 0;
        allVideos.forEach(v => {
            subjectCounts[v.subject] = (subjectCounts[v.subject] || 0) + 1;
            if (v.solvedExample) solvedCount++;
        });

        const sortedSubjects = Object.keys(subjectCounts).sort((a, b) => subjectCounts[b] - subjectCounts[a]);

        const chips = [
            { id: 'all', label: 'All', count: allVideos.length }
        ];

        if (solvedCount > 0) {
            chips.push({ id: 'solved', label: '⭐ Solved Problems', count: solvedCount });
        }

        sortedSubjects.forEach(s => {
            chips.push({ id: s, label: s, count: subjectCounts[s] });
        });

        container.innerHTML = chips.map(chip => {
            const isActive = activeSubjectFilter === chip.id;
            const activeClass = isActive 
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-950 font-bold shadow-md scale-[1.02]' 
                : 'bg-white/80 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-300 font-semibold border border-slate-200/80 dark:border-slate-700/80';
            
            return `
                <button type="button" onclick="window.setTvSubjectFilter('${chip.id}')" class="px-3.5 py-1.5 rounded-full text-xs whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 shrink-0 ${activeClass}">
                    <span>${chip.label}</span>
                    <span class="text-[10px] opacity-70">(${chip.count})</span>
                </button>
            `;
        }).join('');
    }

    function resolveVideoUrl(url) {
        if (!url) return '';
        if (url.startsWith('assets/videos/') || url.includes('raw.githubusercontent.com')) {
            const filename = url.split('/').pop();
            const decoded = decodeURIComponent(filename);
            return `assets/videos/${encodeURI(decoded)}`;
        }
        return url;
    }

    function createCardElement(video, index) {
        const isLocalHost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:';
        
        // On live GitHub Pages, only files uploaded to the repository physically exist
        const hasNativeMp4 = isLocalHost 
            ? (video.videoUrl && video.videoUrl.startsWith('assets/videos/')) 
            : Boolean(video.isUploadedToGithub);

        const driveId = getDriveId(video.driveUrl || video.videoUrl);
        const resolvedVideoUrl = hasNativeMp4 ? resolveVideoUrl(video.videoUrl) : '';

        const style = getSubjectColor(video.subject);
        const hasSolved = Boolean(video.solvedExample);
        const duration = video.videoDuration || '10s';

        const safeTitle = (video.title || '').replace(/"/g, '&quot;');
        const formulaSnippet = (video.formula || '')
            .replace(/\$\$|\$|\\text\{|\}|\\quad|\\frac|\\rho|\\mu|\\Delta/g, '')
            .slice(0, 55);

        let mediaHtml = '';
        if (resolvedVideoUrl) {
            mediaHtml = `
                <video src="${resolvedVideoUrl}#t=0.5" 
                       preload="metadata" 
                       muted 
                       playsinline 
                       class="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-0 group-hover:scale-105 pointer-events-none z-10"
                       onloadeddata="this.classList.remove('opacity-0')"
                       onseeked="this.classList.remove('opacity-0')"
                       onerror="this.remove()">
                </video>
            `;
        } else if (video.imageUrl) {
            mediaHtml = `
                <img src="${video.imageUrl}" 
                     alt="${safeTitle}" 
                     loading="lazy" 
                     class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                     onerror="this.remove()">
            `;
        } else if (driveId) {
            const thumbUrl = `https://drive.google.com/thumbnail?id=${driveId}&sz=w640`;
            mediaHtml = `
                <img src="${thumbUrl}" 
                     alt="${safeTitle}" 
                     loading="lazy" 
                     class="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                     onerror="this.remove()">
            `;
        }

        return `
            <div onclick="window.playTvVideo('${safeTitle}')" class="group flex flex-col cursor-pointer transition-all duration-200 hover:-translate-y-1">
                <!-- Thumbnail Container (16:9 aspect ratio, YouTube style) -->
                <div class="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 shadow-sm group-hover:shadow-xl group-hover:border-[#FF006E]/60 transition-all duration-300">
                    <!-- Base Styled Poster (Always visible underneath so thumbnail is NEVER blank or black) -->
                    <div class="absolute inset-0 w-full h-full bg-gradient-to-br ${style.bg} p-4 flex flex-col justify-between text-white select-none">
                        <div class="flex items-center justify-between">
                            <span class="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md">${video.subject}</span>
                            <span class="material-symbols-outlined text-sm">play_circle</span>
                        </div>
                        <div class="my-auto text-center px-2">
                            <span class="material-symbols-outlined text-3xl opacity-85 mb-1">ondemand_video</span>
                            <p class="text-xs font-bold line-clamp-2 leading-snug">${safeTitle}</p>
                        </div>
                        <div class="text-[9px] opacity-75 font-mono truncate">${formulaSnippet}</div>
                    </div>

                    <!-- Real Thumbnail Media Layer (Smoothly fades in over base poster once frame decodes) -->
                    ${mediaHtml}

                    <!-- Ambient Dark Gradient on Hover -->
                    <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>

                    <!-- Play Button Overlay -->
                    <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 pointer-events-none">
                        <div class="w-12 h-12 rounded-full bg-[#FF006E]/95 text-white flex items-center justify-center shadow-lg shadow-pink-600/50 scale-75 group-hover:scale-100 transition-transform duration-300">
                            <span class="material-symbols-outlined text-2xl" style="font-variation-settings:'FILL' 1;">play_arrow</span>
                        </div>
                    </div>

                    <!-- Top Left Subject Pill -->
                    <div class="absolute top-2 left-2 z-10">
                        <span class="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/75 backdrop-blur-md text-pink-300 border border-white/10 shadow-sm">
                            ${video.subject}
                        </span>
                    </div>

                    <!-- Top Right: Solved Example Pill (Golden) -->
                    ${hasSolved ? `
                        <div class="absolute top-2 right-2 z-10">
                            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider bg-amber-500/90 text-slate-950 flex items-center gap-1 shadow-md">
                                <span class="material-symbols-outlined text-[12px]">school</span>
                                Solved Problem
                            </span>
                        </div>
                    ` : ''}

                    <!-- Bottom Right Duration Pill (Classic YouTube) -->
                    <div class="absolute bottom-2 right-2 z-10">
                        <span class="px-1.5 py-0.5 rounded-md text-[11px] font-mono font-bold bg-black/85 backdrop-blur-md text-white tracking-wider shadow">
                            ${duration}
                        </span>
                    </div>
                </div>

                <!-- Info Block Below Thumbnail (YouTube exact pattern) -->
                <div class="flex items-start gap-3 mt-3 px-0.5">
                    <!-- Channel Avatar / Subject Icon -->
                    <div class="w-9 h-9 rounded-full bg-gradient-to-tr ${style.bg} p-0.5 shrink-0 shadow-sm mt-0.5">
                        <div class="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-white">
                            <span class="material-symbols-outlined text-[17px]">${style.icon}</span>
                        </div>
                    </div>

                    <!-- Title & Details -->
                    <div class="min-w-0 flex-1">
                        <h3 class="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-[#FF006E] dark:group-hover:text-pink-400 transition-colors" title="${safeTitle}">
                            ${safeTitle}
                        </h3>
                        
                        <div class="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span class="font-medium truncate">${video.subject}</span>
                            <span class="w-1 h-1 rounded-full bg-slate-400 dark:bg-slate-600 shrink-0"></span>
                            <span class="text-pink-600 dark:text-pink-400 font-bold inline-flex items-center gap-0.5 shrink-0">
                                <span class="material-symbols-outlined text-[12px]">verified</span> ENGG.tv
                            </span>
                        </div>

                        <div class="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                            <span>High-Yield Concept</span>
                            ${hasSolved ? '<span class="text-amber-600 dark:text-amber-400 font-bold">• Step-by-Step Solution</span>' : ''}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    function renderGrid(append = false) {
        const grid = document.getElementById('tv-thumbnails-grid');
        const emptyState = document.getElementById('tv-empty-state');
        const loadMoreBtn = document.getElementById('tv-load-more-btn');
        if (!grid) return;

        if (filteredVideos.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.classList.remove('hidden');
            if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        const slice = filteredVideos.slice(renderedCount, renderedCount + PAGE_SIZE);
        const cardsHtml = slice.map((video, idx) => createCardElement(video, renderedCount + idx)).join('');

        if (append) {
            grid.insertAdjacentHTML('beforeend', cardsHtml);
        } else {
            grid.innerHTML = cardsHtml;
        }

        renderedCount += slice.length;

        if (loadMoreBtn) {
            if (renderedCount < filteredVideos.length) {
                loadMoreBtn.classList.remove('hidden');
                loadMoreBtn.textContent = `Load More (${filteredVideos.length - renderedCount} remaining)`;
            } else {
                loadMoreBtn.classList.add('hidden');
            }
        }
    }

    window.setTvSubjectFilter = function(filterId) {
        activeSubjectFilter = filterId;
        renderFilterChips();
        applyFilters();
    };

    window.onTvSearchInput = function(val) {
        searchQuery = val || '';
        applyFilters();
    };

    window.clearTvSearch = function() {
        searchQuery = '';
        activeSubjectFilter = 'all';
        const input = document.getElementById('tv-search-input');
        if (input) input.value = '';
        renderFilterChips();
        applyFilters();
    };

    window.loadMoreTvVideos = function() {
        renderGrid(true);
    };

    window.shuffleTvPlay = function() {
        if (!filteredVideos.length) return;
        const randomCard = filteredVideos[Math.floor(Math.random() * filteredVideos.length)];
        window.playTvVideo(randomCard.title);
    };

    window.playTvVideo = function(cardTitle) {
        const browser = document.getElementById('tv-video-browser');
        const playerPane = document.getElementById('study-pane-flashcards');
        const playerTopBar = document.getElementById('tv-player-top-bar');
        
        // Keep TV grid mounted in DOM underneath the overlay
        if (browser) browser.classList.remove('hidden');

        if (playerPane) {
            playerPane.classList.remove('hidden');
            playerPane.scrollTop = 0;
        }
        if (playerTopBar) playerTopBar.classList.remove('hidden');

        // Prevent body background scrolling while overlay is active
        document.body.style.overflow = 'hidden';

        if (typeof window.openFlashcardStudio === 'function') {
            window.openFlashcardStudio(currentDiscipline, 'recall', 'all', cardTitle);
        }
    };

    window.backToTvGrid = function() {
        const playerPane = document.getElementById('study-pane-flashcards');
        const playerTopBar = document.getElementById('tv-player-top-bar');

        if (playerTopBar) playerTopBar.classList.add('hidden');
        if (playerPane) playerPane.classList.add('hidden');

        // Restore body scroll
        document.body.style.overflow = '';

        const vid = document.getElementById('fc-back-video');
        if (vid) { try { vid.pause(); } catch(e) {} }
        const driveFrame = document.getElementById('fc-back-drive-frame');
        if (driveFrame) { try { driveFrame.src = ''; } catch(e) {} }
    };

    window.showTvGrid = function() {
        const browser = document.getElementById('tv-video-browser');
        const playerPane = document.getElementById('study-pane-flashcards');
        if (browser) browser.classList.remove('hidden');
        if (playerPane) playerPane.classList.add('hidden');
        document.body.style.overflow = '';
    };

    // Global ESC key listener to dismiss TV overlay
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            const playerPane = document.getElementById('study-pane-flashcards');
            if (playerPane && !playerPane.classList.contains('hidden')) {
                window.backToTvGrid();
            }
        }
    });

    window.initTvHub = function() {
        loadVideosForDiscipline();
        renderFilterChips();
        showTvGrid();

        if (allVideos.length === 0) {
            [200, 500, 1000, 2000, 4000].forEach(delay => {
                setTimeout(() => {
                    if (allVideos.length === 0 && window.THEOREMS_BY_DISCIPLINE) {
                        loadVideosForDiscipline();
                        renderFilterChips();
                    }
                }, delay);
            });
        }
    };

    // Auto-reload videos when switching to TV page
    document.addEventListener('click', (e) => {
        const tvBtn = e.target.closest('[data-page="tv"]') || (e.target.id === 'nav-tv-btn' ? e.target : null);
        if (tvBtn) {
            setTimeout(() => {
                if (allVideos.length === 0 || !document.getElementById('tv-video-grid')?.children.length) {
                    loadVideosForDiscipline();
                    renderFilterChips();
                }
            }, 60);
        }
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            window.initTvHub();
        });
    } else {
        setTimeout(window.initTvHub, 50);
    }

})();
