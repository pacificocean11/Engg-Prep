// Lightweight Dynamic Study Notes Loader for ENGG.tv
(function() {
    window.notesData = window.notesData || [];
    window.__LOADED_NOTES_DISCIPLINES__ = window.__LOADED_NOTES_DISCIPLINES__ || {};
    window.__PENDING_NOTES_DISCIPLINES__ = window.__PENDING_NOTES_DISCIPLINES__ || {};

    function normalizeNotesDiscipline(disc) {
        if (!disc) return 'mechanical';
        const lower = String(disc).toLowerCase().trim();
        if (lower.includes('mech')) return 'mechanical';
        if (lower.includes('civ')) return 'civil';
        if (lower.includes('elec') || lower.includes('computer')) return 'electrical';
        if (lower.includes('chem')) return 'chemical';
        if (lower.includes('env')) return 'environmental';
        if (lower.includes('ind')) return 'industrial';
        return 'other';
    }

    function loadDisciplineNotes(discipline) {
        const key = normalizeNotesDiscipline(discipline);
        if (window.__LOADED_NOTES_DISCIPLINES__[key]) {
            return Promise.resolve(window.notesData);
        }
        if (window.__PENDING_NOTES_DISCIPLINES__[key]) {
            return window.__PENDING_NOTES_DISCIPLINES__[key];
        }

        const promise = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = `notes_data/notes_${key}.js?v=2`;
            script.async = true;
            script.onload = () => {
                window.__LOADED_NOTES_DISCIPLINES__[key] = true;
                delete window.__PENDING_NOTES_DISCIPLINES__[key];
                console.log(`⚡ Notes loaded for discipline: ${key} (Total notes: ${window.notesData.length})`);
                
                // Invalidate cachedNotesHierarchy so it recalculates with newly loaded discipline
                if (typeof window.cachedNotesHierarchy !== 'undefined') {
                    window.cachedNotesHierarchy = null;
                }
                window.dispatchEvent(new CustomEvent('notes-loaded', { detail: { discipline: key } }));
                resolve(window.notesData);
            };
            script.onerror = (err) => {
                delete window.__PENDING_NOTES_DISCIPLINES__[key];
                console.warn(`Failed to load split notes for ${key}, falling back to notes.js`, err);
                // Fallback to legacy notes.js if split file fails
                const fallbackScript = document.createElement('script');
                fallbackScript.src = 'notes.js?v=113';
                fallbackScript.onload = () => resolve(window.notesData);
                fallbackScript.onerror = (fErr) => reject(fErr);
                document.head.appendChild(fallbackScript);
            };
            document.head.appendChild(script);
        });

        window.__PENDING_NOTES_DISCIPLINES__[key] = promise;
        return promise;
    }

    window.normalizeNotesDiscipline = normalizeNotesDiscipline;
    window.loadDisciplineNotes = loadDisciplineNotes;

    // Immediately load active discipline notes
    try {
        const activeDisc = localStorage.getItem('enggtv_discipline') || 'Mechanical';
        loadDisciplineNotes(activeDisc);
    } catch (e) {
        loadDisciplineNotes('Mechanical');
    }
})();
