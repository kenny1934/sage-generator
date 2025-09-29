/**
 * SAGE - Main Application Coordination
 * Centralized initialization, event handling, and app coordination
 */

// Main JavaScript file loading

// Initialize DOM references from config.js
let isMathRendered = true; // Default state: math is rendered
let isKaTeXLoaded = false;
let networkStatusIndicator;

// Removed Google Drive integration

// Initialize the application
function initializeApp() {
    // Initialize the main application
    
    // Initialize DOM references from config.js
    initializeDOMReferences();
    
    // Attach event listeners after DOM references are initialized
    attachEventListeners();
    
    // Phase 4: Initialize responsive layout manager
    window.layoutManager = new ResponsiveLayoutManager();
    
    // Phase 4: Clean up expired cache entries on startup
    QuestionCache.cleanup();
    
    // Phase 4: Initialize animated background
    try {
        window.mathBackground = new MathBackground();
        window.mathBackground.init();
    } catch (error) {
        console.error('MathBackground initialization failed:', error);
    }
    
    // Phase 4: Initialize swipe gestures for mobile navigation
    window.swipeHandler = new SwipeHandler();
    window.swipeHandler.init();
    
    // Phase 4: Initialize celebration engine
    window.celebrationEngine = new CelebrationEngine();
    window.celebrationEngine.init();
    
    // Load saved API key first
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeyContainer = document.getElementById('apiKeyContainer');

    // Check for both encrypted and unencrypted API keys
    const hasEncryptedKey = window.secureStorage && window.secureStorage.isApiKeyEncrypted();
    const savedApiKey = localStorage.getItem(CONFIG.STORAGE_KEY);

    if (hasEncryptedKey) {
        // Show API key container but with different message for encrypted key
        if (apiKeyContainer) {
            apiKeyContainer.style.display = 'block';
        }
        if (apiKeyInput) {
            apiKeyInput.placeholder = 'Enter password to unlock your encrypted API key';
            apiKeyInput.type = 'password';
        }
    } else if (savedApiKey && apiKeyInput && apiKeyContainer) {
        apiKeyInput.value = savedApiKey;
        apiKeyContainer.style.display = 'none';
    }
    
    // Initialize core features with delay to ensure DOM is ready
    setTimeout(() => {
        initializeSmartInput();
        
        // Check if KaTeX is loaded
        checkKaTeXLoaded();
        
        // Initialize mobile enhancements
        initializeMobileFeatures();
        
        // Initialize network monitoring
        initializeNetworkMonitoring();
        
        // Removed Google Drive initialization

        // Phase 3: Load user preferences and apply them
        loadAndApplyUserPreferences();
        
        // Phase 3: Initialize personalization features AFTER core features
        setTimeout(() => {
            initializePersonalizationFeatures();
        }, 200);
        
        // Phase 4: Initialize theme system
        initializeThemeSystem();
    }, 150);
}

// Attach all event listeners with proper null checks
function attachEventListeners() {
    
    const generateQuestionsBtn = document.getElementById('generateQuestionsBtn');
    const resetBtn = document.getElementById('resetBtn');
    const toggleMathViewBtn = document.getElementById('toggleMathViewBtn');
    const saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    const exportQuestionsBtn = document.getElementById('exportQuestionsBtn');
    const apiKeyInput = document.getElementById('apiKeyInput');
    
    
    if (generateQuestionsBtn) {
        generateQuestionsBtn.addEventListener('click', generateMathQuestions);
    } else {
    }
    
    if (resetBtn) {
        resetBtn.addEventListener('click', resetGenerator);
    } else {
    }
    
    if (toggleMathViewBtn) {
        toggleMathViewBtn.addEventListener('click', toggleMathView);
    } else {
    }
    
    if (saveApiKeyBtn) {
        saveApiKeyBtn.addEventListener('click', saveApiKey);
    } else {
    }
    
    if (exportQuestionsBtn) {
        exportQuestionsBtn.addEventListener('click', exportQuestions);
    } else {
    }
    
    if (apiKeyInput) {
        apiKeyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                saveApiKey();
            }
        });
    } else {
    }
    
    if (prevQuestionBtn) {
        prevQuestionBtn.addEventListener('click', () => navigateQuestion(-1));
    } else {
    }
    
    if (nextQuestionBtn) {
        nextQuestionBtn.addEventListener('click', () => navigateQuestion(1));
    } else {
    }
    
    
    // Keyboard navigation support
    document.addEventListener('keydown', handleKeyboardNavigation);
}

// Network monitoring and initialization
function initializeNetworkMonitoring() {
    // Monitor network status
    isOnline = navigator.onLine;
    createNetworkStatusIndicator();
    updateNetworkStatus();
    
    window.addEventListener('online', () => {
        isOnline = true;
        updateNetworkStatus();
        showNetworkMessage('🟢 Back online! All features available.', 'success');
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        updateNetworkStatus();
        showNetworkMessage('🔴 You\'re offline. Using cached content when available.', 'warning');
    });
}

// Network status indicator functions
function createNetworkStatusIndicator() {
    networkStatusIndicator = document.createElement('div');
    networkStatusIndicator.id = 'networkStatus';
    networkStatusIndicator.className = 'fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300';
    networkStatusIndicator.style.display = 'none';
    document.body.appendChild(networkStatusIndicator);
}

function updateNetworkStatus() {
    if (!networkStatusIndicator) return;
    
    if (isOnline) {
        networkStatusIndicator.className = networkStatusIndicator.className.replace(/bg-\w+-\d+/, 'bg-green-600');
        networkStatusIndicator.textContent = '🟢 Online';
        networkStatusIndicator.style.display = 'none'; // Hide when online
    } else {
        networkStatusIndicator.className = networkStatusIndicator.className.replace(/bg-\w+-\d+/, 'bg-red-600');
        networkStatusIndicator.textContent = '🔴 Offline';
        networkStatusIndicator.style.display = 'block';
    }
}

