// =============================================================================
// Hero Stars Scroll Effect Component - Refactored Version
// =============================================================================

/**
 * HeroStarsScroll Component
 * Зеркальное изменение цветов звездного неба при скролле
 * 
 * Использует:
 * - BaseComponent для базовой архитектуры (без GSAP зависимостей)
 * - Throttled scroll handling для оптимизации производительности
 * - CSS custom properties для динамического изменения цветов
 * - Зеркальный эффект прогресса (0->1->0)
 * - Правильный lifecycle и cleanup
 */

class HeroStarsScroll extends BaseComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Селекторы элементов
            starsSelector: '.hero-stars-animation',
            heroSelector: '#hero',
            
            // Настройки производительности
            scrollThrottle: 16, // ~60fps
            resizeThrottle: 100,
            
            // Настройки эффекта
            viewportOffset: 0.2, // 20% от высоты viewport
            enableDebug: false,
            
            // Debug
            debug: false
        };
    }
    
    get requiredDependencies() {
        return []; // Не требует GSAP, использует CSS transitions
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Состояние компонента
        this.state = {
            currentProgress: 0,
            isScrolling: false,
            throttledScrollHandler: null,
            throttledResizeHandler: null
        };
        
        // Элементы (будут найдены в setupElements)
        this.elements = {
            starsElement: null,
            heroSection: null
        };
        
        // Цветовые схемы для перехода
        this.colorSchemes = {
            original: {
                gradient1: 'rgba(80, 11, 169, 0.4)',      // Фиолетовый
                gradient2: 'rgba(192, 113, 224, 0.25)',   // Светло-фиолетовый
                gradient3: 'rgba(8, 4, 10, 0.25)',        // Темно-фиолетовый
                base: '#000000'                            // Черный
            },
            peak: {
                gradient1: 'rgba(255, 50, 0, 0.7)',       // Ярко-красный (усилен)
                gradient2: 'rgba(255, 150, 0, 0.5)',      // Оранжевый (усилен)
                gradient3: 'rgba(0, 255, 100, 0.4)',      // Ярко-зеленый (усилен)
                base: '#002244'                            // Темно-синий (усилен)
            }
        };
        
        this.log('debug', 'HeroStarsScroll beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        super.setupElements();
        
        // Поиск элементов
        this.elements.starsElement = document.querySelector(this.options.starsSelector);
        this.elements.heroSection = document.querySelector(this.options.heroSelector);
        
        if (!this.elements.starsElement) {
            this.log('warn', `Stars element not found: ${this.options.starsSelector}`);
            return false;
        }
        
        if (!this.elements.heroSection) {
            this.log('warn', `Hero section not found: ${this.options.heroSelector}`);
            return false;
        }
        
        this.log('info', 'HeroStarsScroll elements found successfully');
        return true;
    }
    
    bindEvents() {
        super.bindEvents();
        
        // Создаем throttled обработчики
        this.state.throttledScrollHandler = this.throttle(
            () => this.handleScroll(), 
            this.options.scrollThrottle
        );
        
        this.state.throttledResizeHandler = this.throttle(
            () => this.handleResize(), 
            this.options.resizeThrottle
        );
        
        // Добавляем обработчики событий
        this.addEventHandler(window, 'scroll', this.state.throttledScrollHandler, { passive: true });
        this.addEventHandler(window, 'resize', this.state.throttledResizeHandler, { passive: true });
        
        this.log('debug', 'HeroStarsScroll events bound successfully');
        return true;
    }
    
    setupAnimations() {
        // Устанавливаем начальные цвета
        this.updateStarsColors(0);
        
        // Выполняем первоначальный расчет
        this.handleScroll();
        
        this.log('info', 'HeroStarsScroll animations setup completed');
    }
    
    afterInit() {
        // Включаем debug если нужно
        if (this.options.enableDebug) {
            this.enableDebug();
        }
        
        this.log('info', 'HeroStarsScroll component fully initialized', {
            hasStarsElement: !!this.elements.starsElement,
            hasHeroSection: !!this.elements.heroSection,
            debugEnabled: this.options.enableDebug
        });
    }
    
    // =============================================================================
    // Scroll Progress Calculation
    // =============================================================================
    
    /**
     * Получение прогресса скролла относительно hero секции
     * @returns {number} Прогресс от 0 до 1
     */
    getHeroScrollProgress() {
        if (!this.elements.heroSection) return 0;
        
        const heroRect = this.elements.heroSection.getBoundingClientRect();
        const heroHeight = this.elements.heroSection.offsetHeight;
        const windowHeight = window.innerHeight;
        
        // Прогресс от 0 (верх hero в viewport) до 1 (низ hero покидает viewport)
        const progress = Math.max(0, Math.min(1, 
            -heroRect.top / (heroHeight - windowHeight * this.options.viewportOffset)
        ));
        
        return progress;
    }
    
    /**
     * Создание зеркального эффекта: 0->1->0
     * @param {number} progress Линейный прогресс от 0 до 1
     * @returns {number} Зеркальный прогресс
     */
    getMirroredProgress(progress) {
        // Создаем зеркальный эффект
        return progress <= 0.5 
            ? progress * 2          // 0 до 0.5 становится 0 до 1
            : (1 - progress) * 2;   // 0.5 до 1 становится 1 до 0
    }
    
    // =============================================================================
    // Color Interpolation
    // =============================================================================
    
    /**
     * Парсинг rgba строки в объект
     * @param {string} rgbaString rgba строка
     * @returns {object} Объект с r, g, b, a значениями
     */
    parseRgba(rgbaString) {
        const match = rgbaString.match(/rgba?\(([^)]+)\)/);
        if (!match) return { r: 0, g: 0, b: 0, a: 1 };
        
        const values = match[1].split(',').map(v => parseFloat(v.trim()));
        return {
            r: values[0] || 0,
            g: values[1] || 0,
            b: values[2] || 0,
            a: values[3] !== undefined ? values[3] : 1
        };
    }
    
    /**
     * Интерполяция между двумя цветами
     * @param {string} color1 Первый цвет (rgba)
     * @param {string} color2 Второй цвет (rgba)
     * @param {number} factor Фактор интерполяции (0-1)
     * @returns {string} Интерполированный цвет
     */
    interpolateColor(color1, color2, factor) {
        const c1 = this.parseRgba(color1);
        const c2 = this.parseRgba(color2);
        
        const r = Math.round(c1.r + (c2.r - c1.r) * factor);
        const g = Math.round(c1.g + (c2.g - c1.g) * factor);
        const b = Math.round(c1.b + (c2.b - c1.b) * factor);
        const a = c1.a + (c2.a - c1.a) * factor;
        
        return `rgba(${r}, ${g}, ${b}, ${a.toFixed(3)})`;
    }
    
    /**
     * Интерполяция hex цветов
     * @param {string} color1 Первый цвет (hex)
     * @param {string} color2 Второй цвет (hex)
     * @param {number} factor Фактор интерполяции (0-1)
     * @returns {string} Интерполированный hex цвет
     */
    interpolateHexColor(color1, color2, factor) {
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
    
    // =============================================================================
    // Color Updates
    // =============================================================================
    
    /**
     * Обновление цветов звездного неба
     * @param {number} progress Прогресс скролла (0-1)
     */
    updateStarsColors(progress) {
        if (!this.elements.starsElement) return;
        
        const mirroredProgress = this.getMirroredProgress(progress);
        
        // Интерполируем между исходными и пиковыми цветами
        const newGradient1 = this.interpolateColor(
            this.colorSchemes.original.gradient1,
            this.colorSchemes.peak.gradient1,
            mirroredProgress
        );
        
        const newGradient2 = this.interpolateColor(
            this.colorSchemes.original.gradient2,
            this.colorSchemes.peak.gradient2,
            mirroredProgress
        );
        
        const newGradient3 = this.interpolateColor(
            this.colorSchemes.original.gradient3,
            this.colorSchemes.peak.gradient3,
            mirroredProgress
        );
        
        const newBase = this.interpolateHexColor(
            this.colorSchemes.original.base,
            this.colorSchemes.peak.base,
            mirroredProgress
        );
        
        // Применяем новые цвета через CSS переменные
        this.elements.starsElement.style.setProperty('--gradient-1-color', newGradient1);
        this.elements.starsElement.style.setProperty('--gradient-2-color', newGradient2);
        this.elements.starsElement.style.setProperty('--gradient-3-color', newGradient3);
        this.elements.starsElement.style.setProperty('--base-color', newBase);
        
        // Обновляем состояние
        this.state.currentProgress = progress;
        
        // Debug информация
        if (this.options.enableDebug) {
            this.log('debug', `Progress: ${progress.toFixed(3)}, Mirrored: ${mirroredProgress.toFixed(3)}`);
        }
        
        // Генерируем событие
        this.emit('colorsUpdated', { 
            progress, 
            mirroredProgress, 
            colors: { newGradient1, newGradient2, newGradient3, newBase }
        });
    }
    
    // =============================================================================
    // Event Handlers
    // =============================================================================
    
    /**
     * Обработчик скролла
     */
    handleScroll() {
        const progress = this.getHeroScrollProgress();
        this.updateStarsColors(progress);
        
        this.state.isScrolling = true;
        
        // Сбрасываем флаг скролла через небольшую задержку
        clearTimeout(this.scrollTimeout);
        this.scrollTimeout = setTimeout(() => {
            this.state.isScrolling = false;
            this.emit('scrollEnd', { progress: this.state.currentProgress });
        }, 150);
        
        this.emit('scroll', { progress });
    }
    
    /**
     * Обработчик изменения размера окна
     */
    handleResize() {
        const progress = this.getHeroScrollProgress();
        this.updateStarsColors(progress);
        
        this.emit('resize', { progress });
        this.log('debug', 'Window resized, colors updated');
    }
    
    // =============================================================================
    // Utility Methods
    // =============================================================================
    
    /**
     * Throttle функция для оптимизации производительности
     * @param {Function} func Функция для throttle
     * @param {number} limit Лимит в миллисекундах
     * @returns {Function} Throttled функция
     */
    throttle(func, limit) {
        let inThrottle;
        return (...args) => {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // =============================================================================
    // Public API Methods
    // =============================================================================
    
    /**
     * Включить debug режим
     */
    enableDebug() {
        this.options.enableDebug = true;
        this.log('info', 'Debug mode enabled for HeroStarsScroll');
        this.emit('debugEnabled');
    }
    
    /**
     * Отключить debug режим
     */
    disableDebug() {
        this.options.enableDebug = false;
        this.log('info', 'Debug mode disabled for HeroStarsScroll');
        this.emit('debugDisabled');
    }
    
    /**
     * Получить текущий прогресс
     */
    getCurrentProgress() {
        return this.state.currentProgress;
    }
    
    /**
     * Принудительно обновить цвета
     * @param {number} progress Прогресс (опционально)
     */
    forceUpdate(progress = null) {
        const currentProgress = progress !== null ? progress : this.getHeroScrollProgress();
        this.updateStarsColors(currentProgress);
        this.emit('forceUpdate', { progress: currentProgress });
        this.log('debug', `Force update with progress: ${currentProgress}`);
    }
    
    /**
     * Сбросить цвета к исходным
     */
    resetColors() {
        this.updateStarsColors(0);
        this.emit('colorsReset');
        this.log('info', 'Colors reset to original');
    }
    
    /**
     * Получить текущее состояние компонента
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            currentProgress: this.state.currentProgress,
            isScrolling: this.state.isScrolling,
            hasStarsElement: !!this.elements.starsElement,
            hasHeroSection: !!this.elements.heroSection,
            debugEnabled: this.options.enableDebug
        };
    }
    
    /**
     * Получить элементы компонента
     */
    getElements() {
        return {
            starsElement: this.elements.starsElement,
            heroSection: this.elements.heroSection
        };
    }
    
    /**
     * Получить цветовые схемы
     */
    getColorSchemes() {
        return {
            original: { ...this.colorSchemes.original },
            peak: { ...this.colorSchemes.peak }
        };
    }
    
    /**
     * Обновить цветовые схемы
     * @param {object} schemes Новые цветовые схемы
     */
    updateColorSchemes(schemes) {
        if (schemes.original) {
            this.colorSchemes.original = { ...this.colorSchemes.original, ...schemes.original };
        }
        if (schemes.peak) {
            this.colorSchemes.peak = { ...this.colorSchemes.peak, ...schemes.peak };
        }
        
        // Обновляем цвета с текущим прогрессом
        this.forceUpdate();
        
        this.emit('colorSchemesUpdated', { schemes: this.getColorSchemes() });
        this.log('info', 'Color schemes updated');
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Очищаем таймауты
        if (this.scrollTimeout) {
            clearTimeout(this.scrollTimeout);
            this.scrollTimeout = null;
        }
        
        // Сбрасываем цвета к исходным
        this.resetColors();
        
        // Очищаем состояние
        this.state = {
            currentProgress: 0,
            isScrolling: false,
            throttledScrollHandler: null,
            throttledResizeHandler: null
        };
        
        // Очищаем элементы
        this.elements = {
            starsElement: null,
            heroSection: null
        };
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'HeroStarsScroll component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.HeroStarsScroll = HeroStarsScroll;
}

// Функция инициализации для совместимости
function initHeroStarsScrollEffect() {
    const heroSection = document.querySelector('#hero');
    if (!heroSection) {
        console.warn('⚠️ Hero section not found for HeroStarsScroll');
        return null;
    }
    
    return new HeroStarsScroll(heroSection, {
        debug: false,
        enableDebug: false
    });
}

if (typeof window !== 'undefined') {
    window.initHeroStarsScrollEffect = initHeroStarsScrollEffect;
    window.HeroStarsScrollEffect = initHeroStarsScrollEffect;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = HeroStarsScroll;
}
