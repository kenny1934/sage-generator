/**
 * SAGE - Security Testing Utilities
 * Runtime security validation and testing functions
 * NOTE: Only include in development builds
 */

class SecurityTester {
    constructor() {
        this.testResults = [];
    }

    // Run all security tests
    async runAllTests() {
        console.log('🔒 Starting SAGE Security Tests...');

        this.testXSSProtection();
        this.testInputValidation();
        this.testDOMSafety();
        await this.testEncryption();
        this.testCSPCompliance();

        this.displayResults();
        return this.testResults;
    }

    // Test XSS protection patterns
    testXSSProtection() {
        const xssPayloads = [
            '<script>alert("XSS")</script>',
            'javascript:alert("XSS")',
            '<img src=x onerror=alert("XSS")>',
            '"><script>alert("XSS")</script>',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            '<body onload=alert("XSS")>',
            '<svg onload=alert("XSS")>',
            'eval("alert(\\"XSS\\")")',
            '{{constructor.constructor("alert(\\"XSS\\")")()}}',
            '${alert("XSS")}',
            'data:text/html,<script>alert("XSS")</script>',
            '&#60;script&#62;alert("XSS")&#60;/script&#62;'
        ];

        let passed = 0;
        let total = xssPayloads.length;

        xssPayloads.forEach((payload, index) => {
            const result = validateInput(payload);
            if (result) {
                passed++;
            } else {
                this.logTest(`XSS Test ${index + 1}`, false, `Payload not blocked: ${payload}`);
            }
        });

        this.logTest('XSS Protection', passed === total, `${passed}/${total} payloads blocked`);
    }

    // Test input validation
    testInputValidation() {
        const validInputs = [
            'Linear algebra for Grade 10',
            'Calculus derivatives',
            'Trigonometry basics',
            'Quadratic equations',
            'Integration by parts'
        ];

        const invalidInputs = [
            '', // Empty
            'a', // Too short
            'x'.repeat(501), // Too long
            '<script>alert("test")</script>', // XSS
            'javascript:void(0)', // Protocol
            'onclick="alert(1)"' // Event handler
        ];

        let validPassed = 0;
        let invalidPassed = 0;

        validInputs.forEach(input => {
            if (!validateInput(input)) {
                validPassed++;
            }
        });

        invalidInputs.forEach(input => {
            if (validateInput(input)) {
                invalidPassed++;
            }
        });

        this.logTest(
            'Input Validation',
            validPassed === validInputs.length && invalidPassed === invalidInputs.length,
            `Valid: ${validPassed}/${validInputs.length}, Invalid: ${invalidPassed}/${invalidInputs.length}`
        );
    }

    // Test DOM manipulation safety
    testDOMSafety() {
        try {
            // Test safe element creation
            const safeElement = createElementSafe('div', {
                className: 'test-class',
                textContent: '<script>alert("test")</script>'
            });

            const hasXSS = safeElement.innerHTML.includes('<script>');
            this.logTest('Safe Element Creation', !hasXSS, hasXSS ? 'XSS content not escaped' : 'Content properly escaped');

            // Test HTML sanitization
            const dangerous = '<script>alert("XSS")</script><p>Safe content</p>';
            const sanitized = sanitizeHTML(dangerous);
            const hasScript = sanitized.includes('<script>');

            this.logTest('HTML Sanitization', !hasScript, hasScript ? 'Script tags not removed' : 'Dangerous content sanitized');

        } catch (error) {
            this.logTest('DOM Safety', false, `Error during DOM testing: ${error.message}`);
        }
    }

