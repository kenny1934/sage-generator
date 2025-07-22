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
        if (this.symbolCount >= this.maxSymbols) return;
        
        const symbol = document.createElement('div');
        symbol.className = 'floating-symbol';
        
        // Random symbol
        const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        symbol.textContent = randomSymbol;
        
        // Enhanced size and animation variety
        const sizeAnimationPairs = [
            { size: 'small', animation: ['', 'pulse'], weight: 35 },
            { size: 'medium', animation: ['', 'drift', 'pulse'], weight: 30 },
            { size: 'large', animation: ['', 'drift'], weight: 20 },
            { size: 'extra-large', animation: ['spiral'], weight: 10 },
            { size: 'horizontal', animation: ['horizontal'], weight: 5 }
        ];
        
        // Weighted random selection for more interesting variety
        const totalWeight = sizeAnimationPairs.reduce((sum, pair) => sum + pair.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedPair;
        
        for (const pair of sizeAnimationPairs) {
            random -= pair.weight;
            if (random <= 0) {
                selectedPair = pair;
                break;
            }
        }
        
        // Apply size and animation
        symbol.classList.add(selectedPair.size);
        if (selectedPair.animation.length > 0) {
            const randomAnimation = selectedPair.animation[Math.floor(Math.random() * selectedPair.animation.length)];
            if (randomAnimation) symbol.classList.add(randomAnimation);
        }
        
        // Position based on animation type
        if (selectedPair.size === 'horizontal' || symbol.classList.contains('horizontal')) {
            symbol.style.top = Math.random() * 80 + 10 + '%';
            symbol.style.left = '-5%';
        } else {
            symbol.style.left = Math.random() * 90 + 5 + '%';
            symbol.style.top = '105%';
        }
        
        // Random delay and duration with improved variety
        symbol.style.animationDelay = Math.random() * 8 + 's';
        
        // Adjust duration based on size and animation type
        let baseDuration = 15;
        if (symbol.classList.contains('horizontal')) baseDuration = 20;
        if (symbol.classList.contains('spiral')) baseDuration = 30;
        if (symbol.classList.contains('drift')) baseDuration = 22;
        if (symbol.classList.contains('pulse')) baseDuration = 16;
        
        const duration = baseDuration + (Math.random() * 8 - 4);
        symbol.style.animationDuration = duration + 's';
        
        this.container.appendChild(symbol);
        this.symbolCount++;
        
        // Remove symbol after animation with cleanup
        setTimeout(() => {
            if (symbol.parentNode) {
                symbol.remove();
                this.symbolCount--;
            }
        }, (duration + 3) * 1000);
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // Create initial symbols with staggered timing
        for (let i = 0; i < 8; i++) {
            setTimeout(() => {
                if (this.isActive) this.createFloatingSymbol();
            }, i * 800);
        }
        
        // More frequent and varied symbol creation
        const primaryInterval = setInterval(() => {
            if (this.isActive && this.symbolCount < this.maxSymbols) {
                this.createFloatingSymbol();
            } else if (!this.isActive) {
                clearInterval(primaryInterval);
            }
        }, 2000); // More frequent spawning
        
        const secondaryInterval = setInterval(() => {
            if (this.isActive && this.symbolCount < this.maxSymbols - 2) {
                this.createFloatingSymbol();
            } else if (!this.isActive) {
                clearInterval(secondaryInterval);
            }
        }, 3500);
        
        // Occasional burst of symbols for visual interest
        const burstInterval = setInterval(() => {
            if (this.isActive && this.symbolCount < this.maxSymbols - 3) {
                // Create 2-3 symbols quickly
                for (let i = 0; i < Math.random() * 3 + 1; i++) {
                    setTimeout(() => {
                        if (this.isActive) this.createFloatingSymbol();
                    }, i * 200);
                }
            } else if (!this.isActive) {
                clearInterval(burstInterval);
            }
        }, 15000); // Every 15 seconds
        
        this.animationIntervals.push(primaryInterval, secondaryInterval, burstInterval);
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