// Keyboard navigation handler
function handleKeyboardNavigation(e) {
    // ESC key to close revealed answers and hide error dialogs
    if (e.key === 'Escape') {
        // Close revealed answers
        document.querySelectorAll('.answer-content').forEach(content => {
            if (content.style.display === 'block') {
                content.style.display = 'none';
                const revealBtn = content.parentElement.querySelector('.action-btn:nth-child(2)'); // Second button (reveal)
                if (revealBtn) {
                    revealBtn.textContent = 'Show Answer & Steps';
                    revealBtn.setAttribute('aria-expanded', 'false');
                }
            }
        });
        
        // Hide error messages
        if (messageContainer.innerHTML.includes('bg-red-900/20')) {
            messageContainer.innerHTML = '';
        }
        
        // Close API key container if visible
        if (apiKeyContainer.style.display === 'block') {
            apiKeyContainer.style.display = 'none';
        }
    }
    
    // F5 or Ctrl+R to generate new questions (if topic is filled)
    if ((e.key === 'F5' || (e.ctrlKey && e.key === 'r')) && mathTopicInput.value.trim()) {
        e.preventDefault();
        if (!generateQuestionsBtn.disabled) {
            generateMathQuestions();
        }
    }
    
    // Ctrl+Enter to generate new questions (if topic is filled)
    if (e.ctrlKey && e.key === 'Enter' && mathTopicInput.value.trim()) {
        e.preventDefault();
        if (!generateQuestionsBtn.disabled) {
            generateMathQuestions();
        }
    }
    
    // Ctrl+K to focus on topic input
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const mathTopicInput = document.getElementById('mathTopic');
        if (mathTopicInput) {
            mathTopicInput.focus();
            mathTopicInput.select();
        }
    }
    
    // Ctrl+E to export questions (if available)
    if (e.ctrlKey && e.key === 'e' && currentQuestions.length > 0) {
        e.preventDefault();
        exportQuestions();
    }
    
    // Arrow keys for question navigation (if multiple questions and not typing in input field)
    if ((e.key === 'ArrowLeft' || e.key === 'ArrowRight') && totalQuestions > 1 && !questionsContainer.classList.contains('hidden')) {
        // Check if user is currently typing in an input field
        const activeElement = document.activeElement;
        const isTypingInInput = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        );
        
        // Only navigate if not typing in an input field
        if (!isTypingInInput) {
            e.preventDefault();
            const direction = e.key === 'ArrowLeft' ? -1 : 1;
            navigateQuestion(direction);
        }
    }
    
    // Number keys 1-3 to reveal specific answers (if questions are visible and not typing in input field)
    if (['1', '2', '3'].includes(e.key) && questionsContainer.classList.contains('hidden') === false) {
        // Check if user is currently typing in an input field
        const activeElement = document.activeElement;
        const isTypingInInput = activeElement && (
            activeElement.tagName === 'INPUT' || 
            activeElement.tagName === 'TEXTAREA' || 
            activeElement.tagName === 'SELECT' ||
            activeElement.isContentEditable
        );
        
        // Only reveal answers if not typing in an input field
        if (!isTypingInInput) {
            const questionIndex = parseInt(e.key) - 1;
            const questions = document.querySelectorAll('.question-item');
            if (questions[questionIndex]) {
                const revealBtn = questions[questionIndex].querySelector('.action-btn:nth-child(2)'); // Second button (reveal)
                if (revealBtn) {
                    revealBtn.click();
                }
            }
        }
    }
    
    // ? key to show keyboard shortcuts help
    if (e.key === '?' && !e.ctrlKey && !e.altKey) {
        e.preventDefault();
        showKeyboardShortcuts();
    }
    
    // Ctrl+F to show favourites
    if (e.ctrlKey && e.key === 'f') {
        e.preventDefault();
        showFavoritesPanel();
    }
}

// Math view toggle functionality
function toggleMathView() {
    isMathRendered = !isMathRendered;
    
    const toggleBtn = document.getElementById('toggleMathViewBtn');
    const mathRenderedElements = document.querySelectorAll('.math-rendered');
    const latexElements = document.querySelectorAll('.latex-view');
    
    if (isMathRendered) {
        // Show rendered math, hide LaTeX
        mathRenderedElements.forEach(el => el.style.display = 'block');
        latexElements.forEach(el => el.style.display = 'none');
        toggleBtn.textContent = 'Toggle Maths View (Rendered)';
        
        // Re-render all math content
        retryMathRendering(document.body);
        
        displayMessage('Switched to rendered math view', 'text-blue-400');
    } else {
        // Show LaTeX, hide rendered math
        mathRenderedElements.forEach(el => el.style.display = 'none');
        latexElements.forEach(el => el.style.display = 'block');
        toggleBtn.textContent = 'Toggle Maths View (LaTeX)';
        
        displayMessage('Switched to LaTeX source view', 'text-blue-400');
    }
}

// Check KaTeX loading with retries
function checkKaTeXLoaded() {
    const maxRetries = 10;
    let retryCount = 0;
    
    function tryLoadKaTeX() {
        if (typeof window.katex !== 'undefined' && window.katex.render) {
            isKaTeXLoaded = true;
            
            // Re-render any existing math content
            const mathElements = document.querySelectorAll('.math-rendered');
            if (mathElements.length > 0) {
                retryMathRendering(document.body);
            }
            
            return;
        }
        
        retryCount++;
        if (retryCount < maxRetries) {
            setTimeout(tryLoadKaTeX, 500);
        } else {
            console.warn('KaTeX failed to load after multiple attempts. Math rendering will be limited.');
            displayMessage('Warning: Math rendering library failed to load. Some math may not display correctly.', 'text-orange-400');
        }
    }
    
    tryLoadKaTeX();
}

