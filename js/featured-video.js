/**
 * ENGG.tv - Featured Engineering Mechanism & Video Showcase Module
 * Displays interactive 3D CAD/kinematic mechanism demonstrations.
 * Configured as a modular developer placeholder that can easily be swapped
 * with custom video content anytime.
 */

(function() {
    'use strict';

    // Global Configuration Object - High-yield FE Exam explainer
    window.ENGGTV_FEATURED_VIDEO = {
        id: 'transformers-fe-explainer',
        title: 'FE Exam Core: Electrical Transformers Masterclass',
        subtitle: 'Ideal Relations, Dot Convention & Impedance Reflection',
        badge: 'FE Exam Core • Electrical & General',
        srcMp4: 'assets/videos/placeholder_video.mp4',
        srcWebm: 'assets/videos/transformers_fe_explainer.webm',
        poster: 'assets/videos/transformers_poster.jpg',
        attribution: {
            creator: 'EnggPrep NCEES FE Review',
            license: 'NCEES Exam Prep Curriculum (Educational)',
            source: 'EnggPrep Studio'
        },
        description: 'Comprehensive high-yield walkthrough of single-phase ideal and real transformers for the FE Exam. Covers turns ratio a = N1/N2, dot convention polarity, impedance reflection (Zin = a² ZL), core vs copper losses, condition for maximum efficiency, and worked numerical FE problems.',
        keyTakeaways: [
            { icon: 'bolt', text: 'Turns Ratio: a = N₁/N₂ = V₁/V₂ = I₂/I₁. Voltages transform directly; currents inversely. Apparent power is conserved: S₁ = S₂.' },
            { icon: 'alt_route', text: 'Dot Convention: If currents both enter (or both leave) dotted terminals, use +a. If one enters and one leaves, insert a negative sign: V₁/V₂ = -a.' },
            { icon: 'memory', text: 'Impedance Reflection: Secondary impedance reflected to primary scales by a²: Zin = a² · ZL. Always square the turns ratio!' },
            { icon: 'offline_bolt', text: 'Losses & Max Efficiency: Copper losses Pcu ∝ I²; Core losses Pcore ≈ const. Maximum efficiency occurs when Pcu = Pcore.' }
        ],
        developerNote: 'Active FE Video: assets/videos/transformers_fe_explainer.webm (HD 720p Explainer Video)'
    };

    let videoEl = null;
    let playBtn = null;
    let isPlaying = false;

    function initVideoShowcase() {
        const container = document.getElementById('featured-mechanism-video-card');
        if (!container) return;

        videoEl = document.getElementById('mechanism-video-player');
        playBtn = document.getElementById('btn-mechanism-play-toggle');

        if (!videoEl) return;

        // Ensure proper attributes
        videoEl.playsInline = true;
        videoEl.loop = true;
        videoEl.muted = true; // Required for reliable autoplay compliance

        // Update UI when video state changes
        videoEl.addEventListener('play', () => {
            isPlaying = true;
            updatePlayButtonUI(true);
        });

        videoEl.addEventListener('pause', () => {
            isPlaying = false;
            updatePlayButtonUI(false);
        });

        if (playBtn) {
            playBtn.onclick = togglePlay;
        }

        // Click directly on video or overlay to toggle play/pause
        const videoWrapper = document.getElementById('mechanism-video-wrapper');
        if (videoWrapper) {
            videoWrapper.onclick = (e) => {
                // If clicked on controls buttons, ignore
                if (e.target.closest('button') && e.target.closest('button') !== playBtn) return;
                togglePlay();
            };
        }

        // Setup sound toggle button
        const soundBtn = document.getElementById('btn-mechanism-sound-toggle');
        if (soundBtn) {
            soundBtn.onclick = (e) => {
                e.stopPropagation();
                if (!videoEl) return;
                videoEl.muted = !videoEl.muted;
                const icon = soundBtn.querySelector('.material-symbols-outlined');
                if (icon) {
                    icon.textContent = videoEl.muted ? 'volume_off' : 'volume_up';
                }
            };
        }

        // Setup fullscreen button
        const fsBtn = document.getElementById('btn-mechanism-fullscreen');
        if (fsBtn) {
            fsBtn.onclick = (e) => {
                e.stopPropagation();
                if (!videoEl) return;
                if (videoEl.requestFullscreen) {
                    videoEl.requestFullscreen();
                } else if (videoEl.webkitRequestFullscreen) {
                    videoEl.webkitRequestFullscreen();
                }
            };
        }

        // Setup developer copy button
        const copyBtn = document.getElementById('btn-copy-video-path');
        if (copyBtn) {
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                const pathText = 'assets/videos/transformers_fe_explainer.webm';
                const originalHtml = copyBtn.innerHTML;
                const setSuccess = () => {
                    copyBtn.innerHTML = '<span class="material-symbols-outlined text-[12px] text-emerald-400">check</span><span class="text-emerald-400">Copied!</span>';
                    setTimeout(() => {
                        copyBtn.innerHTML = originalHtml;
                    }, 2000);
                };
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(pathText).then(setSuccess).catch(setSuccess);
                } else {
                    setSuccess();
                }
            };
        }
    }

    function togglePlay() {
        if (!videoEl) return;
        if (videoEl.paused) {
            videoEl.play().catch(err => {
                console.warn('Playback error:', err);
            });
        } else {
            videoEl.pause();
        }
    }

    function updatePlayButtonUI(playing) {
        const overlay = document.getElementById('mechanism-play-overlay');
        const icon = playBtn ? playBtn.querySelector('.material-symbols-outlined') : null;

        if (overlay) {
            if (playing) {
                overlay.classList.add('opacity-0', 'pointer-events-none');
            } else {
                overlay.classList.remove('opacity-0', 'pointer-events-none');
            }
        }

        if (icon) {
            icon.textContent = playing ? 'pause' : 'play_arrow';
        }
    }

    // Expose helpers globally
    window.initFeaturedMechanismVideo = initVideoShowcase;
    window.toggleFeaturedMechanismPlay = togglePlay;

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoShowcase);
    } else {
        setTimeout(initVideoShowcase, 60);
    }
})();
