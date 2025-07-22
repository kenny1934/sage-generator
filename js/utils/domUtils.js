/**
 * SAGE - DOM Utilities
 * DOM manipulation helpers, clipboard operations, and UI utilities
 */

// Performance optimization: Debounced input validation
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Modern clipboard API with fallback
async function copyToClipboard(text) {
    try {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            displayMessage("Copied to clipboard!", "text-green-400");
        } else {
            // Fallback for older browsers or non-secure contexts
            const textarea = document.createElement('textarea');
            textarea.value = text;
            textarea.style.position = 'fixed';
            textarea.style.opacity = '0';
            document.body.appendChild(textarea);
            textarea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            
            if (successful) {
                displayMessage("Copied to clipboard!", "text-green-400");
            } else {
                throw new Error('Copy command failed');
            }
        }
    } catch (err) {
        console.error('Failed to copy: ', err);
        displayMessage("Failed to copy text. Please copy manually.", "text-red-500");
    }
    
    // Hide message after timeout
    setTimeout(() => { 
        const messageContainer = document.getElementById('messageContainer');
        if (messageContainer && (messageContainer.innerHTML.includes('Copied to clipboard') || messageContainer.innerHTML.includes('Failed to copy'))) {
            messageContainer.innerHTML = ''; 
        }
    }, CONFIG.MESSAGE_TIMEOUT);
}

// Create category tag for topic classification
function createCategoryTag(topic, size = 'small') {
    // Defensive coding: handle undefined/null topic
    if (!topic || typeof topic !== 'string') {
        // Fallback to getting current topic from input field
        const mathTopicInput = document.getElementById('mathTopic');
        topic = mathTopicInput && mathTopicInput.value ? mathTopicInput.value.trim() : 'General';
    }
    
    const category = DataManager.categorizeTopicByKeywords(topic);
    const color = DataManager.getCategoryColor(category);
    const icon = DataManager.getCategoryIcon(category);
    
    const isSmall = size === 'small';
    const sizeClasses = isSmall ? 'text-xs px-2 py-1' : 'text-sm px-3 py-1.5';
    
    return `<span class="${sizeClasses} rounded-full font-medium inline-flex items-center gap-1" 
                  style="background: var(--surface-elevated); border: 1px solid var(--border-color); color: var(--text-secondary);">
                <span>${icon}</span>
                <span>${category}</span>
            </span>`;
}

// Display message helper function
function displayMessage(message, colorClass) {
    // Get DOM elements directly to avoid scope issues
    const messageContainer = document.getElementById('messageContainer');
    const initialMessage = document.getElementById('initialMessage');
    const loadingIndicator = document.getElementById('loadingIndicator');
    const questionsContainer = document.getElementById('questionsContainer');
    const resetBtn = document.getElementById('resetBtn');
    
    if (!messageContainer) return; // Graceful failure if elements not found
    
    const messageElement = document.createElement('p');
    messageElement.className = `text-center ${colorClass} font-medium py-4`;
    messageElement.textContent = message;
    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageElement);
    
    if (initialMessage) initialMessage.classList.add('hidden');
    if (loadingIndicator) loadingIndicator.classList.add('hidden');
    
    if (colorClass.includes('red') || colorClass.includes('amber')) {
        if (questionsContainer) questionsContainer.classList.add('hidden'); // Hide questions if error
        if (resetBtn) resetBtn.classList.add('hidden');
    }
}

// DOM element visibility helpers
function showElement(element) {
    if (element) {
        element.classList.remove('hidden');
        element.style.display = '';
    }
}

function hideElement(element) {
    if (element) {
        element.classList.add('hidden');
    }
}

function toggleElement(element, show) {
    if (element) {
        if (show) {
            showElement(element);
        } else {
            hideElement(element);
        }
    }
}

// Safe DOM element selection with error handling
function safeGetElement(id) {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`Element with ID '${id}' not found`);
    }
    return element;
}

// Create notification element
function createNotification(message, type = 'info', duration = 3000) {
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
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
    
    return notification;
}

// Scroll element into view smoothly
function scrollToElement(element, options = {}) {
    if (element) {
        const defaultOptions = {
            behavior: 'smooth',
            block: 'center',
            inline: 'nearest'
        };
        element.scrollIntoView({ ...defaultOptions, ...options });
    }
}

// Set element text content safely
function setTextContent(element, text) {
    if (element) {
        element.textContent = text || '';
    }
}

// Set element HTML content safely (with basic sanitization)
function setHTMLContent(element, html) {
    if (element && html !== null && html !== undefined) {
        // Basic sanitization - remove script tags and event handlers
        const sanitized = html.toString()
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/\s*on\w+\s*=\s*[^>]*/gi, '');
        element.innerHTML = sanitized;
    }
}

// Check if element is visible in viewport
function isElementInViewport(element) {
    if (!element) return false;
    
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

// Wait for DOM element to appear
function waitForElement(selector, timeout = 5000) {
    return new Promise((resolve, reject) => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
            return;
        }
        
        const observer = new MutationObserver((mutations, obs) => {
            const element = document.querySelector(selector);
            if (element) {
                obs.disconnect();
                resolve(element);
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        setTimeout(() => {
            observer.disconnect();
            reject(new Error(`Element ${selector} not found within ${timeout}ms`));
        }, timeout);
    });
}

// Add CSS class with transition support
function addClassWithTransition(element, className, duration = 300) {
    if (!element) return;
    
    element.style.transition = `all ${duration}ms ease-in-out`;
    element.classList.add(className);
    
    setTimeout(() => {
        element.style.transition = '';
    }, duration);
}

// Remove CSS class with transition support
function removeClassWithTransition(element, className, duration = 300) {
    if (!element) return;
    
    element.style.transition = `all ${duration}ms ease-in-out`;
    element.classList.remove(className);
    
    setTimeout(() => {
        element.style.transition = '';
    }, duration);
}