// Save API key with validation and encryption
async function saveApiKey() {
    const apiKeyInput = document.getElementById('apiKeyInput');
    const apiKeyContainer = document.getElementById('apiKeyContainer');
    const inputValue = apiKeyInput.value.trim();

    // Check if we're dealing with encrypted key unlock or new key storage
    const hasEncryptedKey = window.secureStorage && window.secureStorage.isApiKeyEncrypted();

    if (hasEncryptedKey) {
        // This is a password to unlock encrypted key
        try {
            const decryptedKey = await window.secureStorage.getApiKey(inputValue);

            // Temporarily store decrypted key for this session
            sessionStorage.setItem('sage_current_api_key', decryptedKey);

            apiKeyContainer.style.display = 'none';
            displayMessage('API key unlocked successfully!', 'text-green-400');

            // Clear the password input
            apiKeyInput.value = '';
        } catch (error) {
            displayMessage('Incorrect password. Please try again.', 'text-red-500');
            apiKeyInput.focus();
            return;
        }
    } else {
        // This is a new API key to be stored
        const validationError = validateApiKey(inputValue);
        if (validationError) {
            displayMessage(validationError, 'text-red-500');
            apiKeyInput.focus();
            return;
        }

        // Ask user if they want to encrypt the API key
        const useEncryption = await showEncryptionDialog();

        if (useEncryption) {
            const password = await showPasswordDialog();
            if (password) {
                try {
                    await window.secureStorage.storeApiKey(inputValue, password);
                    displayMessage('API key encrypted and saved successfully!', 'text-green-400');

                    // Store decrypted key for this session
                    sessionStorage.setItem('sage_current_api_key', inputValue);
                } catch (error) {
                    displayMessage('Failed to encrypt API key. Saving unencrypted.', 'text-orange-400');
                    localStorage.setItem(CONFIG.STORAGE_KEY, inputValue);
                }
            } else {
                // User cancelled password dialog, save unencrypted
                localStorage.setItem(CONFIG.STORAGE_KEY, inputValue);
                displayMessage('API key saved (unencrypted)!', 'text-green-400');
            }
        } else {
            // Save unencrypted
            localStorage.setItem(CONFIG.STORAGE_KEY, inputValue);
            displayMessage('API key saved successfully!', 'text-green-400');
        }

        apiKeyContainer.style.display = 'none';
        apiKeyInput.value = '';
    }
}

// Show encryption dialog
async function showEncryptionDialog() {
    return new Promise((resolve) => {
        const modal = buildModalTemplate(
            'Encrypt API Key?',
            'Would you like to encrypt your API key for enhanced security? You will need to enter a password each time you use SAGE.',
            [
                {
                    text: 'Yes, Encrypt',
                    className: 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700',
                    onClick: () => {
                        modal.remove();
                        resolve(true);
                    }
                },
                {
                    text: 'No, Save Unencrypted',
                    className: 'px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700',
                    onClick: () => {
                        modal.remove();
                        resolve(false);
                    }
                }
            ]
        );

        document.body.appendChild(modal);
    });
}

// Show password dialog
async function showPasswordDialog() {
    return new Promise((resolve) => {
        const passwordInput = createElementSafe('input', {
            type: 'password',
            className: 'w-full p-2 border rounded bg-gray-700 text-white border-gray-600 focus:border-red-500',
            placeholder: 'Enter a secure password'
        });

        const strengthDiv = createElementSafe('div', {
            className: 'mt-2 text-sm'
        });

        // Add password strength checker
        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strength = checkPasswordStrength(password);
            strengthDiv.textContent = `Password strength: ${strength.level}`;
            strengthDiv.className = `mt-2 text-sm text-${strength.color}-400`;
        });

        const contentDiv = createElementSafe('div', {}, [
            createElementSafe('p', {
                textContent: 'Enter a strong password to encrypt your API key:',
                className: 'mb-3'
            }),
            passwordInput,
            strengthDiv
        ]);

        const modal = buildModalTemplate(
            'Set Encryption Password',
            contentDiv,
            [
                {
                    text: 'Encrypt',
                    className: 'px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700',
                    onClick: () => {
                        const password = passwordInput.value;
                        if (password.length < 8) {
                            alert('Password must be at least 8 characters long');
                            return;
                        }
                        modal.remove();
                        resolve(password);
                    }
                },
                {
                    text: 'Cancel',
                    className: 'px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700',
                    onClick: () => {
                        modal.remove();
                        resolve(null);
                    }
                }
            ]
        );

        document.body.appendChild(modal);
        passwordInput.focus();
    });
}

// Check password strength
function checkPasswordStrength(password) {
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score < 3) return { level: 'Weak', color: 'red' };
    if (score < 5) return { level: 'Medium', color: 'yellow' };
    return { level: 'Strong', color: 'green' };
}

// Export questions to text file
function exportQuestions() {
    if (currentQuestions.length === 0) {
        displayMessage('No questions to export. Generate some questions first.', 'text-orange-400');
        return;
    }

    const timestamp = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
    const topic = mathTopicInput.value.trim() || 'Math Questions';
    const difficulty = difficultySelect.value;
    
    let exportContent = `Math Questions Export\n`;
    exportContent += `Generated on: ${new Date().toLocaleString()}\n`;
    exportContent += `Topic: ${topic}\n`;
    exportContent += `Difficulty: ${difficulty}\n`;
    exportContent += `\n${'='.repeat(50)}\n\n`;

    currentQuestions.forEach((problem, index) => {
        exportContent += `Problem ${index + 1}:\n`;
        exportContent += `${problem.question}\n\n`;
        exportContent += `Answer:\n${problem.correctAnswer}\n\n`;
        exportContent += `Solution:\n${problem.stepByStepSolution}\n\n`;
        exportContent += `${'-'.repeat(30)}\n\n`;
    });

    // Create and download file
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sage-questions-${timestamp}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    displayMessage('Questions exported successfully!', 'text-green-400');
}

