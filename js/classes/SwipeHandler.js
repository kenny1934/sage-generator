/**
 * SAGE - Swipe Gesture Handler for Mobile Question Navigation
 * Handles touch gestures for navigating between questions on mobile devices
 */

class SwipeHandler {
    constructor() {
        this.startX = 0;
        this.startY = 0;
        this.startTime = 0;
        this.isActive = false;
        this.minSwipeDistance = 50;
        this.maxSwipeTime = 300;
        this.maxVerticalDistance = 100;
    }

    init() {
        if (!this.isTouchDevice()) return;
        
        this.attachEventListeners();
        console.log('Swipe gesture handler initialized');
    }

    isTouchDevice() {
        return ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    }

    attachEventListeners() {
        const questionsContainer = document.getElementById('mathQuestionsList');
        if (!questionsContainer) return;

        questionsContainer.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        questionsContainer.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        questionsContainer.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    }

    handleTouchStart(e) {
        // Only handle if we have multiple questions
        if (totalQuestions <= 1) return;
        
        const touch = e.touches[0];
        this.startX = touch.clientX;
        this.startY = touch.clientY;
        this.startTime = Date.now();
        this.isActive = true;
    }

    handleTouchMove(e) {
        if (!this.isActive) return;
        
        // Prevent default scrolling if we're in a horizontal swipe
        const touch = e.touches[0];
        const deltaX = Math.abs(touch.clientX - this.startX);
        const deltaY = Math.abs(touch.clientY - this.startY);
        
        if (deltaX > deltaY && deltaX > 20) {
            e.preventDefault();
        }
    }

    handleTouchEnd(e) {
        if (!this.isActive) return;
        
        this.isActive = false;
        
        // Only handle if we have multiple questions
        if (totalQuestions <= 1) return;
        
        const touch = e.changedTouches[0];
        const endX = touch.clientX;
        const endY = touch.clientY;
        const endTime = Date.now();
        
        const deltaX = endX - this.startX;
        const deltaY = Math.abs(endY - this.startY);
        const deltaTime = endTime - this.startTime;
        
        // Check if this is a valid swipe
        if (Math.abs(deltaX) < this.minSwipeDistance) return;
        if (deltaY > this.maxVerticalDistance) return;
        if (deltaTime > this.maxSwipeTime) return;
        
        // Determine swipe direction
        if (deltaX > 0) {
            // Swipe right - go to previous question
            this.handleSwipe('right');
        } else {
            // Swipe left - go to next question
            this.handleSwipe('left');
        }
    }

    handleSwipe(direction) {
        const canNavigate = this.checkNavigationBounds(direction);
        
        if (!canNavigate) {
            this.showSwipeFeedback('blocked');
            return;
        }
        
        this.showSwipeFeedback('success');
        
        // Navigate with a small delay for visual feedback
        setTimeout(() => {
            if (direction === 'left') {
                navigateQuestion(1); // Next question
            } else {
                navigateQuestion(-1); // Previous question
            }
        }, 100);
        
        console.log(`Swipe ${direction} - navigating question`);
    }

    checkNavigationBounds(direction) {
        if (direction === 'left') {
            return currentQuestionIndex < totalQuestions - 1;
        } else {
            return currentQuestionIndex > 0;
        }
    }

    showSwipeFeedback(type) {
        const questionsContainer = document.getElementById('mathQuestionsList');
        if (!questionsContainer) return;
        
        questionsContainer.style.transition = 'transform 0.2s ease';
        
        if (type === 'success') {
            questionsContainer.style.transform = 'scale(0.98)';
            setTimeout(() => {
                questionsContainer.style.transform = '';
            }, 200);
        } else if (type === 'blocked') {
            questionsContainer.style.transform = 'translateX(10px)';
            setTimeout(() => {
                questionsContainer.style.transform = 'translateX(-10px)';
                setTimeout(() => {
                    questionsContainer.style.transform = '';
                }, 100);
            }, 100);
        }
    }
}