// Firebase Configuration — using compat global SDK (no ES modules needed)
// This is loaded BEFORE app.js as a regular <script> tag.

const firebaseConfig = {
  apiKey: "AIzaSyCjZf_JC8j94Mgbx8KWxBO8woFLZuoHlow",
  authDomain: "fe-app-931e1.firebaseapp.com",
  projectId: "fe-app-931e1",
  storageBucket: "fe-app-931e1.firebasestorage.app",
  messagingSenderId: "136961728997",
  appId: "1:136961728997:web:bfe2248d1b66771f894f0c",
  measurementId: "G-8ZWF5170Z4"
};

// Initialize Firebase (firebase global is loaded via CDN scripts in index.html)
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Offline persistence DISABLED globally.
// enablePersistence was corrupting IndexedDB when disk space was low,
// causing all Firestore reads to hang indefinitely ("Checking" mode).
// The app works perfectly without it — Firestore will simply fetch from the server each time.
console.log("🏠 Offline persistence disabled globally for stability.");

console.log("🔥 Firebase Initialized successfully!");

// --- HELPER FUNCTIONS (synchronously available to app.js) ---

/**
 * Save user progress to Firestore.
 * Uses merge:true so it only updates the fields provided, never overwrites others.
 */
window.saveUserProgress = async function(userId, progressData) {
    if (!userId || userId === 'guest') {
        console.warn("⚠️ Cannot save progress: User is guest or undefined.");
        return;
    }
    try {
        console.log(`📤 Sending data to Firestore for user: ${userId}`, progressData);
        // Firestore does not support undefined values, so we clean the object.
        const cleanData = JSON.parse(JSON.stringify(progressData));
        await db.collection("users").doc(userId).set(cleanData, { merge: true });
        console.log("✅ Progress successfully synced to Firestore!");
    } catch (e) {
        console.error("❌ Firestore sync error details:", e);
    }
};

/**
 * Load user progress from Firestore.
 */
window.getUserProgress = async function(userId) {
    if (!userId || userId === 'guest') return null;
    try {
        // 10-second timeout to prevent "Checking" mode from hanging forever
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firestore read timed out after 10s')), 10000)
        );
        const fetchPromise = db.collection("users").doc(userId).get();
        const docSnap = await Promise.race([fetchPromise, timeoutPromise]);
        if (docSnap.exists) {
            console.log("📦 Data loaded from Firebase!");
            return docSnap.data();
        } else {
            console.log("ℹ️ No cloud save found for this user yet.");
            return null;
        }
    } catch (e) {
        console.error("❌ Firebase load error:", e);
        throw e;
    }
};

// Expose db instance globally if needed elsewhere
window.firebaseDb = db;
