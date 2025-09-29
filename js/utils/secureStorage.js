/**
 * SAGE - Secure Storage Utilities
 * Provides encrypted storage for sensitive data like API keys
 */

class SecureStorage {
    constructor() {
        this.keyMaterial = null;
        this.salt = null;
    }

    // Generate or retrieve salt for key derivation
    async getSalt() {
        let salt = localStorage.getItem('sage_salt');
        if (!salt) {
            // Generate new salt
            const saltArray = window.crypto.getRandomValues(new Uint8Array(16));
            salt = Array.from(saltArray).map(b => b.toString(16).padStart(2, '0')).join('');
            localStorage.setItem('sage_salt', salt);
        }
        return new Uint8Array(salt.match(/.{2}/g).map(byte => parseInt(byte, 16)));
    }

    // Derive encryption key from password
    async deriveKey(password) {
        const salt = await this.getSalt();
        const encoder = new TextEncoder();
        const keyMaterial = await window.crypto.subtle.importKey(
            'raw',
            encoder.encode(password),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        return await window.crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            { name: 'AES-GCM', length: 256 },
            false,
            ['encrypt', 'decrypt']
        );
    }

    // Encrypt data
    async encrypt(data, password) {
        try {
            const key = await this.deriveKey(password);
            const encoder = new TextEncoder();
            const iv = window.crypto.getRandomValues(new Uint8Array(12));

            const encrypted = await window.crypto.subtle.encrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encoder.encode(data)
            );

            // Combine IV and encrypted data
            const result = new Uint8Array(iv.length + encrypted.byteLength);
            result.set(iv);
            result.set(new Uint8Array(encrypted), iv.length);

            // Convert to base64 for storage
            return btoa(String.fromCharCode(...result));
        } catch (error) {
            console.error('Encryption failed:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    // Decrypt data
    async decrypt(encryptedData, password) {
        try {
            const key = await this.deriveKey(password);

            // Convert from base64
            const data = new Uint8Array(atob(encryptedData).split('').map(c => c.charCodeAt(0)));

            // Extract IV and encrypted data
            const iv = data.slice(0, 12);
            const encrypted = data.slice(12);

            const decrypted = await window.crypto.subtle.decrypt(
                { name: 'AES-GCM', iv: iv },
                key,
                encrypted
            );

            const decoder = new TextDecoder();
            return decoder.decode(decrypted);
        } catch (error) {
            console.error('Decryption failed:', error);
            throw new Error('Failed to decrypt data - incorrect password or corrupted data');
        }
    }

    // Store encrypted API key
    async storeApiKey(apiKey, password) {
        const encrypted = await this.encrypt(apiKey, password);
        localStorage.setItem('sage_api_key_encrypted', encrypted);
        localStorage.setItem('sage_api_key_protected', 'true');

        // Clear any unencrypted key
        localStorage.removeItem('sage_api_key');
    }

    // Retrieve and decrypt API key
    async getApiKey(password) {
        const encrypted = localStorage.getItem('sage_api_key_encrypted');
        if (!encrypted) {
            throw new Error('No encrypted API key found');
        }

        return await this.decrypt(encrypted, password);
    }

    // Check if API key is encrypted
    isApiKeyEncrypted() {
        return localStorage.getItem('sage_api_key_protected') === 'true';
    }

    // Migrate unencrypted API key to encrypted
    async migrateApiKey(password) {
        const unencryptedKey = localStorage.getItem('sage_api_key');
        if (unencryptedKey && !this.isApiKeyEncrypted()) {
            await this.storeApiKey(unencryptedKey, password);
            return true;
        }
        return false;
    }

    // Generate a secure random password
    generateSecurePassword(length = 32) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
        const array = new Uint8Array(length);
        window.crypto.getRandomValues(array);

        return Array.from(array, byte => charset[byte % charset.length]).join('');
    }

    // Clear all encrypted data
    clearEncryptedData() {
        localStorage.removeItem('sage_api_key_encrypted');
        localStorage.removeItem('sage_api_key_protected');
        localStorage.removeItem('sage_salt');
    }
}

// Global instance
window.secureStorage = new SecureStorage();