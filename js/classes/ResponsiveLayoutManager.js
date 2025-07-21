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
    
    // Phase 4: Move questions to questions canvas
    moveQuestionsToCanvas() {
        const questionsContainer = document.getElementById('questionsContainer');
        const questionsCanvas = document.querySelector('.questions-content');
        const placeholder = document.getElementById('questionsPlaceholder');
        
        if (questionsContainer && questionsCanvas && this.isDesktop) {
            // Hide placeholder
            if (placeholder) placeholder.style.display = 'none';
            
            // Move questions container to canvas
            questionsCanvas.appendChild(questionsContainer);
            console.log('Questions moved to canvas');
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