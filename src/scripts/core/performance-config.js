// =============================================================================
// GSAP Performance Configuration
// =============================================================================

/**
 * Централизованная конфигурация производительности GSAP
 * Основано на официальной документации: https://gsap.com/docs/v3/GSAP/gsap.config()
 */

class PerformanceConfig {
    constructor() {
        this.isInitialized = false;
        this.performanceMetrics = {
            fps: [],
            lastFrameTime: performance.now(),
            averageFPS: 60
        };
        
        this.init();
    }
    
    init() {
        if (this.isInitialized) {
            console.warn('⚠️ PerformanceConfig уже инициализирован');
            return;
        }
        
        console.log('🚀 Инициализация GSAP Performance Configuration...');
        
        // 1. Основная конфигурация GSAP
        this.setupGSAPConfig();
        
        // 2. Настройка lagSmoothing
        this.setupLagSmoothing();
        
        // 3. Настройка FPS ограничения
        this.setupFPSLimit();
        
        // 4. Настройка willChange управления
        this.setupWillChangeManagement();
        
        // 5. Мониторинг производительности
        this.setupPerformanceMonitoring();
        
        this.isInitialized = true;
        console.log('✅ GSAP Performance Configuration инициализирован');
    }
    
    /**
     * Основная конфигурация GSAP для оптимальной производительности
     */
    setupGSAPConfig() {
        if (typeof gsap === 'undefined') {
            console.error('❌ GSAP не найден! Убедитесь, что GSAP загружен перед этим скриптом.');
            return;
        }
        
        // Глобальная конфигурация GSAP
        gsap.config({
            // 🎯 GPU ускорение - принудительно включаем для всех анимаций
            force3D: true,
            
            // 🔄 Автоматическое отключение неактивных анимаций (экономия CPU)
            autoSleep: 60, // Отключать анимации через 60 секунд бездействия
            
            // 📱 Единицы измерения по умолчанию
            units: {
                left: "px",
                top: "px",
                rotation: "deg"
            },
            
            // 🎨 Настройки рендеринга
            nullTargetWarn: false, // Отключаем предупреждения для null целей в production
        });
        
        console.log('✅ GSAP глобальная конфигурация установлена');
        console.log('   - force3D: true (GPU ускорение включено)');
        console.log('   - autoSleep: 60s (автоотключение неактивных анимаций)');
    }
    
    /**
     * Настройка lagSmoothing для стабильной производительности
     * Документация: https://gsap.com/docs/v3/GSAP/gsap.ticker()
     */
    setupLagSmoothing() {
        // 🎛️ Оптимальные настройки lagSmoothing
        // threshold: 1000ms - если кадр занимает больше 1 секунды, считаем это лагом
        // adjustedLag: 16ms - ограничиваем deltaTime до 16ms (~60fps)
        gsap.ticker.lagSmoothing(1000, 16);
        
        console.log('✅ GSAP lagSmoothing настроен: threshold=1000ms, adjustedLag=16ms');
        console.log('   - Защита от лагов при переключении вкладок');
        console.log('   - Ограничение deltaTime до 16ms для стабильного FPS');
    }
    
    /**
     * Настройка ограничения FPS для предотвращения перегрузки
     */
    setupFPSLimit() {
        this.targetFPS = 60;
        this.frameInterval = 1000 / this.targetFPS; // 16.67ms для 60fps
        this.lastFrameTime = performance.now();
        
        // Создаем обертку для ticker с ограничением FPS
        this.originalTicker = gsap.ticker.add;
        
        gsap.ticker.add = (callback, once, prioritize) => {
            const wrappedCallback = (time, deltaTime, frame) => {
                const now = performance.now();
                const elapsed = now - this.lastFrameTime;
                
                // Ограничиваем выполнение до целевого FPS
                if (elapsed >= this.frameInterval) {
                    // Обновляем метрики производительности
                    this.updatePerformanceMetrics(elapsed);
                    
                    // Выполняем оригинальный callback
                    callback(time, deltaTime, frame);
                    
                    this.lastFrameTime = now;
                }
            };
            
            return this.originalTicker.call(gsap.ticker, wrappedCallback, once, prioritize);
        };
        
        console.log(`✅ FPS ограничение установлено: ${this.targetFPS} FPS (${this.frameInterval.toFixed(2)}ms интервал)`);
    }
    
    /**
     * Управление CSS willChange для оптимизации рендеринга
     */
    setupWillChangeManagement() {
        // Автоматическое управление willChange для GSAP анимаций
        gsap.set("*", {
            // Устанавливаем willChange только для анимируемых элементов
            willChange: "auto"
        });
        
        // Хук для автоматического добавления willChange при начале анимации
        gsap.registerPlugin({
            name: "willChangeManager",
            init() {
                // Добавляем willChange при начале анимации
                this.target.style.willChange = "transform, opacity";
                
                // Удаляем willChange при завершении анимации
                this.tween.eventCallback("onComplete", () => {
                    if (this.target && this.target.style) {
                        this.target.style.willChange = "auto";
                    }
                });
            }
        });
        
        console.log('✅ willChange управление настроено');
        console.log('   - Автоматическое добавление willChange при анимации');
        console.log('   - Автоматическое удаление willChange при завершении');
    }
    
