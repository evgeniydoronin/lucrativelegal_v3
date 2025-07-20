// =============================================================================
// ScrollTriggerManager - Управление ScrollTrigger экземплярами
// =============================================================================

/**
 * Менеджер для централизованного управления ScrollTrigger экземплярами
 * Решает проблему конфликтов и оптимизирует производительность
 * 
 * Основные возможности:
 * - Создание оптимизированных ScrollTrigger
 * - Batch обработка множественных элементов
 * - Master Timeline для сложных анимаций
 * - Управление refreshPriority
 * - Автоматическая очистка ресурсов
 */

class ScrollTriggerManager {
    constructor(animationService) {
        this.service = animationService;
        this.triggers = new Map();
        this.batchTriggers = new Map();
        this.masterTimelines = new Map();
        this.priorityCounter = 0;
        
        // Конфигурация по умолчанию
        this.defaultConfig = {
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none reverse",
            refreshPriority: 0,
            markers: false
        };
        
        this.service.log('info', 'ScrollTriggerManager initialized');
    }
    
    // =============================================================================
    // Создание ScrollTrigger экземпляров
    // =============================================================================
    
    /**
     * Создание оптимизированного ScrollTrigger
     */
    create(config) {
        if (!this.checkScrollTriggerAvailability()) {
            return null;
        }
        
        const optimizedConfig = {
            ...this.defaultConfig,
            ...config,
            id: config.id || this.generateTriggerId(),
            refreshPriority: config.refreshPriority || this.getNextPriority()
        };
        
        // Добавляем обертки для callbacks для мониторинга
        this.wrapCallbacks(optimizedConfig);
        
        try {
            const trigger = ScrollTrigger.create(optimizedConfig);
            
            // Регистрируем trigger
            this.triggers.set(optimizedConfig.id, {
                trigger,
                config: optimizedConfig,
                createdAt: Date.now(),
                componentId: null
            });
            
            this.service.log('debug', `ScrollTrigger created: ${optimizedConfig.id}`, {
                start: optimizedConfig.start,
                end: optimizedConfig.end,
                refreshPriority: optimizedConfig.refreshPriority
            });
            
            // Проверка лимитов
            this.checkLimits();
            
            return trigger;
            
        } catch (error) {
            this.service.log('error', 'Failed to create ScrollTrigger', error);
            return null;
        }
    }
    
    /**
     * Batch обработка для множественных элементов
     */
    createBatch(selector, config) {
        if (!this.checkScrollTriggerAvailability()) {
            return null;
        }
        
        const batchId = config.id || this.generateTriggerId('batch');
        
        const batchConfig = {
            ...config,
            onEnter: (elements) => {
                this.service.log('debug', `Batch onEnter: ${elements.length} elements`);
                if (config.onEnter) {
                    config.onEnter(elements);
                }
            },
            onLeave: (elements) => {
                this.service.log('debug', `Batch onLeave: ${elements.length} elements`);
                if (config.onLeave) {
                    config.onLeave(elements);
                }
            },
            onEnterBack: (elements) => {
                this.service.log('debug', `Batch onEnterBack: ${elements.length} elements`);
                if (config.onEnterBack) {
                    config.onEnterBack(elements);
                }
            },
            onLeaveBack: (elements) => {
                this.service.log('debug', `Batch onLeaveBack: ${elements.length} elements`);
                if (config.onLeaveBack) {
                    config.onLeaveBack(elements);
                }
            }
        };
        
        try {
            const batchTrigger = ScrollTrigger.batch(selector, batchConfig);
            
            this.batchTriggers.set(batchId, {
                trigger: batchTrigger,
                selector,
                config: batchConfig,
                createdAt: Date.now(),
                componentId: null
            });
            
            this.service.log('info', `ScrollTrigger batch created: ${batchId} for selector: ${selector}`);
            
            return batchId;
            
        } catch (error) {
            this.service.log('error', 'Failed to create ScrollTrigger batch', error);
            return null;
        }
    }
    
