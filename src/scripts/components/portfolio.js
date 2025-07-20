// =============================================================================
// Portfolio Component - Пример использования новой архитектуры
// =============================================================================

/**
 * Компонент портфолио с использованием AnimatedInteractiveComponent
 * Демонстрирует правильное использование новой архитектуры компонентов
 */

class Portfolio extends AnimatedInteractiveComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Настройки анимаций
            animationDuration: 0.8,
            animationEase: 'power2.out',
            staggerDelay: 0.1,
            // Настройки интерактивности
            mouseTrackingEnabled: true,
            hoverAnimationEnabled: true,
            // Настройки компонента
            debug: false
        };
    }
    
    // =============================================================================
    // Lifecycle методы
    // =============================================================================
    
    setupElements() {
        // Поиск основных элементов
        this.portfolioGrid = this.$('.portfolio-grid');
        this.portfolioItems = this.$$('.portfolio-item');
        this.portfolioImages = this.$$('.portfolio-item img');
        this.portfolioTitles = this.$$('.portfolio-item .title');
        
        // Валидация обязательных элементов
        if (!this.portfolioGrid) {
            throw new Error('Portfolio grid not found');
        }
        
        if (this.portfolioItems.length === 0) {
            throw new Error('No portfolio items found');
        }
        
        this.log('info', `Found ${this.portfolioItems.length} portfolio items`);
    }
    
    bindEvents() {
        // Добавляем обработчики для каждого элемента портфолио
        this.portfolioItems.forEach((item, index) => {
            this.setupItemEvents(item, index);
        });
        
        // Добавляем обработчик отслеживания мыши если включен
        if (this.options.mouseTrackingEnabled) {
            this.setupMouseTracking();
        }
        
        // Добавляем обработчик resize для адаптивности
        this.addDebouncedEventHandler(window, 'resize', () => {
            this.handlePortfolioResize();
        });
    }
    
    setupAnimations() {
        // Создаем анимацию появления сетки
        this.createGridEntranceAnimation();
        
        // Создаем ScrollTrigger для анимации при скролле
        this.addScrollTrigger({
            trigger: this.portfolioGrid,
            start: "top 80%",
            end: "bottom 20%",
            onEnter: () => this.animateGridEntrance(),
            onLeave: () => this.animateGridExit(),
            onEnterBack: () => this.animateGridEntrance()
        }, 'grid_scroll_trigger');
    }
    
    afterInit() {
        // Устанавливаем начальное состояние элементов
        this.setInitialState();
        
        // Логируем статистику компонента
        if (this.options.debug) {
            this.logStats();
        }
    }
    
    // =============================================================================
    // Методы настройки событий
    // =============================================================================
    
    setupItemEvents(item, index) {
        // Hover анимации если включены
        if (this.options.hoverAnimationEnabled) {
            this.addHoverAnimation(item, {
                scale: 1.05,
                y: -10,
                duration: 0.4,
                ease: 'power2.out'
            }, {
                scale: 1,
                y: 0,
                duration: 0.4,
                ease: 'power2.out'
            });
        }
        
        // Клик обработчик с защитой от двойного клика
        this.addEventHandler(item, 'click', (event) => {
            this.handleItemClick(item, index, event);
        });
        
        // Touch события для мобильных устройств
        if (this.touchDevice) {
            this.addEventHandler(item, 'touchstart', (event) => {
                this.handleItemTouchStart(item, event);
            });
            
            this.addEventHandler(item, 'touchend', (event) => {
                this.handleItemTouchEnd(item, event);
            });
        }
    }
    
    setupMouseTracking() {
        // Throttled обработчик движения мыши
        this.addThrottledEventHandler(this.element, 'mousemove', (event) => {
            this.handleMouseMove(event);
        }, 16); // 60fps
        
        this.log('debug', 'Mouse tracking enabled');
    }
    
    // =============================================================================
    // Методы анимаций
    // =============================================================================
    
    createGridEntranceAnimation() {
        // Устанавливаем начальное состояние
        gsap.set(this.portfolioItems, {
            opacity: 0,
            y: 50,
            scale: 0.8
        });
    }
    
    animateGridEntrance() {
        // Создаем stagger анимацию появления
        const animation = gsap.to(this.portfolioItems, {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: this.options.animationDuration,
            ease: this.options.animationEase,
            stagger: this.options.staggerDelay
        });
        
        this.addAnimation(animation, 'grid_entrance');
        this.emit('gridAnimated', { direction: 'in' });
        return animation;
    }
    
    animateGridExit() {
        // Анимация исчезновения при выходе из viewport
        const animation = gsap.to(this.portfolioItems, {
            opacity: 0.3,
            scale: 0.95,
            duration: this.options.animationDuration / 2,
            stagger: this.options.staggerDelay / 2
        });
        
        this.addAnimation(animation, 'grid_exit');
        this.emit('gridAnimated', { direction: 'out' });
        return animation;
    }
    
    animateItemFocus(item) {
        // Анимация фокуса на элементе
        return this.createAnimation(item, {
            scale: 1.1,
            zIndex: 10,
            duration: 0.3
        }, 'item_focus');
    }
    
    animateItemBlur(item) {
        // Анимация снятия фокуса
        return this.createAnimation(item, {
            scale: 1,
            zIndex: 1,
            duration: 0.3
        }, 'item_blur');
    }
    
    // =============================================================================
    // Обработчики событий
    // =============================================================================
    
    handleItemClick(item, index, event) {
        this.log('info', `Portfolio item clicked: ${index}`);
        
        // Анимация клика
        this.createAnimation(item, {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        }, 'click_feedback');
        
        // Эмитируем событие для внешних слушателей
        this.emit('itemClicked', {
            item,
            index,
            event
        });
    }
    
    handleItemTouchStart(item, event) {
        this.log('debug', 'Touch start on portfolio item');
        
        // Легкая анимация нажатия для touch устройств
        this.createAnimation(item, {
            scale: 0.98,
            duration: 0.1
        }, 'touch_start');
    }
    
    handleItemTouchEnd(item, event) {
        this.log('debug', 'Touch end on portfolio item');
        
        // Возврат к нормальному состоянию
        this.createAnimation(item, {
            scale: 1,
            duration: 0.2
        }, 'touch_end');
    }
    
    handleMouseMove(event) {
        // Простой эффект параллакса для изображений
        const { clientX, clientY } = event;
        const { innerWidth, innerHeight } = window;
        
        const xPercent = (clientX / innerWidth - 0.5) * 2; // -1 to 1
        const yPercent = (clientY / innerHeight - 0.5) * 2; // -1 to 1
        
        // Применяем небольшое смещение к изображениям
        this.portfolioImages.forEach((img, index) => {
            const intensity = (index % 3 + 1) * 2; // Разная интенсивность для разных элементов
            
            gsap.to(img, {
                x: xPercent * intensity,
                y: yPercent * intensity,
                duration: 0.6,
                ease: 'power2.out',
                overwrite: true
            });
        });
    }
    
    handlePortfolioResize() {
        this.log('debug', 'Portfolio resize handled');
        
        // Сбрасываем позиции изображений при изменении размера
        gsap.set(this.portfolioImages, {
            x: 0,
            y: 0
        });
        
        // Эмитируем событие resize
        this.emit('portfolioResized', {
            width: this.element.offsetWidth,
            height: this.element.offsetHeight
        });
    }
    
    // =============================================================================
    // Утилитарные методы
    // =============================================================================
    
    setInitialState() {
        // Устанавливаем начальное состояние элементов
        gsap.set(this.portfolioItems, {
            transformOrigin: 'center center'
        });
        
        gsap.set(this.portfolioImages, {
            transformOrigin: 'center center'
        });
        
        this.log('debug', 'Initial state set');
    }
    
    // =============================================================================
    // Публичные методы API
    // =============================================================================
    
    /**
     * Фокус на конкретном элементе портфолио
     */
    focusItem(index) {
        if (index < 0 || index >= this.portfolioItems.length) {
            this.log('warn', `Invalid item index: ${index}`);
            return false;
        }
        
        const item = this.portfolioItems[index];
        this.animateItemFocus(item);
        
        this.log('info', `Focused on item: ${index}`);
        return true;
    }
    
    /**
     * Снятие фокуса со всех элементов
     */
    blurAllItems() {
        this.portfolioItems.forEach(item => {
            this.animateItemBlur(item);
        });
        
        this.log('info', 'All items blurred');
    }
    
    /**
     * Переключение отслеживания мыши
     */
    toggleMouseTracking(enabled = null) {
        const newState = enabled !== null ? enabled : !this.options.mouseTrackingEnabled;
        this.options.mouseTrackingEnabled = newState;
        
        if (newState) {
            this.setupMouseTracking();
        } else {
            // Сбрасываем позиции изображений
            gsap.set(this.portfolioImages, { x: 0, y: 0 });
        }
        
        this.log('info', `Mouse tracking ${newState ? 'enabled' : 'disabled'}`);
        return newState;
    }
    
    /**
     * Получение информации об элементе портфолио
     */
    getItemInfo(index) {
        if (index < 0 || index >= this.portfolioItems.length) {
            return null;
        }
        
        const item = this.portfolioItems[index];
        const title = item.querySelector('.title')?.textContent || '';
        const image = item.querySelector('img')?.src || '';
        
        return {
            index,
            element: item,
            title,
            image,
            bounds: item.getBoundingClientRect()
        };
    }
}

// =============================================================================
// Автоматическая инициализация
// =============================================================================

// Функция для автоматической инициализации
function initPortfolioNew() {
    const portfolioElement = document.querySelector('#portfolio');
    
    if (!portfolioElement) {
        console.warn('Portfolio element not found');
        return null;
    }
    
    try {
        const portfolio = new Portfolio(portfolioElement, {
            debug: true, // Включаем отладку для демонстрации
            mouseTrackingEnabled: true,
            hoverAnimationEnabled: true
        });
        
        // Добавляем глобальные слушатели событий для демонстрации
        portfolio.on('itemClicked', (event) => {
            console.log('Portfolio item clicked:', event.detail);
        });
        
        portfolio.on('gridAnimated', (event) => {
            console.log('Portfolio grid animated:', event.detail.direction);
        });
        
        return portfolio;
    } catch (error) {
        console.error('Failed to initialize Portfolio:', error);
        return null;
    }
}

// Экспорт для глобального использования
if (typeof window !== 'undefined') {
    window.Portfolio = Portfolio;
    window.initPortfolioNew = initPortfolioNew;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Portfolio, initPortfolioNew };
}
