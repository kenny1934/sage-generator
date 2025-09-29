# SAGE Security Documentation

## Overview

SAGE (Secondary Academy Generator of Exercises) has been designed with security as a primary concern. This document outlines the security measures implemented and best practices for maintaining the application's security posture.

## Security Features Implemented

### 1. Content Security Policy (CSP)
- **Location**: `index.html` meta tags
- **Protection**: Prevents XSS attacks by controlling resource loading
- **Configuration**:
  - `script-src`: Only allows scripts from self and trusted CDNs
  - `style-src`: Restricts CSS sources to self and trusted CDNs
  - `connect-src`: Limits API connections to Google's Gemini API only
  - `object-src 'none'`: Blocks dangerous plugins
  - `base-uri 'self'`: Prevents base tag injection

### 2. Subresource Integrity (SRI)
- **Location**: All external CDN resources in `index.html`
- **Protection**: Ensures external resources haven't been tampered with
- **Implementation**: SHA-384 hashes for KaTeX CSS and JavaScript files

### 3. API Key Encryption
- **Location**: `js/utils/secureStorage.js`
- **Technology**: AES-GCM encryption with PBKDF2 key derivation
- **Features**:
  - Client-side encryption using Web Crypto API
  - 100,000 PBKDF2 iterations for key derivation
  - Random salt generation for each installation
  - Session-based decrypted key storage
  - Password strength validation

### 4. Enhanced Input Validation
- **Location**: `js/utils/validationUtils.js`
- **Protection**: Multi-layer XSS prevention
- **Patterns Detected**:
  - Script injection (`<script>`, `javascript:`)
  - Event handlers (`onclick`, `onload`, etc.)
  - HTML injection (`<iframe>`, `<embed>`, etc.)
  - Expression evaluation (`eval()`, `setTimeout()`)
  - Template injection (`{{}}`, `${}`)
  - Data URIs and suspicious protocols
  - Encoded character sequences

### 5. Safe DOM Manipulation
- **Location**: `js/utils/domUtils.js`
- **Features**:
  - `createElementSafe()`: Safe element creation utility
  - `sanitizeHTML()`: Enhanced HTML sanitization
  - `buildModalTemplate()`: XSS-safe modal builder
  - Whitelist-based HTML tag allowance

### 6. Secure Output Encoding
- **Method**: Context-aware output encoding
- **Implementation**:
  - `textContent` for plain text
  - HTML entity encoding for mixed content
  - LaTeX-specific sanitization for mathematical expressions

## Security Architecture

### Client-Side Security Model
```
User Input → Validation → Sanitization → Safe DOM Insertion
     ↓
API Request → HTTPS → Google Gemini API
     ↓
Response → Validation → Sanitization → Rendering
```

### Data Flow Security
1. **Input Layer**: Enhanced pattern matching prevents malicious input
2. **Processing Layer**: Sanitization ensures safe data handling
3. **Storage Layer**: Encryption protects sensitive data at rest
4. **Output Layer**: Safe DOM manipulation prevents injection

### Encryption Architecture
```
User Password → PBKDF2 (100k iterations) → AES-GCM Key
     ↓
API Key → AES-GCM Encryption → Encrypted Storage
     ↓
Session → Temporary Decryption → Memory Storage
```

## Security Best Practices

### For Developers

#### 1. Input Handling
```javascript
// ✅ Good: Always validate and sanitize
const topic = sanitizeString(userInput);
const validationError = validateInput(topic);
if (validationError) {
    return displayMessage(validationError, 'text-red-500');
}

// ❌ Bad: Direct usage of user input
element.innerHTML = userInput; // Never do this
```

#### 2. DOM Manipulation
```javascript
// ✅ Good: Use safe utilities
const element = createElementSafe('div', {
    className: 'safe-class',
    textContent: userContent
});

// ❌ Bad: innerHTML with user content
element.innerHTML = `<div>${userContent}</div>`;
```

#### 3. API Key Handling
```javascript
// ✅ Good: Use secure storage
await secureStorage.storeApiKey(apiKey, password);
const key = await secureStorage.getApiKey(password);

// ❌ Bad: Plain text storage
localStorage.setItem('api_key', apiKey);
```

### For Users

#### 1. API Key Security
- **Enable Encryption**: Always encrypt your API key when prompted
- **Strong Passwords**: Use passwords with 12+ characters, mixed case, numbers, symbols
- **Regular Rotation**: Rotate API keys periodically on Google Cloud Console
- **Secure Networks**: Only use SAGE on trusted networks

#### 2. Browser Security
- **Keep Updated**: Use latest browser versions for security patches
- **Private Browsing**: Consider using private/incognito mode for sensitive work
- **Clear Data**: Clear browser data after use on shared computers

## Threat Model

### Protected Against
- ✅ Cross-Site Scripting (XSS)
- ✅ Injection attacks (HTML, Script, Template)
- ✅ API key theft via XSS
- ✅ CDN tampering (via SRI)
- ✅ Malicious input processing
- ✅ Session hijacking (session-only key storage)

### Limitations
- ⚠️ **Local Storage Access**: Malware with system access can read data
- ⚠️ **Memory Dumps**: Decrypted keys temporarily exist in memory
- ⚠️ **Browser Vulnerabilities**: Zero-day browser exploits
- ⚠️ **Physical Access**: Direct device access bypasses encryption
- ⚠️ **API Provider Security**: Dependent on Google's API security

## Security Monitoring

### Client-Side Monitoring
- Input validation failures are logged (without sensitive data)
- Encryption/decryption failures are logged
- CSP violations would be reported to browser console

### Recommended Monitoring
- Monitor API key usage on Google Cloud Console
- Check for unusual API request patterns
- Review browser security warnings

## Incident Response

### If API Key Compromised
1. **Immediate**: Revoke the compromised key on Google Cloud Console
2. **Generate**: Create a new API key with limited permissions
3. **Update**: Replace the key in SAGE using secure storage
4. **Monitor**: Watch for unauthorized usage in Google Cloud Console

### If Security Vulnerability Found
1. **Assessment**: Evaluate the scope and severity
2. **Mitigation**: Apply immediate protective measures
3. **Patching**: Develop and test security fixes
4. **Deployment**: Update the application
5. **Communication**: Inform users if necessary

## Security Checklist

### For New Features
- [ ] Input validation implemented
- [ ] Output encoding applied
- [ ] XSS patterns tested
- [ ] DOM manipulation uses safe utilities
- [ ] No `innerHTML` with user content
- [ ] CSP compatibility verified
- [ ] Sensitive data handling reviewed

### For Releases
- [ ] Security tests passed
- [ ] CSP headers validated
- [ ] SRI hashes updated
- [ ] Dependencies security-scanned
- [ ] Encryption functions tested
- [ ] XSS prevention verified

## Security Updates

### Version History
- **v4.4**: Enhanced XSS protection, API key encryption, CSP implementation
- **v4.3**: Basic input validation, sanitization functions
- **v4.2**: Secure DOM utilities introduction

### Update Policy
- Security patches are applied immediately
- Users are notified of critical security updates
- Documentation is updated with each security enhancement

## Contact

For security-related questions or to report vulnerabilities:
- Review this documentation first
- Check existing security implementations
- Test in development environment before reporting

## Additional Resources

- [OWASP XSS Prevention Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Cross_Site_Scripting_Prevention_Cheat_Sheet.html)
- [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Web Crypto API Documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Crypto_API)
- [Google Gemini API Security](https://ai.google.dev/docs/security)