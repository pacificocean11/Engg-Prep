# Engg.tv Prep — NCEES FE Exam Preparation Platform

[![Platform](https://img.shields.io/badge/platform-Web%20%7C%20PWA%20%7C%20Android-blue.svg)](https://github.com)
[![Firebase](https://img.shields.io/badge/backend-Firebase%20Firestore-orange.svg)](https://firebase.google.com/)
[![Capacitor](https://img.shields.io/badge/mobile-Capacitor-119EFF.svg)](https://capacitorjs.com/)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)

**Engg.tv Prep** is a comprehensive, interactive preparation platform for the **NCEES Fundamentals of Engineering (FE)** exam. It delivers high-yield questions, timed mock exams, formula reference sheets, theorem visualizers, and cloud progress tracking across all primary FE engineering disciplines.

---

## 🌟 Key Features

- **Disciplines Covered:**
  - ⚙️ **Mechanical Engineering**
  - ⚡ **Electrical & Computer Engineering**
  - 🏗️ **Civil Engineering**
  - 🧪 **Chemical Engineering**
  - 🌿 **Environmental Engineering**
  - 🏭 **Industrial & Systems Engineering**
  - 📐 **Other Disciplines (General FE)**
- **High-Yield Practice Questions:** Thousands of classified, exam-standard questions with worked step-by-step solutions.
- **Interactive Theorem & Mechanism Visualizer:** 3D animated explainer clips and interactive cards for key formulas (e.g., Bernoulli's principle, Ohm's law, Mohr's circle, Darcy-Weisbach, Euler buckling).
- **Timed Mock Exam Simulator:** Practice in authentic exam conditions with real-time scoring and topic diagnostics.
- **Cloud Progress Sync:** Seamless synchronization across devices using Firebase Firestore.
- **Progressive Web App (PWA):** Offline capability, service worker caching, and installable as a native-feeling app on desktop and mobile.
- **Native Android Support:** Packaged with Capacitor for full native Android distribution.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, Modern Vanilla JavaScript (ES6+), Vanilla CSS (Custom Design System + Tailwind Utilities)
- **Database & Auth:** Firebase Firestore & Firebase Auth
- **Mobile Container:** [Capacitor](https://capacitorjs.com/) (`@capacitor/core`, `@capacitor/android`)
- **Offline / PWA:** Service Worker (`sw.js`), Web App Manifest (`manifest.json`)
- **Tooling:** Node.js, `http-server`

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [Git](https://git-scm.com/) or [GitHub Desktop](https://desktop.github.com/)

### Installation & Local Run

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/engg-prep.git
   cd engg-prep
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the local development server:**
   ```bash
   npm run dev
   ```
   Open your browser and navigate to `http://localhost:8000`.

---

## 📱 Mobile Build (Android)

This project uses Capacitor to package the web application into an Android app:

```bash
# Sync web assets to Android
npx cap copy android
npx cap sync android

# Open Android Studio to build APK or run on emulator
npx cap open android
```

---

## 📁 Repository Structure

```text
├── assets/                  # Core static assets
│   ├── css/                 # Global styles and vendor styles
│   ├── js/                  # Reusable frontend modules
│   ├── images/              # Discipline icons, diagrams, and illustrations
│   └── videos/              # High-yield animated theorem explainer clips
├── js/                      # Feature modules (video player, motivation, etc.)
├── index.html               # Main application portal & dashboard
├── login.html               # Authentication & onboarding screen
├── app.js                   # Main application controller & state machine
├── notes.js                 # Study notes and formula sheets
├── questions.js             # Core question database
├── advanced_questions.js    # Advanced exam practice questions
├── firebase-config.js       # Client-side Firebase initialization
├── capacitor.config.json    # Capacitor mobile app configuration
├── manifest.json            # PWA Web Manifest
├── sw.js                    # Service Worker for offline support
└── package.json             # Project dependencies and npm scripts
```

---

## 🔒 Security & Firebase Configuration

- **Client Configuration:** `firebase-config.js` contains client-side credentials intended for web delivery.
- **Firestore Security Rules:** Ensure your Firebase project has proper security rules configured in the Firebase Console:
  ```javascript
  rules_version = '2';
  service cloud.firestore {
    match /databases/{database}/documents {
      match /users/{userId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
  ```
- **Service Account Keys:** Never commit or push any `service-account*.json` or `.pem` private keys.

---

## 📄 License

This project is licensed under the [ISC License](LICENSE).
