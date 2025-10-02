/**
 * SAGE - OAuth Authentication Client
 * Handles Google Workspace authentication flow
 */

class AuthManager {
    constructor(workerUrl) {
        this.workerUrl = workerUrl;
        this.token = null;
        this.user = null;
        this.onAuthStateChanged = null;

        // Load token from sessionStorage
        this.loadToken();
    }

    /**
     * Load token from session storage
     */
    loadToken() {
        this.token = sessionStorage.getItem('sage_oauth_token');
        const userStr = sessionStorage.getItem('sage_oauth_user');
        if (userStr) {
            try {
                this.user = JSON.parse(userStr);
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }
    }

    /**
     * Save token to session storage
     */
    saveToken(token, user) {
        this.token = token;
        this.user = user;
        sessionStorage.setItem('sage_oauth_token', token);
        sessionStorage.setItem('sage_oauth_user', JSON.stringify(user));
    }

    /**
     * Clear token from storage
     */
    clearToken() {
        this.token = null;
        this.user = null;
        sessionStorage.removeItem('sage_oauth_token');
        sessionStorage.removeItem('sage_oauth_user');
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return !!this.token;
    }

    /**
     * Get current user info
     */
    getUser() {
        return this.user;
    }

    /**
     * Get authentication token
     */
    getToken() {
        return this.token;
    }

    /**
     * Initiate Google OAuth login
     */
    async login() {
        try {
            // Open OAuth flow in same window (will redirect)
            window.location.href = `${this.workerUrl}/auth/google`;
        } catch (error) {
            console.error('Login error:', error);
            throw new Error('Failed to initiate login');
        }
    }

    /**
     * Handle OAuth callback (call this on callback page)
     */
    async handleCallback() {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');
        const error = params.get('error');

        if (error) {
            throw new Error(this.getErrorMessage(error));
        }

        if (!token) {
            throw new Error('No token received from authentication');
        }

        // Verify token with backend
        const isValid = await this.verifyToken(token);
        if (!isValid) {
            throw new Error('Token verification failed');
        }

        // Clear the URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);

        // Notify listeners
        if (this.onAuthStateChanged) {
            this.onAuthStateChanged(this.user);
        }

        return true;
    }

    /**
     * Verify token with backend
     */
    async verifyToken(token) {
        try {
            const response = await fetch(`${this.workerUrl}/auth/verify`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                return false;
            }

            const data = await response.json();
            if (data.valid && data.user) {
                this.saveToken(token, data.user);
                return true;
            }

            return false;
        } catch (error) {
            console.error('Token verification error:', error);
            return false;
        }
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            // Call logout endpoint (optional, for cleanup)
            await fetch(`${this.workerUrl}/auth/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.token}`
                }
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Clear local state
            this.clearToken();

            // Notify listeners
            if (this.onAuthStateChanged) {
                this.onAuthStateChanged(null);
            }
        }
    }

    /**
     * Make authenticated API call to Gemini via Worker
     */
    async generateQuestions(model, payload) {
        if (!this.isAuthenticated()) {
            throw new Error('Not authenticated');
        }

        try {
            const response = await fetch(`${this.workerUrl}/api/generate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.token}`
                },
                body: JSON.stringify({ model, payload })
            });

            if (response.status === 401) {
                // Token expired or invalid
                this.clearToken();
                throw new Error('Session expired. Please log in again.');
            }

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'API request failed');
            }

            return await response.json();
        } catch (error) {
            console.error('API call error:', error);
            throw error;
        }
    }

    /**
     * Get user-friendly error message
     */
    getErrorMessage(errorCode) {
        const errorMessages = {
            'access_denied': 'You denied access to your Google account',
            'no_code': 'Authentication failed - no authorization code received',
            'invalid_domain': 'Your Google account is not from the authorized workspace domain',
            'auth_failed': 'Authentication failed. Please try again.',
        };

        return errorMessages[errorCode] || 'Authentication error occurred';
    }

    /**
     * Check authentication status on page load
     */
    async initialize() {
        if (this.token) {
            // Verify existing token is still valid
            const isValid = await this.verifyToken(this.token);
            if (!isValid) {
                this.clearToken();
            } else if (this.onAuthStateChanged) {
                this.onAuthStateChanged(this.user);
            }
        }
    }
}

// Initialize global auth manager (will be configured with worker URL)
window.authManager = null;

/**
 * Initialize authentication with worker URL from config
 */
function initializeAuth(workerUrl) {
    if (!workerUrl) {
        console.warn('OAuth worker URL not configured - OAuth features disabled');
        return null;
    }

    window.authManager = new AuthManager(workerUrl);
    return window.authManager;
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { AuthManager, initializeAuth };
}
