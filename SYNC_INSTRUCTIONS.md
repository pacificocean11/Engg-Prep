# How to Sync the Question Bank to Firestore

Whenever you make changes to `d:\Engg-Prep\www\questions.js` (adding text, diagrams, or new questions), those changes will **not** show up automatically in the live app or your localhost. You must push those local changes to the live database using the terminal.

### 1. Open your terminal
Make sure your terminal is currently in your project's root directory:
```powershell
cd d:\Engg-Prep
```

### 2. Choose the right script to run

**Option A: Syncing ONLY Diagrams (Fastest)**
If you only added image links (like `question_image`, `image`, or `solution_image`) to existing questions, use the targeted diagram updater. This script is very fast because it only processes questions that contain images:
```powershell
node scripts/update_diagrams.js
```

**Option B: Full Database Sync (When adding/editing text or new questions)**
If you changed the text of a question, fixed a typo, or added completely new questions, you need to use the full upload script. This will sync the entire `questions.js` file to Firestore. 
```powershell
node scripts/upload_with_delay.js
```
*(Note: Because the database is large, this script batches the uploads and pauses slightly between them so it doesn't overwhelm Firebase. Let it run until it says it is complete).*

### 3. Update the Index (Required for NEW questions)
If you added **brand new questions** (meaning the total number of questions increased), you must also update the lightweight index file so the quiz engine knows the new questions exist:
```powershell
node scripts/generate-index.js
```

### Summary Workflow
To ensure your local code and the cloud database are perfectly matched after adding new questions, get in the habit of running these two commands right after saving your file:
```powershell
node scripts/generate-index.js
node scripts/upload_with_delay.js
```
