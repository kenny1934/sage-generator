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

// Enhanced HTML sanitization function
function sanitizeHTML(html) {
    if (!html) return '';

    const tempDiv = document.createElement('div');

    // Set as text content first to escape HTML entities
    tempDiv.textContent = html.toString();

    // Then allow specific safe HTML tags
    let sanitized = tempDiv.innerHTML;

    // Allow specific safe formatting tags only
    const allowedTags = {
        '<br>': '<br>',
        '&lt;br&gt;': '<br>',
        '&lt;strong&gt;': '<strong>',
        '&lt;/strong&gt;': '</strong>',
        '&lt;em&gt;': '<em>',
        '&lt;/em&gt;': '</em>',
        '&lt;span': '<span',
        '&lt;/span&gt;': '</span>'
    };

    // Replace allowed tags back to HTML
    for (const [escaped, html] of Object.entries(allowedTags)) {
        sanitized = sanitized.replace(new RegExp(escaped, 'gi'), html);
    }

    return sanitized;
}

// Set element HTML content safely (with enhanced sanitization)
function setHTMLContent(element, html) {
    if (element && html !== null && html !== undefined) {
        // Use enhanced sanitization
        const sanitized = sanitizeHTML(html);
        element.innerHTML = sanitized;
    }
}

// Safe DOM builder utility to replace innerHTML template literals
function createElementSafe(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    // Set attributes safely
    for (const [key, value] of Object.entries(attributes)) {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'textContent') {
            element.textContent = value;
        } else if (key.startsWith('data-') || ['id', 'type', 'href', 'src', 'alt', 'aria-label'].includes(key)) {
            element.setAttribute(key, value);
        }
    }

    // Add children safely
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child instanceof Node) {
            element.appendChild(child);
        }
    });

    return element;
}

// Safe template builder for common UI patterns
function buildModalTemplate(title, content, buttons = []) {
    const overlay = createElementSafe('div', {
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'
    });

    const modal = createElementSafe('div', {
        className: 'bg-gray-800 border border-red-500/30 rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto'
    });

    const header = createElementSafe('div', {
        className: 'flex justify-between items-center mb-4'
    });

    const titleEl = createElementSafe('h2', {
        className: 'text-xl font-bold text-red-400',
        textContent: title
    });

    const closeBtn = createElementSafe('button', {
        className: 'text-gray-400 hover:text-white text-2xl',
        textContent: '×'
    });

    const contentDiv = createElementSafe('div', {
        className: 'text-gray-200 mb-4'
    });

    if (typeof content === 'string') {
        contentDiv.textContent = content;
    } else if (content instanceof Node) {
        contentDiv.appendChild(content);
    }

    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    modal.appendChild(header);
    modal.appendChild(contentDiv);

    // Add buttons if provided
    if (buttons.length > 0) {
        const buttonContainer = createElementSafe('div', {
            className: 'flex gap-2 justify-end'
        });

        buttons.forEach(buttonConfig => {
            const button = createElementSafe('button', {
                className: buttonConfig.className || 'px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700',
                textContent: buttonConfig.text
            });

            if (buttonConfig.onClick) {
                button.addEventListener('click', buttonConfig.onClick);
            }

            buttonContainer.appendChild(button);
        });

        modal.appendChild(buttonContainer);
    }

    overlay.appendChild(modal);

    // Close modal when clicking overlay or close button
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay || e.target === closeBtn) {
            overlay.remove();
        }
    });

    return overlay;
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