// Reset generator state
function resetGenerator() {
    const mathTopicInput = document.getElementById('mathTopic');
    const difficultySelect = document.getElementById('difficulty');
    const mathQuestionsList = document.getElementById('mathQuestionsList');
    const questionsContainer = document.getElementById('questionsContainer');
    const resetBtn = document.getElementById('resetBtn');
    const initialMessage = document.getElementById('initialMessage');
    const messageContainer = document.getElementById('messageContainer');
    
    if (mathTopicInput) mathTopicInput.value = ''; // Clear input
    if (difficultySelect) difficultySelect.value = 'Medium'; // Reset difficulty
    if (mathQuestionsList) mathQuestionsList.innerHTML = ''; // Clear questions
    currentQuestions = []; // Clear stored questions
    currentQuestionIndex = 0;
    totalQuestions = 0;
    
    const questionNavigator = document.getElementById('questionNavigator');
    if (questionNavigator) questionNavigator.classList.add('hidden'); // Hide navigator
    if (questionsContainer) questionsContainer.classList.add('hidden');
    if (resetBtn) resetBtn.classList.add('hidden');
    if (initialMessage) initialMessage.classList.remove('hidden'); // Show initial message again
    if (messageContainer) messageContainer.innerHTML = ''; // Clear any messages
}

// Phase 3: Load and apply user preferences
function loadAndApplyUserPreferences() {
    const preferences = DataManager.loadPreferences();
    
    const difficultySelect = document.getElementById('difficulty');
    const mathTopicInput = document.getElementById('mathTopic');
    
    // Apply preferred difficulty
    if (difficultySelect && preferences.preferredDifficulty) {
        difficultySelect.value = preferences.preferredDifficulty;
    }
    
    // Set last used topic if available
    if (mathTopicInput && preferences.lastUsedTopic) {
        mathTopicInput.value = preferences.lastUsedTopic;
    }
}

// Phase 4: Theme System Functions
function initializeThemeSystem() {
    
    // Load saved theme preference or default to dark
    const savedTheme = localStorage.getItem('sage-theme') || 'dark';
    applyTheme(savedTheme);
    
    // Set up theme toggle button
    const themeToggleBtn = document.getElementById('themeToggle');
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', toggleTheme);
    } else {
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    
    // Save preference
    localStorage.setItem('sage-theme', newTheme);
    
}

