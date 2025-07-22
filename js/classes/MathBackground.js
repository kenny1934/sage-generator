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
        this.symbolCount = 0; // Track active symbols for performance
        this.maxSymbols = 15; // Limit concurrent symbols
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
        if (this.symbolCount >= this.maxSymbols) {
            console.log('Max symbols reached:', this.symbolCount);
            return;
        }
        
        console.log('Creating floating symbol');
        const symbol = document.createElement('div');
        symbol.className = 'floating-symbol';
        
        // Random symbol
        const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        symbol.textContent = randomSymbol;
        
        // Simplified approach to ensure animations work
        const sizes = ['small', 'medium', 'large'];
        const animations = ['', 'horizontal'];
        
        // Random size
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        symbol.classList.add(randomSize);
        
        // Random animation (20% chance for horizontal)
        if (Math.random() < 0.2) {
            symbol.classList.add('horizontal');
        }
        
        // Position based on animation type
        if (symbol.classList.contains('horizontal')) {
            symbol.style.top = Math.random() * 80 + 10 + '%';
            symbol.style.left = '-5%';
        } else {
            symbol.style.left = Math.random() * 90 + 5 + '%';
            symbol.style.top = '105%';
        }
        
        // Simplified timing
        symbol.style.animationDelay = Math.random() * 3 + 's';
        
        // Simple duration based on animation type
        const duration = symbol.classList.contains('horizontal') ? 20 : 15;
        symbol.style.animationDuration = duration + 's';
        
        this.container.appendChild(symbol);
        this.symbolCount++;
        
        console.log('Symbol created and appended:', symbol.textContent, 'Classes:', symbol.className, 'Count:', this.symbolCount);
        
        // Remove symbol after animation with cleanup
        setTimeout(() => {
            if (symbol.parentNode) {
                symbol.remove();
                this.symbolCount--;
                console.log('Symbol removed, count:', this.symbolCount);
            }
        }, (duration + 3) * 1000);
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        console.log('MathBackground starting...');
        
        // Create initial symbols
        for (let i = 0; i < 3; i++) {
            setTimeout(() => {
                if (this.isActive) {
                    console.log('Creating symbol', i);
                    this.createFloatingSymbol();
                }
            }, i * 1000);
        }
        
        // Continue creating symbols at intervals
        const interval = setInterval(() => {
            if (this.isActive && this.symbolCount < this.maxSymbols) {
                console.log('Creating symbol, count:', this.symbolCount);
                this.createFloatingSymbol();
            } else if (!this.isActive) {
                clearInterval(interval);
            }
        }, 3000);
        
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