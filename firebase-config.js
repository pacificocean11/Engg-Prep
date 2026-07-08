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

// Only enable offline persistence in production (not localhost) to prevent hanging issues
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
    db.enablePersistence({ synchronizeTabs: true })
      .then(() => {
        console.log("💾 Firestore offline persistence enabled!");
      })
      .catch((err) => {
        if (err.code === 'failed-precondition') {
          console.warn("⚠️ Offline persistence can only be enabled in one tab at a time.");
        } else if (err.code === 'unimplemented') {
          console.warn("⚠️ Browser does not support offline persistence features.");
        }
      });
} else {
    console.log("🏠 Localhost detected. Offline persistence disabled to ensure direct server connection.");
}

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
        const docSnap = await db.collection("users").doc(userId).get();
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
