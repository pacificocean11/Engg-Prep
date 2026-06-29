window.openShareModal = function() {
    try {
        const shareModal = document.getElementById('share-achievement-modal');
        if (!shareModal) {
            console.error("Share modal element not found.");
            return;
        }
        
        const badgeAvatar = document.getElementById('share-badge-avatar');
        const badgeName = document.getElementById('share-badge-name');
        const badgeDiscipline = document.getElementById('share-badge-discipline');
        const badgePoints = document.getElementById('share-badge-points');
        
        const state = window.state || {};

        if (badgeAvatar) {
            const savedPic = localStorage.getItem('enggtv_profile_pic');
            if (savedPic) badgeAvatar.src = savedPic;
        }
        
        if (badgeName) badgeName.textContent = state.userName || (state.user && state.user.username ? state.user.username : 'Alex Riviera');
        if (badgeDiscipline) badgeDiscipline.textContent = localStorage.getItem('enggtv_discipline') || (state.user && state.user.discipline ? state.user.discipline : 'FE Candidate');
        if (badgePoints) badgePoints.textContent = (state.userPoints || 0) + " Points";
        
        shareModal.classList.remove('hidden');
        setTimeout(() => {
            shareModal.classList.add('opacity-100');
            const card = document.getElementById('share-card');
            if(card) card.classList.remove('scale-95');
        }, 50);
    } catch (e) {
        console.error("Error in openShareModal:", e);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const shareModal = document.getElementById('share-achievement-modal');
    const btnCloseShare = document.getElementById('btn-close-share');
    const btnShareDownload = document.getElementById('btn-share-download');
    const btnShareLinkedin = document.getElementById('btn-share-linkedin');

    if (btnCloseShare) {
        btnCloseShare.addEventListener('click', () => {
            shareModal.classList.remove('opacity-100');
            const card = document.getElementById('share-card');
            if(card) card.classList.add('scale-95');
            setTimeout(() => shareModal.classList.add('hidden'), 300);
        });
    }

    if (btnShareDownload) {
        btnShareDownload.addEventListener('click', async () => {
            if (typeof html2canvas === 'undefined') {
                window.showToast("Library Missing", "Image generator not loaded. Check connection.", "error");
                return;
            }

            const btnOriginalText = btnShareDownload.innerHTML;
            btnShareDownload.innerHTML = `<span class="material-symbols-outlined text-[18px] animate-spin">refresh</span> Generating...`;
            
            try {
                const state = window.state || {};
                const captureElement = document.getElementById('achievement-badge-capture');
                
                const canvas = await html2canvas(captureElement, {
                    scale: 3,
                    backgroundColor: null,
                    useCORS: true,
                    allowTaint: true
                });
                
                const link = document.createElement('a');
                link.download = `ENGG_tv_Achievement_${(state.userName || 'Student').replace(/\s+/g, '_')}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                
                window.showToast("Badge Downloaded!", "You can now post this image on LinkedIn.", "check_circle");
                
                const caption = `I'm leveling up my engineering skills on ENGG.tv! 🚀 Just reached ${state.userPoints || 0} points preparing for my FE Exam. \n\nStart prepping for free today: https://pacificocean11.github.io/Engg-Prep\n\n#Engineering #FEExam #ENGGtv`;
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(caption).catch(e => console.log('Clipboard failed', e));
                }
                
            } catch (error) {
                console.error("Error generating badge:", error);
                window.showToast("Error", "Could not generate badge image.", "error");
            } finally {
                btnShareDownload.innerHTML = btnOriginalText;
            }
        });
    }

    if (btnShareLinkedin) {
        btnShareLinkedin.addEventListener('click', () => {
            const state = window.state || {};
            const certName = encodeURIComponent("FE Exam Readiness - " + (state.userPoints || 0) + " Points");
            const orgName = encodeURIComponent("ENGG.tv");
            const issueYear = new Date().getFullYear();
            const issueMonth = new Date().getMonth() + 1;
            
            const linkedInUrl = `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}`;
            
            window.open(linkedInUrl, '_blank');
        });
    }

    
// Extracted to js/scratchpad.js
});
