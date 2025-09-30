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
        // Questions now live permanently in the right canvas
        // No DOM moving needed - CSS handles responsive layout
    }

    handleQuestionsLayout() {
        // Questions now permanently live in right canvas
        // This method is kept for backward compatibility but does nothing
        console.log('Questions layout handled by CSS - no DOM moving required');
    }
}