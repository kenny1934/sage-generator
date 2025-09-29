#!/usr/bin/env node

/**
 * SAGE Security Testing Script
 * Automated security testing using Node.js and browser automation
 */

const https = require('https');
const http = require('http');

class SecurityTester {
    constructor() {
        this.testResults = [];
        this.baseUrl = 'http://localhost:8080';
    }

    async runAllTests() {
        console.log('🔒 Starting SAGE Security Tests...\n');

        try {
            await this.testServerAvailability();
            await this.testCSPHeaders();
            await this.testXSSProtection();
            await this.testSecureStorage();
            await this.testSRIAttributes();

            this.displayResults();
        } catch (error) {
            console.error('❌ Test suite failed:', error.message);
        }
    }

    async testServerAvailability() {
        console.log('📡 Testing server availability...');

        return new Promise((resolve, reject) => {
            const req = http.get(this.baseUrl, (res) => {
                if (res.statusCode === 200) {
                    this.logTest('Server Availability', true, 'Server is running on port 8080');
                    resolve();
                } else {
                    this.logTest('Server Availability', false, `Server returned status ${res.statusCode}`);
                    reject(new Error(`Server not available: ${res.statusCode}`));
                }
            });

            req.on('error', (error) => {
                this.logTest('Server Availability', false, `Connection failed: ${error.message}`);
                reject(error);
            });

            req.setTimeout(5000, () => {
                this.logTest('Server Availability', false, 'Connection timeout');
                reject(new Error('Connection timeout'));
            });
        });
    }

