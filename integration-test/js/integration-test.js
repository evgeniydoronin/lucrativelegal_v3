/* ===================================
   INTEGRATION TEST - MAIN CONTROLLER
   =================================== */

// Main Integration Test Object
window.integrationTest = {
    components: {},
    debugConsole: null,
    debugVisible: false,
    performanceMonitor: null,
    
    // Initialize integration test
    async init() {
        console.log('🚀 Starting All Components Integration Test');
        
        // Load libraries first
        const librariesLoaded = await loadLibraries();
        if (!librariesLoaded) {
            console.error('❌ Failed to load required libraries');
            return;
        }
        
        // Load component architecture
        await loadComponentArchitecture();
        
        // Initialize performance config
        PerformanceConfig.init();
        
        console.log('🔧 Initializing Integration Test...');
        
        this.debugConsole = document.getElementById('debug-content');
        this.setupPerformanceMonitor();
        this.addDebugLog('Integration Test initialized', 'success');
        
        // Initialize all components
        this.initializeComponents();
        
        // Setup keyboard shortcuts
        this.setupKeyboardShortcuts();
        
        // Setup smooth scrolling
        this.setupSmoothScrolling();
        
        console.log('✅ Integration Test ready!');
        console.log('⌨️ Keyboard shortcuts: Ctrl+D (debug), Ctrl+S (states), Ctrl+R (reset), Ctrl+T (test)');
        console.log('🎮 Use the control panel on the right to interact with the test');
        console.log('📊 Monitor performance metrics in the bottom right');
        console.log('🌟 All 13 components are ready for integration testing!');
    },
    
    // Initialize all components
    initializeComponents() {
        const componentConfigs = [
            { name: 'header', class: Header, element: '#header-sticky' },
            { name: 'preloader', class: Preloader, element: '#preloader' },
            { name: 'hero-cube', class: HeroCube, element: '#hero' },
            { name: 'hero-stars', class: HeroStarsScroll, element: '#hero' },
            { name: 'future-marketing', class: FutureMarketing, element: '#future-marketing' },
            { name: 'case-studies', class: CaseStudies, element: '#case-studies' },
            { name: 'services', class: Services, element: '#services' },
            { name: 'portfolio', class: Portfolio, element: '#portfolio' },
            { name: 'footer', class: Footer, element: '#footer' },
            { name: 'scroll-to-top', class: ScrollToTop, element: '#scroll-to-top' },
            { name: 'section-navigation', class: SectionNavigation, element: '#section-navigation' },
            { name: 'word-animator', class: WordAnimator, element: 'body' },
            { name: 'cursor-play-button', class: CursorPlayButton, element: 'body' }
        ];
        
        let successCount = 0;
        
        componentConfigs.forEach(config => {
            try {
                this.setComponentStatus(config.name, 'loading');
                
                const element = document.querySelector(config.element);
                if (!element) {
                    throw new Error(`Element ${config.element} not found`);
                }
                
                // Initialize component
                const component = new config.class(element, {
                    debug: true,
                    enableDebug: false
                });
                
                this.components[config.name] = component;
                this.setComponentStatus(config.name, 'success');
                this.addDebugLog(`${config.class.name} initialized successfully`, 'success');
                successCount++;
                
            } catch (error) {
                this.setComponentStatus(config.name, 'error');
                this.addDebugLog(`Failed to initialize ${config.class?.name || config.name}: ${error.message}`, 'error');
                console.error(`❌ Failed to initialize ${config.class?.name || config.name}:`, error);
            }
        });
        
        // Update components counter
        const componentsElement = document.getElementById('components-value');
        if (componentsElement) {
            componentsElement.textContent = `${successCount}/13`;
            
            const parent = componentsElement.parentElement;
            if (successCount === 13) {
                parent.className = 'performance-metric good';
                this.addDebugLog('All components initialized successfully!', 'success');
            } else if (successCount >= 10) {
                parent.className = 'performance-metric warning';
                this.addDebugLog(`${successCount}/13 components initialized`, 'warn');
            } else {
                parent.className = 'performance-metric danger';
                this.addDebugLog(`Only ${successCount}/13 components initialized`, 'error');
            }
        }
    },
    
    // Set component status indicator
    setComponentStatus(componentName, status) {
        const statusElement = document.getElementById(`status-${componentName}`);
        if (statusElement) {
            statusElement.className = `status ${status}`;
        }
    },
    
    // Add debug log entry
    addDebugLog(message, type = 'info') {
        if (!this.debugConsole) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = `log-entry ${type}`;
        logEntry.textContent = `${new Date().toLocaleTimeString()} - ${message}`;
        
        this.debugConsole.appendChild(logEntry);
        this.debugConsole.scrollTop = this.debugConsole.scrollHeight;
        
        // Limit console entries
        const entries = this.debugConsole.querySelectorAll('.log-entry');
        if (entries.length > 100) {
            entries[0].remove();
        }
    },
    
    // Clear debug console
    clearDebug() {
        if (this.debugConsole) {
            this.debugConsole.innerHTML = '';
            this.addDebugLog('Debug console cleared', 'info');
        }
    },
    
    // Setup performance monitor
    setupPerformanceMonitor() {
        // Memory monitoring
        if (performance.memory) {
            setInterval(() => {
                const memoryMB = Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
                const memoryElement = document.getElementById('memory-value');
                if (memoryElement) {
                    memoryElement.textContent = `${memoryMB}MB`;
                    
                    const parent = memoryElement.parentElement;
                    if (memoryMB <= 50) {
                        parent.className = 'performance-metric good';
                    } else if (memoryMB <= 100) {
                        parent.className = 'performance-metric warning';
                    } else {
                        parent.className = 'performance-metric danger';
                    }
                }
            }, 2000);
        }
        
        // ScrollTriggers monitoring
        setInterval(() => {
            if (typeof ScrollTrigger !== 'undefined') {
                const scrollTriggersCount = ScrollTrigger.getAll ? ScrollTrigger.getAll().length : 0;
                const scrollTriggersElement = document.getElementById('scrolltriggers-value');
                if (scrollTriggersElement) {
                    scrollTriggersElement.textContent = scrollTriggersCount;
                }
            }
        }, 1000);
        
        // Animations monitoring
        setInterval(() => {
            if (typeof gsap !== 'undefined') {
                const animationsCount = gsap.globalTimeline.getChildren().length;
                const animationsElement = document.getElementById('animations-value');
                if (animationsElement) {
                    animationsElement.textContent = animationsCount;
                }
            }
        }, 1000);
        
        // Event listeners monitoring
        setInterval(() => {
            let totalListeners = 0;
            Object.values(this.components).forEach(component => {
                if (component && component.eventListeners) {
                    totalListeners += component.eventListeners.length;
                }
            });
            
            const listenersElement = document.getElementById('listeners-value');
            if (listenersElement) {
                listenersElement.textContent = totalListeners;
            }
        }, 2000);
    },
    
    // Setup keyboard shortcuts
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch (e.key) {
                    case 'd':
                        e.preventDefault();
                        this.toggleDebug();
                        break;
                    case 's':
                        e.preventDefault();
                        this.getComponentStates();
                        break;
                    case 'r':
                        e.preventDefault();
                        this.resetAll();
                        break;
                    case 't':
                        e.preventDefault();
                        this.startTest();
                        break;
                }
            }
        });
    },
    
    // Setup smooth scrolling
    setupSmoothScrolling() {
        if (typeof Lenis !== 'undefined') {
            const lenis = new Lenis({
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
                direction: 'vertical',
                gestureDirection: 'vertical',
                smooth: true,
                mouseMultiplier: 1,
                smoothTouch: false,
                touchMultiplier: 2,
                infinite: false,
            });
            
            function raf(time) {
                lenis.raf(time);
                requestAnimationFrame(raf);
            }
            
            requestAnimationFrame(raf);
            
            // Integrate with GSAP ScrollTrigger
            if (typeof ScrollTrigger !== 'undefined') {
                lenis.on('scroll', ScrollTrigger.update);
                
                gsap.ticker.add((time) => {
                    lenis.raf(time * 1000);
                });
                
                gsap.ticker.lagSmoothing(0);
            }
            
            this.addDebugLog('Lenis smooth scrolling initialized', 'success');
        }
    },
    
    // Start integration test
    startTest() {
        this.addDebugLog('Starting comprehensive integration test...', 'info');
        
        // Test all components
        this.testScrollTriggers();
        setTimeout(() => this.testAnimations(), 1000);
        setTimeout(() => this.testInteractions(), 2000);
        setTimeout(() => this.testPerformance(), 3000);
        
        this.addDebugLog('Integration test completed!', 'success');
    },
    
    // Test ScrollTriggers
    testScrollTriggers() {
        this.addDebugLog('Testing ScrollTriggers...', 'info');
        
        if (typeof ScrollTrigger !== 'undefined') {
            const triggers = ScrollTrigger.getAll();
            this.addDebugLog(`Found ${triggers.length} ScrollTriggers`, 'info');
            
            // Test scroll to different sections
            const sections = ['#hero', '#future-marketing', '#case-studies', '#services', '#portfolio'];
            let currentSection = 0;
            
            const scrollToNext = () => {
                if (currentSection < sections.length) {
                    const section = document.querySelector(sections[currentSection]);
                    if (section) {
                        section.scrollIntoView({ behavior: 'smooth' });
                        this.addDebugLog(`Scrolled to ${sections[currentSection]}`, 'info');
                    }
                    currentSection++;
                    setTimeout(scrollToNext, 1500);
                } else {
                    // Scroll back to top
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                    this.addDebugLog('ScrollTrigger test completed', 'success');
                }
            };
            
            scrollToNext();
        } else {
            this.addDebugLog('ScrollTrigger not available', 'error');
        }
    },
    
    // Test animations
    testAnimations() {
        this.addDebugLog('Testing animations...', 'info');
        
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && typeof component.testAnimations === 'function') {
                try {
                    component.testAnimations();
                    this.addDebugLog(`${componentName} animations tested`, 'success');
                } catch (error) {
                    this.addDebugLog(`${componentName} animation test failed: ${error.message}`, 'error');
                }
            }
        });
    },
    
    // Test interactions
    testInteractions() {
        this.addDebugLog('Testing interactions...', 'info');
        
        // Test portfolio filters
        const portfolioFilters = document.querySelectorAll('.portfolio-filter');
        portfolioFilters.forEach((filter, index) => {
            setTimeout(() => {
                filter.click();
                this.addDebugLog(`Clicked portfolio filter: ${filter.textContent}`, 'info');
            }, index * 500);
        });
        
        // Test scroll to top button
        setTimeout(() => {
            const scrollToTopBtn = document.querySelector('.scroll-to-top-btn');
            if (scrollToTopBtn) {
                scrollToTopBtn.click();
                this.addDebugLog('Tested scroll to top button', 'info');
            }
        }, 2000);
        
        // Test service cards
        setTimeout(() => {
            const serviceCards = document.querySelectorAll('.js-card');
            if (serviceCards.length > 0) {
                serviceCards[0].click();
                this.addDebugLog('Tested service card interaction', 'info');
            }
        }, 2500);
    },
    
    // Test performance
    testPerformance() {
        this.addDebugLog('Running performance test...', 'info');
        
        const startTime = performance.now();
        let animationCount = 0;
        
        // Create multiple animations to stress test
        if (typeof gsap !== 'undefined') {
            const testElements = document.querySelectorAll('.portfolio-item, .future-card, .js-card');
            
            testElements.forEach((element, index) => {
                setTimeout(() => {
                    gsap.to(element, {
                        rotation: 360,
                        scale: 1.1,
                        duration: 1,
                        ease: "power2.inOut",
                        yoyo: true,
                        repeat: 1,
                        onComplete: () => {
                            animationCount++;
                            if (animationCount === testElements.length) {
                                const endTime = performance.now();
                                const duration = endTime - startTime;
                                this.addDebugLog(`Performance test completed in ${duration.toFixed(2)}ms`, 'success');
                            }
                        }
                    });
                }, index * 100);
            });
        }
    },
    
    // Stress test
    stressTest() {
        this.addDebugLog('Running stress test...', 'warn');
        
        if (typeof gsap !== 'undefined') {
            // Create many simultaneous animations
            const allElements = document.querySelectorAll('*');
            const testElements = Array.from(allElements).slice(0, 50); // Limit to 50 elements
            
            testElements.forEach((element, index) => {
                gsap.to(element, {
                    x: Math.random() * 100 - 50,
                    y: Math.random() * 100 - 50,
                    rotation: Math.random() * 360,
                    duration: 2,
                    ease: "power2.inOut",
                    yoyo: true,
                    repeat: 1,
                    delay: index * 0.01
                });
            });
            
            this.addDebugLog(`Stress test started with ${testElements.length} animations`, 'warn');
            
            setTimeout(() => {
                this.addDebugLog('Stress test completed', 'success');
            }, 5000);
        }
    },
    
    // Toggle debug console
    toggleDebug() {
        this.debugVisible = !this.debugVisible;
        const debugConsole = document.getElementById('debug-console');
        if (debugConsole) {
            debugConsole.classList.toggle('visible', this.debugVisible);
        }
        
        if (this.debugVisible) {
            this.addDebugLog('Debug console opened', 'info');
        } else {
            console.log('🐛 Debug console closed');
        }
    },
    
    // Get all component states
    getComponentStates() {
        this.addDebugLog('Getting all component states...', 'info');
        
        const states = {};
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && typeof component.getState === 'function') {
                try {
                    states[componentName] = component.getState();
                    this.addDebugLog(`${componentName} state retrieved`, 'success');
                } catch (error) {
                    this.addDebugLog(`Failed to get ${componentName} state: ${error.message}`, 'error');
                }
            }
        });
        
        console.log('📊 All Component States:', states);
        return states;
    },
    
    // Reset all components
    resetAll() {
        this.addDebugLog('Resetting all components...', 'warn');
        
        Object.keys(this.components).forEach(componentName => {
            const component = this.components[componentName];
            if (component && typeof component.reset === 'function') {
                try {
                    component.reset();
                    this.addDebugLog(`${componentName} reset`, 'success');
                } catch (error) {
                    this.addDebugLog(`Failed to reset ${componentName}: ${error.message}`, 'error');
                }
            }
        });
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Reset ScrollTriggers
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        integrationTest.init();
    });
} else {
    integrationTest.init();
}

// Export for global access
window.IntegrationTest = integrationTest;

console.log('🎯 Integration Test Scripts Loaded');
console.log('📋 Available Commands:');
console.log('   - integrationTest.startTest() - Run full integration test');
console.log('   - integrationTest.testScrollTriggers() - Test ScrollTrigger functionality');
console.log('   - integrationTest.testAnimations() - Test component animations');
console.log('   - integrationTest.testInteractions() - Test user interactions');
console.log('   - integrationTest.testPerformance() - Run performance test');
console.log('   - integrationTest.stressTest() - Run stress test');
console.log('   - integrationTest.toggleDebug() - Toggle debug console');
console.log('   - integrationTest.getComponentStates() - Get all component states');
console.log('   - integrationTest.resetAll() - Reset all components');
