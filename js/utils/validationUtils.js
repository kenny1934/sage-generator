/**
 * SAGE - Validation Utilities
 * Input validation, error handling, and security functions
 */

// Enhanced input validation
function validateInput(topic) {
    if (!topic || topic.trim().length < 3) {
        return 'Please enter a maths topic with at least 3 characters.';
    }
    if (topic.length > 500) {
        return 'Maths topic is too long. Please keep it under 500 characters.';
    }
    
    // Check for potentially harmful content
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /data:text\/html/i
    ];
    
    if (suspiciousPatterns.some(pattern => pattern.test(topic))) {
        return 'Invalid characters detected in input. Please use only text and mathematical expressions.';
    }
    
    return null;
}

// Validate API key format
function validateApiKey(apiKey) {
    if (!apiKey || apiKey.trim().length < 10) {
        return 'API key appears to be too short. Please check your Gemini API key.';
    }
    if (!/^[A-Za-z0-9_-]+$/.test(apiKey)) {
        return 'API key contains invalid characters. Please check your Gemini API key.';
    }
    return null;
}

// Get user-friendly error message with actionable suggestions
function getErrorMessage(error) {
    const errorStr = error.message.toLowerCase();
    
    if (errorStr.includes('401') || errorStr.includes('invalid api key')) {
        return {
            message: "Your API key appears to be invalid or expired.",
            suggestion: "Please check your Gemini API key and make sure it's correctly entered.",
            action: "show_api_key"
        };
    } else if (errorStr.includes('403') || errorStr.includes('forbidden')) {
        return {
            message: "Access denied. Your API key may not have the required permissions.",
            suggestion: "Ensure your Gemini API key has access to the Generative Language API.",
            action: "show_api_key"
        };
    } else if (errorStr.includes('429') || errorStr.includes('rate limit')) {
        return {
            message: "Too many requests. You've hit the rate limit.",
            suggestion: "Please wait a few minutes before trying again, or check your API quota.",
            action: "retry_later"
        };
    } else if (errorStr.includes('quota') || errorStr.includes('billing')) {
        return {
            message: "API quota exceeded or billing issue detected.",
            suggestion: "Check your Google Cloud billing account and API quotas.",
            action: "check_billing"
        };
    } else if (errorStr.includes('network') || errorStr.includes('fetch')) {
        return {
            message: "Network connection issue detected.",
            suggestion: "Check your internet connection and try again.",
            action: "retry"
        };
    } else if (errorStr.includes('json') || errorStr.includes('parse')) {
        return {
            message: "Received malformed response from the API.",
            suggestion: "This might be a temporary issue. Try generating questions again.",
            action: "retry"
        };
    } else {
        return {
            message: "An unexpected error occurred while generating questions.",
            suggestion: "Try again with a simpler topic or different difficulty level.",
            action: "retry"
        };
    }
}

// Enhanced error display with retry button
function displayEnhancedError(error) {
    const errorInfo = getErrorMessage(error);
    
    const errorContainer = document.createElement('div');
    errorContainer.className = 'bg-red-900/20 border border-red-500/30 rounded-lg p-4 mt-4';
    
    errorContainer.innerHTML = `
        <div class="flex items-start gap-3">
            <div class="text-red-400 text-xl">⚠️</div>
            <div class="flex-1">
                <h4 class="text-red-400 font-semibold mb-2">${errorInfo.message}</h4>
                <p class="text-gray-300 text-sm mb-3">${errorInfo.suggestion}</p>
                <div class="flex gap-2 flex-wrap">
                    ${errorInfo.action === 'retry' ? '<button id="retryBtn" class="action-btn bg-red-600 hover:bg-red-700 text-sm">Try Again</button>' : ''}
                    ${errorInfo.action === 'show_api_key' ? '<button id="showApiKeyBtn" class="action-btn bg-blue-600 hover:bg-blue-700 text-sm">Update API Key</button>' : ''}
                    ${errorInfo.action === 'retry_later' ? '<button id="retryLaterBtn" class="action-btn bg-yellow-600 hover:bg-yellow-700 text-sm">Retry in 1 minute</button>' : ''}
                </div>
            </div>
        </div>
    `;
    
    messageContainer.innerHTML = '';
    messageContainer.appendChild(errorContainer);
    
    // Add event listeners for action buttons
    const retryBtn = errorContainer.querySelector('#retryBtn');
    const showApiKeyBtn = errorContainer.querySelector('#showApiKeyBtn');
    const retryLaterBtn = errorContainer.querySelector('#retryLaterBtn');
    
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            messageContainer.innerHTML = '';
            generateMathQuestions();
        });
    }
    
    if (showApiKeyBtn) {
        showApiKeyBtn.addEventListener('click', () => {
            apiKeyContainer.style.display = 'block';
            apiKeyInput.focus();
        });
    }
    
    if (retryLaterBtn) {
        retryLaterBtn.addEventListener('click', () => {
            retryLaterBtn.disabled = true;
            retryLaterBtn.textContent = 'Waiting...';
            setTimeout(() => {
                messageContainer.innerHTML = '';
                generateMathQuestions();
            }, 60000); // 1 minute delay
        });
    }
}

