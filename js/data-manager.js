function updateSyncStatus(status) {
    const syncIcon = document.getElementById('sync-icon');
    const syncText = document.getElementById('sync-text');
    const syncDot = document.getElementById('sync-dot');
    const syncIndicator = document.getElementById('cloud-sync-indicator');
    if (!syncIndicator || !syncIcon || !syncText || !syncDot) return;

    // Reset animation/color classes
    syncIcon.className = "material-symbols-outlined text-[16px]";
    syncText.className = "hidden sm:inline text-[10px] tracking-wider uppercase font-bold";
    syncDot.className = "w-2.5 h-2.5 rounded-full border border-white dark:border-slate-800 transition-all duration-300";

    if (status === 'synced') {
        syncIcon.textContent = "cloud_done";
        syncIcon.classList.add("text-green-500", "dark:text-green-400");
        syncText.textContent = "Synced";
        syncText.classList.add("text-green-600", "dark:text-green-400");
        syncDot.classList.add("bg-green-500", "shadow-[0_0_8px_#22c55e]");
        syncIndicator.title = "Your progress is fully synchronized with Firebase.";
    } else if (status === 'syncing') {
        syncIcon.textContent = "sync";
        syncIcon.classList.add("text-amber-500", "dark:text-amber-400", "animate-spin");
        syncText.textContent = "Saving...";
        syncText.classList.add("text-amber-600", "dark:text-amber-400");
        syncDot.classList.add("bg-amber-500", "animate-pulse");
        syncIndicator.title = "Saving your quiz progress to Firebase...";
    } else if (status === 'offline') {
        syncIcon.textContent = "cloud_off";
        syncIcon.classList.add("text-slate-400", "dark:text-slate-500");
        syncText.textContent = "Offline";
        syncText.classList.add("text-slate-500", "dark:text-slate-400");
        syncDot.classList.add("bg-slate-400", "dark:bg-slate-600");
        syncIndicator.title = "You are offline. Progress is saved locally in your browser.";
    } else if (status === 'error') {
        syncIcon.textContent = "cloud_off";
        syncIcon.classList.add("text-rose-500", "dark:text-rose-400");
        syncText.textContent = "Sync Error";
        syncText.classList.add("text-rose-600", "dark:text-rose-400");
        syncDot.classList.add("bg-rose-500", "animate-pulse");
        syncIndicator.title = "Failed to sync progress with Firebase. Check your connection.";
    } else if (status === 'local') {
        syncIcon.textContent = "cloud_off";
        syncIcon.classList.add("text-slate-400", "dark:text-slate-500");
        syncText.textContent = "Offline";
        syncText.classList.add("text-slate-500", "dark:text-slate-400");
        syncDot.classList.add("bg-slate-400", "dark:bg-slate-600");
        syncIndicator.title = "Progress is saved locally in your browser.";
    }
}

let firestoreSyncUnsubscribe = null;

function setupFirestoreSyncListener(docId) {
    if (firestoreSyncUnsubscribe) {
        firestoreSyncUnsubscribe();
        firestoreSyncUnsubscribe = null;
    }

    if (!docId || docId === 'guest') {
        updateSyncStatus('local');
        return;
    }

    if (!window.firebaseDb) {
        console.warn("⚠️ Firebase DB not initialized yet for sync listener.");
        updateSyncStatus('local');
        return;
    }

    console.log(`📡 Setting up Firestore sync listener for document: ${docId}`);

    try {
        updateSyncStatus(navigator.onLine ? 'syncing' : 'offline');
        firestoreSyncUnsubscribe = window.firebaseDb.collection("users").doc(docId)
            .onSnapshot({ includeMetadataChanges: true }, (docSnap) => {
                if (!navigator.onLine) {
                    updateSyncStatus('offline');
                    return;
                }

                if (docSnap.metadata.hasPendingWrites) {
                    updateSyncStatus('syncing');
                } else {
                    updateSyncStatus('synced');
                }

                // Check for new admin messages in real-time
                const data = docSnap.data();
                if (data && data.adminMessages) {
                    const hasUnread = data.adminMessages.some(m => !m.notified && !m.read);
                    if (hasUnread && window.checkAdminMessages) {
                        window.checkAdminMessages();
                    }
                }
            }, (error) => {
                console.error("❌ Firestore sync listener error:", error);
                updateSyncStatus('error');
            });
    } catch (e) {
        console.error("❌ Failed to attach Firestore sync listener:", e);
        updateSyncStatus('error');
    }
}

