/**
 * SAGE - Celebration Engine for Achievement Animations
 * Handles visual celebrations including confetti, sparkles, and burst animations
 */

class CelebrationEngine {
    constructor() {
        this.confettiContainer = null;
        this.colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7', '#a29bfe'];
        this.isActive = false;
    }

    init() {
        this.createConfettiContainer();
    }

    createConfettiContainer() {
        this.confettiContainer = document.createElement('div');
        this.confettiContainer.className = 'confetti-container';
        document.body.appendChild(this.confettiContainer);
    }

    celebrate(achievementType = 'default', intensity = 'medium') {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // Create celebration burst
        this.createCelebrationBurst();
        
        // Create confetti
        this.createConfetti(intensity);
        
        // Add sparkles
        this.createSparkles();
        
        // Reset active state after animation
        setTimeout(() => {
            this.isActive = false;
        }, 3000);
    }

    createCelebrationBurst() {
        const burst = document.createElement('div');
        burst.className = 'celebration-burst';
        
        // Position at center of screen
        burst.style.left = '50%';
        burst.style.top = '50%';
        burst.style.marginLeft = '-100px';
        burst.style.marginTop = '-100px';
        
        document.body.appendChild(burst);
        
        // Remove after animation
        setTimeout(() => {
            if (burst.parentNode) {
                burst.remove();
            }
        }, 600);
    }

    createConfetti(intensity = 'medium') {
        const counts = {
            low: 30,
            medium: 50,
            high: 80
        };
        
        const confettiCount = counts[intensity] || counts.medium;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                this.createConfettiPiece();
            }, i * 50);
        }
    }

    createConfettiPiece() {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random shape
        const shapes = ['circle', 'square', 'triangle'];
        const shape = shapes[Math.floor(Math.random() * shapes.length)];
        if (shape !== 'circle') {
            confetti.classList.add(shape);
        }
        
        // Random color
        const color = this.colors[Math.floor(Math.random() * this.colors.length)];
        if (shape === 'triangle') {
            confetti.style.borderBottomColor = color;
        } else {
            confetti.style.backgroundColor = color;
        }
        
        // Random starting position
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.top = '-10px';
        
        // Random animation duration and delay
        const duration = 2 + Math.random() * 2; // 2-4 seconds
        const delay = Math.random() * 0.5; // 0-0.5 second delay
        confetti.style.animationDuration = duration + 's';
        confetti.style.animationDelay = delay + 's';
        
        // Random horizontal drift
        const drift = (Math.random() - 0.5) * 200; // -100px to 100px
        confetti.style.setProperty('--drift', drift + 'px');
        
        this.confettiContainer.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            if (confetti.parentNode) {
                confetti.remove();
            }
        }, (duration + delay + 0.5) * 1000);
    }

    createSparkles() {
        const sparkleCount = 12;
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        
        for (let i = 0; i < sparkleCount; i++) {
            setTimeout(() => {
                this.createSparkle(centerX, centerY, i);
            }, i * 100);
        }
    }

    createSparkle(centerX, centerY, index) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle';
        
        // Position sparkles in a circle around the center
        const angle = (index / 12) * 2 * Math.PI;
        const radius = 80 + Math.random() * 40;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        sparkle.style.left = x + 'px';
        sparkle.style.top = y + 'px';
        sparkle.style.animationDelay = Math.random() * 0.5 + 's';
        
        document.body.appendChild(sparkle);
        
        // Remove after animation
        setTimeout(() => {
            if (sparkle.parentNode) {
                sparkle.remove();
            }
        }, 2000);
    }

    enhanceAchievementNotification(notification) {
        notification.classList.add('achievement-celebration');
        
        // Add extra sparkles around the notification
        const rect = notification.getBoundingClientRect();
        for (let i = 0; i < 6; i++) {
            setTimeout(() => {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.position = 'fixed';
                sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
                sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
                sparkle.style.zIndex = '1002';
                
                document.body.appendChild(sparkle);
                
                setTimeout(() => {
                    if (sparkle.parentNode) {
                        sparkle.remove();
                    }
                }, 1500);
            }, i * 200);
        }
    }
}