// Validate Google Client ID format
function validateGoogleClientId(clientId) {
    if (!clientId || typeof clientId !== 'string') {
        return 'Please enter the Google Client ID';
    }
    
    if (!clientId.includes('.googleusercontent.com')) {
        return 'Please enter a valid Google Client ID';
    }
    
    return null;
}

// Sanitize string for safe HTML output
function sanitizeString(str) {
    if (!str) return '';
    
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Validate URL format
function validateURL(url) {
    try {
        new URL(url);
        return null; // Valid URL
    } catch {
        return 'Please enter a valid URL';
    }
}

// Validate email format (basic)
function validateEmail(email) {
    if (!email) {
        return 'Email is required';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Please enter a valid email address';
    }
    
    return null;
}

// Validate numeric input
function validateNumber(value, min = null, max = null) {
    if (value === '' || value === null || value === undefined) {
        return 'Please enter a number';
    }
    
    const num = Number(value);
    if (isNaN(num)) {
        return 'Please enter a valid number';
    }
    
    if (min !== null && num < min) {
        return `Number must be at least ${min}`;
    }
    
    if (max !== null && num > max) {
        return `Number must not exceed ${max}`;
    }
    
    return null;
}

// Validate password strength (basic)
function validatePassword(password) {
    if (!password) {
        return 'Password is required';
    }
    
    if (password.length < 8) {
        return 'Password must be at least 8 characters long';
    }
    
    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
        return 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }
    
    return null;
}

// Check for XSS patterns in user input
function checkForXSS(input) {
    if (!input || typeof input !== 'string') {
        return false;
    }
    
    const xssPatterns = [
        /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        /javascript:/gi,
        /on\w+\s*=/gi,
        /data:text\/html/gi,
        /vbscript:/gi,
        /expression\s*\(/gi
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
}

// Validate file type
function validateFileType(file, allowedTypes = []) {
    if (!file) {
        return 'Please select a file';
    }
    
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
        return `File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
    }
    
    return null;
}

// Validate file size
function validateFileSize(file, maxSizeBytes) {
    if (!file) {
        return 'Please select a file';
    }
    
    if (file.size > maxSizeBytes) {
        const maxSizeMB = Math.round(maxSizeBytes / (1024 * 1024));
        return `File size exceeds ${maxSizeMB}MB limit`;
    }
    
    return null;
}

// Generic validation function that accepts a value and validation rules
function validate(value, rules = {}) {
    const errors = [];
    
    // Required validation
    if (rules.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        errors.push(rules.requiredMessage || 'This field is required');
        return errors; // Return early if required and empty
    }
    
    // Skip other validations if value is empty and not required
    if (!value) {
        return errors;
    }
    
    // Length validations
    if (rules.minLength && value.length < rules.minLength) {
        errors.push(`Must be at least ${rules.minLength} characters long`);
    }
    
    if (rules.maxLength && value.length > rules.maxLength) {
        errors.push(`Must not exceed ${rules.maxLength} characters`);
    }
    
    // Pattern validation
    if (rules.pattern && !rules.pattern.test(value)) {
        errors.push(rules.patternMessage || 'Invalid format');
    }
    
    // Custom validation function
    if (rules.custom && typeof rules.custom === 'function') {
        const customResult = rules.custom(value);
        if (customResult) {
            errors.push(customResult);
        }
    }
    
    return errors;
}