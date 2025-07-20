// =============================================================================
// Animated Component - Специализированный базовый класс для анимированных компонентов
// =============================================================================

/**
 * Расширенный базовый класс для компонентов с анимациями
 * Добавляет управление GSAP анимациями и ScrollTrigger
 */

class AnimatedComponent extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        
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
    
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get requiredDependencies() {
        return [...super.requiredDependencies, 'gsap'];
    }
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            animationDuration: 0.6,
            animationEase: 'power2.out',
            respectReducedMotion: true,
            autoRefreshScrollTrigger: true
        };
    }
    
    // =============================================================================
    // Управление анимациями
    // =============================================================================
    
    /**
     * Добавление анимации в коллекцию для отслеживания
     */
    addAnimation(animation, name = null) {
        if (!animation) {
            this.log('warn', 'Attempted to add null animation');
            return null;
        }
        
        // Добавляем метаданные к анимации
        animation._componentId = this.id;
        animation._animationName = name;
        
        this.animations.add(animation);
        
        // Безопасные данные для логирования (без циклических ссылок)
        const safeData = {
            name: name || 'unnamed',
            type: animation.constructor.name,
            duration: typeof animation.duration === 'function' ? animation.duration() : 'unknown',
            targets: animation.targets ? animation.targets().length : 0
        };
        
        this.log('debug', `Animation added: ${name || 'unnamed'}`, safeData);
        
        return animation;
    }
    
    /**
     * Создание и добавление GSAP анимации
     */
    createAnimation(target, vars, name = null) {
        // Проверяем reduced motion
        if (this.reducedMotion && this.options.respectReducedMotion) {
            this.log('debug', 'Animation skipped due to reduced motion preference');
            return null;
        }
        
        // Добавляем базовые настройки
        const animationVars = {
            duration: this.options.animationDuration,
            ease: this.options.animationEase,
            ...vars
        };
        
        const animation = gsap.to(target, animationVars);
        return this.addAnimation(animation, name);
    }
    
    /**
     * Создание и добавление Timeline
     */
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
    
    /**
     * Добавление ScrollTrigger в коллекцию для отслеживания
     */
    addScrollTrigger(config, name = null) {
        if (!window.ScrollTrigger) {
            this.log('warn', 'ScrollTrigger not available');
            return null;
        }
        
        // Добавляем базовые настройки
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
    
    /**
     * Поиск анимации по имени
     */
    getAnimation(name) {
        return Array.from(this.animations).find(anim => anim._animationName === name);
    }
    
    /**
     * Поиск Timeline по имени
     */
    getTimeline(name) {
        return Array.from(this.timelines).find(timeline => timeline._timelineName === name);
    }
    
    /**
     * Поиск ScrollTrigger по имени
     */
    getScrollTrigger(name) {
        return Array.from(this.scrollTriggers).find(trigger => trigger._triggerName === name);
    }
    
    // =============================================================================
    // Управление состоянием анимаций
    // =============================================================================
    
    /**
     * Включение/отключение анимаций
     */
    setAnimationsEnabled(enabled) {
        this.animationsEnabled = enabled;
        
        if (enabled) {
            this.log('info', 'Animations enabled');
            this.emit('animationsEnabled');
        } else {
            this.log('info', 'Animations disabled');
            this.pauseAllAnimations();
            this.emit('animationsDisabled');
        }
    }
    
    /**
     * Пауза всех анимаций
     */
    pauseAllAnimations() {
        this.animations.forEach(animation => {
            if (animation.pause) animation.pause();
        });
        
        this.timelines.forEach(timeline => {
            if (timeline.pause) timeline.pause();
        });
        
        this.log('debug', 'All animations paused');
    }
    
    /**
     * Возобновление всех анимаций
     */
    resumeAllAnimations() {
        this.animations.forEach(animation => {
            if (animation.resume) animation.resume();
        });
        
        this.timelines.forEach(timeline => {
            if (timeline.resume) timeline.resume();
        });
        
        this.log('debug', 'All animations resumed');
    }
    
    /**
     * Перезапуск всех анимаций
     */
    restartAllAnimations() {
        this.animations.forEach(animation => {
            if (animation.restart) animation.restart();
        });
        
        this.timelines.forEach(timeline => {
            if (timeline.restart) timeline.restart();
        });
        
        this.log('debug', 'All animations restarted');
    }
    
    // =============================================================================
    // Обработка Reduced Motion
    // =============================================================================
    
    /**
     * Настройка слушателя изменений prefers-reduced-motion
     */
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
        
        // Сохраняем ссылку для очистки
        this._reducedMotionListener = {
            mediaQuery,
            handler: handleReducedMotionChange
        };
    }
    
    // =============================================================================
    // Переопределенные методы lifecycle
    // =============================================================================
    
    onRefresh() {
        super.onRefresh();
        
        // Обновляем ScrollTrigger если включено
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
        
        // Вызываем базовую очистку
        super.cleanupAnimations();
        
        this.log('success', 'Animations cleanup completed');
    }
    
    // =============================================================================
    // Утилитарные методы для анимаций
    // =============================================================================
    
    /**
     * Анимация появления элемента
     */
    animateIn(target = this.element, vars = {}) {
        const animationVars = {
            opacity: 1,
            y: 0,
            scale: 1,
            ...vars
        };
        
        return this.createAnimation(target, animationVars, 'animateIn');
    }
    
    /**
     * Анимация исчезновения элемента
     */
    animateOut(target = this.element, vars = {}) {
        const animationVars = {
            opacity: 0,
            y: -20,
            scale: 0.95,
            ...vars
        };
        
        return this.createAnimation(target, animationVars, 'animateOut');
    }
    
    /**
     * Анимация с задержкой (stagger)
     */
    animateStagger(targets, vars = {}, stagger = 0.1) {
        const animationVars = {
            stagger: stagger,
            ...vars
        };
        
        return this.createAnimation(targets, animationVars, 'stagger');
    }
    
    // =============================================================================
    // Статистика и отладка
    // =============================================================================
    
    /**
     * Получение статистики анимаций
     */
    getAnimationStats() {
        return {
            animations: this.animations.size,
            timelines: this.timelines.size,
            scrollTriggers: this.scrollTriggers.size,
            animationsEnabled: this.animationsEnabled,
            reducedMotion: this.reducedMotion
        };
    }
    
    /**
     * Логирование статистики анимаций
     */
    logAnimationStats() {
        const stats = this.getAnimationStats();
        this.log('info', 'Animation statistics:', stats);
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.AnimatedComponent = AnimatedComponent;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AnimatedComponent;
}
