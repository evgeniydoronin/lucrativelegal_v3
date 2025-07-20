// =============================================================================
// Word Animator Component - Refactored Version
// =============================================================================

/**
 * WordAnimator Component
 * Анимирует слова с эффектами появления и размытия при скролле
 * 
 * Использует:
 * - AnimatedComponent для базовой архитектуры (с GSAP анимациями)
 * - ScrollTrigger для отслеживания скролла
 * - Адаптивная логика для длинных и коротких текстов
 * - Parallax эффекты для заголовков и подзаголовков
 * - Правильный lifecycle и cleanup
 */

class WordAnimator extends AnimatedComponent {
    // =============================================================================
    // Переопределяемые свойства
    // =============================================================================
    
    get defaultOptions() {
        return {
            ...super.defaultOptions,
            // Селекторы
            wordAnimateSelector: '.js-word-animate',
            scrollBlurSelector: '.js-scroll-blur-effect',
            scrollBlurAdaptiveSelector: '.js-scroll-blur-effect-adaptive',
            
            // Настройки анимации слов
            wordAnimationDuration: 0.8,
            wordStagger: 0.1,
            wordOutDuration: 0.6,
            wordOutStagger: 0.05,
            
            // Настройки scroll blur эффекта
            longTextThreshold: 10, // Количество слов для определения длинного текста
            shortTextDelayStep: 0.10,
            longTextDelayStep: 0.04,
            longTextMaxDelay: 0.5,
            
            // Начальные значения для blur эффекта
            longTextInitialOpacity: 0.7,
            longTextInitialBlur: 4,
            shortTextOpacityStep: 0.15,
            shortTextBlurStep: 4,
            
            // ScrollTrigger настройки
            wordTriggerStart: 'top 80%',
            blurTriggerStart: 'top 100%',
            blurTriggerEndShort: 'top 75%',
            blurTriggerEndLong: 'top 50%',
            blurTriggerEndVeryLong: 'top 30%',
            
            // Parallax настройки
            parallaxEnabled: true,
            sectionTitleParallax: 20,
            sectionDescriptionParallax: 100,
            sectionDescriptionParallaxY: 50,
            adaptiveParallaxX: 30,
            adaptiveParallaxY: 20,
            
            // Debug
            debug: false
        };
    }
    
    get requiredDependencies() {
        return ['gsap', 'ScrollTrigger'];
    }
    
    // =============================================================================
    // Lifecycle Methods (BaseComponent)
    // =============================================================================
    
    beforeInit() {
        super.beforeInit();
        
        // Состояние компонента
        this.state = {
            wordElements: [],
            scrollBlurElements: [],
            processedElements: new Set(),
            animationService: null
        };
        
        // Элементы (будут найдены в setupElements)
        this.elements = {
            wordAnimateElements: [],
            scrollBlurElements: [],
            scrollBlurAdaptiveElements: []
        };
        
        this.log('debug', 'WordAnimator beforeInit - конфигурация готова');
        return true;
    }
    
    setupElements() {
        // Находим все элементы для анимации слов
        this.elements.wordAnimateElements = Array.from(
            document.querySelectorAll(this.options.wordAnimateSelector)
        );
        
        // Находим все элементы для scroll blur эффекта
        this.elements.scrollBlurElements = Array.from(
            document.querySelectorAll(this.options.scrollBlurSelector)
        );
        
        // Находим адаптивные scroll blur элементы
        this.elements.scrollBlurAdaptiveElements = Array.from(
            document.querySelectorAll(this.options.scrollBlurAdaptiveSelector)
        );
        
        // Объединяем все scroll blur элементы
        const allScrollBlurElements = [
            ...this.elements.scrollBlurElements,
            ...this.elements.scrollBlurAdaptiveElements
        ];
        
        this.log('info', 'WordAnimator elements found', {
            wordAnimateElements: this.elements.wordAnimateElements.length,
            scrollBlurElements: allScrollBlurElements.length,
            totalElements: this.elements.wordAnimateElements.length + allScrollBlurElements.length
        });
        
        return this.elements.wordAnimateElements.length > 0 || allScrollBlurElements.length > 0;
    }
    
