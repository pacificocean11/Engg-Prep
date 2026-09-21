/**
 * FE THEOREM RAPID FLASHCARD STUDIO
 * Part of Engg.tv Prep — NCEES FE Exam Preparation Platform
 */
(function() {
    'use strict';

    let currentDeck = [];
    let currentIndex = 0;
    let isFlipped = false;
    let currentMode = 'recall'; // 'recall' or 'identify'
    let currentDiscipline = 'current';

    // Get active discipline from app or localStorage
    function getActiveDiscipline() {
        if (typeof window.getActiveMotivationDiscipline === 'function') {
            return window.getActiveMotivationDiscipline();
        }
        return localStorage.getItem('enggtv_discipline') || 'Mechanical';
    }

    // Build the theorem queue for current session
    function buildSessionQueue(disc, mode) {
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

        return allTheorems;
    }

    // Render current card state
    function renderCard() {
        const modal = document.getElementById('fe-flashcards-modal');
        if (!modal || modal.classList.contains('hidden')) return;

        const summaryView = document.getElementById('fc-summary-view');
        const cardTrigger = document.getElementById('fc-card-trigger');
        const ratingDock = document.getElementById('fc-rating-dock');

        if (!currentDeck || currentDeck.length === 0) {
            if (cardTrigger) cardTrigger.classList.add('hidden');
            return;
        }

        if (cardTrigger) cardTrigger.classList.remove('hidden');
        if (summaryView) summaryView.classList.add('hidden');
        if (ratingDock) ratingDock.classList.remove('hidden');

        // Circular wrap-around bounds check
        if (currentIndex < 0) currentIndex = currentDeck.length - 1;
        if (currentIndex >= currentDeck.length) currentIndex = 0;

        const card = currentDeck[currentIndex];
        isFlipped = false;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');

        // Update flip button text
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = 'Flip Card';

        // Update Header Progress
        const progressText = document.getElementById('fc-progress-text');
        const progressBar = document.getElementById('fc-session-progress-bar');

        if (progressText) progressText.textContent = `Card ${currentIndex + 1} of ${currentDeck.length}`;
        if (progressBar) {
            const pct = Math.round(((currentIndex + 1) / currentDeck.length) * 100);
            progressBar.style.width = `${Math.max(2, pct)}%`;
        }

        // Card Front Fields
        const cardDisc = document.getElementById('fc-card-discipline');
        const cardLvl = document.getElementById('fc-card-level-badge');
        const frontPrompt = document.getElementById('fc-front-prompt-label');
        const frontTitle = document.getElementById('fc-front-title');
        const frontFormulaView = document.getElementById('fc-front-formula-view');
        const frontHint = document.getElementById('fc-front-hint');

        if (cardDisc) cardDisc.textContent = `${card.disc || getActiveDiscipline()} FE Focus`;
        if (cardLvl) {
            cardLvl.textContent = `#${currentIndex + 1} of ${currentDeck.length}`;
            cardLvl.className = 'text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 px-2.5 py-0.5 rounded-full border border-purple-500/30';
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
        if (currentDeck.length === 0) return;
        const inner = document.getElementById('fc-flip-inner');
        if (!inner) return;

        isFlipped = !isFlipped;
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = isFlipped ? 'View Front' : 'Flip Card';

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

    // Previous card action
    function prevCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
        renderCard();
    }

    // Next card action
    function nextCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        currentIndex = (currentIndex + 1) % currentDeck.length;
        renderCard();
    }

    // Shuffle deck
    function shuffleCards() {
        if (currentDeck.length <= 1) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        for (let i = currentDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentDeck[i], currentDeck[j]] = [currentDeck[j], currentDeck[i]];
        }
        currentIndex = 0;
        renderCard();
    }

    // Open Flashcard Studio Modal
    function openFlashcardStudio(disc, mode) {
        currentDiscipline = disc || currentDiscipline;
        currentMode = mode || currentMode;

        currentDeck = buildSessionQueue(currentDiscipline, currentMode);
        currentIndex = 0;
        isFlipped = false;

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

    // Attach Keyboard Hotkeys
    document.addEventListener('keydown', (e) => {
        const modal = document.getElementById('fe-flashcards-modal');
        if (!modal || modal.classList.contains('hidden')) return;

        if (e.target && (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT')) return;

        if (e.code === 'Escape') {
            e.preventDefault();
            closeFlashcardStudio();
        } else if (e.code === 'Space' || e.code === 'Enter') {
            e.preventDefault();
            flipCard();
        } else if (e.code === 'ArrowLeft') {
            e.preventDefault();
            prevCard();
        } else if (e.code === 'ArrowRight') {
            e.preventDefault();
            nextCard();
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
    window.prevFlashcard = prevCard;
    window.nextFlashcard = nextCard;
    window.shuffleFlashcards = shuffleCards;
    // Backwards compatibility aliases
    window.rateFlashcard = nextCard;
    window.restartFlashcardSession = () => openFlashcardStudio(currentDiscipline, currentMode);

})();
