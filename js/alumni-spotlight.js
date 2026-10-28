/**
 * ENGG.tv - Alumni Passer Spotlight Module
 * Displays verified FE Exam passers, their discipline-specific journey, strategy takeaways, and custom avatars.
 * Implements Option B: Discipline-Smart Prioritization with interactive shuffle.
 */

(function() {
    const ALUMNI_PASSERS = [
        {
            id: 'sabrish',
            name: 'Sabrish M.',
            discipline: 'Mechanical',
            badge: 'FE Mechanical Passed',
            avatar: 'assets/avatars/sabrish.jpg',
            initials: 'SM',
            journeyQuote: 'Focusing on timed drills for Thermodynamics and Fluid Mechanics gave me the exact pacing I needed on exam day. Trust the practice repetition.',
            takeaway: 'Practice timed quizzes daily to lock in your exam pacing.'
        },
        {
            id: 'nainish',
            name: 'Nainish M.',
            discipline: 'Civil',
            badge: 'FE Civil Passed',
            avatar: 'assets/avatars/nainish.jpg',
            initials: 'NM',
            journeyQuote: 'Structural analysis and Geotech used to slow me down. Reviewing the step-by-step solutions daily turned my weakest topics into my highest scoring sections.',
            takeaway: 'Review step-by-step solutions to convert weak areas into high scores.'
        },
        {
            id: 'shariff',
            name: 'Mr. H. Shariff',
            discipline: 'Other Disciplines',
            badge: 'FE Other Disciplines Passed',
            avatar: 'assets/avatars/shariff.jpg',
            initials: 'HS',
            journeyQuote: 'Staying disciplined with the core fundamentals—especially Statics, Dynamics, and Materials—carried me across the finish line. ENGG.tv gave me the exact structure I needed.',
            takeaway: 'Master statics and dynamics fundamentals before advancing to complex topics.'
        },
        {
            id: 'linjo',
            name: 'Linjo J.',
            discipline: 'Other Disciplines',
            badge: 'FE Other Disciplines Passed',
            avatar: 'assets/avatars/linjo.jpg',
            initials: 'LJ',
            journeyQuote: 'The breadth of the Other Disciplines exam felt overwhelming at first, but doing 20 practice questions every morning on ENGG.tv made passing inevitable.',
            takeaway: 'Consistency beats cramming: complete 15-20 practice questions every day.'
        },
        {
            id: 'adarsh',
            name: 'Adarsh',
            discipline: 'Other Disciplines',
            badge: 'FE Other Disciplines Passed',
            avatar: 'assets/avatars/adarsh.jpg',
            initials: 'A',
            journeyQuote: 'Mastering the NCEES Handbook search shortcuts during daily quizzes was the ultimate turning point. If you stay consistent with the app, you will pass.',
            takeaway: 'Practice fast electronic searching in the official NCEES Reference Handbook.'
        }
    ];

    let currentIndex = 0;

    function getActiveDiscipline() {
        return localStorage.getItem('enggtv_discipline') || 
               (window.state && window.state.user && window.state.user.discipline) || 
               'Mechanical';
    }

    function getSmartDefaultIndex() {
        const disc = getActiveDiscipline().toLowerCase();
        
        if (disc.includes('mech')) {
            const idx = ALUMNI_PASSERS.findIndex(a => a.id === 'sabrish');
            if (idx !== -1) return idx;
        } else if (disc.includes('civil')) {
            const idx = ALUMNI_PASSERS.findIndex(a => a.id === 'nainish');
            if (idx !== -1) return idx;
        } else if (disc.includes('other')) {
            // Pick between Shariff, Linjo, Adarsh
            const otherIndices = [2, 3, 4];
            return otherIndices[Math.floor(Math.random() * otherIndices.length)];
        }
        
        // Fallback random
        return Math.floor(Math.random() * ALUMNI_PASSERS.length);
    }

    function renderAlumnus(index, animate = false) {
        currentIndex = (index + ALUMNI_PASSERS.length) % ALUMNI_PASSERS.length;
        const person = ALUMNI_PASSERS[currentIndex];

        const cardEl = document.getElementById('alumni-spotlight-card');
        const nameEl = document.getElementById('alumni-name');
        const disciplineEl = document.getElementById('alumni-discipline');
        const quoteEl = document.getElementById('alumni-quote');
        const takeawayEl = document.getElementById('alumni-takeaway');
        const avatarImgEl = document.getElementById('alumni-avatar-img');
        const avatarInitialsEl = document.getElementById('alumni-avatar-initials');

        if (!cardEl) return;

        if (animate) {
            const contentContainer = document.getElementById('alumni-content-container');
            if (contentContainer) {
                contentContainer.style.opacity = '0';
                contentContainer.style.transform = 'translateY(4px)';
                setTimeout(() => {
                    updateContent();
                    contentContainer.style.transition = 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)';
                    contentContainer.style.opacity = '1';
                    contentContainer.style.transform = 'translateY(0)';
                }, 120);
                return;
            }
        }

        updateContent();

        function updateContent() {
            if (nameEl) nameEl.textContent = person.name;
            if (disciplineEl) disciplineEl.textContent = person.badge;
            if (quoteEl) quoteEl.textContent = `“${person.journeyQuote}”`;
            if (takeawayEl) takeawayEl.textContent = person.takeaway;

            if (avatarImgEl) {
                avatarImgEl.src = person.avatar;
                avatarImgEl.alt = `${person.name} - ${person.badge}`;
                avatarImgEl.style.display = 'block';
                if (avatarInitialsEl) avatarInitialsEl.style.display = 'none';

                avatarImgEl.onerror = function() {
                    // Fallback to initials if image fails to load
                    avatarImgEl.style.display = 'none';
                    if (avatarInitialsEl) {
                        avatarInitialsEl.textContent = person.initials;
                        avatarInitialsEl.style.display = 'flex';
                    }
                };
            }
        }
    }

    function shuffle() {
        renderAlumnus(currentIndex + 1, true);
    }

    function init() {
        currentIndex = getSmartDefaultIndex();
        renderAlumnus(currentIndex, false);

        const shuffleBtn = document.getElementById('btn-shuffle-alumni');
        if (shuffleBtn) {
            shuffleBtn.onclick = shuffle;
        }
    }

    // Global hooks
    window.shuffleAlumni = shuffle;
    window.updateAlumniWidget = () => {
        currentIndex = getSmartDefaultIndex();
        renderAlumnus(currentIndex, true);
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        setTimeout(init, 60);
    }
})();
