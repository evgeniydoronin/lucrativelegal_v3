// =============================================================================
// Cursor Play Button - Refactored with BaseComponent Architecture
// Магнитная кнопка play для hero секции с правильной архитектурой
// =============================================================================

class CursorPlayButton extends InteractiveComponent {
    constructor(element, options = {}) {
        super(element, {
            debug: false,
            throttle: 16,
            useAnimationService: false,
            customLogger: null,
            ...options
        });
        
        // Состояние компонента
        this.isActive = false;
        this.isMobile = false;
        this.hasCallback = false;
        this.hasGlobalHandler = false;
        
        // Позиции и настройки
        this.mouse = { x: 0, y: 0 };
        this.pos = { x: 0, y: 0 };
        this.ratio = 0.12; // Плавность следования за курсором
        
        // DOM элементы
        this.button = null;
        this.content = null;
        
        // Callback для запуска видео
        this.onPlayCallback = null;
        
        // Глобальный обработчик клика
        this.globalClickHandler = null;
        
        // Кастомный логгер
        this.customLogger = this.options.customLogger;
    }
    
    /**
     * Инициализация конфигурации перед основной инициализацией
     */
    beforeInit() {
        super.beforeInit();
        
        // Проверяем мобильное устройство
        this.isMobile = this.checkMobile();
        
        this.log('info', 'CursorPlayButton beforeInit', {
            isMobile: this.isMobile,
            options: this.options
        });
    }
    
    /**
     * Настройка DOM элементов
     */
    setupElements() {
        super.setupElements();
        
        // На мобильных устройствах не создаем кнопку
        if (this.isMobile) {
            this.log('info', 'Mobile device detected, cursor play button disabled');
            return true;
        }
        
        this.createButton();
        return true;
    }
    
    /**
     * Настройка событий
     */
    bindEvents() {
        super.bindEvents();
        
        if (this.isMobile) return;
        
        // Отслеживание движения мыши через InteractiveComponent
        this.addEventHandler(document, 'mousemove', this.handleMouseMove.bind(this));
        
        this.log('info', 'Mouse events bound');
    }
    
    /**
     * Настройка анимаций
     */
    setupAnimations() {
        super.setupAnimations();
        
        if (this.isMobile) return;
        
        // Запуск анимационного цикла через GSAP ticker
        if (typeof gsap !== 'undefined') {
            gsap.ticker.add(this.updatePosition.bind(this));
            this.log('info', 'GSAP ticker animation started');
        }
    }
    
    /**
     * Финальная инициализация
     */
    afterInit() {
        super.afterInit();
        
        this.log('info', 'CursorPlayButton initialized', {
            isMobile: this.isMobile,
            hasButton: !!this.button
        });
    }
    
    /**
     * Проверка мобильного устройства
     */
    checkMobile() {
        return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || 
               window.innerWidth <= 768;
    }
    
