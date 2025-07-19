// =============================================================================
// AnimationService - Централизованная система управления анимациями
// =============================================================================

/**
 * Singleton сервис для управления всеми GSAP анимациями и ScrollTrigger
 * Решает проблему конфликтов между множественными ScrollTrigger экземплярами
 * 
 * Основные возможности:
 * - Централизованное управление ScrollTrigger
 * - Оптимизация производительности
 * - Готовые анимационные пресеты
 * - Мониторинг производительности
 * - Автоматическая очистка ресурсов
 */

class AnimationService {
    static instance = null;
    
    constructor() {
        if (AnimationService.instance) {
            return AnimationService.instance;
        }
        
        // Инициализация подсистем
        this.scrollTriggerManager = null;
        this.animationPresets = null;
        this.performanceMonitor = null;
        
        // Коллекции для управления ресурсами
        this.activeAnimations = new Map();
        this.activeTimelines = new Map();
        this.globalConfig = {
            debug: false,
            performanceMode: 'auto', // 'auto', 'performance', 'quality'
            maxScrollTriggers: 20,
            maxAnimations: 50
        };
        
        // Инициализация
        this.setupGSAP();
        this.initializeSubsystems();
        
        AnimationService.instance = this;
        
        this.log('success', 'AnimationService initialized');
    }
    
    /**
     * Получение единственного экземпляра сервиса (Singleton)
     */
    static getInstance() {
        if (!this.instance) {
            this.instance = new AnimationService();
        }
        return this.instance;
    }
    
    // =============================================================================
    // Инициализация и настройка
    // =============================================================================
    
