// =============================================================================
// Animated Interactive Component - Комбинированный базовый класс
// =============================================================================

/**
 * Комбинированный базовый класс для компонентов с анимациями и интерактивностью
 * Объединяет возможности AnimatedComponent и InteractiveComponent
 */

class AnimatedInteractiveComponent extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
    }
    
    // =============================================================================
    // Переопределенные lifecycle методы
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Инициализируем функциональность из AnimatedComponent
        this.initAnimatedFeatures();
        
        // Инициализируем функциональность из InteractiveComponent
        this.initInteractiveFeatures();
    }
    
    // =============================================================================
    // Инициализация функциональности
    // =============================================================================
    
    /**
     * Инициализация функций анимации
     */
    initAnimatedFeatures() {
        // Коллекции для управления анимациями
        this.animations = new Set();
        this.scrollTriggers = new Set();
        this.timelines = new Set();
        
        // Флаги состояния анимаций
        this.animationsEnabled = true;
        this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        
        // Слушаем изменения prefers-reduced-motion
        this.setupReducedMotionListener();
    }
    
    /**
     * Инициализация функций интерактивности
     */
    initInteractiveFeatures() {
        // 🚨 ИСПРАВЛЕНИЕ: НЕ создаем дублирующую eventHandlers Map!
        // BaseComponent уже имеет this.eventHandlers
        
        // Коллекции для управления throttling/debouncing
        this.throttledFunctions = new Map();
        this.debouncedFunctions = new Map();
        
        // Состояние интерактивности
        this.interactivityEnabled = true;
        this.touchDevice = 'ontouchstart' in window;
        
        // Настройка обработки resize
        this.setupResizeHandler();
    }
    
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get requiredDependencies() {
        return [...super.requiredDependencies, 'ScrollTrigger'];
    }
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Настройки анимаций
            animationDuration: 0.6,
            animationEase: 'power2.out',
            respectReducedMotion: true,
            autoRefreshScrollTrigger: true,
            // Настройки интерактивности
            throttleDelay: 16,
            debounceDelay: 250,
            enableTouchEvents: true,
            enableKeyboardEvents: true,
            enableResizeHandler: true,
            passive: true
        };
    }
    
    // =============================================================================
    // Методы из AnimatedComponent
    // =============================================================================
    
    addAnimation(animation, name = null) {
        if (!animation) {
            this.log('warn', 'Attempted to add null animation');
            return null;
        }
        
        animation._componentId = this.id;
        animation._animationName = name;
        
        this.animations.add(animation);
        this.log('debug', `Animation added: ${name || 'unnamed'}`, animation);
        
        return animation;
    }
    
    createAnimation(target, vars, name = null) {
        if (this.reducedMotion && this.options.respectReducedMotion) {
            this.log('debug', 'Animation skipped due to reduced motion preference');
            return null;
        }
        
        const animationVars = {
            duration: this.options.animationDuration,
            ease: this.options.animationEase,
            ...vars
        };
        
        const animation = gsap.to(target, animationVars);
        return this.addAnimation(animation, name);
    }
    
    createTimeline(vars = {}, name = null) {
        const timelineVars = {
            defaults: {
                duration: this.options.animationDuration,
                ease: this.options.animationEase
            },
            ...vars
        };
        
        const timeline = gsap.timeline(timelineVars);
        timeline._componentId = this.id;
        timeline._timelineName = name;
        
        this.timelines.add(timeline);
        this.log('debug', `Timeline created: ${name || 'unnamed'}`, timeline);
        
        return timeline;
    }
    
    addScrollTrigger(config, name = null) {
        if (!window.ScrollTrigger) {
            this.log('warn', 'ScrollTrigger not available');
            return null;
        }
        
        const triggerConfig = {
            refreshPriority: 0,
            ...config
        };
        
        const trigger = ScrollTrigger.create(triggerConfig);
        trigger._componentId = this.id;
        trigger._triggerName = name;
        
        this.scrollTriggers.add(trigger);
        this.log('debug', `ScrollTrigger added: ${name || 'unnamed'}`, trigger);
        
        return trigger;
    }
    
    setupReducedMotionListener() {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const handleReducedMotionChange = (e) => {
            this.reducedMotion = e.matches;
            this.log('info', `Reduced motion preference changed: ${this.reducedMotion}`);
            
            if (this.reducedMotion && this.options.respectReducedMotion) {
                this.pauseAllAnimations();
                this.emit('reducedMotionEnabled');
            } else {
                this.resumeAllAnimations();
                this.emit('reducedMotionDisabled');
            }
        };
        
        mediaQuery.addEventListener('change', handleReducedMotionChange);
        
        this._reducedMotionListener = {
            mediaQuery,
            handler: handleReducedMotionChange
        };
    }
    
    pauseAllAnimations() {
        this.animations.forEach(animation => {
            if (animation.pause) animation.pause();
        });
        
        this.timelines.forEach(timeline => {
            if (timeline.pause) timeline.pause();
        });
        
        this.log('debug', 'All animations paused');
    }
    
    resumeAllAnimations() {
        this.animations.forEach(animation => {
            if (animation.resume) animation.resume();
        });
        
        this.timelines.forEach(timeline => {
            if (timeline.resume) timeline.resume();
        });
        
        this.log('debug', 'All animations resumed');
    }
    
    // =============================================================================
    // Методы из InteractiveComponent
    // =============================================================================
    
    addEventHandler(element, event, handler, options = {}) {
        // 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем базовую систему событий!
        if (!element || !event || !handler) {
            this.log('warn', 'Invalid parameters for addEventHandler');
            return false;
        }
        
        // Настройки по умолчанию для AnimatedInteractiveComponent
        const eventOptions = {
            passive: this.options.passive,
            ...options
        };
        
        // Вызываем базовый метод вместо собственной логики
        return super.addEventHandler(element, event, handler, eventOptions);
    }
    
    removeEventHandler(element, event, handler) {
        // 🚨 КРИТИЧЕСКОЕ ИСПРАВЛЕНИЕ: Используем базовую систему событий!
        return super.removeEventHandler(element, event, handler);
    }
    
    generateEventKey(element, event, handler) {
        const elementId = element.id || element.className || element.tagName || 'unknown';
        const handlerName = handler.name || 'anonymous';
        return `${elementId}_${event}_${handlerName}_${Date.now()}`;
    }
    
    throttle(func, delay = this.options.throttleDelay, name = null) {
        const key = name || func.name || 'anonymous';
        
        if (this.throttledFunctions.has(key)) {
            return this.throttledFunctions.get(key);
        }
        
        let lastCall = 0;
        
        const throttledFunc = (...args) => {
            const now = Date.now();
            
            if (now - lastCall >= delay) {
                lastCall = now;
                return func.apply(this, args);
            }
        };
        
        this.throttledFunctions.set(key, throttledFunc);
        this.log('debug', `Throttled function created: ${key} (${delay}ms)`);
        
        return throttledFunc;
    }
    
    debounce(func, delay = this.options.debounceDelay, name = null) {
        const key = name || func.name || 'anonymous';
        
        if (this.debouncedFunctions.has(key)) {
            return this.debouncedFunctions.get(key);
        }
        
        let timeoutId;
        
        const debouncedFunc = (...args) => {
            clearTimeout(timeoutId);
            
            timeoutId = setTimeout(() => {
                func.apply(this, args);
            }, delay);
        };
        
        debouncedFunc.immediate = (...args) => {
            clearTimeout(timeoutId);
            func.apply(this, args);
        };
        
        debouncedFunc.cancel = () => {
            clearTimeout(timeoutId);
        };
        
        this.debouncedFunctions.set(key, debouncedFunc);
        this.log('debug', `Debounced function created: ${key} (${delay}ms)`);
        
        return debouncedFunc;
    }
    
    addThrottledEventHandler(element, event, handler, delay = this.options.throttleDelay, options = {}) {
        const throttledHandler = this.throttle(handler, delay, `${event}_${handler.name}`);
        return this.addEventHandler(element, event, throttledHandler, options);
    }
    
    addDebouncedEventHandler(element, event, handler, delay = this.options.debounceDelay, options = {}) {
        const debouncedHandler = this.debounce(handler, delay, `${event}_${handler.name}`);
        return this.addEventHandler(element, event, debouncedHandler, options);
    }
    
    setupResizeHandler() {
        if (!this.options.enableResizeHandler) {
            return;
        }
        
        const resizeHandler = () => {
            this.handleResize();
        };
        
        const debouncedHandler = this.debounce(resizeHandler, 250, 'resize_handler');
        this.addEventHandler(window, 'resize', debouncedHandler);
        this.log('debug', 'Automatic resize handler setup completed');
    }
    
    handleResize() {
        this.emit('resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
        
        this.onResize();
    }
    
    onResize() {
        // Переопределяется в дочерних классах
    }
    
    // =============================================================================
    // Комбинированные методы
    // =============================================================================
    
    /**
     * Создание анимированного обработчика события
     */
    addAnimatedEventHandler(element, event, animationVars, options = {}) {
        const handler = () => {
            this.createAnimation(element, animationVars, `${event}_animation`);
        };
        
        return this.addEventHandler(element, event, handler, options);
    }
    
    /**
     * Создание hover анимации
     */
    addHoverAnimation(element, hoverVars = {}, leaveVars = {}) {
        const defaultHoverVars = {
            scale: 1.05,
            duration: 0.3,
            ...hoverVars
        };
        
        const defaultLeaveVars = {
            scale: 1,
            duration: 0.3,
            ...leaveVars
        };
        
        const hoverHandler = () => {
            this.createAnimation(element, defaultHoverVars, 'hover_in');
        };
        
        const leaveHandler = () => {
            this.createAnimation(element, defaultLeaveVars, 'hover_out');
        };
        
        this.addEventHandler(element, 'mouseenter', hoverHandler);
        this.addEventHandler(element, 'mouseleave', leaveHandler);
        
        this.log('debug', 'Hover animation added');
    }
    
    /**
     * Создание scroll-triggered анимации с throttling
     */
    addScrollTriggeredAnimation(trigger, animationVars, scrollOptions = {}) {
        const scrollTriggerConfig = {
            trigger: trigger,
            start: "top 80%",
            end: "bottom 20%",
            ...scrollOptions,
            onEnter: () => {
                this.createAnimation(trigger, animationVars, 'scroll_triggered');
            }
        };
        
        return this.addScrollTrigger(scrollTriggerConfig, 'scroll_triggered');
    }
    
    // =============================================================================
    // Переопределенные методы lifecycle
    // =============================================================================
    
    onRefresh() {
        super.onRefresh();
        
        if (this.options.autoRefreshScrollTrigger && window.ScrollTrigger) {
            ScrollTrigger.refresh();
            this.log('debug', 'ScrollTrigger refreshed');
        }
    }
    
    // =============================================================================
    // Очистка ресурсов
    // =============================================================================
    
    cleanupAnimations() {
        this.log('debug', 'Cleaning up animations...');
        
        // Очистка GSAP анимаций
        this.animations.forEach(animation => {
            if (animation && animation.kill) {
                animation.kill();
            }
        });
        
        // Очистка Timeline
        this.timelines.forEach(timeline => {
            if (timeline && timeline.kill) {
                timeline.kill();
            }
        });
        
        // Очистка ScrollTrigger
        this.scrollTriggers.forEach(trigger => {
            if (trigger && trigger.kill) {
                trigger.kill();
            }
        });
        
        // Очистка коллекций
        this.animations.clear();
        this.timelines.clear();
        this.scrollTriggers.clear();
        
        // Очистка слушателя reduced motion
        if (this._reducedMotionListener) {
            this._reducedMotionListener.mediaQuery.removeEventListener(
                'change', 
                this._reducedMotionListener.handler
            );
        }
        
        super.cleanupAnimations();
        this.log('success', 'Animations cleanup completed');
    }
    
    unbindEvents() {
        this.log('debug', 'Cleaning up AnimatedInteractiveComponent resources...');
        
        // 🚨 ИСПРАВЛЕНИЕ: НЕ очищаем eventHandlers - это делает BaseComponent!
        
        // Очистка throttled функций
        this.throttledFunctions.forEach((func, key) => {
            if (func.cancel) func.cancel();
        });
        
        // Очистка debounced функций
        this.debouncedFunctions.forEach((func, key) => {
            if (func.cancel) func.cancel();
        });
        
        // Очистка только наших коллекций (eventHandlers очищается в BaseComponent)
        this.throttledFunctions.clear();
        this.debouncedFunctions.clear();
        
        this.log('success', 'AnimatedInteractiveComponent cleanup completed');
        
        // Вызываем базовую очистку которая обработает eventHandlers
        super.unbindEvents();
    }
    
    // =============================================================================
    // Статистика и отладка
    // =============================================================================
    
    getStats() {
        return {
            ...this.getAnimationStats(),
            ...this.getEventStats()
        };
    }
    
    getAnimationStats() {
        return {
            animations: this.animations.size,
            timelines: this.timelines.size,
            scrollTriggers: this.scrollTriggers.size,
            animationsEnabled: this.animationsEnabled,
            reducedMotion: this.reducedMotion
        };
    }
    
    getEventStats() {
        return {
            eventHandlers: this.eventHandlers.size,
            throttledFunctions: this.throttledFunctions.size,
            debouncedFunctions: this.debouncedFunctions.size,
            interactivityEnabled: this.interactivityEnabled,
            touchDevice: this.touchDevice
        };
    }
    
    logStats() {
        const stats = this.getStats();
        this.log('info', 'Component statistics:', stats);
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.AnimatedInteractiveComponent = AnimatedInteractiveComponent;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimatedInteractiveComponent;
}
