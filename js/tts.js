document.addEventListener('DOMContentLoaded', () => {
    const state = window.state;

    // ================================================================
    // TEXT-TO-SPEECH (TTS) STATE & UTILITIES
    // ================================================================
    const ttsState = {
        activeUtterance: null,
        isPlayingQuestion: false,
        isPlayingExplanation: false
    };

    window.stopSpeech = function() {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
        ttsState.activeUtterance = null;
        ttsState.isPlayingQuestion = false;
        ttsState.isPlayingExplanation = false;
        updateTTSButtonsState();
    };

    function updateTTSButtonsState() {
        const speakQBtn = document.getElementById('speak-question-btn');
        if (speakQBtn) {
            if (ttsState.isPlayingQuestion) {
                speakQBtn.classList.add('tts-playing');
                speakQBtn.innerHTML = `<span class="material-symbols-outlined">volume_off</span><span>Stop</span>`;
            } else {
                speakQBtn.classList.remove('tts-playing');
                speakQBtn.innerHTML = `<span class="material-symbols-outlined">volume_up</span><span>Listen</span>`;
            }
        }

        const speakEBtn = document.getElementById('speak-explanation-btn');
        if (speakEBtn) {
            if (ttsState.isPlayingExplanation) {
                speakEBtn.classList.add('tts-playing');
                speakEBtn.innerHTML = `<span class="material-symbols-outlined">volume_off</span><span>Stop</span>`;
            } else {
                speakEBtn.classList.remove('tts-playing');
                speakEBtn.innerHTML = `<span class="material-symbols-outlined">volume_up</span><span>Listen</span>`;
            }
        }
    }

    function cleanTextForSpeech(htmlOrText) {
        if (!htmlOrText) return '';
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlOrText;
        let text = tempDiv.textContent || tempDiv.innerText || '';

        // Translate common LaTeX mathematical notations to plain words
        text = text.replace(/\\frac\s*{(.*?)}{(.*?)}/g, '($1 divided by $2)');
        text = text.replace(/\\sqrt\s*{(.*?)}/g, 'square root of $1');
        text = text.replace(/([a-zA-Z0-9]+)_([a-zA-Z0-9]+)/g, '$1 sub $2');
        text = text.replace(/([a-zA-Z0-9]+)_{([a-zA-Z0-9\s+-]+)}/g, '$1 sub $2');
        text = text.replace(/([a-zA-Z0-9]+)\^2/g, '$1 squared');
        text = text.replace(/([a-zA-Z0-9]+)\^3/g, '$1 cubed');
        text = text.replace(/([a-zA-Z0-9]+)\^{([a-zA-Z0-9\s+-]+)}/g, '$1 to the power of $2');
        text = text.replace(/([a-zA-Z0-9]+)\^([a-zA-Z0-9]+)/g, '$1 to the power of $2');

        const mathReplacements = {
            '\\\\Delta': 'delta',
            '\\\\delta': 'delta',
            '\\\\pi': 'pi',
            '\\\\theta': 'theta',
            '\\\\alpha': 'alpha',
            '\\\\beta': 'beta',
            '\\\\gamma': 'gamma',
            '\\\\sigma': 'sigma',
            '\\\\mu': 'mu',
            '\\\\lambda': 'lambda',
            '\\\\omega': 'omega',
            '\\\\phi': 'phi',
            '\\\\cdot': ' times ',
            '\\\\times': ' times ',
            '\\\\approx': ' approximately ',
            '\\\\infty': 'infinity',
            '\\\\le': ' less than or equal to ',
            '\\\\ge': ' greater than or equal to ',
            '\\\\pm': ' plus or minus ',
            '\\\\neq': ' not equal to ',
            '\\\\partial': 'partial',
            '\\\\int': 'integral',
            '\\\\sum': 'summation',
            '\\*': ' times ',
            '\\+': ' plus ',
            '\\-': ' minus ',
            '\\/': ' divided by ',
            '\\\\rho': 'rho',
            '\\\\tau': 'tau',
            '\\\\eta': 'eta',
            '\\\\epsilon': 'epsilon',
            '\\\\nabla': 'nabla',
            '\\\\to': ' goes to ',
            '\\\\rightarrow': ' goes to ',
            '\\\\ln': 'natural log of ',
            '\\\\log': 'log of ',
            '\\\\sin': 'sine ',
            '\\\\cos': 'cosine ',
            '\\\\tan': 'tangent ',
            '\\\\cot': 'cotangent ',
            '\\\\sec': 'secant ',
            '\\\\csc': 'cosecant ',
            '\\\\sinh': 'hyperbolic sine ',
            '\\\\cosh': 'hyperbolic cosine ',
            '\\\\tanh': 'hyperbolic tangent '
        };

        for (const [pattern, replacement] of Object.entries(mathReplacements)) {
            const regex = new RegExp(pattern, 'g');
            text = text.replace(regex, replacement);
        }

        text = text.replace(/[\$\{\}\\\(\)\[\]]/g, ' ');
        text = text.replace(/\s+/g, ' ').trim();
        return text;
    }

    function speakText(text, onEndCallback, onErrorCallback) {
        if (!window.speechSynthesis) {
            alert("Text-to-speech is not supported in this browser.");
            if (onErrorCallback) onErrorCallback();
            return;
        }

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => 
            v.lang.startsWith('en') && 
            (v.name.includes('Google') || v.name.includes('Natural'))
        ) || voices.find(v => v.lang.startsWith('en'));
        
        if (preferredVoice) {
            utterance.voice = preferredVoice;
        }
        utterance.rate = 1.0;
        utterance.pitch = 1.0;

        utterance.onend = () => {
            if (onEndCallback) onEndCallback();
        };

        utterance.onerror = (e) => {
            console.error("TTS error:", e);
            if (onErrorCallback) onErrorCallback();
        };

        ttsState.activeUtterance = utterance;
        window.speechSynthesis.speak(utterance);
    }

    function toggleSpeakQuestion() {
        if (ttsState.isPlayingQuestion) {
            window.stopSpeech();
        } else {
            window.stopSpeech();
            const question = state.quizQuestions[state.currentQuestionIndex];
            if (!question) return;

            let textToSpeak = "Question: " + cleanTextForSpeech(question.question) + ". ";
            if (question.options && question.options.length > 0) {
                textToSpeak += "Options: ";
                question.options.forEach((opt) => {
                    textToSpeak += "Option " + opt.label + ": " + cleanTextForSpeech(opt.text) + ". ";
                });
            }

            ttsState.isPlayingQuestion = true;
            updateTTSButtonsState();

            speakText(textToSpeak, () => {
                ttsState.isPlayingQuestion = false;
                updateTTSButtonsState();
            }, () => {
                ttsState.isPlayingQuestion = false;
                updateTTSButtonsState();
            });
        }
    }

    function toggleSpeakExplanation() {
        if (ttsState.isPlayingExplanation) {
            window.stopSpeech();
        } else {
            window.stopSpeech();
            const question = state.quizQuestions[state.currentQuestionIndex];
            if (!question) return;

            let textToSpeak = "Solution Explanation. ";
            if (question.solution && question.solution.steps) {
                question.solution.steps.forEach((step, idx) => {
                    textToSpeak += "Step " + (idx + 1) + ": " + cleanTextForSpeech(step.title) + ". " + cleanTextForSpeech(step.content) + ". ";
                });
            }
            if (question.solution && question.solution.final_answer) {
                textToSpeak += "Final Answer: " + cleanTextForSpeech(question.solution.final_answer) + ".";
            }

            ttsState.isPlayingExplanation = true;
            updateTTSButtonsState();

            speakText(textToSpeak, () => {
                ttsState.isPlayingExplanation = false;
                updateTTSButtonsState();
            }, () => {
                ttsState.isPlayingExplanation = false;
                updateTTSButtonsState();
            });
        }
    }

    // Expose functions globally for app.js or html
    window.toggleSpeakQuestion = toggleSpeakQuestion;
    window.toggleSpeakExplanation = toggleSpeakExplanation;
    window.updateTTSButtonsState = updateTTSButtonsState;

    // Attach listeners
    const speakQBtn = document.getElementById('speak-question-btn');
    if (speakQBtn) {
        speakQBtn.addEventListener('click', toggleSpeakQuestion);
    }
    const speakEBtn = document.getElementById('speak-explanation-btn');
    if (speakEBtn) {
        speakEBtn.addEventListener('click', toggleSpeakExplanation);
    }
});
