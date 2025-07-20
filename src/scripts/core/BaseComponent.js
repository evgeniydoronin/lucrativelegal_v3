// =============================================================================
// Base Component Architecture
// =============================================================================

/**
 * Базовый класс для всех компонентов системы
 * Обеспечивает единую архитектуру, lifecycle и обработку ошибок
 */

class BaseComponent {
    constructor(element, options = {}) {
        // Валидация элемента
        if (!element) {
            throw new Error(`${this.constructor.name}: Element is required`);
        }
        
        this.element = element;
        this.options = { ...this.defaultOptions, ...options };
        this.isInitialized = false;
        this.isDestroyed = false;
        
        // Уникальный ID компонента
        this.id = this.generateId();
        
        // Коллекция для отслеживания обработчиков событий
        this.eventHandlers = new Map();
        
        // Проверка зависимостей
        if (!this.checkDependencies()) {
            return;
        }
        
        // Автоматическая инициализация
        this.init();
    }
    
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    /**
     * Настройки по умолчанию для компонента
     * Переопределяется в дочерних классах
     */
    get defaultOptions() {
        return {
            debug: false,
            autoInit: true
        };
    }
    
    /**
     * Список обязательных зависимостей
     * Переопределяется в дочерних классах
     */
    get requiredDependencies() {
        return []; // Пустой по умолчанию, каждый компонент сам определяет свои зависимости
    }
    
    // =============================================================================
    // Lifecycle методы
    // =============================================================================
    
