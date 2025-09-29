/**
 * SAGE - Responsive Layout Manager
 * Handles dynamic layout changes between mobile and desktop views
 */

class ResponsiveLayoutManager {
    constructor() {
        this.isDesktop = false;
        this.sidebarContent = document.getElementById('sidebar-content');
        this.mainContainer = document.querySelector('.main-container main');
        this.breakpoint = 1024; // Desktop breakpoint
        
        this.init();
    }
    
    init() {
        this.checkLayout();
        window.addEventListener('resize', () => this.checkLayout());
        console.log('Responsive Layout Manager initialized');
    }
    
    checkLayout() {
        const wasDesktop = this.isDesktop;
        this.isDesktop = window.innerWidth >= this.breakpoint;
        
        if (wasDesktop !== this.isDesktop) {
            this.reorganizeLayout();
            // Also move questions if they exist
            this.handleQuestionsLayout();
        }
    }
    
    reorganizeLayout() {
        console.log(`Layout change: ${this.isDesktop ? 'Desktop' : 'Mobile'} mode`);
        
        if (this.isDesktop) {
            this.moveToSidebar();
        } else {
            this.moveToMain();
        }
    }
    
    moveToSidebar() {
        // For now, disable automatic section moving to prevent bugs
        // We'll implement this properly in the new layout design
        console.log('Sidebar layout - sections remain in main content for now');
    }
    
    // Handle questions layout based on screen size
    handleQuestionsLayout() {
        const questionsContainer = document.getElementById('questionsContainer');
        if (!questionsContainer || questionsContainer.classList.contains('hidden')) {
            return; // No questions to move
        }
        
        if (this.isDesktop) {
            this.moveQuestionsToCanvas();
        } else {
            this.moveQuestionsToSidebar();
        }
    }
    
    // Move questions back to sidebar (mobile view)
    moveQuestionsToSidebar() {
        const questionsContainer = document.getElementById('questionsContainer');
        const configPanel = document.querySelector('.config-panel');
        const messageContainer = document.getElementById('messageContainer');
        
        if (questionsContainer && configPanel && messageContainer) {
            // Restore original spacing for sidebar
            questionsContainer.classList.add('mt-10', 'border-t-2', 'border-gray-700', 'pt-10');
            
            // Restore header spacing
            const headerDiv = questionsContainer.querySelector('.flex.flex-col.sm\\:flex-row');
            if (headerDiv) {
                headerDiv.classList.remove('mb-4');
                headerDiv.classList.add('mb-8');
            }
            
            // Insert back into config panel after message container
            messageContainer.insertAdjacentElement('afterend', questionsContainer);
            console.log('Questions moved back to sidebar');
        }
    }
    
    // Phase 4: Move questions to questions canvas (desktop view)
    moveQuestionsToCanvas() {
        const questionsContainer = document.getElementById('questionsContainer');
        const questionsCanvas = document.querySelector('.questions-content');
        const placeholder = document.getElementById('questionsPlaceholder');
        
        if (questionsContainer && questionsCanvas && this.isDesktop) {
            // Hide placeholder
            if (placeholder) placeholder.style.display = 'none';
            
            // Remove ALL spacing classes and styles for canvas view
            questionsContainer.classList.remove('mt-10', 'border-t-2', 'border-gray-700', 'pt-10');
            
            // Clear the canvas completely first
            questionsCanvas.innerHTML = '';
            
            // Reduce header spacing for canvas
            const headerDiv = questionsContainer.querySelector('.flex.flex-col.sm\\:flex-row');
            if (headerDiv) {
                headerDiv.classList.remove('mb-8');
                headerDiv.classList.add('mb-4');
            }
            
            // Move questions container to canvas
            questionsCanvas.appendChild(questionsContainer);
            console.log('Questions moved to canvas with spacing optimized for canvas view');
        }
    }
    
    moveToMain() {
        // Move sections back to main content area
        const sidebarSections = this.sidebarContent.querySelectorAll('.sidebar-section');
        sidebarSections.forEach(section => section.remove());
        
        // Show original sections in main content
        const originalSections = [
            '#statsOverview',
            '#recentTopicsSection', 
            '#recommendationsSection'
        ];
        
        originalSections.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                element.style.display = '';
            }
        });
    }
}