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
    let activeMediaTab = 'video'; // 'video' or 'blueprint'

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
        // =========================================================================
    // Instant Image Preloader & Decoded Memory Cache (Eliminates Flashcard Lag)
    // =========================================================================
    const preloadedImageCache = new Map();

    function preloadCardImage(url) {
        if (!url || preloadedImageCache.has(url)) return;
        const img = new Image();
        img.decoding = 'async';
        img.loading = 'eager';
        img.src = url;
        preloadedImageCache.set(url, img);
        if (img.decode) {
            img.decode().catch(() => {});
        }
    }

    function preloadAdjacentCardImages(index, lookaheadCount = 6) {
        if (!currentDeck || !currentDeck.length) return;
        const total = currentDeck.length;
        // Preload upcoming lookaheadCount cards (primary navigation direction)
        for (let offset = 1; offset <= lookaheadCount; offset++) {
            const nextIdx = (index + offset) % total;
            const nextCard = currentDeck[nextIdx];
            if (nextCard && nextCard.imageUrl) {
                preloadCardImage(nextCard.imageUrl);
            }
        }
        // Preload previous 2 cards (backward navigation)
        for (let offset = 1; offset <= 2; offset++) {
            const prevIdx = (index - offset + total) % total;
            const prevCard = currentDeck[prevIdx];
            if (prevCard && prevCard.imageUrl) {
                preloadCardImage(prevCard.imageUrl);
            }
        }
    }

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
        // Lookahead Preloader: Warm up upcoming card images in the background
        preloadAdjacentCardImages(currentIndex, 6);
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

        // Responsive Front Blueprint Image Setup (Visible on Desktop/Laptop/Tablet, Hidden on Mobile Phones)
        const hasImage = Boolean(card.imageUrl);
        const frontGrid = document.getElementById('fc-front-grid');
        const frontTextCol = document.getElementById('fc-front-text-col');
        const frontImgCol = document.getElementById('fc-front-image-col');
        const frontImg = document.getElementById('fc-front-image');
        const frontImgContainer = document.getElementById('fc-front-image-container');
        const frontCaptionText = document.getElementById('fc-front-caption-text');

        if (hasImage) {
            if (frontImgCol) {
                frontImgCol.classList.remove('hidden');
                frontImgCol.className = 'hidden md:flex md:col-span-5 flex-col items-center justify-center shrink-0 w-full transition-all duration-300';
            }
            if (frontGrid) {
                frontGrid.className = 'w-full max-w-6xl grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-10 items-center justify-center transition-all duration-300';
            }
            if (frontTextCol) {
                frontTextCol.className = 'w-full md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left gap-3 transition-all duration-300';
            }
            if (frontImg) {
                frontImg.alt = card.imageTitle || card.title || 'Technical Diagram';
                frontImg.decoding = 'async';
                frontImg.loading = 'eager';

                const cached = preloadedImageCache.get(card.imageUrl);
                const isAlreadyLoaded = (frontImg.src && frontImg.src.endsWith(card.imageUrl) && frontImg.complete && frontImg.naturalWidth > 0) ||
                                        (cached && cached.complete && cached.naturalWidth > 0);

                if (isAlreadyLoaded) {
                    frontImg.src = card.imageUrl;
                    frontImg.classList.remove('opacity-0');
                    frontImg.classList.add('opacity-100');
                } else {
                    frontImg.classList.remove('opacity-100');
                    frontImg.classList.add('opacity-0');
                    frontImg.onload = function() {
                        frontImg.classList.remove('opacity-0');
                        frontImg.classList.add('opacity-100');
                    };
                    frontImg.src = card.imageUrl;
                }
            }
            if (frontCaptionText) {
                frontCaptionText.textContent = card.imageTitle || 'Technical Illustration Blueprint';
            }
            if (frontImgContainer) {
                frontImgContainer.onclick = function(e) {
                    if (e && e.stopPropagation) e.stopPropagation();
                    openBlueprintLightbox(e);
                };
            }
        } else {
            if (frontImgCol) {
                frontImgCol.className = 'hidden';
            }
            if (frontGrid) {
                frontGrid.className = 'w-full max-w-5xl flex flex-col items-center justify-center text-center gap-4 transition-all duration-300';
            }
            if (frontTextCol) {
                frontTextCol.className = 'w-full flex flex-col items-center justify-center text-center gap-3 transition-all duration-300';
            }
            if (frontImg) {
                frontImg.removeAttribute('src');
            }
        }

        // Card Back Fields
        const backTitle = document.getElementById('fc-back-title');
        const backFormula = document.getElementById('fc-back-formula');
        const backDesc = document.getElementById('fc-back-desc');
        const backTip = document.getElementById('fc-back-tip');

        if (backTitle) backTitle.innerHTML = card.title || '';
        if (backFormula) backFormula.innerHTML = card.formula || '';
        if (backDesc) backDesc.innerHTML = card.description || '';
        if (backTip) backTip.innerHTML = card.examTip || '';

        // If card is currently flipped, typeset back math now
        if (isFlipped) {
            triggerMathTypeset([backFormula, backDesc, backTip, backTitle]);
        }

        // Responsive Media Layout on Back (Video prominent; Blueprint moved to front face)
        const hasVideo = Boolean(card.videoUrl);
        const backColVideo = document.getElementById('fc-back-col-video');
        const backColPrimary = document.getElementById('fc-back-col-primary');
        const mediaSwitcher = document.getElementById('fc-media-switcher');
        const mediaStaticHeader = document.getElementById('fc-media-static-header');
        const headerIcon = document.getElementById('fc-media-header-icon');
        const headerLabel = document.getElementById('fc-media-header-label');
        const videoDur = document.getElementById('fc-back-video-duration');
        const backVideo = document.getElementById('fc-back-video');
        const backImg = document.getElementById('fc-back-image');
        const backVideoContainer = document.getElementById('fc-back-video-container');
        const backImgContainer = document.getElementById('fc-back-image-container');

        if (hasVideo) {
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'w-full lg:col-span-7 flex flex-col space-y-2 mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'w-full lg:col-span-5 flex flex-col justify-between space-y-3';
            }

            if (backVideo) {
                backVideo.src = card.videoUrl;
                backVideo.load();
            }

            if (backVideoContainer) backVideoContainer.classList.remove('hidden');
            if (backImgContainer) backImgContainer.classList.add('hidden');

            // Hide tab switcher - technical blueprint image is now prominently displayed on the front side of the card!
            if (mediaSwitcher) {
                mediaSwitcher.classList.add('hidden');
                mediaSwitcher.classList.remove('flex');
            }
            if (mediaStaticHeader) mediaStaticHeader.classList.remove('hidden');
            if (headerIcon) {
                headerIcon.textContent = 'smart_display';
                headerIcon.className = 'material-symbols-outlined text-[15px] text-cyan-400';
            }
            if (headerLabel) {
                headerLabel.textContent = '10s Video Explainer';
                headerLabel.className = 'text-[10px] font-black uppercase tracking-widest text-cyan-400';
            }
            if (videoDur) {
                videoDur.textContent = card.videoDuration || '10s';
            }
            activeMediaTab = 'video';
        } else if (hasImage) {
            // Blueprint fallback on back only if no video exists
            if (backColVideo) {
                backColVideo.classList.remove('hidden');
                backColVideo.className = 'w-full lg:col-span-7 flex flex-col space-y-2 mt-2 lg:mt-0';
            }
            if (backColPrimary) {
                backColPrimary.className = 'w-full lg:col-span-5 flex flex-col justify-between space-y-3';
            }
            if (mediaSwitcher) {
                mediaSwitcher.classList.add('hidden');
                mediaSwitcher.classList.remove('flex');
            }
            if (mediaStaticHeader) mediaStaticHeader.classList.remove('hidden');
            if (headerIcon) {
                headerIcon.textContent = 'architecture';
                headerIcon.className = 'material-symbols-outlined text-[15px] text-purple-400';
            }
            if (headerLabel) {
                headerLabel.textContent = 'Technical Blueprint';
                headerLabel.className = 'text-[10px] font-black uppercase tracking-widest text-purple-400';
            }
            if (backImg) {
                backImg.alt = card.imageTitle || card.title || 'Technical Blueprint Diagram';
                backImg.decoding = 'async';
                backImg.loading = 'eager';

                const cached = preloadedImageCache.get(card.imageUrl);
                const isAlreadyLoaded = (backImg.src && backImg.src.endsWith(card.imageUrl) && backImg.complete && backImg.naturalWidth > 0) ||
                                        (cached && cached.complete && cached.naturalWidth > 0);

                if (isAlreadyLoaded) {
                    backImg.src = card.imageUrl;
                    backImg.classList.remove('opacity-0');
                    backImg.classList.add('opacity-100');
                } else {
                    backImg.classList.remove('opacity-100');
                    backImg.classList.add('opacity-0');
                    backImg.onload = function() {
                        backImg.classList.remove('opacity-0');
                        backImg.classList.add('opacity-100');
                    };
                    backImg.src = card.imageUrl;
                }
                if (backImgContainer) {
                    backImgContainer.onclick = openBlueprintLightbox;
                }
            }
            setMediaTab('blueprint');
        } else {
            // Neither video nor image exists
            if (backColVideo) backColVideo.classList.add('hidden');
            if (backColPrimary) {
                backColPrimary.className = 'w-full sm:col-span-12 max-w-2xl lg:max-w-4xl mx-auto space-y-4';
            }
            if (backVideo) {
                backVideo.pause();
                backVideo.removeAttribute('src');
            }
        }

        // Initialize In-Video Karaoke Captions
        initKaraokeCues(card);
        wireKaraokeVideoEvents();
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

    
    // Set active media tab (Option A: Switch between Video and Blueprint Diagram)
    function setMediaTab(tab) {
        activeMediaTab = tab;
        const videoContainer = document.getElementById('fc-back-video-container');
        const imageContainer = document.getElementById('fc-back-image-container');
        const btnVideo = document.getElementById('fc-toggle-btn-video');
        const btnBlueprint = document.getElementById('fc-toggle-btn-blueprint');
        const subtext = document.getElementById('fc-media-subtext');
        const video = document.getElementById('fc-back-video');
        const badge = document.getElementById('fc-back-video-duration');

        if (tab === 'blueprint') {
            if (videoContainer) videoContainer.classList.add('hidden');
            if (imageContainer) imageContainer.classList.remove('hidden');
            if (subtext) subtext.textContent = 'Click diagram to zoom in full resolution';
            if (badge) badge.textContent = 'HD CAD';

            if (btnBlueprint) {
                btnBlueprint.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 bg-purple-500/25 text-purple-300 border border-purple-500/40 shadow-sm';
            }
            if (btnVideo) {
                btnVideo.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-slate-200';
            }
            if (video) video.pause();
        } else {
            if (imageContainer) imageContainer.classList.add('hidden');
            if (videoContainer) videoContainer.classList.remove('hidden');
            if (subtext) subtext.textContent = 'Auto-plays on flip • Tap for controls';

            const card = currentDeck[currentIndex];
            if (badge) badge.textContent = (card && card.videoDuration) || '10s';

            if (btnVideo) {
                btnVideo.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm';
            }
            if (btnBlueprint) {
                btnBlueprint.className = 'px-2.5 py-0.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 text-slate-400 hover:text-slate-200';
            }
            if (isFlipped && video && card && card.videoUrl) {
                const p = video.play();
                if (p !== undefined) p.catch(() => {});
            }
        }
        updateKaraokeUI();
    }

            // =========================================================================
    // In-Video Karaoke Captions Engine
    // =========================================================================
    // Default to OFF unless explicitly activated by the user
    let karaokeActive = localStorage.getItem('engg_fc_karaoke') === 'true';
    let currentActiveCueIndex = -1;

    function toggleKaraokeCaptions() {
        karaokeActive = !karaokeActive;
        try { localStorage.setItem('engg_fc_karaoke', karaokeActive); } catch (e) {}
        updateKaraokeUI();
    }

    /**
     * Retrieves precision captions or dynamically generates karaoke cues on-the-fly
     * for any 10-second NCEES theorem explainer video across all disciplines.
     */
    function getCardCaptions(card) {
        if (!card || !card.videoUrl) return [];
        if (card.captions && Array.isArray(card.captions) && card.captions.length > 0) {
            return card.captions;
        }

        const cues = [];
        const dur = 10.0;

        // Phase 1 (0.0s - 4.4s): Concept & Core Principle
        let p1Text = card.title || '';
        if (card.description) {
            const rawSentence = card.description.split('.')[0].trim();
            p1Text = `${card.title}: ${rawSentence}.`;
        }
        const words1 = p1Text.split(/\s+/).filter(Boolean);
        const p1Duration = 4.4;
        const wDur1 = p1Duration / Math.max(words1.length, 1);
        const timedWords1 = words1.map((w, idx) => ({
            text: w,
            start: parseFloat((idx * wDur1).toFixed(2)),
            end: parseFloat(((idx + 1) * wDur1).toFixed(2))
        }));
        cues.push({
            start: 0.0,
            end: 4.4,
            words: timedWords1
        });

        // Phase 2 (4.4s - 7.6s): Governing Formula (displayed in live MathJax without word-splitting)
        if (card.formula) {
            cues.push({
                start: 4.4,
                end: 7.6,
                isEquation: true,
                text: card.formula
            });
        }

        // Phase 3 (7.6s - 10.0s): NCEES Exam Trap & Key Tip
        let p3Text = card.examTip || 'Found in NCEES FE Reference Handbook. Review core assumptions!';
        const cleanTip = p3Text.replace(/^Search NCEES Handbook under [^.]*\.\s*/i, '').trim();
        const tipSentence = cleanTip.split('.')[0] || cleanTip;
        const p3Display = `Exam Tip: ${tipSentence}!`;
        const words3 = p3Display.split(/\s+/).filter(Boolean);
        const p3Start = card.formula ? 7.6 : 4.6;
        const p3Duration = dur - p3Start;
        const wDur3 = p3Duration / Math.max(words3.length, 1);
        const timedWords3 = words3.map((w, idx) => ({
            text: w,
            start: parseFloat((p3Start + idx * wDur3).toFixed(2)),
            end: parseFloat((p3Start + (idx + 1) * wDur3).toFixed(2))
        }));
        cues.push({
            start: p3Start,
            end: dur,
            words: timedWords3
        });

        return cues;
    }

    function updateKaraokeUI() {
        const btn = document.getElementById('fc-btn-toggle-captions');
        const statusText = document.getElementById('fc-caption-status-text');
        const overlay = document.getElementById('fc-video-caption-overlay');
        const box = document.getElementById('fc-karaoke-box');
        const card = currentDeck[currentIndex];
        const captions = getCardCaptions(card);
        const hasCaptions = Boolean(card && card.videoUrl && captions.length > 0);

        if (!hasCaptions || activeMediaTab !== 'video') {
            if (btn) {
                btn.classList.add('hidden');
                btn.classList.remove('flex');
            }
            if (overlay) overlay.classList.add('hidden');
            if (box) box.classList.add('hidden');
            return;
        }

        if (btn) {
            btn.classList.remove('hidden');
            btn.classList.add('flex');
            if (karaokeActive) {
                btn.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-cyan-500/20 text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/30 cursor-pointer shadow-sm';
                if (statusText) statusText.textContent = 'CC On';
            } else {
                btn.className = 'flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all border bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200 cursor-pointer';
                if (statusText) statusText.textContent = 'CC Off';
            }
        }

        if (overlay) {
            if (karaokeActive) {
                overlay.classList.remove('hidden');
            } else {
                overlay.classList.add('hidden');
                if (box) box.classList.add('hidden');
            }
        }
    }

    function initKaraokeCues(card) {
        currentActiveCueIndex = -1;
        const textEl = document.getElementById('fc-karaoke-text');
        const box = document.getElementById('fc-karaoke-box');
        if (textEl) textEl.innerHTML = '';
        if (box) box.classList.add('hidden');
        updateKaraokeUI();
    }

    function renderKaraokeCue(cue, cueIndex) {
        currentActiveCueIndex = cueIndex;
        const textEl = document.getElementById('fc-karaoke-text');
        const box = document.getElementById('fc-karaoke-box');
        if (!textEl || !box) return;

        box.classList.remove('hidden');

        if (cue.isEquation) {
            // Presenter is showing/stating the equation: render full MathJax formula with Apple dock badge
            textEl.innerHTML = `<div class="inline-flex items-center gap-2.5 py-0.5 px-2 font-mono tracking-wide text-sm sm:text-base text-cyan-300"><span class="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-400/35 shadow-sm">NCEES Equation</span><span>${cue.text}</span></div>`;
            triggerMathTypeset([textEl]);
        } else if (cue.words && Array.isArray(cue.words)) {
            // Render Karaoke words
            textEl.innerHTML = cue.words.map((w, idx) => {
                return `<span class="fc-karaoke-word" data-idx="${idx}" data-start="${w.start}" data-end="${w.end}">${w.text}</span>`;
            }).join(' ');
        } else if (cue.text) {
            textEl.textContent = cue.text;
        }
    }

    function wireKaraokeVideoEvents() {
        const video = document.getElementById('fc-back-video');
        if (!video || video._karaokeWired) return;
        video._karaokeWired = true;

        video.addEventListener('timeupdate', () => {
            const card = currentDeck[currentIndex];
            const overlay = document.getElementById('fc-video-caption-overlay');
            const box = document.getElementById('fc-karaoke-box');
            const textEl = document.getElementById('fc-karaoke-text');
            const captions = getCardCaptions(card);

            if (!card || !card.videoUrl || captions.length === 0 || !karaokeActive) {
                if (box) box.classList.add('hidden');
                return;
            }

            const t = video.currentTime;
            const newIndex = captions.findIndex(c => t >= c.start && t < c.end);

            if (newIndex === -1) {
                currentActiveCueIndex = -1;
                if (box) box.classList.add('hidden');
                return;
            }

            const activeCue = captions[newIndex];

            // If cue index changed, rebuild the cue content
            if (newIndex !== currentActiveCueIndex) {
                renderKaraokeCue(activeCue, newIndex);
            }

            // If cue has words, update the instant Karaoke highlight
            if (activeCue.words && textEl) {
                const wordSpans = textEl.querySelectorAll('.fc-karaoke-word');
                wordSpans.forEach(span => {
                    const start = parseFloat(span.dataset.start);
                    const end = parseFloat(span.dataset.end);
                    if (t < start) {
                        span.className = 'fc-karaoke-word';
                    } else if (t >= start && t < end) {
                        span.className = 'fc-karaoke-word is-active';
                    } else {
                        span.className = 'fc-karaoke-word is-spoken';
                    }
                });
            }
        });
    }

    // Open Blueprint Lightbox
    function openBlueprintLightbox() {
        const card = currentDeck[currentIndex];
        if (!card || !card.imageUrl) return;
        const lightbox = document.getElementById('fc-blueprint-lightbox');
        const img = document.getElementById('fc-lightbox-img');
        const title = document.getElementById('fc-lightbox-title');
        if (img) img.src = card.imageUrl;
        if (title) {
            title.innerHTML = `<span class="material-symbols-outlined text-[18px]">architecture</span><span>${card.imageTitle || card.title || 'Technical Blueprint Diagram'}</span>`;
        }
        if (lightbox) {
            lightbox.classList.remove('hidden');
            lightbox.classList.add('flex');
        }
    }

    // Close Blueprint Lightbox
    function closeBlueprintLightbox() {
        const lightbox = document.getElementById('fc-blueprint-lightbox');
        if (lightbox) {
            lightbox.classList.add('hidden');
            lightbox.classList.remove('flex');
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

            const card = currentDeck[currentIndex];
            const backFormula = document.getElementById('fc-back-formula');
            const backDesc = document.getElementById('fc-back-desc');
            const backTip = document.getElementById('fc-back-tip');
            const backTitle = document.getElementById('fc-back-title');

            if (card) {
                if (backTitle) backTitle.innerHTML = card.title || '';
                if (backFormula) backFormula.innerHTML = card.formula || '';
                if (backDesc) backDesc.innerHTML = card.description || '';
                if (backTip) backTip.innerHTML = card.examTip || '';
            }

            const backEls = [backFormula, backDesc, backTip, backTitle].filter(Boolean);
            // Trigger typeset immediately and staggered across 3D rotation
            triggerMathTypeset(backEls);
            setTimeout(() => triggerMathTypeset(backEls), 120);
            setTimeout(() => triggerMathTypeset(backEls), 320);

            // Auto-play explainer video if present
            if (card && card.videoUrl && activeMediaTab === 'video') {
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

        // Always return to front face when navigating cards
        isFlipped = false;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = 'Flip Card';

        currentIndex = (currentIndex - 1 + currentDeck.length) % currentDeck.length;
        renderCard();
    }

    // Next card action
    function nextCard() {
        if (currentDeck.length === 0) return;
        const video = document.getElementById('fc-back-video');
        if (video) video.pause();

        // Always return to front face when navigating cards
        isFlipped = false;
        const inner = document.getElementById('fc-flip-inner');
        if (inner) inner.classList.remove('flipped');
        const flipBtnText = document.getElementById('fc-flip-btn-text');
        if (flipBtnText) flipBtnText.textContent = 'Flip Card';

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

        // Immediately preload first 8 cards in this session
        if (currentDeck && currentDeck.length > 0) {
            for (let i = 0; i < Math.min(8, currentDeck.length); i++) {
                if (currentDeck[i].imageUrl) preloadCardImage(currentDeck[i].imageUrl);
            }
        }

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
            const lb = document.getElementById('fc-blueprint-lightbox');
            if (lb && !lb.classList.contains('hidden')) {
                e.preventDefault();
                closeBlueprintLightbox();
                return;
            }
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

    // Re-typeset active flashcard when MathJax finishes loading asynchronously
    window.addEventListener('mathjax-ready', () => {
        const modal = document.getElementById('fe-flashcards-modal');
        if (modal && !modal.classList.contains('hidden')) {
            renderCard();
            if (isFlipped) {
                const backFormula = document.getElementById('fc-back-formula');
                const backDesc = document.getElementById('fc-back-desc');
                const backTip = document.getElementById('fc-back-tip');
                const backTitle = document.getElementById('fc-back-title');
                const backEls = [backFormula, backDesc, backTip, backTitle].filter(Boolean);
                triggerMathTypeset(backEls);
            }
        }
    });

    // Public Window API
    window.setMediaTab = setMediaTab;
    window.openBlueprintLightbox = openBlueprintLightbox;
    window.closeBlueprintLightbox = closeBlueprintLightbox;
    window.openFlashcardStudio = openFlashcardStudio;
    window.closeFlashcardStudio = closeFlashcardStudio;
    window.flipFlashcard = flipCard;
    window.prevFlashcard = prevCard;
    window.nextFlashcard = nextCard;
    window.shuffleFlashcards = shuffleCards;
    window.toggleKaraokeCaptions = toggleKaraokeCaptions;
    window.toggleTeleprompter = toggleKaraokeCaptions;
    // Backwards compatibility aliases
    window.rateFlashcard = nextCard;
    window.restartFlashcardSession = () => openFlashcardStudio(currentDiscipline, currentMode);

})();

    // Idle Background Preloader for Flashcard Blueprints
    if (typeof window !== 'undefined') {
        const idlePreloadTheorems = () => {
            try {
                const datasets = window.THEOREMS_BY_DISCIPLINE || {};
                let count = 0;
                for (const d of Object.keys(datasets)) {
                    for (const t of datasets[d]) {
                        if (t && t.imageUrl && !preloadedImageCache.has(t.imageUrl)) {
                            preloadCardImage(t.imageUrl);
                            count++;
                            if (count >= 15) return;
                        }
                    }
                }
            } catch (err) {}
        };
        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(idlePreloadTheorems, { timeout: 3000 });
        } else {
            setTimeout(idlePreloadTheorems, 2000);
        }
    }