function applyTheme(theme) {
    // Apply theme to document root
    document.documentElement.setAttribute('data-theme', theme);
    
    // Update theme icon
    const themeIcon = document.querySelector('#themeToggle .theme-icon');
    if (themeIcon) {
        themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
    
}

// Phase 3: Initialize personalization features
function initializePersonalizationFeatures() {
    try {
        
        // Add recently used topics section
        addRecentTopicsSection();
        
        // Add topic recommendations
        addTopicRecommendationsSection();
        
        // Add stats dashboard
        addStatsDashboard();
        
        // Update stats display (with error handling)
        setTimeout(() => {
            try {
                updateStatsDisplay();
            } catch (statsError) {
                console.error('Error updating stats display:', statsError);
                // Don't let stats errors break the app
            }
        }, 100);
        
    } catch (error) {
        console.error('Error initializing personalization features:', error);
        // Don't let personalization errors break core functionality
    }
}


// Main question generation function
async function generateMathQuestions() {
    const mathTopicInput = document.getElementById('mathTopic');
    const difficultySelect = document.getElementById('difficulty');
    const modelSelector = document.getElementById('modelSelector');

    if (!mathTopicInput || !difficultySelect || !modelSelector) {
        console.error('Required input elements not found');
        displayMessage("Error: Required form elements not found.", "text-red-500");
        return;
    }

    const mathTopic = mathTopicInput.value.trim();
    const difficulty = difficultySelect.value;
    const selectedModel = modelSelector.value;

    // Get API key from session storage (if decrypted) or localStorage (if unencrypted)
    let apiKey = sessionStorage.getItem('sage_current_api_key') || localStorage.getItem(CONFIG.STORAGE_KEY);

    // Check if we have an encrypted key but no current session key
    const hasEncryptedKey = window.secureStorage && window.secureStorage.isApiKeyEncrypted();

    // Validation
    if (!apiKey) {
        const apiKeyContainer = document.getElementById('apiKeyContainer');
        if (apiKeyContainer) {
            apiKeyContainer.style.display = 'block';
        }

        if (hasEncryptedKey) {
            displayMessage("Please enter your password to unlock the encrypted API key.", "text-red-500");
        } else {
            displayMessage("Please enter your Gemini API key first.", "text-red-500");
        }
        return;
    }

    const validationError = validateInput(mathTopic);
    if (validationError) {
        displayMessage(validationError, "text-red-500");
        return;
    }

    // Phase 4: Update usage streak and check for achievements
    const streakData = DataManager.updateUsageStreak();
    const newAchievements = DataManager.getNewAchievements();
    
    // Show achievement notifications if any
    if (newAchievements.length > 0) {
        showAchievementNotifications(newAchievements);
    }

    // Hide previous messages/questions, show loading
    const initialMessage = document.getElementById('initialMessage');
    const questionsContainer = document.getElementById('questionsContainer');
    const resetBtn = document.getElementById('resetBtn');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const generateQuestionsBtn = document.getElementById('generateQuestionsBtn');
    const mathQuestionsList = document.getElementById('mathQuestionsList');
    const messageContainer = document.getElementById('messageContainer');
    
    if (initialMessage) initialMessage.classList.add('hidden');
    if (questionsContainer) questionsContainer.classList.add('hidden');
    if (resetBtn) resetBtn.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.remove('hidden');
    if (generateQuestionsBtn) generateQuestionsBtn.disabled = true;
    if (mathQuestionsList) mathQuestionsList.innerHTML = '';
    if (messageContainer) messageContainer.innerHTML = '';
    
    // Start enhanced loading animation
    startLoadingAnimation();

    // BACKUP - Original working prompt (saved before improvements):
    /*
    const originalPrompt = `
        Generate 3 math problems for the following topic and grade level, with a difficulty level of "${difficulty}".
        For each problem, provide:
        - A "question" in LaTeX format (use $$ for display math, $ for inline math).
        - A "correctAnswer" in LaTeX format.
        - A "stepByStepSolution" in LaTeX format, explaining how to solve the problem.

        Math Topic & Grade Level: ${sanitizeString(mathTopic)}
        Difficulty: ${difficulty}

        Provide the output as a JSON array of objects. Each object in the array represents one problem.
        Example JSON structure:
        [
          {
            "question": "$$2x + 5 = 11$$ Solve for x.",
            "correctAnswer": "$$x = 3$$",
            "stepByStepSolution": "To solve $2x + 5 = 11$: \\n 1. Subtract 5 from both sides: $2x = 11 - 5 \\implies 2x = 6$. \\n 2. Divide by 2: $x = 6 / 2 \\implies x = 3$."
          },
          {
            "question": "What is the area of a rectangle with length $l = 5$ cm and width $w = 3$ cm?",
            "correctAnswer": "$$15 \\text{ cm}^2$$",
            "stepByStepSolution": "The area of a rectangle is given by the formula $A = l \\times w$. \\n Given $l=5$ cm and $w=3$ cm, \\n $A = 5 \\times 3 = 15 \\text{ cm}^2$."
          }
        ]
        Ensure the LaTeX is correctly escaped for JSON strings.
    `;
    */

    // Detect if the query contains Chinese characters
    const containsChinese = /[\u4e00-\u9fff]/.test(mathTopic);
    const languageInstruction = containsChinese ? 
        "LANGUAGE: Respond in Traditional Chinese (繁體中文). Use Traditional Chinese characters for all text content." :
        "";

    // Improved prompt with quality standards and format enforcement
    const prompt = `
You are an expert mathematics educator and curriculum designer with extensive experience creating high-quality assessment materials. You specialize in generating pedagogically sound problems with consistent formatting and clear solutions for teaching purposes.

CRITICAL: You MUST return a valid JSON array with exactly 3 objects. Each object must contain exactly these three fields: "question", "correctAnswer", "stepByStepSolution".

${languageInstruction}

Generate 3 math problems for: ${sanitizeString(mathTopic)}
Difficulty Level: ${difficulty}

QUESTION STANDARDS:
- Match real textbook difficulty - include challenging computational work where appropriate
- Use realistic numbers that may require substantial calculation (authentic to curriculum)
- Problems should reflect actual classroom/exam standards, not simplified versions

TEACHING SOLUTIONS:
- Show complete mathematical steps with clear reasoning
- Keep explanations concise and focused
- Mention one common student error if relevant (use \\n for line breaks)
- Include key teaching point when helpful (use \\n for line breaks)

Math Topic & Grade Level: ${sanitizeString(mathTopic)}
Difficulty: ${difficulty}

REQUIRED OUTPUT FORMAT - DO NOT DEVIATE:
- Valid JSON array with exactly 3 problem objects
- Each object has: "question", "correctAnswer", "stepByStepSolution"  
- All LaTeX properly escaped: use \\n for line breaks, \\text{} for units
- Use $$ for display math, $ for inline math
- Use \\implies for logical steps
- NEVER use HTML tags like <br> - ONLY use \\n for line breaks

Provide the output as a JSON array of objects. Each object in the array represents one problem.
Example JSON structure:
[
  {
    "question": "$$2x + 5 = 11$$ Solve for x.",
    "correctAnswer": "$$x = 3$$",
    "stepByStepSolution": "To solve $2x + 5 = 11$: \\n 1. Subtract 5 from both sides: $2x = 11 - 5 \\implies 2x = 6$. \\n 2. Divide by 2: $x = 6 / 2 \\implies x = 3$."
  },
  {
    "question": "What is the area of a rectangle with length $l = 5$ cm and width $w = 3$ cm?",
    "correctAnswer": "$$15 \\text{ cm}^2$$",
    "stepByStepSolution": "The area of a rectangle is given by the formula $A = l \\times w$. \\n Given $l=5$ cm and $w=3$ cm, \\n $A = 5 \\times 3 = 15 \\text{ cm}^2$."
  }
]
Ensure the LaTeX is correctly escaped for JSON strings.
    `;

    try {
        let chatHistory = [];
        chatHistory.push({ role: "user", parts: [{ text: prompt }] });

        const payload = {
            contents: chatHistory,
            generationConfig: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: "ARRAY",
                    items: {
                        type: "OBJECT",
                        properties: {
                            "question": { "type": "STRING" },
                            "correctAnswer": { "type": "STRING" },
                            "stepByStepSolution": { "type": "STRING" }
                        },
                        "propertyOrdering": ["question", "correctAnswer", "stepByStepSolution"]
                    }
                }
            }
        };

        // Check force new questions option
        const forceNewQuestions = document.getElementById('forceNewQuestions')?.checked || false;
        
        // Phase 4: Check cache before making API call (unless forced to skip)
        const debugForceFallback = false; // Set to true to test fallback questions
        
        if (!forceNewQuestions) {
            const cachedQuestions = QuestionCache.get(mathTopic, difficulty);
            if (cachedQuestions) {
                displayMathQuestions(cachedQuestions, true); // Pass true to indicate cached
                return;
            }
        }

        // TEMPORARY: Force fallback for testing
        if (debugForceFallback) {
            const fallbackQuestions = getFallbackQuestions(mathTopic, difficulty);
            displayMathQuestions(fallbackQuestions, false);
            return;
        }

        // Get the model configuration
        const modelConfig = GEMINI_MODELS[selectedModel];
        if (!modelConfig) {
            displayMessage(`Error: Unknown model selected: ${selectedModel}`, "text-red-500");
            return;
        }

        // Estimate cost before API call
        const promptText = prompt;
        const costEstimate = window.costTracker.estimateCost(promptText, selectedModel);
        console.log(`Estimated cost for ${modelConfig.name}: ${window.costTracker.formatCurrency(costEstimate.totalCost)}`);

        // Check budget before proceeding
        const budgetStatus = window.costTracker.getBudgetStatus();
        if (budgetStatus.isOverBudget) {
            const proceed = confirm(`You are over your monthly budget of ${window.costTracker.formatCurrency(budgetStatus.monthlyBudget)}. Current usage: ${window.costTracker.formatCurrency(budgetStatus.monthlyCost)}. Do you want to proceed anyway?`);
            if (!proceed) {
                displayMessage("Request cancelled due to budget limit.", "text-yellow-500");
                return;
            }
        }

        // Use the selected model's endpoint
        const apiUrl = `${modelConfig.endpoint}?key=${apiKey}`;
        const result = await makeAPICallWithRetry(apiUrl, payload);

        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            const jsonText = result.candidates[0].content.parts[0].text;
            try {
                const mathProblems = JSON.parse(jsonText);
                
                if (Array.isArray(mathProblems) && mathProblems.length > 0) {
                    // Clean up any HTML tags and standardize line breaks
                    mathProblems.forEach((problem) => {
                        if (problem.stepByStepSolution) {
                            problem.stepByStepSolution = problem.stepByStepSolution
                                .replace(/<br\s*\/?>/gi, '\n')  // Convert <br> to actual newlines
                                .replace(/<\/p>/gi, '\n')
                                .replace(/<p>/gi, '')
                                .replace(/<[^>]*>/g, '') // Remove any other HTML tags
                                .replace(/\\n/g, '\n'); // Convert literal \\n to actual newlines

                            // Fix LaTeX commands that might get truncated by JSON processing
                            problem.stepByStepSolution = problem.stepByStepSolution
                                .replace(/([^\\])otin/g, '$1\\notin')
                                .replace(/^otin/g, '\\notin')
                                .replace(/([^\\])quad/g, '$1\\quad')
                                .replace(/^quad/g, '\\quad')
                                .replace(/([^\\])cdot/g, '$1\\cdot')
                                .replace(/^cdot/g, '\\cdot')
                                .replace(/([^\\])neq/g, '$1\\neq')
                                .replace(/^neq/g, '\\neq');
                        }
                    });
                    
                    // Phase 4: Cache the questions before displaying
                    QuestionCache.set(mathTopic, difficulty, mathProblems);
                    displayMathQuestions(mathProblems, false); // Pass false to indicate newly generated

                    // Record actual usage for cost tracking
                    const outputText = jsonText;
                    const actualInputTokens = window.costTracker.estimateTokens(promptText);
                    const actualOutputTokens = window.costTracker.estimateTokens(outputText);
                    const actualCost = window.costTracker.recordUsage(selectedModel, actualInputTokens, actualOutputTokens);

                    // Update cost display
                    updateCostDisplay();

                    console.log(`Actual cost: ${window.costTracker.formatCurrency(actualCost)} (${actualInputTokens} input + ${actualOutputTokens} output tokens)`);

                    // Save selected model preference
                    localStorage.setItem(CONFIG.SELECTED_MODEL_KEY, selectedModel);
                } else {
                    console.error("Response is not a valid array:", mathProblems);
                    throw new Error('Invalid response format - not an array or empty');
                }
            } catch (parseError) {
                console.error("Error parsing JSON response:", parseError);
                console.error("Raw response that failed to parse:", jsonText);
                displayMessage("Sorry, I received an invalid response format. Please try again.", "text-red-500");
            }
        } else {
            displayMessage("Sorry, I couldn't generate math problems. Please check your API key and try again.", "text-red-500");
            console.error("Gemini API response structure unexpected:", result);
        }

    } catch (error) {
        console.error("Error generating math questions:", error);
        
        // Try fallback content if offline or network error
        if (!isOnline || error.message.includes('No internet connection') || error.message.includes('network') || error.message.includes('fetch')) {
            updateLoadingMessage("Using offline fallback questions...");
            setTimeout(() => {
                const fallbackQuestions = getFallbackQuestions(mathTopic, difficulty);
                console.log('🔍 DEBUG: Fallback questions (first solution):');
                console.log('Fallback stepByStepSolution:', fallbackQuestions[0]?.stepByStepSolution);
                console.log('Contains \\\\n:', fallbackQuestions[0]?.stepByStepSolution?.includes('\\n'));
                console.log('Has actual newlines:', fallbackQuestions[0]?.stepByStepSolution?.includes('\n'));
                console.log('Newline count:', (fallbackQuestions[0]?.stepByStepSolution?.match(/\n/g) || []).length);
                displayMathQuestions(fallbackQuestions, false); // Fallback questions count as new
                showNetworkMessage('📚 Showing sample questions (offline mode)', 'warning');
            }, 1000);
        } else {
            displayEnhancedError(error);
            
            // Show API key container for auth errors
            const apiKeyContainer = document.getElementById('apiKeyContainer');
            if (error.message.includes('401') || error.message.includes('403')) {
                apiKeyContainer.style.display = 'block';
            }
        }
    } finally {
        stopLoadingAnimation();
        const loadingIndicator = document.getElementById('loadingIndicator');
        const generateQuestionsBtn = document.getElementById('generateQuestionsBtn');
        
        if (loadingIndicator) loadingIndicator.classList.add('hidden');
        if (generateQuestionsBtn) generateQuestionsBtn.disabled = false;
    }
}