    bindEvents() {
        // WordAnimator не требует дополнительных событий
        // Все взаимодействие происходит через ScrollTrigger
        this.log('debug', 'WordAnimator events bound successfully');
        return true;
    }
    
    setupAnimations() {
        // Получаем AnimationService
        this.state.animationService = window.AnimationService?.getInstance();
        
        if (!this.state.animationService) {
            this.log('warn', 'AnimationService not available, using direct GSAP');
            this.setupAnimationsFallback();
            return;
        }
        
        // Используем AnimationService для создания анимаций
        this.setupAnimationsWithService();
        
        this.log('info', 'WordAnimator animations setup completed');
    }
    
    afterInit() {
        // Обрабатываем все найденные элементы
        this.processAllElements();
        
        this.log('info', 'WordAnimator component fully initialized', {
            wordElements: this.state.wordElements.length,
            scrollBlurElements: this.state.scrollBlurElements.length,
            totalProcessed: this.state.processedElements.size
        });
    }
    
    // =============================================================================
    // Animation Setup
    // =============================================================================
    
    setupAnimationsWithService() {
        // Регистрируем ScrollTrigger через AnimationService
        if (this.state.animationService.scrollTriggerManager) {
            this.log('debug', 'Using AnimationService ScrollTriggerManager');
        } else {
            this.log('warn', 'ScrollTriggerManager not available, falling back to direct GSAP');
            this.setupAnimationsFallback();
        }
    }
    
    setupAnimationsFallback() {
        // Прямое использование GSAP без AnimationService
        if (!window.gsap || !window.ScrollTrigger) {
            this.log('error', 'GSAP or ScrollTrigger not available');
            return;
        }
        
        gsap.registerPlugin(ScrollTrigger);
        this.log('debug', 'Using direct GSAP for animations');
    }
    
    // =============================================================================
    // Element Processing
    // =============================================================================
    
    processAllElements() {
        // Обрабатываем обычные word-animate элементы
        this.elements.wordAnimateElements.forEach(element => {
            this.processWordElement(element);
            this.setupWordScrollTrigger(element);
            this.state.wordElements.push(element);
        });
        
        // Обрабатываем scroll-blur-effect элементы
        const allScrollBlurElements = [
            ...this.elements.scrollBlurElements,
            ...this.elements.scrollBlurAdaptiveElements
        ];
        
        allScrollBlurElements.forEach(element => {
            this.processScrollBlurElement(element);
            this.setupScrollBlurTrigger(element);
            this.state.scrollBlurElements.push(element);
        });
        
        this.log('debug', `Processed ${this.state.wordElements.length} word elements and ${this.state.scrollBlurElements.length} scroll blur elements`);
    }
    
    processWordElement(element) {
        if (this.state.processedElements.has(element)) {
            this.log('debug', 'Element already processed, skipping');
            return;
        }
        
        const text = element.dataset.text || element.textContent;
        const words = text.trim().split(/\s+/);
        
        // Очищаем содержимое
        element.innerHTML = '';
        
        // Создаем div для каждого слова
        words.forEach((word, index) => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word';
            wordDiv.textContent = word;
            wordDiv.style.cssText = `
                display: inline-block;
                position: relative;
                margin-right: ${index < words.length - 1 ? '0.3em' : '0'};
                opacity: 0;
                transform: translateY(100%);
            `;
            element.appendChild(wordDiv);
        });
        
        // Сохраняем ссылки на слова
        element.wordElements = element.querySelectorAll('.word');
        this.state.processedElements.add(element);
        