    /**
     * Создание Master Timeline с ScrollTrigger
     */
    createMasterTimeline(config) {
        if (!this.checkScrollTriggerAvailability()) {
            return null;
        }
        
        const timelineId = config.id || this.generateTriggerId('timeline');
        
        this.service.log('debug', `🔧 Creating Master Timeline: ${timelineId}`, {
            trigger: config.trigger,
            start: config.start,
            end: config.end,
            scrub: config.scrub,
            pin: config.pin
        });
        
        // ИСПРАВЛЕНИЕ: Создаем Timeline напрямую с ScrollTrigger конфигурацией
        // Не создаем ScrollTrigger отдельно - это вызывает дублирование!
        const timeline = gsap.timeline({
            scrollTrigger: {
                trigger: config.trigger,
                start: config.start || "top top",
                end: config.end || "bottom bottom",
                scrub: config.scrub || false,
                pin: config.pin || false,
                anticipatePin: config.anticipatePin || 0,
                onUpdate: config.onUpdate || null,
                onEnter: config.onEnter || null,
                onLeave: config.onLeave || null,
                onEnterBack: config.onEnterBack || null,
                onLeaveBack: config.onLeaveBack || null,
                refreshPriority: config.refreshPriority || this.getNextPriority(),
                id: `${timelineId}_st`,
                markers: config.markers || false
            },
            defaults: {
                duration: 0.6,
                ease: "power2.out",
                ...config.defaults
            },
            ...config.timelineConfig
        });
        
        this.service.log('info', `✅ Master Timeline created: ${timelineId}`, {
            scrollTrigger: timeline.scrollTrigger ? 'attached' : 'missing',
            scrub: timeline.scrollTrigger?.vars?.scrub,
            pin: timeline.scrollTrigger?.vars?.pin
        });
        
        // Регистрируем timeline в AnimationService
        this.service.registerTimeline(timelineId, timeline);
        
        // Сохраняем связь
        this.masterTimelines.set(timelineId, {
            timeline,
            scrollTrigger: timeline.scrollTrigger, // Используем встроенный ScrollTrigger
            config,
            createdAt: Date.now(),
            componentId: null
        });
        
        return timeline;
    }
    
    // =============================================================================
    // Управление приоритетами
    // =============================================================================
    
    /**
     * Получение следующего приоритета
     */
    getNextPriority() {
        return ++this.priorityCounter;
    }
    
    /**
     * Установка приоритета для существующего trigger
     */
    setPriority(triggerId, priority) {
        const triggerData = this.triggers.get(triggerId);
        
        if (triggerData && triggerData.trigger) {
            triggerData.trigger.refresh();
            triggerData.config.refreshPriority = priority;
            
            this.service.log('debug', `Priority updated for trigger: ${triggerId} -> ${priority}`);
            
            // Пересортировка всех triggers
            this.sortTriggers();
        }
    }
    
