import React, { useState, useEffect } from 'react';

// --- Configuration ---
// CRITICAL: YOUR API KEY WAS EXPOSED.
// PLEASE REVOKE IT AND PASTE YOUR NEW KEY HERE.
const API_KEY = "AIzaSyDOZoD8oRvR6lalSVHe1hJF1lUapQYrOcA"; 
const CLOUD_MODEL = 'gemini-2.5-flash-preview-05-20';
const CLOUD_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${CLOUD_MODEL}:generateContent?key=${API_KEY}`;

// --- SVG Icons ---
const ICONS = {
  summary: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" /></svg> ),
  rewrite: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" /></svg> ),
  proofread: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg> ),
  translate: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg"><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C13.18 7.061 14.289 7.5 15.5 7.5c1.21 0 2.32-.439 3.166-1.136m0 0V3m-3.166 2.364l4.5 3.335m-4.5-3.336l-1.89 1.42A2.25 2.25 0 015.91 7.03l-2.22 2.22c-.29.29-.536.6-.71 1.007" /></svg> ),
  brain: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-toggle"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 21v-1.5M15.75 3v1.5M19.5 8.25h-1.5m-15 3.75h-1.5m15 3.75h-1.5M15.75 21v-1.5m-7.5-6v4.5c0 3 3.358 4.5 7.5 4.5s7.5-1.5 7.5-4.5v-4.5m-15 0v-4.5c0-3 3.358-4.5 7.5-4.5s7.5 1.5 7.5 4.5v4.5m-7.5-6h7.5" /></svg> ),
  cloud: ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-toggle"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15a4.5 4.5 0 004.5 4.5H18a3.75 3.75 0 001.332-7.257 3 3 0 00-3.758-3.758A3.75 3.75 0 0013.5 6.25H12c-.621 0-1.17.031-1.688.09L9.6 3.09A1.5 1.5 0 008.016 2.25H7.5a1.5 1.5 0 00-1.42 2.05l.338.674a.75.75 0 00.321.411L7.04 6.75a.75.75 0 00.41.056l1.23-.31A1.5 1.5 0 0110.02 7.5H12c.334 0 .655.02.96.059a3.75 3.75 0 01.442 7.186 2.25 2.25 0 01-2.613 2.517c-.503-.02-1-.03-1.5-.03H6.75A4.5 4.5 0 002.25 15z" /></svg> ),
  quiz: (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="icon-svg">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" />
    </svg>
  )
};

// --- API Call Helper (Cloud Fallback) ---
const callCloudApi = async (prompt, systemInstruction, maxRetries = 3) => {
  if (API_KEY === "PASTE_YOUR_API_KEY_HERE") {
    throw new Error("Please add your Google AI API key to the script.");
  }
  
  const payload = {
    contents: [{ parts: [{ text: prompt }] }],
    systemInstruction: { parts: [{ text: systemInstruction }] },
  };

  let delay = 1000;
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(CLOUD_API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const result = await response.json();
      const candidate = result.candidates?.[0];
      if (candidate && candidate.content?.parts?.[0]?.text) {
        return candidate.content.parts[0].text;
      } else {
        throw new Error("Invalid response structure from cloud API.");
      }
    } catch (error) {
      console.warn(`Cloud API call failed (attempt ${i + 1}/${maxRetries}):`, error);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
};

// --- On-Device AI Helper ---
const callOnDeviceApi = async (prompt, systemInstruction) => {
  if (!window.ai) {
    throw new Error("On-device AI (`window.ai`) is not available in this browser.");
  }
  
  const session = await window.ai.createTextSession({
    systemInstruction: systemInstruction,
  });
  
  const result = await session.prompt(prompt);
  session.destroy();
  return result;
};

// --- React Components ---

const LoadingSpinner = () => (
  <div className="loading-spinner"></div>
);

const MessageBox = ({ message, onClear }) => {
  if (!message) return null;
  return (
    <div className="message-box">
      <div className="message-box-content">
        <span className="message-text">{message}</span>
        <button onClick={onClear} className="message-close-button">X</button>
      </div>
    </div>
  );
};

const AiModeToggle = ({ aiMode, isAvailable, onToggle }) => (
  <div 
    className={`ai-toggle ${isAvailable ? 'available' : ''}`} 
    onClick={isAvailable ? onToggle : undefined} 
    title={isAvailable ? `Click to switch to ${aiMode === 'device' ? 'Cloud' : 'On-Device'} AI` : 'On-Device AI not available in this browser'}
  >
    <span className={`ai-toggle-slider ${aiMode === 'cloud' ? 'toggled' : ''}`}></span>
    <span className={`ai-toggle-icon ${aiMode === 'device' ? 'active' : ''}`}>
      {ICONS.brain}
    </span>
    <span className={`ai-toggle-icon ${aiMode === 'cloud' ? 'active' : ''}`}>
      {ICONS.cloud}
    </span>
  </div>
);

// --- Main App Component ---
function App() {
  const [inputText, setInputText] = useState('');
  const [outputResult, setOutputResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQuizLoading, setIsQuizLoading] = useState(false); // Separate loading for quiz
  const [errorMessage, setErrorMessage] = useState('');
  const [aiMode, setAiMode] = useState('cloud');
  const [isDeviceAiAvailable, setIsDeviceAiAvailable] = useState(false);

  // --- QUIZ STATE ---
  const [quizQuestions, setQuizQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [quizScore, setQuizScore] = useState(null);
  
  // Quiz JSON response schema
  const quizSchema = {
    type: "ARRAY",
    items: {
        type: "OBJECT",
        properties: {
            "questionText": { "type": "STRING" },
            "options": {
                "type": "ARRAY",
                "items": { "type": "STRING" }
            },
            "correctAnswerIndex": { "type": "NUMBER" }
        },
        required: ["questionText", "options", "correctAnswerIndex"]
    }
  };


  useEffect(() => {
    (async () => {
      if (window.ai && (await window.ai.canCreateTextSession()) === "readily") {
        setIsDeviceAiAvailable(true);
        setAiMode('device');
      } else {
        setIsDeviceAiAvailable(false);
        setAiMode('cloud');
      }
    })();
  }, []);

  const handleApiCall = async (systemInstruction, prompt) => {
    setIsLoading(true); // Loading for main output
    setOutputResult('');
    setErrorMessage('');

    try {
      let result = '';
      if (aiMode === 'device' && isDeviceAiAvailable) {
        try {
          result = await callOnDeviceApi(prompt, systemInstruction);
        } catch (deviceError) {
          console.warn("On-device AI failed, falling back to cloud:", deviceError);
          setErrorMessage("On-device AI failed. Falling back to cloud...");
          result = await callCloudApi(prompt, systemInstruction);
          setAiMode('cloud');
        }
      } else {
        result = await callCloudApi(prompt, systemInstruction);
      }
      setOutputResult(result);
    } catch (err) {
      console.error("API Call Error:", err);
      setErrorMessage(err.message || "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const createActionHandler = (systemInstruction) => () => {
    if (!inputText) {
      setErrorMessage("Please enter some text or code first.");
      return;
    }
    handleApiCall(systemInstruction, inputText);
  };

  const handleTranslate = () => {
    const lang = prompt("What language to translate to?", "Enter the language here");
    if (lang) {
      const instruction = `Translate the following text to ${lang}. Only output the translated text. Do not use any markdown formatting.`;
      createActionHandler(instruction)();
    }
  };

  const handleToggleAiMode = () => {
    if (isDeviceAiAvailable) {
      setAiMode(prev => prev === 'cloud' ? 'device' : 'cloud');
    }
  };

  // --- QUIZ FUNCTIONS ---
  
  const handleGenerateQuiz = async () => {
    if (!inputText) {
      setErrorMessage("Please paste some text into the box above to generate a quiz.");
      return;
    }
    
    setIsQuizLoading(true); // Use separate quiz loading state
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizScore(null);
    setErrorMessage('');
    
    // Updated prompt to use inputText
    const systemInstruction = "You are a helpful quiz generator. Create a 5-question multiple-choice quiz based *only* on the following text. You MUST follow the provided JSON schema. Do not add any introductory text.";
    const prompt = `Generate a 5-question quiz based *only* on this text:\n\n${inputText}`;
    
    if (API_KEY === "PASTE_YOUR_API_KEY_HERE") {
       setErrorMessage("Please add your Google AI API key to generate a quiz.");
       setIsQuizLoading(false);
       return;
    }

    // Quiz generation MUST use cloud API for JSON response
    try {
        const payload = {
          contents: [{ parts: [{ text: prompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: quizSchema,
          }
        };

        const response = await fetch(CLOUD_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        const candidate = result.candidates?.[0];
        const jsonText = candidate?.content?.parts?.[0]?.text;

        if (jsonText) {
            const parsedQuiz = JSON.parse(jsonText);
            setQuizQuestions(parsedQuiz);
        } else {
            throw new Error("Invalid JSON response structure from quiz API.");
        }

    } catch (err) {
        console.error("Quiz Generation Error:", err);
        setErrorMessage(err.message || "Could not generate the quiz.");
    } finally {
        setIsQuizLoading(false);
    }
  };
  
  const handleAnswerSelect = (questionIndex, optionIndex) => {
    setUserAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };
  
  const handleSubmitQuiz = () => {
    let score = 0;
    quizQuestions.forEach((q, index) => {
      if (userAnswers[index] === q.correctAnswerIndex) {
        score++;
      }
    });
    setQuizScore(score);
    // Find the element to scroll to
    const quizElement = document.getElementById('quiz-section-container');
    if (quizElement) {
        quizElement.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleTryAnotherQuiz = () => {
    // Doesn't clear topic, as it's linked to input text
    setQuizQuestions([]);
    setUserAnswers({});
    setQuizScore(null);
  };

  // Updated prompts to remove bold formatting
  const tools = [
    { name: 'Summarize', icon: ICONS.summary, instruction: "Summarize the following text or code. Provide a concise, high-level overview. Do not use any markdown formatting like bold text, asterisks, or headings.", action: createActionHandler("Summarize the following text or code. Provide a concise, high-level overview. Do not use any markdown formatting like bold text, asterisks, or headings.") },
    { name: 'Rewrite', icon: ICONS.rewrite, instruction: "Rewrite the following text to be more clear, professional, and concise.", action: createActionHandler("Rewrite the following text to be more clear, professional, and concise. Do not use any markdown formatting like bold text, asterisks, or headings.") },
    { name: 'Proofread', icon: ICONS.proofread, instruction: "Proofread the following text for spelling, grammar, and punctuation errors. Provide a list of corrections and then the corrected text.", action: createActionHandler("Proofread the following text for spelling, grammar, and punctuation errors. Provide a list of corrections and then the corrected text. Do not use any markdown formatting like bold text, asterisks, or headings.") },
    { name: 'Translate', icon: ICONS.translate, instruction: "", action: handleTranslate },
  ];
  
  // --- RENDER FUNCTIONS ---
  // No longer need renderToolsView or renderQuizView, will be inlined
  
  return (
    <>
      <style>{`
        /* ... existing styles ... */
        :root {
          --bg-primary: #111827;
          --bg-secondary: #1F2937;
          --bg-tertiary: #374151;
          --bg-interactive: #4B5563;
          --bg-interactive-hover: #0891B2; /* cyan-600 */
          --border-color: #374151;
          --text-primary: #E5E7EB;
          --text-secondary: #9CA3AF;
          --text-accent: #FFFFFF;
          --accent-primary: #0891B2; /* cyan-600 */
          --accent-secondary: #A78BFA; /* purple-400 */
          --accent-device: #2DD4BF; /* teal-400 */
          --error-color: #EF4444;
          --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
        }
        
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: var(--font-sans);
          background-color: var(--bg-primary);
          color: var(--text-primary);
          scroll-behavior: smooth;
        }

        .app-container {
          min-height: 100vh;
          padding: 2rem;
        }
        @media (max-width: 768px) {
          .app-container { padding: 1rem; }
        }
        
        .max-width-wrapper {
          max-width: 1152px; /* max-w-6xl */
          margin-left: auto;
          margin-right: auto;
        }

        .app-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        
        .app-header h1 {
          font-size: 1.875rem;
          font-weight: bold;
          color: var(--text-accent);
        }
        
        .header-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .ai-status-text {
          font-size: 0.875rem;
          color: var(--text-secondary);
        }
        .ai-status-text .device { color: var(--accent-device); }
        .ai-status-text .cloud { color: var(--accent-secondary); }
        @media (max-width: 768px) {
          .ai-status-text { display: none; }
        }

        /* AI Mode Toggle */
        .ai-toggle {
          position: relative;
          display: flex;
          align-items: center;
          padding: 0.25rem;
          border-radius: 9999px;
          background-color: var(--bg-tertiary);
          opacity: 0.5;
        }
        .ai-toggle.available {
          cursor: pointer;
          opacity: 1;
        }
        
        .ai-toggle-slider {
          position: absolute;
          top: 0;
          left: 0;
          width: 50%;
          height: 100%;
          border-radius: 9999px;
          background-color: var(--accent-primary);
          transition: transform 0.3s ease;
        }
        .ai-toggle-slider.toggled {
          transform: translateX(100%);
        }
        
        .ai-toggle-icon {
          position: relative;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 50%;
          padding: 0.375rem;
          border-radius: 9999px;
          color: var(--text-secondary);
          transition: color 0.3s ease;
        }
        .ai-toggle-icon.active {
          color: var(--text-accent);
        }
        .icon-toggle {
          width: 1.25rem;
          height: 1.25rem;
        }

        /* REMOVED TABS 
        .app-tabs { ... }
        */

        /* Main Grid */
        .main-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 1.5rem;
        }
        @media (min-width: 1024px) {
          .main-grid { grid-template-columns: 1fr 1fr; }
        }
        
        .input-column {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        /* Textarea */
        .input-textarea {
          width: 100%;
          height: 24rem; /* h-96 */
          padding: 1rem;
          background-color: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 0.5rem;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
          color: var(--text-primary);
          resize: none;
          font-family: inherit;
          font-size: 1rem;
        }
        .input-textarea:focus {
          outline: none;
          border-color: var(--accent-primary);
          box-shadow: 0 0 0 2px var(--accent-primary);
        }
        @media (max-width: 768px) {
          .input-textarea { height: 20rem; }
        }

        /* Tool Buttons */
        .button-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
        }
        
        .tool-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1rem;
          background-color: var(--bg-interactive);
          border-radius: 0.5rem;
          font-weight: 600;
          color: var(--text-accent);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.2s ease;
          border: none;
          cursor: pointer;
        }
        .tool-button:hover {
          background-color: var(--bg-interactive-hover);
        }
        .tool-button:focus {
          outline: none;
          box-shadow: 0 0 0 3px var(--accent-primary), 0 0 0 4px var(--bg-primary);
        }
        .tool-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .icon-svg {
          width: 1.25rem;
          height: 1.25rem;
          margin-right: 0.5rem;
        }

        /* Output Area */
        .output-area {
          width: 100%;
          height: calc(24rem + 3.5rem + 1rem); /* Match textarea + button grid height */
          padding: 1rem;
          background-color: var(--bg-secondary);
          border: 2px solid var(--border-color);
          border-radius: 0.5rem;
          box-shadow: inset 0 2px 4px 0 rgba(0, 0, 0, 0.05);
          overflow-y: auto;
          position: relative;
        }
        @media (max-width: 1024px) {
          .output-area { height: 24rem; }
        }
        @media (max-width: 768px) {
          .output-area { height: 20rem; }
        }

        .output-area-loading {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: rgba(31, 41, 55, 0.75); /* bg-gray-800 bg-opacity-75 */
        }
        
        .output-area pre {
          white-space: pre-wrap;
          word-break: break-word;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 0.95rem;
        }
        
        .output-placeholder {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: var(--text-secondary);
        }

        /* Loading Spinner */
        .loading-spinner {
          animation: spin 1s linear infinite;
          border-radius: 50%;
          width: 1.25rem;
          height: 1.25rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-bottom-color: var(--text-accent);
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* Message Box (Error Toast) */
        .message-box {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          z-index: 50;
        }
        .message-box-content {
          background-color: var(--error-color);
          color: var(--text-accent);
          padding: 1rem;
          border-radius: 0.5rem;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
          display: flex;
          align-items: center;
        }
        .message-text {
          flex: 1;
        }
        .message-close-button {
          margin-left: 1rem;
          color: var(--text-accent);
          font-weight: bold;
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1rem;
        }
        
        /* --- MODIFIED QUIZ STYLES --- */
        .quiz-section-container {
          width: 100%;
          margin-top: 2rem;
          border-top: 2px solid var(--border-color);
          padding-top: 2rem;
        }
        
        .quiz-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          padding: 4rem;
          color: var(--text-secondary);
        }
        
        /* This is the new "Generate Quiz" button container */
        .quiz-setup {
          background-color: var(--bg-secondary);
          padding: 2rem;
          border-radius: 0.5rem;
          text-align: center;
        }
        .quiz-setup h2 {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-accent);
          margin-bottom: 0.5rem;
        }
        .quiz-setup p {
          color: var(--text-secondary);
          margin-bottom: 1.5rem;
        }
        .quiz-helper-text {
          color: var(--text-secondary);
          font-size: 0.875rem;
          margin-top: 0.75rem;
          display: block;
          text-align: center;
        }
        
        /* REMOVED .quiz-topic-input */
        
        .generate-quiz-btn {
          width: 100%;
          max-width: 400px;
          margin: 0 auto;
        }
        
        .quiz-form h2, .quiz-results h2 {
          font-size: 1.5rem;
          font-weight: bold;
          color: var(--text-accent);
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        
        .quiz-question-block {
          background-color: var(--bg-secondary);
          padding: 1.5rem;
          border-radius: 0.5rem;
          margin-bottom: 1.5rem;
        }
        .quiz-question-text {
          font-size: 1.125rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 1.25rem;
        }
        .quiz-options {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .quiz-option {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          background-color: var(--bg-tertiary);
          border: 2px solid var(--border-color);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .quiz-option:hover {
          border-color: var(--accent-primary);
        }
        .quiz-option.selected {
          border-color: var(--accent-primary);
          background-color: #164e63; /* cyan-800 */
        }
        .quiz-option input[type="radio"] {
          width: 1rem;
          height: 1rem;
          margin-right: 0.75rem;
          accent-color: var(--accent-primary);
        }
        
        .submit-quiz-btn {
          width: 100%;
          font-size: 1.125rem;
        }
        
        .quiz-results .quiz-score {
          font-size: 1.75rem;
          font-weight: bold;
          color: var(--text-accent);
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .quiz-option.review {
          cursor: default;
          background-color: var(--bg-tertiary);
          border-color: var(--border-color);
        }
        .quiz-option.review.correct {
          background-color: #052e16; /* green-950 */
          border-color: #10B981; /* green-500 */
        }
        .quiz-option.review.incorrect {
          background-color: #450a0a; /* red-950 */
          border-color: #F87171; /* red-400 */
          opacity: 0.7;
        }
        .quiz-option.review.correct.incorrect {
           opacity: 1; /* Show correct answer even if user chose it */
        }
         .quiz-option.review input[type="radio"] {
            opacity: 0.6;
         }

      `}</style>
      
      <div className="app-container">
        <div className="max-width-wrapper">
          
          <header className="app-header">
            <h1>Devscribe AI</h1>
            <div className="header-controls">
              <span className="ai-status-text">
                Using: <strong className={aiMode === 'device' ? 'device' : 'cloud'}>
                  {aiMode === 'device' ? 'On-Device AI' : 'Cloud AI'}
                </strong>
              </span>
              {/* FIX: Corrected AiModeTogglegit to AiModeToggle */}
              <AiModeToggle
                aiMode={aiMode}
                isAvailable={isDeviceAiAvailable}
                onToggle={handleToggleAiMode}
              />
            </div>
          </header>
          
          {/* --- TABS REMOVED --- */}
          {/* <div className="app-tabs"> ... </div> */}

          {/* --- COMPREHENSION TOOLS --- */}
          <div className="main-grid">
            <div className="input-column">
              <textarea
                className="input-textarea"
                placeholder="Paste your text or code here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />
              <div className="button-grid">
                {tools.map((tool) => (
                  <button
                    key={tool.name}
                    onClick={tool.action}
                    disabled={isLoading}
                    className="tool-button"
                  >
                    {isLoading ? <LoadingSpinner /> : (
                      <>
                        {tool.icon}
                        {tool.name}
                      </>
                    )}
                  </button>
                ))}
              </div>
            </div>
            <div className="output-area">
              {isLoading && (
                <div className="output-area-loading">
                  <LoadingSpinner />
                </div>
              )}
              {outputResult ? (
                <pre>{outputResult}</pre>
              ) : (
                <div className="output-placeholder">
                  Your AI-generated result will appear here.
                </div>
              )}
            </div>
          </div>
          
          {/* --- GUIDED LEARNING SECTION --- */}
          <div id="quiz-section-container" className="quiz-section-container">
            
            {/* Show this button setup first */}
            {!isQuizLoading && quizQuestions.length === 0 && quizScore === null && (
              <div className="quiz-setup">
                <h2>Guided Learning</h2>
                <p>Generate a quiz based on the text you pasted above.</p>
                <button 
                  className="tool-button generate-quiz-btn" 
                  onClick={handleGenerateQuiz}
                  disabled={isQuizLoading || !inputText}
                >
                  {isQuizLoading ? <LoadingSpinner /> : <>{ICONS.quiz} Generate Quiz from Text</>}
                </button>
                {!inputText && <small className="quiz-helper-text">Paste text in the box above to enable.</small>}
              </div>
            )}
            
            {/* Show loading state */}
            {isQuizLoading && (
              <div className="quiz-loading">
                <LoadingSpinner />
                <p>Generating your quiz...</p>
              </div>
            )}
            
            {/* Show quiz questions once loaded */}
            {!isQuizLoading && quizQuestions.length > 0 && quizScore === null && (
              <div className="quiz-form">
                <h2>Quiz on your text</h2>
                {quizQuestions.map((q, qIndex) => (
                  <div key={qIndex} className="quiz-question-block">
                    <p className="quiz-question-text">{qIndex + 1}. {q.questionText}</p>
                    <div className="quiz-options">
                      {q.options.map((option, oIndex) => (
                        <label key={oIndex} className={`quiz-option ${userAnswers[qIndex] === oIndex ? 'selected' : ''}`}>
                          <input
                            type="radio"
                            name={`question-${qIndex}`}
                            checked={userAnswers[qIndex] === oIndex}
                            onChange={() => handleAnswerSelect(qIndex, oIndex)}
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button className="tool-button submit-quiz-btn" onClick={handleSubmitQuiz}>
                  Submit Assessment
                </button>
              </div>
            )}
            
            {/* Show quiz results after submission */}
            {!isQuizLoading && quizScore !== null && (
              <div className="quiz-results">
                <h2>Quiz Results</h2>
                <p className="quiz-score">You scored: {quizScore} / {quizQuestions.length}</p>
                <div className="quiz-review">
                  {quizQuestions.map((q, qIndex) => (
                    <div key={qIndex} className="quiz-question-block review">
                      <p className="quiz-question-text">{qIndex + 1}. {q.questionText}</p>
                      <div className="quiz-options">
                        {q.options.map((option, oIndex) => {
                          const isCorrect = oIndex === q.correctAnswerIndex;
                          const isUserChoice = userAnswers[qIndex] === oIndex;
                          let className = 'quiz-option review';
                          if (isCorrect) className += ' correct';
                          if (isUserChoice && !isCorrect) className += ' incorrect';
                          
                          return (
                            <label key={oIndex} className={className}>
                              <input type="radio" checked={isUserChoice} disabled />
                              {option}
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
                <button className="tool-button" onClick={handleTryAnotherQuiz}>
                  Clear Quiz
                </button>
              </div>
            )}
          </div>
          
        </div>
      </div>
      
      <MessageBox 
        message={errorMessage} 
        onClear={() => setErrorMessage('')} 
      />
    </>
  );
}

export default App;