    /**
     * Настройка GSAP для оптимальной производительности
     */
    setupGSAP() {
        // Проверка доступности GSAP
        if (typeof gsap === 'undefined') {
            throw new Error('GSAP is not loaded. Please include GSAP before AnimationService.');
        }
        
        // Регистрация плагинов
        if (typeof ScrollTrigger !== 'undefined') {
            gsap.registerPlugin(ScrollTrigger);
        } else {
            console.warn('ScrollTrigger plugin not found. Some features will be disabled.');
        }
        
        // Оптимальные настройки производительности
        gsap.ticker.lagSmoothing(1000, 16); // Сглаживание лагов
        gsap.ticker.fps(60); // Ограничение FPS
        
        // Настройки по умолчанию для всех анимаций
        gsap.defaults({
            ease: "power2.out",
            duration: 0.6,
            overwrite: "auto"
        });
        
        // Настройки ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.config({
                autoRefreshEvents: "visibilitychange,DOMContentLoaded,load",
                ignoreMobileResize: true,
                limitCallbacks: true
            });
        }
        
        this.log('info', 'GSAP configured for optimal performance');
    }
    
    /**
     * Инициализация подсистем
     */
    initializeSubsystems() {
        // Инициализируем подсистемы после создания основного сервиса
        // Это позволяет избежать циклических зависимостей
        
        try {
            // Инициализация ScrollTriggerManager
            if (typeof ScrollTriggerManager !== 'undefined') {
                this.scrollTriggerManager = new ScrollTriggerManager(this);
                this.log('success', 'ScrollTriggerManager initialized');
            } else {
                this.log('warn', 'ScrollTriggerManager not available');
            }
            
            // Инициализация других подсистем будет добавлена позже
            // this.animationPresets = new AnimationPresets(this);
            // this.performanceMonitor = new PerformanceMonitor(this);
            
            this.log('info', 'Subsystems initialization completed');
            
        } catch (error) {
            this.log('error', 'Failed to initialize subsystems', error);
        }
    }
    
    // =============================================================================
    // Управление конфигурацией
    // =============================================================================
    
    /**
     * Обновление глобальной конфигурации
     */
    updateConfig(newConfig) {
        this.globalConfig = { ...this.globalConfig, ...newConfig };
        
        if (newConfig.debug !== undefined) {
            this.setDebugMode(newConfig.debug);
        }
        
        this.log('info', 'Configuration updated', this.globalConfig);
    }
    
    /**
     * Включение/выключение режима отладки
     */
    setDebugMode(enabled) {
        this.globalConfig.debug = enabled;
        
        if (typeof ScrollTrigger !== 'undefined') {
            // Включаем/выключаем маркеры ScrollTrigger для отладки
            ScrollTrigger.config({ markers: enabled });
        }
        
        this.log('info', `Debug mode ${enabled ? 'enabled' : 'disabled'}`);
    }
    
    /**
     * Получение текущей конфигурации
     */
    getConfig() {
        return { ...this.globalConfig };
    }
    
    // =============================================================================
    // Управление ресурсами
    // =============================================================================
    
    /**
     * Регистрация анимации для отслеживания
     */
    registerAnimation(id, animation, type = 'tween') {
        if (this.activeAnimations.has(id)) {
            this.log('warn', `Animation with id "${id}" already exists. Replacing.`);
            this.unregisterAnimation(id);
        }
        
        this.activeAnimations.set(id, {
            animation,
            type,
            createdAt: Date.now(),
            componentId: null // Будет установлен компонентом
        });
        
        // Проверка лимитов
        if (this.activeAnimations.size > this.globalConfig.maxAnimations) {
            this.log('warn', `Animation limit exceeded: ${this.activeAnimations.size}/${this.globalConfig.maxAnimations}`);
        }
        
        this.log('debug', `Animation registered: ${id} (${type})`);
        return animation;
    }
    
    /**
     * Отмена регистрации анимации
     */
    unregisterAnimation(id) {
        const animationData = this.activeAnimations.get(id);
        
        if (animationData) {
            // Останавливаем и очищаем анимацию
            if (animationData.animation && animationData.animation.kill) {
                animationData.animation.kill();
            }
            
            this.activeAnimations.delete(id);
            this.log('debug', `Animation unregistered: ${id}`);
        }
    }
    
    /**
     * Регистрация Timeline для отслеживания
     */
    registerTimeline(id, timeline) {
        if (this.activeTimelines.has(id)) {
            this.log('warn', `Timeline with id "${id}" already exists. Replacing.`);
            this.unregisterTimeline(id);
        }
        
        this.activeTimelines.set(id, {
            timeline,
            createdAt: Date.now(),
            componentId: null
        });
        
        this.log('debug', `Timeline registered: ${id}`);
        return timeline;
    }
    
    /**
     * Отмена регистрации Timeline
     */
    unregisterTimeline(id) {
        const timelineData = this.activeTimelines.get(id);
        
        if (timelineData) {
            // Останавливаем и очищаем timeline
            if (timelineData.timeline && timelineData.timeline.kill) {
                timelineData.timeline.kill();
            }
            
            this.activeTimelines.delete(id);
            this.log('debug', `Timeline unregistered: ${id}`);
        }
    }
    
    // =============================================================================
    // Утилитарные методы
    // =============================================================================
    
    /**
     * Генерация уникального ID
     */
    generateId(prefix = 'anim') {
        return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    
    /**
     * Проверка доступности GSAP плагинов
     */
    checkPlugin(pluginName) {
        switch (pluginName) {
            case 'ScrollTrigger':
                return typeof ScrollTrigger !== 'undefined';
            case 'TextPlugin':
                return typeof TextPlugin !== 'undefined';
            case 'MorphSVGPlugin':
                return typeof MorphSVGPlugin !== 'undefined';
            default:
                return false;
        }
    }
    
    /**
     * Получение статистики сервиса
     */
    getStats() {
        const scrollTriggerCount = typeof ScrollTrigger !== 'undefined' 
            ? ScrollTrigger.getAll().length 
            : 0;
            
        return {
            activeAnimations: this.activeAnimations.size,
            activeTimelines: this.activeTimelines.size,
            scrollTriggers: scrollTriggerCount,
            memoryUsage: this.getMemoryUsage(),
            config: this.globalConfig
        };
    }
    
    /**
     * Получение информации об использовании памяти
     */
    getMemoryUsage() {
        if (performance.memory) {
            return {
                used: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
                total: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
                limit: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024)
            };
        }
        return null;
    }
    
    // =============================================================================
    // Очистка ресурсов
    // =============================================================================
    
    /**
     * Очистка всех анимаций компонента
     */
    cleanupComponent(componentId) {
        let cleanedCount = 0;
        
        // Очистка анимаций
        for (const [id, data] of this.activeAnimations.entries()) {
            if (data.componentId === componentId) {
                this.unregisterAnimation(id);
                cleanedCount++;
            }
        }
        
        // Очистка timeline
        for (const [id, data] of this.activeTimelines.entries()) {
            if (data.componentId === componentId) {
                this.unregisterTimeline(id);
                cleanedCount++;
            }
        }
        
        this.log('info', `Cleaned up ${cleanedCount} animations for component: ${componentId}`);
    }
    
    /**
     * Полная очистка всех ресурсов
     */
    cleanup() {
        // Очистка всех анимаций
        for (const [id] of this.activeAnimations.entries()) {
            this.unregisterAnimation(id);
        }
        
        // Очистка всех timeline
        for (const [id] of this.activeTimelines.entries()) {
            this.unregisterTimeline(id);
        }
        
        // Очистка ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.killAll();
        }
        
        this.log('info', 'All animations and resources cleaned up');
    }
    
    // =============================================================================
    // Система логирования
    // =============================================================================
    
    /**
     * Логирование с поддержкой уровней
     */
    log(level, message, data = null) {
        if (!this.globalConfig.debug && level === 'debug') {
            return;
        }
        
        const prefix = '[AnimationService]';
        const timestamp = new Date().toLocaleTimeString();
        
        switch (level) {
            case 'error':
                console.error(`❌ ${prefix} ${timestamp}: ${message}`, data || '');
                break;
            case 'warn':
                console.warn(`⚠️ ${prefix} ${timestamp}: ${message}`, data || '');
                break;
            case 'success':
                console.log(`✅ ${prefix} ${timestamp}: ${message}`, data || '');
                break;
            case 'info':
                console.log(`ℹ️ ${prefix} ${timestamp}: ${message}`, data || '');
                break;
            case 'debug':
                console.log(`🔍 ${prefix} ${timestamp}: ${message}`, data || '');
                break;
            default:
                console.log(`${prefix} ${timestamp}: ${message}`, data || '');
        }
    }
    
    // =============================================================================
    // Методы для интеграции с компонентами
    // =============================================================================
    
    /**
     * Инициализация для компонента
     * Вызывается из BaseComponent
     */
    initForComponent(componentId) {
        this.log('debug', `Initializing for component: ${componentId}`);
        
        // Возвращаем объект с методами для компонента
        return {
            registerAnimation: (id, animation, type) => {
                const fullId = `${componentId}_${id}`;
                const registeredAnimation = this.registerAnimation(fullId, animation, type);
                
                // Связываем с компонентом
                const animationData = this.activeAnimations.get(fullId);
                if (animationData) {
                    animationData.componentId = componentId;
                }
                
                return registeredAnimation;
            },
            
            registerTimeline: (id, timeline) => {
                const fullId = `${componentId}_${id}`;
                const registeredTimeline = this.registerTimeline(fullId, timeline);
                
                // Связываем с компонентом
                const timelineData = this.activeTimelines.get(fullId);
                if (timelineData) {
                    timelineData.componentId = componentId;
                }
                
                return registeredTimeline;
            },
            
            cleanup: () => {
                this.cleanupComponent(componentId);
            },
            
            generateId: (prefix) => {
                return this.generateId(`${componentId}_${prefix}`);
            }
        };
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.AnimationService = AnimationService;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimationService;
}