// Display generated math questions
function displayMathQuestions(problems, isFromCache = false) {
    console.log('🔍 DEBUG: displayMathQuestions called!');
    console.log('Problems array:', problems);
    console.log('Problems length:', problems?.length);
    console.log('Is from cache:', isFromCache);
    console.log('First problem has stepByStepSolution:', !!problems[0]?.stepByStepSolution);
    console.log('First problem solution has newlines:', problems[0]?.stepByStepSolution?.includes('\n'));
    
    const mathQuestionsList = document.getElementById('mathQuestionsList');
    const questionsContainer = document.getElementById('questionsContainer');
    const resetBtn = document.getElementById('resetBtn');
    const mathTopicInput = document.getElementById('mathTopic');
    const difficultySelect = document.getElementById('difficulty');
    const messageContainer = document.getElementById('messageContainer');
    
    console.log('🔍 DEBUG: DOM elements found:');
    console.log('mathQuestionsList:', !!mathQuestionsList);
    console.log('questionsContainer:', !!questionsContainer);
    console.log('resetBtn:', !!resetBtn);
    console.log('mathTopicInput:', !!mathTopicInput);
    console.log('difficultySelect:', !!difficultySelect);
    console.log('messageContainer:', !!messageContainer);
    
    if (mathQuestionsList) {
        mathQuestionsList.innerHTML = ''; // Clear previous questions
    }
    currentQuestions = problems; // Store for export functionality
    totalQuestions = problems.length;
    currentQuestionIndex = 0; // Reset to first question
    
    if (!Array.isArray(problems) || problems.length === 0) {
        displayMessage("No math problems were generated. Please try with a different topic.", "text-orange-400");
        return;
    }

    console.log('🔍 DEBUG: Starting to create question items...');
    
    problems.forEach((problem, index) => {
        console.log(`🔍 DEBUG: Processing problem ${index + 1}`);
        console.log('Problem data:', {
            hasQuestion: !!problem.question,
            hasAnswer: !!problem.correctAnswer,
            hasStepByStepSolution: !!problem.stepByStepSolution,
            solutionLength: problem.stepByStepSolution?.length,
            solutionHasNewlines: problem.stepByStepSolution?.includes('\n')
        });
        
        try {
            console.log('🔍 DEBUG: createQuestionItem function exists:', typeof createQuestionItem !== 'undefined');
            const problemDiv = createQuestionItem(problem, index, mathTopicInput.value.trim());
            console.log(`🔍 DEBUG: createQuestionItem returned:`, !!problemDiv);
            
            // Add answer reveal functionality
            setupAnswerReveal(problemDiv, problemDiv.querySelector('.answer-content'));
            
            mathQuestionsList.appendChild(problemDiv);
            console.log(`🔍 DEBUG: Problem ${index + 1} added to DOM`);
        } catch (error) {
            console.error(`🔍 DEBUG: Error creating problem ${index + 1}:`, error);
        }
    });
    
    console.log('🔍 DEBUG: Finished creating question items');

    questionsContainer.classList.remove('hidden');
    resetBtn.classList.remove('hidden');
    
    // Phase 4: Move questions to canvas on desktop
    if (window.layoutManager) {
        window.layoutManager.moveQuestionsToCanvas();
    }
    
    // Initialize question navigation
    if (totalQuestions > 1) {
        document.getElementById('questionNavigator').classList.remove('hidden');
        showQuestion(currentQuestionIndex);
        updateNavigationState();
    } else {
        // Show single question
        const questions = document.querySelectorAll('.question-item');
        if (questions.length > 0) {
            questions[0].classList.add('active');
        }
    }
    
    // Phase 3: Save to history and update preferences
    const topic = mathTopicInput.value.trim();
    const difficulty = difficultySelect.value;
    
    // Only update history and stats for newly generated questions, not cached ones
    if (!isFromCache) {
        DataManager.addToHistory(topic, difficulty, problems.length);
        console.log('Stats updated for newly generated questions');
    } else {
        console.log('Serving cached questions - stats not updated');
        // Show a subtle indicator that these are cached questions
        showNetworkMessage('📋 Showing previous questions (tip: check "Generate fresh questions" for new ones)', 'info');
    }
    
    // Update user preferences
    const preferences = DataManager.loadPreferences();
    preferences.lastUsedTopic = topic;
    preferences.preferredDifficulty = difficulty;
    
    // Add to preferred topics if not already there
    const topicLower = topic.toLowerCase();
    if (!preferences.preferredTopics.some(t => t.toLowerCase() === topicLower)) {
        preferences.preferredTopics.unshift(topic);
        preferences.preferredTopics = preferences.preferredTopics.slice(0, 10); // Keep only top 10
    }
    
    DataManager.savePreferences(preferences);
    
    // Update UI components
    updateStatsDisplay();
    updateRecentTopicsDisplay();
    
    // Initial rendering of math after questions are added to DOM
    // Use retry mechanism to ensure KaTeX has time to initialize
    retryMathRendering(mathQuestionsList);
    
    // Ensure initial view state is applied based on isMathRendered
    document.querySelectorAll('.math-rendered').forEach(renderedDiv => {
        renderedDiv.style.display = isMathRendered ? 'block' : 'none';
    });
    document.querySelectorAll('.latex-view').forEach(latexDiv => {
        latexDiv.style.display = isMathRendered ? 'none' : 'block';
    });
}

