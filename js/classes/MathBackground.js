/**
 * SAGE - Animated Background Mathematical Elements
 * Creates floating mathematical symbols for visual enhancement
 */

class MathBackground {
    constructor() {
        this.container = null;
        this.symbols = [
            // Basic symbols
            'π', '∑', '∫', '∞', 'α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', 'σ', 'φ', 'ψ', 'ω',
            // Operations and relations
            '√', '∆', '∂', '≈', '≠', '≤', '≥', '∈', '⊂', '∪', '∩', '→', '↔', '±', '×', '÷',
            // Advanced symbols
            '∇', '∃', '∀', '⟨', '⟩', '⊕', '⊗', '⊥', '∥', '∴', '∵', '⇒', '⇔', '℃', '℉', '°',
            // Mathematical constants
            'ℝ', 'ℂ', 'ℕ', 'ℤ', 'ℚ', '∅', '℮', 'ℏ', '⊤', '⊥', '∣', '∤', '∝', '≡', '≢', '≍'
        ];
        this.isActive = false;
        this.animationIntervals = [];
        this.symbolCount = 0;
        this.maxSymbols = 10; // Optimal balance for clean appearance
    }

    init() {
        this.createContainer();
        this.start();
    }

    createContainer() {
        this.container = document.createElement('div');
        this.container.className = 'math-background';
        document.body.appendChild(this.container);
    }

    createFloatingSymbol() {
        // Limit concurrent symbols for performance
        if (this.symbolCount >= this.maxSymbols) return;
        
        const symbol = document.createElement('div');
        symbol.className = 'floating-symbol';
        
        // Random symbol
        const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        symbol.textContent = randomSymbol;
        
        // Enhanced animation variety with longer durations
        const sizes = ['small', 'medium', 'large', 'extra-large'];
        const animations = ['', 'horizontal', 'drift', 'spiral', 'pulse'];
        
        // Random size
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        symbol.classList.add(randomSize);
        
        // Random animation with better distribution
        const animationType = Math.random();
        if (animationType < 0.15) {
            symbol.classList.add('horizontal');
        } else if (animationType < 0.3) {
            symbol.classList.add('drift');
        } else if (animationType < 0.45) {
            symbol.classList.add('spiral');
        } else if (animationType < 0.6) {
            symbol.classList.add('pulse');
        }
        // 40% chance for default vertical float animation
        
        // Position based on animation type for better distribution
        if (symbol.classList.contains('horizontal')) {
            // Horizontal symbols: start from left, random vertical position
            symbol.style.top = Math.random() * 80 + 10 + '%';
            symbol.style.left = '-5%';
        } else {
            // Vertical symbols: start from bottom, random horizontal position
            symbol.style.left = Math.random() * 90 + 5 + '%';
            symbol.style.top = '105%';
        }
        
        // Add some symbols starting from different positions for immediate visibility
        if (Math.random() < 0.3) {
            // 30% chance to start symbols at random screen positions for immediate visibility
            symbol.style.left = Math.random() * 90 + 5 + '%';
            symbol.style.top = Math.random() * 80 + 10 + '%';
            // Reduce animation delay for these visible symbols
            symbol.style.animationDelay = Math.random() * 2 + 's';
        }
        
        // Varied animation delay for natural flow
        symbol.style.animationDelay = Math.random() * 5 + 's';
        
        this.container.appendChild(symbol);
        this.symbolCount++;
        
        
        // Remove symbol after much longer time for better density
        const cleanupTime = symbol.classList.contains('horizontal') ? 60000 : 50000;
        setTimeout(() => {
            if (symbol.parentNode) {
                symbol.remove();
                this.symbolCount--;
            }
        }, cleanupTime);
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // Create initial burst of symbols
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (this.isActive) this.createFloatingSymbol();
            }, i * 500);
        }
        
        // Continue creating symbols at moderate intervals for clean appearance
        const interval = setInterval(() => {
            if (this.isActive && this.symbolCount < this.maxSymbols) {
                this.createFloatingSymbol();
            } else if (!this.isActive) {
                clearInterval(interval);
            }
        }, 1500);
        
        this.animationIntervals.push(interval);
    }

    stop() {
        this.isActive = false;
        this.animationIntervals.forEach(interval => clearInterval(interval));
        this.animationIntervals = [];
        
        if (this.container) {
            this.container.innerHTML = '';
        }
    }

    toggle() {
        if (this.isActive) {
            this.stop();
        } else {
            this.start();
        }
    }
}