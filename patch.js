const fs = require('fs');
let c = fs.readFileSync('www/login.html', 'utf8');
c = c.replace(/setMode\('login'\);\s*<\/script>/, `setMode('login');

        // FE Exam Info Expand/Collapse Logic
        const feBanner = document.getElementById('fe-info-banner');
        const feDetails = document.getElementById('fe-info-details');
        const feIcon = document.getElementById('fe-info-icon');

        if (feBanner && feDetails && feIcon) {
            feBanner.addEventListener('click', () => {
                const isHidden = feDetails.classList.contains('hidden');
                if (isHidden) {
                    feDetails.classList.remove('hidden');
                    feIcon.textContent = 'expand_less';
                    feIcon.classList.add('rotate-180');
                    setTimeout(() => {
                        feDetails.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                    }, 50);
                } else {
                    feDetails.classList.add('hidden');
                    feIcon.textContent = 'expand_more';
                    feIcon.classList.remove('rotate-180');
                }
            });
        }
    </script>`);
fs.writeFileSync('www/login.html', c);
