/**
 * SAGE - API Utilities
 * API call functions, retry logic, and loading management
 */

// Enhanced API call with offline fallback
async function makeAPICallWithRetry(url, payload, retries = CONFIG.MAX_RETRIES) {
    // Check if offline first
    if (!isOnline) {
        throw new Error('No internet connection available');
    }
    
    let lastError;
    
    for (let i = 0; i < retries; i++) {
        try {
            // Show retry attempt if not first try
            if (i > 0) {
                updateLoadingMessage(`Retrying... (Attempt ${i + 1}/${retries})`);
            }
            
            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMessage = errorData.error?.message || response.statusText;
                throw new Error(`HTTP ${response.status}: ${errorMessage}`);
            }

            return await response.json();
        } catch (error) {
            lastError = error;
            console.error(`API call attempt ${i + 1} failed:`, error);
            
            if (i === retries - 1) {
                throw error; // Last attempt failed
            }
            
            // Progressive backoff: wait longer for each retry
            const delay = CONFIG.RETRY_DELAY * Math.pow(2, i);
            updateLoadingMessage(`Network issue detected. Retrying in ${delay/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Update loading message
function updateLoadingMessage(message) {
    // Handle both loading text classes and ID-based elements
    const loadingText = document.querySelector('.loading-text');
    const loadingMessageEl = document.getElementById('loadingMessage');
    
    if (loadingText) {
        loadingText.textContent = message;
    }
    if (loadingMessageEl) {
        loadingMessageEl.textContent = message;
    }
}

// Update progress bar
function updateProgress(percent) {
    const progressFill = document.getElementById('progressFill');
    if (progressFill) {
        progressFill.style.width = `${Math.min(100, Math.max(0, percent))}%`;
    }
}

// Enhanced loading management with progress tracking
let loadingProgress = 0;
let loadingInterval;
const loadingMessages = [
    "Analyzing your math topic...",
    "Consulting mathematical knowledge base...",
    "Crafting problems for your level...",
    "Adding solution steps...",
    "Formatting mathematical expressions...",
    "Almost ready..."
];

function startLoadingAnimation() {
    loadingProgress = 0;
    clearInterval(loadingInterval);
    updateProgress(0);
    
    loadingInterval = setInterval(() => {
        loadingProgress = Math.min(loadingProgress + Math.random() * 15, 85);
        const messageIndex = Math.min(Math.floor(loadingProgress / 15), loadingMessages.length - 1);
        const message = loadingMessages[messageIndex];
        updateProgress(loadingProgress);
        updateLoadingMessage(`${message} (${Math.round(loadingProgress)}%)`);
    }, 800);
}

function stopLoadingAnimation() {
    clearInterval(loadingInterval);
    loadingProgress = 100;
    updateProgress(100);
    updateLoadingMessage("Complete! 🎉");
    
    setTimeout(() => {
        updateLoadingMessage("Ready to generate more questions!");
        updateProgress(0);
    }, 1000);
}

// Network monitoring functions
function initializeNetworkMonitoring() {
    window.addEventListener('online', () => {
        isOnline = true;
        updateNetworkStatus();
        console.log('Network connection restored');
    });
    
    window.addEventListener('offline', () => {
        isOnline = false;
        updateNetworkStatus();
        console.log('Network connection lost');
    });
    
    createNetworkStatusIndicator();
    updateNetworkStatus();
}

function createNetworkStatusIndicator() {
    networkStatusIndicator = document.createElement('div');
    networkStatusIndicator.className = 'fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300';
    networkStatusIndicator.style.display = 'none';
    document.body.appendChild(networkStatusIndicator);
}

function updateNetworkStatus() {
    if (!networkStatusIndicator) return;
    
    if (isOnline) {
        networkStatusIndicator.style.display = 'none';
    } else {
        networkStatusIndicator.textContent = '📶 Offline - Some features unavailable';
        networkStatusIndicator.className = 'fixed top-4 right-4 z-50 px-3 py-2 rounded-lg text-sm font-medium bg-red-900/90 text-red-200 border border-red-600/30';
        networkStatusIndicator.style.display = 'block';
    }
}

function showNetworkMessage(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    
    const typeClasses = {
        success: 'bg-green-900/90 text-green-200 border-green-600/30',
        error: 'bg-red-900/90 text-red-200 border-red-600/30',
        warning: 'bg-amber-900/90 text-amber-200 border-amber-600/30',
        info: 'bg-blue-900/90 text-blue-200 border-blue-600/30'
    };
    
    notification.className = `fixed top-4 left-1/2 transform -translate-x-1/2 z-50 px-4 py-3 rounded-lg text-white font-medium transition-all duration-300 ${
        typeClasses[type] || typeClasses.info
    } border`;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translate(-50%, -20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}