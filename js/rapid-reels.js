/**
 * ENGG.tv - Vertical "Rapid Reels" Flashcard Video Swiping Engine
 * High-octane vertical micro-learning feed with synced karaoke captions,
 * gesture swiping, handbook formula peek, and Leitner spaced repetition.
 */
(function() {
    'use strict';

    let currentReelsDeck = [];
    let currentReelIndex = 0;
    let isMuted = false;
    let playbackSpeed = 1.0;
    let isReelsActive = false;
    let karaokeActive = false; // Closed captioning is OFF by default as requested
    let activeDiscipline = 'Mechanical';
    let activeSubjectFilter = 'all';
    let touchStartY = 0;
    let touchStartX = 0;
    let touchStartTime = 0;
    let isSwiping = false;
    let wheelThrottleTimer = null;
    let lastTapTime = 0;



    // Load saved favorites from localStorage
    function getSavedReels() {
        try {
            const raw = localStorage.getItem('enggtv_saved_reels');
            return raw ? JSON.parse(raw) : [];
        } catch (e) {
            return [];
        }
    }

    function saveReelFavorite(cardTitle) {
        const saved = getSavedReels();
        const idx = saved.indexOf(cardTitle);
        if (idx === -1) {
            saved.push(cardTitle);
        } else {
            saved.splice(idx, 1);
        }
        try {
            localStorage.setItem('enggtv_saved_reels', JSON.stringify(saved));
        } catch (e) {}
        return saved.includes(cardTitle);
    }

    function isReelFavorite(cardTitle) {
        return getSavedReels().includes(cardTitle);
    }

    // Build video reels queue for current discipline and subject
    function buildReelsQueue(disc, subjectFilter = 'all') {
        const datasets = window.THEOREMS_BY_DISCIPLINE || {};
        let actualDisc = disc || localStorage.getItem('enggtv_discipline') || 'Mechanical';
        if (actualDisc === 'current') {
            actualDisc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
        }

        let list = [];
        if (actualDisc === 'all') {
            Object.keys(datasets).forEach(d => {
                (datasets[d] || []).forEach(t => list.push({ ...t, disc: d }));
            });
        } else {
            list = (datasets[actualDisc] || []).map(t => ({ ...t, disc: actualDisc }));
        }

        // Only include cards with video URL
        list = list.filter(c => Boolean(c && c.videoUrl));

        // Attach subject metadata if available
        if (window.DISCIPLINE_SUBJECT_CONFIG && window.DISCIPLINE_SUBJECT_CONFIG[actualDisc]) {
            const config = window.DISCIPLINE_SUBJECT_CONFIG[actualDisc];
            list.forEach(card => {
                card.subjectId = config.getSubjectId(card.title, card.examTip, card.description);
                const subObj = config.list.find(s => s.id === card.subjectId);
                card.subjectName = subObj ? subObj.name : config.defaultName;
            });

            if (subjectFilter && subjectFilter !== 'all') {
                const targetSubId = Number(subjectFilter);
                list = list.filter(card => card.subjectId === targetSubId);
            }
        }

        return list;
    }

    // Open Rapid Reels Viewer
    function openRapidReels(disc, subjectFilter = 'all', initialIndex = 0) {
        activeDiscipline = disc || localStorage.getItem('enggtv_discipline') || 'Mechanical';
        activeSubjectFilter = subjectFilter || 'all';

        // Close Classic Flashcard Studio if open
        const classicModal = document.getElementById('fe-flashcards-modal');
        if (classicModal && !classicModal.classList.contains('hidden')) {
            const classicVideo = document.getElementById('fc-back-video');
            if (classicVideo) classicVideo.pause();
            classicModal.classList.add('hidden', 'opacity-0');
        }

        currentReelsDeck = buildReelsQueue(activeDiscipline, activeSubjectFilter);
        if (!currentReelsDeck.length) {
            // Fallback to Mechanical if deck is empty
            activeDiscipline = 'Mechanical';
            currentReelsDeck = buildReelsQueue('Mechanical', 'all');
        }

        currentReelIndex = Math.max(0, Math.min(initialIndex, currentReelsDeck.length - 1));
        isReelsActive = true;

        const modal = document.getElementById('fe-reels-modal');
        if (!modal) return;

        modal.classList.remove('hidden');
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            modal.classList.add('opacity-100');
        });

        // Initialize selectors
        populateReelsSubjectSelect();
        renderCurrentReel(false);
        setupReelsGestures();
    }

    // Close Rapid Reels Viewer
    function closeRapidReels(reopenClassic = false) {
        isReelsActive = false;
        const video = document.getElementById('reels-main-video');
        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }

        closeReelsFormulaDrawer();
        closeReelsExampleDrawer();

        const modal = document.getElementById('fe-reels-modal');
        if (modal) {
            modal.classList.remove('opacity-100');
            modal.classList.add('opacity-0');
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 250);
        }

        if (reopenClassic && window.openFlashcardStudio) {
            window.openFlashcardStudio(activeDiscipline, 'recall', activeSubjectFilter);
        }
    }

    // Populate Subject dropdown inside Reels header
    function populateReelsSubjectSelect() {
        const select = document.getElementById('reels-subject-select');
        const discSelect = document.getElementById('reels-discipline-select');
        if (discSelect) {
            discSelect.value = activeDiscipline;
        }

        if (!select) return;
        select.innerHTML = '<option value="all">⚡ All Topics</option>';

        if (window.DISCIPLINE_SUBJECT_CONFIG && window.DISCIPLINE_SUBJECT_CONFIG[activeDiscipline]) {
            const config = window.DISCIPLINE_SUBJECT_CONFIG[activeDiscipline];
            config.list.forEach(sub => {
                const opt = document.createElement('option');
                opt.value = String(sub.id);
                opt.textContent = sub.name;
                select.appendChild(opt);
            });
            select.value = activeSubjectFilter;
            select.classList.remove('hidden');
        } else {
            select.classList.add('hidden');
        }
    }

    // Render Story Segments (Segmented Progress Bar)
    function renderStorySegments() {
        const container = document.getElementById('reels-story-segments');
        if (!container || !currentReelsDeck.length) return;

        const total = currentReelsDeck.length;
        const visibleSegments = Math.min(total, 24); // Cap segments visually to prevent overflow
        const activeSegmentIdx = Math.floor((currentReelIndex / total) * visibleSegments);

        let html = '';
        for (let i = 0; i < visibleSegments; i++) {
            const isCompleted = i < activeSegmentIdx;
            const isCurrent = i === activeSegmentIdx;
            const fillWidth = isCompleted ? '100%' : (isCurrent ? '100%' : '0%');
            const opacity = isCompleted ? 'opacity-80' : (isCurrent ? 'opacity-100' : 'opacity-30');
            html += `<div class="reels-story-segment ${opacity}">
                <div class="reels-story-fill" style="width: ${fillWidth};"></div>
            </div>`;
        }
        container.innerHTML = html;
    }

    // Render Current Reel
    function renderCurrentReel(slideDirection = false) {
        if (!currentReelsDeck.length) return;

        const card = currentReelsDeck[currentReelIndex];
        if (!card) return;

        // Update Counter
        const counterEl = document.getElementById('reels-counter-badge');
        if (counterEl) {
            counterEl.textContent = `${currentReelIndex + 1} / ${currentReelsDeck.length}`;
        }

        // Update Title & Subject Info
        const titleEl = document.getElementById('reels-card-title');
        const subjectEl = document.getElementById('reels-card-subject');
        const formulaPreviewEl = document.getElementById('reels-card-formula-preview');

        if (titleEl) titleEl.textContent = card.title || 'FE Theorem';
        if (subjectEl) subjectEl.textContent = card.subjectName || card.disc || 'General Engineering';

        if (formulaPreviewEl) {
            if (card.formula) {
                let fmt = String(card.formula).trim();
                if (!fmt.startsWith('$')) fmt = `$$${fmt}$$`;
                formulaPreviewEl.innerHTML = fmt;
                formulaPreviewEl.classList.remove('hidden');
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([formulaPreviewEl]).catch(() => {});
                }
            } else {
                formulaPreviewEl.classList.add('hidden');
            }
        }

        // Update Bento Description & Exam Tip
        const bentoDescEl = document.getElementById('reels-bento-desc');
        const bentoTipEl = document.getElementById('reels-bento-tip');
        if (bentoDescEl) {
            bentoDescEl.textContent = card.description || 'Reference formula for NCEES FE CBT Exam.';
        }
        if (bentoTipEl) {
            let tipText = card.examTip || 'Found in the official NCEES Reference Handbook.';
            tipText = tipText.replace(/^Search NCEES Handbook under [^.]*\.\s*/i, '').trim();
            bentoTipEl.textContent = tipText;
        }

        // Dynamic Ambient Glow Shifts with Discipline
        updateAmbientGlow(card.disc || activeDiscipline);

        // Update Action Buttons
        const likeIcon = document.getElementById('reels-like-icon');
        const isFav = isReelFavorite(card.title);
        if (likeIcon) {
            likeIcon.style.color = isFav ? '#f43f5e' : '';
            likeIcon.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
        }

        // Solved Example Button Visibility
        const exampleBtn = document.getElementById('reels-btn-example');
        if (exampleBtn) {
            if (card.solvedExample && card.solvedExample.question) {
                exampleBtn.classList.remove('hidden');
            } else {
                exampleBtn.classList.add('hidden');
            }
        }

        // Close open drawers
        closeReelsFormulaDrawer();
        closeReelsExampleDrawer();

        // Update Stories Progress Segments
        renderStorySegments();

        // Handle Video Setup & Animation
        const video = document.getElementById('reels-main-video');
        const stage = document.getElementById('reels-video-stage');
        const frameContainer = document.getElementById('reels-frame-container');
        const badgeDot = document.getElementById('reels-video-badge-dot');
        const badgeText = document.getElementById('reels-video-badge-text');
        const targetVideoSrc = card.videoUrl;

        // Reset video stage to standard bento stack
        if (stage) stage.classList.remove('reels-mode-vertical-916');
        if (frameContainer) frameContainer.classList.remove('reels-mode-vertical-active');
        if (badgeDot) badgeDot.className = 'w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse';
        if (badgeText) {
            badgeText.textContent = '16:9 HD Explainer';
            badgeText.className = 'text-rose-300 font-bold';
        }

        // Hide karaoke caption box if closed captioning is off (default off)
        const karaokeBox = document.getElementById('reels-karaoke-box');
        if (karaokeBox && !karaokeActive) {
            karaokeBox.classList.add('hidden');
        }

        if (video) {
            // Apply slide transition
            if (slideDirection === 'up') {
                stage.classList.add('reel-slide-up-exit');
            } else if (slideDirection === 'down') {
                stage.classList.add('reel-slide-down-exit');
            }

            setTimeout(() => {
                video.pause();
                video.muted = isMuted;
                video.playbackRate = playbackSpeed;
                video.src = targetVideoSrc;
                video.load();

                const playPromise = video.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => {
                        // Browser prevented unmuted autoplay; mute and retry
                        video.muted = true;
                        isMuted = true;
                        updateReelsMuteUI();
                        video.play().catch(() => {});
                    });
                }

                // Reset and slide in
                stage.classList.remove('reel-slide-up-exit', 'reel-slide-down-exit');
                stage.classList.add('reel-slide-enter');
                setTimeout(() => {
                    stage.classList.remove('reel-slide-enter');
                }, 300);

                // Setup In-Video Karaoke
                initReelsKaraoke(card, video);
            }, slideDirection ? 180 : 0);
        }

        // Preload next reel's video
        preloadNextReel();
    }

    // Dynamic Ambient Glow Shifts with Discipline
    function updateAmbientGlow(disc) {
        const orb1 = document.getElementById('reels-glow-orb-1');
        const orb2 = document.getElementById('reels-glow-orb-2');
        if (!orb1 || !orb2) return;

        const palettes = {
            'Mechanical': {
                orb1: 'from-rose-500/35 via-pink-600/25 to-purple-600/20',
                orb2: 'from-cyan-500/30 via-indigo-600/25 to-emerald-500/20'
            },
            'Civil': {
                orb1: 'from-amber-500/35 via-orange-600/25 to-emerald-600/20',
                orb2: 'from-emerald-500/30 via-teal-600/25 to-cyan-500/20'
            },
            'Electrical and Computer': {
                orb1: 'from-cyan-500/35 via-blue-600/25 to-purple-600/20',
                orb2: 'from-amber-500/30 via-rose-600/25 to-indigo-500/20'
            },
            'Chemical': {
                orb1: 'from-teal-500/35 via-emerald-600/25 to-indigo-600/20',
                orb2: 'from-purple-500/30 via-pink-600/25 to-cyan-500/20'
            },
            'Industrial': {
                orb1: 'from-violet-500/35 via-purple-600/25 to-pink-600/20',
                orb2: 'from-rose-500/30 via-amber-600/25 to-cyan-500/20'
            },
            'Environmental': {
                orb1: 'from-emerald-500/35 via-teal-600/25 to-cyan-600/20',
                orb2: 'from-cyan-500/30 via-blue-600/25 to-emerald-500/20'
            }
        };

        const pal = palettes[disc] || palettes['Mechanical'];
        orb1.className = `absolute -top-12 -left-12 w-80 h-80 bg-gradient-to-br ${pal.orb1} rounded-full blur-[85px] transition-all duration-700`;
        orb2.className = `absolute -bottom-12 -right-12 w-80 h-80 bg-gradient-to-tl ${pal.orb2} rounded-full blur-[90px] transition-all duration-700`;
    }

    // Preload next video in background
    function preloadNextReel() {
        const nextIdx = (currentReelIndex + 1) % currentReelsDeck.length;
        const nextCard = currentReelsDeck[nextIdx];
        if (nextCard && nextCard.videoUrl) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'video';
            link.href = nextCard.videoUrl;
            document.head.appendChild(link);
        }
    }

    // In-Video Karaoke Captions Engine for Reels
    function getCardCues(card) {
        if (!card) return [];
        if (card.captions && Array.isArray(card.captions) && card.captions.length > 0) {
            return card.captions;
        }

        const cues = [];
        const dur = 10.0;

        // Phase 1 (0.0s - 4.4s): Concept
        let p1Text = card.title || '';
        if (card.description) {
            const raw = card.description.split('.')[0].trim();
            p1Text = `${card.title}: ${raw}.`;
        }
        const words1 = p1Text.split(/\s+/).filter(Boolean);
        const wDur1 = 4.4 / Math.max(words1.length, 1);
        const timed1 = words1.map((w, i) => ({
            text: w,
            start: parseFloat((i * wDur1).toFixed(2)),
            end: parseFloat(((i + 1) * wDur1).toFixed(2))
        }));
        cues.push({ start: 0.0, end: 4.4, words: timed1 });

        // Phase 2 (4.4s - 7.6s): Formula Equation
        if (card.formula) {
            cues.push({ start: 4.4, end: 7.6, isEquation: true, text: card.formula });
        }

        // Phase 3 (7.6s - 10.0s): NCEES Exam Trap
        let p3Text = card.examTip || 'Check NCEES Reference Handbook for core variables!';
        p3Text = p3Text.replace(/^Search NCEES Handbook under [^.]*\.\s*/i, '').trim();
        const tipSentence = p3Text.split('.')[0] || p3Text;
        const words3 = `Exam Tip: ${tipSentence}!`.split(/\s+/).filter(Boolean);
        const p3Start = card.formula ? 7.6 : 4.6;
        const wDur3 = (dur - p3Start) / Math.max(words3.length, 1);
        const timed3 = words3.map((w, i) => ({
            text: w,
            start: parseFloat((p3Start + i * wDur3).toFixed(2)),
            end: parseFloat((p3Start + (i + 1) * wDur3).toFixed(2))
        }));
        cues.push({ start: p3Start, end: dur, words: timed3 });

        return cues;
    }

    let currentKaraokeCues = [];
    let currentCueIndex = -1;

    function initReelsKaraoke(card, video) {
        currentKaraokeCues = getCardCues(card);
        currentCueIndex = -1;

        const box = document.getElementById('reels-karaoke-box');
        const textEl = document.getElementById('reels-karaoke-text');
        if (!box || !textEl) return;

        if (!karaokeActive) {
            box.classList.add('hidden');
            return;
        }

        box.classList.remove('hidden');
        textEl.innerHTML = '';

        if (!video._reelsKaraokeWired) {
            video._reelsKaraokeWired = true;
            video.addEventListener('timeupdate', () => {
                if (!isReelsActive || !karaokeActive) return;
                const ct = video.currentTime;
                updateReelsKaraokeTime(ct);
            });
        }
    }

    function updateReelsKaraokeTime(currentTime) {
        const textEl = document.getElementById('reels-karaoke-text');
        const box = document.getElementById('reels-karaoke-box');
        if (!textEl || !box) return;

        const activeIdx = currentKaraokeCues.findIndex(c => currentTime >= c.start && currentTime < c.end);
        if (activeIdx === -1) return;

        if (activeIdx !== currentCueIndex) {
            currentCueIndex = activeIdx;
            const cue = currentKaraokeCues[activeIdx];
            if (cue.isEquation) {
                let fmt = cue.text.trim();
                if (!fmt.startsWith('$')) fmt = `$$${fmt}$$`;
                textEl.innerHTML = `<span class="inline-block px-3 py-1 rounded-xl bg-cyan-950/70 text-cyan-300 border border-cyan-500/30">${fmt}</span>`;
                if (window.MathJax && window.MathJax.typesetPromise) {
                    window.MathJax.typesetPromise([textEl]).catch(() => {});
                }
            } else if (cue.words) {
                textEl.innerHTML = cue.words.map((w, i) => 
                    `<span class="fc-karaoke-word" data-idx="${i}" data-start="${w.start}" data-end="${w.end}">${w.text}</span>`
                ).join(' ');
            }
        }

        // Update word highlights
        const cue = currentKaraokeCues[currentCueIndex];
        if (cue && cue.words) {
            const spans = textEl.querySelectorAll('.fc-karaoke-word');
            spans.forEach(span => {
                const s = parseFloat(span.getAttribute('data-start'));
                const e = parseFloat(span.getAttribute('data-end'));
                if (currentTime < s) {
                    span.className = 'fc-karaoke-word';
                } else if (currentTime >= s && currentTime < e) {
                    span.className = 'fc-karaoke-word is-active';
                } else {
                    span.className = 'fc-karaoke-word is-spoken';
                }
            });
        }
    }

    // Navigation: Next Reel
    function nextReel() {
        if (!currentReelsDeck.length) return;
        currentReelIndex = (currentReelIndex + 1) % currentReelsDeck.length;
        renderCurrentReel('up');
    }

    // Navigation: Previous Reel
    function prevReel() {
        if (!currentReelsDeck.length) return;
        currentReelIndex = (currentReelIndex - 1 + currentReelsDeck.length) % currentReelsDeck.length;
        renderCurrentReel('down');
    }

    // Toggle Play/Pause
    function toggleReelsPlay() {
        const video = document.getElementById('reels-main-video');
        const indicator = document.getElementById('reels-play-indicator');
        if (!video) return;

        if (video.paused) {
            video.play();
            showPlayIndicator('play_arrow');
        } else {
            video.pause();
            showPlayIndicator('pause');
        }
    }

    function showPlayIndicator(iconName) {
        const ind = document.getElementById('reels-play-indicator');
        if (!ind) return;
        ind.innerHTML = `<span class="material-symbols-outlined text-4xl text-white">${iconName}</span>`;
        ind.classList.remove('hidden', 'reels-play-indicator');
        void ind.offsetWidth; // trigger reflow
        ind.classList.add('reels-play-indicator');
        setTimeout(() => ind.classList.add('hidden'), 500);
    }

    // Toggle Mute
    function toggleReelsMute() {
        isMuted = !isMuted;
        const video = document.getElementById('reels-main-video');
        if (video) video.muted = isMuted;
        updateReelsMuteUI();
    }

    function updateReelsMuteUI() {
        const icon = document.getElementById('reels-mute-icon');
        if (icon) {
            icon.textContent = isMuted ? 'volume_off' : 'volume_up';
        }
    }

    // Toggle Playback Speed
    function toggleReelsSpeed() {
        const speeds = [1.0, 1.25, 1.5, 2.0];
        const curIdx = speeds.indexOf(playbackSpeed);
        playbackSpeed = speeds[(curIdx + 1) % speeds.length];

        const video = document.getElementById('reels-main-video');
        if (video) video.playbackRate = playbackSpeed;

        const badge = document.getElementById('reels-speed-badge');
        if (badge) badge.textContent = `${playbackSpeed}x`;
    }

    // Toggle Karaoke
    function toggleReelsKaraoke() {
        karaokeActive = !karaokeActive;
        const box = document.getElementById('reels-karaoke-box');
        const btn = document.getElementById('reels-cc-btn');
        if (box) {
            if (karaokeActive) box.classList.remove('hidden');
            else box.classList.add('hidden');
        }
        if (btn) {
            btn.classList.toggle('text-amber-400', karaokeActive);
            btn.classList.toggle('text-slate-400', !karaokeActive);
        }
    }

    // Toggle Like / Favorite
    function toggleReelsLike() {
        const card = currentReelsDeck[currentReelIndex];
        if (!card) return;

        const isFav = saveReelFavorite(card.title);
        const icon = document.getElementById('reels-like-icon');
        if (icon) {
            icon.style.color = isFav ? '#f43f5e' : '';
            icon.style.fontVariationSettings = isFav ? "'FILL' 1" : "'FILL' 0";
        }

        if (isFav) {
            triggerHeartPop();
        }
    }

    // Heart Burst Animation on Double Tap
    function triggerHeartPop(x, y) {
        const stage = document.getElementById('reels-video-stage');
        if (!stage) return;

        const heart = document.createElement('div');
        heart.className = 'reels-heart-burst material-symbols-outlined text-6xl text-rose-500';
        heart.style.fontVariationSettings = "'FILL' 1";
        heart.textContent = 'favorite';

        if (typeof x === 'number' && typeof y === 'number') {
            heart.style.left = `${x}px`;
            heart.style.top = `${y}px`;
        } else {
            heart.style.left = '50%';
            heart.style.top = '50%';
        }

        stage.appendChild(heart);
        setTimeout(() => heart.remove(), 900);
    }

    // Formula Drawer
    function toggleReelsFormulaDrawer() {
        const drawer = document.getElementById('reels-formula-drawer');
        if (!drawer) return;
        const isClosed = drawer.classList.contains('reels-drawer-closed');
        if (isClosed) {
            openReelsFormulaDrawer();
        } else {
            closeReelsFormulaDrawer();
        }
    }

    function openReelsFormulaDrawer() {
        const card = currentReelsDeck[currentReelIndex];
        if (!card) return;

        const drawer = document.getElementById('reels-formula-drawer');
        const titleEl = document.getElementById('reels-drawer-title');
        const formulaEl = document.getElementById('reels-drawer-formula');
        const descEl = document.getElementById('reels-drawer-desc');
        const tipEl = document.getElementById('reels-drawer-tip');

        if (titleEl) titleEl.textContent = card.title || 'Formula Sheet';
        if (formulaEl) {
            let fmt = String(card.formula || '').trim();
            if (!fmt.startsWith('$')) fmt = `$$${fmt}$$`;
            formulaEl.innerHTML = fmt;
            if (window.MathJax && window.MathJax.typesetPromise) {
                window.MathJax.typesetPromise([formulaEl]).catch(() => {});
            }
        }
        if (descEl) descEl.textContent = card.description || 'Reference formula for NCEES FE CBT Exam.';
        if (tipEl) tipEl.textContent = card.examTip || 'Found in the official NCEES Reference Handbook.';

        if (drawer) {
            drawer.classList.remove('reels-drawer-closed');
            drawer.classList.add('reels-drawer-open');
        }
    }

    function closeReelsFormulaDrawer() {
        const drawer = document.getElementById('reels-formula-drawer');
        if (drawer) {
            drawer.classList.remove('reels-drawer-open');
            drawer.classList.add('reels-drawer-closed');
        }
    }

    // Solved Example Drawer
    function toggleReelsExampleDrawer() {
        const drawer = document.getElementById('reels-example-drawer');
        if (!drawer) return;
        const isClosed = drawer.classList.contains('reels-drawer-closed');
        if (isClosed) {
            openReelsExampleDrawer();
        } else {
            closeReelsExampleDrawer();
        }
    }

    function openReelsExampleDrawer() {
        const card = currentReelsDeck[currentReelIndex];
        if (!card || !card.solvedExample) return;

        const drawer = document.getElementById('reels-example-drawer');
        const questionEl = document.getElementById('reels-example-question');
        const solutionEl = document.getElementById('reels-example-solution');

        if (questionEl) {
            let q = card.solvedExample.question || '';
            questionEl.innerHTML = q;
        }
        if (solutionEl) {
            let s = card.solvedExample.solution || '';
            solutionEl.innerHTML = s;
        }

        if (window.MathJax && window.MathJax.typesetPromise) {
            window.MathJax.typesetPromise([questionEl, solutionEl]).catch(() => {});
        }

        if (drawer) {
            drawer.classList.remove('reels-drawer-closed');
            drawer.classList.add('reels-drawer-open');
        }
    }

    function closeReelsExampleDrawer() {
        const drawer = document.getElementById('reels-example-drawer');
        if (drawer) {
            drawer.classList.remove('reels-drawer-open');
            drawer.classList.add('reels-drawer-closed');
        }
    }

    // Spaced Repetition (SRS) Action
    function rateReelSRS(rating) {
        const card = currentReelsDeck[currentReelIndex];
        if (!card) return;

        if (rating === 'mastered') {
            if (window.addPoints) {
                window.addPoints(2, '⚡ Rapid Reel Mastered!');
            }
            triggerHeartPop();
        }

        // Advance to next reel with smooth upward slide
        nextReel();
    }

    // Shuffle Reels
    function shuffleReels() {
        if (!currentReelsDeck.length) return;
        for (let i = currentReelsDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [currentReelsDeck[i], currentReelsDeck[j]] = [currentReelsDeck[j], currentReelsDeck[i]];
        }
        currentReelIndex = 0;
        renderCurrentReel('up');
    }

    // Setup Touch and Keyboard Gestures
    function setupReelsGestures() {
        const viewport = document.getElementById('reels-viewport');
        if (!viewport || viewport._gesturesWired) return;
        viewport._gesturesWired = true;

        // Touch Listeners
        viewport.addEventListener('touchstart', (e) => {
            if (!isReelsActive) return;
            const touch = e.touches[0];
            touchStartY = touch.clientY;
            touchStartX = touch.clientX;
            touchStartTime = Date.now();
            isSwiping = true;
        }, { passive: true });

        viewport.addEventListener('touchmove', (e) => {
            // passive listener
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            if (!isReelsActive || !isSwiping) return;
            isSwiping = false;

            const touch = e.changedTouches[0];
            const deltaY = touch.clientY - touchStartY;
            const deltaX = touch.clientX - touchStartX;
            const duration = Date.now() - touchStartTime;

            // Check for Double Tap (< 300ms, < 20px movement)
            if (Math.abs(deltaY) < 15 && Math.abs(deltaX) < 15 && duration < 300) {
                const now = Date.now();
                if (now - lastTapTime < 300) {
                    // Double Tap detected!
                    const rect = viewport.getBoundingClientRect();
                    triggerHeartPop(touch.clientX - rect.left, touch.clientY - rect.top);
                    toggleReelsLike();
                    lastTapTime = 0;
                    return;
                }
                lastTapTime = now;
            }

            // Swipe Up -> Next Reel
            if (deltaY < -45 && Math.abs(deltaY) > Math.abs(deltaX)) {
                nextReel();
            }
            // Swipe Down -> Prev Reel
            else if (deltaY > 45 && Math.abs(deltaY) > Math.abs(deltaX)) {
                prevReel();
            }
        }, { passive: true });

        // Mouse Wheel Listener (Throttled for Desktop)
        viewport.addEventListener('wheel', (e) => {
            if (!isReelsActive) return;
            if (wheelThrottleTimer) return;

            if (e.deltaY > 25) {
                nextReel();
                wheelThrottleTimer = setTimeout(() => { wheelThrottleTimer = null; }, 400);
            } else if (e.deltaY < -25) {
                prevReel();
                wheelThrottleTimer = setTimeout(() => { wheelThrottleTimer = null; }, 400);
            }
        }, { passive: true });

        // Global Keyboard Hotkeys
        document.addEventListener('keydown', (e) => {
            if (!isReelsActive) return;

            if (e.code === 'Escape') {
                e.preventDefault();
                // Close drawer if open, else close modal
                const fDrawer = document.getElementById('reels-formula-drawer');
                const eDrawer = document.getElementById('reels-example-drawer');
                if (fDrawer && !fDrawer.classList.contains('reels-drawer-closed')) {
                    closeReelsFormulaDrawer();
                    return;
                }
                if (eDrawer && !eDrawer.classList.contains('reels-drawer-closed')) {
                    closeReelsExampleDrawer();
                    return;
                }
                closeRapidReels();
            } else if (e.code === 'ArrowDown' || e.code === 'PageDown' || e.code === 'KeyJ') {
                e.preventDefault();
                nextReel();
            } else if (e.code === 'ArrowUp' || e.code === 'PageUp' || e.code === 'KeyK') {
                e.preventDefault();
                prevReel();
            } else if (e.code === 'Space') {
                e.preventDefault();
                toggleReelsPlay();
            } else if (e.code === 'KeyM') {
                e.preventDefault();
                toggleReelsMute();
            } else if (e.code === 'KeyF') {
                e.preventDefault();
                toggleReelsFormulaDrawer();
            } else if (e.code === 'KeyE') {
                e.preventDefault();
                toggleReelsExampleDrawer();
            } else if (e.code === 'KeyL') {
                e.preventDefault();
                toggleReelsLike();
            }
        });
    }

    // Discipline change handler inside Reels
    function onReelsDisciplineChange(disc) {
        activeDiscipline = disc;
        activeSubjectFilter = 'all';
        openRapidReels(activeDiscipline, 'all', 0);
    }

    // Subject change handler inside Reels
    function onReelsSubjectChange(subId) {
        activeSubjectFilter = subId;
        openRapidReels(activeDiscipline, activeSubjectFilter, 0);
    }

    // Expose public API
    window.openRapidReels = openRapidReels;
    window.closeRapidReels = closeRapidReels;
    window.nextReel = nextReel;
    window.prevReel = prevReel;
    window.toggleReelsPlay = toggleReelsPlay;
    window.toggleReelsMute = toggleReelsMute;
    window.toggleReelsSpeed = toggleReelsSpeed;
    window.toggleReelsKaraoke = toggleReelsKaraoke;
    window.toggleReelsLike = toggleReelsLike;
    window.openReelsFormulaDrawer = openReelsFormulaDrawer;
    window.closeReelsFormulaDrawer = closeReelsFormulaDrawer;
    window.toggleReelsFormulaDrawer = toggleReelsFormulaDrawer;
    window.openReelsExampleDrawer = openReelsExampleDrawer;
    window.closeReelsExampleDrawer = closeReelsExampleDrawer;
    window.toggleReelsExampleDrawer = toggleReelsExampleDrawer;
    window.rateReelSRS = rateReelSRS;
    window.shuffleReels = shuffleReels;
    window.onReelsDisciplineChange = onReelsDisciplineChange;
    window.onReelsSubjectChange = onReelsSubjectChange;

})();