// Firebase Data Synchronization
async function syncToFirebase() {
    if (!window.saveUserProgress) {
        console.warn("⚠️ Firebase save function not available.");
        return;
    }
    if (!window.state.user.username || window.state.user.username === 'guest') {
        console.log("ℹ️ Skipping sync for guest user.");
        return;
    }

    console.log(`🚀 Syncing data for ${window.state.user.username} to Firebase...`);

    try {
        const lightActivity = (window.state.recentActivity || []).map(a => ({
            id: a.id,
            title: a.title,
            score: a.score,
            accuracy: a.accuracy,
            attempted: a.attempted,
            isMockExam: a.isMockExam,
            timestamp: a.timestamp,
            minimalSnapshot: a.minimalSnapshot
        }));

        // Gather all profile data
        const discipline = localStorage.getItem('enggtv_discipline') || window.state.user.discipline || 'Mechanical';
        const dateJoined = localStorage.getItem('enggtv_date_joined') || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
        const avatar = localStorage.getItem('enggtv_avatar') || null;
        const profilePic = localStorage.getItem('enggtv_profile_pic') || null;
        const country = window.state.user.country || 'Other';
        const examDate = localStorage.getItem('enggtv_exam_date') || null;

        const payload = {
            username: window.state.user.username,
            userPoints: window.state.userPoints,
            userProgress: window.state.userProgress,
            recentActivity: lightActivity,
            discipline: discipline,
            dateJoined: dateJoined,
            country: country
        };
        if (avatar) payload.avatar = avatar; else payload.avatar = null;
        if (profilePic) payload.profilePic = profilePic; else payload.profilePic = null;
        if (examDate) payload.examDate = examDate;
        if (window.state.user.uid) payload.uid = window.state.user.uid;

        const docId = window.state.user.uid || window.state.user.username;
        await window.saveUserProgress(docId, payload);
        console.log("✅ Firebase sync successful.");
    } catch (error) {
        console.error("❌ Firebase sync failed:", error);
    }
}

function mergeProgress(localProgress, cloudProgress) {
    const merged = { ...localProgress };
    if (!cloudProgress) return merged;

    Object.keys(cloudProgress).forEach(key => {
        const cloudSubj = cloudProgress[key];
        const localSubj = merged[key];

        if (cloudSubj) {
            const cloudCompleted = Number(cloudSubj.completed) || 0;
            const localCompleted = localSubj ? (Number(localSubj.completed) || 0) : 0;

            merged[key] = {
                completed: Math.max(localCompleted, cloudCompleted)
            };
        }
    });
    return merged;
}

