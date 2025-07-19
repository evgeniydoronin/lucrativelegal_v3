// =============================================================================
// Interactive Component - Специализированный базовый класс для интерактивных компонентов
// =============================================================================

/**
 * Расширенный базовый класс для компонентов с интерактивностью
 * Добавляет управление событиями, throttling и debouncing
 */

class InteractiveComponent extends BaseComponent {
    constructor(element, options = {}) {
        super(element, options);
        
        // Коллекции для управления событиями
        this.eventHandlers = new Map();
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
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            throttleDelay: 16, // ~60fps
            debounceDelay: 250,
            enableTouchEvents: true,
            enableKeyboardEvents: true,
            enableResizeHandler: true,
            passive: true // Для лучшей производительности
        };
    }
    
    // =============================================================================
    // Управление событиями
    // =============================================================================
    
    /**
     * Добавление обработчика события с автоматической очисткой
     */
    addEventHandler(element, event, handler, options = {}) {
        // Валидация параметров
        if (!element || !event || !handler) {
            this.log('warn', 'Invalid parameters for addEventHandler');
            return false;
        }
        
        // Создаем уникальный ключ
        const key = this.generateEventKey(element, event, handler);
        
        // Удаляем существующий обработчик если есть
        if (this.eventHandlers.has(key)) {
            this.removeEventHandler(element, event, handler);
        }
        
        // Настройки по умолчанию
        const eventOptions = {
            passive: this.options.passive,
            ...options
        };
        
        // Добавляем обработчик
        element.addEventListener(event, handler, eventOptions);
        
        // Сохраняем для очистки
        this.eventHandlers.set(key, {
            element,
            event,
            handler,
            options: eventOptions
        });
        
        this.log('debug', `Event handler added: ${event} on ${element.tagName || 'element'}`);
        return true;
    }
    
    /**
     * Удаление конкретного обработчика события
     */
    removeEventHandler(element, event, handler) {
        const key = this.generateEventKey(element, event, handler);
        const stored = this.eventHandlers.get(key);
        
        if (stored) {
            stored.element.removeEventListener(stored.event, stored.handler, stored.options);
            this.eventHandlers.delete(key);
            this.log('debug', `Event handler removed: ${event}`);
            return true;
        }
        
        return false;
    }
    
    /**
     * Генерация уникального ключа для обработчика события
     */
    generateEventKey(element, event, handler) {
        const elementId = element.id || element.className || element.tagName || 'unknown';
        const handlerName = handler.name || 'anonymous';
        return `${elementId}_${event}_${handlerName}_${Date.now()}`;
    }
    
    // =============================================================================
    // Throttling и Debouncing
    // =============================================================================
    
    /**
     * Создание throttled функции
     */
    throttle(func, delay = this.options.throttleDelay, name = null) {
        const key = name || func.name || 'anonymous';
        
        // Проверяем, есть ли уже throttled версия
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
        
        // Сохраняем для очистки
        this.throttledFunctions.set(key, throttledFunc);
        this.log('debug', `Throttled function created: ${key} (${delay}ms)`);
        
        return throttledFunc;
    }
    
    /**
     * Создание debounced функции
     */
    debounce(func, delay = this.options.debounceDelay, name = null) {
        const key = name || func.name || 'anonymous';
        
        // Проверяем, есть ли уже debounced версия
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
        
        // Добавляем метод для немедленного вызова
        debouncedFunc.immediate = (...args) => {
            clearTimeout(timeoutId);
            func.apply(this, args);
        };
        
        // Добавляем метод для отмены
        debouncedFunc.cancel = () => {
            clearTimeout(timeoutId);
        };
        
        // Сохраняем для очистки
        this.debouncedFunctions.set(key, debouncedFunc);
        this.log('debug', `Debounced function created: ${key} (${delay}ms)`);
        
        return debouncedFunc;
    }
    
    // =============================================================================
    // Специализированные обработчики событий
    // =============================================================================
    
    /**
     * Добавление throttled обработчика события
     */
    addThrottledEventHandler(element, event, handler, delay = this.options.throttleDelay, options = {}) {
        const throttledHandler = this.throttle(handler, delay, `${event}_${handler.name}`);
        return this.addEventHandler(element, event, throttledHandler, options);
    }
    
    /**
     * Добавление debounced обработчика события
     */
    addDebouncedEventHandler(element, event, handler, delay = this.options.debounceDelay, options = {}) {
        const debouncedHandler = this.debounce(handler, delay, `${event}_${handler.name}`);
        return this.addEventHandler(element, event, debouncedHandler, options);
    }
    
    /**
     * Добавление обработчика клика с защитой от двойного клика
     */
    addClickHandler(element, handler, options = {}) {
        const protectedHandler = this.debounce(handler, 300, `click_${handler.name}`);
        return this.addEventHandler(element, 'click', protectedHandler, options);
    }
    
    /**
     * Добавление обработчика скролла с throttling
     */
    addScrollHandler(element, handler, delay = 16, options = {}) {
        const throttledHandler = this.throttle(handler, delay, `scroll_${handler.name}`);
        return this.addEventHandler(element, 'scroll', throttledHandler, {
            passive: true,
            ...options
        });
    }
    
    /**
     * Добавление обработчика resize с debouncing
     */
    addResizeHandler(handler, delay = 250) {
        const debouncedHandler = this.debounce(handler, delay, `resize_${handler.name}`);
        return this.addEventHandler(window, 'resize', debouncedHandler);
    }
    
    // =============================================================================
    // Touch и Mouse события
    // =============================================================================
    
    /**
     * Добавление универсального обработчика для touch/mouse событий
     */
    addPointerHandler(element, handlers = {}, options = {}) {
        const {
            onStart = null,
            onMove = null,
            onEnd = null,
            onCancel = null
        } = handlers;
        
        if (this.touchDevice && this.options.enableTouchEvents) {
            // Touch события
            if (onStart) this.addEventHandler(element, 'touchstart', onStart, options);
            if (onMove) this.addThrottledEventHandler(element, 'touchmove', onMove, 16, options);
            if (onEnd) this.addEventHandler(element, 'touchend', onEnd, options);
            if (onCancel) this.addEventHandler(element, 'touchcancel', onCancel, options);
        } else {
            // Mouse события
            if (onStart) this.addEventHandler(element, 'mousedown', onStart, options);
            if (onMove) this.addThrottledEventHandler(element, 'mousemove', onMove, 16, options);
            if (onEnd) this.addEventHandler(element, 'mouseup', onEnd, options);
            if (onCancel) this.addEventHandler(element, 'mouseleave', onCancel, options);
        }
        
        this.log('debug', `Pointer handlers added for ${this.touchDevice ? 'touch' : 'mouse'} device`);
    }
    
    // =============================================================================
    // Keyboard события
    // =============================================================================
    
    /**
     * Добавление обработчика клавиатуры с фильтрацией клавиш
     */
    addKeyboardHandler(element, handler, keys = [], options = {}) {
        if (!this.options.enableKeyboardEvents) {
            this.log('debug', 'Keyboard events disabled');
            return false;
        }
        
        const keyHandler = (event) => {
            // Если указаны конкретные клавиши, фильтруем
            if (keys.length > 0 && !keys.includes(event.key) && !keys.includes(event.code)) {
                return;
            }
            
            handler.call(this, event);
        };
        
        return this.addEventHandler(element, 'keydown', keyHandler, options);
    }
    
    // =============================================================================
    // Управление состоянием интерактивности
    // =============================================================================
    
    /**
     * Включение/отключение интерактивности
     */
    setInteractivityEnabled(enabled) {
        this.interactivityEnabled = enabled;
        
        if (enabled) {
            this.log('info', 'Interactivity enabled');
            this.emit('interactivityEnabled');
        } else {
            this.log('info', 'Interactivity disabled');
            this.emit('interactivityDisabled');
        }
    }
    
    // =============================================================================
    // Автоматическая настройка resize
    // =============================================================================
    
    /**
     * Настройка автоматического обработчика resize
     */
    setupResizeHandler() {
        if (!this.options.enableResizeHandler) {
            return;
        }
        
        const resizeHandler = () => {
            this.handleResize();
        };
        
        this.addResizeHandler(resizeHandler);
        this.log('debug', 'Automatic resize handler setup completed');
    }
    
    /**
     * Переопределяемый метод обработки resize
     */
    handleResize() {
        this.emit('resize', {
            width: window.innerWidth,
            height: window.innerHeight
        });
        
        // Переопределяется в дочерних классах
        this.onResize();
    }
    
    /**
     * Переопределяемый метод для дочерних классов
     */
    onResize() {
        // Переопределяется в дочерних классах
    }
    
    // =============================================================================
    // Очистка ресурсов
    // =============================================================================
    
    unbindEvents() {
        this.log('debug', 'Cleaning up event handlers...');
        
        // Очистка всех обработчиков событий
        this.eventHandlers.forEach(({ element, event, handler, options }) => {
            element.removeEventListener(event, handler, options);
        });
        
        // Очистка throttled функций
        this.throttledFunctions.forEach((func, key) => {
            if (func.cancel) func.cancel();
        });
        
        // Очистка debounced функций
        this.debouncedFunctions.forEach((func, key) => {
            if (func.cancel) func.cancel();
        });
        
        // Очистка коллекций
        this.eventHandlers.clear();
        this.throttledFunctions.clear();
        this.debouncedFunctions.clear();
        
        this.log('success', 'Event handlers cleanup completed');
        
        // Вызываем базовую очистку
        super.unbindEvents();
    }
    
    // =============================================================================
    // Статистика и отладка
    // =============================================================================
    
    /**
     * Получение статистики событий
     */
    getEventStats() {
        return {
            eventHandlers: this.eventHandlers.size,
            throttledFunctions: this.throttledFunctions.size,
            debouncedFunctions: this.debouncedFunctions.size,
            interactivityEnabled: this.interactivityEnabled,
            touchDevice: this.touchDevice
        };
    }
    
    /**
     * Логирование статистики событий
     */
    logEventStats() {
        const stats = this.getEventStats();
        this.log('info', 'Event statistics:', stats);
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.InteractiveComponent = InteractiveComponent;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = InteractiveComponent;
}