    /**
     * Мониторинг производительности в реальном времени
     */
    setupPerformanceMonitoring() {
        // Мониторинг FPS
        this.fpsMonitorInterval = setInterval(() => {
            this.logPerformanceMetrics();
        }, 5000); // Каждые 5 секунд
        
        // Мониторинг памяти (если доступно)
        if (performance.memory) {
            this.memoryMonitorInterval = setInterval(() => {
                this.logMemoryUsage();
            }, 10000); // Каждые 10 секунд
        }
        
        console.log('✅ Мониторинг производительности запущен');
        console.log('   - FPS мониторинг: каждые 5 секунд');
        console.log('   - Memory мониторинг: каждые 10 секунд');
    }
    
    /**
     * Обновление метрик производительности
     */
    updatePerformanceMetrics(frameTime) {
        const fps = 1000 / frameTime;
        
        // Сохраняем последние 60 значений FPS
        this.performanceMetrics.fps.push(fps);
        if (this.performanceMetrics.fps.length > 60) {
            this.performanceMetrics.fps.shift();
        }
        
        // Рассчитываем средний FPS
        this.performanceMetrics.averageFPS = 
            this.performanceMetrics.fps.reduce((a, b) => a + b, 0) / 
            this.performanceMetrics.fps.length;
    }
    
    /**
     * Логирование метрик производительности
     */
    logPerformanceMetrics() {
        const avgFPS = this.performanceMetrics.averageFPS.toFixed(1);
        const minFPS = Math.min(...this.performanceMetrics.fps).toFixed(1);
        const maxFPS = Math.max(...this.performanceMetrics.fps).toFixed(1);
        
        console.log(`📊 Performance Metrics:`);
        console.log(`   - Average FPS: ${avgFPS}`);
        console.log(`   - Min FPS: ${minFPS}`);
        console.log(`   - Max FPS: ${maxFPS}`);
        
        // Предупреждение при низком FPS
        if (this.performanceMetrics.averageFPS < 30) {
            console.warn(`⚠️ Низкая производительность! Средний FPS: ${avgFPS}`);
        }
    }
    
    /**
     * Логирование использования памяти
     */
    logMemoryUsage() {
        if (!performance.memory) return;
        
        const used = (performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2);
        const total = (performance.memory.totalJSHeapSize / 1024 / 1024).toFixed(2);
        const limit = (performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2);
        
        console.log(`💾 Memory Usage:`);
        console.log(`   - Used: ${used} MB`);
        console.log(`   - Total: ${total} MB`);
        console.log(`   - Limit: ${limit} MB`);
        
        // Предупреждение при высоком использовании памяти
        const usagePercent = (performance.memory.usedJSHeapSize / performance.memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 80) {
            console.warn(`⚠️ Высокое использование памяти: ${usagePercent.toFixed(1)}%`);
        }
    }
    
    /**
     * Получение текущих метрик производительности
     */
    getMetrics() {
        return {
            averageFPS: this.performanceMetrics.averageFPS,
            minFPS: Math.min(...this.performanceMetrics.fps),
            maxFPS: Math.max(...this.performanceMetrics.fps),
            memoryUsage: performance.memory ? {
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit
            } : null
        };
    }
    
    /**
     * Оптимизация throttling для конкретного компонента
     */
    optimizeThrottling(componentName, currentThrottle = 16) {
        const avgFPS = this.performanceMetrics.averageFPS;
        let optimizedThrottle = currentThrottle;
        
        if (avgFPS < 30) {
            // Низкая производительность - увеличиваем throttling
            optimizedThrottle = Math.min(currentThrottle * 2, 50); // Максимум 50ms
            console.log(`🐌 ${componentName}: Увеличен throttling до ${optimizedThrottle}ms (FPS: ${avgFPS.toFixed(1)})`);
        } else if (avgFPS > 55) {
            // Высокая производительность - можем уменьшить throttling
            optimizedThrottle = Math.max(currentThrottle * 0.8, 8); // Минимум 8ms
            console.log(`🚀 ${componentName}: Уменьшен throttling до ${optimizedThrottle}ms (FPS: ${avgFPS.toFixed(1)})`);
        }
        
        return optimizedThrottle;
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        if (this.fpsMonitorInterval) {
            clearInterval(this.fpsMonitorInterval);
        }
        
        if (this.memoryMonitorInterval) {
            clearInterval(this.memoryMonitorInterval);
        }
        
        // Восстанавливаем оригинальный ticker
        if (this.originalTicker) {
            gsap.ticker.add = this.originalTicker;
        }
        
        this.isInitialized = false;
        console.log('🧹 PerformanceConfig очищен');
    }
}

// Создаем глобальный экземпляр
const performanceConfig = new PerformanceConfig();

// Экспортируем для использования в других модулях
if (typeof window !== 'undefined') {
    window.PerformanceConfig = performanceConfig;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PerformanceConfig;
}
