/* ===================================
   INTEGRATION TEST - CONFIGURATION
   =================================== */

// GSAP and External Libraries
const GSAP_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js';
const SCROLLTRIGGER_CDN = 'https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js';
const LENIS_CDN = 'https://unpkg.com/lenis@1.3.5/dist/lenis.min.js';

// Load external libraries
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Load all required libraries
async function loadLibraries() {
    try {
        await loadScript(GSAP_CDN);
        await loadScript(SCROLLTRIGGER_CDN);
        await loadScript(LENIS_CDN);
        
        // Register ScrollTrigger plugin
        if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        }
        
        console.log('✅ All libraries loaded successfully');
        return true;
    } catch (error) {
        console.error('❌ Failed to load libraries:', error);
        return false;
    }
}

// Performance Configuration
const PerformanceConfig = {
    init() {
        console.log('🚀 Инициализация GSAP Performance Configuration...');
        
        if (typeof gsap !== 'undefined') {
            // GSAP Global Configuration
            gsap.config({
                force3D: true,
                autoSleep: 60,
                nullTargetWarn: false
            });
            
            // Lag Smoothing
            gsap.ticker.lagSmoothing(1000, 16);
            
            console.log(' ✅ GSAP глобальная конфигурация установлена');
            console.log('    - force3D: true (GPU ускорение включено)');
            console.log('    - autoSleep: 60s (автоотключение неактивных анимаций)');
            console.log(' ✅ GSAP lagSmoothing настроен: threshold=1000ms, adjustedLag=16ms');
        }
        
        // FPS Monitoring
        this.setupFPSMonitoring();
        
        // Will-change management
        this.setupWillChangeManagement();
        
        console.log(' ✅ GSAP Performance Configuration инициализирован');
    },
    
    setupFPSMonitoring() {
        let frameCount = 0;
        let lastTime = performance.now();
        
        const updateFPS = () => {
            frameCount++;
            const currentTime = performance.now();
            
            if (currentTime - lastTime >= 1000) {
                const fps = Math.round((frameCount * 1000) / (currentTime - lastTime));
                
                // Update FPS display if element exists
                const fpsElement = document.getElementById('fps-value');
                if (fpsElement) {
                    fpsElement.textContent = fps;
                    
                    const parent = fpsElement.parentElement;
                    if (fps >= 55) {
                        parent.className = 'performance-metric good';
                    } else if (fps >= 30) {
                        parent.className = 'performance-metric warning';
                    } else {
                        parent.className = 'performance-metric danger';
                    }
                }
                
                frameCount = 0;
                lastTime = currentTime;
            }
            
            requestAnimationFrame(updateFPS);
        };
        
        updateFPS();
        console.log(' ✅ Независимый FPS мониторинг запущен');
    },
    
    setupWillChangeManagement() {
        // Auto will-change management for GSAP animations
        if (typeof gsap !== 'undefined') {
            gsap.set('*', { willChange: 'auto' });
        }
        console.log(' ✅ willChange управление настроено');
    }
};

// Export for global access
window.PerformanceConfig = PerformanceConfig;
window.loadLibraries = loadLibraries;

// Load additional scripts for proper component architecture
async function loadComponentArchitecture() {
    const architectureScripts = [
        '../src/scripts/core/AnimationService.js',
        '../src/scripts/services/ScrollTriggerManager.js',
        '../src/scripts/core/BaseComponent.js',
        '../src/scripts/core/AnimatedComponent.js',
        '../src/scripts/core/InteractiveComponent.js',
        '../src/scripts/core/AnimatedInteractiveComponent.js',
        '../src/scripts/services/CubeAnimationService.js',
        '../src/scripts/services/VideoControlService.js',
        '../src/scripts/services/PositioningService.js',
        '../src/scripts/services/ScaleEffectService.js',
        '../src/scripts/services/TextVisibilityService.js',
        '../src/scripts/components/hero-cube-new.js'
    ];
    
    console.log('📦 Loading component architecture...');
    
    for (const script of architectureScripts) {
        try {
            await loadScript(script);
            console.log(`✅ Loaded: ${script}`);
        } catch (error) {
            console.warn(`⚠️ Failed to load ${script}:`, error);
            // Continue loading other scripts
        }
    }
    
    console.log('🎯 Component architecture loaded!');
}

// Export for global access
window.loadComponentArchitecture = loadComponentArchitecture;
