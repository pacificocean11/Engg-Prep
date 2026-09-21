/**
 * FE THEOREM RAPID FLASHCARD STUDIO WITH LEITNER SPACED REPETITION (SRS)
 * Part of Engg.tv Prep — NCEES FE Exam Preparation Platform
 */
(function() {
    'use strict';

    const SRS_STORAGE_KEY = 'enggtv_flashcard_srs';
    const BOX_INTERVALS_DAYS = { 1: 0, 2: 2, 3: 5, 4: 14 }; // Days until due
    const SPRINT_SIZE = 20;

    let currentDeck = [];
    let currentIndex = 0;
    let isFlipped = false;
    let sessionStats = { reviewed: 0, mastered: 0, xpEarned: 0 };
    let currentMode = 'recall'; // 'recall' or 'identify'
    let currentDiscipline = 'current';

    // Helper: Load SRS state
    function loadSrsData() {
        try {
            return JSON.parse(localStorage.getItem(SRS_STORAGE_KEY) || '{}');
        } catch (e) {
            return {};
        }
    }

    // Helper: Save SRS state
    function saveSrsData(data) {
        try {
            localStorage.setItem(SRS_STORAGE_KEY, JSON.stringify(data));
        } catch (e) {}
    }

    // Get active discipline from app or localStorage
    function getActiveDiscipline() {
        if (typeof window.getActiveMotivationDiscipline === 'function') {
            return window.getActiveMotivationDiscipline();
        }
        return localStorage.getItem('enggtv_discipline') || 'Mechanical';
    }

    // Build the smart queue for current session
    function buildSessionQueue(disc, mode) {
        const srsData = loadSrsData();
        const now = Date.now();
        const datasets = window.THEOREMS_BY_DISCIPLINE || {};

        let allTheorems = [];
        if (disc === 'current' || !disc) {
            const actualDisc = getActiveDiscipline();
            allTheorems = (datasets[actualDisc] || []).map(t => ({ ...t, disc: actualDisc }));
        } else if (disc === 'all') {
            Object.keys(datasets).forEach(d => {
                (datasets[d] || []).forEach(t => allTheorems.push({ ...t, disc: d }));
            });
        } else {
            allTheorems = (datasets[disc] || []).map(t => ({ ...t, disc: disc }));
        }

        if (allTheorems.length === 0) return [];

        // Attach SRS metadata to each theorem
        const queue = allTheorems.map(t => {
            const entry = srsData[t.title] || { box: 1, nextDue: 0, repetitions: 0, lapses: 0 };
            return {
                ...t,
                srs: entry,
                isDue: entry.nextDue <= now,
                isNew: entry.repetitions === 0
            };
        });

        // Priority sorting:
        // 1. Due cards from Box 1 & 2
        // 2. Unseen new cards
        // 3. Other cards (shuffled)
        const dueCards = queue.filter(q => q.isDue && !q.isNew).sort((a, b) => a.srs.nextDue - b.srs.nextDue);
        const newCards = queue.filter(q => q.isNew).sort(() => Math.random() - 0.5);
        const upcomingCards = queue.filter(q => !q.isDue && !q.isNew).sort(() => Math.random() - 0.5);

        const combined = [...dueCards, ...newCards, ...upcomingCards];
        return combined.slice(0, SPRINT_SIZE);
    }

    // Render current card state
    function renderCard() {
        const modal = document.getElementById('fe-flashcards-modal');
        if (!modal || modal.classList.contains('hidden')) return;

        const summaryView = document.getElementById('fc-summary-view');
        const cardTrigger = document.getElementById('fc-card-trigger');
        const ratingDock = document.getElementById('fc-rating-dock');

        if (currentIndex >= currentDeck.length) {
            // Show session summary
            if (cardTrigger) cardTrigger.classList.add('hidden');
            if (ratingDock) ratingDock.classList.add('hidden');
            if (summaryView) {
                summaryView.classList.remove('hidden');
                const sumCards = document.getElementById('fc-sum-cards');
                const sumMastered = document.getElementById('fc-sum-mastered');
                const sumXp = document.getElementById('fc-sum-xp');
                if (sumCards) sumCards.textContent = sessionStats.reviewed;
                if (sumMastered) sumMastered.textContent = sessionStats.mastered;
                if (sumXp) sumXp.textContent = `+${sessionStats.xpEarned} XP`;
            }
            return;
        }

        if (cardTrigger) cardTrigger.classList.remove('hidden');
        if (summaryView) summaryView.classList.add('hidden');
        if (ratingDock) ratingDock.classList.remove('hidden');

        const card = currentDeck[currentIndex];
        isFlipped = false;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');

        // Update Header Progress & Stats
        const progressText = document.getElementById('fc-progress-text');
        const progressBar = document.getElementById('fc-session-progress-bar');
        const dueIndicator = document.getElementById('fc-due-indicator');

        if (progressText) progressText.textContent = `Card ${currentIndex + 1} of ${currentDeck.length}`;
        if (progressBar) {
            const pct = Math.round(((currentIndex) / currentDeck.length) * 100);
            progressBar.style.width = `${Math.max(5, pct)}%`;
        }

        const srsData = loadSrsData();
        let box1Count = 0, box2Count = 0, box3Count = 0, box4Count = 0, totalDue = 0;
        const now = Date.now();
        Object.values(srsData).forEach(s => {
            if (s.box === 1) box1Count++;
            else if (s.box === 2) box2Count++;
            else if (s.box === 3) box3Count++;
            else if (s.box >= 4) box4Count++;
            if (s.nextDue <= now) totalDue++;
        });

        const b1 = document.getElementById('fc-stat-box1');
        const b2 = document.getElementById('fc-stat-box2');
        const b3 = document.getElementById('fc-stat-box3');
        const b4 = document.getElementById('fc-stat-box4');
        if (b1) b1.textContent = `Box 1: ${box1Count}`;
        if (b2) b2.textContent = `Box 2: ${box2Count}`;
        if (b3) b3.textContent = `Box 3: ${box3Count}`;
        if (b4) b4.textContent = `Mastered: ${box4Count}`;
        if (dueIndicator) dueIndicator.textContent = `${totalDue} due for review`;

        // Card Front Fields
        const cardDisc = document.getElementById('fc-card-discipline');
        const cardLvl = document.getElementById('fc-card-level-badge');
        const frontPrompt = document.getElementById('fc-front-prompt-label');
        const frontTitle = document.getElementById('fc-front-title');
        const frontFormulaView = document.getElementById('fc-front-formula-view');
        const frontHint = document.getElementById('fc-front-hint');

        if (cardDisc) cardDisc.textContent = `${card.disc || getActiveDiscipline()} FE Focus`;
        if (cardLvl) {
            const box = card.srs.box || 1;
            cardLvl.textContent = card.srs.repetitions === 0 ? 'New Card' : `Box ${box} (${BOX_INTERVALS_DAYS[box] || 0}d)`;
            cardLvl.className = box === 1 ? 'text-[10px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full border border-rose-500/40' :
                                box === 2 ? 'text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40' :
                                'text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/40';
        }

        if (currentMode === 'identify') {
            if (frontPrompt) frontPrompt.textContent = 'Identify this Governing Principle:';
            if (frontTitle) frontTitle.classList.add('hidden');
            if (frontFormulaView) {
                frontFormulaView.classList.remove('hidden');
                frontFormulaView.innerHTML = card.formula || '';
            }
            if (frontHint) {
                frontHint.innerHTML = 'What is the name of this theorem, and what FE topic does it govern?';
            }
            triggerMathTypeset([frontFormulaView]);
        } else {
            if (frontPrompt) frontPrompt.textContent = 'Recall the Governing Equation:';
            if (frontTitle) {
                frontTitle.classList.remove('hidden');
                frontTitle.innerHTML = card.title || '';
            }
            if (frontFormulaView) frontFormulaView.classList.add('hidden');
            if (frontHint) {
                // Remove block math $$...$$ so it does not give away the formula before flip,
                // but preserve full text and inline math $...$ completely intact!
                const cleanSnippet = (card.description || '').replace(/\$\$[\s\S]*?\$\$/g, '').trim();
                frontHint.innerHTML = cleanSnippet || 'What is the mathematical equation, key variables, and assumptions?';
            }
            triggerMathTypeset([frontTitle, frontHint]);
        }

        // Card Back Fields
        const backTitle = document.getElementById('fc-back-title');
        const backFormula = document.getElementById('fc-back-formula');
        const backDesc = document.getElementById('fc-back-desc');
        const backTip = document.getElementById('fc-back-tip');
        const backColPrimary = document.getElementById('fc-back-col-primary');
        const backColVideo = document.getElementById('fc-back-col-video');
        const backVideoCont = document.getElementById('fc-back-video-container');
        const backVideo = document.getElementById('fc-back-video');
        const backVideoDur = document.getElementById('fc-back-video-duration');

        if (backTitle) backTitle.innerHTML = card.title || '';
        if (backFormula) backFormula.innerHTML = card.formula || '';
        if (backDesc) backDesc.innerHTML = card.description || '';
        if (backTip) backTip.innerHTML = card.examTip || '';

        // Typeset all math elements on front and back
        triggerMathTypeset([frontTitle, frontFormulaView, frontHint, backTitle, backFormula, backDesc, backTip]);

        // Responsive Video & 2-Column Layout configuration
        if (card.videoUrl && backVideo) {
            if (backColVideo) backColVideo.classList.remove('hidden');
            if (backColPrimary) {
                backColPrimary.className = 'w-full sm:col-span-7 space-y-3.5';
            }
            if (backVideoDur) backVideoDur.textContent = card.videoDuration || '10s';
            backVideo.src = card.videoUrl;
            backVideo.load();
        } else {
            if (backColVideo) backColVideo.classList.add('hidden');
            if (backColPrimary) {
                backColPrimary.className = 'w-full sm:col-span-12 max-w-2xl lg:max-w-3xl mx-auto space-y-4';
            }
            if (backVideo) {
                backVideo.pause();
                backVideo.removeAttribute('src');
            }
        }
    }

    // Typeset math helper
    function triggerMathTypeset(elements) {
        const els = (elements || []).filter(el => el && el.nodeType === 1);
        if (els.length === 0) return;

        if (typeof window.safeTypesetMath === 'function') {
            window.safeTypesetMath(els);
        } else if (window.MathJax && window.MathJax.typesetPromise) {
            try {
                if (typeof window.MathJax.typesetClear === 'function') {
                    window.MathJax.typesetClear(els);
                }
                window.MathJax.typesetPromise(els).catch(err => console.warn('MathJax notice:', err));
            } catch (e) {}
        }
    }

    // Flip action
    function flipCard() {
        if (currentIndex >= currentDeck.length) return;
        const inner = document.getElementById('fc-flip-inner');
        if (!inner) return;

        isFlipped = !isFlipped;
        if (isFlipped) {
            inner.classList.add('flipped');

            // Render LaTeX on back
            const backFormula = document.getElementById('fc-back-formula');
            const backDesc = document.getElementById('fc-back-desc');
            const backTip = document.getElementById('fc-back-tip');
            const backTitle = document.getElementById('fc-back-title');
            triggerMathTypeset([backFormula, backDesc, backTip, backTitle]);

            // Auto-play explainer video if present
            const card = currentDeck[currentIndex];
            if (card && card.videoUrl) {
                setTimeout(() => {
                    const video = document.getElementById('fc-back-video');
                    if (video) {
                        video.currentTime = 0;
                        const p = video.play();
                        if (p !== undefined) p.catch(() => {});
                    }
                }, 180);
            }
        } else {
            inner.classList.remove('flipped');
            const video = document.getElementById('fc-back-video');
            if (video) video.pause();
        }
    }

    // Rate card & advance Leitner SRS
    function rateCard(rating) {
        if (currentIndex >= currentDeck.length) return;
        const card = currentDeck[currentIndex];
        const srsData = loadSrsData();
        const now = Date.now();

        let srsEntry = srsData[card.title] || { box: 1, nextDue: 0, repetitions: 0, lapses: 0 };
        srsEntry.repetitions = (srsEntry.repetitions || 0) + 1;
        srsEntry.lastReviewed = now;

        sessionStats.reviewed++;

        if (rating === 1) {
            // Hard / Lapsed: Drop back to Box 1, due today, re-append to session end
            srsEntry.box = 1;
            srsEntry.lapses = (srsEntry.lapses || 0) + 1;
            srsEntry.nextDue = now;
            // Append back to end of current deck so user encounters it again this session!
            currentDeck.push({ ...card, srs: srsEntry });
        } else if (rating === 2) {
            // Good: Advance to box 2 or 3
            srsEntry.box = Math.min((srsEntry.box || 1) + 1, 3);
            const intervalDays = BOX_INTERVALS_DAYS[srsEntry.box] || 2;
            srsEntry.nextDue = now + intervalDays * 24 * 60 * 60 * 1000;
            sessionStats.xpEarned += 2;
        } else if (rating === 3) {
            // Mastered: Advance to Box 4 (+14 days), award bonus XP
            srsEntry.box = 4;
            srsEntry.nextDue = now + BOX_INTERVALS_DAYS[4] * 24 * 60 * 60 * 1000;
            sessionStats.mastered++;
            sessionStats.xpEarned += 5;

            // Award points globally if system supports it
            if (typeof window.addPoints === 'function') {
                window.addPoints(5);
            }
        }

        srsData[card.title] = srsEntry;
        saveSrsData(srsData);

        // Pause current video before moving
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        // Advance index
        currentIndex++;
        renderCard();
    }

    // Open Flashcard Studio Modal
    function openFlashcardStudio(disc, mode) {
        currentDiscipline = disc || currentDiscipline;
        currentMode = mode || currentMode;

        currentDeck = buildSessionQueue(currentDiscipline, currentMode);
        currentIndex = 0;
        isFlipped = false;
        sessionStats = { reviewed: 0, mastered: 0, xpEarned: 0 };

        const modal = document.getElementById('fe-flashcards-modal');
        const card = document.getElementById('flashcard-studio-card');
        if (!modal) return;

        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            if (card) {
                card.classList.remove('scale-95', 'opacity-0');
                card.classList.add('scale-100', 'opacity-100');
            }
        });

        // Set select values
        const discSelect = document.getElementById('fc-discipline-select');
        const modeSelect = document.getElementById('fc-mode-select');
        if (discSelect) discSelect.value = currentDiscipline;
        if (modeSelect) modeSelect.value = currentMode;

        renderCard();
    }

    // Close Flashcard Studio Modal
    function closeFlashcardStudio() {
        const modal = document.getElementById('fe-flashcards-modal');
        const card = document.getElementById('flashcard-studio-card');
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        if (modal) {
            modal.classList.add('opacity-0');
            if (card) {
                card.classList.remove('scale-100', 'opacity-100');
                card.classList.add('scale-95', 'opacity-0');
            }
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 250);
        }
    }

    // Restart session
    function restartFlashcardSession() {
        openFlashcardStudio(currentDiscipline, currentMode);
    }

    // Attach Keyboard Hotkeys
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('fe-flashcards-modal');
        if (!modal || modal.classList.contains('hidden')) return;

        // Avoid triggering if user is focused on a select element
        if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return;

        if (e.code === 'Escape') {
            e.preventDefault();
            closeFlashcardStudio();
        } else if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            flipCard();
        } else if (e.key === '1' || e.code === 'ArrowLeft') {
            e.preventDefault();
            rateCard(1);
        } else if (e.key === '2' || e.code === 'ArrowDown') {
            e.preventDefault();
            rateCard(2);
        } else if (e.key === '3' || e.code === 'ArrowRight') {
            e.preventDefault();
            rateCard(3);
        }
    });

    // Wire dropdown change events
    document.addEventListener('DOMContentLoaded', () => {
        const discSelect = document.getElementById('fc-discipline-select');
        const modeSelect = document.getElementById('fc-mode-select');

        if (discSelect) {
            discSelect.addEventListener('change', (e) => {
                currentDiscipline = e.target.value;
                openFlashcardStudio(currentDiscipline, currentMode);
            });
        }

        if (modeSelect) {
            modeSelect.addEventListener('change', (e) => {
                currentMode = e.target.value;
                openFlashcardStudio(currentDiscipline, currentMode);
            });
        }
    });

    // Public Window API
    window.openFlashcardStudio = openFlashcardStudio;
    window.closeFlashcardStudio = closeFlashcardStudio;
    window.flipFlashcard = flipCard;
    window.rateFlashcard = rateCard;
    window.restartFlashcardSession = restartFlashcardSession;

})();
