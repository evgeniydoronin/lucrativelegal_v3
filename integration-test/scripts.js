/* ===================================
   INTEGRATION TEST - MAIN LOADER
   All Components - Modular Architecture
   =================================== */

console.log('🚀 Loading Integration Test - Modular Architecture');

// Load all required modules in sequence
async function loadModules() {
    const modules = [
        'js/config.js',
        'js/base-components.js', 
        'js/components.js',
        'js/integration-test.js'
    ];
    
    console.log('📦 Loading modules...');
    
    for (const module of modules) {
        try {
            await loadScript(module);
            console.log(`✅ Loaded: ${module}`);
        } catch (error) {
            console.error(`❌ Failed to load ${module}:`, error);
            throw error;
        }
    }
    
    console.log('🎯 All modules loaded successfully!');
}

// Simple script loader
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script');
        script.src = src;
        script.onload = resolve;
        script.onerror = reject;
        document.head.appendChild(script);
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModules);
} else {
    loadModules();
}

console.log('📋 Integration Test - Modular Architecture Ready');
console.log('🔧 Modules will be loaded automatically');
console.log('⚡ Performance optimized with separated concerns');
console.log('🎮 All 13 components ready for testing');