    async testCSPHeaders() {
        console.log('🛡️  Testing Content Security Policy...');

        return new Promise((resolve) => {
            const req = http.get(this.baseUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    // Check for CSP meta tag
                    const cspRegex = /<meta\s+http-equiv="Content-Security-Policy"\s+content="([^"]+)"/i;
                    const cspMatch = data.match(cspRegex);

                    if (cspMatch) {
                        const cspContent = cspMatch[1];
                        this.logTest('CSP Meta Tag', true, 'Content Security Policy found');

                        // Check required directives
                        const requiredDirectives = [
                            'default-src',
                            'script-src',
                            'style-src',
                            'connect-src',
                            'object-src'
                        ];

                        requiredDirectives.forEach(directive => {
                            const hasDirective = cspContent.includes(directive);
                            this.logTest(`CSP ${directive}`, hasDirective,
                                hasDirective ? 'Directive present' : 'Directive missing');
                        });

                        // Check for unsafe directives
                        const hasUnsafeEval = cspContent.includes("'unsafe-eval'");
                        this.logTest('CSP unsafe-eval', !hasUnsafeEval,
                            hasUnsafeEval ? 'Unsafe eval allowed' : 'No unsafe eval');

                    } else {
                        this.logTest('CSP Meta Tag', false, 'Content Security Policy not found');
                    }

                    // Check for other security headers
                    const securityHeaders = [
                        'X-Content-Type-Options',
                        'Referrer-Policy'
                    ];

                    securityHeaders.forEach(header => {
                        const headerRegex = new RegExp(`<meta\\s+http-equiv="${header}"`, 'i');
                        const hasHeader = headerRegex.test(data);
                        this.logTest(header, hasHeader,
                            hasHeader ? 'Header present' : 'Header missing');
                    });

                    resolve();
                });
            });

            req.on('error', () => {
                this.logTest('CSP Headers', false, 'Failed to fetch page');
                resolve();
            });
        });
    }

    async testXSSProtection() {
        console.log('🚨 Testing XSS protection patterns...');

        // Test payloads that should be blocked
        const xssPayloads = [
            '<script>alert("XSS")</script>',
            'javascript:alert("XSS")',
            '<img src=x onerror=alert("XSS")>',
            '"><script>alert("XSS")</script>',
            '<iframe src="javascript:alert(\'XSS\')"></iframe>',
            'eval("alert(\\"XSS\\")")',
            '{{constructor.constructor("alert(\\"XSS\\")")()}}',
            '${alert("XSS")}',
            'onclick="alert(1)"',
            'expression(alert(1))'
        ];

        // Since we can't directly test the JavaScript validation here,
        // we'll check if the validation patterns exist in the code
        return new Promise((resolve) => {
            const req = http.get(`${this.baseUrl}/js/utils/validationUtils.js`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    // Check for key security patterns
                    const securityPatterns = [
                        'script.*>/i',
                        'javascript:/i',
                        'on\\w+\\s*=/i',
                        'eval\\s*\\(/i',
                        'data:.*text/i'
                    ];

                    let patternCount = 0;
                    securityPatterns.forEach(pattern => {
                        if (data.includes(pattern)) {
                            patternCount++;
                        }
                    });

                    const hasValidation = data.includes('validateInput') && data.includes('suspiciousPatterns');
                    this.logTest('XSS Validation Function', hasValidation,
                        hasValidation ? 'Input validation function found' : 'No input validation');

                    this.logTest('XSS Security Patterns', patternCount >= 3,
                        `${patternCount}/5 security patterns found`);

                    // Check for enhanced patterns
                    const hasEnhancedPatterns = data.includes('Template injection') ||
                                             data.includes('Event handlers') ||
                                             data.includes('HTML injection');
                    this.logTest('Enhanced XSS Protection', hasEnhancedPatterns,
                        hasEnhancedPatterns ? 'Enhanced patterns detected' : 'Basic patterns only');

                    resolve();
                });
            });

            req.on('error', () => {
                this.logTest('XSS Protection', false, 'Failed to fetch validation file');
                resolve();
            });
        });
    }

    async testSecureStorage() {
        console.log('🔐 Testing encryption implementation...');

        return new Promise((resolve) => {
            const req = http.get(`${this.baseUrl}/js/utils/secureStorage.js`, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    // Check for encryption features
                    const hasAESGCM = data.includes('AES-GCM');
                    this.logTest('AES-GCM Encryption', hasAESGCM,
                        hasAESGCM ? 'AES-GCM encryption found' : 'No AES-GCM encryption');

                    const hasPBKDF2 = data.includes('PBKDF2');
                    this.logTest('PBKDF2 Key Derivation', hasPBKDF2,
                        hasPBKDF2 ? 'PBKDF2 key derivation found' : 'No PBKDF2');

                    const hasIterations = data.includes('100000');
                    this.logTest('Secure Iterations', hasIterations,
                        hasIterations ? 'Secure iteration count (100k)' : 'Low iteration count');

                    const hasSalt = data.includes('salt') && data.includes('getRandomValues');
                    this.logTest('Salt Generation', hasSalt,
                        hasSalt ? 'Secure salt generation' : 'No secure salt');

                    const hasWebCrypto = data.includes('crypto.subtle');
                    this.logTest('Web Crypto API', hasWebCrypto,
                        hasWebCrypto ? 'Uses Web Crypto API' : 'No Web Crypto API');

                    resolve();
                });
            });

            req.on('error', () => {
                this.logTest('Secure Storage', false, 'Failed to fetch secure storage file');
                resolve();
            });
        });
    }

    async testSRIAttributes() {
        console.log('🔗 Testing Subresource Integrity...');

        return new Promise((resolve) => {
            const req = http.get(this.baseUrl, (res) => {
                let data = '';
                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    // Check for SRI attributes
                    const sriRegex = /integrity="sha384-[A-Za-z0-9+/=]+"/g;
                    const sriMatches = data.match(sriRegex);

                    if (sriMatches && sriMatches.length > 0) {
                        this.logTest('SRI Attributes', true, `${sriMatches.length} resources have SRI`);

                        // Check for specific external resources
                        const hasKatexSRI = data.includes('katex') && data.includes('integrity=');
                        this.logTest('KaTeX SRI', hasKatexSRI,
                            hasKatexSRI ? 'KaTeX resources have SRI' : 'KaTeX missing SRI');
                    } else {
                        this.logTest('SRI Attributes', false, 'No SRI attributes found');
                    }

                    // Check for crossorigin attributes
                    const hasCrossorigin = data.includes('crossorigin="anonymous"');
                    this.logTest('Crossorigin Attributes', hasCrossorigin,
                        hasCrossorigin ? 'Crossorigin attributes present' : 'No crossorigin attributes');

                    resolve();
                });
            });

            req.on('error', () => {
                this.logTest('SRI Attributes', false, 'Failed to fetch page for SRI check');
                resolve();
            });
        });
    }

    logTest(testName, passed, details) {
        const result = {
            test: testName,
            passed: passed,
            details: details,
            timestamp: new Date().toISOString()
        };

        this.testResults.push(result);

        const emoji = passed ? '✅' : '❌';
        const status = passed ? 'PASS' : 'FAIL';
        console.log(`  ${emoji} ${testName}: ${details}`);
    }

    displayResults() {
        const total = this.testResults.length;
        const passed = this.testResults.filter(r => r.passed).length;
        const failed = total - passed;
        const score = ((passed / total) * 100).toFixed(1);

        console.log('\n' + '='.repeat(60));
        console.log('🔒 SAGE SECURITY TEST SUMMARY');
        console.log('='.repeat(60));
        console.log(`📊 Total Tests: ${total}`);
        console.log(`✅ Passed: ${passed}`);
        console.log(`❌ Failed: ${failed}`);
        console.log(`📈 Success Rate: ${score}%`);

        if (score >= 90) {
            console.log('🏆 Security Rating: EXCELLENT');
        } else if (score >= 75) {
            console.log('🥈 Security Rating: GOOD');
        } else if (score >= 60) {
            console.log('🥉 Security Rating: FAIR');
        } else {
            console.log('⚠️  Security Rating: NEEDS IMPROVEMENT');
        }

        if (failed > 0) {
            console.log('\n❌ FAILED TESTS:');
            this.testResults.filter(r => !r.passed).forEach(result => {
                console.log(`   - ${result.test}: ${result.details}`);
            });
        }

        console.log('\n🔍 Detailed test report available in test results.');
        console.log('📖 Open http://localhost:8080/test-security.html for interactive testing.');
        console.log('='.repeat(60));
    }
}

// Run tests if called directly
if (require.main === module) {
    const tester = new SecurityTester();
    tester.runAllTests().catch(console.error);
}

module.exports = SecurityTester;