async function loadFromFirebase() {
    if (!window.getUserProgress) {
        console.warn("⚠️ Firebase load function not available.");
        return;
    }
    if (!window.state.user.username || window.state.user.username === 'guest') {
        if (!window.state.user.uid) return;
    }

    const uidDocId = window.state.user.uid;
    const usernameDocId = window.state.user.username;

    console.log(`🚀 Loading data for ${window.state.user.username || 'unknown'} (UID doc: ${uidDocId}, Username doc: ${usernameDocId}) from Firebase...`);
    try {
        let data = null;
        let uidData = null;
        let usernameData = null;

        if (uidDocId) {
            uidData = await window.getUserProgress(uidDocId);
        }
        if (usernameDocId && usernameDocId !== uidDocId && usernameDocId !== 'guest') {
            usernameData = await window.getUserProgress(usernameDocId);
        }

        if (uidData && usernameData) {
            console.log(`🔄 Merging legacy username-based doc and UID-based doc for ${window.state.user.username}`);
            const mergedPoints = Math.max(Number(uidData.userPoints) || 0, Number(usernameData.userPoints) || 0);
            const mergedProgress = mergeProgress(uidData.userProgress || {}, usernameData.userProgress || {});

            // Merge activities safely
            const activityMap = new Map();
            (usernameData.recentActivity || []).forEach(act => { if (act && act.id) activityMap.set(act.id, act); });
            (uidData.recentActivity || []).forEach(act => { if (act && act.id) activityMap.set(act.id, act); });
            const mergedActivity = Array.from(activityMap.values());

            data = {
                ...usernameData,
                ...uidData,
                userPoints: mergedPoints,
                userProgress: mergedProgress,
                recentActivity: mergedActivity
            };

            // Save merged to UID document immediately
            await window.saveUserProgress(uidDocId, data);

            // Delete legacy username document if it's safe (excluding admin and demo)
            if (usernameDocId !== uidDocId && usernameDocId !== 'admin' && usernameDocId !== 'demo') {
                try {
                    const timeoutPromise = new Promise((_, reject) =>
                        setTimeout(() => reject(new Error('Firestore delete timed out after 10s')), 10000)
                    );
                    const deletePromise = window.firebaseDb.collection("users").doc(usernameDocId).delete();
                    await Promise.race([deletePromise, timeoutPromise]);
                    console.log(`🗑️ Deleted legacy username-based document: ${usernameDocId}`);
                } catch (err) {
                    console.error(`⚠️ Failed to delete legacy username-based document: ${usernameDocId}`, err);
                }
            }
        } else {
            data = uidData || usernameData;
        }

        // Self-healing data recovery for affected users
        const currentUid = window.state.user.uid;
        const currentUsername = window.state.user.username;
        if (currentUid === 'Yc73rbNGX7hqcz9yq5KqvGxYRFn2' || currentUsername === '49degreestemperature') {
            const currentPoints = data && data.userPoints !== undefined ? Number(data.userPoints) : 0;
            const hasProgress = data && data.userProgress && Object.keys(data.userProgress).length > 0;
            let needSync = false;

            if (!data) data = {};

            if (currentPoints < 424) {
                console.log("🩹 Self-healing: Restoring points for 49degreestemperature to 424.");
                data.userPoints = 424;
                window.state.userPoints = 424;
                localStorage.setItem(`enggtv_points_${currentUsername}`, '424');
                needSync = true;
            }

            if (!hasProgress) {
                console.log("🩹 Self-healing: Restoring progress for 49degreestemperature.");
                data.userProgress = {
                    "stats": { "completed": 50 },
                    "surveying": { "completed": 50 },
                    "math": { "completed": 70 },
                    "construction": { "completed": 50 },
                    "ethics": { "completed": 50 },
                    "electricity": { "completed": 20 },
                    "materials-science": { "completed": 50 },
                    "design": { "completed": 0 },
                    "transport": { "completed": 30 },
                    "geotech": { "completed": 10 },
                    "instr-controls": { "completed": 20 },
                    "econ": { "completed": 5 },
                    "statics": { "completed": 19 }
                };
                window.state.userProgress = data.userProgress;
                localStorage.setItem(`enggtv_progress_${currentUsername}`, JSON.stringify(data.userProgress));
                needSync = true;
            }

            if (needSync) {
                setTimeout(() => syncToFirebase(), 500);
            }
        } else if (currentUid === 'hGF6xAKljXgvKuEPTqNuHB7ft8I2' || currentUsername === 'admin') {
            const currentPoints = data && data.userPoints !== undefined ? Number(data.userPoints) : 0;
            const hasProgress = data && data.userProgress && Object.keys(data.userProgress).length > 0;
            let needSync = false;

            if (!data) data = {};

            if (currentPoints < 1000) {
                console.log("🩹 Self-healing: Restoring points for admin to 1000.");
                data.userPoints = 1000;
                window.state.userPoints = 1000;
                localStorage.setItem(`enggtv_points_${currentUsername}`, '1000');
                needSync = true;
            }

            if (!hasProgress) {
                const localProgress = JSON.parse(localStorage.getItem(`enggtv_progress_${currentUsername}`)) || {};
                if (Object.keys(localProgress).length === 0) {
                    console.log("🩹 Self-healing: Restoring progress for admin.");
                    data.userProgress = {
                        "econ": { "completed": 44 },
                        "instr-controls": { "completed": 30 },
                        "dynamics": { "completed": 40 },
                        "math": { "completed": 100 },
                        "materials-strength": { "completed": 24 },
                        "production": { "completed": 20 },
                        "electricity": { "completed": 46 },
                        "geotech": { "completed": 20 },
                        "thermo": { "completed": 20 },
                        "structural": { "completed": 20 },
                        "stats": { "completed": 63 },
                        "circuits": { "completed": 20 },
                        "heat": { "completed": 36 },
                        "statics": { "completed": 46 },
                        "surveying": { "completed": 34 },
                        "electronics": { "completed": 20 },
                        "water-res": { "completed": 40 },
                        "materials-science": { "completed": 19 },
                        "fluids": { "completed": 60 },
                        "eng-sciences": { "completed": 20 },
                        "transport": { "completed": 19 },
                        "reaction-eng": { "completed": 20 },
                        "supply-chain": { "completed": 20 },
                        "construction": { "completed": 20 },
                        "air-quality": { "completed": 20 },
                        "digital-systems": { "completed": 40 },
                        "design": { "completed": 30 },
                        "control-systems": { "completed": 20 },
                        "ethics": { "completed": 17 }
                    };
                    window.state.userProgress = data.userProgress;
                    localStorage.setItem(`enggtv_progress_${currentUsername}`, JSON.stringify(data.userProgress));
                    needSync = true;
                } else {
                    data.userProgress = localProgress;
                }
            }

            if (needSync) {
                setTimeout(() => syncToFirebase(), 500);
            }
        }

        if (data) {
            // Restore username from cloud if there's a mismatch or it was missing
            if (data.username && window.state.user.username !== data.username) {
                console.log(`🔄 Restored username from Firestore: ${data.username}`);
                window.state.user.username = data.username;
                localStorage.setItem('enggtv_user', JSON.stringify(window.state.user));

                // Reload local state for the restored username so we don't carry over stale points/progress
                window.state.userPoints = parseInt(localStorage.getItem(`enggtv_points_${data.username}`)) || 0;
                try {
                    window.state.userProgress = JSON.parse(localStorage.getItem(`enggtv_progress_${data.username}`)) || {};
                } catch (e) { window.state.userProgress = {}; }
                try {
                    window.state.recentActivity = JSON.parse(localStorage.getItem(`enggtv_recent_activity_${data.username}`)) || [];
                } catch (e) { window.state.recentActivity = []; }
            }

            if (data.userPoints !== undefined) {
                const cloudPoints = Number(data.userPoints);

                // Disable points corrupted check since it incorrectly flags legitimate points
                // gained via mock exams or partial quizzes.
                const isPointsCorrupted = false;

                if (isPointsCorrupted) {
                    console.warn(`⚠️ Detected corrupted/polluted cloud points (${cloudPoints}). Ignoring cloud points.`);
                } else if (cloudPoints > window.state.userPoints) {
                    window.state.userPoints = cloudPoints;
                    localStorage.setItem(`enggtv_points_${window.state.user.username}`, window.state.userPoints.toString());
                } else {
                    // Local is higher — sync it back up to cloud
                    console.log(` Local points (${window.state.userPoints}) >= Cloud (${cloudPoints}).`);
                }
            }
            if (data.userProgress) {
                window.state.userProgress = mergeProgress(window.state.userProgress, data.userProgress);
                localStorage.setItem(`enggtv_progress_${window.state.user.username}`, JSON.stringify(window.state.userProgress));
            }
            if (data.recentActivity) {
                const localActivity = JSON.parse(localStorage.getItem(`enggtv_recent_activity_${window.state.user.username}`)) || [];

                // Robust merge: combine local and cloud activities to prevent discarding unsynced local quizzes
                const mergedMap = new Map();

                // Load local activities first
                localActivity.forEach(act => {
                    if (act && act.id) {
                        mergedMap.set(act.id, act);
                    }
                });

                // Merge cloud activities, preserving local stateSnapshot where appropriate
                data.recentActivity.forEach(cloudAct => {
                    if (!cloudAct || !cloudAct.id) return;
                    const localAct = mergedMap.get(cloudAct.id);
                    if (localAct) {
                        const mergedAct = { ...cloudAct };
                        if (localAct.stateSnapshot && !cloudAct.stateSnapshot) {
                            mergedAct.stateSnapshot = localAct.stateSnapshot;
                        }
                        mergedMap.set(cloudAct.id, mergedAct);
                    } else {
                        mergedMap.set(cloudAct.id, cloudAct);
                    }
                });

                // Sort by timestamp descending and keep at most 100 items (for 30d chart)
                window.state.recentActivity = Array.from(mergedMap.values())
                    .filter(act => act && act.timestamp)
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 100);

                localStorage.setItem(`enggtv_recent_activity_${window.state.user.username}`, JSON.stringify(window.state.recentActivity));
            }

            if (data.discipline) {
                const localDisc = localStorage.getItem('enggtv_discipline');
                if (!localDisc) {
                    localStorage.setItem('enggtv_discipline', data.discipline);
                    window.state.user.discipline = data.discipline;
                } else {
                    window.state.user.discipline = localDisc;
                }
                try {
                    const localUser = JSON.parse(localStorage.getItem('enggtv_user')) || {};
                    localUser.discipline = window.state.user.discipline;
                    localStorage.setItem('enggtv_user', JSON.stringify(localUser));
                } catch (e) { }
            }
            if (data.dateJoined) {
                localStorage.setItem('enggtv_date_joined', data.dateJoined);
            }
            if (data.avatar) {
                localStorage.setItem('enggtv_avatar', data.avatar);
            }
            if (data.profilePic) {
                localStorage.setItem('enggtv_profile_pic', data.profilePic);
            }

            // Immediately apply avatar so it's visible before other complex UI updates
            if (window.applyAvatar) window.applyAvatar();
            if (data.country) {
                window.state.user.country = data.country;
                try {
                    const localUser = JSON.parse(localStorage.getItem('enggtv_user')) || {};
                    localUser.country = data.country;
                    localStorage.setItem('enggtv_user', JSON.stringify(localUser));
                } catch (e) {
                    console.error("Error updating country in local user state", e);
                }
            }
            if (data.examDate) {
                localStorage.setItem('enggtv_exam_date', data.examDate);
                // If countdown function exists globally, we would update it here, but it's encapsulated.
                // Reloading local storage is enough since this runs on initial load.
                const examDateInput = document.getElementById('exam-date-input');
                if (examDateInput) examDateInput.value = data.examDate;
                if (window.startCountdownGlobal) window.startCountdownGlobal(data.examDate);
            }

            if (window.updateDashboardStats) window.updateDashboardStats();
            if (window.updateGamificationUI) window.updateGamificationUI();
            if (window.renderRecentActivity) window.renderRecentActivity();
            if (window.renderSubjects) window.renderSubjects();
            if (window.updateUIForTier) window.updateUIForTier();
            console.log("✅ Data restored from Firebase.");
        }
    } catch (error) {
        console.error("❌ Firebase load failed:", error);
        throw error; // Rethrow to prevent subsequent syncToFirebase overwrites
    }
}

// Expose to window for global access
window.updateSyncStatus = updateSyncStatus;
window.setupFirestoreSyncListener = setupFirestoreSyncListener;
window.syncToFirebase = syncToFirebase;
window.mergeProgress = mergeProgress;
window.loadFromFirebase = loadFromFirebase;