// Add fallback content for offline scenarios
function getFallbackQuestions(topic, difficulty) {
    const fallbackQuestions = {
        easy: [
            {
                question: "Solve for x: $2x + 5 = 11$",
                correctAnswer: "$x = 3$",
                stepByStepSolution: "1. Subtract 5 from both sides: $2x = 6$\\n2. Divide both sides by 2: $x = 3$"
            },
            {
                question: "What is $3 \\times 7$?",
                correctAnswer: "$21$",
                stepByStepSolution: "Simple multiplication: $3 \\times 7 = 21$"
            },
            {
                question: "Find the area of a rectangle with length 5 cm and width 3 cm.",
                correctAnswer: "$15 \\text{ cm}^2$",
                stepByStepSolution: "Area = length × width = $5 \\times 3 = 15 \\text{ cm}^2$"
            }
        ],
        medium: [
            {
                question: "Solve the quadratic equation: $x^2 - 5x + 6 = 0$",
                correctAnswer: "$x = 2$ or $x = 3$",
                stepByStepSolution: "1. Factor: $(x-2)(x-3) = 0$\\n2. Set each factor to zero: $x-2=0$ or $x-3=0$\\n3. Solve: $x = 2$ or $x = 3$"
            },
            {
                question: "Find the derivative of $f(x) = 3x^2 + 2x - 1$",
                correctAnswer: "$f'(x) = 6x + 2$",
                stepByStepSolution: "Using power rule: $\\frac{d}{dx}[3x^2] = 6x$, $\\frac{d}{dx}[2x] = 2$, $\\frac{d}{dx}[-1] = 0$\\nTherefore: $f'(x) = 6x + 2$"
            },
            {
                question: "Simplify: $\\frac{x^2 - 4}{x + 2}$ for $x \\neq -2$",
                correctAnswer: "$x - 2$",
                stepByStepSolution: "1. Factor numerator: $x^2 - 4 = (x+2)(x-2)$\\n2. Cancel common factor: $\\frac{(x+2)(x-2)}{x+2} = x-2$"
            }
        ],
        hard: [
            {
                question: "Evaluate: $\\int_0^\\pi \\sin(x) \\, dx$",
                correctAnswer: "$2$",
                stepByStepSolution: "1. Find antiderivative: $\\int \\sin(x) \\, dx = -\\cos(x) + C$\\n2. Apply limits: $[-\\cos(x)]_0^\\pi = -\\cos(\\pi) - (-\\cos(0)) = -(-1) - (-1) = 2$"
            },
            {
                question: "Find the limit: $\\lim_{x \\to 0} \\frac{\\sin(x)}{x}$",
                correctAnswer: "$1$",
                stepByStepSolution: "This is a standard limit. Using L'Hôpital's rule or the squeeze theorem:\\n$\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1$"
            },
            {
                question: "Solve the system: $\\begin{cases} 2x + 3y = 7 \\\\ 4x - y = 2 \\end{cases}$",
                correctAnswer: "$x = 1, y = \\frac{5}{3}$",
                stepByStepSolution: "1. From equation 2: $y = 4x - 2$\\n2. Substitute into equation 1: $2x + 3(4x - 2) = 7$\\n3. Simplify: $2x + 12x - 6 = 7$, so $14x = 13$, thus $x = \\frac{13}{14}$\\n4. Find y: $y = 4(\\frac{13}{14}) - 2 = \\frac{26}{14} - 2 = \\frac{26-28}{14} = -\\frac{1}{7}$"
            }
        ]
    };
    
    const difficultyLevel = difficulty.toLowerCase();
    const questions = fallbackQuestions[difficultyLevel] || fallbackQuestions.medium;
    
    // Return a copy to avoid modifying the original
    return questions.map(q => ({ ...q }));
}

