/**
 * Preloader Component
 * Manages the loading animation with percentage counter and rocket takeoff
 * Adapted for LLG v3 architecture
 */

class Preloader {
    constructor() {
        this.preloader = document.getElementById('preloader');
        this.percentage = document.getElementById('preloader-percentage');
        this.command = document.getElementById('preloader-command');
        this.slices = document.getElementById('preloader-slices');
        this.rocket = document.getElementById('preloader-rocket');
        
        this.currentPercentage = 10;
        this.targetPercentage = 10;
        this.isComplete = false;
        this.isLoading = false;
        this.pageLoaded = false;
        this.animationId = null;
        
        // Commands array
        this.commands = [
            'LAUNCHING YOUR ROI'
        ];
        this.currentCommand = '';
        
        this.init();
    }
    
    init() {
        console.log('🔄 Initializing preloader...');
        
        if (!this.preloader) {
            console.warn('⚠️ Preloader element not found');
            return;
        }
        
        // Show preloader
        this.show();
        
        // Set initial display
        this.updatePercentageDisplay();
        
        // Start loading simulation
        this.startLoading();
        
        // Listen for page load event
        if (document.readyState === 'complete') {
            this.onPageLoad();
        } else {
            window.addEventListener('load', () => this.onPageLoad());
        }
        
        console.log('✅ Preloader initialized');
    }
    
    show() {
        if (this.preloader) {
            this.preloader.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }
    
    hide() {
        if (this.preloader) {
            this.preloader.classList.add('hidden');
            document.body.style.overflow = '';
            
            // Clear resources and cancel fallback timer
            this.destroy();
            
            // Remove preloader from DOM after 1 second
            setTimeout(() => {
                if (this.preloader && this.preloader.parentNode) {
                    this.preloader.parentNode.removeChild(this.preloader);
                }
            }, 1000);
        }
    }
    
    startLoading() {
        if (this.isLoading) {
            console.log('⚠️ Animation already running, skipping');
            return;
        }
        
        this.isLoading = true;
        console.log('🎬 Starting countdown from 10 to 1');
        
        // Smooth animation from 10 to 1 over 2 seconds
        this.animateToPercentage(1, 2000);
        
        // After 2.2 seconds check if page is loaded
        setTimeout(() => {
            this.isLoading = false;
            if (this.pageLoaded) {
                this.completeLoading();
            }
        }, 2200);
    }
    
    onPageLoad() {
        console.log('📄 Page fully loaded');
        this.pageLoaded = true;
        
        // If loading animation is still running, wait for it to complete
        if (!this.isLoading) {
            this.completeLoading();
        }
    }
    
    completeLoading() {
        console.log('🎯 Completing countdown to 0');
        
        // Complete countdown to 0
        this.animateToPercentage(0, 500);
        
        setTimeout(() => {
            this.startExitAnimation();
        }, 800);
    }
    
    animateToPercentage(target, duration) {
        this.targetPercentage = target;
        const startPercentage = this.currentPercentage;
        const difference = target - startPercentage;
        const startTime = performance.now();
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Use easing function for smoothness
            const easeProgress = this.easeOutCubic(progress);
            
            this.currentPercentage = startPercentage + (difference * easeProgress);
            this.updatePercentageDisplay();
            
            if (progress < 1) {
                this.animationId = requestAnimationFrame(animate);
            } else {
                this.currentPercentage = target;
                this.updatePercentageDisplay();
            }
        };
        
        this.animationId = requestAnimationFrame(animate);
    }
    
    updatePercentageDisplay() {
        if (this.percentage) {
            const displayPercentage = Math.round(this.currentPercentage);
            this.percentage.textContent = `${displayPercentage}`;
            
            // Update command based on counter ranges
            this.updateCommand(displayPercentage);
        }
    }
    
    updateCommand(percentage) {
        // Always show the single command throughout the countdown
        const newCommand = this.commands[0];
        
        // Only update if command changed
        if (newCommand !== this.currentCommand) {
            this.currentCommand = newCommand;
            this.showCommand(newCommand);
        }
    }
    
    showCommand(commandText) {
        if (this.command && commandText) {
            // Update text and show with fade effect
            this.command.innerHTML = commandText;
            this.command.classList.remove('visible');
            
            // Small delay to ensure smooth transition
            setTimeout(() => {
                this.command.classList.add('visible');
            }, 50);
        }
    }
    
    startExitAnimation() {
        console.log('🎬 Starting preloader exit animation');
        
        // Cancel fallback timer immediately when normal completion starts
        if (window.fallbackTimer) {
            clearTimeout(window.fallbackTimer);
            window.fallbackTimer = null;
            console.log('✅ Fallback timer cancelled on exit animation start');
        }
        
        // Hide main content
        setTimeout(() => {
            if (this.percentage) this.percentage.style.opacity = '0';
            if (this.command) this.command.style.opacity = '0';
        }, 500);
        
        // Start rocket takeoff animation
        setTimeout(() => {
            this.startRocketTakeoff();
        }, 800);
    }
    
    startRocketTakeoff() {
        console.log('🚀 Starting rocket takeoff animation');
        
        if (this.rocket) {
            // Add takeoff animation class
            this.rocket.classList.add('takeoff');
            
            // Listen for animation end
            const handleAnimationEnd = () => {
                console.log('🚀 Rocket has taken off, starting slices animation');
                this.rocket.removeEventListener('animationend', handleAnimationEnd);
                this.startSlicesAnimation();
            };
            
            this.rocket.addEventListener('animationend', handleAnimationEnd);
            
            // Fallback in case animationend event doesn't fire
            setTimeout(() => {
                if (this.rocket && this.rocket.classList.contains('takeoff')) {
                    console.log('🚀 Fallback: starting slices animation after rocket takeoff');
                    this.rocket.removeEventListener('animationend', handleAnimationEnd);
                    this.startSlicesAnimation();
                }
            }, 2500); // 2s animation + 500ms buffer
        } else {
            // If rocket not found, hide preloader normally
            console.warn('⚠️ Rocket element not found, hiding preloader');
            this.hide();
        }
    }
    
    startSlicesAnimation() {
        console.log('🎬 Starting curtain separation animation');
        
        // Start curtain separation animation (they are already visible)
        if (this.slices) {
            this.slices.classList.add('animate');
            
            // Hide preloader after curtain animation completes
            setTimeout(() => {
                this.hide();
            }, 800); // Curtain animation duration
        } else {
            // If slices not found, hide preloader
            this.hide();
        }
    }
    
    // Easing function for smooth animation
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    // Method for force hiding (in case of errors)
    forceHide() {
        console.log('🚫 Force hiding preloader');
        this.hide();
    }
    
    // Resource cleanup
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Cancel fallback timer
        if (window.fallbackTimer) {
            clearTimeout(window.fallbackTimer);
            window.fallbackTimer = null;
            console.log('✅ Fallback timer cancelled');
        }
        
        window.removeEventListener('load', this.onPageLoad);
        
        if (this.preloader && this.preloader.parentNode) {
            this.preloader.parentNode.removeChild(this.preloader);
        }
        
        document.body.style.overflow = '';
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Preloader;
}

// Make available globally for direct usage
window.Preloader = Preloader;
