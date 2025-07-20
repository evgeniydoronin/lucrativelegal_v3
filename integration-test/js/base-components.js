/* ===================================
   INTEGRATION TEST - BASE COMPONENTS
   =================================== */

// Mock Component Classes (simplified versions for testing)
class BaseComponent {
    constructor(element, options = {}) {
        this.element = element;
        this.options = { debug: false, ...options };
        this.id = this.generateId();
        this.isInitialized = false;
        this.eventListeners = [];
        
        if (this.options.debug) {
            console.log(`ℹ️ [${this.constructor.name}#${this.id}] Initializing component...`);
        }
        
        this.init();
    }
    
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    init() {
        try {
            this.beforeInit();
            this.setupElements();
            this.bindEvents();
            this.setupAnimations();
            this.afterInit();
            
            this.isInitialized = true;
            
            if (this.options.debug) {
                console.log(`✅ [${this.constructor.name}#${this.id}] Component initialized successfully`);
            }
        } catch (error) {
            console.error(`❌ [${this.constructor.name}#${this.id}] Initialization failed:`, error);
        }
    }
    
    beforeInit() {}
    setupElements() {}
    bindEvents() {}
    setupAnimations() {}
    afterInit() {}
    
    addEventListener(element, event, handler, options = {}) {
        element.addEventListener(event, handler, options);
        this.eventListeners.push({ element, event, handler, options });
    }
    
    destroy() {
        // Remove all event listeners
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
        
        // Kill GSAP animations
        if (typeof gsap !== 'undefined') {
            gsap.killTweensOf(this.element);
        }
        
        this.isInitialized = false;
    }
    
    getState() {
        return {
            id: this.id,
            isInitialized: this.isInitialized,
            eventListeners: this.eventListeners.length,
            element: this.element?.tagName || 'null'
        };
    }
    
    reset() {
        this.destroy();
        setTimeout(() => this.init(), 100);
    }
}

// Export for global access
window.BaseComponent = BaseComponent;