// Model selector and cost tracking functions
function updateModelDescription() {
    const modelSelector = document.getElementById('modelSelector');
    const modelDescription = document.getElementById('modelDescription');

    if (!modelSelector || !modelDescription) return;

    const selectedModel = modelSelector.value;
    const modelConfig = GEMINI_MODELS[selectedModel];

    if (modelConfig) {
        modelDescription.textContent = modelConfig.description;

        // Update cost estimate when model changes
        updateCostEstimate();
    }
}

function updateCostEstimate() {
    const mathTopicInput = document.getElementById('mathTopic');
    const difficultySelect = document.getElementById('difficulty');
    const modelSelector = document.getElementById('modelSelector');
    const costEstimate = document.getElementById('costEstimate');

    if (!mathTopicInput || !difficultySelect || !modelSelector || !costEstimate) return;

    const inputText = mathTopicInput.value.trim();
    const difficulty = difficultySelect.value;
    const selectedModel = modelSelector.value;

    if (inputText && window.costTracker) {
        const estimate = window.costTracker.estimateCost(inputText, selectedModel);
        costEstimate.textContent = window.costTracker.formatCurrency(estimate.totalCost);
    } else {
        costEstimate.textContent = '$0.0000';
    }
}

function updateCostDisplay() {
    if (!window.costTracker) return;

    const budgetStatus = window.costTracker.getBudgetStatus();
    const budgetStatusElement = document.getElementById('budgetStatus');
    const budgetProgress = document.getElementById('budgetProgress');

    if (budgetStatusElement) {
        budgetStatusElement.textContent = `Monthly Budget: ${window.costTracker.formatCurrency(budgetStatus.monthlyBudget)} | Used: ${window.costTracker.formatCurrency(budgetStatus.monthlyCost)}`;
    }

    if (budgetProgress) {
        const percentage = Math.min(budgetStatus.percentUsed, 100);
        budgetProgress.style.width = `${percentage}%`;

        if (budgetStatus.isOverBudget) {
            budgetProgress.classList.add('over-budget');
        } else {
            budgetProgress.classList.remove('over-budget');
        }
    }
}

function showBudgetSettings() {
    const currentBudget = window.costTracker.getBudgetStatus().monthlyBudget;
    const newBudget = prompt(`Set your monthly budget (current: ${window.costTracker.formatCurrency(currentBudget)}):`, currentBudget.toString());

    if (newBudget !== null && !isNaN(parseFloat(newBudget))) {
        window.costTracker.updateBudget(parseFloat(newBudget));
        updateCostDisplay();
        displayMessage(`Monthly budget updated to ${window.costTracker.formatCurrency(parseFloat(newBudget))}`, "text-green-500");
    }
}

function initializeModelSelector() {
    const modelSelector = document.getElementById('modelSelector');
    const mathTopicInput = document.getElementById('mathTopic');
    const difficultySelect = document.getElementById('difficulty');

    if (!modelSelector) return;

    // Load saved model preference
    const savedModel = localStorage.getItem(CONFIG.SELECTED_MODEL_KEY);
    if (savedModel && GEMINI_MODELS[savedModel]) {
        modelSelector.value = savedModel;
    }

    // Add event listeners
    modelSelector.addEventListener('change', updateModelDescription);

    if (mathTopicInput) {
        mathTopicInput.addEventListener('input', updateCostEstimate);
    }

    if (difficultySelect) {
        difficultySelect.addEventListener('change', updateCostEstimate);
    }

    // Initial updates
    updateModelDescription();
    updateCostEstimate();
    updateCostDisplay();
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    initializeModelSelector();
});

// Check KaTeX loading after a delay
setTimeout(checkKaTeXLoaded, 1000);

