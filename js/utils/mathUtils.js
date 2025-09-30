/**
 * SAGE - Math Utilities
 * LaTeX processing, KaTeX rendering, and math content handling utilities
 */

// Sanitize HTML content
function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Generate a simple hash for question text (for tracking favorites)
function simpleHash(str) {
    if (!str) return '';
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
}

// Smart math preprocessing - handles API responses with math delimiters
function preprocessMathContent(content) {
    if (!content) return content;
    
    
    // SMART HANDLING: If content has math delimiters, validate and fix them
    if (content.includes('$') || content.includes('\\[') || content.includes('\\(')) {
        
        // Fix common issues with $$ \text{ patterns
        if (content.includes('$$ \\text{') || content.includes('$$\\text{')) {
            let processed = content;

            // Handle $$ \text{...} $$ patterns - extract text content
            processed = processed.replace(/\$\$\s*\\text\{([^}]*)\}\s*\$\$/g, '$1');
            return processed;
        }
        
        // For other math patterns, return as-is
        return content;
    }
    
    // ULTRA-CONSERVATIVE: Only process if content is CLEARLY mathematical
    // Must have explicit mathematical structures, not just backslashes
    const hasClearMathStructure = /\\frac\{.*\}.*\{.*\}|\\sqrt\{.*\}|\\int.*d[xyz]|\\sum.*=.*\^.*|\\lim.*\\to/.test(content);
    
    if (!hasClearMathStructure) {
        return content;
    }
    
    // Additional safety: ensure it's not just regular text with escaped characters
    const wordCount = content.split(/\s+/).length;
    const hasRegularWords = /\b(the|and|or|in|on|at|to|for|of|with|by|from|about|into|through|during|before|after|above|below|up|down|out|off|over|under|again|further|then|once)\b/i.test(content);
    
    if (wordCount > 10 && hasRegularWords) {
        return content;
    }
    
    
    // Add proper math delimiters if content appears to be mathematical
    let processed = content;
    
    // Check if content already has delimiters
    if (!processed.includes('$') && !processed.includes('\\[') && !processed.includes('\\(')) {
        // Only wrap if content has LaTeX commands
        if (processed.includes('\\frac') || processed.includes('\\sqrt') || processed.includes('\\int') || processed.includes('\\sum')) {
            processed = `$${processed}$`;
        }
    }
    
    return processed;
}

// Function to render math when content is added to the DOM
function renderMathContent(element) {
    if (!isKaTeXLoaded) {
        console.warn('KaTeX not loaded, skipping math rendering');
        return;
    }

    const mathElements = element.querySelectorAll('.math-rendered');
    mathElements.forEach(mathEl => {
        const originalContent = mathEl.innerHTML;
        const cacheKey = originalContent;
        
        if (mathRenderCache.has(cacheKey)) {
            mathEl.innerHTML = mathRenderCache.get(cacheKey);
        } else {
            try {
                // Only render if content has math delimiters or LaTeX commands
                if (originalContent.includes('$') || originalContent.includes('\\frac') || originalContent.includes('\\int') || originalContent.includes('\\sum')) {
                    // Render with KaTeX - let it handle the content naturally
                    renderMathInElement(mathEl, {
                        delimiters: [
                            {left: "$$", right: "$$", display: true},
                            {left: "$", right: "$", display: false}
                        ],
                        throwOnError: false,
                        errorColor: '#ef4444',
                        strict: false,
                        trust: false
                    });
                    
                    mathRenderCache.set(cacheKey, mathEl.innerHTML);
                }
                // If no math indicators, leave content as-is (don't process regular text)
            } catch (error) {
                console.error('Error rendering math:', error);
                // Keep original content on error
                mathEl.innerHTML = originalContent;
            }
        }
    });
}

// Retry math rendering with delay
function retryMathRendering(element, maxRetries = 3, delay = 500) {
    let retries = 0;
    
    const attemptRender = () => {
        if (retries >= maxRetries) {
            console.warn('Max retries reached for math rendering');
            return;
        }
        
        retries++;
        
        if (isKaTeXLoaded) {
            renderMathContent(element);
        } else {
            setTimeout(attemptRender, delay);
        }
    };
    
    attemptRender();
}

// Function to toggle between rendered math and raw LaTeX
function toggleMathView() {
    isMathRendered = !isMathRendered;
    toggleMathViewBtn.textContent = isMathRendered ? 'Toggle Math View (Rendered)' : 'Toggle Math View (Raw LaTeX)';

    document.querySelectorAll('.math-rendered').forEach(renderedDiv => {
        renderedDiv.style.display = isMathRendered ? 'block' : 'none';
    });

    document.querySelectorAll('.latex-view').forEach(latexDiv => {
        latexDiv.style.display = isMathRendered ? 'none' : 'block';
    });
}

// Check if KaTeX is properly loaded
function checkKaTeXLoaded() {
    if (typeof renderMathInElement === 'function' && typeof katex !== 'undefined') {
        isKaTeXLoaded = true;
    } else {
        isKaTeXLoaded = false;
        displayMessage('Warning: Math rendering library failed to load. Math expressions may not display correctly.', 'text-amber-400');
        console.error('KaTeX failed to load');
    }
}