    // Test encryption functionality
    async testEncryption() {
        if (!window.secureStorage) {
            this.logTest('Encryption', false, 'SecureStorage not available');
            return;
        }

        try {
            const testData = 'test-api-key-12345';
            const testPassword = 'TestPassword123!';

            // Test encryption
            const encrypted = await window.secureStorage.encrypt(testData, testPassword);
            this.logTest('Encryption Process', encrypted && encrypted !== testData, 'Data encrypted successfully');

            // Test decryption
            const decrypted = await window.secureStorage.decrypt(encrypted, testPassword);
            this.logTest('Decryption Process', decrypted === testData, 'Data decrypted correctly');

            // Test wrong password
            try {
                await window.secureStorage.decrypt(encrypted, 'WrongPassword');
                this.logTest('Wrong Password Protection', false, 'Decryption succeeded with wrong password');
            } catch (error) {
                this.logTest('Wrong Password Protection', true, 'Correctly rejected wrong password');
            }

        } catch (error) {
            this.logTest('Encryption', false, `Encryption test failed: ${error.message}`);
        }
    }

    // Test CSP compliance
    testCSPCompliance() {
        const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');

        if (!cspMeta) {
            this.logTest('CSP Header', false, 'CSP meta tag not found');
            return;
        }

        const cspContent = cspMeta.getAttribute('content');
        const requiredDirectives = [
            'default-src',
            'script-src',
            'style-src',
            'connect-src',
            'object-src'
        ];

        let missingDirectives = [];
        requiredDirectives.forEach(directive => {
            if (!cspContent.includes(directive)) {
                missingDirectives.push(directive);
            }
        });

        this.logTest(
            'CSP Configuration',
            missingDirectives.length === 0,
            missingDirectives.length > 0 ? `Missing directives: ${missingDirectives.join(', ')}` : 'All required directives present'
        );
    }

    // Log test result
    logTest(testName, passed, details) {
        const result = {
            test: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        };

        this.testResults.push(result);

        const emoji = passed ? '✅' : '❌';
        console.log(`${emoji} ${testName}: ${details}`);
    }

    // Display test summary
    displayResults() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;

        console.log(`\n🔒 Security Test Summary:`);
        console.log(`   Total Tests: ${total}`);
        console.log(`   Passed: ${passed} ✅`);
        console.log(`   Failed: ${failed} ❌`);
        console.log(`   Success Rate: ${((passed / total) * 100).toFixed(1)}%`);

        if (failed > 0) {
            console.log(`\n❌ Failed Tests:`);
            this.testResults.filter(r => !r.passed).forEach(result => {
                console.log(`   - ${result.test}: ${result.details}`);
            });
        }
    }

    // Generate security report
    generateReport() {
        return {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.testResults.length,
                passed: this.testResults.filter(r => r.passed).length,
                failed: this.testResults.filter(r => !r.passed).length
            },
            tests: this.testResults,
            recommendations: this.generateRecommendations()
        };
    }

    // Generate security recommendations
    generateRecommendations() {
        const failed = this.testResults.filter(r => !r.passed);
        const recommendations = [];

        failed.forEach(result => {
            switch (result.test) {
                case 'XSS Protection':
                    recommendations.push('Review and strengthen XSS protection patterns in validateInput()');
                    break;
                case 'Input Validation':
                    recommendations.push('Improve input validation rules for edge cases');
                    break;
                case 'DOM Safety':
                    recommendations.push('Review DOM manipulation functions for XSS vulnerabilities');
                    break;
                case 'Encryption':
                    recommendations.push('Check encryption implementation and Web Crypto API usage');
                    break;
                case 'CSP Configuration':
                    recommendations.push('Update Content Security Policy directives');
                    break;
                default:
                    recommendations.push(`Address security issue in: ${result.test}`);
            }
        });

        return recommendations;
    }
}

// Global security tester instance (development only)
if (typeof window !== 'undefined') {
    window.securityTester = new SecurityTester();
}

// Auto-run tests in development mode
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    window.addEventListener('load', () => {
        // Delay to ensure all scripts are loaded
        setTimeout(() => {
            console.log('🔒 Development mode detected - running security tests...');
            window.securityTester.runAllTests();
        }, 2000);
    });
}