    /**
     * Сортировка всех ScrollTrigger по приоритету
     */
    sortTriggers() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.sort();
            this.service.log('debug', 'ScrollTriggers sorted');
        }
    }
    
    // =============================================================================
    // Управление ресурсами
    // =============================================================================
    
    /**
     * Удаление конкретного trigger
     */
    kill(triggerId) {
        const triggerData = this.triggers.get(triggerId);
        
        if (triggerData) {
            if (triggerData.trigger && triggerData.trigger.kill) {
                triggerData.trigger.kill();
            }
            
            this.triggers.delete(triggerId);
            this.service.log('debug', `ScrollTrigger killed: ${triggerId}`);
        }
        
        // Проверяем batch triggers
        const batchData = this.batchTriggers.get(triggerId);
        if (batchData) {
            // Batch triggers убиваются через ScrollTrigger.killAll() или автоматически
            this.batchTriggers.delete(triggerId);
            this.service.log('debug', `Batch trigger removed: ${triggerId}`);
        }
        
        // Проверяем master timelines
        const timelineData = this.masterTimelines.get(triggerId);
        if (timelineData) {
            if (timelineData.timeline && timelineData.timeline.kill) {
                timelineData.timeline.kill();
            }
            if (timelineData.scrollTrigger && timelineData.scrollTrigger.kill) {
                timelineData.scrollTrigger.kill();
            }
            
            this.masterTimelines.delete(triggerId);
            this.service.log('debug', `Master timeline killed: ${triggerId}`);
        }
    }
    
    /**
     * Очистка всех triggers компонента
     */
    cleanupComponent(componentId) {
        let cleanedCount = 0;
        
        // Очистка обычных triggers
        for (const [id, data] of this.triggers.entries()) {
            if (data.componentId === componentId) {
                this.kill(id);
                cleanedCount++;
            }
        }
        
        // Очистка batch triggers
        for (const [id, data] of this.batchTriggers.entries()) {
            if (data.componentId === componentId) {
                this.kill(id);
                cleanedCount++;
            }
        }
        
        // Очистка master timelines
        for (const [id, data] of this.masterTimelines.entries()) {
            if (data.componentId === componentId) {
                this.kill(id);
                cleanedCount++;
            }
        }
        
        this.service.log('info', `Cleaned up ${cleanedCount} ScrollTriggers for component: ${componentId}`);
    }
    
    /**
     * Полная очистка всех triggers
     */
    cleanup() {
        // Убиваем все ScrollTrigger
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.killAll();
        }
        
        // Очищаем коллекции
        this.triggers.clear();
        this.batchTriggers.clear();
        this.masterTimelines.clear();
        
        // Сбрасываем счетчик приоритетов
        this.priorityCounter = 0;
        
        this.service.log('info', 'All ScrollTriggers cleaned up');
    }
    
    // =============================================================================
    // Обновление и синхронизация
    // =============================================================================
    
    /**
     * Обновление всех ScrollTrigger
     */
    refresh() {
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
            this.service.log('debug', 'All ScrollTriggers refreshed');
        }
    }
    
    /**
     * Обновление конкретного trigger
     */
    refreshTrigger(triggerId) {
        const triggerData = this.triggers.get(triggerId);
        
        if (triggerData && triggerData.trigger) {
            triggerData.trigger.refresh();
            this.service.log('debug', `ScrollTrigger refreshed: ${triggerId}`);
        }
    }
    
    // =============================================================================
    // Утилитарные методы
    // =============================================================================
    
    /**
     * Проверка доступности ScrollTrigger
     */
    checkScrollTriggerAvailability() {
        if (typeof ScrollTrigger === 'undefined') {
            this.service.log('error', 'ScrollTrigger plugin is not available');
            return false;
        }
        return true;
    }
    
    /**
     * Генерация ID для trigger
     */
    generateTriggerId(prefix = 'st') {
        return this.service.generateId(prefix);
    }
    
    /**
     * Обертка callbacks для мониторинга
     */
    wrapCallbacks(config) {
        const originalCallbacks = {};
        const callbackNames = ['onEnter', 'onLeave', 'onEnterBack', 'onLeaveBack', 'onUpdate', 'onToggle'];
        
        callbackNames.forEach(callbackName => {
            if (config[callbackName]) {
                originalCallbacks[callbackName] = config[callbackName];
                
                config[callbackName] = (...args) => {
                    this.service.log('debug', `ScrollTrigger callback: ${callbackName} for ${config.id}`);
                    return originalCallbacks[callbackName](...args);
                };
            }
        });
    }
    
    /**
     * Проверка лимитов
     */
    checkLimits() {
        const totalTriggers = this.triggers.size + this.batchTriggers.size + this.masterTimelines.size;
        const maxTriggers = this.service.globalConfig.maxScrollTriggers;
        
        if (totalTriggers > maxTriggers) {
            this.service.log('warn', `ScrollTrigger limit exceeded: ${totalTriggers}/${maxTriggers}`);
        }
    }
    
    /**
     * Получение статистики
     */
    getStats() {
        const allScrollTriggers = typeof ScrollTrigger !== 'undefined' 
            ? ScrollTrigger.getAll().length 
            : 0;
            
        return {
            managedTriggers: this.triggers.size,
            batchTriggers: this.batchTriggers.size,
            masterTimelines: this.masterTimelines.size,
            totalManaged: this.triggers.size + this.batchTriggers.size + this.masterTimelines.size,
            allScrollTriggers,
            priorityCounter: this.priorityCounter
        };
    }
    
    /**
     * Получение всех triggers компонента
     */
    getComponentTriggers(componentId) {
        const componentTriggers = {
            triggers: [],
            batchTriggers: [],
            masterTimelines: []
        };
        
        // Собираем обычные triggers
        for (const [id, data] of this.triggers.entries()) {
            if (data.componentId === componentId) {
                componentTriggers.triggers.push({ id, ...data });
            }
        }
        
        // Собираем batch triggers
        for (const [id, data] of this.batchTriggers.entries()) {
            if (data.componentId === componentId) {
                componentTriggers.batchTriggers.push({ id, ...data });
            }
        }
        
        // Собираем master timelines
        for (const [id, data] of this.masterTimelines.entries()) {
            if (data.componentId === componentId) {
                componentTriggers.masterTimelines.push({ id, ...data });
            }
        }
        
        return componentTriggers;
    }
    
    // =============================================================================
    // Методы для интеграции с компонентами
    // =============================================================================
    
    /**
     * Инициализация для компонента
     */
    initForComponent(componentId) {
        this.service.log('debug', `ScrollTriggerManager initializing for component: ${componentId}`);
        
        return {
            create: (config) => {
                const trigger = this.create({
                    ...config,
                    id: config.id || `${componentId}_${this.generateTriggerId()}`
                });
                
                // Связываем с компонентом
                if (trigger && config.id) {
                    const triggerData = this.triggers.get(config.id);
                    if (triggerData) {
                        triggerData.componentId = componentId;
                    }
                }
                
                return trigger;
            },
            
            createBatch: (selector, config) => {
                const batchId = this.createBatch(selector, {
                    ...config,
                    id: config.id || `${componentId}_batch_${this.generateTriggerId()}`
                });
                
                // Связываем с компонентом
                if (batchId) {
                    const batchData = this.batchTriggers.get(batchId);
                    if (batchData) {
                        batchData.componentId = componentId;
                    }
                }
                
                return batchId;
            },
            
            createMasterTimeline: (config) => {
                const timeline = this.createMasterTimeline({
                    ...config,
                    id: config.id || `${componentId}_timeline_${this.generateTriggerId()}`
                });
                
                // Связываем с компонентом
                if (timeline && config.id) {
                    const timelineData = this.masterTimelines.get(config.id);
                    if (timelineData) {
                        timelineData.componentId = componentId;
                    }
                }
                
                return timeline;
            },
            
            kill: (triggerId) => {
                this.kill(triggerId);
            },
            
            refresh: () => {
                this.refresh();
            },
            
            cleanup: () => {
                this.cleanupComponent(componentId);
            },
            
            getStats: () => {
                return this.getComponentTriggers(componentId);
            }
        };
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.ScrollTriggerManager = ScrollTriggerManager;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollTriggerManager;
}
