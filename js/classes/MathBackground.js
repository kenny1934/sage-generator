/**
 * SAGE - Animated Background Mathematical Elements
 * Creates floating mathematical symbols for visual enhancement
 */

class MathBackground {
    constructor() {
        this.container = null;
        this.symbols = ['π', '∑', '∫', '∞', 'α', 'β', 'γ', 'δ', 'θ', 'λ', 'μ', 'σ', 'φ', 'ψ', 'ω', '√', '∆', '∂', '≈', '≠', '≤', '≥', '∈', '⊂', '∪', '∩', '→', '↔', '±', '×', '÷'];
        this.isActive = false;
        this.animationIntervals = [];
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
        const symbol = document.createElement('div');
        symbol.className = 'floating-symbol';
        
        // Random symbol
        const randomSymbol = this.symbols[Math.floor(Math.random() * this.symbols.length)];
        symbol.textContent = randomSymbol;
        
        // Random size
        const sizes = ['small', 'medium', 'large'];
        const randomSize = sizes[Math.floor(Math.random() * sizes.length)];
        symbol.classList.add(randomSize);
        
        // Random starting position and animation type
        const animationType = Math.random() > 0.7 ? 'horizontal' : 'vertical';
        
        if (animationType === 'horizontal') {
            symbol.classList.add('horizontal');
            symbol.style.top = Math.random() * 80 + 10 + '%';
            symbol.style.left = '-5%';
        } else {
            symbol.style.left = Math.random() * 90 + 5 + '%';
            symbol.style.top = '105%';
        }
        
        // Random delay
        symbol.style.animationDelay = Math.random() * 5 + 's';
        
        // Random duration variation
        const baseDuration = animationType === 'horizontal' ? 20 : 15;
        const duration = baseDuration + (Math.random() * 10 - 5);
        symbol.style.animationDuration = duration + 's';
        
        this.container.appendChild(symbol);
        
        // Remove symbol after animation
        setTimeout(() => {
            if (symbol.parentNode) {
                symbol.remove();
            }
        }, (duration + 2) * 1000);
    }

    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // Create initial symbols
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                if (this.isActive) this.createFloatingSymbol();
            }, i * 1000);
        }
        
        // Continue creating symbols at intervals
        const verticalInterval = setInterval(() => {
            if (this.isActive) {
                this.createFloatingSymbol();
            } else {
                clearInterval(verticalInterval);
            }
        }, 3000);
        
        const horizontalInterval = setInterval(() => {
            if (this.isActive) {
                this.createFloatingSymbol();
            } else {
                clearInterval(horizontalInterval);
            }
        }, 5000);
        
        this.animationIntervals.push(verticalInterval, horizontalInterval);
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