    /**
     * Создание DOM элементов кнопки
     */
    createButton() {
        console.log('🔥 CREATE BUTTON CALLED');
        
        // Создаем основной контейнер кнопки
        this.button = document.createElement('div');
        this.button.className = 'cursor-play-button';
        this.button.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            pointer-events: none;
            z-index: 1050;
            opacity: 0;
            transform: none;
            transition: opacity 0.3s ease;
        `;
        
        console.log('🔥 Button element created:', this.button);
        
        // Создаем контент кнопки
        this.content = document.createElement('div');
        this.content.className = 'cursor-play-content';
        this.content.innerHTML = `
            <span class="cursor-play-text">Play</span>
            <span class="cursor-play-icon">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M3 2L9 6L3 10V2Z" fill="currentColor"/>
                </svg>
            </span>
        `;
        
        this.button.appendChild(this.content);
        console.log('🔥 Content added to button');
        
        document.body.appendChild(this.button);
        console.log('🔥 Button added to document.body');
        console.log('🔥 Button in DOM:', !!this.button.parentNode);
        console.log('🔥 Button parent:', this.button.parentNode);
        
        // ВРЕМЕННО ОТКЛЮЧЕН MutationObserver для диагностики производительности
        // if (window.MutationObserver) {
        //     const observer = new MutationObserver((mutations) => {
        //         mutations.forEach((mutation) => {
        //             if (mutation.type === 'childList') {
        //                 mutation.removedNodes.forEach((node) => {
        //                     if (node === this.button) {
        //                         console.error('🔥 BUTTON REMOVED FROM DOM BY MUTATION!');
        //                         console.error('🔥 Removed by:', mutation.target);
        //                         console.error('🔥 Stack trace:', new Error().stack);
        //                     }
        //                 });
        //             }
        //         });
        //     });
        //     
        //     observer.observe(document.body, {
        //         childList: true,
        //         subtree: true
        //     });
        //     
        //     console.log('🔥 MutationObserver set up to watch button removal');
        // }
        
        console.log('🔥 MutationObserver DISABLED for performance testing');
        
        this.log('info', 'Cursor play button DOM created', {
            zIndex: this.button.style.zIndex,
            opacity: this.button.style.opacity,
            position: this.button.style.position
        });
        
        console.log('🔥 CREATE BUTTON COMPLETED');
    }
    
    /**
     * Обработчик движения мыши
     */
    handleMouseMove(e) {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }
    
    /**
     * Обновление позиции кнопки (вызывается через GSAP ticker)
     */
    updatePosition() {
        if (!this.isActive || this.isMobile || !this.button) return;
        
        // Плавное следование за курсором с задержкой
        this.pos.x += (this.mouse.x - this.pos.x) * this.ratio;
        this.pos.y += (this.mouse.y - this.pos.y) * this.ratio;
        
        // Получаем высоту плашки для правильного позиционирования
        const buttonHeight = this.button.offsetHeight || 40; // fallback 40px
        
        // Применяем позицию со смещением: правее на 16px, выше на 16px + половина высоты
        if (typeof gsap !== 'undefined') {
            gsap.set(this.button, {
                x: this.pos.x + 16,                    // Правее на 16px
                y: this.pos.y - 16 - (buttonHeight / 2) // Выше на 16px + центрирование по высоте
            });
        }
    }
    
    /**
     * Добавление глобального обработчика клика
     */
    addGlobalClickHandler() {
        if (this.isMobile || this.hasGlobalHandler) return;
        
        this.globalClickHandler = (e) => {
            if (this.isActive && this.onPlayCallback) {
                this.log('info', 'Global click detected - triggering play');
                
                // Вызываем callback
                this.onPlayCallback();
                
                // Генерируем событие
                this.dispatchEvent('playTriggered', {
                    clickEvent: e,
                    position: { x: e.clientX, y: e.clientY }
                });
            }
        };
        
        document.addEventListener('click', this.globalClickHandler);
        this.hasGlobalHandler = true;
        
        this.log('info', 'Global click handler added');
    }
    
    /**
     * Удаление глобального обработчика клика
     */
    removeGlobalClickHandler() {
        if (this.globalClickHandler) {
            document.removeEventListener('click', this.globalClickHandler);
            this.globalClickHandler = null;
            this.hasGlobalHandler = false;
            
            this.log('info', 'Global click handler removed');
        }
    }
    
    /**
     * Активация кнопки
     */
    activate(onPlayCallback) {
        console.log('🔥 ACTIVATE METHOD CALLED - DIRECT CONSOLE LOG');
        console.log('🔥 this:', this);
        console.log('🔥 onPlayCallback:', onPlayCallback);
        
        try {
            console.log('🔥 ACTIVATE START - TRY BLOCK');
            
            this.log('info', '=== ACTIVATE METHOD CALLED ===', {
                isMobile: this.isMobile,
                hasButton: !!this.button,
                buttonInDOM: this.button ? !!this.button.parentNode : false
            });
            
            console.log('🔥 After first log');
            
            if (this.isMobile) {
                console.log('🔥 Mobile device detected');
                // На мобильных сразу вызываем callback
                if (onPlayCallback) {
                    this.log('info', 'Mobile device - executing callback immediately');
                    onPlayCallback();
                    
                    // Генерируем событие
                    this.dispatchEvent('playTriggered', {
                        mobile: true,
                        immediate: true
                    });
                }
                this.log('info', 'Exiting activate - mobile device');
                console.log('🔥 Exiting - mobile device');
                return;
            }
            
            console.log('🔥 Not mobile, continuing...');
            
            this.log('info', 'Setting component state...');
            this.isActive = true;
            this.onPlayCallback = onPlayCallback;
            this.hasCallback = !!onPlayCallback;
            
            console.log('🔥 State set');
            
            // Устанавливаем начальную позицию в центр экрана
            this.pos.x = window.innerWidth / 2;
            this.pos.y = window.innerHeight / 2;
            
            console.log('🔥 Position set:', this.pos);
            
            this.log('info', 'Button activation started', {
                hasButton: !!this.button,
                hasGsap: typeof gsap !== 'undefined',
                initialPosition: { x: this.pos.x, y: this.pos.y },
                currentOpacity: this.button ? this.button.style.opacity : 'no button',
                buttonInDOM: this.button ? !!this.button.parentNode : false,
                buttonVisible: this.button ? window.getComputedStyle(this.button).display !== 'none' : false
            });
            
            console.log('🔥 About to make button visible');
            
            // ЗАЩИТА: Если кнопка исчезла, пересоздаем её
            if (!this.button || !this.button.parentNode) {
                console.log('🔥 BUTTON MISSING! Recreating...');
                console.log('🔥 this.button:', this.button);
                console.log('🔥 parentNode:', this.button ? this.button.parentNode : 'no button');
                
                // Пересоздаем кнопку
                this.createButton();
                console.log('🔥 Button recreated:', !!this.button);
            }
            
            // ВРЕМЕННО: Принудительно делаем кнопку видимой для диагностики
            if (this.button) {
                console.log('🔥 Button exists, making visible');
                this.log('info', 'DIAGNOSTIC: Making button temporarily visible');
                this.button.style.cssText += `
                    background: rgba(255, 0, 0, 0.8) !important;
                    opacity: 1 !important;
                    border: 2px solid yellow !important;
                    width: 100px !important;
                    height: 40px !important;
                    display: block !important;
                `;
                console.log('🔥 Button styles applied');
            } else {
                console.log('🔥 STILL NO BUTTON AFTER RECREATION!');
            }
            
            console.log('🔥 About to start GSAP animations');
            
            // Показываем кнопку с анимацией
            if (typeof gsap !== 'undefined' && this.button) {
                console.log('🔥 GSAP and button available');
                this.log('info', 'Starting GSAP animations...');
                
                // Сначала устанавливаем позицию
                this.log('info', 'Setting initial position with GSAP');
                gsap.set(this.button, {
                    x: this.pos.x + 16,
                    y: this.pos.y - 16 - 20 // примерная высота кнопки
                });
                
                console.log('🔥 GSAP position set');
                
                this.log('info', 'Position set, starting opacity animation');
                
                // Затем анимируем opacity
                gsap.to(this.button, {
                    opacity: 1,
                    duration: 0.5,
                    ease: "power2.out",
                    onStart: () => {
                        console.log('🔥 GSAP animation STARTED');
                        this.log('info', 'GSAP opacity animation STARTED');
                    },
                    onComplete: () => {
                        console.log('🔥 GSAP animation COMPLETED');
                        this.log('info', 'Button opacity animation completed', {
                            finalOpacity: this.button.style.opacity,
                            computedOpacity: window.getComputedStyle(this.button).opacity,
                            transform: this.button.style.transform
                        });
                    }
                });
                
                console.log('🔥 GSAP to() called');
                
                this.log('info', 'GSAP animation started', {
                    targetOpacity: 1,
                    duration: 0.5,
                    buttonExists: !!this.button,
                    buttonPosition: {
                        x: this.pos.x + 16,
                        y: this.pos.y - 16 - 20
                    }
                });
            } else {
                console.log('🔥 GSAP or button not available:', {
                    hasGsap: typeof gsap !== 'undefined',
                    hasButton: !!this.button
                });
                this.log('warn', 'GSAP animation skipped', {
                    hasGsap: typeof gsap !== 'undefined',
                    hasButton: !!this.button,
                    gsapType: typeof gsap,
                    buttonType: typeof this.button
                });
            }
            
            console.log('🔥 About to add global click handler');
            
            // Добавляем глобальный обработчик клика
            this.log('info', 'Adding global click handler...');
            this.addGlobalClickHandler();
            
            console.log('🔥 Global click handler added');
            
            this.log('info', 'Cursor play button activated', {
                hasCallback: this.hasCallback,
                hasGlobalHandler: this.hasGlobalHandler,
                buttonPosition: this.button ? {
                    transform: this.button.style.transform,
                    opacity: this.button.style.opacity,
                    display: this.button.style.display
                } : 'no button'
            });
            
            console.log('🔥 About to dispatch event');
            
            // Генерируем событие активации
            this.log('info', 'Dispatching activated event...');
            this.dispatchEvent('activated', {
                callback: !!onPlayCallback,
                position: { x: this.pos.x, y: this.pos.y }
            });
            
            console.log('🔥 Event dispatched');
            
            this.log('info', '=== ACTIVATE METHOD COMPLETED ===');
            console.log('🔥 ACTIVATE METHOD COMPLETED');
            
        } catch (error) {
            console.error('🔥 ACTIVATE ERROR:', error);
            console.error('🔥 Error stack:', error.stack);
        }
    }
    
    /**
     * Деактивация кнопки
     */
    deactivate() {
        if (this.isMobile) return;
        
        this.isActive = false;
        this.onPlayCallback = null;
        this.hasCallback = false;
        
        // Скрываем кнопку с анимацией
        if (typeof gsap !== 'undefined' && this.button) {
            gsap.to(this.button, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.out"
            });
        }
        
        // Убираем глобальный обработчик клика
        this.removeGlobalClickHandler();
        
        this.log('info', 'Cursor play button deactivated');
        
        // Генерируем событие деактивации
        this.dispatchEvent('deactivated', {
            wasActive: true
        });
    }
    
    /**
     * Обновление состояния мобильного устройства
     */
    updateMobileState() {
        const wasMobile = this.isMobile;
        this.isMobile = this.checkMobile();
        
        if (wasMobile !== this.isMobile) {
            this.log('info', 'Mobile state changed', {
                wasMobile,
                isMobile: this.isMobile
            });
            
            // Генерируем событие изменения мобильного состояния
            this.dispatchEvent('mobileStateChanged', {
                wasMobile,
                isMobile: this.isMobile
            });
            
            // Если стали мобильными и кнопка активна, деактивируем
            if (this.isMobile && this.isActive) {
                this.deactivate();
            }
        }
        
        return this.isMobile;
    }
    
    /**
     * Обновление callback'а
     */
    updateCallback(newCallback) {
        const hadCallback = this.hasCallback;
        this.onPlayCallback = newCallback;
        this.hasCallback = !!newCallback;
        
        if (hadCallback !== this.hasCallback) {
            this.log('info', 'Callback updated', {
                hadCallback,
                hasCallback: this.hasCallback
            });
            
            // Генерируем событие обновления callback'а
            this.dispatchEvent('callbackUpdated', {
                hadCallback,
                hasCallback: this.hasCallback
            });
        }
    }
    
    /**
     * Получение DOM элементов с защитными проверками
     */
    getElements() {
        // Проверяем существование элементов и их присутствие в DOM
        if (!this.button || !this.button.parentNode) {
            this.log('warn', 'Button element missing from DOM, attempting to recreate...');
            
            // Если мы не на мобильном устройстве, пересоздаем кнопку
            if (!this.isMobile) {
                this.createButton();
            }
        }
        
        return {
            button: this.button,
            content: this.content
        };
    }
    
    /**
     * Получение состояния компонента
     */
    getState() {
        // НЕ вызываем super.getState() - его нет в BaseComponent!
        return {
            // Базовые свойства из BaseComponent
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            
            // Специфичные свойства компонента
            isActive: this.isActive,
            isMobile: this.isMobile,
            hasCallback: this.hasCallback,
            hasGlobalHandler: this.hasGlobalHandler,
            hasButton: !!this.button,
            position: { ...this.pos },
            mousePosition: { ...this.mouse }
        };
    }
    
    /**
     * Сброс компонента
     */
    reset() {
        this.log('info', 'Resetting cursor play button');
        
        // Деактивируем если активен
        if (this.isActive) {
            this.deactivate();
        }
        
        // Сбрасываем позиции
        this.mouse = { x: 0, y: 0 };
        this.pos = { x: 0, y: 0 };
        
        // Обновляем мобильное состояние
        this.updateMobileState();
        
        // Проверяем наличие метода reset в родительском классе
        if (typeof super.reset === 'function') {
            super.reset();
        }
    }
    
    /**
     * Обработка изменения размера окна (переопределяем метод из InteractiveComponent)
     */
    onResize() {
        // Обновляем мобильное состояние при изменении размера
        this.updateMobileState();
        
        // Если активны, обновляем позицию в центр
        if (this.isActive && !this.isMobile) {
            this.pos.x = window.innerWidth / 2;
            this.pos.y = window.innerHeight / 2;
        }
        
        this.log('info', 'Window resized, mobile state and position updated');
    }
    
    /**
     * Переопределяем cleanupAnimations для правильной очистки анимаций кнопки
     */
    cleanupAnimations() {
        this.log('info', 'Cleaning up cursor play button animations');
        
        // Останавливаем анимационный цикл GSAP ticker
        if (typeof gsap !== 'undefined') {
            gsap.ticker.remove(this.updatePosition.bind(this));
            
            // Убиваем все анимации именно нашей кнопки (НЕ this.element!)
            if (this.button) {
                gsap.killTweensOf(this.button);
                this.log('info', 'GSAP animations killed for button element');
            }
        }
        
        // НЕ вызываем super.cleanupAnimations() потому что BaseComponent 
        // будет пытаться убить анимации this.element, а наша кнопка в document.body
        this.log('info', 'Cursor play button animations cleaned up');
    }
    
    /**
     * Очистка ресурсов
     */
    destroy() {
        console.log('🔥 DESTROY METHOD CALLED');
        console.log('🔥 Stack trace:', new Error().stack);
        
        this.log('info', 'Destroying cursor play button');
        
        // Убираем глобальный обработчик клика
        this.removeGlobalClickHandler();
        
        // Удаляем элемент из DOM ПЕРЕД вызовом super.destroy()
        if (this.button && this.button.parentNode) {
            console.log('🔥 Removing button from DOM in destroy()');
            this.log('info', 'Removing button from DOM');
            this.button.parentNode.removeChild(this.button);
        }
        
        // Сбрасываем состояние
        this.isActive = false;
        this.onPlayCallback = null;
        this.hasCallback = false;
        this.hasGlobalHandler = false;
        
        console.log('🔥 Setting this.button = null in destroy()');
        this.button = null;
        this.content = null;
        
        // Вызываем родительский метод (он вызовет наш cleanupAnimations)
        console.log('🔥 Calling super.destroy()');
        super.destroy();
        
        console.log('🔥 DESTROY METHOD COMPLETED');
    }
    
    /**
     * Кастомное логирование
     */
    log(level, message, data = null) {
        if (this.customLogger) {
            this.customLogger(level, message, data);
        } else if (this.options.debug) {
            const prefix = `[CursorPlayButton#${this.id}]`;
            const logData = data ? ` ${JSON.stringify(data)}` : '';
            
            switch (level) {
                case 'error':
                    console.error(`${prefix} ${message}${logData}`);
                    break;
                case 'warn':
                    console.warn(`${prefix} ${message}${logData}`);
                    break;
                case 'info':
                    console.info(`${prefix} ${message}${logData}`);
                    break;
                default:
                    console.log(`${prefix} ${message}${logData}`);
            }
        }
    }
    
    /**
     * Генерация событий
     */
    dispatchEvent(eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail: {
                component: 'CursorPlayButton',
                id: this.id,
                timestamp: Date.now(),
                ...detail
            }
        });
        
        this.element.dispatchEvent(event);
        
        this.log('info', `Event dispatched: ${eventName}`, detail);
    }
    
    /**
     * Добавление слушателя событий компонента
     */
    on(eventName, handler) {
        this.element.addEventListener(eventName, handler);
        return this;
    }
    
    /**
     * Удаление слушателя событий компонента
     */
    off(eventName, handler) {
        this.element.removeEventListener(eventName, handler);
        return this;
    }
    
    /**
     * Проверка активности (для обратной совместимости)
     */
    isActivated() {
        return this.isActive;
    }
}

// Глобальная доступность
if (typeof window !== 'undefined') {
    window.CursorPlayButton = CursorPlayButton;
}

// Функция инициализации для обратной совместимости
window.initCursorPlayButton = (element = document.body, options = {}) => {
    return new CursorPlayButton(element, options);
};
