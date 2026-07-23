    // ── Admin Messaging System ─────────────────────────────────────────────

    /** Show a premium toast notification */
    function showToast(message, type = 'info', durationMs = 6000) {
        const existing = document.getElementById('admin-toast');
        if (existing) existing.remove();

        const colors = {
            info:    'bg-secondary text-white',
            success: 'bg-green-500 text-white',
            warning: 'bg-amber-500 text-white',
            admin:   'bg-gradient-to-r from-secondary to-primary text-white'
        };
        const icons = { info: 'info', success: 'check_circle', warning: 'warning', admin: 'admin_panel_settings' };

        const toast = document.createElement('div');
        toast.id = 'admin-toast';
        toast.className = `fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex items-start gap-3 px-5 py-4 rounded-2xl shadow-2xl max-w-sm w-full ${colors[type] || colors.info} transition-all duration-300 opacity-0 -translate-y-4`;
        toast.innerHTML = `
            <span class="material-symbols-outlined text-xl shrink-0 mt-0.5" style="font-variation-settings:'FILL' 1;">${icons[type] || 'info'}</span>
            <div class="flex-1">
                <p class="font-bold text-[11px] uppercase tracking-widest opacity-75 mb-0.5">Message from Admin</p>
                <p class="text-sm font-medium leading-snug">${message}</p>
            </div>
            <button onclick="this.closest('#admin-toast').remove()" class="shrink-0 opacity-60 hover:opacity-100 mt-0.5">
                <span class="material-symbols-outlined text-sm">close</span>
            </button>`;
        document.body.appendChild(toast);
        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-16px)';
            setTimeout(() => toast.remove(), 400);
        }, durationMs);
    }
    /** Check for unread admin messages on login and show toast */
    async function checkAdminMessages() {
        if (!window.firebaseDb) { console.warn('window.firebaseDb is NULL - Firebase not loaded!'); return; }
        if (!window.state.user.username) { console.warn('window.state.user.username is empty'); return; }
        if (window.state.user.username === 'guest') return;
        if (window.state.user.username && window.state.user.username.toLowerCase() === 'admin') return;
        console.log('[AdminMsg] checkAdminMessages executing for:', window.state.user.username);
        try {
            // Force fresh reads from Firestore server (bypass local SDK cache)
            const opts = { source: 'server' };

            // Get best available UID
            const uid = window.state.user.uid || (window.firebase && firebase.auth().currentUser && firebase.auth().currentUser.uid) || null;

            const docsToCheck = [];

            // 1. UID-keyed document
            if (uid) {
                const uidDoc = await window.firebaseDb.collection('users').doc(uid).get(opts);
                if (uidDoc.exists) docsToCheck.push(uidDoc);
            }

            // 2. Username-keyed document
            const userDoc = await window.firebaseDb.collection('users').doc(window.state.user.username).get(opts);
            if (userDoc.exists && (!uid || userDoc.id !== uid)) docsToCheck.push(userDoc);

            // 3. Full collection scan (catches any remaining edge case)
            if (docsToCheck.length === 0) {
                const snap = await window.firebaseDb.collection('users').where('username', '==', window.state.user.username).limit(1).get(opts);
                if (!snap.empty) docsToCheck.push(snap.docs[0]);
            }

            let foundUnread = false;

            for (const doc of docsToCheck) {
                const data = doc.data();
                const messages = data.adminMessages || [];
                const unread = messages.filter(m => !m.notified);
                if (unread.length > 0 && !foundUnread) {
                    foundUnread = true;
                    const latest = unread[unread.length - 1];
                    setTimeout(() => showToast(latest.body, 'admin', 8000), 1500);
                    const updated = messages.map(m => ({ ...m, notified: true }));
                    await doc.ref.update({ adminMessages: updated });
                }
            }

        } catch(e) { console.error('[AdminMsg] Error:', e); }

        // Also render the inbox into the dashboard immediately
        await renderAdminInbox();
    }
    /** Render inbox in the support-view page */
    /** Render inbox in the support-view page */
    async function renderAdminInbox() {
        console.log('[AdminMsg] renderAdminInbox called for:', window.state.user.username);
        if (!window.firebaseDb || !window.state.user.username || window.state.user.username === 'guest' || (window.state.user.username && window.state.user.username.toLowerCase() === 'admin')) {
            console.log('[AdminMsg] renderAdminInbox aborted: invalid user state');
            return;
        }

        const inboxes = [
            { container: document.getElementById('admin-inbox-container'), list: document.getElementById('admin-inbox-list'), countBadge: document.getElementById('admin-inbox-count') },
            { container: document.getElementById('support-admin-inbox-container'), list: document.getElementById('support-admin-inbox-list'), countBadge: document.getElementById('support-admin-inbox-count') }
        ];

        try {
            const uid = window.state.user.uid || (window.firebase && firebase.auth().currentUser && firebase.auth().currentUser.uid) || null;
            let allMessages = [];

            const seenIds = new Set();
            const addMessages = (msgs) => {
                msgs.forEach(m => { if (!seenIds.has(m.id)) { seenIds.add(m.id); allMessages.push(m); } });
            };

            if (uid) {
                const d = await window.firebaseDb.collection('users').doc(uid).get();
                if (d.exists) addMessages(d.data().adminMessages || []);
            }
            const d2 = await window.firebaseDb.collection('users').doc(window.state.user.username).get();
            if (d2.exists && (!uid || d2.id !== uid)) addMessages(d2.data().adminMessages || []);

            inboxes.forEach(inbox => {
                if (!inbox.container || !inbox.list) return;
                
                if (allMessages.length === 0) { inbox.container.classList.add('hidden'); return; }
                inbox.container.classList.remove('hidden');

                const unreadCount = allMessages.filter(m => !m.read).length;
                if (inbox.countBadge) {
                    if (unreadCount > 0) {
                        inbox.countBadge.textContent = unreadCount + ' new';
                        inbox.countBadge.classList.remove('hidden');
                    } else {
                        inbox.countBadge.classList.add('hidden');
                    }
                }

                allMessages.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
                
                // Add a "Mark as Read" button at the top if there are unread messages
                const markReadBtnHTML = unreadCount > 0 
                    ? `<button onclick="window.markAdminMessagesAsRead()" class="w-full text-center text-[10px] uppercase tracking-widest font-bold text-secondary opacity-70 hover:opacity-100 transition-opacity mb-2 py-1 border border-secondary/20 rounded-full">Mark All as Read</button>`
                    : '';

                inbox.list.innerHTML = markReadBtnHTML + allMessages.map(msg => {
                    const date = msg.timestamp ? new Date(msg.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '';
                    const isUnread = !msg.read;
                    return `<div class="glass-card p-4 rounded-2xl ${isUnread ? 'border-l-4 border-secondary' : 'opacity-80'}">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center gap-2">
                                <span class="material-symbols-outlined text-secondary text-sm" style="font-variation-settings:'FILL' 1;">admin_panel_settings</span>
                                <span class="text-[11px] font-black text-secondary uppercase tracking-widest">Admin</span>
                                ${isUnread ? '<span class="text-[9px] font-black bg-secondary text-white px-1.5 py-0.5 rounded-full uppercase">New</span>' : ''}
                            </div>
                            <span class="text-[10px] text-slate-400">${date}</span>
                        </div>
                        <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">${msg.body}</p>
                    </div>`;
                }).join('');
            });
        } catch(e) { console.error('Error loading admin inbox:', e); }
    }

    async function markAdminMessagesAsRead() {
        if (!window.firebaseDb || !window.state.user.username) return;
        try {
            const uid = window.state.user.uid || (window.firebase && firebase.auth().currentUser && firebase.auth().currentUser.uid) || null;
            const docsToCheck = [];
            if (uid) docsToCheck.push(window.firebaseDb.collection('users').doc(uid));
            docsToCheck.push(window.firebaseDb.collection('users').doc(window.state.user.username));

            for (const docRef of docsToCheck) {
                const doc = await docRef.get();
                if (doc.exists) {
                    const messages = doc.data().adminMessages || [];
                    let changed = false;
                    const updated = messages.map(m => {
                        if (!m.read) { changed = true; return { ...m, read: true, notified: true }; }
                        return m;
                    });
                    if (changed) await docRef.update({ adminMessages: updated });
                }
            }
            renderAdminInbox();
        } catch (e) {
            console.error('Failed to mark messages as read', e);
        }
    }
    /** Admin: send a message to a specific user (robust dual-lookup) */
    /** Admin: send a message to a specific user (robust dual-lookup) */
    /** Admin: send a message to a specific user — dual-write for guaranteed delivery */
    async function sendAdminMessage(recipient, body) {
        if (!window.firebaseDb) { alert('Database not connected.'); return; }
        if (!recipient || !body) { alert('Please fill in both recipient username/email and message.'); return; }

        const recipientLower = recipient.trim().toLowerCase();
        const newMsg = { body: body.trim(), timestamp: Date.now(), read: false, id: Date.now().toString() };
        const docsUpdated = [];

        try {
            // 1. Query specifically by username (case-sensitive and lowercase)
            const userSnap = await window.firebaseDb.collection('users').where('username', '==', recipient).get();
            const userSnapLower = await window.firebaseDb.collection('users').where('username', '==', recipientLower).get();
            
            // 2. Query specifically by email
            const emailSnap = await window.firebaseDb.collection('users').where('email', '==', recipientLower).get();
            
            const updatePromises = [];
            const processedDocs = new Set();

            const processSnap = (snap) => {
                if (snap && !snap.empty) {
                    snap.forEach(doc => {
                        if (!processedDocs.has(doc.id)) {
                            const data = doc.data();
                            const existing = data.adminMessages || [];
                            let updated = [...existing, newMsg];
                            if (updated.length > 5) updated = updated.slice(-5);
                            updatePromises.push(doc.ref.set({ adminMessages: updated }, { merge: true }));
                            docsUpdated.push(doc.id);
                            processedDocs.add(doc.id);
                        }
                    });
                }
            };

            processSnap(userSnap);
            processSnap(userSnapLower);
            processSnap(emailSnap);

            // 2. ALSO write to the direct document ID (dual-write backup)
            const recipientDoc = await window.firebaseDb.collection('users').doc(recipientLower).get();
            if (recipientDoc.exists && !docsUpdated.includes(recipientDoc.id)) {
                const existing = recipientDoc.data().adminMessages || [];
                let updated = [...existing, newMsg];
                if (updated.length > 5) updated = updated.slice(-5);
                updatePromises.push(recipientDoc.ref.set({ adminMessages: updated }, { merge: true }));
                docsUpdated.push(recipientDoc.id);
            }

            if (updatePromises.length === 0) {
                alert('User "' + recipient + '" not found. Make sure the username or email is spelled correctly.');
                return;
            }

            await Promise.all(updatePromises);
            console.log('[AdminMsg] Message written to docs:', docsUpdated);
            alert('✅ Message sent to ' + recipient + ' successfully! (Delivered to ' + docsUpdated.length + ' profile(s))');
        } catch(e) {
            console.error('Error sending admin message:', e);
            let diagUid = "NULL (Not logged into Firebase)";
            let diagEmail = "NULL";
            if (window.firebase && window.firebase.auth && window.firebase.auth().currentUser) {
                diagUid = window.firebase.auth().currentUser.uid;
                diagEmail = window.firebase.auth().currentUser.email;
            }
            alert('Firebase rejected the message due to rules.\n\nError: ' + e.message + '\n\nYOUR CURRENT LOGIN STATE:\nUID: ' + diagUid + '\nEmail: ' + diagEmail + '\n\nIf your UID does not match the rules, or is NULL, Firebase will block you.');
        }
    }
        function setupAdminListeners() {
        const btnPurgeBots = document.getElementById('btn-purge-bots');
        if (btnPurgeBots) {
            btnPurgeBots.addEventListener('click', async () => {
                if (!window.firebaseDb) {
                    alert('Database connection not available.');
                    return;
                }
                
                const confirmPurge = confirm(
                    'Are you sure you want to scan Firestore for bot accounts? This will find and delete all user documents that:\n' +
                    '- Have 0 points and have raw UID document IDs\n' +
                    '- Or have invalid/extremely long usernames (> 20 characters)\n' +
                    '- Or have no valid username data field.'
                );
                
                if (!confirmPurge) return;
                
                btnPurgeBots.disabled = true;
                btnPurgeBots.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Purging Database...';
                
                try {
                    const querySnapshot = await window.firebaseDb.collection("users").get();
                    let deleteCount = 0;
                    let promises = [];
                    
                    querySnapshot.forEach(doc => {
                        const docId = doc.id;
                        const data = doc.data();
                        
                        if (docId === 'guest' || docId === 'admin' || docId === 'demo') return;
                        
                        // Genuinely safe purge check:
                        // NEVER delete admin, demo, guest or any document that has a registered email, a UID, progress, or points.
                        if (data.email || data.uid) return;
                        if (data.userPoints > 0) return;
                        if (data.userProgress && Object.keys(data.userProgress).length > 0) return;
                        if (data.recentActivity && data.recentActivity.length > 0) return;

                        const isUid = /^[a-zA-Z0-9]{28}$/.test(docId);
                        const isTooLong = docId.length > 20;
                        
                        if (isUid || isTooLong) {
                            console.log('�� Purging bot/duplicate account: ' + docId, data);
                            const p = window.firebaseDb.collection("users").doc(docId).delete();
                            promises.push(p);
                            deleteCount++;
                        }
                    });
                    
                    await Promise.all(promises);
                    
                    btnPurgeBots.disabled = false;
                    btnPurgeBots.innerHTML = '<span class="material-symbols-outlined text-sm">cleaning_services</span> Start Purge System';
                    
                    alert('Purge completed successfully! Deleted ' + deleteCount + ' bot/invalid accounts.');
                    
                    // Refresh leaderboard if currently viewing it
                    if (window.state.currentPage === 'leaderboard') {
                        renderLeaderboard();
                    }
                } catch (e) {
                    console.error("Purge error:", e);
                    btnPurgeBots.disabled = false;
                    btnPurgeBots.innerHTML = '<span class="material-symbols-outlined text-sm">cleaning_services</span> Start Purge System';
                    alert('Error purging database: ' + e.message);
                }
            });
        }

        const btnSendAdminMsg = document.getElementById('btn-send-admin-msg');
        if (btnSendAdminMsg) {
            btnSendAdminMsg.addEventListener('click', async () => {
                const recipientField = document.getElementById('admin-msg-recipient');
                const bodyField = document.getElementById('admin-msg-body');
                if (!recipientField || !bodyField) return;

                const recipient = recipientField.value.trim();
                const body = bodyField.value.trim();

                if (!recipient || !body) {
                    alert('Please fill in both recipient username and message.');
                    return;
                }

                btnSendAdminMsg.disabled = true;
                const originalText = btnSendAdminMsg.innerHTML;
                btnSendAdminMsg.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">sync</span> Sending...';

                try {
                    await sendAdminMessage(recipient, body);
                    bodyField.value = '';
                } catch (e) {
                    console.error('Error in click listener:', e);
                } finally {
                    btnSendAdminMsg.disabled = false;
                    btnSendAdminMsg.innerHTML = originalText;
                }
            });
        }
    }
window.checkAdminMessages = checkAdminMessages;
window.setupAdminListeners = setupAdminListeners;
window.markAdminMessagesAsRead = markAdminMessagesAsRead;