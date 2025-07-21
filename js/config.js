/**
 * SAGE - Configuration Constants
 * Central configuration file for API settings, storage keys, and application constants
 */

// Configuration constants
const CONFIG = {
    API_BASE_URL: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    STORAGE_KEY: 'sage_api_key',
    MESSAGE_TIMEOUT: 3000,
    // Storage keys for Phase 3 features
    PREFERENCES_KEY: 'sage_preferences',
    HISTORY_KEY: 'sage_history',
    FAVORITES_KEY: 'sage_favorites',
    STATS_KEY: 'sage_stats',
    STREAKS_KEY: 'sage-streaks',
    THEME_KEY: 'sage-theme',
    // Phase 4: Question caching configuration
    CACHE_KEY: 'sage_question_cache',
    CACHE_EXPIRY_HOURS: 24,
    MAX_CACHE_SIZE: 100
};

// Global DOM element references (initialized after DOM loads)
let mathTopicInput, difficultySelect, generateQuestionsBtn, loadingIndicator;
let questionsContainer, resetBtn, messageContainer, mathQuestionsList;
let prevQuestionBtn, nextQuestionBtn;

// Global state variables
let currentQuestions = [];
let currentQuestionIndex = 0;
let totalQuestions = 0;
let mathRenderCache = new Map();
let isOnline = navigator.onLine;
let progressInterval;

// Initialize DOM references when DOM is loaded
function initializeDOMReferences() {
    mathTopicInput = document.getElementById('mathTopic');
    difficultySelect = document.getElementById('difficulty');
    generateQuestionsBtn = document.getElementById('generateQuestionsBtn');
    loadingIndicator = document.getElementById('loadingIndicator');
    questionsContainer = document.getElementById('questionsContainer');
    resetBtn = document.getElementById('resetBtn');
    messageContainer = document.getElementById('messageContainer');
    mathQuestionsList = document.getElementById('mathQuestionsList');
    prevQuestionBtn = document.getElementById('prevQuestionBtn');
    nextQuestionBtn = document.getElementById('nextQuestionBtn');
}