document.addEventListener('DOMContentLoaded', () => {
    const state = window.state;
    // Ensure all window-exported functions are available directly if needed, but JS will look up the prototype chain.
    // ===== INTERACTIVE ONBOARDING FLOW =====
    const onboardingModal = document.getElementById('onboarding-modal');
    if (onboardingModal) {
        const onboardingSlides = document.querySelectorAll('.onboarding-slide');
        const onboardingDots = document.querySelectorAll('#onboarding-dots div');
        const btnNextOnboarding = document.getElementById('btn-onboarding-next');
        const btnSkipOnboarding = document.getElementById('btn-onboarding-skip');
        let currentOnboardingSlide = 0;

        function updateOnboardingUI() {
            onboardingSlides.forEach((slide, idx) => {
                const idxData = parseInt(slide.getAttribute('data-index'));
                if (idxData === currentOnboardingSlide) {
                    slide.classList.remove('translate-x-full', '-translate-x-full', 'opacity-0');
                    slide.classList.add('translate-x-0', 'opacity-100');
                } else if (idxData < currentOnboardingSlide) {
                    slide.classList.remove('translate-x-0', 'translate-x-full', 'opacity-100');
                    slide.classList.add('-translate-x-full', 'opacity-0');
                } else {
                    slide.classList.remove('translate-x-0', '-translate-x-full', 'opacity-100');
                    slide.classList.add('translate-x-full', 'opacity-0');
                }
            });

            onboardingDots.forEach((dot, idx) => {
                const dotIdx = parseInt(dot.getAttribute('data-idx'));
                if (dotIdx === currentOnboardingSlide) {
                    dot.classList.remove('bg-slate-300', 'dark:bg-slate-700', 'w-2');
                    dot.classList.add('bg-primary', 'w-4');
                } else {
                    dot.classList.remove('bg-primary', 'w-4');
                    dot.classList.add('bg-slate-300', 'dark:bg-slate-700', 'w-2');
                }
            });

            if (currentOnboardingSlide === onboardingSlides.length - 1) {
                if (btnNextOnboarding) btnNextOnboarding.textContent = "Let's Go!";
                if (btnSkipOnboarding) btnSkipOnboarding.classList.add('hidden');
            } else {
                if (btnNextOnboarding) btnNextOnboarding.textContent = "Next";
                if (btnSkipOnboarding) btnSkipOnboarding.classList.remove('hidden');
            }
        }

        function closeOnboarding() {
            onboardingModal.classList.remove('opacity-100');
            setTimeout(() => {
                onboardingModal.classList.add('hidden');
            }, 300);
            localStorage.setItem('enggtv_onboarding_complete', 'true');
            if (currentOnboardingSlide === onboardingSlides.length - 1) {
                if (typeof confetti !== 'undefined') confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#FF006E', '#FDA60A'] });
            }
        }

        if (btnNextOnboarding) {
            btnNextOnboarding.addEventListener('click', () => {
                if (currentOnboardingSlide < onboardingSlides.length - 1) {
                    currentOnboardingSlide++;
                    updateOnboardingUI();
                } else {
                    closeOnboarding();
                }
            });
        }

        if (btnSkipOnboarding) {
            btnSkipOnboarding.addEventListener('click', closeOnboarding);
        }

        // Trigger logic
        setTimeout(() => {
            // TEMPORARILY SUPPRESSED: Save this functionality for future flash announcements
            const enableIntroScreens = false;
            
            if (enableIntroScreens && !localStorage.getItem('enggtv_onboarding_complete') && state.currentPage === 'dashboard') {
                onboardingModal.classList.remove('hidden');
                setTimeout(() => onboardingModal.classList.add('opacity-100'), 50);
                updateOnboardingUI();
            }
        }, 1500); // Wait 1.5s after load to show
    }
});