        this.log('debug', `Processed word element with ${words.length} words`);
    }
    
    processScrollBlurElement(element) {
        if (this.state.processedElements.has(element)) {
            this.log('debug', 'Scroll blur element already processed, skipping');
            return;
        }
        
        const text = element.dataset.text || element.textContent;
        const words = text.trim().split(/\s+/);
        
        // Определяем тип текста
        const isLongText = words.length > this.options.longTextThreshold;
        const isAdaptive = element.classList.contains('js-scroll-blur-effect-adaptive');
        
        // Сохраняем информацию о типе текста
        element.isLongText = isLongText;
        element.isAdaptive = isAdaptive;
        
        // Очищаем содержимое
        element.innerHTML = '';
        
        // Создаем div для каждого слова с адаптивными стилями
        words.forEach((word, index) => {
            const wordDiv = document.createElement('div');
            wordDiv.className = 'word blur-word';
            wordDiv.textContent = word;
            
            // Адаптивные параметры для начального состояния
            let initialOpacity, initialBlur;
            
            if (isLongText || isAdaptive) {
                // Все слова начинаются одинаково размытыми
                initialOpacity = this.options.longTextInitialOpacity;
                initialBlur = this.options.longTextInitialBlur;
            } else {
                // Для коротких текстов: прогрессивное размытие
                initialOpacity = Math.max(0.2, 0.8 - (index * this.options.shortTextOpacityStep));
                initialBlur = Math.min(15, 3 + (index * this.options.shortTextBlurStep));
            }
            
            wordDiv.style.cssText = `
                display: inline-block;
                position: relative;
                margin-right: ${index < words.length - 1 ? '0.3em' : '0'};
                opacity: ${initialOpacity};
                filter: blur(${initialBlur}px);
                will-change: opacity, filter;
            `;
            element.appendChild(wordDiv);
        });
        
        // Сохраняем ссылки на слова
        element.blurWordElements = element.querySelectorAll('.blur-word');
        this.state.processedElements.add(element);
        
        this.log('debug', `Processed scroll blur element with ${words.length} words (${isLongText ? 'long' : 'short'} text, ${isAdaptive ? 'adaptive' : 'normal'})`);
    }
    
    // =============================================================================
    // ScrollTrigger Setup
    // =============================================================================
    
    setupWordScrollTrigger(element) {
        const scrollTrigger = ScrollTrigger.create({
            trigger: element,
            start: this.options.wordTriggerStart,
            onEnter: () => {
                this.animateWordsIn(element);
                this.emit('wordsAnimatedIn', { element });
            },
            onLeave: () => {
                this.animateWordsOut(element);
                this.emit('wordsAnimatedOut', { element });
            },
            onEnterBack: () => {
                this.animateWordsIn(element);
                this.emit('wordsAnimatedIn', { element });
            },
            onLeaveBack: () => {
                this.animateWordsOut(element);
                this.emit('wordsAnimatedOut', { element });
            }
        });
        
        // Сохраняем ScrollTrigger для очистки
        if (!element.scrollTriggers) {
            element.scrollTriggers = [];
        }
        element.scrollTriggers.push(scrollTrigger);
    }
    
    setupScrollBlurTrigger(element) {
        const words = element.blurWordElements;
        if (!words || words.length === 0) return;
        
        // Адаптивные параметры ScrollTrigger
        const isLongText = element.isLongText;
        const isAdaptive = element.isAdaptive;
        
        // Определяем конечную позицию
        let endPosition;
        if (isLongText || isAdaptive) {
            endPosition = words.length > 30 ? 
                this.options.blurTriggerEndVeryLong : 
                this.options.blurTriggerEndLong;
        } else {
            endPosition = this.options.blurTriggerEndShort;
        }
        
        const scrollTrigger = ScrollTrigger.create({
            trigger: element,
            start: this.options.blurTriggerStart,
            end: endPosition,
            scrub: 1, // Плавная привязка к скроллу
            onUpdate: (self) => {
                this.updateScrollBlurEffect(element, self.progress);
                if (this.options.parallaxEnabled) {
                    this.updateParallaxEffect(element, self.progress);
                }
            },
            onEnter: () => {
                this.emit('scrollBlurStarted', { element });
            },
            onLeave: () => {
                this.emit('scrollBlurCompleted', { element });
            }
        });
        
        // Сохраняем ScrollTrigger для очистки
        if (!element.scrollTriggers) {
            element.scrollTriggers = [];
        }
        element.scrollTriggers.push(scrollTrigger);
    }
    
    // =============================================================================
    // Animation Methods
    // =============================================================================
    
    animateWordsIn(element) {
        const words = element.wordElements;
        if (!words) return;
        
        const timeline = gsap.to(words, {
            opacity: 1,
            y: 0,
            duration: this.options.wordAnimationDuration,
            stagger: this.options.wordStagger,
            ease: "power2.out"
        });
        
        // Сохраняем анимацию для очистки
        this.addAnimation(timeline);
        
        this.log('debug', `Animated ${words.length} words in`);
    }
    
    animateWordsOut(element) {
        const words = element.wordElements;
        if (!words) return;
        
        const timeline = gsap.to(words, {
            opacity: 0,
            y: "100%",
            duration: this.options.wordOutDuration,
            stagger: this.options.wordOutStagger,
            ease: "power2.in"
        });
        
        // Сохраняем анимацию для очистки
        this.addAnimation(timeline);
        
        this.log('debug', `Animated ${words.length} words out`);
    }
    
    updateScrollBlurEffect(element, progress) {
        const words = element.blurWordElements;
        if (!words) return;
        
        // Адаптивная математика для длинных текстов
        const isLongText = element.isLongText;
        const isAdaptive = element.isAdaptive;
        const wordCount = words.length;
        
        words.forEach((word, index) => {
            // Адаптивная задержка
            let delayStep;
            if (isLongText || isAdaptive) {
                // Для длинных текстов: ускоренная задержка
                delayStep = Math.min(this.options.longTextDelayStep, this.options.longTextMaxDelay / wordCount);
            } else {
                // Для коротких текстов: обычная задержка
                delayStep = this.options.shortTextDelayStep;
            }
            
            const delay = index * delayStep;
            const adjustedProgress = Math.max(0, Math.min(1, (progress - delay) / (1 - delay)));
            
            // Адаптивные начальные значения
            let startOpacity, startBlur;
            if (isLongText || isAdaptive) {
                startOpacity = this.options.longTextInitialOpacity;
                startBlur = this.options.longTextInitialBlur;
            } else {
                startOpacity = Math.max(0.2, 0.8 - (index * this.options.shortTextOpacityStep));
                startBlur = Math.min(15, 3 + (index * this.options.shortTextBlurStep));
            }
            
            // Рассчитываем финальные значения
            const opacity = startOpacity + (1 - startOpacity) * adjustedProgress;
            const blur = startBlur * (1 - adjustedProgress);
            
            // Применяем стили
            gsap.set(word, {
                opacity: opacity,
                filter: `blur(${blur}px)`
            });
        });
    }
    
    updateParallaxEffect(element, progress) {
        if (!this.options.parallaxEnabled) return;
        
        // Проверяем тип элемента для применения соответствующего параллакса
        if (element.classList.contains('section-description')) {
            // Подзаголовки
            const isAdaptive = element.classList.contains('js-scroll-blur-effect-adaptive');
            
            if (!isAdaptive) {
                // Обычные подзаголовки: выезжают справа
                const translateX = (1 - progress) * this.options.sectionDescriptionParallax;
                const translateY = (1 - progress) * this.options.sectionDescriptionParallaxY;
                
                gsap.set(element, {
                    x: translateX,
                    y: translateY
                });
            } else {
                // Адаптивные длинные тексты с уменьшенным сдвигом
                const translateX = (1 - progress) * this.options.adaptiveParallaxX;
                const translateY = (1 - progress) * this.options.adaptiveParallaxY;
                
                gsap.set(element, {
                    x: translateX,
                    y: translateY
                });
            }
        } else if (element.classList.contains('section-title')) {
            // Основной заголовок - легкое параллакс движение
            const translateY = (1 - progress) * this.options.sectionTitleParallax;
            
            gsap.set(element, {
                y: translateY
            });
        }
    }
    
    // =============================================================================
    // Public API Methods
    // =============================================================================
    
    /**
     * Добавить новый элемент для анимации
     */
    addElement(element, type = 'word') {
        if (!element) {
            this.log('warn', 'Cannot add null element');
            return false;
        }
        
        if (type === 'word') {
            if (!element.classList.contains('js-word-animate')) {
                element.classList.add('js-word-animate');
            }
            
            this.processWordElement(element);
            this.setupWordScrollTrigger(element);
            this.state.wordElements.push(element);
        } else if (type === 'blur') {
            if (!element.classList.contains('js-scroll-blur-effect')) {
                element.classList.add('js-scroll-blur-effect');
            }
            
            this.processScrollBlurElement(element);
            this.setupScrollBlurTrigger(element);
            this.state.scrollBlurElements.push(element);
        }
        
        this.log('debug', `Added new ${type} element`);
        this.emit('elementAdded', { element, type });
        return true;
    }
    
    /**
     * Обновить все ScrollTrigger
     */
    refresh() {
        if (window.ScrollTrigger) {
            ScrollTrigger.refresh();
            this.log('debug', 'ScrollTrigger refreshed');
            this.emit('refreshed');
        }
    }
    
    /**
     * Получить текущее состояние компонента
     */
    getState() {
        return {
            isInitialized: this.isInitialized,
            isDestroyed: this.isDestroyed,
            id: this.id,
            wordElementsCount: this.state.wordElements.length,
            scrollBlurElementsCount: this.state.scrollBlurElements.length,
            processedElementsCount: this.state.processedElements.size,
            hasAnimationService: !!this.state.animationService,
            parallaxEnabled: this.options.parallaxEnabled
        };
    }
    
    /**
     * Получить все обработанные элементы
     */
    getElements() {
        return {
            wordElements: this.state.wordElements,
            scrollBlurElements: this.state.scrollBlurElements,
            allElements: [...this.state.wordElements, ...this.state.scrollBlurElements]
        };
    }
    
    /**
     * Включить/отключить параллакс эффекты
     */
    setParallaxEnabled(enabled) {
        this.options.parallaxEnabled = enabled;
        this.log('debug', `Parallax ${enabled ? 'enabled' : 'disabled'}`);
        this.emit('parallaxToggled', { enabled });
    }
    
    // =============================================================================
    // Cleanup (BaseComponent)
    // =============================================================================
    
    destroy() {
        // Очищаем все ScrollTrigger
        [...this.state.wordElements, ...this.state.scrollBlurElements].forEach(element => {
            if (element.scrollTriggers) {
                element.scrollTriggers.forEach(trigger => {
                    trigger.kill();
                });
                element.scrollTriggers = [];
            }
        });
        
        // Очищаем GSAP анимации для всех элементов
        this.state.wordElements.forEach(element => {
            if (element.wordElements) {
                gsap.killTweensOf(element.wordElements);
            }
        });
        
        this.state.scrollBlurElements.forEach(element => {
            if (element.blurWordElements) {
                gsap.killTweensOf(element.blurWordElements);
            }
        });
        
        // Очищаем состояние
        this.state = {
            wordElements: [],
            scrollBlurElements: [],
            processedElements: new Set(),
            animationService: null
        };
        
        // Очищаем элементы
        this.elements = {
            wordAnimateElements: [],
            scrollBlurElements: [],
            scrollBlurAdaptiveElements: []
        };
        
        // Вызвать родительский destroy
        super.destroy();
        
        this.log('info', 'WordAnimator component destroyed');
    }
}

// =============================================================================
// Глобальная доступность
// =============================================================================

if (typeof window !== 'undefined') {
    window.WordAnimator = WordAnimator;
}

// Функция инициализации для совместимости
function initWordAnimator() {
    return new WordAnimator(document.body);
}

if (typeof window !== 'undefined') {
    window.initWordAnimator = initWordAnimator;
}

// Экспорт для модульной системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordAnimator;
}
