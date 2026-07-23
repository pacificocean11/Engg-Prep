    // ============================================================
    // B-3: Avatar Picker Logic
    // ============================================================
    const AVATAR_PRESETS = [
        { id: 'scholar',   emoji: '🎓', gradient: 'linear-gradient(135deg, #FDA60A, #FF006E)',   label: 'Scholar'   },
        { id: 'engineer',  emoji: '⚙️',  gradient: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',   label: 'Engineer'  },
        { id: 'scientist', emoji: '🔬', gradient: 'linear-gradient(135deg, #10B981, #06B6D4)',   label: 'Scientist' },
        { id: 'architect', emoji: '📐', gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',   label: 'Architect' },
        { id: 'pioneer',   emoji: '🚀', gradient: 'linear-gradient(135deg, #EF4444, #F97316)',   label: 'Pioneer'   },
    ];

    const MOCK_LEADERBOARD = [
        { username: 'Sara', points: 482, discipline: 'Civil', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=sara', trend: 'up', streak: 12 },
        { username: 'MikeEng', points: 395, discipline: 'Mechanical', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=mike', trend: 'down', streak: 5 },
        { username: 'Julia', points: 320, discipline: 'Civil', country: 'Egypt', avatar: 'https://i.pravatar.cc/150?u=julia', trend: 'up', streak: 8 },
        { username: 'Tom', points: 285, discipline: 'Mechanical', country: 'United Arab Emirates', avatar: 'https://i.pravatar.cc/150?u=tom', trend: 'same', streak: 3 },
        { username: 'Elena', points: 210, discipline: 'Mechanical', country: 'India', avatar: 'https://i.pravatar.cc/150?u=elena', trend: 'up', streak: 15 },
        { username: 'David', points: 195, discipline: 'Other', country: 'United Kingdom', avatar: 'https://i.pravatar.cc/150?u=david', trend: 'down', streak: 2 },
        { username: 'Chris', points: 150, discipline: 'Mechanical', country: 'Australia', avatar: 'https://i.pravatar.cc/150?u=chris', trend: 'up', streak: 4 },
        { username: 'Emma', points: 120, discipline: 'Other', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=emma', trend: 'same', streak: 0 },
        { username: 'Ryan', points: 95, discipline: 'Civil', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=ryan', trend: 'down', streak: 1 },
        { username: 'Li Wei', points: 512, discipline: 'Electrical and Computer', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=liwei', trend: 'up', streak: 18 },
        { username: 'Amina', points: 430, discipline: 'Chemical', country: 'Egypt', avatar: 'https://i.pravatar.cc/150?u=amina', trend: 'up', streak: 10 },
        { username: 'Lucas', points: 365, discipline: 'Environmental', country: 'Australia', avatar: 'https://i.pravatar.cc/150?u=lucas', trend: 'down', streak: 7 },
        { username: 'Fatima', points: 310, discipline: 'Industrial', country: 'United Arab Emirates', avatar: 'https://i.pravatar.cc/150?u=fatima', trend: 'same', streak: 6 },
        { username: 'Carlos', points: 260, discipline: 'Civil', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=carlos', trend: 'up', streak: 9 },
        { username: 'Priya', points: 225, discipline: 'Electrical and Computer', country: 'India', avatar: 'https://i.pravatar.cc/150?u=priya', trend: 'up', streak: 14 },
        { username: 'Stefan', points: 180, discipline: 'Mechanical', country: 'United Kingdom', avatar: 'https://i.pravatar.cc/150?u=stefan', trend: 'down', streak: 3 },
        { username: 'Yuki', points: 145, discipline: 'Chemical', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=yuki', trend: 'up', streak: 5 },
        { username: 'Chloe', points: 115, discipline: 'Environmental', country: 'Canada', avatar: 'https://i.pravatar.cc/150?u=chloe', trend: 'same', streak: 2 },
        { username: 'Omar', points: 88, discipline: 'Electrical and Computer', country: 'Egypt', avatar: 'https://i.pravatar.cc/150?u=omar', trend: 'up', streak: 4 },
        { username: 'Sophia', points: 75, discipline: 'Industrial', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=sophia', trend: 'down', streak: 1 },
        { username: 'Daniel', points: 60, discipline: 'Other', country: 'United Kingdom', avatar: 'https://i.pravatar.cc/150?u=daniel', trend: 'same', streak: 0 },
        { username: 'Mateo', points: 45, discipline: 'Civil', country: 'Other', avatar: 'https://i.pravatar.cc/150?u=mateo', trend: 'up', streak: 3 },
        { username: 'Hannah', points: 30, discipline: 'Mechanical', country: 'United States', avatar: 'https://i.pravatar.cc/150?u=hannah', trend: 'up', streak: 2 }
    ];

    async function renderLeaderboard() {
        const list = document.getElementById('leaderboard-list');
        if (!list) return;

        // Display a high-quality loading spinner matching the premium design
        list.innerHTML = `
            <div class="flex flex-col items-center justify-center py-12 text-slate-400">
                <div class="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p class="text-xs font-bold uppercase tracking-widest">Syncing Global Standings...</p>
            </div>
        `;

        let realUsers = [];
        let firestoreError = null;
        if (window.firebaseDb) {
            try {
                const querySnapshot = await window.firebaseDb.collection("users").get();
                querySnapshot.forEach(doc => {
                    const data = doc.data();
                    // Skip the guest placeholder doc
                    if (doc.id === 'guest' || !data) return;

                    const username = data.username || doc.id;

                    // Only skip usernames that are raw Firebase UIDs:
                    // 28+ char strings made of only letters/numbers with no separators (@, ., _)
                    const isRawUid = /^[a-zA-Z0-9]{28,}$/.test(username)
                        && !username.includes('@')
                        && !username.includes('.')
                        && !username.includes('_');
                    if (isRawUid) return;

                    realUsers.push({
                        username: username,
                        points: data.userPoints !== undefined ? Number(data.userPoints) : 0,
                        discipline: data.discipline || 'FE Candidate',
                        country: data.country || 'Other',
                        avatar: data.avatar || null,
                        profilePic: data.profilePic || null,
                        streak: data.recentActivity ? calculateStreakFromActivity(data.recentActivity) : 0,
                        trend: 'same'
                    });
                });
                console.log(`✅ Leaderboard: loaded ${realUsers.length} users from Firestore.`);
            } catch (e) {
                firestoreError = e.message || String(e);
                console.error("Error fetching leaderboard users from Firestore:", e);
            }
        } else {
            firestoreError = 'Firebase not initialized';
        }

        const userCountry = window.state.user.country || 'Other';
        const userStreak = calculateStreak();

        // Add current user entry
        const currentUserData = {
            username: window.state.user.username === 'demo' ? 'You (Alex)' : `You (${window.state.user.username})`,
            points: window.state.userPoints,
            discipline: localStorage.getItem('enggtv_discipline') || 'FE Candidate',
            country: userCountry,
            isCurrentUser: true,
            trend: 'up',
            streak: userStreak,
            avatar: localStorage.getItem('enggtv_avatar') || null,
            profilePic: localStorage.getItem('enggtv_profile_pic') || null
        };

        // Remove the current user from fetched list (re-added below with "You (...)" label)
        const currentUsername = window.state.user.username;
        const filteredRealUsers = realUsers.filter(u =>
            u.username !== currentUsername && !u.username.startsWith('You (')
        );

        // Deduplicate by username (case-insensitive), keep highest points
        const uniqueUsersMap = new Map();
        filteredRealUsers.forEach(u => {
            const key = u.username.toLowerCase();
            if (!uniqueUsersMap.has(key) || u.points > uniqueUsersMap.get(key).points) {
                uniqueUsersMap.set(key, u);
            }
        });
        const deduplicatedRealUsers = Array.from(uniqueUsersMap.values());




        // If Firestore threw an error, show it in the UI clearly
        if (firestoreError) {
            list.innerHTML = `
                <div class="flex flex-col items-center justify-center py-12 text-slate-400 gap-3">
                    <span class="material-symbols-outlined text-4xl text-red-400">cloud_off</span>
                    <p class="text-sm font-bold text-red-500">Could not load standings</p>
                    <p class="text-xs text-slate-400 text-center px-4">Firestore error: ${firestoreError}</p>
                    <p class="text-xs text-slate-400 text-center px-4">Check Firestore security rules — the leaderboard query requires read access to the <code class="bg-slate-100 px-1 rounded">users</code> collection.</p>
                    <button onclick="renderLeaderboard()" class="mt-2 text-xs font-bold text-primary underline">Retry</button>
                </div>
            `;
            return;
        }

        // Do not fall back to dummy users. If offline and cache is empty, only show the current user.
        const baseUsers = deduplicatedRealUsers;
        let allUsers = [...baseUsers, currentUserData];

        // Sort by points descending
        allUsers.sort((a, b) => b.points - a.points);

        // Take top 100
        const top100 = allUsers.slice(0, 100);

        const isAdmin = window.state.user.username && window.state.user.username.toLowerCase() === 'admin';

        list.innerHTML = top100.map((user, index) => {
            const rank = index + 1;
            let rankBadge = '';
            if (rank === 1) rankBadge = 'bg-amber-400 text-white';
            else if (rank === 2) rankBadge = 'bg-slate-300 text-slate-700';
            else if (rank === 3) rankBadge = 'bg-amber-600/60 text-white';
            else rankBadge = 'bg-slate-100 dark:bg-slate-800 text-slate-400';

            const trendIcon = user.trend === 'up' ? 'trending_up' : (user.trend === 'down' ? 'trending_down' : 'remove');
            const trendColor = user.trend === 'up' ? 'text-green-500' : (user.trend === 'down' ? 'text-red-500' : 'text-slate-400');

            let displayName = user.username;
            // Always strip email domain for privacy — show only the part before @
            if (displayName.includes('@')) {
                displayName = displayName.split('@')[0];
            }
            // Handle "You (user@email.com)" format
            if (displayName.startsWith('You (') && displayName.endsWith(')')) {
                const inner = displayName.slice(5, -1);
                if (inner.includes('@')) {
                    displayName = `You (${inner.split('@')[0]})`;
                }
            }


            const preset = AVATAR_PRESETS.find(p => p.id === user.avatar);
            let avatarHTML = '';
            if (user.profilePic && !user.avatar) {
                avatarHTML = `<img src="${user.profilePic}" class="w-full h-full object-cover" alt="${displayName}">`;
            } else if (preset) {
                avatarHTML = `
                    <div class="avatar-emoji-display" style="background:${preset.gradient}; font-size: 20px;">
                        ${preset.emoji}
                    </div>`;
            } else {
                const avatarUrl = user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuCe2S82u2sZJ3xmW3cB9zBfpog-Qu3ypJ-ZTjq6ymCTfI96k-XIcFqQH3_f-tnsCfhMQ8xlR31x9mShYD9i8-wV6691uWOysJOwRmYJOT1Ri-FqPpcoLhpq1mI6oavBfjrHajem7t3UOUFVx768eyERSx9s7OsNOezurrmnjosEF6xlDNMD4mV6KEGawwDBhd8IsqV63tn97lLQ5B0aCocCRUAL3iKJJLR_byQT4Dg_BIwq5vtnwpwp3QJNAE0FMVnXpM1IfkQKccq4';
                avatarHTML = `<img src="${avatarUrl}" class="w-full h-full object-cover" alt="${displayName}">`;
            }

            return `
                <div class="flex items-center gap-4 p-5 ${user.isCurrentUser ? 'bg-primary/5 dark:bg-primary/10 border-l-4 border-primary' : ''}">
                    <div class="flex flex-col items-center shrink-0 w-8">
                        <div class="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${rankBadge}">
                            ${rank}
                        </div>
                        <span class="material-symbols-outlined text-[14px] ${trendColor} mt-1">${trendIcon}</span>
                    </div>
                    <div class="w-10 h-10 rounded-xl overflow-hidden shrink-0 border border-slate-100 dark:border-slate-800 relative">
                        ${avatarHTML}
                        ${user.streak > 5 ? '<div class="absolute bottom-0 right-0 bg-orange-500 text-white rounded-full p-0.5"><span class="material-symbols-outlined text-[10px] block">local_fire_department</span></div>' : ''}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm ${user.isCurrentUser ? 'text-primary' : 'text-slate-800 dark:text-slate-100'} flex items-center gap-1">
                            ${displayName} 
                            ${user.isCurrentUser ? '<span class="text-[8px] bg-primary text-white px-1 py-0.5 rounded uppercase font-black">Me</span>' : ''}
                            ${user.streak > 10 ? '<span class="material-symbols-outlined text-orange-500 text-sm animate-pulse">local_fire_department</span>' : ''}
                        </h4>
                        <div class="flex items-center gap-1.5 mt-0.5">
                            <span class="material-symbols-outlined text-[12px] text-slate-400">public</span>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tighter">${user.country}</p>
                            <span class="w-1 h-1 rounded-full bg-slate-300"></span>
                            <p class="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-tighter font-bold">${user.discipline}</p>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-black text-slate-800 dark:text-slate-100">${user.points}</p>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Points</p>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Expose functions to global scope for inline handlers
    window.startMockExam = startMockExam;
    window.startQuiz = startQuiz;
    window.openMockPreview = openMockPreview;
    window.closeMockPreview = closeMockPreview;
    window.confirmStartMock = confirmStartMock;
    
    // Expose UI functions for extracted modules (e.g. firebase-sync.js)
    window.updateDashboardStats = updateDashboardStats;
    window.updateGamificationUI = updateGamificationUI;
    window.renderRecentActivity = renderRecentActivity;
    window.renderSubjects = renderSubjects;
    window.applyAvatar = applyAvatar;
    window.updateUIForTier = updateUIForTier;

    // AVATAR_PRESETS is defined above renderLeaderboard() to ensure it is in scope when the leaderboard renders.

    let pendingAvatarId = localStorage.getItem('enggtv_avatar') || null;

    function applyAvatar() {
        const savedId = localStorage.getItem('enggtv_avatar');
        const customPic = localStorage.getItem('enggtv_profile_pic');
        const preset = AVATAR_PRESETS.find(a => a.id === savedId);

        const headerContainer   = document.getElementById('header-avatar-container');
        const settingsContainer = document.getElementById('settings-avatar-container');
        // Try by ID first, fall back to DOM query within #account-info-view for cache resilience
        let accountInfoContainer = document.getElementById('account-info-avatar-container');
        if (!accountInfoContainer) {
            const accountInfoView = document.getElementById('account-info-view');
            if (accountInfoView) {
                accountInfoContainer = accountInfoView.querySelector('.w-24.h-24.rounded-3xl');
            }
        }

        [headerContainer, settingsContainer, accountInfoContainer].forEach((container, i) => {
            if (!container) return;
            
            const isSettings = i > 0;
            const clickAttrs = isSettings ? 'cursor-pointer hover:scale-105 transition-transform duration-300" onclick="window.showPhotoLightbox(this.src)"' : '"';

            if (customPic && !savedId) {
                container.innerHTML = `<img class="w-full h-full object-cover ${clickAttrs} src="${customPic}" crossorigin="anonymous" />`;
            } else if (preset) {
                const size = i === 0 ? '22px' : (i === 1 ? '36px' : '48px');
                container.innerHTML = `
                    <div class="avatar-emoji-display"
                         style="background:${preset.gradient}; font-size:${size};">
                        ${preset.emoji}
                    </div>`;
            } else {
                // Restore original imgs if no avatar chosen
                if (i === 0) {
                    container.innerHTML = `<img id="header-avatar-img" class="w-full h-full object-cover ${clickAttrs}
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuCe2S82u2sZJ3xmW3cB9zBfpog-Qu3ypJ-ZTjq6ymCTfI96k-XIcFqQH3_f-tnsCfhMQ8xlR31x9mShYD9i8-wV6691uWOysJOwRmYJOT1Ri-FqPpcoLhpq1mI6oavBfjrHajem7t3UOUFVx768eyERSx9s7OsNOezurrmnjosEF6xlDNMD4mV6KEGawwDBhd8IsqV63tn97lLQ5B0aCocCRUAL3iKJJLR_byQT4Dg_BIwq5vtnwpwp3QJNAE0FMVnXpM1IfkQKccq4" />`;
                } else {
                    container.innerHTML = `<img class="w-full h-full object-cover ${clickAttrs} alt="Profile"
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuB5KvXfnOr12k5SzP6fbV0MWcvNYjQppUc89dWdHwtt0LrMrxWc1UtbF12daBvTIvDM4-Pbiso8pORGGDZgEp95bsmWYDbPdggsVh89FcxWsuzHhPxhY9KM5FxwbYYVVJlRdHw1eVngYCCJYLEwkE1OZnwygR0y-za4B_I1aACLrZJ5_SsP0Uundq_5ePMlIxpXJi2YoSsNZnCF4Mp0shocQ1xiC60lxWTjsK-CY3Md962fc6vAc6Csv8KEhV8gBTOGs4jAoTC5mKjN" />`;
                }
            }
        });
    }

    // Photo Lightbox modal functions
    window.showPhotoLightbox = function(src) {
        const modal = document.getElementById('photo-lightbox-modal');
        const img = document.getElementById('photo-lightbox-img');
        const card = document.getElementById('photo-lightbox-card');
        if (!modal || !img) return;

        img.src = src;
        modal.classList.remove('hidden');
        // Force reflow
        modal.offsetHeight;
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
        if (card) {
            card.classList.remove('scale-95');
            card.classList.add('scale-100');
        }
    };

    window.hidePhotoLightbox = function() {
        const modal = document.getElementById('photo-lightbox-modal');
        const card = document.getElementById('photo-lightbox-card');
        if (!modal) return;

        modal.classList.remove('opacity-100');
        modal.classList.add('opacity-0');
        if (card) {
            card.classList.remove('scale-100');
            card.classList.add('scale-95');
        }
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    };

    function renderAvatarGrid() {
        const grid = document.getElementById('avatar-options-grid');
        if (!grid) return;
        grid.innerHTML = AVATAR_PRESETS.map(a => `
            <div class="avatar-option ${pendingAvatarId === a.id ? 'selected-avatar' : ''}"
                 data-avatar-id="${a.id}"
                 style="background: ${a.gradient};"
                 onclick="window._selectAvatar('${a.id}')">
                ${a.emoji}
            </div>
        `).join('');
    }

    window._selectAvatar = function(id) {
        pendingAvatarId = id;
        document.querySelectorAll('.avatar-option').forEach(el => {
            el.classList.toggle('selected-avatar', el.dataset.avatarId === id);
        });
    };

document.addEventListener('DOMContentLoaded', () => {
    const avatarModal      = document.getElementById('avatar-picker-modal');
    const openAvatarBtn    = document.getElementById('btn-open-avatar-picker');
    const closeAvatarBtn   = document.getElementById('close-avatar-picker');
    const saveAvatarBtn    = document.getElementById('btn-save-avatar');
    const removeAvatarBtn  = document.getElementById('btn-remove-avatar');

    const customAvatarUpload = document.getElementById('custom-avatar-upload');

    if (customAvatarUpload) {
        customAvatarUpload.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;

            if (file.size > 15 * 1024 * 1024) {
                window.showToast("File too large", "Please select an image under 15MB.", "error");
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_SIZE = 256;
                    const size = Math.min(img.width, img.height);
                    const startX = (img.width - size) / 2;
                    const startY = (img.height - size) / 2;

                    canvas.width = MAX_SIZE;
                    canvas.height = MAX_SIZE;
                    const ctx = canvas.getContext('2d');
                    
                    ctx.drawImage(img, startX, startY, size, size, 0, 0, MAX_SIZE, MAX_SIZE);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

                    localStorage.setItem('enggtv_profile_pic', dataUrl);
                    localStorage.removeItem('enggtv_avatar'); // Clear preset flag
                    
                    applyAvatar();
                    if(typeof window.syncToFirebase === 'function') window.syncToFirebase();
                    window.showToast("Success", "Custom avatar uploaded!", "check_circle");
                    if (avatarModal) avatarModal.classList.remove('open');
                };
                img.src = event.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    if (openAvatarBtn) {
        openAvatarBtn.addEventListener('click', () => {
            pendingAvatarId = localStorage.getItem('enggtv_avatar') || null;
            renderAvatarGrid();
            avatarModal.classList.add('open');
        });
    }
    if (closeAvatarBtn)  closeAvatarBtn.addEventListener('click',  () => avatarModal.classList.remove('open'));
    if (avatarModal)     avatarModal.addEventListener('click', e => { if (e.target === avatarModal) avatarModal.classList.remove('open'); });

    if (saveAvatarBtn) {
        saveAvatarBtn.addEventListener('click', () => {
            if (pendingAvatarId) {
                localStorage.setItem('enggtv_avatar', pendingAvatarId);
                localStorage.removeItem('enggtv_profile_pic');
            } else {
                localStorage.removeItem('enggtv_avatar');
            }
            applyAvatar();
            if(typeof window.syncToFirebase === 'function') window.syncToFirebase(); // Sync avatar change to cloud
            avatarModal.classList.remove('open');
        });
    }
    if (removeAvatarBtn) {
        removeAvatarBtn.addEventListener('click', () => {
            pendingAvatarId = null;
            localStorage.removeItem('enggtv_avatar');
            localStorage.removeItem('enggtv_profile_pic');
            applyAvatar();
            if(typeof window.syncToFirebase === 'function') window.syncToFirebase(); // Sync avatar removal to cloud
            avatarModal.classList.remove('open');
        });
    }
});

// Expose globals
window.renderLeaderboard = renderLeaderboard;
window.applyAvatar = applyAvatar;
window.AVATAR_PRESETS = AVATAR_PRESETS;
