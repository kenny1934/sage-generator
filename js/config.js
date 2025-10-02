/**
 * SAGE - Configuration Constants
 * Central configuration file for API settings, storage keys, and application constants
 */

// Gemini 2.5 Model configurations
const GEMINI_MODELS = {
    'flash-lite': {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash-Lite',
        description: 'Fastest, most cost-effective for simple questions',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
        pricing: {
            input: 0.10,  // $0.10 per 1M input tokens
            output: 0.40  // $0.40 per 1M output tokens
        },
        contextWindow: 32000,
        recommended: ['basic', 'algebra', 'arithmetic']
    },
    'flash': {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: 'Balanced speed and capability for most questions',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
        pricing: {
            input: 0.30,  // $0.30 per 1M input tokens
            output: 2.50  // $2.50 per 1M output tokens
        },
        contextWindow: 32000,
        recommended: ['intermediate', 'geometry', 'trigonometry']
    },
    'pro': {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: 'Most capable for complex mathematical problems',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent',
        pricing: {
            input: 1.25,  // $1.25 per 1M input tokens
            output: 10.00  // $10.00 per 1M output tokens
        },
        contextWindow: 200000,
        recommended: ['advanced', 'calculus', 'linear algebra', 'complex']
    }
};

// Configuration constants
const CONFIG = {
    // Version information
    VERSION: '0.9.0-beta',
    BUILD_DATE: '2025-09-30',
    // Default model (can be changed by user)
    DEFAULT_MODEL: 'flash',
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
    MAX_CACHE_SIZE: 100,
    // Model and cost tracking
    SELECTED_MODEL_KEY: 'sage_selected_model',
    USAGE_STATS_KEY: 'sage_usage_stats',
    COST_TRACKING_KEY: 'sage_cost_tracking',
    // OAuth configuration
    OAUTH_ENABLED: false, // Set to true when worker is deployed
    WORKER_URL: '' // Set to your Cloudflare Worker URL (e.g., 'https://sage-oauth-worker.your-subdomain.workers.dev')
};

// Global DOM element references (initialized after DOM loads)
let mathTopicInput, difficultySelect, generateQuestionsBtn, loadingIndicator;
let questionsContainer, resetBtn, messageContainer, mathQuestionsList;
let prevQuestionBtn, nextQuestionBtn, initialMessage;
let toggleMathViewBtn, saveApiKeyBtn, exportQuestionsBtn, apiKeyInput;

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
    initialMessage = document.getElementById('initialMessage');
    toggleMathViewBtn = document.getElementById('toggleMathViewBtn');
    saveApiKeyBtn = document.getElementById('saveApiKeyBtn');
    exportQuestionsBtn = document.getElementById('exportQuestionsBtn');
    apiKeyInput = document.getElementById('apiKeyInput');
}