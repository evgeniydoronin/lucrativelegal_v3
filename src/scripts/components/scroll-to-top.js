// =============================================================================
// Scroll to Top Component - Refactored Version
// =============================================================================

/**
 * ScrollToTop Component
 * Управляет кнопкой "наверх" с показом/скрытием по скроллу
 * 
 * Использует:
 * - InteractiveComponent для базовой архитектуры (с событиями)
 * - Throttled scroll обработчики для производительности
 * - Интеграция с Lenis smooth scroll
 * - Правильный lifecycle и cleanup
 */

class ScrollToTop extends InteractiveComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Настройки видимости
            scrollThreshold: 300,
            
            // Анимации
            showDuration: 0.3,
            hideDuration: 0.3,
            scrollDuration: 0, // Мгновенный скролл
            
            // Throttling
            scrollThrottle: 16, // 60fps
            
            // Селекторы
            buttonSelector: '#scroll-to-top',
            heroSelector: '#hero',
            buttonElementSelector: '.scroll-to-top__button',
            
            // Интеграция
            lenisIntegration: true,
            heroCubeIntegration: true,
            
            // Debug
            debug: false
        };
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Состояние компонента
        this.state = {
            isVisible: false,
            currentScrollY: 0,
            isScrolling: false,
            lenisAvailable: false,
            heroCubeAvailable: false
        };
        
        // Элементы (будут найдены в setupElements)
        this.elements = {
            button: null,
            buttonElement: null,
            heroSection: null
        };
        
        // Throttled функции
        this.throttledCheckScroll = null;
        
        this.log('debug', 'ScrollToTop beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        // Основные элементы
        this.elements.button = document.querySelector(this.options.buttonSelector);
        this.elements.heroSection = document.querySelector(this.options.heroSelector);
        
        // Валидация критических элементов
        if (!this.elements.button) {
            this.log('error', 'Scroll to top button not found');
            return false;
        }
        
        // Дополнительные элементы
        this.elements.buttonElement = this.elements.button.querySelector(this.options.buttonElementSelector);
        
        this.log('info', 'ScrollToTop elements found', {
            hasButton: !!this.elements.button,
            hasButtonElement: !!this.elements.buttonElement,
            hasHeroSection: !!this.elements.heroSection
        });
        
        return true;
    }
    
    bindEvents() {
        // Настройка автоматического resize обработчика (из InteractiveComponent)
        this.setupResizeHandler();
        
        // Клик по кнопке (НЕ-passive для preventDefault)
        this.addEventHandler(this.elements.button, 'click', this.handleButtonClick.bind(this), { 
            passive: false 
        });
        
        // Создаем throttled функцию для скролла
        this.throttledCheckScroll = this.throttle(this.checkScrollPosition.bind(this), this.options.scrollThrottle);
        
        // Отслеживание скролла
        this.addEventHandler(window, 'scroll', this.throttledCheckScroll, { passive: true });
        
        // Интеграция с Lenis если доступен
        this.setupLenisIntegration();
        
        this.log('debug', 'ScrollToTop events bound successfully');
        return true;
    }
    
    setupAnimations() {
        // ScrollToTop использует простые CSS transitions
        // Никаких сложных GSAP анимаций не требуется
        this.log('info', 'ScrollToTop animations setup completed (using CSS transitions)');
    }
    
    afterInit() {
        // Проверяем начальное состояние скролла
        this.checkScrollPosition();
        
        // Проверяем доступность интеграций
        this.checkIntegrations();
        
        this.log('info', 'ScrollToTop component fully initialized', {
            scrollThreshold: this.options.scrollThreshold,
            lenisAvailable: this.state.lenisAvailable,
            heroCubeAvailable: this.state.heroCubeAvailable
        });
    }
    
    // =============================================================================
    // Event Handlers
    // =============================================================================
    
    handleButtonClick(event) {
        event.preventDefault();
        this.scrollToTop();
        this.addClickFeedback();
        this.emit('scrollToTopClicked');
    }
    
    // =============================================================================
    // Scroll Detection
    // =============================================================================
    
    checkScrollPosition() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        this.state.currentScrollY = scrollTop;
        
        const shouldBeVisible = scrollTop > this.options.scrollThreshold;
        
        if (shouldBeVisible && !this.state.isVisible) {
            this.showButton();
        } else if (!shouldBeVisible && this.state.isVisible) {
            this.hideButton();
        }
    }
    
    showButton() {
        if (this.state.isVisible) return;
        
        this.state.isVisible = true;
        this.elements.button.classList.add('visible');
        
        // CSS transition анимация
        requestAnimationFrame(() => {
            this.elements.button.style.opacity = '1';
            this.elements.button.style.transform = 'translateY(0) scale(1)';
        });
        
        this.emit('buttonShown');
        this.log('debug', 'Button shown');
    }
    
    hideButton() {
        if (!this.state.isVisible) return;
        
        this.state.isVisible = false;
        this.elements.button.classList.remove('visible');
        
        // CSS transition анимация
        this.elements.button.style.opacity = '0';
        this.elements.button.style.transform = 'translateY(20px) scale(0.8)';
        
        this.emit('buttonHidden');
        this.log('debug', 'Button hidden');
    }
    
    // =============================================================================
    // Scroll to Top Logic
    // =============================================================================
    
    scrollToTop() {
        this.log('debug', 'Starting scroll to top');
        
        // Сброс состояния hero-cube перед скроллом
        if (this.options.heroCubeIntegration) {
            this.resetHeroCubeState();
        }
        
        // Определяем цель скролла
        const target = this.elements.heroSection || 0;
        
        // Выполняем скролл
        if (this.state.lenisAvailable && this.options.lenisIntegration) {
            this.scrollWithLenis(target);
        } else {
            this.scrollNative(target);
        }
        
        this.emit('scrollStarted', { target });
    }
    
    scrollWithLenis(target) {
        if (window.app && window.app.lenis) {
            window.app.lenis.scrollTo(target, {
                duration: this.options.scrollDuration,
                immediate: this.options.scrollDuration === 0
            });
            this.log('debug', 'Scrolled with Lenis');
        }
    }
    
    scrollNative(target) {
        if (this.elements.heroSection) {
            this.elements.heroSection.scrollIntoView({
                behavior: this.options.scrollDuration === 0 ? 'auto' : 'smooth',
                block: 'start'
            });
        } else {
            window.scrollTo({
                top: 0,
                behavior: this.options.scrollDuration === 0 ? 'auto' : 'smooth'
            });
        }
        this.log('debug', 'Scrolled with native API');
    }
    
    // =============================================================================
    // Integrations
    // =============================================================================
    
    setupLenisIntegration() {
        if (!this.options.lenisIntegration) return;
        
        // Проверяем доступность Lenis
        if (window.app && window.app.lenis) {
            this.state.lenisAvailable = true;
            
            // Добавляем обработчик Lenis scroll
            window.app.lenis.on('scroll', this.throttledCheckScroll);
            
            this.log('debug', 'Lenis integration setup');
        }
    }
    
    checkIntegrations() {
        // Проверяем Lenis
        this.state.lenisAvailable = !!(window.app && window.app.lenis);
        
        // Проверяем Hero Cube
        this.state.heroCubeAvailable = !!(
            (window.app && window.app.heroCube) ||
            (this.elements.heroSection && this.elements.heroSection.heroCubeInstance)
        );
        
        this.log('debug', 'Integrations checked', {
            lenis: this.state.lenisAvailable,
            heroCube: this.state.heroCubeAvailable
        });
    }
    
    resetHeroCubeState() {
        if (!this.state.heroCubeAvailable) {
            this.log('debug', 'Hero cube not available for reset');
            return;
        }
        
        // Пробуем через глобальное приложение
        if (window.app && window.app.heroCube && typeof window.app.heroCube.resetVideoState === 'function') {
            window.app.heroCube.resetVideoState();
            this.log('debug', 'Hero cube state reset via app');
            this.emit('heroCubeReset', { method: 'app' });
            return;
        }
        
        // Fallback через DOM
        if (this.elements.heroSection && this.elements.heroSection.heroCubeInstance) {
            if (typeof this.elements.heroSection.heroCubeInstance.resetVideoState === 'function') {
                this.elements.heroSection.heroCubeInstance.resetVideoState();
                this.log('debug', 'Hero cube state reset via DOM');
                this.emit('heroCubeReset', { method: 'dom' });
                return;
            }
        }
        
        this.log('warn', 'Hero cube reset method not found');
    }
    
    // =============================================================================
    // Visual Feedback
    // =============================================================================
    
    addClickFeedback() {
        if (!this.elements.buttonElement) {
            this.log('debug', 'Button element not found for feedback');
            return;
        }
        
        // Добавляем класс для анимации клика
        this.elements.buttonElement.classList.add('clicked');
        
        // Убираем класс через короткое время
        setTimeout(() => {
            if (this.elements.buttonElement) {
                this.elements.buttonElement.classList.remove('clicked');
            }
        }, 200);
        
        this.emit('clickFeedback');
        this.log('debug', 'Click feedback added');
    }
    
    // =============================================================================
    // Public API Methods
    // =============================================================================
    
    /**
     * Программно показать/скрыть кнопку
     */
    toggle(force) {
        if (typeof force === 'boolean') {
            if (force) {
                this.showButton();
            } else {
                this.hideButton();
            }
        } else {
            if (this.state.isVisible) {
                this.hideButton();
            } else {
                this.showButton();
            }
        }
        
        this.emit('toggled', { visible: this.state.isVisible, forced: typeof force === 'boolean' });
    }
    
    /**
     * Изменить порог появления кнопки
     */
    setThreshold(newThreshold) {
        const oldThreshold = this.options.scrollThreshold;
        this.options.scrollThreshold = newThreshold;
        
        // Перепроверяем текущую позицию
        this.checkScrollPosition();
        
        this.emit('thresholdChanged', { 
            oldThreshold, 
            newThreshold,
            currentScroll: this.state.currentScrollY
        });
        
        this.log('debug', `Threshold changed: ${oldThreshold} → ${newThreshold}`);
    }
    
    /**
     * Получить текущее состояние компонента
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            isVisible: this.state.isVisible,
            currentScrollY: this.state.currentScrollY,
            scrollThreshold: this.options.scrollThreshold,
            lenisAvailable: this.state.lenisAvailable,
            heroCubeAvailable: this.state.heroCubeAvailable,
            isScrolling: this.state.isScrolling
        };
    }
    
    /**
     * Проверить видимость кнопки
     */
    isButtonVisible() {
        return this.state.isVisible;
    }
    
    /**
     * Получить текущую позицию скролла
     */
    getCurrentScroll() {
        return this.state.currentScrollY;
    }
    
    // =============================================================================
    // Utility Methods
    // =============================================================================
    
    throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Очищаем Lenis интеграцию
        if (this.state.lenisAvailable && window.app && window.app.lenis) {
            window.app.lenis.off('scroll', this.throttledCheckScroll);
        }
        
        // Очищаем throttled функции
        this.throttledCheckScroll = null;
        
        // Очищаем состояние
        this.state = {
            isVisible: false,
            currentScrollY: 0,
            isScrolling: false,
            lenisAvailable: false,
            heroCubeAvailable: false
        };
        
        // Очищаем элементы
        this.elements = {
            button: null,
            buttonElement: null,
            heroSection: null
        };
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'ScrollToTop component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.ScrollToTop = ScrollToTop;
}

// Функция инициализации для совместимости
function initScrollToTop() {
    return new ScrollToTop(document.body);
}

if (typeof window !== 'undefined') {
    window.initScrollToTop = initScrollToTop;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ScrollToTop;
}