    /**
     * Основной метод инициализации
     * Вызывается автоматически при создании экземпляра
     */
    init() {
        if (this.isInitialized) {
            // this.log('warn', 'Component already initialized');
            return;
        }
        
        try {
            // this.log('info', 'Initializing component...');
            
            // this.log('debug', 'Running beforeInit...');
            this.beforeInit();
            
            // this.log('debug', 'Running setupElements...');
            this.setupElements();
            
            // this.log('debug', 'Running bindEvents...');
            this.bindEvents();
            
            // this.log('debug', 'Running setupAnimations...');
            this.setupAnimations();
            
            // this.log('debug', 'Running afterInit...');
            this.afterInit();
            
            this.isInitialized = true;
            this.emit('initialized');
            
            // this.log('success', 'Component initialized successfully');
        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    }
    
    /**
     * Переопределяемые методы lifecycle
     * Вызываются в определенном порядке при инициализации
     */
    beforeInit() {
        // Переопределяется в дочерних классах
        // Выполняется перед основной инициализацией
    }
    
    setupElements() {
        // Переопределяется в дочерних классах
        // Поиск и кэширование DOM элементов
    }
    
    bindEvents() {
        // Переопределяется в дочерних классах
        // Привязка обработчиков событий
    }
    
    setupAnimations() {
        // Переопределяется в дочерних классах
        // Создание анимаций и ScrollTrigger
    }
    
    afterInit() {
        // Переопределяется в дочерних классах
        // Выполняется после основной инициализации
    }
    
    // =============================================================================
    // Проверка зависимостей
    // =============================================================================
    
    /**
     * Проверяет наличие всех обязательных зависимостей
     */
    checkDependencies() {
        const missing = this.requiredDependencies.filter(dep => {
            return typeof window[dep] === 'undefined';
        });
        
        if (missing.length > 0) {
            this.handleError(`Missing dependencies: ${missing.join(', ')}`);
            return false;
        }
        
        // this.log('info', `All dependencies available: ${this.requiredDependencies.join(', ')}`);
        return true;
    }
    
    // =============================================================================
    // Система логирования
    // =============================================================================
    
    /**
     * Централизованная система логирования
     */
    log(level, message, data = null) {
        // 🚨 PRODUCTION: Отключаем все логи для производительности
        // Раскомментируйте для отладки в development режиме
        return;
        
        // if (!this.options.debug && level === 'debug') {
        //     return;
        // }
        
        // const prefix = `[${this.constructor.name}#${this.id}]`;
        // const fullMessage = `${prefix} ${message}`;
        
        // // Используем кастомный логгер если он установлен
        // if (this.options.customLogger && typeof this.options.customLogger === 'function') {
        //     this.options.customLogger(level, fullMessage, data);
        //     return;
        // }
        
        // switch (level) {
        //     case 'error':
        //         console.error(`❌ ${fullMessage}`, data || '');
        //         break;
        //     case 'warn':
        //         console.warn(`⚠️ ${fullMessage}`, data || '');
        //         break;
        //     case 'success':
        //         console.log(`✅ ${fullMessage}`, data || '');
        //         break;
        //     case 'info':
        //         console.log(`ℹ️ ${fullMessage}`, data || '');
        //         break;
        //     case 'debug':
        //         console.log(`🔍 ${fullMessage}`, data || '');
        //         break;
        //     default:
        //         console.log(`${fullMessage}`, data || '');
        // }
    }
    
    // =============================================================================
    // Обработка ошибок
    // =============================================================================
    
    /**
     * Централизованная обработка ошибок
     */
    handleError(message, error = null) {
        const fullMessage = `${this.constructor.name}: ${message}`;
        
        if (error) {
            this.log('error', fullMessage, error);
        } else {
            this.log('warn', fullMessage);
        }
        
        this.emit('error', { message, error });
    }
    
    // =============================================================================
    // Система событий
    // =============================================================================
    
    /**
     * Генерация и отправка пользовательских событий
     */
    emit(eventName, data = {}) {
        const event = new CustomEvent(`component:${eventName}`, {
            detail: { 
                component: this,
                componentName: this.constructor.name,
                componentId: this.id,
                ...data 
            }
        });
        
        // Отправляем событие на элемент компонента
        this.element.dispatchEvent(event);
        
        // Отправляем глобальное событие
        document.dispatchEvent(event);
        
        // Безопасные данные для логирования (без циклических ссылок)
        const safeData = Object.keys(data).reduce((acc, key) => {
            const value = data[key];
            if (value instanceof HTMLElement) {
                acc[key] = `[HTMLElement: ${value.tagName}#${value.id || 'no-id'}]`;
            } else if (typeof value === 'object' && value !== null) {
                // Проверяем на циклические ссылки
                try {
                    JSON.stringify(value);
                    acc[key] = value;
                } catch (e) {
                    acc[key] = '[Object with circular references]';
                }
            } else {
                acc[key] = value;
            }
            return acc;
        }, {});
        
        // this.log('debug', `Event emitted: ${eventName}`, safeData);
    }
    
    /**
     * Подписка на события компонента
     */
    on(eventName, callback) {
        this.element.addEventListener(`component:${eventName}`, callback);
        // this.log('debug', `Event listener added: ${eventName}`);
    }
    
    /**
     * Отписка от событий компонента
     */
    off(eventName, callback) {
        this.element.removeEventListener(`component:${eventName}`, callback);
        // this.log('debug', `Event listener removed: ${eventName}`);
    }
    
    /**
     * Добавление обработчика событий с автоматическим отслеживанием
     */
    addEventHandler(target, eventName, handler, options = {}) {
        const handlerKey = `${target === window ? 'window' : target === document ? 'document' : 'element'}_${eventName}`;
        
        // Сохраняем ссылку для последующей очистки
        if (!this.eventHandlers.has(handlerKey)) {
            this.eventHandlers.set(handlerKey, []);
        }
        
        this.eventHandlers.get(handlerKey).push({
            target,
            eventName,
            handler,
            options
        });
        
        // Добавляем обработчик
        target.addEventListener(eventName, handler, options);
        
        // this.log('debug', `Event handler added: ${handlerKey}`);
    }
    
    /**
     * Удаление конкретного обработчика событий
     */
    removeEventHandler(target, eventName, handler) {
        const handlerKey = `${target === window ? 'window' : target === document ? 'document' : 'element'}_${eventName}`;
        
        if (this.eventHandlers.has(handlerKey)) {
            const handlers = this.eventHandlers.get(handlerKey);
            const index = handlers.findIndex(h => h.handler === handler);
            
            if (index !== -1) {
                handlers.splice(index, 1);
                target.removeEventListener(eventName, handler);
                
                if (handlers.length === 0) {
                    this.eventHandlers.delete(handlerKey);
                }
                
                // this.log('debug', `Event handler removed: ${handlerKey}`);
            }
        }
    }
    
    // =============================================================================
    // Утилитарные методы
    // =============================================================================
    
    /**
     * Поиск элемента внутри компонента (querySelector)
     */
    $(selector) {
        return this.element.querySelector(selector);
    }
    
    /**
     * Поиск элементов внутри компонента (querySelectorAll)
     */
    $$(selector) {
        return this.element.querySelectorAll(selector);
    }
    
    /**
     * Генерация уникального ID для компонента
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }
    
    /**
     * Проверка, инициализирован ли компонент
     */
    isReady() {
        return this.isInitialized && !this.isDestroyed;
    }
    
    // =============================================================================
    // Refresh и обновление
    // =============================================================================
    
    /**
     * Обновление компонента
     * Полезно при изменении DOM или размеров окна
     */
    refresh() {
        if (!this.isReady()) {
            // this.log('warn', 'Cannot refresh: component not ready');
            return;
        }
        
        // this.log('info', 'Refreshing component...');
        this.emit('refresh');
        
        // Переопределяется в дочерних классах
        this.onRefresh();
        
        // this.log('success', 'Component refreshed');
    }
    
    /**
     * Переопределяемый метод обновления
     */
    onRefresh() {
        // Переопределяется в дочерних классах
    }
    
    // =============================================================================
    // Уничтожение компонента
    // =============================================================================
    
    /**
     * Полное уничтожение компонента и очистка ресурсов
     */
    destroy() {
        if (this.isDestroyed) {
            // this.log('warn', 'Component already destroyed');
            return;
        }
        
        try {
            // this.log('info', 'Destroying component...');
            
            this.beforeDestroy();
            this.unbindEvents();
            this.cleanupAnimations();
            this.afterDestroy();
            
            this.isDestroyed = true;
            this.emit('destroyed');
            
            // this.log('success', 'Component destroyed successfully');
        } catch (error) {
            this.handleError('Destruction failed', error);
        }
    }
    
    /**
     * Переопределяемые методы уничтожения
     */
    beforeDestroy() {
        // Переопределяется в дочерних классах
    }
    
    unbindEvents() {
        // Автоматическая очистка всех зарегистрированных обработчиков событий
        this.eventHandlers.forEach((handlers, handlerKey) => {
            handlers.forEach(({ target, eventName, handler }) => {
                target.removeEventListener(eventName, handler);
            });
        });
        
        this.eventHandlers.clear();
        // this.log('debug', 'All event handlers cleaned up');
        
        // Переопределяется в дочерних классах для дополнительной очистки
    }
    
    cleanupAnimations() {
        // Базовая очистка GSAP анимаций
        if (window.gsap) {
            gsap.killTweensOf(this.element);
            // this.log('debug', 'GSAP animations cleaned up');
        }
    }
    
    afterDestroy() {
        // Переопределяется в дочерних классах
    }
    
    // =============================================================================
    // Статические методы
    // =============================================================================
    
    /**
     * Создание компонента с автоматическим поиском элемента
     */
    static create(selector, options = {}) {
        const element = document.querySelector(selector);
        
        if (!element) {
            console.warn(`${this.name}: Element not found: ${selector}`);
            return null;
        }
        
        return new this(element, options);
    }
    
    /**
     * Создание множественных экземпляров компонента
     */
    static createAll(selector, options = {}) {
        const elements = document.querySelectorAll(selector);
        const instances = [];
        
        elements.forEach(element => {
            try {
                const instance = new this(element, options);
                instances.push(instance);
            } catch (error) {
                console.error(`${this.name}: Failed to create instance`, error);
            }
        });
        
        return instances;
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.BaseComponent = BaseComponent;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BaseComponent;
}
